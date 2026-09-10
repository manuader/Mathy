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

    lanes.push({
      y,
      machines,
      mouth,
      spout,
      path: camino,
      counter: { x: spout.x + (alReves ? -tokenR * 2.4 : tokenR * 2.4), y },
      target: { x: spout.x + (alReves ? -tokenR * 2.4 : tokenR * 2.4), y: y + machineH * 0.62 },
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

// --- Geometría por configuración ---------------------------------------------

interface LaneGeom {
  readonly pipe: SkPath;
  readonly mouths: SkPath;
  readonly boxes: SkPath;
  readonly faces: SkPath;
  readonly marks: SkPath;
  readonly digits: SkPath;
  readonly counter: SkPath;
  readonly target: SkPath;
  readonly targetDigits: SkPath;
  readonly closed: SkPath;
  /** El tubo lateral y la luz. Vacíos cuando la regla es una máquina de verdad. */
  readonly branch: SkPath;
  readonly lamp: SkPath;
  readonly branchDigits: SkPath;
  /** La caja del lazo y su etiqueta. Vacíos cuando el carril no está lazado. */
  readonly lasso: SkPath;
  readonly lassoLabel: SkPath;
  /** El valor intermedio escrito sobre el caño, y dónde empieza a verse. */
  readonly mid: SkPath;
  /** Con qué se alimenta el caño, escrito debajo de la boca. */
  readonly mouthDigits: SkPath;
  readonly midFrom: number;
}

function buildLane(
  config: PipeConfig,
  lane: PipeLane,
  l: PipeLaneLayout,
  layout: PipeLayout,
): LaneGeom {
  const pipe = Skia.Path.Make();
  const mouths = Skia.Path.Make();
  const boxes = Skia.Path.Make();
  const faces = Skia.Path.Make();
  const marks = Skia.Path.Make();
  const digits = Skia.Path.Make();

  // El caño. En `arrow_diagram` y en notación deja de ser un tubo y se vuelve la
  // flecha sola: el objeto se retiró y quedó su dirección.
  const delgado = config.skin === "arrow_diagram" || config.skin === "function_notation";
  const puntos = l.path;
  for (let i = 0; i < puntos.length - 1; i++) {
    const a = puntos[i] as Spot;
    const b = puntos[i + 1] as Spot;
    if (delgado) arrow(pipe, a.x, b.x, l.y, 8);
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
    mouths.addCircle(boca.x, l.y, layout.tokenR * 1.15);
    arrow(mouths, pico.x - dir * layout.tokenR, pico.x + dir * layout.tokenR * 0.4, l.y, 9);
  }

  const conCarcasa = config.skin === "machines" || config.skin === "pipes";
  lane.machines.forEach((m, i) => {
    const b = l.machines[i];
    if (!b) return;
    if (conCarcasa) {
      boxes.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 10, 10));
    }
    // Con las máquinas quietas todo el carril es un trazo por capa. Cuando se
    // arrastran, cada una se dibuja en su propio grupo: si el dibujo quedara
    // acá, la carcasa seguiría al dedo y su cara se quedaría en la ranura.
    if (config.reorderable) return;
    faces.addPath(machineFacePath(config, m, b));
    if (m.inverted) marks.addPath(invertedMark(b.x + b.w - 10, b.y + 10, 11));
    const texto = machineLabel(config, m);
    if (texto !== "") addGlyphs(digits, texto, b.x + b.w / 2, b.y + b.h * 0.78, 17);
  });

  // Las ranuras vacías: el caño pide una máquina y no dice cuál.
  const closed = Skia.Path.Make();
  for (let i = lane.machines.length; i < Math.min(config.slots, PIPE_MACHINE_SLOTS); i++) {
    const b = l.machines[i];
    if (!b) continue;
    closed.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 10, 10));
  }
  // La caja cerrada adentro del caño: la incógnita que todavía no tiene nombre.
  if (config.box) {
    const b = l.machines[0];
    if (b) closed.addRRect(Skia.RRectXY(Skia.XYWHRect(l.mouth.x - 14, l.y - 14, 28, 28), 4, 4));
  }

  const counter = Skia.Path.Make();
  if (config.counter && config.numerals) {
    addGlyphs(counter, String(lane.output.value), l.counter.x, l.counter.y, 26);
  }

  const target = Skia.Path.Make();
  const targetDigits = Skia.Path.Make();
  if (lane.target) {
    const forma = tokenShape(lane.target, layout.tokenR);
    forma.transform([1, 0, l.target.x, 0, 1, l.target.y, 0, 0, 1]);
    target.addPath(forma);
    if (config.numerals) {
      addGlyphs(targetDigits, String(lane.target.value), l.target.x, l.target.y + layout.tokenR + 12, 15);
    }
  }

  // El tubo lateral: la segunda salida de una regla que manda la misma entrada a
  // dos ramas. Ningún mensaje lo dice; la luz encendida es el mensaje.
  const branch = Skia.Path.Make();
  const lamp = Skia.Path.Make();
  const branchDigits = Skia.Path.Make();
  if (lane.branch) {
    const desde = l.path[l.path.length - 2] ?? l.mouth;
    const hasta = l.branchSpout;
    branch.moveTo(desde.x, l.y);
    branch.quadTo(desde.x, hasta.y, hasta.x, hasta.y);
    lamp.addCircle(l.lamp.x, l.lamp.y, 7);
    if (config.numerals) {
      addGlyphs(branchDigits, String(lane.branch.value), hasta.x, hasta.y + layout.tokenR + 12, 15);
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
    addGlyphs(lassoLabel, rotulo, (x0 + x1) / 2, y0 - 20, 22);
  }

  // El valor intermedio, escrito sobre el tramo que va de la primera máquina a
  // la siguiente. `midFrom` es el punto del recorrido en que ese número empieza
  // a existir: antes de que la bola salga de la primera, no hay nada que decir.
  const mid = Skia.Path.Make();
  const tramos = Math.max(l.path.length - 1, 1);
  const texto = lane.midLabel ?? "";
  if (texto !== "" && l.path.length >= 3) {
    const a = l.path[1] as Spot;
    const b = l.path[2] as Spot;
    addGlyphs(mid, texto, (a.x + b.x) / 2, l.y - layout.machineH * 0.5 - 10, 18);
  }

  // Con qué se alimenta el caño, escrito debajo de la boca. Va en su propio
  // trazo y no en `digits`: con las máquinas arrastrables, `digits` no se dibuja
  // —cada carcasa se lleva su rótulo— y la entrada se perdería justo en las
  // rondas que la necesitan, que son las de cambiar el orden.
  const mouthDigits = Skia.Path.Make();
  const entrada = lane.inputLabel ?? "";
  if (entrada !== "") {
    addGlyphs(mouthDigits, entrada, l.mouth.x, l.y + layout.tokenR + 20, 16);
  }

  return {
    pipe,
    mouths,
    boxes,
    faces,
    marks,
    digits,
    counter,
    target,
    targetDigits,
    closed,
    branch,
    lamp,
    branchDigits,
    lasso,
    lassoLabel,
    mid,
    mouthDigits,
    midFrom: 1 / tramos,
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
  /** La máquina que no acepta lo que le entra: vibra y escupe. */
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
        const box = Skia.Path.Make();
        box.addRRect(
          Skia.RRectXY(
            Skia.XYWHRect(
              spot.x - layout.trayW / 2,
              spot.y - layout.trayH / 2,
              layout.trayW,
              layout.trayH,
            ),
            10,
            10,
          ),
        );
        const m = config.tray[i];
        const ficha = config.trayItems?.[i];
        const face = Skia.Path.Make();
        const digits = Skia.Path.Make();
        if (m) {
          face.addPath(machineFace(m.kind, m.value, spot.x, spot.y - 6, layout.trayH * 0.3));
          if (config.numerals) {
            const texto = m.label !== "" ? m.label : `${OP_CHAR[m.kind] ?? ""}${m.value}`;
            if (texto !== "") addGlyphs(digits, texto, spot.x, spot.y + layout.trayH * 0.3, 15);
          }
        } else if (ficha) {
          // La bandeja de fichas de entrada. La ficha se dibuja del tamaño con
          // el que va a entrar al caño: lo que se agarra es lo que viaja.
          const forma = tokenShape(ficha, layout.tokenR);
          forma.transform([1, 0, spot.x, 0, 1, spot.y - 6, 0, 0, 1]);
          face.addPath(forma);
          if (config.numerals) {
            const texto = ficha.label !== "" ? ficha.label : String(ficha.value);
            addGlyphs(digits, texto, spot.x, spot.y + layout.trayH * 0.3, 15);
          }
        }
        return { box, face, digits, esFicha: m === undefined && ficha !== undefined };
      }),
    [layout, config.tray, config.trayItems, config.numerals],
  );

  // La tabla de entradas y salidas. Las filas están todas montadas; la que esta
  // ronda no usa se dibuja fuera del lienzo.
  const table = useMemo(() => {
    const lines = Skia.Path.Make();
    const cells = Skia.Path.Make();
    const lit = Skia.Path.Make();
    if (config.table.length === 0) return { lines, cells, lit };
    const { x, y, w, rowH } = layout.table;
    lines.moveTo(x + w / 2, y);
    lines.lineTo(x + w / 2, y + rowH * Math.min(config.table.length, PIPE_TABLE_SLOTS));
    for (let i = 0; i < Math.min(config.table.length, PIPE_TABLE_SLOTS); i++) {
      const row = config.table[i];
      if (!row) continue;
      const cy = y + rowH * (i + 0.5);
      // Una entrada que ya se probó no duplica la fila: la ilumina. Es lo que
      // convierte la tabla en una prueba del invariante y no en una lista.
      if (row.repeated) {
        lit.addRRect(Skia.RRectXY(Skia.XYWHRect(x, cy - rowH / 2 + 2, w, rowH - 4), 5, 5));
      }
      addGlyphs(cells, String(row.input.value), x + w * 0.25, cy, 15);
      addGlyphs(cells, String(row.output.value), x + w * 0.75, cy, 15);
    }
    return { lines, cells, lit };
  }, [config.table, layout.table]);

  /** El renglón de notación: la tabla contraída en una línea. */
  const formula = useMemo(() => {
    const p = Skia.Path.Make();
    const texto = config.formula ?? "";
    if (texto !== "") addGlyphs(p, texto, layout.formula.x, layout.formula.y, 22);
    return p;
  }, [config.formula, layout.formula]);

  const plegada = config.onDemand;
  const cuerpoO = useDerivedValue(() => (plegada ? unfold.value : 1), [plegada]);

  return (
    <Group opacity={appear}>
      <Group opacity={cuerpoO}>
        {geoms.map((g, i) => {
          const l = layout.lanes[i] as PipeLaneLayout;
          const data = config.lanes[i] as PipeLane;
          return (
            <Group key={data.id}>
              <Path
                path={g.pipe}
                color={data.glow ? theme.color.accent : theme.color.inkDim}
                style="stroke"
                strokeWidth={config.skin === "machines" ? 10 : config.skin === "pipes" ? 6 : 2}
                strokeCap="round"
              />
              <Path path={g.mouths} color={theme.color.line} style="stroke" strokeWidth={2} />
              <Path path={g.boxes} color={theme.color.surfaceHigh} />
              {/* La ranura vacía se dibuja punteada por dentro: pide una pieza
                  sin decir cuál, que es la instrucción del nodo. */}
              <Path path={g.closed} color={theme.color.line} style="stroke" strokeWidth={2} />
              <Path path={g.marks} color={theme.color.warn} style="stroke" strokeWidth={2} />
              <Path path={g.counter} color={theme.color.ink} />
              <Path path={g.target} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
              <Path path={g.targetDigits} color={theme.color.ok} />
              {/* El tubo lateral y la luz. La paleta del proyecto no tiene rojo
                  —es contenida y oscura—, así que la alarma es `warn`. */}
              <Path
                path={g.branch}
                color={theme.color.warn}
                style="stroke"
                strokeWidth={config.skin === "machines" ? 8 : 4}
                strokeCap="round"
              />
              <Path path={g.branchDigits} color={theme.color.warn} />
              <Lamp path={g.lamp} flow={flow} />
              <BranchToken
                item={data.branch ?? data.output}
                lane={l}
                flow={flow}
                r={layout.tokenR}
                corre={(lane === -1 || lane === i) && (data.branch ?? null) !== null}
              />
              <Token
                item={itemAt(data, 0)}
                lane={l}
                flow={flow}
                jam={jam}
                r={layout.tokenR}
                corre={lane === -1 || lane === i}
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
                opaca={config.skin === "machines"}
              />
              {/* El lazo va encima de las carcasas: lo que encierra tiene que
                  verse adentro, no tapado. */}
              <Path
                path={g.lasso}
                color={theme.color.accent}
                style="stroke"
                strokeWidth={2}
                strokeCap="round"
              />
              <Path path={g.lassoLabel} color={theme.color.accent} />
              <Path path={g.mouthDigits} color={theme.color.inkDim} />
              <Mid path={g.mid} flow={flow} from={g.midFrom} corre={lane === -1 || lane === i} />
            </Group>
          );
        })}
      </Group>

      {/* El renglón de notación y la tabla de entradas y salidas. */}
      <Path path={formula} color={theme.color.ink} />
      <Path path={table.lit} color={theme.color.accent} opacity={0.18} />
      <Path path={table.lines} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={table.cells} color={theme.color.inkDim} />

      {/* El cajón de fichas de operación. Siempre montado. */}
      {trayGeom.map((g, i) => (
        <TrayPiece
          key={`tray${i}`}
          slot={trayPieces[i] as PipeSlot}
          box={g.box}
          face={g.face}
          digits={g.digits}
          filled={g.esFicha}
        />
      ))}

      <Ghost layout={layout} demo={demo} hint={hint} />
    </Group>
  );
}

