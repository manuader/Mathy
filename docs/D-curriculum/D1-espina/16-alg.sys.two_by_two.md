# 16 — Dos balanzas comparten cajas (`alg.sys.two_by_two`)

> Locale `es`: "Dos balanzas comparten cajas". Minijuego: [El libro de frutas](../../F-minijuegos/alg.sys.two_by_two.md).

**Nodo:** `alg.sys.two_by_two` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` (secundaria `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `two_balances_shared_boxes`

## 1. Concepto

Un sistema de dos por dos son dos igualdades que hablan de las mismas dos incógnitas al mismo tiempo. Al terminar, el jugador entiende que una sola igualdad no alcanza para determinar dos cantidades y que dos sí lo hacen si dicen cosas distintas, y llega a la solución por dos caminos: reemplazar una incógnita por lo que la otra igualdad revela, o combinar las dos para que una incógnita desaparezca. Antes despejaba una caja; ahora despeja dos que se estorban.

## 2. Prerequisitos

- `alg.eq.multi_step` (nodo [14](14-alg.eq.multi_step.md)): varias llaves en orden. Se usan la pila de renglones, la garantía de que cada acción va a los dos lados, el paréntesis y la lectura de una ecuación intermedia como ecuación válida.
- `alg.expr.distributive_tiles` (nodo [15](15-alg.expr.distributive_tiles.md)): repartir el producto. Se usa para escalar una igualdad entera antes de combinarla, que es multiplicar una fila por un número y repartirlo sobre todos sus términos.

Ninguna arista es la del orden escolar, donde los sistemas llegan después de las ecuaciones lineales sin pasar por la distributiva. [C0](../../C-knowledge-graph/C0-esquema.md) exige el nodo 15 porque eliminar no es posible sin escalar una fila completa, y escalar una fila completa es repartir.

## 3. Dificultad cognitiva real

Lo difícil no es hacer dos cuentas sino cuatro capacidades:

1. **Aceptar que una igualdad con dos incógnitas no tiene una respuesta.** `x + y = 14` es verdadera para infinitos pares, y eso contradice todo lo anterior. Es la dificultad principal del nodo.
2. **Sostener dos condiciones simultáneas.** Es fácil encontrar un par que cumple una fila y romper la otra sin darse cuenta.
3. **Ver que la misma caja es la misma en las dos filas.** Suena obvio, y sin embargo es la única razón por la que el sistema se puede resolver.
4. **Combinar filas sin perder información.** Sumar dos filas produce una tercera que también es cierta; reemplazar una fila por otra cosa, no.

El nodo no declara misconceptions propias en el grafo. Las que aparecen vienen de los prerequisitos, y la sección 12 dice cuáles y sobre qué mecánica se explican.

## 4. Problema intuitivo

Un puesto de frutas con un cartel escrito a mano. Primera línea: tres manzanas y un total. Segunda línea: una manzana, una banana y otro total. Los precios no están escritos en ningún lado.

En `intuition` la escena se detiene en la primera línea, 🍎 + 🍎 + 🍎 = 30. Dos desenlaces dibujados: el total se reparte en tres partes iguales y cada manzana queda con 10; el total se pone entero sobre una manzana y las otras dos quedan vacías. El jugador elige y después ve. Después la escena avanza a la segunda línea, donde aparece una fruta nueva, y la pregunta cambia sola: con una sola línea, ¿alcanza?

Es la etapa 1 del ejemplo de frutas de [H](../../H-progresion-abstraccion.md), y el nodo recorre las etapas 1 a 3 de ese ejemplo.

## 5. Analogía del mundo real

`two_balances_shared_boxes`, con la mecánica `balance` ([G0](../../G-analogias/G0-reglas.md)). Mapa: dos balanzas → dos ecuaciones; las mismas cajas marcadas en ambas → incógnitas compartidas; volcar una balanza sobre la otra → sumar ecuaciones; cambiar una caja por su peso conocido → sustitución; las dos niveladas a la vez → solución simultánea.

Invariante: cada balanza se mantiene nivelada por su cuenta, y una acción vale si al terminar las dos siguen niveladas.

