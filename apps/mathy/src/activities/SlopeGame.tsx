/**
 * La rampa del caminante: el minijuego de `alg.fn.linear_slope`.
 *
 * El jugador viene del nodo 18 sabiendo dibujar el rastro de una máquina. Acá
 * aprende a resumir un rastro recto en un número, y el salto del nodo es que ese
 * número **no se calcula: se conserva**. La pendiente es lo único de la rampa
 * que no cambia cuando cambia el escalón con que se la mide.
 *
 * Que la razón no cambie no se dice, se muestra en cuatro lugares:
 *
 * - el **color del escalón** sale de la razón y de nada más, así que arrastrarlo
 *   a otro lugar de la rampa no le cambia el color;
 * - **estirarlo** pide subir la esquina en proporción, y un vertical que no
 *   corresponde lo deja despegado de la rampa con una sombra donde apoyaba: la
 *   consecuencia es física y nadie dice "incorrecto";
 * - la **escalera** de escalones iguales dibuja la misma cuesta en todo el
 *   recorrido, y los dos escalones de anchos distintos miden lo mismo;
 * - **estirar la grilla** sí cambia el color, porque cambió la grilla: la
 *   pendiente es propiedad del par recta y grilla y no del dibujo suelto.
 *
 * La escena es `WalkScene`, que el nodo 18 estrenó para la mecánica y que traía
 * el eje `step` apagado esperando a este nodo; su porqué está en su cabecera.
 * La manivela del costado es `TrackScene`: recibe una configuración y ya.
 * **Ninguna altura se calcula acá**: las resuelve `@mathy/mechanics` y la
 * pantalla las dibuja, o habría dos fuentes de verdad sobre qué es empinado.
 *
 * **Un solo gesto para todo el lienzo**, armado una vez por nivel. Al apoyar el
 * dedo decide qué agarró (la esquina del escalón, la manivela, una perilla, el
 * escalón) leyendo la geometría de la ronda de un valor compartido, y mientras
 * se mueve lee la posición **absoluta** del dedo, nunca la traslación: así el
 * escalón sigue al dedo aunque el gesto se active tarde, y un toque sobre la
 * perilla o la manivela también responde, que con el mouse es lo natural. Antes
 * había un asa por cosa, nacida deshabilitada en las rondas que no la usaban: en
 * web un gesto así no despierta nunca (trampa 33), y la segunda pregunta de los
 * niveles 4, 5 y 6 quedaba imposible.
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
import {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  NODE_LINEAR_SLOPE,
  SL_OPTION_SLOTS,
  TOTAL_SL_LEVELS,
  generateSlope,
  slBetween,
  slHeightAt,
  slMisconceptionFor,
  slReduce,
  slRests,
  slSameRatio,
  slSlopeOfWritten,
  slStepOn,
  slStretchMisconceptionFor,
  slTrace,
  slValue,
  slVisibleRange,
  type GpCurve,
  type GpPoint,
  type SlAsk,
  type SlLevel,
  type SlRamp,
  type SlRatio,
  type SlStep,
  type SlWritten,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  WalkScene,
  walkLayout,
  walkNumeral,
  walkPx,
  walkPy,
  walkTextPath,
  type WalkConfig,
  type WalkStep,
} from "../scenes/WalkScene.tsx";
import { TOOTH_ANGLE, TrackScene, trackLayout, type TrackConfig } from "../scenes/TrackScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { SLOPE_MSG } from "../lessons/slope.ts";
import { t } from "../i18n.ts";
import { play } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";
import { chipFace, toggleFace } from "../ui/Kit.tsx";
import { ChipBodies } from "../ui/ChipBodies.tsx";

/** Alto de la banda donde vive la manivela de `gears_sequence`. */
const CRANK_H = 104;
/** Alto de la banda con una perilla: la de la grilla. */
const ONE_ROW_H = 64;
/**
 * Alto de la banda con las dos perillas de la `m` y la `b`. Separadas 44 px:
 * a 22, como estaban, el dedo que iba a una agarraba la otra.
 */
const TWO_ROWS_H = 100;
/** Alto de la fila de fichas. */
const CHIPS_H = 72;
/** Cuánto se puede estirar la grilla. */
const MAX_STRETCH = 4;
/** Hasta dónde llega la perilla de arranque. */
const MAX_B = 4;
/** El riel de las perillas deja lugar a la izquierda para la letra que las nombra. */
const RAIL_L = 64;
const RAIL_R = 36;

// Qué agarró el dedo. Números y no textos: el gesto corre en el hilo de la interfaz.
const NADA = 0;
const ESCALON = 1;
const ESQUINA = 2;
const ANCHO = 3;
const MANIVELA = 4;
const PERILLA = 5;

