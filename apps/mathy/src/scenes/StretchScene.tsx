/**
 * La banda: la mecánica `grid_stretch` de [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * Quince nodos de la espina la usan, así que la escena no es del nodo 5: es de
 * la mecánica. En una dimensión, `grid_stretch` **es** la multiplicación, y por
 * eso la escena no sabe nada de multiplicar: sabe estirar. Todo lo que cambia
 * entre un nodo y otro entra por `StretchConfig` —cuántas marcas tiene la
 * regla, cuánto mide la banda en reposo, si hay numerales, si la regla se abre
 * hacia los negativos, cuántas bandas hay, qué dibujos llevan las marcas— y
 * nada de eso está escrito adentro.
 *
 * El invariante que la escena dibuja es `lines_stay_lines_origin_fixed`: todas
 * las distancias al clavo quedan multiplicadas por el mismo factor y el clavo
 * no se mueve. Por eso la posición de cada marca sale de una sola cuenta, y por
 * eso `deform` existe: subiéndolo, solo el extremo se mueve y las marcas del
 * medio quedan quietas. Eso no es estirar, es deformar, y es el distractor con
 * el que se pregunta si el jugador entendió la diferencia.
 *
 * Las tres reglas del proyecto gobiernan el archivo: modo retained (las marcas
 * están siempre montadas), lo que se repite vive en un solo `SkPath` (la regla
 * entera es un trazo) y nada vuelve al hilo de JavaScript por cuadro.
 *
 * El par de engranajes es lo único ajeno a la mecánica. Vive acá porque el
 * nodo 5 lo necesita empujando la ficha sobre la misma regla y `gears_sequence`
 * todavía no tiene escena propia; es opcional y ningún otro nodo que reuse la
 * banda tiene que encenderlo.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Dientes de la manivela. Los mismos del nodo 3: la vuelta es la unidad. */
export const CRANK_TEETH = 12;
export const TOOTH = (2 * Math.PI) / CRANK_TEETH;
/** Marcas montadas siempre en cada banda, para que el árbol no cambie. */
export const BAND_MARK_SLOTS = 7;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

/** Las etapas de desvanecimiento de `grid_stretch` en E0. */
export type StretchSkin = "rubber_band" | "segment" | "drawings";

/** Una recta del plano, escrita como la fila que la dibuja: `a x + b y = c`. */
export interface StretchLine {
  readonly a: number;
  readonly b: number;
  readonly c: number;
}

/**
 * El plano con sus rectas: la otra cara de `grid_stretch`, en dos dimensiones.
 *
 * La banda es la mecánica en una dimensión y el plano es la misma mecánica con
 * un eje más, así que vive en esta escena y no en una nueva. Es un modo aparte
 * y no una capa encima: con el plano puesto la banda no se dibuja, porque una
 * regla horizontal cruzada con un plano no significa nada. Ausente, que es como
 * lo dejan los quince nodos que ya usan la banda, no cambia absolutamente nada.
 */
export interface StretchPlane {
  /** Hasta dónde llega la ventana desde el origen, en unidades. */
  readonly window: number;
  readonly lines: readonly StretchLine[];
  /** El cruce, o `null` cuando las rectas no se cruzan en un punto. */
  readonly cross: readonly [number, number] | null;
  /** El cruce se marca, o queda para que el jugador lo busque. */
  readonly showCross: boolean;
}

/**
 * Todo lo que un nodo decide sobre la banda. Un nodo que reusa la mecánica
 * escribe uno de estos y no toca la escena.
 */
