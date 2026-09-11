/**
 * El camino de piedras: el minijuego de `found.count.number_line`.
 *
 * Un chico de cinco años que no lee tiene que poder jugarlo entero. Por eso no
 * hay ninguna instrucción escrita que haga falta: la manivela late, la guía de
 * Lumi señala la perilla la primera vez (o la mano fantasma, si el nivel no
 * tiene guía) y el caminante contesta. Los mensajes de abajo son para el adulto
 * que mira; el juego funciona igual con la pantalla tapada hasta la mitad.
 *
 * Cuatro gestos y ninguno fino:
 *
 * - Girar la manivela. Cada diente es una piedra. La cuenta de dientes es
 *   entera, así que el caminante no puede caer al agua girando: no es una
 *   validación, es que el medio paso no se puede expresar.
 * - Arrastrar al caminante. Flota mientras el dedo lo sostiene y al soltarlo
 *   cae en la piedra más cercana. El agua devuelve; nunca traga.
 * - Tocar una piedra o su tarjeta. La tarjeta se levanta y muestra el numeral.
 * - Arrastrar una ficha a un hueco. Si el numeral no es el que va, la ficha se
 *   desliza hasta el borde y vuelve a la mano. Esa resistencia es todo el
 *   mensaje: el juego nunca dice "mal".
 *
 * Todo rechazo dice algo en la línea de abajo: la ficha que vuelve al cajón, la
 * manivela que todavía no se puede girar, el caminante que se pasó. Un gesto que
 * no hace nada y no dice nada se lee como un juego roto.
 *
 * El nodo declara `misconceptions: []` y ninguna entrada del catálogo de L
 * apunta acá, así que ningún `attempt` lleva `misconception`. Los tres errores
 * que el diseño prevé están en el documento del minijuego esperando playtest.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
  NODE_NUMBER_LINE,
  TOTAL_PATH_LEVELS,
  crankStep,
  generatePath,
  type PathLevel,
  type PathProblem,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TOOTH_ANGLE,
  TrackScene,
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

/** Fichas montadas siempre, para que el árbol no cambie entre rondas. */
const TILE_SLOTS = 5;

/** Qué agarró el dedo. Vive en un `SharedValue` porque lo decide el hilo de UI. */
const NADA = 0;
const MANIVELA = 1;
const CAMINANTE = 2;

