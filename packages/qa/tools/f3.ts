/**
 * F3: el guardrail del generador, medido.
 *
 * Los generadores arman cada ronda con una semilla, así que una ronda mala no
 * aparece en los tests: aparece en la semilla 4 187 de un jugador. Dos bugs de
 * esa clase salieron jugando y tarde —una recta de más que volvía ambigua la
 * pregunta, dos paralelas indistinguibles—, y los dos se ven en la descripción
 * de la instancia antes de dibujarla.
 *
 * Acá se generan instancias de `alg.fn.composition`, se describen, se les
 * inyectan los defectos que de verdad pasaron, y se comparan dos jueces:
 * invariantes deterministas (que es lo que uno escribiría sin modelo) contra
 * Jev. Lo que importa no es quién marca más: es si Jev ve algo que el
 * invariante no puede ver.
 */

import {
  COMP_LEVELS,
  compRun,
  generateComposition,
  type CompLevel,
  type CompOption,
  type CompPiece,
  type CompProblem,
} from "@mathy/mechanics";
import { buildCorpus } from "../src/corpus.ts";
import { hayClave, jevDecider } from "../src/jev.ts";
import type { QuestionSet } from "../src/types.ts";

// --- La instancia, contada como la ve el jugador ----------------------------

const pieza = (p: CompPiece): string => {
  switch (p.kind) {
    case "num": return String(p.value);
    case "sym": return p.name;
    case "op": return { add: "+", sub: "−", mul: "×", div: "÷" }[p.op];
    case "ring": return "∘";
    case "neq": return "≠";
    case "open": return "(";
    case "close": return ")";
    case "eq": return "=";
  }
};

const fichas = (options: readonly CompOption[]): readonly string[] =>
  options.map((o) => (o.pieces.length > 0 ? o.pieces.map(pieza).join(" ") : String(o.value)));

const cadena = (ms: CompProblem["chain"]): string =>
  ms.length === 0 ? "vacía" : ms.map((m) => `${m.name}: ${{ add: "+", sub: "−", mul: "×", div: "÷" }[m.op]}${m.value}`).join(" → ");

interface Instancia {
  readonly nivel: number;
  readonly semilla: number;
  readonly consigna: string;
  readonly problema: CompProblem;
  readonly defecto: string | null;
}

/** El estado que recibe el juicio: la escena y las fichas, sin nada más. */
function estado(i: Instancia): Record<string, unknown> {
  const p = i.problema;
  return {
    consigna: i.consigna,
    escena: {
      lo_que_pregunta: p.ask,
      cadena_en_el_cano: cadena(p.chain),
      otro_carril: p.other.length > 0 ? cadena(p.other) : "no hay",
      cajon_de_maquinas: p.tray.length > 0 ? cadena(p.tray) : "vacío",
      bola_que_entra: p.input,
      salida_pedida: p.target,
    },
    // No toda ronda se contesta con una ficha: varias se contestan poniendo u
    // ordenando máquinas en el caño. Decirlo importa, porque una lista de
    // fichas vacía se lee como una ronda sin respuesta posible.
    ...(p.options.length > 0
      ? {
          como_se_contesta: "tocando una de las fichas",
          fichas_para_elegir: fichas(p.options),
          // Cuál es la correcta se dice, porque la pregunta no es resolver el
          // problema sino si el problema está bien planteado.
          ficha_correcta: p.options.findIndex((o) => o.correct) + 1,
        }
      : {
          como_se_contesta: "poniendo u ordenando las máquinas en el caño, sin fichas",
          cadena_que_se_espera: cadena(p.solution),
        }),
  };
}

// --- El juez determinista --------------------------------------------------

function invariantes(i: Instancia): readonly string[] {
  const p = i.problema;
  const out: string[] = [];
  const correctas = p.options.filter((o) => o.correct);
  if (p.options.length > 0 && correctas.length !== 1) out.push(`hay ${correctas.length} fichas correctas`);
  const textos = fichas(p.options);
  const vistos = new Set<string>();
  for (const t of textos) {
    if (vistos.has(t)) out.push(`dos fichas dicen lo mismo: "${t}"`);
    vistos.add(t);
  }
  const valores = new Map<number, number>();
  for (const o of p.options) valores.set(o.value, (valores.get(o.value) ?? 0) + 1);
  for (const [v, n] of valores) if (n > 1) out.push(`dos fichas valen ${v}`);
  if (p.chain.length > 0 && p.ask === "watch") {
    const corrida = compRun(p.input, p.chain);
    if (corrida.blocked === null && corrida.output !== p.target) out.push("la salida pedida no es la que da la cadena");
  }
  return out;
}

