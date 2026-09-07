# 08 — Una fracción es partes del todo (`arith.frac.parts_and_ratio`)

> Locale `es`: "Una fracción es partes del todo". Minijuego: [Un corte, dos lecturas](../../F-minijuegos/arith.frac.parts_and_ratio.md).

**Nodo:** `arith.frac.parts_and_ratio` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `partition` · **Mecánica principal:** `tiles` (secundarias `ledger` y `urn_dice`) · **Literacy:** `none` · **Analogía:** `pizza_slices` (con `chocolate_bar_grid` para la barra en grilla)

## 1. Concepto

Una fracción es un número que nombra un pedazo: se parte un todo en partes iguales y se toman algunas. Al terminar, el jugador corta en partes iguales y sombrea las que le piden, reconoce la misma fracción en objetos que no se parecen, y —lo que de verdad importa— descubre que "tres cuartos de una pizza" y "lo que le toca a cada uno cuando tres pizzas se reparten entre cuatro" son el mismo número, porque lo produce moviendo las mismas porciones. Antes sabía repartir cuando el reparto cerraba; no sabía nombrar lo que quedaba cuando no cerraba.

## 2. Prerequisitos

- `arith.div.undo_mul` (nodo 6): dividir. Se usan el piso partido en filas iguales, la exigencia de que las filas sean iguales y —sobre todo— los dos casos que aquel nodo dejó planteados sin resolver: las baldosas que sobran cuando el reparto no cierra y la banda que vuelve pero no cae sobre una marca. Este nodo es la respuesta a los dos.

Es el único prerequisito, y la arista no sigue el orden escolar por dos razones. Primero, en la escuela la fracción suele presentarse como un objeto nuevo, con su propia notación y sus propias reglas, y solo mucho después se dice que también es una división. Acá nace directamente del cociente que no cerró, así que las dos lecturas están juntas desde el principio y no hay que reconciliarlas más tarde. Segundo, no hay arista desde los negativos: una fracción no necesita signo, y este nodo se juega entero con cantidades positivas. Un jugador que llegó por la rama del 7 puede jugar el 8 sin haber estirado una banda solo si el 6 está en `ready`, que es lo que la arista garantiza.

## 3. Dificultad cognitiva real

Lo difícil no es cortar sino cuatro cosas, y la tercera es la que define el nodo.

1. **El todo hay que declararlo.** Una fracción sin un todo nombrado no dice nada: la mitad de una pizza grande y la mitad de una chica no son la misma cantidad de comida, aunque sean la misma fracción. El jugador tiene que aprender que el número de abajo cuenta partes de algo, y que ese algo se elige y se anuncia.
2. **Las partes tienen que ser iguales.** Cortar en cuatro pedazos y tomar uno no es un cuarto si los pedazos son distintos. La igualdad de las partes es el invariante del nodo y lo único que la mecánica no deja pasar.
3. **Las dos lecturas son el mismo número, y reconocerlo es la dificultad real.** "Tres de las cuatro partes de una pizza" es una partición: hay un todo y se toma un pedazo. "Tres pizzas repartidas entre cuatro personas" es una razón: hay dos cantidades y se comparan. Son preguntas distintas, con dibujos distintos, y dan el mismo número. El nombre del nodo elige la primera —"partes del todo"— porque es la puerta reconocible sin leer, y la segunda entra por la urna del probe `apply` y por la cheatsheet `cs.arith.fraction_as_division`. Un jugador que solo tiene la lectura de partes no entiende una escala de mapa, una probabilidad ni una razón de semejanza; uno que solo tiene la de razón no sabe qué es la mitad de una pizza. Este nodo no puede enunciar que son lo mismo: tiene que producir una a partir de la otra moviendo objetos.
4. **Una fracción es un número, no dos.** Dos dígitos apilados invitan a operarlos por separado. Sumar arriba con arriba y abajo con abajo es exactamente eso, y es la misconception `fraction_add_across`, la de mayor severidad del nodo.

## 4. Problema intuitivo

Una mesa larga después de un partido. Hay tres pizzas iguales y cuatro chicos, y nadie quiere que a alguien le toque menos. Al costado, sobre otra mesa, una sola pizza ya cortada en pedazos que no son iguales: uno enorme y tres finitos.

