/**
 * El frasco y el dado: la mecánica `urn_dice` de
 * [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * La estrena `arith.frac.parts_and_ratio` (nodo 8), pero la escena no es de ese
 * nodo: es de la mecánica, y la usan además los nodos 34 a 36 y casi toda el
 * área de probabilidad. Por eso acá no hay nada de fracciones escrito a mano.
 * Todo lo que cambia entre un nodo y otro entra por `UrnConfig`.
 *
 * **Cómo la configura un nodo.** Los campos, y qué nodo usa cada uno:
 *
 * - `urns`: uno o varios frascos con su composición. Con dos o más, la escena
 *   los pone lado a lado con sus columnas propias: eso es "elegir la bolsa con
 *   más rojas" de `found.cmp.likely_unlikely` y comparar bolsas del nodo 34.
 * - `source`: `"urn"` o `"die"`. El dado tira en vez de sacar y sus caras se
 *   apilan igual; nada más cambia, porque el invariante es el mismo.
 * - `shape`: `"ball"` o `"figure"`. Las figuras son el todo discreto que no es
 *   comida ni bolas del nivel 8, y funcionan igual.
 * - `skin`: las cuatro etapas de desvanecimiento de la mecánica en E0.
 *   `physical_draws` apila piezas; de `tally_bars` en adelante las piezas que
 *   salieron se dibujan como marcas de conteo y la columna se lee como barra.
 * - `highlighted`: qué color nombra la ficha. Es el único color que la llave
 *   del total distingue.
 * - `brace`: la llave que abarca **todas** las columnas. Es lo que impide leer
 *   la columna más alta como el todo, y por eso está por defecto.
 * - `revealAt`: cuántas piezas hacen falta para que la ficha aparezca. Con un
 *   número menor que el total, la urna se retira sola: en cuanto el jugador ve
 *   la ficha antes de terminar, deja de necesitar sacar.
 * - `refill`: el frasco se llena con la misma mezcla. Es
 *   `proportion_stable_in_long_run` hecho gesto: la ficha no se mueve.
 * - `chip` y `chipValue`: la ficha del costado. `dots` para los nodos que
 *   todavía no leen, `numerals` desde que hay numerales. La etapa
 *   `probability_notation` de E0 pide además `P(rojo) =` delante, que hoy no se
 *   dibuja porque el atlas de glifos no tiene ni `P` ni paréntesis de función:
 *   la ficha se muestra igual y la deuda queda anotada.
 * - `drawable`: si el jugador puede sacar. En falso las piezas ya están afuera,
 *   que es como se predice sin contar en `prob.basic.probability_as_proportion`.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. Las piezas están todas montadas desde el principio, las que
 *    no se usan con opacidad cero, y sacar una no monta ni desmonta nada.
 * 2. Lo que se repite y no se anima de a uno va en un solo `SkPath`: el frasco,
 *    la llave, la base de las columnas y los pips del dado son un trazo cada uno.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: la posición de una pieza se
 *    deriva de `drawn`, que es un `SharedValue`, y el toque solo lo incrementa.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Pieza máxima: más grande, un frasco de doce no entra en una columna. */
const MAX_PIECE = 15;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Las etapas de desvanecimiento de `urn_dice` en E0, en orden. */
export type UrnSkin =
  | "physical_draws"
  | "tally_bars"
  | "fraction_of_total"
  | "probability_notation";

export type UrnChip = "none" | "dots" | "numerals";
export type UrnSource = "urn" | "die";
export type UrnShape = "ball" | "figure";

/** Un frasco: cuántas piezas de cada color tiene. */
export interface UrnSpec {
  readonly id: string;
  /** El largo es cuántos colores hay; cada número, cuántas piezas de ese color. */
  readonly composition: readonly number[];
  /** Reclama atención: es el frasco que hay que elegir o el que se está usando. */
  readonly glow: boolean;
}

