# 37 — Puntos unidos por líneas (`graph.basic.graph_and_paths`)

> Locale `es`: "Puntos unidos por líneas". Minijuego: [Islas y puentes](../../F-minijuegos/graph.basic.graph_and_paths.md).

**Nodo:** `graph.basic.graph_and_paths` · **Área:** graph · **Nivel:** 1 · **Primitiva:** `relate` · **Mecánica principal:** `network_routes` · **Literacy:** `none` · **Analogía:** `city_routes`

## 1. Concepto

Un grafo es un dibujo de relaciones: puntos y líneas que dicen quién está unido con quién, y nada más. Dónde queda cada punto en la hoja no importa. Al terminar, el jugador reconoce dos redes como la misma aunque estén dibujadas distinto, agrega puentes hasta lograr que se pueda ir de una isla a otra, cuenta cuántos puentes salen de un punto y arma con puntos y líneas una situación que no venía dibujada. Antes sabía contar cosas. Ahora sabe contar y dibujar vínculos entre cosas, que es lo primero que hace falta para todo lo que viene en el área.

## 2. Prerequisitos

- `found.count.cardinality` (nodo [01](01-found.count.cardinality.md)): contar dice cuántos hay. Se usa la correspondencia uno a uno, que en este nodo es exactamente el gesto de recorrer: un paso por puente, sin saltear y sin volver a pasar por el mismo. Se usa también la cardinalidad, para contar cuántos puentes salen de una isla. Y se usa un objeto que ya apareció allí: `network_routes` es una de las mecánicas secundarias del nodo 01, donde los puentes se tendían de la fruta al contador. El jugador llega conociendo el gesto de unir dos puntos.

Es el único prerequisito y eso es lo notable del nodo: no hace falta sumar, ni multiplicar, ni leer. La escuela pone la teoría de grafos al final de todo, en la universidad o cerca. [C0](../../C-knowledge-graph/C0-esquema.md) la pone en el nivel 1 porque su contenido no es aritmético: es una manera de mirar. Un chico de cinco años que sabe contar puede resolver honestamente los primeros niveles de este nodo, y lo que aprende ahí es lo que después sostiene los árboles de factores, las matrices de rutas y las cadenas de Markov.

## 3. Dificultad cognitiva real

Lo difícil no es dibujar puntos y líneas. Son tres capacidades:

1. **Separar la conexión del dibujo.** Dos redes con las mismas uniones son la misma red, aunque una tenga las islas en fila y la otra en círculo, y aunque una tenga los puentes cruzados. El jugador tiene que aprender a mirar a través de la posición. Es el invariante `connections_independent_of_drawing`, y es lo más difícil del nodo porque toda la experiencia previa del jugador con dibujos dice lo contrario.
2. **Leer alcance en vez de cercanía.** Dos islas pueden estar pegadas en la hoja y no tener puente, y dos islas en puntas opuestas pueden estar unidas. Se llega o no se llega, y eso no se ve de un vistazo: hay que recorrer.
3. **Distinguir recorrer de recorrer sin repetir.** Ir de una isla a otra dando vueltas y pasando dos veces por el mismo lugar es un recorrido válido, pero no es lo mismo que ir por un camino. La diferencia todavía no tiene nombre, y sin embargo el jugador la necesita en cuanto se le pide la menor cantidad de puentes. Es `path_vs_walk_confusion`.

## 4. Problema intuitivo

Un archipiélago visto desde arriba. Islas de distintos tamaños, algunas con puentes de madera entre ellas, otras sin ninguno. Una figura chiquita está parada en una isla roja y quiere llegar a la isla azul. La pregunta, sin una sola palabra: ¿puede llegar?

En `real` la escena es filmada desde arriba y la figura camina sola por los puentes que hay. En `intuition` la escena se detiene con la figura quieta y tres desenlaces dibujados: la figura llega dando una vuelta larga; la figura llega derecho; la figura se queda en el borde de una isla sin puente y no puede seguir. El jugador toca uno y después ve qué pasa. En ninguna capa aparece texto. La pregunta la hace la escena: la figura mira hacia la isla azul y espera.

## 5. Analogía del mundo real

