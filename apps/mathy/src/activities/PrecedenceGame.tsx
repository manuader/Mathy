/**
 * Cofres dentro de cofres: el minijuego de `arith.expr.precedence_tree`.
 *
 * Un chico que no lee tiene que poder jugar los seis primeros niveles enteros.
 * Por eso hasta el quinto no hay un solo numeral: los cofres se distinguen por
 * tamaño, las cerraduras por forma y el tesoro es un punto. Los mensajes de
 * abajo son para el adulto que mira.
 *
 * El nodo tiene dos mecánicas y por eso dos superficies. `chest_key` es la
 * principal y la dibuja `ChestScene` con su configuración de encastre —la misma
 * escena de los nodos 4 y 6, ensanchada acá con el modo `nest`—; `machine_pipe`
 * es el contraste y la dibuja `PipeScene`, que se estrena en este nodo y está
 * escrita para los diez de la espina que la usan. Esta actividad no dibuja nada:
 * elige qué escena mira el jugador en cada ronda, le pasa su configuración y
 * traduce el dedo en los valores que las dos animan.
 *
 * La expresión no es una cadena: es el árbol de `@mathy/math-core`, compuesto
 * con `@mathy/typeset`. De ahí sale lo que hace posible el nodo entero: cada
 * glifo de la fila sabe de qué término salió, así que tocar un `×` de la fila y
 * tocar la pared de un cofre devuelven el mismo id, y el árbol del costado se
 * ilumina sin que nadie sincronice nada.
 *
 * Los gestos, y ninguno fino:
 *
 * - Arrastrar una llave a un cofre. Si es el cofre accesible, muerde y se abre;
 *   si no, la llave gira en el vacío y vuelve sola. Nada se llama incorrecto.
 * - Arrastrar un cofre suelto al encastre. Va de afuera hacia adentro, y con
 *   tres cofres el orden queda dibujado en el tamaño.
 * - Tocar un nodo del árbol. Es `recognize` sin leer.
 * - Tocar una ficha de la fila. Es `wrap` y `generalize`: cuál se calcula
 *   primero, con paredes escritas y sin ellas.
 * - Mantener el dedo sobre la fila. El cofre fantasma se dibuja alrededor de la
 *   multiplicación y se desvanece, y el ciclo se repite mientras el dedo esté
 *   apoyado. Ese ir y venir es la definición de la jerarquía.
 * - Tocar o arrastrar una máquina de la tubería. Cambia el orden, y al soltar la
 *   bolita sale con otro tamaño.
 *
 * El único error que clasifica es `unwrap_order_inverted`, que es el único que
 * el catálogo de L declara sobre este nodo, y solo en el nivel de vuelta.
 * Calcular empezando por afuera y creer que los paréntesis operan están
 * previstos en el diseño y no tienen entrada, así que se muestran y no se
 * anotan.
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
import { walk, type NodeId } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { centered, layoutNode, type GlyphMetrics } from "@mathy/typeset";
import {
  NODE_PRECEDENCE_TREE,
  PREC_KEY_SLOTS,
  PREC_OPTION_SLOTS,
  TOTAL_PREC_LEVELS,
  generatePrecedence,
  precAccessible,
  precBites,
  precMisconceptionFor,
  precPipeValue,
  type PrecChest,
  type PrecLevel,
  type PrecMachine,
  type PrecOption,
  type PrecProblem,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  ChestScene,
  chestLayout,
  KEY_SLOTS,
  TILE_SLOTS,
  type ChestGlyph,
  type ChestKeyKind,
  type ChestLevel,
  type ChestProblem,
  type ChestRing,
  type NestLayout,
  type Slot,
} from "../scenes/ChestScene.tsx";
import {
  PipeScene,
  PIPE_MACHINE_SLOTS,
  PIPE_TRAY_SLOTS,
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

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;

const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

/** La forma de la cerradura y de la llave, para la escena. */
const KIND: Readonly<Record<string, ChestKeyKind>> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
};

/** Lo que hace cada máquina de la tubería, en el vocabulario de la escena. */
const MACHINE_KIND: Readonly<Record<string, PipeMachineKind>> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
};

export interface PrecedenceGameProps {
  readonly level: PrecLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function PrecedenceGame(props: PrecedenceGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: PrecedenceGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** Cuántos cofres se abrieron ya, o cuántos se pusieron en el encastre. */
  const [opened, setOpened] = useState(0);
  /** El orden de las máquinas de la tubería, por id. */
  const [order, setOrder] = useState<readonly string[]>([]);

  const problem = useMemo(
    () => generatePrecedence(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(ask),
    tone: "dim",
  }));

  const sceneH = Math.max(340, Math.min(height * 0.62, 520));
  const usaTuberia = ask === "pipe";
  const usaFiguras = ask === "arbitrary";

  // --- Lo que ve la escena del cofre -----------------------------------------

  /** En qué paso se abre cada cofre. Es el orden, y lo decide el generador. */
  const stepOf = useCallback(
    (id: NodeId) => {
      const i = problem.order.indexOf(id);
      return i < 0 ? problem.chests.length : i;
    },
    [problem.order, problem.chests.length],
  );

