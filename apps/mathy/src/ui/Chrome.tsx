/**
 * El marco de la actividad: qué nivel es, cuánto falta y qué hay que hacer.
 *
 * Sin puntos, sin monedas, sin rachas. El progreso se ve como territorio que
 * se completa, y nada más.
 */
import { StyleSheet, Text, View } from "react-native";
import { theme } from "./theme.ts";

export function Header({
  title,
  subtitle,
  round,
  rounds,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly round: number;
  readonly rounds: number;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.dots}>
        {Array.from({ length: rounds }, (_, i) => (
          <View key={i} style={[styles.dot, i < round && styles.dotDone]} />
        ))}
      </View>
    </View>
  );
}

export function Hint({ text, tone = "dim" }: { readonly text: string; readonly tone?: "dim" | "ok" | "warn" }) {
  const color =
    tone === "ok" ? theme.color.ok : tone === "warn" ? theme.color.warn : theme.color.inkFaint;
  return <Text style={[styles.hint, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: theme.space[1] },
  title: { color: theme.color.ink, fontSize: 16, letterSpacing: 0.3 },
  subtitle: { color: theme.color.inkFaint, fontSize: 12 },
  dots: { flexDirection: "row", gap: 6, marginTop: theme.space[1] },
  dot: { width: 7, height: 7, borderRadius: theme.radius.full, backgroundColor: theme.color.line },
  dotDone: { backgroundColor: theme.color.accent },
  hint: { fontSize: 13, textAlign: "center", minHeight: 18 },
});
