# 09 — Los paréntesis son cofres anidados (`arith.expr.precedence_tree`)

> Locale `es`: "Los paréntesis son cofres anidados". Minijuego: [Cofres dentro de cofres](../../F-minijuegos/arith.expr.precedence_tree.md).

**Nodo:** `arith.expr.precedence_tree` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `compose` · **Mecánica principal:** `chest_key` (secundaria `machine_pipe`) · **Literacy:** `none` · **Analogía:** `chest_nested`

## 1. Concepto

Una expresión no es una fila de números que se lee de izquierda a derecha: es un encastre. Los cofres metidos uno adentro del otro son el árbol, y el árbol dice qué se calcula primero. Al terminar, el jugador arma con fichas el anidamiento que corresponde a un árbol dibujado, abre los cofres desde adentro hacia afuera para llegar al tesoro, y sabe que para deshacer una expresión hay que ir en el orden contrario, de afuera hacia adentro.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): el estirado y el piso. Se usan el símbolo `×` y, sobre todo, la experiencia de que multiplicar y sumar son acciones de naturaleza distinta: una cambia la escala, la otra corre el objeto. Esa diferencia sentida es lo que hace creíble que la multiplicación viva en un cofre más adentro que la suma, en vez de ser una regla que se memoriza.

Es el único prerequisito del YAML, y la arista se aparta del orden escolar en dos puntos. Primero, la escuela enseña la jerarquía como una lista de pasos que se recita antes de entender por qué; acá el orden es una consecuencia de dónde está cada cofre y la lista no existe. Segundo, la escuela pone los paréntesis después de las cuatro operaciones; [C0](../../C-knowledge-graph/C0-esquema.md) los pone antes de la incógnita, porque `prealg.var.unknown_as_box` necesita una caja dentro de una expresión y no hay expresión sin estructura.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar una regla. Son cinco capacidades:

1. **Ver forma donde hay una fila.** Una expresión escrita es plana y su significado no lo es. Quien la lee como un renglón calcula en el orden en que aparecen los símbolos, y eso funciona por casualidad la mitad de las veces, que es lo peor que puede pasar.
2. **Aceptar cofres que no están dibujados.** En `2 + 3 × 4` hay un cofre alrededor de `3 × 4` que nadie dibujó. Es una convención para ahorrar tinta, no una propiedad de los números, y el jugador tiene que saber que es una convención.
3. **Distinguir los dos órdenes opuestos.** Para calcular se abre desde adentro; para deshacer se saca desde afuera. Los dos recorren el mismo árbol en sentidos contrarios, y confundirlos es la misconception del nodo.
4. **Entender que los paréntesis no hacen nada.** No suman ni multiplican: solo dicen qué está adentro de qué, y cambiarlos de lugar cambia el resultado sin cambiar ningún número.
5. **Sentir que el orden de dos acciones importa.** Duplicar y después sumar tres no es sumar tres y después duplicar. Es la primera vez en la espina que dos acciones válidas dan resultados distintos según el orden.

## 4. Problema intuitivo

Una habitación con un cofre grande de madera en el piso. Se ve pesado, tiene una cerradura con forma y al costado hay un llavero.

En `real` el jugador solo mira: alguien abre el cofre grande y adentro hay otro cofre más chico, de hierro, cerrado; lo saca, lo abre, y adentro hay una gema. En `intuition` la escena se detiene con el cofre grande recién abierto y el chico a la vista, todavía cerrado. Tres desenlaces dibujados: se abre el chico y aparece la gema; se cierra el grande con el chico adentro y no pasa nada; se intenta poner la gema en el grande sin abrir el chico y no entra. El jugador elige y después ve. El tercero instala la idea clave: el cofre de afuera no se completa hasta que el de adentro entregó lo suyo.

La variante de tubería son dos máquinas conectadas por un caño, con una bolita a mitad de camino. Dos desenlaces según por qué máquina pasó primero.

## 5. Analogía del mundo real

Una analogía viste el nodo y una mecánica secundaria aporta el contraste ([G0](../../G-analogias/G0-reglas.md)).

`chest_nested` (mecánica `chest_key`) es la del YAML. Mapa: cofre → expresión; cofre dentro de un cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; tesoro → valor; secuencia de cerraduras agregadas → composición. Invariante: el valor de un cofre no depende de cuándo se lo abra sino de qué tiene adentro. Ruptura: `unknown_in_two_chests`, la misma incógnita repartida en dos cofres, que ni el nodo 14 resuelve del todo.

Hay una entrada del `structure_map` que este nodo usa al revés de como está escrita: `opening_outer_chest_first: reverse_precedence`. Abrir el de afuera primero es el orden de deshacer, no el de calcular, y las probes del locale y la escena `chest_nested_open_inside_first` piden el contrario. El texto del locale de la analogía afirma que siempre se abre primero el de afuera, y contradice al resto. La discrepancia está anotada como tal, y este documento fija el criterio: **para calcular se abre desde adentro; para deshacer se saca desde afuera**, y las dos cosas se juegan.

