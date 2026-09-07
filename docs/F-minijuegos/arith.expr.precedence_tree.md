# Cofres dentro de cofres (`arith.expr.precedence_tree`)

Minijuego del nodo 9 de la espina, "Los paréntesis son cofres anidados". Mecánica principal `chest_key`, secundaria `machine_pipe`; analogía `chest_nested`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/09-arith.expr.precedence_tree.md): un concepto, cinco dificultades reales (ver forma donde hay una fila, aceptar cofres no dibujados, distinguir los dos órdenes opuestos, entender que los paréntesis no operan, sentir que el orden de dos acciones importa), una analogía con una mecánica de contraste, un gesto (meter un cofre adentro de otro), cuatro pasos de desvanecimiento, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un cofre de madera cerrado en el piso, con una cerradura de forma y un llavero al lado. El cofre se ve más grande de lo que hace falta para una gema, y adentro hay otro cofre.

Mapa objeto → concepto: cofre → expresión; cofre dentro de un cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; tesoro → valor; secuencia de cerraduras agregadas → composición; hueco de la tapa con la forma del tesoro de adentro → lo que el cofre exterior está esperando.

Ese hueco es la pieza que sostiene toda la analogía. La cerradura del cofre de afuera no muerde hasta que el tesoro del de adentro existe: la llave gira en el vacío. No hay que explicarlo, el jugador lo siente en el primer intento. Punto de ruptura: `unknown_in_two_chests`, la misma incógnita repartida en dos cofres, que ni el nodo 14 resuelve del todo ([G0](../G-analogias/G0-reglas.md)).

El `structure_map` de G declara `opening_outer_chest_first: reverse_precedence`, y el texto del locale de la analogía afirma que siempre se abre primero el cofre de afuera. Eso contradice las probes del nodo y la escena `chest_nested_open_inside_first`. La discrepancia está anotada como tal, y este minijuego fija el criterio: **para calcular se abre desde adentro; para deshacer se saca desde afuera**, y las dos cosas se juegan, en ese orden.

`machine_pipe` no trae analogía propia: trae el contraste. Dos máquinas conectadas hacen la misma pregunta sin cofres, con el orden a la vista en la dirección del caño.

## Mecánica central

Superficie: el cofre anidado en el centro, el llavero abajo, el árbol a la derecha desde la capa `visual`, la tubería abajo a la derecha desde el cuarto nivel. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una llave a una cerradura.** Si el cofre está accesible y su contenido resuelto, la llave muerde y el cofre se abre.
- **Intentar abrir el cofre de afuera primero.** La llave gira en el vacío y vuelve sola. El hueco de la tapa queda a la vista, vacío, y late. Nada se llama incorrecto.
- **Abrir el cofre de adentro.** El tesoro sale y sube hasta el hueco de la tapa del siguiente, que lo recibe con un encastre. Recién ahí la cerradura de afuera muerde.
- **Arrastrar un cofre adentro de otro.** Las paredes del grande se abren para recibirlo y se cierran. Con tres cofres, el orden en que los mete queda dibujado en el tamaño.
- **Armar desde un árbol.** Aparece un árbol con líneas y nodos y el jugador construye el anidamiento correspondiente. El árbol y los cofres laten juntos cuando coinciden.
- **Arrastrar máquinas en la tubería.** Cambia el orden; al soltar una bolita, sale con otro tamaño y un contador muestra la salida.
- **Deshacer.** En el nivel de vuelta el jugador tiene el tesoro y el cofre entero cerrado. Ahora funciona la llave del cofre de afuera, y el juego no lo avisa: quien prueba con la de adentro la ve girar en el vacío otra vez, por el motivo opuesto.
- **Tocar una fila sin cofres.** Un cofre fantasma se dibuja solo alrededor de la multiplicación y se desvanece, cuantas veces el jugador quiera; si mantiene el dedo, el ciclo se repite.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha de paréntesis sobre un tramo seleccionado lo envuelve; arrastrar un paréntesis a otra posición reagrupa y la ficha del total cambia sola; tocar la fila pide el árbol, que aparece como fantasma.

## Invariante matemático

`inverse_restores_original` (cofre): la llave devuelve exactamente lo que había, pero solo si el cofre está accesible. Se rompe de dos maneras opuestas, y esa simetría es el nodo entero: al calcular, la llave de afuera gira en el vacío porque el tesoro de adentro no existe; al deshacer, la llave de adentro gira en el vacío porque la tapa de afuera sigue cerrada. La misma llave, el mismo vacío, dos motivos contrarios.

