/**
 * La balanza: el objeto concreto de `alg.eq.one_step`.
 *
 * Es la capa que faltaba. Antes de ver un símbolo el jugador manipula cosas:
 * una caja cerrada con su broche, pesas sueltas, una barra que se inclina. La
 * inclinación no es un adorno; es el invariante `equality_under_identical_actions`
 * rompiéndose a la vista, y por eso reemplaza al cartel de error.
 *
 * Tres reglas gobiernan el archivo, y las tres vienen de medir:
 *
 * 1. Modo retained. El árbol se arma una vez por problema y no cambia durante
 *    la animación: lo que todavía no se ve está montado con opacidad cero,
 *    incluidas las chispas y los halos del jugo.
 * 2. Todas las pesas de un grupo viven en un solo `SkPath`. Un plato con
 *    ochenta y una pesas cuesta lo mismo que uno con cinco, así que el
 *    presupuesto de trescientos elementos animados no se toca: la escena usa
 *    unos setenta, contando los dos platos y las chispas. El volumen también se
 *    le da al grupo y no a cada pesa: un degradado que se repite hilera por
 *    hilera, y un segundo trazo con los brillos de todas.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: cada transformación y cada
 *    opacidad se deriva de los `SharedValue` de progreso que trae el gesto, y
 *    los eventos del jugo se detectan en el hilo de animación.
 *
 * El color tiene tres trabajos acá, y ninguno más: el azul de equipo es la caja
 * (lo que no se conoce), la menta es "los dos platos pesan lo mismo" y el ámbar
 * es "mirá, está inclinada". La balanza es de acero neutro para que esos tres
 * se lean solos; el tono del área no entra al lienzo.
 */

import { useEffect, useMemo, type ReactNode } from "react";
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
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import type { BinOp } from "@mathy/math-core";
import { play } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

export type BalanceStyle = "concrete" | "visual";

// --- Materiales --------------------------------------------------------------

/**
 * Una paleta de volumen: la luz arriba a la izquierda, el cuerpo y la sombra.
 * Es la misma forma que usan los objetos del nodo 1.
 */
export interface VolumeLook {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
}

/**
 * Las pesas. Son neutras, como las fichas de las bandejas: una pesa no es de
 * ningún equipo, es una unidad de masa, y el color con trabajo queda libre para
 * la caja y para la barra. Es peltre claro y no el azul oscuro de las fichas
 * porque sobre el paisaje una pesa oscura se perdía.
 *
 * `BalanceEqGame` y `SystemsGame` dibujan sus propias pesas y frutas encima de
 * los platos: tienen que usar esto (o `WeightBodies`) para que sean las mismas.
 */
export const WEIGHT_LOOK: VolumeLook = { light: "#f4f8fc", base: "#aab8ca", dark: "#56657b" };

/** El acero de la barra, el fiel, los platos y el pie: neutro, para no significar nada. */
export const STEEL_LOOK: VolumeLook = { light: "#e4ebf3", base: "#8d9db2", dark: "#3b475a" };

/** La caja cerrada: el azul de equipo de lo que no se conoce, en todo el juego. */
export const BOX_LOOK: VolumeLook = { light: "#bfe5ff", base: theme.color.accent, dark: "#1d64a8" };

/** Lo que la caja muestra al abrirse: coincide con lo que la balanza midió. */
export const REVEAL_LOOK: VolumeLook = { light: "#cbf9e7", base: theme.color.ok, dark: "#138a62" };

/** El brillo de una pesa y el borde oscuro que separa dos pesas que se tocan. */
export const WEIGHT_SHINE = "rgba(255, 255, 255, 0.55)";
export const WEIGHT_RIM = "rgba(9, 17, 29, 0.5)";

/**
 * Agrega el brillo de un objeto de caja `(x, y, w, h)` a un trazo de brillos.
 * Es para quien arma sus pesas en un solo `SkPath` y quiere que brillen igual
 * que las de la balanza: se llama en el mismo recorrido que arma los cuerpos.
 */
export function addShine(target: SkPath, x: number, y: number, w: number, h: number): void {
  if (w < 4 || h < 3) return;
  target.addOval(Skia.XYWHRect(x + w * 0.16, y + h * 0.12, w * 0.34, Math.max(1.2, h * 0.22)));
}

/**
 * Un grupo de pesas con volumen: un solo degradado para todo el trazo, un borde
 * oscuro fino y los brillos. Cuesta tres dibujos, sean dos pesas u ochenta.
 *
 * `band` hace que el degradado se repita cada `h` píxeles a partir de `y0`: con
 * las pesas apiladas en hileras, cada hilera recibe su propia luz arriba y su
 * sombra abajo, como si cada pesa tuviera la suya. Sin `band`, el degradado va
 * de arriba abajo de lo que el trazo ocupa, que es lo justo para una sola fila.
 * `hollow` dibuja el hueco de una pesa que falta (el lado que resta).
 */
