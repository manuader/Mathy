/**
 * Cajas en el libro de cuentas: el minijuego de `prealg.var.unknown_as_box`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: una mano fantasma lleva el primer objeto a una fila y la
 * fila contesta. Los mensajes de abajo son para el adulto que mira.
 *
 * El nodo tiene tres mecánicas y una sola superficie, porque el diseño las pone
 * juntas: el libro en el centro, la balanza a la derecha y el árbol de cofres a
 * la izquierda. `ledger` es la principal y la dibuja `LedgerScene`. `balance` es
 * la del nodo 13 —`BalanceScene`, ensanchada a formas estructurales— colocada
 * en el hueco que el libro le deja. `chest_key` aporta el lugar y no el cofre:
 * lo único que este nodo le pide es la hoja vacía del árbol del nodo 9, y esa
 * hoja la dibuja el libro en su costado.
 *
 * Los gestos, y ninguno fino:
 *
 * - Arrastrar un objeto a una fila. Si comparte forma y marca con los que ya
 *   están, entra y el conteo sube. Si no, la fila lo devuelve con un rebote y
 *   no pasa nada más.
 * - Arrastrar un objeto a una fila vacía. Es la única jugada válida cuando
 *   llega una marca que no estaba.
 * - Arrastrar manzanas al plato libre de la balanza, hasta que la barra queda
 *   derecha. Tocar el plato saca una: pasarse tiene vuelta.
 * - Arrastrar el cajón a la hoja que late. El árbol queda completo aunque el
 *   valor de esa hoja siga sin conocerse.
 *
 * El único error que clasifica es `variable_as_label`, que es el único que el
 * catálogo de L declara sobre este nodo: juntar la fila de una marca con la de
 * otra, que es de dónde sale `5xy`. Dejar una manzana en la fila de las peras
 * es un error y no una idea equivocada sobre las letras: se muestra y no se
 * anota. Abrir una fila nueva para una marca que ya tenía la suya tampoco es un
 * error: recibe un empujón suave y ninguna explicación.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  BOX_ROW_SLOTS,
  BOX_TOKEN_SLOTS,
  NODE_UNKNOWN_BOX,
  TOTAL_BOX_LEVELS,
  boxMisconceptionFor,
  boxRowAccepts,
  generateUnknownBox,
  type BoxKind,
  type BoxLevel,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  LedgerScene,
  ledgerLayout,
  type LedgerConfig,
  type LedgerPlace,
} from "../scenes/LedgerScene.tsx";
import {
  BalanceScene,
  MAX_TILT,
  panZones,
  type BalanceContents,
} from "../scenes/BalanceScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;
/** Cuánto aire tiene alrededor una fila. Una mano de cinco años no apunta fino. */
const ROW_SLOP = 26;
/** La repetición del error va en cámara lenta: es para mirarla, no para pasarla. */
const REPLAY_MS = 1400;

export interface UnknownBoxGameProps {
  readonly level: BoxLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function UnknownBoxGame(props: UnknownBoxGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

/** Dónde quedó un objeto: en el mostrador, en una fila, en el plato o en la hoja. */
const EN_MOSTRADOR = -1;
const EN_PLATO = -2;
const EN_HOJA = -3;
/** Una fila que todavía no es de nadie. Es la que late y la que se puede abrir. */
const SIN_DUENO = -1;

function Activity({ level, onLevelDone, onExit, onEvent }: UnknownBoxGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);

  const problem = useMemo(
    () => generateUnknownBox(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;

  /** Dónde está cada objeto. Una ranura por objeto montado. */
  const [placed, setPlaced] = useState<number[]>(() => vacio(BOX_TOKEN_SLOTS));
  /** Por fila, la clase que la ocupa. La fila sin dueño está vacía y late. */
  const [owner, setOwner] = useState<number[]>(() => sinDueno(BOX_ROW_SLOTS));
  const [counts, setCounts] = useState<number[]>(() => ceros(BOX_ROW_SLOTS));
  /** Cuántas manzanas hay en el plato libre. */
  const [onPan, setOnPan] = useState(0);
  /** La fila que devolvió algo recién, para el rebote. */
  const [bounced, setBounced] = useState(-1);
  /** Las dos filas que la repetición junta. */
  const [replayRows, setReplayRows] = useState<[number, number]>([-1, -1]);

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: apertura(ask, level, 0),
    tone: "dim",
  }));

