# Dos aros y tres fichas (`disc.logic.and_or_not`)

Minijuego del nodo 54 de la espina, "Y, O y NO como filtros". Mecánica `sorter`; analogía `hula_hoops_overlap`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/54-disc.logic.and_or_not.md): un concepto, tres dificultades reales ("o" incluye el medio, "no" necesita un afuera, la combinación es otra tarjeta), una analogía de dos aros encimados sobre el mismo montón, un gesto central (cambiar la ficha del conectivo y mirar qué región se ilumina), cinco pasos de desvanecimiento, la lona partida en cuatro regiones como visualización dominante, retiro de los aros en `formal`. Acá se fija cómo se juega.

## Analogía

Dos aros apoyados en el piso, un poco encimados, cada uno con su tarjeta al lado. Un montón de piezas alrededor, sobre una lona con borde. Una pieza puede estar dentro de un aro, dentro de los dos, o afuera de los dos pero sobre la lona.

Mapa objeto a concepto: cada aro es un conjunto; estar parado adentro de un aro es pertenecer; la parte encimada es la conjunción; estar en alguno de los dos es la disyunción; estar sobre la lona y afuera de los dos es la negación; y contar la parte encimada una sola vez es el principio de inclusión y exclusión, que el área de conteo retoma en `disc.count.sum_rule`.

Los aros aportan lo que la lona del nodo 53 no podía mostrar: dos regiones que se cruzan y una pieza que está en las dos a la vez. Punto de ruptura: `infinite_sets`. Dos aros encierran cantidades finitas y dibujables; con conjuntos infinitos la región deja de tener una cuenta y el diagrama pasa a ser un esquema que no sostiene ningún argumento. Por eso la analogía se retira en `formal`, cuando la tabla de cuatro filas reemplaza al recuento de regiones ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la lona con las piezas arriba, los dos aros encimados en el centro con sus tarjetas al costado, y abajo una barra con tres fichas de conectivo (`y`, `o`, `no`). Al costado, la tabla, que aparece desde la capa `visual`. Gestos: `drag`, `tap` y `hold` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar la ficha `y` entre las dos tarjetas.** Las dos se juntan en una tarjeta compuesta y se ilumina solo la parte encimada. Las piezas que la cumplen se deslizan hasta ahí.
- **Cambiarla por la ficha `o`.** Se iluminan los dos aros enteros, y la parte encimada se ilumina una sola vez, con la misma intensidad que el resto. Las piezas del solape no se mueven: ya estaban adentro.
- **Arrastrar la ficha `no` sobre una tarjeta.** La tarjeta recibe un trazo y la región iluminada se da vuelta: se apaga el aro y se enciende el resto de la lona.
- **Mover los aros.** Separarlos hasta que no se tocan deja la conjunción vacía y hace que "o" incluyente y "o" excluyente coincidan; encimarlos más agranda el solape. Meter uno dentro del otro deja una región vacía y hace que una tarjeta compuesta coincida con una simple.
- **Arrastrar una pieza dentro o fuera de la lona.** Los contadores cambian sin que ninguna tarjeta se toque. Es la manera de sentir que "no" se mide contra la lona.
- **Mantener apretado sobre una región.** Las piezas de esa región se cuentan una a una y el contador queda pegado a la región. Los cuatro contadores suman siempre el total de la lona.
- **Tocar la pila de contadores.** Las cuatro regiones se despegan y se acuestan como cuatro renglones. Tocar un renglón enciende su región y tocar una región enciende su renglón.

En `symbolic` la superficie cambia de forma, no de reglas: anidar una tarjeta compuesta dentro de otra hace aparecer los paréntesis del nodo 9; el trazo de la ficha `no` se para adelante como signo propio; y poner dos tarjetas compuestas una al lado de la otra contrae las palabras `y` y `o` en sus signos, para que las dos se lean de un vistazo.

## Invariante matemático

`every_object_exactly_one_bin` (clasificador), ahora sobre las cuatro regiones que dos aros dibujan en la lona. Cada pieza está en una y solo una de ellas, y los cuatro contadores suman el total.

Se ve romperse en el gesto que el jugador intenta primero: poner una pieza en la parte encimada cuando cumple una sola tarjeta. La pieza sale despedida hacia la región que sí le corresponde, que siempre existe y siempre es una. Y se ve confirmarse cuando el jugador arrastra piezas de una región a otra y mira que la suma de los cuatro contadores no se mueve, por más que los cuatro números cambien.

