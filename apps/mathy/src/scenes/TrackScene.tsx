/**
 * La manivela y el soporte graduado: la mecánica `gears_sequence` de
 * [E0](../../../../docs/E-mecanicas/E0-catalogo.md).
 *
 * Quince nodos de la espina la usan, así que la escena no es del nodo 3: es de
 * la mecánica. Todo lo que cambia entre un nodo y otro entra por `TrackConfig`
 * —cuántas casillas, dónde cae el cero, qué piel tiene el soporte, si hay tope,
 * cajón, libro, flechas, renglón, edificio, tablero— y nada de eso está escrito
 * adentro. Antes de esto la mecánica estaba dibujada tres veces, una por nodo, y
 * cada copia estaba tipada contra el `Problem` de su nodo: reusarla exigía
 * fabricar un problema falso de otro nodo, y por eso nadie la reusaba.
 *
 * El invariante que la escena dibuja es que **el diente y el paso son la misma
 * cosa**. La manivela no gira "como si" el caminante avanzara: su rotación y la
 * posición del caminante se derivan del mismo valor, así que no hay medio
 * diente, no hay medio paso, y no hay forma de caer entre dos casillas girando.
 * Todo lo demás —el tope que fija el largo del tirón, el libro que anota los
 * tramos, el edificio que cuelga del mismo eje— son lecturas de ese invariante.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las fichas del cajón, las monedas, las dos pistas de la
 *    explicación y el renglón están siempre montados; lo que no se usa va con
 *    opacidad cero.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Un soporte de treinta
 *    casillas cuesta lo mismo que uno de cinco, y un edificio de cuarenta y un
 *    pisos lo mismo que uno de siete.
 * 3. Nada vuelve al hilo de JavaScript por cuadro. La posición del caminante, el
 *    giro de la manivela, el arrastre de una ficha y la altura de la calle se
 *    derivan de los `SharedValue` que trae el gesto.
 *
 * Nada de texto: los numerales, el `+`, el `=` y el signo son contornos del
 * atlas de glifos, los mismos que compone la ecuación del nodo 13. El signo se
 * emite como U+2212 y nunca como un guion de ASCII, que no está en el atlas y
 * dejaría el número sin dibujar.
 *
 * La escena tiene una base y ocho capas, y las capas son opcionales y nulas por
 * omisión, así que un nodo que solo quiere la base no escribe una línea de más
 * y no ve nada nuevo en pantalla:
 *
 * - **La base**: el soporte graduado (piedras, marcas de una recta, o pisos),
 *   el caminante, la manivela con dientes y la bandera.
 * - **`stop`** (prop): el tope regulable, tantos dientes iluminados como dice la
 *   ficha puesta. Con signo: negativo ilumina hacia el otro lado.
 * - **`drawer`**: el cajón de fichas, arrastrables o tocables.
 * - **`ledger`**: el libro de cuentas, una fila por tramo y el total abajo.
 * - **`arrows`**: las flechas de tramo, que se despegan y conservan el largo.
 * - **`line`**: el renglón `3 + 2 = 5`, con un hueco.
 * - **`building`**: el edificio en corte, el ascensor y la calle que se muda.
 * - **`board`**: el tablero de monedas y vales.
 * - **`drawings`** y **`stops`**: las dos superficies sin pista del nodo 7.
 *
 * Las casillas a la izquierda del cero no son una capa: son `zeroAt`. El nombre
 * de una casilla es su índice menos `zeroAt`, y con `zeroAt` en 0 —lo que hace
 * un nodo que todavía no cruzó— sale exactamente la numeración de siempre. Lo
 * que hace legítimo el lado izquierdo es que la separación entre casillas no
 * cambia al cruzar: el soporte se dibuja con un solo paso para todas.
 */

import { useMemo } from "react";
import { Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue, type SharedValue } from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { TEETH_PER_TURN } from "@mathy/mechanics";
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;
/** Cuánto gira la manivela por casilla. La vuelta entera es la unidad. */
export const TOOTH_ANGLE = (2 * Math.PI) / TEETH_PER_TURN;
/** Filas del libro montadas siempre: tres tramos y el total. */
export const LEDGER_ROWS = 4;
/** Cuánto salta el pie entre una casilla y la siguiente, al caminarlas. */
const HOP = 12;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

// --- Lo que un nodo decide ---------------------------------------------------

/** Las piedras del camino, o las marcas de la recta en la que se aplanan. */
export type TrackSkin = "stone" | "mark";

/** El soporte acostado, o parado: el orden hacia arriba en vez de a la derecha. */
export type TrackOrientation = "horizontal" | "vertical";

/**
 * Cómo se escribe el nombre de una casilla. `cards` lo mete en una tarjeta con
 * marco —la casilla lleva su número encima, como el nodo 2— y `plain` lo deja
 * suelto debajo de la marca, como el nodo 7.
 */
export type TrackNumerals = "none" | "cards" | "plain";

/** Dónde vive la manivela. Parada, se corre al costado para dejarle el alto. */
export type TrackCrankAt = "bottomLeft" | "right";

/** Una ficha del cajón. La escena solo mira el valor: el resto es del nodo. */
export interface TrackChip {
  readonly value: number;
}

/**
 * Dónde se centra el cajón. `midRight` lo pone en el medio de lo que queda a la
 * derecha de la manivela, `afterCrank` lo empuja hasta que no la pise, y
 * `canvas` lo centra en el lienzo sin mirarla.
 */
export type TrackDrawerCenter = "midRight" | "afterCrank" | "canvas";

/** El cajón de fichas. */
export interface TrackDrawer {
  readonly chips: readonly TrackChip[];
  /**
   * Cuántas ranuras se montan siempre. Las que esta ronda no usa se van del
   * lienzo en vez de desmontarse: el árbol no puede cambiar entre rondas.
   */
  readonly views: number;
  readonly w: number;
  readonly h: number;
  readonly gap: number;
  readonly center: TrackDrawerCenter;
  /** Con `canvas` o como piso de las otras dos, en fracción del ancho. */
  readonly centerFrac: number;
  /**
   * El cajón reparte el lugar de todas las ranuras, o solo el de las fichas que
   * esta ronda tiene. Con `views` el cajón mide siempre lo mismo y las fichas
   * quedan donde quedarían con el cajón lleno; con `chips` se juntan en el
   * medio, que es lo que hay que hacer cuando un hueco se leería como una ficha
   * que falta.
   */
  readonly spread: "views" | "chips";
  /** El cajón vive abajo, o arriba cuando lo de abajo ya está ocupado. */
  readonly at: "bottom" | "top";
  /** Cuánto se despega del borde: del de abajo, o fracción del alto si va arriba. */
  readonly margin: number;
  /** Las fichas llevan cifra. Sin numerales el valor es una cuenta de puntos. */
  readonly numerals: boolean;
  /** Con signo: el numeral lleva U+2212 y los puntos no cuentan el lado. */
  readonly signed: boolean;
}

/** El renglón `3 + 2 = 5`, con un hueco donde va la respuesta. */
export interface TrackLine {
  /** La casilla de partida. En 0 se calla: `0 + 3` diría lo mismo que `3`. */
  readonly start: number;
  readonly steps: readonly number[];
  /** El tramo tapado, o -1 cuando lo tapado es la llegada. */
  readonly hidden: number;
  readonly arrival: number;
}

/** El edificio en corte: la misma escala vertical, colgada del mismo eje. */
export interface TrackBuilding {
  /** A la vista siempre, o a pedido de un toque. */
  readonly show: "shown" | "onDemand";
  /**
   * Cuánto ancho le saca al soporte para no pisarlo. Con más de 0 el soporte
   * además deja de centrarse y arranca en el margen: centrado se metería debajo
   * del corte. En 0 el edificio y el soporte no comparten pantalla.
   */
  readonly reserve: number;
  /** El edificio comparte pantalla con el soporte, o es la superficie principal. */
  readonly beside: boolean;
  /** Dónde se centra cuando no comparte pantalla, en fracción del ancho. */
  readonly centerFrac: number;
  /** El ascensor colgado del mismo eje que la manivela. */
  readonly car: boolean;
  /** La altura marcada adonde hay que mudar la calle, o `null`. */
  readonly moveTo: number | null;
  /** Los pisos que se marcan sobre el corte. Vacío: ninguno. */
  readonly marks: readonly number[];
  readonly numerals: boolean;
}

/** El tablero de monedas y vales: lo que queda sin pareja es el neto. */
export interface TrackBoard {
  readonly tokens: readonly { readonly value: number }[];
  readonly views: number;
  /** El neto que el tablero tiene que mostrar. */
  readonly target: number;
}

/**
 * La bandera de la casilla de llegada. Late hasta que el caminante llega, y ese
 * latido es toda la instrucción que da.
 */
export interface TrackFlag {
  readonly at: number;
  /** Hacia qué lado flamea: 1 a la derecha, -1 a la izquierda. */
  readonly side?: 1 | -1;
  /** El halo sobre la casilla. Con casillas anchas sobra: el halo las tapa. */
  readonly halo?: boolean;
  /** La bandera misma late, no solo su halo. */
  readonly pulse?: boolean;
}

/**
 * La fila de dibujos: un soporte sin graduar y sin numerales. Sirve para
 * preguntar si la dirección se entendió sin la pista debajo.
 */
export interface TrackDrawings {
  readonly count: number;
  readonly origin: number;
  /** Hacia el lado de la flecha (`1`) o hacia el otro (`-1`). */
  readonly dir: number;
  readonly steps: number;
}

/**
 * Las dos animaciones que se comparan: la misma acción contada de dos maneras,
 * una de las cuales miente. Son tres formas de mentir y cada nodo elige la suya;
 * un nodo nuevo que quiera comparar reusa una de las tres o agrega la cuarta.
 *
 * - `walks`: dos recorridos sobre las pistas principales. El que miente da pasos
 *   de distinto tamaño y cae entre dos piedras.
 * - `arrival`: dos pistas aparte. En la que miente la ficha de llegada aparece
 *   antes y el caminante la sigue, como si el doble trazo fuera un botón.
 * - `doubleTurn`: dos rectas cortas. En la que miente el caminante gira dos
 *   veces y sigue mirando hacia atrás.
 */
export type TrackExplain =
  | {
      readonly kind: "walks";
      /** Las posiciones acumuladas de cada recorrido, una lista por pista. */
      readonly walks: readonly (readonly number[])[];
      readonly liar: number;
    }
  | {
      readonly kind: "arrival";
      /** Dónde caen las dos pistas, en fracción del alto. */
      readonly rows: readonly number[];
      readonly from: number;
      readonly to: number;
      readonly liar: number;
    }
  | {
      readonly kind: "doubleTurn";
      readonly rows: readonly number[];
      readonly liar: number;
    };