  const rings = useMemo<ChestRing[]>(
    () =>
      problem.chests.map((c) => ({
        id: c.id,
        lock: KIND[c.op] ?? "add",
        depth: c.depth,
        step: stepOf(c.id),
        // Armar el anidamiento empieza con el encastre vacío: los cofres que
        // todavía no se pusieron son el contorno que hay que reproducir.
        placed: ask === "nest" ? c.depth < opened : true,
        // Los cofres invisibles: en ese nivel la fila es lo único que hay, y
        // que no esté dibujado no significa que no esté.
        drawn: ask !== "ghost",
      })),
    [problem.chests, stepOf, ask, opened],
  );

  /** Las llaves que este nivel pone en el llavero. Ninguna en los demás. */
  const keys = useMemo(
    () => (ask === "open" || ask === "unwrap" ? problem.keys : []),
    [ask, problem.keys],
  );

  const chestProblem = useMemo<ChestProblem>(
    () => ({
      // El nodo 9 no tiene pista: el encastre está suelto y la fila va debajo.
      track: 2,
      home: 0,
      step: 0,
      landing: 0,
      // El llavero: una llave por cerradura, con la forma de la operación que
      // la deshace. Los dientes no se usan acá, porque en este nodo la llave no
      // se mide contando sino que se reconoce por su signo.
      keys: keys.map((k) => ({ teeth: 0, kind: KIND[k.inverse] ?? "add" })),
      returns: [],
      liar: 0,
      marks: null,
      row: { minuend: 0, subtrahend: 0, result: 0, hidden: "result" },
      tiles: [],
      lock: { kind: "turn", value: 0 },
      actions: [],
      rings,
      glyphs: [],
      ghostBox: null,
    }),
    [rings, keys],
  );

  const chestLevel = useMemo<ChestLevel>(
    () => ({
      mode: "nest",
      layer: level.layer,
      labeled: true,
      // Sin pista que dibujar: el grupo entero se queda apagado.
      skin: "hidden",
      ruler: false,
      keyboard: false,
      // Los numerales de este nodo viven en la fila y no en las llaves: una
      // llave con un número encima diría una cantidad, y lo que dice es una
      // operación.
      numerals: false,
      tree: level.tree,
    }),
    [level.layer, level.tree],
  );

  const cl = useMemo(
    () => chestLayout(chestProblem, chestLevel, width, sceneH),
    [chestProblem, chestLevel, width, sceneH],
  );

  /**
   * La fila compuesta.
   *
   * `layoutNode` devuelve cada glifo con el id del término del que salió, y esa
   * es la pieza que hace posible el nodo: el hit test del dedo y el dibujo de
   * la escena salen de la misma cuenta, así que el paréntesis se toca
   * exactamente donde se ve.
   */
  const fila = useMemo(() => {
    const nest = cl.nest;
    if (!nest || !level.row || problem.chests.length === 0) {
      return { glyphs: [] as ChestGlyph[], ids: [] as NodeId[], spans: [] as number[], size: 0 };
    }
    const box = centered(layoutNode(problem.tree, metrics));
    const size = Math.max(18, Math.min(34, (nest.rowW * 0.92) / Math.max(box.width, 1)));
    const glyphs: ChestGlyph[] = [];
    const ids: NodeId[] = [];
    const spans: number[] = [];
    for (const g of box.glyphs) {
      const adv = metrics(g.char)?.advance ?? 0.5;
      glyphs.push({
        char: g.char,
        x: nest.row.x + (g.x + adv / 2) * size,
        // `addGlyphs` baja la línea de base un tercio de em para centrar, así
        // que el centro que hay que pasarle es la base menos ese tercio.
        y: nest.row.y + g.y * size - size * 0.333,
        size,
      });
      ids.push(g.nodeId);
      spans.push(adv * size);
    }
    return { glyphs, ids, spans, size };
  }, [cl.nest, level.row, problem.tree, problem.chests.length]);

  /** El cofre fantasma: la caja que envuelve al subárbol del cofre de adentro. */
  const ghostBox = useMemo(() => {
    const dentro = problem.chests[problem.chests.length - 1];
    if (!dentro || fila.glyphs.length === 0) return null;
    const nodo = [...walk(problem.tree)].find((n) => n.id === dentro.id);
    if (!nodo) return null;
    const suyos = new Set([...walk(nodo)].map((n) => n.id));
    let min = Infinity;
    let max = -Infinity;
    fila.glyphs.forEach((g, i) => {
      if (!suyos.has(fila.ids[i] as NodeId)) return;
      const w = fila.spans[i] ?? 0;
      min = Math.min(min, g.x - w / 2);
      max = Math.max(max, g.x + w / 2);
    });
    if (min === Infinity) return null;
    return { x: min - 8, y: (cl.nest?.row.y ?? 0) - fila.size * 0.9, w: max - min + 16, h: fila.size * 1.7 };
  }, [problem.tree, problem.chests, fila, cl.nest]);

  const chestProblemFinal = useMemo<ChestProblem>(
    () => ({ ...chestProblem, glyphs: fila.glyphs, ghostBox }),
    [chestProblem, fila.glyphs, ghostBox],
  );

  // --- Lo que ve la escena de la tubería -------------------------------------

  /** Las máquinas en el orden en que el jugador las dejó. */
  const machines = useMemo<PrecMachine[]>(() => {
    if (order.length === 0) return [...problem.machines];
    const out: PrecMachine[] = [];
    for (const id of order) {
      const m = problem.machines.find((x) => x.id === id);
      if (m) out.push(m);
    }
    return out;
  }, [order, problem.machines]);

