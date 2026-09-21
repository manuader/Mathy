/**
 * `alg.sys.two_by_two`: el cartel de las frutas.
 *
 * Acá "dos opciones que valen lo mismo" no son dos fichas: son dos renglones
 * que dicen lo mismo, y eso no se ve mirando los números sueltos sino
 * resolviendo el sistema. Por eso los invariantes de este nodo se apoyan en
 * `sysSolve` y en `sysEval`, que son las funciones con las que el juego decide:
 * si el invariante usara su propia cuenta, estaría revisando otro juego.
 */

import {
  SYS_LEVELS,
  generateSystems,
  sysCoef,
  sysEval,
  sysSolve,
  type SysAsk,
  type SysLevel,
  type SysProblem,
  type SysRow,
} from "@mathy/mechanics";
import type { DefinicionNodo, Estado, Falla } from "../generadores.ts";

const FRUTA: readonly string[] = ["manzanas", "bananas"];

const fila = (r: SysRow): string => {
  const partes = r.terms.map((t, i) => {
    const signo = t.coef < 0 ? "−" : i === 0 ? "" : "+";
    return `${signo} ${Math.abs(t.coef)} ${FRUTA[t.fruit] ?? "?"}`.trim();
  });
  return `${partes.join(" ")} = ${r.total}`;
};

const GESTO: Readonly<Record<SysAsk, string>> = {
  share: "arrastrando una ficha del mostrador a la fruta de la fila",
  pairs: "arrastrando fichas del mostrador a las dos frutas, y repitiéndolo con otros pares",
  substitute: "tocando la fruta que la primera fila ya reveló, para cambiarla por su valor en las dos filas",
  pour: "volcando un renglón sobre el otro hasta que una fruta se cancela",
  choose: "eligiendo el método —volcar o sustituir— con las fichas de factor a mano",
  classify: "tocando una de las tres respuestas escritas: una sola, ninguna o infinitas",
};

/** Las rondas que se contestan poniendo fichas del mostrador. */
const CON_FICHAS: readonly SysAsk[] = ["share", "pairs", "substitute", "pour", "choose"];

function describir(p: SysProblem, _nivel: SysLevel, consigna: string): Estado {
  return {
    consigna,
    escena: {
      lo_que_pregunta: p.ask,
      como_se_contesta: GESTO[p.ask],
      renglones_del_cartel: p.rows.map(fila),
      fichas_del_mostrador: p.chips.length > 0 ? p.chips : "no hay",
      fichas_de_factor: p.factors.length > 0 ? p.factors : "no hay",
      ...(p.ask === "pairs" ? { cuantos_pares_hay_que_encontrar: p.picks } : {}),
      ...(p.ask === "classify" ? { respuesta_correcta: p.kind } : {}),
      ...(p.ask !== "classify"
        ? {
            valor_de_cada_fruta: p.solution.map((v, i) =>
              v === null ? `${FRUTA[i] ?? "?"}: la escena no lo determina` : `${FRUTA[i] ?? "?"}: ${v}`,
            ),
          }
        : {}),
    },
  };
}

/** Cuántas asignaciones del mostrador dejan derecha la fila. */
function paresPosibles(row: SysRow, chips: readonly number[]): number {
  let n = 0;
  for (const x of chips) for (const y of chips) if (sysEval(row, [x, y]) === row.total) n += 1;
  return n;
}

