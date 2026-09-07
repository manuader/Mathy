# 08 — Una fracción es partes del todo (`arith.frac.parts_and_ratio`)

> Locale `es`: "Una fracción es partes del todo". Minijuego: [La pizza y la barra](../../F-minijuegos/arith.frac.parts_and_ratio.md).

**Nodo:** `arith.frac.parts_and_ratio` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `partition` · **Mecánica principal:** `tiles` (secundarias `ledger`, `urn_dice`) · **Literacy:** `none` · **Analogía:** `pizza_slices` (con `urn_of_balls` para el todo contable)

## 1. Concepto

Una fracción es un número que vive entre los números que el jugador ya conocía, y dice dos cosas a la vez: en cuántas partes iguales se cortó un todo y cuántas de esas partes se tomaron. Es también lo que quedó pendiente del nodo 6, la respuesta de una división que no daba exacta. Al terminar, el jugador corta una barra en partes iguales y sombrea las que le piden, reconoce la misma fracción en una pizza, en una barra, en una urna y en un reparto en platos, y sabe que dos partes de tamaños distintos no se pueden contar juntas.

## 2. Prerequisitos

- `arith.div.undo_mul` (nodo 6): partir en partes iguales y lo que sobra. Se usan el rectángulo que se corta en filas con el dedo, el chasquido que confirma que quedaron iguales, las baldosas sueltas que brillaban sin manera de escribirse, y el símbolo `÷`, que acá se convierte en la barra de fracción. El nodo 6 dejó abierto exactamente el hueco que este llena.

Es el único prerequisito del YAML. La arista se aparta del orden escolar: la escuela enseña fracciones como un capítulo aparte, con vocabulario propio, después de dominar la división entera. Acá la fracción no es un tema nuevo sino la continuación de una división que se quedó a mitad de camino, y por eso el nodo cuelga de la división. Los negativos del nodo 7 no son prerequisito: acá todo pasa entre el cero y el uno.

## 3. Dificultad cognitiva real

Lo difícil no es cortar la pizza. Son cinco capacidades:

1. **Entender que la fracción nombra una relación, no una cantidad.** Media pizza grande y media pizza chica son la misma fracción y distinta comida. Quien no fija el todo antes de contar no puede comparar nada.
2. **Exigir que las partes sean iguales.** Cortar una barra en cuatro pedazos no es cortarla en cuartos. Es la condición de la que depende todo lo demás y la que más se olvida, porque en la vida las porciones salen desparejas y nadie se queja.
3. **Leer dos números como uno solo.** El par `3` y `4` no son dos cantidades: son un punto. Quien los procesa por separado suma por separado, y ahí nace la misconception del nodo.
4. **Aceptar que el orden se invierte con el número de abajo.** Cuantas más partes, más chica cada parte. Es la segunda vez que crecer un número hace decrecer algo, después de los negativos, y la coincidencia no es casual: en los dos casos el número dice algo que no es un tamaño directo.
5. **Ver la fracción como una escala.** Estirar la banda por menos de lo que mide es multiplicar por una fracción. Es la cara que el nodo 5 dejó anunciada y no pudo jugar, porque el piso no dibuja lados que no sean enteros.

## 4. Problema intuitivo

Una mesa con una pizza redonda entera en una bandeja, cuatro personas alrededor y un cuchillo apoyado al lado.

En `real` el jugador solo mira: el cuchillo corta en cuatro porciones iguales, cada uno se lleva una y la bandeja queda vacía. En `intuition` la escena se detiene con el cuchillo levantado. Tres desenlaces dibujados: queda cortada en cuatro porciones iguales y todos reciben lo mismo; en cuatro pedazos desparejos, y uno se lleva el doble que otro; en tres porciones iguales y alguien se queda sin nada. El jugador elige y después ve. El segundo es el corazón del nodo y vuelve como distractor en todos los niveles.

La variante de barra es una barra de baldosas del nodo 6, entera, con una marca de objetivo sobre un punto que no cae en ninguna baldosa; el jugador predice si hay manera de llegar cortando. La variante de urna es un frasco con bolas de dos colores: nadie corta nada y sin embargo hay una parte del total.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara del concepto ([G0](../../G-analogias/G0-reglas.md)).

`pizza_slices` (mecánica `tiles`) es la del YAML. Mapa: disco entero → unidad; cortar en n porciones iguales → denominador; porciones tomadas → numerador; volver a cortar cada porción → fracción equivalente; dos discos cortados igual → denominador común; más porciones que un disco → fracción impropia. Invariante: la suma de todas las porciones vuelve a ser el disco entero, y ninguna cambia de tamaño al moverla. Ruptura: `dividing_by_a_fraction`, porque repartir media pizza entre un tercio de persona no es una situación.

