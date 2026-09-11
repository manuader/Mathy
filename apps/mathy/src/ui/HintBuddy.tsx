/**
 * Tomi en el rincón: la pista para cuando no se sabe qué hacer.
 *
 * Lumi enseña; Tomi ayuda. Vive abajo a la izquierda, chiquito y con la
 * lamparita apagada, y se ofrece solo en dos casos: cuando el jugador lleva un
 * rato sin tocar nada, o cuando varios intentos seguidos no avanzaron. Nunca
 * interrumpe: se asoma, pregunta "¿Te doy una pista?" y si nadie contesta, vuelve
 * a su rincón. Tocarlo abre la pista en cualquier momento.
 *
 * Las pistas van de a una y de menos a más, para que el jugador haga la mayor
 * parte del trabajo:
 *
 * 1. Dónde mirar y qué gesto hacer: el paso "hacelo" de la guía, que la
 *    actividad señala en el tablero igual que la guía (`lesson.showHint`).
 *    Señala; no frena nada. El objetivo no va primero: ya está en el cartel.
 * 2. Qué llave de la chuleta sirve, si el nivel usa una anterior.
 * 3. La idea que el nivel enseña (o, sin lección, la del concepto).
 * 4. Que pruebe cualquier cosa: acá nada se pierde.
 *
 * La tarjeta de la pista aparece arriba, en el lugar del cartel de la guía, y
 * nunca sobre el tablero: una pista que tapa lo que señala no sirve.
 *
 * Pedir una pista no cuesta nada ni queda anotado como falla (N §10). Mientras
 * la guía de Lumi está en pantalla, Tomi calla: dos voces a la vez son ninguna.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { TomiPose } from "../art/index.ts";
import { t } from "../i18n.ts";
import { keyById } from "../lessons/index.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import type { CoachStep } from "../lessons/types.ts";
import { GhostButton } from "./Kit.tsx";
import { play } from "./sound.ts";
import { theme } from "./theme.ts";
import { Tomi } from "./Tomi.tsx";

/** Cuánto tiempo sin tocar nada antes de ofrecer una pista. */
const IDLE_MS = 18000;
/** Cuántos intentos seguidos que no avanzaron antes de ofrecerla. */
const MISSES = 2;
/** Cuánto se queda ofreciendo antes de volver al rincón. */
const OFFER_MS = 9000;

type Mode = "idle" | "offer" | "open";

interface Tier {
  readonly title: string;
  readonly text: string;
  readonly pose: TomiPose;
  readonly show?: CoachStep;
  readonly keyId?: string;
}