En `real` la pregunta es de mirada y se contesta con un toque: ¿en cuál de las dos mesas el reparto es justo? En `intuition` la escena se congela con el cuchillo sobre la primera pizza y tres desenlaces dibujados: se corta cada pizza en cuatro y cada chico junta un pedazo de cada una; se le da una pizza entera a los tres primeros y el cuarto espera; se corta la primera pizza en tres y sobra un chico. El jugador elige y después ve. El primer desenlace es la respuesta y también es, sin que se anuncie, la demostración de que tres repartidas entre cuatro es tres cuartos.

## 5. Analogía del mundo real

`pizza_slices` (mecánica `tiles`) es la del YAML. Mapa: disco entero → unidad; cortar en n porciones iguales → denominador; porciones tomadas → numerador; volver a cortar cada porción → fracción equivalente; dos discos cortados igual → denominador común; más porciones que un disco → fracción impropia. Invariante: las porciones de un mismo corte son intercambiables, así que solo importa cuántas se toman. Ruptura declarada: `dividing_by_a_fraction`. Dividir una pizza por media pizza no es una acción de la mesa; el disco llega hasta multiplicar por una fracción y no más allá, y por eso `arith.frac.multiply` usa otra piel.

`chocolate_bar_grid` (mecánica `tiles`) aporta la barra en grilla. Mapa: barra → todo; cuadraditos → partes iguales; filas por columnas → los denominadores se multiplican; parte sombreada de una parte sombreada → producto de fracciones; barra de cien → porcentaje; una fila de diez → diez por ciento. Ruptura: `percent_of_percent_and_over_hundred`. La barra es la que sostiene la capa `visual` del nodo, porque el disco no se deja alinear con otro disco y la barra sí.

Por qué estas dos y no una. El disco es la puerta: un chico de cinco años sabe qué es un pedazo de pizza y sabe cuándo el reparto es injusto, sin una palabra. La barra es la herramienta: se corta con líneas rectas, se pone al lado de otra barra para comparar, y se vuelve a cortar sin deformarse. Las dos son la misma partición y el morph entre ellas —el disco que se desenrolla en barra— es uno de los pasos de desvanecimiento. Ninguna de las dos sirve para la lectura de razón; esa la aporta la urna, y ahí hay un hueco en el catálogo (ver el reporte).

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `tiles` es la principal y provee la herramienta —cortar, sombrear, reagrupar sin perder ni una porción—; `ledger` provee la lectura de razón, contar de cada clase y comparar filas; `urn_dice` provee la parte del todo cuando el todo no es una figura sino una colección ([E0](../../E-mecanicas/E0-catalogo.md)). Se encuentran en un gesto: reagrupar. Gestos: `drag`, `tap` y `pinch` en `tiles`, `tap` y `hold` en la urna.

1. Tres discos iguales sobre la mesa y cuatro platos vacíos abajo. Un cuchillo que se arrastra sobre un disco lo corta.
2. Demostración: una mano fantasma arrastra el cuchillo sobre el primer disco y lo parte en cuatro porciones iguales; repite en los otros dos, y después lleva una porción de cada disco a cada plato. Los cuatro platos quedan con lo mismo y no sobra nada.
3. El jugador corta. Mientras arrastra el cuchillo, una guía muestra en cuántas partes va a quedar y las porciones se previsualizan; al soltar, el corte se aplica de golpe a todo el disco.
4. Cortes desiguales: si el jugador corta a ojo y las partes no son iguales, el disco no se separa. Las líneas quedan dibujadas y las porciones laten con tamaños distintos hasta que las empareja arrastrando una línea; recién ahí se despegan. La igualdad no se pide con palabras: es la condición para que el objeto se deje tomar.
5. Repartir: arrastrar porciones a los platos. Si un plato queda con más que otro, ese plato se hunde un poco y el reparto no se cierra. El estado se conserva.
6. Reagrupar, que es el gesto central del nodo: tomar todas las porciones de un plato y juntarlas sobre un disco vacío. Las tres porciones de cuarto se acomodan solas sobre un disco de referencia y ocupan tres de sus cuatro lugares. La misma cantidad que era "lo que le tocó a uno de cuatro" ahora se ve como "tres de las cuatro partes de uno". Nadie lo dice: el jugador lo hizo.
7. Con la urna: bolas de dos colores dentro de una bolsa; sacarlas de a una con `tap` o de a muchas con `hold`. Las de cada color se apilan en su columna y una barra al costado muestra qué parte del total ocupa cada montón. El todo acá no es una figura: es la bolsa entera.
8. Verificación: tocar la barra de un color devuelve las bolas a la bolsa y las vuelve a sacar; la parte se mantiene.

