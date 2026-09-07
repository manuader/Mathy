# El viaje de dos tramos (`arith.add.displacement`)

Minijuego del nodo 3 de la espina, "Sumar es avanzar en la pista". Mecánica principal `gears_sequence`, secundaria `ledger`; analogías `number_line_walk` y `walker_forward_and_back`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/03-arith.add.displacement.md): un concepto, cuatro dificultades reales (los dos números no hacen lo mismo, avanzar sin contar, encadenar tramos, no leer el igual como botón), dos analogías que se retiran en capas distintas, un gesto (soltar la ficha sobre la manivela y girar), cinco morphs hasta `3 + 2 = 5`, la flecha sobre la recta como visualización dominante. Acá se fija cómo se juega.

## Analogía

La pista del nodo 2, con el caminante en una piedra y la bandera lejos. El agua subió y tapó las piedras del medio: no se puede ir mirando dónde se pisa. Abajo, la manivela con un tope regulable y un cajón de fichas con numerales. Al costado, un libro de cuentas con las filas vacías.

Mapa objeto → concepto: piedra donde está el caminante → primer número; ficha en la manivela → segundo número; tramo saltado de un tirón → desplazamiento; piedra de llegada → suma; fila del libro → un tramo anotado; fila de total → el viaje entero; intercambiar las filas → conmutatividad; tope sin dientes → sumar cero.

`number_line_walk` aporta el soporte graduado y se retira en `visual`; `walker_forward_and_back` aporta el tramo, la conmutatividad de los dos saltos y el conteo salteado, y se queda hasta `symbolic`. `ledger` no trae analogía nueva: trae el libro del nodo 1 para anotar y comprobar, nunca para definir. Puntos de ruptura: `position_between_stones` (pararse en el agua) y `walking_past_start` (volver más allá de la orilla), ninguno tocado acá ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la pista a lo ancho, el caminante sobre su piedra, la bandera a la derecha, la manivela abajo al centro, el cajón de fichas a la izquierda y el libro de cuentas a la derecha. Gestos: `drag`, `scrub` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). La zona de drop de la manivela es la manivela entera.

- **Soltar una ficha sobre la manivela.** El tope se ajusta y se iluminan tantos dientes como dice la ficha. En el libro se abre una fila con esas marcas. Un solo gesto hace las tres cosas.
- **Girar con ficha puesta.** El caminante salta el tramo completo de un tirón, con una estela que deja ver por qué piedras pasó sin pisarlas. La fila del libro se cierra.
- **Girar sin ficha.** La manivela avanza de a un diente, como en el nodo 2. Llega igual, más lento: es válido pero inútil, y recibe un empujón suave (el cajón de fichas late), nunca una explicación.
- **Girar al revés.** El caminante vuelve. Se puede deshacer cualquier viaje; el estado nunca se borra. Esa reversibilidad es lo que impide que la ficha de llegada se lea como un botón.
- **Poner una segunda ficha.** Desde el nivel 3 hay dos fichas y el jugador elige el orden. El libro anota dos filas.
- **Toque sostenido sobre el libro.** Las dos filas se intercambian y el caminante rehace el viaje al revés, tramo por tramo. Cae en la misma piedra. Es el gesto de la conmutatividad y nadie lo nombra.
- **Arrastrar una flecha por la recta.** Desde `visual`: la flecha se despega de su tramo y conserva el largo en cualquier parte de la recta. Es la comprobación de que un número puede ser un movimiento.
- **Tocar la ficha de llegada.** Devuelve la recta como fantasma, con el caminante en su piedra, cuando el renglón ya está solo.

## Invariante matemático

Dos invariantes, uno por mecánica.

`same_step_every_turn` (`gears_sequence`): todos los dientes miden lo mismo, así que un tramo mide lo mismo empiece donde empiece. Se ve confirmarse al arrastrar la flecha por la recta: el largo no cambia. Se ve romperse solo en el distractor de `explain` donde el paso se estira.

