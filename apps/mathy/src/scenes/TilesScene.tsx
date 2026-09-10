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
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
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
  const line = unit + 14;
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
    cutAt: config.cut > 1 ? Math.max(1, Math.floor(config.cols / 2)) : 0,
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
  value: number,
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
  addGlyphs(digits, String(value), mx + ux * 2.6, my + uy * 2.6, size);
  return { brace, digits };
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
}: TilesSceneProps) {
  const floor = useMemo(() => buildFloor(config, layout), [config, layout]);
  const frame = useMemo(() => buildFrame(layout), [layout]);
  const merged = config.skin !== "loose_tiles";

  const looseGeom = useMemo(
    () =>
      layout.drawer.map((spot, i) => {
        const row = config.loose[i];
        const cells = row?.cells ?? 0;
        return cellsPath(spot.x - (cells * layout.unit) / 2, spot.y - layout.unit / 2, 0, cells, layout.unit);
      }),
    [layout, config.loose],
  );

  const keyGeom = useMemo(() => {
    const { x, y, w, h } = layout.frame;
    const size = Math.min(layout.unit * 0.7, 22);
    // La normal de cada lado apunta hacia afuera del rectángulo: una llave
    // dibujada por dentro taparía justo las baldosas que está midiendo.
    const top = buildKey({ x, y }, { x: x + w, y }, 10, config.frameCols, size);
    const left = buildKey({ x, y: y + h }, { x, y }, 10, config.frameRows, size);
    // La expresión va debajo del piso y no encima: arriba se la comen las
    // llaves, y con un piso alto se saldría del lienzo.
    const expr = Skia.Path.Make();
    addGlyphs(
      expr,
      `${config.frameRows}×${config.frameCols}`,
      x + w / 2,
      y + h + layout.unit * 1.2,
      size * 1.2,
    );
    return { top, left, expr };
  }, [layout, config.frameRows, config.frameCols]);

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

  const onDemand = config.onDemand;
  const floorO = useDerivedValue(() => (onDemand ? ghost.value : 1));
  const innerO = useDerivedValue(() => (merged ? 0.18 : 0.5) * (0.4 + 0.6 * Math.min(1, placed.value)));
  const framePulse = useDerivedValue(() => 0.4 + 0.6 * hint.value);
  // El contorno solo se afirma cuando el marco quedó cubierto entero.
  const outlineO = useDerivedValue(() => Math.max(0, Math.min(1, placed.value - 0.9)));
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

      {/* Las llaves con numeral y la expresión con la cruz. El cruce es el morph. */}
      {config.keys ? (
        <>
          <Group opacity={keys}>
            <Path path={keyGeom.top.brace} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
            <Path path={keyGeom.top.digits} color={theme.color.ink} />
            <Path path={keyGeom.left.brace} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
            <Path path={keyGeom.left.digits} color={theme.color.ink} />
          </Group>
          <Group opacity={cross}>
            <Path path={keyGeom.expr} color={theme.color.ink} />
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
      {looseGeom.map((path, i) => (
        <LooseRowView key={i} path={path} slot={rows[i] as RowSlot} />
      ))}

      <Group transform={handT} opacity={handO}>
        <Path path={hand.dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
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
  split,
  gap,
  merged,
}: {
  readonly index: number;
  readonly strip: { readonly left: SkPath; readonly right: SkPath };
  readonly placed: SharedValue<number>;
  readonly split: SharedValue<number>;
  readonly gap: number;
  readonly merged: boolean;
}) {
  const o = useDerivedValue(() => Math.max(0, Math.min(1, placed.value - index)));
  const leftT = useDerivedValue(() => [{ translateX: -split.value * gap }]);
  const rightT = useDerivedValue(() => [{ translateX: split.value * gap }]);
  const fill = merged ? "#2b3a4d" : "#33445c";
  return (
    <Group opacity={o}>
      <Group transform={leftT}>
        <Path path={strip.left} color={fill} />
        <Path path={strip.left} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      </Group>
      <Group transform={rightT}>
        <Path path={strip.right} color={fill} />
        <Path path={strip.right} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      </Group>
    </Group>
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
