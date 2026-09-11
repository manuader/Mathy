/**
 * El libro de cuentas: la mecánica `ledger` como escena propia.
 *
 * El puesto de frutas del nodo 10. El libro ocupa el centro con sus filas, los
 * objetos sueltos esperan abajo en el mostrador, y desde la capa `visual` el
 * árbol de cofres del nodo 9 aparece a la izquierda con una hoja vacía que late.
 * La balanza no la dibuja esta escena: la dibuja `BalanceScene`, que ya existía,
 * y esta reserva el hueco donde va.
 *
 * POR QUÉ ES UNA ESCENA NUEVA. `ledger` ya tenía superficie en `BowlScene`
 * (nodo 1), pero está tipada contra `CardinalityProblem` y su franja son dos
 * filas de huecos enfrentados, que es el emparejamiento del nodo 1 y no un
 * libro de N filas con dueño. Reusarla exigía fabricar un problema de
 * cardinalidad falso, que es peor acoplamiento que la duplicación; el nodo 8
 * dejó su libro de cuentas en otra escena por exactamente esta razón. Lo que sí
 * se hizo es lo contrario de duplicar: esta escena no toma el problema de
 * ningún nodo sino una configuración estructural, así que el nodo que venga
 * atrás arma un objeto con estos campos y no importa nada de acá.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma con el máximo de objetos que el nivel
 *    admite y no cambia: lo que todavía no está en juego está montado con
 *    opacidad cero, incluidas las chispas de cada fila.
 * 2. Lo que se repite y no se anima de a uno va en un solo `SkPath`: los
 *    renglones del libro, los conteos, las aristas del árbol y los objetos de
 *    una fila son un trazo cada uno. El volumen se le da al trazo entero —un
 *    degradado, un trazo de brillos, uno de sombras—, no a cada objeto. Solo
 *    los objetos del mostrador, que se mueven sueltos, tienen componente.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: la posición de un objeto se
 *    deriva de su destino más el desplazamiento del dedo, los dos en valores
 *    compartidos. El destino cambia cuando el jugador suelta, no por cuadro.
 *
 * El color tiene tres trabajos. Cada clase de objeto tiene el suyo, porque
 * separar clases es el nivel: el cajón cerrado es siempre del azul de equipo
 * de la incógnita, y las frutas tienen el color de lo que son. La menta dice
 * "coincide" (la fila entró, el renglón quedó cierto) y el ámbar "mirá acá" (la
 * fila devolvió algo, el renglón se inclinó, las marcas no son la misma). Lo
 * que espera un gesto —la fila vacía, la hoja sin cajón, el tramo sin ficha—
 * es un hueco punteado blanco que late: invita, no califica.
 *
 * Nada de texto: los conteos y las letras son contornos del atlas de glifos.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BlurMask, Group, LinearGradient, Path, RadialGradient, Skia, vec, type SkPath } from "@shopify/react-native-skia";
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { theme } from "../ui/theme.ts";
import { chipTone } from "../ui/Kit.tsx";
import { ChipBodies } from "../ui/ChipBodies.tsx";
import { play, type Sfx } from "../ui/sound.ts";
import {
  BOX_LOOK,
  EventSparks,
  REVEAL_LOOK,
  STEEL_LOOK,
  WEIGHT_LOOK,
  type VolumeLook,
} from "./BalanceScene.tsx";

/** Cuánto tarda un objeto soltado en llegar a su fila: ahí rebota y ahí salen las chispas. */
const LANDING_MS = 170;
/** El ancho del rincón de Tomi (hasta 72 px desde 16 de margen), que el mostrador no pisa. */
const TRAY_CORNER = 84;
/** Lo mínimo entre dos objetos del mostrador en una hilera; con menos, van en dos. */
const TRAY_MIN_STEP = 36;
/** Cuánto duran las chispas y el halo de un evento. */
const BURST_MS = 720;

/**
 * La escala de la fila que se llena: cada objeto que entra suena un escalón más
 * arriba, como el agua que sube en una botella. Pentatónica, para que cualquier
 * tramo suene a una subida y no a un error.
 */
const FILL = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24] as const;
const fillPitch = (i: number): number => FILL[Math.max(0, Math.min(i, FILL.length - 1))] as number;

/**
 * Suena un efecto cuando pasa lo que lo causa: con `delay`, cuando el objeto
 * soltado termina de viajar. Se llama desde JavaScript o, desde un worklet, con
 * `runOnJS`. Nada de acá puede romper el juego: sin audio, no suena.
 */
function sfx(name: Sfx, pitch = 0, delay = 0): void {
  if (delay <= 0) play(name, { pitch });
  else setTimeout(() => play(name, { pitch }), delay);
}

// --- Materiales --------------------------------------------------------------

/**
 * El color de lo que es. Las frutas lo conservan porque qué se cuenta es parte
 * del nivel: una manzana tiene que verse manzana en cualquier fila. No hay
 * frutas verdes ni amarillas: el verde es "coincide" y el amarillo es "lo
 * aprendido", y una pera verde competiría con los dos. La pera es crema.
 */
const APPLE: VolumeLook = { light: "#ffb8c0", base: "#ff5f73", dark: "#b8293f" };
const GRAPE: VolumeLook = { light: "#dccfff", base: "#9b7dff", dark: "#5438c4" };
const PEAR: VolumeLook = { light: "#fff7e3", base: "#e3d4a8", dark: "#94845a" };

const SHAPE_LOOK: Readonly<Record<string, VolumeLook>> = {
  apple: APPLE,
  grape: GRAPE,
  pear: PEAR,
  // La baldosa unidad es una pesa de piso: neutra, como las de la balanza.
  tile_unit: WEIGHT_LOOK,
};

/** Las clases abiertas que no son una fruta conocida se reparten estos tres. */
const OPEN_LOOKS: readonly VolumeLook[] = [APPLE, GRAPE, PEAR];

/** El ámbar con volumen, para la barra de un renglón que dejó de ser cierto. */
const WARN_LOOK: VolumeLook = { light: "#ffe2ad", base: theme.color.warn, dark: "#c47a10" };

/** La madera de los cofres del árbol: la misma de los cuencos del nodo 1. */
const WOOD: VolumeLook = { light: "#d9965a", base: "#a8652f", dark: "#5e3417" };

const SHINE = "rgba(255, 255, 255, 0.5)";
const SHADOW = "rgba(0, 0, 0, 0.28)";
const STEM = "#6b4423";
/** Las marcas de las tapas: tinta oscura sobre el azul, que se lee sin forzar. */
const MARK_INK = "rgba(6, 24, 44, 0.85)";
/** El hueco que espera un gesto. */
const SLOT_LINE = "rgba(255, 255, 255, 0.6)";

/**
 * El volumen de una clase. El cajón cerrado es siempre el mismo, porque es la
 * incógnita y tiene que reconocerse de un vistazo en cualquier nivel; es también
 * la caja de la balanza, y por eso comparte su material.
 */
export const lookOfKind = (kind: LedgerKind | undefined, index: number): VolumeLook => {
  if (kind?.closed === true) return BOX_LOOK;
  const propio = kind ? SHAPE_LOOK[kind.shape] : undefined;
  return propio ?? (OPEN_LOOKS[Math.abs(index) % OPEN_LOOKS.length] as VolumeLook);
};

/** El color plano de una clase: el cuerpo de su volumen. */
export const colorOfKind = (kind: LedgerKind | undefined, index: number): string =>
  lookOfKind(kind, index).base;

// --- Lo que la escena necesita saber -----------------------------------------

/**
 * Una clase de objeto. Es una forma y no el tipo de un nodo: `BoxKind` la
 * cumple sin tocar nada, y cualquier otro nodo que reuse el libro arma un
 * objeto con estos campos.
 */
export interface LedgerKind {
  readonly shape: string;
  /** La marca pintada en la tapa, o -1 si el objeto no es un cajón. */
  readonly mark: number;
  readonly closed: boolean;
  /** El nombre que la marca recibe al volverse letra. Vacío antes de `symbolic`. */
  readonly letter: string;
}

export interface LedgerToken {
  readonly id: string;
  readonly kind: number;
}

/** Un nodo del árbol de cofres, aplanado: el padre viaja como índice. */
export interface LedgerTreeNode {
  readonly id: string;
  readonly parent: number;
  readonly op: string | null;
  readonly value: number | null;
  readonly unknown: boolean;
}

/** Las etapas de desvanecimiento del libro: el objeto, la barra y la ficha. */
export type LedgerSkin = "objects" | "bars" | "chips";

/**
 * Un tramo de una fila: cuántos objetos de una clase entraron, con su signo y
 * con la ficha que el jugador les puso debajo.
 *
 * Es lo que necesita un renglón que cuenta **más de una clase a la vez**, que
 * el libro del nodo 10 no tenía: ahí cada fila tenía un dueño y su conteo. Un
 * renglón del cartel de frutas es una suma de tramos con un total al otro lado
 * de la línea, así que los tramos entran por acá y la fila con dueño único
 * sigue funcionando exactamente igual cuando este campo no viene.
 */
export interface LedgerSegment {
  readonly kind: number;
  readonly count: number;
  /** -1 dibuja el tramo restado: lleva el menos adelante. */
  readonly sign: 1 | -1;
  /** El valor que la clase ya mostró, o `null` mientras nadie lo dijo. */
  readonly value: number | null;
}

