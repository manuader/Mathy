# U2 — Plan de construcción de la espina

Los conceptos de la espina, en olas de tres, hasta que todos sean jugables. Eran 44
cuando se escribió este plan; los siete que se ascendieron después llevan los números
45 a 47 y 51 a 54, y sus olas se agregan al final de la tabla.
Este documento es el contrato que sigue cada agente que construye un nodo, para
que los prompts sean cortos y las decisiones no se vuelvan a discutir.

## Por qué son trece escenas y no cuarenta y cuatro

Los nodos de la espina usan **trece mecánicas**, y el diseño ya exige que ninguna aparezca
en menos de tres áreas ([E0](../E-mecanicas/E0-catalogo.md)). El código tiene que
reflejar eso: una mecánica se construye una vez y se configura, y un nodo es su
lista de niveles más la configuración de una o dos mecánicas.

| Mecánica | Nodos de la espina que la usan |
|---|---|
| `gears_sequence` | 15 |
| `grid_stretch` | 15 |
| `tiles` | 13 |
| `chest_key` | 12 |
| `machine_pipe` | 10 |
| `ledger` | 9 |
| `slope_walker` | 9 |
| `construct` | 8 |
| `balance` | 7 |
| `network_routes` | 4 |
| `sorter` | 4 |
| `urn_dice` | 4 |
| `fill_accumulate` | 2 |

Un nodo que estrena mecánica paga la construcción; los que vienen después la
reusan. Por eso las olas están ordenadas para que las mecánicas caras aparezcan
temprano.

## Olas

Cada ola son tres nodos que no comparten archivos salvo los tres del registro.

| Ola | Nodos | Mecánicas que estrena |
|---|---|---|
| 1 | 1, 2 | `ledger`, `network_routes`, `sorter`, `gears_sequence`, `slope_walker` |
| 2 | 3, 4, 5 | `tiles`, `grid_stretch` |
| 3 | 6, 7, 8 | `urn_dice` |
| 4 | 9, 10, 11 | `machine_pipe` |
| 5 | 12, 14, 15 | — (el 13 ya está) |
| 6 | 16, 17, 18 | — |
| 7 | 19, 20, 21 | — |
| 8 | 22, 23, 24 | — |
| 9 | 25, 26, 27 | `construct` |
| 10 | 28, 29, 30 | `fill_accumulate` |
| 11 | 31, 32, 33 | — |
| 12 | 34, 35, 36 | — |
| 13 | 37, 38, 39 | — |
| 14 | 40, 41, 42 | — |
| 15 | 43, 44 | — |

## Contrato de un nodo

Lo que entrega quien construye un nodo, y nada más:

1. `packages/mechanics/src/<slug>.ts` — los niveles como datos y el generador
   determinista. `Level extends LevelBase`, `registerNode({...})` al final,
   `export const NODE = "<id del grafo>"`.
2. Tests en `packages/mechanics/test/` que describan comportamiento.
3. `apps/mathy/src/scenes/<Mecánica>Scene.tsx` si estrena mecánica; si no, usa
   la que ya existe y le pasa su configuración.
4. `apps/mathy/src/activities/<Nodo>Game.tsx`, envuelta en `ActivityShell` y
   midiendo con `useActivityViewport()`.
5. Tres líneas en los archivos compartidos: el `export *` de
   `packages/mechanics/src/index.ts`, la entrada de `ACTIVITIES` en
   `apps/mathy/src/activities/index.tsx`, y las claves de texto en
   `apps/mathy/src/i18n.ts`.

## Reglas que no se negocian

- **Un nivel cambia de capa o endurece parámetros, nunca las dos cosas.**
- **`literacy: none` hasta el nivel 3 del curriculum**: se juega sin leer.
  Instrucción por demostración, blancos grandes, tolerancia de drop generosa.
- **Modo retained**: árbol estable, se animan valores, nada se monta ni se
  desmonta durante una animación.
- **Presupuesto de ~300 elementos animados** y **un solo `<Canvas>` por
  pantalla**. Lo que se repite se agrupa en un `SkPath`.
- **Ningún texto visible dentro de `packages/`**: solo claves.
- **El error nunca dice "mal"**: el objeto se resiste y el juego muestra por qué.
- **Nada se da por bueno sin mirarlo en el navegador**, nivel por nivel.

## Deudas abiertas

Cosas que la construcción por olas deja atrás a propósito, para no bloquear un
nodo con una refactorización de otro. Se pagan al cerrar la ola que las junta.

- **`PathScene` y `TrackScene` son la misma mecánica.** Las dos dibujan la pista
  y la manivela de `gears_sequence`; la segunda agrega tope, libro, flechas y
  renglón. Unificar en una escena parametrizada: pista y manivela como base,
  el resto como capas opcionales. Quince nodos de la espina usan esta mecánica,
  así que la deuda se paga sola.
- ~~**`gears_sequence` está dibujada tres veces**~~ — **pagada**. `PathScene` y
  `ElevatorScene` se borraron; `TrackScene` es ahora la escena de la mecánica y la usan
  los nodos 2, 3 y 7. El código entró en `a16c222` sin que el mensaje lo diga, porque un
  `git add -A` mío lo arrastró junto al nodo 10.

  Lo que dejó como método, y vale para las deudas que siguen: **no se pudo copiar el
  patrón de `ChestScene`**. Ahí se pudo ensanchar a formas estructurales porque el tipo
  del nodo 4 ya las cumplía; acá los tres nodos le llaman distinto a la misma cosa
  (`length`/`slots`, `tiles`/`chips`, `flag`/`target`) y ninguno cumple la forma de los
  otros dos, así que "no tocar el llamador" no estaba disponible. Cada actividad arma su
  configuración, como en `TilesScene`.

  Y **cómo se verificó**: dos oráculos deterministas contra el build anterior, 21 niveles
  por 10 semillas por varios tamaños de lienzo. 14450 comparaciones de layout campo por
  campo y 14352 de órdenes de dibujo, sin una diferencia. Un oráculo encontró un bug que
  la refactorización había introducido y que nadie habría visto mirando: al caminante del
  nodo 7 le faltaba el segundo trazo de brazos. Para una refactorización que no debe
  cambiar nada, un oráculo A/B es más fuerte que veintiuna capturas.
- **`chest_key` vive adentro de `BalanceScene`** (nodo 13) y también en
  `ChestScene` (nodo 4). Doce nodos la usan: hay que sacarla a su propia escena.
- **`onLayout` devuelve `{x: 0, y: 0}`** para algunas vistas en React Native Web.
  El nodo 3 lo evitó calculando el punto de drop con el desplazamiento del
  gesto. Hay que revisar si el blanco de drop del nodo 2 quedó corrido.
- **Un worklet captura el callback del render en que se armó el gesto.** Rearmar
  el gesto en cada cambio de estado no alcanza: la decisión tiene que viajar en
  un `SharedValue` o en una referencia. Lo pisaron los nodos 1 y 3.
- **No hay capa de audio.** El "tic" que varios minijuegos piden se reemplaza
  por un destello. [Q](../Q-edad-universal.md) exige que el juego funcione con
  el sonido apagado, así que la deuda no bloquea, pero está.

## Estado

| Ola | Estado |
|---|---|
| 1 | en curso |
| 2–15 | pendiente |
