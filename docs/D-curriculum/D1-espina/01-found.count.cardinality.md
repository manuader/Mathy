# 01 — Contar dice cuántos hay (`found.count.cardinality`)

> Locale `es`: "Contar dice cuántos hay". Minijuego: [Los cuencos de fruta](../../F-minijuegos/found.count.cardinality.md).

**Nodo:** `found.count.cardinality` · **Área:** found · **Nivel:** 0 · **Primitiva:** `partition` · **Mecánica principal:** `ledger` (secundarias `network_routes`, `sorter`) · **Literacy:** `none` · **Analogía:** `fruit_bowl_count`

## 1. Concepto

Contar no es recitar nombres: es asignar a una colección un solo número, el último que se dice, y ese número no cambia si las cosas se mueven. Al terminar, el jugador sabe decir cuántas cosas hay en un montón sin emparejarlas con otro montón, y sabe que dos montones con la misma tarjeta tienen lo mismo aunque uno esté apilado y el otro desparramado. Antes podía ver "mucho" y "poco"; ahora tiene un número.

## 2. Prerequisitos

El YAML no declara ninguno: es el primer nodo del grafo y la raíz del área `found`. Lo que el nodo asume no está en el grafo sino en la motricidad: arrastrar un objeto grande y soltarlo dentro de un contorno, y tocar una de tres cosas. Ninguna arista sigue ni contradice el orden escolar, porque el orden escolar también empieza acá. Lo que sí está decidido es qué no es prerequisito: el nodo no exige reconocer numerales escritos. Los numerales nacen dentro de este nodo, en la capa `visual`, y no antes.

## 3. Dificultad cognitiva real

Lo difícil no es recitar "uno, dos, tres". Un niño de cinco años recita mucho más allá de lo que entiende. Lo difícil son tres capacidades separadas:

1. **Correspondencia uno a uno.** Tocar cada fruta exactamente una vez: ni saltear una ni volver a contar la misma. Es el invariante de `network_routes`: un puente por fruta, ningún puente doble.
2. **Cardinalidad.** Entender que el último número dicho no es el nombre de la última fruta sino la respuesta sobre todo el cuenco. Quien no la tiene cuenta "uno, dos, tres" y, cuando se le pregunta cuántas hay, vuelve a contar. Es el invariante de `sorter`: la tarjeta va sobre el cuenco, no sobre una fruta.
3. **Conservación bajo reordenamiento.** Saber que mover, apilar o separar las frutas no cambia cuántas hay. Es el invariante de `ledger`, y es la capacidad que hace que un número sea un número y no una foto del montón.

Las tres son independientes. Un jugador puede tener la primera y no la segunda, y la tercera es la que más tarda en llegar. Por eso el nodo declara tres mecánicas.

## 4. Problema intuitivo

Una mesa con dos cuencos de fruta. En uno hay manzanas 🍎, en el otro peras. Alguien pregunta, con voz o con un gesto de duda, cuál de los dos cuencos tiene más. Las frutas no están ordenadas: unas apiladas, otras rodando.

En `real` el jugador solo mira y toca el cuenco que le parece más lleno; el juego levanta las frutas de a pares, una de cada cuenco, y muestra cuál sobra. En `intuition` la escena se detiene antes de la comparación: las frutas de un cuenco se van a reacomodar en fila. Dos desenlaces dibujados: el cuenco sigue teniendo lo mismo, o ahora tiene más porque la fila se ve larga. El jugador elige y después ve. La pregunta nunca es "¿cuántas hay?" todavía: es "¿cuál tiene más?" y "¿cambió algo?".

## 5. Analogía del mundo real

`fruit_bowl_count` ([G0](../../G-analogias/G0-reglas.md)), sobre la mecánica `ledger`. Mapa: cuenco → colección; fruta → unidad; poner una fruta junto a una del otro cuenco → correspondencia uno a uno; la fruta que queda sin pareja → diferencia; la tarjeta con número sobre el cuenco → número cardinal.

Invariante que conserva: la cantidad de frutas de un cuenco no cambia cuando se reordenan, se apilan o se separan; solo cambia cuando entra o sale una fruta. Es exactamente lo que conserva la cardinalidad, así que el paso 3 del test de G0 pasa sin endurecer nada.

Punto de ruptura: `fractional_units`. Una fruta no se parte: media manzana no es una unidad de este cuenco. El nodo nunca se acerca a ese borde, y por eso la analogía puede acompañarlo entero. Se desvanece en `visual`, cuando las frutas se aplanan en marcas sobre una barra.

