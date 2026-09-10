# 45 — Dónde hay más, dónde menos (`found.cmp.bigger_smaller`)

> Locale `es`: "Dónde hay más, dónde menos". Minijuego: [El riel de los cuencos](../../F-minijuegos/found.cmp.bigger_smaller.md).

**Nodo:** `found.cmp.bigger_smaller` · **Área:** found · **Nivel:** 0 · **Primitiva:** `partition` · **Mecánica principal:** `sorter` (secundaria `ledger`) · **Literacy:** `none` · **Analogía:** `fruit_bowl_count`

## 1. Concepto

"Más" no es una propiedad de un montón sino una **relación entre dos**, y esa relación acomoda a todos los montones en una sola fila. Al terminar, el jugador no solo decide cuál de dos cuencos tiene más: pone tres, cuatro o cinco cuencos en orden sobre un riel comparándolos de a dos, sabe que si el primero tiene más que el segundo y el segundo más que el tercero no hace falta comparar el primero con el tercero, y sabe que un cuenco con objetos más grandes no tiene por eso más. Antes tenía un número para cada montón; ahora tiene un orden entre los números.

## 2. Prerequisitos

- `found.count.cardinality` (nodo 1): el número de una colección. Se usan tres cosas suyas. La tarjeta que representa al cuenco entero, que acá se convierte en lo que viaja al riel. El emparejamiento uno a uno de `ledger`, que sigue siendo la única forma honesta de comparar sin contar y que acá decide cada duelo. Y el invariante de que reordenar no cambia la cantidad, sin el cual "tiene más" cambiaría cada vez que alguien mueve una fruta.

Es el único prerequisito del YAML, y conviene decir qué reparto de trabajo supone. El nodo 1 ya hace comparaciones: su capa `real` pregunta cuál de dos cuencos tiene más, y la usa como excusa para que nazca el número. Este nodo hace lo contrario: **parte del número y construye el orden**. La comparación de a dos deja de ser un medio y se vuelve el objeto de estudio, y aparece lo que el nodo 1 nunca necesitó: la tercera opción del empate, la transitividad y el riel donde caben más de dos montones. Por eso el orden escolar, que mete "más y menos" dentro del conteo, acá está separado: contar responde *cuántos*, ordenar responde *cuál*, y la segunda pregunta tiene su propia dificultad.

Lo que **no** es prerequisito: la recta numérica (nodo 2). El orden del riel no necesita posiciones ni un camino; se arma solo con duelos. La relación entre los dos nodos es al revés de lo que parece: el riel ordenado es lo que el nodo 2 acuesta y gradúa.

## 3. Dificultad cognitiva real

Lo difícil no es señalar el montón grande. Un chico de tres años lo hace de un vistazo cuando la diferencia es enorme. Son cuatro capacidades separadas:

1. **Entender que "más" es una relación y no una propiedad.** Un cuenco no *es* mucho. Es más que uno y menos que otro. Quien no lo tiene contesta "mucho" señalando un cuenco solo, y se queda sin poder ordenar tres.
2. **Comparar sin contar y sin mirar el bulto.** Emparejar de a uno y ver qué sobra funciona siempre; mirar cuál pila es más alta o cuál fila es más larga funciona a veces, y falla justo cuando los objetos son de distinto tamaño o están desparramados. Separar cantidad de espacio ocupado es la capacidad que más tarda.
3. **La transitividad.** Si A tiene más que B y B más que C, entonces A tiene más que C, y no hace falta comprobarlo. Es lo que convierte una pila de comparaciones sueltas en un orden, y es lo que hace que armar el riel sea barato. Quien no la tiene compara todos contra todos y se pierde.
4. **Aceptar el empate como tercer desenlace.** "Ni más ni menos" no es que el emparejamiento haya fallado: es un resultado, y es el único que deja a dos cuencos en el mismo escalón. Sin esa tercera puerta, el jugador fuerza un ganador y el orden se vuelve arbitrario.

Las cuatro son independientes. Un jugador puede emparejar impecablemente y seguir ordenando por tamaño; otro puede aceptar el empate y comparar todos contra todos. Por eso el nodo declara dos mecánicas: `ledger` resuelve el duelo, `sorter` sostiene el orden.

## 4. Problema intuitivo

Una mesa con tres cuencos de fruta desparejos y, contra la pared, una repisa inclinada con tres huecos: el hueco de la izquierda es angosto, el del medio mediano, el de la derecha ancho. Alguien va a guardar los cuencos y pregunta, con voz o con un gesto de duda, cuál va en cada hueco.

