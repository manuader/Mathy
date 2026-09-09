# La rueda de radio uno (`trig.circle.unit_circle_radians`)

Minijuego del nodo 43 de la espina, "Círculo unitario y radianes". Mecánica principal `construct`, secundarias `gears_sequence` y `grid_stretch`; analogía `clock_face_wrap`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/43-trig.circle.unit_circle_radians.md): un concepto, cinco dificultades reales (el radián como razón y no como unidad, la independencia del radio, el punto que trae dos números, los signos como lectura de la grilla, y que dos pi no es trescientos sesenta disfrazado), una analogía, un gesto (girar el radio y bajar la altura), cinco pasos de desvanecimiento, el punto que se desplaza por el borde como visualización dominante, retiro del reloj en `formal`. Acá se fija cómo se juega.

## Analogía

La esfera de un reloj. La aguja avanza, y lo único que importa es dónde queda: las vueltas completas no se ven en la posición final. Retroceder también da vuelta.

Mapa objeto → concepto: la esfera → el módulo; las horas que avanza la aguja → la suma; quedar en la misma posición después de vueltas completas → la congruencia; las vueltas olvidadas → el cociente descartado; la posición en la que queda la aguja → el resto; retroceder → restar.

Se eligió esta y no la rueda con pasajero porque acá interesa la posición y no la altura; la rueda es del nodo 44. Punto de ruptura: `modulus_other_than_twelve`. El reloj tiene doce marcas y la vuelta del círculo mide dos pi, que no es un número redondo. Por eso la esfera se retira en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el círculo en el centro sobre una grilla, el radio apoyado a la derecha, la cinta del largo del radio guardada al costado y la manivela abajo. Gestos: `drag`, `tap`, `hold` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar el extremo del radio.** El radio gira y el punto se desplaza por el borde. Mientras gira, la cinta se apoya sola sobre el arco recorrido y un contador dice cuántas cintas enteras y qué pedazo lleva. Ese contador es el ángulo.
- **Girar la manivela.** Avanza de a una cinta entera: uno, dos, tres radios de arco. La sexta no cierra la vuelta, y el pedacito que falta se ve solo.
- **Girar la manivela al revés.** El contador baja y pasa a negativo. La aguja del reloj retrocede.
- **Toque sostenido sobre el punto.** Baja la altura hasta el eje horizontal, con el pie sobre el eje y el cuadradito del ángulo recto. La hipotenusa es el radio y mide 1.
- **Tocar una coordenada.** La lee sobre la grilla, con signo, porque la grilla ya traía los signos del nodo 18.
- **Estirar la grilla con dos dedos.** El círculo pasa a radio 3 y el contador de cintas no se mueve: la cinta creció con el círculo.
- **Seguir girando más allá de la vuelta.** El punto vuelve a pasar por donde ya estuvo y el contador sigue creciendo. El reloj lo dice antes de que nadie lo escriba.

En `symbolic` la superficie cambia de forma y no de reglas: el contador se vuelve una ficha con la etiqueta `rad`, el jugador mete el ángulo en lugar de arrastrarlo y el radio gira solo hasta ahí. El círculo con marcas vuelve a pedido tocando la ficha.

## Invariante matemático

`same_step_every_turn` (la manivela): cada vuelta de manivela apoya exactamente un radio de arco, siempre el mismo paso. Sobre ese paso uniforme se apoya toda la medida.

El invariante propio del nodo, el que el jugador tiene que creer, es que **la medida no depende del tamaño del círculo**. Se ve confirmarse en el gesto de estirar la grilla: el círculo se agranda, el arco recorrido se agranda, la cinta se agranda, el contador no se mueve. Se vería romperse si la cinta no creciera con el círculo, y el juego ofrece ese contraejemplo una vez: una cinta con candado, que no escala, y con la que el contador da cualquier cosa.

De apoyo, `construction_reveals_not_changes` de `construct`: bajar la altura desde el punto no mueve el punto. La altura no es una decisión del jugador, es una consecuencia de dónde quedó.

Un movimiento válido pero inútil (girar hasta un ángulo que no es el pedido, o bajar la altura antes de haber girado) no rompe nada. Recibe un empujón suave: el objetivo late.

## Representación visual

