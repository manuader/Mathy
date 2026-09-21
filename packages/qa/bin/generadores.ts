/**
 * El guardrail del generador, desde la línea de comandos.
 *
 * `npm run qa:generadores` barre semillas de los cinco nodos, genera cada ronda
 * y le pasa los invariantes deterministas, que no cuestan nada. Con `--jev`
 * agrega la pasada del modelo de decisión sobre lo que **pasó** los
 * invariantes: preguntarle por una ronda que ya sabemos rota es pagar por una
 * opinión que no vamos a leer.
 *
 * Sale con 1 si falla un invariante. Los avisos de Jev no frenan nada: son para
 * leer. Sin `TYPESAFE_API_KEY` avisa y sigue con los invariantes, para que nadie
 * quede bloqueado por no tener la clave.
 */

import { buildCorpus } from "../src/corpus.ts";
import { hayClave, jevDecider } from "../src/jev.ts";
import { avisar, barrer, repartir, type Aviso, type Hallazgo } from "../src/generadores.ts";
import { REGISTRO } from "../src/generadores/registro.ts";

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined =>
  argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const tiene = (name: string): boolean => argv.includes(`--${name}`);

/** El precio del millón de tokens de entrada, para que la corrida diga qué costó. */
const USD_POR_MILLON = 0.042;
/** Cuántas líneas de un mismo invariante se imprimen antes de resumir. */
const MUESTRA = 8;

const semillas = Number(flag("semillas") ?? "50");
const soloNodo = flag("nodo");
const nodos = soloNodo ? REGISTRO.filter((n) => n.id === soloNodo) : REGISTRO;

if (nodos.length === 0) {
  console.error(`· No hay ningún nodo ${soloNodo}. Hay: ${REGISTRO.map((n) => n.id).join(", ")}.`);
  process.exit(2);
}

const corrida = barrer(nodos, semillas);

const avisos: Aviso[] = [];
let consultas = 0;
let tokens = 0;

if (tiene("jev")) {
  if (!hayClave()) {
    console.error("· Sin TYPESAFE_API_KEY: se corre sólo con los invariantes.");
  } else {
    const tope = Number(flag("tope") ?? "200");
    // Dos preguntas por ronda entran en una sola consulta, así que el tope de
    // consultas es también el tope de rondas que el modelo llega a mirar.
    const elegidas = repartir(corrida.limpias, tope);
    const decider = jevDecider({ maxCalls: tope });
    // La consigna sale de la lección: la pregunta es si el texto que el jugador
    // lee se corresponde con la escena, y un texto inventado acá no prueba nada.
    const corpus = await buildCorpus();
    const objetivos = new Map<string, string>();
    for (const e of corpus) {
      if (e.role === "objetivo" && e.level !== null) objetivos.set(`${e.node}:${e.level}`, e.text);
    }
    try {
      avisos.push(...(await avisar(nodos, elegidas, decider, (nodo, nivel) => objetivos.get(`${nodo}:${nivel}`) ?? "—")));
    } catch (error) {
      console.error(`· La pasada del modelo se cortó: ${(error as Error).message}`);
    }
    consultas = decider.calls();
    tokens = decider.spent();
    console.error(
      `· ${elegidas.length} rondas miradas · ${consultas} consultas · ${tokens} tokens · ${((tokens * USD_POR_MILLON) / 1e6).toFixed(5)} USD`,
    );
  }
}

if (tiene("json")) {
  console.log(
    JSON.stringify(
      { instancias: corrida.instancias, fallas: corrida.fallas, avisos, consultas, tokens },
      null,
      2,
    ),
  );
} else {
  const porNodoYRegla = new Map<string, Hallazgo[]>();
  for (const f of corrida.fallas) {
    const clave = `${f.nodo} · ${f.regla}`;
    const grupo = porNodoYRegla.get(clave);
    if (grupo) grupo.push(f);
    else porNodoYRegla.set(clave, [f]);
  }
  for (const [clave, grupo] of porNodoYRegla) {
    console.log(`✗ ${clave} — ${grupo.length} ${grupo.length === 1 ? "instancia" : "instancias"}`);
    for (const f of grupo.slice(0, MUESTRA)) {
      console.log(`  nivel ${f.nivel} · semilla ${f.semilla} · ronda ${f.ronda} · ${f.ask}`);
      console.log(`    ${f.detalle}`);
    }
    if (grupo.length > MUESTRA) console.log(`  … y ${grupo.length - MUESTRA} más`);
  }

  if (!tiene("quiet")) {
    // De menor a mayor confianza: arriba queda lo que el modelo contestó menos
    // seguro, que es la forma en que el bug de la rampa se dejó ver.
    for (const a of [...avisos].sort((u, v) => u.p - v.p)) {
      console.log(
        `· ${a.nodo} nivel ${a.nivel} · semilla ${a.semilla} · ronda ${a.ronda} · ${a.ask} · [${a.pregunta}] ${a.por_que}`,
      );
    }
  }

  const rotas = new Set(corrida.fallas.map((f) => `${f.nodo}:${f.nivel}:${f.semilla}:${f.ronda}`)).size;
  console.log(
    `\n${nodos.length} nodos · ${semillas} semillas · ${corrida.instancias} rondas · ${rotas} con algún invariante roto · ${avisos.length} avisos del modelo`,
  );
}

process.exit(corrida.fallas.length > 0 ? 1 : 0);
