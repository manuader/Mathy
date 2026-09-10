/**
 * El ascensor y el caminante: el objeto concreto de `arith.int.negatives`.
 *
 * La pista graduada con el cero en el medio y casillas iguales de los dos
 * lados, el edificio en corte enganchado al mismo eje, el tablero de monedas y
 * vales, y la fila de dibujos del último nivel. Lo que hace legítimo el lado
 * izquierdo es que la separación entre marcas no cambia al cruzar: la pista se
 * dibuja con un solo paso para las `slots` casillas, así que un paso más chico
 * del otro lado no se podría dibujar aunque alguien quisiera.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las fichas, las monedas y las dos animaciones de la vuelta
 *    doble están siempre montadas; lo que no se usa va con opacidad cero. El
 *    modo del nivel no cambia mientras la actividad vive.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Un edificio de cuarenta y
 *    un pisos cuesta lo mismo que uno de siete.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: la posición del caminante,
 *    el giro de la manivela, el arrastre de una ficha y la altura de la calle
 *    se derivan de los `SharedValue` que trae el gesto.
 *
 * Nada de texto: los numerales y el trazo del signo son contornos del atlas de
 * glifos. El signo se dibuja con U+2212 y nunca con un guion de ASCII, que no
 * está en el atlas y dejaría el número sin dibujar.
 *
 * ESCENA PROPIA: este nodo usa `gears_sequence` y `ledger`, que ya viven en
 * `TrackScene.tsx` (nodo 3) y `BowlScene.tsx` (nodo 1). Las dos toman su
 * geometría entera de los tipos de su nodo —`Trip` y `CardinalityProblem`— y
 * ninguna sabe dibujar casillas a la izquierda del cero, un edificio en corte
 * ni una calle que se muda. Parametrizarlas hubiera hecho componentes con tres
 * vidas y hubiera tocado los nodos 1, 2 y 3, así que la unificación queda
 * anotada como deuda, junto a la que U2 ya declara para `PathScene` y
 * `TrackScene`.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import {
  NEG_CHIP_SLOTS,
  NEG_TOKEN_SLOTS,
  negNameAt,
  type NegLevel,
  type NegProblem,
} from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Cuántos dientes tiene una vuelta entera de la manivela: los mismos del nodo 2. */
const TEETH = 12;
export const TOOTH_ANGLE = (2 * Math.PI) / TEETH;
/** Fichas y monedas montadas siempre, para que el árbol no cambie entre rondas. */
export const CHIP_VIEWS = NEG_CHIP_SLOTS;
export const TOKEN_VIEWS = NEG_TOKEN_SLOTS;

const PAD = 40;
/** Con pocas casillas la pista no se estira hasta el absurdo. */
const MAX_STEP = 88;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

