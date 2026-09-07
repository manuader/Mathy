# Cajas en el libro de cuentas (`prealg.var.unknown_as_box`)

Minijuego del nodo 10 de la espina, "La incógnita es una caja cerrada". Mecánica principal `ledger`, secundarias `balance` y `chest_key`; analogía `mystery_box`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/10-prealg.var.unknown_as_box.md): un concepto, cinco dificultades reales, una analogía, un gesto (dejar un objeto en la fila que le corresponde), cinco pasos de desvanecimiento, el libro de cuentas como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un puesto de frutas con un libro de cuentas. Sobre el mostrador hay manzanas sueltas y cajones cerrados, iguales entre sí, con una marca pintada en la tapa. Nadie abre los cajones: se anotan.

Mapa objeto → concepto: caja cerrada → variable; lo que hay adentro → valor; misma marca → misma variable; marca distinta → otra variable; mover la caja sin abrirla → manipulación simbólica; abrir la caja → resolver. Se suman dos préstamos: la fila es un término y su conteo el coeficiente; la hoja del árbol de cofres es el lugar de la incógnita en una expresión.

Punto de ruptura: `box_with_changing_contents`. Una caja cuyo contenido cambia ya no es incógnita sino entrada de una máquina, y eso es `alg.fn.function_as_machine`. Por eso la analogía se retira en `symbolic`, antes de que el jugador la fuerce ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el libro de cuentas ocupa el centro con sus filas, los objetos sueltos abajo, la balanza a la derecha y el árbol de cofres a la izquierda desde la capa `visual`. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar un objeto a una fila.** Si comparte forma y marca con los que ya están, entra y el conteo de la fila sube. Si no, la fila lo devuelve con un rebote suave y no pasa nada más.
- **Abrir fila nueva.** Arrastrar un objeto al espacio vacío del libro crea una fila para su marca. Es la única jugada válida cuando llega una marca que no estaba.
- **Poner cajones en la balanza.** Cajones de un lado y manzanas del otro, hasta que la barra queda derecha: así se conoce el peso de la marca sin abrir nada. Entre las columnas no hay ningún signo, porque la balanza mide y no afirma.
- **Arrastrar un cajón a una hoja del árbol.** El árbol del nodo 9 tiene una hoja vacía que late. Al soltar el cajón ahí, el árbol queda completo aunque el valor de esa hoja siga sin conocerse.
- **Tocar una fila.** Muestra su conteo por delante y, desde la capa `visual`, funde sus barras en una sola.
- **Abrir un cajón.** Solo en un nivel, al final, para comprobar que había lo que la balanza decía.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha `x` sobre la fila de `x` la suma al conteo; soltarla sobre la fila de `y` produce el mismo rebote; el conteo delante de la letra es el coeficiente.

## Invariante matemático

`count_preserved_under_regrouping` (libro): reagrupar no cambia cuántos hay. Es lo que hace legítimo escribir `3x` en lugar de `x + x + x`, y se ve romperse cuando el jugador intenta juntar filas de marcas distintas: los objetos vuelven a mostrar su dibujo y las filas se separan solas.

Sobre él se apoya el propio del nodo: dos cajas con la misma marca tienen lo mismo adentro mientras estén cerradas. Se confirma en la balanza, donde cambiar un cajón por otro de la misma marca no mueve la barra.

