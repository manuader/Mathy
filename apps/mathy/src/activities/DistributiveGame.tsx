/**
 * Dos habitaciones: el minijuego de `alg.expr.distributive_tiles`.
 *
 * Un chico que no lee tiene que poder empezarlo. Por eso no hay ninguna
 * instrucción escrita en las capas concretas: una mano fantasma lleva la
 * primera tira al marco y el objeto contesta. Los mensajes de abajo son para el
 * adulto que mira.
 *
 * El nodo no estrena ninguna escena. El piso es `TilesScene` —la del nodo 5,
 * que ya traía el corte de la base pensado para esto— con las habitaciones
 * puestas: la pared cae donde el problema la parte, cada tramo lleva su llave y
 * las dos escrituras ocupan el mismo renglón. El libro es `LedgerScene` —la del
 * nodo 10, que nace sin dueño y toma una configuración— corrida al costado
 * derecho, con las tres piezas de `tiles` agregadas a su repertorio de formas.
 *
 * De qué problema nace el paréntesis: de que el mismo piso se puede contar de
 * dos maneras y las dos tienen que dar lo mismo. Con la pared puesta hay un
 * ancho y un largo compuesto, y para escribirlo hace falta algo que diga "esto
 * de acá adentro es un solo largo": eso es el paréntesis. Al sacar la pared el
 * piso se parte en bloques, cada bloque se escribe solo y el paréntesis no hace
 * falta. El símbolo aparece porque sin él la escritura mentiría, y no porque
 * toque.
 *
 * Los gestos, y ninguno fino:
 *
 * - Arrastrar una tira al marco. Si mide lo que esa habitación pide, entra y la
 *   columna del libro sube. Si no, el marco se resiste y la devuelve.
 * - Tocar la pared. La saca o la pone. El piso no cambia de tamaño, el contador
 *   de superficie no se mueve, y las dos escrituras se cruzan en el renglón.
 * - Arrastrar la ficha de un bloque a su columna del libro.
 * - Tocar una ficha entre varias, que es como se contestan reconocer,
 *   explicar, generalizar y el cuadrado.
 * - Tocar el producto para que aparezca el piso, cuando ya no está dibujado.
 *
 * Los dos errores que clasifican son los dos que el catálogo de L declara sobre
 * este nodo: `variable_as_label` cuando se apilan dos piezas de forma distinta,
 * con la repetición corriendo en el libro, y `distribute_over_wrong_op` cuando
 * se reparte sobre un cuadrado o sobre un producto, con el patrón
 * `missing_piece_tiles` colocando las piezas que el jugador nombró y dejando
 * parpadear los dos rectángulos que faltan. Todo lo demás se muestra y no se
 * anota.
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
  DIST_COLUMN_SLOTS,
  DIST_OPTION_SLOTS,
  DIST_TRAY_SLOTS,
  NODE_DISTRIBUTIVE_TILES,
  TOTAL_DIST_LEVELS,
  distAreaTerms,
  distDropMisconceptionFor,
  distFits,
  distFolded,
  distMisconceptionFor,
  generateDistributive,
  type DistColumn,
  type DistForm,
  type DistLevel,
  type DistOption,
  type DistPiece,
  type DistRoom,
  type DistTerm,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TilesScene,
  tilesLayout,
  type RowSlot,
  type TilesConfig,
} from "../scenes/TilesScene.tsx";
import { LedgerScene, ledgerLayout, type LedgerConfig } from "../scenes/LedgerScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** El signo menos del atlas. El guion de ASCII no está y deja un hueco. */
const MENOS = "−";
/** Cuánto aire tiene alrededor una habitación. Una mano de cinco años no apunta fino. */
const HOLGURA = 0.6;
/** La repetición del error va en cámara lenta: es para mirarla, no para pasarla. */
const REPLAY_MS = 1300;

export interface DistributiveGameProps {
  readonly level: DistLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function DistributiveGame(props: DistributiveGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

// --- La notación -------------------------------------------------------------

/** Un término escrito. La yuxtaposición es la convención que el nodo estrena. */
function termText(term: DistTerm): string {
  const magnitud = Math.abs(term.coef);
  return `${magnitud === 1 && term.letters !== "" ? "" : magnitud}${term.letters}`;
}

/** Una suma escrita, con el menos del atlas y no con el guion. */
function sumText(terms: readonly DistTerm[]): string {
  let out = "";
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i] as DistTerm;
    if (i === 0) out += (term.coef < 0 ? MENOS : "") + termText(term);
    else out += (term.coef < 0 ? ` ${MENOS} ` : " + ") + termText(term);
  }
  return out;
}

/** Una escritura entera: la suma, el producto o los dos paréntesis pegados. */
export function distFormText(form: DistForm): string {
  if (form.kind === "sum") return sumText(form.head);
  if (form.kind === "product") return `${sumText(form.head)}(${sumText(form.tail)})`;
  return `(${sumText(form.head)})(${sumText(form.tail)})`;
}