export interface StretchConfig {
  /** Marcas de la regla, del clavo hacia la derecha. */
  readonly length: number;
  /** La regla también se abre hacia la izquierda: la banda se puede dar vuelta. */
  readonly flip: boolean;
  /** Cuánto mide la banda en reposo, en marcas de la regla. */
  readonly rest: number;
  readonly skin: StretchSkin;
  /** La regla lleva numerales. Sin ellos, la estructura se reconoce sin contar. */
  readonly numerals: boolean;
  /** La marca donde está la ficha objetivo. `null`: no hay ficha. */
  readonly target: number | null;
  /** Las marcas de la banda que llevan dibujo en vez de numeral. */
  readonly drawings: readonly number[];
  /** Cuántas bandas hay. Dos comparan: se mira una contra la otra. */
  readonly bands: number;
  /**
   * Cuál de las bandas lleva la manija del extremo libre. -1 para ninguna. La
   * banda que es molde no la lleva: una manija dibujada invita a tirar de algo
   * que no se mueve.
   */
  readonly gripBand: number;
  /** El par de engranajes que empuja la ficha. Ajeno a la mecánica, opcional. */
  readonly crank: { readonly ratio: number } | null;
  /** Las marcas de la regla que se pueden tocar. Vacío: la regla no se toca. */
  readonly marks: readonly number[];
  /**
   * La expresión escrita junto a la banda, ya compuesta por el nodo. Ausente o
   * nula: no hay notación todavía. Se dibuja con los glifos del atlas, así que
   * el `÷` de acá es el mismo objeto que el de una ecuación.
   */
  readonly expr?: string | null;
  /**
   * El diagrama vertical entre las dos primeras bandas: la flecha de ida hacia
   * abajo y la de vuelta hacia arriba. Ausente: no hay flechas.
   */
  readonly arrows?: boolean;
  /**
   * El plano con sus rectas. Ausente o nulo: la escena es la banda de siempre.
   */
  readonly plane?: StretchPlane | null;
}

/** Lo que la actividad anima en una banda. Una por fila. */
export interface BandValues {
  /** El factor del estirado. Negativo, la banda se dio vuelta. */
  readonly factor: SharedValue<number>;
  /**
   * Cuánto se miente, de 0 a 1: en 1 solo el extremo se mueve y las marcas del
   * medio quedan donde estaban. Es la animación que no escala.
   */
  readonly deform: SharedValue<number>;
  /**
   * El recorte, de 0 a 1: el cuerpo se acorta hasta medir el largo en reposo y
   * las marcas del medio no se mueven. Las que quedan afuera del nuevo extremo
   * se apagan, porque se cortaron. Es la otra manera de mentir sobre una banda:
   * el largo queda bien y las separaciones no. Ausente: la banda no se recorta.
   */
  readonly cut?: SharedValue<number>;
}

export interface StretchLayout {
  /** Píxeles por marca de la regla. */
  readonly step: number;
  /** El clavo de cada banda, que es el cero y no se mueve. */
  readonly nails: readonly Spot[];
  /** La regla, común a todas las bandas. */
  readonly ruler: { readonly y: number; readonly from: number; readonly to: number };
  readonly rulerNail: Spot;
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  /** El radio del blanco de toque de una marca: generoso a propósito. */
  readonly touchR: number;
  /** El origen del plano y cuánto mide una unidad. Solo con `config.plane`. */
  readonly plane: { readonly cx: number; readonly cy: number; readonly unit: number };
}

const PAD = 56;

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la marca se tocaría donde no se ve.
 */
export function stretchLayout(config: StretchConfig, width: number, height: number): StretchLayout {
  const units = config.flip ? config.length * 2 : config.length;
  const step = Math.min((width - 2 * PAD) / Math.max(units, 1), 64);
  const drawn = step * config.length;
  const zeroX = config.flip ? width / 2 : (width - drawn) / 2;

  const rulerY = height * (config.crank ? 0.42 : 0.62);
  const nails: Spot[] = [];
  const top = height * 0.2;
  const gap = height * 0.16;
  for (let i = 0; i < Math.max(config.bands, 1); i++) nails.push({ x: zeroX, y: top + i * gap });

  const crankR = Math.max(34, Math.min(52, height * 0.15));
  return {
    step,
    nails,
    ruler: {
      y: rulerY,
      from: config.flip ? zeroX - drawn : zeroX,
      to: zeroX + drawn,
    },
    rulerNail: { x: zeroX, y: rulerY },
    crank: { x: PAD + crankR, y: height - crankR - 16, r: crankR },
    touchR: Math.max(step * 0.6, 26),
    plane: {
      cx: width / 2,
      cy: height * 0.46,
      // El plano se dibuja cuadrado aunque la región no lo sea: con unidades de
      // distinto tamaño en cada eje, dos rectas paralelas dejan de parecerlo.
      unit: (Math.min(width, height * 0.86) * 0.44) / Math.max(1, config.plane?.window ?? 1),
    },
  };
}