  const sceneH = Math.max(340, Math.min(height * 0.62, 520));

  // --- Lo que ve la escena ---------------------------------------------------

  const config = useMemo<LedgerConfig>(
    () => ({
      kinds: problem.kinds,
      tokens: problem.tokens,
      skin: level.skin,
      rows: problem.rows,
      owner,
      counts,
      tree: problem.tree,
      leaf: placed.findIndex((p) => p === EN_HOJA) >= 0 ? (problem.tokens[0]?.kind ?? -1) : -1,
      // El libro se dibuja del ancho que pide la fila más larga del problema.
      capacity: Math.max(2, ...problem.kinds.map((k) => k.count)),
      balance: ask === "weigh",
    }),
    [problem, level.skin, owner, counts, placed, ask],
  );

  const layout = useMemo(
    () => ledgerLayout(config, width, sceneH, BOX_ROW_SLOTS, BOX_TOKEN_SLOTS),
    [config, width, sceneH],
  );

  const zones = useMemo(
    () => panZones(Math.max(layout.balance.w, 1), Math.max(layout.balance.h, 1)),
    [layout.balance.w, layout.balance.h],
  );

  /**
   * Los platos. El de los cajones no cambia nunca —la caja está cerrada y sigue
   * cerrada— y el otro lleva lo que el jugador puso. El antes es igual al
   * después porque acá no hay ninguna acción que aplicar: la balanza mide.
   */
  const contents = useMemo<BalanceContents>(() => {
    const w = problem.weigh;
    const izq = { boxes: w ? w.crates : 0, units: 0 };
    const der = { boxes: 0, units: onPan };
    return { leftBefore: izq, rightBefore: der, leftAfter: izq, rightAfter: der, deltaSign: 0 };
  }, [problem.weigh, onPan]);

  const cajon = problem.weigh ? (problem.kinds[problem.weigh.kind] as BoxKind | undefined) : undefined;
  /**
   * Lo que la balanza lee del problema: solo lo que hay adentro de la caja, que
   * es lo que se ve al abrirla. Memoizado porque su identidad es lo que decide
   * si los platos se vuelven a construir.
   */
  const balanceProblem = useMemo(() => ({ solution: cajon?.hidden ?? 0 }), [cajon?.hidden]);

  const places = useMemo<LedgerPlace[]>(
    () =>
      Array.from({ length: BOX_TOKEN_SLOTS }, (_, i) => {
        const token = problem.tokens[i];
        const home = layout.tokens[i] ?? { x: layout.width / 2, y: layout.tray.y };
        if (!token) return { x: home.x, y: home.y, on: false };
        const donde = placed[i] ?? EN_MOSTRADOR;
        if (donde === EN_MOSTRADOR) return { x: home.x, y: home.y, on: true };
        // Colocado: viaja a su destino y se apaga ahí. Lo que queda dibujado es
        // la fila, el plato o la hoja, que ya lo cuentan como suyo.
        return { ...destino(donde, layout, zones, config, i), on: false };
      }),
    [problem.tokens, placed, layout, zones, config],
  );

  // --- Lo que la escena anima ------------------------------------------------

