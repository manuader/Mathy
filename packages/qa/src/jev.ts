/**
 * El decisor que pregunta a Jev.
 *
 * Es la única parte del repositorio que sabe que TypeSafe existe: el resto
 * habla con el puerto `Decider`. Si mañana hay que cambiar de proveedor o
 * volver a un LLM con salida estructurada, se reescribe este archivo y nada más.
 *
 * Tres cuidados, y los tres vienen del plan:
 * - sin `TYPESAFE_API_KEY` no falla: avisa y deja que el linter corra con las
 *   reglas, así nadie queda bloqueado por no tener la clave;
 * - cachea por hash del estado y de las preguntas, para no pagar dos veces el
 *   mismo texto en cada corrida de CI;
 * - tiene tope de llamadas: si se pasa, corta en vez de gastar.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { REPO } from "./corpus.ts";
import type { Answers, Decider, Question, QuestionSet } from "./types.ts";

const CACHE = join(REPO, "packages/qa/.cache");

/** Las preguntas, en la forma que pide el SDK. */
function alSdk(questions: QuestionSet): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, q] of Object.entries(questions)) {
    out[name] = traducir(q);
  }
  return out;
}

function traducir(q: Question): Record<string, unknown> {
  switch (q.kind) {
    case "noul":
      return { type: "noul", instructions: q.instructions };
    case "choice":
      return { type: "choice", instructions: q.instructions, criteria: q.options };
    case "score":
      return { type: "score", instructions: q.instructions, criteria: q.levels };
  }
}

/** La respuesta del SDK, en la forma del puerto. */
function delSdk(raw: Readonly<Record<string, unknown>>): Answers {
  const out: Record<string, Answers[string]> = {};
  for (const [name, answer] of Object.entries(raw)) {
    const a = answer as {
      type: string;
      noul?: number;
      choice?: string;
      score?: number;
      confidence?: number;
      probabilities?: Record<string, number>;
    };
    if (a.type === "noul") {
      const p = a.noul ?? 0;
      // Un Noul da la probabilidad del sí; la certeza es cuán lejos está de 0.5.
      out[name] = { value: p >= 0.5, p: p >= 0.5 ? p : 1 - p };
    } else if (a.type === "choice") {
      const value = a.choice ?? "";
      out[name] = { value, p: a.probabilities?.[value] ?? a.confidence ?? 0 };
    } else {
      out[name] = { value: a.score ?? 0, p: a.confidence ?? 0 };
    }
  }
  return out;
}

export interface JevOptions {
  /** Cuántas consultas como mucho en esta corrida. Pasado el tope, corta. */
  readonly maxCalls: number;
}

export function jevDecider(options: JevOptions): Decider & { calls: () => number; spent: () => number } {
  const client = new TypeSafeClient();
  let calls = 0;
  let tokens = 0;
  mkdirSync(CACHE, { recursive: true });

  return {
    name: "jev",
    calls: () => calls,
    spent: () => tokens,
    async ask(state, questions) {
      const huella = createHash("sha256")
        .update(JSON.stringify({ state, questions }))
        .digest("hex");
      const archivo = join(CACHE, `${huella}.json`);
      try {
        return JSON.parse(readFileSync(archivo, "utf8")) as Answers;
      } catch {
        // Sin caché: se pregunta.
      }
      if (calls >= options.maxCalls) throw new Error(`Tope de ${options.maxCalls} consultas alcanzado.`);
      calls += 1;
      const result = await client.systemOne({
        state: state as Record<string, never>,
        questions: alSdk(questions) as never,
      });
      tokens += result.usage.input_tokens + result.usage.output_tokens;
      const answers = delSdk(result.answers as Readonly<Record<string, unknown>>);
      writeFileSync(archivo, JSON.stringify(answers));
      return answers;
    },
  };
}

/** Si no hay clave, el linter sigue con las reglas en vez de fallar. */
export const hayClave = (): boolean => (process.env["TYPESAFE_API_KEY"] ?? "").length > 0;