// --- Los defectos que de verdad pasaron ------------------------------------

type Mutacion = (p: CompProblem, consigna: string) => { problema: CompProblem; consigna: string } | null;

const MUTACIONES: Readonly<Record<string, Mutacion>> = {
  // Dos fichas que se leen igual: el jugador no puede elegir bien ni queriendo.
  opcion_duplicada: (p, consigna) => {
    const buena = p.options.find((o) => o.correct);
    const otra = p.options.find((o) => !o.correct);
    if (!buena || !otra) return null;
    const options = p.options.map((o) => (o === otra ? { ...o, pieces: buena.pieces, value: buena.value } : o));
    return { problema: { ...p, options }, consigna };
  },
  // El caso de las paralelas: dos fichas distintas que valen lo mismo.
  valor_repetido: (p, consigna) => {
    const buena = p.options.find((o) => o.correct);
    const otra = p.options.find((o) => !o.correct && o.value !== buena?.value);
    if (!buena || !otra) return null;
    const options = p.options.map((o) => (o === otra ? { ...o, value: buena.value } : o));
    return { problema: { ...p, options }, consigna };
  },
  // La consigna habla de algo que no está en la escena.
  dato_invisible: (p, consigna) => {
    if (p.chain.length === 0) return null;
    return { problema: { ...p, chain: [], other: [] }, consigna };
  },
  // El texto quedó de otra ronda: pide un gesto que no es el de esta escena.
  texto_no_coincide: (p) => ({ problema: p, consigna: "Cortá la barra en partes iguales y encendé las que pide la ficha." }),
};

// --- Las preguntas ---------------------------------------------------------

const PREGUNTAS: QuestionSet = {
  una_sola_respuesta: {
    kind: "noul",
    instructions: "¿La ronda tiene una sola respuesta posible, según `escena.como_se_contesta`?",
    criteria: {
      true: "Sí: una sola ficha, o un solo armado de máquinas, cumple lo que pide la consigna; lo demás es distinguible y distinto.",
      false: "No: hay dos respuestas que cumplirían igual, o dos fichas que se leen iguales o valen lo mismo, o ninguna cumple.",
    },
  },
  consigna_coincide_con_la_escena: {
    kind: "noul",
    instructions: "¿La consigna pide algo que se puede hacer con lo que hay en `escena`?",
    criteria: {
      true: "Sí: los objetos y el gesto que nombra la consigna están en la escena.",
      false: "No: la consigna nombra objetos que la escena no tiene, o pide un gesto imposible acá, o el dato que haría falta para contestar no está a la vista.",
    },
  },
  que_falta: {
    kind: "choice",
    instructions: "Si la ronda tiene un problema, ¿cuál es?",
    options: {
      nada: "La ronda está bien planteada: se entiende qué hacer y tiene una sola respuesta.",
      dato_invisible: "Para contestar hace falta un dato que la escena no muestra.",
      opcion_duplicada: "Dos fichas se leen igual o valen lo mismo.",
      texto_no_coincide: "La consigna habla de otra cosa que lo que la escena muestra.",
    },
  },
};

// --- El banco --------------------------------------------------------------

const corpus = await buildCorpus();
const consignaDe = new Map<number, string>();
for (const e of corpus) {
  if (e.node === "alg.fn.composition" && e.role === "objetivo" && e.level !== null) consignaDe.set(e.level, e.text);
}

const limpias: Instancia[] = [];
for (const level of COMP_LEVELS as readonly CompLevel[]) {
  for (let s = 0; s < 4; s += 1) {
    const problema = generateComposition(level, 1000 + s * 137, s);
    limpias.push({ nivel: level.n, semilla: 1000 + s * 137, consigna: consignaDe.get(level.n) ?? "—", problema, defecto: null });
  }
}

