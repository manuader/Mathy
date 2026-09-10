/**
 * Las baldosas: la mecánica `tiles` de [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * Trece nodos de la espina la usan, así que la escena no es del nodo 5: es de
 * la mecánica. Todo lo que cambia entre un nodo y otro entra por `TilesConfig`
 * —cuántas filas, cuántas columnas, qué pide el marco, en qué etapa de
 * desvanecimiento está el piso, si hay llaves, si hay ficha del total, en
 * cuántas tiras se parte— y nada de eso está escrito adentro.
 *
 * El invariante que la escena dibuja es `area_preserved_under_rearrangement`:
 * ninguna baldosa desaparece al reacomodar. Por eso el giro es una rotación del
 * mismo piso y no un piso nuevo, y por eso las dos tiras del corte son el mismo
 * conjunto de celdas separadas por un hueco.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las filas del montón están siempre montadas, las que sobran con
 *    opacidad cero.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Un piso de sesenta
 *    baldosas cuesta lo mismo que uno de cuatro: una fila entera es un trazo.
 * 3. Nada vuelve al hilo de JavaScript por cuadro. El giro, el corte, el
 *    arrastre de una fila y la aparición de las llaves se derivan de los
 *    `SharedValue` que trae el gesto.
 *
 * Nada de texto: los numerales y la cruz son contornos del atlas de glifos,
 * dibujados como cualquier otra forma.
 *
 * La escena tiene dos caras, y son la misma mecánica vista de los dos lados:
 *
 * - **El piso** (`rows`, `cols`, `frame`, `loose`, `cut`, `keys`): baldosas que
 *   se juntan hasta armar un rectángulo. Es lo que usa `arith.mul.scaling`.
 * - **La partición** (`partition`): un todo entero que se corta en partes
 *   iguales y del que se encienden algunas. Es lo que usa
 *   `arith.frac.parts_and_ratio`, y el invariante que dibuja es el mismo,
 *   `area_preserved_under_rearrangement`: cortar no cambia el total.
 *
 * `partition` es opcional y nulo por omisión, así que un nodo que solo quiere
 * el piso no escribe una línea de más y no ve nada nuevo en pantalla.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Baldosa máxima: más grande, un piso de cinco por cinco no entra. */
const MAX_UNIT = 38;
/** Cuánto se separan las dos tiras cuando el piso se parte, en baldosas. */
const SPLIT = 0.35;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

/** Las etapas de desvanecimiento de `tiles` en E0, en orden. */
export type TilesSkin = "loose_tiles" | "grid_rectangle" | "labeled_sides" | "product_notation";

/** Una fila del montón, tal como la escena la dibuja. */
export interface LooseRow {
  readonly id: string;
  readonly cells: number;
  /**
   * Es una pieza sola y no `cells` baldosas sueltas. Una tira de largo
   * desconocido tiene que verse como una sola cosa: dibujada en celdas se
   * podría contar, y contarla es justamente lo que no se puede.
   */
  readonly solid?: boolean;
  /** Cuántas celdas mide a lo alto. Una fila mide una. */
  readonly tall?: number;
}

/** Una llave de arriba con su etiqueta: un tramo del lado, y qué mide. */
export interface TilesSpan {
  readonly cells: number;
  /** Lo que la llave dice. Sale del atlas: un numeral, una letra, o las dos. */
  readonly label: string;
}

/**
 * La pared entre las habitaciones, y lo que los lados dicen.
 *
 * Ausente o nula: el piso es uno solo, el corte cae por la mitad y las llaves
 * dicen los numerales del marco, que es como lo usan los nodos 5 y 6.
 *
 * Con esto puesto la escena dibuja lo que necesita `alg.expr.distributive_tiles`:
 * la base partida donde el problema la parte, una llave por tramo con su
 * etiqueta, y las dos escrituras del mismo piso —el producto y la suma—
 * ocupando el mismo lugar. Cuál se ve la decide `split`, que es el mismo valor
 * que separa las dos tiras: con la pared puesta se lee el producto, y a medida
 * que el piso se abre aparece la suma.
 */
export interface TilesRooms {
  /** En qué columna cae la pared. */
  readonly at: number;
  /** La pared dibujada adentro del marco. */
  readonly wall: boolean;
  /** Las llaves de arriba. La suma de sus `cells` es el ancho del marco. */
  readonly spans: readonly TilesSpan[];
  /** Lo que dice la llave del lado izquierdo. Vacío: el numeral del marco. */
  readonly side: string;
  /** El producto escrito debajo del piso, con la pared puesta. */
  readonly product: string;
  /** La suma escrita, que ocupa el mismo lugar cuando la pared sale. */
  readonly sum: string;
}

/**
 * Cómo se señala la parte cuando el todo no se corta. `cut` es el corte de
 * siempre; las otras tres son los todos arbitrarios del final del nodo 8.
 */
export type TilesMarking = "cut" | "fill" | "travel" | "figures";

/** Cómo se escribe la ficha de fracción. Sin numerales hasta que el nodo lee. */
export type TilesChip = "none" | "dots" | "numerals";

/** Un todo partido en partes iguales, con algunas encendidas. */
export interface TilesWhole {
  readonly id: string;
  /** En cuántas partes está cortado. 0: entero, sin una sola línea. */
  readonly parts: number;
  readonly shaded: number;
  /**
   * Las partes son iguales. Con `false` las líneas y el contorno quedan
   * punteados: la barra no chasquea, y eso es todo lo que el juego dice.
   */
  readonly even: boolean;
  /** Cuánto mide respecto del ancho disponible, de 0 a 1. */
  readonly span: number;
  /** Disco con radios en vez de barra: la pizza. */
  readonly disc: boolean;
  /** Reclama atención, porque es el que hay que tocar o el que está bien. */
  readonly glow: boolean;
}

/**
 * La cara `partition` de la mecánica. Nulo o ausente: la escena es el piso de
 * siempre y nada de esto se dibuja.
 *
 * El primer todo de `wholes` es el vivo: sus partes y sus encendidas salen de
 * los `SharedValue` `parts` y `lit`, así que cortar y encender no vuelven al
 * hilo de JavaScript. Los demás son estáticos y se redibujan por problema.
 */
export interface TilesPartition {
  readonly wholes: readonly TilesWhole[];
  /** Cómo se señala la parte. Con algo distinto de `cut` no hay líneas. */
  readonly marking: TilesMarking;
  /** El libro de cuentas: una ficha por parte encendida, debajo del todo. */
  readonly ledger: boolean;
  readonly chip: TilesChip;
  /** Lo que dice la ficha. Nulo: no hay ficha que decir. */
  readonly chipValue: { readonly num: number; readonly den: number } | null;
  /** La división que se contrae en la ficha. Nulo: no hay morph del `÷`. */
  readonly division: { readonly a: number; readonly b: number } | null;
  /** Los platos del reparto. 0: no hay reparto. */
  readonly plates: number;
  /** Las marcas de la recta del cero al uno. 0: no hay recta. */
  readonly ticks: number;
  /** En qué marca quedó clavada la ficha, o nulo si todavía no se clavó. */
  readonly pinned: number | null;
}

