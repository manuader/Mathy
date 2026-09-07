# La rueda gigante (`trig.fn.sine_as_height`)

Minijuego del nodo 44 de la espina, "El seno es la altura". Mecánica principal `construct`, secundarias `machine_pipe` y `slope_walker`; analogía `wheel_rider_height`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/44-trig.fn.sine_as_height.md): un concepto, cinco dificultades reales (pasar de coordenada a función, aceptar un dominio que no se termina, ver que la salida está acotada, no repartir el seno sobre la suma, reconocer el coseno como la misma onda corrida), una analogía, un gesto (bajar la altura desde el extremo del radio y medirla contra el poste), cinco pasos de desvanecimiento, la cadena giro a punto a altura como visualización dominante, retiro de la rueda en `formal`. Acá se fija cómo se juega.

## Analogía

Una rueda gigante que gira despacio, con una cabina pintada de otro color y un poste con marcas al costado. Lo único que interesa del pasajero es a qué altura del poste está.

Mapa objeto → concepto: el pasajero en el borde → el punto del círculo unitario; el ángulo que giró la rueda → la entrada; la altura sobre el eje → el seno; la distancia horizontal al eje → el coseno; que una vuelta entera repita todo → la periodicidad; la altura dibujada a lo largo del giro → la onda.

La altura de una persona en una rueda es una magnitud que se siente en el cuerpo, con signo incluido: por debajo del eje uno está más abajo que donde arrancó, y eso no hay que explicarlo. Variantes por región: rueda de parque, noria de agua, pedal de bicicleta. Punto de ruptura: `angle_as_a_pure_number`. Ninguna rueda gira quince radianes ni sesenta hacia atrás, y cuando el ángulo deja de ser un giro observable la rueda estorba. Por eso se retira en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la rueda a la izquierda con el eje marcado y el poste al costado; a la derecha, el papel del rastro; abajo, la máquina con su boca y su tubería. Gestos: `drag`, `tap`, `hold` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar el pasajero por el borde.** La rueda gira. El ángulo recorrido se cuenta en radianes, como en el nodo 43.
- **Toque sostenido sobre el pasajero.** Baja la altura hasta la línea del eje: aparecen la barra vertical y el triángulo con el cuadradito del recto. La barra se despega y se apoya contra el poste, que la mide. Debajo del eje se dibuja hacia abajo y el poste la lee con signo.
- **Meter una ficha de ángulo en la boca de la máquina.** La rueda gira sola hasta ahí y por la salida cae la barra de altura. Meter dos veces el mismo ángulo devuelve la misma barra, y la primera queda como fantasma para que se vea.
- **Girar la manivela del papel.** El giro avanza despacio mientras el papel se desplaza, y la punta de la barra deja un rastro. Media vuelta después el rastro es una loma; una vuelta después, una loma y un pozo.
- **Tocar la máquina.** La da vuelta: la misma rueda y la misma construcción, pero lo que se mide es la sombra horizontal sobre el eje. Sale el coseno.
- **Arrastrar un rastro sobre el otro.** Apoya el del coseno sobre el del seno y se ve que coinciden con un corrimiento de un cuarto de vuelta.
- **Seguir girando más allá de la vuelta.** El rastro nuevo se superpone exacto con el anterior, y eso es todo lo que pasa.

En `symbolic` la superficie cambia de forma y no de reglas: el papel gana marcas de `π/2`, `π`, `3π/2` y `2π`, el rastro pasa a ser el gráfico, y la rueda queda atenuada a la izquierda unida por la línea punteada. Se pide entera tocando la etiqueta de la función.

## Invariante matemático