  const dragIdx = useSharedValue(-1);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const pulse = useSharedValue(0);
  const demo = useSharedValue(0);
  const replay = useSharedValue(0);
  const appear = useSharedValue(1);
  const tilt = useSharedValue(0);
  const openness = useSharedValue(0);
  // Los valores que la balanza del nodo 13 mueve con la llave y esta medición
  // no usa. Están quietos: la escena los lee igual y no cuesta nada.
  const leftPan = useSharedValue(0);
  const rightPan = useSharedValue(0);
  const balanceAppear = useSharedValue(0);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const [snap, setSnap] = useState(-1);

  /**
   * El mostrador, en una referencia, y el estado de React como espejo.
   *
   * Dos objetos soltados en el mismo cuadro se resolvían los dos contra el
   * estado viejo: el segundo volvía a abrir la fila que el primero acababa de
   * abrir y su conteo arrancaba de nuevo en uno, así que el libro quedaba con
   * un objeto menos del que había anotado. Las decisiones se toman sobre la
   * referencia, que ya vio el movimiento anterior, y el estado solo dibuja.
   */
  const mesa = useRef({
    owner: sinDueno(BOX_ROW_SLOTS),
    counts: ceros(BOX_ROW_SLOTS),
    placed: vacio(BOX_TOKEN_SLOTS),
    onPan: 0,
  });

  /** Lleva la mesa a la pantalla. Copia las listas: React compara identidades. */
  const espejar = useCallback(() => {
    setOwner([...mesa.current.owner]);
    setCounts([...mesa.current.counts]);
    setPlaced([...mesa.current.placed]);
    setOnPan(mesa.current.onPan);
  }, []);

  /**
   * El estado que los gestos necesitan, en una referencia.
   *
   * Un worklet captura el cierre del render en que se armó el gesto, así que
   * todo lo que un `runOnJS` lea del cierre sería lo de la primera ronda para
   * siempre. Acá se lee de la referencia y siempre se ve lo de ahora.
   */
  const vivo = useRef({ problem, level, solved });
  vivo.current = { problem, level, solved };

  const roundRef = useRef(round);
  roundRef.current = round;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setSolved(false);
    setSnap(-1);
    setBounced(-1);
    setReplayRows([-1, -1]);
    // La balanza y el árbol llegan con el libro ya escrito: el jugador llenó
    // esas filas en los niveles anteriores y lo que se pregunta ahora es otra
    // cosa. En las rondas de ordenar, el libro empieza vacío.
    const prellenado = problem.ask !== "sort";
    mesa.current = {
      owner: Array.from({ length: BOX_ROW_SLOTS }, (_, i) =>
        prellenado && i < problem.kinds.length ? i : SIN_DUENO,
      ),
      counts: Array.from({ length: BOX_ROW_SLOTS }, (_, i) =>
        prellenado ? (problem.kinds[i]?.count ?? 0) : 0,
      ),
      placed: vacio(BOX_TOKEN_SLOTS),
      onPan: 0,
    };
    espejar();
    setMessage({ text: apertura(problem.ask, level, roundRef.current), tone: "dim" });

    // El plato de los cajones arranca abajo: todavía no hay nada del otro lado,
    // y la barra tiene que decirlo antes de que el jugador toque nada.
    tilt.value = problem.weigh ? -MAX_TILT : 0;
    openness.value = 0;
    replay.value = 0;
    balanceAppear.value = withTiming(problem.ask === "weigh" ? 1 : 0, {
      duration: theme.motion.base,
    });