/**
 * La mano fantasma, que es toda la instrucción que hay: el jugador no lee. `move`
 * lleva algo de un lugar a otro y `turn` orbita la manija tantos dientes.
 */
export type TrackGhost =
  | { readonly kind: "move"; readonly from: Spot; readonly to: Spot }
  | { readonly kind: "turn"; readonly teeth: number };

/**
 * Los números de dibujo. Están afuera de `TrackConfig` porque no son decisiones
 * del nodo sino calibración de la escena: un nodo los toca solo cuando su
 * soporte tiene que verse distinto, y casi ninguno tiene que.
 */
export interface TrackMetrics {
  readonly pad: number;
  /** Con pocas casillas el soporte no se estira hasta el absurdo. */
  readonly maxStep: number;
  /** La casilla: radio como fracción del paso, con techo, y medio alto fijo si lo hay. */
  readonly stone: { readonly frac: number; readonly max: number; readonly flat: number };
  /** La casilla lleva contorno además del relleno. */
  readonly stoneOutline: boolean;
  /** El agua: medio alto de la banda y cuánto sobra en cada punta. */
  readonly band: { readonly half: number; readonly over: number };
  /** Cuánto sobra en cada punta cuando el soporte es una recta y no una banda. */
  readonly markOver: number;
  /** Medio alto de la marca que reemplaza a la casilla cuando el soporte se aplana. */
  readonly markHalf: number;
  /** Hasta dónde llega el diente iluminado del tope, en fracción del radio. */
  readonly stopReach: number;
  /** El grosor del diente iluminado. Un tope que sujeta se ve más grueso que uno que anuncia. */
  readonly stopWidth: number;
  /** El radio de la mano fantasma. */
  readonly ghostR: number;
  /**
   * La bandera: cuánto se despega de la casilla, cuánto mide el mástil, cuánto
   * vuela el paño y cuánto baja cada pliegue.
   */
  readonly flag: {
    readonly base: number;
    readonly top: number;
    readonly span: number;
    readonly drop: number;
  };
  /** La tarjeta del numeral: ancho como fracción del paso, con piso, techo y alto. */
  readonly card: {
    readonly frac: number;
    readonly min: number;
    readonly max: number;
    readonly h: number;
  };
  /** Del centro de la casilla al centro de su numeral, con tarjeta y sin ella. */
  readonly cardDy: number;
  readonly plainDy: number;
  readonly plainSize: number;
  /** El radio de la manivela, y cuánto se despega del borde de abajo. */
  readonly crank: {
    readonly min: number;
    readonly max: number;
    readonly frac: number;
    readonly margin: number;
  };
  /** El blanco de toque de una casilla: generoso a propósito. */
  readonly touch: { readonly frac: number; readonly min: number };
  /**
   * Cada cuántas casillas se escribe el numeral, por umbral de paso: con el
   * soporte apretado no entran todos. `null`: entran todos siempre.
   */
  readonly numeralEvery: readonly [number, number] | null;
}

/** Todo lo que un nodo decide sobre la escena. */
export interface TrackConfig {
  // --- El soporte graduado ---
  /** Cuántas casillas tiene. El valor de una casilla es su índice menos `zeroAt`. */
  readonly slots: number;
  /**
   * El índice que se llama cero. Con más de 0 hay casillas a la izquierda, y su
   * nombre lleva signo. Por omisión 0: el extremo es el cero, como al empezar.
   */
  readonly zeroAt?: number;
  /**
   * Cuánto soporte se dibuja antes de la casilla 0, en casillas. Con esto el
   * extremo deja de ser el cero sin que aparezcan casillas nuevas.
   */
  readonly leadIn?: number;
  readonly skin: TrackSkin;
  readonly orientation?: TrackOrientation;
  /** Factor de dibujo: el mismo soporte más largo o más corto, con los mismos números. */
  readonly stretch?: number;
  /**
   * Dónde cae cada pista: en fracción del alto si el soporte está acostado, y
   * del ancho si está parado. Dos pistas comparan recorridos.
   */
  readonly railRows: readonly number[];
  readonly numerals?: TrackNumerals;
  /** La primera casilla que lleva numeral: en 1, la orilla se queda sin el suyo. */
  readonly numeralFrom?: number;
  /** Las casillas cuya tarjeta es un hueco que hay que llenar. */
  readonly gaps?: readonly number[];
  /** El punto grueso del cero, heredado del clavo del nodo 5. */
  readonly zeroDot?: boolean;
  /** La bandera, o `null` cuando el nivel no pide llegar a ninguna casilla. */
  readonly flag?: TrackFlag | null;
  /**
   * El soporte se dibuja. En `false` sigue existiendo para el hit test y para
   * las medidas, pero no se ve: es lo que hace un nivel que se juega sobre otra
   * superficie sin perder la escala.
   */
  readonly showRail?: boolean;
  /** El caminante está en pantalla. */
  readonly walker?: boolean;
  /** El caminante lleva la bandera de dirección, que se da vuelta al cruzar. */
  readonly facing?: boolean;
  /** La manivela está en pantalla. */
  readonly crank?: boolean;
  readonly crankAt?: TrackCrankAt;

  // --- Las capas ---
  readonly drawer?: TrackDrawer | null;
  /** El libro de cuentas, con una fila por tramo y el total abajo. */
  readonly ledger?: boolean;
  /** Las flechas con cola y punta, una por tramo hecho. */
  readonly arrows?: boolean;
  /** La estela: un arco por cada casilla que el tramo saltó sin pisar. */
  readonly trail?: boolean;
  readonly line?: TrackLine | null;
  readonly building?: TrackBuilding | null;
  readonly board?: TrackBoard | null;
  /** Las paradas escritas, para cuando el edificio está apagado. */
  readonly stops?: readonly number[];
  /** La caja marcada donde va la ficha que contesta. */
  readonly box?: boolean;
  readonly drawings?: TrackDrawings | null;
  readonly explain?: TrackExplain | null;
  /**
   * Calibración del dibujo. Los defaults son los del nodo 3, que es el nodo de
   * casa de este archivo; un nodo los toca solo cuando su soporte tiene que
   * verse distinto, y casi ninguno tiene que.
   */
  readonly metrics?: Partial<TrackMetrics>;
}

const DEFAULT_METRICS: TrackMetrics = {
  pad: 46,
  maxStep: 96,
  stone: { frac: 0.36, max: 22, flat: 0 },
  stoneOutline: false,
  band: { half: 15, over: 10 },
  markOver: 0,
  markHalf: 8,
  stopReach: 0.92,
  stopWidth: 3,
  ghostR: 12,
  flag: { base: 6, top: 40, span: 20, drop: 7 },
  card: { frac: 0.9, min: 0, max: 30, h: 24 },
  cardDy: 28,
  plainDy: 26,
  plainSize: 16,
  crank: { min: 32, max: 46, frac: 0.13, margin: 12 },
  touch: { frac: 0.55, min: 22 },
  numeralEvery: [30, 20],
};

/** Los valores de `TrackConfig` que la escena lee, ya con los defaults puestos. */
interface Settled {
  readonly zeroAt: number;
  readonly leadIn: number;
  readonly orientation: TrackOrientation;
  readonly stretch: number;
  readonly numerals: TrackNumerals;
  readonly numeralFrom: number;
  readonly gaps: readonly number[];
  readonly zeroDot: boolean;
  readonly flag: TrackFlag | null;
  readonly showRail: boolean;
  readonly walker: boolean;
  readonly facing: boolean;
  readonly crank: boolean;
  readonly crankAt: TrackCrankAt;
  readonly drawer: TrackDrawer | null;
  readonly ledger: boolean;
  readonly arrows: boolean;
  readonly trail: boolean;
  readonly line: TrackLine | null;
  readonly building: TrackBuilding | null;
  readonly board: TrackBoard | null;
  readonly stops: readonly number[];
  readonly box: boolean;
  readonly drawings: TrackDrawings | null;
  readonly explain: TrackExplain | null;
  readonly m: TrackMetrics;
}

function settle(c: TrackConfig): Settled {
  const m = c.metrics;
  return {
    zeroAt: c.zeroAt ?? 0,
    leadIn: c.leadIn ?? 0,
    orientation: c.orientation ?? "horizontal",
    stretch: c.stretch ?? 1,
    numerals: c.numerals ?? "none",
    numeralFrom: c.numeralFrom ?? 0,
    gaps: c.gaps ?? [],
    zeroDot: c.zeroDot ?? false,
    flag: c.flag ?? null,
    showRail: c.showRail ?? true,
    walker: c.walker ?? true,
    facing: c.facing ?? false,
    crank: c.crank ?? true,
    crankAt: c.crankAt ?? "bottomLeft",
    drawer: c.drawer ?? null,
    ledger: c.ledger ?? false,
    arrows: c.arrows ?? false,
    trail: c.trail ?? false,
    line: c.line ?? null,
    building: c.building ?? null,
    board: c.board ?? null,
    stops: c.stops ?? [],
    box: c.box ?? false,
    drawings: c.drawings ?? null,
    explain: c.explain ?? null,
    m: {
      ...DEFAULT_METRICS,
      ...m,
      stone: { ...DEFAULT_METRICS.stone, ...m?.stone },
      band: { ...DEFAULT_METRICS.band, ...m?.band },
      flag: { ...DEFAULT_METRICS.flag, ...m?.flag },
      card: { ...DEFAULT_METRICS.card, ...m?.card },
      crank: { ...DEFAULT_METRICS.crank, ...m?.crank },
      touch: { ...DEFAULT_METRICS.touch, ...m?.touch },
    },
  };
}

// --- Dónde cae cada cosa -----------------------------------------------------

/** Una pista dibujada. Comparar recorridos monta dos; el resto de los niveles, una. */
export interface Rail {
  /** El centro de cada casilla, indexado por su índice. */
  readonly stones: readonly Spot[];
  /** La casilla 0. Es desde acá que el caminante se corre `dx` por casilla. */
  readonly origin: Spot;
  /** Cuánto se corre el caminante, en píxeles, por cada casilla. */
  readonly dx: number;
  readonly dy: number;
  readonly step: number;
  /** Los dos extremos de lo dibujado, incluido el tramo previo a la casilla 0. */
  readonly from: Spot;
  readonly to: Spot;
  /** La coordenada constante: la `y` de una pista acostada. */
  readonly y: number;
}