`urn_of_balls` (mecánica `urn_dice`) aporta la parte de un total que no se corta: frasco → todo; bolas totales → número de abajo; bolas de un color → número de arriba. Invariante: la proporción se mantiene si se agregan bolas en la misma mezcla. Ruptura: el total tiene que ser contable, así que no puede dibujar fracciones de bola.

La pizza y la barra hacen visible el corte, que es el gesto que define el número de abajo; la urna hace visible que hay fracciones donde nadie cortó nada. Sin la urna, el jugador se queda creyendo que una fracción es un cuchillo. El `ledger` no trae analogía propia: trae el conteo de partes del mismo tamaño. G declara además `rubber_band_stretch` apuntando a este nodo con mecánica `grid_stretch`, que el nodo no incluye entre las suyas; la banda vuelve como fantasma heredado del nodo 6 solo donde hace falta la cara de escala. La discrepancia está anotada como tal.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `tiles` es la principal y aporta el corte y el invariante de que nada desaparece al partir; `ledger` aporta el conteo; `urn_dice` aporta el todo ya hecho de piezas. Gestos: `drag`, `tap`, `hold` y `pinch`.

1. Una barra entera en horizontal con una ficha objetivo encima que marca un punto que no cae en ningún borde. Al costado, la pizza en su bandeja y el frasco con bolas.
2. Demostración: una mano fantasma apoya el dedo sobre la barra y arrastra hacia abajo. Aparece una línea de corte, después otra; las líneas se acomodan solas hasta quedar equiespaciadas y la barra chasquea. La mano sombrea una parte con un toque y desaparece.
3. El jugador corta con `drag`. Las líneas ya puestas se corren para repartirse el espacio: la mecánica no deja cortar desparejo por accidente. Si mantiene el dedo, las líneas se sueltan y quedan donde él las puso.
4. Con partes desparejas la barra no chasquea y su borde queda punteado. Nada se llama incorrecto: cuando el jugador cuenta partes de una barra punteada, las fichas del libro salen de distinto tamaño y no se apilan.
5. Sombrear: un toque enciende una parte y el libro anota una ficha por cada una, todas iguales.
6. Comparar el todo: dos barras de distinto largo cortadas igual y con lo mismo sombreado. La ficha de fracción entra en las dos, aunque la comida no sea la misma. Ese momento enseña que la fracción es una relación.
7. Urna: el jugador saca bolas con `tap` y las apila por color. La ficha aparece sola cuando las columnas están completas, y el todo es el frasco, no la columna más alta.
8. Reparto en platos: al repartir tres barras entre cuatro platos, cada plato recibe tres pedazos de cuarto, y la ficha que sale es la misma que la de una barra cortada en cuatro con tres sombreadas. Las dos fichas se acercan y laten juntas.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md), con `scale` de apoyo en el nivel de la banda.

La barra se estiliza en un rectángulo largo sobre una línea tenue, con las líneas de corte llenas cuando las partes son iguales y punteadas cuando no. Lo que se conserva es el largo total: cortar no cambia el rectángulo, solo lo divide, y el contorno exterior se ilumina en el antes y el después. Lo que se parte son las partes; lo que se cuenta son las sombreadas.

La pizza se estiliza en un disco con radios, y el juego hace explícito, sacando una porción y volviéndola a poner, que el disco entero es el mismo. La urna se estiliza en un rectángulo con puntos adentro y dos columnas al costado. La recta del nodo 7 aparece debajo cuando la fracción se vuelve un punto: la barra se acuesta sobre el tramo entre el cero y el uno. Todavía no hay suma de fracciones, ni equivalentes escritas, ni impropias, ni negativas.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto.

1. **Línea de corte → barra de fracción.** La primera vez que el jugador corta en partes iguales y sombrea en `visual`, una de las líneas de corte se despega, gira un cuarto de vuelta hasta quedar horizontal y se acorta. Queda flotando al costado. El símbolo nuevo es el corte, girado.
2. **Partes contadas → los dos números.** Las fichas del libro se agrupan en dos montones, todas las partes y las sombreadas. El de todas se contrae en un numeral que cae debajo de la barra corta; el de las sombreadas, en uno que sube encima. Queda `3/4`.
3. **`÷` → la misma barra.** En el reparto en platos, la ficha `÷` del nodo 6 aparece sobre la escena: sus dos puntos se estiran hasta volverse los dos numerales y la barra del medio se queda quieta. Es `cs.arith.fraction_as_division` en un solo morph.
4. **Barra → punto en la recta.** Al arrastrar la ficha a la recta, el rectángulo se contrae sobre el tramo del cero al uno y la parte sombreada se estira hasta clavarse en una marca nueva. Es la única vez que el nodo afirma que una fracción es un número y no un dibujo.