/** Todo lo que un nodo decide sobre el frasco. Un nodo que la reusa escribe uno. */
export interface UrnConfig {
  readonly urns: readonly UrnSpec[];
  readonly skin: UrnSkin;
  readonly source: UrnSource;
  readonly shape: UrnShape;
  /** Qué color nombra la ficha. */
  readonly highlighted: number;
  /** La llave que abarca todas las columnas: el todo es el frasco. */
  readonly brace: boolean;
  /** Cuántas piezas hacen falta para que la ficha aparezca. */
  readonly revealAt: number;
  /** El frasco se llena con la misma mezcla y la proporción no se mueve. */
  readonly refill: boolean;
  readonly chip: UrnChip;
  readonly chipValue: { readonly num: number; readonly den: number } | null;
  /** El jugador puede sacar. En falso, las piezas ya están afuera. */
  readonly drawable: boolean;
}

/** Dónde vive cada pieza de un frasco, adentro y afuera. */
export interface UrnJarLayout {
  readonly box: Box;
  /** El color de cada pieza montada. */
  readonly kind: readonly number[];
  /** Dónde está la pieza mientras sigue adentro. */
  readonly inside: readonly Spot[];
  /** Dónde queda cuando sale: una columna por color, apilada desde abajo. */
  readonly stack: readonly Spot[];
  /** Cuántas piezas tiene de verdad este frasco, sin contar el relleno. */
  readonly count: number;
  /** El pie de cada columna, para la llave del total. */
  readonly columns: readonly Spot[];
}

export interface UrnLayout {
  readonly piece: number;
  readonly jars: readonly UrnJarLayout[];
  readonly chip: { readonly x: number; readonly y: number; readonly size: number };
  /** La altura de la llave, debajo de los pies de las columnas. */
  readonly braceY: number;
}

/**
 * Los colores de las piezas. El resaltado es el acento del sistema; los demás
 * salen de la misma paleta y nunca de un arcoíris: [N] no admite estética
 * infantil, y dos colores que se distinguen alcanzan para contar.
 */
const KINDS = [theme.color.accent, theme.color.warn, theme.color.ok, theme.color.inkDim] as const;

export const urnColorOf = (kind: number): string =>
  KINDS[kind % KINDS.length] ?? theme.color.inkDim;

/**
 * En qué orden salen las piezas. No se sortea: se alterna por color, para que
 * el jugador vea la mezcla desde la primera y no una racha de un solo color que
 * le haga creer que el frasco es de ese color.
 */
