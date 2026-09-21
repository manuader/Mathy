/**
 * `arith.div.undo_mul`: la banda, el piso y el llavero.
 *
 * El invariante del nodo está escrito en la mecánica como una función —
 * `opensChest`: la llave devuelve lo que había si y sólo si su dial mide lo
 * mismo que el estirado— así que acá no se vuelve a escribir: se comprueba que
 * la llave que la ronda marca como correcta sea exactamente la que esa función
 * abre. Lo mismo con `splitRows` y el piso.
 *
 * "Dos opciones que se leen igual" tiene acá una forma propia: dos llaves con la
 * misma forma y el mismo dial son la misma llave dibujada dos veces, y hasta el
 * nivel 5 no hay numerales, así que la llave se compara mirando.
 */

import {
  DIV_LEVELS,
  generateDivUndoMul,
  hiddenSide,
  opensChest,
  shownSide,
  splitRows,
  type DivAsk,
  type DivLevel,
  type DivProblem,
} from "@mathy/mechanics";
import type { DefinicionNodo, Estado, Falla } from "../generadores.ts";

const CLASE: Readonly<Record<string, string>> = {
  shrink: "encoger",
  cut: "recortar",
  stretch: "estirar",
  turn: "girar",
  hat: "sombrero",
  color: "color",
  flat: "aplastar contra el clavo, que no tiene vuelta",
};

const GESTO: Readonly<Record<DivAsk, string>> = {
  shrink: "arrastrando una llave a la cerradura y girando su dial hasta que las marcas caigan sobre las de la banda testigo",
  which: "tocando una de las dos animaciones: la que recorta el extremo en vez de encoger",
  wall: "tocando una de las fichas: la del lado que la pared tapa",
  ghost: "tocando una de las fichas: la del resultado de la cuenta escrita",
  leftover: "tocando una de las fichas: cuántas filas enteras salieron",
  undo: "tocando una de las fichas de acción: la que deshace lo que la cerradura hizo",
};

/** Lo que la mecánica contesta en cada ronda de ficha. */
const respuestaDe = (p: DivProblem): number => (p.ask === "wall" ? hiddenSide(p) : p.rest);

function describir(p: DivProblem, _nivel: DivLevel, consigna: string): Estado {
  const conFichas = p.options.length > 0;
  return {
    consigna,
    escena: {
      lo_que_pregunta: p.ask,
      como_se_contesta: GESTO[p.ask],
      banda_estirada: `${p.total} marcas sobre una regla de ${p.length}`,
      cuanto_se_estiro: p.factor,
      banda_en_reposo: p.rest,
      piso: `${p.rows} filas por ${p.cols} columnas`,
      lado_que_tapa_la_pared: p.ask === "wall" ? `${p.hidden} (se ve el otro, que vale ${shownSide(p)})` : "ninguno",
      baldosas_sueltas: p.leftover,
      dial_arranca_en: p.dialStart,
      llaves_del_llavero:
        p.keys.length > 0 ? p.keys.map((k) => `${CLASE[k.kind] ?? k.kind} con dial ${k.dial}`) : "no hay",
      ...(p.keys.length > 0 ? { llave_correcta: p.keys.findIndex((k) => k.correct) + 1 } : {}),
      ...(p.ask === "undo"
        ? {
            cerradura: `${CLASE[p.lock.kind] ?? p.lock.kind} con dial ${p.lock.dial}`,
            fichas_de_accion: p.actions.map((a) => `${CLASE[a.kind] ?? a.kind} con dial ${a.dial}`),
            ficha_correcta: p.actions.findIndex((a) => a.correct) + 1,
          }
        : {}),
      ...(conFichas
        ? {
            fichas_para_elegir: p.options.map((o) => o.value),
            ficha_correcta: p.options.findIndex((o) => o.correct) + 1,
          }
        : {}),
    },
  };
}

