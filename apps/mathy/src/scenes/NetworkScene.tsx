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
 * ## Cómo se ve
 *
 * Los puntos son fichas con volumen (canto oscuro, cara, brillo arriba a la
 * izquierda, sombra), con la cara neutra de todas las fichas del juego: un
 * punto no es de ningún equipo, es un lugar al que se llega. Las flechas son
 * trazos gruesos con una sombra debajo, para que se lean sobre el paisaje. El
 * color tiene tres trabajos y ninguno más: `warn` para las dos flechas de un
 * mismo punto y la luz (mirá acá), `ok` y oro para la flecha que se acaba de
 * colgar y dejó a su punto con exactamente una (quedó conectado, que es lo que
 * la red enseña), y nada más. El punto que el dedo agarró crece un 30 % con un
 * anillo de luz.
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
 * están todos montados y los que sobran se van del lienzo; las chispas están
 * montadas desde el principio con opacidad cero—, lo que se repite vive en un
 * solo `SkPath`, y nada vuelve al hilo de JavaScript por cuadro: la flecha que
 * sigue al dedo y el anillo del punto agarrado se derivan de un valor compartido.
 */

import { useEffect, useMemo, useRef } from "react";
import {
  BlurMask,
  DashPathEffect,
  Group,
  Path,
  Skia,
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
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { chipTone } from "../ui/Kit.tsx";
import { play } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;

/** El vidrio oscuro debajo de lo que tiene que leerse sobre el paisaje. */
const PLATE = "rgba(9, 17, 29, 0.82)";
const SHADOW = "rgba(0, 0, 0, 0.35)";
/**
 * La cara de un punto: la de todas las fichas del juego (`chipTone`), con una
 * luz un poco más clara arriba a la izquierda para que se lea redonda.
 */
const POINT = {
  edge: chipTone.edge,
  face: chipTone.top,
  light: "#44689a",
} as const;
const SETTLE = theme.spring.settle;
const LIFT = theme.spring.lift;
/** Seis chispas, como el puente del nodo 1. */
const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

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

const circleAt = (x: number, y: number, r: number): SkPath => {
  const p = Skia.Path.Make();
  p.addCircle(x, y, r);
  return p;
};

interface GroupGeom {
  /** Las partes de los puntos vivos: sombra, canto, cara, luz y brillo. */
  readonly shadows: SkPath;
  readonly edges: SkPath;
  readonly faces: SkPath;
  readonly lights: SkPath;
  readonly shines: SkPath;
  /** Los puntos sin flecha: huecos apagados, con su rótulo apagado. */
  readonly dark: SkPath;
  readonly digits: SkPath;
  readonly darkDigits: SkPath;
  readonly arrows: SkPath;
  readonly doubled: SkPath;
  readonly lamp: SkPath;
  readonly rule: SkPath;
  readonly rulePlate: SkPath;
  readonly frame: SkPath;
}

function buildGroup(
  config: NetworkConfig,
  group: NetworkGroup,
  l: NetworkGroupLayout,
  r: number,
): GroupGeom {
  const shadows = Skia.Path.Make();
  const edges = Skia.Path.Make();
  const faces = Skia.Path.Make();
  const lights = Skia.Path.Make();
  const shines = Skia.Path.Make();
  const dark = Skia.Path.Make();
  const digits = Skia.Path.Make();
  const darkDigits = Skia.Path.Make();
  const arrows = Skia.Path.Make();
  const doubled = Skia.Path.Make();
  const lamp = Skia.Path.Make();
  const rule = Skia.Path.Make();
  const rulePlate = Skia.Path.Make();
  const frame = Skia.Path.Make();

  const salen = (i: number): number => group.arrows.filter((a) => a.from === i).length;

  // Un punto con volumen, en cinco trazos compartidos por todos los puntos del
  // grupo: cuesta lo mismo con dos puntos que con doce.
  const punto = (s: Spot): void => {
    shadows.addOval(Skia.XYWHRect(s.x - r * 0.85, s.y + r * 0.7, r * 1.7, r * 0.5));
    edges.addCircle(s.x, s.y, r);
    faces.addCircle(s.x - r * 0.06, s.y - r * 0.09, r * 0.86);
    lights.addCircle(s.x - r * 0.2, s.y - r * 0.24, r * 0.55);
    shines.addOval(Skia.XYWHRect(s.x - r * 0.6, s.y - r * 0.66, r * 0.46, r * 0.28));
  };

  group.inputs.forEach((p, i) => {
    const spot = l.inputs[i];
    if (!spot) return;
    // El punto sin flecha queda apagado. No es un error señalado con palabras:
    // es que ese punto no va a ninguna parte, y se ve.
    const apagado = salen(i) === 0;
    if (apagado) dark.addCircle(spot.x, spot.y, r);
    else punto(spot);
    if (config.numerals && p.label !== "") {
      addGlyphs(apagado ? darkDigits : digits, p.label, spot.x, spot.y, r * 1.15);
    }
  });
  group.outputs.forEach((p, i) => {
    const spot = l.outputs[i];
    if (!spot) return;
    punto(spot);
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
  if (config.rule !== "") {
    const p = Skia.Path.Make();
    addGlyphs(p, config.rule, l.rule.x, l.rule.y, 18);
    rule.addPath(p);
    // El rótulo flota sobre el paisaje: lleva su vidrio oscuro debajo.
    const b = p.getBounds();
    if (b.width > 0 && b.height > 0) {
      rulePlate.addRRect(
        Skia.RRectXY(Skia.XYWHRect(b.x - 8, b.y - 6, b.width + 16, b.height + 12), 8, 8),
      );
    }
  }
  if (config.groups.length > 1) {
    frame.addRRect(
      Skia.RRectXY(Skia.XYWHRect(l.box.x + 6, l.box.y - 34, l.box.w - 12, l.box.h + 44), 16, 16),
    );
  }

  return {
    shadows,
    edges,
    faces,
    lights,
    shines,
    dark,
    digits,
    darkDigits,
    arrows,
    doubled,
    lamp,
    rule,
    rulePlate,
    frame,
  };
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
  const r = layout.pointR;

  return (
    <Group opacity={appear}>
      {geoms.map((g, i) => {
        const data = config.groups[i] as NetworkGroup;
        const elegida = picked === i;
        return (
          <Group key={data.id}>
            {/* Con dos redes, cada una en su bandeja de vidrio. La elegida se
                enciende con un borde de luz: es la que el jugador tiene. */}
            <Path path={g.frame} color="rgba(255, 255, 255, 0.05)" />
            <Path
              path={g.frame}
              color={elegida ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.12)"}
              style="stroke"
              strokeWidth={elegida ? 2.5 : 1}
            />
            <Group opacity={elegida ? 1 : 0}>
              <Path path={g.frame} color="rgba(255, 255, 255, 0.35)" style="stroke" strokeWidth={8}>
                <BlurMask blur={8} style="normal" />
              </Path>
            </Group>
            <Path path={g.rulePlate} color={PLATE} />
            <Path path={g.rule} color={theme.color.ink} />

            {/* Las flechas: sombra debajo y trazo grueso, para que se lean sobre
                el paisaje. Son de nadie: el color queda para lo que significa. */}
            <Path
              path={g.arrows}
              color={SHADOW}
              style="stroke"
              strokeWidth={7}
              strokeCap="round"
              strokeJoin="round"
            />
            <Path
              path={g.arrows}
              color={theme.color.inkDim}
              style="stroke"
              strokeWidth={3}
              strokeCap="round"
              strokeJoin="round"
            />
            <Path
              path={g.doubled}
              color={SHADOW}
              style="stroke"
              strokeWidth={7.5}
              strokeCap="round"
              strokeJoin="round"
            />
            <Blinking path={g.doubled} blink={blink} />

            {/* Los puntos, con volumen. */}
            <Path path={g.shadows} color={SHADOW}>
              <BlurMask blur={3} style="normal" />
            </Path>
            <Path path={g.edges} color={POINT.edge} />
            <Path path={g.faces} color={POINT.face} />
            <Path path={g.lights} color={POINT.light} opacity={0.55} />
            <Path path={g.shines} color="rgba(255, 255, 255, 0.32)" />
            <Path
              path={g.edges}
              color={data.glow ? chipTone.rimTop : chipTone.rim}
              style="stroke"
              strokeWidth={1.5}
            />
            {/* El punto apagado sigue estando: no se borra, se apaga. Es un
                hueco punteado, sin luz. */}
            <Path path={g.dark} color="rgba(0, 0, 0, 0.35)" />
            <Path path={g.dark} color="rgba(255, 255, 255, 0.25)" style="stroke" strokeWidth={STROKE}>
              <DashPathEffect intervals={[4, 4]} />
            </Path>
            <Path path={g.digits} color={theme.color.ink} />
            <Path path={g.darkDigits} color={theme.color.inkFaint} />
            <Blinking path={g.lamp} blink={blink} filled />
          </Group>
        );
      })}

      {Array.from({ length: NETWORK_GROUP_SLOTS }, (_, i) => (
        <Hung
          key={`colgada${i}`}
          group={config.groups[i]}
          layout={layout.groups[i] as NetworkGroupLayout}
          drawable={config.drawable}
          r={r}
        />
      ))}
      <Held drag={drag} layout={layout} />
      <Rubber drag={drag} layout={layout} />
      <Ghost layout={layout} demo={demo} hint={hint} />
    </Group>
  );
}

/** Lo que parpadea: las dos flechas del mismo punto, y la luz. Ámbar: mirá acá. */
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
  if (filled === true) {
    return (
      <Group opacity={opacity}>
        <Path path={path} color={theme.color.warn} style="stroke" strokeWidth={8} opacity={0.6}>
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={path} color={theme.color.warn} />
      </Group>
    );
  }
  return (
    <Path
      path={path}
      color={theme.color.warn}
      style="stroke"
      strokeWidth={3.5}
      strokeCap="round"
      strokeJoin="round"
      opacity={opacity}
    />
  );
}

/**
 * La flecha que se acaba de colgar, si dejó a su punto con exactamente una. Es
 * el evento que la red enseña —de ese punto sale una sola flecha, quedó
 * conectado— y se responde una vez, en la flecha y en el punto donde llegó: la
 * flecha brilla en menta y se apaga a su color, y el punto de llegada suelta
 * seis chispas menta y oro.
 *
 * La segunda flecha de un mismo punto no se celebra: esa es la ruptura, y ya
 * parpadea en ámbar. Todo está montado desde el principio con opacidad cero; la
 * flecha y el punto viven en valores compartidos que cambian una vez por evento.
 */
function Hung({
  group,
  layout,
  drawable,
  r,
}: {
  readonly group: NetworkGroup | undefined;
  readonly layout: NetworkGroupLayout;
  readonly drawable: boolean;
  readonly r: number;
}) {
  const ax = useSharedValue(0);
  const ay = useSharedValue(0);
  const bx = useSharedValue(0);
  const by = useSharedValue(0);
  const burst = useSharedValue(1);
  const previa = useRef<{ readonly id: string; readonly arrows: readonly NetworkArrow[] } | null>(null);

  useEffect(() => {
    const antes = previa.current;
    previa.current = group ? { id: group.id, arrows: group.arrows } : null;
    if (!group || !antes || !drawable || antes.id !== group.id) return;
    // Solo una flecha agregada al final de las que había: la ronda nueva, la
    // flecha doble que se saca sola y la red que llega dibujada no son eventos.
    if (group.arrows.length !== antes.arrows.length + 1) return;
    const sigue = antes.arrows.every(
      (a, i) => group.arrows[i]?.from === a.from && group.arrows[i]?.to === a.to,
    );
    if (!sigue) return;
    const nueva = group.arrows[group.arrows.length - 1];
    if (!nueva) return;
    if (group.arrows.filter((a) => a.from === nueva.from).length !== 1) return;
    const desde = layout.inputs[nueva.from];
    const hasta = layout.outputs[nueva.to];
    if (!desde || !hasta) return;
    ax.value = desde.x;
    ay.value = desde.y;
    bx.value = hasta.x;
    by.value = hasta.y;
    burst.value = 0;
    burst.value = withTiming(1, { duration: 720 });
    // La flecha encajó en su punto: clic y golpe, una vez. Corre en JS porque
    // el evento es un hecho del render, no un cuadro de la animación.
    play("fit");
  }, [group, drawable, layout, ax, ay, bx, by, burst]);

  // La flecha se rearma solo cuando cambian sus puntas, una vez por evento: el
  // brillo que se apaga es opacidad, no un trazo nuevo por cuadro.
  const line = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const dx = bx.value - ax.value;
    const dy = by.value - ay.value;
    const largo = Math.hypot(dx, dy);
    if (largo < 1) return p;
    const ux = dx / largo;
    const uy = dy / largo;
    p.moveTo(ax.value + ux * (r + 2), ay.value + uy * (r + 2));
    p.lineTo(bx.value - ux * (r + 2), by.value - uy * (r + 2));
    return p;
  }, [r]);
  const lineO = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  const ring = useMemo(() => circleAt(0, 0, r * 1.2), [r]);
  const ringAt = useDerivedValue(() => [{ translateX: bx.value }, { translateY: by.value }]);

  return (
    <Group>
      <Group opacity={lineO}>
        <Path path={line} color={theme.color.ok} style="stroke" strokeWidth={10} strokeCap="round">
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={line} color={theme.color.ok} style="stroke" strokeWidth={3.5} strokeCap="round" />
        <Group transform={ringAt}>
          <Path path={ring} color={theme.color.ok} style="stroke" strokeWidth={8}>
            <BlurMask blur={7} style="normal" />
          </Path>
        </Group>
      </Group>
      {SPARKS.map((angle, i) => (
        <Spark key={i} x={bx} y={by} angle={angle} gold={i % 2 === 1} burst={burst} from={r} />
      ))}
    </Group>
  );
}