function drawOrder(composition: readonly number[]): number[] {
  const porColor: number[][] = composition.map(() => []);
  let indice = 0;
  for (let k = 0; k < composition.length; k++) {
    for (let i = 0; i < (composition[k] as number); i++) (porColor[k] as number[]).push(indice++);
  }
  const out: number[] = [];
  let quedan = true;
  let vuelta = 0;
  while (quedan) {
    quedan = false;
    for (const fila of porColor) {
      const pieza = fila[vuelta];
      if (pieza !== undefined) {
        out.push(pieza);
        quedan = true;
      }
    }
    vuelta++;
  }
  return out;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, el toque sacaría del frasco
 * equivocado.
 */
export function urnLayout(
  config: UrnConfig,
  width: number,
  height: number,
  slots: number,
): UrnLayout {
  const n = Math.max(1, config.urns.length);
  const chipW = config.chip === "none" ? 0 : Math.min(width * 0.18, 110);
  const usable = width - chipW - 32;
  const celda = usable / n;
  const piece = Math.min(MAX_PIECE, celda * 0.09, height * 0.035);

  const jarW = Math.min(celda * 0.62, 150);
  const jarH = Math.min(height * 0.26, 150);
  const top = height * 0.1;
  const colTop = top + jarH + 30;
  const colStep = piece * 2.4;

  const jars: UrnJarLayout[] = config.urns.map((urn, u) => {
    const cx = 16 + celda * u + celda / 2;
    const box = { x: cx - jarW / 2, y: top, w: jarW, h: jarH };
    const total = urn.composition.reduce((s, c) => s + c, 0);
    // El relleno duplica la mezcla, así que las ranuras del frasco son el doble
    // de lo que tiene: montarlas desde el principio evita montar durante la
    // animación, que es lo que el modo retained prohíbe.
    const montadas = Math.min(slots, total * 2);
    const kind: number[] = [];
    for (let k = 0; k < urn.composition.length; k++) {
      for (let i = 0; i < (urn.composition[k] as number); i++) kind.push(k);
    }
    // La segunda tanda repite la mezcla exacta: eso es lo que hace que la
    // proporción no se mueva.
    const kinds = [...kind, ...kind].slice(0, montadas);

    const colores = urn.composition.length;
    const anchoCol = Math.min(celda / (colores + 1), piece * 3.2);
    const columns: Spot[] = [];
    for (let k = 0; k < colores; k++) {
      columns.push({ x: cx + (k - (colores - 1) / 2) * anchoCol, y: colTop });
    }

    const inside: Spot[] = [];
    const stack: Spot[] = [];
    const puestas = urn.composition.map(() => 0);
    for (let i = 0; i < kinds.length; i++) {
      const k = kinds[i] as number;
      // Adentro las piezas se acomodan en una cuadrícula floja: el frasco tiene
      // que verse lleno y no ordenado, porque ordenado ya sería la columna.
      const porFila = Math.max(2, Math.floor(jarW / (piece * 2.6)));
      const fila = Math.floor(i / porFila);
      const col = i % porFila;
      inside.push({
        x: box.x + jarW / 2 + (col - (porFila - 1) / 2) * piece * 2.4,
        y: box.y + jarH - piece * 1.6 - fila * piece * 2.2,
      });
      const altura = puestas[k] as number;
      puestas[k] = altura + 1;
      const base = columns[k] as Spot;
      stack.push({ x: base.x, y: base.y - piece - altura * colStep });
    }

    return { box, kind: kinds, inside, stack, count: total, columns };
  });

  const primero = jars[0] as UrnJarLayout;
  return {
    piece,
    jars,
    chip: {
      x: width - chipW / 2 - 10,
      y: primero.box.y + primero.box.h / 2,
      size: Math.min(chipW * 0.42, 32),
    },
    braceY: colTop + 16,
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Un numeral dibujado. Sale del mismo atlas que la ecuación del nodo 13, así
 * que el `3` de una ficha de fracción y el `3` de una ecuación son el mismo
 * objeto.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  for (const c of chars) advance += getGlyph(c)?.advance ?? 0.5;
  let x = cx - (advance * size) / 2;
  const baseline = cy + size * 0.333;
  for (const c of chars) {
    const glyph = getGlyph(c);
    const src = pathFor(c);
    if (glyph && src) {
      const copy = src.copy();
      copy.transform([size, 0, x, 0, size, baseline, 0, 0, 1]);
      target.addPath(copy);
    }
    x += (glyph?.advance ?? 0.5) * size;
  }
}

// --- Geometría ---------------------------------------------------------------

/** El frasco: un rectángulo con boca. El dado, un cuadrado con sus pips. */
function sourcePath(box: Box, source: UrnSource): { body: SkPath; pips: SkPath } {
  const body = Skia.Path.Make();
  const pips = Skia.Path.Make();
  if (source === "die") {
    const lado = Math.min(box.w, box.h);
    const x = box.x + (box.w - lado) / 2;
    body.addRRect(Skia.RRectXY(Skia.XYWHRect(x, box.y, lado, lado), lado * 0.16, lado * 0.16));
    const r = lado * 0.07;
    for (const [dx, dy] of [
      [-0.26, -0.26],
      [0.26, -0.26],
      [0, 0],
      [-0.26, 0.26],
      [0.26, 0.26],
    ] as const) {
      pips.addCircle(x + lado / 2 + dx * lado, box.y + lado / 2 + dy * lado, r);
    }
    return { body, pips };
  }
  const r = Math.min(14, box.w * 0.12);
  body.moveTo(box.x + box.w * 0.2, box.y);
  body.lineTo(box.x + box.w * 0.2, box.y + box.h * 0.12);
  body.lineTo(box.x, box.y + box.h * 0.3);
  body.lineTo(box.x, box.y + box.h - r);
  body.quadTo(box.x, box.y + box.h, box.x + r, box.y + box.h);
  body.lineTo(box.x + box.w - r, box.y + box.h);
  body.quadTo(box.x + box.w, box.y + box.h, box.x + box.w, box.y + box.h - r);
  body.lineTo(box.x + box.w, box.y + box.h * 0.3);
  body.lineTo(box.x + box.w * 0.8, box.y + box.h * 0.12);
  body.lineTo(box.x + box.w * 0.8, box.y);
  body.close();
  return { body, pips };
}

/**
 * La llave del total. Abarca todas las columnas de un frasco, y esa es toda su
 * razón de ser: el todo es el frasco y nunca la columna más alta.
 */
function bracePath(jar: UrnJarLayout, y: number, piece: number): SkPath {
  const p = Skia.Path.Make();
  const first = jar.columns[0];
  const last = jar.columns[jar.columns.length - 1];
  if (!first || !last) return p;
  const x0 = first.x - piece * 1.4;
  const x1 = last.x + piece * 1.4;
  const mid = (x0 + x1) / 2;
  p.moveTo(x0, y);
  p.lineTo(x0, y + 7);
  p.lineTo(mid, y + 7);
  p.lineTo(mid, y + 14);
  p.moveTo(mid, y + 7);
  p.lineTo(x1, y + 7);
  p.lineTo(x1, y);
  return p;
}

/** El pie de cada columna: la línea sobre la que se apila el conteo. */
function columnBase(jar: UrnJarLayout, piece: number): SkPath {
  const p = Skia.Path.Make();
  for (const c of jar.columns) {
    p.moveTo(c.x - piece * 1.2, c.y);
    p.lineTo(c.x + piece * 1.2, c.y);
  }
  return p;
}

/**
 * La ficha del costado: la barra de fracción con sus dos números. Es la misma
 * ficha que dibuja `tiles`, porque es el mismo número.
 */
function chipPath(
  spot: { x: number; y: number; size: number },
  value: { num: number; den: number },
  mode: UrnChip,
): { bar: SkPath; ink: SkPath } {
  const bar = Skia.Path.Make();
  const ink = Skia.Path.Make();
  const s = spot.size;
  const w = Math.max(s * 1.5, s * 0.5 * String(value.den).length + s);
  bar.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - w / 2, spot.y - 1.5, w, 3), 2, 2));
  if (mode === "numerals") {
    addGlyphs(ink, String(value.num), spot.x, spot.y - s * 0.72, s);
    addGlyphs(ink, String(value.den), spot.x, spot.y + s * 0.72, s);
  } else if (mode === "dots") {
    const dots = (count: number, cy: number): void => {
      const r = Math.min(s * 0.13, 5);
      const paso = r * 2.9;
      const filas = count <= 4 ? 1 : 2;
      const cols = filas === 1 ? count : Math.ceil(count / 2);
      for (let i = 0; i < count; i++) {
        const fila = filas === 1 ? 0 : Math.floor(i / cols);
        const col = filas === 1 ? i : i % cols;
        const enFila = filas === 1 ? count : Math.min(cols, count - fila * cols);
        ink.addCircle(
          spot.x + (col - (enFila - 1) / 2) * paso,
          cy + (fila - (filas - 1) / 2) * paso,
          r,
        );
      }
    };
    dots(value.num, spot.y - s * 0.72);
    dots(value.den, spot.y + s * 0.72);
  }
  return { bar, ink };
}

