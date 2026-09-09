# El rastro del caminante (`alg.fn.graph_as_picture`)

Minijuego del nodo 18 de la espina, "La gráfica es el rastro". Mecánica principal `slope_walker`, secundarias `machine_pipe` y `grid_stretch`; analogía `walker_height_trace`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/18-alg.fn.graph_as_picture.md): un concepto, tres dificultades reales (el punto como dos números con roles, la curva como conjunto de todos los resultados, la forma como propiedad de la regla), una analogía, un gesto (arrastrar al caminante y ver caer la tinta), cinco pasos de desvanecimiento, el rastro como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un caminante cruza un terreno con lomas y hondonadas. Lleva un lápiz atado que dibuja, en una hoja que se desenrolla al costado, qué tan alto está en cada momento.

Mapa objeto → concepto: distancia caminada → entrada; altura del caminante → salida; perfil del camino → gráfica; tramo que sube → creciente; tramo plano → constante; acantilado → discontinuidad; caminante bajo el nivel del mar → salida negativa; gota de tinta → par ordenado; hoja → plano.

La analogía conserva el invariante de la máquina del nodo 17: en cada posición del recorrido hay una sola altura. Punto de ruptura: `two_heights_at_one_place`. Un alero o una cueva ponen dos alturas sobre el mismo lugar, y eso no es rastro de ninguna máquina; el juego lo usa como distractor a propósito ([G0](../G-analogias/G0-reglas.md)).

`machine_pipe` acompaña sin analogía propia, con la máquina del nodo 17 al costado. `grid_stretch` aporta la grilla de cuatro cuadrantes con sus signos.

## Mecánica central

Superficie: terreno a la izquierda, hoja a la derecha, máquina pequeña arriba a la derecha desde la capa `visual`. Gestos: `drag` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar al caminante.** Avanza sobre el terreno y con cada paso cae una gota de tinta a la hoja, a la altura exacta en que está. Las gotas quedan.
- **Volver sobre los pasos.** No se dibuja nada nuevo: la gota de esa posición ya está y el caminante pasa por ella. Es la primera prueba de que hay una sola altura por lugar.
- **Tocar una gota.** Levanta un hilo hasta el caminante y otro hasta la máquina. La gota se ilumina y se oye su altura.
- **Bajar del nivel del mar.** La tinta cae del otro lado de la línea horizontal y la hoja se extiende hacia abajo sola.
- **Caminar hacia atrás desde el arranque.** La hoja se extiende hacia la izquierda. Con las dos extensiones queda la grilla completa, con sus cuatro regiones teñidas apenas.
- **Soltar una gota a mano.** Desde la capa `visual` el jugador puede poner gotas sin mover al caminante, arrastrándolas desde el borde.

En `symbolic` la superficie cambia de forma, no de reglas: el terreno se va, la hoja es la grilla, y arrastrar el punto etiquetado a lo largo del rastro es lo mismo que arrastrar al caminante. El caminante se pide con un toque largo y aparece como fantasma.

## Invariante matemático

`same_input_same_output`, heredado de `machine_pipe` y del nodo 17: cada posición tiene una sola altura, y la misma posición da siempre la misma.

Se ve romperse de dos maneras. Si el jugador suelta una gota a una altura que no es la que la máquina devuelve, la gota cae por su peso hasta la correcta y deja un goteo que marca la diferencia. Si intenta poner dos gotas sobre la misma posición horizontal, la segunda empuja a la primera fuera de la hoja y el caminante se detiene: no puede estar en dos alturas. Ningún mensaje lo dice; el goteo y el empujón son el mensaje.