Cómo se sostiene físicamente: la cerradura del cofre de afuera tiene un hueco con la forma del tesoro del cofre de adentro. Hasta que ese tesoro no existe, la llave gira en el vacío. No hay que explicarlo; el jugador lo siente en el primer intento. `machine_pipe` no trae analogía propia: trae el contraste, con el orden a la vista en la dirección del caño.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Dos mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `chest_key` es la principal y aporta el anidamiento; `machine_pipe` aporta que el orden importa, con su invariante de que la misma entrada por el mismo camino da siempre la misma salida. Se encuentran en un gesto: el arrastre que mete una cosa adentro de otra. Gestos: `drag` y `tap`.

1. Un cofre de madera cerrado con una cerradura de forma, un llavero al lado, y el cofre se ve más grande de lo que hace falta para una gema.
2. Demostración: una mano fantasma abre el de madera; adentro hay uno de hierro. Toma su llave, lo abre, saca la gema y la apoya en el hueco de la tapa del de madera, que se ilumina. Repite la secuencia una vez y desaparece.
3. El jugador abre con `drag`. Si usa la llave del cofre exterior antes de que el interior haya entregado su tesoro, la llave gira en el vacío y vuelve sola. Nada se llama incorrecto: el hueco de la tapa está vacío y late.
4. Anidar: el jugador arrastra un cofre chico adentro de uno grande, cuyas paredes se abren para recibirlo. Con tres cofres, el orden queda dibujado en el tamaño.
5. Armar desde un árbol: aparece un árbol con líneas y nodos y el jugador construye el anidamiento que le corresponde. El árbol y los cofres laten juntos cuando coinciden.
6. Tubería: el jugador arrastra las máquinas para cambiarlas de orden y suelta una bolita, que sale con otro tamaño según el orden.
7. Deshacer: en el nivel de vuelta el jugador tiene el tesoro y el cofre entero cerrado. Ahora funciona la llave del cofre de afuera, y el juego no lo avisa: quien prueba con la de adentro la ve girar en el vacío otra vez, por el motivo opuesto.
8. Cofres invisibles: una fila de fichas sin cofres dibujados, con una cerradura de multiplicar entre dos. Al tocar la fila, un cofre fantasma se dibuja alrededor de la multiplicación y se desvanece, cuantas veces el jugador quiera.

## 7. Representación visual

Capa `visual`, primitiva `compose` de [H](../../H-progresion-abstraccion.md), con `invert` heredada del nodo 6 en los niveles de vuelta.

Los cofres se estilizan en rectángulos redondeados uno adentro del otro, con la cerradura como una marca en el borde y el tesoro como un punto grueso en el centro del más interno. Abrir hace subir el punto grueso hacia el hueco del cofre siguiente, y ese ascenso es todo el concepto: el valor sube por el árbol. Lo que se conserva es el anidamiento; lo que se desplaza es el valor.

El árbol se dibuja al costado como líneas que bajan desde una raíz, con un nodo por rectángulo. Al abrir un cofre, su nodo se ilumina, y la secuencia dibuja el recorrido; en los niveles de vuelta el recorrido se ilumina en sentido contrario y con otro grosor, para comparar las dos direcciones de un vistazo. La tubería se estiliza en dos rectángulos y una flecha, con un valor que cambia al pasar por cada uno. Todavía no hay igual, ni incógnita, ni fracciones dentro de la expresión.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto.

1. **Cerradura → ficha de operación.** Al abrir un cofre por primera vez en `visual`, la marca de la cerradura se despega del borde y se contrae en la ficha del operador, entre los dos números del contenido. El cofre queda como contorno.
2. **Paredes del cofre → paréntesis.** Al anidar dos cofres con fichas adentro, las paredes laterales del interior se adelgazan, se curvan y se quedan a izquierda y derecha de su contenido, mientras el resto del contorno se desvanece. Queda `( 3 × 4 )`. Los paréntesis son lo que sobra del cofre.
3. **Cofre exterior → la fila entera.** El contorno de afuera se desvanece último y deja `2 + ( 3 × 4 )` sobre una línea. El tesoro que subía se convierte en la ficha del total, apoyada sobre la fila como en los nodos 5 y 6.
4. **Cofre fantasma → paréntesis que se borran.** En el nivel de cofres invisibles, el jugador toca la fila, el cofre alrededor de la multiplicación se dibuja, sus paredes se vuelven paréntesis y después los paréntesis se desvanecen dejando `2 + 3 × 4`. El ciclo se repite mientras el dedo esté apoyado. Ese ir y venir es la definición de la jerarquía.

