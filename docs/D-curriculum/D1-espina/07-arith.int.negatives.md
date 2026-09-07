# 07 — Negativo es la dirección contraria (`arith.int.negatives`)

> Locale `es`: "Negativo es la dirección contraria". Minijuego: [El ascensor y el caminante](../../F-minijuegos/arith.int.negatives.md).

**Nodo:** `arith.int.negatives` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundarias `ledger`, `grid_stretch`) · **Literacy:** `none` · **Analogía:** `elevator_floors` (con `debt_ledger` para el libro de cuentas)

## 1. Concepto

Un número deja de decir solamente cuánto y empieza a decir también hacia dónde. El cero deja de ser el borde del mundo y se vuelve un punto con dos lados: se puede seguir caminando después de pisarlo. Al terminar, el jugador lleva al caminante a una casilla del lado izquierdo de la pista, ordena fichas negativas y positivas de menor a mayor, cancela una moneda con un vale de deuda del mismo tamaño y sabe que darse vuelta dos veces deja mirando hacia donde se miraba al principio. Antes el caminante se frenaba en el cero; ahora lo atraviesa.

## 2. Prerequisitos

- `arith.sub.undo_add` (nodo 4): restar como caminar hacia atrás. Se usan la manivela con su paso uniforme, la pista graduada, el caminante que da media vuelta para volver, y el hecho de que restar y sumar son la misma acción en dos direcciones. Ese "en dos direcciones" es todo lo que el nodo necesita: acá la dirección deja de ser una propiedad del movimiento y pasa a ser una propiedad del número.

Es el único prerequisito del YAML, y conviene decir por qué no están los otros. Multiplicar no hace falta: acá no se multiplica nada, y el producto de signos vive en `arith.int.mul_signed`. Dividir tampoco. La arista se aparta del orden escolar en un punto: la escuela suele introducir los negativos mucho después, junto con sus reglas de signos, como un tema aparte. [C0](../../C-knowledge-graph/C0-esquema.md) los pone acá, en nivel 1 y sin lectura, porque un chico que sabe caminar hacia atrás en una pista ya tiene todo lo que hace falta, y porque sin negativos la recta numérica queda coja para todos los nodos que vienen.

## 3. Dificultad cognitiva real

Lo difícil no es "poner un menos adelante". Son cinco capacidades:

1. **Aceptar que el número lleva dos datos.** Hasta ahora un número decía un tamaño. Ahora dice un tamaño y un lado. El jugador que trata el signo como decoración se equivoca en todo lo que viene, y el que lo trata como una operación pegada al número se equivoca en el nodo 9.
2. **Reubicar el cero.** El cero era el clavo, el suelo, el principio de la pista. Ahora es un punto cualquiera con la particularidad de que separa. Y no es un punto especial de la realidad: la planta baja es cero porque alguien lo decidió, y el mismo edificio contado desde el subsuelo daría otros números.
3. **Invertir el orden a la izquierda.** El piso menos tres está más abajo que el piso menos uno, aunque tres sea más que uno. Es la primera vez en la espina que "más grande" y "más lejos" dejan de coincidir.
4. **Distinguir la acción del lugar.** "Bajar tres pisos" y "estar en el piso menos tres" se escriben casi igual y no son lo mismo. La confusión entre las dos es la que produce, más adelante, todos los errores de signo.
5. **Sentir que dos vueltas devuelven.** El caminante que gira dos veces mira para donde miraba. Es una propiedad de la dirección, no una regla de cuentas, y es la que va a explicar el producto de dos negativos cuando llegue el momento.

La quinta es la que el YAML declara como misconception del nodo aunque el producto de signos se enseñe completo mucho después. Acá se juega solo la vuelta.

## 4. Problema intuitivo

Un edificio en corte, como una casa de muñecas abierta. La calle está a la mitad de la pantalla. Arriba hay pisos con ventanas; abajo hay subsuelos con luz de garaje. Un ascensor sube y baja de a un piso.