`city_routes`, la analogía del YAML, sobre la mecánica `network_routes` ([G0](../../G-analogias/G0-reglas.md)). En este nodo se viste de archipiélago, porque las islas hacen evidente que sin puente no se llega; en los nodos hermanos del área la misma analogía se viste de ciudad y de mapa de trenes.

Mapa objeto a concepto: un lugar es un vértice; un camino o un puente es una arista; un viaje siguiendo caminos es un recorrido, y sin repetir lugares es un camino; el largo de un camino es el peso de la arista, que en este nodo todavía no se usa; una isla sin puente es una componente desconectada; un viaje que vuelve al punto de partida es un ciclo; el viaje más barato es el camino más corto, que llega mucho más adelante.

Invariante que conserva: quién está conectado con quién. Las islas se pueden arrastrar por toda la pantalla y los puentes se estiran como elásticos sin soltarse. Después de mover todo, las mismas islas siguen unidas a las mismas islas.

Punto de ruptura: `drawing_position_matters`. La analogía falla justo donde la posición sí importa, por ejemplo cuando hay que dibujar la red sin que los puentes se crucen. Ese es el tema de `graph.planar.no_crossing_euler_formula` y por eso acá la analogía se retira en `formal`.

Por qué esta y no otra. Se probó también la red de amigos, y funciona para el grado y para el lema del apretón de manos, pero no para la conexión: dos personas que no se conocen igual se pueden hablar, y eso arruina la idea de que sin arista no hay paso. Las islas no dejan lugar a dudas: sin puente, el agua.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `network_routes`, y por eso el nodo no necesita la convención de mecánica principal y secundaria ([E0](../../E-mecanicas/E0-catalogo.md)).

Gestos: `tap` y `drag`. No hay ningún otro, y ninguno requiere leer.

1. El archipiélago con las islas y los puentes que hay. Una figura parada en la isla roja y una bandera en la isla azul.
2. Demostración: una mano fantasma toca la isla roja, después una isla vecina, después otra, hasta la azul. Cada toque enciende un puente y la figura camina por él. Cuando llega, la bandera se levanta. La escena vuelve al inicio y la isla roja late.
3. El jugador toca islas en orden. Si la isla que toca no tiene puente con la que está, la figura se acerca al borde, mira el agua y no cruza. El puente que falta no se dibuja solo. El estado no se borra: la figura queda donde estaba y se puede seguir desde ahí.
4. El jugador arrastra de una isla a otra. Se construye un puente. En los niveles donde hay un presupuesto de madera, el presupuesto baja, y ese es el único límite.
5. El jugador arrastra una isla por la pantalla. Los puentes se estiran como elásticos y no se sueltan. Nada cambia: la figura sigue pudiendo hacer el mismo viaje. Este gesto es el corazón del nodo.
6. Verificación: al tocar la bandera, la figura repite el viaje entero a velocidad rápida y cada isla por la que pasa se enciende. Si pasa dos veces por una isla, esa isla se enciende dos veces y se nota.

Nada se llama incorrecto y no hay una sola palabra escrita. Intentar cruzar donde no hay puente tiene su respuesta física; gastar más puentes de los necesarios deja madera sin usar en el borde y el nivel no se cierra hasta que se usa el mínimo, sin que nada lo diga.

## 7. Representación visual

Capa `visual`, primitiva `relate` ([H](../../H-progresion-abstraccion.md)).

Lo que se desplaza son las islas, que se pueden llevar a cualquier lado. Lo que no se escala nunca son las relaciones: los puentes se estiran y se acortan, cambian de largo y de curvatura, y siguen uniendo lo mismo. Lo que se conserva, y es lo único que se conserva, es la lista de pares unidos.

La imagen que define el nodo es la del mismo grafo dibujado dos veces. Las dos versiones aparecen lado a lado, se resaltan a la vez los mismos pares de islas en las dos, y después una se deforma continuamente hasta caer encima de la otra. Ninguna arista se corta ni se crea durante la deformación, y eso es lo que hay que ver.

Las islas se van simplificando a medida que sube la capa: primero son islas con textura, después contornos, después puntos. Los puentes pasan de tablones a líneas. El paso de isla a punto es tan importante como el de línea a arista, porque es donde se pierde el tamaño: una isla grande y una chica pasan a ser dos puntos iguales, y eso ya dice que el tamaño nunca importó.

