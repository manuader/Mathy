# 01 — Contar dice cuántos hay (`found.count.cardinality`)

> Locale `es`: "Contar dice cuántos hay". Minijuego: [El bol y la tarjeta](../../F-minijuegos/found.count.cardinality.md).

**Nodo:** `found.count.cardinality` · **Área:** found · **Nivel:** 0 · **Primitiva:** `partition` · **Mecánica principal:** `ledger` (secundarias `sorter` y `network_routes`) · **Literacy:** `none` · **Analogía:** `fruit_bowl_count` · **Capas:** `real`, `intuition`, `concrete`, `visual`

## 1. Concepto

Contar es asignarle a una colección un número que dice cuántos objetos tiene y que no cambia si los objetos se mueven. Al terminar, el jugador toma una colección desordenada, la recorre tocando cada objeto una sola vez, sabe que el último número contado es la cantidad de todos y no de la última cosa que tocó, y sostiene esa cantidad cuando el bol se sacude. Además compara dos colecciones emparejando objeto con objeto, sin contar ninguna de las dos.

## 2. Prerequisitos

Ninguno: `prereqs` está vacío y este es el punto de entrada del grafo. Se asume que el jugador puede mirar la pantalla y tocar un objeto grande con un dedo, y nada más: ni lectura, ni recitado de la serie numérica, ni reconocimiento de dígitos, que aparecen dentro del nodo como consecuencia de haber contado.

## 3. Dificultad cognitiva real

Lo difícil no es decir "uno, dos, tres". Recitar la serie es memoria y muchos jugadores llegan con ella. Contar son tres capacidades que la serie no da:

1. **Correspondencia uno a uno.** Cada objeto recibe exactamente un número, y ningún objeto queda sin número. Es el invariante `every_object_exactly_one_bin` del `sorter` visto desde el otro lado: no saltear y no repetir.
2. **Cardinalidad.** El último número dicho nombra a la colección entera, no al objeto que se tocó al final. Quien no tiene esta capacidad cuenta perfecto y después, cuando se le pregunta cuántos hay, vuelve a contar o señala la última fruta.
3. **Invariancia bajo reordenamiento.** El número sobrevive a sacudir el bol, a apilar, a desparramar y a cambiar el tamaño de los objetos. Es el invariante `count_preserved_under_regrouping` del `ledger`, y es lo que convierte al número en una propiedad de la colección en vez de en un registro de un recorrido.

Hay una cuarta capacidad que el nodo desarrolla y que no depende de las tres anteriores: **comparar sin contar**. Tender un puente de cada fruta de un bol a una fruta del otro decide cuál tiene más aunque los dos números sean demasiado grandes para el jugador. Esa independencia es deliberada y es la que abre `found.cmp.bigger_smaller` y `found.cmp.same_amount`.

## 4. Problema intuitivo

Una mesa larga con chicos sentados y, en el medio, un bol con frutas. La pregunta, por voz o por gesto: ¿alcanza una fruta para cada uno?

En `real` la escena solo se mira y se responde con un toque en el bol o en la mesa. En `intuition` el juego se detiene antes del reparto y ofrece dos desenlaces dibujados: en uno cada chico recibe una fruta y el bol queda vacío; en otro sobra fruta en el bol o queda un chico con las manos vacías. El jugador elige y después ve el reparto real. Ningún número aparece en toda la escena.

## 5. Analogía del mundo real

`fruit_bowl_count`, sobre `ledger` ([G0](../../G-analogias/G0-reglas.md)). El mapa de estructura: el bol es la colección; cada fruta es una unidad; emparejar fruta con fruta es la correspondencia uno a uno; la fruta que queda sin pareja es la diferencia; la tarjeta apoyada sobre el bol es el número cardinal.

El invariante que conserva es exactamente el que el nodo enseña: mover las frutas dentro del bol, apilarlas o desparramarlas no cambia la tarjeta. Se rompe en `fractional_units`: media manzana no es una fruta ni son dos, y contar exige unidades indivisibles. Por eso la analogía se retira en la capa `visual`, donde la fruta ya es una marca, y las mitades esperan a `arith.frac.parts_and_ratio`, que las trata con otra piel.

Se eligió esta y no una fila de personas o una escalera porque la fruta es intercambiable y desordenable. Una fila ya trae el orden puesto, y el orden es lo que el nodo tiene que dejar afuera para que la cardinalidad no se confunda con la posición: eso llega en el nodo siguiente. Una colección de frutas es lo mínimo que preserva la estructura de "cuántos hay" sin regalar nada más.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas, y cada una aporta una cosa distinta ([E0](../../E-mecanicas/E0-catalogo.md)). El `ledger` es la principal y provee la herramienta: juntar objetos iguales en una fila y leer cuántos hay. El `sorter` provee la partición: cada fruta cae en un cajón y en uno solo, que es la forma física de no saltear ni repetir. `network_routes` provee la comparación: un puente por fruta, y el puente que queda colgando es la diferencia. Las tres se encuentran en un solo gesto: arrastrar una fruta al bol la mete en su fila, la saca del montón de origen y tiende su puente, todo con el mismo movimiento. Gestos: `drag` y `tap`.

