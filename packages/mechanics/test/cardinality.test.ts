import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CARDINALITY_LEVELS,
  cardinalityLevelByNumber,
  generateCardinality,
  NODE_CARDINALITY,
  nodeById,
  type CardinalityLevel,
  type CardinalityProblem,
} from "../src/index.ts";

const nivel = (n: number): CardinalityLevel => {
  const l = cardinalityLevelByNumber(n);
  assert.ok(l, `falta el nivel ${n}`);
  return l;
};

/** Recorre unas cuantas semillas de un nivel, para no afirmar sobre un solo caso. */
function porSemilla(l: CardinalityLevel, veces: number, f: (p: CardinalityProblem, s: number) => void): void {
  for (let s = 0; s < veces; s++) f(generateCardinality(l, s), s);
}

test("los seis niveles del diseño están, en orden y sin repetir", () => {
  assert.equal(CARDINALITY_LEVELS.length, 6);
  assert.deepEqual(CARDINALITY_LEVELS.map((l) => l.n), [1, 2, 3, 4, 5, 6]);
});

test("el nodo se registra como raíz de la espina y sin prerequisitos", () => {
  const spec = nodeById(NODE_CARDINALITY);
  assert.ok(spec, "el nodo no quedó registrado");
  assert.equal(spec.n, 1);
  assert.deepEqual(spec.prereqs, []);
  assert.equal(spec.levels.length, 6);
});

test("cada nivel cambia la capa o endurece parámetros, nunca las dos cosas", () => {
  for (let i = 1; i < CARDINALITY_LEVELS.length; i++) {
    const prev = CARDINALITY_LEVELS[i - 1]!;
    const cur = CARDINALITY_LEVELS[i]!;
    const cambioCapa = prev.layer !== cur.layer;
    const cambioParams = JSON.stringify(prev.params) !== JSON.stringify(cur.params);
    assert.ok(
      !(cambioCapa && cambioParams),
      `el nivel ${cur.n} cambia la capa y los parámetros a la vez`,
    );
  }
});

test("el nodo termina en visual: no llega a símbolos ni a definición", () => {
  for (const l of CARDINALITY_LEVELS) {
    assert.ok(
      l.layer === "concrete" || l.layer === "visual",
      `el nivel ${l.n} declara la capa ${l.layer}, que este nodo no tiene`,
    );
  }
  assert.equal(CARDINALITY_LEVELS[0]!.layer, "concrete");
  assert.equal(CARDINALITY_LEVELS.at(-1)!.layer, "visual");
});

test("el numeral no existe antes de que la tarjeta tenga que viajar", () => {
  // La regla de oro de H: el numeral nace del problema de llevar una cantidad a
  // un cuenco que no está en la mesa, y ese problema es el del nivel 4.
  for (const l of CARDINALITY_LEVELS) {
    if (l.n < 4) assert.notEqual(l.card, "numeral", `el nivel ${l.n} adelanta el numeral`);
    else assert.equal(l.card, "numeral", `el nivel ${l.n} perdió el numeral`);
  }
  assert.equal(CARDINALITY_LEVELS[0]!.card, "none", "el primer nivel compara sin tarjeta");
});

test("la fruta se retira recién en el último nivel", () => {
  for (const l of CARDINALITY_LEVELS) {
    if (l.n < 6) assert.deepEqual(l.params.skins, ["fruit"]);
    else assert.ok(l.params.skins.length > 1, "el último nivel cambia de piel");
  }
});

test("el tamaño distinto y el grosor de la barra llegan con la generalización", () => {
  for (const l of CARDINALITY_LEVELS) {
    const esperado = l.n === 6;
    assert.equal(l.params.sizeVariance, esperado, `nivel ${l.n}: tamaño variable`);
    assert.equal(l.params.barThickness, esperado, `nivel ${l.n}: grosor de barra`);
  }
});

test("desparramar y mezclar clases llegan juntos, cuando las cantidades crecen", () => {
  for (const l of CARDINALITY_LEVELS) {
    const duro = l.n >= 5;
    assert.equal(l.params.arrangements.includes("scattered"), duro, `nivel ${l.n}: desparramo`);
    assert.equal(l.params.kinds > 1, duro, `nivel ${l.n}: mezcla de clases`);
    assert.equal(l.params.count[1] > 4, duro, `nivel ${l.n}: cantidades mayores`);
  }
});

