/**
 * El cofre y el llavero: la mecánica `chest_key` como escena propia.
 *
 * La pista del nodo anterior con el caminante en la piedra donde cayó y la
 * flecha de ida todavía dibujada. En la piedra de partida quedó un cofre
 * cerrado; abajo, la manivela y un llavero. La cerradura tiene la forma del
 * tramo de ida y la llave, la del tramo de vuelta: el cofre abre solo si son la
 * misma. Ese "solo si" no es una comprobación del código, es la geometría de la
 * escena, y es todo el contenido del nodo.
 *
 * ADVERTENCIA: hoy hay un segundo cofre en el proyecto, dentro de
 * `BalanceScene.tsx`, que es del nodo 13. Son la misma mecánica dibujada dos
 * veces y hay que unificarlas; esta escena no toca aquella.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las llaves y las fichas están siempre montadas, las que sobran
 *    con opacidad cero.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Las piedras, los dientes y
 *    los numerales son un trazo cada grupo, así que la escena entera usa unos
 *    treinta de los trescientos elementos animados del presupuesto.
 * 3. Nada vuelve al hilo de JavaScript por cuadro. La posición del caminante, el
 *    giro de la manivela y el estirado de la regla se derivan de `SharedValue`.
 *
 * Las flechas se redibujan cuando el caminante se detiene, no cuadro a cuadro:
 * la vuelta es de un tirón, así que entre dos tirones el trazo no cambia.
 *
 * Nada de texto: los numerales y el `−` son contornos del atlas de glifos.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { TEETH_PER_TURN, type UndoLevel, type UndoProblem } from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Cuánto gira la manivela por piedra. */
export const TOOTH_ANGLE = (2 * Math.PI) / TEETH_PER_TURN;
/** Llaves y fichas montadas siempre, para que el árbol no cambie entre rondas. */
export const KEY_SLOTS = 4;
export const TILE_SLOTS = 5;
/** Los diez dígitos del teclado del último nivel simbólico. */
export const PAD_KEYS = 10;

const PAD = 40;
/** Con pocas piedras la pista no se estira hasta el absurdo. */
const MAX_STEP = 96;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

/** Una pista dibujada. `explain` tiene dos; el resto de los modos, una. */
export interface TrackRow {
  readonly stones: readonly Spot[];
  readonly y: number;
  readonly step: number;
  readonly from: Spot;
  readonly to: Spot;
}