Ruptura: `contradictory_or_redundant_balances`. Dos balanzas que dicen lo mismo no agregan información, y dos que se contradicen no pueden estar niveladas a la vez. Los dos casos se juegan dentro del nodo y son la puerta a `alg.sys.parallel_or_same_line`.

El libro de frutas que el jugador ve primero es la piel concreta de esa estructura: cada renglón del cartel es una balanza acostada y las frutas son las cajas marcadas. La analogía secundaria, con `grid_stretch`, llega al final: cada fila es una recta y la solución es el cruce.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Mecánica principal `balance`, con `grid_stretch` desde el penúltimo nivel ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. El cartel con dos renglones. Cada uno tiene frutas a la izquierda y un total a la derecha, con una línea horizontal en el medio que se inclina si la fila deja de ser cierta.
2. Demostración: una mano fantasma arrastra una ficha numérica bajo la 🍎 del primer renglón. Las dos filas responden a la vez y la mano cambia la ficha hasta que las dos quedan derechas.
3. El jugador arrastra fichas numéricas bajo cada fruta. Nunca se le pide una respuesta; se le pide que las dos líneas queden derechas.
4. Desde el nivel de sustitución, tocar una fruta cuyo valor ya se conoce la reemplaza por sus pesas en las dos filas al mismo tiempo, con un morph.
5. Arrastrar un renglón entero sobre el otro los vuelca: los dos lados se juntan y la fila resultante queda derecha. Si la misma fruta aparece con signos opuestos, se cancela a la vista.
6. Éxito: las dos líneas quedan derechas al mismo tiempo y las dos frutas muestran su valor. Verificación: los valores vuelven a las filas originales, que siguen derechas.

Cuando el jugador cambia un valor en una sola fila, la otra se inclina de inmediato. Cuando vuelca una fila sin que se cancele nada, el movimiento es válido pero inútil y recibe un empujón suave, no una explicación.

## 7. Representación visual

Capa `visual`, con `invariant` como primitiva dominante ([H](../../H-progresion-abstraccion.md)).

Las frutas se aplanan en barras de color, una por tipo. Cada fila se vuelve una tira horizontal partida en segmentos, con el total al otro lado de la línea. Dos filas apiladas comparten la escala.

Se desplaza el segmento que se cancela, que sale de las dos filas a la vez cuando se vuelcan; se escala la fila entera cuando se multiplica por un número, y todos sus segmentos crecen juntos; se conserva la horizontalidad de cada línea, que es el equivalente de la barra nivelada.

Desde el penúltimo nivel aparece la grilla al costado: cada fila se dibuja como una recta y la solución como el punto de cruce.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto. Es el morph canónico de [H](../../H-progresion-abstraccion.md): 🍎 + 🍎 se vuelve `x + x` se vuelve `2x`.

1. **Fruta → letra.** Cuando el jugador reemplaza por primera vez una fruta por su valor en las dos filas, todas las 🍎 se contraen en `x` y todas las 🍌 en `y`, conservando id y posición.
2. **Repetición → coeficiente.** Al tocar dos letras iguales adyacentes, se funden: `x + x` pasa a `2x`, y el `2` hereda el id de una de ellas.
3. **Línea → `=`.** Al primer movimiento válido después del morph, la línea horizontal se contrae en el signo igual, que hereda su capacidad de inclinarse.
4. **Volcar → sumar filas.** Al arrastrar una fila sobre otra, las dos se apilan con una llave a la izquierda y aparece una tercera línea con los términos combinados.
5. **Dos renglones → sistema.** Cuando las dos ecuaciones se tratan por primera vez como un objeto único, un corchete crece a la izquierda y las abraza. Es el símbolo que nace acá.

La fruta desaparece en el paso 1 y no vuelve, ni siquiera como fantasma. La regla de [H](../../H-progresion-abstraccion.md) es explícita: lo que representa estructura puede quedarse, lo que representa un nombre debe ceder su lugar al nombre. La fruta representa la incógnita y `x` la reemplaza por completo; dejarla puesta convertiría la tabla de coeficientes en una tabla de dibujos.

