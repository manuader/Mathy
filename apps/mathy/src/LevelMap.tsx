/**
 * El mapa.
 *
 * El progreso se ve como territorio que se ilumina, no como puntos. Un nivel
 * bloqueado no se explica: se ve apagado, y el de al lado late. La regla dura
 * del diseño es que no se saltan prerequisitos, así que el mapa no ofrece un
 * atajo aunque el jugador lo quiera.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { LevelBase, NodeSpec } from "@mathy/mechanics";
import { t } from "./i18n.ts";
import { theme } from "./ui/theme.ts";

export function LevelMap({
  node,
  unlocked,
  onPick,
  onExit,
}: {
  readonly node: NodeSpec;
  readonly unlocked: number;
  readonly onPick: (level: LevelBase) => void;
  readonly onExit: () => void;
}) {
  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("map.back")}</Text>
      </Pressable>
      <View style={styles.head}>
        <Text style={styles.title}>{t(`node.${node.id}.name`)}</Text>
        <Text style={styles.sub}>
          {t(`node.${node.id}.tagline`)}. {unlocked - 1} de {node.levels.length} {t("map.progress")}.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {node.levels.map((l) => {
          const open = l.n <= unlocked;
          const done = l.n < unlocked;
          const next = l.n === unlocked;
          return (
            <Pressable
              key={l.n}
              disabled={!open}
              onPress={() => onPick(l)}
              style={[styles.card, done && styles.cardDone, next && styles.cardNext, !open && styles.cardLocked]}
            >
              <View style={styles.cardRow}>
                <Text style={[styles.n, !open && styles.dim]}>{l.n}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, !open && styles.dim]}>{t(l.titleKey)}</Text>
                  <Text style={[styles.cardMeta, !open && styles.dim]}>
                    {t(`layer.${l.layer}`)} · {l.rounds} problemas
                  </Text>
                </View>
                {done ? <Text style={styles.check}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg, paddingTop: 64 },
  back: { position: "absolute", top: 24, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  head: { paddingHorizontal: theme.space[4], marginBottom: theme.space[4] },
  title: { color: theme.color.ink, fontSize: 24, letterSpacing: 0.2 },
  sub: { color: theme.color.inkFaint, fontSize: 13, marginTop: 4 },
  list: { paddingHorizontal: theme.space[4], paddingBottom: theme.space[6], gap: theme.space[2] },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.line,
    padding: theme.space[3],
  },
  cardDone: { borderColor: "#2c4a63" },
  cardNext: { borderColor: theme.color.accent },
  cardLocked: { opacity: 0.4 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: theme.space[3] },
  cardText: { flex: 1 },
  n: { color: theme.color.inkDim, fontSize: 18, width: 24, textAlign: "center", fontVariant: ["tabular-nums"] },
  cardTitle: { color: theme.color.ink, fontSize: 16 },
  cardMeta: { color: theme.color.inkFaint, fontSize: 12, marginTop: 2 },
  check: { color: theme.color.accent, fontSize: 16 },
  dim: { color: theme.color.inkFaint },
});
