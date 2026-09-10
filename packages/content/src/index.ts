/**
 * El contenido del juego, compilado desde `docs/`.
 *
 * Dos herramientas del jugador viven acá: la cheatsheet, que recuerda, y la
 * calculadora, que ejecuta. Las dos crecen con los mismos nodos del grafo y
 * ninguna se revoca nunca. Este paquete solo trae los datos y las reglas de
 * desbloqueo; dibujar es cosa de la app.
 *
 * El alcance compilado es el de `scope.json`: hoy, `alg.eq.one_step` y sus
 * prerequisitos. Ver el README para ampliarlo.
 */

import cheatsheetData from "./cheatsheet.json" with { type: "json" };
import calculatorData from "./calculator.json" with { type: "json" };
import scopeData from "./scope.json" with { type: "json" };

// --- Cheatsheet -------------------------------------------------------------

/** Los seis tipos de entrada de R0. */
export type EntryKind = "formula" | "rule" | "definition" | "theorem" | "strategy" | "example";

/**
 * Cómo se muestra una entrada. `image` es la versión sin lectura: la entrada se
 * sostiene entera con una ilustración y la voz.
 */
export type DisplayForm = "text" | "image" | "formula";

/** Cuánta lectura hace falta para aprovechar la entrada sin ayuda. */
export type LiteracyLevel = "none" | "icons" | "short_text" | "full_text";

export interface CheatsheetTopic {
  readonly id: string;
  /** Posición dentro del padre. */
  readonly order: number;
  readonly parent: string | null;
  readonly name: string;
}

export interface CheatsheetEntry {
  readonly id: string;
  readonly topic: string;
  readonly kind: EntryKind;
  /** Los nodos que agregan la entrada; alcanza con haber alcanzado uno. */
  readonly addedBy: readonly string[];
  readonly addedAtLayer: "symbolic" | "formal";
  readonly displayForm: DisplayForm;
  /** El asset de la ilustración, solo con `displayForm: "image"`. */
  readonly asset: string;
  /** La fórmula abstracta, solo con `displayForm: "formula"`. */
  readonly latex: string;
  readonly related: readonly string[];
  /** El nodo al que vuelve "volver a jugar esto". */
  readonly playAgain: string;
  readonly literacyMin: LiteracyLevel;
  readonly localeDependent: boolean;
  readonly title: string;
  readonly body: string;
}

// --- Calculadora ------------------------------------------------------------

export type OpKind =
  | "arithmetic"
  | "algebraic"
  | "function"
  | "symbolic"
  | "numeric"
  | "structural"
  | "logical"
  | "statistical";

export type OpInputKind =
  | "number"
  | "expression"
  | "function"
  | "matrix"
  | "vector"
  | "set"
  | "graph"
  | "distribution";

export interface CalculatorOp {
  readonly id: string;
  readonly tier: string;
  /** `any_ready`: alcanza con que uno de estos nodos esté listo. */
  readonly unlockedBy: readonly string[];
  readonly kind: OpKind;
  readonly inputKind: OpInputKind;
  /** Forma abstracta; la notación final la decide el MathLocale. */
  readonly display: string;
  readonly localeDependent: boolean;
  readonly sandbox: boolean;
  readonly label: string;
  readonly hint: string;
}

/** Un candado y la llave que lo deshace. */
export interface OpPair {
  readonly lock: string;
  readonly key: string;
}

export interface CalculatorTier {
  readonly id: string;
  readonly order: number;
  /** Cada candado con su llave inversa: `op_mul` con `op_div`. */
  readonly pairs: readonly OpPair[];
}

// --- Los datos --------------------------------------------------------------

interface CheatsheetContent {
  readonly topics: readonly CheatsheetTopic[];
  readonly entries: readonly CheatsheetEntry[];
}

interface CalculatorContent {
  readonly unlockRule: string;
  readonly neverRevoked: boolean;
  readonly rustWhen: string;
  readonly tiers: readonly CalculatorTier[];
  readonly ops: readonly CalculatorOp[];
}

// El JSON viene del compilador, que ya validó los enums contra los YAML de
// diseño; acá solo se les pone el nombre que TypeScript no puede inferir.
const cheatsheet = cheatsheetData as CheatsheetContent;
const calculator = calculatorData as CalculatorContent;

export const cheatsheetTopics: readonly CheatsheetTopic[] = cheatsheet.topics;
export const cheatsheetEntries: readonly CheatsheetEntry[] = cheatsheet.entries;
export const calculatorTiers: readonly CalculatorTier[] = calculator.tiers;
export const calculatorOps: readonly CalculatorOp[] = calculator.ops;