`same_input_same_output` (tubería): la misma entrada por el mismo camino da siempre la misma salida. Se rompe aparentemente cuando el jugador cambia las máquinas de orden y obtiene otro número, y el juego lo aclara con el objeto: el camino no es el mismo, porque el caño se dio vuelta.

El invariante conceptual del minijuego es que el valor de un cofre depende de qué tiene adentro y no de cuándo se lo abra. Se juega moviendo un cofre cerrado de lugar sin abrirlo: el tesoro final no cambia. Un movimiento válido pero inútil, como poner paréntesis alrededor de toda la expresión, recibe un empujón suave: el juego los dibuja, abre el cofre y muestra el mismo tesoro.

## Representación visual

Primitiva dominante `compose`, de apoyo `invert` en los niveles de vuelta ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la habitación con el cofre grande, sin llavero. Solo se mira y se predice.
- `concrete`: cofres de madera, hierro y oro anidados, cerraduras con forma, llaves con forma y color, gema. Nada escrito.
- `visual`: los cofres son rectángulos redondeados uno adentro del otro, con la cerradura como una marca en el borde y el tesoro como un punto grueso en el centro del más interno. Al abrir, el punto grueso sube hacia el hueco del cofre siguiente, y ese ascenso es todo el concepto. Al costado, el árbol: líneas que bajan desde una raíz, con un nodo por rectángulo, iluminándose en la secuencia de apertura. En los niveles de vuelta el recorrido se ilumina en sentido contrario y con otro grosor.
- `symbolic`: fichas y paréntesis sobre una línea, con la ficha del total apoyada encima; el árbol como fantasma.
- `formal`: la definición corta con voz, con el cofre anidado al lado.

## Transición simbólica

Cuatro morphs, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cerradura → ficha de operación: al abrir un cofre por primera vez en `visual`, la marca de la cerradura se despega del borde y se contrae en la ficha del operador, entre los dos números del contenido. El cofre queda como contorno.
2. Paredes del cofre → paréntesis: al anidar dos cofres con fichas adentro, las paredes laterales del interior se adelgazan, se curvan y se quedan a izquierda y derecha de su contenido, mientras el resto del contorno se desvanece. Queda `( 3 × 4 )`. Los paréntesis son lo que sobra del cofre.
3. Cofre exterior → la fila entera: el contorno de afuera se desvanece último y deja `2 + ( 3 × 4 )` sobre una línea. El tesoro que subía se convierte en la ficha del total.
4. Cofre fantasma → paréntesis que se borran: en el nivel de cofres invisibles, el jugador toca la fila, el cofre alrededor de la multiplicación se dibuja, sus paredes se vuelven paréntesis y después los paréntesis se desvanecen dejando `2 + 3 × 4`. El ciclo se repite mientras el dedo esté apoyado, y ese ir y venir es la definición de la jerarquía.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el cofre anidado: una expresión es un encastre de operaciones y su forma se dibuja como un árbol; para calcular el valor se empieza por el cofre de más adentro y se sube; los paréntesis no operan, solo dicen qué está adentro de qué. Condiciones: sin paréntesis dibujados, la multiplicación y la división están en un cofre más adentro que la suma y la resta, por acuerdo; entre operaciones del mismo nivel el cofre se arma de izquierda a derecha, también por acuerdo; unos paréntesis alrededor de todo no cambian nada; para deshacer se saca primero el cofre de más afuera. El símbolo nuevo son los paréntesis, el primero de la espina que no nombra ni cantidad ni acción sino estructura, y por eso [M](../M-calculadora/M0-progresion.md) lo clasifica como `structural`. Queda saldada además la deuda del nodo 7: el número con signo se mete en un cofre y deja de resolverse por altura.

## Generalización

Los cofres se retiran en `symbolic`, cuando el jugador toca la operación que se calcula primero en una fila de fichas sin pedir el fantasma. El árbol se queda a demanda hasta `formal` y más allá, porque no es una analogía sino una representación, y porque `calc1.deriv.rules_as_structure` lo usa tal cual.