Todavía no se muestran las reglas sobre qué se puede repetir, ni el grado como número asociado a cada punto, ni los pesos. Eso es `graph.walk.repeat_rules` y `graph.deg.handshake_lemma`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, siguiendo las etapas de desvanecimiento de `network_routes` ([H](../../H-progresion-abstraccion.md)). Cada uno lo dispara un gesto y ninguno introduce texto.

1. **Islas a contornos.** Al completar el primer viaje, las islas pierden la textura y quedan como contornos rellenos de un color plano. Los puentes pierden los tablones y quedan como bandas.
2. **Contornos a puntos.** Al arrastrar una isla por primera vez, todas las islas se contraen hacia su centro y quedan como puntos del mismo tamaño. Las bandas se afinan en líneas. El tamaño se fue y la conexión quedó.
3. **Puntos a puntos con etiqueta.** Al tocar dos veces un punto, aparece sobre él un ícono chico que lo identifica, tomado del inventario de formas de [N](../../N-ux-ui.md) y no del alfabeto. La red es la misma; ahora cada punto se puede nombrar sin señalarlo.
4. **Líneas a lista de pares.** Al arrastrar una línea hacia el margen, esa línea se despega de la red y se acuesta como un renglón con los dos íconos de sus extremos. Repitiendo el gesto con todas, queda al costado la lista completa de pares. El dibujo y la lista quedan unidos: tocar un renglón enciende su línea y al revés.
5. **Lista a grilla de cruces.** Al plegar la lista sobre sí misma, los renglones se acomodan en una grilla con los íconos en las filas y en las columnas, y cada par marca su casilla. Es la matriz de adyacencia, presentada como un plegado de algo que el jugador ya tenía y sin ese nombre. Este paso solo aparece en el último nivel del nodo y se retoma en `graph.matrix.two_step_routes_as_product`.

## 9. Notación matemática

Nace el grafo mismo: el dibujo de puntos y líneas como notación, y con él la lista de pares.

La regla de oro de [H](../../H-progresion-abstraccion.md) pide el problema que hizo necesario cada símbolo, y acá el problema es comparar. Mientras hay un solo archipiélago, la foto alcanza. En cuanto hay dos dibujos distintos y hay que decidir si son la misma red, la foto es un estorbo, porque las dos fotos son distintas y las dos redes no. Lo que hace falta es un registro que no dependa del dibujo, y eso es la lista de pares: quién con quién, sin coordenadas. El dibujo de puntos y líneas es la versión mirable de esa lista, y por eso los dos nacen juntos y quedan unidos por el gesto del paso 4.

La grilla de cruces es el mismo registro plegado. No es un símbolo nuevo con su propio problema; es una manera de guardar la lista que después, cuando aparezca la multiplicación, va a resultar útil por razones que en este nodo no se pueden explicar.

Nada de esto es texto. La entrada de cheatsheet del nodo, `cs.graph.graph_vocabulary`, se guarda como imagen justamente por eso: el vocabulario del grafo se muestra con una figura anotada con íconos, no con palabras, y es una de las pocas entradas de cheatsheet con `literacy_min: none`.

## 10. Definición formal

Capa `formal`: la definición corta con voz y la red al lado. Tres frases, de a una, narradas y no escritas salvo en `full_text`.

"Un grafo son puntos y líneas entre puntos." "Una línea dice que esos dos puntos están unidos, y no dice nada más." "Dos puntos están conectados si se puede ir de uno al otro siguiendo líneas, aunque haya que dar vueltas."

Condiciones y casos especiales, verificados sobre el objeto: un punto sin ninguna línea es un grafo válido, y de él no se sale; dos puntos pueden estar unidos por una sola línea, porque tender dos puentes entre las mismas dos islas no agrega nada en este nodo; una línea de un punto a sí mismo no se usa acá; y la red puede quedar partida en varios pedazos que no se alcanzan entre sí, lo cual no es un error sino un caso, y es el tema de `graph.conn.components`.

Ya jugado: las tres frases enteras. Nuevo: nada. Es un nodo donde la definición formal no agrega ningún hecho, solo pone nombre a lo que ya se hizo, y eso es una consecuencia de que el nivel sea 1.

