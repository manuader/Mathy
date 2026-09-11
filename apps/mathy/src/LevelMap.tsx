/**
 * El sendero de un concepto.
 *
 * Los niveles son piedras de un camino que atraviesa el lugar del área. Al
 * entrar, las piedras aparecen de a una, en el orden en que se pisan. Una
 * piedra pisada queda en menta y guarda la llave que dejó; la siguiente es
 * dorada, late, y la luz del camino corre hacia ella con Lumi esperando al
 * lado; las que faltan están apagadas, sin cartel: no se explica un candado, se
 * ve el camino. Son los estados de N §2.2 (pisado menta, siguiente dorado, el
 * que falta apagado), no colores nuevos.
 *
 * La regla dura del diseño es que no se saltan prerequisitos, así que el
 * sendero no ofrece atajo.
 *
 * Al costado de cada piedra está la llave que deja: la silueta mientras falta y
 * su nombre cuando se ganó. Es lo que le da sentido a pisar la siguiente, sin
 * inventar un premio que no sea la idea misma.
 */
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import type { LevelBase, NodeSpec } from "@mathy/mechanics";
import { t, tf } from "./i18n.ts";
import { nodeLesson } from "./lessons/index.ts";
import { KeyGlyph } from "./ui/KeyGlyph.tsx";
import { Lumi } from "./ui/Lumi.tsx";
import { Hop, Invite, Rise } from "./ui/Motion.tsx";
import { play } from "./ui/sound.ts";
import { World } from "./ui/World.tsx";
import { AREAS, areaOf, theme } from "./ui/theme.ts";

