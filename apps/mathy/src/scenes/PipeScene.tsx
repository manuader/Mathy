/**
 * La tubería: la mecánica `machine_pipe` de [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * **Diez nodos de la espina la usan** —9, 14, 17, 18, 20, 21, 24, 27, 32 y 44—
 * así que esta escena no es del nodo 9: es de la mecánica. El nodo 9 la estrena
 * y solo necesita dos cajas, una flecha y un contador; escribirla a la medida de
 * eso obligaría a los otros nueve a copiarla. Todo lo que cambia entre un nodo y
 * otro entra por `PipeConfig` y nada de eso está escrito adentro.
 *
 * El invariante que la escena dibuja es `same_input_same_output`: lo que entra
 * recorre el caño y sale, y el mismo recorrido da siempre lo mismo. Se rompe
 * aparentemente cuando el jugador cambia las máquinas de orden y obtiene otro
 * número, y el objeto lo aclara solo: el camino no es el mismo porque el caño se
 * dio vuelta. Por eso la escena **no calcula nada**: recibe la entrada, lo que
 * sale de cada máquina y la salida, ya resueltos por el nodo. Un carril que
 * calculara por su cuenta convertiría la escena en una segunda fuente de verdad.
 *
 * Las tres reglas del proyecto gobiernan el archivo: modo retained (las
 * máquinas, las ranuras y las filas de la tabla están siempre montadas, las que
 * sobran con opacidad cero), lo que se repite vive en un solo `SkPath`, y nada
 * vuelve al hilo de JavaScript por cuadro: el recorrido del token se deriva de
 * `flow`.
 *
 * ## Los ejes de configuración y qué nodo pide cada uno
 *
 * - `lanes`: uno o dos carriles paralelos. Uno alcanza para 9, 14, 17, 18 y 32;
 *   dos son la comparación de `f∘g` contra `g∘f` (20), del logaritmo del
 *   producto contra la suma de logaritmos (24), del producto contra la suma de
 *   ramas (27) y de `sen(a+b)` contra `sen a + sen b` (44).
 * - `machines`: de una a tres en serie por carril. Una en 17 y 32, dos en 9, 14,
 *   20, 21, 24 y 27, tres en 9 (desde el nivel 7), 17, 20 y 27.
 * - `skin`: las cuatro etapas de desvanecimiento del catálogo. El 9 muere en
 *   `pipes` y nunca llega a notación; el 14 vive entre `pipes` y
 *   `arrow_diagram`; 17, 20, 21 y 24 recorren las cuatro.
 * - `kind` de la máquina: qué le hace a lo que entra. Las dos de la fábrica del
 *   20 —la que pinta y la que tapa— son `paint` y `lid`, y no llevan número: en
 *   `real` e `intuition` no hay nada escrito y la cara es todo lo que hay.
 * - `cargo`: qué viaja por el caño. Bolita (9, 20, 21), ficha (17, 24), vector
 *   (32), ángulo (44), pulso (27), y en el 24 el token **cambia de forma al
 *   atravesar la máquina**, que es por qué la forma vive en cada `PipeItem` y no
 *   en la configuración.
 * - `direction`: correr la tubería al revés. Es el gesto central del 21, la
 *   palanca del 14 y los niveles de vuelta del 9 y del 24.
 * - `numerals`: sin numerales, lo único que dice cuánto vale un token es su
 *   tamaño. Lo piden los niveles de `literacy: none`, empezando por el 4 del
 *   nodo 9.
 * - `counter`: el contador de salida (9, 20, 24, 27).
 * - `table`: la tabla de entradas y salidas (17, donde es la visualización
 *   dominante; 18; 44, donde una entrada repetida es obligatoria).
 * - `tray` y `slots`: el cajón de fichas de operación y las ranuras vacías del
 *   caño (17, 21, 24, 27; el 14 lo usa como llavero).
 * - `trayItems`: el mismo cajón, pero con fichas de **entrada** en vez de
 *   máquinas. Es la bandeja del 17, de donde salen las fichas que se dejan caer
 *   en la ranura. Las dos formas comparten ranuras y asas: un cajón es un cajón.
 * - `branch`, en el carril: el tubo lateral por donde cae la **segunda** salida,
 *   con la luz encendida al lado. Es la regla ambigua del 17 —la que no es una
 *   máquina— y es lo único que la escena dibuja para decirlo: ningún mensaje lo
 *   dice, la luz es el mensaje.
 * - `formula`: el renglón de notación debajo del caño, ya compuesto por el nodo
 *   (`f(x) = 3x + 1`). Es el quinto paso de la transición simbólica del 17, la
 *   tabla contraída en una línea, y lo van a querer el 18, el 20 y el 21. Con
 *   dos carriles cae debajo de los dos, que es donde el 20 escribe
 *   `f∘g ≠ g∘f`: la desigualdad tiene que quedar entre las dos salidas que la
 *   prueban.
 * - `lasso`, en el carril: el trazo que rodea a las máquinas y las mete en una
 *   caja sola, con su etiqueta encima. Es la cadena vuelta un objeto con nombre
 *   (20) y la caja doble de la que después sale la inversa (21).
 * - `inputLabel`, en el carril: con qué se alimenta el caño, escrito debajo de
 *   la boca. Lo pide cualquier nodo que haga anticipar la salida antes de
 *   soltar (20).
 * - `midLabel`, en el carril: el valor intermedio escrito sobre el tramo que va
 *   de una máquina a la siguiente. Se enciende cuando la bola sale de la
 *   primera, que es cuando ese número empieza a existir (20).
 * - `reorderable`: las máquinas se arrastran para cambiar el orden (9, 20, 27).
 * - `box`: la caja cerrada dentro del caño, la incógnita que todavía no tiene
 *   nombre (14, 17).
 * - `onDemand`: la tubería plegada que se pide con un toque (14, 18, 21, 24,
 *   27, 32, 44).
 *
 * ## Lo que esta escena todavía no dibuja, y qué nodo lo va a pedir
 *
 * - **El gráfico al costado**, con el rastro de entradas y salidas y la diagonal
 *   `y = x`. Lo piden el 18 (donde es el objeto central) y el 21. Es un objeto
 *   grande y con gestos propios; cuando llegue el 18 conviene que sea su propia
 *   escena y que esta le pase el rastro.
 * - **Las dos ramas paralelas** dentro de una misma tubería, que pide el 27.
 *   El tubo lateral del 17 ya está —`branch`—, pero es un desvío que escupe al
 *   costado y no una segunda cadena que vuelva a juntarse: un carril sigue
 *   siendo una cadena.
 * - **El deslizador de contraejemplo** con dos barras de salida que se separan
 *   (24, 44). Es el patrón `counterexample_slider` de L0 y vale la pena
 *   construirlo una vez, con la barra, cuando llegue el primero de los dos.
 *
 * Nada de texto rasterizado: los numerales y los operadores son contornos del
 * atlas de glifos, y el `−` es el U+2212 de la tipografía matemática.
 */