## 7. Representación visual

Capa `visual`, con `partition` dominante y `scale` de apoyo ([H](../../H-progresion-abstraccion.md)).

`partition`. El disco se desenrolla en una barra rectangular con las mismas divisiones, y desde ahí todo el nodo trabaja con barras. Una barra partida en b tramos iguales con a sombreados es la imagen canónica; dos barras del mismo largo, una encima de otra, con cortes distintos, es la imagen de comparación. Lo que se conserva es el largo total: cortar más fino no agranda la barra, y esa es la afirmación que después sostiene la equivalencia. Se parte, se sombrea y se reagrupa; nada se escala todavía.

`scale` (apoyo). La barra de la lectura de razón tiene otro origen: es el resultado de comparar dos cantidades y no de cortar una. Se dibuja con la barra del numerador apoyada sobre la del denominador y una llave que mide cuántas veces entra una en la otra. Cuando el jugador reagrupa, las dos barras se superponen y coinciden; ese momento de coincidencia es lo único que el nodo tiene para mostrar que las dos lecturas dan el mismo número.

Todavía no hay operaciones con fracciones, ni denominador común, ni equivalencias enunciadas: eso es `arith.frac.equivalent` y `arith.frac.common_unit`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Disco → barra.** Al arrastrar un disco cortado hacia la regla, el disco se desenrolla en una barra con las mismas divisiones. La cantidad de porciones no cambia mientras rueda.
2. **Porciones → dos números apilados.** Al sombrear, la barra escribe debajo cuántas partes tiene en total, y encima cuántas están sombreadas. Los dos números nacen de dos conteos distintos que el jugador acaba de hacer.
3. **Línea de corte → barra de fracción.** La línea del último corte se despega de la barra, se acuesta entre los dos números y queda como el trazo horizontal de la fracción. El símbolo no aparece: es una de las líneas de corte, movida.
4. **Reparto → la misma fracción.** Al reagrupar las porciones de un plato sobre un disco de referencia, la fracción escrita bajo el reparto y la escrita bajo la barra se acercan y se funden en una sola con un morph. Dos escrituras que eran distintas resultan ser el mismo objeto, y el jugador ve cuál se transformó en cuál.
5. **Urna → parte del total.** Las columnas de bolas se contraen en dos números, cuántas de un color y cuántas en total, con la misma barra horizontal entre ellos. La bolsa queda como marca de agua detrás.

## 9. Notación matemática

Queda la fracción escrita con dos números y un trazo entre ellos, con la barra partida como marca de agua, y la misma fracción producida por dos caminos.

El símbolo nuevo es la fracción, y el problema que la hizo necesaria es el que el nodo 6 dejó abierto: nombrar un pedazo de un reparto que no es exacto. Mientras los repartos cerraban, el cociente era un número que el jugador ya tenía; en cuanto sobran baldosas o la banda cae entre dos marcas, no hay ningún número disponible para decir cuánto es eso, y hay que inventar uno. Que el trazo de la fracción sea literalmente una línea de corte no es un adorno: es la razón por la que el mismo símbolo sirve para las dos lecturas. Arriba, cuántas partes se toman; abajo, en cuántas se cortó; y entre las dos, el corte.

El signo de igual aparece cuando el reparto se transcribe —`3 ÷ 4 = 3/4`— y, como en los nodos 3 a 7, el nodo no lo introduce. Hay una decisión deliberada sobre dónde no usarlo: el momento en que las dos lecturas resultan ser el mismo número se muestra fundiendo las dos escrituras con un morph, no escribiendo una igualdad entre ellas. Un igual ahí invitaría a leerlo como "esto da esto otro", que es justo lo contrario de lo que el gesto de reagrupar acaba de mostrar.

## 10. Definición formal

Capa `formal`: texto corto con voz y la barra al lado. Tres frases, de a una: "Partir un todo en partes iguales y tomar algunas es tomar una fracción de ese todo." "El número de abajo dice en cuántas partes se cortó; el de arriba, cuántas se tomaron." "Repartir a cosas entre b personas le da a cada una la misma fracción: a partido b."

