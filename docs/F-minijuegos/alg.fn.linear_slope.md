# La rampa del caminante (`alg.fn.linear_slope`)

Minijuego del nodo 19 de la espina, "La pendiente es lo empinado". Mecánica principal `slope_walker`, secundarias `gears_sequence` y `grid_stretch`; analogía `walker_on_ramp`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/19-alg.fn.linear_slope.md): un concepto, tres dificultades reales (separar el paso de lo empinado, el cociente como propiedad, distinguir arranque de tasa), una analogía, un gesto (apoyar y estirar el escalón sobre la rampa), cinco pasos de desvanecimiento, la rampa con su escalón como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una rampa recta por la que sube un caminante. En cada paso sube siempre lo mismo. Una rampa más empinada sube más por paso.

Mapa objeto → concepto: rampa recta → función lineal; subida por paso → pendiente; altura de arranque → ordenada al origen; rampa más empinada → pendiente mayor; rampa que baja → pendiente negativa; misma subida por paso entre dos puntos cualesquiera → tasa constante; escalón apoyado → par de diferencias; color del escalón → el número de la pendiente.

La analogía conserva `steepness_independent_of_step_size`: la rampa es la misma sin importar dónde se apoye el escalón ni cuán ancho sea. Punto de ruptura: `vertical_ramp`. Una rampa vertical no tiene subida por paso porque no hay paso, y el juego lo usa como caso final ([G0](../G-analogias/G0-reglas.md)).

`gears_sequence` acompaña con la versión de pasos contados, una manivela que avanza siempre lo mismo por vuelta. `grid_stretch` aporta el estirado que muestra que la pendiente es propiedad del par recta y grilla.

## Mecánica central

Superficie: la rampa sobre la grilla ocupa el centro, el escalón suelto abajo, los dos deslizadores a la derecha, la manivela a la izquierda desde la capa `visual`. Gestos: `drag` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Apoyar el escalón contra la rampa.** Crece hasta tocarla con su esquina y queda dibujado con dos tramos, el horizontal y el vertical, con sus marcas contadas.
- **Arrastrar el escalón a lo largo de la rampa.** Las marcas cambian de cantidad; el color del escalón no cambia. El color codifica la pendiente y es el mismo en toda la rampa.
- **Estirar el escalón.** El tramo vertical crece solo, en proporción. Si el jugador fuerza un vertical que no corresponde, el escalón se despega y queda flotando, con una sombra donde tendría que apoyar.
- **Superponer dos escalones.** El juego escala uno hasta el otro y encajan. Es el gesto que produce el número de la pendiente.
- **Mover el deslizador de arranque.** La rampa se desplaza entera y el color no cambia.
- **Mover el deslizador de inclinación.** La rampa gira sobre el punto de arranque y el color cambia.
- **Girar la manivela.** Cada vuelta avanza un paso y sube la misma altura, sincronizada con el caminante.

En `symbolic` la superficie cambia de forma, no de reglas: apoyar el escalón es tomar dos puntos, estirarlo es cambiar el par de diferencias, y los deslizadores mueven las fichas `m` y `b` del renglón. La rampa se pide con un toque y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`steepness_independent_of_step_size` (rampa): la razón entre subida y avance no cambia con el ancho ni con el lugar del escalón. Se ve romperse cuando el jugador fuerza un vertical que no corresponde: el escalón se despega de la rampa y queda flotando. La grilla estirada de `grid_stretch` es el contraste: ahí el color sí cambia, porque cambió la grilla y no el escalón.

`same_step_every_turn` (manivela): cada vuelta avanza lo mismo. Se ve romperse cuando el jugador intenta una rampa que se curva: la manivela se desincroniza del caminante y el diente salta.

