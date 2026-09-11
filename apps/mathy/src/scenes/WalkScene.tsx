/**
 * El caminante y su rastro: la mecánica `slope_walker` de
 * [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * **Nueve nodos de la espina la usan** —18, 19, 21, 23, 25, 26, 29 y 44, más los
 * dos que la estrenan de costado— así que esta escena no es del nodo 18: es de
 * la mecánica. El 18 la estrena y solo necesita un terreno, un caminante y una
 * hoja con gotas; escribirla a la medida de eso obligaría a los otros ocho a
 * copiarla, que es la deuda que este repositorio ya pagó una vez.
 *
 * **Por qué es una escena nueva y no un modo de `StretchScene`.** El plano que
 * el nodo 16 le agregó a la banda dibuja rectas de ecuaciones sobre una
 * cuadrícula: es `grid_stretch` con un eje más, y lo dice su comentario. Acá el
 * objeto es otro —un caminante que ocupa una posición sobre un soporte, un
 * rastro que se va escribiendo mientras se lo arrastra, hilos que bajan a las
 * reglas y un escalón que se achica— y sobre todo tiene **gestos propios**:
 * arrastrar al caminante y recorrer el rastro con el dedo. La decisión ya
 * estaba escrita: `PipeScene` dice, en su lista de lo que todavía no dibuja,
 * que el gráfico al costado "es un objeto grande y con gestos propios; cuando
 * llegue el 18 conviene que sea su propia escena y que esta le pase el rastro".
 * Eso es exactamente lo que pasa acá.
 *
 * El invariante que la escena dibuja es doble. De la máquina hereda
 * `same_input_same_output`: sobre cada posición hay una sola altura, y el tipo
 * `GpTrace` del modelo no tiene dónde guardar dos. De la mecánica es
 * `steepness_independent_of_step_size`: el escalón puede cambiar de tamaño y la
 * cuesta no cambia, y por eso el triángulo de subida y avance vive acá aunque el
 * nodo 18 no lo encienda.
 *
 * La escena **no calcula ninguna altura**: recibe los rastros ya resueltos por
 * el nodo. Un plano que evaluara la función por su cuenta sería una segunda
 * fuente de verdad, y el punto entero del nodo 18 es que la gráfica y la máquina
 * son el mismo objeto y no dos que se parecen.
 *
 * Las tres reglas del proyecto gobiernan el archivo: modo retained (los rastros
 * y las gotas están siempre montados, los que sobran con opacidad cero), lo que
 * se repite vive en un solo `SkPath` (la cuadrícula entera es un trazo, las
 * gotas de un rastro son otro) y nada vuelve al hilo de JavaScript por cuadro:
 * el caminante, la recta vertical y el escalón se derivan de sus agujas.
 *
 * ## Los ejes de configuración y qué nodo pide cada uno
 *
 * - `window`: qué pedazo de plano se ve. Un rincón de alturas positivas en los
 *   primeros niveles del 18, las cuatro regiones desde que el caminante baja del
 *   nivel del mar.
 * - `quadrants`: las cuatro regiones teñidas apenas, para que el signo se lea
 *   sin contar. Lo pide el 18 desde su nivel 4 y lo hereda el 30.
 * - `ground`: el terreno bajo el caminante, con su línea del nivel del mar.
 *   Entero, desvaneciéndose o ausente. El 18 lo retira en `symbolic`, el 26 lo
 *   conserva hasta el final porque su caminante sigue subiendo una colina.
 * - `traces`: los rastros de la hoja. Uno en casi todos; dos en el 21 (la
 *   función y su inversa), en el 29 (la que acumula y la que mide) y en el nivel
 *   de dos rastros del 18.
 * - `walker`: dónde está el caminante y de qué está hecho. Sobre el terreno
 *   mientras el terreno está, sobre el rastro cuando ya no, fantasma cuando se
 *   lo pide con un toque largo, ausente en el nivel donde no hay caminante.
 * - `threads`: los dos hilos punteados desde la gota encendida hasta las reglas.
 *   Son el objeto que en el 18 se contrae en el par escrito.
 * - `step`: el escalón con su triángulo de subida y avance. Es el invariante de
 *   la mecánica hecho dibujo: lo estrena el 19, el 26 lo achica hasta que el
 *   triángulo es un punto y el 23 lo usa para mostrar que la cuesta crece con la
 *   altura. El 18 lo deja apagado. Con `WalkStep.rise` puesto, la subida es la
 *   que el dedo forzó: el escalón se despega y la sombra dice dónde apoyaba.
 * - `stepColor`, `stepMarks`, `stepText`, `ghostStep`: qué lleva el escalón
 *   encima. El color **codifica la cuesta** y por eso lo decide el nodo; las
 *   marcas se cuentan en las capas sin lectura y los números las reemplazan en
 *   las simbólicas; el segundo escalón es el que se superpone con el primero
 *   para ver que encajan. Todo del 19.
 * - `stairs`: la escalera de escalones iguales de la etapa `staircase`. La pide
 *   el 19: un escalón solo insinúa que la cuesta es constante, la escalera lo
 *   dice en todo el recorrido.
 * - `stretch`: la hoja de goma de `grid_stretch`. Estira la cuadrícula y lo
 *   dibujado sobre ella, y **no las dos reglas**, así que la rampa se acuesta y
 *   su cuesta medida contra la regla queda dividida por el factor. Lo pide el 19
 *   para mostrar que la pendiente es del par recta y grilla.
 * - `diagonal`: la recta `y = x` sobre la que se refleja el rastro. Es el gesto
 *   central del 21.
 * - `asymptote`: la pared a la que el rastro se acerca y nunca toca. La pide el
 *   25, y el 23 la usa acostada.
 * - `verticalLine` y `sweepAxis`: la recta que se baja con el dedo. Es el test
 *   del nivel formal del 18, de pie, y vuelve acostada en el 21: la recta
 *   vertical sobre el rastro reflejado es la horizontal sobre el original.
 * - `skin`: las cinco etapas de desvanecimiento del catálogo, de la colina a
 *   `dy/dx`. El 18 muere en `hill_walk` y `staircase`; el 19 llega a
 *   `slope_ratio` y el 26 a `derivative_notation`.
 * - `numerals`, `axisLabels`, `legend`: qué hay escrito. Sin numerales el rastro
 *   se lee por su forma, que es lo que piden las capas sin lectura.
 *
 * ## Lo que esta escena todavía no dibuja, y qué nodo lo va a pedir
 *
 * - **El zoom sobre un punto del rastro**, que en el 26 es el gesto que
 *   convierte la secante en tangente. Necesita que la ventana sea una aguja y
 *   no un dato, y conviene hacerlo cuando llegue el nodo que lo usa.
 * - **El área bajo el rastro**, que el 29 necesita para que la altura de un
 *   rastro sea la pendiente del otro. Es de `fill_accumulate` y probablemente
 *   viva en la escena de esa mecánica, pasándole el rastro a esta.
 *
 * Nada de texto rasterizado: los numerales y las letras son contornos del atlas
 * de glifos, y el `−` es el U+2212 y no un guion de ASCII.
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
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { gpHeightAt, gpJoins, gpPoints, gpTo, type GpCurve, type GpPoint, type GpTrace } from "@mathy/mechanics";
import { chipTone } from "../ui/Kit.tsx";
import { play, type Sfx } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;

/**
 * La nota de una gota es su altura: una gota más alta suena más aguda. Así el
 * rastro que el caminante escribe también se oye subir y bajar, que es lo que
 * la hoja dibuja. Dos semitonos por unidad, con techo para que no chille.
 */
const heightPitch = (y: number): number => Math.max(-12, Math.min(16, Math.round(y * 2)));

/** Suena un efecto. Desde un worklet se llama con `runOnJS`; sin audio, no suena. */
function sfx(name: Sfx, pitch = 0): void {
  play(name, { pitch });
}
/**
 * Lo que va debajo de lo que tiene que leerse, para que se lea sobre cualquier
 * paisaje: el contorno de los glifos y de los trazos que cruzan la hoja.
 */
const SHADE = "rgba(9, 17, 29, 0.9)";
/** El vidrio oscuro de la hoja: deja ver el mundo, pero lo aparta de la cuadrícula. */
const SHADE_SOFT = "rgba(9, 17, 29, 0.72)";
const GLASS = "rgba(255, 255, 255, 0.05)";
const GLASS_LINE = "rgba(255, 255, 255, 0.12)";
const GRID_LINE = "rgba(255, 255, 255, 0.08)";
/** El radio de una gota del rastro. El blanco de toque es otro y lo da el layout. */
const DROP_R = 5.5;

/** Una paleta de volumen: la luz arriba a la izquierda, el cuerpo y la sombra. */
interface Look {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
}
/** El rastro principal lleva el equipo del acento, con la misma luz que en el nodo 1. */
const TRACE: Look = { light: "#b8e2ff", base: theme.color.accent, dark: "#1f7fcf" };
/** El rastro apagado: el otro, que se distingue por el par y no por el color. */
const DIM: Look = { light: "#e4ebf4", base: theme.color.inkDim, dark: "#58697f" };
/** El caminante es de su propio material, claro y neutro: no pertenece a ningún equipo. */
const WALKER: Look = { light: "#ffffff", base: "#d6e0ec", dark: theme.color.inkFaint };

