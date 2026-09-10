# El riel de los cuencos (`found.cmp.bigger_smaller`)

Minijuego del nodo 45 de la espina, "Dónde hay más, dónde menos". Mecánica principal `sorter`, secundaria `ledger`; analogía `fruit_bowl_count`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/45-found.cmp.bigger_smaller.md): un concepto, cuatro dificultades reales (más es una relación, comparar sin mirar el bulto, la transitividad, el empate como tercer desenlace), una analogía que el niño reconoce sin palabras, un gesto (bajar dos cuencos a la franja y guardarlos en su hueco), cuatro morphs hasta la escalera de numerales, el riel como visualización dominante, retiro en `visual`. Acá se fija cómo se juega.

## Analogía

Una mesa con tres cuencos de fruta desparejos, una franja de dos filas entre ellos y, contra la pared, una repisa inclinada con huecos que crecen de izquierda a derecha. Cada cuenco lleva la tarjeta de conteo que nació en el nodo 1.

Mapa objeto → concepto: cuenco → colección; fruta → unidad; franja de dos filas → el duelo; puente entre una fruta y la de enfrente → correspondencia uno a uno; fruta sin puente → el lado que tiene más; ninguna fruta sin puente → empate; hueco del riel → posición en el orden; riel entero → el orden; cinta entre dos cuencos → una comparación ya hecha.

`ledger` aporta el duelo: emparejar es la única forma de comparar sin contar. `sorter` aporta el riel: cada cuenco entra en exactamente un hueco y los huecos están en fila, que es lo que convierte una clasificación en un orden. Punto de ruptura de la analogía: unidades fraccionarias, que este nodo nunca toca. Se retira en `visual`, cuando los cuencos se aplanan en barras y el riel se vuelve una escalera ([G0](../G-analogias/G0-reglas.md)).

`balance_tilted` apunta también a este nodo y no se usa: una balanza compara peso, y una piedra grande pesa más que tres chiquitas, que es exactamente el error que el minijuego tiene que desarmar. La balanza inclinada vuelve, con todo derecho, en `prealg.ineq.compare_expressions`.

## Mecánica central

Superficie: los cuencos en la mitad inferior, la franja de dos filas en el centro, el riel apoyado en la mitad superior con sus huecos crecientes. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). Ningún gesto fino: la zona de drop de un hueco es el hueco entero.

- **Tocar dos cuencos.** Bajan a la franja, sus frutas se acomodan enfrentadas y se dibujan los puentes. La fruta sin puente late y su cuenco brilla. El duelo está siempre disponible y no cuesta nada.
- **Arrastrar un cuenco a un hueco del riel.** Se queda donde lo suelten. No hay rechazo.
- **Soltar un cuenco en el hueco equivocado.** El riel se dibuja con el escalón roto: un tramo que baja donde todos los demás suben, iluminado. El estado sigue siendo un riel válido y el jugador puede sacarlo.
- **Empatar.** Cuando el emparejamiento no deja sobrante, los dos cuencos quedan iluminados iguales y el hueco se ensancha para recibir a los dos. El riel admite dos cuencos en el mismo escalón.
- **Tocar la tarjeta de un cuenco.** Sus puntos se posan uno sobre cada fruta y vuelven. Sirve para verificar sin volver a emparejar.
- **Mover las frutas dentro de un cuenco.** Siempre permitido. Ni la tarjeta ni el lugar en el riel cambian, y esa quietud es el invariante.
- **Volver a bajar dos cuencos que ya tienen cinta.** El juego los empareja igual, pero la cinta late: la comparación ya estaba hecha. Es el empujón suave que enseña a no comparar de más.

Nada de esto cambia en la capa `visual`: el cuenco es una barra con marcas, el puente es una línea corta, el riel es la escalera, y el numeral de la tarjeta se toca para ver los puntos.

## Invariante matemático

Dos invariantes, uno por mecánica.

