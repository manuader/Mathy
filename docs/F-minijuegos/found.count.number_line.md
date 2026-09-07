# La pista de piedras (`found.count.number_line`)

Minijuego del nodo 2 de la espina, "Los números viven en fila". Mecánica principal `gears_sequence`, secundaria `slope_walker`; analogía `number_line_walk`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/02-found.count.number_line.md): un concepto, tres dificultades reales (el número como posición, el paso uniforme, el orden como estructura), una analogía que se retira en `visual`, un gesto que se puede hacer desde los dos lados —girar la manivela o arrastrar al caminante—, tres pasos de desvanecimiento que terminan en la ficha sobre la marca. Acá se fija cómo se juega.

## Analogía

Un arroyo cruzado por piedras planas, todas a un paso de distancia. Un caminante en la orilla, una bandera en una piedra y una manivela grande abajo.

Mapa objeto → concepto: piedra → entero; posición del caminante → valor; una vuelta de manivela → un paso, el incremento de una unidad; orden de las piedras → orden de los números; piedra de partida → cero; ficha apoyada sobre una piedra → el número que le corresponde; bandera → la posición pedida.

Punto de ruptura: `position_between_stones`. El caminante no puede quedarse en el agua, lo que es exacto para los enteros y falso apenas aparezcan las fracciones. Por eso la analogía se retira en `visual` y el agua se va antes de que alguien pregunte qué hay ahí ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la pista cruza la pantalla de lado a lado, la manivela ocupa la franja inferior y las fichas sin ubicar esperan en el borde. Gestos: `drag`, `scrub` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela.** Cada vuelta mueve al caminante exactamente una piedra y esa piedra hace clic. El giro es continuo, el caminante no lo es: solo se posa sobre piedras. Soltar a mitad de vuelta completa el salto o lo devuelve.
- **Girar hacia atrás.** El caminante vuelve, piedra por piedra, con el mismo clic. Las piedras pisadas quedan con una huella tenue que no se borra.
- **Arrastrar al caminante.** Un imán lo posa en la piedra más cercana y la manivela gira sola las vueltas que eso implica. Es el mismo hecho contado al revés, y es la alternativa de motricidad para quien todavía no coordina el giro.
- **Estirar la pista.** Arrastrar un extremo estira o comprime toda la fila. Las separaciones cambian todas juntas, nunca una sola, y los números no cambian.
- **Apoyar una ficha en una piedra vacía.** Si es la que corresponde, la piedra queda firme. Si no, la piedra se hunde un poco y las vecinas quedan a distinta distancia: la fila perdió su paso. Levantar la ficha lo deshace.
- **Llegar a la bandera.** La bandera se pliega. Sin cartel y sin sonido de premio más allá del clic de la piedra.

## Invariante matemático

`same_step_every_turn` (`gears_sequence`) es el invariante central: una vuelta es una piedra, siempre, en los dos sentidos y desde cualquier posición. Se ve confirmarse en el clic, que suena idéntico en cada salto, y en que girar rápido o lento lleva al mismo lugar. Se ve romperse en las animaciones de `explain`, donde el caminante da saltos de distinto tamaño y las casillas se apiñan y se separan: la fila deja de ser una fila.

El invariante de posición lo sostiene `slope_walker`: el caminante ocupa una piedra y solo una. No hay estado intermedio válido, y el agua es la forma física de decirlo.

Hay un tercer invariante que el jugador comprueba con las manos y que no pertenece a ninguna de las dos mecánicas: **estirar el dibujo no cambia los números**. Es la razón de que el gesto de estirar exista.

Un movimiento válido pero inútil —girar hasta el final de la pista y volver, estirar y comprimir— no rompe nada y no recibe respuesta.

## Representación visual