/** Rastros montados siempre, para que el árbol de la escena no cambie. */
export const WALK_TRACE_SLOTS = 2;
/** Curvas candidatas montadas siempre: las tres continuaciones del nivel 2. */
export const WALK_OPTION_SLOTS = 3;

/** Las cinco etapas de desvanecimiento de `slope_walker` en E0. */
export type WalkSkin =
  | "hill_walk"
  | "staircase"
  | "rise_run_triangle"
  | "slope_ratio"
  | "derivative_notation";

/** Qué pedazo de plano se ve, en unidades. */
export interface WalkWindow {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}

/** El terreno: se ve entero, se está yendo, o ya no está. */
export type WalkGround = "shown" | "faded" | "hidden";

/** De qué está hecho el caminante y sobre qué camina. */
export type WalkWalker = "ground" | "sheet" | "ghost" | "none";

/**
 * El escalón: cuánto avanza y desde dónde. La subida sale del rastro.
 *
 * Con `rise` puesto, la subida es la que el dedo forzó y no la que corresponde:
 * el escalón se despega del rastro y queda flotando. Es un eje del escalón y no
 * un modo de error, porque el nodo 19 lo usa como consecuencia visible y no como
 * "incorrecto".
 */
export interface WalkStep {
  readonly from: number;
  readonly run: number;
  readonly rise?: number;
}

/**
 * La escalera de escalones iguales a lo largo del rastro: la etapa `staircase`
 * del catálogo, dibujada entera y no insinuada con un escalón solo. Es lo que
 * muestra que la cuesta es la misma en todo el recorrido.
 */
export interface WalkStairs {
  readonly from: number;
  readonly run: number;
  readonly count: number;
}

/** Lo que el escalón lleva escrito: un número por tramo y la ficha de la cuesta. */
export interface WalkStepText {
  /** Bajo el tramo horizontal. */
  readonly run: string;
  /** Junto al tramo vertical. */
  readonly rise: string;
  /** Sobre la esquina: la ficha que nombra la cuesta con el color del escalón. */
  readonly label: string;
}

/**
 * Todo lo que un nodo decide sobre el caminante y su hoja. Un nodo que reusa la
 * mecánica escribe uno de estos y no toca la escena.
 */
export interface WalkConfig {
  readonly window: WalkWindow;
  /** Las cuatro regiones teñidas apenas. */
  readonly quadrants: boolean;
  readonly ground: WalkGround;
  /**
   * El perfil del terreno. Viaja aparte de los rastros a propósito: el punto de
   * ruptura del nodo 18 es que el rastro **no** es una foto del terreno, y con
   * un solo objeto para los dos el error sería cierto.
   */
  readonly terrain: GpTrace | null;
  readonly traces: readonly GpTrace[];
  /** El rastro que lleva el color principal. Los demás quedan apagados. */
  readonly mainTrace: number;
  /** Las gotas se dibujan una por una, además de la línea que las une. */
  readonly drops: boolean;
  /** La línea que une las gotas. Sin ella quedan los pares sueltos. */
  readonly line: boolean;
  readonly walker: WalkWalker;
  /**
   * La gota que va cayendo del caminante a la hoja. Se enciende solo mientras el
   * caminante está dibujando: quieta sobre una gota que ya está, señalaría la
   * respuesta de la ronda en vez de mostrar de dónde sale la tinta.
   */
  readonly ink: boolean;
  /** La gota encendida, o `null`. De ella salen los hilos. */
  readonly lit: GpPoint | null;
  readonly threads: boolean;
  /**
   * El par escrito sobre la gota encendida. Es el paso 3 de la transición, y por
   * eso es un eje aparte de `legend`: hay rondas que preguntan justamente cómo se
   * escribe esa gota, y ahí el par no se puede dibujar antes de la respuesta.
   */
  readonly label: boolean;
  /** Las gotas marcadas entre las que hay que elegir. */
  readonly marked: readonly GpPoint[];
  /** Las curvas candidatas, cada una con su color. */
  readonly options: readonly GpCurve[];
  /** La curva que hay que juzgar con la recta vertical. */
  readonly curve: GpCurve | null;
  /** La recta vertical se puede bajar con el dedo. */
  readonly verticalLine: boolean;
  /**
   * Sobre qué eje corre esa recta. Ausente vale `vertical`, que es la del test
   * del nodo 18 y lo que hacen todos los nodos que ya la usaban.
   *
   * En `horizontal` la misma recta se acuesta y se baja con el dedo sobre el
   * rastro: es el test del nodo 21, y es la misma recta por una razón y no por
   * ahorro. La recta vertical sobre el rastro reflejado **es** la horizontal
   * sobre el original, así que dibujar dos objetos distintos diría que son dos
   * pruebas distintas cuando son la misma mirada del otro lado de la diagonal.
   */
  readonly sweepAxis?: "vertical" | "horizontal";
  readonly step: WalkStep | null;
  /**
   * El color del escalón. **Codifica la cuesta**: el mismo en toda la rampa y
   * distinto en una rampa distinta. Es lo que el nodo 19 pide mirar cuando el
   * escalón se mueve y se ensancha, así que lo decide el nodo y no la escena.
   * Ausente: el color de siempre.
   */
  readonly stepColor?: string;
  /** Las marcas contadas sobre los dos tramos del escalón. */
  readonly stepMarks?: boolean;
  /** Lo que el escalón lleva escrito. Ausente: no lleva nada. */
  readonly stepText?: WalkStepText | null;
  /**
   * El segundo escalón, dibujado apagado. Es el que se superpone con el primero
   * para ver que encajan, que es el gesto del que nace la ficha `m`.
   */
  readonly ghostStep?: WalkStep | null;
  /** La escalera de escalones iguales. Ausente o nula: no hay escalera. */
  readonly stairs?: WalkStairs | null;
  /**
   * El estirado de la grilla, de `grid_stretch`.
   *
   * Multiplica la posición de todo lo que está **dibujado sobre la hoja** —la
   * cuadrícula, los rastros, el escalón, la escalera— y **no la de las dos
   * reglas**: la hoja es de goma y la regla no. Por eso la rampa se acuesta y,
   * medida contra la regla que no se estiró, su cuesta queda dividida por el
   * factor. Es la manera de mostrar que la pendiente es propiedad del par recta
   * y grilla y no del dibujo suelto. En 1, que es como lo dejan todos los demás
   * nodos, no cambia absolutamente nada.
   */
  readonly stretch?: number;
  /**
   * La cuadrícula se dibuja cuadrada: una unidad de altura mide lo mismo que una
   * de avance, y la ventana se centra en lo que sobra.
   *
   * Lo pide el 19 y es funcional, no cosmético: con unidades de distinto tamaño
   * en cada eje, una rampa que sube 3 por paso se ve igual de empinada que una
   * que sube 1, y lo empinado es el nodo entero. Los nodos que leen alturas y no
   * cuestas lo dejan apagado y se quedan con toda la caja.
   */
  readonly square?: boolean;
  /**
   * La hoja con su cuadrícula, sus ejes y sus marcas. Ausente vale `true`, que
   * es lo que hacen todos los nodos que dibujan algo sobre el plano.
   *
   * En `false` no queda nada: es la ronda que se juega **sin dibujo**, con la
   * recta escrita y nada más. La pide el 19 en su nivel de rectas escritas, y
   * una cuadrícula detrás de tres ecuaciones no es fondo, es ruido: invita a
   * leer una pendiente que no está dibujada.
   */
  readonly grid?: boolean;
  readonly diagonal: boolean;
  /** La pared a la que el rastro se acerca: horizontal o vertical, en unidades. */
  readonly asymptote: { readonly at: number; readonly vertical: boolean } | null;
  readonly skin: WalkSkin;
  readonly numerals: boolean;
  /** Los ejes llevan su letra. */
  readonly axisLabels: boolean;
  /** La leyenda escrita bajo el rastro, ya compuesta por el nodo. */
  readonly legend: string;
}

/** Un plano: dónde cae el origen y cuánto mide una unidad en cada eje. */
export interface WalkPlane {
  readonly cx: number;
  readonly cy: number;
  readonly ux: number;
  readonly uy: number;
}

export interface WalkLayout {
  readonly sheet: WalkPlane;
  /** El terreno, cuando el nodo lo dibuja. */
  readonly ground: WalkPlane | null;
  /** El radio del blanco de toque de una gota: generoso a propósito. */
  readonly touchR: number;
}

/** Dónde cae una posición y una altura, en píxeles del lienzo. */
export const walkPx = (p: WalkPlane, x: number): number => p.cx + x * p.ux;
export const walkPy = (p: WalkPlane, y: number): number => p.cy - y * p.uy;

const PAD = 30;

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la gota se tocaría donde no se ve.
 */