De ese invariante sale el resultado central del nodo: la tabla tiene cuatro filas por más piezas que haya, porque dos preguntas de sí o no producen exactamente cuatro clases de pieza. Es lo que hace que dos tarjetas se puedan comparar sin tener las mismas piezas delante.

Un movimiento válido pero inútil, como negar dos veces la misma tarjeta, no rompe nada: la región vuelve a ser la de antes y el trazo doble se desvanece solo. Empujón suave, no explicación.

## Representación visual

Primitiva dominante `partition` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: los aros en el piso, las piezas y la mano que acomoda. La escena se detiene con la pieza roja y grande en el aire y el jugador elige entre tres desenlaces dibujados.
- `concrete`: aros, piezas, tarjetas y la barra con las tres fichas. Los contadores de región aparecen recién al mantener apretado.
- `visual`: los aros se aplanan en dos curvas sobre el rectángulo de la lona, las piezas son puntos y las cuatro regiones tienen su contador. La tabla vive al costado, con un hilo vivo entre cada renglón y su región.
- `symbolic`: tarjetas anidadas con paréntesis, el trazo de `¬` adelante, y `∧` y `∨` cuando hay dos tarjetas compuestas para comparar. Aros y regiones a demanda como fantasma.
- `formal`: la tabla sola, con las tres frases narradas y la lona apagada detrás.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Aros a curvas con cuatro contadores: al alternar dos veces entre `y` y `o` sobre las mismas tarjetas, los aros se aplanan en curvas y cada región gana su contador.
2. Regiones a filas: al tocar la pila de contadores, las cuatro regiones se despegan y se acuestan como cuatro renglones, cada uno con un hilo a su región y con las respuestas escritas con el tic y el rebote del nodo 53.
3. Trazo a `¬`: cuando el jugador niega una tarjeta que ya era compuesta, el trazo dibujado encima tapa lo que quiere negar; se despega y se para adelante como signo propio.
4. Fichas de palabra a paréntesis: al anidar por primera vez, el cofre del nodo 9 vuelve como fantasma y aparecen los paréntesis, con las fichas `y` y `o` escritas como palabras entre ellos.
5. Palabras a `∧` y `∨`: al poner dos tarjetas compuestas una al lado de la otra para compararlas, tocar cada ficha contrae la palabra en su signo, y quedan las dos expresiones con sus dos tablas al lado.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la tabla: un conectivo toma las respuestas de una o dos tarjetas y devuelve una respuesta; "y" contesta que sí solo cuando las dos contestan que sí, "o" contesta que sí cuando al menos una contesta que sí, incluida la parte encimada, y "no" contesta lo contrario de su tarjeta; dos tarjetas armadas distinto son la misma cuando contestan igual en las cuatro filas.

Notación: `¬p`, `p ∧ q`, `p ∨ q`, con los paréntesis del nodo 9 para el anidamiento. Símbolos nuevos: `¬`, que nace porque dibujar la tarjeta contraria deja de ser posible en cuanto la tarjeta habla de una cantidad o ya es compuesta, y un trazo que da vuelta cualquier tarjeta es más barato que una tarjeta contraria por cada tarjeta; y `∧` y `∨`, que nacen tarde, cuando hay que comparar dos tarjetas compuestas y la frase en español no dice si el "no" cubre una parte o el todo.

Casos especiales: dos aros que no se tocan dejan la conjunción vacía y hacen que "o" parezca excluyente sin serlo; un aro adentro del otro deja una región vacía; "no" sin lona no tiene respuesta; existe la tarjeta que acepta todo y la que no acepta nada.

Lo que el nodo deliberadamente no introduce: `∩`, `∪` y el complemento. Son los nombres de las mismas regiones dichas como conjuntos, y llegan en `disc.set.union_intersection`, cuando la región deja de ser algo que se ilumina y pasa a ser un cajón nuevo que hay que contar sin contar dos veces el solape.

Entradas de cheatsheet que agrega el nodo: `cs.disc.connective_regions` en la primera mitad de `symbolic` y `cs.disc.truth_tables` en la segunda.

## Generalización

Los aros se retiran en `formal`, en el momento exacto en que la tabla los reemplaza: cuando el jugador decide si dos tarjetas son la misma sin mirar ninguna lona. Hasta ahí la región iluminada sigue siendo una imagen correcta; desde ahí estorba, porque sugiere que los conjuntos tienen tamaño y son finitos.