En `real` el jugador solo mira: el ascensor sale de la calle, sube tres, vuelve, y sigue bajando hasta que aparece un piso debajo de la calle, y otro. En `intuition` la escena se detiene con el ascensor en la calle y una flecha que apunta hacia abajo. Tres desenlaces dibujados: el ascensor baja y aparecen los subsuelos; el ascensor baja, se queda trabado contra la calle y no pasa; el ascensor baja y reaparece arriba de todo. El jugador elige y después ve. El segundo desenlace es el mundo sin negativos y el tercero es el mundo circular de `disc.mod.clock_equivalence`, que existe pero no es este.

La variante del caminante es la pista del nodo 4 con el caminante parado en el cero, mirando hacia la izquierda, y la manivela girando hacia atrás. La escena se detiene un paso antes del cero. El jugador predice si hay casilla del otro lado.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara del concepto ([G0](../../G-analogias/G0-reglas.md)).

`elevator_floors` es la del YAML. Mapa: piso → número entero; planta baja → cero; subir n → sumar un positivo; bajar n → sumar un negativo; piso de subsuelo → número negativo; pisos entre dos paradas → diferencia absoluta; orden de los botones → orden de los enteros. Invariante: la cantidad de pisos entre dos paradas no depende de dónde esté el cero. Ruptura: `multiplying_floors`. Multiplicar dos pisos no significa nada en un edificio, y por eso el producto de signos no se juega acá.

`debt_ledger` aporta la cancelación. Mapa: moneda → unidad positiva; vale de deuda → unidad negativa; moneda y vale que se anulan → opuesto aditivo; sacar un vale → restar un negativo; montón neto → suma con signo; k vales iguales → multiplicar un negativo por un positivo. Invariante: el neto no cambia si se agregan pares moneda y vale. Ruptura: `multiplying_two_debts`, otra vez el producto.

Por qué las dos. El ascensor da la posición y el orden, que es lo que la recta necesita; el libro de cuentas da la cancelación, que la recta no muestra bien, porque en la pista una moneda y un vale no se ven anularse, se ven como dos pasos. Juntas cubren el nodo y ninguna se estira más allá de su borde: las dos se rompen exactamente donde empieza el producto.

Las dos entradas declaran `literacy_min: icons` y el nodo declara `literacy: none`. La primera capa jugable se sostiene sin leer porque los pisos se distinguen por altura y por la luz de garaje, y las monedas y los vales por forma. Los numerales del panel del ascensor aparecen recién en el nivel donde ya hay fichas, y ahí el mínimo real sube a `icons`. La discrepancia está anotada como tal.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `gears_sequence` es la principal y aporta el paso uniforme y la manivela que gira en los dos sentidos. `ledger` aporta la cancelación con objetos. `grid_stretch` aporta la banda del nodo 5, que acá se usa para una sola cosa: mostrar que el clavo tiene dos lados. Gestos: `scrub`, `drag` y `tap`.

1. La pista graduada del nodo 4, con el caminante en el cero, y la manivela a un costado. A la derecha de la pista, el edificio en corte con el ascensor enganchado al mismo eje: cada vuelta de manivela mueve al caminante una casilla y al ascensor un piso.
2. Demostración: una mano fantasma gira la manivela hacia atrás. El caminante retrocede hasta el cero, se para, gira sobre sí mismo y sigue. La pista se extiende sola hacia la izquierda mientras camina, con casillas del mismo tamaño. La mano suelta y desaparece.
3. El jugador gira la manivela con `scrub`. La pista se dibuja hacia el lado que haga falta. El caminante lleva una bandera que apunta hacia donde mira, y la bandera se da vuelta al cruzar el cero.
4. Tocar el caminante lo hace girar sin moverse. La bandera cambia de lado. Es el gesto de la vuelta, separado del gesto de caminar, y esa separación es deliberada.
5. Libro de cuentas. El jugador arrastra monedas a un lado del tablero y vales al otro. Al soltar un vale sobre una moneda del mismo tamaño, los dos se apagan y desaparecen con un chasquido. Lo que queda sin pareja es el neto, y una ficha lo sigue.
6. Sacar un vale del tablero con el dedo sube el neto. Nadie lo dice; el jugador lo ve y esa es la semilla de restar un negativo.
7. Comparar. Dos fichas de piso caen sobre el edificio y el jugador arrastra la que está más abajo a una caja marcada. La caja se ilumina si acertó. En la pista, la misma tarea es arrastrar la casilla más a la izquierda.
8. Si el jugador ordena por tamaño y no por posición, las fichas se colocan igual y el edificio las muestra: la que puso como menor queda dibujada más arriba que la otra. El dibujo es el mensaje.

