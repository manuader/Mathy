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
 *
 * El estilo es el del nodo 1 (`BowlScene`), y el color tiene un trabajo:
 *
 * - Las baldosas son un material neutro con volumen (la ficha de las bandejas,
 *   `chipTone`): un degradado por grupo que comparte `SkPath`, nunca uno por
 *   baldosa, así que sesenta cuestan lo mismo que cuatro.
 * - `accent` es la parte encendida de un todo, y lo que la anota (el libro, el
 *   número de arriba de la ficha): el equipo de la parte.
 * - `ok` es "coincide": el contorno del piso que cubrió el marco, el corte
 *   parejo, la ficha en su marca. `warn` es "mirá acá": lo que sobró, el corte
 *   desparejo, la ficha en otra marca.
 * - Las ranuras son surcos dibujados sobre el material, no el color del fondo:
 *   sobre el paisaje, el color del fondo se veía como un parche.
 *
 * Y el jugo: la fila levantada crece un 30 %; la que entra al piso sale de
 * donde la soltó el dedo y se asienta con un rebote. El evento que la escena
 * enseña —el rectángulo quedó armado, las partes iguales hacen la fracción, la
 * ficha llega— responde una sola vez en el objeto que lo causó, con halo y
 * chispas. Los resortes los arrancan reacciones sobre los mismos `SharedValue`,
 * en el hilo de la interfaz: nada vuelve a JavaScript por cuadro.
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
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { chipTone } from "../ui/Kit.tsx";
import { play, type Sfx } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;

/**
 * La escala del piso que se llena: cada fila que entra suena un escalón más
 * arriba, como el agua que sube en una botella. Pentatónica, para que cualquier
 * tramo suene a una subida.
 */
const FILL = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24] as const;
const fillPitch = (i: number): number => FILL[Math.max(0, Math.min(i, FILL.length - 1))] as number;

/**
 * Suena un efecto cuando pasa lo que lo causa. Desde un worklet se llama con
 * `runOnJS`. Sin audio no suena, y el juego no depende de eso para decir nada.
 */
function sfx(name: Sfx, pitch = 0, delay = 0): void {
  if (delay <= 0) play(name, { pitch });
  else setTimeout(() => play(name, { pitch }), delay);
}
/** Baldosa máxima: más grande, un piso de cinco por cinco no entra. */
const MAX_UNIT = 38;
/** Cuánto se separan las dos tiras cuando el piso se parte, en baldosas. */
const SPLIT = 0.35;

/**
 * La baldosa: la misma familia que la ficha neutra de las bandejas (`chipTone`
 * de `Kit.tsx`), un punto más clara porque es un material y no un botón. Luz
 * arriba, canto oscuro abajo y un filo claro en el borde de arriba: volumen sin
 * color, porque una baldosa no es de ningún equipo.
 */
const TILE = {
  light: "#3f6594",
  base: chipTone.top,
  dark: chipTone.low,
  edge: chipTone.edge,
  rim: chipTone.rimTop,
} as const;
/** Cuánto asoma el canto debajo de la baldosa. */
const TILE_EDGE = 2.5;

/**
 * La ranura entre dos piezas: un surco oscuro con un filo de luz al lado. Antes
 * era el color del fondo, que hacía de hueco sobre el fondo plano y sobre el
 * paisaje se veía como una raya de otro color; un surco se lee igual sobre
 * cualquier cosa, porque está dibujado encima del material y no del mundo.
 */
const GROOVE = "rgba(4, 9, 16, 0.78)";
const GROOVE_LIGHT = "rgba(255, 255, 255, 0.16)";

/** El borde de vidrio de las superficies que viven sobre el lienzo (N, estilo visual). */
const GLASS_LINE = "rgba(255, 255, 255, 0.12)";
/** Lo que va debajo de algo que tiene que leerse sobre cualquier paisaje. */
const READ_BACK = "rgba(9, 17, 29, 0.9)";

/** La parte encendida: el equipo de la parte, con su luz y su sombra. */
const PART = { light: "#b8e2ff", base: theme.color.accent, dark: "#1f7fcf" } as const;

/** La ficha del total: exactamente la ficha neutra de las bandejas. */
const CHIP_LOOK = {
  light: chipTone.top,
  base: chipTone.face,
  dark: chipTone.low,
  edge: chipTone.edge,
  rim: chipTone.rimTop,
} as const;

/** Los platos del reparto son de cerámica: un contenedor, no una parte. */
const PLATE = { light: "#c3cedd", base: "#8d9db3", dark: "#56657a" } as const;

/** Chispas del evento: ocho, repartidas alrededor del objeto que lo causó. */
const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4 + Math.PI / 8);

/**
 * Una chispa del evento, como las del puente del nodo 1: sale del objeto que la
 * causó, se abre y se apaga en ~700 ms. Está montada siempre, con opacidad cero
 * hasta que `burst` corre de 0 a 1 (modo retained: una chispa por hueco, no
 * una por evento).
 */
