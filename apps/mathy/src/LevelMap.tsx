/**
 * El sendero de un concepto.
 *
 * Los niveles son piedras de un camino que atraviesa el lugar del área. Una
 * piedra pisada queda iluminada, la siguiente late con Lumi al lado, y las que
 * faltan están apagadas, sin cartel: no se explica un candado, se ve el camino.
 * La regla dura del diseño es que no se saltan prerequisitos, así que el
 * sendero no ofrece atajo.
 *
 * Al costado de cada piedra está la llave que deja: la silueta mientras falta y
 * su nombre cuando se ganó. Es lo que le da sentido a pisar la siguiente, sin
 * inventar un premio que no sea la idea misma.
 */
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { LevelBase, NodeSpec } from "@mathy/mechanics";
import { t, tf } from "./i18n.ts";
import { nodeLesson } from "./lessons/index.ts";
import { KeyGlyph } from "./ui/KeyGlyph.tsx";
import { Lumi } from "./ui/Lumi.tsx";
import { World } from "./ui/World.tsx";
import { AREAS, areaOf, theme } from "./ui/theme.ts";

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
  const lesson = nodeLesson(node.id);
  const area = areaOf(node.id);
  const hue = AREAS[area].hue;
  const done = Math.min(unlocked - 1, node.levels.length);

  return (
    <View style={styles.root}>
      <World area={area} calm={0.5} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Pressable onPress={onExit} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Text style={styles.backLabel}>‹ {t("ui.map.concepts")}</Text>
          </Pressable>
          <Text style={[styles.area, { color: hue }]}>{t(`area.${area}`)}</Text>
          <Text style={styles.title}>{t(`node.${node.id}.name`)}</Text>
          <Text style={styles.sub}>{t(`node.${node.id}.tagline`)}</Text>
          {lesson ? (
            <View style={styles.keys}>
              {lesson.levels.map((l) => (
                <KeyGlyph key={l.level} name={l.key.glyph} locked={l.level > done} size={30} />
              ))}
              <Text style={styles.keysLabel}>{tf("ui.levels.keys", { k: done, n: lesson.levels.length })}</Text>
            </View>
          ) : (
            <Text style={styles.keysLabel}>{tf("ui.levels.walked", { k: done, n: node.levels.length })}</Text>
          )}
        </View>

        <View style={styles.trail}>
          {node.levels.map((l, i) => {
            const open = l.n <= unlocked;
            const passed = l.n < unlocked;
            const next = l.n === unlocked;
            const ll = lesson?.levels.find((x) => x.level === l.n);
            // El sendero serpentea: cada piedra se corre un poco hacia un lado.
            const sway = Math.sin(i * 1.15) * 56;
            return (
              <View key={l.n} style={styles.stepWrap}>
                {i > 0 ? <Dots lit={open} sway={sway} /> : null}
                <Pressable
                  disabled={!open}
                  onPress={() => onPick(l)}
                  style={({ pressed }) => [styles.step, { transform: [{ translateX: sway }] }, pressed && styles.pressed]}
                >
                  <Stone n={l.n} passed={passed} next={next} open={open} hue={hue} />
                  <View style={[styles.card, next && styles.cardNext, !open && styles.cardLocked]}>
                    <Text style={[styles.cardTitle, !open && styles.dim]}>{t(l.titleKey)}</Text>
                    <Text style={styles.cardMeta}>
                      {t(`layer.${l.layer}`)} · {tf("ui.levels.rounds", { n: l.rounds })}
                    </Text>
                    {ll ? (
                      <View style={styles.keyRow}>
                        <KeyGlyph name={ll.key.glyph} locked={!passed} size={24} />
                        <Text style={[styles.keyLabel, passed && styles.keyLabelOn]}>
                          {passed ? t(ll.key.titleKey) : t("ui.key.locked")}
                        </Text>
                      </View>
                    ) : null}
                    {next ? (
                      <View style={styles.play}>
                        <Text style={styles.playLabel}>{t("ui.levels.play")} ›</Text>
                      </View>
                    ) : null}
                  </View>
                  {next ? (
                    <View style={styles.lumi}>
                      <Lumi pose="point" size={64} />
                    </View>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/** Una piedra del sendero: pisada, siguiente o por venir. */
function Stone({
  n,
  passed,
  next,
  open,
  hue,
}: {
  readonly n: number;
  readonly passed: boolean;
  readonly next: boolean;
  readonly open: boolean;
  readonly hue: string;
}) {
  const k = useSharedValue(0);
  useEffect(() => {
    if (!next) return;
    k.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(k);
  }, [k, next]);
  const halo = useAnimatedStyle(() => ({ opacity: next ? 0.25 + 0.5 * k.value : 0, transform: [{ scale: 1 + 0.18 * k.value }] }));
  return (
    <View style={styles.stoneWrap}>
      <Animated.View style={[styles.halo, halo]} />
      <View
        style={[
          styles.stone,
          passed && { backgroundColor: theme.color.ok, borderColor: "#2aa878" },
          next && { backgroundColor: theme.color.gold, borderColor: theme.color.goldDeep },
          !open && styles.stoneLocked,
          open && !passed && !next && { borderColor: hue },
        ]}
      >
        <Text style={[styles.stoneN, (passed || next) && styles.stoneNDark]}>{passed ? "✓" : n}</Text>
      </View>
    </View>
  );
}

/** Tres puntos entre piedra y piedra: el camino, encendido si ya se puede pisar. */
function Dots({ lit, sway }: { readonly lit: boolean; readonly sway: number }) {
  return (
    <View style={[styles.dots, { transform: [{ translateX: sway * 0.6 }] }]}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, lit && styles.dotLit]} />
      ))}
    </View>
  );
}

const STONE = 66;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bgDeep },
  scroll: { paddingTop: 20, paddingBottom: theme.space[7], alignItems: "center" },
  head: { width: "100%", maxWidth: 640, paddingHorizontal: theme.space[4], gap: 6, marginBottom: theme.space[4] },
  back: {
    alignSelf: "flex-start",
    minHeight: 40,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    backgroundColor: theme.color.glass,
    justifyContent: "center",
    marginBottom: theme.space[2],
  },
  backLabel: { color: theme.color.ink, fontSize: 14, fontWeight: "500" },
  pressed: { opacity: 0.8 },
  area: { fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "700" },
  title: { color: theme.color.ink, fontSize: 32, fontWeight: "800", letterSpacing: 0.2 },
  sub: { color: theme.color.inkDim, fontSize: 15 },
  keys: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: theme.space[1] },
  keysLabel: { color: theme.color.inkDim, fontSize: 13, marginLeft: 6 },
  trail: { width: "100%", maxWidth: 640, alignItems: "center", paddingHorizontal: theme.space[3] },
  stepWrap: { alignItems: "center", width: "100%" },
  step: { flexDirection: "row", alignItems: "center", gap: theme.space[3], width: "100%", maxWidth: 470 },
  stoneWrap: { width: STONE, height: STONE, alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: STONE + 18,
    height: STONE + 18,
    borderRadius: 99,
    backgroundColor: theme.color.gold,
  },
  stone: {
    width: STONE,
    height: STONE,
    borderRadius: STONE / 2,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stoneLocked: { opacity: 0.45 },
  stoneN: { color: theme.color.ink, fontSize: 24, fontWeight: "800" },
  stoneNDark: { color: "#1b2233" },
  card: {
    flex: 1,
    backgroundColor: theme.color.glass,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    padding: theme.space[3],
    gap: 4,
  },
  cardNext: { borderColor: "rgba(255, 209, 102, 0.6)" },
  cardLocked: { opacity: 0.55 },
  cardTitle: { color: theme.color.ink, fontSize: 17, fontWeight: "700" },
  cardMeta: { color: theme.color.inkFaint, fontSize: 12 },
  keyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  keyLabel: { color: theme.color.inkFaint, fontSize: 13 },
  keyLabelOn: { color: theme.color.gold },
  play: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: theme.space[3],
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.gold,
    borderBottomWidth: 3,
    borderBottomColor: theme.color.goldDeep,
  },
  playLabel: { color: "#3a2200", fontSize: 15, fontWeight: "800" },
  lumi: { position: "absolute", right: -34, top: -30 },
  dots: { gap: 6, paddingVertical: 8, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)" },
  dotLit: { backgroundColor: theme.color.gold },
  dim: { color: theme.color.inkDim },
});