export interface LedgerConfig {
  readonly kinds: readonly LedgerKind[];
  readonly tokens: readonly LedgerToken[];
  readonly skin: LedgerSkin;
  /** Cuántas filas tiene el libro. Empiezan vacías y sin dueño. */
  readonly rows: number;
  /** Por fila, la clase que la ocupa, o -1 si sigue vacía. */
  readonly owner: readonly number[];
  /** Por fila, cuántos objetos entraron. */
  readonly counts: readonly number[];
  /** El árbol de cofres. Vacío cuando el nivel no lo usa. */
  readonly tree: readonly LedgerTreeNode[];
  /** La clase del cajón que ocupa la hoja vacía, o -1 si todavía está latiendo. */
  readonly leaf: number;
  /**
   * Cuántos objetos tiene que poder mostrar una fila. El libro se dibuja del
   * ancho que ese número pide y no del ancho de la pantalla: una fila de tres
   * manzanas en un renglón de mil píxeles no se lee como una fila.
   */
  readonly capacity: number;
  /** La balanza ocupa el costado derecho: el libro se corre y no se tapa. */
  readonly balance: boolean;
  /**
   * El mostrador donde esperan los objetos sueltos. Ausente: se dibuja, que es
   * como lo usa el nodo 10. En falso, el nodo trae su propia bandeja y una
   * segunda línea abajo sería un mostrador donde nunca se apoya nada.
   */
  readonly counter?: boolean;
  /**
   * Por fila, los tramos que la ocupan. Ausente: la fila tiene un dueño único y
   * se dibuja con `owner` y `counts`, que es como la usan los nodos 10 y 15.
   */
  readonly segments?: readonly (readonly LedgerSegment[])[];
  /**
   * Por fila, lo que hay del otro lado de la línea. `null` en una fila que no
   * afirma nada todavía. Solo se lee con `segments` puestos.
   */
  readonly totals?: readonly (number | null)[];
  /**
   * Por fila, para qué lado cae la línea: 1 si pesa más la izquierda, -1 si
   * pesa más el total, 0 si la fila está derecha o abierta. Es un dato y no una
   * animación a propósito: la fila inclinada tiene que verse aunque el navegador
   * esté estrangulando los cuadros.
   */
  readonly tilts?: readonly number[];
  /**
   * La llave que abraza los renglones y significa "las dos a la vez". Es el
   * símbolo que nace en el nodo 16 y no lo dibuja ningún otro.
   */
  readonly brace?: boolean;
}

export interface LedgerBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface LedgerSpot {
  readonly x: number;
  readonly y: number;
}

/** Un lugar de la escena y si lo que va ahí se ve. */
export interface LedgerPlace {
  readonly x: number;
  readonly y: number;
  readonly on: boolean;
}

export interface LedgerLayout {
  readonly width: number;
  readonly height: number;
  /** Una caja por ranura de fila, estén con dueño o no. */
  readonly rows: readonly LedgerBox[];
  /** Cuánto ocupa un objeto dentro de una fila. */
  readonly slotW: number;
  readonly tray: LedgerBox;
  /** Dónde espera cada objeto en el mostrador. */
  readonly tokens: readonly LedgerSpot[];
  /** La región de la balanza. Ancho cero cuando el nivel no la usa. */
  readonly balance: LedgerBox;
  /** Dónde cae cada nodo del árbol. */
  readonly nodes: readonly LedgerSpot[];
  readonly nodeR: number;
  /** El radio de un objeto de tamaño uno. */
  readonly unit: number;
  /**
   * Por fila, dónde cae cada tramo. Es lo que el gesto necesita para saber bajo
   * qué fruta se soltó una ficha, y sale de la misma cuenta que el dibujo: con
   * dos geometrías, la ficha entraría donde no se ve. Vacío sin `segments`.
   */
  readonly cells: readonly (readonly LedgerSpot[])[];
  /** Por fila, dónde cae la línea que se inclina. Vacío sin `segments`. */
  readonly beams: readonly LedgerSpot[];
  /** Por fila, dónde cae el total. Vacío sin `segments`. */
  readonly totals: readonly LedgerSpot[];
  /** Cuánto ocupa un tramo a lo ancho. */
  readonly cellW: number;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, el objeto entraría donde no se ve.
 */
export function ledgerLayout(
  config: LedgerConfig,
  width: number,
  height: number,
  rowSlots: number,
  tokenSlots: number,
): LedgerLayout {
  const hayArbol = config.tree.length > 0;
  // El árbol, cuando lo hay, es lo único que se toca en esa ronda: el libro ya
  // está escrito. En el teléfono un tercio del ancho dejaba las hojas a 30 px
  // una de otra y de 26 px de diámetro, y un dedo cubría dos; ahí el árbol se
  // lleva la mitad del ancho y el libro se corre.
  const arbolW = hayArbol ? Math.max(width * 0.32, Math.min(width * 0.5, 220)) : 0;
  // La balanza se lleva el costado derecho y el árbol el izquierdo. Los dos no
  // aparecen juntos en ningún nivel, así que el libro nunca queda apretado
  // entre las dos cosas.
  const disponible0 = hayArbol ? arbolW + width * 0.04 : width * 0.06;
  const disponible1 = config.balance ? width * 0.45 : width * 0.94;
  const libre = Math.max(140, disponible1 - disponible0);

  // El conteo vive al final de la fila y no puede compartir lugar con el último
  // objeto, así que el ancho es el de las casillas más el aire de los dos
  // extremos: la cabecera a la izquierda y el conteo a la derecha.
  const slotW = 34;
  const bookW = Math.min(libre, 74 + Math.max(2, config.capacity) * slotW);
  const bookX0 = disponible0 + (hayArbol || config.balance ? 0 : (libre - bookW) / 2);
  const unit = Math.max(7, Math.min(13, slotW * 0.36));

  const rowH = Math.min(54, (height * 0.62) / Math.max(rowSlots, 1));
  // El bloque de filas va centrado en su banda: con dos filas de cuatro
  // ranuras, el libro no puede quedar pegado al borde de arriba.
  const alto = rowH * Math.max(1, config.rows);
  const top = Math.max(height * 0.06, height * 0.38 - alto / 2);
  const rows: LedgerBox[] = Array.from({ length: rowSlots }, (_, i) => ({
    x: bookX0,
    y: top + i * rowH,
    w: bookW,
    h: rowH - 6,
  }));

  const trayY = height - Math.max(34, height * 0.11);
  // El mostrador deja libre el rincón de abajo a la izquierda: ahí vive Tomi, y
  // en el teléfono el mostrador queda a su altura. Con doce objetos, el primero
  // caía debajo de Tomi y no había cómo agarrarlo.
  const trayX0 = Math.max(width * 0.06, TRAY_CORNER);
  const trayW = width * 0.94 - trayX0;
  // Los objetos que hay se reparten el mostrador centrados. Si en una hilera
  // quedarían a menos de un dedo uno de otro —doce objetos en el teléfono caían
  // a 23 px—, van en dos hileras. Las ranuras que sobran quedan montadas donde
  // termina la fila, con opacidad cero.
  const cuantos = Math.max(1, config.tokens.length);
  const dosHileras = cuantos > 1 && trayW / cuantos < TRAY_MIN_STEP;
  const porHilera = dosHileras ? Math.ceil(cuantos / 2) : cuantos;
  const paso = Math.min(trayW / porHilera, unit * 3.6);
  const medioHilera = dosHileras ? unit * 1.35 : 0;
  const tray: LedgerBox = { x: trayX0, y: trayY - 26 - medioHilera, w: trayW, h: 52 + medioHilera * 2 };
  const trayCx = tray.x + tray.w / 2;
  const tokens: LedgerSpot[] = Array.from({ length: tokenSlots }, (_, i) => {
    const j = Math.min(i, cuantos - 1);
    const abajo = dosHileras && j >= porHilera;
    const col = abajo ? j - porHilera : j;
    const enHilera = !dosHileras ? cuantos : abajo ? cuantos - porHilera : porHilera;
    return {
      x: trayCx + (col - (enHilera - 1) / 2) * paso,
      y: trayY + (dosHileras ? (abajo ? medioHilera : -medioHilera) : 0),
    };
  });

  const balance: LedgerBox = config.balance
    ? { x: width * 0.47, y: 0, w: width * 0.51, h: height * 0.84 }
    : { x: 0, y: 0, w: 0, h: 0 };

  // El renglón del cartel se parte en tres: los tramos a la izquierda, la línea
  // en el medio y el total a la derecha. Las tres medidas salen de acá y no del
  // dibujo, porque la ficha se suelta sobre un tramo y el hit test tiene que
  // medir lo mismo que se ve.
  const segments = config.segments;
  const cellW = (bookW * 0.56) / Math.max(2, anchoDeTramos(segments));
  const cells: LedgerSpot[][] = [];
  const beams: LedgerSpot[] = [];
  const totales: LedgerSpot[] = [];
  if (segments) {
    for (let i = 0; i < rowSlots; i++) {
      const box = rows[i] as LedgerBox;
      const cy = box.y + box.h / 2;
      const cuantos = Math.max(2, anchoDeTramos(segments));
      cells.push(
        Array.from({ length: cuantos }, (_, j) => ({
          x: box.x + 14 + (j + 0.5) * cellW,
          y: cy,
        })),
      );
      beams.push({ x: box.x + bookW * 0.7, y: cy });
      totales.push({ x: box.x + bookW - 26, y: cy });
    }
  }

  return {
    width,
    height,
    rows,
    slotW,
    tray,
    tokens,
    balance,
    ...treeSpots(config.tree, arbolW, top, height * 0.5),
    unit,
    cells,
    beams,
    totals: totales,
    cellW,
  };
}

/** Cuántos tramos tiene el renglón más cargado: todos se dibujan con esa medida. */
const anchoDeTramos = (segments: readonly (readonly LedgerSegment[])[] | undefined): number =>
  segments ? Math.max(1, ...segments.map((s) => s.length)) : 1;

/**
 * El árbol se acomoda solo: la profundidad da la altura y el orden de las hojas
 * da el ancho. Una rama queda en el medio de sus dos hijos, que es lo que hace
 * legible que la hoja vacía es una hoja y no un renglón más.
 */
function treeSpots(
  tree: readonly LedgerTreeNode[],
  w: number,
  top: number,
  h: number,
): { nodes: LedgerSpot[]; nodeR: number } {
  if (tree.length === 0) return { nodes: [], nodeR: 0 };
  const hijos = (i: number): number[] =>
    tree.map((n, j) => (n.parent === i ? j : -1)).filter((j) => j >= 0);

  const depth = tree.map(() => 0);
  for (let i = 0; i < tree.length; i++) {
    const p = (tree[i] as LedgerTreeNode).parent;
    depth[i] = p < 0 ? 0 : (depth[p] ?? 0) + 1;
  }
  const maxDepth = Math.max(...depth, 1);

  // Las hojas se reparten el ancho en el orden en que el recorrido las visita,
  // y cada rama se centra entre las suyas.
  const x = tree.map(() => 0);
  let orden = 0;
  const hojas = tree.filter((n) => n.op === null).length;
  const visit = (i: number): number => {
    const cs = hijos(i);
    if (cs.length === 0) {
      const pos = (orden + 0.5) / Math.max(hojas, 1);
      orden += 1;
      x[i] = pos;
      return pos;
    }
    let suma = 0;
    for (const c of cs) suma += visit(c);
    x[i] = suma / cs.length;
    return x[i] as number;
  };
  const raiz = tree.findIndex((n) => n.parent === -1);
  visit(raiz < 0 ? 0 : raiz);

  const paso = h / Math.max(maxDepth, 1);
  const margen = w * 0.14;
  return {
    nodes: tree.map((_, i) => ({
      x: margen + (x[i] as number) * (w - margen * 2),
      y: top + (depth[i] as number) * paso,
    })),
    nodeR: Math.max(13, Math.min(20, w * 0.09)),
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Una cadena de glifos del atlas, centrada. Sale del mismo atlas que compone
 * las ecuaciones, así que el `3` de un conteo y el `3` de una ecuación son el
 * mismo objeto, y la `x` de una ficha es la misma `x` que el jugador va a ver
 * el resto del juego.
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

// --- Formas ------------------------------------------------------------------

/**
 * El cuerpo del objeto, para rellenar con su volumen. Las tres primeras son
 * fruta, `crate` es el cajón cerrado y las últimas son las figuras inventadas
 * del último nivel, que no se parecen a nada que el jugador conozca y por eso
 * solo se pueden agrupar por identidad. Los detalles que no son cuerpo (el
 * tallo, la tapa, la marca) van en otros trazos, porque llevan otro color.
 */
function shapePath(shape: string, r: number): SkPath {
  const p = Skia.Path.Make();
  // Las tres piezas de `tiles`: la baldosa cuadrada unidad, la tira de largo
  // desconocido y el cuadrado de ese mismo lado. Se dibujan con la proporción
  // que tienen sobre el piso, porque es la proporción lo único que las
  // distingue: una columna de tiras y una de baldosas no se apilan justamente
  // porque no tienen la misma forma.
  if (shape === "tile_unit") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2), 2, 2));
    return p;
  }
  if (shape === "tile_strip") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.4, -r * 1.3, r * 0.8, r * 2.6), 2, 2));
    return p;
  }
  if (shape === "tile_square") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 1.1, -r * 1.1, r * 2.2, r * 2.2), 3, 3));
    return p;
  }
  if (shape === "crate") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 1.1, -r * 0.95, r * 2.2, r * 1.9), 3, 3));
    return p;
  }
  if (shape === "pear") {
    p.addOval(Skia.XYWHRect(-r * 0.85, -r * 0.2, r * 1.7, r * 1.5));
    p.addOval(Skia.XYWHRect(-r * 0.55, -r * 1.1, r * 1.1, r * 1.1));
    return p;
  }
  if (shape === "grape") {
    p.addCircle(-r * 0.5, r * 0.35, r * 0.55);
    p.addCircle(r * 0.5, r * 0.35, r * 0.55);
    p.addCircle(0, -r * 0.5, r * 0.55);
    return p;
  }
  if (shape === "wedge") {
    p.moveTo(0, -r);
    p.lineTo(r, r * 0.8);
    p.lineTo(-r, r * 0.8);
    p.close();
    return p;
  }
  if (shape === "ring") {
    // El agujero va en sentido contrario, así el relleno lo respeta: con los
    // dos círculos en el mismo sentido, el anillo se rellenaba como un disco.
    p.addOval(Skia.XYWHRect(-r, -r, r * 2, r * 2));
    p.addOval(Skia.XYWHRect(-r * 0.45, -r * 0.45, r * 0.9, r * 0.9), true);
    return p;
  }
  if (shape === "star") {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const b = a + Math.PI / 5;
      if (i === 0) p.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else p.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      p.lineTo(Math.cos(b) * r * 0.45, Math.sin(b) * r * 0.45);
    }
    p.close();
    return p;
  }
  // La manzana, que es la que abre el nodo.
  p.addCircle(0, r * 0.1, r * 0.92);
  return p;
}

