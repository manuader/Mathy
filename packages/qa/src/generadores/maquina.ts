/**
 * `alg.fn.function_as_machine`: la máquina.
 *
 * El nodo entero se apoya en una diferencia: una regla que da **dos** salidas
 * para la misma entrada no es una máquina. Esa diferencia la deciden
 * `fnRowsAreFunction` y `fnNetworkIsFunction`, así que los invariantes de acá
 * las llaman en vez de repetirlas: lo que se revisa es que la ronda declare
 * como correcto lo mismo que esas funciones dicen.
 *
 * El invariante que más importa es el de `name`: dos máquinas en pantalla y una
 * salida pedida que tiene que separarlas. Si las dos dieran lo mismo, tocar
 * cualquiera sería acertar y la ronda tendría dos respuestas.
 */

import {
  FN_LEVELS,
  fnNetworkIsFunction,
  fnRowsAreFunction,
  fnRun,
  generateMachine,
  type FnAsk,
  type FnLevel,
  type FnMachine,
  type FnOption,
  type FnPiece,
  type FnProblem,
  type FnRow,
} from "@mathy/mechanics";
import type { DefinicionNodo, Estado, Falla } from "../generadores.ts";

const SIGNO: Readonly<Record<string, string>> = { add: "+", sub: "−", mul: "×", div: "÷" };

const pieza = (p: FnPiece): string => {
  switch (p.kind) {
    case "num":
      return String(p.value);
    case "sym":
      return p.name;
    case "op":
      return SIGNO[p.op] ?? "?";
    case "open":
      return "(";
    case "close":
      return ")";
    case "eq":
      return "=";
  }
};

const texto = (o: FnOption): string => o.pieces.map(pieza).join(" ");

const maquina = (m: FnMachine): string =>
  `${SIGNO[m.op]}${m.value}${m.fork ? ` y además un desvío ${SIGNO[m.fork.op]}${m.fork.value}` : ""}`;

const cadena = (ms: readonly FnMachine[]): string =>
  ms.length === 0 ? "vacía" : ms.map(maquina).join(" → ");

const tabla = (rows: readonly FnRow[]): readonly string[] =>
  rows.map((r) => `entra ${r.input} y sale ${r.output}${r.second === null ? "" : ` y también ${r.second}`}`);

const GESTO: Readonly<Record<FnAsk, string>> = {
  guess: "metiendo fichas de número en la máquina hasta dar con la que sale como pide la salida pedida",
  build: "arrastrando fichas de operación del cajón al caño hasta que la máquina dé la tabla, sin fichas de respuesta",
  broken: "arrastrando fichas de operación del cajón al caño hasta que la máquina dé la tabla, sin fichas de respuesta",
  network: "colgando una flecha desde cada punto de entrada hasta el punto de salida que le toca",
  judge: "tocando una de las dos redes dibujadas: la que no es una máquina",
  name: "tocando una de las dos máquinas: la que da la salida pedida",
  evaluate: "tocando una de las fichas",
  letters: "tocando una de las fichas",
  chain: "tocando las máquinas para cambiarlas de orden, sin fichas",
  reject: "metiendo fichas de número en la máquina; algunas las escupe sin procesar",
  sameRule: "tocando una de las fichas: la otra escritura de la misma regla",
  fromTable: "tocando una de las fichas de regla",
  relation: "contestando sí o no: si la tabla es una función",
};

/** Las rondas donde la salida pedida sale de correr la cadena con la entrada. */
const CON_SALIDA: readonly FnAsk[] = ["guess", "build", "broken", "name", "evaluate", "chain", "reject"];

function describir(p: FnProblem, _nivel: FnLevel, consigna: string): Estado {
  return {
    consigna,
    escena: {
      lo_que_pregunta: p.ask,
      como_se_contesta: GESTO[p.ask],
      maquina_en_el_cano: cadena(p.machines),
      otra_maquina: p.other.length > 0 ? cadena(p.other) : "no hay",
      cajon_de_operaciones: p.tray.length > 0 ? cadena(p.tray) : "vacío",
      fichas_de_numero: p.tokens.length > 0 ? p.tokens : "no hay",
      ...(CON_SALIDA.includes(p.ask) ? { entrada: p.input, salida_pedida: p.target } : {}),
      tabla: p.rows.length > 0 ? tabla(p.rows) : "no hay",
      ...(p.ask === "fromTable" ? { entrada_extra_que_separa: p.extra } : {}),
      ...(p.argument.length > 0 ? { se_evalua_en: p.argument.map(pieza).join(" ") } : {}),
      ...(p.networks.length > 0
        ? {
            redes: p.networks.map(
              (n) =>
                `entradas ${n.inputs.join(", ")} · salidas ${n.outputs.join(", ")} · flechas ${
                  n.arrows.length === 0 ? "ninguna todavía" : n.arrows.map((a) => `${a.from}→${a.to}`).join(" ")
                }`,
            ),
            red_que_es_funcion: p.networks.map((n) => n.isFunction),
          }
        : {}),
      ...(p.options.length > 0
        ? {
            fichas_para_elegir: p.options.map(texto),
            ficha_correcta: p.options.findIndex((o) => o.correct) + 1,
          }
        : {}),
      ...(p.ask === "relation" ? { respuesta_correcta: fnRowsAreFunction(p.rows) ? "sí" : "no" } : {}),
    },
  };
}

