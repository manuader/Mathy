/**
 * El viaje de dos tramos: el objeto concreto de `arith.add.displacement`.
 *
 * La pista del nodo 2 con el agua alta, y abajo la misma manivela con una
 * pieza nueva: un tope. Soltar una ficha sobre la manivela ilumina tantos
 * dientes como dice la ficha y abre una fila en el libro; girar salta el tramo
 * entero de un tirón. Los dos números de la suma entran por lugares distintos
 * —uno es la piedra donde está el caminante, el otro es el tope— y esa
 * diferencia de superficie es el contenido del nodo, no un adorno.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las fichas del cajón, las dos pistas de `explain` y el renglón
 *    están siempre montados; lo que no se usa va con opacidad cero.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Una pista de treinta
 *    piedras cuesta lo mismo que una de cinco.
 * 3. Nada vuelve al hilo de JavaScript por cuadro. La posición del caminante,
 *    el giro de la manivela y el arrastre de una ficha se derivan de los
 *    `SharedValue` que trae el gesto.
 *
 * Nada de texto: los numerales y el `+` son contornos del atlas de glifos, los
 * mismos que compone la ecuación del nodo 13.
 *
 * ESCENA COMPARTIDA: la mecánica `gears_sequence` la estrena el nodo 2 en
 * `PathScene.tsx`. Las dos escenas dibujan la misma manivela y la misma pista y
 * habría que unificarlas, pero el nodo 2 no tiene tope, ni libro, ni flecha, ni
 * renglón, y sus tipos son los suyos; agregarle todo eso por props hubiera
 * hecho un componente con dos vidas. La unificación está anotada en el reporte.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { TEETH_PER_TURN, type Trip, type TripLevel } from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Cuánto se despega el caminante del camino cuando el dedo lo levanta. */
const LIFT = 30;
/** Cuánto gira la manivela por diente. */
export const TOOTH_ANGLE = (2 * Math.PI) / TEETH_PER_TURN;
/** Fichas montadas siempre, para que el árbol no cambie entre rondas. */
export const CHIP_VIEWS = 6;
/** Filas del libro montadas siempre: tres tramos y el total. */
export const LEDGER_ROWS = 4;

const PAD = 46;
/** Con pocas piedras la pista no se estira hasta el absurdo. */
const MAX_STEP = 96;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