## 11. Propiedades

- **La conexión no depende del dibujo.** Ligada al gesto de arrastrar islas y ver que los puentes se estiran sin soltarse. Es el invariante de la mecánica y la propiedad central del nodo.
- **Ir de un punto a otro es transitivo.** Si se llega de la roja a la verde y de la verde a la azul, se llega de la roja a la azul. Ligada a encadenar dos viajes y ver que la figura no necesita ayuda en el medio.
- **Un puente se puede recorrer en las dos direcciones.** Ligada a hacer el viaje de vuelta sin construir nada. Es lo que en el área se llama grafo no dirigido, y el contraste con las flechas de una sola mano llega en `disc.rel.relation_as_arrows`.
- **Para unir dos pedazos alcanza con un puente.** Ligada al probe de agregar la menor cantidad posible. Es el primer resultado de optimización del área y se juega sin ninguna cuenta.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), instanciados dentro de la mecánica. Ninguno usa texto: `explain` se resuelve eligiendo entre animaciones y todo lo demás se resuelve tocando o arrastrando. Las probes del locale, desarrolladas:

- `recognize`: una red arriba, dibujada de una manera, y dos redes abajo, dibujadas de otra. Tocar la que tiene las mismas conexiones que la de arriba. Los distractores los genera `detect`: la misma red con un puente de menos, la misma red con un puente movido a otro par, y una red que coincide en la cantidad de puentes pero no en quién con quién.
- `explain`: el jugador arrastra las islas a otro lugar sin soltar ningún puente. Después se le muestran dos animaciones cortas del mismo movimiento y se le pide tocar la que muestra lo que pasó: en una, los puentes se estiran y las uniones quedan; en la otra, un puente se suelta al alejarse las islas. Es un ítem de dos opciones y sin texto, apto para `literacy: none`, y su distractor es exactamente la creencia de que el dibujo hace la conexión.
- `manipulate`: dos pedazos de archipiélago separados por agua y una pila de madera. Agregar puentes hasta que se pueda ir de la isla roja a la azul, usando la menor cantidad posible. Sobra madera y eso se ve.
- `apply`: contar cuántos puentes salen de la isla amarilla y tocar ese número en una fila de fichas con puntos, no con dígitos. Los puentes se encienden de a uno mientras el jugador cuenta, con el gesto del nodo 01.
- `generalize`: cinco figuritas se saludan de a dos, mostrado en una animación corta sin palabras. Dibujar con puntos y líneas quién saludó a quién, sin que sobre ni falte ninguna línea. Es la primera vez que el jugador construye la red en vez de recibirla.
- `transfer`: un mapa de estaciones de tren con líneas de colores. Tocar las estaciones a las que se llega desde la central sin cambiar de línea. El objeto es otro, la estructura es la misma.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`path_vs_walk_confusion`**, patrón `replay_on_mechanic` sobre `network_routes`. Aparece cuando se pide el viaje más corto o la menor cantidad de puentes y el jugador entrega un recorrido que pasa dos veces por la misma isla. El juego congela y repite el recorrido en cámara lenta. Cada isla se enciende al pisarla, y la que se pisa dos veces se enciende dos veces y queda con un halo doble. Al costado, los pasos se van apilando como marcas, y la pila del recorrido con repetición queda más alta que la del camino directo, que se dibuja al lado con el mismo gesto. Voz: "Pasaste dos veces por la misma isla. ¿Se puede llegar sin volver?". La red queda como estaba y la figura vuelve al punto de partida, que es un estado válido: el jugador rehace el viaje desde ahí. El patrón `replay_on_mechanic` tiene `literacy_min: none`, así que la misconception es legal en este nodo, y el prompt es solo voz.

Los distractores de `explain` y de `recognize` se generan desde las reglas `detect` de esta misconception. Al ser el nodo raíz del área, no hereda reglas de vecinos aguas arriba salvo las del nodo 01.

## 13. Generalización

La analogía se retira en dos tiempos. Las islas se van en `visual`, en el paso donde se contraen a puntos: a partir de ahí lo que hay son puntos y líneas, y el archipiélago se pide con un toque. El agua sobrevive como sensación hasta `formal`, porque es lo que hace evidente que sin línea no hay paso.

