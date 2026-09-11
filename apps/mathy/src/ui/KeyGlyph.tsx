/**
 * Las llaves: una idea por nivel, con un dibujo chico que la cuenta sin
 * palabras.
 *
 * Los dibujos son vistas y no un lienzo. La regla es un solo `<Canvas>` por
 * pantalla, y la llave aparece en la chuleta, que convive con el de la
 * actividad.
 *
 * Tres estados, y cada uno dice algo distinto:
 * - por descubrir (`locked`): el contorno de una llave, sin su dibujo. Se ve que
 *   ahí va una llave, no qué idea es: esa la descubre el juego.
 * - ganada: el dibujo de la idea.
 * - ganada y a la vista (`gold`): con el borde y la luz dorados de lo aprendido
 *   (N §2.2). Es como se ve en el llavero y en el sendero.
 */
import { useEffect, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LESSON_GLYPHS } from "../lessons/index.ts";
import type { KeyDrawing, KeyGlyphName } from "../lessons/types.ts";
import { theme } from "./theme.ts";

const DRAWINGS: Record<KeyGlyphName, KeyDrawing> = {
  // Dos filas con puentes; la de arriba tiene una sin pareja.
  pair: {
    dots: [[9, 11, 4], [20, 11, 4], [31, 11, 4, true], [9, 29, 4], [20, 29, 4]],
    bars: [[8, 15, 2, 10], [19, 15, 2, 10]],
  },
  // Tres y una más que entra con su signo.
  plusOne: {
    dots: [[7, 26, 3.5], [16, 26, 3.5], [25, 26, 3.5], [34, 26, 3.5, true]],
    bars: [[33, 8, 2, 9], [29.5, 11.5, 9, 2]],
  },
  // Las mismas tres, en fila y en montón.
  shuffle: {
    dots: [[10, 10, 3.5], [20, 10, 3.5], [30, 10, 3.5], [15, 26, 3.5, true], [25, 26, 3.5, true], [20, 34, 3.5, true]],
  },
  travel: { dots: [], card: "3" },
  // Cada una con su marca, ninguna dos veces.
  oneByOne: {
    dots: [[7, 14, 3.5], [16, 14, 3.5], [25, 14, 3.5], [34, 14, 3.5, true]],
    bars: [[6, 22, 2, 8], [15, 22, 2, 8], [24, 22, 2, 8], [33, 22, 2, 8]],
  },
  // Tres grandes y tres chicas: el mismo número.
  sameCount: {
    dots: [[9, 12, 5.5], [20, 12, 5.5], [31, 12, 5.5], [12, 31, 2.5, true], [20, 31, 2.5, true], [28, 31, 2.5, true]],
  },
};

/**
 * El dibujo de una llave: primero los de acá, después los que trae cada lección.
 * Un nombre que no existe dibuja la llave de a uno, que es genérica: la llave se
 * sigue viendo y el error se nota en la chuleta, no rompe la pantalla.
 */
function drawingOf(name: string): KeyDrawing {
  return (DRAWINGS as Record<string, KeyDrawing>)[name] ?? LESSON_GLYPHS[name] ?? DRAWINGS.oneByOne;
}

