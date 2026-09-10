# 46 — Juntar dos montones (`arith.add.combine_groups`)

> Locale `es`: "Juntar dos montones". Minijuego: [Dos montones, un renglón](../../F-minijuegos/arith.add.combine_groups.md).

**Nodo:** `arith.add.combine_groups` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `partition` · **Mecánica principal:** `ledger` · **Literacy:** `none` · **Analogía:** `fruit_ledger`

## 1. Concepto

Juntar dos montones de la misma clase da un montón cuyo conteo es el de uno más el del otro, y **solo se juntan montones de la misma clase**. Al terminar, el jugador anticipa el conteo del montón junto sin volver a contar desde uno, sabe que el resultado no cambia si junta al revés ni si junta de a partes, y ante dos montones de clases distintas arma dos filas con su propio conteo en vez de una sola. Antes tenía un número por colección; ahora tiene una operación que combina dos colecciones y devuelve una.

## 2. Prerequisitos

- `found.count.cardinality` (nodo 1): el número de una colección. Se usan tres cosas suyas. La fila del libro de cuentas, que acá deja de ser una fila auxiliar para comparar y se vuelve el objeto que se opera. La tarjeta que representa a la colección entera, que acá se pega al principio de la fila y se convierte en el conteo escrito. Y el invariante de que reordenar no cambia la cantidad, que es lo que hace legítimo juntar: si mover cosas cambiara el conteo, juntar dos montones no tendría un resultado.

Es el único prerequisito del YAML, y la arista se aparta del orden escolar en un punto que conviene decir con todas las letras. La escuela enseña "la suma" una sola vez y mezcla dos cosas: **juntar** dos colecciones y **avanzar** desde una posición. Mathy las separa en dos nodos de espina distintos con dos primitivas distintas. Este nodo es `partition`: dos partes que se vuelven un todo, sin recta, sin orden y sin dirección. `arith.add.displacement` (nodo 3) es `displace`: un punto de partida y un tramo. Ninguno de los dos es prerequisito del otro, y por eso se pueden jugar en cualquier orden.

La separación no es una sutileza. Cada cara sobrevive en un lugar distinto del curriculum. La cara de desplazamiento es la que llega a los negativos, a los vectores y a la constante de integración. La cara de juntar es la que llega a los términos semejantes (`2x + 3x`), al conteo de casos disjuntos y a la suma de grados de un grafo, todos lugares donde no hay ninguna recta y donde "avanzar" no significa nada. Un jugador que solo tiene la pista no sabe qué hacer con dos bolsas que no comparten bolitas; uno que solo tiene el libro no sabe qué hacer con un número negativo.

## 3. Dificultad cognitiva real

Lo difícil no es contar todo de nuevo: eso ya lo sabe hacer desde el nodo 1. Son cuatro capacidades que la palabra "sumar" tapa:

1. **Anticipar el conteo sin recontar.** Quien junta dos filas y vuelve a contar desde uno no está sumando: está contando otra vez. Sumar es partir del conteo que ya tenía una fila y seguir desde ahí. Es la primera vez que un número anterior se usa como punto de partida en lugar de recalcularse.
2. **Entender que la clase es parte del dato.** Tres manzanas y dos peras no son cinco de nada. Son tres de una cosa y dos de otra, y el libro lo dibuja con dos filas. Esta es la capacidad que el nodo desarrolla y que nadie enseña porque parece obvia; es la que falta en `2x + 3y = 5xy` diez años después.
3. **Aceptar que el total no depende de cómo se junte.** Juntar A con B o B con A da lo mismo; juntar tres montones de a dos, en cualquier orden, también. El jugador tiene que dejar de tratar el orden de las acciones como parte del resultado.
4. **Escribir el conteo en vez de dibujar la fila.** Una fila de nueve manzanas no cabe cuando hay cuatro filas, y no se puede llevar a otra mesa. El conteo escrito al principio de la fila hace el mismo trabajo con un dibujo. Es la primera compresión de la notación que el jugador ejecuta con las manos.

Las cuatro son independientes. La segunda es la que este nodo pone en el centro y la que tiene misconception catalogada.

## 4. Problema intuitivo

Una mesa larga después del recreo. Dos chicos vacían los bolsillos: uno saca manzanas, el otro saca manzanas también, y las dejan en dos montones separados. Al costado hay una canasta sola. Alguien pregunta, con voz o con un gesto de duda, cuántas hay para repartir.