/** Una celda del renglón: un numeral, un signo, o el hueco que hay que llenar. */
export interface Cell {
  readonly kind: "num" | "plus" | "eq" | "slot";
  readonly value: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface TrackLayout {
  readonly width: number;
  readonly height: number;
  /** Las pistas principales. La primera es la que se juega. */
  readonly rails: readonly Rail[];
  readonly rail: Rail;
  /** Las pistas de la explicación, cuando son aparte de las principales. */
  readonly explainRails: readonly Rail[];
  /**
   * Las `y` de las opciones que la explicación ofrece, cualquiera sea su forma.
   * Es lo único que el hit test necesita para saber cuál se tocó.
   */
  readonly rows: readonly number[];
  readonly stoneRx: number;
  readonly stoneRy: number;
  readonly cardW: number;
  readonly cardH: number;
  /** Del centro de la casilla al centro de su numeral. */
  readonly cardDx: number;
  readonly cardDy: number;
  readonly numeralEvery: number;
  readonly touchR: number;
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  readonly chips: readonly Spot[];
  readonly chipW: number;
  readonly chipH: number;
  readonly ledger: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    readonly rowH: number;
  };
  readonly cells: readonly Cell[];
  /** El hueco del renglón, o el lugar de la ficha que contesta. */
  readonly slot: Cell | null;
  /** El edificio: centro, ancho, piso más bajo y altura de un piso. */
  readonly shaft: {
    readonly x: number;
    readonly w: number;
    readonly bottom: number;
    readonly floorH: number;
  };
  readonly floorEvery: number;
  readonly board: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
  readonly tokens: readonly Spot[];
  readonly tokenR: number;
  readonly box: Spot;
  readonly boxW: number;
  readonly boxH: number;
  readonly stops: readonly Spot[];
  readonly drawings: readonly Spot[];
  readonly drawingR: number;
}

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la ficha entraría donde no se ve.
 */
export function trackLayout(config: TrackConfig, width: number, height: number): TrackLayout {
  const s = settle(config);
  const m = s.m;
  const units = Math.max(config.slots - 1 + s.leadIn, 1);
  const vertical = s.orientation === "vertical";
  // El edificio le come ancho al soporte: si no, se pisan.
  const reserved = s.building?.reserve ?? 0;

  const rails = config.railRows.map((row) =>
    vertical
      ? upward(config, s, width * row, height, units)
      : horizontal(config, s, width, height * row, units, width - reserved),
  );
  const rail = rails[0] ?? horizontal(config, s, width, height * 0.4, units, width);
  const step = rail.step;

  const crankR = Math.max(m.crank.min, Math.min(m.crank.max, height * m.crank.frac));
  const crank =
    s.crankAt === "right"
      ? { x: width - crankR - m.pad, y: height * 0.3, r: crankR }
      : { x: m.pad + crankR, y: height - crankR - m.crank.margin, r: crankR };

  // --- El cajón ---
  const d = s.drawer;
  const chipW = d?.w ?? 46;
  const chipH = d?.h ?? 46;
  const views = d?.views ?? 0;
  const gap = d?.gap ?? 10;
  const shown = Math.max(d?.chips.length ?? 0, 1);
  // El cajón siempre monta las mismas ranuras: las que esta ronda no usa se van
  // del lienzo, y así el árbol de la escena no cambia de una ronda a la otra.
  const laid =
    d?.spread === "views"
      ? views * chipW + (views - 1) * gap
      : shown * chipW + (shown - 1) * gap;
  const drawerCx =
    d === null ? width / 2
    : d.center === "midRight" ? (crank.x + crank.r + width) / 2
    : d.center === "afterCrank" ?
      Math.max(crank.x + crank.r + 20 + laid / 2, width * d.centerFrac)
    : width * d.centerFrac;
  const chipY =
    d === null ? height
    : d.at === "top" ? height * d.margin
    : height - chipH / 2 - d.margin;
  const chips: Spot[] = [];
  for (let i = 0; i < views; i++) {
    chips.push(
      i < (d?.chips.length ?? 0)
        ? { x: drawerCx - laid / 2 + chipW / 2 + i * (chipW + gap), y: chipY }
        : { x: drawerCx, y: height + chipH * 2 },
    );
  }

  // --- El libro ---
  const ledgerW = Math.min(190, width * 0.26);
  const rowH = 26;
  const ledger = {
    x: width - ledgerW - m.pad / 2,
    y: rail.y + height * 0.14,
    w: ledgerW,
    h: rowH * (LEDGER_ROWS + 1),
    rowH,
  };

  // --- El renglón ---
  const cells = s.line ? makeCells(s.line, width, height * 0.5) : [];
  const slot = cells.find((c) => c.kind === "slot") ?? null;

  // --- El edificio ---
  const b = s.building;
  const alto = height * (b?.beside ? 0.62 : 0.7);
  const floorH = Math.max(6, Math.min(26, alto / config.slots));
  const shaftW = Math.min(88, width * 0.16);
  const shaftX = b?.beside ? width - shaftW / 2 - m.pad : width * (b?.centerFrac ?? 0.5);
  const shaft = {
    x: shaftX,
    w: shaftW,
    bottom: height * 0.5 + (config.slots * floorH) / 2,
    floorH,
  };

  // --- El tablero ---
  const boardW = Math.min(280, width * 0.42);
  const board = { x: width * 0.56, y: height * 0.16, w: boardW, h: height * 0.44 };
  const tokenR = 15;
  const tokenGap = 14;
  const tokenViews = s.board?.views ?? 0;
  const tokenTotal = tokenViews * tokenR * 2 + (tokenViews - 1) * tokenGap;
  const tokens: Spot[] = [];
  for (let i = 0; i < tokenViews; i++) {
    tokens.push(
      i < (s.board?.tokens.length ?? 0)
        ? {
            x: board.x - tokenTotal / 2 + tokenR + i * (tokenR * 2 + tokenGap),
            y: height - tokenR - 18,
          }
        : { x: board.x, y: height + tokenR * 4 },
    );
  }

  // --- La fila de dibujos ---
  const count = Math.max(s.drawings?.count ?? 0, 1);
  const drawingR = Math.min(26, (width - 2 * m.pad) / (count * 2.6));
  const drawStep = drawingR * 2.6;
  const drawings: Spot[] = [];
  for (let i = 0; i < (s.drawings?.count ?? 0); i++) {
    drawings.push({ x: width / 2 + (i - (count - 1) / 2) * drawStep, y: height * 0.58 });
  }

  // --- La explicación ---
  const explainRows = s.explain && s.explain.kind !== "walks" ? s.explain.rows : [];
  const explainRails =
    s.explain?.kind === "arrival"
      ? s.explain.rows.map((row) => horizontal(config, s, width, height * row, units, width))
      : [];
  const rows =
    s.explain === null ? []
    : s.explain.kind === "walks" ? rails.map((r) => r.y)
    : explainRows.map((row) => height * row);

  const every = m.numeralEvery;
  return {
    width,
    height,
    rails,
    rail,
    explainRails,
    rows,
    stoneRx: Math.min(step * m.stone.frac, m.stone.max),
    stoneRy:
      m.stone.flat > 0 ? m.stone.flat : Math.min(step * m.stone.frac, m.stone.max) * 0.44,
    cardW: vertical ? 34 : Math.max(m.card.min, Math.min(step * m.card.frac, m.card.max)),
    cardH: vertical ? Math.max(15, Math.min(26, step - 5)) : m.card.h,
    cardDx: vertical ? 34 : 0,
    cardDy: vertical ? 0 : s.numerals === "plain" ? m.plainDy : m.cardDy,
    numeralEvery: every === null ? 1 : step >= every[0] ? 1 : step >= every[1] ? 2 : 5,
    touchR: Math.max(step * m.touch.frac, m.touch.min),
    crank,
    chips,
    chipW,
    chipH,
    ledger,
    cells,
    slot,
    shaft,
    floorEvery: floorH >= 18 ? 1 : floorH >= 11 ? 2 : 5,
    board,
    tokens,
    tokenR,
    box: { x: width / 2, y: height * 0.86 },
    boxW: chipW + 24,
    boxH: chipH + 20,
    stops: s.stops.map((_, i) => ({
      x: width / 2 + (i - (s.stops.length - 1) / 2) * 160,
      y: height * 0.13,
    })),
    drawings,
    drawingR,
  };
}

function horizontal(
  c: TrackConfig,
  s: Settled,
  width: number,
  y: number,
  units: number,
  usable: number,
): Rail {
  const step = Math.min(((usable - 2 * s.m.pad) / units) * s.stretch, s.m.maxStep);
  const drawn = step * units;
  // Con el edificio al costado la pista arranca en el margen y no en el centro:
  // centrarla la metería debajo del corte.
  const left = usable === width ? (width - drawn) / 2 : s.m.pad;
  const origin = { x: left + s.leadIn * step, y };
  const stones: Spot[] = [];
  for (let i = 0; i < c.slots; i++) stones.push({ x: origin.x + i * step, y });
  return {
    stones,
    origin,
    dx: step,
    dy: 0,
    step,
    from: { x: left, y },
    to: { x: left + drawn, y },
    y,
  };
}

/** El soporte parado: el orden va hacia arriba, que es lo que a veces se rompe. */
function upward(c: TrackConfig, s: Settled, x: number, height: number, units: number): Rail {
  const step = Math.min(((height - 2 * s.m.pad) / units) * s.stretch, s.m.maxStep);
  const drawn = step * units;
  const bottom = (height + drawn) / 2;
  const origin = { x, y: bottom - s.leadIn * step };
  const stones: Spot[] = [];
  for (let i = 0; i < c.slots; i++) stones.push({ x, y: origin.y - i * step });
  return {
    stones,
    origin,
    dx: 0,
    dy: -step,
    step,
    from: { x, y: bottom },
    to: { x, y: bottom - drawn },
    y: origin.y,
  };
}

/**
 * El renglón. El primer número es la casilla de partida y no un tramo, así que
 * cuando el caminante sale de la orilla se calla: `0 + 3 + 2` diría lo mismo que
 * `3 + 2` con una ficha de más.
 */
function makeCells(line: TrackLine, width: number, y: number): Cell[] {
  const w = 44;
  const sign = 30;
  const kinds: { kind: Cell["kind"]; value: number }[] = [];
  if (line.start > 0) kinds.push({ kind: "num", value: line.start });
  line.steps.forEach((v, i) => {
    if (kinds.length > 0) kinds.push({ kind: "plus", value: 0 });
    kinds.push({ kind: i === line.hidden ? "slot" : "num", value: v });
  });
  kinds.push({ kind: "eq", value: 0 });
  kinds.push({ kind: line.hidden >= 0 ? "num" : "slot", value: line.arrival });

  const widths = kinds.map((k) => (k.kind === "plus" || k.kind === "eq" ? sign : w));
  const gap = 8;
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (kinds.length - 1);
  let x = (width - totalW) / 2;
  return kinds.map((k, i) => {
    const cw = widths[i] as number;
    const cell: Cell = { kind: k.kind, value: k.value, x: x + cw / 2, y, w: cw, h: 46 };
    x += cw + gap;
    return cell;
  });
}

// --- Numerales ---------------------------------------------------------------

/** El signo del número es U+2212, el del atlas. Un guion de ASCII no se dibuja. */
export const signed = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : String(n));