## 9. Notación matemática

Queda `3/4` junto al contorno de la barra, con la parte sombreada iluminada, y la misma ficha clavada en la recta entre el cero y el uno.

El símbolo nuevo es la barra de fracción. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que lo hizo necesario, arrastrado del nodo 6: el jugador tiene que encargar al depósito una barra que llegue justo hasta la ficha objetivo, y esa ficha no cae en ninguna marca. Necesita decir dos cosas en un solo encargo, en cuántas partes cortar y cuántas tomar. La barra con un numeral arriba y otro abajo dice las dos, y el orden importa, porque la barra que se corta en cuatro y da tres no es la que se corta en tres y da cuatro.

No aparece ningún otro símbolo: no hay igual, ni operador entre fracciones, ni porcentaje. Queda dicho, sin escribirlo, que el número de abajo no puede ser cero: cortar en cero partes no es un corte, y el cofre sin llave del nodo 6 vuelve con la misma cara.

## 10. Definición formal

Capa `formal`, texto corto con voz y la barra al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, verificables sobre el objeto. Una fracción se escribe con dos números: el de abajo dice en cuántas partes iguales se cortó el todo y el de arriba cuántas se tomaron. Las partes tienen que ser iguales, o el número de abajo no dice nada. Una fracción es también el resultado de repartir el número de arriba entre el de abajo.

Condiciones: el de abajo no puede ser cero; con los dos iguales, la fracción es el todo entero; con cero arriba vale cero aunque el corte esté hecho; cuanto más grande el de abajo, más chica cada parte; el todo hay que fijarlo antes de nombrar la fracción, y por eso la misma ficha entra en dos barras de distinto largo. Ya jugado: las tres frases enteras. Nuevo: los nombres de los dos números y el caso del cero arriba.

## 11. Propiedades

- **Las partes tienen que ser iguales.** Ligada al borde punteado de la barra mal cortada y a las fichas que no se apilan. Es `cs.arith.fraction_as_parts_of_whole`.
- **Todas las partes juntas son el todo.** Ligada a encender todas las partes y ver que el contorno vuelve a ser el de la barra entera.
- **Una fracción es una división.** Ligada al reparto de tres barras entre cuatro platos, que da la misma ficha que la barra cortada en cuatro con tres encendidas. Es `cs.arith.fraction_as_division`.
- **Más partes, partes más chicas.** Ligada a cortar la misma barra en más pedazos. Es el orden invertido que reaparece.
- **La fracción no depende del tamaño del todo, pero el todo hay que fijarlo.** Ligada a la ficha que entra en dos barras de distinto largo. Es la semilla de `prob.basic.probability_as_proportion` y de `geom.sim.similarity_as_scale`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: varias pizzas cortadas de formas distintas y una ficha de fracción. Tocar la que muestra exactamente esa parte. Distractores: porciones desparejas, los dos numerales intercambiados, una porción de más.
- `explain`: dos animaciones sobre dos barras iguales. En una, las partes tomadas se juntan y el total se cuenta en partes del mismo tamaño; en la otra, se suman por separado los de arriba y los de abajo y la barra resultante no llega adonde tiene que llegar. Tocar la que suma cruzado. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: cortar la barra en partes iguales y sombrear las que pide la ficha. La barra confirma con el chasquido solo cuando las partes son iguales.
- `apply`: una urna con bolas de dos colores. Arrastrar la ficha de fracción que dice qué parte del total es de un color, contra el tiempo objetivo del nodo.
- `generalize`: la misma cantidad como pizza, como barra, como urna y como reparto en platos. Tocar las que representan la misma fracción, con distractores donde el todo cambió de tamaño y la fracción no.
- `transfer`: en el dial de giro de `geom.angle.turn_as_measure`, llevar la aguja a la fracción de vuelta completa que indica la ficha.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`fraction_add_across`**, patrón `missing_piece_tiles` sobre `tiles`, severidad 3. Es la de mayor severidad del nodo y aparece en su borde, cuando el jugador quiere juntar dos barras sombreadas y suma los de arriba entre sí y los de abajo entre sí. El juego ejecuta su respuesta: corta una barra nueva en las partes que él dijo, enciende las que dijo y la apoya encima de las dos originales pegadas. Sobra o falta, y el hueco queda dibujado con el contorno de las partes que no coinciden; después ilumina de a pares las partes de las dos barras y muestra que no miden lo mismo. Voz: "Juntaste partes de dos tamaños distintos. ¿Cuántas partes iguales entran en las dos barras?". El jugador vuelve a cortar desde el estado real. El nodo abre esta misconception y no la cierra: la resolución completa es `arith.frac.common_unit`.