function invariantes(p: FnProblem, _nivel: FnLevel): readonly Falla[] {
  const out: Falla[] = [];
  const falla = (regla: string, detalle: string): number => out.push({ regla, detalle });

  if (p.options.length > 0) {
    const correctas = p.options.filter((o) => o.correct);
    if (correctas.length !== 1) falla("no hay una sola ficha correcta", `hay ${correctas.length}`);
    if (p.options.length < 2) falla("hay una sola ficha para elegir", texto(p.options[0] as FnOption));
    const vistos = new Set<string>();
    for (const o of p.options) {
      const t = texto(o);
      if (vistos.has(t)) falla("dos fichas dicen lo mismo", `"${t}"`);
      vistos.add(t);
    }
  }

  if (CON_SALIDA.includes(p.ask) && p.solution.length > 0) {
    const corrida = fnRun(p.input, p.solution);
    if (corrida.rejectedAt < 0 && corrida.output !== p.target) {
      falla(
        "la salida pedida no es la que da la máquina",
        `pide ${p.target} y ${cadena(p.solution)} con ${p.input} da ${corrida.output}`,
      );
    }
  }

  // Dos máquinas y una salida que tiene que separarlas: si dieran lo mismo,
  // tocar cualquiera sería acertar.
  if (p.ask === "name" && p.other.length > 0) {
    const a = fnRun(p.input, p.machines).output;
    const b = fnRun(p.input, p.other).output;
    if (a === b) falla("las dos máquinas dan la misma salida", `las dos dan ${a} con la entrada ${p.input}`);
  }

  if (p.ask === "chain" && fnRun(p.input, p.machines).output === p.target) {
    falla("el orden que viene puesto ya da la salida pedida", `${cadena(p.machines)} ya da ${p.target}`);
  }

  if (p.ask === "build" || p.ask === "broken") {
    for (const r of p.rows) {
      const salida = fnRun(r.input, p.solution).output;
      if (salida !== r.output) {
        falla("la tabla no es la que da la máquina", `entra ${r.input}, la tabla dice ${r.output} y la máquina da ${salida}`);
      }
    }
    // Sin las piezas en el cajón la ronda no se puede ganar.
    for (const m of p.solution) {
      if (!p.tray.some((t) => t.op === m.op && t.value === m.value && t.fork === null)) {
        falla("el cajón no tiene con qué armar la máquina", `falta ${maquina(m)} y el cajón trae ${cadena(p.tray)}`);
      }
    }
  }

  if (p.ask === "guess" && !p.tokens.includes(p.input)) {
    falla("la ficha que da la salida pedida no está en el cajón", `hace falta ${p.input} y hay ${p.tokens.join(", ")}`);
  }

  if (p.ask === "reject") {
    const acepta = (v: number): boolean => Number.isInteger(fnRun(v, p.machines).output);
    if (!acepta(p.input)) falla("la máquina no acepta la entrada de la ronda", `entra ${p.input} en ${cadena(p.machines)}`);
    if (!p.tokens.some((v) => !acepta(v))) {
      falla("la máquina acepta todas las fichas del cajón", `no hay nada que escupir entre ${p.tokens.join(", ")}`);
    }
  }

  if (p.ask === "network") {
    const red = p.networks[0];
    if (!red) falla("la ronda de la red no trae red", "networks vacío");
    else {
      for (const v of red.inputs) {
        const salida = fnRun(v, p.machines).output;
        if (!red.outputs.includes(salida)) {
          falla("un punto de entrada no tiene adónde llegar", `${v} sale ${salida} y la columna es ${red.outputs.join(", ")}`);
        }
      }
    }
  }

  if (p.ask === "judge") {
    const malas = p.networks.filter((n) => !n.isFunction);
    if (malas.length !== 1) falla("no hay una sola red que no sea máquina", `hay ${malas.length} de ${p.networks.length}`);
    for (const n of p.networks) {
      if (fnNetworkIsFunction(n.inputs.length, n.arrows) !== n.isFunction) {
        falla("la red dibujada no dice lo que la ronda declara", `${n.id} declara ${n.isFunction} y sus flechas dicen lo contrario`);
      }
    }
  }

  if (p.ask === "relation") {
    const repetida = p.rows.some((r, i) => p.rows.findIndex((s) => s.input === r.input) !== i);
    if (!repetida) falla("la tabla no repite ninguna entrada", tabla(p.rows).join(" · "));
  }

  if (p.ask === "fromTable" && p.rows.some((r) => r.input === p.extra)) {
    falla("la entrada extra ya está en la tabla", `la extra es ${p.extra} y la tabla trae ${tabla(p.rows).join(" · ")}`);
  }

  return out;
}

/**
 * Todas las rondas de este nodo se ganan eligiendo o armando algo concreto:
 * hasta la red se gana colgando una flecha por punto y no hay dos maneras.
 */
const CON_ELECCION: readonly FnAsk[] = [
  "guess",
  "build",
  "broken",
  "network",
  "judge",
  "name",
  "evaluate",
  "letters",
  "chain",
  "reject",
  "sameRule",
  "fromTable",
  "relation",
];

export const MAQUINA: DefinicionNodo<FnLevel, FnProblem> = {
  id: "alg.fn.function_as_machine",
  niveles: FN_LEVELS,
  rondas: (nivel) => Math.max(nivel.rounds, nivel.asks.length),
  generar: (nivel, semilla, ronda) => generateMachine(nivel, semilla, ronda),
  ask: (p) => p.ask,
  conEleccion: (p) => CON_ELECCION.includes(p.ask),
  describir,
  invariantes,
};
