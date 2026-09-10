/**
 * El viaje de dos tramos: el minijuego de `arith.add.displacement`.
 *
 * Un chico de cinco años que no lee tiene que poder jugarlo entero. Por eso no
 * hay ninguna instrucción escrita: una mano fantasma lleva una ficha hasta la
 * manivela y el caminante contesta. Los mensajes de abajo son para el adulto
 * que mira.
 *
 * Los gestos, y ninguno fino:
 *
 * - Soltar una ficha sobre la manivela. El tope se ajusta, se iluminan tantos
 *   dientes como dice la ficha y el libro abre una fila. Un solo gesto hace las
 *   tres cosas, porque son la misma cosa.
 * - Girar. Con ficha puesta el caminante salta el tramo entero de un tirón y
 *   deja una estela por donde pasó sin pisar; sin ficha avanza de a un diente,
 *   como en el nodo 2. Llega igual, más lento: es válido pero inútil y solo
 *   recibe el latido del cajón, nunca una explicación.
 * - Girar al revés. El viaje se deshace. Esa reversibilidad es lo que impide
 *   que la ficha de llegada se lea como un botón.
 * - Tocar una piedra, para anticipar la llegada antes de que la manivela gire.
 * - Toque sostenido sobre el libro: las dos filas se intercambian y el
 *   caminante rehace el viaje al revés. Cae en la misma piedra, y nadie lo
 *   nombra.
 * - Tocar una ficha, para contestar el renglón.
 *
 * Del catálogo de L, este nodo declara `equals_as_operator` y nada más. Se
 * clasifica en dos lugares y solo en esos dos: la animación de `explain` en la
 * que la ficha de llegada empuja al caminante, y la ficha de la llegada puesta
 * donde falta un tramo. Los otros dos errores que el diseño prevé —contar la
 * piedra de partida, contar dos veces la de la unión— no tienen entrada en el
 * catálogo, así que se muestran y no se anotan.
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
  NODE_ADD_DISPLACEMENT,
  TOTAL_TRIP_LEVELS,
  generateTrip,
  jumpWith,
  legsTotal,
  type TripLevel,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  CHIP_VIEWS,
  TOOTH_ANGLE,
  TrackScene,
  trackLayout,
  type ChipView,
  type Leg,
} from "../scenes/TrackScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Qué agarró el dedo. Vive en un `SharedValue` porque lo decide el hilo de UI. */
const NADA = 0;
const MANIVELA = 1;

type Phase = "journey" | "explain" | "answer" | "done";