`count_preserved_under_regrouping` (`ledger`): el total del libro no cambia si las filas se reordenan ni si se agrupan de otra manera. Se ve confirmarse en el toque sostenido que intercambia las filas y deja al caminante en la misma piedra. Se ve romperse cuando el jugador cuenta dos veces la piedra donde se unen los dos tramos: el juego dibuja las dos flechas encadenadas con la unión iluminada una sola vez.

Un movimiento válido pero inútil (avanzar y volver al mismo lugar, poner una ficha de cero, girar de a un diente) no rompe nada: el juego lo ejecuta, la piedra de llegada es la que corresponde, y si se repite hay empujón suave.

## Representación visual

Primitiva dominante `displace` ([H](../H-progresion-abstraccion.md)).

- `real`: el agua que sube, alguien pone una tabla, el caminante la cruza de un tirón y cae bien. Solo se mira.
- `intuition`: la escena detenida antes de la caída; tres desenlaces dibujados (la piedra correcta, una menos por contar la de partida, una más por contar la de llegada) y después el real. Una segunda escena con dos tablas en cualquier orden.
- `concrete`: la manivela con tope, las fichas, la estela del salto, el libro con sus filas. Los numerales son dibujos del nodo 1.
- `visual`: la recta con marcas, el punto grueso, y la flecha con cola y punta que abarca tantas marcas como pasos. Dos flechas encadenadas punta con cola, y la del viaje entero arriba, del mismo largo que las dos juntas. El libro se estiliza en filas de marcas alineadas con la recta.
- `symbolic`: fichas y el `+` sobre la recta atenuada, después el renglón solo con la ficha de llegada.

No hay flechas hacia atrás ni marcas a la izquierda del `0`: eso es el nodo 4 y el nodo 7.

## Transición simbólica

Cinco pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Estela → flecha: al completar un salto de más de un paso en `concrete`, la estela se cierra en una flecha con cola y punta sobre las mismas marcas, arrastrable y de largo fijo.
2. Flecha → ficha con numeral: al soltar la flecha sobre el libro, se contrae en una ficha que queda en la fila; mantenerla tocada devuelve la flecha como fantasma.
3. Dos fichas encadenadas → el signo `+`: al hacer dos tramos y después intercambiar las filas para ver que llega igual, las fichas se acercan y entre ellas aparece el signo, formado por el cruce de la punta de la primera flecha con la cola de la segunda.
4. Piedra de llegada → ficha de llegada: el numeral de la piedra donde cayó el caminante se despega de la marca, viaja al final de la expresión y queda detrás de un doble trazo.
5. Recta → renglón: al siguiente viaje válido la recta se atenúa y queda `3 + 2 = 5` solo. Tocar la ficha de llegada devuelve la recta como fantasma.

## Concepto formal

Lo que queda al final, como voz sobre la pista y sin texto escrito porque el nodo es `literacy: none`: sumar dos números es empezar en el primero y avanzar tantos pasos como dice el segundo; la piedra de llegada es la suma; el orden de los dos números no cambia la piedra de llegada. Casos verificados sobre el objeto: sumar `0` no mueve al caminante, porque el tope no tiene dientes; sumar `1` es el paso del nodo 2; tres tramos se agrupan de cualquier manera, porque la pista recuerda pasos y no tirones.

El símbolo nuevo es el `+`, y el problema que lo hace necesario es el encargo a distancia: dos fichas sueltas son ambiguas, y el `+` dice que los dos tramos se hacen uno detrás del otro sobre el mismo camino. El doble trazo de la ficha de llegada todavía no es el igual como invariante: dice dónde terminó el viaje, y se puede deshacer girando al revés. Su significado completo nace en `prealg.eq.balance`. Las dos entradas de cheatsheet, `cs.arith.add_as_step_forward` y `cs.arith.add_order_irrelevant`, quedan como imagen con voz.

## Generalización

