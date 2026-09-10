# 53 — Pertenecer es cumplir la regla (`disc.set.membership_rule`)

> Locale `es`: "Pertenecer es cumplir la regla". Minijuego: [La tarjeta del cajón](../../F-minijuegos/disc.set.membership_rule.md).

**Nodo:** `disc.set.membership_rule` · **Área:** disc · **Nivel:** 2 · **Primitiva:** `partition` · **Mecánica principal:** `sorter` · **Literacy:** `icons` · **Analogía:** `sorting_bins`

## 1. Concepto

Un conjunto no es un montón de cosas: es una regla que decide, para cada objeto, si entra o no entra. Al terminar, el jugador arma la tarjeta de un cajón, decide la pertenencia de un objeto que nunca vio aplicándole la tarjeta y no comparándolo con lo que ya hay adentro, acepta que un cajón vacío sigue siendo un cajón, y escribe el resultado de un test sin volver a dibujar el cajón. Antes sabía separar objetos por color o por forma. No sabía que separar es contestar una pregunta de sí o no, ni que la pregunta puede escribirse.

## 2. Prerequisitos

- `found.sort.by_attribute`: separar por atributo. Se usa el gesto entero (el objeto que se suelta en un cajón y se queda ahí), la idea de que cada objeto va a un cajón y a uno solo, y la analogía `sorting_bins`. Es el único prerequisito de un nodo de espina que no está en la [espina](../../C-knowledge-graph/spine.yaml): es de nivel 0, no tiene prerequisitos propios y ningún concepto de la espina lo contiene, así que [J](../../J-adaptativo.md) lo prueba en el backfill que cubre los prerequisitos de espina que viven fuera de ella. Ascenderlo sería duplicar un gesto que ya se juega en el nodo 1.
- `prealg.var.unknown_as_box` (nodo [10](10-prealg.var.unknown_as_box.md)): la caja cerrada como nombre de algo que no se conoce. Se usa la letra: en `{x | x es rojo}` la `x` no es una incógnita que haya que despejar sino el nombre del objeto que se está probando, y sin ese nombre la regla no se puede escribir. También se hereda `variable_as_label`, que acá reaparece como leer esa `x` como el nombre del conjunto.

La arista con la incógnita no es la del orden escolar, que presenta los conjuntos como una lista entre llaves antes de cualquier álgebra y deja la comprensión para mucho después. [C0](../../C-knowledge-graph/C0-esquema.md) separa las dos cosas: la lista es un dibujo del cajón y no necesita ninguna letra; la regla sí, porque habla de un objeto cualquiera. Por eso el nodo llega después de la caja y no antes.

## 3. Dificultad cognitiva real

Lo difícil no es "hacer conjuntos". Son tres capacidades:

1. **Manda la regla, no la lista.** Un conjunto queda fijado por su tarjeta. Si mañana aparece en la lona un objeto que la cumple, ese objeto ya pertenecía: no se agrega, se descubre. La intuición empuja en sentido contrario, porque un cajón físico contiene lo que alguien puso adentro. Es la capacidad que sostiene todo lo que viene después y falla en `set_as_list_not_rule`.
2. **Pertenecer es sí o no, objeto por objeto.** No hay pertenencia parcial, ni pertenencia por parecido, ni pertenencia que dependa de cuántos hay. El cajón no tiene tapa a medio abrir. Esto es lo que hace que la respuesta se pueda escribir con un solo trazo y lo que después vuelve finita una tabla de verdad.
3. **Toda pregunta de pertenencia ocurre dentro de un universo.** "¿Es rojo?" no tiene respuesta hasta que se dice de cuáles objetos estamos hablando. La lona es ese universo, y moverla cambia las respuestas sin tocar la tarjeta. Es la capacidad que hace posible el "no" del nodo siguiente y la condición `P(B) > 0` de `prob.cond.conditional_and_independence`.

## 4. Problema intuitivo