function Spark({
  x,
  y,
  angle,
  reach,
  gold,
  burst,
}: {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  /** A qué distancia del centro nace: el borde del objeto, no su centro. */
  readonly reach: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
}) {
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 3);
    return p;
  }, []);
  const t = useDerivedValue(() => {
    const d = reach + 30 * burst.value;
    return [
      { translateX: x + Math.cos(angle) * d },
      { translateY: y + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [x, y, angle, reach]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}

/** Las chispas de un rectángulo: salen de su borde, alrededor de su centro. */
function Sparks({ box, burst }: { readonly box: Box; readonly burst: SharedValue<number> }) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const reach = Math.min(box.w, box.h) / 2 + 6;
  return (
    <>
      {SPARKS.map((a, i) => (
        <Spark key={i} x={cx} y={cy} angle={a} reach={reach} gold={i % 2 === 1} burst={burst} />
      ))}
    </>
  );
}

/**
 * El cuerpo con volumen de un grupo de baldosas que comparten un `SkPath`: el
 * canto debajo, un solo degradado de arriba abajo de lo que ocupa el grupo, y
 * el filo de luz. Tres dibujos por grupo, sea cual sea la cantidad de baldosas.
 */
function TileBody({ path, look = TILE }: { readonly path: SkPath; readonly look?: TileLook }) {
  const b = useMemo(() => path.getBounds(), [path]);
  return (
    <>
      <Group transform={[{ translateY: TILE_EDGE }]}>
        <Path path={path} color={look.edge} />
      </Group>
      <Path path={path}>
        <LinearGradient
          start={vec(0, b.y)}
          end={vec(0, b.y + Math.max(1, b.height))}
          colors={[look.light, look.base, look.dark]}
        />
      </Path>
      <Path path={path} color={look.rim} style="stroke" strokeWidth={1} />
    </>
  );
}

interface TileLook {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
  readonly edge: string;
  readonly rim: string;
}

/**
 * Un numeral o una expresión dibujados, con un borde oscuro debajo: se leen
 * igual sobre el piso, sobre el vidrio o directo sobre el paisaje.
 */
function Legible({ path, color }: { readonly path: SkPath; readonly color: string }) {
  return (
    <>
      <Path path={path} color={READ_BACK} style="stroke" strokeWidth={3} strokeJoin="round" />
      <Path path={path} color={color} />
    </>
  );
}

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
): { bar: SkPath; num: SkPath; den: SkPath } {
  const bar = Skia.Path.Make();
  // Arriba y abajo van separados porque no dicen lo mismo: arriba cuenta las
  // partes encendidas, que llevan su color; abajo, el todo, en tinta.
  const num = Skia.Path.Make();
  const den = Skia.Path.Make();
  const s = spot.size;
  const w = Math.max(s * 1.5, s * 0.5 * String(value.den).length + s);
  bar.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - w / 2, spot.y - 1.5, w, 3), 2, 2));
  if (mode === "numerals") {
    addGlyphs(num, String(value.num), spot.x, spot.y - s * 0.72, s);
    addGlyphs(den, String(value.den), spot.x, spot.y + s * 0.72, s);
  } else if (mode === "dots") {
    const dots = (ink: SkPath, count: number, cy: number): void => {
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
    dots(num, value.num, spot.y - s * 0.72);
    dots(den, value.den, spot.y + s * 0.72);
  }
  return { bar, num, den };
}