export interface AddDisplacementGameProps {
  readonly level: TripLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function AddDisplacementGame(props: AddDisplacementGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: AddDisplacementGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [phase, setPhase] = useState<Phase>(level.row ? "answer" : "journey");
  /** Los tramos ya hechos, en el orden en que el jugador los hizo. */
  const [legs, setLegs] = useState<readonly Leg[]>([]);
  /** La ficha puesta en el tope, y de qué ranura salió. */
  const [loaded, setLoaded] = useState(-1);
  const [loadedFrom, setLoadedFrom] = useState(-1);
  /** Las ranuras cuya ficha ya se gastó en un tirón. */
  const [spent, setSpent] = useState<readonly number[]>([]);
  const [picked, setPicked] = useState(-1);
  /** El libro ya intercambió sus filas en esta ronda. */
  const [swapped, setSwapped] = useState(false);
  const [answered, setAnswered] = useState(-1);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(level),
    tone: "dim",
  }));

  const trip = useMemo(
    () => generateTrip(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = Math.max(340, Math.min(height * 0.68, 560));
  const layout = useMemo(() => trackLayout(trip, level, width, sceneH), [trip, level, width, sceneH]);

  const pos = useSharedValue(trip.start);
  const lift = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const clock = useSharedValue(0);
  const demo = useSharedValue(0);
  const appear = useSharedValue(0);
  const ghostRail = useSharedValue(0);
  const arrowDx = useSharedValue(0);
  const subject = useSharedValue(NADA);
  const lastAngle = useSharedValue(0);
  /** Cuánto giró la manivela en este tirón, en dientes. */
  const turned = useSharedValue(0);
  /** La piedra donde el caminante está parado de verdad. */
  const at = useSharedValue(trip.start);
  /**
   * El tope, en el hilo de UI: el gesto no puede leer el estado de React. Tres
   * valores y no dos, porque un tope sin dientes no es lo mismo que no tener
   * ficha: `-1` es la manivela desnuda del nodo 2, `0` es la ficha del cero.
   */
  const stop = useSharedValue(-1);
  /** Lo que la manivela gira de más cuando el tope no tiene dientes. */
  const spin = useSharedValue(0);

  // Seis fichas montadas siempre: el árbol no puede cambiar entre rondas.
  const chips: ChipView[] = [useChip(), useChip(), useChip(), useChip(), useChip(), useChip()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * El estado que lee el gesto vive además en referencias. Un worklet captura
   * el `landed` del render en el que se armó, y si el jugador cambia algo entre
   * medio la copia queda vieja; una referencia no puede quedar vieja.
   */
  const predictedRef = useRef(false);
  const arrivedRef = useRef(false);
  const loadedFromRef = useRef(-1);
  loadedFromRef.current = loadedFrom;
  const legsRef = useRef<readonly Leg[]>([]);
  legsRef.current = legs;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    predictedRef.current = false;
    arrivedRef.current = false;
    pos.value = trip.start;
    at.value = trip.start;
    lift.value = 0;
    arrowDx.value = 0;
    ghostRail.value = level.row ? 0 : 1;
    appear.value = withTiming(1, { duration: theme.motion.base });
    // En el nivel que anticipa el tope ya está puesto: lo que se juzga es la
    // piedra que el jugador toca antes de que la manivela gire.
    const inicial = level.mode === "predict" ? (trip.steps[0] ?? 0) : -1;
    setLoaded(inicial);
    stop.value = inicial;
    spin.value = 0;
    setLoadedFrom(-1);
    setSpent([]);
    for (let i = 0; i < CHIP_VIEWS; i++) {
      const chip = chips[i] as ChipView;
      chip.dx.value = 0;
      chip.dy.value = 0;
      chip.alive.value = i < trip.tiles.length ? 1 : 0;
    }
    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_ADD_DISPLACEMENT, layer: level.layer });
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
          node: NODE_ADD_DISPLACEMENT,
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

  /**
   * Lo que le falta al viaje, leído de los tramos hechos y no de un contador
   * aparte: si fuera un contador, deshacer un tirón equivocado lo dejaría
   * contando un tramo que el viaje nunca pidió.
   */
  const remainingAfter = useCallback(
    (hechos: readonly Leg[]): number[] => {
      const resto = [...trip.steps];
      for (const leg of hechos) {
        const i = resto.indexOf(leg.value);
        if (i >= 0) {
          resto.splice(i, 1);
          continue;
        }
        // Hacer de un tirón todo lo que falta también es viajar, y es lo que el
        // nivel de la flecha pregunta.
        if (resto.length > 1 && leg.value === resto.reduce((a, b) => a + b, 0)) resto.length = 0;
      }
      return resto;
    },
    [trip.steps],
  );

  const quiet = useCallback(() => {
    cancelAnimation(hint);
    hint.value = withTiming(0, { duration: 260 });
  }, [hint]);

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_ADD_DISPLACEMENT, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setPhase(level.row ? "answer" : "journey");
    setLegs([]);
    setPicked(-1);
    setAnswered(-1);
    setSwapped(false);
    setSpent([]);
    arrivedRef.current = false;
    predictedRef.current = false;
    setMessage({ text: openingHint(level), tone: "dim" });
  }, [round, level, onEvent, onLevelDone]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setPhase("done");
      quiet();
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1600);
    },
    [nextRound, quiet, clock],
  );

  /** Las dos animaciones de `explain` arrancan cuando el viaje ya se hizo. */
  const openExplain = useCallback(() => {
    setPhase("explain");
    setMessage({ text: "Uno de los dos trata la llegada como un botón. Tocalo.", tone: "dim" });
    clock.value = 0;
    clock.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 1 }),
      ),
      -1,
      false,
    );
  }, [clock]);

  // --- El viaje --------------------------------------------------------------

  /** Lo que el nivel pide después de que el caminante llegó. */
  const advance = useCallback(() => {
    if (level.explain) {
      openExplain();
      return;
    }
    if (level.pickTotal) {
      setPhase("answer");
      setMessage({ text: "Tocá la ficha que hace ese viaje de un solo giro.", tone: "dim" });
      return;
    }
    succeed("Cayó en la bandera.");
  }, [level.explain, level.pickTotal, openExplain, succeed]);

  /**
   * El viaje terminó en la bandera. Donde hay dos filas, el libro se queda con
   * el turno: el toque sostenido que las intercambia es el gesto de la
   * conmutatividad y el nivel no sigue sin él. Si el jugador no lo encuentra, el
   * nivel sigue igual a los seis segundos: el juego no se traba nunca.
   */
  const finishJourney = useCallback(() => {
    if (level.swap && !swapped) {
      arrivedRef.current = true;
      setMessage({ text: "Dejá el dedo apoyado en el libro y mirá qué pasa.", tone: "dim" });
      // Sin efectos dentro de un actualizador de estado: en modo estricto se lo
      // invoca dos veces y el nivel avanzaría dos veces.
      setTimeout(() => {
        if (!arrivedRef.current) return;
        arrivedRef.current = false;
        advance();
      }, 6000);
      return;
    }
    advance();
  }, [level.swap, swapped, advance]);

  /**
   * El caminante soltó el pie después de un tirón. `teeth` son los dientes que
   * la manivela giró, con signo; quien decide en qué piedra queda es el modelo.
   */
  const landed = useCallback(
    (teeth: number, conTope: boolean) => {
      if (phase === "done") return;
      const from = Math.round(at.value);
      const stone = jumpWith(from, teeth, trip.length);
      at.value = stone;
      pos.value = withTiming(stone, { duration: 220 });
      // Un tirón que no mueve nada no es lo mismo según de dónde venga: con un
      // tope sin dientes es el caso del cero y cuenta como tramo; sin ficha, es
      // que la manivela no giró.
      if (stone === from && !(conTope && teeth === 0)) return;
      quiet();

      if (teeth < 0) {
        // Deshacer. El estado nunca se borra: la fila del libro se cierra y lo
        // que falta del viaje se vuelve a leer de los tramos que quedan.
        setLegs((prev) => prev.slice(0, -1));
        setMessage({ text: "Volvió. Cualquier viaje se puede deshacer.", tone: "dim" });
        return;
      }

      const leg: Leg = { from, to: stone, value: teeth };
      setLegs((prev) => [...prev, leg]);

      if (!conTope) {
        // Girar de a un diente es válido y llega igual, solo que lento. Nada de
        // explicaciones: el cajón late y ya.
        hint.value = withRepeat(withTiming(1, { duration: 500 }), 4, true);
        setMessage({ text: "Así también llega. La ficha lo hace de un tirón.", tone: "dim" });
        return;
      }

      const antes = remainingAfter(legsRef.current);
      const resto = remainingAfter([...legsRef.current, leg]);
      const sirve = resto.length < antes.length;
      attempt(sirve);

      if (teeth === 0) {
        setMessage({ text: "El tope no tenía dientes: el caminante no se movió.", tone: "dim" });
        return;
      }
      if (stone === trip.flag && resto.length === 0) {
        if (level.mode === "predict" && !predictedRef.current) {
          setMessage({ text: "Primero tocá la piedra donde va a caer.", tone: "warn" });
          return;
        }
        finishJourney();
        return;
      }
      if (stone > trip.flag) {
        setMessage({ text: "Se pasó de la bandera. Girá al revés para volver.", tone: "warn" });
        return;
      }
      setMessage(
        sirve && trip.steps.length > 1
          ? { text: "Un tramo hecho. Falta el otro.", tone: "dim" }
          : { text: "No cayó en la bandera. Girá al revés y probá otra ficha.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, trip.length, trip.flag, trip.steps.length, level.mode, attempt, quiet, finishJourney, remainingAfter],
  );

  // --- Tocar -----------------------------------------------------------------

  /** `predict`: decir la piedra de llegada antes de que la manivela gire. */
  const tapStone = useCallback(
    (stone: number) => {
      if (phase === "done" || level.mode !== "predict" || predictedRef.current) return;
      quiet();
      const ok = stone === trip.arrival;
      attempt(ok);
      if (ok) {
        predictedRef.current = true;
        // Si el jugador giró antes de decirlo, el caminante ya está ahí y no
        // hay nada que volver a mirar.
        if (Math.round(at.value) === trip.arrival) {
          succeed("Dijo dónde iba a caer, y cayó ahí.");
          return;
        }
        setMessage({ text: "Ahí va a caer. Girá la manivela y mirá.", tone: "ok" });
      } else if (stone === legsTotal(trip.steps)) {
        // Leer el segundo número como un lugar: no está catalogado, así que se
        // muestra y no se anota.
        setMessage({ text: "Esa es la ficha, no la llegada. Contá desde donde está.", tone: "warn" });
      } else {
        setMessage({ text: "Contá los dientes del tope otra vez.", tone: "warn" });
      }
    },
    [phase, level.mode, trip.arrival, trip.steps, attempt, quiet, succeed],
  );

  /** `explain`: tocar la animación en la que la llegada empuja al caminante. */
  const pickRow = useCallback(
    (row: number) => {
      if (phase !== "explain") return;
      quiet();
      setPicked(row);
      const ok = row === trip.liar;
      // El distractor de este ítem clasifica: elegir la animación honesta es
      // exactamente leer la llegada como una acción.
      attempt(ok, ok ? undefined : "equals_as_operator");
      if (ok) {
        succeed("Ahí la ficha empujó al caminante. La llegada no hace nada.");
      } else {
        setMessage({ text: "En ese el caminante camina y después aparece la ficha.", tone: "warn" });
      }
    },
    [phase, trip.liar, attempt, succeed, quiet],
  );

  /** El toque sostenido sobre el libro: las filas se intercambian. */
  const swapRows = useCallback(() => {
    if (!level.swap || legsRef.current.length < 2) return;
    quiet();
    setSwapped(true);
    setLegs((prev) => {
      const swapped = [...prev].reverse();
      // El viaje se rehace al revés y cae en la misma piedra: las piedras de la
      // unión cambian, la de llegada no.
      let cursor = trip.start;
      return swapped.map((leg) => {
        const from = cursor;
        cursor += leg.value;
        return { from, to: cursor, value: leg.value };
      });
    });
    setMessage({ text: "Al revés, y cae en la misma piedra.", tone: "ok" });
    if (arrivedRef.current) {
      arrivedRef.current = false;
      setTimeout(advance, 1400);
    }
  }, [level.swap, trip.start, advance, quiet]);

  /** La recta que el renglón devuelve al tocar la ficha de llegada. */
  const askRail = useCallback(() => {
    if (!level.row) return;
    ghostRail.value = withSequence(
      withTiming(0.5, { duration: 200 }),
      withTiming(0.5, { duration: 1600 }),
      withTiming(0, { duration: 400 }),
    );
    setMessage({ text: "La recta vuelve, con el caminante en su piedra.", tone: "dim" });
  }, [level.row, ghostRail]);

  // --- Fichas ----------------------------------------------------------------

  /** Contestar con una ficha: el renglón, o el tramo único de la flecha. */
  const answerWith = useCallback(
    (index: number) => {
      if (phase !== "answer") return;
      const chip = trip.tiles[index];
      const view = chips[index];
      if (!chip || !view) return;
      quiet();
      const ok = chip.value === trip.answer;
      // El único señuelo catalogado del nodo: contestar con la llegada donde
      // falta un tramo, como si el doble trazo mandara ejecutar.
      attempt(ok, !ok && chip.lure === "equals_as_operator" ? "equals_as_operator" : undefined);
      if (!ok) {
        view.dx.value = withSequence(
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 90 }),
          withTiming(0, { duration: 90 }),
        );
        setMessage({
          text:
            chip.lure === "equals_as_operator"
              ? "Esa es la piedra de llegada, no el tramo que falta."
              : "Con esa el caminante no cae en la bandera.",
          tone: "warn",
        });
        return;
      }
      setAnswered(chip.value);
      const slot = layout.slot;
      const home = layout.chips[index];
      if (slot && home) {
        view.dx.value = withTiming(slot.x - home.x, { duration: 220 });
        view.dy.value = withTiming(slot.y - home.y, { duration: 220 });
      }
      view.alive.value = withTiming(0, { duration: 240 });
      succeed(
        level.pickTotal
          ? "Ese tramo hace el mismo viaje de un tirón."
          : trip.hidden >= 0
            ? "Ese es el tramo que faltaba."
            : "El renglón dice el viaje entero.",
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, trip.tiles, trip.answer, layout, level.pickTotal, attempt, succeed, quiet],
  );

  /**
   * Soltar una ficha sobre la manivela: el tope se ajusta y el libro abre fila.
   *
   * El punto donde se soltó se calcula con el desplazamiento del gesto y no con
   * la posición absoluta del dedo: `onLayout` en web devuelve el origen del
   * lienzo en cero, así que restarlo dejaría el blanco corrido media pantalla.
   */
  const dropChip = useCallback(
    (index: number, tx: number, ty: number) => {
      const chip = trip.tiles[index];
      const view = chips[index];
      const home = layout.chips[index];
      if (!chip || !view || !home || phase === "done") return;
      const x = home.x + tx;
      const y = home.y + ty;
      const enManivela = Math.hypot(x - layout.crank.x, y - layout.crank.y) < layout.crank.r * 1.8;

      if (!enManivela || level.row) {
        view.dx.value = withTiming(0, { duration: theme.motion.base });
        view.dy.value = withTiming(0, { duration: theme.motion.base });
        return;
      }

      quiet();
      // La ficha anterior vuelve al cajón: el tope tiene lugar para una sola.
      const previa = chips[loadedFrom];
      if (loadedFrom >= 0 && loadedFrom !== index && previa) {
        previa.dx.value = withTiming(0, { duration: theme.motion.quick });
        previa.dy.value = withTiming(0, { duration: theme.motion.quick });
        previa.alive.value = withTiming(1, { duration: theme.motion.quick });
      }
      view.dx.value = withTiming(layout.crank.x - home.x, { duration: 160 });
      view.dy.value = withTiming(layout.crank.y - home.y, { duration: 160 });
      view.alive.value = withTiming(0, { duration: 200 });
      setLoaded(chip.value);
      setLoadedFrom(index);
      stop.value = chip.value;
      setMessage({
        text:
          chip.value === 0
            ? "El tope no tiene dientes. Girá y mirá qué pasa."
            : "El tope quedó puesto. Girá la manivela.",
        tone: "dim",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip.tiles, phase, layout, level.row, loadedFrom, quiet],
  );

  /** El tirón terminó: la ficha se consume y el tope vuelve a cero. */
  const spend = useCallback(() => {
    const usada = loadedFromRef.current;
    if (usada >= 0) setSpent((prev) => (prev.includes(usada) ? prev : [...prev, usada]));
    setLoaded(-1);
    setLoadedFrom(-1);
    stop.value = -1;
    spin.value = withTiming(0, { duration: theme.motion.quick });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Gestos ----------------------------------------------------------------

  const crank = layout.crank;
  const length = trip.length;
  const rail = layout.rail;
  const stoneXs = useMemo(() => rail.stones.map((s) => s.x), [rail]);
  const railY = rail.y;
  const rowsY = useMemo(() => layout.rows.map((r) => r.y), [layout.rows]);
  const touchR = layout.touchR;
  const jugable = phase === "journey" && !level.row;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(jugable)
        .onBegin((e) => {
          subject.value =
            Math.hypot(e.x - crank.x, e.y - crank.y) < crank.r * 1.6 ? MANIVELA : NADA;
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

          const tope = stop.value;
          if (tope > 0) {
            // Con tope, el tirón es de todo o nada: el caminante recorre el
            // tramo entero mientras la manivela gira y no puede pararse en el
            // medio, que es exactamente lo que el tope significa.
            const avance = Math.max(-tope, Math.min(tope, turned.value));
            pos.value = Math.max(0, Math.min(length - 1, at.value + avance));
          } else if (tope === 0) {
            // El tope sin dientes: la manivela gira y el caminante no se mueve.
            spin.value = turned.value;
          } else {
            // Sin ficha, de a un diente, como en el nodo 2.
            const raw = at.value + Math.round(turned.value);
            const stone = Math.max(0, Math.min(length - 1, raw));
            if (raw < 0 || raw > length - 1) {
              jam.value = withSequence(
                withTiming(1, { duration: 70 }),
                withTiming(-1, { duration: 110 }),
                withTiming(0, { duration: 90 }),
              );
            }
            pos.value = stone;
          }
        })
        .onEnd(() => {
          if (subject.value !== MANIVELA) return;
          const tope = stop.value;
          const giro = Math.abs(turned.value);
          if (tope > 0) {
            const signo = turned.value > 0 ? 1 : -1;
            if (giro >= Math.max(0.5, tope / 2)) {
              runOnJS(landed)(signo * tope, true);
              runOnJS(spend)();
            } else {
              pos.value = withTiming(at.value, { duration: 180 });
            }
          } else if (tope === 0) {
            if (giro >= 0.5) {
              runOnJS(landed)(0, true);
              runOnJS(spend)();
            } else {
              spin.value = withTiming(0, { duration: 180 });
            }
          } else {
            const dientes = Math.round(turned.value);
            if (dientes !== 0) runOnJS(landed)(dientes, false);
          }
          turned.value = 0;
          subject.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jugable, crank, length, landed, spend],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .enabled(phase !== "done")
        .onEnd((e) => {
          if (rowsY.length > 0) {
            let row = 0;
            let best = Infinity;
            for (let i = 0; i < rowsY.length; i++) {
              const d = Math.abs(e.y - (rowsY[i] as number));
              if (d < best) {
                best = d;
                row = i;
              }
            }
            runOnJS(pickRow)(row);
            return;
          }
          let best = -1;
          let bestD = Math.max(touchR * 1.3, 30);
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
    [phase, rowsY, stoneXs, railY, touchR, pickRow, tapStone],
  );

  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  const arrivalCell = layout.cells[layout.cells.length - 1];

  /**
   * En el renglón no hay tramos hechos, pero la recta fantasma sí tiene qué
   * mostrar: las flechas de los tramos que el renglón ya dice. La del tramo
   * tapado no se dibuja, y el hueco que deja sobre la recta es la pregunta.
   */
  const shownLegs = useMemo(() => {
    if (!level.row) return legs;
    const out: Leg[] = [];
    let cursor = trip.start;
    trip.steps.forEach((value, i) => {
      const from = cursor;
      cursor += value;
      if (i !== trip.hidden) out.push({ from, to: cursor, value });
    });
    return out;
  }, [level.row, legs, trip.start, trip.steps, trip.hidden]);

  /** La flecha suelta: se arrastra por la recta y conserva el largo. */
  const ultimo = legs[legs.length - 1];
  const arrowPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(level.arrow && !!ultimo)
        .onChange((e) => {
          arrowDx.value = e.translationX;
        })
        .onEnd(() => {
          // Vuelve a su tramo. Lo que el gesto demuestra es que el largo no
          // cambió en ninguna parte de la recta.
          arrowDx.value = withTiming(0, { duration: theme.motion.base });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.arrow, ultimo],
  );

  const ledgerPress = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(420)
        .enabled(level.swap && legs.length > 1 && phase !== "done")
        .onStart(() => {
          runOnJS(swapRows)();
        }),
    [level.swap, legs.length, phase, swapRows],
  );

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_ADD_DISPLACEMENT}.name`)} · nivel ${level.n} de ${TOTAL_TRIP_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <TrackScene
            trip={trip}
            level={level}
            layout={layout}
            pos={pos}
            lift={lift}
            jam={jam}
            spin={spin}
            hint={hint}
            clock={clock}
            demo={demo}
            appear={appear}
            ghostRail={ghostRail}
            arrowDx={arrowDx}
            loaded={loaded}
            legs={shownLegs}
            phase={phase}
            picked={picked}
            answered={answered}
            chips={chips}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* El libro: el toque sostenido intercambia las filas. */}
        {level.ledger ? (
          <GestureDetector gesture={ledgerPress}>
            <Animated.View
              style={{
                position: "absolute",
                left: layout.ledger.x,
                top: layout.ledger.y,
                width: layout.ledger.w,
                height: layout.ledger.h,
              }}
            />
          </GestureDetector>
        ) : null}

        {/* La flecha del último tramo, arrastrable desde la capa visual. */}
        {level.arrow && ultimo ? (
          <GestureDetector gesture={arrowPan}>
            <Animated.View
              style={{
                position: "absolute",
                left: Math.min(rail.stones[ultimo.from]?.x ?? 0, rail.stones[ultimo.to]?.x ?? 0) - 10,
                top: rail.y - 40,
                width: Math.abs(
                  (rail.stones[ultimo.to]?.x ?? 0) - (rail.stones[ultimo.from]?.x ?? 0),
                ) + 20,
                height: 32,
              }}
            />
          </GestureDetector>
        ) : null}

        {/* La ficha de llegada del renglón devuelve la recta como fantasma. Es
            la última celda: el hueco cuando falta la llegada, y el numeral de
            la llegada cuando lo que falta es un tramo. */}
        {level.row && arrivalCell ? (
          <Pressable
            onPress={askRail}
            style={{
              position: "absolute",
              left: arrivalCell.x - arrivalCell.w / 2,
              top: arrivalCell.y - arrivalCell.h / 2,
              width: arrivalCell.w,
              height: arrivalCell.h,
            }}
          />
        ) : null}

        {/* Siempre las mismas asas: las que esta ronda no usa quedan sordas. */}
        {Array.from({ length: CHIP_VIEWS }, (_, i) => {
          const chip = trip.tiles[i];
          return (
            <ChipHandle
              key={i}
              index={i}
              view={chips[i] as ChipView}
              spot={layout.chips[i] ?? { x: 0, y: 0 }}
              w={layout.chipW}
              h={layout.chipH}
              enabled={!!chip && !spent.includes(i) && phase !== "done" && phase !== "explain"}
              draggable={!level.row}
              onDrop={dropChip}
              onTap={answerWith}
            />
          );
        })}
      </View>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

/**
 * Un asa invisible sobre la ficha dibujada: el numeral es dibujo, no interfaz.
 * En las capas que se caminan la ficha se arrastra hasta la manivela; en el
 * renglón se toca, porque lo que se elige es un número y no un lugar.
 */
function ChipHandle({
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
  readonly view: ChipView;
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

function useChip(): ChipView {
  return {
    dx: useSharedValue(0),
    dy: useSharedValue(0),
    alive: useSharedValue(0),
  };
}

function openingHint(level: TripLevel): string {
  if (level.row) {
    return level.params.unknown === "addend"
      ? "Falta un tramo. Tocá la ficha que lo dice."
      : "Tocá la ficha de la piedra donde termina el viaje.";
  }
  switch (level.mode) {
    case "walk":
      return "Soltá la ficha sobre la manivela y girá.";
    case "predict":
      return "Mirá el tope y tocá la piedra donde va a caer.";
    default:
      return "Dos tramos, en el orden que quieras.";
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
