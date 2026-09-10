/**
 * Los cuencos de fruta: el objeto concreto de `found.count.cardinality`.
 *
 * La mesa, los cuencos, la franja de dos filas con sus puentes, la canasta y
 * las tarjetas. En `visual` la fila se aplana en una barra con marcas y el
 * puente se contrae en una línea corta, que es el morph que el nodo pide.
 *
 * Tres reglas gobiernan el archivo, y son las mismas que las de la balanza:
 *
 * 1. Modo retained. El árbol se arma con el máximo de objetos que el nivel
 *    admite y no cambia: lo que todavía no está en juego está montado con
 *    opacidad cero. El modo del nivel no cambia mientras la actividad vive, así
 *    que las piezas que dependen de él tampoco se montan ni se desmontan.
 * 2. Lo que se repite y no se anima de a uno va en un solo `SkPath`: los huecos
 *    de las filas, los puentes, la canasta y la mesa son un trazo cada uno.
 *    Solo los objetos y las tarjetas, que se mueven sueltos, tienen componente.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: la posición de un objeto se
 *    deriva de su destino más el desplazamiento del dedo, los dos en valores
 *    compartidos. El destino cambia cuando el jugador suelta, no por cuadro.
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
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import type { CardFace, CardinalityMode, CardinalityProblem, Skin } from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

export type BowlStyle = "concrete" | "visual";

const STROKE = 1.5;
/** Cuántos puntos entran en una tarjeta antes de que dejen de contarse de un vistazo. */
const MAX_DOTS = 12;

/**
 * El color de un objeto dice una sola cosa, y cuál depende de dónde está:
 *
 * - en el cuenco, la **especie** (manzana, naranja, ciruela). Es lo que el
 *   jugador tiene que distinguir cuando el nivel mezcla clases: qué se cuenta.
 * - sobre la barra de `visual`, el **equipo**: a qué colección pertenece la marca.
 *   Ahí la especie ya no importa, y la barra solo compara colecciones.
 *
 * El cuenco de enfrente arranca en la especie siguiente, así que en los niveles
 * de una sola clase cada cuenco tiene su fruta y se distinguen sin mirar la fila.
 */
interface Look {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
  readonly leaf?: string;
}

const SPECIES: readonly Look[] = [
  { light: "#ffb8c0", base: "#ff5f73", dark: "#b8293f", leaf: "#52d485" },
  { light: "#ffe3a6", base: "#ffab38", dark: "#cf7010", leaf: "#52d485" },
  { light: "#dccfff", base: "#9b7dff", dark: "#5438c4", leaf: "#52d485" },
];

const SKIN_LOOK: Record<Exclude<Skin, "fruit" | "mark">, Look> = {
  pebble: { light: "#d3dfec", base: "#8fa2b8", dark: "#526277" },
  shell: { light: "#ffeadb", base: "#ffb996", dark: "#cf7b62" },
};

const TEAM: readonly Look[] = [
  { light: "#b8e2ff", base: theme.color.accent, dark: "#1f7fcf" },
  { light: "#ffd0da", base: theme.color.coral, dark: "#d2465f" },
  { light: "#e2d6ff", base: theme.color.violet, dark: "#7456d6" },
];

const lookOf = (owner: Owner, flat: boolean): Look => {
  if (flat || owner.skin === "mark") return TEAM[owner.bowl % TEAM.length] as Look;
  if (owner.skin === "fruit") return SPECIES[(owner.bowl + owner.kind) % SPECIES.length] as Look;
  return SKIN_LOOK[owner.skin];
};

export const colorOfKind = (bowl: number, kind: number): string =>
  (SPECIES[(bowl + kind) % SPECIES.length] as Look).base;

/** La madera de los cuencos y la canasta: lo único de la mesa que tiene color propio. */
const WOOD = { light: "#d9965a", base: "#a8652f", dark: "#5e3417", inner: "#3a2211" } as const;

// --- Geometría ---------------------------------------------------------------

export interface BowlGeom {
  readonly width: number;
  readonly height: number;
  readonly cx: number;
  /** Los dos lugares de la mesa donde puede haber un cuenco. */
  readonly bowlX: readonly [number, number];
  readonly bowlY: number;
  readonly bowlR: number;
  /** Las dos filas de la franja, una por cuenco. */
  readonly rowY: readonly [number, number];
  readonly stripX: number;
  readonly stripW: number;
  readonly slotW: number;
  readonly slotCount: number;
  readonly cardW: number;
  readonly cardH: number;
  /** Altura de la tarjeta que vive sobre un cuenco. */
  readonly bowlCardY: number;
  /** Altura de las tarjetas entre las que se elige. */
  readonly choiceY: number;
  readonly basketY: number;
  readonly basketW: number;
  /** Radio de un objeto de tamaño uno. */
  readonly unit: number;
}

export function bowlGeom(width: number, height: number, slotCount: number): BowlGeom {
  const cx = width / 2;
  const span = Math.min(width * 0.27, 190);
  const stripW = Math.min(width * 0.84, 620);
  const slots = Math.max(1, slotCount);
  const slotW = stripW / slots;
  // El objeto entra en su hueco con aire: si el hueco se llena entero, dos
  // objetos contiguos se leen como uno solo y la cuenta se pierde.
  const unit = Math.max(6, Math.min(15, slotW * 0.3));
  return {
    width,
    height,
    cx,
    bowlX: [cx - span, cx + span],
    bowlY: height * 0.31,
    bowlR: Math.min(width * 0.15, 60),
    rowY: [height * 0.59, height * 0.74],
    stripX: cx - stripW / 2,
    stripW,
    slotW,
    slotCount: slots,
    cardW: 58,
    cardH: 44,
    bowlCardY: Math.max(26, height * 0.075),
    choiceY: height * 0.92,
    basketY: height * 0.92,
    basketW: Math.min(width * 0.7, 380),
    unit,
  };
}