Primitiva dominante `displace`, de apoyo `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la rueda de la plaza quieta y una cinta del largo de un rayo. Solo se mira y se predice cuántas cintas entran en el borde.
- `concrete`: el círculo con el radio, la cinta que se apoya y el contador. Nada escrito salvo el conteo.
- `visual`: el arco recorrido queda pintado detrás del punto, segmentado en tramos del largo del radio, como una cinta métrica curva. Al lado, una recta numérica recibe el mismo rastro desenrollado, con las mismas marcas.
- `symbolic`: la ficha `rad`, la letra del ángulo, y el par de coordenadas entre paréntesis junto al punto, con el triángulo como fantasma.
- `formal`: la definición corta con voz, el círculo al lado y la esfera del reloj ya retirada.

Lo que se desplaza es el punto; lo que se conserva es la distancia al centro; lo que se escala es la grilla, y solo en el nivel donde se comprueba la independencia del radio.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Rueda a círculo: al terminar `intuition` los rayos se desvanecen menos uno, el borde se afina y queda un círculo con su radio y su centro marcado.
2. Cinta a marca de arco: al completar la primera vuelta contando cintas, las cintas dejan de dibujarse como objetos y quedan como marcas numeradas sobre el arco.
3. Marca a ficha `rad`: al soltar el radio en una posición cualquiera, el contador se contrae en una ficha con el número y la etiqueta pegada. Es el mismo objeto, encogido.
4. Punto a par de coordenadas: al bajar la altura, la altura se contrae en un número sobre el eje vertical y el pie en otro sobre el horizontal, y los dos se juntan entre paréntesis junto al punto.
5. Coordenadas a nombres: en el último nivel simbólico, la coordenada horizontal recibe el nombre `cos` y la vertical el nombre `sen`, cada uno saliendo de su número con un hilo que lo une a su lado del triángulo.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el círculo: un radián es el ángulo cuyo arco mide lo mismo que el radio; la medida en radianes es el arco dividido el radio, y por eso no depende del tamaño del círculo; el círculo unitario es el conjunto de puntos a distancia 1 del origen, y el punto al que lleva un giro de θ radianes desde la derecha, en sentido antihorario, tiene coordenadas `(cos θ, sen θ)`. Propiedades: una vuelta mide `2π`, media `π`, un cuarto `π/2`; los ángulos negativos son giros horarios; sumar una vuelta no cambia el punto; la suma de los cuadrados de las coordenadas es 1, que es Pitágoras sobre el triángulo del radio. Símbolos nuevos, de a uno y cada uno con su problema: `rad`, porque escribir "dos cintas y media de arco" es más largo que el número; la letra del ángulo, porque hay que hablar del giro antes de fijarlo; y `sen` y `cos` como nombres de las dos coordenadas, porque los puntos interesantes tienen coordenadas incómodas de escribir. La forma escrita de esos dos nombres la decide el `MathLocale` del jugador y no el idioma de la interfaz: `sen` en `es-AR` y `es-ES`, `sin` en `en-US` ([P](../P-internacionalizacion.md)).

## Generalización

La esfera del reloj se retira en `formal`, cuando los ángulos dejan de caer en horas. El círculo con marcas queda a demanda tocando la ficha `rad`.

Variantes sin ayuda visual: ángulos que son fracciones simples de vuelta; ángulos negativos; ángulos de más de una vuelta; el mismo ángulo sobre un círculo de otro radio; y el camino inverso, arco dado y ángulo pedido, que es la puerta de `trig.circle.radian_as_arc_length`. Cuando el jugador ubica cualquier ángulo sin dibujar el reloj, dice el signo de las dos coordenadas antes de calcularlas y explica por qué la medida no cambia con el radio, la analogía se eliminó.

## Desafío

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cintas en el borde.** `concrete`, `manipulate`. Girar y contar cintas enteras. Solo giros positivos menores que una vuelta. Sin coordenadas.
2. **La sexta y el pedacito.** `concrete`, `recognize` y `explain`. La manivela avanza de a un radián; el nivel entero es descubrir que la vuelta no es un número redondo de cintas.
3. **Bajar la altura.** `visual`, `manipulate`. Aparece la construcción: el triángulo del radio, el cuadradito, y las dos coordenadas leídas en la grilla del primer cuadrante.
4. **Los cuatro cuadrantes.** `visual`, `manipulate` y `apply`. Parámetros: giros que pasan de un cuarto de vuelta. Los signos aparecen solos al leer la grilla.
5. **Otro radio.** `visual`, `generalize`. Estirar la grilla a radio 3 y comprobar que el contador no cambia. Incluye el contraejemplo de la cinta con candado.
6. **Fichas de pi.** `symbolic`, `manipulate` y `apply`. Aparecen `rad`, la letra del ángulo y los ángulos notables como fichas; la coordenada se arma con el teclado.
7. **Vueltas y giros al revés.** Parámetros: ángulos negativos y mayores que `2π`, y ángulos que no son notables. Aparece `sin_of_sum_distributes` cuando el jugador encadena dos giros.
8. **Sin reloj.** `formal` y `abstract`, `generalize`. La definición corta con voz, arcos dados con el ángulo pedido, y la conversión con grados presentada como convención.

Qué endurece cada parámetro: los ángulos no notables obligan a razonar por cuadrante en lugar de recordar una tabla; los negativos rompen la lectura "el ángulo es cuánto avancé"; las varias vueltas separan la posición del recorrido; el radio distinto de 1 separa el arco del ángulo, que es lo único que hace falta para el nodo siguiente.

Desafíos: el nodo no figura en el `requires` de ningún desafío de [S](../S-desafios/S0-desafios.md), pero es prerequisito de los nodos que sí figuran. `ch.trig.unit_circle_hidden_cosine` (entrenamiento) es este círculo con una coordenada tapada, y se resuelve con la misma construcción de acá más el signo del cuadrante; `ch.trig.regular_polygon_area_by_radii` (regional) reparte la vuelta completa entre los vértices de un polígono. Los dos se juegan un poco más adelante, con `trig.ang.quadrant_signs` y `trig.circle.radian_as_arc_length` en `ready`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: sobre el círculo de radio 1, tocar el punto donde termina un cuarto de vuelta. Distractores: los otros tres cuartos y el punto de media vuelta.
- `explain`: desenrollar el radio con la manivela y elegir, entre tres animaciones, la que muestra por qué la vuelta mide un poco más de seis radios. Un distractor cuenta diámetros; otro apoya cuerdas rectas en vez de arcos.
- `manipulate`: girar el radio hasta `2π/3`, bajar la altura desde su extremo y leer las dos coordenadas con su signo.
- `apply`: con la entrada de radianes de la cheatsheet a la vista, ubicar `π/6`, `π/2` y `4π/3` y armar sus coordenadas con las fichas, contra el tiempo objetivo del nodo.
- `generalize`: un círculo de radio 3, y predecir con la manivela cuánto mide el arco de un ángulo de 2 radianes.
- `transfer`: en el reloj de doce horas de `disc.mod.clock_equivalence`, encontrar qué giro en radianes lleva de las 12 a las 8 y comprobar que una vuelta más no cambia la posición. También en `adv.cplx.multiplication_rotates_scales`, `linalg.map.linear_transformation_2d` y `calc2.parpol.parametric_speed`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo declara la lista vacía en el grafo, pero `misconceptions.yaml` lo incluye entre los nodos de `sin_of_sum_distributes`, y jugando aparece en el nivel 7, al encadenar dos giros.

- `sin_of_sum_distributes`, patrón `counterexample_slider` sobre `machine_pipe`. La mecánica no está entre las del nodo, así que corre la regla 2 de L0: el jugador ya conoce la tubería desde `alg.fn.function_as_machine` y la explicación se presenta como un regreso. El juego escribe la regla del jugador en la tubería, engancha un deslizador al segundo ángulo y lo barre; con los dos ángulos en un cuarto de vuelta, la suma de alturas da 2 y la altura verdadera da 0. Voz: "Dos cuartos de vuelta te dejan abajo del todo, y vos sumaste dos alturas de uno. ¿Dónde quedó el punto?". El patrón no reabre la interacción: el ítem se reinicia.

Los movimientos no equivalentes que el clasificador no atribuye (confundir el arco con la cuerda, contar diámetros, leer el ángulo en grados sobre una ficha en radianes) se registran para la minería de errores de L0. Ninguno tiene entrada todavía, y este documento no la inventa.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `construction_scene_radius_and_dropped_height`, nativa. El círculo sobre la grilla, el radio que gira con el gesto del jugador, la altura que baja desde el extremo, el cuadradito y las dos coordenadas que se encienden en los ejes; gramática `displace`. Parametrizada por el ángulo, produce también los distractores de `explain`.
- `gear_scene_unroll_radius_on_arc`, de doble ruta. La cinta del largo del radio se apoya sobre el arco una y otra vez mientras la manivela gira, y el mismo rastro se desenrolla sobre una recta numérica al lado. Abre los niveles 1 y 2 y es la imagen de cheatsheet de `cs.trig.radian_as_arc_over_radius`.
- Reusadas: las escenas de giro del nodo 39 en el nivel 1, y la grilla con signos del nodo 18 en el nivel 4.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_circle_angle`: `angle_set` en {whole_turns, quarters, notable_fractions, arbitrary}; `sign` en {positive, both}; `winding` (0 hasta el nivel 6, hasta 2 vueltas desde el 7); `radius` (1 en casi todos, 2 a 5 en el nivel 5); `seed`.
- `gen_arc_ribbon`: `steps` (cuántas cintas enteras avanza la manivela por vuelta de manija), `show_counter`, `ribbon_scales` (falso solo en el contraejemplo de la cinta con candado).
- `gen_quadrant_point`: `quadrant` en {1, 2, 3, 4}; `hidden_coordinate` en {x, y}, cuál de las dos se tapa; `seed`. Alimenta los ítems de `apply` y prepara `ch.trig.unit_circle_hidden_cosine`.

**Literacy soportada:** de `icons` a `full_text`. La primera capa se juega sin leer (girar es arrastrar, medir es apoyar la cinta), pero desde el segundo nivel el contador muestra un número con la etiqueta de la unidad, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la cinta, la apoya sobre el borde desde el punto de partida, la marca, la vuelve a apoyar y sigue hasta que la vuelta se cierra. Después toma el extremo del radio y lo arrastra media vuelta, con el contador subiendo. La demostración de bajar la altura se hace una sola vez, al inicio del nivel 3, y se repite solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
