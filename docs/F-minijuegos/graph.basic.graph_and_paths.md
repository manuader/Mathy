# Islas y puentes (`graph.basic.graph_and_paths`)

Minijuego del nodo 37 de la espina, "Puntos unidos por líneas". Mecánica única `network_routes`; analogía `city_routes` vestida de archipiélago. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/37-graph.basic.graph_and_paths.md): un concepto, tres dificultades reales (separar la conexión del dibujo, leer alcance en vez de cercanía, distinguir recorrer de recorrer sin repetir), una analogía donde el agua hace evidente que sin puente no se pasa, un gesto central (arrastrar una isla y ver que los puentes se estiran sin soltarse), cinco pasos de desvanecimiento, el mismo grafo dibujado dos veces como visualización dominante, retiro de las islas en `visual`. Es el nodo de nivel 1 del área y se juega entero sin leer. Acá se fija cómo se juega.

## Analogía

Un archipiélago visto desde arriba. Islas y puentes de madera. Una figura chiquita quiere ir de la isla roja a la isla azul y solo puede caminar por puentes.

Mapa objeto a concepto: una isla es un vértice; un puente es una arista; un viaje por puentes es un recorrido, y sin repetir islas es un camino; una isla sin puente es una componente desconectada; un viaje que vuelve al punto de partida es un ciclo; el largo del puente es el peso de la arista, que este nodo no usa; el viaje más barato es el camino más corto, que llega mucho después.

Por qué las islas y no la red de amigos: dos personas que no se conocen igual se pueden hablar, y eso arruina la idea de que sin arista no hay paso. El agua no deja lugar a dudas. Punto de ruptura: `drawing_position_matters`. La analogía falla donde la posición sí importa, por ejemplo al pedir un dibujo sin cruces, y ese es el tema de `graph.planar.no_crossing_euler_formula`; por eso se retira en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el archipiélago ocupa toda la pantalla; la figura en la isla roja, la bandera en la azul; en los niveles de construcción, una pila de madera en un borde. Gestos: `tap` y `drag`, y ninguno más ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar una isla vecina.** La figura camina por el puente y llega. El puente se enciende a su paso.
- **Tocar una isla sin puente.** La figura se acerca al borde, mira el agua y no cruza. Ningún puente se dibuja solo. La figura queda donde estaba y se sigue desde ahí.
- **Arrastrar de una isla a otra.** Se construye un puente y baja la pila de madera. Es el único recurso limitado del minijuego.
- **Arrastrar una isla por la pantalla.** Los puentes se estiran como elásticos y no se sueltan. Nada cambia: la figura puede hacer los mismos viajes. Es el gesto que define el nodo.
- **Tocar la bandera.** La figura repite el viaje entero rápido y cada isla se enciende al pisarla. Si pisa dos veces la misma, se enciende dos veces. Es la verificación.
- **Arrastrar una línea al margen.** Desde la capa `visual`, la despega de la red y la acuesta como renglón de la lista de pares.

En `symbolic` la superficie cambia de forma, no de reglas: la red es de puntos y líneas, la lista de pares vive al costado, y tocar un renglón enciende su línea y al revés. En el último nivel la lista se pliega en una grilla de cruces.

## Invariante matemático

`connections_independent_of_drawing`: quién está unido con quién no cambia por mover el dibujo. Se ve confirmarse cada vez que el jugador arrastra una isla y los puentes se estiran sin soltarse. Se ve romperse solo en la animación distractora de `explain`, donde un puente se suelta al alejarse las islas y el viaje deja de ser posible; esa animación es falsa a propósito y es la única del minijuego que lo es.

De ese invariante salen los dos hechos que el nodo usa: dos redes con los mismos pares unidos son la misma red aunque estén dibujadas distinto, y llegar o no llegar es una propiedad de la red y no de la hoja.

Un movimiento válido pero inútil, como tender un puente entre dos islas ya unidas o dar una vuelta de más, no rompe nada. La madera sobrante queda visible en el borde y el nivel no se cierra hasta que se usa el mínimo, sin que nada lo diga por escrito. Empujón suave: la pila de madera late.

