/**
 * Cofres anidados: el minijuego de `alg.eq.multi_step`.
 *
 * El jugador viene del nodo 13 sabiendo elegir una llave. Acá elige un **orden**,
 * y por eso el objeto central no es la cerradura sino el encastre: un cofre
 * adentro de otro, y solo el de afuera tiene la tapa al alcance.
 *
 * Las tres vistas del mismo objeto, sincronizadas por los ids del árbol:
 *
 * - el **encastre** (`ChestScene` en modo `wrap`, la escena del nodo 9) dice
 *   cuál se abre primero;
 * - la **balanza** (`BalanceScene`, del nodo 11) es el **testigo**: dice que cada
 *   llave se aplicó a los dos platos, y por eso queda nivelada. No es el
 *   objetivo, y eso lo fija D1 §12 contra la lectura de que haya que pasar la
 *   llave por los dos platos otra vez: esa es la mecánica del nodo 13, ya
 *   aprendida;
 * - la **tubería** (`PipeScene`, del nodo 9) es el sentido de ida, y se pide con
 *   un toque. La palanca la corre al revés y marca cuál llave toca ahora.
 *
 * El renglón se compone con `@mathy/typeset` y se anima con `@mathy/viz-skia`.
 * Como la identidad de cada término es exacta por construcción, el `5` que el
 * jugador vio en la cerradura es el mismo objeto que viaja por toda la
 * resolución, y el paréntesis nace solo: `layoutNode` lo dibuja en cuanto una
 * suma queda adentro de un producto, que es exactamente cuando el diseño lo pide.
 *
 * El avance no depende de que corra la animación: cada movimiento se confirma
 * con un temporizador de JavaScript y no con el callback de `withTiming`. Con el
 * panel del navegador oculto, `requestAnimationFrame` se estrangula y una
 * partida atada al callback se congelaría sin que nada lo diga.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { Equation, Trace } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { centered, layoutEquation, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, smooth } from "@mathy/viz-core";
import { MorphView } from "@mathy/viz-skia";
import {
  MULTI_KEY_SLOTS,
  MULTI_TILE_SLOTS,
  MULTI_UNKNOWN,
  NODE_MULTI_STEP,
  TOTAL_MULTI_LEVELS,
  generateMultiStep,
  multiDistribute,
  multiJudge,
  multiOuterLayer,
  multiPending,
  multiSolved,
  type MultiKey,
  type MultiLevel,
  type MultiOp,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  ChestScene,
  chestLayout,
  type ChestKeyKind,
  type ChestLevel,
  type ChestProblem,
  type ChestRing,
  type Slot,
  type Spot,
} from "../scenes/ChestScene.tsx";
import { BalanceScene, type BalanceContents } from "../scenes/BalanceScene.tsx";
import {
  PIPE_MACHINE_SLOTS,
  PIPE_TRAY_SLOTS,
  PipeScene,
  pipeLayout,
  type PipeConfig,
  type PipeItem,
  type PipeMachineKind,
  type PipeSlot,
} from "../scenes/PipeScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** El renglón vivo, el que se transforma. Los ya hechos van más chicos. */
const FONT_SIZE = 38;
const HISTORY_SIZE = 22;
/** Cuánto baja cada renglón nuevo respecto del anterior. */
const ROW_GAP = 28;
/** Radio del blanco donde entra la llave. Generoso a propósito. */
const DROP_R = 110;

const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

const EMPTY_TRACE: Trace = {
  kept: [],
  created: [],
  removed: [],
  merged: [],
  annihilated: [],
};

/** La forma de una cerradura aritmética, en el vocabulario de las dos escenas. */
const LOCK_KIND: Readonly<Record<MultiOp, ChestKeyKind>> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
};
const MACHINE_KIND: Readonly<Record<MultiOp, PipeMachineKind>> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
};
const OP_CHAR: Readonly<Record<MultiOp, string>> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