/**
 * Dónde se apoya cada cuenco según el modo. Emparejar necesita los dos lugares;
 * llenar deja el de la izquierda para la tarjeta objetivo; los demás modos
 * tienen una sola colección y va al centro.
 */
export function bowlCenterX(g: BowlGeom, mode: CardinalityMode, index: number): number {
  if (mode === "pair") return (g.bowlX[index] ?? g.cx) as number;
  if (mode === "fill") return g.bowlX[1] as number;
  return g.cx;
}

/** Un lugar de la escena y si lo que va ahí se ve. */
export interface Place {
  readonly x: number;
  readonly y: number;
  readonly on: boolean;
}

/** Dónde descansa un objeto dentro de su cuenco, antes de que nadie lo toque. */
export function homeOf(
  g: BowlGeom,
  centerX: number,
  i: number,
  count: number,
  arrangement: string,
): Place {
  const r = g.bowlR;
  if (arrangement === "row") {
    const n = Math.max(count, 1);
    const step = Math.min((r * 1.6) / n, g.unit * 2.2);
    return { x: centerX + (i - (n - 1) / 2) * step, y: g.bowlY + r * 0.35, on: true };
  }
  if (arrangement === "pile") {
    // Apilado: tres por hilera, subiendo. Es la disposición que se lee de un
    // vistazo, y por eso es la fácil.
    const perRow = 3;
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const enFila = Math.min(perRow, count - row * perRow);
    return {
      x: centerX + (col - (enFila - 1) / 2) * g.unit * 2.4,
      y: g.bowlY + r * 0.4 - row * g.unit * 2,
      on: true,
    };
  }
  // Desparramado: una grilla corrida al azar, estable por índice. Azar puro
  // amontona dos cosas encima de otra y ahí la cuenta se pierde por el dibujo y
  // no por el conteo, que es justo lo que este nodo no puede permitirse.
  const n = Math.max(count, 1);
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.7)));
  const rows = Math.ceil(n / cols);
  const stepX = Math.min((r * 2.1) / cols, g.unit * 2.8);
  const stepY = Math.min((r * 1.3) / rows, g.unit * 2.6);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const enFila = Math.min(cols, n - row * cols);
  const a = Math.sin(i * 12.9898 + centerX * 0.017) * 43758.5453;
  const b = Math.sin(i * 78.233 + centerX * 0.031) * 12345.6789;
  return {
    x: centerX + (col - (enFila - 1) / 2) * stepX + (a - Math.floor(a) - 0.5) * stepX * 0.3,
    y:
      g.bowlY +
      r * 0.4 -
      (row - (rows - 1) / 2) * stepY +
      (b - Math.floor(b) - 0.5) * stepY * 0.3,
    on: true,
  };
}

/** El centro de un hueco de la franja. La zona de drop es la fila entera. */
export function slotAt(g: BowlGeom, row: number, slot: number): Place {
  return {
    x: g.stripX + (slot + 0.5) * g.slotW,
    y: (g.rowY[row] ?? g.rowY[0]) as number,
    on: true,
  };
}

/** Dónde espera una fruta dentro de la canasta. */
export function basketAt(g: BowlGeom, i: number, n: number): Place {
  const step = Math.min(g.basketW / Math.max(n, 1), g.unit * 2.8);
  return { x: g.cx + (i - (n - 1) / 2) * step, y: g.basketY, on: true };
}

/** Dónde espera una de las tarjetas entre las que hay que elegir. */
export function choiceAt(g: BowlGeom, i: number, n: number): Place {
  const step = Math.min(g.width / Math.max(n + 0.4, 1), g.cardW + 40);
  return { x: g.cx + (i - (n - 1) / 2) * step, y: g.choiceY, on: true };
}

// --- Formas ------------------------------------------------------------------

/** La piel del objeto. Un solo trazo relleno por objeto: el presupuesto manda. */
function shapePath(skin: Skin, r: number): SkPath {
  const p = Skia.Path.Make();
  if (skin === "mark") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.3, -r * 1.3, r * 0.6, r * 2.6), r * 0.3, r * 0.3));
    return p;
  }
  if (skin === "pebble") {
    p.addOval(Skia.XYWHRect(-r * 1.2, -r * 0.78, r * 2.4, r * 1.56));
    return p;
  }
  if (skin === "shell") {
    // Una cúpula: la valva vista de canto, que se reconoce sin nombrarla.
    p.addArc(Skia.XYWHRect(-r * 1.15, -r * 0.95, r * 2.3, r * 1.9), 180, 180);
    p.close();
    return p;
  }
  p.addCircle(0, 0, r);
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.15, -r * 1.55, r * 0.3, r * 0.75), r * 0.15, r * 0.15));
  return p;
}

/** Las partes con que se dibuja un objeto. Todas centradas en el origen. */
interface Parts {
  readonly body: SkPath;
  readonly shine: SkPath;
  readonly shadow: SkPath | null;
  readonly leaf: SkPath | null;
  readonly stem: SkPath | null;
  /** El anillo ámbar de "mirá acá", para la cosa que quedó sin pareja. */
  readonly ring: SkPath;
}

/**
 * Un objeto con volumen: cuerpo con degradado, brillo arriba a la izquierda, y
 * sombra en el piso. Sin cara, nunca: la cara es de Lumi (N §1).
 */
