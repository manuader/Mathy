/**
 * El llavero, para `prealg.inv.operation_as_key`.
 *
 * Los siete niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/12`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: la inversa es propiedad de la **operación** y no de
 * los números. Por eso una llave son dos cosas separadas —una operación y un
 * número— y por eso las dos formas de fallar tienen que sentirse distintas: con
 * la operación equivocada la llave ni siquiera entra, y con el número
 * equivocado entra y devuelve otra cosa. El modelo mantiene esa separación en
 * dos predicados, `keyOpens` y `keyRestores`, y no en uno solo con dos motivos.
 *
 * La otra idea es que deshacer devuelve y no resuelve: no hay ninguna igualdad
 * en pantalla, no hay nada que averiguar, y la prueba de que la llave sirvió es
 * que el objeto quedó como estaba. Eso es lo que el dato llama `from`: el valor
 * de partida, que sigue estando después de la vuelta con el mismo id.
 *
 * Este nodo es el primero de los **tres regresos de la llave** ([E0], [H]): lo
 * que deje establecido acá lo heredan `alg.fn.inverse_function` (nodo 21), donde
 * la llave se vuelve función y recibe el nombre `f⁻¹`, y
 * `calc1.ftc.integral_undoes_derivative` (nodo 29), donde la integral es la
 * llave de la derivada. Por eso la forma del dato es deliberadamente más ancha
 * que la aritmética: un lazo es una acción cualquiera con su vuelta, la
 * operación viaja aparte del número, y `keyRestores` compara el objeto de
 * partida con el que volvió en vez de comparar cuentas.
 *
 * Sin texto visible: el nodo es `literacy: none` y acá solo hay claves y datos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "prealg.inv.operation_as_key";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne los minijuegos con `export *` y
 * cada uno declara su propio `NODE`, así que afuera del módulo se lo nombra así.
 */
export const NODE_OPERATION_KEY = NODE;

/** Las cuatro cerraduras aritméticas. La llave de una es siempre otra de estas. */
export type KeyOp = "add" | "sub" | "mul" | "div";

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `fit`: elegir del llavero la llave que abre el cofre. Es la mecánica
 *   central y la superficie de los dos primeros niveles.
 * - `assemble`: armar la llave con dos ranuras, una para la operación y otra
 *   para el número. Es donde nace la segunda forma de fallar: la llave abre y lo
 *   que sale no encaja en la silueta.
 * - `arrows`: el mismo cofre dibujado como diagrama vertical. La llave es la
 *   flecha de vuelta, y soltarla cierra el circuito.
 * - `judge`: dos vueltas sobre el mismo cofre; tocar la que usa la llave
 *   equivocada. Para `literacy: none` este es el formato de todo `explain`.
 * - `chain`: dos acciones encadenadas. Se deshacen desde la última hacia la
 *   primera, y el orden es lo único que el nivel evalúa además de las llaves.
 * - `arbitrary`: cerraduras que no son aritméticas, y una por tanda que no tiene
 *   llave ninguna y hay que marcar con el candado tachado.
 */
export type KeyAsk = "fit" | "assemble" | "arrows" | "judge" | "chain" | "arbitrary";

/**
 * Cómo se dibuja el cofre. Son las dos primeras etapas de desvanecimiento de
 * `chest_key` en [E0]: `chests` es el cofre con su cerradura ilustrada y
 * `arrows` el diagrama vertical. `ghost` es el cofre pedido a demanda, que el
 * diseño deja quedarse hasta `formal` porque representa estructura y no un
 * nombre.
 */
export type KeySkin = "chest" | "arrows" | "ghost";

/**
 * Por qué una llave está en el llavero sin ser la que abre. Los tres salen de
 * las reglas `detect` del catálogo, que es de donde el diseño pide sacarlos.
 *
 * - `same_operation`: la cerradura repetida. Es el `x / a = b → x = b / a` del
 *   catálogo: aplicar otra vez la acción en lugar de deshacerla.
 * - `other_pair`: la inversa de la otra pareja, con el mismo número. Es el
 *   `a * x = b → x = b - a`: tratar el número como si fuera la acción.
 * - `near_value`: la operación correcta con el número equivocado. **No es un
 *   error catalogado**: es un movimiento válido que devuelve otra cosa, y el
 *   juego solo deja ver que el objeto no encaja en la silueta.
 */
export type KeyDistractor = "same_operation" | "other_pair" | "near_value";