export function WeightBodies({
  path,
  shine,
  look = WEIGHT_LOOK,
  band,
  hollow = false,
}: {
  readonly path: SkPath;
  readonly shine?: SkPath;
  readonly look?: VolumeLook;
  readonly band?: { readonly y0: number; readonly h: number };
  readonly hollow?: boolean;
}) {
  const b = useMemo(() => path.getBounds(), [path]);
  if (hollow) {
    return (
      <Group>
        <Path path={path} color="rgba(9, 17, 29, 0.55)" />
        <Path path={path} color={look.base} style="stroke" strokeWidth={2} />
      </Group>
    );
  }
  const y0 = band ? band.y0 : b.y;
  const h = band ? Math.max(1, band.h) : Math.max(1, b.height);
  // Con hileras de un píxel el borde oscuro las taparía enteras: la columna
  // aplanada de `visual` con muchas pesas se lee como un bloque, sin bordes.
  const conBorde = h >= 6;
  return (
    <Group>
      <Path path={path}>
        <LinearGradient
          start={vec(0, y0)}
          end={vec(0, y0 + h)}
          colors={[look.light, look.base, look.dark]}
          mode={band ? "repeat" : "clamp"}
        />
      </Path>
      <Path path={path} color={WEIGHT_RIM} style="stroke" strokeWidth={conBorde ? 1 : 0} opacity={conBorde ? 1 : 0} />
      {shine ? <Path path={shine} color={WEIGHT_SHINE} /> : null}
    </Group>
  );
}

// --- El problema -------------------------------------------------------------

/**
 * Lo que la escena lee del problema. Es una forma y no el tipo de un nodo:
 * `Problem` del nodo 13 la cumple sin tocar nada, y cualquier otro nodo que
 * reuse la balanza arma un objeto con estos dos campos.
 */
export interface BalanceProblem {
  /** Lo que hay adentro de la caja. Es lo que se ve al abrirla, y nada más. */
  readonly solution: number;
  /**
   * La operación que acompaña a la incógnita: la cerradura. Un nodo donde la
   * balanza mide en vez de afirmar no tiene ninguna, y entonces tampoco hay
   * broche que dibujar.
   */
  readonly lock?: { readonly op: BinOp; readonly value: number };
}

/** Cuánto se inclina la barra cuando la acción tocó un solo plato. */
export const MAX_TILT = 0.16;
/** Cuánto suben las pesas que la llave se lleva. */
const LIFT = 52;
/** Cuánto duran las chispas del evento: se abren y se apagan, una vez. */
const BURST_MS = 720;
/** A qué apertura la caja suelta sus chispas: con la tapa arriba y lo de adentro a la vista. */
const OPEN_AT = 0.75;

export interface BalanceLayout {
  readonly cx: number;
  readonly beamY: number;
  readonly span: number;
  readonly hang: number;
  readonly panW: number;
  readonly contentH: number;
}

export function balanceLayout(width: number, height: number): BalanceLayout {
  const cx = width / 2;
  const beamY = Math.max(18, height * 0.13);
  const span = Math.max(60, Math.min(width * 0.3, 150));
  const hang = height * 0.56;
  const panW = Math.min(span * 1.5, 176);
  return { cx, beamY, span, hang, panW, contentH: Math.max(40, hang - 34) };
}

/**
 * Dónde caen los platos dentro de la escena. El gesto lo necesita para saber
 * por cuántos platos pasó la llave, que es la pregunta que decide todo.
 */
export interface PanZones {
  readonly leftX: number;
  readonly rightX: number;
  readonly y: number;
  readonly radius: number;
}

export function panZones(width: number, height: number): PanZones {
  const l = balanceLayout(width, height);
  return {
    leftX: l.cx - l.span,
    rightX: l.cx + l.span,
    y: l.beamY + l.hang - 26,
    radius: Math.max(l.panW * 0.62, 68),
  };
}

/**
 * Cuánto ocupa el cajón dentro de un plato que no lleva pesas sueltas.
 *
 * Lo necesita un nodo que dibuje sus propios objetos encima del plato: sin esto
 * tendría que copiar los números de `buildPan` y quedarían dos fuentes para la
 * misma medida. `yBase` es el piso del plato, con el eje del grupo del plato
 * como origen.
 */
export function boxFootprint(
  l: BalanceLayout,
  style: BalanceStyle,
): { readonly w: number; readonly h: number; readonly yBase: number } {
  const flat = style === "visual";
  const region = flat ? l.panW * 0.72 : l.panW;
  const w = flat ? region : Math.min(34, region - 2);
  return { w, h: flat ? 16 : w, yBase: l.hang - 4 };
}

// --- Contenido de cada plato -------------------------------------------------

/** Lo que hay en un plato: cajas (la incógnita, quizá partida) y pesas sueltas. */
export interface PanContent {
  readonly boxes: number;
  readonly units: number;
}

/**
 * Los dos platos antes y después de la acción. El nodo 13 los deriva de su
 * ecuación; un nodo donde la balanza mide y no afirma no tiene ninguna acción
 * que aplicar y los pasa armados, con el antes igual al después.
 */
export interface BalanceContents {
  readonly leftBefore: PanContent;
  readonly rightBefore: PanContent;
  readonly leftAfter: PanContent;
  readonly rightAfter: PanContent;
  /** Signo del cambio de masa: dice para qué lado cae la barra. */
  readonly deltaSign: number;
}

function contentsOf(problem: BalanceProblem, unknownLeft: boolean): BalanceContents {
  // Sin cerradura no hay nada que aplicar: los platos los arma el nodo y esta
  // derivación no corre. El valor neutro está para que el tipo cierre.
  const { op, value: a } = problem.lock ?? { op: "+" as BinOp, value: 0 };
  const s = problem.solution;
  const rhs = op === "+" ? s + a : op === "-" ? s - a : op === "*" ? s * a : s / a;

  const boxPanBefore: PanContent =
    op === "+" ? { boxes: 1, units: a }
    : op === "-" ? { boxes: 1, units: -a }
    : op === "*" ? { boxes: a, units: 0 }
    : { boxes: 1 / a, units: 0 };
  const numPanBefore: PanContent = { boxes: 0, units: rhs };
  const boxPanAfter: PanContent = { boxes: 1, units: 0 };
  const numPanAfter: PanContent = { boxes: 0, units: s };

  // Las dos masas cambian igual, así que alcanza con una para saber el signo.
  const massBefore = boxPanBefore.boxes * s + boxPanBefore.units;
  const massAfter = boxPanAfter.boxes * s + boxPanAfter.units;
  const deltaSign = Math.sign(massAfter - massBefore);

  return unknownLeft
    ? { leftBefore: boxPanBefore, rightBefore: numPanBefore, leftAfter: boxPanAfter, rightAfter: numPanAfter, deltaSign }
    : { leftBefore: numPanBefore, rightBefore: boxPanBefore, leftAfter: numPanAfter, rightAfter: boxPanAfter, deltaSign };
}