/** El brillo arriba a la izquierda, puesto sobre el cuerpo de cada forma. */
function shinePath(shape: string, r: number): SkPath {
  const p = Skia.Path.Make();
  const oval = (x: number, y: number, w: number, h: number): void => {
    p.addOval(Skia.XYWHRect(x * r, y * r, w * r, h * r));
  };
  const tira = (x: number, y: number, w: number, h: number): void => {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(x * r, y * r, w * r, h * r), 1, 1));
  };
  if (shape === "tile_unit") tira(-0.45, -0.48, 0.6, 0.14);
  else if (shape === "tile_strip") tira(-0.28, -1.15, 0.14, 1.3);
  else if (shape === "tile_square") tira(-0.95, -0.95, 1.2, 0.16);
  else if (shape === "crate") tira(-0.92, -0.32, 1.1, 0.16);
  else if (shape === "wedge") oval(-0.32, -0.25, 0.3, 0.22);
  else if (shape === "ring") oval(-0.78, -0.62, 0.36, 0.22);
  else if (shape === "star") oval(-0.28, -0.4, 0.3, 0.2);
  else if (shape === "grape") oval(-0.3, -0.78, 0.3, 0.2);
  else if (shape === "pear") oval(-0.36, -0.82, 0.32, 0.22);
  else oval(-0.62, -0.5, 0.5, 0.32);
  return p;
}

/** El tallo de la manzana, en su madera. Las demás formas no tienen. */
function stemPath(shape: string, r: number): SkPath {
  const p = Skia.Path.Make();
  if (shape === "apple") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 0.1, -r * 1.4, r * 0.2, r * 0.6), r * 0.1, r * 0.1));
  }
  return p;
}

/**
 * La marca pintada en la tapa. Tres dibujos que se distinguen de un vistazo y
 * sin leer: es lo único que separa un cajón de otro mientras estén cerrados.
 */
function markPath(mark: number, r: number): SkPath {
  const p = Skia.Path.Make();
  if (mark <= 0) {
    p.moveTo(0, -r * 0.5);
    p.lineTo(r * 0.5, r * 0.35);
    p.lineTo(-r * 0.5, r * 0.35);
    p.close();
    return p;
  }
  if (mark === 1) {
    p.addCircle(0, 0, r * 0.45);
    p.moveTo(-r * 0.45, 0);
    p.lineTo(r * 0.45, 0);
    return p;
  }
  p.addRect(Skia.XYWHRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8));
  p.moveTo(-r * 0.4, -r * 0.4);
  p.lineTo(r * 0.4, r * 0.4);
  return p;
}

/** Lo que se traza en tinta sobre el cuerpo: la línea de la tapa del cajón y su marca. */
function detailPath(kind: LedgerKind, r: number): SkPath {
  const p = Skia.Path.Make();
  if (kind.shape === "crate") {
    p.moveTo(-r * 1.1, -r * 0.45);
    p.lineTo(r * 1.1, -r * 0.45);
  }
  // La marca va en cada tapa y no solo en la cabecera: lo que hace que dos
  // cajones sean el mismo objeto es la marca, y tiene que verse.
  if (kind.closed && kind.mark >= 0) {
    const m = markPath(kind.mark, r);
    m.transform([1, 0, 0, 0, 1, r * 0.25, 0, 0, 1]);
    p.addPath(m);
  }
  return p;
}

/** Un rectángulo de borde punteado, dibujado a mano: la caja de largo desconocido. */
function dashedRect(target: SkPath, x: number, y: number, w: number, h: number, dash: number): void {
  const lado = (x0: number, y0: number, x1: number, y1: number): void => {
    const largo = Math.hypot(x1 - x0, y1 - y0);
    const pasos = Math.max(1, Math.round(largo / (dash * 2)));
    for (let i = 0; i < pasos; i++) {
      const a = i / pasos;
      const b = (i + 0.5) / pasos;
      target.moveTo(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a);
      target.lineTo(x0 + (x1 - x0) * b, y0 + (y1 - y0) * b);
    }
  };
  lado(x, y, x + w, y);
  lado(x + w, y, x + w, y + h);
  lado(x + w, y + h, x, y + h);
  lado(x, y + h, x, y);
}

/**
 * Las partes con que se dibuja un grupo de objetos de una misma clase, cada una
 * en un solo trazo: el cuerpo lleva el degradado de la clase, y el resto (el
 * brillo, la tinta de las tapas, el tallo, la sombra en el piso) va aparte
 * porque lleva otro color. `veil` y `dash` son el segmento de largo desconocido
 * de la barra: un velo del color de la clase con el borde punteado.
 */
