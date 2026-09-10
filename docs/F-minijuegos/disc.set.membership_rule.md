# La tarjeta del cajón (`disc.set.membership_rule`)

Minijuego del nodo 53 de la espina, "Pertenecer es cumplir la regla". Mecánica `sorter`; analogía `sorting_bins`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/53-disc.set.membership_rule.md): un concepto, tres dificultades reales (manda la regla y no la lista, pertenecer es sí o no, toda pregunta ocurre dentro de un universo), una analogía de contenedor que el propio nodo desmonta, un gesto central (soltar el objeto y ver si rebota), cinco pasos de desvanecimiento, la lona partida en dos regiones como visualización dominante, retiro de la analogía en `visual`. Acá se fija cómo se juega.

## Analogía

Un patio con objetos sueltos sobre una lona con borde: piedras, conchas y hojas, grandes y chicas, de dos o tres colores. En un rincón, un cajón de madera con una tarjeta apoyada en la tapa. Los objetos que se sueltan adentro se quedan o rebotan al piso.

Mapa objeto a concepto: el cajón es el conjunto; el objeto es el elemento; soltar el objeto en el cajón es el test de pertenencia; el rebote es la respuesta negativa; el tic en el costado es la respuesta registrada; el número de la etiqueta es la cardinalidad; reordenar lo de adentro no cambia nada; la tarjeta de la tapa es la regla; la lona es el universo.

Punto de ruptura: `infinite_collections`. Un cajón contiene una cantidad finita y ocupa un lugar; un conjunto infinito no cabe y un conjunto puede ser elemento de otro. [G0](../G-analogias/G0-reglas.md) acepta `sorting_bins` solo para pertenencia y cardinalidad finita y la retira en `visual`, la retirada más temprana del catálogo. El minijuego se apoya en eso: la escena del cajón vacío desarma la lectura de contenedor desde adentro, antes de que la madera desaparezca.

## Mecánica central

Superficie: la lona con los objetos arriba, el cajón con su tarjeta en el centro, la bandeja de tarjetas abajo y el contador pegado al costado del cajón. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Soltar un objeto en el cajón.** Si la tarjeta lo acepta, se queda y deja un tic en el costado. Si no, rebota al piso con una onda breve. El objeto no se destruye ni se marca: vuelve a estar disponible.
- **Tocar la tarjeta.** Se da vuelta y muestra la regla. Con la tarjeta a la vista el rebote deja de ser una sorpresa y pasa a ser predecible, y el juego empieza a pedir la predicción antes de soltar.
- **Armar la tarjeta desde la bandeja.** El jugador apoya un ícono en la tapa. El cajón se vacía solo y vuelve a recibir. Los objetos son los mismos; el cajón es otro.
- **Sacudir el cajón.** Los objetos de adentro cambian de lugar y los tics no se mueven. Reordenar no cambia el conjunto.
- **Arrastrar un objeto dentro o fuera de la lona.** Las respuestas cambian sin que la tarjeta se toque. Un objeto fuera de la lona no tiene respuesta: el cajón ni siquiera reacciona cuando se lo acerca.
- **Poner tres cajones a la vez.** Un objeto que cumple dos tarjetas se duplica en dos fantasmas, uno por cajón, que laten juntos al tocar el original. Es la imagen que el nodo 54 convierte en solape.

En `symbolic` la superficie cambia de forma, no de reglas: tocar un tic escribe el renglón con `∈`, tocar una onda lo escribe con `∉`, y tocar la letra del cajón abre la llave con la regla adentro. Soltar un objeto sigue siendo soltar un objeto, y cada suelta agrega un renglón.

## Invariante matemático

`every_object_exactly_one_bin` (clasificador). Cada objeto de la lona recibe exactamente una respuesta y la da la tarjeta: ni dos respuestas para el mismo objeto, ni ninguna, ni una respuesta a medias.

Se ve romperse de tres maneras, y las tres son gestos que el jugador intenta. Sostener un objeto sobre el borde del cajón: no queda a medio entrar, el cajón lo atrae o lo rechaza en cuanto se suelta. Intentar poner el mismo objeto en dos cajones a la vez con dos dedos: aparecen los dos fantasmas y el original se queda donde estaba, porque el objeto es uno. Y acercar al cajón un objeto que está fuera de la lona: el cajón no reacciona, porque la pregunta no está hecha todavía.

