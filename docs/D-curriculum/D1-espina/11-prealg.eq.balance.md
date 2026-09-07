# 11 — El igual es una balanza (`prealg.eq.balance`)

> Locale `es`: "El igual es una balanza". Minijuego: [Los dos platos](../../F-minijuegos/prealg.eq.balance.md).

**Nodo:** `prealg.eq.balance` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` (única) · **Literacy:** `none` · **Analogía:** `balance_pans`

## 1. Concepto

Una igualdad no es una orden de calcular: es la afirmación de que dos lados valen lo mismo, y sobrevive exactamente a las acciones que se hacen idénticas en los dos lados. Al terminar, el jugador mantiene nivelada una balanza mientras la modifica, deja sola una caja cerrada quitando lo mismo de los dos platos, y escribe `=` sabiendo qué está afirmando. Antes tenía una caja y un libro; no tenía nada que dijera cuánto vale la caja.

## 2. Prerequisitos

- `prealg.var.unknown_as_box` (nodo 10): la caja cerrada como incógnita. Se usan el cajón con marca, la letra que nació de esa marca, la regla de que dos cajas con la misma marca pesan lo mismo, y la balanza que allí era solo un instrumento de medición. Sin la caja, la balanza es un juego de pesas; con la caja, es una pregunta.

La arista sigue el orden natural del material y no el escolar. La escuela introduce el `=` en el primer año, como el signo que separa la cuenta del resultado, y esa lectura ("acá viene lo que da") queda instalada años antes de que alguien la contradiga. [C0](../../C-knowledge-graph/C0-esquema.md) pone el nodo acá, después de la incógnita, porque recién con una caja en un plato el jugador tiene un motivo para conservar la igualdad en vez de consumirla: si el `=` produjera el resultado, la caja no tendría dónde aparecer. La misconception `equals_as_operator` es exactamente el hábito escolar, y el nodo está diseñado para provocarla y desarmarla.

## 3. Dificultad cognitiva real

Lo difícil no es equilibrar. Son cinco capacidades:

1. **El `=` es un estado, no una instrucción.** Quien lo lee como flecha responde `□ = 7` frente a `3 + 4 = □ + 2`, porque vuelca el lado izquierdo entero. Es `equals_as_operator`.
2. **La misma acción en los dos lados.** Es la única familia de movimientos que conserva la igualdad. Quitar de un plato la rompe, y romperla no es un error de cuenta sino de naturaleza. Es `inverse_applied_one_side`.
3. **Dos lados distintos pueden ser iguales.** `3 + 4` y `12 − 5` se ven distintos y pesan lo mismo. El `=` no dice que las escrituras coincidan, dice que las cantidades coinciden.
4. **La igualdad es simétrica.** La balanza leída desde el otro costado dice lo mismo. Que la caja esté a la derecha no cambia nada, y sin embargo cambia todo para quien aprendió que lo buscado va a la izquierda.
5. **No hacer nada es una jugada.** El nivel de la barra es un hecho a conservar, no una tarea a completar. Muchos niveles del minijuego se ganan sin tocar nada, y eso obliga a mirar antes de actuar.

## 4. Problema intuitivo

Un puesto de quesos con una balanza de dos platos y una fila de clientes. La vendedora corta un trozo, lo pone en un plato, agrega pesas del otro hasta que la barra queda derecha y recién ahí cobra.

En `real` el jugador solo mira: la barra sube, baja y se queda quieta. En `intuition` la escena se detiene con la balanza ya nivelada y la vendedora con la mano sobre un plato. Tres desenlaces dibujados: saca una pesa de cada plato y la barra sigue derecha; saca una pesa de un solo plato y la barra se inclina; pasa una pesa de un plato al otro y la barra se inclina el doble. El jugador elige y después ve. El tercero es el que más sorprende y prepara la misconception de mover términos.

En un segundo pase aparece el cajón cerrado del nodo 10 en un plato, con pesas al lado, y la pregunta por voz: cuánto pesa el cajón sin abrirlo.

## 5. Analogía del mundo real

`balance_pans`, la del YAML, con la mecánica `balance` ([G0](../../G-analogias/G0-reglas.md)). Mapa: plato → lado de la igualdad; pesas sobre un plato → términos; barra nivelada → igualdad; misma acción en los dos platos → transformación de equivalencia; caja cerrada en un plato → incógnita; quitar pesas iguales de los dos → cancelar; leer la caja sola → solución.

Invariante que conserva: la barra queda nivelada si, y solo si, los dos platos reciben la misma acción. No es una regla enunciada sino la experiencia repetida de que la balanza se cae cuando no se cumple.

Se rompe en `negative_weights`. Una pesa no pesa menos que nada, así que en cuanto un lado necesita un término negativo la balanza deja de poder dibujarse, y por eso la analogía se retira en `symbolic`. Hay una segunda ruptura que este nodo evita a propósito: multiplicar los dos platos no es una acción física. Se puede quitar lo mismo, se puede agregar lo mismo, pero "triplicar un plato" no tiene gesto. Por eso el nodo se queda en sumar y quitar, y la llave que reparte un plato en montones llega en el 12 y se usa recién en el 13.

Por qué esta y no otra: la alternativa habitual es la cuerda tensa o el espejo, que dan simetría pero no dan acción. La balanza es la única analogía que hace visible el costo de tocar un solo lado en el mismo instante en que se lo toca.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `balance`, que aporta a la vez la herramienta y el invariante ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Una balanza con pesas en los dos platos. Algunos niveles empiezan inclinados y hay que nivelarlos; otros empiezan nivelados y hay que sobrevivir a una tarea sin inclinarlos.
2. Demostración: una mano fantasma toca una pesa del plato izquierdo, que se eleva y sale; la barra se inclina; toca una pesa igual del derecho y la barra vuelve a quedar derecha. Repite la secuencia una vez y desaparece.
3. Tocar una pesa la quita de su plato. Arrastrar una pesa desde la reserva a un plato la agrega. La barra responde con inercia, se pasa un poco y se acomoda.
4. Cuando la barra queda derecha, se traba con un clic suave y entre los dos platos se enciende una ficha que todavía no tiene forma de signo. Encender esa ficha es el objetivo de los primeros niveles.
5. Con la caja: un plato tiene el cajón cerrado del nodo 10 y pesas; el otro, pesas sueltas. El jugador quita pesas de a una de los dos platos hasta que el cajón queda solo. Entonces el cajón se abre y muestra lo que tenía, que es lo que queda enfrente.
6. Quitar de un solo plato inclina la barra y la caja no cede. El estado no se borra: el jugador quita lo mismo del otro plato y la barra vuelve. Nada se llama incorrecto.
7. Pasar una pesa de un plato al otro está permitido y es la jugada que más inclina la barra. El juego la deja hacer porque es la única forma de que se sienta que son dos acciones y no una.

Lo que el nodo no permite todavía: repartir un plato en montones iguales, o duplicarlo. El gesto existe, la balanza no responde y las pesas vuelven a su lugar. Esa frustración deliberada es la que hace falta el llavero del nodo 12.

## 7. Representación visual

Capa `visual`, primitiva `invariant` de [H](../../H-progresion-abstraccion.md).

La balanza se estiliza en dos columnas con la barra entre ellas. Las pesas se aplanan en barras de longitud proporcional y el cajón es una barra de longitud desconocida, con el borde punteado que heredó del nodo 10. Con cada acción a los dos lados, el juego muestra el antes y el después uno sobre otro, con la barra nivelada iluminada en los dos: son estados distintos y la misma igualdad. Se desplaza lo que sale de los dos lados a la vez; se conserva el nivel de la barra, que es lo único resaltado en las dos mitades.

Cuando la acción va a un solo lado, el antes y el después se muestran igual, pero solo el antes tiene la barra iluminada. La diferencia entre las dos figuras es todo el mensaje.

Todavía no hay operaciones escritas ni llaves. El igual es la barra.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Pesas → barras.** Al pasar a `visual`, las pesas se aplanan y el cajón conserva su borde punteado. Es el paso `bars` de la mecánica.
2. **Barras → fichas.** Al nivelar por primera vez en `visual`, cada columna se contrae en una ficha numérica que conserva el peso: `5`, `12`. El cajón se contrae en `x`, repitiendo delante del jugador el morph que aprendió en el nodo 10, porque el objeto no puede cambiar de apariencia sin morph aunque el jugador ya lo haya visto.
3. **Barra → `=`.** Al hacer el primer movimiento válido sobre una balanza ya nivelada, los platos se desvanecen y la barra se contrae hacia el centro hasta quedar en dos trazos horizontales. La ficha sin forma del paso 4 de la mecánica termina de dibujarse ahí. Queda `x + 5 = 12` sobre una línea.
4. **La línea conserva el poder de inclinarse.** El `=` no es un adorno: si el jugador aplica una ficha a un solo lado, la línea entera se inclina como se inclinaba la barra, y la balanza se puede pedir tocando el `=` para verla como fantasma.
5. **Acción a los dos lados → dos toques sobre la línea.** Quitar `5` deja de ser tocar dos pesas y pasa a ser tocar la ficha `5` de un lado y la del otro. Las dos fichas se elevan a la vez y el renglón siguiente aparece con un morph, con la línea derecha.

## 9. Notación matemática

Nace `=`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), el problema que lo hace necesario es de registro: a partir del tercer estado, dibujar una balanza por estado no entra en la pantalla, y el jugador quiere dejar anotado que dos cosas pesaban lo mismo antes de seguir tocando. El signo es la barra vista de canto, y la primera vez se dibuja con ese gesto.

Con `=` llegan dos convenciones de escritura. Una es el renglón: cada estado se escribe abajo del anterior, y la línea de arriba no se borra. La otra es que los dos lados se escriben completos aunque uno sea un solo número, porque `12 = 12` es una igualdad tan legítima como cualquier otra y el jugador la va a necesitar para reconocer que terminó.

Lo que no aparece todavía es la escritura de la acción. En este nodo el jugador toca dos fichas y el renglón nuevo aparece; qué hizo queda implícito en la diferencia entre los dos renglones. Anotar la operación debajo de los dos lados llega en el nodo 13, cuando hay una llave que elegir y hace falta recordar cuál se eligió.

Tampoco aparecen `<` ni `>`. La balanza inclinada existe en pantalla como consecuencia de un error, no como afirmación; convertirla en afirmación es `prealg.ineq.compare_expressions`.

## 10. Definición formal

Capa `formal`: texto corto con voz y la balanza fantasma al lado. Tres frases, de a una: "Una igualdad dice que los dos lados valen lo mismo." "Si dos lados son iguales y se les hace la misma acción, siguen iguales." "El igual no ordena calcular: afirma."

Condiciones y casos especiales, verificados sobre el objeto: quitar la misma cantidad de los dos lados conserva la igualdad, y agregarla también; el plato vacío es cero y una igualdad puede tener un lado vacío; una igualdad puede ser falsa, y entonces la barra está inclinada y no hay nada que conservar sino algo que reparar; los dos lados pueden verse muy distintos y pesar lo mismo.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "igualdad" como nombre del objeto entero, y la idea de igualdad falsa, que hasta acá el jugador solo había vivido como consecuencia de una jugada suya.

## 11. Propiedades

- **Reflexiva.** Todo pesa lo mismo que sí mismo. Ligada al nivel donde los dos platos empiezan con lo mismo y el jugador gana sin tocar nada.
- **Simétrica.** Si el plato izquierdo pesa lo que el derecho, el derecho pesa lo que el izquierdo. Ligada al gesto de girar la balanza entera con dos dedos y ver que la barra no se mueve.
- **Transitiva.** Ligada a los niveles con dos balanzas que comparten un plato: si la primera y la segunda están niveladas, los extremos se pueden intercambiar y ninguna se cae.
- **Se conserva bajo la misma acción en los dos lados.** Si `a = b`, entonces `a + c = b + c` y `a − c = b − c`. Ligada a la barra que no se mueve cuando las dos manos hacen lo mismo. La versión con multiplicar y dividir necesita la llave y se completa en el nodo 13.
- **Las transformaciones son reversibles.** De `x = 7` se vuelve a `x + 5 = 12` agregando cinco de los dos lados. Ligada a devolver las pesas a los dos platos y ver que la barra sigue derecha.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias balanzas dibujadas con cargas distintas. Cuando aparece la ficha de igual, el jugador toca la que está nivelada. Los distractores son inclinaciones cada vez más pequeñas, hasta que hay que mirar la barra y no los platos.
- `explain`: tres animaciones sobre la misma balanza. En una se saca lo mismo de los dos platos y la barra sigue derecha. En otra se saca de un solo plato y se inclina. En la tercera el contenido del plato izquierdo se vuelca entero sobre el derecho, como si la barra fuera un tobogán, y el resultado se apila ignorando lo que ya había. El jugador toca las que rompen el equilibrio. Cada distractor es una misconception del nodo y elegirlo clasifica.
- `manipulate`: el jugador arrastra fichas sobre los dos platos hasta nivelar la balanza, y la ficha de igual se enciende solo cuando la barra queda horizontal.
- `apply`: balanza nivelada con una caja de un lado. El jugador saca fichas de los dos platos hasta que la caja queda sola, sin que la barra se incline en ningún paso intermedio.
- `generalize`: la balanza se desvanece y quedan fichas con el igual entre ellas. El jugador realiza la misma acción a los dos lados de la línea, con la caja a la izquierda o a la derecha según la instancia.
- `transfer`: en el reloj modular de `disc.mod.clock_equivalence`, el jugador aplica el mismo giro a las dos agujas y verifica que siguen marcando lo mismo.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). Las dos declaran la mecánica `balance`, que es la del nodo, así que las dos explicaciones corren sobre la balanza.

- **`equals_as_operator`** (`replay_on_mechanic`). Frente a `3 + 4 = □ + 2` el jugador responde `7`: leyó el igual como flecha y volcó el lado izquierdo entero. El juego congela y repite el gesto en cámara lenta sobre la balanza: las fichas del plato izquierdo se levantan y caen en el derecho, la barra se hunde de ese lado, y un halo marca el `2` que ya estaba ahí y quedó ignorado. Voz: "El igual no dice qué da. Dice que los dos platos pesan lo mismo. ¿Qué había del otro lado?". La balanza queda inclinada y el jugador nivela desde ese estado.
- **`inverse_applied_one_side`** (`replay_on_mechanic`). El jugador quita cinco de un solo plato, o en fichas pasa de `x + 5 = 12` a `x = 12`. El juego congela y repite: cinco pesas salen del plato izquierdo, ese plato sube, el derecho baja, y un halo marca el plato que nadie tocó. Voz: "Sacaste 5 de un solo plato. ¿Qué le falta al otro?". La barra sigue inclinada y el jugador la nivela desde ahí. Es la de mayor severidad del nodo y la que el nodo 13 hereda intacta.

## 13. Generalización

La analogía se retira en `symbolic`, en cuanto el jugador aplica una acción a los dos lados de la línea sin mirar los platos. La balanza queda como fantasma a demanda hasta `formal`, y desaparece del todo cuando aparecen los negativos, que la contradicen: una pesa no pesa menos que nada.

Variantes sin ayuda visual, en orden: la caja a la derecha (`12 = x + 5`); los dos lados compuestos (`3 + 4 = x + 2`); cadenas de tres estados, donde el jugador tiene que sostener la igualdad a lo largo de varios renglones; igualdades falsas que hay que reparar agregando o quitando de un lado, que es el único momento en que tocar un solo lado es lo correcto y hay que saber por qué.

Al final, acciones que no son aritméticas. Los dos platos tienen figuras de colores en vez de pesas, y las acciones disponibles son "girar todo noventa grados", "pintar de azul", "agregar 🍎". El jugador aplica la misma acción a los dos lados y verifica que la barra no se mueve, con cualquier acción y sin ningún número. Es el invariante desnudo.

El nodo está en `abstract` cuando el jugador conserva igualdades con la caja de cualquier lado y sin pedir la balanza, repara una igualdad falsa sabiendo que ahí sí toca un solo lado, y aplica el invariante a acciones que no tienen nada que ver con pesar.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`. Tres son de otras áreas y con mecánicas que no se usaron acá; el primero es la continuación de la espina y aparece en la lista porque el invariante se evalúa allí sobre un objeto nuevo, la incógnita con una operación encima.

