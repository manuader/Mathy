/**
 * El registro de aprendizaje.
 *
 * Lo que se guarda no es el estado sino los hechos: qué intentó el jugador, con
 * qué resultado y cuándo. El estado se calcula plegando esa lista. Dos razones,
 * y ninguna es purismo: el mastery de seis dimensiones que define K se recalcula
 * entero cuando cambien las constantes, sin migrar nada; y sincronizar entre
 * dispositivos es unir dos listas, sin conflictos que resolver.
 */

/** Los seis verbos de evidencia de K. */
export type Evidence = "recognize" | "explain" | "manipulate" | "apply" | "generalize" | "transfer";

export type Event =
  | {
      readonly kind: "attempt";
      readonly at: number;
      readonly node: string;
      readonly level: number;
      readonly evidence: Evidence;
      readonly correct: boolean;
      /** Milisegundos desde que se mostró el problema. */
      readonly latency: number;
      /** El error catalogado, si el movimiento coincidió con uno conocido. */
      readonly misconception?: string;
    }
  | { readonly kind: "levelDone"; readonly at: number; readonly node: string; readonly level: number }
  | { readonly kind: "sawLayer"; readonly at: number; readonly node: string; readonly layer: string };

/** Lo que la app necesita saber, plegado de los eventos. */
export interface Progress {
  /** Por nodo, el nivel más alto terminado. */
  readonly levelsDone: Readonly<Record<string, number>>;
  /** Las capas que el jugador vio, que es lo que agrega entradas a la cheatsheet. */
  readonly layersSeen: Readonly<Record<string, readonly string[]>>;
  /** Aciertos y desaciertos por nodo y verbo, la materia prima del mastery. */
  readonly tally: Readonly<Record<string, Readonly<Record<string, { ok: number; total: number }>>>>;
  /** Cuántas veces se vio cada error, para la remediación. */
  readonly misconceptions: Readonly<Record<string, number>>;
  readonly lastPlayedAt: number;
}

export const emptyProgress = (): Progress => ({
  levelsDone: {},
  layersSeen: {},
  tally: {},
  misconceptions: {},
  lastPlayedAt: 0,
});

/**
 * El fold. Es puro y determinista, así que corre igual en el dispositivo y en
 * el servidor, y dos jugadores con los mismos eventos tienen el mismo estado.
 */
export function fold(events: readonly Event[]): Progress {
  const levelsDone: Record<string, number> = {};
  const layersSeen: Record<string, string[]> = {};
  const tally: Record<string, Record<string, { ok: number; total: number }>> = {};
  const misconceptions: Record<string, number> = {};
  let lastPlayedAt = 0;

  for (const e of events) {
    lastPlayedAt = Math.max(lastPlayedAt, e.at);
    switch (e.kind) {
      case "levelDone":
        levelsDone[e.node] = Math.max(levelsDone[e.node] ?? 0, e.level);
        break;
      case "sawLayer": {
        const seen = (layersSeen[e.node] ??= []);
        if (!seen.includes(e.layer)) seen.push(e.layer);
        break;
      }
      case "attempt": {
        const byVerb = (tally[e.node] ??= {});
        const cell = (byVerb[e.evidence] ??= { ok: 0, total: 0 });
        cell.total += 1;
        if (e.correct) cell.ok += 1;
        if (e.misconception) misconceptions[e.misconception] = (misconceptions[e.misconception] ?? 0) + 1;
        break;
      }
    }
  }
  return { levelsDone, layersSeen, tally, misconceptions, lastPlayedAt };
}

/** El nivel al que puede entrar el jugador: el siguiente al último terminado. */
export const unlockedLevel = (p: Progress, node: string): number => (p.levelsDone[node] ?? 0) + 1;

/**
 * Une dos listas de eventos sin duplicar. Es toda la sincronización que hace
 * falta: los eventos son inmutables y su identidad es su contenido.
 */
export function mergeEvents(a: readonly Event[], b: readonly Event[]): Event[] {
  const seen = new Set<string>();
  const out: Event[] = [];
  for (const e of [...a, ...b].sort((x, y) => x.at - y.at)) {
    const key = JSON.stringify(e);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}
