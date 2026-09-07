# 04 — La resta deshace la suma (`arith.sub.undo_add`)

> Locale `es`: "La resta deshace la suma". Minijuego: [La llave de vuelta](../../F-minijuegos/arith.sub.undo_add.md).

**Nodo:** `arith.sub.undo_add` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundaria `gears_sequence`) · **Literacy:** `none` · **Analogía:** `walker_forward_and_back`

## 1. Concepto

Restar no es quitar cosas de un montón: es deshacer un avance. Si el caminante dio tres pasos adelante, tres pasos atrás lo devuelven exactamente a donde estaba, y ningún otro número lo hace. De ahí sale la segunda cara del nodo: la resta también dice cuánto separa a dos piedras, porque los pasos que hay que volver son los pasos que hay entre las dos. Al terminar, el jugador elige el tramo de vuelta que devuelve al caminante a su piedra y mide la distancia entre dos caminantes sin recorrerla de a un paso. Antes sabía avanzar; ahora sabe volver.

## 2. Prerequisitos

- `arith.add.displacement` (nodo 3): el avance como tramo. Se usan la manivela con tope, la flecha con cola y punta, la ficha con numeral, el libro de cuentas y el `+`. La flecha es la pieza clave: el nodo 4 no inventa un objeto nuevo, le da vuelta la punta.

Es el único prerequisito del YAML, y la arista se aparta del orden escolar en algo importante. La escuela define restar como quitar, y esa definición se rompe dos veces: cuando hay que restar un número mayor y cuando hay que medir una diferencia sin que nada desaparezca. Mathy define restar como deshacer, que es la estructura que sobrevive a las dos y que además reaparece idéntica en la división, en las transformaciones geométricas y en el teorema fundamental del cálculo. Quitar queda como caso: sacar tres frutas del cuenco es deshacer el gesto de haberlas puesto. Por eso la mecánica principal no es `ledger` sino `chest_key`, y por eso este nodo, y no el 3, es el que abre el llavero que después usan `arith.div.undo_mul`, `prealg.inv.operation_as_key` y `alg.eq.one_step`.

## 3. Dificultad cognitiva real

Lo difícil no es la cuenta. Son cuatro capacidades que "restar" tapa:

1. **Entender que hay una sola vuelta que sirve.** Volver dos o volver cuatro también es volver, pero no devuelve. La resta no es "ir para atrás": es ir para atrás exactamente lo mismo.
2. **Ver que restar y medir son la misma cosa.** Cuánto tengo que volver y cuánto los separa son dos preguntas que se responden con la misma flecha, leída en dos sentidos. Un jugador puede dominar una y no la otra, y el nodo no está aprendido hasta que las dos producen el mismo número.
3. **El orden importa.** En la suma daba igual; acá no. Volver del 5 al 3 no es lo mismo que ir del 3 al 5, aunque la flecha mida igual. Esa asimetría es la primera del juego y es lo que después hace necesario el signo.
4. **Aceptar que la vuelta puede pasarse.** Si el caminante vuelve más pasos de los que avanzó, se le acaba la pista. El nodo llega hasta ese borde y no lo cruza: ahí empieza `arith.int.negatives`.

## 4. Problema intuitivo

El caminante cruzó el agua saltando un tramo con la tabla y la marea se llevó la tabla. En la piedra de partida quedó un cofre cerrado con sus cosas. Tiene que volver, y el agua tapó las piedras del medio otra vez: no puede volver mirando dónde pisa.

En `real` el jugador solo mira: alguien pone la misma tabla al revés, el caminante la cruza y cae justo en la piedra del cofre, que se abre. En `intuition` la escena se detiene antes de la caída. El caminante avanzó tres y va a volver. Tres desenlaces dibujados: vuelve tres y el cofre se abre; vuelve dos y queda a una piedra, el cofre no abre; vuelve cuatro y se pasa, el cofre queda atrás. El jugador elige y después ve.

Una segunda escena prepara la distancia: dos caminantes en dos piedras distintas, sin cofre y sin nadie que haya avanzado. La pregunta, por gesto: cuántos pasos hay de uno al otro. La misma flecha, sin viaje previo.

## 5. Analogía del mundo real

