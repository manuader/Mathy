/**
 * La tarjeta de cierre de un nivel: el gran momento del recorrido.
 *
 * El nivel no termina volviendo a una lista: termina diciendo qué pasó. Qué
 * idea se ganó, dónde quedó guardada, cuántas faltan del concepto, y qué viene,
 * con un solo botón grande para seguir.
 *
 * Se cuenta en secuencia, no todo a la vez, porque cada paso dice una cosa:
 *
 * 1. La tarjeta entra: el nivel está superado.
 * 2. La llave nueva aparece grande con luz dorada, y sube luz de ella: esto se
 *    aprendió (dorado es lo aprendido, N §2.2).
 * 3. La llave viaja y entra en su lugar del llavero del concepto, con el clic de
 *    metal (`keyIn`) y un anillo que se abre en su ranura: quedó guardada, junto
 *    a las otras del concepto. Si era la última, se encienden todas.
 * 4. Lumi festeja con un salto y Tomi a su lado; aparece el nombre de la idea.
 * 5. Qué viene, y el botón de seguir, que respira hasta que se toca.
 *
 * Si el nivel ya estaba superado, la llave no vuelve a entrar: ya estaba en el
 * llavero, y la tarjeta lo dice. Sin puntos, sin estrellas, sin "excelente": lo
 * que se celebra es la llave, que es la idea misma. Con "reducir movimiento"
 * se ve directamente el final: la llave en su ranura.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { tomiArt, type TomiPose } from "../art/index.ts";
import { t, tf } from "../i18n.ts";
import { lessonFor, nodeAfter, nodeLesson } from "../lessons/index.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import type { KeyGlyphName, NodeLesson } from "../lessons/types.ts";
import { useProgress } from "../progress.tsx";
import { doneAtStart } from "./journey.ts";
import { KeyGlyph } from "./KeyGlyph.tsx";
import { Lumi } from "./Lumi.tsx";
import { Eyebrow, GhostButton, Overlay, PrimaryButton, Section } from "./Kit.tsx";
import { ENTER, Hop, Invite, Rise } from "./Motion.tsx";
import { play } from "./sound.ts";
import { theme } from "./theme.ts";
import { Tomi } from "./Tomi.tsx";

/** El orden del cierre, en milisegundos desde que aparece la tarjeta. */
const T = {
  /** La llave aparece con su luz. */
  key: 380,
  /** Sale hacia el llavero. */
  fly: 1150,
  flyDur: 620,
} as const;
/** Llega a su ranura: desde acá corre todo lo demás. */
const LAND = T.fly + T.flyDur;

