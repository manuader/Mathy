/**
 * El guardrail del generador: el experimento F3 convertido en herramienta.
 *
 * Los generadores arman cada ronda con una semilla, así que una ronda mala no
 * aparece en los tests: aparece en la semilla 4 187 de un jugador. Esta es la
 * parte que barre semillas y decide; qué mira cada nodo lo aporta su módulo en
 * `generadores/`, y agregar el sexto nodo es agregar un archivo.
 *
 * Lo que la medición de F3 dejó decidido, y que acá se implementa tal cual:
 *
 * 1. **Los invariantes deterministas son la puerta.** Cubren lo numérico —dos
 *    opciones que se leen igual, dos que valen lo mismo, la cantidad de
 *    respuestas correctas, la respuesta pedida contra lo que da la mecánica— y
 *    fallan el build. Jev es ciego a eso: sacó 0/5 en "dos fichas del mismo
 *    valor".
 * 2. **Jev sólo avisa.** Nunca frena, y corre únicamente sobre lo que pasó los
 *    invariantes: preguntarle por una ronda que ya sabemos rota es pagar por
 *    una opinión que no vamos a leer.
 * 3. **De `una_sola_respuesta` se lee la confianza, no el sí/no.** En el bug
 *    real del nivel 7 de la rampa el modelo contestó "sí" siempre, con 0,66–0,75
 *    con el bug y 0,89–0,91 sin él. La señal es "contestó que sí sin estar
 *    seguro".
 * 4. **El estado tiene que contar la ronda como la ve el jugador**, incluido
 *    *cómo se contesta*. Describirlo mal fue el 60 % del ruido de la medición,
 *    así que `describir` es tan parte del nodo como sus invariantes.
 */

import type { Decider, Noul, Question, QuestionSet } from "./types.ts";

// --- Lo que un nodo aporta ---------------------------------------------------

/** La ronda contada como la ve el jugador. Es lo único que Jev recibe. */
export type Estado = Readonly<Record<string, unknown>>;

/** Un invariante que no se cumplió. Falla el build. */
export interface Falla {
  /** El nombre del invariante, en español y en minúsculas. */
  readonly regla: string;
  /** Qué se vio, con los números concretos: sin eso no se puede arreglar. */
  readonly detalle: string;
}

/**
 * Lo que declara un nodo. `L` es su tabla de niveles y `P` su problema: los dos
 * tipos quedan adentro del módulo del nodo y `definirNodo` los borra, así que
 * el motor no sabe nada de ninguna mecánica.
 */
export interface DefinicionNodo<L extends { readonly n: number }, P> {
  /** El id del grafo, igual que en el corpus. */
  readonly id: string;
  readonly niveles: readonly L[];
  /**
   * Cuántas rondas barrer por semilla. Un nivel con más preguntas que rondas
   * dejaría preguntas sin visitar, así que el nodo decide y no el motor.
   */
  rondas(nivel: L): number;
  generar(nivel: L, semilla: number, ronda: number): P;
  /** Qué gesto pide la ronda. Sirve para agrupar el reporte. */
  ask(problema: P): string;
  /**
   * Si la ronda se gana eligiendo entre cosas que están en pantalla, o armando
   * una configuración concreta. Sólo a esas tiene sentido preguntarles si
   * tienen una sola respuesta: "apoyá el escalón en otro lugar de la rampa" se
   * gana con cualquier lugar, y ahí la pregunta no es de ambigüedad sino de
   * cómo está escrito el criterio.
   */
  conEleccion(problema: P): boolean;
  describir(problema: P, nivel: L, consigna: string): Estado;
  invariantes(problema: P, nivel: L): readonly Falla[];
}

/** El nodo ya sin tipos propios: lo que el motor sabe manejar. */
export interface NodoUniforme {
  readonly id: string;
  readonly niveles: readonly { readonly n: number; readonly rondas: number }[];
  revisar(nivel: number, semilla: number, ronda: number): {
    readonly ask: string;
    readonly conEleccion: boolean;
    readonly fallas: readonly Falla[];
  };
  describir(nivel: number, semilla: number, ronda: number, consigna: string): Estado;
}

