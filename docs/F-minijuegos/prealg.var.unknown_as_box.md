# La caja cerrada (`prealg.var.unknown_as_box`)

Minijuego del nodo 10 de la espina, "La incógnita es una caja cerrada". Mecánica principal `ledger`, secundarias `balance` y `chest_key`; analogía `mystery_box`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/10-prealg.var.unknown_as_box.md): un concepto, tres dificultades reales (tratar lo desconocido como cantidad, sostener la identidad de la caja, nombrar antes de saber), una analogía con morph de una sola pieza, un gesto (arrastrar la caja cerrada a una fila del libro), cinco pasos de desvanecimiento, el libro de cuentas como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un libro de cuentas abierto y, sobre la mesa, cajas cerradas con una marca y frutas sueltas. Al costado, una balanza que sirve para pesar.

Mapa objeto → concepto: caja cerrada → variable; lo que hay adentro → valor; misma marca, misma caja → misma variable; marca distinta → variable distinta; mover la caja sin abrirla → manipulación simbólica; abrir la caja → resolver; fila del libro → término; cuenta de la fila → coeficiente.

Punto de ruptura: `box_with_changing_contents`. La caja guarda un contenido fijo, y hay conceptos donde la letra recorre valores en vez de ocultar uno; ese borde es exactamente `alg.fn.function_as_machine`, uno de los destinos de transferencia ([G0](../G-analogias/G0-reglas.md)). La balanza entra sin su analogía propia: acá es un instrumento de medir, y que la barra nivelada sea una afirmación es el nodo 11.

## Mecánica central

Superficie: el libro ocupa el centro con sus filas, la mesa con cajas y frutas abajo, la balanza a un costado, el árbol de cofres al otro desde el nivel 4. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una fruta o una caja a una fila.** La fila la acepta y muestra su cuenta. Con las cajas funciona igual aunque nadie sepa qué hay adentro: eso es todo el nodo, y se descubre haciéndolo.
- **Arrastrar una caja a una fila que no es la suya.** La caja entra, se queda un instante y la fila se parte en dos con una línea. Nada se pierde, nada dice "incorrecto": la fila se niega a sumar lo que no es igual.
- **Tocar una fila.** La cuenta se desplaza al frente de la primera barra. Es el gesto que escribe el coeficiente, y se practica primero en la fila de las frutas, donde el jugador puede verificar contando.
- **Poner cajas en la balanza.** La barra tiembla; el jugador agrega o quita fichas del otro lado hasta que queda quieta y ahí lee el peso. Con dos o tres cajas hay que repartir las fichas en partes iguales, y ese reparto es lo que hace visible el conteo de cajas.
- **Soltar una caja en una hoja del árbol.** El cofre anidado del nodo 9 acepta la caja como hoja; la expresión conserva la forma con una hoja sin número.
- **Tocar una caja cerrada.** Se sacude y no se abre. Abrirla es del nodo 13; acá el juego pesa, no resuelve.

En `symbolic` la superficie cambia de forma, no de reglas: las filas se apilan en un renglón, soltar una ficha sobre una fila es arrastrar una caja a esa fila, y soltarla entre dos filas de marcas distintas produce la misma línea de separación, ahora dibujada sobre el renglón.

## Invariante matemático

`count_preserved_under_regrouping` (libro): reordenar en filas no cambia cuántas cosas hay sobre la mesa. Es lo que hace legítimo escribir `2x` en lugar de `x + x`, y se ve en que el largo total del libro no cambia cuando una fila se parte en dos.

Se ve romperse cuando el jugador junta marcas distintas: la fila se parte sola, el largo total se conserva y lo que no se conserva es la promesa de que la fila cuenta una sola cosa. La línea que aparece es el mensaje.

Un movimiento válido pero inútil —mover una caja de la primera a la segunda posición de su propia fila, escribir la cuenta adelante en una fila de una sola caja— no rompe nada. Empujón suave, sin explicación.

## Representación visual

