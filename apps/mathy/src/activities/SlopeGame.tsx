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
 *   a otro lugar de la rampa cambia las marcas y no cambia el color;
 * - **estirarlo** hace crecer el vertical en proporción, y forzar un vertical
 *   que no corresponde lo despega de la rampa con una sombra donde apoyaba: la
 *   consecuencia es física y nadie dice "incorrecto";
 * - la **escalera** de escalones iguales dibuja la misma cuesta en todo el
 *   recorrido, y los dos escalones de anchos distintos encajan al superponerse;
 * - **estirar la grilla** sí cambia el color, porque cambió la grilla: la
 *   pendiente es propiedad del par recta y grilla y no del dibujo suelto.
 *
 * La escena es `WalkScene`, que el nodo 18 estrenó para la mecánica y que traía
 * el eje `step` apagado esperando a este nodo; su porqué está en su cabecera.
 * La manivela del costado es `TrackScene` sin tocarla: recibe una configuración
 * y ya. **Ninguna altura se calcula acá**: las resuelve `@mathy/mechanics` y la
 * pantalla las dibuja, o habría dos fuentes de verdad sobre qué es empinado.
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
import { TrackScene, trackLayout, type TrackConfig } from "../scenes/TrackScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Alto de la banda donde vive la manivela de `gears_sequence`. */
const CRANK_H = 104;
/** Alto de la banda de los deslizadores. */
const SLIDERS_H = 56;
/** Alto del mostrador de fichas. */
const CHIPS_H = 66;
/** Cuánto se puede estirar la grilla. */
const MAX_STRETCH = 4;
/** Hasta dónde llega el deslizador de arranque. */
const MAX_B = 4;

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