Un patio con muchos objetos sueltos en el piso: piedras, conchas, hojas, algunas grandes, algunas chicas, de dos o tres colores. En un rincón, un cajón de madera con una tarjeta apoyada en la tapa, boca abajo. Alguien va tomando objetos y los suelta adentro: unos se quedan, otros salen despedidos y vuelven al piso.

En `intuition` la escena se detiene con un objeto en el aire, a medio camino. Tres desenlaces dibujados: se queda, sale despedido, o el cajón lo acepta y suelta otro que ya estaba adentro. El jugador elige y después ve. El tercer desenlace no ocurre nunca, y que no ocurra es la primera propiedad del nodo: lo que el cajón decidió sobre un objeto no cambia porque llegue otro.

Después la escena se repite con la tarjeta boca arriba y la pregunta cambia de dueño: ya no es "¿qué va a hacer el cajón?" sino "¿qué haría yo en su lugar?".

## 5. Analogía del mundo real

`sorting_bins`, sobre la mecánica `sorter` ([G0](../../G-analogias/G0-reglas.md)).

Mapa objeto a concepto: el cajón es el conjunto; el objeto es el elemento; soltar el objeto en el cajón es el test de pertenencia; el número en la etiqueta es la cardinalidad; reordenar lo que ya está adentro no cambia nada, que es la invariancia bajo biyección. A ese mapa este nodo le agrega dos piezas que el catálogo ya insinuaba y acá se vuelven centrales: la tarjeta de la tapa es la regla, y la lona sobre la que están los objetos es el universo.

Invariante que conserva: cada objeto recibe exactamente una respuesta, y la respuesta la da la tarjeta. Ni dos respuestas para el mismo objeto, ni ninguna.

Punto de ruptura: `infinite_collections`. Un cajón contiene una cantidad finita de cosas y ocupa un lugar. [G0](../../G-analogias/G0-reglas.md) rechaza "los conjuntos son cajas" como analogía general y acepta `sorting_bins` solo para pertenencia y cardinalidad finita, con retiro en la capa `visual`: es la analogía que antes se va del catálogo, y se va antes de que aparezca ningún símbolo.

Por qué esta y no otra. Cualquier analogía de contenedor arrastra el error de que el conjunto es lo que hay adentro, y `sorting_bins` lo arrastra también. Por eso el nodo la desmonta desde adentro: la tarjeta se vuelve el objeto importante y el cajón queda como una consecuencia de la tarjeta. La escena del cajón vacío es donde la analogía se desarma sola, y ese momento está puesto a propósito antes del retiro.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `sorter` ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. La lona con los objetos sueltos, el cajón con su tarjeta, y una bandeja de tarjetas abajo.
2. Demostración: una mano fantasma toma un objeto, lo suelta en el cajón y se queda; toma otro, lo suelta y el cajón lo devuelve al piso con un rebote. Después toca la tarjeta, que se da vuelta y muestra un dibujo. La mano vuelve a soltar el mismo objeto rechazado y ahora el rebote se entiende.
3. El jugador arrastra objetos. Cada aceptación deja un tic en el costado del cajón; cada rechazo deja una onda breve donde el objeto cayó. Nada se llama incorrecto: el rebote es toda la información.
4. El jugador toca la tarjeta y la arma él: elige un ícono de la bandeja y lo apoya en la tapa. El cajón se vacía solo y vuelve a recibir los objetos con la regla nueva. Los objetos son los mismos; el cajón es otro.
5. Momento del cajón vacío: si el jugador arma una tarjeta que ningún objeto de la lona cumple, el cajón se queda vacío y sigue ahí, con su tarjeta. No hay error ni mensaje. El cajón vacío es el que después obliga a escribir el conjunto por su regla, porque no hay nada que listar.
6. Momento de la lona: hay objetos afuera del borde. Arrastrar uno adentro puede llenar un cajón que estaba vacío; sacar uno puede vaciarlo. La tarjeta no cambió.
7. Verificación: tocar el cajón lo sacude, los objetos de adentro cambian de lugar, los tics no se mueven. Reordenar no es cambiar.