export interface ElevatorLayout {
  readonly width: number;
  readonly height: number;
  /** Las casillas de la pista, por índice. */
  readonly stones: readonly Spot[];
  readonly railY: number;
  readonly railStep: number;
  readonly touchR: number;
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  /** El edificio: centro, piso más bajo y altura de un piso. */
  readonly shaft: { readonly x: number; readonly w: number; readonly bottom: number; readonly floorH: number };
  /** Cada cuántos pisos se escribe el numeral: con el edificio alto no entran todos. */
  readonly floorEvery: number;
  /** El tablero: las dos columnas y la ficha del neto. */
  readonly board: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
  readonly tokens: readonly Spot[];
  readonly tokenR: number;
  readonly chips: readonly Spot[];
  readonly chipW: number;
  readonly chipH: number;
  /** La caja marcada donde va la ficha del piso más bajo. */
  readonly box: Spot;
  readonly boxW: number;
  readonly boxH: number;
  /** Las dos paradas escritas, para el nivel que mide sin edificio a la vista. */
  readonly stops: readonly Spot[];
  /** Las dos animaciones de la vuelta doble. */
  readonly rows: readonly number[];
  /** Los dibujos de la fila del último nivel. */
  readonly drawings: readonly Spot[];
  readonly drawingR: number;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la ficha entraría donde no se ve.
 */
export function elevatorLayout(
  problem: NegProblem,
  level: NegLevel,
  width: number,
  height: number,
): ElevatorLayout {
  const conPista = level.mode === "cross" || level.mode === "floor" || level.mode === "turn";
  const units = Math.max(problem.slots - 1, 1);
  const railStep = Math.min((width - 2 * PAD - (level.building === "shown" ? 150 : 0)) / units, MAX_STEP);
  const railY = height * (level.mode === "turn" ? 0.46 : 0.4);
  const drawn = railStep * units;
  const left = level.building === "shown" ? PAD : (width - drawn) / 2;
  const stones: Spot[] = [];
  for (let i = 0; i < problem.slots; i++) stones.push({ x: left + i * railStep, y: railY });

  const crankR = Math.max(30, Math.min(44, height * 0.12));
  const crank = { x: PAD + crankR, y: height - crankR - 10, r: crankR };

  // El edificio: a la derecha cuando comparte pantalla con la pista, al centro
  // cuando es la superficie principal, y sin lugar cuando ya se retiró.
  const alto = height * (conPista ? 0.62 : 0.7);
  const floorH = Math.max(6, Math.min(26, alto / problem.slots));
  const shaftW = Math.min(88, width * 0.16);
  const shaftX =
    conPista ? width - shaftW / 2 - PAD
    : level.mode === "ledger" ? width * 0.18
    : width * 0.5;
  const bottom = height * 0.5 + (problem.slots * floorH) / 2;
  const shaft = { x: shaftX, w: shaftW, bottom, floorH };

  const boardW = Math.min(280, width * 0.42);
  const board = { x: width * 0.56, y: height * 0.16, w: boardW, h: height * 0.44 };

  const tokenR = 15;
  const tokenGap = 14;
  const tokenTotal = TOKEN_VIEWS * tokenR * 2 + (TOKEN_VIEWS - 1) * tokenGap;
  const tokens: Spot[] = [];
  for (let i = 0; i < TOKEN_VIEWS; i++) {
    tokens.push(
      i < problem.tokens.length
        ? {
            x: width * 0.56 - tokenTotal / 2 + tokenR + i * (tokenR * 2 + tokenGap),
            y: height - tokenR - 18,
          }
        : { x: width * 0.56, y: height + tokenR * 4 },
    );
  }

  const chipW = 62;
  const chipH = 48;
  const chipGap = 12;
  const chipCount = Math.max(problem.chips.length, 1);
  const chipTotal = chipCount * chipW + (chipCount - 1) * chipGap;
  // Las dos fichas de piso caen arriba, sobre el edificio; las del cajón que
  // contesta una distancia viven abajo, como en todos los demás nodos.
  const arriba = level.mode === "compare" || level.mode === "moveZero";
  const chipY = arriba ? height * 0.12 : height - chipH / 2 - 18;
  const chips: Spot[] = [];
  for (let i = 0; i < CHIP_VIEWS; i++) {
    chips.push(
      i < problem.chips.length
        ? { x: width / 2 - chipTotal / 2 + chipW / 2 + i * (chipW + chipGap), y: chipY }
        : { x: width / 2, y: height + chipH * 2 },
    );
  }

  const drawingR = Math.min(26, (width - 2 * PAD) / (problem.row.length * 2.6));
  const drawStep = drawingR * 2.6;
  const drawings: Spot[] = [];
  for (let i = 0; i < problem.row.length; i++) {
    drawings.push({
      x: width / 2 + (i - (problem.row.length - 1) / 2) * drawStep,
      y: height * 0.58,
    });
  }

  return {
    width,
    height,
    stones,
    railY,
    railStep,
    touchR: Math.max(railStep * 0.5, 26),
    crank,
    shaft,
    floorEvery: floorH >= 18 ? 1 : floorH >= 11 ? 2 : 5,
    board,
    tokens,
    tokenR,
    chips,
    chipW,
    chipH,
    box: { x: width / 2, y: height * 0.86 },
    boxW: chipW + 24,
    boxH: chipH + 20,
    stops: [
      { x: width / 2 - 80, y: height * 0.13 },
      { x: width / 2 + 80, y: height * 0.13 },
    ],
    rows: [height * 0.3, height * 0.62],
    drawings,
    drawingR,
  };
}

// --- Numerales ---------------------------------------------------------------

/** El signo del número es U+2212, el del atlas. Un guion de ASCII no se dibuja. */
export const signed = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : String(n));

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

// --- Geometría ---------------------------------------------------------------

/**
 * La pista. Un solo paso para todas las casillas: eso es lo que hace que el
 * lado izquierdo sea la misma pista y no otra. El cero lleva el punto grueso
 * heredado del clavo del nodo 5.
 */
function buildRail(problem: NegProblem, level: NegLevel, l: ElevatorLayout, zero: number) {
  const line = Skia.Path.Make();
  const marks = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const zeroDot = Skia.Path.Make();
  const first = l.stones[0];
  const last = l.stones[l.stones.length - 1];
  if (!first || !last) return { line, marks, numerals, zeroDot };

  const piedra = level.skin === "stone";
  if (piedra) {
    line.addRRect(
      Skia.RRectXY(Skia.XYWHRect(first.x - 12, first.y - 4, last.x - first.x + 24, 8), 4, 4),
    );
  } else {
    line.moveTo(first.x - 12, first.y);
    line.lineTo(last.x + 12, first.y);
  }

  for (let i = 0; i < l.stones.length; i++) {
    const s = l.stones[i] as Spot;
    if (piedra) {
      marks.addOval(Skia.XYWHRect(s.x - l.railStep * 0.3, s.y - 7, l.railStep * 0.6, 14));
    } else {
      marks.moveTo(s.x, s.y - 9);
      marks.lineTo(s.x, s.y + 9);
    }
    if (level.numerals) addGlyphs(numerals, signed(negNameAt(i, zero)), s.x, s.y + 26, 16);
  }
  const cero = l.stones[zero];
  if (cero) zeroDot.addCircle(cero.x, cero.y, 7);
  return { line, marks, numerals, zeroDot };
}