import { useEffect, useMemo, useRef } from "react";
import {
  BlurMask,
  DashPathEffect,
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
import { ChipBodies } from "../ui/ChipBodies.tsx";
import { play } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Las cuatro etapas de desvanecimiento de `machine_pipe` en E0. */
export type PipeSkin = "machines" | "pipes" | "arrow_diagram" | "function_notation";

/**
 * Qué viaja por el caño. No es decoración: en el nodo 24 el token entra redondo
 * y sale con muescas, y esa diferencia de forma **es** el contenido del nodo.
 */
export type PipeCargo = "ball" | "tile" | "vector" | "angle" | "pulse";

/**
 * Qué le hace una máquina a lo que entra. Es un dibujo y nunca una palabra,
 * porque la mecánica declara `literacy_min: none`.
 */
export type PipeMachineKind =
  | "add"
  | "sub"
  | "mul"
  | "div"
  | "pow"
  | "root"
  | "log"
  | "exp"
  | "turn"
  | "paint"
  | "lid"
  | "identity"
  | "opaque";

export interface PipeMachine {
  readonly id: string;
  readonly kind: PipeMachineKind;
  /** El número que la máquina lleva encima, cuando lleva alguno. */
  readonly value: number;
  /**
   * El rótulo ya compuesto por el nodo (`×3`, `f`, `g∘f`, `log₂`). Vacío: la
   * máquina no dice nada y se reconoce por su dibujo. La escena no lo arma: los
   * nombres de función dependen del `MathLocale` y eso es asunto del nodo.
   */
  readonly label: string;
  /** La máquina corre al revés: es la llave de la otra. Lleva su marca. */
  readonly inverted: boolean;
  /** La carcasa es opaca: se ve entrar y salir, no lo que pasa adentro. */
  readonly opaque: boolean;
}

/**
 * Algo que viaja por el caño. `size` va de 0 a 1 y es lo único que dice cuánto
 * vale cuando no hay numerales.
 */
export interface PipeItem {
  readonly value: number;
  readonly size: number;
  readonly kind: PipeCargo;
  /** El rótulo compuesto por el nodo. Vacío: el token no dice nada. */
  readonly label: string;
}

/** Una fila de la tabla de entradas y salidas. */
export interface PipeRow {
  readonly input: PipeItem;
  readonly output: PipeItem;
  /** La fila se ilumina en vez de duplicarse: es la entrada que ya se probó. */
  readonly repeated: boolean;
}

/** Un carril: una cadena de máquinas con su entrada y su salida. */
export interface PipeLane {
  readonly id: string;
  readonly machines: readonly PipeMachine[];
  readonly input: PipeItem;
  /** Lo que sale de cada máquina, ya calculado por el nodo. */
  readonly stages: readonly PipeItem[];
  readonly output: PipeItem;
  /** La salida que se pide, dibujada aparte del caño. `null`: no hay objetivo. */
  readonly target: PipeItem | null;
  readonly glow: boolean;
  /**
   * La segunda salida, la que cae por el tubo lateral. Cuando viene, la regla
   * mandó la misma entrada a dos ramas y por lo tanto **no es una máquina**. Se
   * omite en todos los nodos menos el 17.
   */
  readonly branch?: PipeItem | null;
  /**
   * El lazo: el trazo que rodea a las máquinas de este carril y las mete en una
   * caja sola, con su etiqueta encima. Es el cuarto paso de la transición
   * simbólica del 20 —la cadena vuelta un objeto con nombre— y no dibuja nada
   * cuando viene vacío. El rótulo lo compone el nodo: `f∘g` depende del
   * `MathLocale` y de qué máquina quedó pegada a la entrada.
   */
  readonly lasso?: string;
  /**
   * Lo que se escribe debajo de la boca: con qué se alimenta el caño. Sin esto,
   * el tamaño de la bola es lo único que dice cuánto entró, y eso alcanza
   * mientras no haya que anticipar la salida y deja de alcanzar en cuanto hay
   * que anticiparla (20, nivel 5). Vacío: la boca no dice nada, que es lo que
   * quieren los niveles sin numerales.
   */
  readonly inputLabel?: string;
  /**
   * Lo que se escribe sobre el caño entre la primera máquina y la siguiente: el
   * valor intermedio. Aparece cuando la bola ya salió de la primera, que es el
   * único momento en que ese número existe. Vacío: el tramo no dice nada.
   */
  readonly midLabel?: string;
}

/**
 * Todo lo que un nodo decide sobre la tubería. Un nodo que reusa la mecánica
 * escribe uno de estos y no toca la escena.
 */
export interface PipeConfig {
  readonly lanes: readonly PipeLane[];
  readonly skin: PipeSkin;
  readonly direction: "forward" | "backward";
  /** Los numerales sobre las máquinas y los tokens. */
  readonly numerals: boolean;
  /** El contador al final del caño. */
  readonly counter: boolean;
  /** La tabla de entradas y salidas debajo. Vacía: no hay tabla. */
  readonly table: readonly PipeRow[];
  /** El cajón de fichas de operación. Vacío: las máquinas ya están puestas. */
  readonly tray: readonly PipeMachine[];
  /** Cuántas ranuras vacías tiene el caño de cada carril. */
  readonly slots: number;
  /** Las máquinas se arrastran para cambiar el orden. */
  readonly reorderable: boolean;
  /** La caja cerrada adentro del caño: la incógnita que todavía no tiene nombre. */
  readonly box: boolean;
  /** La tubería llega plegada y se pide con un toque. */
  readonly onDemand: boolean;
  /**
   * El cajón lleva fichas de entrada en vez de máquinas. Comparte las ranuras y
   * las asas con `tray`; un nodo usa uno de los dos, nunca los dos a la vez.
   */
  readonly trayItems?: readonly PipeItem[];
  /** El renglón de notación debajo del caño, ya compuesto por el nodo. */
  readonly formula?: string;
}

/** Dónde cae cada cosa de un carril. */
export interface PipeLaneLayout {
  readonly y: number;
  /** Las cajas de las máquinas, en el orden del caño. Siempre `MACHINE_SLOTS`. */
  readonly machines: readonly Box[];
  /** La boca de entrada y el pico de salida. */
  readonly mouth: Spot;
  readonly spout: Spot;
  /**
   * El recorrido del token, punto por punto: la boca, el centro de cada máquina
   * y el pico. `flow` se muestrea sobre esta polilínea, así que el dibujo y el
   * hit test miden lo mismo.
   */
  readonly path: readonly Spot[];
  readonly counter: Spot;
  readonly target: Spot;
  /** La boca del tubo lateral: por debajo de la última máquina y hacia afuera. */
  readonly branchSpout: Spot;
  /** La luz que se enciende cuando salen dos. */
  readonly lamp: Spot;
}

export interface PipeLayout {
  readonly lanes: readonly PipeLaneLayout[];
  readonly machineW: number;
  readonly machineH: number;
  /** El cajón de fichas, abajo. Siempre `TRAY_SLOTS` posiciones. */
  readonly tray: readonly Spot[];
  readonly trayW: number;
  readonly trayH: number;
  readonly table: { readonly x: number; readonly y: number; readonly w: number; readonly rowH: number };
  /** El radio del token más grande. Los tamaños chicos salen de acá. */
  readonly tokenR: number;
  /** Dónde va el renglón de notación. */
  readonly formula: Spot;
}

/** Máquinas montadas siempre por carril, para que el árbol no cambie entre rondas. */
export const PIPE_MACHINE_SLOTS = 3;
/** Fichas del cajón montadas siempre. */
export const PIPE_TRAY_SLOTS = 4;
/** Filas de la tabla montadas siempre. */
export const PIPE_TABLE_SLOTS = 5;

const PAD = 32;

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la máquina se arrastraría desde
 * donde no se ve.
 */
export function pipeLayout(config: PipeConfig, width: number, height: number): PipeLayout {
  const carriles = Math.max(config.lanes.length, 1);
  const conTabla = config.table.length > 0;
  const fichas = config.trayItems ?? [];
  const conCajon = config.tray.length > 0 || fichas.length > 0;

  // El alto se reparte de arriba abajo: los carriles, la tabla y el cajón. Con
  // un solo carril la tubería se queda con la banda ancha del medio.
  const arriba = height * 0.2;
  const bandaCarriles = height * (conTabla ? 0.3 : 0.42);
  const paso = bandaCarriles / carriles;

  const machineH = Math.max(52, Math.min(84, paso * 0.72));
  // Tres máquinas, dos bocas y aire a los costados tienen que entrar siempre.
  const machineW = Math.max(
    46,
    Math.min(96, (width - 2 * PAD - 120) / PIPE_MACHINE_SLOTS),
  );
  const tokenR = Math.max(10, Math.min(22, machineH * 0.26));

  const lanes: PipeLaneLayout[] = [];
  for (let i = 0; i < carriles; i++) {
    const y = arriba + paso * (i + 0.5);
    const lane = config.lanes[i];
    const usadas = Math.max(lane ? lane.machines.length : 0, config.slots);
    const puestas = Math.min(Math.max(usadas, 1), PIPE_MACHINE_SLOTS);
    const gap = Math.max(20, Math.min(46, (width - 2 * PAD - puestas * machineW) / (puestas + 1)));
    const ancho = puestas * machineW + (puestas + 1) * gap;
    const left = (width - ancho) / 2;

    const machines: Box[] = [];
    for (let m = 0; m < PIPE_MACHINE_SLOTS; m++) {
      machines.push(
        m < puestas
          ? { x: left + gap + m * (machineW + gap), y: y - machineH / 2, w: machineW, h: machineH }
          : // Las ranuras que este carril no usa se van del lienzo, y así el
            // árbol de la escena no cambia de una ronda a la otra.
            { x: width / 2, y: height + machineH * 2, w: machineW, h: machineH },
      );
    }

    const bocaX = left + gap / 2 - machineW / 2;
    const picoX = left + ancho - gap / 2 + machineW / 2;
    // Al revés, la boca y el pico se intercambian: el mismo caño leído en el
    // otro sentido, que es exactamente lo que el nodo 21 pide sentir.
    const alReves = config.direction === "backward";
    const mouth = { x: alReves ? picoX : bocaX, y };
    const spout = { x: alReves ? bocaX : picoX, y };

    const centros = machines
      .slice(0, puestas)
      .map((b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 }));
    const camino = [mouth, ...(alReves ? [...centros].reverse() : centros), spout];

    // El tubo lateral sale de la última máquina y baja hacia el pico, pero por
    // debajo del caño: las dos salidas tienen que verse a la vez, o no se ve que
    // son dos.
    const ultima = centros[centros.length - 1] ?? mouth;
    const haciaAfuera = alReves ? -1 : 1;
    const branchSpout = { x: ultima.x + haciaAfuera * machineW * 0.9, y: y + machineH * 0.95 };

    // El objetivo y el contador cuelgan al lado del pico, pero nunca afuera del
    // lienzo: en un teléfono angosto el objetivo quedaba en x = 396 sobre un
    // lienzo de 390, y el jugador no veía el tamaño que se le pedía. Cuando el
    // borde lo empuja hacia el pico, el contador sube para no tapar la salida.
    const deseado = spout.x + (alReves ? -tokenR * 2.4 : tokenR * 2.4);
    const borde = tokenR + 6;
    const alLado = alReves ? Math.max(borde, deseado) : Math.min(width - borde, deseado);
    const empujado = alLado !== deseado;

    lanes.push({
      y,
      machines,
      mouth,
      spout,
      path: camino,
      counter: { x: alLado, y: empujado ? y - machineH * 0.62 : y },
      target: { x: alLado, y: y + machineH * 0.62 },
      branchSpout,
      lamp: { x: ultima.x, y: y - machineH * 0.78 },
    });
  }

  const trayH = 54;
  const trayW = Math.max(44, Math.min(88, (width - 2 * PAD - (PIPE_TRAY_SLOTS - 1) * 12) / PIPE_TRAY_SLOTS));
  const trayTotal = PIPE_TRAY_SLOTS * trayW + (PIPE_TRAY_SLOTS - 1) * 12;
  const trayY = height - trayH / 2 - 18;
  const ocupadas = Math.max(config.tray.length, fichas.length);
  const tray: Spot[] = [];
  for (let i = 0; i < PIPE_TRAY_SLOTS; i++) {
    tray.push(
      conCajon && i < ocupadas
        ? { x: (width - trayTotal) / 2 + trayW / 2 + i * (trayW + 12), y: trayY }
        : { x: width / 2, y: height + trayH * 2 },
    );
  }

  const rowH = 26;
  const tableW = Math.min(width - 2 * PAD, 260);
  // El renglón de notación va entre el caño y la tabla: la fórmula es la tabla
  // contraída, así que tiene que quedar donde el ojo ya estaba mirando.
  const conFormula = (config.formula ?? "") !== "";
  const formulaY = arriba + bandaCarriles + 8;
  return {
    lanes,
    machineW,
    machineH,
    tray,
    trayW,
    trayH,
    table: {
      x: (width - tableW) / 2,
      y: arriba + bandaCarriles + (conFormula ? 34 : 18),
      w: tableW,
      rowH,
    },
    tokenR,
    formula: { x: width / 2, y: formulaY },
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Una cadena de glifos del atlas, centrada. Sale del mismo atlas que la
 * ecuación del nodo 13, así que el `×` de una máquina y el `×` de una expresión
 * son el mismo objeto, y el `−` es el U+2212 y no un guion de ASCII, que no
 * está en el atlas y dejaría un hueco.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  let alto = false;
  for (const c of chars) {
    if (c === "^") {
      alto = true;
      continue;
    }
    if (alto && CIERRA_EXPONENTE.includes(c)) alto = false;
    advance += (getGlyph(c)?.advance ?? 0.5) * (alto ? EXP_SIZE : 1);
  }
  let x = cx - (advance * size) / 2;
  // Los dígitos van de -0.666 em a la línea de base, así que centrarlos es
  // bajar el trazo un tercio de em.
  const baseline = cy + size * 0.333;
  alto = false;
  for (const c of chars) {
    if (c === "^") {
      alto = true;
      continue;
    }
    if (alto && CIERRA_EXPONENTE.includes(c)) alto = false;
    const glyph = getGlyph(c);
    const src = pathFor(c);
    const s = size * (alto ? EXP_SIZE : 1);
    if (glyph && src) {
      const copy = src.copy();
      copy.transform([s, 0, x, 0, s, alto ? baseline - size * EXP_RISE : baseline, 0, 0, 1]);
      target.addPath(copy);
    }
    x += (glyph?.advance ?? 0.5) * s;
  }
}

/**
 * El exponente. Lo estrena el nodo 21 para la marca de la inversa: `f^−1` se
 * dibuja `f⁻¹`, con el `−` y el `1` que el atlas ya tiene, levantados y más
 * chicos. **La marca es un exponente de verdad** y el nodo lo dice en voz alta,
 * así que dibujarla con dos glifos del atlas en vez de hornear un carácter
 * nuevo no es un atajo: es lo que la notación es.
 *
 * El `^` no está en el atlas ni en ningún rótulo de los otros nodos, así que la
 * regla no cambia nada de lo que ya se dibujaba.
 */
const EXP_SIZE = 0.62;
const EXP_RISE = 0.42;
/** El exponente termina donde empieza el argumento o la igualdad. */
const CIERRA_EXPONENTE = "()= ";

/** El signo de cada máquina, cuando el nodo ya escribe números. */
const OP_CHAR: Readonly<Record<string, string>> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

// --- Piezas ------------------------------------------------------------------

/** Una flecha con cola y punta. La dirección del caño está en la punta. */
function arrow(target: SkPath, x0: number, x1: number, y: number, head: number): void {
  target.moveTo(x0, y);
  target.lineTo(x1, y);
  if (x0 === x1) return;
  const dir = x1 > x0 ? -1 : 1;
  target.moveTo(x1, y);
  target.lineTo(x1 + dir * head, y - head * 0.6);
  target.moveTo(x1, y);
  target.lineTo(x1 + dir * head, y + head * 0.6);
}

/**
 * El dibujo de lo que la máquina le hace a lo que entra.
 *
 * Sin numerales, esto es todo lo que el jugador tiene, así que ninguna de las
 * formas es un símbolo: escalar son dos puntas de espaldas, encoger son dos
 * puntas encaradas, agregar son puntos que se suman al costado y sacar son los
 * mismos puntos tachados. La misma gramática que usa el llavero del nodo 6.
 */
function machineFace(kind: PipeMachineKind, value: number, cx: number, cy: number, s: number): SkPath {
  const p = Skia.Path.Make();
  if (kind === "opaque") {
    // La regla va en la panza y el jugador no puede abrirla. Es un requisito del
    // nodo 27 y no un dibujo sin terminar.
    p.addCircle(cx, cy, s * 0.5);
    p.moveTo(cx - s * 0.22, cy);
    p.lineTo(cx + s * 0.22, cy);
    return p;
  }
  if (kind === "identity") {
    arrow(p, cx - s * 0.7, cx + s * 0.7, cy, s * 0.3);
    return p;
  }
  if (kind === "turn") {
    p.addArc(Skia.XYWHRect(cx - s * 0.55, cy - s * 0.55, s * 1.1, s * 1.1), 40, 280);
    p.moveTo(cx + s * 0.42, cy - s * 0.36);
    p.lineTo(cx + s * 0.62, cy - s * 0.06);
    p.moveTo(cx + s * 0.42, cy - s * 0.36);
    p.lineTo(cx + s * 0.16, cy - s * 0.26);
    return p;
  }
  if (kind === "lid") {
    // La tapadora: una caja abierta y la tapa bajando encima. No es un símbolo,
    // como ninguna de las otras caras: la mecánica se juega sin leer.
    p.moveTo(cx - s * 0.5, cy - s * 0.05);
    p.lineTo(cx - s * 0.5, cy + s * 0.5);
    p.lineTo(cx + s * 0.5, cy + s * 0.5);
    p.lineTo(cx + s * 0.5, cy - s * 0.05);
    p.moveTo(cx - s * 0.65, cy - s * 0.3);
    p.lineTo(cx + s * 0.65, cy - s * 0.3);
    p.moveTo(cx, cy - s * 0.3);
    p.lineTo(cx, cy - s * 0.62);
    return p;
  }
  if (kind === "paint") {
    p.addCircle(cx, cy, s * 0.5);
    p.addArc(Skia.XYWHRect(cx - s * 0.5, cy - s * 0.5, s, s), 90, 180);
    p.lineTo(cx, cy - s * 0.5);
    return p;
  }
  if (kind === "mul" || kind === "div" || kind === "pow" || kind === "root" || kind === "exp" || kind === "log") {
    // Escalar: dos puntas de espaldas agrandan, encaradas achican. Es la misma
    // flecha dibujada al revés, como el `÷` es la cruz acostada.
    const agranda = kind === "mul" || kind === "pow" || kind === "exp";
    const punta = (x: number, d: number): void => {
      p.moveTo(x - d * s * 0.5, cy - s * 0.42);
      p.lineTo(x + d * s * 0.5, cy);
      p.lineTo(x - d * s * 0.5, cy + s * 0.42);
    };
    punta(cx - s * 0.5, agranda ? -1 : 1);
    punta(cx + s * 0.5, agranda ? 1 : -1);
    return p;
  }
  // Agregar y sacar: un punto por unidad, y tachados cuando se sacan.
  const n = Math.max(1, Math.min(Math.round(Math.abs(value)), 6));
  const paso = (s * 1.2) / n;
  for (let i = 0; i < n; i++) {
    const x = cx - s * 0.6 + paso * (i + 0.5);
    p.addCircle(x, cy, Math.min(paso * 0.34, s * 0.16));
  }
  if (kind === "sub") {
    p.moveTo(cx - s * 0.7, cy - s * 0.4);
    p.lineTo(cx + s * 0.7, cy + s * 0.4);
  }
  return p;
}

/** La marca de la máquina que corre al revés. No es "elevado a menos uno". */
function invertedMark(cx: number, cy: number, s: number): SkPath {
  const p = Skia.Path.Make();
  p.addCircle(cx, cy, s * 0.42);
  p.moveTo(cx - s * 0.24, cy);
  p.lineTo(cx + s * 0.24, cy);
  return p;
}

/** El token, dibujado según lo que sea. La forma es parte del contenido. */
function tokenShape(item: PipeItem, r: number): SkPath {
  const p = Skia.Path.Make();
  const radio = Math.max(4, r * Math.max(0.2, Math.min(1, item.size)));
  switch (item.kind) {
    case "tile":
      // La ficha con muescas del nodo 24: el conteo tiene otra forma que la
      // cantidad, y esa diferencia es lo que el caño convierte.
      p.addRRect(Skia.RRectXY(Skia.XYWHRect(-radio, -radio, radio * 2, radio * 2), 3, 3));
      for (let i = 0; i < 3; i++) {
        const y = -radio + ((i + 1) * radio * 2) / 4;
        p.moveTo(-radio, y);
        p.lineTo(-radio * 0.4, y);
      }
      return p;
    case "vector":
      arrow(p, -radio, radio, 0, radio * 0.6);
      return p;
    case "angle":
      p.addArc(Skia.XYWHRect(-radio, -radio, radio * 2, radio * 2), -60, 120);
      p.moveTo(0, 0);
      p.lineTo(radio, 0);
      p.moveTo(0, 0);
      p.lineTo(radio * 0.5, -radio * 0.86);
      return p;
    case "pulse":
      p.moveTo(-radio, radio * 0.6);
      p.lineTo(-radio * 0.2, radio * 0.6);
      p.lineTo(-radio * 0.2, -radio * 0.6);
      p.lineTo(radio * 0.2, -radio * 0.6);
      p.lineTo(radio * 0.2, radio * 0.6);
      p.lineTo(radio, radio * 0.6);
      return p;
    default:
      p.addCircle(0, 0, radio);
      return p;
  }
}

// --- Materiales --------------------------------------------------------------

/**
 * El metal de las máquinas y del caño. Es un gris azulado a propósito: el metal
 * no significa nada, así que no puede usar ninguno de los colores que sí
 * significan algo. La luz le llega de arriba, como a todo lo del juego.
 */
const METAL = { light: "#8fa3bd", base: "#52647d", dark: "#27323f" } as const;

/**
 * Lo que viaja por el caño es del equipo `accent`: es la colección que se mete
 * en la boca. Con dos carriles es **la misma bola** por dos caminos (el 20 lo
 * dice con el número), así que los dos carriles la pintan igual.
 */
const TOKEN_LOOK = { light: "#b8e2ff", base: theme.color.accent, dark: "#1f7fcf" } as const;
/** La segunda salida, la del tubo lateral: `warn`, porque pide que la miren. */
const SPARE_LOOK = { light: "#ffe0a3", base: theme.color.warn, dark: "#c27812" } as const;
/** La salida que coincidió con la pedida: menta, que es "coincide". */
const OK_LOOK = { light: "#b6f7dc", base: theme.color.ok, dark: "#16a370" } as const;

/** El vidrio oscuro debajo de todo lo que tiene que leerse sobre el paisaje. */
const PLATE = "rgba(9, 17, 29, 0.82)";
const SHADOW = "rgba(0, 0, 0, 0.35)";
const SHINE = "rgba(255, 255, 255, 0.5)";
/**
 * La luz de una máquina mientras la bola pasa por adentro. Es blanca y tibia,
 * no un color del juego: dice dónde ocurre el cambio, no qué significa.
 */
const WORK_LIGHT = "rgba(255, 244, 218, 0.9)";

/** El caño grueso de las dos primeras pieles, y la flecha de las dos últimas. */
const PIPE_W: Readonly<Record<PipeSkin, number>> = {
  machines: 14,
  pipes: 10,
  arrow_diagram: 3,
  function_notation: 3,
};

const SETTLE = theme.spring.settle;
const LIFT = theme.spring.lift;
/** Cuánto hay que correr una pieza para que cuente como levantada. */
const LIFT_MIN = 6;
/** Seis chispas por evento, como el puente del nodo 1. */
const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

/**
 * Un rótulo del atlas y, si hace falta, el vidrio oscuro que lo sostiene. Todos
 * los vidrios de un carril van en un solo trazo: cuestan lo mismo con uno que
 * con seis.
 */
function label(
  target: SkPath,
  plates: SkPath | null,
  text: string,
  cx: number,
  cy: number,
  size: number,
): void {
  if (text === "") return;
  const p = Skia.Path.Make();
  addGlyphs(p, text, cx, cy, size);
  target.addPath(p);
  if (!plates) return;
  const b = p.getBounds();
  if (b.width <= 0 || b.height <= 0) return;
  const padX = size * 0.34;
  const padY = size * 0.26;
  plates.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(b.x - padX, b.y - padY, b.width + padX * 2, b.height + padY * 2),
      size * 0.32,
      size * 0.32,
    ),
  );
}