export interface ChestLayout {
  readonly rows: readonly TrackRow[];
  /** El eje del lienzo: el renglón y el teclado se cuelgan de acá. */
  readonly center: number;
  readonly stoneR: number;
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  readonly keys: readonly Spot[];
  readonly keyW: number;
  readonly keyH: number;
  readonly tiles: readonly Spot[];
  readonly tileW: number;
  readonly tileH: number;
  /** El renglón y la casilla que hay que llenar. */
  readonly rowY: number;
  readonly slot: Spot;
  readonly slotW: number;
  readonly slotH: number;
  /** El teclado de dígitos y la ficha que el jugador compone con él. */
  readonly pads: readonly Spot[];
  readonly padR: number;
  readonly composed: Spot;
  /** El cofre de las cerraduras que no son pasos. */
  readonly lock: Spot;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la llave entraría donde no se ve.
 */
export function chestLayout(
  problem: UndoProblem,
  level: UndoLevel,
  width: number,
  height: number,
): ChestLayout {
  const judge = level.mode === "judge";
  const units = Math.max(problem.track - 1, 1);
  const step = Math.min((width - 2 * PAD) / units, MAX_STEP);
  const drawn = step * units;
  const left = (width - drawn) / 2;

  const bandas =
    judge ? [height * 0.28, height * 0.6]
    : level.mode === "write" ? [height * 0.22]
    : level.mode === "measure" ? [height * 0.42]
    : [height * 0.36];

  const rows: TrackRow[] = bandas.map((y) => {
    const stones: Spot[] = [];
    for (let i = 0; i < problem.track; i++) stones.push({ x: left + i * step, y });
    return { stones, y, step, from: { x: left, y }, to: { x: left + drawn, y } };
  });

  const crankR = Math.max(30, Math.min(46, height * 0.13));
  const crank = { x: width / 2, y: height - crankR - 14, r: crankR };

  // En pantallas angostas el llavero no cabe al lado de la manivela, así que se
  // sube a su propia fila. El blanco de una llave nunca baja de lo que pide N.
  const angosta = width < 600;
  const keyH = 44;
  const zona = angosta ? width - 2 * PAD : crank.x - crank.r - 20 - PAD;
  const gap = 10;
  const keyW = Math.max(34, Math.min(72, (zona - (KEY_SLOTS - 1) * gap) / KEY_SLOTS));
  const keyY = angosta ? height - crankR * 2 - 44 : height - keyH / 2 - 22;
  const keyLeft = angosta ? (width - (KEY_SLOTS * keyW + (KEY_SLOTS - 1) * gap)) / 2 : PAD;
  const keys: Spot[] = [];
  const usadas = level.mode === "unlock" ? problem.actions.length : problem.keys.length;
  for (let i = 0; i < KEY_SLOTS; i++) {
    keys.push(
      i < usadas
        ? { x: keyLeft + keyW / 2 + i * (keyW + gap), y: keyY }
        : // Las ranuras que esta ronda no usa se van del lienzo, y así el árbol
          // de la escena no cambia de una ronda a la otra.
          { x: width / 2, y: height + keyH * 2 },
    );
  }

  const tileW = 52;
  const tileH = 48;
  const totalT = TILE_SLOTS * tileW + (TILE_SLOTS - 1) * gap;
  const tileY = height - tileH / 2 - 18;
  const tiles: Spot[] = [];
  for (let i = 0; i < TILE_SLOTS; i++) {
    tiles.push(
      i < problem.tiles.length
        ? { x: (width - totalT) / 2 + tileW / 2 + i * (tileW + gap), y: tileY }
        : { x: width / 2, y: height + tileH * 2 },
    );
  }

  // El renglón. La misma cuenta la usan el dibujo y el hit test, para que la
  // ficha entre exactamente donde se ve el hueco.
  const rowY = height * 0.55;
  const rm = rowMetrics(problem, width / 2, rowY);

  const padR = 20;
  const pads: Spot[] = [];
  const padGap = 8;
  const padTotal = PAD_KEYS * (padR * 2) + (PAD_KEYS - 1) * padGap;
  const padScale = Math.min(1, (width - 2 * PAD) / padTotal);
  for (let i = 0; i < PAD_KEYS; i++) {
    pads.push({
      x: (width - padTotal * padScale) / 2 + (padR + i * (padR * 2 + padGap)) * padScale,
      y: height - padR - 18,
    });
  }

  return {
    rows,
    center: width / 2,
    stoneR: Math.min(step * 0.3, 18),
    crank,
    keys,
    keyW,
    keyH,
    tiles,
    tileW,
    tileH,
    rowY,
    slot: rm.slot,
    slotW: rm.slotW,
    slotH: rm.slotH,
    pads,
    padR: padR * padScale,
    composed: { x: width / 2, y: height - padR * 2 - 62 },
    lock: { x: width / 2, y: height * 0.34 },
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Una cadena de glifos del atlas, centrada. Sale del mismo atlas que la
 * ecuación del nodo 13, así que el `5` de una ficha y el `5` de una ecuación son
 * el mismo objeto, y el `−` es el U+2212 de la tipografía matemática y no un
 * guion de ASCII, que no está en el atlas y dejaría un hueco.
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

const numeral = (target: SkPath, value: number, cx: number, cy: number, size: number): void =>
  addGlyphs(target, String(value), cx, cy, size);

// --- Piezas ------------------------------------------------------------------

/** Una flecha con cola y punta, del nodo 3. Acá la punta también mira a la izquierda. */
function arrow(target: SkPath, x0: number, x1: number, y: number, head: number): void {
  target.moveTo(x0, y);
  target.lineTo(x1, y);
  if (x0 === x1) return;
  const dir = x1 > x0 ? -1 : 1;
  target.moveTo(x1, y);
  target.lineTo(x1 + dir * head, y - head * 0.6);
  target.moveTo(x1, y);
  target.lineTo(x1 + dir * head, y + head * 0.6);
}

/**
 * El cofre. La cerradura no es un adorno: sus dientes son el tramo de ida, así
 * que mirar la cerradura ya dice qué llave hace falta.
 */
function buildChest(
  cx: number,
  cy: number,
  w: number,
  teeth: number,
): { body: SkPath; lid: SkPath; lock: SkPath; origin: Spot } {
  const h = w * 0.62;
  const top = cy - h - 6;
  const body = Skia.Path.Make();
  body.addRRect(Skia.RRectXY(Skia.XYWHRect(cx - w / 2, top + h * 0.34, w, h * 0.66), 4, 4));

  const lid = Skia.Path.Make();
  lid.addRRect(Skia.RRectXY(Skia.XYWHRect(cx - w / 2, top, w, h * 0.36), 6, 6));

  // La cerradura: un diente por paso de la ida, del tamaño de los de la manivela.
  const lock = Skia.Path.Make();
  const paso = Math.min(w / 7, 6);
  const ancho = Math.max(paso * teeth, paso);
  let x = cx - ancho / 2;
  const ly = top + h * 0.58;
  lock.moveTo(x, ly);
  for (let i = 0; i < Math.max(teeth, 1); i++) {
    lock.lineTo(x, ly - (teeth === 0 ? 0 : 7));
    lock.lineTo(x + paso * 0.6, ly - (teeth === 0 ? 0 : 7));
    lock.lineTo(x + paso * 0.6, ly);
    x += paso;
    lock.lineTo(x, ly);
  }
  return { body, lid, lock, origin: { x: cx - w / 2, y: top + h * 0.36 } };
}

/**
 * Una llave. Sus dientes son los pasos que vuelve: en el primer nivel están
 * fundidos en una forma y desde el segundo se cuentan de a uno, que es lo que
 * convierte "esta se parece" en "esta mide tres".
 */
function buildKey(cx: number, cy: number, w: number, teeth: number, separados: boolean): SkPath {
  const p = Skia.Path.Make();
  const r = Math.min(w * 0.17, 9);
  const x0 = cx - w / 2 + r;
  p.addCircle(x0, cy, r);
  p.addCircle(x0, cy, r * 0.45);
  const largo = w - r * 2 - 4;
  p.moveTo(x0 + r, cy);
  p.lineTo(x0 + r + largo, cy);
  const paso = teeth > 0 ? Math.min(largo / Math.max(teeth, 1), 9) : 0;
  const base = x0 + r + largo - paso * teeth;
  if (teeth === 0) return p;
  if (!separados) {
    // La forma: los dientes fundidos en un bloque, que se compara mirando.
    p.moveTo(base, cy);
    p.lineTo(base, cy + 9);
    p.lineTo(base + paso * teeth, cy + 9);
    p.lineTo(base + paso * teeth, cy);
    return p;
  }
  for (let i = 0; i < teeth; i++) {
    const x = base + i * paso;
    p.moveTo(x, cy);
    p.lineTo(x, cy + 9);
    p.lineTo(x + paso * 0.62, cy + 9);
    p.lineTo(x + paso * 0.62, cy);
  }
  return p;
}

/** La rueda dentada del nodo 3. Los dientes son todos iguales: eso es el invariante. */
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
  handle.addCircle(0, -r * 0.62, 7);
  return { body, teeth, handle };
}

/** El caminante del nodo 2: dos trazos, sin cara y sin texto. */
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
 * El símbolo de una acción cualquiera. Son dibujos y no palabras porque el nodo
 * se juega sin leer, y porque lo que se evalúa acá es la estructura: una acción
 * y la única acción que devuelve al estado anterior.
 */
function buildAction(kind: string, value: number, cx: number, cy: number, s: number): SkPath {
  const p = Skia.Path.Make();
  if (kind === "forward" || kind === "back") {
    const dir = kind === "forward" ? 1 : -1;
    arrow(p, cx - dir * s * 0.7, cx + dir * s * 0.7, cy, s * 0.34);
    for (let i = 0; i < value; i++) {
      const x = cx - s * 0.6 + i * (s * 0.3);
      p.moveTo(x, cy + s * 0.4);
      p.lineTo(x, cy + s * 0.7);
    }
    return p;
  }
  if (kind === "turn") {
    p.addArc(Skia.XYWHRect(cx - s * 0.55, cy - s * 0.55, s * 1.1, s * 1.1), 40, 280);
    p.moveTo(cx + s * 0.42, cy - s * 0.36);
    p.lineTo(cx + s * 0.62, cy - s * 0.06);
    p.moveTo(cx + s * 0.42, cy - s * 0.36);
    p.lineTo(cx + s * 0.16, cy - s * 0.26);
    return p;
  }
  if (kind === "hat") {
    p.addCircle(cx, cy + s * 0.25, s * 0.32);
    p.moveTo(cx - s * 0.6, cy - s * 0.15);
    p.lineTo(cx + s * 0.6, cy - s * 0.15);
    p.moveTo(cx - s * 0.34, cy - s * 0.15);
    p.lineTo(cx, cy - s * 0.62);
    p.lineTo(cx + s * 0.34, cy - s * 0.15);
    return p;
  }
  if (kind === "color") {
    p.addCircle(cx, cy, s * 0.5);
    p.addArc(Skia.XYWHRect(cx - s * 0.5, cy - s * 0.5, s, s), 90, 180);
    p.lineTo(cx, cy - s * 0.5);
    return p;
  }
  // La acción sin vuelta: partida, y no hay pieza que la rearme.
  p.moveTo(cx - s * 0.5, cy - s * 0.5);
  p.lineTo(cx + s * 0.5, cy + s * 0.5);
  p.moveTo(cx + s * 0.5, cy - s * 0.5);
  p.lineTo(cx - s * 0.5, cy + s * 0.5);
  return p;
}

// --- Geometría por problema --------------------------------------------------

interface Geom {
  readonly line: SkPath;
  readonly stones: SkPath;
  readonly numerals: SkPath;
  readonly chest: { body: SkPath; lid: SkPath; lock: SkPath; origin: Spot };
  readonly out: SkPath;
  readonly back: SkPath;
  readonly leftover: SkPath;
  readonly ruler: SkPath;
  readonly rulerCount: SkPath;
  readonly row: SkPath;
  readonly slot: SkPath;
  readonly placed: SkPath;
  readonly lockFace: SkPath;
  readonly lockBox: { body: SkPath; lid: SkPath; lock: SkPath; origin: Spot };
  readonly composed: SkPath;
  readonly pads: SkPath;
  readonly padDigits: SkPath;
}

function buildGeom(
  problem: UndoProblem,
  level: UndoLevel,
  l: ChestLayout,
  at: number,
  placed: number | null,
  composed: number | null,
): Geom {
  const row0 = l.rows[0] as TrackRow;
  const mark = level.skin !== "stone";
  const marcados = problem.marks ?? [problem.home, problem.landing];

  const line = Skia.Path.Make();
  const stones = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  for (const r of l.rows) {
    line.moveTo(r.from.x, r.from.y);
    line.lineTo(r.to.x, r.to.y);
    for (let i = 0; i < problem.track; i++) {
      const s = r.stones[i] as Spot;
      if (mark) {
        stones.moveTo(s.x, s.y - 8);
        stones.lineTo(s.x, s.y + 8);
      } else {
        stones.addOval(
          Skia.XYWHRect(s.x - l.stoneR, s.y - l.stoneR * 0.42, l.stoneR * 2, l.stoneR * 0.84),
        );
      }
      // Los numerales aparecen en la capa `visual`, y en la concreta solo bajo
      // las dos piedras que la instancia nombra.
      const nombrada = level.layer !== "concrete" || marcados.includes(i);
      if (nombrada && level.mode !== "unlock") numeral(numerals, i, s.x, s.y + 26, 15);
    }
  }

  const chest = buildChest(
    (row0.stones[problem.home] as Spot).x,
    row0.y - 12,
    Math.min(row0.step * 0.9, 46),
    problem.step,
  );

  // Las dos flechas enfrentadas: la de ida arriba con la punta a la derecha, la
  // de vuelta abajo con la punta a la izquierda. Se redibujan cuando el
  // caminante se detiene, que es cuando el tramo de vuelta cambia de largo.
  const xs = (i: number): number => (row0.stones[Math.max(0, Math.min(problem.track - 1, i))] as Spot).x;
  const out = Skia.Path.Make();
  const back = Skia.Path.Make();
  const leftover = Skia.Path.Make();
  if (problem.step > 0) {
    arrow(out, xs(problem.home), xs(problem.landing), row0.y - 46, 9);
    if (at < problem.landing) arrow(back, xs(problem.landing), xs(at), row0.y + 44, 9);
    // Lo que quedó sin cancelar: el tramo de la ida que la vuelta no alcanzó.
    if (at > problem.home) {
      leftover.moveTo(xs(problem.home), row0.y - 46);
      leftover.lineTo(xs(at), row0.y - 46);
    }
  }

  // La regla plegable: el mismo tramo, medido en vez de recorrido.
  const ruler = Skia.Path.Make();
  const rulerCount = Skia.Path.Make();
  const [ma, mb] = marcados as [number, number];
  const largo = xs(mb) - xs(ma);
  ruler.addRRect(Skia.RRectXY(Skia.XYWHRect(0, -9, Math.max(largo, 1), 18), 4, 4));
  numeral(rulerCount, Math.abs(mb - ma), (xs(ma) + xs(mb)) / 2, row0.y + 52, 22);

  // El renglón. La casilla tapada se dibuja como hueco: pide la ficha sin decirlo.
  const rowPath = Skia.Path.Make();
  const slot = Skia.Path.Make();
  const puesta = Skia.Path.Make();
  if (level.mode === "write") {
    const rm = rowMetrics(problem, l.center, l.rowY);
    rm.chars.forEach((g, i) => {
      const tapado = i >= rm.from && i < rm.from + rm.count;
      if (!tapado) addGlyphs(rowPath, g.c, g.cx, l.rowY, ROW_SIZE);
    });
    slot.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(
          rm.slot.x - rm.slotW / 2,
          rm.slot.y - rm.slotH / 2,
          rm.slotW,
          rm.slotH,
        ),
        6,
        6,
      ),
    );
    if (placed !== null) numeral(puesta, placed, rm.slot.x, rm.slot.y, ROW_SIZE);
  }

