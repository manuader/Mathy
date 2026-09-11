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

import { useEffect, useMemo, useRef } from "react";
import {
  BlurMask,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Skia,
  vec,
  type SkPath,
} from "@shopify/react-native-skia";
import {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { ChipBodies } from "../ui/ChipBodies.tsx";
import { play, type Sfx } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

/**
 * La escala de la regla: la ficha que avanza suena un escalón más arriba en
 * cada marca, así el salto de a `ratio` casillas se oye como un salto.
 */
const FILL = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24] as const;
const fillPitch = (i: number): number => FILL[Math.max(0, Math.min(i, FILL.length - 1))] as number;

/**
 * Suena un efecto cuando pasa lo que lo causa; con `delay`, cuando la llegada se
 * confirma. Desde un worklet se llama con `runOnJS`. Sin audio no suena.
 */
function sfx(name: Sfx, pitch = 0, delay = 0): void {
  if (delay <= 0) play(name, { pitch });
  else setTimeout(() => play(name, { pitch }), delay);
}

/**
 * Lo que va debajo de lo que tiene que leerse, para que se lea sobre cualquier
 * paisaje: el contorno de los glifos y de los trazos sueltos.
 */
const SHADE = "rgba(9, 17, 29, 0.9)";
/** El vidrio oscuro de la regla y del plano: deja ver el mundo, pero lo aparta. */
const SHADE_SOFT = "rgba(9, 17, 29, 0.72)";
const GLASS = "rgba(255, 255, 255, 0.05)";
const GLASS_LINE = "rgba(255, 255, 255, 0.12)";
const GRID_LINE = "rgba(255, 255, 255, 0.08)";

/** Una paleta de volumen: la luz arriba a la izquierda, el cuerpo y la sombra. */
interface Look {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
}
/**
 * La goma: el color propio de la banda mientras es banda. Apagado a propósito,
 * porque un violeta vivo se leería como el tercer equipo.
 */
const RUBBER: Look = { light: "#a592c0", base: "#6e5c88", dark: "#3d3050" };
/**
 * Los equipos. Cuando la banda se aplana en segmento pierde la goma y toma el
 * color de su fila: con dos bandas, se dice cuál es cuál sin mirar su altura.
 * Las mismas luces que las marcas del nodo 1.
 */
const TEAM: readonly Look[] = [
  { light: "#b8e2ff", base: theme.color.accent, dark: "#1f7fcf" },
  { light: "#ffd0da", base: theme.color.coral, dark: "#d2465f" },
  { light: "#e2d6ff", base: theme.color.violet, dark: "#7456d6" },
];
/** El metal del clavo y de los engranajes: no son de ningún equipo. */
const METAL: Look = { light: "#f2f6fb", base: "#a3b1c2", dark: "#4f5d70" };
/** El marfil de la ficha que camina y de los dibujos de la banda: objetos, sin equipo. */
const IVORY: Look = { light: "#ffffff", base: "#e3eaf3", dark: "#8a9ab0" };
/** El cruce de las rectas: el único punto que cumple las dos filas, así que es menta. */
const MINT: Look = { light: "#b9f7de", base: theme.color.ok, dark: "#16a574" };
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
function buildRuler(
  config: StretchConfig,
  l: StretchLayout,
): { line: SkPath; ticks: SkPath; digits: SkPath; bar: SkPath } {
  const line = Skia.Path.Make();
  line.moveTo(l.ruler.from, l.ruler.y);
  line.lineTo(l.ruler.to, l.ruler.y);

  // El vidrio oscuro debajo de la regla y sus numerales: la regla es lo que se
  // lee, y un trazo fino sobre el paisaje se perdía.
  const bar = Skia.Path.Make();
  const pad = 18;
  bar.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(
        l.ruler.from - pad,
        l.ruler.y - 18,
        l.ruler.to - l.ruler.from + pad * 2,
        config.numerals ? 54 : 36,
      ),
      12,
      12,
    ),
  );

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
  return { line, ticks, digits, bar };
}

/** Una pieza redonda con volumen: cuerpo, brillo y sombra, centrada en el origen. */
interface Bead {
  readonly r: number;
  readonly body: SkPath;
  readonly shine: SkPath;
  readonly shadow: SkPath;
}

function bead(r: number): Bead {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r);
  const shine = Skia.Path.Make();
  shine.addOval(Skia.XYWHRect(-r * 0.62, -r * 0.64, r * 0.52, r * 0.34));
  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(-r * 0.9, r * 0.45, r * 1.8, r * 0.7));
  return { r, body, shine, shadow };
}

/**
 * El clavo: el cero, que no se mueve. Es la frontera con el desplazamiento.
 *
 * Una cabeza de metal con su brillo y su sombra. Antes era un punto ámbar con un
 * borde del color del fondo, que sobre el paisaje se veía como un parche oscuro;
 * y el ámbar es "mirá acá", que el clavo no pide: pide no moverse.
 */
function buildNail(r: number): Bead {
  return bead(r);
}

/**
 * La rueda dentada y su par: cada vuelta mueve la ficha `ratio` casillas.
 *
 * El cuerpo, el cubo, el brazo y la perilla van en trazos separados porque se
 * pintan distinto: metal con luz, metal oscuro, y la perilla es lo que se agarra.
 * El engranaje enganchado se dibuja sobre su propio centro, para que gire sobre
 * sí mismo y no alrededor de la rueda.
 */