  /**
   * Los tamaños de la bolita en cada tramo. Sin numerales es lo único que dice
   * cuánto vale, así que el techo se toma del más grande de los dos órdenes: si
   * se normalizara contra el recorrido de ahora, dar vuelta el caño no se vería.
   */
  const pipeConfig = useMemo<PipeConfig>(() => {
    const techo = Math.max(
      problem.output,
      precPipeValue(problem.input, problem.machines),
      problem.input,
      1,
    );
    const item = (value: number): PipeItem => ({
      value,
      size: Math.max(0.22, Math.min(1, value / techo)),
      kind: "ball",
      label: "",
    });
    const stages: PipeItem[] = [];
    let v = problem.input;
    for (const m of machines) {
      v = precPipeValue(v, [m]);
      stages.push(item(v));
    }
    return {
      lanes: [
        {
          id: "l0",
          machines: machines.map((m) => ({
            id: m.id,
            kind: MACHINE_KIND[m.op] ?? "add",
            value: m.value,
            label: "",
            inverted: false,
            opaque: false,
          })),
          input: item(problem.input),
          stages,
          output: item(v),
          target: item(problem.output),
          glow: !solved,
        },
      ],
      skin: level.pipeSkin,
      direction: "forward",
      numerals: level.numerals,
      counter: level.numerals,
      table: [],
      tray: [],
      slots: 0,
      reorderable: true,
      box: false,
      onDemand: false,
    };
  }, [machines, problem, level.pipeSkin, level.numerals, solved]);

  const pl = useMemo(() => pipeLayout(pipeConfig, width, sceneH), [pipeConfig, width, sceneH]);

  // --- Lo que las escenas animan ---------------------------------------------

  const openedV = useSharedValue(0);
  const vain = useSharedValue(0);
  const treeV = useSharedValue(0);
  const ghost = useSharedValue(0);
  const marked = useSharedValue(-1);
  const flow = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const unfold = useSharedValue(1);
  const chestAppear = useSharedValue(0);
  const pipeAppear = useSharedValue(0);
  // Los valores que el piso de `chest_key` necesita y este nodo no usa. Están
  // quietos: la escena los lee igual y no cuesta nada.
  const pos = useSharedValue(0);
  const open = useSharedValue(0);
  const outArrow = useSharedValue(0);
  const backArrow = useSharedValue(0);
  const leftover = useSharedValue(0);
  const clock = useSharedValue(0);
  const ruler = useSharedValue(0);
  const line = useSharedValue(0);

  const nestValues = useMemo(
    () => ({ opened: openedV, vain, tree: treeV, ghost, marked }),
    [openedV, vain, treeV, ghost, marked],
  );

  /** Las llaves del llavero y los cofres sueltos comparten las mismas ranuras. */
  const keySlots = useSlots(KEY_SLOTS);
  const machineSlots = useSlots(PIPE_MACHINE_SLOTS);
  const traySlots = useSlots(PIPE_TRAY_SLOTS);
  /**
   * El cajón de fichas de `chest_key` no lo usa este nodo, pero la escena lo
   * dibuja igual y necesita sus ranuras: sin ellas la pieza se monta contra un
   * `undefined` y el lienzo entero se cae, sin dibujar nada.
   */
  const tileSlots = useSlots(TILE_SLOTS);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * Todo lo que un gesto necesita saber, en una referencia.
   *
   * Un worklet captura el callback del render en que se armó el gesto, así que
   * lo leído del cierre sería lo de la primera ronda para siempre. Acá vive en
   * una referencia y el gesto ve siempre lo de ahora.
   */
  const vivo = useRef({ problem, ask, solved, opened, order, ids: [] as readonly NodeId[] });
  vivo.current = { ...vivo.current, problem, ask, solved, opened, order };
  const roundRef = useRef(round);
  roundRef.current = round;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setOpened(0);
    setSolved(false);
    setOrder(problem.machines.map((m) => m.id));
    setMessage({ text: openingHint(ask), tone: "dim" });

