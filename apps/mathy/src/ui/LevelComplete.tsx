/**
 * La tarjeta de cierre de un nivel.
 *
 * El nivel no termina volviendo a una lista: termina diciendo qué pasó. Qué
 * idea se ganó, dónde quedó guardada, cuántas faltan del concepto, y qué viene,
 * con un solo botón grande para seguir. Es la respuesta a "¿lo cumplí?, ¿y
 * ahora?", que antes el jugador tenía que adivinar.
 *
 * Sin puntos, sin estrellas, sin "excelente". Lo que se celebra es la llave, que
 * es la idea misma, y que desde ahora se puede consultar.
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { t, tf } from "../i18n.ts";
import { lessonFor, nodeAfter, nodeLesson } from "../lessons/index.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import type { NodeLesson } from "../lessons/types.ts";
import { useProgress } from "../progress.tsx";
import { KeyCard, KeyGlyph } from "./KeyGlyph.tsx";
import { Lumi } from "./Lumi.tsx";
import { Eyebrow, GhostButton, Overlay, PrimaryButton, Section } from "./Kit.tsx";
import { theme } from "./theme.ts";

export function LevelComplete({ onOpenCheatsheet }: { readonly onOpenCheatsheet: (id?: string) => void }) {
  const api = useLesson();
  const { progress } = useProgress();

  // La llave entra un momento después que la tarjeta: primero se lee que el
  // nivel se superó, después aparece lo que se ganó.
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withDelay(
      280,
      withTiming(1, { duration: theme.motion.morph, easing: Easing.out(Easing.back(1.4)) }),
    );
  }, [pop]);
  const popStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ scale: 0.88 + 0.12 * pop.value }],
  }));

  if (!api) return null;
  const { node, level, lesson, nav } = api;

  const total = node.levels.length;
  const following = node.levels.find((l) => l.n === level.n + 1);
  const followingLesson = following ? lessonFor(node.id, following.n) : undefined;
  const whole = nodeLesson(node.id);
  const done = Math.max(progress.levelsDone[node.id] ?? 0, level.n);
  const after = following ? undefined : nodeAfter(node.id);
  const nodeName = t(`node.${node.id}.name`);
  const last = !following;

  return (
    <Overlay top={<Lumi pose={lesson ? "key" : "cheer"} size={128} />}>
      <View style={styles.head}>
        <Eyebrow tone="gold">
          {last ? t("ui.done.nodeEyebrow") : tf("ui.done.eyebrow", { n: level.n, total })}
        </Eyebrow>
        <Text style={styles.title}>{last ? nodeName : t(level.titleKey)}</Text>
        {last && whole ? <Text style={styles.lead}>{t(whole.learnedKey)}</Text> : null}
      </View>

      {lesson ? (
        <Section label={t("ui.done.learned")}>
          <Animated.View style={popStyle}>
            <Motes />
            <KeyCard
              glyph={lesson.key.glyph}
              title={t(lesson.key.titleKey)}
              body={t(lesson.key.bodyKey)}
              tag={t("ui.done.newKey")}
              highlight
            />
          </Animated.View>
          {whole ? (
            <View style={styles.progress}>
              <KeySlots lesson={whole} done={done} current={level.n} />
              <Text style={styles.caption}>
                {tf("ui.done.keys", { k: done, n: whole.levels.length, node: nodeName })}
              </Text>
            </View>
          ) : null}
        </Section>
      ) : null}

      {following ? (
        <View style={styles.teaser}>
          <Text style={styles.teaserLabel}>{t("ui.done.upNext")}</Text>
          <Text style={styles.teaserTitle}>
            {tf("ui.done.levelN", { n: following.n })} · {t(following.titleKey)}
          </Text>
          {followingLesson ? <Text style={styles.teaserBody}>{t(followingLesson.whyKey)}</Text> : null}
        </View>
      ) : after ? (
        <View style={styles.teaser}>
          <Text style={styles.teaserLabel}>{t("ui.done.upNextNode")}</Text>
          <Text style={styles.teaserTitle}>{t(`node.${after.id}.name`)}</Text>
          <Text style={styles.teaserBody}>{t(`node.${after.id}.tagline`)}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label={following ? t("ui.done.next") : after ? t("ui.done.nextNode") : t("ui.done.map")}
          onPress={following || after ? nav.next : nav.concepts}
        />
        <View style={styles.row}>
          <GhostButton label={t("ui.done.replay")} onPress={nav.replay} />
          {lesson ? (
            <GhostButton label={t("ui.done.cheatsheet")} onPress={() => onOpenCheatsheet(lesson.key.id)} />
          ) : null}
          <GhostButton label={t("ui.done.levels")} onPress={nav.levels} />
        </View>
      </View>
    </Overlay>
  );
}

/**
 * La luz que sube de la llave recién ganada. No es confeti: es la misma luz que
 * ilumina el mapa, y sale del lugar exacto donde está lo que se aprendió. Sube
 * una vez y se apaga; no se repite para pedir atención.
 */