/** El cartón oscuro detrás de la ficha: se lee igual sobre cualquier paisaje. */
function chipCardPath(spot: { x: number; y: number; size: number }): SkPath {
  const p = Skia.Path.Make();
  const s = spot.size;
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - s * 1.25, spot.y - s * 1.45, s * 2.5, s * 2.9), 12, 12));
  return p;
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
      statics: part.wholes.map((w, i) => {
        if (i === 0 && live) return null;
        const b = layout.wholes[i] as Box;
        const sw = staticWhole(b, w, part.marking);
        // El cuerpo es siempre la forma cerrada: la barra desigual tiene el
        // contorno punteado, pero no por eso deja de ser una barra.
        const body =
          !w.disc && part.marking !== "figures" && part.marking !== "fill" ? roundRect(b) : sw.outline;
        return { ...sw, body };
      }),
      line: part.ticks > 0 ? linePath(layout, part.ticks) : null,
      card: chipCardPath(layout.chip),
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
    };
  }, [part, layout]);

  const partChipO = useDerivedValue(() => token.value * divide.value);
  const partDivO = useDerivedValue(() => token.value * (1 - divide.value));

  // Lo que la partición sabe de sí misma sin preguntarle a la actividad: la
  // ficha dice qué fracción se pide, así que la escena ve cuándo el todo vivo
  // quedó cortado parejo en esas partes con esas encendidas, y si la ficha
  // quedó clavada en su marca.
  const vivo0 = part?.wholes[0];
  const pedido = part?.chipValue ?? null;
  const liveDone =
    !!vivo0 &&
    pedido !== null &&
    vivo0.even &&
    vivo0.parts === pedido.den &&
    vivo0.shaded === pedido.num;
  const pinMark = part && part.ticks > 0 ? part.pinned : null;
  const pinX =
    part && pinMark !== null
      ? layout.line.x0 + ((layout.line.x1 - layout.line.x0) * pinMark) / Math.max(part.ticks, 1)
      : layout.line.x0;
  const pinGood = pinMark !== null && pedido !== null && pinMark === pedido.num;

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

  // --- El evento: el rectángulo quedó armado --------------------------------
  //
  // Es lo que el piso enseña: filas sueltas que, juntas, son un rectángulo. El
  // momento en que la última fila lo cierra —o en que el piso girado entra en
  // el marco— el contorno se afirma en menta con un halo y suelta chispas, una
  // sola vez. Todo corre en el hilo de la interfaz, derivado de los mismos
  // valores que el gesto.
  //
  // "Una sola vez" pide saber cuándo el piso se cerró a mano y cuándo llegó
  // cerrado. Un valor que la actividad pone de golpe (una ronda nueva) salta de
  // un entero a otro en un cuadro; uno que trae un gesto pasa por el medio. El
  // piso que llegó cerrado queda desarmado para la ronda: si después se vacía y
  // se vuelve a llenar, es la réplica de una respuesta que no era, y eso no se
  // celebra.
  const floorBurst = useSharedValue(1);
  const armed = useSharedValue(0);
  /** Si el piso ya soltó sus chispas en esta ronda: la ficha que sigue solo rebota. */
  const floorFired = useSharedValue(0);
  const full = config.rows;
  useEffect(() => {
    floorFired.value = 0;
  }, [config, floorFired]);
  const fireFloor = (): void => {
    "worklet";
    floorBurst.value = 0;
    floorBurst.value = withTiming(1, { duration: 720 });
    floorFired.value = 1;
    // El piso coincide con el marco: vidrio, un instante después de la madera
    // de la última fila, que es la que lo cerró.
    runOnJS(sfx)("join", 0, 90);
  };
  // Los valores anteriores viven en `SharedValue` propios: una reacción que se
  // vuelve a registrar (la actividad cambia de estado en el mismo gesto que
  // arranca la animación) no trae valor anterior en su primera llamada, y el
  // evento se perdería justo cuando pasa. -1 es "todavía no sé".
  const lastFull = useSharedValue(-1);
  const lastSpin = useSharedValue(0);
  const lastToken = useSharedValue(1);
  const lastDivide = useSharedValue(1);
  useAnimatedReaction(
    () => Math.min(placed.value, placedRight.value),
    (f) => {
      const prev = lastFull.value;
      lastFull.value = f;
      if (prev < 0) {
        armed.value = f < full - 0.001 ? 1 : 0;
        return;
      }
      const entero = (v: number): boolean => Math.abs(v - Math.round(v)) < 0.001;
      const golpe = entero(f) && entero(prev) && Math.abs(f - prev) >= 0.999;
      if (f < full - 0.001) {
        if (golpe) armed.value = 1;
        return;
      }
      if (prev >= full - 0.001) return;
      if (armed.value === 1 && !golpe) fireFloor();
      armed.value = 0;
    },
    [full],
  );
  // El giro: las mismas baldosas, dadas vuelta, entran en el marco.
  useAnimatedReaction(
    () => spin.value,
    (now) => {
      const prev = lastSpin.value;
      lastSpin.value = now;
      if (prev > 0.001 && prev < 0.999 && now >= 0.999) fireFloor();
    },
  );
  const floorHalo = useDerivedValue(() => (floorBurst.value < 1 ? 1 - floorBurst.value : 0));
  const floorBox = useMemo<Box>(
    () => ({
      x: layout.center.x - layout.floor.w / 2,
      y: layout.center.y - layout.floor.h / 2,
      w: layout.floor.w,
      h: layout.floor.h,
    }),
    [layout],
  );

  // --- La ficha llega -------------------------------------------------------
  //
  // La ficha del total (o la de fracción) aparece con un rebote cuando la trae
  // un gesto. Si el piso ya celebró en esta ronda, la ficha solo rebota: es el
  // mismo evento dicho de otra manera. Si no —la respuesta elegida del
  // teclado, el `÷` que se contrae— la ficha es el evento y suelta las chispas.
  const chipPop = useSharedValue(0);
  const chipBurst = useSharedValue(1);
  const llegaFicha = (now: number, last: SharedValue<number>): void => {
    "worklet";
    const prev = last.value;
    last.value = now;
    if (!(prev <= 0.001 && now > 0.001 && now < 0.6)) return;
    chipPop.value = 1;
    chipPop.value = withSpring(0, theme.spring.settle);
    // La ficha entra en su lugar: clic. Si es ella el evento (no lo celebró el
    // piso antes), además coincide: vidrio.
    runOnJS(sfx)("fit", 0, 0);
    if (floorFired.value === 0) {
      chipBurst.value = 0;
      chipBurst.value = withTiming(1, { duration: 720 });
      runOnJS(sfx)("join", 0, 130);
    }
  };
  useAnimatedReaction(
    () => token.value,
    (now) => llegaFicha(now, lastToken),
  );
  useAnimatedReaction(
    () => divide.value,
    (now) => llegaFicha(now, lastDivide),
  );
  const chipHalo = useDerivedValue(() => (chipBurst.value < 1 ? 1 - chipBurst.value : 0));
  const tsx = layout.totalSpot.x;
  const tsy = layout.totalSpot.y;
  const totalT = useDerivedValue(
    () => [
      { translateX: tsx },
      { translateY: tsy },
      { scale: 1 + 0.25 * chipPop.value },
      { translateX: -tsx },
      { translateY: -tsy },
    ],
    [tsx, tsy],
  );
  const pcx = layout.chip.x;
  const pcy = layout.chip.y;
  const partChipT = useDerivedValue(
    () => [
      { translateX: pcx },
      { translateY: pcy },
      { scale: 1 + 0.25 * chipPop.value },
      { translateX: -pcx },
      { translateY: -pcy },
    ],
    [pcx, pcy],
  );
  // Las chispas de la ficha salen de la ficha que haya: la del total en el
  // piso, la de fracción en la partición.
  const chipBox = useMemo<Box>(() => {
    if (config.partition) {
      const s = layout.chip.size;
      return { x: layout.chip.x - s * 1.1, y: layout.chip.y - s * 1.4, w: s * 2.2, h: s * 2.8 };
    }
    const w = layout.unit * 1.8;
    const h = layout.unit * 1.1;
    return { x: tsx - w / 2, y: tsy - h / 2, w, h };
  }, [config.partition, layout, tsx, tsy]);

  return (
    <Group opacity={appear}>
      {/* El marco vacío es un hueco de vidrio oscuro: se lee como un lugar que
          hay que cubrir sobre cualquier paisaje. Su borde late mientras la
          demostración pide el gesto; no tiene color de equipo, porque el marco
          no es de nadie. */}
      {config.frame ? (
        <>
          <Path path={frame} color="rgba(9, 17, 29, 0.62)" />
          <Path path={frame} color={GLASS_LINE} style="stroke" strokeWidth={1} />
          <Group opacity={framePulse}>
            <Path
              path={frame}
              color="rgba(255, 255, 255, 0.45)"
              style="stroke"
              strokeWidth={2.5}
              strokeJoin="round"
            />
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
            rightOwn={derechaDesdeAbajo}
            split={split}
            gap={gap}
            slots={rows}
            drawer={layout.drawer}
          />
        ))}
        {/* Las juntas entre baldosas: un surco, no el color del fondo. */}
        <Path
          path={floor.inner}
          color={GROOVE}
          style="stroke"
          strokeWidth={STROKE}
          strokeCap="round"
          opacity={innerO}
        />
        {/* El contorno se afirma en menta cuando el piso coincide con el marco. */}
        <Group opacity={floorHalo}>
          <Path path={floor.outline} color={theme.color.ok} style="stroke" strokeWidth={10}>
            <BlurMask blur={8} style="normal" />
          </Path>
        </Group>
        <Path
          path={floor.outline}
          color={theme.color.ok}
          style="stroke"
          strokeWidth={2.5}
          strokeJoin="round"
          opacity={outlineO}
        />
      </Group>
      <Sparks box={floorBox} burst={floorBurst} />

      {/* Las baldosas que sobraron, fuera del rectángulo y sin nombre. */}
      {/* Son baldosas como las otras —el mismo material—; lo que late es el
          anillo ámbar alrededor: "mirá acá", sin decir nada más. */}
      {leftoverGeom ? (
        <>
          <TileBody path={leftoverGeom} />
          <Group opacity={leftoverO}>
            <Path
              path={leftoverGeom}
              color={theme.color.warn}
              style="stroke"
              strokeWidth={2.5}
              strokeJoin="round"
            />
          </Group>
        </>
      ) : null}

      {/* La pared: el paréntesis dibujado adentro del marco. Se va cuando las
          dos tiras se separan, que es el mismo movimiento visto de este lado. */}
      {rooms?.wall === true ? (
        // La pared es tinta, como el paréntesis que dibuja: una pieza firme
        // con un borde oscuro que la despega de las baldosas. No es ámbar
        // porque no pide atención todo el tiempo: la pide la guía, cuando toca.
        <Group opacity={wallO}>
          <Path
            path={keyGeom.wall}
            color={READ_BACK}
            style="stroke"
            strokeWidth={7}
            strokeCap="round"
          />
          <Path
            path={keyGeom.wall}
            color={theme.color.ink}
            style="stroke"
            strokeWidth={3.5}
            strokeCap="round"
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
                  <Path
                    path={span.brace}
                    color={theme.color.inkDim}
                    style="stroke"
                    strokeWidth={2.5}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                  <Legible path={span.digits} color={theme.color.ink} />
                </Group>
              ))
            ) : (
              <>
                <Path
                  path={keyGeom.top.brace}
                  color={theme.color.inkDim}
                  style="stroke"
                  strokeWidth={2.5}
                  strokeCap="round"
                  strokeJoin="round"
                />
                <Legible path={keyGeom.top.digits} color={theme.color.ink} />
              </>
            )}
            <Path
              path={keyGeom.left.brace}
              color={theme.color.inkDim}
              style="stroke"
              strokeWidth={2.5}
              strokeCap="round"
              strokeJoin="round"
            />
            <Legible path={keyGeom.left.digits} color={theme.color.ink} />
          </Group>
          {/* Las dos escrituras ocupan el mismo renglón y se cruzan con la
              pared: no son dos textos, son el mismo piso dicho de dos maneras. */}
          <Group opacity={cross}>
            <Group opacity={wallO}>
              <Legible path={keyGeom.expr} color={theme.color.ink} />
            </Group>
            {rooms ? (
              <Group opacity={split}>
                <Legible path={keyGeom.sum} color={theme.color.ink} />
              </Group>
            ) : null}
          </Group>
        </>
      ) : null}

      {/* La ficha del total: el rectángulo aplanado en un número. Es una ficha
          como las de la bandeja, con su canto; el filo menta dice que es el
          total de ese piso, y llega con un rebote. */}
      {config.total !== null ? (
        <Group opacity={token}>
          <Group transform={totalT}>
            <TileBody path={totalGeom.chip} look={CHIP_LOOK} />
            <Group opacity={chipHalo}>
              <Path path={totalGeom.chip} color={theme.color.ok} style="stroke" strokeWidth={7}>
                <BlurMask blur={6} style="normal" />
              </Path>
            </Group>
            <Path path={totalGeom.chip} color={theme.color.ok} style="stroke" strokeWidth={2} />
            <Legible path={totalGeom.digits} color={theme.color.ink} />
          </Group>
        </Group>
      ) : null}
      <Sparks box={chipBox} burst={chipBurst} />

      {/* El montón. Siempre montado: las filas que sobran, invisibles. */}
      {looseGeom.map((path, i) => {
        // Un nodo que solo usa la partición no trae montón, y la ranura no
        // existe: dibujar una fila sin su par de valores rompe la escena.
        const slot = rows[i];
        return slot ? (
          <LooseRowView
            key={i}
            path={path}
            slot={slot}
            spot={layout.drawer[i] ?? layout.center}
          />
        ) : null;
      })}

      {/* La partición: el todo que se corta, el libro, la ficha, los platos y
          la recta. Nada de esto se monta cuando el nodo solo quiere el piso. */}
      {part && partGeom ? (
        <Group>
          {layout.plates.map((b, i) => (
            <Plate key={`plate${i}`} box={b} />
          ))}

          {partGeom.statics.map((geom, i) => {
            const w = part.wholes[i];
            const b = layout.wholes[i];
            if (!geom || !w || !b) return null;
            // Coincide con la ficha: partes iguales y la misma proporción
            // encendida. Es lo único que se celebra cuando el todo se enciende.
            const coincide =
              pedido !== null && w.even && w.shaded * pedido.den === pedido.num * w.parts;
            return (
              <StaticWholeView
                key={w.id}
                geom={geom}
                box={b}
                glow={w.glow}
                even={w.even}
                matches={coincide}
                sig={`${b.x},${b.y},${b.w},${b.h},${w.parts},${w.shaded},${w.even},${w.disc}`}
                vessel={part.marking === "fill" && !w.disc}
                hint={hint}
              />
            );
          })}

          {partGeom.live && partGeom.liveBox ? (
            <LiveWholeView
              box={partGeom.liveBox}
              even={partGeom.liveEven}
              parts={parts}
              lit={lit}
              hint={hint}
              done={liveDone}
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

          {/* La recta, con un borde oscuro debajo para leerse sobre el paisaje,
              y la ficha clavada: menta si cayó en su marca, ámbar si pide que
              la miren. Nunca menta sobre una marca que no es. */}
          {partGeom.line ? (
            <>
              <Path
                path={partGeom.line}
                color={READ_BACK}
                style="stroke"
                strokeWidth={5}
                strokeCap="round"
              />
              <Path
                path={partGeom.line}
                color={theme.color.inkDim}
                style="stroke"
                strokeWidth={2.5}
                strokeCap="round"
              />
              <Pin x={pinX} y={layout.line.y} mark={pinMark} good={pinGood} />
            </>
          ) : null}

          {/* El cartón de la ficha, el `÷` y la ficha llegan juntos y rebotan
              juntos. El `÷` del nodo 6 y la ficha son el mismo objeto: sus dos
              puntos se estiran hasta ser los numerales y la barra se queda. */}
          {partGeom.chip || partGeom.division ? (
            <Group opacity={token}>
              <Group transform={partChipT}>
                <Path path={partGeom.card} color={READ_BACK} />
                <Path path={partGeom.card} color={GLASS_LINE} style="stroke" strokeWidth={1} />
                <Group opacity={chipHalo}>
                  <Path path={partGeom.card} color={theme.color.ok} style="stroke" strokeWidth={6}>
                    <BlurMask blur={6} style="normal" />
                  </Path>
                  <Path path={partGeom.card} color={theme.color.ok} style="stroke" strokeWidth={2} />
                </Group>
              </Group>
            </Group>
          ) : null}
          {partGeom.division ? (
            <Group opacity={partDivO}>
              <Group transform={partChipT}>
                <Path path={partGeom.division} color={theme.color.ink} />
              </Group>
            </Group>
          ) : null}
          {partGeom.chip ? (
            <Group opacity={partGeom.division ? partChipO : token}>
              <Group transform={partChipT}>
                <Path path={partGeom.chip.bar} color={theme.color.inkDim} />
                <Path path={partGeom.chip.num} color={PART.base} />
                <Path path={partGeom.chip.den} color={theme.color.ink} />
              </Group>
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
  done = false,
}: {
  readonly box: Box;
  readonly even: boolean;
  readonly parts: SharedValue<number>;
  readonly lit: SharedValue<number>;
  readonly hint: SharedValue<number>;
  /** El todo quedó cortado parejo en las partes de la ficha, con las encendidas. */
  readonly done?: boolean;
}) {
  const full = useMemo(() => roundRect(box, 6), [box]);
  const dashed = useMemo(() => dashedRect(box), [box]);
  const litT = useDerivedValue(() => {
    const p = Math.max(1, parts.value);
    const k = Math.max(0, Math.min(1, lit.value / p));
    return [{ translateX: box.x }, { scaleX: k }, { translateX: -box.x }];
  }, [box]);
  // El contorno se afirma cuando el corte quedó parejo: es el chasquido, dicho
  // con luz para el que juega con el sonido apagado. Menta es "coincide", así
  // que antes del primer corte no hay menta: todavía no hay partes que coincidan.
  const snap = useDerivedValue(
    () => (even ? Math.max(0, Math.min(1, parts.value - 1)) : 0),
    [even],
  );
  // Antes del primer corte el borde late con la demostración: es la única
  // instrucción, y no es de ningún color porque no dice nada todavía.
  const invite = useDerivedValue(() => (parts.value < 1 ? 0.3 + 0.5 * hint.value : 0));

  // El corte desparejo no dice "mal": el contorno queda punteado y un anillo
  // ámbar late alrededor, "mirá acá". Late con su propio pulso, porque el de la
  // demostración se apaga en cuanto el jugador toca.
  const beat = useSharedValue(0);
  useEffect(() => {
    beat.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(beat);
  }, [beat]);
  const warnO = useDerivedValue(() => (even ? 0 : 0.4 + 0.6 * beat.value), [even]);

  // El chasquido del corte parejo, con sonido: cada línea que el dedo agrega
  // hace clic, y cuantas más partes, más aguda, como una tabla más corta. El
  // corte desparejo no chasquea, y así se oye también que no cerró. Solo cuenta
  // un paso de a uno: una ronda nueva salta de golpe y no suena.
  const lastCut = useSharedValue(-1);
  useAnimatedReaction(
    () => parts.value,
    (now) => {
      const n = Math.round(now);
      if (Math.abs(now - n) > 0.01) return;
      const prev = lastCut.value;
      lastCut.value = n;
      // El primer corte salta de entero a dos partes de una: también es un clic.
      const paso = Math.abs(n - prev) === 1 || (prev <= 1 && n === 2);
      if (prev < 0 || !even || n < 2 || !paso) return;
      runOnJS(sfx)("fit", (n - 2) * 2, 0);
    },
    [even],
  );

  // El evento: las partes iguales, las encendidas que pide la ficha. Eso es la
  // fracción, y el todo lo celebra una vez, con halo menta y chispas.
  const burst = useSharedValue(1);
  const antes = useRef(done);
  useEffect(() => {
    if (done && !antes.current) {
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
      sfx("join", 0, 120);
    }
    antes.current = done;
  }, [done, burst]);
  const halo = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));

  return (
    <Group>
      <TileBody path={full} />
      <Group transform={litT}>
        <Path path={full}>
          <LinearGradient
            start={vec(0, box.y)}
            end={vec(0, box.y + box.h)}
            colors={[PART.light, PART.base, PART.dark]}
          />
        </Path>
      </Group>
      <Path path={full} color={TILE.rim} style="stroke" strokeWidth={1} />
      {Array.from({ length: MAX_CUTS }, (_, i) => (
        <CutLine key={i} index={i} box={box} even={even} parts={parts} />
      ))}
      <Group opacity={invite}>
        <Path path={full} color="rgba(255, 255, 255, 0.55)" style="stroke" strokeWidth={2} />
      </Group>
      <Group opacity={snap}>
        <Path path={full} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
      </Group>
      <Group opacity={warnO}>
        <Path path={dashed} color={theme.color.warn} style="stroke" strokeWidth={2.5} strokeCap="round" />
      </Group>
      <Group opacity={halo}>
        <Path path={full} color={theme.color.ok} style="stroke" strokeWidth={10}>
          <BlurMask blur={8} style="normal" />
        </Path>
      </Group>
      <Sparks box={box} burst={burst} />
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
  // El corte parejo es un surco en el material con su filo de luz; el
  // desparejo, un rayón claro: se ve que alguien pasó el dedo, no que cortó.
  return (
    <Group transform={transform} opacity={o}>
      <Group opacity={even ? 1 : 0}>
        <Path path={path} color={GROOVE} style="stroke" strokeWidth={2.5} strokeCap="round" />
        <Group transform={[{ translateX: 1.6 }]}>
          <Path path={path} color={GROOVE_LIGHT} style="stroke" strokeWidth={1} />
        </Group>
      </Group>
      <Group opacity={even ? 0 : 1}>
        <Path
          path={path}
          color="rgba(255, 255, 255, 0.38)"
          style="stroke"
          strokeWidth={1.5}
          strokeCap="round"
        />
      </Group>
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
  const { path, shine } = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-0.5, -7, 1, 14), 2, 2));
    // El brillo va como una franja fina y no como trazo: la ficha se estira en
    // `scaleX`, y un trazo se estiraría con ella.
    const s = Skia.Path.Make();
    s.addRect(Skia.XYWHRect(-0.42, -6, 0.84, 2.2));
    return { path: p, shine: s };
  }, []);
  // La ficha que se anota llega con un salto y se asienta: la trajo el toque.
  const pop = useSharedValue(0);
  const last = useSharedValue(1e9);
  useAnimatedReaction(
    () => lit.value,
    (now) => {
      const prev = last.value;
      last.value = now;
      if (prev <= index && now > index && now - prev < 0.999) {
        pop.value = 1;
        pop.value = withSpring(0, theme.spring.settle);
        // La ficha cae en el libro: madera, un escalón más arriba cada una.
        runOnJS(sfx)("drop", fillPitch(index), 0);
      }
    },
    [index],
  );
  const transform = useDerivedValue(() => {
    const n = Math.max(1, parts.value);
    const ancho = (box.w / n) * 0.8;
    const torcido = even ? 0 : (index % 2 === 0 ? 0.22 : -0.16);
    return [
      { translateX: box.x + ancho * 0.62 + index * (ancho + 5) },
      { translateY: y + (even ? 0 : index * 3) - 8 * pop.value },
      { rotate: torcido },
      { scaleX: ancho },
      { scaleY: 1 + 0.3 * pop.value },
    ];
  }, [box, y, even, index]);
  const o = useDerivedValue(() => Math.max(0, Math.min(1, lit.value - index)));
  return (
    <Group transform={transform} opacity={o}>
      <Group transform={[{ translateY: 2.5 }]}>
        <Path path={path} color={PART.dark} opacity={0.7} />
      </Group>
      <Path path={path}>
        <LinearGradient start={vec(0, -7)} end={vec(0, 7)} colors={[PART.light, PART.base, PART.dark]} />
      </Path>
      <Path path={shine} color="rgba(255, 255, 255, 0.4)" />
    </Group>
  );
}