Un movimiento válido pero inútil, como armar una tarjeta que acepta absolutamente todo lo que hay en la lona, no rompe nada: el cajón se llena entero y el afuera queda vacío. Empujón suave, no explicación. Ese caso vuelve como material en el nivel 7.

## Representación visual

Primitiva dominante `partition` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el patio, los objetos, el cajón con la tarjeta boca abajo. Solo se mira y se predice qué va a hacer el cajón con el objeto que está en el aire.
- `concrete`: lona, objetos, cajón, tarjeta a la vista y bandeja de tarjetas. El contador de tics al costado. Nada escrito salvo el ícono de la tarjeta.
- `visual`: la lona se vuelve un rectángulo con borde, el cajón una curva cerrada adentro y los objetos puntos con su ícono reducido. La tarjeta queda apoyada en el borde de la curva. Con tres cajones, tres curvas separadas o anidadas, nunca cruzadas.
- `symbolic`: renglones con `∈` y `∉`, la letra mayúscula sobre la curva, y la llave con la regla adentro. La curva se pide con un toque y aparece como fantasma.
- `formal`: las tres frases con voz, la lona con dos curvas al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cajón a curva cerrada: al repartir el mismo montón con dos tarjetas distintas, una después de otra, el cajón se aplana en una curva sobre la lona, los objetos se contraen en puntos y la tarjeta se despega de la tapa.
2. Tic a `∈`: al tocar un tic, se despega, se endereza y se convierte en el signo; el ícono del objeto entra a la izquierda y la tarjeta se encoge a la derecha.
3. Tarjeta a letra: con tres curvas sobre la lona, señalar deja de alcanzar y la tarjeta se contrae en una letra mayúscula pintada sobre la curva, igual que la marca de la caja del nodo 10 se contrajo en `x`.
4. Rebote a `∉`: al tocar la onda de un rechazo, el renglón se escribe con el mismo signo cruzado por un trazo.
5. Letra a `{x | …}`: el paso se dispara solo cuando el cajón quedó vacío o cuando entró en la lona un objeto que nadie puso adentro. La curva se abre, sus extremos se enderezan en las dos llaves, la caja del nodo 10 cae adentro como `x` y la tarjeta se acuesta a la derecha del trazo vertical.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la lona con dos curvas: un conjunto queda determinado por la regla que decide si un objeto le pertenece; pertenecer es un sí o un no, y ningún objeto pertenece a medias, ni dos veces, ni deja de pertenecer porque lleguen otros; dos conjuntos son el mismo cuando no hay ningún objeto que esté en uno y no en el otro, aunque sus tarjetas sean distintas.

Notación: `a ∈ A`, `b ∉ A`, `A = {🔴, 🔺}` por lista y `A = {x | x es rojo}` por regla. La letra mayúscula para el conjunto y la minúscula para el elemento son la única convención de escritura que el nodo agrega. Símbolos nuevos: `∈`, que nace de registrar el resultado de una prueba sin volver a dibujar el cajón, exactamente como el `=` del nodo 11; y la llave con el trazo vertical, que nace del cajón vacío y del objeto recién llegado, los dos momentos en que la lista deja de describir el conjunto. El trazo se lee "tal que" y separa el objeto que se prueba de la regla que tiene que cumplir.

Casos especiales: un conjunto puede quedar vacío y sigue siendo un conjunto; la pregunta de pertenencia se hace siempre dentro de un universo y cambiar el universo cambia las respuestas sin cambiar la regla; dos tarjetas distintas pueden nombrar el mismo conjunto hoy y dejar de hacerlo mañana.

Entradas de cheatsheet que agrega el nodo: `cs.disc.element_of` en la primera mitad de `symbolic` y `cs.disc.set_builder_notation` en la segunda.

## Generalización

La analogía se retira en `visual`: cuando el cajón se aplana en curva, la madera no vuelve. El jugador puede pedirla con un toque hasta el final de `symbolic` y casi nunca lo hace, porque el momento del cajón vacío ya le sacó al contenedor su papel protagónico.

Variantes sin ayuda visual: reglas sobre un rasgo compuesto que no se combina ("las que tienen agujero al medio"); reglas numéricas de igualdad ("las que tienen tres puntos"); reglas que hablan de la posición del objeto en la lona y cambian cuando la lona cambia; reglas sobre objetos tapados, con las respuestas dadas de a una; y tarjetas sobre cosas que no son objetos, como los movimientos de un juego o las palabras de una lista. Cuando el jugador decide la pertenencia de algo que nunca vio aplicando la regla y sin buscar parecidos, y contesta qué le pasa al conjunto cuando cambia el universo, la analogía se eliminó.

