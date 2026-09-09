import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ProgressStore,
  type Event,
  emptyProgress,
  fold,
  memoryStorage,
  mergeEvents,
  unlockedLevel,
} from "../src/index.ts";

const NODE = "alg.eq.one_step";
const attempt = (at: number, correct: boolean, extra: Partial<Extract<Event, { kind: "attempt" }>> = {}): Event => ({
  kind: "attempt", at, node: NODE, level: 1, evidence: "manipulate", correct, latency: 4000, ...extra,
});

test("sin eventos no hay progreso, y el jugador entra al nivel 1", () => {
  const p = fold([]);
  assert.deepEqual(p, emptyProgress());
  assert.equal(unlockedLevel(p, NODE), 1);
});

test("terminar un nivel abre el siguiente", () => {
  const p = fold([{ kind: "levelDone", at: 1, node: NODE, level: 1 }]);
  assert.equal(unlockedLevel(p, NODE), 2);
});

test("terminar un nivel viejo no retrocede el progreso", () => {
  const p = fold([
    { kind: "levelDone", at: 1, node: NODE, level: 3 },
    { kind: "levelDone", at: 2, node: NODE, level: 1 },
  ]);
  assert.equal(p.levelsDone[NODE], 3);
});

test("los intentos se cuentan por verbo de evidencia", () => {
  const p = fold([
    attempt(1, true),
    attempt(2, false),
    attempt(3, true, { evidence: "apply" }),
  ]);
  assert.deepEqual(p.tally[NODE]!["manipulate"], { ok: 1, total: 2 });
  assert.deepEqual(p.tally[NODE]!["apply"], { ok: 1, total: 1 });
});

test("los errores catalogados se cuentan, porque son datos y no fallas", () => {
  const p = fold([
    attempt(1, false, { misconception: "wrong_inverse_choice" }),
    attempt(2, false, { misconception: "wrong_inverse_choice" }),
    attempt(3, false, { misconception: "sign_flip_on_move" }),
  ]);
  assert.equal(p.misconceptions["wrong_inverse_choice"], 2);
  assert.equal(p.misconceptions["sign_flip_on_move"], 1);
});

test("las capas vistas no se repiten: son las que agregan a la cheatsheet", () => {
  const p = fold([
    { kind: "sawLayer", at: 1, node: NODE, layer: "concrete" },
    { kind: "sawLayer", at: 2, node: NODE, layer: "concrete" },
    { kind: "sawLayer", at: 3, node: NODE, layer: "symbolic" },
  ]);
  assert.deepEqual(p.layersSeen[NODE], ["concrete", "symbolic"]);
});

test("el fold es determinista: los mismos eventos dan el mismo estado", () => {
  const evs: Event[] = [attempt(1, true), { kind: "levelDone", at: 2, node: NODE, level: 1 }];
  assert.deepEqual(fold(evs), fold([...evs]));
});

test("unir dos listas no duplica y respeta el orden temporal", () => {
  const a: Event[] = [attempt(1, true), attempt(3, false)];
  const b: Event[] = [attempt(3, false), attempt(2, true)];
  const m = mergeEvents(a, b);
  assert.equal(m.length, 3, "el evento repetido no se duplica");
  assert.deepEqual(m.map((e) => e.at), [1, 2, 3]);
});

test("el progreso sobrevive a recargar", async () => {
  const storage = memoryStorage();
  const s1 = new ProgressStore(storage);
  await s1.load();
  await s1.append({ kind: "levelDone", at: 10, node: NODE, level: 2 });

  const s2 = new ProgressStore(storage);
  const p = await s2.load();
  assert.equal(unlockedLevel(p, NODE), 3, "otro arranque tiene que ver lo mismo");
});

test("un registro corrupto deja jugar en vez de romper", async () => {
  const storage = memoryStorage();
  await storage.write("mathy.events.v1", "{ esto no es json válido");
  const p = await new ProgressStore(storage).load();
  assert.deepEqual(p, emptyProgress());
});

test("reiniciar borra el progreso", async () => {
  const s = new ProgressStore(memoryStorage());
  await s.append({ kind: "levelDone", at: 1, node: NODE, level: 4 });
  const p = await s.reset();
  assert.equal(unlockedLevel(p, NODE), 1);
});
