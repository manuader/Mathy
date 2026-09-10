/**
 * La máquina en reversa, para `alg.fn.inverse_function`.
 *
 * Los ocho niveles y qué endurece cada parámetro salen del documento del
 * minijuego y de `D1/21`, no de acá: este archivo los implementa, no los decide.
 *
 * La idea que sostiene todo: **la inversa es un objeto del mismo tipo que
 * aquello que deshace**. En el nodo 12 la llave era una operación suelta y el
 * cofre era otra cosa; acá los dos son máquinas, y por eso `invInverse` no
 * devuelve una operación ni una fórmula sino otra `InvMachine`, que se puede
 * volver a invertir, encadenar y graficar. Que `invInverse(invInverse(f))` sea
 * `f` no es un test simpático: es la propiedad del diseño, ejecutable.
 *
 * La segunda idea es que **no toda máquina tiene inversa**, y el tipo lo dice:
 * `invInverse` devuelve `null` cuando la máquina junta entradas. No hay ninguna
 * bandera de "es inválido" ni ningún mensaje: la vuelta simplemente no existe,
 * y lo que el jugador decide en el último nivel es recortar las entradas
 * admitidas hasta que exista.
 *
 * ## Este nodo es el segundo regreso de la llave
 *
 * El nodo 12 dejó cosas escritas a propósito y acá se usan sin reescribirlas
 * ([E0], [H]):
 *
 * - `keyApply` aplica una acción a un objeto. Un `InvStep` tiene la forma de un
 *   `KeyAction` —una operación y un número, separados— así que se aplica con la
 *   misma función y no con una copia.
 * - `keyOpens` mira **solo la operación**. `invOpens` lo llama paso por paso:
 *   que la candidata abra sigue sin depender de los números, que es la
 *   separación que el nodo 12 defendía. Acá se ensancha una vez: tampoco
 *   depende del orden, porque el documento pide que la cadena mal ordenada se
 *   enganche y devuelva la bola cambiada en vez de trabarse.
 * - `keyUndoOrder` dice que la última acción se deshace primero. `invUndoOrder`
 *   lo llama tal cual, y con eso `(g∘f)⁻¹ = f⁻¹∘g⁻¹` queda escrito sin escribir
 *   ninguna fórmula: es el orden que `invInverse` recorre.
 * - `KEY_INVERSE` y `KEY_PARTNER` son la tabla de llaves y el señuelo central
 *   del nodo 12, y los distractores del llavero de máquinas salen de ahí.
 *
 * Lo que **no** sirvió tal cual, anotado para el nodo 29:
 *
 * - `KeyCandidate` es una llave con su operación y su número. Una candidata de
 *   este nodo es una máquina entera, así que `InvCandidate` envuelve una
 *   `InvMachine` y no se puede reusar aquel tipo. Era esperable: es exactamente
 *   el salto que el nodo enseña.
 * - `keyRestores` compara `keyApply(loop.to, key) === loop.from`, o sea una
 *   acción contra una acción. Con cadenas de dos pasos eso no alcanza, así que
 *   acá la comparación es de recorrido contra recorrido. La separación en dos
 *   predicados sí se conserva, y se parte en **tres** para el nodo 29:
 *   `invOpens` (abre), `invReturns` (el objeto volvió) y `invRestores` (las dos
 *   cosas, que es la forma del nodo 12). El teorema fundamental necesita
 *   justamente el caso en que abre y no devuelve, porque derivar destruyó la
 *   altura de arranque y la vuelta es una familia: ahí `invOpens` va a valer y
 *   `invReturns` no, y el `+ C` va a vivir en esa grieta.
 *
 * Sin texto visible: acá hay datos, claves y estructura. Los numerales, la
 * marca de la inversa y los paréntesis los compone la actividad, que es la que
 * sabe dibujar glifos.
 */

import { makeRandom, type Random } from "./random.ts";
import { registerNode, type LevelBase } from "./node.ts";
import type { Evidence, Layer } from "./one-step.ts";
import {
  KEY_INVERSE,
  KEY_PARTNER,
  keyApply,
  keyOpens,
  keyUndoOrder,
  type KeyCandidate,
  type KeyLoop,
  type KeyOp,
} from "./operation-key.ts";

/** El nodo del grafo que este minijuego enseña. */
export const NODE = "alg.fn.inverse_function";

/**
 * El mismo id, sin ambigüedad. `index.ts` reúne diecinueve minijuegos con
 * `export *` y cada uno declara su propio `NODE`, así que afuera del módulo se
 * lo nombra así. Todo lo demás de este archivo va prefijado por la misma razón.
 */
export const NODE_INVERSE_FUNCTION = NODE;

// --- La máquina --------------------------------------------------------------

/**
 * Las cuatro cerraduras del nodo 12, sin renombrarlas. Un alias y no una unión
 * nueva: si el día de mañana el nodo 12 agrega una operación, este nodo la
 * hereda y no queda a mitad de camino.
 */
export type InvOp = KeyOp;

/**
 * Un paso de la máquina: una operación y su número, separados a propósito. Es
 * la forma de `KeyAction`, así que `keyApply` lo aplica sin traducción.
 */
export interface InvStep {
  readonly op: InvOp;
  readonly value: number;
}

/**
 * Cómo una máquina junta entradas, cuando las junta. Son los tres
 * `collapse_kind` del generador del documento:
 *
 * - `mirror`: dos entradas simétricas caen en la misma salida. Es elevar al
 *   cuadrado, y es el caso que trae `sqrt_loses_negative_branch`.
 * - `periodic`: muchas entradas caen en la misma salida, una por vuelta. Es el
 *   resto de la división, y anticipa la rueda del arcoseno.
 * - `flat`: todas las entradas caen en la misma salida. Es el candado `×0` del
 *   nodo 12, el primero que el jugador vio sin llave.
 */
export type InvCollapse = "mirror" | "periodic" | "flat";

/**
 * Una máquina. Si `collapse` es `null`, la regla son sus pasos en el orden en
 * que tocan la bola; si no, la regla es la confluencia y `steps` está vacío,
 * porque juntar entradas no es una cadena de operaciones que se puedan deshacer
 * una por una: es lo contrario de eso.
 *
 * `name` es la letra con que la máquina se nombra desde la capa simbólica. Vive
 * acá y no en la escena porque el nombre depende del locale y del nivel, no del
 * dibujo.
 */
export interface InvMachine {
  readonly id: string;
  readonly name: string;
  readonly steps: readonly InvStep[];
  /** La máquina corre al revés: lleva la marca. */
  readonly inverted: boolean;
  readonly collapse: InvCollapse | null;
  /**
   * El período de la confluencia periódica, o el factor del aplastamiento. Cero
   * cuando la máquina no junta entradas.
   */
  readonly modulus: number;
}

/** El recorrido de la bola por la máquina, con lo que sale de cada paso. */
export interface InvRun {
  readonly output: number;
  /** Lo que sale de cada paso, en orden. Vacío en las máquinas que juntan. */
  readonly stages: readonly number[];
  /**
   * La otra entrada que cae en esta misma salida, o `null` si no hay ninguna.
   * No es un error ni una advertencia: es el dato con el que la escena dibuja
   * las dos bolas saliendo por la boca de entrada.
   */
  readonly twin: number | null;
}

