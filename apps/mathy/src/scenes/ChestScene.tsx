/**
 * El cofre y el llavero: la mecánica `chest_key` como escena propia.
 *
 * La pista del nodo anterior con el caminante en la piedra donde cayó y la
 * flecha de ida todavía dibujada. En la piedra de partida quedó un cofre
 * cerrado; abajo, la manivela y un llavero. La cerradura tiene la forma del
 * tramo de ida y la llave, la del tramo de vuelta: el cofre abre solo si son la
 * misma. Ese "solo si" no es una comprobación del código, es la geometría de la
 * escena, y es todo el contenido del nodo.
 *
 * ADVERTENCIA: hoy hay un segundo cofre en el proyecto, dentro de
 * `BalanceScene.tsx`, que es del nodo 13. Son la misma mecánica dibujada dos
 * veces y hay que unificarlas; esta escena no toca aquella.
 *
 * Las tres reglas del proyecto gobiernan el archivo:
 *
 * 1. Modo retained. El árbol se arma por problema y no cambia durante la
 *    animación: las llaves y las fichas están siempre montadas, las que sobran
 *    con opacidad cero.
 * 2. Todo lo que se repite vive en un solo `SkPath`. Las piedras, los dientes y
 *    los numerales son un trazo cada grupo, así que la escena entera usa unos
 *    treinta de los trescientos elementos animados del presupuesto.
 * 3. Nada vuelve al hilo de JavaScript por cuadro. La posición del caminante, el
 *    giro de la manivela y el estirado de la regla se derivan de `SharedValue`.
 *
 * Las flechas se redibujan cuando el caminante se detiene, no cuadro a cuadro:
 * la vuelta es de un tirón, así que entre dos tirones el trazo no cambia.
 *
 * Nada de texto: los numerales y el `−` son contornos del atlas de glifos.
 *
 * El estilo es el del nodo 1 (`BowlScene.tsx`): los objetos tienen cuerpo. El
 * cofre es de madera con degradado, sombra en el piso y una placa de metal
 * donde se leen los dientes de la cerradura; las llaves son de acero sobre la
 * ficha neutra de las bandejas (`ChipBodies`); la manivela es una rueda de
 * metal. El color tiene trabajo y nada más: el caminante y su vuelta son del
 * equipo (`accent`), lo que coincide es menta (`ok`), lo que pide que lo miren
 * es ámbar (`warn`) y la guía es dorada. Las cerraduras y los signos, que antes
 * eran ámbar sin pedir nada, pasaron a tinta sobre metal.
 *
 * El jugo: una pieza que el dedo lleva crece un 30 % y, al llegar a su casa o a
 * la cerradura, rebota una vez. Y el evento que el nodo enseña —la vuelta
 * deshizo la ida y el cofre abre— responde una sola vez en la cerradura que lo
 * causó: un halo menta y seis chispas menta y oro que se abren y se apagan. Las
 * chispas están montadas desde el principio con opacidad cero (modo retained) y
 * su reloj corre en el hilo de la interfaz (`useAnimatedReaction`), sin volver
 * a JavaScript.
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
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type DerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import { TEETH_PER_TURN, type Layer } from "@mathy/mechanics";
import { ChipBodies } from "../ui/ChipBodies.tsx";
import { play, type Sfx } from "../ui/sound.ts";
import { theme } from "../ui/theme.ts";

// --- Materiales --------------------------------------------------------------

/**
 * La madera del cofre: la misma de los cuencos del nodo 1. Es el color propio
 * del objeto y no significa nada más; por eso ningún token vivo la toca.
 */
const WOOD = { light: "#d9965a", base: "#a8652f", dark: "#5e3417", lid: "#e8ad73" } as const;

/**
 * La madera de cada cofre del encastre, un poco más clara cuanto más adentro:
 * dos cajas de la misma madera, una dentro de la otra, se leían como una sola.
 */
const WOOD_DEPTH: readonly { readonly light: string; readonly base: string; readonly dark: string }[] = [
  { light: WOOD.light, base: WOOD.base, dark: WOOD.dark },
  { light: "#e4a970", base: "#b8763d", dark: "#6c3f1e" },
  { light: "#eebd88", base: "#c7884c", dark: "#7a4a25" },
  { light: "#f5cf9f", base: "#d49a5d", dark: "#87552c" },
];

/**
 * El acero de las llaves, las cerraduras y la manivela. Gris frío a propósito:
 * el dorado es de lo aprendido y el ámbar de "mirá acá", así que una llave de
 * bronce diría una de las dos cosas sin querer.
 */
const STEEL = { light: "#eef3f9", base: "#a9b6c7", dark: "#566579" } as const;
/** El tesoro del encastre: un cristal sin color de equipo, que no significa nada más. */
const CRYSTAL = { light: "#ffffff", base: "#cfe3f5", dark: "#6f8fb0" } as const;
/**
 * El objeto que vuelve del cofre, con cuerpo. Su color sí tiene trabajo: menta
 * si encaja en la silueta, ámbar si lo que volvió es otra cosa.
 */
const GEM_OK = { light: "#b9f7de", base: theme.color.ok, dark: "#169a6c" } as const;
const GEM_WARN = { light: "#ffe2b0", base: theme.color.warn, dark: "#c7801a" } as const;
/** La piedra del río: gris del agua, el color propio de la pista del nodo 3. */
const STONE = { light: "#9aa8ba", base: "#5f6e82", dark: "#323d4d" } as const;
/** La tinta sobre el metal: los dientes y los signos grabados en la placa. */
const ENGRAVE = "#1a2433";
const SHADOW = "rgba(0, 0, 0, 0.32)";
/** El vidrio de las superficies que flotan sobre el paisaje. */
const GLASS_FILL = "rgba(255, 255, 255, 0.05)";
const GLASS_LINE = "rgba(255, 255, 255, 0.12)";
/** Lo que va debajo de algo que tiene que leerse sobre cualquier fondo. */
const PLATE = "rgba(9, 17, 29, 0.9)";
/** Un hueco: más oscuro que lo que lo rodea, sin tapar el paisaje entero. */
const HOLLOW = "rgba(0, 0, 0, 0.38)";
/** La tinta sobre el paisaje: casi blanca, con una sombra que la despega. */
const INK_SHADOW = "rgba(0, 0, 0, 0.55)";

// --- Jugo --------------------------------------------------------------------

/** Cuánto dura la respuesta al evento: el halo y las chispas. */
const BURST_MS = 720;
/** Cuántos pixeles tarda una pieza en crecer entera al separarse de su lugar. */
const LIFT_RAMP = 34;

const SPARKS = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6);

/**
 * El reloj de una respuesta, de 0 a 1; en 1 no se ve. Arranca cuando `value`
 * cruza `at` subiendo, una sola vez, y se apaga en seco si baja: el cambio de
 * ronda devuelve el cofre a cero y la chispa no puede quedar a medias. Corre en
 * el hilo de la interfaz, así que el cruce se detecta sin volver a JavaScript.
 */
function useBurstOn(value: SharedValue<number>, at: number, sfx: Sfx = "fit"): SharedValue<number> {
  const burst = useSharedValue(1);
  useAnimatedReaction(
    () => value.value >= at,
    (arriba, antes) => {
      if (antes === null || arriba === antes) return;
      burst.value = arriba
        ? withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: BURST_MS }))
        : 1;
      // El sonido sale con la chispa, en el mismo cruce: la cerradura cede.
      if (arriba) runOnJS(play)(sfx);
    },
    [at, sfx],
  );
  return burst;
}

/**
 * El mismo reloj, cuando el evento llega como hecho del render y no como valor
 * animado: la ficha que entró, la vuelta que cerró. `delay` espera a que el
 * objeto termine de llegar, para que la chispa salga cuando se ve que encajó y
 * no antes. El cambio de ronda (el hecho vuelve a falso) la apaga en seco.
 */
function useBurstWhen(flag: boolean, delay = 0, sfx: Sfx = "fit"): SharedValue<number> {
  const burst = useSharedValue(1);
  const antes = useRef(flag);
  useEffect(() => {
    let espera: ReturnType<typeof setTimeout> | null = null;
    if (flag && !antes.current) {
      burst.value = withDelay(
        delay,
        withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: BURST_MS })),
      );
      // El sonido espera lo mismo que la chispa: suena cuando se ve que encajó.
      espera = setTimeout(() => play(sfx), delay);
    } else if (!flag) {
      burst.value = 1;
    }
    antes.current = flag;
    return () => {
      if (espera !== null) clearTimeout(espera);
    };
  }, [flag, delay, burst, sfx]);
  return burst;
}

/**
 * Contar se escucha: cada piedra que el caminante pisa suena a madera, y la nota
 * sube con el número de la piedra (baja cuando vuelve). Se detecta en el hilo de
 * la interfaz y cruza a JavaScript una vez por piedra, nunca por cuadro. Un salto
 * de más de una piedra en un cuadro es un cambio de ronda, y no suena.
 */
function useStepSound(pos: SharedValue<number>, on: boolean): void {
  useAnimatedReaction(
    () => (on ? Math.round(pos.value) : -1),
    (piedra, antes) => {
      if (piedra < 0 || antes === null || antes < 0 || Math.abs(piedra - antes) !== 1) return;
      runOnJS(play)("drop", { pitch: Math.min(12, piedra) });
    },
    [on],
  );
}

/**
 * La respuesta al evento que el nivel enseña, en el objeto que lo causó: un
 * halo menta que se enciende y se apaga, y seis chispas menta y oro que se
 * abren. Menta porque es "coincide"; el oro, porque lo que coincidió es lo que
 * se aprende. No se repite para pedir atención: eso sería confeti.
 */
function Burst({
  x,
  y,
  r,
  burst,
}: {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly burst: SharedValue<number>;
}) {
  const halo = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(x, y, r);
    return p;
  }, [x, y, r]);
  const haloO = useDerivedValue(() => (burst.value < 1 ? 0.9 * (1 - burst.value) : 0));
  return (
    <>
      <Group opacity={haloO}>
        <Path path={halo} color={theme.color.ok}>
          <BlurMask blur={r * 0.7} style="normal" />
        </Path>
      </Group>
      {SPARKS.map((angle, i) => (
        <Spark key={i} x={x} y={y} reach={r} angle={angle} gold={i % 2 === 1} burst={burst} />
      ))}
    </>
  );
}

function Spark({
  x,
  y,
  reach,
  angle,
  gold,
  burst,
}: {
  readonly x: number;
  readonly y: number;
  readonly reach: number;
  readonly angle: number;
  readonly gold: boolean;
  readonly burst: SharedValue<number>;
}) {
  const dot = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 3);
    return p;
  }, []);
  const t = useDerivedValue(() => {
    const d = reach * 0.4 + reach * 1.5 * burst.value;
    return [
      { translateX: x + Math.cos(angle) * d },
      { translateY: y + Math.sin(angle) * d },
      { scale: 1 - 0.7 * burst.value },
    ];
  }, [x, y, reach, angle]);
  const o = useDerivedValue(() => (burst.value < 1 ? 1 - burst.value : 0));
  return (
    <Group transform={t} opacity={o}>
      <Path path={dot} color={gold ? theme.color.gold : theme.color.ok} />
    </Group>
  );
}

/**
 * Un resplandor ámbar que sigue a un valor de 0 a 1 (o de -1 a 1): la llave
 * que no entra, la manivela contra el tope. Es el "mirá acá" del juego sobre el
 * objeto que se resiste, y acompaña al tope sin agregar ningún sacudón.
 */
function WarnGlow({
  path,
  level,
  width,
}: {
  readonly path: SkPath;
  readonly level: DerivedValue<number>;
  readonly width: number;
}) {
  const o = useDerivedValue(() => Math.min(1, Math.abs(level.value) * 1.4));
  return (
    <Group opacity={o}>
      <Path path={path} color={theme.color.warn} style="stroke" strokeWidth={width}>
        <BlurMask blur={width * 0.8} style="solid" />
      </Path>
    </Group>
  );
}

/**
 * Tinta que se lee sobre el paisaje: el trazo y, un pixel y medio más abajo, su
 * sombra. Los numerales de la pista y la fila de fichas viven sobre el mundo
 * pintado, y ahí un gris sin sombra se perdía.
 */
function Ink({ path, color }: { readonly path: SkPath; readonly color: string }) {
  return (
    <>
      <Group transform={[{ translateY: 1.5 }]}>
        <Path path={path} color={INK_SHADOW} />
      </Group>
      <Path path={path} color={color} />
    </>
  );
}

// --- Lo que la escena necesita saber -----------------------------------------

/**
 * Los modos que la escena sabe dibujar. Los seis primeros son los del nodo 4 y
 * `UndoMode` entra tal cual; `shrink` es lo que agrega el nodo 6: el cofre
 * suelto, sin pista y sin manivela, con la cerradura con la forma del estirado
 * y el llavero abajo. `nest` es lo que agrega el nodo 9: los cofres metidos uno
 * adentro del otro, el árbol al costado y la fila de fichas debajo. `key` es lo
 * que agrega el nodo 12: la silueta en la tapa y, desde la capa visual, el
 * diagrama vertical con las dos flechas que cierran el circuito. `wrap` es lo
 * que agrega el nodo 14: el mismo encastre del 9, con la incógnita adentro y el
 * llavero abajo y al centro, porque ahí el cofre anidado ya no se arma sino que
 * se abre de afuera hacia adentro.
 */
export type ChestMode =
  | "turn"
  | "pick"
  | "judge"
  | "measure"
  | "write"
  | "unlock"
  | "shrink"
  | "nest"
  | "key"
  | "wrap";

/** La pista dibujada, aplanada, a pedido, o ya retirada. */
export type ChestSkin = "stone" | "mark" | "onDemand" | "hidden";

/**
 * Cómo se dibuja una llave. `teeth` es la del nodo 4, que se mide contando; las
 * tres siguientes son clases de acción y se distinguen por la forma, que es lo
 * que pide un nodo donde el número no viene en la llave sino en el dial. Las
 * cuatro últimas son las del nodo 9: la llave lleva en el paletón el signo de
 * la operación que deshace la cerradura, sacado del atlas de glifos.
 */
export type ChestKeyKind =
  | "teeth"
  | "shrink"
  | "cut"
  | "stretch"
  | "add"
  | "sub"
  | "mul"
  | "div";

export interface ChestKey {
  readonly teeth: number;
  readonly kind?: ChestKeyKind;
  /**
   * El número de la llave, dibujado en puntitos debajo del paletón. Lo agregó
   * el nodo 12, donde dos llaves pueden tener la misma forma y distinto número
   * y todavía no hay ningún numeral en pantalla: sin los puntitos serían la
   * misma llave dibujada dos veces.
   */
  readonly dots?: boolean;
}

export interface ChestTile {
  readonly value: number;
  /** La ficha dice su número en puntitos, por la misma razón que la llave. */
  readonly dots?: boolean;
}

export interface ChestRowData {
  readonly minuend: number;
  readonly subtrahend: number;
  readonly result: number;
  readonly hidden: "result" | "minuend";
}

export interface ChestLockData {
  readonly kind: string;
  readonly value: number;
}

export interface ChestAction {
  readonly kind: string;
  readonly value: number;
}

/**
 * Un cofre de un encastre: un rectángulo redondeado adentro del anterior. Lo
 * agregó el nodo 9 y es lo único que la escena necesita saber de un árbol de
 * expresión, porque el `id` es el del término y con él la fila, los cofres y el
 * árbol dibujado hablan del mismo objeto sin que nadie los sincronice.
 */
export interface ChestRing {
  readonly id: string;
  /** La forma de la cerradura: `add`, `sub`, `mul` o `div`. */
  readonly lock: ChestKeyKind;
  /** 0 es el cofre de más afuera. */
  readonly depth: number;
  /** En qué paso del recorrido se abre este cofre. Es lo que decide el orden. */
  readonly step: number;
  /**
   * El cofre ya está puesto en el encastre. En falso se dibuja como contorno
   * tenue: es el anidamiento que hay que reproducir, todavía vacío.
   */
  readonly placed: boolean;
  /**
   * El cofre se dibuja. En falso no hay rectángulo ninguno y la fila es lo
   * único que queda: son los cofres invisibles, que es el nivel donde la
   * jerarquía deja de ser un dibujo y pasa a ser un acuerdo.
   */
  readonly drawn: boolean;
}

/**
 * Una acción y su vuelta: un tramo del diagrama vertical. Lo agregó el nodo 12.
 *
 * La cerradura y la llave viajan separadas —la operación por un lado y el
 * número por el otro— porque esa separación *es* lo que el nodo enseña: la
 * inversa es propiedad de la operación y no de los números. Un tipo que las
 * juntara en una etiqueta haría imposible dibujar la llave que entra con el
 * número equivocado.
 */