function partsOf(skin: Skin, r: number): Parts {
  const ring = Skia.Path.Make();
  ring.addCircle(0, 0, r * 1.55);
  const shine = Skia.Path.Make();
  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(-r * 0.85, r * 0.78, r * 1.7, r * 0.42));
  if (skin === "fruit") {
    const leaf = Skia.Path.Make();
    leaf.moveTo(r * 0.05, -r * 0.92);
    leaf.quadTo(r * 0.55, -r * 1.55, r * 0.98, -r * 1.12);
    leaf.quadTo(r * 0.5, -r * 0.78, r * 0.05, -r * 0.92);
    leaf.close();
    const stem = Skia.Path.Make();
    stem.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.09, -r * 1.32, r * 0.18, r * 0.5), r * 0.09, r * 0.09));
    shine.addOval(Skia.XYWHRect(-r * 0.62, -r * 0.62, r * 0.5, r * 0.34));
    return { body: shapePath(skin, r), shine, shadow, leaf, stem, ring };
  }
  if (skin === "mark") {
    shine.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.18, -r * 1.15, r * 0.14, r * 1.1), r * 0.07, r * 0.07));
    return { body: shapePath(skin, r), shine, shadow: null, leaf: null, stem: null, ring };
  }
  shine.addOval(Skia.XYWHRect(-r * 0.7, -r * 0.5, r * 0.6, r * 0.28));
  return { body: shapePath(skin, r), shine, shadow, leaf: null, stem: null, ring };
}

/**
 * El cuenco de madera: el cuerpo que se curva hacia abajo desde el borde, la boca
 * oscura y el labio claro. En `visual` es una bandeja plana de vidrio: la
 * analogía se retira y queda la colección.
 */
interface BowlParts {
  readonly body: SkPath;
  readonly mouth: SkPath;
  readonly lip: SkPath;
  readonly shadow: SkPath;
}

function bowlParts(g: BowlGeom, x: number, style: BowlStyle): BowlParts {
  const R = g.bowlR;
  const shadow = Skia.Path.Make();
  if (style === "visual") {
    const tray = Skia.Path.Make();
    tray.addRRect(Skia.RRectXY(Skia.XYWHRect(x - R * 1.1, g.bowlY + R * 0.5, R * 2.2, 9), 4.5, 4.5));
    shadow.addOval(Skia.XYWHRect(x - R * 1.1, g.bowlY + R * 0.5 + 8, R * 2.2, 8));
    return { body: tray, mouth: Skia.Path.Make(), lip: Skia.Path.Make(), shadow };
  }
  // Las frutas se apilan desde `bowlY + 0.4R` hacia arriba: el borde va justo
  // debajo, así se ven apoyadas sobre la boca del cuenco y no flotando delante.
  const y0 = g.bowlY + R * 0.5;
  const body = Skia.Path.Make();
  body.moveTo(x - R * 1.1, y0);
  body.cubicTo(x - R * 1.0, y0 + R * 1.15, x + R * 1.0, y0 + R * 1.15, x + R * 1.1, y0);
  body.close();
  const lip = Skia.Path.Make();
  lip.addOval(Skia.XYWHRect(x - R * 1.14, y0 - R * 0.14, R * 2.28, R * 0.28));
  const mouth = Skia.Path.Make();
  mouth.addOval(Skia.XYWHRect(x - R * 1.0, y0 - R * 0.08, R * 2.0, R * 0.16));
  shadow.addOval(Skia.XYWHRect(x - R * 0.9, y0 + R * 0.78, R * 1.8, R * 0.26));
  return { body, mouth, lip, shadow };
}

/** Los huecos de las dos filas: un solo trazo, porque no se animan de a uno. */
function stripPath(g: BowlGeom, style: BowlStyle, t0: number, t1: number): SkPath {
  const p = Skia.Path.Make();
  const grosor = [t0, t1];
  for (let row = 0; row < 2; row++) {
    const y = (g.rowY[row] ?? 0) as number;
    if (style === "visual") {
      // La fila aplanada: una barra del ancho de la franja, con su grosor.
      const h = 9 * ((grosor[row] ?? 1) as number);
      p.addRRect(Skia.RRectXY(Skia.XYWHRect(g.stripX, y - h / 2, g.stripW, h), h / 2, h / 2));
      continue;
    }
    for (let s = 0; s < g.slotCount; s++) {
      const c = slotAt(g, row, s);
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(c.x - g.slotW * 0.38, c.y - g.unit * 1.4, g.slotW * 0.76, g.unit * 2.8),
          6,
          6,
        ),
      );
    }
  }
  return p;
}

/** La bandeja de vidrio que sostiene las dos filas. */
function trayPath(g: BowlGeom): SkPath {
  const p = Skia.Path.Make();
  const pad = Math.max(g.unit * 2.3, 22);
  p.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(g.stripX - 14, g.rowY[0] - pad, g.stripW + 28, g.rowY[1] - g.rowY[0] + pad * 2),
      20,
      20,
    ),
  );
  return p;
}

function basketPath(g: BowlGeom): SkPath {
  const p = Skia.Path.Make();
  const w = g.basketW;
  const y = g.basketY;
  p.moveTo(g.cx - w / 2, y - 24);
  p.lineTo(g.cx + w / 2, y - 24);
  p.lineTo(g.cx + w * 0.42, y + 24);
  p.lineTo(g.cx - w * 0.42, y + 24);
  p.close();
  return p;
}

/** El tejido de la canasta: tres hileras horizontales, un solo trazo. */
function weavePath(g: BowlGeom): SkPath {
  const p = Skia.Path.Make();
  const w = g.basketW;
  for (const t of [0.28, 0.56, 0.84]) {
    const y = g.basketY - 24 + 48 * t;
    const half = w / 2 - (w / 2 - w * 0.42) * t;
    p.moveTo(g.cx - half + 4, y);
    p.lineTo(g.cx + half - 4, y);
  }
  return p;
}

