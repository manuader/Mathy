/**
 * El compilador de contenido.
 *
 * Los YAML de `docs/` son la fuente de verdad del diseño y nadie los edita
 * desde el código. El problema es que la app no puede leerlos: son grandes, no
 * están tipados y necesitarían un parser de YAML en runtime. Así que se
 * compilan acá, en build time, igual que el atlas de `@mathy/glyphs`, y la app
 * importa JSON.
 *
 * PARA AMPLIAR EL ALCANCE: agregá el nodo a `ROOT_NODES`. El compilador toma la
 * clausura de prerequisitos de esas raíces y se queda con las entradas y las
 * operaciones que esos nodos declaran. Mientras el juego tenga un solo
 * minijuego no tiene sentido cargar las 527 entradas ni las 118 operaciones.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

/** Las raíces del alcance: lo que el juego tiene hoy. */
const ROOT_NODES: readonly string[] = ["alg.eq.one_step"];

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..", "..");
const docs = join(repo, "docs");
const out = join(here, "..", "src");

// --- Lo que se lee de los YAML ----------------------------------------------

interface GraphNode {
  readonly id: string;
  readonly prereqs?: readonly string[];
}

interface RawEntry {
  readonly id: string;
  readonly topic: string;
  readonly kind: string;
  readonly added_by: readonly string[];
  readonly added_at_layer: string;
  readonly display: string;
  readonly related?: readonly string[];
  readonly play_again: string;
  readonly literacy_min: string;
  readonly locale_dependent?: boolean;
}

interface RawTopic {
  readonly order: number;
  readonly parent?: string;
}

interface RawOp {
  readonly id: string;
  readonly tier: string;
  readonly unlocked_by: readonly string[];
  readonly kind: string;
  readonly input_kind: string;
  readonly display: string;
  readonly locale_dependent?: boolean;
  readonly sandbox?: boolean;
}

interface RawTier {
  readonly id: string;
  readonly order: number;
  readonly pairs?: readonly (readonly [string, string])[];
}

function read<T>(path: string): T {
  return parse(readFileSync(path, "utf8")) as T;
}

// --- La clausura de prerequisitos -------------------------------------------

function loadGraph(): Map<string, GraphNode> {
  const dir = join(docs, "C-knowledge-graph", "graph");
  const nodes = new Map<string, GraphNode>();
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".yaml")) continue;
    const doc = read<{ nodes?: readonly GraphNode[] }>(join(dir, file));
    for (const node of doc.nodes ?? []) {
      if (nodes.has(node.id)) throw new Error(`nodo repetido en el grafo: ${node.id}`);
      nodes.set(node.id, node);
    }
  }
  return nodes;
}

function closure(graph: Map<string, GraphNode>, roots: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const pending = [...roots];
  while (pending.length > 0) {
    const id = pending.pop()!;
    if (seen.has(id)) continue;
    const node = graph.get(id);
    if (!node) throw new Error(`${id} no existe en docs/C-knowledge-graph/graph`);
    seen.add(id);
    for (const prereq of node.prereqs ?? []) pending.push(prereq);
  }
  return seen;
}

// --- Cheatsheet -------------------------------------------------------------

/** `display` viene como "text", "image:<asset>" o una fórmula en LaTeX. */
function splitDisplay(display: string): { form: string; asset: string; latex: string } {
  if (display === "text") return { form: "text", asset: "", latex: "" };
  if (display.startsWith("image:")) {
    return { form: "image", asset: display.slice("image:".length), latex: "" };
  }
  return { form: "formula", asset: "", latex: display };
}