/**
 * Un texto, dibujado. Sale del mismo atlas que la ecuación del nodo 13, así que
 * el `5` de una tarjeta y el `5` de una ecuación son el mismo objeto.
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

/**
 * El mismo número sin numeral: puntos en una grilla. Es lo que queda en los
 * niveles donde la estructura tiene que reconocerse sin saber leer cifras.
 */
function addDots(target: SkPath, value: number, cx: number, cy: number, size: number): void {
  const cols = Math.min(3, Math.max(1, value));
  const rows = Math.ceil(value / cols);
  const d = size * 0.3;
  for (let i = 0; i < value; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    target.addCircle(
      cx + (c - (cols - 1) / 2) * d * 1.9,
      cy + (r - (rows - 1) / 2) * d * 1.9,
      d * 0.6,
    );
  }
}

/** Un número dibujado como lo pide el nivel: cifra, o cuenta de puntos. */
function addNumber(
  target: SkPath,
  value: number,
  cx: number,
  cy: number,
  size: number,
  numerals: boolean,
): void {
  if (numerals || Math.abs(value) > 9) addGlyphs(target, signed(value), cx, cy, size);
  else addDots(target, Math.abs(value), cx, cy, size);
}

// --- Geometría ---------------------------------------------------------------

interface RailGeom {
  readonly band: SkPath;
  readonly stones: SkPath;
  readonly cards: SkPath;
  readonly numerals: SkPath;
  readonly holes: SkPath;
  readonly zeroDot: SkPath;
  readonly flag: SkPath;
  readonly flagStone: SkPath;
}

/**
 * El soporte. Un solo paso para todas las casillas: eso es lo que hace que el
 * lado izquierdo del cero sea el mismo soporte y no otro. Un paso más chico de
 * un lado no se podría dibujar aunque alguien quisiera.
 */
function buildRail(
  c: TrackConfig,
  s: Settled,
  l: TrackLayout,
  rail: Rail,
  filled: readonly number[],
  /** El cero de ahora, que no es el de la configuración cuando la calle se mudó. */
  zero: number,
): RailGeom {
  const mark = c.skin !== "stone";
  const vertical = s.orientation === "vertical";
  const m = s.m;

  const band = Skia.Path.Make();
  if (mark) {
    const over = m.markOver;
    band.moveTo(rail.from.x - (vertical ? 0 : over), rail.from.y + (vertical ? over : 0));
    band.lineTo(rail.to.x + (vertical ? 0 : over), rail.to.y - (vertical ? over : 0));
  } else if (vertical) {
    band.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(
          rail.to.x - m.band.half,
          rail.to.y - m.band.over,
          m.band.half * 2,
          rail.from.y - rail.to.y + m.band.over * 2,
        ),
        m.band.half,
        m.band.half,
      ),
    );
  } else {
    band.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(
          rail.from.x - m.band.over,
          rail.from.y - m.band.half,
          rail.to.x - rail.from.x + m.band.over * 2,
          m.band.half * 2,
        ),
        m.band.half,
        m.band.half,
      ),
    );
  }

  const stones = Skia.Path.Make();
  const holes = Skia.Path.Make();
  const cards = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const size = s.numerals === "plain" ? m.plainSize : Math.min(l.cardH * 0.72, 19);

  for (let i = 0; i < c.slots; i++) {
    const stone = rail.stones[i] as Spot;
    if (mark) {
      // La casilla aplanada: una marca perpendicular a la línea.
      const h = m.markHalf;
      if (vertical) {
        stones.moveTo(stone.x - h, stone.y);
        stones.lineTo(stone.x + h, stone.y);
      } else {
        stones.moveTo(stone.x, stone.y - h);
        stones.lineTo(stone.x, stone.y + h);
      }
    } else {
      stones.addOval(
        Skia.XYWHRect(stone.x - l.stoneRx, stone.y - l.stoneRy, l.stoneRx * 2, l.stoneRy * 2),
      );
    }

    if (s.numerals === "none" || i < s.numeralFrom || i % l.numeralEvery !== 0) continue;
    const cx = stone.x + l.cardDx;
    const cy = stone.y + l.cardDy;
    if (s.gaps.includes(i) && !filled.includes(i)) {
      // El hueco se ve como hueco: el marco vacío pide la ficha sin decirlo.
      holes.addRRect(
        Skia.RRectXY(Skia.XYWHRect(cx - l.cardW / 2, cy - l.cardH / 2, l.cardW, l.cardH), 5, 5),
      );
      continue;
    }
    if (!mark && s.numerals === "cards") {
      cards.addRRect(
        Skia.RRectXY(Skia.XYWHRect(cx - l.cardW / 2, cy - l.cardH / 2, l.cardW, l.cardH), 5, 5),
      );
    }
    addGlyphs(numerals, signed(i - zero), cx, cy, size);
  }

  const zeroDot = Skia.Path.Make();
  const cero = rail.stones[zero];
  if (s.zeroDot && cero) zeroDot.addCircle(cero.x, cero.y, 7);

  const flag = Skia.Path.Make();
  const flagStone = Skia.Path.Make();
  const target = s.flag === null ? undefined : rail.stones[s.flag.at];
  if (s.flag && target) {
    const side = s.flag.side ?? 1;
    const f = m.flag;
    flag.moveTo(target.x, target.y - f.base);
    flag.lineTo(target.x, target.y - f.top);
    flag.lineTo(target.x + f.span * side, target.y - (f.top - f.drop));
    flag.lineTo(target.x, target.y - (f.top - 2 * f.drop));
    if (s.flag.halo !== false) {
      flagStone.addOval(
        Skia.XYWHRect(
          target.x - l.stoneRx - 4,
          target.y - l.stoneRy - 4,
          l.stoneRx * 2 + 8,
          l.stoneRy * 2 + 8,
        ),
      );
    }
  }
  return { band, stones, cards, numerals, holes, zeroDot, flag, flagStone };
}

/** La rueda dentada. Los dientes son todos iguales: eso es el invariante. */
function buildCrank(r: number): { body: SkPath; teeth: SkPath; handle: SkPath } {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  body.addCircle(0, 0, 4);
  const teeth = Skia.Path.Make();
  for (let i = 0; i < TEETH_PER_TURN; i++) {
    const a = i * TOOTH_ANGLE - Math.PI / 2;
    teeth.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    teeth.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
  }
  const handle = Skia.Path.Make();
  handle.moveTo(0, 0);
  handle.lineTo(0, -r * 0.62);
  handle.addCircle(0, -r * 0.62, 8);
  return { body, teeth, handle };
}

/**
 * El tope: tantos dientes iluminados como dice la ficha. Es el número que fija
 * el largo del tirón, y se ve como lo que es —una cantidad de dientes— y no como
 * un lugar del soporte. Con signo negativo se cuenta hacia el otro lado, que es
 * lo que hace legible un tramo hacia atrás.
 */
function buildStop(r: number, teeth: number, reach: number): SkPath {
  const p = Skia.Path.Make();
  const dir = teeth < 0 ? -1 : 1;
  for (let i = 0; i < Math.min(Math.abs(teeth), TEETH_PER_TURN); i++) {
    const a = dir * i * TOOTH_ANGLE - Math.PI / 2;
    p.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62);
    p.lineTo(Math.cos(a) * r * reach, Math.sin(a) * r * reach);
  }
  return p;
}

/**
 * El caminante: unos pocos trazos, sin cara y sin texto. Sirve para cualquier
 * idioma. La bandera es un triángulo que apunta hacia donde mira, y en la capa
 * simbólica es el trazo del signo antes de acostarse.
 */
function buildWalker(arms: boolean): { body: SkPath; head: SkPath; flag: SkPath } {
  const body = Skia.Path.Make();
  body.moveTo(0, -8);
  body.lineTo(0, -22);
  body.moveTo(-7, -2);
  body.lineTo(0, -10);
  body.lineTo(7, -2);
  // Los brazos en alto. El caminante que lleva bandera no los tiene: la
  // bandera sale de ese hombro y los dos trazos se leerían como uno solo.
  if (arms) {
    body.moveTo(-7, -18);
    body.lineTo(0, -20);
    body.lineTo(7, -16);
  }
  const head = Skia.Path.Make();
  head.addCircle(0, -28, 6);
  const flag = Skia.Path.Make();
  flag.moveTo(0, -22);
  flag.lineTo(16, -18);
  flag.lineTo(0, -14);
  flag.close();
  return { body, head, flag };
}

/**
 * La estela: un arco por cada casilla que el tramo saltó. Es lo que deja ver por
 * dónde pasó el caminante sin haber pisado, que es la diferencia entre dar un
 * tramo y dar pasos.
 */
function buildTrail(rail: Rail, from: number, to: number): SkPath {
  const p = Skia.Path.Make();
  for (let i = from; i < to; i++) {
    const a = rail.stones[i];
    const b = rail.stones[i + 1];
    if (!a || !b) continue;
    p.moveTo(a.x, a.y - 10);
    p.quadTo((a.x + b.x) / 2, a.y - 34, b.x, b.y - 10);
  }
  return p;
}

/** Una flecha con cola y punta, que abarca tantas marcas como pasos tiene el tramo. */
function buildArrow(rail: Rail, from: number, to: number, lift: number): SkPath {
  const a = rail.stones[from];
  const b = rail.stones[to];
  const p = Skia.Path.Make();
  if (!a || !b) return p;
  const y = a.y - lift;
  p.moveTo(a.x, y);
  p.lineTo(b.x, y);
  // Un tramo de cero no tiene punta: la flecha es un punto, y eso es el dato.
  if (to === from) {
    p.addCircle(a.x, y, 3);
    return p;
  }
  p.moveTo(b.x - 9, y - 5);
  p.lineTo(b.x, y);
  p.lineTo(b.x - 9, y + 5);
  p.moveTo(a.x, y - 5);
  p.lineTo(a.x, y + 5);
  return p;
}

/** Una fila del libro: una marca por paso y el numeral del tramo al costado. */
function buildLedgerRow(
  l: TrackLayout,
  index: number,
  value: number,
  numerals: boolean,
  isTotal: boolean,
): SkPath {
  const p = Skia.Path.Make();
  const y = l.ledger.y + l.ledger.rowH * (index + 0.5) + (isTotal ? 6 : 0);
  const left = l.ledger.x + 12;
  const marks = Math.min(value, 12);
  for (let i = 0; i < marks; i++) {
    const x = left + i * 8;
    p.moveTo(x, y - 6);
    p.lineTo(x, y + 6);
  }
  addNumber(p, value, l.ledger.x + l.ledger.w - 20, y, 16, numerals);
  return p;
}

/**
 * El edificio en corte. Los pisos de arriba llevan ventana y los de abajo la luz
 * de garaje: así se distinguen sin leer, que es lo que pide `literacy: none`.
 */