test("la misma semilla da el mismo problema", () => {
  for (const l of CARDINALITY_LEVELS) {
    const a = generateCardinality(l, 4242);
    const b = generateCardinality(l, 4242);
    assert.deepEqual(a, b, `el nivel ${l.n} no es reproducible`);
  }
});

test("semillas distintas dan problemas distintos", () => {
  const vistos = new Set<string>();
  porSemilla(nivel(5), 30, (p) => vistos.add(JSON.stringify(p)));
  assert.ok(vistos.size > 20, `poca variedad: solo ${vistos.size} problemas en 30 semillas`);
});

test("las cantidades generadas caen dentro del rango del nivel", () => {
  for (const l of CARDINALITY_LEVELS) {
    const [lo, hi] = l.params.count;
    porSemilla(l, 40, (p, s) => {
      for (const bowl of p.bowls) {
        // El cuenco de `fill` arranca vacío a propósito: el cero es el punto de partida.
        if (bowl.count === 0) continue;
        assert.ok(
          bowl.count >= lo && bowl.count <= hi,
          `nivel ${l.n} semilla ${s}: un cuenco con ${bowl.count} se sale de [${lo}, ${hi}]`,
        );
      }
    });
  }
});

test("la colección declara una clase y un tamaño por objeto", () => {
  for (const l of CARDINALITY_LEVELS) {
    porSemilla(l, 20, (p, s) => {
      for (const bowl of p.bowls) {
        assert.equal(bowl.kinds.length, bowl.count, `nivel ${l.n} semilla ${s}: faltan clases`);
        assert.equal(bowl.sizes.length, bowl.count, `nivel ${l.n} semilla ${s}: faltan tamaños`);
        for (const k of bowl.kinds) {
          assert.ok(k >= 0 && k < l.params.kinds, `nivel ${l.n}: clase ${k} fuera de rango`);
        }
      }
    });
  }
});

test("la piel y el grosor son los que el nivel permite", () => {
  for (const l of CARDINALITY_LEVELS) {
    porSemilla(l, 20, (p, s) => {
      for (const bowl of p.bowls) {
        assert.ok(l.params.skins.includes(bowl.skin), `nivel ${l.n} semilla ${s}: piel ${bowl.skin}`);
        assert.ok(l.params.arrangements.includes(bowl.arrangement));
        if (!l.params.barThickness) assert.equal(bowl.thickness, 1);
        if (!l.params.sizeVariance) assert.ok(bowl.sizes.every((x) => x === 1));
      }
    });
  }
});

test("emparejar deja el sobrante que el nivel declara, y de cualquiera de los dos lados", () => {
  const l = nivel(1);
  const lados = new Set<string>();
  porSemilla(l, 40, (p, s) => {
    assert.equal(p.bowls.length, 2, `nivel 1 semilla ${s}: hacen falta dos cuencos`);
    const [a, b] = [p.bowls[0]!.count, p.bowls[1]!.count];
    const d = Math.abs(a - b);
    assert.equal(d, p.target, `semilla ${s}: el sobrante declarado no es el real`);
    const [dLo, dHi] = l.params.difference;
    assert.ok(d >= dLo && d <= dHi, `semilla ${s}: sobran ${d}, fuera de [${dLo}, ${dHi}]`);
    lados.add(a > b ? "izq" : "der");
  });
  assert.equal(lados.size, 2, "el cuenco que sobra cae siempre del mismo lado");
});

test("el nivel 5 también empareja sin sobrante: dos cuencos pueden tener lo mismo", () => {
  const sinSobrante = (): boolean => {
    for (let s = 0; s < 60; s++) if (generateCardinality(nivel(5), s).target === 0) return true;
    return false;
  };
  assert.ok(sinSobrante(), "nunca sale un par exacto, que es la definición de mismo número");
});