Un movimiento válido pero inútil, como poner una gota que ya está o caminar de ida y vuelta sobre el mismo tramo, no rompe nada. Recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `relate`, de apoyo `compose` y `deform` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el terreno con lomas, el caminante y la hoja que se desenrolla. Solo se mira y se predice.
- `concrete`: terreno estilizado, caminante, gotas de tinta, línea del nivel del mar. Nada escrito.
- `visual`: el terreno se desvanece; quedan el caminante, el rastro y dos reglas perpendiculares con marcas. Desde cada gota salen dos hilos punteados hasta las reglas. La hoja se vuelve grilla y las cuatro regiones se tiñen para que el signo se lea sin contar. La máquina queda como silueta que se ilumina al tocar una gota.
- `symbolic`: puntos con etiqueta `(3, 5)`, ejes rotulados `x` e `y`, y `y = f(x)` como leyenda bajo el rastro.
- `formal`: la definición corta con voz; el rastro al lado y la recta vertical que se puede bajar con el dedo.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Caminante → punto: al soltarlo y tocar la hoja, el muñeco se contrae en la gota y la gota se afina hasta ser un punto redondo. El terreno ya no está.
2. Hilos punteados → dos números: al tocar el punto, cada hilo se acorta contra su regla y muestra la marca leída. Los dos números laten alternados una vez, en orden.
3. Dos números → par: al arrastrarlos hacia el punto se juntan sobre él, aparece la coma y los paréntesis se cierran alrededor.
4. Etiqueta → coordenadas genéricas: con un toque largo sobre un punto cualquiera, los números se vuelven `(x, y)`; la `x` hereda el color del eje de abajo y la `y` el de la izquierda, y los ejes se rotulan en el mismo gesto.
5. Rastro → conjunto de pares: al deslizar el dedo por el rastro, el punto etiquetado se mueve y sus dos números cambian juntos; la máquina se ilumina con cada cambio y aparece `y = f(x)` bajo el rastro.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el rastro: la gráfica de una función es el conjunto de todos los pares de entrada y salida; cada punto se escribe con la entrada primero y la salida después; una curva es gráfica de una función solo si ninguna recta vertical la corta dos veces.

Propiedades: cada entrada tiene a lo sumo un punto en el rastro; el orden dentro del par importa, así que `(3, 5)` y `(5, 3)` son lugares distintos; el signo de cada número dice en qué región cae el punto; el rastro es la máquina completa y no una muestra. Casos: el rastro puede tener saltos y seguir siendo gráfica; puede no haber altura sobre algunas posiciones; la circunferencia entera no es gráfica de una función.

Símbolo nuevo: las coordenadas `(x, y)`, nacidas del problema de ubicar un punto cuando el dedo no alcanza, por ejemplo con dos rastros en la misma hoja. La `y` no es símbolo aparte: es el nombre corto de `f(x)`.

## Generalización

El terreno se retira en `symbolic`, con un disparador concreto: cuando las dos coordenadas son negativas, el caminante tendría que ir hacia atrás y estar bajo el mar a la vez, y la escena deja de ayudar. El caminante se queda como fantasma a demanda hasta `formal`.

Variantes sin ayuda visual: rastros con tramos planos; rastros con un salto; rastros sin altura definida en algunas posiciones; curvas cerradas que hay que descartar con la recta vertical; dos rastros en la misma hoja, donde hay que decir cuál es de cuál máquina. La analogía se eliminó cuando el jugador lee un par sin dibujar hilos, decide si una curva cualquiera es gráfica sin bajar la recta vertical con el dedo, y ubica puntos en las cuatro regiones sin contar marcas.

## Desafío

El ejemplo de cofres de [H](../H-progresion-abstraccion.md) no aplica a este nodo, que no es de despeje. La correspondencia útil es con la escala de capas: `real` e `intuition` corresponden a los niveles 1 y 2 de este minijuego, `concrete` y `visual` a los niveles 3 a 5, `symbolic` a los niveles 6 y 7 y `formal` al 8.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **El lápiz que dibuja solo.** `real`, `recognize`. El caminante camina solo y el jugador mira. Terreno de una sola loma, alturas positivas.
2. **¿Por dónde sigue?** `intuition`, `explain`. La escena se detiene y hay que elegir la continuación entre tres.
3. **Arrastrar al caminante.** `concrete`, `manipulate`. Terreno con dos lomas, alturas positivas, hoja acotada a un rincón.
4. **Bajo el nivel del mar.** `concrete`, `manipulate`. Parámetros: alturas negativas y posiciones hacia atrás. La hoja se abre a las cuatro regiones.
5. **Hilos y reglas.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; aparecen las reglas con marcas, los hilos punteados y la máquina al costado.
6. **Pares y ejes.** `symbolic` primera mitad, `manipulate` y `apply`. Los pares se escriben; el terreno se fue. Rango numérico chico.
7. **Rastros que nunca viste.** `symbolic` segunda mitad, `apply` y `generalize`. Parámetros: rango numérico mayor, rastros con saltos, rastros con huecos, dos rastros en la misma hoja.
8. **La recta vertical.** `formal` y `abstract`, `generalize`. Definición corta con voz; curvas cerradas y figuras cualesquiera que hay que aceptar o descartar.

Qué endurece cada parámetro: los negativos obligan a leer el signo y rompen la escena de terreno; los saltos separan "línea continua" de "gráfica de función"; los huecos rompen la idea de que toda posición tiene altura; los dos rastros a la vez obligan a usar el par como identificador y no como ubicación aproximada.