/** Las acciones que no son aritméticas, del último nivel. */
export type KeyActionKind = "turn" | "hat" | "color" | "flat" | "broken";

/** Una acción: una operación y un número, separados a propósito. */
export interface KeyAction {
  readonly op: KeyOp;
  readonly value: number;
}

/**
 * Un lazo: una acción y la vuelta que la deshace. `from` es el objeto que
 * entró y `to` el que quedó; que `from` siga estando después de la vuelta, con
 * el mismo id, es todo el invariante `inverse_restores_original`.
 */
export interface KeyLoop {
  readonly id: string;
  readonly action: KeyAction;
  readonly from: number;
  readonly to: number;
}

/** Una llave del llavero. */
export interface KeyCandidate {
  readonly id: string;
  readonly op: KeyOp;
  readonly value: number;
  /** El lazo que esta llave deshace, o null si no deshace ninguno. */
  readonly loop: string | null;
  /** Por qué está en el llavero, si no deshace nada. */
  readonly lure?: KeyDistractor;
}

/** Una vuelta ya jugada, de las dos que se comparan en `judge`. */
export interface KeyTrial {
  readonly id: string;
  readonly key: KeyCandidate;
  /** La llave era la inversa de la cerradura: el cofre abre. */
  readonly opens: boolean;
  /** Lo que salió encajó en la silueta. */
  readonly restores: boolean;
}

/** Una acción cualquiera del último nivel, y la ficha que la deshace. */
export interface KeyArbitrary {
  readonly id: string;
  readonly kind: KeyActionKind;
  readonly value: number;
  readonly correct: boolean;
  /** El candado tachado: la respuesta cuando la cerradura no tiene llave. */
  readonly uninvertible: boolean;
}

/**
 * Lo único que endurece. La piel, la pregunta y la definición viven afuera
 * justamente para que la regla del diseño —un nivel cambia de capa o endurece
 * parámetros, nunca las dos cosas— se pueda comprobar con un test.
 */
export interface KeyParams {
  /** Qué cerraduras entran en juego. */
  readonly ops: readonly KeyOp[];
  /** El rango del número de la cerradura. */
  readonly operand: readonly [number, number];
  /** El rango del objeto que entra al cofre. */
  readonly start: readonly [number, number];
  /** Cuántas llaves cuelgan del llavero. */
  readonly ring: number;
  /** Cuántas acciones encadenadas. Dos obliga a invertir el orden. */
  readonly chain: number;
  /** La vuelta puede quedar bajo cero: restar siete y sumar menos siete se juntan. */
  readonly negatives: boolean;
}

export interface KeyLevel extends LevelBase {
  readonly params: KeyParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly KeyAsk[];
  readonly skin: KeySkin;
  /**
   * Las fichas con operador y número sobre las flechas y en las llaves. Hasta
   * que llegan, la cerradura se lee por la forma y la cantidad de puntitos.
   */
  readonly labeled: boolean;
  /**
   * Los numerales en los extremos del diagrama. Antes de la capa visual el
   * objeto es un objeto y no un número: contarlo sería otra pregunta.
   */
  readonly numerals: boolean;
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/**
 * Los siete niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 endurece (entran multiplicar y dividir, y el llavero pasa a cuatro),
 * 2 → 3 no toca nada y cambia lo que se pregunta —la llave se arma en vez de
 * elegirse, y con eso nace la segunda forma de fallar—, 3 → 4, 4 → 5 y 6 → 7
 * cambian de capa con los mismos parámetros, y 5 → 6 endurece dentro de la
 * misma capa simbólica, que es la que el diseño parte en dos mitades.
 */
export const KEY_LEVELS: readonly KeyLevel[] = [
  {
    n: 1,
    titleKey: "level.theKeyThatEnters",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 4,
    params: { ops: ["add", "sub"], operand: [1, 9], start: [3, 12], ring: 2, chain: 1, negatives: false },
    asks: ["fit"],
    skin: "chest",
    labeled: false,
    numerals: false,
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.fourLocks",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 4,
    params: {
      ops: ["add", "sub", "mul", "div"],
      operand: [1, 9],
      start: [3, 12],
      ring: 4,
      chain: 1,
      negatives: false,
    },
    asks: ["fit"],
    skin: "chest",
    labeled: false,
    numerals: false,
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.theCompleteKey",
    layer: "concrete",
    evidence: ["apply"],
    rounds: 3,
    params: {
      ops: ["add", "sub", "mul", "div"],
      operand: [1, 9],
      start: [3, 12],
      ring: 4,
      chain: 1,
      negatives: false,
    },
    asks: ["assemble"],
    skin: "chest",
    labeled: false,
    numerals: false,
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.arrows",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: {
      ops: ["add", "sub", "mul", "div"],
      operand: [1, 9],
      start: [3, 12],
      ring: 4,
      chain: 1,
      negatives: false,
    },
    asks: ["arrows", "judge"],
    skin: "arrows",
    labeled: false,
    numerals: true,
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.chipsOnTheArrows",
    layer: "symbolic",
    evidence: ["manipulate"],
    rounds: 3,
    params: {
      ops: ["add", "sub", "mul", "div"],
      operand: [1, 9],
      start: [3, 12],
      ring: 4,
      chain: 1,
      negatives: false,
    },
    asks: ["arrows"],
    skin: "arrows",
    labeled: true,
    numerals: true,
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.chainsAndNegatives",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 3,
    params: {
      ops: ["add", "sub", "mul", "div"],
      operand: [2, 30],
      start: [4, 40],
      ring: 4,
      chain: 2,
      negatives: true,
    },
    asks: ["chain"],
    skin: "ghost",
    labeled: true,
    numerals: true,
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.locksNeverSeen",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 3,
    params: {
      ops: ["add", "sub", "mul", "div"],
      operand: [2, 30],
      start: [4, 40],
      ring: 4,
      chain: 2,
      negatives: true,
    },
    asks: ["arbitrary"],
    skin: "ghost",
    labeled: true,
    numerals: true,
    definition: true,
  },
];