`every_object_exactly_one_bin` (`sorter`): cada cuenco ocupa exactamente un hueco del riel, y los huecos están ordenados. En el riel el invariante deja de ser una partición y pasa a ser un orden: no hay cuenco sin lugar ni cuenco en dos lugares, y el lugar de cada uno se decide comparándolo con sus vecinos. Se ve romperse cuando el jugador deja un escalón que baja: la línea que une los extremos se quiebra y ese tramo se ilumina.

`count_preserved_under_regrouping` (`ledger`): mover, apilar o separar las frutas no cambia ni la tarjeta ni quién tiene más. Se ve romperse solo en la animación que miente de `explain`, donde el mismo par de cuencos deja sobrante de un lado y después del otro. Nunca se rompe por un gesto del jugador, porque el juego no permite que reordenar cambie el duelo.

Un movimiento válido pero inútil (comparar dos cuencos que ya tienen cinta, o volver a emparejar un duelo resuelto) no rompe nada: el juego lo permite, el resultado es el mismo, y si se repite la cinta late.

## Representación visual

Primitiva dominante `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: la mesa con los tres cuencos y la repisa con sus huecos. Solo se mira y se toca el cuenco que parece ir en el hueco ancho.
- `intuition`: dos escenas. En la primera, dos cuencos se van a emparejar y hay **tres** desenlaces dibujados (sobra a la izquierda, sobra a la derecha, no sobra nada). En la segunda, A ya le ganó a B y B a C, y una mano acerca A y C: dos desenlaces. El jugador elige y después ve.
- `concrete`: los cuencos, la franja con los puentes, el riel con sus huecos, las tarjetas con puntos y después con numeral. Nada escrito.
- `visual`: cada cuenco se aplana en una barra con marcas del mismo ancho; las barras se apoyan una sobre otra alineadas por el inicio, y sus extremos derechos quedan unidos por una línea quebrada. Si el riel está en orden, esa línea solo sube: es la escalera. La diferencia entre dos barras vecinas es la altura del escalón, y los huecos del riel se atenúan porque la escalera ya dice lo mismo.

El nodo no tiene `symbolic` ni `formal`: `layers` termina en `visual`.

## Transición simbólica

Cuatro pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Cuenco → barra: al resolver el primer duelo emparejando dos cuencos completos en `concrete`, las dos filas se aplanan en barras con marcas y los puentes se contraen en líneas verticales cortas. Es el morph del nodo 1 y no se vuelve a narrar.
2. Duelo → escalón: al terminar un duelo, las dos barras se alinean por el inicio y el tramo que sobresale se ilumina y se separa un poco. El sobrante pasa a ser un pedazo de barra con principio y fin.
3. Riel → escalera: al completar el riel por primera vez, los extremos derechos de las barras se unen con una línea quebrada, que se dibuja de un trazo si todo sube y se detiene en el escalón roto si no.
4. Tarjeta → escalón numerado: las tarjetas se despegan de los cuencos y quedan pegadas al extremo de cada barra, en su escalón. Lo que queda es una fila de numerales en orden, el objeto que el nodo 2 acuesta sobre el agua.

Hasta acá llega: no hay signos, no hay `<` ni `>`, no hay igual. Lo único que el nodo fija además es una convención de lectura: la fila va de menos a más de izquierda a derecha, y todo el juego la respeta después.

## Concepto formal

Lo que queda al final, sin enunciarse todavía, porque el nodo no tiene `formal`: entre dos colecciones pasa exactamente una de tres cosas, que una tenga más, que tenga menos o que tengan lo mismo; si la primera tiene más que la segunda y la segunda más que la tercera, la primera tiene más que la tercera; tener más no depende del tamaño de las cosas ni de cómo estén acomodadas; y agregar una cosa sube la barra exactamente un escalón. No hay ninguna notación nueva: `<` y `>` nacen en `prealg.ineq.compare_expressions`, cuando lo que se compara son expresiones que no se pueden poner enfrente. Por la misma razón el nodo no declara ninguna entrada de cheatsheet: todavía no hay nada escrito que guardar.

## Generalización

La fruta se retira en `visual`, cuando la escalera de barras hace todo el trabajo. La señal de que se puede retirar es que el jugador ubica un cuenco nuevo en el riel con dos duelos, sin bajar todos los pares.

Variantes sin fruta: cinco colecciones en vez de tres; diferencias de una sola unidad, donde el bulto no ayuda; piedras y conchas desparramadas o apiladas; objetos de distinto tamaño con la misma cantidad; barras de distinto grosor; dos empates en el mismo riel; y el riel con las cintas puestas, donde comparar de más está permitido pero no hace falta. Cuando el jugador ordena cinco colecciones sin compararlas todas contra todas, acepta el empate sin forzar un ganador y distingue tamaño de cantidad sin dudar, la analogía se eliminó dentro de `visual`, que es hasta donde el nodo llega.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguna directa. El ejemplo B de H empieza con tres manzanas y un total, y ese punto de partida supone este nodo y el nodo 1 enteros.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cuál tiene más.** `concrete`, `manipulate`. Dos cuencos, la franja y los puentes; sin riel. Cantidades chicas y diferencia visible.
2. **El riel de tres.** `concrete`, `manipulate` y `recognize`. Aparece el riel con tres huecos y la tarjeta viaja con el cuenco. Mismas cantidades.
3. **Ni más ni menos.** `concrete`, `explain`. Mismos parámetros; aparece el empate y el hueco que se ensancha. El ítem es elegir la animación que miente.
4. **La cinta.** `concrete`, `apply`. Un duelo resuelto queda anotado con una cinta y no hace falta repetirlo. Mismos rangos; lo que cambia es cuántos duelos hacen falta.
5. **Cinco cuencos, diferencias de a una.** Parámetros: más colecciones, diferencias de una unidad, disposición desparramada.
6. **La escalera.** `visual`, `generalize`. Los cuencos se aplanan en barras y aparece la escalera; los objetos cambian de piel, hay tamaños distintos y barras de distinto grosor.

Qué endurece cada parámetro: la cantidad de colecciones obliga a usar la transitividad en vez de comparar todos contra todos; la diferencia de una unidad rompe la lectura de un vistazo; la disposición desparramada rompe "fila larga es más"; el tamaño de los objetos separa cantidad de espacio ocupado; el grosor de las barras hace lo mismo ya sin objetos.

Desafíos de olimpíada: el nodo participa en `ch.arith.pair_them_to_compare` de [S](../S-desafios/S0-desafios.md), donde dos grupos desparramados hay que emparejarlos para decidir cuál tiene más y cuántas sobran. La cheatsheet está abierta de entrada, aunque este nodo todavía no aporte ninguna entrada.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin texto:

- `recognize`: tres canastas con cuatro, seis y siete piedras y un riel cuya punta gruesa está a la derecha; tocar la canasta que va en la punta gruesa. Distractores: la de seis y una canasta de tres piedras grandes.
- `explain`: dos animaciones sobre los mismos dos cuencos (cinco manzanas y siete peras); en una el emparejamiento deja dos peras sin puente, en la otra deja dos manzanas. Tocar la que miente. El distractor elegido no clasifica: en nivel 0 el error todavía es perceptivo y no hay entrada en el catálogo.
- `manipulate`: tres canastas de tres, cinco y ocho; arrastrarlas al riel hasta dejarlas de la que tiene menos a la que tiene más. Una canasta fuera de lugar se corre sola un poco y late.
- `apply`: dos canastas desparramadas de nueve y once, sin filas; emparejar y tocar la que sobra, sin contar en voz alta.
- `generalize`: cuatro colecciones (tres piedras grandes, cinco chiquitas, cinco conchas, cinco marcas en una barra gruesa); ordenarlas en el riel, con tres compartiendo escalón.
- `transfer`: en `geom.tri.inequality_shortest_path`, dos caminos entre las mismas dos islas, uno recto y otro quebrado; tocar el más corto emparejando tramo con tramo, sin medir.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo declara `misconceptions: []`. Lo que el diseño prevé sin catalogar, y cómo se ve:

- **Ordenar por tamaño del objeto.** El juego arma el riel como quedó, baja los dos cuencos del escalón roto a la franja y los empareja a la vista: el sobrante aparece del otro lado.
- **Ordenar por lo largo de la fila.** Mismo replay, con las frutas juntándose antes de emparejar.
- **Forzar un ganador en un empate.** El hueco se ensancha de nuevo y las dos barras quedan del mismo largo, superpuestas un instante.

Los tres corren como `replay_on_mechanic` sobre `ledger` sin entrada en `misconceptions.yaml`, y por eso no clasifican ni bloquean `ready`; si el playtest de [Q](../Q-edad-universal.md) los muestra sistemáticos, se catalogan.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `sorter_rail_orders_by_amount`, nativa. Los cuencos viajan a sus huecos con un retardo corto por cuenco, el conteo de cada uno sube desde cero al llegar, y el que quedó en el escalón roto se sacude sin salirse; gramática `partition`. Parametrizada por la lista de cantidades y la semilla, produce la mecánica de los niveles 2, 4 y 5 y los ítems de `recognize` y `manipulate`.
- `ledger_bars_compare_overhang`, nativa. Dos barras alineadas por el inicio, un puente por par con retardo corto, el tramo que sobresale marcado con una llave de longitud y el lado ganador iluminado; parametrizada por las dos cantidades. Es la escena de los niveles 1, 3 y 6, de las dos animaciones de `explain` y de los ítems de `apply`.
- No hay clips pre-renderizados: las dos escenas son la mecánica misma y tienen más variantes de parámetros de las que un clip por variante toleraría. El numeral de la tarjeta lo dibuja el runtime; los objetos son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_bowl_rail`: `bowls` (cantidad de colecciones: 2 en el nivel 1, 3 en los niveles 2 a 4, hasta 5 desde el 5); `counts` (rango de 1 a 6 hasta el nivel 4, de 3 a 12 desde el 5); `min_gap` (diferencia mínima entre dos colecciones vecinas: 2 hasta el nivel 4, 1 desde el 5); `ties` (cantidad de empates, 0 hasta el nivel 2, hasta 2 desde el 3); `ribbons` (mostrar las cintas de duelos resueltos, falso hasta el nivel 3); `seed`.
- `gen_compare_pair`: `count_a` y `count_b`; `arrangement` en {row, pile, scattered} (solo row y pile hasta el nivel 4); `lying` (cuál de las dos animaciones de `explain` invierte el sobrante); `seed`.
- `gen_object_set`, reusado del nodo 1: `skin` en {fruit, pebble, shell, mark} (solo fruit hasta el nivel 5); `size_variance` (cero hasta el nivel 5); `bar_thickness` (solo en el nivel 6); `count`.

**Literacy soportada:** `none` en todos los niveles; es el único valor que el nodo admite, por ser nivel 0. No hay etiquetas, ni fichas, ni definición escrita. Un adulto ve exactamente lo mismo que un niño, con subtítulos apagados por defecto.

**Instrucción por demostración:** la primera vez, una mano fantasma toma dos cuencos, los suelta en la franja, los puentes se dibujan, una fruta queda sin pareja y la mano lleva su cuenco al hueco ancho y el otro al angosto. Repite una vez y desaparece; la escena vuelve al inicio y el tercer cuenco late. La demostración de emparejar no se repite: es la del nodo 1. La del riel (nivel 2) es nueva y se muestra una vez, igual que la de la cinta (nivel 4), donde la mano baja dos cuencos que ya tienen cinta y el juego los devuelve sin emparejar ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