Variantes sin ayuda visual, en orden: redes con más de diez puntos, donde recorrer con la vista deja de servir; redes dibujadas con líneas que se cruzan sin tocarse, para separar el cruce del vínculo; redes partidas en tres o cuatro pedazos; la misma red presentada solo como lista de pares, sin dibujo, con la pregunta de si se llega; y por último la construcción libre, donde el jugador arma la red que representa una situación mostrada en una animación.

El nodo está en `abstract` cuando el jugador decide si dos redes son la misma sin arrastrar nada, responde si se llega mirando una lista de pares, y construye la red de una situación nueva sin modelo previo. La forma completa de esa capa aparece en `adv.topo.connected_one_piece`, donde la conexión se vuelve una propiedad topológica.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`:

- `arith.num.factor_tree` (`network_routes` con `tiles`): el árbol de factores es una red. Los puntos son números, las líneas son divisiones, y la propiedad que importa es que se llegue a las mismas hojas por cualquier camino. El jugador ve que un objeto que creía de aritmética tiene la forma que acaba de aprender.
- `linalg.map.matrix_counts_routes` (`network_routes` con `ledger`): la grilla de cruces del último nivel vuelve como matriz, y multiplicarla por sí misma cuenta las rutas de dos pasos. Es el destino donde el plegado de la lista deja de ser una curiosidad.
- `prob.cond.markov_chain_walk` (`network_routes` con `urn_dice`): la misma red, pero moverse por ella deja de ser una decisión y pasa a ser un sorteo. Las líneas llevan porciones y lo que se pregunta es dónde se termina después de muchos pasos. Es la unión de esta área con la probabilidad, y su otro prerequisito es el nodo 35.

Concepto siguiente: `graph.walk.repeat_rules`. Frase puente, narrada sobre la última red con la figura parada: "Llegaste dando vueltas y también fuiste derecho. ¿Cuándo vale repetir una isla y cuándo no?". La figura repite los dos viajes uno detrás del otro, con las islas encendiéndose, y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `network_scene_islands_to_dots` tiene ruta mixta: el clip de apertura del nodo, de ocho segundos, se pre-renderiza, y la versión nativa corre sobre la red del jugador. Muestra las islas contrayéndose a puntos y los puentes afinándose a líneas; parametrizada por la red y por la disposición de los puntos. `network_scene_same_graph_redrawn` es nativa y es la imagen central: el mismo grafo en dos disposiciones, con los mismos pares resaltados a la vez y una deformación continua que lleva una sobre la otra sin cortar ni crear aristas; parametrizada por la red y por las dos disposiciones. Produce también las dos animaciones de `explain`. Ninguna lleva texto rasterizado, y en este nodo eso no es solo una regla de internacionalización: no hay nada que rasterizar, porque los puntos se identifican con íconos ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_graph_properties` ([M](../../M-calculadora/M0-progresion.md)), sobre una red armada en el sandbox tocando y arrastrando. En este nodo la operación se presenta en su forma mínima: dice cuántos puntos y cuántas líneas hay, y si se llega de un punto a otro, todo con íconos y sin nombres. Las formas más avanzadas de la misma operación, como el conteo de componentes o la verificación de árbol, las desbloquean los nodos hermanos del área. Si el nodo decae, las líneas de la red del sandbox se dibujan punteadas.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer, sin números escritos y sin voz obligatoria ([Q](../../Q-edad-universal.md)). La instrucción es la demostración de la mano fantasma; los ítems de `explain` son dos animaciones y se resuelve tocando una; `apply` cuenta con fichas de puntos y no con dígitos; los prompts de la misconception son solo de voz y el juego funciona con el sonido apagado. La entrada de cheatsheet es una imagen. Por ser nivel 1 no hay cuenta regresiva visible, y el tiempo objetivo se multiplica por el factor de literacy nula que define [K](../../K-evaluacion.md), para que arrastrar con un dedo chico no se confunda con falta de fluidez. Para un adulto no cambia el contenido sino el ritmo: entra por diagnóstico directamente en las redes de diez puntos y en la lista de pares, y el archipiélago le aparece una sola vez, como apertura.
