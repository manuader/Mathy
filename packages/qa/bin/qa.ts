/**
 * El linter de textos, desde la línea de comandos.
 *
 * `npm run qa` revisa los textos visibles con las reglas locales, que no
 * cuestan nada. Con `--jev` agrega la pasada del modelo de decisión sobre lo
 * que una regla no puede juzgar; sin `TYPESAFE_API_KEY` avisa y sigue con las
 * reglas, para que nadie quede bloqueado por no tener la clave.
 *
 * Sale con 1 si hay errores. Los avisos no frenan nada: son para leer.
 */

import { buildCorpus, loadObjetos } from "../src/corpus.ts";
import { runRules } from "../src/rules.ts";
import { hayClave, jevDecider } from "../src/jev.ts";
import { runModelo } from "../src/juicio.ts";
import type { Entry, Finding } from "../src/types.ts";

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined =>
  argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const tiene = (name: string): boolean => argv.includes(`--${name}`);

const corpusEntero = await buildCorpus();
const objetos = loadObjetos();

const nodo = flag("nodo");
const muestra = Number(flag("muestra") ?? "0");
let corpus = nodo ? corpusEntero.filter((e) => e.node === nodo) : corpusEntero;
if (muestra > 0) corpus = corpus.slice(0, muestra);

const hallazgos: Finding[] = [...runRules(corpus, objetos)];

if (tiene("jev")) {
  if (!hayClave()) {
    console.error("· Sin TYPESAFE_API_KEY: se corre sólo con las reglas locales.");
  } else {
    const decider = jevDecider({ maxCalls: Number(flag("tope") ?? "200") });
    // El objetivo del nivel es contexto para juzgar un paso de la guía.
    const objetivoPorNivel = new Map<string, string>();
    for (const e of corpusEntero) {
      if (e.role === "objetivo") objetivoPorNivel.set(`${e.node}:${e.level}`, e.text);
    }
    const objetivoDe = (e: Entry): string => objetivoPorNivel.get(`${e.node}:${e.level}`) ?? "—";
    try {
      hallazgos.push(...(await runModelo(corpus, objetos, decider, objetivoDe)));
    } catch (error) {
      console.error(`· La pasada del modelo se cortó: ${(error as Error).message}`);
    }
    console.error(`· ${decider.calls()} consultas, ${decider.spent()} tokens.`);
  }
}

const errores = hallazgos.filter((f) => f.severity === "error");
const avisos = hallazgos.filter((f) => f.severity === "aviso");

if (tiene("json")) {
  console.log(JSON.stringify({ textos: corpus.length, hallazgos }, null, 2));
} else {
  const linea = (f: Finding): string =>
    `${f.severity === "error" ? "✗" : "·"} [${f.rule}${f.source === "jev" ? " ~" + f.p.toFixed(2) : ""}] ${f.key}\n  ${f.text}\n  → ${f.why}`;
  for (const f of errores) console.log(linea(f));
  if (!tiene("quiet")) for (const f of avisos) console.log(linea(f));
  console.log(`\n${corpus.length} textos · ${errores.length} errores · ${avisos.length} avisos`);
}

process.exit(errores.length > 0 ? 1 : 0);
