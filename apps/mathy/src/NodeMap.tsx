/**
 * El mapa de conceptos: el mundo de Mathy.
 *
 * Es el primer nivel de navegación: los nodos de la espina en el orden en que
 * el diseño los enseña, agrupados por el lugar del mundo donde viven. Un nodo
 * cerrado no se explica con un cartel, se ve apagado; y no hay atajo, porque
 * saltarse un prerequisito es exactamente lo que el curriculum no permite.
 *
 * El progreso se muestra como territorio recorrido y nunca como puntos. Un
 * concepto con lección muestra su llavero: una llave por nivel, dorada si se
 * ganó y en silueta si falta, así "cuántas llevo" se ve sin leer un número. El
 * que no tiene lección todavía muestra una marca por nivel.
 *
 * El primer concepto abierto sin terminar dice "Seguí acá" con una luz que
 * respira, y si queda fuera de la pantalla el mapa baja solo hasta él: es la
 * respuesta a "¿por dónde sigo?". Lumi y Tomi esperan arriba, juntos.
 */
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { isNodeOpen, playableNodes, type NodeSpec } from "@mathy/mechanics";
import { tomiArt } from "./art/index.ts";
import { t, tf } from "./i18n.ts";
import { nodeLesson } from "./lessons/index.ts";
import { KeyGlyph } from "./ui/KeyGlyph.tsx";
import { Lumi } from "./ui/Lumi.tsx";
import { Hop, Invite, Rise } from "./ui/Motion.tsx";
import { play } from "./ui/sound.ts";
import { Tomi } from "./ui/Tomi.tsx";
import { World } from "./ui/World.tsx";
import { AREAS, areaOf, theme, type Area } from "./ui/theme.ts";

