# El bol y la tarjeta (`found.count.cardinality`)

Minijuego del nodo 1 de la espina, "Contar dice cuántos hay". Mecánica principal `ledger`, secundarias `sorter` y `network_routes`; analogía `fruit_bowl_count`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/01-found.count.cardinality.md): un concepto, tres dificultades reales (correspondencia uno a uno, cardinalidad, invariancia bajo reordenamiento) más la comparación sin contar, una analogía que se retira en `visual`, un gesto que hace las tres cosas a la vez, tres pasos de desvanecimiento que terminan en la ficha. Acá se fija cómo se juega. Es el primer minijuego que ve cualquier jugador y no supone nada previo.

## Analogía

Un bol y frutas sueltas alrededor. Sobre el borde del bol, una tarjeta con puntos.

Mapa objeto → concepto: bol → colección; fruta → unidad; arrastrar una fruta al bol → contar un objeto; puente punteado entre una fruta y otra → correspondencia uno a uno; fruta que queda con el puente colgando → diferencia; tarjeta apoyada sobre el bol → número cardinal; sacudir el bol → reordenar la colección.

Punto de ruptura: `fractional_units`. Media fruta no es una unidad ni dos, y el conteo pide objetos indivisibles. Por eso la analogía se retira en la capa `visual`, cuando la fruta se aplana en marca, y las mitades se dejan enteras para `arith.frac.parts_and_ratio` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el bol en el centro, las frutas alrededor a distancia de arrastre, la tarjeta en el borde del bol. Desde el nivel 3 hay dos boles, uno a cada lado. Gestos: `drag` y `tap`, con targets grandes y radio de drop generoso ([E0](../E-mecanicas/E0-catalogo.md), [N](../N-ux-ui.md)).

- **Arrastrar una fruta al bol.** La fruta entra, suena un tic corto y se enciende un punto de la tarjeta. El mismo gesto la saca del montón de origen y tiende su puente: las tres mecánicas actúan a la vez.
- **Completar la tarjeta.** Cuando los puntos encendidos son todos, la tarjeta se ilumina entera y el bol se cierra solo. Sin cartel.
- **Meter una fruta de más.** La fruta entra igual y aparece un punto extra fuera del borde de la tarjeta, que deja de cerrar. Sacarla lo apaga.
- **Tocar dos veces la misma fruta.** El puente ya tendido late y no se dibuja otro; no hay tic. Esa fruta ya está del otro lado.
- **Arrastrar de a puñados.** Las frutas entran, pero los tics suenan de a uno y los puntos se encienden después. El desfasaje entre la mano y la cuenta es visible y audible.
- **Sacudir el bol.** Un arrastre lateral desordena las frutas y la tarjeta no cambia. Es la comprobación del invariante, está siempre disponible y no cuesta nada.
- **Tender un puente entre dos boles.** Desde el nivel 3, arrastrar de una fruta a otra las une. El bol al que le sobran frutas con el puente colgando es el que tiene más.

## Invariante matemático

Dos invariantes, uno por mecánica, y los dos se ven romperse.

`count_preserved_under_regrouping` (`ledger`): reordenar no cambia la cuenta. Se ve confirmarse cada vez que el jugador sacude un bol contado y la tarjeta aguanta. Se ve romperse solo en las animaciones de `explain`, donde una de las dos muestra la tarjeta cambiando al reordenar: eso es lo que la delata.

`every_object_exactly_one_bin` (`sorter`): cada objeto recibe un número y uno solo. Se ve romperse de dos maneras distintas, y las dos son físicas: el puente que late al intentar contar dos veces, y la fruta que queda sola en el borde con su línea colgando cuando se saltea una.

`connections_independent_of_drawing` (`network_routes`) sostiene la comparación: mover los boles no cambia quién está emparejado con quién. Los puentes se estiran y siguen unidos.

Un movimiento válido pero inútil —sacudir el bol tres veces seguidas, tender un puente y deshacerlo— no rompe nada y no recibe respuesta. Explorar es gratis.

## Representación visual

Primitiva dominante `partition`, de apoyo `relate` ([H](../H-progresion-abstraccion.md)).

- `real`: la mesa con chicos y el bol. Solo se mira y se responde con un toque.
- `intuition`: el reparto se detiene antes de terminar y se eligen dos desenlaces dibujados. Ningún número.
- `concrete`: bol, frutas, tarjeta de puntos, puentes punteados. Nada escrito.
- `visual`: el bol se aplana en una región y las frutas en marcas iguales, todas del mismo tamaño aunque las frutas no lo fueran. Las marcas se reagrupan dentro de la región sin que cambie cuántas hay. La tarjeta se contrae en una ficha con el número. Entre dos regiones, las líneas punteadas quedan.

