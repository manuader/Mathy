/**
 * El camino de piedras: el objeto concreto de `found.count.number_line`.
 *
 * Un camino de piedras chatas cruza el agua. El caminante ocupa una piedra, la
 * bandera está en otra y abajo hay una manivela con dientes. El enganche entre
 * el diente y el paso no es una regla del juego: es la geometría de la escena.
 * La manivela gira exactamente lo que el caminante caminó, porque las dos cosas
 * se derivan del mismo valor. Por eso no hay medio diente y no hay forma de
 * caer al agua girando.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las fichas del cajón están siempre montadas, las que sobran con
 *    opacidad cero.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Una pista de veinte
 *    piedras cuesta lo mismo que una de cinco: la escena entera usa unos
 *    veinticinco de los trescientos elementos animados del presupuesto.
 * 3. Nada vuelve al hilo de JavaScript por cuadro. La posición del caminante,
 *    el giro de la manivela y el arrastre de una ficha se derivan de los
 *    `SharedValue` que trae el gesto.
 *
 * Nada de texto: los numerales son contornos del atlas de glifos, dibujados
 * como cualquier otra forma. Un chico que no lee ve un dibujo, no una etiqueta.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { TEETH_PER_TURN, type PathLevel, type PathProblem } from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Cuánto se despega el caminante del camino cuando el dedo lo levanta. */
const LIFT = 34;
/** Cuánto salta el pie entre una piedra y la siguiente. */
const HOP = 12;
/** Cuánto gira la manivela por piedra. */
export const TOOTH_ANGLE = (2 * Math.PI) / TEETH_PER_TURN;
/** Fichas montadas siempre, para que el árbol no cambie entre rondas. */
export const TILE_SLOTS = 5;

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

/** Una pista dibujada. `explain` tiene dos; el resto de los niveles, una. */
export interface TrackLayout {
  /** El centro de cada piedra, indexado por su número. */
  readonly stones: readonly Spot[];
  readonly origin: Spot;
  /** Cuánto se corre el caminante, en píxeles, por cada piedra. */
  readonly dx: number;
  readonly dy: number;
  readonly step: number;
  /** Del centro de la piedra al centro de su tarjeta. */
  readonly cardDx: number;
  readonly cardDy: number;
  readonly from: Spot;
  readonly to: Spot;
}

export interface PathLayout {
  readonly tracks: readonly TrackLayout[];
  /** Radio del blanco de toque de una piedra: generoso a propósito. */
  readonly touchR: number;
  readonly stoneR: number;
  readonly cardW: number;
  readonly cardH: number;
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  readonly tiles: readonly Spot[];
  readonly tileW: number;
  readonly tileH: number;
}

const PAD = 52;
/** Con pocas piedras la pista no se estira hasta el absurdo: el paso tiene techo. */
const MAX_STEP = 132;

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la ficha entraría donde no se ve.
 */
export function pathLayout(
  problem: PathProblem,
  level: PathLevel,
  width: number,
  height: number,
): PathLayout {
  const vertical = problem.orientation === "vertical";
  const compare = level.mode === "compare";
  const units = Math.max(problem.length - 1 + problem.leadIn, 1);

  const tracks: TrackLayout[] = [];
  if (compare) {
    // Las dos animaciones comparten pista y tamaño: lo único distinto tiene que
    // ser el recorrido, o la comparación no diría nada.
    for (const row of [0.26, 0.6]) {
      tracks.push(horizontal(problem, width, height * row, units, 1));
    }
  } else if (vertical) {
    tracks.push(upward(problem, width * 0.24, height, units));
  } else {
    tracks.push(horizontal(problem, width, height * 0.36, units, problem.stretch));
  }

  const step = tracks[0]?.step ?? 40;
  const crankR = Math.max(34, Math.min(52, height * 0.14));
  const crank = vertical
    ? { x: width - crankR - PAD, y: height * 0.3, r: crankR }
    : { x: PAD + crankR, y: height - crankR - 14, r: crankR };

  const tileH = 48;
  const tileW = 48;
  const n = Math.max(problem.tiles.length, 1);
  const drawerCx = vertical ? width * 0.62 : (crank.x + crankR + width) / 2;
  const gap = 12;
  const total = n * tileW + (n - 1) * gap;
  const tileY = height - tileH / 2 - 16;
  // Siempre las mismas ranuras: las que esta ronda no usa se van del lienzo, y
  // así el árbol de la escena no cambia de una ronda a la otra.
  const tiles: Spot[] = [];
  for (let i = 0; i < TILE_SLOTS; i++) {
    tiles.push(
      i < problem.tiles.length
        ? { x: drawerCx - total / 2 + tileW / 2 + i * (tileW + gap), y: tileY }
        : { x: drawerCx, y: height + tileH * 2 },
    );
  }

  return {
    tracks,
    touchR: Math.max(step * 0.55, 26),
    stoneR: Math.min(step * 0.36, 26),
    cardW: Math.min(step * 0.86, 34),
    cardH: 26,
    crank,
    tiles,
    tileW,
    tileH,
  };
}

