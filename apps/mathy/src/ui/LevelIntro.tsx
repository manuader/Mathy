/**
 * La tarjeta de entrada de un nivel.
 *
 * Contesta tres preguntas antes de tocar nada: qué idea voy a aprender, qué
 * tengo que hacer para superarlo, y qué gano. La tercera es la llave: se ve su
 * silueta, no su contenido, para que la idea la descubra el juego y no la
 * tarjeta.
 *
 * Si el nivel se resuelve con llaves ganadas antes, están acá y se abren en la
 * chuleta con un toque. Es el momento en que la chuleta deja de ser un archivo
 * y pasa a ser una herramienta.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t, tf } from "../i18n.ts";
import { keyById, type EarnedKey } from "../lessons/index.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import { useProgress } from "../progress.tsx";
import { KeyCard } from "./KeyGlyph.tsx";
import { Lumi } from "./Lumi.tsx";
import { Eyebrow, GhostButton, Overlay, PrimaryButton, Section } from "./Kit.tsx";
import { theme } from "./theme.ts";

export function LevelIntro({ onOpenKey }: { readonly onOpenKey: (id: string) => void }) {
  const api = useLesson();
  const { progress } = useProgress();
  if (!api?.lesson) return null;
  const { node, level, lesson } = api;

  const played = (progress.levelsDone[node.id] ?? 0) >= level.n;
  const hasCoach = lesson.coach.length > 0;
  const uses = lesson.uses.map(keyById).filter((k): k is EarnedKey => k !== undefined);

  return (
    <Overlay top={<Lumi pose={played ? "icon" : "think"} size={112} />}>
      <View style={styles.head}>
        <Eyebrow tone="accent">
          {tf("ui.intro.eyebrow", {
            n: level.n,
            total: node.levels.length,
            layer: t(`layer.${level.layer}`),
          })}
        </Eyebrow>
        <Text style={styles.title}>{t(level.titleKey)}</Text>
        <Text style={styles.node}>{t(`node.${node.id}.name`)}</Text>
      </View>

      <Section label={t("ui.intro.learn")}>
        <Text style={styles.body}>{t(lesson.whyKey)}</Text>
      </Section>

      <View style={styles.goal}>
        <Text style={styles.goalLabel}>{t("ui.intro.goal")}</Text>
        <Text style={styles.goalText}>{t(lesson.goalKey)}</Text>
      </View>

      {uses.length > 0 ? (
        <Section label={t("ui.intro.uses")}>
          {uses.map((u) => (
            <Pressable key={u.key.id} onPress={() => onOpenKey(u.key.id)}>
              <KeyCard
                glyph={u.key.glyph}
                title={t(u.key.titleKey)}
                footer={<Text style={styles.link}>{t("ui.intro.openKey")}</Text>}
              />
            </Pressable>
          ))}
        </Section>
      ) : null}

      <KeyCard glyph={lesson.key.glyph} locked title={t("ui.key.locked")} body={t("ui.intro.reward")} />

      <View style={styles.actions}>
        <PrimaryButton label={t("ui.intro.start")} onPress={() => api.start(hasCoach && !played)} />
        {played && hasCoach ? (
          <GhostButton label={t("ui.intro.withGuide")} onPress={() => api.start(true)} />
        ) : hasCoach && lesson.coach.length > 1 ? (
          <Text style={styles.note}>{t("ui.intro.guideNote")}</Text>
        ) : null}
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  head: { gap: 6, alignItems: "center" },
  title: { color: theme.color.ink, fontSize: 30, lineHeight: 36, letterSpacing: 0.2, fontWeight: "700", textAlign: "center" },
  node: { color: theme.color.inkFaint, fontSize: 14 },
  body: { color: theme.color.inkDim, fontSize: 16, lineHeight: 23 },
  goal: {
    gap: 6,
    padding: theme.space[3],
    borderRadius: theme.radius.token,
    backgroundColor: "rgba(138, 180, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(138, 180, 248, 0.35)",
  },
  goalLabel: { color: theme.color.accent, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" },
  goalText: { color: theme.color.ink, fontSize: 18, lineHeight: 25 },
  link: { color: theme.color.accent, fontSize: 13, marginTop: 2 },
  actions: { gap: theme.space[2], alignItems: "center" },
  note: { color: theme.color.inkFaint, fontSize: 13, textAlign: "center" },
});
