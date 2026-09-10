/**
 * La llave de vuelta: el minijuego de `arith.sub.undo_add`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: el llavero late, una mano fantasma lleva una llave hasta
 * la manivela y el cofre contesta. Los mensajes de abajo son para el adulto que
 * mira; el juego funciona igual con la pantalla tapada hasta la mitad.
 *
 * Seis gestos y ninguno fino:
 *
 * - Soltar una llave sobre la manivela. El sentido de giro se invierte y el tope
 *   queda fijado en los dientes que la llave tiene marcados: un solo gesto hace
 *   las dos cosas.
 * - Girar. El caminante retrocede el tramo de un tirón y la flecha de vuelta se
 *   dibuja debajo de la de ida. Si las dos miden lo mismo se apagan juntas y el
 *   cofre se abre solo, sin cartel. Si la llave es corta, el tramo de ida que
 *   quedó sin cancelar se ilumina y el jugador sigue desde ahí.
 * - Tocar la llave, antes de girar.
 * - Tocar el regreso que se pasa, entre dos animaciones.
 * - Estirar la regla plegable de un caminante al otro.
 * - Llevar la ficha al hueco del renglón, o armarla con el teclado de dígitos.
 *
 * Los dos errores que se registran son los únicos del catálogo de L cuya regla
 * `detect` apunta a este nodo: leer el numeral de la piedra de llegada como si
 * fuera el tramo, y volver desde la piedra equivocada hasta trabar la manivela
 * contra la orilla. El desvío de una unidad es puntería y no se cataloga.
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
} from "react-native-reanimated";
import {
  MIS_ORDER,
  NODE_UNDO_ADD,
  TOTAL_UNDO_LEVELS,
  generateUndo,
  opens,
  returnTo,
  type UndoLevel,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  ChestScene,
  KEY_SLOTS,
  TILE_SLOTS,
  TOOTH_ANGLE,
  chestLayout,
  type Slot,
} from "../scenes/ChestScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

export interface SubUndoAddGameProps {
  readonly level: UndoLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function SubUndoAddGame(props: SubUndoAddGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: SubUndoAddGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** La llave puesta en la manivela, o -1. */
  const [mounted, setMounted] = useState(-1);
  /** La piedra donde se detuvo el caminante: con eso se redibujan las flechas. */
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(-1);
  const [placed, setPlaced] = useState<number | null>(null);
  const [composed, setComposed] = useState<number | null>(null);
  /** La recta que el nivel simbólico pide con un toque. */
  const [lineOn, setLineOn] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(level),
    tone: "dim",
  }));

  const problem = useMemo(
    () => generateUndo(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = Math.max(340, Math.min(height * 0.68, 560));
  const layout = useMemo(
    () => chestLayout(problem, level, width, sceneH),
    [problem, level, width, sceneH],
  );

  const pos = useSharedValue(problem.landing);
  const open = useSharedValue(0);
  const outArrow = useSharedValue(0);
  const backArrow = useSharedValue(0);
  const leftover = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const clock = useSharedValue(0);
  const ruler = useSharedValue(0);
  const line = useSharedValue(0);
  const appear = useSharedValue(0);
  /** La piedra desde la que empezó este tirón de manivela. */
  const anchor = useSharedValue(0);
  const turned = useSharedValue(0);
  const lastAngle = useSharedValue(0);
  /** 1 si la manivela llegó a trabarse contra la orilla en este tirón. */
  const jammed = useSharedValue(0);

  // Siempre las mismas ranuras montadas: el árbol no puede cambiar entre rondas.
  const keys: Slot[] = [useSlot(), useSlot(), useSlot(), useSlot()];
  const tiles: Slot[] = [useSlot(), useSlot(), useSlot(), useSlot(), useSlot()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setSolved(false);
    setMounted(-1);
    setPicked(-1);
    setPlaced(null);
    setComposed(null);
    // Donde hay dos caminantes, el que se mueve es el de atrás: el otro está
    // dibujado en su piedra y la regla va de uno al otro.
    const inicio = level.ruler ? problem.home : problem.landing;
    setAt(inicio);
    pos.value = inicio;
    open.value = 0;
    ruler.value = 0;
    leftover.value = 0;
    backArrow.value = 0;
    // La ida ya está hecha y dibujada: el nodo no empieza en cero, empieza en
    // el viaje del nodo anterior. En `explain` no hay flecha porque lo que se
    // mira es el viaje entero, y en las cerraduras arbitrarias no hay tramo.
    outArrow.value =
      problem.step > 0 && (level.mode === "turn" || level.mode === "pick" || level.mode === "write")
        ? 1
        : 0;
    line.value = level.skin === "onDemand" ? 0 : 1;
    appear.value = withTiming(1, { duration: theme.motion.base });
    for (let i = 0; i < KEY_SLOTS; i++) {
      const s = keys[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value =
        level.mode === "unlock" ? (i < problem.actions.length ? 1 : 0)
        : level.mode === "turn" || level.mode === "pick" ? (i < problem.keys.length ? 1 : 0)
        : 0;
    }
    for (let i = 0; i < TILE_SLOTS; i++) {
      const s = tiles[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = usaFichas(level) && i < problem.tiles.length ? 1 : 0;
    }
    // El latido no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    if (level.mode === "judge") {
      clock.value = 0;
      clock.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2600 }),
          // Un respiro al final y vuelta al principio de un salto: si el
          // rebobinado se viera, parecería que el caminante desanda otra vez.
          withTiming(1, { duration: 800 }),
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
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_UNDO_ADD, layer: level.layer });
  }, [level.layer, onEvent]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const now = Date.now();
      const latency = now - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at: now,
          node: NODE_UNDO_ADD,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_UNDO_ADD, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setMessage({ text: openingHint(level), tone: "dim" });
  }, [round, level, onEvent, onLevelDone]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1600);
    },
    [nextRound, quiet, clock],
  );

  /** El cofre se abre solo y las dos flechas se apagan juntas. Sin cartel. */
  const abrir = useCallback(() => {
    leftover.value = withTiming(0, { duration: theme.motion.quick });
    outArrow.value = withTiming(0, { duration: theme.motion.morph });
    backArrow.value = withTiming(0, { duration: theme.motion.morph });
    open.value = withTiming(1, { duration: theme.motion.base });
    attempt(true);
    succeed("Las dos flechas midieron lo mismo. El cofre se abrió.");
  }, [leftover, outArrow, backArrow, open, attempt, succeed]);

  // --- Girar la manivela -----------------------------------------------------

  /**
   * El caminante se detuvo. El veredicto lo da el modelo, no la escena: el cofre
   * abre si, y solo si, la vuelta midió lo mismo que la ida.
   */
  const landed = useCallback(
    (stone: number, trabo: boolean) => {
      setAt(stone);
      quiet();
      if (solved) return;
      backArrow.value = withTiming(stone < problem.landing ? 1 : 0, { duration: theme.motion.quick });
      if (opens(problem.home, problem.landing, problem.landing - stone)) {
        abrir();
        return;
      }
      leftover.value = withTiming(stone > problem.home ? 1 : 0, { duration: theme.motion.base });
      // Trabarse contra la orilla pesa más que la llave puesta: es haber armado
      // la vuelta desde la piedra de partida y no desde la de llegada.
      const puesta = mounted >= 0 ? problem.keys[mounted] : undefined;
      if (trabo) {
        attempt(false, MIS_ORDER);
        setMessage({ text: "La pista se terminó. ¿Desde cuál de los dos hay que volver?", tone: "warn" });
      } else if (stone > problem.home) {
        attempt(false, puesta?.misconception);
        setMessage({ text: "La llave llegó hasta acá. ¿Cuánto falta para el cofre?", tone: "warn" });
      } else {
        attempt(false, puesta?.misconception);
        setMessage({ text: "Se pasó del cofre y quedó del otro lado.", tone: "warn" });
      }
    },
    [solved, mounted, problem.home, problem.landing, problem.keys, quiet, abrir, attempt, backArrow, leftover],
  );

  /** Soltar la llave sobre la manivela: el sentido se invierte y el tope se fija. */
  const dropKey = useCallback(
    (index: number, x: number, y: number) => {
      const key = problem.keys[index];
      const slot = keys[index];
      if (!key || !slot || solved) return;
      // La zona de drop es la manivela entera, y con tolerancia: el blanco tiene
      // que perdonar el pulso de un chico de cinco.
      const cerca = Math.hypot(x - layout.crank.x, y - layout.crank.y) < layout.crank.r * 1.8;
      if (!cerca) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
        return;
      }
      quiet();
      // La llave anterior vuelve al llavero: en la manivela entra una sola.
      for (let i = 0; i < KEY_SLOTS; i++) {
        const s = keys[i] as Slot;
        if (i === index) continue;
        s.dx.value = withTiming(0, { duration: theme.motion.quick });
        s.dy.value = withTiming(0, { duration: theme.motion.quick });
        s.alive.value = withTiming(i < problem.keys.length ? 1 : 0, { duration: theme.motion.quick });
      }
      const home = layout.keys[index] ?? { x: 0, y: 0 };
      slot.dx.value = withTiming(layout.crank.x - home.x, { duration: theme.motion.quick });
      slot.dy.value = withTiming(layout.crank.y - home.y, { duration: theme.motion.quick });
      setMounted(index);
      setMessage({ text: "La llave entró. Ahora girá.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.keys, layout, solved, quiet],
  );

  /**
   * Lo que el worklet necesita saber viaja en valores compartidos y no en la
   * clausura: si el gesto se volviera a crear en cada render, el detector
   * tendría que reengancharlo y el tirón se perdería a mitad de camino.
   */
  const dientes = useSharedValue(0);
  const montada = useSharedValue(-1);
  const tope = useSharedValue(problem.landing);
  useEffect(() => {
    const k = mounted >= 0 ? problem.keys[mounted] : undefined;
    dientes.value = k?.teeth ?? 0;
    montada.value = mounted;
    tope.value = problem.landing;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, problem]);

  // --- Elegir la llave sin probar --------------------------------------------

  /** El juego gira por el jugador y le muestra hasta dónde llega esa llave. */
  const pickKey = useCallback(
    (index: number) => {
      const k = problem.keys[index];
      if (!k || solved) return;
      quiet();
      setMounted(index);
      const stone = returnTo(problem.landing, k.teeth);
      pos.value = withTiming(stone, { duration: theme.motion.morph });
      setTimeout(() => setAt(stone), theme.motion.morph);
      backArrow.value = withTiming(1, { duration: theme.motion.morph });
      if (k.correct) {
        attempt(true);
        setTimeout(abrir, theme.motion.morph);
        return;
      }
      // La llave equivocada entra, gira un cuarto de vuelta y se traba.
      attempt(false, k.misconception);
      leftover.value = withTiming(stone > problem.home ? 1 : 0, { duration: theme.motion.morph });
      jam.value = withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 180 }));
      setMessage({
        text:
          stone > problem.home
            ? "La llave llegó hasta acá. ¿Cuánto falta para el cofre?"
            : "Esa llave se pasa del cofre.",
        tone: "warn",
      });
      // Se vuelve al principio para que el llavero se pueda probar de nuevo.
      setTimeout(() => {
        pos.value = withTiming(problem.landing, { duration: theme.motion.base });
        setAt(problem.landing);
        setMounted(-1);
        backArrow.value = withTiming(0, { duration: theme.motion.base });
        leftover.value = withTiming(0, { duration: theme.motion.base });
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem, solved, quiet, attempt, abrir],
  );

  // --- Mirar dos regresos ----------------------------------------------------

  const pickRow = useCallback(
    (row: number) => {
      if (solved) return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      attempt(ok);
      if (ok) {
        succeed("Ese volvió un paso de más y quedó del otro lado del cofre.");
      } else {
        setMessage({ text: "Ese pisó justo la piedra del cofre. Mirá el otro.", tone: "warn" });
      }
    },
    [solved, problem.liar, attempt, succeed, quiet],
  );

  // --- Las cerraduras que no son pasos ---------------------------------------

  const pickAction = useCallback(
    (index: number) => {
      const a = problem.actions[index];
      if (!a || solved) return;
      quiet();
      attempt(a.correct);
      if (a.correct) {
        open.value = withTiming(1, { duration: theme.motion.base });
        succeed("Esa es la que deshace: el cofre se abrió.");
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
        text: a.uninvertible
          ? "Esa acción no tiene vuelta: nada la deshace."
          : "Esa no devuelve el cofre a como estaba.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.actions, solved, quiet, attempt, open, succeed],
  );

  // --- La regla plegable y el renglón ----------------------------------------

  const row0 = layout.rows[0];
  const marks = problem.marks ?? [problem.home, problem.landing];
  const x0 = row0?.stones[marks[0] as number]?.x ?? 0;
  const x1 = row0?.stones[marks[1] as number]?.x ?? 0;
  const largoRegla = Math.max(1, x1 - x0);

  const measured = useCallback(
    (fraccion: number) => {
      if (fraccion < 0.92) {
        setMessage({ text: "Estirala hasta el otro caminante.", tone: "dim" });
        return;
      }
      quiet();
      ruler.value = withTiming(1, { duration: theme.motion.quick });
      setMessage({ text: "Ahora traé la ficha con los pasos que mide.", tone: "dim" });
    },
    [ruler, quiet],
  );

  /** La ficha entra en el hueco, o se resiste. El juego nunca dice "mal". */
  const dropTile = useCallback(
    (index: number, x: number, y: number) => {
      const tile = problem.tiles[index];
      const slot = tiles[index];
      if (!tile || !slot || solved) return;
      const destino =
        level.mode === "measure"
          ? { x: (x0 + x1) / 2, y: (row0?.y ?? 0) + 52 }
          : layout.slot;
      const cerca = Math.hypot(x - destino.x, y - destino.y) < 70;
      const volver = (): void => {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      };
      if (!cerca) {
        volver();
        return;
      }
      if (level.mode === "measure" && ruler.value < 0.92) {
        setMessage({ text: "Primero estirá la regla de un caminante al otro.", tone: "warn" });
        volver();
        return;
      }
      quiet();
      attempt(tile.correct, tile.misconception);
      if (!tile.correct) {
        // La ficha equivocada se desliza hasta el borde del hueco y vuelve.
        const home = layout.tiles[index] ?? { x: 0, y: 0 };
        slot.dx.value = withSequence(
          withTiming((destino.x - home.x) * 0.8, { duration: 110 }),
          withTiming(0, { duration: 320 }),
        );
        slot.dy.value = withSequence(
          withTiming((destino.y - home.y) * 0.8, { duration: 110 }),
          withTiming(0, { duration: 320 }),
        );
        setMessage({
          text:
            tile.misconception !== undefined
              ? "Ese numeral es una piedra, no el tramo. ¿Cuántos pasos hay?"
              : "Esa ficha no entra en el hueco.",
          tone: "warn",
        });
        return;
      }
      slot.alive.value = withTiming(0, { duration: 140 });
      setPlaced(tile.value);
      succeed(
        level.mode === "measure"
          ? "La regla se contrajo en la ficha: esa es la distancia."
          : "El renglón quedó completo.",
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.tiles, layout, solved, level.mode, x0, x1, row0, attempt, quiet, succeed],
  );

  /** El teclado del último nivel simbólico: la ficha ya no viene armada. */
  const typeDigit = useCallback(
    (digit: number) => {
      if (solved) return;
      quiet();
      setComposed((prev) => (prev === null || prev >= 10 ? digit : prev * 10 + digit));
    },
    [solved, quiet],
  );

  const dropComposed = useCallback(
    (x: number, y: number) => {
      if (composed === null || solved) return;
      if (Math.hypot(x - layout.slot.x, y - layout.slot.y) > 80) return;
      quiet();
      const esperado = problem.row.hidden === "minuend" ? problem.row.minuend : problem.row.result;
      const ok = composed === esperado;
      // Solo clasifica lo que el catálogo nombra: el resto es puntería.
      const fallo = problem.tiles.find((t) => t.value === composed && !t.correct);
      attempt(ok, ok ? undefined : fallo?.misconception);
      if (!ok) {
        setMessage({ text: "Ese numeral no cierra el renglón. Armá otro.", tone: "warn" });
        setComposed(null);
        return;
      }
      setPlaced(composed);
      setComposed(null);
      succeed("El renglón quedó completo.");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [composed, solved, layout.slot, problem.row, problem.tiles, attempt, quiet, succeed],
  );

  // --- Gestos del lienzo -----------------------------------------------------

  const rowsY = useMemo(() => layout.rows.map((r) => r.y), [layout]);
  const pads = useMemo(() => layout.pads.map((s) => ({ x: s.x, y: s.y })), [layout]);
  const padR = layout.padR;
  const conRegla = level.ruler && level.mode === "measure";
  const modo = level.mode;
  const oy = row0?.y ?? 0;
  const conTeclado = level.keyboard;
  const pedirRecta = level.skin === "onDemand";
  const esJudge = level.mode === "judge";

  /**
   * La recta se pide con un toque. Cuando los numerales se pasan de la pista
   * dibujada no hay recta que traer, y eso no es una falla: es lo que este
   * nivel endurece, y por eso lo dice en vez de no hacer nada.
   */
  const toggleLine = useCallback(() => {
    if (problem.landing >= problem.track) {
      setMessage({ text: "La recta no llega hasta ese número.", tone: "dim" });
      return;
    }
    setLineOn((on) => {
      line.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [problem.landing, problem.track, line]);

  /**
   * Un solo gesto para todo el lienzo, con lo que necesita en valores
   * compartidos y en referencias estables: así el objeto del gesto no cambia
   * entre renders y el detector no lo tiene que volver a enganchar.
   *
   * Qué agarró el dedo lo decide `sujeto`, como en el camino de piedras del nodo
   * 2: la manivela solo responde con una llave puesta, y la regla solo nace en
   * la piedra del caminante de atrás.
   */
  const sujeto = useSharedValue(NADA);
  const acciones = useRef({
    landed,
    measured,
    pickRow,
    typeDigit,
    toggleLine,
    dropKey,
    dropTile,
    dropComposed,
    pickKey,
    pickAction,
  });
  acciones.current = {
    landed,
    measured,
    pickRow,
    typeDigit,
    toggleLine,
    dropKey,
    dropTile,
    dropComposed,
    pickKey,
    pickAction,
  };
  const alSoltar = useCallback((stone: number, trabo: boolean) => {
    acciones.current.landed(stone, trabo);
  }, []);
  const alMedir = useCallback((f: number) => acciones.current.measured(f), []);
  const alElegirFila = useCallback((r: number) => acciones.current.pickRow(r), []);
  const alTeclear = useCallback((d: number) => acciones.current.typeDigit(d), []);
  const alPedirRecta = useCallback(() => acciones.current.toggleLine(), []);
  const alSoltarLlave = useCallback((i: number, x: number, y: number) => {
    acciones.current.dropKey(i, x, y);
  }, []);
  const alSoltarFicha = useCallback((i: number, x: number, y: number) => {
    acciones.current.dropTile(i, x, y);
  }, []);
  const alSoltarCompuesta = useCallback((x: number, y: number) => {
    acciones.current.dropComposed(x, y);
  }, []);
  const alElegirLlave = useCallback((i: number) => acciones.current.pickKey(i), []);
  const alElegirAccion = useCallback((i: number) => acciones.current.pickAction(i), []);

  const cx = layout.crank.x;
  const cy = layout.crank.y;

  const canvasPan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          if (conRegla && Math.abs(e.x - x0) < 70 && Math.abs(e.y - oy) < 90) {
            sujeto.value = REGLA;
            ruler.value = 0.02;
            return;
          }
          if (modo === "turn" && montada.value >= 0) {
            sujeto.value = MANIVELA;
            anchor.value = Math.round(pos.value);
            turned.value = 0;
            jammed.value = 0;
            lastAngle.value = Math.atan2(e.y - cy, e.x - cx);
            return;
          }
          sujeto.value = NADA;
        })
        .onChange((e) => {
          if (sujeto.value === REGLA) {
            ruler.value = Math.max(0.02, Math.min(1.15, (e.x - x0) / largoRegla));
            return;
          }
          if (sujeto.value !== MANIVELA) return;
          const a = Math.atan2(e.y - cy, e.x - cx);
          let d = a - lastAngle.value;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          turned.value += d;
          lastAngle.value = a;
          // Redondear acá es lo que hace imposible el medio diente. Con la llave
          // puesta el sentido está invertido, así que girar hacia adelante
          // devuelve al caminante hacia atrás; el tope son los dientes marcados.
          let pasos = Math.round(turned.value / TOOTH_ANGLE);
          if (pasos > dientes.value) pasos = dientes.value;
          if (pasos < -dientes.value) pasos = -dientes.value;
          const crudo = anchor.value - pasos;
          if (crudo < 0) jammed.value = 1;
          // Rehacer la ida siempre se puede, pero la pista no da más que su ida.
          const stone = Math.max(0, Math.min(tope.value, crudo));
          if (stone === Math.round(pos.value)) return;
          if (crudo < 0) {
            jam.value = withSequence(
              withTiming(1, { duration: 70 }),
              withTiming(-1, { duration: 110 }),
              withTiming(0, { duration: 90 }),
            );
          }
          pos.value = withTiming(stone, { duration: 200 });
        })
        .onEnd(() => {
          if (sujeto.value === REGLA) {
            const f = ruler.value;
            runOnJS(alMedir)(f);
            if (f < 0.92) ruler.value = withTiming(0, { duration: theme.motion.base });
          } else if (sujeto.value === MANIVELA) {
            const stone = Math.max(0, Math.min(tope.value, Math.round(pos.value)));
            pos.value = withTiming(stone, { duration: 160 });
            runOnJS(alSoltar)(stone, jammed.value === 1);
          }
          sujeto.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conRegla, modo, x0, oy, largoRegla, cx, cy, alMedir, alSoltar],
  );

  const canvasTap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(26)
        .onEnd((e) => {
          if (esJudge) {
            let row = 0;
            let best = Infinity;
            for (let i = 0; i < rowsY.length; i++) {
              const d = Math.abs(e.y - (rowsY[i] as number));
              if (d < best) {
                best = d;
                row = i;
              }
            }
            runOnJS(alElegirFila)(row);
            return;
          }
          if (conTeclado) {
            for (let i = 0; i < pads.length; i++) {
              const p = pads[i] as { x: number; y: number };
              if (Math.hypot(e.x - p.x, e.y - p.y) < padR * 1.7) {
                runOnJS(alTeclear)(i);
                return;
              }
            }
          }
          // La recta se pide con un toque en el lienzo.
          if (pedirRecta) runOnJS(alPedirRecta)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [esJudge, conTeclado, pedirRecta, pads, padR, rowsY, alElegirFila, alTeclear, alPedirRecta],
  );

  const canvasGesture = useMemo(() => Gesture.Race(canvasPan, canvasTap), [canvasPan, canvasTap]);

  const conLlaves = level.mode === "turn" || level.mode === "pick" || level.mode === "unlock";

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_UNDO_ADD}.name`)} · nivel ${level.n} de ${TOTAL_UNDO_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <ChestScene
            problem={problem}
            level={level}
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
            mounted={mounted}
            at={at}
            picked={picked}
            composed={composed}
            placed={placed}
            keys={keys}
            tiles={tiles}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Las asas invisibles sobre las llaves y las fichas dibujadas. */}
        {conLlaves
          ? Array.from({ length: KEY_SLOTS }, (_, i) => {
              const viva =
                level.mode === "unlock" ? i < problem.actions.length : i < problem.keys.length;
              return (
                <Handle
                  key={`k${i}`}
                  index={i}
                  slot={keys[i] as Slot}
                  spot={layout.keys[i] ?? { x: 0, y: 0 }}
                  w={layout.keyW}
                  h={layout.keyH}
                  enabled={viva && !solved}
                  drag={level.mode === "turn"}
                  onDrop={alSoltarLlave}
                  onTap={
                    level.mode === "unlock" ? alElegirAccion
                    : level.mode === "pick" ? alElegirLlave
                    : // Con la manivela puesta la llave se lleva, no se toca: un
                      // toque suelto no puede decidir por el jugador.
                      noop
                  }
                />
              );
            })
          : null}

        {usaFichas(level)
          ? Array.from({ length: TILE_SLOTS }, (_, i) => (
              <Handle
                key={`t${i}`}
                index={i}
                slot={tiles[i] as Slot}
                spot={layout.tiles[i] ?? { x: 0, y: 0 }}
                w={layout.tileW}
                h={layout.tileH}
                enabled={i < problem.tiles.length && !solved}
                drag
                onDrop={alSoltarFicha}
                onTap={noop}
              />
            ))
          : null}

        {/* La ficha que el jugador arma con el teclado, para llevarla al hueco. */}
        {conTeclado && composed !== null ? (
          <ComposedHandle
            spot={layout.composed}
            enabled={!solved}
            onDrop={alSoltarCompuesta}
          />
        ) : null}
      </View>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

const noop = (): void => {};

/** Qué agarró el dedo. Vive en un `SharedValue` porque lo decide el hilo de UI. */
const NADA = 0;
const MANIVELA = 1;
const REGLA = 2;

/** El cajón solo aparece donde el nivel escribe o mide. */
const usaFichas = (level: UndoLevel): boolean =>
  (level.mode === "measure" || level.mode === "write") && !level.keyboard;

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
        // origen del padre y deja el hit test corrido por la altura del encabezado.
        runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
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
        }}
      />
    </GestureDetector>
  );
}

/** La ficha compuesta con el teclado: nace de los dígitos y viaja al hueco. */
function ComposedHandle({
  spot,
  enabled,
  onDrop,
}: {
  readonly spot: { x: number; y: number };
  readonly enabled: boolean;
  readonly onDrop: (absX: number, absY: number) => void;
}) {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onEnd((e) => {
          runOnJS(onDrop)(spot.x + e.translationX, spot.y + e.translationY);
        }),
    [enabled, spot.x, spot.y, onDrop],
  );
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{ position: "absolute", left: spot.x - 34, top: spot.y - 26, width: 68, height: 52 }}
      />
    </GestureDetector>
  );
}

/**
 * Las tres agujas de una pieza, en un objeto que no cambia de identidad. Si
 * cambiara, el gesto de su asa se volvería a crear en cada render y el detector
 * tendría que reengancharlo, que es como se pierde un arrastre a mitad de camino.
 */
function useSlot(): Slot {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const alive = useSharedValue(0);
  return useMemo(() => ({ dx, dy, alive }), [dx, dy, alive]);
}

function openingHint(level: UndoLevel): string {
  switch (level.mode) {
    case "turn":
      return "Soltá una llave sobre la manivela y girá.";
    case "pick":
      return "Tocá la llave que devuelve al caminante al cofre.";
    case "judge":
      return "Uno de los dos vuelve un paso de más. Tocalo.";
    case "measure":
      return "Estirá la regla de un caminante al otro.";
    case "unlock":
      return "Tocá la llave que deshace lo que le pasó al cofre.";
    default:
      return "Completá el renglón. Tocá arriba para ver la recta.";
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
});
