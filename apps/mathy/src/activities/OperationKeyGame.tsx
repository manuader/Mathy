/**
 * El llavero: el minijuego de `prealg.inv.operation_as_key`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: el llavero late, un punto fantasma lleva una llave hasta
 * la cerradura y el cofre contesta. Los mensajes de abajo son para el adulto que
 * mira; el juego funciona igual con la pantalla tapada hasta la mitad.
 *
 * Con lección, la guía de Lumi reemplaza al punto fantasma en la primera ronda:
 * cada paso señala la llave, la ranura o la flecha de esta ronda, sacadas de la
 * misma geometría con que la escena las dibuja, y el paso que explica frena la
 * ronda hasta que el jugador dice "entendido".
 *
 * Cinco gestos y ninguno fino:
 *
 * - Soltar una llave sobre la cerradura, o tocarla. Las dos cosas prueban la
 *   misma llave: el diseño pide arrastrar en el primer nivel y tocar en el
 *   segundo, y una llave que solo respondiera al arrastre dejaría afuera al
 *   `recognize` del segundo.
 * - Tocar una ficha de operación y una de número para armar la llave. Cuando las
 *   dos ranuras están llenas, la llave gira sola: nadie tiene que apretar nada
 *   para confirmar.
 * - Tocar una de las dos vueltas que corren al mismo tiempo.
 * - Soltar las llaves de una cadena, que solo entran desde la última acción
 *   hacia la primera.
 * - Tocar la acción que deshace una cerradura cualquiera, o el candado tachado
 *   cuando no hay ninguna.
 *
 * Las tres respuestas del cofre son tres y no dos, y esa es la decisión de
 * diseño que gobierna el archivo: la llave que no entra se traba, la que entra
 * con el número equivocado abre y deja el objeto fuera de la silueta, y la que
 * devuelve lo hace encajar. Solo la primera es un error catalogado.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  KEY_INVERSE,
  KEY_RING_SLOTS,
  KEY_TILE_SLOTS,
  NODE_OPERATION_KEY,
  TOTAL_KEY_LEVELS,
  generateOperationKey,
  keyMisconceptionForKey,
  keyMisconceptionForTrial,
  keyOpens,
  keyRestores,
  keyUndoOrder,
  type KeyAsk,
  type KeyCandidate,
  type KeyLevel,
  type KeyLoop,
  type KeyOp,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  ChestScene,
  chestLayout,
  type ChestArrow,
  type ChestDiagram,
  type ChestLayout,
  type ChestLevel,
  type ChestProblem,
  type Slot,
} from "../scenes/ChestScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { play } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

export interface OperationKeyGameProps {
  readonly level: KeyLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function OperationKeyGame(props: OperationKeyGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

/**
 * Lo que dice la línea de abajo al empezar una ronda. Con lección, el cartel ya
 * dice qué hacer y la línea queda para lo que pasó; salvo en el nivel que
 * alterna preguntas, donde el cartel es el mismo para las dos y la línea dice
 * cuál toca esta ronda.
 */
function aperturaDe(ask: KeyAsk, conLeccion: boolean, alterna: boolean): string {
  return conLeccion && !alterna ? "" : t(`opkey.ask.${ask}`);
}

