# 02 — Los números viven en fila (`found.count.number_line`)

> Locale `es`: "Los números viven en fila". Minijuego: [La pista de piedras](../../F-minijuegos/found.count.number_line.md).

**Nodo:** `found.count.number_line` · **Área:** found · **Nivel:** 0 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundaria `slope_walker`) · **Literacy:** `none` · **Analogía:** `number_line_walk` · **Capas:** `real`, `intuition`, `concrete`, `visual`

## 1. Concepto

Los números no son solo etiquetas de colecciones: ocupan lugares fijos en una fila y esos lugares están siempre a la misma distancia uno del otro. Al terminar, el jugador lleva un caminante a la piedra que se le pide dando pasos de a uno, sabe qué número va en una piedra vacía sin contar desde el principio y reconoce que la fila mantiene el mismo paso aunque se estire, se acorte o pierda los dibujos.

## 2. Prerequisitos

- `found.count.cardinality` (nodo 1): la cuenta como propiedad de una colección. Se usa entero lo que aquel nodo dejó: la correspondencia uno a uno, ahora entre un paso y una piedra en vez de entre un número y una fruta; la ficha con el número, que acá se apoya sobre una piedra y no sobre un bol; y la invariancia, que cambia de forma —allá el número sobrevivía al desorden, acá la distancia entre piedras sobrevive a que la pista se estire—.

La arista no sigue el orden escolar, donde contar y la recta numérica son el mismo tema. [C0](../../C-knowledge-graph/C0-esquema.md) los separa porque son dos invariantes distintos y fallan por separado: hay jugadores que cuentan bien una colección desordenada y ubican mal el número en la fila, y jugadores que recitan la fila entera sin poder decir cuántas frutas hay en el bol.

## 3. Dificultad cognitiva real

Lo difícil no es recitar la fila. Son tres capacidades:

1. **El número como posición y no como cantidad.** En el nodo 1 el `5` era una propiedad de un bol entero. Acá es una piedra concreta, la quinta, y sobre ella no hay cinco de nada. Es el primer cambio de significado del mismo símbolo en toda la espina, y es el que hace posible sumar como desplazamiento.
2. **El paso uniforme.** Entre dos piedras vecinas siempre hay lo mismo. Es el invariante `same_step_every_turn` de `gears_sequence`, y sin él "avanzar tres" no significa nada. Quien no lo tiene lee la pista como una lista de nombres en un orden y no como una regla.
3. **El orden como estructura, no como memoria.** Saber que el `7` va después del `6` es memoria; saber que el hueco entre el `6` y el `8` solo puede ser el `7`, sin recitar desde el principio, es haber entendido la fila. La probe de `apply` mide exactamente eso.

Las tres son independientes de la cardinalidad y se ejercitan sin volver a contar colecciones.

## 4. Problema intuitivo

Un arroyo con piedras planas cruzándolo, una tras otra, todas a un paso de distancia. En la orilla, un caminante. En la piedra del medio, una bandera.

Es la fila con la que terminó el nodo 1: las frutas contadas salieron del bol, se pusieron en hilera y cada una se quedó con su piedra y su tarjeta. Ahora las frutas ya no están y quedan las piedras. La pregunta, por voz o por gesto: ¿llega el caminante a la bandera sin mojarse?

En `intuition` la escena se detiene con el caminante en el aire, a mitad de un salto, y se ofrecen tres desenlaces dibujados: cae en la piedra siguiente; salta dos y se saltea una; cae al agua entre dos piedras. El jugador elige y después ve. El tercer desenlace es el que prepara el punto de ruptura de la analogía.

## 5. Analogía del mundo real

`number_line_walk`, declarada sobre `slope_walker` en el catálogo ([G0](../../G-analogias/G0-reglas.md)). Mapa de estructura: cada piedra del camino es un entero; la posición del caminante es el valor; un paso es el incremento de una unidad; el orden de las piedras es el orden de los números; la piedra de partida es el cero.

El invariante que conserva es el paso uniforme: todas las piedras están a la misma distancia, y por eso avanzar la misma cantidad de pasos desde cualquier piedra cubre la misma distancia. Se rompe en `position_between_stones`: el caminante no puede quedarse en el agua, y eso es correcto mientras los números sean enteros y falso apenas aparezcan las fracciones. La analogía se retira en la capa `visual`, y el agua entre piedras es la que después va a llenar `arith.frac.parts_and_ratio`.