/**
 * Borra los tipos del nodo. Generar de nuevo en `describir` cuesta microsegundos
 * y vale la pena: el barrido de doscientas semillas no arma un solo estado que
 * nadie vaya a leer, que es lo que hace la diferencia entre correr en un
 * segundo y en un minuto.
 */
export function definirNodo<L extends { readonly n: number }, P>(
  d: DefinicionNodo<L, P>,
): NodoUniforme {
  const porNumero = new Map<number, L>(d.niveles.map((l) => [l.n, l]));
  const nivelDe = (n: number): L => {
    const nivel = porNumero.get(n);
    if (!nivel) throw new Error(`${d.id} no tiene nivel ${n}`);
    return nivel;
  };
  return {
    id: d.id,
    niveles: d.niveles.map((l) => ({ n: l.n, rondas: d.rondas(l) })),
    revisar(n, semilla, ronda) {
      const nivel = nivelDe(n);
      const problema = d.generar(nivel, semilla, ronda);
      return {
        ask: d.ask(problema),
        conEleccion: d.conEleccion(problema),
        fallas: d.invariantes(problema, nivel),
      };
    },
    describir(n, semilla, ronda, consigna) {
      const nivel = nivelDe(n);
      return d.describir(d.generar(nivel, semilla, ronda), nivel, consigna);
    },
  };
}

// --- El barrido --------------------------------------------------------------

/** Dónde está una ronda. Con esto se la vuelve a generar igual. */
export interface Coordenada {
  readonly nodo: string;
  readonly nivel: number;
  readonly semilla: number;
  readonly ronda: number;
  readonly ask: string;
  /** Si la ronda se gana eligiendo. Decide qué se le puede preguntar al modelo. */
  readonly conEleccion: boolean;
}

export interface Hallazgo extends Coordenada, Falla {}

export interface Corrida {
  readonly instancias: number;
  readonly fallas: readonly Hallazgo[];
  /** Las que pasaron los invariantes: las únicas que Jev va a mirar. */
  readonly limpias: readonly Coordenada[];
}

/**
 * La semilla, armada como la arma la app: `seedBase + ronda * 1000 + nivel`.
 * Copiar la fórmula importa porque una ronda defectuosa tiene que ser una que
 * un jugador pueda ver, y no una que sólo exista en el barrido.
 */
export const semillaDe = (base: number, nivel: number, ronda: number): number =>
  base + ronda * 1000 + nivel;

/** Genera todas las rondas de todos los nodos y les pasa los invariantes. */
export function barrer(nodos: readonly NodoUniforme[], semillas: number): Corrida {
  const fallas: Hallazgo[] = [];
  const limpias: Coordenada[] = [];
  let instancias = 0;

  for (const nodo of nodos) {
    for (const nivel of nodo.niveles) {
      for (let base = 0; base < semillas; base += 1) {
        for (let ronda = 0; ronda < nivel.rondas; ronda += 1) {
          const semilla = semillaDe(base, nivel.n, ronda);
          const { ask, conEleccion, fallas: rotas } = nodo.revisar(nivel.n, semilla, ronda);
          const donde: Coordenada = { nodo: nodo.id, nivel: nivel.n, semilla, ronda, ask, conEleccion };
          instancias += 1;
          if (rotas.length === 0) limpias.push(donde);
          else for (const f of rotas) fallas.push({ ...donde, ...f });
        }
      }
    }
  }
  return { instancias, fallas, limpias };
}

// --- Las preguntas del modelo ------------------------------------------------

/**
 * Las dos que sobrevivieron a la medición, con sus criterios. Los dos lados de
 * un Noul se escriben siempre: sin criterios el modelo contesta con la
 * definición que se imagine, y esa definición cambia entre rondas.
 *
 * `que_falta` quedó afuera a propósito: en F3 nombró bien el defecto muy pocas
 * veces y su acierto no agregaba nada sobre las otras dos, así que era una
 * consulta paga por línea de reporte que igual había que ir a mirar.
 */