interface ObjParts {
  readonly body: SkPath;
  readonly shine: SkPath;
  readonly detail: SkPath;
  readonly stem: SkPath;
  readonly shadow: SkPath;
  readonly veil: SkPath;
  readonly dash: SkPath;
}

const emptyParts = (): ObjParts => ({
  body: Skia.Path.Make(),
  shine: Skia.Path.Make(),
  detail: Skia.Path.Make(),
  stem: Skia.Path.Make(),
  shadow: Skia.Path.Make(),
  veil: Skia.Path.Make(),
  dash: Skia.Path.Make(),
});

/** Agrega un objeto entero, centrado en `(cx, cy)`, a las partes de su grupo. */
function addObject(parts: ObjParts, kind: LedgerKind, r: number, cx: number, cy: number): void {
  const m = [1, 0, cx, 0, 1, cy, 0, 0, 1];
  const poner = (target: SkPath, src: SkPath): void => {
    src.transform(m);
    target.addPath(src);
  };
  poner(parts.body, shapePath(kind.shape, r));
  poner(parts.shine, shinePath(kind.shape, r));
  poner(parts.stem, stemPath(kind.shape, r));
  poner(parts.detail, detailPath(kind, r));
  parts.shadow.addOval(Skia.XYWHRect(cx - r * 0.8, cy + r * 0.84, r * 1.6, r * 0.34));
}

/**
 * Un grupo de objetos con volumen: sombra, cuerpo con el degradado de su clase
 * (luz arriba), tallo, brillo y la tinta de las tapas. Siete dibujos, sean dos
 * objetos o veinte.
 */
function ObjectBodies({
  parts,
  look,
  y0,
  y1,
}: {
  readonly parts: ObjParts;
  readonly look: VolumeLook;
  readonly y0: number;
  readonly y1: number;
}) {
  return (
    <>
      <Path path={parts.shadow} color={SHADOW} />
      <Path path={parts.veil} color={look.base} opacity={0.2} />
      <Path path={parts.body}>
        <LinearGradient start={vec(0, y0)} end={vec(0, Math.max(y0 + 1, y1))} colors={[look.light, look.base, look.dark]} />
      </Path>
      <Path path={parts.stem} color={STEM} />
      <Path path={parts.shine} color={SHINE} />
      <Path path={parts.detail} color={MARK_INK} style="stroke" strokeWidth={1.8} strokeCap="round" strokeJoin="round" />
      <Path path={parts.dash} color={look.base} style="stroke" strokeWidth={2} strokeCap="round" />
    </>
  );
}

/**
 * Cuánto aire se lleva el frente de la fila. Con el objeto dibujado, el conteo
 * cierra la fila y adelante no va nada; con la barra, el conteo va adelante; con
 * la ficha, el conteo y la letra, que es como se lee `3x`.
 */
function frente(skin: LedgerSkin, kind: LedgerKind | undefined): number {
  if (skin === "objects") return 14;
  if (skin === "chips" && kind?.closed === true) return 58;
  return 34;
}

/** El renglón del libro: una línea por fila, y la última cierra el cuaderno. */
function bookPath(l: LedgerLayout, rows: number): SkPath {
  const p = Skia.Path.Make();
  for (let i = 0; i < rows; i++) {
    const r = l.rows[i];
    if (!r) continue;
    p.moveTo(r.x, r.y + r.h);
    p.lineTo(r.x + r.w, r.y + r.h);
  }
  const primera = l.rows[0];
  if (primera) {
    p.moveTo(primera.x, primera.y);
    p.lineTo(primera.x, (l.rows[rows - 1] ?? primera).y + primera.h);
  }
  return p;
}

/**
 * La hoja del libro: vidrio oscuro debajo de los renglones, para que los
 * conteos y las letras se lean igual sobre cualquier parte del paisaje. Deja
 * lugar a la izquierda para la cabecera de cada fila, o para la llave.
 */
function sheetPath(l: LedgerLayout, rows: number, conCabecera: boolean): SkPath {
  const p = Skia.Path.Make();
  const primera = l.rows[0];
  const ultima = l.rows[Math.max(0, rows - 1)];
  if (!primera || !ultima || rows <= 0) return p;
  const margen = conCabecera ? 46 : 26;
  p.addRRect(
    Skia.RRectXY(
      Skia.XYWHRect(
        primera.x - margen,
        primera.y - 8,
        primera.w + margen + 8,
        ultima.y + ultima.h - primera.y + 16,
      ),
      16,
      16,
    ),
  );
  return p;
}

/** El mostrador donde esperan los objetos sueltos: una bandeja de vidrio. */
function trayPath(l: LedgerLayout): SkPath {
  const p = Skia.Path.Make();
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(l.tray.x, l.tray.y, l.tray.w, l.tray.h), 20, 20));
  return p;
}

const handPath = (): SkPath => {
  const p = Skia.Path.Make();
  p.addCircle(0, 0, 13);
  return p;
};

/** Cuánto se inclina la línea de una fila que dejó de ser cierta, en radianes. */
export const LEDGER_BEAM_TILT = 0.17;

/**
 * Un numeral listo para el atlas. El menos se emite como U+2212 y no como el
 * guion de ASCII, que no está horneado: con el guion el número abre un hueco y,
 * si abre la fila, la fila entera no se dibuja.
 */
const numeral = (v: number): string => (v < 0 ? `−${-v}` : String(v));

/**
 * La llave que abraza los renglones. Es el símbolo que dice "las dos a la vez",
 * y nace cuando las dos ecuaciones se tratan por primera vez como un objeto
 * único: escritas en renglones sueltos, nada dice que hablan de la misma
 * manzana.
 */
function bracePath(l: LedgerLayout, rows: number): SkPath {
  const p = Skia.Path.Make();
  const primera = l.rows[0];
  const ultima = l.rows[rows - 1];
  if (!primera || !ultima) return p;
  const x = primera.x - 12;
  const y0 = primera.y + 2;
  const y1 = ultima.y + ultima.h - 2;
  const mid = (y0 + y1) / 2;
  p.moveTo(x + 7, y0);
  p.lineTo(x, y0 + 7);
  p.lineTo(x, mid - 6);
  p.lineTo(x - 6, mid);
  p.lineTo(x, mid + 6);
  p.lineTo(x, y1 - 7);
  p.lineTo(x + 7, y1);
  return p;
}

// --- Componente --------------------------------------------------------------

export interface LedgerSceneProps {
  readonly config: LedgerConfig;
  readonly layout: LedgerLayout;
  /** Un lugar por ranura de objeto. Cambia cuando el jugador suelta, no por cuadro. */
  readonly places: readonly LedgerPlace[];
  /** Sube de a uno por ronda: le dice a la escena que no interpole el salto. */
  readonly round: number;
  /**
   * El objeto que el jugador acaba de soltar. La escena ya no lo necesita para
   * que no viaje desde el mostrador —el soltar se detecta en el hilo de
   * animación, donde el dedo lo dejó—, pero queda en la forma para no romper a
   * quien lo pasa.
   */
  readonly snap: number;
  /** Índice del objeto que el dedo lleva, o -1. */
  readonly dragIdx: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
  /** El latido compartido de lo que reclama atención. */
  readonly pulse: SharedValue<number>;
  /** La mano fantasma de la demostración. */
  readonly demo: SharedValue<number>;
  /**
   * La repetición en cámara lenta del error: las dos filas se acercan, las
   * cajas vuelven a mostrar su dibujo y se ve que no son iguales.
   */
  readonly replay: SharedValue<number>;
  /** Las dos filas que la repetición junta, o -1. */
  readonly replayRows: readonly [number, number];
  /** La fila que devolvió algo recién. O -1. */
  readonly bounced: number;
  readonly appear: SharedValue<number>;
}