## 9. Notación matemática

Queda el par de ecuaciones abrazado por la llave, con las dos incógnitas en el mismo orden en las dos filas y los términos alineados en columnas.

El símbolo nuevo es la **llave del sistema**, el corchete que agrupa dos ecuaciones y significa "las dos a la vez". El problema que lo hace necesario aparece en cuanto el jugador escribe la segunda ecuación en un renglón aparte: nada en el papel dice que hablan de la misma manzana.

La segunda convención, sin símbolo, es la **alineación en columnas**: la misma incógnita en la misma posición en las dos filas. Se vuelve necesaria al sumar filas, porque sin ella el jugador no ve qué se cancela con qué.

## 10. Definición formal

Capa `formal`: texto corto con voz y las dos rectas al lado. Tres frases, de a una: "Un sistema de dos por dos son dos igualdades sobre las mismas dos incógnitas." "Una solución es un par de valores que cumple las dos al mismo tiempo." "Dos sistemas son equivalentes si tienen exactamente las mismas soluciones."

Condiciones y casos especiales, verificados sobre la grilla: dos rectas que se cruzan dan una solución única; dos paralelas no se cruzan y el sistema no tiene solución; dos superpuestas dan infinitas. Multiplicar una ecuación por un número distinto de cero, sumarle otra o intercambiar las dos produce un sistema equivalente.

Ya jugado: las tres frases y los tres casos, en la capa concreta. Nuevo: la palabra "sistema", la palabra "equivalente" y el nombre de los dos métodos.

## 11. Propiedades

- **Una ecuación con dos incógnitas no determina un par.** Ligada al primer nivel, donde el jugador encuentra varios pares que dejan derecha una sola fila.
- **Sumar dos ecuaciones produce una ecuación cierta.** Ligada a volcar una balanza sobre la otra y ver que la que recibe sigue derecha.
- **Escalar una ecuación conserva sus soluciones.** Ligada a la fila que crece entera, y a la distributiva del nodo 15.
- **Sustituir una incógnita por una expresión equivalente conserva las soluciones.** Ligada al reemplazo simultáneo: la fruta se cambia en las dos filas o en ninguna.
- **La solución es el cruce.** Ligada a la grilla, donde el par que deja las dos líneas derechas es el único punto de las dos rectas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos balanzas con cajas de dos colores. Tocar la caja que aparece en las dos.
- `explain`: dos animaciones. En una, lo que se aprende de una balanza se reemplaza en la otra y ambas siguen niveladas; en la otra se cambia una caja solo en una balanza. Tocar la que rompe una de las balanzas.
- `manipulate`: reemplazar en la segunda balanza la caja por lo que la primera mostró, y después resolver con llaves hasta abrir las dos cajas.
- `apply`: dos recibos del mercado con precios ocultos. Arrastrar las fichas de precio que cumplen los dos, contra el tiempo objetivo del nodo.
- `generalize`: las balanzas se desvanecen y quedan dos líneas con igual. Elegir entre sustituir o sumar balanzas para eliminar una incógnita, y justificar la elección haciéndola.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar el punto donde dos rectas se cruzan y verificar que es la entrada que la matriz manda a la salida pedida.

El nodo declara la lista de misconceptions vacía, y eso es deliberado: los errores que aparecen ya están catalogados en los prerequisitos. Se aplican con la regla de [L0](../../L-modelo-errores/L0-taxonomia.md) sobre la mecánica de la explicación.