## 9. Notación matemática

Queda `2 + ( 3 × 4 )` sobre la fila de fichas, con la ficha del total apoyada, y en el nivel siguiente la misma expresión sin paréntesis.

El símbolo nuevo son los paréntesis. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llegan con el problema que los hizo necesario, de encargo como en los nodos 5, 6 y 8 pero con un giro: el jugador tiene que describirle a otro, que está del otro lado de una pared, cómo armar un cofre que él ya armó. Con `2`, `3`, `4`, `+` y `×` no alcanza, porque el otro arma dos cofres distintos con las mismas piezas y saca dos tesoros distintos. Los paréntesis son lo único que dice cuál, y el nivel se pasa cuando el tesoro del otro lado coincide.

Son el primer símbolo de la espina que no nombra ni cantidad ni acción sino estructura, y por eso [M](../../M-calculadora/M0-progresion.md) lo clasifica como `structural`. La convención de no escribirlos alrededor de la multiplicación llega enseguida, con su propio problema: escribir todos los cofres llena la fila de paredes y ya no se lee. La jerarquía es un acuerdo de ahorro y el jugador lo ve nacer como ahorro. Queda saldada además la deuda del nodo 7: el número con signo se mete en un cofre y deja de resolverse por altura.

## 10. Definición formal

Capa `formal`, texto corto con voz y el cofre anidado al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, verificables sobre el objeto. Una expresión es un encastre de operaciones, y su forma se dibuja como un árbol donde cada operación es un nodo. Para calcular el valor se empieza por el cofre de más adentro y se sube. Los paréntesis no operan: solo dicen qué está adentro de qué.

Condiciones: cuando no hay paréntesis dibujados, la multiplicación y la división están en un cofre más adentro que la suma y la resta, por acuerdo; entre operaciones del mismo nivel el cofre se arma de izquierda a derecha, también por acuerdo; unos paréntesis alrededor de todo no cambian nada; para deshacer se saca primero el cofre de más afuera. Ya jugado: las tres frases enteras y también el recorrido de vuelta. Nuevo: la palabra "árbol" y la formulación explícita del acuerdo.

## 11. Propiedades

- **La forma manda sobre el orden de lectura.** Los mismos números en cofres distintos dan tesoros distintos. Ligada al nivel de armado desde un árbol. Es `cs.arith.expression_is_a_tree`.
- **Para calcular se abre desde adentro.** Ligada a la llave del cofre exterior que gira en el vacío mientras el hueco de la tapa está vacío. Es `cs.arith.inner_chest_first`.
- **Para deshacer se saca desde afuera.** Ligada al nivel de vuelta, donde la llave que antes no servía es la única que sirve. Es la propiedad que `alg.eq.multi_step` va a usar entera.
- **Los paréntesis no cambian ningún número.** Ligada al cofre fantasma que se dibuja y se borra sin que el tesoro se mueva.
- **Dos acciones en fila no se pueden intercambiar.** Ligada a las dos máquinas de la tubería. Es la semilla de `alg.fn.composition`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: un cofre con otro adentro y una fila de fichas al lado. Tocar la parte de la fila que está en el cofre interior. Distractores: el agrupamiento vecino y la fila leída de izquierda a derecha.
- `explain`: dos animaciones sobre el mismo cofre anidado. En una se abre primero el de adentro y el tesoro sube hasta la tapa del de afuera; en la otra se intenta abrir el de afuera primero y la llave gira en el vacío. Tocar la que abre en orden invertido. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: armar con fichas de paréntesis el cofre anidado que corresponde a un árbol dibujado, y después abrirlo desde adentro hacia afuera.
- `apply`: dos máquinas en tubería y una salida mostrada. Conectar las fichas de operación en el orden que produce esa salida, contra el tiempo objetivo del nodo.
- `generalize`: sin cofres dibujados, solo fichas. Tocar la operación que se calcula primero, con paréntesis y sin ellos, incluidas las expresiones con dos operaciones del mismo nivel.
- `transfer`: en una tubería de pasos de un algoritmo de `csmath.inv.loop_invariant`, ordenar los pasos para que el resultado coincida con el árbol dado.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`unwrap_order_inverted`**, patrón `tree_unwrap` sobre `chest_key`, severidad 2. Aparece en el nivel de vuelta, cuando el jugador aplica la llave del cofre de adentro primero, arrastrando al orden de calcular una situación que pide el contrario. El juego ejecuta su respuesta: la llave interior gira en el vacío porque la tapa exterior sigue cerrada, y el cofre no se mueve. Después el árbol se dibuja al costado y el recorrido se ilumina de la raíz hacia abajo, nodo por nodo, con el nodo elegido marcado fuera de la secuencia. Voz: "Ese cofre todavía está adentro de otro. ¿Cuál está más afuera?". El jugador sigue desde el cofre cerrado, que no cambió. La regla `detect` del catálogo está escrita con una incógnita, que llega en `prealg.var.unknown_as_box`; acá corre sobre el hueco vacío de la tapa, que es el mismo objeto sin nombre todavía. La discrepancia está anotada como tal.