function buildCrank(
  r: number,
  ratio: number,
): {
  body: SkPath;
  hub: SkPath;
  teeth: SkPath;
  handle: SkPath;
  knob: Bead;
  mate: SkPath;
  mateTeeth: SkPath;
  mateX: number;
  mateR: number;
} {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  const hub = Skia.Path.Make();
  hub.addCircle(0, 0, 4);

  const teeth = Skia.Path.Make();
  for (let i = 0; i < CRANK_TEETH; i++) {
    const a = i * TOOTH - Math.PI / 2;
    teeth.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    teeth.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
  }

  const handle = Skia.Path.Make();
  handle.moveTo(0, 0);
  handle.lineTo(0, -r * 0.62);

  // El engranaje enganchado: es el que convierte una vuelta en `ratio` casillas.
  const mr = (r * 0.62) / Math.max(ratio, 1);
  const mateX = r * 0.86 + mr;
  const mate = Skia.Path.Make();
  mate.addCircle(0, 0, mr);
  const mateTeeth = Skia.Path.Make();
  for (let i = 0; i < CRANK_TEETH; i++) {
    const a = i * TOOTH;
    mateTeeth.moveTo(Math.cos(a) * mr, Math.sin(a) * mr);
    mateTeeth.lineTo(Math.cos(a) * mr * 1.35, Math.sin(a) * mr * 1.35);
  }
  return { body, hub, teeth, handle, knob: bead(8), mate, mateTeeth, mateX, mateR: mr };
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
interface PlaneGeom {
  readonly grid: SkPath;
  readonly axes: SkPath;
  readonly lines: SkPath[];
  /** El vidrio oscuro debajo de la cuadrícula. */
  readonly panel: SkPath;
  /** El cruce en píxeles, cuando hay uno y se muestra. */
  readonly crossAt: Spot | null;
  /**
   * Las dos rectas son la misma: toda la recta es el cruce. Es la tercera clase
   * de sistema, y la única en que las rectas "coinciden" en el sentido del menta.
   */
  readonly coincide: boolean;
  /** El medio del primer segmento visible: de ahí salen las chispas si coinciden. */
  readonly mid: Spot | null;
}

function buildPlane(plane: StretchPlane, l: StretchLayout): PlaneGeom {
  const { cx, cy, unit } = l.plane;
  const w = Math.max(1, plane.window);
  const px = (x: number): number => cx + x * unit;
  const py = (y: number): number => cy - y * unit;

  const panel = Skia.Path.Make();
  panel.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(px(-w) - 12, py(w) - 12, 2 * w * unit + 24, 2 * w * unit + 24),
      16,
      16,
    ),
  );

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

  let mid: Spot | null = null;
  const lines = plane.lines.map((line, i) => {
    const p = Skia.Path.Make();
    const seg = planeSegment(line, w);
    if (!seg) return p;
    p.moveTo(px(seg[0].x), py(seg[0].y));
    p.lineTo(px(seg[1].x), py(seg[1].y));
    if (i === 0) mid = { x: px((seg[0].x + seg[1].x) / 2), y: py((seg[0].y + seg[1].y) / 2) };
    return p;
  });

  const crossAt: Spot | null =
    plane.cross && plane.showCross ? { x: px(plane.cross[0]), y: py(plane.cross[1]) } : null;

  // Dos filas proporcionales dibujan la misma recta.
  const a = plane.lines[0];
  const b = plane.lines[1];
  const cero = (v: number): boolean => Math.abs(v) < 1e-9;
  const coincide =
    a !== undefined &&
    b !== undefined &&
    cero(a.a * b.b - b.a * a.b) &&
    cero(a.a * b.c - b.a * a.c) &&
    cero(a.b * b.c - b.b * a.c);
  return { grid, axes, lines, panel, crossAt, coincide, mid };
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
  /**
   * La expresión con su propia opacidad, fuera de `appear`. Es para el nivel
   * que pide la banda con un toque: ahí la cuenta tiene que estar sola desde el
   * principio, porque es lo que el nivel enseña, y la banda llega después.
   * Ausente: la expresión aparece y se va con la banda, como antes.
   */
  readonly exprAppear?: SharedValue<number>;
}

/**
 * Cuánto tiene que quedarse algo en su lugar para que cuente como llegada. Un
 * extremo que pasa de largo por la ficha mientras el dedo tira no llegó: pasó.
 */
const SETTLE_MS = 250;
/** "Está justo ahí", en marcas de la regla. */
const EPS = 1e-3;
/**
 * Un cambio de más de media marca de un cuadro al otro no es una llegada: es una
 * ronda nueva que ya arranca ahí, y eso no se celebra.
 */
const JUMP = 0.5;

