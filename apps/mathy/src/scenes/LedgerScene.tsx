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
 *    opacidad cero.
 * 2. Lo que se repite y no se anima de a uno va en un solo `SkPath`: los
 *    renglones del libro, los conteos, las aristas del árbol y el mostrador son
 *    un trazo cada uno. Solo los objetos, que se mueven sueltos, tienen
 *    componente.
 * 3. Nada vuelve al hilo de JavaScript por cuadro: la posición de un objeto se
 *    deriva de su destino más el desplazamiento del dedo, los dos en valores
 *    compartidos. El destino cambia cuando el jugador suelta, no por cuadro.
 *
 * Nada de texto: los conteos y las letras son contornos del atlas de glifos.
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
import { theme } from "../ui/theme.ts";

const STROKE = 1.5;

/**
 * El color de una clase. El cajón cerrado es siempre el mismo, porque es la
 * incógnita y tiene que reconocerse de un vistazo en cualquier nivel; las
 * clases abiertas se reparten los otros tres.
 */
const KIND_COLORS = [theme.color.inkDim, theme.color.ok, theme.color.ink] as const;

export const colorOfKind = (kind: LedgerKind | undefined, index: number): string =>
  kind?.closed === true
    ? theme.color.accent
    : ((KIND_COLORS[index % KIND_COLORS.length] ?? theme.color.inkDim) as string);

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
  // La balanza se lleva el costado derecho y el árbol el izquierdo. Los dos no
  // aparecen juntos en ningún nivel, así que el libro nunca queda apretado
  // entre las dos cosas.
  const disponible0 = hayArbol ? width * 0.36 : width * 0.06;
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
  const tray: LedgerBox = { x: width * 0.06, y: trayY - 26, w: width * 0.88, h: 52 };
  // Los objetos que hay se reparten el mostrador centrados. Las ranuras que
  // sobran quedan montadas donde termina la fila, con opacidad cero.
  const cuantos = Math.max(1, config.tokens.length);
  const paso = Math.min(tray.w / cuantos, unit * 3.6);
  const tokens: LedgerSpot[] = Array.from({ length: tokenSlots }, (_, i) => ({
    x: width / 2 + (Math.min(i, cuantos - 1) - (cuantos - 1) / 2) * paso,
    y: trayY,
  }));

  const balance: LedgerBox = config.balance
    ? { x: width * 0.47, y: 0, w: width * 0.51, h: height * 0.84 }
    : { x: 0, y: 0, w: 0, h: 0 };

  return {
    width,
    height,
    rows,
    slotW,
    tray,
    tokens,
    balance,
    ...treeSpots(config.tree, width * 0.32, top, height * 0.5),
    unit,
  };
}

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
 * La piel del objeto. Un solo trazo por objeto: el presupuesto manda. Las tres
 * primeras son fruta, `crate` es el cajón cerrado y las últimas son las figuras
 * inventadas del último nivel, que no se parecen a nada que el jugador conozca
 * y por eso solo se pueden agrupar por identidad.
 */
function shapePath(shape: string, r: number): SkPath {
  const p = Skia.Path.Make();
  if (shape === "crate") {
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(-r * 1.1, -r * 0.95, r * 2.2, r * 1.9), 3, 3));
    p.moveTo(-r * 1.1, -r * 0.45);
    p.lineTo(r * 1.1, -r * 0.45);
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
    p.addCircle(0, 0, r);
    p.addCircle(0, 0, r * 0.45);
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
  p.addRRect(
    Skia.RRectXY(Skia.XYWHRect(-r * 0.1, -r * 1.4, r * 0.2, r * 0.6), r * 0.1, r * 0.1),
  );
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

/** El mostrador donde esperan los objetos sueltos. */
function trayPath(l: LedgerLayout): SkPath {
  const p = Skia.Path.Make();
  p.moveTo(l.tray.x, l.tray.y + l.tray.h);
  p.lineTo(l.tray.x + l.tray.w, l.tray.y + l.tray.h);
  return p;
}

const handPath = (): SkPath => {
  const p = Skia.Path.Make();
  p.addCircle(0, 0, 13);
  return p;
};

// --- Componente --------------------------------------------------------------

export interface LedgerSceneProps {
  readonly config: LedgerConfig;
  readonly layout: LedgerLayout;
  /** Un lugar por ranura de objeto. Cambia cuando el jugador suelta, no por cuadro. */
  readonly places: readonly LedgerPlace[];
  /** Sube de a uno por ronda: le dice a la escena que no interpole el salto. */
  readonly round: number;
  /** El objeto que el jugador acaba de soltar: va a su destino sin interpolar. */
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
  /** La fila que devolvió algo recién, para el rebote. O -1. */
  readonly bounced: number;
  readonly appear: SharedValue<number>;
}