/** El vector, el ángulo y el pulso son trazos: no tienen panza que rellenar. */
function strokeCargo(kind: PipeCargo): boolean {
  return kind === "vector" || kind === "angle" || kind === "pulse";
}

/** El brillo del token, arriba a la izquierda, del mismo tamaño que su forma. */
function tokenShine(item: PipeItem, r: number): SkPath {
  const p = Skia.Path.Make();
  const radio = Math.max(4, r * Math.max(0.2, Math.min(1, item.size)));
  if (item.kind === "ball") {
    p.addOval(Skia.XYWHRect(-radio * 0.62, -radio * 0.62, radio * 0.5, radio * 0.34));
  } else if (item.kind === "tile") {
    p.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(-radio * 0.72, -radio * 0.84, radio * 1.44, radio * 0.26),
        radio * 0.13,
        radio * 0.13,
      ),
    );
  }
  return p;
}

const rrectOf = (b: Box, r: number): SkPath => {
  const p = Skia.Path.Make();
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), r, r));
  return p;
};

const circleAt = (x: number, y: number, r: number): SkPath => {
  const p = Skia.Path.Make();
  p.addCircle(x, y, r);
  return p;
};

// --- Geometría por configuración ---------------------------------------------

interface LaneGeom {
  readonly pipe: SkPath;
  /** La boca: el hueco oscuro donde se deja caer lo que entra. */
  readonly mouth: SkPath;
  /** La punta del caño, que dice hacia dónde corre. */
  readonly spoutArrow: SkPath;
  readonly boxes: SkPath;
  /** Las sombras de las carcasas sobre el piso, y el canto de luz de arriba. */
  readonly shadows: SkPath;
  readonly shines: SkPath;
  readonly faces: SkPath;
  readonly marks: SkPath;
  readonly digits: SkPath;
  /** El vidrio oscuro de los rótulos que flotan sobre el paisaje. */
  readonly plates: SkPath;
  readonly counter: SkPath;
  readonly target: SkPath;
  readonly targetDigits: SkPath;
  readonly closed: SkPath;
  /** El tubo lateral y la luz. Vacíos cuando la regla es una máquina de verdad. */
  readonly branch: SkPath;
  readonly lamp: SkPath;
  readonly lampRing: SkPath;
  readonly branchDigits: SkPath;
  /** La caja del lazo y su etiqueta. Vacíos cuando el carril no está lazado. */
  readonly lasso: SkPath;
  readonly lassoLabel: SkPath;
  /** El valor intermedio escrito sobre el caño, su vidrio, y dónde empieza a verse. */
  readonly mid: SkPath;
  readonly midPlate: SkPath;
  /** Con qué se alimenta el caño, escrito debajo de la boca. */
  readonly mouthDigits: SkPath;
  readonly midFrom: number;
  /**
   * La luz de cada máquina, en el orden del recorrido: la de la posición `j`
   * del camino se enciende cuando el token pasa por ahí. Vacío en las pieles
   * sin carcasa, donde no hay nada que se encienda.
   */
  readonly flashes: readonly { readonly path: SkPath; readonly node: number }[];
  /**
   * La salida es la pedida. No es un cálculo: es comparar dos números que el
   * nodo ya resolvió. Con dos salidas no coincide nada, porque no es una máquina.
   */
  readonly matched: boolean;
}

