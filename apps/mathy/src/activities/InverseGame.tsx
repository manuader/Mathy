/**
 * La máquina en reversa: el minijuego de `alg.fn.inverse_function`.
 *
 * Es el **segundo regreso de la llave**. En el nodo 12 la llave era una
 * operación y el cofre otra cosa; acá los dos son máquinas, y por eso la
 * pantalla tiene tres superficies y ninguna es nueva:
 *
 * - `machine_pipe` es la principal y la dibuja `PipeScene`, con dos props que
 *   ya estaban puestas esperando a este nodo: `direction: "backward"`, que da
 *   vuelta el caño entero, y `PipeMachine.inverted`, que le pone la marca a la
 *   máquina de vuelta. Este nodo le agregó una sola cosa, aditiva: el exponente
 *   en los rótulos, para poder escribir `f⁻¹` con el `−` y el `1` del atlas.
 * - `chest_key` vuelve en el nivel 4 con `ChestScene` en modo `key`: el mismo
 *   diagrama vertical del nodo 12, ahora con la máquina entera en la flecha, y
 *   el mismo llavero con máquinas en vez de operaciones.
 * - `slope_walker` entra desde el nivel 5 con `WalkScene`, que traía el eje
 *   `diagonal` apagado y anotado como del nodo 21. Este nodo le agregó
 *   `sweepAxis`, también aditivo: la recta del test, acostada, que el jugador
 *   baja con el dedo.
 *
 * Con lección, la guía de Lumi juega la primera ronda al lado del jugador: cada
 * paso señala la bola, la palanca, la hoja o la fila de fichas de esta ronda, y
 * el paso que explica frena la ronda hasta que el jugador dice "entendido". Los
 * niveles que alternan preguntas guían la primera; la línea de abajo dice cuál
 * toca en cada ronda.
 *
 * Esta actividad no dibuja nada y no calcula ninguna salida: elige qué escena
 * mira el jugador en cada ronda, le pasa su configuración y traduce el dedo en
 * los valores que las tres animan. La cuenta la hace `@mathy/mechanics`, para
 * que no haya dos fuentes de verdad.
 *
 * El único error que clasifica es `sqrt_loses_negative_branch`, que es el único
 * que `misconceptions.yaml` apunta a este nodo. Elegir del llavero la máquina
 * que no deshace está previsto, se muestra y **no se anota**: el catálogo no
 * apunta `wrong_inverse_choice` acá, y un id inventado ensucia la remediación
 * para siempre.
 *
 * QUÉ QUEDÓ AFUERA: el doblez con dos dedos. La grilla se pliega igual y los
 * dos rastros quedan simétricos, pero el gesto que lo dispara es tocar el
 * rastro que corresponde y no pellizcar la diagonal. Un `Pinch` sobre el
 * lienzo entero no se despierta con punteros sintéticos y quedaría sin
 * verificar, que es peor que no tenerlo; el contenido —la reflexión— está
 * entero y el gesto se puede subir cuando haya con qué probarlo.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  INV_RING_SLOTS,
  NODE_INVERSE_FUNCTION,
  TOTAL_INV_LEVELS,
  generateInverse,
  invCallPieces,
  invFormulaPieces,
  invIdentityPieces,
  invIsIdentity,
  invMisconceptionFor,
  invMisconceptionForCut,
  invRestores,
  invRulePieces,
  invRun,
  type GpTrace,
  type InvCandidate,
  type InvLevel,
  type InvMachine,
  type InvOption,
  type InvPair,
  type InvPiece,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  PipeScene,
  PIPE_MACHINE_SLOTS,
  PIPE_TRAY_SLOTS,
  pipeLayout,
  type PipeConfig,
  type PipeItem,
  type PipeMachine,
  type PipeSlot,
} from "../scenes/PipeScene.tsx";
import {
  WalkScene,
  walkLayout,
  type WalkConfig,
} from "../scenes/WalkScene.tsx";
import {
  ChestScene,
  chestLayout,
  type ChestArrow,
  type ChestDiagram,
  type ChestKeyKind,
  type ChestLevel,
  type ChestProblem,
  type Slot,
} from "../scenes/ChestScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";
import { chipFace } from "../ui/Kit.tsx";

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 16;

/**
 * El signo de cada operación. El menos es el U+2212 de la tipografía
 * matemática: el guion de ASCII no está en el atlas y dejaría un hueco.
 */
const SIGN: Readonly<Record<string, string>> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

/**
 * Una expresión escrita para una ficha de texto. La marca es el exponente de
 * Unicode, porque una ficha es un `<Text>` y ahí cualquier carácter se dibuja.
 */
function composeText(pieces: readonly InvPiece[]): string {
  let out = "";
  for (const p of pieces) {
    if (p.kind === "num") out += p.value < 0 ? `−${Math.abs(p.value)}` : String(p.value);
    else if (p.kind === "sym") out += p.name;
    else if (p.kind === "mark") out += "⁻¹";
    else if (p.kind === "open") out += "(";
    else if (p.kind === "close") out += ")";
    else if (p.kind === "eq") out += " = ";
    else out += ` ${SIGN[p.op] ?? "+"} `;
  }
  return out;
}

/**
 * La misma expresión para el lienzo, donde los glifos salen del atlas. La marca
 * viaja como `^−1` porque `⁻¹` no está horneado y dejaría el hueco de la trampa
 * del guion: `PipeScene` levanta lo que sigue al `^` y lo dibuja con el `−` y el
 * `1` de siempre, que es lo que un exponente es.
 */
function composeGlyphs(pieces: readonly InvPiece[]): string {
  let out = "";
  for (const p of pieces) {
    if (p.kind === "num") out += p.value < 0 ? `−${Math.abs(p.value)}` : String(p.value);
    else if (p.kind === "sym") out += p.name;
    else if (p.kind === "mark") out += "^−1";
    else if (p.kind === "open") out += "(";
    else if (p.kind === "close") out += ")";
    else if (p.kind === "eq") out += " = ";
    else out += `${SIGN[p.op] ?? "+"}`;
  }
  return out;
}

/** Lo que hace cada paso, en el vocabulario de las dos escenas. */
const KIND = { add: "add", sub: "sub", mul: "mul", div: "div" } as const;

export interface InverseGameProps {
  readonly level: InvLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function InverseGame(props: InverseGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onEvent }: InverseGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: la máquina no corre y la latencia no cuenta hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  const conLeccion = lesson?.lesson !== undefined;
  const alterna = level.asks.length > 1;
  /**
   * Lo que dice la línea de abajo al empezar una ronda. Con lección, el cartel
   * ya dice qué hacer; salvo en los niveles que alternan preguntas, donde el
   * cartel es el mismo para las dos y la línea dice cuál toca.
   */
  const apertura = useCallback(
    (a: string): string => (conLeccion && !alterna ? "" : t(`inv.ask.${a}`)),
    [conLeccion, alterna],
  );
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** La palanca: hacia adelante o al revés. Es el gesto central del nodo. */
  const [back, setBack] = useState(false);
  /** Qué bola está viajando por el caño ahora, o null. */
  const [fed, setFed] = useState<number | null>(null);
  /** La bola ya volvió a ser la que era. */
  const [returned, setReturned] = useState(false);
  /** La candidata que se probó sobre el diagrama, o null. */
  const [tried, setTried] = useState<InvCandidate | null>(null);
  /** La ficha, la curva o la gota elegida, o -1. */
  const [picked, setPicked] = useState(-1);
  /** La grilla doblada, para que el rastro reflejado se vea del otro lado. */
  const [folded, setFolded] = useState(false);

