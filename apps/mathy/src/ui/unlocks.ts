/**
 * Qué nodos alcanzó el jugador.
 *
 * COSTURA CON EL MOTOR DE CURRICULUM: el motor real (K) decide nodo por nodo
 * cuándo pasa a `ready`, con evidencia por verbo, EWMA y puerta de confianza.
 * Cuando exista, esta función se reemplaza por su consulta sobre el `Progress`
 * de `@mathy/progress` (que ya lleva `levelsDone` y `layersSeen` por nodo) y no
 * cambia nada más: la chuleta y la calculadora ya preguntan por un conjunto de
 * nodos y nunca por un número de nivel.
 *
 * Mientras el juego tenga un solo minijuego, terminar cualquiera de sus niveles
 * alcanza el nodo entero y, con él, sus prerequisitos: es exactamente el alcance
 * que `@mathy/content` compiló.
 */
import { contentScope } from "@mathy/content";

const NINGUNO: ReadonlySet<string> = new Set<string>();
const TODOS: ReadonlySet<string> = new Set(contentScope.nodes);

export function reachedNodes(levelsDone: number): ReadonlySet<string> {
  return levelsDone > 0 ? TODOS : NINGUNO;
}
