/**
 * El rastro del caminante: el minijuego de `alg.fn.graph_as_picture`.
 *
 * El jugador viene del nodo 17 con una máquina que contesta de a un número por
 * vez. Acá ve **todos sus resultados juntos**, y el salto del nodo es que esa
 * línea no acompaña a la máquina: es la máquina, mirada de otra manera.
 *
 * Que las dos sean el mismo objeto no se dice, se muestra en tres lugares:
 *
 * - la altura del caminante y la gota que cae salen del **mismo dato**, el
 *   rastro que el modelo resolvió, y por eso la tinta cae en horizontal exacta
 *   desde el muñeco hasta la hoja: cruzar de superficie no cambia la altura;
 * - tocar una gota **prende la máquina del nodo 17**, que es la misma
 *   `PipeScene` de siempre: la posición entra por la boca, recorre el caño y del
 *   pico sale la altura de esa gota. La gota es el par y el caño es de dónde
 *   salió;
 * - el terreno viaja aparte del rastro aunque los dos digan lo mismo, así que
 *   aplanar el terreno deja el rastro intacto. Es la respuesta a "el rastro es
 *   una foto del terreno", sin una palabra.
 *
 * La escena es `WalkScene`, que estrena la mecánica `slope_walker` y está
 * escrita para los ocho nodos que la esperan; su porqué está en su cabecera. La
 * máquina del costado es `PipeScene` sin tocarla: recibe una configuración y ya.
 *
 * El avance no depende de que corra la animación: cada movimiento se confirma
 * con un temporizador de JavaScript y no con el callback de `withTiming`. Con el
 * panel del navegador oculto `requestAnimationFrame` se estrangula, y una
 * partida atada a un cuadro se congelaría sin que nada lo diga.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group, Path, RadialGradient, Skia, vec } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  GP_OPTION_SLOTS,
  NODE_GRAPH_PICTURE,
  TOTAL_GP_LEVELS,
  generateGraphPicture,
  gpHeightAt,
  gpMisconceptionFor,
  gpPoints,
  gpSame,
  gpTo,
  gpVerticalLineTest,
  type GpAsk,
  type GpCurve,
  type GpLevel,
  type GpPoint,
  type GpTrace,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  WalkScene,
  walkLayout,
  walkPairPath,
  walkPx,
  walkPy,
  type WalkConfig,
} from "../scenes/WalkScene.tsx";
import {
  PIPE_MACHINE_SLOTS,
  PIPE_TRAY_SLOTS,
  PipeScene,
  pipeLayout,
  type PipeConfig,
  type PipeSlot,
} from "../scenes/PipeScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";
import { chipFace, toggleFace } from "../ui/Kit.tsx";
import { ChipBodies } from "../ui/ChipBodies.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { GP_MSG } from "../lessons/graph-picture.ts";

/**
 * Qué paso de la guía vale como pista de Tomi en cada pregunta. La guía
 * acompaña sólo la primera ronda; en las rondas de la otra pregunta Tomi tiene
 * que callar el "mirá acá" antes que señalar un gesto que no corresponde.
 */
const HINT_STEP: Readonly<Record<GpAsk, string>> = {
  spot: "spot",
  continue: "pick",
  walk: "walk",
  read: "read",
  place: "drag",
  judge: "sweep",
};

const nonNull = <T,>(v: T | null | undefined): v is T => v !== null && v !== undefined;

