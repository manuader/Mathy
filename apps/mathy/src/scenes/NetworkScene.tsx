/**
 * Los puntos y las flechas: la mecánica `network_routes` de
 * [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * **Por qué es una escena nueva.** `network_routes` es una de las trece
 * mecánicas del catálogo y **doce nodos de la espina la declaran** —del 1 al 37,
 * pasando por el llavero, la lógica de los aros, la condicional y los grafos—,
 * pero ninguno la había construido todavía. La estrena el nodo 17, que la usa
 * como la segunda mirada sobre su invariante: la tubería dice qué hace la regla
 * y la red dice qué la hace legítima. Antes de escribirla se probó configurar
 * `LedgerScene` y `UrnScene`, que son las dos escenas sin dueño fijo; ninguna
 * sirve, porque un libro de cuentas es filas con dueño y un frasco es columnas
 * de piezas, y acá el objeto son dos columnas de puntos y las flechas entre
 * ellas. Forzar cualquiera de las dos habría pedido fabricarles un problema
 * falso, que es peor acoplamiento que una escena más.
 *
 * Por eso mismo **no está escrita a la medida del 17**: no sabe qué es una
 * función, no calcula ninguna regla y no decide si la red está bien. Recibe
 * puntos, flechas y un rótulo, y dibuja. Quién manda a dónde lo resuelve el
 * nodo.
 *
 * El invariante que dibuja es `connections_independent_of_drawing`: lo que hay
 * es quién está conectado con quién, y moverlo de lugar no cambia nada. El nodo
 * 17 le agrega una condición encima —de cada punto de entrada sale exactamente
 * una flecha— y esta escena la muestra de las dos maneras en que se rompe: un
 * punto con dos flechas las hace parpadear a las dos y enciende la luz, y un
 * punto sin ninguna queda apagado.
 *
 * ## Los ejes de configuración
 *
 * - `groups`: una red o dos. Dos son la comparación —cuál de las dos no es una
 *   máquina— y una sola es la que se arma.
 * - `arrows`: las flechas que llegan dibujadas. Vacío: las cuelga el jugador.
 * - `rule`: el rótulo de arriba, ya compuesto por el nodo. Vacío: la red no dice
 *   por qué las flechas van a donde van, que es como se juzga sin calcular.
 * - `numerals`: los números de los puntos. Sin ellos, un punto es un punto, que
 *   es lo que piden los nodos de `literacy: none`.
 * - `drawable`: si el dedo puede colgar flechas.
 *
 * Las tres reglas del proyecto gobiernan el archivo: modo retained —los puntos
 * están todos montados y los que sobran se van del lienzo—, lo que se repite
 * vive en un solo `SkPath`, y nada vuelve al hilo de JavaScript por cuadro: la
 * flecha que sigue al dedo se deriva de un valor compartido.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

export interface NetBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Un punto de la red. El rótulo lo compone el nodo; acá no se arma ninguno. */
export interface NetworkPoint {
  readonly id: string;
  readonly label: string;
}

/** Una flecha: de qué punto de la columna de entrada a cuál de la de salida. */
export interface NetworkArrow {
  readonly from: number;
  readonly to: number;
}

/** Una red completa. Con dos en pantalla, la pregunta es cuál es cuál. */
export interface NetworkGroup {
  readonly id: string;
  readonly inputs: readonly NetworkPoint[];
  readonly outputs: readonly NetworkPoint[];
  readonly arrows: readonly NetworkArrow[];
  /** Reclama atención: es la red que se está armando o la que se eligió. */
  readonly glow: boolean;
}

/** Todo lo que un nodo decide sobre la red. Un nodo que la reusa escribe uno. */
export interface NetworkConfig {
  readonly groups: readonly NetworkGroup[];
  readonly numerals: boolean;
  /** El rótulo de la regla, arriba. Vacío: la red no lo dice. */
  readonly rule: string;
  /** El dedo puede colgar flechas. En falso, la red llega dibujada. */
  readonly drawable: boolean;
}

