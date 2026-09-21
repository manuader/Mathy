/**
 * La medición: ¿cuánto agrega Jev sobre las reglas, y a qué costo?
 *
 * El dataset tiene tres partes, y se informan por separado a propósito:
 *
 * - `real`: textos que alguien ya juzgó defectuosos, con su razón y su commit.
 *   Son pocos —cinco— porque el historial casi no tiene textos reemplazados:
 *   los agentes corregían dentro de la misma sesión, antes de commitear.
 * - `mutado`: textos buenos del juego con un defecto inyectado, uno por vez,
 *   de los tipos que sí aparecieron en la vida real. Son sintéticos y eso hay
 *   que leerlo con cuidado: miden si el juicio detecta el defecto, no si el
 *   defecto es frecuente.
 * - `bueno`: textos del juego tal como están, que pasaron revisión humana. Lo
 *   que importa acá es cuántos se marcan sin motivo: un linter que grita es un
 *   linter que se apaga.
 */

import { buildCorpus, loadObjetos } from "../src/corpus.ts";
import { checkEntry } from "../src/rules.ts";
import { hayClave, jevDecider } from "../src/jev.ts";
import { juzgar } from "../src/juicio.ts";
import { PREGUNTAS, estadoDe } from "../src/preguntas.ts";
import type { Entry } from "../src/types.ts";

export type Etiqueta = "real" | "mutado" | "bueno";
export interface Caso {
  readonly entry: Entry;
  readonly etiqueta: Etiqueta;
  /** Qué tiene de malo, para los casos malos. */
  readonly defecto?: string;
  readonly fuente?: string;
}

/** Los cinco defectos documentados que se pueden citar. */
const REALES: readonly Caso[] = [
  {
    etiqueta: "real",
    defecto: "objeto_ajeno",
    fuente: "commit a4923be",
    entry: {
      key: "comp.lure.ratios_added",
      text: "Ahí las razones están sumadas. Cada rueda estira lo que le llega: se multiplican.",
      node: "alg.fn.composition", level: 5, role: "mensaje", scenes: ["PipeScene"],
    },
  },
  {
    etiqueta: "real",
    defecto: "objeto_ajeno",
    fuente: "commit a4923be",
    entry: {
      key: "comp.done.predict",
      text: "Eso marcó. Cada rueda estira lo que le llega, así que las razones se multiplican.",
      node: "alg.fn.composition", level: 5, role: "mensaje", scenes: ["PipeScene"],
    },
  },
  {
    etiqueta: "real",
    defecto: "voseo",
    fuente: "vivo hoy en lesson.arith.int.negatives.4.coach.arrive",
    entry: {
      key: "lesson.arith.int.negatives.4.coach.arrive",
      text: "Mira como al principio. Ahora girá la manivela hasta la bandera.",
      node: "arith.int.negatives", level: 4, role: "paso_de_guia", scenes: ["TrackScene"],
    },
  },
  {
    etiqueta: "real",
    defecto: "orden_en_indicativo",
    fuente: "reemplazado por el agente de la rampa; sigue en i18n como sl.hint.stretchStep",
    entry: {
      key: "sl.hint.stretchStep",
      text: "El escalón se ensanchó y quedó flotando. Movés la esquina hasta que vuelva a tocar la rampa.",
      node: "alg.fn.linear_slope", level: 5, role: "paso_de_guia", scenes: ["WalkScene", "TrackScene"],
    },
  },
  {
    etiqueta: "real",
    defecto: "orden_en_indicativo",
    fuente: "reemplazado por el agente de la rampa; sigue en i18n como sl.hint.setSliders",
    entry: {
      key: "sl.hint.setSliders",
      text: "Movés uno y la rampa se corre; movés el otro y gira. Pasá por los dos puntos.",
      node: "alg.fn.linear_slope", level: 6, role: "paso_de_guia", scenes: ["WalkScene", "TrackScene"],
    },
  },
];

/** Los defectos que sí pasaron en la vida real, inyectados de a uno. */
const MUTACIONES: readonly { readonly defecto: string; readonly aplicar: (t: string) => string | null }[] = [
  { defecto: "voseo", aplicar: (t) => {
    // Sin \b: en JavaScript no hay límite de palabra después de una vocal acentuada.
    const m = /^(Arrastrá|Mirá|Tocá|Girá|Soltá|Contá|Meté|Probá)(?=\s)/.exec(t);
    if (!m) return null;
    const tuteo: Record<string, string> = { "Arrastrá": "Arrastra", "Mirá": "Mira", "Tocá": "Toca", "Girá": "Gira", "Soltá": "Suelta", "Contá": "Cuenta", "Meté": "Mete", "Probá": "Prueba" };
    return t.replace(m[0], tuteo[m[0]] ?? m[0]);
  } },
  { defecto: "objeto_ajeno", aplicar: (t) => {
    const cambios: [RegExp, string][] = [[/máquina/g, "rueda"], [/cerradura/g, "candado"], [/baldosa/g, "ladrillo"], [/cofre/g, "baúl"], [/manivela/g, "volante"]];
    for (const [de, a] of cambios) if (de.test(t)) return t.replace(de, a);
    return null;
  } },
  { defecto: "nunca_incorrecto", aplicar: (t) => `Eso está mal. ${t}` },
  { defecto: "jerga", aplicar: (t) => t.replace(/\b(la ficha|el cofre|la llave)\b/, "el nodo") === t ? null : t.replace(/\b(la ficha|el cofre|la llave)\b/, "el nodo") },
  { defecto: "vago", aplicar: (t) => (t.length > 40 ? "Tocá la que corresponde y seguí." : null) },
];

