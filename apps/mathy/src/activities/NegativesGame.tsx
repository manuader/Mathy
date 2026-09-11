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
 * Todo rechazo dice algo en la línea de abajo: la moneda que vuelve a la
 * bandeja, la ficha que no llegó a la caja, la calle que quedó lejos de la
 * raya, la manivela que en el nivel que anticipa no se gira.
 *
 * Del catálogo de L, este nodo declara `negative_times_negative` y nada más. Se
 * clasifica en un solo lugar: elegir como correcta la animación en la que el
 * caminante gira dos veces y sigue mirando hacia atrás. Los otros dos errores
 * que el diseño prevé —ordenar por tamaño y no por posición, leer el signo como
 * una orden de restar— no tienen entrada en el catálogo, así que se muestran y
 * no se anotan.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
  MIS_DOUBLE_FLIP,
  NEG_CHIP_SLOTS,
  NEG_TOKEN_SLOTS,
  NODE_NEGATIVES,
  TOTAL_NEG_LEVELS,
  generateNegatives,
  negNameAt,
  negNet,
  negWalk,
  type NegLevel,
  type NegProblem,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TOOTH_ANGLE,
  TrackScene,
  boardSlot,
  signed,
  trackLayout,
  type DragView,
  type TrackConfig,
  type TrackGhost,
  type TrackLayout,
} from "../scenes/TrackScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
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