Primitiva dominante `partition`, de apoyo `compose` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la verdulería al cierre, tres cajones precintados y siete naranjas. Solo se mira y se predice cómo lo anota el vendedor.
- `concrete`: libro de cuentas con filas, cajas de madera con marca, frutas sueltas, balanza al costado. Nada escrito salvo los conteos que el jugador acaba de hacer.
- `visual`: las frutas se aplanan en barras cortas iguales; la caja, en una barra de longitud desconocida con el borde punteado, siempre igual a sí misma. Tres cajas son tres barras punteadas idénticas en línea, y ahí se ve por qué se cuentan.
- `symbolic`: `2x + 7` sobre el renglón, con el libro al costado sincronizado; tocar `2x` ilumina la fila de las cajas.
- `formal`: las tres frases cortas con voz y el libro al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Caja → barra con marca: al contar una fila de cajas en `visual`, las cajas se aplanan en barras punteadas y la marca se despega y flota sobre la barra como etiqueta.
2. Fila → cuenta adelante: al tocar la fila, la cuenta se desplaza al frente de la primera barra.
3. Caja → `x`: al arrastrar una caja a una fila que ya tiene su cuenta adelante, la barra punteada se contrae en la marca que llevaba flotando y la marca se dibuja como `x`, en el mismo lugar y con el mismo id.
4. Segunda marca → `y`: la caja de la otra marca hace lo mismo; las dos letras conservan color y forma un rato y las dos filas siguen sin juntarse.
5. Filas → renglón: al cerrar el libro, las filas se apilan en una línea con el signo de juntar entre ellas y el libro queda a un costado.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el libro: una letra es el nombre de una cantidad que todavía no se conoce; dos letras iguales nombran la misma cantidad y dos distintas pueden nombrar cantidades distintas; contar cosas iguales vale también cuando no se sabe cuántas hay adentro de cada una. Propiedades: la misma marca es la misma cantidad en toda la mesa; solo se cuentan juntas las cosas iguales; el conteo se conserva al reagrupar. Casos especiales: una caja vacía hace que la letra valga cero sin que la fila deje de tener tres cajas, y dos marcas distintas pueden tener el mismo contenido sin dejar de ser dos nombres. El símbolo nuevo es `x`; la escritura del coeficiente, `2x`, significa acá "dos cajas" y no se afirma todavía que signifique "dos por `x`".

## Generalización

La caja se retira en `symbolic`, cuando el jugador opera con la letra sin pedir el objeto; el libro se retira poco después, cuando el renglón se sostiene solo. La caja vuelve como fantasma tras un error, porque es donde el error se ve.

Variantes sin ayuda visual: dos y tres marcas distintas; una fila de una sola caja; una caja vacía; la letra en una hoja de un árbol con paréntesis; la misma letra en dos filas del mismo renglón. Después, cajas que no guardan números: un color desconocido, una dirección, una figura. El jugador sigue contando cajas por marca, no puede juntarlas, y responde qué cambia si una se abre. Cuando escribe y lee expresiones de dos o tres letras sin pedir el libro y explica por qué `2x + 3y` no se acorta, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de frutas de [H](../H-progresion-abstraccion.md): sus etapas 1 y 2 (tres manzanas y un total; dos filas que comparten frutas) corresponden a este nodo en lo que tienen de "la fruta es la incógnita y el juego no lo dice". La etapa 3, donde la manzana se transforma en `x`, es el morph que este nodo ejecuta; lo que la etapa 3 hace con dos ecuaciones a la vez es del nodo 16.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Filas que aceptan cajas.** `concrete`, `manipulate`. Una sola marca, frutas de un tipo, rango chico. La caja se cuenta como se cuenta una fruta.
2. **Dos marcas.** `concrete`, `recognize` y `explain`. Aparece la segunda caja y la fila que se parte. Aparece `variable_as_label`.
3. **Pesar sin abrir.** `concrete`, `manipulate`. La balanza como instrumento; con dos y tres cajas hay que repartir las fichas en partes iguales.
4. **Barras punteadas.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; las filas son barras y la caja es la barra de longitud desconocida. La caja baja a una hoja del árbol del nodo 9.
5. **La letra.** `symbolic` primera mitad, `manipulate` y `apply`. El morph de la caja a `x`; el renglón aparece junto al libro y se transforma en sincronía.
6. **Cajas que no guardan números.** `formal` y `abstract`, `generalize`. Definición corta con voz; tres marcas, cajas vacías y cajas con contenidos que no se cuentan.

