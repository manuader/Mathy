/**
 * Cajas en el libro de cuentas: el minijuego de `prealg.var.unknown_as_box`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Sin lección, una mano
 * fantasma lleva el primer objeto a una fila y la fila contesta; con lección,
 * la guía de Lumi señala lo mismo sobre el tablero de la primera ronda y Tomi
 * lo repite cuando el jugador se traba. Los mensajes de abajo son para el
 * adulto que mira, y los dice el módulo de la lección (`lessons/unknown-box.ts`).
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
 * - Y todo lo anterior también de a dos toques: tocar un objeto lo levanta, y
 *   tocar una fila, el plato o la hoja lo deja ahí. Con un mouse, un clic es lo
 *   natural; exigir arrastrar dejaba al jugador sin saber por qué no pasaba nada.
 *
 * Nada que se suelta en el aire vuelve en silencio: la línea de abajo dice
 * adónde iba.
 *
 * El único error que clasifica es `variable_as_label`, que es el único que el
 * catálogo de L declara sobre este nodo: juntar la fila de una marca con la de
 * otra, que es de dónde sale `5xy`. Dejar una manzana en la fila de las peras
 * es un error y no una idea equivocada sobre las letras: se muestra y no se
 * anota. Abrir una fila nueva para una marca que ya tenía la suya tampoco es un
 * error: recibe un empujón suave y ninguna explicación.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import { boxMsg } from "../lessons/unknown-box.ts";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;
/** Cuánto aire tiene alrededor una fila. Una mano de cinco años no apunta fino. */
const ROW_SLOP = 26;
/** El blanco de una hoja del árbol: con el árbol angosto del teléfono, el nodo mide 26 px. */
const LEAF_R = 40;
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
    text: conLeccion ? "" : apertura(ask, level, 0),
    tone: "dim",
  }));

  // Con lección, el cartel de Lumi se lleva su franja de arriba y el lienzo cede.
  // En el teléfono el cartel ocupa el doble de renglones: con la misma
  // proporción, el encabezado quedaba debajo de la barra y la línea de abajo se
  // salía de la pantalla.
  const angosta = width < 520;
  const sceneH = Math.max(
    angosta ? 300 : 340,
    Math.min(height * (conLeccion ? (angosta ? 0.41 : 0.56) : 0.62), 520),
  );

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
  /** El objeto levantado con un toque, que espera el toque que lo deja. O -1. */
  const elegido = useRef(-1);

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

  const openingRef = useRef(conLeccion);
  openingRef.current = conLeccion;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    elegido.current = -1;
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
    setMessage({
      text: openingRef.current ? "" : apertura(problem.ask, level, roundRef.current),
      tone: "dim",
    });

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
    // libro y no dice nada de la balanza ni del árbol, que tienen la suya. Con
    // guía, la luz de Lumi es la demostración: dos manos a la vez señalarían
    // dos cosas distintas, y en las rondas siguientes la pista de Tomi señala
    // lo mismo cuando hace falta.
    demo.value =
      problem.ask === "sort" && !guided
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

  // El reloj de la latencia arranca cuando empieza el juego, no detrás de la
  // tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [playing]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_UNKNOWN_BOX, layer: level.layer });
  }, [level.layer, onEvent]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa. Por
  // referencia y no por dependencia: el callback de un gesto puede estar un
  // render atrasado (trampa 8).
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);

  /**
   * Qué paso de la guía muestra la pista de Tomi en esta ronda. El nivel 5
   * alterna ordenar con la hoja del árbol, y los niveles de recordatorio no
   * tienen paso de gesto: sin elegir, la pista hablaría del gesto de otra ronda.
   */
  const pasos = lesson?.lesson?.coach;
  const preferHint = lesson?.preferHint;
  const pistaDeRonda = useMemo(() => {
    const ids = (pasos ?? []).map((s) => s.id);
    const quiero = ask === "leaf" ? "leaf" : ask === "weigh" ? "level" : "fill";
    return [quiero, "recall"].find((id) => ids.includes(id)) ?? null;
  }, [pasos, ask]);
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

  /**
   * Cerrar la ronda, salvo que la guía esté explicando lo que acaba de pasar:
   * entonces queda pendiente y se cierra cuando el jugador dice "entendido".
   */
  const holding = useRef(false);
  holding.current = step?.holds === true;
  const pendiente = useRef(false);
  const advance = useCallback(() => {
    if (holding.current) {
      pendiente.current = true;
      return;
    }
    nextRound();
  }, [nextRound]);
  useEffect(() => {
    if (step?.holds === true || !pendiente.current) return;
    pendiente.current = false;
    nextRound();
  }, [step, nextRound]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      elegido.current = -1;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      // La ronda que abre el cajón necesita más tiempo: lo que se comprueba es
      // que adentro había lo que la balanza dijo, y eso hay que verlo.
      setTimeout(advance, vivo.current.problem.ask === "weigh" ? 3200 : 1800);
    },
    [advance, quiet],
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
        say("solved");
        succeed("Cada cosa quedó en su fila, y el conteo dice cuántas hay de cada una.");
      }
    },
    [espejar, succeed, say],
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
        attempt(true);
        say("placed");
        if (clase?.closed === true) say("crateIn");
        setMessage({
          text: "Fila nueva para esa marca. Es la única jugada que el libro acepta.",
          tone: "dim",
        });
        acomodar(index, row);
        return;
      }

      const fila = v.problem.kinds[dueno];
      if (boxRowAccepts(fila, clase)) {
        m.counts[row] = (m.counts[row] ?? 0) + 1;
        attempt(true);
        say("placed");
        if (clase?.closed === true) say("crateIn");
        setMessage({ text: "Entró en su fila. El conteo dice cuántas van.", tone: "dim" });
        acomodar(index, row);
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
    [attempt, quiet, replayError, say, acomodar],
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
      say("weighed");
      // Poner una manzana más no es contestar mal: es ir llegando. Lo que se
      // anota es la barra derecha y el pasarse, que sí son respuestas.
      if (puestas >= w.target) attempt(puestas === w.target);
      if (puestas === w.target) {
        // La barra quedó derecha: recién ahí se abre el cajón, y lo que hay
        // adentro es lo que la balanza ya había dicho.
        say("levelled");
        openness.value = withDelay(420, withTiming(1, { duration: theme.motion.reveal }));
        succeed("La barra quedó derecha: la fruta pesa lo mismo que los cajones, y nadie los abrió.");
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
    [attempt, espejar, inclinar, quiet, succeed, say],
  );

  /** Un toque en el plato saca una manzana: pasarse tiene vuelta. */
  const takeFromPan = useCallback(() => {
    const v = vivo.current;
    const w = v.problem.weigh;
    const m = mesa.current;
    if (!w || v.solved) return;
    if (m.onPan <= 0) {
      setMessage({ text: t(boxMsg("panEmpty")), tone: "dim" });
      return;
    }
    const i = m.placed.lastIndexOf(EN_PLATO);
    if (i < 0) return;
    m.onPan -= 1;
    m.placed[i] = EN_MOSTRADOR;
    espejar();
    inclinar(m.onPan, w.target);
    // Pasarse y sacar hasta la cuenta justa también deja la barra derecha, y
    // tiene que abrir el cajón igual que llegar sin pasarse: antes la barra
    // quedaba derecha y la ronda no se cerraba nunca.
    if (m.onPan === w.target) {
      attempt(true);
      say("levelled");
      openness.value = withDelay(420, withTiming(1, { duration: theme.motion.reveal }));
      succeed("La barra quedó derecha: la fruta pesa lo mismo que los cajones, y nadie los abrió.");
      return;
    }
    setMessage({ text: "Sacaste una del plato. La barra vuelve a contestar.", tone: "dim" });
  }, [espejar, inclinar, attempt, say, succeed, openness]);

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
      say("leafed");
      succeed("El árbol quedó completo, y todavía nadie sabe cuánto hay en esa caja.");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, espejar, quiet, succeed, say],
  );

  // --- Dónde cae lo que se suelta --------------------------------------------

  /** La fila bajo un punto, con aire alrededor, o -1. */
  const filaEn = useCallback(
    (x: number, y: number): number => {
      for (let i = 0; i < problem.rows; i++) {
        const r = layout.rows[i];
        if (!r) continue;
        if (
          x > r.x - ROW_SLOP * 2 &&
          x < r.x + r.w + ROW_SLOP &&
          y > r.y - ROW_SLOP * 0.4 &&
          y < r.y + r.h + ROW_SLOP * 0.4
        ) {
          return i;
        }
      }
      return -1;
    },
    [problem.rows, layout.rows],
  );

  const platoX = layout.balance.x + zones.rightX;
  const platoY = layout.balance.y + zones.y;
  const sobrePlato = useCallback(
    (x: number, y: number): boolean => Math.hypot(x - platoX, y - platoY) < zones.radius,
    [platoX, platoY, zones.radius],
  );

  /**
   * El nodo del árbol más cercano al punto, dentro de un blanco generoso. Antes
   * ganaba el primero de la lista que quedara cerca, y con el árbol angosto del
   * teléfono eso era la rama de arriba aunque el dedo estuviera sobre la hoja.
   */
  const nodoEn = useCallback(
    (x: number, y: number): number => {
      const r = Math.max(LEAF_R, layout.nodeR * 2.2);
      let mejor = -1;
      let cerca = r;
      layout.nodes.forEach((n, i) => {
        const d = Math.hypot(x - n.x, y - n.y);
        if (d < cerca) {
          cerca = d;
          mejor = i;
        }
      });
      return mejor;
    },
    [layout.nodes, layout.nodeR],
  );

  /** Deja un objeto donde cayó. Lo que no cae en ningún lado vuelve y la línea lo dice. */
  const dejar = useCallback(
    (index: number, x: number, y: number) => {
      if (vivo.current.solved) return;
      if (ask === "weigh") {
        if (sobrePlato(x, y)) dropOnPan(index);
        else setMessage({ text: t(boxMsg("panBack")), tone: "dim" });
        return;
      }
      if (ask === "leaf") {
        const n = nodoEn(x, y);
        if (n >= 0) dropOnTree(index, n);
        else setMessage({ text: t(boxMsg("leafBack")), tone: "dim" });
        return;
      }
      const fila = filaEn(x, y);
      if (fila >= 0) dropOnRow(index, fila);
      else setMessage({ text: t(boxMsg("rowBack")), tone: "dim" });
    },
    [ask, sobrePlato, nodoEn, filaEn, dropOnPan, dropOnTree, dropOnRow],
  );

  /** Levanta un objeto con un toque: el próximo toque sobre un destino lo deja ahí. */
  const elegir = useCallback(
    (index: number) => {
      elegido.current = index;
      dragIdx.value = index;
      setMessage({
        text: t(boxMsg(ask === "weigh" ? "pickedPan" : ask === "leaf" ? "pickedLeaf" : "pickedRow")),
        tone: "dim",
      });
    },
    [ask, dragIdx],
  );

  /** El final de cualquier gesto sobre el lienzo: soltar, tocar para levantar o para dejar. */
  const fin = useCallback(
    (index: number, x: number, y: number, movido: number) => {
      if (vivo.current.solved) return;
      if (movido < TAP_SLOP) {
        if (index >= 0) {
          if (elegido.current === index) {
            elegido.current = -1;
            dragIdx.value = -1;
            return;
          }
          elegir(index);
          return;
        }
        const e = elegido.current;
        if (e >= 0) {
          elegido.current = -1;
          dejar(e, x, y);
          return;
        }
        // Un toque sobre el plato saca una manzana: solo existe donde hay algo
        // que deshacer.
        if (ask === "weigh" && sobrePlato(x, y)) takeFromPan();
        return;
      }
      if (index < 0) return;
      elegido.current = -1;
      dejar(index, x, y);
    },
    [ask, dejar, elegir, sobrePlato, takeFromPan, dragIdx],
  );

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda: el objeto
   * que conviene levantar y la fila donde va, el plato libre, la hoja vacía. Se
   * recalcula con cada movimiento, así la luz siempre apunta a un gesto que
   * todavía falta. La pista de Tomi reusa los pasos: señala lo mismo, pero no
   * frena la ronda.
   */
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const id = shown.id;
    const filas = layout.rows.slice(0, problem.rows);
    const libro = union(filas.map((r) => ({ x: r.x - 48, y: r.y - 6, w: r.w + 56, h: r.h + 12 })));
    const mostrador: Rect = { x: layout.tray.x, y: layout.tray.y - 8, w: layout.tray.w, h: layout.tray.h + 16 };
    const balanza: Rect = { x: layout.balance.x, y: layout.balance.y, w: layout.balance.w, h: layout.balance.h };
    const plato: Rect = {
      x: platoX - zones.radius,
      y: platoY - zones.radius * 0.9,
      w: zones.radius * 2,
      h: zones.radius * 1.5,
    };
    const hojaI = problem.tree.findIndex((n) => n.unknown);
    const hojaP = hojaI >= 0 ? layout.nodes[hojaI] : undefined;
    const r = Math.max(layout.nodeR * 1.5, 22);
    const hoja: Rect | null = hojaP ? { x: hojaP.x - r, y: hojaP.y - r, w: r * 2, h: r * 2 } : null;
    const arbol = union(layout.nodes.map((n) => ({ x: n.x - r, y: n.y - r, w: r * 2, h: r * 2 })));
    const solo = (rs: readonly (Rect | null)[]): Focus => ({ rings: rs.filter((x): x is Rect => x !== null) });

    /** El primer objeto que sigue en el mostrador; con `cajon`, un cajón si queda alguno. */
    const suelto = (cajon: boolean): number => {
      let alt = -1;
      for (let i = 0; i < problem.tokens.length; i++) {
        if ((placed[i] ?? EN_MOSTRADOR) !== EN_MOSTRADOR) continue;
        const k = problem.kinds[problem.tokens[i]?.kind ?? -1];
        if (cajon && k?.closed === true) return i;
        if (alt < 0) alt = i;
      }
      return alt;
    };
    const desde = (i: number): Pt | null => {
      const p = places[i];
      return p && p.on ? { x: p.x, y: p.y } : null;
    };

    if (ask === "weigh") {
      if (id === "look" || id === "reveal") return solo([balanza]);
      if (onPan > (problem.weigh?.target ?? 0)) return solo([plato]);
      const from = desde(suelto(false));
      return from ? { rings: [plato], drag: { from, to: { x: platoX, y: platoY } } } : solo([plato]);
    }
    if (ask === "leaf") {
      if (id === "look") return solo([arbol]);
      if (id === "reveal") return solo([hoja]);
      const from = desde(0);
      return from && hojaP ? { rings: [hoja ?? arbol ?? mostrador], drag: { from, to: hojaP } } : solo([hoja]);
    }
    if (id === "look") return solo([mostrador, libro]);
    if (id === "reveal") return solo([libro]);
    const i = suelto(id === "crate");
    const from = desde(i);
    const kind = problem.tokens[i]?.kind ?? -1;
    const propia = owner.indexOf(kind);
    const fila = propia >= 0 ? propia : owner.findIndex((o, j) => j < problem.rows && o === SIN_DUENO);
    const caja = fila >= 0 ? layout.rows[fila] : undefined;
    if (!from || !caja) return solo([libro]);
    const n = counts[fila] ?? 0;
    const to = { x: Math.min(caja.x + caja.w - 22, caja.x + 20 + (n + 0.5) * layout.slotW), y: caja.y + caja.h / 2 };
    return {
      rings: [{ x: caja.x - 8, y: caja.y - 4, w: caja.w + 16, h: caja.h + 8 }],
      drag: { from, to },
    };
  }, [shown, layout, problem, ask, placed, places, owner, counts, onPan, platoX, platoY, zones.radius]);

  // --- Gestos ----------------------------------------------------------------

  /**
   * Lo poco que el gesto necesita en el hilo de animación, en un solo
   * `SharedValue`: qué objetos hay para agarrar y si la ronda sigue abierta.
   * Dónde cae lo soltado se decide en JavaScript, con la geometría de este
   * render leída por referencia: un worklet se queda con el cierre en que se
   * armó, y la geometría de la primera ronda sería la de siempre.
   */
  const geo = useSharedValue({
    activo: 0,
    tomado: -1,
    desdeX: 0,
    desdeY: 0,
    radio: 24,
    tokens: [] as { i: number; x: number; y: number }[],
  });

  useEffect(() => {
    geo.value = {
      // Qué se puede tocar es parte de la geometría y no del objeto del gesto:
      // deshabilitarlo con `.enabled()` lo obligaría a cambiar de identidad.
      activo: solved ? 0 : 1,
      tomado: -1,
      desdeX: 0,
      desdeY: 0,
      radio: Math.max(26, layout.unit * 2.6),
      tokens: places
        .map((p, i) => ({ i, x: p.x, y: p.y, on: p.on }))
        .filter((p) => p.on)
        .map((p) => ({ i: p.i, x: p.x, y: p.y })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, layout, solved]);

  const ultimo = useRef(fin);
  ultimo.current = fin;
  const alTerminar = useCallback(
    (index: number, x: number, y: number, movido: number) => ultimo.current(index, x, y, movido),
    [],
  );

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
          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          // Un toque sobre un objeto lo deja levantado: el dedo ya se fue y el
          // objeto sigue arriba, esperando adónde ir.
          if (!(movido < TAP_SLOP && idx >= 0)) dragIdx.value = -1;
          dragX.value = withTiming(0, { duration: theme.motion.base });
          dragY.value = withTiming(0, { duration: theme.motion.base });
          if (!g.activo) return;
          runOnJS(alTerminar)(idx, e.x, e.y, movido);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={styles.root}>

      <Header
        title={`${t(`node.${NODE_UNKNOWN_BOX}.name`)} · nivel ${level.n} de ${TOTAL_BOX_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!conLeccion}
      />

      <CoachBanner round={round} rounds={level.rounds} />

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

        {/* La luz de la guía, encima de todo y sin llevarse ningún toque. */}
        <Spotlight focus={focus} />
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

/** El rectángulo que abraza a todos: para señalar un grupo con un solo anillo. */
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
  void index;
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

/** Lo primero que se ve sin lección. Con lección, eso lo dice el cartel del objetivo. */
function apertura(ask: string, level: BoxLevel, round: number): string {
  void round;
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
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  definition: {
    color: theme.color.inkDim,
    fontSize: 12,
    maxWidth: 520,
    textAlign: "center",
  },
});