En `real` el jugador solo mira y toca el cuenco que le parece que va en el hueco ancho; el juego levanta las frutas de a pares, una de cada cuenco, y muestra cuál sobra. En `intuition` la escena se detiene antes del final y hay dos preguntas, no una.

La primera: dos cuencos van a emparejarse. Tres desenlaces dibujados, y esta vez son tres y no dos: sobra en el de la izquierda, sobra en el de la derecha, no sobra nada. El jugador elige y después ve. El tercer desenlace es el que prepara el nodo siguiente.

La segunda: se ve que el cuenco A ya le ganó a B, y que B ya le ganó a C, y una mano acerca A y C. Dos desenlaces dibujados: sobra en A, o sobra en C. El jugador elige y después ve. Nadie dice la palabra "entonces"; la escena la hace.

## 5. Analogía del mundo real

`fruit_bowl_count` ([G0](../../G-analogias/G0-reglas.md)), sobre la mecánica `ledger`, la misma que viste el nodo 1. Mapa: cuenco → colección; fruta → unidad; poner una fruta junto a una del otro cuenco → correspondencia uno a uno; la fruta que queda sin pareja → el lado que tiene más; ninguna fruta sin pareja → empate; la tarjeta con número sobre el cuenco → número cardinal.

Invariante que conserva: cuál cuenco tiene más no cambia cuando las frutas se reordenan, se apilan o se separan; solo cambia cuando entra o sale una fruta. Es exactamente lo que conserva la relación de orden entre dos cantidades, así que el paso 3 del test de G0 pasa sin endurecer nada.

Punto de ruptura: `fractional_units`. Media manzana no es una unidad, y por eso el emparejamiento no sabe comparar cantidades que no son enteras. El nodo nunca se acerca a ese borde: comparar 1/2 con 2/5 es `arith.frac.common_unit`, y allí el emparejamiento se reemplaza por el corte a un tamaño común. La analogía se desvanece en `visual`, cuando los cuencos se aplanan en barras y el riel se vuelve una escalera.

Por qué esta y no otra. `balance_tilted` apunta también a este nodo y es tentadora: una balanza que se queda inclinada dice "más" sin ninguna palabra. Se descarta como analogía principal por dos razones. La balanza compara **peso**, y una piedra grande pesa más que tres chiquitas: la analogía enseñaría exactamente el error que el nodo tiene que desarmar. Y la balanza tiene dos platos y este nodo necesita acomodar cinco cuencos, cosa que una balanza no hace. El riel sí. La balanza inclinada vuelve, con todo derecho, cuando lo que se compara son expresiones y ya no hay objetos que emparejar: es `prealg.ineq.compare_expressions`, uno de los nodos de `transfer_to`.

`sorter` no trae analogía propia: trae la repisa. Poner cada cuenco en exactamente un hueco es su invariante, y en un riel esos huecos están en fila, lo que convierte una clasificación en un orden.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Dos mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `sorter` es la principal y aporta el riel: cada cuenco entra en exactamente un hueco, y los huecos están en fila. `ledger` aporta el duelo: dos cuencos se emparejan fruta con fruta y el que tiene sobrante gana. Se encuentran en un solo gesto: el jugador arrastra un cuenco al riel, y si el hueco está en disputa los dos cuencos bajan a la franja de emparejar, se resuelven ahí y vuelven al riel.

1. Tres cuencos sobre la mesa, un riel con tres huecos que crecen de izquierda a derecha, y entre medio la franja de dos filas del nodo 1.
2. Demostración: una mano fantasma toma dos cuencos, los suelta en la franja, las frutas se acomodan enfrentadas y se dibujan los puentes; una fruta queda sin puente y su cuenco brilla; la mano lo lleva al hueco ancho y el otro al angosto. Repite una vez y desaparece. El tercer cuenco late.
3. El jugador arrastra cuencos al riel. La zona de drop de un hueco es el hueco entero.
4. Si suelta un cuenco en un hueco que no le corresponde, el cuenco no se rechaza: se queda, y el riel se dibuja con el escalón roto, un tramo que baja donde todos los demás suben. Nada se llama "incorrecto". El jugador puede sacarlo y volver a intentar, y el estado sigue siendo un riel válido.
5. Si toca dos cuencos seguidos, bajan a la franja y se emparejan solos. Es la consulta: el duelo está siempre disponible y no cuesta nada.
6. Empate. Cuando el emparejamiento no deja sobrante, los dos cuencos quedan iluminados iguales y el hueco se ensancha para recibir a los dos. El riel admite dos cuencos en el mismo escalón, y eso es lo único que hace falta decir del empate en este nodo.
7. Desde el segundo nivel, cada cuenco lleva la tarjeta con puntos del nodo 1 y, más tarde, con numeral. Comparar dos tarjetas se vuelve más rápido que emparejar, y ahí el jugador siente para qué servía el número.
8. Desde el cuarto nivel, dos cuencos ya resueltos quedan con una cinta entre ellos. Si el jugador vuelve a bajarlos a la franja, el juego los empareja igual pero la cinta late: es el empujón suave que dice que esa comparación ya estaba hecha. Con las cintas puestas, un cuenco nuevo se ubica con dos duelos y no con cuatro.