function compileCheatsheet(scope: ReadonlySet<string>): unknown {
  const data = read<{ topics: Record<string, RawTopic>; entries: readonly RawEntry[] }>(
    join(docs, "R-cheatsheet", "cheatsheet_entries.yaml"),
  );
  const locale = read<{
    topics: Record<string, { name: string }>;
    cheatsheet: Record<string, { title: string; body: string }>;
  }>(join(docs, "locales", "es", "cheatsheet.yaml"));

  // Una entrada entra si alguno de sus nodos está en el alcance: es la misma
  // regla `any` con la que la entrada nace en el juego.
  const chosen = data.entries
    .filter((entry) => entry.added_by.some((node) => scope.has(node)))
    .sort((a, b) => a.id.localeCompare(b.id));
  const ids = new Set(chosen.map((entry) => entry.id));

  const topicIds = new Set<string>();
  for (const entry of chosen) {
    let topic: string | undefined = entry.topic;
    while (topic) {
      if (!data.topics[topic]) throw new Error(`${entry.id}: el tema ${topic} no existe`);
      if (topicIds.has(topic)) break;
      topicIds.add(topic);
      topic = data.topics[topic]!.parent;
    }
  }

  const topics = [...topicIds]
    .map((id) => {
      const raw = data.topics[id]!;
      const name = locale.topics[id]?.name;
      if (!name) throw new Error(`falta el nombre del tema ${id} en el locale es`);
      return { id, order: raw.order, parent: raw.parent ?? null, name };
    })
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  const entries = chosen.map((entry) => {
    const text = locale.cheatsheet[entry.id];
    if (!text) throw new Error(`falta cheatsheet.${entry.id} en el locale es`);
    const { form, asset, latex } = splitDisplay(entry.display);
    return {
      id: entry.id,
      topic: entry.topic,
      kind: entry.kind,
      addedBy: [...entry.added_by],
      addedAtLayer: entry.added_at_layer,
      displayForm: form,
      // Solo uno de los dos tiene contenido, según `displayForm`.
      asset,
      latex,
      // Una relacionada fuera del alcance no se puede abrir todavía, así que no
      // se compila: volvería a aparecer sola cuando su nodo entre.
      related: (entry.related ?? []).filter((id) => ids.has(id)).sort(),
      playAgain: entry.play_again,
      literacyMin: entry.literacy_min,
      localeDependent: entry.locale_dependent === true,
      title: text.title,
      body: text.body,
    };
  });

  return { topics, entries };
}

// --- Calculadora ------------------------------------------------------------

function compileCalculator(scope: ReadonlySet<string>): unknown {
  const data = read<{
    unlock_rule: string;
    never_revoked: boolean;
    rust_when: string;
    tiers: readonly RawTier[];
    ops: readonly RawOp[];
  }>(join(docs, "M-calculadora", "calculator_ops.yaml"));
  const locale = read<{ calculator: Record<string, { label: string; hint: string }> }>(
    join(docs, "locales", "es", "calculator.yaml"),
  );

  const chosen = data.ops.filter((op) => op.unlocked_by.some((node) => scope.has(node)));
  const ids = new Set(chosen.map((op) => op.id));

  const ops = chosen
    .map((op) => {
      const text = locale.calculator[op.id];
      if (!text) throw new Error(`falta calculator.${op.id} en el locale es`);
      return {
        id: op.id,
        tier: op.tier,
        // La lista completa, incluidos los nodos fuera del alcance: la regla es
        // `any_ready` y no se recorta por conveniencia del compilador.
        unlockedBy: [...op.unlocked_by],
        kind: op.kind,
        inputKind: op.input_kind,
        display: op.display,
        localeDependent: op.locale_dependent === true,
        sandbox: op.sandbox === true,
        label: text.label,
        hint: text.hint,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const tiers = data.tiers
    .filter((tier) => chosen.some((op) => op.tier === tier.id))
    .map((tier) => ({
      id: tier.id,
      order: tier.order,
      // Un par con una sola mitad en el alcance no es un par: la llave llega
      // con su candado o no llega.
      pairs: (tier.pairs ?? [])
        .filter(([lock, key]) => ids.has(lock) && ids.has(key))
        .map(([lock, key]) => ({ lock, key })),
    }))
    .sort((a, b) => a.order - b.order);

  for (const op of ops) {
    if (!tiers.some((tier) => tier.id === op.tier)) {
      throw new Error(`${op.id}: el tier ${op.tier} no quedó en la salida`);
    }
  }

  return {
    unlockRule: data.unlock_rule,
    neverRevoked: data.never_revoked,
    rustWhen: data.rust_when,
    tiers,
    ops,
  };
}

// --- Salida -----------------------------------------------------------------

const graph = loadGraph();
const scope = [...closure(graph, ROOT_NODES)].sort();
const scopeSet = new Set(scope);

const cheatsheet = compileCheatsheet(scopeSet);
const calculator = compileCalculator(scopeSet);

const write = (name: string, value: unknown): void => {
  writeFileSync(join(out, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

write("scope.json", { roots: [...ROOT_NODES], nodes: scope });
write("cheatsheet.json", cheatsheet);
write("calculator.json", calculator);

const entries = (cheatsheet as { entries: readonly unknown[] }).entries.length;
const topics = (cheatsheet as { topics: readonly unknown[] }).topics.length;
const ops = (calculator as { ops: readonly unknown[] }).ops.length;
const tiers = (calculator as { tiers: readonly unknown[] }).tiers.length;
console.log(`alcance: ${scope.length} nodos desde ${ROOT_NODES.join(", ")}`);
console.log(`  cheatsheet: ${entries} entradas en ${topics} temas`);
console.log(`  calculadora: ${ops} operaciones en ${tiers} tiers`);