// --- Numerales ---------------------------------------------------------------

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

/**
 * Un dibujo para una marca de la banda que ya no lleva numeral. Tres formas
 * distintas y ninguna es una letra: la estructura se tiene que reconocer sin
 * contar y sin leer.
 */
function drawingPath(kind: number, r: number): SkPath {
  const p = Skia.Path.Make();
  if (kind % 3 === 0) {
    p.addCircle(0, 0, r);
  } else if (kind % 3 === 1) {
    p.moveTo(0, -r);
    p.lineTo(r, r * 0.8);
    p.lineTo(-r, r * 0.8);
    p.close();
  } else {
    p.addRect(Skia.XYWHRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7));
  }
  return p;
}

// --- Geometría ---------------------------------------------------------------

/** La regla con sus marcas y sus numerales. Un solo trazo cada cosa. */
function buildRuler(config: StretchConfig, l: StretchLayout): { line: SkPath; ticks: SkPath; digits: SkPath } {
  const line = Skia.Path.Make();
  line.moveTo(l.ruler.from, l.ruler.y);
  line.lineTo(l.ruler.to, l.ruler.y);

  const ticks = Skia.Path.Make();
  const digits = Skia.Path.Make();
  const size = Math.min(l.step * 0.55, 16);
  const first = config.flip ? -config.length : 0;
  for (let i = first; i <= config.length; i++) {
    const x = l.rulerNail.x + i * l.step;
    const h = i === 0 ? 13 : 8;
    ticks.moveTo(x, l.ruler.y - h);
    ticks.lineTo(x, l.ruler.y + h);
    if (config.numerals && (config.length <= 12 || i % 2 === 0)) {
      addGlyphs(digits, i < 0 ? `−${-i}` : String(i), x, l.ruler.y + 24, size);
    }
  }
  return { line, ticks, digits };
}

/** El clavo: el cero, que no se mueve. Es la frontera con el desplazamiento. */
function buildNail(r: number): SkPath {
  const p = Skia.Path.Make();
  p.addCircle(0, 0, r);
  return p;
}

/** La rueda dentada y su par: cada vuelta mueve la ficha `ratio` casillas. */
function buildCrank(r: number, ratio: number): { body: SkPath; teeth: SkPath; handle: SkPath; mate: SkPath } {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  body.addCircle(0, 0, 4);

  const teeth = Skia.Path.Make();
  for (let i = 0; i < CRANK_TEETH; i++) {
    const a = i * TOOTH - Math.PI / 2;
    teeth.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    teeth.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
  }

  const handle = Skia.Path.Make();
  handle.moveTo(0, 0);
  handle.lineTo(0, -r * 0.62);
  handle.addCircle(0, -r * 0.62, 8);

  // El engranaje enganchado: es el que convierte una vuelta en `ratio` casillas.
  const mate = Skia.Path.Make();
  const mr = (r * 0.62) / Math.max(ratio, 1);
  mate.addCircle(r * 0.86 + mr, 0, mr);
  for (let i = 0; i < CRANK_TEETH; i++) {
    const a = i * TOOTH;
    mate.moveTo(r * 0.86 + mr + Math.cos(a) * mr, Math.sin(a) * mr);
    mate.lineTo(r * 0.86 + mr + Math.cos(a) * mr * 1.35, Math.sin(a) * mr * 1.35);
  }
  return { body, teeth, handle, mate };
}

/**
 * Los dos puntos donde una recta sale de la ventana. Devuelve `null` cuando la
 * recta no la cruza, que con los sistemas del nodo pasa solo si la ventana
 * quedó chica.
 */
