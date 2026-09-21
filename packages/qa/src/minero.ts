/**
 * El minero de errores sin clasificar.
 *
 * L dice que un error es la evidencia más precisa que el juego tiene, y que la
 * taxonomía es abierta: la minería de estados erróneos reales es el mecanismo
 * por el que el catálogo crece. Hasta ahora ese mecanismo no tenía materia
 * prima. Cuando el jugador se equivocaba y ninguna regla `detect` coincidía,
 * el evento se guardaba sin nada que mirar. Desde que el intento fallido lleva
 * `snapshot` —una línea corta con el problema y el movimiento, escrita por la
 * actividad, que es el único código que sabe qué pasó— esos errores se pueden
 * juntar y contar.
 *
 * Lo que hace este archivo, y nada más:
 *
 * 1. Filtra los `attempt` con `correct: false`, sin `misconception` y con
 *    `snapshot`. Un error ya clasificado no se mina: ya tiene su entrada.
 * 2. Los agrupa por nodo y por forma. Dos líneas son la misma forma cuando
 *    sólo difieren en los números: `x + 5 = 12 · llave ÷5` y
 *    `x + 3 = 9 · llave ÷3` son el mismo error con otra ronda. Es el
 *    equivalente pobre del "diff estructural" de L, y alcanza porque la línea
 *    ya viene escrita por quien sabe qué pasó.
 * 3. Le pregunta a Jev, por grupo, tres cosas: si se parece a alguna
 *    misconception que el nodo ya tiene, de qué categoría de las siete es, y
 *    si parece un error sistemático o un dedazo.
 *
 * Lo que **no** hace, y es tan importante como lo que hace: no escribe reglas
 * `detect`, no toca `misconceptions.yaml`, no toca el modelo de mastery y no
 * decide nada. Escribir la entrada es trabajo de una persona —nombrar la idea,
 * elegir patrón y mecánica, comprobar que no se solape con una existente— y
 * esto le deja un informe ordenado por cuántas veces se vio cada grupo.
 *
 * ## El formato de entrada
 *
 * Un archivo JSON con los eventos exportados, que son la lista de `Event` de
 * `@mathy/progress` tal cual se guarda en `mathy.events.v1`. Se acepta la lista
 * pelada o envuelta en `{ "events": [...] }`, porque las dos formas aparecen
 * según de dónde salga el volcado:
 *
 * ```json
 * [
 *   { "kind": "attempt", "at": 1750000000000, "node": "alg.eq.one_step",
 *     "level": 4, "evidence": "apply", "correct": false, "latency": 5200,
 *     "snapshot": "x + 5 = 12 · cerradura +5 · llave ÷5" },
 *   { "kind": "levelDone", "at": 1750000001000, "node": "alg.eq.one_step", "level": 4 }
 * ]
 * ```
 *
 * Lo que no es un `attempt` se ignora en silencio: viaja en el mismo archivo
 * porque el registro es uno solo. No hay nada de la persona en ningún campo, y
 * este archivo no agrega ninguno.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Event } from "@mathy/progress";
import { REPO } from "./corpus.ts";
import type { Answers, Decider, QuestionSet } from "./types.ts";

// --- El catálogo -----------------------------------------------------------

/** Una entrada del catálogo, con lo poco que hace falta para comparar contra ella. */
export interface Miscon {
  readonly id: string;
  readonly category: string;
  readonly nodes: readonly string[];
  /** El nombre corto del locale `es`, que es el que una persona reconoce. */
  readonly nombre: string;
  /** Las reglas `detect`, abreviadas como `from → to`. */
  readonly regla: string;
}

interface DetectRule {
  readonly from?: string;
  readonly to?: string | readonly string[];
  readonly guard?: string;
}

const comoTexto = (to: DetectRule["to"]): string =>
  Array.isArray(to) ? to.join(" | ") : ((to as string | undefined) ?? "?");

const reglaTexto = (detect: unknown): string => {
  const reglas: readonly DetectRule[] = Array.isArray(detect)
    ? (detect as readonly DetectRule[])
    : detect
      ? [detect as DetectRule]
      : [];
  return (
    reglas
      .map((r) => `${r.from ?? "?"} → ${comoTexto(r.to)}${r.guard ? ` (si ${r.guard})` : ""}`)
      .join(" ; ") || "sin regla"
  );
};

/**
 * Lee el catálogo de L y los nombres del locale `es`. Los dos archivos, porque
 * `misconceptions.yaml` no tiene texto visible a propósito: el nombre vive en
 * el locale y sin él las opciones que recibe el modelo serían ids pelados.
 */
