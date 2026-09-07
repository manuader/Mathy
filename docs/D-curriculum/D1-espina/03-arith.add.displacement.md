# 03 — Sumar es avanzar en la pista (`arith.add.displacement`)

> Locale `es`: "Sumar es avanzar en la pista". Minijuego: [La manivela y la tarjeta](../../F-minijuegos/arith.add.displacement.md).

**Nodo:** `arith.add.displacement` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundaria `ledger`) · **Literacy:** `none` · **Analogía:** `number_line_walk` · **Capas:** las ocho (el YAML no acota `layers`)

## 1. Concepto

Sumar es desplazarse: partiendo de una posición, sumar `n` es dar `n` pasos y quedarse donde se cae. Al terminar, el jugador anticipa la piedra de llegada sin recorrerla, sabe que dar los dos saltos en cualquier orden termina en el mismo lugar y lee el mismo número de dos maneras que no se contradicen: como el tamaño de un montón y como el lugar de una piedra. Antes sabía dónde vive cada número; no sabía combinar dos.

## 2. Prerequisitos

- `found.count.number_line` (nodo 2): la fila con paso uniforme. Se usa entera: la manivela que da una piedra por vuelta, el clic, la huella de las piedras pisadas, la ficha apoyada sobre una marca y el invariante `same_step_every_turn`, que es lo que hace que "tres pasos" signifique siempre lo mismo desde cualquier piedra.

Por el nodo 2 llega también, transitivamente, la cardinalidad del nodo 1, y este nodo la necesita de verdad: la mecánica secundaria `ledger` junta dos montones y cuenta el resultado, y esa es la otra lectura de la suma. La arista directa no existe en el YAML porque el nodo 2 ya la trae, pero el diseño usa las dos cosas.

## 3. Dificultad cognitiva real

Lo difícil no es dar los pasos. Son cuatro capacidades:

1. **No volver a empezar.** Sumar tres a siete es partir del siete, no contar diez desde la orilla. Es la capacidad que separa contar de sumar, y el jugador que no la tiene se delata porque devuelve el caminante al principio antes de cada suma.
2. **Sostener las dos lecturas del mismo número.** El `5` de la ficha del paso es una cantidad de vueltas; el `5` de la piedra es un lugar. La suma las pone en la misma expresión y el jugador tiene que aceptar que conviven. `ledger` sostiene la lectura de cantidad y `gears_sequence` la de posición, y por eso el nodo tiene las dos mecánicas.
3. **Entender qué dice el signo de igual.** La expresión no es una orden de calcular sino la afirmación de que dos maneras de decir la posición nombran la misma piedra. Falla en `equals_as_operator`, la primera misconception catalogada que el jugador se cruza en la espina.
4. **Anticipar en vez de ejecutar.** Predecir la piedra de llegada antes de girar es lo que convierte la mecánica en aritmética. Mientras el jugador tenga que girar para saber, no está sumando: está caminando.

## 4. Problema intuitivo

La misma pista de piedras del nodo anterior, con el caminante ya parado en una piedra cualquiera —no en la orilla— y la manivela abajo. Al lado de la manivela aparece por primera vez una tarjeta que dice cuántas vueltas dar, con puntos antes que con dígitos.

La pregunta, por voz o por gesto: si el caminante está acá y le pedimos estos pasos, ¿en qué piedra termina? ¿Hace falta volver a la orilla para saberlo?

En `intuition` la escena se congela con el caminante a mitad del primer salto y tres desenlaces dibujados: termina en la piedra que corresponde; termina contando desde la orilla, o sea más atrás; termina una piedra antes, por haber contado la de partida como primer paso. El jugador elige y después ve. En una variante hay dos tarjetas seguidas y los desenlaces las aplican en distinto orden: llegan al mismo lugar, y eso también se predice antes de verlo.

## 5. Analogía del mundo real

`number_line_walk`, la misma del nodo 2, declarada sobre `slope_walker` en el catálogo ([G0](../../G-analogias/G0-reglas.md)). Mapa de estructura: piedra → entero; posición del caminante → valor; un paso → incremento de una unidad; orden de las piedras → orden de los números; piedra de partida → cero. Este nodo agrega una lectura que el mapa ya permitía y que el nodo 2 no usó: **un tramo de pista recorrido es un sumando**, y el tramo se puede dibujar como una flecha que va de la piedra de salida a la de llegada.

