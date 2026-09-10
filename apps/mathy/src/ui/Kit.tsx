/**
 * Las piezas que se repiten entre la tarjeta de entrada, la guía y la tarjeta
 * de cierre: un botón que se ve desde lejos, uno que acompaña, y el velo que
 * sostiene una tarjeta encima de la actividad sin desmontarla.
 *
 * El botón principal es dorado porque dorado es el color de lo aprendido (N
 * §2.2): el botón que sigue es el que lleva a la próxima llave. Tiene un canto
 * inferior más oscuro, que es profundidad por luminancia y no por sombra, y al
 * apretarlo se hunde: un botón de juego tiene que sentirse como un botón.
 */
import { useEffect, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "./theme.ts";

export function PrimaryButton({
  label,
  onPress,
}: {
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.primaryWrap}>
      {({ pressed }) => (
        <View style={[styles.primaryEdge, pressed && styles.primaryEdgePressed]}>
          <View style={[styles.primary, pressed && styles.primaryPressed]}>
            <View style={styles.primaryShine} />
            <Text style={styles.primaryLabel}>{label}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  small = false,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.ghost, small && styles.ghostSmall, pressed && styles.pressed]}
    >
      <Text style={[styles.ghostLabel, small && styles.ghostLabelSmall]}>{label}</Text>
    </Pressable>
  );
}

/**
 * La cara de una ficha que se agarra o se elige: un número, una operación, una
 * respuesta. Es un objeto y no un botón de interfaz, así que tiene canto abajo
 * (profundidad por luminancia, como el botón principal) y el borde de arriba más
 * claro, como si la luz le diera desde arriba. La ficha es neutra: el color con
 * trabajo es el de lo que lleva adentro. Se esparce dentro del estilo de cada
 * actividad, que pone sus medidas.
 */
export const chipTone = {
  top: "#2c4a72",
  face: "#22395a",
  low: "#1c3050",
  edge: "#0a1422",
  rim: "rgba(255, 255, 255, 0.12)",
  rimTop: "rgba(255, 255, 255, 0.24)",
} as const;

export const chipFace: ViewStyle = {
  backgroundColor: chipTone.face,
  borderWidth: 1,
  borderColor: chipTone.rim,
  borderTopColor: chipTone.rimTop,
  borderBottomWidth: 4,
  borderBottomColor: chipTone.edge,
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
};

/** Un interruptor de herramienta (mostrar números, la cuadrícula): vidrio, como el botón fantasma. */
export const toggleFace: ViewStyle = {
  borderWidth: 1,
  borderColor: theme.color.glassLine,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
};

export function Eyebrow({
  children,
  tone = "dim",
}: {
  readonly children: ReactNode;
  readonly tone?: "dim" | "ok" | "accent" | "gold";
}) {
  const color =
    tone === "ok"
      ? theme.color.ok
      : tone === "accent"
        ? theme.color.accent
        : tone === "gold"
          ? theme.color.gold
          : theme.color.inkFaint;
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function Section({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

/**
 * El velo con su tarjeta. Cubre el lienzo pero no lo desmonta: detrás sigue la
 * escena en el estado en que quedó, que es lo que el jugador acaba de hacer.
 * `top` es lo que asoma por arriba del borde de la tarjeta: Lumi.
 */
export function Overlay({ children, top }: { readonly children: ReactNode; readonly top?: ReactNode }) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = withTiming(1, { duration: theme.motion.base + 80, easing: Easing.out(Easing.back(1.2)) });
  }, [k]);
  const veil = useAnimatedStyle(() => ({ opacity: Math.min(1, k.value) }));
  const card = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.value * 1.4),
    transform: [{ translateY: (1 - k.value) * 36 }, { scale: 0.94 + 0.06 * k.value }],
  }));
  return (
    <Animated.View style={[styles.veil, veil]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.cardWrap, card]}>
          {top ? <View style={styles.top}>{top}</View> : null}
          <View style={[styles.card, top ? styles.cardWithTop : null]}>{children}</View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryWrap: { alignSelf: "stretch" },
  primaryEdge: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.goldDeep,
    paddingBottom: 5,
    shadowColor: theme.color.gold,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryEdgePressed: { paddingBottom: 1, marginTop: 4 },
  primary: {
    minHeight: 56,
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.gold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  primaryPressed: { backgroundColor: "#ffc84a" },
  primaryShine: {
    position: "absolute",
    top: 4,
    left: 18,
    right: 18,
    height: 14,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  primaryLabel: { color: "#3a2200", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
  ghost: {
    minHeight: 44,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostSmall: { minHeight: 32, paddingHorizontal: theme.space[2] },
  ghostLabel: { color: theme.color.ink, fontSize: 14, fontWeight: "500" },
  ghostLabelSmall: { fontSize: 12, color: theme.color.inkDim },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  eyebrow: { fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "600" },
  section: { gap: theme.space[1] },
  sectionLabel: {
    color: theme.color.inkFaint,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  veil: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.color.veil,
    zIndex: 10,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[4],
    paddingTop: theme.space[6],
  },
  cardWrap: { width: "100%", maxWidth: 560, alignItems: "center" },
  top: { marginBottom: -46, zIndex: 2 },
  card: {
    width: "100%",
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    borderTopColor: "rgba(255, 209, 102, 0.35)",
    padding: theme.space[5],
    gap: theme.space[4],
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
  },
  cardWithTop: { paddingTop: theme.space[6] + 8 },
});