function planeSegment(
  line: StretchLine,
  w: number,
): readonly [Spot, Spot] | null {
  const pts: Spot[] = [];
  const push = (x: number, y: number): void => {
    if (x < -w - 1e-6 || x > w + 1e-6 || y < -w - 1e-6 || y > w + 1e-6) return;
    if (pts.some((p) => Math.abs(p.x - x) < 1e-6 && Math.abs(p.y - y) < 1e-6)) return;
    pts.push({ x, y });
  };
  if (line.b !== 0) {
    push(-w, (line.c + line.a * w) / line.b);
    push(w, (line.c - line.a * w) / line.b);
  }
  if (line.a !== 0) {
    push((line.c + line.b * w) / line.a, -w);
    push((line.c - line.b * w) / line.a, w);
  }
  const a = pts[0];
  const b = pts[1];
  return a && b ? [a, b] : null;
}

/**
 * El plano: la cuadrícula, los dos ejes, una recta por fila y el cruce.
 *
 * Cada recta es la fila entera dibujada de otra manera, y por eso el nodo puede
 * preguntar cuántas soluciones tiene un sistema sin resolverlo: dos rectas que
 * se cruzan dan una, dos paralelas ninguna y dos superpuestas infinitas. Es lo
 * que hace que el punto de ruptura de la analogía de las balanzas tenga dónde
 * mostrarse.
 */
function buildPlane(
  plane: StretchPlane,
  l: StretchLayout,
): { grid: SkPath; axes: SkPath; lines: SkPath[]; cross: SkPath } {
  const { cx, cy, unit } = l.plane;
  const w = Math.max(1, plane.window);
  const px = (x: number): number => cx + x * unit;
  const py = (y: number): number => cy - y * unit;

  const grid = Skia.Path.Make();
  for (let i = -w; i <= w; i++) {
    grid.moveTo(px(i), py(-w));
    grid.lineTo(px(i), py(w));
    grid.moveTo(px(-w), py(i));
    grid.lineTo(px(w), py(i));
  }

  const axes = Skia.Path.Make();
  axes.moveTo(px(-w), py(0));
  axes.lineTo(px(w), py(0));
  axes.moveTo(px(0), py(-w));
  axes.lineTo(px(0), py(w));

  const lines = plane.lines.map((line) => {
    const p = Skia.Path.Make();
    const seg = planeSegment(line, w);
    if (!seg) return p;
    p.moveTo(px(seg[0].x), py(seg[0].y));
    p.lineTo(px(seg[1].x), py(seg[1].y));
    return p;
  });

  const cross = Skia.Path.Make();
  if (plane.cross && plane.showCross) {
    cross.addCircle(px(plane.cross[0]), py(plane.cross[1]), 7);
  }
  return { grid, axes, lines, cross };
}

// --- Componente --------------------------------------------------------------

export interface StretchSceneProps {
  readonly config: StretchConfig;
  readonly layout: StretchLayout;
  /** Una entrada por banda. La actividad decide cuál sigue al dedo. */
  readonly bands: readonly BandValues[];
  /** La ficha que camina sobre la regla, en marcas. Solo con manivela. */
  readonly token: SharedValue<number>;
  /** El giro de la manivela, en radianes. */
  readonly turn: SharedValue<number>;
  /** La banda contra el tope: vibra y no pasa. */
  readonly jam: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  /** La banda que el jugador eligió, o -1. */
  readonly picked: number;
  /** La marca que el jugador anticipó, o `null`. */
  readonly guess: number | null;
  readonly appear: SharedValue<number>;
}