En `real` el jugador solo mira: los dos montones se acercan, se mezclan en la canasta y el juego los cuenta de a uno. En `intuition` la escena se detiene antes del final. Los dos montones se van a juntar y tres desenlaces están dibujados: la canasta queda con tantas como el montón más grande; queda con tantas como los dos montones sumados; queda con más que los dos sumados. El jugador elige y después ve. El primer desenlace es el que hay que romper: muchos chicos leen "juntar" como "quedarse con el más grande".

Hay una segunda escena de `intuition`, y es la que da el nombre al nodo. Uno de los chicos saca peras en vez de manzanas. Los dos montones se acercan a la canasta y dos desenlaces se dibujan: la canasta queda con una sola cuenta, o queda partida en dos con dos cuentas. El jugador elige y después ve.

## 5. Analogía del mundo real

`fruit_ledger` ([G0](../../G-analogias/G0-reglas.md)), sobre la mecánica `ledger`. Mapa: tipo de fruta → unidad; montón de un tipo → término; fila del libro → término escrito; juntar dos montones del mismo tipo → suma; tarjeta con número al principio de la fila → conteo, y más tarde coeficiente; dos filas que no se pueden juntar → términos no semejantes.

Invariante que conserva: el total de un tipo de fruta no cambia cuando las frutas se reagrupan, y dos montones del mismo tipo se juntan en uno cuyo conteo es la suma de los dos. Es exactamente lo que conserva la suma como unión de colecciones disjuntas, así que el paso 3 del test de G0 pasa sin endurecer nada.

Punto de ruptura: `fruit_times_fruit`. Manzana más manzana es dos manzanas, y el morph a `x + x = 2x` es exacto; manzana por manzana no significa nada, y por eso `x²` no puede nacer acá. Ese borde está lejos de este nodo y por eso la analogía lo acompaña entero hasta `symbolic`.

Por qué esta y no otra. `fruit_bowl_count`, la del nodo 1, también tiene cuencos y frutas, pero su mapa pone en el centro la correspondencia uno a uno y la tarjeta sobre el cuenco entero: sirve para comparar y para contar, no para combinar. El libro de cuentas agrega lo único que este nodo necesita y el cuenco no tiene: **filas por clase**, que es donde vive la restricción de qué se puede juntar con qué. Un chico de cinco años reconoce las dos situaciones sin explicación verbal, como exige G0 para `literacy: none`.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica ([E0](../../E-mecanicas/E0-catalogo.md)), como en `graph.basic.graph_and_paths`: el nodo es su mecánica. `ledger` aporta las filas por clase, el conteo por fila y el invariante de que reagrupar no cambia el total. Gestos: `drag` y `tap`.

1. Un libro de cuentas con dos renglones vacíos, dos montones de fruta sobre la mesa y una tarjeta de conteo apagada al principio de cada renglón.
2. Demostración: una mano fantasma arrastra las frutas del primer montón al primer renglón, de a una, y la tarjeta cuenta con cada una; hace lo mismo con el segundo montón en el segundo renglón; después toma el segundo renglón entero y lo suelta sobre el primero. Los dos renglones se funden con un chasquido, las frutas quedan en una sola fila y la tarjeta sigue contando desde donde estaba, sin volver a cero. Repite una vez y desaparece.
3. El jugador arrastra frutas al renglón. Cada una suena un tic y la tarjeta gana un punto. La zona de drop es el renglón entero.
4. Arrastrar un renglón sobre otro de la misma clase. Se funden. La tarjeta del renglón que recibe **sigue** desde su número: no se apaga y vuelve a contar. Ese detalle es la capacidad 1 de la sección 3 hecha animación.
5. Arrastrar un renglón sobre otro de otra clase. Las frutas entran, se mezclan un instante y el renglón se parte solo en dos, cada mitad con su tarjeta. Nada se llama "incorrecto": el libro simplemente no sabe tener dos clases en un renglón, y lo muestra haciéndolo.
6. Tocar la tarjeta de un renglón. Sus puntos se posan uno sobre cada fruta y vuelven. Es la verificación sin recontar.
7. Desde el tercer nivel aparece el renglón vacío: un montón sin ninguna fruta, con su tarjeta en cero. Juntarlo con otro no cambia nada, y esa nada es visible porque la tarjeta no se mueve.
8. Desde el quinto nivel el libro tiene tres renglones y el jugador elige en qué orden juntarlos. La tarjeta del renglón final es la misma en los seis órdenes posibles, y el juego lo deja comprobar sin decirlo.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md): un todo partido en pedazos sin solapamiento y sin dejar nada afuera, leído al revés, de las partes al todo.