La pista se retira en `visual`, cuando la flecha se arrastra y conserva su largo; el tramo se queda hasta `symbolic`, porque es lo que sostiene el `+` sin recta y porque el nodo 4 lo necesita entero para darlo vuelta.

Variantes sin ayuda visual: números mayores que la pista visible; sumar `0` y sumar `1`; tres tramos encadenados; el sumando faltante, `3 + □ = 5`, donde se conocen la partida y la llegada. Después, tramos arbitrarios: una fila de dibujos distintos sin numerales, una ficha con tres puntos, y la pregunta de dónde cae el caminante. Cuando el jugador anticipa la llegada sin girar, encadena en cualquier orden y resuelve el sumando faltante sin tratar la ficha de llegada como botón, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): el ejemplo de frutas empieza con montones y un total, y su etapa inicial supone este nodo entero. El ejemplo de cofres empieza mucho después; el sumando faltante de este nodo es lo que hace posible su primer cofre.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Un tirón.** `concrete`, `manipulate`. Una ficha, tramos de 2 a 4, pista corta. La estela hace visible el salto.
2. **Adivinar antes de girar.** `concrete`, `recognize`. Mismos parámetros; el ítem es tocar la piedra de llegada antes de que la manivela gire.
3. **Dos tramos y el libro.** `concrete`, `manipulate` y `explain`. Aparecen la segunda ficha y el intercambio de filas. La animación que miente es la de la ficha de llegada que empuja al caminante.
4. **La flecha.** `visual`, `manipulate` y `apply`. La pista se vuelve recta y el tramo se vuelve flecha arrastrable; dos flechas encadenadas y la del viaje entero arriba.
5. **El renglón.** `symbolic`, `apply`. Aparecen el `+` y la ficha de llegada; la recta se pide con un toque. Aparece `equals_as_operator`.
6. **Números grandes y el cero.** Parámetros: rango numérico mayor que la pista visible, tramos de `0` y de `1`, tres tramos encadenados.
7. **El tramo que falta.** Parámetros: sumando desconocido y pistas sin numerales, con dibujos arbitrarios. El teclado de fichas deja de ofrecer el resultado prearmado.

Qué endurece cada parámetro: el rango obliga a anticipar en vez de contar la estela; el cero rompe la lectura "sumar siempre mueve"; los tres tramos rompen "el resultado es una de las dos fichas"; el sumando desconocido invierte la dirección de la lectura y es lo que dispara la misconception del nodo; los dibujos arbitrarios separan la estructura de los numerales.

Desafíos de olimpíada: el nodo participará en los desafíos de aritmética de [S](../S-desafios/S0-desafios.md), aún no escritos, donde un viaje de dos tramos aparece como paso intermedio de un problema con datos ocultos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: el caminante en la piedra 4 y una ficha con `3`; tocar la piedra 7 antes de que la manivela gire. Distractores: la 6, la 8 y la 3.
- `explain`: dos animaciones sobre el mismo viaje; en una el caminante avanza y la ficha de llegada aparece cuando el paso termina, en la otra la ficha de llegada empuja al caminante como si fuera un botón. Tocar la segunda. El distractor elegido clasifica: es `equals_as_operator`.
- `manipulate`: caminante en el `0`, ficha con `5`; girar la manivela los cinco dientes y ver el libro anotar la fila.
- `apply`: fichas `3` y `2`; hacer los dos tramos en cualquier orden y después tocar la ficha `5`, la única que hace el mismo viaje de un solo giro. Cuatro instancias seguidas contra el tiempo objetivo del nodo.
- `generalize`: la pista sin dibujos y después solo fichas; arrastrar la ficha del resultado de `12 + 7` sin ver al caminante. Y una pista de dibujos arbitrarios con una ficha de tres puntos.
- `transfer`: en la grilla del tesoro de `linalg.vec.vector_as_displacement`, encadenar dos flechas punta con cola y tocar dónde termina el viaje. También en el dial de `geom.angle.turn_as_measure` y en la red de `graph.path.shortest_path`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `equals_as_operator`, patrón `replay_on_mechanic`. El jugador trata la ficha de llegada como un botón: frente a `3 + 2 = □ + 1` pone `5`, o toca la ficha esperando que ejecute. El catálogo declara el patrón sobre la mecánica `balance`, que en el nivel 1 no existe, así que corre sobre la pista: el juego congela, dibuja las flechas de cada lado hasta su piedra, muestra que caen en piedras distintas y deja hueca la flecha que falta. Voz: el prompt del locale, que habla de dos platos y llegará entero cuando exista la balanza; mientras el nodo se juegue sin platos, la voz hace la misma pregunta sobre las dos llegadas. El jugador completa la flecha hueca desde el estado real. Es la de mayor severidad del nodo y la única que clasifica.