function buildShaft(c: TrackConfig, s: Settled, l: TrackLayout, zero: number) {
  const walls = Skia.Path.Make();
  const windows = Skia.Path.Make();
  const garage = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const street = Skia.Path.Make();
  const mark = Skia.Path.Make();
  const b = s.building;
  const { x, w, bottom, floorH } = l.shaft;
  if (!b) return { walls, windows, garage, numerals, street, mark };

  for (let i = 0; i < c.slots; i++) {
    const y = bottom - (i + 1) * floorH;
    walls.addRect(Skia.XYWHRect(x - w / 2, y, w, floorH));
    const cy = y + floorH / 2;
    if (i > zero) {
      windows.addRect(Skia.XYWHRect(x - w * 0.22, cy - floorH * 0.22, w * 0.2, floorH * 0.44));
    } else if (i < zero) {
      // La luz de garaje: un abanico corto, que se reconoce sin nombrarlo.
      garage.moveTo(x - w * 0.26, cy);
      garage.lineTo(x + w * 0.18, cy);
    }
    // El numeral va afuera de la pared. Adentro, el trazo del signo se pega a la
    // luz de garaje y los dos se leen como una sola raya.
    if (b.numerals && i % l.floorEvery === 0 && floorH >= 9) {
      addGlyphs(numerals, signed(i - zero), x + w / 2 + 16, cy, Math.min(14, floorH * 0.7));
    }
  }
  const sy = bottom - zero * floorH;
  street.moveTo(x - w * 0.85, sy);
  street.lineTo(x + w * 0.85, sy);

  // La altura marcada: adonde hay que mudar la calle. Se dibuja a rayas para que
  // no se confunda con la calle misma, que es la que se arrastra.
  if (b.moveTo !== null) {
    const my = bottom - b.moveTo * floorH;
    for (let i = -5; i < 5; i++) {
      mark.moveTo(x + (i * w * 1.7) / 10, my);
      mark.lineTo(x + (i * w * 1.7) / 10 + w * 0.1, my);
    }
  }
  return { walls, windows, garage, numerals, street, mark };
}

/** El ascensor: la caja que sube y baja por el mismo eje que la manivela. */
function buildCar(w: number, h: number): SkPath {
  const p = Skia.Path.Make();
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(-w * 0.34, -h * 0.4, w * 0.68, h * 0.8), 3, 3));
  return p;
}

/** Una moneda es un disco lleno; un vale, un rectángulo hueco. */
function tokenPath(value: number, r: number): SkPath {
  const p = Skia.Path.Make();
  const size = r * (0.6 + 0.2 * Math.min(3, Math.abs(value)));
  if (value >= 0) {
    p.addCircle(0, 0, size);
    return p;
  }
  p.addRRect(Skia.RRectXY(Skia.XYWHRect(-size, -size * 0.7, size * 2, size * 1.4), 3, 3));
  return p;
}

/** Dónde descansa una moneda o un vale ya puesto en su columna. */
export function boardSlot(l: TrackLayout, value: number, order: number): Spot {
  const { x, y, w, h } = l.board;
  const col = value >= 0 ? x - w / 4 : x + w / 4;
  const filas = Math.max(1, Math.floor((h - 30) / 38));
  return { x: col, y: y + 26 + (order % filas) * 38 };
}

/** Una ficha con su numeral y, si hace falta, el trazo del signo. */
function chipPath(
  value: number,
  w: number,
  h: number,
  numerals: boolean,
  withSign: boolean,
): { box: SkPath; ink: SkPath } {
  const box = Skia.Path.Make();
  box.addRRect(Skia.RRectXY(Skia.XYWHRect(-w / 2, -h / 2, w, h), 9, 9));
  const ink = Skia.Path.Make();
  const size = Math.min(h * 0.5, 24);
  if (numerals) {
    addGlyphs(ink, withSign ? signed(value) : String(value), 0, 0, size);
  } else if (withSign) {
    // Sin numerales, el valor es una cuenta de puntos en una sola fila.
    const n = Math.min(Math.abs(value), 6);
    for (let i = 0; i < n; i++) ink.addCircle((i - (n - 1) / 2) * 9, 0, 3);
  } else {
    addNumber(ink, value, 0, 0, size, false);
  }
  return { box, ink };
}

/**
 * Un dibujo de la fila. No es un numeral ni una casilla: es una forma
 * cualquiera, y por eso sirve para probar que la dirección se entendió sin el
 * soporte graduado.
 */
function drawingPath(index: number, r: number): SkPath {
  const p = Skia.Path.Make();
  const k = index % 4;
  if (k === 0) p.addCircle(0, 0, r * 0.6);
  else if (k === 1) p.addRect(Skia.XYWHRect(-r * 0.5, -r * 0.5, r, r));
  else if (k === 2) {
    p.moveTo(0, -r * 0.6);
    p.lineTo(r * 0.6, r * 0.5);
    p.lineTo(-r * 0.6, r * 0.5);
    p.close();
  } else {
    p.moveTo(0, -r * 0.65);
    p.lineTo(r * 0.6, 0);
    p.lineTo(0, r * 0.65);
    p.lineTo(-r * 0.6, 0);
    p.close();
  }
  return p;
}

