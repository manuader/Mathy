# La mitad del camino (`precalc.lim.approach`)

Minijuego del nodo 25 de la espina, "Acercarse sin llegar". Mecánica principal `slope_walker`, secundaria `gears_sequence`; analogía `zeno_half_steps`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/25-precalc.lim.approach.md): un concepto, cuatro dificultades reales (separar el valor al que se acerca del valor en el punto, aceptar que un proceso infinito tiene destino, leer por los dos lados, comparar la brecha con una brecha elegida), una analogía con una lista al lado, un gesto (girar la manivela y arrastrar la entrada), cinco pasos de desvanecimiento, la pared fija como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Un pasillo con una pared al fondo y alguien caminando hacia ella. Cada paso cubre la mitad de lo que falta: medio pasillo, un cuarto, un octavo.

Mapa objeto a concepto: pared → límite; cada paso es la mitad de lo que falta → término de la sucesión; nunca tocar la pared → límite no alcanzado; más cerca que cualquier brecha elegida → condición de tolerancia; distancia total caminada → suma de la serie; lo que falta → error.

El pasillo aporta el destino que no se alcanza y la brecha que se puede medir. La manivela y la pista de engranajes aportan lo que el pasillo no puede: ver los pasos como una lista y avanzar veinte sin caminarlos. Puntos de ruptura: `limits_reached_or_oscillating`. Hay procesos que sí alcanzan su destino y otros que se acercan saltando de un lado al otro, y un caminante que siempre avanza para adelante no puede mostrarlos; por eso la analogía se retira en `formal` y por eso el minijuego agrega desde temprano el acercamiento por los dos lados sobre el rastro ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el pasillo cruzando la pantalla con la pared a la derecha, el caminante, el marcador de brecha entre los dos, la manivela abajo. Desde el tercer nivel el pasillo se dobla y se vuelve el rastro del nodo 18 sobre una cuadrícula, con la tabla de valores en una banda lateral. Gestos: `drag`, `scrub` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela.** El caminante avanza la mitad de lo que falta. El marcador de brecha se achica a la mitad y deja una marca de dónde estaba. Las marcas se apiñan contra la pared.
- **Seguir girando cuando ya no se distinguen.** La cámara se acerca y las marcas vuelven a separarse. La escena se puede mirar de cerca para siempre, y ese es el argumento entero del nivel.
- **Colocar la brecha elegida.** El jugador arrastra un segundo marcador cerca de la pared. La manivela gira sola hasta que el caminante lo pasa y el contador muestra en qué paso. El jugador puede volver a colocarlo más cerca: siempre hay un paso.
- **Arrastrar la entrada sobre el eje.** Con el pasillo ya doblado en rastro, el jugador lleva la entrada hacia una marca desde la izquierda y desde la derecha. Una línea sube desde la entrada hasta la curva y otra sale hacia la altura.
- **Soltar la entrada justo en la marca.** Si el rastro tiene un hueco, la línea que sube no encuentra dónde apoyarse. El juego lo muestra sin mensaje y sin cerrar el punto.
- **Tocar un punto dibujado a otra altura.** Las dos lecturas quedan en pantalla a la vez, la del punto y la de los dos lados, y el jugador elige a cuál llamar el valor al que se acerca.
- **Acercarse en una curva con salto.** Las dos lecturas laterales quedan escritas y distintas. El juego no descarta el caso: lo deja en la mesa marcado como sin respuesta todavía.

En `symbolic` la superficie cambia de forma, no de reglas: arrastrar la entrada agrega una fila a la tabla, acercarla por los dos lados parte la tabla en dos mitades que avanzan hacia el centro, y tocar el número que las dos persiguen escribe el renglón. La curva se pide con un toque y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`steepness_independent_of_step_size` (caminante): la lectura no depende de con qué tamaño de paso se llegó. Acá se usa en su forma nueva: el valor al que se acerca la altura es el mismo si la entrada se acerca de a saltos grandes o chicos, por la izquierda o por la derecha, y por eso tiene sentido llamarlo un valor. Se ve romperse en la curva con salto, donde los dos lados dan lecturas distintas y no hay un número que nombrar.

`same_step_every_turn` (engranajes): cada vuelta aplica la misma regla a lo que falta. Es lo que garantiza que la brecha se achique sin cambiar de signo y que el caminante nunca pase la pared. Se ve romperse en los distractores, donde la regla cambia y el caminante se detiene o se pasa.