function Activity({ level, onLevelDone, onEvent }: NegativesGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  const withLesson = lesson?.lesson !== undefined;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [phase, setPhase] = useState<Phase>(openingPhase(level));
  const [picked, setPicked] = useState(-1);
  const [tapped, setTapped] = useState(-1);
  const [answered, setAnswered] = useState(-1);
  /** En qué orden entró cada moneda al tablero; -1 si sigue en la bandeja. */
  const [placed, setPlaced] = useState<readonly number[]>([]);
  const [cancelled, setCancelled] = useState<readonly boolean[]>([]);
  /** El índice de la calle ya asentada: con eso se nombran los pisos. */
  const [streetAt, setStreetAt] = useState(0);
  /** La casilla donde quedó el caminante, para que la guía señale desde ahí. */
  const [walkerAt, setWalkerAt] = useState(0);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: withLesson ? "" : openingHint(level, 0),
    tone: "dim",
  }));

  const problem = useMemo(
    () => generateNegatives(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = sceneHeight(width, height, withLesson, 360);
  const config = useMemo(() => negConfig(problem, level), [problem, level]);
  const layout = useMemo(() => trackLayout(config, width, sceneH), [config, width, sceneH]);

  const pos = useSharedValue(0);
  const facing = useSharedValue(1);
  /** La vuelta que el jugador dio a mano: multiplica el lado de la bandera. */
  const flip = useSharedValue(1);
  const hint = useSharedValue(0);
  const clock = useSharedValue(0);
  const demo = useSharedValue(0);
  const appear = useSharedValue(0);
  /** El edificio que el nivel 6 pide con un toque. */
  const reveal = useSharedValue(0);
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
  const turnsRef = useRef(0);
  const lastStone = useRef(0);

  const net = useMemo(
    () => negNet(problem.tokens.filter((_, i) => (placed[i] ?? -1) >= 0)),
    [problem.tokens, placed],
  );
  const netRef = useRef(0);
  netRef.current = net;

  useEffect(() => {
    doneRef.current = false;
    turnsRef.current = 0;
    lastStone.current = problem.start;
    setWalkerAt(problem.start);
    pos.value = problem.start;
    at.value = problem.start;
    facing.value = problem.start >= problem.zeroAt ? 1 : -1;
    flip.value = 1;
    street.value = problem.zeroAt;
    zeroSV.value = problem.zeroAt;
    reveal.value = 0;
    appear.value = withTiming(1, { duration: theme.motion.base });
    setStreetAt(problem.zeroAt);
    setPhase(openingPhase(level));
    setPicked(-1);
    setTapped(-1);
    setAnswered(-1);
    setPlaced(problem.tokens.map(() => -1));
    setCancelled(problem.tokens.map(() => false));
    setMessage({ text: withLesson ? "" : openingHint(level, problem.netTarget), tone: "dim" });

    for (let i = 0; i < NEG_CHIP_SLOTS; i++) {
      const view = chips[i] as DragView;
      view.dx.value = 0;
      view.dy.value = 0;
      // Con la calle sin mudar, las fichas todavía no tienen nombre: aparecen
      // cuando el cero queda donde va, que es lo que el nivel pregunta.
      view.alive.value = i < problem.chips.length && level.mode !== "moveZero" ? 1 : 0;
    }
    for (let i = 0; i < NEG_TOKEN_SLOTS; i++) {
      const view = tokens[i] as DragView;
      view.dx.value = 0;
      view.dy.value = 0;
      view.alive.value = i < problem.tokens.length ? 1 : 0;
    }

    // El latido de la manivela y de lo marcado no es un adorno: dice dónde se juega.
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

  // El reloj de la latencia arranca con el nivel en juego, no con la tarjeta.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem, playing]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa.
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);

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

  /**
   * Cerrar la ronda, salvo que la guía esté explicando lo que acaba de pasar:
   * entonces queda pendiente y se cierra cuando el jugador dice "entendido".
   */
  const holding = useRef(false);
  holding.current = step?.holds === true;
  const pending = useRef(false);
  const closeRound = useCallback(() => {
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
      setPhase("done");
      quiet();
      setMessage({ text, tone: "ok" });
      setTimeout(closeRound, 1600);
    },
    [closeRound, quiet],
  );

  // --- El viaje --------------------------------------------------------------

  /**
   * El caminante soltó el pie después de un tirón. `teeth` son los dientes que
   * la manivela giró, con signo; quién decide en qué casilla queda es el modelo,
   * y el tope es el borde de lo dibujado y no el cero.
   *
   * Cada soltada que movió al caminante es un intento: acercarse a la bandera
   * avanza y alejarse no. Soltar a mitad de camino no es un error.
   */
  const landed = useCallback(
    (teeth: number) => {
      if (phaseRef.current !== "play") return;
      const from = Math.round(at.value);
      const stone = negWalk(from, teeth, problem.slots);
      at.value = stone;
      pos.value = withTiming(stone, { duration: 200 });
      lastStone.current = stone;
      setWalkerAt(stone);
      if (stone === from) return;
      quiet();

      if (stone < problem.zeroAt) say("crossed");
      const nombre = negNameAt(stone, problem.zeroAt);
      if (stone === problem.target) {
        attempt(true);
        say("arrived");
        succeed(
          nombre < 0
            ? "Llegó. Pasó el cero y siguió caminando."
            : "Llegó a la casilla de la bandera.",
        );
        return;
      }
      const closer = Math.abs(stone - problem.target) < Math.abs(from - problem.target);
      attempt(closer);
      if ((from - problem.target) * (stone - problem.target) < 0) {
        setMessage({ text: "Se pasó de la bandera. Girá para el otro lado.", tone: "warn" });
        return;
      }
      if (from >= problem.zeroAt && stone < problem.zeroAt) {
        setMessage({ text: "Pasó el cero y se dio vuelta. Seguí girando.", tone: "dim" });
        return;
      }
      setMessage(
        !closer
          ? { text: "Se alejó de la bandera. Girá para el otro lado.", tone: "warn" }
          : nombre === 0
            ? { text: "El cero no es el borde: se puede seguir.", tone: "dim" }
            : { text: "Todavía no. Girá hasta la bandera.", tone: "dim" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.slots, problem.target, problem.zeroAt, attempt, quiet, succeed, say],
  );

  /** El toque sobre el caminante: gira sin moverse. Dos veces devuelven. */
  const turnWalker = useCallback(() => {
    if (!level.flip || phaseRef.current !== "play") return;
    flip.value = -flip.value;
    facing.value = flip.value * (Math.round(at.value) >= problem.zeroAt ? 1 : -1);
    const vueltas = turnsRef.current + 1;
    turnsRef.current = vueltas;
    if (vueltas % 2 === 0) say("flippedTwice");
    setMessage(
      vueltas % 2 === 0
        ? { text: "Dos vueltas, y mira para donde miraba al principio.", tone: "ok" }
        : { text: "Giró sin moverse. Está en la misma casilla.", tone: "dim" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.flip, problem.zeroAt, say]);

  /** Lo que el gesto no puede hacer también se dice. */
  const nudge = useCallback((why: number) => {
    if (why === 0) {
      setMessage({ text: "En este nivel no se gira: tocá la casilla donde va a terminar.", tone: "dim" });
    } else if (why === 1) {
      setMessage({ text: "Primero mirá las dos vueltas de arriba y tocá la que se equivoca.", tone: "dim" });
    }
  }, []);

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
        setWalkerAt(stone);
        say("predicted");
        succeed("Ahí terminó, del lado izquierdo del cero.");
        return;
      }
      // La casilla simétrica de la derecha: el signo leído como decoración. No
      // tiene entrada en el catálogo, así que se muestra y no se anota.
      const espejo = problem.zeroAt + (problem.zeroAt - problem.target);
      setMessage(
        stone === espejo
          ? { text: "Esa es la del otro lado. Los dientes encendidos van hacia atrás.", tone: "warn" }
          : stone === problem.zeroAt
            ? { text: "Ahí está ahora. Contá los dientes encendidos desde el cero.", tone: "warn" }
            : { text: "Contá los dientes encendidos desde el cero, hacia la izquierda.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, problem.target, problem.zeroAt, attempt, quiet, succeed, say],
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
        say("chosen");
        setMessage({
          text: "Ese se equivoca: giró dos veces y siguió mirando hacia atrás. Ahora te toca a vos.",
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
    [problem.liar, attempt, quiet, say],
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
          : index === problem.row.origin
            ? { text: "Ese es el dibujo marcado, de donde se sale. Contá los puntos desde ahí.", tone: "warn" }
            : { text: "Contá los puntos desde el dibujo marcado: un dibujo por punto.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, problem.answer, problem.row, attempt, quiet, succeed],
  );

  /** El edificio que el nivel pide con un toque, y que se apaga solo. */
  const askBuilding = useCallback(() => {
    if (level.building !== "onDemand") return;
    reveal.value = withSequence(
      withTiming(1, { duration: 240 }),
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 400 }),
    );
    setMessage({ text: "El edificio vuelve un momento, con las dos paradas marcadas.", tone: "dim" });
  }, [level.building, reveal]);

  // --- Fichas ----------------------------------------------------------------

  /**
   * Tocar una ficha. En el nivel que mide, es contestar; donde la ficha se lleva
   * a la caja, tocarla no alcanza, y se dice.
   */
  const tapChip = useCallback(
    (index: number) => {
      if (phaseRef.current !== "play") return;
      if (level.mode === "compare" || level.mode === "moveZero") {
        setMessage({ text: "Arrastrá la ficha hasta la caja de abajo.", tone: "dim" });
        return;
      }
      if (level.mode !== "distance") return;
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
          : { text: "Contá los pisos de una parada a la otra, pasando por la calle.", tone: "warn" },
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
        if (Math.hypot(tx, ty) > 16) {
          setMessage({ text: "La ficha volvió a su lugar. Soltala adentro de la caja.", tone: "dim" });
        }
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
      say("boxed");
      // "Aunque su numeral sea más grande" solo es verdad cuando lo es: entre
      // −3 y 3 los dos numerales son iguales y lo que decide es el signo.
      const otro = problem.chips.find((c) => !c.correct)?.value ?? 0;
      succeed(
        chip.value >= 0
          ? "Ese está más abajo en el edificio."
          : Math.abs(chip.value) > Math.abs(otro)
            ? `El ${signed(chip.value)} está más abajo, aunque su numeral sea más grande.`
            : `El ${signed(chip.value)} está más abajo: el signo dice que queda bajo la calle.`,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.chips, layout, attempt, quiet, succeed, say],
  );

  // --- El tablero ------------------------------------------------------------

  /** Soltar una moneda o un vale: entra al tablero, o vuelve a la bandeja. */
  const dropToken = useCallback(
    (index: number, tx: number, ty: number, mx: number, my: number) => {
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
        // Ni entró ni salió: vuelve a donde estaba, y si el dedo la llevó a
        // algún lado, se dice adónde tenía que ir.
        const destino = estaba
          ? boardSlot(layout, token.value, placedRef.current[index] as number)
          : home;
        view.dx.value = withTiming(destino.x - home.x, { duration: theme.motion.base });
        view.dy.value = withTiming(destino.y - home.y, { duration: theme.motion.base });
        if (!estaba && Math.hypot(mx, my) > 16) {
          setMessage({ text: "Volvió a la bandeja. Soltala adentro del tablero.", tone: "dim" });
        }
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
        say("placed");
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
        // Sacar uno de un par que se había apagado: el otro vuelve a contar.
        apagados[index] = false;
        const pareja = problem.tokens.findIndex(
          (o, i) => i !== index && (proximo[i] ?? -1) >= 0 && apagados[i] === true && o.value === -token.value,
        );
        if (pareja >= 0) apagados[pareja] = false;
        setCancelled(apagados);
      }

      if (despues === problem.netTarget) {
        attempt(true);
        say("solved");
        succeed(`El neto quedó en ${signed(problem.netTarget)}. El ascensor está ahí.`);
        return;
      }
      const acerca = Math.abs(despues - problem.netTarget) < Math.abs(antes - problem.netTarget);
      attempt(acerca);
      setMessage(
        dentro && apagados[index]
          ? { text: "Se apagaron los dos. Lo que queda sin pareja es el neto.", tone: "dim" }
          : !dentro
            ? {
                text: token.value < 0 ? "Sacaste un vale y el neto subió." : "Sacaste una moneda y el neto bajó.",
                tone: "dim",
              }
            : acerca
              ? { text: `El neto va en ${signed(despues)}.`, tone: "dim" }
              : { text: `Se alejó: el neto quedó en ${signed(despues)}. Lo que sobra se puede sacar del tablero.`, tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.tokens, problem.netTarget, layout, attempt, quiet, succeed, say],
  );

  // --- La calle --------------------------------------------------------------

  /**
   * La calle se soltó a una altura: los pisos se renombran y nada se mueve. La
   * raya tiene imán de un piso y medio: con cuarenta pisos en el alto de un
   * teléfono, un piso mide pocos píxeles, y acertarle a uno exacto sería puntería,
   * no matemática. Si queda lejos, la calle se queda donde el jugador la dejó y
   * la línea de abajo dice hacia dónde falta.
   */
  const dropStreet = useCallback(
    (raw: number) => {
      if (phaseRef.current !== "move" || problem.moveTo === null) return;
      quiet();
      const meta = problem.moveTo;
      const ok = Math.abs(raw - meta) <= 1.5;
      attempt(ok);
      if (!ok) {
        const piso = Math.max(0, Math.min(problem.slots - 1, Math.round(raw)));
        street.value = withTiming(piso, { duration: theme.motion.quick });
        setMessage({
          text:
            piso < meta
              ? "La raya está más arriba. Subí la calle un poco más."
              : "La raya está más abajo. Bajá la calle un poco más.",
          tone: "warn",
        });
        return;
      }
      street.value = withTiming(meta, { duration: theme.motion.quick });
      zeroSV.value = meta;
      setStreetAt(meta);
      setPhase("play");
      say("moved");
      for (let i = 0; i < NEG_CHIP_SLOTS; i++) {
        const view = chips[i] as DragView;
        view.alive.value = i < problem.chips.length ? withTiming(1, { duration: 320 }) : 0;
      }
      setMessage({
        text: "Todos los pisos cambiaron de nombre. Ahora arrastrá a la caja el que está más abajo.",
        tone: "ok",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.moveTo, problem.slots, problem.chips.length, attempt, quiet, say],
  );

  // --- Gestos ----------------------------------------------------------------

  const conManivela = level.mode === "cross" || level.mode === "turn";
  /** Los niveles que se juegan sobre la pista: son los que tienen manivela dibujada. */
  const conPista = conManivela || level.mode === "floor";
  /** 0: la manivela gira; 1: no gira y se dice por qué; 2: no hay manivela. */
  const manivela = conManivela && phase === "play" ? 0 : conPista ? 1 : 2;
  const slots = problem.slots;
  const isFloor = level.mode === "floor";

  /**
   * Los gestos se arman una vez por nivel y leen lo que cambia por ronda de
   * valores compartidos y de funciones estables. Rearmados en cada ronda,
   * podían quedarse con la geometría o el cierre de la anterior (trampa 8).
   */
  const geoNow = useMemo<NegGeo>(
    () => ({
      cx: layout.crank.x,
      cy: layout.crank.y,
      cr: layout.crank.r,
      slots: problem.slots,
      zeroAt: problem.zeroAt,
      rows: [...layout.rows],
      xs: layout.rail.stones.map((s) => s.x),
      railY: layout.rail.y,
      drawXs: layout.drawings.map((s) => s.x),
      drawY: layout.drawings[0]?.y ?? 0,
      drawR: layout.drawingR,
      touchR: layout.touchR,
      shaftBottom: layout.shaft.bottom,
      floorH: layout.shaft.floorH,
    }),
    [layout, problem.slots, problem.zeroAt],
  );
  const geo = useSharedValue<NegGeo>(geoNow);
  useEffect(() => {
    geo.value = geoNow;
  }, [geoNow, geo]);
  const manivelaSV = useSharedValue(manivela);
  /** La fase en el hilo de la interfaz: 0 se juega, 1 se compara, 2 se muda la calle, 3 cerrada. */
  const phaseSV = useSharedValue(0);
  useEffect(() => {
    manivelaSV.value = manivela;
    phaseSV.value = phase === "play" ? 0 : phase === "explain" ? 1 : phase === "move" ? 2 : 3;
  }, [manivela, phase, manivelaSV, phaseSV]);

  const onLanded = useLatest(landed);
  const onNudge = useLatest(nudge);
  const onPickRow = useLatest(pickRow);
  const onTapStone = useLatest(tapStone);
  const onTapDrawing = useLatest(tapDrawing);
  const onDropStreet = useLatest(dropStreet);
  const onTurnWalker = useLatest(turnWalker);
  const onDropChip = useLatest(dropChip);
  const onTapChip = useLatest(tapChip);
  const onDropToken = useLatest(dropToken);

  // La manivela solo escucha donde hay manivela; donde está dibujada pero no
  // gira, escucha para decir por qué. Un toque sin arrastre sigue siendo del
  // `Tap`: el `Pan` recién gana cuando el dedo se movió.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(conPista)
        .onBegin((e) => {
          const g = geo.value;
          subject.value = NADA;
          if (phaseSV.value === 3) return;
          const enManivela = Math.hypot(e.x - g.cx, e.y - g.cy) < g.cr * 1.7;
          if (!enManivela) return;
          if (manivelaSV.value === 1) {
            runOnJS(onNudge)(isFloor ? 0 : 1);
            return;
          }
          if (manivelaSV.value !== 0) return;
          subject.value = MANIVELA;
          lastAngle.value = Math.atan2(e.y - g.cy, e.x - g.cx);
          turned.value = 0;
        })
        .onChange((e) => {
          if (subject.value !== MANIVELA) return;
          const g = geo.value;
          const a = Math.atan2(e.y - g.cy, e.x - g.cx);
          let d = a - lastAngle.value;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          turned.value += d / TOOTH_ANGLE;
          lastAngle.value = a;
          // El paso es entero y mide lo mismo de los dos lados: entre dos
          // dientes no hay nada que el gesto pueda expresar. Es la cuenta de
          // `negWalk`, escrita de nuevo porque un worklet no llama a un paquete.
          const stone = Math.max(0, Math.min(g.slots - 1, Math.trunc(at.value) + Math.round(turned.value)));
          pos.value = stone;
          // La bandera se da vuelta al cruzar el cero, y esa vuelta es la que
          // en la capa simbólica se acuesta y se vuelve el trazo del signo.
          facing.value = flip.value * (stone >= g.zeroAt ? 1 : -1);
        })
        .onEnd(() => {
          if (subject.value !== MANIVELA) return;
          const dientes = Math.round(turned.value);
          if (dientes !== 0) runOnJS(onLanded)(dientes);
          turned.value = 0;
          subject.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conPista, isFloor, onLanded, onNudge],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .onEnd((e) => {
          const g = geo.value;
          if (phaseSV.value === 1) {
            let fila = 0;
            let best = Infinity;
            for (let i = 0; i < g.rows.length; i++) {
              const d = Math.abs(e.y - (g.rows[i] as number));
              if (d < best) {
                best = d;
                fila = i;
              }
            }
            runOnJS(onPickRow)(fila);
            return;
          }
          if (g.drawXs.length > 0 && Math.abs(e.y - g.drawY) < g.drawR * 2) {
            let best = -1;
            let bestD = g.drawR * 1.6;
            for (let i = 0; i < g.drawXs.length; i++) {
              const d = Math.abs(e.x - (g.drawXs[i] as number));
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            }
            if (best >= 0) {
              runOnJS(onTapDrawing)(best);
              return;
            }
          }
          if (g.xs.length === 0) return;
          let best = -1;
          let bestD = Math.max(g.touchR, 30);
          for (let i = 0; i < g.xs.length; i++) {
            const d = Math.hypot(e.x - (g.xs[i] as number), e.y - g.railY);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (best >= 0) runOnJS(onTapStone)(best);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPickRow, onTapStone, onTapDrawing],
  );

  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  /**
   * El arrastre de la calle. La calle sigue al dedo piso por piso y, al
   * soltarla, decide la actividad.
   *
   * `e.y` viene medido desde el borde de la vista que escucha, no desde el
   * lienzo, así que hay que sumarle dónde empieza esa vista. Con el gesto del
   * lienzo entero la diferencia es cero y no se nota; acá son nueve pisos.
   */
  const shaft = layout.shaft;
  const shaftTop = shaft.bottom - slots * shaft.floorH;
  /**
   * La mano fantasma, para cuando el nivel no tiene guía. Hace el gesto que el
   * nivel pide y vuelve al principio. Con guía se apaga: dos manos a la vez
   * señalarían dos cosas distintas.
   */
  const ghost = useMemo<TrackGhost | null>(() => {
    if (guided) return null;
    const chip0 = layout.chips[0] ?? { x: 0, y: 0 };
    if (conPista) return { kind: "turn", teeth: -3 };
    if (level.mode === "ledger") {
      return {
        kind: "move",
        from: layout.tokens[0] ?? chip0,
        to: { x: layout.board.x + layout.board.w / 4, y: layout.board.y + 40 },
      };
    }
    if (level.mode === "arbitrary") {
      return {
        kind: "move",
        from: { x: layout.width / 2, y: layout.height * 0.3 },
        to: layout.drawings[problem.row.origin] ?? { x: 0, y: 0 },
      };
    }
    if (level.mode === "distance") {
      return { kind: "move", from: layout.stops[0] ?? { x: 0, y: 0 }, to: chip0 };
    }
    return { kind: "move", from: chip0, to: layout.box };
  }, [guided, conPista, layout, level.mode, problem.row.origin]);

  // La calle va adonde está el dedo desde que se apoya, y un toque solo también
  // la muda: con cuarenta pisos un piso mide seis píxeles, y mudarla dos pisos
  // era un arrastre tan corto que el gesto ni llegaba a empezar. Nada compite
  // por este dedo (el asa del edificio no está mientras la calle se muda), así
  // que activarse al apoyar no le roba nada a nadie (trampa 12).
  const streetPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(level.mode === "moveZero")
        .minDistance(0)
        .onBegin((e) => {
          if (phaseSV.value !== 2) return;
          const g = geo.value;
          const top = g.shaftBottom - g.slots * g.floorH;
          const piso = (g.shaftBottom - (top + e.y)) / g.floorH;
          street.value = Math.max(0, Math.min(g.slots - 1, piso));
        })
        .onChange((e) => {
          if (phaseSV.value !== 2) return;
          const g = geo.value;
          const top = g.shaftBottom - g.slots * g.floorH;
          const piso = (g.shaftBottom - (top + e.y)) / g.floorH;
          street.value = Math.max(0, Math.min(g.slots - 1, piso));
        })
        .onEnd(() => {
          if (phaseSV.value !== 2) return;
          runOnJS(onDropStreet)(street.value);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.mode, onDropStreet],
  );

  // --- Qué señala la guía ----------------------------------------------------

  // La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(
    () =>
      shown
        ? focusFor(shown.id, { level, problem, layout, walkerAt, placed, streetAt })
        : null,
    [shown, level, problem, layout, walkerAt, placed, streetAt],
  );

  return (
    <View style={styles.root}>
      <Header
        title={`${t(`node.${NODE_NEGATIVES}.name`)} · nivel ${level.n} de ${TOTAL_NEG_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!withLesson}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <TrackScene
            config={config}
            layout={layout}
            pos={pos}
            facing={facing}
            hint={hint}
            clock={clock}
            demo={demo}
            appear={appear}
            reveal={reveal}
            pinned={phase === "move"}
            street={street}
            zero={streetAt}
            stop={level.mode === "floor" ? problem.step : 0}
            net={net}
            cancelled={cancelled}
            answered={answered}
            picked={picked}
            tapped={tapped}
            explaining={phase === "explain"}
            ghost={ghost}
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
            x={layout.rail.origin.x + layout.rail.step * walkerAt}
            y={layout.rail.y}
            enabled={phase === "play"}
            onTap={onTurnWalker}
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
                pointerEvents: phase === "move" ? "auto" : "none",
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
        {Array.from({ length: NEG_CHIP_SLOTS }, (_, i) => (
          <DragHandle
            key={`chip${i}`}
            index={i}
            view={chips[i] as DragView}
            spot={layout.chips[i] ?? { x: 0, y: 0 }}
            w={layout.chipW}
            h={layout.chipH}
            enabled={i < problem.chips.length && phase === "play"}
            draggable={level.mode === "compare" || level.mode === "moveZero"}
            onDrop={onDropChip}
            onTap={onTapChip}
          />
        ))}
        {/* Las asas de las monedas viven con el tablero: sin tablero no hay
            bandeja donde estén, y un asa sorda en una esquina taparía el lienzo. */}
        {level.board
          ? Array.from({ length: NEG_TOKEN_SLOTS }, (_, i) => (
              <TokenHandle
                key={`tok${i}`}
                index={i}
                view={tokens[i] as DragView}
                at={
                  (placed[i] ?? -1) >= 0 && problem.tokens[i]
                    ? boardSlot(layout, problem.tokens[i].value, placed[i] as number)
                    : (layout.tokens[i] ?? { x: 0, y: 0 })
                }
                r={layout.tokenR}
                enabled={i < problem.tokens.length && phase === "play"}
                onDrop={onDropToken}
              />
            ))
          : null}

        <Spotlight focus={focus} />
      </View>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

/** La geometría de la ronda que leen los gestos, en el hilo de la interfaz. */
interface NegGeo {
  readonly cx: number;
  readonly cy: number;
  readonly cr: number;
  readonly slots: number;
  readonly zeroAt: number;
  readonly rows: readonly number[];
  readonly xs: readonly number[];
  readonly railY: number;
  readonly drawXs: readonly number[];
  readonly drawY: number;
  readonly drawR: number;
  readonly touchR: number;
  readonly shaftBottom: number;
  readonly floorH: number;
}

/**
 * Una función estable que siempre llama a la última versión de `fn`. Los gestos
 * se arman una vez por nivel y llaman por acá: un gesto rearmado en cada ronda
 * podía quedarse con el cierre de la anterior (trampa 8), y en la segunda ronda
 * la ficha se evaluaba contra las fichas de la primera.
 */
function useLatest<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: A) => ref.current(...args), []);
}

/** Lo que el foco necesita saber de la ronda. */
interface FocusState {
  readonly level: NegLevel;
  readonly problem: NegProblem;
  readonly layout: TrackLayout;
  readonly walkerAt: number;
  readonly placed: readonly number[];
  readonly streetAt: number;
}

/**
 * Qué señala cada paso de la guía, calculado de la geometría de esta ronda: el
 * caminante, el cero y la bandera, la perilla y hacia dónde se gira, el
 * edificio, el tablero, las dos vueltas dobles, la caja y la calle.
 */
function focusFor(id: string, f: FocusState): Focus {
  const { level, problem, layout: l, walkerAt, placed } = f;
  const rail = l.rail;
  const pad = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
  const cellRect = (i: number): Rect => {
    const s = rail.stones[i] ?? rail.origin;
    return { x: s.x - 20, y: s.y - 50, w: 40, h: 62 };
  };
  const crankRect = pad({ x: l.crank.x - l.crank.r, y: l.crank.y - l.crank.r, w: l.crank.r * 2, h: l.crank.r * 2 }, 8);
  /** La perilla está donde la dejó el último paso; un cuarto de vuelta son tres dientes. */
  const knob = (stone: number, quarter: number): { from: Pt; to: Pt } => {
    const r = l.crank.r * 0.62;
    const a = stone * TOOTH_ANGLE - Math.PI / 2;
    const b = a + quarter * (Math.PI / 2);
    return {
      from: { x: l.crank.x + Math.cos(a) * r, y: l.crank.y + Math.sin(a) * r },
      to: { x: l.crank.x + Math.cos(b) * r, y: l.crank.y + Math.sin(b) * r },
    };
  };
  const shaftRect = pad(
    {
      x: l.shaft.x - l.shaft.w / 2,
      y: l.shaft.bottom - problem.slots * l.shaft.floorH,
      w: l.shaft.w,
      h: problem.slots * l.shaft.floorH,
    },
    8,
  );
  const floorY = (i: number): number => l.shaft.bottom - (i + 0.5) * l.shaft.floorH;
  const boxRect = pad({ x: l.box.x - l.boxW / 2, y: l.box.y - l.boxH / 2, w: l.boxW, h: l.boxH }, 6);
  const chipRect = (i: number): Rect => {
    const s = l.chips[i] ?? { x: 0, y: 0 };
    return pad({ x: s.x - l.chipW / 2, y: s.y - l.chipH / 2, w: l.chipW, h: l.chipH }, 6);
  };
  const toward = problem.target < walkerAt ? -1 : 1;

  if (level.mode === "cross" || level.mode === "turn") {
    if (level.mode === "turn" && (id === "look" || id === "choose" || id === "reveal")) {
      if (id === "reveal") return { rings: [cellRect(problem.target)] };
      const step = Math.min(rail.step, 60);
      const rows = l.rows.map((y) => pad({ x: l.width / 2 - step * 3.4, y: y - 44, w: step * 6.8, h: 56 }, 8));
      return { rings: rows };
    }
    if (id === "look") return { rings: [cellRect(walkerAt), cellRect(problem.zeroAt), cellRect(problem.target)] };
    if (id === "flip") return { rings: [cellRect(walkerAt)] };
    if (id === "cross" || id === "arrive") {
      return { rings: [crankRect, cellRect(problem.target)], drag: knob(walkerAt, toward) };
    }
    return { rings: [cellRect(problem.target)] };
  }

  if (level.mode === "floor") {
    if (id === "look") return { rings: [cellRect(problem.zeroAt), crankRect, shaftRect] };
    if (id === "predict") {
      // Las casillas del lado izquierdo, sin decir cuál.
      const a = rail.stones[0] ?? rail.origin;
      const b = rail.stones[Math.max(0, problem.zeroAt - 1)] ?? rail.origin;
      return { rings: [pad({ x: a.x - 20, y: a.y - 30, w: b.x - a.x + 40, h: 50 }, 4)] };
    }
    return { rings: [cellRect(problem.target)] };
  }

  if (level.mode === "ledger") {
    const b = l.board;
    const boardRect = pad({ x: b.x - b.w / 2, y: b.y, w: b.w, h: b.h }, 6);
    const targetRect: Rect = { x: b.x - 34, y: b.y - 40, w: 68, h: 36 };
    const netRect: Rect = { x: b.x - 36, y: b.y + b.h + 4, w: 72, h: 40 };
    const tray = problem.tokens.map((_, i) => l.tokens[i]).filter((s): s is { x: number; y: number } => !!s);
    const xs = tray.map((s) => s.x);
    const trayRect =
      tray.length > 0
        ? pad({ x: Math.min(...xs) - l.tokenR, y: (tray[0]?.y ?? 0) - l.tokenR, w: Math.max(...xs) - Math.min(...xs) + 2 * l.tokenR, h: 2 * l.tokenR }, 8)
        : boardRect;
    if (id === "look") return { rings: [targetRect, netRect, trayRect] };
    if (id === "drop") {
      const vale = problem.tokens.findIndex((tk, i) => tk.value < 0 && (placed[i] ?? -1) < 0);
      const from = l.tokens[vale];
      return from
        ? { rings: [boardRect], drag: { from, to: { x: b.x + b.w / 4, y: b.y + b.h * 0.4 } } }
        : { rings: [boardRect] };
    }
    if (id === "net") return { rings: [targetRect, boardRect] };
    return { rings: [netRect] };
  }

  if (level.mode === "compare" || level.mode === "moveZero") {
    const bajo = problem.chips.findIndex((c) => c.correct);
    const marks = problem.floors.map((fl) => pad({ x: l.shaft.x - l.shaft.w / 2, y: floorY(fl) - l.shaft.floorH / 2, w: l.shaft.w, h: l.shaft.floorH }, 6));
    const street = l.shaft.bottom - f.streetAt * l.shaft.floorH;
    const meta = problem.moveTo === null ? street : l.shaft.bottom - problem.moveTo * l.shaft.floorH;
    const line = (y: number): Rect => ({ x: l.shaft.x - l.shaft.w, y: y - 12, w: l.shaft.w * 2, h: 24 });
    if (id === "look") {
      if (level.mode === "moveZero") return { rings: [line(street), line(meta)] };
      return { rings: [chipRect(0), chipRect(1), ...marks] };
    }
    if (id === "move") {
      return { rings: [line(meta)], drag: { from: { x: l.shaft.x, y: street }, to: { x: l.shaft.x, y: meta } } };
    }
    if (id === "drop") {
      const from = l.chips[bajo];
      return from ? { rings: [boxRect], drag: { from, to: l.box } } : { rings: [boxRect] };
    }
    return { rings: [boxRect] };
  }

  return { rings: [] };
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
  // En web, un gesto que nace deshabilitado no despierta nunca: las fichas de
  // la calle mudada nacen apagadas y quedaban muertas cuando aparecían. El
  // gesto nace habilitado y lo que decide si responde viaja en un valor
  // compartido.
  const live = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    live.value = enabled ? 1 : 0;
  }, [enabled, live]);
  const gesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDistance(20)
      .onEnd(() => {
        if (live.value === 1) runOnJS(onTap)(index);
      });
    const pan = Gesture.Pan()
      .enabled(draggable)
      .onChange((e) => {
        if (live.value !== 1) return;
        view.dx.value = e.translationX;
        view.dy.value = e.translationY;
      })
      // Dónde está el dedo respecto del centro de la ficha, medido desde el asa:
      // la traslación acumulada se queda corta en un arrastre largo.
      .onEnd((e) => {
        if (live.value !== 1) return;
        runOnJS(onDrop)(index, e.x - (w + 8) / 2, e.y - (h + 8) / 2);
      });
    return Gesture.Race(pan, tap);
  }, [draggable, index, view, onDrop, onTap, w, h, live]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - w / 2 - 4,
          top: spot.y - h / 2 - 4,
          width: w + 8,
          height: h + 8,
          // Un asa sorda no puede comerse los toques del lienzo (trampa 13).
          pointerEvents: enabled ? "auto" : "none",
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
 * El asa se ubica con un estilo común, desde dónde descansa la moneda (`at`,
 * que calcula la actividad), y no con un estilo animado: en web el estilo
 * animado no seguía ni a la moneda ni al cambio de ronda, y la moneda que en la
 * primera ronda no existía quedaba sin asa en la segunda. El nivel no se podía
 * terminar si esa era la que hacía falta.
 *
 * El arrastre acumula sobre el desplazamiento que la moneda ya tenía y no sobre
 * cero: el gesto informa cuánto se movió el dedo desde que empezó, no dónde está
 * la moneda. A quien la recibe le pasa las dos cosas: dónde quedó y cuánto la
 * movió el dedo, para no hablarle a un toque que no llevó nada.
 */
function TokenHandle({
  index,
  view,
  at,
  r,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly view: DragView;
  readonly at: { x: number; y: number };
  readonly r: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, tx: number, ty: number, mx: number, my: number) => void;
}) {
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  // Nace habilitado siempre: en web, un gesto que nace deshabilitado no despierta.
  const live = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    live.value = enabled ? 1 : 0;
  }, [enabled, live]);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          sx.value = view.dx.value;
          sy.value = view.dy.value;
        })
        .onChange((e) => {
          if (live.value !== 1) return;
          view.dx.value = sx.value + e.translationX;
          view.dy.value = sy.value + e.translationY;
        })
        .onEnd((e) => {
          if (live.value !== 1) return;
          runOnJS(onDrop)(index, view.dx.value, view.dy.value, e.translationX, e.translationY);
        }),
    [index, view, onDrop, sx, sy, live],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: at.x - r - 8,
          top: at.y - r - 8,
          width: r * 2 + 16,
          height: r * 2 + 16,
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

/**
 * El asa del caminante, sobre la casilla donde quedó parado. Se ubica con un
 * estilo común desde la casilla que la actividad conoce (`x`), y no con un
 * estilo animado atado a la posición: en web ese estilo no seguía al caminante
 * y el toque que lo da vuelta quedaba en la casilla de salida.
 */
function WalkerHandle({
  x,
  y,
  enabled,
  onTap,
}: {
  readonly x: number;
  readonly y: number;
  readonly enabled: boolean;
  readonly onTap: () => void;
}) {
  // Nace habilitado siempre: el nivel de la vuelta doble arranca comparando, y
  // un toque que nace deshabilitado en web no despertaba al empezar a caminar.
  const live = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    live.value = enabled ? 1 : 0;
  }, [enabled, live]);
  const gesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(20)
        .onEnd(() => {
          if (live.value === 1) runOnJS(onTap)();
        }),
    [onTap, live],
  );
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: x - 24,
          top: y - 46,
          width: 48,
          height: 60,
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
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

/**
 * Lo que este nodo le pide a la mecánica. Lo propio suyo es `zeroAt`: las
 * casillas a la izquierda del cero no son una capa aparte sino el mismo soporte
 * corrido, y el nombre de una casilla pasa a ser su índice menos la calle. Lo
 * demás son capas: el edificio en corte con su ascensor y su calle, el tablero
 * de monedas, las paradas escritas, la caja y la fila de dibujos.
 *
 * `zeroAt` es el cero de partida y no el de ahora: cuando el jugador muda la
 * calle, el cero nuevo entra por la prop `zero` y renombra todo sin mover nada.
 */
function negConfig(problem: NegProblem, level: NegLevel): TrackConfig {
  const conPista = level.mode === "cross" || level.mode === "floor" || level.mode === "turn";
  const marca =
    level.mode === "compare" || level.mode === "distance" || level.mode === "moveZero";
  // Las dos fichas de piso caen arriba, sobre el edificio; las del cajón que
  // contesta una distancia viven abajo, como en todos los demás nodos.
  const arriba = level.mode === "compare" || level.mode === "moveZero";
  return {
    slots: problem.slots,
    zeroAt: problem.zeroAt,
    skin: level.skin === "stone" ? "stone" : "mark",
    railRows: [level.mode === "turn" ? 0.46 : 0.4],
    // Donde no hay pista el soporte igual existe: es la escala con la que se
    // dibujan el edificio y las dos rectas de la vuelta doble.
    showRail: conPista,
    numerals: level.numerals ? "plain" : "none",
    zeroDot: true,
    // La bandera dice adónde hay que llegar. En el nivel que anticipa no se
    // dibuja: sería la respuesta puesta encima de la pregunta.
    flag:
      conPista && level.mode !== "floor"
        ? { at: problem.target, side: -1, halo: false, pulse: true }
        : null,
    walker: conPista,
    facing: true,
    crank: conPista,
    drawer: {
      chips: problem.chips,
      views: NEG_CHIP_SLOTS,
      w: 62,
      h: 48,
      gap: 12,
      center: "canvas",
      centerFrac: 0.5,
      spread: "chips",
      at: arriba ? "top" : "bottom",
      margin: arriba ? 0.12 : 18,
      numerals: level.numerals,
      signed: true,
    },
    building:
      level.building === "none"
        ? null
        : {
            show: level.building,
            reserve: level.building === "shown" ? 150 : 0,
            beside: conPista,
            centerFrac: level.mode === "ledger" ? 0.18 : 0.5,
            car: conPista,
            moveTo: problem.moveTo,
            marks: marca ? problem.floors : [],
            numerals: level.numerals,
          },
    board: level.board
      ? { tokens: problem.tokens, views: NEG_TOKEN_SLOTS, target: problem.netTarget }
      : null,
    stops: level.mode === "distance" ? problem.floors : [],
    box: arriba,
    drawings:
      level.mode === "arbitrary"
        ? {
            count: problem.row.length,
            origin: problem.row.origin,
            dir: problem.row.dir,
            steps: problem.row.steps,
          }
        : null,
    explain: level.explain ? { kind: "doubleTurn", rows: [0.3, 0.62], liar: problem.liar } : null,
    metrics: {
      pad: 40,
      maxStep: 88,
      // La casilla de este nodo es chata y ancha: tiene que leerse como un lugar
      // de la recta y no como una piedra suelta.
      stone: { frac: 0.3, max: Number.POSITIVE_INFINITY, flat: 7 },
      band: { half: 4, over: 12 },
      markOver: 12,
      markHalf: 9,
      flag: { base: 8, top: 42, span: 18, drop: 7 },
      crank: { min: 30, max: 44, frac: 0.12, margin: 10 },
      touch: { frac: 0.5, min: 26 },
      numeralEvery: null,
    },
  };
}

/**
 * El alto del lienzo. Con lección, arriba va el cartel de la guía, que en un
 * teléfono angosto llega a ocupar un tercio de la pantalla: lo que queda para
 * el lienzo se calcula restando la barra, el título, el cartel y la línea de
 * abajo, para que ninguno quede afuera.
 */
function sceneHeight(width: number, height: number, withLesson: boolean, min: number): number {
  const reserve = withLesson ? (width < 520 ? 480 : 420) : 190;
  const frac = withLesson ? 0.58 : 0.68;
  return Math.max(min, Math.min(height * frac, height - reserve, 560));
}

function openingPhase(level: NegLevel): Phase {
  if (level.explain) return "explain";
  if (level.mode === "moveZero") return "move";
  return "play";
}

/** Lo primero que se ve cuando el nivel no tiene lección. Es para el adulto. */
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
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
});
