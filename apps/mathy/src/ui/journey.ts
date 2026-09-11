/**
 * Lo que el recorrido recuerda de un nivel mientras se juega: si ya estaba
 * superado cuando se abrió su tarjeta de entrada.
 *
 * La tarjeta de cierre lo necesita para no mentir. La primera vez que se supera
 * un nivel, su llave vuela al llavero; si se repite uno ya superado, la llave ya
 * estaba ahí y no vuelve a entrar. No se le puede preguntar al registro en el
 * cierre: el `levelDone` recién anotado se escribe en segundo plano y puede
 * figurar o no según cuánto tardó el disco.
 */
const atStart = new Map<string, boolean>();

const id = (node: string, level: number): string => `${node}:${level}`;

/** Lo anota la tarjeta de entrada, antes de que se juegue nada. */
export function noteLevelStart(node: string, level: number, alreadyDone: boolean): void {
  atStart.set(id(node, level), alreadyDone);
}

/** `undefined` si el nivel se abrió sin tarjeta de entrada (no tiene lección ni llave). */
export function doneAtStart(node: string, level: number): boolean | undefined {
  return atStart.get(id(node, level));
}