/**
 * El techo de lo que puede valer un objeto. Con pasos de multiplicar la cadena
 * crece rápido y un número de cuatro cifras no endurece nada: tapa el caño y
 * convierte la pregunta en una cuenta.
 */
export const INV_MAX_VALUE = 400;

/**
 * Hasta cuánto puede multiplicar o dividir un paso, aunque el rango del nivel
 * llegue más arriba. Es la misma acotación que el nodo 12: multiplicar por doce
 * no obliga a elegir mejor la vuelta, solo desborda el caño.
 */
export const INV_MAX_FACTOR = 9;

/** Candidatas montadas siempre, para que el árbol de la escena no cambie. */
export const INV_RING_SLOTS = 4;
/** Fichas de respuesta montadas siempre, por la misma razón. */
export const INV_OPTION_SLOTS = 4;

/** Una máquina cualquiera, con los valores por omisión de las que no juntan. */
export function invMachine(
  id: string,
  name: string,
  steps: readonly InvStep[],
  inverted = false,
): InvMachine {
  return { id, name, steps, inverted, collapse: null, modulus: 0 };
}

/** Una máquina que junta entradas. No tiene pasos: tiene una confluencia. */
export function invCollapsingMachine(
  id: string,
  name: string,
  collapse: InvCollapse,
  modulus: number,
): InvMachine {
  return { id, name, steps: [], inverted: false, collapse, modulus };
}

/**
 * La máquina que no hace nada, que es su propia inversa. El documento la pide
 * en el último nivel y el modelo la dice sin ninguna excepción: una cadena de
 * cero pasos deshecha es otra cadena de cero pasos.
 */
export const invIdentity = (id: string, name: string): InvMachine =>
  invMachine(id, name, []);

/** La máquina no hace nada: ni pasos ni confluencia. */
export const invIsIdentity = (m: InvMachine): boolean =>
  m.collapse === null && m.steps.length === 0;

/**
 * Correr la bola por la máquina. **No decide nada**: aplica los pasos con la
 * misma función del nodo 12 y devuelve lo que sale de cada uno, para que la
 * escena interpole tamaños sin volver a calcular ninguna salida.
 */
export function invRun(machine: InvMachine, input: number): InvRun {
  if (machine.collapse !== null) return invCollapseRun(machine, input);
  const stages: number[] = [];
  let v = input;
  for (const step of machine.steps) {
    v = keyApply(v, step);
    stages.push(v);
  }
  return { output: v, stages, twin: null };
}

/**
 * La bola por una máquina que junta entradas. La salida es una sola —eso nunca
 * se rompe, es `same_input_same_output` del nodo 17— y lo que el dato agrega es
 * **cuál es la otra entrada** que aterriza en el mismo lugar. Con ese número la
 * escena puede sacar dos bolas por la boca de entrada al correrla al revés, que
 * es la única manera de mostrar que la vuelta no es una máquina.
 */
function invCollapseRun(machine: InvMachine, input: number): InvRun {
  const k = machine.modulus;
  if (machine.collapse === "mirror") {
    return { output: input * input, stages: [], twin: input === 0 ? null : -input };
  }
  if (machine.collapse === "periodic") {
    const p = Math.max(2, k);
    return { output: ((input % p) + p) % p, stages: [], twin: input + p };
  }
  // El aplastamiento total: todas las entradas caen en la misma salida, así que
  // la otra entrada es cualquiera. Se devuelve la de al lado para que la escena
  // tenga una bola concreta que sacar.
  return { output: 0, stages: [], twin: input + 1 };
}

// --- Los dos predicados, y el tercero que le queda al nodo 29 ----------------

/** Una llave del nodo 12 armada desde un paso, para poder llamar a `keyOpens`. */
const asKey = (step: InvStep, id: string): KeyCandidate => ({
  id,
  op: step.op,
  value: step.value,
  loop: null,
});

/**
 * Los pasos de la máquina como lazos del nodo 12: una acción, el objeto que
 * entró y el que quedó. Es la traducción entera entre los dos nodos, y existe
 * para poder llamar a `keyUndoOrder` sin copiarlo.
 */
export function invLoops(machine: InvMachine, input: number): readonly KeyLoop[] {
  const out: KeyLoop[] = [];
  let v = input;
  machine.steps.forEach((step, i) => {
    const to = keyApply(v, step);
    out.push({ id: `s${i}`, action: step, from: v, to });
    v = to;
  });
  return out;
}

/**
 * En qué orden deshace la inversa: **la última acción primero**.
 *
 * No lo decide este archivo: lo decide `keyUndoOrder`, del nodo 12, que ya está
 * testeado allá. Acá se lo llama y nada más, y con eso `(g∘f)⁻¹ = f⁻¹∘g⁻¹`
 * queda dicho sin escribir una fórmula. El objeto de partida no cambia el
 * orden, así que el cero de la firma es un objeto cualquiera y no un valor con
 * significado.
 */
export const invUndoOrder = (machine: InvMachine, input = 0): readonly string[] =>
  keyUndoOrder(invLoops(machine, input));

/** El paso de la máquina que un lazo nombra. */
const invStepById = (machine: InvMachine, id: string): InvStep | undefined =>
  machine.steps[Number(id.slice(1))];

/**
 * La candidata **abre**: cada uno de sus pasos es la llave de uno de los pasos
 * del original.
 *
 * Mira solo las operaciones, porque es `keyOpens` del nodo 12 llamado paso por
 * paso: el número no tiene nada que ver con que la máquina gire.
 *
 * Y **no mira el orden**. Una cadena con las operaciones correctas en el orden
 * equivocado se engancha igual —el documento es explícito: la que no
 * corresponde no se traba, se engancha y la bola sale distinta— y lo que falla
 * es el objeto que vuelve. Que el orden se note recién ahí es lo que hace
 * visible por qué la inversa de una cadena lo invierte: si el orden trabara la
 * máquina, el jugador nunca vería la bola volver cambiada.
 *
 * Una máquina que junta entradas no la abre nadie, y una candidata que junta
 * entradas no abre nada: la confluencia destruye información y eso no se
 * deshace.
 */
export function invOpens(machine: InvMachine, candidate: InvMachine): boolean {
  if (machine.collapse !== null || candidate.collapse !== null) return false;
  if (candidate.steps.length !== machine.steps.length) return false;
  const libres = [...machine.steps];
  return candidate.steps.every((llave, i) => {
    const j = libres.findIndex((paso) => keyOpens(paso, asKey(llave, `k${i}`)));
    if (j < 0) return false;
    libres.splice(j, 1);
    return true;
  });
}

/**
 * El objeto **volvió**: lo que salió de la máquina, metido por la candidata,
 * devuelve exactamente lo que había entrado.
 *
 * Se comprueba sobre el objeto y nunca sobre la cuenta, que es la disciplina
 * del nodo 12, y **no exige que la candidata abra**. Esa separación es lo que
 * le queda al nodo 29: la integral abre la derivada y no devuelve el objeto,
 * porque derivar destruyó la altura de arranque, y ahí `invOpens` va a valer y
 * esto no. El `+ C` vive exactamente en esa grieta.
 */
export const invReturns = (
  machine: InvMachine,
  candidate: InvMachine,
  input: number,
): boolean => invRun(candidate, invRun(machine, input).output).output === input;

/**
 * La candidata es la inversa: abre y devuelve. Es la forma del nodo 12
 * —`keyRestores` era `keyOpens` más la comparación del objeto— enunciada sobre
 * máquinas enteras.
 */