Un movimiento válido pero inútil, como abrir una fila nueva para una marca que ya tenía la suya al lado, no rompe nada: el libro queda con dos filas iguales y recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `partition`, con `invariant` prestada por la balanza y `compose` por el árbol ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el mostrador y el puestero anotando. Solo se mira y se predice.
- `concrete`: libro con filas, objetos agarrables, marcas dibujadas en las tapas. Nada escrito salvo los conteos.
- `visual`: cada fila es una barra segmentada con su conteo al final; el cajón es un segmento de borde punteado y longitud desconocida. La balanza aparece reducida a dos columnas y una barra, y se apaga cuando la medición termina.
- `symbolic`: fichas `x`, `y`, `3` sobre las filas del libro, que sigue igual; el coeficiente adelante.
- `formal`: la definición corta con voz, con el libro al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cajón → barra punteada: al pasar a `visual`, el cajón se aplana como los demás objetos pero conserva el borde punteado y no fija su longitud.
2. Fila → conteo: al completar una fila, el dibujo se atenúa y el número queda adelante (`3 🍎`).
3. Marca → letra: al medir por primera vez un cajón y quedar la barra derecha, la marca de la tapa se despega, gira y se contrae en `x`, y la barra punteada se contrae con ella.
4. Fila de cajas → coeficiente: al juntar tres cajas iguales, las barras se funden y el conteo pasa adelante; `x + x + x` se contrae en `3x`, donde el `3` hereda la identidad del conteo.
5. Segunda marca → segunda letra: el otro cajón repite el paso 3 y queda `y`; arrastrar una fila sobre la otra sigue rebotando, ahora con letras.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el libro: una incógnita es una cantidad que no conocemos y que no cambia mientras dure el problema; una letra es su nombre; dos letras iguales nombran la misma cantidad y dos letras distintas pueden nombrar la misma o no. Propiedades: las cajas se cuentan como objetos (`2x + 3x` da `5x`), una caja y una manzana no se juntan (`x + 3` queda así), y la caja se mueve, se copia y se anida sin abrirse. Casos: una caja puede valer cero sin dejar de ser caja, y puede aparecer varias veces en la misma expresión valiendo lo mismo a la vez. Símbolo nuevo: `x`, más la convención de escribir el coeficiente adelante y sin signo, porque cuenta filas.

## Generalización

La analogía se retira en `symbolic`, apenas la marca se vuelve letra. El cajón se pide como fantasma tocando la letra y se desvanece al soltar, pero no vuelve solo: representa un nombre, y lo que representa un nombre cede su lugar al nombre.

Variantes sin ayuda visual: más de dos marcas en el mismo libro; letras que no son `x` ni `y`; una caja repetida en dos filas; una caja que vale cero; una caja adentro de un cofre anidado, con la letra entre paréntesis. Después, libros con objetos que no son cajas ni frutas: figuras, sonidos, marcas inventadas. Se evalúa que el jugador agrupe por identidad y no por parecido, y que nombre con una letra cualquier cantidad repetida. Cuando hace todo eso sin pedir el libro dibujado, la analogía se eliminó.

## Desafío

Correspondencia con [H](../H-progresion-abstraccion.md): el ejemplo de cofres no aplica, porque sus niveles 1 y 2 son del nodo 12 y el 3 es del nodo 9. La correspondencia real es con el ejemplo de frutas: la etapa 1 (tres manzanas y un total) y la etapa 3 (el morph de 🍎 a `x` sin que el libro cambie) son de este nodo; la etapa 2 es de `alg.sys.two_by_two`.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cada cosa en su fila.** `concrete`, `manipulate`. Dos clases de objetos visibles, ningún cajón. Rango de conteos chico.
2. **La caja también es una fila.** `concrete`, `recognize` y `manipulate`. Aparece el cajón cerrado con marca. La fila lo acepta como a cualquier otro.
3. **Cuánto pesa sin abrirla.** `concrete`, `apply`. Entra la balanza como instrumento de medición, sin ningún signo entre las columnas.
4. **Dos marcas.** `concrete`, `explain` y `manipulate`. Llega un segundo cajón con otra marca. Aparece `variable_as_label`.
5. **Barras y conteos.** `visual`, `manipulate`. Misma dificultad; el libro es de barras y el cajón una barra punteada. La caja entra en la hoja del árbol del nodo 9.
6. **Letras al lado.** `symbolic`, `manipulate` y `apply`. La marca se vuelve letra y el conteo pasa adelante; el libro se transforma en sincronía y el teclado de fichas incluye `x` y `y`.
7. **Marcas que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; libros con objetos arbitrarios y tres o más letras.

Qué endurece cada parámetro: la cantidad de marcas obliga a agrupar por identidad y no por posición; los conteos altos impiden reconocer la fila de un vistazo; la caja dentro del árbol rompe la lectura "la incógnita está al final".