export interface NetworkGroupLayout {
  /** Siempre `NETWORK_POINT_SLOTS`; los que sobran se van del lienzo. */
  readonly inputs: readonly Spot[];
  readonly outputs: readonly Spot[];
  readonly lamp: Spot;
  readonly rule: Spot;
  /** La caja del grupo entero, para el toque que elige una red. */
  readonly box: NetBox;
}

export interface NetworkLayout {
  readonly groups: readonly NetworkGroupLayout[];
  readonly pointR: number;
}

/** Redes montadas siempre, para que el árbol no cambie entre rondas. */
export const NETWORK_GROUP_SLOTS = 2;
/** Puntos montados siempre por columna. */
export const NETWORK_POINT_SLOTS = 6;

const PAD = 24;

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la flecha se colgaría desde donde
 * no se ve.
 */
export function networkLayout(
  config: NetworkConfig,
  width: number,
  height: number,
): NetworkLayout {
  const grupos = Math.max(config.groups.length, 1);
  const anchoGrupo = (width - 2 * PAD) / grupos;
  const arriba = height * 0.16;
  const alto = height * 0.68;
  const pointR = Math.max(11, Math.min(20, alto / (NETWORK_POINT_SLOTS * 3.4)));

  const groups: NetworkGroupLayout[] = [];
  for (let g = 0; g < NETWORK_GROUP_SLOTS; g++) {
    const data = config.groups[g];
    const left = PAD + anchoGrupo * g;
    const box: NetBox = { x: left, y: arriba, w: anchoGrupo, h: alto };
    // Las dos columnas se separan lo que deja el grupo, con aire para que la
    // flecha se vea entera y no como un guion entre dos puntos.
    const xIn = left + anchoGrupo * 0.28;
    const xOut = left + anchoGrupo * 0.72;

    const columna = (cuantos: number, x: number): Spot[] => {
      const out: Spot[] = [];
      const paso = alto / (Math.max(cuantos, 1) + 1);
      for (let i = 0; i < NETWORK_POINT_SLOTS; i++) {
        out.push(
          data && i < cuantos
            ? { x, y: arriba + paso * (i + 1) }
            : // Fuera del lienzo: el árbol de la escena no cambia entre rondas.
              { x: width / 2, y: height + alto },
        );
      }
      return out;
    };

    groups.push({
      inputs: columna(data ? data.inputs.length : 0, xIn),
      outputs: columna(data ? data.outputs.length : 0, xOut),
      lamp: { x: left + anchoGrupo / 2, y: arriba - pointR * 0.9 },
      rule: { x: left + anchoGrupo / 2, y: arriba - pointR * 2.4 },
      box,
    });
  }
  return { groups, pointR };
}

// --- Piezas ------------------------------------------------------------------

/**
 * Una cadena de glifos del atlas, centrada. Sale del mismo atlas que la
 * ecuación del nodo 13, así que el `−` es el U+2212 y no un guion de ASCII, que
 * no está horneado y dejaría un hueco.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  for (const c of chars) advance += getGlyph(c)?.advance ?? 0.5;
  let x = cx - (advance * size) / 2;
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

/** Una flecha entre dos puntos cualesquiera, recortada contra los dos círculos. */
function arrowBetween(
  target: SkPath,
  a: Spot,
  b: Spot,
  r: number,
  head: number,
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const largo = Math.hypot(dx, dy);
  if (largo < 1) return;
  const ux = dx / largo;
  const uy = dy / largo;
  const x0 = a.x + ux * (r + 2);
  const y0 = a.y + uy * (r + 2);
  const x1 = b.x - ux * (r + 2);
  const y1 = b.y - uy * (r + 2);
  target.moveTo(x0, y0);
  target.lineTo(x1, y1);
  // La punta: dos trazos hacia atrás, girados a los costados de la dirección.
  const px = -uy;
  const py = ux;
  target.moveTo(x1, y1);
  target.lineTo(x1 - ux * head + px * head * 0.55, y1 - uy * head + py * head * 0.55);
  target.moveTo(x1, y1);
  target.lineTo(x1 - ux * head - px * head * 0.55, y1 - uy * head - py * head * 0.55);
}