Con tres cajones a la vez aparece lo que un solo cajón no puede mostrar: un objeto que cumple dos tarjetas se duplica en un fantasma, uno por cajón, y los dos fantasmas laten juntos cuando se toca el objeto original. Es la imagen que el nodo siguiente convierte en solape.

## 7. Representación visual

Capa `visual`, primitiva dominante `partition` ([H](../../H-progresion-abstraccion.md)).

La lona se vuelve un rectángulo con borde; el cajón, una curva cerrada dibujada adentro; los objetos, puntos con su forma reducida a un ícono. La tarjeta queda apoyada en el borde de la curva. Lo que se parte es la lona: la curva la divide en dos regiones y ningún punto queda sobre la línea. Lo que se conserva son los puntos: ninguno cambia de color ni desaparece al cambiar la tarjeta, solo cambia de región.

Cuando hay tres cajones, las tres curvas se dibujan sin cruzarse todavía: separadas o una dentro de otra. El cruce es del nodo siguiente y acá se evita a propósito, para que el objeto que cumple dos tarjetas se vea como dos fantasmas en dos regiones distintas y no como una zona compartida. Así el solape llega como una novedad y no como algo que ya estaba dibujado.

Todavía no se muestra: ninguna operación entre cajones, ningún complemento pintado, ninguna tabla.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador. Ningún paso introduce más de un signo, y ningún renglón muestra dos signos nuevos a la vez.

1. **Cajón → curva cerrada.** Al repartir el mismo montón con dos tarjetas distintas, una después de otra, el cajón se aplana en una curva sobre la lona y los objetos se contraen en puntos. La tarjeta se despega de la tapa y queda apoyada en el borde de la curva: deja de ser parte del mueble y pasa a ser un objeto propio.
2. **Tic → `∈`.** Cada aceptación había dejado un tic en el costado. Al tocar un tic, el tic se despega, se endereza y se convierte en un signo; el ícono del objeto entra a la izquierda y la tarjeta se encoge a la derecha. Queda un renglón por respuesta.
3. **Tarjeta → letra.** Con tres curvas sobre la lona, señalar "esta tarjeta" deja de alcanzar, igual que en el nodo 10 dejó de alcanzar señalar "esta caja". La tarjeta se contrae en una letra mayúscula pintada sobre la curva, y el renglón queda `🔴 ∈ A`. La tarjeta se recupera tocando la letra y aparece como fantasma.
4. **Rebote → `∉`.** Al tocar la onda que dejó un rechazo, el renglón se escribe con el mismo signo cruzado por un trazo. Es un signo nuevo hecho de uno viejo más una raya, y por eso llega sin ceremonia: el jugador ya sabe leerlo antes de que se lo narren.
5. **Letra → `{x | …}`.** El paso solo se dispara cuando el cajón quedó vacío o cuando entró en la lona un objeto que nadie había puesto adentro. En los dos casos la lista de tics no describe el cajón. Al tocar la letra, la curva se abre y sus dos extremos se enderezan en las dos llaves; la caja cerrada del nodo 10 cae adentro como `x`; la tarjeta se acuesta a la derecha de un trazo vertical. Queda `A = {x | x es rojo}`.

## 9. Notación matemática

Nacen dos signos, en dos mitades distintas de la capa `symbolic`, y una convención de escritura.

`∈` nace del mismo problema que hizo nacer el `=` en el nodo 11: **registrar el resultado de una prueba sin volver a dibujar el aparato que la hizo**. Con un cajón y ocho objetos, mirar el cajón alcanza. Con tres cajones y veinte objetos, dibujar quién quedó dónde es más largo que la propia clasificación, y comparar dos repartos hechos en momentos distintos se vuelve imposible. Un renglón por respuesta lo resuelve. `∉` es el mismo renglón con un trazo, y aparece en cuanto el jugador quiere anotar un rechazo, que es la mitad de la información que produjo.