Variantes sin ayuda visual: expresiones con tres operaciones y un solo par de paréntesis; el mismo conjunto de fichas con los paréntesis en dos lugares distintos; expresiones sin paréntesis donde la jerarquía decide; dos operaciones del mismo nivel, donde el acuerdo de izquierda a derecha es lo único que decide; expresiones que hay que deshacer en vez de calcular. Después, cerraduras que no son aritméticas: "girar 90°", "pintar de azul", "agregar 🍎". El jugador dice qué pasa en cada orden y elige el anidamiento que produce la figura mostrada. Cuando resuelve todo eso sin pedir cofres, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): sus niveles 3 y 4 (la caja dentro del cofre, fichas al lado del cofre) corresponden a este nodo en su cara de estructura, con una diferencia importante: acá la caja de adentro tiene un número, no una incógnita. La incógnita llega en `prealg.var.unknown_as_box`, que es el `next`, y del nivel 5 en adelante el ejemplo pertenece a los nodos 13 y 14.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Un cofre adentro de otro.** `concrete`, `manipulate`. Dos cofres, cerraduras de forma, llaves por forma. El de afuera gira en el vacío hasta que el de adentro entrega.
2. **Armar el anidamiento.** `concrete`, `manipulate`. El jugador mete cofres uno adentro de otro para reproducir un anidamiento mostrado. Tres cofres.
3. **Cofres y árbol.** `visual`, `explain` y `recognize`. Misma dificultad; aparecen los rectángulos redondeados, el punto grueso que sube y el árbol al costado.
4. **La tubería.** `visual`, `apply`. Entran dos máquinas y un caño: cambiar el orden cambia la salida, sin cofres y sin paréntesis.
5. **Fichas y paredes.** `symbolic` primera mitad, `manipulate`. Las paredes se vuelven paréntesis; la expresión aparece junto al cofre y se transforma en sincronía.
6. **Cofres invisibles.** `symbolic` segunda mitad, `generalize`. Fila de fichas sin cofres; el fantasma se pide con un toque. Aparece la jerarquía como acuerdo.
7. **Deshacer.** Parámetros: el nivel de vuelta. El jugador tiene el tesoro y el cofre cerrado, y tiene que sacar desde afuera. Aparece `unwrap_order_inverted`.
8. **Encastres que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; cofres con acciones no aritméticas y dos órdenes posibles por instancia.

Qué endurece cada parámetro: la cantidad de cofres obliga a planear en vez de probar; los cofres invisibles rompen la idea de que lo que no está dibujado no existe; dos operaciones del mismo nivel obligan a apoyarse en un acuerdo y no en una razón; el nivel de vuelta rompe el orden recién aprendido y es el que produce la misconception del nodo.

Desafíos de olimpíada: el nodo participa en los desafíos de aritmética y de álgebra de [S](../S-desafios/S0-desafios.md), aún no escritos, donde una expresión anidada aparece con parte de la estructura oculta. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: un cofre con otro adentro y la fila `2 + 3 × 4` al lado. Tocar la parte de la fila que está en el cofre interior. Distractores: el agrupamiento vecino y la fila leída de izquierda a derecha.
- `explain`: el mismo cofre anidado en dos animaciones. En una se abre primero el de adentro y el tesoro sube hasta la tapa del de afuera; en la otra se intenta abrir el de afuera primero y la llave gira en el vacío. Tocar la que abre en orden invertido. El distractor elegido clasifica: la confusión de órdenes reaparece como `unwrap_order_inverted`.
- `manipulate`: un árbol con una raíz de suma y una rama de multiplicación. Armar con fichas de paréntesis el anidamiento correspondiente y abrirlo desde adentro hacia afuera.
- `apply`: cuatro tuberías seguidas con dos máquinas y una salida mostrada. Conectar las fichas de operación en el orden que produce esa salida, contra el tiempo objetivo del nodo.
- `generalize`: sin cofres dibujados, tocar la operación que se calcula primero en `2 + 3 × 4`, en `( 2 + 3 ) × 4` y en `12 ÷ 3 × 2`, donde el acuerdo de izquierda a derecha es lo único que decide. Y un cofre con cerraduras "girar 90°" y "pintar de azul": elegir el anidamiento que produce la figura mostrada.
- `transfer`: en una tubería de pasos de un algoritmo de `csmath.inv.loop_invariant`, ordenar los pasos para que el resultado coincida con el árbol. También en `prealg.var.unknown_as_box`, `alg.eq.multi_step` y `calc1.deriv.rules_as_structure`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `unwrap_order_inverted`, patrón `tree_unwrap` sobre `chest_key`, severidad 2. Aparece en el nivel 7. El juego ejecuta la respuesta del jugador: la llave interior gira en el vacío porque la tapa exterior sigue cerrada, y el cofre no se mueve. Después el árbol se dibuja al costado y el recorrido se ilumina de la raíz hacia abajo, nodo por nodo, con el nodo elegido marcado fuera de la secuencia. Voz: "Ese cofre todavía está adentro de otro. ¿Cuál está más afuera?". El jugador sigue desde el cofre cerrado, que no cambió. La regla `detect` del catálogo está escrita con una incógnita, que llega en `prealg.var.unknown_as_box`; acá corre sobre el hueco vacío de la tapa, el mismo objeto sin nombre. La discrepancia está anotada como tal.

