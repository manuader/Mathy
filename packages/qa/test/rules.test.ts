import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, buildCorpus, loadObjetos } from "../src/corpus.ts";
import { checkEntry, runRules } from "../src/rules.ts";
import type { Entry } from "../src/types.ts";

const objetos = loadObjetos();
const entry = (text: string, extra: Partial<Entry> = {}): Entry => ({
  key: "lesson.x.1.goal",
  text,
  node: "alg.fn.composition",
  level: 1,
  role: "objetivo",
  scene: "PipeScene",
  ...extra,
});
const rules = (text: string, extra: Partial<Entry> = {}): readonly string[] =>
  checkEntry(entry(text, extra), objetos).map((f) => f.rule);

test("una orden en voseo no es un hallazgo, y la misma en tuteo sí", () => {
  assert.deepEqual(rules("Arrastrá la gota hasta la máquina."), []);
  assert.deepEqual(rules("Arrastra la gota hasta la máquina."), ["voseo"]);
});

test("la tilde distingue fijate de fíjate, que era el falso positivo caro", () => {
  assert.deepEqual(rules("Fijate cuántas gotas salieron."), []);
  assert.deepEqual(rules("Fíjate cuántas gotas salieron."), ["voseo"]);
});

test("una palabra que puede ser sustantivo abre un aviso, no un error", () => {
  assert.deepEqual(rules("Marca distinta, caja distinta", { role: "llave_titulo" }), []);
  assert.deepEqual(rules("Marca la que salió."), ["voseo_dudoso"]);
});

test("nombrar un objeto que la escena no dibuja es un error", () => {
  assert.deepEqual(rules("Cada rueda estira lo que le llega."), ["objeto_ajeno"]);
  assert.deepEqual(rules("Cada máquina estira lo que le llega."), []);
});

test("el juego nunca dice que algo está incorrecto", () => {
  assert.deepEqual(rules("Eso es incorrecto."), ["nunca_incorrecto"]);
});

test("una clave sin texto se reporta sola y no arrastra otras reglas", () => {
  assert.deepEqual(rules("lesson.x.1.goal"), ["clave_sin_texto"]);
});

test("el corpus trae los textos de los 21 nodos y ninguno quedó sin resolver", async () => {
  const corpus = await buildCorpus();
  const nodos = new Set(corpus.map((e) => e.node));
  assert.equal(nodos.size, 21);
  assert.ok(corpus.length > 1000, `hay ${corpus.length} textos`);
  assert.deepEqual(corpus.filter((e) => e.text === e.key), []);
});

test("los textos del juego no tienen errores de las reglas locales", async () => {
  const corpus = await buildCorpus();
  const errores = runRules(corpus, objetos).filter((f) => f.severity === "error");
  assert.deepEqual(errores.map((f) => `${f.rule} ${f.key}`), []);
});

test("la escena de cada nodo es la que importa su actividad", () => {
  // Si alguien cambia la escena de una actividad, este test lo dice: el YAML es
  // dato de diseño y envejece solo si nadie lo mira.
  const dir = join(REPO, "apps/mathy/src/activities");
  const registro = readFileSync(join(dir, "index.tsx"), "utf8");
  const porNodo = new Map<string, string>();
  for (const [, node, comp] of registro.matchAll(/"([a-z]+\.[a-z]+\.[a-z_]+)":\s*([A-Za-z]+)/g)) {
    if (node && comp) porNodo.set(node, comp);
  }
  const archivos = readdirSync(dir).filter((f) => f.endsWith("Game.tsx"));
  const escenaDe = new Map<string, string>();
  for (const file of [...archivos, "../OneStepGame.tsx"]) {
    const src = readFileSync(join(dir, file), "utf8");
    const scene = /from "\.\.\/scenes\/([A-Za-z]+)\.tsx"/.exec(src)?.[1];
    if (scene) escenaDe.set(file.replace(/.*\//, "").replace("Game.tsx", ""), scene);
  }
  for (const [node, declarada] of Object.entries(objetos.nodos)) {
    const comp = porNodo.get(node);
    assert.ok(comp, `${node} no está en el registro de actividades`);
    const real = escenaDe.get(comp);
    if (!real) continue; // una actividad sin escena propia no tiene qué comparar
    assert.equal(declarada, real, `${node}: el YAML dice ${declarada} y la actividad usa ${real}`);
  }
});
