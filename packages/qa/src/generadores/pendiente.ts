/**
 * `alg.fn.linear_slope`: la rampa.
 *
 * Es el nodo donde aparecieron los dos bugs que dieron origen a todo esto, y los
 * dos se ven en la descripción de la instancia antes de dibujarla: una recta de
 * más que volvía ambigua la pregunta, y dos fichas que eran la misma cuesta
 * escrita distinto. El invariante del nodo es `slSameRatio`, así que "dos
 * opciones que valen lo mismo" acá quiere decir dos razones que son la misma
 * cuesta: `2/1` y `6/3` son una sola respuesta con dos caras.
 *
 * Lo que el jugador ve de `read_form` son **dos** rectas escritas: la actividad
 * muestra `written.slice(0, 2)`, que son la misma recta despejada y sin
 * despejar. La tercera que el generador todavía arma no llega a la pantalla, y
 * describir tres sería describir una ronda que nadie juega.
 */

import {
  SL_LEVELS,
  generateSlope,
  slBetween,
  slReduce,
  slSameRatio,
  slSlopeOfWritten,
  type SlAsk,
  type SlLevel,
  type SlProblem,
  type SlRamp,
  type SlRatio,
  type SlWritten,
} from "@mathy/mechanics";
import type { DefinicionNodo, Estado, Falla } from "../generadores.ts";

/** Cuántas rectas escritas llegan a la pantalla en `read_form`. */
const RECTAS_A_LA_VISTA = 2;

const razon = (r: SlRatio): string => `${r.rise}/${r.run}`;

const recta = (w: SlWritten): string =>
  `${w.a}x ${w.b >= 0 ? "+" : "−"} ${Math.abs(w.b)}y = ${w.c}`;

const rampa = (r: SlRamp): string =>
  `sube ${r.slope.rise} cada ${r.slope.run} y arranca en ${r.intercept}`;

const GESTO: Readonly<Record<SlAsk, string>> = {
  pick_ramp: "tocando una de las rampas dibujadas",
  which_harder: "tocando una de las rampas dibujadas",
  place_step: "arrastrando el escalón a otro lugar de la misma rampa, sin fichas",
  stretch_step: "estirando el escalón hasta que vuelva a apoyar, sin fichas",
  crank: "girando la manivela hasta la casilla marcada, sin fichas",
  stretch_grid: "estirando la grilla hasta que la rampa pase por el punto, sin fichas",
  set_sliders: "moviendo los dos deslizadores hasta que la rampa pase por los dos puntos, sin fichas",
  slope_between: "tocando una de las fichas de razón",
  read_form: "tocando una de las fichas de razón",
  judge_slope: "tocando una de las respuestas escritas",
};

/** Las rectas que el jugador tiene delante, que no siempre son las que hay. */
const aLaVista = (p: SlProblem): readonly SlWritten[] =>
  p.ask === "read_form" ? p.written.slice(0, RECTAS_A_LA_VISTA) : p.written;

function describir(p: SlProblem, _nivel: SlLevel, consigna: string): Estado {
  const rectas = aLaVista(p);
  const conFichas = p.options.length > 0;
  const eligeRampa = p.ask === "pick_ramp" || p.ask === "which_harder";
  return {
    consigna,
    escena: {
      lo_que_pregunta: p.ask,
      como_se_contesta: GESTO[p.ask],
      rampas_dibujadas: p.ramps.length > 0 ? p.ramps.map(rampa) : "no hay",
      rectas_escritas: rectas.length > 0 ? rectas.map(recta) : "no hay",
      ...(rectas.length > 0
        ? {
            pendiente_de_cada_recta: rectas.map((w) => {
              const r = slSlopeOfWritten(w);
              return r ? razon(r) : "vertical: no tiene pendiente";
            }),
          }
        : {}),
      escalon: `desde ${p.step.from}, ancho ${p.step.run}, sube ${p.step.rise}`,
      puntos_marcados: p.points.length > 0 ? p.points.map((q) => `(${q.x}, ${q.y})`) : "no hay",
      ...(p.ask === "crank" ? { vueltas_pedidas: p.turns } : {}),
      ...(p.ask === "stretch_grid" ? { cuanto_hay_que_estirar: p.stretch } : {}),
      ...(p.ask === "judge_slope" ? { caso: p.kase } : {}),
      ...(conFichas
        ? { fichas_para_elegir: p.options.map(razon), ficha_correcta: p.correct + 1 }
        : {}),
      ...(eligeRampa ? { rampa_correcta: p.correct + 1 } : {}),
    },
  };
}

