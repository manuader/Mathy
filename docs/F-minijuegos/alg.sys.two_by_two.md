# El libro de frutas (`alg.sys.two_by_two`)

Minijuego del nodo 16 de la espina, "Dos balanzas comparten cajas". Mecánica principal `balance`, secundaria `grid_stretch`; analogía `two_balances_shared_boxes`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/16-alg.sys.two_by_two.md): un concepto, cuatro dificultades reales, una analogía con su piel de mercado, cinco pasos de desvanecimiento, las dos filas que se inclinan como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un cartel de puesto de frutas con dos renglones escritos a mano. Cada renglón tiene frutas a la izquierda, una línea horizontal en el medio y un total a la derecha. La línea se comporta como la barra de una balanza acostada: se inclina si la fila deja de ser cierta.

Mapa objeto → concepto: renglón → ecuación; los dos renglones a la vez → sistema; 🍎 y 🍌 → las dos incógnitas; la misma fruta en las dos filas → incógnita compartida; línea horizontal → igual; volcar un renglón sobre el otro → sumar ecuaciones; cambiar una fruta por su valor en las dos filas → sustitución; las dos líneas derechas al mismo tiempo → solución simultánea.

Las frutas son la piel concreta de las cajas marcadas de `two_balances_shared_boxes`.

Punto de ruptura: `contradictory_or_redundant_balances`. Dos filas que dicen lo mismo no agregan nada, y dos que se contradicen no pueden estar derechas a la vez. Los dos casos se juegan dentro del nodo, y ahí la grilla toma el relevo y muestra rectas paralelas o superpuestas ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el cartel con los dos renglones en el centro, la bandeja de fichas numéricas abajo, la grilla plegada a la derecha desde el penúltimo nivel. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una ficha numérica bajo una fruta.** Las dos filas responden a la vez, porque la fruta es la misma en las dos. La que se cumple queda derecha; la que no, se inclina.
- **Tocar una fruta cuyo valor ya se conoce.** La reemplaza por sus pesas en las dos filas al mismo tiempo, con un morph. El reemplazo nunca ocurre en una sola fila.
- **Arrastrar un renglón entero sobre el otro.** Los dos lados se juntan y aparece una fila nueva debajo, que queda derecha. Si la misma fruta aparece con signos opuestos, se cancela a la vista.
- **Pellizcar un renglón.** Lo escala: todos sus términos crecen juntos, incluido el total. Es la distributiva del nodo 15 aplicada a una fila entera.
- **Volcar sin que se cancele nada.** El movimiento es válido y la fila nueva aparece con las dos frutas todavía adentro. Empujón suave, no explicación.
- **Cambiar un valor en una sola fila.** La otra se inclina de inmediato.
- **Tocar la grilla.** Se despliega y dibuja cada fila como una recta, con el cruce marcado.
- **Tocar el resultado.** Devuelve los dos valores a las filas originales, que quedan derechas. Es la verificación.

En `symbolic` la superficie cambia de forma, no de reglas. Las filas son renglones abrazados por una llave; volcar es arrastrar un renglón sobre el otro; escalar es soltar una ficha de factor sobre el renglón entero. Cuando una fila queda con una sola incógnita, el llavero del nodo 14 reaparece y el tramo final se resuelve con llaves.

## Invariante matemático

`equality_under_identical_actions` (balanza), en su versión doble: cada fila se mantiene derecha por su cuenta, y una acción es válida si al terminar las dos siguen derechas. Se ve romperse de tres maneras: cambiar un valor en una sola fila inclina la otra; escalar un solo lado de una fila la inclina a ella; restar mal una fila deja un término con el signo viejo.

Hay un segundo invariante, más silencioso y más importante: **la misma fruta vale lo mismo en todas partes**. No se rompe nunca porque el juego no lo permite; se hace visible en que toda ficha soltada bajo una fruta aparece bajo todas sus apariciones al mismo tiempo.

`lines_stay_lines_origin_fixed` (grilla) entra en el penúltimo nivel para mostrar que dos rectas paralelas no tienen punto en común y dos superpuestas tienen infinitos.

## Representación visual

Primitiva dominante `invariant`, de apoyo `deform` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el puesto, el cartel escrito a mano, 🍎 + 🍎 + 🍎 = 30. Solo se mira y se predice. Etapa 1 del ejemplo de frutas de H.
- `concrete`: las dos filas con frutas dibujadas y fichas numéricas arrastrables debajo. Etapa 2 de H.
- `visual`: las frutas se aplanan en barras de color. Cada fila es una tira partida en segmentos con el total al otro lado de la línea.
- `symbolic`: los renglones con `x` e `y`, alineados en columnas y abrazados por la llave del sistema, y la grilla al costado.
- `formal`: la definición corta con voz y las tres configuraciones de rectas al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables. Es el morph canónico de H: 🍎 + 🍎 se vuelve `x + x` se vuelve `2x`.

