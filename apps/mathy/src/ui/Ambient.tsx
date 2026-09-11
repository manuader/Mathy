/**
 * Lo que se mueve en el fondo: nubes, pájaros, faroles, hojas, engranajes.
 *
 * Todo en la periferia y nada en el centro. El centro de la pantalla es donde el
 * juego explica (el tablero, la guía, la línea de abajo), y el ojo se va detrás
 * de lo que se mueve: un pájaro que cruza el tablero compite con la pieza que el
 * jugador tiene que mirar. Por eso cada actor tiene un carril y de ahí no sale:
 *
 * - `sky`: la franja de arriba. Cruzan nubes, pájaros, un globo.
 * - `left` / `right`: los costados. Suben faroles, caen hojas, revolotean
 *   mariposas, giran engranajes asomados desde el borde.
 * - `cornerLeft` / `cornerRight`: las esquinas de abajo. Se mece un barquito.
 *
 * En pantallas angostas los costados casi no existen: los actores de costado se
 * achican y se pegan al borde, medio afuera.
 *
 * Todo es lento (ningún ciclo dura menos de 14 s) y va debajo del velo del
 * mundo, así que se oscurece con el paisaje. Con "reducir movimiento" nada se
 * mueve (N §2.5): cada actor queda quieto en su carril. Si un sprite no tiene
 * imagen, ese actor no aparece: el fondo nunca espera al arte.
 */
import { useEffect, useState } from "react";
import { Image, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ambientArt, type AmbientKey, type WorldKey } from "../art/index.ts";

type Lane = "sky" | "left" | "right" | "cornerLeft" | "cornerRight";
type Motion = "drift" | "rise" | "fall" | "flutter" | "spin" | "bob";

interface Actor {
  readonly key: AmbientKey;
  readonly lane: Lane;
  readonly motion: Motion;
  /** Alto del sprite, en fracción del lado corto de la pantalla. */
  readonly size: number;
  /** Segundos por ciclo. */
  readonly period: number;
  /** Dónde arranca el ciclo (0 a 1), para que no salgan todos juntos. */
  readonly phase: number;
  /** Dónde vive dentro de su carril (0 a 1): qué tan alto en el cielo o en el costado. */
  readonly at: number;
  readonly opacity?: number;
  /** Los que cruzan van al revés; los que giran, en el otro sentido. */
  readonly reverse?: boolean;
}

/** Narrow: por debajo de este ancho los costados son una franja de pocos píxeles. */
const NARROW = 700;

const SKY: readonly Actor[] = [
  { key: "cloud", lane: "sky", motion: "drift", size: 0.1, period: 95, phase: 0.18, at: 0.25, opacity: 0.75 },
  { key: "cloud", lane: "sky", motion: "drift", size: 0.07, period: 130, phase: 0.64, at: 0.8, opacity: 0.55, reverse: true },
  { key: "birds", lane: "sky", motion: "drift", size: 0.05, period: 52, phase: 0.42, at: 0.5, opacity: 0.8 },
];

const LANTERNS: readonly Actor[] = [
  { key: "lantern", lane: "right", motion: "rise", size: 0.07, period: 38, phase: 0.3, at: 0 },
];

/** Qué se mueve en cada mundo. Las áreas sin nodos todavía usan el cielo y un farol. */
const CAST: Record<WorldKey, readonly Actor[]> = {
  found: [
    ...SKY,
    { key: "butterfly", lane: "left", motion: "flutter", size: 0.05, period: 22, phase: 0.1, at: 0.35 },
    { key: "butterfly", lane: "right", motion: "flutter", size: 0.045, period: 26, phase: 0.55, at: 0.7 },
    { key: "leaf", lane: "left", motion: "fall", size: 0.035, period: 24, phase: 0.6, at: 0 },
    { key: "leaf", lane: "right", motion: "fall", size: 0.03, period: 29, phase: 0.2, at: 0 },
    ...LANTERNS,
  ],
  arith: [
    ...SKY,
    { key: "leaf", lane: "left", motion: "fall", size: 0.035, period: 26, phase: 0.3, at: 0 },
    { key: "leaf", lane: "right", motion: "fall", size: 0.03, period: 31, phase: 0.75, at: 0 },
    { key: "boat", lane: "cornerLeft", motion: "bob", size: 0.06, period: 18, phase: 0, at: 0, opacity: 0.9 },
  ],
  prealg: [
    ...SKY,
    { key: "lantern", lane: "left", motion: "rise", size: 0.07, period: 40, phase: 0.1, at: 0 },
    { key: "lantern", lane: "left", motion: "rise", size: 0.05, period: 46, phase: 0.6, at: 0 },
    { key: "lantern", lane: "right", motion: "rise", size: 0.065, period: 43, phase: 0.35, at: 0 },
  ],
  alg: [
    SKY[0] as Actor,
    { key: "balloon", lane: "sky", motion: "drift", size: 0.1, period: 110, phase: 0.3, at: 0.55 },
    { key: "gear", lane: "left", motion: "spin", size: 0.24, period: 36, phase: 0, at: 0.35, opacity: 0.7 },
    { key: "gear", lane: "right", motion: "spin", size: 0.18, period: 28, phase: 0, at: 0.7, opacity: 0.7, reverse: true },
  ],
  world: [
    ...SKY,
    { key: "balloon", lane: "sky", motion: "drift", size: 0.09, period: 120, phase: 0.7, at: 0.6, reverse: true },
    { key: "lantern", lane: "left", motion: "rise", size: 0.06, period: 42, phase: 0.2, at: 0 },
    ...LANTERNS,
  ],
  calc: [...SKY, ...LANTERNS],
  linalg: [...SKY, ...LANTERNS],
  prob: [...SKY, ...LANTERNS],
  graph: [...SKY, ...LANTERNS],
  geom: [...SKY, ...LANTERNS],
  disc: [...SKY, ...LANTERNS],
};