/** Llaves montadas siempre, para que el árbol de la escena no cambie entre rondas. */
export const KEY_RING_SLOTS = 4;
/** Fichas numéricas montadas siempre, por la misma razón. */
export const KEY_TILE_SLOTS = 5;
/** Lazos montados siempre. Dos es la cadena más larga del nodo. */
export const KEY_LOOP_SLOTS = 2;

/**
 * El techo de lo que puede valer un objeto. Con cerraduras de multiplicar la
 * cadena crece rápido, y un número de cuatro cifras no endurece nada: tapa el
 * diagrama y convierte la pregunta en una cuenta.
 */
export const KEY_MAX_VALUE = 400;

/**
 * Hasta cuánto puede multiplicar o dividir una cerradura, aunque el rango del
 * nivel llegue más arriba. El rango grande del nivel 6 es de las cerraduras que
 * suman y restan: multiplicar por treinta no obliga a elegir mejor la llave,
 * solo desborda el diagrama.
 */
export const KEY_MAX_FACTOR = 9;

/** La llave de cada cerradura. Es la tabla entera del nodo. */
export const KEY_INVERSE: Readonly<Record<KeyOp, KeyOp>> = {
  add: "sub",
  sub: "add",
  mul: "div",
  div: "mul",
};

/**
 * La inversa de la *otra* pareja. Frente a una cerradura de multiplicar por
 * tres, es la llave de restar tres: el distractor central del nodo, porque
 * conserva el número y cambia la operación, que es exactamente la confusión que
 * el nodo desarma.
 */
export const KEY_PARTNER: Readonly<Record<KeyOp, KeyOp>> = {
  add: "div",
  sub: "mul",
  mul: "sub",
  div: "add",
};

export const keyInverseOf = (op: KeyOp): KeyOp => KEY_INVERSE[op];

/** Aplicar una acción a un objeto. Dividir por cero no llega nunca acá. */
export function keyApply(value: number, action: KeyAction): number {
  switch (action.op) {
    case "add":
      return value + action.value;
    case "sub":
      return value - action.value;
    case "mul":
      return value * action.value;
    default:
      return action.value === 0 ? value : value / action.value;
  }
}

/**
 * La llave entra en la cerradura. Es la primera de las dos formas de fallar, y
 * mira **solo la operación**: el número no tiene nada que ver con que la llave
 * gire, y esa separación es el nodo entero.
 */
export const keyOpens = (action: KeyAction, key: KeyCandidate): boolean =>
  key.op === KEY_INVERSE[action.op];

/**
 * La llave devuelve exactamente lo que había. Es el invariante
 * `inverse_restores_original`, y se comprueba sobre el objeto —el de partida
 * contra el que volvió— y nunca sobre la cuenta.
 */
