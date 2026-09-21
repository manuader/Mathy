/**
 * La política: qué se hace con una probabilidad.
 *
 * El modelo contesta con cuánta certeza; decidir si eso frena un merge es
 * nuestro, no suyo. Un tipo de salida garantiza la forma de la respuesta, no
 * que sea verdad. Por eso los umbrales viven acá, separados de quien pregunta,
 * y son distintos según lo que cuesta equivocarse: nombrar mal un objeto del
 * tablero se corrige en diez segundos, así que se puede reportar con menos
 * certeza que la claridad de un texto, que es opinable.
 */

import type { Answers, Decider, Entry, Finding, Noul, Choice, Score } from "./types.ts";
import type { Objetos } from "./corpus.ts";
import { PREGUNTAS, estadoDe } from "./preguntas.ts";

/** Arriba de esto es un error de CI; entre medio, un aviso para leer. */
export const ERROR = 0.8;
export const AVISO = 0.5;

const severidad = (p: number): Finding["severity"] | null => (p > ERROR ? "error" : p > AVISO ? "aviso" : null);

const hallazgo = (entry: Entry, rule: string, p: number, why: string): Finding | null => {
  const sev = severidad(p);
  if (!sev) return null;
  return { key: entry.key, text: entry.text, rule, severity: sev, why, p, source: "jev" };
};

/** El papel declarado y el que el texto parece tener, en el mismo vocabulario. */
const ESPERADO: Partial<Record<Entry["role"], string>> = {
  objetivo: "objetivo",
  paso_de_guia: "paso_de_guia",
  llave_titulo: "llave",
  llave_cuerpo: "llave",
};

export function juzgar(entry: Entry, answers: Answers): readonly Finding[] {
  const out: (Finding | null)[] = [];
  const voseo = answers["esta_en_voseo"] as Noul | undefined;
  const objetos = answers["nombra_un_objeto_con_otro_nombre"] as Noul | undefined;
  const califica = answers["dice_incorrecto_o_equivalente"] as Noul | undefined;
  const tipo = answers["tipo_de_mensaje"] as Choice | undefined;
  const claridad = answers["claridad_para_un_chico_de_ocho_anios"] as Score | undefined;

  if (voseo && !voseo.value) out.push(hallazgo(entry, "voseo", voseo.p, "No parece escrito en voseo."));
  if (objetos && objetos.value) {
    out.push(hallazgo(entry, "objeto_ajeno", objetos.p, "Nombra algo que la escena no dibuja con ese nombre."));
  }
  if (califica && califica.value) {
    out.push(hallazgo(entry, "nunca_incorrecto", califica.p, "Califica el movimiento en vez de contar qué pasó (N §2.2)."));
  }
  // Un paso que se llama `reveal`, `recall` o `hold` explica lo que acaba de
  // pasar: leerlo como acierto no es un defecto, es su trabajo.
  const paso = /\.coach\.([a-zA-Z]+)$/.exec(entry.key)?.[1] ?? "";
  const explica = ["reveal", "recall", "hold", "again", "done"].includes(paso);
  const esperado = explica ? undefined : ESPERADO[entry.role];
  if (tipo && esperado && tipo.value !== esperado) {
    // Un papel distinto del declarado casi nunca es un error de ortografía: es
    // una guía que explica en vez de pedir, o un objetivo que ya da la respuesta.
    const f = hallazgo(entry, "papel_cambiado", tipo.p, `Está declarado como ${esperado} y se lee como ${tipo.value}.`);
    if (f) out.push({ ...f, severity: "aviso" });
  }
  // La claridad es opinable y se movía entre 0,5 y 0,75 tanto en textos buenos
  // como en malos: no sirve de puerta. Sólo avisa cuando el modelo dice, con
  // ganas, que no se entiende nada.
  if (claridad && claridad.value < 0.6 && claridad.p > ERROR) {
    out.push({ key: entry.key, text: entry.text, rule: "claridad", severity: "aviso", why: "Difícil de entender para quien recién empieza el concepto.", p: claridad.p, source: "jev" });
  }
  return out.filter((f): f is Finding => f !== null);
}

/** Una pasada del modelo sobre los textos que las reglas no condenaron ya. */
export async function runModelo(
  corpus: readonly Entry[],
  objetos: Objetos,
  decider: Decider,
  objetivoDe: (entry: Entry) => string,
): Promise<readonly Finding[]> {
  const out: Finding[] = [];
  for (const entry of corpus) {
    const answers = await decider.ask(estadoDe(entry, objetos, objetivoDe(entry)), PREGUNTAS);
    out.push(...juzgar(entry, answers));
  }
  return out;
}
