/**
 * El movimiento del recorrido entre niveles: cómo entra una pieza, cómo invita
 * lo que sigue, cómo festeja Lumi y cómo se enciende una marca de ronda.
 *
 * Cada movimiento dice algo verdadero. `Rise`: esto acaba de llegar. `Invite`:
 * esto es lo que sigue, y respira hasta que lo tocás. `Hop`: pasó algo (se
 * ganó una llave, la guía dio vuelta la hoja). `RoundMarks`: esta ronda quedó
 * hecha, y la marca salta una sola vez al encenderse.
 *
 * Todo corre en Reanimated, fuera del hilo de JS: los valores se fijan una vez
 * (al montar o cuando cambia lo que cuentan) y el resto lo hace el resorte. Nada
 * se monta ni se desmonta para animar.
 *
 * Con "reducir movimiento" todo queda en su estado final y quieto (N §2.5): la
 * información nunca depende de una animación que se puede apagar.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { theme } from "./theme.ts";

/** El resorte de entrada: pasa un poco y vuelve, como algo que llega a su lugar. */
export const ENTER = { damping: 13, stiffness: 170, mass: 0.8 } as const;

/** Una pieza que entra con resorte, un rato después de la anterior. */
export function Rise({
  delay = 0,
  from = 18,
  children,
  style,
}: {
  readonly delay?: number;
  /** Desde cuántos puntos más abajo sube. */
  readonly from?: number;
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}) {
  const calm = useReducedMotion();
  const k = useSharedValue(calm ? 1 : 0);
  useEffect(() => {
    if (calm) {
      k.value = 1;
      return;
    }
    k.value = withDelay(delay, withSpring(1, ENTER));
  }, [k, delay, calm]);
  const anim = useAnimatedStyle(() => ({
    // El resorte pasa de 1 al llegar: la opacidad se recorta, el salto no.
    opacity: Math.min(1, Math.max(0, k.value * 1.6)),
    transform: [{ translateY: (1 - k.value) * from }, { scale: 0.94 + 0.06 * k.value }],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

/**
 * Lo que sigue: respira despacio y tiene una luz dorada detrás, para que se vea
 * desde lejos. Dorado porque lleva a la próxima llave (N §2.2). No parpadea ni
 * se sacude: invita, no apura.
 */
export function Invite({
  children,
  delay = 0,
  style,
  strength = 1,
}: {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly style?: StyleProp<ViewStyle>;
  /** Menos de 1 para lo que invita sin ser el botón principal (una píldora). */
  readonly strength?: number;
}) {
  const calm = useReducedMotion();
  const k = useSharedValue(0);
  useEffect(() => {
    if (calm) return;
    k.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(k);
  }, [k, delay, calm]);
  const halo = useAnimatedStyle(() => ({
    opacity: (0.14 + 0.3 * k.value) * strength,
    transform: [{ scaleX: 1 + 0.035 * k.value }, { scaleY: 1 + 0.2 * k.value }],
  }));
  const body = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.028 * k.value * strength }] }));
  return (
    <View style={style}>
      <Animated.View style={[styles.halo, halo]} />
      <Animated.View style={body}>{children}</Animated.View>
    </View>
  );
}

/**
 * Un salto, cada vez que cambia `trigger` (y al montar, después de `delay`).
 * Es la presencia de Lumi y Tomi: reaccionan a lo que acaba de pasar.
 */
export function Hop({
  trigger,
  delay = 0,
  height = 12,
  children,
}: {
  readonly trigger: string | number;
  readonly delay?: number;
  readonly height?: number;
  readonly children: ReactNode;
}) {
  const calm = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (calm) return;
    y.value = withDelay(
      delay,
      withSequence(
        withTiming(-height, { duration: 160, easing: Easing.out(Easing.quad) }),
        withSpring(0, theme.spring.settle),
      ),
    );
  }, [y, trigger, delay, height, calm]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: 1 - (0.05 * y.value) / height }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const OFF = "rgba(255, 255, 255, 0.16)";

/**
 * Una marca por ronda. La que se completa se enciende en menta con un salto y
 * un anillo que se abre una vez: esa ronda está hecha. La ronda en juego tiene
 * el borde dorado: es la que sigue.
 */
export function RoundMarks({
  round,
  rounds,
  size = 10,
}: {
  readonly round: number;
  readonly rounds: number;
  readonly size?: number;
}) {
  return (
    <View style={[styles.marks, { gap: Math.round(size * 0.6) }]}>
      {Array.from({ length: rounds }, (_, i) => (
        <Mark key={i} on={i < round} now={i === round} size={size} />
      ))}
    </View>
  );
}

function Mark({ on, now, size }: { readonly on: boolean; readonly now: boolean; readonly size: number }) {
  const calm = useReducedMotion();
  const lit = useSharedValue(on ? 1 : 0);
  const pop = useSharedValue(0);
  const ping = useSharedValue(1);
  // Solo lo que cambia mientras se mira se anima: al montar, cada marca ya
  // está como tiene que estar.
  const was = useRef(on);
  useEffect(() => {
    if (was.current === on) return;
    was.current = on;
    if (calm) {
      lit.value = on ? 1 : 0;
      return;
    }
    lit.value = withTiming(on ? 1 : 0, { duration: theme.motion.quick });
    if (!on) return;
    pop.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
      withSpring(0, theme.spring.settle),
    );
    ping.value = 0;
    ping.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.quad) });
  }, [on, calm, lit, pop, ping]);
  const dot = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(lit.value, [0, 1], [OFF, theme.color.ok]),
    transform: [{ translateY: -5 * pop.value }, { scale: 1 + 0.45 * pop.value }],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: ping.value >= 1 ? 0 : 0.9 * (1 - ping.value),
    transform: [{ scale: 1 + 1.4 * ping.value }],
  }));
  const r = size / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[styles.ping, { width: size, height: size, borderRadius: r }, ring]} />
      <Animated.View
        style={[{ width: size, height: size, borderRadius: r }, now && !on && styles.markNow, dot]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.radius.full,
    backgroundColor: theme.color.gold,
    shadowColor: theme.color.gold,
    shadowOpacity: 0.9,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    pointerEvents: "none",
  },
  marks: { flexDirection: "row", alignItems: "center" },
  ping: { position: "absolute", borderWidth: 2, borderColor: theme.color.ok },
  markNow: { borderWidth: 2, borderColor: theme.color.gold },
});