export const keyRestores = (loop: KeyLoop, key: KeyCandidate): boolean =>
  keyOpens(loop.action, key) && keyApply(loop.to, { op: key.op, value: key.value }) === loop.from;

/**
 * En qué orden se deshace una cadena: desde la última acción hacia la primera.
 * Es la propiedad del diseño que hará posible el nodo 14, y la única que este
 * nodo evalúa además de las llaves.
 */
export const keyUndoOrder = (loops: readonly KeyLoop[]): readonly string[] =>
  [...loops].reverse().map((l) => l.id);

/**
 * El error del catálogo que este nodo puede clasificar, y el único. `L` declara
 * `wrong_inverse_choice` sobre `prealg.inv.operation_as_key` con patrón
 * `key_mismatch` sobre el `chest_key`; ningún otro error del diseño tiene
 * entrada apuntando acá, así que ningún otro movimiento puede llevar
 * `misconception`.
 */
export const KEY_MISCONCEPTION = "wrong_inverse_choice";

/**
 * Qué error catalogado corresponde a un movimiento, si hay alguno.
 *
 * Elegir una llave cuya operación no es la inversa de la cerradura es tratar el
 * número como si fuera la acción, y las dos reglas `detect` del catálogo son
 * justamente eso: `a * x = b → x = b − a` cruza de pareja, y `x / a = b → x = b / a`
 * repite la operación. Las dos caen acá.
 *
 * La operación correcta con el número equivocado **no** clasifica: es un
 * movimiento válido que devuelve otra cosa, y el diseño lo separa a propósito
 * de la llave que no entra. Un movimiento acertado tampoco clasifica nunca.
 */
export function keyMisconceptionFor(
  action: KeyAction | undefined,
  key: KeyCandidate | undefined,
): string | undefined {
  if (!action || !key) return undefined;
  return keyOpens(action, key) ? undefined : KEY_MISCONCEPTION;
}

/**
 * Lo mismo, pero mirando la cadena entera.
 *
 * En una cadena, usar la llave de otro lazo no es elegir mal la inversa: es
 * deshacer en el orden equivocado. Ese error tiene su propia entrada en el
 * catálogo, `unwrap_order_inverted`, y esa entrada **no apunta a este nodo**, así
 * que el movimiento va sin campo. Es la misma disciplina que la variante del
 * número equivocado: un error que el juego muestra y que la remediación no
 * hereda.
 */
export function keyMisconceptionForKey(
  target: KeyLoop | undefined,
  key: KeyCandidate | undefined,
): string | undefined {
  if (!target || !key) return undefined;
  if (key.loop !== null) return undefined;
  return keyMisconceptionFor(target.action, key);
}

/**
 * El error de `explain`. El jugador señala la vuelta que usa la llave
 * equivocada; señalar la otra es afirmar que la llave que ni siquiera entra
 * deshace la cerradura, que es exactamente la idea que el catálogo llama
 * `key_mismatch`. Acertar no clasifica nunca.
 */
export const keyMisconceptionForTrial = (liar: number, picked: number): string | undefined =>
  picked === liar ? undefined : KEY_MISCONCEPTION;

export interface KeyProblem {
  readonly ask: KeyAsk;
  /** Las acciones, en el orden en que se aplicaron al objeto. */
  readonly loops: readonly KeyLoop[];
  /** El llavero. */
  readonly keys: readonly KeyCandidate[];
  /** Las operaciones que ofrece la ranura de la llave que se arma. */
  readonly ops: readonly KeyOp[];
  /** Los números que ofrece la otra ranura. */
  readonly tiles: readonly number[];
  /** Las dos vueltas que se comparan. Vacío fuera de `judge`. */
  readonly trials: readonly KeyTrial[];
  /** Cuál de las dos usa la llave equivocada, o -1. */
  readonly liar: number;
  /** La acción no aritmética que cerró el cofre, o null. */
  readonly lock: KeyArbitrary | null;
  /** El llavero de acciones del último nivel. Vacío fuera de `arbitrary`. */
  readonly actions: readonly KeyArbitrary[];
}

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de las dos cosas.
 */
