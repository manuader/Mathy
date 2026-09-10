/**
 * El camino de piedras: el minijuego de `found.count.number_line`.
 *
 * Un chico de cinco años que no lee tiene que poder jugarlo entero. Por eso no
 * hay ninguna instrucción escrita: la manivela late, una mano fantasma la gira
 * dos dientes y el caminante contesta. Los mensajes de abajo son para el adulto
 * que mira; el juego funciona igual con la pantalla tapada hasta la mitad.
 *
 * Cuatro gestos y ninguno fino:
 *
 * - Girar la manivela. Cada diente es una piedra. La cuenta de dientes es
 *   entera, así que el caminante no puede caer al agua girando: no es una
 *   validación, es que el medio paso no se puede expresar.
 * - Arrastrar al caminante. Flota mientras el dedo lo sostiene y al soltarlo
 *   cae en la piedra más cercana. El agua devuelve; nunca traga.
 * - Tocar una piedra. Su tarjeta se levanta y muestra el numeral.
 * - Arrastrar una ficha a un hueco. Si el numeral no es el que va, la ficha se
 *   desliza hasta el borde y vuelve a la mano. Esa resistencia es todo el
 *   mensaje: el juego nunca dice "mal".
 *
 * El nodo declara `misconceptions: []` y ninguna entrada del catálogo de L
 * apunta acá, así que ningún `attempt` lleva `misconception`. Los tres errores
 * que el diseño prevé están en el documento del minijuego esperando playtest.
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
} from "../scenes/TrackScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
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

function Activity({ level, onLevelDone, onExit, onEvent }: NumberLineGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera: abrir
  // la chuleta achica la actividad y nunca la tapa.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  const [filled, setFilled] = useState<readonly number[]>([]);
  const [tapped, setTapped] = useState(-1);
  const [picked, setPicked] = useState(-1);
  /** En el nivel que anticipa hay dos tiempos: primero se dice, después se camina. */
  const [predicted, setPredicted] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(level),
    tone: "dim",
  }));

  const problem = useMemo(
    () => generatePath(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = Math.max(320, Math.min(height * 0.66, 540));
  const config = useMemo(() => pathConfig(problem, level), [problem, level]);
  const layout = useMemo(() => trackLayout(config, width, sceneH), [config, width, sceneH]);
  const [canvasBox, setCanvasBox] = useState({ x: 0, y: 0 });

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

  // Cinco fichas montadas siempre: el árbol no puede cambiar entre rondas.
  const slots: DragView[] = [
    useSlot(),
    useSlot(),
    useSlot(),
    useSlot(),
    useSlot(),
  ];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);

  // El reloj de la latencia arranca cuando se muestra el problema, no cuando
  // termina de dibujarse: lo que se mide es al jugador.
  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
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
    // El latido de la demostración no es un adorno: es la única instrucción.
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

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_NUMBER_LINE, layer: level.layer });
  }, [level.layer, onEvent]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
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
    setMessage({ text: openingHint(level), tone: "dim" });
  }, [round, level, onEvent, onLevelDone]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1500);
    },
    [nextRound, quiet, clock],
  );

  // --- Caminar ---------------------------------------------------------------

  /**
   * El caminante soltó el pie. Recibe los dientes crudos, incluidos los que la
   * pista no tiene, y es `crankStep` —el modelo, no la escena— quien decide en
   * qué piedra queda. Solo la bandera cierra la ronda.
   */
  const landed = useCallback(
    (teeth: number) => {
      const stone = crankStep(0, teeth, problem.length);
      quiet();
      if (problem.flag === null || solved) return;
      if (level.mode === "predict" && !predicted) return;
      if (stone === problem.flag) {
        attempt(true);
        succeed("Llegó a la bandera.");
      } else if (stone > problem.flag) {
        // Pasarse es el error de contar la piedra de salida como un paso. No hay
        // cartel: la bandera late y la pista sigue estando de los dos lados.
        attempt(false);
        hint.value = withRepeat(withTiming(1, { duration: 500 }), 6, true);
        setMessage({ text: "Se pasó de la bandera. La pista sigue para atrás.", tone: "warn" });
      }
    },
    [problem.flag, problem.length, solved, level.mode, predicted, attempt, succeed, quiet, hint],
  );

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
      if (solved) return;
      quiet();
      if (level.mode === "predict" && !predicted) {
        const ok = stone === problem.start + problem.teeth;
        attempt(ok);
        peek(stone);
        if (ok) {
          setPredicted(true);
          setMessage({ text: "Ahí va a caer. Girá la manivela y mirá.", tone: "ok" });
        } else {
          setMessage({ text: "Contá los dientes de la manivela otra vez.", tone: "warn" });
        }
        return;
      }
      if (level.cards) peek(stone);
    },
    [solved, level.mode, level.cards, predicted, problem.start, problem.teeth, attempt, peek, quiet],
  );

  /** `explain`: tocar el recorrido que rompe la fila. */
  const pickRow = useCallback(
    (row: number) => {
      if (solved) return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      attempt(ok);
      if (ok) {
        succeed("Ese caminante cayó en el agua: sus pasos no medían lo mismo.");
      } else {
        // No dice "mal": muestra que ese recorrido pisa todas las piedras.
        setMessage({ text: "Ese pisa todas las piedras, una por una. Mirá el otro.", tone: "warn" });
      }
    },
    [solved, problem.liar, attempt, succeed, quiet],
  );

  // --- Fichas ----------------------------------------------------------------

  /** La ficha se clavó: la tarjeta aparece sobre la piedra y la ficha se apaga. */
  const pinned = useCallback(
    (index: number, stone: number) => {
      const slot = slots[index];
      if (slot) slot.alive.value = withTiming(0, { duration: 140 });
      setMessage({ text: "Se clavó.", tone: "ok" });
      setFilled((prev) => (prev.includes(stone) ? prev : [...prev, stone]));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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

  const dropTile = useCallback(
    (index: number, absX: number, absY: number) => {
      const tile = problem.tiles[index];
      const slot = slots[index];
      const track = layout.rail;
      if (!tile || !slot || solved) return;
      const x = absX - canvasBox.x;
      const y = absY - canvasBox.y;

      // Tolerancia generosa: el blanco es la piedra entera y su tarjeta.
      let best = -1;
      let bestD = Math.max(layout.touchR * 1.6, 52);
      for (const gap of problem.gaps) {
        if (filled.includes(gap)) continue;
        const s = track.stones[gap];
        if (!s) continue;
        const d = Math.hypot(x - (s.x + layout.cardDx), y - (s.y + layout.cardDy));
        if (d < bestD) {
          bestD = d;
          best = gap;
        }
      }
      if (best < 0) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
        return;
      }

      quiet();
      const home = layout.chips[index];
      const s = track.stones[best];
      if (!home || !s) return;
      const ok = tile.value === best;
      attempt(ok);
      if (!ok) {
        // La ficha equivocada no entra: se desliza hasta el borde y vuelve.
        const px = (s.x + layout.cardDx - home.x) * 0.82;
        const py = (s.y + layout.cardDy - home.y) * 0.82;
        slot.dx.value = withSequence(
          withTiming(px, { duration: 110 }),
          withTiming(0, { duration: 320 }),
        );
        slot.dy.value = withSequence(
          withTiming(py, { duration: 110 }),
          withTiming(0, { duration: 320 }),
        );
        setMessage({ text: "Esa ficha no entra en ese hueco.", tone: "warn" });
        return;
      }

      // La ficha vuela hasta la piedra, pero clavarla no espera a la animación:
      // si el estado dependiera de que termine, una animación interrumpida
      // dejaría la ronda a medias.
      slot.dx.value = withTiming(s.x + layout.cardDx - home.x, { duration: 150 });
      slot.dy.value = withTiming(s.y + layout.cardDy - home.y, { duration: 150 });
      pinned(index, best);
    },
    // `pinned` se declara abajo y no cambia de identidad entre cuadros.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem, layout, filled, canvasBox, solved, attempt, quiet, pinned],
  );

  // --- Gestos ----------------------------------------------------------------

  const track = layout.rail;
  const ox = track.origin.x;
  const oy = track.origin.y;
  const tdx = track.dx;
  const tdy = track.dy;
  const stepSq = Math.max(1, tdx * tdx + tdy * tdy);
  const crank = layout.crank;
  const length = problem.length;
  const touchR = layout.touchR;
  const compare = level.mode === "compare";
  // Las coordenadas del hit test viajan al worklet como números sueltos, así
  // que se congelan por layout y no por cuadro.
  const rowsY = layout.rows;
  const stoneXs = useMemo(() => track.stones.map((s) => s.x), [track]);
  const stoneYs = useMemo(() => track.stones.map((s) => s.y), [track]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!solved && !compare)
        .onBegin((e) => {
          if (Math.hypot(e.x - crank.x, e.y - crank.y) < crank.r * 1.35) {
            subject.value = MANIVELA;
            lastAngle.value = Math.atan2(e.y - crank.y, e.x - crank.x);
            turned.value = 0;
            anchor.value = at.value;
            want.value = at.value;
            return;
          }
          const wx = ox + tdx * pos.value;
          const wy = oy + tdy * pos.value;
          subject.value = Math.hypot(e.x - wx, e.y - wy) < touchR * 1.4 ? CAMINANTE : NADA;
        })
        .onStart(() => {
          if (subject.value === CAMINANTE) lift.value = withTiming(1, { duration: 140 });
        })
        .onChange((e) => {
          if (subject.value === MANIVELA) {
            const a = Math.atan2(e.y - crank.y, e.x - crank.x);
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
            const stone = Math.max(0, Math.min(length - 1, raw));
            if (raw < 0 || raw > length - 1) {
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
            const u = ((e.x - ox) * tdx + (e.y - oy) * tdy) / stepSq;
            pos.value = Math.max(-0.6, Math.min(length - 0.4, u));
          }
        })
        .onEnd(() => {
          if (subject.value === CAMINANTE) {
            lift.value = withTiming(0, { duration: 180 });
            // El agua devuelve: se cae en la piedra más cercana, nunca entre dos.
            const stone = Math.max(0, Math.min(length - 1, Math.round(pos.value)));
            at.value = stone;
            pos.value = withTiming(stone, { duration: 200 });
            want.value = stone;
            runOnJS(landed)(stone);
          } else if (subject.value === MANIVELA) {
            runOnJS(landed)(want.value);
          }
          subject.value = NADA;
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, compare, crank, ox, oy, tdx, tdy, stepSq, touchR, length, landed],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(24)
        .enabled(!solved)
        .onEnd((e) => {
          if (compare) {
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
          let bestD = Math.max(touchR * 1.3, 34);
          for (let i = 0; i < stoneXs.length; i++) {
            const d = Math.hypot(e.x - (stoneXs[i] as number), e.y - (stoneYs[i] as number));
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
          if (best >= 0) runOnJS(tapStone)(best);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, compare, rowsY, stoneXs, stoneYs, touchR, pickRow, tapStone],
  );

  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  /**
   * La mano fantasma. Es la única instrucción del nodo: en los niveles que se
   * caminan toma la manivela y la gira dos dientes; en los que se completan
   * lleva la primera ficha hasta el primer hueco. En `explain` no hay nada que
   * demostrar con la mano: se mira y se elige.
   */
  const ghost = useMemo<TrackGhost | null>(() => {
    if (compare) return null;
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
  }, [compare, level.mode, problem.gaps, filled, track, layout]);

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_NUMBER_LINE}.name`)} · nivel ${level.n} de ${TOTAL_PATH_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View
        style={{ width, height: sceneH }}
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          setCanvasBox((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
        }}
      >
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
              onDrop={dropTile}
            />
          );
        })}
      </View>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

/** Un asa invisible sobre la ficha dibujada: el numeral es dibujo, no interfaz. */
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
  readonly onDrop: (index: number, absX: number, absY: number) => void;
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
          runOnJS(onDrop)(index, e.absoluteX, e.absoluteY);
        }),
    [enabled, index, slot, onDrop],
  );
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
function pathConfig(problem: PathProblem, level: PathLevel): TrackConfig {
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
    flag: problem.flag === null ? null : { at: problem.flag },
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
    backgroundColor: theme.color.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  back: { position: "absolute", top: 48, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
});