/** Suaviza el paseo de la mano fantasma: tiene que parecer un gesto, no un salto. */
function ghostT01(t: number): number {
  "worklet";
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// --- Componente --------------------------------------------------------------

/** Una ficha, una moneda o cualquier cosa que el dedo arrastre. */
export interface DragView {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras está en su lugar de origen; 0 cuando se usó o no existe. */
  readonly alive: SharedValue<number>;
}

/** Un tramo ya hecho, para dibujar su estela, su flecha y su fila del libro. */
export interface Leg {
  readonly from: number;
  readonly to: number;
  readonly value: number;
}

export interface TrackSceneProps {
  readonly config: TrackConfig;
  readonly layout: TrackLayout;

  // --- Los valores que trae el gesto. Ninguno vuelve al hilo de JS por cuadro. ---
  /** La posición del caminante, en casillas. */
  readonly pos: SharedValue<number>;
  readonly appear: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. */
  readonly demo: SharedValue<number>;
  /** El reloj de las animaciones que se comparan, de 0 a 1. */
  readonly clock?: SharedValue<number>;
  /** 1 mientras el caminante flota despegado del soporte. */
  readonly lift?: SharedValue<number>;
  /** Hacia dónde mira: 1 a la derecha, -1 a la izquierda. */
  readonly facing?: SharedValue<number>;
  /** La manivela contra el tope del borde: vibra y no pasa. */
  readonly jam?: SharedValue<number>;
  /** Lo que la manivela gira sin que el caminante se mueva: el tope sin dientes. */
  readonly spin?: SharedValue<number>;
  /** La tarjeta que se levanta al tocar una casilla. */
  readonly tapLift?: SharedValue<number>;
  /** El soporte que el renglón devuelve como fantasma. */
  readonly ghostRail?: SharedValue<number>;
  /** El arrastre de la flecha por el soporte: el largo no cambia. */
  readonly arrowDx?: SharedValue<number>;
  /** El edificio que se pide con un toque y se apaga solo. */
  readonly reveal?: SharedValue<number>;
  /** La calle mientras el dedo la arrastra, en pisos. */
  readonly street?: SharedValue<number>;

  // --- El estado de la ronda ---
  /**
   * Los dientes iluminados en la manivela, con signo. 0 o ausente: la manivela
   * está desnuda. Es el largo del tirón, decidido por la ficha puesta.
   */
  readonly stop?: number;
  /** Los tramos ya hechos, en el orden en que el jugador los hizo. */
  readonly legs?: readonly Leg[];
  /** Los huecos que el jugador ya completó. */
  readonly filled?: readonly number[];
  /** La casilla cuya tarjeta se está levantando por un toque, o -1. */
  readonly tapped?: number;
  /** La opción que el jugador eligió al comparar, o -1. */
  readonly picked?: number;
  /** La respuesta ya puesta en el hueco, o -1. */
  readonly answered?: number;
  /** El índice de la calle ya asentada: con eso se nombran los pisos. */
  readonly zero?: number;
  /** El neto que muestra el tablero. */
  readonly net?: number;
  /** Los pares que ya se apagaron. */
  readonly cancelled?: readonly boolean[];
  /** Las dos animaciones que se comparan están a la vista. */
  readonly explaining?: boolean;
  /**
   * El edificio queda a la vista aunque esté retirado. Se usa mientras el
   * jugador muda la calle: la calle es parte del edificio, y pedirle que
   * arrastre algo que no está en pantalla no es una dificultad, es un error.
   */
  readonly pinned?: boolean;
  /** Adónde va la mano fantasma, o `null` cuando no hay nada que demostrar. */
  readonly ghost?: TrackGhost | null;
  readonly chips?: readonly DragView[];
  readonly tokens?: readonly DragView[];
}

export function TrackScene(props: TrackSceneProps) {
  const { config, layout: l } = props;
  const s = useMemo(() => settle(config), [config]);

  // Los valores que este nodo no usa igual tienen que existir: un hook no se
  // puede llamar a veces, y un `SharedValue` en cero no dibuja nada.
  const zeroSV = useSharedValue(0);
  const oneSV = useSharedValue(1);
  const lift = props.lift ?? zeroSV;
  const facing = props.facing ?? oneSV;
  const jam = props.jam ?? zeroSV;
  const spin = props.spin ?? zeroSV;
  const clock = props.clock ?? zeroSV;
  const tapLift = props.tapLift ?? zeroSV;
  const ghostRail = props.ghostRail ?? oneSV;
  const arrowDx = props.arrowDx ?? zeroSV;
  const reveal = props.reveal ?? zeroSV;
  const street = props.street ?? zeroSV;

  const legs = props.legs ?? [];
  const filled = props.filled ?? [];
  const chips = props.chips ?? [];
  const tokens = props.tokens ?? [];
  const zero = props.zero ?? s.zeroAt;
  const stop = props.stop ?? 0;
  const picked = props.picked ?? -1;
  const tapped = props.tapped ?? -1;
  const answered = props.answered ?? -1;
  const explaining = props.explaining ?? false;
  const ghost = props.ghost ?? null;

  const railGeoms = useMemo(
    () => l.rails.map((r) => buildRail(config, s, l, r, filled, zero)),
    [config, s, l, filled, zero],
  );
  const explainGeoms = useMemo(
    () => l.explainRails.map((r) => buildRail(config, s, l, r, filled, zero)),
    [config, s, l, filled, zero],
  );
  const crank = useMemo(() => buildCrank(l.crank.r), [l.crank.r]);
  const stopGeom = useMemo(
    () => buildStop(l.crank.r, stop, s.m.stopReach),
    [l.crank.r, stop, s.m.stopReach],
  );
  const walker = useMemo(() => buildWalker(!s.facing), [s.facing]);
  const shaft = useMemo(() => buildShaft(config, s, l, zero), [config, s, l, zero]);
  const car = useMemo(() => buildCar(l.shaft.w, l.shaft.floorH), [l.shaft.w, l.shaft.floorH]);

  /** La tarjeta que se levanta al tocar una casilla, para mirar sin caminar. */
  const peek = useMemo(() => {
    const card = Skia.Path.Make();
    const digits = Skia.Path.Make();
    const stone = tapped >= 0 ? l.rail.stones[tapped] : undefined;
    if (stone) {
      const cx = stone.x + l.cardDx;
      const cy = stone.y + l.cardDy;
      card.addRRect(
        Skia.RRectXY(Skia.XYWHRect(cx - l.cardW / 2, cy - l.cardH / 2, l.cardW, l.cardH), 5, 5),
      );
      addGlyphs(digits, signed(tapped - zero), cx, cy, Math.min(l.cardH * 0.72, 19));
    }
    return { card, digits };
  }, [tapped, l, zero]);

  /** Estelas y flechas de los tramos ya hechos, más la del viaje entero. */
  const marks = useMemo(() => {
    const trail = Skia.Path.Make();
    const arrows = Skia.Path.Make();
    const whole = Skia.Path.Make();
    for (const leg of legs) {
      if (s.trail) {
        trail.addPath(buildTrail(l.rail, Math.min(leg.from, leg.to), Math.max(leg.from, leg.to)));
      }
      if (s.arrows) arrows.addPath(buildArrow(l.rail, leg.from, leg.to, 24));
    }
    if (s.arrows && legs.length > 1) {
      const first = legs[0] as Leg;
      const last = legs[legs.length - 1] as Leg;
      whole.addPath(buildArrow(l.rail, first.from, last.to, 54));
    }
    return { trail, arrows, whole };
  }, [legs, l.rail, s.arrows, s.trail]);

  /** La flecha suelta: la última hecha, que se arrastra y conserva el largo. */
  const loose = useMemo(() => {
    const last = legs[legs.length - 1];
    if (!s.arrows || !s.trail || !last) return Skia.Path.Make();
    return buildArrow(l.rail, last.from, last.to, 24);
  }, [legs, l.rail, s.arrows, s.trail]);

  const ledger = useMemo(() => {
    const box = Skia.Path.Make();
    const rows = Skia.Path.Make();
    const rule = Skia.Path.Make();
    if (!s.ledger) return { box, rows, rule };
    box.addRRect(
      Skia.RRectXY(Skia.XYWHRect(l.ledger.x, l.ledger.y, l.ledger.w, l.ledger.h), 8, 8),
    );
    const numerals = s.drawer?.numerals ?? true;
    legs.forEach((leg, i) => {
      if (i < LEDGER_ROWS - 1) rows.addPath(buildLedgerRow(l, i, leg.value, numerals, false));
    });
    if (legs.length > 1) {
      const y = l.ledger.y + l.ledger.rowH * (LEDGER_ROWS - 1) + 2;
      rule.moveTo(l.ledger.x + 10, y);
      rule.lineTo(l.ledger.x + l.ledger.w - 10, y);
      rows.addPath(
        buildLedgerRow(l, LEDGER_ROWS - 1, legs.reduce((a, b) => a + b.value, 0), numerals, true),
      );
    }
    return { box, rows, rule };
  }, [s.ledger, s.drawer, l, legs]);

  const row = useMemo(() => {
    const boxes = Skia.Path.Make();
    const signs = Skia.Path.Make();
    const slot = Skia.Path.Make();
    const numerals = s.drawer?.numerals ?? true;
    for (const cell of l.cells) {
      if (cell.kind === "plus" || cell.kind === "eq") {
        addGlyphs(signs, cell.kind === "plus" ? "+" : "=", cell.x, cell.y, 26);
        continue;
      }
      const box = Skia.RRectXY(
        Skia.XYWHRect(cell.x - cell.w / 2, cell.y - cell.h / 2, cell.w, cell.h),
        10,
        10,
      );
      if (cell.kind === "slot") {
        slot.addRRect(box);
        continue;
      }
      boxes.addRRect(box);
      addNumber(signs, cell.value, cell.x, cell.y, 22, numerals);
    }
    return { boxes, signs, slot };
  }, [l.cells, s.drawer]);

  /** La respuesta que ya cayó en el hueco del renglón. */
  const filledSlot = useMemo(() => {
    const p = Skia.Path.Make();
    if (s.line && answered >= 0 && l.slot) {
      addNumber(p, answered, l.slot.x, l.slot.y, 22, s.drawer?.numerals ?? true);
    }
    return p;
  }, [s.line, s.drawer, answered, l.slot]);

  const chipGeom = useMemo(() => {
    const d = s.drawer;
    return l.chips.map((spot, i) => {
      const value = d?.chips[i]?.value ?? 0;
      const g = chipPath(value, l.chipW, l.chipH, d?.numerals ?? true, d?.signed ?? false);
      return { ...g, spot, exists: i < (d?.chips.length ?? 0) };
    });
  }, [s.drawer, l.chips, l.chipW, l.chipH]);

  const board = useMemo(() => {
    const box = Skia.Path.Make();
    const split = Skia.Path.Make();
    const net = Skia.Path.Make();
    const target = Skia.Path.Make();
    if (!s.board) return { box, split, net, target };
    const { x, y, w, h } = l.board;
    box.addRRect(Skia.RRectXY(Skia.XYWHRect(x - w / 2, y, w, h), 10, 10));
    split.moveTo(x, y + 10);
    split.lineTo(x, y + h - 10);
    addGlyphs(net, signed(props.net ?? 0), x, y + h + 24, 24);
    // El neto pedido, dibujado como el piso al que el ascensor tiene que llegar.
    addGlyphs(target, signed(s.board.target), x, y - 18, 22);
    return { box, split, net, target };
  }, [s.board, l.board, props.net]);

  const tokenGeom = useMemo(
    () => (s.board?.tokens ?? []).map((t) => tokenPath(t.value, l.tokenR)),
    [s.board, l.tokenR],
  );

  /**
   * Las paradas escritas. Donde el edificio se pide con un toque, los dos pisos
   * tienen que poder leerse sin él: si no, la pregunta no se podría contestar
   * con el edificio apagado.
   */
  const stops = useMemo(() => {
    const boxes = Skia.Path.Make();
    const ink = Skia.Path.Make();
    s.stops.forEach((f, i) => {
      const spot = l.stops[i];
      if (!spot) return;
      boxes.addRRect(Skia.RRectXY(Skia.XYWHRect(spot.x - 34, spot.y - 24, 68, 48), 9, 9));
      addGlyphs(ink, signed(f - zero), spot.x, spot.y, 24);
    });
    return { boxes, ink };
  }, [s.stops, l.stops, zero]);

  const boxPath = useMemo(() => {
    const p = Skia.Path.Make();
    if (s.box) {
      p.addRRect(
        Skia.RRectXY(Skia.XYWHRect(l.box.x - l.boxW / 2, l.box.y - l.boxH / 2, l.boxW, l.boxH), 12, 12),
      );
    }
    return p;
  }, [s.box, l.box, l.boxW, l.boxH]);

  const rowGeom = useMemo(() => {
    const shapes = Skia.Path.Make();
    const origin = Skia.Path.Make();
    const arrow = Skia.Path.Make();
    const steps = Skia.Path.Make();
    const dr = s.drawings;
    if (!dr) return { shapes, origin, arrow, steps };
    l.drawings.forEach((spot, i) => {
      const d = drawingPath(i, l.drawingR);
      d.transform([1, 0, spot.x, 0, 1, spot.y, 0, 0, 1]);
      shapes.addPath(d);
    });
    const o = l.drawings[dr.origin];
    if (o) origin.addCircle(o.x, o.y, l.drawingR * 1.25);
    // La ficha de dirección: una flecha y tantos íconos como pasos. Sin ningún
    // numeral, que es lo que el nivel prueba.
    const cx = l.width / 2;
    const cy = l.height * 0.3;
    arrow.moveTo(cx - 26 * dr.dir, cy);
    arrow.lineTo(cx + 26 * dr.dir, cy);
    arrow.moveTo(cx + 16 * dr.dir, cy - 8);
    arrow.lineTo(cx + 26 * dr.dir, cy);
    arrow.lineTo(cx + 16 * dr.dir, cy + 8);
    for (let i = 0; i < dr.steps; i++) {
      steps.addCircle(cx + (i - (dr.steps - 1) / 2) * 18, cy + 26, 5);
    }
    return { shapes, origin, arrow, steps };
  }, [s.drawings, l]);

  const tappedPath = useMemo(() => {
    const p = Skia.Path.Make();
    const spot = s.drawings ? l.drawings[tapped] : undefined;
    if (tapped >= 0 && spot) p.addCircle(spot.x, spot.y, l.drawingR * 1.45);
    return p;
  }, [s.drawings, tapped, l.drawings, l.drawingR]);

  // El giro de la manivela es la posición del caminante: un solo hecho. Lo único
  // que se le suma es el tope sin dientes, que gira sin llevar a nadie.
  const crankT = useDerivedValue(() => [
    { rotate: (props.pos.value + spin.value) * TOOTH_ANGLE + jam.value * 0.06 },
  ]);
  const crankGlow = useDerivedValue(() => 0.3 + 0.7 * props.hint.value);
  const looseT = useDerivedValue(() => [{ translateX: arrowDx.value }]);

  // El ascensor cuelga del mismo eje: su piso es la casilla del caminante, y esa
  // igualdad es la analogía entera.
  const carT = useDerivedValue(
    () => [
      { translateX: l.shaft.x },
      { translateY: l.shaft.bottom - (props.pos.value + 0.5) * l.shaft.floorH },
    ],
    [l.shaft],
  );
  const streetT = useDerivedValue(
    () => [{ translateY: (zero - street.value) * l.shaft.floorH }],
    [zero, l.shaft.floorH],
  );

  /**
   * La mano fantasma. Es la única instrucción que hay: hace el gesto que el
   * nivel pide y vuelve al principio. No dice nada porque no puede.
   */
  const ghostDot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, s.m.ghostR);
    return p;
  }, [s.m.ghostR]);
  const gFrom = ghost?.kind === "move" ? ghost.from : null;
  const gTo = ghost?.kind === "move" ? ghost.to : null;
  const gTeeth = ghost?.kind === "turn" ? ghost.teeth : 0;
  const gcx = l.crank.x;
  const gcy = l.crank.y;
  const gcr = l.crank.r * 0.62;
  const ghostT = useDerivedValue(() => {
    const t = ghostT01(props.demo.value);
    if (gFrom && gTo) {
      return [
        { translateX: gFrom.x + (gTo.x - gFrom.x) * t },
        { translateY: gFrom.y + (gTo.y - gFrom.y) * t },
      ];
    }
    // Sobre la manivela: tantos dientes de giro y vuelve a empezar.
    const a = -Math.PI / 2 + TOOTH_ANGLE * gTeeth * t;
    return [{ translateX: gcx + Math.cos(a) * gcr }, { translateY: gcy + Math.sin(a) * gcr }];
  }, [gFrom, gTo, gTeeth, gcx, gcy, gcr]);
  const sinMano = ghost === null;
  const ghostO = useDerivedValue(() =>
    sinMano ? 0 : props.hint.value * 0.5 * Math.sin(props.demo.value * Math.PI),
  );

  // Lo jugable se apaga entero mientras se comparan las dos animaciones: lo
  // único que hay que mirar es cuál de las dos miente.
  const jugable = useDerivedValue(() => (explaining ? 0 : 1), [explaining]);
  // El soporte del renglón vuelve como fantasma cuando el jugador lo pide.
  const conRenglon = s.line !== null;
  // Cuando las dos animaciones que se comparan viven en pistas aparte, el
  // soporte jugable se apaga; cuando son los recorridos de las pistas
  // principales, el soporte **es** la superficie de la comparación.
  const explainAparte = s.explain !== null && s.explain.kind !== "walks";
  const oculto = !s.showRail;
  const railO = useDerivedValue(
    () =>
      oculto ? 0
      : explaining && explainAparte ? 0
      : conRenglon ? ghostRail.value
      : 1,
    [oculto, explaining, explainAparte, conRenglon],
  );
  const retirado = s.building?.show === "onDemand" && props.pinned !== true;
  const edificioO = useDerivedValue(
    () => (explaining ? 0 : retirado ? reveal.value : 1),
    [explaining, retirado],
  );

  const explain = s.explain;
  const walks = explain?.kind === "walks" ? explain.walks : [];

  return (
    <Group opacity={props.appear}>
      {/* El soporte graduado con su caminante. Comparar recorridos monta dos y
          la diferencia entre los dos es toda la pregunta. */}
      <Group opacity={railO}>
        {l.rails.map((rail, i) => (
          <Group key={`rail${i}`}>
            <RailView
              geom={railGeoms[i] as RailGeom}
              mark={config.skin !== "stone"}
              outline={s.m.stoneOutline}
              flagPulse={s.flag?.pulse === true}
              hint={props.hint}
            />
            {/* La fila elegida al comparar: la que miente se marca, la otra se
                afirma. */}
            {explain?.kind === "walks" ? (
              <Path
                path={(railGeoms[i] as RailGeom).band}
                color={i === explain.liar ? theme.color.warn : theme.color.ok}
                style="stroke"
                strokeWidth={3}
                opacity={picked === i ? 1 : 0}
              />
            ) : null}
            {/* El caminante está siempre montado: que se vea o no es una
                decisión de la ronda, y desmontarlo cambiaría el árbol. */}
            <Walker
              walker={walker}
              rail={rail}
              pos={props.pos}
              lift={lift}
              facing={facing}
              clock={clock}
              walk={walks[i] ?? null}
              flag={s.facing}
              visible={s.walker}
            />
          </Group>
        ))}
        <Path path={marks.trail} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
        <Path path={marks.whole} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        <Group transform={looseT}>
          <Path path={loose} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
        </Group>
        <Path
          path={marks.arrows}
          color={theme.color.accent}
          style="stroke"
          strokeWidth={2.5}
          opacity={0.45}
        />
      </Group>

      {/* La tarjeta que se levanta para mirar el numeral sin caminar. */}
      <Group opacity={tapLift}>
        <Path path={peek.card} color={theme.color.surfaceHigh} />
        <Path path={peek.card} color={theme.color.accent} style="stroke" strokeWidth={STROKE} />
        <Path path={peek.digits} color={theme.color.ink} />
      </Group>

      {/* Las dos pistas de la explicación por llegada: el mismo viaje, contado
          de dos maneras. En una la ficha de llegada aparece al final; en la otra
          empuja al caminante, como si el doble trazo fuera un botón. */}
      {explain?.kind === "arrival"
        ? l.explainRails.map((rail, i) => (
            <Group key={`ex${i}`} opacity={explaining ? 1 : 0}>
              <RailView
                geom={explainGeoms[i] as RailGeom}
                mark={config.skin !== "stone"}
                outline={s.m.stoneOutline}
                flagPulse={s.flag?.pulse === true}
                hint={props.hint}
              />
              <ArrivalRow
                rail={rail}
                from={explain.from}
                to={explain.to}
                clock={clock}
                miente={i === explain.liar}
                elegida={picked === i}
                walker={walker}
              />
            </Group>
          ))
        : null}

      {/* Las dos vueltas dobles. En una el caminante termina mirando hacia
          adelante; en la otra sigue mirando hacia atrás y avanza al revés. */}
      {explain?.kind === "doubleTurn"
        ? l.rows.map((y, i) => (
            <DoubleTurn
              key={`turn${i}`}
              y={y}
              cx={l.width / 2}
              step={Math.min(l.rail.step, 60)}
              walker={walker}
              clock={clock}
              miente={i === explain.liar}
              elegida={picked === i}
              visible={explaining}
            />
          ))
        : null}

      {/* El renglón. */}
      {s.line ? (
        <Group opacity={explaining ? 0 : 1}>
          <Path path={row.boxes} color={theme.color.surfaceHigh} />
          <Path path={row.boxes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={row.slot} color={theme.color.accent} style="stroke" strokeWidth={2} />
          <Path path={row.signs} color={theme.color.ink} />
          <Path path={filledSlot} color={theme.color.ok} />
        </Group>
      ) : null}

      {/* El libro de cuentas: una fila por tramo y el total abajo. */}
      {s.ledger ? (
        <Group opacity={explaining ? 0 : 1}>
          <Path path={ledger.box} color={theme.color.surface} />
          <Path path={ledger.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={ledger.rule} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={ledger.rows} color={theme.color.ink} style="stroke" strokeWidth={2} />
        </Group>
      ) : null}

      {/* El edificio en corte. Donde se pide con un toque vuelve a apagarse: la
          analogía se retira sin desaparecer. */}
      {s.building ? (
        <Group opacity={edificioO}>
          <Path path={shaft.walls} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={shaft.windows} color={theme.color.inkFaint} />
          <Path path={shaft.garage} color={theme.color.warn} style="stroke" strokeWidth={2} />
          <Path path={shaft.numerals} color={theme.color.inkDim} />
          <Path path={shaft.mark} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
          <Group transform={streetT}>
            <Path path={shaft.street} color={theme.color.ok} style="stroke" strokeWidth={3} />
          </Group>
          {s.building.car ? (
            <Group transform={carT}>
              <Path path={car} color={theme.color.accent} style="stroke" strokeWidth={2} />
            </Group>
          ) : null}
          <FloorMarks layout={l} floors={s.building.marks} hint={props.hint} />
        </Group>
      ) : null}

      {/* El tablero de monedas y vales. Lo que queda sin pareja es el neto, y el
          ascensor lo sigue. */}
      {s.board ? (
        <Group>
          <Path path={board.box} color={theme.color.surface} />
          <Path path={board.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={board.split} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Path path={board.target} color={theme.color.warn} />
          <Path
            path={board.net}
            color={(props.net ?? 0) === s.board.target ? theme.color.ok : theme.color.ink}
          />
          {tokenGeom.map((p, i) => (
            <TokenItem
              key={`tok${i}`}
              path={p}
              spot={l.tokens[i] ?? { x: 0, y: 0 }}
              value={s.board?.tokens[i]?.value ?? 0}
              view={tokens[i]}
              cancelled={(props.cancelled ?? [])[i] === true}
            />
          ))}
        </Group>
      ) : null}

      {/* La caja marcada: adonde va la ficha que contesta. */}
      {s.box ? (
        <Path
          path={boxPath}
          color={answered >= 0 ? theme.color.ok : theme.color.accent}
          style="stroke"
          strokeWidth={2}
        />
      ) : null}

      {/* Las paradas escritas, para cuando el edificio está apagado. */}
      <Group>
        <Path path={stops.boxes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
        <Path path={stops.ink} color={theme.color.ink} />
      </Group>

      {/* La fila de dibujos con su origen marcado y la ficha de dirección. */}
      {s.drawings ? (
        <Group>
          <Path path={rowGeom.shapes} color={theme.color.inkDim} />
          <Path path={rowGeom.origin} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
          <Path path={rowGeom.arrow} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
          <Path path={rowGeom.steps} color={theme.color.warn} />
          <Path path={tappedPath} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
        </Group>
      ) : null}

      {/* La manivela con su tope. Su giro es la posición del caminante. */}
      {s.crank ? (
        <Group
          transform={[{ translateX: l.crank.x }, { translateY: l.crank.y }]}
          opacity={s.line ? 0 : jugable}
        >
          <Path path={crank.body} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
          <Group transform={crankT}>
            {/* Los dientes del tope giran con la rueda: arrancan en la manija,
                que es donde el caminante está parado ahora. */}
            <Path path={stopGeom} color={theme.color.warn} style="stroke" strokeWidth={s.m.stopWidth} />
            <Path path={crank.teeth} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
            <Group opacity={crankGlow}>
              <Path path={crank.handle} color={theme.color.accent} style="stroke" strokeWidth={2.5} />
            </Group>
          </Group>
        </Group>
      ) : null}

      {/* El cajón de fichas. Siempre montadas: las que sobran, invisibles.
          Mientras se compara no hay nada que elegir del cajón. */}
      <Group opacity={jugable}>
        {chipGeom.map((g, i) => (
          <ChipItem key={`chip${i}`} geom={g} view={chips[i]} />
        ))}
      </Group>

      <Group transform={ghostT} opacity={ghostO}>
        <Path path={ghostDot} color={theme.color.ink} style="stroke" strokeWidth={2} />
      </Group>
    </Group>
  );
}

/** El soporte dibujado: agua, casillas, tarjetas, huecos y bandera. */
function RailView({
  geom,
  mark,
  outline,
  flagPulse,
  hint,
}: {
  readonly geom: RailGeom;
  readonly mark: boolean;
  readonly outline: boolean;
  readonly flagPulse: boolean;
  readonly hint: SharedValue<number>;
}) {
  const haloO = useDerivedValue(() => 0.45 + 0.55 * hint.value);
  const flagO = useDerivedValue(() => (flagPulse ? 0.5 + 0.5 * hint.value : 1), [flagPulse]);
  return (
    <>
      <Path
        path={geom.band}
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
      {outline && !mark ? (
        <Path path={geom.stones} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />
      ) : null}
      <Path path={geom.cards} color={theme.color.surface} />
      <Path path={geom.cards} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.numerals} color={theme.color.ink} />
      <Path path={geom.zeroDot} color={theme.color.ink} />
      <Group opacity={hint}>
        <Path path={geom.holes} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={geom.holes} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Group opacity={haloO}>
        <Path path={geom.flagStone} color={theme.color.ok} style="stroke" strokeWidth={2} />
      </Group>
      <Group opacity={flagO}>
        <Path path={geom.flag} color={theme.color.ok} style="stroke" strokeWidth={2} />
      </Group>
    </>
  );
}

/**
 * El caminante sobre un soporte. Su posición no vuelve nunca al hilo de JS: o la
 * manda el gesto, o la lee el reloj de un recorrido dibujado.
 */
function Walker({
  walker,
  rail,
  pos,
  lift,
  facing,
  clock,
  walk,
  flag,
  visible,
}: {
  readonly walker: { body: SkPath; head: SkPath; flag: SkPath };
  readonly rail: Rail;
  readonly pos: SharedValue<number>;
  readonly lift: SharedValue<number>;
  readonly facing: SharedValue<number>;
  readonly clock: SharedValue<number>;
  /** Las posiciones acumuladas de un recorrido dibujado, o `null` si manda el gesto. */
  readonly walk: readonly number[] | null;
  readonly flag: boolean;
  readonly visible: boolean;
}) {
  const ox = rail.origin.x;
  const oy = rail.origin.y;
  const dx = rail.dx;
  const dy = rail.dy;
  const guiado = walk !== null && walk.length > 1;
  const steps = useMemo(() => (walk ?? []).slice(), [walk]);

  const transform = useDerivedValue(() => {
    if (!guiado) {
      return [
        { translateX: ox + dx * pos.value },
        { translateY: oy + dy * pos.value - 34 * lift.value },
      ];
    }
    const t = Math.min(0.9999, Math.max(0, clock.value)) * (steps.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    const a = steps[i] ?? 0;
    const b = steps[i + 1] ?? a;
    const eased = f * f * (3 - 2 * f);
    const u = a + (b - a) * eased;
    const hop = Math.sin(f * Math.PI) * HOP;
    // Caer entre dos casillas es hundirse: el agua no sostiene a nadie.
    const off = Math.abs(u - Math.round(u));
    const sink = Math.min(1, off * 4) * 11 * (1 - Math.sin(f * Math.PI));
    return [{ translateX: ox + dx * u }, { translateY: oy + dy * u - hop + sink }];
  }, [guiado, steps, ox, oy, dx, dy]);

  const flagT = useDerivedValue(() => [{ scaleX: facing.value }]);

  return (
    <Group transform={transform} opacity={visible ? 1 : 0}>
      <Path
        path={walker.body}
        color={theme.color.accent}
        style="stroke"
        strokeWidth={2.5}
        strokeCap="round"
      />
      <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
      {flag ? (
        <Group transform={flagT}>
          <Path path={walker.flag} color={theme.color.warn} />
        </Group>
      ) : null}
    </Group>
  );
}

/**
 * Una de las dos animaciones de la explicación por llegada. La que miente pone
 * la ficha de llegada primero y el caminante la sigue: la llegada como botón de
 * hacer. La honesta camina y la ficha aparece cuando el paso termina.
 */
function ArrivalRow({
  rail,
  from,
  to,
  clock,
  miente,
  elegida,
  walker,
}: {
  readonly rail: Rail;
  readonly from: number;
  readonly to: number;
  readonly clock: SharedValue<number>;
  readonly miente: boolean;
  readonly elegida: boolean;
  readonly walker: { body: SkPath; head: SkPath; flag: SkPath };
}) {
  const chip = useMemo(() => {
    const p = Skia.Path.Make();
    const s = rail.stones[to];
    if (!s) return p;
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 20, s.y - 76, 40, 40), 8, 8));
    addGlyphs(p, String(to), s.x, s.y - 56, 20);
    return p;
  }, [rail, to]);

  // La ficha de la que miente entra antes de que el caminante se mueva; la de la
  // honesta, cuando el viaje ya terminó.
  const chipO = useDerivedValue(() => {
    const t = clock.value;
    return miente ? Math.min(1, t / 0.18) : t < 0.82 ? 0 : Math.min(1, (t - 0.82) / 0.12);
  }, [miente]);

  const delay = miente ? 0.22 : 0;
  const ox = rail.origin.x;
  const oy = rail.origin.y;
  const dx = rail.dx;
  const transform = useDerivedValue(() => {
    const t = Math.max(0, Math.min(1, (clock.value - delay) / Math.max(0.05, 1 - delay)));
    const eased = t * t * (3 - 2 * t);
    return [{ translateX: ox + dx * (from + (to - from) * eased) }, { translateY: oy }];
  }, [delay, ox, oy, dx, from, to]);

  const dim = useDerivedValue(() => (elegida ? 1 : 0), [elegida]);
  const halo = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(rail.from.x, rail.y);
    p.lineTo(rail.to.x, rail.y);
    return p;
  }, [rail]);

  return (
    <>
      <Path path={chip} color={theme.color.warn} style="stroke" strokeWidth={2} opacity={chipO} />
      <Group transform={transform}>
        <Path
          path={walker.body}
          color={theme.color.accent}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
        />
        <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={halo} color={theme.color.accent} style="stroke" strokeWidth={3} opacity={dim} />
    </>
  );
}

