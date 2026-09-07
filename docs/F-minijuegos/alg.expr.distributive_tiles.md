# Dos habitaciones (`alg.expr.distributive_tiles`)

Minijuego del nodo 15 de la espina, "Repartir el producto en baldosas". Mecánica principal `tiles`, secundaria `ledger`; analogía `tile_floor_two_rooms`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/15-alg.expr.distributive_tiles.md): un concepto, tres dificultades reales (ver un producto como área, reconocer el factor común como lado compartido, sumar solo piezas del mismo tipo), una analogía con su prótesis para la resta, cinco pasos de desvanecimiento, el rectángulo partido como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Dos habitaciones vistas desde arriba, separadas por una pared. Las dos tienen el mismo ancho; los largos son distintos y uno de ellos puede ser desconocido. Abajo, la bandeja de baldosas. A la derecha, el libro de cuentas con una columna por tipo de pieza.

Mapa objeto → concepto: ancho compartido → factor común; los dos largos → sumandos del paréntesis; pared entre las habitaciones → paréntesis; piso entero → producto; sacar la pared → distribuir; volver a poner la pared → factorizar; habitación de largo desconocido → baldosa variable; columna del libro → término.

Hay tres piezas en la bandeja y no más: la baldosa cuadrada unidad, la tira de largo `x` y el cuadrado de lado `x`.

Punto de ruptura: `negative_lengths`. Una habitación no puede medir menos que nada. La prótesis es explícita: la baldosa de resta se dibuja como un hueco recortado sobre el piso, del mismo tamaño y color invertido, y restar es quitar superficie. Por ser prótesis y no analogía, las baldosas se retiran en `symbolic`, antes de que aparezcan expresiones enteramente negativas ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el marco rectangular en el centro con la pared dibujada adentro, la bandeja de baldosas abajo, el libro de cuentas a la derecha. Gestos: `drag`, `tap` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una baldosa al marco.** Si encaja, se acomoda a la grilla y la columna correspondiente del libro sube un escalón. Si no encaja, se resiste en el borde y vuelve a la bandeja.
- **Tocar la pared.** La saca o la pone. El piso no cambia de tamaño y el contador de superficie no se mueve; el libro pasa de dos columnas a una fila con las mismas piezas, y vuelve.
- **Pellizcar una tira de largo `x`.** La estira o la encoge para probar cuánto mide. El marco entero se reajusta para seguir cerrando.
- **Dejar un hueco.** El hueco parpadea y el marco no cierra.
- **Superponer dos piezas.** La de arriba se vuelve translúcida y el contador de superficie excede al marco.
- **Arrastrar una columna del libro sobre otra.** Si las dos cuentan piezas de la misma forma, se funden y el coeficiente suma. Si no, se rechazan con un rebote corto.

En `symbolic` la superficie cambia de forma, no de reglas. La pared es un paréntesis que se toca para abrirlo o cerrarlo; sacar la pared es arrastrar el ancho hacia adentro y soltarlo sobre cada sumando; poner la pared es seleccionar dos términos y arrastrar hacia afuera el lado que comparten. El marco aparece como fantasma tocando el producto.

## Invariante matemático

`area_preserved_under_rearrangement` (baldosas): el área total no cambia al reacomodar las piezas ni al sacar o poner la pared. Se ve romperse de dos maneras distintas: con un hueco, cuando la cobertura del jugador mide menos que el marco, y con una superposición, cuando mide más. En ninguno de los dos casos hay mensaje; el marco mal cubierto es el mensaje, y el contador de superficie confirma la diferencia.

`count_preserved_under_regrouping` (libro de cuentas): la cantidad de piezas se conserva al reagrupar, y solo se agrupan piezas de la misma forma. Se ve romperse cuando el jugador intenta fundir dos columnas incompatibles y el libro las rechaza.

Un movimiento válido pero inútil, como partir una habitación en tres franjas cuando dos alcanzaban, no rompe ninguno: el piso sigue cubierto y la escritura tiene un sumando de más. Recibe un empujón suave.

## Representación visual

Primitiva dominante `scale`, de apoyo `partition` ([H](../H-progresion-abstraccion.md)).