/** La forma con la que el libro dibuja cada pieza de `tiles`. */
const shapeGlyph = (shape: string): string =>
  shape === "x_strip" ? "tile_strip" : shape === "x_square" ? "tile_square" : "tile_unit";

function Activity({ level, onLevelDone, onExit, onEvent }: DistributiveGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);

  const problem = useMemo(
    () => generateDistributive(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;

  /** Cuántas tiras entraron en cada habitación. */
  const [strips, setStrips] = useState<readonly number[]>([0, 0]);
  /** Qué piezas de la bandeja ya se usaron. */
  const [used, setUsed] = useState<readonly number[]>([]);
  /** La pared está afuera: el piso se lee como suma. */
  const [wallOut, setWallOut] = useState(false);
  /** Cuántas fichas se tocaron o colocaron bien. */
  const [taken, setTaken] = useState<readonly string[]>([]);
  /** Por bloque, cuántas piezas anotó el libro. */
  const [filled, setFilled] = useState<readonly number[]>([]);
  /** La fila que devolvió algo recién, para el rebote. */
  const [bounced, setBounced] = useState(-1);
  /** Las dos filas que la repetición junta. */
  const [replayRows, setReplayRows] = useState<[number, number]>([-1, -1]);
  /** El patrón `missing_piece_tiles` está corriendo: faltan los dos rectángulos. */
  const [missing, setMissing] = useState(false);

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: apertura(ask),
    tone: "dim",
  }));

  const sceneH = Math.max(340, Math.min(height * 0.6, 500));
  // El libro va a la derecha y el piso se queda con el resto, que es la
  // disposición que pide el documento: marco al centro, bandeja abajo, libro al
  // costado.
  const ledgerW = level.ledger ? Math.min(Math.max(width * 0.32, 200), 300) : 0;
  const tilesW = Math.max(240, width - ledgerW);

  // --- Lo que ven las escenas ------------------------------------------------

  const cols = problem.rooms.reduce((s, r) => s + r.cells, 0);
  const cutAt = problem.rooms[0]?.cells ?? 0;
  /**
   * El piso se puede dibujar. Con un ancho negativo o una resta adentro no:
   * una habitación no puede medir menos que nada, y ahí la prótesis del hueco
   * recortado deja de tener sentido físico. Es el punto donde el diseño retira
   * las baldosas.
   */
  const drawable =
    problem.width.every((w) => w.coef > 0) && problem.rooms.every((r) => r.length.coef > 0);

  const tilesCfg = useMemo<TilesConfig>(
    () => ({
      rows: problem.widthCells,
      cols,
      frameRows: problem.widthCells,
      frameCols: cols,
      skin: level.floorSkin,
      frame: drawable,
      loose: problem.tray.map((p) => ({
        id: p.id,
        cells: p.cells,
        tall: p.tall,
        // La tira de largo desconocido es una sola pieza: dibujada en celdas se
        // podría contar, y contarla es exactamente lo que no se puede.
        solid: p.shape !== "unit",
      })),
      cut: 2,
      total: problem.area,
      keys: drawable,
      onDemand: level.floor === "onDemand",
      rooms: {
        at: cutAt,
        wall: problem.rooms.length > 1,
        spans: problem.rooms.map((r) => ({ cells: r.cells, label: sumText([r.length]) })),
        side: sumText(problem.width),
        product: distFormText(problem.product),
        sum: distFormText(problem.sum),
      },
    }),
    [problem, level.floorSkin, level.floor, cols, cutAt, drawable],
  );

  const tl = useMemo(
    () => tilesLayout(tilesCfg, tilesW, sceneH, DIST_TRAY_SLOTS),
    [tilesCfg, tilesW, sceneH],
  );

  /**
   * Las columnas visibles. Con la pared puesta el libro las junta cuando cuentan
   * la misma forma, y con la pared afuera hay una por bloque. Esa es la segunda
   * mitad del nodo: `2x + 3x` se junta y `2x + 3` no, y el libro lo dice sin que
   * nadie lo escriba.
   */
  const visibles = useMemo<readonly DistColumn[]>(
    () => (wallOut ? problem.columns : distFolded(problem.columns)),
    [wallOut, problem.columns],
  );

  /** Las clases del libro: una por forma y marca, sin repetir. */
  const kinds = useMemo(() => {
    const out: { shape: string; letter: string }[] = [];
    for (const c of problem.columns) {
      if (!out.some((k) => k.shape === c.shape && k.letter === c.letter)) {
        out.push({ shape: c.shape, letter: c.letter });
      }
    }
    return out;
  }, [problem.columns]);

  /** Cuánto anotó cada columna visible, plegando lo que el jugador puso. */
  const counts = useMemo(() => {
    if (wallOut) return problem.columns.map((_, i) => filled[i] ?? 0);
    const out: number[] = [];
    for (let i = 0; i < problem.columns.length; i++) {
      const c = problem.columns[i] as DistColumn;
      const j = visibles.findIndex((v) => v.shape === c.shape && v.letter === c.letter);
      out[j] = (out[j] ?? 0) + (filled[i] ?? 0);
    }
    return visibles.map((_, i) => out[i] ?? 0);
  }, [wallOut, problem.columns, visibles, filled]);

  const ledgerCfg = useMemo<LedgerConfig>(
    () => ({
      kinds: kinds.map((k) => ({
        shape: shapeGlyph(k.shape),
        mark: -1,
        // La pieza de largo desconocido se traza y no se rellena: es la caja
        // cerrada del nodo 10 con otra forma.
        closed: k.shape !== "unit",
        letter: k.letter,
      })),
      tokens: [],
      skin: level.ledgerSkin,
      rows: visibles.length,
      owner: visibles.map((v) => kinds.findIndex((k) => k.shape === v.shape && k.letter === v.letter)),
      counts,
      tree: [],
      leaf: -1,
      capacity: Math.max(2, ...problem.columns.map((c) => c.count)),
      balance: false,
      // El nodo trae su propia bandeja: la del libro sería un mostrador donde
      // nunca se apoya nada.
      counter: false,
    }),
    [kinds, level.ledgerSkin, visibles, counts, problem.columns],
  );

  const ll = useMemo(
    () => ledgerLayout(ledgerCfg, Math.max(ledgerW, 1), sceneH, DIST_COLUMN_SLOTS, 0),
    [ledgerCfg, ledgerW, sceneH],
  );

  // --- Lo que las escenas animan --------------------------------------------

  const placed = useSharedValue(0);
  const placedRight = useSharedValue(0);
  const spin = useSharedValue(0);
  const split = useSharedValue(0);
  const keys = useSharedValue(0);
  const cross = useSharedValue(0);
  const token = useSharedValue(0);
  const ghost = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const tilesAppear = useSharedValue(0);
  const ledgerAppear = useSharedValue(0);
  const pulse = useSharedValue(0);
  const replay = useSharedValue(0);
  const dragIdx = useSharedValue(-1);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const rows: RowSlot[] = [useSlot(), useSlot(), useSlot(), useSlot(), useSlot(), useSlot()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);

  /**
   * Lo que los gestos necesitan saber, en una referencia.
   *
   * El gesto de una tira lo construye `GestureDetector`, que no siempre adopta
   * la función nueva en el mismo cuadro en que el estado cambia; con el estado
   * capturado en el cierre, la segunda tira se soltaba contra una cuenta vieja
   * y no se sumaba. Acá la cuenta vive en una referencia y el gesto lee siempre
   * la de ahora. Es la misma trampa que ya pagaron los nodos 5 y 10.
   */
  const mesa = useRef({
    strips: [0, 0] as number[],
    used: [] as number[],
    filled: [] as number[],
    taken: [] as string[],
    wallOut: false,
    missing: false,
    toggles: 0,
  });

  const espejar = useCallback(() => {
    setStrips([...mesa.current.strips]);
    setUsed([...mesa.current.used]);
    setFilled([...mesa.current.filled]);
    setTaken([...mesa.current.taken]);
    setWallOut(mesa.current.wallOut);
    setMissing(mesa.current.missing);
  }, []);

  const vivo = useRef({ problem, level, solved });
  vivo.current = { problem, level, solved };
  const roundRef = useRef(round);
  roundRef.current = round;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setSolved(false);
    setBounced(-1);
    setReplayRows([-1, -1]);

    // Las rondas que no se cubren llegan con el piso puesto y el libro escrito:
    // lo que se pregunta ahí es otra cosa.
    const cubierto = problem.ask !== "cover" && problem.ask !== "square";
    mesa.current = {
      strips: problem.rooms.map(() => (cubierto ? problem.widthCells : 0)),
      used: [],
      filled: problem.columns.map((c) => (cubierto && problem.ask !== "tally" && problem.ask !== "expand" ? c.count : 0)),
      taken: [],
      wallOut: !problem.wallIn,
      missing: false,
      toggles: 0,
    };
    espejar();
    setMessage({ text: apertura(problem.ask), tone: "dim" });

    placed.value = cubierto ? problem.widthCells : 0;
    placedRight.value = cubierto ? problem.widthCells : 0;
    spin.value = 0;
    split.value = problem.wallIn ? 0 : 1;
    token.value = problem.area !== null && cubierto ? 1 : 0;
    // Las llaves y el renglón llegan con el marco ya cerrado en las rondas que
    // no se cubren; en las que sí, nacen al cerrarlo.
    keys.value = cubierto ? 1 : 0;
    cross.value = cubierto ? 1 : 0;
    ghost.value = level.floor === "onDemand" ? 0 : 1;
    replay.value = 0;
    tilesAppear.value = withTiming(1, { duration: theme.motion.base });
    ledgerAppear.value = withTiming(level.ledger ? 1 : 0, { duration: theme.motion.base });

    for (let i = 0; i < DIST_TRAY_SLOTS; i++) {
      const slot = rows[i] as RowSlot;
      slot.dx.value = 0;
      slot.dy.value = 0;
      // Las piezas del cuadrado esperan en la bandeja y no se ven hasta que el
      // error las llama: mostrarlas antes sería decir la respuesta.
      slot.alive.value =
        i < problem.tray.length && problem.ask !== "square" ? 1 : 0;
    }

    // El latido y la mano fantasma no son adornos: son la única instrucción.
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value =
      problem.ask === "cover"
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
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_DISTRIBUTIVE_TILES, layer: level.layer });
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
          node: NODE_DISTRIBUTIVE_TILES,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_DISTRIBUTIVE_TILES, level: level.n });
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
      setTimeout(nextRound, 1900);
    },
    [nextRound, quiet],
  );

  // --- La pared --------------------------------------------------------------

  /**
   * El corazón del nodo. La pared sale y el piso se parte en bloques; la pared
   * vuelve y los bloques se juntan. El marco no cambia de tamaño y el contador
   * de superficie no se mueve: es el mismo piso contado de dos maneras, y por
   * eso las dos escrituras valen lo mismo.
   */
  const toggleWall = useCallback(() => {
    const v = vivo.current;
    const m = mesa.current;
    if (v.solved) return;
    const cerrado = m.strips.every((s) => s >= v.problem.widthCells);
    if (!cerrado) {
      setMessage({ text: "Primero cubrí el piso: la pared se saca cuando el marco cierra.", tone: "dim" });
      return;
    }
    quiet();
    m.wallOut = !m.wallOut;
    m.toggles += 1;
    espejar();
    split.value = withTiming(m.wallOut ? 1 : 0, { duration: theme.motion.morph });
    attempt(true);

    const faltan = v.problem.picks - m.toggles;
    if (v.problem.ask === "cover" || faltan <= 0) {
      succeed(
        m.wallOut
          ? "El mismo piso, partido en dos bloques. Las dos escrituras miden lo mismo."
          : "La pared volvió y los dos bloques son otra vez un solo piso.",
      );
      return;
    }
    setMessage({
      text: m.wallOut
        ? "Repartido. Ahora volvé a poner la pared: la igualdad vale para los dos lados."
        : "Juntado. Sacala de nuevo para verlo repartido.",
      tone: "dim",
    });
  }, [attempt, espejar, quiet, split, succeed]);

  /** El piso que ya no está dibujado se pide con un toque sobre el producto. */
  const summonFloor = useCallback(() => {
    if (level.floor !== "onDemand") return;
    if (!drawable) {
      setMessage({
        text: "Ese piso no se puede dibujar: una habitación no mide menos que nada.",
        tone: "dim",
      });
      return;
    }
    ghost.value = withTiming(1, { duration: theme.motion.base });
    setMessage({ text: "Ahí está el piso. El ancho cubre todos los largos.", tone: "dim" });
  }, [level.floor, drawable, ghost]);

  // --- Las baldosas ----------------------------------------------------------

  /**
   * La repetición en cámara lenta del error. Las dos columnas se acercan, y en
   * el contacto se ve que no cuentan la misma forma. Es el patrón
   * `replay_on_mechanic` del catálogo corriendo sobre el libro, y reemplaza al
   * cartel que diría "mal".
   */
  const replayError = useCallback(
    (a: number, b: number) => {
      setReplayRows([a, b]);
      replay.value = withSequence(
        withTiming(1, { duration: REPLAY_MS }),
        withDelay(400, withTiming(0, { duration: REPLAY_MS * 0.6 })),
      );
      setTimeout(() => setReplayRows([-1, -1]), REPLAY_MS * 2.4);
    },
    [replay],
  );

  const dropPiece = useCallback(
    (index: number, dx: number, dy: number) => {
      const v = vivo.current;
      const m = mesa.current;
      const piece = v.problem.tray[index];
      const slot = rows[index];
      const home = tl.drawer[index];
      if (!piece || !slot || !home || v.solved || m.used.includes(index)) return;

      const volver = (): void => {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      };

      // El punto de suelta se mide desde la ranura de la pieza y no desde la
      // página: la traslación del gesto y la geometría de la escena están en el
      // mismo sistema, y así no hace falta saber dónde empieza el lienzo.
      const x = home.x + dx;
      const y = home.y + dy;
      const dentro =
        x > tl.frame.x - tl.unit &&
        x < tl.frame.x + tl.frame.w + tl.unit &&
        y > tl.frame.y - tl.unit &&
        y < tl.frame.y + tl.frame.h + tl.unit;
      if (!dentro) {
        volver();
        return;
      }
      quiet();

      // Las dos piezas del cuadrado tapan huecos y no habitaciones.
      if (piece.room < 0) {
        dropIntoHole(index, piece, x, y, volver);
        return;
      }

      // En qué habitación cayó: los tramos de la base, en orden.
      let inicio = 0;
      let destino = -1;
      for (let i = 0; i < v.problem.rooms.length; i++) {
        const r = v.problem.rooms[i] as DistRoom;
        const x0 = tl.frame.x + inicio * tl.unit;
        const x1 = x0 + r.cells * tl.unit;
        if (x > x0 - tl.unit * HOLGURA && x < x1 + tl.unit * HOLGURA) {
          destino = i;
          break;
        }
        inicio += r.cells;
      }
      if (destino < 0) {
        volver();
        return;
      }

      const room = v.problem.rooms[destino] as DistRoom;
      if (!distFits(piece, room)) {
        // La pieza que no mide lo que la habitación pide no entra: se asoma y
        // vuelve. El marco se resiste y nadie dice "mal".
        volver();
        const error = distDropMisconceptionFor(v.level, piece, room);
        attempt(false, error);
        if (error) {
          const propia = v.problem.columns.findIndex((c) => c.shape === piece.shape);
          const otra = v.problem.columns.findIndex((c) => c.shape === room.shape);
          replayError(otra, propia);
          setMessage({
            text: "Estas dos piezas no tienen la misma forma. ¿Se pueden apilar en la misma columna?",
            tone: "warn",
          });
        } else {
          setMessage({
            text: "Esa tira no mide lo que esa habitación pide. Queda un borde sin cubrir.",
            tone: "warn",
          });
        }
        return;
      }

      if ((m.strips[destino] ?? 0) >= v.problem.widthCells) {
        volver();
        setMessage({ text: "Esa habitación ya está cubierta. Falta la otra.", tone: "dim" });
        return;
      }

      slot.alive.value = withTiming(0, { duration: 120 });
      m.used = [...m.used, index];
      m.strips[destino] = (m.strips[destino] ?? 0) + 1;
      // Cada tira anota lo suyo: la de la habitación numérica vale sus baldosas,
      // la de largo desconocido vale una tira.
      m.filled[destino] = (m.filled[destino] ?? 0) + Math.abs(room.length.coef);
      espejar();
      attempt(true);

      const izquierda = m.strips[0] ?? 0;
      const derecha = m.strips[1] ?? 0;
      placed.value = withTiming(izquierda, { duration: 220 });
      placedRight.value = withTiming(derecha, { duration: 220 });

      if (m.strips.every((s) => s >= v.problem.widthCells)) {
        revealSymbols();
        setMessage({
          text: "El marco quedó cubierto y los lados se etiquetaron solos. Tocá la pared.",
          tone: "dim",
        });
        return;
      }
      setMessage({ text: "Entró. Seguí cubriendo.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tl, attempt, quiet, espejar, replayError],
  );

  /**
   * El morph del nodo: al cerrar el marco por primera vez, las llaves con su
   * etiqueta crecen sobre los lados y el renglón aparece debajo con el producto
   * escrito. El paréntesis nace ahí y no antes, porque recién ahí hay un largo
   * compuesto que escribir.
   */
  const revealSymbols = useCallback(() => {
    keys.value = withTiming(1, { duration: theme.motion.morph });
    cross.value = withSequence(
      withTiming(0, { duration: theme.motion.quick }),
      withTiming(1, { duration: theme.motion.morph }),
    );
    if (vivo.current.problem.area !== null) {
      token.value = withTiming(1, { duration: theme.motion.base });
    }
  }, [keys, cross, token]);

  /**
   * Las dos piezas que faltan en el cuadrado. Cada una entra en su esquina y
   * solo en la suya: el rectángulo acostado no tapa el hueco parado, y eso es
   * todo lo que el juego dice del error.
   */
  const dropIntoHole = useCallback(
    (index: number, piece: DistPiece, x: number, y: number, volver: () => void) => {
      const v = vivo.current;
      const m = mesa.current;
      const [ca, cb] = v.problem.prefilled;
      const u = tl.unit;
      const huecos = [
        // Arriba a la derecha, y abajo a la izquierda.
        { x: tl.frame.x + ca * u, y: tl.frame.y, w: cb * u, h: ca * u, cells: cb, tall: ca },
        { x: tl.frame.x, y: tl.frame.y + ca * u, w: ca * u, h: cb * u, cells: ca, tall: cb },
      ];
      const hueco = huecos.find(
        (h) => x > h.x - u * HOLGURA && x < h.x + h.w + u * HOLGURA && y > h.y - u * HOLGURA && y < h.y + h.h + u * HOLGURA,
      );
      if (!hueco) {
        volver();
        return;
      }
      if (hueco.cells !== piece.cells || hueco.tall !== piece.tall) {
        volver();
        attempt(false);
        setMessage({ text: "Esa pieza está acostada al revés: no tapa ese hueco.", tone: "warn" });
        return;
      }

      const slot = rows[index] as RowSlot;
      slot.alive.value = withTiming(0, { duration: 120 });
      m.used = [...m.used, index];
      espejar();
      attempt(true);
      if (m.used.length >= v.problem.tray.length) {
        // El hueco quedó tapado: el cuadrado está entero y la escritura pasa de
        // `aa + bb` a `aa + 2ab + bb` con el piso como testigo.
        placed.value = withTiming(v.problem.widthCells, { duration: theme.motion.morph });
        placedRight.value = withTiming(v.problem.widthCells, { duration: theme.motion.morph });
        succeed("Ahí está el cuadrado entero: dos cuadrados y dos rectángulos iguales.");
        return;
      }
      setMessage({ text: "Uno tapado. Falta el otro rectángulo.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tl, attempt, espejar, succeed],
  );

  // --- El libro --------------------------------------------------------------

  /** La ficha de un bloque llega a una columna. Toda la regla del libro está acá. */
  const dropChip = useCallback(
    (block: number, dx: number, dy: number) => {
      const v = vivo.current;
      const m = mesa.current;
      const columna = v.problem.columns[block];
      const home = chipHome(block);
      if (!columna || v.solved || (m.filled[block] ?? 0) > 0) return;
      const x = home.x + dx - tilesW;
      const y = home.y + dy;

      let destino = -1;
      for (let i = 0; i < visibles.length; i++) {
        const box = ll.rows[i];
        if (!box) continue;
        if (x > box.x - 40 && x < box.x + box.w + 20 && y > box.y - 12 && y < box.y + box.h + 12) {
          destino = i;
          break;
        }
      }
      if (destino < 0) return;
      quiet();

      const fila = visibles[destino] as DistColumn;
      if (fila.shape !== columna.shape || fila.letter !== columna.letter) {
        setBounced(destino);
        setTimeout(() => setBounced(-1), 420);
        const propia = visibles.findIndex(
          (c) => c.shape === columna.shape && c.letter === columna.letter,
        );
        attempt(false, distDropMisconceptionFor(v.level, columna, fila));
        replayError(destino, propia >= 0 ? propia : destino);
        setMessage({
          text: "Estas dos piezas no tienen la misma forma. ¿Se pueden apilar en la misma columna?",
          tone: "warn",
        });
        return;
      }

      m.filled[block] = columna.count;
      espejar();
      attempt(true);
      if (m.filled.filter((f) => f > 0).length >= v.problem.columns.length) {
        succeed("Cada bloque quedó anotado en su columna, y el renglón dice el total.");
        return;
      }
      setMessage({ text: "Anotado. Falta el otro bloque.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ll, visibles, tilesW, attempt, espejar, quiet, replayError, succeed],
  );

  // --- Las fichas ------------------------------------------------------------

  const pickOption = useCallback(
    (option: DistOption) => {
      const v = vivo.current;
      const m = mesa.current;
      if (v.solved || m.taken.includes(option.id)) return;
      quiet();
      const error = distMisconceptionFor(v.level, option);

      if (v.problem.ask === "expand") {
        expandStep(option, error);
        return;
      }

      attempt(option.correct, error);
      if (!option.correct) {
        if (v.problem.ask === "square" && option.lure === "square_of_parts") {
          // `missing_piece_tiles`: el juego coloca las piezas que el jugador
          // nombró y los dos rectángulos que faltan quedan vacíos.
          m.missing = true;
          espejar();
          const [ca, cb] = v.problem.prefilled;
          placed.value = withTiming(ca, { duration: theme.motion.morph });
          placedRight.value = withTiming(cb, { duration: theme.motion.morph });
          for (let i = 0; i < v.problem.tray.length; i++) {
            (rows[i] as RowSlot).alive.value = withTiming(1, { duration: theme.motion.base });
          }
          setMessage({
            text: "Al cuadrado le falta un pedazo. ¿Qué rectángulos faltan?",
            tone: "warn",
          });
          return;
        }
        setMessage({ text: reproche(option, v.problem.ask), tone: "warn" });
        return;
      }

      m.taken = [...m.taken, option.id];

      espejar();
      if (m.taken.length >= v.problem.picks) {
        succeed(acierto(v.problem.ask));
        return;
      }
      setMessage({ text: "Esa sí. Falta una más.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, quiet, succeed],
  );

  /** Armar la suma: cada ficha buena ocupa la ranura de su sumando. */
  const expandStep = useCallback(
    (option: DistOption, error: string | undefined) => {
      const v = vivo.current;
      const m = mesa.current;
      attempt(option.correct, error);
      if (!option.correct) {
        setMessage({ text: reproche(option, v.problem.ask), tone: "warn" });
        return;
      }
      const term = option.form.head[0] as DistTerm;
      const bloques = distAreaTerms(v.problem.width, v.problem.rooms);
      const i = bloques.findIndex(
        (b, k) => b.coef === term.coef && b.letters === term.letters && (m.filled[k] ?? 0) === 0,
      );
      if (i < 0) return;
      m.filled[i] = Math.abs(term.coef);
      m.taken = [...m.taken, option.id];
      espejar();
      if (m.taken.length >= v.problem.picks) {
        succeed("Repartido: el ancho llegó a cada sumando y ninguno quedó afuera.");
        return;
      }
      setMessage({ text: "Ese va. Falta repartir sobre el resto.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  const puedeTocar = !solved;
  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .enabled(puedeTocar)
        .onEnd((e) => {
          // La pared es el paréntesis: se toca donde está dibujada. Lo que está
          // afuera del marco pide el piso, que es el otro toque del juego.
          const wx = tl.frame.x + tl.cutAt * tl.unit;
          const cerca =
            Math.abs(e.x - wx) < tl.unit * 1.1 &&
            e.y > tl.frame.y - tl.unit &&
            e.y < tl.frame.y + tl.frame.h + tl.unit;
          if (cerca) runOnJS(toggleWall)();
          else runOnJS(summonFloor)();
        }),
    [puedeTocar, tl, toggleWall, summonFloor],
  );

  const definition = level.definition ? DEFINICION[round % DEFINICION.length] : null;
  const chips = problem.options;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_DISTRIBUTIVE_TILES}.name`)} · nivel ${level.n} de ${TOTAL_DIST_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: el piso y el libro viven adentro. */}
        <Canvas style={{ width, height: sceneH }}>
          <TilesScene
            config={tilesCfg}
            layout={tl}
            placed={placed}
            placedRight={placedRight}
            spin={spin}
            split={split}
            keys={keys}
            cross={cross}
            token={token}
            ghost={ghost}
            hint={pulse}
            demo={demo}
            rows={rows}
            appear={tilesAppear}
          />
          <Group transform={[{ translateX: tilesW }]}>
            <LedgerScene
              config={ledgerCfg}
              layout={ll}
              places={[]}
              round={round}
              snap={-1}
              dragIdx={dragIdx}
              dragX={dragX}
              dragY={dragY}
              pulse={pulse}
              demo={demo}
              replay={replay}
              replayRows={replayRows}
              bounced={bounced}
              appear={ledgerAppear}
            />
          </Group>
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={tap}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Siempre las mismas asas: las que esta ronda no usa quedan sordas.
            Un asa deshabilitada tiene que quedar montada, y sin recibir toques,
            o se come los del lienzo. */}
        {Array.from({ length: DIST_TRAY_SLOTS }, (_, i) => {
          const piece = problem.tray[i];
          const spot = tl.drawer[i] ?? { x: 0, y: 0 };
          const w = (piece?.cells ?? 1) * tl.unit;
          const h = (piece?.tall ?? 1) * tl.unit;
          const activo =
            !!piece && !solved && !used.includes(i) && (ask !== "square" || missing);
          return (
            <Handle
              key={i}
              index={i}
              slot={rows[i] as RowSlot}
              x={spot.x - w / 2}
              y={spot.y - h / 2}
              w={w}
              h={h}
              enabled={activo}
              onDrop={dropPiece}
            />
          );
        })}

        {/* Las fichas de los bloques, para llevarlas al libro. */}
        {ask === "tally"
          ? problem.columns.map((c, i) => {
              const home = chipHome(i);
              if ((filled[i] ?? 0) > 0) return null;
              return (
                <ChipHandle
                  key={c.id}
                  index={i}
                  label={termText({ coef: c.count, letters: c.letter })}
                  x={home.x - 30}
                  y={home.y - 17}
                  enabled={!solved}
                  onDrop={dropChip}
                />
              );
            })
          : null}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* El teclado de fichas. Fuera de las rondas que lo usan, no está. */}
      {chips.length > 0 ? (
        <View style={styles.ring}>
          {Array.from({ length: DIST_OPTION_SLOTS }, (_, i) => {
            const option = chips[i];
            if (!option) return <View key={i} style={styles.chipGhost} />;
            const usada = taken.includes(option.id);
            return (
              <Pressable
                key={option.id}
                disabled={solved || usada}
                onPress={() => pickOption(option)}
                style={[styles.chip, (solved || usada) && styles.chipDim]}
              >
                <Text style={styles.chipLabel}>{distFormText(option.form)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {definition ? <Text style={styles.definition}>{definition}</Text> : null}
    </View>
  );

  /** Dónde queda la ficha de un bloque: encima de su parte del piso. */
  function chipHome(block: number): { x: number; y: number } {
    let inicio = 0;
    for (let i = 0; i < block && i < problem.rooms.length; i++) {
      inicio += (problem.rooms[i] as DistRoom).cells;
    }
    const room = problem.rooms[block];
    const ancho = (room?.cells ?? 1) * tl.unit;
    return {
      x: tl.frame.x + inicio * tl.unit + ancho / 2,
      y: tl.frame.y + tl.frame.h / 2,
    };
  }
}

/** Un asa invisible sobre una pieza dibujada: la baldosa es dibujo, no interfaz. */
function Handle({
  index,
  slot,
  x,
  y,
  w,
  h,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly slot: RowSlot;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, dx: number, dy: number) => void;
}) {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onChange((e) => {
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        .onEnd((e) => {
          runOnJS(onDrop)(index, e.translationX, e.translationY);
        }),
    [enabled, index, slot, onDrop],
  );
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        pointerEvents={enabled ? "auto" : "none"}
        style={{ position: "absolute", left: x, top: y, width: w, height: h }}
      />
    </GestureDetector>
  );
}

/** La ficha de un bloque, que se lleva al libro con el dedo. */
function ChipHandle({
  index,
  label,
  x,
  y,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, dx: number, dy: number) => void;
}) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onChange((e) => {
          dx.value = e.translationX;
          dy.value = e.translationY;
        })
        .onEnd((e) => {
          runOnJS(onDrop)(index, e.translationX, e.translationY);
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
        }),
    [enabled, index, dx, dy, onDrop],
  );
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        pointerEvents={enabled ? "auto" : "none"}
        style={[
          styles.blockChip,
          { left: x, top: y },
          { transform: [{ translateX: dx }, { translateY: dy }] },
        ]}
      >
        <Text style={styles.blockChipLabel}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function useSlot(): RowSlot {
  return { dx: useSharedValue(0), dy: useSharedValue(0), alive: useSharedValue(0) };
}

/** Las dos frases de la capa formal, de a una por ronda. */
const DEFINICION: readonly string[] = [
  "Multiplicar por una suma es multiplicar por cada sumando y sumar los resultados.",
  "La igualdad vale en los dos sentidos: repartir el producto y volver a juntarlo.",
];

function apertura(ask: string): string {
  switch (ask) {
    case "cover":
      return "Llevá las tiras al marco hasta cubrir las dos habitaciones.";
    case "pick":
      return "Tocá la ficha que mide el piso entero.";
    case "explain":
      return "Tres maneras de escribir el mismo cuadrado. Tocá las dos que pierden baldosas.";
    case "wall":
      return "Tocá la pared: el piso no cambia de tamaño y la escritura sí.";
    case "tally":
      return "Llevá la ficha de cada bloque a su columna del libro.";
    case "expand":
      return "Repartí el ancho: una ficha por cada sumando del paréntesis.";
    case "square":
      return "Un cuadrado de lado a más b. Tocá la ficha que dice cuánto mide.";
    case "recompose":
      return "Los dos sumandos comparten un ancho. Tocá cuál es.";
    default:
      return "Adentro del paréntesis hay un producto y no una suma. Tocá lo que mide.";
  }
}

function acierto(ask: string): string {
  switch (ask) {
    case "pick":
      return "Ese es el piso entero: un ancho y un largo compuesto.";
    case "explain":
      return "Esas dos pierden piezas: una deja dos rectángulos vacíos y la otra inventa una columna.";
    case "square":
      return "Cuatro piezas: el cuadrado de a, el de b y dos rectángulos iguales.";
    case "recompose":
      return "Ese es el ancho que las dos comparten. La pared vuelve a su lugar.";
    case "reject":
      return "Sobre un producto no hay pared que sacar: es un bloque solo.";
    default:
      return "Ese es.";
  }
}

/** El juego ejecuta la respuesta del jugador en vez de calificarla. */
function reproche(option: DistOption, ask: string): string {
  // En `explain` lo que se toca son las escrituras que pierden baldosas, así
  // que la que no hay que tocar es justamente la que está bien: no tiene motivo
  // y no puede recibir un reproche sobre un error que no comete.
  if (option.sound) return "Esa dice el piso entero: no pierde una sola baldosa. Buscá las otras.";
  switch (option.lure) {
    case "partial_distribution":
      return "El ancho llegó a un sumando solo: el otro bloque queda sin cubrir.";
    case "product_of_parts":
      return "Los dos bloques se suman, no se multiplican: son dos pedazos del mismo piso.";
    case "labels_merged":
      return "Esas letras no son nombres que se junten: son lados de piezas distintas.";
    case "square_of_parts":
      return "Con esas dos piezas el cuadrado queda con dos rectángulos vacíos.";
    case "sides_added":
      return "Eso mide el contorno, no el piso.";
    case "sign_kept":
      return "Adentro había una resta: al repartir, el signo cambia.";
    case "factor_dropped":
      return ask === "recompose"
        ? "El uno divide a todos y no comparte nada: no hay pared que poner."
        : "Ese sumando llegó sin multiplicar: le falta el ancho.";
    case "one_side_only":
      return "Ese ancho divide a un sumando y al otro no, así que no lo comparten.";
    case "factor_into_both":
      return "El ancho se copió en los dos factores: el bloque queda del doble.";
    default:
      return "Adentro hay un producto, y un producto no tiene pared que sacar.";
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
  ring: {
    flexDirection: "row",
    gap: theme.space[2],
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    maxWidth: 640,
  },
  chip: {
    minWidth: 78,
    height: 56,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  chipGhost: { width: 0, height: 56 },
  chipDim: { opacity: 0.35 },
  chipLabel: { color: theme.color.ink, fontSize: 18, fontVariant: ["tabular-nums"] },
  blockChip: {
    position: "absolute",
    minWidth: 60,
    height: 34,
    paddingHorizontal: theme.space[1],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  blockChipLabel: { color: theme.color.ink, fontSize: 16, fontVariant: ["tabular-nums"] },
  definition: {
    color: theme.color.inkDim,
    fontSize: 12,
    maxWidth: 520,
    textAlign: "center",
  },
});
