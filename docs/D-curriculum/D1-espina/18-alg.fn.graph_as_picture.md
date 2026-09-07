# 18 — La gráfica como retrato de la máquina (`alg.fn.graph_as_picture`)

> Locale `es`: "La gráfica es el rastro". Minijuego: [El rastro del caminante](../../F-minijuegos/alg.fn.graph_as_picture.md).

**Nodo:** `alg.fn.graph_as_picture` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `relate` · **Mecánica principal:** `slope_walker` (secundarias `machine_pipe` y `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `walker_height_trace`

## 1. Concepto

La gráfica no es un dibujo del objeto: es el registro de todo lo que la máquina hizo. Cada punto guarda una entrada y su salida en un solo lugar de la hoja. Al terminar, el jugador ubica un punto sabiendo cuál número es entrada y cuál salida, lee pares de un rastro que nunca vio y distingue un rastro que puede venir de una máquina de uno que no. Antes tenía una máquina que devolvía un número por vez; no podía ver todos sus resultados juntos.

## 2. Prerequisitos

- `alg.fn.function_as_machine` (nodo [17](17-alg.fn.function_as_machine.md)): la máquina con sus dos tuberías, la regla de una sola salida por entrada y la notación `f(x)`. De ahí viene el invariante `same_input_same_output`, que acá se vuelve forma: un rastro que sube y baja sobre la misma posición horizontal no puede venir de una máquina.
- `arith.int.negatives` (nodo [07](07-arith.int.negatives.md)): el desplazamiento hacia el lado opuesto, entero. La grilla tiene cuatro cuadrantes desde el segundo nivel porque el caminante va hacia atrás y baja del nivel del mar. Sin negativos sería un rincón y no un plano.

La arista con negativos no sigue el orden escolar, donde el plano cartesiano se presenta como tema de geometría antes que las funciones. Acá el plano nace de una necesidad de la máquina: guardar el par entrada y salida. Los negativos entran porque las máquinas devuelven resultados negativos, no porque toque enseñar cuadrantes.

## 3. Dificultad cognitiva real

Lo difícil no es marcar puntos en una grilla sino tres capacidades:

1. **Aceptar que un punto son dos números con roles distintos.** El primero es lo que se le dio a la máquina, el segundo lo que devolvió. Cambiar el orden cambia el significado, no solo el lugar.
2. **Ver la curva como el conjunto de todos los resultados.** El jugador viene de una máquina que responde de a uno; que el rastro entero sea la misma máquina es el salto del nodo.
3. **Leer la forma como propiedad de la regla.** Que no haya dos alturas sobre una misma posición no es una regla de dibujo: es la regla de la máquina, vista de costado.

Las tres se desarrollan en la misma mecánica y en ese orden. La tercera sostiene después el test de la recta vertical y la condición de invertibilidad del nodo 21.

## 4. Problema intuitivo

Un caminante cruza un terreno con lomas y hondonadas. Lleva atado un lápiz que dibuja solo, en una hoja larga que se desenrolla al costado, qué tan alto está en cada momento. El jugador lo mira caminar y ve aparecer una línea.

En `intuition` la escena se detiene a mitad de camino, con la hoja a medio llenar. Pregunta por voz o por gesto: si sigue diez pasos más, ¿por dónde va a pasar la línea? Tres continuaciones dibujadas: una copia la forma del terreno que viene, otra sube cuando el terreno baja, la tercera vuelve atrás sobre sí misma. El jugador elige y después ve.

## 5. Analogía del mundo real

`walker_height_trace`, sobre `slope_walker` ([G0](../../G-analogias/G0-reglas.md)). Mapa: distancia caminada → entrada; altura del caminante → salida; perfil del camino → gráfica; tramo que sube → creciente; tramo plano → constante; acantilado → discontinuidad; caminante bajo el nivel del mar → salida negativa.

El invariante es el de la máquina: en cada posición del recorrido el caminante está a una sola altura. Por eso el rastro avanza y nunca vuelve sobre sí mismo.

Por qué esta y no otra. Una tabla de valores conserva el par pero no la forma, y la forma es lo que este nodo agrega. Un mapa conserva la forma pero pierde los roles, porque sus dos números son de la misma clase. El caminante conserva las dos cosas: un eje es distancia recorrida y el otro es altura.

Punto de ruptura: `two_heights_at_one_place`. Un terreno real puede tener una cueva, y ahí hay dos alturas sobre la misma posición. Ese caso no es rastro de ninguna máquina y el juego lo usa como distractor.

`machine_pipe` acompaña sin analogía propia: la máquina del nodo 17 queda al costado y su salida cae en la hoja. `grid_stretch` aporta la grilla de cuatro cuadrantes con sus signos.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `slope_walker` es la principal y aporta el gesto; `machine_pipe` aporta el origen de cada altura; `grid_stretch` aporta el plano donde todo cae ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `scrub`.

1. Terreno a la izquierda con el caminante parado en el arranque. A la derecha, una hoja en blanco con una línea horizontal que marca el nivel del mar.
2. Demostración: una mano fantasma arrastra al caminante unos pasos. Con cada paso baja una gota de tinta a la hoja, a la altura exacta del caminante, y las gotas quedan.
3. El jugador arrastra al caminante, adelante y atrás. Si vuelve sobre sus pasos no se dibuja nada nuevo: la gota de esa posición ya está.
4. Al costado, la máquina del nodo 17 recibe la posición y devuelve la altura. Tocar una gota levanta un hilo hasta el caminante y otro hasta la máquina: la gota es el par.
5. Bajo el nivel del mar la tinta cae del otro lado de la línea y la hoja se extiende hacia abajo. Caminar hacia atrás desde el arranque la extiende hacia la izquierda. Ahí queda la grilla con sus cuatro regiones.

Cada error tiene consecuencia física y nada se llama "incorrecto". Una gota soltada a la altura equivocada cae por su peso hasta la correcta y deja un goteo que marca la diferencia. Una segunda gota en la misma posición horizontal empuja a la primera fuera de la hoja y el caminante se detiene: no puede estar en dos alturas.

## 7. Representación visual

Capa `visual`, primitiva `relate` dominante ([H](../../H-progresion-abstraccion.md)).

El terreno se desvanece y quedan el caminante y su rastro. Se desplaza el caminante, en horizontal; nada se escala todavía; se conserva la correspondencia, una sola gota por posición. Se agregan dos reglas perpendiculares con marcas, una debajo y una a la izquierda, y desde cada gota salen dos hilos punteados hasta ellas. Esos hilos son el objeto que después se contrae en el par.

`grid_stretch` entra como apoyo: la hoja se vuelve grilla y las cuatro regiones se tiñen apenas para que el signo se lea sin contar. `machine_pipe` queda como silueta que se ilumina al tocar una gota. Todavía no hay `x` genérica, ni pares escritos, ni ecuación de la curva.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Caminante → punto.** Al soltar al caminante y tocar la hoja, el muñeco se contrae en la gota y la gota se afina hasta ser un punto redondo. El terreno ya no está.
2. **Hilos punteados → dos números.** Al tocar el punto, cada hilo se acorta contra su regla y en su extremo aparece la marca leída: un número abajo, otro a la izquierda. Laten alternados una vez, en orden.
3. **Dos números → par.** Al arrastrarlos hacia el punto se juntan sobre él, aparece la coma y los paréntesis se cierran alrededor: `(3, 5)`.
4. **Etiqueta → coordenadas genéricas.** Al pedir un punto cualquiera del rastro con un toque largo, los números se vuelven letras: `(x, y)`. La `x` hereda el color del eje de abajo y la `y` el del eje de la izquierda; los ejes se rotulan con la misma letra en el mismo gesto.
5. **Rastro → conjunto de pares.** Al arrastrar el dedo a lo largo del rastro, el punto etiquetado se desliza y sus dos números cambian juntos. La máquina del costado se ilumina con cada cambio: `y = f(x)` aparece bajo el rastro, con la `f` que ya venía del nodo 17.

## 9. Notación matemática

Queda un plano con dos ejes, un rastro y un punto escrito `(x, y)`, con `y = f(x)` como leyenda.

Símbolo nuevo: **las coordenadas `(x, y)`**, en la capa `visual` según la tabla de [H](../../H-progresion-abstraccion.md). El problema que lo hizo necesario es ubicar un punto cuando no se puede señalar: mientras hay un solo rastro el dedo alcanza, pero con dos rastros en la misma hoja, o para decirle a otro dónde está el punto, hace falta nombrarlo. Dos números y un orden convenido lo resuelven sin dibujar nada.

El objeto del que sale es la grilla con dos reglas perpendiculares. El orden no es arbitrario en el juego: el primero es el que se le dio a la máquina, porque es el que el jugador movió con el dedo. La `y` no es un símbolo aparte, es el nombre corto de `f(x)`, y aparece como etiqueta del eje en el mismo gesto.

## 10. Definición formal

Capa `formal`: texto corto con voz y el rastro al lado. Tres frases, de a una: "La gráfica de una función es el conjunto de todos los pares de entrada y salida." "Cada punto se escribe con la entrada primero y la salida después." "Una curva es la gráfica de una función solo si ninguna recta vertical la corta dos veces."

Condiciones y casos, verificados sobre el objeto: el rastro puede tener saltos y sigue siendo gráfica, mientras sobre cada posición haya a lo sumo una altura; puede no haber altura sobre algunas posiciones, y ahí la hoja queda vacía; la circunferencia entera no es gráfica de una función, y el jugador lo comprueba bajando la recta vertical.

Ya jugado: las tres frases enteras. Nuevo: la palabra "gráfica" y el nombre del test, que hasta acá era la gota que empujaba a la otra.

## 11. Propiedades

- **Cada entrada tiene a lo sumo un punto en el rastro.** Ligada a la gota que expulsa a la segunda en la misma posición.
- **El orden dentro del par importa.** `(3, 5)` y `(5, 3)` son lugares distintos. Ligada a arrastrar el caminante a la posición 3 y ver la tinta a la altura 5.
- **El signo de cada número dice en qué región cae el punto.** Ligada a caminar hacia atrás y a bajar del nivel del mar, primero por separado y después juntos.
- **El rastro es la máquina completa, no una muestra.** Ligada al deslizamiento del punto a lo largo de toda la línea.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: el caminante deja su rastro y se muestra una entrada; tocar el punto que le corresponde.
- `explain`: dos animaciones sobre la misma hoja. En una, cada paso horizontal deja una sola gota; en la otra, el rastro sube y baja sobre la misma posición. Tocar la que no puede ser rastro de una máquina.
- `manipulate`: mover al caminante por la grilla de cuatro cuadrantes; después ubicar puntos de coordenadas negativas arrastrándolos desde el borde.
- `apply`: una máquina y una grilla vacía; arrastrar fichas de pares para armar el rastro punto a punto, contra el tiempo objetivo del nodo.
- `generalize`: sin caminante, solo el rastro y las fichas; leer pares de un rastro que nunca se vio, incluido uno con un salto.
- `transfer`: en la escala de acumulación de `prob.rv.cumulative_distribution`, tocar el punto donde el total alcanza el nivel pedido.

Misconceptions y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). El YAML declara `misconceptions: []` a propósito: los errores de acá son de lectura y de ubicación, y todavía no se les puede escribir una regla `detect` con antes y después simbólicos. Lo que corre es esto:

- **`negative_times_negative`**, heredada de `arith.int.negatives`. Aparece cuando el jugador ubica un punto de dos coordenadas negativas en la región de arriba a la derecha, razonando que dos "menos" se cancelan. Patrón `double_flip` sobre `slope_walker`, mecánica del nodo, así que corre sin traducción: se muestra el giro de caminar hacia atrás, después el de bajar del nivel del mar, y se comparan los dos aterrizajes contra el punto elegido. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".
- **Candidato en minería: el par leído al revés.** El jugador ubica `(5, 3)` donde va `(3, 5)`. Se registra con su estado previo según el mecanismo de minería de L0 y, hasta tener entrada propia, se explica con `replay_on_mechanic` sobre `slope_walker`: el caminante va a la posición elegida, la máquina devuelve otra altura y el punto real queda al lado con el hilo que los separa. Voz: "Moviste al caminante hasta acá. ¿A qué altura quedó?".
- **Candidato en minería: el rastro como foto del terreno.** El jugador espera ver piedras y árboles en la línea. Mismo patrón sobre la misma mecánica: el terreno se aplana hasta ser una recta y el rastro no cambia. Voz: "El terreno cambió de dibujo y la línea quedó igual. ¿Qué está midiendo?".

## 13. Generalización

La analogía se retira en `symbolic`, como declara `walker_height_trace`. El disparador es concreto: con las dos coordenadas negativas el caminante tendría que ir hacia atrás y estar bajo el mar a la vez, y el terreno deja de ayudar. Ahí desaparece y queda la grilla sola.

Variantes sin ayuda visual, en orden: rastros con tramos planos; rastros con un salto; rastros sin altura definida en algunas posiciones; curvas cerradas que hay que descartar con la recta vertical; dos rastros en la misma hoja, donde hay que decir cuál es de cuál máquina.

El nodo está en `abstract` cuando el jugador lee un par sin dibujar hilos, decide si una curva cualquiera es gráfica sin bajar la recta vertical con el dedo, y ubica puntos en las cuatro regiones sin contar marcas.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `precalc.lim.approach`: el rastro se acerca a una altura que nunca toca; el par se lee cada vez más cerca del borde y nunca sobre él.
- `linalg.vec.vector_as_displacement`: el mismo par deja de ser un lugar y pasa a ser una flecha con dirección; la grilla no cambia y el significado sí.
- `trig.circle.unit_circle_radians`: dos números describen un punto del círculo a partir del ángulo, y la curva cerrada que este nodo descartaba vuelve como objeto legítimo.
- `prob.rv.cumulative_distribution`: la altura del rastro es cuánto se acumuló hasta esa entrada, y los saltos que acá eran rareza son la regla.

Concepto siguiente: `alg.fn.linear_slope` ([19](19-alg.fn.linear_slope.md)). Frase puente, narrada sobre un rastro recto: "Ahora ya sabés dibujar el camino entero. Si el camino es una rampa derecha, ¿alcanza con un solo número para decir cuán empinada es?". La rampa se separa del resto del rastro y el nodo 19 empieza ahí.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `slope_walker_leaves_trace` es nativa: corre sobre el estado del jugador, con el punto que avanza y la línea que queda, y produce las dos animaciones de `explain` cambiando la función de entrada. `grid_four_quadrants_with_signs` es nativa y lleva marca de excepción de mecánica en el YAML de escenas, porque el nodo no declara `grid_stretch` aunque la grilla se dibuje con esa familia; el plano no se deforma, solo muestra sus signos. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_plot` ([M](../../M-calculadora/M0-progresion.md)), una hoja en blanco junto a cualquier función definida con `op_define_function`. No devuelve una imagen cerrada: dibuja el rastro con el punto deslizable, y tocarlo muestra el par. Es estructural y con caja de arena, así que el jugador cambia la función y ve el rastro cambiar sin salir del panel.

**Edad universal:** el nodo es `icons` porque desde el paso 3 de la transición hay números escritos en los ejes y en el par. Lo anterior se juega sin leer: el caminante se arrastra, la tinta cae, las gotas suenan al tocarlas, `explain` es entre dos animaciones y los prompts van por voz ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en la grilla de cuatro cuadrantes y arma pares con el teclado de fichas.