export function cargarCatalogo(): readonly Miscon[] {
  const datos = parse(readFileSync(join(REPO, "docs/L-modelo-errores/misconceptions.yaml"), "utf8")) as {
    readonly misconceptions?: readonly {
      readonly id: string;
      readonly category: string;
      readonly nodes: readonly string[];
      readonly detect?: unknown;
    }[];
  };
  const locale = parse(readFileSync(join(REPO, "docs/locales/es/misconceptions.yaml"), "utf8")) as {
    readonly misconceptions?: Readonly<Record<string, { readonly name?: string }>>;
  };
  return (datos.misconceptions ?? []).map((m) => ({
    id: m.id,
    category: m.category,
    nodes: m.nodes,
    nombre: locale.misconceptions?.[m.id]?.name ?? m.id,
    regla: reglaTexto(m.detect),
  }));
}

/** Las misconceptions que el catálogo declara sobre un nodo. */
export const delNodo = (catalogo: readonly Miscon[], node: string): readonly Miscon[] =>
  catalogo.filter((m) => m.nodes.includes(node));

/** Las siete categorías de L0, contadas por el tipo de regla que el jugador aplicó. */
export const CATEGORIAS: Readonly<Record<string, string>> = {
  sign: "La regla correcta se aplica con la orientación invertida: el objeto está bien elegido y falla el sentido.",
  wrong_inverse: "La operación elegida no deshace a la que había: la llave no corresponde a la cerradura.",
  precedence: "Cada paso es correcto pero el orden está invertido: se abrió una capa interior sin quitar la exterior.",
  conceptual: "El significado de un objeto o de una relación está mal construido; no hay procedimiento que corregir.",
  procedural: "Un algoritmo se aplica incompleto o con un paso cambiado: la intención es correcta y falta una mitad.",
  notation: "El símbolo se lee como otra cosa: falla el mapeo entre el signo y la cantidad, no la cuenta.",
  invalid_property:
    "Se asume que una operación conserva una estructura que no conserva, casi siempre la linealidad o la conmutatividad.",
};

// --- Los grupos ------------------------------------------------------------

/** El intento fallido que ninguna regla reconoció, que es lo único que se mina. */
export interface Suelto {
  readonly node: string;
  readonly level: number;
  readonly latency: number;
  readonly snapshot: string;
}

export interface Grupo {
  readonly node: string;
  /** La línea con los números borrados: lo que hace que dos rondas sean el mismo error. */
  readonly firma: string;
  readonly veces: number;
  /** Las líneas distintas que cayeron acá, para que se vea de qué se habla. */
  readonly ejemplos: readonly string[];
  readonly niveles: readonly number[];
  /** La mediana, no el promedio: un intento de cuarenta segundos no corre la cuenta. */
  readonly latenciaTipica: number;
}

/**
 * La forma de un error: la línea sin sus números y sin sus mayúsculas. Un
 * número que cambia es la ronda; lo que queda es el movimiento.
 *
 * El signo que va pegado al número no se borra. `llave −6` y `llave +6` son
 * dos movimientos distintos, y ahí el `−` no es el signo de un número sino la
 * operación que el jugador eligió: borrarlo juntaría dos errores que no tienen
 * nada que ver. Separar de más cuesta un grupo chico; juntar de más esconde el
 * error adentro de otro.
 */
export const firmaDe = (snapshot: string): string =>
  snapshot
    .normalize("NFC")
    .toLowerCase()
    .replace(/\d+([.,]\d+)?/g, "#")
    .replace(/\s+/g, " ")
    .trim();

/** Los intentos que valen para minar: salieron mal, nadie los clasificó, y dejaron línea. */
export function sueltos(events: readonly Event[]): readonly Suelto[] {
  const out: Suelto[] = [];
  for (const e of events) {
    if (e.kind !== "attempt" || e.correct || e.misconception !== undefined) continue;
    const snapshot = e.snapshot;
    if (snapshot === undefined || snapshot.trim() === "") continue;
    out.push({ node: e.node, level: e.level, latency: e.latency, snapshot: snapshot.trim() });
  }
  return out;
}

const mediana = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  if (s.length === 0) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? (s[m] as number) : Math.round(((s[m - 1] as number) + (s[m] as number)) / 2);
};

/**
 * Agrupa por nodo y por forma, y ordena por cuántas veces se vio. El orden es
 * el del informe: lo que más se repite es lo que más se parece a una
 * misconception y lo primero que conviene mirar.
 */