/**
 * Todo lo que un nodo decide sobre las baldosas. Un nodo que reusa la mecánica
 * escribe uno de estos y no toca la escena.
 */
export interface TilesConfig {
  /** El piso armado: filas por columnas. */
  readonly rows: number;
  readonly cols: number;
  /**
   * Lo que el marco pide. Transpuesto respecto del piso, el piso solo entra
   * girado: es el gesto de la conmutatividad, y nadie lo nombra.
   */
  readonly frameRows: number;
  readonly frameCols: number;
  readonly skin: TilesSkin;
  /** Se dibuja el marco vacío que hay que cubrir. */
  readonly frame: boolean;
  /** Las filas sueltas del montón. Las que no miden lo que el marco pide no entran. */
  readonly loose: readonly LooseRow[];
  /** En cuántas tiras se puede partir el piso. 0: el corte no existe. */
  readonly cut: number;
  /** El número de la ficha del total. `null`: todavía no hay ficha. */
  readonly total: number | null;
  /** Las llaves con numeral sobre los dos lados, y la cruz entre ellas. */
  readonly keys: boolean;
  /** El piso no se dibuja hasta que alguien lo pide. */
  readonly onDemand: boolean;
  /** La cara `partition`. Ausente o nula: la escena es solo el piso. */
  readonly partition?: TilesPartition | null;
  /**
   * Qué lado tapa la pared: su llave se dibuja hueca, sin numeral. Es la
   * segunda cara de la división —leer un lado sin desarmar el rectángulo— y con
   * el numeral puesto la llave diría la respuesta. Ausente o nula: las dos llenas.
   */
  readonly hollow?: "rows" | "cols" | null;
  /**
   * Las baldosas que sobraron al partir. Quedan fuera del rectángulo, a la
   * vista y sin nada que las nombre: ese hueco es `arith.div.remainder`.
   */
  readonly leftover?: number;
  /** Las dos habitaciones y la pared. Ausente o nula: el piso es uno solo. */
  readonly rooms?: TilesRooms | null;
}

/** Una fila del montón mientras el dedo la lleva. */
export interface RowSlot {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras la fila está en el montón; 0 cuando ya se fundió o no se usa. */
  readonly alive: SharedValue<number>;
}

export interface TilesLayout {
  readonly unit: number;
  readonly center: Spot;
  /** El marco vacío, en coordenadas del lienzo. */
  readonly frame: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
  /** El piso armado, que puede no tener la forma del marco. */
  readonly floor: { readonly w: number; readonly h: number };
  /** Dónde queda cada fila del montón, por índice de ranura. */
  readonly drawer: readonly Spot[];
  readonly totalSpot: Spot;
  /** En qué columna se parte el piso cuando el corte está habilitado. */
  readonly cutAt: number;
  /** Dónde cae cada todo de la partición. Vacío cuando no hay partición. */
  readonly wholes: readonly Box[];
  /** Dónde va la ficha de fracción, y de qué tamaño. */
  readonly chip: { readonly x: number; readonly y: number; readonly size: number };
  /** El renglón del libro de cuentas, debajo del primer todo. */
  readonly ledgerY: number;
  /** La recta del cero al uno: dos puntas y la altura. */
  readonly line: { readonly x0: number; readonly x1: number; readonly y: number };
  /** Dónde cae cada plato del reparto. */
  readonly plates: readonly Box[];
}

/** Un rectángulo del lienzo. El disco se inscribe en el suyo. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, una fila entraría donde no se ve.
 */
export function tilesLayout(
  config: TilesConfig,
  width: number,
  height: number,
  slots: number,
): TilesLayout {
  const span = Math.max(config.rows, config.cols, config.frameRows, config.frameCols, 1);
  const frameH = height * 0.52;
  const unit = Math.min(MAX_UNIT, (width * 0.62) / span, frameH / span);

  const center = { x: width / 2, y: height * 0.3 };
  const frame = {
    x: center.x - (config.frameCols * unit) / 2,
    y: center.y - (config.frameRows * unit) / 2,
    w: config.frameCols * unit,
    h: config.frameRows * unit,
  };
  const floor = { w: config.cols * unit, h: config.rows * unit };

  // El montón se acomoda solo en las líneas que le entran: una fila de seis
  // baldosas y una de dos no pueden repartirse el ancho por partes iguales.
  const drawer: Spot[] = [];
  const top = height * 0.64;
  // La pieza más alta manda el alto del renglón: con un rectángulo de tres
  // celdas de alto en la bandeja, un renglón del alto de una baldosa se pisa
  // con el siguiente.
  const alto = Math.max(1, ...config.loose.map((r) => r.tall ?? 1));
  const line = unit * alto + 14;
  const gap = 18;
  let x = 0;
  let row = 0;
  const widths = config.loose.map((r) => r.cells * unit);
  const lines: number[][] = [[]];
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i] as number;
    if (x > 0 && x + w + gap > width * 0.92) {
      lines.push([]);
      x = 0;
      row++;
    }
    (lines[row] as number[]).push(i);
    x += w + gap;
  }
  for (let l = 0; l < lines.length; l++) {
    const ids = lines[l] as number[];
    const total = ids.reduce((s, i) => s + (widths[i] as number), 0) + gap * (ids.length - 1);
    let cx = (width - total) / 2;
    for (const i of ids) {
      const w = widths[i] as number;
      drawer[i] = { x: cx + w / 2, y: top + l * line };
      cx += w + gap;
    }
  }
  // Las ranuras que esta ronda no usa se van del lienzo: así el árbol de la
  // escena no cambia de una ronda a la otra.
  for (let i = drawer.length; i < slots; i++) drawer.push({ x: width / 2, y: height + line * 2 });

  return {
    unit,
    center,
    frame,
    floor,
    drawer,
    totalSpot: { x: frame.x + frame.w + unit * 1.4, y: frame.y + frame.h / 2 },
    // La pared cae donde el problema la pone; sin habitaciones, por la mitad.
    cutAt:
      config.rooms
        ? Math.max(0, Math.min(config.cols, config.rooms.at))
        : config.cut > 1
          ? Math.max(1, Math.floor(config.cols / 2))
          : 0,
    ...partitionLayout(config.partition ?? null, width, height),
  };
}

/**
 * Dónde caen los todos, la ficha, el libro, la recta y los platos.
 *
 * Un solo todo se lleva el centro; dos se apilan, porque el punto del nivel es
 * que la misma ficha entra en los dos y comparar largos exige verlos alineados
 * a la izquierda; tres o cuatro van en cuadrícula, que es la lámina de discos
 * de `recognize`.
 */