export function StretchScene({
  config,
  layout,
  bands,
  token,
  turn,
  jam,
  hint,
  demo,
  picked,
  guess,
  appear,
}: StretchSceneProps) {
  const ruler = useMemo(() => buildRuler(config, layout), [config, layout]);
  const nail = useMemo(() => buildNail(7), []);
  const crank = useMemo(
    () => buildCrank(layout.crank.r, config.crank?.ratio ?? 1),
    [layout.crank.r, config.crank],
  );

  const targetGeom = useMemo(() => {
    const chip = Skia.Path.Make();
    if (config.target === null) return { chip, digits: chip };
    const x = layout.rulerNail.x + config.target * layout.step;
    const r = Math.min(layout.step * 0.42, 17);
    chip.addCircle(x, layout.ruler.y - 34, r);
    const digits = Skia.Path.Make();
    if (config.numerals) {
      addGlyphs(digits, String(config.target), x, layout.ruler.y - 34, r * 1.1);
    }
    return { chip, digits };
  }, [config.target, config.numerals, layout]);

  const guessGeom = useMemo(() => {
    const p = Skia.Path.Make();
    if (guess === null) return p;
    const x = layout.rulerNail.x + guess * layout.step;
    p.moveTo(x, layout.ruler.y - 16);
    p.lineTo(x, layout.ruler.y - 46);
    p.lineTo(x + 18, layout.ruler.y - 40);
    p.lineTo(x, layout.ruler.y - 34);
    return p;
  }, [guess, layout]);

  /**
   * La expresión escrita al lado de la banda. Sale del mismo atlas que la
   * ecuación del nodo 13, así que la barra con dos puntos que nace acá es la
   * misma que después se escribe.
   */
  const exprGeom = useMemo(() => {
    const p = Skia.Path.Make();
    if (!config.expr) return p;
    addGlyphs(
      p,
      config.expr,
      (layout.ruler.from + layout.ruler.to) / 2,
      layout.ruler.y + 62,
      Math.min(layout.step * 1.1, 34),
    );
    return p;
  }, [config.expr, layout]);

  /**
   * El diagrama vertical: la flecha de ida hacia abajo y la de vuelta hacia
   * arriba, entre las dos primeras bandas. La de vuelta es la misma flecha
   * reproducida al revés, que es exactamente lo que dice el nodo.
   */
  const arrowsGeom = useMemo(() => {
    const ida = Skia.Path.Make();
    const vuelta = Skia.Path.Make();
    const a = layout.nails[0];
    const b = layout.nails[1];
    if (!config.arrows || !a || !b) return { ida, vuelta };
    const x = a.x + layout.step * 0.9;
    const y0 = a.y + 20;
    const y1 = b.y - 20;
    const head = 8;
    ida.moveTo(x, y0);
    ida.lineTo(x, y1);
    ida.moveTo(x - head * 0.6, y1 - head);
    ida.lineTo(x, y1);
    ida.lineTo(x + head * 0.6, y1 - head);
    const x2 = x + 30;
    vuelta.moveTo(x2, y1);
    vuelta.lineTo(x2, y0);
    vuelta.moveTo(x2 - head * 0.6, y0 + head);
    vuelta.lineTo(x2, y0);
    vuelta.lineTo(x2 + head * 0.6, y0 + head);
    return { ida, vuelta };
  }, [config.arrows, layout]);

  const marksGeom = useMemo(() => {
    const p = Skia.Path.Make();
    for (const m of config.marks) {
      const x = layout.rulerNail.x + m * layout.step;
      p.addCircle(x, layout.ruler.y, Math.min(layout.step * 0.34, 14));
    }
    return p;
  }, [config.marks, layout]);

  const tokenX = layout.rulerNail.x;
  const step = layout.step;
  const tokenT = useDerivedValue(() => [
    { translateX: tokenX + token.value * step },
    { translateY: layout.ruler.y },
  ]);
  const tokenGeom = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, Math.min(layout.step * 0.36, 15));
    return p;
  }, [layout.step]);

  const crankT = useDerivedValue(() => [{ rotate: turn.value + jam.value * 0.05 }]);
  const mateT = useDerivedValue(() => [
    { rotate: -turn.value * Math.max(config.crank?.ratio ?? 1, 1) },
  ]);
  const crankGlow = useDerivedValue(() => 0.35 + 0.65 * hint.value);

  // La mano fantasma toma el extremo libre y lo lleva hasta la ficha objetivo.
  const handFrom = { x: layout.nails[0]?.x ?? 0, y: layout.nails[0]?.y ?? 0 };
  const restX = handFrom.x + config.rest * layout.step;
  const targetX = handFrom.x + (config.target ?? config.rest) * layout.step;
  const handT = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, demo.value));
    const t = c * c * (3 - 2 * c);
    return [{ translateX: restX + (targetX - restX) * t }, { translateY: handFrom.y }];
  }, [restX, targetX, handFrom.y]);
  const handO = useDerivedValue(() => hint.value * 0.5 * Math.sin(demo.value * Math.PI));
  const handGeom = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 13);
    return p;
  }, []);

  const plane = useMemo(
    () => (config.plane ? buildPlane(config.plane, layout) : null),
    [config.plane, layout],
  );

  // Con el plano puesto la banda no se dibuja: son dos caras de la misma
  // mecánica y no dos cosas que convivan en la pantalla.
  if (plane) {
    return (
      <Group opacity={appear}>
        <Path path={plane.grid} color={theme.color.line} style="stroke" strokeWidth={0.6} opacity={0.5} />
        <Path path={plane.axes} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
        {plane.lines.map((path, i) => (
          <Path
            key={`recta${i}`}
            path={path}
            color={i === 0 ? theme.color.accent : theme.color.ok}
            style="stroke"
            strokeWidth={2.5}
            strokeCap="round"
          />
        ))}
        <Path path={plane.cross} color={theme.color.warn} style="stroke" strokeWidth={3} />
      </Group>
    );
  }

  return (
    <Group opacity={appear}>
      {/* La regla. El cero lleva la marca más larga: ahí está el clavo. */}
      <Path path={ruler.line} color={theme.color.line} style="stroke" strokeWidth={2} />
      <Path path={ruler.ticks} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      <Path path={ruler.digits} color={theme.color.inkDim} />
      <Path path={marksGeom} color={theme.color.line} style="stroke" strokeWidth={STROKE} />

      {config.target !== null ? (
        <>
          <Path path={targetGeom.chip} color={theme.color.surfaceHigh} />
          <Path path={targetGeom.chip} color={theme.color.ok} style="stroke" strokeWidth={2} />
          <Path path={targetGeom.digits} color={theme.color.ink} />
        </>
      ) : null}

      {/* La bandera de lo que el jugador anticipó, antes de ejecutar. */}
      <Path path={guessGeom} color={theme.color.warn} style="stroke" strokeWidth={2} />

      {/* El diagrama vertical y la expresión, cuando el nodo los pide. */}
      <Path path={arrowsGeom.ida} color={theme.color.inkDim} style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={arrowsGeom.vuelta} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={exprGeom} color={theme.color.ink} />

      {config.crank ? (
        <>
          <Group transform={tokenT}>
            <Path path={tokenGeom} color={theme.color.accent} />
          </Group>
          <Group transform={[{ translateX: layout.crank.x }, { translateY: layout.crank.y }]}>
            <Path path={crank.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
            <Group transform={crankT}>
              <Path path={crank.teeth} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
              <Group opacity={crankGlow}>
                <Path path={crank.handle} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
              </Group>
            </Group>
            <Group transform={mateT}>
              <Path path={crank.mate} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
            </Group>
          </Group>
        </>
      ) : null}

      {layout.nails.map((spot, i) => (
        <Band
          key={i}
          config={config}
          layout={layout}
          spot={spot}
          values={bands[i] as BandValues}
          nail={nail}
          picked={picked === i}
          grip={config.gripBand === i}
          hint={hint}
        />
      ))}

      <Group transform={handT} opacity={handO}>
        <Path path={handGeom} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/**
 * Una banda. Sus marcas están todas montadas y cada una deriva su posición del
 * mismo factor: eso es lo que hace que el invariante sea geometría y no una
 * regla del juego. El clavo no aparece en la cuenta porque su distancia al
 * clavo es cero, y cero por cualquier cosa sigue siendo cero.
 */
function Band({
  config,
  layout,
  spot,
  values,
  nail,
  picked,
  grip: hasGrip,
  hint,
}: {
  readonly config: StretchConfig;
  readonly layout: StretchLayout;
  readonly spot: Spot;
  readonly values: BandValues;
  readonly nail: SkPath;
  readonly picked: boolean;
  readonly grip: boolean;
  readonly hint: SharedValue<number>;
}) {
  const step = layout.step;
  const rest = config.rest;
  const x0 = spot.x;
  const y = spot.y;
  const drawings = config.drawings;

  const body = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(0, -6, step * rest, 12), 6, 6));
    return p;
  }, [step, rest]);

  const markGeom = useMemo(() => {
    const tick = Skia.Path.Make();
    tick.moveTo(0, -11);
    tick.lineTo(0, 11);
    return tick;
  }, []);

  const grip = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 14);
    return p;
  }, []);

  const halo = useMemo(() => {
    const p = Skia.Path.Make();
    const from = config.flip ? x0 - step * config.length : x0;
    const width = step * config.length * (config.flip ? 2 : 1);
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(from - 22, y - 28, width + 44, 56), 12, 12));
    return p;
  }, [config.flip, config.length, step, x0, y]);

  // La aguja del recorte se lee una vez, fuera del worklet: adentro no puede
  // decidirse si existe, porque la decisión viajaría en la clausura del render.
  const cut = values.cut;

  // El cuerpo se escala desde el clavo: es la misma cuenta que las marcas, así
  // que la banda no se puede despegar de sus propias marcas. Recortarlo lo lleva
  // al largo en reposo sin tocar ninguna marca, que es la mentira del nodo 6.
  const bodyT = useDerivedValue(() => {
    const c = cut ? cut.value : 0;
    const f = values.factor.value * (1 - c) + c;
    return [
      { translateX: x0 },
      { translateY: y },
      { scaleX: Math.max(Math.abs(f), 0.001) * Math.sign(f || 1) },
    ];
  }, [cut, x0, y]);
  const gripT = useDerivedValue(() => [
    { translateX: x0 + rest * step * values.factor.value },
    { translateY: y },
  ]);
  const gripO = useDerivedValue(() => (hasGrip ? 0.55 + 0.45 * hint.value : 0));
  const bandO = useDerivedValue(() => (picked ? 1 : 0));

  return (
    <>
      <Group transform={bodyT} opacity={0.75}>
        <Path path={body} color={config.skin === "rubber_band" ? "#5a4a6e" : "#2a3a4d"} />
      </Group>

      {Array.from({ length: BAND_MARK_SLOTS }, (_, i) => (
        <BandMark
          key={i}
          i={i}
          live={i <= rest}
          x0={x0}
          y={y}
          step={step}
          rest={rest}
          values={values}
          tick={markGeom}
          drawing={drawings.includes(i) ? drawingPath(i, Math.min(step * 0.3, 11)) : null}
        />
      ))}

      <Group transform={gripT} opacity={gripO}>
        <Path path={grip} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
      </Group>

      <Group transform={[{ translateX: x0 }, { translateY: y }]}>
        <Path path={nail} color={theme.color.warn} />
        <Path path={nail} color={theme.color.bg} style="stroke" strokeWidth={STROKE} />
      </Group>

      {/* La banda elegida en `explain`: la que se toca queda marcada. */}
      <Group opacity={bandO}>
        <Path path={halo} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
    </>
  );
}