## Representación visual

Primitiva `relate`, única ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el archipiélago filmado desde arriba, la figura caminando, la bandera. Sin líneas abstractas. El jugador toca uno de tres desenlaces dibujados y después ve.
- `concrete`: islas con textura, puentes de tablones, figura y bandera. Ni un número ni una palabra.
- `visual`: las islas pierden la textura, se contraen a puntos del mismo tamaño y los puentes se afinan en líneas. El tamaño de la isla desaparece, y esa desaparición dice que nunca importó. Los puntos ganan un ícono identificador tomado del inventario de [N](../N-ux-ui.md), no del alfabeto.
- `symbolic`: puntos, líneas y la lista de pares al costado; en el último nivel, la grilla de cruces.
- `formal`: las tres frases con voz, la red al lado.

La imagen que define el nodo es el mismo grafo dibujado dos veces, lado a lado, con los mismos pares resaltados a la vez y una deformación continua que lleva una disposición sobre la otra sin cortar ni crear ninguna línea.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables, y ninguno introduce texto:

1. Islas a contornos: al completar el primer viaje, las islas pierden la textura y quedan como contornos planos; los puentes pierden los tablones y quedan como bandas.
2. Contornos a puntos: al arrastrar una isla por primera vez, todas se contraen hacia su centro y quedan como puntos iguales; las bandas se afinan en líneas.
3. Puntos a puntos con ícono: al tocar dos veces un punto, aparece sobre él un ícono chico que lo identifica. Ahora se puede nombrar sin señalar.
4. Líneas a lista de pares: al arrastrar una línea al margen, se despega y se acuesta como renglón con los dos íconos de sus extremos. Con todas hechas queda la lista completa, unida al dibujo en las dos direcciones.
5. Lista a grilla de cruces: al plegar la lista sobre sí misma, los renglones se acomodan en una grilla con los íconos en filas y columnas y cada par marca su casilla. Solo aparece en el último nivel y se retoma en `graph.matrix.two_step_routes_as_product`.

## Concepto formal

Lo que queda al final, narrado con voz sobre la red: un grafo son puntos y líneas entre puntos; una línea dice que esos dos puntos están unidos y no dice nada más; dos puntos están conectados si se puede ir de uno al otro siguiendo líneas, aunque haya que dar vueltas.

Propiedades: la conexión no depende del dibujo; llegar es transitivo, porque encadenar dos viajes da un viaje; un puente se recorre en las dos direcciones; y para unir dos pedazos alcanza con un puente, que es el primer resultado de optimización del área y se juega sin ninguna cuenta.

Casos especiales: un punto sin líneas es un grafo válido y de él no se sale; dos puentes entre las mismas dos islas no agregan nada acá; una línea de un punto a sí mismo no se usa; y la red puede quedar partida en varios pedazos, lo cual es un caso y no un error.

Símbolo nuevo: el grafo mismo, dibujo y lista de pares a la vez, nacidos del problema de comparar dos dibujos distintos de la misma red. La entrada de cheatsheet `cs.graph.graph_vocabulary` se agrega en `symbolic` y se guarda como imagen, con `literacy_min: none`: el vocabulario se muestra con una figura anotada con íconos, no con palabras.

## Generalización

Las islas se retiran en `visual`, en el paso donde se contraen a puntos; a partir de ahí el archipiélago se pide con un toque. El agua sobrevive como sensación hasta `formal`, porque es lo que hace evidente que sin línea no hay paso.

Variantes sin ayuda visual: redes de más de diez puntos, donde recorrer con la vista deja de servir; redes con líneas que se cruzan sin tocarse, para separar el cruce del vínculo; redes partidas en tres o cuatro pedazos; la red presentada solo como lista de pares, con la pregunta de si se llega; y la construcción libre a partir de una situación mostrada en una animación. Cuando el jugador decide si dos redes son la misma sin arrastrar nada y responde desde la lista, la analogía se eliminó.