export interface ChestArrow {
  readonly id: string;
  /** La forma de la cerradura: la operación que se aplicó. */
  readonly lock: ChestKeyKind;
  /** El número de la acción: los puntitos de la cerradura. */
  readonly count: number;
  /** La llave que se probó sobre esta flecha, o null si todavía no se probó. */
  readonly key: { readonly kind: ChestKeyKind; readonly count: number } | null;
  /** La vuelta se cerró: la llave era la inversa y giró entera. */
  readonly closed: boolean;
}

/**
 * Una columna del diagrama. `explain` compara dos; el resto de los niveles
 * dibuja una sola.
 */
export interface ChestPanel {
  readonly arrows: readonly ChestArrow[];
  /** Los extremos, de arriba abajo: `arrows.length + 1` valores. */
  readonly values: readonly number[];
  /** Lo que salió del cofre encajó en la silueta de la tapa. */
  readonly fits: boolean;
  /**
   * La silueta hueca de la llave que sí entra, revelada sin nombrarla. Es el
   * patrón `key_mismatch` del catálogo dibujado sobre el cofre.
   */
  readonly reveal: ChestKeyKind | null;
}

/**
 * Lo que el nodo 12 le pide dibujar a la escena. Llega como un objeto opcional
 * y no como props sueltas para que los nodos 4, 6 y 9 sigan llamando a la
 * escena exactamente igual que antes.
 */
export interface ChestDiagram {
  readonly panels: readonly ChestPanel[];
  /** El cofre, el diagrama de flechas, o el diagrama con el cofre fantasma. */
  readonly skin: "chest" | "arrows" | "ghost";
  /** Fichas con operador y número sobre las flechas y en las llaves. */
  readonly labeled: boolean;
  /** Numerales en los extremos. En la capa concreta el objeto no es un número. */
  readonly numerals: boolean;
  /** Las dos ranuras de la llave que se arma, o null. */
  readonly slots: {
    readonly kind: ChestKeyKind | null;
    readonly count: number | null;
  } | null;
}

/**
 * Un glifo de la fila, ya ubicado por el nodo con `@mathy/typeset`. La escena no
 * compone: si compusiera, el hit test del nodo y el dibujo medirían distinto y
 * el paréntesis se tocaría donde no se ve.
 */