export function walkLayout(config: WalkConfig, width: number, height: number): WalkLayout {
  const w = config.window;
  const anchoU = Math.max(1, w.x1 - w.x0);
  const altoU = Math.max(1, w.y1 - w.y0);
  const conTerreno = config.ground !== "hidden" && config.terrain !== null;

  // El terreno se queda con la banda izquierda y la hoja con la derecha, que es
  // la superficie del documento: el caminante camina de un lado y la tinta cae
  // del otro. Sin terreno, la hoja se queda con todo el ancho.
  const util = width - (conTerreno ? 3 * PAD : 2 * PAD);
  const groundW = conTerreno ? util * 0.4 : 0;
  const sheetW = conTerreno ? util - groundW : util;
  const sheetX = width - PAD - sheetW;

  // La leyenda se escribe debajo de la ventana: con leyenda, la hoja deja lugar
  // abajo, o el renglón se corta contra el borde del lienzo cuando no hay nada
  // debajo de la escena.
  const abajo = config.legend !== "" ? PAD + 22 : PAD;
  const alto = Math.max(120, height - PAD - abajo);
  // Con la cuadrícula cuadrada las dos unidades miden lo mismo y la ventana se
  // centra en lo que sobra; si no, cada eje se estira hasta llenar su lado.
  const cruda = { ux: sheetW / anchoU, uy: alto / altoU };
  const u = config.square ? Math.min(cruda.ux, cruda.uy) : 0;
  const ux = config.square ? u : cruda.ux;
  const uy = config.square ? u : cruda.uy;
  const sheet: WalkPlane = {
    ux,
    uy,
    cx: sheetX + (sheetW - anchoU * ux) / 2 - w.x0 * ux,
    cy: PAD + (alto - altoU * uy) / 2 + w.y1 * uy,
  };

  const ground: WalkPlane | null = conTerreno
    ? {
        ux: groundW / anchoU,
        // El terreno se angosta para caber al lado de la hoja, pero **su altura
        // se mide igual**: la misma unidad y el mismo cero. Así la gota cae en
        // horizontal exacta desde el caminante y se ve que cruzar de superficie
        // no cambia la altura. Comprimirlo en vertical diría lo contrario.
        uy: alto / altoU,
        cx: PAD - w.x0 * (groundW / anchoU),
        cy: PAD + w.y1 * (alto / altoU),
      }
    : null;

  return { sheet, ground, touchR: Math.max(20, Math.min(sheet.ux * 0.5, 30)) };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Una cadena de glifos del atlas, centrada. El mismo atlas que las ecuaciones,
 * así que el `−` de una altura negativa es el mismo objeto que el de una resta.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  for (const c of chars) advance += getGlyph(c)?.advance ?? 0.5;
  let x = cx - (advance * size) / 2;
  // Los dígitos van de -0.666 em a la línea de base, así que centrarlos es bajar
  // el trazo un tercio de em.
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

/** Un numeral con el signo de la tipografía matemática y no con el de ASCII. */
export const walkNumeral = (v: number): string => (v < 0 ? `−${-v}` : String(v));

/**
 * Una cadena suelta del atlas, para lo que la actividad escribe al lado de la
 * hoja. Vive acá para que la posición preguntada se dibuje con los mismos
 * glifos que las marcas de las reglas.
 */
export function walkTextPath(text: string, cx: number, cy: number, size: number): SkPath {
  const path = Skia.Path.Make();
  addGlyphs(path, text, cx, cy, size);
  return path;
}

/**
 * La coma del par. **No sale del atlas**: el atlas se hornea con los glifos que
 * el diseño fue necesitando y todavía no tiene una, así que escribir `(3, 5)`
 * con `addGlyphs` dejaría el hueco de la trampa del guion. Se dibuja como forma
 * porque es una forma, y queda anotado que el día que el atlas la tenga esta
 * función se borra.
 */
function addComma(target: SkPath, x: number, cy: number, size: number): void {
  const y = cy + size * 0.3;
  target.addCircle(x, y, size * 0.09);
  target.moveTo(x, y);
  target.lineTo(x - size * 0.09, y + size * 0.22);
}

/**
 * Un par escrito, con sus paréntesis y su coma. Lo usan la etiqueta de la gota y
 * las fichas de la actividad, y por eso vive acá: los dos tienen que dibujar el
 * mismo objeto o el par de la ficha no sería el par del punto.
 */
export function walkPairPath(p: GpPoint, cx: number, cy: number, size: number): SkPath {
  const path = Skia.Path.Make();
  const izq = walkNumeral(p.x);
  const der = walkNumeral(p.y);
  const ancho = (s: string): number => [...s].reduce((a, c) => a + (getGlyph(c)?.advance ?? 0.5), 0);
  const total = ancho("(") + ancho(izq) + 0.35 + ancho(der) + ancho(")");
  let x = cx - (total * size) / 2;
  const poner = (s: string): void => {
    addGlyphs(path, s, x + (ancho(s) * size) / 2, cy, size);
    x += ancho(s) * size;
  };
  poner("(");
  poner(izq);
  addComma(path, x + size * 0.1, cy, size);
  x += 0.35 * size;
  poner(der);
  poner(")");
  return path;
}

// --- Geometría ---------------------------------------------------------------

/** Una línea punteada, dibujada como segmentos: el hilo y la diagonal la usan. */
function dashed(target: SkPath, x0: number, y0: number, x1: number, y1: number, dash = 6): void {
  const largo = Math.hypot(x1 - x0, y1 - y0);
  if (largo < 1) return;
  const pasos = Math.max(1, Math.floor(largo / (dash * 2)));
  for (let i = 0; i < pasos; i++) {
    const a = i / pasos;
    const b = (i + 0.55) / pasos;
    target.moveTo(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a);
    target.lineTo(x0 + (x1 - x0) * b, y0 + (y1 - y0) * b);
  }
}

/**
 * La cuadrícula y los dos ejes con sus marcas.
 *
 * La cuadrícula se estira con la hoja y los ejes no: son la regla, y una regla
 * de goma no mediría nada. Con el estirado en 1 las dos cosas coinciden y no se
 * nota, que es como lo dejan todos los nodos menos el 19.
 */
function buildGrid(config: WalkConfig, p: WalkPlane): { grid: SkPath; axes: SkPath; ticks: SkPath } {
  const w = config.window;
  const k = config.stretch ?? 1;
  const grid = Skia.Path.Make();
  const axes = Skia.Path.Make();
  const ticks = Skia.Path.Make();

  for (let x = Math.ceil(w.x0); x <= w.x1; x++) {
    const at = x * k;
    if (at < w.x0 || at > w.x1) continue;
    grid.moveTo(walkPx(p, at), walkPy(p, w.y0));
    grid.lineTo(walkPx(p, at), walkPy(p, w.y1));
  }
  for (let y = Math.ceil(w.y0); y <= w.y1; y++) {
    grid.moveTo(walkPx(p, w.x0), walkPy(p, y));
    grid.lineTo(walkPx(p, w.x1), walkPy(p, y));
  }

  // Los ejes son las dos reglas del documento: se dibujan donde está el cero, o
  // contra el borde cuando el cero quedó afuera de la ventana.
  const ejeY = Math.min(Math.max(0, w.y0), w.y1);
  const ejeX = Math.min(Math.max(0, w.x0), w.x1);
  axes.moveTo(walkPx(p, w.x0), walkPy(p, ejeY));
  axes.lineTo(walkPx(p, w.x1), walkPy(p, ejeY));
  axes.moveTo(walkPx(p, ejeX), walkPy(p, w.y0));
  axes.lineTo(walkPx(p, ejeX), walkPy(p, w.y1));

  for (let x = Math.ceil(w.x0); x <= w.x1; x++) {
    ticks.moveTo(walkPx(p, x), walkPy(p, ejeY) - 5);
    ticks.lineTo(walkPx(p, x), walkPy(p, ejeY) + 5);
  }
  for (let y = Math.ceil(w.y0); y <= w.y1; y++) {
    ticks.moveTo(walkPx(p, ejeX) - 5, walkPy(p, y));
    ticks.lineTo(walkPx(p, ejeX) + 5, walkPy(p, y));
  }
  return { grid, axes, ticks };
}

/** Los numerales de las dos reglas y las letras de los ejes. */
function buildAxisText(config: WalkConfig, p: WalkPlane): SkPath {
  const path = Skia.Path.Make();
  const w = config.window;
  const ejeY = Math.min(Math.max(0, w.y0), w.y1);
  const ejeX = Math.min(Math.max(0, w.x0), w.x1);
  const size = Math.min(p.ux * 0.6, 14);

  if (config.numerals) {
    for (let x = Math.ceil(w.x0); x <= w.x1; x++) {
      if (x === 0) continue;
      addGlyphs(path, walkNumeral(x), walkPx(p, x), walkPy(p, ejeY) + 15, size);
    }
    for (let y = Math.ceil(w.y0); y <= w.y1; y++) {
      if (y === 0) continue;
      addGlyphs(path, walkNumeral(y), walkPx(p, ejeX) - 16, walkPy(p, y), size);
    }
  }
  if (config.axisLabels) {
    addGlyphs(path, "x", walkPx(p, w.x1) - 6, walkPy(p, ejeY) - 14, 18);
    addGlyphs(path, "y", walkPx(p, ejeX) + 14, walkPy(p, w.y1) + 8, 18);
  }
  return path;
}

/**
 * Las cuatro regiones teñidas apenas. No son decoración: con ellas el signo del
 * par se lee sin contar marcas, que es una de las tres capacidades del nodo.
 */
function buildQuadrants(w: WalkWindow, p: WalkPlane): readonly SkPath[] {
  const rect = (x0: number, y0: number, x1: number, y1: number): SkPath => {
    const path = Skia.Path.Make();
    if (x1 <= x0 || y1 <= y0) return path;
    path.addRect(
      Skia.XYWHRect(
        walkPx(p, x0),
        walkPy(p, y1),
        (x1 - x0) * p.ux,
        (y1 - y0) * p.uy,
      ),
    );
    return path;
  };
  return [
    rect(0, 0, w.x1, w.y1),
    rect(w.x0, 0, 0, w.y1),
    rect(w.x0, w.y0, 0, 0),
    rect(0, w.y0, w.x1, 0),
  ];
}

/** Un rastro dibujado: la línea, las gotas y el brillo de las gotas. */
interface TraceGeom {
  readonly line: SkPath;
  readonly drops: SkPath;
  /** El brillo de cada gota, arriba a la izquierda: todas en un solo trazo. */
  readonly shine: SkPath;
}

/** La línea de un rastro y sus gotas, cada cosa en un trazo. */
function buildTrace(trace: GpTrace, p: WalkPlane, k = 1): TraceGeom {
  const line = Skia.Path.Make();
  const drops = Skia.Path.Make();
  const shine = Skia.Path.Make();
  for (let x = trace.from; x < gpTo(trace); x++) {
    if (!gpJoins(trace, x)) continue;
    const a = gpHeightAt(trace, x);
    const b = gpHeightAt(trace, x + 1);
    if (a === null || b === null) continue;
    line.moveTo(walkPx(p, x * k), walkPy(p, a));
    line.lineTo(walkPx(p, (x + 1) * k), walkPy(p, b));
  }
  for (const punto of gpPoints(trace)) {
    const x = walkPx(p, punto.x * k);
    const y = walkPy(p, punto.y);
    drops.addCircle(x, y, DROP_R);
    shine.addCircle(x - DROP_R * 0.32, y - DROP_R * 0.36, DROP_R * 0.34);
  }
  return { line, drops, shine };
}

/** Una curva cualquiera, con su cierre si se cierra. */
function buildCurve(curve: GpCurve, p: WalkPlane): SkPath {
  const path = Skia.Path.Make();
  const puntos = curve.points;
  const primero = puntos[0];
  if (!primero) return path;
  path.moveTo(walkPx(p, primero.x), walkPy(p, primero.y));
  for (let i = 1; i < puntos.length; i++) {
    const q = puntos[i] as GpPoint;
    path.lineTo(walkPx(p, q.x), walkPy(p, q.y));
  }
  if (curve.closed) path.close();
  return path;
}

/**
 * El terreno: el perfil relleno hasta el pie del dibujo, con su línea del nivel
 * del mar. Es lo único que el caminante pisa, y por eso se dibuja como suelo y
 * no como línea: una línea sería otro rastro y el nodo estaría diciendo que son
 * lo mismo.
 */
function buildGround(
  terrain: GpTrace,
  w: WalkWindow,
  p: WalkPlane,
): { body: SkPath; sea: SkPath; ridge: SkPath; top: number; foot: number } {
  const body = Skia.Path.Make();
  const sea = Skia.Path.Make();
  // El borde de arriba, solo: donde pisa el caminante. Lleva la luz, y por eso
  // va aparte del cuerpo, que también tiene lados y pie.
  const ridge = Skia.Path.Make();
  const pie = walkPy(p, w.y0);
  let abierto = false;
  for (let x = terrain.from; x <= gpTo(terrain); x++) {
    const y = gpHeightAt(terrain, x);
    if (y === null) {
      // Una posición sin altura es un pozo sin fondo: el suelo se corta.
      if (abierto) {
        body.lineTo(walkPx(p, x - 1), pie);
        body.close();
        abierto = false;
      }
      continue;
    }
    if (!abierto) {
      body.moveTo(walkPx(p, x), pie);
      ridge.moveTo(walkPx(p, x), walkPy(p, y));
      abierto = true;
    } else {
      ridge.lineTo(walkPx(p, x), walkPy(p, y));
    }
    body.lineTo(walkPx(p, x), walkPy(p, y));
    if (!gpJoins(terrain, x) && x < gpTo(terrain)) {
      body.lineTo(walkPx(p, x), pie);
      body.close();
      abierto = false;
    }
  }
  if (abierto) {
    body.lineTo(walkPx(p, gpTo(terrain)), pie);
    body.close();
  }
  sea.moveTo(walkPx(p, w.x0), walkPy(p, 0));
  sea.lineTo(walkPx(p, w.x1), walkPy(p, 0));
  return { body, sea, ridge, top: walkPy(p, w.y1), foot: pie };
}

/**
 * Un escalón apoyado contra el rastro, con todo lo que lleva encima.
 *
 * El cuerpo son los dos tramos, el horizontal y el vertical. La esquina de
 * abajo siempre está sobre el rastro; la de arriba está sobre el rastro **solo
 * si la subida es la que corresponde**, y cuando el nodo la fuerza el escalón
 * queda flotando con su sombra abajo. Que se despegue no es un error dibujado:
 * es la consecuencia visible de la que habla el documento del nodo 19.
 *
 * Además del trazo devuelve la cuña rellena (el mismo triángulo, para que el
 * escalón sea una pieza y no un contorno sobre el paisaje), la esquina que quedó
 * en el aire como trazo propio —late en ámbar, porque es lo que hay que bajar— y
 * dónde está la esquina de arriba, que es de donde salen las chispas cuando el
 * escalón vuelve a apoyar.
 */
interface StepGeom {
  readonly body: SkPath;
  readonly fill: SkPath;
  readonly shadow: SkPath;
  readonly corner: SkPath;
  readonly marks: SkPath;
  readonly text: SkPath;
  /** La esquina de arriba, en píxeles del lienzo; `null` sin escalón. */
  readonly top: { readonly x: number; readonly y: number } | null;
  /** La esquina de arriba está sobre el rastro. Sin escalón, vale `true`. */
  readonly apoya: boolean;
}

function buildStep(config: WalkConfig, p: WalkPlane, s: WalkStep | null, k: number): StepGeom {
  const body = Skia.Path.Make();
  const fill = Skia.Path.Make();
  const shadow = Skia.Path.Make();
  const corner = Skia.Path.Make();
  const marks = Skia.Path.Make();
  const text = Skia.Path.Make();
  const vacio: StepGeom = { body, fill, shadow, corner, marks, text, top: null, apoya: true };
  const trace = config.traces[config.mainTrace];
  if (!s || !trace) return vacio;

  const y0 = gpHeightAt(trace, s.from);
  const debido = gpHeightAt(trace, s.from + s.run);
  if (y0 === null || debido === null) return vacio;
  const subida = s.rise ?? debido - y0;
  const apoya = Math.abs(subida - (debido - y0)) < 1e-9;

  const ax = walkPx(p, s.from * k);
  const ay = walkPy(p, y0);
  const bx = walkPx(p, (s.from + s.run) * k);
  const by = walkPy(p, y0 + subida);

  const ele = (target: SkPath, top: number): void => {
    target.moveTo(ax, ay);
    target.lineTo(bx, ay);
    target.lineTo(bx, top);
  };
  ele(body, by);
  // La hipotenusa cierra el triángulo salvo en la etapa de la escalera, donde
  // el escalón es un escalón y no un triángulo. Por la misma razón la cuña
  // rellena existe solo cuando hay triángulo: rellenar una ele la cerraría sola.
  if (config.skin !== "staircase") {
    body.lineTo(ax, ay);
    fill.moveTo(ax, ay);
    fill.lineTo(bx, ay);
    fill.lineTo(bx, by);
    fill.close();
  }
  if (!apoya) {
    ele(shadow, walkPy(p, debido));
    // Y la esquina que quedó en el aire, marcada: es lo que hay que bajar.
    corner.addCircle(bx, by, 9);
  }

  if (config.stepMarks) {
    // Una marca por unidad en cada tramo: contarlas es medir, y es lo que el
    // nivel de las capas sin lectura hace en vez de leer un número.
    const pasos = Math.max(1, Math.round(Math.abs(s.run)));
    for (let i = 1; i < pasos; i++) {
      const x = ax + ((bx - ax) * i) / pasos;
      marks.moveTo(x, ay - 5);
      marks.lineTo(x, ay + 5);
    }
    const altos = Math.max(1, Math.round(Math.abs(subida)));
    for (let i = 1; i < altos; i++) {
      const y = ay + ((by - ay) * i) / altos;
      marks.moveTo(bx - 5, y);
      marks.lineTo(bx + 5, y);
    }
  }

  const t = config.stepText;
  if (t) {
    // El avance va bajo su tramo y la subida al costado del suyo: cada número
    // pegado al tramo que cuenta, que es el paso 1 de la transición simbólica.
    addGlyphs(text, t.run, (ax + bx) / 2, ay + (subida >= 0 ? 18 : -18), 16);
    addGlyphs(text, t.rise, bx + 20, (ay + by) / 2, 16);
    // La ficha de la cuesta va sobre la esquina de arriba, que es la que las dos
    // medidas comparten: al costado se le monta encima al eje cuando el escalón
    // apoya cerca del cero.
    if (t.label !== "") addGlyphs(text, t.label, bx + 18, by - 16, 20);
  }
  return { body, fill, shadow, corner, marks, text, top: { x: bx, y: by }, apoya };
}

/** Las partes del caminante, todas sobre su propio origen: sus pies. */
interface WalkerParts {
  readonly head: SkPath;
  readonly torso: SkPath;
  /** Brazos y piernas: un solo trazo grueso. */
  readonly limbs: SkPath;
  readonly shine: SkPath;
  readonly shadow: SkPath;
}

/**
 * El caminante: cabeza y torso con volumen, brazos y piernas de trazo grueso, y
 * su sombra en el piso. Antes era un muñeco de palitos de trazo fino, que sobre
 * el paisaje se perdía. Sin cara, nunca: la única cara del juego es la de Lumi.
 */
function walkerParts(r: number): WalkerParts {
  const head = Skia.Path.Make();
  head.addCircle(0, -r * 2.1, r * 0.62);
  const torso = Skia.Path.Make();
  torso.addRRect(
    Skia.RRectXY(Skia.XYWHRect(-r * 0.36, -r * 1.55, r * 0.72, r * 1.05), r * 0.36, r * 0.36),
  );
  const limbs = Skia.Path.Make();
  limbs.moveTo(-r * 0.62, -r * 1.22);
  limbs.lineTo(r * 0.62, -r * 1.22);
  limbs.moveTo(-r * 0.14, -r * 0.62);
  limbs.lineTo(-r * 0.45, 0);
  limbs.moveTo(r * 0.14, -r * 0.62);
  limbs.lineTo(r * 0.45, 0);
  const shine = Skia.Path.Make();
  shine.addOval(Skia.XYWHRect(-r * 0.44, -r * 2.52, r * 0.42, r * 0.26));
  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(-r * 0.85, -r * 0.16, r * 1.7, r * 0.34));
  return { head, torso, limbs, shine, shadow };
}