/** El ámbar de la bandera anticipada, con su luz: la bandera es un objeto. */
const AMBER: Look = { light: "#ffe0a8", base: theme.color.warn, dark: "#c98217" };

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
  exprAppear,
}: StretchSceneProps) {
  const ruler = useMemo(() => buildRuler(config, layout), [config, layout]);
  const nail = useMemo(() => buildNail(7), []);
  const crank = useMemo(
    () => buildCrank(layout.crank.r, config.crank?.ratio ?? 1),
    [layout.crank.r, config.crank],
  );

  const step = layout.step;
  const meta = config.target;
  const chipR = Math.min(step * 0.42, 17);
  const chipX = layout.rulerNail.x + (meta ?? 0) * step;
  const chipY = layout.ruler.y - 34;

  /**
   * La ficha objetivo: una ficha de verdad, con su canto, y no un círculo con
   * borde menta. Menta es "coincide", y antes de que el extremo llegue la ficha
   * todavía no coincide con nada: se enciende cuando llega.
   */
  const targetGeom = useMemo(() => {
    const chip = Skia.Path.Make();
    const ring = Skia.Path.Make();
    const digits = Skia.Path.Make();
    if (meta === null) return { chip, ring, digits };
    chip.addCircle(chipX, chipY, chipR);
    ring.addCircle(chipX, chipY, chipR + 4);
    if (config.numerals) addGlyphs(digits, String(meta), chipX, chipY, chipR * 1.1);
    return { chip, ring, digits };
  }, [meta, config.numerals, chipX, chipY, chipR]);

  /** La bandera de lo anticipado: el asta es trazo y el paño es una pieza. */
  const guessGeom = useMemo(() => {
    const pole = Skia.Path.Make();
    const flag = Skia.Path.Make();
    if (guess === null) return { pole, flag };
    const x = layout.rulerNail.x + guess * step;
    pole.moveTo(x, layout.ruler.y - 16);
    pole.lineTo(x, layout.ruler.y - 46);
    flag.moveTo(x, layout.ruler.y - 46);
    flag.lineTo(x + 18, layout.ruler.y - 40);
    flag.lineTo(x, layout.ruler.y - 34);
    flag.close();
    return { pole, flag };
  }, [guess, layout, step]);

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

  /** Las marcas que se tocan: fichas neutras sobre la regla, las mismas de toda bandeja. */
  const marksGeom = useMemo(() => {
    const p = Skia.Path.Make();
    for (const m of config.marks) {
      const x = layout.rulerNail.x + m * layout.step;
      p.addCircle(x, layout.ruler.y, Math.min(layout.step * 0.34, 14));
    }
    return p;
  }, [config.marks, layout]);

  const plane = useMemo(
    () => (config.plane ? buildPlane(config.plane, layout) : null),
    [config.plane, layout],
  );

  // --- El evento que la escena enseña ----------------------------------------

  /**
   * Una sola respuesta montada para toda la escena, que se mueve a donde pasó
   * la llegada: el extremo que cayó en la ficha, la banda que cayó sobre la
   * testigo, la ficha de la manivela que llegó, el cruce que apareció. Montada
   * desde el principio con opacidad cero, como pide el modo retained.
   *
   * - `arrive`: la llegada, que queda encendida mientras dura (el marco menta de
   *   la ficha, los puentes entre las marcas). Crece con resorte, como el puente
   *   del nodo 1.
   * - `burst`: las chispas, de 0 a 1 una sola vez por llegada. En 1 no se ve nada.
   * - `pop`: el rebote de lo que llegó.
   */
  const arrive = useSharedValue(0);
  const burst = useSharedValue(1);
  const pop = useSharedValue(0);
  const bx = useSharedValue(0);
  const by = useSharedValue(0);

  const celebrate = (x: number, y: number, delay: number): void => {
    "worklet";
    bx.value = x;
    by.value = y;
    arrive.value = withDelay(delay, withSpring(1, theme.spring.settle));
    burst.value = withDelay(
      delay,
      withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 720 })),
    );
    pop.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 0 }), withSpring(0, theme.spring.settle)),
    );
    // Llegó justo ahí: las dos cosas coinciden, y suena a vidrio.
    runOnJS(sfx)("join", 0, delay);
  };
  const leave = (): void => {
    "worklet";
    cancelAnimation(burst);
    cancelAnimation(pop);
    burst.value = 1;
    pop.value = 0;
    arrive.value = withTiming(0, { duration: theme.motion.quick });
  };

  const fallback = useSharedValue(1);
  const f0 = bands[0]?.factor ?? fallback;
  const f1 = bands[1]?.factor ?? fallback;
  const rest = config.rest;
  const conManivela = config.crank !== null;
  // Con dos bandas, una se compara con la otra: la testigo del nodo 6, el molde
  // de `match`. Con tres es la explicación del nodo 6, que corre sola.
  const conDos = config.bands === 2 && bands[1] !== undefined;
  const nail0 = layout.nails[0] ?? layout.rulerNail;

  /**
   * El extremo de la banda llegó a donde tenía que llegar: a la ficha objetivo,
   * o encima del extremo de la otra banda. La escena no sabe si el jugador
   * acertó, pero sabe dónde quedó el extremo, y eso es lo que el nivel enseña:
   * todas las marcas se separaron igual y el extremo cayó justo ahí.
   *
   * Mira la distancia en el hilo de la interfaz, sin volver a JavaScript: una
   * llegada es continua (la trae el dedo o una animación) y se queda
   * `SETTLE_MS`; un salto grande es una ronda nueva y no se celebra.
   */
  useAnimatedReaction(
    () => {
      if (conManivela) return -1;
      if (meta !== null) return Math.abs(rest * f0.value - meta);
      if (conDos) return Math.abs(rest * (f0.value - f1.value));
      return -1;
    },
    (cur, prev) => {
      if (cur < 0) {
        if (prev === null && !conManivela) arrive.value = 0;
        return;
      }
      const on = cur < EPS;
      if (prev === null || prev < 0) {
        if (!on) arrive.value = 0;
        return;
      }
      const was = prev < EPS;
      if (on && !was) {
        if (prev > JUMP) return;
        celebrate(nail0.x + rest * step * f0.value, nail0.y, SETTLE_MS);
      } else if (!on && was) {
        leave();
      }
    },
    [conManivela, meta, rest, conDos, nail0.x, nail0.y, step],
  );

  /**
   * La ficha de la manivela: salta de a `ratio` casillas, así que en la
   * pantalla viaja con el resorte de caer y rebota, en vez de teletransportarse.
   * Lo que la actividad cuenta sigue siendo `token`; esto es solo el dibujo.
   */
  const tokenAt = useSharedValue(0);
  const tokenPop = useSharedValue(0);
  const rulerNailX = layout.rulerNail.x;
  const rulerY = layout.ruler.y;
  useAnimatedReaction(
    () => token.value,
    (cur, prev) => {
      if (prev === null || cur === 0) {
        // Al cambiar de ronda la ficha vuelve al clavo sin viajar: aparece donde va.
        tokenAt.value = cur;
      } else if (cur !== prev) {
        tokenAt.value = withSpring(cur, theme.spring.settle);
        tokenPop.value = withSequence(withTiming(1, { duration: 0 }), withSpring(0, theme.spring.settle));
        // Cae en su casilla: madera, más aguda cuanto más lejos del clavo.
        runOnJS(sfx)("drop", fillPitch(Math.round(Math.abs(cur))), 0);
      }
      if (!conManivela || meta === null) return;
      const on = Math.abs(cur - meta) < EPS;
      if (prev === null) {
        if (!on) arrive.value = 0;
        return;
      }
      const was = Math.abs(prev - meta) < EPS;
      if (on && !was) celebrate(rulerNailX + meta * step, rulerY, SETTLE_MS);
      else if (!on && was) leave();
    },
    [conManivela, meta, rulerNailX, rulerY, step],
  );

  /**
   * Anticipar estirando por uno: la banda no se mueve, así que la llegada no la
   * trae ninguna animación. La trae la bandera puesta sobre la ficha.
   */
  const guessPrev = useRef(guess);
  useEffect(() => {
    const antes = guessPrev.current;
    guessPrev.current = guess;
    if (guess === null || guess === antes || meta === null || guess !== meta || conManivela) return;
    if (Math.abs(rest * f0.value - meta) < EPS) {
      celebrate(nail0.x + meta * step, nail0.y, theme.motion.quick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guess, meta, rest, conManivela, nail0.x, nail0.y, step]);

  /**
   * El plano: el cruce aparece cuando el jugador ya dijo de qué clase es el
   * sistema. Es el único punto que cumple las dos filas, y aparece con su
   * chispa; si las rectas son la misma, se enciende la recta entera.
   */
  const planePrev = useRef<{ readonly key: string; readonly show: boolean } | null>(null);
  useEffect(() => {
    const p = config.plane;
    if (!p || !plane) {
      planePrev.current = null;
      return;
    }
    const key = p.lines.map((l) => `${l.a},${l.b},${l.c}`).join("|");
    const antes = planePrev.current;
    planePrev.current = { key, show: p.showCross };
    if (!antes || antes.key !== key || antes.show || !p.showCross) return;
    if (plane.crossAt) celebrate(plane.crossAt.x, plane.crossAt.y, 0);
    else if (plane.coincide && plane.mid) celebrate(plane.mid.x, plane.mid.y, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.plane, plane]);

  // --- Lo que se mueve -------------------------------------------------------

  const tokR = Math.min(step * 0.36, 15);
  const tokenBead = useMemo(() => bead(tokR), [tokR]);
  const tokenT = useDerivedValue(() => [
    { translateX: rulerNailX + tokenAt.value * step },
    { translateY: rulerY },
    { scale: 1 + 0.22 * tokenPop.value },
  ]);

  // La ficha objetivo rebota una vez cuando el extremo llega: la llegada es de
  // las dos cosas, la que llegó y el lugar.
  const chipT = useDerivedValue(() => {
    const s = 1 + 0.22 * pop.value;
    return [
      { translateX: chipX },
      { translateY: chipY },
      { scale: s },
      { translateX: -chipX },
      { translateY: -chipY },
    ];
  }, [chipX, chipY]);

  /**
   * La perilla de la manivela crece mientras la mano la gira y se asienta con
   * el resorte de caer cuando la suelta: "la tenés vos" y "quedó".
   */
  const knobLift = useSharedValue(0);
  useAnimatedReaction(
    () => turn.value,
    (cur, prev) => {
      if (!conManivela || prev === null || cur === prev) return;
      knobLift.value = withSequence(
        withTiming(1, { duration: 90 }),
        withDelay(160, withSpring(0, theme.spring.settle)),
      );
    },
    [conManivela],
  );
  const crankT = useDerivedValue(() => [{ rotate: turn.value + jam.value * 0.05 }]);
  const mateT = useDerivedValue(() => [
    { rotate: -turn.value * Math.max(config.crank?.ratio ?? 1, 1) },
  ]);
  const knobT = useDerivedValue(() => [
    { translateY: -layout.crank.r * 0.62 },
    { scale: 1 + 0.3 * knobLift.value },
  ]);
  // La luz de "agarrá acá" es de la demostración: blanca, como la mano
  // fantasma. Un color de equipo diría que la perilla es de alguien.
  const knobHintO = useDerivedValue(() => 0.6 * hint.value);
  const knobRing = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 13);
    return p;
  }, []);
  const crankShadow = useMemo(() => {
    const p = Skia.Path.Make();
    const r = layout.crank.r;
    p.addOval(Skia.XYWHRect(-r * 0.8, r * 0.5, r * 1.6, r * 0.5));
    return p;
  }, [layout.crank.r]);

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

  // --- El plano --------------------------------------------------------------

  const crossBead = useMemo(() => bead(7), []);
  const crossRing = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 12);
    return p;
  }, []);
  const crossX = plane?.crossAt?.x ?? 0;
  const crossY = plane?.crossAt?.y ?? 0;
  const crossT = useDerivedValue(() => [
    { translateX: crossX },
    { translateY: crossY },
    { scale: 1 + 0.35 * pop.value },
  ]);
  // La recta que son dos: menta mientras el cruce se muestra, con el destello
  // de la llegada encima.
  const coincideLit = !!plane && plane.coincide && (config.plane?.showCross ?? false);
  const coincideO = useDerivedValue(
    () => (coincideLit ? 0.4 + (burst.value < 1 ? 0.6 * (1 - burst.value) : 0) : 0),
    [coincideLit],
  );

  // Con el plano puesto la banda no se dibuja: son dos caras de la misma
  // mecánica y no dos cosas que convivan en la pantalla.
  if (plane) {
    const first = plane.lines[0];
    return (
      <Group opacity={appear}>
        {/* La hoja: vidrio oscuro debajo de lo que se lee. */}
        <Path path={plane.panel} color={SHADE_SOFT} />
        <Path path={plane.panel} color={GLASS} />
        <Path path={plane.panel} color={GLASS_LINE} style="stroke" strokeWidth={1} />
        <Path path={plane.grid} color={GRID_LINE} style="stroke" strokeWidth={1} />
        <Path path={plane.axes} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" />

        {first ? (
          <Group opacity={coincideO}>
            <Path path={first} color={theme.color.ok} style="stroke" strokeWidth={16} strokeCap="round">
              <BlurMask blur={8} style="normal" />
            </Path>
          </Group>
        ) : null}

        {/* Una recta por fila, con el color de su fila: son equipos. Menta no,
            que es "coincide", y la segunda fila no coincide con nada. */}
        {plane.lines.map((path, i) => {
          const look = TEAM[i % TEAM.length] as Look;
          return (
            <Group key={`recta${i}`}>
              <Path path={path} color={look.base} style="stroke" strokeWidth={10} strokeCap="round" opacity={0.25}>
                <BlurMask blur={6} style="normal" />
              </Path>
              <Path path={path} color={SHADE} style="stroke" strokeWidth={6.5} strokeCap="round" opacity={0.55} />
              <Path path={path} color={look.base} style="stroke" strokeWidth={3.5} strokeCap="round" />
            </Group>
          );
        })}

        {/* El cruce: el único punto que cumple las dos filas, así que es menta,
            y es una pieza con volumen, no un anillo. */}
        <Group transform={crossT} opacity={plane.crossAt ? 1 : 0}>
          <Path path={crossRing} color={theme.color.ok} opacity={0.35}>
            <BlurMask blur={5} style="normal" />
          </Path>
          <BeadView bead={crossBead} look={MINT} />
        </Group>

        <Burst burst={burst} x={bx} y={by} r={10} />
      </Group>
    );
  }

  return (
    <>
    <Group opacity={appear}>
      {/* La regla, sobre su vidrio. El cero lleva la marca más larga: ahí está
          el clavo. Las marcas que se tocan son fichas. */}
      <Path path={ruler.bar} color={SHADE_SOFT} />
      <Path path={ruler.bar} color={GLASS} />
      <Path path={ruler.bar} color={GLASS_LINE} style="stroke" strokeWidth={1} />
      <ChipBodies path={marksGeom} />
      <Path path={ruler.line} color={theme.color.inkDim} style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={ruler.ticks} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" />
      <Legible path={ruler.digits} color={theme.color.inkDim} />

      {/* La ficha objetivo. Se enciende menta cuando el extremo llega. */}
      <Group transform={chipT}>
        <ChipBodies path={targetGeom.chip} />
        <Group opacity={arrive}>
          <Path path={targetGeom.ring} color={theme.color.ok} style="stroke" strokeWidth={8} opacity={0.35}>
            <BlurMask blur={5} style="normal" />
          </Path>
          <Path path={targetGeom.ring} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        </Group>
        <Path path={targetGeom.digits} color={theme.color.ink} />
      </Group>

      {/* La bandera de lo que el jugador anticipó, antes de ejecutar. */}
      <Path path={guessGeom.pole} color={SHADE} style="stroke" strokeWidth={5} strokeCap="round" opacity={0.6} />
      <Path path={guessGeom.pole} color={theme.color.inkDim} style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={guessGeom.flag}>
        <LinearGradient
          start={vec(0, layout.ruler.y - 46)}
          end={vec(0, layout.ruler.y - 34)}
          colors={[AMBER.light, AMBER.base, AMBER.dark]}
        />
      </Path>
      <Path path={guessGeom.flag} color={AMBER.dark} style="stroke" strokeWidth={1} strokeJoin="round" />

      {/* El diagrama vertical y la expresión, cuando el nodo los pide. La de
          vuelta brilla más que la de ida: es la misma flecha, reproducida. */}
      <Path path={arrowsGeom.ida} color={SHADE} style="stroke" strokeWidth={6} strokeCap="round" strokeJoin="round" opacity={0.55} />
      <Path path={arrowsGeom.vuelta} color={SHADE} style="stroke" strokeWidth={6} strokeCap="round" strokeJoin="round" opacity={0.55} />
      <Path path={arrowsGeom.ida} color={theme.color.inkDim} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round" />
      <Path path={arrowsGeom.vuelta} color={theme.color.ink} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round" />

      {config.crank ? (
        <>
          <Group transform={tokenT}>
            <BeadView bead={tokenBead} look={IVORY} />
          </Group>
          <Group transform={[{ translateX: layout.crank.x }, { translateY: layout.crank.y }]}>
            <Path path={crankShadow} color="rgba(0, 0, 0, 0.35)">
              <BlurMask blur={6} style="normal" />
            </Path>
            {/* El engranaje enganchado gira sobre su propio centro. */}
            <Group transform={[{ translateX: crank.mateX }]}>
              <Group transform={mateT}>
                <Path path={crank.mateTeeth} color={METAL.dark} style="stroke" strokeWidth={4} strokeCap="round" />
                <Path path={crank.mateTeeth} color={METAL.base} style="stroke" strokeWidth={2.5} strokeCap="round" />
                <Path path={crank.mate}>
                  <RadialGradient
                    c={vec(-crank.mateR * 0.35, -crank.mateR * 0.45)}
                    r={crank.mateR * 1.7}
                    colors={[METAL.light, METAL.base, METAL.dark]}
                  />
                </Path>
              </Group>
            </Group>
            <Group transform={crankT}>
              <Path path={crank.teeth} color={METAL.dark} style="stroke" strokeWidth={5.5} strokeCap="round" />
              <Path path={crank.teeth} color={METAL.base} style="stroke" strokeWidth={3.5} strokeCap="round" />
            </Group>
            {/* La rueda no gira en el dibujo: es redonda, y así la luz queda
                arriba a la izquierda. Giran los dientes y el brazo. */}
            <Path path={crank.body}>
              <RadialGradient
                c={vec(-layout.crank.r * 0.25, -layout.crank.r * 0.3)}
                r={layout.crank.r * 1.1}
                colors={[METAL.light, METAL.base, METAL.dark]}
              />
            </Path>
            <Path path={crank.hub} color={METAL.dark} />
            <Group transform={crankT}>
              <Path path={crank.handle} color={METAL.dark} style="stroke" strokeWidth={5} strokeCap="round" />
              <Group transform={knobT}>
                <Group opacity={knobHintO}>
                  <Path path={knobRing} color={theme.color.ink} style="stroke" strokeWidth={6}>
                    <BlurMask blur={5} style="normal" />
                  </Path>
                </Group>
                <BeadView bead={crank.knob} look={IVORY} />
              </Group>
            </Group>
          </Group>
        </>
      ) : null}

      {layout.nails.map((spot, i) => (
        <Band
          key={i}
          index={i}
          config={config}
          layout={layout}
          spot={spot}
          values={bands[i] as BandValues}
          nail={nail}
          picked={picked === i}
          grip={config.gripBand === i}
          hint={hint}
          jam={jam}
          pop={pop}
          arrive={arrive}
          burst={burst}
          bridgeTo={i === 0 && conDos ? (layout.nails[1]?.y ?? spot.y) - spot.y : null}
        />
      ))}

      <Burst burst={burst} x={bx} y={by} r={12} />

      <Group transform={handT} opacity={handO}>
        <Path path={handGeom} color="rgba(255, 255, 255, 0.16)" />
        <Path path={handGeom} color={theme.color.ink} style="stroke" strokeWidth={2.5} />
      </Group>
    </Group>
    {/* La expresión va en su propio grupo, siempre montado: sin `exprAppear`
        sigue a la banda como siempre; con él, puede estar sola antes que ella. */}
    <Group opacity={exprAppear ?? appear}>
      <Legible path={exprGeom} color={theme.color.ink} />
    </Group>
    </>
  );
}