/** Un todo que no se está cortando: la pizza, el vaso, el camino, las figuras. */
function StaticWholeView({
  geom,
  box,
  glow,
  even,
  matches,
  sig,
  vessel,
  hint,
}: {
  readonly geom: {
    readonly fill: SkPath;
    readonly cuts: SkPath;
    readonly outline: SkPath;
    readonly body: SkPath;
  };
  readonly box: Box;
  readonly glow: boolean;
  readonly even: boolean;
  /** Muestra la misma fracción que la ficha. */
  readonly matches: boolean;
  /** La forma del todo y dónde está: si cambia, es otra ronda y no un evento. */
  readonly sig: string;
  /** Es el vaso: de vidrio, con la parte como líquido. */
  readonly vessel: boolean;
  readonly hint: SharedValue<number>;
}) {
  const fb = useMemo(() => geom.fill.getBounds(), [geom.fill]);

  // Mientras reclama que lo toquen, un halo claro late con la demostración.
  const attn = useDerivedValue(() => (glow ? 0.2 + 0.5 * hint.value : 0), [glow]);

  // El evento de la lámina: el todo que coincide con la ficha se enciende
  // porque el jugador lo eligió. Es el mismo todo de antes, con la misma forma,
  // que pasa a reclamar luz: eso lo distingue de una ronda nueva, que trae
  // otra forma. Se celebra una vez y queda con el borde menta: coincide.
  const burst = useSharedValue(1);
  const won = useSharedValue(0);
  const antes = useRef({ glow, sig });
  useEffect(() => {
    const previo = antes.current;
    antes.current = { glow, sig };
    if (glow && !previo.glow && previo.sig === sig && matches) {
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
      won.value = withTiming(1, { duration: theme.motion.quick });
      // El todo elegido dice la misma fracción que la ficha: vidrio.
      sfx("join");
    }
    if (!glow) won.value = 0;
  }, [glow, sig, matches, burst, won]);
  const halo = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));

  return (
    <Group>
      {vessel ? (
        <>
          <Path path={geom.body} color="rgba(9, 17, 29, 0.55)" />
          <Path path={geom.body}>
            <LinearGradient
              start={vec(box.x, 0)}
              end={vec(box.x + box.w, 0)}
              colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.10)"]}
            />
          </Path>
        </>
      ) : (
        <TileBody path={geom.body} />
      )}
      <Path path={geom.fill}>
        <LinearGradient
          start={vec(0, fb.y)}
          end={vec(0, fb.y + Math.max(1, fb.height))}
          colors={[PART.light, PART.base, PART.dark]}
        />
      </Path>
      <Group opacity={even ? 1 : 0}>
        <Path path={geom.cuts} color={GROOVE} style="stroke" strokeWidth={2.5} strokeCap="round" />
      </Group>
      <Group opacity={even ? 0 : 1}>
        <Path
          path={geom.cuts}
          color="rgba(255, 255, 255, 0.38)"
          style="stroke"
          strokeWidth={1.5}
          strokeCap="round"
        />
      </Group>
      <Path
        path={geom.outline}
        color={vessel ? "rgba(255, 255, 255, 0.32)" : even ? GLASS_LINE : "rgba(255, 255, 255, 0.4)"}
        style="stroke"
        strokeWidth={vessel ? 2 : 1.5}
        strokeCap="round"
        strokeJoin="round"
      />
      <Group opacity={attn}>
        <Path path={geom.body} color="rgba(255, 255, 255, 0.8)" style="stroke" strokeWidth={5}>
          <BlurMask blur={6} style="normal" />
        </Path>
      </Group>
      <Group opacity={won}>
        <Path path={geom.body} color={theme.color.ok} style="stroke" strokeWidth={2.5} strokeJoin="round" />
      </Group>
      <Group opacity={halo}>
        <Path path={geom.body} color={theme.color.ok} style="stroke" strokeWidth={10}>
          <BlurMask blur={8} style="normal" />
        </Path>
      </Group>
      <Sparks box={box} burst={burst} />
    </Group>
  );
}