Variantes sin ayuda visual: tarjetas con las tres fichas a la vez y paréntesis que cambian la respuesta; aros que no se tocan y aros anidados, con una fila de la tabla que nunca se usa; rasgos que parten en tres, donde "no rojo" ya no es "azul"; comparación de dos tarjetas compuestas solo por sus tablas; y tarjetas que no hablan de objetos, como las condiciones de una puerta que se abre o las reglas de un juego. Cuando el jugador explica por qué "o" no puede ser excluyente sin romper la cuenta de las cuatro regiones, la analogía se eliminó.

## Desafío

Correspondencia con las etapas de desvanecimiento de la mecánica ([H](../H-progresion-abstraccion.md)): los niveles 1 a 3 son `picture_bins` con dos aros, el 4 y el 5 son `labeled_bins` con las regiones contadas, el 6 y el 7 son `rule_card` anidada, y el 8 llega a `set_notation` por la vía de los conectivos y no por la de los conjuntos.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Los dos aros.** `concrete`, `manipulate`. Dos aros encimados, una tarjeta simple cada uno, sin fichas de conectivo. Poner cada pieza donde le toca, incluida la parte encimada y el afuera.
2. **La ficha "y".** `concrete`, `manipulate` y `recognize`. Aparece la primera ficha; la región iluminada es el solape. Misma dificultad de reparto.
3. **La ficha "o".** `concrete`, `explain`. Aparece la segunda ficha y con ella el solape iluminado una sola vez. Aparece `inclusive_or_read_as_exclusive`.
4. **La ficha "no" y la lona.** `visual`, `manipulate`. Los aros se aplanan en curvas, el trazo da vuelta la región y arrastrar piezas dentro y fuera de la lona cambia las respuestas.
5. **Cuatro regiones, cuatro filas.** `visual`, `recognize` y `apply`. Parámetros: aros que no se tocan, aros anidados y aros que cubren toda la lona; contadores por región y la tabla al costado con el hilo en las dos direcciones.
6. **Tarjetas dentro de tarjetas.** `symbolic` primera mitad, `manipulate`. Anidamiento con paréntesis y `¬` escrito adelante. Aparece `negation_distributes_over_and`.
7. **Dos tarjetas, una al lado de la otra.** `symbolic` segunda mitad, `apply`. Comparación de dos compuestas; las palabras se contraen en `∧` y `∨` para que las dos entren en pantalla.
8. **Sin piezas.** `formal` y `abstract`, `generalize`. Definición corta con voz; solo la tabla, con tarjetas sobre cosas que no son objetos.