export interface ChestGlyph {
  readonly char: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

export interface ChestBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/**
 * Lo que la escena lee del problema. Es una forma y no un tipo de un nodo:
 * `UndoProblem` la cumple sin tocar nada, y cualquier otro nodo que reuse la
 * mecánica arma un objeto con estos campos y no importa los del nodo 4.
 */
export interface ChestProblem {
  readonly track: number;
  readonly home: number;
  readonly step: number;
  readonly landing: number;
  readonly keys: readonly ChestKey[];
  readonly returns: readonly (readonly number[])[];
  readonly liar: number;
  readonly marks: readonly [number, number] | null;
  readonly row: ChestRowData;
  readonly tiles: readonly ChestTile[];
  readonly lock: ChestLockData;
  readonly actions: readonly ChestAction[];
  /** Los cofres del encastre, del más de afuera al más de adentro. Solo `nest`. */
  readonly rings?: readonly ChestRing[];
  /** La fila de fichas, ya compuesta. Vacía: el nodo todavía no escribe. */
  readonly glyphs?: readonly ChestGlyph[];
  /** El cofre fantasma que se dibuja alrededor de un tramo de la fila. */
  readonly ghostBox?: ChestBox | null;
  /** El diagrama del nodo 12. Ausente: la escena dibuja lo de siempre. */
  readonly diagram?: ChestDiagram | null;
}

/** Lo que la escena lee del nivel. `UndoLevel` la cumple sin tocar nada. */
export interface ChestLevel {
  readonly mode: ChestMode;
  readonly layer: Layer;
  readonly labeled: boolean;
  readonly skin: ChestSkin;
  readonly ruler: boolean;
  readonly keyboard: boolean;
  /**
   * Los numerales sobre las llaves. Sin declararlo manda la capa, como en el
   * nodo 4; un nodo que se queda sin numerales más allá de `concrete` lo dice.
   */
  readonly numerals?: boolean;
  /** El árbol al costado, con un nodo por cofre. Solo `nest`. */
  readonly tree?: boolean;
}

/** Cuánto gira la manivela por piedra. */
export const TOOTH_ANGLE = (2 * Math.PI) / TEETH_PER_TURN;
/** Llaves y fichas montadas siempre, para que el árbol no cambie entre rondas. */
export const KEY_SLOTS = 4;
export const TILE_SLOTS = 5;
/** Los diez dígitos del teclado del último nivel simbólico. */
export const PAD_KEYS = 10;

const PAD = 40;
/** Con pocas piedras la pista no se estira hasta el absurdo. */
const MAX_STEP = 96;

export interface Spot {
  readonly x: number;
  readonly y: number;
}

/** Una pista dibujada. `explain` tiene dos; el resto de los modos, una. */
export interface TrackRow {
  readonly stones: readonly Spot[];
  readonly y: number;
  readonly step: number;
  readonly from: Spot;
  readonly to: Spot;
}

export interface ChestLayout {
  readonly rows: readonly TrackRow[];
  /** El eje del lienzo: el renglón y el teclado se cuelgan de acá. */
  readonly center: number;
  readonly stoneR: number;
  /**
   * El blanco donde entra la llave. Es la manivela cuando hay pista, y la
   * cerradura del cofre cuando el cofre está suelto: en los dos casos es el
   * mismo gesto, soltar y girar, así que es el mismo punto.
   */
  readonly crank: { readonly x: number; readonly y: number; readonly r: number };
  /** El cofre suelto, para los nodos que no lo apoyan sobre una pista. */
  readonly chest: { readonly x: number; readonly y: number; readonly w: number };
  readonly keys: readonly Spot[];
  readonly keyW: number;
  readonly keyH: number;
  readonly tiles: readonly Spot[];
  readonly tileW: number;
  readonly tileH: number;
  /** El renglón y la casilla que hay que llenar. */
  readonly rowY: number;
  readonly slot: Spot;
  readonly slotW: number;
  readonly slotH: number;
  /** El teclado de dígitos y la ficha que el jugador compone con él. */
  readonly pads: readonly Spot[];
  readonly padR: number;
  readonly composed: Spot;
  /** El cofre de las cerraduras que no son pasos. */
  readonly lock: Spot;
  /** El encastre del nodo 9. Ausente fuera del modo `nest`. */
  readonly nest?: NestLayout;
  /** El diagrama del nodo 12. Ausente fuera del modo `key`. */
  readonly diagram?: DiagramLayout;
}

/**
 * Dónde cae cada pieza del diagrama vertical. Lo comparten el dibujo y el hit
 * test: si la llave entrara donde no se ve la cerradura, el nodo estaría
 * enseñando otra cosa.
 */
export interface DiagramLayout {
  readonly panels: readonly DiagramPanel[];
  /** El cuerpo de la llave que se arma, y sus dos ranuras. */
  readonly blank: ChestBox;
  readonly opSlot: Spot;
  readonly countSlot: Spot;
  readonly slotW: number;
  readonly slotH: number;
}

export interface DiagramPanel {
  readonly cx: number;
  /** El cofre. Se dibuja entero, o chiquito al costado cuando es fantasma. */
  readonly chest: ChestBox;
  /** El hueco de la silueta, en el borde de la tapa. */
  readonly hole: Spot;
  /** Los extremos del diagrama, de arriba abajo. */
  readonly nodes: readonly Spot[];
  /** El medio de cada flecha que baja: ahí va la ficha de la cerradura. */
  readonly down: readonly Spot[];
  /** El medio de cada flecha que sube: ahí entra la llave. */
  readonly up: readonly Spot[];
  /** Por dónde viaja el objeto que vuelve: de donde estaba a la silueta. */
  readonly gemFrom: Spot;
  readonly gemTo: Spot;
}

/** Dónde cae cada pieza del encastre. Lo comparten el dibujo y el hit test. */
export interface NestLayout {
  /** Un rectángulo por cofre, del más de afuera al más de adentro. */
  readonly boxes: readonly ChestBox[];
  /** El hueco de la tapa de cada cofre: lo que el de afuera está esperando. */
  readonly holes: readonly Spot[];
  /** El nodo del árbol de cada cofre, y la hoja que le cuelga. */
  readonly tree: readonly Spot[];
  readonly leaves: readonly Spot[];
  /** El radio del blanco de toque de un nodo del árbol: generoso a propósito. */
  readonly nodeR: number;
  /** El centro de la fila de fichas y cuánto ancho tiene. */
  readonly row: Spot;
  readonly rowW: number;
  /** Los cofres sueltos, para el nivel que arma el anidamiento. */
  readonly loose: readonly ChestBox[];
}

/**
 * Los dos modos que dibujan cofres uno adentro del otro. El nodo 9 arma el
 * encastre y el 14 lo abre, y es el mismo dibujo: lo único que los separa es
 * dónde va el llavero.
 */
const esEncastre = (level: ChestLevel): boolean =>
  level.mode === "nest" || level.mode === "wrap";

/**
 * Dónde cae cada cosa. Lo calcula la actividad y lo comparten el dibujo y el
 * gesto: si el hit test usara otra geometría, la llave entraría donde no se ve.
 */
export function chestLayout(
  problem: ChestProblem,
  level: ChestLevel,
  width: number,
  height: number,
): ChestLayout {
  const judge = level.mode === "judge";
  /**
   * El cofre suelto va arriba de todo, apoyado sobre lo que el nodo dibuje
   * debajo, y su cerradura es también el blanco donde entra la llave. Con la
   * pista, el blanco sigue siendo la manivela y nada de esto cambia.
   */
  const suelto = level.mode === "shrink";
  const units = Math.max(problem.track - 1, 1);
  const step = Math.min((width - 2 * PAD) / units, MAX_STEP);
  const drawn = step * units;
  const left = (width - drawn) / 2;

  const bandas =
    judge ? [height * 0.28, height * 0.6]
    : level.mode === "write" ? [height * 0.22]
    : level.mode === "measure" ? [height * 0.42]
    : [height * 0.36];

  const rows: TrackRow[] = bandas.map((y) => {
    const stones: Spot[] = [];
    for (let i = 0; i < problem.track; i++) stones.push({ x: left + i * step, y });
    return { stones, y, step, from: { x: left, y }, to: { x: left + drawn, y } };
  });

  // El cofre suelto: el ancho lo acota la pantalla y el alto sale de él, porque
  // la cerradura tiene que quedar a un dedo de distancia del llavero.
  const chestW = suelto ? Math.max(64, Math.min(96, width * 0.16)) : 0;
  const chestH = chestW * 0.62;
  const chest = { x: width / 2, y: Math.max(chestH + 12, height * 0.17), w: chestW };

  const crankR = Math.max(30, Math.min(46, height * 0.13));
  const crank =
    suelto
      ? // La cerradura del cofre suelto, con el blanco de drop generoso: la mano
        // de un chico de cinco no apunta fino y el diseño lo exige.
        { x: chest.x, y: chest.y - chestH * 0.42 - 6, r: Math.max(42, chestW * 0.6) }
      : { x: width / 2, y: height - crankR - 14, r: crankR };

  // En pantallas angostas el llavero no cabe al lado de la manivela, así que se
  // sube a su propia fila. El blanco de una llave nunca baja de lo que pide N.
  // Sin manivela abajo, el llavero se queda con el ancho entero.
  // El llavero del nodo 12 vive abajo y al centro, como el del cofre suelto.
  // Cuando el nivel además reparte fichas, sube una fila para dejárselas.
  // El llavero abajo y al centro. Lo pide el nodo 12 con su diagrama y también
  // el 14, que cuelga llaves aunque su cofre sea un encastre.
  const llavero = level.mode === "key" || level.mode === "wrap";
  const angosta = suelto || llavero || width < 600;
  const keyH = 44;
  const zona = angosta ? width - 2 * PAD : crank.x - crank.r - 20 - PAD;
  const gap = 10;
  const keyW = Math.max(34, Math.min(72, (zona - (KEY_SLOTS - 1) * gap) / KEY_SLOTS));
  const keyY =
    llavero ? height - keyH / 2 - (problem.tiles.length > 0 ? 88 : 22)
    : suelto ? height - keyH / 2 - 22
    : angosta ? height - crankR * 2 - 44
    : height - keyH / 2 - 22;
  const keyLeft = angosta ? (width - (KEY_SLOTS * keyW + (KEY_SLOTS - 1) * gap)) / 2 : PAD;
  const keys: Spot[] = [];
  const usadas = level.mode === "unlock" ? problem.actions.length : problem.keys.length;
  for (let i = 0; i < KEY_SLOTS; i++) {
    keys.push(
      i < usadas
        ? { x: keyLeft + keyW / 2 + i * (keyW + gap), y: keyY }
        : // Las ranuras que esta ronda no usa se van del lienzo, y así el árbol
          // de la escena no cambia de una ronda a la otra.
          { x: width / 2, y: height + keyH * 2 },
    );
  }

  const tileW = 52;
  const tileH = 48;
  const totalT = TILE_SLOTS * tileW + (TILE_SLOTS - 1) * gap;
  const tileY = height - tileH / 2 - 18;
  const tiles: Spot[] = [];
  for (let i = 0; i < TILE_SLOTS; i++) {
    tiles.push(
      i < problem.tiles.length
        ? { x: (width - totalT) / 2 + tileW / 2 + i * (tileW + gap), y: tileY }
        : { x: width / 2, y: height + tileH * 2 },
    );
  }

  // El renglón. La misma cuenta la usan el dibujo y el hit test, para que la
  // ficha entre exactamente donde se ve el hueco.
  const rowY = height * 0.55;
  const rm = rowMetrics(problem, width / 2, rowY);

  const padR = 20;
  const pads: Spot[] = [];
  const padGap = 8;
  const padTotal = PAD_KEYS * (padR * 2) + (PAD_KEYS - 1) * padGap;
  const padScale = Math.min(1, (width - 2 * PAD) / padTotal);
  for (let i = 0; i < PAD_KEYS; i++) {
    pads.push({
      x: (width - padTotal * padScale) / 2 + (padR + i * (padR * 2 + padGap)) * padScale,
      y: height - padR - 18,
    });
  }

  return {
    rows,
    center: width / 2,
    stoneR: Math.min(step * 0.3, 18),
    crank,
    chest,
    keys,
    keyW,
    keyH,
    tiles,
    tileW,
    tileH,
    rowY,
    slot: rm.slot,
    slotW: rm.slotW,
    slotH: rm.slotH,
    pads,
    padR: padR * padScale,
    composed: { x: width / 2, y: height - padR * 2 - 62 },
    lock: { x: width / 2, y: height * 0.34 },
    ...(esEncastre(level) ? { nest: nestLayout(problem, level, width, height) } : {}),
    ...(level.mode === "key" ? { diagram: diagramLayout(problem, width, height, keyY - keyH) } : {}),
  };
}

/**
 * El diagrama vertical del nodo 12.
 *
 * Una columna por panel: el cofre arriba, los extremos abajo en fila vertical y
 * las dos flechas a los costados de esa fila. La flecha que baja lleva la
 * cerradura y la que sube, la llave, y ese reflejo es el dibujo del invariante:
 * el mismo tramo recorrido en los dos sentidos.
 *
 * El blanco donde entra la llave es `up`, y cuando el cofre todavía no se
 * afinó en flechas ese punto **es la cerradura del cofre**. Un solo campo para
 * las dos pieles, porque para el jugador es el mismo gesto.
 */
function diagramLayout(
  problem: ChestProblem,
  width: number,
  height: number,
  bottom: number,
): DiagramLayout {
  const d = problem.diagram;
  const paneles = d?.panels ?? [];
  const n = Math.max(paneles.length, 1);
  const esCofre = d?.skin === "chest";
  const colW = width / n;

  const top = 18;
  const chestW = esCofre
    ? Math.max(90, Math.min(colW * 0.55, 148))
    : Math.max(44, Math.min(colW * 0.26, 76));
  const chestH = chestW * 0.66;

  const panels: DiagramPanel[] = [];
  for (let i = 0; i < n; i++) {
    const cx = colW * (i + 0.5);
    // Con el cofre entero manda el cofre y el diagrama no está, así que se
    // centra en lo que queda libre; con el cofre fantasma manda el diagrama y el
    // cofre se corre a la derecha.
    const chest = esCofre
      ? { x: cx - chestW / 2, y: top + (bottom - top - chestH) * 0.34, w: chestW, h: chestH }
      : { x: cx + colW * 0.24, y: top + 8, w: chestW, h: chestH };
    const hole = { x: chest.x + chest.w / 2, y: chest.y + 13 };

    const valores = Math.max((paneles[i]?.values.length ?? 2), 2);
    const dTop = esCofre ? chest.y + chest.h + 46 : top + 34;
    const dBottom = Math.max(dTop + 60, bottom - 22);
    // La flecha no se estira hasta llenar el lienzo: un tramo de trescientos
    // pixeles no dice más que uno de ciento cincuenta, y el circuito de ida y
    // vuelta se lee peor cuanto más lejos quedan sus dos extremos.
    const alto = Math.min(dBottom - dTop, 150 * (valores - 1));
    const y0 = dTop + (dBottom - dTop - alto) / 2;
    const paso = alto / (valores - 1);
    const nodes: Spot[] = [];
    for (let j = 0; j < valores; j++) nodes.push({ x: cx, y: y0 + j * paso });

    const brazo = Math.min(52, colW * 0.2);
    const down: Spot[] = [];
    const up: Spot[] = [];
    // La cerradura del cofre: el mismo punto donde el jugador suelta la llave
    // mientras el cofre siga dibujado entero.
    const cerradura = { x: chest.x + chest.w / 2, y: chest.y + chest.h * 0.42 };
    for (let j = 0; j + 1 < valores; j++) {
      const my = ((nodes[j] as Spot).y + (nodes[j + 1] as Spot).y) / 2;
      down.push({ x: cx - brazo, y: my });
      up.push(esCofre ? cerradura : { x: cx + brazo, y: my });
    }

    panels.push({
      cx,
      chest,
      hole,
      nodes,
      down,
      up,
      // El objeto sale de donde estaba y sube a encajar en la silueta. Con el
      // cofre entero eso es de adentro del cofre a la tapa; con el diagrama, del
      // extremo de abajo al de arriba.
      gemFrom: esCofre
        ? // Adentro del cofre y por debajo de la cerradura: si el objeto se
          // dibujara sobre la cerradura, la forma que hay que leer quedaría
          // tapada justamente por lo que hay que devolver.
          { x: chest.x + chest.w / 2, y: chest.y + chest.h * 0.84 }
        : // Sobre la flecha que sube, no sobre el extremo: en el extremo ya está
          // el numeral, y el objeto que vuelve taparía justo el número que
          // tiene que coincidir con el de partida.
          { x: (up[up.length - 1] ?? { x: cx }).x, y: (nodes[valores - 1] as Spot).y },
      gemTo: esCofre
        ? hole
        : { x: (up[0] ?? { x: cx }).x, y: (nodes[0] as Spot).y },
    });
  }

  // La llave que se arma: el cuerpo con las dos ranuras, justo encima del
  // llavero. Las ranuras son grandes porque cualquier ficha entra en las dos.
  const slotW = 54;
  const slotH = 44;
  const blankW = slotW * 2 + 46;
  const blank = { x: width / 2 - blankW / 2, y: bottom - slotH - 12, w: blankW, h: slotH + 8 };
  return {
    panels,
    blank,
    opSlot: { x: blank.x + 30 + slotW / 2, y: blank.y + blank.h / 2 },
    countSlot: { x: blank.x + 30 + slotW + 6 + slotW / 2, y: blank.y + blank.h / 2 },
    slotW,
    slotH,
  };
}

/**
 * El encastre: rectángulos redondeados uno adentro del otro, el árbol al
 * costado y la fila debajo.
 *
 * Los cofres se dibujan concéntricos y no apilados porque lo que el nodo enseña
 * es *estar adentro de*: dos cajas al lado se leen como dos pasos, y el orden de
 * dos pasos ya lo enseñó el nodo 3. El hueco de la tapa va arriba y al centro,
 * que es adonde sube el tesoro del de adentro.
 */
function nestLayout(
  problem: ChestProblem,
  level: ChestLevel,
  width: number,
  height: number,
): NestLayout {
  const rings = problem.rings ?? [];
  const n = Math.max(rings.length, 1);
  // Con árbol al costado el encastre se corre a la izquierda; sin él, al centro.
  const conArbol = level.tree === true;
  const zonaW = conArbol ? width * 0.6 : width;
  const cx = conArbol ? width * 0.32 : width / 2;

  const outerW = Math.max(150, Math.min(zonaW - 2 * PAD, 300));
  const outerH = Math.max(120, Math.min(height * 0.44, 240));
  const cy = height * 0.32;
  // El paso tiene que dejar lugar a la tapa de cada cofre: un cofre que no
  // muestra su tapa no tiene dónde recibir el tesoro del de adentro.
  const pasoX = outerW / (n * 2 + 1);
  const pasoY = outerH / (n * 2 + 1);

  const boxes: ChestBox[] = [];
  const holes: Spot[] = [];
  for (let i = 0; i < n; i++) {
    const w = outerW - 2 * i * pasoX;
    const h = outerH - 2 * i * pasoY;
    const box = { x: cx - w / 2, y: cy - h / 2 + i * pasoY * 0.35, w, h };
    boxes.push(box);
    holes.push({ x: box.x + box.w / 2, y: box.y + 12 });
  }

  // El árbol: la raíz arriba, y cada cofre un escalón más abajo con su hoja
  // colgando del otro lado. Es el mismo encastre visto como líneas.
  const treeX = width * 0.78;
  const treeTop = height * 0.16;
  const treePaso = Math.min(46, (height * 0.34) / Math.max(n, 1));
  const rama = Math.min(38, width * 0.07);
  const tree: Spot[] = [];
  const leaves: Spot[] = [];
  for (let i = 0; i < n; i++) {
    const y = treeTop + i * treePaso;
    tree.push({ x: treeX - i * rama * 0.4, y });
    leaves.push({ x: treeX - i * rama * 0.4 + rama, y: y + treePaso * 0.72 });
  }

  const looseW = Math.max(54, Math.min(88, (width - 2 * PAD) / (n + 1)));
  const loose: ChestBox[] = [];
  for (let i = 0; i < n; i++) {
    // El cofre suelto se dibuja del tamaño que le toca en el encastre: con tres
    // cofres el orden queda dibujado en el tamaño, y eso es la mitad del nivel.
    const w = looseW * (1 - i * 0.18);
    const h = w * 0.66;
    loose.push({
      x: PAD + i * (looseW + 14) + (looseW - w) / 2,
      y: height - h - 26,
      w,
      h,
    });
  }

  return {
    boxes,
    holes,
    tree,
    leaves,
    nodeR: 22,
    row: { x: conArbol ? cx : width / 2, y: height * 0.62 },
    rowW: zonaW - 2 * PAD,
    loose,
  };
}

// --- Numerales ---------------------------------------------------------------

/**
 * Una cadena de glifos del atlas, centrada. Sale del mismo atlas que la
 * ecuación del nodo 13, así que el `5` de una ficha y el `5` de una ecuación son
 * el mismo objeto, y el `−` es el U+2212 de la tipografía matemática y no un
 * guion de ASCII, que no está en el atlas y dejaría un hueco.
 */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
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

/**
 * Un número. El signo se emite como U+2212 y no como el guion de ASCII, que no
 * está en el atlas: `String(-5)` dejaría un hueco donde va el menos, y si el
 * número abre la fila el trazo entero se cae.
 */
const numeral = (target: SkPath, value: number, cx: number, cy: number, size: number): void =>
  addGlyphs(target, String(value).replace("-", "−"), cx, cy, size);

/**
 * El signo de cada cerradura aritmética. El menos es U+2212 y no el guion de
 * ASCII, que no está en el atlas y dejaría un hueco donde va el signo.
 */
const OP_SIGN: Partial<Record<ChestKeyKind, string>> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

/** El tamaño del renglón. Es el único número grande de la escena. */
const ROW_SIZE = 40;

interface RowMetrics {
  readonly chars: readonly { readonly c: string; readonly cx: number }[];
  /** Desde qué carácter y cuántos quedan tapados por la casilla vacía. */
  readonly from: number;
  readonly count: number;
  readonly slot: Spot;
  readonly slotW: number;
  readonly slotH: number;
}

/**
 * Dónde cae cada glifo del renglón y dónde queda el hueco. La cuenta es una
 * sola, y la comparten el dibujo y el gesto: si el hit test usara otra, la
 * ficha entraría donde no se ve el hueco.
 */
function rowMetrics(problem: ChestProblem, cx: number, cy: number): RowMetrics {
  const texto = `${problem.row.minuend}−${problem.row.subtrahend}=${problem.row.result}`;
  const chars = [...texto];
  // Los espacios de TeX: `\medmuskip` alrededor del operador binario y
  // `\thickmuskip` alrededor de la relación, como en la composición del nodo 13.
  const aire = (c: string): number => (c === "−" ? 0.222 : c === "=" ? 0.278 : 0);
  const ancho = (c: string): number => (getGlyph(c)?.advance ?? 0.5) + 2 * aire(c);
  let advance = 0;
  for (const c of chars) advance += ancho(c);
  let cursor = cx - (advance * ROW_SIZE) / 2;
  const puestos: { c: string; cx: number }[] = [];
  for (const c of chars) {
    const w = ancho(c) * ROW_SIZE;
    puestos.push({ c, cx: cursor + w / 2 });
    cursor += w;
  }
  const tapado = problem.row.hidden === "minuend" ? problem.row.minuend : problem.row.result;
  const count = String(tapado).length;
  const from = problem.row.hidden === "minuend" ? 0 : chars.length - count;
  const primero = puestos[from] as { cx: number };
  const ultimo = puestos[from + count - 1] as { cx: number };
  const w = ancho(chars[from] as string) * ROW_SIZE;
  return {
    chars: puestos,
    from,
    count,
    slot: { x: (primero.cx + ultimo.cx) / 2, y: cy },
    slotW: ultimo.cx - primero.cx + w + 6,
    slotH: ROW_SIZE * 1.2,
  };
}

// --- Piezas ------------------------------------------------------------------

/** Una flecha con cola y punta, del nodo 3. Acá la punta también mira a la izquierda. */
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
 * Las partes de un cofre, cada una un `SkPath` armado una vez por problema. Las
 * alturas viajan con él porque cada cofre tiene su propio degradado: con dos
 * cofres en dos filas, un degradado compartido dejaba uno claro y otro oscuro.
 */
interface ChestParts {
  readonly body: SkPath;
  readonly lid: SkPath;
  readonly lock: SkPath;
  /** La placa de metal donde se leen los dientes, y el ojo de la cerradura. */
  readonly plate: SkPath;
  readonly keyhole: SkPath;
  /** Los flejes del cuerpo, el brillo de la tapa y la sombra en el piso. */
  readonly straps: SkPath;
  readonly shine: SkPath;
  readonly shadow: SkPath;
  readonly origin: Spot;
  /** Dónde responde el cofre cuando abre: el centro de la placa. */
  readonly lockAt: Spot;
  readonly top: number;
  readonly lidBottom: number;
  readonly bottom: number;
  readonly w: number;
}

/**
 * El cofre. La cerradura no es un adorno: sus dientes son el tramo de ida, así
 * que mirar la cerradura ya dice qué llave hace falta. Van grabados en una placa
 * de acero para que se lean sobre la madera.
 */
function buildChest(cx: number, cy: number, w: number, teeth: number): ChestParts {
  const h = w * 0.62;
  const top = cy - h - 6;
  const left = cx - w / 2;
  const body = Skia.Path.Make();
  body.addRRect(Skia.RRectXY(Skia.XYWHRect(left, top + h * 0.34, w, h * 0.66), 5, 5));

  const lid = Skia.Path.Make();
  lid.addRRect(Skia.RRectXY(Skia.XYWHRect(left, top, w, h * 0.36), 7, 7));
  const shine = Skia.Path.Make();
  shine.addRRect(Skia.RRectXY(Skia.XYWHRect(left + 5, top + 2.5, w - 10, 2.5), 1.25, 1.25));

  // Dos flejes verticales: lo que hace que la caja se lea como cofre y no como
  // un ladrillo, y lo que le da canto a la luz.
  const straps = Skia.Path.Make();
  const fleje = Math.max(3, w * 0.07);
  for (const fx of [left + w * 0.16, left + w * 0.84 - fleje]) {
    straps.addRect(Skia.XYWHRect(fx, top + h * 0.36, fleje, h * 0.64));
  }

  // La cerradura: un diente por paso de la ida, del tamaño de los de la manivela.
  const lock = Skia.Path.Make();
  const paso = Math.min(w / 7, 6);
  const ancho = Math.max(paso * teeth, paso);
  let x = cx - ancho / 2;
  const ly = top + h * 0.6;
  lock.moveTo(x, ly);
  for (let i = 0; i < Math.max(teeth, 1); i++) {
    lock.lineTo(x, ly - (teeth === 0 ? 0 : 7));
    lock.lineTo(x + paso * 0.6, ly - (teeth === 0 ? 0 : 7));
    lock.lineTo(x + paso * 0.6, ly);
    x += paso;
    lock.lineTo(x, ly);
  }
  const plateW = Math.max(ancho + 10, 16);
  const plateH = teeth === 0 ? 16 : 15;
  const plateY = teeth === 0 ? top + h * 0.44 : ly - 11;
  const plate = Skia.Path.Make();
  plate.addRRect(Skia.RRectXY(Skia.XYWHRect(cx - plateW / 2, plateY, plateW, plateH), 3.5, 3.5));
  // Sin dientes, la placa lleva el ojo de la cerradura y nada más.
  const keyhole = Skia.Path.Make();
  if (teeth === 0) {
    keyhole.addCircle(cx, plateY + plateH * 0.4, 2.4);
    keyhole.addRect(Skia.XYWHRect(cx - 1.1, plateY + plateH * 0.4, 2.2, plateH * 0.38));
  }

  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(cx - w * 0.56, top + h - 3, w * 1.12, 8));
  return {
    body,
    lid,
    lock,
    plate,
    keyhole,
    straps,
    shine,
    shadow,
    origin: { x: left, y: top + h * 0.36 },
    lockAt: { x: cx, y: plateY + plateH / 2 },
    top,
    lidBottom: top + h * 0.36,
    bottom: top + h,
    w,
  };
}

/**
 * Una llave. Sus dientes son los pasos que vuelve: en el primer nivel están
 * fundidos en una forma y desde el segundo se cuentan de a uno, que es lo que
 * convierte "esta se parece" en "esta mide tres".
 */
function buildKey(cx: number, cy: number, w: number, teeth: number, separados: boolean): SkPath {
  const p = Skia.Path.Make();
  const r = Math.min(w * 0.17, 9);
  const x0 = cx - w / 2 + r;
  p.addCircle(x0, cy, r);
  p.addCircle(x0, cy, r * 0.45);
  const largo = w - r * 2 - 4;
  p.moveTo(x0 + r, cy);
  p.lineTo(x0 + r + largo, cy);
  const paso = teeth > 0 ? Math.min(largo / Math.max(teeth, 1), 9) : 0;
  const base = x0 + r + largo - paso * teeth;
  if (teeth === 0) return p;
  if (!separados) {
    // La forma: los dientes fundidos en un bloque, que se compara mirando.
    p.moveTo(base, cy);
    p.lineTo(base, cy + 9);
    p.lineTo(base + paso * teeth, cy + 9);
    p.lineTo(base + paso * teeth, cy);
    return p;
  }
  for (let i = 0; i < teeth; i++) {
    const x = base + i * paso;
    p.moveTo(x, cy);
    p.lineTo(x, cy + 9);
    p.lineTo(x + paso * 0.62, cy + 9);
    p.lineTo(x + paso * 0.62, cy);
  }
  return p;
}

/**
 * Una llave que no se mide en dientes sino en clase. El número no está en la
 * llave: está en el dial, y se gira. Por eso las tres se distinguen por lo que
 * le hacen a lo que hay del otro lado —juntar, cortar, separar— y por nada más.
 */