/** Un plato del reparto: cerámica con su hueco, su borde y su sombra. */
function Plate({ box }: { readonly box: Box }) {
  const g = useMemo(() => {
    const r = Math.min(box.w, box.h) / 2;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const shadow = Skia.Path.Make();
    shadow.addOval(Skia.XYWHRect(cx - r * 0.9, cy + r * 0.7, r * 1.8, r * 0.5));
    const body = Skia.Path.Make();
    body.addCircle(cx, cy, r);
    const well = Skia.Path.Make();
    well.addCircle(cx, cy, r * 0.7);
    return { shadow, body, well, top: cy - r, bottom: cy + r };
  }, [box]);
  return (
    <>
      <Path path={g.shadow} color="rgba(0, 0, 0, 0.35)">
        <BlurMask blur={4} style="normal" />
      </Path>
      <Path path={g.body}>
        <LinearGradient
          start={vec(0, g.top)}
          end={vec(0, g.bottom)}
          colors={[PLATE.light, PLATE.base, PLATE.dark]}
        />
      </Path>
      <Path path={g.well}>
        <LinearGradient start={vec(0, g.top)} end={vec(0, g.bottom)} colors={[PLATE.dark, PLATE.base]} />
      </Path>
      <Path path={g.body} color="rgba(255, 255, 255, 0.22)" style="stroke" strokeWidth={1} />
    </>
  );
}