function partitionLayout(
  part: TilesPartition | null,
  width: number,
  height: number,
): Pick<TilesLayout, "wholes" | "chip" | "ledgerY" | "line" | "plates"> {
  const vacio = {
    wholes: [] as Box[],
    chip: { x: width / 2, y: height / 2, size: 24 },
    ledgerY: height,
    line: { x0: 0, x1: 0, y: height },
    plates: [] as Box[],
  };
  if (!part || part.wholes.length === 0) return vacio;

  const n = part.wholes.length;
  const hayRecta = part.ticks > 0;
  const hayPlatos = part.plates > 0;
  // La ficha vive a la derecha y no encima: encima se la come el corte, y con
  // dos todos apilados no queda aire arriba.
  const chipW = Math.min(width * 0.2, 120);
  const usable = width - chipW - 40;
  const size = Math.min(chipW * 0.42, 34);

  const wholes: Box[] = [];
  if (n <= 2) {
    const barH = Math.min(64, height * 0.16);
    const top = hayRecta || hayPlatos ? height * 0.18 : height * (n === 1 ? 0.34 : 0.24);
    const gap = barH + 26;
    for (let i = 0; i < n; i++) {
      const w = usable * 0.86 * (part.wholes[i]?.span ?? 1);
      const disc = part.wholes[i]?.disc === true;
      const lado = Math.min(barH * 2.4, usable * 0.5);
      // El vaso es el único todo que se lee de abajo hacia arriba, así que es
      // el único que se dibuja parado.
      if (part.marking === "fill") {
        const vw = Math.min(usable * 0.28, 130);
        const vh = Math.min(height * 0.46, 260);
        wholes.push({ x: 24 + (usable - vw) / 2, y: top, w: vw, h: vh });
        continue;
      }
      wholes.push(
        disc
          ? { x: 24 + (usable - lado) / 2, y: top + i * gap, w: lado, h: lado }
          : { x: 24, y: top + i * gap, w, h: barH },
      );
    }
  } else {
    // La lámina: dos por fila, y cada todo entra en su celda.
    const cols = 2;
    const filas = Math.ceil(n / cols);
    const cw = usable / cols;
    const ch = Math.min((height * 0.72) / filas, cw);
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const lado = Math.min(cw, ch) * 0.78;
      wholes.push({
        x: 24 + c * cw + (cw - lado) / 2,
        y: height * 0.12 + r * ch + (ch - lado) / 2,
        w: lado,
        h: part.wholes[i]?.disc ? lado : Math.min(lado, 60),
      });
    }
  }

  const first = wholes[0] as Box;
  const last = wholes[wholes.length - 1] as Box;
  return {
    wholes,
    chip: { x: width - chipW / 2 - 12, y: first.y + first.h / 2, size },
    ledgerY: last.y + last.h + 26,
    line: {
      x0: 24,
      x1: 24 + usable * 0.86,
      y: Math.min(height - 40, last.y + last.h + (part.ledger ? 78 : 64)),
    },
    plates: Array.from({ length: part.plates }, (_, i) => {
      const w = Math.min(usable / Math.max(part.plates, 1) - 12, 76);
      const total = part.plates * (w + 12) - 12;
      return {
        x: (width - chipW) / 2 - total / 2 + i * (w + 12),
        y: Math.min(height - w - 24, last.y + last.h + 40),
        w,
        h: w,
      };
    }),
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Un numeral o la cruz, dibujados. Salen del mismo atlas que la ecuación del
 * nodo 13, así que el `5` de una llave y el `5` de una ecuación son el mismo
 * objeto, y el `×` que nace acá es el que después se escribe.
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

// --- Geometría ---------------------------------------------------------------

/** Las celdas de un tramo de fila, como un solo trazo. */
function cellsPath(x0: number, y0: number, from: number, to: number, unit: number): SkPath {
  const p = Skia.Path.Make();
  const inset = unit * 0.06;
  for (let c = from; c < to; c++) {
    p.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(x0 + c * unit + inset, y0 + inset, unit - inset * 2, unit - inset * 2),
        3,
        3,
      ),
    );
  }
  return p;
}

interface FloorGeom {
  /** Por fila, las dos tiras del corte. Sin corte, la segunda va vacía. */
  readonly strips: readonly { readonly left: SkPath; readonly right: SkPath }[];
  /** Las líneas interiores, que se atenúan cuando las filas se funden. */
  readonly inner: SkPath;
  readonly outline: SkPath;
}

function buildFloor(config: TilesConfig, l: TilesLayout): FloorGeom {
  const u = l.unit;
  const x0 = l.center.x - (config.cols * u) / 2;
  const y0 = l.center.y - (config.rows * u) / 2;
  const cut = l.cutAt;

  const strips = [];
  for (let r = 0; r < config.rows; r++) {
    const y = y0 + r * u;
    strips.push({
      left: cellsPath(x0, y, 0, cut > 0 ? cut : config.cols, u),
      right: cut > 0 ? cellsPath(x0, y, cut, config.cols, u) : Skia.Path.Make(),
    });
  }

  const inner = Skia.Path.Make();
  for (let c = 1; c < config.cols; c++) {
    inner.moveTo(x0 + c * u, y0);
    inner.lineTo(x0 + c * u, y0 + config.rows * u);
  }
  for (let r = 1; r < config.rows; r++) {
    inner.moveTo(x0, y0 + r * u);
    inner.lineTo(x0 + config.cols * u, y0 + r * u);
  }

  const outline = Skia.Path.Make();
  outline.addRect(Skia.XYWHRect(x0, y0, config.cols * u, config.rows * u));
  return { strips, inner, outline };
}

/** El marco vacío: pide un rectángulo sin decir cuál. */
function buildFrame(l: TilesLayout): SkPath {
  const p = Skia.Path.Make();
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(l.frame.x, l.frame.y, l.frame.w, l.frame.h), 6, 6));
  return p;
}

/**
 * Una llave de longitud con su numeral. Se dibuja sobre el lado y se contrae
 * hasta ser el numeral del nodo 1: acá viven las dos mitades a la vez y el
 * morph es el cruce de opacidades que hace la actividad.
 */
function buildKey(
  from: Spot,
  to: Spot,
  out: number,
  label: string,
  size: number,
): { brace: SkPath; digits: SkPath } {
  const brace = Skia.Path.Make();
  const nx = to.y - from.y;
  const ny = from.x - to.x;
  const len = Math.hypot(nx, ny) || 1;
  const ux = (nx / len) * out;
  const uy = (ny / len) * out;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  brace.moveTo(from.x + ux * 0.4, from.y + uy * 0.4);
  brace.lineTo(from.x + ux, from.y + uy);
  brace.lineTo(mx + ux, my + uy);
  brace.lineTo(mx + ux * 1.6, my + uy * 1.6);
  brace.moveTo(mx + ux, my + uy);
  brace.lineTo(to.x + ux, to.y + uy);
  brace.lineTo(to.x + ux * 0.4, to.y + uy * 0.4);

  const digits = Skia.Path.Make();
  addGlyphs(digits, label, mx + ux * 2.6, my + uy * 2.6, size);
  return { brace, digits };
}