export function agrupar(events: readonly Event[]): readonly Grupo[] {
  const bolsas = new Map<string, Suelto[]>();
  for (const s of sueltos(events)) {
    const clave = `${s.node} ${firmaDe(s.snapshot)}`;
    const bolsa = bolsas.get(clave);
    if (bolsa) bolsa.push(s);
    else bolsas.set(clave, [s]);
  }
  const out: Grupo[] = [];
  for (const [clave, bolsa] of bolsas) {
    const firma = clave.split(" ")[1] ?? "";
    const ejemplos = [...new Set(bolsa.map((s) => s.snapshot))];
    out.push({
      node: bolsa[0]!.node,
      firma,
      veces: bolsa.length,
      ejemplos: ejemplos.slice(0, 4),
      niveles: [...new Set(bolsa.map((s) => s.level))].sort((a, b) => a - b),
      latenciaTipica: mediana(bolsa.map((s) => s.latency)),
    });
  }
  // Empate deshecho por la firma, para que dos corridas den el mismo informe.
  return out.sort((a, b) => b.veces - a.veces || a.node.localeCompare(b.node) || a.firma.localeCompare(b.firma));
}

// --- Lo que se le pregunta al modelo ---------------------------------------

export const NINGUNA = "ninguna";

/**
 * Las preguntas de un grupo. Las opciones de la primera son el catálogo del
 * nodo, no el catálogo entero: L usa el vecindario del nodo por costo y por
 * precisión, porque dos reglas de áreas distintas pueden verse iguales en un
 * ítem concreto. `ninguna` está siempre, y es la respuesta que hace interesante
 * al grupo: un error que no se parece a nada es una candidata.
 */
export function preguntasDe(vecindario: readonly Miscon[]): QuestionSet {
  const opciones: Record<string, string> = {
    [NINGUNA]: "No se parece a ninguna de las de la lista: es un error que el catálogo todavía no tiene.",
  };
  for (const m of vecindario) opciones[m.id] = `${m.nombre}. Regla: ${m.regla}`;

  return {
    // Con un nodo sin catálogo la pregunta no tendría opciones reales; se
    // arma igual porque `ninguna` sigue siendo una respuesta legítima.
    misconception_mas_parecida: {
      kind: "choice",
      instructions:
        "El jugador hizo un movimiento que salió mal y ninguna regla lo reconoció. Mirando `forma_del_error` y `ejemplos`, ¿a cuál de estas ideas equivocadas se parece lo que hizo?",
      options: opciones,
    },
    categoria: {
      kind: "choice",
      instructions:
        "¿De qué tipo es la regla equivocada que el jugador aplicó? No se clasifica el síntoma sino el tipo de regla.",
      options: CATEGORIAS,
    },
    parece_error_sistematico_y_no_dedazo: {
      kind: "noul",
      instructions:
        "¿Esto parece una idea equivocada que el jugador aplica a propósito, y no un descuido?",
      criteria: {
        true: "Sí: hay una regla detrás que se podría escribir, el movimiento es coherente entre un ejemplo y otro, y alguien que la creyera haría exactamente eso. Que se repita y que no sea instantáneo lo respaldan.",
        false: "No: es puntería, un dedo que erró el blanco, un tanteo, o movimientos que no comparten ninguna regla entre sí. Un error así no merece entrada en el catálogo.",
      },
    },
  };
}

/**
 * El estado del grupo. Chico a propósito, como en el resto del paquete: lo que
 * el modelo no puede contestar es lo que no está acá, y la precisión cae cuando
 * el estado crece con material que no hace a la decisión.
 */
export function estadoDe(g: Grupo): Record<string, unknown> {
  return {
    nodo: g.node,
    forma_del_error: g.firma,
    ejemplos: g.ejemplos,
    veces_que_se_repitio: g.veces,
    niveles_donde_aparecio: g.niveles,
    tardanza_tipica_ms: g.latenciaTipica,
    de_donde_sale:
      "Cada ejemplo es una línea que escribió la actividad cuando el movimiento salió mal: dice el problema y qué hizo el jugador. El '#' de `forma_del_error` es un número que cambia de una ronda a otra.",
  };
}

// --- La propuesta ----------------------------------------------------------

export interface Propuesta {
  readonly grupo: Grupo;
  /** Lo que contestó el modelo, o null si no hubo modelo en esta corrida. */
  readonly juicio: {
    readonly parecida: string;
    readonly pParecida: number;
    readonly categoria: string;
    readonly pCategoria: number;
    readonly sistematico: boolean;
    readonly pSistematico: number;
  } | null;
}

const leer = (a: Answers, nombre: string): { value: unknown; p: number } => {
  const r = a[nombre];
  return r === undefined ? { value: "", p: 0 } : { value: r.value, p: r.p };
};