## 7. Representación visual

Capa `visual`, primitiva `displace` de [H](../../H-progresion-abstraccion.md).

La pista se estiliza en una recta con marcas equiespaciadas y un punto grueso en el cero, heredado del clavo del nodo 5. Lo que se desplaza es el caminante, ahora reducido a una flecha que apunta hacia donde mira; lo que se conserva es el tamaño del paso, igual de los dos lados. La recta se extiende sola hacia la izquierda con la misma separación, y ese "misma separación" es el invariante que se ilumina.

El edificio se estiliza en una escalera de rectángulos apilados con una línea gruesa en la calle. Las monedas se aplanan en fichas llenas hacia arriba y los vales en fichas huecas hacia abajo, y la cancelación se dibuja como dos fichas que se superponen y dejan un hueco transparente.

La banda del nodo 5 aparece una sola vez, en el nivel donde el clavo se convierte en el cero: el segmento crece hacia los dos lados del punto grueso.

Todavía no hay operador de suma con signo, ni valor absoluto, ni producto, ni igual.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Casilla → numeral con lado.** La primera vez que el caminante se detiene a la izquierda del cero en `visual`, la casilla donde está se ilumina y el numeral que ya conoce del nodo 1 aparece encima. El numeral es el mismo de la casilla simétrica de la derecha, y el juego lo muestra: los dos numerales laten a la vez.
2. **Bandera → signo.** En el mismo momento, la bandera del caminante se despega, se acuesta y se encoge hasta ser un trazo corto que se posa a la izquierda del numeral. Queda `-3`. El signo nace de la dirección, literalmente: es la bandera que apuntaba hacia la izquierda.
3. **Vale → el mismo signo.** En el libro de cuentas, al arrastrar el neto fuera del tablero, la ficha hueca se contrae y su borde inferior se despega como el mismo trazo corto. El jugador ve que la deuda y la dirección se escriben igual, y que no es casualidad.
4. **Dos trazos que se encuentran.** En el nivel donde el jugador saca un vale del tablero, aparecen juntos el trazo de restar del nodo 4 y el trazo de signo. El juego los separa levantando el del signo medio cuerpo y dejando el de restar sobre la línea. La convención definitiva, meter el número con signo en un cofre, llega en el nodo 9; acá se resuelve con la altura y se avisa que es provisorio.

## 9. Notación matemática

Queda el numeral con un trazo corto a la izquierda para las casillas de un lado del cero, y sin trazo para las del otro.

El símbolo nuevo es el signo del número. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que lo hizo necesario, y el problema es de encargo, como el `×` del nodo 5: el jugador tiene que pedir al portero del edificio que deje una caja en un piso, y el portero no ve la pantalla. Con `3` no alcanza, porque hay dos pisos que se llaman tres, uno arriba y uno abajo, y la caja llega al lugar equivocado la mitad de las veces. El trazo dice de qué lado.

Que el trazo se parezca al de restar es el segundo problema, y el nodo lo abre sin cerrarlo: la altura los distingue mientras alcanza. También queda dicho, sin escribirlo, que los números de la derecha no llevan nada: el lado sin marca es el que se da por supuesto, y esa asimetría es una convención, no una propiedad. No aparece ningún otro símbolo. No hay igual, no hay barras de valor absoluto y no hay operador entre dos números con signo, porque sumar con signo es `arith.int.add_signed`.

## 10. Definición formal

Capa `formal`, texto corto con voz y el edificio al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre el objeto en pantalla. Cada número tiene un opuesto, que está a la misma distancia del cero y del otro lado. Los números crecen hacia un lado y decrecen hacia el otro, sin frenarse en el cero. Un número y su opuesto juntos se cancelan y dejan el cero.

Condiciones y casos especiales, verificados sobre el objeto: el cero es su propio opuesto, y es el único que no tiene lado; la distancia entre dos pisos no depende de cuál se llame cero, y por eso mudar la planta baja cambia todos los nombres y ninguna distancia; a la izquierda del cero, el numeral más grande nombra el número más chico. Girar dos veces devuelve al caminante a su dirección original, y por eso el opuesto del opuesto es el número.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: la palabra "opuesto" como nombre de lo que antes era la casilla simétrica, y el caso del cero, que en el edificio es la calle y en el tablero es un montón sin fichas.