/**
 * Glifos que se leen sobre cualquier fondo: un contorno oscuro debajo y la tinta
 * encima. La expresión cae fuera del vidrio de la regla, así que no alcanza con
 * el vidrio.
 */
function Legible({ path, color }: { readonly path: SkPath; readonly color: string }) {
  return (
    <>
      <Path path={path} color={SHADE} style="stroke" strokeWidth={3} strokeJoin="round" />
      <Path path={path} color={color} />
    </>
  );
}

/** Una pieza redonda con volumen: sombra en el piso, cuerpo con luz y brillo. */
function BeadView({ bead: b, look }: { readonly bead: Bead; readonly look: Look }) {
  return (
    <>
      <Path path={b.shadow} color="rgba(0, 0, 0, 0.32)">
        <BlurMask blur={2} style="normal" />
      </Path>
      <Path path={b.body}>
        <RadialGradient c={vec(-b.r * 0.35, -b.r * 0.45)} r={b.r * 1.7} colors={[look.light, look.base, look.dark]} />
      </Path>
      <Path path={b.shine} color="rgba(255, 255, 255, 0.55)" />
    </>
  );
}

/** Media altura del cuerpo de la banda. */
const BAND_HALF = 6;

/**
 * Una banda. Sus marcas están todas montadas y cada una deriva su posición del
 * mismo factor: eso es lo que hace que el invariante sea geometría y no una
 * regla del juego. El clavo no aparece en la cuenta porque su distancia al
 * clavo es cero, y cero por cualquier cosa sigue siendo cero.
 */
