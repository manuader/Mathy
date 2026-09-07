# 07 — Negativo es la dirección contraria (`arith.int.negatives`)

> Locale `es`: "Negativo es la dirección contraria". Minijuego: [El ascensor y el caminante](../../F-minijuegos/arith.int.negatives.md).

**Nodo:** `arith.int.negatives` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundarias `ledger`, `grid_stretch`) · **Literacy:** `none` · **Analogía:** `elevator_floors` (con `debt_ledger` para el libro de cuentas)

## 1. Concepto

Un número deja de decir solamente cuánto y empieza a decir también hacia dónde. El cero deja de ser el borde del mundo y se vuelve un punto con dos lados: se puede seguir caminando después de pisarlo. Al terminar, el jugador lleva al caminante a una casilla del lado izquierdo de la pista, ordena fichas negativas y positivas de menor a mayor, cancela una moneda con un vale de deuda del mismo tamaño y sabe que darse vuelta dos veces deja mirando hacia donde se miraba al principio.

## 2. Prerequisitos

- `arith.sub.undo_add` (nodo 4): restar como caminar hacia atrás. Se usan la manivela con su paso uniforme, la pista graduada, el caminante que da media vuelta para volver, y el hecho de que restar y sumar son la misma acción en dos direcciones. Ese "en dos direcciones" es todo lo que el nodo necesita: acá la dirección deja de ser una propiedad del movimiento y pasa a ser una propiedad del número.

Es el único prerequisito del YAML. Multiplicar no hace falta, porque acá no se multiplica nada y el producto de signos vive en `arith.int.mul_signed`. La arista se aparta del orden escolar en un punto: la escuela introduce los negativos mucho después, con sus reglas de signos, como un tema aparte. [C0](../../C-knowledge-graph/C0-esquema.md) los pone acá, en nivel 1 y sin lectura, porque un chico que sabe caminar hacia atrás ya tiene todo lo que hace falta y porque sin negativos la recta queda coja para lo que viene.

## 3. Dificultad cognitiva real

Lo difícil no es poner un menos adelante. Son cinco capacidades:

1. **Aceptar que el número lleva dos datos.** Un tamaño y un lado. Quien trata el signo como decoración se equivoca en todo lo que viene; quien lo trata como una operación pegada al número se equivoca en el nodo 9.
2. **Reubicar el cero.** Era el clavo, el suelo, el principio de la pista. Ahora es un punto que separa, y además es una decisión: el mismo edificio contado desde el subsuelo daría otros números.
3. **Invertir el orden a la izquierda.** El piso menos tres está más abajo que el menos uno, aunque tres sea más que uno. Es la primera vez que "más grande" y "más lejos" dejan de coincidir.
4. **Distinguir la acción del lugar.** Bajar tres pisos y estar en el piso menos tres se escriben casi igual y no son lo mismo. De esa confusión salen después todos los errores de signo.
5. **Sentir que dos vueltas devuelven.** El caminante que gira dos veces mira para donde miraba. Es una propiedad de la dirección, no una regla de cuentas.

La quinta es la que el YAML declara como misconception del nodo, aunque el producto de signos se enseñe completo mucho después. Acá se juega solo la vuelta.

## 4. Problema intuitivo

Un edificio en corte, como una casa de muñecas abierta. La calle está a la mitad de la pantalla; arriba hay pisos con ventanas y abajo, subsuelos con luz de garaje.

En `real` el jugador solo mira: el ascensor sale de la calle, sube tres, vuelve, y sigue bajando hasta que aparece un piso debajo de la calle, y otro. En `intuition` la escena se detiene con el ascensor en la calle y una flecha que apunta hacia abajo. Tres desenlaces dibujados: baja y aparecen los subsuelos; baja, se traba contra la calle y no pasa; baja y reaparece arriba de todo. El jugador elige y después ve. El segundo es el mundo sin negativos y el tercero es el mundo circular de `disc.mod.clock_equivalence`, que existe pero no es este. La variante del caminante es la pista del nodo 4 con la manivela girando hacia atrás, detenida un paso antes del cero.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara del concepto ([G0](../../G-analogias/G0-reglas.md)).

`elevator_floors` es la del YAML. Mapa: piso → número entero; planta baja → cero; subir n → sumar un positivo; bajar n → sumar un negativo; piso de subsuelo → número negativo; pisos entre dos paradas → diferencia absoluta; orden de los botones → orden de los enteros. Invariante: la cantidad de pisos entre dos paradas no depende de dónde esté el cero. Ruptura: `multiplying_floors`, porque multiplicar dos pisos no significa nada.