export function generateOperationKey(level: KeyLevel, seed: number, round = 0): KeyProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as KeyAsk;

  if (ask === "arbitrary") return arbitraryProblem(level, round, rnd);

  const loops = makeChain(level, ask, rnd);
  const keys = makeRing(level, ask, loops, rnd);

  if (ask === "judge") return judgeProblem(loops, keys, rnd);
  if (ask === "assemble") return assembleProblem(level, loops, rnd);

  return {
    ask,
    loops,
    keys,
    ops: [],
    tiles: [],
    trials: [],
    liar: -1,
    lock: null,
    actions: [],
  };
}

/**
 * Las acciones que se le aplicaron al objeto, una detrás de la otra. La cadena
 * se construye hacia adelante desde el objeto de partida, que es el orden en
 * que el tallerista las hizo; deshacerla al revés es lo que el jugador tiene
 * que descubrir, y por eso el dato no lo trae ya invertido.
 */
function makeChain(level: KeyLevel, ask: KeyAsk, rnd: Random): KeyLoop[] {
  const p = level.params;
  // Comparar dos vueltas sobre una cadena pediría mirar cuatro flechas a la vez:
  // `judge` y `assemble` trabajan siempre sobre una sola acción.
  const largo = ask === "chain" ? p.chain : 1;
  const loops: KeyLoop[] = [];
  let value = rnd.int(p.start[0], p.start[1]);
  for (let i = 0; i < largo; i++) {
    // La segunda acción no puede ser la primera ni su llave. Iguales, la cadena
    // no tiene orden que invertir; inversas, la cadena se deshace sola y el
    // objeto de abajo es el mismo de arriba, que es justamente lo que el nivel
    // le pide al jugador que consiga.
    const previa = loops[i - 1]?.action.op;
    const ops =
      previa === undefined
        ? p.ops
        : p.ops.filter((o) => o !== previa && o !== KEY_INVERSE[previa]);
    const acotados = { ...p, ops: ops.length > 0 ? ops : p.ops };
    let loop = makeLoop(`l${i}`, value, acotados, rnd);
    // Y tampoco puede caer de casualidad en el objeto de partida: `×5` seguido
    // de `−28` sobre un siete devuelve el siete sin que nadie abra nada, y la
    // cadena dejaría de tener algo que deshacer. La coincidencia es de números
    // y no de operaciones, así que se descarta sorteando otra vez.
    const inicio = loops[0]?.from;
    for (let intento = 0; intento < 8 && loop.to === inicio; intento++) {
      loop = makeLoop(`l${i}`, value, acotados, rnd);
    }
    loops.push(loop);
    value = loop.to;
  }
  return loops;
}

/**
 * Una acción sola. Multiplicar y dividir se generan hacia atrás cuando hace
 * falta —el objeto tiene que ser divisible o el cofre devolvería una fracción,
 * que es de otro nodo— y restar se acota al objeto cuando el nivel todavía no
 * admite resultados bajo cero.
 */
function makeLoop(id: string, from: number, p: KeyParams, rnd: Random): KeyLoop {
  const [lo, hi] = p.operand;
  const op = rnd.pick(p.ops);

  if (op === "mul") {
    const techo = Math.max(2, Math.min(hi, KEY_MAX_FACTOR, Math.floor(KEY_MAX_VALUE / Math.max(from, 1))));
    const value = rnd.int(Math.min(2, techo), techo);
    return { id, action: { op, value }, from, to: from * value };
  }

  if (op === "div") {
    // Los divisores que tiene el objeto. Sin ninguno, la cerradura de dividir no
    // se puede poner sin inventar una fracción, y el nodo cambia de cerradura.
    const divisores: number[] = [];
    for (let d = 2; d <= Math.min(hi, KEY_MAX_FACTOR, from); d++) {
      if (from % d === 0) divisores.push(d);
    }
    if (divisores.length === 0) {
      const otras = p.ops.filter((o) => o !== "div");
      return makeLoop(id, from, { ...p, ops: otras.length > 0 ? otras : ["add"] }, rnd);
    }
    const value = rnd.pick(divisores);
    return { id, action: { op, value }, from, to: from / value };
  }

  if (op === "sub") {
    // Sin negativos la acción no puede pasarse del cero: lo que el nivel todavía
    // no enseñó no puede aparecer como resultado.
    const techo = p.negatives ? hi : Math.max(lo, Math.min(hi, from));
    const value = rnd.int(Math.min(lo, techo), techo);
    return { id, action: { op, value }, from, to: from - value };
  }

  const techo = Math.max(lo, Math.min(hi, KEY_MAX_VALUE - from));
  const value = rnd.int(Math.min(lo, techo), techo);
  return { id, action: { op, value }, from, to: from + value };
}

