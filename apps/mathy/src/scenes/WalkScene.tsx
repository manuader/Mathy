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
 *   altura. El 18 lo deja apagado.
 * - `diagonal`: la recta `y = x` sobre la que se refleja el rastro. Es el gesto
 *   central del 21.
 * - `asymptote`: la pared a la que el rastro se acerca y nunca toca. La pide el
 *   25, y el 23 la usa acostada.
 * - `verticalLine`: la recta vertical que se baja con el dedo. Es el test del
 *   nivel formal del 18 y vuelve en el 21 como test de la recta horizontal.
 * - `skin`: las cinco etapas de desvanecimiento del catálogo, de la colina a
 *   `dy/dx`. El 18 muere en `hill_walk` y `staircase`; el 19 llega a
 *   `slope_ratio` y el 26 a `derivative_notation`.
 * - `numerals`, `axisLabels`, `legend`: qué hay escrito. Sin numerales el rastro
 *   se lee por su forma, que es lo que piden las capas sin lectura.
 *
 * ## Lo que esta escena todavía no dibuja, y qué nodo lo va a pedir
 *
 * - **La escalera de escalones iguales** de la etapa `staircase`, que hoy se
 *   insinúa con un solo escalón. La va a pedir el 19, donde la escalera entera
 *   es la que muestra que la cuesta es constante.
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

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { gpHeightAt, gpJoins, gpPoints, gpTo, type GpCurve, type GpPoint, type GpTrace } from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
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

/** El escalón: cuánto avanza y desde dónde. La subida sale del rastro. */
export interface WalkStep {
  readonly from: number;
  readonly run: number;
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
  readonly step: WalkStep | null;
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