/** Suaviza el paseo de la mano fantasma: tiene que parecer un gesto, no un salto. */
function ghostT01(t: number): number {
  "worklet";
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** Una pista dibujada. `explain` monta dos; el resto de los niveles, una. */
export interface Rail {
  readonly stones: readonly Spot[];
  readonly y: number;
  readonly step: number;
  readonly from: Spot;
  readonly to: Spot;
}

/** Una celda del renglón: un numeral, un signo, o el hueco que hay que llenar. */
export interface Cell {
  readonly kind: "num" | "plus" | "eq" | "slot";
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface TrackLayout {
  readonly rail: Rail;
  /** Las dos pistas de `explain`, o vacío. */
  readonly rows: readonly Rail[];
  readonly stoneR: number;
  readonly cardW: number;
  readonly cardH: number;
  readonly cardDy: number;
  readonly touchR: number;
  /** Cada cuántas piedras se dibuja el numeral: con la pista larga no entran todos. */
  readonly numeralEvery: number;
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  readonly chips: readonly Spot[];
  readonly chipW: number;
  readonly chipH: number;
  readonly ledger: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    readonly rowH: number;
  };
  readonly cells: readonly Cell[];
  /** El hueco del renglón, o el lugar de la ficha de llegada. */
  readonly slot: Cell | null;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la ficha entraría donde no se ve.
 */
export function trackLayout(
  trip: Trip,
  level: TripLevel,
  width: number,
  height: number,
): TrackLayout {
  const units = Math.max(trip.length - 1, 1);
  const railY = level.row ? height * 0.2 : height * 0.32;
  const rail = makeRail(trip, width, railY, units);

  const rows: Rail[] = level.explain
    ? [makeRail(trip, width, height * 0.2, units), makeRail(trip, width, height * 0.46, units)]
    : [];

  const step = rail.step;
  const crankR = Math.max(32, Math.min(46, height * 0.13));
  const crank = { x: PAD + crankR, y: height - crankR - 12, r: crankR };

  const chipH = 46;
  const chipW = 46;
  const gap = 10;
  const total = CHIP_VIEWS * chipW + (CHIP_VIEWS - 1) * gap;
  const drawerCx = Math.max(crank.x + crankR + 20 + total / 2, width * 0.55);
  const chipY = height - chipH / 2 - 14;
  const chips: Spot[] = [];
  for (let i = 0; i < CHIP_VIEWS; i++) {
    chips.push(
      i < trip.tiles.length
        ? { x: drawerCx - total / 2 + chipW / 2 + i * (chipW + gap), y: chipY }
        : { x: drawerCx, y: height + chipH * 2 },
    );
  }

  const ledgerW = Math.min(190, width * 0.26);
  const rowH = 26;
  const ledger = {
    x: width - ledgerW - PAD / 2,
    y: railY + height * 0.14,
    w: ledgerW,
    h: rowH * (LEDGER_ROWS + 1),
    rowH,
  };

  const cells = level.row ? makeCells(trip, width, height * 0.5) : [];
  const slot = cells.find((c) => c.kind === "slot") ?? null;

  return {
    rail,
    rows,
    stoneR: Math.min(step * 0.36, 22),
    cardW: Math.min(step * 0.9, 30),
    cardH: 24,
    cardDy: 28,
    touchR: Math.max(step * 0.55, 22),
    numeralEvery: step >= 30 ? 1 : step >= 20 ? 2 : 5,
    crank,
    chips,
    chipW,
    chipH,
    ledger,
    cells,
    slot,
  };
}

function makeRail(trip: Trip, width: number, y: number, units: number): Rail {
  const step = Math.min((width - 2 * PAD) / units, MAX_STEP);
  const drawn = step * units;
  const left = (width - drawn) / 2;
  const stones: Spot[] = [];
  for (let i = 0; i < trip.length; i++) stones.push({ x: left + i * step, y });
  return { stones, y, step, from: { x: left, y }, to: { x: left + drawn, y } };
}

/**
 * El renglón. El primer número es la piedra de partida y no un tramo, así que
 * cuando el caminante sale de la orilla se calla: `0 + 3 + 2` diría lo mismo
 * que `3 + 2` con una ficha de más.
 */
function makeCells(trip: Trip, width: number, y: number): Cell[] {
  const w = 44;
  const sign = 30;
  const kinds: { kind: Cell["kind"]; value: number }[] = [];
  if (trip.start > 0) kinds.push({ kind: "num", value: trip.start });
  trip.steps.forEach((s, i) => {
    if (kinds.length > 0) kinds.push({ kind: "plus", value: 0 });
    kinds.push({ kind: i === trip.hidden ? "slot" : "num", value: s });
  });
  kinds.push({ kind: "eq", value: 0 });
  kinds.push({ kind: trip.hidden >= 0 ? "num" : "slot", value: trip.arrival });

  const widths = kinds.map((k) => (k.kind === "plus" || k.kind === "eq" ? sign : w));
  const gap = 8;
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (kinds.length - 1);
  let x = (width - totalW) / 2;
  return kinds.map((k, i) => {
    const cw = widths[i] as number;
    const cell: Cell = { kind: k.kind, value: k.value, x: x + cw / 2, y, w: cw, h: 46 };
    x += cw + gap;
    return cell;
  });
}

// --- Numerales ---------------------------------------------------------------

/**
 * Un numeral, dibujado. Sale del mismo atlas que la ecuación del nodo 13, así
 * que el `5` de una tarjeta y el `5` de una ecuación son el mismo objeto.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  for (const c of chars) advance += getGlyph(c)?.advance ?? 0.5;
  let x = cx - (advance * size) / 2;
  // Los dígitos van de -0.666 em a la línea de base, así que centrarlos es
  // bajar el trazo un tercio de em.
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
 * El mismo número sin numeral: puntos en una grilla. Es lo que queda en el
 * último nivel, donde la estructura tiene que reconocerse sin saber leer cifras.
 */
function addDots(target: SkPath, value: number, cx: number, cy: number, size: number): void {
  const cols = Math.min(3, Math.max(1, value));
  const rows = Math.ceil(value / cols);
  const d = size * 0.3;
  for (let i = 0; i < value; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    target.addCircle(
      cx + (c - (cols - 1) / 2) * d * 1.9,
      cy + (r - (rows - 1) / 2) * d * 1.9,
      d * 0.6,
    );
  }
}

/** Un número dibujado como lo pide el nivel: cifra, o cuenta de puntos. */
function addNumber(
  target: SkPath,
  value: number,
  cx: number,
  cy: number,
  size: number,
  numerals: boolean,
): void {
  if (numerals || value > 9) addGlyphs(target, String(value), cx, cy, size);
  else addDots(target, value, cx, cy, size);
}

// --- Geometría ---------------------------------------------------------------

interface RailGeom {
  readonly water: SkPath;
  readonly stones: SkPath;
  readonly cards: SkPath;
  readonly numerals: SkPath;
  readonly flag: SkPath;
  readonly flagStone: SkPath;
}

function buildRail(trip: Trip, level: TripLevel, l: TrackLayout, rail: Rail): RailGeom {
  const mark = level.skin !== "stone";
  const water = Skia.Path.Make();
  if (mark) {
    water.moveTo(rail.from.x, rail.from.y);
    water.lineTo(rail.to.x, rail.to.y);
  } else {
    water.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(rail.from.x - 10, rail.from.y - 15, rail.to.x - rail.from.x + 20, 30),
        15,
        15,
      ),
    );
  }

  const stones = Skia.Path.Make();
  const cards = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const size = Math.min(l.cardH * 0.72, 18);

  for (let i = 0; i < trip.length; i++) {
    const s = rail.stones[i] as Spot;
    if (mark) {
      const h = 8;
      stones.moveTo(s.x, s.y - h);
      stones.lineTo(s.x, s.y + h);
    } else {
      stones.addOval(Skia.XYWHRect(s.x - l.stoneR, s.y - l.stoneR * 0.44, l.stoneR * 2, l.stoneR * 0.88));
    }
    if (!trip.numerals || i % l.numeralEvery !== 0) continue;
    const cx = s.x;
    const cy = s.y + l.cardDy;
    if (!mark) {
      cards.addRRect(
        Skia.RRectXY(Skia.XYWHRect(cx - l.cardW / 2, cy - l.cardH / 2, l.cardW, l.cardH), 5, 5),
      );
    }
    addGlyphs(numerals, String(i), cx, cy, size);
  }

  const flag = Skia.Path.Make();
  const flagStone = Skia.Path.Make();
  const s = rail.stones[trip.flag];
  if (s) {
    flag.moveTo(s.x, s.y - 6);
    flag.lineTo(s.x, s.y - 40);
    flag.lineTo(s.x + 20, s.y - 33);
    flag.lineTo(s.x, s.y - 26);
    flagStone.addOval(
      Skia.XYWHRect(s.x - l.stoneR - 4, s.y - l.stoneR * 0.44 - 4, l.stoneR * 2 + 8, l.stoneR * 0.88 + 8),
    );
  }
  return { water, stones, cards, numerals, flag, flagStone };
}