Reusar la analogía en vez de estrenar una es deliberado y es lo que hace que la suma no parezca un tema nuevo. El invariante es el mismo paso uniforme, y por eso la flecha de "tres pasos" mide siempre lo mismo, la dibujen donde la dibujen. El punto de ruptura también es el mismo, `position_between_stones`, más un segundo que este nodo empieza a rozar: la pista tiene orilla, así que restar más de lo que hay todavía no es una acción posible. Eso es de `arith.int.negatives`.

`ledger` trae su propia piel, la de los montones que se juntan, y el catálogo la registra aparte. Las dos conviven porque describen la misma suma desde lugares distintos: la pista dice dónde se termina, el libro dice cuántos hay. La sección 11 usa cada una para una propiedad distinta.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `gears_sequence` es la principal y provee la herramienta, el paso uniforme; `ledger` es la secundaria y provee el invariante, `count_preserved_under_regrouping`, que es lo que hace que juntar dos montones en cualquier orden dé el mismo montón ([E0](../../E-mecanicas/E0-catalogo.md)). Se encuentran en un gesto: cada vuelta de manivela deja una marca en el libro de cuentas que está al costado de la pista, así que el mismo movimiento adelanta al caminante y llena una fila. Gestos: `drag`, `scrub` y `tap`.

1. Pista, caminante en una piedra cualquiera, manivela con su tarjeta y, al costado, el libro de cuentas con una fila vacía.
2. Demostración: la mano fantasma gira tantas vueltas como puntos tiene la tarjeta. El caminante salta con cada clic, la flecha del tramo se dibuja detrás de él y el libro marca un tic por vuelta. Al terminar, la piedra de llegada se ilumina y la tarjeta se apoya sobre la flecha.
3. El jugador gira. Si suelta antes de completar, la flecha queda corta, la tarjeta no se apoya y los puntos que faltan quedan apagados. Si gira de más, sobra flecha del otro lado; volver hacia atrás la recorta.
4. Dos tarjetas seguidas: el jugador elige cuál aplicar primero y las flechas se encadenan punta con cola. Cambiar el orden y repetir las dibuja al revés y el caminante cae en la misma piedra; las dos cadenas quedan superpuestas en gris.
5. Desde el segundo nivel la predicción reemplaza al giro: el jugador toca la piedra de llegada y la manivela gira después. Si tocó otra, el caminante pasa por encima sin detenerse y el tramo entre las dos queda marcado.
6. En el libro, arrastrar una fila sobre otra las funde y la cuenta de la fila junta aparece sola. Es la misma suma sin pista.

Nada se llama "incorrecto". Cada desvío tiene su consecuencia física; la única que además dispara un patrón está en la sección 12.

## 7. Representación visual

