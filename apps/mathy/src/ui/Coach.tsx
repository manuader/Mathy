/**
 * La guía: Lumi, lo que dice, y el foco que señala dónde.
 *
 * La guía no es una pantalla de instrucciones. Se juega la primera ronda con
 * Lumi al lado: cada paso señala un objeto real del tablero y espera el gesto
 * del jugador, así que avanza haciendo y no leyendo. Lumi cambia de pose con lo
 * que el paso pide: señala cuando hay que hacer algo, se asombra cuando el paso
 * explica lo que acaba de pasar.
 *
 * El foco no tapa nada ni se lleva ningún toque: son anillos y una yema que se
 * desliza, encima del lienzo y con `pointerEvents: "none"`. Si tapara, el
 * gesto que la guía pide no llegaría al tablero.
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { LumiPose } from "../art/index.ts";
import { t, tf } from "../i18n.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import type { CoachStep } from "../lessons/types.ts";
import { GhostButton, PrimaryButton } from "./Kit.tsx";
import { Lumi } from "./Lumi.tsx";
import { theme } from "./theme.ts";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface Pt {
  readonly x: number;
  readonly y: number;
}

/** Qué señalar: anillos sobre lo que importa y, si hay que arrastrar, desde dónde hasta dónde. */
export interface Focus {
  readonly rings: readonly Rect[];
  readonly drag?: { readonly from: Pt; readonly to: Pt };
}

/** La pose de Lumi según lo que el paso le pide al jugador. */
function poseFor(step: CoachStep | undefined): LumiPose {
  if (!step) return "icon";
  if (step.holds) return "wow";
  if (step.advance !== "tap") return "point";
  return "think";
}

/**
 * El cartel de arriba del tablero. Mientras hay guía, dice el paso; después,
 * el objetivo del nivel y la ronda. Nunca desaparece: la pregunta "¿qué tengo
 * que hacer?" tiene que tener respuesta a la vista en todo momento.
 */
export function CoachBanner({ round, rounds }: { readonly round: number; readonly rounds: number }) {
  const api = useLesson();
  if (!api?.lesson || api.phase === "intro") return null;
  const { lesson, step, stepIndex } = api;

  if (step) {
    const total = lesson.coach.length;
    const last = stepIndex === total - 1;
    return (
      <View style={styles.row}>
        <Lumi pose={poseFor(step)} size={84} />
        <View style={[styles.bubble, styles.bubbleCoach]}>
          <View style={styles.tail} />
          <View style={styles.head}>
            <Text style={[styles.eyebrow, { color: theme.color.gold }]}>
              {total > 1 ? tf("ui.coach.step", { i: stepIndex + 1, n: total }) : t("ui.coach.remember")}
            </Text>
            <Steps n={total} at={stepIndex} />
            <View style={styles.flex} />
            <GhostButton small label={t("ui.coach.skip")} onPress={api.skipCoach} />
          </View>
          <Text style={styles.text}>{t(step.textKey)}</Text>
          {step.advance === "tap" ? (
            <View style={styles.action}>
              <PrimaryButton label={t(last ? "ui.coach.done" : "ui.coach.next")} onPress={api.nextStep} />
            </View>
          ) : (
            <YourMove />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Lumi pose="icon" size={64} />
      <View style={styles.bubble}>
        <View style={styles.tail} />
        <View style={styles.head}>
          <Text style={styles.eyebrow}>{t("ui.goal.label")}</Text>
          <View style={styles.flex} />
          <Text style={styles.eyebrow}>{tf("ui.goal.round", { i: Math.min(round + 1, rounds), n: rounds })}</Text>
        </View>
        <Text style={styles.text}>{t(lesson.goalKey)}</Text>
        <View style={styles.dots}>
          {Array.from({ length: rounds }, (_, i) => (
            <View key={i} style={[styles.dot, i < round && styles.dotDone, i === round && styles.dotNow]} />
          ))}
        </View>
      </View>
    </View>
  );
}

/** "Te toca", con un punto que late: el turno es del jugador, y se nota. */
function YourMove() {
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => cancelAnimation(k);
  }, [k]);
  const dot = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * k.value, transform: [{ scale: 0.8 + 0.4 * k.value }] }));
  return (
    <View style={styles.move}>
      <Animated.View style={[styles.moveDot, dot]} />
      <Text style={styles.moveText}>{t("ui.coach.yourMove")}</Text>
    </View>
  );
}

