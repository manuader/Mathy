/**
 * La pizza y la barra: el minijuego de `arith.frac.parts_and_ratio`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: una mano fantasma corta la barra y enciende una parte, y
 * el objeto contesta. Los mensajes de abajo son para el adulto que mira.
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
 * - Arrastrar hacia abajo sobre la barra. Aparece una línea de corte, y las que
 *   ya están se corren para repartirse el espacio: la mecánica no deja cortar
 *   desparejo por accidente.
 * - Mantener el dedo sobre la barra. Las líneas se sueltan y quedan donde el
 *   jugador las puso. Cortar desparejo es posible, pero hay que quererlo, y la
 *   barra no chasquea: su borde queda punteado y las fichas del libro salen de
 *   distinto tamaño y no se apilan.
 * - Tocar la barra para encender una parte. El libro anota una ficha por cada
 *   una, todas iguales.
 * - Tocar un todo de la lámina. Es `recognize` sin leer: cuatro pizzas cortadas
 *   de formas distintas y una sola muestra exactamente la parte de la ficha.
 * - Tocar el frasco para sacar una bola. Se apilan por color en dos columnas, y
 *   la llave abarca las dos: el todo es el frasco y no la columna más alta.
 * - Tocar una marca de la recta. Ahí se clava la ficha, y es la única vez que
 *   el nodo afirma que una fracción es un número y no un dibujo.
 * - Elegir una ficha del teclado, para el reparto, la comparación y los todos
 *   que nunca vio.
 *
 * El único error que clasifica es `fraction_add_across`, que es el único que el
 * catálogo de L declara sobre este nodo. Contar pedazos en vez de partes
 * iguales, creer que el de abajo más grande es la fracción más grande y olvidar
 * el todo están previstos en el diseño y no tienen entrada, así que se muestran
 * y no se anotan.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
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
  type FracLevel,
  type FracOption,
  type FracValue,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TilesScene,
  tilesLayout,
  type Box,
  type RowSlot,
  type TilesConfig,
  type TilesWhole,
} from "../scenes/TilesScene.tsx";
import { UrnScene, urnLayout, type UrnConfig } from "../scenes/UrnScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto hay que arrastrar hacia abajo para agregar una línea de corte. */
const CUT_STEP = 26;
/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;

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

