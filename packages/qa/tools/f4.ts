/**
 * F4 medido antes de construirlo: ¿Jev encuentra la llave que el jugador busca?
 *
 * El buscador de la chuleta hoy filtra por substring sobre el título, así que
 * quien escribe "sacar de los dos lados" no encuentra "La llave va a los dos
 * lados". La pregunta es si un juicio sobre una lista corta de candidatas lo
 * arregla; y la comparación honesta es contra lo que ya hay.
 *
 * El patrón es el de la documentación: el código busca candidatas (acá, por
 * palabras compartidas, que es barato y corre sin red) y el modelo elige entre
 * ellas. Preguntar sobre las 152 llaves de una no tendría sentido: la
 * documentación dice que la precisión cae con estado grande.
 */

import { scoreLoose, scoreMatch } from "@mathy/content";
import { buildCorpus } from "../src/corpus.ts";
import { hayClave, jevDecider } from "../src/jev.ts";

const CONSULTAS: readonly { readonly texto: string; readonly esperada: string }[] = [
  { texto: "sacar de los dos lados", esperada: "eq1.key_on_both_sides" },
  { texto: "como se llama la maquina que deshace", esperada: "inv.mark_names" },
  { texto: "que va primero, por o mas", esperada: "prec.times_first" },
  { texto: "dar vuelta las maquinas cambia?", esperada: "comp.swap_changes" },
  { texto: "cuanto sube en cada paso", esperada: "slope.rise_per_step" },
  { texto: "el cero no esta en la punta", esperada: "neg.zero_is_not_the_edge" },
  { texto: "partir en pedazos iguales", esperada: "frac.equal_parts" },
  { texto: "mover un termino al otro lado", esperada: "eq1.contrary_opens" },
  { texto: "sumar es caminar", esperada: "add.chip_is_a_jump" },
  { texto: "que la balanza quede derecha", esperada: "bal.straight_means_equal" },
];

const fold = (t: string): string => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const palabras = (t: string): string[] => fold(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3);

const corpus = await buildCorpus();
const llaves = new Map<string, { titulo: string; cuerpo: string }>();
for (const e of corpus) {
  const m = /^key\.(.+)\.(title|body)$/.exec(e.key);
  if (!m || !m[1]) continue;
  const actual = llaves.get(m[1]) ?? { titulo: "", cuerpo: "" };
  llaves.set(m[1], m[2] === "title" ? { ...actual, titulo: e.text } : { ...actual, cuerpo: e.text });
}
console.log(`${llaves.size} llaves en la chuleta`);

/** Lo que hace hoy el buscador: substring sobre el título. */
const substring = (consulta: string): string[] =>
  [...llaves.entries()].filter(([, v]) => fold(v.titulo).includes(fold(consulta))).map(([id]) => id);

/** Las candidatas: el mismo ranking local que usa el juego, sin red. */
function candidatas(consulta: string, n = 12): string[] {
  return [...llaves.entries()]
    .map(([id, v]) => ({ id, p: scoreLoose(consulta, v.titulo, v.cuerpo) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, n)
    .map((x) => x.id);
}

const decider = hayClave() ? jevDecider({ maxCalls: 40 }) : null;
let aciertaSubstring = 0;
let aciertaLexico = 0;
let aciertaJev = 0;
let enCandidatas = 0;
let enPrimeras = 0;

for (const c of CONSULTAS) {
  const sub = substring(c.texto);
  const cand = candidatas(c.texto);
  const okSub = sub[0] === c.esperada;
  const mostradas = [...llaves.entries()]
    .map(([id, v]) => ({ id, p: scoreMatch(c.texto, v.titulo, v.cuerpo) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .map((x) => x.id);
  const okLex = mostradas[0] === c.esperada;
  if (okSub) aciertaSubstring += 1;
  if (okLex) aciertaLexico += 1;
  if (cand.includes(c.esperada)) enCandidatas += 1;
  // Lo que de verdad importa para el jugador: la chuleta muestra una lista, no
  // un resultado. Alcanza con que la llave esté a la vista sin buscar de nuevo.
  if (mostradas.slice(0, 5).includes(c.esperada)) enPrimeras += 1;

  let elegida = "—";
  let p = 0;
  if (decider) {
    const opciones: Record<string, string> = { ninguna: "Ninguna de estas llaves responde la consulta." };
    for (const id of cand) {
      const v = llaves.get(id);
      if (v) opciones[id] = `${v.titulo}. ${v.cuerpo}`;
    }
    const a = await decider.ask(
      { consulta_escrita_por_el_jugador: c.texto },
      {
        cual_llave: {
          kind: "choice",
          instructions:
            "El jugador escribió `consulta_escrita_por_el_jugador` en el buscador de su chuleta. ¿Cuál de estas llaves está buscando? Escribe como habla un chico y puede no usar las mismas palabras que el título.",
          options: opciones,
        },
      },
    );
    const r = a["cual_llave"] as { value: string; p: number };
    elegida = r.value;
    p = r.p;
    if (elegida === c.esperada) aciertaJev += 1;
  }
  console.log(
    `${okSub ? "S" : "·"}${okLex ? "L" : "·"}${elegida === c.esperada ? "J" : "·"}  "${c.texto}"\n    espera ${c.esperada} · substring ${sub[0] ?? "nada"} · léxico ${mostradas[0] ?? "nada"} · jev ${elegida} ${p.toFixed(2)}`,
  );
}

console.log(`\nsubstring acierta ${aciertaSubstring}/${CONSULTAS.length}`);
console.log(`léxico (sin red) acierta ${aciertaLexico}/${CONSULTAS.length} · entre las cinco primeras ${enPrimeras}/${CONSULTAS.length} · entre las candidatas ${enCandidatas}/${CONSULTAS.length}`);
if (decider) {
  console.log(`jev acierta ${aciertaJev}/${CONSULTAS.length} · ${decider.calls()} consultas · ${(decider.spent() * 0.042 / 1e6).toFixed(5)} USD`);
}