1. Fruta → letra: al reemplazar por primera vez una fruta por su valor en las dos filas, todas las 🍎 se contraen en `x` y todas las 🍌 en `y`.
2. Repetición → coeficiente: al tocar dos letras iguales adyacentes, se funden en `2x`, y el `2` hereda el id de una de ellas.
3. Línea → `=`: al primer movimiento válido después del morph, la línea horizontal se contrae en el signo igual.
4. Volcar → sumar filas: al arrastrar una fila sobre otra, las dos se apilan con una llave a la izquierda y aparece una tercera línea con los términos combinados.
5. Dos renglones → sistema: cuando las dos ecuaciones se tratan por primera vez como un objeto único, un corchete crece a la izquierda y las abraza. Es el símbolo que nace acá.

La fruta desaparece en el paso 1 y no vuelve, ni siquiera como fantasma. La regla de H es explícita: la fruta representa la incógnita y `x` la reemplaza por completo; dejarla puesta convertiría la tabla de coeficientes en una tabla de dibujos.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre las dos rectas: un sistema de dos por dos son dos igualdades sobre las mismas dos incógnitas; una solución es un par de valores que cumple las dos al mismo tiempo; dos sistemas son equivalentes si tienen exactamente las mismas soluciones.

Propiedades: una ecuación con dos incógnitas no determina un par; sumar dos ecuaciones produce una ecuación cierta; escalar una ecuación por un número distinto de cero conserva sus soluciones; sustituir una incógnita por una expresión equivalente también; la solución es el cruce de las dos rectas. Casos límite: rectas paralelas, sin solución; superpuestas, infinitas soluciones.

Símbolo nuevo: la llave que agrupa las dos ecuaciones y significa "las dos a la vez". Nace porque, escritas en renglones separados, nada dice que hablan de la misma manzana. Convención nueva: la alineación en columnas, necesaria para ver qué se cancela con qué al sumar filas.

## Generalización

La fruta se va en el primer morph. Las balanzas se retiran cuando el jugador vuelca una fila mirando solo los términos, y quedan como fantasma a demanda hasta el primer sistema sin solución. Ahí la grilla toma el relevo y no se retira, porque viaja a `alg.sys.lines_intersect`.

Variantes sin ayuda visual: coeficientes distintos de uno; coeficientes que exigen escalar las dos filas; soluciones negativas y fraccionarias; sistemas sin solución; con infinitas soluciones; y sistemas desordenados, con los términos en distinto orden en cada fila. Cuando el jugador resuelve por los dos métodos, elige uno según la forma del sistema y clasifica un sistema antes de resolverlo, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de frutas de [H](../H-progresion-abstraccion.md): las etapas 1 a 3 son de este nodo. La etapa 1, 🍎 + 🍎 + 🍎 = 30, es el nivel de entrada; la etapa 2, dos filas que comparten frutas, es el corazón del minijuego; la etapa 3 es el morph a `x + y = 14` y la operación sobre filas. Las etapas 4 a 6 pertenecen a `linalg` y se alcanzan por transferencia.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una fruta sola.** `concrete`, `manipulate`. Una fila con la misma fruta repetida y un total. Repartir el total hasta que la línea queda derecha.
2. **Dos frutas, una fila.** `concrete`, `recognize` y `explain`. Una sola fila con 🍎 y 🍌. El jugador encuentra varios pares que la dejan derecha y descubre que ninguno es "la" respuesta.
3. **Dos filas.** `concrete`, `manipulate`. Las dos frutas en las dos filas, con coeficientes uno. Sustitución por toque. Aparece `variable_as_label`.
4. **Barras y segmentos.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; las frutas son barras y las filas son tiras. Se introduce volcar una fila sobre la otra.
5. **Letras y llave.** `symbolic` primera mitad, `manipulate` y `apply`. Ocurre el morph completo. Los coeficientes dejan de ser uno y hay que escalar antes de volcar. Aparecen `inverse_applied_one_side` y `sign_flip_on_move`.
6. **Elegir el método.** `symbolic` segunda mitad, `apply`. Parámetros: escalar las dos filas, soluciones negativas y fraccionarias, filas desordenadas.
7. **Cuando no hay cruce.** `formal` y `abstract`, `generalize`. Se despliega la grilla. Sistemas sin solución y con infinitas. Definición corta con voz y clasificación antes de resolver.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo participa en dos. `ch.alg.two_receipts_system`, de tier training, lo requiere junto con `alg.eq.word_to_equation`: dos tickets del mercado con precios ocultos, donde el dato que falta es la segunda ecuación, que se descubre leyendo el segundo ticket como balanza, y después una incógnita aislada, que se descubre eliminando por escalado. Sus referencias de cheatsheet son `cs.alg.substitution_method` y `cs.alg.elimination_method`, las dos entradas que el nodo agrega. `ch.alg.symmetric_sum_of_squares`, de tier internacional, lo requiere junto con `alg.expr.binomial_product`: dos números de los que se conoce la suma y el producto, y hay que calcular la suma de sus cuadrados sin averiguarlos.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: dos balanzas con cajas de dos colores. Tocar la caja que aparece en las dos.
- `explain`: dos animaciones sobre las mismas dos filas. En una, lo que la primera reveló se reemplaza en la segunda y las dos siguen derechas; en la otra se cambia una caja solo en una fila, que queda derecha mientras la otra se inclina. Tocar la que rompe una de las balanzas.
- `manipulate`: 🍎 + 🍌 = 14 y 🍎 − 🍌 = 4. Reemplazar en la segunda fila lo que la primera mostró y resolver con llaves hasta que las dos frutas muestren su valor.
- `apply`: dos recibos con precios ocultos. Arrastrar las fichas de precio que cumplen los dos, contra el tiempo objetivo del nodo.
- `generalize`: sin balanzas, `3x + 2y = 16` y `5x − 2y = 8`. Elegir entre sustituir o sumar filas, y hacerlo. Y un segundo ítem con `2x + 4y = 10` y `x + 2y = 7`, donde no hay solución y hay que decirlo desplegando la grilla.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar el punto donde dos rectas se cruzan y verificar que es la entrada que la matriz manda a la salida pedida. También en `linalg.sys.row_operations` y `linalg.basis.in_span_or_not`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). El nodo declara la lista vacía en el grafo: las que aparecen vienen de los prerequisitos y se aplican con la regla sobre la mecánica de la explicación.