/** El rectángulo que abarca a todos. */
function union(rs: readonly Rect[]): Rect | null {
  if (rs.length === 0) return null;
  const x0 = Math.min(...rs.map((r) => r.x));
  const y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + r.w));
  const y1 = Math.max(...rs.map((r) => r.y + r.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** La distancia de un punto a un tramo recto. */
function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const k = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(px - (ax + k * dx), py - (ay + k * dy));
}

/** Alto de la banda donde vive la máquina del nodo 17. */
const MACHINE_H = 128;
/** Radio del blanco donde entra una gota soltada sobre la hoja. */
const DROP_R = 60;
/** El rastro que no hay: `judge` no trae ninguno y la hoja queda sola. */
const VACIO: GpTrace = { id: "", from: 0, heights: [], breaks: [] };

export interface GraphPictureGameProps {
  readonly level: GpLevel;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function GraphPictureGame(props: GraphPictureGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: GraphPictureGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  const conLeccion = lesson?.lesson !== undefined;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateGraphPicture(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );

  const rastro = problem.traces[0] as GpTrace | undefined;

  /** Las posiciones cuya gota ya cayó. Caminar es llenar esta lista. */
  const [inked, setInked] = useState<readonly number[]>([]);
  /** La gota encendida: de ella salen los hilos y con ella corre la máquina. */
  const [lit, setLit] = useState<GpPoint | null>(null);
  /** La curva candidata elegida, o -1. */
  const [picked, setPicked] = useState(-1);
  const [solved, setSolved] = useState(false);
  const [machineOn, setMachineOn] = useState(false);
  /**
   * Lo que la línea de abajo dice al empezar la ronda. Con lección y una sola
   * pregunta, el cartel ya dice qué hacer y la línea queda para lo que pasó; en
   * los niveles que alternan, el cartel nombra las dos y la línea dice cuál toca.
   */
  const opening = useCallback(
    (a: GpAsk) => (conLeccion && level.asks.length === 1 ? "" : t(openingHint(a))),
    [conLeccion, level.asks.length],
  );

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: opening(problem.ask),
    tone: "dim",
  }));

  // --- Medidas ---------------------------------------------------------------

  // Con lección, el cartel de la guía se lleva su banda de arriba y el lienzo
  // se achica para que las respuestas y el botón de la máquina sigan a la vista.
  const sceneH = Math.max(conLeccion ? 340 : 360, Math.min(height * (conLeccion ? 0.54 : 0.62), 520));
  // La banda de la máquina y la del mostrador las decide el **nivel** y no lo
  // que pase en la ronda: si el alto cambiara al pedir la máquina o al cambiar
  // de pregunta, la hoja se movería debajo del dedo. Guardar la máquina la
  // apaga, no le devuelve el espacio.
  const machineH = level.machine === "hidden" ? 0 : MACHINE_H;
  const trayH = level.asks.includes("read") || level.asks.includes("place") ? 58 : 0;
  const walkH = sceneH - machineH - trayH;

  // --- La hoja ---------------------------------------------------------------

  /**
   * Qué pedazo de plano se ve. Sale del rastro y de lo que el nivel habilita, no
   * de un número fijo: con la hoja acotada al rincón, una altura negativa
   * quedaría fuera de la ventana y la gota caería donde no se ve.
   */
  const window0 = useMemo(() => {
    const cuadrantes = level.sheet === "quadrants";
    let x0 = level.params.xRange[0];
    let x1 = level.params.xRange[1];
    let y0 = cuadrantes ? level.params.yRange[0] : 0;
    let y1 = level.params.yRange[1];
    for (const punto of problem.curve?.points ?? []) {
      x0 = Math.min(x0, punto.x);
      x1 = Math.max(x1, punto.x);
      y0 = Math.min(y0, punto.y);
      y1 = Math.max(y1, punto.y);
    }
    for (const c of problem.continuations) {
      for (const punto of c.points) {
        y0 = Math.min(y0, punto.y);
        y1 = Math.max(y1, punto.y);
      }
    }
    return { x0: x0 - 1, x1: x1 + 1, y0: y0 - 1, y1: y1 + 1 };
  }, [level.sheet, level.params, problem.curve, problem.continuations]);

  /**
   * Los rastros que se dibujan. Caminando, el primero es solo lo que ya se
   * caminó: la hoja se llena con el dedo y no viene llena. Los demás se dibujan
   * enteros, porque no son de la máquina del jugador.
   */
  const traces = useMemo<readonly GpTrace[]>(() => {
    if (!rastro) return [];
    // Caminando, la hoja tiene lo que el jugador ya recorrió. Eligiendo la
    // continuación, lo que el caminante alcanzó a dibujar antes de detenerse: el
    // resto es justamente lo que se pregunta y no se puede regalar.
    const visible =
      problem.ask === "walk"
        ? (x: number) => inked.includes(x)
        : problem.ask === "continue"
          ? (x: number) => x <= problem.drawnTo
          : null;
    if (!visible) return problem.traces;
    return [
      {
        ...rastro,
        heights: rastro.heights.map((h, i) => (visible(rastro.from + i) ? h : null)),
        // Un tramo se une solo si sus dos gotas ya cayeron; el corte lo resuelve
        // `gpJoins` al ver el hueco, así que los saltos del rastro siguen ahí.
        breaks: rastro.breaks,
      },
      ...problem.traces.slice(1),
    ];
  }, [rastro, problem.ask, problem.traces, problem.drawnTo, inked]);

  const walkCfg = useMemo<WalkConfig>(
    () => ({
      window: window0,
      quadrants: level.sheet === "quadrants",
      ground: level.terrain,
      terrain: level.terrain === "hidden" ? null : problem.terrain,
      traces,
      mainTrace: 0,
      drops: true,
      line: problem.ask !== "place" || solved,
      walker:
        problem.ask === "judge" || problem.ask === "read"
          ? "none"
          : level.terrain === "hidden"
            ? "sheet"
            : "ground",
      // La tinta cae mientras el jugador camina; en las demás preguntas el
      // caminante ya volvió y la hoja está escrita.
      ink: problem.ask === "walk" && !solved,
      lit,
      threads: level.threads,
      // El par escrito no puede aparecer antes de que se lo pregunte: en la
      // ronda que pide leerlo, la etiqueta sería la respuesta dibujada.
      label: level.pairs && (problem.ask !== "read" || solved),
      marked: problem.ask === "spot" && !solved ? problem.options : [],
      // La posición preguntada, señalada en la regla: en el nivel 1 la regla no
      // tiene números y un numeral suelto no decía dónde buscar.
      mark: problem.ask === "spot" && !solved ? problem.asked : null,
      options: problem.continuations,
      curve: problem.curve,
      verticalLine: problem.ask === "judge",
      // El escalón es de los nodos 19 y 26; este todavía no lo enciende.
      step: null,
      diagonal: false,
      asymptote: null,
      skin: "hill_walk",
      // Las reglas con marcas nacen con los hilos y ya no se van: en la capa
      // formal no hay hilos y los numerales tienen que seguir estando.
      numerals: level.threads || level.pairs,
      axisLabels: level.axisLabels,
      // La `f` viene del nodo 17: la leyenda es el nombre de la misma máquina.
      legend: level.axisLabels ? "y = f(x)" : "",
    }),
    [window0, level, problem, traces, lit, solved],
  );

  const wl = useMemo(() => walkLayout(walkCfg, width, walkH), [walkCfg, width, walkH]);

  // --- La máquina del nodo 17 ------------------------------------------------

  /**
   * La tubería del costado, con la posición encendida entrando por la boca y su
   * altura saliendo del pico. No se calcula nada acá: los dos números salen del
   * rastro, que es el mismo dato que dibuja la gota.
   */
  const pipeCfg = useMemo<PipeConfig>(() => {
    const entrada = lit?.x ?? problem.asked;
    const salida = lit?.y ?? 0;
    const item = (v: number) => ({ value: v, size: 1, kind: "ball" as const, label: "" });
    return {
      lanes: [
        {
          id: "f",
          machines: [
            { id: "m0", kind: "opaque" as const, value: 0, label: "f", inverted: false, opaque: true },
          ],
          input: item(entrada),
          stages: [item(salida)],
          output: item(salida),
          target: null,
          glow: lit !== null,
        },
      ],
      skin: "pipes",
      direction: "forward",
      numerals: true,
      counter: true,
      table: [],
      tray: [],
      slots: 0,
      reorderable: false,
      box: false,
      // La máquina llega plegada y se pide con un toque, como en el documento.
      onDemand: true,
    };
  }, [lit, problem.asked]);

  const machineW = Math.min(width * 0.62, 420);
  const pl = useMemo(
    () => pipeLayout(pipeCfg, machineW, Math.max(machineH, 1)),
    [pipeCfg, machineW, machineH],
  );

  // --- Lo que se anima -------------------------------------------------------

  const at = useSharedValue(level.params.xRange[0]);
  const walkerY = useSharedValue(0);
  const sweep = useSharedValue(0);
  const hint = useSharedValue(1);
  const demo = useSharedValue(0);
  const appear = useSharedValue(1);
  const unfold = useSharedValue(0);
  const flow = useSharedValue(0);
  /**
   * Un cero compartido. `PipeScene` pide agujas que este nodo no mueve, y una
   * sola apagada las cubre a todas sin montar diez valores muertos.
   */
  const quieto = useSharedValue(0);
  const dragIdx = useSharedValue(-1);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  /**
   * Desde qué posición arrancó el arrastre. Va en una aguja y no en una variable
   * de la clausura porque el gesto corre en el hilo de la interfaz y una
   * variable capturada allá es una copia: se escribiría y nadie la leería.
   */
  const dragFrom = useSharedValue(0);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Un temporizador que se cancela solo al cambiar de ronda o de pantalla. */
  const luego = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  // La latencia se mide desde que empieza el juego, no desde la tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [playing]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa. Por
  // referencia y no por dependencia: el callback de un gesto puede estar un
  // render atrasado (trampa 8).
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);
  const preferRef = useRef(lesson?.preferHint);
  preferRef.current = lesson?.preferHint;
  const coachIds = useRef<readonly string[]>([]);
  coachIds.current = lesson?.lesson?.coach.map((s) => s.id) ?? [];
  /** Si en esta ronda ya se pasó la recta vertical: decidir sin pasarla es adivinar. */
  const swept = useRef(false);

  /**
   * Las alturas del rastro, ya rellenadas donde no hay ninguna: el caminante no
   * puede estar en ningún lado y sobre un hueco se queda a la altura anterior.
   * Es un arreglo de números y por eso se puede leer desde un worklet.
   */
  const alturas = useMemo(() => {
    if (!rastro) return [0];
    const out: number[] = [];
    let ultima = 0;
    for (const h of rastro.heights) {
      if (h !== null && h !== undefined) ultima = h;
      out.push(ultima);
    }
    return out;
  }, [rastro]);

  const desde = rastro?.from ?? 0;
  const hasta = rastro ? gpTo(rastro) : 0;

  // La altura del caminante se deriva de su posición y del mismo rastro que
  // dibuja la gota: no hay dos maneras de saber a qué altura está.
  useEffect(() => {
    walkerY.value = alturas[0] ?? 0;
  }, [alturas, walkerY]);

  /**
   * Encender una gota: se ilumina, sus hilos bajan a las reglas y **la máquina
   * del nodo 17 la recorre**. Es el gesto que dice que la gráfica y la máquina
   * son el mismo objeto: la posición entra por la boca y la altura sale del
   * pico, y son los dos números de la gota.
   */
  const light = useCallback(
    (punto: GpPoint) => {
      setLit(punto);
      flow.value = withSequence(
        withTiming(0, { duration: 1 }),
        withTiming(1, { duration: theme.motion.reveal }),
      );
    },
    [flow],
  );

  /** Dónde estaba el caminante antes del último movimiento. */
  const lastPos = useRef(desde);

  /**
   * Mover al caminante deja una gota **en cada posición que atravesó**, no solo
   * en la que quedó. Es lo que dice el documento, "con cada paso cae una gota", y
   * además es lo único robusto: un arrastre rápido puede saltearse posiciones
   * enteras entre dos eventos, y la hoja quedaría con agujeros que el jugador no
   * hizo.
   */
  const moveWalker = useCallback(
    (x: number) => {
      const limitado = Math.round(Math.max(desde, Math.min(hasta, x)));
      const previo = lastPos.current;
      lastPos.current = limitado;
      at.value = limitado;
      walkerY.value = alturas[limitado - desde] ?? 0;
      if (!rastro) return;
      const lo = Math.min(previo, limitado);
      const hi = Math.max(previo, limitado);
      setInked((previas) => {
        const juntas = new Set(previas);
        for (let i = lo; i <= hi; i++) {
          if (gpHeightAt(rastro, i) !== null) juntas.add(i);
        }
        return juntas.size === previas.length ? previas : [...juntas];
      });
      // Cada paso enciende su gota y hace correr la máquina con esa posición: el
      // caminante, la tinta y el caño están diciendo el mismo par.
      if (limitado === previo) return;
      say("stepped");
      const altura = gpHeightAt(rastro, limitado);
      if (altura !== null) light({ x: limitado, y: altura });
    },
    [desde, hasta, alturas, at, walkerY, rastro, light, say],
  );

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setInked(problem.ask === "walk" ? [] : gpPoints(rastro ?? VACIO).map((p) => p.x));
    // En `read` la gota que hay que leer llega encendida, con sus dos hilos
    // bajando a las reglas: lo que se pregunta es cómo se escribe, no cuál es.
    setLit(problem.ask === "read" ? problem.target : null);
    setPicked(-1);
    setSolved(false);
    setMachineOn(false);
    setMessage({ text: opening(problem.ask), tone: "dim" });
    swept.current = false;
    // Qué paso de la guía muestra Tomi como pista en esta ronda: el gesto de
    // esta pregunta, o ninguno si la guía del nivel es de la otra.
    const pista = HINT_STEP[problem.ask];
    preferRef.current?.(coachIds.current.includes(pista) ? pista : "");
    // Dónde arranca el caminante. Caminando, en el principio; detenido a mitad
    // de camino, donde dejó de dibujar; y en todo lo demás al final del
    // recorrido, porque ya caminó: pararlo sobre la posición preguntada
    // señalaría la gota que el jugador tiene que encontrar.
    at.value =
      problem.ask === "walk" ? desde : problem.ask === "continue" ? problem.drawnTo : hasta;
    lastPos.current = Math.round(at.value);
    walkerY.value = alturas[Math.max(0, Math.round(at.value) - desde)] ?? 0;
    sweep.value = window0.x0 + 1;
    unfold.value = 0;
    flow.value = 0;
    dragFrom.value = desde;
    // El latido de la demostración: la mano fantasma arrastra al caminante unos
    // pasos y las gotas caen a la hoja. Con guía, la luz de Lumi es la
    // demostración: dos manos a la vez señalarían dos cosas distintas.
    if (guided) {
      hint.value = 0;
      demo.value = 0;
    } else {
      hint.value = 1;
      demo.value = withRepeat(
        withSequence(withTiming(1, { duration: 1600 }), withTiming(0, { duration: 1 })),
        -1,
        false,
      );
    }
    return () => {
      cancelAnimation(demo);
      for (const id of timers.current) clearTimeout(id);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_GRAPH_PICTURE, layer: level.layer });
  }, [level.layer, onEvent]);

  // --- Movimientos -----------------------------------------------------------

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * El campo `misconception` solo viaja cuando el catálogo de L tiene una
   * entrada que apunta a este nodo: el modelo ya lo resolvió y acá no se
   * inventa ninguno.
   */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const ahora = Date.now();
      const latency = ahora - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at: ahora,
          node: NODE_GRAPH_PICTURE,
          level: level.n,
          evidence,
          correct,
          latency,
          ...(misconception ? { misconception } : {}),
        });
      }
    },
    [level.evidence, level.n, onEvent],
  );

  const quiet = useCallback(() => {
    cancelAnimation(demo);
    demo.value = withTiming(0, { duration: 260 });
    hint.value = withTiming(0, { duration: 260 });
  }, [demo, hint]);

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_GRAPH_PICTURE, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
  }, [round, level.rounds, level.n, onEvent, onLevelDone]);

  /**
   * Cerrar la ronda, salvo que la guía esté explicando lo que acaba de pasar:
   * entonces queda pendiente y se cierra cuando el jugador dice "entendido".
   */
  const holding = useRef(false);
  holding.current = step?.holds === true;
  const pending = useRef(false);
  const advance = useCallback(() => {
    if (holding.current) {
      pending.current = true;
      return;
    }
    nextRound();
  }, [nextRound]);
  useEffect(() => {
    if (step?.holds === true || !pending.current) return;
    pending.current = false;
    nextRound();
  }, [step, nextRound]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      luego(advance, 2100);
    },
    [advance, quiet, luego],
  );

  /** Tocar una gota marcada: es la que corresponde a la posición preguntada. */
  const spot = useCallback(
    (index: number) => {
      if (solved) return;
      quiet();
      const elegida = problem.options[index];
      const objetivo = problem.target;
      if (!elegida || !objetivo) return;
      light(elegida);
      const ok = gpSame(elegida, objetivo);
      // Tocar una gota no escribe ningún par: ninguna entrada del catálogo
      // apunta a este nodo para este movimiento, así que va sin campo.
      attempt(ok);
      if (ok) {
        say("spotted");
        succeed(t("gp.hint.spotted"));
        return;
      }
      setMessage({ text: t("gp.hint.otherDrop"), tone: "warn" });
    },
    [solved, quiet, problem.options, problem.target, light, attempt, succeed, say],
  );

  /** Elegir la continuación: la que sigue el terreno es la única que sirve. */
  const chooseCurve = useCallback(
    (index: number) => {
      if (solved) return;
      quiet();
      setPicked(index);
      const ok = index === problem.correct;
      attempt(ok);
      if (ok) {
        say("picked");
        succeed(t("gp.hint.continued"));
        return;
      }
      // La curva que vuelve sobre sí misma tiene su propio empujón: no es una
      // continuación equivocada, es una que no puede venir de ninguna máquina.
      const curva = problem.continuations[index];
      const vuelve = curva ? tieneDosAlturas(curva) : false;
      setMessage({ text: t(vuelve ? "gp.hint.twoHeights" : "gp.hint.otherCurve"), tone: "warn" });
    },
    [solved, quiet, problem.correct, problem.continuations, attempt, succeed, say],
  );

  /** Leer el par de la gota encendida entre los pares escritos. */
  const readPair = useCallback(
    (index: number) => {
      if (solved) return;
      quiet();
      const elegido = problem.options[index];
      const objetivo = problem.target;
      if (!elegido || !objetivo) return;
      const mal = gpMisconceptionFor(level, elegido, objetivo);
      const ok = gpSame(elegido, objetivo);
      attempt(ok, mal);
      if (ok) {
        say("read");
        light(objetivo);
        succeed(t("gp.hint.readIt"));
        return;
      }
      // La repetición del error corre sobre la mecánica del nodo, que es la que
      // el catálogo declara: el caminante va a la posición que el jugador
      // eligió y se ve a qué altura quedó. Después la gota preguntada vuelve a
      // encenderse: sin eso, tras un par equivocado ya no se sabía cuál era.
      light(elegido);
      luego(() => {
        if (!doneRef.current) light(objetivo);
      }, 1500);
      setMessage({ text: t(mal ? "gp.hint.swapped" : "gp.hint.otherPair"), tone: "warn" });
    },
    [solved, quiet, problem.options, problem.target, level, attempt, succeed, light, luego, say],
  );

  /** Soltar una gota en la hoja: el par que faltaba, puesto a mano. */
  const place = useCallback(
    (punto: GpPoint) => {
      if (solved) return;
      quiet();
      const objetivo = problem.target;
      if (!objetivo) return;
      const mal = gpMisconceptionFor(level, punto, objetivo);
      const ok = gpSame(punto, objetivo);
      attempt(ok, mal);
      light(punto);
      if (ok) {
        say("placed");
        succeed(t("gp.hint.placed"));
        return;
      }
      // La gota soltada a la altura equivocada cae por su peso hasta la
      // correcta: la consecuencia es física y nadie dice "incorrecto".
      luego(() => light(objetivo), 700);
      setMessage({
        text: t(mal ? "gp.hint.swapped" : punto.x === objetivo.x ? "gp.hint.itFell" : "gp.hint.otherPlace"),
        tone: "warn",
      });
    },
    [solved, quiet, problem.target, level, attempt, succeed, light, luego, say],
  );

  /** Decir si la curva puede ser rastro de una máquina. */
  const judge = useCallback(
    (esGrafica: boolean) => {
      if (solved) return;
      quiet();
      const ok = esGrafica === problem.isGraph;
      attempt(ok);
      if (ok) {
        say("judged");
        succeed(t(problem.isGraph ? "gp.hint.isGraph" : `gp.hint.why.${problem.violation ?? "two_heights"}`));
        return;
      }
      setMessage({ text: t(swept.current ? "gp.hint.sweepIt" : GP_MSG.sweepFirst), tone: "warn" });
    },
    [solved, quiet, problem.isGraph, problem.violation, attempt, succeed, say],
  );

  /** Caminar hasta cubrir el rastro entero: la hoja no puede quedar con huecos. */
  useEffect(() => {
    if (problem.ask !== "walk" || solved || doneRef.current || !rastro) return;
    const faltan = gpPoints(rastro).filter((p) => !inked.includes(p.x));
    if (inked.length > 0 && faltan.length === 0) {
      say("covered");
      attempt(true);
      succeed(t("gp.hint.covered"));
    }
  }, [inked, problem.ask, solved, rastro, attempt, succeed, say]);

  // --- Tocar la hoja ---------------------------------------------------------

  /** De píxeles del lienzo a la posición y la altura más cercanas de la hoja. */
  const lattice = useCallback(
    (x: number, y: number): GpPoint => ({
      x: Math.round((x - wl.sheet.cx) / wl.sheet.ux),
      y: Math.round((wl.sheet.cy - y) / wl.sheet.uy),
    }),
    [wl.sheet],
  );

  /**
   * Tocar la hoja. Eligiendo la gota, gana la gota marcada más cercana al dedo:
   * antes cada gota tenía un asa de 44 px y en un teléfono las de posiciones
   * vecinas se pisaban, así que el toque podía caer en la de al lado. Eligiendo
   * la continuación, gana la línea más cercana, medida contra sus tramos y no
   * contra sus vértices: un toque en el medio de un tramo largo quedaba sin
   * dueño. Cerca del punto donde las tres se separan el toque es ambiguo, y lo
   * dice en vez de elegir una al azar.
   */
  const touchSheet = useCallback(
    (x: number, y: number) => {
      if (solved) return;
      if (problem.ask === "spot") {
        let mejor = -1;
        let dist = Math.max(28, Math.min(wl.sheet.ux, wl.sheet.uy) * 0.8);
        problem.options.forEach((punto, i) => {
          const d = Math.hypot(x - walkPx(wl.sheet, punto.x), y - walkPy(wl.sheet, punto.y));
          if (d < dist) {
            dist = d;
            mejor = i;
          }
        });
        if (mejor < 0) {
          setMessage({ text: t(GP_MSG.tapADrop), tone: "dim" });
          return;
        }
        spot(mejor);
        return;
      }
      if (problem.ask !== "continue") return;
      const distancias = problem.continuations.map((curva) => {
        let d = Infinity;
        for (let i = 1; i < curva.points.length; i++) {
          const a = curva.points[i - 1] as GpPoint;
          const b = curva.points[i] as GpPoint;
          d = Math.min(
            d,
            distToSegment(x, y, walkPx(wl.sheet, a.x), walkPy(wl.sheet, a.y), walkPx(wl.sheet, b.x), walkPy(wl.sheet, b.y)),
          );
        }
        return d;
      });
      const orden = distancias.map((d, i) => ({ d, i })).sort((a, b) => a.d - b.d);
      const primera = orden[0];
      const segunda = orden[1];
      const ambiguo = primera !== undefined && segunda !== undefined && segunda.d - primera.d < 5;
      if (!primera || primera.d > DROP_R || ambiguo) {
        setMessage({ text: t("gp.hint.pickCurve"), tone: "dim" });
        return;
      }
      chooseCurve(primera.i);
    },
    [problem.ask, problem.continuations, problem.options, solved, wl.sheet, chooseCurve, spot],
  );

  const dropInk = useCallback(
    (_index: number, x: number, y: number) => {
      const punto = lattice(x, y);
      // Soltada fuera de la hoja no es un intento: vuelve al borde, y se dice.
      const w = window0;
      if (punto.x < w.x0 || punto.x > w.x1 || punto.y < w.y0 || punto.y > w.y1) {
        setMessage({ text: t(GP_MSG.dropBack), tone: "dim" });
        return;
      }
      place(punto);
    },
    [place, lattice, window0],
  );

  const walkTo = useCallback((x: number) => moveWalker(x), [moveWalker]);

  /**
   * Lo que el gesto llama viaja en una referencia estable: si el objeto del
   * `Gesture` cambiara de identidad entre renders, el detector tendría que
   * reengancharlo y el arrastre se perdería a mitad de camino.
   */
  const acciones = useRef({ spot, readPair, touchSheet, dropInk, walkTo, judge });
  acciones.current = { spot, readPair, touchSheet, dropInk, walkTo, judge };

  const alTocarPar = useCallback((i: number) => acciones.current.readPair(i), []);
  const alSoltarGota = useCallback(
    (i: number, x: number, y: number) => acciones.current.dropInk(i, x, y),
    [],
  );
  const alCaminar = useCallback((x: number) => acciones.current.walkTo(x), []);
  const alTocarHoja = useCallback(
    (_i: number, x: number, y: number) => acciones.current.touchSheet(x, y),
    [],
  );
  /** La recta vertical se movió: la guía del nivel 8 lo espera. */
  const alBarrer = useCallback(() => {
    swept.current = true;
    say("swept");
  }, [say]);

  // --- Lo que la actividad dibuja por su cuenta ------------------------------

  /**
   * Las fichas de pares del mostrador, con la misma coma que la etiqueta. En un
   * teléfono el paso entre fichas (78 px) era menor que la ficha (84 px) y dos
   * vecinas se pisaban, cuerpo y asa: la ficha se achica con el paso.
   */
  const pairPaso = Math.min(width / (GP_OPTION_SLOTS + 1), 110);
  const chipW = Math.min(84, pairPaso - 8);
  const pairSpots = useMemo(() => {
    return Array.from({ length: GP_OPTION_SLOTS }, (_, i) => ({
      x: width / 2 + (i - (GP_OPTION_SLOTS - 1) / 2) * pairPaso,
      y: sceneH - 26,
    }));
  }, [width, sceneH, pairPaso]);

  const conPares = problem.ask === "read" && !solved;

  const pairGeom = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const texto = Skia.Path.Make();
    if (!conPares) return { cuerpo, texto };
    problem.options.forEach((par, i) => {
      const s = pairSpots[i];
      if (!s) return;
      cuerpo.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - chipW / 2, s.y - 18, chipW, 36), 8, 8));
      texto.addPath(walkPairPath(par, s.x, s.y, Math.min(18, chipW / 4.4)));
    });
    return { cuerpo, texto };
  }, [conPares, problem.options, pairSpots, chipW]);

  /**
   * La gota que espera abajo para ser arrastrada a la hoja. Iba pegada al
   * rincón de abajo a la izquierda, que es donde vive Tomi: en un teléfono él
   * la tapaba y se llevaba el toque. Ahora espera a la izquierda del centro, en
   * la banda de abajo, con su par escrito a la derecha.
   */
  const inkSpot = useMemo(
    () => ({ x: Math.max(110, width / 2 - 70), y: sceneH - 32 }),
    [sceneH, width],
  );

  const conGota = problem.ask === "place" && !solved;

  /**
   * La gota del borde es la misma gota que el caminante deja en la hoja: una
   * pieza con volumen, luz arriba a la izquierda, brillo y sombra. Un disco
   * plano del acento se leía como un botón.
   */
  const inkGeom = useMemo(() => {
    const body = Skia.Path.Make();
    const shine = Skia.Path.Make();
    const shadow = Skia.Path.Make();
    if (!conGota) return { body, shine, shadow };
    body.addCircle(inkSpot.x, inkSpot.y, 11);
    shine.addOval(Skia.XYWHRect(inkSpot.x - 7, inkSpot.y - 7.5, 6, 4));
    shadow.addOval(Skia.XYWHRect(inkSpot.x - 10, inkSpot.y + 8, 20, 6));
    return { body, shine, shadow };
  }, [conGota, inkSpot]);

  /**
   * La gota sigue al dedo y crece un 30 % mientras la lleva. Antes se quedaba
   * quieta en el borde durante el arrastre, y soltarla era soltar algo que no
   * se veía: el jugador no sabía dónde iba a caer.
   */
  const inkT = useDerivedValue(() => {
    const llevada = dragIdx.value >= 0;
    const s = llevada ? 1.3 : 1;
    return [
      { translateX: (llevada ? dragX.value : 0) + inkSpot.x * (1 - s) },
      { translateY: (llevada ? dragY.value : 0) + inkSpot.y * (1 - s) },
      { scale: s },
    ];
  }, [inkSpot]);

  /**
   * Lo que se pregunta, escrito: el par que hay que ubicar junto a la gota del
   * borde. La posición de `spot` ya no se escribe: la señala el triángulo de la
   * regla, que se lee aunque la regla no tenga números.
   */
  const askedGeom = useMemo(() => {
    if (problem.ask === "place" && problem.target) {
      return walkPairPath(problem.target, inkSpot.x + 78, inkSpot.y, 20);
    }
    return Skia.Path.Make();
  }, [problem.ask, problem.target, inkSpot]);

  const trayPieces = useMemo<readonly PipeSlot[]>(
    () => Array.from({ length: PIPE_TRAY_SLOTS }, () => ({ dx: quieto, dy: quieto, alive: quieto })),
    [quieto],
  );
  const pipePieces = useMemo<readonly PipeSlot[]>(
    () => Array.from({ length: PIPE_MACHINE_SLOTS }, () => ({ dx: quieto, dy: quieto, alive: quieto })),
    [quieto],
  );

  const toggleMachine = useCallback(() => {
    setMachineOn((on) => {
      unfold.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [unfold]);

  const preguntaCurva = problem.ask === "judge" && !solved;
  /**
   * Hasta dónde escucha la pasarela. Mientras haya terreno, hasta donde termina
   * el terreno: el caminante camina ahí y un dedo apoyado sobre la hoja no tiene
   * por qué moverlo. Eligiendo la continuación, en cambio, lo que se toca es la
   * hoja entera.
   */
  /** Las rondas que se contestan tocando la hoja: la gota marcada o la línea. */
  const tocaHoja = problem.ask === "continue" || problem.ask === "spot";
  const paseoW = tocaHoja || !wl.ground ? width : walkPx(wl.sheet, window0.x0) - 8;
  const conCaminante = problem.ask === "walk" || tocaHoja;

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda, con la
   * misma geometría que dibuja la escena: el lugar marcado y su columna, el
   * caminante y hasta dónde llevarlo, la gota encendida y sus hilos, el hueco
   * donde va la gota. La hoja se dibuja corrida hacia abajo por la banda de la
   * máquina, y el foco también. La pista de Tomi reusa los mismos pasos: señala
   * lo mismo, pero no frena la ronda.
   */
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown || shown.id === "recall") return null;
    const id = shown.id;
    const S = wl.sheet;
    const px = (x: number): number => walkPx(S, x);
    const py = (y: number): number => walkPy(S, y) + machineH;
    const around = (x: number, y: number, m: number): Rect => ({ x: x - m, y: y - m, w: m * 2, h: m * 2 });
    const caja = (pts: readonly GpPoint[], m: number): Rect | null =>
      union(pts.map((p) => around(px(p.x), py(p.y), m)));
    const w = window0;
    const ejeY = Math.min(Math.max(0, w.y0), w.y1);
    const ejeX = Math.min(Math.max(0, w.x0), w.x1);
    const hoja: Rect = {
      x: px(w.x0) - 16,
      y: py(w.y1) - 12,
      w: px(w.x1) - px(w.x0) + 28,
      h: py(w.y0) - py(w.y1) + 24,
    };
    // El caminante pisa el terreno mientras está, y la hoja cuando ya no.
    const P = wl.ground ?? S;
    const gx = (x: number): number => P.cx + x * P.ux;
    const gy = (y: number): number => P.cy - y * P.uy + machineH;

    switch (problem.ask) {
      case "spot": {
        const t0 = problem.target;
        if (id === "reveal" && t0) return { rings: [around(px(t0.x), py(t0.y), 18)] };
        const marca = around(px(problem.asked), py(ejeY) + 16, 18);
        if (id === "look") return { rings: [marca, caja(problem.options, 16)].filter(nonNull) };
        // La columna que sube derecho desde la marca: la estrategia, no la gota.
        const arriba = py(w.y1) - 8;
        return { rings: [{ x: px(problem.asked) - 18, y: arriba, w: 36, h: py(ejeY) + 36 - arriba }] };
      }
      case "continue": {
        const curvas = caja(problem.continuations.flatMap((c) => c.points), 12);
        if (id === "reveal") {
          const c = problem.continuations[problem.correct];
          return { rings: [c ? caja(c.points, 12) : curvas].filter(nonNull) };
        }
        if (id === "look" && wl.ground) {
          // El terreno que le queda por delante al caminante.
          const x0 = gx(problem.drawnTo);
          const x1 = gx(hasta);
          const y0 = gy(w.y1);
          const y1 = gy(w.y0);
          return { rings: [{ x: x0 - 10, y: y0 - 6, w: x1 - x0 + 20, h: y1 - y0 + 12 }, curvas].filter(nonNull) };
        }
        return { rings: [curvas].filter(nonNull) };
      }
      case "walk": {
        const pos = lastPos.current;
        const alto = (x: number): number => alturas[Math.max(0, x - desde)] ?? 0;
        const quien: Pt = { x: gx(pos), y: gy(alto(pos)) - 14 };
        const aca = around(quien.x, quien.y, 26);
        if (id === "look") return { rings: [aca, hoja] };
        if (id === "reveal") return { rings: [hoja] };
        // Llevarlo un par de pasos para empezar, o hasta la gota que falta más lejos.
        const faltan = rastro ? gpPoints(rastro).filter((p) => !inked.includes(p.x)).map((p) => p.x) : [];
        const destino = id === "cover" && faltan.length > 0 ? Math.max(...faltan) : Math.min(hasta, pos + 2);
        const hacia: Pt = { x: gx(destino), y: gy(alto(destino)) - 14 };
        return { rings: [aca], drag: { from: quien, to: hacia } };
      }
      case "read": {
        const t0 = problem.target;
        if (!t0) return null;
        const gota = around(px(t0.x), py(t0.y), 18);
        if (id === "look") {
          // Los extremos de los hilos, salvo el que cae encima de la gota: una
          // gota sobre un eje tiene ese hilo de largo cero, y tres anillos
          // apilados en el mismo punto no señalan nada.
          const gx0 = px(t0.x);
          const gy0 = py(t0.y);
          const extremos = [around(gx0, py(ejeY), 14), around(px(ejeX), gy0, 14)].filter(
            (r) => Math.hypot(r.x + r.w / 2 - gx0, r.y + r.h / 2 - gy0) > 22,
          );
          return { rings: [gota, ...extremos] };
        }
        if (id === "reveal") return { rings: [gota] };
        const fila = union(
          pairSpots
            .slice(0, problem.options.length)
            .map((s) => ({ x: s.x - chipW / 2 - 5, y: s.y - 23, w: chipW + 10, h: 46 })),
        );
        return { rings: [fila, gota].filter(nonNull) };
      }
      case "place": {
        const t0 = problem.target;
        if (!t0) return null;
        const gota = around(inkSpot.x, inkSpot.y, 22);
        const destino: Pt = { x: px(t0.x), y: py(t0.y) };
        if (id === "look") {
          return { rings: [union([gota, { x: inkSpot.x + 26, y: inkSpot.y - 18, w: 104, h: 36 }])].filter(nonNull) };
        }
        if (id === "reveal") return { rings: [around(destino.x, destino.y, 18)] };
        return { rings: [gota, around(destino.x, destino.y, 18)], drag: { from: inkSpot, to: destino } };
      }
      case "judge": {
        const c = problem.curve;
        const curva = c ? caja(c.points, 14) : hoja;
        if (id === "sweep") {
          const medio = (py(w.y1) + py(w.y0)) / 2;
          return {
            rings: [curva].filter(nonNull),
            drag: { from: { x: px(w.x0) + 8, y: medio }, to: { x: px(w.x1) - 8, y: medio } },
          };
        }
        if (id === "reveal" && c && !problem.isGraph) {
          // El lugar donde la recta corta dos veces: ahí hay dos alturas.
          const donde = gpVerticalLineTest(c).at;
          if (donde !== null) {
            return { rings: [{ x: px(donde) - 16, y: py(w.y1) - 8, w: 32, h: py(w.y0) - py(w.y1) + 16 }] };
          }
        }
        return { rings: [curva].filter(nonNull) };
      }
      default:
        return null;
    }
  }, [shown, problem, wl, machineH, window0, inked, alturas, desde, hasta, rastro, pairSpots, chipW, inkSpot]);

  return (
    <View style={styles.root}>

      <Header
        title={`${t(`node.${NODE_GRAPH_PICTURE}.name`)} · nivel ${level.n} de ${TOTAL_GP_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!lesson?.lesson}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: la hoja, el terreno y la máquina viven
            adentro del mismo. */}
        <Canvas style={{ width, height: sceneH }}>
          {/* La máquina del nodo 17, plegada hasta que se la pide. */}
          {level.machine !== "hidden" ? (
            <Group transform={[{ translateX: width - machineW }]}>
              <PipeScene
                config={pipeCfg}
                layout={pl}
                flow={flow}
                lane={0}
                jam={quieto}
                hint={quieto}
                demo={quieto}
                unfold={unfold}
                appear={appear}
                pieces={pipePieces}
                trayPieces={trayPieces}
                picked={-1}
              />
            </Group>
          ) : null}

          <Group transform={[{ translateY: machineH }]}>
            <WalkScene
              config={walkCfg}
              layout={wl}
              at={at}
              height={walkerY}
              sweep={sweep}
              hint={hint}
              demo={demo}
              picked={picked}
              appear={appear}
            />
          </Group>

          {/* El mostrador de pares, la gota del borde y lo que se pregunta. */}
          <ChipBodies path={pairGeom.cuerpo} />
          <Path path={pairGeom.texto} color={theme.color.ink} />
          <Group transform={inkT}>
            <Path path={inkGeom.shadow} color="rgba(0, 0, 0, 0.35)" />
            <Path path={inkGeom.body}>
              <RadialGradient
                c={vec(inkSpot.x - 3.5, inkSpot.y - 4)}
                r={18}
                colors={["#b8e2ff", theme.color.accent, "#1f7fcf"]}
              />
            </Path>
            <Path path={inkGeom.shine} color="rgba(255, 255, 255, 0.6)" />
          </Group>
          {/* Lo que se pregunta cae sobre el paisaje: un borde oscuro lo despega. */}
          <Path path={askedGeom} color="rgba(9, 17, 29, 0.9)" style="stroke" strokeWidth={3} strokeJoin="round" />
          <Path path={askedGeom} color={theme.color.ink} />
        </Canvas>

        {/* Las asas invisibles: el dibujo es Skia y el gesto es la vista.
            Siempre las mismas, y las que esta ronda no usa quedan sordas: un asa
            deshabilitada tiene que quedar montada, y sin recibir toques, o se
            come los del lienzo. */}
        <Walkway
          x={0}
          y={machineH}
          w={paseoW}
          h={walkH}
          enabled={conCaminante && !solved}
          from={desde}
          to={hasta}
          plane={wl.sheet}
          ground={wl.ground}
          onWalk={alCaminar}
          onTap={alTocarHoja}
          offsetY={machineH}
          tapping={tocaHoja}
          startAt={dragFrom}
        />

        {/* Las gotas marcadas ya no tienen asa propia: las contesta la
            pasarela, que busca la más cercana al dedo. */}

        {Array.from({ length: GP_OPTION_SLOTS }, (_, i) => {
          const s = pairSpots[i] ?? { x: 0, y: 0 };
          return (
            <Handle
              key={`p${i}`}
              index={i}
              x={s.x - 44}
              y={s.y - 20}
              w={88}
              h={40}
              enabled={conPares && i < problem.options.length}
              onTap={alTocarPar}
            />
          );
        })}

        <Handle
          index={0}
          x={inkSpot.x - 24}
          y={inkSpot.y - 24}
          w={48}
          h={48}
          enabled={conGota}
          onTap={() => setMessage({ text: t("gp.hint.dragTheDrop"), tone: "dim" })}
          onDrop={alSoltarGota}
          spot={{ x: inkSpot.x, y: inkSpot.y - machineH }}
          dragIdx={dragIdx}
          dragX={dragX}
          dragY={dragY}
        />

        {/* La recta vertical, que se baja con el dedo sobre la hoja. */}
        <Sweeper
          x={0}
          y={machineH}
          w={width}
          h={walkH}
          enabled={preguntaCurva}
          plane={wl.sheet}
          sweep={sweep}
          onSweep={alBarrer}
        />

        {/* La guía encima de todo y sin llevarse ningún toque. */}
        <Spotlight focus={focus} />
      </View>

      <Hint text={message.text} tone={message.tone} />

      {preguntaCurva ? (
        <View style={styles.answers}>
          <Choice label={t("gp.answer.isGraph")} onPress={() => acciones.current.judge(true)} />
          <Choice label={t("gp.answer.notGraph")} onPress={() => acciones.current.judge(false)} />
        </View>
      ) : null}

      <View style={styles.tools}>
        {level.machine !== "hidden" ? (
          <Toggle label={t(machineOn ? "gp.machine.hide" : "gp.machine.show")} onPress={toggleMachine} />
        ) : null}
      </View>

      {level.definition ? <Text style={styles.definition}>{t("gp.definition")}</Text> : null}
    </View>
  );
}

/** Si una curva vuelve sobre sí misma: dos alturas sobre la misma posición. */
function tieneDosAlturas(curve: GpCurve): boolean {
  for (let i = 1; i < curve.points.length; i++) {
    const a = curve.points[i - 1] as GpPoint;
    const b = curve.points[i] as GpPoint;
    if (b.x <= a.x) return true;
  }
  return false;
}

function openingHint(ask: string): string {
  if (ask === "spot") return "gp.hint.spot";
  if (ask === "continue") return "gp.hint.continue";
  if (ask === "walk") return "gp.hint.walk";
  if (ask === "read") return "gp.hint.read";
  if (ask === "place") return "gp.hint.place";
  return "gp.hint.judge";
}

/**
 * La superficie por donde camina el caminante. El arrastre lo lleva y el toque
 * lo manda a esa posición, en carrera porque un `Pan` habilitado le gana siempre
 * a un `Tap` que escuche la misma superficie.
 *
 * El gesto lee `translationX` y no acumula `changeX`: el evento que activa el
 * gesto no llega a `onChange`, y con deltas el arrastre del navegador
 * automatizado se pierde entero.
 */
function Walkway({
  x,
  y,
  w,
  h,
  enabled,
  from,
  to,
  plane,
  ground,
  onWalk,
  onTap,
  offsetY,
  tapping,
  startAt,
}: {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly from: number;
  readonly to: number;
  readonly plane: { readonly cx: number; readonly ux: number };
  readonly ground: { readonly cx: number; readonly ux: number } | null;
  readonly onWalk: (x: number) => void;
  readonly onTap: (index: number, x: number, y: number) => void;
  readonly offsetY: number;
  readonly tapping: boolean;
  readonly startAt: { value: number };
}) {
  const gesture = useMemo(() => {
    // El caminante camina sobre el terreno mientras el terreno esté, y sobre la
    // hoja cuando ya no: el mismo dedo, la superficie que haya.
    const cx = ground ? ground.cx : plane.cx;
    const ux = ground ? ground.ux : plane.ux;

    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd((e) => {
        if (tapping) {
          runOnJS(onTap)(0, e.x + x, e.y + y - offsetY);
          return;
        }
        runOnJS(onWalk)(Math.round(Math.max(from, Math.min(to, (e.x + x - cx) / ux))));
      });

    const pan = Gesture.Pan()
      .enabled(enabled && !tapping)
      .onBegin((e) => {
        startAt.value = Math.max(from, Math.min(to, (e.x + x - cx) / ux));
      })
      .onChange((e) => {
        const destino = startAt.value + e.translationX / ux;
        runOnJS(onWalk)(Math.round(Math.max(from, Math.min(to, destino))));
      })
      .onEnd((e) => {
        const destino = startAt.value + e.translationX / ux;
        runOnJS(onWalk)(Math.round(Math.max(from, Math.min(to, destino))));
      });

    return Gesture.Race(pan, tap);
  }, [enabled, from, to, plane, ground, onWalk, onTap, x, y, offsetY, tapping, startAt]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

/** La recta vertical que se baja con el dedo sobre la hoja. */
function Sweeper({
  x,
  y,
  w,
  h,
  enabled,
  plane,
  sweep,
  onSweep,
}: {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly plane: { readonly cx: number; readonly ux: number };
  readonly sweep: { value: number };
  /** La recta se movió: un toque o un arrastre terminado. */
  readonly onSweep: () => void;
}) {
  const gesture = useMemo(() => {
    const cx = plane.cx;
    const ux = plane.ux;
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd((e) => {
        sweep.value = (e.x + x - cx) / ux;
        runOnJS(onSweep)();
      });
    const pan = Gesture.Pan()
      .enabled(enabled)
      .onBegin((e) => {
        sweep.value = (e.x + x - cx) / ux;
      })
      .onChange((e) => {
        sweep.value = (e.x + x - cx) / ux;
      })
      .onEnd(() => {
        runOnJS(onSweep)();
      });
    return Gesture.Race(pan, tap);
  }, [enabled, plane, sweep, x, onSweep]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

/**
 * Un asa invisible sobre lo que Skia dibuja. El toque siempre está; el arrastre
 * solo donde hay algo que llevar, y los dos corren en carrera.
 */
function Handle({
  index,
  x,
  y,
  w,
  h,
  enabled,
  onTap,
  onDrop,
  spot,
  dragIdx,
  dragX,
  dragY,
}: {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onTap: (index: number) => void;
  readonly onDrop?: (index: number, x: number, y: number) => void;
  readonly spot?: { readonly x: number; readonly y: number };
  readonly dragIdx?: { value: number };
  readonly dragX?: { value: number };
  readonly dragY?: { value: number };
}) {
  const gesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)(index);
      });
    if (!onDrop || !spot || !dragIdx || !dragX || !dragY) return tap;
    const pan = Gesture.Pan()
      .enabled(enabled)
      .onBegin(() => {
        dragIdx.value = index;
      })
      .onChange((e) => {
        dragX.value = e.translationX;
        dragY.value = e.translationY;
      })
      .onEnd((e) => {
        // Dónde quedó la gota, en coordenadas de la hoja: de dónde salió más
        // cuánto se movió, y nunca de la posición absoluta del dedo, porque la
        // caja del lienzo no se puede medir con `onLayout`.
        runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
      })
      .onFinalize(() => {
        dragIdx.value = -1;
        dragX.value = 0;
        dragY.value = 0;
      });
    return Gesture.Race(pan, tap);
  }, [enabled, index, onTap, onDrop, spot, dragIdx, dragX, dragY]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

function Toggle({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={theme.hitSlop} style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

function Choice({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={theme.hitSlop} style={styles.choice}>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[1],
  },
  back: { position: "absolute", top: 48, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  answers: { flexDirection: "row", gap: theme.space[2] },
  choice: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.token,
    ...chipFace,
  },
  choiceLabel: { color: theme.color.ink, fontSize: 14 },
  tools: { flexDirection: "row", gap: theme.space[2] },
  toggle: {
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[0],
    borderRadius: theme.radius.full,
    ...toggleFace,
  },
  toggleLabel: { color: theme.color.inkDim, fontSize: 12 },
  definition: {
    color: theme.color.inkDim,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 560,
    paddingHorizontal: theme.space[3],
  },
});