// --- Componente --------------------------------------------------------------

export interface UrnSceneProps {
  readonly config: UrnConfig;
  readonly layout: UrnLayout;
  /**
   * Cuántas piezas salieron ya, por frasco. Continuo, para que sacar una se
   * anime sin que nada vuelva al hilo de JavaScript.
   */
  readonly drawn: readonly SharedValue<number>[];
  /** El relleno con la misma mezcla, de 0 a 1. La ficha no se mueve. */
  readonly refill: SharedValue<number>;
  /** La ficha del costado, de 0 a 1. */
  readonly chip: SharedValue<number>;
  /** La llave que abarca el total, de 0 a 1. */
  readonly brace: SharedValue<number>;
  /** El latido de lo que reclama atención; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  /** Qué frasco tocó el jugador cuando hay más de uno, o -1. */
  readonly picked: number;
  readonly appear: SharedValue<number>;
}

export function UrnScene({
  config,
  layout,
  drawn,
  refill,
  chip,
  brace,
  hint,
  demo,
  picked,
  appear,
}: UrnSceneProps) {
  const jars = useMemo(
    () =>
      layout.jars.map((jar, u) => ({
        source: sourcePath(jar.box, config.source),
        base: columnBase(jar, layout.piece),
        brace: bracePath(jar, layout.braceY, layout.piece),
        order: drawOrder(config.urns[u]?.composition ?? []),
      })),
    [layout, config.source, config.urns],
  );

  const chipGeom = useMemo(
    () => (config.chipValue ? chipPath(layout.chip, config.chipValue, config.chip) : null),
    [layout.chip, config.chipValue, config.chip],
  );

  // De `tally_bars` en adelante la pieza que salió deja de ser una bola y pasa
  // a ser una marca de conteo: es la misma cantidad, escrita más corto.
  const marca = config.skin !== "physical_draws";
  const pieceGeom = useMemo(() => {
    const p = Skia.Path.Make();
    const r = layout.piece;
    if (config.shape === "figure") p.addRect(Skia.XYWHRect(-r, -r, r * 2, r * 2));
    else p.addCircle(0, 0, r);
    const mark = Skia.Path.Make();
    mark.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 1.1, -r * 0.4, r * 2.2, r * 0.8), 2, 2));
    return { ball: p, mark };
  }, [layout.piece, config.shape]);

  const hand = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 13);
    return dot;
  }, []);

  const primero = layout.jars[0];
  const handFrom = primero?.inside[jars[0]?.order[0] ?? 0] ?? { x: 0, y: 0 };
  const handTo = primero?.stack[jars[0]?.order[0] ?? 0] ?? { x: 0, y: 0 };
  const handT = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, demo.value));
    const t = c * c * (3 - 2 * c);
    return [
      { translateX: handFrom.x + (handTo.x - handFrom.x) * t },
      { translateY: handFrom.y + (handTo.y - handFrom.y) * t },
    ];
  }, [handFrom, handTo]);
  const handO = useDerivedValue(() => hint.value * 0.5 * Math.sin(demo.value * Math.PI));

  return (
    <Group opacity={appear}>
      {layout.jars.map((jar, u) => {
        const geom = jars[u];
        const sv = drawn[u];
        if (!geom || !sv) return null;
        const elegido = picked === u;
        const resalta = config.urns[u]?.glow === true;
        return (
          <Group key={config.urns[u]?.id ?? u}>
            <JarBody
              body={geom.source.body}
              pips={geom.source.pips}
              glow={resalta}
              chosen={elegido}
              hint={hint}
            />
            <Path
              path={geom.base}
              color={theme.color.inkFaint}
              style="stroke"
              strokeWidth={STROKE}
            />
            {config.brace ? (
              <Group opacity={brace}>
                <Path
                  path={geom.brace}
                  color={theme.color.inkDim}
                  style="stroke"
                  strokeWidth={2}
                />
              </Group>
            ) : null}
            {jar.kind.map((kind, i) => {
              const salida = geom.order.indexOf(i % Math.max(jar.count, 1));
              // Las piezas del relleno salen detrás de las originales y solo
              // cuando el frasco se vuelve a llenar.
              const extra = i >= jar.count;
              return (
                <Piece
                  key={i}
                  ball={pieceGeom.ball}
                  mark={pieceGeom.mark}
                  asMark={marca}
                  from={jar.inside[i] ?? { x: 0, y: 0 }}
                  to={jar.stack[i] ?? { x: 0, y: 0 }}
                  at={(extra ? jar.count : 0) + (salida < 0 ? i : salida)}
                  color={urnColorOf(kind)}
                  dim={kind !== config.highlighted}
                  extra={extra}
                  drawn={sv}
                  refill={refill}
                />
              );
            })}
          </Group>
        );
      })}

      {chipGeom ? (
        <Group opacity={chip}>
          <Path path={chipGeom.bar} color={theme.color.accent} />
          <Path path={chipGeom.ink} color={theme.color.ink} />
        </Group>
      ) : null}

      {config.drawable ? (
        <Group transform={handT} opacity={handO}>
          <Path path={hand} color={theme.color.ink} style="stroke" strokeWidth={2} />
        </Group>
      ) : null}
    </Group>
  );
}