1. Un bol vacío, frutas sueltas alrededor y una tarjeta con puntos apoyada en el borde del bol.
2. Demostración: una mano fantasma arrastra una fruta al bol. Suena un tic corto y un punto de la tarjeta se enciende. La mano repite con la segunda. La escena vuelve al inicio y la primera fruta late una vez ([Q](../../Q-edad-universal.md)).
3. El jugador arrastra. Cada fruta que entra enciende un punto. Cuando los puntos encendidos son todos los de la tarjeta, la tarjeta se ilumina entera y el bol se cierra solo.
4. Si mete una fruta de más, la fruta entra —nada se rechaza— y aparece un punto extra fuera del borde de la tarjeta, que ya no cierra. Sacar la fruta lo apaga.
5. Si toca dos veces la misma fruta para contarla, el puente ya tendido late y no se dibuja un segundo: esa fruta ya está del otro lado.
6. Si arrastra un puñado de golpe, las frutas entran pero los tics siguen sonando de a uno, más lento que la mano, y los puntos se encienden después. El desfasaje es visible y es la respuesta.
7. Sacudir el bol con un arrastre lateral desordena las frutas. La tarjeta no cambia. Es la comprobación del invariante y se puede repetir todas las veces que el jugador quiera.

Nada se llama "incorrecto". Cada desvío tiene su consecuencia física, descrita en la sección 12.

## 7. Representación visual

Capa `visual`, con `partition` dominante y `relate` de apoyo ([H](../../H-progresion-abstraccion.md)).

`partition`. El bol se aplana en una región y las frutas se contraen en marcas iguales dentro de ella, del mismo tamaño aunque las frutas fueran de tamaños distintos: esa igualación es la parte del morph que enseña. Las marcas se pueden reagrupar dentro de la región —de a dos, de a cinco, en fila o en montón— y la cantidad de marcas no cambia. Nada se desplaza fuera de la región y nada se escala; lo que se conserva es la cantidad de marcas bajo cualquier reagrupamiento.

`relate`. Entre dos regiones aparecen líneas punteadas, una por par. Las regiones se pueden mover y las líneas siguen unidas: dónde está dibujado cada bol no cambia quién está emparejado con quién. La marca que queda con su línea colgando es lo que sobra.

Todavía no se muestra ningún operador, ninguna comparación escrita, y tampoco el cero: la región vacía existe en pantalla pero no tiene tarjeta, y ese hueco es exactamente el problema que abre `found.count.zero_as_empty`.

## 8. Transición a símbolos

Este nodo no llega a la capa `symbolic`, y el desvanecimiento tiene tres pasos, no cuatro. El objeto es el mismo en los tres y cada paso lo dispara un gesto del jugador.

1. **Fruta → marca.** La primera vez que el jugador sacude un bol ya contado y ve que la tarjeta aguanta, las frutas se aplanan en marcas iguales dentro de la región. Es el paso `objects` → `tally` del `ledger`.
2. **Marcas → ficha.** Cuando el jugador apoya la tarjeta sobre una región por primera vez, las marcas se juntan en el borde y la tarjeta se contrae en una ficha con el número. Los puntos de la tarjeta y las marcas comparten posición durante el morph, y por un momento se ven los dos: cinco puntos y un `5` en el mismo lugar.
3. **Ficha sobre la región.** La ficha queda apoyada y se puede arrancar y llevar a otra región. Si la región no tiene esa cantidad, la ficha no se apoya: flota y vuelve.

**El desvanecimiento de este nodo termina en la ficha.** No hay operadores, no hay expresión y no hay línea de igualdad, porque este nodo no tiene nada que escribir todavía: un número solo no es una cuenta. El primer operador de la espina, `+`, lo recoge [`arith.add.displacement`](03-arith.add.displacement.md), cuando haya dos cantidades que juntar y valga la pena anotar cuál fue el paso. La ficha que este nodo deja es lo que ese operador va a conectar.

## 9. Notación matemática

Lo único que queda cuando la fruta se va es el número: `1`, `2`, `3`, y la ficha que lo lleva.

Según la tabla de la regla de oro de [H](../../H-progresion-abstraccion.md), los números se introducen en la capa `visual` de este nodo, y el problema que los hace necesarios está en la mecánica: **comparar dos colecciones que no se pueden poner una frente a la otra.** Mientras los dos boles están en la mesa, los puentes alcanzan y no hace falta ningún número. Cuando el segundo bol está en la otra punta —o ya no está, porque se lo llevaron—, el puente no llega y hay que traer algo que viaje en su lugar. Eso es la tarjeta, y después la ficha.

