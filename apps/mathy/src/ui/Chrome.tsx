/**
 * El encabezado de la actividad y la línea de lo que pasó.
 *
 * Sin puntos, sin monedas, sin rachas. El encabezado dice dónde está el jugador
 * (el concepto, con el tono de su área, y el nivel en grande) y cuánto le falta
 * al nivel, como territorio: una marca por nivel del concepto. La marca del
 * nivel que se juega es más larga y se va llenando ronda a ronda, con un pequeño
 * salto cada vez: el avance se nota en el momento en que pasa, no solo al final.
 *
 * La línea de lo que pasó cambia de color según lo que dice: menta si algo
 * coincidió, ámbar si algo pide que lo miren. Nunca rojo, porque no hay error
 * como categoría (N §2.2).
 */
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { t, tf } from "../i18n.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import { Rise, RoundMarks } from "./Motion.tsx";
import { AREAS, areaOf, theme } from "./theme.ts";

export function Header({
  title,
  subtitle,
  round: reported,
  rounds,
  showDots = true,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly round: number;
  readonly rounds: number;
  /** Apagados cuando el cartel del objetivo ya lleva la ronda. */
  readonly showDots?: boolean;
}) {
  const lesson = useLesson();
  // Las actividades avisan que el nivel terminó sin avanzar la última ronda: con
  // el nivel hecho, todas las marcas se encienden antes de que llegue la tarjeta.
  const round = lesson?.phase === "done" ? rounds : reported;
  // Con el contexto del nivel, el encabezado se arma solo y es igual en los 21
  // nodos; sin él, muestra lo que la actividad le pasa.
  if (lesson) {
    const { node, level } = lesson;
    const hue = AREAS[areaOf(node.id)].hue;
    return (
      <Rise from={10} style={styles.header}>
        <Text style={[styles.node, { color: hue }]}>{t(`node.${node.id}.name`)}</Text>
        <Text style={styles.level}>{t(level.titleKey)}</Text>
        <View style={styles.levels}>
          {node.levels.map((l) =>
            l.n === level.n ? (
              <LevelNow key={l.n} hue={hue} round={round} rounds={rounds} />
            ) : (
              <View key={l.n} style={[styles.levelSeg, l.n < level.n && styles.levelSegDone]} />
            ),
          )}
          <Text style={styles.levelCount}>{tf("ui.header.level", { n: level.n, total: node.levels.length })}</Text>
        </View>
        {showDots ? (
          <View style={styles.dots}>
            <RoundMarks round={round} rounds={rounds} size={8} />
          </View>
        ) : null}
      </Rise>
    );
  }
  return (
    <View style={styles.header}>
      <Text style={styles.level}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {showDots ? (
        <View style={styles.dots}>
          <RoundMarks round={round} rounds={rounds} size={8} />
        </View>
      ) : null}
    </View>
  );
}

const SEG_NOW = 34;

/**
 * La marca del nivel en juego: se llena con las rondas hechas, en el tono del
 * área, y salta un poco cada vez que crece. Es la misma barra de niveles del
 * concepto, así que avanzar una ronda se ve como avanzar en el concepto.
 */
function LevelNow({ hue, round, rounds }: { readonly hue: string; readonly round: number; readonly rounds: number }) {
  const calm = useReducedMotion();
  const target = rounds > 0 ? Math.min(1, Math.max(0, round / rounds)) : 0;
  const fill = useSharedValue(target);
  const pop = useSharedValue(0);
  const was = useRef(target);
  useEffect(() => {
    if (was.current === target) return;
    const grew = target > was.current;
    was.current = target;
    if (calm) {
      fill.value = target;
      return;
    }
    fill.value = withSpring(target, theme.spring.settle);
    if (grew) {
      pop.value = withSequence(
        withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
        withSpring(0, theme.spring.settle),
      );
    }
  }, [target, calm, fill, pop]);
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -SEG_NOW * (1 - Math.min(1, Math.max(0, fill.value))) }],
  }));
  const segStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * pop.value }, { scale: 1 + 0.25 * pop.value }],
  }));
  return (
    <Animated.View style={[styles.levelSeg, styles.levelSegNow, { borderColor: hue }, segStyle]}>
      <Animated.View style={[styles.levelFill, { backgroundColor: hue }, fillStyle]} />
    </Animated.View>
  );
}

const TONE = {
  dim: { fg: theme.color.inkDim, bg: "transparent", line: "transparent" },
  ok: { fg: theme.color.ok, bg: "rgba(63, 224, 164, 0.12)", line: "rgba(63, 224, 164, 0.45)" },
  warn: { fg: theme.color.warn, bg: "rgba(255, 181, 71, 0.12)", line: "rgba(255, 181, 71, 0.45)" },
} as const;

/** El resorte del aviso: rápido y con un solo rebote, como algo que se apoya. */
const HINT_SPRING = { damping: 12, stiffness: 260, mass: 0.6 } as const;

/** Lo que pasó, como un aviso que entra con un pequeño salto cada vez que cambia. */
export function Hint({ text, tone = "dim" }: { readonly text: string; readonly tone?: "dim" | "ok" | "warn" }) {
  const calm = useReducedMotion();
  const k = useSharedValue(1);
  useEffect(() => {
    if (calm) {
      k.value = 1;
      return;
    }
    k.value = 0;
    k.value = withSpring(1, HINT_SPRING);
  }, [text, k, calm]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.value * 1.5),
    transform: [{ scale: 0.9 + 0.1 * k.value }, { translateY: (1 - k.value) * 8 }],
  }));
  const c = TONE[tone];
  return (
    <View style={styles.hintRow}>
      {text ? (
        <Animated.View style={[styles.hint, { backgroundColor: c.bg, borderColor: c.line }, style]}>
          {tone !== "dim" ? <View style={[styles.hintDot, { backgroundColor: c.fg }]} /> : null}
          <Text style={[styles.hintText, { color: tone === "dim" ? theme.color.inkDim : theme.color.ink }]}>{text}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", gap: 4, paddingTop: 8 },
  node: { fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: "700" },
  level: { color: theme.color.ink, fontSize: 24, fontWeight: "700", letterSpacing: 0.2, textAlign: "center" },
  subtitle: { color: theme.color.inkFaint, fontSize: 13 },
  levels: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  levelSeg: { width: 18, height: 5, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.14)" },
  levelSegDone: { backgroundColor: theme.color.ok },
  levelSegNow: {
    width: SEG_NOW,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  levelFill: { position: "absolute", top: 0, bottom: 0, left: 0, width: SEG_NOW },
  levelCount: { color: theme.color.inkFaint, fontSize: 12, marginLeft: 6 },
  dots: { marginTop: theme.space[1] },
  hintRow: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 620,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  hintDot: { width: 8, height: 8, borderRadius: 4 },
  hintText: { fontSize: 15, lineHeight: 21, textAlign: "center", flexShrink: 1 },
});
