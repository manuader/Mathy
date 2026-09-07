# Los cuencos de fruta (`found.count.cardinality`)

Minijuego del nodo 1 de la espina, "Contar dice cuántos hay". Mecánica principal `ledger`, secundarias `network_routes` y `sorter`; analogía `fruit_bowl_count`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/01-found.count.cardinality.md): un concepto, tres dificultades reales (uno a uno, cardinalidad, conservación), una analogía que el niño reconoce sin palabras, un gesto (llevar una fruta a su fila y ver el puente), cuatro morphs hasta el numeral, la barra con marcas como visualización dominante, retiro en `visual`. Acá se fija cómo se juega.

## Analogía

Una mesa con dos cuencos de fruta y, entre ellos, una franja con dos filas vacías. Frutas de dos clases, desordenadas. Más tarde, una canasta de donde sacar más y una tarjeta con puntos sobre cada cuenco.

Mapa objeto → concepto: cuenco → colección; fruta → unidad; fila del cuenco → la colección ordenada para contar; puente entre una fruta y la de enfrente → correspondencia uno a uno; fruta sin puente → diferencia; tic al llegar a la fila → un paso del conteo; tarjeta de puntos sobre el cuenco → número cardinal; tarjeta con numeral → el mismo número, escrito.

`ledger` aporta "reordenar no cambia cuántas hay"; `network_routes` aporta "una por una, ninguna dos veces"; `sorter` aporta "la tarjeta va sobre el cuenco entero". Punto de ruptura de la analogía: unidades fraccionarias, que este nodo nunca toca. Se retira en `visual`, cuando la fila se aplana en marcas ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: los dos cuencos en los extremos, la franja de dos filas en el centro, la canasta abajo cuando el nivel la pide, las tarjetas sobre los cuencos. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). Ningún gesto fino: la zona de drop de una fila es la fila entera.

- **Arrastrar una fruta a su fila.** La fruta se acomoda en el primer hueco libre y suena un tic. Si hay una fruta enfrente en la otra fila, se dibuja un puente corto entre las dos.
- **Arrastrar una fruta enfrente de un hueco.** No hay puente. La fruta queda, pero brilla el cuenco de donde vino: ese cuenco tiene más. Es la comparación sin números.
- **Tocar la tarjeta del cuenco.** Sus puntos se alinean uno sobre cada fruta de la fila y vuelven. Sirve para verificar sin contar de nuevo.
- **Arrastrar frutas de la canasta a un cuenco vacío.** Cada una suma un punto a la tarjeta del cuenco. Cuando la tarjeta iguala a la tarjeta objetivo, se ilumina. Una fruta de más apaga la iluminación y la fruta sobrante late: se puede devolver a la canasta.
- **Poner una tarjeta sobre una colección.** Desde `visual`: hay tres tarjetas y una colección; arrastrar la tarjeta que le corresponde. Una tarjeta equivocada se desliza fuera de la colección.
- **Mover las frutas dentro del cuenco.** Siempre permitido. La tarjeta no cambia, y esa quietud es el invariante.

Nada de esto cambia en la capa `visual`: la fila es una barra con marcas, el puente es una línea corta, el tic sigue sonando, y el numeral de la tarjeta se toca para ver los puntos.

## Invariante matemático

Tres invariantes, uno por mecánica.

`count_preserved_under_regrouping` (`ledger`): mover, apilar o separar las frutas no cambia la tarjeta. Se ve romperse solo en la animación que miente de `explain`, donde la tarjeta cambia al reordenar; el jugador tiene que señalarla como mentira. Nunca se rompe por un gesto del jugador, porque el juego no permite que reordenar cambie la cuenta.

`connections_independent_of_drawing` (`network_routes`): cada fruta tiene a lo sumo un puente, y los puentes no dependen de cómo estén acomodadas las filas. Se ve romperse cuando el jugador intenta un segundo puente sobre la misma fruta: la segunda se desliza al final y sobra.

`every_object_exactly_one_bin` (`sorter`): cada colección tiene exactamente una tarjeta, y la tarjeta es de la colección, no de una fruta. Se ve romperse cuando el jugador suelta la tarjeta sobre una sola fruta: la tarjeta se desliza hasta el borde del cuenco, que es el único lugar donde entra.

Un movimiento válido pero inútil (reordenar sin necesidad, emparejar frutas del mismo cuenco entre sí) no rompe nada: el juego lo permite, la tarjeta no cambia, y si se repite el juego hace latir la fila de enfrente como empujón suave.

## Representación visual