  const alto = Math.max(120, height - 2 * PAD);
  const sheet: WalkPlane = {
    ux: sheetW / anchoU,
    uy: alto / altoU,
    cx: sheetX - w.x0 * (sheetW / anchoU),
    cy: PAD + w.y1 * (alto / altoU),
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

/** La cuadrícula y los dos ejes con sus marcas. */
function buildGrid(config: WalkConfig, p: WalkPlane): { grid: SkPath; axes: SkPath; ticks: SkPath } {
  const w = config.window;
  const grid = Skia.Path.Make();
  const axes = Skia.Path.Make();
  const ticks = Skia.Path.Make();

  for (let x = Math.ceil(w.x0); x <= w.x1; x++) {
    grid.moveTo(walkPx(p, x), walkPy(p, w.y0));
    grid.lineTo(walkPx(p, x), walkPy(p, w.y1));
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

/** La línea de un rastro y sus gotas, cada cosa en un trazo. */
function buildTrace(trace: GpTrace, p: WalkPlane): { line: SkPath; drops: SkPath } {
  const line = Skia.Path.Make();
  const drops = Skia.Path.Make();
  for (let x = trace.from; x < gpTo(trace); x++) {
    if (!gpJoins(trace, x)) continue;
    const a = gpHeightAt(trace, x);
    const b = gpHeightAt(trace, x + 1);
    if (a === null || b === null) continue;
    line.moveTo(walkPx(p, x), walkPy(p, a));
    line.lineTo(walkPx(p, x + 1), walkPy(p, b));
  }
  for (const punto of gpPoints(trace)) {
    drops.addCircle(walkPx(p, punto.x), walkPy(p, punto.y), 4.5);
  }
  return { line, drops };
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
): { body: SkPath; sea: SkPath } {
  const body = Skia.Path.Make();
  const sea = Skia.Path.Make();
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
      abierto = true;
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
  return { body, sea };
}

/** El muñeco: dos círculos y dos piernas, dibujado sobre su propio origen. */
function buildWalker(r: number): SkPath {
  const p = Skia.Path.Make();
  p.addCircle(0, -r * 2.1, r * 0.62);
  p.moveTo(0, -r * 1.5);
  p.lineTo(0, -r * 0.6);
  p.moveTo(-r * 0.5, -r * 1.2);
  p.lineTo(r * 0.5, -r * 1.2);
  p.moveTo(0, -r * 0.6);
  p.lineTo(-r * 0.45, 0);
  p.moveTo(0, -r * 0.6);
  p.lineTo(r * 0.45, 0);
  return p;
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
 */
export const WALK_OPTION_COLORS: readonly string[] = [
  theme.color.warn,
  theme.color.ok,
  theme.color.ink,
];

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
  const grid = useMemo(() => buildGrid(config, sheet), [config, sheet]);
  const axisText = useMemo(() => buildAxisText(config, sheet), [config, sheet]);
  const quadrants = useMemo(
    () => (config.quadrants ? buildQuadrants(config.window, sheet) : []),
    [config.quadrants, config.window, sheet],
  );

  const traces = useMemo(
    () => config.traces.map((t) => buildTrace(t, sheet)),
    [config.traces, sheet],
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
   * hecho dibujo. La subida sale del rastro y no de una cuenta de la escena.
   */
  const step = useMemo(() => {
    const path = Skia.Path.Make();
    const s = config.step;
    const trace = config.traces[config.mainTrace];
    if (!s || !trace) return path;
    const y0 = gpHeightAt(trace, s.from);
    const y1 = gpHeightAt(trace, s.from + s.run);
    if (y0 === null || y1 === null) return path;
    const ax = walkPx(sheet, s.from);
    const ay = walkPy(sheet, y0);
    const bx = walkPx(sheet, s.from + s.run);
    const by = walkPy(sheet, y1);
    path.moveTo(ax, ay);
    path.lineTo(bx, ay);
    path.lineTo(bx, by);
    if (config.skin !== "staircase") path.lineTo(ax, ay);
    return path;
  }, [config.step, config.traces, config.mainTrace, config.skin, sheet]);

  // --- Lo que se mueve -------------------------------------------------------

  const walkerGeom = useMemo(() => buildWalker(Math.min(sheet.ux * 0.5, 13)), [sheet.ux]);
  const plano = config.walker === "ground" && layout.ground ? layout.ground : sheet;
  const walkerT = useDerivedValue(() => [
    { translateX: plano.cx + at.value * plano.ux },
    { translateY: plano.cy - height.value * plano.uy },
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
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 6);
    return p;
  }, []);
  const inkO = useDerivedValue(() => (config.ink ? 1 : 0), [config.ink]);

  /** La recta vertical que se baja con el dedo: el test del nivel formal. */
  const sweepT = useDerivedValue(() => [{ translateX: sheet.cx + sweep.value * sheet.ux }]);
  const sweepGeom = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(0, walkPy(sheet, config.window.y0));
    p.lineTo(0, walkPy(sheet, config.window.y1));
    return p;
  }, [sheet, config.window.y0, config.window.y1]);
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

  return (
    <Group opacity={appear}>
      {/* Las cuatro regiones, teñidas apenas. */}
      {quadrants.map((path, i) => (
        <Path
          key={`q${i}`}
          path={path}
          color={i === 0 || i === 2 ? theme.color.accent : theme.color.warn}
          opacity={i === 0 ? 0.07 : 0.04}
        />
      ))}

      <Path path={grid.grid} color={theme.color.line} style="stroke" strokeWidth={0.6} opacity={0.55} />
      <Path path={guides} color={theme.color.inkFaint} style="stroke" strokeWidth={1.5} />
      <Path path={grid.axes} color={theme.color.inkDim} style="stroke" strokeWidth={STROKE} />
      <Path path={grid.ticks} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      <Path path={axisText} color={theme.color.inkDim} />

      {/* El terreno, con su línea del nivel del mar. */}
      {ground ? (
        <Group opacity={terrenoO}>
          <Path path={ground.body} color={theme.color.surfaceHigh} />
          <Path path={ground.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={ground.sea} color={theme.color.accent} style="stroke" strokeWidth={STROKE} opacity={0.6} />
        </Group>
      ) : null}

      {/* Los rastros. El principal lleva el color; el otro queda apagado, que es
          lo que obliga a usar el par para decir cuál es cuál. */}
      {Array.from({ length: WALK_TRACE_SLOTS }, (_, i) => {
        const geom = traces[i];
        const principal = i === config.mainTrace;
        return (
          <Group key={`t${i}`} opacity={geom ? 1 : 0}>
            {config.line ? (
              <Path
                path={geom ? geom.line : marked}
                color={principal ? theme.color.accent : theme.color.inkDim}
                style="stroke"
                strokeWidth={principal ? 2.5 : 2}
                strokeCap="round"
                opacity={geom ? 1 : 0}
              />
            ) : null}
            {config.drops && geom ? (
              <Path path={geom.drops} color={principal ? theme.color.accent : theme.color.inkDim} />
            ) : null}
          </Group>
        );
      })}

      {/* La curva que hay que juzgar. */}
      <Path path={curve} color={theme.color.ink} style="stroke" strokeWidth={2.5} strokeCap="round" />

      {/* Las curvas candidatas, cada una con su color: se eligen tocando. */}
      {Array.from({ length: WALK_OPTION_SLOTS }, (_, i) => {
        const path = options[i];
        return (
          <Path
            key={`o${i}`}
            path={path ?? curve}
            color={WALK_OPTION_COLORS[i] ?? theme.color.ink}
            style="stroke"
            strokeWidth={picked === i ? 4 : 2.5}
            strokeCap="round"
            opacity={path ? (picked < 0 || picked === i ? 1 : 0.3) : 0}
          />
        );
      })}

      {/* Las gotas marcadas entre las que hay que elegir. */}
      <Path path={marked} color={theme.color.warn} style="stroke" strokeWidth={2} />

      {/* La gota encendida, sus hilos y el par escrito. */}
      <Path path={litGeom} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
      <Path path={threads.path} color={theme.color.warn} style="stroke" strokeWidth={1.5} />
      <Path path={threads.marcas} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      <Path path={pairLabel} color={theme.color.ink} />
      <Path path={legend} color={theme.color.inkDim} />

      {/* El escalón: subida y avance. */}
      <Path path={step} color={theme.color.ok} style="stroke" strokeWidth={2} />

      {/* La recta vertical del test. */}
      <Group transform={sweepT} opacity={sweepO}>
        <Path path={sweepGeom} color={theme.color.warn} style="stroke" strokeWidth={2} />
      </Group>

      {/* La gota que está cayendo y el caminante que la deja. */}
      <Group transform={inkT} opacity={inkO}>
        <Path path={inkGeom} color={theme.color.accent} />
      </Group>
      <Group transform={walkerT} opacity={walkerO}>
        <Path path={walkerGeom} color={theme.color.ink} style="stroke" strokeWidth={2} strokeCap="round" />
      </Group>

      <Group transform={handT} opacity={handO}>
        <Path path={handGeom} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}
