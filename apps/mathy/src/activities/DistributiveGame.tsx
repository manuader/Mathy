/**
 * Dos habitaciones: el minijuego de `alg.expr.distributive_tiles`.
 *
 * Un chico que no lee tiene que poder empezarlo. Por eso no hay ninguna
 * instrucción escrita en las capas concretas: la guía de Lumi lleva la primera
 * tira al marco y el objeto contesta. Los mensajes de abajo cuentan lo que pasó.
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
 * - Tocar el piso. Saca o pone la pared, en las rondas que la mueven: el piso
 *   entero es el blanco, porque apuntarle a una raya de tres píxeles era la
 *   parte difícil del nivel y no la matemática. El piso no cambia de tamaño y
 *   las dos escrituras se cruzan en el renglón.
 * - Arrastrar la ficha de un bloque a su columna del libro.
 * - Tocar una ficha entre varias, que es como se contestan reconocer,
 *   explicar, repartir, el cuadrado, recomponer y el contraejemplo.
 * - Tocar el tablero para que aparezca el piso, cuando ya no está dibujado.
 *
 * Los dos errores que clasifican son los dos que el catálogo de L declara sobre
 * este nodo: `variable_as_label` cuando se apilan dos piezas de forma distinta,
 * con la repetición corriendo en el libro, y `distribute_over_wrong_op` cuando
 * se reparte sobre un cuadrado o sobre un producto, con el patrón
 * `missing_piece_tiles` colocando las piezas que el jugador nombró y dejando
 * vacíos los dos rectángulos que faltan. Todo lo demás se muestra y no se anota.
 *
 * La lección (tarjetas, guía y llaves) vive en `lessons/distributive.ts`, y los
 * textos de la línea de abajo también: acá sólo hay claves.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
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
  tilesWritingBox,
  type RowSlot,
  type TilesConfig,
} from "../scenes/TilesScene.tsx";
import { LedgerScene, ledgerLayout, type LedgerConfig } from "../scenes/LedgerScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { t } from "../i18n.ts";
import { play } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";
import { chipFace } from "../ui/Kit.tsx";

/** El signo menos del atlas. El guion de ASCII no está y deja un hueco. */
const MENOS = "−";
/** Cuánto aire tiene alrededor una habitación. Una mano de cinco años no apunta fino. */
const HOLGURA = 0.6;
/** La repetición del error va en cámara lenta: es para mirarla, no para pasarla. */
const REPLAY_MS = 1300;
/** El blanco mínimo de todo lo que se agarra con el dedo (N §11). */
const DEDO = 44;
/**
 * El rincón de Tomi, abajo a la izquierda (`ui/HintBuddy.tsx`): 52 más 10 de
 * margen en una pantalla angosta, 64 más 16 en una ancha, y holgura. Las
 * fichas de abajo no llegan ahí: un toque en la primera abría una pista.
 */
const TOMI_ANGOSTO = 74;
const TOMI_ANCHO = 92;

/** Un texto de la línea de abajo. Viven en `lessons/distributive.ts`. */
const m = (id: string): string => t(`lesson.${NODE_DISTRIBUTIVE_TILES}.msg.${id}`);

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

const pad = (b: Rect, p: number): Rect => ({ x: b.x - p, y: b.y - p, w: b.w + p * 2, h: b.h + p * 2 });

