# Primero las cajas, después la mano (`prob.cond.conditional_and_independence`)

Minijuego del nodo 35 de la espina, "Condicional e independencia". Mecánica principal `urn_dice`, secundarias `sorter`, `tiles` y `network_routes`; analogía `sorted_bins_then_pick`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/35-prob.cond.conditional_and_independence.md): un concepto, tres dificultades reales (cambiar de total, distinguir la dirección, entender la independencia como igualdad y no como separación), una analogía de dos particiones sobre el mismo montón, un gesto central (tocar una caja y ver la barra del total acortarse), cinco pasos de desvanecimiento, la barra que se acorta como visualización dominante, retiro de las cajas en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un montón de bolitas de dos colores y dos tamaños sobre la mesa. Se reparten en dos cajas según un rasgo, por ejemplo el tamaño. Después se saca una bolita de una sola caja. Los colores de esa caja pueden ser distintos a los de toda la mesa.

Mapa objeto a concepto: ordenar por el primer rasgo es condicionar; sacar solo de una caja es la probabilidad condicional; una caja con la misma mezcla que la mesa es la independencia; una caja con mezcla distinta es la dependencia; enterarse de la caja y después adivinar la bolita es la actualización bayesiana, que se juega en el nodo siguiente.

La urna aporta el azar y la porción; el clasificador aporta el cambio de total, que una urna sola no puede mostrar porque una urna es un total. Punto de ruptura: `conditioning_on_an_empty_bin`. Si la caja quedó vacía, la mano entra y vuelve sin nada, y no hay porción que leer; por eso la analogía se retira en `formal`, donde aparece escrita la condición `P(B) > 0` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la mesa con las bolitas arriba; en el medio, las dos cajas y el selector de rasgo con dos íconos; abajo, la barra del total; al costado, la grilla de dos por dos y el árbol de extracciones. Gestos: `tap`, `hold`, `drag` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar un ícono de rasgo.** Las bolitas vuelan a las cajas según ese rasgo. Tocar el otro ícono las devuelve a la mesa y las reparte de nuevo con el otro criterio. Las cajas cambian; las bolitas, no. Este ida y vuelta es el gesto que define el nodo.
- **Tocar una caja.** La otra caja se apaga y se corre fuera del cuadro llevándose su parte de la barra. La barra del total se acorta hasta abarcar solo la caja tocada y se repinta con su mezcla. Tocar afuera devuelve la barra larga.
- **Mantener apretado sobre la caja elegida.** La corrida corre solo dentro de esa caja y la barra corta se estabiliza en su propia línea punteada, que casi nunca coincide con la de la mesa.
- **Arrastrar bolitas de una caja a otra.** Las dos líneas punteadas se mueven. Cuando coinciden, la caja brilla suave. Ese brillo es la independencia, sin nombre todavía.
- **Tocar una franja de la grilla.** Ilumina una fila o una columna entera y levanta esa franja como barra propia. Es la misma acción que tocar una caja, dicha en la vista de dos particiones a la vez.
- **Arrastrar una celda de la grilla al árbol.** Enciende el camino de esa celda y junta las porciones de sus dos ramas en un producto.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha sobre el ícono de una franja escribe `P(A|B)`; tocar la barra vertical pide la grilla fantasma; arrastrar la celda al costado escribe `P(A ∩ B)` medido sobre el total grande.

## Invariante matemático

Dos invariantes, uno por mecánica.

`proportion_stable_in_long_run` (urna), heredado del nodo 34, ahora aplicado dentro de la caja: la corrida restringida se acerca a la porción de la caja, no a la de la mesa. Se ve romperse cuando el jugador mueve bolitas en medio de la corrida: la línea punteada salta y la barra empieza a perseguir un blanco nuevo.

`every_object_exactly_one_bin` (clasificador): cada bolita va a una caja y a una sola, y las bolitas no cambian al entrar. Es la defensa contra creer que condicionar modifica el mundo. Se ve romperse en el momento en que alguien intenta poner una bolita en las dos cajas: la caja la rechaza y la bolita vuelve a la mesa.

