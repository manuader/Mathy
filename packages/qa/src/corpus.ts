/**
 * El corpus: todos los textos que el jugador puede leer, con su contexto.
 *
 * Los textos viven repartidos entre `apps/mathy/src/i18n.ts` y los módulos de
 * lección de cada nodo, y un texto suelto no se puede juzgar: "la rueda estira"
 * está bien escrito y solo es falso cuando la escena dibuja máquinas. Por eso
 * cada entrada viaja con su nodo, su nivel, qué papel cumple y qué escena tiene
 * enfrente.
 *
 * Se lee la fuente de la app por ruta y no por dependencia: `@mathy/qa` es una
 * herramienta de taller y no puede quedar en el grafo de dependencias del juego.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";
import type { Entry } from "./types.ts";

export const REPO = fileURLToPath(new URL("../../..", import.meta.url));

export interface SceneObjects {
  readonly dibuja: readonly string[];
  readonly prohibido: readonly string[];
}

export interface Objetos {
  readonly global: { readonly prohibido: readonly string[]; readonly jerga: readonly string[] };
  readonly escenas: Readonly<Record<string, SceneObjects>>;
  readonly nodos: Readonly<Record<string, readonly string[]>>;
}

export function loadObjetos(): Objetos {
  const raw = readFileSync(join(REPO, "docs/E-mecanicas/objetos.yaml"), "utf8");
  return parse(raw) as Objetos;
}

/** La forma mínima de una lección que este archivo necesita. */
interface LessonShape {
  readonly node: string;
  readonly learnedKey: string;
  readonly levels: readonly {
    readonly level: number;
    readonly whyKey: string;
    readonly goalKey: string;
    readonly coach: readonly { readonly textKey: string }[];
    readonly key: { readonly titleKey: string; readonly bodyKey: string };
  }[];
}

/**
 * Junta las entradas. `t()` de la app es quien resuelve una clave, así que se
 * usa esa misma función: si acá dice una cosa y en el juego otra, el linter
 * estaría revisando un texto que nadie lee.
 */
export async function buildCorpus(): Promise<readonly Entry[]> {
  const lessons = (await import(pathToFileURL(join(REPO, "apps/mathy/src/lessons/index.ts")).href)) as {
    readonly nodeLesson: (node: string) => LessonShape | undefined;
  };
  const i18n = (await import(pathToFileURL(join(REPO, "apps/mathy/src/i18n.ts")).href)) as {
    readonly t: (key: string) => string;
  };
  const objetos = loadObjetos();
  const out: Entry[] = [];

  // Los nodos salen de `objetos.yaml`, que es también quien dice qué escena
  // tiene cada uno: un nodo sin escena declarada no se puede revisar.
  for (const [node, scenes] of Object.entries(objetos.nodos)) {
    const lesson = lessons.nodeLesson(node);
    if (!lesson) continue;
    const push = (key: string, level: number | null, role: Entry["role"]): void => {
      out.push({ key, text: i18n.t(key), node: lesson.node, level, role, scenes });
    };
    push(lesson.learnedKey, null, "concepto");
    for (const level of lesson.levels) {
      push(level.whyKey, level.level, "por_que");
      push(level.goalKey, level.level, "objetivo");
      push(level.key.titleKey, level.level, "llave_titulo");
      push(level.key.bodyKey, level.level, "llave_cuerpo");
      for (const step of level.coach) push(step.textKey, level.level, "paso_de_guia");
    }
  }
  return out;
}