## Desafío

Correspondencia con las etapas de desvanecimiento de la mecánica ([H](../H-progresion-abstraccion.md)): los niveles 1 y 2 son `islands_bridges`, los niveles 3 y 4 son `dots_lines`, los niveles 5 y 6 son `arrow_list`, y el 7 llega hasta `adjacency_matrix` sin explotarla, porque la explotación es del nodo `graph.matrix.two_step_routes_as_product`.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Llegar caminando.** `concrete`, `manipulate`. Cuatro a seis islas, todos los puentes ya construidos, un solo destino. Solo tocar islas en orden.
2. **Tender puentes.** `concrete`, `manipulate` y `apply`. La red viene partida en dos pedazos y hay una pila de madera. Aparece el mínimo necesario y sobra madera si se gasta de más.
3. **Mover las islas.** `visual`, `explain`. Las islas se contraen a puntos y el jugador las arrastra por la pantalla. La animación de dos opciones se resuelve tocando.
4. **La misma red dos veces.** `visual`, `recognize`. Dos dibujos distintos, la pregunta de si son la misma. Hasta ocho puntos.
5. **La lista de pares.** `symbolic` primera mitad, `manipulate`. Las líneas se despegan al margen y la lista queda al lado del dibujo, sincronizada.
6. **Sin dibujo.** `symbolic` segunda mitad, `apply`. Solo la lista de pares y la pregunta de si se llega. Parámetros: hasta doce puntos, redes partidas en tres pedazos, líneas que se cruzan sin tocarse.
7. **Armar la red.** `formal` y `abstract`, `generalize`. Definición corta con voz, construcción libre a partir de una animación, y el plegado de la lista en la grilla de cruces.

Qué endurece cada parámetro: la cantidad de puntos rompe la lectura de un vistazo y obliga a recorrer; los cruces sin contacto rompen la asociación entre líneas que se tocan y puntos unidos; los pedazos separados rompen la suposición de que siempre se llega; y la presentación sin dibujo es la prueba final de que el jugador entendió que la red es la lista y no la foto.

Desafíos de olimpíada: el área `graph` todavía no tiene entradas en [S](../S-desafios/S0-desafios.md). Cuando existan, este nodo aparecerá como paso de entrada de casi todas, porque es la raíz del área. Hasta entonces el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md). Ninguno usa texto: `explain` se resuelve entre animaciones y el resto tocando o arrastrando.

- `recognize`: una red arriba con seis puntos y siete líneas, y dos redes abajo dibujadas de otra manera. Tocar la que tiene las mismas conexiones. Distractores: la misma red con una línea de menos, la misma con una línea movida a otro par, y una con la misma cantidad de líneas pero otros pares.
- `explain`: el jugador arrastra las islas a otro lugar sin soltar ningún puente y después elige entre dos animaciones cuál muestra lo que pasó: los puentes se estiran y las uniones quedan, o un puente se suelta al alejarse las islas. El distractor es exactamente la creencia de que el dibujo hace la conexión.
- `manipulate`: dos pedazos de archipiélago separados por agua y una pila de madera de tres tablones. Agregar puentes hasta que se pueda ir de la roja a la azul usando la menor cantidad posible. Sobra madera y se ve.
- `apply`: contar cuántos puentes salen de la isla amarilla y tocar ese número en una fila de fichas con puntos, no con dígitos. Los puentes se encienden de a uno mientras el jugador cuenta.
- `generalize`: cinco figuritas se saludan de a dos en una animación corta sin palabras. Dibujar con puntos y líneas quién saludó a quién, sin que sobre ni falte ninguna línea.
- `transfer`: un mapa de estaciones de tren con líneas de colores. Tocar las estaciones a las que se llega desde la central sin cambiar de línea. También `arith.num.factor_tree` (el árbol de factores como red), `linalg.map.matrix_counts_routes` (la grilla de cruces como matriz que cuenta rutas de dos pasos) y `prob.cond.markov_chain_walk` (la misma red donde moverse es un sorteo).

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `path_vs_walk_confusion`, patrón `replay_on_mechanic` sobre la red. Aparece cuando se pide el viaje más corto o la menor cantidad de puentes y el jugador entrega un recorrido que pasa dos veces por la misma isla. El juego congela y repite el recorrido en cámara lenta: cada isla se enciende al pisarla y la repetida se enciende dos veces con halo doble. Al costado, los pasos se apilan como marcas, y la pila del recorrido con repetición queda más alta que la del camino directo, dibujado al lado con el mismo gesto. Voz: "Pasaste dos veces por la misma isla. ¿Se puede llegar sin volver?". La red queda como estaba y la figura vuelve al punto de partida, que es un estado válido. El patrón tiene `literacy_min: none`, así que la misconception es legal en este nodo y el prompt es solo voz.

