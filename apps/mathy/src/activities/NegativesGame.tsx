/**
 * El ascensor y el caminante: el minijuego de `arith.int.negatives`.
 *
 * Un chico que no lee tiene que poder jugar los cuatro primeros niveles
 * enteros, así que hasta el quinto no hay ningún numeral en pantalla: los pisos
 * se distinguen por altura y por la luz de garaje, las monedas y los vales por
 * forma, y la dirección por la bandera. Los mensajes de abajo son para el
 * adulto que mira.
 *
 * Los gestos, y ninguno fino:
 *
 * - Girar la manivela. El caminante avanza una casilla por diente y el ascensor
 *   un piso, del mismo tamaño de los dos lados del cero. Al pasarlo, la bandera
 *   se da vuelta y la pista sigue.
 * - Tocar una casilla, para decir dónde va a terminar antes de que nada se
 *   mueva.
 * - Tocar al caminante. Gira sin moverse. Dos veces devuelven la dirección, y
 *   ese es todo el contenido de la vuelta doble.
 * - Arrastrar monedas y vales al tablero. Una moneda y un vale del mismo tamaño
 *   se apagan y dejan un hueco; el neto es lo que queda sin pareja. Sacar un
 *   vale del tablero lo sube, y nadie lo dice.
 * - Arrastrar a la caja la ficha del piso que está más abajo.
 * - Arrastrar la calle a otra altura. Todos los pisos cambian de nombre y
 *   ninguna distancia cambia.
 * - Tocar el dibujo al que lleva una ficha de dirección sin numerales.
 *
 * Del catálogo de L, este nodo declara `negative_times_negative` y nada más. Se
 * clasifica en un solo lugar: elegir como correcta la animación en la que el
 * caminante gira dos veces y sigue mirando hacia atrás. Los otros dos errores
 * que el diseño prevé —ordenar por tamaño y no por posición, leer el signo como
 * una orden de restar— no tienen entrada en el catálogo, así que se muestran y
 * no se anotan.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  MIS_DOUBLE_FLIP,
  NODE_NEGATIVES,
  TOTAL_NEG_LEVELS,
  generateNegatives,
  negNameAt,
  negNet,
  negWalk,
  type NegLevel,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  CHIP_VIEWS,
  ElevatorScene,
  TOKEN_VIEWS,
  TOOTH_ANGLE,
  boardSlot,
  elevatorLayout,
  signed,
  type DragView,
} from "../scenes/ElevatorScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Qué agarró el dedo. Vive en un `SharedValue` porque lo decide el hilo de UI. */
const NADA = 0;
const MANIVELA = 1;

type Phase = "explain" | "move" | "play" | "done";