Cada renglón se aplana con un morph continuo en una barra con marcas, una marca por fruta, todas del mismo ancho, con su tarjeta pegada al inicio. Juntar dos renglones es poner una barra a continuación de la otra: los dos tramos siguen distinguibles por un cambio de tono que se atenúa despacio, y la tarjeta del tramo final cuenta desde el número del primer tramo hasta el total. Lo que se conserva es la cantidad de marcas; lo que se desplaza es el segundo tramo, que viaja hasta apoyarse en el final del primero. Nada se escala.

Dos renglones de clases distintas se dibujan como dos barras de textura distinta, una debajo de la otra, y al intentar apoyarlas en fila se separan de vuelta con un rebote corto.

Todavía no hay ningún signo entre las dos barras. Tampoco hay una recta graduada debajo: la barra junta no está apoyada en ninguna posición, y esa ausencia es la diferencia dibujada con el nodo 3, donde el mismo total sí es un lugar al que se llegó.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Fila de frutas → barra con marcas.** La primera vez que el jugador junta dos renglones completos en `concrete`, las frutas se aplanan en marcas y el renglón se vuelve una barra. La tarjeta queda pegada al inicio.
2. **Tarjeta sobre el renglón → conteo delante de la fila.** Al tocar la barra, la tarjeta se desprende de arriba y se planta a la izquierda del primer tramo, del tamaño de una ficha. El renglón se lee ahora de izquierda a derecha: primero cuántos, después de qué. Es la etapa `tally` de la mecánica.
3. **Barra con marcas → conteo y clase.** Cuando el jugador junta un renglón de nueve o más, las marcas se atenúan hasta desaparecer y queda el conteo con un solo dibujo de la fruta al lado. La fila entera se volvió dos fichas: `3 🍎`. Mantener tocada la ficha devuelve las marcas.
4. **Dos renglones que se funden → un solo conteo.** Al soltar un renglón sobre otro de la misma clase, las dos tarjetas se acercan, la de arriba se desvanece dentro de la de abajo y el número de la que queda sube hasta el total con un morph. Los dos dibujos de fruta se funden en uno.

En ningún paso hay dos objetos distintos que se alternan: la manzana con id estable se vuelve marca, las marcas se resumen en el conteo, y el conteo hereda el id de la tarjeta del nodo 1.

## 9. Notación matemática

Queda `3 🍎` y `2 🍎`, y después de juntarlos, `5 🍎`.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), el nodo introduce **el conteo escrito delante de la fila**, y el problema que lo hace necesario es de espacio y de transporte. Mientras haya dos filas cortas, las marcas alcanzan y el conteo es un lujo. El problema aparece en el nivel donde el libro tiene cuatro renglones y cada uno pasa de las nueve frutas: los renglones no entran en la pantalla, y para juntar dos hay que ver los dos enteros. Y aparece de nuevo, más fuerte, cuando el jugador tiene que encargarle a otro libro que agregue "lo mismo que hay en este renglón": la fila no se puede arrastrar, el conteo sí. `3 🍎` es la fila entera dicha con dos dibujos. Es la primera vez que el jugador comprime una representación por su cuenta, y es literalmente el coeficiente: la misma ficha que en `prealg.expr.like_terms` se pone delante de una letra en vez de una fruta.

**No aparece el `+`.** Es la decisión de notación más importante del nodo y hay que sostenerla. El `+` nace en `arith.add.displacement` con un problema propio: mandar dos tramos seguidos a una pista que no está en pantalla. Acá el gesto de juntar todavía se ve —un renglón cae sobre otro— y un signo no agregaría nada que la animación no diga. Los dos nodos son independientes en el grafo, así que un jugador puede llegar a este primero, y en ese caso junta montones sin escribir ninguna operación. Si ya trae el `+` del nodo 3, el juego lo escribe entre las dos fichas al fundirlas, como un reencuentro: el mismo signo, la segunda cara. Tampoco hay igual: el doble trazo de la llegada es del nodo 3 y su significado completo, del nodo 11.

## 10. Definición formal

Capa `formal` como voz sobre el objeto, sin texto escrito, porque el nodo es `literacy: none` ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre el libro que el jugador tiene en pantalla. Juntar dos montones de la misma clase da un montón cuyo conteo es el de uno seguido del otro. El orden en que se juntan no cambia el conteo final. Dos montones de clases distintas no se juntan en una fila: quedan dos filas.