export function LedgerScene(props: LedgerSceneProps) {
  const { config, layout: l } = props;
  const book = useMemo(() => bookPath(l, config.rows), [l, config.rows]);
  const sheet = useMemo(
    () => sheetPath(l, config.rows, !config.segments),
    [l, config.rows, config.segments],
  );
  const tray = useMemo(() => trayPath(l), [l]);
  const hand = useMemo(handPath, []);
  const brace = useMemo(
    () => (config.brace ? bracePath(l, config.rows) : Skia.Path.Make()),
    [config.brace, config.rows, l],
  );

  // La ficha que entra bajo su fruta hace clic una vez, aunque su valor aparezca
  // en todas las filas donde está esa fruta: se cuentan las frutas que ya tienen
  // valor en el cartel entero, no las fichas de cada renglón.
  const conocidas = useMemo(() => {
    const s = new Set<number>();
    for (const fila of config.segments ?? []) for (const seg of fila) if (seg.value !== null) s.add(seg.kind);
    return s.size;
  }, [config.segments]);
  const vistas = useRef({ conocidas, round: props.round });
  useEffect(() => {
    const antes = vistas.current;
    vistas.current = { conocidas, round: props.round };
    if (antes.round === props.round && conocidas > antes.conocidas) sfx("fit");
  }, [conocidas, props.round]);

  const demoO = useDerivedValue(() => props.demo.value * (1 - Math.min(1, props.replay.value)));
  const demoT = useDerivedValue(() => {
    // La mano lleva el primer objeto del mostrador a la primera fila, en línea
    // recta. Es toda la instrucción del juego, y no dice una palabra. Con el
    // cartel de tramos el destino es el primer tramo: la mano deja la ficha
    // debajo de la fruta, que es lo que hay que hacer.
    const from = l.tokens[0] ?? { x: l.width / 2, y: l.tray.y };
    const fila = l.rows[0] ?? { x: l.width / 2, y: l.height / 2, w: 0, h: 0 };
    const to = l.cells[0]?.[0] ?? { x: fila.x + 30, y: fila.y + fila.h / 2 };
    const k = props.demo.value;
    return [
      { translateX: from.x + (to.x - from.x) * k },
      { translateY: from.y + (to.y - from.y) * k },
    ];
  }, [l]);

  return (
    <Group opacity={props.appear}>
      {/* La hoja de vidrio oscuro y sus renglones. */}
      <Path path={sheet} color="rgba(9, 17, 29, 0.62)" />
      <Path path={sheet} color="rgba(255, 255, 255, 0.12)" style="stroke" strokeWidth={1} />
      <Path path={book} color="rgba(255, 255, 255, 0.10)" style="stroke" strokeWidth={1} />
      {config.counter === false ? null : (
        <>
          <Path path={tray} color="rgba(255, 255, 255, 0.05)" />
          <Path path={tray} color="rgba(255, 255, 255, 0.12)" style="stroke" strokeWidth={1} />
        </>
      )}
      {/* La llave es notación, no equipo: tinta, como el resto de los signos. */}
      <Path
        path={brace}
        color={theme.color.ink}
        style="stroke"
        strokeWidth={2.5}
        strokeCap="round"
        strokeJoin="round"
      />

      {l.rows.map((box, i) =>
        config.segments ? (
          <SegmentRow
            key={`row${i}`}
            index={i}
            box={box}
            layout={l}
            config={config}
            round={props.round}
            pulse={props.pulse}
          />
        ) : (
          <RowView
            key={`row${i}`}
            index={i}
            box={box}
            layout={l}
            config={config}
            owner={config.owner[i] ?? -1}
            count={config.counts[i] ?? 0}
            round={props.round}
            bounced={props.bounced === i}
            pulse={props.pulse}
            replay={props.replay}
            replayRows={props.replayRows}
          />
        ),
      )}

      {config.tree.length > 0 ? (
        <TreeView config={config} layout={l} round={props.round} pulse={props.pulse} />
      ) : null}

      {props.places.map((place, i) => (
        <TokenView
          key={`tok${i}`}
          index={i}
          kind={config.kinds[config.tokens[i]?.kind ?? -1]}
          kindIndex={config.tokens[i]?.kind ?? 0}
          layout={l}
          skin={config.skin}
          place={place}
          round={props.round}
          dragIdx={props.dragIdx}
          dragX={props.dragX}
          dragY={props.dragY}
        />
      ))}

      <Group opacity={demoO} transform={demoT}>
        <Path path={hand} color="rgba(244, 247, 251, 0.12)" />
        <Path path={hand} color={theme.color.ink} style="stroke" strokeWidth={2.5} />
      </Group>
    </Group>
  );
}

/**
 * Una fila del libro. En `concrete` es un renglón con sus objetos y el conteo
 * al final; en `visual` es una barra segmentada, un segmento por objeto, con el
 * cajón dibujado como un segmento de borde punteado y largo desconocido; en
 * `symbolic` es la ficha con el coeficiente adelante.
 *
 * Los objetos que ya están en la fila no son componentes: los dibuja la fila en
 * un solo trazo. Los que llegaron recién van en un segundo trazo, que aparece
 * cuando el objeto soltado termina de viajar y rebota una vez: es el momento en
 * que la fila lo aceptó, y por eso ahí salen las chispas.
 */
function RowView({
  index,
  box,
  layout: l,
  config,
  owner,
  count,
  round,
  bounced,
  pulse,
  replay,
  replayRows,
}: {
  readonly index: number;
  readonly box: LedgerBox;
  readonly layout: LedgerLayout;
  readonly config: LedgerConfig;
  readonly owner: number;
  readonly count: number;
  readonly round: number;
  readonly bounced: boolean;
  readonly pulse: SharedValue<number>;
  readonly replay: SharedValue<number>;
  readonly replayRows: readonly [number, number];
}) {
  const kind = owner >= 0 ? config.kinds[owner] : undefined;
  const visible = index < config.rows;
  const look = lookOfKind(kind, owner);
  const cy = box.y + box.h / 2;
  const objetos = config.skin === "objects";
  const barH = Math.min(16, box.h * 0.5);
  const x0 = box.x + frente(config.skin, kind);

  /**
   * Desde qué objeto la fila tiene recién llegados. Es estado y no una
   * referencia: un render que llega por otra razón a mitad del rebote tiene
   * que partir la fila igual, o el recién llegado aparecería de golpe. Mientras
   * el efecto no lo anotó, lo que pasa del último conteo visto es nuevo.
   */
  const [llegada, setLlegada] = useState({ desde: count, hasta: count, round });
  const misma = llegada.round === round;
  const desde = !misma
    ? count
    : llegada.hasta === count
      ? Math.min(llegada.desde, count)
      : count > llegada.hasta
        ? llegada.hasta
        : count;

  const partes = useMemo(() => {
    const viejos = emptyParts();
    const nuevos = emptyParts();
    if (!kind) return { viejos, nuevos };
    for (let i = 0; i < count; i++) {
      const target = i < desde ? viejos : nuevos;
      if (objetos) {
        // Los objetos anotados, uno por casilla. La fila los dibuja de una sola
        // vez: no se animan de a uno, así que no son componentes.
        addObject(target, kind, l.unit, x0 + (i + 0.5) * l.slotW, cy);
        continue;
      }
      // La barra segmentada: un segmento por objeto, y el cajón con el borde
      // punteado y el largo sin fijar.
      const x = x0 + i * (l.slotW - 3);
      const w = l.slotW - 7;
      const rect = Skia.RRectXY(Skia.XYWHRect(x, cy - barH / 2, w, barH), 3, 3);
      if (kind.closed) {
        target.veil.addRRect(rect);
        dashedRect(target.dash, x, cy - barH / 2, w, barH, 3.4);
      } else {
        target.body.addRRect(rect);
        if (barH >= 6) {
          target.shine.addRRect(
            Skia.RRectXY(Skia.XYWHRect(x + 2, cy - barH / 2 + 1.5, w * 0.55, Math.max(1, barH * 0.18)), 1, 1),
          );
        }
      }
    }
    return { viejos, nuevos };
  }, [kind, count, desde, objetos, x0, cy, barH, l.unit, l.slotW]);

  /** Dónde cae lo que llegó: el centro de los recién llegados. */
  const llegaX = objetos
    ? x0 + ((desde + count) / 2) * l.slotW
    : x0 + ((desde + count - 1) / 2) * (l.slotW - 3) + (l.slotW - 7) / 2;
  const bandaY0 = objetos ? cy - l.unit * 1.45 : cy - barH / 2;
  const bandaY1 = objetos ? cy + l.unit : cy + barH / 2;

  /**
   * El conteo. En `concrete` cierra la fila; desde `visual` pasa adelante, que
   * es el paso `tally` de la mecánica y lo que después se lee como coeficiente.
   * Adelante quiere decir adentro de la fila, no encima de la cabecera.
   */
  const conteoX = objetos ? box.x + box.w - 18 : box.x + 16;
  const conteo = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind || count <= 0) return p;
    addGlyphs(p, String(count), conteoX, cy, 20);
    return p;
  }, [kind, count, conteoX, cy]);

  /**
   * La letra. Llega como morph de la marca y por eso queda pegada al conteo:
   * `3x` es la fila entera dicha en dos glifos, y el `3` hereda la identidad
   * del conteo y no de un signo de multiplicar que nunca hubo.
   */
  const letra = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind || config.skin !== "chips") return p;
    if (kind.closed && kind.letter) addGlyphs(p, kind.letter, box.x + 38, cy, 22);
    return p;
  }, [kind, box, cy, config.skin]);

  /** La cabecera de la fila: qué clase la ocupa, dibujada y no escrita. */
  const badgeX = box.x - 26;
  const badgeR = l.unit * 1.15;
  const badge = useMemo(() => {
    const parts = emptyParts();
    if (kind) addObject(parts, kind, badgeR, badgeX, cy);
    return parts;
  }, [kind, badgeR, badgeX, cy]);
  /** El contorno de la cabecera, para la repetición: forma y marca en ámbar. */
  const badgeLinea = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind) return p;
    const s = shapePath(kind.shape, badgeR);
    s.addPath(detailPath(kind, badgeR));
    s.transform([1, 0, badgeX, 0, 1, cy, 0, 0, 1]);
    p.addPath(s);
    return p;
  }, [kind, badgeR, badgeX, cy]);

  /**
   * Lo que el hilo de animación necesita saber de la fila, en valores
   * compartidos y no en el cierre del render: un worklet se queda con el
   * cierre en que se armó, así que una fila que consigue dueño seguía latiendo
   * como si estuviera vacía. Es la misma trampa que ya pagaron los nodos 1 y 3.
   */
  const dueno = useSharedValue(owner);
  /** 0 fuera de la repetición; +1 y -1 son las dos filas que se acercan. */
  const rumbo = useSharedValue(0);
  useEffect(() => {
    dueno.value = visible ? owner : 0;
  }, [owner, visible, dueno]);
  useEffect(() => {
    rumbo.value = replayRows[0] === index ? 1 : replayRows[1] === index ? -1 : 0;
  }, [replayRows, index, rumbo]);

  /** La fila vacía late: es la única que dice "abrí acá" y no lo dice con letras. */
  const vacia = useDerivedValue(() => (dueno.value < 0 ? 0.25 + 0.5 * pulse.value : 0));

  // La repetición junta las dos filas y las separa: el error se ve, no se lee.
  const alto = box.h * 0.42;
  const t = useDerivedValue(() => [{ translateY: rumbo.value * replay.value * alto }]);
  // En el contacto las cajas vuelven a mostrar su dibujo: la letra se apaga y
  // la marca aparece, que es exactamente lo que el catálogo pide ver.
  const marcaO = useDerivedValue(() => (rumbo.value === 0 ? 0 : replay.value));
  const letraO = useDerivedValue(() => (rumbo.value === 0 ? 1 : 1 - replay.value));

  /**
   * El recién llegado: invisible mientras el objeto soltado viaja, y cuando
   * llega aparece un poco grande y se asienta con un rebote. El conteo rebota
   * con él, porque es el conteo el que acaba de cambiar, y las chispas salen de
   * donde cayó. Todo una vez por llegada. Es un efecto de diseño y no de
   * cuadro: se dispara cuando el conteo sube, en la misma ronda.
   */
  const llega = useSharedValue(1);
  const pop = useSharedValue(0);
  const chispas = useSharedValue(1);
  useLayoutEffect(() => {
    if (llegada.hasta === count && llegada.round === round) return;
    const nuevos = llegada.round === round && count > llegada.hasta;
    setLlegada({ desde: nuevos ? llegada.hasta : count, hasta: count, round });
    if (!nuevos) {
      llega.value = 1;
      return;
    }
    llega.value = 0;
    llega.value = withDelay(LANDING_MS, withTiming(1, { duration: 70 }));
    pop.value = withDelay(
      LANDING_MS,
      withSequence(withTiming(1, { duration: 0 }), withSpring(0, theme.spring.settle)),
    );
    chispas.value = withDelay(
      LANDING_MS,
      withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: BURST_MS })),
    );
    // Madera, cuando llega: y cada objeto de la fila suena un escalón más arriba,
    // así la fila que se llena se oye subir.
    sfx("drop", fillPitch(count - 1), LANDING_MS);
  }, [count, round, llegada, llega, pop, chispas]);
  const popT = useDerivedValue(
    () => [
      { translateX: llegaX },
      { translateY: cy },
      { scale: 1 + 0.22 * pop.value },
      { translateX: -llegaX },
      { translateY: -cy },
    ],
    [llegaX, cy],
  );
  const conteoT = useDerivedValue(
    () => [
      { translateX: conteoX },
      { translateY: cy },
      { scale: 1 + 0.3 * pop.value },
      { translateX: -conteoX },
      { translateY: -cy },
    ],
    [conteoX, cy],
  );

  /**
   * La fila que devuelve algo no se sacude: se le enciende el borde en ámbar,
   * una vez, mientras el objeto vuelve al mostrador. Mirá acá, sin decir mal.
   */
  const aviso = useSharedValue(0);
  useEffect(() => {
    if (!bounced) return;
    aviso.value = withSequence(withTiming(1, { duration: 110 }), withTiming(0, { duration: 560 }));
  }, [bounced, aviso]);

  const marco = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(box.x, box.y, box.w, box.h), 6, 6));
    return p;
  }, [box]);
  const huecoFila = useMemo(() => {
    const p = Skia.Path.Make();
    dashedRect(p, box.x + 2, box.y + 2, box.w - 4, box.h - 4, 4);
    return p;
  }, [box]);

  // Desde `symbolic` la caja cede su lugar al nombre: la cabecera del cajón se
  // retira y queda la letra. Vuelve sola en la repetición del error, que es
  // cuando hace falta ver que las marcas no son la misma.
  const conCabecera = !(config.skin === "chips" && kind?.shape === "crate");

  if (!visible) return null;

  return (
    <Group transform={t}>
      <Group opacity={vacia}>
        <Path path={huecoFila} color={SLOT_LINE} style="stroke" strokeWidth={1.6} strokeCap="round" />
      </Group>
      <Group opacity={aviso}>
        <Path path={marco} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
      </Group>
      <Group opacity={letraO}>
        <ObjectBodies parts={partes.viejos} look={look} y0={bandaY0} y1={bandaY1} />
        <Group opacity={llega} transform={popT}>
          <ObjectBodies parts={partes.nuevos} look={look} y0={bandaY0} y1={bandaY1} />
        </Group>
        <Path path={letra} color={theme.color.accent} />
      </Group>
      <Group opacity={marcaO}>
        <Path path={badgeLinea} color={theme.color.warn} style="stroke" strokeWidth={2} />
      </Group>
      <Group opacity={conCabecera ? 1 : 0}>
        <ObjectBodies parts={badge} look={look} y0={cy - badgeR * 1.45} y1={cy + badgeR} />
      </Group>
      <Group transform={conteoT}>
        <Path path={conteo} color={theme.color.ink} />
      </Group>
      <EventSparks x={llegaX} y={cy} burst={chispas} />
    </Group>
  );
}