- `concrete`: marco con volumen, baldosas sueltas con textura, pared dibujada, libro de cuentas con casilleros.
- `visual`: las baldosas se funden en un rectángulo continuo con una grilla tenue encima. Los lados se marcan con llaves: una para el ancho, dos consecutivas para los largos. El lado desconocido termina en una caja en vez de un número.
- `symbolic`: fichas de producto y de suma sobre un renglón, con el paréntesis heredado del nodo 14. Los coeficientes salen del colapso de las columnas.
- `formal`: la definición corta con voz y el rectángulo partido al lado, con el caso del cuadrado de una suma dibujado en cuatro piezas.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Lados → fichas: al cerrar el marco por primera vez en `visual`, las llaves de los lados se contraen en fichas y la caja del lado desconocido se contrae en `x`.
2. Pared → paréntesis: al tocar la pared, esta se afina, se dobla por arriba y por abajo y queda como los dos arcos del nodo 14. El lado compuesto se lee `(x + 2)`.
3. Adyacencia → producto escrito: el rectángulo se contrae hasta la altura de un renglón y los dos lados quedan pegados, `5(x + 2)`.
4. Baldosas parciales → sumandos: al sacar la pared, el rectángulo se parte en dos bloques que se separan y cada uno se contrae en su ficha, con un `+` que hereda el id de la pared. La igualdad entre las dos escrituras aparece con un morph.
5. Columnas → coeficientes: el libro colapsa, cada columna se contrae en el número que la contaba y la marca queda pegada como letra. `x x x` se vuelve `3x`.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el rectángulo partido: multiplicar por una suma es multiplicar por cada sumando y sumar los resultados; la igualdad vale en los dos sentidos, repartir el producto y volver a juntarlo.

Propiedades: `a(b + c) = ab + ac` y su versión con resta; la factorización como el mismo movimiento al revés, posible solo si los dos bloques comparten un lado; solo se suman piezas del mismo tipo, `2x + 3x = 5x` pero `2x + 3` no se junta; el cuadrado de una suma tiene cuatro piezas, `a²`, `b²` y dos rectángulos `ab`. Casos límite: vale para cualquier cantidad de sumandos, no vale sobre un producto porque `a(bc)` es un bloque sin pared, y con `a = 0` el piso desaparece entero.

Sin símbolos nuevos con forma propia: el paréntesis nació en el nodo 14 y la letra en el 10. Lo nuevo es la yuxtaposición como producto, `5x` en vez de `5 · x`, que se adopta porque con el signo escrito la estructura del renglón se pierde entre símbolos.

## Generalización

Las baldosas se retiran en `symbolic`, en el momento en que aparece el primer coeficiente negativo en los dos lados de la resta y el hueco recortado deja de tener sentido físico. Quedan como fantasma a demanda tocando el producto. El libro de cuentas dura más, porque contar por tipo sigue siendo cierto sin dibujo, y se retira en `formal`.

Variantes sin ayuda visual: factor común negativo; paréntesis de tres sumandos; producto de dos paréntesis; el cuadrado de una suma; y recomposición, donde se da la suma y hay que encontrar el ancho compartido. Cuando el jugador expande y recompone sin pedir baldosas, decide en qué dirección conviene moverse y rechaza con un contraejemplo propio la distribución sobre un producto o sobre un cuadrado, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): este minijuego no tiene un ejemplo canónico propio. Se apoya en el ejemplo de cofres solo para heredar el paréntesis, en su nivel 4, y le entrega al ejemplo de frutas el escalado de filas que el nodo 16 necesita para volcar una balanza sobre otra. Sus niveles son propios.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cubrir el piso.** `concrete`, `manipulate`. Dos habitaciones con largos numéricos chicos y ancho numérico. Solo baldosas cuadradas. La pared se saca y se pone.
2. **La habitación sin medida.** `concrete`, `recognize` y `manipulate`. Un largo pasa a ser desconocido y aparece la tira de largo `x`. El libro tiene dos columnas con formas distintas. Aparece `variable_as_label`.
3. **Barras y llaves.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; el piso es un rectángulo continuo con llaves en los lados y el libro dibuja barras.
4. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión con paréntesis aparece junto al piso y se transforma en sincronía al sacar y poner la pared.
5. **Sin piso.** `symbolic` segunda mitad, `apply`. La expresión queda sola y el marco se pide con un toque. Parámetros: factor común negativo, restas dentro del paréntesis, tres sumandos.
6. **El cuadrado que crece.** `formal` y `abstract`, `generalize`. Producto de dos paréntesis y cuadrado de una suma, con recomposición desde la suma. Aparece `distribute_over_wrong_op` en su forma más frecuente. Definición corta con voz.