`same_input_same_output` (la máquina): el mismo ángulo devuelve siempre la misma altura. Es la definición de función sin decir la palabra, y acá tiene una consecuencia que en el nodo 17 no tenía: como la rueda vuelve a pasar por el mismo lugar, ángulos distintos pueden dar la misma altura, y eso no rompe nada. La máquina exige una salida por entrada, no una entrada por salida. Se ve confirmarse con el fantasma de la barra anterior, y se ve romperse en el único movimiento que puede romperlo, que es afirmar una regla falsa sobre la máquina: repartir el seno sobre una suma de ángulos. Ahí no hay estado válido desde donde seguir y el juego muestra un contraejemplo (sección Mastery).

De apoyo, `construction_reveals_not_changes` de `construct`: bajar la altura no mueve al pasajero. Y `steepness_independent_of_step_size` de `slope_walker`, que sostiene el rastro: el dibujo no cambia si la manivela se gira más rápido, solo cambia cuánto papel corre.

Un movimiento válido pero inútil, como girar sin bajar la altura, recibe un empujón suave: el eje late.

## Representación visual

Primitiva dominante `compose`, de apoyo `displace` heredada del nodo 43 ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la rueda del parque girando y el poste. Solo se mira y se predice a qué altura queda la cabina.
- `concrete`: la rueda estilizada, el pasajero, la barra de altura y el poste con marcas. Nada escrito salvo el conteo del giro.
- `visual`: círculo, radio, punto y barra a la izquierda; papel a la derecha; una línea horizontal punteada que sale del pasajero y llega a la punta del rastro. Esa línea es lo que hace visible que la onda no es un dibujo nuevo.
- `symbolic`: la etiqueta de la función con su ficha de ángulo, el par de coordenadas sobre el punto y el gráfico con las marcas de `π`.
- `formal`: la definición corta con voz, el gráfico solo y la rueda como fantasma a demanda.

Lo que se compone es la cadena de dos pasos: el ángulo desplaza el punto, el punto proyecta su altura. Lo que se conserva es el largo del radio, que es lo que acota la onda. Lo que se desplaza es el papel, nunca la rueda.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Rueda a círculo con radio: al pasar a `visual`, las cabinas y la estructura se desvanecen y quedan el círculo, el radio y el pasajero como punto; el poste se afina hasta ser el eje vertical.
2. Barra a número con signo: a la tercera medición contra el poste, la barra se contrae en un número pegado al punto, negativo cuando el pasajero está abajo.
3. Máquina a `sen θ`: cuando la salida de la máquina coincide con la altura que el jugador ya había leído a mano, la boca se contrae en la etiqueta y la ficha del ángulo queda a su derecha. La tubería queda un rato como sombra.
4. Sombra a `cos θ`: el mismo gesto sobre la máquina dada vuelta produce el coseno, y el par de coordenadas del nodo 43 reaparece sobre el punto, ahora leído como dos máquinas.
5. Rastro a gráfico: al completar dos vueltas con la manivela, el papel gana la línea horizontal con las marcas de `π/2`, `π`, `3π/2` y `2π`, y el rastro pasa a ser el gráfico.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la rueda fantasma: para cualquier número real θ, el seno de θ es la altura del punto al que lleva un giro de θ radianes sobre el círculo de radio 1, y el coseno es su distancia horizontal al centro, con signo; el dominio son todos los reales y la imagen es el intervalo de menos uno a uno; sumar `2π` a la entrada no cambia la salida. Casos especiales: en una rueda de radio `r` la altura es `r · sen θ`, y por eso el círculo unitario da la función limpia; el seno de cero es cero y el coseno de cero es uno porque el pasajero arranca a la derecha; girar al revés espeja la altura y no cambia la sombra. El nodo no inventa símbolos: `sen` y `cos` nacieron en el nodo 43 como nombres de dos coordenadas, y lo que cambia acá es que pasan a escribirse aplicados a un argumento y a comportarse como la máquina del nodo 17. Se agrega una convención de escritura, `cos x = sen(x + π/2)`, que la cheatsheet guarda como `cs.trig.cos_is_sin_shifted` y que se hace necesaria después de apoyar un rastro sobre el otro. La forma escrita del nombre la decide el `MathLocale`, no el idioma ([P](../P-internacionalizacion.md)).

