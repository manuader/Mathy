# 03 — Sumar es avanzar en la pista (`arith.add.displacement`)

> Locale `es`: "Sumar es avanzar en la pista". Minijuego: [El viaje de dos tramos](../../F-minijuegos/arith.add.displacement.md).

**Nodo:** `arith.add.displacement` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundaria `ledger`) · **Literacy:** `none` · **Analogía:** `number_line_walk` (con `walker_forward_and_back` para el tramo)

## 1. Concepto

Sumar no es juntar dos montones y volver a contar: es avanzar sobre la pista una cantidad conocida de pasos desde donde se está. El primer número dice dónde se empieza, el segundo dice cuánto se avanza, y el resultado es la piedra de llegada. Al terminar, el jugador anticipa la piedra de llegada antes de que la manivela gire, encadena dos tramos y sabe que hacerlos al revés lleva al mismo lugar. Antes sabía dar un paso; ahora sabe dar un tramo entero de una vez y anotarlo.

## 2. Prerequisitos

- `found.count.number_line` (nodo 2): la pista graduada. Se usan la fila de piedras con sus numerales, el `0` como piedra de salida, el invariante del paso constante y la manivela con dientes iguales. La manivela es la pieza que más cambia: acá gana un tope que la hace girar varios dientes de un tirón, y ese tope es el segundo número.

Es el único prerequisito del YAML. La arista se aparta del orden escolar en un punto que conviene decir. La escuela llega a sumar juntando colecciones: tres manzanas y dos manzanas son cinco manzanas. Mathy usa el desplazamiento como definición y deja el juntar como comprobación, por dos razones. La primera es que juntar montones no dice nada sobre el orden y obliga a recontar; el desplazamiento aprovecha que el nodo 2 ya puso los números en fila y convierte sumar en anticipar, que es una capacidad y no un recuento. La segunda es que el desplazamiento sobrevive a los negativos, a los vectores y a los ángulos, y juntar montones no: no hay montón de menos tres manzanas. Por eso el nodo declara `ledger` como secundaria y no como principal: el libro de cuentas está para anotar y para comprobar, no para definir.

## 3. Dificultad cognitiva real

Lo difícil no es la cuenta. Son cuatro capacidades que "sumar" tapa:

1. **Los dos números no hacen lo mismo.** El primero es un lugar y el segundo es un movimiento. Un jugador que trata a los dos como montones nunca entiende por qué `3 + 2` y `2 + 3` llegan al mismo lado sin que las dos situaciones se parezcan.
2. **Avanzar sin contar de a uno.** Anticipar la piedra de llegada antes de que la manivela gire. Contar los pasos uno por uno es el punto de partida; salir de ahí es el nodo.
3. **Encadenar tramos.** Dos avances seguidos son un avance solo, y el número de ese avance no es ninguno de los dos. Es lo que prepara la asociatividad y el nodo 5.
4. **No leer el igual como un botón.** En cuanto aparece un símbolo de llegada, la tentación es entenderlo como "acá se calcula". Es `equals_as_operator`, la única misconception catalogada del nodo, y el motivo por el que la mecánica mantiene el viaje reversible: se puede volver, y si el igual fuera un botón no se podría.

## 4. Problema intuitivo

El caminante del nodo 2 está en una piedra del camino y tiene que llegar a la bandera, pero el agua subió y las piedras del medio están tapadas. No puede ir de a una mirando dónde pisa: tiene que saltar el tramo completo y caer bien.

En `real` el jugador solo mira: alguien pone una tabla que cubre tres piedras, el caminante la cruza de un tirón y cae en la piedra correcta. En `intuition` la escena se detiene antes de la caída. El caminante está en la piedra 3 y la tabla cubre 2. Tres desenlaces dibujados: cae en la piedra 5, cae en la 2 porque contó la piedra de partida, cae en la 6 porque contó la de llegada dos veces. El jugador elige y después ve. Una segunda escena prepara el orden: dos tablas, una de 3 y otra de 2, apoyadas en cualquier orden desde la orilla. Dos desenlaces: llega al mismo lugar, o llega a lugares distintos.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara ([G0](../../G-analogias/G0-reglas.md)).

