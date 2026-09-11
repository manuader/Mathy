/**
 * La tarjeta de entrada de un nivel.
 *
 * Contesta tres preguntas antes de tocar nada: qué idea voy a aprender, qué
 * tengo que hacer para superarlo, y qué gano. La tercera es la llave: se ve su
 * silueta, no su contenido, para que la idea la descubra el juego y no la
 * tarjeta. La silueta brilla apenas y respira: es lo que está en juego.
 *
 * Las piezas entran de a una, con resorte, en el orden en que se leen: el
 * nivel, la idea, el objetivo, la llave, y al final el botón, que respira
 * porque es lo que sigue. Crea expectativa sin prometer nada que no sea la idea.
 *
 * Si el nivel se resuelve con llaves ganadas antes, están acá y se abren en la
 * chuleta con un toque. Es el momento en que la chuleta deja de ser un archivo
 * y pasa a ser una herramienta.
 */
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { t, tf } from "../i18n.ts";
import { keyById, type EarnedKey } from "../lessons/index.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import { useProgress } from "../progress.tsx";
import { noteLevelStart } from "./journey.ts";
import { KeyCard } from "./KeyGlyph.tsx";
import { Lumi } from "./Lumi.tsx";
import { Eyebrow, GhostButton, Overlay, PrimaryButton, Section } from "./Kit.tsx";
import { Hop, Invite, Rise } from "./Motion.tsx";
import { play } from "./sound.ts";
import { theme } from "./theme.ts";

/** El escalonado de las piezas, en milisegundos. */
const STAGGER = 80;

export function LevelIntro({ onOpenKey }: { readonly onOpenKey: (id: string) => void }) {
  const api = useLesson();
  const { progress } = useProgress();
  const nodeId = api?.node.id;
  const n = api?.level.n ?? 0;
  const played = nodeId !== undefined && (progress.levelsDone[nodeId] ?? 0) >= n;
  const hasLesson = api?.lesson !== undefined;

  // La tarjeta de cierre necesita saber si la llave es nueva o ya estaba.
  useEffect(() => {
    if (nodeId !== undefined && hasLesson) noteLevelStart(nodeId, n, played);
  }, [nodeId, n, played, hasLesson]);

  if (!api?.lesson) return null;
  const { node, level, lesson } = api;

  const hasCoach = lesson.coach.length > 0;
  const uses = lesson.uses.map(keyById).filter((k): k is EarnedKey => k !== undefined);
  // Cuántas piezas entran antes del botón: el botón llega último.
  const pieces = uses.length > 0 ? 6 : 5;

  return (
    <Overlay
      top={
        <Hop trigger="intro" delay={260} height={10}>
          <Lumi pose={played ? "icon" : "think"} size={112} />
        </Hop>
      }
    >
      <Rise delay={STAGGER} style={styles.head}>
        <Eyebrow tone="accent">
          {tf("ui.intro.eyebrow", {
            n: level.n,
            total: node.levels.length,
            layer: t(`layer.${level.layer}`),
          })}
        </Eyebrow>
        <Text style={styles.title}>{t(level.titleKey)}</Text>
        <Text style={styles.node}>{t(`node.${node.id}.name`)}</Text>
      </Rise>

      <Rise delay={STAGGER * 2}>
        <Section label={t("ui.intro.learn")}>
          <Text style={styles.body}>{t(lesson.whyKey)}</Text>
        </Section>
      </Rise>

      <Rise delay={STAGGER * 3} style={styles.goal}>
        <Text style={styles.goalLabel}>{t("ui.intro.goal")}</Text>
        <Text style={styles.goalText}>{t(lesson.goalKey)}</Text>
      </Rise>

      {uses.length > 0 ? (
        <Rise delay={STAGGER * 4}>
          <Section label={t("ui.intro.uses")}>
            {uses.map((u) => (
              <Pressable
                key={u.key.id}
                onPress={() => {
                  play("tap");
                  onOpenKey(u.key.id);
                }}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <KeyCard
                  glyph={u.key.glyph}
                  title={t(u.key.titleKey)}
                  footer={<Text style={styles.link}>{t("ui.intro.openKey")}</Text>}
                />
              </Pressable>
            ))}
          </Section>
        </Rise>
      ) : null}

      <Rise delay={STAGGER * (pieces - 1)}>
        <KeyCard glyph={lesson.key.glyph} locked glow title={t("ui.key.locked")} body={t("ui.intro.reward")} />
      </Rise>

      <Rise delay={STAGGER * pieces} style={styles.actions}>
        {/* "Empezar" suena `tap` desde el propio botón (Kit). */}
        <Invite delay={STAGGER * pieces + 700} strength={0.8} style={styles.start}>
          <PrimaryButton label={t("ui.intro.start")} onPress={() => api.start(hasCoach && !played)} />
        </Invite>
        {played && hasCoach ? (
          <GhostButton label={t("ui.intro.withGuide")} onPress={() => api.start(true)} />
        ) : hasCoach && lesson.coach.length > 1 ? (
          <Text style={styles.note}>{t("ui.intro.guideNote")}</Text>
        ) : null}
      </Rise>
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
  pressed: { opacity: 0.85 },
  actions: { gap: theme.space[2], alignItems: "center" },
  start: { alignSelf: "stretch" },
  note: { color: theme.color.inkFaint, fontSize: 13, textAlign: "center" },
});