Errores previstos sin entrada en el catálogo, que no clasifican ni bloquean `ready`:

- **Calcular de izquierda a derecha.** El juego arma el cofre que el jugador describió, lo abre y pone su tesoro al lado del cofre dibujado con el suyo. Los dos quedan a la vista. Voz: "Armaste este cofre. ¿Es el que estaba dibujado?".
- **Creer que los paréntesis operan.** El jugador agrega paréntesis alrededor de todo esperando que el resultado cambie. El juego los dibuja, abre el cofre y superpone las dos fichas de total. Voz: "Pusiste un cofre alrededor de todo. ¿Cambió lo que hay adentro?".

## 13. Generalización

La analogía se retira en `symbolic`. Los cofres se van cuando el jugador toca la operación que se calcula primero sin pedir el fantasma. El árbol se queda a demanda, porque no es una analogía sino una representación, y porque `calc1.deriv.rules_as_structure` lo usa tal cual.

Variantes sin ayuda visual, en orden: expresiones con tres operaciones y un solo par de paréntesis; el mismo conjunto de fichas con los paréntesis en dos lugares distintos; expresiones sin paréntesis donde la jerarquía decide; dos operaciones del mismo nivel, donde el acuerdo de izquierda a derecha es lo único que decide; expresiones que hay que deshacer en vez de calcular. Después, encastres arbitrarios con cerraduras no aritméticas: "girar 90°", "pintar de azul", "agregar 🍎". El jugador dice qué pasa en cada orden y elige el anidamiento que produce la figura mostrada.

El nodo está en `abstract` cuando calcula sin pedir cofres, arma el anidamiento a partir de un árbol, distingue el orden de calcular del de deshacer sin que se lo recuerden y resuelve el encastre arbitrario.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `prealg.var.unknown_as_box` (`ledger`): el hueco de la tapa deja de ser un hueco y pasa a tener nombre. Es también el `next`, y por eso la transferencia es inmediata.
- `alg.eq.multi_step` (`balance`): dos cerraduras sobre la misma caja, con la balanza obligando a hacerlo en los dos platos. El orden de deshacer de este nodo decide cuál llave se usa primero, y esa es la arista que el nodo 14 usa entera.
- `csmath.inv.loop_invariant` (`machine_pipe`): el anidamiento se vuelve el cuerpo de un ciclo, y lo que sube por el árbol es lo que se conserva en cada vuelta.
- `calc1.deriv.rules_as_structure` (`machine_pipe`): la regla se elige por la forma de la expresión y no por los números. El árbol es el mismo, y derivar es recorrerlo.

Concepto siguiente: `prealg.var.unknown_as_box`. Frase puente, narrada sobre el último cofre abierto: "Adentro del cofre de más adentro siempre había un número. ¿Y si un día hay una caja cerrada que nadie abrió todavía?". El punto grueso del tesoro se vuelve un contorno vacío, los cofres se desvanecen alrededor y queda la caja sola en la fila de fichas, donde el nodo siguiente empieza.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `chest_nested_open_inside_first` es la mecánica renderizada sobre el estado del jugador: los rectángulos anidados, el punto grueso que sube hacia el hueco de la tapa siguiente y el árbol al costado con los nodos iluminándose en secuencia; gramática `compose`, parametrizada por la expresión, dada como árbol, y por el orden de apertura, produce las dos animaciones de `explain`, el recorrido invertido de `tree_unwrap` y los ítems de `recognize`. `pipe_two_machines_order_matters` es la tubería, parametrizada por las operaciones y la entrada, y produce los ítems de `apply`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsa `chest_wrong_key_stays_shut` como distractor.

**Calculadora:** en `ready` se habilita `op_paren` ([M](../../M-calculadora/M0-progresion.md)), la primera tecla `structural` del teclado y la primera que toma una expresión y no un número. No se toca entre dos fichas: se seleccionan fichas y la tecla las envuelve, hundiéndolas en un cofre que después se vuelve dos paredes curvas. Ocupa un lugar propio, separado de las cuatro operaciones, y esa separación dice que no es una operación. Apretada, dibuja el árbol de la expresión completa, con los cofres fantasma de la jerarquía cuando no hay paréntesis. Si el nodo decae, muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que abre el cofre de adentro y apoya la gema en el hueco de la tapa, los targets son del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada: la llave que gira en el vacío se ve girar y el hueco vacío late. La analogía es `cultural_scope: universal` y no necesita variantes regionales. Un adulto llega por diagnóstico, saltea `real` e `intuition` y entra por el armado desde un árbol.