  // El cofre de las cerraduras que no son pasos.
  const lockFace = Skia.Path.Make();
  const lockBox = buildChest(l.lock.x, l.lock.y + 40, 84, 0);
  if (level.mode === "unlock") {
    lockFace.addPath(buildAction(problem.lock.kind, problem.lock.value, l.lock.x, l.lock.y - 46, 26));
  }

  const composedPath = Skia.Path.Make();
  if (composed !== null) numeral(composedPath, composed, l.composed.x, l.composed.y, 26);

  const pads = Skia.Path.Make();
  const padDigits = Skia.Path.Make();
  if (level.keyboard) {
    for (let i = 0; i < PAD_KEYS; i++) {
      const s = l.pads[i] as Spot;
      pads.addCircle(s.x, s.y, l.padR);
      numeral(padDigits, i, s.x, s.y, l.padR * 1.1);
    }
  }

  return {
    line,
    stones,
    numerals,
    chest,
    out,
    back,
    leftover,
    ruler,
    rulerCount,
    row: rowPath,
    slot,
    placed: puesta,
    lockFace,
    lockBox,
    composed: composedPath,
    pads,
    padDigits,
  };
}

// --- Componente --------------------------------------------------------------

export interface Slot {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras la pieza está en la mano; 0 cuando ya se usó o no hace falta. */
  readonly alive: SharedValue<number>;
}