// --- Geometría ---------------------------------------------------------------

interface UnitGroup {
  readonly path: SkPath;
  readonly shine: SkPath;
  readonly hollow: boolean;
  /** El período del degradado: una hilera de pesas. */
  readonly band: { readonly y0: number; readonly h: number };
}

interface PanGeom {
  readonly cords: SkPath;
  readonly hook: SkPath;
  readonly plate: SkPath;
  readonly rim: SkPath;
  readonly stay: UnitGroup;
  readonly leave: UnitGroup;
  readonly enter: UnitGroup;
  readonly boxStay: SkPath;
  readonly boxLeave: SkPath;
  readonly boxEnter: SkPath;
  readonly boxShineStay: SkPath;
  readonly boxShineLeave: SkPath;
  readonly boxShineEnter: SkPath;
  /** De dónde a dónde va la luz de la caja: su tapa y su piso. */
  readonly boxTop: number;
  readonly boxBottom: number;
  readonly lid: SkPath;
  readonly lidOrigin: { readonly x: number; readonly y: number };
  readonly reveal: UnitGroup;
  /** Dónde se abre la caja: ahí salen las chispas y el halo. */
  readonly revealAt: { readonly x: number; readonly y: number };
  readonly revealHalo: SkPath;
  readonly hasBox: boolean;
  readonly brooch: SkPath;
}

/** Cómo se colocan las pesas de un plato, y el período de su luz. */
interface Placer {
  readonly place: (path: SkPath, shine: SkPath, i: number) => void;
  readonly band: { readonly y0: number; readonly h: number };
}

/** Coloca las pesas de un plato. Una sola función para los dos estilos. */
function unitPlacer(
  n: number,
  cxRegion: number,
  regionW: number,
  yBase: number,
  maxH: number,
  style: BalanceStyle,
): Placer {
  if (style === "visual") {
    // Sin piso: con muchas pesas la columna se comprime hasta ser un bloque de
    // altura proporcional, que es justo lo que la capa `visual` quiere mostrar.
    const rowH = Math.min(13, maxH / Math.max(n, 1));
    const bw = regionW * 0.72;
    const bh = Math.max(0.7, rowH * 0.64);
    return {
      place: (path, shine, i) => {
        const y = yBase - (i + 1) * rowH + (rowH - bh) / 2;
        path.addRRect(Skia.RRectXY(Skia.XYWHRect(cxRegion - bw / 2, y, bw, bh), Math.min(3, bh / 2), Math.min(3, bh / 2)));
        // El brillo de una barra es una franja arriba; con barras de dos
        // píxeles no hay dónde ponerlo, y el bloque se lee por el degradado.
        if (bh >= 5) {
          shine.addRRect(
            Skia.RRectXY(Skia.XYWHRect(cxRegion - bw / 2 + 3, y + 1, bw * 0.55, Math.max(1, bh * 0.22)), 1, 1),
          );
        }
      },
      band: { y0: yBase - rowH, h: rowH },
    };
  }
  let cell = 22;
  let cols = Math.max(1, Math.floor(regionW / cell));
  while (cell > 6 && Math.ceil(n / cols) * cell > maxH) {
    cell -= 1;
    cols = Math.max(1, Math.floor(regionW / cell));
  }
  cols = Math.max(1, Math.min(cols, Math.max(n, 1)));
  const usedW = cols * cell;
  const r = cell * 0.36;
  return {
    place: (path, shine, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = cxRegion - usedW / 2 + (col + 0.5) * cell;
      const y = yBase - (row + 0.5) * cell;
      path.addCircle(x, y, r);
      if (r >= 3.5) shine.addOval(Skia.XYWHRect(x - r * 0.6, y - r * 0.64, r * 0.62, r * 0.4));
    },
    // Una hilera por celda, con el borde de la celda como fase: cada pesa
    // recibe la luz arriba y la sombra abajo, aunque sean todas un solo trazo.
    band: { y0: yBase - cell, h: cell },
  };
}

/** El broche: la operación que acompaña a la incógnita, dibujada, no escrita. */
function broochPath(op: BinOp, cx: number, cy: number, s: number): SkPath {
  const p = Skia.Path.Make();
  const h = s / 2;
  if (op === "+" || op === "*") {
    if (op === "+") {
      p.moveTo(cx - h, cy);
      p.lineTo(cx + h, cy);
      p.moveTo(cx, cy - h);
      p.lineTo(cx, cy + h);
    } else {
      p.moveTo(cx - h, cy - h);
      p.lineTo(cx + h, cy + h);
      p.moveTo(cx + h, cy - h);
      p.lineTo(cx - h, cy + h);
    }
  } else if (op === "-") {
    p.moveTo(cx - h, cy);
    p.lineTo(cx + h, cy);
  } else {
    p.moveTo(cx - h, cy);
    p.lineTo(cx + h, cy);
    p.addCircle(cx, cy - h * 0.7, 1.6);
    p.addCircle(cx, cy + h * 0.7, 1.6);
  }
  return p;
}