/**
 * La ficha clavada en la recta. Cae desde arriba con un rebote cada vez que el
 * jugador la clava. En su marca es menta y suelta chispas una vez: es la parte
 * encendida acostada entre el cero y el uno. En otra marca es ámbar, "mirá
 * acá", y no dice nada más. Está montada siempre; sin ficha clavada no se ve.
 */
function Pin({
  x,
  y,
  mark,
  good,
}: {
  readonly x: number;
  readonly y: number;
  readonly mark: number | null;
  readonly good: boolean;
}) {
  const { stem, head } = useMemo(() => {
    const s = Skia.Path.Make();
    s.moveTo(x, y - 26);
    s.lineTo(x, y + 26);
    const h = Skia.Path.Make();
    h.addCircle(x, y - 26, 6.5);
    return { stem: s, head: h };
  }, [x, y]);
  const drop = useSharedValue(0);
  const burst = useSharedValue(1);
  useEffect(() => {
    if (mark === null) return;
    drop.value = 1;
    drop.value = withSpring(0, theme.spring.settle);
    // Se clava: madera. En su marca, además coincide: vidrio.
    sfx("drop", 0, 120);
    if (good) {
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
      sfx("join", 0, 220);
    }
  }, [mark, good, drop, burst]);
  const t = useDerivedValue(() => [{ translateY: -36 * drop.value }]);
  const halo = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  const color = good ? theme.color.ok : theme.color.warn;
  return (
    <Group opacity={mark === null ? 0 : 1}>
      <Group transform={t}>
        <Path path={stem} color={READ_BACK} style="stroke" strokeWidth={5} strokeCap="round" />
        <Path path={stem} color={color} style="stroke" strokeWidth={2.5} strokeCap="round" />
        <Path path={head}>
          <RadialGradient c={vec(x - 2.5, y - 29)} r={10} colors={["#ffffff", color, color]} />
        </Path>
        <Group opacity={halo}>
          <Path path={head} color={theme.color.ok}>
            <BlurMask blur={8} style="normal" />
          </Path>
        </Group>
      </Group>
      <Sparks box={{ x: x - 6, y: y - 32, w: 12, h: 12 }} burst={burst} />
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
  rightOwn,
  split,
  gap,
  slots,
  drawer,
}: {
  readonly index: number;
  readonly strip: { readonly left: SkPath; readonly right: SkPath };
  readonly placed: SharedValue<number>;
  readonly placedRight: SharedValue<number>;
  /** Qué número de fila es contando desde abajo. */
  readonly fromBottom: number;
  /**
   * La habitación derecha se llena por su cuenta. Si no, sigue a la izquierda y
   * las dos tiras llegan juntas: una sola madera, no dos a la vez.
   */
  readonly rightOwn: boolean;
  readonly split: SharedValue<number>;
  readonly gap: number;
  /** Las filas del montón y sus casas: de ahí sale la fila que llega. */
  readonly slots: readonly RowSlot[];
  readonly drawer: readonly Spot[];
}) {
  const o = useDerivedValue(() => Math.max(0, Math.min(1, placed.value - index)));
  // La habitación derecha se llena contra la izquierda, así que su fila se
  // cuenta desde abajo. Cuando las dos comparten el mismo valor el efecto no se
  // nota, porque entonces las dos están llenas o las dos vacías.
  const oR = useDerivedValue(() => Math.max(0, Math.min(1, placedRight.value - fromBottom)));

  const lb = useMemo(() => strip.left.getBounds(), [strip.left]);
  const rb = useMemo(() => strip.right.getBounds(), [strip.right]);
  const lcx = lb.x + lb.width / 2;
  const lcy = lb.y + lb.height / 2;
  const rcx = rb.x + rb.width / 2;
  const rcy = rb.y + rb.height / 2;

  // Lo que la fila recorre al llegar, y su rebote. En reposo, todo en cero.
  const lx = useSharedValue(0);
  const ly = useSharedValue(0);
  const lPop = useSharedValue(0);
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const rPop = useSharedValue(0);
  // El valor anterior vive en un `SharedValue` y no en el `previous` de la
  // reacción: la actividad arma `rows` de nuevo en cada render, así que la
  // reacción se vuelve a registrar justo cuando la fila entra (el soltar
  // cambia el estado), y su primera llamada no trae valor anterior.
  const lastL = useSharedValue(1);
  const lastR = useSharedValue(1);

  /**
   * La fila entra de a poco: la trajo el dedo, o la réplica de una respuesta.
   * Una ronda nueva la pone de golpe y ahí no rebota nada. Si en el montón hay
   * una fila apagándose en este momento, es la que el dedo acaba de soltar:
   * la del piso sale de ahí, de donde quedó el dedo, y no de su casa. Todo en
   * el hilo de la interfaz, leyendo los mismos valores que el gesto.
   */
  const llega = (
    now: number,
    last: SharedValue<number>,
    cx: number,
    cy: number,
    ox: SharedValue<number>,
    oy: SharedValue<number>,
    pop: SharedValue<number>,
    pitch: number,
    loud: boolean,
  ): void => {
    "worklet";
    const prev = last.value;
    last.value = now;
    if (!(prev <= 0.001 && now > 0.001 && now < 0.999)) return;
    pop.value = 1;
    pop.value = withSpring(0, theme.spring.settle);
    // La fila cae en el piso: madera, y cada fila suena un escalón más arriba.
    if (loud) runOnJS(sfx)("drop", pitch, 0);
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const home = drawer[i];
      if (!s || !home) continue;
      const a = s.alive.value;
      if (a > 0.001 && a < 0.999 && Math.hypot(s.dx.value, s.dy.value) > 4) {
        ox.value = home.x + s.dx.value - cx;
        oy.value = home.y + s.dy.value - cy;
        ox.value = withSpring(0, theme.spring.settle);
        oy.value = withSpring(0, theme.spring.settle);
        return;
      }
    }
  };
  useAnimatedReaction(
    () => placed.value - index,
    (now) => llega(now, lastL, lcx, lcy, lx, ly, lPop, fillPitch(index), true),
    [index, lcx, lcy, slots, drawer],
  );
  useAnimatedReaction(
    () => placedRight.value - fromBottom,
    (now) => llega(now, lastR, rcx, rcy, rx, ry, rPop, fillPitch(fromBottom), rightOwn),
    [fromBottom, rcx, rcy, slots, drawer, rightOwn],
  );

  // Crece un cuarto al salir de la mano, del tamaño de la fila levantada, y se
  // asienta con un rebote: así se ve que llegó a un lugar.
  const leftT = useDerivedValue(
    () => [
      { translateX: -split.value * gap + lx.value + lcx },
      { translateY: ly.value + lcy },
      { scale: 1 + 0.25 * lPop.value },
      { translateX: -lcx },
      { translateY: -lcy },
    ],
    [gap, lcx, lcy],
  );
  const rightT = useDerivedValue(
    () => [
      { translateX: split.value * gap + rx.value + rcx },
      { translateY: ry.value + rcy },
      { scale: 1 + 0.25 * rPop.value },
      { translateX: -rcx },
      { translateY: -rcy },
    ],
    [gap, rcx, rcy],
  );
  return (
    <>
      <Group opacity={o} transform={leftT}>
        <TileBody path={strip.left} />
      </Group>
      <Group opacity={oR} transform={rightT}>
        <TileBody path={strip.right} />
      </Group>
    </>
  );
}