function invariantes(p: SlProblem, _nivel: SlLevel): readonly Falla[] {
  const out: Falla[] = [];
  const falla = (regla: string, detalle: string): number => out.push({ regla, detalle });

  if (p.options.length > 0) {
    // Dos razones que son la misma cuesta son una sola respuesta con dos caras.
    for (let i = 0; i < p.options.length; i += 1) {
      for (let j = i + 1; j < p.options.length; j += 1) {
        const a = p.options[i] as SlRatio;
        const b = p.options[j] as SlRatio;
        if (slSameRatio(a, b)) falla("dos fichas son la misma cuesta", `${razon(a)} y ${razon(b)}`);
      }
    }
    if (p.correct < 0 || p.correct >= p.options.length) {
      falla("no hay una sola ficha correcta", `la correcta es la ${p.correct} de ${p.options.length}`);
    }
  }

  if (p.ask === "slope_between") {
    const [a, b] = [p.points[0], p.points[1]];
    if (!a || !b) falla("faltan los dos puntos que se miden", `hay ${p.points.length}`);
    else {
      const medida = slBetween(a, b);
      const elegida = p.options[p.correct];
      if (!medida) falla("los dos puntos están en la misma vertical", `x = ${a.x}`);
      else if (elegida && !slSameRatio(medida, elegida)) {
        falla(
          "la ficha correcta no es la pendiente entre los puntos",
          `la ficha dice ${razon(elegida)} y entre (${a.x}, ${a.y}) y (${b.x}, ${b.y}) hay ${razon(medida)}`,
        );
      }
    }
  }

  if (p.ask === "read_form") {
    const rectas = aLaVista(p);
    const pendientes = rectas.map(slSlopeOfWritten);
    // El bug real: con dos rectas distintas a la vista, "la pendiente de la
    // recta escrita" no nombra una sola cosa.
    for (let i = 1; i < pendientes.length; i += 1) {
      const u = pendientes[0];
      const v = pendientes[i];
      if (u && v && !slSameRatio(u, v)) {
        falla(
          "hay dos rectas a la vista con pendientes distintas",
          `${recta(rectas[0] as SlWritten)} da ${razon(u)} y ${recta(rectas[i] as SlWritten)} da ${razon(v)}`,
        );
      }
    }
    const primera = pendientes[0];
    const elegida = p.options[p.correct];
    if (primera && elegida && !slSameRatio(primera, elegida)) {
      falla(
        "la ficha correcta no es la pendiente de la recta escrita",
        `la ficha dice ${razon(elegida)} y la recta tiene ${razon(primera)}`,
      );
    }
  }

  if (p.ask === "pick_ramp" || p.ask === "which_harder") {
    for (let i = 0; i < p.ramps.length; i += 1) {
      for (let j = i + 1; j < p.ramps.length; j += 1) {
        const a = p.ramps[i] as SlRamp;
        const b = p.ramps[j] as SlRamp;
        if (slSameRatio(slReduce(a.slope), slReduce(b.slope))) {
          falla("dos rampas dibujadas son la misma cuesta", `${rampa(a)} y ${rampa(b)}`);
        }
      }
    }
    if (p.correct < 0 || p.correct >= p.ramps.length) {
      falla("no hay una sola rampa correcta", `la correcta es la ${p.correct} de ${p.ramps.length}`);
    }
  }

  if (p.ask === "judge_slope") {
    const [u, v] = [p.ramps[0], p.ramps[1]];
    if (p.kase === "vertical") {
      const w = p.written[0];
      if (!w || w.b !== 0) falla("el caso dice vertical y la recta escrita no lo es", recta(w ?? { form: "unsolved", a: 0, b: 0, c: 0 }));
    } else if (p.kase === "flat") {
      if (!u || u.slope.rise !== 0) falla("el caso dice plana y la rampa sube", u ? rampa(u) : "no hay rampa");
    } else if (u && v) {
      const iguales = slSameRatio(slReduce(u.slope), slReduce(v.slope));
      if (p.kase === "parallel" && !iguales) {
        falla("el caso dice paralelas y las cuestas son distintas", `${rampa(u)} y ${rampa(v)}`);
      }
      if (p.kase === "parallel" && iguales && u.intercept === v.intercept) {
        falla("el caso dice paralelas y las dos rectas son la misma", rampa(u));
      }
      if (p.kase === "crossing" && iguales) {
        falla("el caso dice que se cruzan y las cuestas son la misma", `${rampa(u)} y ${rampa(v)}`);
      }
    } else {
      falla("el caso pide dos rectas y no hay dos", `hay ${p.ramps.length} rampas`);
    }
  }

  if (p.ask === "set_sliders") {
    const [a, b] = [p.points[0], p.points[1]];
    if (!a || !b) falla("faltan los dos puntos por los que pasar", `hay ${p.points.length}`);
    else if (a.x === b.x) falla("los dos puntos están en la misma vertical", `x = ${a.x}`);
  }

  if (p.ask === "crank" && p.turns < 1) {
    falla("la manivela no pide ninguna vuelta", `pide ${p.turns}`);
  }

  if (p.ask === "stretch_grid" && p.stretch < 2) {
    falla("la grilla ya está donde hay que estirarla", `estirar por ${p.stretch}`);
  }

  return out;
}

/**
 * Las rondas que se ganan eligiendo. Las otras cinco son calibrado: apoyar el
 * escalón en otro lugar se gana con **cualquier** otro lugar, y preguntarle a un
 * modelo si eso tiene una sola respuesta es hacerle una pregunta cuya respuesta
 * correcta es "no" y no significa nada.
 */
const CON_ELECCION: readonly SlAsk[] = [
  "pick_ramp",
  "which_harder",
  "slope_between",
  "read_form",
  "judge_slope",
];

export const PENDIENTE: DefinicionNodo<SlLevel, SlProblem> = {
  id: "alg.fn.linear_slope",
  niveles: SL_LEVELS,
  rondas: (nivel) => Math.max(nivel.rounds, nivel.asks.length),
  generar: (nivel, semilla, ronda) => generateSlope(nivel, semilla, ronda),
  ask: (p) => p.ask,
  conEleccion: (p) => CON_ELECCION.includes(p.ask),
  describir,
  invariantes,
};