Desafíos de olimpíada: el nodo no aparece todavía en ningún `requires` de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`. Cuando existan los desafíos de funciones, el rastro aparecerá como dato oculto: una gráfica de la que hay que leer un valor intermedio.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: el caminante deja su rastro sobre la grilla y se muestra la entrada 4; tocar el punto del rastro que le corresponde, entre cuatro puntos marcados.
- `explain`: dos animaciones sobre la misma hoja. En una, cada paso horizontal deja una sola gota; en la otra, el rastro sube y baja sobre la misma posición. Tocar la que no puede ser rastro de una máquina. El distractor elegido clasifica.
- `manipulate`: mover al caminante por la grilla de cuatro cuadrantes hasta cubrir el rastro entero; después ubicar `(−3, −2)` arrastrando un punto desde el borde.
- `apply`: una máquina y una grilla vacía; armar el rastro punto a punto con fichas de pares, contra el tiempo objetivo del nodo.
- `generalize`: sin caminante, un rastro con un salto y fichas de coordenadas; leer tres pares y decir en qué posición no hay altura.
- `transfer`: en la escala de acumulación de `prob.rv.cumulative_distribution`, tocar en el rastro el punto donde el total alcanza el nivel pedido.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). El nodo declara `misconceptions: []` en el grafo, a propósito: los errores de acá son de lectura y de ubicación y todavía no tienen regla `detect` con antes y después simbólicos. Lo que corre es esto:

- `negative_times_negative`, heredada de `arith.int.negatives`, patrón `double_flip` sobre `slope_walker`, mecánica del nodo, así que corre sin traducción. Aparece al mandar un punto de dos coordenadas negativas a la región de arriba a la derecha. Se muestra el giro de caminar hacia atrás, después el de bajar del nivel del mar, y se comparan los aterrizajes con el punto elegido. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".
- Candidato en minería: el par leído al revés. Patrón `replay_on_mechanic` sobre `slope_walker`: el caminante va a la posición que el jugador eligió, la máquina devuelve otra altura y el punto real queda al lado del suyo. Voz: "Moviste al caminante hasta acá. ¿A qué altura quedó?".
- Candidato en minería: el rastro como foto del terreno. Mismo patrón y misma mecánica: el terreno se aplana hasta ser una recta y el rastro no cambia. Voz: "El terreno cambió de dibujo y la línea quedó igual. ¿Qué está midiendo?".

Los distractores de `explain` y las opciones de `apply` se generan desde estas reglas y desde las de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `slope_walker_leaves_trace`, nativa. El punto que avanza y la línea que queda, sobre el estado del jugador; gramática `relate`. Parametrizada por la función, el intervalo y los puntos de muestra, produce también las dos animaciones de `explain`.
- `grid_four_quadrants_with_signs`, nativa. El plano con sus cuatro regiones, los puntos y sus hilos hasta los ejes. Lleva marca de excepción de mecánica en el YAML de escenas, porque el nodo no declara `grid_stretch` como mecánica evaluada aunque la escena viva en esa familia; el plano no se deforma, solo muestra sus signos. Abre los niveles 4 y 5 y es la imagen de cheatsheet de `cs.alg.point_is_input_output_pair`.
- Las etiquetas de ejes y los números los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_terrain_profile`: `bumps` (1 a 4 lomas); `height_range` (positivo hasta el nivel 3, con negativos desde el 4); `position_range`; `flat_segments` (booleano, desde el nivel 7); `jump_at` (posición del salto, desde el nivel 7); `gap_at` (posición sin altura, desde el nivel 7); `seed`.
- `gen_coordinate_pair`: `x_range`; `y_range`; `quadrants` (subconjunto de las cuatro regiones); `distractors` (par invertido, signo cambiado en uno de los dos, valor cercano).
- `gen_curve_to_judge`: `is_graph` (si la curva sorteada es gráfica o no); `violation_kind` en {dos alturas en un punto, curva cerrada, tramo vertical}; `violation_count` (una sola violación por instancia); `seed`.

**Literacy soportada:** de `icons` a `full_text`. Los tres primeros niveles se juegan sin leer, pero desde el paso 3 de la transición hay números escritos en los ejes y en el par, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra al caminante unos pasos y las gotas caen a la hoja. La escena vuelve al inicio y el caminante late. Se repite solo si el jugador se queda quieto. La demostración de tocar una gota para ver sus hilos es aparte y se hace una vez, al entrar en la capa `visual` ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