// --- La partición ------------------------------------------------------------

/**
 * El contorno punteado de un todo mal cortado. No dice "mal": dice que ese
 * borde no cerró, y el jugador ve la diferencia con el que sí.
 */
function dashedRect(b: Box, dash = 7): SkPath {
  const p = Skia.Path.Make();
  const seg = (x0: number, y0: number, x1: number, y1: number): void => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const pasos = Math.max(1, Math.round(len / (dash * 2)));
    for (let i = 0; i < pasos; i++) {
      const a = i / pasos;
      const c = (i + 0.5) / pasos;
      p.moveTo(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a);
      p.lineTo(x0 + (x1 - x0) * c, y0 + (y1 - y0) * c);
    }
  };
  seg(b.x, b.y, b.x + b.w, b.y);
  seg(b.x + b.w, b.y, b.x + b.w, b.y + b.h);
  seg(b.x + b.w, b.y + b.h, b.x, b.y + b.h);
  seg(b.x, b.y + b.h, b.x, b.y);
  return p;
}

/** El disco entero: la pizza en su bandeja. */
function discPath(b: Box): SkPath {
  const p = Skia.Path.Make();
  p.addCircle(b.x + b.w / 2, b.y + b.h / 2, Math.min(b.w, b.h) / 2);
  return p;
}

/**
 * Los radios del disco. Con partes desiguales el corte sale torcido a
 * propósito: es la porción despareja de la mesa, dibujada.
 */
function discRadii(b: Box, parts: number, even: boolean): SkPath {
  const p = Skia.Path.Make();
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = Math.min(b.w, b.h) / 2;
  for (let i = 0; i < parts; i++) {
    const a = discAngle(i, parts, even);
    p.moveTo(cx, cy);
    p.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return p;
}

/** Dónde queda el radio `i`. El corte desparejo corre uno de cada dos. */
function discAngle(i: number, parts: number, even: boolean): number {
  const base = (i / parts) * Math.PI * 2 - Math.PI / 2;
  return even ? base : base + (i % 2 === 1 ? (Math.PI * 2) / (parts * 3) : 0);
}

/** Las porciones encendidas, como cuñas. */
function discWedges(b: Box, parts: number, shaded: number, even: boolean): SkPath {
  const p = Skia.Path.Make();
  if (parts <= 0 || shaded <= 0) return p;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = Math.min(b.w, b.h) / 2;
  const box = Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2);
  for (let i = 0; i < Math.min(shaded, parts); i++) {
    const a0 = discAngle(i, parts, even);
    const a1 = discAngle(i + 1, parts, even);
    p.moveTo(cx, cy);
    p.addArc(box, (a0 * 180) / Math.PI, ((a1 - a0) * 180) / Math.PI);
    p.close();
  }
  return p;
}

/** Un rectángulo redondeado. Es la barra, el vaso y cada plato. */
function roundRect(b: Box, r = 6): SkPath {
  const p = Skia.Path.Make();
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), r, r));
  return p;
}

/**
 * Un todo estático: el que no se está cortando. Devuelve las tres capas que la
 * escena pinta —lo encendido, las líneas de corte y el contorno— ya resueltas
 * según cómo se señala la parte.
 */
function staticWhole(
  b: Box,
  w: TilesWhole,
  marking: TilesMarking,
): { fill: SkPath; cuts: SkPath; outline: SkPath } {
  if (w.disc) {
    return {
      fill: discWedges(b, w.parts, w.shaded, w.even),
      cuts: discRadii(b, w.parts, w.even),
      outline: discPath(b),
    };
  }
  if (marking === "figures") {
    // Una fila de figuras: las giradas son las que cuentan. Nadie cortó nada y
    // sin embargo hay una parte del total.
    const fill = Skia.Path.Make();
    const rest = Skia.Path.Make();
    const n = Math.max(1, w.parts);
    const paso = b.w / n;
    const lado = Math.min(paso * 0.62, b.h * 0.8);
    for (let i = 0; i < n; i++) {
      const cx = b.x + (i + 0.5) * paso;
      const cy = b.y + b.h / 2;
      const target = i < w.shaded ? fill : rest;
      const giro = i < w.shaded ? Math.PI / 4 : 0;
      const cuadrado = Skia.Path.Make();
      cuadrado.addRect(Skia.XYWHRect(-lado / 2, -lado / 2, lado, lado));
      cuadrado.transform([
        Math.cos(giro),
        -Math.sin(giro),
        cx,
        Math.sin(giro),
        Math.cos(giro),
        cy,
        0,
        0,
        1,
      ]);
      target.addPath(cuadrado);
    }
    // Las que no están giradas van como contorno y no como línea de corte: la
    // línea de corte se dibuja del color del fondo, y ahí las figuras que
    // faltan tomar desaparecían y el todo se quedaba sin total.
    return { fill, cuts: Skia.Path.Make(), outline: rest };
  }
  if (marking === "fill") {
    // El vaso: el todo es su altura y la parte se lee de abajo hacia arriba.
    const alto = (b.h * Math.min(w.shaded, w.parts)) / Math.max(1, w.parts);
    return {
      fill: roundRect({ x: b.x, y: b.y + b.h - alto, w: b.w, h: alto }, 4),
      cuts: Skia.Path.Make(),
      outline: roundRect(b, 8),
    };
  }
  const ancho = (b.w * Math.min(w.shaded, w.parts)) / Math.max(1, w.parts);
  const cuts = Skia.Path.Make();
  if (marking === "cut") {
    for (let i = 1; i < w.parts; i++) {
      const x = b.x + segmentAt(i, w.parts, w.even) * b.w;
      cuts.moveTo(x, b.y);
      cuts.lineTo(x, b.y + b.h);
    }
  }
  return {
    fill: roundRect({ x: b.x, y: b.y, w: ancho, h: b.h }, 4),
    cuts,
    outline: w.even ? roundRect(b) : dashedRect(b),
  };
}

/**
 * Dónde cae la línea `i` de `parts`. Con partes desiguales una de cada dos se
 * corre: la mecánica deja cortar desparejo, pero hay que quererlo.
 */
function segmentAt(i: number, parts: number, even: boolean): number {
  const base = i / Math.max(parts, 1);
  return even ? base : Math.min(0.96, base + (i % 2 === 1 ? 0.7 / Math.max(parts, 1) : 0));
}

/** La recta del cero al uno con sus marcas, heredada del nodo 7. */
function linePath(l: TilesLayout, ticks: number): SkPath {
  const p = Skia.Path.Make();
  p.moveTo(l.line.x0, l.line.y);
  p.lineTo(l.line.x1, l.line.y);
  const span = l.line.x1 - l.line.x0;
  for (let i = 0; i <= ticks; i++) {
    const x = l.line.x0 + (span * i) / Math.max(ticks, 1);
    const alto = i === 0 || i === ticks ? 14 : 8;
    p.moveTo(x, l.line.y - alto);
    p.lineTo(x, l.line.y + alto);
  }
  return p;
}