function buildLane(
  config: PipeConfig,
  lane: PipeLane,
  l: PipeLaneLayout,
  layout: PipeLayout,
): LaneGeom {
  const pipe = Skia.Path.Make();
  const mouth = Skia.Path.Make();
  const spoutArrow = Skia.Path.Make();
  const boxes = Skia.Path.Make();
  const shadows = Skia.Path.Make();
  const shines = Skia.Path.Make();
  const faces = Skia.Path.Make();
  const marks = Skia.Path.Make();
  const digits = Skia.Path.Make();
  const plates = Skia.Path.Make();

  // El caño. En `arrow_diagram` y en notación deja de ser un tubo y se vuelve la
  // flecha sola: el objeto se retiró y quedó su dirección.
  const delgado = config.skin === "arrow_diagram" || config.skin === "function_notation";
  const puntos = l.path;
  for (let i = 0; i < puntos.length - 1; i++) {
    const a = puntos[i] as Spot;
    const b = puntos[i + 1] as Spot;
    if (delgado) arrow(pipe, a.x, b.x, l.y, 9);
    else {
      pipe.moveTo(a.x, l.y);
      pipe.lineTo(b.x, l.y);
    }
  }
  // La punta del caño dice hacia dónde corre, y es lo único que cambia cuando
  // la tubería se da vuelta.
  if (!delgado) {
    const boca = l.mouth;
    const pico = l.spout;
    const dir = pico.x > boca.x ? 1 : -1;
    mouth.addCircle(boca.x, l.y, layout.tokenR * 1.15);
    arrow(spoutArrow, pico.x - dir * layout.tokenR, pico.x + dir * layout.tokenR * 0.4, l.y, 10);
  }

  const conCarcasa = config.skin === "machines" || config.skin === "pipes";
  lane.machines.forEach((m, i) => {
    const b = l.machines[i];
    if (!b) return;
    if (conCarcasa) {
      boxes.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 12, 12));
      shadows.addOval(Skia.XYWHRect(b.x + b.w * 0.06, b.y + b.h - 6, b.w * 0.88, 16));
      shines.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x + 7, b.y + 4, b.w - 14, 5), 2.5, 2.5));
    }
    // Con las máquinas quietas todo el carril es un trazo por capa. Cuando se
    // arrastran, cada una se dibuja en su propio grupo: si el dibujo quedara
    // acá, la carcasa seguiría al dedo y su cara se quedaría en la ranura.
    if (config.reorderable) return;
    faces.addPath(machineFacePath(config, m, b));
    if (m.inverted) marks.addPath(invertedMark(b.x + b.w - 10, b.y + 10, 11));
    // Sin carcasa, el rótulo flota sobre el paisaje y necesita su vidrio.
    label(digits, conCarcasa ? null : plates, machineLabel(config, m), b.x + b.w / 2, b.y + b.h * 0.78, 17);
  });

  // Las ranuras vacías: el caño pide una máquina y no dice cuál.
  const closed = Skia.Path.Make();
  for (let i = lane.machines.length; i < Math.min(config.slots, PIPE_MACHINE_SLOTS); i++) {
    const b = l.machines[i];
    if (!b) continue;
    closed.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 12, 12));
  }
  // La caja cerrada adentro del caño: la incógnita que todavía no tiene nombre.
  if (config.box) {
    const b = l.machines[0];
    if (b) closed.addRRect(Skia.RRectXY(Skia.XYWHRect(l.mouth.x - 14, l.y - 14, 28, 28), 5, 5));
  }

  const counter = Skia.Path.Make();
  if (config.counter && config.numerals) {
    label(counter, plates, String(lane.output.value), l.counter.x, l.counter.y, 26);
  }

  const target = Skia.Path.Make();
  const targetDigits = Skia.Path.Make();
  if (lane.target) {
    const forma = tokenShape(lane.target, layout.tokenR);
    forma.transform([1, 0, l.target.x, 0, 1, l.target.y, 0, 0, 1]);
    target.addPath(forma);
    if (config.numerals) {
      label(targetDigits, plates, String(lane.target.value), l.target.x, l.target.y + layout.tokenR + 12, 15);
    }
  }

  // El tubo lateral: la segunda salida de una regla que manda la misma entrada a
  // dos ramas. Ningún mensaje lo dice; la luz encendida es el mensaje.
  const branch = Skia.Path.Make();
  const lamp = Skia.Path.Make();
  const lampRing = Skia.Path.Make();
  const branchDigits = Skia.Path.Make();
  if (lane.branch) {
    const desde = l.path[l.path.length - 2] ?? l.mouth;
    const hasta = l.branchSpout;
    branch.moveTo(desde.x, l.y);
    branch.quadTo(desde.x, hasta.y, hasta.x, hasta.y);
    lamp.addCircle(l.lamp.x, l.lamp.y, 7);
    lampRing.addCircle(l.lamp.x, l.lamp.y, 13);
    if (config.numerals) {
      label(branchDigits, plates, String(lane.branch.value), hasta.x, hasta.y + layout.tokenR + 12, 15);
    }
  }

  // El lazo: una caja sola alrededor de las máquinas que este carril usa. Lo que
  // encierra no es el dibujo sino la cadena, así que se mide sobre las cajas
  // puestas y no sobre el ancho del caño.
  const lasso = Skia.Path.Make();
  const lassoLabel = Skia.Path.Make();
  const rotulo = lane.lasso ?? "";
  if (rotulo !== "" && lane.machines.length > 0) {
    const usadas = l.machines.slice(0, lane.machines.length);
    const x0 = Math.min(...usadas.map((b) => b.x)) - 14;
    const x1 = Math.max(...usadas.map((b) => b.x + b.w)) + 14;
    const y0 = l.y - layout.machineH * 0.62 - 10;
    const y1 = l.y + layout.machineH * 0.62 + 10;
    lasso.addRRect(Skia.RRectXY(Skia.XYWHRect(x0, y0, x1 - x0, y1 - y0), 14, 14));
    // Bien despegada del borde: adentro de la caja puede haber ya un valor
    // intermedio escrito, y el nombre de la cadena no puede pisarlo.
    label(lassoLabel, plates, rotulo, (x0 + x1) / 2, y0 - 20, 22);
  }

  // El valor intermedio, escrito sobre el tramo que va de la primera máquina a
  // la siguiente. `midFrom` es el punto del recorrido en que ese número empieza
  // a existir: antes de que la bola salga de la primera, no hay nada que decir.
  const mid = Skia.Path.Make();
  const midPlate = Skia.Path.Make();
  const tramos = Math.max(l.path.length - 1, 1);
  const texto = lane.midLabel ?? "";
  if (texto !== "" && l.path.length >= 3) {
    const a = l.path[1] as Spot;
    const b = l.path[2] as Spot;
    label(mid, midPlate, texto, (a.x + b.x) / 2, l.y - layout.machineH * 0.5 - 10, 18);
  }

  // Con qué se alimenta el caño, escrito debajo de la boca. Va en su propio
  // trazo y no en `digits`: con las máquinas arrastrables, `digits` no se dibuja
  // —cada carcasa se lleva su rótulo— y la entrada se perdería justo en las
  // rondas que la necesitan, que son las de cambiar el orden.
  const mouthDigits = Skia.Path.Make();
  label(mouthDigits, plates, lane.inputLabel ?? "", l.mouth.x, l.y + layout.tokenR + 20, 16);

  // La luz de cada máquina, sobre el camino y no sobre la ranura: al revés, el
  // primer nodo del camino es la última caja, y la luz tiene que seguir a la bola.
  const flashes: { path: SkPath; node: number }[] = [];
  if (conCarcasa) {
    for (let j = 1; j < l.path.length - 1; j++) {
      const c = l.path[j] as Spot;
      const w = layout.machineW + 6;
      const h = layout.machineH + 6;
      flashes.push({ path: rrectOf({ x: c.x - w / 2, y: c.y - h / 2, w, h }, 14), node: j });
    }
  }

  const matched =
    lane.target !== null &&
    lane.target.value === lane.output.value &&
    (lane.branch ?? null) === null;

  return {
    pipe,
    mouth,
    spoutArrow,
    boxes,
    shadows,
    shines,
    faces,
    marks,
    digits,
    plates,
    counter,
    target,
    targetDigits,
    closed,
    branch,
    lamp,
    lampRing,
    branchDigits,
    lasso,
    lassoLabel,
    mid,
    midPlate,
    mouthDigits,
    midFrom: 1 / tramos,
    flashes,
    matched,
  };
}

/** El dibujo de una máquina, en las coordenadas de su caja. */
function machineFacePath(config: PipeConfig, m: PipeMachine, b: Box): SkPath {
  // La máquina opaca no muestra lo que hace, aunque el nodo la marque de otra
  // manera: es una restricción del 27 y viaja en la máquina, no en la piel.
  return machineFace(
    m.opaque ? "opaque" : m.kind,
    m.value,
    b.x + b.w / 2,
    b.y + b.h / 2 - (config.numerals ? 8 : 0),
    b.h * 0.3,
  );
}

