# 08 — Una fracción es partes del todo (`arith.frac.parts_and_ratio`)

> Locale `es`: "Una fracción es partes del todo". Minijuego: [La pizza y la barra](../../F-minijuegos/arith.frac.parts_and_ratio.md).

**Nodo:** `arith.frac.parts_and_ratio` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `partition` · **Mecánica principal:** `tiles` (secundarias `ledger`, `urn_dice`) · **Literacy:** `none` · **Analogía:** `pizza_slices` (con `urn_of_balls` para la parte de un total contable)

## 1. Concepto

Una fracción es un número que vive entre los números que el jugador ya conocía, y dice dos cosas a la vez: en cuántas partes iguales se cortó un todo, y cuántas de esas partes se tomaron. Es también lo que quedaba pendiente del nodo 6: la respuesta de una división que no daba exacta. Al terminar, el jugador corta una barra en partes iguales y sombrea las que le piden, reconoce la misma fracción en una pizza, en una barra, en una urna y en un reparto en platos, y sabe que dos partes de tamaños distintos no se pueden contar juntas. Antes el caminante se paraba en las casillas; ahora se para entre dos.

## 2. Prerequisitos

- `arith.div.undo_mul` (nodo 6): partir en partes iguales y lo que sobra. Se usan el rectángulo que se corta en filas con el dedo, el chasquido que confirma que las filas quedaron iguales, las baldosas sueltas que quedaban brillando al costado sin manera de escribirse, y el símbolo `÷`, que acá se convierte en la barra de fracción. El nodo 6 dejó abierto exactamente el hueco que este llena.

Es el único prerequisito del YAML. La arista se aparta del orden escolar en un punto que conviene decir: la escuela suele enseñar fracciones como un capítulo aparte, con su propio vocabulario, después de dominar la división entera. Acá la fracción no es un tema nuevo sino la continuación de una división que se quedó a mitad de camino, y por eso el nodo cuelga de la división y no de la multiplicación. Los negativos del nodo 7 no son prerequisito: acá todo pasa entre el cero y el uno, y las fracciones negativas llegan cuando las dos ideas ya están firmes.

## 3. Dificultad cognitiva real

Lo difícil no es cortar la pizza. Son cinco capacidades:

1. **Entender que la fracción nombra una relación, no una cantidad.** Media pizza grande y media pizza chica son la misma fracción y distinta comida. El número no dice cuánto hay: dice qué parte del todo hay. Quien no fija el todo antes de contar no puede comparar nada.
2. **Exigir que las partes sean iguales.** Cortar una barra en cuatro pedazos no es cortarla en cuartos. Esta es la condición que todo el resto necesita y la que más se olvida, porque en la vida las porciones salen desparejas y nadie se queja.
3. **Leer dos números como uno solo.** El par `3` y `4` no son dos cantidades: son un punto. El jugador que los procesa por separado suma por separado, y ahí nace la misconception del nodo.
4. **Aceptar que el orden se invierte con el de abajo.** Cuanto más partes, más chica es cada parte. Es la segunda vez en la espina que crecer un número hace decrecer algo, después de los negativos del nodo 7, y conviene decirlo en voz alta porque la coincidencia no es casual: en los dos casos el número dice algo que no es un tamaño directo.
5. **Ver la fracción como una escala.** Estirar la banda por menos de lo que mide es multiplicar por una fracción. Es la cara que el nodo 5 dejó anunciada y no pudo jugar, porque el piso de baldosas no dibuja lados que no sean enteros.

## 4. Problema intuitivo

Una mesa con una pizza redonda entera en una bandeja y cuatro personas alrededor esperando. Un cuchillo apoyado al lado.

En `real` el jugador solo mira: el cuchillo corta la pizza en cuatro porciones iguales, cada persona se lleva una y la bandeja queda vacía. En `intuition` la escena se detiene con el cuchillo levantado. Tres desenlaces dibujados: la pizza queda cortada en cuatro porciones iguales y todos reciben lo mismo; queda cortada en cuatro pedazos desparejos y uno se lleva el doble que otro; queda cortada en tres porciones iguales y alguien se queda sin nada. El jugador elige y después ve. El segundo desenlace es el corazón del nodo y es el distractor que vuelve en todos los niveles.

La variante de barra es una barra de baldosas del nodo 6, entera, con una marca de objetivo sobre un punto que no cae en ninguna baldosa. La escena se detiene y el jugador predice si hay manera de llegar ahí cortando.