## Desafío

Correspondencia con las etapas de desvanecimiento de la mecánica ([H](../H-progresion-abstraccion.md)): los niveles 1 y 2 son `picture_bins`, los niveles 3 y 4 son `labeled_bins`, el 5 y el 6 son `rule_card` con el paso a `set_notation`, y el 7 es `set_notation` completo.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Entra o no entra.** `concrete`, `manipulate`. Un cajón, tarjeta a la vista con un ícono de color, ocho a doce objetos que se distinguen por un solo rasgo. Soltar todo.
2. **La tarjeta boca abajo.** `concrete`, `recognize` y `explain`. Parámetros: la tarjeta empieza dada vuelta, los objetos varían en dos rasgos para que la regla no sea obvia, y hay más objetos. El jugador infiere la regla mirando qué se queda y después toca la tarjeta correcta entre cuatro.
3. **La lona y la curva.** `visual`, `explain` y `manipulate`. El cajón se aplana en curva, los objetos son puntos, aparece el borde de la lona y con él el objeto que no tiene respuesta.
4. **Tres cajones a la vez.** `visual`, `apply`. Parámetros: tres curvas sobre los mismos objetos, tarjetas que se pisan, y el objeto que cumple dos y se duplica en fantasmas. Predicción antes de soltar.
5. **El tic se vuelve un renglón.** `symbolic` primera mitad, `manipulate` y `apply`. Aparecen `∈`, `∉` y la letra sobre la curva. Cada suelta escribe un renglón sincronizado con el reparto.
6. **El cajón vacío.** `symbolic` segunda mitad, `apply`. Tarjetas que no aceptan nada y objetos que llegan a la lona después del reparto. La lista falla y aparece la llave con la regla. Aparece `set_as_list_not_rule`.
7. **Reglas que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz, reglas sobre objetos tapados y tarjetas sobre cosas que no son objetos.

Qué endurece cada parámetro: la tarjeta dada vuelta obliga a inferir la regla en vez de aplicarla, que es la mitad menos practicada del gesto; el segundo rasgo rompe la lectura "la regla es el color"; el borde de la lona rompe la idea de que toda pregunta tiene respuesta; los tres cajones rompen la asociación entre un objeto y un solo destino y preparan el solape del nodo 54; y los objetos que llegan tarde son el material con el que se detecta la misconception del nodo.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo es requisito de dos. `ch.disc.socks_in_the_dark`, de nivel `regional`, donde el dato oculto es la peor secuencia posible de extracciones y aparece armando un cajón por color y llenándolos de a uno; la tarjeta de cada cajón es lo que hace que la cuenta del peor caso sea evidente. Y `ch.disc.which_or_did_the_sign_mean`, compartido con el nodo 54, donde antes de decidir qué quiere decir el cartel hay que aceptar que cada persona cae en una y solo una de las cuatro regiones. En los dos la cheatsheet está abierta de entrada y `cs.disc.set_builder_notation` aparece en el segundo.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro cajones con tarjetas distintas y una pieza roja con tres puntos en la mano. Tocar el cajón que la acepta. Los distractores son el cajón que comparte un rasgo que no es el de la regla, el que ya tiene piezas parecidas adentro y un cajón vacío cuya tarjeta también la aceptaría.
- `explain`: la misma pieza se suelta en dos cajones y uno la devuelve; elegir entre tres animaciones. La tarjeta se apoya sobre la pieza y el rebote coincide con lo que dice; la pieza entra por parecerse a las que ya están adentro; la pieza se queda afuera porque el cajón "ya está lleno de otra cosa". Tocar la que muestra lo que pasa. El distractor elegido clasifica.
- `manipulate`: lona llena, un cajón con la tarjeta a la vista. Repartir todo, corrigiendo desde el estado real después de cada rebote.
- `apply`: con la pieza en la mano y sin soltarla, marcar entra o no entra, y recién después probar. Se puntúa la predicción.
- `generalize`: armar una tarjeta que deje el cajón vacío y otra que acepte todo lo que hay en la lona; después arrastrar una pieza nueva a la lona y decir qué le pasa a cada uno de los dos conjuntos sin volver a repartir.
- `transfer`: en la familia de cuadriláteros de `geom.class.quadrilateral_hierarchy`, soltar el cuadrado en todos los cajones que lo aceptan, con la regla verificada por trazo. También `prob.basic.sample_space_grid` (el evento como tarjeta sobre la grilla de resultados) y `graph.color.map_coloring` (el color como cajón cuya regla mira a los vecinos).

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `set_as_list_not_rule`, patrón `replay_on_mechanic` sobre el clasificador. Dos formas superficiales con la misma regla: dejar afuera una pieza que llegó después del reparto y cumple la tarjeta, o declarar que una pieza que está en el piso "todavía no pertenece". El juego congela, reproduce el reparto y después aplica la tarjeta a la pieza discutida, sola y en cámara lenta: el ícono se apoya sobre la pieza y coincide, y el cajón se abre sin que nadie la empuje. Voz: "La tarjeta dice que sí. ¿Hace falta que alguien la ponga adentro?". La lona queda como estaba y el jugador sigue desde ahí. Es la de mayor severidad del nodo.