function buildClassKey(kind: ChestKeyKind, cx: number, cy: number, w: number): SkPath {
  const p = Skia.Path.Make();
  const r = Math.min(w * 0.17, 9);
  const x0 = cx - w / 2 + r;
  p.addCircle(x0, cy, r);
  p.addCircle(x0, cy, r * 0.45);
  const x1 = cx + w / 2 - 3;
  p.moveTo(x0 + r, cy);
  p.lineTo(x1, cy);

  // El paletón de una llave aritmética lo dibuja el llamador con el signo
  // relleno, no acá: un `÷` trazado como contorno a veinte pixeles se funde con
  // un `+`, porque el trazo se come el hueco entre los dos puntos y la barra.
  if (OP_SIGN[kind] !== undefined) return p;

  const s = Math.max(5, Math.min(w * 0.16, 8));
  const bx = (x0 + r + x1) / 2 + s * 0.4;
  const by = cy + s + 2;
  if (kind === "cut") {
    // La tijera: dos trazos cruzados. Corta el extremo y no toca el medio.
    p.moveTo(bx - s, by - s);
    p.lineTo(bx + s, by + s);
    p.moveTo(bx - s, by + s);
    p.lineTo(bx + s, by - s);
    return p;
  }
  // Dos puntas: encaradas juntan, de espaldas separan. Es la misma flecha
  // dibujada al revés, como el `÷` es la cruz acostada.
  const punta = (x: number, d: number): void => {
    p.moveTo(x - d * s * 0.7, by - s * 0.8);
    p.lineTo(x + d * s * 0.7, by);
    p.lineTo(x - d * s * 0.7, by + s * 0.8);
  };
  const dentro = kind === "shrink";
  punta(bx - s * 1.5, dentro ? 1 : -1);
  punta(bx + s * 1.5, dentro ? -1 : 1);
  return p;
}

/** Una flecha vertical. La misma pieza sirve para bajar y para subir. */
function vArrow(target: SkPath, x: number, y0: number, y1: number, head: number): void {
  target.moveTo(x, y0);
  target.lineTo(x, y1);
  if (y0 === y1) return;
  const dir = y1 > y0 ? -1 : 1;
  target.moveTo(x, y1);
  target.lineTo(x - head * 0.6, y1 + dir * head);
  target.moveTo(x, y1);
  target.lineTo(x + head * 0.6, y1 + dir * head);
}

/**
 * El objeto que entró al cofre. Un rombo y nada más: no puede ser un numeral,
 * porque en la capa concreta el objeto todavía no es un número.
 */
function buildGem(r: number): SkPath {
  const p = Skia.Path.Make();
  p.moveTo(0, -r);
  p.lineTo(r * 0.78, 0);
  p.lineTo(0, r);
  p.lineTo(-r * 0.78, 0);
  p.close();
  return p;
}

/**
 * Un número dicho en puntitos. Más de nueve no se cuentan de un vistazo, y los
 * niveles que llegan tan arriba ya escriben el número.
 */
function addDots(target: SkPath, count: number, cx: number, cy: number, paso: number): void {
  const puntos = Math.min(Math.max(count, 0), 9);
  let x = cx - ((puntos - 1) * paso) / 2;
  for (let i = 0; i < puntos; i++) {
    target.addCircle(x, cy, Math.max(1.6, paso * 0.24));
    x += paso;
  }
}

/**
 * La cara de una cerradura del nodo 12: la operación como forma y el número
 * como puntitos, que es como se lee sin saber leer. Con etiqueta el número se
 * escribe, y ahí la ficha ya nació.
 */
function lockFace(
  target: SkPath,
  kind: ChestKeyKind,
  count: number,
  cx: number,
  cy: number,
  s: number,
  labeled: boolean,
): void {
  const signo = OP_SIGN[kind];
  if (signo !== undefined) addGlyphs(target, signo, cx, cy - s * 0.1, s);
  if (labeled) {
    numeral(target, count, cx + s * 0.62, cy - s * 0.1, s * 0.86);
    return;
  }
  // Los puntitos que se agregan o se quitan.
  addDots(target, count, cx, cy + s * 0.62, Math.min(s * 0.26, 7));
}

/**
 * La rueda dentada del nodo 3, de acero. Los dientes son todos iguales: eso es
 * el invariante. El disco no gira (su luz queda arriba a la izquierda); giran
 * los dientes y el brazo, que es lo que el dedo mueve.
 */
interface CrankParts {
  readonly body: SkPath;
  readonly hub: SkPath;
  readonly teeth: SkPath;
  readonly arm: SkPath;
  readonly knob: SkPath;
  readonly shadow: SkPath;
  /** El contorno por donde se enciende el ámbar cuando la rueda llega al tope. */
  readonly ring: SkPath;
}

function buildCrank(r: number): CrankParts {
  const body = Skia.Path.Make();
  body.addCircle(0, 0, r * 0.62);
  const hub = Skia.Path.Make();
  hub.addCircle(0, 0, 4.5);
  const teeth = Skia.Path.Make();
  for (let i = 0; i < TEETH_PER_TURN; i++) {
    const a = i * TOOTH_ANGLE - Math.PI / 2;
    teeth.moveTo(Math.cos(a) * r * 0.64, Math.sin(a) * r * 0.64);
    teeth.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
  }
  const arm = Skia.Path.Make();
  arm.moveTo(0, 0);
  arm.lineTo(0, -r * 0.62);
  const knob = Skia.Path.Make();
  knob.addCircle(0, -r * 0.62, 7.5);
  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(-r * 0.8, r * 0.72, r * 1.6, 10));
  const ring = Skia.Path.Make();
  ring.addCircle(0, 0, r * 0.9);
  return { body, hub, teeth, arm, knob, shadow, ring };
}

/** El caminante del nodo 2: dos trazos y una cabeza, sin cara y sin texto. */
function buildWalker(): { body: SkPath; head: SkPath; shadow: SkPath } {
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
  head.addCircle(0, -28, 6.5);
  // La sombra en la piedra: el caminante se apoya, no flota delante de la pista.
  const shadow = Skia.Path.Make();
  shadow.addOval(Skia.XYWHRect(-10, -3.5, 20, 6));
  return { body, head, shadow };
}

/** El caminante, con el color de su equipo y cuerpo: trazo grueso y cabeza con luz. */
const WALKER_LOOK = {
  accent: { light: "#b8e2ff", base: theme.color.accent, dark: "#1f7fcf" },
  coral: { light: "#ffd0da", base: theme.color.coral, dark: "#d2465f" },
} as const;

function WalkerFigure({
  walker,
  look,
}: {
  readonly walker: { body: SkPath; head: SkPath; shadow: SkPath };
  readonly look: { readonly light: string; readonly base: string; readonly dark: string };
}) {
  return (
    <>
      <Path path={walker.shadow} color={SHADOW} />
      <Path
        path={walker.body}
        color={look.base}
        style="stroke"
        strokeWidth={3.5}
        strokeCap="round"
        strokeJoin="round"
      />
      <Path path={walker.head}>
        <RadialGradient c={vec(-2.5, -31)} r={10} colors={[look.light, look.base, look.dark]} />
      </Path>
    </>
  );
}

/**
 * El símbolo de una acción cualquiera. Son dibujos y no palabras porque el nodo
 * se juega sin leer, y porque lo que se evalúa acá es la estructura: una acción
 * y la única acción que devuelve al estado anterior.
 */