## 11. Propiedades

- **Todo número tiene un opuesto y juntos dan cero.** Ligada a la moneda y el vale que se apagan al superponerse. Es `cs.arith.negative_as_opposite_direction`.
- **Se puede restar más de lo que hay.** Ligada al caminante que cruza el cero y a la pista que se dibuja sola hacia la izquierda. Es `cs.arith.sub_past_zero`, y es la propiedad que rompe la regla implícita del nodo 4, donde restar se frenaba.
- **El orden se invierte a la izquierda del cero.** Ligada a la tarea de arrastrar el piso que está más abajo, donde el numeral más grande queda en el subsuelo más profundo.
- **La distancia entre dos números no tiene lado.** Ligada a contar pisos entre dos paradas del ascensor, que da lo mismo subiendo que bajando. Es la semilla de `alg.abs.distance_two_branches`.
- **Dos vueltas devuelven la dirección original.** Ligada al toque que hace girar al caminante sin moverlo, repetido dos veces. Es la semilla de `arith.int.mul_signed` y la única forma en que el producto de signos aparece en este nodo.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: el caminante en el cero y una ficha negativa que cae sobre la manivela. Tocar la casilla donde termina, del lado izquierdo de la pista. Los distractores se generan con la casilla simétrica a la derecha y con casillas vecinas.
- `explain`: dos animaciones sobre el mismo caminante. En una, gira dos veces y termina mirando hacia adelante; en la otra, gira dos veces y sigue mirando hacia atrás. Tocar la que se equivoca al girar dos veces. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: girar la manivela hacia atrás cruzando el cero, ver bajar el ascensor a los subsuelos y el libro de cuentas anotar vales al mismo ritmo.
- `apply`: dos fichas de piso, una arriba y otra abajo del cero. Arrastrar la ficha con la cantidad de pisos entre las dos, contra el tiempo objetivo del nodo.
- `generalize`: la pista pierde el edificio y quedan solo marcas. El jugador ordena fichas negativas y positivas de menor a mayor arrastrándolas a una fila.
- `transfer`: en el plano de cuatro cuadrantes de `trig.ang.quadrant_signs`, tocar el cuadrante donde un punto tiene los dos signos indicados.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`negative_times_negative`**, patrón `double_flip`, severidad 2. Aparece en el borde del nodo, cuando el jugador ve por primera vez dos vueltas seguidas. El catálogo la asocia a `slope_walker`, que este nodo no declara; el patrón corre sobre el caminante de `gears_sequence`, que es el mismo objeto con otra mecánica. El replay lo pone en el cero mirando a la derecha: la primera vuelta lo deja mirando a la izquierda y avanza, la segunda lo devuelve a mirar a la derecha y avanza más lejos todavía. La respuesta del jugador queda dibujada como una bandera clavada del lado equivocado, donde habría terminado con una sola vuelta. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?". El jugador vuelve a girar desde el estado real.

Errores que el diseño prevé y que no tienen entrada en el catálogo, y por eso no clasifican ni bloquean `ready`:

- **Ordenar por tamaño y no por posición.** El jugador pone `-5` antes que `-2` como si cinco fuera menos que dos, o al revés. El juego coloca las dos fichas donde el jugador dijo y encima dibuja el edificio: la que llamó menor queda más arriba. Voz: "Pusiste ese piso como el más bajo. ¿Cuál está más abajo en el edificio?".
- **Leer el signo como una orden de restar.** El jugador toma la ficha `-3` y la usa para hacer retroceder al caminante tres casillas desde donde esté, en vez de llevarlo al piso menos tres. El juego ejecuta las dos cosas una al lado de la otra en la misma pista, con dos caminantes de distinto color, y los deja quietos. Voz: "Una ficha dice a dónde ir. La otra dice cuánto moverse. ¿Cuál te dieron?".

## 13. Generalización