function armarCasos(corpus: readonly Entry[]): readonly Caso[] {
  const casos: Caso[] = [...REALES];
  // Un paso fijo sobre el corpus: la muestra es siempre la misma, así dos
  // corridas se pueden comparar y la caché sirve.
  const candidatos = corpus.filter((e) => e.role === "paso_de_guia" || e.role === "objetivo");
  for (const mutacion of MUTACIONES) {
    // El índice arranca de cero por mutación: compartido, la primera que no
    // encontraba candidato se comía la lista y las demás quedaban sin casos.
    let i = 0;
    let puestas = 0;
    while (puestas < 2 && i < candidatos.length) {
      const base = candidatos[(i * 37) % candidatos.length];
      i += 1;
      if (!base) continue;
      const text = mutacion.aplicar(base.text);
      if (!text || text === base.text) continue;
      casos.push({ etiqueta: "mutado", defecto: mutacion.defecto, entry: { ...base, text, key: `${base.key}~${mutacion.defecto}` } });
      puestas += 1;
    }
  }
  for (let n = 0; n < 40; n += 1) {
    const e = corpus[(n * 149) % corpus.length];
    if (e) casos.push({ etiqueta: "bueno", entry: e });
  }
  return casos;
}

const corpus = await buildCorpus();
const objetos = loadObjetos();
const casos = armarCasos(corpus);
const objetivoPorNivel = new Map<string, string>();
for (const e of corpus) if (e.role === "objetivo") objetivoPorNivel.set(`${e.node}:${e.level}`, e.text);

const conJev = hayClave() && !process.argv.includes("--sin-jev");
const decider = conJev ? jevDecider({ maxCalls: 200 }) : null;

interface Fila {
  readonly caso: Caso;
  readonly reglas: readonly string[];
  readonly reglasError: readonly string[];
  readonly jev: readonly { rule: string; severity: string; p: number }[];
  readonly ms: number;
}

const filas: Fila[] = [];
for (const caso of casos) {
  const hallazgosRegla = checkEntry(caso.entry, objetos);
  const reglas = hallazgosRegla.map((f) => f.rule);
  const reglasError = hallazgosRegla.filter((f) => f.severity === "error").map((f) => f.rule);
  let jev: Fila["jev"] = [];
  let ms = 0;
  if (decider) {
    const t0 = Date.now();
    const answers = await decider.ask(
      estadoDe(caso.entry, objetos, objetivoPorNivel.get(`${caso.entry.node}:${caso.entry.level}`) ?? "—"),
      PREGUNTAS,
    );
    ms = Date.now() - t0;
    jev = juzgar(caso.entry, answers).map((f) => ({ rule: f.rule, severity: f.severity, p: f.p }));
  }
  filas.push({ caso, reglas, reglasError, jev, ms });
}

/** Lo que de verdad importa: un error frena el merge, un aviso sólo se lee. */
const cuenta = (etiqueta: Etiqueta, quien: "reglas" | "jev", severidad: "error" | "cualquiera"): string => {
  const grupo = filas.filter((f) => f.caso.etiqueta === etiqueta);
  const marcados = grupo.filter((f) =>
    quien === "reglas"
      ? severidad === "error"
        ? f.reglasError.length > 0
        : f.reglas.length > 0
      : severidad === "error"
        ? f.jev.some((x) => x.severity === "error")
        : f.jev.length > 0,
  ).length;
  return `${marcados}/${grupo.length}`;
};

console.log("\n=== Como error de CI (frena el merge) ===");
for (const e of ["real", "mutado", "bueno"] as const) {
  console.log(`${e.padEnd(8)} reglas ${cuenta(e, "reglas", "error")}   jev ${cuenta(e, "jev", "error")}`);
}
console.log("\n=== Contando también los avisos ===");
for (const e of ["real", "mutado", "bueno"] as const) {
  console.log(`${e.padEnd(8)} reglas ${cuenta(e, "reglas", "cualquiera")}   jev ${cuenta(e, "jev", "cualquiera")}`);
}

console.log("\n=== Caso por caso (malos) ===");
for (const f of filas.filter((x) => x.caso.etiqueta !== "bueno")) {
  const j = f.jev.map((x) => `${x.rule} ${x.p.toFixed(2)}`).join(", ") || "—";
  console.log(`${f.caso.etiqueta === "real" ? "R" : "M"} [${f.caso.defecto}] reglas: ${f.reglas.join(", ") || "—"} | jev: ${j}`);
  console.log(`   ${f.caso.entry.text.slice(0, 96)}`);
}

console.log("\n=== Falsos positivos de jev sobre textos buenos ===");
for (const f of filas.filter((x) => x.caso.etiqueta === "bueno" && x.jev.length > 0)) {
  console.log(`· ${f.caso.entry.key}: ${f.jev.map((x) => `${x.rule} ${x.p.toFixed(2)}`).join(", ")}`);
  console.log(`   ${f.caso.entry.text.slice(0, 96)}`);
}

if (decider) {
  const tiempos = filas.map((f) => f.ms).filter((m) => m > 0).sort((a, b) => a - b);
  const mediana = tiempos[Math.floor(tiempos.length / 2)] ?? 0;
  const tokens = decider.spent();
  console.log(`\n${casos.length} casos · ${decider.calls()} consultas · ${tokens} tokens · mediana ${mediana} ms · máx ${tiempos.at(-1) ?? 0} ms`);
  console.log(`costo a 0,042 USD por millón de tokens de entrada: ${(tokens * 0.042 / 1e6).toFixed(5)} USD`);
}