/** La rueda dentada. Los dientes son todos iguales: eso es el invariante. */
function buildCrank(r: number): { body: SkPath; teeth: SkPath; handle: SkPath } {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  body.addCircle(0, 0, 4);
  const teeth = Skia.Path.Make();
  for (let i = 0; i < TEETH_PER_TURN; i++) {
    const a = i * TOOTH_ANGLE - Math.PI / 2;
    teeth.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    teeth.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
  }
  const handle = Skia.Path.Make();
  handle.moveTo(0, 0);
  handle.lineTo(0, -r * 0.62);
  handle.addCircle(0, -r * 0.62, 8);
  return { body, teeth, handle };
}

/**
 * El tope: tantos dientes iluminados como dice la ficha. Es el segundo número
 * de la suma, y se ve como lo que es —una cantidad de dientes— y no como un
 * lugar de la pista.
 */
function buildStop(r: number, teeth: number): SkPath {
  const p = Skia.Path.Make();
  for (let i = 0; i < Math.min(teeth, TEETH_PER_TURN); i++) {
    const a = i * TOOTH_ANGLE - Math.PI / 2;
    p.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    p.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92);
  }
  return p;
}

/** El caminante: dos trazos, sin cara y sin texto. Sirve para cualquier idioma. */
function buildWalker(): { body: SkPath; head: SkPath } {
  const body = Skia.Path.Make();
  body.moveTo(0, -8);
  body.lineTo(0, -22);
  body.moveTo(-7, -2);
  body.lineTo(0, -10);
  body.lineTo(7, -2);
  body.moveTo(-7, -18);
  body.lineTo(0, -20);
  body.lineTo(7, -16);
  const head = Skia.Path.Make();
  head.addCircle(0, -28, 6);
  return { body, head };
}