`number_line_walk`, la del YAML, hereda entera del nodo 2. Mapa: piedra → número; posición del caminante → valor; un paso → una unidad; orden de las piedras → orden de los números; piedra de salida → cero. Invariante: la separación entre piedras es siempre la misma, así que un tramo mide lo mismo empiece donde empiece. Ruptura: `position_between_stones`, lejos todavía. Se retira en `visual`, cuando las piedras se vuelven marcas.

`walker_forward_and_back` aporta lo que el nodo agrega: el tramo. Mapa: pasos hacia adelante → sumando; piedra de llegada → suma; dos saltos en cualquier orden → conmutatividad; saltos iguales repetidos → conteo salteado. Invariante: la llegada depende de cuántos pasos se dieron, no de en cuántos tirones. Ruptura: `walking_past_start`, caminar más atrás del origen, que es el nodo 7. Se retira en `symbolic`, y por eso es la que sostiene al nodo cuando la pista ya no está.

`ledger` no trae analogía nueva: trae el libro de cuentas del nodo 1, con una fila por tramo. Sirve para dos cosas y ninguna es definir la suma. Anota el viaje, para que se pueda leer después sin la pista. Y comprueba: las fichas de los dos tramos juntas en un montón tienen la misma tarjeta que la piedra de llegada, y esa coincidencia entre juntar y avanzar es lo que hace que la suma escolar y la de Mathy sean la misma operación.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Dos mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `gears_sequence` es la principal y aporta la herramienta: la manivela del nodo 2 con un tope que fija cuántos dientes gira de un tirón. `ledger` aporta el invariante y el registro: el libro anota una fila por tramo y su total no cambia si las filas se reordenan. Se encuentran en un gesto: soltar la ficha de un número sobre la manivela pone el tope, anota la fila en el libro y arma el salto, todo con el mismo movimiento.

1. La pista con el caminante en una piedra marcada, la bandera lejos, la manivela abajo y un libro de cuentas al costado con las filas vacías.
2. Demostración: una mano fantasma toma una ficha con tres puntos, la suelta sobre la manivela; el tope se ajusta y aparecen tres dientes iluminados. Gira una vez: el caminante avanza tres piedras de un tirón, con una estela, y en el libro se anota una fila con tres marcas. La mano repite con una ficha de dos y desaparece.
3. El jugador arrastra fichas a la manivela y gira. La estela deja ver por qué piedras pasó sin pisarlas de a una.
4. Si el tope está mal puesto, el caminante cae en otra piedra. No hay cartel: la bandera sigue donde estaba y el jugador puede girar al revés para volver, cambiar la ficha y saltar de nuevo. El estado nunca se borra.
5. Si el jugador gira sin ficha, la manivela avanza de a un diente, como en el nodo 2. Es válido y llega igual, solo que lento: recibe un empujón suave, el brillo de la ficha, no una explicación.
6. Dos tramos. Desde el tercer nivel hay dos fichas y el jugador las usa en el orden que quiera. El libro anota dos filas. Un toque sostenido sobre el libro intercambia las filas y el caminante rehace el viaje al revés: cae en la misma piedra. Ese es el gesto de la conmutatividad y no hace falta decirlo.
7. Éxito: el caminante cae en la bandera, la piedra se ilumina y en el libro aparece la fila del total.

## 7. Representación visual

Capa `visual`, primitiva `displace` de [H](../../H-progresion-abstraccion.md).

La pista se estiliza en la recta con marcas del nodo 2 y el caminante en un punto grueso. Lo nuevo es la flecha: el tramo deja de ser una estela y se dibuja como una flecha con cola en la piedra de partida y punta en la de llegada, que abarca exactamente tantas marcas como pasos. Dos tramos son dos flechas encadenadas punta con cola, y la flecha del viaje entero se dibuja arriba, del mismo largo que las dos juntas.

Lo que se desplaza es el punto; lo que se conserva es la longitud de cada flecha, que no cambia si se la arrastra a otro tramo de la recta. Ese arrastre es el ítem que separa este nodo del anterior: una flecha de tres marcas mide tres empiece donde empiece, y por eso `3 + 2` y `7 + 2` avanzan lo mismo.

