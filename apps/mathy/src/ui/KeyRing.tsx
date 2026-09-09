/**
 * El llavero.
 *
 * Cada llave se arrastra. La correcta abre; las otras se traban, que es la
 * explicación de `wrong_inverse_choice`: la llave no entra, no es que el
 * jugador "se equivocó".
 */
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { Key } from "@mathy/mechanics";
import { theme } from "./theme.ts";

const OP_CHAR: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export interface KeyViewProps {
  readonly item: Key;
  readonly labeled: boolean;
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  readonly stuck: SharedValue<number>;
  readonly gesture: ReturnType<typeof Gesture.Pan>;
  readonly dimmed: boolean;
}

export function KeyView({ item, labeled, dx, dy, stuck, gesture, dimmed }: KeyViewProps) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value },
      { translateY: dy.value },
      // Cuando la llave no entra, gira un cuarto y se traba. No dice "mal".
      { rotate: `${stuck.value * 12}deg` },
    ],
  }));
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.key, dimmed && styles.dim, style]}>
        <Text style={styles.label}>
          {labeled ? `${OP_CHAR[item.op] ?? item.op}${item.value}` : (OP_CHAR[item.op] ?? item.op)}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

export function KeyRing({ children }: { readonly children: React.ReactNode }) {
  return <View style={styles.ring}>{children}</View>;
}

const styles = StyleSheet.create({
  ring: { flexDirection: "row", gap: theme.space[3], alignItems: "center", justifyContent: "center" },
  key: {
    minWidth: 72,
    height: 72,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: { opacity: 0.35 },
  label: { color: theme.color.ink, fontSize: 24, fontVariant: ["tabular-nums"] },
});