export interface NumberLineGameProps {
  readonly level: PathLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function NumberLineGame(props: NumberLineGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onEvent }: NumberLineGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera: abrir
  // la chuleta achica la actividad y nunca la tapa.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
  /** Con lección, el cartel del objetivo dice qué hacer y la línea de abajo queda para lo que pasó. */
  const opening = lesson?.lesson ? "" : openingHint(level);
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  const [filled, setFilled] = useState<readonly number[]>([]);
  const [tapped, setTapped] = useState(-1);
  const [picked, setPicked] = useState(-1);
  /** En el nivel que anticipa hay dos tiempos: primero se dice, después se camina. */
  const [predicted, setPredicted] = useState(false);
  /** La piedra donde quedó el caminante, para que la guía señale desde ahí. */
  const [walkerAt, setWalkerAt] = useState(0);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: opening,
    tone: "dim",
  }));

  const problem = useMemo(
    () => generatePath(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = sceneHeight(width, height, lesson?.lesson !== undefined, 300);
  // En el nivel que anticipa la bandera no se dibuja hasta que el jugador dice
  // dónde va a caer: sería la respuesta puesta encima de la pregunta.
  const hideFlag = level.mode === "predict" && !predicted;
  const config = useMemo(() => pathConfig(problem, level, hideFlag), [problem, level, hideFlag]);
  const layout = useMemo(() => trackLayout(config, width, sceneH), [config, width, sceneH]);

  const pos = useSharedValue(problem.start);
  const lift = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const clock = useSharedValue(0);
  const demo = useSharedValue(0);
  const tapLift = useSharedValue(0);
  const appear = useSharedValue(0);
  const subject = useSharedValue(NADA);
  const lastAngle = useSharedValue(0);
  const turned = useSharedValue(0);
  /** La piedra desde la que empezó este tirón de manivela. */
  const anchor = useSharedValue(problem.start);
  /** La piedra que el caminante ya pisó. El giro se cuenta desde ahí. */
  const at = useSharedValue(problem.start);
  /** La piedra que la manivela pide, ya en dientes absolutos desde la orilla. */
  const want = useSharedValue(problem.start);
  /** 1 mientras la manivela y el caminante todavía no se pueden mover. */
  const locked = useSharedValue(0);

  // Cinco fichas montadas siempre: el árbol no puede cambiar entre rondas.
  const slots: DragView[] = [useSlot(), useSlot(), useSlot(), useSlot(), useSlot()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /** Lo que el gesto consulta vive en referencias: un worklet puede estar un render atrasado. */
  const predictedRef = useRef(false);
  const lastStone = useRef(problem.start);

  useEffect(() => {
    doneRef.current = false;
    predictedRef.current = false;
    lastStone.current = problem.start;
    setWalkerAt(problem.start);
    pos.value = problem.start;
    at.value = problem.start;
    want.value = problem.start;
    lift.value = 0;
    tapLift.value = 0;
    appear.value = withTiming(1, { duration: theme.motion.base });
    for (let i = 0; i < TILE_SLOTS; i++) {
      const slot = slots[i] as DragView;
      slot.dx.value = 0;
      slot.dy.value = 0;
      slot.alive.value = i < problem.tiles.length ? 1 : 0;
    }
    // El latido de la manivela y de los huecos no es un adorno: dice dónde se juega.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    // La mano va y vuelve; el reloj de `explain` camina y rebobina. Las dos
    // vueltas se escriben con una secuencia porque un `withRepeat` sin reversa
    // arranca la repetición donde terminó la anterior y se queda quieto.
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    if (level.mode === "compare") {
      clock.value = 0;
      clock.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3400 }),
          // Un respiro en la bandera y vuelta al principio de un salto: si el
          // rebobinado se viera, parecería que el caminante desanda.
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 1 }),
        ),
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

  // El reloj de la latencia arranca cuando se muestra el problema y el nivel ya
  // empezó: lo que se mide es al jugador, no a la tarjeta de entrada.
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem, playing]);

  // En el nivel que anticipa, la manivela espera a que el jugador diga dónde va
  // a caer: girar antes sería contestar caminando.
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
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_NUMBER_LINE, layer: level.layer });
  }, [level.layer, onEvent]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean) => {
      const now = Date.now();
      const latency = now - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at: now,
          node: NODE_NUMBER_LINE,
          level: level.n,
          evidence,
          correct,
          latency,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_NUMBER_LINE, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    setFilled([]);
    setTapped(-1);
    setPicked(-1);
    setPredicted(false);
    setMessage({ text: opening, tone: "dim" });
  }, [round, level, opening, onEvent, onLevelDone]);

  /**
   * Cerrar la ronda, salvo que la guía esté explicando lo que acaba de pasar:
   * entonces queda pendiente y se cierra cuando el jugador dice "entendido".
   */
  const holding = useRef(false);
  holding.current = step?.holds === true;
  const pending = useRef(false);
  const advance = useCallback(() => {
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
      setSolved(true);
      quiet();
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(advance, 1500);
    },
    [advance, quiet, clock],
  );

  // --- Caminar ---------------------------------------------------------------

  /**
   * El caminante soltó el pie. Recibe los dientes crudos, incluidos los que la
   * pista no tiene, y es `crankStep` —el modelo, no la escena— quien decide en
   * qué piedra queda. Solo la bandera cierra la ronda.
   *
   * Cada soltada que movió al caminante es un intento: acercarse a la bandera
   * avanza y alejarse no. Así Tomi se entera de que el jugador está dando
   * vueltas, sin que la línea de abajo diga nunca "mal".
   */
  const landed = useCallback(
    (teeth: number) => {
      const stone = crankStep(0, teeth, problem.length);
      const prev = lastStone.current;
      lastStone.current = stone;
      setWalkerAt(stone);
      quiet();
      if (stone !== prev) say("stepped");
      if (problem.flag === null || doneRef.current) return;
      if (level.mode === "predict" && !predictedRef.current) return;
      if (stone === problem.flag) {
        attempt(true);
        say("arrived");
        succeed(level.mode === "predict" ? "Cayó donde dijiste." : "Llegó a la bandera.");
        return;
      }
      if (stone === prev) return;
      const closer = Math.abs(stone - problem.flag) < Math.abs(prev - problem.flag);
      attempt(closer);
      if (stone > problem.flag) {
        // Pasarse es el error de contar la piedra de salida como un paso. No hay
        // cartel: la bandera late y la pista sigue estando de los dos lados.
        hint.value = withRepeat(withTiming(1, { duration: 500 }), 6, true);
        setMessage({ text: "Se pasó de la bandera. Girá para el otro lado: la pista vuelve.", tone: "warn" });
        return;
      }
      setMessage(
        closer
          ? { text: "Todavía no llegó. Seguí girando hasta la bandera.", tone: "dim" }
          : { text: "Se alejó de la bandera. Girá para el otro lado.", tone: "warn" },
      );
    },
    [problem.flag, problem.length, level.mode, attempt, succeed, quiet, hint, say],
  );

  /** La manivela todavía no gira: se dice por qué, en vez de no hacer nada. */
  const nudgeLocked = useCallback(() => {
    setMessage({ text: "Primero tocá la piedra donde va a caer. Después se gira.", tone: "warn" });
  }, []);

  // --- Tocar -----------------------------------------------------------------

  const peek = useCallback(
    (stone: number) => {
      setTapped(stone);
      tapLift.value = withSequence(
        withTiming(1, { duration: 140 }),
        withTiming(1, { duration: 700 }),
        withTiming(0, { duration: 260 }),
      );
    },
    [tapLift],
  );

  const tapStone = useCallback(
    (stone: number) => {
      if (doneRef.current) return;
      quiet();
      if (level.mode === "predict" && !predictedRef.current) {
        const llegada = problem.start + problem.teeth;
        const ok = stone === llegada;
        attempt(ok);
        peek(stone);
        if (ok) {
          predictedRef.current = true;
          setPredicted(true);
          say("predicted");
          // Si el caminante ya está ahí no hay nada que volver a mirar.
          if (lastStone.current === llegada) {
            say("arrived");
            succeed("Dijo dónde iba a caer, y ya estaba ahí.");
            return;
          }
          setMessage({ text: "Ahí va a caer. Girá la manivela y mirá.", tone: "ok" });
        } else if (stone === llegada - 1) {
          // Contar la piedra de salida como un paso: el error que el nivel busca.
          setMessage({ text: "Esa cuenta la piedra donde está. Contá solo los saltos.", tone: "warn" });
        } else if (stone === problem.start) {
          setMessage({ text: "Ahí está ahora. Contá los dientes encendidos desde ahí.", tone: "warn" });
        } else {
          setMessage({ text: "Contá los dientes encendidos otra vez, un salto por diente.", tone: "warn" });
        }
        return;
      }
      if (level.cards) peek(stone);
    },
    [level.mode, level.cards, problem.start, problem.teeth, attempt, peek, quiet, say, succeed],
  );

  /** `explain`: tocar el recorrido que rompe la fila. */
  const pickRow = useCallback(
    (row: number) => {
      if (doneRef.current) return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      attempt(ok);
      if (ok) {
        say("chosen");
        succeed("Ese caminante cayó en el agua: sus pasos no medían lo mismo.");
      } else {
        // No dice "mal": muestra que ese recorrido pisa todas las piedras.
        setMessage({ text: "Ese pisa todas las piedras, una por una. Mirá el otro.", tone: "warn" });
      }
    },
    [problem.liar, attempt, succeed, quiet, say],
  );

  // --- Fichas ----------------------------------------------------------------

  // La ronda de huecos termina cuando no queda ninguno. Se mira acá y no dentro
  // del `setFilled` porque un actualizador de estado no puede tener efectos: en
  // modo estricto se lo invoca dos veces y la cuenta se pierde.
  useEffect(() => {
    if (level.mode !== "fill" || problem.gaps.length === 0) return;
    if (filled.length < problem.gaps.length) return;
    // Sin temporizador: `succeed` ya tiene su propio cerrojo, y un `setTimeout`
    // acá se cancelaría solo cada vez que el registro de eventos vuelve y
    // cambia la identidad de los callbacks.
    succeed("La pista quedó completa.");
  }, [filled, level.mode, problem.gaps.length, succeed]);

  /**
   * Soltar una ficha. El punto se calcula desde la ranura más dónde quedó el
   * dedo respecto de ella, y no con la posición absoluta del dedo: `onLayout`
   * mide contra el padre, y el lienzo no empieza donde empieza la página
   * (trampa 10). Con la resta vieja, el blanco quedaba corrido la altura de la
   * barra y el cartel: la ficha se soltaba sobre el hueco y volvía sin que nada
   * dijera por qué.
   */
  const dropTile = useCallback(
    (index: number, tx: number, ty: number) => {
      const tile = problem.tiles[index];
      const slot = slots[index];
      const home = layout.chips[index];
      const track = layout.rail;
      if (!tile || !slot || !home || doneRef.current) return;
      const x = home.x + tx;
      const y = home.y + ty;

      // Tolerancia generosa: el blanco es la piedra entera y su tarjeta. Con la
      // pista parada y encogida las piedras quedan a veinte píxeles, y dos
      // huecos seguidos se tocan: si la ficha cae cerca de su propio hueco, es
      // ese, aunque el vecino esté un poco más cerca del dedo. Lo que el nivel
      // pregunta es el número, no la puntería.
      const tolerance = Math.max(layout.touchR * 1.6, 52);
      const distance = (gap: number): number => {
        const s = track.stones[gap];
        if (!s) return Infinity;
        return Math.min(
          Math.hypot(x - (s.x + layout.cardDx), y - (s.y + layout.cardDy)),
          Math.hypot(x - s.x, y - s.y),
        );
      };
      let best = -1;
      let bestD = tolerance;
      for (const gap of problem.gaps) {
        if (filled.includes(gap)) continue;
        const d = distance(gap);
        if (d < bestD) {
          bestD = d;
          best = gap;
        }
      }
      if (best >= 0 && best !== tile.value && problem.gaps.includes(tile.value) && !filled.includes(tile.value)) {
        if (distance(tile.value) < tolerance * 0.75) best = tile.value;
      }
      if (best < 0) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
        // Un toque sin arrastre no es soltar en ningún lado: no hay nada que decir.
        if (Math.hypot(tx, ty) > 16) {
          setMessage({ text: "La ficha volvió al cajón. Soltala sobre un hueco.", tone: "dim" });
        }
        return;
      }

      quiet();
      const s = track.stones[best];
      if (!s) return;
      const ok = tile.value === best;
      attempt(ok);
      if (!ok) {
        // La ficha equivocada no entra: se desliza hasta el borde y vuelve.
        const px = (s.x + layout.cardDx - home.x) * 0.82;
        const py = (s.y + layout.cardDy - home.y) * 0.82;
        slot.dx.value = withSequence(withTiming(px, { duration: 110 }), withTiming(0, { duration: 320 }));
        slot.dy.value = withSequence(withTiming(py, { duration: 110 }), withTiming(0, { duration: 320 }));
        setMessage({ text: "Esa ficha no entra en ese hueco. Mirá las tarjetas vecinas.", tone: "warn" });
        return;
      }

      // La ficha vuela hasta la piedra, pero clavarla no espera a la animación:
      // si el estado dependiera de que termine, una animación interrumpida
      // dejaría la ronda a medias.
      slot.dx.value = withTiming(s.x + layout.cardDx - home.x, { duration: 150 });
      slot.dy.value = withTiming(s.y + layout.cardDy - home.y, { duration: 150 });
      slot.alive.value = withTiming(0, { duration: 140 });
      setMessage({ text: "Se clavó.", tone: "ok" });
      setFilled((prev) => (prev.includes(best) ? prev : [...prev, best]));
      say("pinned");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem, layout, filled, attempt, quiet, say],
  );

  // --- Gestos ----------------------------------------------------------------

  const track = layout.rail;
  const compare = level.mode === "compare";

  /**
   * Los gestos se arman una vez por nivel y leen lo que cambia por ronda de
   * valores compartidos y de funciones estables. Rearmados en cada ronda,
   * podían quedarse con la geometría o el cierre de la anterior (trampa 8).
   */
  const geoNow = useMemo<PathGeo>(
    () => ({
      cx: layout.crank.x,
      cy: layout.crank.y,
      cr: layout.crank.r,
      ox: track.origin.x,
      oy: track.origin.y,
      tdx: track.dx,
      tdy: track.dy,
      touchR: layout.touchR,
      length: problem.length,
      rows: [...layout.rows],
      xs: track.stones.map((s) => s.x),
      ys: track.stones.map((s) => s.y),
      // La tarjeta de una piedra también es la piedra: tocarla cuenta igual.
      cardDx: level.cards ? layout.cardDx : 0,
      cardDy: level.cards ? layout.cardDy : 0,
    }),
    [layout, track, problem.length, level.cards],
  );
  const geo = useSharedValue<PathGeo>(geoNow);
  useEffect(() => {
    geo.value = geoNow;
  }, [geoNow, geo]);
  const blocked = useSharedValue(0);
  useEffect(() => {
    blocked.value = solved ? 1 : 0;
  }, [solved, blocked]);

  const onLanded = useLatest(landed);
  const onNudge = useLatest(nudgeLocked);
  const onTapStone = useLatest(tapStone);
  const onPickRow = useLatest(pickRow);
  const onDropTile = useLatest(dropTile);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!compare)
        .onBegin((e) => {
          const g = geo.value;
          subject.value = NADA;
          if (blocked.value === 1) return;
          const enManivela = Math.hypot(e.x - g.cx, e.y - g.cy) < g.cr * 1.35;
          const wx = g.ox + g.tdx * pos.value;
          const wy = g.oy + g.tdy * pos.value;
          const enCaminante = Math.hypot(e.x - wx, e.y - (wy - 18)) < g.touchR * 1.4;
          if (locked.value === 1) {
            if (enManivela || enCaminante) runOnJS(onNudge)();
            return;
          }
          if (enManivela) {
            subject.value = MANIVELA;
            lastAngle.value = Math.atan2(e.y - g.cy, e.x - g.cx);
            turned.value = 0;
            anchor.value = at.value;
            want.value = at.value;
            return;
          }
          if (enCaminante) subject.value = CAMINANTE;
        })
        .onStart(() => {
          if (subject.value === CAMINANTE) lift.value = withTiming(1, { duration: 140 });
        })
        .onChange((e) => {
          const g = geo.value;
          if (subject.value === MANIVELA) {
            const a = Math.atan2(e.y - g.cy, e.x - g.cx);
            let d = a - lastAngle.value;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            turned.value += d;
            lastAngle.value = a;
            // Redondear acá es lo que hace imposible el medio diente: entre dos
            // dientes no hay nada que el gesto pueda expresar. Es la misma cuenta
            // que `crankStep` del modelo, escrita de nuevo porque un worklet no
            // puede llamar a un paquete; el modelo decide igual al soltar.
            const raw = anchor.value + Math.round(turned.value / TOOTH_ANGLE);
            if (raw === want.value) return;
            want.value = raw;
            const stone = Math.max(0, Math.min(g.length - 1, raw));
            if (raw < 0 || raw > g.length - 1) {
              // El tope de la orilla. Es una promesa, no un límite: se abre en
              // los negativos, mucho más adelante.
              jam.value = withSequence(
                withTiming(1, { duration: 70 }),
                withTiming(-1, { duration: 110 }),
                withTiming(0, { duration: 90 }),
              );
            }
            if (stone === at.value) return;
            at.value = stone;
            pos.value = withTiming(stone, { duration: 160 });
          } else if (subject.value === CAMINANTE) {
            const stepSq = Math.max(1, g.tdx * g.tdx + g.tdy * g.tdy);
            const u = ((e.x - g.ox) * g.tdx + (e.y - g.oy) * g.tdy) / stepSq;
            pos.value = Math.max(-0.6, Math.min(g.length - 0.4, u));
          }
        })
        .onEnd(() => {
          const g = geo.value;
          if (subject.value === CAMINANTE) {
            lift.value = withTiming(0, { duration: 180 });
            // El agua devuelve: se cae en la piedra más cercana, nunca entre dos.
            const stone = Math.max(0, Math.min(g.length - 1, Math.round(pos.value)));
            at.value = stone;
            pos.value = withTiming(stone, { duration: 200 });
            want.value = stone;
            runOnJS(onLanded)(stone);
          } else if (subject.value === MANIVELA) {
            runOnJS(onLanded)(want.value);
          }
          subject.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compare, onLanded, onNudge],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .onEnd((e) => {
          if (blocked.value === 1) return;
          const g = geo.value;
          if (compare) {
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
          let bestD = Math.max(g.touchR * 1.3, 34);
          for (let i = 0; i < g.xs.length; i++) {
            const sx = g.xs[i] as number;
            const sy = g.ys[i] as number;
            const d = Math.min(
              Math.hypot(e.x - sx, e.y - sy),
              Math.hypot(e.x - sx - g.cardDx, e.y - sy - g.cardDy),
            );
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (best >= 0) runOnJS(onTapStone)(best);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compare, onPickRow, onTapStone],
  );

  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  /**
   * La mano fantasma, para cuando el nivel no tiene guía: en los niveles que se
   * caminan toma la manivela y la gira dos dientes; en los que se completan
   * lleva la primera ficha hasta el primer hueco. Con guía se apaga: dos manos
   * a la vez señalarían dos cosas distintas.
   */
  const ghost = useMemo<TrackGhost | null>(() => {
    if (compare || guided) return null;
    const hole = problem.gaps.find((g) => !filled.includes(g));
    const stone = hole === undefined ? undefined : track.stones[hole];
    if (level.mode === "fill" && stone) {
      return {
        kind: "move",
        from: layout.chips[0] ?? { x: 0, y: 0 },
        to: { x: stone.x + layout.cardDx, y: stone.y + layout.cardDy },
      };
    }
    return { kind: "turn", teeth: 2 };
  }, [compare, guided, level.mode, problem.gaps, filled, track, layout]);

  // --- Qué señala la guía ----------------------------------------------------

  // La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(
    () => (shown ? focusFor(shown.id, level, problem, layout, walkerAt, filled) : null),
    [shown, level, problem, layout, walkerAt, filled],
  );

  return (
    <View style={styles.root}>
      <Header
        title={`${t(`node.${NODE_NUMBER_LINE}.name`)} · nivel ${level.n} de ${TOTAL_PATH_LEVELS}`}
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
            hint={hint}
            clock={clock}
            demo={demo}
            tapLift={tapLift}
            appear={appear}
            stop={level.mode === "predict" ? problem.teeth : 0}
            filled={filled}
            tapped={tapped}
            picked={picked}
            explaining={compare}
            ghost={ghost}
            chips={slots}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Siempre las mismas asas: las que esta ronda no usa quedan sordas. */}
        {Array.from({ length: TILE_SLOTS }, (_, i) => {
          const tile = problem.tiles[i];
          return (
            <TileHandle
              key={i}
              index={i}
              slot={slots[i] as DragView}
              spot={layout.chips[i] ?? { x: 0, y: 0 }}
              w={layout.chipW}
              h={layout.chipH}
              enabled={!!tile && !solved && !filled.includes(tile.value)}
              onDrop={onDropTile}
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
interface PathGeo {
  readonly cx: number;
  readonly cy: number;
  readonly cr: number;
  readonly ox: number;
  readonly oy: number;
  readonly tdx: number;
  readonly tdy: number;
  readonly touchR: number;
  readonly length: number;
  readonly rows: readonly number[];
  readonly xs: readonly number[];
  readonly ys: readonly number[];
  readonly cardDx: number;
  readonly cardDy: number;
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

/**
 * Qué señala cada paso de la guía, calculado de la geometría de esta ronda: el
 * caminante y la bandera, la perilla de la manivela y hacia dónde se gira, las
 * piedras donde puede caer, las dos pistas, el hueco y la ficha que va ahí.
 */
function focusFor(
  id: string,
  level: PathLevel,
  problem: PathProblem,
  l: TrackLayout,
  walkerAt: number,
  filled: readonly number[],
): Focus {
  const rail = l.rail;
  const stoneRect = (i: number): Rect => {
    const s = rail.stones[i] ?? rail.origin;
    // El caminante se para sobre la piedra: el anillo le deja lugar arriba.
    return { x: s.x - 24, y: s.y - 52, w: 48, h: 66 };
  };
  const crankRect: Rect = {
    x: l.crank.x - l.crank.r - 8,
    y: l.crank.y - l.crank.r - 8,
    w: l.crank.r * 2 + 16,
    h: l.crank.r * 2 + 16,
  };
  // La perilla está donde la dejó el último paso; un cuarto de vuelta hacia la
  // derecha son tres dientes hacia adelante.
  const knob = (stone: number, quarter: number): { from: Pt; to: Pt } => {
    const r = l.crank.r * 0.62;
    const a = stone * TOOTH_ANGLE - Math.PI / 2;
    const b = a + quarter * (Math.PI / 2);
    return {
      from: { x: l.crank.x + Math.cos(a) * r, y: l.crank.y + Math.sin(a) * r },
      to: { x: l.crank.x + Math.cos(b) * r, y: l.crank.y + Math.sin(b) * r },
    };
  };
  const flag = problem.flag ?? walkerAt;
  const flagRect = stoneRect(flag);
  const cardRect = (i: number): Rect => {
    const s = rail.stones[i] ?? rail.origin;
    return {
      x: s.x + l.cardDx - l.cardW / 2 - 6,
      y: s.y + l.cardDy - l.cardH / 2 - 6,
      w: l.cardW + 12,
      h: l.cardH + 12,
    };
  };
  const span = (a: number, b: number): Rect => {
    const lo = rail.stones[Math.max(0, Math.min(a, b))] ?? rail.origin;
    const hi = rail.stones[Math.min(problem.length - 1, Math.max(a, b))] ?? rail.origin;
    const x0 = Math.min(lo.x, hi.x) - 24;
    const y0 = Math.min(lo.y, hi.y) - 30;
    return {
      x: x0,
      y: y0,
      w: Math.abs(hi.x - lo.x) + 48 + (rail.dx === 0 ? l.cardDx + l.cardW : 0),
      h: Math.abs(hi.y - lo.y) + 30 + Math.max(l.cardDy + l.cardH / 2 + 8, 30),
    };
  };

  if (level.mode === "walk") {
    if (id === "look") return { rings: [stoneRect(walkerAt), flagRect] };
    if (id === "turn") return { rings: [crankRect], drag: knob(walkerAt, 1) };
    if (id === "arrive") {
      const quarter = flag >= walkerAt ? 1 : -1;
      return { rings: [flagRect, crankRect], drag: knob(walkerAt, quarter) };
    }
    return { rings: [flagRect] };
  }

  if (level.mode === "predict") {
    const llegada = problem.start + problem.teeth;
    if (id === "look") return { rings: [crankRect, stoneRect(problem.start)] };
    // Las piedras donde puede caer, sin decir cuál: de la siguiente a una más
    // allá de la llegada.
    if (id === "predict") return { rings: [span(problem.start + 1, llegada + 1)] };
    if (id === "arrive") return { rings: [crankRect, stoneRect(llegada)], drag: knob(walkerAt, 1) };
    return { rings: [stoneRect(llegada)] };
  }

  if (level.mode === "compare") {
    const rowRect = (i: number): Rect => {
      const r = l.rails[i] ?? rail;
      return { x: r.from.x - 26, y: r.y - 54, w: r.to.x - r.from.x + 52, h: 54 + l.cardDy + l.cardH / 2 + 8 };
    };
    if (id === "reveal") return { rings: [rowRect(problem.liar)] };
    return { rings: [rowRect(0), rowRect(1)] };
  }

  // Huecos: el primero que falta, sus vecinas y la ficha que va ahí.
  const hole = problem.gaps.find((g) => !filled.includes(g)) ?? problem.gaps[problem.gaps.length - 1] ?? 0;
  const neighbors = [hole - 1, hole + 1]
    .filter((i) => i >= 0 && i < problem.length && !problem.gaps.includes(i))
    .map(cardRect);
  if (id === "look") return { rings: [cardRect(hole), ...neighbors] };
  if (id === "fill") {
    const tile = problem.tiles.findIndex((tl) => tl.value === hole);
    const from = l.chips[tile];
    const s = rail.stones[hole] ?? rail.origin;
    const to = { x: s.x + l.cardDx, y: s.y + l.cardDy };
    return from ? { rings: [cardRect(hole)], drag: { from, to } } : { rings: [cardRect(hole)] };
  }
  const last = filled[filled.length - 1] ?? hole;
  return { rings: [cardRect(last)] };
}

/**
 * Un asa invisible sobre la ficha dibujada: el numeral es dibujo, no interfaz.
 *
 * Al soltar entrega dónde está el dedo respecto del centro de la ficha, medido
 * desde el asa (`e.x`, `e.y`: trampa 15), y no la traslación acumulada: el
 * gesto la mide desde que se activó y no desde el apoyo, así que en un
 * arrastre largo se queda corta decenas de píxeles y la ficha caía antes del
 * hueco. Quien la recibe suma la ranura, que es geometría del lienzo.
 */
function TileHandle({
  index,
  slot,
  spot,
  w,
  h,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly slot: DragView;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, tx: number, ty: number) => void;
}) {
  // En web, un gesto que nace deshabilitado no despierta nunca: el asa de una
  // ficha que en la primera ronda no existía quedaba muerta en la segunda, y
  // justo esa era la ficha del hueco. El gesto nace siempre habilitado y lo que
  // decide si responde viaja en un valor compartido.
  const live = useSharedValue(enabled ? 1 : 0);
  useEffect(() => {
    live.value = enabled ? 1 : 0;
  }, [enabled, live]);
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          if (live.value !== 1) return;
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        .onEnd((e) => {
          if (live.value !== 1) return;
          runOnJS(onDrop)(index, e.x - (w + 12) / 2, e.y - (h + 12) / 2);
        }),
    [index, slot, onDrop, w, h, live],
  );
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - w / 2 - 6,
          top: spot.y - h / 2 - 6,
          width: w + 12,
          height: h + 12,
          // Un asa sorda no puede comerse los toques del lienzo (trampa 13).
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

function useSlot(): DragView {
  return {
    dx: useSharedValue(0),
    dy: useSharedValue(0),
    alive: useSharedValue(0),
  };
}

/**
 * Lo que este nodo le pide a la mecánica. Cinco fichas de 48, la pista que se
 * puede parar, la tarjeta con el numeral sobre cada piedra y ningún tope salvo
 * en el nivel que anticipa. Las medidas van aparte de las decisiones: son las
 * del nodo 2, que dibuja la pista más suelta que los demás porque tiene pocas
 * piedras y mucho lugar.
 */
function pathConfig(problem: PathProblem, level: PathLevel, hideFlag: boolean): TrackConfig {
  const compare = level.mode === "compare";
  const vertical = problem.orientation === "vertical";
  return {
    slots: problem.length,
    leadIn: problem.leadIn,
    skin: level.skin,
    orientation: problem.orientation,
    // Las dos animaciones que se comparan tienen que medir lo mismo: si una
    // estuviera estirada, la comparación hablaría del dibujo y no del paso.
    stretch: compare ? 1 : problem.stretch,
    railRows: compare ? [0.26, 0.6] : vertical ? [0.24] : [0.36],
    numerals: level.cards ? "cards" : "none",
    numeralFrom: level.zeroCard ? 0 : 1,
    gaps: problem.gaps,
    flag: problem.flag === null || hideFlag ? null : { at: problem.flag },
    // En la capa visual la mitad de las instancias se juega sin caminante.
    walker: problem.showWalker || compare,
    crankAt: vertical ? "right" : "bottomLeft",
    drawer: {
      chips: problem.tiles,
      views: TILE_SLOTS,
      w: 48,
      h: 48,
      gap: 12,
      center: vertical ? "canvas" : "midRight",
      centerFrac: 0.62,
      spread: "chips",
      at: "bottom",
      margin: 16,
      numerals: true,
      signed: false,
    },
    explain: compare ? { kind: "walks", walks: problem.walks, liar: problem.liar } : null,
    metrics: {
      pad: 52,
      maxStep: 132,
      stone: { frac: 0.36, max: 26, flat: 0 },
      stoneOutline: true,
      markHalf: 9,
      // El tope de este nodo anuncia, no sujeta: el diente llega un poco menos
      // lejos y con un trazo más fino.
      stopReach: 0.9,
      stopWidth: 2.5,
      ghostR: 13,
      flag: { base: 6, top: 44, span: 22, drop: 8 },
      card: { frac: 0.86, min: 18, max: 34, h: 26 },
      cardDy: 30,
      crank: { min: 34, max: 52, frac: 0.14, margin: 14 },
      touch: { frac: 0.55, min: 26 },
      numeralEvery: null,
    },
  };
}

/**
 * El alto del lienzo. Con lección, arriba va el cartel de la guía, que en un
 * teléfono angosto llega a ocupar un tercio de la pantalla: con la fracción
 * sola, en 390 × 844 el lienzo empujaba el título por arriba y la línea de abajo
 * por abajo, y el jugador no veía lo que el juego le contestaba. Lo que queda
 * para el lienzo se calcula restando lo que ocupan la barra, el título, el
 * cartel y la línea de abajo.
 */
function sceneHeight(width: number, height: number, withLesson: boolean, min: number): number {
  const reserve = withLesson ? (width < 520 ? 480 : 420) : 190;
  const frac = withLesson ? 0.56 : 0.66;
  return Math.max(min, Math.min(height * frac, height - reserve, 540));
}

/** Lo primero que se ve cuando el nivel no tiene lección. Es para el adulto. */
function openingHint(level: PathLevel): string {
  switch (level.mode) {
    case "walk":
      return "Girá la manivela: un diente, una piedra.";
    case "predict":
      return "Mirá los dientes y tocá la piedra donde va a caer.";
    case "compare":
      return "Uno de los dos rompe la fila. Tocalo.";
    default:
      return "Llevá cada ficha al hueco que le toca.";
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