Qué pasa cuando se equivoca. Si ordena por el tamaño de las frutas, el juego ejecuta su respuesta: arma el riel como él lo dejó, y después baja los dos cuencos del escalón roto a la franja y los empareja a la vista. Si ordena por lo largo de la fila, lo mismo con las frutas desparramadas. Ninguno de los dos errores tiene entrada en el catálogo de [L0](../../L-modelo-errores/L0-taxonomia.md), y por eso no clasifican ni bloquean `ready`.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md).

Cada cuenco se aplana con un morph continuo en una barra con marcas, una marca por fruta, como en el nodo 1. Lo nuevo no es la barra: es **qué se hace con varias**. Las barras del riel se apoyan una sobre otra alineadas por el inicio, y sus extremos derechos quedan unidos por una línea quebrada. Cuando el riel está en orden, esa línea solo sube: es una escalera. Cuando hay un escalón roto, la línea baja en un tramo y ese tramo se ilumina.

Se conserva la cantidad de marcas de cada barra mientras se ordenan; se desplaza lo que sobra, siempre hacia el extremo; nada se escala, porque una barra con más marcas es más larga por tener más marcas y no por estar estirada. La diferencia entre dos barras vecinas es el tramo que sobresale, y en la escalera es la altura del escalón.

Todavía no se muestran signos entre las barras, ni `<`, ni `>`, ni una recta con posiciones numeradas: eso último es el nodo 2, y el riel es lo que el nodo 2 va a acostar. Tampoco se muestra el conteo de la diferencia como número: cuántas sobran es `arith.sub.undo_add`, y acá solo se ve el tramo.

## 8. Transición a símbolos

El nodo termina en `visual` (`layers: [real, intuition, concrete, visual]`), así que su transición no llega a una expresión. Llega a la fila ordenada de numerales, y son cuatro morphs del mismo objeto, cada uno provocado por un gesto.

1. **Cuenco → barra.** Cuando el jugador resuelve su primer duelo emparejando dos cuencos completos en `concrete`, las dos filas se aplanan en dos barras con marcas y los puentes se contraen en líneas verticales cortas. Es el morph del nodo 1, y no se vuelve a narrar: se dispara y sigue.
2. **Duelo → escalón.** Al terminar un duelo, las dos barras se alinean por el inicio y el tramo que sobresale se ilumina y se separa un poco del resto de la barra. El sobrante deja de ser "unas frutas que quedaron" y pasa a ser un pedazo de barra con principio y fin.
3. **Riel → escalera.** Cuando el jugador completa el riel por primera vez, los extremos derechos de las barras se unen con una línea quebrada. Si el riel está en orden, la línea solo sube y se dibuja de un trazo; si hay un escalón roto, la línea se detiene ahí. Los huecos del riel se atenúan: la escalera ya dice lo mismo que ellos.
4. **Tarjeta → escalón numerado.** Las tarjetas se despegan de los cuencos y quedan pegadas al extremo de cada barra, en el escalón que le toca. Lo que queda en pantalla es una fila de numerales en orden, y esa fila es exactamente el objeto que el nodo 2 acuesta sobre el agua y convierte en pista.

En ningún paso hay dos objetos distintos que se alternan: la fruta con id estable se vuelve marca, la marca conserva su id dentro de la barra, y tocar un numeral ilumina las marcas que cuenta.

## 9. Notación matemática

Queda una escalera de barras con un numeral en cada extremo: los mismos numerales del nodo 1, ahora en fila y en orden.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), el nodo **no introduce ningún símbolo nuevo**, y conviene decir cuál se resiste y por qué. Los candidatos evidentes son `<` y `>`, y no aparecen acá porque el problema que los hace necesarios todavía no existe: mientras los dos cuencos están sobre la mesa, la escalera dibuja la comparación mejor que cualquier signo, y el signo sería un adorno. El problema llega cuando lo que se compara ya no se puede poner enfrente: dos expresiones armadas con fichas, donde no hay frutas que emparejar y hay que escribir el resultado de una comparación que no se ve. Eso es `prealg.ineq.compare_expressions`, con la balanza inclinada y la entrada de cheatsheet que le corresponde, y por eso este nodo tampoco declara entradas de cheatsheet: no hay nada escrito todavía que guardar.