Por qué esta y no otra. `sorting_bins` también apunta a este nodo, pero su mapa pone el número en la etiqueta del cajón y la cardinalidad como caso de pertenencia; sirve para clasificar, no para comparar. Los cuencos ponen en el centro el gesto de emparejar, que es la única forma de comparar cantidades sin tener todavía números, y hacen que el número llegue como atajo de ese gesto. Un niño de cinco años reconoce la situación sin explicación verbal, como exige G0 para `literacy: none`.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)), cada una con un aporte y un gesto donde se encuentran. `ledger` es la principal: da el cuenco como fila y el invariante de que reordenar no cambia el conteo. `network_routes` aporta el puente entre una fruta y su pareja: la correspondencia uno a uno, con la que se compara sin contar. `sorter` aporta la tarjeta sobre el cuenco: cada colección recibe exactamente una tarjeta, y la tarjeta va sobre la colección entera, no sobre una fruta. Se encuentran en un solo gesto: el jugador arrastra una fruta a la fila del cuenco, un puente la une con la fruta de enfrente, y la tarjeta del cuenco reacciona.

1. Dos cuencos con frutas desordenadas y, entre ellos, una franja vacía con dos filas.
2. Demostración: una mano fantasma toma una manzana, la lleva a la fila de arriba; toma una pera, la lleva a la fila de abajo, justo enfrente; entre las dos se dibuja un puente corto. Repite una vez y desaparece. La primera manzana late.
3. El jugador empareja. Cada fruta que llega a su fila suena un tic. Cuando una fruta queda enfrente de un hueco, el puente no se dibuja: esa fruta sobra, y el cuenco de donde vino brilla. Sin cartel.
4. Tarjeta con puntos. Desde el segundo nivel, sobre cada cuenco aparece una tarjeta con tantos puntos como frutas emparejadas. Cada tic agrega un punto. La tarjeta es la primera cosa que representa al cuenco entero.
5. Arrastrar hasta que suene igual. Un cuenco vacío y una tarjeta objetivo con puntos: el jugador arrastra frutas de una canasta hasta que la tarjeta del cuenco se ilumina, porque tiene los mismos puntos que la objetivo.

Qué pasa cuando se equivoca. Si pone dos manzanas enfrente de la misma pera, la segunda no encuentra puente y se desliza sola al final de la fila: se ve que sobra. Si saltea una fruta y toca la tarjeta antes de tiempo, la tarjeta no se ilumina y la fruta salteada late. Nada se llama "incorrecto": el estado sigue siendo un par de filas válidas, y el jugador continúa desde ahí.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md): un conjunto partido en pedazos sin solapamiento y sin dejar nada afuera, y la cardinalidad como cuántos pedazos hay.

Cada fila de frutas se aplana con un morph continuo en una barra con marcas: una marca por fruta, todas del mismo ancho. Dos cuencos son dos barras una sobre otra, alineadas por el inicio; comparar es ver cuál barra sobresale, y la diferencia es el tramo que sobra. Los puentes de `network_routes` se vuelven líneas verticales cortas entre marca y marca. La tarjeta de puntos se pega al extremo de la barra.

Se conserva la cantidad de marcas cuando la barra se parte en dos tramos o se junta con otra: ese es el invariante dibujado. Se desplaza lo que sobra, siempre hacia el extremo. Nada se escala: una barra con más marcas es más larga porque tiene más marcas, no porque esté estirada; escalar es la primitiva de `arith.mul.scaling` y acá se evita a propósito.

Todavía no se muestran operadores, ni un signo entre las barras, ni la palabra "más". Tampoco una recta con posiciones: eso es el nodo 2. Las marcas están sobre una barra sin numerar.

## 8. Transición a símbolos

El nodo termina en `visual` (`layers: [real, intuition, concrete, visual]`), así que su transición no llega a una expresión. Llega al numeral como etiqueta de una colección, y son cuatro morphs del mismo objeto, cada uno provocado por un gesto.

1. **Fruta → marca.** Cuando el jugador empareja por primera vez dos cuencos completos sin que sobre nada en `concrete`, cada fruta de las dos filas se aplana en una marca sobre su barra, y los puentes se contraen en líneas cortas. El cuenco es ahora una barra con marcas, y sigue respondiendo al arrastre: se puede seguir agregando marcas de a una.
2. **Puntos de la tarjeta → puntos alineados.** Al tocar la tarjeta, sus puntos se ordenan en fila y se colocan uno sobre cada marca de la barra: se ve que la tarjeta y la barra dicen lo mismo.
3. **Puntos → numeral.** La primera vez que el jugador pone la tarjeta correcta sobre una colección desparramada sin emparejar, los puntos de esa tarjeta se contraen en un solo dibujo, el numeral, que conserva el tamaño y el color de la tarjeta. El numeral no reemplaza a los puntos: los puntos vuelven a aparecer si el jugador mantiene tocada la tarjeta.
4. **Tarjeta → etiqueta de la barra.** Cuando el jugador empareja dos barras y ambas tienen numeral, las tarjetas se desprenden del cuenco y quedan pegadas al extremo de cada barra. Es la forma con la que el nodo 2 va a graduar la pista.

