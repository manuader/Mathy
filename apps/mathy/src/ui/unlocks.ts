/**
 * Qué nodos alcanzó el jugador, para cada herramienta.
 *
 * COSTURA CON EL MOTOR DE CURRICULUM: el motor real (K) decide nodo por nodo
 * cuándo pasa a `ready`, con evidencia por verbo, EWMA y puerta de confianza.
 * Cuando exista, `ready` se reemplaza por su consulta y nada más cambia.
 *
 * Antes, terminar un solo nivel alcanzaba todos los nodos compilados, y la
 * chuleta pasaba de vacía a llena de golpe. Ahora cada herramienta crece con lo
 * recorrido:
 *
 * - la chuleta suma las entradas de un nodo cuando el jugador superó un nivel
 *   de capa `symbolic` o `formal` de ese nodo, que es la regla de R0;
 * - la calculadora suma las teclas de un nodo cuando lo terminó entero, que es
 *   lo más cerca de `ready` que se puede decir sin el modelo de K.
 */
import { nodeById } from "@mathy/mechanics";

export interface Reached {
  readonly cheatsheet: ReadonlySet<string>;
  readonly ready: ReadonlySet<string>;
}

const WRITTEN: ReadonlySet<string> = new Set(["symbolic", "formal"]);

export function reachedNodes(levelsDone: Readonly<Record<string, number>>): Reached {
  const cheatsheet = new Set<string>();
  const ready = new Set<string>();
  for (const [id, done] of Object.entries(levelsDone)) {
    const spec = nodeById(id);
    if (!spec || done <= 0) continue;
    if (spec.levels.some((l) => l.n <= done && WRITTEN.has(l.layer))) cheatsheet.add(id);
    if (done >= spec.levels.length) ready.add(id);
  }
  return { cheatsheet, ready };
}