La variante de urna es un frasco con bolas de dos colores mezcladas. Nadie corta nada, y sin embargo hay una parte del total.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara del concepto ([G0](../../G-analogias/G0-reglas.md)).

`pizza_slices` (mecánica `tiles`) es la del YAML. Mapa: disco entero → unidad; cortar en n porciones iguales → denominador; porciones tomadas → numerador; volver a cortar cada porción → fracción equivalente; dos discos cortados igual → denominador común; más porciones que un disco → fracción impropia. Invariante: la suma de todas las porciones vuelve a ser el disco entero, y ninguna porción cambia de tamaño al moverla de lugar. Ruptura: `dividing_by_a_fraction`. Repartir media pizza entre un tercio de persona no es una situación, y por eso la división por una fracción vive en `arith.frac.multiply`.

`urn_of_balls` (mecánica `urn_dice`) aporta la parte de un total que no se corta. Mapa: frasco → todo; bolas de un color → parte; bolas totales → denominador; bolas del color → numerador. Invariante: la proporción se mantiene si se agregan bolas en la misma mezcla. Ruptura: el total tiene que ser contable, así que la urna no puede dibujar fracciones de bola.

Por qué las dos. La pizza y la barra hacen visible el corte, que es el gesto que define el denominador; la urna hace visible que hay fracciones donde nadie cortó nada, y que el todo puede venir ya hecho de piezas. Sin la urna, el jugador se queda creyendo que una fracción es un cuchillo. Con las dos, el jugador reconoce la misma fracción en dos mundos que no se parecen, que es exactamente lo que pide la probe de `generalize`.

El libro de cuentas de `ledger` no trae analogía propia: trae el conteo. Las porciones tomadas se anotan como fichas del mismo tamaño, y ese "del mismo tamaño" es la condición que la mecánica hace cumplir sola.

[G](../../G-analogias/G0-reglas.md) declara además `rubber_band_stretch` apuntando a este nodo, con mecánica `grid_stretch`, que el nodo no incluye entre las suyas. La banda vuelve igual, como fantasma heredado del nodo 6, en el único nivel donde hace falta la cara de escala; no se juega con ella. La discrepancia está anotada como tal.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `tiles` es la principal y aporta el corte y el invariante de que nada desaparece al partir. `ledger` aporta el conteo de partes iguales. `urn_dice` aporta la parte de un total ya hecho de piezas. Gestos: `drag`, `tap`, `hold` y `pinch`.

1. Una barra entera apoyada en horizontal, con una ficha objetivo encima que marca un punto que no cae en ningún borde. Al costado, una pizza en su bandeja y un frasco con bolas.
2. Demostración: una mano fantasma apoya el dedo sobre la barra y arrastra hacia abajo. Aparece una línea de corte. La mano repite y aparece otra. Las líneas se acomodan solas hasta quedar equiespaciadas y la barra chasquea. La mano sombrea una parte con un toque y desaparece.
3. El jugador corta con `drag`. Mientras arrastra, las líneas ya puestas se corren para repartirse el espacio: la mecánica no deja cortar desparejo por accidente, deja cortar desparejo a propósito. Si el jugador mantiene el dedo, las líneas se sueltan y quedan donde él las puso.
4. Con las partes desparejas, la barra no chasquea y su borde queda punteado. Nada se llama incorrecto. Cuando el jugador intenta contar partes de una barra punteada, las fichas del libro de cuentas salen de distinto tamaño y no se apilan.
5. Sombrear. Un toque enciende una parte. El libro de cuentas anota una ficha por cada parte encendida, todas iguales.
6. Comparar el todo. Dos barras de distinto largo cortadas en la misma cantidad de partes, con la misma cantidad sombreada. El jugador arrastra la ficha de fracción a las dos y la ficha entra en las dos, aunque la comida no sea la misma. Ese momento es el que enseña que la fracción es una relación.
7. Urna. El jugador saca bolas con `tap` y las apila por color en dos columnas. La ficha de fracción aparece sola cuando las columnas están completas, y el todo es el frasco, no la columna más alta.
8. Reparto en platos. La barra cortada se arrastra a tres platos. Cuando el jugador reparte tres barras entre cuatro platos, cada plato recibe tres pedazos de cuarto, y la ficha que sale es la misma que la de la barra cortada en cuatro con tres sombreadas. Nadie lo dice; las dos fichas se acercan y laten juntas.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md), con `scale` de apoyo en el nivel de la banda.