La letra mayúscula sobre la curva no es un símbolo nuevo sino una convención heredada: es la marca pintada del cajón, exactamente como `x` fue la marca pintada de la caja. Que los conjuntos lleven mayúscula y sus elementos minúscula es la única regla de escritura que el nodo agrega.

`{x | …}` nace del cajón vacío y del objeto recién llegado. Mientras el cajón tenga cosas adentro, listarlas es una descripción honesta: `A = {🔴, 🔺}`. Deja de serlo en dos momentos que el jugador ya vivió: cuando la tarjeta no acepta nada y la lista queda en blanco pero el cajón sigue existiendo, y cuando llega a la lona un objeto que cumple la tarjeta y que nadie soltó adentro. En los dos casos hace falta escribir la tarjeta, no el contenido, y para escribirla hace falta nombrar al objeto que se prueba. Ese nombre es la caja del nodo 10.

El trazo vertical de la llave se lee "tal que" y separa el objeto que se está probando de la regla que tiene que cumplir. No es el mismo trazo que aparece mucho más adelante en `P(A|B)`, donde a la derecha no hay una regla sino un mundo dentro del cual se mide; ese se introduce en su nodo con su propio problema.

Lo que **no** nace acá: el símbolo del conjunto vacío, que se guarda para `disc.set.union_intersection`, donde aparece como resultado de una operación y hace falta escribirlo dentro de un renglón; y todo símbolo de operación entre conjuntos.

## 10. Definición formal

Capa `formal`: texto corto con voz y la lona con dos curvas al lado. Tres frases, de a una.

"Un conjunto queda determinado por la regla que decide si un objeto le pertenece." "Pertenecer es un sí o un no: ningún objeto pertenece a medias, ni pertenece dos veces, ni deja de pertenecer porque lleguen otros." "Dos conjuntos son el mismo cuando no hay ningún objeto que esté en uno y no en el otro, aunque sus tarjetas sean distintas."

Condiciones y casos especiales, verificados sobre el objeto: la pregunta de pertenencia se hace siempre dentro de un universo, y cambiar el universo cambia las respuestas sin cambiar la regla; un conjunto puede quedar vacío y sigue siendo un conjunto; dos tarjetas distintas pueden nombrar el mismo conjunto hoy y dejar de nombrarlo mañana, cuando la lona cambie; y el orden y la repetición adentro del cajón no significan nada.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra conjunto, la palabra elemento y el caso de las dos tarjetas que coinciden por accidente.

## 11. Propiedades

- **La regla decide, uno por uno.** La respuesta para un objeto no depende de los demás objetos ni de en qué orden se probaron. Ligada al desenlace que nunca ocurre en `intuition`: el cajón jamás suelta algo que ya había aceptado. Cheatsheet `cs.disc.element_of`.
- **Reordenar no cambia el conjunto.** Ligada a sacudir el cajón y ver que los tics no se mueven. Es la misma invariancia que el nodo 1 usó para contar.
- **Un conjunto puede estar vacío.** Ligada a la tarjeta que no acepta nada y al cajón que se queda ahí igual. Es el caso que obliga a escribir la regla. Cheatsheet `cs.disc.set_builder_notation`.
- **La pertenencia se mide dentro de un universo.** Ligada al objeto que entra y sale de la lona cambiando la respuesta sin que nadie toque la tarjeta.
- **La misma tarjeta escrita distinto nombra el mismo conjunto.** Ligada a dos curvas que encierran exactamente los mismos puntos y se superponen al soltarlas una sobre la otra.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), instanciados dentro de la mecánica. Las probes del locale, desarrolladas:

- `recognize`: cuatro cajones con tarjetas distintas y una pieza en la mano del jugador. Tocar el cajón que la acepta. Los distractores los genera `detect`: el cajón cuya tarjeta comparte un rasgo con la pieza pero no el de la regla, el cajón que ya tiene adentro piezas parecidas a la de la mano, y el cajón vacío cuya tarjeta también la aceptaría.
- `explain`: la misma pieza se suelta en dos cajones y uno la devuelve. Tres animaciones de por qué: la tarjeta se aplica a la pieza y el rebote coincide con lo que dice; la pieza se compara con las que ya están adentro y entra por parecido; la pieza se queda afuera porque el cajón "ya está lleno de otra cosa". Tocar la que muestra lo que pasa. Cada distractor es una de las dos ramas de la misconception del nodo.
- `manipulate`: la lona llena y un cajón con la tarjeta a la vista. Repartir todo. El cajón responde a cada suelta y el jugador corrige desde el estado real.
- `apply`: sin soltar la pieza, marcar si entra o no entra, y recién después probar. Se puntúa la predicción, no el reparto.
- `generalize`: armar una tarjeta que deje el cajón vacío y otra que acepte todo lo que hay en la lona, y después arrastrar una pieza nueva a la lona sin que ninguna de las dos tarjetas cambie de sentido.
- `transfer`: en la familia de cuadriláteros de `geom.class.quadrilateral_hierarchy`, soltar el cuadrado en todos los cajones que lo aceptan. La regla no es un color sino una propiedad que hay que verificar sobre la figura, y el cajón la verifica trazando.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`set_as_list_not_rule`**, patrón `replay_on_mechanic` sobre `sorter`. Dos formas superficiales con la misma regla: dejar afuera una pieza que llegó a la lona después del reparto y cumple la tarjeta, o declarar que una pieza que está en el piso "todavía no pertenece". El juego congela, reproduce el reparto del jugador y después aplica la tarjeta a la pieza discutida, sola y en cámara lenta: el ícono se apoya sobre la pieza y coincide, y el cajón se abre sin que nadie la empuje. Voz: "La tarjeta dice que sí. ¿Hace falta que alguien la ponga adentro?". La lona queda como estaba y el jugador sigue desde ahí, que es un estado válido. Es la de mayor severidad del nodo porque rompe su invariante central.

Los distractores de `explain` y las opciones de `recognize` se generan desde las dos ramas de esa regla más `variable_as_label`, heredada del prerequisito directo: leer la `x` de `{x | x es rojo}` como el nombre del conjunto y no como el objeto que se prueba. Se explica sobre el libro de cuentas, que este nodo no declara; el jugador ya lo conoce desde el nodo 10, así que la explicación corre allí presentada como un regreso, según la regla 2 de [L0](../../L-modelo-errores/L0-taxonomia.md).

## 13. Generalización

La analogía se retira en `visual`, la retirada más temprana del catálogo. En cuanto el cajón se aplana en una curva sobre la lona, la madera desaparece y no vuelve: lo que queda es una región y una tarjeta. El jugador puede pedir el cajón con un toque hasta el final de `symbolic` y casi nunca lo hace, porque el momento del cajón vacío ya le sacó al contenedor su papel protagónico.

Variantes sin ayuda visual, en orden: reglas sobre un rasgo compuesto que no se combina ("las piezas con agujero al medio"); reglas numéricas de igualdad ("las que tienen tres puntos"); reglas que hablan de la posición del objeto en la lona y cambian cuando la lona cambia; reglas sobre objetos tapados, con las respuestas dadas de a una; y tarjetas sobre cosas que no son objetos, como los movimientos de un juego o las palabras de una lista.

El nodo está en `abstract` cuando el jugador decide la pertenencia de algo que nunca vio aplicando la regla y sin buscar parecidos, escribe un conjunto por comprensión sin dibujar nada, y contesta qué le pasa a un conjunto cuando cambia el universo sin que la regla cambie. La forma completa de esa capa llega con los cuantificadores, en `disc.logic.quantifiers_as_search`, donde la pregunta deja de ser por un objeto y pasa a ser por todos.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mano que no es la de este nodo:

- `geom.class.quadrilateral_hierarchy` (`sorter` con `construct`): los cajones están anidados y la tarjeta no se lee mirando la figura sino trazando sobre ella. Todo cuadrado es rectángulo porque cumple la tarjeta del rectángulo, no porque se le parezca; y el jugador lo verifica con un trazo, no con la vista. Es la transferencia más dura del nodo porque el test cuesta trabajo.
- `prob.basic.sample_space_grid` (`tiles` con `urn_dice`): la grilla de resultados es la lona y un evento es la tarjeta que decide qué celdas cuentan. La pertenencia deja de ser una propiedad del objeto y pasa a ser una propiedad de un resultado posible.
- `graph.color.map_coloring` (`network_routes` con `sorter`): cada color es un cajón y la tarjeta dice "ninguno de tus vecinos está acá". Es la primera regla de pertenencia que depende de quién ya está adentro, y por eso vale como transferencia: el jugador tiene que notar que sigue siendo una regla y no una lista.

La barra vertical de la llave vuelve mucho más adelante en `prob.cond.conditional_and_independence`, con otra lectura: a la derecha no hay una regla sino el mundo dentro del cual se mide. Ese nodo la presenta como propia y hace bien, porque el problema que la hace necesaria allá es distinto del de acá; lo que transfiere no es el trazo sino la costumbre de decir explícitamente sobre qué se está preguntando.

Concepto siguiente: `disc.logic.and_or_not` ([54](54-disc.logic.and_or_not.md)). Frase puente, narrada sobre la lona con dos curvas separadas y una pieza que late en las dos: "Esta pieza cumple las dos tarjetas y tuvo que elegir cajón. ¿Y si los cajones se cruzan?". Las dos curvas se acercan hasta encimarse y el nodo 54 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `sorter_scene_rule_card_decides` es nativa y es la escena central: los objetos van al cajón y se quedan o rebotan según la tarjeta, con el contador de tics al costado; parametrizada por el montón, por la regla y por si la tarjeta está a la vista, produce también las animaciones de `explain` y las opciones de `recognize`. `sorter_scene_bin_to_set_builder` es un clip corto con entrega a la escena nativa del mismo id: la curva se abre, sus extremos se enderezan en las dos llaves, la caja del nodo 10 cae adentro y la tarjeta se acuesta a la derecha del trazo; es la imagen de cheatsheet de `cs.disc.set_builder_notation`. Ninguna lleva texto rasterizado: la letra del conjunto, los íconos de la tarjeta y los contadores los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsa `sorter_number_card_on_bin` (nodo 1) para el contador de la etiqueta.

**Calculadora:** en `ready` se habilita `op_set_ops` ([M](../../M-calculadora/M0-progresion.md)), recortada: arma un conjunto a partir de una regla, contesta si un elemento pertenece y dibuja la lona con la región pintada al lado de la respuesta. Las operaciones entre conjuntos del mismo ícono quedan apagadas hasta `disc.set.union_intersection`. Si el nodo decae, la región deja de pintarse y queda solo el sí o el no.

**Edad universal:** el nodo es `icons` porque las tarjetas llevan un ícono con una etiqueta de una palabra y la etiqueta del cajón lleva un número ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: soltar objetos, ver el rebote, dar vuelta la tarjeta, armarla desde la bandeja, elegir entre animaciones en `explain`, prompts por voz; `real` e `intuition` se juegan enteras con el sonido apagado. Un adulto llega por diagnóstico salteando esas dos capas y entra en el reparto con tres cajones; lo que no se le saltea es el momento del cajón vacío, porque es el único lugar donde la lista deja de alcanzar y la escritura por comprensión se vuelve necesaria en vez de decorativa.
