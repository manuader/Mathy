# 47 — Filas por columnas, da igual (`arith.mul.rows_and_columns`)

> Locale `es`: "Filas por columnas, da igual". Minijuego: [El piso que gira](../../F-minijuegos/arith.mul.rows_and_columns.md).

**Nodo:** `arith.mul.rows_and_columns` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `scale` · **Mecánica principal:** `tiles` · **Literacy:** `none` · **Analogía:** `tile_floor`

## 1. Concepto

Un montón de baldosas admite varios rectángulos, y todos tienen el mismo total. Al terminar, el jugador arma el mismo producto en los dos órdenes sin sorprenderse, junta tres montones iguales agrupándolos como quiera y llega siempre al mismo número, y sabe que un producto escrito no recuerda cuál factor fue filas y cuál columnas porque no hace falta que lo recuerde. Antes sabía armar el rectángulo de un par de números; ahora sabe qué del rectángulo es el resultado y qué es solamente la forma en que lo acomodó.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): multiplicar como escalar y como área. Se usan tres cosas suyas. El marco de patio y las baldosas que se funden en un rectángulo, con las líneas interiores atenuadas. Las dos llaves de longitud sobre los lados, con sus numerales. Y el signo `×`, que nació allí para anotar un piso que ya no está en pantalla, y que este nodo hereda entero sin agregarle nada.

Es el único prerequisito del YAML, y la arista se aparta del orden escolar en el reparto, no en el orden. La escuela presenta la conmutativa y la asociativa como dos reglas de una lista, junto a la distributiva, y las enuncia antes de que el chico haya tenido motivo para dudar de ellas. Acá son dos hechos separados que se descubren con las manos, en un nodo propio, después de que multiplicar ya significa algo. El nodo 5 le regala al jugador el giro del piso sin nombrarlo, como un detalle del gesto; este nodo lo convierte en la pregunta principal y agrega lo que el nodo 5 no podía plantear con dos factores: qué pasa cuando hay tres.

La banda elástica no participa. `grid_stretch` sostiene el factor como razón y los factores fraccionarios, que este nodo no toca; girar una banda no significa nada. Por eso el nodo declara una sola mecánica, `tiles`, y la analogía que le corresponde.

## 3. Dificultad cognitiva real

Lo difícil no es memorizar que "el orden no altera el producto". Son cuatro capacidades:

1. **Aceptar que girar el piso no cambia el total.** Un rectángulo de tres filas de cinco y uno de cinco filas de tres se ven distintos, y para un chico de seis años dos dibujos distintos son dos cantidades distintas hasta que comprueba lo contrario. Esta es la única propiedad del curriculum que se puede verificar levantando un objeto y volviéndolo a apoyar, y por eso se enseña acá y no con una tabla.
2. **Ver que el mismo total admite varios rectángulos.** Quince baldosas hacen 3 × 5, 5 × 3, 1 × 15 y 15 × 1, y nada más. Doce hacen seis rectángulos. Trece hacen dos. Aceptar que el total es lo estable y el rectángulo lo variable es lo que después convierte a un primo en un número con un solo rectángulo.
3. **Agrupar tres factores.** Con dos factores, girar alcanza. Con tres, aparece una pregunta nueva: armar primero un rectángulo con dos y después repetirlo, o empezar por la otra pareja. Los dos caminos dan lo mismo, y es lo que permite escribir tres factores seguidos sin paréntesis. Es la capacidad más difícil del nodo porque el objeto ya no cabe cómodo en un rectángulo plano.
4. **No sumar los lados.** El error clásico del área. Quien lo comete no está calculando mal: está leyendo el rectángulo como si los dos números fueran dos montones que se juntan, que es exactamente lo que hace el nodo 46 y exactamente lo que acá no se hace.

Las cuatro descansan sobre el mismo invariante de `tiles`: ninguna baldosa desaparece al reacomodar. Por eso una sola mecánica alcanza, y por eso las cuatro se comprueban con el mismo gesto.

