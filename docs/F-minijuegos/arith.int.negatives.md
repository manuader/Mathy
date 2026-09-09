# El ascensor y el caminante (`arith.int.negatives`)

Minijuego del nodo 7 de la espina, "Negativo es la dirección contraria". Mecánica principal `gears_sequence`, secundarias `ledger` y `grid_stretch`; analogías `elevator_floors` y `debt_ledger`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/07-arith.int.negatives.md): un concepto, cinco dificultades reales (el número lleva dos datos, el cero se reubica, el orden se invierte a la izquierda, la acción no es el lugar, dos vueltas devuelven), dos analogías complementarias, un gesto (girar la manivela cruzando el cero), cuatro pasos de desvanecimiento, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un edificio en corte, con la calle a la mitad de la pantalla: arriba pisos con ventanas, abajo subsuelos con luz de garaje. El ascensor está enganchado al mismo eje que la manivela de la pista. Al costado, un tablero con monedas y vales de deuda.

Mapa objeto → concepto: piso → número entero; planta baja → cero; subir n → sumar un positivo; bajar n → sumar un negativo; piso de subsuelo → número negativo; pisos entre dos paradas → diferencia absoluta; orden de los botones → orden de los enteros. En el tablero: moneda → unidad positiva; vale → unidad negativa; moneda y vale que se apagan juntos → opuesto aditivo; sacar un vale → restar un negativo; montón neto → suma con signo.

El ascensor da la posición y el orden; el libro de cuentas da la cancelación, que en la pista no se ve porque una moneda y un vale parecen dos pasos. Punto de ruptura del ascensor: `multiplying_floors`. Punto de ruptura del libro: `multiplying_two_debts`. Las dos se rompen donde empieza el producto, y por eso el producto de signos vive en `arith.int.mul_signed` ([G0](../G-analogias/G0-reglas.md)). La banda del nodo 5 aparece una sola vez, para mostrar que el clavo tiene dos lados.

Las dos entradas de G declaran `literacy_min: icons` y el nodo declara `literacy: none`. El minijuego resuelve la diferencia por niveles: hasta el nivel 4 no hay ningún numeral en pantalla.

## Mecánica central