El libro de cuentas se estiliza en filas de marcas alineadas con la recta, una fila por tramo, y una fila de total abajo separada por un renglón.

Todavía no hay operador entre los números, ni flechas hacia atrás, ni marcas a la izquierda del `0`. La flecha hacia atrás es del nodo 4 y acá se evita a propósito.

## 8. Transición a símbolos

Cinco morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Estela → flecha.** La primera vez que el jugador completa un salto de más de un paso en `concrete`, la estela se cierra en una flecha con cola y punta sobre las mismas marcas. La flecha se puede arrastrar por la recta y conserva su largo.
2. **Flecha → ficha con numeral.** Al soltar la flecha sobre el libro, se contrae en una ficha con el numeral del nodo 1, que queda en la fila. La flecha no desaparece: la ficha la devuelve como fantasma al mantenerla tocada.
3. **Dos fichas encadenadas → el signo `+`.** Cuando el jugador hace dos tramos seguidos y después intercambia las filas del libro para ver que llega igual, las dos fichas se acercan sobre la recta y entre ellas aparece un signo pequeño, formado por el cruce de la punta de la primera flecha con la cola de la segunda. Queda `3 + 2` sobre la recta.
4. **Piedra de llegada → ficha de llegada.** El numeral de la piedra donde cayó el caminante se despega de la marca y viaja hasta el final de la expresión. Entre la expresión y esa ficha se dibuja un doble trazo: la ficha de llegada, que dice dónde terminó el viaje.
5. **Recta → renglón.** Al siguiente viaje válido, la recta se atenúa y queda el renglón `3 + 2 = 5` solo. La recta se pide tocando la ficha de llegada y vuelve como fantasma, con el caminante en su piedra.

En ningún paso hay dos objetos que se alternan: la flecha con id estable se vuelve ficha y la ficha devuelve la flecha.

## 9. Notación matemática

Queda `3 + 2 = 5`.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), el símbolo nuevo es el `+`, y el problema que lo hace necesario es de registro a distancia. Mientras la pista esté en pantalla, las dos flechas encadenadas dicen todo y no hace falta escribir nada. El problema aparece en el nivel del encargo: al caminante hay que mandarle instrucciones a una pista que no se ve, y lo único que viaja es una ficha. Una ficha con `3` y otra con `2` sueltas son ambiguas: pueden querer decir dos tramos seguidos, o dos viajes distintos, o una piedra y un tramo. El `+` es lo que dice "estos dos se hacen uno detrás del otro sobre el mismo camino". No dice "juntá los montones": eso lo comprueba el libro, y el símbolo no lo necesita.

El otro trazo que aparece, el doble trazo de la ficha de llegada, no es todavía el igual como invariante. Acá dice solamente dónde terminó el viaje, y el nodo lo mantiene inofensivo a propósito: se puede volver girando la manivela al revés, así que no es un botón que ejecuta. Su significado completo, dos cosas que pesan lo mismo, nace en `prealg.eq.balance` con su propio problema. Este nodo lo introduce en su forma más pobre y por eso carga con `equals_as_operator`: es el precio de necesitar escribir una llegada antes de tener una balanza.

No aparece ningún otro símbolo. No hay signo de resta, ni paréntesis, ni negativos.

## 10. Definición formal

Capa `formal` como voz sobre el objeto, sin texto escrito, porque el nodo es `literacy: none` ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre la pista que el jugador tiene en pantalla. Sumar dos números es empezar en el primero y avanzar tantos pasos como dice el segundo. La piedra de llegada es la suma. El orden de los dos números no cambia la piedra de llegada.

Condiciones y casos especiales, verificados sobre el objeto: sumar `0` deja al caminante donde estaba, porque el tope de la manivela no tiene dientes; sumar `1` es un paso, el del nodo 2; dos tramos seguidos se pueden hacer en cualquier orden y también agrupar de cualquier manera, porque la pista no recuerda los tirones sino los pasos.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: el caso del `0`, que en la manivela es un tope sin dientes y llama la atención, y la idea de que el segundo número no es un lugar. Las dos entradas de cheatsheet del nodo, `cs.arith.add_as_step_forward` y `cs.arith.add_order_irrelevant`, quedan como imagen con voz.

## 11. Propiedades