/**
 * El llavero. Trae la llave de cada lazo y se completa con distractores en el
 * orden que fija el diseño: la cerradura repetida, la inversa de la otra pareja
 * y el número cercano. Con dos llaves colgadas —el primer nivel— la única que
 * sobra es la cerradura repetida, que es la que se distingue mirando la forma.
 */
function makeRing(
  level: KeyLevel,
  ask: KeyAsk,
  loops: readonly KeyLoop[],
  rnd: Random,
): KeyCandidate[] {
  // La llave se arma en vez de colgarse, así que no hay llavero que mirar.
  if (ask === "assemble") return [];

  const out: KeyCandidate[] = [];
  const ocupada = (op: KeyOp, value: number): boolean =>
    out.some((k) => k.op === op && k.value === value);

  for (const loop of loops) {
    out.push({
      id: `k${out.length}`,
      op: KEY_INVERSE[loop.action.op],
      value: loop.action.value,
      loop: loop.id,
    });
  }

  const principal = loops[0] as KeyLoop;
  const accion = principal.action;
  const cerca = nearValue(principal, rnd);
  const senuelos: { readonly lure: KeyDistractor; readonly op: KeyOp; readonly value: number }[] = [
    { lure: "same_operation", op: accion.op, value: accion.value },
    { lure: "other_pair", op: KEY_PARTNER[accion.op], value: accion.value },
  ];
  if (cerca !== null) {
    senuelos.push({ lure: "near_value", op: KEY_INVERSE[accion.op], value: cerca });
  }
  // El relleno para cuando el número cercano no existe: la inversa de la otra
  // pareja con el número corrido. Sigue siendo una llave que no entra, que es lo
  // que el llavero necesita para que probar cueste algo.
  senuelos.push({ lure: "other_pair", op: KEY_PARTNER[accion.op], value: accion.value + 1 });

  for (const s of senuelos) {
    if (out.length >= Math.min(level.params.ring, KEY_RING_SLOTS)) break;
    if (ocupada(s.op, s.value)) continue;
    out.push({ id: `k${out.length}`, op: s.op, value: s.value, loop: null, lure: s.lure });
  }

  return rnd.shuffle(out);
}

/**
 * Un número cercano para la llave que abre y no devuelve, o null si no hay
 * ninguno posible. Con las cerraduras de multiplicar tiene que seguir siendo un
 * divisor del objeto: si no lo fuera, del cofre saldría una fracción y el
 * desajuste dejaría de leerse como desajuste.
 */
function nearValue(loop: KeyLoop, rnd: Random): number | null {
  const v = loop.action.value;
  if (loop.action.op === "mul") {
    // La llave es de dividir: los divisores del objeto transformado, salvo el
    // que sí devuelve.
    const divisores: number[] = [];
    for (let d = 2; d <= Math.min(KEY_MAX_FACTOR, Math.abs(loop.to)); d++) {
      if (loop.to % d === 0 && d !== v) divisores.push(d);
    }
    return divisores.length > 0 ? rnd.pick(divisores) : null;
  }
  // Multiplicar por uno no es una llave que devuelva otra cosa: es no hacer nada.
  const piso = loop.action.op === "div" ? 2 : 1;
  const cerca = rnd
    .shuffle([1, -1, 2, -2])
    .map((d) => v + d)
    .filter((x) => x >= piso && x !== v);
  return cerca[0] ?? null;
}

/**
 * Las dos vueltas que se comparan. Una usa la llave que abre y devuelve; la
 * otra, una que ni siquiera entra. Se eligen así y no entre "abre bien" y "abre
 * y no encaja" porque lo que `explain` evalúa es la primera forma de fallar, que
 * es la que el catálogo clasifica.
 */
function judgeProblem(
  loops: readonly KeyLoop[],
  keys: readonly KeyCandidate[],
  rnd: Random,
): KeyProblem {
  const loop = loops[0] as KeyLoop;
  const buena =
    keys.find((k) => k.loop === loop.id) ??
    ({ id: "kb", op: KEY_INVERSE[loop.action.op], value: loop.action.value, loop: loop.id } as KeyCandidate);
  const mala =
    keys.find((k) => !keyOpens(loop.action, k)) ??
    ({
      id: "km",
      op: KEY_PARTNER[loop.action.op],
      value: loop.action.value,
      loop: null,
      lure: "other_pair",
    } as KeyCandidate);

  const trial = (id: string, key: KeyCandidate): KeyTrial => ({
    id,
    key,
    opens: keyOpens(loop.action, key),
    restores: keyRestores(loop, key),
  });
  const pares = rnd.bool()
    ? [trial("t0", buena), trial("t1", mala)]
    : [trial("t0", mala), trial("t1", buena)];

  return {
    ask: "judge",
    loops,
    keys,
    ops: [],
    tiles: [],
    trials: pares,
    liar: pares.findIndex((t) => !t.restores),
    lock: null,
    actions: [],
  };
}

