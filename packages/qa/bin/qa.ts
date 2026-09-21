/**
 * El linter de textos, desde la línea de comandos.
 *
 * `npm run qa -w packages/qa` revisa los 1077 textos visibles con las reglas
 * locales. Sale con 1 si hay errores; los avisos no hacen fallar, porque un
 * aviso es una opinión y una opinión no frena un merge.
 */

import { buildCorpus, loadObjetos } from "../src/corpus.ts";
import { runRules } from "../src/rules.ts";
import type { Finding } from "../src/types.ts";

const args = new Set(process.argv.slice(2));
const soloErrores = args.has("--quiet");
const comoJson = args.has("--json");

const corpus = await buildCorpus();
const objetos = loadObjetos();
const hallazgos = runRules(corpus, objetos);

const errores = hallazgos.filter((f) => f.severity === "error");
const avisos = hallazgos.filter((f) => f.severity === "aviso");

if (comoJson) {
  console.log(JSON.stringify({ textos: corpus.length, hallazgos }, null, 2));
} else {
  const linea = (f: Finding): string => `${f.severity === "error" ? "✗" : "·"} [${f.rule}] ${f.key}\n  ${f.text}\n  → ${f.why}`;
  for (const f of errores) console.log(linea(f));
  if (!soloErrores) for (const f of avisos) console.log(linea(f));
  console.log(`\n${corpus.length} textos · ${errores.length} errores · ${avisos.length} avisos`);
}

process.exit(errores.length > 0 ? 1 : 0);
