# Un corte, dos lecturas (`arith.frac.parts_and_ratio`)

Minijuego del nodo 8 de la espina, "Una fracción es partes del todo". Mecánica principal `tiles`, secundarias `ledger` y `urn_dice`; analogías `pizza_slices` y `chocolate_bar_grid`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/08-arith.frac.parts_and_ratio.md): un concepto, cuatro dificultades reales (declarar el todo, exigir partes iguales, reconocer que las dos lecturas son el mismo número, y que una fracción es un número y no dos), dos analogías —el disco como puerta y la barra como herramienta—, un gesto central (reagrupar), cinco pasos de desvanecimiento, la barra partida como visualización, retiro del disco en `symbolic`. Acá se fija cómo se juega.

## Analogía

Tres discos iguales sobre una mesa y cuatro platos vacíos debajo; un cuchillo que se arrastra. En otra mesa, un disco ya cortado en pedazos desiguales. Más adelante, una barra rectangular en grilla y una bolsa con bolas de dos colores.

Mapa objeto → concepto: disco entero → unidad; cortar en n porciones iguales → denominador; porciones tomadas → numerador; volver a cortar cada porción → fracción equivalente; dos discos cortados igual → denominador común; más porciones que un disco → fracción impropia. De la barra: barra → todo; cuadraditos → partes iguales; filas por columnas → los denominadores se multiplican; parte sombreada de una parte sombreada → producto de fracciones. De la bolsa: bolsa entera → todo que no es una figura; bolas de un color → parte tomada.

El disco aporta la puerta —un chico de cinco años sabe cuándo un reparto es injusto—; la barra aporta la herramienta, porque se alinea con otra barra y el disco no. Punto de ruptura del disco: `dividing_by_a_fraction`, dividir una pizza por media pizza no es una acción de la mesa. Punto de ruptura de la barra: `percent_of_percent_and_over_hundred` ([G0](../G-analogias/G0-reglas.md)). La bolsa no tiene entrada de analogía que apunte a este nodo aunque su mecánica sí lo liste; ver el reporte.

## Mecánica central

Superficie: la mesa con los discos y los platos ocupa el centro; la regla donde el disco se desenrolla en barra, el borde derecho; la bolsa entra en el nivel de razón, abajo a la izquierda. Gestos: `drag`, `tap` y `pinch` sobre las baldosas y los discos; `tap` y `hold` sobre la bolsa ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar el cuchillo sobre un disco.** Una guía muestra en cuántas partes va a quedar y las porciones se previsualizan; al soltar, el corte se aplica de golpe a todo el disco.
- **Cortar a ojo en partes desiguales.** El disco no se separa. Las líneas quedan dibujadas y las porciones laten con tamaños distintos hasta que el jugador empareja arrastrando una línea; recién ahí se despegan. La igualdad no se pide con palabras: es la condición para que el objeto se deje tomar.
- **Arrastrar porciones a los platos.** Si un plato queda con más que otro, se hunde un poco y el reparto no cierra. El estado se conserva.
- **Reagrupar.** Tomar todas las porciones de un plato y soltarlas sobre un disco de referencia vacío: se acomodan solas y ocupan tantos lugares como porciones haya. Lo que era "lo que le tocó a uno de cuatro" se ve como "tres de las cuatro partes de uno". Es el gesto central del minijuego y el único lugar donde las dos lecturas se producen una a partir de la otra.
- **Sombrear con un toque.** Sobre la barra, tocar un tramo lo sombrea; volver a tocarlo lo apaga.
- **Poner una barra sobre otra.** Se alinean por el extremo izquierdo y las líneas de corte de las dos quedan visibles a la vez. Es lo que el disco no permite.
- **Sacar bolas de la bolsa.** Con `tap` de a una, con `hold` de a muchas. Se apilan por color y una barra al costado muestra qué parte del total ocupa cada montón.
- **Tocar la barra de un color.** Devuelve las bolas a la bolsa y las vuelve a sacar; la parte se mantiene. Es la verificación de la lectura de razón.