export const invRestores = (
  machine: InvMachine,
  candidate: InvMachine,
  input: number,
): boolean => invOpens(machine, candidate) && invReturns(machine, candidate, input);

/**
 * La inversa de una máquina, o `null` si no tiene.
 *
 * Devolver `null` es el enunciado entero de la cuarta dificultad del nodo: no
 * hay bandera de error ni excepción, la vuelta no existe y punto. Los pasos se
 * recorren en el orden que da `invUndoOrder` y cada uno se cambia por su llave
 * con la tabla del nodo 12: el orden invertido no está escrito acá, viene de
 * allá.
 */
export function invInverse(machine: InvMachine): InvMachine | null {
  if (machine.collapse !== null) return null;
  const steps = invUndoOrder(machine).flatMap((id) => {
    const paso = invStepById(machine, id);
    return paso ? [{ op: KEY_INVERSE[paso.op], value: paso.value }] : [];
  });
  return {
    id: `${machine.id}⁻`,
    name: machine.name,
    steps,
    inverted: !machine.inverted,
    collapse: null,
    modulus: 0,
  };
}

// --- El recorte de entradas --------------------------------------------------

/**
 * Los recortes que el jugador puede elegir. `none` es no recortar nada, y está
 * en la lista porque elegirlo es una respuesta y no la ausencia de una: es
 * quedarse con las dos ramas y llamarlas una.
 */
export type InvCut = "none" | "nonNegative" | "nonPositive" | "onePeriod" | "onePoint";

/**
 * El recorte deja una sola entrada por salida. Para la confluencia simétrica
 * sirven los dos lados y el jugador elige, que es justamente lo que el
 * documento pide que sea una decisión y no un cálculo.
 */
export function invCutWorks(collapse: InvCollapse, cut: InvCut): boolean {
  if (collapse === "mirror") return cut === "nonNegative" || cut === "nonPositive";
  if (collapse === "periodic") return cut === "onePeriod";
  return cut === "onePoint";
}

/** Qué se puede decir de la vuelta de una máquina, antes de intentarla. */
export type InvExists = "yes" | "cut" | "never";

/**
 * Si la máquina tiene inversa, la tiene después de recortar, o no la tiene de
 * ninguna manera.
 *
 * El aplastamiento total es el único `never`: recortarlo hasta que la vuelta
 * exista deja una sola entrada admitida, y una máquina con una entrada no es
 * una máquina que valga la pena. Es el candado `×0` del nodo 12, contestado con
 * la misma respuesta.
 */
export const invExistsFor = (machine: InvMachine): InvExists =>
  machine.collapse === null ? "yes" : machine.collapse === "flat" ? "never" : "cut";

/**
 * El único error del catálogo que apunta a este nodo.
 *
 * `misconceptions.yaml` lista `alg.fn.inverse_function` en
 * `sqrt_loses_negative_branch` y en ninguna otra entrada. El documento del
 * minijuego nombra además `wrong_inverse_choice` y `unwrap_order_inverted` como
 * heredadas, pero **el catálogo no las apunta acá**, así que ningún movimiento
 * de este archivo puede viajar con ellas: la regla del repositorio manda que el
 * `attempt` vaya sin campo cuando el catálogo no apunta al nodo, y un id
 * inventado ensucia la remediación para siempre.
 */
export const INV_MISCONCEPTION = "sqrt_loses_negative_branch";

/**
 * Decir que una máquina que junta dos entradas simétricas tiene inversa es
 * quedarse con una sola de las dos bolas y olvidar la otra. Es exactamente lo
 * que el catálogo llama `sqrt_loses_negative_branch`, con patrón `double_flip`
 * sobre `chest_key`, que es mecánica de este nodo y por eso corre sin traducir.
 *
 * Ninguna otra respuesta clasifica. Confundir el recorte de una confluencia
 * periódica, o decir que la máquina que aplasta todo se arregla recortando, son
 * movimientos que el juego muestra y que la remediación no hereda.
 */
export function invMisconceptionFor(
  machine: InvMachine,
  answer: InvExists,
): string | undefined {
  return machine.collapse === "mirror" && answer === "yes" ? INV_MISCONCEPTION : undefined;
}

/**
 * Lo mismo sobre el recorte: no recortar nada frente a la confluencia simétrica
 * es afirmar que las dos ramas son una sola.
 */
export function invMisconceptionForCut(
  machine: InvMachine,
  cut: InvCut,
): string | undefined {
  return machine.collapse === "mirror" && cut === "none" ? INV_MISCONCEPTION : undefined;
}

// --- El rastro y el doblez ---------------------------------------------------

/** Una gota: el par de entrada y salida, guardado en un solo lugar. */
export interface InvPair {
  readonly x: number;
  readonly y: number;
}

/** El mismo par con sus dos números intercambiados: el doblez, en un dato. */
export const invSwap = (p: InvPair): InvPair => ({ x: p.y, y: p.x });

/**
 * El rastro de una máquina sobre las entradas de un tramo. Es el mismo objeto
 * que el rastro del nodo 18 —una altura por posición— porque tiene que ser el
 * mismo: la tercera cara del nodo es que la inversa se lee en el rastro.
 */
export function invTrace(
  machine: InvMachine,
  from: number,
  to: number,
): readonly InvPair[] {
  const out: InvPair[] = [];
  for (let x = from; x <= to; x++) out.push({ x, y: invRun(machine, x).output });
  return out;
}

/** El rastro reflejado sobre la diagonal: el de la inversa, sin calcularlo otra vez. */
export const invReflect = (trace: readonly InvPair[]): readonly InvPair[] =>
  trace.map(invSwap);

/** Por qué una curva candidata está en pantalla, si no es la reflexión. */
export type InvFoldLure = "over_x_axis" | "over_y_axis" | "through_origin";

/** Una curva candidata del doblez, con el motivo por el que está. */
export interface InvCurve {
  readonly id: string;
  readonly points: readonly InvPair[];
  readonly correct: boolean;
  readonly lure?: InvFoldLure;
}

// --- Lo que se escribe -------------------------------------------------------

/**
 * Una pieza de una expresión escrita. La app la compone; acá no hay texto.
 *
 * `mark` es la marca de la inversa, y es una pieza propia y no una letra
 * pegada al nombre justamente porque **es un exponente**: la actividad la
 * dibuja levantada y más chica con el `−` y el `1` que el atlas ya tiene, y el
 * juego puede mostrar una vez que no significa "elevado a menos uno" sin que el
 * dato tenga que saber nada de eso.
 */
export type InvPiece =
  | { readonly kind: "num"; readonly value: number }
  | { readonly kind: "sym"; readonly name: string }
  | { readonly kind: "mark" }
  | { readonly kind: "op"; readonly op: InvOp }
  | { readonly kind: "open" }
  | { readonly kind: "close" }
  | { readonly kind: "eq" };

const numPiece = (value: number): InvPiece => ({ kind: "num", value });
const symPiece = (name: string): InvPiece => ({ kind: "sym", name });
const opPiece = (op: InvOp): InvPiece => ({ kind: "op", op });

/**
 * La regla de una máquina aplicada a un argumento, **en el orden en que los
 * pasos tocan la bola**.
 *
 * A diferencia de la del nodo 17, esta no reordena factores y sumandos: acá el
 * orden es el contenido del nodo, y escribir `2x + 3` cuando la cadena suma
 * primero diría otra máquina. Cada paso envuelve lo que había con paréntesis
 * cuando hace falta, que es el árbol de anidamiento del nodo 9 escrito en una
 * línea.
 */
