# El piso de dos habitaciones (`alg.expr.distributive_tiles`)

Minijuego del nodo 15 de la espina, "Repartir el producto en baldosas". Mecánica principal `tiles`, secundaria `ledger`; analogía `tile_floor_two_rooms`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/15-alg.expr.distributive_tiles.md): un concepto, cuatro dificultades reales (que el ancho llega a todo el largo, que la letra es una longitud y no una etiqueta, que partir los dos lados da cuatro zonas y no dos, y que un `=` puede no pedir nada), una analogía que se elige porque tiene área y el libro de cuentas no, un gesto (sacar y poner la pared con el piso cubierto), cinco pasos de desvanecimiento, el rectángulo como visualización dominante, retiro en `symbolic` cuando aparece la primera resta. Acá se fija cómo se juega.

## Analogía

Dos habitaciones pegadas con el mismo ancho, separadas por una pared baja. La de la izquierda tiene un largo desconocido, marcado con una barra; la de la derecha, un largo de unas pocas baldosas. Al costado, una bandeja con baldosas sueltas y baldosas largas. Debajo, un libro de cuentas con filas vacías.

Mapa objeto → concepto: ancho compartido → factor común; largos de las dos habitaciones → sumandos del paréntesis; pared del medio → paréntesis; piso entero → producto; sacar la pared → distribuir; volver a poner la pared → factorizar; habitación de largo desconocido → baldosa variable; fila del libro → término; fila que rechaza una baldosa de otro largo → términos que no son semejantes.

El piso aporta el producto, que el libro de cuentas no puede aportar: 🍎 × 🍎 no significa nada y por eso `x · x` no puede nacer en una fila, sino en una baldosa cuadrada. El libro aporta el registro: qué zonas hay y cuántas de cada una. Punto de ruptura del piso: `negative_lengths`. Una habitación de largo `x − 3` no existe, y en cuanto aparece una resta el dibujo es una convención y no una analogía; por eso se desvanece en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el marco de piso en el centro, la bandeja de baldosas a la derecha, el libro de cuentas abajo. Gestos: `drag`, `tap` y `pinch`, con manija de arrastre como alternativa al pinch ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una baldosa al marco.** Se imanta a la grilla y no se superpone con otra. Las baldosas largas solo entran donde el largo coincide.
- **Dejar una zona incompleta.** El marco queda con un hueco que respira. No hay cartel: hay agujero, y el agujero sobrevive a todo lo demás.
- **Tocar la pared.** Con el piso cubierto, la saca: las dos zonas se funden en un rectángulo entero y ninguna baldosa se mueve. Tocar de nuevo la devuelve al mismo lugar. Ese ida y vuelta es el nodo entero hecho con un dedo, y es lo primero que la demostración enseña.
- **Estirar el marco por la manija.** Cambia el ancho. Las dos zonas se estiran a la vez y la cantidad de baldosas de cada una crece en la misma proporción. No hay manija por zona: el ancho es compartido y eso se siente en la mano.
- **Arrastrar la pared.** La corre y cambia el reparto de los largos sin cambiar el total; con el piso cubierto, las baldosas se reacomodan y el conteo entero no se mueve. Arrastrarla hasta el borde agrega una zona nueva vacía.
- **Arrastrar una zona al libro de cuentas.** La zona se registra como una fila con su conteo. Una baldosa larga soltada sobre la fila de las sueltas no entra: la fila la rechaza y la devuelve, porque no miden lo mismo.
- **Tocar el conteo del marco.** Ilumina a la vez el total del rectángulo entero y la suma de las filas, y los dos coinciden. Es la verificación.

En `symbolic` la superficie cambia de forma y no de reglas: la ficha de producto y la ficha de suma están las dos en pantalla, tocar una ilumina la parte del rectángulo que le corresponde, y arrastrar una zona de una escritura a la otra es el mismo gesto de sacar y poner la pared. Cuando el piso ya no está, el gesto sobrevive: tocar el paréntesis lo abre, tocar el factor común lo cierra.

## Invariante matemático

`area_preserved_under_rearrangement` (baldosas): cortar el piso, mover las partes y volver a pegarlas no cambia cuántas baldosas hacen falta. Se ve confirmarse cada vez que la pared se saca o se pone sin que una sola baldosa se corra. Se ve romperse cuando el jugador declara terminado un piso con un hueco: al sacar la pared, el agujero queda en el medio del rectángulo, y ninguna escritura lo tapa.