## 4. Problema intuitivo

Un depósito con un lote de baldosas apiladas y dos patios de forma distinta: uno ancho y bajo, otro angosto y alto. El encargado va a cubrir los dos con el mismo lote y pregunta, con voz o con un gesto de duda, si le va a alcanzar en los dos.

En `real` el jugador solo mira: las baldosas se acomodan solas en el primer patio y lo cubren justo; después se levantan, viajan al segundo y también lo cubren justo. En `intuition` la escena se detiene antes del segundo patio. Tres desenlaces dibujados: sobran baldosas, faltan baldosas, entra justo. El jugador elige y después ve.

Hay una segunda escena de `intuition`, la de los tres factores. Hay cuatro cajas iguales, cada una con tres filas de dos baldosas. La mano las va a apilar y dos desenlaces se dibujan: primero se juntan las cajas de a dos y después las dos mitades, o se juntan de a una en fila. El jugador elige cuál de los dos deja más baldosas al final, y después ve que dejan la misma cantidad. Es la única pregunta de `intuition` del nodo cuya respuesta correcta es "las dos".

## 5. Analogía del mundo real

`tile_floor` ([G0](../../G-analogias/G0-reglas.md)), sobre la mecánica `tiles`, la misma que viste la cara de área del nodo 5. Mapa: fila de baldosas → primer factor; columna → segundo factor; baldosa suelta → unidad; piso entero → producto; **dar vuelta el piso → conmutatividad**; partir el piso en tiras y volver a juntarlo → agrupar de otra manera; piso con columnas faltantes → división.

Invariante que conserva: ninguna baldosa desaparece al reacomodar, ni al girar, ni al cortar, ni al apilar. Es exactamente lo que conserva el producto bajo reordenamiento y reagrupamiento de sus factores, así que el paso 3 del test de G0 pasa sin endurecer nada. La entrada del catálogo declara el giro del piso como conmutatividad, así que este nodo es el que la usa en su punto más fuerte.

Punto de ruptura: `non_integer_sides`. Un lado no puede ser media baldosa. Por eso el nodo se queda en factores enteros y no toca ni el 1/2 ni las fracciones: esas viven en la banda del nodo 5 y en `arith.frac.multiply`. Los casos del 1 y del 0 sí entran, aunque son incómodos —un piso de una sola fila y un piso sin ninguna—, y precisamente por incómodos se usan para separar el total del dibujo. La analogía se desvanece en `symbolic`.

Por qué esta y no otra. La banda del nodo 5 no puede dibujar la conmutatividad: estirar por 3 y estirar por 5 sobre la misma banda no se ven como dos lados de una figura, y la banda no se gira. `outfit_combinations`, la de la regla del producto en discreta, tiene la estructura correcta pero exige leer dos listas de opciones y su `literacy_min` no es `none`. El piso es la única del catálogo que pone la propiedad en un gesto de una mano.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `tiles` ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `hold`; el `pinch` del nodo 5 no hace falta acá y no aparece, porque nada se estira.

