# Dos montones, un renglón (`arith.add.combine_groups`)

Minijuego del nodo 46 de la espina, "Juntar dos montones". Mecánica única `ledger`; analogía `fruit_ledger`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/46-arith.add.combine_groups.md): un concepto, cuatro dificultades reales (anticipar sin recontar, la clase como parte del dato, el total no depende de cómo se junte, escribir el conteo en vez de dibujar la fila), una analogía que el niño reconoce sin palabras, un gesto (soltar un renglón sobre otro), cuatro morphs hasta `3 🍎`, el libro de cuentas como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un libro de cuentas con renglones, dos montones de fruta sobre la mesa y una tarjeta de conteo apagada al principio de cada renglón. Más tarde, tres y cuatro montones, algunos de otra clase, y un montón vacío.

Mapa objeto → concepto: tipo de fruta → unidad, la clase; montón de un tipo → término; renglón del libro → término escrito; tic al entrar una fruta → un paso del conteo; tarjeta al principio del renglón → conteo, y más tarde coeficiente; soltar un renglón sobre otro de la misma clase → suma; renglón que se parte solo en dos → términos que no se pueden juntar; renglón con la tarjeta en cero → el montón vacío.

`ledger` aporta todo: las filas por clase, el conteo por fila y el invariante de que reagrupar no cambia el total. Es uno de los pocos nodos de la espina con una sola mecánica, como `prealg.eq.balance` o `graph.basic.graph_and_paths`, y por la misma razón: el nodo **es** su mecánica. Punto de ruptura de la analogía: `fruit_times_fruit`, manzana por manzana, que este nodo nunca toca. Se retira en `symbolic`, cuando el renglón ya es conteo y clase ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el libro ocupa el centro con dos renglones al principio y hasta cuatro después; los montones quedan abajo; la tarjeta de conteo se apoya al principio de cada renglón. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). La zona de drop de un renglón es el renglón entero.

- **Arrastrar una fruta al renglón.** Se acomoda en el primer hueco libre, suena un tic y la tarjeta gana un punto.
- **Arrastrar un renglón sobre otro de la misma clase.** Los dos se funden con un chasquido. La tarjeta del renglón que recibe **sigue** desde su número en vez de apagarse y volver a cero. Ese detalle es la anticipación sin recontar hecha animación.
- **Arrastrar un renglón sobre otro de otra clase.** Las frutas entran, se mezclan un instante y el renglón se parte solo en dos, cada mitad con su tarjeta y un rebote corto. Nada se llama "incorrecto": el libro no sabe tener dos clases en un renglón y lo muestra haciéndolo.
- **Tocar la tarjeta de un renglón.** Sus puntos se posan uno sobre cada fruta y vuelven. Es la verificación sin recontar.
- **Juntar con el renglón vacío.** Las cosas que entran son ninguna y la tarjeta no se mueve. El anticlímax es el mensaje.
- **Elegir el orden con tres renglones.** El jugador junta de a dos en el orden que quiera. El juego no sugiere ninguno y la tarjeta final es la misma en los seis órdenes.
- **Tocar una ficha de conteo en `symbolic`.** Manteniéndola tocada vuelven las marcas de la fila. La fila nunca se pierde: se guarda debajo de la ficha.

En `symbolic` la superficie cambia de forma, no de reglas: un renglón es la ficha del conteo seguida de la ficha de la clase, y soltar una ficha de conteo sobre otra de la misma clase es soltar un renglón sobre otro; soltarla sobre una clase distinta produce el mismo rebote, con las dos fichas separándose.

## Invariante matemático

Un invariante, el de la única mecánica.

`count_preserved_under_regrouping` (`ledger`): reagrupar no cambia cuántos hay de cada clase. Tiene dos caras y las dos se juegan. La primera: mover frutas dentro de un renglón, partir un renglón en dos y volver a juntarlo, o juntar tres renglones en cualquier orden, deja la tarjeta final igual. La segunda, que es la que este nodo pone en el centro: el conteo es **por clase**, así que un renglón con dos clases no tiene un conteo, tiene dos.