`count_preserved_under_regrouping` (libro de cuentas): reordenar en filas no cambia cuántos hay, y solo se agrupa lo que mide lo mismo. Se ve romperse cuando una baldosa larga rebota fuera de la fila de las sueltas.

Un movimiento válido pero inútil —correr la pared a un lugar que no simplifica, o registrar las zonas en tres filas donde alcanzaban dos— no rompe nada. El total sigue coincidiendo. El libro late una vez y ofrece juntar las filas iguales; no se dispara ninguna explicación.

## Representación visual

Primitiva dominante `scale`, de apoyo `partition` e `invariant` ([H](../H-progresion-abstraccion.md)).

- `real`: el depósito con el piso a medio embaldosar y dos habitaciones del mismo ancho. Solo se mira.
- `intuition`: la escena se detiene antes de terminar. Tres desenlaces dibujados —se saca la pared y el ancho cubre todo de una pasada; se cubre cada habitación por separado y las dos partes juntas ocupan lo mismo; se cubre solo la primera y la segunda queda descubierta—. El jugador predice y después ve. Un segundo problema muestra una habitación cuadrada a la que se le agrega un pedazo por dos lados y pregunta cuántas zonas nuevas quedaron.
- `concrete`: marco, pared baja, baldosas sueltas y largas en la bandeja, libro de cuentas con filas vacías. Nada escrito.
- `visual`: las baldosas se funden en un rectángulo sobre una grilla atenuada; los lados llevan llaves con corchete y sus medidas; la pared es una línea punteada; las dos zonas tienen colores distintos. El juego muestra el rectángulo entero y las dos zonas separadas con el mismo conteo iluminado en las dos.
- `symbolic`: las dos escrituras a los lados del rectángulo, que se atenúa a marca de agua; el `=` entre ellas; el teclado de fichas con paréntesis, letras y números.
- `formal`: la definición corta con voz y el rectángulo al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables.

1. Baldosas → medidas en los lados: al cubrir una zona completa en `visual`, sus baldosas se atenúan y el conteo se despega hacia el lado como una llave con corchete.
2. Pared → paréntesis: al tocar la pared con el piso cubierto, la línea punteada se contrae en dos trazos verticales alrededor de los dos tramos del largo, `(x + 2)`. Es el paréntesis del nodo 9 encerrando una longitud.
3. Rectángulo entero → producto: el ancho y el paréntesis se juntan por yuxtaposición sobre el piso, `3(x + 2)`, como marca de agua. Lo dispara sacar la pared.
4. Zonas → suma: al arrastrar las zonas al libro, cada fila se contrae en su ficha, `3x` y `6`, con el `+` naciendo del espacio entre las filas y el coeficiente heredando el conteo.
5. Las dos escrituras → una igualdad: hacer el ida y vuelta con las dos escrituras en pantalla dibuja el `=` entre ellas. El signo aparece por el gesto, no por una regla.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el rectángulo: multiplicar una suma es multiplicar cada sumando y después sumar; el área de un rectángulo no cambia si se lo corta y se lo vuelve a armar; las dos escrituras valen lo mismo para cualquier valor de la letra. Propiedades: `a(b + c) = ab + ac`, y vale en los dos sentidos, y se extiende a cualquier cantidad de sumandos, y solo se juntan zonas que miden lo mismo. Casos: con restas el piso deja de ser una habitación y pasa a ser un recorte; el factor no se reparte sobre un producto, porque `3(2x)` es una sola habitación estirada. Sin símbolos nuevos: el paréntesis, la letra y el coeficiente ya nacieron. Lo nuevo es el uso del `=` como identidad, que no pide resolver nada; el juego lo muestra pidiendo la balanza fantasma del nodo 13, que queda nivelada con cualquier valor en la caja. Se guarda en `cs.alg.distributive_law` y `cs.alg.area_model_of_product`.

## Generalización

El piso se retira en `symbolic`, y su punto de ruptura fija el momento: en cuanto un largo es una resta, la habitación deja de existir. Queda como fantasma a demanda hasta `formal`. El libro de cuentas se va antes, en cuanto el coeficiente está escrito.