/**
 * La hoja: un vidrio oscuro debajo de la cuadrícula. Sobre el paisaje una
 * cuadrícula de trazo fino se perdía y los numerales dejaban de leerse; con el
 * vidrio debajo, la hoja se lee igual sobre cualquier mundo. Es una superficie y
 * no un objeto: no lleva sombra ni brillo. El margen alcanza para los numerales
 * de las dos reglas, que caen afuera de la ventana cuando el cero queda en el
 * borde.
 */
function buildPanel(config: WalkConfig, p: WalkPlane): SkPath {
  const path = Skia.Path.Make();
  const w = config.window;
  const x0 = walkPx(p, w.x0) - 24;
  const x1 = walkPx(p, w.x1) + 16;
  const y0 = walkPy(p, w.y1) - 16;
  const y1 = walkPy(p, w.y0) + 22;
  path.addRRect(Skia.RRectXY(Skia.XYWHRect(x0, y0, x1 - x0, y1 - y0), 16, 16));
  return path;
}

// --- Componente --------------------------------------------------------------

export interface WalkSceneProps {
  readonly config: WalkConfig;
  readonly layout: WalkLayout;
  /** Dónde está el caminante, en posiciones. */
  readonly at: SharedValue<number>;
  /** A qué altura está. La deriva el nodo desde su propio rastro. */
  readonly height: SharedValue<number>;
  /** Dónde está la recta vertical, en posiciones. */
  readonly sweep: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  /** La opción elegida, o -1. */
  readonly picked: number;
  readonly appear: SharedValue<number>;
}

