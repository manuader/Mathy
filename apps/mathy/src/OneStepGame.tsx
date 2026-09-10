/**
 * Cofres y llaves: el minijuego de `alg.eq.one_step`.
 *
 * El nodo enseña dos cosas a la vez, y por eso hay dos superficies. En las
 * capas `concrete` y `visual` el jugador manipula objetos: pasa la llave por
 * los platos de una balanza y la barra le contesta. Desde `symbolic` la misma
 * regla se juega sobre la ecuación, que es la superficie que el objeto dejó.
 *
 * El progreso va atado al dedo, no a un temporizador: el jugador puede ir y
 * volver, y la escena lo acompaña.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withTiming, withSequence, runOnJS } from "react-native-reanimated";
import { applyBothSides } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { centered, layoutEquation, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, smooth } from "@mathy/viz-core";
import { MorphView } from "@mathy/viz-skia";
import { NODE, TOTAL_LEVELS, generateOneStep, type Key, type Level } from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import { BalanceScene, panZones } from "./scenes/BalanceScene.tsx";
import { KeyRing, KeyView } from "./ui/KeyRing.tsx";
import { Header, Hint } from "./ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "./ui/ActivityShell.tsx";
import { theme } from "./ui/theme.ts";

const FONT_SIZE = 52;
/** Cuánto hay que arrastrar para completar el paso en la superficie simbólica. */
const DRAG_RANGE = 150;

const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

const OP_CHAR: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/** Qué tan cerca del plato pasó la llave, de 0 a 1. Corre en el hilo de UI. */
function nearness(x: number, y: number, cx: number, cy: number, r: number): number {
  "worklet";
  const d = Math.hypot(x - cx, y - cy);
  return Math.max(0, Math.min(1, (r - d) / (r * 0.6)));
}

