/**
 * El mapa de conceptos: el mundo de Mathy.
 *
 * Es el primer nivel de navegación: los nodos de la espina en el orden en que
 * el diseño los enseña, agrupados por el lugar del mundo donde viven. Un nodo
 * cerrado no se explica con un cartel, se ve apagado; y no hay atajo, porque
 * saltarse un prerequisito es exactamente lo que el curriculum no permite.
 *
 * El progreso se muestra como territorio recorrido y nunca como puntos: una
 * marca por nivel, y las llaves ganadas. El primer concepto abierto sin
 * terminar tiene a Lumi al lado, que es la respuesta a "¿por dónde sigo?".
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { isNodeOpen, playableNodes, type NodeSpec } from "@mathy/mechanics";
import { t, tf } from "./i18n.ts";
import { nodeLesson } from "./lessons/index.ts";
import { Lumi } from "./ui/Lumi.tsx";
import { World } from "./ui/World.tsx";
import { AREAS, areaOf, theme, type Area } from "./ui/theme.ts";

export function NodeMap({
  levelsDone,
  onPick,
}: {
  readonly levelsDone: Readonly<Record<string, number>>;
  readonly onPick: (node: NodeSpec) => void;
}) {
  const nodes = playableNodes();
  // El primer concepto abierto y sin terminar: donde el jugador sigue.
  const here = nodes.find(
    (n) => isNodeOpen(n.id, levelsDone) && (levelsDone[n.id] ?? 0) < n.levels.length,
  )?.id;

  // Los nodos por lugar del mundo, en el orden en que la espina los recorre.
  const groups: { area: Area; nodes: NodeSpec[] }[] = [];
  for (const node of nodes) {
    const area = areaOf(node.id);
    const last = groups[groups.length - 1];
    if (last && last.area === area) last.nodes.push(node);
    else groups.push({ area, nodes: [node] });
  }

  return (
    <View style={styles.root}>
      <World area="world" calm={0.45} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={styles.title}>{t("app.name")}</Text>
            <Text style={styles.sub}>{t("app.tagline")}</Text>
          </View>
          <Lumi pose="hero" size={104} />
        </View>

        {groups.map((g) => (
          <View key={`${g.area}${g.nodes[0]?.id}`} style={styles.group}>
            <View style={styles.groupHead}>
              <View style={[styles.groupDot, { backgroundColor: AREAS[g.area].hue }]} />
              <Text style={[styles.groupName, { color: AREAS[g.area].hue }]}>{t(`area.${g.area}`)}</Text>
            </View>
            {g.nodes.map((node) => (
              <Concept
                key={node.id}
                node={node}
                done={levelsDone[node.id] ?? 0}
                open={isNodeOpen(node.id, levelsDone)}
                here={node.id === here}
                onPick={onPick}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Concept({
  node,
  done,
  open,
  here,
  onPick,
}: {
  readonly node: NodeSpec;
  readonly done: number;
  readonly open: boolean;
  readonly here: boolean;
  readonly onPick: (node: NodeSpec) => void;
}) {
  const hue = AREAS[areaOf(node.id)].hue;
  const complete = done >= node.levels.length;
  const lesson = nodeLesson(node.id);
  return (
    <Pressable
      disabled={!open}
      onPress={() => onPick(node)}
      style={({ pressed }) => [
        styles.card,
        here && styles.cardHere,
        complete && styles.cardDone,
        !open && styles.cardLocked,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: open ? hue : theme.color.line }]} />
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, !open && styles.dim]}>{t(`node.${node.id}.name`)}</Text>
          {here ? (
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>{t("ui.map.continue")}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.tagline, !open && styles.dim]}>{t(`node.${node.id}.tagline`)}</Text>
        <View style={styles.bar}>
          {Array.from({ length: node.levels.length }, (_, i) => (
            <View key={i} style={[styles.seg, i < done && open && { backgroundColor: complete ? theme.color.ok : hue }]} />
          ))}
        </View>
        {lesson && done > 0 ? (
          <Text style={styles.keys}>{tf("ui.levels.keys", { k: Math.min(done, lesson.levels.length), n: lesson.levels.length })}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bgDeep },
  scroll: { paddingTop: 36, paddingBottom: theme.space[7], paddingHorizontal: theme.space[4], alignItems: "center" },
  head: { width: "100%", maxWidth: 640, flexDirection: "row", alignItems: "center", marginBottom: theme.space[4] },
  headText: { flex: 1, gap: 6 },
  title: { color: theme.color.ink, fontSize: 40, fontWeight: "800", letterSpacing: 0.5 },
  sub: { color: theme.color.inkDim, fontSize: 15, maxWidth: 420 },
  group: { width: "100%", maxWidth: 640, gap: theme.space[2], marginBottom: theme.space[4] },
  groupHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupDot: { width: 10, height: 10, borderRadius: 5 },
  groupName: { fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "800" },
  card: {
    flexDirection: "row",
    backgroundColor: theme.color.glass,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    overflow: "hidden",
  },
  cardHere: { borderColor: "rgba(255, 209, 102, 0.7)" },
  cardDone: { borderColor: "rgba(63, 224, 164, 0.35)" },
  cardLocked: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  stripe: { width: 6 },
  cardBody: { flex: 1, padding: theme.space[3], gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: theme.space[2] },
  name: { color: theme.color.ink, fontSize: 18, fontWeight: "700", flexShrink: 1 },
  tagline: { color: theme.color.inkDim, fontSize: 14 },
  bar: { flexDirection: "row", gap: 4, marginTop: theme.space[1] },
  seg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.12)" },
  keys: { color: theme.color.gold, fontSize: 12, marginTop: 2 },
  pill: {
    paddingHorizontal: theme.space[2],
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.gold,
  },
  pillLabel: { color: "#3a2200", fontSize: 12, fontWeight: "800" },
  dim: { color: theme.color.inkFaint },
});