Se ve romperse en un solo lugar y a propósito: cuando el jugador suelta un renglón sobre otro de clase distinta. El renglón no puede sostener un solo conteo y se parte. Es un estado válido, no un error del juego, y el jugador sigue desde ahí.

Un movimiento válido pero inútil (juntar con el renglón vacío, o volver a contar de a uno una fila que ya tiene tarjeta) no rompe nada: el juego lo permite y, si se repite, la tarjeta del primer renglón late antes de la fusión como empujón suave para arrancar desde ese número.

## Representación visual

Primitiva dominante `partition` ([H](../H-progresion-abstraccion.md)), leída de las partes al todo.

- `real`: la mesa después del recreo, dos montones y una canasta. Solo se mira.
- `intuition`: dos escenas. En la primera, los dos montones se van a juntar y hay tres desenlaces dibujados (queda como el montón más grande, queda como los dos sumados, queda con más que los dos sumados). En la segunda, uno de los montones es de peras y hay dos desenlaces (una sola cuenta, o la canasta partida en dos con dos cuentas). El jugador elige y después ve.
- `concrete`: el libro con sus renglones, las frutas, el tic, las tarjetas con puntos. Nada escrito.
- `visual`: cada renglón se aplana en una barra con marcas del mismo ancho, con su tarjeta pegada al inicio. Juntar dos renglones es apoyar una barra en el final de la otra: los dos tramos siguen distinguibles por un cambio de tono que se atenúa despacio, y la tarjeta cuenta desde el número del primer tramo hasta el total. Dos clases distintas son dos barras de textura distinta, una debajo de la otra, que rebotan al intentar apoyarlas en fila.
- `symbolic`: `3 🍎` y `2 🍎` como pares de fichas, y `5 🍎` después de la fusión.
- `formal`: la definición corta con voz y el libro al lado.

No hay ningún signo entre las dos barras, ni recta graduada debajo. Esa ausencia de recta es la diferencia dibujada con `arith.add.displacement`, donde el mismo total sí es un lugar al que se llegó.

## Transición simbólica

Cuatro pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Fila de frutas → barra con marcas: al juntar dos renglones completos por primera vez en `concrete`, las frutas se aplanan en marcas y el renglón se vuelve una barra con su tarjeta al inicio.
2. Tarjeta sobre el renglón → conteo delante de la fila: al tocar la barra, la tarjeta se desprende de arriba y se planta a la izquierda del primer tramo, del tamaño de una ficha. El renglón se lee de izquierda a derecha: primero cuántos, después de qué. Es la etapa `tally` de la mecánica.
3. Barra con marcas → conteo y clase: cuando el renglón pasa de las nueve frutas, las marcas se atenúan hasta desaparecer y queda `3 🍎`. Mantener tocada la ficha devuelve las marcas.
4. Dos renglones que se funden → un solo conteo: al soltar un renglón sobre otro de la misma clase, las dos tarjetas se acercan, la de arriba se desvanece dentro de la de abajo y el número sube hasta el total con un morph; los dos dibujos de fruta se funden en uno.

**No aparece el `+`**, y es la decisión de notación más importante del minijuego. El `+` nace en `arith.add.displacement` con su propio problema; acá el gesto de juntar todavía se ve. Si el jugador ya trae el signo de ese nodo, el juego lo escribe entre las dos fichas al fundirlas, como un reencuentro: el mismo signo, la segunda cara.

## Concepto formal

Lo que queda al final, como voz sobre el libro, sin texto escrito porque el nodo es `literacy: none`: juntar dos montones de la misma clase da un montón cuyo conteo es el de uno seguido del otro; el orden en que se juntan no cambia el conteo final; dos montones de clases distintas no se juntan en una fila, quedan dos filas. Casos verificados sobre el objeto: juntar con el montón vacío no cambia nada; tres montones se pueden agrupar de cualquier manera; un montón no se junta consigo mismo, porque sus frutas ya están en el renglón. La notación nueva es el conteo escrito delante de la fila, nacido del problema de que una fila de nueve o más no entra en la pantalla y no se puede llevar a otro libro. Las dos entradas de cheatsheet, `cs.arith.add_as_join_groups` y `cs.arith.join_only_like_groups`, quedan como imagen con voz.

