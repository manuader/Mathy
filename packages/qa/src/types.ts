/**
 * El puerto de decisión, y nada más.
 *
 * Una pregunta con respuestas posibles definidas de antemano la puede contestar
 * una regla local, un modelo de decisión (Jev) o un LLM. El linter no sabe
 * cuál: pide juicios y recibe valores tipados con su probabilidad. Así la
 * comparación entre los tres es una línea de configuración y no una reescritura,
 * y el día que un proveedor desaparezca se cambia un archivo.
 *
 * La probabilidad no decide sola: quien decide es la política de `report.ts`.
 */

/** Sí o no, con la probabilidad de que sea sí. No lleva confianza aparte. */
export interface Noul {
  readonly value: boolean;
  readonly p: number;
}

/** Una opción de una lista cerrada, con cuánto se concentró la distribución. */
export interface Choice<T extends string = string> {
  readonly value: T;
  readonly p: number;
}

/** Una posición en una escala descripta por niveles concretos. */
export interface Score {
  readonly value: number;
  readonly p: number;
}

export type Answer = Noul | Choice | Score;

export type Question =
  | {
      readonly kind: "noul";
      readonly instructions: string;
      /** Qué significa cada lado. Sin esto, un Noul contesta con la definición que se imagine. */
      readonly criteria?: { readonly true: string; readonly false: string };
    }
  | { readonly kind: "choice"; readonly instructions: string; readonly options: Readonly<Record<string, string>> }
  | { readonly kind: "score"; readonly instructions: string; readonly levels: readonly string[] };

export type QuestionSet = Readonly<Record<string, Question>>;
export type Answers = Readonly<Record<string, Answer>>;

/**
 * Quien contesta. `rules` no usa red ni plata y es la primera línea; `jev` y
 * `llm` existen para lo que una regla no puede juzgar, y para poder medir uno
 * contra otro sobre el mismo corpus.
 */
export interface Decider {
  readonly name: "rules" | "jev" | "llm";
  /** El estado se manda como objeto: la documentación de Jev pide campos con nombre. */
  ask(state: Readonly<Record<string, unknown>>, questions: QuestionSet): Promise<Answers>;
}

/** Un texto visible del juego con el contexto que hace falta para juzgarlo. */
export interface Entry {
  readonly key: string;
  readonly text: string;
  readonly node: string;
  readonly level: number | null;
  /** Qué es el texto, según dónde está declarado: no lo adivina nadie. */
  readonly role: "por_que" | "objetivo" | "paso_de_guia" | "llave_titulo" | "llave_cuerpo" | "concepto" | "mensaje";
  /** Las escenas del nodo: doce de los veintiún nodos usan más de una. */
  readonly scenes: readonly string[];
}

/** Lo que el linter encontró en un texto. */
export interface Finding {
  readonly key: string;
  readonly text: string;
  readonly rule: string;
  readonly severity: "error" | "aviso";
  readonly why: string;
  readonly p: number;
  readonly source: "rules" | "jev" | "llm";
}