export interface MultiStepGameProps {
  readonly level: MultiLevel;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function MultiStepGame(props: MultiStepGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: MultiStepGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateMultiStep(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );

  /** La ecuación de ahora, con los mismos ids desde el primer renglón. */
  const [eq, setEq] = useState<Equation>(problem.equation);
  /** Los renglones ya hechos: la historia del despeje, que no se borra. */
  const [history, setHistory] = useState<readonly Equation[]>([]);
  const [opened, setOpened] = useState<readonly string[]>([]);
  /** El movimiento en curso, que todavía no se confirmó. */
  const [pending, setPending] = useState<{ next: Equation; trace: Trace } | null>(null);
  const [solved, setSolved] = useState(false);
  const [slotOp, setSlotOp] = useState<MultiOp | null>(null);
  const [chestsOn, setChestsOn] = useState(level.chests === "drawn");
  const [balanceOn, setBalanceOn] = useState(level.balance === "shown");
  const [pipeOn, setPipeOn] = useState(false);
  /** La palanca de la tubería: corriéndola al revés se lee el despeje. */
  const [pipeBack, setPipeBack] = useState(true);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: t("multi.hint.outerFirst"),
    tone: "dim",
  }));

  const chestsVisible = level.chests !== "hidden" && chestsOn;

  // --- Medidas ---------------------------------------------------------------

  const sceneH = Math.max(380, Math.min(height * 0.64, 560));
  // La balanza se queda con una columna angosta a la derecha y el encastre con
  // el resto: los dos viven en el mismo lienzo, porque una pantalla tiene uno.
  // La columna la decide el **nivel** y no el interruptor: si el ancho cambiara
  // al pedir la balanza, el llavero y el renglón se moverían debajo del dedo en
  // mitad de una ronda. Guardarla la apaga, no le devuelve el espacio.
  const chestW = level.balance === "hidden" ? width : Math.round(width * 0.66);
  // Los platos sobresalen del ancho que la balanza recibe —el brazo mide 0.3 y
  // el plato 0.225 de ese ancho—, así que la columna se le da con un margen y
  // la escena se centra adentro. Sin eso el plato de la derecha se corta.
  const balanceBand = width - chestW;
  const balanceW = Math.max(balanceBand * 0.88, 1);
  const balanceX = chestW + balanceBand * 0.06;

  const capa = multiOuterLayer(problem.layers, opened);
  const pendientes = multiPending(problem.layers, opened);

  // --- Lo que ve el encastre -------------------------------------------------

  const rings = useMemo<readonly ChestRing[]>(
    () =>
      problem.layers.map((l) => ({
        id: l.id,
        lock: LOCK_KIND[l.op],
        depth: l.depth,
        step: l.depth,
        placed: true,
        drawn: chestsVisible,
      })),
    [problem.layers, chestsVisible],
  );

  const chestLevel = useMemo<ChestLevel>(
    () => ({
      mode: "wrap",
      layer: level.layer,
      labeled: level.labeledKeys,
      skin: "hidden",
      ruler: false,
      keyboard: false,
      // Armando la llave, las piezas del llavero son operaciones sin número: un
      // numeral debajo diría `0` y ese cero no existe en ningún lado.
      numerals: problem.ask === "assemble" ? false : level.labeledKeys,
      tree: level.ladder,
    }),
    [level.layer, level.labeledKeys, level.ladder, problem.ask],
  );

  /**
   * Los renglones ya hechos, compuestos y ubicados. La escena los dibuja tal
   * como llegan: componer es del nodo, porque el hit test y el dibujo tienen que
   * medir lo mismo.
   */
  const rowX = chestW / 2;
  // Lo mismo con el renglón: su lugar lo fija el nivel, así que pedir los cofres
  // fantasma no lo hace saltar.
  const rowY = level.chests === "hidden" ? sceneH * 0.44 : sceneH * 0.72;

  const historyGlyphs = useMemo(() => {
    if (!level.row) return [];
    const out: { char: string; x: number; y: number; size: number }[] = [];
    history.forEach((h, i) => {
      const box = centered(layoutEquation(h, metrics));
      const y = rowY - (history.length - i) * ROW_GAP;
      for (const g of box.glyphs) {
        out.push({ char: g.char, x: rowX + g.x * HISTORY_SIZE, y: y + g.y * HISTORY_SIZE, size: HISTORY_SIZE });
      }
    });
    return out;
  }, [history, level.row, rowX, rowY]);

  const chestProblem = useMemo<ChestProblem>(
    () => ({
      // Este nodo no tiene pista ni manivela: el encastre está suelto y el
      // llavero va abajo. La pista queda apagada, no desmontada.
      track: 2,
      home: 0,
      step: 0,
      landing: 0,
      keys:
        problem.ask === "assemble"
          ? problem.ops.map((o) => ({ teeth: 0, kind: LOCK_KIND[o] }))
          : problem.keys.map((k) => ({
              teeth: k.value,
              kind: LOCK_KIND[k.op],
              dots: !level.labeledKeys,
            })),
      returns: [],
      liar: 0,
      marks: null,
      row: { minuend: 0, subtrahend: 0, result: 0, hidden: "result" },
      tiles: problem.tiles.map((v) => ({ value: v })),
      lock: { kind: "turn", value: 0 },
      actions: [],
      rings,
      glyphs: historyGlyphs,
      diagram: null,
    }),
    [problem, rings, historyGlyphs, level.labeledKeys],
  );

  const layout = useMemo(
    () => chestLayout(chestProblem, chestLevel, chestW, sceneH),
    [chestProblem, chestLevel, chestW, sceneH],
  );

  // --- Lo que la balanza testigo muestra -------------------------------------

  /**
   * Los dos platos del estado de ahora. La balanza no se transforma paso a paso:
   * se vuelve a dibujar nivelada después de cada llave, que es lo que quiere
   * decir "testigo". Por eso el antes y el después son el mismo.
   */
  const reparto = useMemo(() => {
    const restantes = [...pendientes].reverse().map((l) => ({ op: l.op, value: l.value }));
    return multiDistribute(restantes);
  }, [pendientes]);

  const contents = useMemo<BalanceContents>(() => {
    const derecha = eq.rhs.kind === "num" ? eq.rhs.value : 0;
    const izq = { boxes: reparto.boxes, units: reparto.units };
    const der = { boxes: 0, units: derecha };
    return {
      leftBefore: izq,
      rightBefore: der,
      leftAfter: izq,
      rightAfter: der,
      deltaSign: 0,
    };
  }, [reparto, eq]);

  // --- Lo que la tubería muestra ---------------------------------------------

  const pipeConfig = useMemo<PipeConfig>(() => {
    const techo = Math.max(1, ...problem.stages.map((s) => Math.abs(s.out)));
    const item = (value: number): PipeItem => ({
      value,
      size: Math.max(0.25, Math.min(1, Math.abs(value) / techo)),
      kind: "ball",
      label: "",
    });
    const salidas = problem.stages.map((s) => item(s.out));
    const ultima = salidas[salidas.length - 1] ?? item(0);
    return {
      lanes: [
        {
          id: "ida",
          machines: problem.stages.map((s) => ({
            id: s.id,
            kind: MACHINE_KIND[s.op],
            value: s.value,
            label: "",
            // Corriéndola al revés, la máquina marcada es la que toca ahora: es
            // la misma pregunta del encastre dicha en el otro objeto.
            inverted: pipeBack && capa !== undefined && s.id === capa.id,
            opaque: false,
          })),
          input: item(problem.solution ?? 1),
          stages: salidas,
          output: ultima,
          target: null,
          glow: false,
        },
      ],
      skin: "pipes",
      direction: pipeBack ? "backward" : "forward",
      numerals: true,
      // Al revés no hay salida que anunciar: lo que sale es justamente lo que
      // todavía no se sabe, y el contador lo estaría regalando.
      counter: !pipeBack,
      table: [],
      tray: [],
      slots: 0,
      reorderable: false,
      box: !pipeBack,
      onDemand: true,
    };
  }, [problem.stages, problem.solution, pipeBack, capa]);

  const pl = useMemo(() => pipeLayout(pipeConfig, width, sceneH), [pipeConfig, width, sceneH]);

  // --- Lo que se anima -------------------------------------------------------

  const progress = useSharedValue(0);
  const openedSV = useSharedValue(0);
  const vain = useSharedValue(0);
  const tree = useSharedValue(0);
  const ghost = useSharedValue(0);
  const marked = useSharedValue(-1);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  /**
   * Un cero compartido. Las escenas reusadas piden agujas que este nodo no
   * mueve —la pista del 4, el reloj de `explain`, la regla— y una sola apagada
   * las cubre a todas sin montar diez valores muertos. Nunca cambia de valor:
   * si cambiara, la balanza empezaría a transformarse sola.
   */
  const quieto = useSharedValue(0);
  const balanceAppear = useSharedValue(0);
  const balanceTilt = useSharedValue(0);
  const openness = useSharedValue(0);
  const chestAppear = useSharedValue(1);
  const flow = useSharedValue(0);
  const unfold = useSharedValue(0);
  const pipeAppear = useSharedValue(0);

  // Siempre las mismas ranuras montadas: el árbol no puede cambiar entre rondas.
  const keys: Slot[] = [useKeySlot(), useKeySlot(), useKeySlot(), useKeySlot()];
  const tiles: Slot[] = [useSlot(), useSlot(), useSlot(), useSlot(), useSlot()];
  const pipePieces: PipeSlot[] = [usePipeSlot(), usePipeSlot(), usePipeSlot()];
  const pipeTray: PipeSlot[] = [usePipeSlot(), usePipeSlot(), usePipeSlot(), usePipeSlot()];

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
    setEq(problem.equation);
    setHistory([]);
    setOpened([]);
    setPending(null);
    setSolved(false);
    setSlotOp(null);
    setChestsOn(level.chests === "drawn");
    setBalanceOn(level.balance === "shown");
    setPipeOn(false);
    setPipeBack(true);
    setMessage({ text: openingHint(problem.ask), tone: "dim" });
    progress.value = 0;
    openedSV.value = 0;
    tree.value = 0;
    openness.value = 0;
    balanceTilt.value = 0;
    balanceAppear.value = withTiming(level.balance === "shown" ? 1 : 0, {
      duration: theme.motion.base,
    });
    chestAppear.value = withTiming(1, { duration: theme.motion.base });
    pipeAppear.value = 0;
    unfold.value = 0;
    flow.value = 0;
    for (let i = 0; i < MULTI_KEY_SLOTS; i++) {
      const s = keys[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      if (s.spin) s.spin.value = 0;
      s.alive.value = i < vivos(problem) ? 1 : 0;
    }
    for (let i = 0; i < MULTI_TILE_SLOTS; i++) {
      const s = tiles[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = i < problem.tiles.length ? 1 : 0;
    }
    // El latido de la demostración: la mano fantasma lleva la llave a la
    // cerradura del cofre de afuera, que es la única instrucción que hace falta.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
      for (const id of timers.current) clearTimeout(id);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_MULTI_STEP, layer: level.layer });
  }, [level.layer, onEvent]);

  // --- El renglón ------------------------------------------------------------

  /**
   * El plan del morph. Sin movimiento en curso es el renglón quieto: el mismo
   * estado antes y después, así que ningún glifo se mueve y el árbol de la
   * escena no cambia.
   */
  const plan = useMemo(() => {
    const before = centered(layoutEquation(eq, metrics));
    if (!pending) return planMorph(before, before, EMPTY_TRACE);
    return planMorph(before, centered(layoutEquation(pending.next, metrics)), pending.trace);
  }, [eq, pending]);

  // --- Movimientos -----------------------------------------------------------

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * El campo `misconception` solo viaja cuando el catálogo de L tiene una
   * entrada que apunta a este nodo: el modelo ya lo resolvió y acá no se
   * inventa ninguno.
   */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_MULTI_STEP,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_MULTI_STEP, level: level.n });
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
      luego(nextRound, 1700);
    },
    [nextRound, quiet, luego],
  );

  /** La llave vuelve al llavero: el jugador cierra el cofre y prueba desde ahí. */
  const devolver = useCallback(
    (index: number) => {
      const s = keys[index];
      if (!s) return;
      s.dx.value = withTiming(0, { duration: theme.motion.base });
      s.dy.value = withTiming(0, { duration: theme.motion.base });
      if (s.spin) s.spin.value = withTiming(0, { duration: theme.motion.quick });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Probar una llave. El veredicto lo da el modelo: acá solo se dibuja, y las
   * cuatro respuestas se ven distinto porque son distintas.
   */
  const tryKey = useCallback(
    (key: MultiKey, index: number) => {
      if (solved || pending || !capa) return;
      quiet();
      const m = multiJudge(eq, key, problem, opened);
      attempt(m.verdict === "opens", m.misconception);

      if (m.verdict === "opens") {
        const siguiente = [...opened, m.layer as string];
        setPending({ next: m.next, trace: m.trace });
        progress.value = withTiming(1, { duration: theme.motion.morph });
        openedSV.value = withTiming(siguiente.length, { duration: theme.motion.morph });
        tree.value = withTiming(siguiente.length, { duration: theme.motion.morph });
        // La llave gira entera y se queda en la cerradura: una llave gastada no
        // vuelve al llavero, porque su cofre ya no está.
        const usada = index >= 0 ? keys[index] : undefined;
        if (usada) {
          if (usada.spin) usada.spin.value = withTiming(2 * Math.PI, { duration: theme.motion.morph });
          usada.alive.value = withTiming(0, { duration: theme.motion.morph });
        }
        // El avance va con un temporizador y no con el callback de la animación:
        // con el panel oculto el navegador estrangula `requestAnimationFrame` y
        // la partida se quedaría esperando un cuadro que no llega.
        luego(() => {
          setHistory((h) => [...h, eq]);
          setEq(m.next);
          setOpened(siguiente);
          setPending(null);
          progress.value = 0;
          setSlotOp(null);
          if (multiSolved(problem.layers, siguiente)) {
            openness.value = withTiming(1, { duration: theme.motion.base });
            // Sin balanza en pantalla no se puede decir que quedó nivelada:
            // el nivel ya se juega sin ella.
            succeed(t(level.balance === "hidden" ? "multi.hint.alone" : "multi.hint.solved"));
          } else if (problem.degenerate !== "none") {
            setMessage({ text: t("multi.hint.noKey"), tone: "dim" });
          } else {
            setMessage({
              text: t(problem.commuting ? "multi.hint.commute" : "multi.hint.next"),
              tone: "dim",
            });
          }
        }, theme.motion.morph);
        return;
      }

      if (m.verdict === "stalls") {
        // Rebota contra la tapa cerrada y el cofre de afuera late. El renglón no
        // cambia: el estado del jugador se conserva y sigue siendo válido.
        vain.value = withSequence(
          withTiming(1, { duration: 110 }),
          withTiming(-1, { duration: 150 }),
          withTiming(0, { duration: 140 }),
        );
        setMessage({
          text: `${t("multi.hint.bounce")} ${OP_CHAR[capa.op]}${capa.value}.`,
          tone: "warn",
        });
        if (index >= 0) devolver(index);
        setSlotOp(null);
        return;
      }

      if (m.verdict === "tilts") {
        // La ficha cruzó el igual sin cambiar: dos acciones donde el jugador vio
        // una sola, y la barra se hunde.
        balanceTilt.value = withSequence(
          withTiming(0.16, { duration: 260 }),
          withTiming(0.16, { duration: 700 }),
          withTiming(0, { duration: theme.motion.base }),
        );
        // La barra que se hunde es el mensaje, así que si el jugador tenía la
        // balanza guardada se la devuelve el error, no un cartel.
        if (!balanceOn && level.balance !== "hidden") {
          setBalanceOn(true);
          balanceAppear.value = withTiming(1, { duration: theme.motion.base });
        }
        setMessage({ text: t("multi.hint.tilt"), tone: "warn" });
        if (index >= 0) devolver(index);
        setSlotOp(null);
        return;
      }

      // Gira un cuarto de vuelta y se traba: no es la inversa de ninguna
      // cerradura. El catálogo de L no tiene una entrada que apunte a este nodo
      // para este error, así que el movimiento ya viajó sin campo.
      jam.value = withSequence(
        withTiming(1, { duration: 90 }),
        withTiming(-1, { duration: 140 }),
        withTiming(0, { duration: 120 }),
      );
      if (index >= 0) {
        const s = keys[index];
        if (s?.spin) {
          s.spin.value = withSequence(
            withTiming(Math.PI / 2, { duration: 180 }),
            withTiming(0, { duration: 320 }),
          );
        }
      }
      setMessage({
        text: `${t("multi.hint.jam")} ${OP_CHAR[capa.op]}${capa.value}.`,
        tone: "warn",
      });
      if (index >= 0) devolver(index);
      setSlotOp(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, pending, capa, eq, opened, problem, attempt, quiet, devolver, succeed, luego, balanceOn, level.balance],
  );

  /** Tocar o soltar una llave del llavero. El blanco es generoso a propósito. */
  const useKey = useCallback(
    (index: number) => {
      if (problem.ask === "assemble") {
        const o = problem.ops[index];
        if (!o) return;
        setSlotOp(o);
        setMessage({ text: t("multi.hint.needNumber"), tone: "dim" });
        return;
      }
      const k = problem.keys[index];
      if (k) tryKey(k, index);
    },
    [problem, tryKey],
  );

  /** Una ficha numérica. Con la operación ya elegida, la llave queda armada. */
  const useTile = useCallback(
    (index: number) => {
      const v = problem.tiles[index];
      if (v === undefined) return;
      if (slotOp === null) {
        setMessage({ text: t("multi.hint.needOp"), tone: "dim" });
        return;
      }
      tryKey({ id: "armada", op: slotOp, value: v, kind: "apply", layer: null }, -1);
    },
    [problem.tiles, slotOp, tryKey],
  );

  /** Los dos casos especiales: el cofre sin tesoro y el que abre con cualquiera. */
  const answerDegenerate = useCallback(
    (respuesta: "no_solution" | "identity") => {
      if (solved) return;
      quiet();
      const ok = respuesta === problem.degenerate;
      // Ninguna de las dos respuestas equivocadas está en el catálogo de L
      // apuntando a este nodo, así que el movimiento va sin campo.
      attempt(ok);
      if (ok) {
        succeed(t(respuesta === "no_solution" ? "multi.hint.noSolution" : "multi.hint.identity"));
        return;
      }
      setMessage({ text: t("multi.hint.wrongCase"), tone: "warn" });
    },
    [solved, problem.degenerate, attempt, quiet, succeed],
  );

  // --- Los paneles a demanda -------------------------------------------------

  const toggleChests = useCallback(() => {
    setChestsOn((on) => {
      chestAppear.value = withTiming(1, { duration: theme.motion.base });
      return !on;
    });
  }, [chestAppear]);

  const toggleBalance = useCallback(() => {
    setBalanceOn((on) => {
      balanceAppear.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [balanceAppear]);

  const togglePipe = useCallback(() => {
    setPipeOn((on) => {
      pipeAppear.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      unfold.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      if (!on) {
        flow.value = 0;
        flow.value = withTiming(1, { duration: theme.motion.reveal });
      }
      return !on;
    });
  }, [pipeAppear, unfold, flow]);

  const togglePipeDirection = useCallback(() => {
    setPipeBack((b) => !b);
    flow.value = 0;
    flow.value = withTiming(1, { duration: theme.motion.reveal });
  }, [flow]);

  // --- Gestos ----------------------------------------------------------------

  /**
   * Lo que el gesto necesita viaja en una referencia estable: si el objeto del
   * `Gesture` cambiara de identidad entre renders, el detector tendría que
   * reengancharlo y el arrastre se perdería a mitad de camino.
   */
  const acciones = useRef({ useKey, useTile });
  acciones.current = { useKey, useTile };
  const alUsarLlave = useCallback((i: number) => acciones.current.useKey(i), []);
  const alUsarFicha = useCallback((i: number) => acciones.current.useTile(i), []);

  /**
   * Dónde entra la llave: la cerradura del cofre expuesto mientras haya cofres
   * dibujados, y el renglón cuando ya se retiraron. Es el mismo gesto, así que
   * es el mismo punto.
   */
  const destino = useMemo<Spot>(() => {
    const caja = chestsVisible ? layout.nest?.boxes[opened.length] : undefined;
    if (caja) return { x: caja.x + caja.w - 20, y: caja.y + caja.h - 18 };
    return { x: rowX, y: rowY };
  }, [chestsVisible, layout.nest, opened.length, rowX, rowY]);

  const alSoltarLlave = useCallback(
    (index: number, x: number, y: number) => {
      const home = layout.keys[index] ?? { x: 0, y: 0 };
      const s = keys[index];
      if (Math.hypot(x - destino.x, y - destino.y) > DROP_R) {
        if (s) {
          s.dx.value = withTiming(0, { duration: theme.motion.base });
          s.dy.value = withTiming(0, { duration: theme.motion.base });
        }
        return;
      }
      if (s) {
        s.dx.value = withTiming(destino.x - home.x, { duration: theme.motion.quick });
        s.dy.value = withTiming(destino.y - home.y, { duration: theme.motion.quick });
      }
      acciones.current.useKey(index);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.keys, destino],
  );

  const llaves = vivos(problem);
  const conFichas = problem.tiles.length > 0;
  const esperandoCaso = problem.degenerate !== "none" && pendientes.length === 1 && !pending;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_MULTI_STEP}.name`)} · nivel ${level.n} de ${TOTAL_MULTI_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <Group opacity={chestAppear}>
            <ChestScene
              problem={chestProblem}
              level={chestLevel}
              layout={layout}
              pos={quieto}
              open={openness}
              outArrow={quieto}
              backArrow={quieto}
              leftover={quieto}
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
              keys={keys}
              tiles={tiles}
              nest={{ opened: openedSV, vain, tree, ghost, marked }}
            />
          </Group>

          {/* El renglón vivo: el mismo término viaja por toda la resolución. */}
          {level.row ? (
            <Group transform={[{ translateX: rowX }, { translateY: rowY }]}>
              <MorphView plan={plan} progress={progress} ease={smooth} fontSize={FONT_SIZE} />
            </Group>
          ) : null}

          {/* La balanza testigo, en su columna. */}
          {level.balance !== "hidden" ? (
            <Group transform={[{ translateX: balanceX }]}>
              <BalanceScene
                problem={{
                  solution: problem.solution ?? 0,
                  // El broche dice cómo se juntan las cajas y las pesas de un
                  // plato, y en el plato repartido eso siempre es una suma o una
                  // resta: la cerradura del cofre es otra cosa y ponerla acá
                  // diría que las pesas se multiplican por la caja.
                  lock: {
                    op: reparto.units < 0 ? "-" : "+",
                    value: Math.abs(reparto.units),
                  },
                }}
                unknownLeft
                style={level.layer === "concrete" ? "concrete" : "visual"}
                width={balanceW}
                height={sceneH * 0.82}
                left={quieto}
                right={quieto}
                appear={balanceAppear}
                contents={contents}
                tilt={balanceTilt}
                openness={openness}
                // Sin pesas sueltas no hay nada que juntar con la caja, y un
                // broche solo diría que la caja se opera consigo misma.
                brooch={reparto.units !== 0}
              />
            </Group>
          ) : null}

          {/* La tubería plegada, que se pide con un toque. */}
          {level.pipe ? (
            <Group opacity={pipeAppear}>
              <PipeScene
                config={pipeConfig}
                layout={pl}
                flow={flow}
                lane={0}
                jam={jam}
                hint={hint}
                demo={quieto}
                unfold={unfold}
                appear={pipeAppear}
                pieces={pipePieces}
                trayPieces={pipeTray}
                picked={-1}
              />
            </Group>
          ) : null}
        </Canvas>

        {/* Las asas invisibles sobre las llaves dibujadas. */}
        {Array.from({ length: MULTI_KEY_SLOTS }, (_, i) => (
          <Handle
            key={`k${i}`}
            index={i}
            slot={keys[i] as Slot}
            spot={layout.keys[i] ?? { x: 0, y: 0 }}
            w={layout.keyW}
            h={layout.keyH}
            enabled={i < llaves && !solved && !pipeOn}
            onDrop={alSoltarLlave}
            onTap={alUsarLlave}
          />
        ))}

        {/* Las fichas numéricas con las que se arma la llave. */}
        {conFichas
          ? Array.from({ length: MULTI_TILE_SLOTS }, (_, i) => (
              <Handle
                key={`t${i}`}
                index={i}
                slot={tiles[i] as Slot}
                spot={layout.tiles[i] ?? { x: 0, y: 0 }}
                w={layout.tileW}
                h={layout.tileH}
                enabled={i < problem.tiles.length && !solved && !pipeOn}
                onDrop={noop3}
                onTap={alUsarFicha}
              />
            ))
          : null}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {problem.ask === "assemble" ? (
        <Text style={styles.slot}>
          {slotOp === null
            ? t("multi.slot.empty")
            : `${t("multi.slot.filled")} ${OP_CHAR[slotOp]}`}
        </Text>
      ) : null}

      {/* Los dos casos especiales: no son una llave, son un veredicto. */}
      {esperandoCaso ? (
        <View style={styles.answers}>
          <Choice label={t("multi.answer.noTreasure")} onPress={() => answerDegenerate("no_solution")} />
          <Choice label={t("multi.answer.anyKey")} onPress={() => answerDegenerate("identity")} />
        </View>
      ) : null}

      <View style={styles.tools}>
        {level.chests === "onDemand" ? (
          <Toggle label={t(chestsOn ? "multi.chests.hide" : "multi.chests.show")} onPress={toggleChests} />
        ) : null}
        {level.balance === "onDemand" ? (
          <Toggle label={t(balanceOn ? "multi.balance.hide" : "multi.balance.show")} onPress={toggleBalance} />
        ) : null}
        {level.pipe ? (
          <Toggle label={t(pipeOn ? "multi.pipe.hide" : "multi.pipe.show")} onPress={togglePipe} />
        ) : null}
        {level.pipe && pipeOn ? (
          <Toggle
            label={t(pipeBack ? "multi.pipe.forward" : "multi.pipe.backward")}
            onPress={togglePipeDirection}
          />
        ) : null}
      </View>

      {level.definition ? <Text style={styles.definition}>{t("multi.definition")}</Text> : null}
    </View>
  );
}

const noop3 = (): void => {};

/** Cuántas piezas cuelga el llavero en esta ronda. */
const vivos = (problem: { readonly ask: string; readonly keys: readonly unknown[]; readonly ops: readonly unknown[] }): number =>
  problem.ask === "assemble" ? problem.ops.length : problem.keys.length;

function openingHint(ask: string): string {
  if (ask === "assemble") return t("multi.hint.assemble");
  if (ask === "commute") return t("multi.hint.sameSize");
  if (ask === "degenerate") return t("multi.hint.strangeChest");
  return t("multi.hint.outerFirst");
}

/** Un asa invisible sobre la pieza dibujada: el dibujo es Skia, el gesto es la vista. */
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
  readonly slot: Slot;
  readonly spot: Spot;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, x: number, y: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(enabled)
      .onChange((e) => {
        slot.dx.value = e.translationX;
        slot.dy.value = e.translationY;
      })
      .onEnd((e) => {
        // Dónde quedó la pieza, en coordenadas del lienzo: de dónde estaba más
        // cuánto se movió, y nunca de la posición absoluta del dedo, porque la
        // caja del lienzo no se puede medir con `onLayout`.
        runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
      });
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)(index);
      });
    return Gesture.Race(pan, tap);
  }, [enabled, index, slot, spot.x, spot.y, onDrop, onTap]);

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

/**
 * Las agujas de una pieza, en un objeto que no cambia de identidad. Si cambiara,
 * el gesto de su asa se volvería a crear en cada render y el detector tendría
 * que reengancharlo, que es como se pierde un arrastre a mitad de camino.
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

function usePipeSlot(): PipeSlot {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const alive = useSharedValue(0);
  return useMemo(() => ({ dx, dy, alive }), [dx, dy, alive]);
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
  slot: { color: theme.color.inkDim, fontSize: 13 },
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