## Generalización

La rueda se retira en `formal`, cuando aparecen ángulos que ninguna rueda gira. Queda a demanda tocando la etiqueta de la función, y el gráfico se queda solo.

Variantes sin ayuda visual: ángulos de la primera vuelta que no son notables; ángulos negativos; ángulos de varias vueltas; radio distinto de 1, donde la altura es `r · sen θ`; y el camino inverso, altura dada y ángulo pedido, donde el jugador descubre solo que hay dos respuestas por vuelta y que es la puerta de `trig.inv.arcsin_two_branches`. Cuando da el signo y el valor aproximado para cualquier ángulo sin dibujar, explica por qué la salida no puede pasarse de uno y reconoce el gráfico del coseno como el del seno corrido, la analogía se eliminó.

## Desafío

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **La cabina que sube.** `concrete`, `manipulate`. Arrastrar el pasajero y medir la altura contra el poste. Solo la mitad de arriba de la rueda.
2. **Por debajo del eje.** `concrete`, `recognize` y `manipulate`. Parámetros: la vuelta entera. El poste lee alturas negativas y nadie lo anuncia.
3. **La máquina.** `visual`, `manipulate`. La boca, la tubería y la tabla de entradas y salidas. Aparece el fantasma de la barra repetida.
4. **El rastro.** `visual`, `explain`. La manivela del papel; el rastro de media vuelta y de una vuelta. El nivel entero es entender que la onda es la altura mudada de lugar.
5. **La sombra.** `visual`, `explain` y `apply`. La máquina dada vuelta, el coseno, y apoyar un rastro sobre el otro.
6. **Fichas y gráfico.** `symbolic`, `apply`. La etiqueta con su ficha de ángulo, el gráfico con marcas de `π`, y los valores de los ángulos notables armados con el teclado.
7. **Radio y vueltas.** Parámetros: radio distinto de 1, ángulos negativos y de más de una vuelta, y ángulos no notables. Aparece `sin_of_sum_distributes`.
8. **Sin rueda.** `formal` y `abstract`, `generalize`. La definición corta con voz, altura dada y ángulo pedido, y el gráfico solo.

Qué endurece cada parámetro: el radio distinto de 1 separa la altura de la función y prepara la amplitud; los ángulos negativos y de varias vueltas rompen la lectura "el ángulo es lo que veo girar"; los no notables obligan a razonar por cuadrante y por cota en lugar de recordar valores; pedir el ángulo a partir de la altura fuerza a notar que la máquina no se puede dar vuelta sin elegir una rama.

Desafíos: el nodo figura en el `requires` de `ch.trig.regular_polygon_area_by_radii` (tier regional), donde la vuelta completa se reparte entre los vértices de un polígono, cada porción es un triángulo isósceles y el área de cada uno se lee con el seno del ángulo central. La cheatsheet del desafío destaca `cs.trig.sin_cos_values_key_angles`, que este nodo agrega. Los demás desafíos de trigonometría lo requieren indirectamente, a través de `trig.ang.quadrant_signs`, `trig.id.pythagorean_identity` y `trig.fn.tangent_as_slope`, que tienen a este nodo como prerequisito ([S0](../S-desafios/S0-desafios.md)).

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: mientras la rueda gira, tocar el instante en que el pasajero está a la altura del centro. Hay dos por vuelta y las dos valen.
- `explain`: arrastrar el radio y elegir, entre tres animaciones, la que muestra por qué la altura del extremo es el seno y la sombra sobre el eje horizontal es el coseno. Un distractor intercambia las dos; otro mide la altura desde el piso de la rueda y no desde el eje.
- `manipulate`: meter `π/4`, `π/2` y `3π/4` en la máquina, bajar la altura en cada caso y llenar la tabla.
- `apply`: con la rueda a la vista, armar con fichas el seno y el coseno de `π/3` y de `5π/6` a partir del triángulo del radio, contra el tiempo objetivo del nodo.
- `generalize`: una rueda de radio 4, y predecir con la máquina la altura del pasajero para un ángulo dado, sin dibujar.
- `transfer`: en `calc2.parpol.parametric_speed`, alimentar la misma máquina con el tiempo y trazar el recorrido del punto en la grilla. También en `precalc.param.time_as_hidden_input` y en `adv.four.transform_as_machine`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo declara la lista vacía en el grafo, pero `misconceptions.yaml` lo alcanza por el vecindario de `trig.id.angle_sum`, y jugando aparece una sola.