/**
 * Los colores de las curvas candidatas. Se eligen tocando y no leyendo, así que
 * cada una tiene que distinguirse de las otras dos **y del rastro**: el acento
 * es el color del rastro y una candidata de ese color se leería como su
 * continuación verdadera antes de que el jugador decida.
 *
 * Son equipos (coral, violeta) y tinta, no `ok` ni `warn`: una candidata menta
 * se leía como "la que coincide" y una ámbar como "la que está mal" antes de
 * elegir, que es justo lo que la ronda pregunta.
 */
export const WALK_OPTION_COLORS: readonly string[] = [
  theme.color.coral,
  theme.color.violet,
  theme.color.ink,
];

/**
 * Cuánta luz lleva cada región, en el orden de `buildQuadrants`: arriba a la
 * derecha, arriba a la izquierda, abajo a la izquierda, abajo a la derecha.
 * La luz dice cuántas coordenadas son negativas —ninguna, una o las dos— y así
 * el signo del par se lee sin contar marcas y sin gastar dos colores que en el
 * juego significan otra cosa.
 */
const QUAD_LIGHT: readonly number[] = [0.07, 0.03, 0, 0.03];

/** Lo que la escena recuerda de la configuración anterior, para ver qué pasó. */
interface Previo {
  readonly clave: string;
  readonly gotas: ReadonlySet<string>;
  readonly ink: boolean;
  readonly label: boolean;
  readonly line: boolean;
  readonly count: number;
  readonly lit: string;
  readonly escalon: boolean;
  readonly from: number | null;
  readonly apoya: boolean;
}

/** El rastro entero como texto: si cambia, cambió la ronda y no el estado. */
const claveDe = (t: GpTrace): string => `${t.from}|${t.heights.join(",")}`;

