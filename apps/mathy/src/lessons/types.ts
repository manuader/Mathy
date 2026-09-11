/**
 * La lección de un nivel: qué idea enseña, qué hay que hacer, la guía paso a
 * paso y la llave que deja en la chuleta.
 *
 * Acá no hay texto, solo claves del diccionario, igual que en los paquetes de
 * modelo. Un nivel sin lección se juega igual: lo único que pierde es la
 * tarjeta de entrada y la llave.
 */

/** Los dibujos de llaves que trae `ui/KeyGlyph.tsx`. Cuentan la idea sin palabras. */
export type KeyGlyphName = "pair" | "plusOne" | "shuffle" | "travel" | "oneByOne" | "sameCount";

/** [x, y, radio, resaltado] sobre una caja de 40 × 40. */
export type KeyDot = readonly [number, number, number, boolean?];
/** [x, y, ancho, alto] sobre la misma caja. */
export type KeyBar = readonly [number, number, number, number];

/**
 * Un dibujo de llave, como dato: puntos, barras y a lo sumo una tarjeta con un
 * numeral. Una lección que necesita un dibujo nuevo lo exporta en `glyphs` de
 * su módulo, sin tocar `ui/KeyGlyph.tsx`.
 */
export interface KeyDrawing {
  readonly dots: readonly KeyDot[];
  readonly bars?: readonly KeyBar[];
  /** Una tarjeta con un numeral: el número que viaja. */
  readonly card?: string;
}

/**
 * Una llave: una idea corta que el jugador ya probó con las manos. Se guarda en
 * la chuleta al superar el nivel y vuelve a servir para resolver los que siguen.
 */
export interface KeySpec {
  /** Permanente: la chuleta y las lecciones que la usan la nombran por acá. */
  readonly id: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  /** Un dibujo base (`KeyGlyphName`) o uno que el módulo de la lección exporta en `glyphs`. */
  readonly glyph: string;
}

/**
 * Un paso de la guía. `tap` avanza con el botón; `signal` avanza solo cuando la
 * actividad avisa que el jugador hizo el gesto. Es lo que vuelve la guía
 * interactiva: no se lee cómo se juega, se juega con alguien al lado.
 */
export interface CoachStep {
  /** La actividad lo usa para saber qué señalar en el tablero. */
  readonly id: string;
  readonly textKey: string;
  readonly advance: "tap" | { readonly signal: string };
  /**
   * Mientras este paso está a la vista, la ronda no se cierra. Es para el paso
   * que explica lo que acaba de pasar: si la ronda siguiente arrancara debajo,
   * el jugador leería la explicación sobre un tablero que ya no es el suyo.
   */
  readonly holds?: boolean;
}

export interface LevelLesson {
  readonly level: number;
  /** Qué idea enseña el nivel, en una o dos frases. */
  readonly whyKey: string;
  /** Qué hay que hacer para superarlo, en una frase. Queda a la vista mientras se juega. */
  readonly goalKey: string;
  readonly coach: readonly CoachStep[];
  readonly key: KeySpec;
  /** Ids de llaves anteriores que resuelven este nivel. */
  readonly uses: readonly string[];
}

export interface NodeLesson {
  readonly node: string;
  /** Lo que el concepto entero deja, para la tarjeta de cierre del último nivel. */
  readonly learnedKey: string;
  readonly levels: readonly LevelLesson[];
}

/**
 * Todo lo de un nodo en un archivo: la lección, sus textos y sus dibujos de
 * llaves. Así cada nodo se escribe sin tocar `i18n.ts` ni `ui/KeyGlyph.tsx`, y
 * varios se pueden escribir a la vez. `t()` busca en `texts` después del
 * diccionario.
 */
export interface LessonModule {
  readonly lesson: NodeLesson;
  readonly texts: Readonly<Record<string, string>>;
  readonly glyphs?: Readonly<Record<string, KeyDrawing>>;
}
