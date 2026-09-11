/**
 * El viaje de dos tramos: el minijuego de `arith.add.displacement`.
 *
 * Un chico de cinco años que no lee tiene que poder jugarlo entero. Por eso no
 * hay ninguna instrucción escrita que haga falta: la guía de Lumi (o la mano
 * fantasma, si el nivel no tiene guía) lleva una ficha hasta la manivela y el
 * caminante contesta. Los mensajes de abajo son para el adulto que mira.
 *
 * Los gestos, y ninguno fino:
 *
 * - Soltar una ficha sobre la manivela. El tope se ajusta y se iluminan tantos
 *   dientes como dice la ficha. Al girar, el libro abre una fila.
 * - Girar hacia adelante. Con ficha puesta el caminante salta el tramo entero
 *   de un tirón y deja una estela; sin ficha avanza de a un diente, como en el
 *   nodo 2. Llega igual, más lento: es válido pero no cuenta como tramo, y la
 *   línea de abajo dice cómo hacerlo con la ficha.
 * - Girar al revés. Deshace el último tramo entero: el caminante vuelve a donde
 *   estaba, la fila del libro se cierra y la ficha vuelve al cajón. Nada se
 *   gasta para siempre, así que ningún viaje equivocado deja la ronda trabada.
 *   Esa reversibilidad es además lo que impide que la llegada se lea como botón.
 * - Tocar una piedra, para anticipar la llegada antes de que la manivela gire.
 * - Toque sostenido sobre el libro: las dos filas se intercambian y el
 *   caminante cae en la misma piedra. Nadie lo nombra.
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
  CHIP_SLOTS,
  NODE_ADD_DISPLACEMENT,
  TOTAL_TRIP_LEVELS,
  generateTrip,
  jumpWith,
  legsTotal,
  type Trip,
  type TripLevel,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TOOTH_ANGLE,
  TrackScene,
  trackLayout,
  type DragView,
  type Leg,
  type TrackConfig,
  type TrackGhost,
  type TrackLayout,
} from "../scenes/TrackScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";
import { useLesson } from "../lessons/LessonContext.tsx";
import type { CoachStep } from "../lessons/types.ts";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Qué agarró el dedo. Vive en un `SharedValue` porque lo decide el hilo de UI. */
const NADA = 0;
const MANIVELA = 1;

/** Un tramo sin ficha: se giró la manivela desnuda. */
const SIN_FICHA = -1;
/** El tramo del tope que el nivel que anticipa trae puesto de antemano. */
const TOPE_DADO = -2;

type Phase = "journey" | "explain" | "answer" | "done";

/** Un tramo hecho, y de dónde salió su ficha: al deshacerlo, la ficha vuelve ahí. */
interface TripLeg extends Leg {
  readonly chip: number;
}

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

