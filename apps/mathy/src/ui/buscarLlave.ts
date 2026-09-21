/**
 * La ayuda semántica del buscador, que es opcional a propósito.
 *
 * El ranking local resuelve cuando el jugador escribe alguna palabra del
 * título. No resuelve cuando escribe otra cosa: "sumar es caminar" no comparte
 * ni una palabra con "La ficha es un salto", y ninguna búsqueda por palabras
 * llega ahí. Eso lo puede contestar un modelo de decisión eligiendo entre las
 * candidatas que el juego ya tiene a mano.
 *
 * Tres reglas, y ninguna es negociable:
 * - **El juego anda sin esto.** Si no hay proxy, si no hay red o si tarda, el
 *   buscador muestra su ranking local y listo. Nunca se queda esperando.
 * - **No sale nada del dispositivo salvo lo que el jugador escribió** y los
 *   títulos de sus propias llaves, que ya están en la pantalla. Sin nombre, sin
 *   identificador, sin progreso.
 * - **La clave nunca vive en la app.** La llamada va a un proxy local de
 *   desarrollo (`npm run qa:proxy`), no a TypeSafe. En producción hace falta un
 *   servidor propio, o no hay ayuda semántica.
 */

/**
 * El proxy vive en la misma máquina que sirve el juego, no en la del jugador:
 * desde un teléfono de la casa, `localhost` sería el teléfono.
 */
const PROXY = ((): string => {
  const host = typeof window === "undefined" ? "" : (window.location?.hostname ?? "");
  return `http://${host.length > 0 ? host : "localhost"}:8788/llave`;
})();
/** Más que esto y el jugador ya leyó la lista: no vale la pena esperar. */
const PACIENCIA_MS = 800;

/** Una vez que falla, no se vuelve a intentar en la sesión: no hay proxy. */
let apagado = false;

export interface Candidata {
  readonly id: string;
  readonly texto: string;
}

export async function sugerirLlave(
  consulta: string,
  candidatas: readonly Candidata[],
): Promise<{ readonly id: string; readonly p: number } | null> {
  if (apagado || candidatas.length === 0 || consulta.trim().length < 4) return null;
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), PACIENCIA_MS);
  try {
    const r = await fetch(PROXY, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ consulta, candidatas }),
      signal: corte.signal,
    });
    if (!r.ok) return null;
    const json = (await r.json()) as { id: string | null; p: number };
    return json.id ? { id: json.id, p: json.p } : null;
  } catch {
    // Sin proxy, sin red o sin paciencia: el ranking local alcanza.
    apagado = true;
    return null;
  } finally {
    clearTimeout(reloj);
  }
}