`walker_forward_and_back` ([G0](../../G-analogias/G0-reglas.md)), la del YAML, sobre `slope_walker` en el catálogo y jugada acá con la manivela de `gears_sequence` y el cofre de `chest_key`. Mapa: pasos hacia adelante → sumando; piedra de llegada → suma; pasos hacia atrás → sustraendo; volver a la piedra de partida → operación inversa; dos saltos en cualquier orden → conmutatividad, que acá se pierde y por eso se nota; saltos iguales repetidos → conteo salteado.

Invariante que conserva: la vuelta devuelve al punto exacto si, y solo si, tiene el mismo tamaño que la ida. Es exactamente lo que conserva la operación inversa.

Punto de ruptura: `walking_past_start`. La pista de este nodo termina en el `0` y no hay piedras antes de la orilla; si la vuelta es más grande que la ida, el caminante se queda sin dónde pisar. El nodo llega hasta ahí a propósito, porque ese tope es el problema que abre `arith.int.negatives`. Se retira en `symbolic`.

Por qué esta y no otra. La alternativa escolar es el montón del que se saca. Se descarta con el test de G0 en el paso del invariante: quitar conserva "cuántas quedan" pero no dice nada sobre volver a un estado, y se rompe apenas hay que restar más de lo que hay o medir una diferencia entre dos cosas que siguen enteras. El caminante que vuelve conserva las dos lecturas y no se rompe en ninguna. El cofre, además, no es una analogía distinta sino la comprobación: es el objeto que dice si la vuelta fue exacta, y el que enseña que hay una sola llave.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Dos mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `chest_key` es la principal y aporta el invariante y el veredicto: la cerradura tiene la forma del tramo de ida, la llave tiene la forma del tramo de vuelta, y el cofre abre solo si son la misma. `gears_sequence` aporta la herramienta: la misma manivela del nodo 3, que ahora gira en los dos sentidos con dientes del mismo tamaño. Se encuentran en un gesto: soltar la llave sobre la manivela invierte el sentido de giro y fija el tope en los dientes que la llave tiene marcados.

1. La pista con el caminante en la piedra donde cayó, la flecha de ida todavía dibujada detrás, un cofre cerrado en la piedra de partida y, abajo, la manivela y un llavero con tres llaves.
2. Demostración: una mano fantasma toma la llave con tres dientes, la suelta sobre la manivela; el sentido de giro se da vuelta, con un chasquido. Gira: el caminante retrocede tres piedras de un tirón, cae sobre el cofre y el cofre se abre. La mano repite y desaparece. El llavero late.
3. El jugador arrastra una llave y gira. La flecha de vuelta se dibuja sobre la de ida, en sentido contrario, y las dos se cancelan visualmente cuando coinciden: se apagan juntas.
4. Llave corta: el caminante queda antes del cofre. El cofre no abre y la parte de la flecha de ida que sobra queda iluminada, sin cartel. El jugador sigue desde ahí: puede girar más o cambiar de llave.
5. Llave larga: el caminante se pasa del cofre y queda del otro lado. El cofre tampoco abre. Si la llave es tan larga que se pasa de la orilla, la manivela se traba en el último diente y el caminante queda en el `0`: la pista se acabó y eso es una promesa, no un error.
6. Dos caminantes. Desde el cuarto nivel no hay ida previa: hay dos caminantes en dos piedras y una regla plegable. El jugador estira la regla de uno a otro y la regla se convierte en la ficha con el número de pasos. Es la misma flecha, medida en vez de recorrida.
7. Éxito: el cofre se abre solo, o la ficha de la regla se ilumina. Sin cartel.

Nada se llama "incorrecto": cada error tiene su consecuencia física y su reparación desde el estado real, que siempre es una posición válida de la pista.

## 7. Representación visual

Capa `visual`, primitiva `invert` de [H](../../H-progresion-abstraccion.md), con `displace` de apoyo heredada del nodo 3.

La pista se estiliza en la recta con marcas y el caminante en un punto grueso. La flecha de ida se dibuja arriba de la recta, con la punta a la derecha; la de vuelta, abajo, con la punta a la izquierda. Cuando las dos tienen el mismo largo, se enfrentan y se apagan a la vez, dejando al punto donde empezó: eso es el invariante dibujado.

El cofre se estiliza en el diagrama vertical de E0: arriba el estado inicial (el caminante en su piedra), una flecha hacia abajo con la forma del tramo de ida, abajo el estado final. La llave es la misma flecha reproducida hacia atrás, y solo cierra el circuito si devuelve el punto de arriba.

