/**
 * Las reglas locales: lo que se puede decidir sin preguntarle a nadie.
 *
 * Existen antes que cualquier modelo y por una razón de costo y de honestidad:
 * de los cinco textos malos que dejó la sesión del 11 de septiembre, tres los
 * agarra una lista de palabras. Un modelo de decisión se paga sólo por lo que
 * una regla no puede juzgar —si el texto se entiende, si nombra lo que la
 * escena dibuja, si la guía dice lo que la actividad pide—, y para saber cuánto
 * aporta hace falta tener contra qué compararlo.
 *
 * Toda regla devuelve `p = 1`: una coincidencia literal no tiene incertidumbre.
 * Lo que sí tiene incertidumbre es si molesta, y eso lo decide la severidad.
 */

import type { Entry, Finding } from "./types.ts";
import type { Objetos } from "./corpus.ts";

/** Sin acentos y en minúsculas, igual que el buscador de la chuleta. */
const fold = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * En minúsculas pero CON acentos. El acento es el dato: "arrastrá" es voseo y
 * "arrastra" es tuteo, y son la misma palabra apenas se la pliega. Plegar acá
 * daba 227 errores falsos, uno por cada orden bien escrita del juego.
 */
const lower = (text: string): string => text.toLowerCase();

/** Las frases de un texto, para mirar sólo la palabra que abre cada una. */
const sentences = (text: string): readonly string[] =>
  text.split(/(?<=[.!?¿¡])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 0);

/**
 * Imperativos de tuteo: la misma orden en voseo lleva la tilde al final.
 *
 * Están partidos en dos porque la mitad de estas palabras son también un
 * sustantivo o una tercera persona, y empiezan una frase perfectamente válida:
 * "Marca distinta, caja distinta" es el título de una llave, y "Gira sin
 * moverse" describe al caminante. Esas van como aviso, no como error, y son
 * justamente las que un modelo de decisión podría desambiguar mirando la frase
 * entera. Ojo con las tildes: "fijate" es voseo y "fíjate" es tuteo.
 */
const TUTEO_CLARO = new Set(["arrastra", "fíjate", "elige", "escribe", "aprieta", "suelta", "haz", "pon"]);
const TUTEO_AMBIGUO = new Set(["mira", "toca", "gira", "mueve", "cuenta", "marca", "busca", "prueba", "junta", "saca", "deja", "ve"]);
/** Otras formas que sólo existen en tuteo. */
// "tu" y "tus" no entran: en voseo el posesivo es igual ("tus llaves").
const TUTEO = /\b(tú|tienes|puedes|debes|quieres|sabes|haz|hazlo|ponlo|míralo|tómalo)\b/;
/** Voseo bien escrito, pero contando en vez de pidiendo: "Movés uno y la rampa se corre". */
const INDICATIVO = new Set(["movés", "tocás", "arrastrás", "girás", "contás", "soltás", "apretás"]);

const hit = (entry: Entry, rule: string, severity: Finding["severity"], why: string): Finding => ({
  key: entry.key,
  text: entry.text,
  rule,
  severity,
  why,
  p: 1,
  source: "rules",
});