Condiciones y casos especiales, verificados sobre el objeto: las partes tienen que ser iguales, y el nodo lo muestra con la pizza de la segunda mesa, que tiene cuatro pedazos y ninguno es un cuarto; tomar todas las partes es tomar el todo; tomar cero partes es no tomar nada; y se pueden tomar más partes que las que tiene un todo si hay otro todo igual al lado, que es la fracción impropia y aparece sin nombrarse. Cortar en cero partes no es un corte: es la banda colapsada del nodo 6 con otra piel (`cs.arith.fraction_as_parts_of_whole`, `cs.arith.fraction_as_division`).

Ya jugado: las tres frases enteras, en `concrete`. Nuevo: las palabras "numerador" y "denominador", y la afirmación de que la tercera frase y la primera describen el mismo número, que hasta acá el jugador vio ocurrir pero nadie enunció.

## 11. Propiedades

- **Solo las partes iguales cuentan.** Ligada al disco que no se deja separar hasta que las porciones se emparejan.
- **La fracción no depende de cuáles porciones se toman, solo de cuántas.** Ligada a intercambiar porciones entre platos sin que cambie nada.
- **Tomar todas las partes es el todo; tomar ninguna es nada.** Ligada a llenar y vaciar un disco de referencia.
- **Repartir a entre b da la misma fracción que tomar a partes de b.** Ligada al gesto de reagrupar, y es la propiedad que el nodo existe para construir (`cs.arith.fraction_as_division`).
- **La misma fracción vive en objetos distintos.** Ligada a ver el mismo número en la pizza, en la barra, en la urna y en el reparto en platos.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias pizzas cortadas de formas distintas; tocar la que muestra exactamente la parte que indica la ficha. Los distractores se generan con el mismo numerador y otro denominador, con partes desiguales que suman lo mismo, y con los dos números intercambiados.
- `explain`: dos animaciones. En una, dos porciones de pizzas cortadas igual se juntan y el total se cuenta en porciones de ese tamaño; en la otra se suman los números de arriba entre sí y los de abajo entre sí, y la barra resultante es más corta que una de las dos que se sumaron. Tocar la que suma cruzado.
- `manipulate`: cortar la barra en partes iguales y sombrear las que pide la ficha; la barra confirma soltando las partes solo cuando son iguales.
- `apply`: una urna con bolas de dos colores; arrastrar la ficha de fracción que dice qué parte del total es de un color, contra el tiempo objetivo del nodo. Es la lectura de razón evaluada con la mecánica que la sostiene.
- `generalize`: la misma cantidad aparece como pizza, como barra, como urna y como reparto en platos; tocar todas las que representan la misma fracción. Las distractoras comparten un número con la correcta pero no el otro.
- `transfer`: en el dial de giro de `geom.angle.turn_as_measure`, llevar la aguja a la fracción de vuelta completa que indica la ficha.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`fraction_add_across`** (`missing_piece_tiles` sobre las baldosas). El jugador suma numeradores entre sí y denominadores entre sí. El juego coloca las baldosas que corresponden a su respuesta, superpone la forma verdadera y hace brillar la pieza que falta: la barra del jugador queda visiblemente más corta que una de las dos partes que quiso sumar, que es el absurdo más rápido de ver. Las baldosas que faltan quedan en la bandeja y el control vuelve al jugador para que las arrastre; al completar el hueco, la fracción escrita al costado cambia con un morph. Voz: "Juntaste dos pedazos y te quedó menos que uno solo. ¿Cuánto mide cada parte?". Es la misconception de mayor severidad del nodo, y bloquea la salida de `symbolic` mientras esté activa.

El error de cortar a ojo en partes desiguales no tiene entrada en el catálogo de L y no clasifica: se resuelve dentro del objeto, porque el disco no se separa hasta que las porciones se emparejan.

## 13. Generalización

La analogía se retira en dos tiempos. La pizza se va primero, en `symbolic`, en cuanto aparecen fracciones que no caben en un disco y comparaciones entre dos cortes distintos: el disco no se deja alinear con otro disco. La barra en grilla se queda hasta `formal` como fantasma a demanda, porque representa estructura —una partición— y no un nombre. La urna se queda más tiempo que las dos, porque su forma visual sigue siendo correcta cuando el todo es una colección y no una figura, y es la que después recibe la probabilidad.

Variantes sin ayuda visual, en orden: fracciones con denominadores que no son dos ni cuatro; la misma fracción pedida sobre todos de distinto tamaño, para forzar la declaración del todo; repartos de a cosas entre b personas con a mayor y con a menor que b; fracciones impropias sin nombrarlas; y la pregunta inversa, dada una parte sombreada decir qué fracción es.