export function WalkScene({
  config,
  layout,
  at,
  height,
  sweep,
  hint,
  demo,
  picked,
  appear,
}: WalkSceneProps) {
  const sheet = layout.sheet;
  const conHoja = config.grid !== false;
  const grid = useMemo(
    () =>
      conHoja
        ? buildGrid(config, sheet)
        : { grid: Skia.Path.Make(), axes: Skia.Path.Make(), ticks: Skia.Path.Make() },
    [conHoja, config, sheet],
  );
  const axisText = useMemo(
    () => (conHoja ? buildAxisText(config, sheet) : Skia.Path.Make()),
    [conHoja, config, sheet],
  );
  const quadrants = useMemo(
    () => (config.quadrants && conHoja ? buildQuadrants(config.window, sheet) : []),
    [config.quadrants, conHoja, config.window, sheet],
  );
  const panel = useMemo(
    () => (conHoja ? buildPanel(config, sheet) : Skia.Path.Make()),
    [conHoja, config, sheet],
  );

  const stretch = config.stretch ?? 1;
  const traces = useMemo(
    () => config.traces.map((t) => buildTrace(t, sheet, stretch)),
    [config.traces, sheet, stretch],
  );

  const ground = useMemo(
    () =>
      layout.ground && config.terrain
        ? buildGround(config.terrain, config.window, layout.ground)
        : null,
    [layout.ground, config.terrain, config.window],
  );

  const marked = useMemo(() => {
    const path = Skia.Path.Make();
    for (const punto of config.marked) {
      path.addCircle(walkPx(sheet, punto.x), walkPy(sheet, punto.y), 11);
    }
    return path;
  }, [config.marked, sheet]);

  const options = useMemo(
    () => config.options.map((c) => buildCurve(c, sheet)),
    [config.options, sheet],
  );

  const curve = useMemo(
    () => (config.curve ? buildCurve(config.curve, sheet) : Skia.Path.Make()),
    [config.curve, sheet],
  );

  /** El halo de la gota encendida. Se ilumina, se toque o se lea. */
  const litGeom = useMemo(() => {
    const path = Skia.Path.Make();
    if (!config.lit) return path;
    path.addCircle(walkPx(sheet, config.lit.x), walkPy(sheet, config.lit.y), 10);
    return path;
  }, [config.lit, sheet]);

  /**
   * Los dos hilos punteados desde la gota encendida hasta las reglas, con la
   * marca leída en cada extremo. Son el objeto que después se contrae en el par.
   */
  const threads = useMemo(() => {
    const path = Skia.Path.Make();
    const marcas = Skia.Path.Make();
    const punto = config.lit;
    if (!punto || !config.threads) return { path, marcas };
    const w = config.window;
    const ejeY = Math.min(Math.max(0, w.y0), w.y1);
    const ejeX = Math.min(Math.max(0, w.x0), w.x1);
    dashed(path, walkPx(sheet, punto.x), walkPy(sheet, punto.y), walkPx(sheet, punto.x), walkPy(sheet, ejeY));
    dashed(path, walkPx(sheet, punto.x), walkPy(sheet, punto.y), walkPx(sheet, ejeX), walkPy(sheet, punto.y));
    marcas.moveTo(walkPx(sheet, punto.x), walkPy(sheet, ejeY) - 9);
    marcas.lineTo(walkPx(sheet, punto.x), walkPy(sheet, ejeY) + 9);
    marcas.moveTo(walkPx(sheet, ejeX) - 9, walkPy(sheet, punto.y));
    marcas.lineTo(walkPx(sheet, ejeX) + 9, walkPy(sheet, punto.y));
    return { path, marcas };
  }, [config.lit, config.threads, config.window, sheet]);

  /** La etiqueta del par sobre la gota encendida. */
  const pairLabel = useMemo(() => {
    if (!config.lit || !config.label) return Skia.Path.Make();
    return walkPairPath(config.lit, walkPx(sheet, config.lit.x), walkPy(sheet, config.lit.y) - 22, 17);
  }, [config.lit, config.label, sheet]);

  const legend = useMemo(() => {
    const path = Skia.Path.Make();
    if (config.legend === "") return path;
    const w = config.window;
    addGlyphs(
      path,
      config.legend,
      (walkPx(sheet, w.x0) + walkPx(sheet, w.x1)) / 2,
      walkPy(sheet, w.y0) + 26,
      20,
    );
    return path;
  }, [config.legend, config.window, sheet]);

  /** La diagonal `y = x` y la pared del asíntota, punteadas las dos. */
  const guides = useMemo(() => {
    const path = Skia.Path.Make();
    const w = config.window;
    if (config.diagonal) {
      const lo = Math.max(w.x0, w.y0);
      const hi = Math.min(w.x1, w.y1);
      dashed(path, walkPx(sheet, lo), walkPy(sheet, lo), walkPx(sheet, hi), walkPy(sheet, hi));
    }
    const a = config.asymptote;
    if (a) {
      if (a.vertical) dashed(path, walkPx(sheet, a.at), walkPy(sheet, w.y0), walkPx(sheet, a.at), walkPy(sheet, w.y1));
      else dashed(path, walkPx(sheet, w.x0), walkPy(sheet, a.at), walkPx(sheet, w.x1), walkPy(sheet, a.at));
    }
    return path;
  }, [config.diagonal, config.asymptote, config.window, sheet]);

  /**
   * El escalón con su triángulo de subida y avance: el invariante de la mecánica
   * hecho dibujo. La subida sale del rastro y no de una cuenta de la escena,
   * salvo cuando el nodo la fuerza: ahí el escalón se despega y la sombra
   * muestra dónde tendría que apoyar.
   *
   * Devuelve varios trazos y no uno porque cada uno se pinta distinto: el
   * cuerpo lleva el color de la cuesta, la sombra va apagada, las marcas se
   * cuentan y los números se leen. Juntos serían un solo color.
   */
  const step = useMemo(
    () => buildStep(config, sheet, config.step, config.stretch ?? 1),
    [config, sheet],
  );

  /**
   * El segundo escalón, apagado. Es el que se superpone con el primero para ver
   * que encajan, que es el gesto del que nace la ficha de la cuesta.
   */
  const ghostStep = useMemo(
    () => buildStep(config, sheet, config.ghostStep ?? null, config.stretch ?? 1),
    [config, sheet],
  );

  /**
   * La escalera de escalones iguales. Es lo que muestra que la cuesta es la
   * misma en todo el recorrido: un solo escalón lo insinúa, la escalera lo dice.
   */
  const stairs = useMemo(() => {
    const path = Skia.Path.Make();
    const st = config.stairs;
    const trace = config.traces[config.mainTrace];
    if (!st || !trace) return path;
    const k = config.stretch ?? 1;
    for (let i = 0; i < st.count; i++) {
      const desde = st.from + i * st.run;
      const y0 = gpHeightAt(trace, desde);
      const y1 = gpHeightAt(trace, desde + st.run);
      if (y0 === null || y1 === null) continue;
      path.moveTo(walkPx(sheet, desde * k), walkPy(sheet, y0));
      path.lineTo(walkPx(sheet, (desde + st.run) * k), walkPy(sheet, y0));
      path.lineTo(walkPx(sheet, (desde + st.run) * k), walkPy(sheet, y1));
    }
    return path;
  }, [config.stairs, config.traces, config.mainTrace, config.stretch, sheet]);

  // --- El latido de lo que pide atención --------------------------------------

  // Las gotas entre las que hay que elegir y la esquina que quedó en el aire
  // laten en ámbar: "mirá acá", sin decir "mal". El latido es de la escena y no
  // de la demostración, porque `hint` se apaga cuando el jugador ya jugó y lo
  // que pide atención la sigue pidiendo.
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(pulse);
  }, [pulse]);
  const attentionO = useDerivedValue(() => 0.4 + 0.6 * pulse.value);

  // --- El evento que la escena enseña ----------------------------------------

  /**
   * Una sola respuesta montada para toda la escena, que se mueve a donde pasó
   * el evento: una gota que el caminante acaba de escribir, el par que se
   * acaba de nombrar, el escalón que volvió a apoyar. Montada desde el principio
   * con opacidad cero, como pide el modo retained.
   */
  const burst = useSharedValue(1);
  const bx = useSharedValue(0);
  const by = useSharedValue(0);
  /** El destello de cada rastro: cuando se dibuja entero o cuando aparece. */
  const flash0 = useSharedValue(1);
  const flash1 = useSharedValue(1);
  const flashes = useMemo(() => [flash0, flash1], [flash0, flash1]);
  const previo = useRef<Previo | null>(null);

  useEffect(() => {
    const k = config.stretch ?? 1;
    const main = config.traces[config.mainTrace];
    const puntos = main ? gpPoints(main) : [];
    const ahora: Previo = {
      clave: main ? claveDe(main) : "",
      gotas: new Set(puntos.map((q) => `${q.x}:${q.y}`)),
      ink: config.ink,
      label: config.label,
      line: config.line,
      count: config.traces.length,
      lit: config.lit ? `${config.lit.x}:${config.lit.y}` : "",
      escalon: config.step !== null,
      from: config.step?.from ?? null,
      apoya: step.apoya,
    };
    const antes = previo.current;
    previo.current = ahora;
    if (!antes) return;

    const chispas = (x: number, y: number): void => {
      bx.value = x;
      by.value = y;
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
    };
    const destello = (i: number): void => {
      const f = flashes[i];
      if (!f) return;
      f.value = 0;
      f.value = withTiming(1, { duration: 720 });
    };

    // 1. El caminante llegó a una posición y la hoja escribió su gota. Solo si
    // la hoja creció —las gotas de antes siguen ahí y hay una o dos nuevas—: una
    // ronda nueva reemplaza la hoja entera y eso no es un evento, es otra hoja.
    if (antes.ink && main) {
      let siguen = true;
      for (const g of antes.gotas) {
        if (!ahora.gotas.has(g)) {
          siguen = false;
          break;
        }
      }
      const nuevas = puntos.filter((q) => !antes.gotas.has(`${q.x}:${q.y}`));
      if (siguen && nuevas.length >= 1 && nuevas.length <= 3) {
        // Si el dedo cruzó dos posiciones de golpe, la chispa va en la que está
        // más cerca del caminante: es la que acaba de caer.
        const donde = at.value;
        let gota = nuevas[0] as GpPoint;
        for (const q of nuevas) if (Math.abs(q.x - donde) < Math.abs(gota.x - donde)) gota = q;
        chispas(walkPx(sheet, gota.x * k), walkPy(sheet, gota.y));
        // La gota cae en la hoja: madera, con la nota de su altura.
        sfx("drop", heightPitch(gota.y));
      }
    }

    const mismaHoja = antes.clave === ahora.clave;

    // 2. El par se escribió sobre la gota encendida: la ronda que pedía leerlo
    // se resolvió. La chispa sale de la gota que se nombró.
    if (mismaHoja && !antes.label && ahora.label && config.lit && antes.lit === ahora.lit) {
      chispas(walkPx(sheet, config.lit.x), walkPy(sheet, config.lit.y));
      // El par y la gota son lo mismo: vidrio.
      sfx("join");
    }

    // 3. La línea que une las gotas apareció: el rastro se dibujó entero.
    if (mismaHoja && !antes.line && ahora.line) {
      destello(config.mainTrace);
      sfx("join");
    }

    // 4. Apareció un rastro más sobre la misma hoja: el reflejado del nodo 21.
    if (mismaHoja && ahora.count > antes.count) {
      sfx("join");
      for (let i = antes.count; i < ahora.count; i++) destello(i);
    }

    // 5. El escalón que flotaba volvió a apoyar en el mismo lugar: la subida es
    // otra vez la que corresponde, que es lo que el nodo 19 enseña.
    if (
      mismaHoja &&
      antes.escalon &&
      !antes.apoya &&
      ahora.apoya &&
      antes.from === ahora.from &&
      step.top
    ) {
      chispas(step.top.x, step.top.y);
      // El escalón vuelve a apoyar en el rastro: encaja.
      sfx("fit");
    }
  }, [config, sheet, step, flashes, burst, bx, by, at]);

  // --- Lo que se mueve -------------------------------------------------------

  const walkerR = Math.min(sheet.ux * 0.5, 13);
  const walker = useMemo(() => walkerParts(walkerR), [walkerR]);
  const plano = config.walker === "ground" && layout.ground ? layout.ground : sheet;

  /**
   * El caminante crece mientras se mueve y rebota una vez cuando se queda
   * quieto: "lo tenés vos" y "llegó a un lugar". La escena no sabe si lo lleva
   * el dedo, pero sabe si se movió, y lo mira en el hilo de la interfaz: cada
   * cambio de posición vuelve a levantarlo, y cuando deja de cambiar se asienta
   * con el resorte de caer.
   */
  const lift = useSharedValue(0);
  useAnimatedReaction(
    () => at.value,
    (cur, prev) => {
      if (prev === null || cur === prev) return;
      // El primer paso lo levanta: aire, una vez por arrastre.
      if (lift.value < 0.05) runOnJS(sfx)("lift", 0);
      lift.value = withSequence(
        withTiming(1, { duration: 90 }),
        withDelay(160, withSpring(0, theme.spring.settle)),
      );
    },
  );
  const walkerT = useDerivedValue(() => [
    { translateX: plano.cx + at.value * plano.ux },
    { translateY: plano.cy - height.value * plano.uy },
    { scale: 1 + 0.3 * lift.value },
  ]);
  const walkerO = useDerivedValue(() => {
    if (config.walker === "none") return 0;
    return config.walker === "ghost" ? 0.4 : 1;
  }, [config.walker]);

  /**
   * La gota que cae del caminante a la hoja: el mismo alto, del otro lado. Es
   * la única pieza que une las dos superficies, y por eso se dibuja en horizontal
   * exacta: cualquier inclinación diría que la altura cambió al cruzar.
   */
  const inkT = useDerivedValue(() => [
    { translateX: sheet.cx + at.value * sheet.ux },
    { translateY: sheet.cy - height.value * sheet.uy },
  ]);
  const inkGeom = useMemo(() => {
    const body = Skia.Path.Make();
    body.addCircle(0, 0, 6.5);
    const shine = Skia.Path.Make();
    shine.addCircle(-2.1, -2.4, 2.1);
    return { body, shine };
  }, []);
  const inkO = useDerivedValue(() => (config.ink ? 1 : 0), [config.ink]);

  /**
   * La recta que se baja con el dedo: el test del nivel formal. Vertical corre
   * el eje de las posiciones y horizontal el de las alturas, y `sweep` significa
   * lo mismo en los dos casos: dónde está la recta, en unidades de su eje.
   */
  const acostada = config.sweepAxis === "horizontal";
  const sweepT = useDerivedValue(
    () =>
      acostada
        ? [{ translateY: sheet.cy - sweep.value * sheet.uy }]
        : [{ translateX: sheet.cx + sweep.value * sheet.ux }],
    [acostada, sheet],
  );
  const sweepGeom = useMemo(() => {
    const p = Skia.Path.Make();
    if (acostada) {
      p.moveTo(walkPx(sheet, config.window.x0), 0);
      p.lineTo(walkPx(sheet, config.window.x1), 0);
      return p;
    }
    p.moveTo(0, walkPy(sheet, config.window.y0));
    p.lineTo(0, walkPy(sheet, config.window.y1));
    return p;
  }, [acostada, sheet, config.window.x0, config.window.x1, config.window.y0, config.window.y1]);
  const sweepO = useDerivedValue(() => (config.verticalLine ? 1 : 0), [config.verticalLine]);

  // La mano fantasma toma al caminante y lo lleva unos pasos: toda la
  // instrucción del nodo, sin una palabra.
  const handGeom = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 13);
    return p;
  }, []);
  const desde = config.window.x0;
  const hasta = Math.min(config.window.x1, config.window.x0 + 3);
  const handT = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, demo.value));
    const e = c * c * (3 - 2 * c);
    return [
      { translateX: plano.cx + (desde + (hasta - desde) * e) * plano.ux },
      { translateY: plano.cy },
    ];
  }, [plano, desde, hasta]);
  const handO = useDerivedValue(() => hint.value * 0.5 * Math.sin(demo.value * Math.PI));

  const terrenoO = config.ground === "faded" ? 0.28 : 1;
  /** El color de la cuesta. Lo decide el nodo: la escena no sabe qué es empinado. */
  const pasoColor = config.stepColor ?? theme.color.ok;

  return (
    <Group opacity={appear}>
      {/* La hoja: vidrio oscuro debajo de lo que se lee. */}
      <Path path={panel} color={SHADE_SOFT} />
      <Path path={panel} color={GLASS} />
      <Path path={panel} color={GLASS_LINE} style="stroke" strokeWidth={1} />

      {/* Las cuatro regiones, con más luz cuantas menos coordenadas negativas. */}
      {quadrants.map((path, i) => (
        <Path key={`q${i}`} path={path} color="#ffffff" opacity={QUAD_LIGHT[i] ?? 0} />
      ))}

      <Path path={grid.grid} color={GRID_LINE} style="stroke" strokeWidth={1} />
      <Path path={guides} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" opacity={0.75} />
      <Path path={grid.axes} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" />
      <Path path={grid.ticks} color={theme.color.inkDim} style="stroke" strokeWidth={STROKE} strokeCap="round" />
      <Legible path={axisText} color={theme.color.inkDim} />

      {/* El terreno, con su línea del nivel del mar. Es suelo y no una línea:
          piedra con la luz arriba y el borde claro donde pisa el caminante. El
          nivel del mar es el mismo cero que la regla de la hoja, y por eso va
          con la tinta de la regla y no con un color de equipo. */}
      {ground ? (
        <Group opacity={terrenoO}>
          <Path path={ground.body}>
            <LinearGradient
              start={vec(0, ground.top)}
              end={vec(0, ground.foot)}
              colors={[chipTone.top, chipTone.face, chipTone.low]}
            />
          </Path>
          <Path
            path={ground.ridge}
            color={chipTone.rimTop}
            style="stroke"
            strokeWidth={2.5}
            strokeCap="round"
            strokeJoin="round"
          />
          <Path path={ground.sea} color={theme.color.inkDim} style="stroke" strokeWidth={STROKE} opacity={0.8} />
        </Group>
      ) : null}

      {/* Los rastros. El principal lleva el color; el otro queda apagado, que es
          lo que obliga a usar el par para decir cuál es cuál. */}
      {Array.from({ length: WALK_TRACE_SLOTS }, (_, i) => (
        <TraceView
          key={`t${i}`}
          geom={traces[i]}
          principal={i === config.mainTrace}
          line={config.line}
          drops={config.drops}
          flash={flashes[i] ?? flash0}
        />
      ))}

      {/* La curva que hay que juzgar. */}
      <Path path={curve} color={SHADE} style="stroke" strokeWidth={7} strokeCap="round" strokeJoin="round" opacity={0.6} />
      <Path path={curve} color={theme.color.ink} style="stroke" strokeWidth={3.5} strokeCap="round" strokeJoin="round" />

      {/* Las curvas candidatas, cada una con su color: se eligen tocando. */}
      {Array.from({ length: WALK_OPTION_SLOTS }, (_, i) => (
        <OptionCurve
          key={`o${i}`}
          path={options[i]}
          color={WALK_OPTION_COLORS[i] ?? theme.color.ink}
          index={i}
          picked={picked}
        />
      ))}

      {/* Las gotas marcadas entre las que hay que elegir: laten, piden que las miren. */}
      <Group opacity={attentionO}>
        <Path path={marked} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      </Group>

      {/* La gota encendida, sus hilos y el par escrito. */}
      <Path path={litGeom} color={theme.color.ok} style="stroke" strokeWidth={8} opacity={0.35}>
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={litGeom} color={theme.color.ok} style="stroke" strokeWidth={3} />
      <Path path={threads.path} color={SHADE} style="stroke" strokeWidth={4.5} strokeCap="round" opacity={0.6} />
      <Path path={threads.path} color={theme.color.warn} style="stroke" strokeWidth={2} strokeCap="round" />
      <Path path={threads.marcas} color={theme.color.warn} style="stroke" strokeWidth={3} strokeCap="round" />
      <Legible path={pairLabel} color={theme.color.ink} />
      <Legible path={legend} color={theme.color.inkDim} />

      {/* La escalera de escalones iguales: la cuesta, dicha en todo el recorrido. */}
      <Path
        path={stairs}
        color={pasoColor}
        style="stroke"
        strokeWidth={2.5}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.55}
      />

      {/* El segundo escalón, apagado: el que se superpone para ver que encajan. */}
      <Path
        path={ghostStep.body}
        color={pasoColor}
        style="stroke"
        strokeWidth={3}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.4}
      />

      {/* El escalón: subida y avance. El color codifica la cuesta. La cuña
          rellena y el halo lo despegan del paisaje; el trazo sigue siendo lo
          que se mide. */}
      <Path path={step.fill} color={pasoColor} opacity={0.16} />
      <Path path={step.body} color={pasoColor} style="stroke" strokeWidth={11} strokeCap="round" strokeJoin="round" opacity={0.3}>
        <BlurMask blur={6} style="normal" />
      </Path>
      <Path path={step.shadow} color={theme.color.inkDim} style="stroke" strokeWidth={2} strokeCap="round" opacity={0.6} />
      <Path path={step.body} color={SHADE} style="stroke" strokeWidth={7} strokeCap="round" strokeJoin="round" opacity={0.5} />
      <Path path={step.body} color={pasoColor} style="stroke" strokeWidth={4} strokeCap="round" strokeJoin="round" />
      <Path path={step.marks} color={pasoColor} style="stroke" strokeWidth={2} strokeCap="round" />
      <Group opacity={attentionO}>
        <Path path={step.corner} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      </Group>
      <Legible path={step.text} color={theme.color.ink} />

      {/* La recta vertical del test. */}
      <Group transform={sweepT} opacity={sweepO}>
        <Path path={sweepGeom} color={theme.color.warn} style="stroke" strokeWidth={10} strokeCap="round" opacity={0.3}>
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={sweepGeom} color={theme.color.warn} style="stroke" strokeWidth={3} strokeCap="round" />
      </Group>

      {/* La gota que está cayendo y el caminante que la deja. */}
      <Group transform={inkT} opacity={inkO}>
        <Path path={inkGeom.body}>
          <RadialGradient c={vec(-2.2, -2.6)} r={11} colors={[TRACE.light, TRACE.base, TRACE.dark]} />
        </Path>
        <Path path={inkGeom.shine} color="rgba(255, 255, 255, 0.6)" />
      </Group>
      <Group transform={walkerT} opacity={walkerO}>
        <Path path={walker.shadow} color="rgba(0, 0, 0, 0.35)">
          <BlurMask blur={3} style="normal" />
        </Path>
        <Path
          path={walker.limbs}
          color={WALKER.dark}
          style="stroke"
          strokeWidth={walkerR * 0.3}
          strokeCap="round"
        />
        <Path path={walker.torso}>
          <RadialGradient
            c={vec(-walkerR * 0.3, -walkerR * 1.5)}
            r={walkerR * 1.4}
            colors={[WALKER.light, WALKER.base, WALKER.dark]}
          />
        </Path>
        <Path path={walker.head}>
          <RadialGradient
            c={vec(-walkerR * 0.25, -walkerR * 2.35)}
            r={walkerR * 1.0}
            colors={[WALKER.light, WALKER.base, WALKER.dark]}
          />
        </Path>
        <Path path={walker.shine} color="rgba(255, 255, 255, 0.7)" />
      </Group>

      <Burst burst={burst} x={bx} y={by} r={9} />

      <Group transform={handT} opacity={handO}>
        <Path path={handGeom} color="rgba(255, 255, 255, 0.16)" />
        <Path path={handGeom} color={theme.color.ink} style="stroke" strokeWidth={2.5} />
      </Group>
    </Group>
  );
}