const handPath = (): SkPath => {
  const p = Skia.Path.Make();
  p.addCircle(0, 0, 14);
  return p;
};

/** Los puntos de la tarjeta, en una o dos hileras como los de un dado. */
function dotsPath(value: number, w: number): SkPath {
  const p = Skia.Path.Make();
  const n = Math.max(0, Math.min(value, MAX_DOTS));
  if (n === 0) return p;
  const filas = n <= 3 ? 1 : 2;
  const cols = n <= 3 ? n : Math.ceil(n / 2);
  const r = Math.max(2.2, Math.min(4.4, (w * 0.72) / Math.max(cols * 2.8, 1)));
  const step = r * 2.9;
  for (let i = 0; i < n; i++) {
    const row = filas === 1 ? 0 : Math.floor(i / cols);
    const col = filas === 1 ? i : i % cols;
    const enFila = filas === 1 ? n : Math.min(cols, n - row * cols);
    p.addCircle((col - (enFila - 1) / 2) * step, (row - (filas - 1) / 2) * step, r);
  }
  return p;
}

// --- Componente --------------------------------------------------------------

/** A qué cuenco pertenece un objeto montado y cómo se dibuja. */
export interface Owner {
  readonly bowl: number;
  readonly kind: number;
  readonly size: number;
  readonly skin: Skin;
}

export interface BowlSceneProps {
  readonly problem: CardinalityProblem;
  readonly style: BowlStyle;
  readonly face: CardFace;
  readonly geom: BowlGeom;
  /** Un lugar por objeto montado. Cambia cuando el jugador suelta, no por cuadro. */
  readonly places: readonly Place[];
  readonly owners: readonly Owner[];
  /** Los objetos que quedaron sin pareja laten: es la fruta salteada del diseño. */
  readonly lonely: readonly boolean[];
  readonly bridges: readonly boolean[];
  /** Qué objetos ya están sobre la barra; en `visual` esos se dibujan como marcas. */
  readonly onBar: readonly boolean[];
  /** Dónde está cada tarjeta elegible y si se ve. */
  readonly cardPlaces: readonly Place[];
  /** Lo que dice la tarjeta de cada cuenco; -1 si ese cuenco todavía no tiene. */
  readonly bowlCounts: readonly number[];
  /** Cuál de las tarjetas elegibles quedó puesta sobre la colección, o -1. */
  readonly cardOn: number;
  /** Sube de a uno por ronda: le dice a la escena que no interpole el salto. */
  readonly round: number;
  /**
   * El objeto y la tarjeta que el jugador acaba de soltar. Van a su destino sin
   * interpolar, porque el dedo ya los dejó ahí: interpolar los haría volver al
   * cuenco y salir de nuevo, que es el brinco que se ve cuando esto falta.
   */
  readonly snapObj: number;
  readonly snapCard: number;
  /** Índice del objeto que el dedo lleva, o -1. */
  readonly dragIdx: SharedValue<number>;
  /** Índice de la tarjeta que el dedo lleva, o -1. */
  readonly dragCard: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
  /** El latido compartido de lo que reclama atención. */
  readonly pulse: SharedValue<number>;
  /** Cuánto se logró la ronda: contrae los puntos en numeral e ilumina el puente. */
  readonly glow: SharedValue<number>;
  /** La mano fantasma de la demostración. */
  readonly demo: SharedValue<number>;
  /** El reordenamiento de las dos animaciones de `explain`. */
  readonly shuffle: SharedValue<number>;
  /** Qué animación tocó el jugador en `explain`, o -1. */
  readonly chosen: number;
}