/**
 * La llave que se arma. Las dos ranuras aceptan cualquier ficha, y por eso las
 * dos listas traen la correcta entre otras que no lo son: si una ranura ofrecía
 * una sola cosa, armar la llave sería apretar un botón.
 */
function assembleProblem(level: KeyLevel, loops: readonly KeyLoop[], rnd: Random): KeyProblem {
  const loop = loops[0] as KeyLoop;
  const ops = rnd.shuffle(level.params.ops.slice(0, KEY_RING_SLOTS));
  const correcto = loop.action.value;
  const numeros = new Set<number>([correcto]);
  // Los números vecinos son los que hacen sentir la segunda forma de fallar: la
  // llave abre y lo que sale queda flotando al lado de la silueta.
  for (const d of [1, -1, 2, -2, 3]) {
    if (numeros.size >= KEY_TILE_SLOTS) break;
    const v = correcto + d;
    if (v >= 1) numeros.add(v);
  }
  return {
    ask: "assemble",
    loops,
    keys: [],
    ops,
    tiles: rnd.shuffle([...numeros]),
    trials: [],
    liar: -1,
    lock: null,
    actions: [],
  };
}

/**
 * Las cerraduras que no son aritméticas, y la que no tiene llave.
 *
 * La tanda la reparte la ronda y no el sorteo: el diseño pide una cerradura sin
 * llave **por tanda**, y sorteada podría no salir nunca. La última ronda de cada
 * vuelta de tres es la que no se puede deshacer.
 */
function arbitraryProblem(level: KeyLevel, round: number, rnd: Random): KeyProblem {
  const sinLlave = round % 3 === 2;
  const kind: KeyActionKind = sinLlave ? "flat" : rnd.pick(["turn", "hat", "color"] as const);
  const value = kind === "hat" ? rnd.int(1, 3) : 0;
  const lock: KeyArbitrary = {
    id: "lock",
    kind,
    value,
    correct: false,
    uninvertible: sinLlave,
  };

  const actions: KeyArbitrary[] = [
    // El candado tachado está siempre colgado: si apareciera solo cuando hace
    // falta, marcarlo sería leer el llavero y no la cerradura.
    { id: "a0", kind: "broken", value: 0, correct: sinLlave, uninvertible: true },
  ];
  if (!sinLlave) {
    // Girar se deshace girando al otro lado, permutar colores permutando de
    // vuelta y agregar quitando: la vuelta de una acción no aritmética se
    // dibuja igual que la acción, y lo que la distingue es el sentido.
    actions.push({ id: "a1", kind, value, correct: true, uninvertible: false });
  }
  for (const k of rnd.shuffle(["turn", "hat", "color"] as const)) {
    if (actions.length >= Math.min(level.params.ring, KEY_RING_SLOTS)) break;
    if (actions.some((a) => a.kind === k)) continue;
    actions.push({
      id: `a${actions.length}`,
      kind: k,
      value: k === "hat" ? rnd.int(1, 3) : 0,
      correct: false,
      uninvertible: false,
    });
  }

  return {
    ask: "arbitrary",
    loops: [],
    keys: [],
    ops: [],
    tiles: [],
    trials: [],
    liar: -1,
    lock,
    actions: rnd.shuffle(actions),
  };
}

export const keyLevelByNumber = (n: number): KeyLevel | undefined =>
  KEY_LEVELS.find((l) => l.n === n);
export const TOTAL_KEY_LEVELS = KEY_LEVELS.length;

registerNode({
  id: NODE,
  n: 12,
  prereqs: ["arith.sub.undo_add", "arith.div.undo_mul", "arith.int.negatives"],
  levels: KEY_LEVELS,
});

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const KEY_LAYERS: readonly Layer[] = ["concrete", "visual", "symbolic", "formal"];
export const KEY_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];
