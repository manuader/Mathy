/**
 * El minero de errores, desde la línea de comandos.
 *
 * ```
 * npm run qa:minero -- --eventos=packages/qa/test/fixtures/eventos-ejemplo.json
 * npm run qa:minero -- --eventos=<archivo> --jev [--tope=60] [--nodo=alg.eq.one_step] [--min=2]
 * ```
 *
 * Sin `--jev`, o sin `TYPESAFE_API_KEY`, agrupa igual y muestra los grupos:
 * el conteo por forma ya dice qué mirar primero, y quien no tiene la clave no
 * queda sin herramienta. Con `--jev` agrega el juicio del modelo.
 *
 * No escribe nada: imprime un informe y sale con 0. Este archivo no decide, y
 * mucho menos escribe una regla `detect`.
 */

import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { REPO } from "../src/corpus.ts";
import { hayClave, jevDecider } from "../src/jev.ts";
import { cargarCatalogo, informe, leerEventos, minar } from "../src/minero.ts";

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined =>
  argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const tiene = (name: string): boolean => argv.includes(`--${name}`);

const ruta = flag("eventos");
if (ruta === undefined) {
  console.error("Falta --eventos=<archivo JSON con los eventos exportados>.");
  process.exit(2);
}

/**
 * `npm run -w` corre el script con el cwd del paquete, así que una ruta escrita
 * desde la raíz del repo no existe desde acá. Se prueban los tres lugares donde
 * puede estar antes de darse por vencido: el cwd, desde dónde se escribió el
 * comando (`INIT_CWD`, que pone npm) y la raíz del repositorio.
 */
function resolver(p: string): string {
  if (isAbsolute(p)) return p;
  const candidatos = [p, join(process.env["INIT_CWD"] ?? process.cwd(), p), join(REPO, p)];
  for (const c of candidatos) {
    try {
      readFileSync(c);
      return c;
    } catch {
      // El siguiente.
    }
  }
  return p;
}

const archivo = resolver(ruta);
let eventos;
try {
  eventos = leerEventos(readFileSync(archivo, "utf8"));
} catch (error) {
  console.error(`No se pudo leer ${archivo}: ${(error as Error).message}`);
  process.exit(2);
}

const nodo = flag("nodo");
if (nodo !== undefined) eventos = eventos.filter((e) => e.node === nodo);

const catalogo = cargarCatalogo();

let decider = null;
if (tiene("jev")) {
  if (hayClave()) decider = jevDecider({ maxCalls: Number(flag("tope") ?? "60") });
  else console.error("· Sin TYPESAFE_API_KEY: se agrupa sin modelo.");
} else {
  console.error("· Sin --jev: se agrupa sin modelo.");
}

let propuestas;
try {
  propuestas = await minar(eventos, catalogo, decider);
} catch (error) {
  console.error(`· La pasada del modelo se cortó: ${(error as Error).message}`);
  propuestas = await minar(eventos, catalogo, null);
}

// El mínimo se aplica al final para que el encabezado del informe siga contando
// todo lo que se vio: esconder los grupos chicos no es lo mismo que no tenerlos.
const min = Number(flag("min") ?? "1");
console.log(informe(propuestas.filter((p) => p.grupo.veces >= min), eventos.length));

if (decider) {
  const tokens = decider.spent();
  console.error(
    `\n· ${decider.calls()} consultas · ${tokens} tokens · ${((tokens * 0.042) / 1e6).toFixed(5)} USD`,
  );
}
