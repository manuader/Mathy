# 16 — Dos balanzas comparten cajas (`alg.sys.two_by_two`)

> Locale `es`: "Dos balanzas comparten cajas". Minijuego: [El libro de frutas](../../F-minijuegos/alg.sys.two_by_two.md).

**Nodo:** `alg.sys.two_by_two` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` (secundaria `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `two_balances_shared_boxes`

## 1. Concepto

Un sistema de dos por dos son dos igualdades que hablan de las mismas dos incógnitas al mismo tiempo. Al terminar, el jugador entiende que una sola igualdad no alcanza para determinar dos cantidades, que dos sí lo hacen si dicen cosas distintas, y sabe llegar a la solución por dos caminos: reemplazar una incógnita por lo que la otra igualdad revela, o combinar las dos igualdades para que una incógnita desaparezca. Antes despejaba una caja; ahora despeja dos que se estorban.

## 2. Prerequisitos

- `alg.eq.multi_step` (nodo [14](14-alg.eq.multi_step.md)): varias llaves en orden. Se usa la pila de renglones, la garantía de que cada acción va a los dos lados, el paréntesis y la lectura de una ecuación intermedia como ecuación válida. Sin eso, la sustitución produce una ecuación de varias capas que el jugador no sabría abrir.
- `alg.expr.distributive_tiles` (nodo [15](15-alg.expr.distributive_tiles.md)): repartir el producto. Se usa para escalar una igualdad entera antes de combinarla, que es multiplicar una fila por un número y repartirlo sobre todos sus términos, y para sustituir una expresión con suma dentro de un producto.

Ninguna arista es la del orden escolar, donde los sistemas llegan después de las ecuaciones lineales sin pasar por la distributiva. [C0](../../C-knowledge-graph/C0-esquema.md) exige el nodo 15 porque el método de eliminación no es posible sin escalar una fila completa, y escalar una fila completa es repartir.

## 3. Dificultad cognitiva real

Lo difícil no es hacer dos cuentas sino cuatro capacidades:

1. **Aceptar que una igualdad con dos incógnitas no tiene una respuesta.** `x + y = 14` es verdadera para infinitos pares. El jugador viene de doce nodos donde toda igualdad tenía una solución, y esto lo contradice. Es la dificultad principal del nodo.
2. **Sostener dos condiciones simultáneas.** Un par tiene que cumplir las dos filas a la vez. Es fácil encontrar un par que cumple una y romper la otra sin darse cuenta.
3. **Ver que la misma caja es la misma en las dos filas.** La manzana de la primera fila y la de la segunda valen lo mismo. Suena obvio dicho así, y sin embargo es la única razón por la que el sistema se puede resolver.
4. **Combinar filas sin perder información.** Sumar dos filas es legítimo y produce una tercera que también es cierta. Reemplazar una fila por otra cosa no lo es. La diferencia se siente cuando el jugador se queda sin filas suficientes.

El nodo no declara misconceptions propias en el grafo. Las que aparecen vienen de los prerequisitos, y la sección 12 explica cuáles y sobre qué mecánica se explican.

## 4. Problema intuitivo

Un puesto de frutas con un cartel escrito a mano. Primera línea: tres manzanas y un total. Segunda línea: una manzana, una banana y otro total. Tercera línea: una manzana, una banana quitada y un tercer total. Los precios de las frutas no están escritos en ningún lado.

En `intuition` la escena se detiene en la primera línea, 🍎 + 🍎 + 🍎 = 30. Dos desenlaces dibujados: el total se reparte en tres partes iguales y cada manzana queda con 10; el total se pone entero sobre una manzana y las otras dos quedan vacías. El jugador elige y después ve. Después la escena avanza a la segunda línea, donde aparece una fruta nueva, y la pregunta cambia sola: con una sola línea, ¿alcanza?

Es la etapa 1 del ejemplo de frutas de [H](../../H-progresion-abstraccion.md), y el nodo entero recorre las etapas 1 a 3 de ese ejemplo.

## 5. Analogía del mundo real