export interface ChestSceneProps {
  readonly problem: UndoProblem;
  readonly level: UndoLevel;
  readonly layout: ChestLayout;
  /** La posición del caminante, en piedras. */
  readonly pos: SharedValue<number>;
  /** El cofre abriéndose, de 0 a 1. */
  readonly open: SharedValue<number>;
  /** Las dos flechas encendidas. Cuando coinciden se apagan juntas. */
  readonly outArrow: SharedValue<number>;
  readonly backArrow: SharedValue<number>;
  /** El tramo de ida que la vuelta no alcanzó a cancelar. */
  readonly leftover: SharedValue<number>;
  /** La manivela contra el tope de la orilla: vibra y no pasa. */
  readonly jam: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  /** El reloj de los dos regresos de `explain`, de 0 a 1. */
  readonly clock: SharedValue<number>;
  /** Cuánto se estiró la regla plegable, de 0 a 1. */
  readonly ruler: SharedValue<number>;
  /** La recta que se pide con un toque. */
  readonly line: SharedValue<number>;
  readonly appear: SharedValue<number>;
  /** La llave puesta en la manivela, o -1: el sentido de giro se invierte con ella. */
  readonly mounted: number;
  /** La piedra donde se detuvo el caminante, que es lo que redibuja las flechas. */
  readonly at: number;
  /** La fila elegida en `explain`, o -1. */
  readonly picked: number;
  /** El numeral que el jugador compuso con el teclado, o null. */
  readonly composed: number | null;
  /** La ficha que ya entró en el renglón, o null. */
  readonly placed: number | null;
  readonly keys: readonly Slot[];
  readonly tiles: readonly Slot[];
}