/**
 * Glifos que se leen sobre cualquier fondo: un contorno oscuro debajo y la tinta
 * encima. Los numerales de las reglas caen a veces fuera del vidrio de la hoja,
 * y la leyenda siempre, así que no alcanza con el vidrio.
 */
function Legible({ path, color }: { readonly path: SkPath; readonly color: string }) {
  return (
    <>
      <Path path={path} color={SHADE} style="stroke" strokeWidth={3} strokeJoin="round" />
      <Path path={path} color={color} />
    </>
  );
}

/**
 * Un rastro: la línea con su halo y sus gotas con volumen. Montado siempre; sin
 * rastro que dibujar queda con opacidad cero.
 *
 * Las gotas de un rastro van en un solo trazo, así que el volumen se hace con
 * tres pasadas del mismo trazo —sombra corrida, cuerpo, brillo— y no con un
 * degradado por gota: cuesta lo mismo con tres gotas que con treinta.
 */
function TraceView({
  geom,
  principal,
  line,
  drops,
  flash,
}: {
  readonly geom: TraceGeom | undefined;
  readonly principal: boolean;
  readonly line: boolean;
  readonly drops: boolean;
  readonly flash: SharedValue<number>;
}) {
  const empty = useMemo(() => Skia.Path.Make(), []);
  const look = principal ? TRACE : DIM;
  // El principal lleva siempre un halo tenue que lo despega del paisaje; el
  // destello lo enciende entero una vez, cuando el rastro termina de dibujarse.
  const reposo = principal ? 0.35 : 0;
  const haloO = useDerivedValue(
    () => reposo + (flash.value < 1 ? (1 - flash.value) * (1 - reposo) : 0),
    [reposo],
  );
  const l = geom && line ? geom.line : empty;
  const d = geom && drops ? geom.drops : empty;
  const s = geom && drops ? geom.shine : empty;
  return (
    <Group opacity={geom ? 1 : 0}>
      <Group opacity={haloO}>
        <Path path={l} color={look.base} style="stroke" strokeWidth={11} strokeCap="round" strokeJoin="round">
          <BlurMask blur={6} style="normal" />
        </Path>
      </Group>
      <Path
        path={l}
        color={SHADE}
        style="stroke"
        strokeWidth={principal ? 6.5 : 5.5}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.5}
      />
      <Path
        path={l}
        color={look.base}
        style="stroke"
        strokeWidth={principal ? 3.5 : 2.5}
        strokeCap="round"
        strokeJoin="round"
      />
      <Group transform={[{ translateY: 1.6 }]}>
        <Path path={d} color="rgba(0, 0, 0, 0.4)" />
      </Group>
      <Path path={d} color={look.base} />
      <Path path={d} color={look.dark} style="stroke" strokeWidth={1.2} />
      <Path path={s} color="rgba(255, 255, 255, 0.6)" />
    </Group>
  );
}