export function invRulePieces(
  machine: InvMachine,
  argument: readonly InvPiece[],
): readonly InvPiece[] {
  let out = [...argument];
  // Un argumento compuesto necesita paréntesis en cuanto algo lo escala: sin
  // ellos `(x + 3) × 2` se escribiría `x + 3 × 2`, que es otra máquina.
  let compuesto = argument.length > 1;
  for (const step of machine.steps) {
    const escala = step.op === "mul" || step.op === "div";
    if (escala && compuesto) out = [{ kind: "open" }, ...out, { kind: "close" }];
    out = [...out, opPiece(step.op), numPiece(step.value)];
    compuesto = true;
  }
  return out;
}

/** `f(x)`, o `f⁻¹(y)`: el nombre con su marca y su argumento. */
export function invCallPieces(
  machine: InvMachine,
  argument: readonly InvPiece[],
): readonly InvPiece[] {
  const nombre: InvPiece[] = [symPiece(machine.name)];
  if (machine.inverted) nombre.push({ kind: "mark" });
  return [...nombre, { kind: "open" }, ...argument, { kind: "close" }];
}

/** `f(x) = 2x + 3`: la máquina contraída en un renglón. */
export const invFormulaPieces = (machine: InvMachine): readonly InvPiece[] => [
  ...invCallPieces(machine, [symPiece("x")]),
  { kind: "eq" },
  ...invRulePieces(machine, [symPiece("x")]),
];

/**
 * `f⁻¹(f(x)) = x`: lo que la cadena le hace a la bola, que es la definición de
 * la inversa dicha con la cadena y no con una fórmula.
 */
export function invIdentityPieces(machine: InvMachine): readonly InvPiece[] {
  const vuelta = invInverse(machine);
  const dentro = invCallPieces(machine, [symPiece("x")]);
  if (!vuelta) return dentro;
  return [...invCallPieces(vuelta, dentro), { kind: "eq" }, symPiece("x")];
}

// --- Lo que endurece ---------------------------------------------------------

/**
 * Lo único que endurece. La capa, la pregunta, la piel, los numerales y el
 * nombre escrito viven afuera justamente para que la regla del diseño —un nivel
 * cambia de capa o endurece parámetros, nunca las dos cosas— se pueda comprobar
 * con un test.
 */
export interface InvParams {
  /** Cuántos pasos tiene la máquina. Dos obliga a invertir el orden. */
  readonly steps: number;
  /** Qué operaciones puede usar un paso. */
  readonly ops: readonly InvOp[];
  /** El rango del número de un paso. */
  readonly operand: readonly [number, number];
  /** El rango de la bola que entra. */
  readonly input: readonly [number, number];
  /** Cuántas máquinas cuelgan del llavero. */
  readonly ring: number;
}

/** Las cuatro etapas de desvanecimiento de `machine_pipe` en E0. */
export type InvSkin = "machines" | "pipes" | "arrow_diagram" | "function_notation";

/**
 * Qué se pregunta en una ronda. No es dificultad: es qué gesto contesta.
 *
 * - `watch`: la máquina corre sola en las dos posiciones y el jugador toca la
 *   bola que volvió como era. Se mira y se reconoce, sin leer nada.
 * - `predict`: la escena se detiene con la bola cambiada frente a la boca de
 *   salida y hay tres finales dibujados; tocar el que va a pasar.
 * - `lever`: tirar de la palanca y meter la bola por la boca de salida hasta
 *   que vuelva idéntica. Es el gesto central del nodo.
 * - `ring`: elegir del llavero la máquina que deshace. Es el llavero del nodo
 *   12 con máquinas en vez de operaciones.
 * - `fold`: doblar la grilla por la diagonal y tocar el rastro que queda del
 *   otro lado.
 * - `swap`: tocar la gota que es el par dado vuelta.
 * - `name`: tocar la ficha que dice la regla de la máquina de vuelta.
 * - `identity`: tocar la ficha que dice qué deja la cadena de las dos.
 * - `order`: con máquinas de dos pasos, tocar la cadena que deshace. El señuelo
 *   central es la misma cadena sin invertir el orden.
 * - `exists`: decir si la máquina tiene inversa, si hay que recortar entradas o
 *   si no la tiene de ninguna manera.
 * - `cut`: elegir el recorte que hace existir la vuelta.
 */
export type InvAsk =
  | "watch"
  | "predict"
  | "lever"
  | "ring"
  | "fold"
  | "swap"
  | "name"
  | "identity"
  | "order"
  | "exists"
  | "cut";

export interface InvLevel extends LevelBase {
  readonly params: InvParams;
  /** Qué pide cada ronda, ciclando. Un nivel con dos preguntas alterna. */
  readonly asks: readonly InvAsk[];
  readonly skin: InvSkin;
  /** Los numerales sobre las máquinas y las bolas. */
  readonly numerals: boolean;
  /** Las máquinas llevan su nombre escrito, y la de vuelta su marca. */
  readonly named: boolean;
  /** El rastro con la diagonal, debajo del caño. */
  readonly sheet: boolean;
  /** La máquina llega plegada y se pide con un toque. */
  readonly onDemand: boolean;
  /**
   * Los errores del catálogo que este nivel clasifica. Un movimiento que el
   * nivel no declara se muestra igual, pero el `attempt` va sin campo: anotar un
   * error que el diseño todavía no está evaluando ensucia la remediación para
   * siempre.
   */
  readonly classifies: readonly string[];
  /** La definición corta con voz. Solo en `formal`. */
  readonly definition: boolean;
}

/** Máquinas de un paso, sumar y restar, bolas de un dígito. */
const P1: InvParams = {
  steps: 1,
  ops: ["add", "sub"],
  operand: [1, 9],
  input: [1, 9],
  ring: 2,
};

/** Entran multiplicar y dividir, y el llavero pasa a cuatro. */
const P2: InvParams = {
  steps: 1,
  ops: ["add", "sub", "mul", "div"],
  operand: [2, 9],
  input: [2, 12],
  ring: 4,
};

/** Dos pasos, donde la inversa invierte el orden, y rango numérico mayor. */
const P3: InvParams = {
  steps: 2,
  ops: ["add", "sub", "mul", "div"],
  operand: [2, 12],
  input: [2, 20],
  ring: 4,
};

/**
 * Los ocho niveles del documento. Cada uno cambia la capa o endurece los
 * parámetros, nunca las dos cosas:
 *
 * 1 → 2 y 2 → 3 cambian de capa con la misma máquina, 3 → 4 endurece sin
 * moverse de `concrete`, 4 → 5 y 5 → 6 cambian de capa con la misma dificultad
 * numérica, 6 → 7 endurece sin moverse de `symbolic` y 7 → 8 se lleva el nodo a
 * `formal` sin tocar un parámetro.
 *
 * DISCREPANCIA ANOTADA. El documento llama al nivel 8 `formal` y `abstract` a la
 * vez, y le pide además las máquinas que juntan entradas. Gana la regla del
 * repositorio por el mismo camino que el nodo 18: la capa queda en `formal`,
 * que es la que tiene superficie propia, y `abstract` en D1 es el estado del
 * nodo y no una pantalla. Y la confluencia entra como **pregunta** y no como
 * parámetro: `exists` y `cut` arman su propia máquina y no leen `params`, así
 * que el nivel 8 cambia de capa sin endurecer nada. No se pierde nada del
 * recorrido, se reparte distinto.
 */
