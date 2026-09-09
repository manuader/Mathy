/**
 * El mapa.
 *
 * El progreso se ve como territorio que se ilumina, no como puntos. Un nivel
 * bloqueado no se explica: se ve apagado, y el de al lado late. La regla dura
 * del diseño es que no se saltan prerequisitos, así que el mapa no ofrece un
 * atajo aunque el jugador lo quiera.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LEVELS, type Level } from "@mathy/mechanics";
import { theme } from "./ui/theme.ts";

const SUBTITLE: Record<number, string> = {
  1: "Una llave, dos platos",
  2: "Cuatro cerraduras",
  3: "Barras y flechas",
  4: "Fichas al lado",
  5: "Balanza fantasma",
  6: "Números difíciles",
  7: "La caja a la derecha",
  8: "Cerraduras que nunca viste",
};

const LAYER_LABEL: Record<string, string> = {
  concrete: "manipulación",
  visual: "representación",
  symbolic: "notación",
  formal: "definición",
  abstract: "abstracción",
};

export function LevelMap({
  unlocked,
  onPick,
}: {
  readonly unlocked: number;
  readonly onPick: (level: Level) => void;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.title}>Ecuaciones de un paso</Text>
        <Text style={styles.sub}>
          Una cerradura, una llave. {unlocked - 1} de {LEVELS.length} recorridos.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {LEVELS.map((l) => {
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
                  <Text style={[styles.cardTitle, !open && styles.dim]}>{SUBTITLE[l.n]}</Text>
                  <Text style={[styles.cardMeta, !open && styles.dim]}>
                    {LAYER_LABEL[l.layer]} · {l.rounds} problemas
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