export function LevelComplete({ onOpenCheatsheet }: { readonly onOpenCheatsheet: (id?: string) => void }) {
  const api = useLesson();
  const { progress } = useProgress();
  const calm = useReducedMotion();
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
  // La llave vuela solo si es nueva. Sin tarjeta de entrada no hay llave, así
  // que "no se sabe" se trata como nueva.
  const first = doneAtStart(node.id, level.n) !== true;
  const flies = lesson !== undefined && whole !== undefined && first;
  // Todo lo que sigue a la llave se ordena desde que llega (o desde que aparece, si no vuela).
  const beat = lesson && whole ? (flies && !calm ? LAND : T.key + 200) : 0;

  const tomiPose: TomiPose = tomiArt("cheer", "small") !== undefined ? "cheer" : "hero";

  return (
    <Overlay
      top={
        <View style={styles.pair}>
          <Hop trigger="done" delay={Math.max(200, beat - 40)} height={16}>
            <Lumi pose={lesson ? "key" : "cheer"} size={128} />
          </Hop>
          <View style={styles.tomi}>
            <Hop trigger="done" delay={Math.max(320, beat + 110)} height={10}>
              <Tomi pose={tomiPose} size={56} />
            </Hop>
          </View>
        </View>
      }
    >
      <Rise delay={60} style={styles.head}>
        <Eyebrow tone="gold">
          {last ? t("ui.done.nodeEyebrow") : tf("ui.done.eyebrow", { n: level.n, total })}
        </Eyebrow>
        <Text style={styles.title}>{last ? nodeName : t(level.titleKey)}</Text>
        {last && whole ? <Text style={styles.lead}>{t(whole.learnedKey)}</Text> : null}
      </Rise>

      {lesson && whole ? (
        <Rise delay={140}>
          <Section label={t("ui.done.learned")}>
            <KeyStage
              ring={whole}
              current={level.n}
              done={done}
              glyph={lesson.key.glyph}
              flies={flies}
              complete={last && done >= whole.levels.length}
              tag={first ? t("ui.done.newKey") : t("ui.done.keyAgain")}
              title={t(lesson.key.titleKey)}
            />
            <Rise delay={beat + 120} style={styles.idea}>
              <Text style={styles.ideaBody}>{t(lesson.key.bodyKey)}</Text>
              <Text style={styles.caption}>
                {tf("ui.done.keys", { k: done, n: whole.levels.length, node: nodeName })}
              </Text>
            </Rise>
          </Section>
        </Rise>
      ) : null}

      {following ? (
        <Rise delay={beat + 220} style={styles.teaser}>
          <Text style={styles.teaserLabel}>{t("ui.done.upNext")}</Text>
          <Text style={styles.teaserTitle}>
            {tf("ui.done.levelN", { n: following.n })} · {t(following.titleKey)}
          </Text>
          {followingLesson ? <Text style={styles.teaserBody}>{t(followingLesson.whyKey)}</Text> : null}
        </Rise>
      ) : after ? (
        <Rise delay={beat + 220} style={styles.teaser}>
          <Text style={styles.teaserLabel}>{t("ui.done.upNextNode")}</Text>
          <Text style={styles.teaserTitle}>{t(`node.${after.id}.name`)}</Text>
          <Text style={styles.teaserBody}>{t(`node.${after.id}.tagline`)}</Text>
        </Rise>
      ) : null}

      <Rise delay={beat + 320} style={styles.actions}>
        {/* Los botones suenan `tap` solos (Kit). El principal respira: es lo que sigue. */}
        <Invite delay={beat + 900}>
          <PrimaryButton
            label={following ? t("ui.done.next") : after ? t("ui.done.nextNode") : t("ui.done.map")}
            onPress={following || after ? nav.next : nav.concepts}
          />
        </Invite>
        <View style={styles.row}>
          <GhostButton label={t("ui.done.replay")} onPress={nav.replay} />
          {lesson ? (
            <GhostButton label={t("ui.done.cheatsheet")} onPress={() => onOpenCheatsheet(lesson.key.id)} />
          ) : null}
          <GhostButton label={t("ui.done.levels")} onPress={nav.levels} />
        </View>
      </Rise>
    </Overlay>
  );
}

/** Lo que ocupa la llave grande antes de viajar, y después su nombre. */
const TOP = 112;
const GAP = 8;
/** Cuánto más grande se ve la llave recién ganada que en su ranura. */
const BIG = 1.9;
/** Cuánto sube el arco del viaje. */
const ARC = 46;
const MOTES = 10;

/**
 * El llavero del concepto: una ranura por nivel, con las llaves ganadas en
 * dorado y las siluetas de las que faltan. La llave nueva nace grande arriba,
 * con su luz, y viaja a su ranura. Sus medidas salen del ancho de la tarjeta,
 * así que la fila nunca se parte en dos y el destino del viaje es exacto.
 */