export const INV_LEVELS: readonly InvLevel[] = [
  {
    n: 1,
    titleKey: "level.wrapAndUnwrap",
    layer: "real",
    evidence: ["recognize"],
    rounds: 3,
    params: P1,
    asks: ["watch"],
    skin: "machines",
    numerals: false,
    named: false,
    sheet: false,
    onDemand: false,
    classifies: [],
    definition: false,
  },
  {
    n: 2,
    titleKey: "level.whatComesOutTheOtherSide",
    layer: "intuition",
    evidence: ["explain"],
    rounds: 3,
    params: P1,
    asks: ["predict"],
    skin: "machines",
    numerals: false,
    named: false,
    sheet: false,
    onDemand: false,
    classifies: [],
    definition: false,
  },
  {
    n: 3,
    titleKey: "level.pullTheLever",
    layer: "concrete",
    evidence: ["manipulate"],
    rounds: 3,
    params: P1,
    asks: ["lever"],
    skin: "machines",
    numerals: false,
    named: false,
    sheet: false,
    onDemand: false,
    classifies: [],
    definition: false,
  },
  {
    n: 4,
    titleKey: "level.theMachineKeyRing",
    layer: "concrete",
    evidence: ["recognize", "manipulate"],
    rounds: 4,
    params: P2,
    asks: ["ring"],
    skin: "pipes",
    numerals: true,
    named: false,
    sheet: false,
    onDemand: false,
    classifies: [],
    definition: false,
  },
  {
    n: 5,
    titleKey: "level.foldTheGrid",
    layer: "visual",
    evidence: ["explain", "manipulate"],
    rounds: 4,
    params: P2,
    asks: ["fold", "swap"],
    skin: "arrow_diagram",
    numerals: true,
    named: false,
    sheet: true,
    onDemand: false,
    classifies: [],
    definition: false,
  },
  {
    n: 6,
    titleKey: "level.namesAndTheMark",
    layer: "symbolic",
    evidence: ["manipulate", "apply"],
    rounds: 4,
    params: P2,
    asks: ["name", "identity"],
    skin: "function_notation",
    numerals: true,
    named: true,
    sheet: true,
    onDemand: false,
    classifies: [],
    definition: false,
  },
  {
    n: 7,
    titleKey: "level.twoStepsAndGhostMachine",
    layer: "symbolic",
    evidence: ["apply"],
    rounds: 3,
    params: P3,
    asks: ["order"],
    skin: "function_notation",
    numerals: true,
    named: true,
    sheet: false,
    onDemand: true,
    classifies: [],
    definition: false,
  },
  {
    n: 8,
    titleKey: "level.machinesThatDoNotComeBack",
    layer: "formal",
    evidence: ["generalize"],
    rounds: 6,
    params: P3,
    asks: ["exists", "cut"],
    skin: "function_notation",
    numerals: true,
    named: true,
    sheet: true,
    onDemand: true,
    classifies: [INV_MISCONCEPTION],
    definition: true,
  },
];

export const invLevelByNumber = (n: number): InvLevel | undefined =>
  INV_LEVELS.find((l) => l.n === n);
export const TOTAL_INV_LEVELS = INV_LEVELS.length;

/** Las capas y los verbos que el nodo recorre, para los tests y el mapa. */
export const INV_LAYERS: readonly Layer[] = [
  "real",
  "intuition",
  "concrete",
  "visual",
  "symbolic",
  "formal",
];
export const INV_EVIDENCE: readonly Evidence[] = [
  "recognize",
  "explain",
  "manipulate",
  "apply",
  "generalize",
];

// --- La ronda ----------------------------------------------------------------

/** Por qué una candidata está en el llavero, si no es la que deshace. */
export type InvLure =
  | "same_operation"
  | "other_pair"
  | "near_value"
  | "wrong_order"
  | "reciprocal"
  | "applied_twice";

/** Una máquina candidata del llavero. */
export interface InvCandidate {
  readonly id: string;
  readonly machine: InvMachine;
  readonly correct: boolean;
  readonly lure?: InvLure;
}

/** Los tres finales dibujados de la ronda que predice. */
export type InvEnding = "same" | "twice" | "jam";

/** Una ficha de respuesta. Lo que muestra ya viene como piezas. */
export interface InvOption {
  readonly id: string;
  readonly pieces: readonly InvPiece[];
  readonly correct: boolean;
  readonly lure?: InvLure;
  /** El final que la ficha dibuja, en `predict`. */
  readonly ending?: InvEnding;
  /** La respuesta sobre la existencia de la vuelta, en `exists`. */
  readonly exists?: InvExists;
  /** El recorte que la ficha propone, en `cut`. */
  readonly cut?: InvCut;
}

export interface InvProblem {
  readonly ask: InvAsk;
  /** La máquina de ida. */
  readonly machine: InvMachine;
  /** La máquina de vuelta, o `null` cuando la de ida junta entradas. */
  readonly inverse: InvMachine | null;
  /** La bola que entra. */
  readonly input: number;
  /** Lo que salió de la máquina de ida, ya corrido. */
  readonly output: number;
  /** El llavero de máquinas. Vacío fuera de `ring` y `order`. */
  readonly ring: readonly InvCandidate[];
  /** Las fichas de respuesta. Vacío cuando la ronda se contesta sobre el objeto. */
  readonly options: readonly InvOption[];
  /** El rastro de la máquina y el de su vuelta. Vacíos sin hoja. */
  readonly trace: readonly InvPair[];
  readonly mirror: readonly InvPair[];
  /** Las curvas candidatas del doblez. Vacío fuera de `fold`. */
  readonly curves: readonly InvCurve[];
  /** La gota encendida y las marcadas entre las que se elige, en `swap`. */
  readonly lit: InvPair | null;
  readonly marked: readonly InvPair[];
  /** Las dos entradas que caen en la misma salida. Vacío si la máquina es inyectiva. */
  readonly branches: readonly number[];
  /** La ventana de la hoja, en unidades. */
  readonly window: { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };
}

/**
 * Genera una ronda. La semilla la hace reproducible; la ronda decide cuál de
 * las preguntas del nivel toca, porque un nivel con dos preguntas tiene que
 * alternarlas y no sortearlas: sorteadas, cuatro rondas pueden no dar nunca
 * evidencia de las dos cosas.
 */