export function LedgerScene(props: LedgerSceneProps) {
  const { config, layout: l } = props;
  const book = useMemo(() => bookPath(l, config.rows), [l, config.rows]);
  const tray = useMemo(() => trayPath(l), [l]);
  const hand = useMemo(handPath, []);

  const demoO = useDerivedValue(() => props.demo.value * (1 - Math.min(1, props.replay.value)));
  const demoT = useDerivedValue(() => {
    // La mano lleva el primer objeto del mostrador a la primera fila, en línea
    // recta. Es toda la instrucción del juego, y no dice una palabra.
    const from = l.tokens[0] ?? { x: l.width / 2, y: l.tray.y };
    const to = l.rows[0] ?? { x: l.width / 2, y: l.height / 2, w: 0, h: 0 };
    const k = props.demo.value;
    return [
      { translateX: from.x + (to.x + 30 - from.x) * k },
      { translateY: from.y + (to.y + to.h / 2 - from.y) * k },
    ];
  }, [l]);

  return (
    <Group opacity={props.appear}>
      <Path path={book} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={tray} color={theme.color.inkFaint} style="stroke" strokeWidth={STROKE} />

      {l.rows.map((box, i) => (
        <RowView
          key={`row${i}`}
          index={i}
          box={box}
          layout={l}
          config={config}
          owner={config.owner[i] ?? -1}
          count={config.counts[i] ?? 0}
          bounced={props.bounced === i}
          pulse={props.pulse}
          replay={props.replay}
          replayRows={props.replayRows}
        />
      ))}

      {config.tree.length > 0 ? (
        <TreeView config={config} layout={l} pulse={props.pulse} />
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
          instant={props.snap === i}
          dragIdx={props.dragIdx}
          dragX={props.dragX}
          dragY={props.dragY}
        />
      ))}

      <Group opacity={demoO} transform={demoT}>
        <Path path={hand} color={theme.color.ink} style="stroke" strokeWidth={2} />
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
 * un solo trazo. Los que se mueven son los del mostrador, y esos sí lo son.
 */
function RowView({
  index,
  box,
  layout: l,
  config,
  owner,
  count,
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
  readonly bounced: boolean;
  readonly pulse: SharedValue<number>;
  readonly replay: SharedValue<number>;
  readonly replayRows: readonly [number, number];
}) {
  const kind = owner >= 0 ? config.kinds[owner] : undefined;
  const visible = index < config.rows;

  const cuerpo = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind) return p;
    const cy = box.y + box.h / 2;
    const x0 = box.x + frente(config.skin, kind);
    if (config.skin === "objects") {
      // Los objetos anotados, uno por casilla. La fila los dibuja de una sola
      // vez: no se animan de a uno, así que no son componentes.
      for (let i = 0; i < count; i++) {
        const cx = x0 + (i + 0.5) * l.slotW;
        const s = shapePath(kind.shape, l.unit);
        s.transform([1, 0, cx, 0, 1, cy, 0, 0, 1]);
        p.addPath(s);
        // La marca va en cada tapa y no solo en la cabecera: lo que hace que
        // dos cajones sean el mismo objeto es la marca, y tiene que verse.
        if (kind.closed && kind.mark >= 0) {
          const m = markPath(kind.mark, l.unit);
          m.transform([1, 0, cx, 0, 1, cy + l.unit * 0.25, 0, 0, 1]);
          p.addPath(m);
        }
      }
      return p;
    }
    // La barra segmentada: un segmento por objeto, y el cajón con el borde
    // punteado y el largo sin fijar.
    const h = Math.min(16, box.h * 0.5);
    for (let i = 0; i < count; i++) {
      const x = x0 + i * (l.slotW - 3);
      if (kind.closed) {
        dashedRect(p, x, cy - h / 2, l.slotW - 7, h, 3.4);
      } else {
        p.addRRect(Skia.RRectXY(Skia.XYWHRect(x, cy - h / 2, l.slotW - 7, h), 3, 3));
      }
    }
    return p;
  }, [kind, count, box, l.unit, l.slotW, config.skin]);

  /**
   * El conteo. En `concrete` cierra la fila; desde `visual` pasa adelante, que
   * es el paso `tally` de la mecánica y lo que después se lee como coeficiente.
   */
  const conteo = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind || count <= 0) return p;
    const cy = box.y + box.h / 2;
    // En `concrete` el conteo cierra la fila; desde `visual` pasa adelante, que
    // es el paso `tally` y lo que después se lee como coeficiente. Adelante
    // quiere decir adentro de la fila, no encima de la cabecera.
    const x = config.skin === "objects" ? box.x + box.w - 18 : box.x + 16;
    addGlyphs(p, String(count), x, cy, 20);
    return p;
  }, [kind, count, box, config.skin]);

  /**
   * La letra. Llega como morph de la marca y por eso queda pegada al conteo:
   * `3x` es la fila entera dicha en dos glifos, y el `3` hereda la identidad
   * del conteo y no de un signo de multiplicar que nunca hubo.
   */
  const letra = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind || config.skin !== "chips") return p;
    const cy = box.y + box.h / 2;
    if (kind.closed && kind.letter) addGlyphs(p, kind.letter, box.x + 38, cy, 22);
    return p;
  }, [kind, box, config.skin]);

  /** La cabecera de la fila: qué clase la ocupa, dibujada y no escrita. */
  const badge = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind) return p;
    const cy = box.y + box.h / 2;
    const cx = box.x - 26;
    const s = shapePath(kind.shape, l.unit * 1.15);
    s.transform([1, 0, cx, 0, 1, cy, 0, 0, 1]);
    p.addPath(s);
    if (kind.closed && kind.mark >= 0) {
      const m = markPath(kind.mark, l.unit * 1.15);
      m.transform([1, 0, cx, 0, 1, cy + l.unit * 0.28, 0, 0, 1]);
      p.addPath(m);
    }
    return p;
  }, [kind, box, l.unit]);

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
  const vacia = useDerivedValue(() => (dueno.value < 0 ? 0.2 + 0.35 * pulse.value : 0));

  // La repetición junta las dos filas y las separa: el error se ve, no se lee.
  const alto = box.h * 0.42;
  const t = useDerivedValue(() => [{ translateY: rumbo.value * replay.value * alto }]);
  // En el contacto las cajas vuelven a mostrar su dibujo: la letra se apaga y
  // la marca aparece, que es exactamente lo que el catálogo pide ver.
  const marcaO = useDerivedValue(() => (rumbo.value === 0 ? 0 : replay.value));
  const letraO = useDerivedValue(() => (rumbo.value === 0 ? 1 : 1 - replay.value));

  const rebote = useSharedValue(0);
  useEffect(() => {
    if (!bounced) return;
    rebote.value = withTiming(1, { duration: 110 }, () => {
      rebote.value = withTiming(0, { duration: 220 });
    });
  }, [bounced, rebote]);
  const reboteT = useDerivedValue(() => [{ translateX: rebote.value * 7 }]);

  const marco = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRRect(Skia.RRectXY(Skia.XYWHRect(box.x, box.y, box.w, box.h), 6, 6));
    return p;
  }, [box]);

  if (!visible) return null;

  return (
    <Group transform={t}>
      <Group opacity={vacia}>
        <Path path={marco} color={theme.color.accent} style="stroke" strokeWidth={1.5} />
      </Group>
      <Group transform={reboteT}>
        <Group opacity={letraO}>
          <Path
            path={cuerpo}
            color={colorOfKind(kind, owner)}
            style={kind?.closed ? "stroke" : "fill"}
            strokeWidth={1.6}
          />
          <Path path={letra} color={theme.color.accent} />
        </Group>
        <Group opacity={marcaO}>
          <Path path={badge} color={theme.color.warn} style="stroke" strokeWidth={2} />
        </Group>
        {/* Desde `symbolic` la caja cede su lugar al nombre: la cabecera del
            cajón se retira y queda la letra. Vuelve sola en la repetición del
            error, que es cuando hace falta ver que las marcas no son la misma. */}
        <Path
          path={badge}
          color={colorOfKind(kind, owner)}
          style="stroke"
          strokeWidth={1.6}
          opacity={config.skin === "chips" && kind?.shape === "crate" ? 0 : 1}
        />
        <Path path={conteo} color={theme.color.ink} />
      </Group>
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
  pulse,
}: {
  readonly config: LedgerConfig;
  readonly layout: LedgerLayout;
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

  const cuerpos = useMemo(() => {
    const p = Skia.Path.Make();
    for (let i = 0; i < config.tree.length; i++) {
      const n = config.tree[i] as LedgerTreeNode;
      const s = l.nodes[i];
      if (!s) continue;
      if (n.op !== null) {
        p.addCircle(s.x, s.y, r * 0.78);
        addGlyphs(p, n.op === "×" ? "×" : "+", s.x, s.y, r * 1.05);
        continue;
      }
      if (n.unknown) continue;
      // Una hoja conocida es un cofre chico con su número: el distractor del
      // diseño no es un número al azar, es una hoja que ya tiene valor.
      p.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - r, s.y - r * 0.8, r * 2, r * 1.6), 4, 4));
      addGlyphs(p, String(n.value ?? 0), s.x, s.y, r * 1.05);
    }
    return p;
  }, [config.tree, l.nodes, r]);

  /** La hoja vacía: borde punteado mientras late, cajón cerrado cuando se llena. */
  const hueco = useMemo(() => {
    const p = Skia.Path.Make();
    const i = config.tree.findIndex((n) => n.unknown);
    const s = i >= 0 ? l.nodes[i] : undefined;
    if (!s) return p;
    dashedRect(p, s.x - r, s.y - r * 0.8, r * 2, r * 1.6, 3.4);
    return p;
  }, [config.tree, l.nodes, r]);

  const lleno = useMemo(() => {
    const p = Skia.Path.Make();
    const i = config.tree.findIndex((n) => n.unknown);
    const s = i >= 0 ? l.nodes[i] : undefined;
    const kind = config.leaf >= 0 ? config.kinds[config.leaf] : undefined;
    if (!s || !kind) return p;
    const forma = shapePath(kind.shape, r * 0.8);
    forma.transform([1, 0, s.x, 0, 1, s.y, 0, 0, 1]);
    p.addPath(forma);
    if (kind.mark >= 0) {
      const m = markPath(kind.mark, r * 0.8);
      m.transform([1, 0, s.x, 0, 1, s.y + r * 0.2, 0, 0, 1]);
      p.addPath(m);
    }
    return p;
  }, [config.tree, config.kinds, config.leaf, l.nodes, r]);

  // La hoja llena deja de latir. La decisión viaja en un valor compartido y no
  // en el cierre del render, que es donde se pierde.
  const llena = useSharedValue(config.leaf >= 0 ? 1 : 0);
  useEffect(() => {
    llena.value = config.leaf >= 0 ? 1 : 0;
  }, [config.leaf, llena]);
  const late = useDerivedValue(() => (llena.value > 0 ? 0 : 0.35 + 0.65 * pulse.value));

  return (
    <Group>
      <Path path={aristas} color={theme.color.line} style="stroke" strokeWidth={STROKE} />
      <Path path={cuerpos} color={theme.color.inkDim} style="stroke" strokeWidth={1.6} />
      <Group opacity={late}>
        <Path path={hueco} color={theme.color.accent} style="stroke" strokeWidth={2} />
      </Group>
      <Path path={lleno} color={theme.color.accent} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/**
 * Un objeto suelto. Su destino cambia solo cuando el jugador suelta; mientras
 * el dedo se mueve, la posición sale del valor compartido y nada vuelve al hilo
 * de JavaScript.
 */
function TokenView({
  index,
  kind,
  kindIndex,
  layout: l,
  skin,
  place,
  round,
  instant,
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
  readonly instant: boolean;
  readonly dragIdx: SharedValue<number>;
  readonly dragX: SharedValue<number>;
  readonly dragY: SharedValue<number>;
}) {
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    if (!kind) return p;
    // Desde `symbolic` el cajón suelto ya es su ficha: la letra ocupó el lugar
    // del dibujo, que es la analogía retirándose. Una figura inventada no: esa
    // se sigue viendo y lo que recibe nombre es la fila, no el objeto.
    if (skin === "chips" && kind.closed && kind.letter && kind.shape === "crate") {
      addGlyphs(p, kind.letter, 0, 0, l.unit * 2.4);
      return p;
    }
    p.addPath(shapePath(kind.shape, l.unit));
    if (kind.closed && kind.mark >= 0) {
      const m = markPath(kind.mark, l.unit);
      m.transform([1, 0, 0, 0, 1, l.unit * 0.25, 0, 0, 1]);
      p.addPath(m);
    }
    return p;
  }, [kind, l.unit, skin]);

  // El contorno de un glifo se rellena; un cajón cerrado se traza. La fruta se
  // rellena, que es lo que la distingue de la caja sin decir una palabra.
  const esLetra =
    skin === "chips" && kind?.closed === true && kind.letter !== "" && kind.shape === "crate";
  const relleno = esLetra || kind?.closed !== true;
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
      { scale: llevado ? 1.35 : 1 },
    ];
  }, [index]);

  if (!kind) return null;

  return (
    <Group transform={transform} opacity={ao}>
      <Path
        path={path}
        color={colorOfKind(kind, kindIndex)}
        style={relleno ? "fill" : "stroke"}
        strokeWidth={1.8}
      />
    </Group>
  );
}
