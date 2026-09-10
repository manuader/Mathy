/**
 * El encabezado de la actividad y la línea de lo que pasó.
 *
 * Sin puntos, sin monedas, sin rachas. El encabezado dice dónde está el jugador
 * (el concepto, con el tono de su área, y el nivel en grande) y cuánto le falta
 * al nivel, como territorio: una marca por nivel del concepto.
 *
 * La línea de lo que pasó cambia de color según lo que dice: menta si algo
 * coincidió, ámbar si algo pide que lo miren. Nunca rojo, porque no hay error
 * como categoría (N §2.2).
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { t, tf } from "../i18n.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import { AREAS, areaOf, theme } from "./theme.ts";

export function Header({
  title,
  subtitle,
  round,
  rounds,
  showDots = true,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly round: number;
  readonly rounds: number;
  /** Apagados cuando el cartel del objetivo ya lleva la ronda. */
  readonly showDots?: boolean;
}) {
  const lesson = useLesson();
  // Con el contexto del nivel, el encabezado se arma solo y es igual en los 21
  // nodos; sin él, muestra lo que la actividad le pasa.
  if (lesson) {
    const { node, level } = lesson;
    const hue = AREAS[areaOf(node.id)].hue;
    return (
      <View style={styles.header}>
        <Text style={[styles.node, { color: hue }]}>{t(`node.${node.id}.name`)}</Text>
        <Text style={styles.level}>{t(level.titleKey)}</Text>
        <View style={styles.levels}>
          {node.levels.map((l) => (
            <View
              key={l.n}
              style={[styles.levelSeg, l.n < level.n && styles.levelSegDone, l.n === level.n && { backgroundColor: hue }]}
            />
          ))}
          <Text style={styles.levelCount}>{tf("ui.header.level", { n: level.n, total: node.levels.length })}</Text>
        </View>
        {showDots ? <Rounds round={round} rounds={rounds} /> : null}
      </View>
    );
  }
  return (
    <View style={styles.header}>
      <Text style={styles.level}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {showDots ? <Rounds round={round} rounds={rounds} /> : null}
    </View>
  );
}

function Rounds({ round, rounds }: { readonly round: number; readonly rounds: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: rounds }, (_, i) => (
        <View key={i} style={[styles.dot, i < round && styles.dotDone, i === round && styles.dotNow]} />
      ))}
    </View>
  );
}

const TONE = {
  dim: { fg: theme.color.inkDim, bg: "transparent", line: "transparent" },
  ok: { fg: theme.color.ok, bg: "rgba(63, 224, 164, 0.12)", line: "rgba(63, 224, 164, 0.45)" },
  warn: { fg: theme.color.warn, bg: "rgba(255, 181, 71, 0.12)", line: "rgba(255, 181, 71, 0.45)" },
} as const;

/** Lo que pasó, como un aviso que entra con un pequeño salto cada vez que cambia. */
export function Hint({ text, tone = "dim" }: { readonly text: string; readonly tone?: "dim" | "ok" | "warn" }) {
  const k = useSharedValue(1);
  useEffect(() => {
    k.value = 0;
    k.value = withTiming(1, { duration: theme.motion.base, easing: Easing.out(Easing.back(2)) });
  }, [text, k]);
  const style = useAnimatedStyle(() => ({
    opacity: k.value,
    transform: [{ scale: 0.92 + 0.08 * k.value }, { translateY: (1 - k.value) * 6 }],
  }));
  const c = TONE[tone];
  return (
    <View style={styles.hintRow}>
      {text ? (
        <Animated.View style={[styles.hint, { backgroundColor: c.bg, borderColor: c.line }, style]}>
          {tone !== "dim" ? <View style={[styles.hintDot, { backgroundColor: c.fg }]} /> : null}
          <Text style={[styles.hintText, { color: tone === "dim" ? theme.color.inkDim : theme.color.ink }]}>{text}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: 4, paddingTop: 8 },
  node: { fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "700" },
  level: { color: theme.color.ink, fontSize: 24, fontWeight: "700", letterSpacing: 0.2, textAlign: "center" },
  subtitle: { color: theme.color.inkFaint, fontSize: 13 },
  levels: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  levelSeg: { width: 18, height: 5, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.14)" },
  levelSegDone: { backgroundColor: theme.color.ok },
  levelCount: { color: theme.color.inkFaint, fontSize: 12, marginLeft: 6 },
  dots: { flexDirection: "row", gap: 6, marginTop: theme.space[1] },
  dot: { width: 8, height: 8, borderRadius: theme.radius.full, backgroundColor: "rgba(255,255,255,0.16)" },
  dotDone: { backgroundColor: theme.color.ok },
  dotNow: { backgroundColor: theme.color.accent },
  hintRow: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 620,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  hintDot: { width: 8, height: 8, borderRadius: 4 },
  hintText: { fontSize: 15, lineHeight: 21, textAlign: "center", flexShrink: 1 },
});