`two_balances_shared_boxes`, con la mecánica `balance` ([G0](../../G-analogias/G0-reglas.md)). Mapa: dos balanzas → dos ecuaciones; las mismas cajas marcadas en ambas → incógnitas compartidas; volcar una balanza sobre la otra → sumar ecuaciones; cambiar una caja por su peso conocido → sustitución; las dos niveladas al mismo tiempo → solución simultánea.

Invariante: cada balanza se mantiene nivelada por su cuenta, y cualquier acción vale si las dos siguen niveladas al terminar. Volcar el contenido de una balanza entera sobre un plato de la otra conserva la nivelación de la que recibe, porque lo que entra en un plato pesa lo mismo que lo que entra en el otro.

Ruptura: `contradictory_or_redundant_balances`. Dos balanzas que dicen lo mismo no agregan información, y dos que se contradicen no pueden estar niveladas a la vez. Los dos casos se juegan dentro del nodo y son la puerta a `alg.sys.parallel_or_same_line`.

La analogía del mercado que el jugador ve primero, el libro de frutas, es la piel concreta de la misma estructura: cada renglón del cartel es una balanza acostada, el total es el otro plato. Las frutas son las cajas marcadas. Y la analogía secundaria, con `grid_stretch`, llega al final: cada fila es una recta sobre la grilla, y la solución es el punto donde se cruzan. Las balanzas responden "cuánto vale cada caja"; la grilla responde "por qué a veces no hay respuesta".

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Mecánica principal `balance`, con `grid_stretch` desde el penúltimo nivel ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. El cartel del puesto con dos renglones. Cada renglón tiene frutas a la izquierda y un total a la derecha, con una línea horizontal entre ellos que se comporta como la barra de la balanza: se inclina si la fila deja de ser cierta.
2. Demostración: una mano fantasma arrastra una ficha numérica bajo la 🍎 del primer renglón. Las dos filas responden a la vez, porque la manzana es la misma en las dos. La primera queda derecha, la segunda se inclina. La mano cambia la ficha hasta que las dos quedan derechas.
3. El jugador arrastra fichas numéricas bajo cada fruta. Nunca se le pide una respuesta; se le pide que las dos líneas queden derechas.
4. Desde el nivel de sustitución, tocar una fruta cuyo valor ya se conoce la reemplaza por sus pesas en las dos filas al mismo tiempo. El reemplazo es un morph, y la fruta no desaparece de un lado sí y del otro no.
5. Arrastrar un renglón entero sobre el otro los vuelca: los dos lados se juntan y la fila resultante queda derecha. Si en las dos filas la misma fruta aparece con signos opuestos, se cancela a la vista y la fila nueva tiene una fruta menos.
6. Éxito: las dos líneas quedan derechas al mismo tiempo y las dos frutas muestran su valor. Verificación: los valores vuelven a las filas originales, que siguen derechas.

Cuando el jugador cambia un valor en una sola fila, la otra se inclina de inmediato y la fruta que cambió late en las dos. Cuando vuelca una fila sobre la otra sin que se cancele nada, el movimiento es válido pero inútil: la fila nueva aparece con las dos frutas todavía adentro y recibe un empujón suave, no una explicación.

## 7. Representación visual

Capa `visual`, con `invariant` como primitiva dominante ([H](../../H-progresion-abstraccion.md)).

Las frutas se aplanan en barras de color: todas las manzanas comparten un color y un largo, todas las bananas otro. Cada fila se vuelve una tira horizontal partida en segmentos, con el total como un segmento de referencia al otro lado de la línea. Dos filas apiladas comparten la escala, así que un segmento de manzana mide igual en las dos.

Se desplaza el segmento que se cancela, que sale de las dos filas a la vez cuando se vuelcan; se escala la fila entera cuando se multiplica por un número, y todos sus segmentos crecen juntos; se conserva la horizontalidad de cada línea, que es el equivalente de la barra nivelada.

Desde el penúltimo nivel aparece la grilla al costado: cada fila se dibuja como una recta, y la solución como el punto de cruce. Las dos representaciones comparten ids, así que mover una ficha en la fila mueve la recta.

