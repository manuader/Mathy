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
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
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

/** Las tres clases de objeto. El cuenco de enfrente arranca en la siguiente. */
const KIND_COLORS = [theme.color.accent, theme.color.ink, theme.color.inkDim] as const;

export const colorOfKind = (bowl: number, kind: number): string =>
  KIND_COLORS[(bowl + kind) % KIND_COLORS.length] as string;

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
  // Desparramado: pseudo azar estable por índice, para que el mismo problema se
  // vea siempre igual sin guardar posiciones.
  const a = Math.sin(i * 12.9898 + centerX * 0.017) * 43758.5453;
  const b = Math.sin(i * 78.233 + centerX * 0.031) * 12345.6789;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  return {
    x: centerX + (fx - 0.5) * r * 1.6,
    y: g.bowlY + r * 0.45 - fy * r * 0.8,
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

/** El cuenco: media circunferencia con su borde. En `visual` es una bandeja plana. */
function bowlPath(g: BowlGeom, x: number, style: BowlStyle): SkPath {
  const p = Skia.Path.Make();
  if (style === "visual") {
    p.addRRect(
      Skia.RRectXY(Skia.XYWHRect(x - g.bowlR, g.bowlY + g.bowlR * 0.5, g.bowlR * 2, 7), 3.5, 3.5),
    );
    return p;
  }
  p.addArc(Skia.XYWHRect(x - g.bowlR, g.bowlY - g.bowlR * 0.5, g.bowlR * 2, g.bowlR * 1.6), 0, 180);
  p.moveTo(x - g.bowlR * 1.06, g.bowlY - g.bowlR * 0.2);
  p.lineTo(x + g.bowlR * 1.06, g.bowlY - g.bowlR * 0.2);
  return p;
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

/** Los puentes dibujados: una línea corta por hueco enfrentado. */
function bridgePath(g: BowlGeom, bridges: readonly boolean[]): SkPath {
  const p = Skia.Path.Make();
  for (let s = 0; s < bridges.length; s++) {
    if (!bridges[s]) continue;
    const a = slotAt(g, 0, s);
    const b = slotAt(g, 1, s);
    p.moveTo(a.x, a.y + g.unit * 1.5);
    p.lineTo(b.x, b.y - g.unit * 1.5);
  }
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

function tablePath(g: BowlGeom): SkPath {
  const p = Skia.Path.Make();
  const y = g.bowlY + g.bowlR * 1.1;
  p.moveTo(g.cx - g.stripW / 2, y);
  p.lineTo(g.cx + g.stripW / 2, y);
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
  /** Dónde está cada tarjeta elegible y si se ve. */
  readonly cardPlaces: readonly Place[];
  /** Lo que dice la tarjeta de cada cuenco; -1 si ese cuenco todavía no tiene. */
  readonly bowlCounts: readonly number[];
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

  const table = useMemo(() => tablePath(g), [g]);
  const strip = useMemo(() => stripPath(g, style, t0, t1), [g, style, t0, t1]);
  const bowlShapes = useMemo(
    () => problem.bowls.map((_, i) => bowlPath(g, bowlCenterX(g, modo, i), style)),
    [g, modo, style, problem.bowls],
  );
  const basket = useMemo(() => basketPath(g), [g]);
  const bridgeLines = useMemo(() => bridgePath(g, bridges), [g, bridges]);
  const hand = useMemo(handPath, []);

  const bridgeOn = useDerivedValue(() => 0.6 + 0.4 * props.glow.value);
  const demoO = useDerivedValue(() => props.demo.value * (1 - props.glow.value));
  const demoT = useDerivedValue(() => {
    // La mano va del primer objeto a su hueco, en línea recta. Es la única
    // instrucción del juego, y no dice una palabra.
    const from = places[0] ?? { x: g.cx, y: g.bowlY };
    const to = slotAt(g, 0, 0);
    const k = props.demo.value;
    return [
      { translateX: from.x + (to.x - from.x) * k },
      { translateY: from.y + (to.y - from.y) * k },
    ];
  }, [places, g]);

  // La franja, la canasta y las tarjetas elegibles solo existen en los modos que
  // las usan. El modo no cambia mientras el nivel vive, así que gatearlas acá no
  // rompe el modo retained: el árbol sigue siendo el mismo de la primera ronda
  // a la última.
  const hayFranja = modo === "pair";
  const hayCanasta = modo === "fill";
  const hayEleccion = modo === "carry" || modo === "label";

  return (
    <Group>
      <Path path={table} color={theme.color.line} style="stroke" strokeWidth={STROKE} />

      {hayFranja ? (
        <>
          <Path path={strip} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Group opacity={bridgeOn}>
            <Path path={bridgeLines} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
          </Group>
        </>
      ) : null}

      {bowlShapes.map((p, i) => (
        <Path
          key={`bowl${i}`}
          path={p}
          color={theme.color.inkFaint}
          style={style === "visual" ? "fill" : "stroke"}
          strokeWidth={2}
        />
      ))}

      {hayCanasta ? (
        <Path path={basket} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
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
              contraeConGlow
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
  readonly lonely: boolean;
  readonly round: number;
  readonly instant: boolean;
  readonly dragIdx: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
  readonly pulse: SharedValue<number>;
}) {
  const path = useMemo(
    () => shapePath(owner.skin, geom.unit * owner.size),
    [owner.skin, owner.size, geom.unit],
  );
  const ax = useSharedValue(place.x);
  const ay = useSharedValue(place.y);
  const ao = useSharedValue(place.on ? 1 : 0);
  const rondaPrevia = useRef(round);

  useEffect(() => {
    // Al cambiar de ronda el objeto no viaja: aparece donde va. Interpolar un
    // salto entre dos problemas distintos se vería como una cosa que se escapa.
    const salto = rondaPrevia.current !== round || instant;
    rondaPrevia.current = round;
    const d = { duration: theme.motion.base };
    ax.value = salto ? place.x : withTiming(place.x, d);
    ay.value = salto ? place.y : withTiming(place.y, d);
    ao.value = salto ? (place.on ? 1 : 0) : withTiming(place.on ? 1 : 0, d);
  }, [place.x, place.y, place.on, round, instant, ax, ay, ao]);

  const transform = useDerivedValue(() => {
    const llevado = dragIdx.value === index;
    return [
      { translateX: ax.value + (llevado ? dragX.value : 0) },
      { translateY: ay.value + (llevado ? dragY.value : 0) },
      { scale: llevado ? 1.3 : 1 },
    ];
  }, [index]);

  // La cosa sin pareja late. No dice "mal": pide que la miren.
  const opacity = useDerivedValue(
    () => ao.value * (lonely ? 0.4 + 0.6 * pulse.value : 1),
    [lonely],
  );

  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={path} color={colorOfKind(owner.bowl, owner.kind)} />
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
    const llevada = dragCard.value === index;
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

  const color = colorOfKind(0, kind);
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
        <Group opacity={marcoO}>
          <Path path={marco} color={theme.color.line} style="stroke" strokeWidth={2} />
        </Group>
        <Group opacity={aciertoO}>
          <Path path={marco} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        </Group>
      </Group>
      <Group opacity={apiladoO}>
        <Path path={apilado} color={color} />
      </Group>
      <Group opacity={filaO}>
        <Path path={enFila} color={color} />
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