    openedV.value = 0;
    vain.value = 0;
    treeV.value = 0;
    ghost.value = 0;
    marked.value = -1;
    flow.value = 0;
    jam.value = 0;
    // La tubería corre sola al entrar: el jugador ve salir la bolita con el
    // tamaño equivocado antes de tocar nada, que es toda la instrucción que hay.
    if (problem.ask === "pipe") flow.value = withTiming(1, { duration: theme.motion.reveal });
    unfold.value = 1;
    for (const s of [...keySlots, ...machineSlots, ...traySlots]) {
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = 1;
    }
    chestAppear.value = withTiming(usaTuberia || usaFiguras ? 0 : 1, {
      duration: theme.motion.base,
    });
    pipeAppear.value = withTiming(usaTuberia ? 1 : 0, { duration: theme.motion.base });

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
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
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_PRECEDENCE_TREE, layer: level.layer });
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
          node: NODE_PRECEDENCE_TREE,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_PRECEDENCE_TREE, level: level.n });
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

  // --- Abrir y deshacer ------------------------------------------------------

  /**
   * La llave llegó a un cofre. Si es el accesible, muerde; si no, gira en el
   * vacío y vuelve sola. Ese "si no" no es una comprobación de más: es el hueco
   * de la tapa, que todavía está vacío.
   */
  const openWithKey = useCallback(
    (chestId: NodeId) => {
      const { problem: p, solved: hecho, opened: abiertos } = vivo.current;
      if (hecho) return;
      quiet();
      const muerde = precBites(p, chestId, abiertos);
      const fallo = precMisconceptionFor(p, chestId, abiertos);
      attempt(muerde, fallo);
      if (!muerde) {
        vain.value = withSequence(
          withTiming(1, { duration: 90 }),
          withTiming(-1, { duration: 120 }),
          withTiming(0, { duration: 120 }),
        );
        const elegido = p.chests.find((c) => c.id === chestId);
        const abierto = precAccessible(p, abiertos);
        setMessage({
          text: vainHint(p.ask, elegido, abierto),
          tone: "warn",
        });
        return;
      }
      const siguiente = abiertos + 1;
      setOpened(siguiente);
      openedV.value = withTiming(siguiente, { duration: theme.motion.morph });
      treeV.value = withTiming(siguiente, { duration: theme.motion.morph });
      if (siguiente >= p.chests.length) {
        succeed(
          p.ask === "unwrap"
            ? "De afuera hacia adentro. Deshacer recorre el mismo árbol al revés."
            : "El tesoro de adentro subió al hueco de la tapa, y recién ahí la de afuera mordió.",
        );
        return;
      }
      setMessage({ text: "Ese entregó. Ahora el hueco de la tapa siguiente ya no está vacío.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, succeed],
  );

  // --- Armar el anidamiento --------------------------------------------------

  /** Un cofre suelto llegó al encastre. Va de afuera hacia adentro. */
  const placeChest = useCallback(
    (depth: number) => {
      const { problem: p, solved: hecho, opened: puestos } = vivo.current;
      if (hecho) return;
      quiet();
      const bien = depth === puestos;
      attempt(bien);
      if (!bien) {
        vain.value = withSequence(
          withTiming(1, { duration: 90 }),
          withTiming(0, { duration: 140 }),
        );
        setMessage({
          text:
            depth > puestos
              ? "Ese es más chico de lo que va acá. El de más afuera se pone primero."
              : "Ese ya está puesto. Falta el que va adentro.",
          tone: "warn",
        });
        return;
      }
      const siguiente = puestos + 1;
      setOpened(siguiente);
      if (siguiente >= p.chests.length) {
        succeed("Quedó el mismo encastre. El orden en que los metiste está dibujado en el tamaño.");
        return;
      }
      setMessage({ text: "Entró. Ahora el que sigue va adentro de ese.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, succeed],
  );

  // --- Tocar el árbol y la fila ----------------------------------------------

  const pickNode = useCallback(
    (nodeId: NodeId) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho) return;
      quiet();
      const opcion = p.options.find((o) => o.nodeId === nodeId);
      const bien = opcion?.correct === true;
      // La ficha que no está entre las opciones es un número, no una operación:
      // el toque no cuenta como intento, porque no dice nada.
      if (!opcion) {
        setMessage({ text: "Eso es un número. Tocá una operación.", tone: "dim" });
        return;
      }
      marked.value = p.chests.findIndex((c) => c.id === nodeId);
      attempt(bien);
      if (bien) {
        treeV.value = withTiming(p.chests.length, { duration: theme.motion.morph });
        openedV.value = withTiming(p.chests.length, { duration: theme.motion.morph });
        succeed(successFor(p.ask));
        return;
      }
      setMessage({ text: lureHint(opcion.lure), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, succeed],
  );

  // --- La tubería ------------------------------------------------------------

  const runPipe = useCallback((lista: readonly string[]) => {
    flow.value = 0;
    flow.value = withTiming(1, { duration: theme.motion.reveal });
    return lista;
  }, [flow]);

  const swapMachines = useCallback(() => {
    const { problem: p, solved: hecho, order: actual } = vivo.current;
    if (hecho) return;
    quiet();
    const dado = [...actual].reverse();
    setOrder(dado);
    runPipe(dado);
    const ordenadas = dado
      .map((id) => p.machines.find((m) => m.id === id))
      .filter((m): m is PrecMachine => m !== undefined);
    const salida = precPipeValue(p.input, ordenadas);
    const bien = salida === p.output;
    attempt(bien);
    if (bien) {
      setTimeout(
        () =>
          succeed(
            "Con las máquinas en ese orden la bolita sale como pedía. El caño decide, no los números.",
          ),
        theme.motion.reveal,
      );
      return;
    }
    setMessage({
      text: "Salió de otro tamaño. La misma entrada por el mismo camino da siempre lo mismo: el camino cambió.",
      tone: "warn",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, quiet, succeed, runPipe]);

  // --- Los encastres que nunca vio -------------------------------------------

  const pickOrder = useCallback(
    (option: PrecOption) => {
      const { solved: hecho } = vivo.current;
      if (hecho) return;
      quiet();
      attempt(option.correct);
      if (option.correct) {
        succeed("Ese es el orden que deja la figura así. Las cerraduras no son números y el orden igual manda.");
        return;
      }
      setMessage({
        text: "En ese orden el punto queda en otro lado. Girar y después agregar no es agregar y después girar.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que los gestos necesitan, en un solo `SharedValue`.
   *
   * Los `Gesture` se arman una sola vez y no cambian de identidad entre
   * renders: gesture-handler en web pierde el gesto cuando el objeto cambia, y
   * el worklet leería del cierre del primer render. Acá lee un valor compartido
   * y siempre ve el de ahora.
   */
  const geo = useSharedValue({
    activo: 0,
    /** Qué contesta el toque: 1 el árbol, 2 la fila, 3 la tubería. */
    modo: 0,
    desdeX: 0,
    desdeY: 0,
    sostenido: 0,
    nodeR: 0,
    tree: [] as { x: number; y: number }[],
    row: [] as { x: number; w: number }[],
    rowY: 0,
    rowH: 0,
    machines: [] as { x: number; y: number; w: number; h: number }[],
  });

  useEffect(() => {
    const nest = cl.nest;
    const lane = pl.lanes[0];
    vivo.current = { ...vivo.current, ids: fila.ids };
    geo.value = {
      activo: solved ? 0 : 1,
      modo: ask === "recognize" ? 1 : ask === "wrap" || ask === "ghost" ? 2 : usaTuberia ? 3 : 0,
      desdeX: 0,
      desdeY: 0,
      sostenido: 0,
      nodeR: nest?.nodeR ?? 0,
      tree: nest ? nest.tree.map((s) => ({ x: s.x, y: s.y })) : [],
      row: fila.glyphs.map((g, i) => ({ x: g.x, w: fila.spans[i] ?? 0 })),
      rowY: nest?.row.y ?? 0,
      rowH: Math.max(fila.size * 1.8, 40),
      machines: lane ? lane.machines.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h })) : [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cl, pl, fila, ask, solved, usaTuberia]);

  /**
   * Qué ficha de la fila cayó bajo el dedo.
   *
   * Lee la lista de identidades de una referencia y no del cierre: el gesto se
   * arma una sola vez y un worklet captura el callback del render en que se
   * armó, así que con el cierre esta función seguiría contestando con los
   * términos de la primera ronda para siempre.
   */
  const tapRow = useCallback(
    (x: number) => {
      const g = geo.value;
      const ids = vivo.current.ids;
      for (let i = 0; i < g.row.length; i++) {
        const c = g.row[i];
        if (!c) continue;
        if (x > c.x - c.w / 2 - 4 && x < c.x + c.w / 2 + 4) {
          const id = ids[i];
          if (id) pickNode(id);
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pickNode],
  );

  /** El nodo del árbol que el dedo señaló. Por la misma razón, desde la referencia. */
  const tapTree = useCallback(
    (index: number) => {
      const c = vivo.current.problem.chests[index];
      if (c) pickNode(c.id);
    },
    [pickNode],
  );

  /** El cofre fantasma, mientras el dedo esté apoyado sobre la fila. */
  const holdGhost = useCallback(() => {
    ghost.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 420 }),
        withTiming(1, { duration: 260 }),
        withTiming(0, { duration: 420 }),
      ),
      -1,
      false,
    );
    setMessage({
      text: "Ese cofre no lo dibujó nadie: es un acuerdo para ahorrar tinta. Soltá y sigue estando.",
      tone: "dim",
    });
  }, [ghost]);

  const releaseGhost = useCallback(() => {
    cancelAnimation(ghost);
    ghost.value = withTiming(0, { duration: 260 });
  }, [ghost]);

  /**
   * El gesto del lienzo. Sin `minDistance(0)`: con cero se activa en el mismo
   * instante en que el dedo se apoya y le gana la carrera al asa que hay
   * encima, que queda cancelada a mitad del arrastre y nunca llega a soltar la
   * pieza. Con el umbral por defecto el asa gana lo que agarró y el lienzo se
   * queda con lo demás.
   */
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          geo.value = { ...geo.value, desdeX: e.x, desdeY: e.y, sostenido: 0 };
        })
        .onFinalize((e) => {
          const g = geo.value;
          geo.value = { ...g, sostenido: 0 };
          if (g.sostenido) {
            runOnJS(releaseGhost)();
            return;
          }
          if (!g.activo) return;
          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          // Un solo gesto contesta el toque y el arrastre: encadenar un `Tap`
          // aparte los hace pelear, y el `Pan` siempre le gana la carrera.
          if (movido >= TAP_SLOP) return;
          if (g.modo === 1) {
            for (let i = 0; i < g.tree.length; i++) {
              const s = g.tree[i];
              if (s && Math.hypot(e.x - s.x, e.y - s.y) < g.nodeR) {
                runOnJS(tapTree)(i);
                return;
              }
            }
            return;
          }
          if (g.modo === 2) {
            if (Math.abs(e.y - g.rowY) > g.rowH) return;
            runOnJS(tapRow)(e.x);
            return;
          }
          if (g.modo === 3) {
            for (const b of g.machines) {
              if (e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) {
                runOnJS(swapMachines)();
                return;
              }
            }
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Mantener el dedo sobre la fila trae el cofre fantasma, una y otra vez. */
  const hold = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(420)
        .maxDistance(12)
        .onStart((e) => {
          const g = geo.value;
          if (!g.activo || g.modo !== 2) return;
          if (Math.abs(e.y - g.rowY) > g.rowH) return;
          geo.value = { ...g, sostenido: 1 };
          runOnJS(holdGhost)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const canvasGesture = useMemo(() => Gesture.Race(hold, pan), [hold, pan]);

  // --- Las asas de las piezas ------------------------------------------------

  /** Dónde soltó la llave, en coordenadas del lienzo. */
  const dropKey = useCallback(
    (index: number, x: number, y: number) => {
      const nest = cl.nest;
      const p = vivo.current.problem;
      const key = p.keys[index];
      const slot = keySlots[index];
      if (slot) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      }
      if (!nest || !key) return;
      const elegido = chestAt(p, nest, x, y);
      if (elegido === null) return;
      // La llave equivocada no gira: se traba, que es el distractor que el nodo
      // 12 le presta a este. La llave correcta en el momento equivocado sí gira,
      // y en el vacío. Esa diferencia distingue "llave equivocada" de "cofre
      // inaccesible", y el diseño la pide dibujada.
      if (key.chestId !== elegido) {
        jam.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(0, { duration: 140 }),
        );
        attempt(false);
        setMessage({
          text: "Esa llave no entra en esa cerradura: se traba, no gira. Mirá la forma.",
          tone: "warn",
        });
        return;
      }
      openWithKey(elegido);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cl.nest, keySlots, openWithKey, attempt],
  );

  const dropChest = useCallback(
    (index: number, x: number, y: number) => {
      const nest = cl.nest;
      const slot = keySlots[index];
      if (slot) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      }
      if (!nest) return;
      const fuera = nest.boxes[0];
      if (!fuera) return;
      // Todo el encastre es el blanco: lo que importa no es dónde cae sino cuál
      // se soltó, porque el orden es lo que el nivel evalúa.
      if (x < fuera.x - 40 || x > fuera.x + fuera.w + 40) return;
      if (y < fuera.y - 40 || y > fuera.y + fuera.h + 40) return;
      placeChest(index);
    },
    [cl.nest, keySlots, placeChest],
  );

  const dropMachine = useCallback(
    (index: number, x: number, y: number) => {
      const slot = machineSlots[index];
      if (slot) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      }
      const lane = pl.lanes[0];
      if (!lane) return;
      const otras = lane.machines
        .map((b, i) => ({ b, i }))
        .filter(({ i }) => i !== index && i < machines.length);
      for (const { b } of otras) {
        if (x > b.x - 20 && x < b.x + b.w + 20 && y > b.y - 20 && y < b.y + b.h + 20) {
          swapMachines();
          return;
        }
      }
    },
    [machineSlots, pl.lanes, machines.length, swapMachines],
  );

  const conSueltos = ask === "nest";
  /** Tocar una máquina la intercambia con la otra: es el arrastre sin arrastrar. */
  const tapMachine = useCallback(() => {
    swapMachines();
  }, [swapMachines]);
  const conFichas = ask === "explain";

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_PRECEDENCE_TREE}.name`)} · nivel ${level.n} de ${TOTAL_PREC_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: las dos escenas viven adentro y la que
            no juega esta ronda se queda en opacidad cero. */}
        <Canvas style={{ width, height: sceneH }}>
          <ChestScene
            problem={chestProblemFinal}
            level={chestLevel}
            layout={cl}
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
            appear={chestAppear}
            mounted={-1}
            at={0}
            picked={-1}
            composed={null}
            placed={null}
            keys={keySlots}
            tiles={tileSlots}
            nest={nestValues}
          />
          <PipeScene
            config={pipeConfig}
            layout={pl}
            flow={flow}
            lane={0}
            jam={jam}
            hint={hint}
            demo={demo}
            unfold={unfold}
            appear={pipeAppear}
            pieces={machineSlots}
            trayPieces={traySlots}
            picked={-1}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Las asas invisibles sobre las piezas dibujadas. Siempre montadas: una
            ronda que las desmonta deja al detector de la siguiente sin
            enganchar, y el arrastre se pierde sin decir nada. */}
        {Array.from({ length: KEY_SLOTS }, (_, i) => {
          const key = problem.keys[i];
          const suelto = cl.nest?.loose[i];
          const spot =
            conSueltos && suelto
              ? { x: suelto.x + suelto.w / 2, y: suelto.y + suelto.h / 2 }
              : (cl.keys[i] ?? { x: 0, y: 0 });
          const viva = conSueltos
            ? i < problem.chests.length && i >= opened
            : key !== undefined;
          return (
            <Handle
              key={`k${i}`}
              index={i}
              spot={spot}
              slot={keySlots[i] as Slot}
              w={conSueltos ? (suelto?.w ?? 0) : cl.keyW}
              h={conSueltos ? (suelto?.h ?? 0) : cl.keyH}
              enabled={viva && !solved}
              onDrop={conSueltos ? dropChest : dropKey}
            />
          );
        })}

        {/* Las asas de las máquinas de la tubería. */}
        {Array.from({ length: PIPE_MACHINE_SLOTS }, (_, i) => {
          const b = pl.lanes[0]?.machines[i];
          return (
            <Handle
              key={`m${i}`}
              index={i}
              spot={b ? { x: b.x + b.w / 2, y: b.y + b.h / 2 } : { x: 0, y: 0 }}
              slot={machineSlots[i] as PipeSlot}
              w={b?.w ?? 0}
              h={b?.h ?? 0}
              enabled={usaTuberia && i < machines.length && !solved}
              onDrop={dropMachine}
              onTap={tapMachine}
            />
          );
        })}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* La figura objetivo del último nivel, y los dos órdenes posibles. */}
      {usaFiguras ? <Figures problem={problem} onPick={pickOrder} solved={solved} /> : null}

      {/* Las dos animaciones de `explain`. */}
      {conFichas ? (
        <View style={styles.ring}>
          {Array.from({ length: PREC_OPTION_SLOTS }, (_, i) => {
            const option = problem.options[i];
            if (!option) return <View key={i} style={styles.chipGhost} />;
            const desdeAfuera = option.order[0] === problem.chests[0]?.id;
            return (
              <Pressable
                key={option.id}
                disabled={solved}
                onPress={() => pickOrderExplain(option)}
                style={[styles.chip, solved && styles.chipDim]}
              >
                <OrderToken outward={desdeAfuera} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {level.definition ? <Text style={styles.definition}>{t("prec.definition")}</Text> : null}
    </View>
  );

  /** El toque de una ficha de `explain` corre por el mismo camino que las demás. */
  function pickOrderExplain(option: PrecOption): void {
    if (solved) return;
    quiet();
    // La animación se corre sobre el mismo encastre: se ve el orden que la
    // ficha propone, y después el juego dice qué pasó.
    openedV.value = withTiming(problem.chests.length, { duration: theme.motion.reveal });
    treeV.value = withTiming(problem.chests.length, { duration: theme.motion.reveal });
    attempt(option.correct);
    if (option.correct) {
      succeed("Esa es la que abre al revés: la llave de afuera gira en el vacío porque el hueco está vacío.");
      return;
    }
    setMessage({
      text: "Esa abre desde adentro, que es el orden que sirve para calcular. Se pedía la otra.",
      tone: "warn",
    });
  }
}

/**
 * Las ranuras animadas de las piezas que el dedo puede llevar. Son cuatro y
 * siempre las mismas: montar y desmontar ranuras entre rondas deja al detector
 * de la siguiente sin enganchar, y el arrastre se pierde sin decir nada.
 */
function useSlots(n: number): readonly Slot[] {
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
  const dx4 = useSharedValue(0);
  const dy4 = useSharedValue(0);
  const a4 = useSharedValue(1);
  const dx5 = useSharedValue(0);
  const dy5 = useSharedValue(0);
  const a5 = useSharedValue(1);
  return useMemo(
    () =>
      [
        { dx: dx0, dy: dy0, alive: a0 },
        { dx: dx1, dy: dy1, alive: a1 },
        { dx: dx2, dy: dy2, alive: a2 },
        { dx: dx3, dy: dy3, alive: a3 },
        { dx: dx4, dy: dy4, alive: a4 },
        { dx: dx5, dy: dy5, alive: a5 },
      ].slice(0, n),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n],
  );
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
  readonly slot: Slot | PipeSlot;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, x: number, y: number) => void;
  /** Qué hace un toque sobre la pieza. Sin esto, tocarla no contesta nada. */
  readonly onTap?: (index: number) => void;
}) {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onChange((e) => {
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        // `onFinalize` y no `onEnd`: si otro gesto le gana la carrera a mitad
        // del arrastre, el asa se cancela y `onEnd` no llega nunca, así que la
        // pieza se soltaba en el aire sin que nada contestara.
        .onFinalize((e) => {
          const movido = Math.hypot(e.translationX, e.translationY);
          if (movido < TAP_SLOP) {
            // El dedo se apoyó y se levantó: es un toque, no un arrastre. La
            // pieza vuelve a su lugar y contesta el que sepa contestar toques.
            slot.dx.value = withTiming(0, { duration: theme.motion.quick });
            slot.dy.value = withTiming(0, { duration: theme.motion.quick });
            if (onTap) runOnJS(onTap)(index);
            return;
          }
          // Dónde quedó la pieza, en coordenadas del lienzo. Sale de dónde
          // estaba más cuánto se movió, y no de la posición absoluta del dedo:
          // `onLayout` en web devuelve el origen del padre y dejaría el hit
          // test corrido por la altura del encabezado.
          runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, spot.x, spot.y, index, onDrop, onTap],
  );

  if (w <= 0 || h <= 0) return null;
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - w / 2,
          top: spot.y - h / 2,
          width: w,
          height: h,
          // El asa se queda montada aunque su pieza no juegue esta ronda —
          // desmontarla deja al detector de la siguiente sin enganchar— pero
          // tiene que dejar pasar el dedo: si no, se come los toques del
          // lienzo que hay debajo y el árbol y la fila dejan de contestar.
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

/**
 * La ficha de un orden de apertura: un círculo chico y uno grande con una
 * flecha en el medio. Sin una sola letra, porque el nivel se juega sin leer.
 */
function OrderToken({ outward }: { readonly outward: boolean }) {
  return (
    <View style={styles.orderToken}>
      <View style={outward ? styles.dotBig : styles.dotSmall} />
      <Text style={styles.arrow}>→</Text>
      <View style={outward ? styles.dotSmall : styles.dotBig} />
    </View>
  );
}

/**
 * El último nivel: la figura que hay que conseguir y los dos órdenes posibles.
 * Es la única parte del nodo que se lee, y llega en `formal`, que es donde el
 * diseño lo permite.
 */
function Figures({
  problem,
  onPick,
  solved,
}: {
  readonly problem: PrecProblem;
  readonly onPick: (option: PrecOption) => void;
  readonly solved: boolean;
}) {
  return (
    <View style={styles.figures}>
      <FigureView turn={problem.figure.turn} dots={problem.figure.dots} big />
      <View style={styles.ring}>
        {problem.options.map((option) => (
          <Pressable
            key={option.id}
            disabled={solved}
            onPress={() => onPick(option)}
            style={[styles.chip, solved && styles.chipDim]}
          >
            <View style={styles.orderToken}>
              {option.order.map((id) => (
                <Text key={id} style={styles.lockSign}>
                  {problem.locks.find((l) => l.id === id)?.kind === "turn" ? "↻" : "•"}
                </Text>
              ))}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Un cuadrado girado con sus puntos. El punto dice en qué orden se abrió. */
function FigureView({
  turn,
  dots,
  big,
}: {
  readonly turn: number;
  readonly dots: readonly number[];
  readonly big?: boolean;
}) {
  const lado = big ? 62 : 34;
  return (
    <View style={{ width: lado + 24, height: lado + 24, alignItems: "center", justifyContent: "center" }}>
      <View
        style={[
          styles.figure,
          { width: lado, height: lado, transform: [{ rotate: `${turn * 90}deg` }] },
        ]}
      />
      {dots.map((d, i) => {
        const ang = (d * Math.PI) / 2 - Math.PI / 2;
        return (
          <View
            key={i}
            style={[
              styles.figureDot,
              {
                transform: [
                  { translateX: Math.cos(ang) * (lado * 0.62) },
                  { translateY: Math.sin(ang) * (lado * 0.62) },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/**
 * Qué cofre señaló el dedo.
 *
 * Los cofres son concéntricos, así que gana el más chico que contiene el punto:
 * el territorio propio del de afuera es el anillo que queda entre su pared y la
 * del de adentro. La tolerancia va solo cuando el punto no cayó en ninguno —una
 * mano de cinco años no apunta fino y el borde tiene que perdonar—, porque
 * aplicada a todos le robaría al de afuera el anillo que es suyo.
 */
function chestAt(
  problem: PrecProblem,
  nest: NestLayout,
  x: number,
  y: number,
): string | null {
  const buscar = (holgura: number): string | null => {
    let elegido: string | null = null;
    let mejor = Infinity;
    for (const c of problem.chests) {
      const b = nest.boxes[c.depth];
      if (!b) continue;
      if (x < b.x - holgura || x > b.x + b.w + holgura) continue;
      if (y < b.y - holgura || y > b.y + b.h + holgura) continue;
      if (b.w < mejor) {
        mejor = b.w;
        elegido = c.id;
      }
    }
    return elegido;
  };
  return buscar(0) ?? buscar(26);
}

function openingHint(ask: string): string {
  switch (ask) {
    case "open":
      return "Arrastrá una llave al cofre. Fijate cuál muerde y cuál gira en el vacío.";
    case "nest":
      return "Meté los cofres uno adentro del otro, del más grande al más chico.";
    case "explain":
      return "Tocá la ficha del orden que abre al revés: el que no llega al tesoro.";
    case "recognize":
      return "Tocá el nodo del árbol que es el cofre de más adentro.";
    case "pipe":
      return "Tocá una máquina para cambiar el orden del caño. La bolita tiene que salir de ese tamaño.";
    case "wrap":
      return "Tocá la operación que quedó adentro de las paredes.";
    case "ghost":
      return "Tocá la operación que se calcula primero. Mantené el dedo para ver el cofre que nadie dibujó.";
    case "unwrap":
      return "Ahora el tesoro ya está y el cofre está cerrado. Sacá desde afuera.";
    default:
      return "Estas cerraduras no son números. Elegí el orden que deja la figura así.";
  }
}

function successFor(ask: string): string {
  switch (ask) {
    case "recognize":
      return "Ese es el cofre de más adentro: es el que se abre primero.";
    case "wrap":
      return "Las paredes se volvieron paréntesis, y adentro quedó justo esa operación.";
    default:
      return "Esa se calcula primero, aunque nadie haya dibujado el cofre alrededor.";
  }
}

/** Por qué la llave giró en el vacío. Nada se llama incorrecto. */
function vainHint(
  ask: string,
  elegido: PrecChest | undefined,
  abierto: PrecChest | undefined,
): string {
  if (!elegido || !abierto) return "Esa llave giró en el vacío.";
  if (ask === "unwrap") {
    return "Ese cofre todavía está adentro de otro. ¿Cuál está más afuera?";
  }
  return elegido.depth < abierto.depth
    ? "El hueco de esa tapa está vacío: todavía nadie le trajo nada. ¿Qué cofre tiene el tesoro?"
    : "Ese cofre ya se abrió. Seguí con el que lo contiene.";
}

/** Por qué esa ficha no era. Cada distractor es un error del diseño. */
function lureHint(lure: string | undefined): string {
  switch (lure) {
    case "left_to_right":
      return "Armaste el cofre leyendo de izquierda a derecha. ¿Es el que estaba dibujado?";
    case "neighbor":
      return "Ese es el agrupamiento de al lado. Mirá cuál queda adentro del otro.";
    case "outer_first":
      return "Esa abre desde adentro, que es el orden de calcular. Se pedía la otra.";
    case "paren_operates":
      return "Pusiste un cofre alrededor de todo. ¿Cambió lo que hay adentro?";
    default:
      return "Esa no es. Mirá qué está adentro de qué.";
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
    minWidth: 92,
    height: 66,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  chipGhost: { width: 0, height: 66 },
  chipDim: { opacity: 0.35 },
  keyChip: {
    width: 60,
    height: 52,
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  keySign: { color: theme.color.warn, fontSize: 22 },
  orderToken: { flexDirection: "row", alignItems: "center", gap: 6 },
  arrow: { color: theme.color.inkDim, fontSize: 16 },
  lockSign: { color: theme.color.warn, fontSize: 20, marginHorizontal: 4 },
  dotSmall: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.color.accent },
  dotBig: { width: 20, height: 20, borderRadius: 10, backgroundColor: theme.color.accent },
  figures: { alignItems: "center", gap: theme.space[2] },
  figure: {
    borderWidth: 2,
    borderColor: theme.color.accent,
    borderRadius: 4,
    position: "absolute",
  },
  figureDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.color.ok,
  },
  definition: {
    color: theme.color.inkDim,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 520,
    paddingHorizontal: theme.space[3],
  },
});