function invariantes(p: DivProblem, _nivel: DivLevel): readonly Falla[] {
  const out: Falla[] = [];
  const falla = (regla: string, detalle: string): number => out.push({ regla, detalle });

  if (p.rows * p.cols + p.leftover !== p.total) {
    falla("el piso no da el total", `${p.rows} × ${p.cols} + ${p.leftover} ≠ ${p.total}`);
  }
  if (p.leftover >= p.factor) {
    falla("sobran más baldosas que las que entran en una fila", `sobran ${p.leftover} y la fila lleva ${p.factor}`);
  }
  const repartido = splitRows(p.total, p.factor);
  if (repartido.rows !== p.rest || repartido.leftover !== p.leftover) {
    falla(
      "el reparto declarado no es el que da la mecánica",
      `dice ${p.rest} y sobran ${p.leftover}; splitRows da ${repartido.rows} y sobran ${repartido.leftover}`,
    );
  }

  if (p.keys.length > 0) {
    const abren = p.keys.filter((k) => opensChest(p.factor, k.kind, k.dial));
    if (abren.length !== 1) falla("no hay una sola llave que abra", `abren ${abren.length} de ${p.keys.length}`);
    for (const k of p.keys) {
      if (k.correct !== opensChest(p.factor, k.kind, k.dial)) {
        falla(
          "una llave dice abrir y no abre",
          `${CLASE[k.kind] ?? k.kind} con dial ${k.dial} declara ${k.correct} y el estirado fue ${p.factor}`,
        );
      }
    }
    const vistas = new Set<string>();
    for (const k of p.keys) {
      const cara = `${k.kind}:${k.dial}`;
      if (vistas.has(cara)) falla("dos llaves se ven iguales", `${CLASE[k.kind] ?? k.kind} con dial ${k.dial}`);
      vistas.add(cara);
    }
  }

  if (p.options.length > 0) {
    const correctas = p.options.filter((o) => o.correct);
    if (correctas.length !== 1) falla("no hay una sola ficha correcta", `hay ${correctas.length}`);
    const vistas = new Set<number>();
    for (const o of p.options) {
      if (vistas.has(o.value)) falla("dos fichas valen lo mismo", `${o.value}`);
      vistas.add(o.value);
    }
    const buena = correctas[0];
    const esperada = respuestaDe(p);
    if (buena && buena.value !== esperada) {
      falla("la ficha correcta no es la que da la mecánica", `la ficha dice ${buena.value} y la cuenta da ${esperada}`);
    }
  }

  if (p.ask === "undo") {
    const correctas = p.actions.filter((a) => a.correct);
    if (correctas.length !== 1) falla("no hay una sola acción correcta", `hay ${correctas.length} de ${p.actions.length}`);
    const vistas = new Set<string>();
    for (const a of p.actions) {
      const cara = `${a.kind}:${a.dial}`;
      if (vistas.has(cara)) falla("dos fichas de acción se ven iguales", `${CLASE[a.kind] ?? a.kind} con dial ${a.dial}`);
      vistas.add(cara);
    }
    const buena = correctas[0];
    if (buena) {
      // La banda aplastada no tiene vuelta: ahí la respuesta es la ficha de
      // "cofre sin llave", y en cualquier otra cerradura es su propia clase con
      // su propio dial.
      const esperada =
        p.lock.kind === "flat"
          ? buena.uninvertible
          : buena.kind === p.lock.kind && buena.dial === p.lock.dial && !buena.uninvertible;
      if (!esperada) {
        falla(
          "la acción correcta no deshace la cerradura",
          `la cerradura es ${CLASE[p.lock.kind] ?? p.lock.kind} con dial ${p.lock.dial} y la ficha correcta es ${CLASE[buena.kind] ?? buena.kind} con dial ${buena.dial}`,
        );
      }
    }
  }

  // Si el dial ya viene en el valor correcto no queda nada que calibrar, que es
  // la cuarta dificultad del nodo y la razón de ser del nivel.
  if (p.ask === "shrink" && p.dialStart === p.factor) {
    falla("el dial ya arranca calibrado", `arranca en ${p.dialStart} y el estirado fue ${p.factor}`);
  }

  if (p.ask === "which" && p.liar !== 0 && p.liar !== 1) {
    falla("la animación que recorta no es ninguna de las dos", `liar = ${p.liar}`);
  }

  return out;
}

/**
 * Las rondas que se ganan eligiendo. `shrink` queda afuera: elegir la llave es
 * elegir, pero ganar la ronda es además calibrar el dial, y esa parte no tiene
 * "una sola respuesta" en el sentido de la pregunta.
 */
const CON_ELECCION: readonly DivAsk[] = ["which", "wall", "ghost", "leftover", "undo"];

export const DIVISION: DefinicionNodo<DivLevel, DivProblem> = {
  id: "arith.div.undo_mul",
  niveles: DIV_LEVELS,
  rondas: (nivel) => Math.max(nivel.rounds, nivel.asks.length),
  generar: (nivel, semilla, ronda) => generateDivUndoMul(nivel, semilla, ronda),
  ask: (p) => p.ask,
  conEleccion: (p) => CON_ELECCION.includes(p.ask),
  describir,
  invariantes,
};