Un número junto a una región es una etiqueta, no notación en sentido fuerte: no se opera con él, no se escribe al lado de otro, no hay un signo que los una. Es un nombre corto para algo que el jugador acaba de hacer con las manos, que es la única forma en que un símbolo entra en Mathy.

## 10. Definición formal

El nodo no tiene capa `formal`: `layers` termina en `visual` y a nivel 0 no hay texto que enunciar. La sección queda como registro de qué parte de la definición el jugador ya juega sin que nadie se la diga, para que el nodo que la enuncie no la presente como nueva.

Jugado, sin palabras: la cantidad de una colección es lo que se obtiene emparejando sus objetos con los números en orden sin saltear ni repetir; el último número usado es la cantidad; dos colecciones tienen la misma cantidad cuando se pueden emparejar objeto con objeto sin que sobre ninguno. Nada de esto se dice. Se sostiene con la tarjeta, con los tics y con los puentes.

Casos que el jugador encuentra y que la definición futura va a tener que cubrir: la colección de un solo objeto, que tiene tarjeta igual que las demás; la colección vacía, que no tiene tarjeta y por eso incomoda; y dos colecciones que se emparejan aunque sus objetos sean distintos entre sí, que es la primera vez que la cantidad se despega del tipo de cosa contada.

## 11. Propiedades

- **La cantidad no cambia al reordenar.** Sacudir, apilar o desparramar deja la tarjeta donde estaba. Ligada al gesto de sacudir el bol contado, que el juego ofrece siempre y nunca penaliza.
- **La cantidad no depende del orden en que se cuenta.** Empezar por otra fruta da la misma tarjeta. Ligada a contar el mismo bol dos veces arrancando de puntas distintas, con los puentes de la primera pasada visibles en gris.
- **La cantidad no depende del tipo de objeto.** Cinco piedras y cinco conchas se emparejan sin que sobre nada. Ligada a los ítems de `generalize`, donde el objeto cambia y la tarjeta no.
- **El emparejamiento decide más, menos o igual sin contar.** Ligada al puente que queda colgando. Esta propiedad no se cierra en este nodo: la recogen `found.cmp.bigger_smaller` y `found.cmp.same_amount`.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), a partir de las probes del locale.

- `recognize`: tres pilas de frutas dispuestas de formas distintas —en fila, apiladas, desparramadas— y una tarjeta de puntos que muestra el guía. El jugador toca la pila que tiene tantas frutas como puntos. Las pilas distractoras se generan con una y dos frutas de diferencia, y una de ellas ocupa más espacio en pantalla con menos frutas, para que el área no sirva de atajo.
- `explain`: dos animaciones cortas sobre el mismo bol. En una, las frutas se reordenan y la tarjeta se queda igual; en la otra, se reordenan y el número de la tarjeta cambia. El jugador toca la que miente. Es evidencia de comprensión sin una sola palabra, como pide [Q](../../Q-edad-universal.md) para los perfiles sin lectura.
- `manipulate`: arrastrar frutas de a una hasta que el bol tenga exactamente las que pide la tarjeta. Cada fruta hace tic y enciende un punto; la tarjeta se ilumina al completarse.
- `apply`: dos boles con frutas mezcladas y de tamaños distintos. El jugador empareja fruta con fruta arrastrando puentes y después toca el bol al que le sobran. No se le pide ningún número: la situación se resuelve entera con la correspondencia.
- `generalize`: los objetos cambian a piedras, después a conchas, después a marcas sobre una barra, y la disposición pasa de ordenada a desparramada. El jugador apoya la tarjeta correcta sobre cada colección.
- `transfer`: en la red de islas y puentes de `graph.basic.graph_and_paths`, el jugador toca la isla que tiene tantos puentes como indica la tarjeta de puntos. La mecánica es `network_routes` y el objeto contado ya no es una cosa sino una conexión.

**Misconceptions.** El nodo declara `misconceptions: []`, y la lista vacía es correcta. Una misconception de [L0](../../L-modelo-errores/L0-taxonomia.md) es una regla ejecutable que produce una respuesta equivocada a partir de un estado válido y que se puede reproducir sobre una mecánica: `detect` opera sobre expresiones, y acá no hay expresiones. A este nivel el desvío todavía no es conceptual sino de coordinación entre la mano, el ojo y la serie numérica; no hay una regla razonable aplicada fuera de su dominio, que es lo que L cataloga. La primera misconception catalogada que el jugador se puede cruzar en la espina es `equals_as_operator`, en el nodo 3.