const rotas: Instancia[] = [];
for (const [nombre, mutar] of Object.entries(MUTACIONES)) {
  let puestas = 0;
  for (const base of limpias) {
    if (puestas >= 5) break;
    const m = mutar(base.problema, base.consigna);
    if (!m) continue;
    rotas.push({ ...base, problema: m.problema, consigna: m.consigna, defecto: nombre });
    puestas += 1;
  }
}

const casos = [...limpias, ...rotas];
const decider = hayClave() ? jevDecider({ maxCalls: 300 }) : null;

interface Resultado {
  readonly caso: Instancia;
  readonly inv: readonly string[];
  readonly jev: { readonly unaSola: number; readonly coincide: number; readonly queFalta: string; readonly p: number } | null;
}

const filas: Resultado[] = [];
for (const caso of casos) {
  const inv = invariantes(caso);
  let jev: Resultado["jev"] = null;
  if (decider) {
    const a = await decider.ask(estado(caso), PREGUNTAS);
    const una = a["una_sola_respuesta"] as { value: boolean; p: number };
    const coin = a["consigna_coincide_con_la_escena"] as { value: boolean; p: number };
    const falta = a["que_falta"] as { value: string; p: number };
    jev = {
      unaSola: una.value ? una.p : -una.p,
      coincide: coin.value ? coin.p : -coin.p,
      queFalta: falta.value,
      p: falta.p,
    };
  }
  filas.push({ caso, inv, jev });
}

/** Con 0,5 avisa; con 0,8 frenaría el merge. Se miden los dos cortes. */
const marcaCon = (r: Resultado, corte: number): boolean =>
  r.jev !== null &&
  (r.jev.unaSola < -corte || r.jev.coincide < -corte || (r.jev.queFalta !== "nada" && r.jev.p > corte));
const marcaJev = (r: Resultado): boolean => marcaCon(r, 0.5);

console.log("\n=== Instancias limpias (marcarlas es ruido) ===");
console.log(`invariantes ${limpias.filter((c) => invariantes(c).length > 0).length}/${limpias.length}   jev ${filas.filter((r) => r.caso.defecto === null && marcaJev(r)).length}/${limpias.length}`);

console.log("\n=== Defectos inyectados (marcarlos es el trabajo) ===");
for (const nombre of Object.keys(MUTACIONES)) {
  const grupo = filas.filter((r) => r.caso.defecto === nombre);
  const inv = grupo.filter((r) => r.inv.length > 0).length;
  const jev = grupo.filter(marcaJev).length;
  const acierta = grupo.filter((r) => r.jev?.queFalta === nombre).length;
  console.log(`${nombre.padEnd(18)} invariantes ${inv}/${grupo.length}   jev ${jev}/${grupo.length}   (y nombra bien el defecto en ${acierta})`);
}

console.log("\n=== Con el corte estricto (0,8): lo que frenaría un merge ===");
console.log(`limpias marcadas: ${filas.filter((r) => r.caso.defecto === null && marcaCon(r, 0.8)).length}/${limpias.length}`);
for (const nombre of Object.keys(MUTACIONES)) {
  const grupo = filas.filter((r) => r.caso.defecto === nombre);
  console.log(`${nombre.padEnd(18)} jev ${grupo.filter((r) => marcaCon(r, 0.8)).length}/${grupo.length}`);
}

// La prueba del nivel 7 de la rampa mostró que con el bug la respuesta no
// cambia y lo que cae es la confianza. Si eso vale en general, la puerta útil
// no es "contestó que no" sino "contestó que sí sin estar seguro".
console.log("\n=== La duda como señal: «sí, pero con menos de 0,8» ===");
const dudosa = (r: Resultado): boolean => r.jev !== null && r.jev.unaSola > 0 && r.jev.unaSola < 0.8;
console.log(`limpias dudosas: ${filas.filter((r) => r.caso.defecto === null && dudosa(r)).length}/${limpias.length}`);
for (const nombre of Object.keys(MUTACIONES)) {
  const grupo = filas.filter((r) => r.caso.defecto === nombre);
  const conDuda = grupo.filter((r) => dudosa(r) || (r.jev !== null && r.jev.unaSola < 0)).length;
  console.log(`${nombre.padEnd(18)} dudosas o negadas: ${conDuda}/${grupo.length}`);
}