test("llenar arranca de un cuenco vacío y la canasta siempre ofrece de más", () => {
  const l = nivel(2);
  porSemilla(l, 40, (p, s) => {
    assert.equal(p.bowls[0]!.count, 0, `semilla ${s}: el cuenco de llenar no arranca vacío`);
    assert.ok(p.target >= 1, `semilla ${s}: la tarjeta objetivo pide ${p.target}`);
    assert.ok(p.basket > p.target, `semilla ${s}: la canasta no deja pasarse, y tiene que dejar`);
    assert.equal(p.cards.length, 1, "llenar tiene una sola tarjeta, la objetivo");
    assert.equal(p.cards[0]!.value, p.target);
  });
});

test("la animación que miente es una de dos, y no siempre la misma", () => {
  const l = nivel(3);
  const posiciones = new Set<number>();
  porSemilla(l, 40, (p, s) => {
    assert.equal(p.cards.length, 2, `semilla ${s}: explain se elige entre dos animaciones`);
    assert.ok(p.lying === 0 || p.lying === 1);
    posiciones.add(p.lying);
    const mentirosa = p.cards[p.lying]!;
    const veraz = p.cards[1 - p.lying]!;
    assert.equal(mentirosa.correct, false, `semilla ${s}: la que miente dice la verdad`);
    assert.equal(veraz.correct, true);
    assert.equal(veraz.value, p.bowls[0]!.count, `semilla ${s}: la veraz no cuenta el cuenco`);
    assert.notEqual(mentirosa.value, veraz.value, `semilla ${s}: las dos tarjetas dicen lo mismo`);
  });
  assert.equal(posiciones.size, 2, "la mentira cae siempre en el mismo lado");
});

test("elegir tarjeta ofrece tres, una sola verdadera, todas distintas y posibles", () => {
  for (const n of [4, 6]) {
    const l = nivel(n);
    porSemilla(l, 40, (p, s) => {
      assert.equal(p.cards.length, 3, `nivel ${n} semilla ${s}: tienen que ser tres tarjetas`);
      assert.equal(p.cards.filter((c) => c.correct).length, 1);
      assert.equal(p.cards.find((c) => c.correct)!.value, p.bowls[0]!.count);
      const valores = p.cards.map((c) => c.value);
      assert.equal(new Set(valores).size, 3, `nivel ${n} semilla ${s}: hay tarjetas repetidas`);
      // El cuenco vacío no es de este nodo: ninguna tarjeta puede decir cero.
      assert.ok(valores.every((v) => v >= 1), `nivel ${n} semilla ${s}: una tarjeta dice ${valores}`);
    });
  }
});

test("las tarjetas que no son son contar de más o de menos, no números al azar", () => {
  const catalogo = new Set(["miscount_by_one", "miscount_by_two", "regrouping_changes_count"]);
  for (const l of CARDINALITY_LEVELS) {
    porSemilla(l, 30, (p, s) => {
      for (const c of p.cards) {
        if (c.correct) {
          assert.equal(c.lure, undefined, `nivel ${l.n} semilla ${s}: la verdadera tiene señuelo`);
          continue;
        }
        assert.ok(c.lure, `nivel ${l.n} semilla ${s}: la tarjeta ${c.value} no dice qué error es`);
        assert.ok(catalogo.has(c.lure), `nivel ${l.n}: señuelo desconocido ${c.lure}`);
      }
    });
  }
});

test("el señuelo nombra la distancia real al número verdadero", () => {
  for (const n of [4, 6]) {
    porSemilla(nivel(n), 30, (p, s) => {
      const bueno = p.cards.find((c) => c.correct)!.value;
      for (const c of p.cards.filter((c) => !c.correct)) {
        const d = Math.abs(c.value - bueno);
        const esperado = d === 1 ? "miscount_by_one" : "miscount_by_two";
        assert.equal(c.lure, esperado, `nivel ${n} semilla ${s}: ${c.value} contra ${bueno}`);
      }
    });
  }
});

test("el nivel 4 solo se aleja de a uno; desde el 5 también de a dos", () => {
  const distancias = (n: number): Set<number> => {
    const out = new Set<number>();
    porSemilla(nivel(n), 40, (p) => {
      const bueno = p.cards.find((c) => c.correct)!.value;
      for (const c of p.cards) if (!c.correct) out.add(Math.abs(c.value - bueno));
    });
    return out;
  };
  assert.deepEqual([...distancias(4)].sort(), [1], "el nivel 4 confunde solo de a uno");
  assert.ok(distancias(6).has(2), "desde el 5 la tarjeta se aleja también de a dos");
});
