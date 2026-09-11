/**
 * Los dos platos: el minijuego de `prealg.eq.balance`.
 *
 * Acá nace el igual, y nace como invariante y no como botón de resultado. Toda
 * la superficie está armada para que esa diferencia se sienta antes de poder
 * decirse: la barra no premia ni castiga, contesta, y contesta lo mismo tanto
 * si el jugador acierta como si no. Lo único que hace avanzar un nivel es la
 * acción que recorrió los dos platos.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: las dos pesas que se pueden quitar laten a la vez, y la
 * inclinación explica el resto. Los mensajes de abajo son para el adulto.
 *
 * La escena es `BalanceScene`, la del nodo 13, que el nodo 10 ya había
 * ensanchado. Este nodo le pide dos cosas nuevas y aditivas: dibujar sus
 * objetos adentro de cada plato —cada pesa tiene que ser un blanco propio, y en
 * el último nivel los objetos no son pesas sino figuras que se giran— y saber
 * cuánto ocupa el cajón, para no copiarle los números. El cajón, la tapa que se
 * abre y lo que muestra adentro son los del nodo 10, intactos.
 *
 * Los gestos, y ninguno fino:
 *
 * - Tocar una pesa de un plato la quita. Tocar la misma del otro plato cierra
 *   el movimiento y la barra no se mueve: es la única jugada que conserva.
 * - Arrastrar una pesa de la reserva a un plato la agrega. Tocarla la levanta,
 *   y entonces un toque en un plato la deja ahí.
 * - Arrastrar una pesa de un plato al otro está permitido y es la jugada que
 *   más inclina la barra: es la única forma de sentir que son dos acciones.
 * - Tocar el `=` pide la balanza cuando ya se retiró.
 *
 * Los dos errores que clasifica son los dos que el catálogo de L declara sobre
 * este nodo, y ninguno más: `inverse_applied_one_side` cuando una acción queda
 * a medio camino y empieza otra, y `equals_as_operator` cuando un plato se
 * vuelca sobre el otro. Cada uno se anota desde el nivel donde el diseño lo
 * hace aparecer, no desde el primero en que el gesto es posible.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurMask, Canvas, Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import {
  BAL_DEFINITION_KEYS,
  NODE_BALANCE_EQ,
  TOTAL_BAL_LEVELS,
  balApply,
  balBoxAlone,
  balLevelled,
  balMass,
  balMisconceptionFor,
  balOtherSide,
  balPairs,
  balSolved,
  balStart,
  balTilt,
  generateBalanceEq,
  type BalActionKind,
  type BalLevel,
  type BalMove,
  type BalProblem,
  type BalSide,
  type BalState,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  BalanceScene,
  BOX_LOOK,
  MAX_TILT,
  WEIGHT_LOOK,
  WeightBodies,
  addShine,
  balanceLayout,
  boxFootprint,
  type BalanceContents,
  type BalanceLayout,
  type BalanceStyle,
} from "../scenes/BalanceScene.tsx";
import { play } from "../ui/sound.ts";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { balMsg } from "../lessons/balance-eq.ts";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";
import { chipFace } from "../ui/Kit.tsx";
import { ChipBodies } from "../ui/ChipBodies.tsx";

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;
/** El halo que marca el plato que nadie tocó dura lo que hay que mirarlo. */
const HALO_MS = 1500;
/** Blancos grandes: una mano de cinco años no apunta fino. */
const SLOP = 16;
/** Una ficha de la reserva (el asa mide 56 × 56), el aire entre dos y la franja que ocupan. */
const RESERVE_CHIP = 56;
const RESERVE_GAP = theme.space[3];
const TRAY_H = RESERVE_CHIP + theme.space[3] * 2;
/** El ancho del rincón de Tomi, que la primera ficha de la reserva no pisa. */
const TOMI_CORNER = 84;

/**
 * La inclinación en radianes que la escena espera. El signo se da vuelta: para
 * `BalanceScene` un ángulo positivo sube el plato izquierdo, y el plato que sube
 * es el que pesa menos.
 */
const inclinacion = (problem: BalProblem, state: BalState): number =>
  -balTilt(problem, state) * MAX_TILT;

export interface BalanceEqGameProps {
  readonly level: BalLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function BalanceEqGame(props: BalanceEqGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

/** Lo que el jugador levantó y todavía no soltó. */
type Held =
  | { readonly kind: "weight"; readonly value: number }
  | { readonly kind: "action"; readonly action: BalActionKind }
  | null;

/** Un objeto dibujado adentro de un plato, con su blanco. */
interface Spot {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly value: number;
}

function Activity({ level, onLevelDone, onExit, onEvent }: BalanceEqGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  /** Con lección, el cartel del objetivo dice qué hacer y la línea de abajo queda para lo que pasó. */
  const conLeccion = lesson?.lesson !== undefined;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateBalanceEq(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  /**
   * Lo que se dice al empezar la ronda. Con lección, el cartel ya dice qué
   * hacer, salvo lo que cambia de ronda en ronda: la tarea de conservar (qué
   * pesa hay que poner o sacar) y las dos preguntas del último nivel.
   */
  const abre = (p: BalProblem): string =>
    conLeccion && (p.ask === "level" || p.ask === "free") ? "" : apertura(p, level);

  const [state, setState] = useState<BalState>(() => balStart(problem));
  /** El estado anterior. En la capa visual se dibuja detrás: el antes y el después. */
  const [before, setBefore] = useState<BalState | null>(null);
  /** La acción que quedó a medio camino, esperando su espejo en el otro plato. */
  const [pending, setPending] = useState<BalMove | null>(null);
  const [held, setHeld] = useState<Held>(null);
  const [solved, setSolved] = useState(false);
  /** El plato que nadie tocó, marcado con un halo mientras se explica. */
  const [haloSide, setHaloSide] = useState<BalSide | null>(null);
  const [ghostOn, setGhostOn] = useState(level.balance === "shown");
  const ghostOnRef = useRef(ghostOn);
  ghostOnRef.current = ghostOn;

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: abre(problem),
    tone: "dim",
  }));

  // Con lección, el cartel de Lumi se lleva su franja de arriba y el lienzo cede.
  // En el teléfono el cartel ocupa el doble de renglones y la reserva vive debajo
  // del lienzo: sin achicarlo, la reserva se salía de la pantalla.
  const angosta = width < 520;
  const sceneH = Math.max(
    angosta ? 290 : 320,
    Math.min(height * (conLeccion ? (angosta ? 0.4 : 0.5) : 0.6), 500),
  );
  const conLinea = level.line && problem.ask !== "action";
  const balanceH = conLinea ? sceneH * 0.76 : sceneH;
  const lineY = conLinea ? sceneH * 0.9 : 0;
  const style: BalanceStyle = level.skin === "bars" ? "visual" : "concrete";

  const l = useMemo(() => balanceLayout(width, balanceH), [width, balanceH]);
  const fp = useMemo(() => boxFootprint(l, style), [l, style]);

  // --- Lo que se dibuja adentro de cada plato --------------------------------

  /** La vara de las barras: la misma para los dos platos, y quieta en la ronda. */
  const escala = useMemo(
    () =>
      Math.max(
        problem.left.reduce((s, v) => s + v, 0),
        problem.right.reduce((s, v) => s + v, 0),
        problem.box?.hidden ?? 0,
        6,
      ),
    [problem],
  );

  const spots = useMemo(
    () => ({
      left: panSpots(state.left, level.skin, l, fp, problem.box?.side === "left", escala),
      right: panSpots(state.right, level.skin, l, fp, problem.box?.side === "right", escala),
    }),
    [state.left, state.right, level.skin, l, fp, problem.box, escala],
  );

  const ghostSpots = useMemo(
    () =>
      before && level.skin === "bars"
        ? {
            left: panSpots(before.left, level.skin, l, fp, problem.box?.side === "left", escala),
            right: panSpots(before.right, level.skin, l, fp, problem.box?.side === "right", escala),
          }
        : null,
    [before, level.skin, l, fp, problem.box, escala],
  );