Los distractores de `explain` y las opciones de `recognize` se generan desde las dos ramas de esa regla más `variable_as_label`, heredada del prerequisito directo: leer la `x` de `{x | x es rojo}` como el nombre del conjunto. Esa misconception se explica sobre el libro de cuentas, que este nodo no declara; como el jugador lo conoce desde el nodo 10, la explicación corre allí presentada como un regreso, según la regla 2 de [L0](../L-modelo-errores/L0-taxonomia.md): dos columnas que no se funden en una, con la caja del nodo 10 en la fila que le corresponde.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `sorter_scene_rule_card_decides`, nativa. Los objetos van al cajón y se quedan o rebotan según la tarjeta, con el contador de tics al costado; parametrizada por el montón, por la regla y por si la tarjeta está a la vista. Produce también las animaciones de `explain` y las miniaturas de `recognize`.
- `sorter_scene_bin_to_set_builder`, clip corto con entrega a la escena nativa del mismo id. La curva se abre, sus extremos se enderezan en las dos llaves, la caja del nodo 10 cae adentro y la tarjeta se acuesta a la derecha del trazo. Es la imagen de cheatsheet de `cs.disc.set_builder_notation`.
- Reusada: `sorter_number_card_on_bin` (nodo 1), para el contador de la etiqueta del cajón.

Ninguna lleva texto rasterizado: la letra del conjunto, los íconos de la tarjeta y los contadores los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_object_heap`: `traits` (cuántos rasgos distinguen a los objetos, 1 en el nivel 1, 2 desde el 2, 3 desde el 4); `values_per_trait` (2 o 3); `total_range` (8 a 24); `off_mat_count` (cuántos objetos quedan fuera de la lona, cero hasta el nivel 2); `seed`.
- `gen_rule_card`: `kind` en {rasgo simple, rasgo compuesto sin conectivo, igualdad numérica, posición en la lona}; `face_down`; `accepts_none` (habilita la tarjeta que deja el cajón vacío, desde el nivel 6); `accepts_all`; `seed`.
- `gen_bin_layout`: `bins` (1 hasta el nivel 3, 3 desde el 4); `nesting` en {separados, anidados}; `overlapping_cards` (tarjetas que aceptan piezas en común, sin dibujar cruce); `seed`.
- `gen_late_arrival`: `when` (después de cuántas sueltas llega la pieza nueva); `satisfies` (si la pieza que llega cumple o no la tarjeta); `seed`. Es el generador que produce los ítems donde se detecta `set_as_list_not_rule`.

**Literacy soportada:** de `icons` a `full_text`. Soltar, ver el rebote, dar vuelta la tarjeta y armarla desde la bandeja se juegan sin leer, y las capas `real` e `intuition` se juegan enteras con el sonido apagado. El mínimo es `icons` porque las tarjetas llevan un ícono con una etiqueta de una palabra y la etiqueta del cajón lleva un número. En `full_text` las tres frases de la definición se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma suelta un objeto en el cajón y se queda; suelta otro y el cajón lo devuelve con un rebote; toca la tarjeta, que se da vuelta; vuelve a soltar el objeto rechazado y el rebote se repite. La escena vuelve al inicio y la tarjeta late. La demostración de separar por atributo no se repite: es la de `found.sort.by_attribute` ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, tolerancia de la predicción de `apply`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