En ningún paso hay dos objetos distintos que se alternan: la manzana con id estable se vuelve marca, la marca conserva su id bajo el numeral, y tocar el numeral ilumina las marcas que cuenta.

## 9. Notación matemática

Queda una barra con marcas y un numeral en el extremo: `5` junto a cinco marcas.

Por la regla de oro de H, el nodo introduce los numerales `1, 2, 3, …`, y el problema que los hace necesarios es comparar dos montones sin poner los objetos uno frente a otro. Mientras los cuencos estén en la misma mesa, emparejar alcanza. El problema llega en el cuarto nivel: un cuenco está en pantalla y el otro no, y el jugador tiene que llevarle a otro cuenco "lo mismo que hay acá". No puede arrastrar el cuenco entero. Lo que puede llevar es la tarjeta, y la tarjeta con muchos puntos es incómoda: los puntos se confunden y hay que emparejarlos otra vez al llegar. El numeral es la tarjeta que se lleva sin volver a contar.

No hay signo entre barras ni igual. No hay `0`: el cuenco vacío se deja como cuenco vacío, y el `0` tiene su problema propio en `found.count.zero_as_empty` (y como piedra de salida, en el nodo 2).

## 10. Definición formal

El nodo no tiene capa `formal`: ni el YAML la declara ni el nivel 0 admite texto. La definición no se enuncia acá. Lo que el jugador ya jugó, y lo que un nodo posterior podrá decir en una frase con voz, es esto: el número de una colección es el que se dice al tocar la última cosa cuando cada cosa se tocó una sola vez; ese número es el mismo para cualquier orden en que se toquen; dos colecciones tienen el mismo número si se pueden emparejar sin que sobre nada.

Condiciones que el jugador sintió sin nombrarlas: cada objeto una sola vez (el puente doble no se dibuja); ningún objeto sin tocar (la fruta salteada late); el número es de la colección y no de la última fruta (la tarjeta va sobre el cuenco). Caso especial que el nodo deja abierto: el cuenco vacío no recibe tarjeta acá.

## 11. Propiedades

- **El conteo no depende del orden.** Contar de izquierda a derecha o de derecha a izquierda da la misma tarjeta. Ligada al ítem `explain` donde las frutas se reordenan y la tarjeta no cambia.
- **El conteo no depende de la disposición.** Apilado, en fila o desparramado, el cuenco tiene la misma tarjeta. Ligada al morph de la fila en barra: las marcas son las mismas.
- **Mismo número si y solo si se emparejan sin sobrante.** Dos cuencos con la misma tarjeta se emparejan justo; si sobra una fruta, las tarjetas son distintas. Ligada al puente que no se dibuja.
- **Agregar una cosa cambia la tarjeta en un punto.** Cada tic agrega exactamente un punto. Es la semilla de "sumar uno" que el nodo 2 convierte en un paso y el nodo 3 en desplazamiento.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin texto:

- `recognize`: tres pilas de frutas y una tarjeta con puntos que muestra el guía; tocar la pila que tiene tantas frutas como puntos. Los distractores se generan con una fruta de más y una de menos.
- `explain`: dos animaciones sobre el mismo cuenco: en una las frutas se reordenan y la tarjeta no cambia; en la otra se reordenan y la tarjeta cambia de número. Tocar la animación que miente. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones ([Q](../../Q-edad-universal.md)).
- `manipulate`: arrastrar frutas una por una hasta que el cuenco tenga exactamente las que pide la tarjeta; cada fruta hace sonar un tic y el número de la tarjeta se ilumina al llegar.
- `apply`: dos cuencos mezclados; emparejar fruta con fruta arrastrando y tocar el cuenco al que le sobran, sin contar en voz alta.
- `generalize`: los objetos cambian a piedras, luego a conchas, luego a marcas en una barra; poner la tarjeta correcta sobre cada colección aunque estén desparramadas o apiladas.
- `transfer`: en la red de islas, tocar la isla que tiene la misma cantidad de puentes que indica la tarjeta de puntos.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)). El YAML declara `misconceptions: []`: ninguna entrada del catálogo con regla `detect` apunta a este nodo. Los distractores de `explain` y las opciones de `recognize` salen, entonces, de la ruptura de la analogía y de los deslices de conteo que el diseño prevé sin catalogar:

- **Reordenar cambia la cantidad.** La animación que miente. Si el jugador la elige como verdadera, el juego reproduce sobre su cuenco el reordenamiento en cámara lenta, con las marcas numeradas por el tic, y muestra que la tarjeta no cambió. Sin prompt de locale, porque no hay entrada en L; la voz repite la pregunta del ítem.
- **Puente doble.** Dos frutas emparejadas con la misma. El juego ejecuta el gesto: la segunda se desliza al final de la fila y sobra. El jugador continúa desde ahí.
- **Fruta salteada.** La tarjeta no se ilumina y la fruta sin puente late. Continúa desde ahí.

Si alguno de estos tres se repite con la regularidad que L0 llama sistemática, merece una entrada propia en `misconceptions.yaml` con patrón `replay_on_mechanic` sobre `ledger`; hoy el nodo no la tiene.

## 13. Generalización

La analogía se retira en `visual`, como declara `fades_at_layer`. La señal es el `generalize` del locale: piedras, después conchas, después marcas en una barra. Cuando el jugador pone la tarjeta correcta sobre marcas que no se parecen a nada, la fruta ya no está haciendo nada.

Variantes que debe resolver sin la fruta: colecciones desparramadas frente a apiladas; objetos de distinto tamaño (una piedra grande no cuenta por dos); dos colecciones de objetos distintos con la misma tarjeta (tres conchas y tres piedras); marcas sobre dos barras de distinto grosor pero la misma cantidad.

El nodo no tiene capa `abstract`. Su forma completa se considera alcanzada, dentro de `visual`, cuando el jugador pone tarjetas sobre marcas sin emparejar y sin tocar de a una, distingue tamaño de cantidad y elige la animación que miente sin dudar entre variantes. Lo que un nodo `abstract` diría (dos conjuntos tienen el mismo cardinal si existe una biyección) lo enuncia mucho después `disc.count.sum_rule`, sin fruta.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área:

- `graph.basic.graph_and_paths` (`network_routes`): la tarjeta de puntos aparece junto a una red de islas, y la pregunta es qué isla tiene tantos puentes como puntos. Contar puentes es contar sin frutas. El puente que acá unía una fruta con su pareja es allá el objeto que se cuenta.
- `disc.count.sum_rule` (`urn_dice`): dos bolsas de bolitas que no comparten ninguna; la cantidad de la bolsa juntada es la tarjeta de una más la tarjeta de la otra. El invariante de `ledger` (reordenar no cambia el conteo) es lo que hace válido juntar.
- `prob.stat.frequency_table` (`ledger`, `sorter`): una fila por resultado y una tarjeta por fila. La tabla de frecuencias es este mismo libro de cuentas con otros objetos.

Concepto siguiente: `found.count.number_line` ([02](02-found.count.number_line.md)). Frase puente, narrada sobre la última barra con marcas: "Estas marcas están en fila. Si el caminante pisa una por una, ¿en cuál se para cuando la tarjeta dice cinco?". La barra se acuesta sobre el agua, cada marca se vuelve una piedra, y el nodo 2 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `ledger_pair_fruit_to_fruit` es la mecánica renderizada sobre el estado del jugador: dos filas de objetos concretos, un puente que se traza entre cada par con un retardo corto por par, y el objeto sin pareja que queda marcado; gramática `partition`, con la cantidad de marcas como lo que se conserva. Parametrizada por las dos cantidades, produce también las dos animaciones de `explain`. `sorter_number_card_on_bin` es la tarjeta que viaja hasta el cuenco y cuenta desde cero hasta el número mientras los objetos entran de a uno; parametrizada por la lista de cuencos y la lista de tarjetas, genera los ítems de `recognize` y `generalize`. Ninguna lleva texto rasterizado: el numeral de la tarjeta lo dibuja el runtime desde el `MathTree`, y las frutas son assets propios sin texto ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_count` ([M](../../M-calculadora/M0-progresion.md)), la tecla `contar`. Es la única tecla de la primera calculadora junto con la que abre el nodo 3. Tocar `contar` sobre un montón de fichas las ordena en fila, hace sonar un tic por ficha y muestra la tarjeta con el numeral: la misma animación de la mecánica. Antes de `arith.add.displacement` la tecla muestra las fichas sobre la pista del nodo 2. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y nivel 0, y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que empareja dos frutas, los targets son frutas de tamaño de token, `explain` se resuelve entre animaciones, y la voz solo presenta la situación. Con el sonido apagado no falta nada. Un adulto no juega este nodo: el diagnóstico lo deja en `ready` provisional con un solo ítem de `recognize`, y solo vuelve si un nodo posterior decae hasta acá.