Todavía no hay llaves ni `=` en las filas: el igual es la línea horizontal, y las llaves llegan cuando la fila se convierte en una ecuación de una sola incógnita.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto. Es el morph canónico de [H](../../H-progresion-abstraccion.md): 🍎 + 🍎 se vuelve `x + x` se vuelve `2x`.

1. **Fruta → letra.** Cuando el jugador reemplaza por primera vez una fruta por su valor en las dos filas, todas las 🍎 de la pantalla se contraen en `x` y todas las 🍌 en `y`, conservando su id y su posición. La fila sigue siendo la misma fila, con los mismos totales.
2. **Repetición → coeficiente.** Al tocar dos letras iguales adyacentes, se funden: `x + x` pasa a `2x`, y el `2` hereda el id de una de ellas. Es la contracción que ya ocurrió en el libro de cuentas del nodo 15.
3. **Línea → `=`.** Al primer movimiento válido después del morph, la línea horizontal se contrae en el signo igual, que hereda su capacidad de inclinarse. Queda `x + y = 14` sobre un renglón.
4. **Volcar → sumar filas.** Al arrastrar una fila sobre otra en la capa simbólica, las dos se apilan con una llave a la izquierda y aparece una tercera línea debajo, con los términos ya combinados y los cancelados desvaneciéndose en su lugar.
5. **Dos renglones → sistema con llave.** Cuando las dos ecuaciones se tratan por primera vez como un objeto único, un corchete crece a la izquierda de los dos renglones y los abraza. Es el símbolo que nace en este nodo.

La fruta desaparece en el paso 1 y no vuelve, ni siquiera como fantasma a demanda. La regla de [H](../../H-progresion-abstraccion.md) es explícita: lo que representa estructura puede quedarse, lo que representa un nombre debe ceder su lugar al nombre. La fruta representa la incógnita, y `x` la reemplaza por completo. Dejarla puesta convertiría la tabla de coeficientes en una tabla de dibujos y el jugador buscaría en el dibujo un significado que ya no tiene.

## 9. Notación matemática

Queda el par de ecuaciones abrazado por la llave, con las dos incógnitas en el mismo orden en las dos filas y los términos alineados en columnas.

El símbolo nuevo es la **llave del sistema**, el corchete que agrupa dos ecuaciones y significa "las dos a la vez". El problema que lo hace necesario aparece en cuanto el jugador escribe la segunda ecuación en un renglón aparte: nada en el papel dice que hablan de la misma manzana, y sin esa marca las dos filas se leen como dos problemas sucesivos. La llave es la marca de simultaneidad, y es exactamente lo que en la pantalla hacía que las dos barras se movieran juntas.

La segunda convención, sin símbolo, es la **alineación en columnas**: la misma incógnita en la misma posición en las dos filas. Se vuelve necesaria al sumar filas, porque sin alineación el jugador no ve qué se cancela con qué. Es el paso previo a la tabla de coeficientes de `linalg.map.linear_transformation_2d`.

## 10. Definición formal

Capa `formal`: texto corto con voz y las dos rectas de la grilla al lado. Tres frases, de a una: "Un sistema de dos por dos son dos igualdades sobre las mismas dos incógnitas." "Una solución es un par de valores que cumple las dos al mismo tiempo." "Dos sistemas son equivalentes si tienen exactamente las mismas soluciones."

Condiciones y casos especiales, verificados sobre la grilla: dos rectas que se cruzan en un punto dan una solución única; dos rectas paralelas no se cruzan y el sistema no tiene solución, y en las balanzas eso se ve como dos que no pueden estar niveladas a la vez; dos rectas superpuestas dan infinitas soluciones, y en las balanzas es la misma balanza escrita dos veces. Multiplicar una ecuación por un número distinto de cero, sumarle otra ecuación o intercambiar las dos produce un sistema equivalente.

Ya jugado: las tres frases y los tres casos, en la capa concreta. Nuevo: la palabra "sistema", la palabra "equivalente" aplicada a un par de ecuaciones, y el nombre de los dos métodos.

## 11. Propiedades