/** Los nodos del grafo que este build compiló, y las raíces de las que salen. */
export const contentScope: { readonly roots: readonly string[]; readonly nodes: readonly string[] } =
  scopeData;

// --- Desbloqueo -------------------------------------------------------------

/**
 * Una entrada existe apenas el jugador alcanzó cualquiera de sus nodos. No hay
 * caso contrario: una vez que existe, no se bloquea ni se revoca.
 */
export function isEntryUnlocked(
  entry: CheatsheetEntry,
  reachedNodes: ReadonlySet<string>,
): boolean {
  return entry.addedBy.some((node) => reachedNodes.has(node));
}

export function unlockedEntries(reachedNodes: ReadonlySet<string>): readonly CheatsheetEntry[] {
  return cheatsheetEntries.filter((entry) => isEntryUnlocked(entry, reachedNodes));
}

/** `unlock_rule: any_ready`, y `never_revoked: true`. */
export function isOpUnlocked(op: CalculatorOp, readyNodes: ReadonlySet<string>): boolean {
  return op.unlockedBy.some((node) => readyNodes.has(node));
}

// --- Consultas --------------------------------------------------------------

export function findEntry(id: string): CheatsheetEntry | undefined {
  return cheatsheetEntries.find((entry) => entry.id === id);
}

export function findOp(id: string): CalculatorOp | undefined {
  return calculatorOps.find((op) => op.id === id);
}

/**
 * La búsqueda filtra por título y no por cuerpo, para que el resultado sea
 * inmediato y no dependa de una palabra suelta en medio de una frase larga.
 */
export function searchEntries(
  entries: readonly CheatsheetEntry[],
  query: string,
): readonly CheatsheetEntry[] {
  const needle = fold(query);
  if (needle.length === 0) return entries;
  return entries.filter((entry) => fold(entry.title).includes(needle));
}

/** Sin acentos y en minúsculas: nadie escribe "razón" con tilde en un buscador. */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export interface TopicNode {
  readonly topic: CheatsheetTopic;
  readonly children: readonly TopicNode[];
  readonly entries: readonly CheatsheetEntry[];
}

/**
 * El árbol tema → entradas, podado: un tema sin entradas propias ni hijas no
 * aparece. Así la cheatsheet de un jugador nuevo no es un índice vacío.
 */
export function topicTree(entries: readonly CheatsheetEntry[]): readonly TopicNode[] {
  const byId = new Map(cheatsheetTopics.map((topic) => [topic.id, topic]));
  const build = (parent: string | null): TopicNode[] => {
    const nodes: TopicNode[] = [];
    for (const topic of cheatsheetTopics) {
      if (topic.parent !== parent) continue;
      const own = entries
        .filter((entry) => entry.topic === topic.id)
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title, "es"));
      const children = build(topic.id);
      if (own.length === 0 && children.length === 0) continue;
      nodes.push({ topic, children, entries: own });
    }
    return nodes.sort((a, b) => a.topic.order - b.topic.order);
  };
  // Una entrada colgada de un tema que no se compiló sería un agujero mudo.
  for (const entry of entries) {
    if (!byId.has(entry.topic)) throw new Error(`${entry.id}: tema desconocido ${entry.topic}`);
  }
  return build(null);
}

/**
 * La llave inversa de una operación, si el diseño le declaró una.
 *
 * Toda transformación reversible tiene una llave, y la llave es otra
 * transformación: la calculadora las dibuja al lado aunque la segunda todavía
 * sea silueta.
 */
export function inverseOf(opId: string): string | undefined {
  for (const tier of calculatorTiers) {
    for (const pair of tier.pairs) {
      if (pair.lock === opId) return pair.key;
      if (pair.key === opId) return pair.lock;
    }
  }
  return undefined;
}

/** Las operaciones de un tier, con los pares primero y en su orden. */
export function opsOfTier(tier: CalculatorTier): readonly CalculatorOp[] {
  const paired = new Set(tier.pairs.flatMap((pair) => [pair.lock, pair.key]));
  const ordered: CalculatorOp[] = [];
  for (const pair of tier.pairs) {
    const lock = findOp(pair.lock);
    const key = findOp(pair.key);
    if (lock) ordered.push(lock);
    if (key) ordered.push(key);
  }
  for (const op of calculatorOps) {
    if (op.tier === tier.id && !paired.has(op.id)) ordered.push(op);
  }
  return ordered;
}