/** El frasco o el dado. Late mientras reclama que lo toquen. */
function JarBody({
  body,
  pips,
  glow,
  chosen,
  hint,
}: {
  readonly body: SkPath;
  readonly pips: SkPath;
  readonly glow: boolean;
  readonly chosen: boolean;
  readonly hint: SharedValue<number>;
}) {
  const o = useDerivedValue(() => (glow ? 0.55 + 0.45 * hint.value : 1));
  return (
    <Group opacity={o}>
      <Path path={body} color={theme.color.surface} />
      <Path
        path={body}
        color={chosen ? theme.color.ok : theme.color.inkFaint}
        style="stroke"
        strokeWidth={2}
      />
      <Path path={pips} color={theme.color.inkDim} />
    </Group>
  );
}

/**
 * Una pieza. Su lugar se deriva de cuántas salieron: mientras no le toca está
 * adentro, y cuando le toca viaja a su lugar en la columna. Nunca se monta ni
 * se desmonta, así que sacar veinte bolas no cuesta más que sacar dos.
 */
function Piece({
  ball,
  mark,
  asMark,
  from,
  to,
  at,
  color,
  dim,
  extra,
  drawn,
  refill,
}: {
  readonly ball: SkPath;
  readonly mark: SkPath;
  readonly asMark: boolean;
  readonly from: Spot;
  readonly to: Spot;
  /** En qué número de extracción sale esta pieza. */
  readonly at: number;
  readonly color: string;
  /** No es el color que la ficha nombra: se ve, pero no reclama. */
  readonly dim: boolean;
  /** Es del relleno: no existe hasta que el frasco se vuelve a llenar. */
  readonly extra: boolean;
  readonly drawn: SharedValue<number>;
  readonly refill: SharedValue<number>;
}) {
  const transform = useDerivedValue(() => {
    const raw = Math.max(0, Math.min(1, drawn.value - at));
    const t = raw * raw * (3 - 2 * raw);
    return [
      { translateX: from.x + (to.x - from.x) * t },
      { translateY: from.y + (to.y - from.y) * t },
    ];
  }, [from, to, at]);
  const o = useDerivedValue(() => (extra ? refill.value : 1));
  return (
    <Group transform={transform} opacity={o}>
      <Path path={asMark ? mark : ball} color={color} opacity={dim ? 0.45 : 1} />
      <Path
        path={asMark ? mark : ball}
        color={theme.color.bg}
        style="stroke"
        strokeWidth={STROKE}
      />
    </Group>
  );
}