Se eligió esta y no una escalera ni un ascensor porque el camino de piedras es horizontal y no sugiere que un número sea "más alto" que otro: acá lo único que hay es antes y después. La altura llega con `slope_walker` en `arith.rate.per_unit`, y traerla ahora obligaría a desaprenderla.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Dos mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `gears_sequence` es la principal y provee la herramienta: una manivela que, por cada vuelta, mueve al caminante exactamente una piedra. `slope_walker` provee el cuerpo que se desplaza y el hecho de que el tamaño del paso es una decisión de la mecánica y no del caminante. Se encuentran en un solo gesto: girar la manivela mueve al caminante, y arrastrar al caminante hace girar la manivela. Gestos: `drag`, `scrub` y `tap`.

1. La pista de piedras cruza el agua. El caminante está en la piedra de partida y la manivela está abajo, grande y a mano.
2. Demostración: una mano fantasma gira la manivela un cuarto de vuelta; el caminante salta a la piedra siguiente y esa piedra hace un clic. La mano repite. La escena vuelve al inicio y la manivela late ([Q](../../Q-edad-universal.md)).
3. El jugador gira. Cada vuelta es un salto y un clic; el giro es continuo pero el caminante solo se posa sobre piedras. Si suelta la manivela a mitad de vuelta, el caminante completa el salto o vuelve, nunca queda en el agua.
4. Girar hacia atrás devuelve al caminante. La pista no se borra: las piedras ya pisadas quedan marcadas con una huella tenue, y esa huella es lo que el nodo 4 va a usar.
5. Arrastrar al caminante directamente lo lleva a la piedra más cercana con un imán visible, y la manivela gira sola la cantidad de vueltas que corresponde. Es el mismo hecho contado al revés y sirve para el jugador que todavía no coordina el giro.
6. Piedra vacía: en algunos niveles una piedra no tiene su ficha. El jugador arrastra la ficha correcta desde el borde. Si la deja en una piedra que no le corresponde, la ficha se apoya, la piedra se hunde un poco bajo el agua y las piedras vecinas quedan más lejos de lo que estaban: la fila perdió su paso. Levantar la ficha la devuelve.
7. Éxito: el caminante llega a la bandera y la bandera se pliega. Sin cartel.

Nada se llama "incorrecto". Cada desvío tiene su consecuencia física, en la sección 12.

## 7. Representación visual