/** El rótulo de una máquina, ya compuesto por el nodo o armado con su signo. */
function machineLabel(config: PipeConfig, m: PipeMachine): string {
  if (!config.numerals) return "";
  // La máquina opaca no dice nada que no le hayan puesto: armarle el rótulo con
  // su número sería abrir la panza que el 27 pide cerrada, y le contaría la
  // regla al nivel 1 del 17, que existe para descubrirla probando.
  if (m.opaque) return m.label;
  return m.label !== "" ? m.label : `${OP_CHAR[m.kind] ?? ""}${m.value}`;
}

// --- Componente --------------------------------------------------------------

/** Una pieza que el dedo puede llevar: su dibujo sigue a los mismos valores que el gesto. */
export interface PipeSlot {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras la pieza está en juego; 0 cuando ya no hace falta. */
  readonly alive: SharedValue<number>;
}

export interface PipeSceneProps {
  readonly config: PipeConfig;
  readonly layout: PipeLayout;
  /**
   * El recorrido del token por el caño, de 0 a 1. Se muestrea sobre
   * `lane.path`, así que 0 es la boca, los enteros intermedios son los centros
   * de las máquinas y 1 es el pico.
   */
  readonly flow: SharedValue<number>;
  /** Qué carril corre. -1: corren los dos a la vez, que es la comparación. */
  readonly lane: number;
  /**
   * La máquina que no acepta lo que le entra. La escena no sacude nada: un
   * anillo ámbar late alrededor de lo que escupió, que es "mirá acá" sin "mal".
   */
  readonly jam: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. */
  readonly demo: SharedValue<number>;
  /** La tubería plegada que se pide con un toque. */
  readonly unfold: SharedValue<number>;
  readonly appear: SharedValue<number>;
  /** Las máquinas arrastrables, una por ranura y carril del primer carril. */
  readonly pieces: readonly PipeSlot[];
  /** Las fichas del cajón. */
  readonly trayPieces: readonly PipeSlot[];
  /** Qué máquina está elegida, o -1. */
  readonly picked: number;
}

export function PipeScene({
  config,
  layout,
  flow,
  lane,
  jam,
  hint,
  demo,
  unfold,
  appear,
  pieces,
  trayPieces,
  picked,
}: PipeSceneProps) {
  const geoms = useMemo(
    () =>
      config.lanes.map((l, i) =>
        buildLane(config, l, layout.lanes[i] as PipeLaneLayout, layout),
      ),
    [config, layout],
  );

  const trayGeom = useMemo(
    () =>
      layout.tray.map((spot, i) => {
        const box = rrectOf(
          {
            x: spot.x - layout.trayW / 2,
            y: spot.y - layout.trayH / 2,
            w: layout.trayW,
            h: layout.trayH,
          },
          12,
        );
        const m = config.tray[i];
        const ficha = config.trayItems?.[i];
        const face = Skia.Path.Make();
        const shine = Skia.Path.Make();
        const digits = Skia.Path.Make();
        let radio = 0;
        let trazo = false;
        if (m) {
          face.addPath(machineFace(m.kind, m.value, spot.x, spot.y - 6, layout.trayH * 0.3));
          if (config.numerals) {
            const texto = m.label !== "" ? m.label : `${OP_CHAR[m.kind] ?? ""}${m.value}`;
            label(digits, null, texto, spot.x, spot.y + layout.trayH * 0.3, 15);
          }
        } else if (ficha) {
          // La bandeja de fichas de entrada. La ficha se dibuja del tamaño con
          // el que va a entrar al caño: lo que se agarra es lo que viaja.
          const aca = [1, 0, spot.x, 0, 1, spot.y - 6, 0, 0, 1];
          const forma = tokenShape(ficha, layout.tokenR);
          forma.transform(aca);
          face.addPath(forma);
          const brillo = tokenShine(ficha, layout.tokenR);
          brillo.transform(aca);
          shine.addPath(brillo);
          radio = Math.max(4, layout.tokenR * Math.max(0.2, Math.min(1, ficha.size)));
          trazo = strokeCargo(ficha.kind);
          if (config.numerals) {
            const texto = ficha.label !== "" ? ficha.label : String(ficha.value);
            label(digits, null, texto, spot.x, spot.y + layout.trayH * 0.3, 15);
          }
        }
        return {
          box,
          face,
          shine,
          digits,
          esFicha: m === undefined && ficha !== undefined,
          trazo,
          radio,
          cx: spot.x,
          cy: spot.y,
        };
      }),
    [layout, config.tray, config.trayItems, config.numerals],
  );

  // La tabla de entradas y salidas. Las filas están todas montadas; la que esta
  // ronda no usa se dibuja fuera del lienzo.
  const table = useMemo(() => {
    const panel = Skia.Path.Make();
    const lines = Skia.Path.Make();
    const cells = Skia.Path.Make();
    const lit = Skia.Path.Make();
    let litAt: Spot | null = null;
    if (config.table.length === 0) return { panel, lines, cells, lit, litAt };
    const { x, y, w, rowH } = layout.table;
    const filas = Math.min(config.table.length, PIPE_TABLE_SLOTS);
    // Vidrio oscuro debajo: la tabla se lee igual sobre cualquier paisaje.
    panel.addRRect(Skia.RRectXY(Skia.XYWHRect(x - 6, y - 5, w + 12, rowH * filas + 10), 10, 10));
    lines.moveTo(x + w / 2, y + 3);
    lines.lineTo(x + w / 2, y + rowH * filas - 3);
    for (let i = 0; i < filas; i++) {
      const row = config.table[i];
      if (!row) continue;
      const cy = y + rowH * (i + 0.5);
      // Una entrada que ya se probó no duplica la fila: la ilumina. Es lo que
      // convierte la tabla en una prueba del invariante y no en una lista, y
      // por eso se ilumina en menta: la misma entrada **coincide** en la salida.
      if (row.repeated) {
        lit.addRRect(Skia.RRectXY(Skia.XYWHRect(x, cy - rowH / 2 + 2, w, rowH - 4), 6, 6));
        if (!litAt) litAt = { x: x + w * 0.75, y: cy };
      }
      addGlyphs(cells, String(row.input.value), x + w * 0.25, cy, 15);
      addGlyphs(cells, String(row.output.value), x + w * 0.75, cy, 15);
    }
    return { panel, lines, cells, lit, litAt };
  }, [config.table, layout.table]);

  /** El renglón de notación: la tabla contraída en una línea. */
  const formula = useMemo(() => {
    const p = Skia.Path.Make();
    const plate = Skia.Path.Make();
    label(p, plate, config.formula ?? "", layout.formula.x, layout.formula.y, 22);
    return { p, plate };
  }, [config.formula, layout.formula]);

  const plegada = config.onDemand;
  const cuerpoO = useDerivedValue(() => (plegada ? unfold.value : 1), [plegada]);

  // El latido del tubo lateral. Solo corre cuando hay un desvío en pantalla: el
  // resto del tiempo no hay nada que pida que lo miren.
  const pulso = useSharedValue(0);
  const hayDesvio = config.lanes.some((l) => (l.branch ?? null) !== null);
  useEffect(() => {
    if (!hayDesvio) {
      cancelAnimation(pulso);
      pulso.value = 0;
      return;
    }
    pulso.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    return () => cancelAnimation(pulso);
  }, [hayDesvio, pulso]);

  const opaca = config.skin === "machines";

  return (
    <Group opacity={appear}>
      <Group opacity={cuerpoO}>
        {geoms.map((g, i) => {
          const l = layout.lanes[i] as PipeLaneLayout;
          const data = config.lanes[i] as PipeLane;
          const corre = lane === -1 || lane === i;
          return (
            <Group key={data.id}>
              <PipeBody path={g.pipe} y={l.y} skin={config.skin} glow={data.glow} />
              {/* La sombra de las carcasas cae sobre el caño y el piso. */}
              <Group opacity={opaca ? 1 : 0}>
                <Path path={g.shadows} color={SHADOW}>
                  <BlurMask blur={6} style="normal" />
                </Path>
              </Group>
              <Path path={g.mouth} color={PLATE} />
              <Path path={g.mouth} style="stroke" strokeWidth={4}>
                <LinearGradient
                  start={vec(0, l.y - layout.tokenR * 1.15)}
                  end={vec(0, l.y + layout.tokenR * 1.15)}
                  colors={[METAL.light, METAL.base, METAL.dark]}
                />
              </Path>
              <Path
                path={g.spoutArrow}
                color={theme.color.inkDim}
                style="stroke"
                strokeWidth={3}
                strokeCap="round"
                strokeJoin="round"
              />
              {/* El hueco de la carcasa, debajo del token: en `pipes` la bola
                  se ve pasar a través del vidrio. */}
              <Path path={g.boxes} color="rgba(9, 17, 29, 0.6)" />
              {/* La ranura vacía es un hueco con el borde punteado: pide una
                  pieza sin decir cuál, que es la instrucción del nodo. */}
              <Path path={g.closed} color="rgba(0, 0, 0, 0.32)" />
              <Path path={g.closed} color="rgba(255, 255, 255, 0.3)" style="stroke" strokeWidth={2}>
                <DashPathEffect intervals={[7, 5]} />
              </Path>
              <Path path={g.plates} color={PLATE} />
              <Path path={g.counter} color={theme.color.ink} />
              {/* La salida pedida es un fantasma punteado hasta que la de verdad
                  coincide con ella: recién ahí se vuelve menta. */}
              <Path path={g.target} color="rgba(255, 255, 255, 0.06)" />
              <Path path={g.target} color="rgba(255, 255, 255, 0.5)" style="stroke" strokeWidth={2}>
                <DashPathEffect intervals={[5, 4]} />
              </Path>
              <Path path={g.targetDigits} color={theme.color.inkDim} />
              {/* El tubo lateral y la luz. La paleta del proyecto no tiene rojo
                  —no hay error—, así que la alarma es `warn`: mirá acá. */}
              <Path
                path={g.branch}
                color={SHADOW}
                style="stroke"
                strokeWidth={(opaca ? 9 : 5) + 4}
                strokeCap="round"
              />
              <Path
                path={g.branch}
                color={theme.color.warn}
                style="stroke"
                strokeWidth={opaca ? 9 : 5}
                strokeCap="round"
              />
              <Path path={g.branchDigits} color={theme.color.warn} />
              <Lamp path={g.lamp} ring={g.lampRing} flow={flow} pulse={pulso} />
              <BranchToken
                item={data.branch ?? data.output}
                lane={l}
                flow={flow}
                r={layout.tokenR}
                corre={corre && (data.branch ?? null) !== null}
              />
              <Token
                item={itemAt(data, 0)}
                lane={l}
                flow={flow}
                jam={jam}
                r={layout.tokenR}
                corre={corre}
                stages={data.stages}
                input={data.input}
                output={data.output}
              />
              {/* Las carcasas van encima del caño y debajo del token: el token
                  se ve pasar cuando el tubo es transparente y no cuando no. */}
              <Machines
                geom={g}
                config={config}
                lane={l}
                machines={data.machines}
                pieces={pieces}
                move={config.reorderable && i === 0}
                picked={picked}
                opaca={opaca}
              />
              {g.flashes.map((f) => (
                <Flash
                  key={`luz${f.node}`}
                  path={f.path}
                  node={f.node}
                  tramos={Math.max(l.path.length - 1, 1)}
                  flow={flow}
                  corre={corre}
                />
              ))}
              {/* El lazo va encima de las carcasas: lo que encierra tiene que
                  verse adentro, no tapado. Es la cadena vuelta una colección, y
                  por eso lleva el color del equipo. */}
              <Path
                path={g.lasso}
                color={theme.color.accent}
                style="stroke"
                strokeWidth={2.5}
                strokeCap="round"
              />
              <Path path={g.lassoLabel} color={theme.color.accent} />
              <Path path={g.mouthDigits} color={theme.color.ink} />
              <Mid path={g.mid} plate={g.midPlate} flow={flow} from={g.midFrom} corre={corre} />
              <Arrival
                at={l.target}
                shape={g.target}
                digits={g.targetDigits}
                r={layout.tokenR}
                glow={data.glow}
                matched={g.matched && corre}
                flow={flow}
              />
            </Group>
          );
        })}
      </Group>

      {/* El renglón de notación y la tabla de entradas y salidas. */}
      <Path path={formula.plate} color={PLATE} />
      <Path path={formula.p} color={theme.color.ink} />
      <Path path={table.panel} color={PLATE} />
      <Path path={table.panel} color="rgba(255, 255, 255, 0.12)" style="stroke" strokeWidth={1} />
      <Path path={table.lit} color={theme.color.ok} opacity={0.2} />
      <Path path={table.lit} color={theme.color.ok} style="stroke" strokeWidth={1.5} opacity={0.7} />
      <Path path={table.lines} color="rgba(255, 255, 255, 0.18)" style="stroke" strokeWidth={STROKE} />
      <Path path={table.cells} color={theme.color.ink} />
      <TableBurst at={table.litAt} rows={config.table} flow={flow} />

      {/* El cajón de fichas de operación. Siempre montado. */}
      {trayGeom.map((g, i) => (
        <TrayPiece
          key={`tray${i}`}
          slot={trayPieces[i] as PipeSlot}
          box={g.box}
          face={g.face}
          shine={g.shine}
          digits={g.digits}
          filled={g.esFicha}
          trazo={g.trazo}
          radio={g.radio}
          cx={g.cx}
          cy={g.cy}
        />
      ))}

      <Ghost layout={layout} demo={demo} hint={hint} />
    </Group>
  );
}