Los distractores de `explain` y de `recognize` se generan desde las reglas `detect` de esta misconception. Al ser la raíz del área, el nodo no hereda reglas de vecinos aguas arriba salvo las del nodo 01.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `network_scene_islands_to_dots`, ruta mixta. El clip de apertura del nodo, de ocho segundos, se pre-renderiza; la versión nativa corre sobre la red del jugador. Muestra las islas contrayéndose a puntos y los puentes afinándose a líneas; parametrizada por la red y por la disposición de los puntos.
- `network_scene_same_graph_redrawn`, nativa. La imagen central: el mismo grafo en dos disposiciones, con los mismos pares resaltados a la vez y una deformación continua que lleva una sobre la otra sin cortar ni crear aristas; parametrizada por la red y por las dos disposiciones. Produce las dos animaciones de `explain`.

Ninguna lleva texto rasterizado, y acá eso no es solo una regla de internacionalización: no hay nada que rasterizar, porque los puntos se identifican con íconos ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_island_map`: `n_nodes` (4 a 6 en los niveles 1 y 2, hasta 12 en el 6); `edge_density`; `components` (1 hasta el nivel 5, hasta 3 en el 6); `guarantee_path` (verdadero o falso, para que a veces no se llegue); `seed`.
- `gen_layout_pair`: dos disposiciones distintas de la misma red para el verbo `recognize` y para la escena de deformación; `spread`, `crossings_allowed` (falso hasta el nivel 5, verdadero en el 6).
- `gen_bridge_budget`: `wood` (tablones disponibles, siempre mayor que el mínimo necesario) y `min_edges_needed`, calculado desde la red.
- `gen_situation_to_graph`: situaciones para el verbo `generalize`, mostradas como animación sin palabras (saludos de a dos, parejas de baile, quién le pasó la pelota a quién) con la red esperada como respuesta.

**Literacy soportada:** de `none` a `full_text`, y `none` es el mínimo real, no una declaración formal. No hay dígitos escritos en ningún nivel: `apply` se responde con fichas de puntos, los puntos se identifican con íconos y la cheatsheet es una imagen. En `short_text` y `full_text` las tres frases de la definición se muestran escritas además de narradas, y los íconos de los puntos pueden reemplazarse por letras. La voz es opcional: el juego funciona entero con el sonido apagado ([Q](../Q-edad-universal.md)).

**Instrucción por demostración:** la primera vez, una mano fantasma toca la isla roja, después una vecina, después otra, hasta la azul; cada toque enciende un puente y la figura camina por él; al llegar, la bandera se levanta. La escena vuelve al inicio y la isla roja late. Cuando aparece el gesto de arrastrar para tender un puente, la mano lo hace una vez sobre el agua. Cuando aparece el gesto de arrastrar una isla, la mano la mueve y suelta, y los puentes se estiran a la vista. Cada gesto nuevo tiene su demostración y ninguna se repite si el jugador ya la vio en otro nodo de la mecánica.

**Sin constantes propias.** Tiempo objetivo y su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md). Por ser nivel 1, no hay cuenta regresiva visible en ninguna pantalla.