function buildAction(kind: string, value: number, cx: number, cy: number, s: number): SkPath {
  const p = Skia.Path.Make();
  if (kind === "forward" || kind === "back") {
    const dir = kind === "forward" ? 1 : -1;
    arrow(p, cx - dir * s * 0.7, cx + dir * s * 0.7, cy, s * 0.34);
    for (let i = 0; i < value; i++) {
      const x = cx - s * 0.6 + i * (s * 0.3);
      p.moveTo(x, cy + s * 0.4);
      p.lineTo(x, cy + s * 0.7);
    }
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
  if (kind === "hat") {
    p.addCircle(cx, cy + s * 0.25, s * 0.32);
    p.moveTo(cx - s * 0.6, cy - s * 0.15);
    p.lineTo(cx + s * 0.6, cy - s * 0.15);
    p.moveTo(cx - s * 0.34, cy - s * 0.15);
    p.lineTo(cx, cy - s * 0.62);
    p.lineTo(cx + s * 0.34, cy - s * 0.15);
    return p;
  }
  if (kind === "flat") {
    // La banda aplastada contra el clavo: todas las marcas cayeron en el mismo
    // punto y ya no se sabe cuál era cuál. Por eso no hay vuelta.
    p.moveTo(cx - s * 0.7, cy);
    p.lineTo(cx + s * 0.7, cy);
    for (let i = 0; i < 4; i++) {
      const x = cx - s * 0.7 + i * 2.5;
      p.moveTo(x, cy - s * 0.45);
      p.lineTo(x, cy + s * 0.45);
    }
    p.addCircle(cx - s * 0.7, cy, s * 0.16);
    return p;
  }
  if (kind === "color") {
    p.addCircle(cx, cy, s * 0.5);
    p.addArc(Skia.XYWHRect(cx - s * 0.5, cy - s * 0.5, s, s), 90, 180);
    p.lineTo(cx, cy - s * 0.5);
    return p;
  }
  // La acción sin vuelta: partida, y no hay pieza que la rearme.
  p.moveTo(cx - s * 0.5, cy - s * 0.5);
  p.lineTo(cx + s * 0.5, cy + s * 0.5);
  p.moveTo(cx + s * 0.5, cy - s * 0.5);
  p.lineTo(cx - s * 0.5, cy + s * 0.5);
  return p;
}

// --- Geometría por problema --------------------------------------------------

interface Geom {
  readonly line: SkPath;
  readonly stones: SkPath;
  readonly stoneShine: SkPath;
  readonly stoneShadow: SkPath;
  /** Las piedras de cada fila por separado: cada fila lleva su propio degradado. */
  readonly stoneRows: readonly { readonly path: SkPath; readonly y: number }[];
  readonly numerals: SkPath;
  /** Un cofre por fila de la pista (`explain` tiene dos), o el cofre suelto. */
  readonly chests: readonly ChestParts[];
  readonly out: SkPath;
  readonly back: SkPath;
  readonly leftover: SkPath;
  readonly ruler: SkPath;
  readonly rulerCount: SkPath;
  readonly row: SkPath;
  /** El vidrio debajo del renglón: la cuenta se lee sobre cualquier paisaje. */
  readonly rowPlate: SkPath;
  readonly slot: SkPath;
  readonly placed: SkPath;
  readonly lockFace: SkPath;
  /** El cartel oscuro donde se lee la acción de la cerradura que no es un tramo. */
  readonly lockCard: SkPath;
  readonly lockBox: ChestParts;
  readonly composed: SkPath;
  readonly pads: SkPath;
  readonly padDigits: SkPath;
}

function buildGeom(
  problem: ChestProblem,
  level: ChestLevel,
  l: ChestLayout,
  at: number,
  placed: number | null,
  composed: number | null,
): Geom {
  const row0 = l.rows[0] as TrackRow;
  const mark = level.skin !== "stone";
  const marcados = problem.marks ?? [problem.home, problem.landing];

  // Un índice cualquiera cae siempre sobre una piedra dibujada: desde el nivel
  // 6 los numerales se pasan de la pista visible, y eso no puede romper el trazo.
  const xs = (i: number): number =>
    (row0.stones[Math.max(0, Math.min(problem.track - 1, i))] as Spot).x;

  const line = Skia.Path.Make();
  const stones = Skia.Path.Make();
  const stoneShine = Skia.Path.Make();
  const stoneShadow = Skia.Path.Make();
  const numerals = Skia.Path.Make();
  const stoneRows: { path: SkPath; y: number }[] = [];
  for (const r of l.rows) {
    line.moveTo(r.from.x, r.from.y);
    line.lineTo(r.to.x, r.to.y);
    const fila = Skia.Path.Make();
    stoneRows.push({ path: fila, y: r.y });
    for (let i = 0; i < problem.track; i++) {
      const s = r.stones[i] as Spot;
      if (mark) {
        stones.moveTo(s.x, s.y - 8);
        stones.lineTo(s.x, s.y + 8);
      } else {
        const R = l.stoneR;
        stones.addOval(Skia.XYWHRect(s.x - R, s.y - R * 0.42, R * 2, R * 0.84));
        fila.addOval(Skia.XYWHRect(s.x - R, s.y - R * 0.42, R * 2, R * 0.84));
        // El brillo arriba a la izquierda y la sombra corrida hacia abajo: la
        // piedra asoma del agua en vez de estar pintada sobre ella.
        stoneShine.addOval(Skia.XYWHRect(s.x - R * 0.62, s.y - R * 0.3, R * 0.7, R * 0.22));
        stoneShadow.addOval(Skia.XYWHRect(s.x - R * 1.05, s.y - R * 0.18, R * 2.1, R * 0.84));
      }
      // Los numerales aparecen en la capa `visual`, y en la concreta solo bajo
      // las dos piedras que la instancia nombra.
      const nombrada = level.layer !== "concrete" || marcados.includes(i);
      if (nombrada && level.mode !== "unlock") numeral(numerals, i, s.x, s.y + 26, 15);
    }
  }

  // El cofre suelto se apoya donde el nodo lo pidió y su cerradura tiene la
  // forma de la ida, igual que sobre la pista: los dientes son los del estirado.
  // En `explain` las dos filas tienen que ser idénticas salvo por el recorrido:
  // si el cofre estuviera en una sola, la comparación diría otra cosa.
  const chests =
    level.mode === "shrink"
      ? [buildChest(l.chest.x, l.chest.y, l.chest.w, problem.step)]
      : l.rows.map((r) =>
          buildChest(xs(problem.home), r.y - 12, Math.min(r.step * 0.9, 46), problem.step),
        );

  // Las dos flechas enfrentadas: la de ida arriba con la punta a la derecha, la
  // de vuelta abajo con la punta a la izquierda. Se redibujan cuando el
  // caminante se detiene, que es cuando el tramo de vuelta cambia de largo.
  const out = Skia.Path.Make();
  const back = Skia.Path.Make();
  const leftover = Skia.Path.Make();
  if (problem.step > 0) {
    arrow(out, xs(problem.home), xs(problem.landing), row0.y - 46, 9);
    if (at < problem.landing) arrow(back, xs(problem.landing), xs(at), row0.y + 44, 9);
    // Lo que quedó sin cancelar: el tramo de la ida que la vuelta no alcanzó.
    if (at > problem.home) {
      leftover.moveTo(xs(problem.home), row0.y - 46);
      leftover.lineTo(xs(at), row0.y - 46);
    }
  }

  // La regla plegable: el mismo tramo, medido en vez de recorrido.
  const ruler = Skia.Path.Make();
  const rulerCount = Skia.Path.Make();
  const [ma, mb] = marcados as [number, number];
  const largo = xs(mb) - xs(ma);
  ruler.addRRect(Skia.RRectXY(Skia.XYWHRect(0, -9, Math.max(largo, 1), 18), 4, 4));
  // La regla no dice el número: lo dice la ficha que el jugador trae. Si lo
  // dijera ella, medir sería mirar.
  if (placed !== null) numeral(rulerCount, placed, (xs(ma) + xs(mb)) / 2, row0.y + 52, 24);

  // El renglón. La casilla tapada se dibuja como hueco: pide la ficha sin decirlo.
  const rowPath = Skia.Path.Make();
  const rowPlate = Skia.Path.Make();
  const slot = Skia.Path.Make();
  const puesta = Skia.Path.Make();
  if (level.mode === "write") {
    const rm = rowMetrics(problem, l.center, l.rowY);
    const primero = rm.chars[0];
    const ultimo = rm.chars[rm.chars.length - 1];
    if (primero && ultimo) {
      const x0 = primero.cx - ROW_SIZE * 0.6;
      const x1 = ultimo.cx + ROW_SIZE * 0.6;
      rowPlate.addRRect(
        Skia.RRectXY(Skia.XYWHRect(x0, l.rowY - ROW_SIZE * 0.95, x1 - x0, ROW_SIZE * 1.9), 18, 18),
      );
    }
    rm.chars.forEach((g, i) => {
      const tapado = i >= rm.from && i < rm.from + rm.count;
      if (!tapado) addGlyphs(rowPath, g.c, g.cx, l.rowY, ROW_SIZE);
    });
    slot.addRRect(
      Skia.RRectXY(
        Skia.XYWHRect(
          rm.slot.x - rm.slotW / 2,
          rm.slot.y - rm.slotH / 2,
          rm.slotW,
          rm.slotH,
        ),
        6,
        6,
      ),
    );
    if (placed !== null) numeral(puesta, placed, rm.slot.x, rm.slot.y, ROW_SIZE);
  }

  // El cofre de las cerraduras que no son pasos.
  const lockFace = Skia.Path.Make();
  const lockCard = Skia.Path.Make();
  const lockBox = buildChest(l.lock.x, l.lock.y + 40, 84, 0);
  if (level.mode === "unlock") {
    lockFace.addPath(buildAction(problem.lock.kind, problem.lock.value, l.lock.x, l.lock.y - 46, 26));
    lockCard.addRRect(Skia.RRectXY(Skia.XYWHRect(l.lock.x - 30, l.lock.y - 46 - 28, 60, 56), 12, 12));
  }

  const composedPath = Skia.Path.Make();
  if (composed !== null) numeral(composedPath, composed, l.composed.x, l.composed.y, 26);

  const pads = Skia.Path.Make();
  const padDigits = Skia.Path.Make();
  if (level.keyboard) {
    for (let i = 0; i < PAD_KEYS; i++) {
      const s = l.pads[i] as Spot;
      pads.addCircle(s.x, s.y, l.padR);
      numeral(padDigits, i, s.x, s.y, l.padR * 1.1);
    }
  }

  return {
    line,
    stones,
    stoneShine,
    stoneShadow,
    stoneRows,
    numerals,
    chests,
    out,
    back,
    leftover,
    ruler,
    rulerCount,
    row: rowPath,
    rowPlate,
    slot,
    placed: puesta,
    lockFace,
    lockCard,
    lockBox,
    composed: composedPath,
    pads,
    padDigits,
  };
}

// --- Componente --------------------------------------------------------------

export interface Slot {
  readonly dx: SharedValue<number>;
  readonly dy: SharedValue<number>;
  /** 1 mientras la pieza está en la mano; 0 cuando ya se usó o no hace falta. */
  readonly alive: SharedValue<number>;
  /**
   * El giro de la pieza sobre sí misma, en radianes. Solo lo usan los nodos
   * donde la llave se gira después de entrar; sin él la pieza no rota y el
   * árbol de la escena queda igual que antes.
   */
  readonly spin?: SharedValue<number>;
  /**
   * 1 mientras el dedo tiene la pieza, 0 si no. Opcional: sin él la escena
   * deduce que la pieza está en la mano porque se alejó de su ranura y de todo
   * lugar donde puede quedar apoyada (la manivela, la cerradura, el hueco).
   */
  readonly held?: SharedValue<number>;
}

/**
 * Lo que la actividad anima en un encastre. Llega como un objeto opcional y no
 * como seis props sueltas para que los nodos 4 y 6, que no anidan nada, sigan
 * llamando a la escena exactamente igual que antes.
 */
export interface ChestNestValues {
  /**
   * Cuántos cofres se abrieron, como número continuo: un cofre se abre cuando
   * `opened` pasa su `step`, y el tesoro viaja con la parte fraccionaria.
   */
  readonly opened: SharedValue<number>;
  /** La llave girando en el vacío: vibra y vuelve sola. */
  readonly vain: SharedValue<number>;
  /** El recorrido del árbol iluminándose, en nodos. */
  readonly tree: SharedValue<number>;
  /** El cofre fantasma que se dibuja y se borra alrededor de un tramo, de 0 a 1. */
  readonly ghost: SharedValue<number>;
  /** Qué cofre está señalado, o -1. Viaja como número porque lo lee un worklet. */
  readonly marked: SharedValue<number>;
}

export interface ChestSceneProps {
  readonly problem: ChestProblem;
  readonly level: ChestLevel;
  readonly layout: ChestLayout;
  /** La posición del caminante, en piedras. */
  readonly pos: SharedValue<number>;
  /** El cofre abriéndose, de 0 a 1. */
  readonly open: SharedValue<number>;
  /** Las dos flechas encendidas. Cuando coinciden se apagan juntas. */
  readonly outArrow: SharedValue<number>;
  readonly backArrow: SharedValue<number>;
  /** El tramo de ida que la vuelta no alcanzó a cancelar. */
  readonly leftover: SharedValue<number>;
  /** La manivela contra el tope de la orilla: vibra y no pasa. */
  readonly jam: SharedValue<number>;
  /** El latido de la demostración; se apaga cuando el jugador ya jugó. */
  readonly hint: SharedValue<number>;
  /** El reloj de la mano fantasma, de 0 a 1. Es toda la instrucción que hay. */
  readonly demo: SharedValue<number>;
  /** El reloj de los dos regresos de `explain`, de 0 a 1. */
  readonly clock: SharedValue<number>;
  /** Cuánto se estiró la regla plegable, de 0 a 1. */
  readonly ruler: SharedValue<number>;
  /** La recta que se pide con un toque. */
  readonly line: SharedValue<number>;
  readonly appear: SharedValue<number>;
  /** La llave puesta en la manivela, o -1: el sentido de giro se invierte con ella. */
  readonly mounted: number;
  /** La piedra donde se detuvo el caminante, que es lo que redibuja las flechas. */
  readonly at: number;
  /** La fila elegida en `explain`, o -1. */
  readonly picked: number;
  /** El numeral que el jugador compuso con el teclado, o null. */
  readonly composed: number | null;
  /** La ficha que ya entró en el renglón, o null. */
  readonly placed: number | null;
  readonly keys: readonly Slot[];
  readonly tiles: readonly Slot[];
  /** El encastre del nodo 9. Ausente: la escena dibuja lo de siempre. */
  readonly nest?: ChestNestValues;
}

export function ChestScene({
  problem,
  level,
  layout,
  pos,
  open,
  outArrow,
  backArrow,
  leftover,
  jam,
  hint,
  demo,
  clock,
  ruler,
  line,
  appear,
  mounted,
  at,
  picked,
  composed,
  placed,
  keys,
  tiles,
  nest,
}: ChestSceneProps) {
  const geom = useMemo(
    () => buildGeom(problem, level, layout, at, placed, composed),
    [problem, level, layout, at, placed, composed],
  );
  const crank = useMemo(() => buildCrank(layout.crank.r), [layout.crank.r]);
  const walker = useMemo(buildWalker, []);

  const keyGeom = useMemo(() => {
    const arbitrarias = level.mode === "unlock";
    return layout.keys.map((spot, i) => {
      const box = Skia.Path.Make();
      box.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(spot.x - layout.keyW / 2, spot.y - layout.keyH / 2, layout.keyW, layout.keyH),
          10,
          10,
        ),
      );
      const shape = Skia.Path.Make();
      const digits = Skia.Path.Make();
      if (arbitrarias) {
        const a = problem.actions[i];
        if (a) shape.addPath(buildAction(a.kind, a.value, spot.x, spot.y, 18));
      } else {
        const k = problem.keys[i];
        if (k) {
          // La llave que no se mide en dientes se dibuja por su clase. Es el
          // mismo llavero: cambia qué distingue a una llave de otra.
          shape.addPath(
            k.kind && k.kind !== "teeth"
              ? buildClassKey(k.kind, spot.x, spot.y - 4, layout.keyW - 12)
              : buildKey(spot.x, spot.y - 4, layout.keyW - 12, k.teeth, level.labeled),
          );
          // El signo de la operación, relleno y en el paletón. Sale del mismo
          // atlas que la expresión del nodo 13, así que el `×` de una llave y el
          // `×` de una cuenta son el mismo objeto.
          const signo = k.kind ? OP_SIGN[k.kind] : undefined;
          if (signo !== undefined) {
            addGlyphs(
              digits,
              signo,
              spot.x + Math.min(layout.keyW * 0.16, 12),
              spot.y + Math.min(layout.keyW * 0.14, 8),
              Math.min(layout.keyW * 0.34, 20),
            );
          }
          // El numeral llega con la capa `visual`: hasta entonces la llave se
          // compara mirando o contando dientes, nunca leyendo. Un nodo que
          // estira ese silencio más allá de la capa lo declara.
          const conNumeral = level.numerals ?? level.layer !== "concrete";
          if (conNumeral) numeral(digits, k.teeth, spot.x, spot.y + 24, 15);
          // Y el número en puntitos, para el nodo donde dos llaves comparten la
          // forma y lo único que las separa es cuánto deshacen.
          else if (k.dots === true) addDots(digits, k.teeth, spot.x, spot.y + 22, 7);
        }
      }
      return { box, shape, digits };
    });
  }, [layout, problem.keys, problem.actions, level.labeled, level.layer, level.mode, level.numerals]);

  const tileGeom = useMemo(
    () =>
      layout.tiles.map((spot, i) => {
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
        const tile = problem.tiles[i];
        if (tile !== undefined) {
          if (tile.dots === true) addDots(digits, tile.value, spot.x, spot.y, 8);
          else numeral(digits, tile.value, spot.x, spot.y, 24);
        }
        return { box, digits };
      }),
    [layout, problem.tiles],
  );

  const row0 = layout.rows[0] as TrackRow;
  const ox = row0.stones[0]?.x ?? 0;
  const dx = row0.step;
  const oy = row0.y;

  const walkerT = useDerivedValue(() => [
    { translateX: ox + dx * pos.value },
    { translateY: oy },
  ]);
  // El giro de la manivela es la posición del caminante: un solo hecho, no dos.
  const crankT = useDerivedValue(() => [{ rotate: pos.value * TOOTH_ANGLE + jam.value * 0.07 }]);
  // La luz de la guía en la perilla: late con la demostración y se apaga cuando
  // el jugador ya jugó. Dorado, porque es la guía.
  const crankGlow = useDerivedValue(() => 0.9 * hint.value);
  const lidT = useDerivedValue(() => [{ rotate: -1.9 * open.value }]);
  // El cofre abre: es el evento del nodo, y responde una sola vez en la cerradura.
  const abre = useBurstOn(open, 0.92);
  // Cada piedra que pisa el caminante suena, más aguda cuanto más lejos. En
  // `explain` los caminantes andan solos y en bucle: ahí no suena nada.
  useStepSound(pos, level.mode !== "judge" && level.mode !== "key" && !esEncastre(level));

  /** Donde la regla dice su número: entre los dos caminantes, debajo de la pista. */
  const medida = useMemo<Spot | null>(() => {
    if (!level.ruler || !problem.marks) return null;
    const a = row0.stones[Math.max(0, Math.min(problem.track - 1, problem.marks[0]))];
    const b = row0.stones[Math.max(0, Math.min(problem.track - 1, problem.marks[1]))];
    return a && b ? { x: (a.x + b.x) / 2, y: row0.y + 52 } : null;
  }, [level.ruler, problem.marks, problem.track, row0]);

  /**
   * Los lugares donde una pieza puede quedar apoyada fuera de su ranura: la
   * manivela, la cerradura, el hueco del renglón, la llave que se arma. Una
   * pieza crece mientras está lejos de su casa y de todos ellos, que es
   * mientras el dedo la lleva; al acercarse a uno vuelve a su tamaño, y así se
   * ve que ahí entra.
   */
  const apoyos = useMemo<readonly Spot[]>(() => {
    const out: Spot[] = [];
    const m = level.mode;
    if (m === "turn" || m === "pick" || m === "shrink" || m === "unlock") out.push(layout.crank);
    if (m === "write") out.push(layout.slot);
    if (level.keyboard) out.push(layout.composed);
    if (medida) out.push(medida);
    for (const p of layout.diagram?.panels ?? []) out.push(...p.up, p.hole);
    if (layout.diagram) out.push(layout.diagram.opSlot, layout.diagram.countSlot);
    for (const b of layout.nest?.boxes ?? []) out.push({ x: b.x + b.w - 20, y: b.y + b.h - 18 });
    if (layout.nest) out.push(layout.nest.row);
    return out;
  }, [layout, level.mode, level.keyboard, medida]);

  // La ficha que entró en el hueco del renglón, o en la regla: la cuenta cerró.
  const colocada = useBurstWhen(placed !== null && (level.mode === "write" || medida !== null));
  const colocadaEn = level.mode === "write" ? layout.slot : medida;

  // La regla se estira con el dedo: una banda rellena que escala, sin trazo que
  // se deforme al escalar.
  const rulerX = (row0.stones[(problem.marks ?? [0, 0])[0]] as Spot | undefined)?.x ?? 0;
  const rulerT = useDerivedValue(() => [
    { translateX: rulerX },
    { translateY: oy },
    { scaleX: Math.max(0.0001, ruler.value) },
  ]);
  const rulerCountO = useDerivedValue(() => Math.max(0, (ruler.value - 0.92) / 0.08));

  /**
   * La mano fantasma. Es la única instrucción del nodo: toma la llave de tres
   * dientes, la suelta sobre la manivela y gira. No dice nada porque no puede:
   * el jugador no lee.
   */
  const manoDesde = layout.keys[0] ?? { x: 0, y: 0 };
  // Con el diagrama, la mano va adonde entra la llave, que es la cerradura del
  // cofre o el medio de la flecha que sube según la piel. Es el mismo campo.
  // Con el encastre, la mano va a la cerradura del cofre de más afuera, que es
  // el único que tiene la tapa al alcance.
  const cerraduraDeAfuera = layout.nest?.boxes[0];
  const manoHasta =
    level.mode === "key"
      ? (layout.diagram?.panels[0]?.up[0] ?? layout.diagram?.panels[0]?.hole ?? layout.crank)
      : level.mode === "wrap" && cerraduraDeAfuera
        ? {
            x: cerraduraDeAfuera.x + cerraduraDeAfuera.w - 20,
            y: cerraduraDeAfuera.y + cerraduraDeAfuera.h - 18,
          }
        : layout.crank;
  const ghost = useMemo(() => {
    const dot = Skia.Path.Make();
    dot.addCircle(0, 0, 13);
    return dot;
  }, []);
  const ghostT = useDerivedValue(() => {
    const t = Math.max(0, Math.min(1, demo.value));
    const e = t * t * (3 - 2 * t);
    return [
      { translateX: manoDesde.x + (manoHasta.x - manoDesde.x) * e },
      { translateY: manoDesde.y + (manoHasta.y - manoDesde.y) * e },
    ];
  }, [manoDesde, manoHasta]);
  const conMano =
    level.mode === "turn" ||
    level.mode === "shrink" ||
    // Sin llavero no hay nada que llevar: la mano fantasma sobraría en el nivel
    // donde la respuesta se toca en vez de arrastrarse.
    ((level.mode === "key" || level.mode === "wrap") && problem.keys.length > 0);
  const ghostO = useDerivedValue(() =>
    conMano ? hint.value * 0.5 * Math.sin(demo.value * Math.PI) : 0,
  );

  // La pista se retira en el último nivel, y desde el 6 los numerales se pasan
  // de lo que hay dibujado: que la recta no alcance es lo que ese nivel enseña.
  const cabe = problem.landing < problem.track;
  // La pista se apaga, no se desmonta: el árbol tiene que quedar igual de una
  // ronda a la otra, que es lo que pide el modo retained.
  const oculta = level.skin === "hidden" || !cabe;
  const aDemanda = level.skin === "onDemand";
  const pistaO = useDerivedValue(
    () => (oculta ? 0 : aDemanda ? line.value : 1),
    [oculta, aDemanda],
  );
  const conManivela = level.mode === "turn" || level.mode === "pick";
  const conRenglon = level.mode === "write";
  // El cofre solo aparece donde hay un viaje que deshacer. Desde los dos
  // caminantes no hay ida previa y por eso tampoco hay cofre.
  const conCofre = conManivela || level.mode === "judge";
  /**
   * El cofre suelto no puede ir adentro del grupo de la pista: ese grupo se
   * apaga entero cuando la pista se retira, y un nodo sin pista se quedaría sin
   * cofre. Es el mismo dibujo, colgado un escalón más arriba.
   */
  const cofreSuelto = level.mode === "shrink";
  const segundo = problem.marks
    ? (row0.stones[Math.min(problem.marks[1], problem.track - 1)] as Spot)
    : null;

  const cofre = (
    <>
      {geom.chests.map((c, i) => (
        <ChestView
          key={`c${i}`}
          parts={c}
          lidT={lidT}
          burst={abre}
          // Con manivela, el tope es de la rueda y no de la cerradura.
          jam={conManivela ? null : jam}
        />
      ))}
    </>
  );

  return (
    <Group opacity={appear}>
      {cofreSuelto ? cofre : null}
      {level.mode === "key" && layout.diagram ? (
        <KeyDiagram
          problem={problem}
          layout={layout.diagram}
          open={open}
          outArrow={outArrow}
          backArrow={backArrow}
          leftover={leftover}
          jam={jam}
          hint={hint}
          clock={clock}
          picked={picked}
        />
      ) : null}
      {esEncastre(level) && layout.nest && nest ? (
        <NestedChests
          problem={problem}
          level={level}
          nest={layout.nest}
          values={nest}
          hint={hint}
        />
      ) : null}
      <Group opacity={pistaO}>
          <Path
            path={geom.line}
            color="rgba(244, 247, 251, 0.42)"
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
          />
          {level.skin === "stone" ? (
            <>
              <Path path={geom.stoneShadow} color={SHADOW}>
                <BlurMask blur={3} style="normal" />
              </Path>
              {geom.stoneRows.map((r, i) => (
                <Path key={`s${i}`} path={r.path}>
                  <LinearGradient
                    start={vec(0, r.y - layout.stoneR * 0.42)}
                    end={vec(0, r.y + layout.stoneR * 0.42)}
                    colors={[STONE.light, STONE.base, STONE.dark]}
                  />
                </Path>
              ))}
              <Path path={geom.stoneShine} color="rgba(255, 255, 255, 0.28)" />
            </>
          ) : (
            <Path
              path={geom.stones}
              color="rgba(244, 247, 251, 0.8)"
              style="stroke"
              strokeWidth={3}
              strokeCap="round"
            />
          )}
          <Ink path={geom.numerals} color="rgba(244, 247, 251, 0.88)" />

          {/* La regla plegable: el tramo resaltado entre las dos marcas. Sin
              trazo, porque escala con el dedo y un borde se deformaría. */}
          {level.ruler ? (
            <>
              <Group transform={rulerT}>
                <Path path={geom.ruler}>
                  <LinearGradient
                    start={vec(0, -9)}
                    end={vec(0, 9)}
                    colors={[
                      "rgba(184, 226, 255, 0.62)",
                      "rgba(86, 184, 255, 0.46)",
                      "rgba(31, 127, 207, 0.55)",
                    ]}
                  />
                </Path>
              </Group>
              <Group opacity={rulerCountO}>
                <Ink path={geom.rulerCount} color={theme.color.accent} />
              </Group>
            </>
          ) : null}

          {/* Las dos flechas enfrentadas. Cuando coinciden se apagan juntas. */}
          <Group opacity={outArrow}>
            <Path
              path={geom.out}
              color="rgba(244, 247, 251, 0.75)"
              style="stroke"
              strokeWidth={3.5}
              strokeCap="round"
              strokeJoin="round"
            />
          </Group>
          <Group opacity={leftover}>
            <Path path={geom.leftover} color={theme.color.warn} style="stroke" strokeWidth={5.5} strokeCap="round" />
          </Group>
          <Group opacity={backArrow}>
            <Path
              path={geom.back}
              color={theme.color.accent}
              style="stroke"
              strokeWidth={3.5}
              strokeCap="round"
              strokeJoin="round"
            />
          </Group>

          {/* El cofre sobre la piedra de partida. Se abre solo, sin cartel. */}
          {conCofre ? cofre : null}

          {/* Los caminantes. En `explain` cada fila tiene el suyo. */}
          {level.mode === "judge" ? (
            layout.rows.map((r, i) => (
              <JudgeWalker
                key={i}
                walk={(problem.returns[i] ?? []) as readonly number[]}
                row={r}
                clock={clock}
                walker={walker}
                elegida={picked === i}
                miente={i === problem.liar}
              />
            ))
          ) : (
            <Group transform={walkerT}>
              <WalkerFigure walker={walker} look={WALKER_LOOK.accent} />
            </Group>
          )}

          {/* El segundo caminante: el que convierte la vuelta en una distancia.
              Es otro equipo, así que lleva el segundo color de equipo. */}
          {level.ruler && segundo ? (
            <Group transform={[{ translateX: segundo.x }, { translateY: oy }]}>
              <WalkerFigure walker={walker} look={WALKER_LOOK.coral} />
            </Group>
          ) : null}
      </Group>

      {/* La cerradura que no es un tramo: el cofre, y arriba el cartel con la
          acción que hay que deshacer, sobre vidrio oscuro para que se lea. */}
      {level.mode === "unlock" ? (
        <>
          <ChestView parts={geom.lockBox} lidT={lidT} burst={abre} jam={jam} />
          <Path path={geom.lockCard} color={PLATE} />
          <Path path={geom.lockCard} color={GLASS_LINE} style="stroke" strokeWidth={1} />
          <Path
            path={geom.lockFace}
            color={theme.color.ink}
            style="stroke"
            strokeWidth={2.5}
            strokeCap="round"
            strokeJoin="round"
          />
        </>
      ) : null}

      {/* La manivela. Con la llave puesta el sentido de giro se invierte. */}
      {conManivela ? (
        <Group transform={[{ translateX: layout.crank.x }, { translateY: layout.crank.y }]}>
          <Path path={crank.shadow} color={SHADOW}>
            <BlurMask blur={5} style="normal" />
          </Path>
          {/* Contra el tope de la orilla la rueda no pasa: se enciende en ámbar. */}
          <WarnGlow path={crank.ring} level={jam} width={7} />
          <Group transform={crankT}>
            <Path path={crank.teeth} color={STEEL.dark} style="stroke" strokeWidth={7} strokeCap="round" />
            <Path
              path={crank.teeth}
              // Con la llave puesta, los dientes son del caminante: lo mueven.
              color={mounted >= 0 ? theme.color.accent : STEEL.base}
              style="stroke"
              strokeWidth={3.5}
              strokeCap="round"
            />
          </Group>
          <Path path={crank.body}>
            <RadialGradient
              c={vec(-layout.crank.r * 0.22, -layout.crank.r * 0.26)}
              r={layout.crank.r * 0.95}
              colors={[STEEL.light, STEEL.base, STEEL.dark]}
            />
          </Path>
          <Path path={crank.body} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
          <Group transform={crankT}>
            <Path path={crank.arm} color={STEEL.dark} style="stroke" strokeWidth={5} strokeCap="round" />
            <Group opacity={crankGlow}>
              <Path path={crank.knob} color={theme.color.gold}>
                <BlurMask blur={7} style="normal" />
              </Path>
            </Group>
            <Path path={crank.knob}>
              <RadialGradient
                c={vec(-2.5, -layout.crank.r * 0.62 - 3)}
                r={11}
                colors={[WALKER_LOOK.accent.light, WALKER_LOOK.accent.base, WALKER_LOOK.accent.dark]}
              />
            </Path>
          </Group>
          <Path path={crank.hub} color={ENGRAVE} />
        </Group>
      ) : null}

      {/* El renglón, sobre vidrio, con su casilla vacía como hueco. */}
      {conRenglon ? (
        <>
          <Path path={geom.rowPlate} color={GLASS_FILL} />
          <Path path={geom.rowPlate} color={GLASS_LINE} style="stroke" strokeWidth={1} />
          <Ink path={geom.row} color={theme.color.ink} />
          <Path path={geom.slot} color={HOLLOW} />
          <Path path={geom.slot} color="rgba(255, 255, 255, 0.22)" style="stroke" strokeWidth={1.5} />
          <Path path={geom.placed} color={theme.color.ok} />
        </>
      ) : null}
      {colocadaEn && (conRenglon || level.ruler) ? (
        <Burst x={colocadaEn.x} y={colocadaEn.y} r={26} burst={colocada} />
      ) : null}

      {/* El teclado de dígitos, con la ficha de las bandejas, y la ficha que el
          jugador arma con él. */}
      {level.keyboard ? (
        <>
          <ChipBodies path={geom.pads} />
          <Path path={geom.padDigits} color={theme.color.ink} />
          <Ink path={geom.composed} color={theme.color.ink} />
        </>
      ) : null}

      {/* El llavero. Siempre montado: las llaves que sobran, invisibles. */}
      {keyGeom.map((g, i) => (
        <Piece
          key={`k${i}`}
          slot={keys[i] as Slot}
          box={g.box}
          art={g.shape}
          // Las acciones sueltas del último nivel son dibujos, no llaves: tinta.
          metal={level.mode !== "unlock"}
          digits={g.digits}
          origin={layout.keys[i] as Spot}
          apoyos={apoyos}
        />
      ))}

      {/* El cajón de fichas. */}
      {!level.keyboard
        ? tileGeom.map((g, i) => (
            <Piece
              key={`t${i}`}
              slot={tiles[i] as Slot}
              box={g.box}
              digits={g.digits}
              origin={layout.tiles[i] as Spot}
              apoyos={apoyos}
            />
          ))
        : null}

      {/* La mano fantasma es la guía: dorada, con su luz. */}
      <Group transform={ghostT} opacity={ghostO}>
        <Path path={ghost} color={theme.color.gold} style="stroke" strokeWidth={6}>
          <BlurMask blur={6} style="normal" />
        </Path>
        <Path path={ghost} color={theme.color.gold} style="stroke" strokeWidth={2.5} />
      </Group>
    </Group>
  );
}