/**
 * El caño. En las dos primeras pieles es un tubo de metal con sombra, cuerpo y
 * brillo; en las dos últimas se retira y queda la flecha. Las dos formas están
 * siempre montadas y la piel decide cuál se ve: la piel cambia dentro de un
 * nivel (el lazo del 20 vuelve una etapa atrás) y el árbol no puede cambiar.
 *
 * `glow` es el carril que está en juego: una luz del equipo corre por adentro
 * del caño, que es por donde va a pasar la bola.
 */
function PipeBody({
  path,
  y,
  skin,
  glow,
}: {
  readonly path: SkPath;
  readonly y: number;
  readonly skin: PipeSkin;
  readonly glow: boolean;
}) {
  const delgado = skin === "arrow_diagram" || skin === "function_notation";
  const w = delgado ? 10 : PIPE_W[skin];
  return (
    <>
      <Group opacity={delgado ? 0 : 1}>
        <Group transform={[{ translateY: 3 }]}>
          <Path path={path} color={SHADOW} style="stroke" strokeWidth={w + 3} strokeCap="round">
            <BlurMask blur={3} style="normal" />
          </Path>
        </Group>
        <Path path={path} style="stroke" strokeWidth={w} strokeCap="round">
          <LinearGradient
            start={vec(0, y - w / 2)}
            end={vec(0, y + w / 2)}
            colors={[METAL.light, METAL.base, METAL.dark]}
          />
        </Path>
        <Group transform={[{ translateY: -w * 0.24 }]}>
          <Path
            path={path}
            color="rgba(255, 255, 255, 0.3)"
            style="stroke"
            strokeWidth={Math.max(1.5, w * 0.16)}
            strokeCap="round"
          />
        </Group>
        <Path
          path={path}
          color={theme.color.accent}
          opacity={glow ? 0.45 : 0}
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
        />
      </Group>
      <Group opacity={delgado ? 1 : 0}>
        <Path
          path={path}
          color={SHADOW}
          style="stroke"
          strokeWidth={PIPE_W.arrow_diagram + 4}
          strokeCap="round"
          strokeJoin="round"
        />
        <Path
          path={path}
          color={glow ? theme.color.accent : theme.color.inkDim}
          style="stroke"
          strokeWidth={PIPE_W.arrow_diagram}
          strokeCap="round"
          strokeJoin="round"
        />
      </Group>
    </>
  );
}

/** Lo que hay en el caño en cada tramo: la entrada, cada etapa, y la salida. */
function itemAt(lane: PipeLane, index: number): PipeItem {
  return lane.stages[index] ?? lane.output ?? lane.input;
}

/**
 * Crecer al levantar y rebotar al llegar, derivado solo del desplazamiento que
 * el gesto ya escribe. La actividad no avisa cuándo se levanta ni cuándo se
 * suelta una pieza: la pieza lo sabe porque se movió de su lugar, y lo que la
 * trae de vuelta —el dedo o la animación de la actividad— es lo mismo para ella.
 * Todo corre en el hilo de la interfaz.
 */
function useLift(slot: PipeSlot): SharedValue<number> {
  const lift = useSharedValue(0);
  const pop = useSharedValue(0);
  useAnimatedReaction(
    () => slot.dx.value * slot.dx.value + slot.dy.value * slot.dy.value > LIFT_MIN * LIFT_MIN,
    (arriba, antes) => {
      if (antes === null || arriba === antes) return;
      lift.value = withSpring(arriba ? 1 : 0, arriba ? LIFT : SETTLE);
      // Aire al levantarla, madera al apoyarla. Una pieza que ya se usó (o
      // que la ronda devuelve a su lugar sin verse) no suena.
      if (slot.alive.value > 0.5) runOnJS(play)(arriba ? "lift" : "drop");
      if (!arriba) {
        // Llegó: rebota una vez, y así se siente que cayó en un lugar.
        pop.value = 1;
        pop.value = withSpring(0, SETTLE);
      }
    },
    [slot],
  );
  return useDerivedValue(() => (1 + 0.3 * lift.value) * (1 + 0.22 * pop.value));
}

/**
 * El token recorriendo el caño. Su posición y su tamaño se derivan de `flow`, y
 * el tamaño cambia al pasar por cada máquina: el salto es lo que se ve, y en el
 * nodo 9 es lo único que se ve, porque no hay numerales.
 *
 * Cuando el tamaño salta, el token rebota una vez: salió transformado. Y rebota
 * otra vez al llegar al pico. Los dos rebotes salen de cruzar un hito de `flow`
 * en el hilo de la interfaz, sin volver a JavaScript.
 */