/**
 * Mina los eventos. Sin decisor agrupa igual y devuelve las propuestas sin
 * juicio: el informe sigue valiendo, porque el conteo por forma ya dice qué
 * mirar primero, y quien no tiene la clave no queda sin herramienta.
 */
export async function minar(
  events: readonly Event[],
  catalogo: readonly Miscon[],
  decider: Decider | null,
): Promise<readonly Propuesta[]> {
  const out: Propuesta[] = [];
  for (const grupo of agrupar(events)) {
    if (!decider) {
      out.push({ grupo, juicio: null });
      continue;
    }
    const a = await decider.ask(estadoDe(grupo), preguntasDe(delNodo(catalogo, grupo.node)));
    const parecida = leer(a, "misconception_mas_parecida");
    const categoria = leer(a, "categoria");
    const sistematico = leer(a, "parece_error_sistematico_y_no_dedazo");
    out.push({
      grupo,
      juicio: {
        parecida: String(parecida.value),
        pParecida: parecida.p,
        categoria: String(categoria.value),
        pCategoria: categoria.p,
        sistematico: sistematico.value === true,
        pSistematico: sistematico.p,
      },
    });
  }
  return out;
}

// --- El informe ------------------------------------------------------------

const dos = (n: number): string => n.toFixed(2);

/**
 * El informe, para leer. No propone ninguna regla: dice qué se repitió, a qué
 * se parece y qué tan seguro está el modelo, y deja la decisión donde tiene que
 * estar. Ordenado por cuántas veces se vio cada grupo.
 */
export function informe(propuestas: readonly Propuesta[], totalEventos: number): string {
  const lineas: string[] = [];
  const sueltosTotales = propuestas.reduce((s, p) => s + p.grupo.veces, 0);
  const n = propuestas.length;
  lineas.push(
    `${totalEventos} eventos · ${sueltosTotales} ${sueltosTotales === 1 ? "error" : "errores"} que ninguna regla reconoció · ${n} ${n === 1 ? "forma distinta" : "formas distintas"}`,
  );
  if (propuestas.length === 0) {
    lineas.push("");
    lineas.push("No hay nada que minar: ningún intento fallido sin misconception trajo `snapshot`.");
    return lineas.join("\n");
  }

  for (const [i, p] of propuestas.entries()) {
    const g = p.grupo;
    lineas.push("");
    lineas.push(`${i + 1}. ${g.node} · ${g.veces} ${g.veces === 1 ? "vez" : "veces"} · nivel ${g.niveles.join(", ")} · ~${(g.latenciaTipica / 1000).toFixed(1)} s`);
    lineas.push(`   forma: ${g.firma}`);
    for (const e of g.ejemplos) lineas.push(`   · ${e}`);
    if (!p.juicio) {
      lineas.push("   (sin modelo en esta corrida)");
      continue;
    }
    const j = p.juicio;
    lineas.push(
      j.parecida === NINGUNA
        ? `   se parece a: ninguna del nodo (${dos(j.pParecida)}) — candidata a entrada nueva`
        : `   se parece a: ${j.parecida} (${dos(j.pParecida)}) — la regla existe y no coincidió; puede faltarle un caso`,
    );
    lineas.push(`   categoría: ${j.categoria} (${dos(j.pCategoria)})`);
    lineas.push(
      `   ${j.sistematico ? "parece sistemático" : "parece un dedazo"} (${dos(j.pSistematico)})`,
    );
  }

  const candidatas = propuestas.filter(
    (p) => p.juicio !== null && p.juicio.parecida === NINGUNA && p.juicio.sistematico,
  );
  if (candidatas.length > 0) {
    lineas.push("");
    lineas.push("--- Para mirar primero: sistemáticas y sin entrada en el catálogo ---");
    for (const p of candidatas) {
      lineas.push(`· ${p.grupo.node} · ${p.grupo.veces} veces · ${p.juicio?.categoria} · ${p.grupo.firma}`);
    }
    lineas.push("");
    lineas.push(
      "Escribir la entrada es trabajo de una persona: nombrar la idea, escribir la regla `detect` que reproduce esto, elegir patrón y mecánica, y comprobar que no se solape con ninguna del nodo. Si la regla no se puede escribir, no es una misconception: es ruido, o son dos mezcladas.",
    );
  }
  return lineas.join("\n");
}

// --- La entrada ------------------------------------------------------------

/** Acepta la lista pelada o envuelta en `{ events: [...] }`. */
export function leerEventos(texto: string): readonly Event[] {
  const datos = JSON.parse(texto) as unknown;
  const lista = Array.isArray(datos) ? datos : (datos as { events?: unknown }).events;
  if (!Array.isArray(lista)) throw new Error("El archivo no trae una lista de eventos.");
  return lista as readonly Event[];
}