export function BowlScene(props: BowlSceneProps) {
  const { geom: g, style, problem, places, owners, bridges, face } = props;
  const modo = problem.mode;

  const t0 = problem.bowls[0]?.thickness ?? 1;
  const t1 = problem.bowls[1]?.thickness ?? 1;

  const tray = useMemo(() => trayPath(g), [g]);
  const strip = useMemo(() => stripPath(g, style, t0, t1), [g, style, t0, t1]);
  const bowlShapes = useMemo(
    () => problem.bowls.map((_, i) => bowlParts(g, bowlCenterX(g, modo, i), style)),
    [g, modo, style, problem.bowls],
  );
  const basket = useMemo(() => basketPath(g), [g]);
  const weave = useMemo(() => weavePath(g), [g]);
  const hand = useMemo(handPath, []);

  const bridgeOn = useDerivedValue(() => 0.75 + 0.25 * props.glow.value);
  const demoO = useDerivedValue(() => props.demo.value * (1 - props.glow.value));
  const demoT = useDerivedValue(() => {
    // La mano va del primer objeto a su hueco, en línea recta. Es la única
    // instrucción del juego, y no dice una palabra.
    const from = places[0] ?? { x: g.cx, y: g.bowlY };
    // Emparejar: de la primera fruta a su hueco. Llenar: de la canasta al cuenco.
    const to =
      modo === "fill" ? { x: bowlCenterX(g, modo, 0), y: g.bowlY } : slotAt(g, 0, 0);
    const k = props.demo.value;
    return [
      { translateX: from.x + (to.x - from.x) * k },
      { translateY: from.y + (to.y - from.y) * k },
    ];
  }, [places, g, modo]);

  // La franja, la canasta y las tarjetas elegibles solo existen en los modos que
  // las usan. El modo no cambia mientras el nivel vive, así que gatearlas acá no
  // rompe el modo retained: el árbol sigue siendo el mismo de la primera ronda
  // a la última.
  const hayFranja = modo === "pair";
  const hayCanasta = modo === "fill";
  const hayEleccion = modo === "carry" || modo === "label";

  return (
    <Group>
      {/* En `explain` la mesa y el cuenco no están: lo que se compara son dos
          animaciones del mismo cuenco, cada una en su recuadro. */}
      {hayFranja ? (
        <>
          <Path path={tray} color="rgba(255, 255, 255, 0.05)" />
          <Path path={tray} color="rgba(255, 255, 255, 0.13)" style="stroke" strokeWidth={1} />
          <Path path={strip} color={style === "visual" ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.30)"} />
          <Path path={strip} color="rgba(255, 255, 255, 0.10)" style="stroke" strokeWidth={1} />
          <Group opacity={bridgeOn}>
            {bridges.map((on, s) => (
              <Bridge key={`puente${s}`} geom={g} slot={s} on={on} />
            ))}
          </Group>
        </>
      ) : null}

      {(modo === "lie" ? [] : bowlShapes).map((b, i) => (
        <BowlView key={`bowl${i}`} parts={b} visual={style === "visual"} geom={g} />
      ))}

      {hayCanasta ? (
        <>
          <Path path={basket}>
            <LinearGradient
              start={vec(0, g.basketY - 24)}
              end={vec(0, g.basketY + 24)}
              colors={[WOOD.light, WOOD.base, WOOD.dark]}
            />
          </Path>
          <Path path={weave} color="rgba(58, 34, 17, 0.55)" style="stroke" strokeWidth={2} />
        </>
      ) : null}

      {modo === "lie" ? (
        <LiePanels
          geom={g}
          problem={problem}
          shuffle={props.shuffle}
          pulse={props.pulse}
          chosen={props.chosen}
        />
      ) : (
        owners.map((o, i) => (
          <ObjectView
            key={`obj${i}`}
            index={i}
            owner={o}
            geom={g}
            place={places[i] ?? { x: g.cx, y: g.bowlY, on: false }}
            // La fila se aplana en una barra con marcas: la cosa que llega a la
            // barra deja de ser fruta y pasa a ser una marca del mismo ancho.
            flat={style === "visual" && props.onBar[i] === true}
            lonely={props.lonely[i] === true}
            round={props.round}
            instant={props.snapObj === i}
            dragIdx={props.dragIdx}
            dragX={props.dragX}
            dragY={props.dragY}
            pulse={props.pulse}
          />
        ))
      )}

      {/* La tarjeta objetivo de `fill`: lo que hay que igualar, no lo que hay. */}
      {hayCanasta ? (
        <CardView
          geom={g}
          face={face}
          value={problem.target}
          place={{ x: g.bowlX[0] as number, y: g.bowlCardY, on: true }}
          round={props.round}
          instant={false}
          glow={props.glow}
          index={-1}
          dragCard={props.dragCard}
          dragX={props.dragX}
          dragY={props.dragY}
          tone={theme.color.inkDim}
          contraeConGlow={false}
        />
      ) : null}

      {/* La tarjeta va sobre la colección entera, nunca sobre un objeto. */}
      {props.bowlCounts.map((v, i) =>
        v >= 0 ? (
          <CardView
            key={`bowlcard${i}`}
            geom={g}
            face={face}
            value={v}
            place={{ x: bowlCenterX(g, modo, i), y: g.bowlCardY, on: true }}
            round={props.round}
            instant={false}
            glow={props.glow}
            index={-1}
            dragCard={props.dragCard}
            dragX={props.dragX}
            dragY={props.dragY}
            tone={theme.color.accent}
            contraeConGlow
          />
        ) : null,
      )}

      {hayEleccion
        ? problem.cards.map((c, i) => (
            <CardView
              key={`choice${i}`}
              geom={g}
              face={face}
              value={c.value}
              place={props.cardPlaces[i] ?? { x: g.cx, y: g.choiceY, on: false }}
              round={props.round}
              instant={props.snapCard === i}
              glow={props.glow}
              index={i}
              dragCard={props.dragCard}
              dragX={props.dragX}
              dragY={props.dragY}
              tone={theme.color.accent}
              // Solo la tarjeta que llegó a la colección contrae sus puntos: las
              // otras siguen siendo tres puntos y cuatro, y se pueden comparar.
              contraeConGlow={props.cardOn === i}
            />
          ))
        : null}

      <Group opacity={demoO} transform={demoT}>
        <Path path={hand} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/**
 * Un objeto de la colección. Su destino cambia solo cuando el jugador suelta;
 * mientras el dedo se mueve, la posición sale del valor compartido y nada
 * vuelve al hilo de JavaScript.
 */
function ObjectView({
  index,
  owner,
  geom,
  place,
  flat,
  lonely,
  round,
  instant,
  dragIdx,
  dragX,
  dragY,
  pulse,
}: {
  readonly index: number;
  readonly owner: Owner;
  readonly geom: BowlGeom;
  readonly place: Place;
  readonly flat: boolean;
  readonly lonely: boolean;
  readonly round: number;
  readonly instant: boolean;
  readonly dragIdx: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
  readonly pulse: SharedValue<number>;
}) {
  const r = geom.unit * owner.size;
  const skin: Skin = flat ? "mark" : owner.skin;
  const parts = useMemo(() => partsOf(skin, r), [skin, r]);
  const look = lookOf(owner, flat);
  const ax = useSharedValue(place.x);
  const ay = useSharedValue(place.y);
  const ao = useSharedValue(place.on ? 1 : 0);
  /** El rebote al caer: 1 en el instante en que llega, 0 cuando se asentó. */
  const pop = useSharedValue(0);
  const rondaPrevia = useRef(round);
  const ultimo = useRef(place);

  useEffect(() => {
    const antes = ultimo.current;
    ultimo.current = place;
    // Al cambiar de ronda el objeto no viaja: aparece donde va. Interpolar un
    // salto entre dos problemas distintos se vería como una cosa que se escapa.
    if (rondaPrevia.current !== round) {
      rondaPrevia.current = round;
      ax.value = place.x;
      ay.value = place.y;
      ao.value = place.on ? 1 : 0;
      return;
    }
    const cambio = antes.x !== place.x || antes.y !== place.y || antes.on !== place.on;
    const soltado = instant && dragIdx.value === index;
    if (!cambio && !soltado) return;
    // Soltado: sale desde donde lo dejó el dedo, no desde su casa, y cae con un
    // rebote. Así se siente que llegó a un lugar, y no que se teletransportó.
    if (soltado) {
      ax.value = ax.value + dragX.value;
      ay.value = ay.value + dragY.value;
      dragIdx.value = -1;
    }
    ax.value = withSpring(place.x, theme.spring.settle);
    ay.value = withSpring(place.y, theme.spring.settle);
    ao.value = withTiming(place.on ? 1 : 0, { duration: theme.motion.base });
    if (cambio && place.on) {
      pop.value = 1;
      pop.value = withSpring(0, theme.spring.settle);
    }
  }, [place, round, instant, ax, ay, ao, pop, dragIdx, dragX, dragY, index]);

  const transform = useDerivedValue(() => {
    const llevado = dragIdx.value === index;
    return [
      { translateX: ax.value + (llevado ? dragX.value : 0) },
      { translateY: ay.value + (llevado ? dragY.value : 0) },
      { scale: (llevado ? 1.3 : 1) * (1 + 0.22 * pop.value) },
    ];
  }, [index]);

  // La cosa sin pareja no dice "mal": un anillo ámbar late alrededor y pide que
  // la miren. Ámbar es el color de "mirá acá" en todo el juego.
  const ringO = useDerivedValue(() => (lonely ? 0.35 + 0.65 * pulse.value : 0), [lonely]);

  return (
    <Group transform={transform} opacity={ao}>
      {parts.shadow ? <Path path={parts.shadow} color="rgba(0, 0, 0, 0.30)" /> : null}
      <Path path={parts.body}>
        <RadialGradient c={vec(-r * 0.35, -r * 0.45)} r={r * 1.7} colors={[look.light, look.base, look.dark]} />
      </Path>
      {parts.stem ? <Path path={parts.stem} color="#6b4423" /> : null}
      {parts.leaf && look.leaf ? <Path path={parts.leaf} color={look.leaf} /> : null}
      <Path path={parts.shine} color="rgba(255, 255, 255, 0.5)" />
      <Group opacity={ringO}>
        <Path path={parts.ring} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      </Group>
    </Group>
  );
}

/** El cuenco: madera en la mesa, bandeja de vidrio cuando la analogía se retira. */
function BowlView({
  parts,
  visual,
  geom: g,
}: {
  readonly parts: BowlParts;
  readonly visual: boolean;
  readonly geom: BowlGeom;
}) {
  if (visual) {
    return (
      <>
        <Path path={parts.shadow} color="rgba(0, 0, 0, 0.3)">
          <BlurMask blur={4} style="normal" />
        </Path>
        <Path path={parts.body} color="rgba(255, 255, 255, 0.18)" />
        <Path path={parts.body} color="rgba(255, 255, 255, 0.32)" style="stroke" strokeWidth={1} />
      </>
    );
  }
  const R = g.bowlR;
  return (
    <>
      <Path path={parts.shadow} color="rgba(0, 0, 0, 0.4)">
        <BlurMask blur={7} style="normal" />
      </Path>
      <Path path={parts.body}>
        <LinearGradient
          start={vec(0, g.bowlY + R * 0.5)}
          end={vec(0, g.bowlY + R * 1.4)}
          colors={[WOOD.light, WOOD.base, WOOD.dark]}
        />
      </Path>
      <Path path={parts.lip} color={WOOD.light} />
      <Path path={parts.mouth} color={WOOD.inner} />
    </>
  );
}

const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

/**
 * Un puente entre dos cosas enfrentadas. Crece de la mitad hacia los dos lados y
 * suelta seis chispas una sola vez: es el momento en que dos cosas quedaron
 * pareja, que es exactamente lo que el nivel enseña, así que es el momento que
 * se celebra. Verde menta, porque menta es "coincide".
 */
function Bridge({ geom: g, slot, on }: { readonly geom: BowlGeom; readonly slot: number; readonly on: boolean }) {
  const a = slotAt(g, 0, slot);
  const b = slotAt(g, 1, slot);
  const y0 = a.y + g.unit * 1.5;
  const y1 = b.y - g.unit * 1.5;
  const mid = (y0 + y1) / 2;
  const line = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(a.x, y0);
    p.lineTo(b.x, y1);
    return p;
  }, [a.x, b.x, y0, y1]);

  const k = useSharedValue(on ? 1 : 0);
  const burst = useSharedValue(1);
  useEffect(() => {
    if (on) {
      k.value = withSpring(1, theme.spring.settle);
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
    } else {
      k.value = withTiming(0, { duration: theme.motion.quick });
      burst.value = 1;
    }
  }, [on, k, burst]);

  const grow = useDerivedValue(
    () => [{ translateY: mid }, { scaleY: Math.max(k.value, 0.001) }, { translateY: -mid }],
    [mid],
  );
  const halo = useDerivedValue(() => k.value * (0.3 + 0.7 * (1 - burst.value)));

  return (
    <Group>
      <Group transform={grow} opacity={k}>
        <Group opacity={halo}>
          <Path path={line} color={theme.color.ok} style="stroke" strokeWidth={12} strokeCap="round">
            <BlurMask blur={7} style="normal" />
          </Path>
        </Group>
        <Path path={line} color={theme.color.ok} style="stroke" strokeWidth={4} strokeCap="round" />
      </Group>
      {SPARKS.map((angle, i) => (
        <Spark key={i} x={a.x} y={mid} angle={angle} gold={i % 2 === 1} burst={burst} />
      ))}
    </Group>
  );
}