## Generalización

La fruta se retira en `symbolic`, cuando el renglón ya es `3 🍎` y el dibujo de la manzana no hace más que decir de qué clase es. En ese punto la clase se puede marcar con cualquier cosa, y el minijuego lo aprovecha para cambiarla.

Variantes sin ayuda visual: conteos mayores que la fila que entra en pantalla; el montón vacío; tres y cuatro montones con hasta tres clases mezcladas, donde el jugador decide cuántas filas hay antes de juntar nada; y los mismos montones pedidos en distinto orden. Después, clases arbitrarias: filas de marcas de colores, filas de siluetas que solo se distinguen por el contorno, filas cuya clase es una etiqueta muda que el jugador nunca vio. Cuando junta filas de clases que no reconoce, decide cuántas filas hacen falta antes de tocar nada y trata el conteo como una ficha que opera, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): la etapa 1 del ejemplo B (tres manzanas y un total) supone este nodo entero; el morph de la etapa 3, donde la manzana se vuelve `x` sin desaparecer de golpe, es el paso 3 de la transición simbólica de acá con una letra en lugar de una fruta.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Un renglón por montón.** `concrete`, `manipulate`. Dos montones de la misma clase, dos renglones, las tarjetas que cuentan con cada tic. Solo llenar. Conteos de 1 a 5.
2. **Los dos se funden.** `concrete`, `manipulate` y `recognize`. Aparece el gesto de soltar un renglón sobre otro y la tarjeta que sigue desde su número. Mismos conteos.
3. **Manzanas y peras.** `concrete`, `explain`. Mismos conteos; aparecen las clases mezcladas y el renglón que se parte. Aparece `unlike_units_joined`.
4. **El renglón vacío.** `concrete`, `apply`. Aparece el montón sin nada, con su tarjeta en cero. Mismos rangos.
5. **Conteo y clase.** `symbolic` primera mitad, `manipulate` y `apply`. Las marcas se resumen en `3 🍎`; la fila se pide manteniendo tocada la ficha. El libro se transforma en sincronía con las fichas.
6. **Cuatro montones.** Parámetros: conteos hasta 20, cuatro montones y hasta tres clases mezcladas, orden de armado libre.
7. **Clases que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; filas de etiquetas mudas y de siluetas sin nombre.

Qué endurece cada parámetro: el conteo obliga a confiar en la tarjeta en vez de reconocer la fila de un vistazo; la mezcla de clases obliga a decidir cuántas filas hay antes de juntar; el montón vacío rompe la lectura "juntar siempre agranda"; el orden libre comprueba que el jugador no está siguiendo una receta; las etiquetas mudas separan la estructura de las cosas.

Desafíos de olimpíada: el nodo participa en `ch.arith.covered_row_count` de [S](../S-desafios/S0-desafios.md), donde una tira tapa parte de una fila y el total sale de juntar los grupos visibles con el escondido. Su entrada `cs.arith.add_as_join_groups` ya figura entre las que ese desafío destaca de entrada.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: un libro con `4 🍎` y `3 🍎` y tres tarjetas (`7`, `4`, `8`); tocar la que le corresponde a la fila juntada. Distractores: el conteo de la fila más larga y uno de más.
- `explain`: dos animaciones sobre el mismo libro con seis y tres manzanas; en una las filas se funden y la tarjeta llega a nueve, en la otra se funden y queda en seis. Tocar la que miente. El distractor elegido clasifica como "quedarse con el montón más grande", que no tiene entrada en el catálogo.
- `manipulate`: `5 🍎` y `4 🍎`; arrastrar una fila sobre la otra y ver el contador subir de a uno desde cinco.
- `apply`: tres montones desparramados (seis manzanas, cuatro manzanas, cinco peras); armar el libro y arrastrar la tarjeta de la fila más larga, contra el tiempo objetivo del nodo.
- `generalize`: cuatro montones de piedras y conchas, uno de ellos vacío; juntar por clase y comprobar que el vacío no mueve ninguna tarjeta.
- `transfer`: en la red de islas de `graph.deg.handshake_lemma`, juntar la fila de puentes de una isla con la de otra y arrastrar la tarjeta del total.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `unlike_units_joined`, patrón `replay_on_mechanic` sobre `ledger`: el gesto se repite en cámara lenta, las frutas de dos clases entran en el mismo renglón, el renglón se parte y un halo marca la fruta que no pertenecía. Voz: "Esa fila quedó con dos clases de cosas. ¿Cuántas hay de cada una?". El renglón partido es válido y el jugador sigue desde ahí. Es la de mayor severidad del nodo y la única que clasifica.