console.log("\n=== Lo que jev marca y el invariante no ===");
for (const r of filas) {
  if (r.inv.length > 0 || !marcaJev(r)) continue;
  const j = r.jev;
  console.log(`nivel ${r.caso.nivel} semilla ${r.caso.semilla} [${r.caso.defecto ?? "limpia"}] · unaSola ${j?.unaSola.toFixed(2)} · coincide ${j?.coincide.toFixed(2)} · ${j?.queFalta} ${j?.p.toFixed(2)}`);
  console.log(`   ${r.caso.consigna}`);
  console.log(`   fichas: ${fichas(r.caso.problema.options).join(" | ") || "—"} · cadena: ${cadena(r.caso.problema.chain)}`);
}

if (decider) {
  console.log(`\n${casos.length} instancias · ${decider.calls()} consultas · ${decider.spent()} tokens · ${(decider.spent() * 0.042 / 1e6).toFixed(5)} USD`);
}

// --- Segunda prueba: un bug real, no inyectado -----------------------------
//
// El nivel 7 de la rampa dibujaba tres rectas escritas y preguntaba cuál era
// "la" pendiente. Las dos primeras son la misma recta en dos formas; la tercera
// es otra recta. Con las tres a la vista la pregunta no tiene una sola
// respuesta, y eso lo encontró un agente jugando, tarde. El generador todavía
// produce la tercera: la actividad la esconde. Así que la instancia defectuosa
// se puede reconstruir tal cual era, sin inventar nada.

const { SL_LEVELS, generateSlope, slSlopeOfWritten } = await import("@mathy/mechanics");

const recta = (w: { readonly a: number; readonly b: number; readonly c: number }): string =>
  `${w.a}x ${w.b >= 0 ? "+" : "−"} ${Math.abs(w.b)}y = ${w.c}`;

const consignaRampa =
  corpus.find((e) => e.node === "alg.fn.linear_slope" && e.level === 7 && e.role === "objetivo")?.text ?? "—";
const nivel7 = SL_LEVELS.find((l) => l.n === 7);

if (decider && nivel7) {
  console.log("\n=== El bug real del nivel 7 de la rampa: tres rectas contra dos ===");
  let antesMarcadas = 0;
  let despuesMarcadas = 0;
  for (let s = 0; s < 5; s += 1) {
    // La pregunta de las rectas escritas cae en las rondas impares del nivel.
    const p = generateSlope(nivel7, 2000 + s * 91, 1);
    if (p.written.length < 3 || p.options.length === 0) continue;
    const opciones = p.options.map((r) => `${r.rise}/${r.run}`);
    const pendientes = p.written.map((w) => {
      const r = slSlopeOfWritten(w);
      return r ? `${r.rise}/${r.run}` : "vertical";
    });
    for (const [etiqueta, cuantas] of [["antes (tres rectas)", 3], ["después (dos rectas)", 2]] as const) {
      const a = await decider.ask(
        {
          consigna: consignaRampa,
          escena: {
            lo_que_pregunta: "cuál es la pendiente de la recta escrita",
            rectas_escritas: p.written.slice(0, cuantas).map(recta),
            pendiente_de_cada_recta: pendientes.slice(0, cuantas),
            como_se_contesta: "tocando una de las fichas",
          },
          fichas_para_elegir: opciones,
          ficha_correcta: p.correct + 1,
        },
        PREGUNTAS,
      );
      const una = a["una_sola_respuesta"] as { value: boolean; p: number };
      const falta = a["que_falta"] as { value: string; p: number };
      const marcada = !una.value && una.p > 0.5;
      if (cuantas === 3 && marcada) antesMarcadas += 1;
      if (cuantas === 2 && marcada) despuesMarcadas += 1;
      console.log(
        `semilla ${2000 + s * 91} ${etiqueta.padEnd(20)} una_sola_respuesta ${una.value ? "sí" : "no"} ${una.p.toFixed(2)} · ${falta.value} ${falta.p.toFixed(2)}`,
      );
    }
  }
  console.log(`\ncon el bug: ${antesMarcadas}/5 marcadas · ya arreglado: ${despuesMarcadas}/5 marcadas`);
  console.log(`${decider.calls()} consultas en total · ${(decider.spent() * 0.042 / 1e6).toFixed(5)} USD`);
}