function Spark({
  x,
  y,
  angle,
  gold,
  burst,
}: {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
}) {
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 3);
    return p;
  }, []);
  const t = useDerivedValue(() => {
    const d = 8 + 34 * burst.value;
    return [
      { translateX: x + Math.cos(angle) * d },
      { translateY: y + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [x, y, angle]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}

/**
 * Una tarjeta. Los puntos son el número antes de escribirse; el numeral es el
 * mismo número contraído, y por eso conserva el tamaño y el color. Los puntos
 * no desaparecen: se contraen cuando la tarjeta llega a su colección.
 */
function CardView({
  geom,
  face,
  value,
  place,
  round,
  instant,
  glow,
  index,
  dragCard,
  dragX,
  dragY,
  tone,
  contraeConGlow,
}: {
  readonly geom: BowlGeom;
  readonly face: CardFace;
  readonly value: number;
  readonly place: Place;
  readonly round: number;
  readonly instant: boolean;
  readonly glow: SharedValue<number>;
  readonly index: number;
  readonly dragCard: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
  readonly tone: string;
  readonly contraeConGlow: boolean;
}) {
  const marco = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(
      Skia.RRectXY(Skia.XYWHRect(-geom.cardW / 2, -geom.cardH / 2, geom.cardW, geom.cardH), 8, 8),
    );
    return p;
  }, [geom.cardW, geom.cardH]);

  const dots = useMemo(() => dotsPath(value, geom.cardW), [value, geom.cardW]);
  const numeral = useMemo(() => numeralGroup(value), [value]);

  const ax = useSharedValue(place.x);
  const ay = useSharedValue(place.y);
  const ao = useSharedValue(place.on ? 1 : 0);
  const rondaPrevia = useRef(round);

  useEffect(() => {
    const salto = rondaPrevia.current !== round || instant;
    rondaPrevia.current = round;
    const d = { duration: theme.motion.base };
    ax.value = salto ? place.x : withTiming(place.x, d);
    ay.value = salto ? place.y : withTiming(place.y, d);
    ao.value = salto ? (place.on ? 1 : 0) : withTiming(place.on ? 1 : 0, d);
  }, [place.x, place.y, place.on, round, instant, ax, ay, ao]);

  const transform = useDerivedValue(() => {
    // Las tarjetas que no se eligen llevan índice -1, que es también el valor de
    // "nada agarrado": sin el `index >= 0`, arrastrar una fruta las llevaba a
    // todas detrás del dedo.
    const llevada = index >= 0 && dragCard.value === index;
    return [
      { translateX: ax.value + (llevada ? dragX.value : 0) },
      { translateY: ay.value + (llevada ? dragY.value : 0) },
      { scale: llevada ? 1.15 : 1 },
    ];
  }, [index]);

  // El numeral nace del gesto, no del reloj: los puntos se contraen cuando la
  // tarjeta correcta llega a su colección.
  const muta = face === "numeral" && contraeConGlow;
  const dotsO = useDerivedValue(() => (muta ? 1 - glow.value : 1), [muta]);
  const numeralO = useDerivedValue(() => (muta ? glow.value : 0), [muta]);
  const lograda = useDerivedValue(() => glow.value, []);

  if (face === "none") return null;

  return (
    <Group transform={transform} opacity={ao}>
      {/* Vidrio oscuro debajo: la tarjeta se lee igual sobre la madera, sobre
          la bandeja o sobre el paisaje. */}
      <Path path={marco} color="rgba(9, 17, 29, 0.9)" />
      <Path path={marco} color={tone} style="stroke" strokeWidth={2} />
      {contraeConGlow ? (
        <Group opacity={lograda}>
          <Path path={marco} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        </Group>
      ) : null}
      <Group opacity={dotsO}>
        <Path path={dots} color={tone} />
      </Group>
      <Group opacity={numeralO}>{numeral}</Group>
    </Group>
  );
}

/** El numeral, dibujado con el mismo atlas que compone las ecuaciones. */
function numeralGroup(value: number): React.ReactNode {
  const char = String(Math.max(0, Math.min(Math.round(value), 9)));
  const glyph = getGlyph(char);
  const path = pathFor(char);
  if (!glyph || !path) return null;
  const size = 30;
  return (
    <Group
      transform={[
        { translateX: -((glyph.left + glyph.right) / 2) * size },
        { translateY: -((glyph.top + glyph.bottom) / 2) * size },
        { scale: size },
      ]}
    >
      <Path path={path} color={theme.color.accent} />
    </Group>
  );
}

/**
 * Las dos animaciones de `explain`. Las dos reordenan el mismo cuenco; en una
 * la tarjeta queda quieta y en la otra gana o pierde un punto mientras las cosas
 * se mueven. El jugador toca la que miente, y no hace falta leer nada.
 */
function LiePanels({
  geom: g,
  problem,
  shuffle,
  pulse,
  chosen,
}: {
  readonly geom: BowlGeom;
  readonly problem: CardinalityProblem;
  readonly shuffle: SharedValue<number>;
  readonly pulse: SharedValue<number>;
  readonly chosen: number;
}) {
  const panelW = Math.min(g.width * 0.4, 250);
  const panelH = Math.min(g.height * 0.5, 230);
  const marco = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-panelW / 2, -panelH / 2, panelW, panelH), 14, 14));
    return p;
  }, [panelW, panelH]);

  const bowl = problem.bowls[0];
  if (!bowl) return null;

  return (
    <>
      {[0, 1].map((i) => (
        <LiePanel
          key={`lie${i}`}
          index={i}
          cx={g.cx + (i === 0 ? -1 : 1) * panelW * 0.57}
          cy={g.height * 0.5}
          marco={marco}
          panelW={panelW}
          panelH={panelH}
          geom={g}
          count={bowl.count}
          shows={problem.cards[i]?.value ?? bowl.count}
          sizes={bowl.sizes}
          kind={bowl.kinds[0] ?? 0}
          shuffle={shuffle}
          pulse={pulse}
          chosen={chosen}
          lying={problem.lying}
        />
      ))}
    </>
  );
}