  /**
   * La demostración, y es toda la instrucción que hay: donde el nivel de la
   * barra es un hecho a conservar, laten a la vez las dos pesas iguales de los
   * dos platos, que es la única jugada que conserva; donde hay que enderezar o
   * reparar, late la pesa que sobra de un solo lado, que es el único momento en
   * que tocar un plato solo es lo correcto.
   */
  const hint = useMemo<{ left: number | null; right: number | null }>(() => {
    const nada = { left: null, right: null };
    // Con guía, la luz de Lumi (y después la pista de Tomi) es la demostración:
    // un latido propio señalaría la respuesta en todas las rondas y dos luces a
    // la vez dirían dos cosas distintas.
    if (guided) return nada;
    if (problem.ask === "action" || solved) return nada;
    if (balPairs(problem.ask)) {
      const enLos2 = state.left.find((v) => state.right.includes(v));
      return enLos2 === undefined ? nada : { left: enLos2, right: enLos2 };
    }
    const falta = balMass(problem, state, "left") - balMass(problem, state, "right");
    if (falta === 0) return nada;
    const pesado: BalSide = falta > 0 ? "left" : "right";
    const sobra = (pesado === "left" ? state.left : state.right).find(
      (v) => v === Math.abs(falta),
    );
    if (sobra === undefined) return nada;
    return pesado === "left" ? { left: sobra, right: null } : { left: null, right: sobra };
  }, [problem, state, solved, guided]);

  const line = useMemo(
    () => (conLinea ? lineLayout(problem, state, width, lineY) : null),
    [conLinea, problem, state, width, lineY],
  );

  /** Lo que la balanza lee del problema: solo lo que hay adentro del cajón. */
  const balanceProblem = useMemo(
    () => ({ solution: problem.box?.hidden ?? 0 }),
    [problem.box?.hidden],
  );

  /**
   * Los platos, armados a mano. Las pesas van en cero porque las dibuja este
   * nodo: cada una es un blanco propio y la escena las junta en un solo trazo.
   * Lo que sí pone la escena es el cajón, con su tapa y lo que muestra al
   * abrirse, que son los del nodo 10.
   */
  const contents = useMemo<BalanceContents>(() => {
    const izq = { boxes: problem.box?.side === "left" ? 1 : 0, units: 0 };
    const der = { boxes: problem.box?.side === "right" ? 1 : 0, units: 0 };
    return { leftBefore: izq, rightBefore: der, leftAfter: izq, rightAfter: der, deltaSign: 0 };
  }, [problem.box]);

  // --- Lo que la escena anima ------------------------------------------------

  const tilt = useSharedValue(0);
  const openness = useSharedValue(0);
  const balanceAppear = useSharedValue(level.balance === "shown" ? 1 : 0);
  const halo = useSharedValue(0);
  const pulse = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  // Los valores que la balanza del nodo 13 mueve con la llave. Acá no hay llave
  // que aplicar: la escena los lee igual y quietos no cuestan nada.
  const leftPan = useSharedValue(0);
  const rightPan = useSharedValue(0);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const roundRef = useRef(round);
  roundRef.current = round;