De ese segundo invariante sale el resultado central: las porciones de las dos cajas, pesadas por el tamaño de cada caja, reconstruyen la porción de la mesa. La barra larga es la suma de las dos barras cortas escaladas, y eso se ve superponiéndolas.

Un movimiento válido pero inútil, como condicionar sobre toda la mesa, no rompe nada: la barra corta y la larga coinciden y la respuesta es la misma de antes. Empujón suave, no explicación.

## Representación visual

Primitiva dominante `random`, de apoyo `partition` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la mesa, el reparto y la mano. Sin barras ni contadores. El jugador elige qué mezcla cree que hay en la caja tapada y después se destapa.
- `concrete`: bolitas, cajas, selector de rasgo y barra del total. Nada escrito.
- `visual`: las cajas se aplanan en las filas y columnas de una grilla de dos por dos, con contadores en cada celda; la franja elegida se ilumina y se levanta como barra corta al lado de la larga, más pálida; el árbol se despliega al costado con las porciones en las ramas.
- `symbolic`: fichas de fracción, la barra vertical, `P(A|B)`, `P(A ∩ B)` y el producto a lo largo del camino; grilla y cajas a demanda como fantasma.
- `formal`: las tres frases con voz, la grilla al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cajas a franjas: al alternar dos veces entre los dos rasgos, las cajas se aplanan y se acomodan como filas y columnas de una grilla de dos por dos, con las bolitas apiladas y contadas en cada celda.
2. Franja a barra corta: al tocar una franja, se levanta de la grilla y se acuesta como barra propia; la barra larga queda atrás, más pálida. Las dos conviven un momento, y esa convivencia es lo que hace visible el cambio de denominador.
3. Barra corta a ficha: al tocar su parte pintada, se contrae en una ficha de fracción cuyo denominador viene de la franja y no del total.
4. Ficha a `P(A|B)`: al soltar la ficha sobre el ícono de la franja, ese ícono se encoge a la derecha de una barra vertical, el ícono del color entra a la izquierda, y la barra corta se para de canto y se convierte en la `P`.
5. Grilla a producto: al arrastrar una celda hacia el árbol, su camino se enciende y las porciones de sus dos ramas se juntan con un morph en `P(B) · P(A|B)`. Un hilo une la celda con el producto: son el mismo objeto medido de dos maneras.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la grilla: la probabilidad condicional es la porción de `A` medida dentro de `B` y no dentro del total; se calcula como la parte que cumple las dos cosas dividida por la parte que cumple la condición; dos eventos son independientes cuando condicionar no cambia nada.

Notación: `P(A|B) = P(A ∩ B) / P(B)` con `P(B) > 0`; `P(A ∩ B) = P(A) · P(B|A)`; y el caso particular `P(A ∩ B) = P(A) · P(B)` cuando hay independencia. Símbolo nuevo: la barra vertical, que nace porque en este nodo hay tres porciones de rojas sobre la mesa y todas se escribirían igual sin ella.

Casos especiales: la caja vacía no admite condición; condicionar sobre todo el total devuelve la probabilidad original; si los dos eventos no pueden pasar juntos, la celda está vacía y la condicional vale cero, que es lo más lejos de la independencia.

Entradas de cheatsheet que agrega el nodo: `cs.prob.conditional_definition`, `cs.prob.independence_product_rule` y `cs.prob.multiplication_rule`, las tres en `symbolic`.

## Generalización

Las cajas se retiran en `symbolic`, cuando el jugador escribe la condicional mirando solo la grilla. La grilla se queda hasta `formal`, porque sostiene la diferencia entre la celda y la franja, es decir, entre la intersección y la condición.