function Token({
  item,
  lane,
  flow,
  jam,
  r,
  corre,
  stages,
  input,
  output,
}: {
  readonly item: PipeItem;
  readonly lane: PipeLaneLayout;
  readonly flow: SharedValue<number>;
  readonly jam: SharedValue<number>;
  readonly r: number;
  readonly corre: boolean;
  readonly stages: readonly PipeItem[];
  readonly input: PipeItem;
  readonly output: PipeItem;
}) {
  const shape = useMemo(() => tokenShape({ ...item, size: 1 }, r), [item, r]);
  const shine = useMemo(() => tokenShine({ ...item, size: 1 }, r), [item, r]);
  const ring = useMemo(() => circleAt(0, 0, r * 1.3), [r]);
  const trazo = strokeCargo(item.kind);
  const puntos = lane.path;
  // Los tamaños de cada tramo, ya resueltos por el nodo: el token entra con el
  // de la entrada, sale de cada máquina con el de su etapa y termina con el de
  // la salida. La escena interpola entre ellos y no calcula ninguno.
  const tamanos = useMemo(
    () => [input.size, ...stages.map((s) => s.size), output.size],
    [input.size, stages, output.size],
  );

  const pop = useSharedValue(0);
  useAnimatedReaction(
    () => {
      if (!corre || puntos.length < 2) return -1;
      const f = Math.max(0, Math.min(1, flow.value));
      if (f >= 0.985) return 1000;
      // El hito sube a la mitad de cada tramo, que es donde ocurre el salto.
      return Math.floor(f * (puntos.length - 1) + 0.5);
    },
    (hito, antes) => {
      if (antes === null || antes < 0 || hito <= antes) return;
      const salta = hito === 1000 || (tamanos[hito - 1] ?? 1) !== (tamanos[hito] ?? 1);
      if (!salta) return;
      pop.value = 1;
      pop.value = withSpring(0, SETTLE);
      // La máquina actuó: clic y golpe. Al llegar al pico no suena acá: si la
      // salida es la pedida, suena la llegada.
      if (hito !== 1000) runOnJS(play)("fit");
    },
    [corre, puntos, tamanos],
  );

  const pos = useDerivedValue(() => {
    if (puntos.length < 2) return { x: 0, y: 0, s: 0.0001 };
    const t = Math.max(0, Math.min(0.9999, flow.value)) * (puntos.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    const a = puntos[i] ?? puntos[0];
    const b = puntos[i + 1] ?? a;
    if (!a || !b) return { x: 0, y: 0, s: 0.0001 };
    const e = f * f * (3 - 2 * f);
    const sa = tamanos[Math.min(i, tamanos.length - 1)] ?? 1;
    const sb = tamanos[Math.min(i + 1, tamanos.length - 1)] ?? sa;
    // El salto de tamaño ocurre adentro de la máquina, no en el tramo de caño:
    // por eso el interpolado se concentra en el medio del tirón.
    const k = Math.max(0, Math.min(1, (e - 0.35) / 0.3));
    return {
      x: a.x + (b.x - a.x) * e,
      y: a.y + (b.y - a.y) * e,
      s: Math.max(0.18, sa + (sb - sa) * k),
    };
  }, [puntos, tamanos]);

  const transform = useDerivedValue(() => [
    { translateX: pos.value.x },
    { translateY: pos.value.y },
    { scale: pos.value.s * (1 + 0.22 * pop.value) },
  ]);
  // El anillo no se achica con el token: tiene que verse aunque la bola sea chica.
  const ringAt = useDerivedValue(() => [
    { translateX: pos.value.x },
    { translateY: pos.value.y },
  ]);
  const opacity = useDerivedValue(() => (corre ? Math.min(1, flow.value * 8) : 0), [corre]);
  const ringO = useDerivedValue(
    () => (corre ? Math.min(1, Math.abs(jam.value)) : 0),
    [corre],
  );

  return (
    <>
      <Group transform={transform} opacity={opacity}>
        {trazo ? (
          <Path
            path={shape}
            color={TOKEN_LOOK.base}
            style="stroke"
            strokeWidth={r * 0.28}
            strokeCap="round"
            strokeJoin="round"
          />
        ) : (
          <>
            <Path path={shape}>
              <RadialGradient
                c={vec(-r * 0.35, -r * 0.45)}
                r={r * 1.7}
                colors={[TOKEN_LOOK.light, TOKEN_LOOK.base, TOKEN_LOOK.dark]}
              />
            </Path>
            <Path path={shine} color={SHINE} />
          </>
        )}
      </Group>
      {/* Lo que la máquina no aceptó no se sacude: un anillo ámbar late
          alrededor, y pide que lo miren. */}
      <Group transform={ringAt} opacity={ringO}>
        <Path path={ring} color={theme.color.warn} style="stroke" strokeWidth={6} opacity={0.5}>
          <BlurMask blur={5} style="normal" />
        </Path>
        <Path path={ring} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      </Group>
    </>
  );
}

/**
 * La luz de una máquina mientras el token está adentro: sube cuando llega al
 * centro y se apaga cuando sale. Dice dónde ocurre la transformación, que en la
 * piel `machines` está tapada por la carcasa y es lo único que se ve de ella.
 */
function Flash({
  path,
  node,
  tramos,
  flow,
  corre,
}: {
  readonly path: SkPath;
  readonly node: number;
  readonly tramos: number;
  readonly flow: SharedValue<number>;
  readonly corre: boolean;
}) {
  const o = useDerivedValue(() => {
    if (!corre) return 0;
    const t = Math.max(0, Math.min(1, flow.value)) * tramos;
    return Math.max(0, 1 - Math.abs(t - node) * 2.2);
  }, [corre, node, tramos]);
  return (
    <Group opacity={o}>
      <Path path={path} color={WORK_LIGHT} style="stroke" strokeWidth={6}>
        <BlurMask blur={8} style="normal" />
      </Path>
      <Path path={path} color={WORK_LIGHT} style="stroke" strokeWidth={1.5} opacity={0.7} />
    </Group>
  );
}

/**
 * Las carcasas de las máquinas. Cada una puede llevarse con el dedo.
 *
 * Metal en `machines`, vidrio en `pipes`: la carcasa opaca esconde lo que pasa
 * adentro y la transparente lo muestra, que es la diferencia entre las dos pieles.
 */
function Machines({
  geom,
  config,
  lane,
  machines,
  pieces,
  move,
  picked,
  opaca,
}: {
  readonly geom: LaneGeom;
  readonly config: PipeConfig;
  readonly lane: PipeLaneLayout;
  readonly machines: readonly PipeMachine[];
  readonly pieces: readonly PipeSlot[];
  readonly move: boolean;
  readonly picked: number;
  readonly opaca: boolean;
}) {
  // Cuando el orden cambia, cada máquina viaja desde la ranura donde estaba y no
  // aparece de golpe en la nueva: se ve que es la misma máquina en otro lugar.
  // Solo cuenta como reordenar si son las mismas máquinas: una ronda nueva trae
  // otras y esas aparecen donde van.
  const ids = machines.map((m) => m.id).join("\u0000");
  const previos = useRef(ids);
  const desde = useMemo(() => {
    const antes = previos.current === "" ? [] : previos.current.split("\u0000");
    const ahora = ids === "" ? [] : ids.split("\u0000");
    const permuta =
      antes.length === ahora.length &&
      ahora.length > 1 &&
      ahora.every((id) => antes.includes(id)) &&
      ahora.some((id, i) => antes[i] !== id);
    return ahora.map((id, i) => {
      if (!permuta) return -1;
      const j = antes.indexOf(id);
      return j !== i ? j : -1;
    });
  }, [ids]);
  useEffect(() => {
    previos.current = ids;
  }, [ids]);

  const b0 = lane.machines[0];
  const top = b0 ? b0.y : lane.y;
  const bottom = b0 ? b0.y + b0.h : lane.y;

  // Cuando las máquinas no se mueven, todo el carril es un solo trazo por capa y
  // el presupuesto de elementos animados no se entera de que existen.
  if (!move) {
    return (
      <>
        <Group opacity={opaca ? 1 : 0}>
          <Path path={geom.boxes}>
            <LinearGradient
              start={vec(0, top)}
              end={vec(0, bottom)}
              colors={[METAL.light, METAL.base, METAL.dark]}
            />
          </Path>
          <Path path={geom.shines} color="rgba(255, 255, 255, 0.24)" />
          <Path path={geom.boxes} color="rgba(0, 0, 0, 0.45)" style="stroke" strokeWidth={1.5} />
        </Group>
        <Group opacity={opaca ? 0 : 1}>
          <Path path={geom.shines} color="rgba(255, 255, 255, 0.1)" />
          <Path path={geom.boxes} color="rgba(255, 255, 255, 0.3)" style="stroke" strokeWidth={2} />
        </Group>
        <Path
          path={geom.faces}
          color={theme.color.ink}
          style="stroke"
          strokeWidth={3}
          strokeCap="round"
          strokeJoin="round"
        />
        <Path path={geom.marks} color={PLATE} />
        <Path path={geom.marks} color={theme.color.ink} style="stroke" strokeWidth={2} />
        <Path path={geom.digits} color={theme.color.ink} />
      </>
    );
  }
  return (
    <>
      {Array.from({ length: PIPE_MACHINE_SLOTS }, (_, i) => {
        const j = desde[i] ?? -1;
        return (
          <MachinePiece
            key={i}
            slot={pieces[i] as PipeSlot}
            box={lane.machines[i] as Box}
            config={config}
            machine={machines[i]}
            elegida={picked === i}
            opaca={opaca}
            fromBox={j >= 0 ? lane.machines[j] : undefined}
            fromSlot={j >= 0 ? pieces[j] : undefined}
            swapKey={ids}
          />
        );
      })}
    </>
  );
}

/**
 * Una máquina que el dedo puede llevar. Su carcasa, su dibujo y su rótulo van en
 * el mismo grupo: lo que se arrastra es la máquina entera, no su caja.
 */
function MachinePiece({
  slot,
  box,
  config,
  machine,
  elegida,
  opaca,
  fromBox,
  fromSlot,
  swapKey,
}: {
  readonly slot: PipeSlot;
  readonly box: Box;
  readonly config: PipeConfig;
  readonly machine: PipeMachine | undefined;
  readonly elegida: boolean;
  readonly opaca: boolean;
  /** La ranura de donde viene esta máquina cuando el orden acaba de cambiar. */
  readonly fromBox: Box | undefined;
  readonly fromSlot: PipeSlot | undefined;
  /** Cambia con el orden: es lo que dispara el viaje, y solo eso. */
  readonly swapKey: string;
}) {
  const geom = useMemo(() => {
    const caja = rrectOf(box, 12);
    const brillo = rrectOf({ x: box.x + 7, y: box.y + 4, w: box.w - 14, h: 5 }, 2.5);
    const sombra = Skia.Path.Make();
    sombra.addOval(Skia.XYWHRect(box.x + box.w * 0.06, box.y + box.h - 6, box.w * 0.88, 16));
    const cara = Skia.Path.Make();
    const marca = Skia.Path.Make();
    const digits = Skia.Path.Make();
    if (machine) {
      cara.addPath(machineFacePath(config, machine, box));
      if (machine.inverted) marca.addPath(invertedMark(box.x + box.w - 10, box.y + 10, 11));
      label(digits, null, machineLabel(config, machine), box.x + box.w / 2, box.y + box.h * 0.78, 17);
    }
    return { caja, brillo, sombra, cara, marca, digits };
  }, [box, config, machine]);

  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const scale = useLift(slot);
  const ox = useSharedValue(0);
  const oy = useSharedValue(0);

  // El viaje de una ranura a otra: sale de donde se veía la máquina (su ranura
  // vieja más lo que el dedo la había corrido) y cae en la nueva con un rebote.
  useEffect(() => {
    if (!fromBox || !fromSlot) return;
    ox.value = fromBox.x + fromSlot.dx.value - box.x - slot.dx.value;
    oy.value = fromBox.y + fromSlot.dy.value - box.y - slot.dy.value;
    ox.value = withSpring(0, SETTLE);
    oy.value = withSpring(0, SETTLE);
    // Solo el cambio de orden dispara el viaje: la geometría se rearma con cada
    // configuración y no por eso las máquinas tienen que volar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapKey]);

  const transform = useDerivedValue(
    () => [
      { translateX: cx + slot.dx.value + ox.value },
      { translateY: cy + slot.dy.value + oy.value },
      { scale: scale.value },
      { translateX: -cx },
      { translateY: -cy },
    ],
    [cx, cy],
  );
  const opacity = useDerivedValue(() => (machine ? slot.alive.value : 0), [machine]);

  return (
    <Group transform={transform} opacity={opacity}>
      <Group opacity={opaca ? 1 : 0}>
        <Path path={geom.sombra} color={SHADOW}>
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={geom.caja}>
          <LinearGradient
            start={vec(0, box.y)}
            end={vec(0, box.y + box.h)}
            colors={[METAL.light, METAL.base, METAL.dark]}
          />
        </Path>
        <Path path={geom.brillo} color="rgba(255, 255, 255, 0.24)" />
        <Path path={geom.caja} color="rgba(0, 0, 0, 0.45)" style="stroke" strokeWidth={1.5} />
      </Group>
      <Group opacity={opaca ? 0 : 1}>
        <Path path={geom.caja} color="rgba(9, 17, 29, 0.55)" />
        <Path path={geom.brillo} color="rgba(255, 255, 255, 0.1)" />
        <Path path={geom.caja} color="rgba(255, 255, 255, 0.3)" style="stroke" strokeWidth={2} />
      </Group>
      {/* La máquina que el dedo tiene: un borde de luz, y crece al levantarla. */}
      <Group opacity={elegida ? 1 : 0}>
        <Path path={geom.caja} color="rgba(255, 255, 255, 0.5)" style="stroke" strokeWidth={6}>
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={geom.caja} color={theme.color.ink} style="stroke" strokeWidth={2.5} />
      </Group>
      <Path
        path={geom.cara}
        color={theme.color.ink}
        style="stroke"
        strokeWidth={3}
        strokeCap="round"
        strokeJoin="round"
      />
      <Path path={geom.marca} color={PLATE} />
      <Path path={geom.marca} color={theme.color.ink} style="stroke" strokeWidth={2} />
      <Path path={geom.digits} color={theme.color.ink} />
    </Group>
  );
}

/**
 * Una ficha del cajón. Tiene la misma cara que todas las fichas del juego
 * (`ChipBodies`, la de `chipFace`): es algo que se levanta. Crece al levantarla
 * y rebota cuando vuelve a su lugar.
 */
function TrayPiece({
  slot,
  box,
  face,
  shine,
  digits,
  filled,
  trazo,
  radio,
  cx,
  cy,
}: {
  readonly slot: PipeSlot;
  readonly box: SkPath;
  readonly face: SkPath;
  readonly shine: SkPath;
  readonly digits: SkPath;
  /** La ficha de entrada se pinta llena, como el token que va a viajar. */
  readonly filled: boolean;
  readonly trazo: boolean;
  readonly radio: number;
  readonly cx: number;
  readonly cy: number;
}) {
  const scale = useLift(slot);
  const transform = useDerivedValue(
    () => [
      { translateX: cx + slot.dx.value },
      { translateY: cy + slot.dy.value },
      { scale: scale.value },
      { translateX: -cx },
      { translateY: -cy },
    ],
    [cx, cy],
  );
  const ty = cy - 6;
  return (
    <Group transform={transform} opacity={slot.alive}>
      <ChipBodies path={box} />
      {filled && !trazo ? (
        <>
          <Path path={face}>
            <RadialGradient
              c={vec(cx - radio * 0.35, ty - radio * 0.45)}
              r={Math.max(radio, 1) * 1.7}
              colors={[TOKEN_LOOK.light, TOKEN_LOOK.base, TOKEN_LOOK.dark]}
            />
          </Path>
          <Path path={shine} color={SHINE} />
        </>
      ) : (
        <Path
          path={face}
          color={filled ? TOKEN_LOOK.base : theme.color.ink}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
          strokeJoin="round"
        />
      )}
      <Path path={digits} color={theme.color.ink} />
    </Group>
  );
}

/**
 * El valor intermedio escrito sobre el caño. Aparece cuando la bola sale de la
 * primera máquina y no antes: hasta ese momento ese número no existe, y
 * escribirlo desde el principio contaría el final.
 */
function Mid({
  path,
  plate,
  flow,
  from,
  corre,
}: {
  readonly path: SkPath;
  readonly plate: SkPath;
  readonly flow: SharedValue<number>;
  readonly from: number;
  readonly corre: boolean;
}) {
  const opacity = useDerivedValue(
    () => (corre ? Math.max(0, Math.min(1, (flow.value - from) * 5)) : 0),
    [corre, from],
  );
  return (
    <Group opacity={opacity}>
      <Path path={plate} color={PLATE} />
      <Path path={path} color={theme.color.ink} />
    </Group>
  );
}

/**
 * La luz del tubo lateral. Se enciende cuando la segunda salida ya cayó, no
 * antes: lo que la prende es haber visto salir dos cosas de una. Encendida,
 * un anillo ámbar late alrededor: mirá acá.
 */
function Lamp({
  path,
  ring,
  flow,
  pulse,
}: {
  readonly path: SkPath;
  readonly ring: SkPath;
  readonly flow: SharedValue<number>;
  readonly pulse: SharedValue<number>;
}) {
  const on = useDerivedValue(() => Math.max(0, Math.min(1, (flow.value - 0.55) * 3)));
  const ringO = useDerivedValue(() => on.value * (0.3 + 0.7 * pulse.value));
  return (
    <>
      <Group opacity={on}>
        <Path path={path} color={theme.color.warn} style="stroke" strokeWidth={8} opacity={0.6}>
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={path} color={theme.color.warn} />
      </Group>
      <Group opacity={ringO}>
        <Path path={ring} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      </Group>
    </>
  );
}

/**
 * La segunda salida, cayendo por el tubo lateral. Sale del **mismo tramo** que
 * la primera y al mismo tiempo: si saliera después parecería otra entrada, y lo
 * que hay que ver es que una sola entrada produjo dos cosas.
 */
function BranchToken({
  item,
  lane,
  flow,
  r,
  corre,
}: {
  readonly item: PipeItem;
  readonly lane: PipeLaneLayout;
  readonly flow: SharedValue<number>;
  readonly r: number;
  readonly corre: boolean;
}) {
  const shape = useMemo(() => tokenShape({ ...item, size: 1 }, r), [item, r]);
  const shine = useMemo(() => tokenShine({ ...item, size: 1 }, r), [item, r]);
  const trazo = strokeCargo(item.kind);
  const desde = lane.path[lane.path.length - 2] ?? lane.mouth;
  const hasta = lane.branchSpout;
  const tramos = Math.max(lane.path.length - 1, 1);
  const inicio = (tramos - 1) / tramos;
  const escala = Math.max(0.18, Math.min(1, item.size));

  const transform = useDerivedValue(() => {
    const t = Math.max(0, Math.min(1, (flow.value - inicio) / Math.max(1 - inicio, 0.0001)));
    const e = t * t * (3 - 2 * t);
    return [
      { translateX: desde.x + (hasta.x - desde.x) * e },
      { translateY: lane.y + (hasta.y - lane.y) * e },
      { scale: escala },
    ];
  }, [desde, hasta, inicio, escala, lane.y]);

  const opacity = useDerivedValue(
    () => (corre ? Math.max(0, Math.min(1, (flow.value - inicio) * 6)) : 0),
    [corre, inicio],
  );

  return (
    <Group transform={transform} opacity={opacity}>
      {trazo ? (
        <Path
          path={shape}
          color={SPARE_LOOK.base}
          style="stroke"
          strokeWidth={r * 0.28}
          strokeCap="round"
        />
      ) : (
        <>
          <Path path={shape}>
            <RadialGradient
              c={vec(-r * 0.35, -r * 0.45)}
              r={r * 1.7}
              colors={[SPARE_LOOK.light, SPARE_LOOK.base, SPARE_LOOK.dark]}
            />
          </Path>
          <Path path={shine} color={SHINE} />
        </>
      )}
    </Group>
  );
}

/**
 * El evento que la tubería enseña: **la salida es la pedida**. Cuando el
 * jugador resuelve el carril (`glow` se apaga) y la salida coincide con la que
 * se pedía, el fantasma de la salida pedida se llena de menta, brilla, y suelta
 * seis chispas menta y oro. Una sola vez, y en el objeto que coincidió.
 *
 * Espera a que el token haya llegado al pico: si el carril se resuelve mientras
 * la bola todavía viaja, las chispas no pueden adelantarse a lo que celebran.
 * Por eso tampoco se dispara solo porque la salida coincida: en la ronda que
 * pregunta cuál de dos cadenas da el número pedido, celebrar al llegar sería
 * contestar antes que el jugador.
 */
function Arrival({
  at,
  shape,
  digits,
  r,
  glow,
  matched,
  flow,
}: {
  readonly at: Spot;
  readonly shape: SkPath;
  readonly digits: SkPath;
  readonly r: number;
  readonly glow: boolean;
  readonly matched: boolean;
  readonly flow: SharedValue<number>;
}) {
  const armed = useSharedValue(0);
  const burst = useSharedValue(1);
  const done = useSharedValue(0);
  const jugando = useRef(glow);
  useEffect(() => {
    const antes = jugando.current;
    jugando.current = glow;
    if (glow) {
      armed.value = 0;
      burst.value = 1;
      done.value = 0;
      return;
    }
    if (antes && matched) armed.value = 1;
  }, [glow, matched, armed, burst, done]);

  useAnimatedReaction(
    () => armed.value === 1 && flow.value >= 0.97,
    (listo) => {
      if (!listo) return;
      armed.value = 0;
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
      done.value = withSpring(1, SETTLE);
      // Vidrio: la salida coincide con la pedida.
      runOnJS(play)("join");
    },
  );

  const ring = useMemo(() => circleAt(at.x, at.y, r * 1.25), [at.x, at.y, r]);
  const halo = useDerivedValue(() => done.value * (0.25 + 0.75 * (1 - burst.value)));

  return (
    <Group>
      <Group opacity={halo}>
        <Path path={ring} color={theme.color.ok} style="stroke" strokeWidth={10}>
          <BlurMask blur={8} style="normal" />
        </Path>
      </Group>
      <Group opacity={done}>
        <Path path={shape}>
          <RadialGradient
            c={vec(at.x - r * 0.35, at.y - r * 0.45)}
            r={r * 1.7}
            colors={[OK_LOOK.light, OK_LOOK.base, OK_LOOK.dark]}
          />
        </Path>
        <Path path={digits} color={theme.color.ok} />
      </Group>
      {SPARKS.map((angle, i) => (
        <Spark key={i} x={at.x} y={at.y} angle={angle} gold={i % 2 === 1} burst={burst} from={r} />
      ))}
    </Group>
  );
}

/**
 * La fila repetida de la tabla: la misma entrada dio la misma salida, que es el
 * invariante entero de la mecánica. Cuando se ilumina, suelta chispas sobre la
 * salida de esa fila, pero recién cuando el token llegó al pico: la tabla se
 * anota al soltar la ficha, y lo que se celebra es verlo salir igual.
 */
function TableBurst({
  at,
  rows,
  flow,
}: {
  readonly at: Spot | null;
  readonly rows: readonly PipeRow[];
  readonly flow: SharedValue<number>;
}) {
  const armed = useSharedValue(0);
  const burst = useSharedValue(1);
  const bx = useSharedValue(0);
  const by = useSharedValue(0);
  const primera = useRef(true);
  useEffect(() => {
    // La tabla con que arranca la ronda no es un evento: la trajo el nodo.
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (!at) {
      armed.value = 0;
      return;
    }
    bx.value = at.x;
    by.value = at.y;
    armed.value = 1;
    // Solo una tabla nueva es un evento; la posición viaja con ella.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  useAnimatedReaction(
    () => armed.value === 1 && flow.value >= 0.97,
    (listo) => {
      if (!listo) return;
      armed.value = 0;
      burst.value = 0;
      burst.value = withTiming(1, { duration: 720 });
      // La misma entrada dio la misma salida: vidrio, una quinta más arriba
      // que la llegada para que se oiga que es otra coincidencia.
      runOnJS(play)("join", { pitch: 7 });
    },
  );

  return (
    <Group>
      {SPARKS.map((angle, i) => (
        <MovingSpark key={i} x={bx} y={by} angle={angle} gold={i % 2 === 1} burst={burst} />
      ))}
    </Group>
  );
}

const sparkDot = (): SkPath => circleAt(0, 0, 3.2);

/** Una chispa: se abre desde el objeto y se apaga en lo que dura `burst`. */
function Spark({
  x,
  y,
  angle,
  gold,
  burst,
  from,
}: {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
  readonly from: number;
}) {
  const dot = useMemo(sparkDot, []);
  const t = useDerivedValue(() => {
    const d = from * 0.8 + 34 * burst.value;
    return [
      { translateX: x + Math.cos(angle) * d },
      { translateY: y + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [x, y, angle, from]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}

/** La misma chispa, con el origen en valores compartidos. */
function MovingSpark({
  x,
  y,
  angle,
  gold,
  burst,
}: {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
  readonly angle: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
}) {
  const dot = useMemo(sparkDot, []);
  const t = useDerivedValue(() => {
    const d = 8 + 30 * burst.value;
    return [
      { translateX: x.value + Math.cos(angle) * d },
      { translateY: y.value + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [angle]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}

/**
 * La mano fantasma. Recorre el caño del primer carril una vez y no dice nada
 * porque no puede: la mecánica se juega sin leer.
 */
function Ghost({
  layout,
  demo,
  hint,
}: {
  readonly layout: PipeLayout;
  readonly demo: SharedValue<number>;
  readonly hint: SharedValue<number>;
}) {
  const dot = useMemo(() => circleAt(0, 0, 13), []);
  const lane = layout.lanes[0];
  const desde = lane?.mouth ?? { x: 0, y: 0 };
  const hasta = lane?.spout ?? { x: 0, y: 0 };
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