function Activity({ level, onLevelDone, onEvent }: AddDisplacementGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  /** Con lección, el cartel dice qué hacer y la línea de abajo queda para lo que pasó. */
  const opening = lesson?.lesson ? "" : openingHint(level);
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [phase, setPhase] = useState<Phase>(level.row ? "answer" : "journey");
  /** Los tramos hechos, en el orden en que el jugador los hizo. */
  const [legs, setLegs] = useState<readonly TripLeg[]>([]);
  /** La ficha puesta en el tope, y de qué ranura salió. */
  const [loaded, setLoaded] = useState(-1);
  const [loadedFrom, setLoadedFrom] = useState(-1);
  const [picked, setPicked] = useState(-1);
  /** El libro ya intercambió sus filas en esta ronda. */
  const [swapped, setSwapped] = useState(false);
  const [answered, setAnswered] = useState(-1);
  /** En el nivel que anticipa, la llegada ya se dijo. */
  const [predicted, setPredicted] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: opening,
    tone: "dim",
  }));

  const trip = useMemo(
    () => generateTrip(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = sceneHeight(width, height, lesson?.lesson !== undefined, 340);
  // En el nivel que anticipa la bandera no se dibuja hasta que el jugador dice
  // dónde va a caer: sería la respuesta puesta encima de la pregunta.
  const hideFlag = level.mode === "predict" && !predicted;
  const config = useMemo(() => tripConfig(trip, level, hideFlag), [trip, level, hideFlag]);
  const layout = useMemo(() => trackLayout(config, width, sceneH), [config, width, sceneH]);

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
  /** Adónde vuelve el caminante si se gira al revés: el principio del último tramo, o -1. */
  const undoTo = useSharedValue(-1);
  /** Ya vibró la manivela en este tirón: la traba se siente una vez, no por cuadro. */
  const trabado = useSharedValue(0);
  /** 1 mientras la manivela todavía no se puede girar. */
  const locked = useSharedValue(0);

  // Seis fichas montadas siempre: el árbol no puede cambiar entre rondas.
  const chips: DragView[] = [useChip(), useChip(), useChip(), useChip(), useChip(), useChip()];

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
  const legsRef = useRef<readonly TripLeg[]>([]);
  legsRef.current = legs;
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const stepRef = useRef<CoachStep | undefined>(step);
  stepRef.current = step;

  /** Las fichas que ya están en un tramo hecho: salen del cajón mientras el tramo exista. */
  const spent = useMemo(() => legs.filter((l) => l.chip >= 0).map((l) => l.chip), [legs]);

  useEffect(() => {
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
    for (let i = 0; i < CHIP_SLOTS; i++) {
      const chip = chips[i] as DragView;
      chip.dx.value = 0;
      chip.dy.value = 0;
      chip.alive.value = i < trip.tiles.length ? 1 : 0;
    }
    // El latido de la manivela no es un adorno: dice dónde se juega.
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

  // El reloj de la latencia arranca con el nivel en juego, no con la tarjeta.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [trip, playing]);

  useEffect(() => {
    const last = legs[legs.length - 1];
    undoTo.value = last ? last.from : -1;
  }, [legs, undoTo]);

  useEffect(() => {
    locked.value = level.mode === "predict" && !predicted ? 1 : 0;
  }, [level.mode, predicted, locked]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa.
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);

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
    setPredicted(false);
    arrivedRef.current = false;
    predictedRef.current = false;
    setMessage({ text: opening, tone: "dim" });
  }, [round, level, opening, onEvent, onLevelDone]);

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
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(closeRound, 1600);
    },
    [closeRound, quiet, clock],
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
  const afterJourney = useCallback(() => {
    if (level.explain) {
      openExplain();
      return;
    }
    if (level.pickTotal) {
      // Si el viaje ya se hizo de un solo tirón, esa ficha ya contestó.
      const hechos = legsRef.current;
      if (hechos.length === 1 && hechos[0]?.value === trip.answer) {
        say("answered");
        succeed("Lo hiciste de un solo tirón: esa ficha es el viaje entero.");
        return;
      }
      setPhase("answer");
      setMessage({ text: "Tocá la ficha que hace ese viaje de un solo tirón.", tone: "dim" });
      return;
    }
    succeed("Cayó en la bandera.");
  }, [level.explain, level.pickTotal, trip.answer, openExplain, succeed, say]);

  /**
   * El viaje terminó en la bandera. En el nivel del libro, el libro se queda con
   * el turno: el toque sostenido que intercambia las filas es el gesto de la
   * conmutatividad. Si el jugador no lo encuentra, el nivel sigue igual a los
   * seis segundos, salvo que la guía lo esté pidiendo: entonces espera, porque
   * saltarlo dejaría a la guía pidiendo algo que ya no se puede hacer.
   */
  const finishJourney = useCallback(
    (hechos: readonly TripLeg[]) => {
      say("arrived");
      if (level.swap && level.explain && !swapped && hechos.length >= 2) {
        arrivedRef.current = true;
        setMessage({ text: "Llegó. Dejá el dedo apoyado en el libro y mirá qué pasa.", tone: "ok" });
        const esperar = (): void => {
          if (!arrivedRef.current) return;
          if (stepRef.current?.id === "swap") {
            setTimeout(esperar, 2000);
            return;
          }
          arrivedRef.current = false;
          afterJourney();
        };
        setTimeout(esperar, 6000);
        return;
      }
      afterJourney();
    },
    [level.swap, level.explain, swapped, afterJourney, say],
  );

  /** Vuelve una ficha al cajón, a su ranura, entera. */
  const restoreChip = useCallback(
    (index: number) => {
      const view = chips[index];
      if (!view) return;
      view.dx.value = withTiming(0, { duration: theme.motion.quick });
      view.dy.value = withTiming(0, { duration: theme.motion.quick });
      view.alive.value = withTiming(1, { duration: theme.motion.quick });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * El caminante soltó el pie después de un tirón hacia adelante. `teeth` son
   * los dientes que la manivela giró; quien decide en qué piedra queda es el
   * modelo. Con ficha, el tramo se anota con la ranura de la ficha, para que
   * deshacerlo la devuelva.
   */
  const landed = useCallback(
    (teeth: number, conTope: boolean) => {
      if (phaseRef.current !== "journey") return;
      const from = Math.round(at.value);
      const stone = jumpWith(from, teeth, trip.length);
      at.value = stone;
      pos.value = withTiming(stone, { duration: 220 });
      if (!conTope && stone === from) return;
      quiet();

      const chip = conTope ? (loadedFromRef.current >= 0 ? loadedFromRef.current : TOPE_DADO) : SIN_FICHA;
      const leg: TripLeg = { from, to: stone, value: teeth, chip };
      const hechos = [...legsRef.current, leg];
      legsRef.current = hechos;
      setLegs(hechos);

      if (conTope) {
        // El tirón gastó el tope: la ficha queda en su tramo hasta que se deshaga.
        setLoaded(-1);
        setLoadedFrom(-1);
        stop.value = -1;
        spin.value = withTiming(0, { duration: theme.motion.quick });
      } else {
        // Girar de a un diente es válido y llega igual, solo que no es un tramo:
        // el cajón late y la línea de abajo dice cómo se hace de un tirón.
        attempt(false);
        hint.value = withRepeat(withTiming(1, { duration: 500 }), 4, true);
        setMessage(
          stone === trip.flag
            ? {
                text: "Llegó de a un paso. Girá al revés y probá con una ficha: lo hace de un tirón.",
                tone: "dim",
              }
            : { text: "Así se camina de a un paso. Una ficha en la manivela lo hace de un tirón.", tone: "dim" },
        );
        return;
      }

      if (teeth === 0) {
        attempt(false);
        setMessage({ text: "El tope no tenía dientes: el caminante no se movió.", tone: "dim" });
        return;
      }
      if (stone === trip.flag && hechos.every((l) => l.chip !== SIN_FICHA)) {
        attempt(true);
        finishJourney(hechos);
        return;
      }
      // Un tramo sirve si todavía se llega justo con una ficha del cajón: en el
      // viaje de dos tramos, empezar por una ficha que no es de los tramos del
      // enunciado también llega si la que queda completa. Decirle "probá otra"
      // a un viaje que iba bien sería mentirle.
      const usadas = new Set(hechos.map((l) => l.chip));
      const quedan = trip.tiles.filter((_, i) => !usadas.has(i)).map((c) => c.value);
      const sirve = stone < trip.flag && trip.steps.length > 1 && quedan.includes(trip.flag - stone);
      attempt(sirve);
      if (stone > trip.flag) {
        setMessage({ text: "Se pasó de la bandera. Girá al revés: el tramo se deshace y la ficha vuelve.", tone: "warn" });
        return;
      }
      setMessage(
        sirve
          ? { text: "Un tramo hecho. Poné otra ficha para seguir hasta la bandera.", tone: "dim" }
          : trip.steps.length > 1
            ? { text: "Con las fichas que quedan no llega justo. Girá al revés y probá otra.", tone: "warn" }
            : { text: "No llegó a la bandera. Girá al revés y probá otra ficha.", tone: "warn" },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip.length, trip.flag, trip.steps, trip.tiles, attempt, quiet, finishJourney],
  );

  /**
   * Girar al revés: el último tramo se deshace entero. El caminante ya volvió en
   * el hilo de la interfaz; acá se cierra la fila del libro y la ficha vuelve al
   * cajón, lista para usarse otra vez.
   */
  const undo = useCallback(() => {
    const hechos = legsRef.current;
    const last = hechos[hechos.length - 1];
    if (!last || doneRef.current) return;
    quiet();
    arrivedRef.current = false;
    const quedan = hechos.slice(0, -1);
    legsRef.current = quedan;
    setLegs(quedan);
    if (last.chip >= 0) restoreChip(last.chip);
    if (last.chip === TOPE_DADO) {
      // El tope que el nivel trajo puesto vuelve a su lugar.
      setLoaded(last.value);
      stop.value = last.value;
    }
    setMessage({
      text:
        last.chip === SIN_FICHA
          ? "Volvió. Cualquier viaje se puede deshacer."
          : "Volvió, y la ficha está otra vez en el cajón. Cualquier viaje se puede deshacer.",
      tone: "dim",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet, restoreChip]);

  /** Lo que la manivela no puede hacer también se dice. */
  const nudge = useCallback((why: number) => {
    setMessage(
      why === 0
        ? { text: "Primero tocá la piedra donde va a caer. Después se gira.", tone: "warn" }
        : why === 1
          ? { text: "No hay nada que deshacer: el caminante está en la salida.", tone: "dim" }
          : { text: "Girá un poco más: con la ficha puesta, el tramo sale entero.", tone: "dim" },
    );
  }, []);

  // --- Tocar -----------------------------------------------------------------

  /** `predict`: decir la piedra de llegada antes de que la manivela gire. */
  const tapStone = useCallback(
    (stone: number) => {
      if (phaseRef.current === "done" || level.mode !== "predict" || predictedRef.current) return;
      quiet();
      const ok = stone === trip.arrival;
      attempt(ok);
      if (ok) {
        predictedRef.current = true;
        setPredicted(true);
        say("predicted");
        setMessage({ text: "Ahí va a caer. Girá la manivela y mirá.", tone: "ok" });
      } else if (stone === legsTotal(trip.steps) && trip.start > 0) {
        // Leer el segundo número como un lugar: no está catalogado, así que se
        // muestra y no se anota.
        setMessage({ text: "Esa es la piedra del número de la ficha. Contá desde donde está el caminante.", tone: "warn" });
      } else if (stone === trip.arrival - 1) {
        setMessage({ text: "Esa cuenta la piedra donde está. Contá solo los saltos.", tone: "warn" });
      } else {
        setMessage({ text: "Contá los dientes encendidos otra vez, desde el caminante.", tone: "warn" });
      }
    },
    [level.mode, trip.arrival, trip.steps, trip.start, attempt, quiet, say],
  );

  /** `explain`: tocar la animación en la que la llegada empuja al caminante. */
  const pickRow = useCallback(
    (row: number) => {
      if (phaseRef.current !== "explain") return;
      quiet();
      setPicked(row);
      const ok = row === trip.liar;
      // El distractor de este ítem clasifica: elegir la animación honesta es
      // exactamente leer la llegada como una acción.
      attempt(ok, ok ? undefined : "equals_as_operator");
      if (ok) {
        say("chosen");
        succeed("Ahí la ficha empujó al caminante. La llegada no hace nada: dice dónde terminó.");
      } else {
        setMessage({ text: "En ese el caminante camina y después aparece la ficha. Mirá el otro.", tone: "warn" });
      }
    },
    [trip.liar, attempt, succeed, quiet, say],
  );

  /** El toque sostenido sobre el libro: las filas se intercambian. */
  const swapRows = useCallback(() => {
    if (!level.swap || legsRef.current.length < 2) return;
    quiet();
    setSwapped(true);
    // El viaje se rehace al revés y cae en la misma piedra: las piedras de la
    // unión cambian, la de llegada no.
    let cursor = trip.start;
    const dados = [...legsRef.current].reverse().map((leg) => {
      const from = cursor;
      cursor += leg.value;
      return { from, to: cursor, value: leg.value, chip: leg.chip };
    });
    legsRef.current = dados;
    setLegs(dados);
    say("swapped");
    setMessage({ text: "Al revés, y cae en la misma piedra.", tone: "ok" });
    if (arrivedRef.current) {
      arrivedRef.current = false;
      setTimeout(afterJourney, 1400);
    }
  }, [level.swap, trip.start, afterJourney, quiet, say]);

  /** La recta que el renglón devuelve al tocar la ficha de llegada. */
  const askRail = useCallback(() => {
    if (!level.row) return;
    ghostRail.value = withSequence(
      withTiming(0.5, { duration: 200 }),
      withTiming(0.5, { duration: 1600 }),
      withTiming(0, { duration: 400 }),
    );
    say("rail");
    setMessage({ text: "La recta vuelve un momento, con el viaje dibujado.", tone: "dim" });
  }, [level.row, ghostRail, say]);

  // --- Fichas ----------------------------------------------------------------

  /** Contestar con una ficha: el renglón, o el tramo único de la flecha. */
  const answerWith = useCallback(
    (index: number) => {
      if (phaseRef.current !== "answer") {
        // En el viaje la ficha se arrastra: tocarla no alcanza, y se dice.
        if (phaseRef.current === "journey" && !level.row) {
          setMessage({ text: "Arrastrá la ficha hasta la manivela.", tone: "dim" });
        }
        return;
      }
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
              : level.pickTotal
                ? "Con esa, de un tirón, no cae en la bandera."
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
      say("answered");
      succeed(
        level.pickTotal
          ? "Ese tramo hace el mismo viaje de un tirón."
          : trip.hidden >= 0
            ? "Ese es el tramo que faltaba."
            : "El renglón dice el viaje entero.",
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip.tiles, trip.answer, trip.hidden, layout, level.pickTotal, level.row, attempt, succeed, quiet, say],
  );

  /**
   * Soltar una ficha sobre la manivela: el tope se ajusta.
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
      if (!chip || !view || !home || phaseRef.current !== "journey") return;
      const x = home.x + tx;
      const y = home.y + ty;
      const enManivela = Math.hypot(x - layout.crank.x, y - layout.crank.y) < layout.crank.r * 1.8;

      if (!enManivela || level.row) {
        view.dx.value = withTiming(0, { duration: theme.motion.base });
        view.dy.value = withTiming(0, { duration: theme.motion.base });
        if (Math.hypot(tx, ty) > 16) {
          setMessage({ text: "La ficha volvió al cajón. Soltala sobre la manivela.", tone: "dim" });
        }
        return;
      }

      quiet();
      // La ficha anterior vuelve al cajón: el tope tiene lugar para una sola.
      const previa = loadedFromRef.current;
      if (previa >= 0 && previa !== index) restoreChip(previa);
      view.dx.value = withTiming(layout.crank.x - home.x, { duration: 160 });
      view.dy.value = withTiming(layout.crank.y - home.y, { duration: 160 });
      view.alive.value = withTiming(0, { duration: 200 });
      setLoaded(chip.value);
      setLoadedFrom(index);
      loadedFromRef.current = index;
      stop.value = chip.value;
      say("loaded");
      setMessage({
        text:
          chip.value === 0
            ? "El tope no tiene dientes. Girá y mirá qué pasa."
            : "El tope quedó puesto. Girá la manivela hacia adelante.",
        tone: "dim",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip.tiles, layout, level.row, quiet, restoreChip, say],
  );

  // --- Gestos ----------------------------------------------------------------

  const rail = layout.rail;

  /**
   * Los gestos se arman una vez por nivel y leen lo que cambia por ronda de
   * valores compartidos y de funciones estables. Rearmados en cada ronda,
   * podían quedarse con la geometría o el cierre de la anterior (trampa 8).
   */
  const geoNow = useMemo<TripGeo>(
    () => ({
      cx: layout.crank.x,
      cy: layout.crank.y,
      cr: layout.crank.r,
      length: trip.length,
      rows: [...layout.rows],
      xs: rail.stones.map((s) => s.x),
      railY: rail.y,
      // La tarjeta del numeral es parte de la piedra: tocarla cuenta igual.
      cardDy: trip.numerals ? layout.cardDy : 0,
      touchR: layout.touchR,
    }),
    [layout, rail, trip.length, trip.numerals],
  );
  const geo = useSharedValue<TripGeo>(geoNow);
  useEffect(() => {
    geo.value = geoNow;
  }, [geoNow, geo]);
  /** La manivela gira en el viaje, y nunca en el renglón; los toques, hasta que la ronda cierra. */
  const canTurn = useSharedValue(0);
  const canTap = useSharedValue(1);
  useEffect(() => {
    canTurn.value = phase === "journey" && !level.row ? 1 : 0;
    canTap.value = phase !== "done" ? 1 : 0;
  }, [phase, level.row, canTurn, canTap]);

  const onLanded = useLatest(landed);
  const onUndo = useLatest(undo);
  const onNudge = useLatest(nudge);
  const onPickRow = useLatest(pickRow);
  const onTapStone = useLatest(tapStone);
  const onSwap = useLatest(swapRows);
  const onDropChip = useLatest(dropChip);
  const onAnswer = useLatest(answerWith);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!level.row)
        .onBegin((e) => {
          const g = geo.value;
          subject.value = NADA;
          if (canTurn.value !== 1) return;
          const enManivela = Math.hypot(e.x - g.cx, e.y - g.cy) < g.cr * 1.6;
          if (!enManivela) return;
          if (locked.value === 1) {
            runOnJS(onNudge)(0);
            return;
          }
          subject.value = MANIVELA;
          lastAngle.value = Math.atan2(e.y - g.cy, e.x - g.cx);
          turned.value = 0;
          trabado.value = 0;
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

          if (turned.value < 0) {
            // Al revés se deshace el último tramo: el caminante vuelve por él,
            // y no más atrás de donde ese tramo empezó.
            spin.value = 0;
            const vuelta = undoTo.value;
            if (vuelta < 0) {
              pos.value = at.value;
              if (turned.value < -0.3 && trabado.value === 0) {
                trabado.value = 1;
                jam.value = withSequence(
                  withTiming(1, { duration: 70 }),
                  withTiming(-1, { duration: 110 }),
                  withTiming(0, { duration: 90 }),
                );
              }
              return;
            }
            pos.value = Math.max(vuelta, at.value + turned.value);
            return;
          }

          const tope = stop.value;
          if (tope > 0) {
            // Con tope, el tirón es de todo o nada: el caminante recorre el
            // tramo entero mientras la manivela gira y no puede pararse en el
            // medio, que es exactamente lo que el tope significa.
            pos.value = Math.min(g.length - 1, at.value + Math.min(tope, turned.value));
          } else if (tope === 0) {
            // El tope sin dientes: la manivela gira y el caminante no se mueve.
            spin.value = turned.value;
          } else {
            // Sin ficha, de a un diente, como en el nodo 2.
            const raw = at.value + Math.round(turned.value);
            if (raw > g.length - 1 && trabado.value === 0) {
              trabado.value = 1;
              jam.value = withSequence(
                  withTiming(1, { duration: 70 }),
                  withTiming(-1, { duration: 110 }),
                  withTiming(0, { duration: 90 }),
                );
            }
            pos.value = Math.min(g.length - 1, raw);
          }
        })
        .onEnd(() => {
          if (subject.value !== MANIVELA) return;
          const giro = turned.value;
          const tope = stop.value;
          if (giro < 0) {
            if (giro <= -0.5 && undoTo.value >= 0) {
              at.value = undoTo.value;
              pos.value = withTiming(undoTo.value, { duration: 200 });
              runOnJS(onUndo)();
            } else {
              pos.value = withTiming(at.value, { duration: 180 });
              if (giro <= -0.5) runOnJS(onNudge)(1);
            }
          } else if (tope > 0) {
            if (giro >= Math.max(0.5, tope / 2)) {
              runOnJS(onLanded)(tope, true);
            } else {
              pos.value = withTiming(at.value, { duration: 180 });
              // Un giro corto con la ficha puesta vuelve atrás: se dice por qué.
              if (giro > 0.05) runOnJS(onNudge)(2);
            }
          } else if (tope === 0) {
            if (giro >= 0.5) runOnJS(onLanded)(0, true);
            else spin.value = withTiming(0, { duration: 180 });
          } else {
            const dientes = Math.round(giro);
            if (dientes > 0) runOnJS(onLanded)(dientes, false);
          }
          turned.value = 0;
          subject.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.row, onLanded, onUndo, onNudge],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .onEnd((e) => {
          if (canTap.value !== 1) return;
          const g = geo.value;
          if (g.rows.length > 0) {
            let row = 0;
            let best = Infinity;
            for (let i = 0; i < g.rows.length; i++) {
              const d = Math.abs(e.y - (g.rows[i] as number));
              if (d < best) {
                best = d;
                row = i;
              }
            }
            runOnJS(onPickRow)(row);
            return;
          }
          let best = -1;
          let bestD = Math.max(g.touchR * 1.3, 30);
          for (let i = 0; i < g.xs.length; i++) {
            const sx = g.xs[i] as number;
            const d = Math.min(Math.hypot(e.x - sx, e.y - g.railY), Math.hypot(e.x - sx, e.y - g.railY - g.cardDy));
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (best >= 0) runOnJS(onTapStone)(best);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPickRow, onTapStone],
  );

  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  const arrivalCell = layout.cells[layout.cells.length - 1];

  /**
   * En el renglón no hay tramos hechos, pero la recta fantasma sí tiene qué
   * mostrar: las flechas de los tramos que el renglón ya dice. La del tramo
   * tapado no se dibuja, y el hueco que deja sobre la recta es la pregunta.
   */
  const shownLegs = useMemo<readonly Leg[]>(() => {
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

  /**
   * La mano fantasma, para cuando el nivel no tiene guía. Lleva la primera ficha
   * del cajón hasta la manivela; en el renglón, hasta el hueco. Con guía se
   * apaga: dos manos a la vez señalarían dos cosas distintas.
   */
  const ghost = useMemo<TrackGhost | null>(
    () =>
      guided
        ? null
        : {
            kind: "move",
            from: layout.chips[0] ?? { x: 0, y: 0 },
            to: level.row ? (layout.slot ?? layout.crank) : layout.crank,
          },
    [guided, layout, level.row],
  );

  const swapOn = level.swap && legs.length > 1 && phase !== "done";
  // Sin `enabled`: en web, el toque sostenido que nace deshabilitado (el libro
  // arranca sin filas) no despertaba al tener las dos. `swapRows` ya decide.
  const ledgerPress = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(420)
        .onStart(() => {
          runOnJS(onSwap)();
        }),
    [onSwap],
  );

  // --- Qué señala la guía ----------------------------------------------------

  // La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
  const shown = step ?? lesson?.hint;
  const walkerAt = ultimo ? ultimo.to : trip.start;
  const focus = useMemo<Focus | null>(
    () =>
      shown
        ? focusFor(shown.id, {
            level,
            trip,
            layout,
            walkerAt,
            loaded,
            spent,
          })
        : null,
    [shown, level, trip, layout, walkerAt, loaded, spent],
  );

  return (
    <View style={styles.root}>
      <Header
        title={`${t(`node.${NODE_ADD_DISPLACEMENT}.name`)} · nivel ${level.n} de ${TOTAL_TRIP_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!lesson?.lesson}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH }}>
        <Canvas style={{ width, height: sceneH }}>
          <TrackScene
            config={config}
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
            // Tres valores y no dos: `-1` es la manivela desnuda y `0` la ficha
            // del cero, que es un tope de verdad y no la falta de uno.
            stop={Math.max(0, loaded)}
            legs={shownLegs}
            picked={picked}
            answered={answered}
            explaining={phase === "explain"}
            ghost={ghost}
            chips={chips}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* El libro: el toque sostenido intercambia las filas. Sordo mientras no
            hay dos filas, para no comerse los toques del lienzo (trampa 13). */}
        {level.ledger ? (
          <GestureDetector gesture={ledgerPress}>
            <Animated.View
              style={{
                position: "absolute",
                left: layout.ledger.x,
                top: layout.ledger.y,
                width: layout.ledger.w,
                height: layout.ledger.h,
                pointerEvents: swapOn ? "auto" : "none",
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
                width: Math.abs((rail.stones[ultimo.to]?.x ?? 0) - (rail.stones[ultimo.from]?.x ?? 0)) + 20,
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
        {Array.from({ length: CHIP_SLOTS }, (_, i) => {
          const chip = trip.tiles[i];
          return (
            <ChipHandle
              key={i}
              index={i}
              view={chips[i] as DragView}
              spot={layout.chips[i] ?? { x: 0, y: 0 }}
              w={layout.chipW}
              h={layout.chipH}
              enabled={!!chip && !spent.includes(i) && i !== loadedFrom && phase !== "done" && phase !== "explain"}
              draggable={!level.row}
              onDrop={onDropChip}
              onTap={onAnswer}
            />
          );
        })}

        <Spotlight focus={focus} />
      </View>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

/** La geometría de la ronda que leen los gestos, en el hilo de la interfaz. */
interface TripGeo {
  readonly cx: number;
  readonly cy: number;
  readonly cr: number;
  readonly length: number;
  readonly rows: readonly number[];
  readonly xs: readonly number[];
  readonly railY: number;
  readonly cardDy: number;
  readonly touchR: number;
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
  readonly level: TripLevel;
  readonly trip: Trip;
  readonly layout: TrackLayout;
  readonly walkerAt: number;
  readonly loaded: number;
  readonly spent: readonly number[];
}

/**
 * Qué señala cada paso de la guía, calculado de la geometría de esta ronda: la
 * ficha que sirve y la manivela, la perilla y hacia dónde se gira, el libro, las
 * dos pistas que se comparan, el renglón y su hueco.
 */
function focusFor(id: string, f: FocusState): Focus {
  const { level, trip, layout: l, walkerAt, loaded, spent } = f;
  const rail = l.rail;
  const pad = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
  const stoneRect = (i: number): Rect => {
    const s = rail.stones[i] ?? rail.origin;
    return { x: s.x - 22, y: s.y - 50, w: 44, h: 62 + (trip.numerals ? l.cardDy : 0) };
  };
  const crankRect = pad({ x: l.crank.x - l.crank.r, y: l.crank.y - l.crank.r, w: l.crank.r * 2, h: l.crank.r * 2 }, 8);
  const vivas = trip.tiles.map((_, i) => i).filter((i) => !spent.includes(i));
  const drawer = (): Rect => {
    const spots = vivas.map((i) => l.chips[i]).filter((s): s is { x: number; y: number } => !!s);
    if (spots.length === 0) return crankRect;
    const xs = spots.map((s) => s.x);
    const y = spots[0]?.y ?? 0;
    return pad(
      { x: Math.min(...xs) - l.chipW / 2, y: y - l.chipH / 2, w: Math.max(...xs) - Math.min(...xs) + l.chipW, h: l.chipH },
      8,
    );
  };
  const ledgerRect = pad({ x: l.ledger.x, y: l.ledger.y, w: l.ledger.w, h: l.ledger.h }, 6);
  const railRect = pad({ x: rail.from.x, y: rail.y - 60, w: rail.to.x - rail.from.x, h: 60 + l.cardDy + 16 }, 10);
  const knob = (stone: number): { from: Pt; to: Pt } => {
    const r = l.crank.r * 0.62;
    const a = stone * TOOTH_ANGLE - Math.PI / 2;
    const b = a + Math.PI / 2;
    return {
      from: { x: l.crank.x + Math.cos(a) * r, y: l.crank.y + Math.sin(a) * r },
      to: { x: l.crank.x + Math.cos(b) * r, y: l.crank.y + Math.sin(b) * r },
    };
  };
  /** La ficha que conviene poner ahora: un tramo del viaje que todavía está en el cajón. */
  const buena = (): number => {
    const falta = trip.flag - walkerAt;
    const exacta = vivas.find((i) => trip.tiles[i]?.value === falta);
    if (exacta !== undefined) return exacta;
    const tramo = vivas.find((i) => {
      const v = trip.tiles[i]?.value ?? -1;
      return trip.steps.includes(v) && v < falta;
    });
    return tramo ?? vivas[0] ?? -1;
  };
  /** Poner una ficha o, si ya hay una puesta, girar. */
  const hacerTramo = (): Focus => {
    if (loaded > 0) return { rings: [crankRect], drag: knob(walkerAt) };
    const i = buena();
    const from = l.chips[i];
    return from ? { rings: [crankRect], drag: { from, to: { x: l.crank.x, y: l.crank.y } } } : { rings: [crankRect] };
  };

  if (level.row) {
    const cells = l.cells;
    const first = cells[0];
    const last = cells[cells.length - 1];
    const rowRect =
      first && last
        ? pad({ x: first.x - first.w / 2, y: first.y - first.h / 2, w: last.x + last.w / 2 - (first.x - first.w / 2), h: first.h }, 8)
        : railRect;
    const slotRect = l.slot ? pad({ x: l.slot.x - l.slot.w / 2, y: l.slot.y - l.slot.h / 2, w: l.slot.w, h: l.slot.h }, 6) : rowRect;
    const arrivalRect = last ? pad({ x: last.x - last.w / 2, y: last.y - last.h / 2, w: last.w, h: last.h }, 6) : slotRect;
    if (id === "look") return { rings: [rowRect] };
    if (id === "rail") return { rings: [arrivalRect] };
    if (id === "answer") return { rings: [drawer(), slotRect] };
    return { rings: [slotRect] };
  }

  if (level.mode === "predict") {
    if (id === "look") return { rings: [crankRect, stoneRect(trip.start)] };
    if (id === "predict") {
      // Las piedras donde puede caer, sin decir cuál.
      const a = rail.stones[Math.min(trip.length - 1, trip.start + 1)] ?? rail.origin;
      const b = rail.stones[Math.min(trip.length - 1, trip.arrival + 1)] ?? rail.origin;
      return { rings: [pad({ x: a.x - 20, y: a.y - 26, w: b.x - a.x + 40, h: 26 + l.cardDy + 14 }, 4)] };
    }
    if (id === "pull") return { rings: [crankRect, stoneRect(trip.arrival)], drag: knob(walkerAt) };
    return { rings: [stoneRect(trip.arrival)] };
  }

  if (id === "look") {
    if (level.explain) return { rings: [drawer(), ledgerRect, stoneRect(trip.flag)] };
    if (level.arrow) return { rings: [railRect] };
    return { rings: [stoneRect(trip.start), stoneRect(trip.flag), drawer()] };
  }
  if (id === "load") {
    const i = buena();
    const from = l.chips[i];
    return from
      ? { rings: [crankRect], drag: { from, to: { x: l.crank.x, y: l.crank.y } } }
      : { rings: [crankRect] };
  }
  if (id === "pull" || id === "legs") return { ...hacerTramo(), rings: [...hacerTramo().rings, stoneRect(trip.flag)] };
  if (id === "swap") return { rings: [ledgerRect] };
  if (id === "choose" || (id === "reveal" && level.explain)) {
    const rows = l.explainRails.map((r) =>
      pad({ x: r.from.x, y: r.y - 80, w: r.to.x - r.from.x, h: 96 }, 8),
    );
    if (id === "reveal") return { rings: [rows[trip.liar] ?? railRect] };
    return { rings: rows };
  }
  if (id === "total") return { rings: [drawer()] };
  if (id === "reveal" && level.arrow) return { rings: [railRect] };
  return { rings: [stoneRect(trip.flag)] };
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
  readonly view: DragView;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly draggable: boolean;
  readonly onDrop: (index: number, tx: number, ty: number) => void;
  readonly onTap: (index: number) => void;
}) {
  // En web, un gesto que nace deshabilitado no despierta nunca: la ranura que
  // en la primera ronda no tenía ficha quedaba muerta cuando la tenía. El gesto
  // nace habilitado y lo que decide si responde viaja en un valor compartido.
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
 * Lo que este nodo le pide a la mecánica. La base con el tope regulable y el
 * cajón, más el libro, las flechas y el renglón según la capa. Las medidas son
 * las que la escena trae por omisión: este nodo es el que las fijó.
 */
function tripConfig(trip: Trip, level: TripLevel, hideFlag: boolean): TrackConfig {
  return {
    slots: trip.length,
    skin: level.skin === "stone" ? "stone" : "mark",
    railRows: [level.row ? 0.2 : 0.32],
    numerals: trip.numerals ? "cards" : "none",
    flag: hideFlag ? null : { at: trip.flag },
    drawer: {
      chips: trip.tiles,
      views: CHIP_SLOTS,
      w: 46,
      h: 46,
      gap: 10,
      center: "afterCrank",
      centerFrac: 0.55,
      spread: "views",
      at: "bottom",
      margin: 14,
      numerals: trip.numerals,
      signed: false,
    },
    ledger: level.ledger,
    arrows: level.arrow,
    // La estela es de la capa que se camina: en el renglón la recta vuelve como
    // fantasma y lo único que dice son las flechas.
    trail: !level.row,
    line: level.row
      ? {
          start: trip.start,
          steps: trip.steps,
          hidden: trip.hidden,
          arrival: trip.arrival,
        }
      : null,
    explain: level.explain
      ? {
          kind: "arrival",
          rows: [0.2, 0.46],
          from: trip.start,
          to: trip.arrival,
          liar: trip.liar,
        }
      : null,
  };
}

function useChip(): DragView {
  return {
    dx: useSharedValue(0),
    dy: useSharedValue(0),
    alive: useSharedValue(0),
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

/** Lo primero que se ve cuando el nivel no tiene lección. Es para el adulto. */
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
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
});