Qué endurece cada parámetro: la cantidad de marcas obliga a mirar la marca y no la forma de la caja; la caja vacía rompe la idea de que la letra es "algo que hay"; la fila de una sola caja rompe la lectura "si no tiene número adelante, no es una fila"; el rango numérico grande impide adivinar el contenido por tamaño de la pila.

Desafíos de olimpíada: el nodo no participa todavía en ningún desafío declarado de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: libro con una fila de siete fichas y una caja cerrada sobre la mesa; el guía pregunta qué cantidad no se ve y el jugador toca la caja.
- `explain`: dos animaciones sobre el mismo libro: dos cajas más tres cajas se juntan en cinco cajas; las marcas se pegan y las cajas se multiplican como si las marcas fueran nombres. Tocar la segunda; el distractor es `variable_as_label`.
- `manipulate`: tres cajas de la misma marca en un plato y fichas sueltas en el otro; ajustar hasta que la barra queda quieta, repartiendo las fichas en tres partes iguales.
- `apply`: el árbol de `3 × (□ + 4)` con una hoja vacía; arrastrar la caja a esa hoja, contra el tiempo objetivo del nodo.
- `generalize`: sobre el libro con letras, `3x + 2y + x`; juntar solo lo que se puede y dejar dos filas. Y una caja con un color adentro: decir cuántas cajas de esa marca hay sin decir de qué color son.
- `transfer`: en la máquina de tuberías de `alg.fn.function_as_machine`, tocar la entrada que la máquina todavía no conoce, marcada con una letra.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `variable_as_label`, patrón `replay_on_mechanic` sobre el libro: el gesto se repite en cámara lenta, las dos columnas de cajas se acercan y no se funden, la línea las separa y un halo marca la marca que sobra; el jugador reordena desde ese estado. Es la única del nodo y la que `prealg.expr.like_terms` y `alg.expr.distributive_tiles` heredan.

Los distractores de `explain` y las opciones de `apply` se generan desde su regla `detect` más las del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `ledger_box_hides_tokens`, nativa. El libro del jugador con las fichas visibles, las escondidas y el total como parámetros; gramática `partition`, con el largo total conservado mientras las filas se reordenan. Produce también las animaciones de `explain`.
- `chest_box_as_tree_leaf`, nativa. La expresión con ids y la hoja desconocida marcada: el árbol se dibuja, la caja baja a su hoja y la forma no se mueve; gramática `compose`. Abre el nivel 4 y es la imagen de cheatsheet de `cs.prealg.letter_names_the_box`.
- Ninguna lleva texto rasterizado: las marcas son formas y las letras las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_ledger_rows`: `marks` (1 a 3 marcas distintas); `boxes_per_mark` (1 a 4); `loose_tokens` (0 a 12); `empty_box` (falso hasta el nivel 6); `seed`.
- `gen_box_weighing`: `boxes` (1 a 3 cajas del mismo lado); `content` (el peso real, oculto); `token_denominations`; `exact_split` (verdadero hasta el nivel 5, para que el reparto sea entero); `seed`.
- `gen_tree_with_hole`: reusa la expresión de `gen_expression_tree` del nodo 9 y marca una hoja como desconocida; `depth`, `hole_position`, `seed`.
- `gen_opaque_box`: contenidos que no se cuentan (color, dirección, figura), para el nivel 6.

**Literacy soportada:** de `none` a `full_text`. Todo el minijuego se juega sin leer: las marcas son formas y colores, las filas se parten solas y los prompts van por voz. La `x` del nivel 5 no es texto sino un ícono que el jugador vio nacer de una caja, y se arrastra desde el teclado de fichas. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra una fruta a una fila y después una caja a otra fila; las dos filas muestran su cuenta. Después arrastra la caja a la fila de las frutas y la fila se parte. La escena vuelve al inicio y la caja late. Se repite solo si el jugador se queda quieto. La demostración de la balanza es propia de este nodo y se muestra una vez en el nivel 3 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Ningún umbral, peso ni tiempo se declara acá; todos se citan por nombre desde [K](../K-evaluacion.md), incluido el tiempo objetivo del nodo.