function Band({
  index,
  config,
  layout,
  spot,
  values,
  nail,
  picked,
  grip: hasGrip,
  hint,
  jam,
  pop,
  arrive,
  burst,
  bridgeTo,
}: {
  readonly index: number;
  readonly config: StretchConfig;
  readonly layout: StretchLayout;
  readonly spot: Spot;
  readonly values: BandValues;
  readonly nail: Bead;
  readonly picked: boolean;
  readonly grip: boolean;
  readonly hint: SharedValue<number>;
  readonly jam: SharedValue<number>;
  readonly pop: SharedValue<number>;
  readonly arrive: SharedValue<number>;
  readonly burst: SharedValue<number>;
  /** Cuánto hay hasta la banda de abajo, si esta se compara con ella. */
  readonly bridgeTo: number | null;
}) {
  const step = layout.step;
  const rest = config.rest;
  const x0 = spot.x;
  const y = spot.y;
  const drawings = config.drawings;

  /**
   * La goma mientras es banda; el color de su fila cuando se aplana en segmento
   * o en dibujos. Así, con dos bandas, se dice cuál es cuál sin mirar la altura.
   */
  const look = config.skin === "rubber_band" ? RUBBER : (TEAM[index % TEAM.length] as Look);

  const bodyGeom = useMemo(() => {
    const len = step * rest;
    const body = Skia.Path.Make();
    body.addRRect(Skia.RRectXY(Skia.XYWHRect(0, -BAND_HALF, len, BAND_HALF * 2), BAND_HALF, BAND_HALF));
    // El brillo va a lo largo del lomo, y el cuerpo lo estira con él.
    const shine = Skia.Path.Make();
    shine.addRRect(Skia.RRectXY(Skia.XYWHRect(len * 0.04, -BAND_HALF * 0.7, len * 0.92, 2.4), 1.2, 1.2));
    const shadow = Skia.Path.Make();
    shadow.addRRect(Skia.RRectXY(Skia.XYWHRect(0, BAND_HALF * 0.6, len, BAND_HALF * 1.3), BAND_HALF, BAND_HALF));
    return { body, shine, shadow };
  }, [step, rest]);

  /** La marca de la banda es una clavija: una pieza, no una raya. */
  const peg = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-2.6, -11, 5.2, 22), 2.6, 2.6));
    return p;
  }, []);

  /** El puente de una marca hasta su pareja en la banda de abajo. */
  const bridge = useMemo(() => {
    if (bridgeTo === null) return null;
    const p = Skia.Path.Make();
    p.moveTo(0, 14);
    p.lineTo(0, bridgeTo - 14);
    return p;
  }, [bridgeTo]);

  const gripBead = useMemo(() => bead(10), []);
  const gripRing = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 16);
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

  /**
   * La manija crece mientras la banda se estira y se asienta con el resorte de
   * caer cuando deja de moverse: "la tenés vos" y "quedó ahí". La escena no sabe
   * si la lleva el dedo, pero sabe si el factor cambió, y lo mira en el hilo de
   * la interfaz.
   */
  const lift = useSharedValue(0);
  useAnimatedReaction(
    () => values.factor.value,
    (cur, prev) => {
      if (!hasGrip || prev === null || cur === prev) return;
      // El primer tirón levanta la manija: aire, una vez por tirón.
      if (lift.value < 0.05) runOnJS(sfx)("lift", 0, 0);
      lift.value = withSequence(
        withTiming(1, { duration: 90 }),
        withDelay(160, withSpring(0, theme.spring.settle)),
      );
    },
    [hasGrip],
  );
  const primera = index === 0;
  const gripT = useDerivedValue(() => {
    const p = primera ? pop.value : 0;
    return [
      { translateX: x0 + rest * step * values.factor.value },
      { translateY: y },
      { scale: (1 + 0.3 * lift.value) * (1 + 0.22 * p) },
    ];
  }, [primera, x0, rest, step, y]);
  // "Agarrá acá" es de la demostración, y va en blanco como la mano fantasma.
  const gripHintO = useDerivedValue(() => 0.55 * hint.value);
  // Contra el tope la banda no pasa: un anillo ámbar late una vez en la manija.
  // Mirá acá, sin decir "mal".
  const gripJamO = useDerivedValue(() => Math.min(1, Math.abs(jam.value) * 1.4));
  const gripOkO = useDerivedValue(() => (primera && bridgeTo === null ? arrive.value : 0), [primera, bridgeTo]);

  /** La banda elegida destella una vez: dice "esta elegiste", no si era la buena. */
  const pickFlash = useSharedValue(1);
  const pickedPrev = useRef(picked);
  useEffect(() => {
    const antes = pickedPrev.current;
    pickedPrev.current = picked;
    if (!picked || antes) return;
    pickFlash.value = 0;
    pickFlash.value = withTiming(1, { duration: 720 });
  }, [picked, pickFlash]);
  const pickFlashO = useDerivedValue(() => (pickFlash.value < 1 ? 0.7 * (1 - pickFlash.value) : 0));

  return (
    <>
      <Group transform={bodyT}>
        <Path path={bodyGeom.shadow} color="rgba(0, 0, 0, 0.35)">
          <BlurMask blur={3} style="normal" />
        </Path>
        <Path path={bodyGeom.body}>
          <LinearGradient
            start={vec(0, -BAND_HALF)}
            end={vec(0, BAND_HALF)}
            colors={[look.light, look.base, look.dark]}
          />
        </Path>
        <Path path={bodyGeom.shine} color="rgba(255, 255, 255, 0.35)" />
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
          peg={peg}
          drawing={drawings.includes(i)}
          drawR={Math.min(step * 0.3, 11)}
          bridge={i >= 1 ? bridge : null}
          bridgeMid={(bridgeTo ?? 0) / 2}
          arrive={arrive}
          burst={burst}
        />
      ))}

      <Group transform={gripT} opacity={hasGrip ? 1 : 0}>
        <Group opacity={gripHintO}>
          <Path path={gripRing} color={theme.color.ink} style="stroke" strokeWidth={6}>
            <BlurMask blur={5} style="normal" />
          </Path>
        </Group>
        <BeadView bead={gripBead} look={IVORY} />
        <Group opacity={gripOkO}>
          <Path path={gripRing} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        </Group>
        <Group opacity={gripJamO}>
          <Path path={gripRing} color={theme.color.warn} style="stroke" strokeWidth={3} />
        </Group>
      </Group>

      {/* El clavo: una cabeza de metal, el cero que no se mueve. */}
      <Group transform={[{ translateX: x0 }, { translateY: y }]}>
        <BeadView bead={nail} look={METAL} />
      </Group>

      {/* La banda elegida en `explain`: la que se toca queda enmarcada en
          vidrio, sin color de significado. */}
      <Group opacity={picked ? 1 : 0}>
        <Path path={halo} color="rgba(255, 255, 255, 0.06)" />
        <Path path={halo} color={theme.color.ink} style="stroke" strokeWidth={2} opacity={0.75} />
      </Group>
      <Group opacity={pickFlashO}>
        <Path path={halo} color={theme.color.ink} style="stroke" strokeWidth={10}>
          <BlurMask blur={7} style="normal" />
        </Path>
      </Group>
    </>
  );
}