Para la segunda cara, la regla plegable se estiliza en un tramo de la recta resaltado entre las dos marcas, con las marcas de los extremos iluminadas y las del medio contadas por un tic. Lo que se conserva es el largo del tramo; lo que se desplaza es el punto.

Todavía no hay marcas a la izquierda del `0`, ni flechas que se pasen de la orilla, ni el signo entre los números.

## 8. Transición a símbolos

Cinco morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Llave con forma → llave con dientes contados.** La primera vez que el jugador abre un cofre en `visual`, la llave pierde el color y sus dientes se separan y se cuentan con el tic del nodo 1. La forma queda un rato como sombra detrás.
2. **Flecha de vuelta → ficha con numeral y sentido.** Al soltar la llave sobre el libro de cuentas, la flecha de vuelta se contrae en una ficha, y la ficha conserva la punta hacia la izquierda: es la primera ficha del juego que no es simétrica.
3. **Punta hacia la izquierda → el signo `−`.** Cuando el jugador anota en el libro un viaje de ida y otro de vuelta y ve que el total es la piedra de partida, la punta de la ficha de vuelta se despega y se estira en un trazo horizontal delante del numeral. Queda `5 − 3` sobre la recta, con el trazo heredando la forma del cuerpo de la flecha sin su punta.
4. **Piedra de llegada → ficha de llegada.** Como en el nodo 3, el numeral de la piedra donde quedó el caminante viaja al final de la expresión detrás del doble trazo. Queda `5 − 3 = 2`.
5. **Regla plegable → la misma expresión.** En los niveles de distancia, al estirar la regla entre dos caminantes, el tramo resaltado se contrae y aparece la misma escritura con los numerales de las dos piedras. El jugador ve que el símbolo que nació de deshacer también nombra lo que hizo con la regla. Es la única vez que el nodo afirma la equivalencia de sus dos caras de forma explícita, y lo hace con un morph, no con una frase.

## 9. Notación matemática

Queda `5 − 3 = 2`, y la misma escritura junto a la regla estirada entre dos marcas.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), el símbolo nuevo es el `−`, y el problema que lo hace necesario es el sentido. En el nodo 3 una ficha con `3` era suficiente porque todos los tramos iban para el mismo lado. Acá no: una ficha con `3` puede querer decir avanzar tres o volver tres, y las dos llevan a piedras distintas. Mientras la flecha esté en pantalla, la punta lo dice. El problema aparece de verdad en el nivel del encargo, cuando hay que mandarle instrucciones al caminante a una pista que no se ve y solo viajan fichas: hace falta una marca que diga "este tramo va al revés". El `−` es la flecha a la que se le sacó la punta y se le dejó el cuerpo.

Hay una consecuencia que el nodo hace notar y no explica: con el `+` daba igual el orden y con el `−` no. Escribir `3 − 5` en la pista de este nodo deja al caminante sin piedras, y ese resultado sin lugar es el problema que abre `arith.int.negatives`. El nodo lo deja planteado con la manivela trabada, no con una regla.

No aparece ningún otro símbolo. No hay paréntesis, ni signo delante de un número solo, ni valor absoluto: la distancia entre dos caminantes se escribe siempre restando el chico al grande, y el caso al revés es del nodo 7.

## 10. Definición formal

Capa `formal` como voz sobre el objeto, sin texto escrito, porque el nodo es `literacy: none` ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre la pista que el jugador tiene en pantalla. Restar es deshacer un avance: volver tantos pasos como se avanzó. La resta que deshace un avance es única: ninguna otra devuelve a la piedra de partida. Restar dos números también dice cuántos pasos hay entre sus piedras.

Condiciones y casos especiales, verificados sobre el objeto: restar `0` deja al caminante donde estaba, porque la llave no tiene dientes; restar un número de sí mismo lo devuelve al `0`, que es el único caso en que la llave y la posición coinciden; y restar más de lo que hay traba la manivela, porque en esta pista no hay piedras antes de la orilla. Ese último caso no se resuelve acá.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: la palabra "única" para la llave, que hasta ahora era un hecho de las cerraduras y pasa a ser una propiedad de la operación. Las dos entradas de cheatsheet del nodo, `cs.arith.sub_undoes_add` y `cs.arith.sub_as_distance_between`, quedan como imagen con voz.