function Activity({ level, onLevelDone, onExit, onEvent }: SlopeGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateSlope(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
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
  /** Los dos deslizadores, independientes: inclinación y arranque. */
  const [mIdx, setMIdx] = useState(0);
  const [bIdx, setBIdx] = useState(0);
  const [picked, setPicked] = useState(-1);
  const [ghostOn, setGhostOn] = useState(false);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: t(openingHint(problem.ask)),
    tone: "dim",
  }));

  // --- La rampa que se dibuja ------------------------------------------------

  /** Las cuestas que el deslizador de inclinación recorre. */
  const cuestas = useMemo(() => slopeChoices(level.params.maxSlope, level.params.negative), [level]);

  /**
   * La rampa de la pantalla. Con los deslizadores puestos la arman ellos y no el
   * problema: mover el deslizador **es** cambiar la rampa, y leerla del problema
   * dejaría los deslizadores dibujando algo que no mueven.
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

  const sceneH = Math.max(360, Math.min(height * 0.62, 520));
  // Las bandas las decide el **nivel** y no lo que pase en la ronda: si el alto
  // cambiara al cambiar de pregunta, la rampa se movería debajo del dedo.
  const crankH = level.crank ? CRANK_H : 0;
  const slidersH = level.asks.some((a) => a === "set_sliders" || a === "stretch_grid")
    ? SLIDERS_H
    : 0;
  const chipsH = level.asks.some(
    (a) => a === "slope_between" || a === "read_form" || a === "pick_ramp",
  )
    ? CHIPS_H
    : 0;
  const walkH = sceneH - crankH - slidersH - chipsH;

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
    return {
      window: window0,
      square: true,
      // La ronda de las rectas escritas se juega sin dibujo: una cuadrícula
      // detrás de tres ecuaciones invita a leer una pendiente que no está.
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
      // El renglón acompaña a los deslizadores, que son los que lo mueven. En la
      // ronda que pregunta cuánto vale la pendiente sería la respuesta escrita
      // bajo la rampa.
      legend:
        level.tiles && conRampa && problem.ask !== "slope_between" && problem.ask !== "judge_slope"
          ? lineText(ramp)
          : "",
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

  const wl = useMemo(() => walkLayout(walkCfg, width, walkH), [walkCfg, width, walkH]);

  // --- La manivela de `gears_sequence` ---------------------------------------

  /**
   * El soporte con su manivela, sin tocar la escena de la mecánica. Cada vuelta
   * avanza una casilla, que es la misma casilla que el paso del caminante: por
   * eso las dos agujas salen del mismo número de vueltas.
   */
  const trackCfg = useMemo<TrackConfig>(
    () => ({
      slots: Math.max(2, Math.min(techo - pie, 8) + 1),
      skin: "mark",
      railRows: [0.52],
      numerals: "plain",
      zeroDot: true,
      walker: true,
      crank: true,
      flag: { at: problem.turns, pulse: true },
    }),
    [techo, pie, problem.turns],
  );
  const tl = useMemo(
    () => trackLayout(trackCfg, width, Math.max(crankH, 1)),
    [trackCfg, width, crankH],
  );

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

  /**
   * Los espejos de lo que el gesto necesita leer. Un worklet no ve el estado de
   * React: lo que capturó en el render en que se armó el gesto es una copia.
   */
  /**
   * Desde qué posición arrancó el arrastre. Es una aguja **aparte** de los
   * espejos: los espejos se reescriben en cada render, y el arrastre los
   * pisaría a mitad de camino con el valor que él mismo acaba de producir.
   */
  const dragFrom = useSharedValue(0);
  const runSV = useSharedValue(problem.step.run);
  const riseSV = useSharedValue(0);
  const stretchSV = useSharedValue(1);
  const mSV = useSharedValue(0);
  const bSV = useSharedValue(0);
  runSV.value = run;
  riseSV.value = escalonReal.rise;
  stretchSV.value = stretch;
  mSV.value = mIdx;
  bSV.value = bIdx;

  /**
   * Los lugares donde el escalón ya apoyó. Va en una referencia y no en estado
   * porque nada se dibuja distinto por eso: lo que el jugador ve es el color
   * quieto, y el color sale de la razón.
   */
  const apoyados = useRef<readonly number[]>([]);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Un temporizador que se cancela solo al cambiar de ronda o de pantalla. */
  const luego = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setFrom(problem.step.from);
    setRun(problem.step.run);
    setRise(problem.ask === "stretch_step" ? problem.step.rise : null);
    setStretch(1);
    setMIdx(0);
    setBIdx(0);
    apoyados.current = [];
    setPicked(-1);
    setGhostOn(false);
    setSolved(false);
    setMessage({ text: t(openingHint(problem.ask)), tone: "dim" });
    at.value = problem.step.from;
    walkerY.value = slHeightAt(problem.ramp, problem.step.from);
    pos.value = 0;
    sweep.value = 0;
    hint.value = 1;
    // El latido de la demostración: la mano fantasma apoya el escalón contra la
    // rampa y lo arrastra a otro lugar, y el color no cambia. Solo en las rondas
    // que se contestan con un gesto: sobre una ronda de fichas, una mano que
    // arrastra la nada es ruido y no instrucción.
    demo.value = conGesto(problem.ask)
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

  /** Tocar una de las tres rampas dibujadas. */
  const pickRamp = useCallback(
    (index: number) => {
      if (solved) return;
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
        succeed(t(problem.ask === "which_harder" ? "sl.hint.steepest" : "sl.hint.thatOne"));
        return;
      }
      setMessage({
        text: t(mal ? "sl.hint.moreStepsNotSteeper" : "sl.hint.otherRamp"),
        tone: "warn",
      });
    },
    [solved, quiet, problem, level, attempt, succeed, x0, x1, alcance],
  );

  /** Apoyar el escalón en otro lugar: las marcas cambian y el color no. */
  const placeStep = useCallback(
    (x: number) => {
      if (solved || problem.ask !== "place_step") return;
      const limitado = Math.round(Math.max(pie, Math.min(techo - run, x)));
      if (limitado === from) return;
      quiet();
      setFrom(limitado);
      if (apoyados.current.includes(limitado)) return;
      apoyados.current = [...apoyados.current, limitado];
      if (apoyados.current.length >= 2) {
        // Dos lugares distintos, la misma razón: es el invariante, hecho.
        attempt(true);
        succeed(t("sl.hint.sameColor"));
        return;
      }
      setMessage({ text: t("sl.hint.restAgain"), tone: "dim" });
    },
    [solved, problem.ask, pie, techo, run, from, quiet, attempt, succeed],
  );

  /** Estirar el escalón: el vertical crece solo, en proporción. */
  const stretchStep = useCallback(
    (nuevoRun: number, nuevoRise: number | null) => {
      if (solved || problem.ask !== "stretch_step") return;
      quiet();
      const ancho = Math.round(Math.max(1, Math.min(level.params.maxRun, nuevoRun)));
      // La esquina cae en un cruce de la grilla y no donde quedó el dedo: el
      // escalón se mide contando marcas, así que media marca no es una posición
      // que el jugador pueda querer.
      const alto = nuevoRise === null ? rise : Math.round(nuevoRise);
      setRun(ancho);
      setRise(alto);
      const puesto: SlStep = { from, run: ancho, rise: alto ?? slStepOn(ramp, from, ancho).rise };
      if (slRests(ramp, puesto)) {
        attempt(true);
        setRise(null);
        setGhostOn(true);
        succeed(t("sl.hint.itFits"));
        return;
      }
      const unidad = slStepOn(ramp, from, 1);
      const mal = slStretchMisconceptionFor(level, ramp, puesto, unidad);
      setMessage({ text: t(mal ? "sl.hint.wideNotSteeper" : "sl.hint.floating"), tone: "warn" });
    },
    [solved, problem.ask, level, rise, from, ramp, quiet, attempt, succeed],
  );

  /** Soltar el escalón estirado: el intento se cuenta al soltar y no por cuadro. */
  const dropStep = useCallback(() => {
    if (solved || problem.ask !== "stretch_step") return;
    const puesto: SlStep = { from, run, rise: rise ?? slStepOn(ramp, from, run).rise };
    if (slRests(ramp, puesto)) return;
    const unidad = slStepOn(ramp, from, 1);
    attempt(false, slStretchMisconceptionFor(level, ramp, puesto, unidad));
  }, [solved, problem.ask, from, run, rise, ramp, level, attempt]);

  /** Girar la manivela: cada vuelta avanza un paso y sube lo mismo. */
  const turn = useCallback(
    (vueltas: number) => {
      if (solved || problem.ask !== "crank") return;
      quiet();
      // Las vueltas viven en la aguja de la manivela y no en el estado: es el
      // mismo número que mueve al caminante de las dos escenas a la vez.
      const v = Math.max(0, Math.min(problem.turns + 2, Math.round(vueltas)));
      pos.value = v;
      at.value = pie + v;
      walkerY.value = slHeightAt(ramp, pie + v);
      if (v === problem.turns) {
        attempt(true);
        succeed(t("sl.hint.sameEveryTurn"));
        return;
      }
      setMessage({ text: t("sl.hint.keepTurning"), tone: "dim" });
    },
    [solved, problem.ask, problem.turns, pie, ramp, quiet, attempt, succeed, at, walkerY, pos],
  );

  /** Estirar la grilla: la recta es la misma y la cuesta que se lee, no. */
  const stretchGrid = useCallback(
    (k: number) => {
      if (solved || problem.ask !== "stretch_grid") return;
      quiet();
      const factor = Math.max(1, Math.min(MAX_STRETCH, Math.round(k)));
      if (factor === stretch) return;
      setStretch(factor);
      if (factor === problem.stretch) {
        attempt(true);
        succeed(t("sl.hint.gridChangedIt"));
        return;
      }
      setMessage({ text: t("sl.hint.keepStretching"), tone: "dim" });
    },
    [solved, problem.ask, problem.stretch, stretch, quiet, attempt, succeed],
  );

  /** Los dos deslizadores hasta que la rampa pase por los dos puntos. */
  const slide = useCallback(
    (cual: "m" | "b", valor: number) => {
      if (solved || problem.ask !== "set_sliders") return;
      quiet();
      const m = cual === "m" ? Math.max(0, Math.min(cuestas.length - 1, Math.round(valor))) : mIdx;
      const b = cual === "b" ? Math.max(-MAX_B, Math.min(MAX_B, Math.round(valor))) : bIdx;
      if (m === mIdx && b === bIdx) return;
      setMIdx(m);
      setBIdx(b);
      const candidata: SlRamp = { slope: cuestas[m] ?? { rise: 1, run: 1 }, intercept: b };
      const pasa = problem.points.every(
        (q) => Math.abs(slHeightAt(candidata, q.x) - q.y) < 1e-9,
      );
      if (pasa) {
        attempt(true);
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
    [solved, problem.ask, problem.points, cuestas, mIdx, bIdx, quiet, attempt, succeed],
  );

  /** Tocar una razón escrita: la pendiente entre dos puntos, o la `m` de la recta. */
  const pickRatio = useCallback(
    (index: number) => {
      if (solved) return;
      quiet();
      const elegida = problem.options[index];
      const objetivo = problem.options[problem.correct];
      if (!elegida || !objetivo) return;
      setPicked(index);
      const ok = slSameRatio(elegida, objetivo);
      // El error del catálogo se lee sobre la subida y el avance **que el
      // jugador midió**, que es el par del escalón apoyado sobre los dos puntos
      // y no la pendiente ya reducida: contestar la subida sola es el error solo
      // cuando el avance no valía uno.
      const a = problem.points[0];
      const b = problem.points[1];
      const medido: SlRatio =
        a && b ? { rise: b.y - a.y, run: b.x - a.x } : objetivo;
      const mal = slMisconceptionFor(level, elegida, medido);
      attempt(ok, mal);
      if (ok) {
        succeed(t(problem.ask === "read_form" ? "sl.hint.thatIsM" : "sl.hint.thatIsTheSlope"));
        return;
      }
      setMessage({
        text: t(
          mal === "slope_as_rise_only"
            ? "sl.hint.riseOnly"
            : mal === "slope_confuses_step_with_rate"
              ? "sl.hint.runOnly"
              : "sl.hint.otherRatio",
        ),
        tone: "warn",
      });
    },
    [solved, quiet, problem.options, problem.correct, problem.ask, problem.points, level, attempt, succeed],
  );

  /** Contestar el caso del nivel final. */
  const judge = useCallback(
    (index: number) => {
      if (solved) return;
      quiet();
      setPicked(index);
      const ok = index === answerFor(problem.kase);
      attempt(ok);
      if (ok) {
        succeed(t(`sl.hint.why.${problem.kase}`));
        return;
      }
      setMessage({ text: t("sl.hint.lookAgain"), tone: "warn" });
    },
    [solved, quiet, problem.kase, attempt, succeed],
  );

  /**
   * Lo que el gesto llama viaja en una referencia estable: si el objeto del
   * `Gesture` cambiara de identidad entre renders, el detector tendría que
   * reengancharlo y el arrastre se perdería a mitad de camino.
   */
  const acciones = useRef({
    pickRamp,
    placeStep,
    stretchStep,
    dropStep,
    turn,
    stretchGrid,
    slide,
    pickRatio,
    judge,
  });
  acciones.current = {
    pickRamp,
    placeStep,
    stretchStep,
    dropStep,
    turn,
    stretchGrid,
    slide,
    pickRatio,
    judge,
  };

  /**
   * Todo lo que un gesto llama es estable entre renders. No es prolijidad:
   * gesture-handler en web **pierde el gesto si el objeto del `Gesture` cambia
   * de identidad**, y una flecha escrita en el JSX lo cambiaría en cada cuadro
   * del arrastre, que es justo cuando el gesto está en curso.
   */
  const alCaminar = useCallback((x: number) => acciones.current.placeStep(x), []);
  const alSoltarEscalon = useCallback(() => acciones.current.dropStep(), []);
  const alEstirarAncho = useCallback((r: number) => acciones.current.stretchStep(r, null), []);
  const alEstirarAlto = useCallback(
    (v: number) => acciones.current.stretchStep(runSV.value, v),
    [runSV],
  );
  const alGirar = useCallback((v: number) => acciones.current.turn(v), []);
  const alGirarUna = useCallback(() => acciones.current.turn(pos.value + 1), [pos]);
  const alEstirarGrilla = useCallback((k: number) => acciones.current.stretchGrid(k), []);
  const alDeslizarM = useCallback((v: number) => acciones.current.slide("m", v), []);
  const alDeslizarB = useCallback((v: number) => acciones.current.slide("b", v), []);
  const alTocarFicha = useCallback((i: number) => acciones.current.pickRatio(i), []);
  const alTocarRampa = useCallback((_i: number, x: number, y: number) => {
    const cual = nearestCurve(candidatasRef.current, planeRef.current, x, y);
    if (cual >= 0) acciones.current.pickRamp(cual);
  }, []);

  /** Las curvas y el plano que el hit test necesita, sin rearmar el gesto. */
  const candidatasRef = useRef(candidatas);
  candidatasRef.current = candidatas;
  const planeRef = useRef(wl.sheet);
  planeRef.current = wl.sheet;

  // --- Lo que la actividad dibuja por su cuenta ------------------------------

  const chipsY = crankH + walkH + slidersH + CHIPS_H / 2;
  const slidersY = crankH + walkH;

  /** Las fichas del mostrador: las razones escritas entre las que se elige. */
  const chipSpots = useMemo(() => {
    const paso = Math.min(width / (SL_OPTION_SLOTS + 1), 120);
    return Array.from({ length: SL_OPTION_SLOTS }, (_, i) => ({
      x: width / 2 + (i - (SL_OPTION_SLOTS - 1) / 2) * paso,
      y: chipsY,
    }));
  }, [width, chipsY]);

  const conFichas =
    (problem.ask === "slope_between" || problem.ask === "read_form") && !solved;

  const chipGeom = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const texto = Skia.Path.Make();
    if (!conFichas) return { cuerpo, texto };
    problem.options.forEach((r, i) => {
      const s = chipSpots[i];
      if (!s) return;
      cuerpo.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 44, s.y - 20, 88, 40), 8, 8));
      texto.addPath(walkTextPath(ratioText(r), s.x, s.y, 20));
    });
    return { cuerpo, texto };
  }, [conFichas, problem.options, chipSpots]);

  /**
   * Lo que se pregunta, escrito. En el nivel de las tres rampas es la ficha que
   * dice cuánto sube por paso; en el de las formas, las tres rectas escritas.
   */
  const askedGeom = useMemo(() => {
    const path = Skia.Path.Make();
    if (problem.ask === "pick_ramp") {
      const objetivo = problem.ramps[problem.correct];
      if (objetivo) {
        path.addPath(walkTextPath(ratioText(slReduce(objetivo.slope)), width / 2, chipsY, 26));
      }
      return path;
    }
    if (problem.ask === "read_form") {
      problem.written.forEach((w, i) => {
        path.addPath(
          walkTextPath(formText(w), width / 2, crankH + 60 + i * 52, 22),
        );
      });
    }
    return path;
  }, [problem.ask, problem.ramps, problem.correct, problem.written, width, chipsY, crankH]);

  /** Los dos deslizadores y sus manijas. Independientes, como pide el diseño. */
  const sliders = useMemo(() => {
    const via = Skia.Path.Make();
    const perilla = Skia.Path.Make();
    if (slidersH === 0) return { via, perilla, spots: [] as { x: number; y: number }[] };
    const izq = 60;
    const der = width - 60;
    const spots: { x: number; y: number }[] = [];
    const filas: readonly { readonly y: number; readonly frac: number }[] =
      problem.ask === "set_sliders"
        ? [
            { y: slidersY + 18, frac: cuestas.length > 1 ? mIdx / (cuestas.length - 1) : 0 },
            { y: slidersY + 40, frac: (bIdx + MAX_B) / (2 * MAX_B) },
          ]
        : [{ y: slidersY + 28, frac: (stretch - 1) / (MAX_STRETCH - 1) }];
    for (const fila of filas) {
      via.moveTo(izq, fila.y);
      via.lineTo(der, fila.y);
      const x = izq + (der - izq) * fila.frac;
      perilla.addCircle(x, fila.y, 11);
      spots.push({ x, y: fila.y });
    }
    return { via, perilla, spots };
  }, [slidersH, slidersY, width, problem.ask, cuestas.length, mIdx, bIdx, stretch]);

  const preguntaCaso = problem.ask === "judge_slope" && !solved;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_LINEAR_SLOPE}.name`)} · nivel ${level.n} de ${TOTAL_SL_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: la manivela, la rampa y las fichas viven
            adentro del mismo. */}
        <Canvas style={{ width, height: sceneH }}>
          {level.crank ? (
            <TrackScene
              config={trackCfg}
              layout={tl}
              pos={pos}
              appear={appear}
              hint={hint}
              demo={quieto}
            />
          ) : null}

          <Group transform={[{ translateY: crankH }]}>
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

          <Path path={sliders.via} color={theme.color.line} style="stroke" strokeWidth={3} />
          <Path path={sliders.perilla} color={theme.color.accent} />
          <Path path={chipGeom.cuerpo} color={theme.color.line} style="stroke" strokeWidth={1.5} />
          <Path path={chipGeom.texto} color={theme.color.ink} />
          <Path path={askedGeom} color={theme.color.ink} />
        </Canvas>

        {/* Las asas invisibles: el dibujo es Skia y el gesto es la vista.
            Siempre las mismas, y las que esta ronda no usa quedan sordas: un asa
            deshabilitada tiene que quedar montada, y sin recibir toques, o se
            come los del lienzo. */}
        <Surface
          x={0}
          y={crankH}
          w={width}
          h={walkH}
          enabled={(problem.ask === "place_step" || eligeRampa) && !solved}
          tapping={eligeRampa}
          plane={wl.sheet}
          offsetY={crankH}
          from={pie}
          to={techo}
          onDrag={alCaminar}
          onTap={alTocarRampa}
          startAt={dragFrom}
        />

        {/* Las dos manijas del escalón: el ancho abajo y la subida al costado. */}
        <Knob
          x={walkPx(wl.sheet, (from + run) * stretch) - 22}
          y={crankH + walkPy(wl.sheet, slHeightAt(ramp, from)) - 22}
          enabled={problem.ask === "stretch_step" && !solved}
          unit={wl.sheet.ux * stretch}
          value={runSV}
          onMove={alEstirarAncho}
          onDrop={alSoltarEscalon}
          axis="x"
        />
        <Knob
          x={walkPx(wl.sheet, (from + run) * stretch) - 22}
          y={crankH + walkPy(wl.sheet, slHeightAt(ramp, from) + escalonReal.rise) - 22}
          enabled={problem.ask === "stretch_step" && !solved}
          unit={-wl.sheet.uy}
          value={riseSV}
          onMove={alEstirarAlto}
          onDrop={alSoltarEscalon}
          axis="y"
        />

        {/* La manivela: un toque es una vuelta, y el arrastre las cuenta. */}
        <Knob
          x={tl.crank.x - tl.crank.r}
          y={tl.crank.y - tl.crank.r}
          w={tl.crank.r * 2}
          h={tl.crank.r * 2}
          enabled={problem.ask === "crank" && !solved}
          unit={26}
          value={pos}
          onMove={alGirar}
          onTap={alGirarUna}
          axis="x"
        />

        {/* Los deslizadores. */}
        {sliders.spots.map((s, i) => (
          <Knob
            key={`s${i}`}
            x={s.x - 22}
            y={s.y - 22}
            enabled={!solved && (problem.ask === "set_sliders" || problem.ask === "stretch_grid")}
            unit={(width - 120) / (problem.ask === "stretch_grid" ? MAX_STRETCH - 1 : sliderSteps(i, cuestas.length))}
            value={problem.ask === "stretch_grid" ? stretchSV : i === 0 ? mSV : bSV}
            onMove={
              problem.ask === "stretch_grid"
                ? alEstirarGrilla
                : i === 0
                  ? alDeslizarM
                  : alDeslizarB
            }
            axis="x"
          />
        ))}

        {/* Las fichas de razones. */}
        {Array.from({ length: SL_OPTION_SLOTS }, (_, i) => {
          const s = chipSpots[i] ?? { x: 0, y: 0 };
          return (
            <Handle
              key={`f${i}`}
              index={i}
              x={s.x - 46}
              y={s.y - 22}
              w={92}
              h={44}
              enabled={conFichas && i < problem.options.length}
              onTap={alTocarFicha}
            />
          );
        })}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {preguntaCaso ? (
        <View style={styles.answers}>
          {answersFor(problem.kase).map((clave, i) => (
            <Choice key={clave} label={t(clave)} onPress={() => acciones.current.judge(i)} />
          ))}
        </View>
      ) : null}

      <View style={styles.tools}>
        {level.ghostRamp && conRampa ? (
          <Toggle
            label={t(ghostOn ? "sl.ramp.hide" : "sl.ramp.show")}
            onPress={() => setGhostOn((on) => !on)}
          />
        ) : null}
      </View>

      {level.definition ? <Text style={styles.definition}>{t("sl.definition")}</Text> : null}
    </View>
  );
}

// --- Lo que la pantalla decide, y que no es del modelo ------------------------

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

/** Las cuestas que el deslizador de inclinación recorre, de la más baja a la más alta. */
function slopeChoices(maxSlope: number, negative: boolean): readonly SlRatio[] {
  const out: SlRatio[] = [];
  for (let rise = negative ? -maxSlope : 0; rise <= maxSlope; rise++) {
    out.push({ rise, run: 1 });
  }
  return out;
}

/** Cuántos pasos tiene un deslizador: el de la cuesta los suyos, el del arranque los suyos. */
const sliderSteps = (fila: number, cuestas: number): number =>
  fila === 0 ? Math.max(1, cuestas - 1) : 2 * MAX_B;

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
    for (const punto of curva.points) {
      const d = Math.hypot(x - walkPx(plane, punto.x), y - walkPy(plane, punto.y));
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

/** El renglón bajo la rampa: `y = mx + b`, con los dos números puestos. */
function lineText(ramp: SlRamp): string {
  const m = slReduce(ramp.slope);
  const pendiente = m.rise === 1 ? "" : m.rise === -1 ? "−" : ratioText(m);
  const b = ramp.intercept;
  const arranque = b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`;
  if (m.rise === 0) return `y = ${b}`;
  return `y = ${pendiente}x${arranque}`;
}