/**
 * Una marca de la banda. Su distancia al clavo queda multiplicada por el
 * factor, y con `deform` en 1 se queda quieta salvo que sea el extremo: eso es
 * exactamente lo que no es estirar.
 *
 * Con dos bandas que se comparan, la marca lleva además su puente hasta la
 * marca de abajo: crece desde el medio cuando las dos quedan una sobre la otra,
 * como el puente del nodo 1, porque es el mismo evento —dos cosas quedaron
 * pareja— y por eso es menta.
 */
function BandMark({
  i,
  live,
  x0,
  y,
  step,
  rest,
  values,
  peg,
  drawing,
  drawR,
  bridge,
  bridgeMid,
  arrive,
  burst,
}: {
  readonly i: number;
  readonly live: boolean;
  readonly x0: number;
  readonly y: number;
  readonly step: number;
  readonly rest: number;
  readonly values: BandValues;
  readonly peg: SkPath;
  readonly drawing: boolean;
  readonly drawR: number;
  readonly bridge: SkPath | null;
  readonly bridgeMid: number;
  readonly arrive: SharedValue<number>;
  readonly burst: SharedValue<number>;
}) {
  const cut = values.cut;
  const shape = useMemo(() => (drawing ? drawingPath(i, drawR) : null), [drawing, i, drawR]);
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

  const grow = useDerivedValue(
    () => [{ translateY: bridgeMid }, { scaleY: Math.max(arrive.value, 0.001) }, { translateY: -bridgeMid }],
    [bridgeMid],
  );
  const bridgeHaloO = useDerivedValue(() => arrive.value * (0.3 + 0.7 * (1 - burst.value)));

  return (
    <Group transform={t} opacity={o}>
      {bridge ? (
        <Group transform={grow} opacity={arrive}>
          <Group opacity={bridgeHaloO}>
            <Path path={bridge} color={theme.color.ok} style="stroke" strokeWidth={10} strokeCap="round">
              <BlurMask blur={6} style="normal" />
            </Path>
          </Group>
          <Path path={bridge} color={theme.color.ok} style="stroke" strokeWidth={3.5} strokeCap="round" />
        </Group>
      ) : null}
      <Group transform={[{ translateX: 1.2 }, { translateY: 2 }]}>
        <Path path={peg} color="rgba(0, 0, 0, 0.35)" />
      </Group>
      <Path path={peg}>
        <LinearGradient start={vec(-2.6, 0)} end={vec(2.6, 0)} colors={[IVORY.light, IVORY.base, IVORY.dark]} />
      </Path>
      {shape ? (
        <>
          <Group transform={[{ translateX: 1.2 }, { translateY: 2 }]}>
            <Path path={shape} color="rgba(0, 0, 0, 0.35)" />
          </Group>
          <Path path={shape}>
            <RadialGradient
              c={vec(-drawR * 0.35, -drawR * 0.45)}
              r={drawR * 1.8}
              colors={[IVORY.light, IVORY.base, IVORY.dark]}
            />
          </Path>
          <Path path={shape} color={IVORY.dark} style="stroke" strokeWidth={1.5} strokeJoin="round" />
        </>
      ) : null}
    </Group>
  );
}