Primitiva dominante `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: la mesa con los dos cuencos, frutas rodando, sin filas ni tarjetas. Solo se mira y se toca un cuenco.
- `intuition`: la misma mesa, las frutas de un cuenco se van a reacomodar; dos desenlaces dibujados y después el real. Sin filas todavía.
- `concrete`: la franja con dos filas, los puentes, el tic, la tarjeta con puntos. Nada escrito: la tarjeta tiene puntos.
- `visual`: cada fila se aplana en una barra con marcas del mismo ancho, dos barras alineadas por el inicio, los puentes son líneas cortas, la diferencia es el tramo que sobra, y la tarjeta muestra el numeral. Las colecciones que se cuentan cambian de piel (frutas, piedras, conchas, marcas) sin que cambie la barra.

El nodo no tiene `symbolic` ni `formal`: `layers` termina en `visual`.

## Transición simbólica

Cuatro pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Fruta → marca: al emparejar por primera vez dos cuencos completos sin sobrante en `concrete`, cada fruta se aplana en una marca sobre su barra y los puentes se contraen en líneas cortas.
2. Puntos de la tarjeta → puntos alineados: al tocar la tarjeta, sus puntos se ordenan y se posan uno sobre cada marca, y vuelven.
3. Puntos → numeral: la primera vez que el jugador pone la tarjeta correcta sobre una colección desparramada sin emparejar, los puntos de la tarjeta se contraen en el numeral, que conserva tamaño y color. Mantener tocada la tarjeta muestra los puntos de nuevo.
4. Tarjeta → etiqueta de la barra: cuando dos barras emparejadas tienen numeral, las tarjetas se despegan del cuenco y quedan en el extremo de cada barra.

Hasta acá llega: no hay signos, no hay igual, no hay `0`. La barra etiquetada es lo que el nodo 2 acuesta sobre el agua.

## Concepto formal

Lo que queda al final, sin enunciarse todavía, porque el nodo no tiene `formal`: el número de una colección es el que corresponde a la última cosa tocada cuando cada cosa se tocó una sola vez; no depende del orden ni de la disposición; dos colecciones tienen el mismo número exactamente cuando se emparejan sin sobrante; agregar una cosa cambia la tarjeta en un punto. La única notación es el numeral como etiqueta, nacido del problema de llevar una cantidad a un cuenco que no está en la mesa. El cuenco vacío queda sin tarjeta: el `0` no es de este nodo.

## Generalización

La fruta se retira en `visual`, cuando la barra con marcas hace todo el trabajo. La señal de que se puede retirar es que el jugador pone tarjetas sobre colecciones sin emparejarlas y sin tocar de a una.

Variantes sin fruta: piedras y conchas desparramadas o apiladas; objetos de distinto tamaño con la misma cantidad; dos colecciones de objetos distintos con la misma tarjeta; marcas sobre barras de distinto grosor. Y la que separa tamaño de cantidad: tres piedras grandes frente a cinco chicas, tarjeta para cada una. Cuando el jugador resuelve todo eso y elige la animación que miente sin dudar, la analogía se eliminó dentro de `visual`, que es hasta donde el nodo llega.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguna directa. El ejemplo B de H (sistemas con frutas) empieza con tres manzanas y un total, y ese punto de partida supone este nodo entero; los cuencos son lo que hay antes de la etapa 1.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Un par por fruta.** `concrete`, `manipulate`. Dos cuencos, una fruta por clase, filas y puentes. Comparar emparejando; sin tarjetas. Cantidades chicas y una diferencia visible.
2. **El tic y la tarjeta.** `concrete`, `manipulate` y `recognize`. Aparece la tarjeta con puntos sobre cada cuenco y la canasta. Llenar un cuenco hasta que su tarjeta iguale a la objetivo.
3. **Mover no cambia.** `concrete`, `explain`. Parámetros iguales; el ítem es elegir la animación que miente. Cada cuenco se reordena de tres maneras distintas.
4. **La tarjeta viaja.** `concrete` hacia `visual`, `apply`. Un cuenco desaparece de la mesa y hay que llevar "lo mismo" a otro cuenco con la tarjeta; los puntos se contraen en numeral. Es el nivel donde la fila se vuelve barra.
5. **Más frutas, más mezcla.** Parámetros: cantidades mayores, tres clases de fruta mezcladas en un cuenco, disposición desparramada. El jugador tiene que emparejar por clase y poner la tarjeta correcta.
6. **Piedras, conchas, marcas.** `visual`, `generalize`. Los objetos cambian de piel; barras de distinto grosor; tamaño distinto de cantidad.

Qué endurece cada parámetro: la cantidad obliga a confiar en la tarjeta en vez de reconocer la pila de un vistazo; la mezcla de clases obliga a decidir qué se cuenta; la disposición desparramada rompe la lectura "fila larga es más"; el tamaño de los objetos separa cantidad de espacio ocupado.

Desafíos de olimpíada: [S](../S-desafios/S0-desafios.md) tiene rompecabezas sin leer para los niveles 0 a 2, pero ninguno declara este nodo entre sus requisitos; los seis del catálogo inicial empiezan en área y en reparto. Hasta que exista uno de conteo con datos ocultos, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin texto:

- `recognize`: tres pilas (cuatro, cinco y seis frutas) y una tarjeta con cinco puntos que muestra el guía; tocar la pila de cinco.
- `explain`: un cuenco con seis frutas; dos animaciones: en una se apilan y la tarjeta sigue en seis; en la otra se apilan y la tarjeta baja a cuatro. Tocar la que miente.
- `manipulate`: cuenco vacío, tarjeta objetivo con siete puntos, canasta; arrastrar siete frutas, una por una, hasta que la tarjeta se ilumina.
- `apply`: un cuenco con cinco manzanas y otro con siete peras, mezcladas; emparejar y tocar el cuenco al que le sobran.
- `generalize`: cuatro colecciones (peras apiladas, piedras desparramadas, conchas en fila, marcas en una barra), tres con la misma cantidad; poner la tarjeta correcta sobre cada una.
- `transfer`: en la red de islas de `graph.basic.graph_and_paths`, tocar la isla que tiene tantos puentes como puntos tiene la tarjeta.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo declara `misconceptions: []`. Lo que el diseño prevé sin catalogar, y cómo se ve:

- **Reordenar cambia la cantidad**, el distractor de `explain`. Si se elige, el juego reproduce el reordenamiento sobre el cuenco del jugador con las marcas contadas por el tic y muestra la tarjeta quieta; después vuelve a preguntar con otra variante.
- **Puente doble**: la segunda fruta se desliza al final y sobra; el jugador continúa.
- **Fruta salteada**: la tarjeta no se ilumina; la fruta sin puente late; el jugador continúa.

Los tres corren como `replay_on_mechanic` sobre `ledger` sin entrada en `misconceptions.yaml`, y por eso no clasifican ni bloquean `ready`; si el playtest de [Q](../Q-edad-universal.md) los muestra sistemáticos, se catalogan.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `ledger_pair_fruit_to_fruit`, nativa. Dos filas de objetos concretos, un puente por par trazado con retardo corto, el objeto sin pareja marcado; gramática `partition`. Parametrizada por las dos cantidades, produce la mecánica de los niveles 1, 3 y 5 y las dos animaciones de `explain`.
- `sorter_number_card_on_bin`, nativa. La tarjeta viaja hasta el cuenco y cuenta desde cero mientras los objetos entran de a uno; parametrizada por la lista de cuencos y la lista de tarjetas. Es la escena de los niveles 2, 4 y 6 y de `recognize`.
- No hay clips pre-renderizados: las dos escenas tienen más variantes de parámetros de las que un clip por variante toleraría, y ambas son la mecánica misma. El numeral lo dibuja el runtime; los objetos son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_fruit_bowls`: `count_a` y `count_b` (de 1 a 4 en los niveles 1 a 3, de 1 a 6 en el 4, de 3 a 9 en el 5 y 6); `difference` (de 1 a 2 en el nivel 1, cualquiera después, incluido cero desde el nivel 3); `kinds` (una clase por cuenco hasta el nivel 4, hasta tres mezcladas en el 5); `arrangement` en {row, pile, scattered} (solo row y pile hasta el nivel 3); `seed`.
- `gen_dot_card`: `target` (mismo rango que `count_a`); `distractor_offsets` (más uno y menos uno en `recognize`; desde el nivel 5 también más dos); `numeral` (falso hasta el nivel 3, verdadero desde el 4).
- `gen_object_set`: `skin` en {fruit, pebble, shell, mark} (solo fruit hasta el nivel 5); `size_variance` (cero hasta el nivel 5); `bar_thickness` (solo en el nivel 6); `count` (de 2 a 9).

**Literacy soportada:** `none` en todos los niveles; es el único valor que el nodo admite, por ser nivel 0. No hay etiquetas, ni fichas, ni definición escrita. Un adulto ve exactamente lo mismo que un niño, con subtítulos apagados por defecto.

**Instrucción por demostración:** la primera vez, una mano fantasma toma una manzana, la lleva a la fila de arriba, toma una pera, la lleva enfrente, y el puente se dibuja; repite con un segundo par y desaparece. La escena vuelve al inicio y la primera manzana late. Se repite solo si el jugador se queda quieto. La demostración de la tarjeta (nivel 2) es nueva y se muestra una vez: la mano lleva una fruta de la canasta al cuenco y la tarjeta gana un punto. Ninguna demostración vuelve a mostrarse en los nodos siguientes: el libro de cuentas de `arith.add.displacement` es este mismo ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