  const problem = useMemo(
    () => generateInverse(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: apertura(ask),
    tone: "dim",
  }));

  // --- Cómo se reparte el lienzo ---------------------------------------------

  const conHoja = ask === "fold" || ask === "swap" || ask === "exists" || ask === "cut";
  const soloHoja = ask === "fold" || ask === "swap";
  // Con lección, el cartel de la guía ocupa arriba lo que el lienzo cede. En un
  // teléfono, además, cede lo que ocupan la fila de botones y la definición de
  // abajo: en 390 × 844 la tercera respuesta del último nivel quedaba cortada y
  // la definición, entera fuera de la pantalla.
  const estrecho = width < 600;
  const conFilaAbajo = problem.options.length > 0 || ask === "order" || ask === "lever";
  const alto =
    (level.definition ? 0.5 : 0.6) -
    (conLeccion ? 0.08 : 0) -
    (estrecho && conFilaAbajo ? 0.04 : 0) -
    (estrecho && level.definition ? 0.12 : 0);
  const sceneH = Math.max(estrecho ? 240 : 280, Math.min(height * alto, 480));
  // Con hoja, el caño se queda con una banda arriba y la hoja con el resto; sin
  // hoja, el caño se queda con todo. Las dos escenas quedan montadas siempre:
  // la que no juega esta ronda se apaga, no se desmonta.
  const pipeH = soloHoja ? 1 : conHoja ? Math.round(sceneH * 0.34) : sceneH;
  const walkH = conHoja ? sceneH - (soloHoja ? 0 : pipeH) : 1;
  const walkY = soloHoja ? 0 : pipeH;

  // --- Lo que ve la tubería --------------------------------------------------

  /** La máquina que está puesta en el caño ahora: la de ida o la de vuelta. */
  const corriendo = useMemo<InvMachine>(() => {
    if (!back) return problem.machine;
    return problem.inverse ?? problem.machine;
  }, [back, problem.machine, problem.inverse]);

  /**
   * El techo con el que se normalizan los tamaños. Sale del más grande de todo
   * lo que la ronda puede mostrar: normalizado contra el recorrido de ahora, un
   * cambio de máquina no se vería.
   */
  const techo = useMemo(() => {
    const candidatos = [
      Math.abs(problem.input),
      Math.abs(problem.output),
      ...problem.branches.map((b) => Math.abs(b)),
      1,
    ];
    return Math.max(...candidatos.filter((v) => Number.isFinite(v)), 1);
  }, [problem]);

  const item = useCallback(
    (value: number, kind: PipeItem["kind"] = "ball"): PipeItem => ({
      value,
      size: Math.max(0.28, Math.min(1, Math.abs(value) / techo)),
      kind,
      label: "",
    }),
    [techo],
  );

  /**
   * Un paso de la máquina, en el vocabulario de la escena. Una máquina de dos
   * pasos ocupa dos carcasas: el caño es la cadena del nodo 20 y las cajas son
   * lo que se encadena.
   */
  const boxesOf = useCallback(
    (m: InvMachine): readonly PipeMachine[] => {
      if (m.collapse !== null) {
        // La máquina que junta entradas no muestra lo que hace: si mostrara una
        // operación, el jugador leería la regla y no vería la confluencia.
        return [
          {
            id: m.id,
            kind: "opaque",
            value: 0,
            label: level.named ? composeGlyphs([{ kind: "sym", name: m.name }]) : "",
            inverted: back,
            opaque: true,
          },
        ];
      }
      if (invIsIdentity(m)) {
        return [
          {
            id: `${m.id}0`,
            kind: "identity",
            value: 0,
            label: level.named ? composeGlyphs([{ kind: "sym", name: m.name }]) : "",
            inverted: m.inverted,
            opaque: false,
          },
        ];
      }
      return m.steps.slice(0, PIPE_MACHINE_SLOTS).map((s, i) => ({
        id: `${m.id}${i}`,
        kind: KIND[s.op],
        value: s.value,
        // El nombre va sobre la caja recién cuando el nodo escribe nombres, y
        // solo cuando la máquina es de un paso: con dos, la letra nombra a la
        // cadena entera y no a cada caja.
        label:
          level.named && m.steps.length === 1
            ? composeGlyphs(m.inverted ? [{ kind: "sym", name: m.name }, { kind: "mark" }] : [{ kind: "sym", name: m.name }])
            : "",
        inverted: m.inverted,
        opaque: false,
      }));
    },
    [back, level.named],
  );

  /**
   * El renglón de notación debajo del caño. En `identity` es la cadena escrita
   * —`f⁻¹(f(x)) = x`, que es la definición dicha con la cadena y no con una
   * fórmula— y en las demás es la regla de la máquina que está corriendo.
   */
  const formula = useMemo(() => {
    if (!level.named) return "";
    if (ask === "identity") return composeGlyphs(invIdentityPieces(problem.machine));
    if (ask === "name" || ask === "order") return composeGlyphs(invFormulaPieces(problem.machine));
    if (ask === "exists" || ask === "cut") {
      return composeGlyphs(invCallPieces(problem.machine, [{ kind: "sym", name: "x" }]));
    }
    return "";
  }, [ask, level.named, problem.machine]);

  const pipeConfig = useMemo<PipeConfig>(() => {
    // En `identity` el caño lleva las dos máquinas en serie: la bola las
    // atraviesa y sale como entró, que es lo que la cadena dice.
    const cadena =
      ask === "identity" && problem.inverse
        ? [...boxesOf(problem.machine), ...boxesOf(problem.inverse)]
        : boxesOf(corriendo);
    const entrada = fed ?? (back ? problem.output : problem.input);
    const corrida = invRun(corriendo, entrada);
    // Con las dos máquinas en cadena la bola sale como entró, y eso no lo
    // calcula esta pantalla: es lo que el nodo garantiza y lo que la cadena
    // muestra.
    const salida = ask === "identity" ? entrada : corrida.output;
    const etapas =
      ask === "identity" && problem.inverse
        ? [item(invRun(problem.machine, entrada).output), item(entrada)]
        : corrida.stages.map((v) => item(v));

    return {
      lanes: [
        {
          id: "l0",
          machines: cadena,
          input: item(entrada),
          stages: etapas.length > 0 ? etapas : [item(salida)],
          output: item(salida),
          target: null,
          glow: !solved,
          // Correr al revés la máquina que junta entradas saca dos bolas por la
          // boca de entrada. La segunda cae por el tubo lateral con la luz
          // encendida, que es lo mismo que el nodo 17 usó para decir "esto no
          // es una máquina": acá dice "la vuelta no es una máquina".
          branch:
            back && problem.branches.length === 2 ? item(problem.branches[1] as number) : null,
        },
      ],
      skin: level.skin,
      // El caño entero se lee en el otro sentido: la boca y el pico se
      // intercambian y la punta apunta al otro lado.
      direction: back ? "backward" : "forward",
      numerals: level.numerals,
      counter: level.numerals && fed !== null,
      table: [],
      tray: [],
      // La bandeja lleva la bola que toca meter: la de la canasta con la
      // palanca derecha, la que ya salió con la palanca girada.
      trayItems:
        ask === "lever" || ask === "watch" || ask === "identity"
          ? [item(back ? problem.output : problem.input)]
          : [],
      slots: 0,
      reorderable: false,
      box: false,
      onDemand: level.onDemand,
      formula,
    };
  }, [ask, back, boxesOf, corriendo, fed, formula, item, level, problem, solved]);

  const pl = useMemo(() => pipeLayout(pipeConfig, width, pipeH), [pipeConfig, width, pipeH]);

  // --- Lo que ve la hoja -----------------------------------------------------

  /**
   * Un rastro con la forma del nodo 18: una altura por posición, y `null` donde
   * no hay ninguna. Es el mismo objeto a propósito, porque la tercera cara del
   * nodo es que la inversa se lee en el rastro.
   */
  const traceOf = useCallback((id: string, pares: readonly InvPair[]): GpTrace | null => {
    if (pares.length === 0) return null;
    const from = Math.min(...pares.map((p) => p.x));
    const to = Math.max(...pares.map((p) => p.x));
    const heights: (number | null)[] = [];
    for (let x = from; x <= to; x++) {
      const par = pares.find((p) => p.x === x);
      heights.push(par ? par.y : null);
    }
    return { id, from, heights, breaks: [] };
  }, []);

  const walkCfg = useMemo<WalkConfig>(() => {
    const ida = traceOf("f", problem.trace);
    // El rastro reflejado aparece cuando la grilla ya se dobló: antes, estaría
    // dibujada la respuesta.
    const vuelta = folded || ask === "swap" ? traceOf("g", problem.mirror) : null;
    const rastros = [ida, vuelta].filter((x): x is GpTrace => x !== null);
    return {
      window: problem.window,
      quadrants: false,
      ground: "hidden",
      terrain: null,
      traces: rastros,
      mainTrace: 0,
      drops: true,
      line: true,
      walker: "none",
      ink: false,
      lit: ask === "swap" ? problem.lit : null,
      threads: ask === "swap",
      label: ask === "swap",
      marked: ask === "swap" && !solved ? problem.marked : [],
      // Las tres curvas candidatas del doblez, hasta que una se elige.
      options:
        ask === "fold" && !folded
          ? problem.curves.map((c) => ({ id: c.id, points: c.points, closed: false }))
          : [],
      curve: null,
      // La recta acostada del test: sobre el rastro original, dos gotas a la
      // misma altura dicen que la vuelta no existe.
      verticalLine: ask === "exists" || ask === "cut",
      sweepAxis: "horizontal",
      step: null,
      diagonal: true,
      asymptote: null,
      skin: "hill_walk",
      numerals: level.numerals,
      axisLabels: level.named,
      legend: "",
      square: true,
    };
  }, [ask, folded, level, problem, solved, traceOf]);

  const wl = useMemo(() => walkLayout(walkCfg, width, Math.max(walkH, 1)), [walkCfg, width, walkH]);

  // --- Lo que ve el cofre ----------------------------------------------------

  const diagram = useMemo<ChestDiagram>(() => {
    const primero = problem.machine.steps[0];
    const arrow: ChestArrow = {
      id: "a0",
      lock: (primero ? KIND[primero.op] : "add") as ChestKeyKind,
      count: primero?.value ?? 0,
      key: tried
        ? {
            kind: (KIND[(tried.machine.steps[0]?.op ?? "add")] as ChestKeyKind),
            count: tried.machine.steps[0]?.value ?? 0,
          }
        : null,
      closed: solved,
    };
    return {
      panels: [
        {
          arrows: [arrow],
          values: [problem.input, problem.output],
          fits: !tried || tried.correct,
          reveal: null,
        },
      ],
      skin: "arrows",
      labeled: level.numerals,
      numerals: level.numerals,
      slots: null,
    };
  }, [level.numerals, problem, solved, tried]);

  const chestProblem = useMemo<ChestProblem>(
    () => ({
      // Este nodo no tiene pista ni manivela: el diagrama está suelto y el
      // llavero va abajo. La pista queda apagada, no desmontada.
      track: 2,
      home: 0,
      step: 0,
      landing: 0,
      // El llavero del nodo 12, con máquinas en vez de operaciones. Cada
      // candidata es de un paso en el nivel donde el llavero vuelve, así que la
      // llave la dibuja la forma de su operación y su número en puntitos.
      keys: problem.ring.map((c) => ({
        teeth: c.machine.steps[0]?.value ?? 0,
        kind: (KIND[(c.machine.steps[0]?.op ?? "add")] as ChestKeyKind),
        dots: !level.numerals,
      })),
      returns: [],
      liar: -1,
      marks: null,
      row: { minuend: 0, subtrahend: 0, result: 0, hidden: "result" },
      tiles: [],
      lock: { kind: "turn", value: 0 },
      actions: [],
      diagram,
    }),
    [diagram, level.numerals, problem.ring],
  );

  const chestLevel = useMemo<ChestLevel>(
    () => ({
      mode: "key",
      layer: level.layer,
      labeled: level.numerals,
      skin: "hidden",
      ruler: false,
      keyboard: false,
      numerals: level.numerals,
    }),
    [level.layer, level.numerals],
  );

  const cl = useMemo(
    () => chestLayout(chestProblem, chestLevel, width, sceneH),
    [chestProblem, chestLevel, width, sceneH],
  );

  // --- Lo que las escenas animan ---------------------------------------------

  const flow = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const unfold = useSharedValue(1);
  const pipeAppear = useSharedValue(0);
  const walkAppear = useSharedValue(0);
  const chestAppear = useSharedValue(0);
  const sweep = useSharedValue(0);
  const walkerAt = useSharedValue(0);
  const walkerY = useSharedValue(0);
  /**
   * La vuelta en el diagrama del cofre: la flecha que sube y cierra, la que
   * arranca y se traba, y el objeto que vuelve. Antes estaban apagadas y el
   * llavero de máquinas no contestaba nada sobre el diagrama: solo el mensaje.
   */
  const chestBack = useSharedValue(0);
  const chestLeft = useSharedValue(0);
  const chestOpen = useSharedValue(0);
  /**
   * Un cero compartido. Las escenas piden agujas que este nodo no mueve, y una
   * sola apagada las cubre a todas sin montar diez valores muertos.
   */
  const quieto = useSharedValue(0);

  const machineSlots = useSlots(PIPE_MACHINE_SLOTS);
  const traySlots = useSlots(PIPE_TRAY_SLOTS);
  const keySlots: Slot[] = [useKeySlot(), useKeySlot(), useKeySlot(), useKeySlot()];
  const tileSlots: Slot[] = [useKeySlot(), useKeySlot(), useKeySlot(), useKeySlot(), useKeySlot()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * La ronda ya se decidió, aunque el mensaje llegue después. Entre el
   * movimiento que resuelve y el cartel el caño tiene que correr; sin este
   * cerrojo, los toques de esa ventana se cuentan como intentos nuevos.
   */
  const cerrado = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const luego = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  /**
   * Todo lo que un gesto necesita saber, en una referencia. Un worklet captura
   * el callback del render en que se armó el gesto, así que lo leído de la
   * clausura sería lo de la primera ronda para siempre.
   */
  const vivo = useRef({ problem, ask, solved, back, fed, folded });
  vivo.current = { problem, ask, solved, back, fed, folded };
  const roundRef = useRef(round);
  roundRef.current = round;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    cerrado.current = false;
    setSolved(false);
    setBack(false);
    setFed(null);
    setReturned(false);
    setTried(null);
    setPicked(-1);
    setFolded(false);
    setMessage({ text: apertura(problem.ask), tone: "dim" });

    flow.value = 0;
    jam.value = 0;
    chestBack.value = 0;
    chestLeft.value = 0;
    chestOpen.value = 0;
    unfold.value = level.onDemand ? 0 : 1;
    sweep.value = problem.window.y1;
    for (const s of [...machineSlots, ...traySlots]) {
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = 1;
    }
    keySlots.forEach((s, i) => {
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = i < problem.ring.length ? 1 : 0;
      if (s.spin) s.spin.value = 0;
    });
    for (const s of tileSlots) s.alive.value = 0;

    const enCofre = problem.ask === "ring";
    const enHoja =
      problem.ask === "fold" ||
      problem.ask === "swap" ||
      problem.ask === "exists" ||
      problem.ask === "cut";
    const enCano = !enCofre && !(problem.ask === "fold" || problem.ask === "swap");
    pipeAppear.value = withTiming(enCano ? 1 : 0, { duration: theme.motion.base });
    walkAppear.value = withTiming(enHoja ? 1 : 0, { duration: theme.motion.base });
    chestAppear.value = withTiming(enCofre ? 1 : 0, { duration: theme.motion.base });

    // En `intuition` la escena llega detenida con la bola cambiada frente a la
    // boca de salida y la palanca ya girada, que es exactamente la lámina del
    // documento: se predice antes de ver.
    if (problem.ask === "predict") setBack(true);

    // El latido de la demostración no es un adorno: es la única instrucción.
    // Con guía, la luz de la guía es la demostración: dos manos a la vez
    // señalarían dos cosas distintas.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    if (guided) {
      demo.value = 0;
    } else {
      demo.value = withRepeat(
        withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
        -1,
        false,
      );
    }
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
      for (const timer of timers.current) clearTimeout(timer);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa `real` se mira: la máquina corre sola en las dos posiciones, una
  // detrás de la otra, y el jugador no toca nada hasta que terminó. Pero recién
  // cuando el nivel empieza: detrás de la tarjeta de entrada la máquina corría
  // y terminaba sin que nadie la viera.
  useEffect(() => {
    if (!playing || problem.ask !== "watch") return;
    flow.value = 0;
    flow.value = withTiming(1, { duration: theme.motion.reveal });
    const id = setTimeout(() => {
      setBack(true);
      flow.value = 0;
      flow.value = withTiming(1, { duration: theme.motion.reveal });
    }, theme.motion.reveal + 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, playing]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_INVERSE_FUNCTION, layer: level.layer });
  }, [level.layer, onEvent]);

  // El reloj de la latencia arranca cuando empieza el juego, no detrás de la
  // tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [playing]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa. Por
  // referencia y no por dependencia: el callback de un gesto puede estar un
  // render atrasado (trampa 8).
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);

  // La guía del nivel habla de la pregunta de su primera ronda. En las rondas
  // de la otra, la pista de Tomi no tiene gesto que mostrar y salta el "mirá acá".
  const prefRef = useRef(lesson?.preferHint);
  prefRef.current = lesson?.preferHint;
  useEffect(() => {
    if (!alterna) return;
    prefRef.current?.(problem.ask === level.asks[0] ? null : "");
  }, [problem, alterna, level.asks]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      // Un error que el nivel no declara se muestra igual y va sin campo: el
      // catálogo de L manda, y no el documento del minijuego.
      const id = misconception && level.classifies.includes(misconception) ? misconception : undefined;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_INVERSE_FUNCTION,
          level: level.n,
          evidence,
          correct,
          latency,
          ...(id ? { misconception: id } : {}),
        });
      }
    },
    [level.classifies, level.evidence, level.n, onEvent],
  );

  const quiet = useCallback(() => {
    cancelAnimation(hint);
    hint.value = withTiming(0, { duration: 260 });
  }, [hint]);

  const nextRound = useCallback(() => {
    const r = roundRef.current;
    if (r + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_INVERSE_FUNCTION, level: level.n });
      onLevelDone();
      return;
    }
    setRound(r + 1);
  }, [level.rounds, level.n, onEvent, onLevelDone]);

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
    (key: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text: t(key), tone: "ok" });
      luego(advance, 1800);
    },
    [luego, advance, quiet],
  );

  /** Ganar. Cierra la ronda ya, y recién después muestra el cartel. */
  const win = useCallback(
    (key: string, delay = 0) => {
      if (cerrado.current) return;
      cerrado.current = true;
      if (delay <= 0) {
        succeed(key);
        return;
      }
      luego(() => succeed(key), delay);
    },
    [luego, succeed],
  );

  const correr = useCallback(() => {
    flow.value = 0;
    flow.value = withTiming(1, { duration: theme.motion.reveal });
  }, [flow]);

  // --- La palanca y la bola --------------------------------------------------

  /**
   * Tirar de la palanca. No es un intento: es cambiar de posición la máquina,
   * como pedir la tubería con un toque. Tirar dos veces deja todo como estaba y
   * el juego lo dice con un empujón, no con una explicación.
   */
  const pullLever = useCallback(() => {
    const { solved: hecho, back: alReves } = vivo.current;
    if (hecho || cerrado.current) return;
    quiet();
    setBack(!alReves);
    setFed(null);
    flow.value = 0;
    if (!alReves) say("lever");
    setMessage({
      text: t(alReves ? "inv.hint.leverForward" : "inv.hint.leverBack"),
      tone: "dim",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet, say]);

  /**
   * Meter una bola por la boca que está de entrada. Con la palanca derecha sale
   * cambiada; con la palanca girada, la bola cambiada vuelve idéntica a la
   * original, que sigue como sombra en la canasta.
   */
  const feed = useCallback(
    (valor: number) => {
      const { problem: p, ask: a, solved: hecho, back: alReves } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      setFed(valor);
      correr();

      if (a === "identity") {
        // La cadena de las dos: la bola atraviesa y sale como entró. No es la
        // respuesta de la ronda, es lo que la ronda deja ver.
        setMessage({ text: t("inv.hint.chainKeeps"), tone: "dim" });
        return;
      }
      if (a === "watch") {
        setMessage({ text: t(alReves ? "inv.hint.cameBack" : "inv.hint.cameOutChanged"), tone: "dim" });
        return;
      }
      if (a !== "lever") return;

      const maquina = alReves ? p.inverse : p.machine;
      if (!maquina) return;
      const vuelve = invRun(maquina, valor).output;
      const bien = vuelve === p.input;
      // Soltar la bola con la palanca derecha **no es un movimiento**: es la
      // ida, el paso que la ronda da por hecho, igual que llenar una sola
      // ranura no era media llave en el nodo 12. Contarlo como intento fallido
      // sería anotar en contra el único camino que lleva a la respuesta.
      if (alReves) attempt(bien);
      if (alReves && bien) {
        setReturned(true);
        say("returned");
        win("inv.done.lever", theme.motion.reveal);
        return;
      }
      if (!alReves) say("fed");
      setMessage({
        text: t(alReves ? "inv.hint.notTheSame" : "inv.hint.pullTheLeverNow"),
        tone: alReves ? "warn" : "dim",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, correr, quiet, win, say],
  );

  // --- Las fichas de respuesta -----------------------------------------------

  const pickOption = useCallback(
    (option: InvOption, index: number) => {
      const { problem: p, ask: a, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      setPicked(index);

      const error =
        a === "exists" && option.exists
          ? invMisconceptionFor(p.machine, option.exists)
          : a === "cut" && option.cut
            ? invMisconceptionForCut(p.machine, option.cut)
            : undefined;
      attempt(option.correct, error);

      if (option.correct) {
        if (a === "watch" || a === "predict") correr();
        say("picked");
        win(`inv.done.${a}`, a === "watch" || a === "predict" ? theme.motion.reveal : 0);
        return;
      }
      // Correr al revés la máquina que junta entradas saca las dos bolas: el
      // jugador ve la que se olvidó, y nadie le dice que estuvo mal.
      if (error) {
        setBack(true);
        correr();
      }
      setMessage({ text: t(mensajeDeError(a, option)), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, correr, quiet, win, say],
  );

  // --- El llavero de máquinas ------------------------------------------------

  /**
   * Probar una candidata. La que no corresponde **no se traba**: se engancha, la
   * bola sale distinta y queda al lado de la original. Por eso el veredicto es
   * uno solo —devolvió o no devolvió— y no hay ningún mensaje que diga
   * "incorrecto".
   */
  const tryCandidate = useCallback(
    (index: number) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      const cand = p.ring[index];
      if (!cand) return;
      quiet();
      setTried(cand);
      const bien = invRestores(p.machine, cand.machine, p.input);
      // Elegir del llavero la máquina que no deshace es lo que el documento
      // llama `wrong_inverse_choice`, y `misconceptions.yaml` **no apunta esa
      // entrada a este nodo**: el movimiento va sin campo.
      attempt(bien);
      const slot = keySlots[index];
      if (bien) {
        if (slot?.spin) slot.spin.value = withTiming(2 * Math.PI, { duration: theme.motion.morph });
        // La vuelta sube y cierra el circuito, y el objeto vuelve a su lugar.
        chestBack.value = withTiming(1, { duration: theme.motion.quick });
        chestOpen.value = withTiming(1, { duration: theme.motion.morph });
        say("picked");
        win("inv.done.ring");
        return;
      }
      jam.value = withSequence(
        withTiming(1, { duration: 90 }),
        withTiming(-1, { duration: 140 }),
        withTiming(0, { duration: 120 }),
      );
      // La flecha de vuelta arranca y no llega, y el objeto se asoma y vuelve.
      chestLeft.value = withTiming(1, { duration: theme.motion.quick });
      chestOpen.value = 0;
      chestOpen.value = withTiming(1, { duration: theme.motion.morph });
      setMessage({ text: t(`inv.lure.${cand.lure ?? "default"}`), tone: "warn" });
      luego(() => {
        setTried(null);
        chestLeft.value = withTiming(0, { duration: theme.motion.base });
        chestOpen.value = 0;
        if (slot) {
          slot.dx.value = withTiming(0, { duration: theme.motion.base });
          slot.dy.value = withTiming(0, { duration: theme.motion.base });
        }
      }, 1600);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, luego, quiet, win, say],
  );

  /** Soltar una candidata sobre la flecha de vuelta. El blanco es generoso. */
  const dropCandidate = useCallback(
    (index: number, x: number, y: number) => {
      const slot = keySlots[index];
      const destino = cl.diagram?.panels[0]?.up[0] ?? cl.diagram?.panels[0]?.hole;
      if (!destino) return;
      if (Math.hypot(x - destino.x, y - destino.y) > 110) {
        if (slot) {
          slot.dx.value = withTiming(0, { duration: theme.motion.base });
          slot.dy.value = withTiming(0, { duration: theme.motion.base });
        }
        // Un rechazo nunca es mudo: la máquina que vuelve dice adónde iba.
        setMessage({ text: t("inv.msg.dropOnArrow"), tone: "dim" });
        return;
      }
      const home = cl.keys[index] ?? { x: 0, y: 0 };
      if (slot) {
        slot.dx.value = withTiming(destino.x - home.x, { duration: theme.motion.quick });
        slot.dy.value = withTiming(destino.y - home.y, { duration: theme.motion.quick });
      }
      tryCandidate(index);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cl, tryCandidate],
  );

  // --- La hoja ---------------------------------------------------------------

  /** Tocar el rastro que queda del otro lado de la diagonal. */
  const pickCurve = useCallback(
    (index: number) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      const curva = p.curves[index];
      if (!curva) return;
      quiet();
      setPicked(index);
      attempt(curva.correct);
      if (curva.correct) {
        // La grilla se dobla y el rastro cae del otro lado, con los hilos
        // reflejados. El doblez es la consecuencia, no la pregunta.
        setFolded(true);
        say("picked");
        win("inv.done.fold", theme.motion.morph);
        return;
      }
      setMessage({ text: t(`inv.lure.${curva.lure ?? "default"}`), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win, say],
  );

  /** Tocar la gota que es el par dado vuelta. */
  const pickDrop = useCallback(
    (index: number) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      const gota = p.marked[index];
      if (!gota || !p.lit) return;
      quiet();
      setPicked(index);
      const bien = gota.x === p.lit.y && gota.y === p.lit.x;
      attempt(bien);
      if (bien) {
        say("picked");
        win("inv.done.swap");
        return;
      }
      setMessage({ text: t("inv.hint.otherDrop"), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win, say],
  );

  /**
   * La máquina plegada, pedida con un toque. Antes el nivel 7 la dejaba plegada
   * sin ningún gesto que la desplegara, y la guía pedía tocar el tablero para
   * nada. Mirar no es contestar: no cuenta como intento.
   */
  const desplegar = useCallback(() => {
    const { solved: hecho } = vivo.current;
    if (hecho || cerrado.current) return;
    quiet();
    unfold.value = withTiming(1, { duration: theme.motion.base });
    setMessage({ text: t("inv.msg.ghost"), tone: "dim" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet]);

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que el gesto necesita, en un solo valor compartido. El
   * `Gesture` se arma una sola vez: lo que cambia entre rondas viaja acá y no
   * en la clausura, porque un worklet captura el render en que se armó.
   */
  const geo = useSharedValue({
    activo: 0,
    /**
     * 1 la palanca del caño, 2 las curvas de la hoja, 3 las gotas marcadas, 4 la
     * máquina plegada que se pide, 5 la recta que se baja sobre la hoja.
     */
    modo: 0,
    desdeX: 0,
    desdeY: 0,
    boxes: [] as { x: number; y: number; w: number; h: number }[],
    puntos: [] as { x: number; y: number }[],
    curvas: [] as { x: number; y: number }[][],
    radio: 24,
    plegada: 0,
    /** Dónde empieza la hoja en el lienzo, y su escala para la recta. */
    hojaY: 0,
    cy: 0,
    uy: 1,
    y0: -6,
    y1: 6,
    /** 1 si el dedo empezó sobre la hoja y está bajando la recta. */
    barre: 0,
  });

  useEffect(() => {
    const carcasas = (pl.lanes[0]?.machines ?? [])
      .slice(0, Math.max(pipeConfig.lanes[0]?.machines.length ?? 0, 1))
      .map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }));
    const aLienzo = (p: InvPair): { x: number; y: number } => ({
      x: wl.sheet.cx + p.x * wl.sheet.ux,
      y: walkY + wl.sheet.cy - p.y * wl.sheet.uy,
    });

    // El blanco de una curva es la curva entera: se toca donde se la ve, y gana
    // la más cercana al dedo. Con el punto del medio como blanco, tocar una
    // curva lejos de su medio elegía otra.
    const curvas = ask === "fold" && !folded ? problem.curves.map((c) => c.points.map(aLienzo)) : [];
    const puntos = ask === "swap" ? problem.marked.map(aLienzo) : [];

    geo.value = {
      activo: solved ? 0 : 1,
      modo:
        ask === "lever" || ask === "watch" ? 1
        : ask === "fold" ? 2
        : ask === "swap" ? 3
        : ask === "exists" || ask === "cut" ? 5
        : level.onDemand ? 4
        : 0,
      desdeX: 0,
      desdeY: 0,
      boxes: carcasas,
      puntos,
      curvas,
      radio: Math.max(22, wl.touchR),
      plegada: level.onDemand ? 1 : 0,
      hojaY: walkY,
      cy: wl.sheet.cy,
      uy: wl.sheet.uy,
      y0: problem.window.y0,
      y1: problem.window.y1,
      barre: 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pl, wl, walkY, ask, folded, solved, problem, pipeConfig.lanes, level.onDemand]);

  const acciones = useRef({ pullLever, pickCurve, pickDrop, desplegar });
  acciones.current = { pullLever, pickCurve, pickDrop, desplegar };
  const alTirar = useCallback(() => acciones.current.pullLever(), []);
  const alTocarCurva = useCallback((i: number) => acciones.current.pickCurve(i), []);
  const alTocarGota = useCallback((i: number) => acciones.current.pickDrop(i), []);
  const alDesplegar = useCallback(() => acciones.current.desplegar(), []);

  /**
   * El gesto del lienzo. Sin `minDistance(0)`: con cero se activa en el mismo
   * instante en que el dedo se apoya y le gana la carrera al asa que hay encima.
   * Se cierra en `onFinalize` con un umbral de toque, que es el patrón de los
   * nodos 9 y 17. En la hoja del último nivel el arrastre baja la recta.
   */
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          const g = geo.value;
          geo.value = {
            ...g,
            desdeX: e.x,
            desdeY: e.y,
            barre: g.modo === 5 && g.activo === 1 && e.y >= g.hojaY ? 1 : 0,
          };
        })
        .onChange((e) => {
          const g = geo.value;
          if (g.modo !== 5 || g.barre !== 1) return;
          // La recta cae siempre en una altura entera: pasa justo por las gotas
          // y se ve cuántas toca, sin puntería.
          const h = Math.round((g.cy - (e.y - g.hojaY)) / Math.max(g.uy, 0.0001));
          sweep.value = Math.max(g.y0, Math.min(g.y1, h));
        })
        .onFinalize((e) => {
          const g = geo.value;
          if (!g.activo || g.modo === 0) return;
          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          if (g.modo === 5) {
            if (movido > TAP_SLOP) return;
            if (e.y < g.hojaY) {
              if (g.plegada === 1) runOnJS(alDesplegar)();
              return;
            }
            // Un toque sobre la hoja también lleva la recta ahí.
            const h = Math.round((g.cy - (e.y - g.hojaY)) / Math.max(g.uy, 0.0001));
            sweep.value = withTiming(Math.max(g.y0, Math.min(g.y1, h)), { duration: 160 });
            return;
          }
          if (movido > TAP_SLOP) return;
          if (g.modo === 4) {
            runOnJS(alDesplegar)();
            return;
          }
          if (g.modo === 1) {
            for (const b of g.boxes) {
              if (e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) {
                runOnJS(alTirar)();
                return;
              }
            }
            return;
          }
          if (g.modo === 2) {
            let mejor = -1;
            let cerca = Infinity;
            for (let c = 0; c < g.curvas.length; c++) {
              const pts = g.curvas[c];
              if (!pts) continue;
              for (let i = 0; i < pts.length; i++) {
                const a = pts[i];
                const b = pts[i + 1] ?? a;
                if (!a || !b) continue;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const largo = dx * dx + dy * dy;
                const u =
                  largo > 0
                    ? Math.max(0, Math.min(1, ((e.x - a.x) * dx + (e.y - a.y) * dy) / largo))
                    : 0;
                const d = Math.hypot(e.x - (a.x + u * dx), e.y - (a.y + u * dy));
                if (d < cerca) {
                  cerca = d;
                  mejor = c;
                }
              }
            }
            if (mejor >= 0 && cerca <= g.radio * 1.6) runOnJS(alTocarCurva)(mejor);
            return;
          }
          let mejor = -1;
          let cerca = Infinity;
          for (let i = 0; i < g.puntos.length; i++) {
            const p = g.puntos[i];
            if (!p) continue;
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d < cerca) {
              cerca = d;
              mejor = i;
            }
          }
          if (mejor < 0 || cerca > g.radio * 2.2) return;
          runOnJS(alTocarGota)(mejor);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Dónde soltó la bola de la bandeja, en coordenadas del lienzo. */
  const dropTray = useCallback(
    (index: number, x: number, y: number) => {
      const slot = traySlots[index];
      if (slot) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      }
      const lane = pl.lanes[0];
      if (!lane) return;
      if (Math.hypot(x - lane.mouth.x, y - lane.mouth.y) > 150) {
        // Un rechazo nunca es mudo: la bola que vuelve dice adónde iba.
        setMessage({ text: t("inv.msg.dropOnMouth"), tone: "dim" });
        return;
      }
      const { problem: p, back: alReves } = vivo.current;
      feed(alReves ? p.output : p.input);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pl.lanes, feed],
  );

  /** Tocar la bola hace lo mismo que arrastrarla hasta la boca. */
  const tapTray = useCallback(() => {
    const { problem: p, back: alReves } = vivo.current;
    feed(alReves ? p.output : p.input);
  }, [feed]);

  const accionesLlavero = useRef({ dropCandidate, tryCandidate });
  accionesLlavero.current = { dropCandidate, tryCandidate };
  const alSoltarLlave = useCallback((i: number, x: number, y: number) => {
    accionesLlavero.current.dropCandidate(i, x, y);
  }, []);
  const alTocarLlave = useCallback((i: number) => accionesLlavero.current.tryCandidate(i), []);

  // --- Qué señala la guía ----------------------------------------------------

  const conFichas = problem.options.length > 0;
  const conBandeja = (pipeConfig.trayItems ?? []).length > 0;
  /** Hay una fila de fichas debajo del lienzo: las respuestas o las cadenas escritas. */
  const conFila = conFichas || ask === "order";
  /** En qué punto del gesto de la palanca está la ronda, para señalar lo que falta. */
  const palanca: "feed" | "lever" | "back" = back ? "back" : fed === null ? "feed" : "lever";

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda: la bola de
   * la bandeja y la boca donde entra, la máquina con su palanca, la hoja con la
   * diagonal, el renglón escrito. Sale de la misma geometría con que las
   * escenas dibujan y se recalcula con cada movimiento. Las fichas y el botón
   * viven debajo del lienzo y la guía los rodea allá, con su propia luz.
   */
  // La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const id = shown.id;
    const around = (p: Pt, w: number, h: number): Rect => ({ x: p.x - w / 2, y: p.y - h / 2, w, h });
    const pad = (b: Rect, m: number): Rect => ({ x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m });
    const solo = (rs: readonly (Rect | null | undefined)[]): Focus => ({
      rings: rs.filter((r): r is Rect => r !== null && r !== undefined),
    });

    if (ask === "ring") {
      const panel = cl.diagram?.panels[0];
      const llavero = union(
        cl.keys.slice(0, problem.ring.length).map((p) => around(p, cl.keyW + 14, cl.keyH + 14)),
      );
      const columna = panel
        ? union([...panel.nodes.map((n) => around(n, 64, 44)), ...panel.up.map((n) => around(n, 70, 44))])
        : null;
      return solo([columna, llavero]);
    }

    if (conHoja) {
      const s = wl.sheet;
      const w = problem.window;
      const hoja: Rect = {
        x: s.cx + w.x0 * s.ux - 6,
        y: walkY + s.cy - w.y1 * s.uy - 6,
        w: (w.x1 - w.x0) * s.ux + 12,
        h: (w.y1 - w.y0) * s.uy + 12,
      };
      return solo([hoja]);
    }

    const lane = pl.lanes[0];
    if (!lane) return null;
    const bola = pl.tokenR * 3.2;
    const cajas = union(
      lane.machines
        .slice(0, Math.max(pipeConfig.lanes[0]?.machines.length ?? 0, 1))
        .map((b) => pad(b, 6)),
    );
    const cano = union([...(cajas ? [cajas] : []), around(lane.mouth, 44, 44), around(lane.spout, bola, bola)]);
    const salida = around(lane.spout, bola, bola);
    const renglon = pipeConfig.formula ? around(pl.formula, Math.min(width - 24, 340), 44) : null;

    if (ask === "lever") {
      const bandeja = pl.tray[0];
      const enBandeja = bandeja ? around(bandeja, pl.trayW + 12, pl.trayH + 12) : null;
      if (id === "look") return solo([enBandeja, cajas]);
      if (id === "reveal") return solo([salida]);
      // Lo que falta del gesto, no el paso que toca: si el jugador se adelantó,
      // la luz ya está en lo que sigue.
      if (palanca === "lever") return solo([cajas]);
      if (!bandeja) return solo([cano]);
      return { rings: [enBandeja ?? cano ?? salida, around(lane.mouth, 48, 48)], drag: { from: bandeja, to: lane.mouth } };
    }
    if (id === "reveal") return solo([ask === "name" || ask === "identity" ? renglon : salida]);
    if (ask === "name" || ask === "identity") return solo([cano, renglon]);
    return solo([cano]);
  }, [shown, ask, cl, problem, conHoja, wl, walkY, pl, pipeConfig, width, palanca]);

  /**
   * La fila de fichas y el botón de la palanca viven debajo del lienzo, y la
   * guía los rodea con su propio marco dorado. No se miden: la medida llegaba
   * por `onLayout`, que en web depende de que la página pinte, y sin ella la
   * fila quedaba sin señalar justo en el paso que la pide.
   */
  const fichasEnFoco = shown?.id === "pick" && conFila;
  const palancaEnFoco =
    shown !== undefined && ask === "lever" && shown.id !== "look" && shown.id !== "reveal" && palanca === "lever";

  // --- Pantalla --------------------------------------------------------------

  const fichasTexto = ask === "exists" || ask === "cut";
  const definicion = (
    <>
      {returned ? (
        <Text style={[styles.definition, estrecho && styles.definitionNarrow]}>{t("inv.identity.said")}</Text>
      ) : null}
      {level.definition ? (
        <Text style={[styles.definition, estrecho && styles.definitionNarrow]}>{t("inv.definition")}</Text>
      ) : null}
    </>
  );

  return (
    <View style={styles.root}>

      <Header
        title={`${t(`node.${NODE_INVERSE_FUNCTION}.name`)} · nivel ${level.n} de ${TOTAL_INV_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!conLeccion}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: las tres escenas viven adentro y la que
            no juega esta ronda se queda en opacidad cero. */}
        <Canvas style={{ width, height: sceneH }}>
          <PipeScene
            config={pipeConfig}
            layout={pl}
            flow={flow}
            lane={-1}
            jam={jam}
            hint={hint}
            demo={demo}
            unfold={unfold}
            appear={pipeAppear}
            pieces={machineSlots}
            trayPieces={traySlots}
            picked={-1}
          />
          <Group transform={[{ translateY: walkY }]}>
            <WalkScene
              config={walkCfg}
              layout={wl}
              at={walkerAt}
              height={walkerY}
              sweep={sweep}
              hint={hint}
              demo={quieto}
              picked={picked}
              appear={walkAppear}
            />
          </Group>
          <ChestScene
            problem={chestProblem}
            level={chestLevel}
            layout={cl}
            pos={quieto}
            open={chestOpen}
            outArrow={chestAppear}
            backArrow={chestBack}
            leftover={chestLeft}
            jam={jam}
            hint={hint}
            demo={demo}
            clock={quieto}
            ruler={quieto}
            line={quieto}
            appear={chestAppear}
            mounted={-1}
            at={0}
            picked={-1}
            composed={null}
            placed={null}
            keys={keySlots}
            tiles={tileSlots}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={pan}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Las asas invisibles sobre las piezas dibujadas. Siempre montadas: una
            ronda que las desmonta deja al detector de la siguiente sin
            enganchar, y el arrastre se pierde sin decir nada. */}
        {Array.from({ length: PIPE_TRAY_SLOTS }, (_, i) => (
          <Handle
            key={`t${i}`}
            index={i}
            spot={pl.tray[i] ?? { x: 0, y: 0 }}
            slot={traySlots[i] as PipeSlot}
            w={pl.trayW}
            h={pl.trayH}
            enabled={conBandeja && i === 0 && !solved}
            onDrop={dropTray}
            onTap={tapTray}
          />
        ))}

        {Array.from({ length: INV_RING_SLOTS }, (_, i) => (
          <KeyHandle
            key={`k${i}`}
            index={i}
            spot={cl.keys[i] ?? { x: 0, y: 0 }}
            slot={keySlots[i] as Slot}
            w={cl.keyW}
            h={cl.keyH}
            enabled={ask === "ring" && i < problem.ring.length && !solved}
            onDrop={alSoltarLlave}
            onTap={alTocarLlave}
          />
        ))}

        {/* La luz de la guía, encima de todo y sin llevarse ningún toque. */}
        <Spotlight focus={focus} />
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* En un teléfono la definición va antes de las fichas: así las fichas,
          angostas y centradas, quedan abajo y lejos del rincón de Tomi, y la
          definición puede usar el ancho entero. */}
      {estrecho ? definicion : null}

      {/* La palanca, escrita, para quien no encuentre la máquina con el dedo.
          Es el mismo movimiento que tocar la carcasa. */}
      {ask === "lever" && !solved ? (
        <Marco on={palancaEnFoco}>
          <View style={styles.ring}>
            <Pressable onPress={pullLever} style={[styles.chip, styles.chipTall]}>
              <Text style={styles.chipLabel}>{t(back ? "inv.lever.forward" : "inv.lever.back")}</Text>
            </Pressable>
          </View>
        </Marco>
      ) : null}

      {conFila ? (
        <Marco on={fichasEnFoco}>
        <View style={[styles.ring, estrecho && styles.ringNarrow]}>
          {conFichas
            ? problem.options.map((option, i) => (
                <Pressable
                  key={option.id}
                  disabled={solved}
                  onPress={() => pickOption(option, i)}
                  style={[
                    styles.chip,
                    fichasTexto ? styles.chipText : styles.chipTall,
                    fichasTexto && estrecho && styles.chipTextNarrow,
                    solved && styles.chipDim,
                    picked === i && styles.chipOn,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      fichasTexto && styles.chipLabelText,
                      fichasTexto && estrecho && styles.chipLabelNarrow,
                    ]}
                  >
                    {etiqueta(ask, option, level.numerals)}
                  </Text>
                </Pressable>
              ))
            : // Las cadenas candidatas del nivel de dos pasos: se leen escritas,
              // que es lo que la capa simbólica pide.
              problem.ring.map((cand, i) => (
                <Pressable
                  key={cand.id}
                  disabled={solved}
                  onPress={() => tryCandidate(i)}
                  style={[styles.chip, styles.chipTall, styles.wide, solved && styles.chipDim]}
                >
                  <Text style={styles.chipLabel}>{composeText(invRuleOf(cand.machine))}</Text>
                </Pressable>
              ))}
        </View>
        </Marco>
      ) : null}

      {estrecho ? null : definicion}
    </View>
  );
}

/**
 * El marco dorado de la guía alrededor de una fila de botones: el mismo anillo
 * que la guía dibuja sobre el lienzo, latiendo igual, pero puesto alrededor de
 * la fila en vez de medido. El borde está siempre y solo se enciende: si
 * apareciera, la fila saltaría de lugar justo cuando hay que tocarla.
 */
function Marco({ on, children }: { readonly on: boolean; readonly children: ReactNode }) {
  const k = useSharedValue(0);
  useEffect(() => {
    if (!on) {
      cancelAnimation(k);
      k.value = withTiming(0, { duration: theme.motion.quick });
      return;
    }
    k.value = 0.6;
    k.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(k);
  }, [on, k]);
  const luz = useAnimatedStyle(() => ({ opacity: k.value }));
  return (
    <View style={styles.marco}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.marcoLuz, luz, { pointerEvents: "none" }]} />
      {children}
    </View>
  );
}

/** El rectángulo que abraza a todos: para señalar una fila de piezas con un solo anillo. */
function union(rs: readonly Rect[]): Rect | null {
  if (rs.length === 0) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of rs) {
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * La regla de una candidata, escrita sobre la bola que le llega. El argumento es
 * `y` y no `x` porque lo que entra en la máquina de vuelta es la salida de la de
 * ida. Los paréntesis los pone el modelo, que es el que sabe en qué orden los
 * pasos tocan la bola: escribirlos acá sería una segunda fuente de verdad sobre
 * el orden, que es justamente lo que este nivel evalúa.
 */
const invRuleOf = (m: InvMachine): readonly InvPiece[] =>
  invRulePieces(m, [{ kind: "sym", name: "y" }]);

/**
 * Qué dice cada ficha, según lo que la ronda pregunte.
 *
 * Antes de que el nodo escriba números, una bola se dice en puntitos y la
 * máquina trabada con la cruz del candado tachado del nodo 12: los tres
 * primeros niveles se juegan sin leer, y una ficha con una palabra adentro los
 * dejaría afuera.
 */
function etiqueta(ask: string, option: InvOption, numerals: boolean): string {
  if (ask === "exists") return t(`inv.exists.${option.exists ?? "yes"}`);
  if (ask === "cut") return t(`inv.cut.${option.cut ?? "none"}`);
  if (ask === "predict" && option.ending === "jam") return "×";
  if (numerals) return composeText(option.pieces);
  return puntitos(option.pieces);
}

/** Una bola dicha en puntitos, que es como el nodo 12 dice un número sin escribirlo. */
function puntitos(pieces: readonly InvPiece[]): string {
  const numero = pieces.find((p) => p.kind === "num");
  if (!numero || numero.kind !== "num") return composeText(pieces);
  return "•".repeat(Math.max(1, Math.min(Math.abs(numero.value), 12)));
}

/** El empujón que recibe una ficha que no era. Nunca dice "incorrecto". */
function mensajeDeError(ask: string, option: InvOption): string {
  if (ask === "exists" || ask === "cut") return `inv.why.${option.exists ?? option.cut ?? "none"}`;
  // El final que traba la máquina es cierto, pero de otra máquina: la de este
  // nivel no junta dos entradas, y el jugador lo va a ver en el último.
  if (option.ending === "jam") return "inv.why.jam";
  if (option.lure) return `inv.lure.${option.lure}`;
  return "inv.lure.default";
}

/**
 * Las ranuras animadas de las piezas que el dedo puede llevar. Son siempre las
 * mismas: montar y desmontar ranuras entre rondas deja al detector de la
 * siguiente sin enganchar, y el arrastre se pierde sin decir nada.
 */
function useSlots(n: number): readonly PipeSlot[] {
  const dx0 = useSharedValue(0);
  const dy0 = useSharedValue(0);
  const a0 = useSharedValue(1);
  const dx1 = useSharedValue(0);
  const dy1 = useSharedValue(0);
  const a1 = useSharedValue(1);
  const dx2 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const a2 = useSharedValue(1);
  const dx3 = useSharedValue(0);
  const dy3 = useSharedValue(0);
  const a3 = useSharedValue(1);
  return useMemo(
    () =>
      [
        { dx: dx0, dy: dy0, alive: a0 },
        { dx: dx1, dy: dy1, alive: a1 },
        { dx: dx2, dy: dy2, alive: a2 },
        { dx: dx3, dy: dy3, alive: a3 },
      ].slice(0, n),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n],
  );
}

/** Lo mismo, con el giro: una máquina que deshace se ve girar entera. */
function useKeySlot(): Slot {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const alive = useSharedValue(0);
  const spin = useSharedValue(0);
  return useMemo(() => ({ dx, dy, alive, spin }), [dx, dy, alive, spin]);
}

/**
 * Un asa invisible sobre la pieza dibujada: el dibujo es Skia, el gesto es la
 * vista.
 *
 * El objeto del `Gesture` se arma con la ranura y el índice y no vuelve a
 * cambiar de identidad, y el asa **se queda montada** aunque su pieza no juegue
 * esta ronda: desmontarla deja al detector de la ronda siguiente sin enganchar.
 * Lo que decide si el dedo llega es `pointerEvents`, que no toca el gesto.
 */
function Handle({
  index,
  slot,
  spot,
  w,
  h,
  enabled,
  onDrop,
  onTap,
}: {
  readonly index: number;
  readonly slot: PipeSlot;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, x: number, y: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const datos = useSharedValue({ x: spot.x, y: spot.y, activo: enabled ? 1 : 0 });
  useEffect(() => {
    datos.value = { x: spot.x, y: spot.y, activo: enabled ? 1 : 0 };
  }, [datos, spot.x, spot.y, enabled]);

  const vivos = useRef({ onDrop, onTap });
  vivos.current = { onDrop, onTap };
  const soltar = useCallback((i: number, x: number, y: number) => {
    vivos.current.onDrop(i, x, y);
  }, []);
  const tocar = useCallback((i: number) => {
    vivos.current.onTap(i);
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          if (!datos.value.activo) return;
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        // `onFinalize` y no `onEnd`: si otro gesto le gana la carrera a mitad
        // del arrastre, el asa se cancela y `onEnd` no llega nunca.
        .onFinalize((e) => {
          const d = datos.value;
          if (!d.activo) return;
          if (Math.hypot(e.translationX, e.translationY) < TAP_SLOP) {
            slot.dx.value = withTiming(0, { duration: theme.motion.quick });
            slot.dy.value = withTiming(0, { duration: theme.motion.quick });
            runOnJS(tocar)(index);
            return;
          }
          // Dónde quedó la pieza, en coordenadas del lienzo. Sale de dónde
          // estaba más cuánto se movió, y no de la posición absoluta del dedo:
          // `onLayout` en web devuelve el origen del padre y dejaría el hit test
          // corrido por la altura del encabezado.
          runOnJS(soltar)(index, d.x + e.translationX, d.y + e.translationY);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - Math.max(w, 1) / 2,
          top: spot.y - Math.max(h, 1) / 2,
          width: Math.max(w, 1),
          height: Math.max(h, 1),
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

/** El mismo asa, sobre las llaves del cofre, que llevan su propia ranura. */
function KeyHandle({
  index,
  slot,
  spot,
  w,
  h,
  enabled,
  onDrop,
  onTap,
}: {
  readonly index: number;
  readonly slot: Slot;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, x: number, y: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const datos = useSharedValue({ x: spot.x, y: spot.y, activo: enabled ? 1 : 0 });
  useEffect(() => {
    datos.value = { x: spot.x, y: spot.y, activo: enabled ? 1 : 0 };
  }, [datos, spot.x, spot.y, enabled]);

  const vivos = useRef({ onDrop, onTap });
  vivos.current = { onDrop, onTap };
  const soltar = useCallback((i: number, x: number, y: number) => {
    vivos.current.onDrop(i, x, y);
  }, []);
  const tocar = useCallback((i: number) => {
    vivos.current.onTap(i);
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          if (!datos.value.activo) return;
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        .onFinalize((e) => {
          const d = datos.value;
          if (!d.activo) return;
          if (Math.hypot(e.translationX, e.translationY) < TAP_SLOP) {
            runOnJS(tocar)(index);
            return;
          }
          runOnJS(soltar)(index, d.x + e.translationX, d.y + e.translationY);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - Math.max(w, 1) / 2,
          top: spot.y - Math.max(h, 1) / 2,
          width: Math.max(w, 1),
          height: Math.max(h, 1),
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  ring: {
    flexDirection: "row",
    gap: theme.space[3],
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: theme.space[3],
  },
  // Sin alto fijo: una ficha con una frase adentro tiene que poder crecer, y en
  // web un `height: undefined` posterior no pisa el alto de la base.
  chip: {
    minWidth: 92,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.token,
    ...chipFace,
    alignItems: "center",
    justifyContent: "center",
  },
  // Las fichas con una frase adentro crecen hacia abajo en vez de cortarla: en
  // un teléfono, "Solo las entradas de este lado del cero" no entra en una línea.
  chipTall: { height: 58 },
  chipText: { minHeight: 58, maxWidth: 320, paddingVertical: theme.space[2] },
  wide: { minWidth: 132 },
  chipOn: { borderColor: theme.color.accent },
  chipDim: { opacity: 0.35 },
  chipLabel: { color: theme.color.ink, fontSize: 18 },
  chipLabelText: { fontSize: 16, textAlign: "center" },
  // En un teléfono las tres respuestas escritas van una debajo de la otra: más
  // bajas y con la letra un punto más chica, para que entren las tres.
  // De a dos por fila: una debajo de la otra, la tercera terminaba debajo del
  // borde y encima de Tomi. Una frase larga se parte en dos renglones.
  chipTextNarrow: { minHeight: 40, maxWidth: 176, minWidth: 0, paddingVertical: 4 },
  chipLabelNarrow: { fontSize: 14 },
  ringNarrow: { gap: theme.space[2] },
  // Y la definición deja libre el rincón de abajo a la izquierda, que es de Tomi.
  definitionNarrow: { fontSize: 12 },
  marco: { borderRadius: theme.radius.panel, padding: theme.space[1] },
  marcoLuz: {
    borderRadius: theme.radius.panel,
    borderWidth: 2.5,
    borderColor: theme.color.gold,
    backgroundColor: "rgba(255, 209, 102, 0.07)",
    shadowColor: theme.color.gold,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  definition: {
    color: theme.color.inkDim,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 520,
    paddingHorizontal: theme.space[3],
  },
});