Un movimiento válido pero inútil, como girar la manivela veinte veces de golpe o colocar la brecha elegida lejísimos de la pared, no rompe ningún invariante: recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `displace`, de apoyo `rate` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el pasillo, el caminante y la pregunta de si toca la pared. Solo se mira y se predice.
- `concrete`: pasillo con marcas, caminante, marcador de brecha, manivela, contador de pasos. Nada escrito salvo el contador.
- `visual`: los pasos se dibujan como una fila de tramos cada vez más cortos que no se superponen. La pared se queda fija mientras todo lo demás se reescala, y esa fijeza es la representación del límite. Al costado, la lista de posiciones y brechas, una fila por vuelta. Con el pasillo doblado en rastro, las dos líneas punteadas y el punto de encuentro dibujado hueco cuando la curva no lo tiene.
- `symbolic`: la tabla de dos columnas partida en dos mitades, la flecha corta de la entrada y el renglón con el nombre.
- `formal`: la definición corta con voz; el pasillo con los dos marcadores fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Brechas dibujadas → columna de números: al girar varias veces, las brechas marcadas se despegan del pasillo y se ordenan en una columna, en el orden en que se produjeron.
2. Posiciones → tabla de dos columnas: al pasar al rastro, cada entrada arrastrada deja su par en una fila. Al acercarse por los dos lados, la tabla se parte en dos mitades que avanzan hacia el medio y el número que las dos persiguen queda solo en el centro.
3. Entrada que se acerca → flecha: al soltar la entrada muy cerca de la marca, las dos fichas se unen por una flecha corta que conserva la dirección del arrastre.
4. Lectura estabilizada → nombre: cuando las dos mitades se acercan al mismo número, ese número se despega del centro y se le antepone un nombre de tres letras, con la flecha colgando abajo.
5. Rastro → función dentro del símbolo: al tocar la curva, su etiqueta se desliza a la derecha del nombre y el renglón queda completo. El punto hueco sigue hueco mientras el renglón está escrito, y tocarlo no lo cambia.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el pasillo fantasma: el límite de una función en un punto es el valor al que se acerca la salida cuando la entrada se acerca al punto; la entrada nunca vale el punto, así que el límite no depende de lo que pase ahí; el límite existe cuando acercarse por la izquierda y por la derecha da el mismo valor. Propiedades: el límite no depende del valor en el punto; cuando existe es único; para toda brecha elegida hay un paso desde el cual la distancia es menor; la suma de todos los tramos es finita aunque los tramos no se terminen. Casos: con hueco el límite existe igual; con el punto dibujado a otra altura el límite es el de los dos lados; con lecturas laterales distintas no hay límite y el caso queda marcado para `calc1.lim.one_sided_and_jump`; si la lectura se va hacia arriba sin detenerse tampoco hay número, y eso abre el nodo siguiente. Símbolo nuevo: `lim`, porque con el hueco hay un número que se puede señalar y que la notación anterior no puede escribir. Convención nueva: la flecha debajo, porque hay que decir hacia dónde se acerca la entrada y una igualdad no puede decirlo.

## Generalización

El pasillo se retira en `formal`. El caminante que siempre avanza para adelante no puede mostrar un acercamiento que oscila ni uno que alcanza su destino, y esos dos casos hay que reconocerlos antes de terminar. La manivela se queda como fantasma a demanda, porque generar el término siguiente sigue siendo un gesto honesto.

Variantes sin ayuda visual: curvas continuas donde el límite coincide con el valor y no hay nada raro que ver; curvas con hueco; curvas con el punto dibujado a otra altura; curvas con salto, marcadas como sin límite; sucesiones que se acercan desde arriba, desde abajo y alternando; sucesiones que no se acercan a nada; el decimal con infinitos nueves, que es el mismo caminante escrito con símbolos. Cuando el jugador escribe el renglón mirando una tabla, sin dibujar la curva, y distingue "no hay límite" de "no hay valor en el punto", la analogía se eliminó.

## Desafío

Correspondencia con la progresión de [H](../H-progresion-abstraccion.md): el nodo introduce `lim`, la fila de la tabla de símbolos que se justifica con el caminante que se aproxima a una pared sin tocarla. Es el primer nodo de la espina cuyo símbolo nace de una imposibilidad y no de una abreviatura.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Pasos que se achican.** `concrete`, `manipulate`. Razón un medio fija; hasta ocho vueltas; la cámara se acerca sola cuando hace falta.
2. **La brecha elegida.** `concrete`, `recognize` y `manipulate`. El jugador coloca el segundo marcador y la manivela gira sola hasta pasarlo. Aparecen los caminantes distractores: el que llega y el que oscila.
3. **Del pasillo al rastro.** `visual`, `explain` y `manipulate`. Misma dificultad; el pasillo se dobla, la entrada se arrastra por los dos lados y la altura se lee con las dos líneas punteadas.
4. **El hueco.** `visual`, `explain`. Parámetros: curvas con un punto vacío en la marca. Aparece `limit_as_reaching`.
5. **Tabla al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La tabla aparece junto al rastro y se parte en dos mitades; nacen la flecha y el nombre.
6. **El renglón solo.** `symbolic` segunda mitad, `apply`. La curva queda como fantasma a demanda y el jugador escribe el renglón desde la tabla.
7. **Puntos mudados y saltos.** Parámetros: el punto dibujado a otra altura y las lecturas laterales distintas. El teclado de fichas deja de ofrecer el renglón prearmado.
8. **Sin pasillo.** `formal` y `abstract`, `generalize`. Definición corta con voz; sucesiones que se acercan de distintas maneras, sucesiones que no se acercan a nada y el decimal con infinitos nueves.