export interface OneStepGameProps {
  readonly level: Level;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function OneStepGame(props: OneStepGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: OneStepGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera: abrir
  // una herramienta achica la actividad y nunca la tapa.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);

  /** Antes de los símbolos el jugador manipula la balanza; después, la ecuación. */
  const handsOn = level.layer === "concrete" || level.layer === "visual";
  const showsEquation = !handsOn;
  const showsBalance = level.balance !== "hidden";

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: handsOn ? OPENING_HINT : "Arrastrá la llave que abre esta cerradura.",
    tone: "dim",
  }));

  const problem = useMemo(
    () => generateOneStep(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const progress = useSharedValue(0);
  // Cuánto se aplicó la acción de la llave en cada plato. Son dos y no uno
  // porque la pregunta del nodo es "en cuántos platos", no "cuánto".
  const leftPan = useSharedValue(0);
  const rightPan = useSharedValue(0);
  const reached = useSharedValue(0);
  const ghost = useSharedValue(level.balance === "shown" ? 1 : 0);
  const [ghostOn, setGhostOn] = useState(level.balance === "shown");

  // Un plan por llave: se calculan al cambiar de problema, no por cuadro.
  const plans = useMemo(() => {
    const before = centered(layoutEquation(problem.equation, metrics));
    const out = new Map<string, ReturnType<typeof planMorph>>();
    for (const k of problem.keys) {
      const step = applyBothSides(problem.equation, k.op, k.value, problem.unknown);
      const after = centered(layoutEquation(step.next, metrics));
      out.set(k.id, planMorph(before, after, step.trace));
    }
    return out;
  }, [problem]);

  const [shownKeyId, setShownKeyId] = useState<string>(() => problem.keys[0]!.id);
  const plan = plans.get(shownKeyId) ?? plans.get(problem.keys[0]!.id)!;

  const sceneH = Math.max(280, Math.min(height * (handsOn ? 0.54 : 0.44), 480));
  const balanceH = handsOn ? sceneH : sceneH * 0.66;
  const equationY = handsOn ? sceneH * 0.5 : showsBalance ? sceneH * 0.86 : sceneH * 0.5;
  const [canvasBox, setCanvasBox] = useState({ x: 0, y: 0 });
  const zones = useMemo(() => panZones(width, balanceH), [width, balanceH]);

  // El reloj arranca cuando se muestra el problema: la latencia es del jugador,
  // no del render.
  const shownAt = useRef(Date.now());
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem]);

  // La capa vista es lo que agrega entradas a la chuleta, así que se registra al
  // entrar al nivel y no al terminarlo.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE, layer: level.layer });
  }, [level.layer, onEvent]);

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * No es inflar la cuenta: un nivel que pide reconocer *y* manipular da
   * evidencia de las dos cosas en el mismo gesto, y K lleva la cuenta por verbo.
   */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE,
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

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    progress.value = 0;
    leftPan.value = 0;
    rightPan.value = 0;
    setMessage({
      text: handsOn ? OPENING_HINT : "Arrastrá la llave que abre esta cerradura.",
      tone: "dim",
    });
  }, [round, level.rounds, level.n, onEvent, onLevelDone, progress, leftPan, rightPan, handsOn]);

  const succeed = useCallback(() => {
    setSolved(true);
    attempt(true);
    if (showsEquation) progress.value = 1;
    setMessage({
      text: handsOn ? "La barra quedó nivelada y la caja se abrió." : "La x quedó sola.",
      tone: "ok",
    });
    setTimeout(nextRound, 1400);
  }, [progress, nextRound, handsOn, showsEquation, attempt]);

  /**
   * Un solo plato: la barra queda inclinada y la caja no cede. Ningún cartel
   * dice "mal"; la inclinación es el mensaje, y el estado se conserva para que
   * el jugador pase la llave por el plato que falta.
   */
  const tilted = useCallback(() => {
    // Aplicar la inversa de un solo lado es un error del catálogo, no un
    // descuido: se registra para que la remediación pueda pedirlo de vuelta.
    attempt(false, "inverse_applied_one_side");
    setMessage({ text: "La barra quedó inclinada. Falta el otro plato.", tone: "warn" });
  }, [attempt]);

  /** La llave equivocada no dice "mal": no entra, y el juego dice por qué. */
  const refuse = useCallback(
    (key: Key) => {
      // `near_value` no está en el catálogo de L y no debería estarlo: cambiar
      // el número no es una idea equivocada sobre la inversa, es puntería.
      attempt(false, key.lure && key.lure !== "near_value" ? key.lure : undefined);
      if (showsEquation) progress.value = withTiming(0, { duration: theme.motion.base });
      const inverso: Record<string, string> = {
        "+": "restar",
        "-": "sumar",
        "*": "dividir",
        "/": "multiplicar",
      };
      setMessage({
        text:
          key.lure === "near_value"
            ? `Esa llave tiene el número cambiado. La cerradura dice ${problem.lock.value}.`
            : `Esa llave no entra. Para deshacer ${OP_CHAR[problem.lock.op]}${problem.lock.value} hay que ${inverso[problem.lock.op]}.`,
        tone: "warn",
      });
    },
    [progress, problem, showsEquation, attempt],
  );

  /**
   * El gesto de la balanza mide *por dónde pasó* la llave, no cuánto se
   * arrastró: el desplazamiento vertical no puede distinguir un plato de dos, y
   * esa distinción es el contenido del nodo. Cada plato tiene su progreso y
   * ninguno retrocede, así que soltar a mitad de camino conserva el estado.
   */
  const makeBalanceGesture = useCallback(
    (
      key: Key,
      dx: ReturnType<typeof useSharedValue<number>>,
      dy: ReturnType<typeof useSharedValue<number>>,
      stuck: ReturnType<typeof useSharedValue<number>>,
    ) => {
      const lx = canvasBox.x + zones.leftX;
      const rx = canvasBox.x + zones.rightX;
      const zy = canvasBox.y + zones.y;
      const r = zones.radius;
      const correct = key.correct;
      return Gesture.Pan()
        .enabled(!solved)
        .onBegin(() => {
          reached.value = 0;
          runOnJS(setShownKeyId)(key.id);
        })
        .onChange((e) => {
          // Traslación total y no suma de deltas: el evento que activa el gesto
          // no llega a `onChange`, así que sumar deltas pierde ese tramo.
          dx.value = e.translationX;
          dy.value = e.translationY;
          const nl = nearness(e.absoluteX, e.absoluteY, lx, zy, r);
          const nr = nearness(e.absoluteX, e.absoluteY, rx, zy, r);
          reached.value = Math.max(reached.value, nl, nr);
          if (!correct) return;
          leftPan.value = Math.max(leftPan.value, nl);
          rightPan.value = Math.max(rightPan.value, nr);
        })
        .onEnd(() => {
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
          if (!correct) {
            if (reached.value > 0.35) {
              stuck.value = withSequence(
                withTiming(1, { duration: 90 }),
                withTiming(0, { duration: 160 }),
              );
              runOnJS(refuse)(key);
            }
            return;
          }
          const l = leftPan.value > 0.5;
          const rr = rightPan.value > 0.5;
          leftPan.value = withTiming(l ? 1 : 0, { duration: theme.motion.base });
          rightPan.value = withTiming(rr ? 1 : 0, { duration: theme.motion.base });
          if (l && rr) runOnJS(succeed)();
          else if (l || rr) runOnJS(tilted)();
        });
    },
    [canvasBox, zones, solved, leftPan, rightPan, reached, refuse, succeed, tilted],
  );

  /** En la superficie simbólica el gesto vuelve a ser un arrastre hacia el `=`. */
  const makeSymbolGesture = useCallback(
    (
      key: Key,
      dx: ReturnType<typeof useSharedValue<number>>,
      dy: ReturnType<typeof useSharedValue<number>>,
      stuck: ReturnType<typeof useSharedValue<number>>,
    ) =>
      Gesture.Pan()
        .enabled(!solved)
        .onBegin(() => {
          runOnJS(setShownKeyId)(key.id);
        })
        .onChange((e) => {
          dx.value = e.translationX;
          dy.value = e.translationY;
          progress.value = Math.max(0, Math.min(1, -dy.value / DRAG_RANGE));
          // La balanza que acompaña al nivel 4 se transforma en sincronía: la
          // ficha se aplica a los dos lados de una vez.
          leftPan.value = progress.value;
          rightPan.value = progress.value;
        })
        .onEnd(() => {
          const llego = progress.value > 0.6;
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
          if (llego && key.correct) {
            progress.value = withTiming(1, { duration: theme.motion.quick }, (ok) => {
              if (ok) runOnJS(succeed)();
            });
            leftPan.value = withTiming(1, { duration: theme.motion.quick });
            rightPan.value = withTiming(1, { duration: theme.motion.quick });
          } else if (llego) {
            stuck.value = withSequence(
              withTiming(1, { duration: 90 }),
              withTiming(0, { duration: 160 }),
            );
            leftPan.value = withTiming(0, { duration: theme.motion.base });
            rightPan.value = withTiming(0, { duration: theme.motion.base });
            runOnJS(refuse)(key);
          } else {
            progress.value = withTiming(0, { duration: theme.motion.base });
            leftPan.value = withTiming(0, { duration: theme.motion.base });
            rightPan.value = withTiming(0, { duration: theme.motion.base });
          }
        }),
    [solved, progress, leftPan, rightPan, refuse, succeed],
  );

  const makeGesture = handsOn ? makeBalanceGesture : makeSymbolGesture;

  const toggleGhost = useCallback(() => {
    setGhostOn((on) => {
      ghost.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [ghost]);

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>‹ Mapa</Text>
      </Pressable>

      <Header
        title={`Cofres y llaves · nivel ${level.n} de ${TOTAL_LEVELS}`}
        subtitle={LEVEL_SUBTITLE[level.n] ?? ""}
        round={round}
        rounds={level.rounds}
      />

      <View
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          setCanvasBox((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
        }}
      >
        <Canvas style={{ width, height: sceneH }}>
          {showsBalance ? (
            <BalanceScene
              problem={problem}
              unknownLeft={!level.params.unknownRight}
              style={level.layer === "concrete" ? "concrete" : "visual"}
              width={width}
              height={balanceH}
              left={leftPan}
              right={rightPan}
              appear={ghost}
            />
          ) : null}
          {showsEquation ? (
            <Group transform={[{ translateX: width / 2 }, { translateY: equationY }]}>
              <MorphView plan={plan} progress={progress} ease={smooth} fontSize={FONT_SIZE} />
            </Group>
          ) : null}
        </Canvas>
      </View>

      <Hint text={message.text} tone={message.tone} />

      <View style={styles.ringWrap}>
        <KeyRing>
          {problem.keys.map((k) => (
            <KeyCell
              key={k.id}
              item={k}
              labeled={level.labeledKeys}
              solved={solved}
              make={makeGesture}
            />
          ))}
        </KeyRing>
      </View>

      {level.balance === "onDemand" ? (
        <Pressable onPress={toggleGhost} style={styles.ghostBtn} hitSlop={theme.hitSlop}>
          <Text style={styles.ghostLabel}>{ghostOn ? "ocultar balanza" : "ver balanza"}</Text>
        </Pressable>
      ) : level.balance === "hidden" ? (
        // Sin balanza queda la regla, que es lo que sobrevive al andamio.
        <Text style={styles.balance}>La misma regla, sin balanza que la sostenga.</Text>
      ) : (
        <Text style={styles.balance}>
          {handsOn
            ? "Una llave, los dos platos."
            : "Lo que hagas de un lado, hacelo del otro."}
        </Text>
      )}
    </View>
  );
}

const OPENING_HINT = "Pasá la llave por los dos platos, sin soltar.";

/** Cada llave necesita sus propios valores compartidos, así que vive en su componente. */
function KeyCell({
  item,
  labeled,
  solved,
  make,
}: {
  readonly item: Key;
  readonly labeled: boolean;
  readonly solved: boolean;
  readonly make: (
    k: Key,
    dx: ReturnType<typeof useSharedValue<number>>,
    dy: ReturnType<typeof useSharedValue<number>>,
    stuck: ReturnType<typeof useSharedValue<number>>,
  ) => ReturnType<typeof Gesture.Pan>;
}) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const stuck = useSharedValue(0);
  const gesture = useMemo(() => make(item, dx, dy, stuck), [item, make, dx, dy, stuck]);
  return (
    <KeyView item={item} labeled={labeled} dx={dx} dy={dy} stuck={stuck} gesture={gesture} dimmed={solved} />
  );
}

const LEVEL_SUBTITLE: Record<number, string> = {
  1: "Una llave, dos platos",
  2: "Cuatro cerraduras",
  3: "Barras y flechas",
  4: "Fichas al lado",
  5: "Balanza fantasma",
  6: "Números difíciles",
  7: "La caja a la derecha",
  8: "Cerraduras que nunca viste",
};

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
  ringWrap: { marginTop: theme.space[1] },
  balance: { color: theme.color.inkFaint, fontSize: 12, marginTop: theme.space[2] },
  ghostBtn: { marginTop: theme.space[2] },
  ghostLabel: { color: theme.color.inkDim, fontSize: 12 },
});