/**
 * Un cofre de madera con su placa de acero. La tapa gira con el mismo valor
 * que la abre en todos los nodos; la placa se enciende en ámbar cuando la llave
 * no entra, y suelta las chispas cuando el cofre abre.
 */
function ChestView({
  parts,
  lidT,
  burst,
  jam,
}: {
  readonly parts: ChestParts;
  readonly lidT: DerivedValue<{ rotate: number }[]>;
  readonly burst: SharedValue<number>;
  readonly jam: SharedValue<number> | null;
}) {
  return (
    <>
      <Path path={parts.shadow} color={SHADOW}>
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={parts.body}>
        <LinearGradient
          start={vec(0, parts.lidBottom)}
          end={vec(0, parts.bottom)}
          colors={[WOOD.light, WOOD.base, WOOD.dark]}
        />
      </Path>
      <Path path={parts.straps} color="rgba(38, 22, 10, 0.5)" />
      <Path path={parts.body} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
      {jam ? <WarnGlow path={parts.plate} level={jam} width={6} /> : null}
      <Path path={parts.plate}>
        <LinearGradient
          start={vec(0, parts.lockAt.y - 8)}
          end={vec(0, parts.lockAt.y + 8)}
          colors={[STEEL.light, STEEL.base, STEEL.dark]}
        />
      </Path>
      <Path
        path={parts.lock}
        color={ENGRAVE}
        style="stroke"
        strokeWidth={2.2}
        strokeCap="round"
        strokeJoin="round"
      />
      <Path path={parts.keyhole} color={ENGRAVE} />
      <Group origin={parts.origin} transform={lidT}>
        <Path path={parts.lid}>
          <LinearGradient
            start={vec(0, parts.top)}
            end={vec(0, parts.lidBottom)}
            colors={[WOOD.lid, WOOD.light, WOOD.base]}
          />
        </Path>
        <Path path={parts.lid} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
        <Path path={parts.shine} color="rgba(255, 255, 255, 0.4)" />
      </Group>
      <Burst x={parts.lockAt.x} y={parts.lockAt.y} r={Math.max(16, parts.w * 0.4)} burst={burst} />
    </>
  );
}

/**
 * Una pieza que el dedo puede llevar: su dibujo sigue a los mismos valores que
 * el gesto. Es la ficha neutra de las bandejas, con la llave de acero encima.
 * Crece un 30 % mientras está en la mano y rebota una vez al llegar a su casa o
 * a la cerradura: "la tenés vos" y "llegó a un lugar".
 */
function Piece({
  slot,
  box,
  art,
  metal = false,
  digits,
  origin,
  apoyos,
}: {
  readonly slot: Slot;
  readonly box: SkPath;
  readonly art?: SkPath;
  /** El dibujo es una llave de acero; si no, un símbolo en tinta. */
  readonly metal?: boolean;
  readonly digits: SkPath;
  /** El centro de la pieza en su ranura: alrededor de él gira y crece. */
  readonly origin: Spot;
  /** Donde la pieza puede quedar apoyada fuera de su ranura. */
  readonly apoyos: readonly Spot[];
}) {
  // La aguja del giro se lee una vez, fuera del worklet: adentro no puede
  // decidirse si existe, porque la decisión viajaría en la clausura del render.
  const spin = slot.spin;
  const held = slot.held;
  const ox = origin.x;
  const oy = origin.y;
  const bounds = useMemo(() => box.getBounds(), [box]);
  const cy = bounds.y + bounds.height / 2;

  /** Cuánto está en la mano, de 0 a 1. Se apaga con la pieza cuando ya se usó. */
  const lift = useDerivedValue(() => {
    if (held) return held.value;
    const dx = slot.dx.value;
    const dy = slot.dy.value;
    let lejos = Math.hypot(dx, dy) / LIFT_RAMP;
    for (const a of apoyos) lejos = Math.min(lejos, Math.hypot(ox + dx - a.x, oy + dy - a.y) / LIFT_RAMP);
    return Math.max(0, Math.min(1, lejos)) * slot.alive.value;
  }, [held, ox, oy, apoyos]);

  // El rebote de llegada: la pieza que estuvo en la mano y vuelve a apoyarse
  // late una vez con el resorte de caer. Se decide en el hilo de la interfaz.
  const alto = useSharedValue(0);
  const pop = useSharedValue(0);
  useAnimatedReaction(
    () => lift.value,
    (v) => {
      if (v > 0.5) {
        // Aire: la pieza se despegó de su lugar. Suena una vez por levantada.
        if (alto.value === 0) runOnJS(play)("lift");
        alto.value = 1;
      } else if (v < 0.04 && alto.value === 1) {
        alto.value = 0;
        pop.value = withSequence(withTiming(1, { duration: 0 }), withSpring(0, theme.spring.settle));
        // Madera: se apoyó en su casa, en la manivela o en la cerradura.
        runOnJS(play)("drop");
      }
    },
  );

  const transform = useDerivedValue(() => {
    const s = (1 + 0.3 * lift.value) * (1 + 0.14 * pop.value);
    return spin
      ? [{ translateX: slot.dx.value }, { translateY: slot.dy.value }, { rotate: spin.value }, { scale: s }]
      : [{ translateX: slot.dx.value }, { translateY: slot.dy.value }, { scale: s }];
  }, [spin]);

  return (
    <Group transform={transform} origin={origin} opacity={slot.alive}>
      <ChipBodies path={box} />
      {art && metal ? (
        <>
          <Path
            path={art}
            color="rgba(6, 12, 22, 0.6)"
            style="stroke"
            strokeWidth={5}
            strokeCap="round"
            strokeJoin="round"
          />
          <Path path={art} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round">
            <LinearGradient
              start={vec(0, cy - 14)}
              end={vec(0, cy + 8)}
              colors={[STEEL.light, STEEL.base, STEEL.dark]}
            />
          </Path>
        </>
      ) : art ? (
        <Path
          path={art}
          color={theme.color.ink}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
          strokeJoin="round"
        />
      ) : null}
      <Path path={digits} color={theme.color.ink} />
    </Group>
  );
}

/**
 * Un regreso de `explain`. El que miente vuelve un paso de más y queda del otro
 * lado del cofre, o se traba en la orilla si el cofre estaba ahí.
 */
function JudgeWalker({
  walk,
  row,
  clock,
  walker,
  elegida,
  miente,
}: {
  readonly walk: readonly number[];
  readonly row: TrackRow;
  readonly clock: SharedValue<number>;
  readonly walker: { body: SkPath; head: SkPath; shadow: SkPath };
  readonly elegida: boolean;
  readonly miente: boolean;
}) {
  const ox = row.stones[0]?.x ?? 0;
  const dx = row.step;
  const oy = row.y;
  const transform = useDerivedValue(() => {
    if (walk.length < 2) return [{ translateX: ox }, { translateY: oy }];
    const t = Math.min(0.9999, Math.max(0, clock.value)) * (walk.length - 1);
    const i = Math.floor(t);
    const f = t - i;
    const a = walk[i] ?? 0;
    const b = walk[i + 1] ?? a;
    const e = f * f * (3 - 2 * f);
    return [{ translateX: ox + dx * (a + (b - a) * e) }, { translateY: oy - Math.sin(f * Math.PI) * 10 }];
  }, [walk, ox, dx, oy]);

  const marca = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(row.from.x, row.y);
    p.lineTo(row.to.x, row.y);
    return p;
  }, [row]);

  return (
    <>
      <Path
        path={marca}
        color={miente ? theme.color.warn : theme.color.ok}
        style="stroke"
        strokeWidth={4.5}
        strokeCap="round"
        opacity={elegida ? 1 : 0}
      />
      <Group transform={transform}>
        <WalkerFigure walker={walker} look={WALKER_LOOK.accent} />
      </Group>
    </>
  );
}

// --- El encastre del nodo 9 --------------------------------------------------

/**
 * Los cofres metidos uno adentro del otro, el árbol al costado y la fila debajo.
 *
 * El objeto entero se deriva de un solo valor, `opened`: un cofre se abre cuando
 * `opened` pasa su `step`, el tesoro viaja con la parte fraccionaria y el árbol
 * se ilumina con el mismo número. Un solo hecho y no tres, que es la misma
 * decisión que en la manivela del nodo 3, donde el giro *es* la posición del
 * caminante.
 *
 * El tesoro recorre los cofres en el orden en que se abren, y por eso el mismo
 * dibujo sirve para las dos direcciones: calculando arranca en el de más
 * adentro y sube por los huecos de las tapas, y deshaciendo arranca en el de más
 * afuera y baja. La simetría no está programada dos veces, está en `step`.
 */