Primitiva dominante `displace`, de apoyo `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: el arroyo, las piedras, el caminante en la orilla. Solo se mira y se responde con un toque.
- `intuition`: el caminante congelado a mitad de salto y tres desenlaces dibujados —cae en la siguiente, saltea una, cae al agua—. Ningún número.
- `concrete`: pista de piedras, manivela, bandera, fichas con dígitos apoyadas sobre las piedras. Nada escrito.
- `visual`: las piedras se contraen en marcas equiespaciadas sobre una línea, el agua se desvanece y el caminante se vuelve un punto. La línea se estira y se comprime entera. La manivela queda al costado, girando sola cuando se arrastra el punto.

El nodo no tiene capas `symbolic`, `formal` ni `abstract`, y esa cota es del grafo.

## Transición simbólica

Tres pasos sobre el mismo objeto, con ids estables, cada uno disparado por un gesto:

1. Piedra → marca: la primera vez que el jugador estira la pista y ve que todas las separaciones cambian juntas, las piedras se contraen en marcas sobre una línea y el agua se va.
2. Ficha del bol → ficha de la marca: una sola vez, una ficha `5` se despega de un bol de cinco frutas del nodo anterior, viaja y se posa sobre la quinta marca. Es el cambio de significado del número —de cantidad a posición— hecho morph, y ocurre delante del jugador.
3. Caminante → punto: al arrastrar al caminante en vez de girar, se contrae en un punto sobre la línea.

**El desvanecimiento termina en la ficha sobre la marca.** No hay operadores ni expresión: este nodo mueve un número, no combina dos. El símbolo del salto, `+`, lo recoge `arith.add.displacement`; el `0` de la piedra de partida, que acá queda con ficha vacía, lo recoge `found.count.zero_as_empty`.

## Concepto formal

El nodo no llega a `formal` y no hay definición escrita en ninguna capa. Lo que queda al final es una línea con marcas equiespaciadas, un número en cada una y un punto que se posa en una. Cuatro cosas quedan sostenidas con las manos y sin enunciar: los números están ordenados, entre vecinos siempre hay la misma distancia, cada número tiene exactamente un siguiente y un anterior, y estirar el dibujo no cambia nada de lo anterior. La convención de escribir los números en fila, en orden y a igual distancia es lo único que el nodo aporta a la notación, y aporta mucho: sin ella no hay desplazamiento, ni flecha, ni vector, ni eje.

## Generalización

La analogía se retira en `visual`, cuando el agua desaparece. Es obligatorio retirarla ahí: mientras haya agua, el jugador cree que entre dos piedras no hay nada.

Variantes sin la piedra: la línea estirada y la comprimida con los mismos números; la línea en vertical y en diagonal; la línea sin dibujos, solo marcas; la línea con casi todas las fichas retiradas, donde solo quedan dos y el resto se ubica por vecindad; y la línea enrollada del dial, sin extremos. Cuando el jugador ubica el número pedido en todas esas versiones sin pedir la pista de piedras, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguno aplica. El ejemplo de cofres usa `chest_key` y el de frutas empieza en `alg.sys.two_by_two`. Este nodo aporta a los dos el eje sobre el que después se dibuja todo, pero no comparte sus niveles.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una vuelta, una piedra.** `concrete`, `manipulate`. Pista corta con todas las fichas puestas, bandera a pocos pasos, solo hacia adelante. La demostración se muestra acá.
2. **Adelante y atrás.** `concrete`, `manipulate` y `recognize`. Misma pista; se habilita el giro hacia atrás y aparece la predicción: tocar la casilla de llegada antes de que la manivela gire.
3. **La piedra sin nombre.** `concrete`, `apply`. Aparecen huecos: piedras sin ficha, en posiciones que no permiten contar desde el borde. Rango de la pista mayor.
4. **Marcas sobre una línea.** `visual`, `explain` y `manipulate`. Misma dificultad; el agua se va, las piedras se vuelven marcas y el caminante un punto. Aparecen las dos animaciones del paso irregular.
5. **La pista se estira.** `visual`, `generalize`. Parámetros: la línea se estira, se comprime, se dibuja en vertical y en diagonal, y quedan solo dos fichas puestas. El mismo número cae en lugares distintos de la pantalla.
6. **La pista enrollada.** `visual`, `transfer`. El dial de `geom.angle.turn_as_measure`: llevar la aguja tantas marcas como indica la ficha, en una pista sin extremos.

Qué endurece cada parámetro: el rango de la pista impide recorrerla entera de un vistazo; la posición del hueco decide si se puede contar desde el borde o hay que usar los vecinos; retirar fichas obliga a ubicar por vecindad en vez de por lectura; estirar y rotar la línea separa el número del lugar de la pantalla; quitar los extremos rompe la idea de que la fila empieza en algún lado.

Desafíos de olimpíada: ninguno de [S](../S-desafios/S0-desafios.md) requiere este nodo, y a nivel 0 no corresponde. El nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: el caminante en la piedra `4` y la manivela mostrando tres vueltas. Tocar la piedra `7` antes de que gire.
- `explain`: dos animaciones sobre la misma pista. En una el caminante avanza un paso por número y las casillas quedan parejas; en la otra da saltos de distinto tamaño y las casillas se apiñan. Tocar la que rompe la fila.
- `manipulate`: caminante en la piedra `2`, bandera en la `9`. Girar la manivela hasta llegar y soltar. Pasarse no reinicia: se vuelve girando al revés.
- `apply`: la pista muestra `… 5, □, 7 …` con el caminante esperando lejos del hueco. Arrastrar la ficha `6`.
- `generalize`: la misma pista estirada, comprimida y en diagonal, con solo dos fichas puestas. Ubicar la ficha pedida en cada versión.
- `transfer`: sobre el dial de giro, llevar la aguja tantas marcas como indica la ficha, y comprobar que pasar por el final la devuelve al principio sin que la ficha cambie.

**Misconceptions esperadas:** ninguna. El nodo declara `misconceptions: []`, como todos los `found.*`, y es correcto: una entrada de [L0](../L-modelo-errores/L0-taxonomia.md) es una regla ejecutable sobre expresiones, y acá solo hay una posición y una ficha. Los desvíos son de coordinación y de lectura del dibujo, no reglas aplicadas fuera de su dominio, y ninguno dispara un patrón de explicación. Cada uno tiene su consecuencia física y la interacción no se corta:

- contar la piedra de partida como primer paso: el caminante queda una piedra antes, con la bandera visible a un paso;
- pasarse: el caminante queda más allá y la huella muestra el recorrido entero, incluida la piedra buena;
- estimar a ojo en la pista estirada: el imán posa al caminante en la piedra más cercana y la manivela gira sola una cantidad de vueltas que no coincide con la pedida, a la vista;
- ficha en la piedra equivocada: la piedra se hunde y las vecinas quedan a distinta distancia, que es exactamente el invariante que se está aprendiendo;
- girar sin mirar: el clic de cada piedra suena igual, así que el jugador oye cuántos pasos dio.

Los distractores de `recognize` se generan de los dos primeros —una piedra antes, una piedra después— y los de `explain`, del paso irregular, que es un parámetro de la escena.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_track_numbers_in_order`, nativa. La pista aparece marca por marca en orden, con los huecos que el nivel declare vacíos; gramática `displace`, parametrizada por el rango de la pista y por qué números faltan. Produce también las dos animaciones de `explain`, porque el paso irregular es un parámetro suyo, y abre los niveles 3 y 5.
- `gear_one_step_one_number`, nativa. Una vuelta de manivela, un salto, un clic y la marca de llegada resaltada; parametrizada por la posición de partida y la cantidad de pasos. Es la escena de la demostración y la que dibuja cada movimiento del jugador.
- Ninguna lleva texto rasterizado: los dígitos los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_track`: `length`; `filled_stones` (todas hasta el nivel 2, con huecos desde el 3, solo dos desde el 5); `gap_positions`, que evita los extremos desde el nivel 3 para que no se pueda contar desde el borde; `stretch` y `orientation` en {horizontal, vertical, diagonal}, activos desde el nivel 5; `wrapped` (verdadero solo en el nivel 6); `seed`.
- `gen_walk`: `start`; `steps`; `direction` en {adelante, atrás} (solo adelante en el nivel 1); `flag_position`; `overshoot_distractors`, que produce las opciones de `recognize` una piedra antes y una después; `seed`.
- `gen_stone_card`: `value_range`; `card_form` en {dígito, ficha vacía}; la ficha vacía es la de la piedra de partida y no se pide nunca en este nodo; `seed`.

**Literacy soportada:** de `none` a `full_text`, con mínimo `none`. Se juega entero sin leer: la meta es una bandera y no una consigna, las fichas son dígitos que el jugador vio nacer en el nodo 1, y la voz es opcional ([Q](../Q-edad-universal.md)). En `full_text` no se agrega nada escrito.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela un cuarto de vuelta; el caminante salta y la piedra hace clic. La mano repite una vez más. La escena vuelve al inicio y la manivela late. El gesto de girar hacia atrás tiene su propia demostración en el nivel 2 y el de estirar la pista en el nivel 5; ninguno se repite en nodos posteriores, porque la manivela es la misma en los nodos 3 y 4.

**Sin constantes propias.** Tiempo objetivo, factor de perfiles sin lectura, umbrales de ítems por verbo y espera de la demostración viven en [K](../K-evaluacion.md).