Un movimiento válido pero inútil, como apoyar dos veces el escalón en el mismo lugar o mover el deslizador de arranque cuando lo pedido es la pendiente, recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `rate`, de apoyo `displace` y `deform` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: dos rampas de acceso con dos caminantes de zancada distinta. Solo se mira y se predice.
- `concrete`: rampa de madera sobre la grilla, caminante, escalón suelto con sus marcas, dos deslizadores.
- `visual`: la rampa se estiliza en un segmento; el escalón conserva sus dos tramos y su color; al costado, la manivela con sus dientes. Superponer dos escalones muestra que encajan.
- `symbolic`: fichas `Δx`, `Δy`, `m` y `b` sobre la grilla, y el renglón `y = mx + b` bajo la recta.
- `formal`: la definición corta con voz; la rampa fantasma al lado y la recta vertical como caso sin pendiente.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Escalón → dos números: al tocar el escalón apoyado, sus tramos se separan un poco y cada uno muestra su cantidad de marcas.
2. Números → diferencias: al llevar las esquinas del escalón sobre dos puntos del rastro, cada número se abre en la resta de coordenadas de esos puntos, con los pares del nodo 18 y sus hilos punteados por un instante.
3. Diferencia → `Δ`: al reapoyar el escalón en otro lugar, la resta se contrae en `Δx` bajo el horizontal y `Δy` junto al vertical; la resta queda un rato como sombra.
4. Escalón → `m`: al superponer dos escalones de ancho distinto y ver que encajan, los dos se funden en una ficha con forma de fracción, `Δy` sobre `Δx`, que se contrae en la letra `m` con el color del escalón.
5. Rampa → `y = mx + b`: al mover el deslizador de arranque con `m` ya formada, el punto de arranque deja su ficha `b` sobre el eje vertical y las dos se acomodan en el renglón bajo la rampa; mover cualquiera de los deslizadores mueve rampa y renglón a la vez.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la rampa fantasma: una función lineal sube siempre lo mismo por cada unidad que avanza; la pendiente es cuánto sube dividido cuánto avanza, medida entre dos puntos cualesquiera; la ordenada al origen es la altura donde la recta cruza el eje vertical.

Propiedades: la pendiente no depende del par de puntos elegido; es el factor de escala entre avance y subida, así que duplicar `Δx` duplica `Δy`; su signo dice si sube o baja; misma `m` y distinta `b` dan rectas paralelas; dos tramos consecutivos tienen la misma pendiente que el tramo que los abarca. Casos: `m = 0` es la rampa plana y es una función; la recta vertical no tiene pendiente porque `Δx` vale cero.

Dos símbolos nuevos, de a uno. `Δ` llega primero, para dejar de escribir la resta de coordenadas cada vez que el escalón se mueve. `m` llega después, cuando dos escalones de anchos distintos encajan y hace falta un número que nombre lo que comparten. La `b` no es símbolo nuevo: es una altura leída en el eje.

## Generalización

La rampa se retira en `symbolic`, con un disparador concreto: cuando sube 2 por cada 7, apoyar el escalón deja de ser útil y conviene calcular. El caminante se queda como fantasma a demanda hasta `formal`.

Variantes sin ayuda visual: pendientes negativas; pendientes fraccionarias; pendiente cero y la recta vertical como ausencia; rectas dadas por dos puntos sin dibujo; rectas escritas sin despejar, donde `m` y `b` hay que reconocerlas; comparar dos rectas para decidir si se cruzan. La analogía se eliminó cuando el jugador calcula la pendiente entre dos puntos sin apoyar escalones, dice si dos rectas son paralelas mirando solo sus fichas, y explica por qué la vertical no tiene pendiente sin usar la palabra "error".

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): no aplica, porque este nodo no es de despeje. La correspondencia útil es con las capas: `real` e `intuition` son los niveles 1 y 2, `concrete` los niveles 3 y 4, `visual` el 5, `symbolic` los niveles 6 y 7, `formal` y `abstract` el 8.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Dos rampas.** `real`, `recognize`. Los dos caminantes suben y el jugador mira. Pendientes enteras chicas y positivas.
2. **¿Cuál cuesta más?** `intuition`, `explain`. La escena se detiene y hay que elegir entre tres respuestas.
3. **Apoyar el escalón.** `concrete`, `manipulate`. Pendientes enteras positivas, arranque en cero, escalón de ancho uno.
4. **Escalones de cualquier ancho.** `concrete`, `explain` y `manipulate`. Parámetros: el escalón se estira y se mueve; aparece la superposición de dos escalones.
5. **Manivela y grilla.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; entran la manivela y el estirado de grilla que cambia el color.
6. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. Aparecen `Δx`, `Δy`, `m` y `b` junto a la rampa, en sincronía con ella.
7. **Rampa fantasma.** `symbolic` segunda mitad, `apply`. Parámetros: pendientes negativas y fraccionarias, arranque distinto de cero, rectas dadas por dos puntos y rectas escritas sin despejar. La rampa se pide con un toque.
8. **La rampa que no tiene pendiente.** `formal` y `abstract`, `generalize`. Definición corta con voz; pendiente cero, recta vertical y comparación de dos rectas para decidir si se cruzan.

Qué endurece cada parámetro: el ancho variable del escalón separa paso de pendiente, que es la dificultad central; las pendientes negativas rompen la lectura "más alto es más grande"; las fraccionarias vuelven inútil contar marcas y obligan al cociente; el arranque distinto de cero separa `m` de `b`; la recta sin despejar rompe la lectura posicional del renglón.