- `variable_as_label`, heredada del nodo 15, patrón `replay_on_mechanic`. Su mecánica declarada es `ledger`, que este nodo no tiene, pero el jugador ya la conoce del nodo 15: corre el caso 2 de la regla y la explicación se presenta como un regreso. El libro de cuentas se abre al costado, las dos columnas se rechazan, y la escena vuelve a las filas. Voz: "Esto ya lo viste en el libro. ¿La manzana y la banana van en la misma columna?".
- `inverse_applied_one_side`, heredada del nodo 13, patrón `replay_on_mechanic` sobre `balance`, que el nodo sí declara: corre el caso 1, sin adaptación. El gesto se repite en cámara lenta, la línea se inclina y un halo marca el lado que no se tocó. Voz: "Duplicaste un solo lado de la fila. ¿Qué le falta al otro?".
- `sign_flip_on_move`, heredada del nodo 14, patrón `replay_on_mechanic` sobre `balance`. Aparece al restar una fila de la otra cambiando el signo de un solo término. Voz: "Restaste la fila entera o solo un pedazo. ¿Cuál de las dos?".

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `balance_two_scales_shared_boxes`, nativa. Recibe las dos ecuaciones como árboles y el id de la incógnita compartida, y dibuja las dos balanzas respondiendo a la vez cuando se toca una caja marcada; gramática `invariant`. Produce las animaciones de `explain` y los tres replays.
- `grid_two_lines_cross`, nativa, desde el nivel 6. Dibuja cada fila como una recta y marca el cruce; muestra los casos paralelo y superpuesto; gramática `deform`.
- Reusadas: `balance_key_both_sides` (nodo 13), para el tramo final de cada fila, y `ledger_a_times_sum` (nodo 15), para el regreso al libro.

Ninguna lleva texto rasterizado: los totales, las letras y los coeficientes los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_fruit_ledger`: `rows` (1 en el nivel 1, 2 desde el 2); `fruits` (1 o 2, nunca más); `repeat_range`; `total_range`; `allow_subtraction` (verdadero desde el nivel 3, apoyado en `arith.int.negatives`); `seed`.
- `gen_two_balances`: `coefficients` como matriz de dos por dos; `totals`; `solution_range`; `scaling_needed` en {none, one_row, both_rows}; `shuffled_terms` (booleano, desde el nivel 6); `degenerate` en {none, no_solution, infinite}; `seed`.
- `gen_line_pair`: deriva del anterior y produce las dos rectas para la grilla, con `window` e `intersection_visible`.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer, pero las fichas numéricas llevan dígitos desde el primer nivel y por eso el mínimo es `icons`. En `full_text` la definición corta y los nombres de los dos métodos se muestran escritos además de narrados.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra una ficha numérica bajo la 🍎 del primer renglón y las dos filas responden a la vez. La mano cambia la ficha hasta que las dos quedan derechas. Se repite solo si el jugador se queda quieto. Volcar una fila sobre la otra se demuestra en el nivel 4, y el pellizco que escala una fila en el nivel 5, una vez cada uno ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