/**
 * La estela: un arco por cada piedra que el tramo saltó. Es lo que deja ver por
 * dónde pasó el caminante sin haber pisado, que es la diferencia entre dar un
 * tramo y dar pasos.
 */
function buildTrail(rail: Rail, from: number, to: number): SkPath {
  const p = Skia.Path.Make();
  for (let i = from; i < to; i++) {
    const a = rail.stones[i];
    const b = rail.stones[i + 1];
    if (!a || !b) continue;
    p.moveTo(a.x, a.y - 10);
    p.quadTo((a.x + b.x) / 2, a.y - 34, b.x, b.y - 10);
  }
  return p;
}

/** Una flecha con cola y punta, que abarca tantas marcas como pasos tiene el tramo. */
function buildArrow(rail: Rail, from: number, to: number, lift: number): SkPath {
  const a = rail.stones[from];
  const b = rail.stones[to];
  const p = Skia.Path.Make();
  if (!a || !b) return p;
  const y = a.y - lift;
  p.moveTo(a.x, y);
  p.lineTo(b.x, y);
  // Un tramo de cero no tiene punta: la flecha es un punto, y eso es el dato.
  if (to === from) {
    p.addCircle(a.x, y, 3);
    return p;
  }
  p.moveTo(b.x - 9, y - 5);
  p.lineTo(b.x, y);
  p.lineTo(b.x - 9, y + 5);
  p.moveTo(a.x, y - 5);
  p.lineTo(a.x, y + 5);
  return p;
}

/** Una fila del libro: una marca por paso y el numeral del tramo al costado. */
function buildLedgerRow(
  l: TrackLayout,
  index: number,
  value: number,
  numerals: boolean,
  isTotal: boolean,
): SkPath {
  const p = Skia.Path.Make();
  const y = l.ledger.y + l.ledger.rowH * (index + 0.5) + (isTotal ? 6 : 0);
  const left = l.ledger.x + 12;
  const marks = Math.min(value, 12);
  for (let i = 0; i < marks; i++) {
    const x = left + i * 8;
    p.moveTo(x, y - 6);
    p.lineTo(x, y + 6);
  }
  addNumber(p, value, l.ledger.x + l.ledger.w - 20, y, 16, numerals);
  return p;
}

// --- Componente --------------------------------------------------------------

export interface ChipView {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras la ficha está en el cajón; 0 cuando se usó o no existe. */
  readonly alive: SharedValue<number>;
}

/** Un tramo ya hecho, para dibujar su estela, su flecha y su fila del libro. */
export interface Leg {
  readonly from: number;
  readonly to: number;
  readonly value: number;
}