/** La rueda dentada. Los dientes son todos iguales: eso es el invariante. */
function buildCrank(r: number): { body: SkPath; teeth: SkPath; handle: SkPath } {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  body.addCircle(0, 0, 4);
  const teeth = Skia.Path.Make();
  for (let i = 0; i < TEETH; i++) {
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

/** Tantos dientes iluminados como dice la ficha del tope. */
function buildStop(r: number, teeth: number): SkPath {
  const p = Skia.Path.Make();
  for (let i = 0; i < Math.min(Math.abs(teeth), TEETH); i++) {
    const a = -i * TOOTH_ANGLE - Math.PI / 2;
    p.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    p.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92);
  }
  return p;
}

/**
 * El caminante con su bandera. La bandera es un triángulo que apunta hacia
 * donde mira, y en el nivel simbólico es el trazo del signo antes de acostarse.
 */
function buildWalker(): { body: SkPath; head: SkPath; flag: SkPath } {
  const body = Skia.Path.Make();
  body.moveTo(0, -8);
  body.lineTo(0, -22);
  body.moveTo(-7, -2);
  body.lineTo(0, -10);
  body.lineTo(7, -2);
  const head = Skia.Path.Make();
  head.addCircle(0, -28, 6);
  const flag = Skia.Path.Make();
  flag.moveTo(0, -22);
  flag.lineTo(16, -18);
  flag.lineTo(0, -14);
  flag.close();
  return { body, head, flag };
}

/**
 * El edificio en corte. Los pisos de arriba llevan ventana y los de abajo la
 * luz de garaje: así se distinguen sin leer, que es lo que pide `literacy: none`.
 */
function buildShaft(problem: NegProblem, level: NegLevel, l: ElevatorLayout, zero: number) {
  const walls = Skia.Path.Make();
  const windows = Skia.Path.Make();
  const garage = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const street = Skia.Path.Make();
  const { x, w, bottom, floorH } = l.shaft;

  for (let i = 0; i < problem.slots; i++) {
    const y = bottom - (i + 1) * floorH;
    walls.addRect(Skia.XYWHRect(x - w / 2, y, w, floorH));
    const cy = y + floorH / 2;
    if (i > zero) {
      windows.addRect(Skia.XYWHRect(x - w * 0.22, cy - floorH * 0.22, w * 0.2, floorH * 0.44));
    } else if (i < zero) {
      // La luz de garaje: un abanico corto, que se reconoce sin nombrarlo.
      garage.moveTo(x - w * 0.26, cy);
      garage.lineTo(x + w * 0.18, cy);
    }
    // El numeral va afuera de la pared. Adentro, el trazo del signo se pega a
    // la luz de garaje y los dos se leen como una sola raya.
    if (level.numerals && i % l.floorEvery === 0 && floorH >= 9) {
      addGlyphs(numerals, signed(negNameAt(i, zero)), x + w / 2 + 16, cy, Math.min(14, floorH * 0.7));
    }
  }
  const sy = bottom - zero * floorH;
  street.moveTo(x - w * 0.85, sy);
  street.lineTo(x + w * 0.85, sy);

  // La altura marcada: adonde hay que mudar la calle. Se dibuja a rayas para
  // que no se confunda con la calle misma, que es la que se arrastra.
  const mark = Skia.Path.Make();
  if (problem.moveTo !== null) {
    const my = bottom - problem.moveTo * floorH;
    for (let i = -5; i < 5; i++) {
      mark.moveTo(x + (i * w * 1.7) / 10, my);
      mark.lineTo(x + (i * w * 1.7) / 10 + w * 0.1, my);
    }
  }
  return { walls, windows, garage, numerals, street, mark };
}

/** El ascensor: la caja que sube y baja por el mismo eje que la manivela. */
function buildCar(w: number, h: number): SkPath {
  const p = Skia.Path.Make();
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(-w * 0.34, -h * 0.4, w * 0.68, h * 0.8), 3, 3));
  return p;
}

/** Una moneda es un disco lleno; un vale, un rectángulo hueco. */
function tokenPath(value: number, r: number): SkPath {
  const p = Skia.Path.Make();
  const size = r * (0.6 + 0.2 * Math.min(3, Math.abs(value)));
  if (value >= 0) {
    p.addCircle(0, 0, size);
    return p;
  }
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(-size, -size * 0.7, size * 2, size * 1.4), 3, 3));
  return p;
}