function Activity({ level, onLevelDone, onExit, onEvent }: FractionsGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
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

  const problem = useMemo(
    () => generateFractions(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(ask),
    tone: "dim",
  }));

  const sceneH = Math.max(360, Math.min(height * 0.66, 560));
  const usaFrasco = ask === "draw";

  // --- Lo que ve cada escena -------------------------------------------------

  const wholes = useMemo<TilesWhole[]>(() => {
    if (usaFrasco) return [];
    return problem.wholes.map((w, i) => ({
      id: w.id,
      // El todo vivo es el que el jugador está cortando; los demás llegan como
      // el generador los dejó.
      parts: i === 0 && ask === "cut" ? cut.parts : w.parts,
      shaded: i === 0 && ask === "cut" ? cut.lit : w.shaded,
      even: i === 0 && ask === "cut" ? cut.even : w.even,
      span: w.span,
      disc: w.disc,
      glow: ask === "pick" ? w.correct && solved : i === 0 && !solved,
    }));
  }, [problem.wholes, usaFrasco, ask, cut, solved]);

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
      // La barra a demanda del nivel 7: el piso de la partición no se dibuja
      // hasta que el jugador lo pide con un toque.
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
   * gesto necesita saber se lee de acá y nunca del cierre, y así los callbacks
   * que el gesto llama pueden tener identidad estable.
   */
  const vivo = useRef({ problem, ask, solved, level });
  vivo.current = { problem, ask, solved, level };

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    bag.current = { parts: 0, lit: 0, even: true, drawn: 0 };
    setCut({ parts: 0, lit: 0, even: true });
    setPinned(null);
    setPicked(-1);
    setDrawnCount(0);
    setSolved(false);
    setMessage({ text: openingHint(ask), tone: "dim" });

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

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

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

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1700);
    },
    [nextRound, quiet],
  );

  // --- La barra --------------------------------------------------------------

  /**
   * El corte quedó hecho. Mientras el dedo arrastra, las líneas ya puestas se
   * corren solas para repartirse el espacio: cortar desparejo por accidente no
   * se puede, y por eso el estado que llega acá es un número de partes.
   */
  const commitCut = useCallback(
    (n: number, even: boolean) => {
      const { problem: p, ask: a, solved: hecho } = vivo.current;
      if (hecho || a !== "cut") return;
      quiet();
      bag.current = { ...bag.current, parts: n, even };
      setCut((c) => ({ ...c, parts: n, even }));
      parts.value = withTiming(n, { duration: theme.motion.quick });
      if (!even) {
        setMessage({
          text: "Esos pedazos no miden lo mismo: la barra no cierra. ¿Cuál contaste como una parte?",
          tone: "warn",
        });
        return;
      }
      setMessage({
        text:
          n === p.target.den
            ? "Quedó cortada en partes iguales. Ahora encendé las que pide la ficha."
            : "Cortada en partes iguales. Fijate cuántas pide la ficha.",
        tone: "dim",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quiet],
  );

  /** Un toque sobre la barra enciende una parte más. El libro anota una ficha. */
  const lightOne = useCallback(() => {
    const { problem: p, ask: a, solved: hecho } = vivo.current;
    if (hecho || a !== "cut") return;
    const n = bag.current.parts;
    if (n < 2) {
      setMessage({ text: "Primero cortá: arrastrá el dedo hacia abajo sobre la barra.", tone: "dim" });
      return;
    }
    const siguiente = bag.current.lit + 1 > n ? 0 : bag.current.lit + 1;
    bag.current = { ...bag.current, lit: siguiente };
    setCut((c) => ({ ...c, lit: siguiente }));
    lit.value = withTiming(siguiente, { duration: theme.motion.quick });
    quiet();

    if (!bag.current.even) {
      setMessage({
        text: "Las fichas del libro salen de distinto tamaño y no se apilan.",
        tone: "warn",
      });
      return;
    }
    const bien = n === p.target.den && siguiente === p.target.num;
    if (bien) {
      attempt(true);
      token.value = withTiming(1, { duration: theme.motion.base });
      succeed(
        "Todas las partes miden lo mismo y encendiste las que pedía la ficha. Eso es la fracción.",
      );
      return;
    }
    if (siguiente === p.target.num && n !== p.target.den) {
      attempt(false);
      setMessage({
        text:
          n > p.target.den
            ? "Cortaste la barra en más partes. ¿Cada parte quedó más grande o más chica?"
            : "Encendiste las que pedía, pero cada parte es más grande que la que pide la ficha.",
        tone: "warn",
      });
      return;
    }
    setMessage({ text: "Van encendidas. Seguí tocando partes.", tone: "dim" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, quiet, succeed]);

  /** La barra a demanda del nivel 7: un toque la trae. */
  const summonBar = useCallback(() => {
    const { level: l, solved: hecho } = vivo.current;
    if (!l.barOnDemand || hecho) return;
    setMessage({ text: "Ahí está la barra. La fracción vive entre el cero y el uno.", tone: "dim" });
  }, []);

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
        succeed("Esa muestra exactamente esa parte: partes iguales, y las que pedía la ficha.");
        return;
      }
      setMessage({ text: wholeLureHint(w.lure), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, succeed],
  );

  // --- El frasco -------------------------------------------------------------

  const total = useMemo(() => problem.urn.reduce((s, n) => s + n, 0), [problem.urn]);

  const drawOne = useCallback(() => {
    const { problem: p, ask: a, solved: hecho } = vivo.current;
    const enJuego = p.urn.reduce((s, n) => s + n, 0);
    if (hecho || a !== "draw") return;
    if (bag.current.drawn >= enJuego) return;
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
    setMessage({
      text: "El frasco quedó vacío. ¿Qué parte del total es de ese color?",
      tone: "dim",
    });
    // El invariante de la proporción: el frasco se llena al doble con la misma
    // mezcla y la ficha no se mueve.
    if (p.refill) {
      refill.value = withTiming(1, { duration: theme.motion.morph });
      drawn.value = withTiming(enJuego * 2, { duration: theme.motion.reveal });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet]);

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
        succeed("La barra se acostó entre el cero y el uno y la parte encendida cayó en esa marca.");
        return;
      }
      setMessage({
        text: "Esa marca no es. Contá cuántas partes del cero al uno tiene la ficha.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, ask, problem.target.num, attempt, quiet, succeed],
  );

  // --- El teclado de fichas --------------------------------------------------

  const pickOption = useCallback(
    (option: FracOption) => {
      if (solved) return;
      quiet();
      attempt(option.correct, fracMisconceptionFor(option));
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
    [solved, ask, attempt, quiet, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que los gestos necesitan, en un solo `SharedValue`.
   *
   * Los `Gesture` se arman una sola vez y no cambian de identidad entre
   * renders, por dos razones que ya costaron caro: gesture-handler en web
   * pierde el gesto cuando el objeto cambia, y un worklet captura el cierre del
   * render en que se armó, así que la geometría leída del cierre sería la de la
   * primera ronda para siempre. Acá el worklet lee un valor compartido y
   * siempre ve el de ahora.
   */
  const geo = useSharedValue({
    /** 0 no se toca nada; 1 se puede. */
    activo: 0,
    /** Qué contesta el toque: 1 encender, 2 sacar, 3 elegir todo, 4 clavar, 5 pedir la barra. */
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
          geo.value = {
            ...g,
            cortando: g.activo && g.modo === 1 && dentro ? 1 : 0,
            sostenido: 0,
            desdeX: e.x,
            desdeY: e.y,
          };
        })
        .onChange((e) => {
          const g = geo.value;
          if (!g.cortando) return;
          // El recorrido se mide contra el punto donde el dedo se apoyó y no
          // con `translationY`: en web el gesto empieza a contar recién cuando
          // se activa, y el primer corte se comía casi un paso entero.
          const recorrido = Math.abs(e.y - g.desdeY);
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
          if (movido >= TAP_SLOP) {
            if (!g.cortando) return;
            const n = Math.max(2, Math.round(parts.value));
            parts.value = n;
            runOnJS(commitCut)(n, uneven.value === 0);
            return;
          }
          if (g.modo === 2) {
            if (
              e.x > g.jarX - 20 &&
              e.x < g.jarX + g.jarW + 20 &&
              e.y > g.jarY - 20 &&
              e.y < g.jarY + g.jarH + 20
            ) {
              runOnJS(drawOne)();
            }
            return;
          }
          if (g.modo === 4 && g.ticks > 0 && Math.abs(e.y - g.lineY) < 46) {
            const paso = (g.lineX1 - g.lineX0) / g.ticks;
            const marca = Math.round((e.x - g.lineX0) / paso);
            if (marca >= 0 && marca <= g.ticks) runOnJS(pinAt)(marca);
            return;
          }
          if (g.modo === 3) {
            for (let i = 0; i < g.wholes.length; i++) {
              const b = g.wholes[i];
              if (b && e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) {
                runOnJS(pickWhole)(i);
                return;
              }
            }
            return;
          }
          if (g.modo === 1) {
            runOnJS(lightOne)();
            return;
          }
          runOnJS(summonBar)();
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
          uneven.value = uneven.value === 0 ? 1 : 0;
          runOnJS(commitCut)(Math.max(2, Math.round(parts.value)), uneven.value === 0);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Solo dos gestos, y en carrera: el toque sostenido gana si el dedo se queda
  // quieto, y el arrastre se queda con todo lo demás. El toque no es un gesto
  // aparte sino un arrastre que no se movió, que es lo que impide que peleen.
  const canvasGesture = useMemo(() => Gesture.Race(hold, pan), [hold, pan]);

  const hayTeclado =
    ask === "draw" || ask === "share" || ask === "compare" || ask === "odd" || ask === "which";
  const tecladoActivo = ask !== "draw" || drawnCount >= total;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_FRAC_PARTS}.name`)} · nivel ${level.n} de ${TOTAL_FRAC_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

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
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* El teclado de fichas. Fuera de las preguntas que lo usan, no está. */}
      {hayTeclado ? (
        <View style={styles.ring}>
          {Array.from({ length: FRAC_OPTION_SLOTS }, (_, i) => {
            const option = problem.options[i];
            if (!option) return <View key={i} style={styles.chipGhost} />;
            return (
              <Pressable
                key={option.id}
                disabled={solved || !tecladoActivo}
                onPress={() => pickOption(option)}
                style={[styles.chip, (solved || !tecladoActivo) && styles.chipDim]}
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

function Dots({ count }: { readonly count: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: Math.min(count, 12) }, (_, i) => (
        <View key={i} style={styles.dot} />
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

function successFor(ask: string): string {
  switch (ask) {
    case "draw":
      return "Esa es la parte del frasco de ese color. Nadie cortó nada y hay una fracción.";
    case "share":
      return "Repartir de arriba entre los de abajo da la misma ficha que cortar y encender.";
    case "compare":
      return "Esa es la más grande: cortada en menos partes, cada parte es más grande.";
    case "which":
      return "Esa juntó partes de dos tamaños distintos, y por eso no llega adonde tiene que llegar.";
    default:
      return "Esa es la parte tomada, aunque el todo no se parezca a una pizza.";
  }
}

/** Por qué ese todo no era. Cada distractor de la lámina es un error del diseño. */
function wholeLureHint(lure: string | undefined): string {
  switch (lure) {
    case "uneven_parts":
      return "Esos pedazos no miden lo mismo. ¿Cuál contaste como una parte?";
    case "swapped":
      return "Esa muestra las porciones que quedaron afuera. El de arriba dice cuántas se tomaron.";
    case "one_more_part":
      return "Esa tiene una parte de más. Contá otra vez las encendidas.";
    default:
      return "Esa no muestra esa parte. Mirá cuántas partes iguales tiene en total.";
  }
}

/** Por qué esa ficha no era. El error se muestra, y solo uno se anota. */
function optionLureHint(ask: string, option: FracOption): string {
  if (option.lure === "added_across") {
    return "Juntaste partes de dos tamaños distintos. ¿Cuántas partes iguales entran en las dos barras?";
  }
  switch (option.lure) {
    case "swapped":
      return "Esa cuenta las que quedaron afuera. El de arriba dice cuántas se tomaron.";
    case "wrong_whole":
      return "Ahí el todo cambió de tamaño. El todo hay que fijarlo antes de nombrar la parte.";
    case "bigger_denominator":
      return "Cortaste en más partes. ¿Cada parte quedó más grande o más chica?";
    default:
      return ask === "compare"
        ? "Esa está cortada en más partes, así que cada parte es más chica."
        : "Con esa ficha el dibujo no cierra. Contá otra vez las partes iguales.";
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.color.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  back: { position: "absolute", top: 48, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  ring: { flexDirection: "row", gap: theme.space[3], alignItems: "center", justifyContent: "center" },
  chip: {
    minWidth: 76,
    height: 78,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  chipGhost: { width: 0, height: 78 },
  chipDim: { opacity: 0.35 },
  token: { alignItems: "center", justifyContent: "center", gap: 3 },
  tokenNum: { color: theme.color.ink, fontSize: 20, fontVariant: ["tabular-nums"] },
  tokenBar: { height: 2, width: 34, backgroundColor: theme.color.accent, borderRadius: 1 },
  dots: { flexDirection: "row", gap: 3, maxWidth: 60, flexWrap: "wrap", justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.color.ink },
});