Condiciones y casos especiales, verificados sobre el objeto: juntar con un montón vacío no cambia nada, porque la tarjeta en cero no aporta ningún punto; juntar tres montones se puede hacer agrupándolos de cualquier manera; y un montón no se puede juntar consigo mismo arrastrándolo sobre su propio renglón, porque las frutas ya están ahí y el libro no las cuenta dos veces.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: el caso del montón vacío, que en el libro es un renglón con la tarjeta en cero y llama la atención justamente porque no pasa nada, y la palabra "clase" como nombre de lo que antes era el dibujo de la fruta. Las dos entradas de cheatsheet del nodo, `cs.arith.add_as_join_groups` y `cs.arith.join_only_like_groups`, quedan como imagen con voz.

## 11. Propiedades

- **El orden de los dos montones no cambia el total.** Ligada al gesto de soltar el primer renglón sobre el segundo en lugar del segundo sobre el primero: la tarjeta final es la misma. Es la cara de conjuntos de la propiedad que el nodo 3 muestra como dos tramos de camino.
- **Agrupar tres montones de cualquier manera da el mismo total.** Ligada al octavo paso de la mecánica: seis órdenes posibles, una sola tarjeta final.
- **Juntar con el montón vacío no cambia nada.** Ligada al renglón con la tarjeta en cero. Es el neutro, y el jugador lo siente como un anticlímax antes de que nadie lo nombre.
- **Solo se juntan montones de la misma clase.** Ligada al renglón que se parte solo en dos. Es la propiedad que este nodo aporta al curriculum entero y la que sostiene los términos semejantes, el denominador común y la suma de casos disjuntos.
- **El conteo del montón junto es mayor que el de cada parte, salvo que la otra parte esté vacía.** Ligada a la barra que se alarga. Es lo que conecta con el nodo 45: juntar mueve el montón hacia arriba en el riel.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: un libro con dos filas de la misma clase y tres tarjetas de conteo; tocar la que le corresponde a la fila que resulta de juntarlas. Los distractores se generan con el conteo de la fila más larga y con uno de más.
- `explain`: dos animaciones sobre el mismo libro; en una las filas se juntan y el conteo final es el de las dos sumadas, en la otra queda en el de la fila más larga. Tocar la que miente. Para `literacy: none` este es el formato de todo `explain`.
- `manipulate`: arrastrar una fila sobre la otra hasta que se funden; el contador de la fila nueva sube de a uno mientras las cosas entran.
- `apply`: tres montones desparramados, uno de ellos de otra clase; armar el libro y arrastrar la tarjeta con el conteo de la fila que quedó más larga, contra el tiempo objetivo del nodo.
- `generalize`: las clases cambian a piedras y conchas, y aparece un montón vacío; juntar igual y comprobar que el vacío no cambia el conteo.
- `transfer`: en una red de islas, juntar la fila de puentes de una isla con la de otra y arrastrar la tarjeta del total.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`unlike_units_joined`**, patrón `replay_on_mechanic` sobre `ledger`. El jugador arrastra un renglón de manzanas sobre uno de peras y espera una sola tarjeta, o en la capa de fichas junta `3 🍎` con `2 🍐` en `5` de algo. El juego congela y repite el gesto en cámara lenta: las frutas entran en el mismo renglón, se mezclan, y el renglón se parte solo en dos con un halo sobre la fruta que no pertenecía. Voz: "Esa fila quedó con dos clases de cosas. ¿Cuántas hay de cada una?". El renglón partido es un estado válido y el jugador sigue desde ahí. Es la de mayor severidad del nodo, y su regla `detect` es la que alimenta los distractores de `explain` y de `apply`.

Errores que el diseño prevé y que no tienen entrada en el catálogo, y por eso no clasifican ni bloquean `ready`:

- **Recontar desde uno.** El jugador junta las filas y vuelve a tocar cada fruta. No es un error de resultado, así que el juego no lo interrumpe: cuando ocurre varias veces, la tarjeta del primer renglón late antes de la fusión, como empujón suave para que arranque desde ese número.
- **Quedarse con el montón más grande.** Es el distractor de `explain` y el primer desenlace de `intuition`. Si el jugador lo elige, el juego reproduce la fusión con las marcas contadas por el tic y muestra que la barra final es más larga que las dos.

## 13. Generalización

La analogía se retira en `symbolic`, como declara la entrada de G. La fruta se va cuando el renglón ya es `3 🍎` y el dibujo de la manzana no hace más que decir de qué clase es; en ese punto la clase se puede marcar con cualquier cosa, y el juego lo aprovecha para cambiarla.