/** El tablero: dos columnas, la de las monedas y la de los vales. */
function buildBoard(l: ElevatorLayout) {
  const box = Skia.Path.Make();
  const split = Skia.Path.Make();
  const { x, y, w, h } = l.board;
  box.addRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2, y, w, h), 10, 10));
  split.moveTo(x, y + 10);
  split.lineTo(x, y + h - 10);
  return { box, split };
}

/** Dónde descansa una moneda o un vale ya puesto en su columna. */
export function boardSlot(l: ElevatorLayout, value: number, order: number): Spot {
  const { x, y, w, h } = l.board;
  const col = value >= 0 ? x - w / 4 : x + w / 4;
  const filas = Math.max(1, Math.floor((h - 30) / 38));
  return { x: col, y: y + 26 + (order % filas) * 38 };
}

/** Una ficha con su numeral y, si hace falta, el trazo del signo. */
function chipPath(value: number, w: number, h: number, numerals: boolean): { box: SkPath; ink: SkPath } {
  const box = Skia.Path.Make();
  box.addRRect(Skia.RRectXY(Skia.XYWHRect(-w / 2, -h / 2, w, h), 9, 9));
  const ink = Skia.Path.Make();
  if (numerals) {
    addGlyphs(ink, signed(value), 0, 0, Math.min(h * 0.5, 24));
  } else {
    // Sin numerales, el valor es una cuenta de puntos y el lado es una flecha.
    const n = Math.min(Math.abs(value), 6);
    for (let i = 0; i < n; i++) ink.addCircle((i - (n - 1) / 2) * 9, 0, 3);
  }
  return { box, ink };
}

/**
 * Un dibujo de la fila del último nivel. No es un numeral ni una casilla: es
 * una forma cualquiera, y por eso sirve para probar que la dirección se
 * entendió sin la pista graduada.
 */
function drawingPath(index: number, r: number): SkPath {
  const p = Skia.Path.Make();
  const k = index % 4;
  if (k === 0) p.addCircle(0, 0, r * 0.6);
  else if (k === 1) p.addRect(Skia.XYWHRect(-r * 0.5, -r * 0.5, r, r));
  else if (k === 2) {
    p.moveTo(0, -r * 0.6);
    p.lineTo(r * 0.6, r * 0.5);
    p.lineTo(-r * 0.6, r * 0.5);
    p.close();
  } else {
    p.moveTo(0, -r * 0.65);
    p.lineTo(r * 0.6, 0);
    p.lineTo(0, r * 0.65);
    p.lineTo(-r * 0.6, 0);
    p.close();
  }
  return p;
}

// --- Componente --------------------------------------------------------------

/** Una ficha o una moneda arrastrable. */
export interface DragView {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras está en su lugar de origen; 0 cuando se usó o no existe. */
  readonly alive: SharedValue<number>;
}

export interface ElevatorSceneProps {
  readonly problem: NegProblem;
  readonly level: NegLevel;
  readonly layout: ElevatorLayout;
  /** La posición del caminante, en casillas. */
  readonly pos: SharedValue<number>;
  /** Hacia dónde mira: 1 a la derecha, -1 a la izquierda. */
  readonly facing: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de las dos animaciones de la vuelta doble, de 0 a 1. */
  readonly clock: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  readonly appear: SharedValue<number>;
  /** El edificio que el nivel 6 pide con un toque. */
  readonly ghost: SharedValue<number>;
  /**
   * El edificio queda a la vista aunque esté retirado. Se usa mientras el
   * jugador muda la calle: la calle es parte del edificio, y pedirle que
   * arrastre algo que no está en pantalla no es una dificultad, es un error.
   */
  readonly pinned: boolean;
  /** La calle mientras el dedo la arrastra, en pisos. */
  readonly street: SharedValue<number>;
  /** El índice de la calle ya asentada: con eso se nombran los pisos. */
  readonly zero: number;
  /** El tope puesto en la manivela, con signo, o 0 si la manivela está desnuda. */
  readonly loaded: number;
  /** El neto que muestra el tablero. */
  readonly net: number;
  /** En qué orden entró cada moneda al tablero, o -1 si sigue en la bandeja. */
  readonly placed: readonly number[];
  /** Los pares que ya se apagaron. */
  readonly cancelled: readonly boolean[];
  /** La ficha que ya cayó en la caja, o -1. */
  readonly answered: number;
  /** La animación de la vuelta doble que el jugador tocó, o -1. */
  readonly picked: number;
  /** El dibujo que el jugador tocó, o -1. */
  readonly tapped: number;
  readonly phase: "explain" | "move" | "play" | "done";
  readonly chips: readonly DragView[];
  readonly tokens: readonly DragView[];
}