    // El latido no es un adorno: es lo único que dice dónde se puede jugar.
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    // La mano lleva un objeto del mostrador a una fila: es la demostración del
    // libro y no dice nada de la balanza ni del árbol, que tienen la suya.
    demo.value =
      problem.ask === "sort"
        ? withRepeat(
            withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
            -1,
            false,
          )
        : 0;
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(demo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, espejar]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_UNKNOWN_BOX, layer: level.layer });
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
          node: NODE_UNKNOWN_BOX,
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
  }, [demo]);

  const nextRound = useCallback(() => {
    const r = roundRef.current;
    if (r + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_UNKNOWN_BOX, level: level.n });
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
      // La ronda que abre el cajón necesita más tiempo: lo que se comprueba es
      // que adentro había lo que la balanza dijo, y eso hay que verlo.
      setTimeout(nextRound, vivo.current.problem.ask === "weigh" ? 3200 : 1800);
    },
    [nextRound, quiet],
  );

  // --- El libro --------------------------------------------------------------

  /**
   * La repetición en cámara lenta. Las dos filas se acercan, y en el contacto
   * las cajas vuelven a mostrar su dibujo: se ve que no son iguales y las filas
   * se separan solas con sus conteos. Es el patrón `replay_on_mechanic` del
   * catálogo, y reemplaza al cartel que diría "mal".
   */
  const replayError = useCallback(
    (rowA: number, rowB: number) => {
      setReplayRows([rowA, rowB]);
      replay.value = withSequence(
        withTiming(1, { duration: REPLAY_MS }),
        withDelay(500, withTiming(0, { duration: REPLAY_MS * 0.6 })),
      );
      setTimeout(() => setReplayRows([-1, -1]), REPLAY_MS * 2.4);
    },
    [replay],
  );

  /** Anota el objeto en su lugar y, si el libro quedó completo, cierra la ronda. */
  const acomodar = useCallback(
    (index: number, row: number) => {
      mesa.current.placed[index] = row;
      espejar();
      const faltan = vivo.current.problem.tokens.filter(
        (_, i) => (mesa.current.placed[i] ?? EN_MOSTRADOR) === EN_MOSTRADOR,
      ).length;
      if (faltan === 0) {
        succeed("Cada cosa quedó en su fila, y el conteo dice cuántas hay de cada una.");
      }
    },
    [espejar, succeed],
  );

  /** El objeto llegó a una fila. Toda la regla del libro está acá. */
  const dropOnRow = useCallback(
    (index: number, row: number) => {
      const v = vivo.current;
      const token = v.problem.tokens[index];
      const m = mesa.current;
      if (!token || v.solved || (m.placed[index] ?? EN_MOSTRADOR) !== EN_MOSTRADOR) return;
      const clase = v.problem.kinds[token.kind];
      const dueno = m.owner[row] ?? SIN_DUENO;
      quiet();
      setSnap(index);

      if (dueno === SIN_DUENO) {
        // Abrir fila nueva. Si la marca ya tenía la suya al lado, el libro no se
        // rompe: recibe un empujón suave y ninguna explicación, que es lo que
        // pide el diseño para un movimiento válido pero inútil.
        if (m.owner.includes(token.kind)) {
          setBounced(row);
          setTimeout(() => setBounced(-1), 400);
          setMessage({ text: "Esa marca ya tiene su fila, un poco más arriba.", tone: "dim" });
          return;
        }
        m.owner[row] = token.kind;
        m.counts[row] = 1;
        acomodar(index, row);
        attempt(true);
        setMessage({
          text: "Fila nueva para esa marca. Es la única jugada que el libro acepta.",
          tone: "dim",
        });
        return;
      }

      const fila = v.problem.kinds[dueno];
      if (boxRowAccepts(fila, clase)) {
        m.counts[row] = (m.counts[row] ?? 0) + 1;
        acomodar(index, row);
        attempt(true);
        setMessage({ text: "Entró en su fila. El conteo dice cuántas van.", tone: "dim" });
        return;
      }

      // La fila devuelve lo que no corresponde, sin cartel.
      setBounced(row);
      setTimeout(() => setBounced(-1), 400);
      const error = boxMisconceptionFor(fila, clase);
      attempt(false, error);
      if (error) {
        const propia = m.owner.indexOf(token.kind);
        replayError(row, propia >= 0 ? propia : row);
        setMessage({
          text: "Estas cajas no tienen la misma marca. ¿Cuántas hay de cada una?",
          tone: "warn",
        });
        return;
      }
      setMessage({ text: "Esa fila no es de esa clase: la devolvió.", tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, replayError],
  );

  // --- La balanza ------------------------------------------------------------

  /** Cuánto se inclina la barra con lo que hay puesto. Cero es derecha. */
  const inclinar = useCallback(
    (puestas: number, target: number) => {
      const k = Math.max(1, target);
      const d = Math.max(-1, Math.min(1, (puestas - target) / k));
      tilt.value = withTiming(d * MAX_TILT, { duration: theme.motion.base });
    },
    [tilt],
  );

  const dropOnPan = useCallback(
    (index: number) => {
      const v = vivo.current;
      const w = v.problem.weigh;
      const m = mesa.current;
      if (!w || v.solved || (m.placed[index] ?? EN_MOSTRADOR) !== EN_MOSTRADOR) return;
      quiet();
      setSnap(index);
      const puestas = m.onPan + 1;
      m.onPan = puestas;
      m.placed[index] = EN_PLATO;
      espejar();
      inclinar(puestas, w.target);
      // Poner una manzana más no es contestar mal: es ir llegando. Lo que se
      // anota es la barra derecha y el pasarse, que sí son respuestas.
      if (puestas >= w.target) attempt(puestas === w.target);
      if (puestas === w.target) {
        // La barra quedó derecha: recién ahí se abre el cajón, y lo que hay
        // adentro es lo que la balanza ya había dicho.
        openness.value = withDelay(420, withTiming(1, { duration: theme.motion.reveal }));
        succeed("La barra quedó derecha. Eso pesa un cajón, y nadie lo abrió para saberlo.");
        return;
      }
      setMessage({
        text:
          puestas > w.target
            ? "Se pasó: la barra cayó del lado de la fruta. Tocá el plato para sacar una."
            : "Todavía pesan más los cajones. Seguí poniendo fruta.",
        tone: puestas > w.target ? "warn" : "dim",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, inclinar, quiet, succeed],
  );

  /** Un toque en el plato saca una manzana: pasarse tiene vuelta. */
  const takeFromPan = useCallback(() => {
    const v = vivo.current;
    const w = v.problem.weigh;
    const m = mesa.current;
    if (!w || v.solved || m.onPan <= 0) return;
    const i = m.placed.lastIndexOf(EN_PLATO);
    if (i < 0) return;
    m.onPan -= 1;
    m.placed[i] = EN_MOSTRADOR;
    espejar();
    inclinar(m.onPan, w.target);
    setMessage({ text: "Sacaste una del plato. La barra vuelve a contestar.", tone: "dim" });
  }, [espejar, inclinar]);

  // --- El árbol --------------------------------------------------------------

  const dropOnTree = useCallback(
    (index: number, node: number) => {
      const v = vivo.current;
      const n = v.problem.tree[node];
      if (!n || v.solved) return;
      quiet();
      attempt(n.unknown);
      if (!n.unknown) {
        setMessage({
          text:
            n.op !== null
              ? "Ahí no hay hoja: eso junta dos cosas. La caja va donde falta un número."
              : "Esa hoja ya tiene su número. La caja va donde no se sabe cuánto hay.",
          tone: "warn",
        });
        return;
      }
      setSnap(index);
      mesa.current.placed[index] = EN_HOJA;
      espejar();
      succeed("El árbol quedó completo, y todavía nadie sabe cuánto hay en esa caja.");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, quiet, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que el gesto necesita, en un solo `SharedValue`.
   *
   * El `Gesture` se arma una sola vez y no cambia de identidad entre renders,
   * por dos razones que ya costaron caro: gesture-handler en web pierde el
   * gesto cuando el objeto cambia, y un worklet captura el cierre del render en
   * que se armó, así que la geometría leída del cierre sería la de la primera
   * ronda para siempre.
   */
  const geo = useSharedValue({
    activo: 0,
    /** Qué contesta soltar: 1 el libro, 2 la balanza, 3 el árbol. */
    modo: 1,
    tomado: -1,
    desdeX: 0,
    desdeY: 0,
    radio: 24,
    tokens: [] as { i: number; x: number; y: number }[],
    rows: [] as { x: number; y: number; w: number; h: number }[],
    panX: 0,
    panY: 0,
    panR: 0,
    nodes: [] as { x: number; y: number }[],
    nodeR: 0,
  });

  useEffect(() => {
    geo.value = {
      // Qué se puede tocar es parte de la geometría y no del objeto del gesto:
      // deshabilitarlo con `.enabled()` lo obligaría a cambiar de identidad.
      activo: solved ? 0 : 1,
      modo: ask === "weigh" ? 2 : ask === "leaf" ? 3 : 1,
      tomado: -1,
      desdeX: 0,
      desdeY: 0,
      radio: Math.max(22, layout.unit * 2.4),
      tokens: places
        .map((p, i) => ({ i, x: p.x, y: p.y, on: p.on }))
        .filter((p) => p.on)
        .map((p) => ({ i: p.i, x: p.x, y: p.y })),
      rows: layout.rows.slice(0, problem.rows).map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })),
      panX: layout.balance.x + zones.rightX,
      panY: layout.balance.y + zones.y,
      panR: zones.radius,
      nodes: layout.nodes.map((n) => ({ x: n.x, y: n.y })),
      nodeR: layout.nodeR * 1.6,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, layout, zones, ask, solved, problem.rows]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => {
          const g = geo.value;
          let tomado = -1;
          let mejor = g.radio;
          for (const tk of g.tokens) {
            const d = Math.hypot(e.x - tk.x, e.y - tk.y);
            if (d < mejor) {
              mejor = d;
              tomado = tk.i;
            }
          }
          geo.value = { ...g, tomado: g.activo ? tomado : -1, desdeX: e.x, desdeY: e.y };
          dragIdx.value = g.activo ? tomado : -1;
          dragX.value = 0;
          dragY.value = 0;
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
          geo.value = { ...g, tomado: -1 };
          dragIdx.value = -1;
          dragX.value = withTiming(0, { duration: theme.motion.base });
          dragY.value = withTiming(0, { duration: theme.motion.base });
          if (!g.activo) return;

          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          if (idx < 0) {
            // Un toque sobre el plato saca una manzana. Es el único toque del
            // juego, y solo existe donde hay algo que deshacer.
            if (g.modo === 2 && movido < TAP_SLOP) {
              if (Math.hypot(e.x - g.panX, e.y - g.panY) < g.panR) runOnJS(takeFromPan)();
            }
            return;
          }

          if (g.modo === 2) {
            if (Math.hypot(e.x - g.panX, e.y - g.panY) < g.panR) runOnJS(dropOnPan)(idx);
            return;
          }
          if (g.modo === 3) {
            for (let i = 0; i < g.nodes.length; i++) {
              const n = g.nodes[i];
              if (n && Math.hypot(e.x - n.x, e.y - n.y) < g.nodeR) {
                runOnJS(dropOnTree)(idx, i);
                return;
              }
            }
            return;
          }
          for (let i = 0; i < g.rows.length; i++) {
            const r = g.rows[i];
            if (!r) continue;
            if (
              e.x > r.x - ROW_SLOP * 2 &&
              e.x < r.x + r.w + ROW_SLOP &&
              e.y > r.y - ROW_SLOP * 0.4 &&
              e.y < r.y + r.h + ROW_SLOP * 0.4
            ) {
              runOnJS(dropOnRow)(idx, i);
              return;
            }
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_UNKNOWN_BOX}.name`)} · nivel ${level.n} de ${TOTAL_BOX_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: el libro y la balanza viven adentro, y
            la que no juega esta ronda se queda en opacidad cero. */}
        <Canvas style={{ width, height: sceneH }}>
          <LedgerScene
            config={config}
            layout={layout}
            places={places}
            round={round}
            snap={snap}
            dragIdx={dragIdx}
            dragX={dragX}
            dragY={dragY}
            pulse={pulse}
            demo={demo}
            replay={replay}
            replayRows={replayRows}
            bounced={bounced}
            appear={appear}
          />
          <Group
            transform={[
              { translateX: layout.balance.x },
              { translateY: layout.balance.y },
            ]}
          >
            <BalanceScene
              problem={balanceProblem}
              unknownLeft
              style="concrete"
              width={Math.max(layout.balance.w, 1)}
              height={Math.max(layout.balance.h, 1)}
              left={leftPan}
              right={rightPan}
              appear={balanceAppear}
              contents={contents}
              tilt={tilt}
              openness={openness}
              brooch={false}
            />
          </Group>
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={pan}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>
      </View>

      <Hint text={message.text} tone={message.tone} />

      {level.definition ? (
        <Text style={styles.definition}>{DEFINICION[round % DEFINICION.length]}</Text>
      ) : null}
    </View>
  );
}

const vacio = (n: number): number[] => Array.from({ length: n }, () => EN_MOSTRADOR);
const sinDueno = (n: number): number[] => Array.from({ length: n }, () => SIN_DUENO);
const ceros = (n: number): number[] => Array.from({ length: n }, () => 0);

/**
 * Dónde va a parar un objeto colocado. No es donde se queda dibujado —eso lo
 * dibuja la fila, el plato o la hoja—, sino adónde viaja antes de apagarse.
 */
function destino(
  donde: number,
  layout: ReturnType<typeof ledgerLayout>,
  zones: ReturnType<typeof panZones>,
  config: LedgerConfig,
  index: number,
): { x: number; y: number } {
  if (donde === EN_PLATO) {
    return { x: layout.balance.x + zones.rightX, y: layout.balance.y + zones.y };
  }
  if (donde === EN_HOJA) {
    const i = config.tree.findIndex((n) => n.unknown);
    const s = i >= 0 ? layout.nodes[i] : undefined;
    return s ?? { x: layout.width / 2, y: layout.height / 2 };
  }
  const box = layout.rows[donde];
  if (!box) return { x: layout.width / 2, y: layout.height / 2 };
  const cuantos = config.counts[donde] ?? 1;
  return {
    x: box.x + 14 + Math.max(0, cuantos - 0.5) * layout.slotW,
    y: box.y + box.h / 2,
  };
}

/** Las tres frases de la capa formal, de a una por ronda. */
const DEFINICION: readonly string[] = [
  "Una incógnita es una cantidad que no conocemos y que no cambia mientras dure el problema.",
  "Una letra es su nombre.",
  "Dos letras iguales nombran la misma cantidad; dos letras distintas pueden nombrar la misma o no.",
];

function apertura(ask: string, level: BoxLevel, round: number): string {
  if (ask === "weigh") {
    return "Poné fruta en el plato libre hasta que la barra quede derecha. Nadie abre el cajón.";
  }
  if (ask === "leaf") {
    return "Al árbol le falta un número y nadie sabe cuál. Llevá la caja a esa hoja.";
  }
  if (level.arbitrary) {
    // La definición ya se lee abajo: acá va lo que hay que hacer, y nada más.
    return "Agrupá lo que se repite. Cada figura tiene su nombre, y la letra es ese nombre.";
  }
  if (level.skin === "chips") {
    return "El conteo va adelante de la letra. Juntá solo lo que se junta.";
  }
  if (level.params.marks > 0) {
    return "El cajón cerrado también es una fila. Llevá cada cosa a la suya.";
  }
  return "Llevá cada cosa a la fila que le corresponde.";
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
  definition: {
    color: theme.color.inkDim,
    fontSize: 12,
    maxWidth: 520,
    textAlign: "center",
  },
});