`debt_ledger` aporta la cancelación. Mapa: moneda → unidad positiva; vale de deuda → unidad negativa; moneda y vale que se anulan → opuesto aditivo; sacar un vale → restar un negativo; montón neto → suma con signo. Invariante: el neto no cambia si se agregan pares. Ruptura: `multiplying_two_debts`, otra vez el producto.

El ascensor da la posición y el orden; el libro de cuentas da la cancelación, que en la pista no se ve porque una moneda y un vale parecen dos pasos. Las dos se rompen exactamente donde empieza el producto, y por eso ese producto no se juega acá. Las dos declaran `literacy_min: icons` y el nodo declara `literacy: none`: la primera capa se sostiene sin leer porque los pisos se distinguen por altura y por la luz de garaje, y los numerales del panel aparecen recién donde ya hay fichas. La discrepancia está anotada como tal.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `gears_sequence` es la principal y aporta el paso uniforme y la manivela que gira en los dos sentidos; `ledger` aporta la cancelación con objetos; `grid_stretch` aporta la banda del nodo 5, solo para mostrar que el clavo tiene dos lados. Gestos: `scrub`, `drag` y `tap`.

1. La pista graduada del nodo 4 con el caminante en el cero y la manivela al costado. A la derecha, el edificio en corte enganchado al mismo eje: cada vuelta mueve al caminante una casilla y al ascensor un piso.
2. Demostración: una mano fantasma gira la manivela hacia atrás. El caminante retrocede hasta el cero, se para, gira sobre sí mismo y sigue; la pista se extiende sola hacia la izquierda con casillas del mismo tamaño.
3. El jugador gira con `scrub`. El caminante lleva una bandera que apunta hacia donde mira, y la bandera se da vuelta al cruzar el cero.
4. Tocar al caminante lo hace girar sin moverse. Es el gesto de la vuelta, separado a propósito del de caminar.
5. Libro de cuentas: el jugador arrastra monedas y vales al tablero. Al soltar un vale sobre una moneda del mismo tamaño, los dos se apagan y desaparecen. Lo que queda sin pareja es el neto, y una ficha lo sigue. Sacar un vale sube el neto, y nadie lo dice.
6. Comparar: dos fichas de piso caen sobre el edificio y el jugador arrastra la que está más abajo a una caja marcada. En la pista, la misma tarea es arrastrar la casilla más a la izquierda.
7. Si ordena por tamaño y no por posición, las fichas se colocan igual y el edificio las muestra: la que puso como menor queda dibujada más arriba. El dibujo es el mensaje.
8. Mudar el cero: el jugador arrastra la línea de la calle a otra altura. Todos los pisos cambian de nombre y ninguna distancia cambia.

## 7. Representación visual

Capa `visual`, primitiva `displace` de [H](../../H-progresion-abstraccion.md).

La pista se estiliza en una recta con marcas equiespaciadas y un punto grueso en el cero, heredado del clavo del nodo 5. Lo que se desplaza es el caminante, reducido a una flecha que apunta hacia donde mira; lo que se conserva es el tamaño del paso, igual de los dos lados. La recta se extiende sola hacia la izquierda con la misma separación, y ese "misma separación" es el invariante que se ilumina.

El edificio se estiliza en una escalera de rectángulos apilados con una línea gruesa en la calle. Las monedas se aplanan en fichas llenas hacia arriba y los vales en fichas huecas hacia abajo; la cancelación se dibuja como dos fichas que se superponen y dejan un hueco transparente. La banda del nodo 5 aparece una sola vez, cuando el clavo se convierte en el cero. Todavía no hay operador con signo, ni valor absoluto, ni producto, ni igual.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto.

1. **Casilla → numeral con lado.** La primera vez que el caminante se detiene a la izquierda del cero en `visual`, la casilla se ilumina y el numeral aparece encima. Es el mismo numeral de la casilla simétrica de la derecha, y los dos laten a la vez para que la ambigüedad se note.
2. **Bandera → signo.** En el mismo momento, la bandera se despega, se acuesta y se encoge hasta ser un trazo corto que se posa a la izquierda del numeral. Queda `-3`. El signo es la bandera que apuntaba hacia la izquierda.
3. **Vale → el mismo signo.** Al arrastrar el neto fuera del tablero, la ficha hueca se contrae y su borde inferior se despega como el mismo trazo corto. Deuda y dirección se escriben igual, y no es casualidad.
4. **Dos trazos que se encuentran.** Al sacar un vale del tablero aparecen juntos el trazo de restar del nodo 4 y el trazo de signo. El juego los separa levantando el del signo medio cuerpo. La convención definitiva, meter el número con signo en un cofre, llega en el nodo 9; acá alcanza la altura y el juego avisa que es provisorio.

