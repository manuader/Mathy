/**
 * `alg.fn.composition`: la cadena de máquinas.
 *
 * Es el nodo donde se hizo la medición, así que sus invariantes son los que
 * quedaron probados: lo numérico —dos fichas iguales, dos que valen lo mismo,
 * cuántas son correctas, la salida pedida contra lo que da la cadena— más los
 * dos que la mecánica permite escribir y ninguna regla genérica podría: que los
 * dos carriles no den lo mismo, y que la respuesta de "¿da igual en los dos
 * órdenes?" sea la que muestran las dos salidas dibujadas.
 */

import {
  COMP_LEVELS,
  compRun,
  generateComposition,
  type CompAsk,
  type CompLevel,
  type CompMachine,
  type CompOption,
  type CompPiece,
  type CompProblem,
} from "@mathy/mechanics";
import type { DefinicionNodo, Estado, Falla } from "../generadores.ts";

const SIGNO: Readonly<Record<string, string>> = { add: "+", sub: "−", mul: "×", div: "÷" };

const pieza = (p: CompPiece): string => {
  switch (p.kind) {
    case "num":
      return String(p.value);
    case "sym":
      return p.name;
    case "op":
      return SIGNO[p.op] ?? "?";
    case "ring":
      return "∘";
    case "neq":
      return "≠";
    case "open":
      return "(";
    case "close":
      return ")";
    case "eq":
      return "=";
  }
};

/** Lo que la ficha muestra. Es lo que el jugador compara cuando elige. */
const texto = (o: CompOption): string =>
  o.pieces.length > 0 ? o.pieces.map(pieza).join(" ") : String(o.value);

const cadena = (ms: readonly CompMachine[]): string =>
  ms.length === 0 ? "vacía" : ms.map((m) => `${m.name}: ${SIGNO[m.op]}${m.value}`).join(" → ");

/**
 * Cómo se contesta cada ronda. No es decoración: en la medición, describir el
 * gesto mal —una lista de fichas vacía se lee como una ronda sin respuesta
 * posible— fue la mayor fuente de ruido.
 */
const GESTO: Readonly<Record<CompAsk, string>> = {
  watch: "tocando una de las fichas, la que muestra la bola que salió",
  swap: "tocando una de las fichas, la que muestra lo que sale con las máquinas dadas vuelta",
  connect: "arrastrando máquinas del cajón a las ranuras del caño, sin fichas",
  which: "tocando uno de los dos carriles",
  order: "tocando las máquinas para cambiarlas de orden, sin fichas",
  predict: "tocando una de las fichas, antes de soltar la bola",
  lasso: "rodeando las dos máquinas con un trazo, sin fichas",
  nest: "tocando una de las fichas",
  chain3: "tocando las máquinas para cambiarlas de orden, sin fichas",
  commutes: "contestando sí o no",
  reject: "tocando la cadena escrita que no se puede correr",
};

function describir(p: CompProblem, _nivel: CompLevel, consigna: string): Estado {
  const conFichas = p.options.length > 0;
  return {
    consigna,
    escena: {
      lo_que_pregunta: p.ask,
      como_se_contesta: GESTO[p.ask],
      cadena_en_el_cano: cadena(p.chain),
      otro_carril: p.other.length > 0 ? cadena(p.other) : "no hay",
      cajon_de_maquinas: p.tray.length > 0 ? cadena(p.tray) : "vacío",
      bola_que_entra: p.input,
      salida_pedida: Number.isFinite(p.target) ? p.target : "ninguna: hay que descartar",
      ...(p.other.length > 0 ? { salida_del_otro_carril: p.otherOutput } : {}),
      ...(conFichas
        ? {
            fichas_para_elegir: p.options.map(texto),
            // Cuál es la correcta se dice: la pregunta no es resolver la ronda
            // sino si la ronda está bien planteada.
            ficha_correcta: p.options.findIndex((o) => o.correct) + 1,
          }
        : { cadena_que_se_espera: cadena(p.solution) }),
    },
  };
}