Capa `visual`, con `displace` dominante y `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

`displace`. La pista se contrae en marcas equiespaciadas y el caminante en un punto. El sumando deja de ser "girar" y se vuelve una **flecha** apoyada sobre la línea, que empieza donde estaba el punto y termina donde cae. Lo que se desplaza es el punto; lo que se conserva es la longitud de la flecha: al arrastrarla, la flecha mantiene su tamaño y se puede soltar en cualquier lugar de la línea, y siempre cubre la misma cantidad de marcas. Dos flechas encadenadas punta con cola se pueden fundir en una sola con un pellizco, y la flecha resultante es la que lleva del principio al final. Nada se escala.

`partition`. Al costado, el libro de cuentas dibuja cada sumando como una barra de marcas y la suma como las dos barras pegadas de punta. La barra pegada es tan larga como la flecha fundida, y el juego lo muestra alineándolas una sobre otra: dos dibujos del mismo hecho.

Todavía no se muestran flechas hacia la izquierda, ni piedras a la izquierda de la orilla, ni ninguna operación que no sea juntar.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador. A diferencia de los nodos 1 y 2, este nodo sí llega a `symbolic`: es el primero de la espina que tiene dos números que combinar y, por lo tanto, el primero que tiene algo que escribir.

1. **Piedra → marca, caminante → punto.** Heredado del nodo 2 y sin demostración nueva: la primera vez que el jugador estira la pista, el agua se va.
2. **Tramo → flecha.** Al terminar el primer recorrido en `visual`, la huella de las piedras pisadas se afina en una flecha que va de la salida a la llegada. La tarjeta de puntos se apoya sobre la flecha y se contrae en un dígito: la flecha queda etiquetada con `3`.
3. **Flecha con etiqueta → ficha `+ 3`.** Cuando el jugador arrastra una flecha etiquetada y la suelta en otro punto de la línea, la flecha se afina hasta ser una ficha y el signo aparece pegado al número: `+ 3`. El operador nace acá, y nace del gesto de mover un tramo sin cambiarlo de tamaño.
4. **Punto de salida → ficha de número.** Al aplicar por primera vez una ficha `+ 3` sin girar la manivela, la posición de salida se contrae en su propia ficha y queda la expresión `7 + 3` sobre la línea, con la flecha todavía dibujada debajo.
5. **Llegada → la misma posición escrita dos veces.** Al soltar la ficha, la piedra de llegada se ilumina y su número se despega hacia el renglón, unido a la expresión por el signo de igual: `7 + 3 = 10`. La línea queda debajo y sincronizada; tocar el `10` del renglón ilumina la marca, y tocar la marca ilumina el `10`.

En `formal` la línea pasa a pedirse con un toque y la expresión se queda sola; en `abstract` no hay línea.

## 9. Notación matemática

Queda `7 + 3 = 10`, y debajo, a demanda, la línea con la flecha.

**El símbolo que este nodo introduce es `+`.** El problema que lo hace necesario está en la mecánica y el jugador lo siente antes de verlo: una vez que las flechas se pueden arrastrar y soltar en cualquier parte de la línea, hay que poder decir *cuál* flecha es sin dibujarla. Un tramo dibujado ocupa lugar, se pisa con otro y no se puede guardar en el libro; una ficha que dice "avanzar tres" viaja, se apila y se reusa. `+ 3` es el nombre corto de un tramo, igual que en el nodo 1 el `5` era el nombre corto de un montón.

El signo de igual aparece en este nodo pero el nodo **no lo introduce**. Su historia —registrar que dos platos están equilibrados sin dibujar la balanza— pertenece a `prealg.eq.balance`, según la tabla de la regla de oro de [H](../../H-progresion-abstraccion.md), y este nodo no la puede contar. Lo que hace acá es lo mínimo honesto: el igual es la marca de que la piedra de llegada tiene dos nombres, `7 + 3` y `10`, y el juego la escribe en los dos órdenes con la misma frecuencia, `7 + 3 = 10` y `10 = 7 + 3`, y a veces con el hueco a la izquierda. Que el símbolo llegue antes que su historia es exactamente lo que siembra `equals_as_operator`, y por eso la misconception está declarada acá y no solo en el nodo 11.

Las dos entradas de cheatsheet del nodo se agregan cuando alcanza `symbolic` por primera vez ([R](../../R-cheatsheet/R0-cheatsheet.md)): `cs.arith.add_as_step_forward`, con la flecha sobre la línea, y `cs.arith.add_order_irrelevant`, con las dos cadenas de flechas superpuestas.

## 10. Definición formal

Capa `formal`: texto corto con voz y la línea al lado, tres frases de a una. "Sumar es avanzar: sumar tres es dar tres pasos hacia adelante." "El resultado es la posición donde se cae." "Dar dos saltos en cualquier orden termina en el mismo lugar."

Condiciones y casos especiales, verificados sobre el objeto: sumar cero no mueve al caminante, y la flecha de cero es un punto —lo que conecta con `found.count.zero_as_empty`—; los dos sumandos pueden intercambiarse; tres saltos se pueden agrupar de a dos de cualquier manera y la flecha fundida es la misma; y hay un caso que este nodo deja abierto a propósito, el de retroceder más allá de la orilla, que no tiene piedra donde caer. Esa falta es el problema de `arith.int.negatives`.

Ya jugado: las tres frases enteras, en `concrete`. Nuevo: la palabra "suma" para nombrar el resultado, y el caso del cero, que el jugador nunca tuvo motivo de probar.

## 11. Propiedades

- **Sumar es desplazar y el resultado es una posición.** Ligada a la flecha que se arrastra sin cambiar de tamaño y cae donde cae.
- **El orden de los sumandos no cambia el resultado.** `a + b = b + a`. Ligada a las dos cadenas de flechas superpuestas en gris, que terminan en la misma marca. Es la propiedad de `cs.arith.add_order_irrelevant` y la sostiene mejor el libro que la pista: dos montones juntados en cualquier orden dan el mismo montón, que es `count_preserved_under_regrouping`.
- **Agrupar de otra manera no cambia el resultado.** `(a + b) + c = a + (b + c)`. Ligada al pellizco que funde dos flechas encadenadas: se puede fundir el primer par o el segundo, y la flecha final es la misma.
- **Sumar cero deja todo igual.** Ligada a la flecha de longitud cero, que es un punto y no mueve al caminante.
- **Sumar es reversible, y esa vuelta todavía no tiene nombre.** Ligada a la manivela hacia atrás, que el jugador ya usa desde el nodo 2 para corregirse. Es la única propiedad del nodo que se enuncia y no se cierra: la recoge [`arith.sub.undo_add`](04-arith.sub.undo_add.md).

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), a partir de las probes del locale.

- `recognize`: el caminante en una piedra y una ficha con un número. Tocar la piedra de llegada antes de que la manivela gire. Los distractores son la piedra que sale de contar desde la orilla y la que sale de contar la de partida como primer paso.
- `explain`: dos animaciones sobre la misma pista. En una el caminante avanza y la ficha de igual aparece cuando el paso termina, sobre la piedra de llegada; en la otra el igual funciona como botón y el caminante salta al final sin recorrer el tramo. Tocar la que confunde el igual con una acción. El distractor es la misconception del nodo, así que un error acá también clasifica.
- `manipulate`: girar la manivela las vueltas exactas que muestra la ficha y ver el libro anotar cada paso. La fila y la flecha crecen juntas.
- `apply`: dos fichas seguidas; avanzar primero una y después la otra, y tocar la ficha única que hubiera hecho el mismo viaje de un solo giro. Contra el tiempo objetivo del nodo.
- `generalize`: la pista pierde los dibujos y quedan marcas; después queda solo el renglón. El jugador arrastra la ficha del resultado sin ver al caminante; puede pedir la línea, pero llega sin ella.
- `transfer`: sobre la grilla de `linalg.vec.vector_as_displacement`, encadenar dos flechas punta con cola y tocar dónde termina el viaje. La flecha es la misma; lo que cambia es que ahora hay dos direcciones.

**Misconception esperada y su patrón** ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`equals_as_operator`**, categoría conceptual, patrón `replay_on_mechanic`. Se detecta cuando el jugador lee la expresión como una orden de calcular y pone el total donde va otra cosa: frente a `3 + 5 = □ + 2` escribe `8`, o frente a `□ = 4 + 6` espera que algo pase a la izquierda. El juego no borra nada: reproduce los dos recorridos sobre la misma pista, cada uno desde su punto de partida, y el que armó el jugador termina dos piedras más allá que el otro. El estado sigue siendo válido —son dos viajes que no llegan al mismo lado— y el control vuelve con las dos flechas dibujadas. La narración es `misconceptions.equals_as_operator.prompt`; el texto catalogado hoy está escrito para la balanza del nodo 11 y habla de platos, que en esta pista no existen.

Un movimiento válido pero inútil —la ficha `+ 0`, girar adelante y atrás lo mismo— no rompe ningún invariante y recibe un empujón suave.

## 13. Generalización

La analogía se retira en dos tiempos. La pista de piedras se va en `visual`, como en el nodo 2. La línea con flechas se retira en `symbolic`: cuando la ficha `+ 3` se aplica sin mirarla, la línea sobra, y con dos fichas seguidas estorba porque hay que dibujar tres flechas para escribir un renglón. Queda como fantasma a demanda hasta `formal`, porque representa estructura y no un nombre, que es el criterio de [H](../../H-progresion-abstraccion.md).

Variantes sin ayuda visual, en orden: sumandos mayores, donde recorrer de a un paso deja de ser viable; el hueco en el primer sumando (`□ + 5 = 12`), que obliga a leer la expresión y no a ejecutarla; el hueco a la izquierda del igual (`12 = □ + 5`); y tres sumandos, donde el jugador elige el agrupamiento y descubre que hay uno que le conviene. Después, desplazamientos que no son numéricos: dos casilleros en un tablero de colores, dos lugares en una fila de personas, dos marcas en un dial. La estructura —una posición, un tramo, otra posición— es la misma, y el orden de dos tramos no importa en ninguna.

El nodo está en `abstract` cuando el jugador resuelve todo eso sin pedir la línea, arma el renglón con el hueco de cualquier lado y reconoce la suma como composición de desplazamientos sobre objetos que no son números. La forma completa de esa capa está en `linalg.vec.span_and_combination`, donde componer desplazamientos es todo lo que hay.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no fue la de aprender:

- `linalg.vec.vector_as_displacement` (`gears_sequence` con dos manivelas): la flecha se despega de la línea y se mueve por el plano; encadenar dos punta con cola es sumar, y el resultado no depende del orden, igual que acá.
- `geom.angle.turn_as_measure` (`gears_sequence` sobre un dial): sumar ángulos es encadenar giros. La pista no tiene extremos, así que el resultado puede volver al principio.
- `graph.path.shortest_path` (`network_routes`): la longitud de un camino es la suma de los tramos, y el tramo ya no es una flecha sobre una línea sino un puente entre dos islas.

Concepto siguiente: `arith.sub.undo_add` ([04](04-arith.sub.undo_add.md)). Frase puente, narrada sobre la flecha recién dibujada: "El caminante avanzó tres y quedó acá. Alguien tiene que devolverlo exactamente a la piedra de donde salió, y la flecha ya se borró. ¿Cuántos pasos hay que darle?". La flecha se desvanece dejando solo las dos piedras, la de salida marcada con un contorno, y el nodo 4 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `gear_step_forward_adds` es nativa y se dibuja sobre el estado del jugador: la manivela gira, el punto avanza y la flecha del tramo crece detrás con su etiqueta; gramática `displace`, parametrizada por la posición de partida y el paso. Produce también las dos animaciones de `explain`, porque "el igual como botón" es la misma escena con el salto ejecutado sin recorrido. `ledger_join_two_piles` es nativa y corre al costado: dos filas se juntan en una y la cuenta aparece sola; gramática `partition`, parametrizada por las dos cantidades, sostiene la propiedad del orden porque juntar en un orden o en el otro es un parámetro suyo. Se reúsan las dos escenas del nodo 2 para las variantes con la pista sin fichas. Ninguna lleva texto rasterizado: los dígitos y el operador los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_add`, la segunda tecla del jugador ([M](../../M-calculadora/M0-progresion.md)). No devuelve solo el total: anima el desplazamiento sobre la misma pista donde se aprendió, con la flecha creciendo desde el primer sumando, y recién después escribe el renglón. Es la primera transformación que la calculadora anima. Si el nodo decae, la tecla muestra óxido y sigue funcionando.

**Edad universal:** el nodo declara `literacy: none` aunque sea de nivel 1, y es correcto: los dígitos y el `+` no son texto sino íconos con historia, y el jugador vio nacer los dos ([Q](../../Q-edad-universal.md), [H](../../H-progresion-abstraccion.md)). Se juega entero sin leer: las tarjetas son de puntos hasta que el morph del paso 2 las convierte en dígitos, la instrucción es la mano fantasma, `explain` se resuelve entre animaciones y la definición corta de `formal` va siempre con voz. En `symbolic` se arrastran fichas; no hay escritura. Un adulto llega por diagnóstico saltando `real` e `intuition` y entra en el nivel de fichas. Speed se mide sin cuenta regresiva, con el factor de perfiles sin lectura de [K](../../K-evaluacion.md).
