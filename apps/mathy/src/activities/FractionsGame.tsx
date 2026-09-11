/**
 * La pizza y la barra: el minijuego de `arith.frac.parts_and_ratio`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. La primera ronda de cada
 * nivel se juega con Lumi al lado (la lección está en `lessons/fractions.ts`):
 * cada paso señala algo real del tablero y avanza cuando el jugador hace el
 * gesto. Los mensajes de abajo cuentan lo que pasó, nunca dicen "mal", y todo
 * rechazo dice algo: un toque que no llegó a ningún lado explica dónde tocar.
 *
 * El nodo tiene tres mecánicas y por eso dos superficies. `tiles` y `ledger`
 * viven las dos en la barra —el corte y el libro de cuentas que anota una ficha
 * por parte encendida— y las dibuja `TilesScene` con su configuración de
 * partición. `urn_dice` es el frasco, y la dibuja `UrnScene`. Esta actividad no
 * dibuja nada: elige qué escena mira el jugador en cada ronda, le pasa su
 * configuración y traduce el dedo en los valores que las dos animan.
 *
 * Los gestos, y ninguno fino:
 *
 * - Arrastrar sobre la barra, hacia cualquier lado. Aparece una línea de corte
 *   por cada paso que se aleja el dedo, y las que ya están se corren para
 *   repartirse el espacio: la mecánica no deja cortar desparejo por accidente.
 * - Mantener el dedo quieto sobre la barra mientras corta. Las líneas se sueltan
 *   y quedan donde el jugador las puso. Cortar desparejo es posible, pero hay que
 *   quererlo, y dura un solo corte: el arrastre siguiente vuelve a acomodarlas.
 * - Tocar la barra para encender una parte. El libro anota una ficha por cada
 *   una, todas iguales.
 * - Tocar un todo de la lámina. Es `recognize` sin leer: cuatro pizzas cortadas
 *   de formas distintas y una sola muestra exactamente la parte de la ficha.
 * - Tocar el frasco para sacar una bola. Se apilan por color en dos columnas, y
 *   la llave abarca las dos: el todo es el frasco y no la columna más alta.
 * - Tocar una marca de la recta. Ahí se clava la ficha, y es la única vez que
 *   el nodo afirma que una fracción es un número y no un dibujo.
 * - Elegir una ficha del teclado, para el reparto, la comparación y los todos
 *   que nunca vio. En la comparación, tocar el tablero trae las dos barras.
 *
 * El único error que clasifica es `fraction_add_across`, que es el único que el
 * catálogo de L declara sobre este nodo. Contar pedazos en vez de partes
 * iguales, creer que el de abajo más grande es la fracción más grande y olvidar
 * el todo están previstos en el diseño y no tienen entrada, así que se muestran
 * y no se anotan.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
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
  FRAC_BALL_SLOTS,
  FRAC_MAX_PARTS,
  FRAC_OPTION_SLOTS,
  FRAC_WHOLE_SLOTS,
  NODE_FRAC_PARTS,
  TOTAL_FRAC_LEVELS,
  fracMisconceptionFor,
  generateFractions,
  type FracAsk,
  type FracLevel,
  type FracOption,
  type FracValue,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TilesScene,
  tilesLayout,
  type RowSlot,
  type TilesConfig,
  type TilesWhole,
} from "../scenes/TilesScene.tsx";
import { UrnScene, urnLayout, type UrnConfig } from "../scenes/UrnScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";
import { chipFace } from "../ui/Kit.tsx";

/** Cuánto hay que alejar el dedo para agregar una línea de corte. */
const CUT_STEP = 26;
/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;

/** Las preguntas que se contestan con una ficha del teclado. */
const CON_TECLADO: ReadonlySet<FracAsk> = new Set<FracAsk>(["draw", "share", "compare", "odd", "which"]);

/**
 * El rincón de Tomi. Vive abajo a la izquierda de toda actividad
 * (`ui/HintBuddy.tsx`), encima de todo: en una pantalla angosta es un botón de
 * 52 más 10 de margen y 8 de holgura; en una ancha, 64 más 16 y 8. En un
 * teléfono el teclado de cuatro fichas llegaba hasta ese rincón y el toque en
 * la primera ficha abría una pista en vez de contestar: si la respuesta era esa
 * ficha, la ronda no se podía terminar. El teclado deja libre ese ancho.
 */
const TOMI_ANGOSTO = 74;
const TOMI_ANCHO = 92;
/** Ancho y separación de las fichas del teclado. */
const FICHA = 76;
const FICHA_MIN = 56;
const ENTRE_FICHAS = 10;

/** Por qué un toque no llegó a nada. Viaja como número desde el worklet. */
const FUERA_BARRA = 1;
const FUERA_FRASCO = 2;
const FUERA_TODO = 3;
const FUERA_RECTA = 4;

