/**
 * La lección de un nivel: qué idea enseña, qué hay que hacer, la guía paso a
 * paso y la llave que deja en la chuleta.
 *
 * Acá no hay texto, solo claves del diccionario, igual que en los paquetes de
 * modelo. Un nivel sin lección se juega igual: lo único que pierde es la
 * tarjeta de entrada y la llave.
 */

/** Los dibujos de las llaves. Cuentan la idea sin palabras. */
export type KeyGlyphName = "pair" | "plusOne" | "shuffle" | "travel" | "oneByOne" | "sameCount";

/**
 * Una llave: una idea corta que el jugador ya probó con las manos. Se guarda en
 * la chuleta al superar el nivel y vuelve a servir para resolver los que siguen.
 */
export interface KeySpec {
  /** Permanente: la chuleta y las lecciones que la usan la nombran por acá. */
  readonly id: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly glyph: KeyGlyphName;
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