Superficie: la pista graduada en el centro con la manivela a la izquierda, el edificio a la derecha enganchado al mismo eje, el tablero abajo desde el tercer nivel. Gestos: `scrub`, `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela.** El caminante avanza una casilla por vuelta y el ascensor un piso. Al llegar al cero desde la derecha y seguir, el caminante se para, gira sobre sí mismo y sigue; la pista se dibuja sola hacia la izquierda con casillas del mismo tamaño.
- **Tocar el caminante.** Gira sin moverse y su bandera cambia de lado. Es el gesto de la vuelta, separado a propósito del de caminar.
- **Arrastrar monedas y vales al tablero.** Se apilan en su columna. Al soltar un vale sobre una moneda del mismo tamaño, los dos se apagan con un chasquido. Lo que queda sin pareja es el neto, y una ficha lo sigue.
- **Sacar un vale del tablero.** El neto sube. Nadie lo dice; es la semilla de restar un negativo.
- **Arrastrar la ficha del piso más bajo a la caja marcada.** La caja se ilumina si acertó. En la pista, la misma tarea es arrastrar la casilla más a la izquierda.
- **Ordenar por tamaño.** El juego coloca las fichas donde el jugador dijo y dibuja el edificio encima: la que llamó menor queda más arriba. El dibujo es el mensaje.
- **Mudar el cero.** El jugador arrastra la línea de la calle a otra altura. Todos los pisos cambian de nombre y ninguna distancia cambia.

En `symbolic` la superficie cambia de forma, no de reglas: la pista se vuelve una recta con marcas y las fichas llevan su trazo de signo; soltar una ficha sobre la recta la clava en su casilla; la caja de comparar sigue funcionando igual.

## Invariante matemático

`same_step_every_turn` (manivela y pista): cada vuelta mueve exactamente lo mismo, de los dos lados del cero. Es lo que hace legítimo el lado izquierdo: la pista no se estira ni se comprime al cruzar. Se rompe si el jugador espera pasos más chicos del otro lado, y la animación lo desmiente sola.

`count_preserved_under_regrouping` (libro de cuentas): el neto no cambia si se agregan pares de moneda y vale. Se confirma cuando el jugador tira un par al tablero y la ficha del neto no se mueve; se rompe si cancela una moneda contra un vale de otro tamaño, y los dos quedan encendidos con uno sobresaliendo.

`lines_stay_lines_origin_fixed` (banda): el cero es un punto fijo con dos lados simétricos. Aparece solo donde el clavo se convierte en el cero.

El invariante conceptual del nodo, que ninguna mecánica declara sola, es que la distancia entre dos números no depende de dónde esté el cero. Se juega al mudar la calle: los nombres cambian, la distancia no. Un movimiento válido pero inútil, como agregar un par al tablero, recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `displace`, de apoyo `partition` en el tablero ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el edificio en corte con el ascensor bajando, sin manivela ni tablero. Solo se mira y se predice.
- `concrete`: pista con casillas, caminante con bandera, manivela, edificio con ventanas y luz de garaje, monedas y vales con forma. Nada escrito.
- `visual`: la pista es una recta con marcas equiespaciadas y un punto grueso en el cero, heredado del clavo del nodo 5; el caminante es una flecha que apunta hacia donde mira. El edificio es una escalera de rectángulos apilados con una línea gruesa en la calle. Las monedas se aplanan en fichas llenas hacia arriba y los vales en fichas huecas hacia abajo, y la cancelación deja un hueco transparente.
- `symbolic`: fichas con numeral y trazo de signo sobre la recta, sin edificio.
- `formal`: la definición corta con voz, con el edificio al lado.

## Transición simbólica

Cuatro morphs, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Casilla → numeral con lado: la primera vez que el caminante se detiene a la izquierda del cero en `visual`, la casilla se ilumina y el numeral aparece encima. Es el mismo numeral de la casilla simétrica de la derecha, y los dos laten a la vez para que la ambigüedad se note.
2. Bandera → signo: en el mismo momento la bandera se despega, se acuesta y se encoge hasta ser un trazo corto que se posa a la izquierda del numeral. Queda `-3`.
3. Vale → el mismo signo: al arrastrar el neto fuera del tablero, la ficha hueca se contrae y su borde inferior se despega como el mismo trazo. Deuda y dirección se escriben igual.
4. Dos trazos que se encuentran: al sacar un vale aparecen juntos el trazo de restar del nodo 4 y el de signo. El juego los separa levantando el del signo medio cuerpo, apenas tembloroso para decir que es provisorio. La convención definitiva, meter el número con signo en un cofre, llega en el nodo 9.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el edificio: cada número tiene un opuesto, a la misma distancia del cero y del otro lado; los números crecen hacia un lado y decrecen hacia el otro sin frenarse en el cero; un número y su opuesto juntos se cancelan y dejan el cero. Propiedades: el cero es su propio opuesto y el único sin lado; la distancia entre dos pisos no depende de cuál se llame cero; a la izquierda del cero el numeral más grande nombra el número más chico; girar dos veces devuelve la dirección original, y por eso el opuesto del opuesto es el número. El símbolo nuevo es el signo del número, que nace de la bandera del caminante. No hay operador entre dos números con signo: sumar con signo es `arith.int.add_signed`.

## Generalización

El edificio se retira en `symbolic`, en cuanto el jugador ordena fichas con signo sin mirarlo. El libro de cuentas se queda a demanda, porque la cancelación no tiene todavía otra forma de verse.

Variantes sin ayuda visual: números fuera del rango del edificio dibujado; comparaciones entre dos negativos, que es donde el orden invertido duele; el cero mezclado en la misma fila; el mismo piso pedido desde dos ceros distintos. Después, pistas que no llevan números: una fila de dibujos con uno marcado como origen y una ficha que dice "tres hacia el lado de la flecha" o "tres hacia el otro lado". El jugador toca el dibujo correcto. Cuando resuelve todo eso sin pedir edificio ni tablero, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de frutas de [H](../H-progresion-abstraccion.md): sus primeros niveles, donde un objeto se cuenta y después se nombra con un numeral, corresponden a lo que este nodo da por sabido. El minijuego agrega una dimensión que el ejemplo no tiene, porque 🍎 no viene en versión negativa, y ahí se corta la correspondencia.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cruzar el cero.** `concrete`, `manipulate`. Solo pista y manivela; el caminante llega al cero y sigue. Tres casillas a cada lado.
2. **El ascensor.** `concrete`, `recognize`. Entra el edificio enganchado al mismo eje; el jugador toca el piso donde termina.
3. **Monedas y vales.** `concrete`, `manipulate`. Entra el tablero: cancelación de a pares y neto.
4. **Flechas y escalera.** `visual`, `explain` y `manipulate`. Misma dificultad; aparece la vuelta doble y con ella `negative_times_negative`.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. Numerales y trazo de signo; el edificio sigue a la vista y se transforma en sincronía.
6. **Sin edificio.** `symbolic` segunda mitad, `apply`. Solo la recta y las fichas; el edificio se pide con un toque. Rango mayor.
7. **La calle se muda.** Parámetros: el cero cambia de lugar y hay que renombrar todo sin cambiar ninguna distancia. Comparaciones entre dos negativos.
8. **Direcciones que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; pistas de dibujos sin numerales.

Qué endurece cada parámetro: el rango obliga a razonar la posición en vez de contar casillas; las comparaciones entre dos negativos rompen la lectura "el numeral más grande es el más grande"; mudar el cero rompe la idea de que el cero es un lugar de la realidad; el cero incluido en el orden obliga a decidir de qué lado ponerlo.

Desafíos de olimpíada: el nodo participa en los desafíos de aritmética de [S](../S-desafios/S0-desafios.md), aún no escritos, donde temperaturas, deudas y alturas se mezclan con datos ocultos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: el caminante en el cero y una ficha negativa que cae sobre la manivela. Tocar la casilla donde termina, del lado izquierdo.
- `explain`: el mismo caminante en dos animaciones. En una gira dos veces y termina mirando hacia adelante; en la otra gira dos veces y sigue mirando hacia atrás. Tocar la que se equivoca. El distractor elegido clasifica: la que sigue mirando hacia atrás es `negative_times_negative`.
- `manipulate`: girar la manivela hacia atrás cruzando el cero hasta el tercer subsuelo, viendo bajar el ascensor y el libro anotar vales al mismo ritmo.
- `apply`: dos fichas de piso, una arriba y otra abajo del cero, cuatro veces seguidas. Arrastrar la ficha con la cantidad de pisos entre las dos, contra el tiempo objetivo del nodo.
- `generalize`: sin edificio, ordenar de menor a mayor `-4`, `2`, `-1`, `0`, `3` arrastrándolas a una fila. Y una fila de dibujos con origen marcado y una ficha de dirección.
- `transfer`: en el plano de cuatro cuadrantes de `trig.ang.quadrant_signs`, tocar el cuadrante donde un punto tiene los dos signos indicados. También en `alg.fn.graph_as_picture` y `linalg.vec.vector_as_displacement`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `negative_times_negative`, patrón `double_flip`, severidad 2. El catálogo la asocia a `slope_walker`, que este nodo no declara; el patrón corre sobre el caminante de `gears_sequence`, el mismo objeto con otra mecánica. El replay lo pone en el cero mirando a la derecha: la primera vuelta lo deja mirando a la izquierda y avanza, la segunda lo devuelve a mirar a la derecha y avanza más lejos. La respuesta del jugador queda dibujada como una bandera clavada del lado equivocado. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".

Errores previstos sin entrada propia, que no clasifican ni bloquean `ready`:

- **Ordenar por tamaño y no por posición.** El juego coloca las fichas donde el jugador dijo y dibuja el edificio encima. Voz: "Pusiste ese piso como el más bajo. ¿Cuál está más abajo en el edificio?".
- **Leer el signo como una orden de restar.** El juego ejecuta las dos lecturas en la misma pista con dos caminantes de distinto color. Voz: "Una ficha dice a dónde ir. La otra dice cuánto moverse. ¿Cuál te dieron?".

Los distractores se generan desde las reglas `detect` de `negative_times_negative` y de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_walk_past_zero`, nativa. La recta que se dibuja hacia la izquierda mientras la manivela gira, el punto grueso del cero quieto, la flecha del caminante que se da vuelta al cruzarlo y el valor que baja en paralelo; gramática `displace`. Parametrizada por la casilla de partida y el paso, produce los ítems de `recognize`, las dos animaciones de `explain` y el replay de `double_flip`. Es la imagen de cheatsheet de `cs.arith.sub_past_zero`.
- `ledger_debt_tokens`, nativa. Monedas y vales que caen, se superponen de a pares y se apagan, con el neto siguiéndolos; gramática `partition`. Parametrizada por créditos y deudas, produce `manipulate` y la cancelación de `apply`. Es la imagen de cheatsheet de `cs.arith.negative_as_opposite_direction`.
- Reusada: `gear_walk_back_same_count` (nodo 4), como distractor de la animación de la vuelta.
- Ninguna lleva texto rasterizado: los numerales y el trazo del signo los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_signed_track`: `start`; `step`; `crossings`; `range` (3 a cada lado en los niveles 1 a 4, hasta 20 en el 6); `zero_offset` (distinto de cero desde el nivel 7); `seed`.
- `gen_ledger_board`: `credits`; `debts`; `pair_size` (fichas iguales hasta el nivel 5, mezcladas después); `prefilled_pairs`; `seed`.
- `gen_floor_pair`: `low`; `high`; `both_below` (desde el nivel 7); `distractors` desde `detect` (el simétrico, el vecino, la suma de los dos valores absolutos); `seed`.
- `gen_arbitrary_direction`: `row_length` (largo de la fila de dibujos); `origin_position` (en qué dibujo de la fila cae el origen marcado); `direction_tokens` (las fichas de dirección, sin numerales); `steps` (la cantidad de pasos, dada por repetición de un ícono); `seed`.

**Literacy soportada:** de `none` a `full_text`. Los niveles 1 a 4 no tienen ningún numeral: los pisos se distinguen por altura y por la luz de garaje, las monedas y los vales por forma, y la dirección por la bandera. Desde el nivel 5 el panel del ascensor muestra numerales y el mínimo real sube a `icons`, que es lo que declaran las dos analogías. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela hacia atrás; el caminante llega al cero, se para, gira y sigue mientras la pista se dibuja sola. La escena vuelve al inicio con la manivela latiendo. Se repite solo si el jugador se queda quieto. La demostración de la cancelación aparece en el nivel 3 y no se repite ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