/**
 * La ficha de fracción. Es el corte girado un cuarto de vuelta: la barra
 * horizontal con el número de arriba encima y el de abajo debajo. Hasta que el
 * nodo lee, los dos números son montones de puntos del tamaño de lo que cuentan.
 */
function chipPath(
  spot: { x: number; y: number; size: number },
  value: { num: number; den: number },
  mode: TilesChip,
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

export interface TilesSceneProps {
  readonly config: TilesConfig;
  readonly layout: TilesLayout;
  /** Cuántas filas ya están dentro del marco. Continuo para que se pueda animar. */
  readonly placed: SharedValue<number>;
  /** El cuarto de vuelta del piso, de 0 a 1. */
  readonly spin: SharedValue<number>;
  /** Cuánto se separan las dos tiras del corte, de 0 a 1. */
  readonly split: SharedValue<number>;
  /** Las llaves con numeral sobre los dos lados, de 0 a 1. */
  readonly keys: SharedValue<number>;
  /** La expresión con la cruz, de 0 a 1. Cruza con `keys`: ese cruce es el morph. */
  readonly cross: SharedValue<number>;
  /** La ficha del total, de 0 a 1. */
  readonly token: SharedValue<number>;
  /** El piso pedido con un toque, de 0 a 1. Solo cuenta si `config.onDemand`. */
  readonly ghost: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  readonly rows: readonly RowSlot[];
  readonly appear: SharedValue<number>;
  /**
   * Cuántas tiras de la habitación derecha entraron, **contadas desde abajo**.
   *
   * Desde abajo y no desde arriba porque las dos habitaciones se llenan una
   * contra la otra, y porque es lo que deja el cuadrado de una suma con sus dos
   * rectángulos vacíos en esquinas opuestas: el cuadrado chico arriba a la
   * izquierda, el grande abajo a la derecha. Ausente: la derecha sigue a
   * `placed`, que es como lo usan los nodos que no parten el piso.
   */
  readonly placedRight?: SharedValue<number>;
  /**
   * En cuántas partes está cortado el todo vivo de la partición. Continuo: las
   * líneas ya puestas se corren solas para repartirse el espacio, que es lo que
   * impide cortar desparejo por accidente.
   */
  readonly parts?: SharedValue<number>;
  /** Cuántas partes están encendidas, también continuo. */
  readonly lit?: SharedValue<number>;
  /**
   * El morph del `÷` a la barra de fracción, de 0 a 1. En 0 se ve la división;
   * en 1, la ficha. Es `cs.arith.fraction_as_division` en un solo cruce.
   */
  readonly divide?: SharedValue<number>;
}

export function TilesScene({
  config,
  layout,
  placed,
  spin,
  split,
  keys,
  cross,
  token,
  ghost,
  hint,
  demo,
  rows,
  appear,
  placedRight: placedRightProp,
  parts: partsProp,
  lit: litProp,
  divide: divideProp,
}: TilesSceneProps) {
  // Los valores de la partición son opcionales para que un nodo que solo usa el
  // piso no tenga que inventarlos. El respaldo se crea siempre, así que el
  // orden de los hooks no depende de la configuración.
  const partsFallback = useSharedValue(0);
  const litFallback = useSharedValue(0);
  const divideFallback = useSharedValue(1);
  const parts = partsProp ?? partsFallback;
  const lit = litProp ?? litFallback;
  const divide = divideProp ?? divideFallback;
  const placedRight = placedRightProp ?? placed;
  // Sin el valor propio, la tira derecha sigue a la izquierda fila por fila,
  // que es como la usan los nodos que no parten el piso en habitaciones.
  const derechaDesdeAbajo = placedRightProp !== undefined;
  const floor = useMemo(() => buildFloor(config, layout), [config, layout]);
  const frame = useMemo(() => buildFrame(layout), [layout]);
  const merged = config.skin !== "loose_tiles";

  const looseGeom = useMemo(
    () =>
      layout.drawer.map((spot, i) => {
        const row = config.loose[i];
        const cells = row?.cells ?? 0;
        const tall = row?.tall ?? 1;
        const u = layout.unit;
        const x0 = spot.x - (cells * u) / 2;
        const y0 = spot.y - (tall * u) / 2;
        // Una pieza sola se dibuja de un trazo: sin celdas adentro no se puede
        // contar, y eso es todo lo que dice la tira de largo desconocido.
        if (row?.solid === true) {
          const p = Skia.Path.Make();
          const inset = u * 0.06;
          p.addRRect(
            Skia.RRectXY(
              Skia.XYWHRect(x0 + inset, y0 + inset, cells * u - inset * 2, tall * u - inset * 2),
              4,
              4,
            ),
          );
          return p;
        }
        const p = Skia.Path.Make();
        for (let r = 0; r < tall; r++) p.addPath(cellsPath(x0, y0 + r * u, 0, cells, u));
        return p;
      }),
    [layout, config.loose],
  );

  const rooms = config.rooms ?? null;

  const keyGeom = useMemo(() => {
    const { x, y, w, h } = layout.frame;
    const size = Math.min(layout.unit * 0.7, 22);
    // La normal de cada lado apunta hacia afuera del rectángulo: una llave
    // dibujada por dentro taparía justo las baldosas que está midiendo.
    const top = buildKey({ x, y }, { x: x + w, y }, 10, String(config.frameCols), size);
    const left = buildKey(
      { x, y: y + h },
      { x, y },
      10,
      rooms && rooms.side !== "" ? rooms.side : String(config.frameRows),
      size,
    );
    // La expresión va debajo del piso y no encima: arriba se la comen las
    // llaves, y con un piso alto se saldría del lienzo.
    const abajo = y + h + layout.unit * 1.2;
    const escribir = (text: string): SkPath => {
      const p = Skia.Path.Make();
      addGlyphs(p, text, x + w / 2, abajo, size * 1.2);
      return p;
    };
    const expr = escribir(
      rooms ? rooms.product : `${config.frameRows}×${config.frameCols}`,
    );
    const sum = rooms ? escribir(rooms.sum) : Skia.Path.Make();

    // Una llave por habitación, cada una sobre su tramo de la base. Es lo que
    // convierte "el lado de arriba mide nueve" en "mide x más cuatro".
    const spans: { brace: SkPath; digits: SkPath }[] = [];
    if (rooms) {
      let celda = 0;
      for (const span of rooms.spans) {
        const x0 = x + celda * layout.unit;
        const x1 = x0 + span.cells * layout.unit;
        spans.push(buildKey({ x: x0, y }, { x: x1, y }, 10, span.label, size));
        celda += span.cells;
      }
    }

    // La pared: una línea adentro del marco, en la columna donde el problema
    // parte la base. Se desvanece a medida que las dos tiras se separan, que es
    // el mismo movimiento visto desde el otro lado.
    const wall = Skia.Path.Make();
    if (rooms?.wall === true) {
      const wx = x + layout.cutAt * layout.unit;
      wall.moveTo(wx, y - layout.unit * 0.12);
      wall.lineTo(wx, y + h + layout.unit * 0.12);
    }

    // La llave del lado que la pared tapa va hueca: el corchete se dibuja y el
    // numeral no. Con el numeral puesto no habría nada que leer.
    const hollow = config.hollow ?? null;
    const vacio = Skia.Path.Make();
    return {
      top: hollow === "cols" ? { brace: top.brace, digits: vacio } : top,
      left: hollow === "rows" ? { brace: left.brace, digits: vacio } : left,
      expr,
      sum,
      spans,
      wall,
    };
  }, [layout, config.frameRows, config.frameCols, config.hollow, rooms]);

  /**
   * Las baldosas que sobraron. Se dibujan al costado del rectángulo, sueltas y
   * encendidas: ninguna desaparece al partir, y no hay manera de anotarlas.
   */
  const leftoverGeom = useMemo(() => {
    const n = config.leftover ?? 0;
    if (n <= 0) return null;
    const u = layout.unit;
    const x0 = layout.center.x + (config.cols * u) / 2 + u * 0.9;
    const y0 = layout.center.y - (config.rows * u) / 2;
    const porColumna = Math.max(1, config.rows);
    const p = Skia.Path.Make();
    const inset = u * 0.06;
    for (let i = 0; i < n; i++) {
      const c = Math.floor(i / porColumna);
      const r = i % porColumna;
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(x0 + c * u + inset, y0 + r * u + inset, u - inset * 2, u - inset * 2),
          3,
          3,
        ),
      );
    }
    return p;
  }, [config.leftover, config.cols, config.rows, layout]);

  const totalGeom = useMemo(() => {
    const chip = Skia.Path.Make();
    const w = layout.unit * 1.8;
    const h = layout.unit * 1.1;
    chip.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(layout.totalSpot.x - w / 2, layout.totalSpot.y - h / 2, w, h),
        8,
        8,
      ),
    );
    const digits = Skia.Path.Make();
    if (config.total !== null) {
      addGlyphs(digits, String(config.total), layout.totalSpot.x, layout.totalSpot.y, Math.min(h * 0.66, 24));
    }
    return { chip, digits };
  }, [layout, config.total]);

  // La mano fantasma lleva la primera fila del montón hasta el marco. Es la
  // única instrucción del nivel: el jugador no lee.
  const hand = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 13);
    // En la partición la mano no lleva una fila al marco: apoya el dedo sobre
    // el todo y arrastra hacia abajo, que es el gesto que define el corte.
    const w0 = layout.wholes[0];
    if (w0) {
      return {
        dot,
        from: { x: w0.x + w0.w / 2, y: w0.y + w0.h / 2 },
        to: { x: w0.x + w0.w / 2, y: w0.y + w0.h / 2 + 58 },
      };
    }
    return {
      dot,
      from: layout.drawer[0] ?? layout.center,
      to: { x: layout.frame.x + layout.frame.w / 2, y: layout.frame.y + layout.unit / 2 },
    };
  }, [layout]);

  const handFrom = hand.from;
  const handTo = hand.to;
  const handT = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, demo.value));
    const t = c * c * (3 - 2 * c);
    return [
      { translateX: handFrom.x + (handTo.x - handFrom.x) * t },
      { translateY: handFrom.y + (handTo.y - handFrom.y) * t },
    ];
  }, [handFrom, handTo]);
  const handO = useDerivedValue(() => hint.value * 0.5 * Math.sin(demo.value * Math.PI));

  const cx = layout.center.x;
  const cy = layout.center.y;
  const spinT = useDerivedValue(() => [
    { translateX: cx },
    { translateY: cy },
    { rotate: (spin.value * Math.PI) / 2 },
    { translateX: -cx },
    { translateY: -cy },
  ]);

  // --- La partición ---------------------------------------------------------

  const part = config.partition ?? null;
  const partGeom = useMemo(() => {
    if (!part) return null;
    const vivo = part.wholes[0];
    // El primer todo es el vivo solo cuando hay algo que cortar: un disco no se
    // corta con el dedo y un vaso no tiene líneas.
    const live = !!vivo && !vivo.disc && part.marking === "cut";
    return {
      live,
      liveBox: layout.wholes[0] ?? null,
      liveEven: vivo?.even !== false,
      statics: part.wholes.map((w, i) =>
        i === 0 && live ? null : staticWhole(layout.wholes[i] as Box, w, part.marking),
      ),
      line: part.ticks > 0 ? linePath(layout, part.ticks) : null,
      plates: layout.plates.map((b) => roundRect(b, b.w / 2)),
      chip: part.chipValue ? chipPath(layout.chip, part.chipValue, part.chip) : null,
      division: (() => {
        if (!part.division) return null;
        const p = Skia.Path.Make();
        addGlyphs(
          p,
          `${part.division.a}÷${part.division.b}`,
          layout.chip.x,
          layout.chip.y,
          layout.chip.size,
        );
        return p;
      })(),
      pin: (() => {
        if (part.pinned === null || part.ticks <= 0) return null;
        const p = Skia.Path.Make();
        const x = layout.line.x0 + ((layout.line.x1 - layout.line.x0) * part.pinned) / part.ticks;
        p.moveTo(x, layout.line.y - 26);
        p.lineTo(x, layout.line.y + 26);
        p.addCircle(x, layout.line.y - 26, 5);
        return p;
      })(),
    };
  }, [part, layout]);

  const partChipO = useDerivedValue(() => token.value * divide.value);
  const partDivO = useDerivedValue(() => token.value * (1 - divide.value));

  const onDemand = config.onDemand;
  const floorO = useDerivedValue(() => (onDemand ? ghost.value : 1));
  const innerO = useDerivedValue(() => (merged ? 0.18 : 0.5) * (0.4 + 0.6 * Math.min(1, placed.value)));
  const framePulse = useDerivedValue(() => 0.4 + 0.6 * hint.value);
  // El contorno solo se afirma cuando el marco quedó cubierto entero.
  const outlineO = useDerivedValue(() => Math.max(0, Math.min(1, placed.value - 0.9)));
  // Lo que sobró late. No dice nada porque todavía no hay nada que decir.
  const leftoverO = useDerivedValue(() => 0.5 + 0.5 * hint.value);
  // La pared y el producto se van juntos. Sin habitaciones no hay pared y la
  // expresión no depende del corte: los nodos 5 y 6 separan las tiras como
  // demostración y su escritura tiene que quedarse donde está.
  const hayPared = rooms !== null;
  const wallO = useDerivedValue(() => (hayPared ? 1 - Math.max(0, Math.min(1, split.value)) : 1));
  const gap = layout.unit * SPLIT;

  return (
    <Group opacity={appear}>
      {config.frame ? (
        <>
          <Path path={frame} color={theme.color.surface} />
          <Group opacity={framePulse}>
            <Path path={frame} color={theme.color.accent} style="stroke" strokeWidth={2} />
          </Group>
        </>
      ) : null}

      {/* El piso. Gira entero: ninguna baldosa desaparece al reacomodar. */}
      <Group transform={spinT} opacity={floorO}>
        {floor.strips.map((strip, r) => (
          <FloorRow
            key={r}
            index={r}
            strip={strip}
            placed={placed}
            placedRight={placedRight}
            fromBottom={derechaDesdeAbajo ? floor.strips.length - 1 - r : r}
            split={split}
            gap={gap}
            merged={merged}
          />
        ))}
        <Path
          path={floor.inner}
          color={theme.color.bg}
          style="stroke"
          strokeWidth={STROKE}
          opacity={innerO}
        />
        <Path path={floor.outline} color={theme.color.accent} style="stroke" strokeWidth={2} opacity={outlineO} />
      </Group>

      {/* Las baldosas que sobraron, fuera del rectángulo y sin nombre. */}
      {leftoverGeom ? (
        <Group opacity={leftoverO}>
          <Path path={leftoverGeom} color="#4a3b2a" />
          <Path path={leftoverGeom} color={theme.color.warn} style="stroke" strokeWidth={2} />
        </Group>
      ) : null}

      {/* La pared: el paréntesis dibujado adentro del marco. Se va cuando las
          dos tiras se separan, que es el mismo movimiento visto de este lado. */}
      {rooms?.wall === true ? (
        <Group opacity={wallO}>
          <Path
            path={keyGeom.wall}
            color={theme.color.warn}
            style="stroke"
            strokeWidth={3}
          />
        </Group>
      ) : null}

      {/* Las llaves con numeral y la expresión con la cruz. El cruce es el morph. */}
      {config.keys ? (
        <>
          <Group opacity={keys}>
            {rooms ? (
              keyGeom.spans.map((span, i) => (
                <Group key={`span${i}`}>
                  <Path path={span.brace} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
                  <Path path={span.digits} color={theme.color.ink} />
                </Group>
              ))
            ) : (
              <>
                <Path path={keyGeom.top.brace} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
                <Path path={keyGeom.top.digits} color={theme.color.ink} />
              </>
            )}
            <Path path={keyGeom.left.brace} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
            <Path path={keyGeom.left.digits} color={theme.color.ink} />
          </Group>
          {/* Las dos escrituras ocupan el mismo renglón y se cruzan con la
              pared: no son dos textos, son el mismo piso dicho de dos maneras. */}
          <Group opacity={cross}>
            <Group opacity={wallO}>
              <Path path={keyGeom.expr} color={theme.color.ink} />
            </Group>
            {rooms ? (
              <Group opacity={split}>
                <Path path={keyGeom.sum} color={theme.color.ink} />
              </Group>
            ) : null}
          </Group>
        </>
      ) : null}

      {/* La ficha del total: el rectángulo aplanado en un número. */}
      {config.total !== null ? (
        <Group opacity={token}>
          <Path path={totalGeom.chip} color={theme.color.surfaceHigh} />
          <Path path={totalGeom.chip} color={theme.color.ok} style="stroke" strokeWidth={2} />
          <Path path={totalGeom.digits} color={theme.color.ink} />
        </Group>
      ) : null}

      {/* El montón. Siempre montado: las filas que sobran, invisibles. */}
      {looseGeom.map((path, i) => {
        // Un nodo que solo usa la partición no trae montón, y la ranura no
        // existe: dibujar una fila sin su par de valores rompe la escena.
        const slot = rows[i];
        return slot ? <LooseRowView key={i} path={path} slot={slot} /> : null;
      })}

      {/* La partición: el todo que se corta, el libro, la ficha, los platos y
          la recta. Nada de esto se monta cuando el nodo solo quiere el piso. */}
      {part && partGeom ? (
        <Group>
          {partGeom.plates.map((p, i) => (
            <Path
              key={`plate${i}`}
              path={p}
              color={theme.color.inkFaint}
              style="stroke"
              strokeWidth={STROKE}
            />
          ))}

          {partGeom.statics.map((geom, i) =>
            geom ? (
              <StaticWholeView
                key={part.wholes[i]?.id ?? i}
                geom={geom}
                glow={part.wholes[i]?.glow === true}
                even={part.wholes[i]?.even !== false}
                hint={hint}
              />
            ) : null,
          )}

          {partGeom.live && partGeom.liveBox ? (
            <LiveWholeView
              box={partGeom.liveBox}
              even={partGeom.liveEven}
              parts={parts}
              lit={lit}
              hint={hint}
            />
          ) : null}

          {/* El libro de cuentas: una ficha por parte encendida, todas del
              tamaño de la parte. Con partes desparejas no se apilan. */}
          {part.ledger && partGeom.liveBox
            ? Array.from({ length: MAX_LEDGER }, (_, i) => (
                <LedgerChip
                  key={`led${i}`}
                  index={i}
                  box={partGeom.liveBox as Box}
                  y={layout.ledgerY}
                  even={partGeom.liveEven}
                  parts={parts}
                  lit={lit}
                />
              ))
            : null}

          {partGeom.line ? (
            <Path
              path={partGeom.line}
              color={theme.color.inkDim}
              style="stroke"
              strokeWidth={STROKE}
            />
          ) : null}
          {partGeom.pin ? (
            <Path path={partGeom.pin} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
          ) : null}

          {/* El `÷` del nodo 6 y la ficha son el mismo objeto: sus dos puntos se
              estiran hasta ser los numerales y la barra del medio se queda. */}
          {partGeom.division ? (
            <Group opacity={partDivO}>
              <Path path={partGeom.division} color={theme.color.ink} />
            </Group>
          ) : null}
          {partGeom.chip ? (
            <Group opacity={partGeom.division ? partChipO : token}>
              <Path path={partGeom.chip.bar} color={theme.color.accent} />
              <Path path={partGeom.chip.ink} color={theme.color.ink} />
            </Group>
          ) : null}
        </Group>
      ) : null}

      <Group transform={handT} opacity={handO}>
        <Path path={hand.dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/** Cuántas fichas de libro se montan. Es el techo del corte que se lee. */
const MAX_LEDGER = 12;
/** Cuántas líneas de corte se montan. El árbol no cambia al cortar. */
const MAX_CUTS = 11;

/**
 * El todo que el dedo está cortando. Las líneas están todas montadas y su
 * posición se deriva de `parts`, así que cortar es mover un número y nunca
 * montar un objeto: las líneas ya puestas se corren solas.
 */
function LiveWholeView({
  box,
  even,
  parts,
  lit,
  hint,
}: {
  readonly box: Box;
  readonly even: boolean;
  readonly parts: SharedValue<number>;
  readonly lit: SharedValue<number>;
  readonly hint: SharedValue<number>;
}) {
  const full = useMemo(() => roundRect(box, 6), [box]);
  const dashed = useMemo(() => dashedRect(box), [box]);
  const litT = useDerivedValue(() => {
    const p = Math.max(1, parts.value);
    const k = Math.max(0, Math.min(1, lit.value / p));
    return [{ translateX: box.x }, { scaleX: k }, { translateX: -box.x }];
  }, [box]);
  // El contorno se afirma cuando el corte quedó parejo: es el chasquido, dicho
  // con luz para el que juega con el sonido apagado.
  const snap = useDerivedValue(() => (even ? 0.35 + 0.65 * Math.min(1, parts.value / 2) : 0));
  const pulse = useDerivedValue(() => 0.35 + 0.35 * hint.value);
  return (
    <Group>
      <Path path={full} color={theme.color.surface} />
      <Group transform={litT}>
        <Path path={full} color={theme.color.accent} opacity={0.55} />
      </Group>
      {Array.from({ length: MAX_CUTS }, (_, i) => (
        <CutLine key={i} index={i} box={box} even={even} parts={parts} />
      ))}
      <Group opacity={even ? snap : pulse}>
        <Path
          path={even ? full : dashed}
          color={even ? theme.color.ok : theme.color.inkDim}
          style="stroke"
          strokeWidth={2}
        />
      </Group>
    </Group>
  );
}

/** Una línea de corte. Existe siempre; se ve cuando el corte llegó hasta ella. */
function CutLine({
  index,
  box,
  even,
  parts,
}: {
  readonly index: number;
  readonly box: Box;
  readonly even: boolean;
  readonly parts: SharedValue<number>;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(0, box.y + 2);
    p.lineTo(0, box.y + box.h - 2);
    return p;
  }, [box]);
  const transform = useDerivedValue(() => {
    const n = Math.max(1, parts.value);
    const base = (index + 1) / n;
    const corrido = even ? base : Math.min(0.96, base + (index % 2 === 0 ? 0.7 / n : 0));
    return [{ translateX: box.x + corrido * box.w }];
  }, [box, even]);
  const o = useDerivedValue(() => Math.max(0, Math.min(1, parts.value - index - 1)));
  return (
    <Group transform={transform} opacity={o}>
      <Path
        path={path}
        color={even ? theme.color.bg : theme.color.inkFaint}
        style="stroke"
        strokeWidth={even ? 2 : 1}
      />
    </Group>
  );
}

/**
 * Una ficha del libro. Mide lo que mide la parte que anota, así que con partes
 * desparejas las fichas salen de distinto tamaño y no se apilan: quedan
 * torcidas al costado, y eso es todo lo que el juego dice del error.
 */
function LedgerChip({
  index,
  box,
  y,
  even,
  parts,
  lit,
}: {
  readonly index: number;
  readonly box: Box;
  readonly y: number;
  readonly even: boolean;
  readonly parts: SharedValue<number>;
  readonly lit: SharedValue<number>;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-0.5, -7, 1, 14), 2, 2));
    return p;
  }, []);
  const transform = useDerivedValue(() => {
    const n = Math.max(1, parts.value);
    const ancho = (box.w / n) * 0.8;
    const torcido = even ? 0 : (index % 2 === 0 ? 0.22 : -0.16);
    return [
      { translateX: box.x + ancho * 0.62 + index * (ancho + 5) },
      { translateY: y + (even ? 0 : index * 3) },
      { rotate: torcido },
      { scaleX: ancho },
    ];
  }, [box, y, even, index]);
  const o = useDerivedValue(() => Math.max(0, Math.min(1, lit.value - index)));
  return (
    <Group transform={transform} opacity={o}>
      <Path path={path} color={theme.color.accent} />
    </Group>
  );
}