Sin entrada en el catálogo, y por eso sin clasificar ni bloquear `ready`: recontar desde uno después de juntar (la tarjeta del primer renglón late antes de la fusión, como empujón suave) y quedarse con el montón más grande (el juego reproduce la fusión con las marcas contadas por el tic y muestra que la barra final es más larga que las dos).

Los distractores de `explain` y las opciones de `apply` se generan desde la regla `detect` de `unlike_units_joined` y desde estos dos patrones.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `ledger_two_rows_become_one`, nativa. Dos renglones de la misma clase que se apoyan uno en el final del otro con un retardo corto por objeto, el cambio de tono entre los dos tramos que se atenúa y la tarjeta que cuenta desde el conteo del primer tramo; gramática `partition`. Parametrizada por las dos cantidades, produce la mecánica de los niveles 1, 2, 4, 5 y 6, las dos animaciones de `explain` y los ítems de `recognize`.
- `ledger_unlike_rows_stay_apart`, nativa. Las frutas de dos clases entran en el mismo renglón, se mezclan un instante y el renglón se parte en dos con un rebote corto, cada mitad con su tarjeta; parametrizada por las dos cantidades y la lista de clases. Es la escena de los niveles 3 y 7, del replay de `unlike_units_joined` y de los ítems de `apply` con clases mezcladas.
- No hay clips pre-renderizados: las dos escenas son la mecánica misma. El conteo lo dibuja el runtime; las frutas son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_ledger_rows`: `piles` (cantidad de montones: 2 en los niveles 1 a 4, 3 en el 5, hasta 4 desde el 6); `counts` (de 1 a 5 hasta el nivel 4, de 3 a 12 en el 5, hasta 20 desde el 6); `empty_pile` (habilita el montón sin nada, falso hasta el nivel 3); `join_order` en {fixed, free} (`free` desde el nivel 6); `seed`.
- `gen_kind_mix`: `kinds` (cantidad de clases distintas: 1 hasta el nivel 2, 2 en los niveles 3 a 5, hasta 3 desde el 6); `kind_labels` en {fruit, color_mark, silhouette, mute} (`mute` solo en el nivel 7); `lying` (cuál de las dos animaciones de `explain` altera el conteo final).
- `gen_object_set`, reusado del nodo 1: `skin` en {fruit, pebble, shell, mark} (solo fruit hasta el nivel 5); `size_variance` (cero siempre en este nodo, porque el tamaño no es lo que se estudia acá); `count`.

**Literacy soportada:** de `none` a `full_text`. Todos los niveles se juegan sin leer: el conteo es un dibujo y la clase es un ícono, no texto. En `full_text` la definición corta del nivel 7 se muestra escrita además de narrada, y nada más cambia.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra las frutas del primer montón al primer renglón de a una con su tic, hace lo mismo con el segundo, y después toma el segundo renglón entero y lo suelta sobre el primero: se funden con un chasquido y la tarjeta sigue contando desde donde estaba. Repite una vez y desaparece; la escena vuelve al inicio y la primera fruta late. La demostración de llenar un renglón de a una fruta no se repite: es la del nodo 1. La del renglón que se parte (nivel 3) es nueva y se muestra una vez ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