La barra se estiliza en un rectángulo largo sobre una línea tenue, con las líneas de corte llenas cuando las partes son iguales y punteadas cuando no. Lo que se conserva es el largo total: la animación de cortar no cambia el rectángulo, solo lo divide, y el contorno exterior se ilumina en el antes y el después. Lo que se parte son las partes; lo que se cuenta son las sombreadas.

La pizza se estiliza en un disco con radios, y el juego hace explícito, moviendo una porción fuera y volviéndola a poner, que el disco entero es el mismo. La urna se estiliza en un rectángulo con puntos adentro y dos columnas de puntos al costado.

La recta del nodo 7 aparece debajo de la barra en el nivel donde la fracción se vuelve un punto: la barra se acuesta sobre el tramo entre el cero y el uno, y la parte sombreada termina en una marca nueva entre las dos que ya había.

Todavía no hay suma de fracciones, ni fracciones equivalentes escritas, ni fracciones mayores que uno, ni negativas.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Línea de corte → barra de fracción.** La primera vez que el jugador corta una barra en partes iguales y sombrea en `visual`, una de las líneas de corte se despega, gira un cuarto de vuelta hasta quedar horizontal y se acorta. Queda flotando al costado como una barra corta. El símbolo nuevo es literalmente el corte, girado.
2. **Partes contadas → los dos números.** Las fichas del libro de cuentas se agrupan en dos montones: todas las partes, y las sombreadas. El montón de todas se contrae en un numeral que cae debajo de la barra corta; el de las sombreadas, en un numeral que sube encima. Queda `3/4` con los dos numerales que el jugador ya conoce del nodo 1.
3. **`÷` → la misma barra.** En el nivel del reparto en platos, la ficha `÷` del nodo 6 aparece sobre la escena. Sus dos puntos se estiran hasta volverse los dos numerales y la barra del medio se queda quieta. El jugador ve que `3 ÷ 4` y `3/4` son el mismo trazo con los huecos llenos, que es exactamente lo que dice `cs.arith.fraction_as_division`.
4. **Barra → punto en la recta.** Al arrastrar la ficha de fracción a la recta, el rectángulo entero se contrae sobre el tramo del cero al uno y la parte sombreada se estira hasta que su extremo se clava en una marca nueva. La ficha se queda ahí. Es la única vez que el nodo afirma que una fracción es un número y no un dibujo, y lo hace con un morph.

## 9. Notación matemática

Queda `3/4` junto al contorno de la barra, con la parte sombreada iluminada, y la misma ficha clavada en la recta entre el cero y el uno.

El símbolo nuevo es la barra de fracción. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que lo hizo necesario, y el problema viene arrastrado del nodo 6: el jugador tiene que encargar al depósito, que sigue fuera de la pantalla, una barra que llegue justo hasta la ficha objetivo, y esa ficha no cae en ninguna marca. Con los numerales que tiene no puede pedirla. Necesita decir dos cosas en un solo encargo: en cuántas partes cortar y cuántas tomar. La barra con un numeral arriba y otro abajo dice las dos, y el orden importa, porque la barra que se corta en cuatro y da tres no es la que se corta en tres y da cuatro.

No aparece ningún otro símbolo. No hay igual, no hay operador entre fracciones y no hay signo de porcentaje. Sí queda dicho, sin escribirlo, que el número de abajo no puede ser cero: cortar en cero partes no es un corte, y el cofre sin llave del nodo 6 vuelve acá con la misma cara.

## 10. Definición formal

Capa `formal`, texto corto con voz y la barra al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre el objeto en pantalla. Una fracción se escribe con dos números: el de abajo dice en cuántas partes iguales se cortó el todo, y el de arriba, cuántas de esas partes se tomaron. Las partes tienen que ser iguales, o el número de abajo no dice nada. Una fracción es también el resultado de repartir el número de arriba entre el número de abajo.

Condiciones y casos especiales, verificados sobre el objeto: el número de abajo no puede ser cero; cuando los dos números son iguales, la fracción es el todo entero; cuando el de arriba es cero, no se tomó ninguna parte y la fracción vale cero, aunque el corte esté hecho; cuanto más grande el número de abajo, más chica es cada parte. El todo tiene que estar fijado antes de nombrar la fracción, y por eso la misma ficha entra en dos barras de distinto largo.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: las palabras que nombran los dos números, y el caso del cero arriba, que en la barra es un corte hecho y nada encendido.

## 11. Propiedades