Qué endurece cada parámetro: el hueco rompe la costumbre de evaluar; el punto mudado obliga a elegir entre dos lecturas que están las dos en pantalla; el salto obliga a responder "no hay" sin que eso sea un error; las sucesiones que oscilan rompen la imagen del avance en una sola dirección, que es justo la ruptura declarada de la analogía.

Desafíos de olimpíada: el nodo participa en `ch.calc.telescoping_sum_hidden_split` de [S](../S-desafios/S0-desafios.md), donde el último paso es tomar el límite de una suma parcial que casi todo se cancela. Ese desafío pide además nodos de series, así que no se desbloquea acá; hasta entonces el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro caminantes avanzando hacia la misma pared. Tocar el que se acerca cada vez más sin tocarla. Los distractores son el que llega y se detiene, el que oscila alrededor y el que se detiene antes en un punto fijo.
- `explain`: la misma curva con hueco en dos animaciones. En una, la lectura se sigue por los dos lados y se estabiliza; en la otra, la lectura salta al punto vacío y se declara inexistente. Tocar la que confunde acercarse con llegar. El distractor es `limit_as_reaching`.
- `manipulate`: la tabla de valores de una curva alrededor de `x = 3`; acercar la entrada por los dos lados hasta que las dos mitades se junten y leer la altura.
- `apply`: una gráfica con un hueco en `x = 2` y un punto dibujado en otra altura; armar con fichas el valor al que se acerca la función, contra el tiempo objetivo del nodo.
- `generalize`: una sucesión de pasos a la mitad hacia una pared a distancia 1; predecir con la manivela la posición límite sin hacer todos los pasos, y después la misma pregunta con una sucesión que oscila.
- `transfer`: en la colina de `calc1.deriv.rate_as_slope_limit`, juntar dos puntos de la curva con la manivela y observar a qué pendiente se acerca la secante. También en `calc2.ser.partial_sums` y en `prob.basic.probability_as_proportion`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `limit_as_reaching`, patrón `counterexample_slider` sobre el caminante, que es la mecánica principal del nodo y corre sin traducción. El juego pone dos lecturas en paralelo sobre la misma curva, la altura en el punto y la altura a la que se acerca, con un deslizador en la posición de la entrada. El barrido lleva la entrada hacia la marca desde los dos lados y se ve que la lectura de abajo converge mientras la de arriba se queda hueca. Voz: "El punto está vacío y la lectura igual se acerca a {L}. ¿A cuál le hacemos caso?". El deslizador queda en manos del jugador. El patrón pide `literacy: icons`, que es la del nodo.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de esa misconception, más las de `alg.fn.graph_as_picture` y `arith.frac.parts_and_ratio`.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `slope_scene_walker_approaches_wall`, nativa, parametrizada por la función, el punto, el valor del límite y si hay hueco. La entrada se acerca por los dos lados, las líneas punteadas suben y cruzan, el punto se dibuja hueco cuando corresponde y la lectura cambia mientras la entrada se mueve; gramática `displace`, con la pared fija mientras la escena se reescala. Es la imagen de cheatsheet de `cs.precalc.limit_ignores_value_at_point` y produce las dos animaciones de `explain`.
- `gear_scene_zeno_halving`, nativa, parametrizada por el destino, la cantidad de pasos y la razón. Los tramos se dibujan uno tras otro, cada vez más cortos, y la brecha se achica con su número al costado. Cambiando la razón produce los distractores de `recognize`: el que llega, el que oscila y el que se detiene.
- Reusadas: el rastro y el par ordenado del nodo 18 como base del cambio de escenario. Las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_halving_walk`: `target`, la posición de la pared; `ratio` (un medio en los niveles 1 y 2, entre un tercio y cuatro quintos desde el 3, y valores mayores o negativos solo para los distractores); `n_steps` de 4 a 20; `chosen_gap`, la brecha que el jugador coloca; `seed`.
- `gen_hole_graph`: `shape` en {recta, parábola, cociente con factor común}; `a`, el punto al que se acerca la entrada; `hole` en {ninguno, hueco, punto_mudado, salto}; `limit_value`; `point_value`, que solo se usa cuando el punto está mudado.
- `gen_approach_table`: `sides` en {izquierda, derecha, ambos}; `rows` de 3 a 8 por lado; `decimals`, cuántas cifras muestra cada fila; `stop_short`, cuántas filas quedan sin completar para que el jugador las agregue.

**Literacy soportada:** de `icons` a `full_text`. El pasillo y la manivela se juegan sin leer, pero la tabla de valores y los dos marcadores llevan números desde el segundo nivel y el patrón de explicación del nodo pide ese mínimo, así que el mínimo declarado es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela una vez, el caminante avanza la mitad de lo que falta y el marcador de brecha se achica dejando su marca. La escena vuelve al inicio y la manivela late. La demostración del arrastre por los dos lados se hace una vez al empezar el nivel del rastro, con la entrada yendo y viniendo alrededor de la marca. No se repiten si el jugador ya está girando o arrastrando ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