/** Lo que hay en el caño en cada tramo: la entrada, cada etapa, y la salida. */
function itemAt(lane: PipeLane, index: number): PipeItem {
  return lane.stages[index] ?? lane.output ?? lane.input;
}

/**
 * El token recorriendo el caño. Su posición y su tamaño se derivan de `flow`, y
 * el tamaño cambia al pasar por cada máquina: el salto es lo que se ve, y en el
 * nodo 9 es lo único que se ve, porque no hay numerales.
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
  const puntos = lane.path;
  // Los tamaños de cada tramo, ya resueltos por el nodo: el token entra con el
  // de la entrada, sale de cada máquina con el de su etapa y termina con el de
  // la salida. La escena interpola entre ellos y no calcula ninguno.
  const tamanos = useMemo(
    () => [input.size, ...stages.map((s) => s.size), output.size],
    [input.size, stages, output.size],
  );

  const transform = useDerivedValue(() => {
    if (puntos.length < 2) return [{ translateX: 0 }, { translateY: 0 }, { scale: 0.0001 }];
    const t = Math.max(0, Math.min(0.9999, flow.value)) * (puntos.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    const a = puntos[i] ?? puntos[0];
    const b = puntos[i + 1] ?? a;
    if (!a || !b) return [{ translateX: 0 }, { translateY: 0 }, { scale: 0.0001 }];
    const e = f * f * (3 - 2 * f);
    const sa = tamanos[Math.min(i, tamanos.length - 1)] ?? 1;
    const sb = tamanos[Math.min(i + 1, tamanos.length - 1)] ?? sa;
    // El salto de tamaño ocurre adentro de la máquina, no en el tramo de caño:
    // por eso el interpolado se concentra en el medio del tirón.
    const k = Math.max(0, Math.min(1, (e - 0.35) / 0.3));
    const escala = Math.max(0.18, sa + (sb - sa) * k);
    return [
      { translateX: a.x + (b.x - a.x) * e + jam.value * 6 },
      { translateY: a.y + (b.y - a.y) * e },
      { scale: escala },
    ];
  }, [puntos, tamanos]);

  const opacity = useDerivedValue(() => (corre ? Math.min(1, flow.value * 8) : 0), [corre]);

  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={shape} color={theme.color.accent} />
    </Group>
  );
}

/** Las carcasas de las máquinas. Cada una puede llevarse con el dedo. */
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
  // Cuando las máquinas no se mueven, todo el carril es un solo trazo por capa y
  // el presupuesto de elementos animados no se entera de que existen.
  if (!move) {
    return (
      <>
        <Path path={geom.boxes} color={opaca ? theme.color.surfaceHigh : "transparent"} />
        <Path path={geom.boxes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={geom.faces} color={theme.color.warn} style="stroke" strokeWidth={2.5} strokeCap="round" />
        <Path path={geom.digits} color={theme.color.ink} />
      </>
    );
  }
  return (
    <>
      {Array.from({ length: PIPE_MACHINE_SLOTS }, (_, i) => (
        <MachinePiece
          key={i}
          slot={pieces[i] as PipeSlot}
          box={lane.machines[i] as Box}
          config={config}
          machine={machines[i]}
          elegida={picked === i}
          opaca={opaca}
        />
      ))}
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
}: {
  readonly slot: PipeSlot;
  readonly box: Box;
  readonly config: PipeConfig;
  readonly machine: PipeMachine | undefined;
  readonly elegida: boolean;
  readonly opaca: boolean;
}) {
  const geom = useMemo(() => {
    const caja = Skia.Path.Make();
    caja.addRRect(Skia.RRectXY(Skia.XYWHRect(box.x, box.y, box.w, box.h), 10, 10));
    const cara = Skia.Path.Make();
    const marca = Skia.Path.Make();
    const digits = Skia.Path.Make();
    if (machine) {
      cara.addPath(machineFacePath(config, machine, box));
      if (machine.inverted) marca.addPath(invertedMark(box.x + box.w - 10, box.y + 10, 11));
      const texto = machineLabel(config, machine);
      if (texto !== "") addGlyphs(digits, texto, box.x + box.w / 2, box.y + box.h * 0.78, 17);
    }
    return { caja, cara, marca, digits };
  }, [box, config, machine]);

  const transform = useDerivedValue(() => [
    { translateX: slot.dx.value },
    { translateY: slot.dy.value },
  ]);
  const opacity = useDerivedValue(() => (machine ? slot.alive.value : 0), [machine]);

  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={geom.caja} color={opaca ? theme.color.surfaceHigh : theme.color.surface} />
      <Path
        path={geom.caja}
        color={elegida ? theme.color.accent : theme.color.line}
        style="stroke"
        strokeWidth={elegida ? 2.5 : STROKE}
      />
      <Path path={geom.cara} color={theme.color.warn} style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={geom.marca} color={theme.color.warn} style="stroke" strokeWidth={2} />
      <Path path={geom.digits} color={theme.color.ink} />
    </Group>
  );
}