- **Las partes tienen que ser iguales.** Ligada al borde punteado de la barra mal cortada y a las fichas que no se apilan. Es `cs.arith.fraction_as_parts_of_whole` y es la condición de la que dependen las otras.
- **Todas las partes juntas son el todo.** Ligada al gesto de encender todas las partes de la barra y ver que el contorno vuelve a ser el de la barra entera.
- **Una fracción es una división.** Ligada al reparto de tres barras entre cuatro platos, que da la misma ficha que una barra cortada en cuatro con tres encendidas. Es `cs.arith.fraction_as_division`.
- **Más partes, partes más chicas.** Ligada a cortar la misma barra en más pedazos y ver que cada uno mide menos. Es el orden invertido que reaparece, después del de los negativos.
- **La fracción no depende del tamaño del todo, pero el todo hay que fijarlo.** Ligada a la ficha que entra en dos barras de distinto largo. Es la semilla de `prob.basic.probability_as_proportion` y de `geom.sim.similarity_as_scale`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: varias pizzas cortadas de formas distintas y una ficha de fracción. Tocar la que muestra exactamente esa parte. Los distractores se generan con porciones desparejas, con el numeral de arriba y el de abajo intercambiados y con una porción de más.
- `explain`: dos animaciones sobre dos barras iguales. En una, las partes tomadas se juntan y el total se cuenta en partes del mismo tamaño; en la otra, se suman por separado los números de arriba y los de abajo y la barra resultante no llega adonde tiene que llegar. Tocar la que suma cruzado. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: cortar la barra en partes iguales y sombrear las que pide la ficha. La barra confirma con el chasquido solo cuando las partes son iguales.
- `apply`: una urna con bolas de dos colores. Arrastrar la ficha de fracción que dice qué parte del total es de un color, contra el tiempo objetivo del nodo.
- `generalize`: la misma cantidad aparece como pizza, como barra, como urna y como reparto en platos. Tocar las que representan la misma fracción, con distractores donde el todo cambió de tamaño y la fracción no.
- `transfer`: en el dial de giro de `geom.angle.turn_as_measure`, llevar la aguja a la fracción de vuelta completa que indica la ficha.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`fraction_add_across`**, patrón `missing_piece_tiles` sobre `tiles`, severidad 3. Es la de mayor severidad del nodo y aparece en su borde, cuando el jugador tiene dos barras sombreadas delante y quiere juntarlas. Suma los de arriba entre sí y los de abajo entre sí. El juego ejecuta su respuesta: corta una barra nueva en la cantidad de partes que él dijo, enciende las que dijo, y la apoya encima de las dos barras originales pegadas. Sobra o falta, y el hueco queda dibujado con el contorno de las partes que no coinciden. Después ilumina de a pares las partes de las dos barras originales y muestra que no miden lo mismo. Voz: "Juntaste partes de dos tamaños distintos. ¿Cuántas partes iguales entran en las dos barras?". El jugador vuelve a cortar desde el estado real. El nodo abre esta misconception y no la cierra: la resolución completa es `arith.frac.common_unit`.

Errores que el diseño prevé y que no tienen entrada en el catálogo, y por eso no clasifican ni bloquean `ready`:

- **Contar pedazos en vez de partes iguales.** El jugador corta desparejo y cuenta igual. El juego apila las fichas del libro de cuentas y las de distinto tamaño no se apilan: quedan al costado, torcidas. Voz: "Esos pedazos no miden lo mismo. ¿Cuál contaste como una parte?".
- **Creer que el número de abajo más grande es la fracción más grande.** El jugador ordena `1/8` delante de `1/3`. El juego corta las dos barras del mismo largo y las apoya una sobre otra, sin decir nada. Voz: "Cortaste la barra en más partes. ¿Cada parte quedó más grande o más chica?".
- **Olvidar el todo.** El jugador compara la parte sombreada de una barra corta con la de una barra larga y elige la que tiene más superficie. El juego estira las dos barras hasta el mismo largo, con las partes acompañando, y la comparación se da vuelta sola. Voz: "Las dos barras no medían lo mismo. ¿Qué parte de cada una está encendida?".

## 13. Generalización

La analogía se retira en `symbolic`, como declara la entrada de G. La pizza se va primero, porque su corte radial no soporta el nivel donde la fracción tiene que ser un punto de la recta. La barra se queda más tiempo, a demanda, porque es la que sostiene la comparación y la que el nodo `arith.frac.equivalent` va a necesitar entera. La urna se retira sola: en cuanto la ficha aparece antes de terminar de sacar bolas, ya no hace falta sacarlas.