export interface NegativesGameProps {
  readonly level: NegLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function NegativesGame(props: NegativesGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: NegativesGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [phase, setPhase] = useState<Phase>(openingPhase(level));
  const [picked, setPicked] = useState(-1);
  const [tapped, setTapped] = useState(-1);
  const [answered, setAnswered] = useState(-1);
  /** En qué orden entró cada moneda al tablero; -1 si sigue en la bandeja. */
  const [placed, setPlaced] = useState<readonly number[]>([]);
  const [cancelled, setCancelled] = useState<readonly boolean[]>([]);
  /** Cuántas veces el jugador dio vuelta al caminante en esta ronda. */
  const [turns, setTurns] = useState(0);
  /** El índice de la calle ya asentada: con eso se nombran los pisos. */
  const [streetAt, setStreetAt] = useState(0);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(level, 0),
    tone: "dim",
  }));

  const problem = useMemo(
    () => generateNegatives(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = Math.max(360, Math.min(height * 0.68, 560));
  const layout = useMemo(
    () => elevatorLayout(problem, level, width, sceneH),
    [problem, level, width, sceneH],
  );

  const pos = useSharedValue(0);
  const facing = useSharedValue(1);
  /** La vuelta que el jugador dio a mano: multiplica el lado de la bandera. */
  const flip = useSharedValue(1);
  const hint = useSharedValue(0);
  const clock = useSharedValue(0);
  const demo = useSharedValue(0);
  const appear = useSharedValue(0);
  const ghost = useSharedValue(0);
  const street = useSharedValue(0);
  const subject = useSharedValue(NADA);
  const lastAngle = useSharedValue(0);
  /** Cuánto giró la manivela en este tirón, en dientes. */
  const turned = useSharedValue(0);
  /** La casilla donde el caminante está parado de verdad. */
  const at = useSharedValue(0);
  /** El índice de la calle, en el hilo de UI: el gesto no lee el estado de React. */
  const zeroSV = useSharedValue(0);

  // Fichas y monedas montadas siempre: el árbol no puede cambiar entre rondas.
  const chips: DragView[] = [useDrag(), useDrag(), useDrag(), useDrag(), useDrag()];
  const tokens: DragView[] = [useDrag(), useDrag(), useDrag(), useDrag(), useDrag(), useDrag()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * El estado que lee el gesto vive además en referencias. Un worklet captura
   * el callback del render en el que se armó, y si el jugador cambia algo entre
   * medio la copia queda vieja; una referencia no puede quedar vieja.
   */
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const placedRef = useRef<readonly number[]>([]);
  placedRef.current = placed;
  const cancelledRef = useRef<readonly boolean[]>([]);
  cancelledRef.current = cancelled;

  const net = useMemo(
    () => negNet(problem.tokens.filter((_, i) => (placed[i] ?? -1) >= 0)),
    [problem.tokens, placed],
  );
  const netRef = useRef(0);
  netRef.current = net;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    pos.value = problem.start;
    at.value = problem.start;
    facing.value = problem.start >= problem.zeroAt ? 1 : -1;
    flip.value = 1;
    street.value = problem.zeroAt;
    zeroSV.value = problem.zeroAt;
    ghost.value = 0;
    appear.value = withTiming(1, { duration: theme.motion.base });
    setStreetAt(problem.zeroAt);
    setPhase(openingPhase(level));
    setPicked(-1);
    setTapped(-1);
    setAnswered(-1);
    setTurns(0);
    setPlaced(problem.tokens.map(() => -1));
    setCancelled(problem.tokens.map(() => false));
    setMessage({ text: openingHint(level, problem.netTarget), tone: "dim" });

    for (let i = 0; i < CHIP_VIEWS; i++) {
      const view = chips[i] as DragView;
      view.dx.value = 0;
      view.dy.value = 0;
      // Con la calle sin mudar, las fichas todavía no tienen nombre: aparecen
      // cuando el cero queda donde va, que es lo que el nivel pregunta.
      view.alive.value = i < problem.chips.length && level.mode !== "moveZero" ? 1 : 0;
    }
    for (let i = 0; i < TOKEN_VIEWS; i++) {
      const view = tokens[i] as DragView;
      view.dx.value = 0;
      view.dy.value = 0;
      view.alive.value = i < problem.tokens.length ? 1 : 0;
    }

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    if (level.explain) {
      clock.value = 0;
      clock.value = withRepeat(
        withSequence(withTiming(1, { duration: 2800 }), withTiming(0, { duration: 1 })),
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
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_NEGATIVES, layer: level.layer });
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
          node: NODE_NEGATIVES,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_NEGATIVES, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
  }, [round, level.rounds, level.n, onEvent, onLevelDone]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setPhase("done");
      quiet();
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1600);
    },
    [nextRound, quiet],
  );

  // --- El viaje --------------------------------------------------------------

  /**
   * El caminante soltó el pie después de un tirón. `teeth` son los dientes que
   * la manivela giró, con signo; quién decide en qué casilla queda es el modelo,
   * y el tope es el borde de lo dibujado y no el cero.
   */
  const landed = useCallback(
    (teeth: number) => {
      if (phaseRef.current !== "play") return;
      const from = Math.round(at.value);
      const stone = negWalk(from, teeth, problem.slots);
      at.value = stone;
      pos.value = withTiming(stone, { duration: 200 });
      if (stone === from) return;
      quiet();

      const nombre = negNameAt(stone, problem.zeroAt);
      const ok = stone === problem.target;
      attempt(ok);
      if (ok) {
        succeed(
          nombre < 0
            ? "Llegó. Pasó el cero y siguió caminando."
            : "Llegó a la casilla de la bandera.",
        );
        return;
      }
      if (from >= problem.zeroAt && stone < problem.zeroAt) {
        setMessage({ text: "Pasó el cero y se dio vuelta. Seguí girando.", tone: "dim" });
        return;
      }
      setMessage({
        text:
          nombre === 0
            ? "El cero no es el borde: se puede seguir."
            : "Todavía no. Girá hasta la bandera.",
        tone: "dim",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.slots, problem.target, problem.zeroAt, attempt, quiet, succeed],
  );

  /** El toque sobre el caminante: gira sin moverse. Dos veces devuelven. */
  const turnWalker = useCallback(() => {
    if (!level.flip || phaseRef.current !== "play") return;
    flip.value = -flip.value;
    facing.value = flip.value * (Math.round(at.value) >= problem.zeroAt ? 1 : -1);
    setTurns((n) => {
      const next = n + 1;
      setMessage(
        next % 2 === 0
          ? { text: "Dos vueltas, y mira para donde miraba al principio.", tone: "ok" }
          : { text: "Giró sin moverse. Está en la misma casilla.", tone: "dim" },
      );
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.flip, problem.zeroAt]);

  // --- Tocar -----------------------------------------------------------------

  /** `recognize`: decir la casilla donde el tramo va a terminar. */
  const tapStone = useCallback(
    (stone: number) => {
      if (phaseRef.current !== "play" || level.mode !== "floor") return;
      quiet();
      const ok = stone === problem.target;
      attempt(ok);
      if (ok) {
        at.value = stone;
        pos.value = withTiming(stone, { duration: 500 });
        succeed("Ahí terminó, del lado izquierdo del cero.");
        return;
      }
      // La casilla simétrica de la derecha: el signo leído como decoración. No
      // tiene entrada en el catálogo, así que se muestra y no se anota.
      const espejo = problem.zeroAt + (problem.zeroAt - problem.target);
      setMessage(
        stone === espejo
          ? { text: "Esa es la del otro lado. La ficha dice hacia dónde.", tone: "warn" }
          : { text: "Contá los dientes del tope desde el cero.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, problem.target, problem.zeroAt, attempt, quiet, succeed],
  );

  /** `explain`: tocar la vuelta doble que sigue mirando hacia atrás. */
  const pickRow = useCallback(
    (row: number) => {
      if (phaseRef.current !== "explain") return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      // Elegir la honesta es exactamente creer que dos vueltas dejan mirando al
      // revés, que es `negative_times_negative` con el patrón `double_flip`.
      attempt(ok, ok ? undefined : MIS_DOUBLE_FLIP);
      if (ok) {
        setPhase("play");
        setMessage({
          text: "Ese se equivoca: giró dos veces y siguió mirando hacia atrás. Ahora girá la manivela.",
          tone: "ok",
        });
        return;
      }
      setMessage({
        text: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.liar, attempt, quiet],
  );

  /** `generalize`: tocar el dibujo al que lleva la ficha de dirección. */
  const tapDrawing = useCallback(
    (index: number) => {
      if (phaseRef.current !== "play" || level.mode !== "arbitrary") return;
      quiet();
      setTapped(index);
      const ok = index === problem.answer;
      attempt(ok);
      if (ok) {
        succeed("Contó los puntos hacia el lado que decía la flecha, sin ningún número.");
        return;
      }
      const espejo = problem.row.origin - problem.row.dir * problem.row.steps;
      setMessage(
        index === espejo
          ? { text: "Contaste bien, pero para el otro lado. Mirá la flecha.", tone: "warn" }
          : { text: "Contá los puntos desde el dibujo marcado.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, problem.answer, problem.row, attempt, quiet, succeed],
  );

  /** El edificio que el nivel pide con un toque, y que se apaga solo. */
  const askBuilding = useCallback(() => {
    if (level.building !== "onDemand") return;
    ghost.value = withSequence(
      withTiming(1, { duration: 240 }),
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 400 }),
    );
    setMessage({ text: "El edificio vuelve un momento, con las dos paradas marcadas.", tone: "dim" });
  }, [level.building, ghost]);

  // --- Fichas ----------------------------------------------------------------

  /** `apply`: elegir la ficha que dice cuántos pisos separan las dos paradas. */
  const tapChip = useCallback(
    (index: number) => {
      if (phaseRef.current !== "play" || level.mode !== "distance") return;
      const chip = problem.chips[index];
      const view = chips[index];
      if (!chip || !view) return;
      quiet();
      const ok = chip.value === problem.answer;
      attempt(ok);
      if (ok) {
        setAnswered(index);
        succeed("Esos son los pisos entre las dos paradas.");
        return;
      }
      view.dx.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 90 }),
        withTiming(0, { duration: 90 }),
      );
      setMessage(
        chip.lure === "sign_as_decoration"
          ? { text: "Restaste los tamaños. Entre las dos hay que pasar por el cero.", tone: "warn" }
          : { text: "Contá los pisos de una parada a la otra.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, problem.chips, problem.answer, attempt, quiet, succeed],
  );

  /**
   * Soltar la ficha de un piso en la caja marcada.
   *
   * El punto donde se soltó se calcula con el desplazamiento del gesto y no con
   * la posición absoluta del dedo: `onLayout` en web devuelve el origen del
   * lienzo en cero, así que restarlo dejaría el blanco corrido media pantalla.
   */
  const dropChip = useCallback(
    (index: number, tx: number, ty: number) => {
      if (phaseRef.current !== "play") return;
      const chip = problem.chips[index];
      const view = chips[index];
      const home = layout.chips[index];
      if (!chip || !view || !home) return;
      const x = home.x + tx;
      const y = home.y + ty;
      const enCaja =
        Math.abs(x - layout.box.x) < layout.boxW * 0.9 && Math.abs(y - layout.box.y) < layout.boxH * 0.9;

      const volver = (): void => {
        view.dx.value = withTiming(0, { duration: theme.motion.base });
        view.dy.value = withTiming(0, { duration: theme.motion.base });
      };
      if (!enCaja) {
        volver();
        return;
      }

      quiet();
      attempt(chip.correct);
      if (!chip.correct) {
        volver();
        // Ordenar por tamaño y no por posición. El edificio ya está dibujado y
        // muestra dónde queda ese piso: el dibujo es el mensaje.
        setMessage({
          text: "Pusiste ese piso como el más bajo. ¿Cuál está más abajo en el edificio?",
          tone: "warn",
        });
        return;
      }
      view.dx.value = withTiming(layout.box.x - home.x, { duration: 220 });
      view.dy.value = withTiming(layout.box.y - home.y, { duration: 220 });
      setAnswered(index);
      succeed(
        chip.value < 0
          ? `El ${signed(chip.value)} está más abajo, aunque su numeral sea más grande.`
          : "Ese está más abajo en el edificio.",
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.chips, layout, attempt, quiet, succeed],
  );

  // --- El tablero ------------------------------------------------------------

  /** Soltar una moneda o un vale: entra al tablero, o vuelve a la bandeja. */
  const dropToken = useCallback(
    (index: number, tx: number, ty: number) => {
      if (phaseRef.current !== "play") return;
      const token = problem.tokens[index];
      const view = tokens[index];
      const home = layout.tokens[index];
      if (!token || !view || !home) return;
      const x = home.x + tx;
      const y = home.y + ty;
      const b = layout.board;
      const dentro = Math.abs(x - b.x) < b.w / 2 + 20 && y > b.y - 20 && y < b.y + b.h + 20;
      const estaba = (placedRef.current[index] ?? -1) >= 0;

      if (dentro === estaba) {
        // Ni entró ni salió: vuelve a donde estaba, sin decir nada.
        const destino = estaba
          ? boardSlot(layout, token.value, placedRef.current[index] as number)
          : home;
        view.dx.value = withTiming(destino.x - home.x, { duration: theme.motion.base });
        view.dy.value = withTiming(destino.y - home.y, { duration: theme.motion.base });
        return;
      }

      quiet();
      const antes = netRef.current;
      const proximo = [...placedRef.current];
      const orden = proximo.filter((o) => o >= 0).length;
      proximo[index] = dentro ? orden : -1;
      const despues = negNet(problem.tokens.filter((_, i) => (proximo[i] ?? -1) >= 0));

      if (dentro) {
        const destino = boardSlot(layout, token.value, orden);
        view.dx.value = withTiming(destino.x - home.x, { duration: 200 });
        view.dy.value = withTiming(destino.y - home.y, { duration: 200 });
      } else {
        view.dx.value = withTiming(0, { duration: 200 });
        view.dy.value = withTiming(0, { duration: 200 });
      }
      setPlaced(proximo);

      // Una moneda y un vale del mismo tamaño se apagan juntos. El neto no se
      // entera: lo que se apaga ya sumaba cero entre los dos.
      const apagados = [...cancelledRef.current];
      if (dentro) {
        const pareja = problem.tokens.findIndex(
          (o, i) => i !== index && (proximo[i] ?? -1) >= 0 && !apagados[i] && o.value === -token.value,
        );
        if (pareja >= 0) {
          apagados[index] = true;
          apagados[pareja] = true;
          setCancelled(apagados);
        }
      } else if (apagados[index]) {
        apagados[index] = false;
        setCancelled(apagados);
      }

      if (despues === problem.netTarget) {
        attempt(true);
        succeed(`El neto quedó en ${signed(problem.netTarget)}. El ascensor está ahí.`);
        return;
      }
      const acerca = Math.abs(despues - problem.netTarget) < Math.abs(antes - problem.netTarget);
      attempt(acerca);
      setMessage(
        apagados[index]
          ? { text: "Se apagaron los dos. Lo que queda sin pareja es el neto.", tone: "dim" }
          : !dentro
            ? { text: "Sacaste un vale y el neto subió.", tone: "dim" }
            : acerca
              ? { text: `El neto va en ${signed(despues)}.`, tone: "dim" }
              : { text: `Se alejó: el neto quedó en ${signed(despues)}.`, tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.tokens, problem.netTarget, layout, attempt, quiet, succeed],
  );

  // --- La calle --------------------------------------------------------------

  /** La calle se soltó a una altura: los pisos se renombran y nada se mueve. */
  const dropStreet = useCallback(
    (piso: number) => {
      if (phaseRef.current !== "move" || problem.moveTo === null) return;
      quiet();
      const ok = piso === problem.moveTo;
      attempt(ok);
      if (!ok) {
        street.value = withTiming(problem.zeroAt, { duration: theme.motion.base });
        setMessage({ text: "La calle va a la altura marcada. Volvé a arrastrarla.", tone: "warn" });
        return;
      }
      street.value = withTiming(piso, { duration: theme.motion.quick });
      zeroSV.value = piso;
      setStreetAt(piso);
      setPhase("play");
      for (let i = 0; i < CHIP_VIEWS; i++) {
        const view = chips[i] as DragView;
        view.alive.value = i < problem.chips.length ? withTiming(1, { duration: 320 }) : 0;
      }
      setMessage({
        text: "Todos los pisos cambiaron de nombre. Ahora arrastrá el que está más abajo.",
        tone: "ok",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.moveTo, problem.zeroAt, problem.chips.length, attempt, quiet],
  );

  // --- Gestos ----------------------------------------------------------------

  const crank = layout.crank;
  const slots = problem.slots;
  const zeroAt = problem.zeroAt;
  const stoneXs = useMemo(() => layout.stones.map((s) => s.x), [layout.stones]);
  const railY = layout.railY;
  const drawXs = useMemo(() => layout.drawings.map((s) => s.x), [layout.drawings]);
  const drawY = layout.drawings[0]?.y ?? 0;
  const drawR = layout.drawingR;
  const rowsY = layout.rows;
  const conManivela = level.mode === "cross" || level.mode === "turn";

  // La manivela solo escucha donde hay manivela. Un `Pan` habilitado siempre
  // gana la carrera contra el `Tap` y se come todos los toques: el nivel que
  // anticipa y el de los dibujos dejarían de poder contestarse.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(conManivela && phase === "play")
        .onBegin((e) => {
          subject.value =
            conManivela && Math.hypot(e.x - crank.x, e.y - crank.y) < crank.r * 1.7 ? MANIVELA : NADA;
          if (subject.value === MANIVELA) {
            lastAngle.value = Math.atan2(e.y - crank.y, e.x - crank.x);
            turned.value = 0;
          }
        })
        .onChange((e) => {
          if (subject.value !== MANIVELA) return;
          const a = Math.atan2(e.y - crank.y, e.x - crank.x);
          let d = a - lastAngle.value;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          turned.value += d / TOOTH_ANGLE;
          lastAngle.value = a;
          // El paso es entero y mide lo mismo de los dos lados: entre dos
          // dientes no hay nada que el gesto pueda expresar.
          const stone = negWalk(at.value, Math.round(turned.value), slots);
          pos.value = stone;
          // La bandera se da vuelta al cruzar el cero, y esa vuelta es la que
          // en la capa simbólica se acuesta y se vuelve el trazo del signo.
          facing.value = flip.value * (stone >= zeroAt ? 1 : -1);
        })
        .onEnd(() => {
          if (subject.value !== MANIVELA) return;
          const dientes = Math.round(turned.value);
          if (dientes !== 0) runOnJS(landed)(dientes);
          turned.value = 0;
          subject.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conManivela, phase, crank, slots, zeroAt, landed],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .onEnd((e) => {
          if (phaseRef.current === "explain") {
            let fila = 0;
            let best = Infinity;
            for (let i = 0; i < rowsY.length; i++) {
              const d = Math.abs(e.y - (rowsY[i] as number));
              if (d < best) {
                best = d;
                fila = i;
              }
            }
            runOnJS(pickRow)(fila);
            return;
          }
          if (drawXs.length > 0 && Math.abs(e.y - drawY) < drawR * 2) {
            let best = -1;
            let bestD = drawR * 1.6;
            for (let i = 0; i < drawXs.length; i++) {
              const d = Math.abs(e.x - (drawXs[i] as number));
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            }
            if (best >= 0) {
              runOnJS(tapDrawing)(best);
              return;
            }
          }
          if (stoneXs.length === 0) return;
          let best = -1;
          let bestD = Math.max(layout.touchR, 30);
          for (let i = 0; i < stoneXs.length; i++) {
            const d = Math.hypot(e.x - (stoneXs[i] as number), e.y - railY);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (best >= 0) runOnJS(tapStone)(best);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowsY, stoneXs, railY, drawXs, drawY, drawR, layout.touchR, pickRow, tapStone, tapDrawing],
  );

  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  /**
   * El arrastre de la calle. Snapea a un piso: no hay medias alturas.
   *
   * `e.y` viene medido desde el borde de la vista que escucha, no desde el
   * lienzo, así que hay que sumarle dónde empieza esa vista. Con el gesto del
   * lienzo entero la diferencia es cero y no se nota; acá son nueve pisos.
   */
  const shaft = layout.shaft;
  const shaftTop = shaft.bottom - slots * shaft.floorH;
  const streetPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(level.mode === "moveZero")
        .onChange((e) => {
          const piso = (shaft.bottom - (shaftTop + e.y)) / shaft.floorH;
          street.value = Math.max(0, Math.min(slots - 1, piso));
        })
        .onEnd(() => {
          const piso = Math.max(0, Math.min(slots - 1, Math.round(street.value)));
          street.value = piso;
          runOnJS(dropStreet)(piso);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, shaft.bottom, shaft.floorH, shaftTop, slots, dropStreet],
  );

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_NEGATIVES}.name`)} · nivel ${level.n} de ${TOTAL_NEG_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <ElevatorScene
            problem={problem}
            level={level}
            layout={layout}
            pos={pos}
            facing={facing}
            hint={hint}
            clock={clock}
            demo={demo}
            appear={appear}
            ghost={ghost}
            pinned={phase === "move"}
            street={street}
            zero={streetAt}
            loaded={level.mode === "floor" ? problem.step : 0}
            net={net}
            placed={placed}
            cancelled={cancelled}
            answered={answered}
            picked={picked}
            tapped={tapped}
            phase={phase}
            chips={chips}
            tokens={tokens}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* El caminante, con su propia asa. Girar es un gesto aparte de
            caminar, y a propósito: si compartiera la carrera con la manivela,
            el toque se lo comería el arrastre. */}
        {level.flip ? (
          <WalkerHandle
            pos={pos}
            x0={layout.stones[0]?.x ?? 0}
            step={layout.railStep}
            y={layout.railY}
            enabled={phase === "play"}
            onTap={turnWalker}
          />
        ) : null}

        {/* La calle, arrastrable a otra altura. */}
        {level.mode === "moveZero" ? (
          <GestureDetector gesture={streetPan}>
            <Animated.View
              style={{
                position: "absolute",
                left: shaft.x - shaft.w,
                top: shaft.bottom - slots * shaft.floorH,
                width: shaft.w * 2,
                height: slots * shaft.floorH,
              }}
            />
          </GestureDetector>
        ) : null}

        {/* El edificio a pedido: un toque lo devuelve y se apaga solo. Mientras
            la calle se muda no está: el edificio ya se ve, y su asa taparía el
            arrastre de la calle, que ocupa el mismo lugar. */}
        {level.building === "onDemand" && phase !== "move" ? (
          <Pressable
            onPress={askBuilding}
            style={{
              position: "absolute",
              left: shaft.x - shaft.w * 0.7,
              top: shaft.bottom - slots * shaft.floorH,
              width: shaft.w * 1.4,
              height: slots * shaft.floorH,
            }}
          />
        ) : null}

        {/* Siempre las mismas asas: las que esta ronda no usa quedan sordas. */}
        {Array.from({ length: CHIP_VIEWS }, (_, i) => (
          <DragHandle
            key={`chip${i}`}
            index={i}
            view={chips[i] as DragView}
            spot={layout.chips[i] ?? { x: 0, y: 0 }}
            w={layout.chipW}
            h={layout.chipH}
            enabled={i < problem.chips.length && phase === "play"}
            draggable={level.mode === "compare" || level.mode === "moveZero"}
            onDrop={dropChip}
            onTap={tapChip}
          />
        ))}
        {Array.from({ length: TOKEN_VIEWS }, (_, i) => (
          <TokenHandle
            key={`tok${i}`}
            index={i}
            view={tokens[i] as DragView}
            spot={layout.tokens[i] ?? { x: 0, y: 0 }}
            r={layout.tokenR}
            enabled={i < problem.tokens.length && phase === "play"}
            onDrop={dropToken}
          />
        ))}
      </View>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

/**
 * Un asa invisible sobre la ficha dibujada: el numeral es dibujo, no interfaz.
 * Donde se compara la ficha se arrastra hasta la caja; donde se elige un número
 * se toca, porque lo que se elige es un número y no un lugar.
 */
function DragHandle({
  index,
  view,
  spot,
  w,
  h,
  enabled,
  draggable,
  onDrop,
  onTap,
}: {
  readonly index: number;
  readonly view: DragView;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly draggable: boolean;
  readonly onDrop: (index: number, tx: number, ty: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const gesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)(index);
      });
    const pan = Gesture.Pan()
      .enabled(enabled && draggable)
      .onChange((e) => {
        view.dx.value = e.translationX;
        view.dy.value = e.translationY;
      })
      .onEnd((e) => {
        runOnJS(onDrop)(index, e.translationX, e.translationY);
      });
    return Gesture.Race(pan, tap);
  }, [enabled, draggable, index, view, onDrop, onTap]);

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

/**
 * El asa de una moneda o un vale. A diferencia de la ficha, la moneda se queda
 * donde el jugador la dejó, así que el asa tiene que seguirla: una vez en el
 * tablero, sacarla es agarrarla de ahí y no del lugar donde estaba antes.
 *
 * Por eso el arrastre acumula sobre el desplazamiento que la moneda ya tenía y
 * no sobre cero: el gesto informa cuánto se movió el dedo desde que empezó, no
 * dónde está la moneda.
 */
function TokenHandle({
  index,
  view,
  spot,
  r,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly view: DragView;
  readonly spot: { x: number; y: number };
  readonly r: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, tx: number, ty: number) => void;
}) {
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onBegin(() => {
          sx.value = view.dx.value;
          sy.value = view.dy.value;
        })
        .onChange((e) => {
          view.dx.value = sx.value + e.translationX;
          view.dy.value = sy.value + e.translationY;
        })
        .onEnd(() => {
          runOnJS(onDrop)(index, view.dx.value, view.dy.value);
        }),
    [enabled, index, view, onDrop, sx, sy],
  );

  const style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: spot.x - r - 8,
    top: spot.y - r - 8,
    width: r * 2 + 16,
    height: r * 2 + 16,
    transform: [{ translateX: view.dx.value }, { translateY: view.dy.value }],
  }), [spot, r]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
}

/**
 * El asa del caminante. Sigue a la posición sin volver nunca al hilo de
 * JavaScript: el caminante se mueve mientras el dedo gira la manivela, y el asa
 * tiene que estar donde el caminante está y no donde estaba al montarse.
 */
function WalkerHandle({
  pos,
  x0,
  step,
  y,
  enabled,
  onTap,
}: {
  readonly pos: { readonly value: number };
  readonly x0: number;
  readonly step: number;
  readonly y: number;
  readonly enabled: boolean;
  readonly onTap: () => void;
}) {
  const gesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(20)
        .enabled(enabled)
        .onEnd(() => {
          runOnJS(onTap)();
        }),
    [enabled, onTap],
  );
  const style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: x0 - 24,
    top: y - 46,
    width: 48,
    height: 60,
    transform: [{ translateX: step * pos.value }],
  }), [x0, step, y]);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
}

function useDrag(): DragView {
  return {
    dx: useSharedValue(0),
    dy: useSharedValue(0),
    alive: useSharedValue(0),
  };
}

function openingPhase(level: NegLevel): Phase {
  if (level.explain) return "explain";
  if (level.mode === "moveZero") return "move";
  return "play";
}

function openingHint(level: NegLevel, netTarget: number): string {
  switch (level.mode) {
    case "cross":
      return "Girá la manivela hasta la bandera. El cero no frena.";
    case "floor":
      return "Mirá el tope y tocá la casilla donde va a terminar.";
    case "ledger":
      return `Arrastrá monedas y vales hasta que el neto sea ${signed(netTarget)}.`;
    case "turn":
      return "Uno de los dos gira dos veces y sigue mirando hacia atrás. Tocalo.";
    case "compare":
      return "Arrastrá a la caja la ficha del piso que está más abajo.";
    case "distance":
      return "Tocá la ficha que dice cuántos pisos hay entre las dos paradas.";
    case "moveZero":
      return "Arrastrá la calle hasta la altura marcada.";
    default:
      return "Cada número tiene un opuesto, a la misma distancia del cero y del otro lado.";
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