export function HintBuddy({
  lastTouch,
  onOpenKey,
}: {
  /** Cuándo tocó el jugador el tablero por última vez (lo actualiza el marco). */
  readonly lastTouch: { current: number };
  readonly onOpenKey: (id: string) => void;
}) {
  const lesson = useLesson();
  const { width } = useWindowDimensions();
  const still = useReducedMotion();
  const [mode, setMode] = useState<Mode>("idle");
  const [tier, setTier] = useState(0);
  const openedAt = useRef(0);

  const playing = lesson?.phase === "play";
  const coaching = lesson?.step !== undefined;
  const available = playing && !coaching;

  const tiers = useMemo<readonly Tier[]>(() => {
    if (!lesson) return [];
    const out: Tier[] = [];
    const l = lesson.lesson;
    // La actividad puede elegir qué paso vale en esta ronda (niveles que alternan
    // preguntas); si no eligió, el primero que espera un gesto.
    const pedido = lesson.hintPref ? l?.coach.find((s) => s.id === lesson.hintPref) : undefined;
    // `""` es "esta ronda no tiene gesto que mostrar": la pregunta de la ronda no
    // es la del paso de la guía, y un "Mirá acá" hablaría del gesto equivocado.
    const doStep = lesson.hintPref === "" ? undefined : (pedido ?? l?.coach.find((s) => s.advance !== "tap"));
    if (doStep)
      out.push({
        title: t("ui.hint.show"),
        text: t(doStep.textKey),
        pose: "point",
        show: doStep,
      });
    const used = l?.uses[0];
    const key = used !== undefined ? keyById(used)?.key : undefined;
    if (key)
      out.push({
        title: t("ui.hint.key"),
        text: `${t(key.titleKey)}. ${t(key.bodyKey)}`,
        pose: "point",
        keyId: key.id,
      });
    if (l)
      out.push({ title: t("ui.hint.idea"), text: t(l.whyKey), pose: "idea" });
    else
      out.push({
        title: t("ui.hint.idea"),
        text: t(`node.${lesson.node.id}.tagline`),
        pose: "idea",
      });
    out.push({
      title: t("ui.hint.tryTitle"),
      text: t("ui.hint.try"),
      pose: "think",
    });
    return out;
  }, [lesson]);

  // Ofrecer por intentos que no avanzaron.
  const misses = lesson?.misses ?? 0;
  useEffect(() => {
    if (available && mode === "idle" && misses >= MISSES) setMode("offer");
  }, [available, mode, misses]);

  // Ofrecer por quietud, y volver al rincón si nadie contesta.
  useEffect(() => {
    if (!available) return;
    const id = setInterval(() => {
      const now = Date.now();
      if (mode === "idle" && now - lastTouch.current > IDLE_MS)
        setMode("offer");
      if (mode === "offer" && now - lastTouch.current < 400) setMode("idle");
      // Con la pista abierta, un gesto en el tablero es que el jugador ya la usó.
      if (mode === "open" && lastTouch.current > openedAt.current + 600)
        close();
    }, 500);
    return () => clearInterval(id);
    // `close` sólo usa setters estables y refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, mode, lastTouch]);

  useEffect(() => {
    if (mode !== "offer") return;
    const id = setTimeout(() => {
      lastTouch.current = Date.now();
      setMode("idle");
    }, OFFER_MS);
    return () => clearTimeout(id);
  }, [mode, lastTouch]);

  // Si el nivel pasa a la tarjeta de cierre o vuelve la guía, la pista se guarda.
  useEffect(() => {
    if (!available && mode !== "idle") {
      setMode("idle");
      lesson?.showHint(undefined);
    }
  }, [available, mode, lesson]);

  const open = (): void => {
    const first = mode === "open" ? tier : 0;
    setTier(first);
    setMode("open");
    openedAt.current = Date.now();
    lesson?.clearMisses();
    lesson?.showHint(tiers[first]?.show);
    play("hint");
  };
  const more = (): void => {
    const next = Math.min(tier + 1, tiers.length - 1);
    setTier(next);
    openedAt.current = Date.now();
    lesson?.showHint(tiers[next]?.show);
    play("hint", { pitch: next * 2 });
  };
  function close(): void {
    setMode("idle");
    lastTouch.current = Date.now();
    lesson?.showHint(undefined);
  }

  // Tomi entra con un salto al ofrecer, y la lamparita late.
  const hop = useSharedValue(0);
  const glow = useSharedValue(0);
  useEffect(() => {
    if (mode === "offer" && !still) {
      hop.value = withSequence(
        withTiming(-14, { duration: 180, easing: Easing.out(Easing.quad) }),
        withSpring(0, theme.spring.settle),
      );
      glow.value = withRepeat(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(glow);
      glow.value = withTiming(0, { duration: theme.motion.quick });
    }
  }, [mode, still, hop, glow]);
  const hopStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hop.value }],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + 0.12 * glow.value }],
  }));

  if (!lesson || !available) return null;

  const narrow = width < 600;
  const size = narrow ? 52 : 64;
  const current = tiers[tier];

  return (
    <>
      {mode === "open" && current ? (
        <View style={styles.cardWrap} pointerEvents="box-none">
          <Animated.View
            style={[styles.card, { width: Math.min(680, width - 24) }]}
          >
            <View style={styles.cardHead}>
              <Tomi pose={current.pose} size={narrow ? 56 : 72} />
              <View style={styles.cardText}>
                <Text style={styles.eyebrow}>{current.title}</Text>
                <Text style={styles.body}>{current.text}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              {current.keyId ? (
                <GhostButton
                  small
                  label={t("ui.hint.openKey")}
                  onPress={() => current.keyId && onOpenKey(current.keyId)}
                />
              ) : null}
              {tier < tiers.length - 1 ? (
                <GhostButton small label={t("ui.hint.more")} onPress={more} />
              ) : null}
              <GhostButton small label={t("ui.hint.close")} onPress={close} />
            </View>
          </Animated.View>
        </View>
      ) : null}

      <View
        style={[styles.root, narrow && styles.rootNarrow]}
        pointerEvents="box-none"
      >
        <View style={styles.row} pointerEvents="box-none">
          <Pressable
            onPress={mode === "open" ? close : open}
            accessibilityRole="button"
            accessibilityLabel={t("ui.hint.ask")}
            hitSlop={8}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Animated.View style={hopStyle}>
              <Animated.View
                style={[
                  styles.ring,
                  { width: size + 14, height: size + 14, borderRadius: size },
                  ring,
                ]}
              />
              <View
                style={[
                  styles.button,
                  { width: size, height: size, borderRadius: size / 2 },
                  mode !== "idle" && styles.buttonOn,
                ]}
              >
                <Tomi
                  pose={mode === "idle" ? "think" : "icon"}
                  size={size - 6}
                  float={mode !== "idle"}
                />
              </View>
            </Animated.View>
          </Pressable>
          {mode === "offer" ? (
            <Pressable onPress={open} style={styles.bubble}>
              <Text style={styles.bubbleText}>{t("ui.hint.offer")}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 16,
    bottom: 16,
    zIndex: 6,
    alignItems: "flex-start",
    gap: theme.space[2],
  },
  // A la altura del cartel de la guía, debajo del título: arriba del tablero, nunca encima.
  cardWrap: {
    position: "absolute",
    top: 62,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 7,
  },
  rootNarrow: { left: 10, bottom: 10 },
  // La burbuja sale arriba del botón y no al costado: al costado tapaba las
  // fichas del teclado en el teléfono, justo cuando el jugador iba a contestar.
  row: { flexDirection: "column-reverse", alignItems: "flex-start", gap: theme.space[1] },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.color.glass,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    overflow: "hidden",
  },
  buttonOn: { borderColor: theme.color.gold },
  ring: {
    position: "absolute",
    left: -7,
    top: -7,
    borderWidth: 2,
    borderColor: theme.color.gold,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  bubble: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1] + 2,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.glass,
    borderWidth: 1,
    borderColor: theme.color.gold,
  },
  bubbleText: { color: theme.color.ink, fontSize: 14, fontWeight: "600" },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.panel,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    borderTopColor: "rgba(255, 209, 102, 0.45)",
    padding: theme.space[3],
    gap: theme.space[2],
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: theme.space[2] },
  cardText: { flex: 1, gap: 4 },
  eyebrow: {
    color: theme.color.gold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  body: { color: theme.color.ink, fontSize: 15, lineHeight: 21 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: theme.space[1],
  },
});