## 11. Propiedades

- **La resta deshace la suma.** Volver los mismos pasos que se avanzó devuelve a la piedra de partida, y esa es la única vuelta que lo hace. Ligada a las dos flechas que se enfrentan y se apagan juntas. Es `cs.arith.sub_undoes_add` y es la forma concreta de `inverse_restores_original`.
- **Restar `0` no mueve al caminante.** Ligada a la llave sin dientes: la manivela gira al revés y no pasa nada. Es el mismo neutro del nodo 3, visto desde la otra punta.
- **Restar un número de sí mismo lleva al `0`.** Ligada al caminante que vuelve hasta la orilla y a la manivela que se traba justo ahí. Es la primera vez que el `0` aparece como resultado y no solo como partida.
- **La resta dice la distancia.** Los pasos que separan dos piedras son la resta de sus numerales. Ligada a la regla plegable. Es `cs.arith.sub_as_distance_between` y es lo que `geom.trans.undo_transformation` retoma con figuras.
- **El orden cambia el resultado.** Ligada a la manivela trabada al intentar volver más de lo que hay. No se enuncia como regla: se siente como tope, y es la promesa del nodo 7.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: el caminante acaba de avanzar y hay tres llaves con números; tocar la llave que lo devuelve exactamente a la casilla de salida. Los distractores se generan con una llave de un diente de más, una de un diente de menos y una del tamaño de la piedra de llegada en vez del tramo.
- `explain`: dos animaciones sobre el mismo viaje. En una el caminante vuelve sobre sus pasos y pisa la casilla de partida; en la otra vuelve pero da un paso de más. Tocar la que no deshace el viaje. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: girar la manivela hacia atrás hasta que el cofre se abre; el cofre solo abre cuando los pasos de vuelta igualan a los de ida.
- `apply`: dos caminantes en distintas casillas; arrastrar la ficha que dice cuántos pasos los separan, midiendo con la pista. El tiempo objetivo del nodo, con su factor para perfiles sin lectura, vive en K.
- `generalize`: con la pista ya sin dibujos, elegir entre fichas de resta y de suma la que abre cada cofre, alternando idas y vueltas.
- `transfer`: en la grilla estirada, aplicar la transformación que devuelve la figura a su lugar, como si fuera la llave de vuelta.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)). El YAML declara `misconceptions: []`: ninguna entrada del catálogo con regla `detect` apunta a este nodo, así que ninguna tiene nombre ni prompt de locale y ninguna clasifica ni bloquea `ready`. Lo que el diseño prevé, con el patrón que correría si se catalogara y la voz que se usa mientras tanto, que es la que repite la pregunta del ítem:

- **Volver un paso de más o de menos.** Es el distractor principal de `recognize` y una de las dos animaciones de `explain`. Patrón `key_mismatch` sobre el cofre: la llave entra, gira un cuarto de vuelta y se traba, y la parte de la flecha de ida que quedó sin cancelar se ilumina sobre la recta. Voz: "La llave llegó hasta acá. ¿Cuánto falta para el cofre?".
- **Restar en el orden equivocado.** El jugador arma la vuelta desde la piedra de partida en vez de desde la de llegada, o mide la distancia empezando por el caminante de atrás. Patrón `replay_on_mechanic` sobre `gears_sequence`: el juego ejecuta su viaje de verdad, el caminante se pasa de la orilla y la manivela se traba en el último diente. Voz: "La pista se terminó. ¿Desde cuál de los dos hay que volver?". Es el candidato más claro a entrada propia en `misconceptions.yaml`, porque su regla `detect` es limpia y porque reaparece en el nodo 7.
- **Creer que restar siempre achica el montón.** Aparece en los niveles de distancia, cuando nada desaparece y el jugador busca qué sacar. El juego pone las dos reglas una al lado de la otra: la del viaje que se deshizo y la de los dos caminantes, con el mismo tramo iluminado. Voz: "Nadie sacó nada. ¿Cuántos pasos hay de uno al otro?".

## 13. Generalización

La analogía se retira en `symbolic`, como declara `fades_at_layer`. La pista, heredada del nodo 3, se va antes, en `visual`; lo que se queda hasta `symbolic` es el par de flechas enfrentadas, porque es lo que sostiene el `−`. El cofre queda como fantasma a demanda: representa estructura, no un objeto.