Errores previstos sin entrada propia, que no clasifican ni bloquean `ready`:

- **Calcular de izquierda a derecha.** El juego arma el cofre que el jugador describió, lo abre y pone su tesoro al lado del cofre dibujado con el suyo. Voz: "Armaste este cofre. ¿Es el que estaba dibujado?".
- **Creer que los paréntesis operan.** El juego los dibuja, abre el cofre resultante y superpone las dos fichas de total. Voz: "Pusiste un cofre alrededor de todo. ¿Cambió lo que hay adentro?".

Los distractores se generan desde las reglas `detect` de `unwrap_order_inverted` y de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_nested_open_inside_first`, nativa. Los rectángulos anidados, el punto grueso que sube hacia el hueco de la tapa siguiente y el árbol al costado con los nodos iluminándose en secuencia; gramática `compose`. Parametrizada por la expresión, dada como árbol, y por el orden de apertura, produce las dos animaciones de `explain`, el recorrido invertido de `tree_unwrap` y los ítems de `recognize`. Es la imagen de cheatsheet de `cs.arith.inner_chest_first`.
- `pipe_two_machines_order_matters`, nativa. Dos rectángulos, la flecha del caño, la bolita que atraviesa y el valor que cambia en cada máquina, con las máquinas intercambiándose y la salida distinta. Parametrizada por las operaciones y la entrada, produce los ítems de `apply`. Es la imagen de cheatsheet de `cs.arith.expression_is_a_tree`, junto con el árbol dibujado.
- Reusada: `chest_wrong_key_stays_shut` (nodo 12), como distractor de la llave que no muerde, con la diferencia de que acá la llave gira en el vacío en vez de trabarse, y esa diferencia distingue "llave equivocada" de "cofre inaccesible".
- Ninguna lleva texto rasterizado: los numerales, los operadores y los paréntesis los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_nested_chest`: `depth` (2 en los niveles 1 y 3, 3 desde el 2); `ops` en {add, sub, mul, div}; `operand_range`; `visible_chests` (falso desde el nivel 6); `direction` en {evaluate, undo}; `seed`.
- `gen_expression_tree`: `nodes`; `same_level_pairs` (desde el nivel 6); `paren_positions` (una o dos ubicaciones para el mismo conjunto de fichas); `distractors` desde `detect` (agrupamiento vecino, lectura de izquierda a derecha); `seed`.
- `gen_machine_pipe`: `ops` (dos máquinas hasta el nivel 6, tres después); `input`; `swapped`; `seed`.
- `gen_arbitrary_nesting`: cerraduras no aritméticas con dos órdenes posibles y una figura objetivo por instancia.

**Literacy soportada:** de `none` a `full_text`. Los niveles 1 a 4 no tienen numerales: los cofres se distinguen por material y tamaño, las cerraduras por forma y los tesoros por color, y la tubería usa bolitas de distinto tamaño en vez de números. Los numerales y los paréntesis aparecen en el nivel 5 y la definición corta en el 8. En `full_text` la definición se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma intenta abrir el cofre de afuera y la llave gira en el vacío; después abre el de adentro, saca la gema y la apoya en el hueco de la tapa del de afuera, que se ilumina, y recién ahí abre el de afuera. La escena vuelve al inicio y el llavero late. Se repite solo si el jugador se queda quieto. La demostración de la tubería aparece en el nivel 4 y no se repite ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