Qué endurece cada parámetro: los aros separados rompen la única situación donde las dos lecturas de "o" coinciden y por eso se usan como trampa y no como ejemplo; los aros anidados producen una fila vacía y rompen la idea de que las cuatro filas siempre se usan; el rasgo que parte en tres rompe la lectura "no rojo es azul"; el anidamiento rompe la lectura de izquierda a derecha y obliga al paréntesis; y quitar las piezas es la prueba final de que el jugador entendió que la tabla no depende de lo que hay sobre la lona.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo es requisito de `ch.disc.which_or_did_the_sign_mean`, de nivel `regional`, donde el dato oculto no es un número sino cuál de las dos lecturas de "o" usa el cartel, y se descubre probando la única región que las separa. La cheatsheet está abierta de entrada y `cs.disc.truth_tables` y `cs.disc.connective_regions` aparecen las dos.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: dos aros encimados y cuatro tarjetas compuestas al costado, cada una con su región en miniatura. Tocar la que ilumina la parte encimada. Los distractores son la que ilumina los dos aros sin el solape, la que ilumina un aro entero y la que ilumina todo menos el solape.
- `explain`: se suelta una pieza roja y grande con la tarjeta "rojo o grande" puesta; elegir entre tres animaciones. La pieza se queda en el solape iluminado; la pieza sale despedida fuera de los dos aros; la pieza se parte y va mitad a cada aro. Tocar la que muestra lo que pasa. El distractor elegido clasifica.
- `manipulate`: lona llena, dos tarjetas simples y las tres fichas. Armar la tarjeta que deja afuera solo las piezas rojas y chicas. Más de una solución, todas aceptadas; la tabla muestra si dos soluciones distintas coinciden.
- `apply`: antes de repartir, marcar en el contador cuántas piezas va a aceptar la tarjeta recién armada, y recién después soltar. Se puntúa la cercanía.
- `generalize`: armar dos tarjetas distintas que iluminen la misma región y mostrarlo en la tabla. El juego no dice cuáles son: lo dicen las cuatro filas.
- `transfer`: en las compuertas de `csmath.bool.logic_gates`, armar con dos entradas la combinación que enciende la luz. También `prob.basic.union_intersection` (las cuatro regiones con probabilidad en vez de recuento) y `geom.class.quadrilateral_hierarchy` (el rectángulo como paralelogramo con un ángulo recto, verificado por trazo).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `inclusive_or_read_as_exclusive`, patrón `two_paths_diverge` sobre el clasificador: la lona se parte en dos copias idénticas lado a lado. En la izquierda se ilumina la región de la lectura del jugador, sin el solape; en la derecha la del juego, con el solape. Las piezas del solape son las únicas que las separan y se encienden una por una con el contador. Voz: "Estas {n} piezas cumplen las dos. ¿Cumplen 'al menos una'?". Es la de mayor severidad del nodo.
- `negation_distributes_over_and`, patrón `two_paths_diverge` sobre el clasificador: en una copia se traza la tarjeta compuesta y después se le pone el trazo encima; en la otra se le pone el trazo a cada tarjeta simple y después se las junta con `y`. Las dos regiones quedan distintas y la diferencia son las piezas que cumplen una sola de las dos tarjetas. Voz: "Esta pieza es roja pero no es grande. ¿Cumple 'rojo y grande'?".

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de estas dos, más la de `set_as_list_not_rule` del prerequisito directo, que acá reaparece como decidir la región de una pieza nueva mirando qué piezas hay ya en cada región.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `sorter_scene_two_hoops_connective`, nativa. Los dos aros con el grado de solape como parámetro, la región que se ilumina según el conectivo y el trazo de la negación que la da vuelta; parametrizada por el solape, por las composiciones de las regiones, por qué conectivo está puesto y por si está negado. Produce también las animaciones de `explain` y las miniaturas de `recognize`.
- `sorter_scene_regions_become_table_rows`, nativa. Las cuatro regiones se despegan y se acuestan como cuatro renglones con su contador, con el hilo vivo en las dos direcciones; parametrizada por el solape, por el conectivo y por el renglón resaltado.
- Reusada: `sorter_scene_rule_card_decides` (nodo 53), para las tarjetas simples y para el rebote de la pieza que va a la región equivocada.

Ninguna lleva texto rasterizado: contadores, marcas de respuesta y los signos de los conectivos los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_two_hoop_board`: `overlap` (grado de encimado, de cero a máximo; cero es el caso trampa del nivel 5); `nesting` en {cruzados, disjuntos, anidados, uno cubre la lona}; `total_range` (12 a 32); `region_counts` (cuántas piezas caen en cada una de las cuatro regiones); `off_mat_count`; `seed`.
- `gen_compound_card`: `connectives` (cuántas fichas entran, 1 hasta el nivel 5, hasta 3 desde el 6); `negation_depth` (sobre una tarjeta simple o sobre una compuesta); `nested`; `values_per_trait` (2, o 3 desde el nivel 8); `seed`.
- `gen_truth_table_query`: `asks` en {qué región, cuántas piezas, si dos tarjetas coinciden}; `rows_shown` (todas o algunas); `unused_row` (habilita el caso de aros anidados donde una fila queda vacía); `seed`.
- `gen_equivalent_pair`: arma dos tarjetas compuestas para comparar; `equivalent` (si coinciden o no); `distractor_kind` en {negación repartida, "o" excluyente, paréntesis corridos}; `seed`. Es el generador que produce los ítems donde se detectan las dos misconceptions.

**Literacy soportada:** de `short_text` a `full_text`. Arrastrar fichas, mirar qué región se ilumina, contar con el dedo apretado y elegir entre animaciones se juegan sin leer, y las capas `real` e `intuition` se juegan enteras con el sonido apagado. El mínimo es `short_text` y no `icons` porque desde el nivel 6 las tarjetas compuestas se leen como una frase corta con paréntesis y compararlas exige leerlas; las tres fichas llevan un ícono además de la palabra y la ficha `no` es un trazo, que no necesita traducción. En `full_text` las tres frases de la definición se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra la ficha `y` al espacio entre las dos tarjetas, las tarjetas se juntan, se ilumina la parte encimada y las piezas que la cumplen se deslizan hasta ahí. La escena vuelve al inicio y la barra de fichas late. La demostración de soltar una pieza y ver el rebote no se repite: es la del nodo 53 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, tolerancia de la predicción de `apply`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