En `symbolic` la superficie cambia de forma, no de reglas: la fracción escrita se arrastra sobre una barra sin cortar y la corta y la sombrea sola; arrastrarla sobre la bolsa resalta esa parte de las bolas. La barra partida se pide tocando la fracción y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`area_preserved_under_rearrangement` (baldosas y porciones): reagrupar no crea ni destruye. Se ve confirmarse en el gesto central: las tres porciones de cuarto que salieron de tres discos distintos ocupan exactamente tres de los cuatro lugares de un disco. Se ve romperse cuando el jugador intenta sumar cruzado: la barra que arma es más corta que una de las dos partes que quiso juntar.

`proportion_stable_in_long_run` (bolsa): la parte de cada color no depende de cuántas bolas se saquen ni en qué orden. Se ve confirmarse al vaciar la bolsa dos veces y obtener la misma barra.

Un movimiento válido pero inútil —cortar en más partes de las necesarias, o sacar bolas de a una cuando ya se estabilizó la barra— no rompe ningún invariante y recibe un empujón suave.

## Representación visual

Primitiva dominante `partition`, de apoyo `scale` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: las dos mesas, tres pizzas y cuatro chicos, y al lado la pizza cortada en pedazos desiguales. Solo se mira y se predice cuál reparto es justo.
- `concrete`: discos, cuchillo, platos, bolsa y bolas. Nada escrito.
- `visual`: el disco se desenrolla en una barra con las mismas divisiones y desde ahí todo trabaja con barras. Una barra partida en tramos iguales con algunos sombreados es la imagen canónica; dos barras del mismo largo, una sobre otra, con cortes distintos, es la de comparación. La barra de la lectura de razón se dibuja apoyada sobre la del total con una llave que mide cuántas veces entra una en la otra.
- `symbolic`: dos números apilados con el trazo entre ellos, la barra partida como marca de agua, la bolsa detrás en los ítems de razón.
- `formal`: la definición corta con voz y la barra al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Disco → barra: arrastrar un disco cortado hacia la regla lo desenrolla en una barra con las mismas divisiones; la cantidad de porciones no cambia mientras rueda.
2. Porciones → dos números apilados: al sombrear, la barra escribe debajo cuántas partes tiene y encima cuántas están sombreadas, los dos nacidos de conteos del jugador.
3. Línea de corte → barra de fracción: la línea del último corte se despega, se acuesta entre los dos números y queda como el trazo de la fracción.
4. Reparto → la misma fracción: al reagrupar las porciones de un plato sobre un disco de referencia, la fracción escrita bajo el reparto y la escrita bajo la barra se acercan y se funden en una sola con un morph.
5. Urna → parte del total: las columnas de bolas se contraen en dos números con la misma barra horizontal entre ellos; la bolsa queda como marca de agua.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la barra fantasma: partir un todo en partes iguales y tomar algunas es tomar una fracción de ese todo; el número de abajo dice en cuántas partes se cortó y el de arriba cuántas se tomaron; repartir a cosas entre b personas le da a cada una a partido b. Propiedades: solo las partes iguales cuentan; la fracción no depende de cuáles porciones se toman sino de cuántas; tomar todas es el todo y ninguna es nada; repartir a entre b da la misma fracción que tomar a partes de b; la misma fracción vive en objetos distintos. Casos especiales: cuatro pedazos desiguales no son cuartos; se pueden tomar más partes que las de un todo si hay otro igual al lado; cortar en cero partes no es un corte. Símbolo nuevo: la fracción, cuyo trazo es una línea de corte movida de lugar, y cuyo problema es nombrar el pedazo de un reparto que no cerró en el nodo 6. El signo de igual aparece al transcribir el reparto y el nodo no lo introduce. Hay un lugar donde se decide no usarlo: cuando las dos lecturas resultan ser el mismo número, las dos escrituras se funden con un morph en vez de quedar unidas por un igual, que invitaría a leerlo como "esto da esto otro".

## Generalización