/** El rectángulo que abraza varios. */
function around(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) return null;
  const x0 = Math.min(...rects.map((r) => r.x));
  const y0 = Math.min(...rects.map((r) => r.y));
  const x1 = Math.max(...rects.map((r) => r.x + r.w));
  const y1 = Math.max(...rects.map((r) => r.y + r.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function Activity({ level, onLevelDone, onEvent }: DistributiveGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  /** El paso de la guía a la vista. */
  const guia = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  /** Con lección, el cartel dice qué hacer y la línea de abajo queda para lo que pasó. */
  const conLeccion = lesson?.lesson !== undefined;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);

  const problem = useMemo(
    () => generateDistributive(level, seedBase + round * 1000 + level.n, round),
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
    text: conLeccion ? "" : m(`open.${ask}`),
    tone: "dim",
  }));

  /**
   * El alto que de verdad le queda al tablero, medido. Calculado como fracción
   * de la ventana, con el cartel de la guía y las fichas abajo, las fichas
   * quedaban debajo del borde de la pantalla y la ronda no se podía contestar.
   * El tablero toma lo que sobra, como en el nodo 8.
   */
  const conFichas = problem.options.length > 0;
  const [area, setArea] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const estimado = height * (conLeccion ? 0.5 : 0.62) - (conFichas ? 76 : 0);
  const sceneH = Math.max(220, Math.min(area && area.h > 0 ? area.h : estimado, 520));
  const ventana = useWindowDimensions();
  const rincon = ventana.width < 600 ? TOMI_ANGOSTO : TOMI_ANCHO;
  // El libro va a la derecha y el piso se queda con el resto, que es la
  // disposición que pide el documento: marco al centro, bandeja abajo, libro al
  // costado. En un teléfono el libro se lleva un poco más de la mitad de lo
  // que se llevaría en proporción: con menos, sus columnas se salían del lienzo.
  const angosto = width < 600;
  const ledgerW = level.ledger
    ? angosto
      ? Math.round(Math.max(150, width * 0.4))
      : Math.min(Math.max(width * 0.32, 200), 300)
    : 0;
  const tilesW = Math.max(200, width - ledgerW);

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
  /**
   * Las llaves de los lados van con el marco: si el marco se dibuja, sus lados
   * se leen (el cuadrado de lado a más b no se entiende sin ellos). Sin marco
   * que dibujar no hay lados, y unas llaves alrededor de nada no dicen nada.
   */
  const conLlaves = drawable;

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
      // El renglón escrito va siempre: sin piso dibujado es lo único que queda,
      // y es lo que la ronda pregunta.
      keys: true,
      // En recomponer lo que se busca es el ancho: la llave del costado lo
      // diría, así que va hueca.
      hollow: ask === "recompose" ? "rows" : null,
      onDemand: level.floor === "onDemand",
      // Sin bandeja, el piso se centra y sus llaves no se cortan arriba; los
      // rectángulos del cuadrado son altos y esperan al costado.
      arrange: problem.tray.length === 0 ? "none" : ask === "square" ? "beside" : "below",
      rooms: {
        at: cutAt,
        wall: problem.rooms.length > 1,
        spans: problem.rooms.map((r) => ({ cells: r.cells, label: sumText([r.length]) })),
        side: sumText(problem.width),
        product: distFormText(problem.product),
        sum: distFormText(problem.sum),
        braces: conLlaves,
        // Un piso que no se puede dibujar deja el renglón solo, en el medio.
        writingAt: drawable ? "below" : "center",
      },
    }),
    [problem, level.floorSkin, level.floor, cols, cutAt, drawable, ask, conLlaves],
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
    setMessage({ text: conLeccion ? "" : m(`open.${problem.ask}`), tone: "dim" });

    placed.value = cubierto ? problem.widthCells : 0;
    placedRight.value = cubierto ? problem.widthCells : 0;
    spin.value = 0;
    split.value = problem.wallIn ? 0 : 1;
    token.value = problem.area !== null && cubierto ? 1 : 0;
    // Las llaves y el renglón llegan puestos en las rondas que no se cubren; en
    // las de cubrir, nacen al cerrar el marco. El cuadrado llega con sus lados
    // escritos: sin ellos no se sabe de qué cuadrado se habla.
    const escrito = problem.ask !== "cover";
    keys.value = escrito ? 1 : 0;
    cross.value = escrito ? 1 : 0;
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

    // El latido del marco no es un adorno: dice dónde va lo que se arrastra.
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    // Con guía, la luz de Lumi es la demostración: dos manos a la vez
    // señalarían dos cosas distintas.
    demo.value =
      problem.ask === "cover" && !guided
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

  // El reloj arranca cuando el nivel empieza, no detrás de la tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem, playing]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_DISTRIBUTIVE_TILES, layer: level.layer });
  }, [level.layer, onEvent]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa, en el
  // mismo lugar donde registra el movimiento. Por referencia: el callback de un
  // gesto puede estar un render atrasado (trampa 8).
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);

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

  /**
   * Cerrar la ronda, salvo que la guía esté explicando lo que acaba de pasar:
   * entonces queda pendiente y se cierra cuando el jugador dice "entendido".
   */
  const holding = useRef(false);
  holding.current = guia?.holds === true;
  const pending = useRef(false);
  const advance = useCallback(() => {
    if (holding.current) {
      pending.current = true;
      return;
    }
    nextRound();
  }, [nextRound]);
  useEffect(() => {
    if (guia?.holds === true || !pending.current) return;
    pending.current = false;
    nextRound();
  }, [guia, nextRound]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      say("solved");
      setTimeout(advance, 1900);
    },
    [advance, quiet, say],
  );

  // --- La pared --------------------------------------------------------------

  /**
   * El corazón del nodo. La pared sale y el piso se parte en bloques; la pared
   * vuelve y los bloques se juntan. El marco no cambia de tamaño y el contador
   * de superficie no se mueve: es el mismo piso contado de dos maneras, y por
   * eso las dos escrituras valen lo mismo.
   *
   * Sólo se mueve en las rondas que la piden. En las otras, sacarla cerraba la
   * ronda sin contestar nada (la cuenta de toques alcanzaba a la de fichas), y
   * en la de anotar desarmaba las columnas debajo del dedo.
   */
  const toggleWall = useCallback(() => {
    const v = vivo.current;
    const mm = mesa.current;
    if (v.solved) return;
    if (v.problem.ask !== "cover" && v.problem.ask !== "wall") {
      setMessage({ text: m("wallNotHere"), tone: "dim" });
      return;
    }
    const cerrado = mm.strips.every((s) => s >= v.problem.widthCells);
    if (!cerrado) {
      setMessage({ text: m("wallFirst"), tone: "dim" });
      return;
    }
    quiet();
    mm.wallOut = !mm.wallOut;
    mm.toggles += 1;
    espejar();
    split.value = withTiming(mm.wallOut ? 1 : 0, { duration: theme.motion.morph });
    attempt(true);
    say("wallToggled");
    if (mm.wallOut) say("wallOut");

    const faltan = v.problem.picks - mm.toggles;
    if (v.problem.ask === "cover" || faltan <= 0) {
      succeed(m(mm.wallOut ? "wallSplit" : "wallJoined"));
      return;
    }
    setMessage({ text: m(mm.wallOut ? "wallSplitMore" : "wallJoinMore"), tone: "dim" });
  }, [attempt, espejar, quiet, split, succeed, say]);

  /** El piso que ya no está dibujado se pide con un toque sobre el tablero. */
  const summonFloor = useCallback(() => {
    if (level.floor !== "onDemand") return;
    if (!drawable) {
      setMessage({ text: m("noFloor"), tone: "dim" });
      return;
    }
    ghost.value = withTiming(1, { duration: theme.motion.base });
    say("summoned");
    setMessage({ text: m("floorHere"), tone: "dim" });
  }, [level.floor, drawable, ghost, say]);

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
      const mm = mesa.current;
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
        setMessage({ text: m("holeBack"), tone: "dim" });
        return;
      }
      if (hueco.cells !== piece.cells || hueco.tall !== piece.tall) {
        volver();
        attempt(false);
        setMessage({ text: m("holeTurned"), tone: "warn" });
        return;
      }

      const slot = rows[index] as RowSlot;
      slot.alive.value = withTiming(0, { duration: 120 });
      mm.used = [...mm.used, index];
      espejar();
      attempt(true);
      play("fit");
      if (mm.used.length >= v.problem.tray.length) {
        // El hueco quedó tapado: el cuadrado está entero y la escritura pasa de
        // `aa + bb` a `aa + 2ab + bb` con el piso como testigo.
        placed.value = withTiming(v.problem.widthCells, { duration: theme.motion.morph });
        placedRight.value = withTiming(v.problem.widthCells, { duration: theme.motion.morph });
        succeed(m("squareWhole"));
        return;
      }
      setMessage({ text: m("holeOne"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tl, attempt, espejar, succeed],
  );

  const dropPiece = useCallback(
    (index: number, dx: number, dy: number) => {
      const v = vivo.current;
      const mm = mesa.current;
      const piece = v.problem.tray[index];
      const slot = rows[index];
      const home = tl.drawer[index];
      if (!piece || !slot || !home || v.solved || mm.used.includes(index)) return;

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
        // Un arrastre corto es un toque que se corrió: no hace falta decir nada.
        if (Math.hypot(dx, dy) > tl.unit) setMessage({ text: m("stripBack"), tone: "dim" });
        return;
      }
      quiet();

      // Las dos piezas del cuadrado tapan huecos y no habitaciones.
      if (piece.room < 0) {
        dropIntoHole(index, piece, x, y, volver);
        return;
      }

      // En qué habitación cayó: los tramos de la base, en orden. Primero la
      // que contiene el punto; la holgura sólo si no cayó adentro de ninguna,
      // o la de la izquierda le robaría a la derecha su borde (trampa 14).
      const tramos: { i: number; x0: number; x1: number }[] = [];
      let inicio = 0;
      for (let i = 0; i < v.problem.rooms.length; i++) {
        const r = v.problem.rooms[i] as DistRoom;
        const x0 = tl.frame.x + inicio * tl.unit;
        tramos.push({ i, x0, x1: x0 + r.cells * tl.unit });
        inicio += r.cells;
      }
      // La tira entra en la habitación que la acepta si la toca con un buen
      // pedazo, aunque su centro haya caído del otro lado de la pared: una
      // habitación de una baldosa mide lo que un dedo, y pedirle al centro de
      // la tira que caiga adentro era puntería y no matemática. Soltada lejos
      // de la suya, en cambio, cae donde está su centro y ahí se ve que no mide.
      const ancho = piece.cells * tl.unit;
      const solape = (s: { x0: number; x1: number }): number =>
        Math.min(s.x1, x + ancho / 2) - Math.max(s.x0, x - ancho / 2);
      const suya = tramos.find((s) => {
        const r = v.problem.rooms[s.i] as DistRoom;
        const libre = (mm.strips[s.i] ?? 0) < v.problem.widthCells;
        return libre && distFits(piece, r) && solape(s) >= 0.3 * Math.min(ancho, s.x1 - s.x0);
      });
      const exacto = tramos.find((s) => x >= s.x0 && x < s.x1);
      const cerca = suya ?? exacto ?? tramos.find((s) => x > s.x0 - tl.unit * HOLGURA && x < s.x1 + tl.unit * HOLGURA);
      const destino = cerca?.i ?? -1;
      if (destino < 0) {
        volver();
        setMessage({ text: m("stripBack"), tone: "dim" });
        return;
      }

      const room = v.problem.rooms[destino] as DistRoom;
      if (!distFits(piece, room)) {
        // La pieza que no mide lo que la habitación pide no entra: se asoma y
        // vuelve. El marco se resiste y nadie dice "mal".
        volver();
        const error = distDropMisconceptionFor(v.level, piece, room);
        attempt(false, error);
        if (piece.shape !== room.shape) {
          const propia = v.problem.columns.findIndex((c) => c.shape === piece.shape);
          const otra = v.problem.columns.findIndex((c) => c.shape === room.shape);
          if (error) replayError(otra, propia);
          setMessage({ text: m("notSameShape"), tone: "warn" });
        } else {
          setMessage({ text: m("stripShort"), tone: "warn" });
        }
        return;
      }

      if ((mm.strips[destino] ?? 0) >= v.problem.widthCells) {
        volver();
        setMessage({ text: m("roomFull"), tone: "dim" });
        return;
      }

      slot.alive.value = withTiming(0, { duration: 120 });
      mm.used = [...mm.used, index];
      mm.strips[destino] = (mm.strips[destino] ?? 0) + 1;
      // Cada tira anota lo suyo: la de la habitación numérica vale sus baldosas,
      // la de largo desconocido vale una tira.
      mm.filled[destino] = (mm.filled[destino] ?? 0) + Math.abs(room.length.coef);
      espejar();
      attempt(true);
      say("stripIn");

      const izquierda = mm.strips[0] ?? 0;
      const derecha = mm.strips[1] ?? 0;
      placed.value = withTiming(izquierda, { duration: 220 });
      placedRight.value = withTiming(derecha, { duration: 220 });

      if (mm.strips.every((s) => s >= v.problem.widthCells)) {
        revealSymbols();
        say("covered");
        setMessage({ text: m("covered"), tone: "ok" });
        return;
      }
      setMessage({ text: m("stripIn"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tl, attempt, quiet, espejar, replayError, dropIntoHole, revealSymbols, say],
  );

  // --- El libro --------------------------------------------------------------

  /** Dónde queda la ficha de un bloque: encima de su parte del piso. */
  const chipHome = useCallback(
    (block: number): Pt => {
      let inicio = 0;
      for (let i = 0; i < block && i < problem.rooms.length; i++) {
        inicio += (problem.rooms[i] as DistRoom).cells;
      }
      const room = problem.rooms[block];
      const ancho = (room?.cells ?? 1) * tl.unit;
      // Con la pared afuera los bloques se separan: la ficha sigue a su bloque.
      const corrido = (block === 0 ? -1 : 1) * tl.unit * 0.35 * (wallOut ? 1 : 0);
      return {
        x: tl.frame.x + inicio * tl.unit + ancho / 2 + corrido,
        y: tl.frame.y + tl.frame.h / 2,
      };
    },
    [problem.rooms, tl, wallOut],
  );

  /** La ficha de un bloque llega a una columna. Toda la regla del libro está acá. */
  const dropChip = useCallback(
    (block: number, dx: number, dy: number) => {
      const v = vivo.current;
      const mm = mesa.current;
      const columna = v.problem.columns[block];
      const home = chipHome(block);
      if (!columna || v.solved || (mm.filled[block] ?? 0) > 0) return;
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
      if (destino < 0) {
        if (Math.hypot(dx, dy) > 12) setMessage({ text: m("chipBack"), tone: "dim" });
        return;
      }
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
        setMessage({ text: m("notSameShape"), tone: "warn" });
        return;
      }

      mm.filled[block] = columna.count;
      espejar();
      attempt(true);
      play("drop", { pitch: mm.filled.filter((f) => f > 0).length * 2 });
      say("tallied");
      if (mm.filled.filter((f) => f > 0).length >= v.problem.columns.length) {
        succeed(m("tallyDone"));
        return;
      }
      setMessage({ text: m("tallyOne"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ll, visibles, tilesW, chipHome, attempt, espejar, quiet, replayError, succeed, say],
  );

  // --- Las fichas ------------------------------------------------------------

  /** Armar la suma: cada ficha buena ocupa la ranura de su sumando. */
  const expandStep = useCallback(
    (option: DistOption, error: string | undefined) => {
      const v = vivo.current;
      const mm = mesa.current;
      attempt(option.correct, error);
      if (!option.correct) {
        setMessage({ text: reproche(option, v.problem.ask), tone: "warn" });
        return;
      }
      const term = option.form.head[0] as DistTerm;
      const bloques = distAreaTerms(v.problem.width, v.problem.rooms);
      const i = bloques.findIndex(
        (b, k) => b.coef === term.coef && b.letters === term.letters && (mm.filled[k] ?? 0) === 0,
      );
      if (i < 0) return;
      mm.filled[i] = Math.abs(term.coef);
      mm.taken = [...mm.taken, option.id];
      espejar();
      play("fit");
      say("picked");
      if (mm.taken.length >= v.problem.picks) {
        // Repartido: la pared sale y el renglón pasa del producto a la suma.
        split.value = withTiming(1, { duration: theme.motion.morph });
        succeed(m("expandDone"));
        return;
      }
      setMessage({ text: m("expandOne"), tone: "ok" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, succeed, say],
  );

  const pickOption = useCallback(
    (option: DistOption) => {
      const v = vivo.current;
      const mm = mesa.current;
      if (v.solved || mm.taken.includes(option.id)) return;
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
          // nombró y los dos rectángulos que faltan quedan vacíos. El piso se
          // muestra aunque nadie lo haya pedido: el hueco es la respuesta.
          mm.missing = true;
          espejar();
          const [ca, cb] = v.problem.prefilled;
          ghost.value = withTiming(1, { duration: theme.motion.base });
          placed.value = withTiming(ca, { duration: theme.motion.morph });
          placedRight.value = withTiming(cb, { duration: theme.motion.morph });
          for (let i = 0; i < v.problem.tray.length; i++) {
            (rows[i] as RowSlot).alive.value = withTiming(1, { duration: theme.motion.base });
          }
          setMessage({ text: m("missing"), tone: "warn" });
          return;
        }
        setMessage({ text: reproche(option, v.problem.ask), tone: "warn" });
        return;
      }

      mm.taken = [...mm.taken, option.id];
      espejar();
      play("fit");
      say("picked");
      if (mm.taken.length >= v.problem.picks) {
        if (v.problem.ask === "square") {
          // El cuadrado entero aparece con sus cuatro piezas.
          ghost.value = withTiming(1, { duration: theme.motion.base });
          placed.value = withTiming(v.problem.widthCells, { duration: theme.motion.morph });
          placedRight.value = withTiming(v.problem.widthCells, { duration: theme.motion.morph });
        }
        if (v.problem.ask === "recompose") {
          // La pared vuelve: la suma se junta en el producto.
          split.value = withTiming(0, { duration: theme.motion.morph });
        }
        succeed(m(`ok.${v.problem.ask}`));
        return;
      }
      setMessage({ text: m("pickOne"), tone: "ok" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, quiet, succeed, expandStep, say],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Lo que las asas llaman viaja en una referencia estable. El gesto de un asa
   * se quedaba con el `dropPiece` de la ronda anterior (trampa 8): la primera
   * tira de una ronda nueva se soltaba contra el marco y la bandeja de la
   * ronda de antes, y caía en otra habitación o en ninguna. Con la referencia,
   * el gesto no cambia nunca y la decisión es siempre la de ahora.
   */
  const acciones = useRef({ dropPiece, dropChip });
  acciones.current = { dropPiece, dropChip };
  const soltarPieza = useCallback(
    (i: number, dx: number, dy: number) => acciones.current.dropPiece(i, dx, dy),
    [],
  );
  const soltarFicha = useCallback(
    (i: number, dx: number, dy: number) => acciones.current.dropChip(i, dx, dy),
    [],
  );

  /**
   * Un toque sobre el tablero. Adentro del marco mueve la pared en las rondas
   * que la mueven; con el piso escondido, lo pide. Todo el piso es el blanco de
   * la pared: la raya dibujada es de tres píxeles y el dedo no.
   */
  const onTap = useCallback(
    (x: number, y: number) => {
      const v = vivo.current;
      if (v.solved) return;
      if (level.floor === "onDemand") {
        summonFloor();
        return;
      }
      const margen = tl.unit * 0.8;
      const enPiso =
        x > tl.frame.x - margen &&
        x < tl.frame.x + tl.frame.w + margen &&
        y > tl.frame.y - margen &&
        y < tl.frame.y + tl.frame.h + margen;
      if (enPiso && v.problem.rooms.length > 1) toggleWall();
    },
    [level.floor, tl, summonFloor, toggleWall],
  );
  const ultimo = useRef(onTap);
  ultimo.current = onTap;
  const tocar = useCallback((x: number, y: number) => ultimo.current(x, y), []);

  // Habilitado siempre: `onTap` ya ignora la ronda resuelta, y un gesto que se
  // apaga y se prende entre rondas es el que en web se queda mudo (trampa 33).
  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .onEnd((e) => {
          runOnJS(tocar)(e.x, e.y);
        }),
    [tocar],
  );

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Dónde quedan, respecto del lienzo, las fichas de abajo. Viven fuera del
   * lienzo, así que se miden: el lienzo y la bandeja son hijos directos de la
   * raíz y `onLayout` los mide contra el mismo padre (trampa 10).
   */
  const canvasAt = useMemo<Pt | null>(
    () => (area ? { x: area.x + (area.w - width) / 2, y: area.y + (area.h - sceneH) / 2 } : null),
    [area, width, sceneH],
  );
  const [bandAt, setBandAt] = useState<Pt | null>(null);
  const [ringAt, setRingAt] = useState<Rect | null>(null);
  const trayAt = useMemo<Rect | null>(
    () => (bandAt && ringAt ? { x: bandAt.x + ringAt.x, y: bandAt.y + ringAt.y, w: ringAt.w, h: ringAt.h } : null),
    [bandAt, ringAt],
  );

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda, calculado
   * con la misma geometría con la que la escena lo dibuja. La pista de Tomi
   * reusa los pasos: señala lo mismo, pero no frena la ronda.
   */
  const shown = guia ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const id = shown.id;
    const u = tl.unit;
    const frame = tl.frame;
    const frameRect = pad(frame, 8);
    // El piso con sus llaves: arriba y al costado hay etiquetas que se leen.
    const readRect: Rect = { x: frame.x - u * 1.3, y: frame.y - u * 1.1, w: frame.w + u * 1.6, h: frame.h + u * 1.4 };
    // El renglón escrito, con la misma cuenta con la que `TilesScene` lo pone.
    const writeRect = pad(tilesWritingBox(tl, tilesCfg.rooms), 6);
    const wallX = frame.x + tl.cutAt * u;
    const wallRect: Rect = { x: wallX - 24, y: frame.y - 12, w: 48, h: frame.h + 24 };
    const chipsRect =
      trayAt && canvasAt
        ? pad({ x: trayAt.x - canvasAt.x, y: trayAt.y - canvasAt.y, w: trayAt.w, h: trayAt.h }, 6)
        : null;
    const conFichasA = (rs: Rect[]): Rect[] => (chipsRect ? [chipsRect, ...rs] : rs);

    // La habitación de cada tramo, y adónde entra la próxima tira: la izquierda
    // se llena desde arriba y la derecha desde abajo, como las dibuja la escena.
    const tramo = (room: number): Rect => {
      let inicio = 0;
      for (let i = 0; i < room; i++) inicio += (problem.rooms[i] as DistRoom).cells;
      const r = problem.rooms[room];
      return { x: frame.x + inicio * u, y: frame.y, w: (r?.cells ?? 1) * u, h: frame.h };
    };
    const destinoDe = (room: number): Pt => {
      const b = tramo(room);
      const hechas = strips[room] ?? 0;
      const fila = Math.min(hechas, problem.widthCells - 1);
      const y = room === 0 ? frame.y + (fila + 0.5) * u : frame.y + frame.h - (fila + 0.5) * u;
      return { x: b.x + b.w / 2, y };
    };

    switch (ask) {
      case "cover": {
        const libres = problem.tray
          .map((p, i) => ({ p, i, spot: tl.drawer[i] }))
          .filter((e) => !used.includes(e.i) && e.spot !== undefined);
        const cajas = libres.map((e) => {
          const s = e.spot as Pt;
          const w = e.p.cells * u;
          const h = e.p.tall * u;
          return { x: s.x - w / 2, y: s.y - h / 2, w, h };
        });
        const bandeja = around(cajas);
        if (id === "look") return { rings: bandeja ? [frameRect, pad(bandeja, 10)] : [frameRect] };
        if (id === "wall") return { rings: [wallRect, frameRect] };
        if (id === "reveal") return { rings: [frameRect, writeRect] };
        // Una tira que falta, hasta su habitación: primero la de la izquierda.
        for (let room = 0; room < problem.rooms.length; room++) {
          if ((strips[room] ?? 0) >= problem.widthCells) continue;
          const e = libres.find((l) => l.p.room === room);
          if (e?.spot) return { rings: [pad(tramo(room), 6)], drag: { from: e.spot, to: destinoDe(room) } };
        }
        return { rings: [frameRect] };
      }
      case "explain":
        if (id === "look") return { rings: conFichasA([readRect]) };
        return { rings: conFichasA([]) .length > 0 ? conFichasA([]) : [readRect] };
      case "wall":
        if (id === "look") return { rings: [writeRect] };
        if (id === "reveal") return { rings: [frameRect, writeRect] };
        return { rings: [wallRect, writeRect] };
      case "tally": {
        for (let b = 0; b < problem.columns.length; b++) {
          if ((filled[b] ?? 0) > 0) continue;
          const c = problem.columns[b] as DistColumn;
          const j = visibles.findIndex((v) => v.shape === c.shape && v.letter === c.letter);
          const box = ll.rows[j];
          const from = chipHome(b);
          if (!box) break;
          const to = { x: tilesW + box.x + box.w / 2, y: box.y + box.h / 2 };
          return {
            rings: [{ x: tilesW + box.x - 6, y: box.y - 6, w: box.w + 12, h: box.h + 12 }],
            drag: { from, to },
          };
        }
        return { rings: [frameRect] };
      }
      case "expand":
        if (id === "look" || id === "reveal") return { rings: [writeRect] };
        return { rings: conFichasA([writeRect]) };
      case "square": {
        if (id === "look") return { rings: [readRect] };
        if (id === "reveal") return { rings: [frameRect] };
        if (missing) {
          // Los dos huecos, y la luz lleva la pieza que falta hasta el suyo.
          const [ca, cb] = problem.prefilled;
          const huecos: Rect[] = [
            { x: frame.x + ca * u, y: frame.y, w: cb * u, h: ca * u },
            { x: frame.x, y: frame.y + ca * u, w: ca * u, h: cb * u },
          ];
          for (let i = 0; i < problem.tray.length; i++) {
            if (used.includes(i)) continue;
            const piece = problem.tray[i] as DistPiece;
            const spot = tl.drawer[i];
            const k = huecos.findIndex((h) => Math.round(h.w / u) === piece.cells && Math.round(h.h / u) === piece.tall);
            const h = huecos[k];
            if (spot && h) {
              return { rings: [pad(h, 4)], drag: { from: spot, to: { x: h.x + h.w / 2, y: h.y + h.h / 2 } } };
            }
          }
          return { rings: huecos };
        }
        return { rings: conFichasA([]).length > 0 ? conFichasA([]) : [readRect] };
      }
      default:
        return { rings: conFichasA([writeRect]) };
    }
  }, [shown, ask, tl, tilesCfg.rooms, problem, strips, used, filled, visibles, ll.rows, tilesW, chipHome, missing, trayAt, canvasAt]);

  const definition = level.definition ? m(`definition.${round % 2}`) : null;
  const chips = problem.options;

  return (
    <View style={styles.root}>
      <Header
        title={`${t(`node.${NODE_DISTRIBUTIVE_TILES}.name`)} · nivel ${level.n} de ${TOTAL_DIST_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!lesson?.lesson}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View
        style={styles.area}
        onLayout={(e) => {
          const l = e.nativeEvent.layout;
          const r = { x: Math.round(l.x), y: Math.round(l.y), w: Math.round(l.width), h: Math.round(l.height) };
          setArea((a) =>
            a && Math.abs(a.x - r.x) < 2 && Math.abs(a.y - r.y) < 2 && Math.abs(a.w - r.w) < 2 && Math.abs(a.h - r.h) < 2
              ? a
              : r,
          );
        }}
      >
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
              onDrop={soltarPieza}
            />
          );
        })}

        {/* Las fichas de los bloques, para llevarlas al libro. Montadas
            siempre: la que ya se anotó queda sorda y sin verse. */}
        {Array.from({ length: DIST_COLUMN_SLOTS }, (_, i) => {
          const c = ask === "tally" ? problem.columns[i] : undefined;
          const home = chipHome(i);
          const vivoChip = !!c && (filled[i] ?? 0) === 0;
          return (
            <ChipHandle
              key={`chip${i}`}
              index={i}
              label={c ? termText({ coef: c.count, letters: c.letter }) : ""}
              x={home.x}
              y={home.y}
              visible={vivoChip}
              enabled={vivoChip && !solved}
              onDrop={soltarFicha}
            />
          );
        })}

        {/* Encima de todo y sin llevarse ningún toque: anillos y la luz de Lumi. */}
        <Spotlight focus={focus} />
      </View>
      </View>

      {/* Un renglón fijo: si la línea de abajo entrara y saliera, el tablero
          saltaría debajo del dedo. */}
      <View style={styles.hintSlot}>
        <Hint text={message.text} tone={message.tone} />
      </View>

      {/* El teclado de fichas. Fuera de las rondas que lo usan, no está. */}
      {chips.length > 0 ? (
        <View
          style={[styles.ringBand, { paddingLeft: rincon, paddingRight: ventana.width < 600 ? 12 : rincon }]}
          onLayout={(e) => {
            const l = e.nativeEvent.layout;
            setBandAt((a) => (a && a.x === l.x && a.y === l.y ? a : { x: l.x, y: l.y }));
          }}
        >
        {/* La fila de fichas mide lo que ocupan sus fichas: así el anillo de
            la guía rodea las fichas y no la franja entera. */}
        <View
          style={styles.ring}
          onLayout={(e) => {
            const l = e.nativeEvent.layout;
            setRingAt({ x: l.x, y: l.y, w: l.width, h: l.height });
          }}
        >
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
        </View>
      ) : null}

      {definition ? <Text style={styles.definition}>{definition}</Text> : null}
    </View>
  );
}

/**
 * Un asa invisible sobre una pieza dibujada: la baldosa es dibujo, no interfaz.
 * El blanco es más grande que la pieza: en un teléfono una tira mide veinte
 * píxeles de alto, y un dedo necesita más del doble.
 */
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
  // Nace habilitado y un valor compartido decide (trampa 33): en el nivel 3 la
  // primera ronda no tiene bandeja, y las tiras nacidas apagadas quedaban
  // muertas en la ronda de cubrir.
  const activo = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    activo.value = enabled ? 1 : 0;
  }, [activo, enabled]);
  const vivos = useRef(onDrop);
  vivos.current = onDrop;
  const soltar = useCallback((i: number, x: number, y: number) => vivos.current(i, x, y), []);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          if (!activo.value) return;
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        .onEnd((e) => {
          if (!activo.value) return;
          runOnJS(soltar)(index, e.translationX, e.translationY);
        })
        // Si otro gesto se lleva el dedo, la pieza no se queda flotando lejos
        // de su asa: vuelve a su lugar.
        .onFinalize((_, success) => {
          if (success) return;
          slot.dx.value = withTiming(0, { duration: theme.motion.base });
          slot.dy.value = withTiming(0, { duration: theme.motion.base });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, slot],
  );
  const alto = Math.max(h + 12, DEDO);
  const ancho = Math.max(w + 12, DEDO);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: x - (ancho - w) / 2,
          top: y - (alto - h) / 2,
          width: ancho,
          height: alto,
          pointerEvents: enabled ? "auto" : "none",
        }}
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
  visible,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly label: string;
  /** El centro de la ficha, en coordenadas del lienzo. */
  readonly x: number;
  readonly y: number;
  readonly visible: boolean;
  readonly enabled: boolean;
  readonly onDrop: (index: number, dx: number, dy: number) => void;
}) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  // El gesto nace una vez y habilitado; si responde lo decide este valor. En
  // web, un `Pan` nacido con `.enabled(false)` no despierta nunca (trampa 33):
  // las fichas nacían apagadas en la ronda de la pared y en la de anotar no se
  // movían ni con el dedo ni con el mouse.
  const activo = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    activo.value = enabled ? 1 : 0;
  }, [activo, enabled]);
  const vivos = useRef(onDrop);
  vivos.current = onDrop;
  const soltar = useCallback((i: number, x: number, y: number) => vivos.current(i, x, y), []);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          if (!activo.value) return;
          dx.value = e.translationX;
          dy.value = e.translationY;
        })
        .onEnd((e) => {
          if (!activo.value) return;
          runOnJS(soltar)(index, e.translationX, e.translationY);
        })
        .onFinalize(() => {
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index],
  );
  // La ficha que se ve sigue al dedo; el blanco que escucha queda quieto y sin
  // hijos, como el de las tiras. Con la ficha misma como blanco (un texto
  // adentro y el desplazamiento en su estilo), en la pantalla táctil el gesto
  // no llegaba a engancharse y la ficha no se movía: la ronda no se podía
  // terminar en un teléfono.
  const moving = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }],
  }));
  return (
    <>
      <Animated.View
        style={[
          styles.blockChip,
          { left: x - CHIP_W / 2, top: y - CHIP_H / 2, opacity: visible ? 1 : 0, pointerEvents: "none" },
          moving,
        ]}
      >
        <Text style={styles.blockChipLabel}>{label}</Text>
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={{
            position: "absolute",
            left: x - CHIP_W / 2 - 4,
            top: y - CHIP_H / 2 - 4,
            width: CHIP_W + 8,
            height: CHIP_H + 8,
            pointerEvents: enabled ? "auto" : "none",
          }}
        />
      </GestureDetector>
    </>
  );
}

const CHIP_W = 64;
const CHIP_H = 44;

function useSlot(): RowSlot {
  return { dx: useSharedValue(0), dy: useSharedValue(0), alive: useSharedValue(0) };
}

/** El juego ejecuta la respuesta del jugador en vez de calificarla. */
function reproche(option: DistOption, ask: string): string {
  // En `explain` lo que se toca son las escrituras que pierden baldosas, así
  // que la que no hay que tocar es justamente la que está bien: no tiene motivo
  // y no puede recibir un reproche sobre un error que no comete.
  if (option.sound) return m("lure.sound");
  if (option.lure === "factor_dropped" && ask === "recompose") return m("lure.factor_dropped_recompose");
  return m(`lure.${option.lure ?? "distributed_over_product"}`);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  area: { flex: 1, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  hintSlot: { minHeight: 52, alignSelf: "stretch", justifyContent: "center" },
  ringBand: { alignSelf: "stretch", alignItems: "center", paddingBottom: theme.space[2] },
  ring: {
    maxWidth: "100%",
    flexDirection: "row",
    gap: theme.space[2],
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  chip: {
    minWidth: 78,
    height: 56,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    ...chipFace,
    alignItems: "center",
    justifyContent: "center",
  },
  chipGhost: { width: 0, height: 56 },
  chipDim: { opacity: 0.35 },
  chipLabel: { color: theme.color.ink, fontSize: 18, fontVariant: ["tabular-nums"] },
  blockChip: {
    position: "absolute",
    width: CHIP_W,
    height: CHIP_H,
    paddingHorizontal: theme.space[1],
    borderRadius: theme.radius.token,
    ...chipFace,
    borderColor: theme.color.accent,
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  },
  // El número deja pasar el dedo a la ficha: con la pantalla táctil, el
  // arrastre que empezaba sobre el texto nunca llegaba al gesto y la ficha no
  // se movía (en el escritorio sí). Las otras asas no tienen hijos por eso.
  blockChipLabel: {
    color: theme.color.ink,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    pointerEvents: "none",
  },
  definition: {
    color: theme.color.inkDim,
    fontSize: 12,
    maxWidth: 520,
    textAlign: "center",
    paddingHorizontal: 64,
  },
});