/** Una recta escrita, en la forma en que viene. */
function formText(w: SlWritten): string {
  if (w.form === "solved") {
    const m = slSlopeOfWritten(w);
    const b = w.b === 0 ? 0 : w.c / w.b;
    if (!m) return `x = ${walkNumeral(w.c / w.a)}`;
    const pendiente = m.rise === 1 ? "" : m.rise === -1 ? "−" : ratioText(m);
    const arranque = b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`;
    return `y = ${pendiente}x${arranque}`;
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

function openingHint(ask: string): string {
  if (ask === "pick_ramp") return "sl.hint.pickRamp";
  if (ask === "which_harder") return "sl.hint.whichHarder";
  if (ask === "place_step") return "sl.hint.placeStep";
  if (ask === "stretch_step") return "sl.hint.stretchStep";
  if (ask === "crank") return "sl.hint.crank";
  if (ask === "stretch_grid") return "sl.hint.stretchGrid";
  if (ask === "set_sliders") return "sl.hint.setSliders";
  if (ask === "slope_between") return "sl.hint.slopeBetween";
  if (ask === "read_form") return "sl.hint.readForm";
  return "sl.hint.judge";
}

// --- Las asas ----------------------------------------------------------------

/**
 * La superficie de la rampa. El arrastre lleva el escalón y el toque elige una
 * de las curvas, en carrera porque un `Pan` habilitado le gana siempre a un
 * `Tap` que escuche la misma superficie.
 *
 * El gesto lee `translationX` y no acumula `changeX`: el evento que activa el
 * gesto no llega a `onChange`, y con deltas el arrastre del navegador
 * automatizado se pierde entero.
 */
function Surface({
  x,
  y,
  w,
  h,
  enabled,
  tapping,
  plane,
  offsetY,
  from,
  to,
  onDrag,
  onTap,
  startAt,
}: {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly tapping: boolean;
  readonly plane: { readonly cx: number; readonly ux: number };
  readonly offsetY: number;
  readonly from: number;
  readonly to: number;
  readonly onDrag: (x: number) => void;
  readonly onTap: (index: number, x: number, y: number) => void;
  readonly startAt: { value: number };
}) {
  const gesture = useMemo(() => {
    const cx = plane.cx;
    const ux = plane.ux;
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd((e) => {
        if (tapping) {
          runOnJS(onTap)(0, e.x + x, e.y + y - offsetY);
          return;
        }
        runOnJS(onDrag)(Math.round(Math.max(from, Math.min(to, (e.x + x - cx) / ux))));
      });

    const pan = Gesture.Pan()
      .enabled(enabled && !tapping)
      .onBegin((e) => {
        startAt.value = Math.max(from, Math.min(to, (e.x + x - cx) / ux));
      })
      .onChange((e) => {
        runOnJS(onDrag)(Math.round(startAt.value + e.translationX / ux));
      })
      .onEnd((e) => {
        runOnJS(onDrag)(Math.round(startAt.value + e.translationX / ux));
      });

    return Gesture.Race(pan, tap);
  }, [enabled, tapping, plane, offsetY, from, to, onDrag, onTap, x, y, startAt]);

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
 * Una manija: se arrastra a lo largo de un eje y entrega el valor en unidades.
 *
 * El valor de partida viaja en una aguja y no en una variable de la clausura
 * porque el gesto corre en el hilo de la interfaz y una variable capturada allá
 * es una copia: se escribiría y nadie la leería.
 */
function Knob({
  x,
  y,
  w = 44,
  h = 44,
  enabled,
  unit,
  value,
  onMove,
  onDrop,
  onTap,
  axis,
}: {
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly h?: number;
  readonly enabled: boolean;
  readonly unit: number;
  readonly value: { value: number };
  readonly onMove: (v: number) => void;
  readonly onDrop?: () => void;
  readonly onTap?: () => void;
  readonly axis: "x" | "y";
}) {
  const desde = useSharedValue(0);
  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(enabled)
      .onBegin(() => {
        desde.value = value.value;
      })
      .onChange((e) => {
        const d = axis === "x" ? e.translationX : e.translationY;
        runOnJS(onMove)(desde.value + d / unit);
      })
      .onEnd((e) => {
        const d = axis === "x" ? e.translationX : e.translationY;
        runOnJS(onMove)(desde.value + d / unit);
        if (onDrop) runOnJS(onDrop)();
      });
    if (!onTap) return pan;
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)();
      });
    return Gesture.Race(pan, tap);
  }, [enabled, unit, value, onMove, onDrop, onTap, axis, desde]);

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

/** Un asa invisible sobre lo que Skia dibuja: solo el toque. */
function Handle({
  index,
  x,
  y,
  w,
  h,
  enabled,
  onTap,
}: {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onTap: (index: number) => void;
}) {
  const gesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(20)
        .enabled(enabled)
        .onEnd(() => {
          runOnJS(onTap)(index);
        }),
    [enabled, index, onTap],
  );

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