El disco se retira en `symbolic`, en cuanto hay que comparar dos cortes distintos o pasar de un todo. La barra en grilla se queda como fantasma a demanda hasta `formal`. La bolsa se queda más tiempo que las dos, porque su forma visual sigue siendo correcta cuando el todo es una colección, y es la que recibe después la probabilidad.

Variantes sin ayuda visual: denominadores que no son dos ni cuatro; la misma fracción pedida sobre todos de distinto tamaño, para forzar la declaración del todo; repartos con el numerador mayor y menor que el denominador; fracciones impropias sin nombrarlas; y la pregunta inversa, dada una parte sombreada decir qué fracción es. Después, todos que no son comida: una hora en cuartos, un grupo del que una parte lleva sombrero, un camino recorrido en parte, una vuelta girada en parte, y un caso donde el todo no está dibujado y hay que elegirlo. Cuando el jugador nombra el todo antes de operar y produce una lectura a partir de la otra sin dibujar, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): este minijuego no participa del ejemplo de cofres ni del de frutas. Su nivel 3 —el reagrupado— es el que después hace falta en la etapa 1 del ejemplo de frutas, donde repartir un total entre tres manzanas iguales es la misma acción con otra piel.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cortar parejo.** `concrete`, `manipulate`. Un disco, un corte, sombrear las porciones que pide la ficha. Denominadores 2 y 4. Aparece el corte desigual que no se separa.
2. **Cuatro platos.** `concrete`, `manipulate` y `recognize`. Repartir porciones entre platos hasta que ninguno se hunda. Sigue habiendo un solo disco por instancia.
3. **Reagrupar.** `concrete`, `apply`. Varios discos repartidos entre varias personas; juntar lo de un plato sobre un disco de referencia. Es el nivel que produce la segunda lectura y no se saltea.
4. **La barra.** `visual`, `explain` y `manipulate`. El disco se desenrolla, aparecen las barras alineadas y la comparación entre dos cortes. Aparece `fraction_add_across`. Misma dificultad numérica.
5. **La bolsa.** `visual` hacia `symbolic`, `apply`. El todo deja de ser una figura: bolas de dos colores y la parte del total. Aparecen los dos números apilados con su trazo.
6. **Números difíciles.** Parámetros: denominadores hasta 12, numeradores mayores que el denominador, y el mismo par de números pedido sobre todos de distinto tamaño.
7. **Todos que no se ven.** `formal` y `abstract`, `generalize`. Particiones de una hora, de un grupo, de una vuelta; un caso donde el todo no está dibujado. Definición corta con voz.

Qué endurece cada parámetro: los denominadores mayores obligan a cortar con la guía en vez de a ojo; el numerador mayor que el denominador rompe la lectura "un pedazo de esta pizza" y fuerza la de razón; repetir el mismo par sobre todos distintos es lo único que enseña que la fracción no es una cantidad; y el todo no dibujado del nivel 7 es lo que separa haber entendido de haber practicado.