- **`variable_as_label`**, heredada del nodo 15. El jugador junta `x + y` en un solo término. Su mecánica declarada es `ledger`, que este nodo no tiene; el jugador ya la conoce del nodo 15, así que corre el caso 2 de la regla y la explicación se presenta como un regreso. El replay abre el libro de cuentas al costado, intenta fundir las dos columnas y las rechaza porque cuentan piezas distintas. Voz: "Esto ya lo viste en el libro. ¿La manzana y la banana van en la misma columna?".
- **`inverse_applied_one_side`**, heredada del nodo 13. El jugador escala una fila multiplicando solo el lado izquierdo. Su mecánica declarada es `balance`, que este nodo sí tiene, así que corre el caso 1 sin adaptación: el replay repite el gesto en cámara lenta, la línea se inclina y un halo marca el lado que no se tocó. Voz: "Duplicaste un solo lado de la fila. ¿Qué le falta al otro?".
- **`sign_flip_on_move`**, heredada del nodo 14, aparece al restar una fila de la otra cambiando el signo de un solo término. Corre sobre `balance` igual que en el nodo 14, con el replay reconstruyendo qué salió de dónde. Voz: "Restaste la fila entera o solo un pedazo. ¿Cuál de las dos?".

## 13. Generalización

La analogía se retira en `symbolic`, en dos tiempos. La fruta se va en el primer morph. Las balanzas duran más: se van cuando el jugador vuelca una fila sobre otra mirando solo los términos, y quedan como fantasma a demanda hasta el primer sistema sin solución. Ahí la grilla toma el relevo y no se retira: viaja a `alg.sys.lines_intersect`.

Variantes sin ayuda visual, en orden: coeficientes distintos de uno, que obligan a escalar antes de sumar; coeficientes que exigen escalar las dos filas; soluciones negativas y fraccionarias; sistemas sin solución; con infinitas soluciones; y sistemas desordenados, con los términos en distinto orden en cada fila.

El nodo está en `abstract` cuando el jugador resuelve por los dos métodos, elige uno según la forma del sistema y lo justifica, y clasifica un sistema en solución única, ninguna o infinitas antes de resolverlo.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.inverse_and_systems` (`grid_stretch`, `chest_key` y `balance`): el sistema como una deformación de la grilla. Resolver pasa a ser preguntar qué punto fue a parar a la salida conocida, y la respuesta es la deformación inversa.
- `linalg.sys.row_operations` (`balance` y `ledger`): el mismo movimiento de volcar filas, ahora con tres o más y con un objetivo de forma.
- `linalg.basis.in_span_or_not` (`sorter` y `grid_stretch`): si un sistema tiene solución, preguntado sin resolverlo. El total se clasifica en alcanzable o no con las piezas disponibles.

Concepto siguiente: `alg.fn.function_as_machine` ([17](17-alg.fn.function_as_machine.md)). Frase puente, narrada sobre el último sistema resuelto: "Acá buscabas el valor que hace verdadera la igualdad. ¿Y si en vez de un valor buscaras la regla que convierte cualquier entrada en su salida?". Una de las filas se estira, se cierra sobre sí misma y queda como una caja con un tubo de entrada y uno de salida, y el nodo 17 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `balance_two_scales_shared_boxes` es nativa: recibe las dos ecuaciones como árboles y el id de la incógnita compartida, y dibuja las dos balanzas respondiendo a la vez cuando se toca una caja marcada; gramática `invariant`. Produce las animaciones de `explain` y los replays de las tres misconceptions heredadas. `grid_two_lines_cross` es nativa y aparece desde el penúltimo nivel: dibuja cada fila como una recta, marca el cruce y muestra los casos paralelo y superpuesto; gramática `deform`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_solve_system` ([M](../../M-calculadora/M0-progresion.md)), un ícono con la llave del sistema, disponible sobre dos ecuaciones armadas con fichas y agrupadas. No devuelve el par solo: escribe la secuencia de filas, marcando qué fila se escaló y cuál se volcó sobre cuál, y ofrece dibujar las dos rectas. Si el nodo decae, la llave se abre y deja las dos filas sueltas.

**Edad universal:** el nodo es `icons` porque las fichas numéricas bajo las frutas llevan dígitos desde el primer nivel ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: frutas por dibujo, filas que se inclinan, arrastre de fichas, `explain` entre dos animaciones y prompts por voz; el cartel del puesto no tiene palabras. Un adulto llega por diagnóstico saltando `real` e `intuition`, y con él las frutas se usan una sola vez, en un nivel de calentamiento, porque suele reconocer el acertijo de 🍎 + 🍎 + 🍎 = 30; a partir del segundo nivel trabaja con cajas y letras.