function LiePanel({
  index,
  cx,
  cy,
  marco,
  panelW,
  panelH,
  geom,
  count,
  shows,
  sizes,
  kind,
  shuffle,
  pulse,
  chosen,
  lying,
}: {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
  readonly marco: SkPath;
  readonly panelW: number;
  readonly panelH: number;
  readonly geom: BowlGeom;
  readonly count: number;
  readonly shows: number;
  readonly sizes: readonly number[];
  readonly kind: number;
  readonly shuffle: SharedValue<number>;
  readonly pulse: SharedValue<number>;
  readonly chosen: number;
  readonly lying: number;
}) {
  const u = geom.unit;
  // Dos disposiciones del mismo cuenco: apilada y en fila. El reordenamiento va
  // de una a la otra, ida y vuelta, sin parar. Las cosas son las mismas.
  const apilado = useMemo(() => {
    const p = Skia.Path.Make();
    for (let i = 0; i < count; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      p.addCircle(cx + (col - 1) * u * 2.5, cy + panelH * 0.18 - row * u * 2.3, u * (sizes[i] ?? 1));
    }
    return p;
  }, [count, cx, cy, panelH, u, sizes]);

  const enFila = useMemo(() => {
    const p = Skia.Path.Make();
    const step = Math.min((panelW * 0.8) / Math.max(count, 1), u * 2.6);
    for (let i = 0; i < count; i++) {
      p.addCircle(cx + (i - (count - 1) / 2) * step, cy + panelH * 0.2, u * (sizes[i] ?? 1));
    }
    return p;
  }, [count, cx, cy, panelW, panelH, u, sizes]);

  const look = SPECIES[kind % SPECIES.length] as Look;
  const apiladoO = useDerivedValue(() => 1 - shuffle.value);
  const filaO = useDerivedValue(() => shuffle.value);

  const miente = index === lying;
  const base = Math.min(count, shows);
  const tope = Math.max(count, shows);
  const crece = shows > count;
  const baseDots = useMemo(() => dotsPath(base, geom.cardW), [base, geom.cardW]);
  const topeDots = useMemo(() => dotsPath(tope, geom.cardW), [tope, geom.cardW]);
  const baseO = useDerivedValue(
    () => (!miente ? 1 : crece ? 1 - shuffle.value : shuffle.value),
    [miente, crece],
  );
  const topeO = useDerivedValue(
    () => (!miente ? 0 : crece ? shuffle.value : 1 - shuffle.value),
    [miente, crece],
  );

  const cardFrame = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(
      Skia.RRectXY(Skia.XYWHRect(-geom.cardW / 2, -geom.cardH / 2, geom.cardW, geom.cardH), 8, 8),
    );
    return p;
  }, [geom.cardW, geom.cardH]);

  // Sin elección, los dos paneles laten por igual. Elegido uno, el otro se apaga
  // y el elegido queda: no hay cartel, hay atención.
  const marcoO = useDerivedValue(
    () => (chosen < 0 ? 0.55 + 0.45 * pulse.value : chosen === index ? 1 : 0.25),
    [chosen],
  );
  const aciertoO = useDerivedValue(
    () => (chosen === index && miente ? 1 : 0),
    [chosen, miente],
  );

  return (
    <Group>
      <Group transform={[{ translateX: cx }, { translateY: cy }]}>
        <Path path={marco} color="rgba(9, 17, 29, 0.55)" />
        <Group opacity={marcoO}>
          <Path path={marco} color="rgba(255, 255, 255, 0.35)" style="stroke" strokeWidth={2} />
        </Group>
        <Group opacity={aciertoO}>
          <Path path={marco} color={theme.color.ok} style="stroke" strokeWidth={3} />
        </Group>
      </Group>
      <Group opacity={apiladoO}>
        <Path path={apilado}>
          <LinearGradient
            start={vec(cx, cy - panelH * 0.05)}
            end={vec(cx, cy + panelH * 0.3)}
            colors={[look.light, look.base, look.dark]}
          />
        </Path>
      </Group>
      <Group opacity={filaO}>
        <Path path={enFila}>
          <LinearGradient
            start={vec(cx, cy + panelH * 0.1)}
            end={vec(cx, cy + panelH * 0.3)}
            colors={[look.light, look.base, look.dark]}
          />
        </Path>
      </Group>
      <Group transform={[{ translateX: cx }, { translateY: cy - panelH * 0.3 }]}>
        <Path path={cardFrame} color={theme.color.accent} style="stroke" strokeWidth={2} />
        <Group opacity={baseO}>
          <Path path={baseDots} color={theme.color.accent} />
        </Group>
        <Group opacity={topeO}>
          <Path path={topeDots} color={theme.color.accent} />
        </Group>
      </Group>
    </Group>
  );
}