El nodo no tiene capas `symbolic`, `formal` ni `abstract`, y esa cota es del grafo, no de este archivo.

## Transición simbólica

Tres pasos sobre el mismo objeto, con ids estables, cada uno disparado por un gesto:

1. Fruta → marca: la primera vez que el jugador sacude un bol ya contado y la tarjeta aguanta, las frutas se aplanan en marcas iguales dentro de la región.
2. Marcas → ficha: al apoyar la tarjeta sobre la región, las marcas se juntan en el borde y la tarjeta se contrae en una ficha con el número. Durante el morph los puntos y el dígito comparten posición y se ven los dos.
3. Ficha portable: la ficha se arranca de una región y se apoya en otra. Si la cantidad no coincide, flota y vuelve.

**El desvanecimiento termina en la ficha.** No hay operadores ni expresión: un número solo no es una cuenta. El primer operador de la espina, `+`, lo recoge `arith.add.displacement` cuando haya dos cantidades que juntar.

## Concepto formal

El nodo no llega a `formal` y no hay definición escrita en ninguna capa. Lo que queda al final es una ficha con un número apoyada sobre una colección, y tres cosas que el jugador sostiene con las manos sin que nadie se las enuncie: la cuenta no cambia al reordenar, no depende de por dónde se empiece y no depende del tipo de objeto. El enunciado de todo eso llega mucho después, con notación que lo aguante, en `disc.count.sum_rule` y `prob.stat.frequency_table`.

## Generalización

La analogía se retira dentro del propio minijuego, en `visual`: la fruta se aplana en marca y no vuelve. Retirarla temprano es lo correcto, porque una unidad cualquiera dibujada siempre como manzana enseña a contar manzanas.

Variantes sin la fruta: piedras, conchas, marcas sobre una barra, cajones ocupados de un `sorter`, puentes que salen de una isla. Disposiciones: fila, montón, desparramado, dos grupos separados. Tamaños muy distintos dentro de la misma colección, para que el área no funcione como atajo. Cuando el jugador apoya la ficha correcta sobre cualquiera de esas colecciones sin pedir el bol, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguno de los dos aplica entero. El ejemplo de cofres empieza en `chest_key` y este nodo no la usa. El ejemplo de frutas arranca en `alg.sys.two_by_two` y de este nodo toma el objeto, no los niveles: la fruta que allá vale como incógnita acá vale como unidad, y el minijuego la retira mucho antes.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una fruta, un tic.** `concrete`, `manipulate`. Frutas iguales en fila, rango de cantidad chico, tarjeta de puntos. La demostración se muestra acá y en ningún otro nivel.
2. **El bol se sacude.** `concrete`, `explain` y `manipulate`. Misma dificultad numérica. Aparece el gesto de sacudir y las dos animaciones de reordenamiento.
3. **Dos boles, un puente.** `concrete`, `apply`. Dos colecciones y ningún número pedido: se resuelve tendiendo puentes. Los objetos empiezan a tener tamaños distintos.
4. **Marcas y ficha.** `visual`, `manipulate` y `recognize`. Misma dificultad numérica; la fruta se aplana y la tarjeta se contrae en ficha.
5. **Otros objetos.** `visual`, `generalize`. Piedras, conchas, marcas y cajones, en disposiciones desordenadas y con rango de cantidad mayor.
6. **Los puentes de una isla.** `visual`, `transfer`. La red de `graph.basic.graph_and_paths`: tocar la isla que tiene tantos puentes como la tarjeta, y arrastrar las islas para ver que la cuenta no se mueve.

Qué endurece cada parámetro: el rango de cantidad obliga a agrupar en vez de recorrer de a uno; la disposición desordenada rompe la estrategia de contar de izquierda a derecha; los tamaños distintos rompen la lectura por área; cambiar el objeto separa la cantidad del tipo de cosa contada; contar conexiones en vez de cosas separa la cantidad del objeto físico.