1. Un lote de baldosas al costado y dos marcos de patio con los lados cambiados de lugar. Sobre cada marco, las dos llaves de longitud del nodo 5, todavía vacías.
2. Demostración: una mano fantasma arrastra filas de baldosas al primer marco hasta cubrirlo; el borde se ilumina y la ficha del total aparece contando desde cero. Después hace un toque sostenido sobre el piso, lo levanta entero y lo gira un cuarto de vuelta: las filas se vuelven columnas, el segundo marco se acomoda debajo y la ficha del total no se mueve. Repite una vez y desaparece.
3. El jugador arrastra filas al marco. Al soltar dos filas contiguas se funden con un chasquido y las líneas interiores se atenúan.
4. Toque sostenido sobre el piso: lo levanta y lo gira. Ese es el gesto del nodo. La ficha del total viaja con el piso y nunca cambia de número; si el jugador la mira mientras gira, la ve quieta.
5. Si suelta el piso girado sobre un marco que no le corresponde, el piso no se rechaza: se apoya, y las baldosas que no entran quedan afuera del borde, contadas. El estado sigue siendo válido y el jugador gira de nuevo.
6. Cortar y volver a juntar. Un trazo entre dos columnas parte el piso en dos tiras; arrastrar una tira a continuación de la otra lo rehace. La ficha del total no se mueve en ninguno de los dos pasos.
7. Desde el cuarto nivel aparece el lote sin marco: un montón de baldosas y la pregunta de cuántos rectángulos distintos se pueden armar con todas. Los que el jugador arma se guardan como siluetas al costado, y dos rectángulos que son el mismo girado se apilan en una sola silueta con una marca de giro. Ahí se ve por primera vez que quince tiene dos formas y no cuatro.
8. Desde el sexto nivel aparecen tres factores: cajas iguales que se apilan. El jugador elige el orden de armado, y el juego dibuja las dos rutas una al lado de la otra hasta que las dos fichas del total coinciden.

Qué pasa cuando se equivoca. Nada se llama "incorrecto": cada error tiene su consecuencia física. El piso girado que no entra deja baldosas afuera. El lote al que le faltan baldosas deja un hueco en el marco. El único error con entrada en el catálogo es sumar los lados, y su patrón está en la sección 12.

## 7. Representación visual

Capa `visual`, primitiva `scale` de [H](../../H-progresion-abstraccion.md), con `partition` de apoyo cuando el piso se parte en tiras y cuando el lote se reparte en rectángulos distintos.

El piso se estiliza en un rectángulo sobre una grilla tenue, con una llave de longitud en cada lado. Girar es una rotación de un cuarto de vuelta del rectángulo entero, con las dos llaves girando pegadas a sus lados: la llave que estaba arriba termina a la izquierda. Lo que se ilumina en el antes y el después es la ficha del total, idéntica en los dos estados; lo que cambia de lugar son las llaves. Esa es la lectura precisa de la conmutatividad: **el producto se conserva, las etiquetas se intercambian**.

Los tres factores se dibujan como un rectángulo repetido: el rectángulo base con su total, y tantas copias apiladas con un desplazamiento chico como diga el tercer factor, de modo que se vea que son capas y no un cuerpo nuevo. Agrupar de otra manera es rearmar las capas: el juego muestra las dos rutas con las mismas baldosas cambiando de agrupación, nunca apareciendo ni desapareciendo.

Todavía no hay paréntesis, ni signo de igual, ni factores negativos, ni lados que no sean un número entero de baldosas. El total no se apoya sobre ninguna recta: acá el producto es un montón, no un lugar.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Piso girado → dos llaves que se intercambian.** La primera vez que el jugador gira un piso ya etiquetado en `visual`, las dos llaves con sus numerales giran con él y quedan cambiadas de lado, mientras la ficha del total se queda quieta en el borde. El jugador ve dos números que se mudan y uno que no.
2. **Dos productos → un producto.** Al armar el segundo piso con las etiquetas cambiadas, la expresión `3 × 5` que ya estaba escrita y la nueva `5 × 3` se acercan y se superponen; la ficha del total, que era una para cada una, se funde en una sola. Queda una expresión con el `×` y un total, y las dos versiones se pueden separar de nuevo tocándola.
3. **Capas → tres factores en fila.** Al armar el bloque de tres factores, la ficha del total de cada capa se desvanece y en su lugar queda el numeral de la cantidad de capas, con la misma cruz del nodo 5 entre él y la expresión del rectángulo base: `3 × 5 × 4`. Los paréntesis no llegan a dibujarse: la agrupación se ve como una franja translúcida sobre dos de los tres numerales, que el jugador puede correr con el dedo de un par al otro.
4. **Franja que se corre → franja que se va.** Cuando el jugador corre la franja de un par al otro y la ficha del total no cambia, la franja se desvanece sola. Lo que queda es `3 × 5 × 4` sin ninguna marca de agrupación, y esa ausencia es el resultado del nodo, no un descuido de la notación.