Desafíos de olimpíada: el nodo participa en los desafíos de álgebra de [S](../S-desafios/S0-desafios.md), aún no escritos, donde la incógnita aparece como dato oculto de un problema de varios nodos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: libro con una fila de cuatro manzanas y un cajón cerrado al costado. El guía pregunta por voz cuál cantidad no se ve y el jugador toca el cajón.
- `explain`: dos animaciones sobre el mismo libro. En una, dos cajas iguales y tres cajas iguales se juntan en cinco y el conteo pasa adelante; en la otra, las marcas se despegan, se pegan y se multiplican como si fueran nombres. Tocar la segunda, que clasifica como `variable_as_label`.
- `manipulate`: balanza con tres cajones de la marca A de un lado. Ajustar fichas del otro plato hasta que la barra queda derecha.
- `apply`: el árbol de cofres de `2 × (□ + 3)` con una hoja vacía. Arrastrar el cajón a esa hoja y no a la otra.
- `generalize`: libro con `2x`, `3y` y `4x` en fichas, sin dibujos. Juntar solo lo que se junta y dejar el resto. Y un libro con figuras inventadas: nombrar con una letra la que se repite.
- `transfer`: en la máquina de tuberías de `alg.fn.function_as_machine`, tocar la entrada que la máquina todavía no conoce, marcada con una letra. También en `alg.expr.distributive_tiles` (el lado desconocido de un rectángulo), `prob.rv.random_variable_as_machine` y `linalg.map.inverse_and_systems`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `variable_as_label`, patrón `replay_on_mechanic` sobre el `ledger`, la mecánica principal del nodo: el gesto se repite en cámara lenta, las dos filas se acercan y en el contacto las cajas vuelven a mostrar su dibujo; se ve que no son iguales y las filas se separan solas con sus conteos. Voz: "Estas cajas no tienen la misma marca. ¿Cuántas hay de cada una?". El jugador cuenta desde ese estado. Es la única catalogada para el nodo.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de esta misconception y desde las del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `ledger_box_hides_tokens`, nativa. Fichas visibles, una caja que se cierra sobre parte de ellas y el total que sigue en pantalla aunque el conteo ya no se vea; gramática `partition`, con el total resaltado. Parametrizada por cuántas se ven, cuántas se ocultan y el total, produce también las animaciones de `explain`.
- `chest_box_as_tree_leaf`, nativa. La caja crece en una hoja del árbol del nodo 9 con el resto intacto; parametrizada por la expresión y por qué hoja es la incógnita.
- `ledger_morph_fruit_to_symbol`, nativa. El morph de la sección de transición, con las etapas y el mapa de ids como parámetros. [I](../I-manim/I0-mapping.md) la asigna a este nodo aunque el YAML del grafo no la liste.
- Ninguna escena de balanza está asignada a este nodo. La medición se renderiza con la mecánica sobre el estado del jugador, y las escenas de balanza nacen en el nodo 11.

Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_ledger_rows`: `kinds` (2 a 4 clases de objeto); `counts` por clase; `boxed_kinds` (cuáles vienen cerrados, ninguno en el nivel 1); `coefficient_range`; `seed`.
- `gen_box_marks`: `marks` (1 a 3 marcas distintas); `hidden_value_range`; `same_value_across_marks` (verdadero en alguna instancia desde el nivel 6, para que dos letras puedan coincidir); `zero_allowed` (desde el nivel 7); `seed`.
- `gen_tree_slot`: `expression` (árbol del nodo 9); `unknown_position` (hoja izquierda, derecha o interior); `distractors` desde `detect` (hojas con valor conocido); `seed`.

**Literacy soportada:** de `none` a `full_text`. La capa concreta y la visual se juegan sin leer, con marcas dibujadas, filas por forma y color, prompts de voz y `explain` entre animaciones. La letra llega como morph de la marca y sigue siendo un dibujo con historia, no un texto, así que el mínimo se mantiene en `none`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma lleva las manzanas a una fila y los cajones a otra, intenta mezclarlas y la fila devuelve el cajón con un rebote. La escena vuelve al inicio y la fila vacía late. Se repite solo si el jugador se queda quieto. La demostración de la balanza es de este nodo y no se repite en el 11 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