Desafíos de olimpíada: ninguno de [S](../S-desafios/S0-desafios.md) requiere este nodo, y a nivel 0 no corresponde. El nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: tres pilas —una en fila, una apilada, una desparramada— y una tarjeta de cuatro puntos. Tocar la pila de cuatro. La pila desparramada tiene tres frutas y ocupa más lugar que la de cuatro.
- `explain`: el mismo bol de cinco en dos animaciones. En una las frutas se reordenan y la tarjeta se queda en cinco; en la otra se reordenan y la tarjeta pasa a seis. Tocar la que miente.
- `manipulate`: bol vacío y tarjeta de seis puntos. Arrastrar frutas de a una hasta que la tarjeta se ilumine.
- `apply`: un bol con siete frutas chicas y otro con cinco frutas grandes. Tender puentes y tocar el bol al que le sobran. Sin tarjetas y sin pedir ningún número.
- `generalize`: la misma cantidad presentada como conchas desparramadas, como muescas en una barra y como cajones ocupados. Apoyar la ficha correcta sobre cada una.
- `transfer`: en la red de islas, tocar la isla con tantos puentes como marca la tarjeta, y después arrastrar esa isla al otro extremo y comprobar que la tarjeta sigue valiendo.

**Misconceptions esperadas:** ninguna. El nodo declara `misconceptions: []` y la lista vacía es correcta: una entrada de [L0](../L-modelo-errores/L0-taxonomia.md) es una regla ejecutable sobre expresiones, y acá no hay expresiones. Los desvíos de este nivel son de coordinación entre la mano, el ojo y la serie numérica, no reglas razonables aplicadas fuera de su dominio, y por eso ninguno dispara un patrón de explicación. Cada uno tiene su consecuencia física y la interacción nunca se corta:

- contar dos veces: el puente late, no hay tic;
- saltear: al apoyar la tarjeta queda una fruta sola con su línea colgando y la tarjeta no se apoya;
- arrastrar de a puñados: los tics van más lento que la mano y el desfasaje se ve;
- nombrar el último objeto en vez de la colección: esa fruta se eleva sola, el resto se atenúa y le aparece una tarjeta de un punto; la escena vuelve con el bol entero resaltado;
- sobrellenar: un punto extra fuera del borde.

Los distractores de `recognize` y `explain` se generan de esos desvíos —una y dos unidades de diferencia, la colección que ocupa más lugar con menos objetos, el reordenamiento que cambia la tarjeta—, no al azar.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `ledger_pair_fruit_to_fruit`, nativa. Las dos colecciones del jugador y los puentes punteados que se tienden de a uno, con la marca sobrante resaltada al final; gramática `partition` con `relate` de apoyo. Parametrizada por las dos cantidades, sostiene los niveles 3 y 6.
- `sorter_number_card_on_bin`, nativa. Los objetos caen de a uno en su cajón y la tarjeta se apoya sobre el cajón lleno; gramática `partition`. Parametrizada por los cajones y las tarjetas, produce también las dos animaciones de `explain`, porque reordenar dentro del cajón y cambiar o no la tarjeta es un parámetro suyo.
- Ninguna lleva texto rasterizado: los puntos y los dígitos los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_collection`: `unit_kind` en {fruta, piedra, concha, muesca, cajón, puente}; `count_range` (chico en los niveles 1 a 4, mayor en el 5 y 6); `layout` en {fila, montón, desparramado, dos grupos}; `size_spread` (uniforme hasta el nivel 2, mezclado desde el 3); `seed`.
- `gen_number_card`: `value_range`; `card_form` en {puntos, marcas, dígito} (puntos hasta el nivel 3, dígito desde el 4); `distractor_offsets` (una y dos unidades, más la colección que ocupa más lugar con menos objetos); `seed`.
- `gen_island_map`: `islands`; `bridges_per_island_range`; `layout_jitter`, que reubica las islas sin cambiar los puentes; `seed`. Solo en el nivel 6.

**Literacy soportada:** de `none` a `full_text`, con mínimo `none`. El minijuego entero se juega sin leer y sin un solo dígito hasta el nivel 4, donde el dígito llega montado sobre los puntos que el jugador ya venía usando y es un ícono con historia, no texto ([Q](../Q-edad-universal.md)). En `full_text` no se agrega nada escrito: no hay definición que mostrar.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra una fruta al bol —tic, un punto encendido— y después una segunda. La escena vuelve al inicio y la primera fruta late una vez. Se repite solo si el jugador se queda quieto. El gesto de sacudir tiene su propia demostración en el nivel 2, y el de tender un puente en el nivel 3; ninguno se repite en nodos posteriores, porque son los mismos gestos.

**Sin constantes propias.** Tiempo objetivo, factor de perfiles sin lectura, umbrales de ítems por verbo y espera de la demostración viven en [K](../K-evaluacion.md).