Variantes sin ayuda visual: rasgos que parten en tres y no en dos; condiciones compuestas del tipo "grande y azul"; cadenas de dos etapas donde la segunda depende de la primera, que es la urna sin reposición; independencia con tres eventos, donde de a pares alcanza y de a tres no; y porciones dadas sin bolitas que contar. Cuando el jugador decide en qué dirección va la barra vertical leyendo la pregunta y da un contraejemplo propio de independencia contra exclusión, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas.

1. **Repartir y sacar.** `concrete`, `manipulate`. Dos colores, dos tamaños, veinte bolitas, un solo rasgo de reparto. La barra se acorta al tocar una caja.
2. **Los dos rasgos.** `concrete`, `explain` y `manipulate`. Aparece el segundo ícono y el ida y vuelta entre particiones. Misma dificultad numérica.
3. **La grilla.** `visual`, `recognize`. Las cajas se aplanan en la grilla de dos por dos con contadores. Comparación de la barra corta con la larga.
4. **La caja que brilla.** `visual`, `manipulate`. Repartos que hay que ajustar hasta que las dos líneas punteadas coincidan. Aparece la independencia sin nombre.
5. **La barra vertical.** `symbolic` primera mitad, `manipulate` y `apply`. `P(A|B)` al lado de la grilla, en sincronía. Aparece `conditional_reversed`.
6. **El árbol y el producto.** `symbolic` segunda mitad, `apply`. Dos etapas, con y sin reposición; la regla del producto a lo largo del camino. Aparece `independent_means_disjoint`.
7. **Tres rasgos.** `formal` y `abstract`, `generalize`. Particiones en tres, condiciones compuestas, independencia de a pares que no es independencia de a tres.

Qué endurece cada parámetro: la cantidad de partes rompe la lectura "esta caja contra la otra"; la condición compuesta obliga a construir la franja antes de medirla; la falta de reposición hace que la segunda etapa tenga porciones distintas de la primera y es lo que da sentido a la regla del producto; los tres eventos rompen la idea de que la independencia se verifica de a pares.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo es requisito de cuatro. `ch.prob.at_least_one_by_complement`, de nivel `training`, donde el dato oculto es el producto a lo largo de la cadena de tiradas independientes. `ch.prob.shared_month_small_group`, también `training`, donde las opciones que quedan libres se achican en cada paso y la condicional es lo que lo hace visible. `ch.prob.three_doors_switch`, donde el dato oculto es lo que el presentador sabe y se descubre dibujando el árbol con la rama forzada. Y `ch.prob.expected_rolls_until_six`, de nivel `international`, compartido con el nodo 36. En los cuatro la cheatsheet está abierta de entrada y `cs.prob.independence_product_rule` aparece en tres de ellos.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: la mesa con 12 rojas de 20 y cuatro cajas de repartos distintos, cada una con su barra corta. Tocar la caja que quedó con la misma mezcla que la mesa.
- `explain`: sacar de una caja y después de la otra con el dedo apretado, y elegir entre tres animaciones: la barra se acorta y se repinta sobre la caja elegida; la barra se acorta pero mantiene la pintura de la mesa; las bolitas cambian de color al entrar en la caja. Tocar la que muestra lo que pasa. El distractor elegido clasifica.
- `manipulate`: veinte bolitas y dos cajas. Repartirlas para que saber la caja no diga nada sobre el color. Muchas soluciones, todas aceptadas; la caja brilla cuando las líneas coinciden.
- `apply`: sabiendo que la bolita salió de la caja redonda, arrastrar la marca sobre la barra corta indicando cuán probable es que sea roja. Después se corre la simulación dentro de esa caja. Se puntúa la cercanía.
- `generalize`: sobre la grilla, armar dos rasgos independientes y dos que no, y mostrar la diferencia. El juego no dice cuál es cuál: lo dice el brillo de las franjas.
- `transfer`: en el mapa de rutas de `prob.cond.markov_chain_walk`, elegir el cruce cuyo tramo siguiente no depende de por dónde se llegó. También `disc.logic.if_then_direction` (la implicación y su recíproca sobre el clasificador), `disc.set.membership_rule` (el universo achicado) y `csmath.info.entropy_as_surprise` (cuánta sorpresa queda después de saber algo).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `conditional_reversed`, patrón `two_paths_diverge` sobre la urna: el montón se parte en dos copias idénticas lado a lado. A la izquierda se restringe a las redondas y se cuentan las rojas; a la derecha se restringe a las rojas y se cuentan las redondas. Las dos barras cortas crecen en paralelo y quedan de largos distintos, con las mismas bolitas encendidas en el medio: la celda común es la misma, los denominadores no. Voz: "Mirar solo las redondas y contar rojas no es lo mismo que mirar solo las rojas y contar redondas. ¿Cuál pide la pregunta?". Es la de mayor severidad del nodo.
- `independent_means_disjoint`, patrón `replay_on_mechanic` sobre la urna: el juego congela, reproduce el reparto del jugador y muestra la grilla con la celda de las dos cosas a la vez. Esa celda tiene bolitas y se encienden una por una con el contador. Después la barra del producto crece al lado y llega a la misma altura. Voz: "Acá hay bolitas que son las dos cosas a la vez. ¿Cuántas son?". La grilla queda abierta y el jugador responde desde ese estado, que sigue siendo válido.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de estas dos, más las de `equiprobable_assumed` del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `sorter_scene_bins_then_pick`, nativa. El reparto en cajas, el apagado de la caja no elegida y la mano que saca de la que queda; parametrizada por las composiciones de las cajas y por cuál se elige.
- `urn_scene_restricted_urn`, nativa. La imagen central: la barra del total acortándose hasta abarcar solo la condición, con las dos barras conviviendo un momento; parametrizada por la composición y por la caja de la condición.
- `network_scene_tree_of_draws`, nativa. El árbol de dos etapas con las porciones en las ramas y el camino encendido; parametrizada por las porciones de cada etapa y por el camino resaltado. Sostiene la regla del producto.
- Reusada: `urn_scene_draw_and_tally` (nodo 34), para las corridas dentro de una caja.

