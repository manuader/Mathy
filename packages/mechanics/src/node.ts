/**
 * El registro de nodos jugables.
 *
 * El grafo del diseño tiene 348 nodos y la espina 44; acá viven solo los que
 * ya tienen minijuego. La app pregunta por este registro y nunca por una lista
 * de niveles suelta, así que agregar un nodo es agregar una entrada y su módulo.
 *
 * COSTURA CON EL MOTOR DE CURRICULUM: `availableNodes` decide con una regla
 * pobre —los prerequisitos que están implementados y terminados— porque todavía
 * no existe el modelo de mastery de K, que decide nodo por nodo cuándo un
 * concepto pasa a `ready` con evidencia por verbo. Cuando exista, se reemplaza
 * esta función y nada más cambia: la app ya pregunta por un conjunto de ids.
 */

import type { Evidence, Layer } from "./one-step.ts";

/** Lo que todo nivel declara, sea del minijuego que sea. */
export interface LevelBase {
  readonly n: number;
  readonly titleKey: string;
  readonly layer: Layer;
  readonly evidence: readonly Evidence[];
  readonly rounds: number;
}

export interface NodeSpec {
  /** El id del grafo. Es permanente. */
  readonly id: string;
  /** El número en la espina, que es el orden de lectura del diseño. */
  readonly n: number;
  /** Prerequisitos según `spine.yaml`, incluidos los que todavía no existen. */
  readonly prereqs: readonly string[];
  /**
   * El nombre del minijuego y lo que el nodo enseña viven en el diccionario de
   * la app bajo `node.<id>.name` y `node.<id>.tagline`. Acá no hay texto: un
   * paquete de modelo con cadenas visibles no se puede localizar.
   */
  readonly levels: readonly LevelBase[];
}

const registry = new Map<string, NodeSpec>();

/** Cada módulo de minijuego se anota acá al cargarse. */
export function registerNode(spec: NodeSpec): NodeSpec {
  registry.set(spec.id, spec);
  return spec;
}

/** Los nodos jugables, en el orden de la espina. */
export function playableNodes(): readonly NodeSpec[] {
  return [...registry.values()].sort((a, b) => a.n - b.n);
}

export const nodeById = (id: string): NodeSpec | undefined => registry.get(id);

/**
 * Qué nodos puede abrir el jugador. Un prerequisito que todavía no tiene
 * minijuego no bloquea: si bloqueara, el único nodo construido sería
 * inalcanzable y el mapa quedaría vacío.
 */
export function isNodeOpen(id: string, levelsDone: Readonly<Record<string, number>>): boolean {
  const spec = registry.get(id);
  if (!spec) return false;
  return spec.prereqs.every((p) => {
    const prereq = registry.get(p);
    if (!prereq) return true;
    return (levelsDone[p] ?? 0) >= prereq.levels.length;
  });
}