## 9. Notación matemática

Queda `3 × 5` con su total, junto al contorno del piso, y `3 × 5 × 4` sin paréntesis.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), el nodo **no introduce símbolos nuevos**: el `×` ya llegó en el nodo 5 con su problema, que era anotar un piso que no está en pantalla, y los numerales vienen del nodo 1. Como fija la convención 3 de la [plantilla](_plantilla.md), lo que el nodo aporta es una **convención de escritura**, y hay dos.

La primera: un producto escrito no dice cuál factor fue filas y cuál columnas. Es una pérdida de información deliberada, y hace falta señalarla, porque el jugador acaba de pasar cuatro niveles distinguiéndolas. El problema que la exige aparece en el nivel del depósito: hay que pedir baldosas para un patio que se va a construir después y todavía no se sabe en qué dirección se van a poner las filas. Si la notación guardara la orientación, habría que pedir dos veces.

La segunda: tres factores se escriben seguidos, sin paréntesis. El problema que la exige es que los paréntesis todavía no existen —nacen en `arith.expr.precedence_tree` con el suyo propio, que es indicar qué se hace primero cuando el orden importa— y acá justamente **no** importa. La franja translúcida del cuarto morph es un paréntesis que el nodo prueba y descarta delante del jugador: se dibuja, se corre, no cambia nada y se va. Cuando el paréntesis llegue de verdad, llegará para un caso donde correrlo sí cambia el resultado, y el jugador va a tener con qué comparar.

No aparece ningún otro símbolo. No hay igual, no hay exponente —tres factores iguales son `arith.pow.repeated_scaling`— y no hay letras.

## 10. Definición formal

Capa `formal` como voz sobre el objeto, sin texto escrito, porque el nodo es `literacy: none` ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre el piso que el jugador tiene en pantalla. El orden de los dos factores no cambia el producto: el mismo piso girado. Agrupar tres factores de cualquier manera no cambia el producto: las mismas baldosas en otras capas. Un mismo total admite varios rectángulos, y a veces uno solo.

Condiciones y casos especiales, verificados sobre el objeto: el piso de una sola fila es el factor 1 y girarlo lo deja igual de largo, parado; el marco sin filas es el factor 0 y girarlo sigue sin tener nada, que es la única forma de girar que no se ve; y un total que solo admite el rectángulo de una fila es un número que no se puede repartir en filas iguales, lo que `arith.num.factor_tree` va a llamar primo.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: el caso del total con un solo rectángulo, que en el lote es la frustración de no poder armar nada más, y la palabra "agrupar" como nombre de lo que antes era elegir por dónde empezar. Las dos entradas de cheatsheet del nodo, `cs.arith.mul_order_irrelevant` y `cs.arith.mul_grouping_irrelevant`, quedan como imagen con voz.

## 11. Propiedades