/**
 * Una curva candidata. Al elegirla engorda y su halo se enciende una vez con su
 * propio color: dice "esta elegiste", no "esta es la buena". La escena no sabe
 * cuál es la buena, y un destello menta lo diría antes que la actividad.
 */
function OptionCurve({
  path,
  color,
  index,
  picked,
}: {
  readonly path: SkPath | undefined;
  readonly color: string;
  readonly index: number;
  readonly picked: number;
}) {
  const empty = useMemo(() => Skia.Path.Make(), []);
  const flash = useSharedValue(1);
  const antes = useRef(picked);
  useEffect(() => {
    const prev = antes.current;
    antes.current = picked;
    if (picked !== index || prev === index || !path) return;
    flash.value = 0;
    flash.value = withTiming(1, { duration: 720 });
  }, [picked, index, path, flash]);
  const haloO = useDerivedValue(() => (flash.value < 1 ? 0.9 * (1 - flash.value) : 0));
  const p = path ?? empty;
  const elegida = picked === index;
  const o = path ? (picked < 0 || elegida ? 1 : 0.3) : 0;
  return (
    <Group opacity={o}>
      <Group opacity={haloO}>
        <Path path={p} color={color} style="stroke" strokeWidth={14} strokeCap="round" strokeJoin="round">
          <BlurMask blur={7} style="normal" />
        </Path>
      </Group>
      <Path
        path={p}
        color={SHADE}
        style="stroke"
        strokeWidth={elegida ? 8.5 : 7}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.6}
      />
      <Path
        path={p}
        color={color}
        style="stroke"
        strokeWidth={elegida ? 4.5 : 3}
        strokeCap="round"
        strokeJoin="round"
      />
    </Group>
  );
}

const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

/**
 * El jugo del evento: un halo menta que se enciende y se apaga, un anillo que se
 * abre y seis chispas menta y oro que salen del lugar y se apagan en ~700 ms. Es
 * el patrón de `Bridge` y `Spark` del nodo 1: todo deriva de `burst`, que va de
 * 0 a 1 una sola vez por evento. En 1 no se ve nada.
 */
function Burst({
  burst,
  x,
  y,
  r,
}: {
  readonly burst: SharedValue<number>;
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly r: number;
}) {
  const ring = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, r);
    return p;
  }, [r]);
  const t = useDerivedValue(() => [{ translateX: x.value }, { translateY: y.value }]);
  const ringT = useDerivedValue(() => [{ scale: 1 + 1.4 * burst.value }]);
  const ringO = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  const haloO = useDerivedValue(() => (burst.value < 1 ? 0.8 * (1 - burst.value) : 0));
  return (
    <Group transform={t}>
      <Group opacity={haloO}>
        <Path path={ring} color={theme.color.ok}>
          <BlurMask blur={8} style="normal" />
        </Path>
      </Group>
      <Group transform={ringT} opacity={ringO}>
        <Path path={ring} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
      </Group>
      {SPARKS.map((angle, i) => (
        <Spark key={i} angle={angle} from={r} gold={i % 2 === 1} burst={burst} />
      ))}
    </Group>
  );
}

function Spark({
  angle,
  from,
  gold,
  burst,
}: {
  readonly angle: number;
  readonly from: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
}) {
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 3);
    return p;
  }, []);
  const t = useDerivedValue(() => {
    const d = from + 34 * burst.value;
    return [
      { translateX: Math.cos(angle) * d },
      { translateY: Math.sin(angle) * d },
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
