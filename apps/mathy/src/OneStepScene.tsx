/**
 * La prueba vertical del hito M0.
 *
 * Es el nodo de calibración del diseño, `alg.eq.one_step`: una ecuación de un
 * paso donde el jugador arrastra la llave sobre el igual y la ecuación se
 * despeja. Lo que se prueba acá no es el minijuego sino el motor: que los
 * términos conserven identidad a través del paso, que el morph vaya atado al
 * dedo y no a un temporizador, y que todo eso corra igual en las tres
 * plataformas.
 */

import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { applyBothSides, equation, num, op, sym, equationToText, type Equation } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { layoutEquation, centered, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, smooth } from "@mathy/viz-core";
import { MorphView } from "@mathy/viz-skia";


const FONT_SIZE = 56;
/** Cuánto hay que arrastrar la llave para completar el paso. */
const DRAG_RANGE = 160;

const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

const initial = (): Equation =>
  equation(op("+", [sym("x", "X"), num(5, "FIVE")], "SUM"), num(12, "TWELVE"), "EQ");

export function OneStepScene() {
  const { width, height } = useWindowDimensions();
  const [eq, setEq] = useState<Equation>(initial);
  const [solved, setSolved] = useState(false);

  // El paso se calcula una vez, al montar el estado, no en cada cuadro.
  const { plan, nextEq } = useMemo(() => {
    const step = applyBothSides(eq, "-", 5, "x");
    const before = centered(layoutEquation(eq, metrics));
    const after = centered(layoutEquation(step.next, metrics));
    return { plan: planMorph(before, after, step.trace), nextEq: step.next };
  }, [eq]);

  const progress = useSharedValue(0);
  const keyX = useSharedValue(0);
  const keyY = useSharedValue(0);


  const commit = useCallback(() => {
    setEq(nextEq);
    setSolved(true);
    // Al confirmar, el estado nuevo pasa a ser el punto de partida de otro plan.
    // Sin devolver el progreso a cero se dibujaría ese plan ya terminado, que es
    // un paso que el jugador nunca dio.
    progress.value = 0;
    keyX.value = 0;
    keyY.value = 0;
  }, [nextEq, progress, keyX, keyY]);

  const reset = useCallback(() => {
    setEq(initial());
    setSolved(false);
    progress.value = 0;
    keyX.value = 0;
    keyY.value = 0;
  }, [progress, keyX, keyY]);

  const pan = Gesture.Pan()
    .enabled(!solved)
    .onChange((e) => {
      keyX.value += e.changeX;
      keyY.value += e.changeY;
      // El progreso del morph es el arrastre. Sin temporizador: el jugador
      // puede ir y volver, y la ecuación lo sigue.
      progress.value = Math.max(0, Math.min(1, -keyY.value / DRAG_RANGE));
    })
    .onEnd(() => {
      if (progress.value > 0.6) {
        progress.value = withTiming(1, { duration: 220 }, (done) => {
          if (done) runOnJS(commit)();
        });
      } else {
        progress.value = withTiming(0, { duration: 220 });
        keyX.value = withTiming(0);
        keyY.value = withTiming(0);
      }
    });

  const keyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: keyX.value }, { translateY: keyY.value }],
  }));

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Ecuaciones de un paso</Text>
      <Text style={styles.hint}>
        {solved ? "La x quedó sola." : "Arrastrá la llave hacia arriba, sobre el igual."}
      </Text>

      <Canvas style={{ width, height: height * 0.4 }}>
        <Group transform={[{ translateX: width / 2 }, { translateY: height * 0.2 }]}>
          <MorphView plan={plan} progress={progress} ease={smooth} fontSize={FONT_SIZE} />
        </Group>
      </Canvas>

      {solved ? (
        <Text style={styles.solved} onPress={reset}>
          {equationToText(eq)}   ·   tocá para volver a empezar
        </Text>
      ) : (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.key, keyStyle]}>
            <Text style={styles.keyLabel}>−5</Text>
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b0d10", alignItems: "center", justifyContent: "center" },
  title: { color: "#e8eaed", fontSize: 15, letterSpacing: 0.4, opacity: 0.55 },
  hint: { color: "#e8eaed", fontSize: 13, opacity: 0.35, marginTop: 6 },
  solved: { color: "#8ab4f8", fontSize: 15, marginTop: 8 },
  key: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#1c2027",
    borderWidth: 1,
    borderColor: "#2f353f",
    alignItems: "center",
    justifyContent: "center",
  },
  keyLabel: { color: "#e8eaed", fontSize: 26 },
});