export interface FractionsGameProps {
  readonly level: FracLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function FractionsGame(props: FractionsGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

function Activity({ level, onLevelDone, onEvent }: FractionsGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const ventana = useWindowDimensions();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  const conLeccion = lesson?.lesson !== undefined;

  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** En cuántas partes cortó el jugador, y cuántas encendió. */
  const [cut, setCut] = useState({ parts: 0, lit: 0, even: true });
  /** En qué marca de la recta quedó clavada la ficha, o null. */
  const [pinned, setPinned] = useState<number | null>(null);
  /** Qué todo o qué frasco tocó, o -1. */
  const [picked, setPicked] = useState(-1);
  /** Cuántas bolas sacó del frasco. */
  const [drawnCount, setDrawnCount] = useState(0);
  /** En la comparación, las dos barras ya están a la vista. */
  const [barsShown, setBarsShown] = useState(false);

  const problem = useMemo(
    () => generateFractions(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;
  // La guía se juega en la primera ronda: sus pasos son de la pregunta de esa
  // ronda. En las rondas de otra pregunta, la pista de Tomi no tiene gesto que
  // mostrar; si no se lo decimos, habla del gesto de la otra pregunta.
  const primeraPregunta = useRef(ask);
  if (round === 0) primeraPregunta.current = ask;
  const preferHint = lesson?.preferHint;
  useEffect(() => {
    preferHint?.(ask === primeraPregunta.current ? null : "");
  }, [ask, preferHint]);
  /** Con lección, el cartel dice qué hacer y la línea de abajo queda para lo que pasó. */
  const opening = conLeccion ? "" : openingHint(ask);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: opening,
    tone: "dim",
  }));

  // Hasta la primera medida, el alto se estima por nivel y no por ronda: un
  // nivel que alterna una pregunta con teclado y otra sin él cuenta siempre con
  // el teclado.
  const nivelConTeclado = level.asks.some((a) => CON_TECLADO.has(a));
  /**
   * El alto que de verdad le queda al tablero, medido. Con el cartel de la
   * guía, en un teléfono de 390 × 844, un lienzo calculado como fracción de la
   * ventana empujaba la línea de abajo fuera de la pantalla: el jugador no veía
   * ningún mensaje de lo que pasaba. El tablero toma lo que sobra.
   */
  const [areaH, setAreaH] = useState(0);
  const estimado = height * (conLeccion ? 0.5 : 0.66) - (nivelConTeclado ? 64 : 0);
  const sceneH = Math.max(220, Math.min(areaH > 0 ? areaH : estimado, 540));
  const usaFrasco = ask === "draw";

  // --- Lo que ve cada escena -------------------------------------------------

  const wholes = useMemo<TilesWhole[]>(() => {
    if (usaFrasco) return [];
    // La comparación no tiene dibujo, pero la barra se pide con un toque: las
    // dos fichas cortadas del mismo largo, una sobre otra, y la comparación se
    // ve sin decir nada.
    if (ask === "compare") {
      if (!barsShown) return [];
      return problem.options.map((o) => ({
        id: `c${o.id}`,
        parts: o.value.den,
        shaded: o.value.num,
        even: true,
        span: 1,
        disc: false,
        glow: false,
      }));
    }
    return problem.wholes.map((w, i) => ({
      id: w.id,
      // El todo vivo es el que el jugador está cortando; los demás llegan como
      // el generador los dejó.
      parts: i === 0 && ask === "cut" ? cut.parts : w.parts,
      shaded: i === 0 && ask === "cut" ? cut.lit : w.shaded,
      even: i === 0 && ask === "cut" ? cut.even : w.even,
      span: w.span,
      disc: w.disc,
      // Sólo reclama luz lo que hay que tocar o lo que acaba de coincidir: en
      // la suma cruzada y el reparto las barras son para mirar, y un halo en
      // una sola diría que es esa la respuesta.
      glow:
        ask === "pick"
          ? w.correct && solved
          : (ask === "cut" || ask === "odd") && i === 0 && !solved,
    }));
  }, [problem, usaFrasco, ask, cut, solved, barsShown]);

  const tilesConfig = useMemo<TilesConfig>(
    () => ({
      rows: 1,
      cols: 1,
      frameRows: 1,
      frameCols: 1,
      skin: level.skin,
      frame: false,
      loose: [],
      cut: 0,
      total: null,
      keys: false,
      onDemand: false,
      partition: {
        wholes,
        marking: problem.marking,
        ledger: level.ledger && ask === "cut",
        chip: level.chip === "numerals" ? "numerals" : "dots",
        chipValue: chipValueFor(problem.target, ask),
        division: ask === "share" ? { a: problem.bars, b: problem.plates } : null,
        plates: ask === "share" ? problem.plates : 0,
        ticks: ask === "pin" ? problem.ticks : 0,
        pinned,
      },
    }),
    [level.skin, level.ledger, level.chip, wholes, problem, ask, pinned],
  );

  const urnConfig = useMemo<UrnConfig>(
    () => ({
      urns: [{ id: "u0", composition: problem.urn, glow: !solved }],
      skin: level.urnSkin,
      source: "urn",
      shape: "ball",
      highlighted: problem.highlighted,
      brace: true,
      // La urna se retira sola: la ficha aparece al vaciarse el frasco, y en
      // cuanto aparece ya no hace falta seguir sacando.
      revealAt: problem.urn.reduce((s, n) => s + n, 0),
      refill: problem.refill,
      chip: level.chip === "numerals" ? "numerals" : "dots",
      chipValue: solved ? problem.target : null,
      drawable: true,
    }),
    [problem, level.urnSkin, level.chip, solved],
  );

  const tl = useMemo(
    () => tilesLayout(tilesConfig, width, sceneH, FRAC_WHOLE_SLOTS),
    [tilesConfig, width, sceneH],
  );
  const ul = useMemo(
    () => urnLayout(urnConfig, width, sceneH, FRAC_BALL_SLOTS),
    [urnConfig, width, sceneH],
  );

  // --- Lo que las escenas animan ---------------------------------------------

  const parts = useSharedValue(0);
  const lit = useSharedValue(0);
  const divide = useSharedValue(0);
  /**
   * Si el corte de esta pasada es a mano. La decisión no puede viajar en un
   * cierre: un worklet captura el del render en que se armó el gesto, así que
   * viaja en un valor compartido.
   */
  const uneven = useSharedValue(0);
  const token = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const tilesAppear = useSharedValue(0);
  const urnAppear = useSharedValue(0);
  const drawn = useSharedValue(0);
  const refill = useSharedValue(0);
  const urnChip = useSharedValue(0);
  const brace = useSharedValue(0);
  // Los valores que el piso de `tiles` necesita y esta partición no usa. Están
  // quietos: la escena los lee igual y no cuesta nada.
  const placed = useSharedValue(0);
  const spin = useSharedValue(0);
  const split = useSharedValue(0);
  const keys = useSharedValue(0);
  const cross = useSharedValue(0);
  const ghost = useSharedValue(1);
  const drawnList = useMemo(() => [drawn], [drawn]);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * Lo que el corte necesita saber, en una referencia.
   *
   * El gesto lo construye `GestureDetector`, que no siempre adopta la función
   * nueva en el mismo cuadro en que el estado cambia; con el estado capturado
   * en el cierre, el segundo corte se resolvía contra una cuenta vieja. Acá la
   * cuenta vive en una referencia y el gesto lee siempre la de ahora.
   */
  const bag = useRef({ parts: 0, lit: 0, even: true, drawn: 0 });
  /**
   * La ronda que se está jugando, en una referencia.
   *
   * Un worklet captura el callback del render en que se armó el gesto, así que
   * `nextRound` leído desde un gesto veía siempre la ronda cero y el nivel no
   * terminaba nunca: se quedaba dando vueltas. La decisión de terminar tiene
   * que viajar en una referencia, no en un cierre.
   */
  const roundRef = useRef(round);
  roundRef.current = round;
  /**
   * El problema y el estado de la ronda, por la misma razón. Todo lo que un
   * gesto necesita saber se lee de acá y nunca del cierre.
   */
  const vivo = useRef({ problem, ask, solved, level });
  vivo.current = { problem, ask, solved, level };

  useEffect(() => {
    doneRef.current = false;
    bag.current = { parts: 0, lit: 0, even: true, drawn: 0 };
    setCut({ parts: 0, lit: 0, even: true });
    setPinned(null);
    setPicked(-1);
    setDrawnCount(0);
    setSolved(false);
    setBarsShown(false);
    setMessage({ text: opening, tone: "dim" });

    // En las preguntas que no se cortan, el todo llega como el generador lo
    // dejó y los valores compartidos solo lo acompañan.
    const w0 = problem.wholes[0];
    parts.value = ask === "cut" ? 0 : (w0?.parts ?? 0);
    lit.value = ask === "cut" ? 0 : (w0?.shaded ?? 0);
    divide.value = 0;
    // El corte a mano no se hereda: cada todo llega entero y con las líneas
    // acomodándose solas, o el nivel entero quedaría desparejo por un descuido.
    uneven.value = 0;
    // La ficha objetivo tiene que estar desde el principio en las preguntas que
    // se contestan contra ella; donde la ficha es la respuesta, aparece al final.
    token.value = ask === "cut" || ask === "pick" || ask === "share" || ask === "pin" ? 1 : 0;
    drawn.value = 0;
    refill.value = 0;
    urnChip.value = 0;
    brace.value = usaFrasco ? 0 : 1;
    tilesAppear.value = withTiming(usaFrasco ? 0 : 1, { duration: theme.motion.base });
    urnAppear.value = withTiming(usaFrasco ? 1 : 0, { duration: theme.motion.base });

    // El latido marca qué se toca. No es un reloj: no apura nada.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => {
      cancelAnimation(hint);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La mano fantasma era la única instrucción del juego. Con guía, la yema de la
  // guía es la demostración: dos manos a la vez señalarían dos cosas distintas.
  // Y sin guía, no arranca detrás de la tarjeta de entrada.
  useEffect(() => {
    if (guided || !playing) {
      cancelAnimation(demo);
      demo.value = 0;
      return;
    }
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    return () => cancelAnimation(demo);
  }, [problem, guided, playing, demo]);

  // El reloj arranca cuando se muestra el problema: la latencia es del jugador,
  // no del render ni de la tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem, playing]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa. Por
  // referencia: el callback de un gesto puede estar un render atrasado.
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_FRAC_PARTS, layer: level.layer });
  }, [level.layer, onEvent]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_FRAC_PARTS,
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
    cancelAnimation(hint);
    hint.value = withTiming(0, { duration: 260 });
  }, [hint]);

  const nextRound = useCallback(() => {
    const r = roundRef.current;
    if (r + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_FRAC_PARTS, level: level.n });
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
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      say("solved");
      setTimeout(() => advanceRef.current(), 1700);
    },
    [quiet, say],
  );

  // --- La barra --------------------------------------------------------------

  /**
   * El corte quedó hecho. Mientras el dedo arrastra, las líneas ya puestas se
   * corren solas para repartirse el espacio: cortar desparejo por accidente no
   * se puede, y por eso el estado que llega acá es un número de partes.
   *
   * Lo encendido se conserva al volver a cortar. Si con el corte nuevo la barra
   * ya dice lo que pide la ficha, la ronda se resuelve acá: el tablero mostraba
   * la respuesta y el nivel no la tomaba hasta dar la vuelta entera tocando.
   */
  const commitCut = useCallback(
    (n: number, even: boolean) => {
      const { problem: p, ask: a, solved: hecho } = vivo.current;
      if (hecho || a !== "cut") return;
      quiet();
      const encendidas = Math.min(bag.current.lit, n);
      bag.current = { ...bag.current, parts: n, lit: encendidas, even };
      setCut({ parts: n, lit: encendidas, even });
      parts.value = withTiming(n, { duration: theme.motion.quick });
      lit.value = withTiming(encendidas, { duration: theme.motion.quick });
      if (!even) {
        setMessage({
          text: "Esos pedazos no miden lo mismo. Arrastrá otra vez y se acomodan parejos.",
          tone: "warn",
        });
        return;
      }
      const den = p.target.den;
      attempt(n === den);
      if (n === den) {
        say("cut");
        if (encendidas === p.target.num) {
          token.value = withTiming(1, { duration: theme.motion.base });
          succeed("Partes iguales y encendidas las que pide la ficha: eso es la fracción.");
          return;
        }
        setMessage({
          text:
            encendidas > 0
              ? "Partes iguales, tantas como pide la ficha. Tocá para encender o apagar."
              : "Partes iguales, tantas como pide la ficha. Ahora tocá para encender.",
          tone: "dim",
        });
        return;
      }
      setMessage({
        text:
          n > den
            ? "Son más partes que las de la ficha. Arrastrá más corto."
            : "Son menos partes que las de la ficha. Arrastrá más largo.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, say, succeed],
  );

  /** Un toque sobre la barra enciende una parte más. El libro anota una ficha. */
  const lightOne = useCallback(() => {
    const { problem: p, ask: a, solved: hecho } = vivo.current;
    if (hecho || a !== "cut") return;
    const n = bag.current.parts;
    if (n < 2) {
      setMessage({
        text: "Primero cortá: apoyá el dedo en la barra y arrastrá hacia abajo.",
        tone: "dim",
      });
      return;
    }
    // Pasada la última, se apagan todas: tocar de más nunca traba la barra.
    const siguiente = bag.current.lit + 1 > n ? 0 : bag.current.lit + 1;
    bag.current = { ...bag.current, lit: siguiente };
    setCut((c) => ({ ...c, lit: siguiente }));
    lit.value = withTiming(siguiente, { duration: theme.motion.quick });
    quiet();

    if (!bag.current.even) {
      attempt(false);
      setMessage({
        text: "Esos pedazos no son partes iguales: no se apilan. Arrastrá otra vez.",
        tone: "warn",
      });
      return;
    }
    if (siguiente === 0) {
      setMessage({ text: "Se apagaron todas. Tocá otra vez para encender de a una.", tone: "dim" });
      return;
    }
    const bien = n === p.target.den && siguiente === p.target.num;
    if (bien) {
      attempt(true);
      token.value = withTiming(1, { duration: theme.motion.base });
      succeed("Partes iguales y encendidas las que pide la ficha: eso es la fracción.");
      return;
    }
    if (siguiente === p.target.num && n !== p.target.den) {
      attempt(false);
      setMessage({
        text:
          n > p.target.den
            ? "Encendiste las que pide, pero con más partes. ¿Cada parte es más chica?"
            : "Encendiste las que pide, pero cada parte es más grande que la de la ficha.",
        tone: "warn",
      });
      return;
    }
    setMessage({ text: "Van encendidas. Seguí tocando partes.", tone: "dim" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, quiet, succeed]);

  // --- La lámina de todos ----------------------------------------------------

  const pickWhole = useCallback(
    (index: number) => {
      const { problem: p, ask: a, solved: hecho } = vivo.current;
      if (hecho || a !== "pick") return;
      const w = p.wholes[index];
      if (!w) return;
      quiet();
      setPicked(index);
      attempt(w.correct);
      if (w.correct) {
        succeed("Esa muestra esa parte: partes iguales, y las que pide la ficha.");
        return;
      }
      setMessage({ text: wholeLureHint(w.lure), tone: "warn" });
    },
    [attempt, quiet, succeed],
  );

  // --- El frasco -------------------------------------------------------------

  const total = useMemo(() => problem.urn.reduce((s, n) => s + n, 0), [problem.urn]);

  const drawOne = useCallback(() => {
    const { problem: p, ask: a, solved: hecho } = vivo.current;
    const enJuego = p.urn.reduce((s, n) => s + n, 0);
    if (hecho || a !== "draw") return;
    if (bag.current.drawn >= enJuego) {
      setMessage({ text: "El frasco ya está vacío. Elegí abajo la ficha.", tone: "dim" });
      return;
    }
    quiet();
    const n = bag.current.drawn + 1;
    bag.current = { ...bag.current, drawn: n };
    setDrawnCount(n);
    drawn.value = withTiming(n, { duration: theme.motion.quick });
    if (n < enJuego) {
      setMessage({ text: "Seguí sacando: el todo es el frasco, no la columna más alta.", tone: "dim" });
      return;
    }
    brace.value = withTiming(1, { duration: theme.motion.base });
    say("emptied");
    setMessage({
      text: "Frasco vacío. ¿Qué parte del total son las azules? Elegí abajo.",
      tone: "dim",
    });
    // El invariante de la proporción: el frasco se llena al doble con la misma
    // mezcla y la ficha no se mueve.
    if (p.refill) {
      refill.value = withTiming(1, { duration: theme.motion.morph });
      drawn.value = withTiming(enJuego * 2, { duration: theme.motion.reveal });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet, say]);

  // --- La recta --------------------------------------------------------------

  const pinAt = useCallback(
    (mark: number) => {
      const { problem: p, ask: a, solved: hecho } = vivo.current;
      if (hecho || a !== "pin") return;
      quiet();
      setPinned(mark);
      const ok = mark === p.target.num;
      attempt(ok);
      if (ok) {
        token.value = withTiming(1, { duration: theme.motion.base });
        succeed("La parte encendida cayó justo en esa marca de la recta.");
        return;
      }
      setMessage({
        text: "Quedó en otra marca. Contá los tramos desde el cero.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, succeed],
  );

  // --- Toques que no llegaron a nada -----------------------------------------

  /** Todo rechazo dice algo: un toque en el aire explica dónde tocar. */
  const missed = useCallback((why: number) => {
    const { solved: hecho, ask: a } = vivo.current;
    if (hecho) return;
    if (why === FUERA_BARRA) {
      setMessage({ text: "Apoyá el dedo sobre la barra y arrastrá desde ahí.", tone: "dim" });
    } else if (why === FUERA_FRASCO) {
      setMessage({ text: "Tocá el frasco para sacar una bola.", tone: "dim" });
    } else if (why === FUERA_TODO) {
      setMessage({ text: "Tocá una de las pizzas: la que muestra lo de la ficha.", tone: "dim" });
    } else if (why === FUERA_RECTA) {
      setMessage({ text: "Tocá una marca de la recta, la línea de abajo.", tone: "dim" });
    } else {
      setMessage({ text: chipPrompt(a), tone: "dim" });
    }
  }, []);

  /**
   * Un toque sobre el tablero en las preguntas que se contestan con el teclado.
   * En la comparación, trae las dos barras: es la barra a demanda del nivel 7.
   */
  const tapBoard = useCallback(() => {
    const { solved: hecho, ask: a } = vivo.current;
    if (hecho) return;
    if (a === "compare") {
      setBarsShown(true);
      setMessage({
        text: "Ahí están las dos barras, del mismo largo. ¿Cuál tiene más encendido?",
        tone: "dim",
      });
      return;
    }
    setMessage({ text: chipPrompt(a), tone: "dim" });
  }, []);

  // --- El teclado de fichas --------------------------------------------------

  const pickOption = useCallback(
    (option: FracOption) => {
      if (solved) return;
      // El teclado del frasco espera a que el frasco se vacíe: la parte se
      // cuenta contra el total, y el total todavía no está a la vista. Un toque
      // antes de tiempo lo dice, en vez de no hacer nada.
      if (ask === "draw" && bag.current.drawn < total) {
        setMessage({
          text: "Primero vaciá el frasco: tocalo hasta que no quede ninguna.",
          tone: "dim",
        });
        return;
      }
      quiet();
      attempt(option.correct, fracMisconceptionFor(option));
      if (ask === "compare") setBarsShown(true);
      if (option.correct) {
        if (ask === "share") {
          // El morph del `÷`: sus dos puntos se estiran hasta ser los numerales
          // y la barra del medio se queda quieta.
          divide.value = withTiming(1, { duration: theme.motion.morph });
        }
        token.value = withTiming(1, { duration: theme.motion.base });
        urnChip.value = withTiming(1, { duration: theme.motion.base });
        succeed(successFor(ask));
        return;
      }
      setMessage({ text: optionLureHint(ask, option), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, ask, total, attempt, quiet, succeed],
  );

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda, calculado
   * de la geometría que dibujan las dos escenas. El foco sale de la pregunta
   * que se está jugando y de si el paso es para mirar, para hacer o para
   * explicar: así la pista de Tomi, que reusa el paso de hacer del nivel,
   * señala lo correcto también en las rondas de la otra pregunta.
   */
  // La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const kind =
      shown.id === "look" || shown.id === "recall" ? "look" : shown.id === "reveal" ? "reveal" : "do";
    const grow = (b: Box, m: number): Rect => ({ x: b.x - m, y: b.y - m, w: b.w + m * 2, h: b.h + m * 2 });
    const chipRect = (c: { x: number; y: number; size: number }): Rect => ({
      x: c.x - c.size * 1.25 - 6,
      y: c.y - c.size * 1.45 - 6,
      w: c.size * 2.5 + 12,
      h: c.size * 2.9 + 12,
    });
    const todos = tl.wholes.map((b) => grow(b, 8));
    const lineRect: Rect = {
      x: tl.line.x0 - 14,
      y: tl.line.y - 24,
      w: tl.line.x1 - tl.line.x0 + 28,
      h: 48,
    };

    switch (ask) {
      case "cut": {
        const b = tl.wholes[0];
        if (!b) return null;
        const bar = grow(b, 8);
        if (kind !== "do") return { rings: [bar, chipRect(tl.chip)] };
        const den = problem.target.den;
        if (!(cut.even && cut.parts === den)) {
          // La luz recorre el arrastre, del largo que hace falta para las partes
          // que pide la ficha: una línea por cada paso.
          const from = { x: b.x + b.w * 0.5, y: b.y + b.h * 0.5 };
          const to = { x: from.x, y: from.y + CUT_STEP * (den - 1) + 8 };
          return { rings: [bar, chipRect(tl.chip)], drag: { from, to } };
        }
        // Cortada bien: la parte que sigue por encender.
        const w = b.w / den;
        const i = Math.min(cut.lit, den - 1);
        return { rings: [{ x: b.x + i * w - 4, y: b.y - 6, w: w + 8, h: b.h + 12 }] };
      }
      case "pick": {
        if (kind === "look") return { rings: [chipRect(tl.chip), ...todos] };
        if (kind === "do") return { rings: todos };
        const i = problem.wholes.findIndex((w) => w.correct);
        const r = todos[i];
        return { rings: r ? [r] : todos };
      }
      case "draw": {
        const jar = ul.jars[0];
        if (!jar) return null;
        const frasco = grow(jar.box, 10);
        const xs = jar.columns.map((c) => c.x);
        const tope = Math.min(...jar.stack.slice(0, jar.count).map((s) => s.y));
        const columnas: Rect = {
          x: Math.min(...xs) - ul.piece * 2.4,
          y: tope - ul.piece * 1.8,
          w: Math.max(...xs) - Math.min(...xs) + ul.piece * 4.8,
          h: ul.braceY + 22 - (tope - ul.piece * 1.8),
        };
        if (kind === "look") return { rings: [frasco] };
        if (kind === "do") return { rings: [drawnCount < total ? frasco : columnas] };
        return { rings: [columnas, chipRect(ul.chip)] };
      }
      case "share": {
        const platos = tl.plates.map((b) => grow(b, 4));
        if (kind === "look") return { rings: [...todos, ...platos] };
        if (kind === "do") return { rings: [chipRect(tl.chip), ...platos] };
        return { rings: [chipRect(tl.chip)] };
      }
      case "pin": {
        const b = tl.wholes[0];
        if (!b) return null;
        if (kind === "look") return { rings: [grow(b, 8), lineRect] };
        const { num, den } = problem.target;
        const markX = tl.line.x0 + ((tl.line.x1 - tl.line.x0) * num) / den;
        if (kind === "reveal") return { rings: [{ x: markX - 22, y: tl.line.y - 40, w: 44, h: 60 }] };
        const litX = b.x + (b.w * num) / den;
        return { rings: [lineRect], drag: { from: { x: litX, y: b.y + b.h }, to: { x: markX, y: tl.line.y } } };
      }
      case "compare":
        return todos.length > 0 ? { rings: todos } : null;
      default:
        // La suma cruzada y los todos que nunca vio: lo que hay que mirar son los todos.
        return todos.length > 0 ? { rings: todos } : null;
    }
  }, [shown, ask, tl, ul, cut, problem, drawnCount, total]);

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que los gestos necesitan, en un solo `SharedValue`.
   *
   * Los `Gesture` se arman una sola vez y no cambian de identidad entre
   * renders: un worklet captura el cierre del render en que se armó, así que la
   * geometría leída del cierre sería la de la primera ronda para siempre. Acá
   * el worklet lee un valor compartido y siempre ve el de ahora.
   */
  const geo = useSharedValue({
    /** 0 no se toca nada; 1 se puede. */
    activo: 0,
    /** Qué contesta el toque: 1 encender, 2 sacar, 3 elegir todo, 4 clavar, 5 el teclado. */
    modo: 0,
    cortando: 0,
    /** El toque sostenido ya contestó por este gesto: soltar no enciende nada. */
    sostenido: 0,
    desdeX: 0,
    desdeY: 0,
    boxX: 0,
    boxY: 0,
    boxW: 1,
    boxH: 1,
    jarX: 0,
    jarY: 0,
    jarW: 0,
    jarH: 0,
    lineX0: 0,
    lineX1: 0,
    lineY: 0,
    ticks: 0,
    wholes: [] as { x: number; y: number; w: number; h: number }[],
  });

  const box = tl.wholes[0] ?? { x: 0, y: 0, w: 1, h: 1 };
  const jarBox = ul.jars[0]?.box ?? { x: 0, y: 0, w: 0, h: 0 };
  useEffect(() => {
    geo.value = {
      // Qué se puede tocar es parte de la geometría y no del objeto del gesto:
      // deshabilitarlo con `.enabled()` lo obligaría a cambiar de identidad.
      activo: solved ? 0 : 1,
      modo: MODOS[ask] ?? 5,
      cortando: 0,
      sostenido: 0,
      desdeX: 0,
      desdeY: 0,
      boxX: box.x,
      boxY: box.y,
      boxW: box.w,
      boxH: box.h,
      jarX: jarBox.x,
      jarY: jarBox.y,
      jarW: jarBox.w,
      jarH: jarBox.h,
      lineX0: tl.line.x0,
      lineX1: tl.line.x1,
      lineY: tl.line.y,
      ticks: ask === "pin" ? problem.ticks : 0,
      wholes: ask === "pick" ? tl.wholes.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h })) : [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl, ul, ask, solved, problem.ticks]);

  // Los gestos se arman una vez, así que llaman siempre a la versión de ahora
  // de cada decisión por una referencia (trampa 8 de HANDOFF).
  const acts = useRef({ commitCut, lightOne, drawOne, pickWhole, pinAt, missed, tapBoard });
  acts.current = { commitCut, lightOne, drawOne, pickWhole, pinAt, missed, tapBoard };
  const commitCutJS = useCallback((n: number, even: boolean) => acts.current.commitCut(n, even), []);
  const lightOneJS = useCallback(() => acts.current.lightOne(), []);
  const drawOneJS = useCallback(() => acts.current.drawOne(), []);
  const pickWholeJS = useCallback((i: number) => acts.current.pickWhole(i), []);
  const pinAtJS = useCallback((m: number) => acts.current.pinAt(m), []);
  const missedJS = useCallback((why: number) => acts.current.missed(why), []);
  const tapBoardJS = useCallback(() => acts.current.tapBoard(), []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => {
          const g = geo.value;
          // El blanco es el todo entero con aire alrededor: una mano de cinco
          // años no apunta fino.
          const dentro =
            e.x > g.boxX - 30 &&
            e.x < g.boxX + g.boxW + 30 &&
            e.y > g.boxY - 40 &&
            e.y < g.boxY + g.boxH + 40;
          const corta = g.activo === 1 && g.modo === 1 && dentro;
          // Cada arrastre nuevo corta parejo: lo desparejo dura un solo corte,
          // el que se sostuvo. Si se heredara, un toque largo sin querer dejaba
          // la barra despareja para siempre y el nivel no se terminaba.
          if (corta) uneven.value = 0;
          geo.value = {
            ...g,
            cortando: corta ? 1 : 0,
            sostenido: 0,
            desdeX: e.x,
            desdeY: e.y,
          };
        })
        .onChange((e) => {
          const g = geo.value;
          if (!g.cortando || g.sostenido) return;
          // El recorrido se mide contra el punto donde el dedo se apoyó y no
          // con `translationY`: en web el gesto empieza a contar recién cuando
          // se activa, y el primer corte se comía casi un paso entero. Y cuenta
          // hacia cualquier lado: el que arrastra de costado o hacia arriba
          // también corta.
          const recorrido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          // Hasta que el dedo se mueve de verdad, el gesto todavía puede ser un
          // toque: tocar una parte para encenderla no puede borrar el corte.
          if (recorrido < TAP_SLOP) return;
          parts.value = Math.max(
            0,
            Math.min(FRAC_MAX_PARTS, Math.round(recorrido / CUT_STEP) + 1),
          );
        })
        .onFinalize((e) => {
          const g = geo.value;
          geo.value = { ...g, cortando: 0, sostenido: 0 };
          if (!g.activo) return;
          // Si el dedo se quedó quieto lo suficiente, el toque sostenido ya
          // contestó: soltar no puede encender una parte encima.
          if (g.sostenido) return;
          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          // Un solo gesto contesta el toque y el arrastre. Encadenar un `Tap`
          // aparte en carrera con este los hacía pelear: el arrastre se llevaba
          // el gesto y el toque no llegaba nunca.
          if (g.modo === 1) {
            if (movido >= TAP_SLOP) {
              if (!g.cortando) {
                runOnJS(missedJS)(FUERA_BARRA);
                return;
              }
              const n = Math.max(2, Math.round(parts.value));
              parts.value = n;
              runOnJS(commitCutJS)(n, uneven.value === 0);
              return;
            }
            runOnJS(lightOneJS)();
            return;
          }
          // Fuera del corte nada se arrastra: un toque que se corrió sigue
          // siendo un toque, y cuenta donde se apoyó el dedo.
          const x = movido >= TAP_SLOP ? g.desdeX : e.x;
          const y = movido >= TAP_SLOP ? g.desdeY : e.y;
          if (g.modo === 2) {
            if (
              x > g.jarX - 24 &&
              x < g.jarX + g.jarW + 24 &&
              y > g.jarY - 24 &&
              y < g.jarY + g.jarH + 24
            ) {
              runOnJS(drawOneJS)();
            } else {
              runOnJS(missedJS)(FUERA_FRASCO);
            }
            return;
          }
          if (g.modo === 4) {
            if (
              g.ticks > 0 &&
              Math.abs(y - g.lineY) < 56 &&
              x > g.lineX0 - 30 &&
              x < g.lineX1 + 30
            ) {
              const paso = (g.lineX1 - g.lineX0) / g.ticks;
              const marca = Math.max(0, Math.min(g.ticks, Math.round((x - g.lineX0) / paso)));
              runOnJS(pinAtJS)(marca);
            } else {
              runOnJS(missedJS)(FUERA_RECTA);
            }
            return;
          }
          if (g.modo === 3) {
            // El todo más cercano entre los que el dedo tocó con aire alrededor:
            // una pizza se elige tocando cerca, no adentro exacto.
            let mejor = -1;
            let cerca = 1e9;
            for (let i = 0; i < g.wholes.length; i++) {
              const b = g.wholes[i];
              if (!b) continue;
              const m = 16;
              if (x < b.x - m || x > b.x + b.w + m || y < b.y - m || y > b.y + b.h + m) continue;
              const d = Math.hypot(x - (b.x + b.w / 2), y - (b.y + b.h / 2));
              if (d < cerca) {
                cerca = d;
                mejor = i;
              }
            }
            if (mejor >= 0) runOnJS(pickWholeJS)(mejor);
            else runOnJS(missedJS)(FUERA_TODO);
            return;
          }
          runOnJS(tapBoardJS)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Mantener el dedo suelta las líneas: cortar desparejo es posible, pero hay
   * que quererlo, y la barra deja de chasquear.
   */
  const hold = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(700)
        // Un arrastre no puede convertirse en un toque sostenido a mitad de
        // camino: el dedo tiene que quedarse quieto para soltar las líneas.
        .maxDistance(10)
        .onStart((e) => {
          const g = geo.value;
          if (!g.activo || g.modo !== 1) return;
          // El dedo tiene que seguir apoyado sobre la barra: `cortando` vuelve a
          // cero en cuanto se levanta, así que un temporizador que llega tarde
          // no puede soltar las líneas de un corte que ya terminó.
          if (!g.cortando) return;
          if (e.x < g.boxX - 30 || e.x > g.boxX + g.boxW + 30) return;
          geo.value = { ...g, sostenido: 1 };
          uneven.value = 1;
          runOnJS(commitCutJS)(Math.max(2, Math.round(parts.value)), false);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Solo dos gestos, y en carrera: el toque sostenido gana si el dedo se queda
  // quieto, y el arrastre se queda con todo lo demás. El toque no es un gesto
  // aparte sino un arrastre que no se movió, que es lo que impide que peleen.
  const canvasGesture = useMemo(() => Gesture.Race(hold, pan), [hold, pan]);

  const hayTeclado = CON_TECLADO.has(ask);
  const tecladoActivo = ask !== "draw" || drawnCount >= total;
  // Centrado mientras no choque con el rincón de Tomi; si choca, arranca después
  // de él y las fichas se angostan para entrar.
  const rincon = ventana.width < 600 ? TOMI_ANGOSTO : TOMI_ANCHO;
  const nFichas = Math.max(1, problem.options.length);
  const filaLlena = nFichas * FICHA + ENTRE_FICHAS * (nFichas - 1);
  const choca = (width - filaLlena) / 2 < rincon;
  const anchoFicha = choca
    ? Math.max(FICHA_MIN, Math.min(FICHA, (width - rincon - 16 - ENTRE_FICHAS * (nFichas - 1)) / nFichas))
    : FICHA;

  return (
    <View style={styles.root}>
      <Header
        title={`${t(`node.${NODE_FRAC_PARTS}.name`)} · nivel ${level.n} de ${TOTAL_FRAC_LEVELS}`}
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
      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: las dos escenas viven adentro y la que
            no juega esta ronda se queda en opacidad cero. */}
        <Canvas style={{ width, height: sceneH }}>
          <TilesScene
            config={tilesConfig}
            layout={tl}
            placed={placed}
            spin={spin}
            split={split}
            keys={keys}
            cross={cross}
            token={token}
            ghost={ghost}
            hint={hint}
            demo={demo}
            rows={EMPTY_ROWS}
            appear={tilesAppear}
            parts={parts}
            lit={lit}
            divide={divide}
          />
          <UrnScene
            config={urnConfig}
            layout={ul}
            drawn={drawnList}
            refill={refill}
            chip={urnChip}
            brace={brace}
            hint={hint}
            demo={demo}
            picked={picked}
            appear={urnAppear}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* La guía señala encima de todo y no se lleva ningún toque. */}
        <Spotlight focus={focus} />
      </View>
      </View>

      {/* La línea de abajo tiene un alto fijo de dos renglones: si creciera con
          cada mensaje, el tablero saltaría de tamaño cada vez que algo pasa. */}
      <View style={styles.hintSlot}>
        <Hint text={message.text} tone={message.tone} />
      </View>

      {/* El teclado de fichas. Fuera de las preguntas que lo usan, no está. */}
      {hayTeclado ? (
        <View style={[styles.ring, choca && { paddingLeft: rincon, paddingRight: 16 }]}>
          {Array.from({ length: FRAC_OPTION_SLOTS }, (_, i) => {
            const option = problem.options[i];
            if (!option) return <View key={i} style={styles.chipGhost} />;
            return (
              <Pressable
                key={option.id}
                // Atenuado mientras el frasco no se vació, pero tocable: un
                // toque antes de tiempo recibe una respuesta, no silencio.
                disabled={solved}
                onPress={() => pickOption(option)}
                style={[styles.chip, { width: anchoFicha }, (solved || !tecladoActivo) && styles.chipDim]}
              >
                <FracToken value={option.value} mode={level.chip} />
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** Qué contesta el toque en cada pregunta. Viaja como número al worklet. */
const MODOS: Readonly<Record<string, number>> = {
  cut: 1,
  draw: 2,
  pick: 3,
  pin: 4,
};

/** El piso de `tiles` no tiene montón en este nodo: la lista va vacía y fija. */
const EMPTY_ROWS: readonly RowSlot[] = [];

/**
 * Una ficha del teclado. Hasta que el nodo lee, los dos números son montones de
 * puntos: la ficha dice lo mismo sin una sola letra.
 */
function FracToken({
  value,
  mode,
}: {
  readonly value: FracValue;
  readonly mode: "dots" | "numerals";
}) {
  if (mode === "numerals") {
    return (
      <View style={styles.token}>
        <Text style={styles.tokenNum}>{value.num}</Text>
        <View style={styles.tokenBar} />
        <Text style={styles.tokenNum}>{value.den}</Text>
      </View>
    );
  }
  return (
    <View style={styles.token}>
      <Dots count={value.num} />
      <View style={styles.tokenBar} />
      <Dots count={value.den} />
    </View>
  );
}

/**
 * Un montón de puntos. Todos, siempre: la suma bien hecha de la suma cruzada
 * llega a treinta, y un tope de doce la dibujaba como otra fracción. Pasados
 * los doce, los puntos se achican para seguir entrando en la ficha.
 */
function Dots({ count }: { readonly count: number }) {
  const chico = count > 12;
  return (
    <View style={[styles.dots, chico && styles.dotsSmall]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={chico ? styles.dotSmall : styles.dot} />
      ))}
    </View>
  );
}

/**
 * Qué dice la ficha del costado. Donde la ficha es lo que hay que conseguir,
 * está desde el principio; donde es la respuesta, la trae el teclado.
 */
function chipValueFor(target: FracValue, ask: string): FracValue | null {
  if (ask === "cut" || ask === "pick" || ask === "share" || ask === "pin") return target;
  return null;
}

/** Lo primero que se ve cuando el nivel no tiene lección. */
function openingHint(ask: string): string {
  switch (ask) {
    case "cut":
      return "Arrastrá el dedo hacia abajo sobre la barra para cortarla, y tocá para encender.";
    case "pick":
      return "Tocá la que muestra exactamente esa parte.";
    case "draw":
      return "Tocá el frasco para sacar bolas. Después decí qué parte del total es de un color.";
    case "which":
      return "Las dos barras se juntaron. Tocá la ficha que salió de sumar cruzado.";
    case "share":
      return "Repartí las barras entre los platos. ¿Qué le toca a cada plato?";
    case "pin":
      return "Tocá la marca de la recta donde vive esa fracción.";
    case "compare":
      return "Tocá la más grande. Cuantas más partes, más chica cada parte.";
    default:
      return "Este todo no se corta con un cuchillo. ¿Qué parte está tomada?";
  }
}

/** Qué hacer cuando la respuesta está en el teclado y el dedo tocó el tablero. */
function chipPrompt(ask: string): string {
  switch (ask) {
    case "which":
      return "Elegí abajo la ficha que sumó arriba con arriba y abajo con abajo.";
    case "share":
      return "Elegí abajo la ficha que le toca a cada plato.";
    case "compare":
      return "Elegí abajo la ficha más grande.";
    default:
      return "Elegí abajo la ficha que dice qué parte está tomada.";
  }
}

function successFor(ask: string): string {
  switch (ask) {
    case "draw":
      return "Esa es la parte azul del frasco. Nadie cortó nada y hay una fracción.";
    case "share":
      return "Repartir da la misma ficha que cortar y encender.";
    case "compare":
      return "Esa es la más grande: con menos partes, cada parte es más grande.";
    case "which":
      return "Esa juntó partes de dos tamaños, y por eso se queda corta.";
    default:
      return "Esa es la parte tomada, aunque el todo no sea una pizza.";
  }
}

/** Por qué ese todo no era. Cada distractor de la lámina es un error del diseño. */
function wholeLureHint(lure: string | undefined): string {
  switch (lure) {
    case "uneven_parts":
      return "Esos pedazos no miden lo mismo. ¿Cuál contaste como una parte?";
    case "swapped":
      return "Esa muestra las que quedaron afuera. Arriba van las tomadas.";
    case "one_more_part":
      return "Esa tiene una de más. Contá otra vez porciones y encendidas.";
    default:
      return "Esa no muestra esa parte. Mirá cuántas partes iguales tiene.";
  }
}

/** Por qué esa ficha no era. El error se muestra, y solo uno se anota. */
function optionLureHint(ask: string, option: FracOption): string {
  if (ask === "which") {
    // Acá la ficha tocada es la suma que junta partes del mismo tamaño: no es
    // la que sumó cruzado, y lo que hay que buscar es la otra.
    return "Esa no sumó cruzado: llega adonde llegan las dos juntas. Buscá la otra.";
  }
  if (ask === "draw") {
    // En el frasco no hay partes cortadas: se cuentan bolas, y el total es el frasco.
    if (option.lure === "swapped") return "Esa cuenta las otras bolas. Arriba van las azules.";
    if (option.lure === "wrong_whole") return "Ahí el total no es el frasco. Abajo van todas las bolas.";
    return "Contá otra vez: arriba las azules, abajo todas las bolas del frasco.";
  }
  if (option.lure === "added_across") {
    return "Juntaste partes de dos tamaños. ¿Cuántas partes iguales entran en las dos?";
  }
  switch (option.lure) {
    case "swapped":
      return "Esa cuenta las que quedaron afuera. Arriba van las tomadas.";
    case "wrong_whole":
      return "Ahí el todo cambió de tamaño. Fijá el todo antes de nombrar la parte.";
    case "bigger_denominator":
      return ask === "compare"
        ? "Esa tiene más partes, así que cada una es más chica. Mirá las barras."
        : "Esa tiene más partes. ¿Cada parte quedó más grande o más chica?";
    default:
      return ask === "compare"
        ? "Esa tiene más partes, así que cada una es más chica. Mirá las barras."
        : "Con esa ficha el dibujo no cierra. Contá otra vez las partes iguales.";
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  area: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  hintSlot: { height: 66, alignSelf: "stretch", justifyContent: "center" },
  ring: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: ENTRE_FICHAS,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    height: 78,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    ...chipFace,
    alignItems: "center",
    justifyContent: "center",
  },
  // Montada para que el árbol no cambie, pero fuera del flujo: con ancho cero
  // igual sumaba la separación y corría la fila.
  chipGhost: { display: "none" },
  chipDim: { opacity: 0.35 },
  token: { alignItems: "center", justifyContent: "center", gap: 3 },
  tokenNum: { color: theme.color.ink, fontSize: 20, fontVariant: ["tabular-nums"] },
  tokenBar: { height: 2, width: 34, backgroundColor: theme.color.accent, borderRadius: 1 },
  dots: { flexDirection: "row", gap: 3, maxWidth: 60, flexWrap: "wrap", justifyContent: "center" },
  dotsSmall: { gap: 2, maxWidth: 64 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.color.ink },
  dotSmall: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.color.ink },
});