- **El orden de los sumandos no cambia la llegada.** `3 + 2` y `2 + 3` caen en la misma piedra. Ligada al toque sostenido que intercambia las filas del libro y hace rehacer el viaje al revés. Es `cs.arith.add_order_irrelevant`.
- **Sumar `0` no mueve al caminante.** Ligada al tope sin dientes: la manivela gira y no pasa nada. Es el primer elemento neutro del juego y vuelve en el nodo 5 con el `1`.
- **Tres tramos se pueden agrupar de cualquier manera.** Ligada a las tres filas del libro, que se pueden juntar de a dos en el orden que sea sin que cambie el total. No se escribe todavía: no hay paréntesis hasta `arith.expr.precedence_tree`.
- **Una flecha mide lo mismo en cualquier tramo de la pista.** Ligada al arrastre de la flecha por la recta. Es lo que hace que un número pueda ser un movimiento y no solo un lugar, y es la propiedad que `linalg.vec.vector_as_displacement` retoma entera.
- **Avanzar y contar dan lo mismo.** El total del libro y el numeral de la piedra de llegada coinciden siempre. Ligada a la fila de total: es la única vez que el nodo afirma que su suma y la del nodo 1 son la misma.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: el caminante en una piedra y una ficha con un número; tocar la piedra donde va a terminar, antes de que la manivela gire. Los distractores se generan con una piedra de más y una de menos, y con la piedra que corresponde a la ficha sola, sin sumar la de partida.
- `explain`: dos animaciones sobre el mismo viaje. En una el caminante avanza y la ficha de llegada aparece cuando el paso termina; en la otra la ficha de llegada empuja al caminante, como si fuera un botón de hacer. Tocar la que confunde la llegada con una acción. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: girar la manivela la cantidad exacta de pasos que muestra la ficha y ver cómo el libro anota cada paso.
- `apply`: dos fichas seguidas; avanzar primero una y después la otra, y después tocar la ficha única que hubiera hecho el mismo viaje de un solo giro. El tiempo objetivo del nodo, con su factor para perfiles sin lectura, vive en K.
- `generalize`: la pista pierde los dibujos y quedan marcas; después solo fichas con números; arrastrar la ficha del resultado sin ver al caminante.
- `transfer`: sobre la grilla del tesoro, encadenar dos flechas punta con cola y tocar dónde termina el viaje.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`equals_as_operator`**, patrón `replay_on_mechanic`. El jugador trata la ficha de llegada como un botón: en `symbolic`, frente a `3 + 2 = □ + 1`, escribe `5` en el hueco, o toca la ficha de llegada esperando que ejecute el salto. El catálogo declara el patrón sobre la mecánica `balance`, que en el nivel 1 no existe todavía, así que acá corre sobre la pista, que es la superficie que el jugador tiene: el juego congela, dibuja las dos flechas del lado izquierdo hasta su piedra y la flecha del lado derecho desde el hueco, y muestra que caen en piedras distintas. La flecha que falta queda hueca sobre la recta. Voz: "Ahora un plato pesa 5 y el otro 6. ¿Qué falta para nivelar?", que es el prompt del locale y llegará entero cuando exista la balanza; mientras el nodo se juegue sin platos, la voz dice la misma pregunta sobre las dos llegadas. El jugador completa la flecha hueca desde el estado real.

Errores que el diseño prevé y que no tienen entrada en el catálogo, y por eso no clasifican ni bloquean `ready`:

- **Contar la piedra de partida como un paso.** Es el error heredado del nodo 2 y el distractor principal de `recognize`. El juego repite el salto con un tic por despegue y la piedra de partida sin sonido.
- **Sumar la piedra de llegada dos veces.** Aparece con dos tramos: el jugador cuenta la piedra de la unión en los dos. El juego dibuja las dos flechas encadenadas con la unión iluminada una sola vez.

## 13. Generalización

Las dos analogías se retiran en tiempos distintos, como declaran sus entradas en G. La pista se va en `visual`: en cuanto la flecha se arrastra y conserva su largo, las piedras y el agua sobran. El tramo se queda hasta `symbolic`, porque es lo que sostiene el `+` cuando ya no hay recta, y porque el nodo 4 lo necesita entero para poder darlo vuelta.