/** Cuándo aparece la primera piedra y cuánto después cada una. */
const FIRST = 160;
const EACH = 110;
const appearAt = (i: number): number => FIRST + Math.min(i, 10) * EACH;

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
  const nextIndex = node.levels.findIndex((l) => l.n === unlocked);
  // Todo lo que señala la piedra que sigue espera a que el camino haya aparecido hasta ella.
  const ready = nextIndex >= 0 ? appearAt(nextIndex) + 280 : 0;

  // Si la piedra que sigue cae debajo del borde, el sendero baja solo hasta ella.
  const calm = useReducedMotion();
  const { height } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const trailY = useRef<number | null>(null);
  const nextY = useRef<number | null>(null);
  const scrolled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const tryScroll = (): void => {
    if (scrolled.current || trailY.current === null || nextY.current === null) return;
    scrolled.current = true;
    const y = trailY.current + nextY.current;
    if (y + STONE < height * 0.8) return;
    timer.current = setTimeout(
      () => scroll.current?.scrollTo({ y: Math.max(0, y - height * 0.35), animated: !calm }),
      calm ? 0 : ready,
    );
  };

  return (
    <View style={styles.root}>
      <World area={area} calm={0.5} />
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Rise from={12} style={styles.head}>
          <Pressable
            onPress={() => {
              play("tap");
              onExit();
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backLabel}>‹ {t("ui.map.concepts")}</Text>
          </Pressable>
          <Text style={[styles.area, { color: hue }]}>{t(`area.${area}`)}</Text>
          <Text style={styles.title}>{t(`node.${node.id}.name`)}</Text>
          <Text style={styles.sub}>{t(`node.${node.id}.tagline`)}</Text>
          {lesson ? (
            <View
              style={styles.keys}
              accessible
              accessibilityLabel={tf("ui.levels.keys", { k: done, n: lesson.levels.length })}
            >
              {lesson.levels.map((l) => (
                <KeyGlyph
                  key={l.level}
                  name={l.key.glyph}
                  locked={l.level > done}
                  gold={l.level <= done}
                  warm={l.level === unlocked}
                  size={30}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.keysLabel}>{tf("ui.levels.walked", { k: done, n: node.levels.length })}</Text>
          )}
        </Rise>

        <View
          style={styles.trail}
          onLayout={(e: LayoutChangeEvent) => {
            trailY.current = e.nativeEvent.layout.y;
            tryScroll();
          }}
        >
          {node.levels.map((l, i) => {
            const open = l.n <= unlocked;
            const passed = l.n < unlocked;
            const next = l.n === unlocked;
            const ll = lesson?.levels.find((x) => x.level === l.n);
            // El sendero serpentea: cada piedra se corre un poco hacia un lado.
            const sway = Math.sin(i * 1.15) * 56;
            return (
              // La vista que se mide es hija directa del sendero: su `y` es la del sendero.
              <View
                key={l.n}
                style={styles.stepWrap}
                onLayout={
                  next
                    ? (e: LayoutChangeEvent) => {
                        nextY.current = e.nativeEvent.layout.y;
                        tryScroll();
                      }
                    : undefined
                }
              >
                <Rise delay={appearAt(i)} from={26} style={styles.stepWrap}>
                  {i > 0 ? <Path mode={passed ? "walked" : next ? "next" : "ahead"} sway={sway} delay={ready} /> : null}
                  <Pressable
                    disabled={!open}
                    onPress={() => {
                      play("tap");
                      onPick(l);
                    }}
                    style={({ pressed }) => [styles.step, { transform: [{ translateX: sway }] }, pressed && styles.pressed]}
                  >
                    <Stone
                      n={l.n}
                      passed={passed}
                      next={next}
                      open={open}
                      hue={hue}
                      keyGlyph={passed ? ll?.key.glyph : undefined}
                    />
                    <View style={[styles.card, next && styles.cardNext, !open && styles.cardLocked]}>
                      <Text style={[styles.cardTitle, !open && styles.dim]}>{t(l.titleKey)}</Text>
                      <Text style={styles.cardMeta}>
                        {t(`layer.${l.layer}`)} · {tf("ui.levels.rounds", { n: l.rounds })}
                      </Text>
                      {ll ? (
                        <View style={styles.keyRow}>
                          {passed ? null : <KeyGlyph name={ll.key.glyph} locked warm={next} size={24} />}
                          <Text style={[styles.keyLabel, passed && styles.keyLabelOn]}>
                            {passed ? t(ll.key.titleKey) : t("ui.key.locked")}
                          </Text>
                        </View>
                      ) : null}
                      {next ? (
                        <Invite delay={ready + 400} strength={0.7} style={styles.playWrap}>
                          <View style={styles.play}>
                            <Text style={styles.playLabel}>{t("ui.levels.play")} ›</Text>
                          </View>
                        </Invite>
                      ) : null}
                    </View>
                    {next ? (
                      <View style={styles.lumi}>
                        <Rise delay={ready} from={14}>
                          <Hop trigger={l.n} delay={ready + 180} height={12}>
                            <Lumi pose="point" size={64} />
                          </Hop>
                        </Rise>
                      </View>
                    ) : null}
                  </Pressable>
                </Rise>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Una piedra del sendero: pisada (menta, con la llave que dejó encima),
 * siguiente (dorada, con un halo que late) o por venir (apagada).
 */
function Stone({
  n,
  passed,
  next,
  open,
  hue,
  keyGlyph,
}: {
  readonly n: number;
  readonly passed: boolean;
  readonly next: boolean;
  readonly open: boolean;
  readonly hue: string;
  readonly keyGlyph: Parameters<typeof KeyGlyph>[0]["name"] | undefined;
}) {
  const calm = useReducedMotion();
  const k = useSharedValue(0.5);
  useEffect(() => {
    if (!next || calm) return;
    k.value = 0;
    k.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(k);
  }, [k, next, calm]);
  const halo = useAnimatedStyle(() => ({
    opacity: next ? 0.25 + 0.5 * k.value : 0,
    transform: [{ scale: 1 + 0.18 * k.value }],
  }));
  return (
    <View style={styles.stoneWrap}>
      <Animated.View style={[styles.halo, halo]} />
      <View
        style={[
          styles.stone,
          passed && styles.stonePassed,
          next && styles.stoneNext,
          !open && styles.stoneLocked,
          open && !passed && !next && { borderColor: hue },
        ]}
      >
        <View style={styles.stoneShine} />
        <Text style={[styles.stoneN, (passed || next) && styles.stoneNDark]}>{n}</Text>
      </View>
      {keyGlyph ? (
        <View style={styles.badge}>
          <KeyGlyph name={keyGlyph} gold size={30} />
        </View>
      ) : null}
    </View>
  );
}

type PathMode = "walked" | "next" | "ahead";
const PATH_DOTS = 4;

/**
 * Los puntos entre piedra y piedra: el camino. Menta si ya se anduvo, apagado
 * si falta; y el tramo que llega a la piedra que sigue lleva una luz dorada que
 * corre hacia ella, una y otra vez: por acá se sigue.
 */
function Path({ mode, sway, delay }: { readonly mode: PathMode; readonly sway: number; readonly delay: number }) {
  const calm = useReducedMotion();
  const run = useSharedValue(0);
  useEffect(() => {
    if (mode !== "next" || calm) return;
    run.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1300, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(run);
  }, [mode, calm, delay, run]);
  return (
    <View style={[styles.dots, { transform: [{ translateX: sway * 0.6 }] }]}>
      {Array.from({ length: PATH_DOTS }, (_, j) => (
        <PathDot key={j} j={j} run={run} mode={mode} />
      ))}
    </View>
  );
}

function PathDot({ j, run, mode }: { readonly j: number; readonly run: SharedValue<number>; readonly mode: PathMode }) {
  const lit = mode === "next";
  const style = useAnimatedStyle(() => {
    if (!lit) return {};
    // La luz entra por arriba y sale por abajo, hacia la piedra.
    const at = run.value * (PATH_DOTS + 1.4) - 0.7;
    const b = Math.max(0, 1 - Math.abs(at - j) / 1.1);
    return { opacity: 0.3 + 0.7 * b, transform: [{ scale: 1 + 0.7 * b }] };
  });
  return <Animated.View style={[styles.dot, mode === "walked" && styles.dotWalked, lit && styles.dotNext, style]} />;
}

const STONE = 66;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bgDeep },
  scroll: { paddingTop: 20, paddingBottom: theme.space[7], alignItems: "center" },
  head: { width: "100%", maxWidth: 640, paddingHorizontal: theme.space[4], gap: 6, marginBottom: theme.space[4] },
  back: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    backgroundColor: theme.color.glass,
    justifyContent: "center",
    marginBottom: theme.space[2],
  },
  backLabel: { color: theme.color.ink, fontSize: 14, fontWeight: "500" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  area: { fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "700" },
  title: { color: theme.color.ink, fontSize: 32, fontWeight: "800", letterSpacing: 0.2 },
  sub: { color: theme.color.inkDim, fontSize: 15 },
  keys: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: theme.space[1], flexWrap: "wrap" },
  keysLabel: { color: theme.color.inkDim, fontSize: 13 },
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
    overflow: "hidden",
  },
  stonePassed: { backgroundColor: theme.color.ok, borderColor: "#2aa878" },
  stoneNext: { backgroundColor: theme.color.gold, borderColor: theme.color.goldDeep },
  stoneLocked: { opacity: 0.45 },
  // El brillo arriba a la izquierda: la piedra tiene volumen, como los objetos del tablero.
  stoneShine: {
    position: "absolute",
    top: 7,
    left: 12,
    width: 22,
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    transform: [{ rotate: "-20deg" }],
  },
  stoneN: { color: theme.color.ink, fontSize: 24, fontWeight: "800" },
  stoneNDark: { color: "#1b2233" },
  badge: { position: "absolute", right: -10, bottom: -8 },
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
  keyLabelOn: { color: theme.color.gold, fontWeight: "600" },
  playWrap: { alignSelf: "flex-start", marginTop: 6 },
  play: {
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
  dotWalked: { backgroundColor: theme.color.ok, opacity: 0.8 },
  dotNext: { backgroundColor: theme.color.gold },
  dim: { color: theme.color.inkDim },
});