- **El orden de los factores no cambia el producto.** Ligada al toque sostenido que gira el piso: las llaves se mudan, la ficha del total no. Es la propiedad que el nodo 5 regaló sin enunciar y que este nodo convierte en la pregunta principal.
- **Agrupar los factores de otra manera no cambia el producto.** Ligada a la franja translúcida que se corre de un par al otro sin que el total se mueva, y al bloque de capas rearmado por las dos rutas.
- **Un mismo total admite varios rectángulos, y dos rectángulos girados son el mismo.** Ligada a las siluetas guardadas del séptimo paso de la mecánica: quince deja dos siluetas, doce deja tres, trece deja una. Es la semilla de los divisores y de los primos.
- **El total no cambia si el piso se corta y se vuelve a juntar.** Ligada al trazo entre dos columnas. Es el invariante de `tiles` en su forma más pura y la semilla de los productos parciales, que es el nodo siguiente.
- **Multiplicar por 1 deja el piso igual; multiplicar por 0 lo deja sin nada.** Heredadas del nodo 5 y su cheatsheet; acá se comprueban girando, que es lo único nuevo: el piso de una fila girado sigue teniendo el mismo total, y el marco vacío girado también.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: un piso y tres pisos más, uno con las filas y las columnas cambiadas de lado; tocar el que tiene el mismo total. Los distractores se generan con un factor vecino y con el piso de la suma de los lados.
- `explain`: dos animaciones sobre el mismo piso; en una gira y la ficha del total no se mueve, en la otra gira y la ficha cambia de número. Tocar la que miente. Para `literacy: none` este es el formato de todo `explain`.
- `manipulate`: armar con baldosas sueltas el piso que pide el marco, girarlo un cuarto de vuelta y comprobar que el marco girado sigue quedando cubierto.
- `apply`: un montón de baldosas y dos marcos con los lados cambiados; repartir y arrastrar la ficha del total, que es la misma para los dos, contra el tiempo objetivo del nodo.
- `generalize`: tres montones iguales; armar el bloque juntando primero dos y después el tercero, y luego al revés, y comprobar que el total no cambia.
- `transfer`: en la grilla de resultados de dos dados, tocar la cantidad de casillas sin contarlas de a una.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`factors_added_not_multiplied`**, patrón `missing_piece_tiles` sobre `tiles`. Frente a un marco de tres por cinco, el jugador arrastra la ficha del total con `8`, o coloca ocho baldosas. El juego ejecuta su respuesta: acomoda esas ocho baldosas en el marco, deja el hueco a la vista, superpone el contorno del piso completo y marca la parte que falta. Voz: "Con esas baldosas quedó un hueco. ¿Cuántas entran en cada fila?". El marco a medio cubrir es un estado válido y el jugador sigue agregando desde ahí. Es la de mayor severidad del nodo porque confunde su primitiva con la del nodo 46: leer el rectángulo como dos montones que se juntan. Su regla `detect` alimenta los distractores de `recognize` y de `apply`.

Errores que el diseño prevé y que no tienen entrada en el catálogo, y por eso no clasifican ni bloquean `ready`:

- **Creer que girar cambia el total.** Es el distractor de `explain` y la primera dificultad de la sección 3. Si el jugador lo elige, el juego reproduce el giro con las baldosas numeradas por el orden en que las puso y muestra que ninguna se fue.
- **Contar los rectángulos girados como distintos.** En el nivel del lote, el jugador guarda 3 × 5 y 5 × 3 como dos siluetas. El juego apila las dos con una marca de giro y deja una sola. Es un empujón suave, no una explicación.

## 13. Generalización

La analogía se retira en `symbolic`, como declara la entrada de G. El piso se va cuando el jugador gira una expresión escrita —arrastrando un factor sobre el otro— sin mirar el marco, y sobre todo cuando aparece el tercer factor, que el plano ya no dibuja cómodo.

Variantes sin ayuda visual, en orden: factores mayores que la grilla, donde el rectángulo no se cuenta de un vistazo; el 1 y el 0 en cualquiera de los dos lugares; tres factores con las dos agrupaciones pedidas seguidas; y el mismo producto pedido en los dos órdenes, para comprobar que el jugador no está leyendo un dibujo memorizado.

Lotes arbitrarios. El nodo termina con montones cuyas unidades no son baldosas: fichas de colores, puntos sueltos, siluetas que no encajan entre sí. El jugador tiene que decir cuántos rectángulos admite el montón y reconocer los que son el mismo girado, sin poder apoyar nada en una grilla. Se evalúa que la estructura —un total, varias formas de acomodarlo en filas iguales, y el giro como la operación que no produce una forma nueva— se reconoce sin baldosas.