Variantes sin ayuda visual, en orden: números mayores que la pista visible, donde ya no se puede contar de un vistazo; sumar `0` y sumar `1`; tres tramos encadenados; y el sumando faltante, `3 + □ = 5`, donde el jugador conoce la partida y la llegada y tiene que reconstruir la flecha. La última es la que más se acerca al nodo siguiente y la que dispara `equals_as_operator` con más frecuencia.

Tramos arbitrarios. El nodo termina con pistas sin números: una fila de dibujos distintos, una ficha con tres puntos y la pregunta de dónde cae el caminante. Se evalúa que la estructura (una posición, un desplazamiento de tamaño conocido, una llegada) se reconoce sin numerales.

El nodo llega a `symbolic` y no tiene `abstract` propia. Su forma completa se considera alcanzada cuando el jugador anticipa la llegada sin girar la manivela, encadena dos tramos en cualquier orden sin sorpresa, resuelve el sumando faltante y no trata la ficha de llegada como botón. Lo que un nodo `abstract` diría, que los enteros con la suma forman un grupo conmutativo, lo enuncia mucho después `adv.alg.group_as_reversible_actions`, sin caminante.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.vec.vector_as_displacement` (`grid_stretch`): la flecha sale de la recta y se mueve en el plano. Encadenar dos flechas punta con cola es sumar vectores, y el invariante de que la flecha mide lo mismo en cualquier tramo es lo que hace que un vector no tenga posición.
- `geom.angle.turn_as_measure` (`construct`): la pista se enrolla y los tramos son giros. Dos giros seguidos son un giro solo, y el orden tampoco importa.
- `graph.path.shortest_path` (`network_routes`): el viaje deja de ser sobre una fila y pasa a una red de islas. La suma es el largo del camino, y por primera vez hay más de una manera de llegar al mismo lugar.

Concepto siguiente: `arith.sub.undo_add` ([04](04-arith.sub.undo_add.md)). Frase puente, narrada sobre el caminante recién llegado: "Diste tres pasos y caíste acá. Si querés volver a la piedra de antes, ¿qué tenés que hacer?". La manivela cambia de color en el sentido contrario, aparece un cofre cerrado en la piedra de partida, y el nodo 4 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `gear_step_forward_adds` es la mecánica renderizada sobre el estado del jugador: la rueda dentada gira el tope entero, el punto se desplaza sobre la recta y la flecha crece desde la cola hasta la punta mientras un valor sube; gramática `displace`, con el largo de la flecha como lo que se conserva. Parametrizada por la piedra de partida y por el tamaño del tramo, produce los ítems de `recognize`, la mecánica de `manipulate` y las dos animaciones de `explain`, una con la ficha de llegada que aparece al final y otra donde la ficha empuja al caminante. `ledger_join_two_piles` es el libro: dos filas de fichas que bajan a un renglón común mientras la tarjeta del total cuenta desde cero, alineadas con la recta; parametrizada por los dos sumandos, produce los ítems de `apply` y el intercambio de filas de la conmutatividad. Ninguna lleva texto rasterizado: los numerales y el `+` los dibuja el runtime desde el `MathTree`, y el caminante, la piedra y la ficha son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_add` ([M](../../M-calculadora/M0-progresion.md)), la segunda tecla del primer tramo, al lado de `contar`. No devuelve solo el número: al tocarla sobre dos fichas dibuja la recta, pone al caminante en la primera, hace crecer la flecha de la segunda y deja el numeral bajo la marca de llegada, con la misma animación de la mecánica. Manteniéndola apretada, muestra el libro de cuentas en vez de la pista. El hueco al lado, apagado hasta el nodo 4, es en sí mismo el anuncio del nodo siguiente. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que suelta la ficha sobre la manivela y gira, los targets son fichas y una manivela del tamaño de un token, `explain` se resuelve entre animaciones y la definición existe solo como voz sobre la pista. Con el sonido apagado no falta nada: la estela, el destello de la piedra de llegada y la fila que se anota en el libro dicen lo mismo. Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra en el nivel donde la recta ya tiene numerales y usa el teclado de fichas para el resultado en vez de arrastrarlo.