Qué endurece cada parámetro: el largo desconocido impide calcular y obliga a mirar la estructura; el factor común negativo rompe la prótesis del hueco y fuerza el renglón; los tres sumandos impiden memorizar "dos productos".

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): ningún desafío requiere este nodo de forma directa. El más cercano es `ch.alg.symmetric_sum_of_squares`, de tier internacional, que requiere `alg.expr.binomial_product` y `alg.sys.two_by_two`; su dato oculto es la identidad que liga suma, producto y cuadrados, y se descubre acostando el cuadrado de una suma en cuatro baldosas, que es exactamente el movimiento del nivel 6 de este minijuego. El nodo se apoya en él como desafío heredado a través de su sucesor, y no exige desafío propio para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: dos habitaciones de ancho 4, una de largo `x` y otra de largo 3. Tocar la ficha que mide el piso total. Distractores generados desde `detect`: `4x + 3`, `(4 + x)(4 + 3)` y `4x · 12`.
- `explain`: tres animaciones sobre el mismo marco de lado `a + b`. En una, el ancho cubre las dos habitaciones y el piso queda entero; en otra se eleva al cuadrado cada habitación por separado y quedan dos rectángulos vacíos; en otra se multiplican las etiquetas como nombres y las dos columnas del libro se funden en una que no corresponde a ninguna pieza. Tocar las dos que pierden baldosas. El distractor elegido clasifica: la de los rectángulos vacíos es `distribute_over_wrong_op`, la de las columnas fundidas es `variable_as_label`.
- `manipulate`: un rectángulo de ancho 3 con un lado partido en `x` y 2. Arrastrar baldosas hasta cubrirlo y armar la ficha `3(x + 2)`.
- `apply`: un rectángulo de lados `x + 4` y 5. Arrastrar la ficha de cada baldosa parcial al libro de cuentas y sumar, contra el tiempo objetivo del nodo.
- `generalize`: sin baldosas, expandir `−2(3y − 5)` y después recomponer `12a + 18` encontrando el ancho compartido.
- `transfer`: en el rectángulo que crece de `calc1.deriv.rules_as_structure`, tocar las dos franjas que se agregan cuando ambos lados cambian. También en `geom.area.rect_and_triangle`, `linalg.map.linear_transformation_2d` y `adv.alg.polynomial_arithmetic`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `distribute_over_wrong_op`, patrón `missing_piece_tiles` sobre `tiles`, que el nodo declara. El juego coloca las piezas que el jugador nombró, un cuadrado `a × a` y otro `b × b` en esquinas opuestas del marco, y los dos rectángulos `a × b` que quedan vacíos parpadean. Voz: "Al cuadrado le falta un pedazo. ¿Qué rectángulos faltan?". Las baldosas esperan en la bandeja, y al completar el hueco la expresión pasa de `a² + b²` a `a² + 2ab + b²` con un morph.
- `variable_as_label`, patrón `replay_on_mechanic` sobre `ledger`, que el nodo también declara. El replay corre en el libro: las dos columnas del jugador intentan fundirse y se rechazan porque cuentan piezas de forma distinta, y sobre el piso la tira de largo `x` y la de largo `y` se superponen sin encajar. Voz: "Estas dos piezas no tienen la misma forma. ¿Se pueden apilar en la misma columna?".

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_two_rooms_one_width`, nativa. Recibe el ancho y los dos largos como árboles y dibuja el marco con la pared que sale y entra, las llaves de los lados y el contador de superficie que no se mueve; gramática `scale`. Acepta una cobertura incompleta, y por eso es la que ejecuta el patrón `missing_piece_tiles` y produce las animaciones de `explain`.
- `ledger_a_times_sum`, nativa. Corre sincronizada al costado: las columnas se llenan mientras las baldosas caen y colapsan en coeficientes cuando el jugador cierra el marco; gramática `partition`. Es la que sostiene el replay de `variable_as_label` y la imagen de cheatsheet de `cs.alg.distributive_law`.
- Reusadas: `tile_rows_become_rectangle` (nodo 5), como apertura de nivel, y `ledger_box_hides_tokens` (nodo 10), como distractor de las etiquetas multiplicadas.

Ninguna lleva texto rasterizado: las etiquetas de los lados, las marcas de columna y los coeficientes los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_room_pair`: `width` (numérico en los niveles 1 a 3, con letra desde el 6); `lengths` como lista de 2 o 3 términos; `unknown_count` (0 en el nivel 1, 1 desde el 2); `allow_subtraction` (falso hasta el nivel 4); `coefficient_range` (1 a 9 hasta el nivel 4, hasta 20 después); `allow_negative_factor` (verdadero desde el nivel 5); `seed`.
- `gen_tile_tray`: `shapes` en {unit, x_strip, x_square}; `spare_count`; `missing_count`. Alimenta los ítems de `manipulate`.
- `gen_square_of_sum`: `side_terms` como par de términos; `player_answer_shape` en {two_squares, full, one_rectangle}, que decide qué configuración de piezas coloca el patrón `missing_piece_tiles`. Alimenta el nivel 6 y los ítems de `explain`.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer, pero los lados llevan etiquetas de un dígito y letras desde el segundo nivel, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma llena la habitación izquierda con baldosas y la columna izquierda del libro cuenta sola; después llena la derecha y la segunda columna cuenta; por último la pared se desvanece y las dos columnas se juntan en una fila, sin que el contador de superficie se mueva. La escena vuelve al inicio y la bandeja late. Se repite solo si el jugador se queda quieto. El pellizco para estirar la tira de largo `x` se demuestra por separado en el nivel 2, una sola vez ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