function NestedChests({
  problem,
  level,
  nest,
  values,
  hint,
}: {
  readonly problem: ChestProblem;
  readonly level: ChestLevel;
  readonly nest: NestLayout;
  readonly values: ChestNestValues;
  readonly hint: SharedValue<number>;
}) {
  const rings = problem.rings ?? [];
  /** Los cofres en el orden en que se abren: es por donde pasa el tesoro. */
  const orden = useMemo(() => [...rings].sort((a, b) => a.step - b.step), [rings]);

  /**
   * Por dónde pasa el tesoro. Arranca en el centro del primer cofre que se abre
   * y va parando en el hueco de la tapa de cada uno de los siguientes; el
   * último tramo lo deja afuera, a la vista.
   */
  const paradas = useMemo(() => {
    const out: Spot[] = [];
    orden.forEach((r, i) => {
      const box = nest.boxes[r.depth];
      const hole = nest.holes[r.depth];
      if (!box || !hole) return;
      out.push(i === 0 ? { x: box.x + box.w / 2, y: box.y + box.h * 0.62 } : hole);
    });
    const ultimo = orden[orden.length - 1];
    const caja = ultimo ? nest.boxes[ultimo.depth] : undefined;
    if (caja) out.push({ x: caja.x + caja.w / 2, y: caja.y - 26 });
    return out;
  }, [orden, nest]);

  const arbol = useMemo(() => {
    const p = Skia.Path.Make();
    if (level.tree !== true) return p;
    for (let i = 0; i < rings.length; i++) {
      const a = nest.tree[i];
      const hoja = nest.leaves[i];
      const b = nest.tree[i + 1];
      if (!a) continue;
      if (hoja) {
        p.moveTo(a.x, a.y);
        p.lineTo(hoja.x, hoja.y);
        p.addCircle(hoja.x, hoja.y, 4);
      }
      if (b) {
        p.moveTo(a.x, a.y);
        p.lineTo(b.x, b.y);
      }
    }
    return p;
  }, [rings.length, nest, level.tree]);

  const fila = useMemo(() => {
    const p = Skia.Path.Make();
    for (const g of problem.glyphs ?? []) addGlyphs(p, g.char, g.x, g.y, g.size);
    return p;
  }, [problem.glyphs]);

  /**
   * Los cofres que todavía están sueltos, abajo. Se dibujan del tamaño que les
   * toca en el encastre: con tres cofres el orden queda dibujado en el tamaño y
   * no hay nada que leer.
   */
  const sueltos = useMemo(() => {
    const caja = Skia.Path.Make();
    const tapa = Skia.Path.Make();
    const placa = Skia.Path.Make();
    const cerradura = Skia.Path.Make();
    const sombra = Skia.Path.Make();
    for (const r of rings) {
      if (r.placed) continue;
      const b = nest.loose[r.depth];
      if (!b) continue;
      caja.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 8, 8));
      tapa.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, 11), 5.5, 5.5));
      sombra.addOval(Skia.XYWHRect(b.x + b.w * 0.04, b.y + b.h - 4, b.w * 0.92, 9));
      const signo = OP_SIGN[r.lock];
      if (signo !== undefined) {
        const s = Math.min(b.h * 0.5, 22);
        placa.addRRect(
          Skia.RRectXY(Skia.XYWHRect(b.x + b.w / 2 - s * 0.7, b.y + b.h * 0.62 - s * 0.62, s * 1.4, s * 1.24), 5, 5),
        );
        addGlyphs(cerradura, signo, b.x + b.w / 2, b.y + b.h * 0.62, s);
      }
    }
    const bounds = caja.getBounds();
    return { caja, tapa, placa, cerradura, sombra, top: bounds.y, bottom: bounds.y + bounds.height };
  }, [rings, nest.loose]);

  /**
   * El cofre fantasma: se dibuja alrededor de un tramo de la fila y se borra.
   * Es de madera porque es un cofre: el tramo que abraza es lo que va adentro.
   */
  const fantasma = useMemo(() => {
    const p = Skia.Path.Make();
    const b = problem.ghostBox;
    if (b) p.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 10, 10));
    return p;
  }, [problem.ghostBox]);

  /** El tesoro: un cristal sin color de equipo, con su luz y su brillo. */
  const tesoro = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    cuerpo.addCircle(0, 0, 9);
    const brillo = Skia.Path.Make();
    brillo.addOval(Skia.XYWHRect(-5.5, -5.5, 5, 3));
    return { cuerpo, brillo };
  }, []);

  const { opened, vain, tree, ghost, marked } = values;

  const tesoroT = useDerivedValue(() => {
    if (paradas.length === 0) return [{ translateX: 0 }, { translateY: 0 }];
    const t = Math.max(0, Math.min(paradas.length - 1.0001, opened.value));
    const i = Math.floor(t);
    const f = t - i;
    const a = paradas[i] ?? paradas[0];
    const b = paradas[i + 1] ?? a;
    if (!a || !b) return [{ translateX: 0 }, { translateY: 0 }];
    const e = f * f * (3 - 2 * f);
    return [
      { translateX: a.x + (b.x - a.x) * e + vain.value * 4 },
      { translateY: a.y + (b.y - a.y) * e },
    ];
  }, [paradas]);

  // El hueco vacío late en ámbar mientras nadie le puso nada, y deja de latir
  // cuando el tesoro llegó. No hace falta explicarlo: se ve.
  const huecoO = useDerivedValue(() => 0.9 * hint.value * (1 - Math.min(1, opened.value)));

  return (
    <>
      {/* Los cofres. Cada uno con su tapa, que se levanta cuando le toca. */}
      {rings.map((r) => (
        <NestRing
          key={r.id}
          ring={r}
          box={nest.boxes[r.depth]}
          hole={nest.holes[r.depth]}
          opened={opened}
          vain={vain}
          hueco={huecoO}
        />
      ))}
      {/* El tesoro. Sin cofres dibujados no hay adónde subir: la fila es lo
          único que hay y el punto quedaría flotando sin nada alrededor. */}
      {rings.some((r) => r.drawn) ? (
        <Group transform={tesoroT}>
          <Path path={tesoro.cuerpo}>
            <RadialGradient c={vec(-3, -3.5)} r={13} colors={[CRYSTAL.light, CRYSTAL.base, CRYSTAL.dark]} />
          </Path>
          <Path path={tesoro.brillo} color="rgba(255, 255, 255, 0.85)" />
        </Group>
      ) : null}

      {/* El árbol al costado: el mismo encastre visto como líneas. */}
      <Path
        path={arbol}
        color="rgba(244, 247, 251, 0.55)"
        style="stroke"
        strokeWidth={2.5}
        strokeCap="round"
        strokeJoin="round"
      />
      {level.tree === true
        ? rings.map((r, i) => (
            <TreeNode
              key={`t${r.id}`}
              spot={nest.tree[i] as Spot}
              step={r.step}
              index={i}
              tree={tree}
              marked={marked}
            />
          ))
        : null}

      {/* Los cofres que todavía no entraron al encastre: de madera, como los
          puestos, con el signo grabado en su placa. */}
      <Path path={sueltos.sombra} color={SHADOW}>
        <BlurMask blur={4} style="normal" />
      </Path>
      <Path path={sueltos.caja}>
        <LinearGradient
          start={vec(0, sueltos.top)}
          end={vec(0, sueltos.bottom)}
          colors={[WOOD.light, WOOD.base, WOOD.dark]}
        />
      </Path>
      <Path path={sueltos.caja} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
      <Path path={sueltos.tapa} color={WOOD.lid} />
      <Path path={sueltos.placa}>
        <LinearGradient
          start={vec(0, sueltos.top)}
          end={vec(0, sueltos.bottom)}
          colors={[STEEL.light, STEEL.base, STEEL.dark]}
        />
      </Path>
      <Path path={sueltos.cerradura} color={ENGRAVE} />

      {/* La fila de fichas, con el cofre fantasma que aparece y se borra. */}
      <Ink path={fila} color={theme.color.ink} />
      <Group opacity={ghost}>
        <Path path={fantasma} color="rgba(217, 150, 90, 0.10)" />
        <Path path={fantasma} color={WOOD.light} style="stroke" strokeWidth={3} strokeJoin="round" />
      </Group>
    </>
  );
}

/**
 * Un cofre del encastre: el cuerpo, la tapa que se levanta cuando `opened` pasa
 * su paso, la cerradura en el borde y el hueco que espera el tesoro del de
 * adentro. Cada cofre es su propio grupo porque el nivel que arma el
 * anidamiento necesita mostrar los que todavía no están puestos como contorno
 * tenue, y eso es una decisión por cofre y no por escena.
 */
function NestRing({
  ring,
  box,
  hole,
  opened,
  vain,
  hueco,
}: {
  readonly ring: ChestRing;
  readonly box: ChestBox | undefined;
  readonly hole: Spot | undefined;
  readonly opened: SharedValue<number>;
  readonly vain: SharedValue<number>;
  readonly hueco: DerivedValue<number>;
}) {
  const geom = useMemo(() => {
    const body = Skia.Path.Make();
    const lid = Skia.Path.Make();
    const shine = Skia.Path.Make();
    const lock = Skia.Path.Make();
    const plate = Skia.Path.Make();
    const hollow = Skia.Path.Make();
    const shadow = Skia.Path.Make();
    const lockAt = { x: 0, y: 0 };
    if (!box) return { body, lid, shine, lock, plate, hollow, shadow, lockAt };
    body.addRRect(Skia.RRectXY(Skia.XYWHRect(box.x, box.y, box.w, box.h), 12, 12));
    lid.addRRect(Skia.RRectXY(Skia.XYWHRect(box.x, box.y, box.w, 14), 7, 7));
    shine.addRRect(Skia.RRectXY(Skia.XYWHRect(box.x + 7, box.y + 2.5, box.w - 14, 2.5), 1.25, 1.25));
    // La sombra que el cofre deja sobre lo que lo sostiene: sobre el piso el de
    // afuera, sobre la madera del de afuera los de adentro. Es lo que dice
    // "este está adentro de aquel" sin un solo trazo más.
    shadow.addRRect(
      Skia.RRectXY(Skia.XYWHRect(box.x + 3, box.y + box.h - 6, box.w - 6, 12), 6, 6),
    );
    const lx = box.x + box.w - 20;
    const ly = box.y + box.h - 18;
    plate.addRRect(Skia.RRectXY(Skia.XYWHRect(lx - 15, ly - 15, 30, 30), 7, 7));
    const signo = OP_SIGN[ring.lock];
    if (signo !== undefined) addGlyphs(lock, signo, lx, ly, 26);
    if (hole) hollow.addCircle(hole.x, hole.y, 9);
    return { body, lid, shine, lock, plate, hollow, shadow, lockAt: { x: lx, y: ly } };
  }, [box, hole, ring.lock]);

  const paso = ring.step;
  // La tapa se levanta con su propio tramo de `opened`, y vibra con `vain`
  // cuando la llave giró en el vacío sobre ella.
  const transform = useDerivedValue(() => {
    const abierta = Math.max(0, Math.min(1, opened.value - paso));
    return [{ rotate: -1.5 * abierta + vain.value * 0.05 }];
  }, [paso]);
  // Este cofre abrió: la operación se deshizo. Responde una vez, en su placa.
  const abre = useBurstOn(opened, paso + 0.92);
  // La llave que giró en el vacío: se enciende en ámbar la placa del cofre que
  // sí se puede abrir ahora, que es lo que el jugador tiene que mirar.
  const toca = useDerivedValue(
    () => (ring.placed && Math.round(opened.value) === paso ? Math.abs(vain.value) : 0),
    [paso, ring.placed],
  );

  if (!box || !ring.drawn) return null;
  const madera = WOOD_DEPTH[Math.min(ring.depth, WOOD_DEPTH.length - 1)] ?? WOOD_DEPTH[0];
  if (!madera) return null;
  // Los cofres que todavía no se pusieron son vidrio: el anidamiento que hay
  // que reproducir, todavía vacío. Las dos pieles están montadas siempre y se
  // cruzan por opacidad, así que poner un cofre no cambia el árbol.
  return (
    <>
      <Group opacity={ring.placed ? 0 : 1}>
        <Path path={geom.body} color={GLASS_FILL} />
        <Path path={geom.body} color="rgba(255, 255, 255, 0.22)" style="stroke" strokeWidth={1.5} />
        <Path path={geom.lock} color="rgba(244, 247, 251, 0.4)" />
      </Group>
      <Group opacity={ring.placed ? 1 : 0}>
        <Path path={geom.shadow} color={SHADOW}>
          <BlurMask blur={5} style="normal" />
        </Path>
        <Path path={geom.body}>
          <LinearGradient
            start={vec(0, box.y)}
            end={vec(0, box.y + box.h)}
            colors={[madera.light, madera.base, madera.dark]}
          />
        </Path>
        <Path path={geom.body} color="rgba(0, 0, 0, 0.38)" style="stroke" strokeWidth={2} />
        <WarnGlow path={geom.plate} level={toca} width={6} />
        <Path path={geom.plate}>
          <LinearGradient
            start={vec(0, geom.lockAt.y - 15)}
            end={vec(0, geom.lockAt.y + 15)}
            colors={[STEEL.light, STEEL.base, STEEL.dark]}
          />
        </Path>
        <Path path={geom.lock} color={ENGRAVE} />
        <Group origin={{ x: box.x, y: box.y }} transform={transform}>
          <Path path={geom.lid}>
            <LinearGradient
              start={vec(0, box.y)}
              end={vec(0, box.y + 14)}
              colors={[WOOD.lid, madera.light, madera.base]}
            />
          </Path>
          <Path path={geom.lid} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
          <Path path={geom.shine} color="rgba(255, 255, 255, 0.4)" />
        </Group>
        {/* El hueco de la tapa: oscuro, con canto, y latiendo mientras espera. */}
        <Path path={geom.hollow} color={HOLLOW} />
        <Path path={geom.hollow} color="rgba(255, 255, 255, 0.28)" style="stroke" strokeWidth={1.5} />
        <Group opacity={hueco}>
          <Path path={geom.hollow} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
        </Group>
      </Group>
      <Burst x={geom.lockAt.x} y={geom.lockAt.y} r={20} burst={abre} />
    </>
  );
}

/**
 * Un nodo del árbol. Se ilumina cuando su cofre se abre, y se marca aparte
 * cuando el jugador lo señaló: el nodo elegido fuera de la secuencia es
 * exactamente lo que el diseño pide mostrar cuando el orden se invierte.
 */
function TreeNode({
  spot,
  step,
  index,
  tree,
  marked,
}: {
  readonly spot: Spot | undefined;
  readonly step: number;
  readonly index: number;
  readonly tree: SharedValue<number>;
  readonly marked: SharedValue<number>;
}) {
  const disco = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(0, 0, 9);
    return p;
  }, []);
  const encendido = useDerivedValue(() => (tree.value > step ? 1 : 0), [step]);
  const senalado = useDerivedValue(() => (Math.round(marked.value) === index ? 1 : 0), [index]);
  if (!spot) return null;
  // Apagado, el nodo es vidrio; encendido, una esfera con luz del color del
  // recorrido. Se lee igual sobre el paisaje en los dos estados.
  return (
    <Group transform={[{ translateX: spot.x }, { translateY: spot.y }]}>
      <Path path={disco} color={GLASS_FILL} />
      <Path path={disco} color="rgba(255, 255, 255, 0.3)" style="stroke" strokeWidth={1.5} />
      <Group opacity={encendido}>
        <Path path={disco}>
          <RadialGradient
            c={vec(-3, -3.5)}
            r={13}
            colors={[WALKER_LOOK.accent.light, WALKER_LOOK.accent.base, WALKER_LOOK.accent.dark]}
          />
        </Path>
      </Group>
      <Group opacity={senalado}>
        <Path path={disco} color={theme.color.warn} style="stroke" strokeWidth={3} />
      </Group>
    </Group>
  );
}

// --- El diagrama del nodo 12 -------------------------------------------------