Lo que sí aporta el nodo es una **convención de lectura**: la fila va de menos a más de izquierda a derecha. Es arbitraria, se fija acá con el riel, y todo el juego la respeta después: la pista del nodo 2 crece hacia la derecha, y el eje horizontal de `alg.fn.graph_as_picture` también.

## 10. Definición formal

El nodo no tiene capa `formal`: ni el YAML la declara ni el nivel 0 admite texto ([Q](../../Q-edad-universal.md)). La definición no se enuncia acá. Lo que el jugador ya jugó, y lo que un nodo posterior podrá decir en una frase con voz, es esto: entre dos colecciones pasa exactamente una de tres cosas, que una tenga más, que tenga menos o que tengan lo mismo; si la primera tiene más que la segunda y la segunda más que la tercera, la primera tiene más que la tercera; y tener más no depende del tamaño de las cosas ni de cómo estén acomodadas.

Condiciones que el jugador sintió sin nombrarlas: el duelo siempre termina (cada fruta encuentra pareja o sobra); ninguna colección tiene más que sí misma (el riel no tiene un hueco donde un cuenco se compare consigo); y dos colecciones que empatan comparten escalón, que es lo que `found.cmp.same_amount` va a convertir en igualdad.

## 11. Propiedades

- **De dos colecciones, exactamente una de tres cosas es cierta.** Ligada al tercer desenlace de `intuition` y al hueco que se ensancha: el empate no es un duelo fallido.
- **El orden se encadena.** Si A le gana a B y B a C, A le gana a C. Ligada a la segunda escena de `intuition` y a las cintas del octavo paso de la mecánica: con las cintas puestas, un cuenco nuevo entra con dos duelos.
- **Tener más no depende del tamaño ni de la disposición.** Ligada al `generalize` del locale: tres piedras grandes contra cinco chiquitas, y barras de distinto grosor con la misma cantidad de marcas.
- **Agregar una cosa mueve un escalón.** Cada fruta que entra en un cuenco sube su barra exactamente una marca, y si estaba empatada con otra ahora le gana. Es la semilla del paso del nodo 2 y del desplazamiento del nodo 3.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin texto:

- `recognize`: tres canastas con distinta cantidad y el riel con la punta gruesa; tocar la que va en la punta gruesa. Los distractores se generan con diferencias de una unidad y con una canasta de objetos más grandes pero menos numerosos.
- `explain`: dos animaciones sobre los mismos dos cuencos; en una el emparejamiento deja sobrante de un lado, en la otra del otro. Tocar la que miente. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones ([Q](../../Q-edad-universal.md)).
- `manipulate`: arrastrar tres canastas al riel hasta dejarlas de la que tiene menos a la que tiene más; una canasta fuera de lugar se corre sola un poco y late.
- `apply`: dos canastas desparramadas, sin filas; emparejar y tocar la que sobra, sin contar en voz alta.
- `generalize`: las mismas cantidades con objetos de distinto tamaño y con barras de distinto grosor; ordenar igual.
- `transfer`: dos caminos entre las mismas dos islas; tocar el más corto emparejando tramo con tramo, sin medir.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)). El YAML declara `misconceptions: []`: ninguna entrada del catálogo con regla `detect` apunta a este nodo, y en nivel 0 el error todavía no es conceptual sino perceptivo. Los distractores de `explain` y las opciones de `recognize` salen de la ruptura de la analogía y de tres deslices que el diseño prevé sin catalogar:

- **Ordenar por tamaño del objeto.** Tres piedras grandes van al hueco ancho. El juego ejecuta la respuesta: arma el riel como quedó y baja los dos cuencos del escalón roto a la franja, donde el emparejamiento deja sobrante del otro lado. Sin prompt de locale, porque no hay entrada en L; la voz repite la pregunta del ítem.
- **Ordenar por lo largo de la fila.** Un cuenco desparramado parece tener más. Mismo replay, con las frutas juntándose antes de emparejar.
- **Forzar un ganador en un empate.** El jugador insiste en separar dos cuencos empatados. El hueco se ensancha de nuevo y las dos barras quedan del mismo largo, superpuestas un instante.

Si alguno de los tres se repite con la regularidad que L0 llama sistemática, merece una entrada propia en `misconceptions.yaml` con patrón `replay_on_mechanic` sobre `ledger`; hoy el nodo no la tiene.