export interface TrackSceneProps {
  readonly trip: Trip;
  readonly level: TripLevel;
  readonly layout: TrackLayout;
  /** La posición del caminante, en piedras. */
  readonly pos: SharedValue<number>;
  /** 1 mientras flota despegado del camino. */
  readonly lift: SharedValue<number>;
  /** La manivela contra el tope de la orilla: vibra y no pasa. */
  readonly jam: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de las dos animaciones de `explain`, de 0 a 1. */
  readonly clock: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  readonly appear: SharedValue<number>;
  /** La recta que el renglón devuelve al tocar la ficha de llegada. */
  readonly ghostRail: SharedValue<number>;
  /** El arrastre de la flecha por la recta: el largo no cambia. */
  readonly arrowDx: SharedValue<number>;
  /** El valor de la ficha puesta en el tope, o -1. */
  readonly loaded: number;
  readonly legs: readonly Leg[];
  /** En qué anda la ronda. Decide qué grupo se ve y cuál queda en cero. */
  readonly phase: "journey" | "explain" | "answer" | "done";
  /** La fila que el jugador eligió en `explain`, o -1. */
  readonly picked: number;
  /** La respuesta ya puesta en el hueco del renglón, o -1. */
  readonly answered: number;
  readonly chips: readonly ChipView[];
}