export function KeyGlyph({
  name,
  locked = false,
  size = 48,
  gold = false,
  warm = false,
}: {
  /** Un dibujo base o uno que trae la lección de su nodo (`glyphs`). */
  readonly name: string;
  readonly locked?: boolean;
  readonly size?: number;
  /** Ganada y a la vista: borde y luz dorados. */
  readonly gold?: boolean;
  /** Por descubrir, pero la que se juega ahora: el contorno toma un poco de dorado. */
  readonly warm?: boolean;
}) {
  const s = size / 40;
  if (locked) {
    return (
      <View style={[styles.box, styles.boxLocked, warm && styles.boxWarm, { width: size, height: size }]}>
        <KeyShape s={s} color={warm ? "rgba(255, 209, 102, 0.75)" : theme.color.inkFaint} />
      </View>
    );
  }
  const d = drawingOf(name);
  return (
    <View style={[styles.box, gold && styles.boxGold, { width: size, height: size }]}>
      {d.bars?.map(([x, y, w, h], i) => (
        <View
          key={`b${i}`}
          style={[styles.bar, { left: x * s, top: y * s, width: w * s, height: h * s }]}
        />
      ))}
      {d.dots.map(([x, y, r, on], i) => (
        <View
          key={`d${i}`}
          style={{
            position: "absolute",
            left: (x - r) * s,
            top: (y - r) * s,
            width: 2 * r * s,
            height: 2 * r * s,
            borderRadius: r * s,
            backgroundColor: on ? theme.color.accent : theme.color.inkDim,
          }}
        />
      ))}
      {d.card ? (
        <View style={[styles.card, { left: 8 * s, top: 6 * s, width: 24 * s, height: 28 * s }]}>
          <Text style={[styles.numeral, { fontSize: 17 * s }]}>{d.card}</Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * El contorno de una llave, sobre la caja de 40 × 40: el ojo a la izquierda, la
 * caña y dos dientes. Es la forma de "acá va una llave", sin decir cuál.
 */
function KeyShape({ s, color }: { readonly s: number; readonly color: string }) {
  const line = Math.max(1.5, 2.6 * s);
  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.abs,
          { left: 5 * s, top: 13 * s, width: 14 * s, height: 14 * s, borderRadius: 7 * s, borderWidth: line, borderColor: color },
        ]}
      />
      <View style={[styles.abs, { left: 18 * s, top: 20 * s - line / 2, width: 17 * s, height: line, backgroundColor: color }]} />
      <View style={[styles.abs, { left: 27 * s, top: 20 * s, width: line, height: 5 * s, backgroundColor: color }]} />
      <View style={[styles.abs, { left: 32 * s, top: 20 * s, width: line, height: 7 * s, backgroundColor: color }]} />
    </View>
  );
}

/**
 * La luz apenas visible detrás de la llave por descubrir del nivel que se va a
 * jugar: respira despacio, como la piedra que sigue en el sendero. Con
 * "reducir movimiento" queda quieta, a media luz.
 */
function Glow({ size, children }: { readonly size: number; readonly children: ReactNode }) {
  const calm = useReducedMotion();
  const k = useSharedValue(0.5);
  useEffect(() => {
    if (calm) return;
    k.value = 0;
    k.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(k);
  }, [k, calm]);
  const halo = useAnimatedStyle(() => ({
    opacity: 0.12 + 0.28 * k.value,
    transform: [{ scale: 1 + 0.12 * k.value }],
  }));
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[styles.glow, { borderRadius: theme.radius.token + 4 }, halo]} />
      {children}
    </View>
  );
}

/**
 * La tarjeta de una llave. `locked` es la silueta de una que todavía no se
 * ganó: se ve su lugar, no su contenido, igual que las teclas futuras de la
 * calculadora. `glow` le pone la luz que respira: es la que se gana ahora.
 */
export function KeyCard({
  glyph,
  title,
  body,
  tag,
  locked = false,
  highlight = false,
  glow = false,
  footer,
}: {
  readonly glyph: string;
  readonly title: string;
  readonly body?: string;
  readonly tag?: string;
  readonly locked?: boolean;
  readonly highlight?: boolean;
  readonly glow?: boolean;
  readonly footer?: ReactNode;
}) {
  const icon = <KeyGlyph name={glyph} locked={locked} warm={glow && locked} gold={highlight && !locked} />;
  return (
    <View style={[styles.keyCard, locked && styles.keyCardLocked, glow && styles.keyCardGlow, highlight && styles.keyCardOn]}>
      {glow ? <Glow size={48}>{icon}</Glow> : icon}
      <View style={styles.keyText}>
        {tag ? <Text style={[styles.tag, highlight && styles.tagGold]}>{tag}</Text> : null}
        <Text style={[styles.title, locked && styles.titleLocked]}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: "absolute" },
  box: {
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.bg,
    borderWidth: 1,
    borderColor: theme.color.line,
    position: "relative",
    overflow: "hidden",
  },
  boxLocked: { borderStyle: "dashed", backgroundColor: "rgba(12, 22, 36, 0.6)" },
  boxWarm: { borderColor: "rgba(255, 209, 102, 0.55)" },
  boxGold: {
    borderWidth: 1.5,
    borderColor: theme.color.gold,
    backgroundColor: "#1a2331",
    shadowColor: theme.color.gold,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    overflow: "visible",
  },
  bar: { position: "absolute", backgroundColor: theme.color.ok, borderRadius: 1 },
  card: {
    position: "absolute",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  numeral: { color: theme.color.accent, fontVariant: ["tabular-nums"] },
  glow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    backgroundColor: theme.color.gold,
    shadowColor: theme.color.gold,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  keyCard: {
    flexDirection: "row",
    gap: theme.space[3],
    alignItems: "flex-start",
    padding: theme.space[3],
    borderRadius: theme.radius.token,
    borderWidth: 1,
    borderColor: theme.color.line,
    backgroundColor: theme.color.surfaceHigh,
  },
  keyCardLocked: { borderStyle: "dashed", backgroundColor: "transparent" },
  keyCardGlow: { borderColor: "rgba(255, 209, 102, 0.4)" },
  keyCardOn: { borderColor: theme.color.gold, backgroundColor: "rgba(255, 209, 102, 0.06)" },
  keyText: { flex: 1, gap: 4 },
  tag: { color: theme.color.ok, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase" },
  tagGold: { color: theme.color.gold },
  title: { color: theme.color.ink, fontSize: 16, lineHeight: 21 },
  titleLocked: { color: theme.color.inkDim },
  body: { color: theme.color.inkDim, fontSize: 14, lineHeight: 20 },
});