Todos arbitrarios. El nodo termina con particiones de objetos que no son comida ni barras: una hora partida en cuartos, un grupo de personas del que una parte lleva sombrero, un camino del que se recorrió un tramo, una vuelta completa de la que se giró un pedazo. El jugador señala cuál es el todo en cada caso antes de decir la fracción, y en uno de los casos el todo no está dibujado y hay que elegirlo. Se evalúa que la estructura —un todo declarado, partes iguales, algunas tomadas— se reconozca en cualquier objeto, y que las dos lecturas se apliquen a la misma situación sin que el juego indique cuál corresponde.

El nodo está en `abstract` cuando el jugador nombra el todo antes de operar, produce una lectura a partir de la otra sin dibujar, y ordena fracciones de denominadores distintos sin construir las barras.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `prob.basic.probability_as_proportion` (`sorter`, y la urna ya con otra piel): la probabilidad es la parte del blanco que corresponde a un resultado. El nodo hereda la lectura de razón entera: cuántas de las bolas, sobre cuántas hay.
- `geom.angle.turn_as_measure` (`gears_sequence`, `construct`): un ángulo es la fracción de vuelta que se giró. El todo es la vuelta completa y no se ve como objeto: hay que declararlo, que es exactamente lo que la sección 13 entrena.
- `geom.sim.similarity_as_scale` (`grid_stretch`, `construct`): la razón entre dos lados correspondientes es una fracción, y acá las dos cantidades comparadas están las dos dibujadas y ninguna es "el todo". Es la lectura de razón sin la de partes.
- `precalc.lim.approach` (`slope_walker`, `gears_sequence`): las mitades sucesivas del camino a la pared son fracciones cada vez más chicas de un mismo todo. La partición se vuelve infinita y el disco no la aguanta.

Concepto siguiente: `arith.expr.precedence_tree` ([09](09-arith.expr.precedence_tree.md)). Frase puente, narrada sobre la última barra partida: "Cortaste y después tomaste. ¿Qué pasa si lo hacés al revés?". Dos cadenas de acciones sobre la misma barra dan resultados distintos, la barra se envuelve en una caja y el nodo 9 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), las dos nativas sobre el estado del jugador. `tile_bar_cut_into_equal_parts` corre en gramática `partition`: la barra recibe las líneas de corte punteadas, los tramos se separan cuando quedan iguales, los sombreados cambian de color de a uno y una llave mide la parte tomada contra el total; parametrizada por cantidad de partes y de sombreadas, produce las instancias de `manipulate` y las dos animaciones de `explain` con solo cambiar cómo se combinan dos barras. `urn_fraction_of_balls` corre en gramática `random` con lectura de `partition`: las bolas salen de la bolsa y se apilan por color, y las columnas se contraen en la parte del total; parametrizada por la composición de la urna y el color resaltado. Ninguna lleva texto rasterizado: los dígitos y el trazo de la fracción los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). El desenrollado del disco en barra, que es el primer paso de desvanecimiento, no tiene escena declarada; ver el reporte.

**Calculadora:** en `ready` se habilita `op_frac` en el primer tier ([M](../../M-calculadora/M0-progresion.md)), y como `op_neg`, lo que agrega no es tanto una operación como una ficha: desde acá el jugador puede construir fracciones y las teclas que ya tenía empiezan a aceptarlas. Se presenta como dos casillas y el trazo entre ellas, la misma línea de corte que el jugador arrastró sobre la barra, y muestra la barra partida detrás del resultado. La aritmética entre fracciones no viene con esta tecla: llega con `arith.frac.common_unit`. Si el nodo decae, la tecla se dibuja con óxido y sigue funcionando.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): se corta con `drag`, se sombrea con `tap`, se saca de la urna con `tap` y `hold`, la instrucción es la mano fantasma que corta las tres pizzas y reparte, y `explain` se resuelve entre dos animaciones de barras. La pregunta del reparto justo se entiende a los cinco años y con el sonido apagado. La analogía es `adaptable`: el disco puede ser pizza, pan plano o torta según la región, y el `structure_map` no cambia ([P](../../P-internacionalizacion.md)). Un adulto llega por diagnóstico saltando `real` e `intuition` y encuentra contenido nuevo en un solo lugar, que es el mismo que para el niño: producir la lectura de razón a partir de la de partes en vez de saber las dos por separado.