Variantes sin ayuda visual, en orden: fracciones con el número de abajo mayor que la grilla dibujada; el caso de los dos números iguales y el caso del cero arriba; la misma fracción pedida en dos todos de distinto tamaño; y fracciones que representan un punto de la recta sin barra debajo.

Todos arbitrarios. El nodo termina con conjuntos que no son ni comida ni bolas: una fila de figuras de las que algunas están giradas, un camino recorrido en parte, un vaso lleno hasta cierta altura. El jugador arrastra la ficha de fracción que corresponde. Se evalúa que la estructura, un todo fijado y partes iguales de las que se toman algunas, se reconoce sin cortar y sin contar objetos.

El nodo está en `abstract` cuando el jugador reconoce la misma fracción en cuatro representaciones distintas, ubica una fracción entre el cero y el uno sin barra, sabe que el número de abajo no puede ser cero y resuelve el todo arbitrario sin dibujo de corte.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `prob.basic.probability_as_proportion` (`urn_dice`): la parte del total se vuelve la chance de sacar una bola de ese color. Es la transferencia más corta de la espina, porque la urna ya estuvo, y por eso mismo la prueba se hace con la urna prediciendo, no contando.
- `geom.angle.turn_as_measure` (`unit_circle_spin`): la vuelta completa es el todo y el giro es la parte. La pizza se convierte en un dial y las porciones en ángulos.
- `geom.sim.similarity_as_scale` (`construct`): la razón entre dos figuras semejantes es la fracción vista como escala, la cara que la banda dejó apenas insinuada.
- `precalc.lim.approach` (`slope_walker`): partir un tramo por la mitad, y otra vez, y otra vez. El corte de la barra repetido sin fin es la primera imagen de un límite, y acá se juega solo como gesto.

Concepto siguiente: `arith.expr.precedence_tree` ([09](09-arith.expr.precedence_tree.md)). Frase puente, narrada sobre la última fracción escrita: "La barra de la fracción junta todo lo de arriba en un paquete y todo lo de abajo en otro. ¿Y cómo hacés para decir qué va junto cuando no hay barra?". Los dos numerales se separan y quedan en una fila de fichas sin nada que los agrupe, aparece un cofre alrededor de dos de ellas, y el nodo 9 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `tile_bar_cut_into_equal_parts` es la mecánica renderizada sobre el estado del jugador: la barra que se corta mientras las líneas se acomodan, el chasquido cuando quedan equiespaciadas, las partes que se encienden con un toque y el contorno exterior iluminado en el antes y el después; parametrizada por la cantidad de partes y de sombreadas, produce las dos animaciones de `explain`, incluida la de suma cruzada, y los distractores de `recognize`. `urn_fraction_of_balls` es el frasco: bolas que salen y se apilan en dos columnas, con la llave del total abarcando las dos y la ficha de fracción que aparece al completarse; parametrizada por la composición de la urna y por el color resaltado, produce los ítems de `apply`. Ninguna lleva texto rasterizado: los numerales y la barra de fracción los dibuja el runtime según el locale, y la pizza, el cuchillo, la barra y las bolas son assets propios ([P](../../P-internacionalizacion.md)). Se reúsa `tile_split_rectangle_into_rows` del nodo 6 para el reparto en platos.

**Calculadora:** en `ready` se habilita `op_frac` ([M](../../M-calculadora/M0-progresion.md)), que no ocupa una tecla de operación sino una tecla de construcción: al tocarla, la ficha seleccionada se parte en dos huecos separados por una barra y el jugador llena arriba y abajo. Aparece al final de la segunda fila del primer tramo, pegada a `op_div`, y esa vecindad es la que dice que son parientes. Manteniéndola apretada, la calculadora dibuja la barra cortada con las partes encendidas. Con un cero abajo, la tecla se traba con el mismo cuarto de vuelta de la llave equivocada del nodo 6. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que corta la barra y enciende una parte, los targets son partes de barra, porciones y bolas del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada, porque el chasquido del corte parejo tiene su equivalente en las líneas que se vuelven llenas y en el borde que deja de estar punteado. La analogía es `cultural_scope: adaptable` y tiene variantes de disco según la región ([P](../../P-internacionalizacion.md)). Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra en el nivel de la urna, que es el que menos se parece a la escuela, y usa el teclado de fichas para armar la fracción en vez de cortar.