## 9. Notación matemática

Queda el numeral con un trazo corto a la izquierda para las casillas de un lado del cero, y sin trazo para las del otro.

El símbolo nuevo es el signo del número. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que lo hizo necesario, y el problema es de encargo, como el `×` del nodo 5: el jugador tiene que pedirle al portero que deje una caja en un piso, y el portero no ve la pantalla. Con `3` no alcanza, porque hay dos pisos que se llaman tres y la caja llega al lugar equivocado la mitad de las veces. El trazo dice de qué lado.

Que el trazo se parezca al de restar es el segundo problema, y el nodo lo abre sin cerrarlo: la altura los distingue mientras alcanza. Queda dicho también, sin escribirlo, que los números de la derecha no llevan nada: el lado sin marca es el que se da por supuesto, y esa asimetría es una convención. No hay operador entre dos números con signo, porque sumar con signo es `arith.int.add_signed`.

## 10. Definición formal

Capa `formal`, texto corto con voz y el edificio al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, verificables sobre el objeto. Cada número tiene un opuesto, a la misma distancia del cero y del otro lado. Los números crecen hacia un lado y decrecen hacia el otro, sin frenarse en el cero. Un número y su opuesto juntos se cancelan y dejan el cero.

Condiciones: el cero es su propio opuesto y el único sin lado; la distancia entre dos pisos no depende de cuál se llame cero, y por eso mudar la planta baja cambia todos los nombres y ninguna distancia; a la izquierda del cero, el numeral más grande nombra el número más chico; girar dos veces devuelve la dirección original, y por eso el opuesto del opuesto es el número. Ya jugado: las tres frases enteras. Nuevo: la palabra "opuesto" y el caso del cero.

## 11. Propiedades

- **Todo número tiene un opuesto y juntos dan cero.** Ligada a la moneda y el vale que se apagan al superponerse. Es `cs.arith.negative_as_opposite_direction`.
- **Se puede restar más de lo que hay.** Ligada al caminante que cruza el cero y a la pista que se dibuja sola. Es `cs.arith.sub_past_zero`, y rompe la regla implícita del nodo 4.
- **El orden se invierte a la izquierda del cero.** Ligada a arrastrar el piso que está más abajo, donde el numeral más grande queda en el subsuelo más profundo.
- **La distancia entre dos números no tiene lado.** Ligada a contar pisos entre dos paradas. Es la semilla de `alg.abs.distance_two_branches`.
- **Dos vueltas devuelven la dirección original.** Ligada al toque que hace girar al caminante sin moverlo, repetido dos veces. Es la semilla de `arith.int.mul_signed`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: el caminante en el cero y una ficha negativa que cae sobre la manivela. Tocar la casilla donde termina, del lado izquierdo. Distractores: la casilla simétrica de la derecha y las vecinas.
- `explain`: dos animaciones sobre el mismo caminante. En una gira dos veces y termina mirando hacia adelante; en la otra gira dos veces y sigue mirando hacia atrás. Tocar la que se equivoca al girar dos veces. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: girar la manivela hacia atrás cruzando el cero, ver bajar el ascensor a los subsuelos y el libro anotar vales al mismo ritmo.
- `apply`: dos fichas de piso, una arriba y otra abajo del cero. Arrastrar la ficha con la cantidad de pisos entre las dos, contra el tiempo objetivo del nodo.
- `generalize`: la pista pierde el edificio y quedan marcas. Ordenar fichas negativas y positivas de menor a mayor arrastrándolas a una fila.
- `transfer`: en el plano de cuatro cuadrantes de `trig.ang.quadrant_signs`, tocar el cuadrante donde un punto tiene los dos signos indicados.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`negative_times_negative`**, patrón `double_flip`, severidad 2. Aparece en el borde del nodo, con dos vueltas seguidas. El catálogo la asocia a `slope_walker`, que este nodo no declara; el patrón corre sobre el caminante de `gears_sequence`, el mismo objeto con otra mecánica. El replay lo pone en el cero mirando a la derecha: la primera vuelta lo deja mirando a la izquierda y avanza, la segunda lo devuelve a mirar a la derecha y avanza más lejos. La respuesta del jugador queda dibujada como una bandera clavada del lado equivocado. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?". El jugador vuelve a girar desde el estado real.