Variantes sin ayuda visual, en orden: factor numérico y dos sumandos; factor con letra, donde aparece la primera baldosa cuadrada; tres sumandos; resta dentro del paréntesis; factor común hacia adentro, que es el mismo gesto al revés; y los dos lados partidos, donde el jugador anticipa cuántas zonas van a aparecer antes de verlas. Esa última se plantea y se cuenta, no se desarrolla: eso es `alg.expr.binomial_product`. Después, anchos que no son cantidades: un piso cuyo ancho es "pintar de rojo" y cuyo largo está partido en dos zonas, donde repartir es pintar las dos. Cuando el jugador expande y factoriza en los dos sentidos sin pedir el piso, y reconoce el reparto en algo que no tiene área, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md) (convención 4 de la plantilla): este minijuego no continúa ninguno de los dos. El ejemplo de cofres es de ecuaciones y el de frutas es de sistemas; el único punto de contacto es el nivel 8 de los cofres, "ecuaciones nuevas", que H conecta explícitamente con este nodo por la vía de los paréntesis que hay que distribuir. Ese contacto se juega desde el otro lado: acá el paréntesis se abre porque es un piso, y cuando `alg.eq.multi_step` se encuentre con `3(x + 2) = 18` podrá elegir entre tratar el paréntesis como una capa entera o abrirlo. Los niveles de este minijuego son propios y no mapean a los diez del ejemplo de cofres.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cubrir el piso.** `concrete`, `manipulate`. Dos zonas, ancho numérico chico, un largo desconocido y otro de pocas baldosas. La pared se saca y se pone. Sin libro de cuentas todavía.
2. **Dos filas.** `concrete`, `recognize` y `manipulate`. Aparece el libro: cada zona se arrastra a su fila y la baldosa larga rebota fuera de la fila equivocada. Aparece `variable_as_label`.
3. **Lados con medidas.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; las baldosas se funden en rectángulo, los lados llevan llaves con corchete y el conteo se ilumina igual en las dos disposiciones.
4. **Las dos escrituras.** `symbolic` primera mitad, `manipulate` y `apply`. El producto y la suma aparecen a los lados del piso y se transforman en sincronía; nace el `=` como identidad y la balanza fantasma que nunca se inclina.
5. **Piso fantasma.** `symbolic` segunda mitad, `apply` y `generalize`. Las fichas quedan solas y el piso se pide con un toque. Se agrega el sentido inverso: recomponer el producto desde la suma. Parámetros: factor con letra, tres sumandos, rango numérico mayor.
6. **Restas y dos lados partidos.** `formal` y `abstract`, `generalize`. Parámetros: restas dentro del paréntesis y, al final, los dos lados partidos. El jugador anticipa cuatro zonas antes de verlas, y ahí se dispara `distribute_over_wrong_op` en su forma completa. Cierra con la definición corta con voz y con los anchos no aritméticos.

Qué endurece cada parámetro: el ancho grande obliga a razonar sobre el reparto en vez de contar baldosas de a una; el factor con letra hace aparecer la baldosa cuadrada y con ella la pregunta de qué es `x · x`; los tres sumandos rompen la lectura "la propiedad tiene dos partes"; la resta rompe el piso y fuerza la ficha; los dos lados partidos son los que producen el hueco del pasillo, que es el error que este nodo existe para hacer visible.