/**
 * Un renglón del cartel: tramos a la izquierda, la línea en el medio y el total
 * a la derecha.
 *
 * La línea no es un adorno. Es la barra de una balanza acostada, y se inclina
 * exactamente cuando la fila deja de ser cierta. Por eso el ángulo viene del
 * modelo y no de un cartel de error, y por eso el **color** cambia sin esperar
 * un cuadro: con el panel del navegador oculto la rotación se congela, y una
 * fila que se rompió tiene que poder verse igual. Cuando el renglón queda
 * cerrado y cierto, la barra se enciende en menta y suelta sus chispas: es el
 * momento en que las dos cuentas coinciden, que es lo que el nivel enseña.
 *
 * La fila se dibuja de una sola vez en unos pocos trazos, como manda el
 * presupuesto: los objetos de un tramo no se animan de a uno, así que no son
 * componentes.
 */
function SegmentRow({
  index,
  box,
  layout: l,
  config,
  round,
  pulse,
}: {
  readonly index: number;
  readonly box: LedgerBox;
  readonly layout: LedgerLayout;
  readonly config: LedgerConfig;
  readonly round: number;
  readonly pulse: SharedValue<number>;
}) {
  const segments = config.segments?.[index] ?? [];
  const total = config.totals?.[index] ?? null;
  const tilt = config.tilts?.[index] ?? 0;
  const cells = l.cells[index] ?? [];
  const beam = l.beams[index] ?? { x: box.x + box.w * 0.7, y: box.y + box.h / 2 };
  const totalSpot = l.totals[index] ?? { x: box.x + box.w - 26, y: box.y + box.h / 2 };
  const cy = box.y + box.h / 2;
  // Una fila que se quedó sin tramos sigue en el cartel: dice que cero pesa
  // cero, que es cierto y es lo que queda cuando una fruta ya se reemplazó.
  const visible = index < config.rows;
  // Una fruta sin ficha deja la fila abierta: no está mal, todavía no dice nada.
  const abierta = segments.some((s) => s.value === null);
  const objetos = config.skin === "objects";

  /**
   * Los tramos, un grupo de trazos por clase. Se separan por clase y no por
   * tramo porque lo que los distingue es el color, y una manzana tiene que
   * verse igual esté en la fila que esté: es el invariante silencioso dicho en
   * el dibujo.
   */
  const cuerpos = useMemo(() => {
    const maxCount = Math.max(1, ...segments.map((s) => Math.abs(s.count)));
    const porClase = config.kinds.map(() => emptyParts());
    const glifos = config.kinds.map(() => Skia.Path.Make());
    segments.forEach((seg, j) => {
      const spot = cells[j];
      const kind = config.kinds[seg.kind];
      const parts = porClase[seg.kind];
      const g = glifos[seg.kind];
      if (!spot || !kind || !parts || !g) return;
      const n = Math.abs(seg.count);
      if (config.skin === "objects") {
        const paso = Math.min(l.cellW / (n + 0.6), l.unit * 2.4);
        for (let i = 0; i < n; i++) {
          addObject(parts, kind, l.unit, spot.x + (i - (n - 1) / 2) * paso, spot.y - 4);
        }
        return;
      }
      if (config.skin === "bars") {
        // La tira: el largo cuenta las frutas, que es la pila aplanada del
        // morph de `concrete` a `visual`.
        const w = (l.cellW * 0.82 * n) / maxCount;
        parts.body.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - w / 2, spot.y - 12, w, 16), 3, 3));
        parts.shine.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - w / 2 + 3, spot.y - 10.5, w * 0.5, 2.6), 1, 1));
        return;
      }
      // La ficha: el coeficiente pegado a la letra. El uno no se escribe, que es
      // la convención que el renglón estrena.
      addGlyphs(g, `${n === 1 ? "" : String(n)}${kind.letter || "x"}`, spot.x, spot.y, 22);
    });
    return { porClase, glifos };
  }, [segments, cells, config.kinds, config.skin, l.cellW, l.unit]);

  /** Los signos entre los tramos: el más y el menos, dibujados del atlas. */
  const signos = useMemo(() => {
    const p = Skia.Path.Make();
    segments.forEach((seg, j) => {
      const spot = cells[j];
      if (!spot) return;
      const previo = cells[j - 1];
      // El signo que abre la fila va pegado a su tramo: puesto a media casilla
      // se sale del renglón por la izquierda.
      const x = previo ? (previo.x + spot.x) / 2 : spot.x - l.cellW * 0.3;
      if (j === 0 && seg.sign > 0) return;
      addGlyphs(p, seg.sign < 0 ? "−" : "+", x, spot.y, 20);
    });
    return p;
  }, [segments, cells, l.cellW]);

  /**
   * La ficha numérica que el jugador dejó bajo cada fruta: la misma ficha
   * neutra de las bandejas, con el valor en tinta. El color con trabajo queda
   * para la barra.
   */
  const fichas = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const valores = Skia.Path.Make();
    segments.forEach((seg, j) => {
      const spot = cells[j];
      if (!spot || seg.value === null) return;
      const y = spot.y + 19;
      cuerpo.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - 15, y - 10, 30, 20), 5, 5));
      addGlyphs(valores, numeral(seg.value), spot.x, y, 15);
    });
    return { cuerpo, valores };
  }, [segments, cells]);

  /** El tramo que todavía espera ficha late: es el único que dice "acá". */
  const hueco = useMemo(() => {
    const p = Skia.Path.Make();
    segments.forEach((seg, j) => {
      const spot = cells[j];
      if (!spot || seg.value !== null) return;
      dashedRect(p, spot.x - 15, spot.y + 9, 30, 20, 3.2);
    });
    return p;
  }, [segments, cells]);

  const barra = useMemo(() => {
    const p = Skia.Path.Make();
    if (config.skin === "chips") {
      // La línea se contrajo en el signo igual y heredó su capacidad de
      // inclinarse: es el paso 3 del morph, y sigue siendo la misma barra.
      addGlyphs(p, "=", 0, 0, 26);
      return p;
    }
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-17, -2.8, 34, 5.6), 2.8, 2.8));
    return p;
  }, [config.skin]);
  /** El fiel de la balanza acostada: no se inclina, es donde se apoya la barra. */
  const fiel = useMemo(() => {
    const p = Skia.Path.Make();
    if (config.skin === "chips") return p;
    p.moveTo(0, 3);
    p.lineTo(5.5, 11);
    p.lineTo(-5.5, 11);
    p.close();
    return p;
  }, [config.skin]);
  const brillo = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(-15, 0);
    p.lineTo(15, 0);
    return p;
  }, []);

  const totalPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (total === null) return p;
    addGlyphs(p, numeral(total), totalSpot.x, totalSpot.y, 22);
    return p;
  }, [total, totalSpot.x, totalSpot.y]);

  /**
   * La inclinación viaja en un valor compartido y no en el cierre del render:
   * un worklet se queda con el cierre en que se armó, que es la trampa que ya
   * pagaron los nodos 1 y 3. Llega con un resorte, así se asienta como una
   * balanza; el ángulo final es el del modelo.
   */
  const angulo = useSharedValue(0);
  useEffect(() => {
    angulo.value = withSpring(tilt * LEDGER_BEAM_TILT, theme.spring.settle);
  }, [tilt, angulo]);
  const barraT = useDerivedValue(() => [{ rotate: angulo.value }]);
  const late = useDerivedValue(() => 0.3 + 0.55 * pulse.value);

  /**
   * El estado del renglón: abierto, inclinado o cierto. Cuando pasa a cierto en
   * la misma ronda, la barra suelta su halo menta y sus chispas, una vez.
   */
  const estado = abierta ? 0 : tilt !== 0 ? 1 : 2;
  /** Cuántas fichas ya tiene el renglón: una más es una ficha que encajó. */
  const puestas = segments.reduce((s, seg) => s + (seg.value === null ? 0 : 1), 0);
  const inclinada = useSharedValue(estado === 1 ? 1 : 0);
  const cierra = useSharedValue(1);
  const visto = useRef({ estado, round, puestas });
  useEffect(() => {
    inclinada.value = estado === 1 ? 1 : 0;
    const antes = visto.current;
    visto.current = { estado, round, puestas };
    if (antes.round !== round) return;
    // Si lo que cerró el renglón fue una ficha que entró, su clic suena primero
    // (lo toca la escena, una sola vez para todo el cartel) y el vidrio después.
    const encajo = puestas > antes.puestas;
    if (antes.estado === estado || estado !== 2) return;
    cierra.value = 0;
    cierra.value = withTiming(1, { duration: BURST_MS });
    // Y si con eso el renglón quedó cierto, las dos cuentas coinciden: vidrio.
    sfx("join", 0, encajo ? 120 : 0);
  }, [estado, round, puestas, inclinada, cierra]);
  // Inclinada, la barra late en ámbar: mirá acá. Nunca un sacudón.
  const avisoO = useDerivedValue(() => inclinada.value * (0.25 + 0.4 * pulse.value));
  const cierraO = useDerivedValue(() => (cierra.value < 1 ? 0.2 + 0.8 * (1 - cierra.value) : 0));

  if (!visible) return null;

  const tono = estado === 0 ? STEEL_LOOK : estado === 1 ? WARN_LOOK : REVEAL_LOOK;
  const bandaY0 = objetos ? cy - 4 - l.unit * 1.45 : cy - 12;
  const bandaY1 = objetos ? cy - 4 + l.unit : cy + 4;

  return (
    <Group>
      {cuerpos.porClase.map((parts, k) => (
        <ObjectBodies
          key={`k${k}`}
          parts={parts}
          look={lookOfKind(config.kinds[k], k)}
          y0={bandaY0}
          y1={bandaY1}
        />
      ))}
      {cuerpos.glifos.map((path, k) => (
        <Path key={`g${k}`} path={path} color={colorOfKind(config.kinds[k], k)} />
      ))}
      <Path path={signos} color={theme.color.inkDim} />
      <ChipBodies path={fichas.cuerpo} />
      <Path path={fichas.valores} color={theme.color.ink} />
      <Group opacity={late}>
        <Path path={hueco} color={SLOT_LINE} style="stroke" strokeWidth={1.6} strokeCap="round" />
      </Group>
      <Group transform={[{ translateX: beam.x }, { translateY: beam.y }]}>
        <Path path={fiel}>
          <LinearGradient start={vec(0, 3)} end={vec(0, 11)} colors={[STEEL_LOOK.light, STEEL_LOOK.base, STEEL_LOOK.dark]} />
        </Path>
        <Group transform={barraT}>
          <Group opacity={avisoO}>
            <Path path={brillo} color={theme.color.warn} style="stroke" strokeWidth={12} strokeCap="round">
              <BlurMask blur={6} style="normal" />
            </Path>
          </Group>
          <Group opacity={cierraO}>
            <Path path={brillo} color={theme.color.ok} style="stroke" strokeWidth={16} strokeCap="round">
              <BlurMask blur={8} style="normal" />
            </Path>
          </Group>
          {config.skin === "chips" ? (
            <Path path={barra} color={tono.base} />
          ) : (
            <Path path={barra}>
              <LinearGradient start={vec(0, -2.8)} end={vec(0, 2.8)} colors={[tono.light, tono.base, tono.dark]} />
            </Path>
          )}
        </Group>
        <EventSparks x={0} y={0} burst={cierra} />
      </Group>
      <Path path={totalPath} color={theme.color.ink} />
    </Group>
  );
}