/**
 * Una de las dos vueltas dobles. Las dos salen del cero mirando a la derecha y
 * giran dos veces; la honesta termina mirando hacia adelante, la que miente
 * sigue mirando hacia atrás y por eso avanza al revés.
 */
function DoubleTurn({
  y,
  cx,
  step,
  walker,
  clock,
  miente,
  elegida,
  visible,
}: {
  readonly y: number;
  readonly cx: number;
  readonly step: number;
  readonly walker: { body: SkPath; head: SkPath; flag: SkPath };
  readonly clock: SharedValue<number>;
  readonly miente: boolean;
  readonly elegida: boolean;
  readonly visible: boolean;
}) {
  const line = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(cx - step * 3.4, y);
    p.lineTo(cx + step * 3.4, y);
    for (let i = -3; i <= 3; i++) {
      p.moveTo(cx + i * step, y - 8);
      p.lineTo(cx + i * step, y + 8);
    }
    return p;
  }, [cx, step, y]);
  const zeroDot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, y, 6);
    return p;
  }, [cx, y]);

  // Tres tiempos: gira, gira otra vez, camina. Lo único que separa las dos
  // animaciones es hacia dónde mira el caminante en el tercero.
  const mira = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, clock.value));
    if (c < 0.28) return 1;
    if (c < 0.52) return -1;
    return miente ? -1 : 1;
  }, [miente]);
  const avance = useDerivedValue(() => {
    const c = Math.max(0, Math.min(1, clock.value));
    return c < 0.52 ? 0 : Math.min(1, (c - 0.52) / 0.4);
  });

  const transform = useDerivedValue(
    () => [{ translateX: cx + step * 2.6 * avance.value * mira.value }, { translateY: y }],
    [cx, step, y],
  );
  const flagT = useDerivedValue(() => [{ scaleX: mira.value }]);
  const halo = useDerivedValue(() => (elegida ? 1 : 0), [elegida]);
  const o = useDerivedValue(() => (visible ? 1 : 0), [visible]);

  return (
    <Group opacity={o}>
      <Path path={line} color={theme.color.inkDim} style="stroke" strokeWidth={2} />
      <Path path={zeroDot} color={theme.color.ink} />
      <Group transform={transform}>
        <Path
          path={walker.body}
          color={theme.color.accent}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
        />
        <Path path={walker.head} color={theme.color.accent} style="stroke" strokeWidth={2} />
        <Group transform={flagT}>
          <Path path={walker.flag} color={theme.color.warn} />
        </Group>
      </Group>
      <Group opacity={halo}>
        <Path path={line} color={theme.color.accent} style="stroke" strokeWidth={3} />
      </Group>
    </Group>
  );
}