/**
 * El cofre con la silueta en la tapa y el diagrama vertical que lo reemplaza.
 *
 * Todo el dibujo sale de dos hechos por flecha —qué cerradura tiene y qué llave
 * se le probó— y de uno por panel: si lo que salió encajó en la silueta. Nada
 * más hace falta, porque las tres cosas que el nodo separa son exactamente esas
 * tres: la llave no entra, la llave entra y devuelve otra cosa, la llave entra y
 * devuelve lo que había.
 *
 * La silueta hueca es la pieza que hace posible jugar sin leer: dice si el
 * objeto volvió sin pedir que nadie compare dos números.
 */
function KeyDiagram({
  problem,
  layout,
  open,
  outArrow,
  backArrow,
  leftover,
  jam,
  hint,
  clock,
  picked,
}: {
  readonly problem: ChestProblem;
  readonly layout: DiagramLayout;
  readonly open: SharedValue<number>;
  readonly outArrow: SharedValue<number>;
  readonly backArrow: SharedValue<number>;
  readonly leftover: SharedValue<number>;
  readonly jam: SharedValue<number>;
  readonly hint: SharedValue<number>;
  readonly clock: SharedValue<number>;
  readonly picked: number;
}) {
  const diagram = problem.diagram;
  const panels = diagram?.panels ?? [];
  const skin = diagram?.skin ?? "chest";
  const labeled = diagram?.labeled ?? false;
  const numerals = diagram?.numerals ?? false;
  const conCofre = skin !== "arrows";
  const conFlechas = skin !== "chest";
  /** Dos paneles es `explain`: los dos regresos corren solos, en bucle. */
  const comparando = panels.length > 1;

  const geom = useMemo(() => {
    const body = Skia.Path.Make();
    const lid = Skia.Path.Make();
    const lock = Skia.Path.Make();
    const hollow = Skia.Path.Make();
    const down = Skia.Path.Make();
    const downChip = Skia.Path.Make();
    const up = Skia.Path.Make();
    const upChip = Skia.Path.Make();
    const stuck = Skia.Path.Make();
    const ends = Skia.Path.Make();
    const reveal = Skia.Path.Make();
    const plates = Skia.Path.Make();
    const shadow = Skia.Path.Make();
    const gem = buildGem(9);

    panels.forEach((panel, i) => {
      const l = layout.panels[i];
      if (!l) return;

      if (conCofre) {
        body.addRRect(Skia.RRectXY(Skia.XYWHRect(l.chest.x, l.chest.y, l.chest.w, l.chest.h), 10, 10));
        lid.addRRect(Skia.RRectXY(Skia.XYWHRect(l.chest.x, l.chest.y, l.chest.w, 14), 6, 6));
        // La silueta: el hueco con la forma de lo que entró, en el borde de la
        // tapa. Es la verificación del nodo, y no dice ningún número.
        const silueta = buildGem(10);
        silueta.transform([1, 0, l.hole.x, 0, 1, l.hole.y, 0, 0, 1]);
        hollow.addPath(silueta);
        shadow.addOval(
          Skia.XYWHRect(l.chest.x - l.chest.w * 0.04, l.chest.y + l.chest.h - 4, l.chest.w * 1.08, 10),
        );
        const primera = panel.arrows[0];
        if (primera) {
          const cx = l.chest.x + l.chest.w / 2;
          const cy = l.chest.y + l.chest.h * 0.42;
          const s = Math.min(l.chest.w * 0.3, 24);
          lockFace(lock, primera.lock, primera.count, cx, cy, s, labeled);
          // La placa de acero donde la cerradura está grabada: abraza el signo
          // y, según la capa, el número escrito o sus puntitos.
          const paso = Math.min(s * 0.26, 7);
          const puntos = Math.min(Math.max(primera.count, 0), 9);
          const cifras = String(primera.count).length;
          const medioPuntos = labeled ? 0 : ((puntos - 1) * paso) / 2 + 6;
          const x0 = Math.min(cx - s * 0.45 - 5, cx - medioPuntos);
          const x1 = Math.max(labeled ? cx + s * 0.62 + s * 0.22 * cifras + 6 : cx + s * 0.45 + 5, cx + medioPuntos);
          const y0 = cy - s * 0.62;
          const y1 = labeled ? cy + s * 0.45 : cy + s * 0.62 + paso * 0.5 + 5;
          plates.addRRect(Skia.RRectXY(Skia.XYWHRect(x0, y0, x1 - x0, y1 - y0), 6, 6));
        }
      }

      if (conFlechas) {
        panel.arrows.forEach((a, j) => {
          const desde = l.nodes[j];
          const hasta = l.nodes[j + 1];
          const medioBaja = l.down[j];
          const medioSube = l.up[j];
          if (!desde || !hasta || !medioBaja || !medioSube) return;
          vArrow(down, medioBaja.x, desde.y + 14, hasta.y - 14, 8);
          lockFace(downChip, a.lock, a.count, medioBaja.x - 22, medioBaja.y, 17, labeled);
          if (!a.key) return;
          if (a.closed) {
            // La vuelta cerrada: la misma flecha reproducida hacia atrás.
            vArrow(up, medioSube.x, hasta.y - 14, desde.y + 14, 8);
            lockFace(upChip, a.key.kind, a.key.count, medioSube.x + 22, medioSube.y, 17, labeled);
          } else {
            // La llave que gira un cuarto de vuelta y se traba: la flecha
            // arranca y no llega.
            vArrow(stuck, medioSube.x, hasta.y - 14, medioSube.y + 10, 8);
            lockFace(stuck, a.key.kind, a.key.count, medioSube.x + 22, medioSube.y, 17, labeled);
          }
        });

        // Los extremos. Con numerales son números; sin ellos, el objeto.
        panel.values.forEach((v, j) => {
          const spot = l.nodes[j];
          if (!spot) return;
          if (numerals) {
            numeral(ends, v, spot.x, spot.y, 26);
          } else {
            const copia = gem.copy();
            copia.transform([1, 0, spot.x, 0, 1, spot.y, 0, 0, 1]);
            ends.addPath(copia);
          }
        });
      }

      // La silueta hueca de la llave que sí entra, revelada sin nombrarla.
      if (panel.reveal) {
        lockFace(
          reveal,
          panel.reveal,
          panel.arrows[0]?.count ?? 0,
          l.chest.x + l.chest.w / 2,
          l.chest.y + l.chest.h + 22,
          18,
          labeled,
        );
      }
    });

    return { body, lid, lock, plates, shadow, hollow, down, downChip, up, upChip, stuck, ends, reveal };
  }, [panels, layout.panels, conCofre, conFlechas, labeled, numerals]);

  /** La llave que se arma, con sus dos ranuras. */
  const slots = useMemo(() => {
    const caja = Skia.Path.Make();
    const huecos = Skia.Path.Make();
    const puesto = Skia.Path.Make();
    const s = diagram?.slots;
    if (!s) return { caja, huecos, puesto };
    const b = layout.blank;
    caja.addRRect(Skia.RRectXY(Skia.XYWHRect(b.x, b.y, b.w, b.h), 10, 10));
    // El anillo de la llave, para que el cuerpo se lea como una llave y no como
    // una barra con dos casillas.
    caja.addCircle(b.x + 15, b.y + b.h / 2, 9);
    for (const spot of [layout.opSlot, layout.countSlot]) {
      huecos.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(
            spot.x - layout.slotW / 2,
            spot.y - layout.slotH / 2,
            layout.slotW,
            layout.slotH,
          ),
          8,
          8,
        ),
      );
    }
    if (s.kind) {
      const signo = OP_SIGN[s.kind];
      if (signo !== undefined) addGlyphs(puesto, signo, layout.opSlot.x, layout.opSlot.y, 26);
    }
    if (s.count !== null) numeral(puesto, s.count, layout.countSlot.x, layout.countSlot.y, 26);
    return { caja, huecos, puesto };
  }, [diagram?.slots, layout]);

  // La tapa se levanta con el mismo valor que abre el cofre en los otros nodos.
  const lidT = useDerivedValue(() => [{ rotate: -1.5 * open.value + jam.value * 0.06 }]);
  const primerCofre = layout.panels[0]?.chest;
  const origen = useMemo(
    () => ({ x: primerCofre?.x ?? 0, y: primerCofre?.y ?? 0 }),
    [primerCofre?.x, primerCofre?.y],
  );
  /**
   * El panel se resolvió: la vuelta cerró y lo que salió encajó en la silueta.
   * Es el evento del nodo y responde una sola vez, en la silueta, cuando el
   * objeto termina de llegar. En `explain` los regresos corren en bucle y no
   * hay chispa: una chispa que se repite para mirar es confeti.
   */
  const primero = panels[0];
  const resuelto =
    !comparando &&
    primero !== undefined &&
    primero.fits &&
    primero.arrows.length > 0 &&
    primero.arrows.every((a) => a.closed);
  // Lo que volvió coincide con su silueta: vidrio, no cerradura.
  const vuelve = useBurstWhen(resuelto, theme.motion.morph * 0.85, "join");
  const destino = layout.panels[0]?.gemTo ?? { x: 0, y: 0 };
  const encaja = !comparando && primero?.fits === true;
  // La silueta late en ámbar mientras la guía espera el gesto, y se enciende en
  // menta cuando lo que volvió encajó: el objeto lo dice sin ningún número.
  const esperaO = useDerivedValue(
    () => (resuelto ? 0 : 0.9 * hint.value * (1 - Math.min(1, open.value))),
    [resuelto],
  );
  const encajaO = useDerivedValue(
    () => (!encaja ? 0 : resuelto ? 1 : Math.min(1, open.value)),
    [encaja, resuelto],
  );
  const revelO = useDerivedValue(() => 0.45 + 0.45 * hint.value);
  const cofreY = primerCofre?.y ?? 0;
  const cofreH = primerCofre?.h ?? 0;

  return (
    <>
      {conCofre ? (
        <>
          {/* El cofre fantasma es el mismo cofre, a media luz: el diagrama ya
              manda y el cofre queda al costado para acordarse de qué era. */}
          <Group opacity={skin === "ghost" ? 0.55 : 1}>
            <Path path={geom.shadow} color={SHADOW}>
              <BlurMask blur={5} style="normal" />
            </Path>
            <Path path={geom.body}>
              <LinearGradient
                start={vec(0, cofreY + 14)}
                end={vec(0, cofreY + cofreH)}
                colors={[WOOD.light, WOOD.base, WOOD.dark]}
              />
            </Path>
            <Path path={geom.body} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
            {/* La llave que no entra: la placa se enciende en ámbar. */}
            <WarnGlow path={geom.plates} level={jam} width={6} />
            <Path path={geom.plates}>
              <LinearGradient
                start={vec(0, cofreY + cofreH * 0.2)}
                end={vec(0, cofreY + cofreH * 0.8)}
                colors={[STEEL.light, STEEL.base, STEEL.dark]}
              />
            </Path>
            <Path path={geom.lock} color={ENGRAVE} />
            <Group origin={origen} transform={lidT}>
              <Path path={geom.lid}>
                <LinearGradient
                  start={vec(0, cofreY)}
                  end={vec(0, cofreY + 14)}
                  colors={[WOOD.lid, WOOD.light, WOOD.base]}
                />
              </Path>
              <Path path={geom.lid} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
            </Group>
          </Group>
          {/* La silueta, a plena luz también en el fantasma: es la verificación. */}
          <Path path={geom.hollow} color={HOLLOW} />
          <Path path={geom.hollow} color="rgba(255, 255, 255, 0.3)" style="stroke" strokeWidth={1.5} />
          <Group opacity={esperaO}>
            <Path path={geom.hollow} color={theme.color.warn} style="stroke" strokeWidth={2.5} />
          </Group>
          <Group opacity={encajaO}>
            <Path path={geom.hollow} color={theme.color.ok} style="stroke" strokeWidth={2.5} />
          </Group>
        </>
      ) : null}

      {/* Las dos flechas. La de ida siempre está; la de vuelta, cuando se probó.
          La ida es tinta; la vuelta que cerró es menta, porque coincide; la que
          se trabó es ámbar, porque pide que la miren. */}
      <Group opacity={outArrow}>
        <Path
          path={geom.down}
          color="rgba(244, 247, 251, 0.75)"
          style="stroke"
          strokeWidth={3.5}
          strokeCap="round"
          strokeJoin="round"
        />
        <Ink path={geom.downChip} color={theme.color.ink} />
      </Group>
      <Group opacity={backArrow}>
        <Path
          path={geom.up}
          color={theme.color.ok}
          style="stroke"
          strokeWidth={3.5}
          strokeCap="round"
          strokeJoin="round"
        />
        <Ink path={geom.upChip} color={theme.color.ok} />
      </Group>
      <Group opacity={leftover}>
        <Path
          path={geom.stuck}
          color={theme.color.warn}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
          strokeJoin="round"
        />
      </Group>
      <Ink path={geom.ends} color={theme.color.ink} />
      {/* La llave que sí entra, revelada sin nombrarla: es la guía, en dorado. */}
      <Group opacity={revelO}>
        <Path path={geom.reveal} color={theme.color.gold} style="stroke" strokeWidth={2} />
      </Group>
      <Burst x={destino.x} y={destino.y} r={20} burst={vuelve} />

      {/* El objeto que vuelve, uno por panel. */}
      {panels.map((panel, i) => (
        <KeyGem
          key={`g${i}`}
          from={layout.panels[i]?.gemFrom}
          to={layout.panels[i]?.gemTo}
          closed={panel.arrows.some((a) => a.closed)}
          fits={panel.fits}
          t={comparando ? clock : open}
          marcado={comparando && picked === i}
        />
      ))}

      {/* La llave que se arma: el cuerpo de acero con sus dos ranuras hundidas,
          y lo que ya se puso, en tinta sobre el hueco. */}
      {diagram?.slots ? (
        <>
          <Path path={slots.caja}>
            <LinearGradient
              start={vec(0, layout.blank.y)}
              end={vec(0, layout.blank.y + layout.blank.h)}
              colors={[STEEL.light, STEEL.base, STEEL.dark]}
            />
          </Path>
          <Path path={slots.caja} color="rgba(0, 0, 0, 0.35)" style="stroke" strokeWidth={1.5} />
          <Path path={slots.huecos} color={PLATE} />
          <Path path={slots.huecos} color="rgba(255, 255, 255, 0.3)" style="stroke" strokeWidth={1.5} />
          <Path path={slots.puesto} color={theme.color.ink} />
        </>
      ) : null}
    </>
  );
}

/**
 * El objeto que sale del cofre y busca su silueta.
 *
 * Los tres desenlaces del nodo están en un solo recorrido: con la llave que no
 * entra el objeto se asoma y vuelve, con la que entra y no devuelve llega hasta
 * arriba y queda flotando al lado del hueco, y con la que devuelve encaja. Nada
 * de eso dice "mal": el objeto se resiste y se ve por qué.
 */
function KeyGem({
  from,
  to,
  closed,
  fits,
  t,
  marcado,
}: {
  readonly from: Spot | undefined;
  readonly to: Spot | undefined;
  readonly closed: boolean;
  readonly fits: boolean;
  readonly t: SharedValue<number>;
  readonly marcado: boolean;
}) {
  const gem = useMemo(() => buildGem(9), []);
  const shine = useMemo(() => {
    const p = Skia.Path.Make();
    p.addOval(Skia.XYWHRect(-4.2, -5.5, 3.4, 2.6));
    return p;
  }, []);
  const look = fits ? GEM_OK : GEM_WARN;
  const ax = from?.x ?? 0;
  const ay = from?.y ?? 0;
  const bx = to?.x ?? 0;
  const by = to?.y ?? 0;
  const desvio = fits ? 0 : 26;
  const transform = useDerivedValue(() => {
    const raw = Math.max(0, Math.min(1, t.value));
    // La llave que no entra: el objeto se asoma y vuelve solo.
    const u = closed ? raw * raw * (3 - 2 * raw) : Math.sin(raw * Math.PI) * 0.18;
    return [
      { translateX: ax + (bx + desvio - ax) * u },
      { translateY: ay + (by - ay) * u },
    ];
  }, [ax, ay, bx, by, closed, desvio]);
  if (!from || !to) return null;
  return (
    <Group transform={transform}>
      <Path path={gem}>
        <RadialGradient c={vec(-2.5, -3.5)} r={13} colors={[look.light, look.base, look.dark]} />
      </Path>
      <Path path={shine} color="rgba(255, 255, 255, 0.65)" />
      {/* El que el jugador eligió en `explain`: un contorno de tinta, sin color
          que diga si acertó; eso lo dice el marco del panel. */}
      {marcado ? (
        <Path path={gem} color={theme.color.ink} style="stroke" strokeWidth={2.5} strokeJoin="round" />
      ) : null}
    </Group>
  );
}