La analogía se retira en `symbolic`, como declaran las dos entradas de G. El edificio se va primero: en cuanto el jugador ordena fichas con signo sin mirarlo, los pisos compiten con la fila de fichas y además no soportan el nivel donde los números dejan de ser enteros. El libro de cuentas se queda un poco más, a demanda, porque la cancelación no tiene todavía otra forma de verse.

Variantes sin ayuda visual, en orden: números fuera del rango del edificio dibujado; comparaciones entre dos negativos, que es donde el orden invertido duele; el cero mezclado con negativos y positivos en la misma fila; y el mismo piso pedido desde dos ceros distintos, para comprobar que el jugador entiende que el cero es una elección.

Direcciones arbitrarias. El nodo termina con pistas que no llevan números: una fila de dibujos donde uno está marcado como origen, y una ficha que dice "tres hacia el lado de la flecha" o "tres hacia el otro lado". El jugador toca el dibujo que corresponde. Se evalúa que la estructura, un origen elegido y dos sentidos simétricos, se reconoce sin contar y sin numerales.

El nodo está en `abstract` cuando el jugador ordena negativos entre sí sin dibujo, cancela pares sin verlos superponerse, sabe que el opuesto del opuesto es el número y resuelve la pista arbitraria sin marcas numeradas.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `alg.fn.graph_as_picture` (`machine_pipe`): el plano con sus cuatro regiones. La pista con dos lados se cruza con otra pista con dos lados, y el caminante pasa a tener dos direcciones a la vez.
- `linalg.vec.vector_as_displacement` (`grid_stretch`): la flecha con origen y punta. La bandera del caminante se vuelve la punta del vector, y el opuesto es la misma flecha dada vuelta.
- `trig.ang.quadrant_signs` (`unit_circle_spin`): el giro que pasa por los cuatro cuadrantes. El caminante que cruza el cero se vuelve el punto que cruza un eje, y el cambio de signo es el mismo cruce.

Concepto siguiente: `arith.frac.parts_and_ratio` ([08](08-arith.frac.parts_and_ratio.md)). Frase puente, narrada sobre la pista con el caminante entre dos casillas: "El ascensor para en los pisos y el caminante para en las casillas. ¿Y si alguien quiere quedarse justo en la mitad, entre dos?". El caminante se queda en el aire entre dos marcas, la pista se ensancha hasta volverse una barra, y el nodo 8 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `gear_walk_past_zero` es la mecánica renderizada sobre el estado del jugador: la recta que se dibuja hacia la izquierda mientras la manivela gira, el punto grueso del cero quieto, la flecha del caminante que se da vuelta al cruzarlo y el valor que baja en paralelo; parametrizada por la casilla de partida y por el paso, produce los ítems de `recognize`, las dos animaciones de `explain` y el replay de `double_flip`. `ledger_debt_tokens` es el tablero: monedas y vales que caen, se superponen de a pares y se apagan, con el neto siguiéndolos en una ficha; parametrizada por la cantidad de créditos y de deudas, produce los ítems de `manipulate` y la cancelación de `apply`. Ninguna lleva texto rasterizado: los numerales y el trazo del signo los dibuja el runtime según el locale, y la manivela, el ascensor, la moneda y el vale son assets propios ([P](../../P-internacionalizacion.md)). Se reúsa `gear_walk_back_same_count` del nodo 4 como distractor.

**Calculadora:** en `ready` se habilita `op_neg` ([M](../../M-calculadora/M0-progresion.md)), que no es una tecla de operación entre dos fichas sino una tecla que actúa sobre una ficha sola: la da vuelta. Ocupa el lugar suelto al final de la segunda fila del primer tramo, separado del par de multiplicar y dividir, y esa separación visual dice que no es lo mismo que restar. Al tocarla, la ficha gira sobre su eje vertical y aparece con el trazo del otro lado. Manteniéndola apretada, muestra el caminante girando en la pista. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` en su primera capa y se juega sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que gira la manivela y cruza el cero, los targets son casillas, pisos y fichas del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Desde el nivel donde el panel del ascensor muestra numerales, el mínimo real sube a `icons`, y eso es lo que el minijuego declara. Con el sonido apagado no falta nada, porque el chasquido de la cancelación tiene su equivalente en el hueco transparente que queda. Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra directo en el nivel del libro de cuentas, que le resulta familiar, y usa el teclado de fichas en vez de arrastrar.