/**
 * El árbol de cofres del nodo 9 con una hoja vacía. La caja crece ahí y el
 * árbol queda completo aunque el valor de esa hoja siga sin conocerse: es lo
 * único que este nodo le pide a `chest_key`.
 */
function TreeView({
  config,
  layout: l,
  round,
  pulse,
}: {
  readonly config: LedgerConfig;
  readonly layout: LedgerLayout;
  readonly round: number;
  readonly pulse: SharedValue<number>;
}) {
  const r = l.nodeR;
  const aristas = useMemo(() => {
    const p = Skia.Path.Make();
    for (let i = 0; i < config.tree.length; i++) {
      const n = config.tree[i] as LedgerTreeNode;
      const hijo = l.nodes[i];
      const padre = n.parent >= 0 ? l.nodes[n.parent] : undefined;
      if (!hijo || !padre) continue;
      p.moveTo(padre.x, padre.y + r * 0.7);
      p.lineTo(hijo.x, hijo.y - r * 0.7);
    }
    return p;
  }, [config.tree, l.nodes, r]);

  /**
   * Las ramas son discos de vidrio con su operación; las hojas conocidas, cofres
   * de madera con su número. El número va en tinta con un borde oscuro, para
   * que se lea sobre la madera.
   */
  const cuerpos = useMemo(() => {
    const discos = Skia.Path.Make();
    const cofres = Skia.Path.Make();
    const brillos = Skia.Path.Make();
    const glifos = Skia.Path.Make();
    for (let i = 0; i < config.tree.length; i++) {
      const n = config.tree[i] as LedgerTreeNode;
      const s = l.nodes[i];
      if (!s) continue;
      if (n.op !== null) {
        discos.addCircle(s.x, s.y, r * 0.78);
        addGlyphs(glifos, n.op === "×" ? "×" : "+", s.x, s.y, r * 1.05);
        continue;
      }
      if (n.unknown) continue;
      // Una hoja conocida es un cofre chico con su número: el distractor del
      // diseño no es un número al azar, es una hoja que ya tiene valor.
      cofres.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - r, s.y - r * 0.8, r * 2, r * 1.6), 4, 4));
      brillos.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - r + 3, s.y - r * 0.8 + 2.5, r * 0.9, 2.4), 1, 1));
      addGlyphs(glifos, String(n.value ?? 0), s.x, s.y, r * 1.05);
    }
    return { discos, cofres, brillos, glifos };
  }, [config.tree, l.nodes, r]);

  const hojaI = config.tree.findIndex((n) => n.unknown);
  const hoja = hojaI >= 0 ? l.nodes[hojaI] : undefined;

  /** La hoja vacía: borde punteado mientras late, cajón cerrado cuando se llena. */
  const hueco = useMemo(() => {
    const p = Skia.Path.Make();
    if (!hoja) return p;
    dashedRect(p, hoja.x - r, hoja.y - r * 0.8, r * 2, r * 1.6, 3.4);
    return p;
  }, [hoja, r]);

  const kind = config.leaf >= 0 ? config.kinds[config.leaf] : undefined;
  const lleno = useMemo(() => {
    const parts = emptyParts();
    if (hoja && kind) addObject(parts, kind, r * 0.8, hoja.x, hoja.y);
    return parts;
  }, [hoja, kind, r]);
  const halo = useMemo(() => {
    const p = Skia.Path.Make();
    if (hoja) p.addCircle(hoja.x, hoja.y, r * 1.5);
    return p;
  }, [hoja, r]);

  // La hoja llena deja de latir. La decisión viaja en un valor compartido y no
  // en el cierre del render, que es donde se pierde.
  const llena = useSharedValue(config.leaf >= 0 ? 1 : 0);
  /**
   * El árbol que se completa es el evento de esta pregunta: el cajón aparece
   * cuando el objeto soltado llega a la hoja, rebota una vez, y la hoja suelta
   * su halo y sus chispas. Solo si se llenó en esta ronda.
   */
  const aparece = useSharedValue(config.leaf >= 0 ? 1 : 0);
  const pop = useSharedValue(0);
  const chispas = useSharedValue(1);
  const visto = useRef({ leaf: config.leaf, round });
  useLayoutEffect(() => {
    const antes = visto.current;
    visto.current = { leaf: config.leaf, round };
    const lleno = config.leaf >= 0;
    llena.value = lleno ? 1 : 0;
    if (!lleno || antes.round !== round || antes.leaf >= 0) {
      aparece.value = lleno ? 1 : 0;
      return;
    }
    aparece.value = 0;
    aparece.value = withDelay(LANDING_MS, withTiming(1, { duration: 70 }));
    pop.value = withDelay(
      LANDING_MS,
      withSequence(withTiming(1, { duration: 0 }), withSpring(0, theme.spring.settle)),
    );
    chispas.value = withDelay(
      LANDING_MS,
      withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: BURST_MS })),
    );
    // El cajón entra en la hoja que le faltaba al árbol: encaja.
    sfx("fit", 0, LANDING_MS);
  }, [config.leaf, round, llena, aparece, pop, chispas]);
  const late = useDerivedValue(() => (llena.value > 0 ? 0 : 0.35 + 0.65 * pulse.value));
  const hx = hoja?.x ?? 0;
  const hy = hoja?.y ?? 0;
  const popT = useDerivedValue(
    () => [
      { translateX: hx },
      { translateY: hy },
      { scale: 1 + 0.22 * pop.value },
      { translateX: -hx },
      { translateY: -hy },
    ],
    [hx, hy],
  );
  const haloO = useDerivedValue(() => (chispas.value < 1 ? 0.8 * (1 - chispas.value) : 0));
  const look = lookOfKind(kind, config.leaf);

  return (
    <Group>
      <Path path={aristas} color="rgba(255, 255, 255, 0.24)" style="stroke" strokeWidth={2.5} strokeCap="round" />
      <Path path={cuerpos.discos} color="rgba(9, 17, 29, 0.85)" />
      <Path path={cuerpos.discos} color="rgba(255, 255, 255, 0.24)" style="stroke" strokeWidth={1.5} />
      <Path path={cuerpos.cofres}>
        <LinearGradient
          start={vec(0, (l.nodes[0]?.y ?? 0) - r)}
          end={vec(0, (l.nodes[0]?.y ?? 0) + l.height * 0.5 + r)}
          colors={[WOOD.light, WOOD.base, WOOD.dark]}
        />
      </Path>
      <Path path={cuerpos.brillos} color="rgba(255, 255, 255, 0.35)" />
      <Path path={cuerpos.glifos} color="rgba(9, 17, 29, 0.6)" style="stroke" strokeWidth={2.5} strokeJoin="round" />
      <Path path={cuerpos.glifos} color={theme.color.ink} />
      <Group opacity={late}>
        <Path path={hueco} color={SLOT_LINE} style="stroke" strokeWidth={2} strokeCap="round" />
      </Group>
      <Group opacity={haloO}>
        <Path path={halo} color={theme.color.ok}>
          <BlurMask blur={10} style="normal" />
        </Path>
      </Group>
      <Group opacity={aparece} transform={popT}>
        <ObjectBodies parts={lleno} look={look} y0={hy - r * 0.8 * 1.45} y1={hy + r * 0.8} />
      </Group>
      <EventSparks x={hx} y={hy} burst={chispas} />
    </Group>
  );
}