Ninguna lleva texto rasterizado: contadores, fracciones y la barra vertical los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_two_trait_urn`: `trait_a` y `trait_b` con sus cantidades de valores (2 hasta el nivel 6, hasta 3 en el 7); `total_range` (16 a 40); `dependence` (grado de desvío entre la mezcla de la caja y la de la mesa, de cero, que es independencia exacta, a máximo); `seed`.
- `gen_condition_query`: arma la pregunta; `direction` en {a dado b, b dado a}; `compound` (condición sobre un rasgo o sobre dos); `asks` en {condicional, intersección, independiente o no}.
- `gen_draw_tree`: `stages` (2); `with_replacement`; `stage_probs` derivadas de la urna; `highlighted_path`; `seed`.
- `gen_independence_puzzle`: `n_events` (2 en los repartos con solución múltiple, 3 en el caso reservado al nivel 7); `multiple_solutions` (habilita los repartos con más de una solución, para el verbo `manipulate`); `pairwise_only` (eventos independientes de a pares pero no de a tres, solo en el nivel 7); `seed`.

**Literacy soportada:** de `icons` a `full_text`. Repartir, elegir caja y sacar se juegan sin leer, y la barra vertical se introduce como objeto gráfico, la franja parada de canto, antes de tener nombre. El mínimo es `icons` porque los contadores de las celdas llevan dígitos y la ficha de fracción tiene numerador y denominador. En `full_text` las tres frases de la definición se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma toca el ícono de tamaño, las bolitas vuelan a las dos cajas, la mano toca la caja redonda, la otra se apaga y se corre, la barra del total se acorta y se repinta, y la mano saca una bolita de la caja que queda. La escena vuelve al inicio y el selector de rasgo late. La demostración de sacar con el dedo apretado no se repite: es la del nodo 34 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, tolerancia de la predicción de `apply`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