Desafíos de olimpíada: ningún desafío de [S](../S-desafios/S0-desafios.md) lista este nodo en su `requires`, así que el nodo no exige desafío para `mastered`. La baldosa reaparece un poco más adelante en la cadena: `ch.alg.symmetric_sum_of_squares`, de tier internacional, se resuelve armando el cuadrado de una suma con cuatro baldosas, y `ch.alg.rectangle_perimeter_area_quadratic` empieza escribiendo un área como producto de dos lados. En los dos, la construcción clave es la que este minijuego enseña; lo que los desbloquea son los nodos siguientes.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: dos habitaciones de ancho `4`, con largos `x` y `3`. Cuatro expresiones de fichas al costado: `4x + 12`, `4x + 3`, `4x · 12`, `7x`. Tocar la primera.
- `explain`: tres animaciones sobre un piso de lado `a + b`. En una el ancho cubre las dos zonas y no queda hueco; en otra se ponen dos cuadrados en esquinas opuestas y el pasillo queda vacío; en otra las etiquetas de los lados se multiplican como nombres y el resultado no entra en el marco. Tocar las dos que pierden baldosas. El distractor elegido clasifica: el pasillo vacío es `distribute_over_wrong_op`, las etiquetas multiplicadas son `variable_as_label`.
- `manipulate`: marco de ancho `3` con el largo partido en `x` y `5`. Cubrirlo entero y armar la ficha `3(x + 5)`; después tocar la pared y ver aparecer `3x + 15`.
- `apply`: rectángulo de lados `x` y `x + 6`, ya cubierto. Arrastrar la ficha de cada zona a su fila del libro y cerrar la suma en `x² + 6x`, contra el tiempo objetivo del nodo.
- `generalize`: sin baldosas, `2(y + 3 − w)` en fichas; expandir. Y en el otro sentido, `5a + 5b` para recomponer en `5(a + b)`. Y un piso de ancho "pintar de rojo" con el largo partido en dos: tocar la acción que cubre las dos zonas.
- `transfer`: en el rectángulo que crece de `calc1.deriv.rules_as_structure`, tocar las dos franjas que se agregan cuando los dos lados cambian a la vez. También en `geom.area.rect_and_triangle` (partir una figura con una altura y sumar zonas) y en `linalg.map.linear_transformation_2d` (deformar una suma de vectores da lo mismo que deformar cada uno).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `distribute_over_wrong_op`, patrón `missing_piece_tiles` sobre las baldosas: el juego coloca las baldosas que corresponden a la respuesta del jugador, superpone el marco verdadero y hace parpadear lo que falta o lo que sobra. Con `(a + b)² → a² + b²` faltan dos rectángulos en el medio y están en la bandeja; con `3(2x) → 6 · 3x` el piso construido no entra en el marco y sobran baldosas por fuera del borde. En los dos casos la expresión del costado cambia con un morph cuando el jugador arregla el piso. Es la de mayor severidad del nodo.
- `variable_as_label`, patrón `replay_on_mechanic` sobre el libro de cuentas: el gesto se repite en cámara lenta y las dos columnas de baldosas no se funden porque no miden lo mismo; el desfasaje entre una barra de largo `x` y una de largo `y` queda a la vista y el control vuelve desde el libro real.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de estas dos, más las de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_two_rooms_one_width`, nativa. El rectángulo del jugador con la pared punteada, las llaves con corchete en los lados, la pared que se saca y se pone sin mover baldosas, y el conteo iluminado igual en las dos disposiciones; gramática `scale`. Parametrizada por el ancho y los dos largos, produce las animaciones de `explain` y el replay de `missing_piece_tiles`, incluida la variante de cuatro zonas con el pasillo vacío.
- `ledger_a_times_sum`, nativa. Las zonas viajando a sus filas, el conteo que se despega como coeficiente y la fila que rechaza la baldosa de otro largo; gramática `partition`. Es donde corre el replay de `variable_as_label`.
- Reusada: `tile_rows_become_rectangle` (nodo 5) para la demostración de que el ancho llega a todo el largo. Ninguna escena lleva texto rasterizado; las medidas de los lados las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_two_room_floor`: `width_kind` (número en los niveles 1 a 4, letra desde el 5); `width_range`; `parts` (2 en los niveles 1 a 5, 3 desde el 5); `part_kinds` (una parte variable y el resto constantes, o dos variables desde el 5); `allow_subtraction` (falso hasta el 5); `split_both_sides` (solo en el 6); `seed`.
- `gen_tile_tray`: `exact` (verdadero en el nivel 1, para que la bandeja tenga justo lo necesario; falso desde el 2); `distractor_tiles` desde `detect` (baldosas de un largo parecido, baldosas cuadradas cuando no hacen falta); `include_long_tile`.
- `gen_ledger_rows`: `rows` (2 o 3); `mismatched_offer` (verdadero desde el nivel 2, para que siempre haya una baldosa que tiente a la fila equivocada).
- `gen_arbitrary_width`: anchos no aritméticos con efecto visible sobre cada zona (pintar, rotar, duplicar) y uno por instancia que no se reparte, para que la propiedad se pueda negar.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer —cubrir es arrastrar, el hueco no necesita explicación, la pared se saca con un dedo—, pero desde el nivel 3 los lados llevan etiquetas de un carácter con número o letra, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma una baldosa larga, la apoya en la zona izquierda y la repite hasta llenar el ancho; después llena la derecha con sueltas; después toca la pared y el rectángulo se funde. La escena vuelve al inicio y la bandeja late. Se repite solo si el jugador se queda quieto. La demostración del libro de cuentas es aparte, en el nivel 2, y es de un solo gesto: una zona viaja a su fila y una baldosa larga rebota fuera de la fila de las sueltas ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