export const PREGUNTAS: QuestionSet = {
  una_sola_respuesta: {
    kind: "noul",
    instructions: "¿La ronda tiene una sola respuesta posible, según `escena.como_se_contesta`?",
    criteria: {
      true: "Sí: una sola opción, o un solo armado, cumple lo que pide la consigna; lo demás es distinguible y distinto.",
      false:
        "No: hay dos respuestas que cumplirían igual, o dos opciones que se leen iguales o valen lo mismo, o ninguna cumple.",
    },
  },
  consigna_coincide_con_la_escena: {
    kind: "noul",
    instructions: "¿La consigna pide algo que se puede hacer con lo que hay en `escena`?",
    criteria: {
      true: "Sí: los objetos y el gesto que nombra la consigna están en la escena.",
      false:
        "No: la consigna nombra objetos que la escena no tiene, o pide un gesto imposible acá, o el dato que haría falta para contestar no está a la vista.",
    },
  },
};

/** Lo que el modelo quiso decir. Nunca frena nada: se lee. */
export interface Aviso extends Coordenada {
  readonly pregunta: string;
  /** La confianza en la respuesta que dio, que es la que importa. */
  readonly p: number;
  readonly por_que: string;
}

/**
 * El corte de la duda. Arriba de esto, un "sí" es un sí; abajo, el modelo
 * contestó que sí sin estar seguro, que es la forma en que el bug de la rampa
 * se dejó ver.
 */
export const CORTE_DUDA = 0.8;

/**
 * A cuáles rondas preguntarles, cuando hay más rondas que presupuesto. Se toma
 * de a una por grupo dando vueltas —nodo, nivel y gesto— en vez de las primeras
 * `tope`: las primeras serían todas del mismo nivel del primer nodo.
 */
export function repartir(limpias: readonly Coordenada[], tope: number): readonly Coordenada[] {
  const grupos = new Map<string, Coordenada[]>();
  for (const c of limpias) {
    const clave = `${c.nodo}:${c.nivel}:${c.ask}`;
    const grupo = grupos.get(clave);
    if (grupo) grupo.push(c);
    else grupos.set(clave, [c]);
  }
  const listas = [...grupos.values()];
  const out: Coordenada[] = [];
  for (let i = 0; out.length < tope; i += 1) {
    let hubo = false;
    for (const lista of listas) {
      const c = lista[i];
      if (!c) continue;
      hubo = true;
      out.push(c);
      if (out.length >= tope) break;
    }
    if (!hubo) break;
  }
  return out;
}

/**
 * La pasada del modelo. Corre sobre lo que pasó los invariantes y devuelve
 * avisos; si el tope corta la corrida, se queda con lo que alcanzó a juntar en
 * vez de perderlo.
 */
export async function avisar(
  nodos: readonly NodoUniforme[],
  donde: readonly Coordenada[],
  decider: Decider,
  consignaDe: (nodo: string, nivel: number) => string,
): Promise<readonly Aviso[]> {
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const avisos: Aviso[] = [];
  for (const c of donde) {
    const nodo = porId.get(c.nodo);
    if (!nodo) continue;
    const estado = nodo.describir(c.nivel, c.semilla, c.ronda, consignaDe(c.nodo, c.nivel));
    // A una ronda que se gana con cualquier lugar de la rampa, preguntarle si
    // tiene una sola respuesta es preguntarle mal: contesta que no, y tiene
    // razón. Queda la otra, que sí aplica a todas.
    const preguntas = c.conEleccion
      ? PREGUNTAS
      : { consigna_coincide_con_la_escena: PREGUNTAS["consigna_coincide_con_la_escena"] as Question };
    const respuestas = await decider.ask(estado, preguntas);
    const una = respuestas["una_sola_respuesta"] as Noul | undefined;
    const coincide = respuestas["consigna_coincide_con_la_escena"] as Noul | undefined;
    // De la primera se lee la confianza: el bug de la rampa no cambió el sí.
    if (una && (!una.value || una.p < CORTE_DUDA)) {
      avisos.push({
        ...c,
        pregunta: "una_sola_respuesta",
        p: una.p,
        por_que: una.value
          ? `contestó que sí con ${una.p.toFixed(2)}, menos de ${CORTE_DUDA}`
          : `contestó que no con ${una.p.toFixed(2)}`,
      });
    }
    if (coincide && !coincide.value) {
      avisos.push({
        ...c,
        pregunta: "consigna_coincide_con_la_escena",
        p: coincide.p,
        por_que: `la consigna pide algo que la escena no tiene (${coincide.p.toFixed(2)})`,
      });
    }
  }
  return avisos;
}