/** El escalonado de las tarjetas: suave, y con techo para que las de abajo no esperen. */
const cardAt = (order: number): number => 140 + Math.min(order, 14) * 45;

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

  // Si "Seguí acá" queda debajo del borde, el mapa baja solo hasta ahí.
  const calm = useReducedMotion();
  const { height } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const groupY = useRef<Record<number, number>>({});
  const hereAt = useRef<{ readonly group: number; readonly y: number } | null>(null);
  const scrolled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const tryScroll = (): void => {
    const h = hereAt.current;
    if (scrolled.current || !h) return;
    const gy = groupY.current[h.group];
    if (gy === undefined) return;
    scrolled.current = true;
    const y = gy + h.y;
    if (y + 140 < height * 0.85) return;
    timer.current = setTimeout(
      () => scroll.current?.scrollTo({ y: Math.max(0, y - height * 0.3), animated: !calm }),
      calm ? 0 : 450,
    );
  };

  const duo = tomiArt("duo", "large") !== undefined;
  let order = 0;

  return (
    <View style={styles.root}>
      <World area="world" calm={0.45} />
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Rise from={12} style={styles.headText}>
            <Text style={styles.title}>{t("app.name")}</Text>
            <Text style={styles.sub}>{t("app.tagline")}</Text>
          </Rise>
          {duo ? (
            <Rise delay={120}>
              <Hop trigger="map" delay={420} height={10}>
                <Tomi pose="duo" size={132} />
              </Hop>
            </Rise>
          ) : (
            // Lumi enseña y Tomi da pistas: los dos esperan juntos, Tomi un poco atrás.
            <View style={styles.buddies}>
              <View style={styles.tomi}>
                <Rise delay={260}>
                  <Hop trigger="map" delay={620} height={9}>
                    <Tomi pose="hero" size={62} />
                  </Hop>
                </Rise>
              </View>
              <Rise delay={120}>
                <Hop trigger="map" delay={420} height={10}>
                  <Lumi pose="hero" size={104} />
                </Hop>
              </Rise>
            </View>
          )}
        </View>

        {groups.map((g, gi) => (
          <View
            key={`${g.area}${g.nodes[0]?.id}`}
            style={styles.group}
            onLayout={(e: LayoutChangeEvent) => {
              groupY.current[gi] = e.nativeEvent.layout.y;
              tryScroll();
            }}
          >
            <Rise delay={cardAt(order)} from={10} style={styles.groupHead}>
              <View style={[styles.groupDot, { backgroundColor: AREAS[g.area].hue }]} />
              <Text style={[styles.groupName, { color: AREAS[g.area].hue }]}>{t(`area.${g.area}`)}</Text>
            </Rise>
            {g.nodes.map((node) => {
              const isHere = node.id === here;
              const delay = cardAt(order++);
              return (
                <View
                  key={node.id}
                  onLayout={
                    isHere
                      ? (e: LayoutChangeEvent) => {
                          hereAt.current = { group: gi, y: e.nativeEvent.layout.y };
                          tryScroll();
                        }
                      : undefined
                  }
                >
                  <Rise delay={delay}>
                    <Concept
                      node={node}
                      done={levelsDone[node.id] ?? 0}
                      open={isNodeOpen(node.id, levelsDone)}
                      here={isHere}
                      onPick={onPick}
                      delay={delay}
                    />
                  </Rise>
                </View>
              );
            })}
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
  delay,
}: {
  readonly node: NodeSpec;
  readonly done: number;
  readonly open: boolean;
  readonly here: boolean;
  readonly onPick: (node: NodeSpec) => void;
  readonly delay: number;
}) {
  const hue = AREAS[areaOf(node.id)].hue;
  const complete = done >= node.levels.length;
  const lesson = nodeLesson(node.id);
  return (
    <Pressable
      disabled={!open}
      onPress={() => {
        play("tap");
        onPick(node);
      }}
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
            <Invite delay={delay + 500} strength={0.7}>
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>{t("ui.map.continue")} ›</Text>
              </View>
            </Invite>
          ) : null}
        </View>
        <Text style={[styles.tagline, !open && styles.dim]}>{t(`node.${node.id}.tagline`)}</Text>
        {lesson ? (
          // El llavero del concepto: las ganadas en dorado, la que sigue con un poco de luz.
          <View
            style={styles.keys}
            accessible
            accessibilityLabel={tf("ui.levels.keys", { k: Math.min(done, lesson.levels.length), n: lesson.levels.length })}
          >
            {lesson.levels.map((l) => (
              <KeyGlyph
                key={l.level}
                name={l.key.glyph}
                size={24}
                locked={l.level > done}
                gold={l.level <= done}
                warm={open && l.level === done + 1}
              />
            ))}
          </View>
        ) : (
          <View style={styles.bar}>
            {Array.from({ length: node.levels.length }, (_, i) => (
              <View key={i} style={[styles.seg, i < done && open && { backgroundColor: complete ? theme.color.ok : hue }]} />
            ))}
          </View>
        )}
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
  buddies: { width: 150, height: 110, alignItems: "flex-end", justifyContent: "flex-end" },
  tomi: { position: "absolute", left: 0, bottom: 0, zIndex: 1 },
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
  cardHere: {
    borderColor: "rgba(255, 209, 102, 0.75)",
    shadowColor: theme.color.gold,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  cardDone: { borderColor: "rgba(63, 224, 164, 0.35)" },
  cardLocked: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  stripe: { width: 6 },
  cardBody: { flex: 1, padding: theme.space[3], gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: theme.space[2] },
  name: { color: theme.color.ink, fontSize: 18, fontWeight: "700", flexShrink: 1 },
  tagline: { color: theme.color.inkDim, fontSize: 14 },
  keys: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: theme.space[1] },
  bar: { flexDirection: "row", gap: 4, marginTop: theme.space[1] },
  seg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.12)" },
  pill: {
    paddingHorizontal: theme.space[2],
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.gold,
    borderBottomWidth: 2,
    borderBottomColor: theme.color.goldDeep,
  },
  pillLabel: { color: "#3a2200", fontSize: 12, fontWeight: "800" },
  dim: { color: theme.color.inkFaint },
});