const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

/**
 * El jugo de la llegada: un halo menta que se enciende y se apaga, un anillo que
 * se abre y seis chispas menta y oro que salen del lugar y se apagan en ~700 ms.
 * Es el patrón de `Bridge` y `Spark` del nodo 1: todo deriva de `burst`, que va
 * de 0 a 1 una sola vez por llegada. En 1 no se ve nada.
 */
function Burst({
  burst,
  x,
  y,
  r,
}: {
  readonly burst: SharedValue<number>;
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly r: number;
}) {
  const ring = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, r);
    return p;
  }, [r]);
  const t = useDerivedValue(() => [{ translateX: x.value }, { translateY: y.value }]);
  const ringT = useDerivedValue(() => [{ scale: 1 + 1.4 * burst.value }]);
  const ringO = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  const haloO = useDerivedValue(() => (burst.value < 1 ? 0.8 * (1 - burst.value) : 0));
  return (
    <Group transform={t}>
      <Group opacity={haloO}>
        <Path path={ring} color={theme.color.ok}>
          <BlurMask blur={8} style="normal" />
        </Path>
      </Group>
      <Group transform={ringT} opacity={ringO}>
        <Path path={ring} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
      </Group>
      {SPARKS.map((angle, i) => (
        <Spark key={i} angle={angle} from={r} gold={i % 2 === 1} burst={burst} />
      ))}
    </Group>
  );
}

function Spark({
  angle,
  from,
  gold,
  burst,
}: {
  readonly angle: number;
  readonly from: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
}) {
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 3);
    return p;
  }, []);
  const t = useDerivedValue(() => {
    const d = from + 34 * burst.value;
    return [
      { translateX: Math.cos(angle) * d },
      { translateY: Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [angle, from]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}