export function ElevatorScene(props: ElevatorSceneProps) {
  const { problem, level, layout: l, zero } = props;
  const conPista = level.mode === "cross" || level.mode === "floor" || level.mode === "turn";
  const hayEdificio = level.building !== "none";

  const rail = useMemo(() => buildRail(problem, level, l, zero), [problem, level, l, zero]);
  const crank = useMemo(() => buildCrank(l.crank.r), [l.crank.r]);
  const stop = useMemo(() => buildStop(l.crank.r, props.loaded), [l.crank.r, props.loaded]);
  const walker = useMemo(buildWalker, []);
  const shaft = useMemo(() => buildShaft(problem, level, l, zero), [problem, level, l, zero]);
  const car = useMemo(() => buildCar(l.shaft.w, l.shaft.floorH), [l.shaft.w, l.shaft.floorH]);
  const board = useMemo(() => buildBoard(l), [l]);

  const boxPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(
      Skia.RRectXY(Skia.XYWHRect(l.box.x - l.boxW / 2, l.box.y - l.boxH / 2, l.boxW, l.boxH), 12, 12),
    );
    return p;
  }, [l]);

  const netPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (!level.board) return p;
    addGlyphs(p, signed(props.net), l.board.x, l.board.y + l.board.h + 24, 24);
    return p;
  }, [level.board, props.net, l.board]);

  const targetPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (!level.board) return p;
    // El neto pedido, dibujado como el piso al que el ascensor tiene que llegar.
    addGlyphs(p, signed(problem.netTarget), l.board.x, l.board.y - 18, 22);
    return p;
  }, [level.board, problem.netTarget, l.board]);

  const chipGeom = useMemo(
    () =>
      l.chips.map((spot, i) => {
        const chip = problem.chips[i];
        const g = chipPath(chip?.value ?? 0, l.chipW, l.chipH, level.numerals);
        return { ...g, spot };
      }),
    [l, problem.chips, level.numerals],
  );

  const tokenGeom = useMemo(
    () => problem.tokens.map((t) => tokenPath(t.value, l.tokenR)),
    [problem.tokens, l.tokenR],
  );

  /**
   * Las dos paradas escritas. En el nivel que mide el edificio se pide con un
   * toque, así que los dos pisos tienen que poder leerse sin él: si no, la
   * pregunta no se podría contestar con el edificio apagado.
   */
  const stops = useMemo(() => {
    const boxes = Skia.Path.Make();
    const ink = Skia.Path.Make();
    if (level.mode !== "distance") return { boxes, ink };
    problem.floors.forEach((f, i) => {
      const s = l.stops[i] as Spot;
      boxes.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 34, s.y - 24, 68, 48), 9, 9));
      addGlyphs(ink, signed(negNameAt(f, zero)), s.x, s.y, 24);
    });
    return { boxes, ink };
  }, [level.mode, problem.floors, l.stops, zero]);

  const rowGeom = useMemo(() => {
    const shapes = Skia.Path.Make();
    const origin = Skia.Path.Make();
    if (level.mode !== "arbitrary") return { shapes, origin, arrow: Skia.Path.Make(), steps: Skia.Path.Make() };
    l.drawings.forEach((s, i) => {
      const d = drawingPath(i, l.drawingR);
      d.transform([1, 0, s.x, 0, 1, s.y, 0, 0, 1]);
      shapes.addPath(d);
    });
    const o = l.drawings[problem.row.origin];
    if (o) origin.addCircle(o.x, o.y, l.drawingR * 1.25);
    // La ficha de dirección: una flecha y tantos íconos como pasos. Sin ningún
    // numeral, que es lo que el nivel prueba.
    const arrow = Skia.Path.Make();
    const cx = l.width / 2;
    const cy = l.height * 0.3;
    const dir = problem.row.dir;
    arrow.moveTo(cx - 26 * dir, cy);
    arrow.lineTo(cx + 26 * dir, cy);
    arrow.moveTo(cx + 16 * dir, cy - 8);
    arrow.lineTo(cx + 26 * dir, cy);
    arrow.lineTo(cx + 16 * dir, cy + 8);
    const steps = Skia.Path.Make();
    for (let i = 0; i < problem.row.steps; i++) {
      steps.addCircle(cx + (i - (problem.row.steps - 1) / 2) * 18, cy + 26, 5);
    }
    return { shapes, origin, arrow, steps };
  }, [level.mode, l, problem.row]);

  const tappedPath = useMemo(() => {
    const p = Skia.Path.Make();
    const s = l.drawings[props.tapped];
    if (props.tapped >= 0 && s) p.addCircle(s.x, s.y, l.drawingR * 1.45);
    return p;
  }, [props.tapped, l.drawings, l.drawingR]);

  // El giro de la manivela es la posición del caminante: un solo hecho.
  const stoneX0 = l.stones[0]?.x ?? 0;
  const crankT = useDerivedValue(() => [{ rotate: props.pos.value * TOOTH_ANGLE }]);
  const crankGlow = useDerivedValue(() => 0.3 + 0.7 * props.hint.value);

  const walkerT = useDerivedValue(() => [
    { translateX: stoneX0 + l.railStep * props.pos.value },
    { translateY: l.railY },
  ], [stoneX0, l.railStep, l.railY]);
  const flagT = useDerivedValue(() => [{ scaleX: props.facing.value }]);

  // El ascensor cuelga del mismo eje: su piso es la casilla del caminante, y esa
  // igualdad es la analogía entera.
  const carT = useDerivedValue(() => [
    { translateX: l.shaft.x },
    { translateY: l.shaft.bottom - (props.pos.value + 0.5) * l.shaft.floorH },
  ], [l.shaft]);

  const streetT = useDerivedValue(() => [
    { translateY: (zero - props.street.value) * l.shaft.floorH },
  ], [zero, l.shaft.floorH]);

  const enExplain = props.phase === "explain";
  const retirado = level.building === "onDemand" && !props.pinned;
  // Mientras se comparan las dos vueltas dobles no hay edificio: lo único que
  // se mira es hacia dónde queda mirando el caminante.
  const edificioO = useDerivedValue(
    () => (enExplain ? 0 : retirado ? props.ghost.value : 1),
    [retirado, enExplain],
  );

  const jugable = useDerivedValue(() => (enExplain ? 0 : 1), [enExplain]);

  /**
   * La mano fantasma. Es la única instrucción del nodo: hace el gesto que el
   * nivel pide y vuelve al principio. No dice nada porque no puede, y en los
   * cuatro primeros niveles el jugador no lee.
   */
  const ghostHand = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 12);
    const chip0 = l.chips[0] ?? { x: 0, y: 0 };
    const stop0 = l.stops[0] ?? { x: 0, y: 0 };
    const origen = l.drawings[problem.row.origin] ?? { x: 0, y: 0 };
    if (conPista) {
      // Girar la manivela hacia atrás: media vuelta de la manija.
      return {
        dot,
        from: { x: l.crank.x, y: l.crank.y - l.crank.r * 0.62 },
        to: { x: l.crank.x - l.crank.r * 0.62, y: l.crank.y },
      };
    }
    if (level.mode === "ledger") {
      return { dot, from: l.tokens[0] ?? chip0, to: { x: l.board.x + l.board.w / 4, y: l.board.y + 40 } };
    }
    if (level.mode === "arbitrary") {
      return { dot, from: { x: l.width / 2, y: l.height * 0.3 }, to: origen };
    }
    if (level.mode === "distance") return { dot, from: stop0, to: chip0 };
    return { dot, from: chip0, to: l.box };
  }, [conPista, l, level.mode, problem.row.origin]);

  const gFrom = ghostHand.from;
  const gTo = ghostHand.to;
  const handT = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, props.demo.value));
    const t = c * c * (3 - 2 * c);
    return [
      { translateX: gFrom.x + (gTo.x - gFrom.x) * t },
      { translateY: gFrom.y + (gTo.y - gFrom.y) * t },
    ];
  }, [gFrom, gTo]);
  const handO = useDerivedValue(() => props.hint.value * 0.5 * Math.sin(props.demo.value * Math.PI));

  return (
    <Group opacity={props.appear}>
      {/* La pista graduada, con el punto grueso del cero y las casillas
          iguales de los dos lados. */}
      {conPista ? (
        <Group opacity={jugable}>
          <Path
            path={rail.line}
            color={level.skin === "stone" ? "#16324a" : theme.color.inkDim}
            style={level.skin === "stone" ? "fill" : "stroke"}
            strokeWidth={2}
          />
          <Path
            path={rail.marks}
            color={level.skin === "stone" ? "#3a4a5c" : theme.color.inkDim}
            style={level.skin === "stone" ? "fill" : "stroke"}
            strokeWidth={2}
          />
          <Path path={rail.zeroDot} color={theme.color.ink} />
          <Path path={rail.numerals} color={theme.color.ink} />
          {/* La bandera dice adónde hay que llegar. En el nivel que anticipa no
              se dibuja: sería la respuesta puesta encima de la pregunta. */}
          {level.mode === "floor" ? null : (
            <Flag stones={l.stones} target={problem.target} hint={props.hint} />
          )}
          <Group transform={walkerT}>
            <Path path={walker.body} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
            <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
            <Group transform={flagT}>
              <Path path={walker.flag} color={theme.color.warn} />
            </Group>
          </Group>
        </Group>
      ) : null}

      {/* El edificio en corte. En el nivel 6 se pide con un toque y vuelve a
          apagarse: la analogía se retira sin desaparecer. */}
      {hayEdificio ? (
        <Group opacity={edificioO}>
          <Path path={shaft.walls} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={shaft.windows} color={theme.color.inkFaint} />
          <Path path={shaft.garage} color={theme.color.warn} style="stroke" strokeWidth={2} />
          <Path path={shaft.numerals} color={theme.color.inkDim} />
          <Path path={shaft.mark} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
          <Group transform={streetT}>
            <Path path={shaft.street} color={theme.color.ok} style="stroke" strokeWidth={3} />
          </Group>
          {conPista ? (
            <Group transform={carT}>
              <Path path={car} color={theme.color.accent} style="stroke" strokeWidth={2} />
            </Group>
          ) : null}
          <FloorMarks
            layout={l}
            floors={problem.floors}
            on={level.mode === "compare" || level.mode === "distance" || level.mode === "moveZero"}
            hint={props.hint}
          />
        </Group>
      ) : null}

      {/* El tablero de monedas y vales. Lo que queda sin pareja es el neto, y
          el ascensor lo sigue. */}
      {level.board ? (
        <Group>
          <Path path={board.box} color={theme.color.surface} />
          <Path path={board.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={board.split} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={targetPath} color={theme.color.warn} />
          <Path path={netPath} color={props.net === problem.netTarget ? theme.color.ok : theme.color.ink} />
          {tokenGeom.map((p, i) => (
            <TokenView
              key={`tok${i}`}
              path={p}
              spot={l.tokens[i] ?? { x: 0, y: 0 }}
              value={problem.tokens[i]?.value ?? 0}
              view={props.tokens[i] as DragView}
              cancelled={props.cancelled[i] === true}
            />
          ))}
        </Group>
      ) : null}

      {/* La caja marcada: adonde va la ficha del piso que está más abajo. */}
      {level.mode === "compare" || level.mode === "moveZero" ? (
        <Group>
          <Path
            path={boxPath}
            color={props.answered >= 0 ? theme.color.ok : theme.color.accent}
            style="stroke"
            strokeWidth={2}
          />
        </Group>
      ) : null}

      {/* Las dos paradas, escritas para cuando el edificio está apagado. */}
      <Group>
        <Path path={stops.boxes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={stops.ink} color={theme.color.ink} />
      </Group>

      {/* Las fichas: los dos pisos que se comparan, o el cajón que contesta
          una distancia. Siempre montadas: las que sobran, invisibles. */}
      <Group opacity={jugable}>
        {chipGeom.map((g, i) => (
          <ChipView key={`chip${i}`} geom={g} view={props.chips[i] as DragView} />
        ))}
      </Group>

      {/* La fila de dibujos con su origen marcado y la ficha de dirección. */}
      {level.mode === "arbitrary" ? (
        <Group>
          <Path path={rowGeom.shapes} color={theme.color.inkDim} />
          <Path path={rowGeom.origin} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
          <Path path={rowGeom.arrow} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
          <Path path={rowGeom.steps} color={theme.color.warn} />
          <Path path={tappedPath} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        </Group>
      ) : null}

      {/* La manivela. Su giro es la posición del caminante. */}
      {conPista ? (
        <Group transform={[{ translateX: l.crank.x }, { translateY: l.crank.y }]} opacity={jugable}>
          <Path path={crank.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Group transform={crankT}>
            <Path path={stop} color={theme.color.warn} style="stroke" strokeWidth={3} />
            <Path path={crank.teeth} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
            <Group opacity={crankGlow}>
              <Path path={crank.handle} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
            </Group>
          </Group>
        </Group>
      ) : null}

      {/* Las dos vueltas dobles. En una el caminante termina mirando hacia
          adelante; en la otra sigue mirando hacia atrás y avanza más lejos. */}
      {level.explain
        ? l.rows.map((y, i) => (
            <DoubleTurn
              key={`turn${i}`}
              y={y}
              layout={l}
              walker={walker}
              clock={props.clock}
              miente={i === problem.liar}
              elegida={props.picked === i}
              visible={enExplain}
            />
          ))
        : null}

      <Group transform={handT} opacity={handO}>
        <Path path={ghostHand.dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/** La bandera de la casilla de llegada, latiendo hasta que el caminante llega. */
function Flag({
  stones,
  target,
  hint,
}: {
  readonly stones: readonly Spot[];
  readonly target: number;
  readonly hint: SharedValue<number>;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    const s = stones[target];
    if (!s) return p;
    p.moveTo(s.x, s.y - 8);
    p.lineTo(s.x, s.y - 42);
    p.lineTo(s.x - 18, s.y - 35);
    p.lineTo(s.x, s.y - 28);
    return p;
  }, [stones, target]);
  const pulse = useDerivedValue(() => 0.5 + 0.5 * hint.value);
  return (
    <Group opacity={pulse}>
      <Path path={path} color={theme.color.ok} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/** Las dos paradas dibujadas sobre el edificio: de eso se habla al comparar. */
function FloorMarks({
  layout: l,
  floors,
  on,
  hint,
}: {
  readonly layout: ElevatorLayout;
  readonly floors: readonly number[];
  readonly on: boolean;
  readonly hint: SharedValue<number>;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    if (!on) return p;
    for (const f of floors) {
      const y = l.shaft.bottom - (f + 0.5) * l.shaft.floorH;
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(l.shaft.x - l.shaft.w / 2, y - l.shaft.floorH / 2, l.shaft.w, l.shaft.floorH),
          3,
          3,
        ),
      );
    }
    return p;
  }, [l, floors, on]);
  const pulse = useDerivedValue(() => 0.5 + 0.5 * hint.value);
  return (
    <Group opacity={pulse}>
      <Path path={path} color={theme.color.accent} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/**
 * Una de las dos animaciones de la vuelta doble. Las dos salen del cero
 * mirando a la derecha y giran dos veces; la honesta termina mirando hacia
 * adelante, la que miente sigue mirando hacia atrás y por eso avanza al revés.
 * Tocar la honesta es exactamente `negative_times_negative`.
 */
function DoubleTurn({
  y,
  layout: l,
  walker,
  clock,
  miente,
  elegida,
  visible,
}: {
  readonly y: number;
  readonly layout: ElevatorLayout;
  readonly walker: { body: SkPath; head: SkPath; flag: SkPath };
  readonly clock: SharedValue<number>;
  readonly miente: boolean;
  readonly elegida: boolean;
  readonly visible: boolean;
}) {
  const cx = l.width / 2;
  const step = Math.min(l.railStep, 60);
  const line = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(cx - step * 3.4, y);
    p.lineTo(cx + step * 3.4, y);
    for (let i = -3; i <= 3; i++) {
      p.moveTo(cx + i * step, y - 8);
      p.lineTo(cx + i * step, y + 8);
    }
    return p;
  }, [cx, step, y]);
  const zeroDot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, y, 6);
    return p;
  }, [cx, y]);

  // Tres tiempos: gira, gira otra vez, camina. Lo único que separa las dos
  // animaciones es hacia dónde mira el caminante en el tercero.
  const mira = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, clock.value));
    if (c < 0.28) return 1;
    if (c < 0.52) return -1;
    return miente ? -1 : 1;
  }, [miente]);
  const avance = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, clock.value));
    return c < 0.52 ? 0 : Math.min(1, (c - 0.52) / 0.4);
  });

  const transform = useDerivedValue(() => [
    { translateX: cx + step * 2.6 * avance.value * mira.value },
    { translateY: y },
  ], [cx, step, y]);
  const flagT = useDerivedValue(() => [{ scaleX: mira.value }]);
  const halo = useDerivedValue(() => (elegida ? 1 : 0), [elegida]);
  const o = useDerivedValue(() => (visible ? 1 : 0), [visible]);

  return (
    <Group opacity={o}>
      <Path path={line} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
      <Path path={zeroDot} color={theme.color.ink} />
      <Group transform={transform}>
        <Path path={walker.body} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
        <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
        <Group transform={flagT}>
          <Path path={walker.flag} color={theme.color.warn} />
        </Group>
      </Group>
      <Group opacity={halo}>
        <Path path={line} color={theme.color.accent} style="stroke" strokeWidth={3} />
      </Group>
    </Group>
  );
}