Desafíos de olimpíada: el nodo no aparece todavía en ningún `requires` de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`. Cuando existan los desafíos de funciones, la pendiente entrará como paso intermedio de problemas de tasa con datos ocultos.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: tres rampas con caminantes y una ficha que dice "sube 2 por paso"; tocar la rampa que le corresponde.
- `explain`: dos animaciones. En una el caminante da pasos de distinto tamaño y la rampa sigue igual de empinada; en la otra la rampa cambia de inclinación según el tamaño del paso. Tocar la que confunde paso con pendiente. El distractor elegido clasifica.
- `manipulate`: dos puntos marcados en la grilla; ajustar los dos deslizadores hasta que el rastro pase por los dos. Los deslizadores son independientes.
- `apply`: un taxímetro que arranca en un valor y sube por cuadra; arrastrar las fichas de arranque y de tasa que arman la rampa, contra el tiempo objetivo del nodo.
- `generalize`: sin rampa, tres formas escritas de la misma recta, una de ellas sin despejar; tocar la ficha `m` en cada una.
- `transfer`: en la colina de `calc1.deriv.rate_as_slope_limit`, tocar el tramo donde la subida por paso coincide con la ficha.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). El nodo declara `misconceptions: []` en el grafo: el error central ocurre sobre el gesto y no sobre la expresión, y todavía no tiene regla `detect` escribible. Lo que corre es esto:

- Candidato en minería: el paso confundido con la pendiente. Es el distractor explícito de `explain`. Patrón `counterexample_slider` sobre `slope_walker`, compatible con la mecánica del nodo: se enuncia la regla del jugador, se le engancha el deslizador de ancho del escalón y se barre hasta que el color se queda quieto mientras las marcas cambian. Voz: "El escalón se hizo más ancho y el color no cambió. ¿Qué mide el color?".
- Candidato en minería: la pendiente como resta y no como cociente. Mismo patrón y misma mecánica: se fija la subida y se barre el avance, y las dos rampas quedan claramente distintas. Voz: "Las dos suben lo mismo. ¿Por qué una cuesta más?".
- `negative_times_negative`, heredada de `arith.int.negatives`, patrón `double_flip` sobre `slope_walker`, mecánica del nodo, así que corre sin traducción. Aparece al medir hacia atrás en una rampa que baja y escribir pendiente negativa donde va positiva. Se muestra el giro de medir hacia atrás, después el de bajar, y se comparan los aterrizajes. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".

Los distractores de `explain` y las opciones de `apply` se generan desde estas reglas y desde las de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `slope_same_steepness_any_step`, nativa. La recta con el escalón que se mueve y se estira, el número de la pendiente que se actualiza y se queda quieto, y las llaves que miden cada tramo; gramática `rate`. Parametrizada por pendiente, arranque y ancho del paso, produce también las dos animaciones de `explain`.
- `slope_intercept_is_start_height`, nativa. Los dos deslizadores mueven la recta y el renglón a la vez, con el punto de arranque marcado sobre el eje y las líneas de lectura hasta él. Es la imagen de cheatsheet de `cs.alg.y_equals_mx_plus_b`.
- Reusada: `slope_walker_leaves_trace` (nodo 18), para volver del segmento al rastro completo al entrar en el nivel 3.
- Ninguna lleva texto rasterizado: los números y las letras los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_ramp`: `slope` (entera positiva hasta el nivel 6, negativa desde el 7, fraccionaria simple desde el 7); `intercept` (cero hasta el nivel 6); `x_range`; `step_width` (fijo en uno hasta el nivel 3, libre desde el 4); `seed`.
- `gen_two_points`: dos puntos de una recta con `slope` e `intercept` dados, con control de si las diferencias son enteras y de si el orden de lectura invita a medir hacia atrás.
- `gen_line_form`: `line` (la recta, la misma en todas las formas de una instancia); `forms` en {despejada, sin despejar}; `distractors` (`m` y `b` intercambiados, un coeficiente copiado sin su signo); `seed`.

**Literacy soportada:** de `icons` a `full_text`. Los dos primeros niveles se juegan sin leer y la comparación por color no usa números, pero desde el nivel 3 el escalón muestra cantidades y desde el 6 aparecen letras, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma apoya el escalón contra la rampa, lo arrastra a otro lugar y muestra que el color no cambia. La escena vuelve al inicio y el escalón late. Se repite solo si el jugador se queda quieto. La demostración de estirar el escalón es aparte y se hace una vez, al entrar en el nivel 4 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