function KeyStage({
  ring,
  current,
  done,
  glyph,
  flies,
  complete,
  tag,
  title,
}: {
  readonly ring: NodeLesson;
  readonly current: number;
  readonly done: number;
  readonly glyph: KeyGlyphName;
  readonly flies: boolean;
  readonly complete: boolean;
  readonly tag: string;
  readonly title: string;
}) {
  const calm = useReducedMotion();
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent): void => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next !== w) setW(next);
  };

  const n = ring.levels.length;
  const size = w > 0 ? Math.max(28, Math.min(46, Math.floor((w - (n - 1) * GAP) / n))) : 46;
  const rowW = n * size + (n - 1) * GAP;
  const left0 = (w - rowW) / 2;
  const idx = Math.max(0, ring.levels.findIndex((l) => l.level === current));
  const slotX = left0 + idx * (size + GAP);
  const startX = w / 2 - size / 2;
  const startY = (TOP - size) / 2 - 8;
  const moving = flies && !calm;

  // show: la llave aparece. fly: el viaje. thud: el golpe al entrar. named: su nombre.
  const show = useSharedValue(moving ? 0 : 1);
  const fly = useSharedValue(moving ? 0 : 1);
  const thud = useSharedValue(0);
  const named = useSharedValue(moving ? 0 : 1);

  useEffect(() => {
    if (!flies) return;
    if (calm) {
      // El final, quieto; el clic igual dice que entró.
      const id = setTimeout(() => play("keyIn"), 300);
      return () => clearTimeout(id);
    }
    show.value = withDelay(T.key, withSpring(1, ENTER));
    fly.value = withDelay(T.fly, withTiming(1, { duration: T.flyDur, easing: Easing.inOut(Easing.cubic) }));
    thud.value = withDelay(
      LAND,
      withSequence(withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }), withSpring(0, theme.spring.settle)),
    );
    named.value = withDelay(LAND + 60, withSpring(1, ENTER));
    // Un solo sonido, en el instante en que la llave toca su ranura.
    const id = setTimeout(() => play("keyIn"), LAND);
    return () => clearTimeout(id);
  }, [flies, calm, show, fly, thud, named]);

  const keyStyle = useAnimatedStyle(() => {
    const f = Math.min(1, Math.max(0, fly.value));
    const x = startX + (slotX - startX) * f;
    const y = startY + (TOP - startY) * f - ARC * Math.sin(Math.PI * f);
    const grow = 0.3 + 0.7 * show.value;
    return {
      opacity: Math.min(1, show.value * 2),
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${-14 * Math.sin(Math.PI * f)}deg` },
        { scale: (BIG + (1 - BIG) * f) * grow * (1 + 0.16 * thud.value) },
      ],
    };
  });
  // La luz viaja con la llave y se apaga al guardarla: lo que queda brillando es el llavero.
  const haloStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, show.value) * (0.85 - 0.75 * Math.min(1, fly.value)),
    transform: [{ scale: 0.8 + 0.3 * show.value }],
  }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, named.value * 1.5),
    transform: [{ translateY: (1 - named.value) * 10 }],
  }));

  return (
    <View style={[styles.stage, { height: TOP + size + 6 }]} onLayout={onLayout}>
      <Animated.View style={[styles.name, { height: TOP }, nameStyle]}>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.keyTitle}>{title}</Text>
      </Animated.View>

      {w > 0 ? (
        <>
          <View style={[styles.slots, { left: left0, top: TOP, gap: GAP }]}>
            {ring.levels.map((l) => {
              const here = l.level === current;
              // La ranura de la llave que vuela queda vacía hasta que llega.
              const locked = here ? flies : l.level > done;
              return (
                <KeyGlyph key={l.level} name={l.key.glyph} size={size} locked={locked} warm={here && locked} gold={!locked} />
              );
            })}
          </View>

          {ring.levels.map((l, i) =>
            l.level === current || complete ? (
              <Ping
                key={l.level}
                x={left0 + i * (size + GAP)}
                y={TOP}
                size={size}
                // La ranura nueva se enciende al llegar; si el llavero se completó, la luz corre por todas.
                delay={(moving ? LAND : T.key) + (complete ? 140 + i * 90 : 0)}
                strong={l.level === current}
              />
            ) : null,
          )}

          {flies ? (
            <Animated.View style={[styles.fly, { width: size, height: size }, keyStyle]}>
              <Animated.View
                style={[styles.flyHalo, { top: -size * 0.55, left: -size * 0.55, right: -size * 0.55, bottom: -size * 0.55 }, haloStyle]}
              />
              <KeyGlyph name={glyph} size={size} gold />
            </Animated.View>
          ) : null}

          {moving
            ? Array.from({ length: MOTES }, (_, i) => <Mote key={i} i={i} cx={w / 2} cy={TOP / 2 - 8} />)
            : null}
        </>
      ) : null}
    </View>
  );
}

/**
 * La luz que sube de la llave recién ganada. No es confeti: es la misma luz que
 * ilumina el mapa, y sale del lugar exacto donde está lo que se aprendió. Sube
 * una vez y se apaga; no se repite para pedir atención.
 */
function Mote({ i, cx, cy }: { readonly i: number; readonly cx: number; readonly cy: number }) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = withDelay(T.key + 120 + i * 55, withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }));
  }, [k, i]);
  const dx = (((i * 37) % 11) - 5) * 7;
  const d = 3 + (i % 3) * 2;
  const style = useAnimatedStyle(() => ({
    opacity: k.value <= 0 || k.value >= 1 ? 0 : Math.sin(k.value * Math.PI),
    transform: [
      { translateX: cx + dx * (0.35 + 0.65 * k.value) - d / 2 },
      { translateY: cy - 84 * k.value },
    ],
  }));
  return <Animated.View style={[styles.mote, { width: d, height: d, borderRadius: d }, style]} />;
}

/** Un anillo dorado que se abre una vez desde una ranura: acá quedó guardada. */
function Ping({
  x,
  y,
  size,
  delay,
  strong,
}: {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly delay: number;
  readonly strong: boolean;
}) {
  const calm = useReducedMotion();
  const k = useSharedValue(0);
  useEffect(() => {
    if (calm) return;
    k.value = withDelay(delay, withTiming(1, { duration: 720, easing: Easing.out(Easing.quad) }));
  }, [k, delay, calm]);
  const style = useAnimatedStyle(() => ({
    opacity: k.value <= 0 || k.value >= 1 ? 0 : (strong ? 1 : 0.7) * (1 - k.value),
    transform: [{ translateX: x }, { translateY: y }, { scale: 1 + (strong ? 0.9 : 0.5) * k.value }],
  }));
  return <Animated.View style={[styles.ping, { width: size, height: size }, style]} />;
}

const styles = StyleSheet.create({
  head: { gap: 6, alignItems: "center" },
  title: { color: theme.color.ink, fontSize: 30, lineHeight: 36, fontWeight: "700", textAlign: "center" },
  lead: { color: theme.color.inkDim, fontSize: 16, lineHeight: 23, textAlign: "center" },
  pair: { width: 128, height: 128 },
  tomi: { position: "absolute", right: -50, bottom: 4 },
  stage: { width: "100%", position: "relative" },
  name: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: theme.space[2],
  },
  tag: { color: theme.color.gold, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "700", textAlign: "center" },
  keyTitle: { color: theme.color.ink, fontSize: 22, lineHeight: 28, fontWeight: "700", textAlign: "center" },
  slots: { position: "absolute", flexDirection: "row" },
  fly: { position: "absolute", left: 0, top: 0 },
  flyHalo: {
    position: "absolute",
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(255, 209, 102, 0.35)",
    shadowColor: theme.color.gold,
    shadowOpacity: 1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  mote: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: theme.color.gold,
    shadowColor: theme.color.gold,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  ping: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: theme.radius.token + 2,
    borderWidth: 2.5,
    borderColor: theme.color.gold,
  },
  idea: { gap: theme.space[1], marginTop: theme.space[1] },
  ideaBody: { color: theme.color.inkDim, fontSize: 15, lineHeight: 22, textAlign: "center" },
  caption: { color: theme.color.inkFaint, fontSize: 13, textAlign: "center" },
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