Variantes sin ayuda visual, en orden: números mayores que la pista visible; restar `0` y restar un número de sí mismo; la distancia entre dos piedras dadas solo por sus numerales, sin caminantes; y el minuendo desconocido, `□ − 3 = 2`, donde el jugador conoce la vuelta y la llegada y tiene que reconstruir de dónde salió. La última es la que anticipa `prealg.var.unknown_as_box`.

Cerraduras que no son pasos. El nodo termina con cofres cuya cerradura no es un tramo: el caminante se dio vuelta, se puso un sombrero, cambió de color. El jugador elige la llave que deshace: darse vuelta otra vez, sacarse el sombrero, volver al color de antes. Se evalúa que la estructura (una acción y la única acción que la devuelve al estado anterior) se reconoce con cualquier objeto. Es la primera aparición del llavero abstracto que `prealg.inv.operation_as_key` va a formalizar.

El nodo llega a `symbolic` y no tiene `abstract` propia. Su forma completa se considera alcanzada cuando el jugador elige la llave sin probar, mide una distancia sin recorrerla, resuelve el minuendo desconocido y nombra la llave de una cerradura arbitraria.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `geom.trans.undo_transformation` (`grid_stretch`): una figura fue movida y hay que devolverla. El tramo de vuelta es un movimiento del plano, y el cofre se abre cuando la figura calza en su silueta.
- `linalg.vec.vector_as_displacement` (`grid_stretch`): la flecha con la punta al revés es el vector opuesto, y restar dos vectores es la flecha que va de la punta de uno a la punta del otro. La regla plegable de este nodo es exactamente esa flecha.
- `calc1.ftc.integral_undoes_derivative` (`fill_accumulate`): la misma llave, cinco niveles después. Acumular deshace medir la pendiente, y el cofre que se abre es el mismo cofre.

Concepto siguiente: `arith.mul.scaling` ([05](05-arith.mul.scaling.md)). Frase puente, narrada sobre la pista con el caminante quieto: "Fuiste y volviste de a un tramo. Si tuvieras que dar el mismo tramo muchas veces seguidas, ¿hasta dónde llegarías?". La manivela se engancha a un segundo engranaje, la pista se vuelve una banda elástica clavada en el `0`, y el nodo 5 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `chest_step_back_undoes_step` es el cofre sobre la recta: el caminante avanza, el estado se guarda, la llave gira la flecha al revés y el caminante restaura la posición guardada mientras el cofre destella al abrirse; gramática `invert`, con la posición de partida como lo que se conserva. Parametrizada por la piedra de partida y el tamaño del tramo, produce la mecánica de `manipulate`, los ítems de `recognize` y las dos animaciones de `explain`, una con la vuelta exacta y otra con un paso de más. `gear_walk_back_same_count` es la manivela en los dos sentidos: la rueda gira, el punto avanza y vuelve, y las dos flechas se enfrentan y se apagan; parametrizada por la piedra de partida y el tramo, produce los ítems de `apply` con la regla plegable y las pistas sin dibujos de `generalize`. Ninguna lleva texto rasterizado: los numerales y el `−` los dibuja el runtime desde el `MathTree`, y el caminante, el cofre, la llave y la piedra son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_sub` ([M](../../M-calculadora/M0-progresion.md)), que ocupa el hueco que quedaba apagado al lado de `op_add` y completa el primer par del primer tramo. No devuelve solo el número: al tocarla sobre dos fichas dibuja la recta, pone al caminante en la primera, hace crecer la flecha de vuelta y deja el numeral bajo la marca de llegada, con la misma animación de la mecánica. Manteniéndola apretada, muestra la regla plegable entre las dos marcas en vez del viaje, que es la otra lectura de la misma tecla. Si el resultado se pasa de la orilla, la tecla se traba y muestra el tope: es el anuncio de `op_neg`. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que suelta la llave sobre la manivela, los targets son llaves y cofres del tamaño de un token, `explain` se resuelve entre animaciones y la definición existe solo como voz sobre la pista. Con el sonido apagado no falta nada: el chasquido del sentido invertido tiene su equivalente en el giro del ícono de la manivela, y el cofre que se abre es puramente visual. Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra en el nivel de las dos caras (deshacer y medir) y usa el teclado de fichas para armar la llave con operador y número en vez de arrastrarla del llavero.