/** El brillo de un pedazo de caja: una franja clara bajo la tapa. */
function boxShine(target: SkPath, x: number, y: number, w: number, h: number): void {
  if (w < 6 || h < 6) return;
  target.addRRect(Skia.RRectXY(Skia.XYWHRect(x + 3, y + 2.5, Math.max(1, w * 0.5), Math.min(3, h * 0.16)), 1.5, 1.5));
}

function buildPan(
  before: PanContent,
  after: PanContent,
  solution: number,
  lockOp: BinOp,
  style: BalanceStyle,
  l: BalanceLayout,
): PanGeom {
  const pw = l.panW;

  // Tres cuerdas que se abren desde el gancho hasta el borde del plato: con
  // una sola cuerda al centro, la cuerda cruzaba la caja por la mitad.
  const cords = Skia.Path.Make();
  for (const k of [-0.46, 0.46]) {
    cords.moveTo(0, 0);
    cords.lineTo(pw * k, l.hang - 1);
  }
  const hook = Skia.Path.Make();
  hook.addCircle(0, 0, 3.6);

  // El plato es un cuenco de acero visto de costado: el borde recto arriba,
  // donde se apoya todo, y la panza curva abajo.
  const plate = Skia.Path.Make();
  plate.moveTo(-pw / 2, l.hang);
  plate.lineTo(pw / 2, l.hang);
  plate.cubicTo(pw * 0.42, l.hang + 13, -pw * 0.42, l.hang + 13, -pw / 2, l.hang);
  plate.close();
  const rim = Skia.Path.Make();
  rim.addRRect(Skia.RRectXY(Skia.XYWHRect(-pw / 2 - 1, l.hang - 2, pw + 2, 4), 2, 2));

  const yBase = l.hang - 4;
  const hasBox = before.boxes > 0 || after.boxes > 0;
  const nb = Math.round(Math.abs(before.units));
  const na = Math.round(Math.abs(after.units));
  const hasUnits = nb > 0 || na > 0;

  // En `concrete` la caja y las pesas se reparten el plato; en `visual` todo es
  // una columna y la caja es la barra de abajo.
  const flat = style === "visual";
  // Entre la caja y las pesas queda un hueco: ahí va el broche, y sin ese hueco
  // la primera pesa se le monta encima.
  const boxRegionW = flat ? pw * 0.72 : hasUnits ? pw * 0.4 : pw;
  const boxCx = flat || !hasUnits ? 0 : -pw / 2 + boxRegionW / 2;
  const unitRegionW = flat ? pw : hasBox ? pw * 0.46 : pw;
  const unitCx = flat || !hasBox ? 0 : pw / 2 - unitRegionW / 2;

  const boxW = flat ? boxRegionW : Math.min(34, boxRegionW - 2);
  const boxH = flat ? 16 : boxW;
  const boxTop = yBase - boxH;

  const boxStay = Skia.Path.Make();
  const boxLeave = Skia.Path.Make();
  const boxEnter = Skia.Path.Make();
  const boxShineStay = Skia.Path.Make();
  const boxShineLeave = Skia.Path.Make();
  const boxShineEnter = Skia.Path.Make();
  const lid = Skia.Path.Make();
  const reveal = Skia.Path.Make();
  const revealShine = Skia.Path.Make();
  let revealBand = { y0: 0, h: 1 };
  let lidOrigin = { x: 0, y: 0 };

  if (hasBox) {
    if (before.boxes >= 1) {
      const k = Math.max(1, Math.round(before.boxes));
      const w = Math.min(boxW, (boxRegionW - (k - 1) * 3) / k);
      const total = k * w + (k - 1) * 3;
      for (let i = 0; i < k; i++) {
        const x = boxCx - total / 2 + i * (w + 3);
        const target = i === 0 ? boxStay : boxLeave;
        target.addRRect(Skia.RRectXY(Skia.XYWHRect(x, yBase - boxH, w, boxH), 3, 3));
        boxShine(i === 0 ? boxShineStay : boxShineLeave, x, yBase - boxH, w, boxH);
      }
      const x0 = boxCx - total / 2;
      lid.addRRect(Skia.RRectXY(Skia.XYWHRect(x0 - 1, boxTop - 5, w + 2, 5), 2, 2));
      lidOrigin = { x: x0, y: boxTop - 5 };
    } else {
      // La caja partida: `x/3` es un tercio de caja, y la llave devuelve el resto.
      const d = Math.max(2, Math.round(1 / before.boxes));
      const w = boxW / d;
      const x0 = boxCx - boxW / 2;
      for (let i = 0; i < d; i++) {
        const target = i === 0 ? boxStay : boxEnter;
        target.addRect(Skia.XYWHRect(x0 + i * w, yBase - boxH, w, boxH));
        boxShine(i === 0 ? boxShineStay : boxShineEnter, x0 + i * w, yBase - boxH, w, boxH);
      }
      lid.addRRect(Skia.RRectXY(Skia.XYWHRect(x0 - 1, boxTop - 5, w + 2, 5), 2, 2));
      lidOrigin = { x: x0, y: boxTop - 5 };
    }
    // Lo que la caja muestra al abrirse: la solución, en pesas, sin escribir nada.
    const rn = Math.round(Math.abs(solution));
    const placer = unitPlacer(rn, boxCx, Math.max(boxW * 1.8, 40), boxTop - 12, 64, "concrete");
    for (let i = 0; i < rn; i++) placer.place(reveal, revealShine, i);
    revealBand = placer.band;
  }

  const unitsBase = flat && hasBox ? boxTop - 4 : yBase;
  const sameSign =
    before.units === 0 || after.units === 0 || Math.sign(before.units) === Math.sign(after.units);
  const stayCount = sameSign ? Math.min(nb, na) : 0;
  // La caja de la columna aplanada come altura: sin descontarla, las pesas
  // trepan por encima de la barra.
  const unitsMaxH = flat && hasBox ? Math.max(24, l.contentH - boxH) : l.contentH;
  const placer = unitPlacer(Math.max(nb, na), unitCx, unitRegionW, unitsBase, unitsMaxH, style);

  const stayPath = Skia.Path.Make();
  const leavePath = Skia.Path.Make();
  const enterPath = Skia.Path.Make();
  const stayShine = Skia.Path.Make();
  const leaveShine = Skia.Path.Make();
  const enterShine = Skia.Path.Make();
  for (let i = 0; i < stayCount; i++) placer.place(stayPath, stayShine, i);
  for (let i = stayCount; i < nb; i++) placer.place(leavePath, leaveShine, i);
  for (let i = stayCount; i < na; i++) placer.place(enterPath, enterShine, i);

  const brooch =
    hasBox && hasUnits
      ? broochPath(
          lockOp,
          (boxCx + boxRegionW / 2 + unitCx - unitRegionW / 2) / 2,
          yBase - boxH / 2,
          12,
        )
      : hasBox
        ? broochPath(lockOp, boxCx, boxTop - (flat ? 12 : 14), 12)
        : Skia.Path.Make();

  // El halo de la caja que se abre cubre lo que mostró: si no mostró nada
  // (una caja que valía cero), cubre la tapa.
  const rb = reveal.getBounds();
  const revealAt =
    rb.width > 0 ? { x: rb.x + rb.width / 2, y: rb.y + rb.height / 2 } : { x: boxCx, y: boxTop - 8 };
  const revealHalo = Skia.Path.Make();
  revealHalo.addCircle(revealAt.x, revealAt.y, Math.max(18, Math.max(rb.width, rb.height) * 0.62));

  return {
    cords,
    hook,
    plate,
    rim,
    stay: { path: stayPath, shine: stayShine, hollow: before.units < 0, band: placer.band },
    leave: { path: leavePath, shine: leaveShine, hollow: before.units < 0, band: placer.band },
    enter: { path: enterPath, shine: enterShine, hollow: after.units < 0, band: placer.band },
    boxStay,
    boxLeave,
    boxEnter,
    boxShineStay,
    boxShineLeave,
    boxShineEnter,
    boxTop: boxTop - 5,
    boxBottom: yBase,
    lid,
    lidOrigin,
    reveal: { path: reveal, shine: revealShine, hollow: false, band: revealBand },
    revealAt,
    revealHalo,
    hasBox,
    brooch,
  };
}