/**
 * Una fila suelta. Su dibujo sigue al mismo par de valores que el gesto. Al
 * salir de su casa se levanta —crece un 30 % y su sombra se aleja— y al volver
 * se asienta con un rebote. Se sabe que salió porque el desplazamiento dejó de
 * ser cero: la escena no necesita que la actividad le avise.
 */
function LooseRowView({
  path,
  slot,
  spot,
}: {
  readonly path: SkPath;
  readonly slot: RowSlot;
  readonly spot: Spot;
}) {
  const lift = useSharedValue(0);
  /** Hacia dónde va el levantado ahora: se compara contra esto y no contra la llamada anterior. */
  const goal = useSharedValue(0);
  useAnimatedReaction(
    () => (Math.hypot(slot.dx.value, slot.dy.value) > 3 ? 1 : 0),
    (fuera) => {
      if (goal.value === fuera) return;
      goal.value = fuera;
      lift.value = withSpring(fuera, fuera === 1 ? theme.spring.lift : theme.spring.settle);
      // Se levanta: aire. Al volver no suena nada: lo que no entró no hace ruido.
      if (fuera === 1) runOnJS(sfx)("lift", 0, 0);
    },
  );
  const transform = useDerivedValue(
    () => [
      { translateX: spot.x + slot.dx.value },
      { translateY: spot.y + slot.dy.value },
      { scale: 1 + 0.3 * lift.value },
      { translateX: -spot.x },
      { translateY: -spot.y },
    ],
    [spot],
  );
  const shadowT = useDerivedValue(() => [{ translateY: 3 + 10 * lift.value }]);
  const shadowO = useDerivedValue(() => 0.3 + 0.25 * lift.value);
  return (
    <Group transform={transform} opacity={slot.alive}>
      <Group transform={shadowT} opacity={shadowO}>
        <Path path={path} color="rgba(0, 0, 0, 0.75)">
          <BlurMask blur={6} style="normal" />
        </Path>
      </Group>
      <TileBody path={path} />
    </Group>
  );
}
