/**
 * El mundo detrás del lienzo: el paisaje del área, su luz y sus luciérnagas.
 *
 * El paisaje es el lugar donde vive el concepto, no una decoración: cada área
 * del curriculum es un lugar, y volver a un nodo es volver a ese lugar. Por eso
 * cambia con el área y nunca con el nivel.
 *
 * Tres reglas, las de N §2.2:
 *
 * 1. El centro es del juego. El paisaje se oscurece hacia el centro y abajo,
 *    donde está el tablero, para que el color de la matemática sea lo más vivo
 *    de la pantalla.
 * 2. No se toca. Nada de acá recibe un toque (`pointerEvents: "none"`).
 * 3. Si la imagen del área no existe, el cielo y el suelo del área se dibujan
 *    con franjas: el juego nunca espera al arte.
 */
import { useEffect, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { worldArt, type WorldKey } from "../art/index.ts";
import { AREAS, theme } from "./theme.ts";

const BANDS = 14;
const FIREFLIES = 9;

export function World({ area, calm = 0.35 }: { readonly area: WorldKey; readonly calm?: number }) {
  const art = worldArt(area);
  const palette = AREAS[area === "world" ? "found" : area];
  const bands = useMemo(
    () => Array.from({ length: BANDS }, (_, i) => mix(palette.sky, palette.ground, i / (BANDS - 1))),
    [palette],
  );

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
      {art !== undefined ? (
        // Ancho y alto explícitos: en web, `Image` toma el tamaño natural del
        // archivo si no se lo pisa, y un paisaje de 1024 px dejaba media
        // pantalla sin mundo aunque estuviera anclado a los cuatro bordes.
        <Image source={art} resizeMode="cover" style={[StyleSheet.absoluteFill, styles.fill]} />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          {bands.map((c, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: c }} />
          ))}
          <Hills color={palette.ground} hue={palette.hue} />
        </View>
      )}
      {/* El velo que devuelve el centro al juego: parejo arriba, más oscuro abajo. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(7, 14, 24, ${calm})` }]} />
      <View style={styles.floor} />
      {Array.from({ length: FIREFLIES }, (_, i) => (
        <Firefly key={i} seed={i} />
      ))}
    </View>
  );
}

/** Dos colinas del tono del área: lo mínimo para que el reemplazo sea un lugar. */
function Hills({ color, hue }: { readonly color: string; readonly hue: string }) {
  return (
    <>
      <View style={[styles.hill, { left: "-15%", width: "60%", backgroundColor: mix(color, hue, 0.12) }]} />
      <View style={[styles.hill, { right: "-20%", width: "70%", bottom: "-22%", backgroundColor: mix(color, hue, 0.08) }]} />
    </>
  );
}

/** Una luciérnaga: sube lento, titila y vuelve. Es la luz del mapa, en pequeño. */
function Firefly({ seed }: { readonly seed: number }) {
  const x = rand(seed * 3.1) * 100;
  const y = 25 + rand(seed * 7.7) * 60;
  const k = useSharedValue(0);
  const glow = useSharedValue(0);
  useEffect(() => {
    const dur = 5200 + rand(seed * 1.3) * 4200;
    k.value = withDelay(seed * 380, withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true));
    glow.value = withDelay(seed * 210, withRepeat(withTiming(1, { duration: 1400 + seed * 90 }), -1, true));
    return () => {
      cancelAnimation(k);
      cancelAnimation(glow);
    };
  }, [k, glow, seed]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + 0.6 * glow.value,
    transform: [{ translateY: -26 * k.value }, { translateX: 10 * Math.sin(k.value * Math.PI * 2) }],
  }));
  return <Animated.View style={[styles.firefly, { left: `${x}%`, top: `${y}%` }, style]} />;
}

/** Pseudoazar estable por semilla: las luciérnagas no cambian de lugar al rerenderizar. */
function rand(seed: number): number {
  const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function mix(a: string, b: string, t: number): string {
  const pa = hex(a);
  const pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function hex(c: string): number[] {
  const h = c.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

const styles = StyleSheet.create({
  root: { pointerEvents: "none", backgroundColor: theme.color.bgDeep, overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
  hill: {
    position: "absolute",
    bottom: "-30%",
    height: "70%",
    borderTopLeftRadius: 9999,
    borderTopRightRadius: 9999,
  },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
    backgroundColor: "rgba(5, 10, 18, 0.35)",
  },
  firefly: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.color.gold,
    shadowColor: theme.color.gold,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