/** El pie de la balanza: el poste, la base y la sombra en el piso. */
function standParts(l: BalanceLayout): { post: SkPath; foot: SkPath; neck: SkPath; shadow: SkPath; baseY: number } {
  const baseY = l.beamY + l.hang + 42;
  const post = Skia.Path.Make();
  post.addRRect(Skia.RRectXY(Skia.XYWHRect(l.cx - 3.5, l.beamY, 7, baseY - l.beamY - 6), 3, 3));
  const neck = Skia.Path.Make();
  neck.addRRect(Skia.RRectXY(Skia.XYWHRect(l.cx - 13, baseY - 10, 26, 7), 3, 3));
  const foot = Skia.Path.Make();
  foot.addRRect(Skia.RRectXY(Skia.XYWHRect(l.cx - 36, baseY - 4, 72, 8), 4, 4));
  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(l.cx - 48, baseY + 1, 96, 10));
  return { post, foot, neck, shadow, baseY };
}

// --- Componente --------------------------------------------------------------

export interface BalanceSceneProps {
  readonly problem: BalanceProblem;
  /** La caja está en el plato izquierdo salvo en los niveles con incógnita a la derecha. */
  readonly unknownLeft: boolean;
  readonly style: BalanceStyle;
  readonly width: number;
  readonly height: number;
  /** Cuánto se aplicó la acción de la llave en cada plato, de 0 a 1. */
  readonly left: SharedValue<number>;
  readonly right: SharedValue<number>;
  /** Opacidad de toda la balanza: en el nivel 5 se pide con un toque. */
  readonly appear: SharedValue<number>;
  /**
   * Los platos armados a mano. Sin esto la escena los deriva de la ecuación,
   * que es lo que hace el nodo 13; un nodo donde la balanza es un instrumento
   * de medición y no una afirmación no tiene ecuación de dónde derivarlos.
   */
  readonly contents?: BalanceContents;
  /**
   * La inclinación en radianes, cuando no sale de la acción de la llave. Es lo
   * que necesita una balanza que responde a lo que hay en los platos y no a un
   * paso que se aplica: la barra tiene que moverse mientras el jugador carga.
   */
  readonly tilt?: SharedValue<number>;
  /** La apertura de la caja, cuando no sale de haber pasado por los dos platos. */
  readonly openness?: SharedValue<number>;
  /**
   * El broche con la operación. Una balanza que mide no lleva ningún signo
   * entre las columnas, porque mide y no afirma.
   */
  readonly brooch?: boolean;
  /**
   * Lo que el nodo dibuja adentro de cada plato. Cuelga del grupo del plato, así
   * que se inclina con la barra sin que el llamador tenga que repetir la
   * trigonometría. Es la salida para un nodo cuyos objetos no son ni cajas ni
   * pesas contables —figuras que se giran o se pintan— y para el que necesita
   * que cada pesa sea un blanco propio en vez de un montón en un solo trazo.
   */
  readonly overlayLeft?: ReactNode;
  readonly overlayRight?: ReactNode;
  /**
   * Lo que hay en los platos, dicho como firma, cuando lo dibuja el nodo con
   * `overlayLeft`/`overlayRight` y no viaja en `contents`. Es lo que le permite
   * a la escena saber que alguien cargó o sacó algo y celebrar la barra que
   * vuelve a quedar derecha: sin esto, los platos parecen no cambiar nunca.
   */
  readonly loads?: string;
}