export function generateInverse(level: InvLevel, seed: number, round = 0): InvProblem {
  const rnd = makeRandom(seed);
  const asks = level.asks;
  const ask = (asks[round % asks.length] ?? asks[0]) as InvAsk;

  if (ask === "exists" || ask === "cut") return collapseProblem(ask, round, rnd);

  const machine =
    ask === "fold" || ask === "swap"
      ? makeSheetMachine(level.params, rnd)
      : makeMachine(level.params, rnd);
  const input = pickInput(machine, level.params, rnd);
  const output = invRun(machine, input).output;
  const inverse = invInverse(machine);

  const base = {
    ask,
    machine,
    inverse,
    input,
    output,
    ring: [] as readonly InvCandidate[],
    options: [] as readonly InvOption[],
    trace: [] as readonly InvPair[],
    mirror: [] as readonly InvPair[],
    curves: [] as readonly InvCurve[],
    lit: null as InvPair | null,
    marked: [] as readonly InvPair[],
    branches: [] as readonly number[],
    window: SHEET,
  };

  if (ask === "ring" || ask === "order") {
    return { ...base, ring: makeRing(level.params, machine, inverse, input, rnd) };
  }
  if (ask === "watch") {
    return { ...base, options: watchOptions(machine, input, output) };
  }
  if (ask === "predict") {
    return { ...base, options: predictOptions(machine, input, output, rnd) };
  }
  if (ask === "name") {
    return { ...base, options: nameOptions(machine, inverse, rnd) };
  }
  if (ask === "identity") {
    return { ...base, options: identityOptions(machine, rnd) };
  }
  if (ask === "fold" || ask === "swap") {
    return sheetProblem(base, ask, machine, rnd);
  }
  return base;
}

// --- Armar la máquina --------------------------------------------------------

/**
 * Una máquina de tantos pasos como pida el nivel. La cadena se construye hacia
 * adelante desde una bola de partida, que es el orden en que la máquina la
 * toca; deshacerla al revés es lo que el jugador tiene que descubrir, y por eso
 * el dato no lo trae ya invertido.
 */
function makeMachine(p: InvParams, rnd: Random): InvMachine {
  const steps: InvStep[] = [];
  let v = rnd.int(p.input[0], p.input[1]);
  for (let i = 0; i < p.steps; i++) {
    // El segundo paso no puede ser el primero ni su llave. Iguales, la vuelta no
    // tiene orden que invertir; inversas, la máquina no hace nada y la bola sale
    // como entró sin que nadie tire de ninguna palanca.
    const previa = steps[i - 1]?.op;
    const ops =
      previa === undefined
        ? p.ops
        : p.ops.filter((o) => o !== previa && o !== KEY_INVERSE[previa]);
    const acotados = { ...p, ops: ops.length > 0 ? ops : p.ops };
    const step = makeStep(v, acotados, rnd);
    steps.push(step);
    v = keyApply(v, step);
  }
  return invMachine("f", "f", steps);
}

/**
 * Una máquina cuyo rastro y cuya reflexión caben enteros en la hoja.
 *
 * No alcanza con generar una cualquiera: `×7` deja una sola gota adentro de la
 * ventana y un rastro de una gota no se refleja, se mira. Se sortean máquinas
 * hasta que el tramo que cabe tenga cuerpo y salga de la diagonal, y si ninguna
 * cierra gana la que siempre cierra, que es sumar uno: el doblez tiene que
 * poder verse aunque el sorteo se porte mal.
 */
function makeSheetMachine(p: InvParams, rnd: Random): InvMachine {
  for (let intento = 0; intento < 40; intento++) {
    const m = makeMachine(p, rnd);
    const rastro = dentroDeLaHoja(m);
    if (rastro.length >= 4 && rastro.some((punto) => punto.x !== punto.y)) return m;
  }
  return invMachine("f", "f", [{ op: "add", value: 1 }]);
}

/**
 * Un paso solo. Multiplicar y dividir se generan contra la bola que tienen
 * enfrente —tiene que ser divisible, o de la máquina saldría una fracción, que
 * es de otro nodo— y restar se acota a la bola porque el nodo todavía no
 * admite resultados bajo cero: lo que el jugador no vio no puede salir del caño.
 */
function makeStep(from: number, p: InvParams, rnd: Random): InvStep {
  const [lo, hi] = p.operand;
  const op = rnd.pick(p.ops);

  if (op === "mul") {
    const techo = Math.max(2, Math.min(hi, INV_MAX_FACTOR, Math.floor(INV_MAX_VALUE / Math.max(from, 1))));
    return { op, value: rnd.int(Math.min(2, techo), techo) };
  }

  if (op === "div") {
    // Los divisores que tiene la bola. Sin ninguno, el paso de dividir no se
    // puede poner sin inventar una fracción, y la máquina cambia de paso.
    const divisores: number[] = [];
    for (let d = 2; d <= Math.min(hi, INV_MAX_FACTOR, Math.abs(from)); d++) {
      if (from % d === 0) divisores.push(d);
    }
    if (divisores.length === 0) {
      const otras = p.ops.filter((o) => o !== "div");
      return makeStep(from, { ...p, ops: otras.length > 0 ? otras : ["add"] }, rnd);
    }
    return { op, value: rnd.pick(divisores) };
  }

  if (op === "sub") {
    const techo = Math.max(lo, Math.min(hi, from));
    return { op, value: rnd.int(Math.min(lo, techo), techo) };
  }

  const techo = Math.max(lo, Math.min(hi, INV_MAX_VALUE - from));
  return { op, value: rnd.int(Math.min(lo, techo), techo) };
}

/**
 * Una bola que la máquina acepta: la cadena entera tiene que quedar en enteros
 * y no pasarse del techo. Se prueban unas cuantas y, si ninguna cierra, gana la
 * que la máquina se armó pensando, que siempre cierra por construcción.
 */
function pickInput(machine: InvMachine, p: InvParams, rnd: Random): number {
  // Y tampoco puede caer de casualidad en la bola de partida: `×2` seguido de
  // `−5` sobre un cinco devuelve el cinco sin que nadie tire de la palanca, y la
  // ronda se quedaría sin nada que deshacer. Es la misma precaución que el nodo
  // 12 toma con sus cadenas.
  // Y la bola no puede pasar por cero en el camino: un cero multiplicado o
  // dividido sigue siendo cero, así que el número de la vuelta deja de importar
  // y una máquina con el número equivocado devolvería igual. El cero que se
  // traga todo es el candado `×0` del nodo 12 y es del último nivel, no de acá.
  const sirve = (v: number): boolean => {
    if (!invAccepts(machine, v)) return false;
    const corrida = invRun(machine, v);
    if (machine.steps.length > 0 && corrida.output === v) return false;
    return v !== 0 && corrida.stages.every((s) => s !== 0);
  };
  for (let intento = 0; intento < 24; intento++) {
    const v = rnd.int(p.input[0], p.input[1]);
    if (sirve(v)) return v;
  }
  for (let v = p.input[0]; v <= p.input[1]; v++) {
    if (sirve(v)) return v;
  }
  return p.input[0];
}

/**
 * La máquina acepta la bola: la cadena queda en enteros, no baja de cero y no
 * se pasa del techo. Es el dominio del nodo 24 anticipado sin nombrarlo, y por
 * eso es una función y no una guarda escondida en el generador.
 */
export function invAccepts(machine: InvMachine, input: number): boolean {
  if (machine.collapse !== null) return true;
  let v = input;
  for (const step of machine.steps) {
    if (step.op === "div" && (step.value === 0 || v % step.value !== 0)) return false;
    v = keyApply(v, step);
    if (!Number.isInteger(v) || v < 0 || Math.abs(v) > INV_MAX_VALUE) return false;
  }
  return true;
}

// --- El llavero de máquinas --------------------------------------------------

/**
 * El llavero. Trae la máquina que deshace y se completa con señuelos en el
 * orden que fija el diseño, todos sacados de las reglas `detect` del catálogo
 * del nodo 12: la misma operación sin invertir, la inversa de la otra pareja y,
 * en las de dos pasos, el orden sin invertir.
 *
 * La que no corresponde **no se traba**: se engancha, la bola sale distinta y
 * queda al lado de la original. Por eso el dato no marca a ninguna como
 * prohibida, solo dice cuál devuelve.
 */