interface GroupGeom {
  readonly points: SkPath;
  readonly dark: SkPath;
  readonly digits: SkPath;
  readonly arrows: SkPath;
  readonly doubled: SkPath;
  readonly lamp: SkPath;
  readonly rule: SkPath;
  readonly frame: SkPath;
}

function buildGroup(
  config: NetworkConfig,
  group: NetworkGroup,
  l: NetworkGroupLayout,
  r: number,
): GroupGeom {
  const points = Skia.Path.Make();
  const dark = Skia.Path.Make();
  const digits = Skia.Path.Make();
  const arrows = Skia.Path.Make();
  const doubled = Skia.Path.Make();
  const lamp = Skia.Path.Make();
  const rule = Skia.Path.Make();
  const frame = Skia.Path.Make();

  const salen = (i: number): number => group.arrows.filter((a) => a.from === i).length;

  group.inputs.forEach((p, i) => {
    const spot = l.inputs[i];
    if (!spot) return;
    // El punto sin flecha queda apagado. No es un error señalado con palabras:
    // es que ese punto no va a ninguna parte, y se ve.
    (salen(i) === 0 ? dark : points).addCircle(spot.x, spot.y, r);
    if (config.numerals && p.label !== "") addGlyphs(digits, p.label, spot.x, spot.y, r * 1.15);
  });
  group.outputs.forEach((p, i) => {
    const spot = l.outputs[i];
    if (!spot) return;
    points.addCircle(spot.x, spot.y, r);
    if (config.numerals && p.label !== "") addGlyphs(digits, p.label, spot.x, spot.y, r * 1.15);
  });

  for (const a of group.arrows) {
    const desde = l.inputs[a.from];
    const hasta = l.outputs[a.to];
    if (!desde || !hasta) continue;
    // Las dos flechas de un mismo punto van al grupo que parpadea: no se marca
    // una como sobrante, porque el problema no es cuál sobra sino que sean dos.
    arrowBetween(salen(a.from) > 1 ? doubled : arrows, desde, hasta, r, r * 0.7);
  }

  if (group.arrows.some((a) => salen(a.from) > 1)) lamp.addCircle(l.lamp.x, l.lamp.y, 7);
  if (config.rule !== "") addGlyphs(rule, config.rule, l.rule.x, l.rule.y, 18);
  if (config.groups.length > 1) {
    frame.addRRect(
      Skia.RRectXY(Skia.XYWHRect(l.box.x + 6, l.box.y - 34, l.box.w - 12, l.box.h + 44), 14, 14),
    );
  }

  return { points, dark, digits, arrows, doubled, lamp, rule, frame };
}

// --- Componente --------------------------------------------------------------

/** La flecha que el dedo está colgando. `from` en -1: no hay ninguna. */
export interface NetworkDrag {
  readonly group: number;
  readonly from: number;
  readonly x: number;
  readonly y: number;
}

export interface NetworkSceneProps {
  readonly config: NetworkConfig;
  readonly layout: NetworkLayout;
  /** El latido de las flechas dobles y de la luz. */
  readonly blink: SharedValue<number>;
  /** La flecha que sigue al dedo. */
  readonly drag: SharedValue<NetworkDrag>;
  readonly appear: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. */
  readonly demo: SharedValue<number>;
  /** Qué red está elegida, o -1. */
  readonly picked: number;
}