export function ChestScene({
  problem,
  level,
  layout,
  pos,
  open,
  outArrow,
  backArrow,
  leftover,
  jam,
  hint,
  demo,
  clock,
  ruler,
  line,
  appear,
  mounted,
  at,
  picked,
  composed,
  placed,
  keys,
  tiles,
}: ChestSceneProps) {
  const geom = useMemo(
    () => buildGeom(problem, level, layout, at, placed, composed),
    [problem, level, layout, at, placed, composed],
  );
  const crank = useMemo(() => buildCrank(layout.crank.r), [layout.crank.r]);
  const walker = useMemo(buildWalker, []);

  const keyGeom = useMemo(() => {
    const arbitrarias = level.mode === "unlock";
    return layout.keys.map((spot, i) => {
      const box = Skia.Path.Make();
      box.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(spot.x - layout.keyW / 2, spot.y - layout.keyH / 2, layout.keyW, layout.keyH),
          10,
          10,
        ),
      );
      const shape = Skia.Path.Make();
      const digits = Skia.Path.Make();
      if (arbitrarias) {
        const a = problem.actions[i];
        if (a) shape.addPath(buildAction(a.kind, a.value, spot.x, spot.y, 18));
      } else {
        const k = problem.keys[i];
        if (k) {
          shape.addPath(buildKey(spot.x, spot.y - 4, layout.keyW - 12, k.teeth, level.labeled));
          // El numeral llega con la capa `visual`: hasta entonces la llave se
          // compara mirando o contando dientes, nunca leyendo.
          if (level.layer !== "concrete") numeral(digits, k.teeth, spot.x, spot.y + 24, 15);
        }
      }
      return { box, shape, digits };
    });
  }, [layout, problem.keys, problem.actions, level.labeled, level.layer, level.mode]);

  const tileGeom = useMemo(
    () =>
      layout.tiles.map((spot, i) => {
        const box = Skia.Path.Make();
        box.addRRect(
          Skia.RRectXY(
            Skia.XYWHRect(
              spot.x - layout.tileW / 2,
              spot.y - layout.tileH / 2,
              layout.tileW,
              layout.tileH,
            ),
            8,
            8,
          ),
        );
        const digits = Skia.Path.Make();
        const v = problem.tiles[i]?.value;
        if (v !== undefined) numeral(digits, v, spot.x, spot.y, 24);
        return { box, digits };
      }),
    [layout, problem.tiles],
  );

  const row0 = layout.rows[0] as TrackRow;
  const ox = row0.stones[0]?.x ?? 0;
  const dx = row0.step;
  const oy = row0.y;

  const walkerT = useDerivedValue(() => [
    { translateX: ox + dx * pos.value },
    { translateY: oy },
  ]);
  // El giro de la manivela es la posición del caminante: un solo hecho, no dos.
  const crankT = useDerivedValue(() => [{ rotate: pos.value * TOOTH_ANGLE + jam.value * 0.07 }]);
  const crankGlow = useDerivedValue(() => 0.35 + 0.65 * hint.value);
  const lidT = useDerivedValue(() => [{ rotate: -1.9 * open.value }]);

  // La regla se estira con el dedo: una banda rellena que escala, sin trazo que
  // se deforme al escalar.
  const rulerX = (row0.stones[(problem.marks ?? [0, 0])[0]] as Spot | undefined)?.x ?? 0;
  const rulerT = useDerivedValue(() => [
    { translateX: rulerX },
    { translateY: oy },
    { scaleX: Math.max(0.0001, ruler.value) },
  ]);
  const rulerCountO = useDerivedValue(() => Math.max(0, (ruler.value - 0.92) / 0.08));

  /**
   * La mano fantasma. Es la única instrucción del nodo: toma la llave de tres
   * dientes, la suelta sobre la manivela y gira. No dice nada porque no puede:
   * el jugador no lee.
   */
  const manoDesde = layout.keys[0] ?? { x: 0, y: 0 };
  const manoHasta = layout.crank;
  const ghost = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 13);
    return dot;
  }, []);
  const ghostT = useDerivedValue(() => {
    const t = Math.max(0, Math.min(1, demo.value));
    const e = t * t * (3 - 2 * t);
    return [
      { translateX: manoDesde.x + (manoHasta.x - manoDesde.x) * e },
      { translateY: manoDesde.y + (manoHasta.y - manoDesde.y) * e },
    ];
  }, [manoDesde, manoHasta]);
  const conMano = level.mode === "turn";
  const ghostO = useDerivedValue(() =>
    conMano ? hint.value * 0.5 * Math.sin(demo.value * Math.PI) : 0,
  );

  const conPista = level.skin !== "hidden";
  const pistaO = useDerivedValue(() => (level.skin === "onDemand" ? line.value : 1));
  const conManivela = level.mode === "turn" || level.mode === "pick";
  const conRenglon = level.mode === "write";

  return (
    <Group opacity={appear}>
      {conPista ? (
        <Group opacity={pistaO}>
          <Path path={geom.line} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
          <Path
            path={geom.stones}
            color={level.skin === "stone" ? "#3a4a5c" : theme.color.inkDim}
            style={level.skin === "stone" ? "fill" : "stroke"}
            strokeWidth={2}
          />
          <Path path={geom.numerals} color={theme.color.inkDim} />
        </Group>
      ) : null}

      {/* La regla plegable: el tramo resaltado entre las dos marcas. */}
      {level.ruler ? (
        <>
          <Group transform={rulerT}>
            <Path path={geom.ruler} color={theme.color.accent} opacity={0.32} />
          </Group>
          <Group opacity={rulerCountO}>
            <Path path={geom.rulerCount} color={theme.color.accent} />
          </Group>
        </>
      ) : null}

      {/* Las dos flechas enfrentadas. Cuando coinciden se apagan juntas. */}
      <Group opacity={outArrow}>
        <Path path={geom.out} color={theme.color.inkDim} style="stroke" strokeWidth={2.5} strokeCap="round" />
      </Group>
      <Group opacity={leftover}>
        <Path path={geom.leftover} color={theme.color.warn} style="stroke" strokeWidth={4} strokeCap="round" />
      </Group>
      <Group opacity={backArrow}>
        <Path path={geom.back} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
      </Group>

      {/* El cofre sobre la piedra de partida. Se abre solo, sin cartel. */}
      {level.mode !== "unlock" && level.skin !== "hidden" ? (
        <Group opacity={pistaO}>
          <Path path={geom.chest.body} color={theme.color.surfaceHigh} />
          <Path path={geom.chest.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Group origin={geom.chest.origin} transform={lidT}>
            <Path path={geom.chest.lid} color={theme.color.surfaceHigh} />
            <Path path={geom.chest.lid} color={theme.color.accent} style="stroke" strokeWidth={2} />
          </Group>
          <Path path={geom.chest.lock} color={theme.color.warn} style="stroke" strokeWidth={2} />
        </Group>
      ) : null}

      {/* La cerradura que no es un tramo. */}
      {level.mode === "unlock" ? (
        <>
          <Path path={geom.lockBox.body} color={theme.color.surfaceHigh} />
          <Path path={geom.lockBox.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Group origin={geom.lockBox.origin} transform={lidT}>
            <Path path={geom.lockBox.lid} color={theme.color.surfaceHigh} />
            <Path path={geom.lockBox.lid} color={theme.color.accent} style="stroke" strokeWidth={2} />
          </Group>
          <Path path={geom.lockFace} color={theme.color.warn} style="stroke" strokeWidth={2.5} strokeCap="round" />
        </>
      ) : null}

      {/* Los caminantes. En `explain` cada fila tiene el suyo. */}
      {level.mode === "judge" ? (
        layout.rows.map((r, i) => (
          <JudgeWalker
            key={i}
            walk={(problem.returns[i] ?? []) as readonly number[]}
            row={r}
            clock={clock}
            walker={walker}
            elegida={picked === i}
            miente={i === problem.liar}
          />
        ))
      ) : (
        <Group transform={walkerT}>
          <Path path={walker.body} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
          <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
        </Group>
      )}

      {/* El segundo caminante: el que convierte la vuelta en una distancia. */}
      {level.ruler && problem.marks ? (
        <Group
          transform={[
            { translateX: (row0.stones[problem.marks[1]] as Spot).x },
            { translateY: oy },
          ]}
        >
          <Path path={walker.body} color={theme.color.ok} style="stroke" strokeWidth={2.5} strokeCap="round" />
          <Path path={walker.head} color={theme.color.ok} style="stroke" strokeWidth={2} />
        </Group>
      ) : null}

      {/* La manivela. Con la llave puesta el sentido de giro se invierte. */}
      {conManivela ? (
        <Group transform={[{ translateX: layout.crank.x }, { translateY: layout.crank.y }]}>
          <Path path={crank.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Group transform={crankT}>
            <Path path={crank.teeth} color={mounted >= 0 ? theme.color.accent : theme.color.inkDim} style="stroke" strokeWidth={2} />
            <Group opacity={crankGlow}>
              <Path path={crank.handle} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
            </Group>
          </Group>
        </Group>
      ) : null}

      {/* El renglón, con su casilla vacía. */}
      {conRenglon ? (
        <Group transform={[{ translateX: 0 }, { translateY: layout.rowY }]}>
          <Group transform={[{ translateX: layoutCenter(layout) }]}>
            <Path path={geom.row} color={theme.color.ink} />
            <Path path={geom.slot} color={theme.color.line} style="stroke" strokeWidth={2} />
            <Path path={geom.placed} color={theme.color.ok} />
          </Group>
        </Group>
      ) : null}

      {/* El teclado de dígitos y la ficha que el jugador arma con él. */}
      {level.keyboard ? (
        <>
          <Path path={geom.pads} color={theme.color.surfaceHigh} />
          <Path path={geom.pads} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={geom.padDigits} color={theme.color.inkDim} />
          <Path path={geom.composed} color={theme.color.ink} />
        </>
      ) : null}

      {/* El llavero. Siempre montado: las llaves que sobran, invisibles. */}
      {keyGeom.map((g, i) => (
        <Piece key={`k${i}`} slot={keys[i] as Slot} box={g.box} art={g.shape} digits={g.digits} tinta={theme.color.warn} />
      ))}

      {/* El cajón de fichas. */}
      {!level.keyboard
        ? tileGeom.map((g, i) => (
            <Piece key={`t${i}`} slot={tiles[i] as Slot} box={g.box} digits={g.digits} tinta={theme.color.ink} />
          ))
        : null}

      <Group transform={ghostT} opacity={ghostO}>
        <Path path={ghost} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/** Dónde queda el centro del renglón, que es el centro del lienzo. */
function layoutCenter(l: ChestLayout): number {
  const r = l.rows[0];
  return r ? (r.from.x + r.to.x) / 2 : 0;
}

/** Una pieza que el dedo puede llevar: su dibujo sigue a los mismos valores que el gesto. */
function Piece({
  slot,
  box,
  art,
  digits,
  tinta,
}: {
  readonly slot: Slot;
  readonly box: SkPath;
  readonly art?: SkPath;
  readonly digits: SkPath;
  readonly tinta: string;
}) {
  const transform = useDerivedValue(() => [
    { translateX: slot.dx.value },
    { translateY: slot.dy.value },
  ]);
  return (
    <Group transform={transform} opacity={slot.alive}>
      <Path path={box} color={theme.color.surfaceHigh} />
      <Path path={box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      {art ? <Path path={art} color={tinta} style="stroke" strokeWidth={2} strokeCap="round" /> : null}
      <Path path={digits} color={theme.color.ink} />
    </Group>
  );
}

/**
 * Un regreso de `explain`. El que miente vuelve un paso de más y queda del otro
 * lado del cofre, o se traba en la orilla si el cofre estaba ahí.
 */
function JudgeWalker({
  walk,
  row,
  clock,
  walker,
  elegida,
  miente,
}: {
  readonly walk: readonly number[];
  readonly row: TrackRow;
  readonly clock: SharedValue<number>;
  readonly walker: { body: SkPath; head: SkPath };
  readonly elegida: boolean;
  readonly miente: boolean;
}) {
  const ox = row.stones[0]?.x ?? 0;
  const dx = row.step;
  const oy = row.y;
  const transform = useDerivedValue(() => {
    if (walk.length < 2) return [{ translateX: ox }, { translateY: oy }];
    const t = Math.min(0.9999, Math.max(0, clock.value)) * (walk.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    const a = walk[i] ?? 0;
    const b = walk[i + 1] ?? a;
    const e = f * f * (3 - 2 * f);
    return [{ translateX: ox + dx * (a + (b - a) * e) }, { translateY: oy - Math.sin(f * Math.PI) * 10 }];
  }, [walk, ox, dx, oy]);

  const marca = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(row.from.x, row.y);
    p.lineTo(row.to.x, row.y);
    return p;
  }, [row]);

  return (
    <>
      <Path
        path={marca}
        color={miente ? theme.color.warn : theme.color.ok}
        style="stroke"
        strokeWidth={3}
        opacity={elegida ? 1 : 0}
      />
      <Group transform={transform}>
        <Path path={walker.body} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
        <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
    </>
  );
}