/** Una pasada por un texto. El corpus entero se revisa con `runRules`. */
export function checkEntry(entry: Entry, objetos: Objetos): readonly Finding[] {
  const out: Finding[] = [];
  const plano = fold(entry.text);
  const conAcentos = lower(entry.text);

  if (entry.text === entry.key) {
    out.push(hit(entry, "clave_sin_texto", "error", "La clave no tiene texto: el jugador vería la clave."));
    return out;
  }

  for (const frase of sentences(entry.text)) {
    const primera = lower(frase).split(/[\s,;:]/)[0] ?? "";
    if (TUTEO_CLARO.has(primera)) {
      out.push(hit(entry, "voseo", "error", `"${frase.split(/\s/)[0]}" es tuteo; en voseo la orden lleva tilde al final.`));
    } else if (TUTEO_AMBIGUO.has(primera) && (entry.role === "objetivo" || entry.role === "paso_de_guia")) {
      out.push(hit(entry, "voseo_dudoso", "aviso", `"${frase.split(/\s/)[0]}" abre la frase: si es una orden le falta la tilde, y si es un sustantivo está bien.`));
    } else if (INDICATIVO.has(primera)) {
      out.push(hit(entry, "orden_en_indicativo", "aviso", `"${frase.split(/\s/)[0]}" cuenta lo que pasa en vez de pedirlo.`));
    }
  }
  if (TUTEO.test(conAcentos)) out.push(hit(entry, "voseo", "error", "Hay una forma de tuteo; el juego habla de vos."));

  for (const palabra of objetos.global.prohibido) {
    if (plano.includes(fold(palabra))) {
      out.push(hit(entry, "nunca_incorrecto", "error", `Dice "${palabra}": el juego muestra qué hizo el movimiento, no lo califica (N §2.2).`));
    }
  }
  for (const palabra of objetos.global.jerga) {
    // Con el plural: "dos capas de la misma operación" es la misma jerga que "capa".
    if (new RegExp(`\\b${fold(palabra)}s?\\b`).test(plano)) {
      out.push(hit(entry, "jerga", "aviso", `"${palabra}" es vocabulario del repositorio, no del juego.`));
    }
  }

  // La unión de lo que dibujan todas las escenas del nodo, porque un objeto
  // prohibido en una puede ser justo lo que dibuja la otra: en el nodo de la
  // división conviven el cofre, la banda y las baldosas.
  const dibuja = new Set<string>();
  const prohibido = new Set<string>();
  for (const nombre of entry.scenes) {
    const escena = objetos.escenas[nombre];
    if (!escena) continue;
    for (const palabra of escena.dibuja) dibuja.add(fold(palabra));
    for (const palabra of escena.prohibido) prohibido.add(palabra);
  }
  for (const palabra of prohibido) {
    if (dibuja.has(fold(palabra))) continue;
    if (plano.includes(fold(palabra))) {
      out.push(hit(entry, "objeto_ajeno", "error", `Nombra "${palabra}", y ${entry.scenes.join(" + ")} dibujan: ${[...dibuja].join(", ")}.`));
    }
  }

  // El paso que pide un gesto se lee con el dedo en el aire: tiene que ser
  // corto. El que explica lo que acaba de pasar se lee con el tablero quieto,
  // y ahí veintitrés textos buenos chocaban contra un tope que no era suyo.
  const paso = /\.coach\.([a-zA-Z]+)$/.exec(entry.key)?.[1] ?? "";
  // `look` describe el tablero antes de pedir nada: también se lee quieto.
  const explica = ["reveal", "recall", "hold", "again", "done", "look"].includes(paso);
  const tope = entry.role === "objetivo" ? 120 : entry.role === "paso_de_guia" ? (explica ? 140 : 120) : 200;
  if (entry.text.length > tope) {
    out.push(hit(entry, "largo", "aviso", `${entry.text.length} caracteres para un ${explica ? "paso que explica" : entry.role}; el tope es ${tope}.`));
  }
  return out;
}

/** Todo el corpus, más lo que sólo se ve mirando el conjunto. */
export function runRules(corpus: readonly Entry[], objetos: Objetos): readonly Finding[] {
  const out: Finding[] = [];
  for (const entry of corpus) out.push(...checkEntry(entry, objetos));

  // Dos claves con el mismo texto suelen ser un copiar y pegar que quedó a medias.
  const porTexto = new Map<string, Entry[]>();
  for (const entry of corpus) {
    if (entry.role === "llave_titulo" || entry.role === "objetivo" || entry.role === "por_que") {
      const lista = porTexto.get(entry.text) ?? [];
      lista.push(entry);
      porTexto.set(entry.text, lista);
    }
  }
  for (const [texto, entradas] of porTexto) {
    if (entradas.length < 2) continue;
    const primera = entradas[0];
    if (!primera) continue;
    out.push(hit(primera, "duplicado", "aviso", `El mismo texto está en ${entradas.length} claves: ${entradas.map((e) => e.key).join(", ")}.`));
    void texto;
  }
  return out;
}