function Steps({ n, at }: { readonly n: number; readonly at: number }) {
  if (n <= 1) return null;
  return (
    <View style={styles.steps}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[styles.step, i <= at && styles.stepOn]} />
      ))}
    </View>
  );
}

/** Los anillos y la yema, en coordenadas del lienzo. */
export function Spotlight({ focus }: { readonly focus: Focus | null }) {
  if (!focus) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {focus.rings.map((r, i) => (
        <Ring key={i} rect={r} />
      ))}
      {focus.drag ? <Finger from={focus.drag.from} to={focus.drag.to} /> : null}
    </View>
  );
}

function Ring({ rect }: { readonly rect: Rect }) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(k);
  }, [k]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + 0.5 * k.value,
    transform: [{ scale: 1 + 0.04 * k.value }],
  }));
  return (
    <Animated.View
      style={[styles.ring, { left: rect.x, top: rect.y, width: rect.w, height: rect.h }, style]}
    />
  );
}

const FINGER = 34;

/** La luz de Lumi que muestra el arrastre, una y otra vez, hasta que el jugador lo hace. */
function Finger({ from, to }: { readonly from: Pt; readonly to: Pt }) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.value = 0;
    k.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 420 }),
        withTiming(1, { duration: 1150, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1, { duration: 520 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(k);
  }, [k, from.x, from.y, to.x, to.y]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: from.x + (to.x - from.x) * k.value - FINGER / 2 },
      { translateY: from.y + (to.y - from.y) * k.value - FINGER / 2 },
      { scale: k.value > 0.02 && k.value < 0.98 ? 0.9 : 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.finger, style]}>
      <View style={styles.fingerCore} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "94%",
    maxWidth: 680,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    minHeight: 150,
  },
  bubble: {
    flex: 1,
    backgroundColor: theme.color.glass,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    gap: theme.space[2],
  },
  bubbleCoach: { borderColor: "rgba(255, 209, 102, 0.55)" },
  tail: {
    position: "absolute",
    left: -7,
    top: "50%",
    marginTop: -7,
    width: 14,
    height: 14,
    transform: [{ rotate: "45deg" }],
    backgroundColor: theme.color.glass,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.glassLine,
  },
  head: { flexDirection: "row", alignItems: "center", gap: theme.space[2] },
  flex: { flex: 1 },
  eyebrow: { color: theme.color.inkFaint, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "700" },
  text: { color: theme.color.ink, fontSize: 18, lineHeight: 25, fontWeight: "500" },
  action: { alignSelf: "flex-start", minWidth: 190 },
  move: { flexDirection: "row", alignItems: "center", gap: 8 },
  moveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: theme.color.gold },
  moveText: { color: theme.color.gold, fontSize: 14, fontWeight: "600" },
  steps: { flexDirection: "row", gap: 4 },
  step: { width: 16, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.14)" },
  stepOn: { backgroundColor: theme.color.gold },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: theme.radius.full, backgroundColor: "rgba(255,255,255,0.16)" },
  dotDone: { backgroundColor: theme.color.ok },
  dotNow: { backgroundColor: theme.color.accent },
  ring: {
    position: "absolute",
    borderRadius: theme.radius.panel,
    borderWidth: 2.5,
    borderColor: theme.color.gold,
    backgroundColor: "rgba(255, 209, 102, 0.07)",
    shadowColor: theme.color.gold,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  finger: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FINGER,
    height: FINGER,
    borderRadius: FINGER / 2,
    backgroundColor: "rgba(255, 209, 102, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.color.gold,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  fingerCore: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.color.gold },
});