function Activity({ level, onLevelDone, onEvent }: OperationKeyGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: la latencia no corre hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  const conLeccion = lesson?.lesson !== undefined;
  const alterna = level.asks.length > 1;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** Los lazos ya deshechos. Una cadena se llena de la última acción a la primera. */
  const [undone, setUndone] = useState<readonly string[]>([]);
  /** Qué llave se probó sobre cada lazo, para dibujar la flecha de vuelta. */
  const [tried, setTried] = useState<Readonly<Record<string, ChestArrow["key"]>>>({});
  /** Lo que salió del cofre quedó flotando al lado de la silueta. */
  const [missed, setMissed] = useState(false);
  /** La silueta hueca de la llave que sí entra, revelada sin nombrarla. */
  const [reveal, setReveal] = useState<KeyOp | null>(null);
  const [slotOp, setSlotOp] = useState<KeyOp | null>(null);
  const [slotCount, setSlotCount] = useState<number | null>(null);
  /** La vuelta señalada entre las dos que corren, o -1. */
  const [picked, setPicked] = useState(-1);

  const problem = useMemo(
    () => generateOperationKey(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: aperturaDe(ask, conLeccion, alterna),
    tone: "dim",
  }));

  // El último nivel deja el lienzo más chico: ahí la definición necesita el alto
  // y el cofre es uno solo. El lienzo no se desmonta —una pantalla tiene uno y
  // montarlo entre rondas rompe el modo retained— pero cede lo que no usa. Con
  // lección, el cartel de la guía ocupa arriba lo que el lienzo cede.
  // En un teléfono, la definición del último nivel necesita un poco más: en
  // 390 × 844 terminaba debajo del borde y encima de Tomi.
  const estrecho = width < 600;
  const sceneH = level.definition
    ? Math.max(estrecho ? 280 : 300, Math.min(height * ((conLeccion ? 0.5 : 0.54) - (estrecho ? 0.06 : 0)), 440))
    : Math.max(340, Math.min(height * (conLeccion ? 0.56 : 0.68), 560));

  // --- Lo que ve la escena ---------------------------------------------------

  /** Cuál es el lazo que toca deshacer: el último que se aplicó y sigue puesto. */
  const target = useMemo<KeyLoop | undefined>(() => {
    const pendiente = keyUndoOrder(problem.loops).find((id) => !undone.includes(id));
    return problem.loops.find((l) => l.id === pendiente);
  }, [problem.loops, undone]);

  const diagram = useMemo<ChestDiagram>(() => {
    const base = {
      skin: level.skin,
      labeled: level.labeled,
      numerals: level.numerals,
      slots: ask === "assemble" ? { kind: slotOp, count: slotCount } : null,
    } as const;

    // `explain`: dos columnas idénticas salvo por la llave que cada una probó.
    // Si el cofre fuera distinto, la comparación diría otra cosa.
    const loop = problem.loops[0];
    if (ask === "judge" && loop) {
      return {
        ...base,
        panels: problem.trials.map((tr) => ({
          arrows: [
            {
              id: tr.id,
              lock: loop.action.op,
              count: loop.action.value,
              key: { kind: tr.key.op, count: tr.key.value },
              closed: tr.opens,
            },
          ],
          values: [loop.from, loop.to],
          fits: tr.restores,
          reveal: null,
        })),
      };
    }

    const arrows: ChestArrow[] = problem.loops.map((l) => ({
      id: l.id,
      lock: l.action.op,
      count: l.action.value,
      key: tried[l.id] ?? null,
      closed: undone.includes(l.id),
    }));
    const primero = problem.loops[0];
    return {
      ...base,
      panels: [
        {
          arrows,
          values: primero ? [primero.from, ...problem.loops.map((l) => l.to)] : [0, 0],
          fits: !missed,
          reveal,
        },
      ],
    };
  }, [ask, level, problem, tried, undone, missed, reveal, slotOp, slotCount]);

  /**
   * El llavero. En `assemble` cuelga operaciones sin número, que son las fichas
   * de una de las dos ranuras; en `judge` no cuelga nada, porque ahí no se
   * prueba: se mira.
   */
  const ring = useMemo(() => {
    if (ask === "assemble") return problem.ops.map((op) => ({ teeth: 0, kind: op }));
    if (ask === "judge" || ask === "arbitrary") return [];
    return problem.keys.map((k) => ({ teeth: k.value, kind: k.op, dots: !level.labeled }));
  }, [ask, problem.keys, problem.ops, level.labeled]);

  const chestProblem = useMemo<ChestProblem>(
    () => ({
      // Este nodo no tiene pista ni manivela: el cofre está suelto y el llavero
      // va abajo. La pista queda apagada, no desmontada.
      track: 2,
      home: 0,
      step: 0,
      landing: 0,
      keys: ring,
      returns: [],
      liar: problem.liar,
      marks: null,
      row: { minuend: 0, subtrahend: 0, result: 0, hidden: "result" },
      tiles:
        ask === "assemble"
          ? problem.tiles.map((v) => ({ value: v, dots: !level.labeled }))
          : [],
      lock: problem.lock
        ? { kind: problem.lock.kind, value: problem.lock.value }
        : { kind: "turn", value: 0 },
      actions: problem.actions.map((a) => ({ kind: a.kind, value: a.value })),
      diagram: ask === "arbitrary" ? null : diagram,
    }),
    [ring, problem, ask, level.labeled, diagram],
  );

  const chestLevel = useMemo<ChestLevel>(
    () => ({
      // Las cerraduras que no son aritméticas son las mismas del nodo 4: el modo
      // que ya las dibuja se reusa entero en vez de hacer una superficie nueva.
      mode: ask === "arbitrary" ? "unlock" : "key",
      layer: level.layer,
      labeled: level.labeled,
      skin: "hidden",
      ruler: false,
      keyboard: false,
      // El numeral sobre la llave llega con la ficha. Antes, el número de la
      // llave se cuenta en puntitos.
      numerals: level.labeled,
    }),
    [ask, level.layer, level.labeled],
  );

  const layout = useMemo(
    () => chestLayout(chestProblem, chestLevel, width, sceneH),
    [chestProblem, chestLevel, width, sceneH],
  );

  // --- Lo que la escena anima ------------------------------------------------

  const pos = useSharedValue(0);
  /** La vuelta cerrándose: de 0 a 1, o de 0 a 1 en tantos tramos como la cadena. */
  const open = useSharedValue(0);
  const outArrow = useSharedValue(0);
  const backArrow = useSharedValue(0);
  /** La flecha que arranca y no llega: la llave trabada. */
  const leftover = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const clock = useSharedValue(0);
  const ruler = useSharedValue(0);
  const line = useSharedValue(0);
  const appear = useSharedValue(0);

  // Siempre las mismas ranuras montadas: el árbol no puede cambiar entre rondas.
  const keys: Slot[] = [useKeySlot(), useKeySlot(), useKeySlot(), useKeySlot()];
  const tiles: Slot[] = [useSlot(), useSlot(), useSlot(), useSlot(), useSlot()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /** La ranura de la última llave probada, para devolverla al llavero. */
  const usada = useRef(-1);

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    usada.current = -1;
    setSolved(false);
    setUndone([]);
    setTried({});
    setMissed(false);
    setReveal(null);
    setSlotOp(null);
    setSlotCount(null);
    setPicked(-1);
    open.value = 0;
    // En `explain` las dos vueltas ya están jugadas y hay que verlas: la que
    // cierra el circuito y la que arranca y se traba se dibujan desde el primer
    // cuadro. En el resto de las preguntas nacen cuando el jugador prueba.
    backArrow.value = ask === "judge" ? 1 : 0;
    leftover.value = ask === "judge" ? 1 : 0;
    ruler.value = 0;
    line.value = 0;
    // La ida ya está hecha: el nodo no empieza en cero, empieza con el objeto ya
    // guardado en el cofre. La flecha de bajada está desde el primer cuadro.
    outArrow.value = 1;
    appear.value = withTiming(1, { duration: theme.motion.base });
    // El mensaje de apertura sale del problema que acaba de nacer y no del que
    // se estaba jugando: un nivel que alterna preguntas cambia de gesto entre
    // una ronda y la siguiente.
    setMessage({ text: aperturaDe(ask, conLeccion, alterna), tone: "dim" });
    for (let i = 0; i < KEY_RING_SLOTS; i++) {
      const s = keys[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      if (s.spin) s.spin.value = 0;
      s.alive.value = i < vivos(ask, problem.keys.length, problem.ops.length, problem.actions.length) ? 1 : 0;
    }
    for (let i = 0; i < KEY_TILE_SLOTS; i++) {
      const s = tiles[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = ask === "assemble" && i < problem.tiles.length ? 1 : 0;
    }
    // El latido no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    // Con guía, la luz de la guía es la demostración: dos manos a la vez
    // señalarían dos cosas distintas, y en las rondas siguientes la pista de
    // Tomi señala lo mismo cuando hace falta.
    if (guided) {
      demo.value = 0;
    } else {
      demo.value = withRepeat(
        withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
        -1,
        false,
      );
    }
    if (ask === "judge") {
      clock.value = 0;
      clock.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2400 }),
          // Un respiro al final y vuelta al principio de un salto: si el
          // rebobinado se viera, parecería que el objeto baja otra vez.
          withTiming(1, { duration: 900 }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false,
      );
    }
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
      cancelAnimation(clock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_OPERATION_KEY, layer: level.layer });
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

  // En el nivel que alterna preguntas, la pista de Tomi habla del gesto de esta
  // ronda: en la que se mira no hay nada que llevar, así que no señala nada.
  const prefRef = useRef(lesson?.preferHint);
  prefRef.current = lesson?.preferHint;
  useEffect(() => {
    if (!alterna) return;
    prefRef.current?.(ask === "judge" ? "" : null);
  }, [problem, ask, alterna]);

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * Llenar una sola ranura no es un movimiento: es media llave, y media llave no
   * es evidencia de nada.
   */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const now = Date.now();
      const latency = now - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at: now,
          node: NODE_OPERATION_KEY,
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
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_OPERATION_KEY, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
  }, [round, level, onEvent, onLevelDone]);

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
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(advance, 1700);
    },
    [advance, quiet, clock],
  );

  /** La llave vuelve al llavero: el jugador cierra el cofre y prueba desde ahí. */
  const devolver = useCallback(
    (index: number) => {
      const s = keys[index];
      if (!s) return;
      s.dx.value = withTiming(0, { duration: theme.motion.base });
      s.dy.value = withTiming(0, { duration: theme.motion.base });
      s.alive.value = withTiming(1, { duration: theme.motion.quick });
      if (s.spin) s.spin.value = withTiming(0, { duration: theme.motion.quick });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // --- Probar una llave ------------------------------------------------------

  /**
   * El veredicto lo da el modelo y no la escena, y son tres y no dos: la llave
   * entra o no entra, y si entra devuelve o no devuelve. Confundir las dos
   * formas de fallar es exactamente lo que el nodo desarma.
   */
  const tryKey = useCallback(
    (cand: KeyCandidate, index: number) => {
      if (!target || solved || missed) return;
      quiet();
      usada.current = index;
      setTried((prev) => ({ ...prev, [target.id]: { kind: cand.op, count: cand.value } }));

      if (!keyOpens(target.action, cand)) {
        // Gira un cuarto de vuelta y se traba. La cerradura queda a la vista y
        // aparece la silueta de la que sí entra, sin nombrarla.
        attempt(false, keyMisconceptionForKey(target, cand));
        jam.value = withSequence(
          withTiming(1, { duration: 90 }),
          withTiming(-1, { duration: 140 }),
          withTiming(0, { duration: 120 }),
        );
        const s = index >= 0 ? keys[index] : undefined;
        if (s?.spin) {
          s.spin.value = withSequence(
            withTiming(Math.PI / 2, { duration: 180 }),
            withTiming(0, { duration: 320 }),
          );
        }
        leftover.value = withTiming(1, { duration: theme.motion.quick });
        setReveal(KEY_INVERSE[target.action.op]);
        setMessage({
          text: t(cand.loop !== null ? "opkey.msg.lastFirst" : "opkey.msg.shape"),
          tone: "warn",
        });
        setTimeout(() => {
          leftover.value = withTiming(0, { duration: theme.motion.base });
          setTried((prev) => ({ ...prev, [target.id]: null }));
          if (index >= 0) devolver(index);
          if (ask === "assemble") {
            setSlotOp(null);
            setSlotCount(null);
          }
        }, 1500);
        return;
      }

      const total = Math.max(problem.loops.length, 1);
      const hechos = undone.length + 1;

      if (!keyRestores(target, cand)) {
        // Abre, y lo que sale no encaja. Es un movimiento válido: el catálogo no
        // lo nombra y el juego solo deja ver el desajuste.
        attempt(false);
        setMissed(true);
        backArrow.value = withTiming(1, { duration: theme.motion.quick });
        open.value = withTiming(hechos / total, { duration: theme.motion.morph });
        setMessage({
          text: t(ask === "assemble" ? "opkey.msg.noFitNumber" : "opkey.msg.noFit"),
          tone: "warn",
        });
        setTimeout(() => {
          setMissed(false);
          setTried((prev) => ({ ...prev, [target.id]: null }));
          backArrow.value = withTiming(0, { duration: theme.motion.base });
          open.value = withTiming((hechos - 1) / total, { duration: theme.motion.base });
          if (index >= 0) devolver(index);
          if (ask === "assemble") {
            setSlotOp(null);
            setSlotCount(null);
          }
        }, 1900);
        return;
      }

      attempt(true);
      setReveal(null);
      setUndone((prev) => [...prev, target.id]);
      backArrow.value = withTiming(1, { duration: theme.motion.quick });
      open.value = withTiming(hechos / total, { duration: theme.motion.morph });
      const s = index >= 0 ? keys[index] : undefined;
      if (s?.spin) s.spin.value = withTiming(2 * Math.PI, { duration: theme.motion.morph });
      if (hechos >= total) {
        say("restored");
        // Sin cofre no hay hueco donde encajar: en las flechas, lo que se ve es
        // la vuelta que llega al número de arriba.
        succeed(t(level.skin === "chest" ? "opkey.msg.restored" : "opkey.msg.circuit"));
        return;
      }
      say("first");
      setMessage({ text: t("opkey.msg.oneMore"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target, solved, missed, problem.loops.length, undone.length, ask, quiet, attempt, succeed, devolver, say],
  );

  /** Soltar una llave sobre la cerradura. El blanco es generoso a propósito. */
  const dropKey = useCallback(
    (index: number, x: number, y: number) => {
      const cand = problem.keys[index];
      const slot = keys[index];
      if (!cand || !slot || solved) return;
      const destino = dropSpot(layout, problem.loops, target);
      if (Math.hypot(x - destino.x, y - destino.y) > 96) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
        // En una cadena, soltar la llave junto a la otra flecha que sube es
        // querer deshacer primero la acción de arriba. No es puntería: es el
        // orden, y la línea lo dice así en vez de mandarla al costado derecho,
        // que es justo donde el jugador la soltó.
        const panel = layout.diagram?.panels[0];
        const aca = target ? problem.loops.findIndex((l) => l.id === target.id) : -1;
        const otra =
          ask === "chain" && panel
            ? panel.up.findIndex(
                (u, j) =>
                  j !== aca &&
                  !undone.includes(problem.loops[j]?.id ?? "") &&
                  Math.hypot(x - u.x, y - u.y) <= 96,
              )
            : -1;
        if (otra >= 0) {
          attempt(false);
          setMessage({ text: t("opkey.msg.bottomFirst"), tone: "warn" });
          return;
        }
        // Un rechazo nunca es mudo: la llave que vuelve dice adónde tenía que ir.
        setMessage({
          text: t(level.skin === "chest" ? "opkey.msg.dropOnLock" : "opkey.msg.dropOnArrow"),
          tone: "dim",
        });
        return;
      }
      const home = layout.keys[index] ?? { x: 0, y: 0 };
      slot.dx.value = withTiming(destino.x - home.x, { duration: theme.motion.quick });
      slot.dy.value = withTiming(destino.y - home.y, { duration: theme.motion.quick });
      tryKey(cand, index);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.keys, problem.loops, layout, solved, target, tryKey, level.skin, ask, undone, attempt],
  );

  /**
   * Tocar una llave la prueba igual que arrastrarla. El diseño pide el arrastre
   * en el primer nivel y el toque en el `recognize` del segundo, y la mecánica es
   * la misma: el gesto no cambia lo que se evalúa.
   */
  const tapKey = useCallback(
    (index: number) => {
      const cand = problem.keys[index];
      if (!cand || solved) return;
      tryKey(cand, index);
    },
    [problem.keys, solved, tryKey],
  );

  // --- Armar la llave --------------------------------------------------------

  /**
   * Las dos ranuras aceptan cualquier ficha, y cuando las dos están llenas la
   * llave gira sola. No hay botón de confirmar: la llave armada *es* el
   * movimiento.
   */
  const fillSlots = useCallback(
    (op: KeyOp | null, count: number | null) => {
      if (solved || missed) return;
      quiet();
      const o = op ?? slotOp;
      const c = count ?? slotCount;
      if (op !== null) setSlotOp(op);
      if (count !== null) setSlotCount(count);
      // La ficha entra en su ranura con un clic, sea cual sea: el veredicto
      // llega cuando la llave está entera.
      play("fit");
      // La guía espera la operación que entra, no cualquiera: con otra, la
      // llave se va a trabar y el paso de la operación tiene que seguir ahí.
      const loop = problem.loops[0];
      if (op !== null && loop && op === KEY_INVERSE[loop.action.op]) say("op");
      if (o === null || c === null) {
        setMessage({ text: t("opkey.msg.half"), tone: "dim" });
        return;
      }
      tryKey({ id: "armada", op: o, value: c, loop: null }, -1);
    },
    [solved, missed, slotOp, slotCount, quiet, tryKey, problem.loops, say],
  );

  const pickOp = useCallback(
    (index: number) => {
      const op = problem.ops[index];
      if (op) fillSlots(op, null);
    },
    [problem.ops, fillSlots],
  );

  const pickCount = useCallback(
    (index: number) => {
      const v = problem.tiles[index];
      if (v !== undefined) fillSlots(null, v);
    },
    [problem.tiles, fillSlots],
  );

  // --- Mirar dos vueltas -----------------------------------------------------

  const pickTrial = useCallback(
    (row: number) => {
      if (solved) return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      attempt(ok, keyMisconceptionForTrial(problem.liar, row));
      if (ok) {
        succeed(t("opkey.msg.liar"));
        return;
      }
      setMessage({ text: t("opkey.msg.notLiar"), tone: "warn" });
    },
    [solved, problem.liar, attempt, succeed, quiet],
  );

  // --- Las cerraduras que no son aritméticas ---------------------------------

  const pickAction = useCallback(
    (index: number) => {
      const a = problem.actions[index];
      if (!a || solved) return;
      quiet();
      // Una acción que no es aritmética no tiene reglas `detect` en el catálogo:
      // el movimiento va sin campo aunque sea la misma idea equivocada.
      attempt(a.correct);
      if (a.correct) {
        open.value = withTiming(1, { duration: theme.motion.base });
        succeed(t(a.uninvertible ? "opkey.msg.noKeyRight" : "opkey.msg.undone"));
        return;
      }
      const s = keys[index];
      if (s) {
        s.dx.value = withSequence(
          withTiming(-7, { duration: 70 }),
          withTiming(7, { duration: 110 }),
          withTiming(0, { duration: 90 }),
        );
      }
      setMessage({
        text: t(a.uninvertible ? "opkey.msg.hasKey" : "opkey.msg.otherAction"),
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.actions, solved, quiet, attempt, open, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Lo que el gesto necesita viaja en referencias estables: si el objeto del
   * `Gesture` cambiara de identidad entre renders, el detector tendría que
   * reengancharlo y el toque se perdería.
   */
  const acciones = useRef({ dropKey, tapKey, pickOp, pickCount, pickTrial, pickAction });
  acciones.current = { dropKey, tapKey, pickOp, pickCount, pickTrial, pickAction };
  const alSoltarLlave = useCallback((i: number, x: number, y: number) => {
    acciones.current.dropKey(i, x, y);
  }, []);
  const alTocarLlave = useCallback((i: number) => acciones.current.tapKey(i), []);
  const alTocarOperacion = useCallback((i: number) => acciones.current.pickOp(i), []);
  const alTocarNumero = useCallback((i: number) => acciones.current.pickCount(i), []);
  const alElegirVuelta = useCallback((r: number) => acciones.current.pickTrial(r), []);
  const alElegirAccion = useCallback((i: number) => acciones.current.pickAction(i), []);

  const esJudge = ask === "judge";
  const columnas = useMemo(
    () => (layout.diagram?.panels ?? []).map((p) => p.cx),
    [layout.diagram],
  );

  /**
   * La geometría que el gesto necesita viaja en un valor compartido y no en la
   * clausura del render: así el objeto del `Gesture` nunca cambia de identidad
   * y el detector no lo tiene que volver a enganchar.
   */
  const geo = useSharedValue<{ judge: boolean; cols: readonly number[] }>({
    judge: false,
    cols: [],
  });
  useEffect(() => {
    geo.value = { judge: esJudge, cols: columnas };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esJudge, columnas]);
  const desdeX = useSharedValue(0);
  const desdeY = useSharedValue(0);

  /**
   * El lienzo escucha un solo gesto y solo lo usa `explain`: tocar una de las
   * dos vueltas. Es un `Pan` sin `minDistance(0)` que se cierra en `onFinalize`
   * con un umbral de toque, que es el patrón del nodo 9: un `Tap` suelto sobre
   * el lienzo no se despierta, y un `Pan` que se activara con el apoyo le
   * robaría el arrastre a las asas de las llaves.
   */
  const canvasGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          desdeX.value = e.x;
          desdeY.value = e.y;
        })
        .onFinalize((e) => {
          const g = geo.value;
          if (!g.judge) return;
          if (Math.hypot(e.x - desdeX.value, e.y - desdeY.value) > 26) return;
          let row = 0;
          let best = Infinity;
          for (let i = 0; i < g.cols.length; i++) {
            const d = Math.abs(e.x - (g.cols[i] as number));
            if (d < best) {
              best = d;
              row = i;
            }
          }
          runOnJS(alElegirVuelta)(row);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alElegirVuelta],
  );

  const conLlavero = ask !== "judge";
  const llaves = vivos(ask, problem.keys.length, problem.ops.length, problem.actions.length);

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda: la llave
   * que conviene llevar y adónde, la ranura que falta, la ficha con el número,
   * el hueco donde el objeto vuelve a encajar. Sale de la misma geometría con
   * que la escena dibuja y se recalcula con cada movimiento, así que la luz
   * siempre apunta a un gesto que todavía falta.
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
    const llave = (i: number): Rect | null => {
      const p = layout.keys[i];
      return p ? around(p, layout.keyW + 14, layout.keyH + 14) : null;
    };
    const llavero = union(
      Array.from({ length: Math.min(llaves, KEY_RING_SLOTS) }, (_, i) => llave(i)).filter(
        (r): r is Rect => r !== null,
      ),
    );

    // Las cerraduras que no son aritméticas: el cartel del cofre y las acciones.
    if (ask === "arbitrary") {
      return solo([{ x: layout.lock.x - 60, y: layout.lock.y - 84, w: 120, h: 170 }, llavero]);
    }

    const d = layout.diagram;
    const panel = d?.panels[0];
    if (!d || !panel) return null;
    const cofre = level.skin === "chest";
    const columna = (i: number): Rect | null => {
      const p = d.panels[i];
      if (!p) return null;
      return union([
        ...p.nodes.map((n) => around(n, 64, 44)),
        ...p.down.map((n) => around({ x: n.x - 16, y: n.y }, 64, 40)),
        ...p.up.map((n) => around({ x: n.x + 16, y: n.y }, 64, 40)),
      ]);
    };
    const hueco = cofre ? around(panel.hole, 40, 36) : around(panel.nodes[0] ?? panel.hole, 70, 48);
    const tablero = cofre ? pad(panel.chest, 8) : columna(0);

    if (ask === "judge") {
      if (id === "reveal") return solo([columna(problem.liar)]);
      return solo(d.panels.map((_, i) => columna(i)));
    }
    if (id === "look") return solo(cofre ? [tablero, hueco] : [tablero]);
    if (id === "reveal") return solo([hueco]);
    if (id === "recall") return solo([tablero, llavero]);

    if (ask === "assemble") {
      const loop = problem.loops[0];
      if (!loop) return solo([tablero]);
      const buenaOp = KEY_INVERSE[loop.action.op];
      const ranura = (p: Pt): Rect => around(p, d.slotW + 14, d.slotH + 14);
      // Mientras la ranura de la operación no tenga la que entra, la luz está
      // ahí; recién después pasa al número. Así la guía y la pista siguen lo
      // que el jugador hizo y no el orden de los pasos.
      if (slotOp !== buenaOp) {
        const i = problem.ops.indexOf(buenaOp);
        const desde = layout.keys[i];
        return desde
          ? { rings: [llave(i) ?? ranura(d.opSlot), ranura(d.opSlot)], drag: { from: desde, to: d.opSlot } }
          : solo([llavero, ranura(d.opSlot)]);
      }
      const j = problem.tiles.indexOf(loop.action.value);
      const ficha = layout.tiles[j];
      return ficha
        ? {
            rings: [around(ficha, layout.tileW + 12, layout.tileH + 12), ranura(d.countSlot)],
            drag: { from: ficha, to: d.countSlot },
          }
        : solo([ranura(d.countSlot)]);
    }

    // Llevar la llave: la que deshace el lazo que toca, hasta donde entra.
    const i = problem.keys.findIndex((k) => target !== undefined && k.loop === target.id);
    const desde = layout.keys[i];
    const hasta = dropSpot(layout, problem.loops, target);
    if (!desde) return solo([llavero, around(hasta, 60, 60)]);
    return {
      rings: [llave(i) ?? around(desde, 60, 60), around(hasta, 60, 60)],
      drag: { from: desde, to: hasta },
    };
  }, [shown, layout, ask, level.skin, problem, target, slotOp, llaves]);

  return (
    <View style={styles.root}>

      <Header
        title={`${t(`node.${NODE_OPERATION_KEY}.name`)} · nivel ${level.n} de ${TOTAL_KEY_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!conLeccion}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <ChestScene
            problem={chestProblem}
            level={chestLevel}
            layout={layout}
            pos={pos}
            open={open}
            outArrow={outArrow}
            backArrow={backArrow}
            leftover={leftover}
            jam={jam}
            hint={hint}
            demo={demo}
            clock={clock}
            ruler={ruler}
            line={line}
            appear={appear}
            mounted={-1}
            at={0}
            picked={picked}
            composed={null}
            placed={null}
            keys={keys}
            tiles={tiles}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Las asas invisibles sobre las llaves dibujadas. Siempre montadas:
            en el nivel 4 la ronda de mirar no tiene llavero, y desmontarlas ahí
            dejaba al detector de la ronda siguiente sin enganchar; la llave no
            se podía llevar más y el nivel no se terminaba. Lo que decide si el
            dedo llega es `enabled`. */}
        {Array.from({ length: KEY_RING_SLOTS }, (_, i) => (
          <Handle
            key={`k${i}`}
            index={i}
            slot={keys[i] as Slot}
            spot={layout.keys[i] ?? { x: 0, y: 0 }}
            w={layout.keyW}
            h={layout.keyH}
            enabled={conLlavero && i < llaves && !solved}
            // La llave se lleva a la cerradura donde hay una cerradura que
            // abrir; la ficha de una ranura y la acción de una cerradura
            // cualquiera se tocan.
            drag={ask === "fit" || ask === "arrows" || ask === "chain"}
            onDrop={alSoltarLlave}
            onTap={
              ask === "assemble" ? alTocarOperacion
              : ask === "arbitrary" ? alElegirAccion
              : alTocarLlave
            }
          />
        ))}

        {/* Las fichas numéricas de la otra ranura, montadas por la misma razón. */}
        {Array.from({ length: KEY_TILE_SLOTS }, (_, i) => (
          <Handle
            key={`t${i}`}
            index={i}
            slot={tiles[i] as Slot}
            spot={layout.tiles[i] ?? { x: 0, y: 0 }}
            w={layout.tileW}
            h={layout.tileH}
            enabled={ask === "assemble" && i < problem.tiles.length && !solved}
            drag={false}
            onDrop={noop3}
            onTap={alTocarNumero}
          />
        ))}

        {/* La luz de la guía, encima de todo y sin llevarse ningún toque. */}
        <Spotlight focus={focus} />
      </View>

      <Hint text={message.text} tone={message.tone} />
      {level.definition ? (
        <Text style={[styles.definition, estrecho && styles.definitionNarrow]}>{t("key.definition")}</Text>
      ) : null}
    </View>
  );
}

const noop3 = (): void => {};

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

/** Cuántas piezas cuelga el llavero en cada pregunta. */
function vivos(ask: string, keys: number, ops: number, actions: number): number {
  if (ask === "assemble") return ops;
  if (ask === "arbitrary") return actions;
  if (ask === "judge") return 0;
  return keys;
}

/**
 * Dónde entra la llave. Con el cofre todavía dibujado es su cerradura; con el
 * diagrama, el medio de la flecha que sube del lazo que toca. La escena calcula
 * los dos casos en el mismo campo, así que acá no hay ninguna rama de piel.
 */
function dropSpot(
  layout: ChestLayout,
  loops: readonly KeyLoop[],
  target: KeyLoop | undefined,
): { x: number; y: number } {
  const panel = layout.diagram?.panels[0];
  if (!panel) return { x: 0, y: 0 };
  const j = target ? loops.findIndex((l) => l.id === target.id) : 0;
  return panel.up[Math.max(0, j)] ?? panel.hole;
}

/** Un asa invisible sobre la pieza dibujada: el dibujo es Skia, el gesto es la vista. */
function Handle({
  index,
  slot,
  spot,
  w,
  h,
  enabled,
  drag,
  onDrop,
  onTap,
}: {
  readonly index: number;
  readonly slot: Slot;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly drag: boolean;
  readonly onDrop: (index: number, absX: number, absY: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(enabled && drag)
      .onChange((e) => {
        slot.dx.value = e.translationX;
        slot.dy.value = e.translationY;
      })
      .onEnd((e) => {
        // Dónde quedó la pieza, en coordenadas del lienzo. Sale de dónde estaba
        // más cuánto se movió, y no de la posición absoluta del dedo: la caja
        // del lienzo no se puede medir con `onLayout`, que en web devuelve el
        // origen del padre y deja el hit test corrido por el encabezado.
        runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
      })
      // Si otro gesto le gana la carrera a mitad del arrastre, `onEnd` no llega
      // y la llave quedaba en el aire: sin veredicto, vuelve sola al llavero.
      .onFinalize((_e, success) => {
        if (success) return;
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      });
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)(index);
      });
    return Gesture.Race(pan, tap);
  }, [enabled, drag, index, slot, spot.x, spot.y, onDrop, onTap]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - w / 2,
          top: spot.y - h / 2,
          width: w,
          height: h,
          // Un asa deshabilitada se come los toques de lo que hay debajo, y
          // desmontarla dejaría al detector de la ronda siguiente sin enganchar.
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

/**
 * Las agujas de una pieza, en un objeto que no cambia de identidad. Si
 * cambiara, el gesto de su asa se volvería a crear en cada render y el detector
 * tendría que reengancharlo, que es como se pierde un arrastre a mitad de camino.
 */
function useSlot(): Slot {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const alive = useSharedValue(0);
  return useMemo(() => ({ dx, dy, alive }), [dx, dy, alive]);
}

/** Lo mismo, con el giro: una llave que entra en la cerradura se gira. */
function useKeySlot(): Slot {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const alive = useSharedValue(0);
  const spin = useSharedValue(0);
  return useMemo(() => ({ dx, dy, alive, spin }), [dx, dy, alive, spin]);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  definition: {
    color: theme.color.inkDim,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 520,
    paddingHorizontal: theme.space[3],
  },
  // En un teléfono, la definición deja libre el rincón de abajo a la izquierda, que es de Tomi.
  definitionNarrow: { fontSize: 12, paddingHorizontal: 64 },
});