function invariantes(p: SysProblem, nivel: SysLevel): readonly Falla[] {
  const out: Falla[] = [];
  const falla = (regla: string, detalle: string): number => out.push({ regla, detalle });

  // La respuesta que la ronda declara tiene que dejar derechos los renglones
  // dibujados. Es la versión de este nodo de "la respuesta pedida no coincide
  // con lo que da la mecánica".
  for (const r of p.rows) {
    const izquierda = sysEval(r, p.solution);
    if (izquierda !== null && izquierda !== r.total) {
      falla("la respuesta declarada no deja derecho el renglón", `${fila(r)} con ${JSON.stringify(p.solution)} da ${izquierda}`);
    }
  }

  const repetidas = new Set<number>();
  for (const c of p.chips) {
    if (repetidas.has(c)) falla("dos fichas del mostrador dicen lo mismo", `${c}`);
    repetidas.add(c);
  }

  if (CON_FICHAS.includes(p.ask)) {
    for (const [i, v] of p.solution.entries()) {
      if (v !== null && !p.chips.includes(v)) {
        falla("la respuesta no está en el mostrador", `${FRUTA[i] ?? "?"} valen ${v} y las fichas son ${p.chips.join(", ")}`);
      }
    }
  }

  const [a, b] = [p.rows[0], p.rows[1]];

  if (p.ask === "share") {
    const r = p.rows[0];
    const k = r ? sysCoef(r, 0) : 0;
    if (!r || p.rows.length !== 1) falla("repartir pide una sola fila", `hay ${p.rows.length}`);
    else if (k === 0 || r.total % k !== 0) falla("el total no se reparte entero", fila(r));
  }

  if (p.ask === "pairs") {
    const r = p.rows[0];
    if (!r) falla("la ronda de los pares no tiene fila", "no hay renglones");
    else {
      const posibles = paresPosibles(r, p.chips);
      if (posibles < p.picks) {
        falla(
          "el mostrador no da tantos pares como pide la ronda",
          `pide ${p.picks} y con ${p.chips.join(", ")} sobre ${fila(r)} salen ${posibles}`,
        );
      }
    }
  }

  // Sustituir, volcar y elegir se ganan encontrando **el** par: si el sistema
  // admitiera otro, la ronda tendría dos respuestas y las dos estarían bien.
  if (p.ask === "substitute" || p.ask === "pour" || p.ask === "choose") {
    if (!a || !b) falla("la ronda pide dos filas y no hay dos", `hay ${p.rows.length}`);
    else {
      const clase = sysSolve(a, b).kind;
      if (clase !== "unique") {
        falla("el sistema no tiene una sola respuesta", `${fila(a)} y ${fila(b)} dan ${clase}`);
      }
    }
  }

  if (p.ask === "pour" || p.ask === "choose") {
    if (p.plan === null) falla("no hay ningún plan para cancelar una fruta", "sysEliminationPlan dio null");
    // Sin escalado, la fruta tiene que venir ya cancelada: volcar es el gesto
    // entero del nivel y sin cancelación no hay nada que volcar.
    if (nivel.params.scaling === "none" && p.cancels < 0) {
      falla("volcar los renglones como vienen no cancela ninguna fruta", a && b ? `${fila(a)} y ${fila(b)}` : "sin filas");
    }
  }

  if (p.ask === "classify") {
    if (!a || !b) falla("clasificar pide dos filas y no hay dos", `hay ${p.rows.length}`);
    else {
      const clase = sysSolve(a, b).kind;
      if (clase !== p.kind) {
        falla("la clase declarada no es la que dan las filas", `dice ${p.kind} y ${fila(a)} con ${fila(b)} dan ${clase}`);
      }
    }
  }

  return out;
}

/**
 * Las rondas que se ganan eligiendo **una** cosa. `pairs` queda afuera a
 * propósito: el nivel entero trata de que haya muchos pares y ninguno sea "la"
 * respuesta, así que preguntarle si tiene una sola sería contradecir el nivel.
 */
const CON_ELECCION: readonly SysAsk[] = ["share", "substitute", "pour", "choose", "classify"];

export const SISTEMAS: DefinicionNodo<SysLevel, SysProblem> = {
  id: "alg.sys.two_by_two",
  niveles: SYS_LEVELS,
  rondas: (nivel) => Math.max(nivel.rounds, nivel.asks.length),
  generar: (nivel, semilla, ronda) => generateSystems(nivel, semilla, ronda),
  ask: (p) => p.ask,
  conEleccion: (p) => CON_ELECCION.includes(p.ask),
  describir,
  invariantes,
};