Desafíos de olimpíada: el nodo no declara `challenges` y por lo tanto no exige desafío para `mastered` ([K](../K-evaluacion.md)). La estructura reaparece como paso intermedio en `ch.arith.fraction_of_the_rest`, donde el todo cambia después del primer mordisco y hay que volver a declararlo ([S](../S-desafios/S0-desafios.md)).

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro pizzas cortadas de formas distintas y una ficha de fracción; tocar la que muestra esa parte. Un distractor tiene los dos números intercambiados y otro tiene partes desiguales que suman lo mismo.
- `explain`: dos animaciones. En una, dos porciones de discos cortados igual se juntan y el total se cuenta en porciones de ese tamaño; en la otra se suman los números de arriba entre sí y los de abajo entre sí, y la barra resultante queda más corta que una de las dos que se sumaron. Tocar la que suma cruzado. El distractor elegido clasifica como `fraction_add_across`.
- `manipulate`: cortar la barra en partes iguales y sombrear las que pide la ficha; la barra suelta las partes solo cuando son iguales.
- `apply`: una bolsa con bolas de dos colores; arrastrar la ficha de fracción que dice qué parte del total es de un color, contra el tiempo objetivo del nodo.
- `generalize`: la misma cantidad como pizza, como barra, como bolsa y como reparto en platos; tocar todas las que son la misma fracción. Y una vuelta de la que se giró un pedazo, sin todo dibujado: señalar el todo antes de responder.
- `transfer`: en el dial de `geom.angle.turn_as_measure`, llevar la aguja a la fracción de vuelta que indica la ficha. También en `prob.basic.probability_as_proportion` (la parte del blanco), `geom.sim.similarity_as_scale` (la razón entre dos lados correspondientes) y `precalc.lim.approach` (las mitades sucesivas del camino).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `fraction_add_across`, patrón `missing_piece_tiles` sobre las baldosas: el juego coloca las baldosas de la respuesta del jugador, superpone la forma verdadera y hace brillar la pieza que falta; la barra del jugador queda más corta que una de las dos partes que quiso sumar. Las piezas que faltan están en la bandeja y el control vuelve a él; al completar el hueco, la fracción del costado cambia con un morph. Es la de mayor severidad del nodo y bloquea la salida de `symbolic` mientras esté activa.
- Cortar a ojo en partes desiguales no tiene entrada en el catálogo de L y no clasifica: el disco no se separa hasta que las porciones se emparejan.

Los distractores de `explain` y las opciones de `apply` se generan desde la regla `detect` de `fraction_add_across` y desde las de los prerequisitos directos, más el intercambio de los dos números y las particiones desiguales.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_bar_cut_into_equal_parts`, nativa. La barra recibe las líneas de corte punteadas, los tramos se separan cuando quedan iguales, los sombreados cambian de color de a uno y una llave mide la parte tomada contra el total; gramática `partition`. Parametrizada por cantidad de partes y de sombreadas, produce las instancias de `manipulate` y, combinando dos barras, las dos animaciones de `explain`.
- `urn_fraction_of_balls`, nativa. Las bolas salen de la bolsa y se apilan por color; las columnas se contraen en la parte del total; gramática `random` con lectura de `partition`. Parametrizada por la composición de la urna y el color resaltado.
- Reusadas: la escena del rectángulo partido en filas del nodo 6, como estado de partida de los repartos que dejan sobrante.
- Faltante: el desenrollado del disco en barra, que es el primer paso de desvanecimiento, no tiene escena declarada. Ver el reporte.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_fraction_bar`: `denominator` (2 y 4 en el nivel 1, hasta 8 en los niveles 2 a 5, hasta 12 desde el 6); `numerator` (menor que el denominador hasta el nivel 5, mayor desde el 6); `whole_size` (constante hasta el nivel 5, variable desde el 6 para forzar la declaración del todo); `shape` en {disco, barra}; `seed`.
- `gen_share_out`: `items` y `people` por rango según nivel; `regroup_required` (verdadero desde el nivel 3); `seed`.
- `gen_urn_composition`: `colors` (2 en los niveles 5 y 6, hasta 3 en el 7); `counts` por rango; `ask` en {parte de un color, cuál bolsa tiene mayor parte}; `seed`.
- `gen_undrawn_whole`: situaciones con un todo que no está dibujado (una hora, una vuelta, un grupo, un camino), una por instancia en el nivel 7.

**Literacy soportada:** de `none` a `full_text`. El mínimo es `none` en todos los niveles: se corta con `drag`, se sombrea con `tap`, la bolsa se vacía con `hold`, la instrucción es la mano fantasma y `explain` se resuelve entre dos animaciones de barras. Los dos números de la fracción aparecen recién en el nivel 5 y nacen de conteos que el jugador hizo. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra el cuchillo sobre un disco y lo parte en cuatro; después repite en los otros dos discos y lleva una porción de cada uno a cada plato; los cuatro platos quedan iguales y no sobra nada. La escena vuelve al inicio y el cuchillo late. La demostración de reagrupar se muestra aparte, la primera vez que aparece el disco de referencia. La de sacar bolas de la bolsa se muestra la primera vez que aparece la bolsa ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