/** Una ficha del cajón. Su dibujo sigue al mismo par de valores que el gesto. */
function ChipView({
  geom,
  view,
}: {
  readonly geom: { box: SkPath; ink: SkPath; spot: Spot };
  readonly view: DragView;
}) {
  const transform = useDerivedValue(() => [
    { translateX: geom.spot.x + view.dx.value },
    { translateY: geom.spot.y + view.dy.value },
  ], [geom.spot]);
  return (
    <Group transform={transform} opacity={view.alive}>
      <Path path={geom.box} color={theme.color.surfaceHigh} />
      <Path path={geom.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.ink} color={theme.color.ink} />
    </Group>
  );
}

/**
 * Una moneda o un vale. La moneda es un disco lleno y el vale un rectángulo
 * hueco: se distinguen por forma, que es lo que pide jugar sin leer. Al
 * cancelarse contra su par quedan un hueco transparente y nada más.
 */
function TokenView({
  path,
  spot,
  value,
  view,
  cancelled,
}: {
  readonly path: SkPath;
  readonly spot: Spot;
  readonly value: number;
  readonly view: DragView;
  readonly cancelled: boolean;
}) {
  const transform = useDerivedValue(() => [
    { translateX: spot.x + view.dx.value },
    { translateY: spot.y + view.dy.value },
  ], [spot]);
  const o = useDerivedValue(() => (cancelled ? 0.18 * view.alive.value : view.alive.value), [cancelled]);
  return (
    <Group transform={transform} opacity={o}>
      <Path
        path={path}
        color={value >= 0 ? theme.color.accent : theme.color.warn}
        style={value >= 0 ? "fill" : "stroke"}
        strokeWidth={2}
      />
    </Group>
  );
}