/** Las seis direcciones de las chispas, corridas para que ninguna salga vertical. */
const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

export function BalanceScene({
  problem,
  unknownLeft,
  style,
  width,
  height,
  left,
  right,
  appear,
  contents,
  tilt: tiltIn,
  openness: opennessIn,
  brooch = true,
  overlayLeft,
  overlayRight,
  loads = "",
}: BalanceSceneProps) {
  const l = useMemo(() => balanceLayout(width, height), [width, height]);
  const c = useMemo(
    () => contents ?? contentsOf(problem, unknownLeft),
    [contents, problem, unknownLeft],
  );

  const leftPan = useMemo(
    () => buildPan(c.leftBefore, c.leftAfter, problem.solution, problem.lock?.op ?? "+", style, l),
    [c, problem, style, l],
  );
  const rightPan = useMemo(
    () => buildPan(c.rightBefore, c.rightAfter, problem.solution, problem.lock?.op ?? "+", style, l),
    [c, problem, style, l],
  );

  const stand = useMemo(() => standParts(l), [l]);

  const beam = useMemo(() => {
    const body = Skia.Path.Make();
    body.addRRect(Skia.RRectXY(Skia.XYWHRect(l.cx - l.span - 7, l.beamY - 4, l.span * 2 + 14, 8), 4, 4));
    // La veta de color: lo único de la barra que no es acero, porque es lo que
    // dice si los dos platos pesan lo mismo.
    const inlay = Skia.Path.Make();
    inlay.moveTo(l.cx - l.span + 6, l.beamY);
    inlay.lineTo(l.cx + l.span - 6, l.beamY);
    const shine = Skia.Path.Make();
    shine.addRRect(Skia.RRectXY(Skia.XYWHRect(l.cx - l.span - 3, l.beamY - 3, l.span * 1.1, 1.6), 0.8, 0.8));
    const pivot = Skia.Path.Make();
    pivot.addCircle(l.cx, l.beamY, 7);
    const axle = Skia.Path.Make();
    axle.addCircle(l.cx, l.beamY, 2.2);
    return { body, inlay, shine, pivot, axle };
  }, [l]);

  const sign = c.deltaSign;
  const tiltPropio = useDerivedValue(() => -(left.value - right.value) * sign * MAX_TILT, [sign]);
  const opennessPropia = useDerivedValue(() => Math.min(left.value, right.value));
  const tilt = tiltIn ?? tiltPropio;
  const openness = opennessIn ?? opennessPropia;

  /**
   * Cuántas veces cambió lo que hay en los platos. La barra que vuelve a quedar
   * derecha solo se celebra si en el medio alguien cargó o sacó algo: la que
   * vuelve sola después de mostrar un error (el nodo 14 hunde la barra y la
   * devuelve) no ganó nada, y la que el dedo acerca y aleja de un plato
   * tampoco. Viaja por firma y no por identidad, para que un render que arma
   * los mismos platos de nuevo no cuente como un cambio.
   */
  const firma =
    [c.leftBefore, c.rightBefore, c.leftAfter, c.rightAfter].map((p) => `${p.boxes}:${p.units}`).join("|") +
    `#${loads}`;
  const version = useSharedValue(0);
  useEffect(() => {
    version.value = version.value + 1;
  }, [firma, version]);

  /**
   * La barra que se ve. Sigue a la inclinación con un resorte, así que llega a
   * su ángulo y se asienta con un rebote, como una balanza de verdad. El ángulo
   * final y el momento en que se inclina son los de la acción: el resorte solo
   * pone el asentamiento. Un salto grande de un cuadro al otro es un cambio de
   * ronda, y ese no se anima: una balanza que viaja entre dos problemas
   * distintos contaría algo que no pasó.
   */
  const shown = useSharedValue(0);
  const armada = useSharedValue(0);
  const armadaEn = useSharedValue(0);
  /** El halo de la barra que se niveló, de 0 a 1; 1 es "ya pasó". */
  const nivelada = useSharedValue(1);
  /** Las chispas del fiel. Van aparte porque a veces la caja las da en su lugar. */
  const chispasFiel = useSharedValue(1);
  useAnimatedReaction(
    () => tilt.value,
    (cur, prev) => {
      if (prev === null) {
        shown.value = cur;
        return;
      }
      const inclinada = Math.abs(cur) > MAX_TILT * 0.2;
      if (Math.abs(cur - prev) > MAX_TILT * 0.45) {
        shown.value = cur;
        armada.value = inclinada ? 1 : 0;
        armadaEn.value = version.value;
        return;
      }
      shown.value = withSpring(cur, theme.spring.settle);
      if (inclinada) {
        if (armada.value === 0) {
          armada.value = 1;
          armadaEn.value = version.value;
        }
        return;
      }
      if (armada.value === 1 && Math.abs(cur) < MAX_TILT * 0.03) {
        armada.value = 0;
        if (version.value === armadaEn.value) return;
        nivelada.value = 0;
        nivelada.value = withTiming(1, { duration: BURST_MS });
        // El golpe grave de algo pesado que se asienta: la barra quedó derecha.
        runOnJS(play)("settle");
        // Si en el mismo momento se abre la caja, las chispas las da la caja:
        // dos estallidos a la vez dirían dos cosas, y es una sola.
        if (openness.value < 0.5) {
          chispasFiel.value = 0;
          chispasFiel.value = withTiming(1, { duration: BURST_MS });
        }
      }
    },
  );

  const beamT = useDerivedValue(() => [{ rotate: shown.value }]);
  // El color va con la inclinación de verdad y no con la que se ve: con el
  // panel del navegador oculto la animación se congela, y una barra que dejó
  // de estar derecha tiene que decirlo igual.
  const levelO = useDerivedValue(() => 1 - Math.min(1, Math.abs(tilt.value) / MAX_TILT));
  const tiltedO = useDerivedValue(() => Math.min(1, Math.abs(tilt.value) / MAX_TILT));
  const tiltGlowO = useDerivedValue(() => 0.45 * Math.min(1, Math.abs(tilt.value) / MAX_TILT));
  const niveladaO = useDerivedValue(() => (nivelada.value < 1 ? 0.2 + 0.8 * (1 - nivelada.value) : 0));

  const leftT = useDerivedValue(() => [
    { translateX: l.cx - l.span * Math.cos(shown.value) },
    { translateY: l.beamY - l.span * Math.sin(shown.value) },
  ]);
  const rightT = useDerivedValue(() => [
    { translateX: l.cx + l.span * Math.cos(shown.value) },
    { translateY: l.beamY + l.span * Math.sin(shown.value) },
  ]);

  const steel = [STEEL_LOOK.light, STEEL_LOOK.base, STEEL_LOOK.dark];

  return (
    <Group opacity={appear}>
      {/* El pie: sombra en el piso, poste y base de acero. */}
      <Path path={stand.shadow} color="rgba(0, 0, 0, 0.4)">
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={stand.post}>
        <LinearGradient
          start={vec(l.cx - 3.5, 0)}
          end={vec(l.cx + 3.5, 0)}
          colors={[STEEL_LOOK.base, STEEL_LOOK.light, STEEL_LOOK.dark]}
          positions={[0, 0.3, 1]}
        />
      </Path>
      <Path path={stand.neck}>
        <LinearGradient start={vec(0, stand.baseY - 10)} end={vec(0, stand.baseY - 3)} colors={steel} />
      </Path>
      <Path path={stand.foot}>
        <LinearGradient start={vec(0, stand.baseY - 4)} end={vec(0, stand.baseY + 4)} colors={steel} />
      </Path>

      <Group origin={{ x: l.cx, y: l.beamY }} transform={beamT}>
        {/* Inclinada, la barra brilla en ámbar: mirá acá. */}
        <Group opacity={tiltGlowO}>
          <Path path={beam.inlay} color={theme.color.warn} style="stroke" strokeWidth={12} strokeCap="round">
            <BlurMask blur={7} style="normal" />
          </Path>
        </Group>
        {/* Nivelada después de cargar o sacar: un halo menta, una vez. */}
        <Group opacity={niveladaO}>
          <Path path={beam.inlay} color={theme.color.ok} style="stroke" strokeWidth={16} strokeCap="round">
            <BlurMask blur={9} style="normal" />
          </Path>
        </Group>
        <Path path={beam.body}>
          <LinearGradient start={vec(0, l.beamY - 4)} end={vec(0, l.beamY + 4)} colors={steel} />
        </Path>
        <Path path={beam.shine} color="rgba(255, 255, 255, 0.55)" />
        <Path path={beam.inlay} color={theme.color.ok} style="stroke" strokeWidth={3} strokeCap="round" opacity={levelO} />
        <Path path={beam.inlay} color={theme.color.warn} style="stroke" strokeWidth={3} strokeCap="round" opacity={tiltedO} />
      </Group>
      <Path path={beam.pivot}>
        <RadialGradient c={vec(l.cx - 2.5, l.beamY - 3)} r={10} colors={steel} />
      </Path>
      <Path path={beam.axle} color={STEEL_LOOK.dark} />
      <EventSparks x={l.cx} y={l.beamY} burst={chispasFiel} />

      <Group transform={leftT}>
        <Pan geom={leftPan} t={left} openness={openness} brooch={brooch} />
        {overlayLeft}
      </Group>
      <Group transform={rightT}>
        <Pan geom={rightPan} t={right} openness={openness} brooch={brooch} />
        {overlayRight}
      </Group>
    </Group>
  );
}