- `sin_of_sum_distributes`, patrón `counterexample_slider` sobre `machine_pipe`, que el nodo declara, así que corre ahí sin adaptación (regla 1 de L0). El juego escribe la regla del jugador en la tubería, engancha un deslizador al segundo ángulo y lo barre desde cero: al principio las dos salidas casi coinciden, y con los dos ángulos en un cuarto de vuelta la suma da 2 mientras la rueda deja al pasajero en 0. Congela ahí, con las dos barras al lado. Voz: "Dos cuartos de vuelta dejan al pasajero abajo del todo. ¿Cuánto suma tu regla?". No reabre la interacción: el ítem se reinicia, y la regla verdadera llega en `trig.id.angle_sum`.

Los movimientos no equivalentes que el clasificador no atribuye (medir la altura desde el piso, leer la sombra como altura, tratar la salida como si pudiera pasar de uno) se registran para la minería de errores de L0. Ninguno tiene entrada todavía, y este documento no la inventa.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `construction_scene_height_from_radius_tip`, nativa. El círculo, el radio que gira, la altura que baja desde su extremo y el número que la mide con signo; gramática `compose`, parametrizada por ángulo y radio. Produce también los distractores de `explain`.
- `slope_scene_wheel_rider_trace`, de doble ruta. La rueda a la izquierda, el papel corriendo a la derecha y la línea punteada que une al pasajero con la punta del rastro, con dos vueltas de duración. Abre los niveles 4 y 5 y es la imagen de cheatsheet de `cs.trig.sin_cos_as_coordinates`.
- `pipe_scene_angle_to_height`, nativa. La ficha del ángulo entra por la boca, recorre la tubería y sale como barra de altura, con la rueda al costado girando en sincronía. Es la escena sobre la que corre el contraejemplo de `sin_of_sum_distributes`.
- Reusadas: las escenas del círculo unitario del nodo 43 en los niveles 1 a 3, y la máquina del nodo 17 como recordatorio la primera vez que aparece la tubería.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_wheel_angle`: `angle_set` en {upper_half, full_turn, notable_fractions, arbitrary}; `sign` en {positive, both}; `winding` (0 hasta el nivel 6, hasta 3 vueltas en el 7); `radius` (1 salvo en el nivel 7, donde va de 2 a 5); `ask` en {height, shadow, both}; `seed`.
- `gen_angle_table`: cuántas filas tiene la tabla de entradas y salidas, cuáles vienen llenas y cuáles las llena el jugador; incluye siempre una entrada repetida para que el fantasma aparezca.
- `gen_wave_trace`: `turns` (media, una, dos), `direction`, `speed` de la manivela y `overlay` (si se ofrece el rastro del coseno para apoyar encima).

**Literacy soportada:** de `icons` a `full_text`. La primera capa se juega sin leer (girar es arrastrar, medir es apoyar la barra contra el poste, la máquina se opera metiendo fichas), pero desde el segundo nivel el poste muestra números con signo, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra al pasajero un cuarto de vuelta, lo sostiene, baja la altura y apoya la barra contra el poste. En el nivel 3 la mano toma una ficha de ángulo y la mete en la boca de la máquina; la rueda gira sola y la barra cae por la salida. En el nivel 4 la mano gira la manivela media vuelta y el rastro aparece. Ninguna se repite si el jugador ya actuó ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
