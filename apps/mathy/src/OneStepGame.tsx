/**
 * Cofres y llaves: el minijuego de `alg.eq.one_step`.
 *
 * El jugador elige una llave del llavero y la arrastra sobre la ecuación. La
 * correcta abre y la ecuación se despeja; las otras se traban. Que haya llaves
 * equivocadas es lo que convierte "hacer la cuenta" en "elegir la operación",
 * que es la capacidad que este nodo desarrolla.
 *
 * El progreso del morph va atado al dedo, no a un temporizador: el jugador
 * puede ir y volver, y la ecuación lo acompaña.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withTiming, withSequence, runOnJS } from "react-native-reanimated";
import { applyBothSides, equationToText } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { centered, layoutEquation, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, smooth } from "@mathy/viz-core";
import { MorphView } from "@mathy/viz-skia";
import { LEVELS, TOTAL_LEVELS, generateOneStep, type Key, type Level } from "@mathy/mechanics";
import { KeyRing, KeyView } from "./ui/KeyRing.tsx";
import { Header, Hint } from "./ui/Chrome.tsx";
import { theme } from "./ui/theme.ts";

const FONT_SIZE = 52;
/** Cuánto hay que arrastrar para completar el paso. */
const DRAG_RANGE = 150;

const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

const OP_CHAR: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export interface OneStepGameProps {
  readonly level: Level;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
}

export function OneStepGame({ level, onLevelDone, onExit }: OneStepGameProps) {
  const { width, height } = useWindowDimensions();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>({
    text: "Arrastrá la llave que abre esta cerradura.",
    tone: "dim",
  });

  const problem = useMemo(
    () => generateOneStep(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const progress = useSharedValue(0);
  const activeKey = useRef<Key | null>(null);

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

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    progress.value = 0;
    setMessage({ text: "Arrastrá la llave que abre esta cerradura.", tone: "dim" });
  }, [round, level.rounds, onLevelDone, progress]);

  const succeed = useCallback(() => {
    setSolved(true);
    progress.value = 1;
    setMessage({ text: "La x quedó sola.", tone: "ok" });
    setTimeout(nextRound, 1100);
  }, [progress, nextRound]);

  /** La llave equivocada no dice "mal": no entra, y el juego dice por qué. */
  const refuse = useCallback((key: Key) => {
    progress.value = withTiming(0, { duration: theme.motion.base });
    const inverso: Record<string, string> = { "+": "restar", "-": "sumar", "*": "dividir", "/": "multiplicar" };
    setMessage({
      text:
        key.lure === "near_value"
          ? `Esa llave tiene el número cambiado. La cerradura dice ${problem.lock.value}.`
          : `Esa llave no entra. Para deshacer ${OP_CHAR[problem.lock.op]}${problem.lock.value} hay que ${inverso[problem.lock.op]}.`,
      tone: "warn",
    });
  }, [progress, problem]);

  const makeGesture = (key: Key, dx: ReturnType<typeof useSharedValue<number>>, dy: ReturnType<typeof useSharedValue<number>>, stuck: ReturnType<typeof useSharedValue<number>>) =>
    Gesture.Pan()
      .enabled(!solved)
      .onBegin(() => {
        runOnJS(setShownKeyId)(key.id);
        runOnJS(setActive)(key);
      })
      .onChange((e) => {
        dx.value += e.changeX;
        dy.value += e.changeY;
        progress.value = Math.max(0, Math.min(1, -dy.value / DRAG_RANGE));
      })
      .onEnd(() => {
        const llego = progress.value > 0.6;
        dx.value = withTiming(0, { duration: theme.motion.base });
        dy.value = withTiming(0, { duration: theme.motion.base });
        if (llego && key.correct) {
          progress.value = withTiming(1, { duration: theme.motion.quick }, (ok) => {
            if (ok) runOnJS(succeed)();
          });
        } else if (llego) {
          stuck.value = withSequence(
            withTiming(1, { duration: 90 }),
            withTiming(0, { duration: 160 }),
          );
          runOnJS(refuse)(key);
        } else {
          progress.value = withTiming(0, { duration: theme.motion.base });
        }
      });

  const setActive = (k: Key) => {
    activeKey.current = k;
  };

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

      <Canvas style={{ width, height: height * 0.3 }}>
        <Group transform={[{ translateX: width / 2 }, { translateY: height * 0.16 }]}>
          <MorphView plan={plan} progress={progress} ease={smooth} fontSize={FONT_SIZE} />
        </Group>
      </Canvas>

      <Hint text={message.text} tone={message.tone} />

      <View style={styles.ringWrap}>
        <KeyRing>
          {problem.keys.map((k) => (
            <KeyCell key={k.id} item={k} labeled={level.labeledKeys} solved={solved} make={makeGesture} />
          ))}
        </KeyRing>
      </View>

      {level.balance !== "hidden" ? (
        <Text style={styles.balance}>
          {problem.lock.op === "+" || problem.lock.op === "-"
            ? "Los dos platos tienen que quedar iguales."
            : "Lo que hagas de un lado, hacelo del otro."}
        </Text>
      ) : (
        <Text style={styles.balance}>{equationToText(problem.equation)}</Text>
      )}
    </View>
  );
}

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
  return <KeyView item={item} labeled={labeled} dx={dx} dy={dy} stuck={stuck} gesture={gesture} dimmed={solved} />;
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
  root: { flex: 1, backgroundColor: theme.color.bg, alignItems: "center", justifyContent: "center", gap: theme.space[3] },
  back: { position: "absolute", top: 48, left: 20 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  ringWrap: { marginTop: theme.space[2] },
  balance: { color: theme.color.inkFaint, fontSize: 12, marginTop: theme.space[3] },
});