function TrayPiece({
  slot,
  box,
  face,
  digits,
  filled,
}: {
  readonly slot: PipeSlot;
  readonly box: SkPath;
  readonly face: SkPath;
  readonly digits: SkPath;
  /** La ficha de entrada se pinta llena, como el token que va a viajar. */
  readonly filled: boolean;
}) {
  const transform = useDerivedValue(() => [
    { translateX: slot.dx.value },
    { translateY: slot.dy.value },
  ]);
  return (
    <Group transform={transform} opacity={slot.alive}>
      <Path path={box} color={theme.color.surfaceHigh} />
      <Path path={box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      {filled ? (
        <Path path={face} color={theme.color.accent} />
      ) : (
        <Path path={face} color={theme.color.warn} style="stroke" strokeWidth={2} strokeCap="round" />
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
  flow,
  from,
  corre,
}: {
  readonly path: SkPath;
  readonly flow: SharedValue<number>;
  readonly from: number;
  readonly corre: boolean;
}) {
  const opacity = useDerivedValue(
    () => (corre ? Math.max(0, Math.min(1, (flow.value - from) * 5)) : 0),
    [corre, from],
  );
  return <Path path={path} color={theme.color.inkDim} opacity={opacity} />;
}

/**
 * La luz del tubo lateral. Se enciende cuando la segunda salida ya cayó, no
 * antes: lo que la prende es haber visto salir dos cosas de una.
 */
function Lamp({ path, flow }: { readonly path: SkPath; readonly flow: SharedValue<number> }) {
  const opacity = useDerivedValue(() => Math.max(0, Math.min(1, (flow.value - 0.55) * 3)));
  return <Path path={path} color={theme.color.warn} opacity={opacity} />;
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
      <Path path={shape} color={theme.color.warn} />
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
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 13);
    return p;
  }, []);
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
      <Path path={dot} color={theme.color.ink} style="stroke" strokeWidth={2} />
    </Group>
  );
}