/** Un todo que no se está cortando: la pizza, el vaso, el camino, las figuras. */
function StaticWholeView({
  geom,
  glow,
  even,
  hint,
}: {
  readonly geom: { readonly fill: SkPath; readonly cuts: SkPath; readonly outline: SkPath };
  readonly glow: boolean;
  readonly even: boolean;
  readonly hint: SharedValue<number>;
}) {
  const o = useDerivedValue(() => (glow ? 0.6 + 0.4 * hint.value : 1));
  return (
    <Group opacity={o}>
      <Path path={geom.outline} color={theme.color.surface} />
      <Path path={geom.fill} color={theme.color.accent} opacity={0.55} />
      <Path
        path={geom.cuts}
        color={even ? theme.color.bg : theme.color.inkFaint}
        style="stroke"
        strokeWidth={even ? 2 : 1}
      />
      <Path
        path={geom.outline}
        color={even ? theme.color.inkDim : theme.color.inkFaint}
        style="stroke"
        strokeWidth={2}
      />
    </Group>
  );
}

/**
 * Una fila del piso. Su opacidad es cuánto de esa fila ya entró, así que soltar
 * a mitad de camino conserva el estado en vez de decir "mal".
 */
function FloorRow({
  index,
  strip,
  placed,
  placedRight,
  fromBottom,
  split,
  gap,
  merged,
}: {
  readonly index: number;
  readonly strip: { readonly left: SkPath; readonly right: SkPath };
  readonly placed: SharedValue<number>;
  readonly placedRight: SharedValue<number>;
  /** Qué número de fila es contando desde abajo. */
  readonly fromBottom: number;
  readonly split: SharedValue<number>;
  readonly gap: number;
  readonly merged: boolean;
}) {
  const o = useDerivedValue(() => Math.max(0, Math.min(1, placed.value - index)));
  // La habitación derecha se llena contra la izquierda, así que su fila se
  // cuenta desde abajo. Cuando las dos comparten el mismo valor el efecto no se
  // nota, porque entonces las dos están llenas o las dos vacías.
  const oR = useDerivedValue(() => Math.max(0, Math.min(1, placedRight.value - fromBottom)));
  const leftT = useDerivedValue(() => [{ translateX: -split.value * gap }]);
  const rightT = useDerivedValue(() => [{ translateX: split.value * gap }]);
  const fill = merged ? "#2b3a4d" : "#33445c";
  return (
    <>
      <Group opacity={o} transform={leftT}>
        <Path path={strip.left} color={fill} />
        <Path path={strip.left} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      </Group>
      <Group opacity={oR} transform={rightT}>
        <Path path={strip.right} color={fill} />
        <Path path={strip.right} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      </Group>
    </>
  );
}

/** Una fila suelta. Su dibujo sigue al mismo par de valores que el gesto. */
function LooseRowView({ path, slot }: { readonly path: SkPath; readonly slot: RowSlot }) {
  const transform = useDerivedValue(() => [
    { translateX: slot.dx.value },
    { translateY: slot.dy.value },
  ]);
  return (
    <Group transform={transform} opacity={slot.alive}>
      <Path path={path} color="#33445c" />
      <Path path={path} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
    </Group>
  );
}