function invariantes(p: CompProblem, _nivel: CompLevel): readonly Falla[] {
  const out: Falla[] = [];
  const falla = (regla: string, detalle: string): number => out.push({ regla, detalle });

  if (p.options.length > 0) {
    const correctas = p.options.filter((o) => o.correct);
    if (correctas.length !== 1) falla("no hay una sola ficha correcta", `hay ${correctas.length}`);

    const vistos = new Set<string>();
    for (const o of p.options) {
      const t = texto(o);
      if (vistos.has(t)) falla("dos fichas dicen lo mismo", `"${t}"`);
      vistos.add(t);
    }

    // El valor sólo se compara entre fichas que **son** un número. En `reject`
    // las fichas son cadenas escritas y dos que dan la misma salida no son
    // indistinguibles: lo que se elige ahí es la cadena, no su resultado.
    const valores = new Map<number, number>();
    for (const o of p.options) {
      if (o.chain.length > 0 || !Number.isFinite(o.value)) continue;
      valores.set(o.value, (valores.get(o.value) ?? 0) + 1);
    }
    for (const [v, n] of valores) if (n > 1) falla("dos fichas valen lo mismo", `${n} fichas valen ${v}`);
  }

  if (p.ask !== "reject" && p.solution.length > 0) {
    const corrida = compRun(p.input, p.solution);
    if (corrida.block === null && corrida.output !== p.target) {
      falla(
        "la salida pedida no es la que da la cadena",
        `pide ${p.target} y ${cadena(p.solution)} con ${p.input} da ${corrida.output}`,
      );
    }
    const buena = p.options.find((o) => o.correct);
    if (buena && buena.chain.length === 0 && Number.isFinite(p.target) && buena.value !== p.target) {
      falla("la ficha correcta no vale la salida pedida", `ficha ${buena.value}, salida ${p.target}`);
    }
  }

  // Dos carriles con la misma salida: tocar cualquiera de los dos es acertar.
  if (p.ask === "which" && p.target === p.otherOutput) {
    falla("los dos carriles dan lo mismo", `los dos dan ${p.target} con la bola ${p.input}`);
  }

  // El jugador decide mirando las dos salidas. Si se ven iguales, la respuesta
  // dibujada es "da igual", diga lo que diga la ronda.
  if (p.ask === "commutes" && p.commutes !== (p.target === p.otherOutput)) {
    falla(
      "la respuesta no es la que muestran los carriles",
      `la ronda dice ${p.commutes ? "que conmuta" : "que no conmuta"} y los carriles dan ${p.target} y ${p.otherOutput}`,
    );
  }

  // Si lo que viene puesto ya da la salida pedida, no hay nada que ordenar.
  if ((p.ask === "order" || p.ask === "chain3") && p.otherOutput === p.target) {
    falla("el orden que viene puesto ya da la salida pedida", `${cadena(p.chain)} ya da ${p.target}`);
  }

  if (p.ask === "reject") {
    const trabadas = p.options.filter((o) => compRun(p.input, o.chain).block !== null);
    if (trabadas.length !== 1) {
      falla("no hay una sola cadena que se trabe", `se traban ${trabadas.length} de ${p.options.length}`);
    }
  }

  return out;
}

/**
 * Las rondas que se ganan eligiendo o armando algo concreto. `lasso` queda
 * afuera: rodear las dos máquinas con un trazo es un solo gesto sin nada
 * equivocado en pantalla, y preguntarle si tiene una sola respuesta es
 * preguntarle mal.
 */
const CON_ELECCION: readonly CompAsk[] = [
  "watch",
  "swap",
  "connect",
  "which",
  "order",
  "predict",
  "nest",
  "chain3",
  "commutes",
  "reject",
];

export const COMPOSICION: DefinicionNodo<CompLevel, CompProblem> = {
  id: "alg.fn.composition",
  niveles: COMP_LEVELS,
  // Un nivel con tres preguntas y seis rondas las alterna; barrer menos rondas
  // que preguntas dejaría gestos sin visitar nunca.
  rondas: (nivel) => Math.max(nivel.rounds, nivel.asks.length),
  generar: (nivel, semilla, ronda) => generateComposition(nivel, semilla, ronda),
  ask: (p) => p.ask,
  conEleccion: (p) => CON_ELECCION.includes(p.ask),
  describir,
  invariantes,
};