/**
 * Un plato. Todo lo que se mueve acá deriva de `t`, el progreso de la acción de
 * la llave en este plato, y de `openness`, que solo llega a uno cuando la
 * acción pasó por los dos.
 */
function Pan({
  geom,
  t,
  openness,
  brooch,
}: {
  readonly geom: PanGeom;
  readonly t: SharedValue<number>;
  readonly openness: SharedValue<number>;
  readonly brooch: boolean;
}) {
  const leaveT = useDerivedValue(() => [{ translateY: -LIFT * t.value }]);
  const leaveO = useDerivedValue(() => 1 - t.value);
  const enterT = useDerivedValue(() => [{ translateY: -LIFT * (1 - t.value) }]);
  const enterO = useDerivedValue(() => t.value);
  // La caja partida muestra en fantasma lo que le falta: sin eso, un quinto de
  // caja parece una caja chica en vez de un pedazo.
  const boxEnterO = useDerivedValue(() => 0.28 + 0.72 * t.value);
  // El broche se apaga sin desmontarse: una balanza que mide no lleva ningún
  // signo, y el árbol de la escena tiene que ser el mismo con broche y sin él.
  const broochO = useDerivedValue(() => (brooch ? 1 - t.value : 0), [brooch]);
  const lidT = useDerivedValue(() => [{ rotate: -1.9 * openness.value }]);
  const boxO = useDerivedValue(() => 1 - openness.value * 0.35);

  /**
   * La caja que se abre: es la comprobación del nivel entero —adentro había lo
   * que la balanza dijo—, así que suelta su halo y sus chispas cuando la tapa
   * termina de subir, una sola vez. Se detecta en el hilo de animación.
   */
  const abre = useSharedValue(1);
  const hasBox = geom.hasBox;
  useAnimatedReaction(
    () => openness.value,
    (cur, prev) => {
      if (!hasBox || prev === null) return;
      if (prev < OPEN_AT && cur >= OPEN_AT) {
        abre.value = 0;
        abre.value = withTiming(1, { duration: BURST_MS });
        // Vidrio: lo que había adentro coincide con lo que la balanza midió.
        runOnJS(play)("join");
      }
    },
    [hasBox],
  );
  const abreO = useDerivedValue(() => (abre.value < 1 ? 0.85 * (1 - abre.value) : 0));

  const boxColors = [BOX_LOOK.light, BOX_LOOK.base, BOX_LOOK.dark];
  const boxGrad = (
    <LinearGradient start={vec(0, geom.boxTop)} end={vec(0, geom.boxBottom)} colors={boxColors} />
  );

  return (
    <>
      <Path path={geom.cords} color="rgba(214, 224, 236, 0.5)" style="stroke" strokeWidth={1.6} strokeCap="round" />
      <Path path={geom.hook} color={STEEL_LOOK.light} />
      <Path path={geom.plate}>
        <LinearGradient
          start={vec(0, geom.boxBottom + 2)}
          end={vec(0, geom.boxBottom + 14)}
          colors={[STEEL_LOOK.light, STEEL_LOOK.base, STEEL_LOOK.dark]}
        />
      </Path>
      <Path path={geom.rim} color={STEEL_LOOK.light} />

      <WeightBodies path={geom.stay.path} shine={geom.stay.shine} band={geom.stay.band} hollow={geom.stay.hollow} />
      <Group transform={leaveT} opacity={leaveO}>
        <WeightBodies path={geom.leave.path} shine={geom.leave.shine} band={geom.leave.band} hollow={geom.leave.hollow} />
      </Group>
      <Group transform={enterT} opacity={enterO}>
        <WeightBodies path={geom.enter.path} shine={geom.enter.shine} band={geom.enter.band} hollow={geom.enter.hollow} />
      </Group>

      <Group opacity={boxO}>
        <Path path={geom.boxStay}>{boxGrad}</Path>
        <Path path={geom.boxStay} color={WEIGHT_RIM} style="stroke" strokeWidth={1.2} />
        <Path path={geom.boxShineStay} color="rgba(255, 255, 255, 0.5)" />
      </Group>
      <Group transform={leaveT} opacity={leaveO}>
        <Path path={geom.boxLeave}>{boxGrad}</Path>
        <Path path={geom.boxLeave} color={WEIGHT_RIM} style="stroke" strokeWidth={1.2} />
        <Path path={geom.boxShineLeave} color="rgba(255, 255, 255, 0.5)" />
      </Group>
      <Group opacity={boxEnterO}>
        <Path path={geom.boxEnter}>{boxGrad}</Path>
        <Path path={geom.boxEnter} color={WEIGHT_RIM} style="stroke" strokeWidth={1.2} />
        <Path path={geom.boxShineEnter} color="rgba(255, 255, 255, 0.5)" />
      </Group>
      <Group origin={geom.lidOrigin} transform={lidT}>
        <Path path={geom.lid} color={BOX_LOOK.light} />
        <Path path={geom.lid} color={WEIGHT_RIM} style="stroke" strokeWidth={1} />
      </Group>
      {/* Lo que había adentro: menta, porque coincide con lo que la balanza midió. */}
      <Group opacity={abreO}>
        <Path path={geom.revealHalo} color={theme.color.ok}>
          <BlurMask blur={12} style="normal" />
        </Path>
      </Group>
      <Group opacity={openness}>
        <WeightBodies path={geom.reveal.path} shine={geom.reveal.shine} band={geom.reveal.band} look={REVEAL_LOOK} />
      </Group>
      <EventSparks x={geom.revealAt.x} y={geom.revealAt.y} burst={abre} />

      <Group opacity={broochO}>
        <Path path={geom.brooch} color={theme.color.accent} style="stroke" strokeWidth={2.5} strokeCap="round" />
      </Group>
    </>
  );
}

/**
 * Las seis chispas de un evento, alrededor de `(x, y)`: menta y oro, que se
 * abren y se apagan en lo que tarda `burst` en ir de 0 a 1. Montadas siempre,
 * invisibles en reposo (`burst` en 1). La usa también el libro de cuentas, para
 * que el evento se vea igual en las dos escenas.
 */
export function EventSparks({
  x,
  y,
  burst,
}: {
  readonly x: number;
  readonly y: number;
  readonly burst: SharedValue<number>;
}) {
  return (
    <>
      {SPARKS.map((angle, i) => (
        <Spark key={i} x={x} y={y} angle={angle} gold={i % 2 === 1} burst={burst} />
      ))}
    </>
  );
}

/**
 * Una chispa del evento. Sale del objeto que lo causó y se apaga sola: toda su
 * vida se deriva de `burst`, que va de 0 a 1 una vez por evento y descansa en 1,
 * donde la chispa no se ve. Es la misma chispa que la del puente del nodo 1.
 */
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
  const tr = useDerivedValue(() => {
    const d = 8 + 34 * burst.value;
    return [
      { translateX: x + Math.cos(angle) * d },
      { translateY: y + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [x, y, angle]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={tr} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}