- **Una ecuación con dos incógnitas no determina un par.** Ligada al primer nivel, donde el jugador encuentra varios pares que dejan derecha una sola fila.
- **Sumar dos ecuaciones produce una ecuación cierta.** Si `a = b` y `c = d`, entonces `a + c = b + d`. Ligada a volcar una balanza sobre la otra y ver que la que recibe sigue derecha.
- **Escalar una ecuación conserva sus soluciones.** Multiplicar los dos lados por el mismo número distinto de cero. Ligada a la fila que crece entera, con todos sus segmentos, y a la distributiva del nodo 15.
- **Sustituir una incógnita por una expresión equivalente conserva las soluciones.** Ligada al reemplazo simultáneo en las dos filas: la fruta se cambia en las dos o en ninguna.
- **La solución es el cruce.** Ligada a la grilla, donde el par que deja las dos líneas derechas es el único punto que pertenece a las dos rectas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos balanzas con cajas de dos colores. Tocar la caja que aparece en las dos balanzas. En los niveles con frutas, tocar la fruta compartida.
- `explain`: dos animaciones. En una, lo que se aprende de una balanza se reemplaza en la otra y las dos siguen niveladas; en la otra, se cambia una caja solo en una balanza y esa queda derecha mientras la otra se inclina. Tocar la que rompe una de las balanzas.
- `manipulate`: reemplazar en la segunda balanza la caja por lo que la primera mostró, y después resolver con llaves hasta abrir las dos cajas.
- `apply`: dos recibos del mercado con precios ocultos. Arrastrar las fichas de precio que cumplen los dos recibos, contra el tiempo objetivo del nodo.
- `generalize`: las balanzas se desvanecen y quedan dos líneas con igual. Elegir entre sustituir o sumar balanzas para eliminar una incógnita, y justificar la elección haciéndola.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar el punto donde dos rectas se cruzan y verificar que es la entrada que la matriz manda a la salida pedida.

El nodo declara la lista de misconceptions vacía en el grafo, y eso es deliberado: los errores que aparecen acá ya están catalogados en los prerequisitos. Se aplican con la regla de [L0](../../L-modelo-errores/L0-taxonomia.md) sobre la mecánica de la explicación.

- **`variable_as_label`**, heredada del nodo 15. El jugador trata las dos letras como nombres y junta `x + y` en un solo término, o cambia la manzana en una fila y no en la otra como si fueran manzanas distintas. Su mecánica declarada es `ledger`, que este nodo no tiene entre las suyas; el jugador ya la conoce del nodo 15, así que corre el caso 2 de la regla y la explicación se presenta como un regreso. El replay abre el libro de cuentas al costado, intenta fundir las dos columnas y las rechaza porque cuentan piezas distintas, y después vuelve a las filas. Voz: "Esto ya lo viste en el libro. ¿La manzana y la banana van en la misma columna?".
- **`inverse_applied_one_side`**, heredada del nodo 13. El jugador escala una fila multiplicando solo el lado izquierdo, o quita un término de un lado al sumar filas. Su mecánica declarada es `balance`, que este nodo sí tiene, así que corre el caso 1 sin adaptación: el replay repite el gesto en cámara lenta, la línea se inclina y un halo marca el lado que no se tocó. Voz: "Duplicaste un solo lado de la fila. ¿Qué le falta al otro?".
- **`sign_flip_on_move`**, heredada del nodo 14, aparece al restar una fila de la otra: el jugador cambia el signo de un solo término. Corre sobre `balance` igual que en el nodo 14, con el replay reconstruyendo qué salió de dónde. Voz: "Restaste la fila entera o solo un pedazo. ¿Cuál de las dos?".

Los distractores de `explain` se generan desde las reglas `detect` de estas tres.

## 13. Generalización

La analogía se retira en `symbolic`, y el retiro tiene dos partes con ritmos distintos. La fruta se va en el primer morph y no vuelve, por la razón del nodo. Las balanzas duran un poco más: se van cuando el jugador vuelca una fila sobre otra mirando solo los términos, sin comprobar la horizontalidad. Quedan como fantasma a demanda hasta que aparece el primer sistema sin solución, donde una balanza que nunca puede nivelarse es más confusa que dos rectas paralelas. Ahí la grilla toma el relevo y no se retira: es la representación que sobrevive al nodo y viaja a `alg.sys.lines_intersect`.

