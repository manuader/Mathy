/**
 * La persistencia.
 *
 * El paquete no sabe dónde se guarda: recibe un almacén con dos métodos. Así el
 * fold se testea en Node y la app decide si eso es el navegador, el disco del
 * teléfono o, más adelante, un servidor.
 */

import { type Event, type Progress, emptyProgress, fold, mergeEvents } from "./events.ts";

export interface Storage {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
}

const KEY = "mathy.events.v1";
/** Se recorta para que el registro no crezca sin techo en un perfil local. */
const MAX_EVENTS = 5000;

export class ProgressStore {
  private events: Event[] = [];
  private loaded = false;
  // Campo explícito y no propiedad de parámetro: Node no soporta esa sintaxis
  // cuando corre TypeScript quitando tipos, que es como se corren los tests.
  private readonly storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async load(): Promise<Progress> {
    const raw = await this.storage.read(KEY);
    this.events = raw ? (safeParse(raw) ?? []) : [];
    this.loaded = true;
    return fold(this.events);
  }

  async append(...events: readonly Event[]): Promise<Progress> {
    if (!this.loaded) await this.load();
    this.events = mergeEvents(this.events, events).slice(-MAX_EVENTS);
    await this.storage.write(KEY, JSON.stringify(this.events));
    return fold(this.events);
  }

  get all(): readonly Event[] {
    return this.events;
  }

  async reset(): Promise<Progress> {
    this.events = [];
    await this.storage.write(KEY, "[]");
    return emptyProgress();
  }
}

function safeParse(raw: string): Event[] | null {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? (v as Event[]) : null;
  } catch {
    // Un registro corrupto no puede impedir jugar: se empieza de nuevo.
    return null;
  }
}

/** Almacén en memoria, para tests y para el primer arranque. */
export function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    read: async (k) => map.get(k) ?? null,
    write: async (k, v) => {
      map.set(k, v);
    },
  };
}