/** Una chispa: se abre desde el punto y se apaga en lo que dura `burst`. */
function Spark({
  x,
  y,
  angle,
  gold,
  burst,
  from,
}: {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly angle: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
  readonly from: number;
}) {
  const dot = useMemo(() => circleAt(0, 0, 3.2), []);
  const t = useDerivedValue(() => {
    const d = from * 0.9 + 32 * burst.value;
    return [
      { translateX: x.value + Math.cos(angle) * d },
      { translateY: y.value + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [angle, from]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}

/**
 * El punto que el dedo agarró: un anillo de luz que crece un 30 % con un
 * resorte, y se queda mientras la flecha espera su segundo toque. Lo tenés vos.
 */
function Held({
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
  const r = layout.pointR;
  const ring = useMemo(() => circleAt(0, 0, r), [r]);
  const lift = useSharedValue(0);
  const px = useSharedValue(0);
  const py = useSharedValue(0);

  useAnimatedReaction(
    () => drag.value,
    (d, antes) => {
      const desde = d.from >= 0 ? spots[d.group]?.[d.from] : undefined;
      if (desde) {
        px.value = desde.x;
        py.value = desde.y;
      }
      const tiene = desde !== undefined;
      const tenia = antes !== null && antes.from >= 0;
      if (tiene === tenia && antes !== null && antes.from === d.from && antes.group === d.group) return;
      lift.value = withSpring(tiene ? 1 : 0, tiene ? LIFT : SETTLE);
      // Aire: el punto se despega del tablero. Soltar no suena acá: si la
      // flecha quedó colgada, suena el encaje en `Hung`; si no, no pasó nada.
      if (tiene && !tenia) runOnJS(play)("lift");
    },
    [spots],
  );

  const transform = useDerivedValue(() => [
    { translateX: px.value },
    { translateY: py.value },
    { scale: 1 + 0.3 * lift.value },
  ]);
  return (
    <Group transform={transform} opacity={lift}>
      <Path path={ring} color="rgba(255, 255, 255, 0.45)" style="stroke" strokeWidth={6}>
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={ring} color={theme.color.ink} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/**
 * La flecha a medio colgar, la que sigue al dedo. Se dibuja con un solo `Path`
 * cuyo trazo se recalcula en el hilo de la interfaz: no vuelve nada a
 * JavaScript por cuadro. Lleva una bolita en la punta, que es lo que el dedo
 * tiene agarrado.
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
  const tip = useMemo(() => circleAt(0, 0, Math.max(5, layout.pointR * 0.34)), [layout.pointR]);
  const tipAt = useDerivedValue(() => [
    { translateX: drag.value.x },
    { translateY: drag.value.y },
  ]);
  const tipO = useDerivedValue(() => (drag.value.from >= 0 ? 1 : 0));
  return (
    <>
      <Path path={path} color={SHADOW} style="stroke" strokeWidth={7} strokeCap="round" />
      <Path path={path} color={theme.color.ink} style="stroke" strokeWidth={3} strokeCap="round" />
      <Group transform={tipAt} opacity={tipO}>
        <Path path={tip} color={theme.color.ink} />
      </Group>
    </>
  );
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
  const dot = useMemo(() => circleAt(0, 0, 12), []);
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
      <Path path={dot} color={theme.color.ink} style="stroke" strokeWidth={2.5} />
    </Group>
  );
}