export function TrackScene({
  trip,
  level,
  layout,
  pos,
  lift,
  jam,
  hint,
  clock,
  demo,
  appear,
  ghostRail,
  arrowDx,
  loaded,
  legs,
  phase,
  picked,
  answered,
  chips,
}: TrackSceneProps) {
  const railGeom = useMemo(() => buildRail(trip, level, layout, layout.rail), [trip, level, layout]);
  const rowGeoms = useMemo(
    () => layout.rows.map((r) => buildRail(trip, level, layout, r)),
    [trip, level, layout],
  );
  const crank = useMemo(() => buildCrank(layout.crank.r), [layout.crank.r]);
  const stop = useMemo(
    () => buildStop(layout.crank.r, Math.max(0, loaded)),
    [layout.crank.r, loaded],
  );
  const walker = useMemo(buildWalker, []);

  /** Estelas y flechas de los tramos ya hechos, más la del viaje entero. */
  const marks = useMemo(() => {
    const trail = Skia.Path.Make();
    const arrows = Skia.Path.Make();
    for (const leg of legs) {
      trail.addPath(buildTrail(layout.rail, Math.min(leg.from, leg.to), Math.max(leg.from, leg.to)));
      if (level.arrow) arrows.addPath(buildArrow(layout.rail, leg.from, leg.to, 24));
    }
    const whole = Skia.Path.Make();
    if (level.arrow && legs.length > 1) {
      const first = legs[0] as Leg;
      const last = legs[legs.length - 1] as Leg;
      whole.addPath(buildArrow(layout.rail, first.from, last.to, 54));
    }
    return { trail, arrows, whole };
  }, [legs, layout.rail, level.arrow]);

  /** La flecha suelta: la última hecha, que se arrastra y conserva el largo. */
  const loose = useMemo(() => {
    const last = legs[legs.length - 1];
    if (!level.arrow || !last) return Skia.Path.Make();
    return buildArrow(layout.rail, last.from, last.to, 24);
  }, [legs, layout.rail, level.arrow]);

  const ledger = useMemo(() => {
    const box = Skia.Path.Make();
    const rows = Skia.Path.Make();
    const rule = Skia.Path.Make();
    if (!level.ledger) return { box, rows, rule };
    box.addRRect(
      Skia.RRectXY(Skia.XYWHRect(layout.ledger.x, layout.ledger.y, layout.ledger.w, layout.ledger.h), 8, 8),
    );
    legs.forEach((leg, i) => {
      if (i < LEDGER_ROWS - 1) rows.addPath(buildLedgerRow(layout, i, leg.value, trip.numerals, false));
    });
    if (legs.length > 1) {
      const y = layout.ledger.y + layout.ledger.rowH * (LEDGER_ROWS - 1) + 2;
      rule.moveTo(layout.ledger.x + 10, y);
      rule.lineTo(layout.ledger.x + layout.ledger.w - 10, y);
      rows.addPath(
        buildLedgerRow(layout, LEDGER_ROWS - 1, legs.reduce((a, b) => a + b.value, 0), trip.numerals, true),
      );
    }
    return { box, rows, rule };
  }, [level.ledger, layout, legs, trip.numerals]);

  const row = useMemo(() => {
    const boxes = Skia.Path.Make();
    const signs = Skia.Path.Make();
    const slot = Skia.Path.Make();
    for (const cell of layout.cells) {
      if (cell.kind === "plus" || cell.kind === "eq") {
        addGlyphs(signs, cell.kind === "plus" ? "+" : "=", cell.x, cell.y, 26);
        continue;
      }
      const box = Skia.RRectXY(
        Skia.XYWHRect(cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h),
        10,
        10,
      );
      if (cell.kind === "slot") {
        slot.addRRect(box);
        continue;
      }
      boxes.addRRect(box);
      addNumber(signs, cell.value, cell.x, cell.y, 22, trip.numerals);
    }
    return { boxes, signs, slot };
  }, [layout.cells, trip.numerals]);

  /** La respuesta que ya cayó en el hueco. */
  const filled = useMemo(() => {
    const p = Skia.Path.Make();
    if (answered >= 0 && layout.slot) {
      addNumber(p, answered, layout.slot.x, layout.slot.y, 22, trip.numerals);
    }
    return p;
  }, [answered, layout.slot, trip.numerals]);

  const chipGeom = useMemo(() => {
    const size = Math.min(layout.chipH * 0.6, 22);
    return layout.chips.map((spot, i) => {
      const box = Skia.Path.Make();
      box.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(spot.x - layout.chipW / 2, spot.y - layout.chipH / 2, layout.chipW, layout.chipH),
          8,
          8,
        ),
      );
      const digits = Skia.Path.Make();
      const value = trip.tiles[i]?.value;
      if (value !== undefined) addNumber(digits, value, spot.x, spot.y, size, trip.numerals);
      return { box, digits };
    });
  }, [layout, trip.tiles, trip.numerals]);

  const crankT = useDerivedValue(() => [{ rotate: pos.value * TOOTH_ANGLE + jam.value * 0.06 }]);
  const crankGlow = useDerivedValue(() => 0.3 + 0.7 * hint.value);
  const looseT = useDerivedValue(() => [{ translateX: arrowDx.value }]);

  /**
   * La mano fantasma. Es la única instrucción del nodo: lleva la primera ficha
   * del cajón hasta la manivela, que es el gesto que hace las tres cosas a la
   * vez. En el renglón la lleva hasta el hueco. No dice nada porque no puede:
   * el jugador no lee.
   */
  const ghost = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 12);
    const from = layout.chips[0] ?? { x: 0, y: 0 };
    const to = level.row
      ? (layout.slot ?? { x: layout.crank.x, y: layout.crank.y })
      : layout.crank;
    return { dot, from, to: { x: to.x, y: to.y } };
  }, [layout, level.row]);

  const gFrom = ghost.from;
  const gTo = ghost.to;
  const ghostT = useDerivedValue(() => {
    const t = ghostT01(demo.value);
    return [
      { translateX: gFrom.x + (gTo.x - gFrom.x) * t },
      { translateY: gFrom.y + (gTo.y - gFrom.y) * t },
    ];
  }, [gFrom, gTo]);
  const ghostO = useDerivedValue(() => hint.value * 0.5 * Math.sin(demo.value * Math.PI));

  const enExplain = phase === "explain";
  const enRenglon = level.row;
  const railO = useDerivedValue(
    () => (enExplain ? 0 : enRenglon ? ghostRail.value : 1),
    [enExplain, enRenglon],
  );

  return (
    <Group opacity={appear}>
      {/* La pista jugable. En el renglón queda en cero hasta que el jugador la
          pide tocando la ficha de llegada, y vuelve como fantasma. */}
      <Group opacity={railO}>
        <RailView geom={railGeom} level={level} hint={hint} />
        <Path path={marks.trail} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
        <Path path={marks.whole} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        <Group transform={looseT}>
          <Path path={loose} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
        </Group>
        <Path path={marks.arrows} color={theme.color.accent} style="stroke" strokeWidth={2.5} opacity={0.45} />
        <Walker
          walker={walker}
          rail={layout.rail}
          pos={pos}
          lift={lift}
          clock={clock}
          walk={null}
          visible
        />
      </Group>

      {/* Las dos animaciones de `explain`: el mismo viaje, contado de dos
          maneras. En una la ficha de llegada aparece al final; en la otra
          empuja al caminante, como si el doble trazo fuera un botón. */}
      {layout.rows.map((r, i) => (
        <Group key={i} opacity={enExplain ? 1 : 0}>
          <RailView geom={rowGeoms[i] as RailGeom} level={level} hint={hint} />
          <ExplainRow
            rail={r}
            trip={trip}
            clock={clock}
            miente={i === trip.liar}
            elegida={picked === i}
            walker={walker}
          />
        </Group>
      ))}

      {/* El renglón. */}
      <Group opacity={level.row && !enExplain ? 1 : 0}>
        <Path path={row.boxes} color={theme.color.surfaceHigh} />
        <Path path={row.boxes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={row.slot} color={theme.color.accent} style="stroke" strokeWidth={2} />
        <Path path={row.signs} color={theme.color.ink} />
        <Path path={filled} color={theme.color.ok} />
      </Group>

      {/* El libro de cuentas: una fila por tramo y el total abajo del renglón. */}
      <Group opacity={level.ledger && !enExplain ? 1 : 0}>
        <Path path={ledger.box} color={theme.color.surface} />
        <Path path={ledger.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={ledger.rule} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={ledger.rows} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>

      {/* La manivela con su tope. Su giro es la posición del caminante. */}
      <Group
        transform={[{ translateX: layout.crank.x }, { translateY: layout.crank.y }]}
        opacity={level.row || enExplain ? 0 : 1}
      >
        <Path path={crank.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Group transform={crankT}>
          <Path path={stop} color={theme.color.warn} style="stroke" strokeWidth={3} />
          <Path path={crank.teeth} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
          <Group opacity={crankGlow}>
            <Path path={crank.handle} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
          </Group>
        </Group>
      </Group>

      {/* El cajón de fichas. Siempre montadas: las que sobran, invisibles. */}
      {chipGeom.map((g, i) => (
        <ChipItem key={i} geom={g} view={chips[i] as ChipView} />
      ))}

      <Group transform={ghostT} opacity={ghostO}>
        <Path path={ghost.dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/** La pista dibujada: agua, piedras, tarjetas y bandera. */
function RailView({
  geom,
  level,
  hint,
}: {
  readonly geom: RailGeom;
  readonly level: TripLevel;
  readonly hint: SharedValue<number>;
}) {
  const mark = level.skin !== "stone";
  const flagPulse = useDerivedValue(() => 0.45 + 0.55 * hint.value);
  return (
    <>
      <Path
        path={geom.water}
        color={mark ? theme.color.inkDim : "#16324a"}
        style={mark ? "stroke" : "fill"}
        strokeWidth={2}
      />
      <Path
        path={geom.stones}
        color={mark ? theme.color.inkDim : "#3a4a5c"}
        style={mark ? "stroke" : "fill"}
        strokeWidth={2}
      />
      <Path path={geom.cards} color={theme.color.surface} />
      <Path path={geom.cards} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.numerals} color={theme.color.ink} />
      <Group opacity={flagPulse}>
        <Path path={geom.flagStone} color={theme.color.ok} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={geom.flag} color={theme.color.ok} style="stroke" strokeWidth={2} />
    </>
  );
}

/** El caminante sobre una pista. Su posición no vuelve nunca al hilo de JS. */
function Walker({
  walker,
  rail,
  pos,
  lift,
  clock,
  walk,
  visible,
}: {
  readonly walker: { body: SkPath; head: SkPath };
  readonly rail: Rail;
  readonly pos: SharedValue<number>;
  readonly lift: SharedValue<number>;
  readonly clock: SharedValue<number>;
  /** El recorrido de una animación de `explain`, o `null` si lo manda el gesto. */
  readonly walk: { readonly from: number; readonly to: number; readonly delay: number } | null;
  readonly visible: boolean;
}) {
  const ox = rail.stones[0]?.x ?? 0;
  const oy = rail.y;
  const dx = rail.step;
  const from = walk?.from ?? 0;
  const to = walk?.to ?? 0;
  const delay = walk?.delay ?? 0;
  const guiado = walk !== null;

  const transform = useDerivedValue(() => {
    if (!guiado) {
      return [{ translateX: ox + dx * pos.value }, { translateY: oy - LIFT * lift.value }];
    }
    const t = Math.max(0, Math.min(1, (clock.value - delay) / Math.max(0.05, 1 - delay)));
    const eased = t * t * (3 - 2 * t);
    return [{ translateX: ox + dx * (from + (to - from) * eased) }, { translateY: oy }];
  }, [guiado, ox, oy, dx, from, to, delay]);

  return (
    <Group transform={transform} opacity={visible ? 1 : 0}>
      <Path path={walker.body} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/**
 * Una de las dos animaciones de `explain`. La que miente pone la ficha de
 * llegada primero y el caminante la sigue: la llegada como botón de hacer. La
 * honesta camina y la ficha aparece cuando el paso termina.
 */
function ExplainRow({
  rail,
  trip,
  clock,
  miente,
  elegida,
  walker,
}: {
  readonly rail: Rail;
  readonly trip: Trip;
  readonly clock: SharedValue<number>;
  readonly miente: boolean;
  readonly elegida: boolean;
  readonly walker: { body: SkPath; head: SkPath };
}) {
  const chip = useMemo(() => {
    const p = Skia.Path.Make();
    const s = rail.stones[trip.arrival];
    if (!s) return p;
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 20, s.y - 76, 40, 40), 8, 8));
    addGlyphs(p, String(trip.arrival), s.x, s.y - 56, 20);
    return p;
  }, [rail, trip.arrival]);

  // La ficha de la que miente entra antes de que el caminante se mueva; la de
  // la honesta, cuando el viaje ya terminó.
  const chipO = useDerivedValue(() => {
    const t = clock.value;
    return miente ? Math.min(1, t / 0.18) : t < 0.82 ? 0 : Math.min(1, (t - 0.82) / 0.12);
  }, [miente]);

  const dim = useDerivedValue(() => (elegida ? 1 : 0));
  const halo = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(rail.from.x, rail.y);
    p.lineTo(rail.to.x, rail.y);
    return p;
  }, [rail]);

  return (
    <>
      <Path path={chip} color={theme.color.warn} style="stroke" strokeWidth={2} opacity={chipO} />
      <Walker
        walker={walker}
        rail={rail}
        pos={clock}
        lift={clock}
        clock={clock}
        walk={{ from: trip.start, to: trip.arrival, delay: miente ? 0.22 : 0 }}
        visible
      />
      <Path path={halo} color={theme.color.accent} style="stroke" strokeWidth={3} opacity={dim} />
    </>
  );
}

/** Una ficha del cajón. Su dibujo sigue al mismo par de valores que el gesto. */
function ChipItem({
  geom,
  view,
}: {
  readonly geom: { box: SkPath; digits: SkPath };
  readonly view: ChipView;
}) {
  const transform = useDerivedValue(() => [
    { translateX: view.dx.value },
    { translateY: view.dy.value },
  ]);
  return (
    <Group transform={transform} opacity={view.alive}>
      <Path path={geom.box} color={theme.color.surfaceHigh} />
      <Path path={geom.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.digits} color={theme.color.ink} />
    </Group>
  );
}