- `alg.eq.one_step` (`balance` con `chest_key`): la misma barra, ahora con un broche que solo abre una llave. El invariante es el mismo y lo que cambia es qué acción hay que aplicar a los dos lados.
- `trig.id.double_angle` (`machine_pipe`): una identidad como tubería. Los dos lados son dos caminos distintos que entregan la misma salida, y transformarlos a la vez conserva la coincidencia.
- `disc.mod.clock_equivalence` (`gears_sequence`): dos engranajes de doce dientes marcan la misma hora. Girar los dos lo mismo conserva la coincidencia, y ahí la igualdad no es de cantidades sino de posiciones.
- `linalg.sys.row_operations` (`grid_stretch`): cada fila de una matriz es una balanza, y una operación de fila es la misma acción aplicada a los dos lados de esa fila.

Concepto siguiente: `prealg.inv.operation_as_key` ([12](12-prealg.inv.operation_as_key.md)). Frase puente, narrada sobre la última balanza, con la caja recién liberada: "Para dejar la caja sola sacaste lo mismo de los dos platos, y eso deshizo el más cinco. ¿Toda acción se puede deshacer así? Antes de volver a la balanza, mirá una acción sola, sin platos". La balanza se apaga y queda un cofre en el centro: el nodo 12 empieza ahí, en aritmética pura.