Sin entrada en el catálogo, y por eso sin clasificar ni bloquear `ready`: contar la piedra de partida como un paso (heredado del nodo 2, distractor principal de `recognize`, se resuelve con el tic por despegue) y contar dos veces la piedra donde se unen los tramos (se resuelve dibujando las dos flechas con la unión iluminada una sola vez).

Los distractores de `explain` y las opciones de `recognize` se generan desde la regla `detect` de `equals_as_operator` y desde el desvío de una unidad de los dos errores no catalogados.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_step_forward_adds`, nativa. La rueda dentada gira el tope entero, el punto se desplaza sobre la recta y la flecha crece de la cola a la punta mientras un valor sube; gramática `displace`, con el largo de la flecha como lo que se conserva. Parametrizada por la piedra de partida y el tamaño del tramo, produce los ítems de `recognize`, la mecánica de `manipulate` y las dos animaciones de `explain`.
- `ledger_join_two_piles`, nativa. Dos filas de fichas que bajan a un renglón común mientras la tarjeta del total cuenta desde cero, alineadas con la recta; parametrizada por los dos sumandos, produce los ítems de `apply` y el intercambio de filas de la conmutatividad.
- Reusadas: `gear_one_step_one_number` (nodo 2), como fondo de los niveles 1 y 2 y como distractor del paso de a uno. Los numerales y el `+` los dibuja el runtime; el caminante, la piedra, la ficha y el libro son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_walk_sum`: `start` (piedra de partida, 0 en el nivel 1, de 0 a 9 después); `steps` (lista de tramos: uno hasta el nivel 2, dos desde el 3, hasta tres en el 6); `step_range` (de 2 a 4 en los niveles 1 a 3, de 1 a 9 en el 4 y 5, hasta 30 en el 6); `allow_zero_step` (falso hasta el nivel 5); `unknown` en {none, addend, result} (`none` hasta el nivel 6, `addend` en el 7); `seed`.
- `gen_crank`: `teeth` (dientes que gira de un tirón, igual al tramo); `direction` en {forward, backward}; `backstop` (verdadero: la manivela se traba en el `0`).
- `gen_track_skin`: `skin` en {stone, mark, arbitrary} (solo `stone` hasta el nivel 4, `mark` desde el 5, `arbitrary` en el 7); `numerals` (verdadero salvo en las instancias arbitrarias del nivel 7).

**Literacy soportada:** `none` en todos los niveles. Los numerales y el `+` son dibujos, no texto, y la definición existe solo como voz sobre la pista; en un perfil con lectura se agregan subtítulos, sin cambiar ningún ítem. El mínimo puede quedarse en `none` porque `explain` se resuelve entre animaciones y ninguna ficha lleva palabras.

**Instrucción por demostración:** la primera vez, una mano fantasma toma una ficha con tres puntos, la suelta sobre la manivela (el tope se ajusta, tres dientes se iluminan, el libro abre una fila) y gira; el caminante salta tres piedras con estela. La mano repite con una ficha de dos y desaparece; el cajón de fichas late. Se repite solo si el jugador se queda quieto. La demostración de girar de a un diente no se repite: es la del nodo 2. La del intercambio de filas (nivel 3) es nueva y se muestra una vez ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
