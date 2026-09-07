# 19 — La pendiente como tasa constante (`alg.fn.linear_slope`)

> Locale `es`: "La pendiente es lo empinado". Minijuego: [La rampa del caminante](../../F-minijuegos/alg.fn.linear_slope.md).

**Nodo:** `alg.fn.linear_slope` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `rate` · **Mecánica principal:** `slope_walker` (secundarias `gears_sequence` y `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `walker_on_ramp`

## 1. Concepto

Una rampa recta se describe con dos números: dónde empieza y cuánto sube por cada paso. El segundo es la pendiente, y es constante, sin importar dónde se mida ni cuán largo sea el paso. Al terminar, el jugador mide la pendiente con dos puntos cualesquiera, arma la recta que pasa por dos puntos dados y reconoce la misma pendiente en rampas dibujadas a escalas distintas. Antes sabía dibujar el rastro de una máquina; no sabía resumir un rastro recto en un número.

## 2. Prerequisitos

- `alg.fn.graph_as_picture` (nodo [18](18-alg.fn.graph_as_picture.md)): el rastro, el par ordenado y la grilla de cuatro cuadrantes. Se usa entero. La pendiente se mide entre dos puntos del rastro, y los dos puntos son los pares que nacieron allí.
- `arith.mul.scaling` (nodo [05](05-arith.mul.scaling.md)): escalar una cantidad por un factor. Se usa para lo que hace difícil este nodo: si el paso horizontal se duplica, la subida se duplica, y el cociente entre las dos no cambia. Sin escalado, "sube 2 por cada 1" y "sube 6 por cada 3" son dos rampas distintas.

Ninguna arista sigue el orden escolar, donde la pendiente aparece como fórmula dentro del tema de la recta. Acá llega como propiedad del caminante: lo que se conserva cuando el paso cambia de tamaño.

## 3. Dificultad cognitiva real

Lo difícil no es dividir dos restas sino tres capacidades:

1. **Separar el tamaño del paso de lo empinado del camino.** Pasos más largos no vuelven la rampa más empinada. Es el invariante `steepness_independent_of_step_size`, y la fuente del error más frecuente del nodo.
2. **Aceptar que un cociente puede ser una propiedad y no una cuenta.** La pendiente no es el resultado de una operación hecha una vez: es un número que la rampa tiene, igual desde cualquier par de puntos.
3. **Distinguir el arranque de la tasa.** Cambiar el arranque desplaza; cambiar la tasa gira. Dos rampas igual de empinadas que salen de alturas distintas nunca se cruzan.

Las tres se trabajan en la misma rampa, y las dos últimas se separan en el nivel de los dos deslizadores independientes.

## 4. Problema intuitivo

Dos rampas de acceso, una al lado de la otra. Por una sube un caminante de piernas largas, por la otra uno de piernas cortas. El de piernas cortas da el doble de pasos y llega arriba al mismo tiempo.

En `intuition` la escena se detiene a mitad de rampa y pregunta, por voz o por gesto: ¿cuál es más difícil de subir? Tres respuestas dibujadas: la del caminante que da más pasos, la más larga, o ninguna porque las dos suben la misma altura por metro. El jugador elige y después ve: los caminantes se intercambian y la dificultad se queda con la rampa.

## 5. Analogía del mundo real

`walker_on_ramp`, sobre `slope_walker` ([G0](../../G-analogias/G0-reglas.md)). Mapa: rampa recta → función lineal; subida por paso → pendiente; altura de arranque → ordenada al origen; rampa más empinada → pendiente mayor; rampa que baja → pendiente negativa; misma subida por paso entre dos puntos cualesquiera → tasa constante.

Invariante: la rampa es la misma sin importar dónde se apoye el escalón de medición ni cuán ancho sea. Es la forma visible de `steepness_independent_of_step_size`.

Por qué esta y no otra. Una escalera conserva la subida por paso pero impone un paso fijo, y lo que hay que romper es justamente la idea de un paso único. Un precio por kilo conserva la tasa pero no tiene forma, y sin forma no se ven el paralelismo ni el arranque. La rampa conserva las tres cosas.

Punto de ruptura: `vertical_ramp`. Una rampa vertical no tiene subida por paso porque no hay paso. El juego lo usa como caso final: el caminante intenta apoyar el escalón, el escalón tiene ancho cero y el número no se puede formar.

`gears_sequence` acompaña con la versión de pasos discretos: una manivela que avanza siempre lo mismo por vuelta, con su invariante `same_step_every_turn`. `grid_stretch` aporta el estirado de la grilla que muestra que la recta sigue siendo recta y que la pendiente cambia de manera predecible.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `slope_walker` es la principal y da el gesto; `gears_sequence` da la versión de pasos contados; `grid_stretch` da la comprobación de que la propiedad no depende de la escala del dibujo ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `scrub`.

1. Una rampa recta sobre la grilla, con el caminante al pie y un escalón de madera suelto abajo.
2. Demostración: la mano fantasma apoya el escalón contra la rampa. El escalón crece hasta tocar la rampa con su esquina y queda dibujado con dos tramos, el horizontal y el vertical, cada uno con sus marcas contadas en voz alta.
3. El jugador arrastra el escalón a otro lugar de la rampa. Las marcas cambian de cantidad y el color del escalón no: el color codifica la pendiente y es el mismo en toda la rampa.
4. El jugador estira el escalón. El tramo vertical crece solo, en proporción. Si fuerza un vertical que no corresponde, el escalón se despega y queda flotando, con una sombra que muestra dónde tendría que apoyar.
5. Dos deslizadores al costado: uno sube y baja el arranque, el otro gira la rampa. El primero desplaza sin cambiar el color; el segundo cambia el color.
6. La manivela de `gears_sequence` acompaña: cada vuelta avanza un paso y sube la misma altura, sincronizada con el caminante.

Nada se llama "incorrecto". El escalón que no apoya, la rampa que se despega del punto marcado y la manivela que se desincroniza son las tres consecuencias visibles.

## 7. Representación visual

Capa `visual`, primitiva `rate` dominante ([H](../../H-progresion-abstraccion.md)).

La rampa se estiliza en un segmento sobre la grilla. Se desplaza el escalón a lo largo del segmento; se escala el escalón entero, con sus dos tramos a la vez; se conserva la razón entre vertical y horizontal, mostrada como el color del escalón. Al apoyar dos escalones de anchos distintos los dos quedan del mismo color, y el juego los superpone escalando uno hasta el otro: encajan.

`grid_stretch` entra en el nivel de comprobación: la grilla se estira solo en horizontal, la rampa se acuesta y el color del escalón cambia con ella, lo que muestra que la pendiente es propiedad del par recta y grilla, no del dibujo suelto. Todavía no hay letras para los dos números, ni fórmula de la recta, ni resta escrita.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Escalón → dos números.** Al tocar el escalón apoyado, sus dos tramos se separan un poco y cada uno muestra su cantidad de marcas como número: uno bajo el tramo horizontal, uno junto al vertical.
2. **Números → diferencias.** Al arrastrar el escalón para que sus esquinas caigan sobre dos puntos del rastro, cada número se abre en la resta de las coordenadas de esos puntos, con los pares que vienen del nodo 18. Los dos hilos punteados del nodo 18 vuelven un instante.
3. **Diferencia → `Δ`.** Al soltar y volver a apoyar el escalón en otro lugar, la resta se contrae en una sola ficha con la letra `Δ` delante del nombre del eje: `Δx` bajo el horizontal, `Δy` junto al vertical. La resta queda un rato como sombra.
4. **Escalón → `m`.** Al superponer dos escalones de ancho distinto y ver que encajan, los dos se funden en una sola ficha con forma de fracción, `Δy` sobre `Δx`, y esa ficha se contrae en la letra `m` con el color del escalón.
5. **Rampa → `y = mx + b`.** Al mover el deslizador de arranque con la ficha `m` ya formada, el punto de arranque deja su propia ficha `b` sobre el eje vertical, y las dos fichas se acomodan en el renglón `y = mx + b` bajo la rampa. Mover cualquiera de los dos deslizadores mueve la rampa y el renglón a la vez.

## 9. Notación matemática

Queda `y = mx + b` con `m` y `b` legibles sobre el dibujo, y `m = Δy / Δx` como manera de medirla.

Dos símbolos nuevos, en la capa `symbolic` y de a uno, en el orden en que los pide el juego ([H](../../H-progresion-abstraccion.md)).

**`Δ`** llega primero. El problema que lo hizo necesario es dejar de escribir la resta de coordenadas cada vez que el escalón se mueve: el objeto es siempre el mismo tramo, y la resta completa oculta que es una sola cosa. Sale del tramo horizontal y del vertical del escalón.

**`m`** llega después, cuando dos escalones de anchos distintos encajan. El problema es nombrar con un solo número lo que comparten, para comparar dos rampas sin dibujarlas una al lado de la otra. Sale del caminante que sube `m` por cada paso. La `b` no es símbolo nuevo: es una altura leída en el eje, como cualquier coordenada del nodo 18.

## 10. Definición formal

Capa `formal`: texto corto con voz y la rampa al lado. Tres frases, de a una: "Una función lineal sube siempre lo mismo por cada unidad que avanza." "La pendiente es cuánto sube dividido cuánto avanza, medida entre dos puntos cualesquiera." "La ordenada al origen es la altura donde la recta cruza el eje vertical."

Condiciones y casos, verificados sobre el objeto: la pendiente da el mismo número con cualquier par de puntos distintos de la recta, y esa es la definición de que sea recta; `m = 0` es la rampa plana, que es una función y no un caso raro; una recta vertical no tiene pendiente porque `Δx` vale cero, y ahí el escalón no se puede apoyar; dos rectas con la misma `m` y distinta `b` no se cruzan nunca.

Ya jugado: las tres frases enteras. Nuevo: los nombres "pendiente" y "ordenada al origen", y el caso de la recta vertical enunciado como ausencia y no como error.

## 11. Propiedades

- **La pendiente no depende del par de puntos elegido.** Ligada a los dos escalones de ancho distinto que encajan al superponerse.
- **La pendiente es el factor de escala entre avance y subida.** Duplicar `Δx` duplica `Δy`. Ligada a estirar el escalón y ver crecer el vertical solo.
- **El signo dice si sube o baja.** Ligada a girar la rampa con el deslizador hasta pasar por la horizontal.
- **Misma pendiente y distinto arranque dan rectas paralelas.** Ligada a mover el deslizador de arranque con el color congelado.
- **Dos tramos consecutivos tienen la misma pendiente que el tramo que los abarca.** Ligada a apoyar un escalón sobre los dos anteriores.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: tres rampas con caminantes; tocar la que sube tantos escalones por paso como indica la ficha.
- `explain`: dos animaciones. En una, el caminante da pasos de distinto tamaño y la rampa sigue igual de empinada; en la otra, la rampa cambia de inclinación según el tamaño del paso. Tocar la que confunde paso con pendiente.
- `manipulate`: ajustar la altura inicial y la subida por paso hasta que el rastro pase por los dos puntos marcados. Los deslizadores son independientes.
- `apply`: un taxímetro que arranca en un valor y sube por cuadra; arrastrar las fichas de arranque y de tasa que arman la rampa, contra el tiempo objetivo del nodo.
- `generalize`: sin rampa, fichas con letras y números; reconocer pendiente y ordenada en distintas formas de la misma recta, incluidas las que no vienen despejadas.
- `transfer`: en la colina de `calc1.deriv.rate_as_slope_limit`, tocar el tramo donde la subida por paso coincide con la ficha.

Misconceptions y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). El YAML declara `misconceptions: []` para este nodo: el error central todavía no tiene regla `detect` escribible como un antes y un después simbólicos, porque ocurre sobre el gesto y no sobre la expresión. Lo que corre es esto:

- **Candidato en minería: el paso confundido con la pendiente.** El jugador estira el escalón y espera que la rampa se empine, o elige la rampa del caminante que da más pasos. Es el distractor explícito de `explain`. Se explica con `counterexample_slider` sobre `slope_walker`, patrón compatible con la mecánica del nodo: se enuncia la regla del jugador, se le engancha el deslizador de ancho del escalón y se barre hasta que el color del escalón se queda quieto mientras las marcas cambian. Voz: "El escalón se hizo más ancho y el color no cambió. ¿Qué mide el color?".
- **Candidato en minería: la pendiente como resta y no como cociente.** El jugador arma `m` con la sola subida, ignorando el avance. Se explica con `counterexample_slider` sobre `slope_walker`: se fija la subida y se barre el avance; dos rampas con la misma subida quedan claramente distintas. Voz: "Las dos suben lo mismo. ¿Por qué una cuesta más?".
- **`negative_times_negative`**, heredada de `arith.int.negatives`, aparece al medir hacia atrás en una rampa que baja: los dos tramos dan negativos y el jugador escribe pendiente negativa donde va positiva. Patrón `double_flip` sobre `slope_walker`, mecánica del nodo, así que corre sin traducción: se muestra el giro de medir hacia atrás, después el de bajar, y se comparan los dos aterrizajes. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".

## 13. Generalización

La analogía se retira en `symbolic`, como declara `walker_on_ramp`. El disparador es la pendiente fraccionaria pequeña: cuando la rampa sube 2 por cada 7, apoyar el escalón deja de ser útil y conviene calcular. Ahí la rampa se desvanece y queda la recta sobre la grilla; el caminante vuelve como fantasma a demanda hasta `formal`.

Variantes sin ayuda visual, en orden: pendientes negativas; pendientes fraccionarias; pendiente cero y la recta vertical como ausencia; rectas dadas por dos puntos sin dibujo; rectas escritas sin despejar, donde `m` y `b` hay que reconocerlas; comparar dos rectas para decidir si se cruzan.

El nodo está en `abstract` cuando el jugador calcula la pendiente entre dos puntos sin apoyar escalones, dice si dos rectas son paralelas mirando solo sus fichas, y explica por qué la recta vertical no tiene pendiente sin usar la palabra "error".

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `calc1.deriv.rate_as_slope_limit`: el escalón se encoge sobre una curva hasta que su color deja de cambiar; la pendiente pasa de ser de la recta a ser de un punto.
- `geom.line.parallel_same_slope`: dos rectas del plano son paralelas si comparten el color del escalón, y ahí el criterio se usa para construir figuras.
- `prob.stat.regression_line`: entre muchos puntos que no están alineados se busca la rampa que deja el menor sobrante, y `m` mide cuánto acompaña una variable a la otra.
- `trig.fn.tangent_as_slope`: la subida por paso de una rampa queda ligada a su ángulo, y el mismo número se lee como razón de dos lados.

Concepto siguiente: `alg.fn.composition` ([20](20-alg.fn.composition.md)). Frase puente, narrada sobre la rampa con su manivela al costado: "Esta manivela sube al caminante por la rampa. ¿Y si la manivela la mueve otra manivela?". La segunda manivela aparece enganchada a la primera y el nodo 20 empieza ahí.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `slope_same_steepness_any_step` es nativa: la recta con el escalón que el jugador mueve y estira, con el número de la pendiente actualizándose y quedándose quieto; parametrizada por pendiente, arranque y ancho del paso, produce también las dos animaciones de `explain`. `slope_intercept_is_start_height` es nativa: los dos deslizadores mueven la recta y el renglón a la vez, con el punto de arranque marcado sobre el eje. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsa `slope_walker_leaves_trace` (nodo 18) para volver del segmento al rastro completo.

**Calculadora:** en `ready` se habilita `op_slope` ([M](../../M-calculadora/M0-progresion.md)), un ícono de escalón que se apoya sobre dos puntos o sobre una expresión de recta. Es numérica y con caja de arena. No devuelve solo el número: dibuja el escalón que usó, con su `Δy` y su `Δx`, y recién después lo contrae en `m`. Sus alias cubren la pendiente entre dos puntos y la lectura de la forma con ordenada al origen.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel las fichas llevan números y desde el cuarto llevan letras. Los dos primeros niveles se juegan sin leer: el escalón se arrastra y se estira, el color compara sin números, `explain` es entre dos animaciones y los prompts van por voz ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel de fichas y usa los deslizadores solo para verificar lo que ya calculó.