/**
 * Un objeto suelto. Su destino cambia solo cuando el jugador suelta; mientras
 * el dedo se mueve, la posición sale del valor compartido y nada vuelve al hilo
 * de JavaScript.
 *
 * El jugo del gesto vive acá, en el hilo de animación: al levantarlo crece un
 * 30 %; al soltarlo sale de donde lo dejó el dedo —no de su casa— y viaja con un
 * resorte que rebota una vez al llegar. Si la fila lo acepta, el destino cambia
 * a mitad del viaje y el resorte lo lleva ahí; si lo devuelve, vuelve solo al
 * mostrador.
 */
function TokenView({
  index,
  kind,
  kindIndex,
  layout: l,
  skin,
  place,
  round,
  dragIdx,
  dragX,
  dragY,
}: {
  readonly index: number;
  readonly kind: LedgerKind | undefined;
  readonly kindIndex: number;
  readonly layout: LedgerLayout;
  readonly skin: LedgerSkin;
  readonly place: LedgerPlace;
  readonly round: number;
  readonly dragIdx: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
}) {
  const r = l.unit;
  // Desde `symbolic` el cajón suelto ya es su ficha: la letra ocupó el lugar
  // del dibujo, que es la analogía retirándose. Una figura inventada no: esa
  // se sigue viendo y lo que recibe nombre es la fila, no el objeto.
  const esLetra =
    skin === "chips" && kind?.closed === true && kind.letter !== "" && kind.shape === "crate";

  const partes = useMemo(() => {
    const p = emptyParts();
    if (kind && !esLetra) addObject(p, kind, r, 0, 0);
    return p;
  }, [kind, r, esLetra]);
  const ficha = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const letra = Skia.Path.Make();
    if (kind && esLetra) {
      cuerpo.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 1.35, -r * 1.35, r * 2.7, r * 2.7), 9, 9));
      addGlyphs(letra, kind.letter, 0, 0, r * 2.4);
    }
    return { cuerpo, letra };
  }, [kind, r, esLetra]);
  const look = lookOfKind(kind, kindIndex);

  const ax = useSharedValue(place.x);
  const ay = useSharedValue(place.y);
  const ao = useSharedValue(place.on ? 1 : 0);
  /** Hacia dónde va, en el hilo de animación: lo lee el soltar. */
  const destX = useSharedValue(place.x);
  const destY = useSharedValue(place.y);
  /** Cuánto está levantado: 0 en reposo, 1 en el dedo. */
  const lift = useSharedValue(0);
  const rondaPrevia = useRef(round);

  useEffect(() => {
    destX.value = place.x;
    destY.value = place.y;
    // Al cambiar de ronda el objeto no viaja: aparece donde va. Interpolar un
    // salto entre dos problemas distintos se vería como una cosa que se escapa.
    if (rondaPrevia.current !== round) {
      rondaPrevia.current = round;
      ax.value = place.x;
      ay.value = place.y;
      ao.value = place.on ? 1 : 0;
      return;
    }
    ax.value = withSpring(place.x, theme.spring.settle);
    ay.value = withSpring(place.y, theme.spring.settle);
    // Lo que se va a una fila, al plato o a la hoja se apaga cuando llega: ahí
    // lo toma el dibujo de su destino, que rebota en ese mismo momento.
    ao.value = place.on
      ? withTiming(1, { duration: theme.motion.base })
      : withDelay(LANDING_MS - 40, withTiming(0, { duration: 110 }));
  }, [place.x, place.y, place.on, round, ax, ay, ao, destX, destY]);

  // El dedo lo agarra y lo suelta en el hilo de animación, y es ahí donde se
  // sabe dónde lo dejó: cuando la actividad se entera, el dedo ya se fue.
  useAnimatedReaction(
    () => dragIdx.value === index,
    (ahora, antes) => {
      if (antes === null || ahora === antes) return;
      if (ahora) {
        lift.value = withSpring(1, theme.spring.lift);
        runOnJS(sfx)("lift", 0, 0);
        return;
      }
      ax.value = ax.value + dragX.value;
      ay.value = ay.value + dragY.value;
      ax.value = withSpring(destX.value, theme.spring.settle);
      ay.value = withSpring(destY.value, theme.spring.settle);
      lift.value = withSpring(0, theme.spring.settle);
    },
    [index],
  );

  const transform = useDerivedValue(() => {
    const llevado = dragIdx.value === index;
    return [
      { translateX: ax.value + (llevado ? dragX.value : 0) },
      { translateY: ay.value + (llevado ? dragY.value : 0) },
      { scale: 1 + 0.3 * lift.value },
    ];
  }, [index]);

  if (!kind) return null;

  return (
    <Group transform={transform} opacity={ao}>
      {esLetra ? (
        <>
          <Group transform={[{ translateY: 3 }]}>
            <Path path={ficha.cuerpo} color={chipTone.edge} />
          </Group>
          <Path path={ficha.cuerpo}>
            <LinearGradient
              start={vec(0, -r * 1.35)}
              end={vec(0, r * 1.35)}
              colors={[chipTone.top, chipTone.face, chipTone.low]}
            />
          </Path>
          <Path path={ficha.cuerpo} color={chipTone.rimTop} style="stroke" strokeWidth={1} />
          <Path path={ficha.letra} color={theme.color.accent} />
        </>
      ) : (
        <>
          <Path path={partes.shadow} color={SHADOW} />
          <Path path={partes.body}>
            <RadialGradient c={vec(-r * 0.35, -r * 0.45)} r={r * 1.8} colors={[look.light, look.base, look.dark]} />
          </Path>
          <Path path={partes.stem} color={STEM} />
          <Path path={partes.shine} color={SHINE} />
          <Path
            path={partes.detail}
            color={MARK_INK}
            style="stroke"
            strokeWidth={1.8}
            strokeCap="round"
            strokeJoin="round"
          />
        </>
      )}
    </Group>
  );
}