function horizontal(
  problem: PathProblem,
  width: number,
  y: number,
  units: number,
  stretch: number,
): TrackLayout {
  const step = Math.min(((width - 2 * PAD) / units) * stretch, MAX_STEP);
  const drawn = step * units;
  const left = (width - drawn) / 2;
  const origin = { x: left + problem.leadIn * step, y };
  const stones: Spot[] = [];
  for (let i = 0; i < problem.length; i++) stones.push({ x: origin.x + i * step, y });
  return {
    stones,
    origin,
    dx: step,
    dy: 0,
    step,
    cardDx: 0,
    cardDy: 30,
    from: { x: left, y },
    to: { x: left + drawn, y },
  };
}

/** La pista parada: el orden va hacia arriba, que es lo que el nivel 5 rompe. */
function upward(problem: PathProblem, x: number, height: number, units: number): TrackLayout {
  const step = Math.min(((height - 2 * PAD) / units) * problem.stretch, MAX_STEP);
  const drawn = step * units;
  const bottom = (height + drawn) / 2;
  const origin = { x, y: bottom - problem.leadIn * step };
  const stones: Spot[] = [];
  for (let i = 0; i < problem.length; i++) stones.push({ x, y: origin.y - i * step });
  return {
    stones,
    origin,
    dx: 0,
    dy: -step,
    step,
    cardDx: 34,
    cardDy: 0,
    from: { x, y: bottom },
    to: { x, y: bottom - drawn },
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Un numeral, dibujado. Sale del mismo atlas que la ecuación del nodo 13, así
 * que el `5` de una tarjeta y el `5` de una ecuación son el mismo objeto.
 */
function addNumeral(target: SkPath, value: number, cx: number, cy: number, size: number): void {
  const chars = [...String(value)];
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

// --- Geometría de la pista ---------------------------------------------------

interface TrackGeom {
  readonly water: SkPath;
  readonly stones: SkPath;
  readonly cards: SkPath;
  readonly numerals: SkPath;
  readonly holes: SkPath;
  readonly flag: SkPath;
  readonly flagStone: SkPath;
}

function buildTrack(
  problem: PathProblem,
  level: PathLevel,
  l: PathLayout,
  track: TrackLayout,
  filled: readonly number[],
): TrackGeom {
  const mark = level.skin === "mark";
  const vertical = problem.orientation === "vertical";

  const water = Skia.Path.Make();
  if (mark) {
    water.moveTo(track.from.x, track.from.y);
    water.lineTo(track.to.x, track.to.y);
  } else if (vertical) {
    water.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(track.to.x - 15, track.to.y - 10, 30, track.from.y - track.to.y + 20),
        15,
        15,
      ),
    );
  } else {
    water.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(track.from.x - 10, track.from.y - 15, track.to.x - track.from.x + 20, 30),
        15,
        15,
      ),
    );
  }

  const stones = Skia.Path.Make();
  const holes = Skia.Path.Make();
  const cards = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const numeralSize = Math.min(l.cardH * 0.72, 19);

  for (let i = 0; i < problem.length; i++) {
    const s = track.stones[i] as Spot;
    if (mark) {
      // La piedra aplanada: una marca perpendicular a la línea.
      const h = 9;
      if (vertical) {
        stones.moveTo(s.x - h, s.y);
        stones.lineTo(s.x + h, s.y);
      } else {
        stones.moveTo(s.x, s.y - h);
        stones.lineTo(s.x, s.y + h);
      }
    } else {
      stones.addOval(
        Skia.XYWHRect(s.x - l.stoneR, s.y - l.stoneR * 0.44, l.stoneR * 2, l.stoneR * 0.88),
      );
    }

    const esHueco = problem.gaps.includes(i) && !filled.includes(i);
    const llevaTarjeta = level.cards && (i > 0 || level.zeroCard);
    if (!llevaTarjeta) continue;

    const cx = s.x + track.cardDx;
    const cy = s.y + track.cardDy;
    if (esHueco) {
      // El hueco se ve como hueco: el marco vacío pide la ficha sin decirlo.
      holes.addRRect(
        Skia.RRectXY(Skia.XYWHRect(cx - l.cardW / 2, cy - l.cardH / 2, l.cardW, l.cardH), 5, 5),
      );
      continue;
    }
    if (!mark) {
      cards.addRRect(
        Skia.RRectXY(Skia.XYWHRect(cx - l.cardW / 2, cy - l.cardH / 2, l.cardW, l.cardH), 5, 5),
      );
    }
    addNumeral(numerals, i, cx, cy, numeralSize);
  }

  const flag = Skia.Path.Make();
  const flagStone = Skia.Path.Make();
  if (problem.flag !== null) {
    const s = track.stones[problem.flag] as Spot;
    flag.moveTo(s.x, s.y - 6);
    flag.lineTo(s.x, s.y - 44);
    flag.lineTo(s.x + 22, s.y - 36);
    flag.lineTo(s.x, s.y - 28);
    flagStone.addOval(
      Skia.XYWHRect(s.x - l.stoneR - 4, s.y - l.stoneR * 0.44 - 4, l.stoneR * 2 + 8, l.stoneR * 0.88 + 8),
    );
  }

  return { water, stones, cards, numerals, holes, flag, flagStone };
}