Variantes sin ayuda visual, en orden: conteos mayores que la fila que entra en pantalla; el montón vacío; tres y cuatro montones con clases mezcladas, donde el jugador tiene que decidir cuántas filas hay antes de juntar nada; y los mismos montones pedidos en distinto orden, para comprobar que no está leyendo un dibujo memorizado.

Clases arbitrarias. El nodo termina con filas cuya clase no es un objeto: filas de marcas de colores, filas de siluetas que solo se distinguen por el contorno, y filas donde la clase es una etiqueta muda que el jugador no vio nunca. Se evalúa que la estructura —dos montones de la misma etiqueta se juntan en uno cuyo conteo es la suma; dos de etiquetas distintas quedan separados— se reconoce sin saber qué son las cosas.

El nodo está en `abstract` cuando el jugador junta filas de clases que no reconoce, decide cuántas filas hacen falta antes de tocar nada y trata el conteo como una ficha que opera, sin volver a las marcas. La forma completa de esa capa aparece mucho después, cuando las filas son las potencias de una letra y los conteos son los coeficientes de un polinomio.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área:

- `prealg.expr.like_terms` (`ledger`, `sorter`): las filas ya no son de fruta sino de cajas cerradas y de unidades sueltas, y juntar dos filas de cajas es escribir `2x + 3x = 5x`. La restricción de clase es la misma restricción, con letras. Es la continuación directa y la que muestra que este nodo no era sobre fruta.
- `disc.count.sum_rule` (`ledger`, `urn_dice`): dos bolsas de bolitas que no comparten ninguna; la cantidad de la bolsa juntada es la de una más la de la otra. Acá aparece la condición que el libro daba gratis y que en conjuntos hay que pedir: si una bolita está en las dos bolsas, se cuenta dos veces.
- `graph.deg.handshake_lemma` (`network_routes`, `ledger`): una fila por isla con sus puentes, y el total de todas las filas. Cada puente aparece en dos filas, así que la suma da el doble de los puentes. Es el mismo libro con la misma pregunta y una sorpresa: las filas no siempre son disjuntas.

Concepto siguiente: `arith.place.base_ten_carry` ([`arith.place.base_ten_carry`](../../C-knowledge-graph/graph/arith.yaml), fuera de la espina). Frase puente, narrada sobre el último renglón junto: "Este renglón llegó a diez y ya no entra. ¿Y si en vez de diez marcas ponemos una sola, de otro tamaño?". Diez marcas del renglón se funden en una sola marca más grande que salta al renglón de arriba, y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `ledger_two_rows_become_one` es la mecánica renderizada sobre el estado del jugador: dos renglones de la misma clase que se apoyan uno en el final del otro con un retardo corto por objeto, el cambio de tono entre los dos tramos que se atenúa, y la tarjeta que cuenta desde el conteo del primer tramo hasta el total en vez de arrancar en cero; gramática `partition`, parametrizada por las dos cantidades, produce la mecánica de casi todos los niveles y las dos animaciones de `explain`. `ledger_unlike_rows_stay_apart` es el invariante rompiéndose: las frutas de dos clases entran en el mismo renglón, se mezclan un instante y el renglón se parte en dos con un rebote corto, cada mitad con su tarjeta; parametrizada por las dos cantidades y por la lista de clases, produce el replay de `unlike_units_joined` y los ítems de `apply` con clases mezcladas. Ninguna lleva texto rasterizado: el conteo lo dibuja el runtime y las frutas son assets propios sin texto ([P](../../P-internacionalizacion.md)).

**Calculadora:** el nodo **no habilita ninguna operación** en `ready`, y la ausencia es deliberada ([M](../../M-calculadora/M0-progresion.md)). La tecla que le correspondería es `op_add`, y esa tecla dibuja `a + b`: un signo que este nodo no introduce, por la razón de la sección 9. La tecla llega con `arith.add.displacement`, que es el nodo donde el `+` nace, y desde ese momento muestra las dos caras: tocándola sobre dos fichas dibuja los dos tramos sobre la pista, y manteniéndola apretada dibuja los dos renglones que se funden. Ese segundo dibujo es lo que este nodo aporta a una tecla que no abre.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que arrastra un renglón sobre otro, los targets son frutas y renglones del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada, porque el tic por fruta, el chasquido de la fusión y el rebote del renglón que se parte dicen lo mismo. Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra en el nivel donde los renglones ya son conteo y clase, y usa el teclado de fichas para la tarjeta del total en vez de arrastrarla.