---

**Visualización:** dos escenas del YAML, nativas y sin texto rasterizado, resueltas en [I](../../I-manim/I0-mapping.md). `balance_equal_pans_stay_level` corre sobre la balanza del jugador con los dos lados y sus conteos como parámetros: la barra se mantiene derecha mientras la misma acción recorre los dos platos; gramática `invariant`, con la barra nivelada resaltada en el antes y el después. Genera también la animación correcta de `explain`. `balance_remove_one_side_tilts` toma además qué se quitó y de qué lado, y produce la inclinación con el plato intacto marcado; gramática `invariant` mostrada por su ruptura. Es la que usa el patrón `replay_on_mechanic` de las dos misconceptions, y el nodo 13 la reúsa como distractor. Las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_compare` ([M](../../M-calculadora/M0-progresion.md)), la tecla de comparación, con la forma de la barra de la balanza. Este nodo enciende solo la cara `=`: puesta entre dos expresiones armadas con fichas, la calculadora no las resuelve, responde si la barra queda derecha o inclinada y hacia qué lado. Las caras `<` y `>` se encienden con `prealg.ineq.compare_expressions`, que comparte el desbloqueo. Funciona en el modo de exploración libre, donde el jugador puede probar igualdades inventadas.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Las pesas y la caja son objetos, la acción es tocar y arrastrar, `explain` se responde eligiendo entre tres animaciones, el `=` es un dibujo antes que un signo y los prompts son de voz, escritos en formas que sirven igual para tú y para vos. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel de fichas y suele descubrir ahí que arrastraba términos por costumbre; para él, el valor del nodo está en el nivel de igualdades falsas y en el de acciones no aritméticas.