/**
 * Una marca de la banda. Su distancia al clavo queda multiplicada por el
 * factor, y con `deform` en 1 se queda quieta salvo que sea el extremo: eso es
 * exactamente lo que no es estirar.
 */
function BandMark({
  i,
  live,
  x0,
  y,
  step,
  rest,
  values,
  tick,
  drawing,
}: {
  readonly i: number;
  readonly live: boolean;
  readonly x0: number;
  readonly y: number;
  readonly step: number;
  readonly rest: number;
  readonly values: BandValues;
  readonly tick: SkPath;
  readonly drawing: SkPath | null;
}) {
  const cut = values.cut;
  const t = useDerivedValue(() => {
    const escalado = i * step * values.factor.value;
    const quieto = i === rest ? escalado : i * step;
    return [{ translateX: x0 + escalado + (quieto - escalado) * values.deform.value }, { translateY: y }];
  }, [i, step, rest, x0, y]);
  // Recortar no mueve ninguna marca: se lleva las que quedaron más allá del
  // nuevo extremo. Por eso el largo puede quedar bien y las marcas mal.
  const o = useDerivedValue(() => {
    if (!live) return 0;
    const c = cut ? cut.value : 0;
    if (c <= 0) return 1;
    return i * values.factor.value > rest + 0.001 ? 1 - c : 1;
  }, [live, cut, i, rest]);
  return (
    <Group transform={t} opacity={o}>
      <Path path={tick} color={theme.color.ink} style="stroke" strokeWidth={2} />
      {drawing ? <Path path={drawing} color={theme.color.warn} style="stroke" strokeWidth={2} /> : null}
    </Group>
  );
}