/** Las paradas dibujadas sobre el edificio: de eso se habla al comparar. */
function FloorMarks({
  layout: l,
  floors,
  hint,
}: {
  readonly layout: TrackLayout;
  readonly floors: readonly number[];
  readonly hint: SharedValue<number>;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    for (const f of floors) {
      const y = l.shaft.bottom - (f + 0.5) * l.shaft.floorH;
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(l.shaft.x - l.shaft.w / 2, y - l.shaft.floorH / 2, l.shaft.w, l.shaft.floorH),
          3,
          3,
        ),
      );
    }
    return p;
  }, [l, floors]);
  const pulse = useDerivedValue(() => 0.5 + 0.5 * hint.value);
  return (
    <Group opacity={pulse}>
      <Path path={path} color={theme.color.accent} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/**
 * Una ficha del cajón. Su dibujo sigue al mismo par de valores que el gesto, así
 * que la ficha que se ve y la que el dedo arrastra son la misma.
 */
function ChipItem({
  geom,
  view,
}: {
  readonly geom: { box: SkPath; ink: SkPath; spot: Spot };
  readonly view: DragView | undefined;
}) {
  const zero = useSharedValue(0);
  const dx = view?.dx ?? zero;
  const dy = view?.dy ?? zero;
  const alive = view?.alive ?? zero;
  const transform = useDerivedValue(
    () => [{ translateX: geom.spot.x + dx.value }, { translateY: geom.spot.y + dy.value }],
    [geom.spot],
  );
  return (
    <Group transform={transform} opacity={alive}>
      <Path path={geom.box} color={theme.color.surfaceHigh} />
      <Path path={geom.box} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={geom.ink} color={theme.color.ink} />
    </Group>
  );
}

/**
 * Una moneda o un vale. La moneda es un disco lleno y el vale un rectángulo
 * hueco: se distinguen por forma, que es lo que pide jugar sin leer. Al
 * cancelarse contra su par quedan un hueco transparente y nada más.
 */
function TokenItem({
  path,
  spot,
  value,
  view,
  cancelled,
}: {
  readonly path: SkPath;
  readonly spot: Spot;
  readonly value: number;
  readonly view: DragView | undefined;
  readonly cancelled: boolean;
}) {
  const zero = useSharedValue(0);
  const dx = view?.dx ?? zero;
  const dy = view?.dy ?? zero;
  const alive = view?.alive ?? zero;
  const transform = useDerivedValue(
    () => [{ translateX: spot.x + dx.value }, { translateY: spot.y + dy.value }],
    [spot],
  );
  const o = useDerivedValue(
    () => (cancelled ? 0.18 * alive.value : alive.value),
    [cancelled],
  );
  return (
    <Group transform={transform} opacity={o}>
      <Path
        path={path}
        color={value >= 0 ? theme.color.accent : theme.color.warn}
        style={value >= 0 ? "fill" : "stroke"}
        strokeWidth={2}
      />
    </Group>
  );
}