El nodo está en `abstract` cuando el jugador intercambia dos factores en una expresión escrita sin pedir el piso, agrupa tres factores de las dos maneras sin sorpresa, distingue un total con un solo rectángulo de uno con varios, y no confunde el total con la suma de los lados. La forma completa de esa capa aparece mucho después, cuando el orden y la agrupación dejan de ser gratis: en `linalg.map.linear_transformation_2d`, donde componer dos deformaciones en el otro orden da otra cosa, y la sorpresa solo funciona porque acá fue gratis.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área:

- `disc.count.product_rule` (`tiles`, `gears_sequence`): contar los pares que se forman con tres remeras y cuatro pantalones. Las baldosas del piso son los pares, y el giro dice que da lo mismo elegir primero la remera o primero el pantalón. Es el nodo donde el rectángulo deja de ser un piso y pasa a ser una tabla de casos.
- `prob.basic.sample_space_grid` (`tiles`, `urn_dice`): la grilla de los treinta y seis resultados de dos dados. Contar las casillas sin contarlas de a una es el mismo gesto, y la grilla girada es la misma grilla, cosa que importa cuando se pregunta por la suma de los dos dados.
- `geom.area.rect_and_triangle` (`construct`, `tiles`): el rectángulo dibujado, donde el producto de los dos lados es el área y ya nadie cuenta baldosas. Que el área no dependa de cuál lado se llame base es este nodo, dicho en geometría.

Concepto siguiente: `arith.mul.partial_products` ([`arith.mul.partial_products`](../../C-knowledge-graph/graph/arith.yaml), fuera de la espina). Frase puente, narrada sobre el último piso cortado en dos tiras: "Cortaste el piso y el total no cambió. ¿Y si lo cortás para que un pedazo tenga diez de ancho?". El corte se corre solo hasta la décima columna, las dos tiras se separan un poco y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `tile_array_turns_quarter` es la mecánica renderizada sobre el estado del jugador: el rectángulo entero se levanta y rota un cuarto de vuelta con un ritmo suave, las dos llaves de longitud giran pegadas a sus lados y se intercambian, y la ficha del total queda inmóvil e iluminada en el antes y en el después; gramática `scale`, parametrizada por filas y columnas, produce la mecánica de los niveles del giro, las dos animaciones de `explain` y los ítems de `recognize`. `tile_regroup_factors_same_total` es la escena de los tres factores: el bloque de capas se corta con un trazo, las capas se rearman en la otra agrupación con las mismas baldosas viajando de una posición a la otra, y las dos fichas del total se comparan al final; parametrizada por la lista de factores y por el despiece, produce los ítems de `generalize` y el replay del corte. Ninguna lleva texto rasterizado: los numerales y la cruz los dibuja el runtime, y las baldosas son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_mul` ([M](../../M-calculadora/M0-progresion.md)). La tecla ya puede estar encendida si el jugador llegó por `arith.mul.scaling`, y este nodo es un segundo camino hacia la misma tecla, como permite la regla de desbloqueo por cualquiera de sus nodos. Lo que agrega es el gesto: tocar la tecla sobre dos fichas dibuja el rectángulo con sus dos llaves y después el total, como en el nodo 5, y tocar el rectángulo dibujado lo gira, con las llaves cambiando de lado y el total quieto. Con tres fichas seleccionadas, la tecla arma el bloque de capas y deja elegir la agrupación con la misma franja translúcida. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que cubre el marco y después levanta el piso y lo gira, los targets son baldosas y pisos del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada, porque el chasquido de las filas al fundirse, el borde iluminado del marco y la ficha del total que no se mueve dicen lo mismo. El toque sostenido tiene alternativa de arrastre por manija, como pide el catálogo para todo gesto que no sea `drag` o `tap`. Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra en el nivel donde el piso ya tiene llaves con numerales y pasa rápido al bloque de tres factores, que es lo único del nodo que no es evidente para él.