  /**
   * El estado que los gestos necesitan, en una referencia.
   *
   * Un worklet captura el cierre del render en que se armó el gesto, así que
   * todo lo que un `runOnJS` lea del cierre sería lo de la primera ronda para
   * siempre. Acá se lee de la referencia y siempre se ve lo de ahora.
   */
  const vivo = useRef({ problem, level, state, pending, held, solved });
  vivo.current = { problem, level, state, pending, held, solved };

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setState(balStart(problem));
    setBefore(null);
    setPending(null);
    setHeld(null);
    setSolved(false);
    setHaloSide(null);
    setMessage({ text: abre(problem), tone: "dim" });
    tilt.value = withTiming(inclinacion(problem, balStart(problem)), {
      duration: theme.motion.base,
    });
    openness.value = 0;
    halo.value = 0;
    setGhostOn(level.balance === "shown");
    balanceAppear.value = withTiming(level.balance === "shown" ? 1 : 0, {
      duration: theme.motion.base,
    });
    // El latido no es un adorno: es lo único que dice dónde se puede jugar.
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => {
      cancelAnimation(pulse);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, level]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_BALANCE_EQ, layer: level.layer });
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

  /**
   * Qué paso de la guía muestra la pista de Tomi en esta ronda. El último nivel
   * alterna reparar con las acciones sin números, los de recordatorio no tienen
   * paso de gesto, y con medio movimiento hecho lo que falta es el espejo: sin
   * elegir, la pista hablaría de otro gesto.
   */
  const pasos = lesson?.lesson?.coach;
  const preferHint = lesson?.preferHint;
  const pistaDeRonda = useMemo(() => {
    const ids = (pasos ?? []).map((s) => s.id);
    const quiero =
      problem.ask === "level" || problem.ask === "repair"
        ? "fix"
        : problem.ask === "action"
          ? "act"
          : pending
            ? "mirror"
            : "half";
    return [quiero, "recall"].find((id) => ids.includes(id)) ?? null;
  }, [pasos, problem.ask, pending]);
  useEffect(() => {
    preferHint?.(pistaDeRonda);
  }, [preferHint, pistaDeRonda, round]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_BALANCE_EQ,
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

  const nextRound = useCallback(() => {
    const r = roundRef.current;
    if (r + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_BALANCE_EQ, level: level.n });
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
  const cierrePendiente = useRef(false);
  const advance = useCallback(() => {
    if (holding.current) {
      cierrePendiente.current = true;
      return;
    }
    nextRound();
  }, [nextRound]);
  useEffect(() => {
    if (step?.holds === true || !cierrePendiente.current) return;
    cierrePendiente.current = false;
    nextRound();
  }, [step, nextRound]);

  const succeed = useCallback(
    (text: string, abreCaja: boolean) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      setMessage({ text, tone: "ok" });
      if (abreCaja) {
        openness.value = withDelay(360, withTiming(1, { duration: theme.motion.reveal }));
      }
      // Abrir el cajón hay que verlo: lo que hay adentro es lo que la barra ya
      // había dicho, y esa comprobación es el nivel entero.
      setTimeout(advance, abreCaja ? 3000 : 1600);
    },
    [advance, openness],
  );

  /**
   * La marca sobre el plato que nadie tocó. Es el `replay_on_mechanic` del
   * catálogo con lo que esta superficie puede dar: el plato intacto se ilumina
   * mientras la barra sigue inclinada, y el jugador nivela desde ahí. Ningún
   * cartel dice "mal".
   */
  const marcar = useCallback(
    (side: BalSide) => {
      setHaloSide(side);
      halo.value = withSequence(
        withTiming(1, { duration: 320 }),
        withDelay(HALO_MS, withTiming(0, { duration: 320 })),
      );
      setTimeout(() => setHaloSide(null), HALO_MS + 700);
    },
    [halo],
  );

  // --- El movimiento ---------------------------------------------------------

  const mover = useCallback(
    (move: BalMove) => {
      const v = vivo.current;
      if (v.solved) return;
      const p = v.problem;
      const antes = v.state;
      const despues = balApply(p, antes, move);
      if (igual(antes, despues)) {
        // La balanza no responde y las pesas vuelven. Un empujón, no un cartel.
        setMessage({ text: "Esa pesa no está en ese plato.", tone: "dim" });
        return;
      }

      const error = balMisconceptionFor(v.level, p, despues, move, v.pending);
      const empareja = balPairs(p.ask);
      const derecha = balLevelled(p, despues);
      const suelto = move.kind === "cross" || (move.kind === "act" && move.action === "pour");

      setBefore(antes);
      setState(despues);
      setHeld(null);
      tilt.value = withTiming(inclinacion(p, despues), { duration: theme.motion.base });

      // Qué queda pendiente. Con la barra derecha no queda nada a medio camino,
      // y un movimiento suelto no espera espejo: ya son dos acciones en un gesto.
      const nuevoPendiente = !empareja || derecha || suelto ? null : move;
      setPending(nuevoPendiente);

      // Qué se anota. La mitad de un movimiento no es una respuesta: se anota
      // el movimiento entero, que es el par, y los que rompen la igualdad de
      // una sola vez. Anotar cada medio par como fallado ensuciaría K con el
      // camino correcto.
      const cuenta = !empareja || derecha || suelto || v.pending !== null;
      if (cuenta) attempt(derecha, error);

      // Lo que la guía espera, dicho en el mismo lugar donde se registra el
      // movimiento: medio movimiento, la barra que se endereza, la ronda hecha.
      if (nuevoPendiente) say("half");
      if (derecha && !balLevelled(p, antes)) say("levelled");
      if (!error && balSolved(p, despues)) {
        say("solved");
        if (p.ask === "action") say("acted");
      }

      if (error === "equals_as_operator") {
        marcar(balOtherSide(move.side));
        setMessage({
          text: "El igual no dice qué da. Dice que los dos platos pesan lo mismo. ¿Qué había del otro lado?",
          tone: "warn",
        });
        return;
      }
      if (error === "inverse_applied_one_side") {
        marcar(balOtherSide((v.pending as BalMove).side));
        setMessage({
          text: "Dejaste una acción a medio camino en un solo plato. ¿Qué le falta al otro?",
          tone: "warn",
        });
        return;
      }

      if (balSolved(p, despues)) {
        succeed(cierre(p), p.ask === "free");
        return;
      }
      setMessage({ text: aviso(p, despues, nuevoPendiente), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, marcar, succeed, say],
  );

  /** Un toque sobre un plato: deja ahí lo que estaba levantado. */
  const soltarEn = useCallback(
    (side: BalSide) => {
      const h = vivo.current.held;
      if (!h) return;
      if (h.kind === "action") mover({ kind: "act", side, action: h.action });
      else mover({ kind: "add", side, value: h.value });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mover],
  );

  /** Un toque sobre una pesa: la quita de su plato. */
  const tocarPesa = useCallback(
    (side: BalSide, value: number) => {
      // Con algo levantado, el toque lo deja: lo que haya abajo es el blanco.
      if (vivo.current.held) {
        soltarEn(side);
        return;
      }
      mover({ kind: "remove", side, value });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mover, soltarEn],
  );

  const cruzar = useCallback(
    (side: BalSide, value: number) => mover({ kind: "cross", side, value }),
    [mover],
  );

  /** Qué pesa del plato sigue al dedo, como `lado:índice`. */
  const [takenKey, setTakenKey] = useState<string | null>(null);

  const tomar = useCallback((h: NonNullable<Held>) => {
    const prev = vivo.current.held;
    const suelta =
      prev !== null &&
      ((prev.kind === "weight" && h.kind === "weight" && prev.value === h.value) ||
        (prev.kind === "action" && h.kind === "action" && prev.action === h.action));
    setHeld(suelta ? null : h);
    // Levantar sin decir adónde va dejaba al jugador mirando una ficha
    // encendida: la línea de abajo dice cuál es el paso que sigue.
    if (!suelta) {
      setMessage({
        text: t(
          !ghostOnRef.current ? balMsg("ghost") : h.kind === "action" ? balMsg("heldAction") : balMsg("held"),
        ),
        tone: "dim",
      });
    }
  }, []);

  const toggleGhost = useCallback(() => {
    setGhostOn((on) => {
      balanceAppear.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [balanceAppear]);

  // --- Geometría para los gestos ---------------------------------------------

  /**
   * La reserva vive adentro de la vista del lienzo, en su franja de abajo, con
   * cada ficha en un lugar calculado: el gesto, el dibujo y la guía miden en las
   * mismas coordenadas. La fila deja libre el rincón de abajo a la izquierda,
   * donde vive Tomi.
   */
  const fichasReserva = problem.ask === "action" ? problem.actions.length : problem.reserve.length;
  const reservaY = sceneH + TRAY_H / 2;
  const reservaCx = Math.max(
    width / 2,
    TOMI_CORNER + RESERVE_CHIP / 2 + ((fichasReserva - 1) / 2) * (RESERVE_CHIP + RESERVE_GAP),
  );
  const fichaEn = useCallback(
    (i: number): Pt => ({
      x: reservaCx + (i - (fichasReserva - 1) / 2) * (RESERVE_CHIP + RESERVE_GAP),
      y: reservaY,
    }),
    [reservaCx, fichasReserva, reservaY],
  );

  /** El origen del grupo de un plato, con la barra donde está ahora. */
  const panOrigin = useCallback(
    (side: BalSide): { x: number; y: number } => {
      const a = inclinacion(problem, state);
      const s = side === "left" ? -1 : 1;
      return { x: l.cx + s * l.span * Math.cos(a), y: l.beamY + s * l.span * Math.sin(a) };
    },
    [l, problem, state],
  );

  const equalSpot = useMemo(
    () => ({ x: l.cx, y: l.beamY + l.hang * 0.46, r: 30 }),
    [l],
  );

  /**
   * El cajón en coordenadas del lienzo: la misma medida con que la escena lo
   * dibuja (`boxFootprint`), colgada del plato donde está ahora la barra.
   */
  const cajaEnLienzo = useCallback((): { cajaX: number; cajaY: number; cajaW: number; cajaH: number } => {
    const lado = problem.box?.side;
    if (!lado || !ghostOn) return { cajaX: -1000, cajaY: -1000, cajaW: 0, cajaH: 0 };
    const o = panOrigin(lado);
    return { cajaX: o.x - fp.w / 2, cajaY: o.y + fp.yBase - fp.h, cajaW: fp.w, cajaH: fp.h };
  }, [problem.box, ghostOn, panOrigin, fp]);

  /**
   * Toda la geometría que el gesto necesita, en un solo `SharedValue`. El
   * `Gesture` se arma una sola vez y no cambia de identidad entre renders:
   * gesture-handler en web pierde el gesto cuando el objeto cambia.
   */
  const geo = useSharedValue({
    activo: 0,
    tomado: -1,
    tomadoLado: 0,
    tomadoValor: 0,
    desdeX: 0,
    desdeY: 0,
    pesas: [] as { lado: number; i: number; v: number; x: number; y: number; r: number }[],
    fichas: [] as { lado: number; v: number; x: number; y: number; w: number; h: number }[],
    platoLX: 0,
    platoRX: 0,
    platoY: 0,
    platoR: 0,
    igualX: 0,
    igualY: 0,
    igualR: 0,
    igualLX: -1000,
    igualLY: -1000,
    conBalanza: 0,
    /** El cajón, en coordenadas del lienzo. Fuera de la pantalla cuando no hay. */
    cajaX: -1000,
    cajaY: -1000,
    cajaW: 0,
    cajaH: 0,
  });

  useEffect(() => {
    const ol = panOrigin("left");
    const or = panOrigin("right");
    const pesas = [
      ...spots.left.map((s, i) => ({
        lado: 0,
        i,
        v: s.value,
        x: ol.x + s.x,
        y: ol.y + s.y,
        r: Math.max(SLOP, Math.max(s.w, s.h) * 0.7),
      })),
      ...spots.right.map((s, i) => ({
        lado: 1,
        i,
        v: s.value,
        x: or.x + s.x,
        y: or.y + s.y,
        r: Math.max(SLOP, Math.max(s.w, s.h) * 0.7),
      })),
    ];
    geo.value = {
      // Qué se puede tocar es parte de la geometría y no del objeto del gesto:
      // deshabilitarlo con `.enabled()` lo obligaría a cambiar de identidad.
      activo: solved ? 0 : 1,
      tomado: -1,
      tomadoLado: 0,
      tomadoValor: 0,
      desdeX: 0,
      desdeY: 0,
      pesas: ghostOn ? pesas : [],
      // La caja no es un blanco: no se puede quitar lo que no se sabe cuánto es.
      fichas: (line?.terms ?? [])
        .filter((c) => c.value !== null && c.value !== 0)
        .map((c) => ({
          lado: c.side === "left" ? 0 : 1,
          v: c.value as number,
          x: c.x,
          y: c.y,
          w: c.w,
          h: c.h,
        })),
      platoLX: ol.x,
      platoRX: or.x,
      platoY: ol.y + fp.yBase - fp.h / 2,
      platoR: Math.max(l.panW * 0.6, 66),
      igualX: equalSpot.x,
      igualY: equalSpot.y,
      igualR: equalSpot.r,
      // El `=` del renglón también pide la balanza: con la balanza guardada, la
      // ficha de arriba queda sola en el aire y nadie iría a tocarla ahí.
      igualLX: line?.equalX ?? -1000,
      igualLY: line?.y ?? -1000,
      conBalanza: ghostOn ? 1 : 0,
      ...cajaEnLienzo(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots, line, panOrigin, solved, ghostOn, l, fp, equalSpot]);

  /** Lo que dice la línea de abajo cuando un gesto no llegó a ningún lado. */
  const avisar = useCallback((id: string) => {
    setMessage({ text: t(balMsg(id)), tone: "dim" });
  }, []);

  const pan = useMemo(
    () =>
      // Sin `minDistance(0)`: un `Pan` que cubre el lienzo con cero de umbral se
      // activa en el instante del apoyo y le roba el arrastre a las asas de la
      // reserva. El toque se cierra en `onFinalize` con un umbral.
      Gesture.Pan()
        .onBegin((e) => {
          const g = geo.value;
          let tomadoIdx = -1;
          let lado = 0;
          let valor = 0;
          let mejor = Number.POSITIVE_INFINITY;
          for (const p of g.pesas) {
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d < p.r && d < mejor) {
              mejor = d;
              tomadoIdx = p.i;
              lado = p.lado;
              valor = p.v;
            }
          }
          geo.value = {
            ...g,
            tomado: g.activo ? tomadoIdx : -1,
            tomadoLado: lado,
            tomadoValor: valor,
            desdeX: e.x,
            desdeY: e.y,
          };
          dragX.value = 0;
          dragY.value = 0;
          if (g.activo && tomadoIdx >= 0) runOnJS(setTakenKey)(`${lado}:${tomadoIdx}`);
        })
        .onChange((e) => {
          // Traslación total y no suma de deltas: el evento que activa el gesto
          // no llega a `onChange`, así que sumar deltas pierde ese tramo.
          dragX.value = e.translationX;
          dragY.value = e.translationY;
        })
        .onFinalize((e) => {
          const g = geo.value;
          const idx = g.tomado;
          const lado = g.tomadoLado;
          const valor = g.tomadoValor;
          geo.value = { ...g, tomado: -1 };
          runOnJS(setTakenKey)(null);
          dragX.value = withTiming(0, { duration: theme.motion.base });
          dragY.value = withTiming(0, { duration: theme.motion.base });
          if (!g.activo) return;

          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          const enPlato = (x: number, y: number): number => {
            if (!g.conBalanza) return -1;
            if (Math.hypot(x - g.platoLX, y - g.platoY) < g.platoR) return 0;
            if (Math.hypot(x - g.platoRX, y - g.platoY) < g.platoR) return 1;
            return -1;
          };

          if (movido >= TAP_SLOP) {
            // Un arrastre solo tiene un destino: el otro plato. Pasar una pesa
            // de un plato al otro está permitido, y es lo que más inclina.
            if (idx < 0) return;
            const destino = enPlato(e.x, e.y);
            if (destino >= 0 && destino !== lado) {
              runOnJS(cruzar)(lado === 0 ? "left" : "right", valor);
            } else {
              // Soltada en su mismo plato o en el aire, vuelve: la línea lo dice.
              runOnJS(avisar)("crossBack");
            }
            return;
          }

          if (idx >= 0) {
            runOnJS(tocarPesa)(lado === 0 ? "left" : "right", valor);
            return;
          }
          // La caja no es un blanco: no se puede quitar lo que no se sabe cuánto
          // es. Pero tocarla tiene que decir algo, o parece que el juego no oye.
          if (
            e.x > g.cajaX - SLOP &&
            e.x < g.cajaX + g.cajaW + SLOP &&
            e.y > g.cajaY - SLOP &&
            e.y < g.cajaY + g.cajaH + SLOP
          ) {
            runOnJS(avisar)("box");
            return;
          }
          for (const f of g.fichas) {
            if (
              e.x > f.x - f.w / 2 - SLOP &&
              e.x < f.x + f.w / 2 + SLOP &&
              e.y > f.y - f.h / 2 - SLOP &&
              e.y < f.y + f.h / 2 + SLOP
            ) {
              runOnJS(tocarPesa)(f.lado === 0 ? "left" : "right", f.v);
              return;
            }
          }
          if (
            Math.hypot(e.x - g.igualX, e.y - g.igualY) < g.igualR ||
            Math.hypot(e.x - g.igualLX, e.y - g.igualLY) < g.igualR
          ) {
            runOnJS(toggleGhost)();
            return;
          }
          const plato = enPlato(e.x, e.y);
          if (plato >= 0) runOnJS(soltarEn)(plato === 0 ? "left" : "right");
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Soltar un asa de la reserva sobre un plato. Dónde cayó es su lugar en la
   * reserva más lo que se movió, en coordenadas del lienzo. Antes se comparaba
   * la posición del dedo en la página con la caja del lienzo medida con
   * `onLayout`, que en web solo se entera de los cambios de tamaño: cuando el
   * cartel de Lumi aparecía arriba, el lienzo bajaba unos 200 px sin cambiar de
   * tamaño, la caja medida quedaba vieja y ninguna pesa arrastrada caía en un
   * plato (trampa 10).
   */
  const soltarAsa = useCallback(
    (h: Held, i: number, dx: number, dy: number) => {
      if (!h) return;
      if (!ghostOn) {
        setMessage({ text: t(balMsg("ghost")), tone: "dim" });
        return;
      }
      const casa = fichaEn(i);
      const x = casa.x + dx;
      const yy = casa.y + dy;
      const ol = panOrigin("left");
      const or = panOrigin("right");
      const y = ol.y + fp.yBase - fp.h / 2;
      const r = Math.max(l.panW * 0.6, 66);
      if (Math.hypot(x - ol.x, yy - y) < r) {
        setHeld(h);
        setTimeout(() => soltarEn("left"), 0);
        return;
      }
      if (Math.hypot(x - or.x, yy - (or.y + fp.yBase - fp.h / 2)) < r) {
        setHeld(h);
        setTimeout(() => soltarEn("right"), 0);
        return;
      }
      // Soltada en el aire, la pesa vuelve a la reserva: la línea dice adónde iba.
      setMessage({ text: t(balMsg("dropOff")), tone: "dim" });
    },
    [fichaEn, panOrigin, fp, l.panW, ghostOn, soltarEn],
  );

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda: la pesa que
   * sobra, las dos iguales que se sacan, la ficha de la reserva que falta poner
   * y el plato donde va. Todo en coordenadas del lienzo: la reserva vive en la
   * franja de abajo de la misma vista. La pista de Tomi reusa los pasos: señala
   * lo mismo, pero no frena la ronda.
   */
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const id = shown.id;
    const ox = 0;
    const oy = 0;
    const ol = panOrigin("left");
    const or = panOrigin("right");
    const origen = (s: BalSide): { x: number; y: number } => (s === "left" ? ol : or);
    const conMargen = (x: number, y: number, w: number, h: number, m: number): Rect => ({
      x: x - m + ox,
      y: y - m + oy,
      w: w + m * 2,
      h: h + m * 2,
    });
    /** Una pesa de un plato, y su ficha en la línea si la hay: los dos son el mismo blanco. */
    const pesa = (s: BalSide, v: number): Rect[] => {
      const out: Rect[] = [];
      const sp = ghostOn ? spots[s].find((x) => x.value === v) : undefined;
      if (sp) {
        const o = origen(s);
        out.push(conMargen(o.x + sp.x - sp.w / 2, o.y + sp.y - sp.h / 2, sp.w, sp.h, 7));
      }
      const c = line?.terms.find((tm) => tm.side === s && tm.value === v);
      if (c) out.push(conMargen(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 6));
      return out;
    };
    const platoPt = (s: BalSide): Pt => {
      const o = origen(s);
      return { x: o.x + ox, y: o.y + fp.yBase - fp.h / 2 + oy };
    };
    const plato = (s: BalSide): Rect => {
      const o = origen(s);
      return conMargen(o.x - l.panW / 2, o.y + l.hang - 64, l.panW, 80, 6);
    };
    const barra = conMargen(l.cx - l.span - 14, l.beamY - 14, l.span * 2 + 28, 28, 4);
    const caja = (() => {
      const c = cajaEnLienzo();
      return c.cajaW > 0 ? conMargen(c.cajaX, c.cajaY, c.cajaW, c.cajaH, 10) : null;
    })();
    const renglon = line
      ? conMargen(line.from, line.y - CHIP_H / 2, line.to - line.from, CHIP_H, 8)
      : null;
    /** Una ficha de la reserva, por su lugar en la fila de abajo. */
    const reserva = (i: number): { rect: Rect; pt: Pt } | null => {
      if (i < 0 || i >= fichasReserva) return null;
      const p = fichaEn(i);
      const m = RESERVE_CHIP / 2 + 6;
      return { rect: { x: p.x - m, y: p.y - m, w: m * 2, h: m * 2 }, pt: p };
    };
    const solo = (rs: readonly (Rect | null)[]): Focus => ({ rings: rs.filter((r): r is Rect => r !== null) });
    /** La pesa que está en los dos platos: la que se saca de los dos. */
    const comun = (): number => state.left.find((x) => state.right.includes(x)) ?? state.left[0] ?? 0;
    /** La pesa del plato pesado que sobra justo: sacarla endereza la barra. */
    const sobra = (): { rect: Rect }[] => {
      const d = balMass(problem, state, "left") - balMass(problem, state, "right");
      if (d === 0) return [];
      const pesado: BalSide = d > 0 ? "left" : "right";
      return pesa(pesado, Math.abs(d)).map((rect) => ({ rect }));
    };
    /** Poner una pesa de la reserva en un plato: la ficha, el plato y la luz entre los dos. */
    const poner = (v: number, s: BalSide): Focus => {
      const ficha = reserva(problem.reserve.indexOf(v));
      if (!ficha || !ghostOn) return solo([ghostOn ? plato(s) : renglon]);
      return { rings: [ficha.rect, plato(s)], drag: { from: ficha.pt, to: platoPt(s) } };
    };

    if (id === "look") {
      if (problem.ask === "free") return solo(conLinea && level.n === 5 ? [renglon] : [caja, ...pesa("left", comun()), ...pesa("right", comun())]);
      if (problem.ask === "level" || problem.ask === "repair") return solo([barra, ...sobra().map((x) => x.rect)]);
      return solo([barra]);
    }
    if (id === "reveal") return solo(problem.ask === "free" ? [caja ?? barra] : [barra]);

    if (problem.ask === "level" || problem.ask === "repair") {
      const s = sobra();
      if (s.length > 0) return solo(s.map((x) => x.rect));
      const falta = Math.abs(balMass(problem, state, "left") - balMass(problem, state, "right"));
      const liviano: BalSide = balMass(problem, state, "left") < balMass(problem, state, "right") ? "left" : "right";
      return poner(falta, liviano);
    }
    if (problem.ask === "action") {
      if (held?.kind === "action") {
        const falta: BalSide = state.actedLeft.length <= state.actedRight.length ? "left" : "right";
        return solo([plato(falta)]);
      }
      const fichas = problem.actions
        .map((a, i) => (a === "pour" ? null : reserva(i)?.rect ?? null))
        .filter((r): r is Rect => r !== null);
      return solo([union(fichas), plato("left"), plato("right")]);
    }
    // Conservar y dejar la caja sola: la misma acción en los dos platos. Con
    // medio movimiento hecho, lo que falta es el espejo en el otro plato.
    if (pending) {
      const otro = balOtherSide(pending.side);
      if (pending.kind === "add") return poner(pending.value, otro);
      if (pending.kind === "remove") return solo(pesa(otro, pending.value));
      return solo([plato(otro)]);
    }
    const task = problem.task;
    if (problem.ask === "keep" && task?.kind === "add") return poner(task.value, state.taskLeft ? "right" : "left");
    const v = problem.ask === "keep" && task ? task.value : comun();
    return solo([...pesa("left", v), ...pesa("right", v)]);
  }, [
    shown,
    panOrigin,
    ghostOn,
    spots,
    line,
    fp,
    l,
    cajaEnLienzo,
    fichaEn,
    fichasReserva,
    problem,
    state,
    pending,
    held,
    conLinea,
    level.n,
  ]);

  // --- Dibujo ----------------------------------------------------------------

  const equalPath = useMemo(
    () => equalTokenPath(equalSpot.x, equalSpot.y, level.skin === "chips"),
    [equalSpot, level.skin],
  );
  const linePath = useMemo(() => lineGlyphsPath(line), [line]);
  const chipsPath = useMemo(() => chipsBodyPath(line), [line]);

  // La ficha de igual se enciende con la barra derecha y se apaga con la torcida.
  // No es un premio: es el mismo hecho dicho de otra manera.
  const nivelada = balLevelled(problem, state);
  const equalOn = useSharedValue(0);
  useEffect(() => {
    equalOn.value = withTiming(nivelada ? 1 : 0, { duration: theme.motion.base });
  }, [nivelada, equalOn]);
  const igualO = useDerivedValue(() => 0.16 + 0.84 * equalOn.value);

  const definicion = level.definition ? BAL_DEFINITION_KEYS[round % BAL_DEFINITION_KEYS.length] : null;

  return (
    <View style={styles.root}>

      <Header
        title={`${t(`node.${NODE_BALANCE_EQ}.name`)} · nivel ${level.n} de ${TOTAL_BAL_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!conLeccion}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH + TRAY_H }}>
        {/* Un solo lienzo por pantalla: la balanza, la ficha de igual y la
            línea simbólica viven adentro. */}
        <Canvas style={{ width, height: sceneH }}>
          <BalanceScene
            problem={balanceProblem}
            unknownLeft={problem.box?.side !== "right"}
            style={style}
            width={width}
            height={balanceH}
            left={leftPan}
            right={rightPan}
            appear={balanceAppear}
            contents={contents}
            tilt={tilt}
            openness={openness}
            // Una balanza que afirma no lleva ningún signo adentro de un plato:
            // el único signo del nodo es el `=`, y va entre los dos.
            brooch={false}
            // Las pesas las dibuja el nodo, así que la escena no las ve cambiar:
            // se lo dice esta firma, y la barra que se endereza después de
            // cargar o sacar suelta su halo y su golpe.
            loads={`${state.left.join(",")}|${state.right.join(",")}|${state.actedLeft.join(",")}|${state.actedRight.join(",")}`}
            overlayLeft={
              <PanOverlay
                spots={spots.left}
                ghost={ghostSpots?.left}
                skin={level.skin}
                acted={state.actedLeft}
                figuras={problem.ask === "action"}
                hint={hint.left}
                pulse={pulse}
                halo={haloSide === "left" ? halo : null}
                haloR={Math.max(l.panW * 0.6, 66)}
                haloY={fp.yBase - fp.h / 2}
                takenIdx={takenKey?.startsWith("0:") ? Number(takenKey.slice(2)) : -1}
                round={round}
                lastMove={before}
                dragX={dragX}
                dragY={dragY}
              />
            }
            overlayRight={
              <PanOverlay
                spots={spots.right}
                ghost={ghostSpots?.right}
                skin={level.skin}
                acted={state.actedRight}
                figuras={problem.ask === "action"}
                hint={hint.right}
                pulse={pulse}
                halo={haloSide === "right" ? halo : null}
                haloR={Math.max(l.panW * 0.6, 66)}
                haloY={fp.yBase - fp.h / 2}
                takenIdx={takenKey?.startsWith("1:") ? Number(takenKey.slice(2)) : -1}
                round={round}
                lastMove={before}
                dragX={dragX}
                dragY={dragY}
              />
            }
          />

          {/* La ficha de igual: apagada desde el primer nivel, encendida cuando
              la barra queda derecha. Encenderla es todo el objetivo al principio. */}
          <Group opacity={igualO}>
            <Path path={equalPath} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
          </Group>

          <ChipBodies path={chipsPath} />
          <Path path={linePath} color={theme.color.ink} />
        </Canvas>

        {/* El gesto va encima del lienzo, y solo del lienzo: la reserva de
            abajo tiene sus propias asas. Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={pan}>
          <Animated.View style={{ position: "absolute", left: 0, top: 0, width, height: sceneH }} />
        </GestureDetector>

        {/* La reserva, en la franja de abajo de la misma vista: cada ficha en un
            lugar que el gesto y la guía conocen. */}
        {problem.ask === "action"
          ? problem.actions.map((a, i) => {
              const p = fichaEn(i);
              return (
                <View
                  key={a}
                  style={[styles.reserveSlot, { left: p.x - RESERVE_CHIP / 2, top: p.y - RESERVE_CHIP / 2 }]}
                >
                  <Handle
                    label={ACTION_LABEL[a]}
                    on={held?.kind === "action" && held.action === a}
                    dimmed={solved}
                    onTake={() => tomar({ kind: "action", action: a })}
                    onDrop={(dx, dy) => soltarAsa({ kind: "action", action: a }, i, dx, dy)}
                  />
                </View>
              );
            })
          : problem.reserve.map((v, i) => {
              const p = fichaEn(i);
              return (
                <View
                  key={v}
                  style={[styles.reserveSlot, { left: p.x - RESERVE_CHIP / 2, top: p.y - RESERVE_CHIP / 2 }]}
                >
                  <Handle
                    label={String(v)}
                    on={held?.kind === "weight" && held.value === v}
                    dimmed={solved}
                    onTake={() => tomar({ kind: "weight", value: v })}
                    onDrop={(dx, dy) => soltarAsa({ kind: "weight", value: v }, i, dx, dy)}
                  />
                </View>
              );
            })}

        {/* La luz de la guía, encima de todo y sin llevarse ningún toque. */}
        <Spotlight focus={focus} />
      </View>

      <Hint text={message.text} tone={message.tone} />

      {definicion ? <Text style={styles.definition}>{t(definicion)}</Text> : null}
      {level.balance === "ghost" ? (
        <Text style={styles.foot}>
          {ghostOn ? "Tocá el igual para guardar la balanza." : "Tocá el igual para verla."}
        </Text>
      ) : null}
    </View>
  );
}

// --- El asa de la reserva ----------------------------------------------------

const ACTION_LABEL: Record<BalActionKind, string> = {
  turn: "⟳",
  paint: "●",
  addFigure: "▲+",
  pour: "↷",
};

/**
 * Una pesa de la reserva, o una acción. Es un elemento propio y no un dibujo del
 * lienzo, por dos razones: el arrastre de un asa es el que el navegador entrega
 * entero, y un toque la levanta para que el juego se pueda jugar sin arrastrar.
 */
function Handle({
  label,
  on,
  dimmed,
  onTake,
  onDrop,
}: {
  readonly label: string;
  readonly on: boolean;
  readonly dimmed: boolean;
  readonly onTake: () => void;
  /** Cuánto se movió la ficha desde su lugar: quien la ubica sabe dónde cayó. */
  readonly onDrop: (dx: number, dy: number) => void;
}) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onChange((e) => {
          dx.value = e.translationX;
          dy.value = e.translationY;
        })
        .onFinalize((e) => {
          const movido = Math.hypot(e.translationX, e.translationY);
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
          if (movido < TAP_SLOP) runOnJS(onTake)();
          else runOnJS(onDrop)(e.translationX, e.translationY);
        }),
    [dx, dy, onTake, onDrop],
  );
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }],
  }));
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[handleStyles.chip, on && handleStyles.on, dimmed && handleStyles.dim, style]}
      >
        <Text style={[handleStyles.label, on && handleStyles.labelOn]}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const handleStyles = StyleSheet.create({
  chip: {
    minWidth: 56,
    height: 56,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    ...chipFace,
    alignItems: "center",
    justifyContent: "center",
  },
  on: { borderColor: theme.color.accent, backgroundColor: theme.color.surface },
  dim: { opacity: 0.35 },
  label: { color: theme.color.inkDim, fontSize: 20, fontVariant: ["tabular-nums"] },
  labelOn: { color: theme.color.accent },
});

// --- Lo que se dibuja adentro de un plato ------------------------------------

/**
 * Los objetos de un plato. Cuelga del grupo del plato, así que se inclina con
 * la barra sin repetir la trigonometría: `overlayLeft` y `overlayRight` de la
 * escena existen para esto.
 */
function PanOverlay({
  spots,
  ghost,
  skin,
  acted,
  figuras,
  hint,
  pulse,
  halo,
  haloR,
  haloY,
  takenIdx,
  round,
  lastMove,
  dragX,
  dragY,
}: {
  readonly spots: readonly Spot[];
  readonly ghost: readonly Spot[] | undefined;
  readonly skin: "weights" | "bars" | "chips";
  readonly acted: readonly BalActionKind[];
  readonly figuras: boolean;
  readonly hint: number | null;
  readonly pulse: ReturnType<typeof useSharedValue<number>>;
  readonly halo: ReturnType<typeof useSharedValue<number>> | null;
  /** Cuál de estos objetos sigue al dedo, o -1. */
  readonly takenIdx: number;
  /** La ronda: un plato que cambia de ronda trae otro montón, y eso no es una llegada. */
  readonly round: number;
  /**
   * El estado de antes del último movimiento: cambia con cada movimiento del
   * jugador y vuelve a `null` cuando la ronda se rearma. Solo un movimiento
   * puede traer una pesa que rebote al llegar.
   */
  readonly lastMove: object | null;
  readonly haloR: number;
  readonly haloY: number;
  readonly dragX: ReturnType<typeof useSharedValue<number>>;
  readonly dragY: ReturnType<typeof useSharedValue<number>>;
}) {
  const vueltas = acted.filter((a) => a === "turn").length;
  const pintado = acted.includes("paint");

  /**
   * La pesa que acaba de llegar a este plato: el plato tiene una más y todas las
   * de antes siguen. Es la que rebota al caer; una ronda nueva trae otro montón
   * y no cuenta como llegada.
   */
  const previas = useRef<{
    readonly round: number;
    readonly move: object | null;
    readonly values: readonly number[];
  }>({ round, move: lastMove, values: spots.map((s) => s.value) });
  const llegada = useMemo(() => {
    if (previas.current.round !== round) return -1;
    if (lastMove === null || previas.current.move === lastMove) return -1;
    const antes = previas.current.values;
    const ahora = spots.map((s) => s.value);
    if (ahora.length !== antes.length + 1) return -1;
    const resto = [...antes];
    let extra = -1;
    ahora.forEach((v, i) => {
      const j = resto.indexOf(v);
      if (j >= 0) resto.splice(j, 1);
      else extra = i;
    });
    return resto.length === 0 ? extra : -1;
  }, [spots, round, lastMove]);
  useEffect(() => {
    previas.current = { round, move: lastMove, values: spots.map((s) => s.value) };
  }, [spots, round, lastMove]);

  /**
   * Levantar crece un 30 %; soltar la devuelve desde donde la dejó el dedo (el
   * arrastre vuelve a cero solo, y la pesa viaja con él) y rebota al llegar.
   */
  const alzada = useSharedValue(0);
  const [vuelta, setVuelta] = useState(-1);
  const tomadaAntes = useRef(takenIdx);
  useEffect(() => {
    const antes = tomadaAntes.current;
    tomadaAntes.current = takenIdx;
    if (takenIdx >= 0) {
      setVuelta(-1);
      alzada.value = withSpring(1, theme.spring.lift);
      play("lift");
      return;
    }
    alzada.value = withSpring(0, theme.spring.settle);
    if (antes < 0) return;
    setVuelta(antes);
    const t = setTimeout(() => setVuelta(-1), theme.motion.base + 60);
    return () => clearTimeout(t);
  }, [takenIdx, alzada]);
  // Si la pesa se fue al otro plato, este ya no la tiene: nada que devolver.
  useEffect(() => {
    setVuelta(-1);
  }, [spots]);

  /** El rebote de la que llegó, y su "toc": la nota sube con lo que hay en el plato. */
  const pop = useSharedValue(0);
  useEffect(() => {
    if (llegada < 0) return;
    pop.value = 1;
    pop.value = withSpring(0, theme.spring.settle);
    play("drop", { pitch: Math.min(12, spots.length) });
  }, [llegada, spots, pop]);

  /**
   * Tres montones en tres trazos: las que se quedan quietas, la que el dedo
   * lleva (o vuelve) y la que acaba de llegar. Cada uno con su brillo y sus
   * números, así el volumen cuesta lo mismo con dos pesas que con doce.
   */
  const cuerpos = useMemo(() => {
    const quietas = Skia.Path.Make();
    const tomada = Skia.Path.Make();
    const nueva = Skia.Path.Make();
    const brillo = Skia.Path.Make();
    const brilloTomada = Skia.Path.Make();
    const brilloNueva = Skia.Path.Make();
    const etiquetas = Skia.Path.Make();
    const etiquetaTomada = Skia.Path.Make();
    const etiquetaNueva = Skia.Path.Make();
    let centroTomada = { x: 0, y: 0 };
    let centroNueva = { x: 0, y: 0 };
    spots.forEach((s, i) => {
      const suya = i === takenIdx || (takenIdx < 0 && i === vuelta);
      const recien = !suya && i === llegada;
      if (suya) centroTomada = { x: s.x, y: s.y };
      if (recien) centroNueva = { x: s.x, y: s.y };
      drawSpot(suya ? tomada : recien ? nueva : quietas, s, skin, figuras, vueltas);
      if (skin !== "chips") {
        addShine(suya ? brilloTomada : recien ? brilloNueva : brillo, s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
      }
      if (figuras || skin === "bars") return;
      addGlyphs(
        suya ? etiquetaTomada : recien ? etiquetaNueva : etiquetas,
        String(s.value),
        s.x,
        s.y,
        skin === "chips" ? 15 : 13,
      );
    });
    return {
      quietas,
      tomada,
      nueva,
      brillo,
      brilloTomada,
      brilloNueva,
      etiquetas,
      etiquetaTomada,
      etiquetaNueva,
      centroTomada,
      centroNueva,
    };
  }, [spots, skin, figuras, vueltas, takenIdx, vuelta, llegada]);

  const fantasma = useMemo(() => {
    const p = Skia.Path.Make();
    for (const s of ghost ?? []) drawSpot(p, s, skin, figuras, vueltas);
    return p;
  }, [ghost, skin, figuras, vueltas]);

  const latido = useMemo(() => {
    const p = Skia.Path.Make();
    if (hint === null) return p;
    const s = spots.find((x) => x.value === hint);
    // Un contorno y no un círculo: con las barras, un círculo del largo de la
    // barra tapaba la balanza entera.
    if (s) {
      p.addRRect(
        Skia.RRectXY(Skia.XYWHRect(s.x - s.w / 2 - 5, s.y - s.h / 2 - 5, s.w + 10, s.h + 10), 7, 7),
      );
    }
    return p;
  }, [spots, hint]);

  const haloPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, haloY, haloR);
    return p;
  }, [haloR, haloY]);

  const latidoO = useDerivedValue(() => 0.25 + 0.6 * pulse.value);
  const haloO = useDerivedValue(() => (halo ? halo.value : 0), [halo]);
  const ct = cuerpos.centroTomada;
  const cn = cuerpos.centroNueva;
  const tomadaT = useDerivedValue(
    () => [
      { translateX: dragX.value + ct.x },
      { translateY: dragY.value + ct.y },
      { scale: 1 + 0.3 * alzada.value },
      { translateX: -ct.x },
      { translateY: -ct.y },
    ],
    [ct.x, ct.y],
  );
  const nuevaT = useDerivedValue(
    () => [
      { translateX: cn.x },
      { translateY: cn.y },
      { scale: 1 + 0.22 * pop.value },
      { translateX: -cn.x },
      { translateY: -cn.y },
    ],
    [cn.x, cn.y],
  );

  // Una figura pintada toma el color de lo que se le hizo; una pesa es peltre,
  // de nadie. Sobre el peltre claro el número se graba en tinta oscura.
  const look = figuras && pintado ? BOX_LOOK : WEIGHT_LOOK;
  const tinta = skin === "chips" ? theme.color.ink : ENGRAVED_INK;
  const cuerpo = (path: SkPath, brillo: SkPath) =>
    skin === "chips" ? <ChipBodies path={path} /> : <WeightBodies path={path} shine={brillo} look={look} />;

  return (
    <>
      {/* El antes, detrás: dos estados distintos, la misma igualdad. */}
      <Path path={fantasma} color={theme.color.inkFaint} style="stroke" strokeWidth={1} opacity={0.4} />
      <Group opacity={haloO}>
        <Path path={haloPath} color={theme.color.warn} style="stroke" strokeWidth={2} />
      </Group>
      {/* La demostración es la guía: dorada. */}
      <Group opacity={latidoO}>
        <Path path={latido} color={theme.color.gold} style="stroke" strokeWidth={6} opacity={0.45}>
          <BlurMask blur={4} style="normal" />
        </Path>
        <Path path={latido} color={theme.color.gold} style="stroke" strokeWidth={2} />
      </Group>
      {cuerpo(cuerpos.quietas, cuerpos.brillo)}
      <Path path={cuerpos.etiquetas} color={tinta} />
      <Group transform={nuevaT}>
        {cuerpo(cuerpos.nueva, cuerpos.brilloNueva)}
        <Path path={cuerpos.etiquetaNueva} color={tinta} />
      </Group>
      <Group transform={tomadaT}>
        {cuerpo(cuerpos.tomada, cuerpos.brilloTomada)}
        <Path path={cuerpos.etiquetaTomada} color={tinta} />
      </Group>
    </>
  );
}

/** La tinta de un número grabado en una pesa de peltre: sobre metal claro, oscura. */
const ENGRAVED_INK = "#1a2433";

/**
 * Dónde va cada objeto adentro de un plato, con el eje del grupo del plato como
 * origen. Las pesas van en fila y las barras en columna, porque una barra dice
 * cuánto pesa con el largo y necesita el ancho entero.
 */
function panSpots(
  values: readonly number[],
  skin: "weights" | "bars" | "chips",
  l: BalanceLayout,
  fp: { readonly w: number; readonly h: number; readonly yBase: number },
  hasBox: boolean,
  /** La vara con que se miden las barras. Es la misma para los dos platos, o el
   *  largo dejaría de decir cuánto pesa y pasaría a decir cuántos hay al lado. */
  escala: number,
): Spot[] {
  const piso = hasBox ? fp.yBase - fp.h - 10 : fp.yBase - 6;
  const n = values.length;
  if (n === 0) return [];
  if (skin === "bars") {
    const ancho = l.panW * 0.86;
    return values.map((v, i) => ({
      x: 0,
      y: piso - 8 - i * 17,
      w: Math.max(10, (ancho * v) / Math.max(escala, 6)),
      h: 10,
      value: v,
    }));
  }
  const slot = Math.min(34, (l.panW * 0.94) / n);
  const tam = Math.min(30, slot - 3);
  return values.map((v, i) => ({
    x: (i - (n - 1) / 2) * slot,
    y: piso - tam / 2,
    w: tam,
    h: tam,
    value: v,
  }));
}

/** La piel del objeto. Un solo trazo por plato: el presupuesto manda. */
function drawSpot(
  p: SkPath,
  s: Spot,
  skin: "weights" | "bars" | "chips",
  figura: boolean,
  vueltas: number,
): void {
  if (figura) {
    // Un triángulo que gira noventa grados por cada vuelta aplicada. Lo que se
    // conserva no tiene nada que ver con pesar, y eso es justamente el punto.
    const r = s.w * 0.5;
    const base = (vueltas * Math.PI) / 2 - Math.PI / 2;
    for (let k = 0; k < 3; k++) {
      const a = base + (k * 2 * Math.PI) / 3;
      const x = s.x + r * Math.cos(a);
      const y = s.y + r * Math.sin(a);
      if (k === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }
    p.close();
    return;
  }
  if (skin === "bars") {
    p.addRect(Skia.XYWHRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h));
    return;
  }
  if (skin === "chips") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h), 5, 5));
    return;
  }
  // Una pesa: el trapecio con el asa arriba, que es como se ven las de verdad.
  const w = s.w / 2;
  const h = s.h / 2;
  p.moveTo(s.x - w, s.y + h);
  p.lineTo(s.x + w, s.y + h);
  p.lineTo(s.x + w * 0.7, s.y - h * 0.6);
  p.lineTo(s.x - w * 0.7, s.y - h * 0.6);
  p.close();
  p.addArc(Skia.XYWHRect(s.x - w * 0.34, s.y - h * 1.1, w * 0.68, h * 0.8), 180, 180);
}

// --- La línea simbólica ------------------------------------------------------

/** El alto de una ficha de la línea, el ancho mínimo, y el aire entre términos. */
const CHIP_H = 30;
const CHIP_W = 30;
const CHIP_GAP = 22;
/** Cuánto aire deja el `=` a cada lado. Es el `\thickmuskip` de siempre. */
const EQUAL_GAP = 30;

/** Un término de la línea: una ficha con número, o la caja. */
interface Term {
  readonly side: BalSide;
  /** El valor, o null en la caja: la caja no dice cuánto. */
  readonly value: number | null;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface LineLayout {
  readonly terms: readonly Term[];
  /** Dónde va cada `+`, ya en el medio de dos términos del mismo lado. */
  readonly plus: readonly { readonly x: number; readonly y: number }[];
  readonly equalX: number;
  readonly y: number;
  readonly from: number;
  readonly to: number;
}

const chipW = (v: number | null): number =>
  v === null ? CHIP_W : Math.max(CHIP_W, 14 + String(v).length * 12);

/**
 * La línea con el `=`: los dos lados escritos completos, aunque uno sea un solo
 * número, porque `12 = 12` sirve para reconocer que se terminó. La caja abre su
 * lado, como en `x + 5`.
 *
 * Cada ficha es un blanco: tocar la ficha `5` de un lado es tocar ese plato, que
 * es lo que la línea heredó de la barra junto con el poder de inclinarse.
 */
function lineLayout(problem: BalProblem, state: BalState, width: number, y: number): LineLayout {
  const terms: Term[] = [];
  const plus: { x: number; y: number }[] = [];
  const centro = width / 2;

  const valores = (side: BalSide): (number | null)[] => {
    const sueltas = side === "left" ? state.left : state.right;
    const conCaja: (number | null)[] = problem.box?.side === side ? [null] : [];
    const todo = [...conCaja, ...sueltas];
    // El plato vacío es cero, y se escribe.
    return todo.length > 0 ? todo : [0];
  };

  const anchoDe = (side: BalSide): number => {
    const vs = valores(side);
    return vs.reduce<number>((s, v) => s + chipW(v), 0) + (vs.length - 1) * CHIP_GAP;
  };

  const poner = (side: BalSide, x0: number): void => {
    let x = x0;
    let anterior = -1;
    for (const v of valores(side)) {
      const w = chipW(v);
      const cx = x + w / 2;
      terms.push({ side, value: v, x: cx, y, w, h: CHIP_H });
      if (anterior >= 0) plus.push({ x: (anterior + cx) / 2, y });
      anterior = cx;
      x += w + CHIP_GAP;
    }
  };

  const wl = anchoDe("left");
  poner("left", centro - EQUAL_GAP - wl);
  poner("right", centro + EQUAL_GAP);

  return {
    terms,
    plus,
    equalX: centro,
    y,
    from: centro - EQUAL_GAP - wl - 14,
    to: centro + EQUAL_GAP + anchoDe("right") + 14,
  };
}

/**
 * El contorno de las fichas, que es donde se toca, y el renglón del que
 * cuelgan. Van juntos porque los dos se dibujan con trazo: un trazo suelto
 * metido en el camino de los glifos, que se rellena, no se vería.
 */
function chipsBodyPath(line: LineLayout | null): SkPath {
  const p = Skia.Path.Make();
  if (!line) return p;
  for (const c of line.terms) {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h), 6, 6));
  }
  // El renglón: cada estado se escribe abajo del anterior, y esta es su línea.
  p.moveTo(line.from, line.y + CHIP_H);
  p.lineTo(line.to, line.y + CHIP_H);
  return p;
}

/**
 * Los glifos de la línea: los números, la `x` de la caja, los `+` entre
 * términos y el `=` en el medio. No hay restas escritas: qué hizo el jugador
 * queda implícito en la diferencia entre renglones, y anotarla debajo llega en
 * el nodo 13.
 */
function lineGlyphsPath(line: LineLayout | null): SkPath {
  const p = Skia.Path.Make();
  if (!line) return p;
  addGlyphs(p, "=", line.equalX, line.y, 26);
  for (const c of line.terms) {
    addGlyphs(p, c.value === null ? "x" : String(c.value), c.x, c.y, c.value === null ? 19 : 17);
  }
  for (const s of line.plus) addGlyphs(p, "+", s.x, s.y, 17);
  return p;
}

/**
 * La ficha de igual entre los platos. En las capas concretas todavía no tiene
 * forma de signo —es una ficha y nada más—, y en `symbolic` ya es el `=`, que
 * es la barra vista de canto.
 */
function equalTokenPath(cx: number, cy: number, esSigno: boolean): SkPath {
  const p = Skia.Path.Make();
  if (esSigno) {
    p.moveTo(cx - 11, cy - 5);
    p.lineTo(cx + 11, cy - 5);
    p.moveTo(cx - 11, cy + 5);
    p.lineTo(cx + 11, cy + 5);
    return p;
  }
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(cx - 15, cy - 11, 30, 22), 7, 7));
  return p;
}

/**
 * Una cadena de glifos del atlas, centrada. Sale del mismo atlas que compone
 * las ecuaciones, así que el `5` de una pesa y el `5` de una ecuación son el
 * mismo objeto.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  for (const c of chars) advance += getGlyph(c)?.advance ?? 0.5;
  let x = cx - (advance * size) / 2;
  const baseline = cy + size * 0.333;
  for (const c of chars) {
    const glyph = getGlyph(c);
    const src = pathFor(c);
    if (glyph && src) {
      const copy = src.copy();
      copy.transform([size, 0, x, 0, size, baseline, 0, 0, 1]);
      target.addPath(copy);
    }
    x += (glyph?.advance ?? 0.5) * size;
  }
}

/** El rectángulo que abraza a todos: para señalar una fila de fichas con un solo anillo. */
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

// --- Texto -------------------------------------------------------------------

const igual = (a: BalState, b: BalState): boolean =>
  a.left.length === b.left.length &&
  a.right.length === b.right.length &&
  a.left.every((v, i) => v === b.left[i]) &&
  a.right.every((v, i) => v === b.right[i]) &&
  a.actedLeft.length === b.actedLeft.length &&
  a.actedRight.length === b.actedRight.length;

function apertura(problem: BalProblem, level: BalLevel): string {
  switch (problem.ask) {
    case "level":
      return "La barra está torcida. Agregá o sacá pesas hasta que quede derecha.";
    case "keep":
      return problem.task?.kind === "remove"
        ? `La barra ya está derecha. Sacá ${problem.task.value} de los dos platos sin torcerla.`
        : `La barra ya está derecha. Poné ${problem.task?.value ?? 1} en los dos platos sin torcerla.`;
    case "repair":
      return "Esta igualdad es falsa. Acá sí hay que tocar un solo plato: el que pesa de menos.";
    case "action":
      return "Estas acciones no pesan nada. Aplicá la misma a los dos platos y mirá la barra.";
    default:
      return level.balance === "ghost"
        ? "Sacá lo mismo de los dos lados hasta dejar la caja sola. La balanza está detrás del igual."
        : "Sacá lo mismo de los dos platos hasta que la caja quede sola.";
  }
}

function aviso(problem: BalProblem, state: BalState, pending: BalMove | null): string {
  if (pending) return "La barra se torció: eso fue un solo plato. Hacé lo mismo del otro lado.";
  if (problem.ask === "free" && balBoxAlone(problem, state)) {
    return "La caja quedó sola, pero la barra todavía no está derecha.";
  }
  if (balLevelled(problem, state)) {
    return "La barra sigue derecha: la igualdad aguantó. Todavía falta algo.";
  }
  return "La barra quedó torcida. Lo que le hiciste a un plato le falta al otro.";
}

function cierre(problem: BalProblem): string {
  switch (problem.ask) {
    case "level":
      return "Quedó derecha. Los dos platos pesan lo mismo, y eso es todo lo que dice el igual.";
    case "keep":
      return "La barra no se movió. La misma acción en los dos lados no rompe nada.";
    case "repair":
      return "Reparada. Acá no había nada que conservar: había algo que arreglar.";
    case "action":
      return "Girar no pesa, y la barra igual no se movió. El invariante no era el peso.";
    default:
      return "La caja quedó sola. Lo que hay enfrente es lo que tenía adentro.";
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  back: { position: "absolute", top: 48, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  reserveSlot: {
    position: "absolute",
    width: RESERVE_CHIP,
    height: RESERVE_CHIP,
    alignItems: "center",
    justifyContent: "center",
  },
  definition: {
    color: theme.color.inkDim,
    fontSize: 12,
    maxWidth: 520,
    textAlign: "center",
  },
  foot: { color: theme.color.inkFaint, fontSize: 12 },
});