Variantes sin ayuda visual, en orden: coeficientes distintos de uno, que obligan a escalar antes de sumar; coeficientes que exigen escalar las dos filas; soluciones negativas y fraccionarias; sistemas sin solución; sistemas con infinitas soluciones; y sistemas presentados desordenados, con los términos en distinto orden en cada fila, para que la alineación en columnas sea una decisión del jugador y no un regalo del enunciado.

El nodo está en `abstract` cuando el jugador resuelve por los dos métodos, elige uno según la forma del sistema y lo justifica, y clasifica un sistema en solución única, ninguna o infinitas antes de resolverlo, mirando la relación entre las dos filas.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.inverse_and_systems` (`grid_stretch`, `chest_key` y `balance`): el sistema como una deformación de la grilla. Resolver deja de ser combinar filas y pasa a ser preguntar qué punto fue a parar a la salida conocida, y la respuesta es la deformación inversa.
- `linalg.sys.row_operations` (`balance` y `ledger`): el mismo movimiento de volcar filas, ahora con tres o más y con un objetivo de forma. Lo que acá era una decisión se vuelve un procedimiento con criterio de parada.
- `linalg.basis.in_span_or_not` (`sorter` y `grid_stretch`): la pregunta de si un sistema tiene solución, hecha sin resolverlo. El total se clasifica en alcanzable o no alcanzable con las piezas disponibles, y los casos sin solución de este nodo son el ejemplo más chico.

Concepto siguiente: `alg.fn.function_as_machine` ([17](17-alg.fn.function_as_machine.md)). Frase puente, narrada sobre el último sistema resuelto: "Acá buscabas el valor que hace verdadera la igualdad. ¿Y si en vez de un valor buscaras la regla que convierte cualquier entrada en su salida?". Una de las filas se estira, se cierra sobre sí misma y queda como una caja con un tubo de entrada y uno de salida, y el nodo 17 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `balance_two_scales_shared_boxes` es nativa: recibe las dos ecuaciones como árboles y el id de la incógnita compartida, y dibuja las dos balanzas respondiendo a la vez cuando se toca una caja marcada; gramática `invariant`, con destello sobre la caja compartida y con la inclinación de la fila que se rompe. Es la que produce las animaciones de `explain` y los replays de las tres misconceptions heredadas. `grid_two_lines_cross` es nativa y aparece desde el penúltimo nivel: dibuja cada fila como una recta y marca el cruce con un destello, y es la que muestra los casos paralelo y superpuesto; gramática `deform`. Las dos comparten ids con las fichas del renglón, que es lo que permite que mover una ficha mueva una recta. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsan `balance_key_both_sides` (nodo 13) para el tramo final de cada fila, ya con una sola incógnita, y `ledger_a_times_sum` (nodo 15) para el regreso al libro en la explicación de `variable_as_label`.

**Calculadora:** en `ready` se habilita `op_solve_system` ([M](../../M-calculadora/M0-progresion.md)), un ícono con la llave del sistema, disponible sobre dos ecuaciones armadas con fichas y agrupadas. No devuelve el par solo: escribe la secuencia de filas, marcando en cada paso qué fila se escaló y cuál se volcó sobre cuál, en el mismo formato que el jugador usa en el minijuego, y ofrece dibujar las dos rectas. Cuando el sistema no tiene solución o tiene infinitas, muestra las rectas antes que cualquier renglón. Si el nodo decae, la llave del ícono se abre y deja las dos filas sueltas.

**Edad universal:** el nodo es `icons` porque las fichas numéricas bajo las frutas llevan dígitos desde el primer nivel ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: frutas por dibujo, filas que se inclinan, arrastre de fichas, `explain` entre dos animaciones y prompts por voz. El cartel del puesto no tiene palabras, solo dibujos y números. Un adulto llega por diagnóstico saltando `real` e `intuition`, y con él las frutas se usan una sola vez, en un nivel de calentamiento, porque suelen reconocer el acertijo de 🍎 + 🍎 + 🍎 = 30 y eso da una entrada rápida sin que el nodo parezca infantil; a partir del segundo nivel trabaja con cajas marcadas y letras.