export interface SlopeGameProps {
  readonly level: SlLevel;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function SlopeGame(props: SlopeGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

/**
 * La geometría de la ronda que el gesto lee en el hilo de la interfaz. Todo en
 * coordenadas del lienzo, que son las del dedo: el detector envuelve al lienzo.
 */
interface Geo {
  /** El escalón se arrastra entero (`place_step`). */
  readonly place: number;
  /** Las esquinas del escalón se arrastran (`stretch_step`). */
  readonly corner: number;
  /** La manivela gira (`crank`). */
  readonly crank: number;
  readonly cx: number;
  readonly ux: number;
  readonly uy: number;
  /** El estirado de la grilla: una unidad de avance mide `ux · k` píxeles. */
  readonly k: number;
  readonly walkTop: number;
  readonly walkBottom: number;
  readonly from: number;
  readonly run: number;
  readonly leftX: number;
  readonly rightX: number;
  readonly baseY: number;
  readonly topY: number;
  readonly kx: number;
  readonly ky: number;
  readonly kr: number;
  /** Las perillas, de a cinco números: y, izquierda, derecha, pasos, valor. */
  readonly rows: readonly number[];
}

/** Una fila de perilla: el riel, cuántos pasos tiene y en cuál está. */
interface Fila {
  readonly y: number;
  readonly left: number;
  readonly right: number;
  readonly steps: number;
  readonly value: number;
  readonly label: string;
}

function Activity({ level, onLevelDone, onEvent }: SlopeGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  const conLeccion = lesson?.lesson !== undefined;
  const narrow = width < 600;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateSlope(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );

  /**
   * Con lección, el cartel dice qué hacer y la línea de abajo queda para lo que
   * pasó. En los niveles que alternan dos preguntas el cartel las nombra a las
   * dos, y la línea dice cuál toca en esta ronda.
   */
  const opening = useCallback(
    (ask: SlAsk): string => (conLeccion && level.asks.length === 1 ? "" : t(openingKey(ask))),
    [conLeccion, level.asks.length],
  );

  const [x0, x1] = problem.xRange;
  const alcance = level.params.yReach;

  // --- Lo que el jugador mueve -----------------------------------------------

  /** Dónde apoya el escalón y cuánto avanza. */
  const [from, setFrom] = useState(problem.step.from);
  const [run, setRun] = useState(problem.step.run);
  /** La subida forzada, o `null` cuando el escalón apoya como corresponde. */
  const [rise, setRise] = useState<number | null>(null);
  /** El estirado de la grilla. */
  const [stretch, setStretch] = useState(1);
  /** Las dos perillas, independientes: inclinación y arranque. */
  const [mIdx, setMIdx] = useState(0);
  const [bIdx, setBIdx] = useState(0);
  /** Los lugares donde el escalón ya apoyó, contando el de salida. */
  const [visited, setVisited] = useState<readonly number[]>([problem.step.from]);
  /** Cuántos dientes giró la manivela en esta ronda. */
  const [turns, setTurns] = useState(0);
  const [picked, setPicked] = useState(-1);
  const [ghostOn, setGhostOn] = useState(false);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: opening(problem.ask),
    tone: "dim",
  }));

  /**
   * Espejos síncronos de lo que el arrastre cambia. Un arrastre llama varias
   * veces antes de que React vuelva a dibujar, y comparar contra el estado
   * dejaría pasar dos veces el mismo valor o perdería el anterior.
   */
  const fromRef = useRef(problem.step.from);
  const runRef = useRef(problem.step.run);
  const riseRef = useRef<number | null>(null);
  const turnsRef = useRef(0);
  const mRef = useRef(0);
  const bRef = useRef(0);
  const solvedRef = useRef(false);

  // --- La rampa que se dibuja ------------------------------------------------

  /** Las cuestas que la perilla de inclinación recorre. */
  const cuestas = useMemo(() => slopeChoices(level.params.maxSlope, level.params.negative), [level]);

  /**
   * La rampa de la pantalla. Con las perillas puestas la arman ellas y no el
   * problema: moverlas **es** cambiar la rampa, y leerla del problema dejaría
   * las perillas dibujando algo que no mueven.
   */
  const ramp = useMemo<SlRamp>(() => {
    if (problem.ask !== "set_sliders") return problem.ramp;
    return { slope: cuestas[mIdx] ?? { rise: 1, run: 1 }, intercept: bIdx };
  }, [problem.ask, problem.ramp, cuestas, mIdx, bIdx]);

  const conRampa = problem.ramps.length > 0 && problem.ask !== "read_form";
  const eligeRampa = problem.ask === "pick_ramp" || problem.ask === "which_harder";

  /** El rastro de la rampa, ya recortado contra la ventana por el modelo. */
  const trace = useMemo(() => slTrace(ramp, x0, x1, alcance), [ramp, x0, x1, alcance]);

  /** Los rastros que se dibujan: uno, o los dos que se comparan en el final. */
  const traces = useMemo(() => {
    if (!conRampa || eligeRampa) return [];
    if (problem.ask === "judge_slope" && problem.ramps.length === 2) {
      return problem.ramps.map((r, i) => slTrace(r, x0, x1, alcance, `r${i}`));
    }
    return [trace];
  }, [conRampa, eligeRampa, problem.ask, problem.ramps, trace, x0, x1, alcance]);

  /** Las rampas candidatas, dibujadas como curvas para poder elegirlas tocando. */
  const candidatas = useMemo<readonly GpCurve[]>(() => {
    if (!eligeRampa) return [];
    return problem.ramps.map((r, i) => {
      const [lo, hi] = slVisibleRange(r, x0, x1, alcance);
      const points: GpPoint[] = [];
      for (let x = lo; x <= hi; x++) points.push({ x, y: slHeightAt(r, x) });
      return { id: `c${i}`, points, closed: false };
    });
  }, [eligeRampa, problem.ramps, x0, x1, alcance]);

  const [pie, techo] = useMemo(
    () => slVisibleRange(ramp, x0, x1, alcance),
    [ramp, x0, x1, alcance],
  );

  /**
   * El escalón tal como está ahora. La subida viaja solo cuando el dedo la
   * forzó: sin ella, la escena la saca del rastro y el escalón apoya.
   */
  const escalon = useMemo<WalkStep>(
    () => ({ from, run, ...(rise === null ? {} : { rise }) }),
    [from, run, rise],
  );
  const escalonReal = useMemo<SlStep>(
    () => ({ from, run, rise: rise ?? slStepOn(ramp, from, run).rise }),
    [ramp, from, run, rise],
  );

  /**
   * La cuesta que el escalón muestra. Con la grilla estirada, el avance medido
   * contra la regla es el del dibujo multiplicado por el factor: la recta es la
   * misma y la cuesta que se lee, no.
   */
  const cuesta = useMemo<SlRatio>(
    () => slReduce({ rise: ramp.slope.rise, run: ramp.slope.run * stretch }),
    [ramp.slope, stretch],
  );

  // --- Medidas ---------------------------------------------------------------

  /**
   * El alto que de verdad le queda al lienzo, medido, como en los cuencos. Como
   * fracción de la ventana, en un teléfono la línea de abajo y las respuestas
   * del nivel final quedaban fuera de pantalla.
   */
  //
  // Medido, el lienzo no pasa del alto de la zona: con un piso fijo, en el
  // teléfono se salía hacia arriba, y como su vista va después del cartel en el
  // árbol, se quedaba con los toques del botón de la guía.
  const [areaH, setAreaH] = useState(0);
  const estimado = height * (conLeccion ? 0.5 : 0.62);
  const sceneH = areaH > 0 ? Math.min(areaH, 560) : Math.max(260, Math.min(estimado, 560));

  // Las bandas se deciden al empezar la ronda y no cambian mientras se juega:
  // si el alto cambiara a mitad de ronda, la rampa se movería debajo del dedo.
  // Las perillas y las fichas nunca están en la misma ronda, así que comparten
  // banda.
  //
  // La manivela va arriba de la rampa o a su lado. La hoja es cuadrada, y en
  // una pantalla ancha le sobra ancho y le falta alto: apilada con la manivela y
  // la perilla, en una ventana de escritorio con la guía abierta la rampa
  // quedaba de 12 píxeles por paso. Al lado, la manivela usa el ancho que sobra;
  // en el teléfono, que es angosto y alto, va arriba, y solo en las rondas de
  // manivela, como la perilla de la grilla solo en las suyas: las dos a la vez
  // le dejaban a la hoja el mismo pedazo de 12 píxeles.
  const side = level.crank && width >= 700;
  const sideW = side ? Math.round(Math.min(width * 0.42, 440)) : 0;
  const crankH = level.crank && !side && problem.ask === "crank" ? CRANK_H : 0;
  const slidersH = level.asks.includes("set_sliders")
    ? TWO_ROWS_H
    : problem.ask === "stretch_grid"
      ? ONE_ROW_H
      : 0;
  const chipsH = level.asks.some(
    (a) => a === "slope_between" || a === "read_form" || a === "pick_ramp",
  )
    ? CHIPS_H
    : 0;
  const controlsH = Math.max(slidersH, chipsH);
  const walkH = sceneH - crankH - controlsH;
  const controlsTop = crankH + walkH;
  const chipsY = controlsTop + controlsH / 2;

  /**
   * Qué pedazo de plano se ve. La ventana no se estira para que la rampa entre:
   * `WalkScene` la dibuja cuadrada y el modelo ya recortó lo que se sale, porque
   * una unidad de alto más chica que una de ancho volvería suave a la rampa más
   * empinada, que es lo único que este nodo no puede permitirse.
   */
  const window0 = useMemo(
    () => ({
      x0: x0 - 0.5,
      x1: x1 + 0.5,
      // La hoja se abre hacia abajo recién cuando la rampa puede bajar. Antes
      // sería medio dibujo vacío, y con la grilla cuadrada eso le come el ancho
      // a la parte que sí se usa.
      y0: level.params.negative ? -alcance - 0.5 : -1.5,
      y1: alcance + 0.5,
    }),
    [x0, x1, alcance, level.params.negative],
  );

  const walkCfg = useMemo<WalkConfig>(() => {
    const conEscalon =
      conRampa &&
      problem.ask !== "crank" &&
      problem.ask !== "judge_slope" &&
      !eligeRampa;
    const fantasma = ghostRetirado(level, problem.ask, ghostOn);
    const conRenglon =
      level.tiles && conRampa && problem.ask !== "slope_between" && problem.ask !== "judge_slope";
    return {
      window: window0,
      square: true,
      // La ronda de las rectas escritas se juega sin dibujo: una cuadrícula
      // detrás de las ecuaciones invita a leer una pendiente que no está.
      grid: problem.ask !== "read_form",
      quadrants: level.params.negative,
      // La rampa es la recta sobre la grilla: no hay un terreno aparte del
      // rastro, que es justo lo que el nodo 18 dejó separado y este no necesita.
      ground: "hidden",
      terrain: null,
      traces,
      mainTrace: 0,
      // Con pendiente fraccionaria las alturas no caen en la grilla: dibujar las
      // gotas diría que sí, y la fraccionaria es lo que retira la analogía.
      drops: !level.params.fractional && problem.ask !== "read_form" && !fantasma,
      // La rampa retirada se pide con un toque. El rastro sigue montado porque
      // de él salen las alturas del escalón; lo que se apaga es la línea, así
      // que el jugador mide con dos puntos y no leyendo el dibujo.
      line: !fantasma,
      walker: level.walker && !fantasma ? "sheet" : "none",
      ink: false,
      lit: null,
      threads: false,
      label: false,
      marked: problem.points as readonly GpPoint[],
      options: candidatas,
      // La vertical no es una rampa y el modelo no la puede guardar como tal:
      // llega como los dos extremos de su recta y se dibuja como curva.
      curve:
        problem.kase === "vertical" && problem.ask === "judge_slope" && problem.points.length === 2
          ? { id: "v", points: problem.points, closed: false }
          : null,
      verticalLine: false,
      step: conEscalon ? escalon : null,
      stepColor: colorFor(cuesta),
      stepMarks: !level.deltas,
      stepText: level.deltas && conEscalon ? stepText(escalonReal, stretch, level.tiles) : null,
      ghostStep: problem.ask === "stretch_step" && problem.other ? problem.other : null,
      // La escalera acompaña al escalón que se apoya, no al que se estira: ahí
      // el objeto con el que se compara es el segundo escalón, y dos escaleras
      // del mismo ancho encima de él lo taparían.
      stairs:
        level.stairs && conRampa && problem.ask !== "crank" && problem.ask !== "stretch_step"
          ? { from: pie, run: Math.max(1, run), count: Math.max(1, Math.floor((techo - pie) / Math.max(1, run))) }
          : null,
      stretch,
      diagonal: false,
      asymptote: null,
      // El escalón deja de ser un triángulo y pasa a ser un escalón cuando hay
      // escalera, y se contrae en la razón cuando llegan las fichas.
      skin: level.tiles ? "slope_ratio" : level.stairs ? "staircase" : "rise_run_triangle",
      numerals: true,
      axisLabels: level.tiles,
      // El renglón acompaña a las perillas, que son las que lo mueven. En la
      // ronda que pregunta cuánto vale la pendiente sería la respuesta escrita
      // bajo la rampa. Un espacio en blanco, y no nada, en las rondas sin
      // renglón de un nivel que lo tiene: así la hoja guarda el mismo lugar abajo
      // y no se corre de una ronda a la otra.
      legend: conRenglon ? lineText(ramp) : level.tiles ? " " : "",
    };
  }, [
    window0,
    level,
    problem,
    traces,
    candidatas,
    conRampa,
    eligeRampa,
    escalon,
    escalonReal,
    cuesta,
    stretch,
    ramp,
    pie,
    techo,
    run,
    ghostOn,
  ]);

  const wl = useMemo(
    () => walkLayout(walkCfg, width - sideW, walkH),
    [walkCfg, width, sideW, walkH],
  );
  const sh = wl.sheet;

  // --- La manivela de `gears_sequence` ---------------------------------------

  /**
   * El soporte con su manivela. Cada diente avanza una casilla, que es la misma
   * casilla que el paso del caminante: por eso las dos agujas salen del mismo
   * número de dientes. Apilada, la pista arranca después de la manivela: en una
   * banda de este alto las dos quedan a la misma altura y en el teléfono se
   * pisaban. Al lado de la rampa, la pista va más arriba y la manivela abajo.
   */
  const trackCfg = useMemo<TrackConfig>(
    () => ({
      slots: Math.max(2, Math.min(techo - pie, 8) + 1),
      skin: "mark",
      railRows: [side ? 0.4 : 0.52],
      numerals: "plain",
      zeroDot: true,
      walker: true,
      crank: true,
      railAfterCrank: !side,
      flag: { at: problem.turns, pulse: true },
    }),
    [techo, pie, problem.turns, side],
  );
  const tl = useMemo(
    () => trackLayout(trackCfg, side ? sideW : width, Math.max(side ? walkH : crankH, 1)),
    [trackCfg, side, sideW, width, walkH, crankH],
  );
  const maxTurns = trackCfg.slots - 1;

  // --- Lo que se anima -------------------------------------------------------

  const at = useSharedValue(pie);
  const walkerY = useSharedValue(0);
  const sweep = useSharedValue(0);
  const hint = useSharedValue(1);
  const demo = useSharedValue(0);
  const appear = useSharedValue(1);
  const pos = useSharedValue(0);
  /** Un cero compartido, para las agujas que las escenas piden y este nodo no mueve. */
  const quieto = useSharedValue(0);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Un temporizador que se cancela solo al cambiar de ronda o de pantalla. */
  const luego = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

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

  useEffect(() => {
    doneRef.current = false;
    solvedRef.current = false;
    setFrom(problem.step.from);
    setRun(problem.step.run);
    const forzada = problem.ask === "stretch_step" ? problem.step.rise : null;
    setRise(forzada);
    fromRef.current = problem.step.from;
    runRef.current = problem.step.run;
    riseRef.current = forzada;
    setStretch(1);
    setMIdx(0);
    setBIdx(0);
    mRef.current = 0;
    bRef.current = 0;
    setVisited([problem.step.from]);
    setTurns(0);
    turnsRef.current = 0;
    setPicked(-1);
    setGhostOn(false);
    setSolved(false);
    setMessage({ text: opening(problem.ask), tone: "dim" });
    at.value = problem.step.from;
    walkerY.value = slHeightAt(problem.ramp, problem.step.from);
    pos.value = 0;
    sweep.value = 0;
    hint.value = 1;
    // Qué paso de la guía muestra Tomi como pista en esta ronda: el gesto de
    // esta pregunta, o ninguno si la guía del nivel es de la otra.
    const pista = HINT_STEP[problem.ask];
    preferRef.current?.(coachIds.current.includes(pista) ? pista : "");
    // El latido de la demostración: la mano fantasma, solo sin guía (con guía,
    // la yema de Lumi es la demostración, y dos manos señalarían dos cosas) y
    // solo en las rondas que se contestan con un gesto.
    demo.value =
      !guided && conGesto(problem.ask)
        ? withRepeat(
            withSequence(withTiming(1, { duration: 1600 }), withTiming(0, { duration: 1 })),
            -1,
            false,
          )
        : 0;
    return () => {
      cancelAnimation(demo);
      for (const id of timers.current) clearTimeout(id);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // El reloj arranca cuando se muestra el problema: la latencia es del jugador,
  // no del render ni de la tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem, playing]);

  // El caminante se para donde apoya el escalón, y sube con él.
  useEffect(() => {
    if (problem.ask === "crank") return;
    at.value = from;
    walkerY.value = slHeightAt(ramp, from);
  }, [from, ramp, problem.ask, at, walkerY]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_LINEAR_SLOPE, layer: level.layer });
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
          node: NODE_LINEAR_SLOPE,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_LINEAR_SLOPE, level: level.n });
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
      solvedRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      luego(advance, 2100);
    },
    [advance, quiet, luego],
  );

  /** Tocar una de las tres rampas dibujadas. */
  const pickRamp = useCallback(
    (index: number) => {
      if (solvedRef.current) return;
      quiet();
      setPicked(index);
      const objetivo =
        problem.ask === "which_harder" ? steepestOf(problem.ramps) : problem.correct;
      const ok = index === objetivo;
      // Elegir la rampa por la que el caminante da más pasos es el error del
      // catálogo: la más larga es la menos empinada.
      const masPasos = longestOf(problem.ramps, x0, x1, alcance);
      const mal = !ok && index === masPasos ? misconceptionOfSteps(level) : undefined;
      attempt(ok, mal);
      if (ok) {
        say("picked");
        play("fit");
        succeed(t(problem.ask === "which_harder" ? "sl.hint.steepest" : "sl.hint.thatOne"));
        return;
      }
      setMessage({
        text: t(mal ? "sl.hint.moreStepsNotSteeper" : "sl.hint.otherRamp"),
        tone: "warn",
      });
    },
    [quiet, problem, level, attempt, succeed, x0, x1, alcance, say],
  );

  /** Llevar el escalón con el dedo: el lugar se cuenta al soltar, no por cuadro. */
  const dragStep = useCallback(
    (x: number) => {
      if (solvedRef.current || problem.ask !== "place_step") return;
      const f = Math.round(Math.max(pie, Math.min(techo - runRef.current, x)));
      if (f === fromRef.current) return;
      quiet();
      fromRef.current = f;
      setFrom(f);
    },
    [problem.ask, pie, techo, quiet],
  );

  /**
   * Apoyar el escalón donde quedó: las marcas del lugar cambian y el color no.
   * Se cuenta al soltar, porque arrastrado de punta a punta el escalón pasa por
   * todos los lugares, y contarlos por cuadro cerraba la ronda con un solo gesto.
   */
  const placeStep = useCallback(() => {
    if (solvedRef.current || problem.ask !== "place_step") return;
    const f = fromRef.current;
    if (visited.includes(f)) {
      setMessage({ text: t(SLOPE_MSG.samePlace), tone: "dim" });
      return;
    }
    const ahora = [...visited, f];
    setVisited(ahora);
    attempt(true);
    say("placed");
    // La madera suena más aguda cuanto más arriba apoya: la rampa se oye subir.
    play("drop", { pitch: Math.max(-12, Math.min(12, Math.round(slHeightAt(ramp, f) * 2))) });
    // El de salida y dos más: el mismo color en tres lugares es el invariante.
    if (ahora.length >= 3) {
      say("rested");
      play("join");
      succeed(t("sl.hint.sameColor"));
      return;
    }
    setMessage({ text: t(SLOPE_MSG.restAgain), tone: "dim" });
  }, [problem.ask, visited, ramp, attempt, say, succeed]);

  /**
   * Estirar el escalón: el ancho abajo, la subida con la esquina de arriba. La
   * esquina cae en un cruce de la grilla y no donde quedó el dedo: el escalón se
   * mide contando marcas, así que media marca no es una posición que el jugador
   * pueda querer. El ancho no baja de dos: con ancho uno sería el escalón
   * apagado otra vez, y apoyar ese no dice nada de la proporción.
   */
  const stretchStep = useCallback(
    (nuevoRun: number | null, nuevoRise: number | null) => {
      if (solvedRef.current || problem.ask !== "stretch_step") return;
      const tope = Math.max(2, Math.min(level.params.maxRun, techo - fromRef.current));
      const ancho =
        nuevoRun === null ? runRef.current : Math.round(Math.max(2, Math.min(tope, nuevoRun)));
      const base = slHeightAt(ramp, fromRef.current);
      const alto =
        nuevoRise === null
          ? (riseRef.current ?? slStepOn(ramp, fromRef.current, ancho).rise)
          : Math.round(
              Math.max(Math.ceil(window0.y0 - base), Math.min(Math.floor(window0.y1 - base), nuevoRise)),
            );
      if (ancho === runRef.current && alto === riseRef.current) return;
      quiet();
      runRef.current = ancho;
      riseRef.current = alto;
      setRun(ancho);
      setRise(alto);
      if (slRests(ramp, { from: fromRef.current, run: ancho, rise: alto })) {
        attempt(true);
        say("fit");
        riseRef.current = null;
        setRise(null);
        succeed(t("sl.hint.itFits"));
      }
    },
    [problem.ask, level.params.maxRun, techo, ramp, window0, quiet, attempt, say, succeed],
  );

  /** Soltar el escalón estirado: el intento se cuenta al soltar y no por cuadro. */
  const dropStep = useCallback(() => {
    if (solvedRef.current || problem.ask !== "stretch_step") return;
    const puesto: SlStep = {
      from: fromRef.current,
      run: runRef.current,
      rise: riseRef.current ?? slStepOn(ramp, fromRef.current, runRef.current).rise,
    };
    if (slRests(ramp, puesto)) return;
    const unidad = slStepOn(ramp, fromRef.current, 1);
    const mal = slStretchMisconceptionFor(level, ramp, puesto, unidad);
    attempt(false, mal);
    setMessage({ text: t(mal ? "sl.hint.wideNotSteeper" : "sl.hint.floating"), tone: "warn" });
  }, [problem.ask, ramp, level, attempt]);

  /** Girar la manivela: cada diente avanza un paso y sube lo mismo. */
  const turn = useCallback(
    (dientes: number) => {
      if (solvedRef.current || problem.ask !== "crank") return;
      const v = Math.max(0, Math.min(maxTurns, Math.round(dientes)));
      if (v === turnsRef.current) return;
      quiet();
      turnsRef.current = v;
      setTurns(v);
      // Las dos agujas salen del mismo número: el caminante de la pista y el de
      // la rampa se mueven juntos.
      pos.value = withTiming(v, { duration: 160 });
      at.value = withTiming(pie + v, { duration: 160 });
      walkerY.value = withTiming(slHeightAt(ramp, pie + v), { duration: 160 });
      say("turned");
      if (v === problem.turns) {
        attempt(true);
        say("arrived");
        succeed(t(SLOPE_MSG.sameEveryTooth));
        return;
      }
      setMessage({
        text: t(v > problem.turns ? SLOPE_MSG.pastFlag : "sl.hint.keepTurning"),
        tone: "dim",
      });
    },
    [problem.ask, problem.turns, maxTurns, pie, ramp, quiet, attempt, succeed, at, walkerY, pos, say],
  );

  /** Estirar la grilla: la recta es la misma y la cuesta que se lee, no. */
  const stretchGrid = useCallback(
    (paso: number) => {
      if (solvedRef.current || problem.ask !== "stretch_grid") return;
      const factor = Math.max(1, Math.min(MAX_STRETCH, Math.round(paso) + 1));
      if (factor === stretch) return;
      quiet();
      setStretch(factor);
      // La hoja de goma cede de a una marca: cuanto más estirada, más grave.
      play("drop", { pitch: -factor * 2 });
      if (factor === problem.stretch) {
        attempt(true);
        say("stretched");
        play("join");
        succeed(t("sl.hint.gridChangedIt"));
        return;
      }
      setMessage({
        text: t(factor > problem.stretch ? SLOPE_MSG.pastPoint : "sl.hint.keepStretching"),
        tone: "dim",
      });
    },
    [problem.ask, problem.stretch, stretch, quiet, attempt, succeed, say],
  );

  /** Las dos perillas hasta que la rampa pase por los dos puntos. */
  const slide = useCallback(
    (cual: "m" | "b", paso: number) => {
      if (solvedRef.current || problem.ask !== "set_sliders") return;
      const m =
        cual === "m" ? Math.max(0, Math.min(cuestas.length - 1, Math.round(paso))) : mRef.current;
      const b =
        cual === "b" ? Math.max(-MAX_B, Math.min(MAX_B, Math.round(paso) - MAX_B)) : bRef.current;
      if (m === mRef.current && b === bRef.current) return;
      quiet();
      if (m !== mRef.current) say("tilted");
      mRef.current = m;
      bRef.current = b;
      setMIdx(m);
      setBIdx(b);
      play("drop", { pitch: cual === "m" ? m * 2 : b * 2 });
      const candidata: SlRamp = { slope: cuestas[m] ?? { rise: 1, run: 1 }, intercept: b };
      const pasa = problem.points.every(
        (q) => Math.abs(slHeightAt(candidata, q.x) - q.y) < 1e-9,
      );
      if (pasa) {
        attempt(true);
        say("through");
        play("join");
        succeed(t("sl.hint.throughBoth"));
        return;
      }
      const [a, c] = problem.points;
      const cuestaPedida = a && c ? slBetween(a, c) : null;
      const mismaCuesta = cuestaPedida ? slSameRatio(candidata.slope, cuestaPedida) : false;
      setMessage({
        text: t(mismaCuesta ? "sl.hint.rightSlopeWrongStart" : "sl.hint.turnItMore"),
        tone: "dim",
      });
    },
    [problem.ask, problem.points, cuestas, quiet, attempt, succeed, say],
  );

  /** Tocar una razón escrita: la pendiente entre dos puntos, o la `m` de la recta. */
  const pickRatio = useCallback(
    (index: number) => {
      if (solvedRef.current) return;
      const elegida = problem.options[index];
      const objetivo = problem.options[problem.correct];
      if (!elegida || !objetivo) return;
      quiet();
      setPicked(index);
      const ok = slSameRatio(elegida, objetivo);
      // El error del catálogo se lee sobre la subida y el avance **que el
      // jugador midió**, que es el par del escalón apoyado sobre los dos puntos
      // y no la pendiente ya reducida: contestar la subida sola es el error solo
      // cuando el avance no valía uno.
      //
      // En la recta escrita no hay dos puntos ni escalón: nada se midió, así que
      // no hay error del catálogo que leer, y la línea de abajo habla de la
      // recta y no de un escalón que no está en pantalla.
      const a = problem.points[0];
      const b = problem.points[1];
      const escrita = problem.ask === "read_form";
      const mal =
        !escrita && a && b
          ? slMisconceptionFor(level, elegida, { rise: b.y - a.y, run: b.x - a.x })
          : undefined;
      attempt(ok, mal);
      if (ok) {
        say("chosen");
        play("fit");
        succeed(t(escrita ? "sl.hint.thatIsM" : "sl.hint.thatIsTheSlope"));
        return;
      }
      setMessage({
        text: t(
          escrita
            ? SLOPE_MSG.otherM
            : mal === "slope_as_rise_only"
              ? "sl.hint.riseOnly"
              : mal === "slope_confuses_step_with_rate"
                ? "sl.hint.runOnly"
                : "sl.hint.otherRatio",
        ),
        tone: "warn",
      });
    },
    [quiet, problem.options, problem.correct, problem.ask, problem.points, level, attempt, succeed, say],
  );

  /**
   * Contestar el caso del nivel final. La recta parada tiene dos respuestas
   * ciertas: no tiene pendiente, y tampoco es una función, que es lo que el
   * nodo 18 enseñó con la recta vertical. Rechazar la segunda le diría al
   * jugador que se equivocó justo cuando usó lo que aprendió.
   */
  const judge = useCallback(
    (index: number) => {
      if (solvedRef.current) return;
      quiet();
      setPicked(index);
      const tambien = problem.kase === "vertical" && index === 2;
      const ok = index === answerFor(problem.kase) || tambien;
      attempt(ok);
      if (ok) {
        say("judged");
        play("fit");
        succeed(t(tambien ? SLOPE_MSG.verticalNotFunction : `sl.hint.why.${problem.kase}`));
        return;
      }
      setMessage({ text: t("sl.hint.lookAgain"), tone: "warn" });
    },
    [quiet, problem.kase, attempt, succeed, say],
  );

  // --- Lo que la actividad dibuja por su cuenta ------------------------------

  /** Las fichas del mostrador: las razones escritas entre las que se elige. */
  const chipW = Math.min(88, Math.floor(width / (SL_OPTION_SLOTS + 1)) - 8);
  const chipSpots = useMemo(() => {
    const paso = Math.min(width / (SL_OPTION_SLOTS + 1), 120);
    return Array.from({ length: SL_OPTION_SLOTS }, (_, i) => ({
      x: width / 2 + (i - (SL_OPTION_SLOTS - 1) / 2) * paso,
      y: chipsY,
    }));
  }, [width, chipsY]);

  const conFichas = problem.ask === "slope_between" || problem.ask === "read_form";

  const chipGeom = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const texto = Skia.Path.Make();
    const anillo = Skia.Path.Make();
    if (!conFichas) return { cuerpo, texto, anillo };
    problem.options.forEach((r, i) => {
      const s = chipSpots[i];
      if (!s) return;
      const caja = Skia.RRectXY(Skia.XYWHRect(s.x - chipW / 2, s.y - 20, chipW, 40), 8, 8);
      cuerpo.addRRect(caja);
      texto.addPath(walkTextPath(ratioText(r), s.x, s.y, 20));
      if (i === picked) {
        anillo.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - chipW / 2 - 5, s.y - 25, chipW + 10, 52), 11, 11));
      }
    });
    return { cuerpo, texto, anillo };
  }, [conFichas, problem.options, chipSpots, chipW, picked]);

  /**
   * Lo que se pregunta, escrito. En el nivel de las tres rampas es la ficha que
   * dice cuánto sube por paso; en el de las formas, la recta escrita de dos
   * maneras. El modelo trae una tercera que es otra recta, y a la vista las tres
   * juntas no dejaban saber de cuál se preguntaba la pendiente: se dibujan solo
   * las dos que son la misma.
   */
  const askedGeom = useMemo(() => {
    const path = Skia.Path.Make();
    const ficha = Skia.Path.Make();
    if (problem.ask === "pick_ramp") {
      const objetivo = problem.ramps[problem.correct];
      if (objetivo) {
        ficha.addRRect(Skia.RRectXY(Skia.XYWHRect(width / 2 - 40, chipsY - 22, 80, 44), 9, 9));
        path.addPath(walkTextPath(ratioText(slReduce(objetivo.slope)), width / 2, chipsY, 24));
      }
      return { path, ficha };
    }
    if (problem.ask === "read_form") {
      const mismas = problem.written.slice(0, 2);
      mismas.forEach((w, i) => {
        const y = crankH + walkH / 2 + (i - (mismas.length - 1) / 2) * 58;
        path.addPath(walkTextPath(formText(w), width / 2, y, 24));
      });
    }
    return { path, ficha };
  }, [problem.ask, problem.ramps, problem.correct, problem.written, width, chipsY, crankH, walkH]);

  /** Las perillas: la de la grilla, o las dos de la `m` y la `b`. */
  const filas = useMemo<readonly Fila[]>(() => {
    const left = RAIL_L;
    const right = width - RAIL_R;
    if (problem.ask === "set_sliders") {
      return [
        { y: controlsTop + 28, left, right, steps: Math.max(1, cuestas.length - 1), value: mIdx, label: "m" },
        { y: controlsTop + 72, left, right, steps: 2 * MAX_B, value: bIdx + MAX_B, label: "b" },
      ];
    }
    if (problem.ask === "stretch_grid") {
      return [
        {
          y: controlsTop + controlsH / 2,
          left,
          right,
          steps: MAX_STRETCH - 1,
          value: stretch - 1,
          label: `×${stretch}`,
        },
      ];
    }
    return [];
  }, [problem.ask, width, controlsTop, controlsH, cuestas.length, mIdx, bIdx, stretch]);

  const knobX = (f: Fila, v = f.value): number => f.left + ((f.right - f.left) * v) / Math.max(1, f.steps);

  const sliders = useMemo(() => {
    const via = Skia.Path.Make();
    const marcas = Skia.Path.Make();
    const perilla = Skia.Path.Make();
    const letras = Skia.Path.Make();
    for (const f of filas) {
      via.moveTo(f.left, f.y);
      via.lineTo(f.right, f.y);
      // Una marca por paso: la perilla cae en una y no entre dos, y se ve cuántas hay.
      for (let i = 0; i <= f.steps; i++) {
        const x = f.left + ((f.right - f.left) * i) / f.steps;
        marcas.moveTo(x, f.y - 9);
        marcas.lineTo(x, f.y + 9);
      }
      perilla.addCircle(knobX(f), f.y, 14);
      letras.addPath(walkTextPath(f.label, f.left - 32, f.y, 20));
    }
    return { via, marcas, perilla, letras };
  }, [filas]);

  // --- El gesto --------------------------------------------------------------

  const geoNow = useMemo<Geo>(() => {
    const k = stretch;
    const base = slHeightAt(ramp, from);
    const rows: number[] = [];
    for (const f of filas) rows.push(f.y, f.left, f.right, f.steps, f.value);
    return {
      place: problem.ask === "place_step" ? 1 : 0,
      corner: problem.ask === "stretch_step" ? 1 : 0,
      crank: problem.ask === "crank" ? 1 : 0,
      // La hoja se dibuja corrida por la manivela del costado, y el dedo llega
      // en coordenadas del lienzo entero: la misma corrida va acá.
      cx: sh.cx + sideW,
      ux: sh.ux,
      uy: sh.uy,
      k,
      walkTop: crankH,
      walkBottom: crankH + walkH,
      from,
      run,
      leftX: sideW + walkPx(sh, from * k),
      rightX: sideW + walkPx(sh, (from + run) * k),
      baseY: crankH + walkPy(sh, base),
      topY: crankH + walkPy(sh, base + escalonReal.rise),
      kx: tl.crank.x,
      ky: tl.crank.y,
      kr: tl.crank.r,
      rows,
    };
  }, [problem.ask, stretch, ramp, from, run, escalonReal.rise, filas, sh, sideW, crankH, walkH, tl.crank]);

  const geo = useSharedValue<Geo>(geoNow);
  useEffect(() => {
    geo.value = geoNow;
  }, [geoNow, geo]);

  const blocked = useSharedValue(1);
  useEffect(() => {
    blocked.value = solved || !playing ? 1 : 0;
  }, [solved, playing, blocked]);

  const subject = useSharedValue(NADA);
  const fila = useSharedValue(0);
  const moved = useSharedValue(0);
  const lastV = useSharedValue(Number.NaN);
  const grab = useSharedValue(0);
  const lastAngle = useSharedValue(0);
  const turned = useSharedValue(0);
  const anchor = useSharedValue(0);

  /** Lo que el gesto entrega, según qué agarró. Siempre la última versión. */
  const moveTo = useLatest((s: number, v: number, row: number) => {
    if (s === ESCALON) dragStep(v);
    else if (s === ESQUINA) stretchStep(null, v);
    else if (s === ANCHO) stretchStep(v, null);
    else if (s === MANIVELA) turn(v);
    else if (s === PERILLA) {
      if (problem.ask === "stretch_grid") stretchGrid(v);
      else slide(row === 0 ? "m" : "b", v);
    }
  });
  const dropAt = useLatest((s: number) => {
    if (s === ESCALON) placeStep();
    else if (s === ESQUINA || s === ANCHO) dropStep();
  });
  /**
   * Un toque, que no arrastró nada: la ficha, la rampa, un diente de la
   * manivela, el lugar donde apoyar el escalón. Un toque sobre lo que esta
   * ronda no usa dice en la línea de abajo dónde está lo que sí.
   */
  const tapAt = useLatest((x: number, y: number, s: number) => {
    if (solvedRef.current) return;
    if (s === MANIVELA) {
      turn(turnsRef.current + 1);
      return;
    }
    if (s === ESCALON) {
      dragStep((x - sideW - sh.cx) / (sh.ux * stretch) - runRef.current / 2);
      placeStep();
      return;
    }
    if (s === ESQUINA || s === ANCHO) {
      setMessage({ text: t(SLOPE_MSG.dragTheCorner), tone: "dim" });
      return;
    }
    if (conFichas) {
      const i = chipSpots.findIndex(
        (c, j) => j < problem.options.length && Math.abs(x - c.x) < chipW / 2 + 6 && Math.abs(y - c.y) < 28,
      );
      if (i >= 0) {
        pickRatio(i);
        return;
      }
    }
    if (eligeRampa) {
      const cual = nearestCurve(candidatas, sh, x - sideW, y - crankH);
      if (cual >= 0) {
        pickRamp(cual);
        return;
      }
      setMessage({ text: t(SLOPE_MSG.tapARamp), tone: "dim" });
      return;
    }
    const donde = WHERE[problem.ask];
    if (donde) setMessage({ text: t(donde), tone: "dim" });
  });

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          subject.value = NADA;
          moved.value = 0;
          lastV.value = Number.NaN;
          if (blocked.value === 1) return;
          const g = geo.value;
          if (g.corner === 1) {
            const dTop = Math.hypot(e.x - g.rightX, e.y - g.topY);
            const dBase = Math.hypot(e.x - g.rightX, e.y - g.baseY);
            if (dTop < 38 && dTop <= dBase) {
              subject.value = ESQUINA;
              return;
            }
            if (dBase < 32) {
              subject.value = ANCHO;
              return;
            }
          }
          if (g.crank === 1 && Math.hypot(e.x - g.kx, e.y - g.ky) < g.kr * 1.45) {
            subject.value = MANIVELA;
            lastAngle.value = Math.atan2(e.y - g.ky, e.x - g.kx);
            turned.value = 0;
            anchor.value = pos.value;
            return;
          }
          const rows = g.rows;
          for (let i = 0; i < rows.length / 5; i++) {
            const y = rows[i * 5] as number;
            const l = rows[i * 5 + 1] as number;
            const r = rows[i * 5 + 2] as number;
            if (Math.abs(e.y - y) < 24 && e.x > l - 34 && e.x < r + 30) {
              subject.value = PERILLA;
              fila.value = i;
              return;
            }
          }
          if (g.place === 1 && e.y > g.walkTop && e.y < g.walkBottom) {
            subject.value = ESCALON;
            // Agarrado de donde lo tocó: si el dedo cae sobre el escalón lo
            // lleva desde ahí, y si no, lo trae centrado bajo el dedo.
            const u = (e.x - g.cx) / (g.ux * g.k) - g.from;
            grab.value = u >= -0.3 && u <= g.run + 0.3 ? Math.max(0, Math.min(g.run, u)) : g.run / 2;
          }
        })
        .onStart(() => {
          moved.value = 1;
        })
        .onChange((e) => {
          const s = subject.value;
          if (s === NADA || blocked.value === 1) return;
          const g = geo.value;
          let v = 0;
          if (s === ESCALON) v = Math.round((e.x - g.cx) / (g.ux * g.k) - grab.value);
          else if (s === ESQUINA) v = Math.round((g.baseY - e.y) / g.uy);
          else if (s === ANCHO) v = Math.round((e.x - g.leftX) / (g.ux * g.k));
          else if (s === MANIVELA) {
            // El ángulo que el dedo recorrió alrededor del eje, de a un diente:
            // entre dos dientes no hay nada que el gesto pueda expresar.
            const a = Math.atan2(e.y - g.ky, e.x - g.kx);
            let d = a - lastAngle.value;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            turned.value += d;
            lastAngle.value = a;
            v = Math.round(anchor.value + turned.value / TOOTH_ANGLE);
          } else if (s === PERILLA) {
            const i = fila.value;
            const l = g.rows[i * 5 + 1] as number;
            const r = g.rows[i * 5 + 2] as number;
            const pasos = g.rows[i * 5 + 3] as number;
            v = Math.round(((e.x - l) / Math.max(1, r - l)) * pasos);
          }
          if (v === lastV.value) return;
          lastV.value = v;
          runOnJS(moveTo)(s, v, fila.value);
        })
        // `onFinalize` y no `onEnd`: un toque sin arrastre no activa el pan, y
        // el toque es la mitad de los gestos del nodo (fichas, rampas, un diente).
        .onFinalize((e) => {
          const s = subject.value;
          subject.value = NADA;
          if (blocked.value === 1) return;
          if (moved.value === 1 && s !== NADA) {
            runOnJS(dropAt)(s);
            return;
          }
          if (s === PERILLA) {
            // Tocar el riel lleva la perilla ahí: con el mouse, es lo natural.
            const g = geo.value;
            const i = fila.value;
            const l = g.rows[i * 5 + 1] as number;
            const r = g.rows[i * 5 + 2] as number;
            const pasos = g.rows[i * 5 + 3] as number;
            runOnJS(moveTo)(s, Math.round(((e.x - l) / Math.max(1, r - l)) * pasos), i);
            return;
          }
          runOnJS(tapAt)(e.x, e.y, s);
        }),
    [subject, moved, lastV, blocked, geo, lastAngle, turned, anchor, pos, fila, grab, moveTo, dropAt, tapAt],
  );

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda: la ficha y
   * las rampas, el escalón y un lugar donde todavía no apoyó, la esquina que
   * flota y la sombra donde apoyaría, la perilla de la manivela, el punto
   * marcado. Se recalcula con cada movimiento, así que la yema siempre apunta a
   * un gesto que todavía falta.
   */
  // La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const id = shown.id;
    const X = (u: number, kk = 1): number => sideW + walkPx(sh, u * kk);
    const Y = (v: number): number => crankH + walkPy(sh, v);
    const box = (pts: readonly Pt[], pad: number): Rect => {
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const lx = Math.min(...xs);
      const ly = Math.min(...ys);
      return { x: lx - pad, y: ly - pad, w: Math.max(...xs) - lx + pad * 2, h: Math.max(...ys) - ly + pad * 2 };
    };
    const ring = (p: Pt, r: number): Rect => ({ x: p.x - r, y: p.y - r, w: r * 2, h: r * 2 });
    const hoja: Rect = box(
      [
        { x: X(window0.x0), y: Y(window0.y1) },
        { x: X(window0.x1), y: Y(window0.y0) },
      ],
      6,
    );
    const stepBox = (r: SlRamp, f: number, ancho: number, subida: number, kk = 1): Rect =>
      box(
        [
          { x: X(f, kk), y: Y(slHeightAt(r, f)) },
          { x: X(f + ancho, kk), y: Y(slHeightAt(r, f) + subida) },
        ],
        16,
      );
    const fichas = (): Rect | null => {
      const n = Math.max(1, problem.options.length);
      const a = chipSpots[0];
      const b = chipSpots[n - 1];
      return a && b ? { x: a.x - chipW / 2 - 8, y: chipsY - 28, w: b.x - a.x + chipW + 16, h: 56 } : null;
    };
    const solo = <T,>(xs: readonly (T | null)[]): T[] => xs.filter((x): x is T => x !== null);

    if (problem.ask === "pick_ramp" || problem.ask === "which_harder") {
      const todas = candidatas.flatMap((c) => c.points.map((p) => ({ x: X(p.x), y: Y(p.y) })));
      const zona = todas.length > 0 ? box(todas, 16) : hoja;
      const ficha: Rect = { x: width / 2 - 50, y: chipsY - 30, w: 100, h: 60 };
      const primer = (r: SlRamp): Pt[] => {
        const lo = slVisibleRange(r, x0, x1, alcance)[0];
        return [
          { x: X(lo), y: Y(slHeightAt(r, lo)) },
          { x: X(lo + 1), y: Y(slHeightAt(r, lo + 1)) },
        ];
      };
      const conFicha = problem.ask === "pick_ramp";
      if (id === "look") return { rings: conFicha ? [ficha, zona] : [zona] };
      if (id === "reveal") {
        const i = problem.ask === "which_harder" ? steepestOf(problem.ramps) : problem.correct;
        const r = problem.ramps[i];
        return { rings: r ? [box(primer(r), 18)] : [zona] };
      }
      // El primer paso de las tres, sin decir cuál: ahí se ve lo que sube cada una.
      const columna = box(problem.ramps.flatMap(primer), 18);
      return { rings: conFicha ? [ficha, columna] : [columna] };
    }

    if (problem.ask === "place_step") {
      const actual = stepBox(ramp, from, run, escalonReal.rise);
      if (id === "look" || id === "reveal") return { rings: [actual] };
      const centro = (f: number): Pt => ({
        x: X(f + run / 2),
        y: Y(slHeightAt(ramp, f) + slStepOn(ramp, f, run).rise / 2),
      });
      const destino = freePlace(pie, techo - run, from, visited);
      return destino === null
        ? { rings: [actual] }
        : { rings: [actual, stepBox(ramp, destino, run, slStepOn(ramp, destino, run).rise)], drag: { from: centro(from), to: centro(destino) } };
    }

    if (problem.ask === "stretch_step") {
      const base = slHeightAt(ramp, from);
      const esquina: Pt = { x: X(from + run), y: Y(base + escalonReal.rise) };
      const debida: Pt = { x: esquina.x, y: Y(slHeightAt(ramp, from + run)) };
      const otro = problem.other ? stepBox(ramp, problem.other.from, problem.other.run, problem.other.rise) : null;
      if (id === "look") return { rings: solo([ring(esquina, 22), otro]) };
      if (id === "reveal") return { rings: solo([stepBox(ramp, from, run, slStepOn(ramp, from, run).rise), otro]) };
      return { rings: [ring(esquina, 22)], drag: { from: esquina, to: debida } };
    }

    if (problem.ask === "crank" || (problem.ask === "stretch_grid" && id !== "stretch")) {
      if (problem.ask === "crank") {
        const kr = tl.crank.r;
        const manivela: Rect = { x: tl.crank.x - kr - 8, y: tl.crank.y - kr - 8, w: kr * 2 + 16, h: kr * 2 + 16 };
        const piedra = tl.rail.stones[problem.turns] ?? tl.rail.origin;
        const bandera: Rect = { x: piedra.x - 22, y: piedra.y - 48, w: 44, h: 62 };
        const pies: Pt = { x: X(pie + turns), y: Y(slHeightAt(ramp, pie + turns)) };
        const caminante: Rect = { x: pies.x - 20, y: pies.y - 52, w: 40, h: 62 };
        // La perilla está donde la dejó el último diente; un cuarto de vuelta
        // hacia la derecha son varios dientes hacia adelante.
        const perilla = (dir: number): { from: Pt; to: Pt } => {
          const r = kr * 0.62;
          const a = turns * TOOTH_ANGLE - Math.PI / 2;
          const b = a + dir * (Math.PI / 2);
          return {
            from: { x: tl.crank.x + Math.cos(a) * r, y: tl.crank.y + Math.sin(a) * r },
            to: { x: tl.crank.x + Math.cos(b) * r, y: tl.crank.y + Math.sin(b) * r },
          };
        };
        if (id === "look") return { rings: [manivela, caminante] };
        if (id === "turn") return { rings: [manivela], drag: perilla(1) };
        if (id === "arrive") return { rings: [bandera, manivela], drag: perilla(problem.turns >= turns ? 1 : -1) };
        return { rings: [bandera, caminante] };
      }
    }

    if (problem.ask === "stretch_grid") {
      const f = filas[0];
      const punto = problem.points[0];
      const blanco = punto ? ring({ x: X(punto.x), y: Y(punto.y) }, 20) : null;
      if (!f) return { rings: solo([blanco]) };
      const desde: Pt = { x: knobX(f), y: f.y };
      const hasta: Pt = { x: knobX(f, problem.stretch - 1), y: f.y };
      return { rings: solo([ring(desde, 24), blanco]), drag: { from: desde, to: hasta } };
    }

    if (problem.ask === "set_sliders") {
      const puntos = problem.points.map((p) => ring({ x: X(p.x), y: Y(p.y) }, 20));
      const [a, c] = problem.points;
      const pedida = a && c ? slBetween(a, c) : null;
      const mBuscada = pedida ? cuestas.findIndex((q) => slSameRatio(q, pedida)) : -1;
      const bBuscada = a && pedida ? Math.round(a.y - (pedida.rise / pedida.run) * a.x) : 0;
      const [fm, fb] = filas;
      if (id === "look") {
        const perillas = fm && fb ? box([{ x: fm.left, y: fm.y }, { x: fb.right, y: fb.y }], 22) : null;
        return { rings: solo([...puntos, perillas]) };
      }
      if (id === "reveal") {
        const renglon: Rect = { x: X((window0.x0 + window0.x1) / 2) - 110, y: Y(window0.y0) + 8, w: 220, h: 38 };
        return { rings: [...puntos, renglon] };
      }
      // La perilla que falta: primero la de la cuesta, después la del arranque.
      if (fm && mBuscada >= 0 && mIdx !== mBuscada) {
        const p: Pt = { x: knobX(fm), y: fm.y };
        return { rings: [...puntos, ring(p, 24)], drag: { from: p, to: { x: knobX(fm, mBuscada), y: fm.y } } };
      }
      if (fb) {
        const p: Pt = { x: knobX(fb), y: fb.y };
        return { rings: [...puntos, ring(p, 24)], drag: { from: p, to: { x: knobX(fb, bBuscada + MAX_B), y: fb.y } } };
      }
      return { rings: puntos };
    }

    if (problem.ask === "slope_between") {
      const [a, c] = problem.points;
      const tramo = a && c ? box([{ x: X(a.x), y: Y(a.y) }, { x: X(c.x), y: Y(c.y) }], 18) : hoja;
      return { rings: id === "choose" ? solo([tramo, fichas()]) : [tramo] };
    }

    if (problem.ask === "read_form") {
      const formas: Rect = { x: width / 2 - 150, y: crankH + walkH / 2 - 60, w: 300, h: 120 };
      return { rings: solo([formas, fichas()]) };
    }

    return { rings: [hoja] };
  }, [
    shown,
    sh,
    crankH,
    walkH,
    window0,
    problem,
    candidatas,
    width,
    chipsY,
    chipSpots,
    chipW,
    x0,
    x1,
    alcance,
    ramp,
    from,
    run,
    escalonReal.rise,
    pie,
    techo,
    visited,
    tl,
    turns,
    filas,
    cuestas,
    mIdx,
    sideW,
  ]);

  const preguntaCaso = level.asks.includes("judge_slope");
  const conFantasma =
    level.ghostRamp && level.asks.some((a) => a !== "judge_slope" && a !== "read_form");
  /** El escalón estirado de la grilla se sale de la hoja: se recorta contra ella. */
  const recorte = level.asks.includes("stretch_grid")
    ? Skia.XYWHRect(walkPx(sh, window0.x0) - 28, 0, walkPx(sh, window0.x1) - walkPx(sh, window0.x0) + 48, walkH)
    : undefined;

  return (
    <View style={styles.root}>
      <Header
        title={`${t(`node.${NODE_LINEAR_SLOPE}.name`)} · nivel ${level.n} de ${TOTAL_SL_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!lesson?.lesson}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View
        style={styles.area}
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          setAreaH((prev) => (Math.abs(prev - h) > 2 ? h : prev));
        }}
      >
        <GestureDetector gesture={gesture}>
          <View style={{ width, height: sceneH }}>
            {/* Un solo lienzo por pantalla: la manivela, la rampa, las perillas y
                las fichas viven adentro del mismo. */}
            <Canvas style={{ width, height: sceneH }}>
              {level.crank && (side || problem.ask === "crank") ? (
                <TrackScene
                  config={trackCfg}
                  layout={tl}
                  pos={pos}
                  appear={appear}
                  hint={hint}
                  demo={quieto}
                />
              ) : null}

              <Group transform={[{ translateX: sideW }, { translateY: crankH }]}>
                <Group {...(recorte ? { clip: recorte } : {})}>
                  <WalkScene
                    config={walkCfg}
                    layout={wl}
                    at={at}
                    height={walkerY}
                    sweep={sweep}
                    hint={hint}
                    demo={demo}
                    picked={eligeRampa ? picked : -1}
                    appear={appear}
                  />
                </Group>
              </Group>

              {/* Las perillas: un riel hundido que se lee sobre cualquier paisaje,
                  una marca por paso, y la perilla es una ficha con su canto. */}
              <Path path={sliders.via} color="rgba(9, 17, 29, 0.9)" style="stroke" strokeWidth={10} strokeCap="round" />
              <Path path={sliders.via} color={theme.color.inkDim} style="stroke" strokeWidth={3} strokeCap="round" opacity={0.75} />
              <Path path={sliders.marcas} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" opacity={0.7} />
              <ChipBodies path={sliders.perilla} />
              <Path path={sliders.letras} color="rgba(9, 17, 29, 0.9)" style="stroke" strokeWidth={3} strokeJoin="round" />
              <Path path={sliders.letras} color={theme.color.ink} />

              {/* Las fichas de razones. La elegida lleva un anillo: menta si
                  coincide, ámbar si pide que se mire otra vez. */}
              <ChipBodies path={chipGeom.cuerpo} />
              <Path path={chipGeom.texto} color={theme.color.ink} />
              <Path
                path={chipGeom.anillo}
                color={solved ? theme.color.ok : theme.color.warn}
                style="stroke"
                strokeWidth={2.5}
              />

              {/* Lo que se pregunta cae sobre el paisaje: la ficha lo despega, y
                  un borde oscuro, cuando va sin ficha. */}
              <ChipBodies path={askedGeom.ficha} />
              <Path path={askedGeom.path} color="rgba(9, 17, 29, 0.9)" style="stroke" strokeWidth={3} strokeJoin="round" />
              <Path path={askedGeom.path} color={theme.color.ink} />
            </Canvas>
            <Spotlight focus={focus} />
          </View>
        </GestureDetector>
      </View>

      {/* Lo de abajo tiene su lugar aunque esté vacío, y en el teléfono deja
          libre el rincón de Tomi. */}
      <View style={[styles.bottom, narrow && styles.bottomNarrow]}>
        <View style={styles.hintSlot}>
          <Hint text={message.text} tone={message.tone} />
        </View>

        {preguntaCaso ? (
          <View style={styles.answers}>
            {answersFor(problem.kase).map((clave, i) => (
              <Choice
                key={clave}
                label={t(clave)}
                chosen={picked === i}
                done={solved}
                onPress={() => judge(i)}
              />
            ))}
          </View>
        ) : null}

        {conFantasma ? (
          <View style={styles.tools}>
            {conRampa ? (
              <Toggle
                label={t(ghostOn ? "sl.ramp.hide" : "sl.ramp.show")}
                onPress={() => setGhostOn((on) => !on)}
              />
            ) : null}
          </View>
        ) : null}

        {level.definition ? <Text style={styles.definition}>{t("sl.definition")}</Text> : null}
      </View>
    </View>
  );
}

// --- Lo que la pantalla decide, y que no es del modelo ------------------------

/**
 * Una función estable que siempre llama a la última versión de `fn`. El gesto
 * se arma una vez por nivel y llama por acá: un gesto rearmado en cada ronda se
 * quedaba con el cierre de la anterior (trampa 34).
 */
function useLatest<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: A) => ref.current(...args), []);
}

/** El paso de la guía que la pista de Tomi muestra en cada pregunta. */
const HINT_STEP: Record<SlAsk, string> = {
  pick_ramp: "pick",
  which_harder: "choose",
  place_step: "move",
  stretch_step: "raise",
  crank: "turn",
  stretch_grid: "stretch",
  set_sliders: "tilt",
  slope_between: "choose",
  read_form: "",
  judge_slope: "answer",
};

/** Dónde se contesta cada pregunta, para el toque que cayó en otro lado. */
const WHERE: Partial<Record<SlAsk, string>> = {
  stretch_step: SLOPE_MSG.dragTheCorner,
  crank: SLOPE_MSG.useTheCrank,
  stretch_grid: SLOPE_MSG.useTheKnob,
  set_sliders: SLOPE_MSG.useTheSliders,
  slope_between: SLOPE_MSG.useTheChips,
  read_form: SLOPE_MSG.useTheChips,
  judge_slope: SLOPE_MSG.useTheAnswers,
};

/**
 * Un lugar de la rampa donde el escalón todavía no apoyó, para que la luz de la
 * guía apunte a un gesto que cuente: cerca, pero a dos pasos del de ahora.
 */
function freePlace(lo: number, hi: number, now: number, visited: readonly number[]): number | null {
  let mejor: number | null = null;
  for (let f = lo; f <= hi; f++) {
    if (visited.includes(f)) continue;
    const d = Math.abs(Math.abs(f - now) - 2);
    if (mejor === null || d < Math.abs(Math.abs(mejor - now) - 2)) mejor = f;
  }
  return mejor;
}

/**
 * El color de la cuesta, tomado de los tokens y no inventado.
 *
 * Es el corazón visible del nodo: **sale de la razón y de nada más**, así que
 * mover el escalón o ensancharlo lo deja igual, y girar la rampa o estirar la
 * grilla lo cambia. Tres tramos alcanzan porque las cuestas del nodo van de
 * media a tres, y el estirado siempre cruza al menos un borde.
 */
function colorFor(r: SlRatio): string {
  const v = Math.abs(slValue(r));
  if (v < 1) return theme.color.accent;
  if (v < 2) return theme.color.ok;
  return theme.color.warn;
}

/** Las cuestas que la perilla de inclinación recorre, de la más baja a la más alta. */
function slopeChoices(maxSlope: number, negative: boolean): readonly SlRatio[] {
  const out: SlRatio[] = [];
  for (let rise = negative ? -maxSlope : 0; rise <= maxSlope; rise++) {
    out.push({ rise, run: 1 });
  }
  return out;
}

/** La más empinada de las candidatas: la que cuesta más subir. */
function steepestOf(ramps: readonly SlRamp[]): number {
  let mejor = 0;
  for (let i = 1; i < ramps.length; i++) {
    if (Math.abs(slValue((ramps[i] as SlRamp).slope)) > Math.abs(slValue((ramps[mejor] as SlRamp).slope))) {
      mejor = i;
    }
  }
  return mejor;
}

/**
 * La rampa por la que el caminante da más pasos: la que más lejos llega antes de
 * salirse de la hoja, que es la **menos** empinada. Es el distractor del
 * documento, y por eso se calcula en vez de sortearse.
 */
function longestOf(ramps: readonly SlRamp[], x0: number, x1: number, reach: number): number {
  let mejor = 0;
  let largo = -1;
  ramps.forEach((r, i) => {
    const [lo, hi] = slVisibleRange(r, x0, x1, reach);
    if (hi - lo > largo) {
      largo = hi - lo;
      mejor = i;
    }
  });
  return mejor;
}

/**
 * El error del catálogo para el nivel que lo declara. Elegir la rampa de más
 * pasos es confundir el paso con la pendiente, y el id sale del catálogo: acá
 * no se inventa ninguno.
 */
const misconceptionOfSteps = (level: SlLevel): string | undefined =>
  level.classifies.includes("slope_confuses_step_with_rate")
    ? "slope_confuses_step_with_rate"
    : undefined;

/** La curva más cercana al dedo, o -1. */
function nearestCurve(
  curves: readonly GpCurve[],
  plane: { readonly cx: number; readonly cy: number; readonly ux: number; readonly uy: number },
  x: number,
  y: number,
): number {
  let mejor = -1;
  let dist = 70;
  curves.forEach((curva, i) => {
    // Contra los tramos y no solo contra los vértices: con la grilla chica del
    // teléfono, tocar la rampa entre dos pasos caía lejos de todos los puntos.
    for (let j = 0; j < curva.points.length; j++) {
      const p = curva.points[j] as GpPoint;
      const q = curva.points[j + 1] ?? p;
      const ax = walkPx(plane, p.x);
      const ay = walkPy(plane, p.y);
      const bx = walkPx(plane, q.x);
      const by = walkPy(plane, q.y);
      const len2 = (bx - ax) ** 2 + (by - ay) ** 2;
      const tt = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / len2));
      const d = Math.hypot(x - (ax + (bx - ax) * tt), y - (ay + (by - ay) * tt));
      if (d < dist) {
        dist = d;
        mejor = i;
      }
    }
  });
  return mejor;
}

/** Una razón escrita, con el menos de la tipografía matemática. */
function ratioText(r: SlRatio): string {
  const reducida = slReduce(r);
  if (reducida.run === 1) return walkNumeral(reducida.rise);
  return `${walkNumeral(reducida.rise)}/${walkNumeral(reducida.run)}`;
}

/**
 * Lo que va delante de la `x`. El uno no se escribe, pero **solo el uno
 * entero**: preguntar por la subida sola escribía `y = x` para una pendiente de
 * un tercio. Una fracción va entre paréntesis, que `2/3x` se lee como dos
 * tercios de algo que no se sabe qué es.
 */
function coefText(m: SlRatio): string {
  const r = slReduce(m);
  if (r.rise === r.run) return "";
  if (r.rise === -r.run) return "−";
  return r.run === 1 ? ratioText(r) : `(${ratioText(r)})`;
}

/**
 * Lo que el escalón lleva escrito. Con las fichas puestas los tramos se llaman
 * `Δx` y `Δy`, que es el paso 3 de la transición: la resta se contrajo en una
 * letra. La ficha de la esquina es la `m`, que llega recién cuando dos escalones
 * de anchos distintos encajaron.
 */
function stepText(
  step: SlStep,
  stretch: number,
  tiles: boolean,
): { readonly run: string; readonly rise: string; readonly label: string } {
  return {
    run: `Δx = ${numText(step.run * stretch)}`,
    rise: `Δy = ${numText(step.rise)}`,
    label: tiles ? "m" : "",
  };
}

/**
 * Un número medido, que no siempre es entero: con pendiente fraccionaria el
 * tramo vertical cae entre dos marcas. Redondearlo diría que la rampa pasa por
 * un cruce de la grilla donde no pasa.
 */
function numText(v: number): string {
  const redondo = Math.round(v);
  if (Math.abs(v - redondo) < 1e-9) return walkNumeral(redondo);
  const entero = Math.trunc(Math.abs(v));
  const decimal = Math.round((Math.abs(v) - entero) * 10);
  return `${v < 0 ? "−" : ""}${entero}.${decimal}`;
}

/** El arranque detrás de la `x`: `+ 2`, `− 3` o nada. */
const startText = (b: number): string => (b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`);

/** El renglón bajo la rampa: `y = mx + b`, con los dos números puestos. */
function lineText(ramp: SlRamp): string {
  const m = slReduce(ramp.slope);
  if (m.rise === 0) return `y = ${walkNumeral(ramp.intercept)}`;
  return `y = ${coefText(m)}x${startText(ramp.intercept)}`;
}

/** Una recta escrita, en la forma en que viene. */
function formText(w: SlWritten): string {
  if (w.form === "solved") {
    const m = slSlopeOfWritten(w);
    if (!m) return `x = ${walkNumeral(w.c / w.a)}`;
    const b = w.c / w.b;
    if (m.rise === 0) return `y = ${walkNumeral(b)}`;
    return `y = ${coefText(m)}x${startText(b)}`;
  }
  // Sin despejar: los dos lados tal como están, que es lo que rompe la lectura
  // posicional del renglón.
  const conSigno = (v: number, primero: boolean): string =>
    primero ? walkNumeral(v) : v < 0 ? ` − ${-v}` : ` + ${v}`;
  return `${conSigno(w.a, true)}x${conSigno(w.b, false)}y = ${walkNumeral(w.c)}`;
}

/** Las respuestas del nivel final, según el caso. */
function answersFor(kase: string): readonly string[] {
  if (kase === "parallel" || kase === "crossing") {
    return ["sl.answer.theyCross", "sl.answer.neverCross"];
  }
  return ["sl.answer.slopeZero", "sl.answer.noSlope", "sl.answer.notAFunction"];
}

const answerFor = (kase: string): number => {
  if (kase === "crossing") return 0;
  if (kase === "parallel") return 1;
  return kase === "flat" ? 0 : 1;
};

/** Si la ronda se contesta moviendo algo, que es cuando la mano fantasma enseña. */
const conGesto = (ask: string): boolean =>
  ask === "place_step" ||
  ask === "stretch_step" ||
  ask === "crank" ||
  ask === "stretch_grid" ||
  ask === "set_sliders";

/** Si la rampa está retirada porque el nivel la pide con un toque. */
const ghostRetirado = (level: SlLevel, ask: string, ghostOn: boolean): boolean =>
  level.ghostRamp && ask !== "judge_slope" && !ghostOn;

/** Lo que dice la línea de abajo al empezar una ronda de un nivel que alterna. */
function openingKey(ask: SlAsk): string {
  if (ask === "pick_ramp") return "sl.hint.pickRamp";
  if (ask === "which_harder") return "sl.hint.whichHarder";
  if (ask === "place_step") return SLOPE_MSG.placeStep;
  if (ask === "stretch_step") return SLOPE_MSG.stretchStep;
  if (ask === "crank") return SLOPE_MSG.crank;
  if (ask === "stretch_grid") return SLOPE_MSG.stretchGrid;
  if (ask === "set_sliders") return SLOPE_MSG.setSliders;
  if (ask === "slope_between") return SLOPE_MSG.slopeBetween;
  if (ask === "read_form") return SLOPE_MSG.readForm;
  return "sl.hint.judge";
}

function Toggle({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={theme.hitSlop} style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

/**
 * Una respuesta del nivel final. La elegida lleva el borde con su significado:
 * menta si coincide, ámbar si pide que se mire otra vez. Con la ronda resuelta
 * ya no se tocan, pero se quedan: si se fueran, el tablero crecería debajo.
 */
function Choice({
  label,
  chosen,
  done,
  onPress,
}: {
  readonly label: string;
  readonly chosen: boolean;
  readonly done: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      onPress={done ? undefined : onPress}
      hitSlop={theme.hitSlop}
      style={[
        styles.choice,
        chosen && { borderColor: done ? theme.color.ok : theme.color.warn, borderWidth: 2 },
        done && !chosen && styles.choiceOff,
      ]}
    >
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
  area: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  bottom: { alignSelf: "stretch", alignItems: "center", gap: theme.space[1], paddingBottom: theme.space[1] },
  // Tomi vive en el rincón de abajo a la izquierda: en el teléfono lo de abajo
  // se corre para no taparlo.
  bottomNarrow: { paddingLeft: 78, paddingRight: 6 },
  hintSlot: { minHeight: 56, alignSelf: "stretch", justifyContent: "center" },
  answers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.space[2],
  },
  choice: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.token,
    minHeight: 44,
    justifyContent: "center",
    ...chipFace,
  },
  choiceOff: { opacity: 0.5 },
  choiceLabel: { color: theme.color.ink, fontSize: 14 },
  tools: { flexDirection: "row", gap: theme.space[2], minHeight: 36, alignItems: "center" },
  toggle: {
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[0],
    borderRadius: theme.radius.full,
    minHeight: 32,
    justifyContent: "center",
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