function makeRing(
  p: InvParams,
  machine: InvMachine,
  inverse: InvMachine | null,
  input: number,
  rnd: Random,
): readonly InvCandidate[] {
  const out: InvCandidate[] = [];
  const nombres = ["g", "h", "p", "q"];
  const agregar = (steps: readonly InvStep[], correct: boolean, lure?: InvLure): void => {
    if (out.length >= Math.min(p.ring, INV_RING_SLOTS)) return;
    // Dos candidatas con los mismos pasos son la misma máquina dibujada dos
    // veces, y elegir entre ellas no es elegir nada.
    if (out.some((c) => mismosPasos(c.machine.steps, steps))) return;
    // Un señuelo que igual devuelve la bola no es un señuelo: es una segunda
    // respuesta correcta. Pasa cuando el número corrido cae en un lugar donde
    // la cuenta cierra igual, y se descarta acá y no adivinando.
    const candidata = { ...invMachine("tmp", "tmp", steps), inverted: true };
    if (!correct && invRestores(machine, candidata, input)) return;
    const nombre = nombres[out.length] ?? "g";
    out.push({
      id: `c${out.length}`,
      machine: { ...invMachine(`c${out.length}`, nombre, steps), inverted: true },
      correct,
      ...(lure ? { lure } : {}),
    });
  };

  if (inverse) agregar(inverse.steps, true);

  // La cerradura repetida: aplicar otra vez la acción en lugar de deshacerla.
  agregar(machine.steps, false, "same_operation");
  // El orden sin invertir: las operaciones son las que van y el orden no. Va
  // **antes** que el señuelo del nodo 12 porque es el del nivel de dos pasos y
  // el que hace visible por qué el orden se da vuelta; con el llavero de cuatro
  // ganchos, el que se agrega primero es el que entra. Con máquinas de un paso
  // no existe: no hay orden que invertir.
  if (machine.steps.length > 1 && inverse) {
    agregar([...inverse.steps].reverse(), false, "wrong_order");
  }
  // La inversa de la otra pareja, con el mismo número. Es el señuelo central del
  // nodo 12: conserva el número y cambia la operación. Con dos pasos puede caer
  // en la misma cadena que el del orden —con `+` y `×`, la pareja de cada paso
  // es la llave del otro— y ahí se descarta solo por repetida.
  agregar(
    machine.steps.map((s) => ({ op: KEY_PARTNER[s.op], value: s.value })).reverse(),
    false,
    "other_pair",
  );
  // La operación correcta con el número corrido. **No es un error catalogado**:
  // es un movimiento válido que devuelve otra cosa, y el juego solo deja ver que
  // la bola no volvió a ser la que era.
  if (inverse) {
    agregar(
      inverse.steps.map((s, i) => (i === 0 ? { op: s.op, value: cerca(s) } : s)),
      false,
      "near_value",
    );
  }

  return rnd.shuffle(out);
}

const mismosPasos = (a: readonly InvStep[], b: readonly InvStep[]): boolean =>
  a.length === b.length && a.every((s, i) => s.op === b[i]?.op && s.value === b[i]?.value);

/**
 * Un número vecino para la máquina que abre y no devuelve. Multiplicar por uno
 * no es una vuelta que devuelva otra cosa: es no hacer nada, así que los pasos
 * que escalan no bajan de dos.
 */
const cerca = (step: InvStep): number => {
  const piso = step.op === "mul" || step.op === "div" ? 2 : 1;
  return Math.max(piso, step.value + (step.value > piso ? -1 : 1));
};

// --- Las fichas de respuesta -------------------------------------------------

/**
 * Las dos bolas de la mesa. Una es la que volvió y la otra la que saldría de
 * correr la máquina dos veces hacia adelante, que es el error de entender la
 * palanca como "hacerlo otra vez".
 */
function watchOptions(machine: InvMachine, input: number, output: number): readonly InvOption[] {
  const fichas: InvOption[] = [
    { id: "o0", pieces: [numPiece(input)], correct: true },
    { id: "o1", pieces: [numPiece(dosVecesEntero(machine, input, output))], correct: false, lure: "applied_twice" },
  ];
  return fichas;
}

/**
 * La bola que sale de correr la máquina dos veces para adelante, que es el
 * señuelo de las dos primeras capas. Si esa segunda vuelta no diera un entero, o
 * cayera justo en la bola de partida, la ficha dejaría de decir lo que quiere
 * decir: ahí se corre un lugar y sigue siendo una bola distinta.
 */
function dosVecesEntero(machine: InvMachine, input: number, output: number): number {
  const v = invRun(machine, output).output;
  return Number.isInteger(v) && v !== input && v > 0 ? v : output + 1;
}

/**
 * Los tres finales del documento: sale la caja original, sale envuelta dos
 * veces, o la máquina se traba porque dos cajas distintas se envuelven igual.
 * En este nivel la máquina siempre se puede correr al revés, así que el tercer
 * final es un señuelo que vuelve a ser cierto en el último nivel.
 */
function predictOptions(
  machine: InvMachine,
  input: number,
  output: number,
  rnd: Random,
): readonly InvOption[] {
  const fichas: InvOption[] = [
    { id: "o0", pieces: [numPiece(input)], correct: true, ending: "same" },
    {
      id: "o1",
      pieces: [numPiece(dosVecesEntero(machine, input, output))],
      correct: false,
      ending: "twice",
      lure: "applied_twice",
    },
    // La máquina trabada no tiene bola que mostrar: la ficha es el candado
    // tachado del nodo 12, y la actividad la dibuja con la cruz.
    { id: "o2", pieces: [], correct: false, ending: "jam" },
  ];
  return rnd.shuffle(fichas);
}

/**
 * La regla de la máquina de vuelta, entre reglas que no lo son. La ficha del
 * recíproco está a propósito: es la única vez que el juego muestra que la marca
 * no significa "elevado a menos uno", y el llavero del nodo 12 queda al lado
 * para marcar la diferencia con dividir.
 */
function nameOptions(
  machine: InvMachine,
  inverse: InvMachine | null,
  rnd: Random,
): readonly InvOption[] {
  const x = [symPiece("x")];
  const fichas: InvOption[] = [];
  if (inverse) fichas.push({ id: "o0", pieces: invRulePieces(inverse, x), correct: true });
  fichas.push({
    id: "o1",
    pieces: invRulePieces(machine, x),
    correct: false,
    lure: "same_operation",
  });
  const pareja = invMachine(
    "p",
    "p",
    machine.steps.map((s) => ({ op: KEY_PARTNER[s.op], value: s.value })).reverse(),
  );
  fichas.push({ id: "o2", pieces: invRulePieces(pareja, x), correct: false, lure: "other_pair" });
  fichas.push({
    id: "o3",
    pieces: [
      numPiece(1),
      opPiece("div"),
      { kind: "open" },
      ...invRulePieces(machine, x),
      { kind: "close" },
    ],
    correct: false,
    lure: "reciprocal",
  });
  return rnd.shuffle(fichas.slice(0, INV_OPTION_SLOTS));
}

/**
 * Qué deja la cadena de las dos máquinas. La respuesta es la bola que entró, y
 * los señuelos son los dos lugares donde el jugador se queda a mitad de camino:
 * la salida de la primera, y lo que sale de aplicarla dos veces.
 */