export function NetworkScene({
  config,
  layout,
  blink,
  drag,
  appear,
  hint,
  demo,
  picked,
}: NetworkSceneProps) {
  const geoms = useMemo(
    () =>
      config.groups.map((g, i) =>
        buildGroup(config, g, layout.groups[i] as NetworkGroupLayout, layout.pointR),
      ),
    [config, layout],
  );

  return (
    <Group opacity={appear}>
      {geoms.map((g, i) => {
        const data = config.groups[i] as NetworkGroup;
        return (
          <Group key={data.id}>
            <Path
              path={g.frame}
              color={picked === i ? theme.color.accent : theme.color.line}
              style="stroke"
              strokeWidth={picked === i ? 2.5 : STROKE}
            />
            <Path path={g.rule} color={theme.color.inkDim} />
            <Path
              path={g.points}
              color={data.glow ? theme.color.accent : theme.color.ink}
              style="stroke"
              strokeWidth={2}
            />
            {/* El punto apagado sigue estando: no se borra, se apaga. */}
            <Path path={g.dark} color={theme.color.inkFaint} style="stroke" strokeWidth={2} opacity={0.4} />
            <Path path={g.digits} color={theme.color.inkDim} />
            <Path path={g.arrows} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" />
            <Blinking path={g.doubled} blink={blink} />
            <Blinking path={g.lamp} blink={blink} filled />
          </Group>
        );
      })}

      <Rubber drag={drag} layout={layout} />
      <Ghost layout={layout} demo={demo} hint={hint} />
    </Group>
  );
}

/** Lo que parpadea: las dos flechas del mismo punto, y la luz. */
function Blinking({
  path,
  blink,
  filled,
}: {
  readonly path: SkPath;
  readonly blink: SharedValue<number>;
  readonly filled?: boolean;
}) {
  const opacity = useDerivedValue(() => 0.35 + 0.65 * blink.value);
  if (filled === true) return <Path path={path} color={theme.color.warn} opacity={opacity} />;
  return (
    <Path
      path={path}
      color={theme.color.warn}
      style="stroke"
      strokeWidth={2.5}
      strokeCap="round"
      opacity={opacity}
    />
  );
}

/**
 * La flecha a medio colgar, la que sigue al dedo. Se dibuja con un solo `Path`
 * cuyo trazo se recalcula en el hilo de la interfaz: no vuelve nada a
 * JavaScript por cuadro.
 */
function Rubber({
  drag,
  layout,
}: {
  readonly drag: SharedValue<NetworkDrag>;
  readonly layout: NetworkLayout;
}) {
  const spots = useMemo(
    () => layout.groups.map((g) => g.inputs.map((s) => ({ x: s.x, y: s.y }))),
    [layout],
  );
  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const d = drag.value;
    const columna = spots[d.group];
    const desde = columna ? columna[d.from] : undefined;
    if (d.from < 0 || !desde) return p;
    p.moveTo(desde.x, desde.y);
    p.lineTo(d.x, d.y);
    return p;
  }, [spots]);
  return <Path path={path} color={theme.color.accent} style="stroke" strokeWidth={2} strokeCap="round" />;
}

/**
 * La mano fantasma. Va del primer punto de entrada al primero de salida una vez
 * y no dice nada porque no puede: la mecánica se juega sin leer.
 */
function Ghost({
  layout,
  demo,
  hint,
}: {
  readonly layout: NetworkLayout;
  readonly demo: SharedValue<number>;
  readonly hint: SharedValue<number>;
}) {
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 12);
    return p;
  }, []);
  const grupo = layout.groups[0];
  const desde = grupo?.inputs[0] ?? { x: 0, y: 0 };
  const hasta = grupo?.outputs[0] ?? { x: 0, y: 0 };
  const transform = useDerivedValue(() => {
    const t = Math.max(0, Math.min(1, demo.value));
    const e = t * t * (3 - 2 * t);
    return [
      { translateX: desde.x + (hasta.x - desde.x) * e },
      { translateY: desde.y + (hasta.y - desde.y) * e },
    ];
  }, [desde, hasta]);
  const opacity = useDerivedValue(() => hint.value * 0.45 * Math.sin(demo.value * Math.PI));
  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
    </Group>
  );
}
