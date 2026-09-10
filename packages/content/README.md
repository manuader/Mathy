# @mathy/content

Las dos herramientas del jugador, compiladas desde los YAML de diseño: la
cheatsheet incremental y la calculadora evolutiva.

## Por qué existe

`docs/` es la fuente de verdad del diseño y nadie la edita desde el código. El
problema es que la app no puede leer esos YAML: son grandes, no están tipados y
necesitarían un parser de YAML en runtime. Así que se compilan antes, igual que
el atlas de `@mathy/glyphs`: un script en `tools/`, la salida en `src/`, la API
tipada en `src/index.ts`. En runtime solo hay `import` de JSON y ninguna
dependencia.

De qué sale cada cosa:

| salida                | entrada                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `src/cheatsheet.json` | `docs/R-cheatsheet/cheatsheet_entries.yaml` + `docs/locales/es/cheatsheet.yaml` |
| `src/calculator.json` | `docs/M-calculadora/calculator_ops.yaml` + `docs/locales/es/calculator.yaml`    |
| `src/scope.json`      | `docs/C-knowledge-graph/graph/*.yaml`                                           |

## Alcance

**Se compila solo lo que el juego tiene hoy.** El único minijuego es
`alg.eq.one_step`, así que el compilador toma ese nodo, cierra hacia atrás por
`prereqs` y se queda con lo que esos doce nodos declaran: **20 entradas de
cheatsheet en 6 temas y 11 operaciones en 2 tiers**, de las 527 entradas y las
118 operaciones que existen en el diseño. Cargar el resto sería pagar por
contenido que ninguna pantalla puede mostrar todavía.

Para ampliarlo, agregá el nodo a `ROOT_NODES` en `tools/compile.ts` y volvé a
compilar:

```sh
npm run compile --workspace @mathy/content
```

La clausura de prerequisitos se recalcula sola, así que sumar
`alg.eq.multi_step` trae también todo lo que ese nodo necesita. El compilador
falla si una entrada no tiene título y cuerpo en `es`, si un tema no tiene
nombre, o si una operación no tiene etiqueta y pista: un hueco de locale se nota
en el build y no en pantalla.

Lo que queda afuera de la salida cuando está fuera del alcance:

- Las entradas relacionadas (`related`) que no se compilaron. Volver a aparecer
  solas cuando su nodo entre es más barato que compilar un link roto.
- Los pares de un tier con una sola mitad adentro. La llave llega con su
  candado o no llega.
- Los tiers sin ninguna operación. No hay filas fantasma.

En cambio `unlockedBy` sí conserva la lista completa de nodos, incluidos los que
están fuera del alcance: la regla es `any_ready` y recortarla cambiaría cuándo
se abre una tecla.

## Uso

```ts
import {
  calculatorTiers,
  inverseOf,
  isOpUnlocked,
  opsOfTier,
  searchEntries,
  topicTree,
  unlockedEntries,
} from "@mathy/content";

const listas = new Set(["alg.eq.one_step", "prealg.eq.balance"]);

topicTree(unlockedEntries(listas)); // el árbol tema → entradas, ya podado
searchEntries(unlockedEntries(listas), "balanza"); // filtra por título, sin acentos
opsOfTier(calculatorTiers[0]!); // las teclas del tier, con cada par junto
isOpUnlocked(op, listas); // any_ready
inverseOf("op_mul"); // "op_div"
```

## Las dos reglas que el paquete hace cumplir

**Nada se revoca.** No hay función que quite una entrada ni que apague una
tecla. Un nodo que decae se dibuja con óxido, y eso es cosa de la app: acá el
desbloqueo es monótono y sin marcha atrás.

**Alcanza con un nodo.** Tanto una entrada como una operación pueden nacer de
varios nodos distintos, porque el mismo hecho se enseña por caminos distintos.
`isEntryUnlocked` e `isOpUnlocked` preguntan por cualquiera, nunca por todos.

## Verificación

```sh
npm test --workspace @mathy/content
npm run typecheck --workspace @mathy/content
```

Los tests corren sobre el JSON compilado, no sobre los YAML: chequean los enums
de R0 y M0, que todo tema y toda relacionada apunten a algo que existe, que la
cheatsheet empiece vacía, que la calculadora empiece en siluetas, y que cada
candado quede al lado de su llave en el orden del tier.