/** La rueda dentada. Los dientes son todos iguales: eso es el invariante. */
function buildCrank(r: number): { body: SkPath; teeth: SkPath; lit: SkPath; handle: SkPath } {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  body.addCircle(0, 0, 4);

  const teeth = Skia.Path.Make();
  const lit = Skia.Path.Make();
  for (let i = 0; i < TEETH_PER_TURN; i++) {
    const a = i * TOOTH_ANGLE - Math.PI / 2;
    const x0 = Math.cos(a) * r * 0.62;
    const y0 = Math.sin(a) * r * 0.62;
    const x1 = Math.cos(a) * r * 0.86;
    const y1 = Math.sin(a) * r * 0.86;
    teeth.moveTo(x0, y0);
    teeth.lineTo(x1, y1);
  }
  const handle = Skia.Path.Make();
  handle.moveTo(0, 0);
  handle.lineTo(0, -r * 0.62);
  handle.addCircle(0, -r * 0.62, 8);
  return { body, teeth, lit, handle };
}

/** Cuántos dientes anuncia la manivela antes de girar, en el nivel que anticipa. */
function buildAnnounced(r: number, teeth: number): SkPath {
  const p = Skia.Path.Make();
  for (let i = 0; i < teeth; i++) {
    const a = i * TOOTH_ANGLE - Math.PI / 2;
    p.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    p.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
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

// --- Componente --------------------------------------------------------------

export interface TileSlot {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras la ficha está en la mano; 0 cuando ya se clavó o no se usa. */
  readonly alive: SharedValue<number>;
}

export interface PathSceneProps {
  readonly problem: PathProblem;
  readonly level: PathLevel;
  readonly layout: PathLayout;
  /** La posición del caminante, en piedras. Entera salvo mientras el dedo lo sostiene. */
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
  /** Los huecos que el jugador ya completó. */
  readonly filled: readonly number[];
  /** La piedra cuya tarjeta se está levantando por un toque, o -1. */
  readonly tapped: number;
  readonly tapLift: SharedValue<number>;
  /** La fila que el jugador eligió en `explain`, o -1. */
  readonly picked: number;
  readonly tiles: readonly TileSlot[];
  readonly appear: SharedValue<number>;
}

export function PathScene({
  problem,
  level,
  layout,
  pos,
  lift,
  jam,
  hint,
  clock,
  demo,
  filled,
  tapped,
  tapLift,
  picked,
  tiles,
  appear,
}: PathSceneProps) {
  const geoms = useMemo(
    () => layout.tracks.map((t) => buildTrack(problem, level, layout, t, filled)),
    [problem, level, layout, filled],
  );
  const crank = useMemo(() => buildCrank(layout.crank.r), [layout.crank.r]);
  const announced = useMemo(
    () => buildAnnounced(layout.crank.r, level.mode === "predict" ? problem.teeth : 0),
    [layout.crank.r, level.mode, problem.teeth],
  );
  const walker = useMemo(buildWalker, []);

  // La tarjeta que se levanta al tocar una piedra. Se arma cuando cambia la
  // piedra tocada, no por cuadro.
  const peek = useMemo(() => {
    const card = Skia.Path.Make();
    const digits = Skia.Path.Make();
    const track = layout.tracks[0];
    const stone = tapped >= 0 ? track?.stones[tapped] : undefined;
    if (track && stone) {
      const cx = stone.x + track.cardDx;
      const cy = stone.y + track.cardDy;
      card.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(cx - layout.cardW / 2, cy - layout.cardH / 2, layout.cardW, layout.cardH),
          5,
          5,
        ),
      );
      addNumeral(digits, tapped, cx, cy, Math.min(layout.cardH * 0.72, 19));
    }
    return { card, digits };
  }, [tapped, layout]);

  const tileGeom = useMemo(() => {
    const size = Math.min(layout.tileH * 0.62, 24);
    return layout.tiles.map((spot, i) => {
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
      const value = problem.tiles[i]?.value;
      if (value !== undefined) addNumeral(digits, value, spot.x, spot.y, size);
      return { box, digits };
    });
  }, [layout, problem.tiles]);

  const crankT = useDerivedValue(() => [
    { rotate: pos.value * TOOTH_ANGLE + jam.value * 0.06 },
  ]);
  const crankGlow = useDerivedValue(() => 0.3 + 0.7 * hint.value);

  /**
   * La mano fantasma. Es la única instrucción del nodo: en los niveles que se
   * caminan toma la manivela y la gira dos dientes; en los que se completan
   * lleva la primera ficha hasta el primer hueco. No dice nada porque no puede:
   * el jugador no lee.
   */
  const ghost = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 13);
    const track = layout.tracks[0];
    const hole = problem.gaps.find((g) => !filled.includes(g));
    const to =
      level.mode === "fill" && track && hole !== undefined
        ? {
            x: (track.stones[hole]?.x ?? 0) + track.cardDx,
            y: (track.stones[hole]?.y ?? 0) + track.cardDy,
          }
        : null;
    return { dot, from: layout.tiles[0] ?? { x: 0, y: 0 }, to };
  }, [layout, level.mode, problem.gaps, filled]);

  const crankR = layout.crank.r * 0.62;
  const crankX = layout.crank.x;
  const crankY = layout.crank.y;
  const ghostFrom = ghost.from;
  const ghostTo = ghost.to;
  const ghostT = useDerivedValue(() => {
    if (ghostTo) {
      const t = ghostT01(demo.value);
      return [
        { translateX: ghostFrom.x + (ghostTo.x - ghostFrom.x) * t },
        { translateY: ghostFrom.y + (ghostTo.y - ghostFrom.y) * t },
      ];
    }
    // Sobre la manivela: dos dientes de giro y vuelve a empezar.
    const a = -Math.PI / 2 + TOOTH_ANGLE * 2 * ghostT01(demo.value);
    return [
      { translateX: crankX + Math.cos(a) * crankR },
      { translateY: crankY + Math.sin(a) * crankR },
    ];
  }, [ghostFrom, ghostTo, crankX, crankY, crankR]);
  const ghostO = useDerivedValue(() => hint.value * 0.5 * Math.sin(demo.value * Math.PI));

  return (
    <Group opacity={appear}>
      {layout.tracks.map((track, row) => (
        <Track
          key={row}
          geom={geoms[row] as TrackGeom}
          track={track}
          layout={layout}
          problem={problem}
          level={level}
          row={row}
          pos={pos}
          lift={lift}
          clock={clock}
          hint={hint}
          picked={picked}
          walker={walker}
        />
      ))}

      {/* La tarjeta que se levanta para mirar el numeral sin caminar. */}
      <Group opacity={tapLift}>
        <Path path={peek.card} color={theme.color.surfaceHigh} />
        <Path path={peek.card} color={theme.color.accent} style="stroke" strokeWidth={STROKE} />
        <Path path={peek.digits} color={theme.color.ink} />
      </Group>

      {/* La manivela. Su giro es la posición del caminante: un solo hecho. */}
      <Group
        transform={[{ translateX: layout.crank.x }, { translateY: layout.crank.y }]}
        opacity={level.mode === "compare" ? 0 : 1}
      >
        <Path path={crank.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={announced} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
        <Group transform={crankT}>
          <Path path={crank.teeth} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
          <Group opacity={crankGlow}>
            <Path path={crank.handle} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
          </Group>
        </Group>
      </Group>

      {/* El cajón de fichas. Siempre montadas: las que sobran, invisibles. */}
      {tileGeom.map((g, i) => (
        <TileView key={i} geom={g} slot={tiles[i] as TileSlot} />
      ))}

      <Group transform={ghostT} opacity={ghostO}>
        <Path path={ghost.dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/** Una pista con su caminante. `explain` monta dos y compara los recorridos. */
function Track({
  geom,
  track,
  layout,
  problem,
  level,
  row,
  pos,
  lift,
  clock,
  hint,
  picked,
  walker,
}: {
  readonly geom: TrackGeom;
  readonly track: TrackLayout;
  readonly layout: PathLayout;
  readonly problem: PathProblem;
  readonly level: PathLevel;
  readonly row: number;
  readonly pos: SharedValue<number>;
  readonly lift: SharedValue<number>;
  readonly clock: SharedValue<number>;
  readonly hint: SharedValue<number>;
  readonly picked: number;
  readonly walker: { body: SkPath; head: SkPath };
}) {
  const compare = level.mode === "compare";
  const mark = level.skin === "mark";
  const walk = compare ? ((problem.walks[row] ?? []) as readonly number[]) : [];
  const ox = track.origin.x;
  const oy = track.origin.y;
  const dx = track.dx;
  const dy = track.dy;

  /**
   * Dónde está el caminante. En los niveles jugables es el valor que trae el
   * gesto; en `explain` es el recorrido de esta fila leído por el reloj, que es
   * lo único que distingue a la animación que miente.
   */
  const walkerT = useDerivedValue(() => {
    let u = pos.value;
    let hop = 0;
    let sink = 0;
    if (walk.length > 1) {
      const t = Math.min(0.9999, Math.max(0, clock.value)) * (walk.length - 1);
      const i = Math.floor(t);
      const f = t - i;
      const a = walk[i] ?? 0;
      const b = walk[i + 1] ?? a;
      const eased = f * f * (3 - 2 * f);
      u = a + (b - a) * eased;
      hop = Math.sin(f * Math.PI) * HOP;
      // Caer entre dos piedras es hundirse: el agua no sostiene a nadie.
      const off = Math.abs(u - Math.round(u));
      sink = Math.min(1, off * 4) * 11 * (1 - Math.sin(f * Math.PI));
    }
    return [
      { translateX: ox + dx * u },
      { translateY: oy + dy * u - LIFT * lift.value - hop + sink },
    ];
  }, [walk, ox, oy, dx, dy]);

  const flagPulse = useDerivedValue(() => 0.45 + 0.55 * hint.value);
  const elegida = picked === row;
  const esLaQueMiente = row === problem.liar;

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
      {!mark ? (
        <Path path={geom.stones} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      ) : null}

      <Path path={geom.cards} color={theme.color.surface} />
      <Path path={geom.cards} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.numerals} color={theme.color.ink} />
      <Group opacity={hint}>
        <Path path={geom.holes} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={geom.holes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />

      <Group opacity={flagPulse}>
        <Path path={geom.flagStone} color={theme.color.ok} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={geom.flag} color={theme.color.ok} style="stroke" strokeWidth={2} />

      {/* La fila elegida en `explain`: la que miente se marca, la otra se afirma. */}
      {compare ? (
        <Path
          path={geom.water}
          color={esLaQueMiente ? theme.color.warn : theme.color.ok}
          style="stroke"
          strokeWidth={3}
          opacity={elegida ? 1 : 0}
        />
      ) : null}

      <Group transform={walkerT} opacity={problem.showWalker || compare ? 1 : 0}>
        <Path
          path={walker.body}
          color={theme.color.accent}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
        />
        <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
    </>
  );
}

/** Una ficha del cajón. Su dibujo sigue al mismo par de valores que el gesto. */
function TileView({
  geom,
  slot,
}: {
  readonly geom: { box: SkPath; digits: SkPath };
  readonly slot: TileSlot;
}) {
  const transform = useDerivedValue(() => [
    { translateX: slot.dx.value },
    { translateY: slot.dy.value },
  ]);
  return (
    <Group transform={transform} opacity={slot.alive}>
      <Path path={geom.box} color={theme.color.surfaceHigh} />
      <Path path={geom.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.digits} color={theme.color.ink} />
    </Group>
  );
}