export function Ambient({ area }: { readonly area: WorldKey }) {
  const still = useReducedMotion();
  const [box, setBox] = useState<{ readonly w: number; readonly h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent): void => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
  };
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {box
        ? CAST[area].map((actor, i) => (
            <ActorView key={`${actor.key}${i}`} actor={actor} w={box.w} h={box.h} still={still} />
          ))
        : null}
    </View>
  );
}

function ActorView({
  actor,
  w: W,
  h: H,
  still,
}: {
  readonly actor: Actor;
  readonly w: number;
  readonly h: number;
  readonly still: boolean;
}) {
  const art = ambientArt(actor.key);
  const t = useSharedValue(actor.phase);
  const has = art !== undefined;
  useEffect(() => {
    if (still || !has) return;
    const full = actor.period * 1000;
    // El primer tramo completa el ciclo desde donde arranca; después, ciclos
    // enteros desde cero. Así cada actor sale de un lugar distinto y no se
    // reinicia en el mismo punto.
    t.value = actor.phase;
    t.value = withSequence(
      withTiming(1, { duration: (1 - actor.phase) * full, easing: Easing.linear }),
      withRepeat(
        withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: full, easing: Easing.linear })),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(t);
  }, [t, still, has, actor.period, actor.phase]);

  const narrow = W < NARROW;
  const side = actor.lane !== "sky";
  const hpx = actor.size * Math.min(W, H) * (narrow && side ? 0.7 : 1);
  const wpx = hpx * (art?.aspect ?? 1);
  const style = useAnimatedStyle(() => place(actor, t.value, W, H, wpx, hpx, narrow));

  if (!art) return null;
  return (
    <Animated.View style={[styles.actor, { width: wpx, height: hpx }, style]}>
      <Image source={art.src} resizeMode="contain" style={{ width: wpx, height: hpx }} />
    </Animated.View>
  );
}

/** Dónde está un actor en el instante `t` del ciclo. Todo sale de su carril. */
function place(a: Actor, t: number, W: number, H: number, w: number, h: number, narrow: boolean) {
  "worklet";
  const TAU = Math.PI * 2;
  // El borde de un costado: adentro en pantallas anchas, medio afuera en angostas.
  const edge = a.lane === "left" ? (narrow ? -w * 0.35 : W * 0.03) : narrow ? W - w * 0.65 : W * 0.97 - w;
  let x = 0;
  let y = 0;
  let rot = 0;
  let sx = 1;
  let op = a.opacity ?? 0.85;
  switch (a.motion) {
    case "drift": {
      const p = a.reverse ? 1 - t : t;
      x = -w + p * (W + w * 2);
      y = H * (0.015 + 0.12 * a.at) + 4 * Math.sin(t * TAU * 3);
      break;
    }
    case "rise": {
      x = edge + 10 * Math.sin(t * TAU * 2);
      y = H * (0.92 - 0.75 * t) - h;
      op *= Math.max(0, Math.min(1, t / 0.12, (1 - t) / 0.15));
      break;
    }
    case "fall": {
      x = edge + 16 * Math.sin(t * TAU * 3);
      y = H * (0.12 + 0.8 * t);
      rot = 35 * Math.sin(t * TAU * 2);
      op *= Math.max(0, Math.min(1, t / 0.1, (1 - t) / 0.12));
      break;
    }
    case "flutter": {
      x = edge + 24 * Math.sin(t * TAU);
      y = H * (0.3 + 0.45 * a.at) + 30 * Math.sin(t * TAU * 2);
      // El aleteo: el ancho se cierra y se abre, rápido, sobre un vuelo lento.
      sx = 0.45 + 0.55 * Math.abs(Math.cos(t * TAU * 30));
      break;
    }
    case "spin": {
      x = a.lane === "left" ? -w * 0.5 : W - w * 0.5;
      y = H * (0.3 + 0.45 * a.at);
      rot = (a.reverse ? -360 : 360) * t;
      break;
    }
    case "bob": {
      x = (a.lane === "cornerLeft" ? W * 0.04 : W * 0.96 - w) + 14 * Math.sin(t * TAU);
      y = H * 0.9 - h + 4 * Math.sin(t * TAU * 3);
      rot = 4 * Math.sin(t * TAU * 2);
      break;
    }
  }
  return {
    opacity: op,
    transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }, { scaleX: sx }],
  };
}

const styles = StyleSheet.create({
  actor: { position: "absolute", left: 0, top: 0 },
});