Errores previstos sin entrada en el catálogo, que no clasifican ni bloquean `ready`:

- **Ordenar por tamaño y no por posición.** El juego coloca las fichas donde el jugador dijo y dibuja el edificio encima: la que llamó menor queda más arriba. Voz: "Pusiste ese piso como el más bajo. ¿Cuál está más abajo en el edificio?".
- **Leer el signo como una orden de restar.** El juego ejecuta las dos lecturas en la misma pista con dos caminantes de distinto color y los deja quietos. Voz: "Una ficha dice a dónde ir. La otra dice cuánto moverse. ¿Cuál te dieron?".

## 13. Generalización

La analogía se retira en `symbolic`. El edificio se va primero, en cuanto el jugador ordena fichas con signo sin mirarlo. El libro de cuentas se queda a demanda, porque la cancelación no tiene todavía otra forma de verse.

Variantes sin ayuda visual, en orden: números fuera del rango del edificio dibujado; comparaciones entre dos negativos, que es donde el orden invertido duele; el cero mezclado en la misma fila; el mismo piso pedido desde dos ceros distintos. Después, direcciones arbitrarias: una fila de dibujos con uno marcado como origen y una ficha que dice "tres hacia el lado de la flecha" o "tres hacia el otro lado". El jugador toca el dibujo correcto, sin numerales.

El nodo está en `abstract` cuando ordena negativos entre sí sin dibujo, cancela pares sin verlos superponerse, sabe que el opuesto del opuesto es el número y resuelve la pista arbitraria.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `alg.fn.graph_as_picture` (`machine_pipe`): la pista con dos lados se cruza con otra pista con dos lados, y el caminante pasa a tener dos direcciones a la vez.
- `linalg.vec.vector_as_displacement` (`grid_stretch`): la bandera se vuelve la punta del vector, y el opuesto es la misma flecha dada vuelta.
- `trig.ang.quadrant_signs` (`unit_circle_spin`): el caminante que cruza el cero se vuelve el punto que cruza un eje, y el cambio de signo es el mismo cruce.

Concepto siguiente: `arith.frac.parts_and_ratio` ([08](08-arith.frac.parts_and_ratio.md)). Frase puente, narrada sobre la pista: "El ascensor para en los pisos y el caminante para en las casillas. ¿Y si alguien quiere quedarse justo en la mitad, entre dos?". El caminante se queda en el aire entre dos marcas, la pista se ensancha hasta volverse una barra, y el nodo 8 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `gear_walk_past_zero` es la mecánica renderizada sobre el estado del jugador: la recta que se dibuja hacia la izquierda mientras la manivela gira, el punto grueso del cero quieto, la flecha del caminante que se da vuelta al cruzarlo y el valor que baja en paralelo; gramática `displace`, parametrizada por la casilla de partida y el paso, produce los ítems de `recognize`, las dos animaciones de `explain` y el replay de `double_flip`. `ledger_debt_tokens` es el tablero, parametrizado por créditos y deudas, y produce `manipulate` y la cancelación de `apply`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsa `gear_walk_back_same_count` del nodo 4.

**Calculadora:** en `ready` se habilita `op_neg` ([M](../../M-calculadora/M0-progresion.md)), que no es una tecla entre dos fichas sino una que actúa sobre una ficha sola: la da vuelta. Ocupa un lugar suelto, separado del par de multiplicar y dividir, y esa separación dice que no es lo mismo que restar. Al tocarla, la ficha gira sobre su eje vertical y aparece con el trazo del otro lado. Apretada, muestra al caminante girando. Si el nodo decae, muestra óxido.

**Edad universal:** la primera capa se juega sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que gira la manivela y cruza el cero, los targets son del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Desde el nivel donde el panel muestra numerales, el mínimo real sube a `icons`, y eso es lo que declara el minijuego. Con el sonido apagado no falta nada: el chasquido de la cancelación tiene su equivalente en el hueco transparente. Un adulto llega por diagnóstico, saltea `real` e `intuition` y entra por el libro de cuentas.