## 13. Generalización

La analogía se retira en `visual`, como declara `fades_at_layer`. La señal es el `generalize` del locale: piedras, conchas y barras sin dibujo. Cuando el jugador ordena barras de distinto grosor sin pedir las frutas, el cuenco ya no está haciendo nada.

Variantes que debe resolver sin la fruta: cinco colecciones en vez de tres; diferencias de una sola unidad, donde el bulto no ayuda; objetos de distinto tamaño; colecciones desparramadas frente a apiladas; dos empates en el mismo riel; y el riel armado con las cintas puestas, donde comparar de más está permitido pero no hace falta.

El nodo no tiene capa `abstract`. Su forma completa se considera alcanzada, dentro de `visual`, cuando el jugador ordena cinco colecciones sin emparejarlas todas contra todas, acepta el empate sin forzar un ganador y distingue tamaño de cantidad sin dudar. Lo que un nodo `abstract` diría —que el orden es una relación transitiva y tricotómica sobre los cardinales— no se enuncia nunca con fruta; aparece como invariante de un algoritmo en `csmath.alg.sorting_algorithm`, donde lo que se ordena ya no son cuencos.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área:

- `prealg.ineq.compare_expressions` (`balance`, `sorter`): la balanza queda inclinada a propósito y lo que se compara son dos expresiones armadas con fichas. No hay frutas que emparejar, y ahí nacen `<` y `>`, con el problema que este nodo no llegó a tener. El riel se vuelve un solo escalón dibujado como una barra que se inclina.
- `csmath.alg.sorting_algorithm` (`sorter`, `gears_sequence`): el riel con veinte fichas y la pregunta de en qué orden hacer los duelos. El invariante del ordenamiento es el de este nodo repetido: la parte ya ordenada es una escalera que solo sube. La transitividad deja de ser una comodidad y se vuelve la razón por la que el algoritmo termina.
- `geom.tri.inequality_shortest_path` (`construct`, `slope_walker`): dos caminos entre los mismos dos puntos, uno recto y otro quebrado. Comparar largos emparejando tramo con tramo, sin medir, es el mismo duelo con segmentos en vez de frutas.

Concepto siguiente: `found.cmp.same_amount` ([`found.cmp.same_amount`](../../C-knowledge-graph/graph/found.yaml), fuera de la espina). Frase puente, narrada sobre el riel terminado con dos cuencos en el mismo escalón: "Estos dos comparten hueco. Si les sacás una fruta a cada uno, ¿lo siguen compartiendo?". Los dos cuencos empatados se despegan del riel, quedan enfrentados sobre una barra que puede inclinarse, y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `sorter_rail_orders_by_amount` es la mecánica renderizada sobre el estado del jugador: los cuencos viajan a sus huecos con un retardo corto por cuenco, el conteo de cada uno sube desde cero al llegar, y el cuenco que quedó en el escalón roto se sacude sin salirse; gramática `partition`, parametrizada por la lista de cantidades y la semilla, produce los ítems de `recognize` y de `manipulate`. `ledger_bars_compare_overhang` es el duelo en su forma visual: dos barras alineadas por el inicio, un puente por par trazado con retardo corto, el tramo que sobresale marcado con una llave de longitud y el lado ganador iluminado; parametrizada por las dos cantidades, produce las dos animaciones de `explain` y los ítems de `apply`. Ninguna lleva texto rasterizado: el numeral de la tarjeta lo dibuja el runtime y las frutas son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** el nodo **no habilita ninguna operación** en `ready`, y la ausencia es deliberada ([M](../../M-calculadora/M0-progresion.md)). La tecla que le correspondería es `op_compare`, que dibuja `=`, `<` y `>`; esos tres signos nacen con la balanza en preálgebra y no antes, así que una tecla acá mostraría notación que el jugador todavía no vio nacer. `op_compare` llega, entonces, con `prealg.eq.balance` y `prealg.ineq.compare_expressions`, que son los nodos que la declaran. Lo único que este nodo aporta a la calculadora es lo que le da a esa tecla cuando llegue: el jugador que la toca ya sabe qué está preguntando, porque ordenó cuencos en un riel mucho antes.

**Edad universal:** el nodo es `literacy: none` y nivel 0, y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que empareja dos cuencos y los guarda en sus huecos, los targets son cuencos y huecos del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada, porque el brillo del cuenco que sobra, el escalón roto y el hueco que se ensancha dicen lo mismo. Un adulto no juega este nodo: el diagnóstico lo deja en `ready` provisional con un solo ítem de `recognize`, y solo vuelve si un nodo posterior decae hasta acá.