Errores previstos sin entrada en el catálogo, que no clasifican ni bloquean `ready`:

- **Contar pedazos en vez de partes iguales.** Las fichas de distinto tamaño no se apilan y quedan torcidas al costado. Voz: "Esos pedazos no miden lo mismo. ¿Cuál contaste como una parte?".
- **Creer que el número de abajo más grande es la fracción más grande.** El juego corta las dos barras del mismo largo y las apoya una sobre otra, sin decir nada. Voz: "Cortaste la barra en más partes. ¿Cada parte quedó más grande o más chica?".

## 13. Generalización

La analogía se retira en `symbolic`. La pizza se va primero, porque su corte radial no soporta el nivel donde la fracción tiene que ser un punto de la recta. La barra se queda a demanda, porque sostiene la comparación y porque `arith.frac.equivalent` la necesita entera. La urna se retira sola: en cuanto la ficha aparece antes de terminar de sacar bolas, ya no hace falta sacarlas.

Variantes sin ayuda visual, en orden: números de abajo mayores que la grilla dibujada; los dos números iguales y el cero arriba; la misma fracción en dos todos de distinto tamaño; fracciones como punto de la recta sin barra debajo. Después, todos arbitrarios que no son ni comida ni bolas: una fila de figuras de las que algunas están giradas, un camino recorrido en parte, un vaso lleno hasta cierta altura.

El nodo está en `abstract` cuando el jugador reconoce la misma fracción en cuatro representaciones, ubica una fracción entre el cero y el uno sin barra, sabe que el número de abajo no puede ser cero y resuelve el todo arbitrario.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `prob.basic.probability_as_proportion` (`urn_dice`): la parte del total se vuelve la chance de sacar una bola de ese color. Como la urna ya estuvo, la prueba se hace prediciendo y no contando.
- `geom.angle.turn_as_measure` (`unit_circle_spin`): la vuelta completa es el todo y el giro es la parte. La pizza se convierte en un dial.
- `geom.sim.similarity_as_scale` (`construct`): la razón entre dos figuras semejantes es la fracción vista como escala.
- `precalc.lim.approach` (`slope_walker`): partir un tramo por la mitad, y otra vez. El corte repetido sin fin es la primera imagen de un límite, y acá se juega solo como gesto.

Concepto siguiente: `arith.expr.precedence_tree` ([09](09-arith.expr.precedence_tree.md)). Frase puente, narrada sobre la última fracción escrita: "La barra de la fracción junta todo lo de arriba en un paquete y todo lo de abajo en otro. ¿Y cómo hacés para decir qué va junto cuando no hay barra?". Los dos numerales se separan y quedan en una fila de fichas sin nada que los agrupe, aparece un cofre alrededor de dos de ellas, y el nodo 9 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `tile_bar_cut_into_equal_parts` es la mecánica renderizada sobre el estado del jugador: la barra que se corta mientras las líneas se acomodan, el chasquido cuando quedan equiespaciadas, las partes que se encienden y el contorno exterior iluminado en el antes y el después; gramática `partition`, parametrizada por partes y sombreadas, produce las dos animaciones de `explain`, incluida la de suma cruzada, y los distractores de `recognize`. `urn_fraction_of_balls` es el frasco, parametrizado por composición y color resaltado, y produce los ítems de `apply`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsa `tile_split_rectangle_into_rows` del nodo 6 para el reparto en platos.

**Calculadora:** en `ready` se habilita `op_frac` ([M](../../M-calculadora/M0-progresion.md)), que no es una tecla de operación sino de construcción: al tocarla, la ficha seleccionada se parte en dos huecos separados por una barra y el jugador llena arriba y abajo. Aparece pegada a `op_div`, y esa vecindad dice que son parientes. Apretada, dibuja la barra cortada con las partes encendidas. Con un cero abajo se traba con el cuarto de vuelta de la llave equivocada del nodo 6. Si el nodo decae, muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que corta la barra y enciende una parte, los targets son del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada: el chasquido del corte parejo tiene su equivalente en las líneas que se vuelven llenas. La analogía es `cultural_scope: adaptable` y tiene variantes de disco por región ([P](../../P-internacionalizacion.md)). Un adulto llega por diagnóstico, saltea `real` e `intuition` y entra por la urna.
