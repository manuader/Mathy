/**
 * El mapa de conceptos.
 *
 * Es el primer nivel de navegación: los nodos de la espina en el orden en que
 * el diseño los enseña. Un nodo cerrado no se explica con un cartel, se ve
 * apagado; y no hay atajo, porque saltarse un prerequisito es exactamente lo
 * que el curriculum no permite.
 *
 * El progreso se muestra como territorio recorrido y nunca como puntos: cuántas
 * capas del nodo quedaron atrás, no cuánto "vale" el jugador.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { isNodeOpen, playableNodes, type NodeSpec } from "@mathy/mechanics";
import { t } from "./i18n.ts";
import { theme } from "./ui/theme.ts";

export function NodeMap({
  levelsDone,
  onPick,
}: {
  readonly levelsDone: Readonly<Record<string, number>>;
  readonly onPick: (node: NodeSpec) => void;
}) {
  const nodes = playableNodes();
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.title}>{t("app.name")}</Text>
        <Text style={styles.sub}>{t("app.tagline")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {nodes.map((node) => {
          const done = levelsDone[node.id] ?? 0;
          const open = isNodeOpen(node.id, levelsDone);
          const complete = done >= node.levels.length;
          return (
            <Pressable
              key={node.id}
              disabled={!open}
              onPress={() => onPick(node)}
              style={[
                styles.card,
                complete && styles.cardDone,
                open && !complete && styles.cardNext,
                !open && styles.cardLocked,
              ]}
            >
              <Text style={[styles.name, !open && styles.dim]}>{t(`node.${node.id}.name`)}</Text>
              <Text style={[styles.tagline, !open && styles.dim]}>{t(`node.${node.id}.tagline`)}</Text>
              <Progress done={done} total={node.levels.length} open={open} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Las capas recorridas, una marca por nivel. Sin números ni porcentajes. */
function Progress({ done, total, open }: { readonly done: number; readonly total: number; readonly open: boolean }) {
  return (
    <View style={styles.bar}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.seg, i < done && open && styles.segDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg, paddingTop: 64 },
  head: { paddingHorizontal: theme.space[4], marginBottom: theme.space[4] },
  title: { color: theme.color.ink, fontSize: 28, letterSpacing: 0.2 },
  sub: { color: theme.color.inkFaint, fontSize: 13, marginTop: 6, maxWidth: 460 },
  list: { paddingHorizontal: theme.space[4], paddingBottom: theme.space[6], gap: theme.space[2] },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.line,
    padding: theme.space[3],
    gap: theme.space[1],
  },
  cardDone: { borderColor: "#2c4a63" },
  cardNext: { borderColor: theme.color.accent },
  cardLocked: { opacity: 0.4 },
  name: { color: theme.color.ink, fontSize: 18 },
  tagline: { color: theme.color.inkDim, fontSize: 13 },
  bar: { flexDirection: "row", gap: 3, marginTop: theme.space[1] },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: theme.color.line },
  segDone: { backgroundColor: theme.color.accent },
  dim: { color: theme.color.inkFaint },
});