function identityOptions(machine: InvMachine, rnd: Random): readonly InvOption[] {
  const x = [symPiece("x")];
  const fichas: InvOption[] = [
    { id: "o0", pieces: x, correct: true },
    // Quedarse a mitad de camino: la bola salió de la primera máquina y nadie
    // la metió por la segunda.
    { id: "o1", pieces: invCallPieces(machine, x), correct: false, lure: "same_operation" },
    // Correrla dos veces para adelante en vez de correrla al revés. Se escribe
    // y no se calcula: en la capa simbólica la cuenta no es la pregunta, y con
    // una máquina que divide el número saldría fraccionario, que es de otro nodo.
    {
      id: "o2",
      pieces: invCallPieces(machine, invCallPieces(machine, x)),
      correct: false,
      lure: "applied_twice",
    },
  ];
  return rnd.shuffle(fichas);
}

// --- La hoja y el doblez -----------------------------------------------------

/** La ventana de la hoja, en unidades. Cuadrada, porque la diagonal lo exige. */
const SHEET = { x0: -6, x1: 6, y0: -6, y1: 6 } as const;

/**
 * El rastro de la máquina y su reflexión, con las curvas candidatas o las gotas
 * marcadas según lo que la ronda pregunte.
 *
 * Los dos rastros tienen que caber enteros en la hoja: un rastro que se sale
 * por arriba y una reflexión que se sale por la derecha no se ven simétricos, y
 * lo simétrico es todo el contenido del nivel.
 */
function sheetProblem(
  base: InvProblem,
  ask: InvAsk,
  machine: InvMachine,
  rnd: Random,
): InvProblem {
  const trace = dentroDeLaHoja(machine);
  const mirror = invReflect(trace);

  if (ask === "fold") {
    const curvas: InvCurve[] = [
      { id: "f0", points: mirror, correct: true },
      {
        id: "f1",
        points: trace.map((p) => ({ x: p.x, y: -p.y })),
        correct: false,
        lure: "over_x_axis",
      },
      {
        id: "f2",
        points: trace.map((p) => ({ x: -p.x, y: p.y })),
        correct: false,
        lure: "over_y_axis",
      },
    ];
    return { ...base, ask, trace, mirror, curves: rnd.shuffle(curvas) };
  }

  // La gota encendida no puede caer sobre la diagonal: ahí el par dado vuelta
  // es el mismo par y el gesto no muestra nada.
  const fuera = trace.filter((p) => p.x !== p.y);
  const lit = (fuera.length > 0 ? rnd.pick(fuera) : trace[0]) ?? { x: 0, y: 0 };
  const marcadas: InvPair[] = [
    invSwap(lit),
    { x: -lit.x, y: lit.y },
    { x: lit.x, y: -lit.y },
  ];
  const vistas = new Set<string>();
  const marked = marcadas.filter((p) => {
    const clave = `${p.x},${p.y}`;
    if (vistas.has(clave) || !dentro(p)) return false;
    vistas.add(clave);
    return true;
  });
  return { ...base, ask, trace, mirror, lit, marked: rnd.shuffle(marked) };
}

const dentro = (p: InvPair): boolean =>
  p.x >= SHEET.x0 && p.x <= SHEET.x1 && p.y >= SHEET.y0 && p.y <= SHEET.y1;

/**
 * El tramo del rastro que cabe en la hoja junto con su reflexión. Se recorta y
 * no se reescala: el doblez es una simetría y una hoja con dos escalas la
 * escondería.
 */
function dentroDeLaHoja(machine: InvMachine): readonly InvPair[] {
  const out: InvPair[] = [];
  for (let x = SHEET.x0; x <= SHEET.x1; x++) {
    if (!invAccepts(machine, x)) continue;
    const p = { x, y: invRun(machine, x).output };
    if (dentro(p) && dentro(invSwap(p))) out.push(p);
  }
  return out;
}

// --- Las máquinas que juntan entradas ----------------------------------------

/**
 * La ronda del último nivel. La máquina la reparte la ronda y no el sorteo: el
 * documento pide las cuatro clases —la que no hace nada, la que junta dos
 * entradas simétricas, la que las junta por vueltas y la que las aplasta todas—
 * y sorteadas alguna podría no salir nunca.
 */
function collapseProblem(ask: InvAsk, round: number, rnd: Random): InvProblem {
  const machine = collapseMachine(ask, round, rnd);
  const input = machine.collapse === "periodic" ? rnd.int(1, 5) : rnd.int(1, 4);
  const corrida = invRun(machine, input);
  const trace = invTrace(machine, -4, 4).filter(dentro);

  const options =
    ask === "exists" ? existsOptions(machine, rnd) : cutOptions(machine, rnd);

  return {
    ask,
    machine,
    inverse: invInverse(machine),
    input,
    output: corrida.output,
    ring: [],
    options,
    trace,
    mirror: invReflect(trace).filter(dentro),
    curves: [],
    lit: null,
    marked: [],
    branches: corrida.twin === null ? [] : [input, corrida.twin],
    window: SHEET,
  };
}

/**
 * Qué máquina toca. `exists` recorre las cuatro clases en el orden del
 * documento; `cut` solo puede preguntar por las dos que se arreglan recortando,
 * porque elegir el recorte de la que no hace nada no es una pregunta.
 */
function collapseMachine(ask: InvAsk, round: number, rnd: Random): InvMachine {
  if (ask === "cut") {
    return round % 4 === 1
      ? invCollapsingMachine("m", "f", "mirror", 0)
      : invCollapsingMachine("m", "f", "periodic", rnd.int(2, 4));
  }
  const clase = Math.floor(round / 2) % 3;
  if (clase === 0) return invCollapsingMachine("m", "f", "mirror", 0);
  // La máquina que no hace nada, que es su propia inversa.
  if (clase === 1) return invIdentity("m", "f");
  return invCollapsingMachine("m", "f", "flat", 0);
}

/** Las tres respuestas sobre la existencia de la vuelta. */
function existsOptions(machine: InvMachine, rnd: Random): readonly InvOption[] {
  const correcta = invExistsFor(machine);
  const todas: InvExists[] = ["yes", "cut", "never"];
  const fichas: InvOption[] = todas.map((e, i) => ({
    id: `o${i}`,
    pieces: [],
    correct: e === correcta,
    exists: e,
  }));
  return rnd.shuffle(fichas);
}

/**
 * Los recortes que se ofrecen. Los dos lados de la confluencia simétrica están
 * los dos, y los dos sirven: el documento pide que haya más de una elección
 * razonable y que la elección sea del jugador.
 */
function cutOptions(machine: InvMachine, rnd: Random): readonly InvOption[] {
  const collapse = machine.collapse;
  const todos: InvCut[] =
    collapse === "mirror"
      ? ["nonNegative", "nonPositive", "none"]
      : ["onePeriod", "none", "onePoint"];
  const fichas: InvOption[] = todos.map((c, i) => ({
    id: `o${i}`,
    pieces: [],
    correct: collapse !== null && invCutWorks(collapse, c),
    cut: c,
  }));
  return rnd.shuffle(fichas);
}

registerNode({
  id: NODE,
  n: 21,
  prereqs: ["alg.fn.composition", "prealg.inv.operation_as_key", "alg.fn.graph_as_picture"],
  levels: INV_LEVELS,
});
