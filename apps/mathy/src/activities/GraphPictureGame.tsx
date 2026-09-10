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
import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
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
  type GpCurve,
  type GpLevel,
  type GpPoint,
  type GpTrace,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  WalkScene,
  walkLayout,
  walkNumeral,
  walkPairPath,
  walkPx,
  walkPy,
  walkTextPath,
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
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: t(openingHint(problem.ask)),
    tone: "dim",
  }));

  // --- Medidas ---------------------------------------------------------------

  const sceneH = Math.max(360, Math.min(height * 0.62, 520));
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
      const altura = gpHeightAt(rastro, limitado);
      if (altura !== null) light({ x: limitado, y: altura });
    },
    [desde, hasta, alturas, at, walkerY, rastro, light],
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
    setMessage({ text: t(openingHint(problem.ask)), tone: "dim" });
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
    hint.value = 1;
    // El latido de la demostración: la mano fantasma arrastra al caminante unos
    // pasos y las gotas caen a la hoja.
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1600 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
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

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      luego(nextRound, 2100);
    },
    [nextRound, quiet, luego],
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
        succeed(t("gp.hint.spotted"));
        return;
      }
      setMessage({ text: t("gp.hint.otherDrop"), tone: "warn" });
    },
    [solved, quiet, problem.options, problem.target, light, attempt, succeed],
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
        succeed(t("gp.hint.continued"));
        return;
      }
      // La curva que vuelve sobre sí misma tiene su propio empujón: no es una
      // continuación equivocada, es una que no puede venir de ninguna máquina.
      const curva = problem.continuations[index];
      const vuelve = curva ? tieneDosAlturas(curva) : false;
      setMessage({ text: t(vuelve ? "gp.hint.twoHeights" : "gp.hint.otherCurve"), tone: "warn" });
    },
    [solved, quiet, problem.correct, problem.continuations, attempt, succeed],
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
        light(objetivo);
        succeed(t("gp.hint.readIt"));
        return;
      }
      // La repetición del error corre sobre la mecánica del nodo, que es la que
      // el catálogo declara: el caminante va a la posición que el jugador
      // eligió y se ve a qué altura quedó.
      light(elegido);
      setMessage({ text: t(mal ? "gp.hint.swapped" : "gp.hint.otherPair"), tone: "warn" });
    },
    [solved, quiet, problem.options, problem.target, level, attempt, succeed, light],
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
    [solved, quiet, problem.target, level, attempt, succeed, light, luego],
  );

  /** Decir si la curva puede ser rastro de una máquina. */
  const judge = useCallback(
    (esGrafica: boolean) => {
      if (solved) return;
      quiet();
      const ok = esGrafica === problem.isGraph;
      attempt(ok);
      if (ok) {
        succeed(t(problem.isGraph ? "gp.hint.isGraph" : `gp.hint.why.${problem.violation ?? "two_heights"}`));
        return;
      }
      setMessage({ text: t("gp.hint.sweepIt"), tone: "warn" });
    },
    [solved, quiet, problem.isGraph, problem.violation, attempt, succeed],
  );

  /** Caminar hasta cubrir el rastro entero: la hoja no puede quedar con huecos. */
  useEffect(() => {
    if (problem.ask !== "walk" || solved || doneRef.current || !rastro) return;
    const faltan = gpPoints(rastro).filter((p) => !inked.includes(p.x));
    if (inked.length > 0 && faltan.length === 0) {
      attempt(true);
      succeed(t("gp.hint.covered"));
    }
  }, [inked, problem.ask, solved, rastro, attempt, succeed]);

  // --- Tocar la hoja ---------------------------------------------------------

  /** De píxeles del lienzo a la posición y la altura más cercanas de la hoja. */
  const lattice = useCallback(
    (x: number, y: number): GpPoint => ({
      x: Math.round((x - wl.sheet.cx) / wl.sheet.ux),
      y: Math.round((wl.sheet.cy - y) / wl.sheet.uy),
    }),
    [wl.sheet],
  );

  /** Tocar la hoja donde hay tres curvas: gana la más cercana al dedo. */
  const touchSheet = useCallback(
    (x: number, y: number) => {
      if (problem.ask !== "continue" || solved) return;
      let mejor = -1;
      let dist = DROP_R;
      problem.continuations.forEach((curva, i) => {
        for (const punto of curva.points) {
          const d = Math.hypot(x - walkPx(wl.sheet, punto.x), y - walkPy(wl.sheet, punto.y));
          if (d < dist) {
            dist = d;
            mejor = i;
          }
        }
      });
      if (mejor < 0) {
        setMessage({ text: t("gp.hint.pickCurve"), tone: "dim" });
        return;
      }
      chooseCurve(mejor);
    },
    [problem.ask, problem.continuations, solved, wl.sheet, chooseCurve],
  );

  const dropInk = useCallback(
    (_index: number, x: number, y: number) => {
      place(lattice(x, y));
    },
    [place, lattice],
  );

  const walkTo = useCallback((x: number) => moveWalker(x), [moveWalker]);

  /**
   * Lo que el gesto llama viaja en una referencia estable: si el objeto del
   * `Gesture` cambiara de identidad entre renders, el detector tendría que
   * reengancharlo y el arrastre se perdería a mitad de camino.
   */
  const acciones = useRef({ spot, readPair, touchSheet, dropInk, walkTo, judge });
  acciones.current = { spot, readPair, touchSheet, dropInk, walkTo, judge };

  const alTocarGota = useCallback((i: number) => acciones.current.spot(i), []);
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

  // --- Lo que la actividad dibuja por su cuenta ------------------------------

  /** Las fichas de pares del mostrador, con la misma coma que la etiqueta. */
  const pairSpots = useMemo(() => {
    const paso = Math.min(width / (GP_OPTION_SLOTS + 1), 110);
    return Array.from({ length: GP_OPTION_SLOTS }, (_, i) => ({
      x: width / 2 + (i - (GP_OPTION_SLOTS - 1) / 2) * paso,
      y: sceneH - 26,
    }));
  }, [width, sceneH]);

  const conPares = problem.ask === "read" && !solved;

  const pairGeom = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const texto = Skia.Path.Make();
    if (!conPares) return { cuerpo, texto };
    problem.options.forEach((par, i) => {
      const s = pairSpots[i];
      if (!s) return;
      cuerpo.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 42, s.y - 18, 84, 36), 8, 8));
      texto.addPath(walkPairPath(par, s.x, s.y, 18));
    });
    return { cuerpo, texto };
  }, [conPares, problem.options, pairSpots]);

  /** La gota que espera en el borde para ser arrastrada a la hoja. */
  const inkSpot = useMemo(
    () => ({ x: 46, y: sceneH - 40 }),
    [sceneH],
  );

  const conGota = problem.ask === "place" && !solved;

  const inkGeom = useMemo(() => {
    const p = Skia.Path.Make();
    if (!conGota) return p;
    p.addCircle(inkSpot.x, inkSpot.y, 11);
    return p;
  }, [conGota, inkSpot]);

  /**
   * Lo que se pregunta, escrito: el par que hay que ubicar junto a la gota del
   * borde, o la posición sola arriba de la hoja. La posición va sola a propósito
   * en `spot`: la altura es justo lo que el jugador tiene que ir a buscar.
   */
  const askedGeom = useMemo(() => {
    if (problem.ask === "place" && problem.target) {
      return walkPairPath(problem.target, inkSpot.x + 78, inkSpot.y, 20);
    }
    if (problem.ask === "spot") {
      return walkTextPath(
        walkNumeral(problem.asked),
        walkPx(wl.sheet, window0.x0) + 22,
        machineH + 16,
        24,
      );
    }
    return Skia.Path.Make();
  }, [problem.ask, problem.target, problem.asked, inkSpot, wl.sheet, window0.x0, machineH]);

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
  const paseoW =
    problem.ask === "continue" || !wl.ground ? width : walkPx(wl.sheet, window0.x0) - 8;
  const conCaminante = problem.ask === "walk" || problem.ask === "spot" || problem.ask === "continue";

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_GRAPH_PICTURE}.name`)} · nivel ${level.n} de ${TOTAL_GP_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

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
          <Path path={pairGeom.cuerpo} color={theme.color.line} style="stroke" strokeWidth={1.5} />
          <Path path={pairGeom.texto} color={theme.color.ink} />
          <Path path={inkGeom} color={theme.color.accent} />
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
          tapping={problem.ask === "continue"}
          startAt={dragFrom}
        />

        {Array.from({ length: GP_OPTION_SLOTS }, (_, i) => {
          const punto = problem.options[i];
          const marcada = problem.ask === "spot" && punto !== undefined;
          const spot0 = punto
            ? { x: walkPx(wl.sheet, punto.x), y: walkPy(wl.sheet, punto.y) + machineH }
            : { x: 0, y: 0 };
          return (
            <Handle
              key={`d${i}`}
              index={i}
              x={spot0.x - 22}
              y={spot0.y - 22}
              w={44}
              h={44}
              enabled={marcada && !solved}
              onTap={alTocarGota}
            />
          );
        })}

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
        />
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
}: {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly plane: { readonly cx: number; readonly ux: number };
  readonly sweep: { value: number };
}) {
  const gesture = useMemo(() => {
    const cx = plane.cx;
    const ux = plane.ux;
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd((e) => {
        sweep.value = (e.x + x - cx) / ux;
      });
    const pan = Gesture.Pan()
      .enabled(enabled)
      .onBegin((e) => {
        sweep.value = (e.x + x - cx) / ux;
      })
      .onChange((e) => {
        sweep.value = (e.x + x - cx) / ux;
      });
    return Gesture.Race(pan, tap);
  }, [enabled, plane, sweep, x]);

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
    backgroundColor: theme.color.bg,
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
    borderWidth: 1,
    borderColor: theme.color.line,
    backgroundColor: theme.color.surfaceHigh,
  },
  choiceLabel: { color: theme.color.ink, fontSize: 14 },
  tools: { flexDirection: "row", gap: theme.space[2] },
  toggle: {
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[0],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.line,
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
