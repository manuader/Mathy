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
 *    la animación: lo que todavía no se ve está montado con opacidad cero.
 * 2. Todas las pesas de un grupo viven en un solo `SkPath`. Un plato con
 *    ochenta y una pesas cuesta lo mismo que uno con cinco, así que el
 *    presupuesto de trescientos elementos animados no se toca: la escena usa
 *    unos treinta, contando los dos platos.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: cada transformación y cada
 *    opacidad se deriva de los `SharedValue` de progreso que trae el gesto.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import type { BinOp } from "@mathy/math-core";
import { theme } from "../ui/theme.ts";

export type BalanceStyle = "concrete" | "visual";

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
const STROKE = 1.5;

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
  readonly hollow: boolean;
}

interface PanGeom {
  readonly cord: SkPath;
  readonly plate: SkPath;
  readonly stay: UnitGroup;
  readonly leave: UnitGroup;
  readonly enter: UnitGroup;
  readonly boxStay: SkPath;
  readonly boxLeave: SkPath;
  readonly boxEnter: SkPath;
  readonly lid: SkPath;
  readonly lidOrigin: { readonly x: number; readonly y: number };
  readonly reveal: SkPath;
  readonly brooch: SkPath;
}

/** Coloca las pesas de un plato. Una sola función para los dos estilos. */
function unitPlacer(
  n: number,
  cxRegion: number,
  regionW: number,
  yBase: number,
  maxH: number,
  style: BalanceStyle,
): (path: SkPath, i: number) => void {
  if (style === "visual") {
    // Sin piso: con muchas pesas la columna se comprime hasta ser un bloque de
    // altura proporcional, que es justo lo que la capa `visual` quiere mostrar.
    const rowH = Math.min(13, maxH / Math.max(n, 1));
    const bw = regionW * 0.72;
    const bh = Math.max(0.7, rowH * 0.64);
    return (path, i) => {
      const y = yBase - (i + 1) * rowH;
      path.addRect(Skia.XYWHRect(cxRegion - bw / 2, y + (rowH - bh) / 2, bw, bh));
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
  return (path, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    path.addCircle(cxRegion - usedW / 2 + (col + 0.5) * cell, yBase - (row + 0.5) * cell, r);
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

function buildPan(
  before: PanContent,
  after: PanContent,
  solution: number,
  lockOp: BinOp,
  style: BalanceStyle,
  l: BalanceLayout,
): PanGeom {
  const cord = Skia.Path.Make();
  cord.moveTo(0, 0);
  cord.lineTo(0, l.hang);

  const plate = Skia.Path.Make();
  const pw = l.panW;
  plate.moveTo(-pw / 2, l.hang);
  plate.lineTo(pw / 2, l.hang);
  plate.lineTo(pw * 0.34, l.hang + 9);
  plate.lineTo(-pw * 0.34, l.hang + 9);
  plate.close();

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
  const lid = Skia.Path.Make();
  const reveal = Skia.Path.Make();
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
      }
      const x0 = boxCx - total / 2;
      lid.addRRect(Skia.RRectXY(Skia.XYWHRect(x0, boxTop - 5, w, 5), 2, 2));
      lidOrigin = { x: x0, y: boxTop - 5 };
    } else {
      // La caja partida: `x/3` es un tercio de caja, y la llave devuelve el resto.
      const d = Math.max(2, Math.round(1 / before.boxes));
      const w = boxW / d;
      const x0 = boxCx - boxW / 2;
      for (let i = 0; i < d; i++) {
        const target = i === 0 ? boxStay : boxEnter;
        target.addRect(Skia.XYWHRect(x0 + i * w, yBase - boxH, w, boxH));
      }
      lid.addRRect(Skia.RRectXY(Skia.XYWHRect(x0, boxTop - 5, w, 5), 2, 2));
      lidOrigin = { x: x0, y: boxTop - 5 };
    }
    // Lo que la caja muestra al abrirse: la solución, en pesas, sin escribir nada.
    const rn = Math.round(Math.abs(solution));
    const place = unitPlacer(rn, boxCx, Math.max(boxW * 1.8, 40), boxTop - 12, 64, "concrete");
    for (let i = 0; i < rn; i++) place(reveal, i);
  }

  const unitsBase = flat && hasBox ? boxTop - 4 : yBase;
  const sameSign =
    before.units === 0 || after.units === 0 || Math.sign(before.units) === Math.sign(after.units);
  const stayCount = sameSign ? Math.min(nb, na) : 0;
  // La caja de la columna aplanada come altura: sin descontarla, las pesas
  // trepan por encima de la barra.
  const unitsMaxH = flat && hasBox ? Math.max(24, l.contentH - boxH) : l.contentH;
  const place = unitPlacer(Math.max(nb, na), unitCx, unitRegionW, unitsBase, unitsMaxH, style);

  const stayPath = Skia.Path.Make();
  const leavePath = Skia.Path.Make();
  const enterPath = Skia.Path.Make();
  for (let i = 0; i < stayCount; i++) place(stayPath, i);
  for (let i = stayCount; i < nb; i++) place(leavePath, i);
  for (let i = stayCount; i < na; i++) place(enterPath, i);

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

  return {
    cord,
    plate,
    stay: { path: stayPath, hollow: before.units < 0 },
    leave: { path: leavePath, hollow: before.units < 0 },
    enter: { path: enterPath, hollow: after.units < 0 },
    boxStay,
    boxLeave,
    boxEnter,
    lid,
    lidOrigin,
    reveal,
    brooch,
  };
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
}

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

  const stand = useMemo(() => {
    const p = Skia.Path.Make();
    const base = l.beamY + l.hang + 42;
    p.moveTo(l.cx, l.beamY);
    p.lineTo(l.cx, base);
    p.moveTo(l.cx - 34, base);
    p.lineTo(l.cx + 34, base);
    return p;
  }, [l]);

  const beam = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(l.cx - l.span, l.beamY);
    p.lineTo(l.cx + l.span, l.beamY);
    p.addCircle(l.cx, l.beamY, 4);
    return p;
  }, [l]);

  const sign = c.deltaSign;
  const tiltPropio = useDerivedValue(() => -(left.value - right.value) * sign * MAX_TILT, [sign]);
  const opennessPropia = useDerivedValue(() => Math.min(left.value, right.value));
  const tilt = tiltIn ?? tiltPropio;
  const openness = opennessIn ?? opennessPropia;

  const beamT = useDerivedValue(() => [{ rotate: tilt.value }]);
  const levelO = useDerivedValue(() => 1 - Math.min(1, Math.abs(tilt.value) / MAX_TILT));
  const tiltedO = useDerivedValue(() => Math.min(1, Math.abs(tilt.value) / MAX_TILT));

  const leftT = useDerivedValue(() => [
    { translateX: l.cx - l.span * Math.cos(tilt.value) },
    { translateY: l.beamY - l.span * Math.sin(tilt.value) },
  ]);
  const rightT = useDerivedValue(() => [
    { translateX: l.cx + l.span * Math.cos(tilt.value) },
    { translateY: l.beamY + l.span * Math.sin(tilt.value) },
  ]);

  return (
    <Group opacity={appear}>
      <Path path={stand} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      <Group origin={{ x: l.cx, y: l.beamY }} transform={beamT}>
        <Path path={beam} color={theme.color.inkDim} style="stroke" strokeWidth={2} opacity={levelO} />
        <Path path={beam} color={theme.color.warn} style="stroke" strokeWidth={2} opacity={tiltedO} />
      </Group>
      <Group transform={leftT}>
        <Pan geom={leftPan} t={left} openness={openness} brooch={brooch} />
      </Group>
      <Group transform={rightT}>
        <Pan geom={rightPan} t={right} openness={openness} brooch={brooch} />
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

  return (
    <>
      <Path path={geom.cord} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.plate} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />

      <Path
        path={geom.stay.path}
        color={theme.color.inkDim}
        style={geom.stay.hollow ? "stroke" : "fill"}
        strokeWidth={STROKE}
      />
      <Group transform={leaveT} opacity={leaveO}>
        <Path
          path={geom.leave.path}
          color={theme.color.inkDim}
          style={geom.leave.hollow ? "stroke" : "fill"}
          strokeWidth={STROKE}
        />
      </Group>
      <Group transform={enterT} opacity={enterO}>
        <Path
          path={geom.enter.path}
          color={theme.color.inkDim}
          style={geom.enter.hollow ? "stroke" : "fill"}
          strokeWidth={STROKE}
        />
      </Group>

      <Path path={geom.boxStay} color={theme.color.accent} style="stroke" strokeWidth={2} opacity={boxO} />
      <Group transform={leaveT} opacity={leaveO}>
        <Path path={geom.boxLeave} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Group opacity={boxEnterO}>
        <Path path={geom.boxEnter} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Group origin={geom.lidOrigin} transform={lidT}>
        <Path path={geom.lid} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={geom.reveal} color={theme.color.ok} opacity={openness} />

      <Group opacity={broochO}>
        <Path path={geom.brooch} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
    </>
  );
}