function Motes() {
  return (
    <View style={styles.motes}>
      {Array.from({ length: 14 }, (_, i) => (
        <Mote key={i} i={i} />
      ))}
    </View>
  );
}

function Mote({ i }: { readonly i: number }) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = withDelay(380 + i * 70, withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }));
  }, [k, i]);
  const x = ((i * 37) % 100) / 100;
  const drift = ((i * 53) % 7) - 3;
  const style = useAnimatedStyle(() => ({
    opacity: k.value === 0 ? 0 : Math.sin(k.value * Math.PI),
    transform: [{ translateY: -90 * k.value }, { translateX: drift * 6 * k.value }],
  }));
  return <Animated.View style={[styles.mote, { left: `${8 + x * 84}%`, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2 }, style]} />;
}

/** Una ranura por nivel del concepto: las llaves ganadas y las siluetas que faltan. */
function KeySlots({
  lesson,
  done,
  current,
}: {
  readonly lesson: NodeLesson;
  readonly done: number;
  readonly current: number;
}) {
  return (
    <View style={styles.slots}>
      {lesson.levels.map((l) => (
        <View key={l.level} style={[styles.slot, l.level === current && styles.slotNow]}>
          <KeyGlyph name={l.key.glyph} locked={l.level > done} size={34} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { gap: 6, alignItems: "center" },
  title: { color: theme.color.ink, fontSize: 30, lineHeight: 36, fontWeight: "700", textAlign: "center" },
  motes: { position: "absolute", left: 0, right: 0, top: 10, height: 1, zIndex: 3, pointerEvents: "none" },
  mote: {
    position: "absolute",
    top: 0,
    borderRadius: 6,
    backgroundColor: theme.color.gold,
    shadowColor: theme.color.gold,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  lead: { color: theme.color.inkDim, fontSize: 16, lineHeight: 23 },
  progress: { gap: theme.space[1], marginTop: theme.space[1] },
  slots: { flexDirection: "row", gap: theme.space[1], flexWrap: "wrap" },
  slot: { borderRadius: theme.radius.token + 3, borderWidth: 2, borderColor: "transparent" },
  slotNow: { borderColor: theme.color.ok },
  caption: { color: theme.color.inkFaint, fontSize: 13 },
  teaser: {
    gap: 4,
    paddingTop: theme.space[3],
    borderTopWidth: 1,
    borderTopColor: theme.color.line,
  },
  teaserLabel: { color: theme.color.inkFaint, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  teaserTitle: { color: theme.color.ink, fontSize: 17 },
  teaserBody: { color: theme.color.inkDim, fontSize: 14, lineHeight: 20 },
  actions: { gap: theme.space[2] },
  row: { flexDirection: "row", gap: theme.space[1], justifyContent: "center", flexWrap: "wrap" },
});