Los errores esperados, entonces, se describen como consecuencias físicas de la mecánica y no disparan ningún patrón. Contar dos veces el mismo objeto: el puente ya tendido late, no se dibuja otro y el tic no suena. Saltear uno: al apoyar la tarjeta queda una fruta sin puente en el borde, con su línea colgando, y la tarjeta no se apoya. Arrastrar de a puñados: las frutas entran pero los tics y los puntos van más lento que la mano, y el desfasaje se ve y se oye. Nombrar el último objeto en vez de la colección: esa fruta se eleva sola, el resto del bol se atenúa y le aparece una tarjeta de un punto; la escena vuelve con el bol entero resaltado. Sobrellenar: un punto extra fuera del borde, que deja de cerrar.

Ninguno interrumpe: el bol conserva su estado y el jugador sigue desde ahí.

## 13. Generalización

La analogía se retira dentro del propio nodo, en la capa `visual`, cuando la fruta se aplana en marca. Retirarla temprano es lo correcto acá: la fruta representa una unidad cualquiera, y una unidad cualquiera dibujada siempre como manzana enseña a contar manzanas.

Variantes sin ayuda del objeto, en orden: cambio de objeto con la misma disposición; cambio de disposición con el mismo objeto —fila, montón, desparramado, en dos grupos separados—; objetos de tamaños muy distintos en la misma colección, para romper la lectura por área; colecciones en las que hay que contar cosas que no son objetos sueltos, como los puentes de una isla o los cajones ocupados de un `sorter`.

El nodo no llega a `abstract` y `layers` lo declara. La forma abstracta de esta idea —el cardinal como lo que comparten todas las colecciones que se emparejan entre sí— no se enuncia en ningún nodo de `found`; aparece con estructura propia en `disc.count.sum_rule` y en `prob.stat.frequency_table`, y ahí ya hay notación para sostenerla.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, cada uno en otra área y con una mecánica que no fue la de aprender:

- `graph.basic.graph_and_paths` (`network_routes`): contar cuántos puentes salen de una isla. El objeto contado es una conexión, no una cosa, y la isla se puede arrastrar sin que la cuenta cambie.
- `disc.count.sum_rule` (`ledger`): dos filas de casos que no se pisan se juntan en una, y la cuenta de la fila junta es la suma de las cuentas. Es el invariante de este nodo convertido en regla.
- `prob.stat.frequency_table` (`ledger` con `sorter`): una tabla de frecuencias es un bol por categoría y una tarjeta por bol.

Concepto siguiente: `found.count.number_line` ([02](02-found.count.number_line.md)). Frase puente, narrada sobre el último bol contado: "Ya sabés cuántas hay. Si las ponemos en fila, cada una se queda con un lugar propio, y ese lugar tiene nombre. ¿Cuál va primero?". Las frutas del bol salen en fila y se posan sobre piedras que cruzan el agua; la tarjeta de cada una se queda pegada a su piedra, y el nodo 2 empieza con esa fila.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `ledger_pair_fruit_to_fruit` es nativa y se dibuja sobre el estado del jugador: dos colecciones y los puentes punteados que se tienden de a uno, con la marca sobrante resaltada al final; gramática `partition` con `relate` de apoyo, parametrizada por las dos cantidades. `sorter_number_card_on_bin` también es nativa: los objetos caen de a uno en su cajón y la tarjeta se apoya sobre el cajón lleno; gramática `partition`. Genera además las animaciones de `explain`, porque reordenar los objetos dentro del cajón y cambiar o no la tarjeta es un parámetro suyo. Ninguna lleva texto rasterizado: los puntos y los dígitos los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_count`, la primera tecla de la calculadora y la única que el jugador tiene por un rato ([M](../../M-calculadora/M0-progresion.md)). No calcula: el jugador arrastra fichas de objeto a una región y la tecla las cuenta de a una, con el mismo tic y la misma tarjeta que en el minijuego. Cuando el nodo 2 llegue a `ready`, la misma tecla —nunca una nueva— muestra además la pista de números y el caminante.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer, como exige el validador para nivel 0 ([Q](../../Q-edad-universal.md)). Las tarjetas son de puntos antes que de dígitos, y el dígito aparece recién en el morph del paso 2 de la sección 8, montado sobre los puntos que el jugador ya venía usando. La instrucción es la mano fantasma; la voz es opcional y solo presenta la situación. Para un adulto el nodo es un único ítem de diagnóstico: entra en `ready` provisional sin ver `real` ni `intuition`, y lo que le queda del nodo es la tecla `contar`. La dimensión Speed se mide pero nunca se muestra como cuenta regresiva, y el tiempo objetivo se ajusta con el factor de perfiles sin lectura de [K](../../K-evaluacion.md).
