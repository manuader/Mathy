/**
 * Las llaves: una idea por nivel, con un dibujo chico que la cuenta sin
 * palabras.
 *
 * Los dibujos son vistas y no un lienzo. La regla es un solo `<Canvas>` por
 * pantalla, y la llave aparece en la chuleta, que convive con el de la
 * actividad.
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { KeyGlyphName } from "../lessons/types.ts";
import { theme } from "./theme.ts";

/** [x, y, radio, resaltado] sobre una caja de 40 × 40. */
type Dot = readonly [number, number, number, boolean?];
/** [x, y, ancho, alto]. */
type Bar = readonly [number, number, number, number];

interface Drawing {
  readonly dots: readonly Dot[];
  readonly bars?: readonly Bar[];
  /** Una tarjeta con un numeral: el número que viaja. */
  readonly card?: string;
}

const DRAWINGS: Record<KeyGlyphName, Drawing> = {
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

export function KeyGlyph({
  name,
  locked = false,
  size = 48,
}: {
  readonly name: KeyGlyphName;
  readonly locked?: boolean;
  readonly size?: number;
}) {
  const s = size / 40;
  if (locked) {
    return (
      <View style={[styles.box, styles.boxLocked, { width: size, height: size }]}>
        <Text style={[styles.question, { fontSize: 18 * s }]}>?</Text>
      </View>
    );
  }
  const d = DRAWINGS[name];
  return (
    <View style={[styles.box, { width: size, height: size }]}>
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
 * La tarjeta de una llave. `locked` es la silueta de una que todavía no se
 * ganó: se ve su lugar, no su contenido, igual que las teclas futuras de la
 * calculadora.
 */
export function KeyCard({
  glyph,
  title,
  body,
  tag,
  locked = false,
  highlight = false,
  footer,
}: {
  readonly glyph: KeyGlyphName;
  readonly title: string;
  readonly body?: string;
  readonly tag?: string;
  readonly locked?: boolean;
  readonly highlight?: boolean;
  readonly footer?: ReactNode;
}) {
  return (
    <View style={[styles.keyCard, locked && styles.keyCardLocked, highlight && styles.keyCardOn]}>
      <KeyGlyph name={glyph} locked={locked} />
      <View style={styles.keyText}>
        {tag ? <Text style={styles.tag}>{tag}</Text> : null}
        <Text style={[styles.title, locked && styles.titleLocked]}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.bg,
    borderWidth: 1,
    borderColor: theme.color.line,
    position: "relative",
    overflow: "hidden",
  },
  boxLocked: { borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  question: { color: theme.color.inkFaint },
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
  keyCardOn: { borderColor: theme.color.accent },
  keyText: { flex: 1, gap: 4 },
  tag: { color: theme.color.ok, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase" },
  title: { color: theme.color.ink, fontSize: 16, lineHeight: 21 },
  titleLocked: { color: theme.color.inkDim },
  body: { color: theme.color.inkDim, fontSize: 14, lineHeight: 20 },
});