Capa `visual`, con `displace` dominante y `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

`displace`. Las piedras se contraen en marcas equiespaciadas sobre una línea recta y el caminante en un punto que se desliza de marca en marca. Lo que se desplaza es el punto; lo que se conserva es la distancia entre marcas, y el juego la muestra: al arrastrar los extremos de la línea, la pista se estira o se acorta entera y todas las separaciones cambian juntas, nunca una sola. Nada se escala en el sentido de multiplicar; el estiramiento es de dibujo y por eso el número de cada marca no cambia.

`partition`. La línea sigue siendo una fila de lugares que no se pisan: cada marca es un lugar y el punto está en uno solo a la vez. Es lo que queda del `sorter` del nodo 1 sin sus cajones.

Todavía no se muestra ninguna operación, ninguna flecha de salto con etiqueta y ningún número negativo: la pista empieza en la piedra de partida y a la izquierda hay orilla. Tampoco se muestra el `0` sobre la piedra de partida, que queda con ficha vacía; ese hueco es el problema que abre `found.count.zero_as_empty`.

## 8. Transición a símbolos

Este nodo tampoco llega a `symbolic`, y su desvanecimiento tiene tres pasos. El objeto es el mismo en los tres.

1. **Piedra → marca.** La primera vez que el jugador estira la pista arrastrando un extremo y ve que las separaciones cambian todas juntas, las piedras se contraen en marcas sobre una línea y el agua se desvanece. Es el paso `crank_track` → `numbered_track` de `gears_sequence`.
2. **Ficha sobre la marca.** Las fichas que el nodo 1 dejó apoyadas sobre colecciones ahora se apoyan sobre marcas, y el juego lo muestra explícitamente una vez: una ficha `5` se despega de un bol de cinco frutas, viaja y se posa sobre la quinta marca. Es el cambio de significado de la sección 3, hecho morph.
3. **Caminante → punto.** Cuando el jugador arrastra al caminante en vez de girar la manivela, el caminante se contrae en un punto sobre la línea, y la manivela queda al costado girando sola.

**El desvanecimiento termina en la ficha sobre la marca.** No hay operadores ni expresión, porque este nodo todavía no hace nada con dos números a la vez: mueve uno. El símbolo del salto, `+`, lo recoge [`arith.add.displacement`](03-arith.add.displacement.md), donde el número de vueltas de la manivela se vuelve una ficha propia y aparece la primera expresión de la espina. El `0` de la piedra de partida lo recoge `found.count.zero_as_empty`, fuera de la espina.

## 9. Notación matemática

Queda una línea con marcas equiespaciadas, un número en cada marca y un punto que se posa en una de ellas.

El nodo no introduce símbolos nuevos: los dígitos ya nacieron en el nodo 1 como etiqueta de una colección. Lo que aporta es una **convención de escritura**, y la convención es fuerte: los números se escriben en una fila, en orden, a igual distancia, y esa fila es un objeto que se puede mirar entero. El problema que la hace necesaria es el de la probe de `apply`: para saber qué número va en un hueco, un montón de fichas sueltas no sirve de nada, porque una ficha suelta no tiene vecinos. La fila da vecinos, y con vecinos el hueco tiene una sola respuesta posible sin recitar desde el principio.

Es también la convención que hace posible todo lo que viene después. Sin una fila con paso uniforme no hay desplazamiento, no hay flecha, no hay vector y no hay eje.

## 10. Definición formal

El nodo no tiene capa `formal`: `layers` termina en `visual`. La sección queda como registro de lo que el jugador ya juega sin que se lo enuncien, para que quien lo enuncie después no lo presente como nuevo.

Jugado, sin palabras: los números están ordenados; entre dos vecinos siempre hay la misma distancia; después de cada número hay exactamente uno siguiente; el orden no cambia si la fila se estira o se dibuja más chica. Casos que el jugador encuentra y que la definición futura tendrá que cubrir: el extremo de la fila, que en este nodo es una orilla y en `arith.int.negatives` deja de serlo; y el agua entre dos piedras, que acá no es un lugar y en `arith.frac.parts_and_ratio` pasa a serlo.

## 11. Propiedades

- **Todos los pasos miden lo mismo.** Ligada al clic de la manivela: una vuelta, una piedra, siempre. Es lo que el jugador comprueba cuando gira rápido y cuando gira lento y llega al mismo lugar.
- **El orden no depende del dibujo.** Estirar, acortar o dibujar la pista curvada no cambia qué número va antes de cuál. Ligada al gesto de arrastrar los extremos de la línea.
- **Cada número tiene exactamente un siguiente y un anterior.** Ligada a que la manivela solo tiene dos sentidos y a que el caminante nunca se posa entre dos piedras.
- **Un hueco entre dos piedras conocidas tiene una sola respuesta.** Ligada a la ficha que se hunde cuando se apoya en la piedra equivocada. Esta propiedad es la que `found.pat.what_comes_next` recoge para convertirla en patrón.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), a partir de las probes del locale.

- `recognize`: la pista con casillas numeradas, el caminante en una de ellas y la manivela mostrando cuántos pasos va a dar. El jugador toca la casilla donde va a parar, antes de que la manivela gire. Es predicción, no lectura del resultado.
- `explain`: dos animaciones sobre la misma pista. En una el caminante avanza un paso por número y las casillas quedan a la misma distancia; en la otra da saltos de distinto tamaño y las casillas se apiñan y se separan. El jugador toca la que rompe la fila.
- `manipulate`: girar la manivela para llevar al caminante desde la casilla marcada hasta la de la bandera, y soltar al llegar. Pasarse deja al caminante más allá y la bandera sigue plantada; se vuelve girando al revés.
- `apply`: una casilla vacía entre dos numeradas y el caminante esperando. El jugador arrastra la ficha del número que falta. Los huecos se generan en posiciones que no permiten contar desde el borde.
- `generalize`: la pista se estira, se acorta y después pierde los dibujos hasta quedar en marcas sobre una línea. En cada versión el jugador ubica la ficha del número pedido. El mismo número cae en lugares distintos de la pantalla y sigue siendo el mismo número.
- `transfer`: sobre el dial de giro de `geom.angle.turn_as_measure`, llevar la aguja tantas marcas como indica la ficha. La pista está enrollada y no tiene extremos, y eso es lo único que cambia.

**Misconceptions.** El nodo declara `misconceptions: []`, como todos los `found.*`, y es correcto. Una entrada de [L0](../../L-modelo-errores/L0-taxonomia.md) es una regla ejecutable que transforma un estado válido en una respuesta equivocada y que se puede reproducir sobre una mecánica; su notación `detect` opera sobre expresiones, y en este nodo no hay ninguna: hay una posición y una ficha. A este nivel el desvío todavía no es conceptual, es de coordinación y de lectura del dibujo. Los errores esperados se describen como consecuencias físicas y ninguno dispara un patrón de explicación:

Contar el punto de partida como primer paso: el caminante llega una piedra antes y la bandera sigue plantada, visible a un paso. Pasarse de largo: queda más allá y la huella muestra el recorrido entero, incluida la piedra buena. Leer la posición por el dibujo: en la pista estirada el jugador estima a ojo, el imán posa al caminante en la piedra más cercana y la manivela gira sola una cantidad de vueltas que no coincide con la pedida, a la vista. Poner la ficha en la piedra equivocada: la piedra se hunde y las vecinas quedan a distinta distancia, o sea que la fila perdió su paso uniforme, que es exactamente lo que se está aprendiendo; levantar la ficha lo deshace. Girar sin mirar: el clic de cada piedra suena igual, así que el jugador oye cuántos pasos dio.

La primera misconception catalogada de la espina llega en el nodo 3.

## 13. Generalización

La analogía se retira dentro del propio nodo, en `visual`, cuando el agua se va y quedan marcas sobre una línea. Retirarla acá es obligatorio: mientras haya agua, el jugador cree que entre dos piedras no hay nada, y eso es justo lo que hay que poder revisar más adelante.

Variantes sin ayuda del objeto, en orden: la pista estirada y la pista comprimida, con los mismos números; la pista dibujada en vertical y en diagonal; la pista sin dibujos, solo marcas; la pista con la mayoría de las fichas retiradas, donde solo quedan dos y el resto hay que ubicarlo por vecindad; y la pista enrollada del dial, que es la variante de transferencia.

El nodo no llega a `abstract` y `layers` lo declara. La forma completa de esta idea —el orden y la distancia como estructura independiente del objeto que se ordena— aparece con notación propia en `linalg.vec.vector_as_displacement` y en `trig.circle.unit_circle_radians`, que son dos de sus destinos de transferencia.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no fue la de aprender:

- `geom.angle.turn_as_measure` (`gears_sequence` sobre un dial): la pista se enrolla y las piedras son marcas de giro. Medir un ángulo es contar cuántas marcas se avanzó, y la pista sin extremos hace visible qué parte de este nodo dependía de tener una orilla.
- `linalg.vec.vector_as_displacement` (`gears_sequence` con dos manivelas): una manivela por eje. Un vector es cuántas piedras se avanzó en cada una, y la posición vuelve a ser el resultado de un desplazamiento.
- `trig.circle.unit_circle_radians` (`construct` sobre el círculo): la fila de piedras se convierte en el borde del círculo y el paso uniforme es lo que hace que la medida en radianes tenga sentido.

Concepto siguiente: `arith.add.displacement` ([03](03-arith.add.displacement.md)). Frase puente, narrada sobre el caminante ya parado en una piedra cualquiera: "Ya sabés dónde queda cada número. El caminante está acá, y le pedimos tres pasos más. ¿Hace falta volver a la orilla para saber dónde termina?". La manivela aparece con una tarjeta al lado que dice cuántas vueltas dar, y el nodo 3 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `gear_track_numbers_in_order` es nativa y se dibuja sobre el estado del jugador: la pista aparece marca por marca en orden, con los huecos que el nivel declare vacíos; gramática `displace`, parametrizada por el rango de la pista y por qué números faltan. Produce también las dos animaciones de `explain`, porque el paso irregular es un parámetro suyo. `gear_one_step_one_number` también es nativa: una vuelta de manivela, un salto, un clic, con la marca de llegada resaltada; parametrizada por la posición de partida y la cantidad de pasos. Ninguna lleva texto rasterizado: los dígitos los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** el nodo comparte `op_count` con el nodo 1 y no agrega ninguna tecla ([M](../../M-calculadora/M0-progresion.md)). Lo que cambia es lo que la tecla muestra: con el nodo 1 en `ready`, `contar` contaba una colección de fichas; con este nodo en `ready`, la misma tecla —nunca una nueva— despliega además la pista y el caminante, y tocar una ficha de número posa al caminante en esa marca. Es la primera calculadora del juego y todavía no calcula nada.

**Edad universal:** el nodo es `literacy: none`, como exige el validador para nivel 0 ([Q](../../Q-edad-universal.md)). Se juega entero sin leer: la instrucción es la mano fantasma sobre la manivela, la meta es una bandera y no una consigna, las fichas son dígitos que el jugador vio nacer en el nodo 1, y la voz es opcional. La manivela existe además por motricidad: girar con un dedo es más tolerante que soltar un objeto sobre un blanco chico, y arrastrar al caminante con imán es la alternativa para quien todavía no coordina el giro. Un adulto entra por diagnóstico con un solo ítem y se queda con la pista dentro de la calculadora. Speed se mide sin cuenta regresiva, con el factor de perfiles sin lectura de [K](../../K-evaluacion.md).
