# 44 — El seno es la altura (`trig.fn.sine_as_height`)

> Locale `es`: "El seno es la altura". Minijuego: [La rueda gigante](../../F-minijuegos/trig.fn.sine_as_height.md).

**Nodo:** `trig.fn.sine_as_height` · **Área:** trig · **Nivel:** 4 · **Primitiva:** `compose` · **Mecánica principal:** `construct` (secundarias `machine_pipe` y `slope_walker`) · **Literacy:** `icons` · **Analogía:** `wheel_rider_height`

## 1. Concepto

El seno es una máquina: entra un ángulo, sale la altura a la que queda el pasajero de una rueda de radio 1. Al terminar, el jugador mete cualquier ángulo, incluso mayor que una vuelta o negativo, obtiene la altura sin dibujar el triángulo, y sabe que si sigue metiendo ángulos el rastro que dejan las alturas es una onda que se repite. Antes tenía un punto con dos coordenadas; ahora tiene una función de una variable.

## 2. Prerequisitos

- `trig.circle.unit_circle_radians` (nodo 43): el círculo de radio 1, el radián, el gesto de bajar la altura desde el extremo del radio y los signos por cuadrante. Se usa entero. `sen` y `cos` ya son nombres de dos coordenadas; acá se vuelven máquinas.
- `alg.fn.function_as_machine` (nodo 17): la máquina con su boca de entrada y su tubería de salida, el invariante de que la misma entrada da siempre la misma salida, y la notación `f(x)`. Se usa el llenado de la tabla de entradas y salidas.

Ninguna arista sigue el orden escolar. La escuela define el seno como un cociente de lados en un triángulo rectángulo y después, en otro capítulo, lo extiende al círculo, con lo que el alumno termina con dos definiciones que no sabe que son la misma. Acá el cociente de lados está en `trig.ratio.similar_shadows`, que no es prerequisito de este nodo: en el círculo unitario el denominador vale 1 y el cociente ya no se ve, queda la altura sola. Los dos caminos se encuentran después, y el juego lo muestra explícitamente en `trig.ratio.similar_shadows`.

## 3. Dificultad cognitiva real

Lo difícil no es calcular. Son cinco capacidades:

1. **Pasar de coordenada a función.** En el nodo 43 la altura era una propiedad de un punto. Acá el ángulo es una entrada y la altura una salida, y el objeto que importa es la relación, no el punto.
2. **Aceptar un dominio que no se termina.** La rueda sigue girando. El ángulo de tres vueltas y media es una entrada válida, y la máquina no se queja.
3. **Ver que la salida está acotada.** El pasajero nunca sube más que el radio. Que la salida viva entre menos uno y uno no es un dato: es la forma de la rueda.
4. **No repartir el seno sobre la suma.** Es `sin_of_sum_distributes`, y viene de tratar a `sen` como un factor y no como una máquina.
5. **Reconocer que el coseno es la misma máquina corrida.** No hay dos ondas: hay una, mirada desde dos puntos de partida.

## 4. Problema intuitivo

Una rueda gigante que gira despacio, con una sola cabina pintada de otro color. Al costado, un poste con marcas. La pregunta, por voz o por gesto: cuando la rueda haya girado un cuarto de vuelta, a qué altura del poste queda esa cabina.

En `intuition` la escena se detiene con la cabina a la altura del eje, subiendo. Tres desenlaces dibujados: la cabina sube parejo, un poco por cada pedacito de giro; sube rápido al principio y frena arriba; sube frenando y después baja de golpe. El jugador elige y después ve. Ninguna es la que casi todos eligen: la cabina sube rápido cuando está a la altura del eje y casi no sube cuando está por llegar arriba.

## 5. Analogía del mundo real

`wheel_rider_height`, la del YAML, con la mecánica `slope_walker` ([G0](../../G-analogias/G0-reglas.md)). Mapa: el pasajero en el borde es el punto del círculo unitario; el ángulo que giró la rueda es la entrada; la altura sobre el eje es el seno; la distancia horizontal al eje es el coseno; que una vuelta entera repita todo es la periodicidad; la altura dibujada a lo largo del giro es la onda.

Es la mejor analogía posible para este nodo porque la altura de una persona en una rueda es una magnitud que se siente en el cuerpo, con signo incluido: por debajo del eje uno está más abajo que el punto de partida, y eso no hay que explicarlo. Variantes por región: rueda de parque, noria de agua, pedal de bicicleta.

Ruptura: `angle_as_a_pure_number`. Nadie dice que una rueda giró quince radianes, y ninguna rueda gira hacia atrás sesenta radianes. Cuando el ángulo deja de ser un giro observable y pasa a ser un número cualquiera, la rueda estorba, y por eso se retira en `formal`.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `construct` es la mecánica principal, con el mismo gesto del nodo 43: bajar la altura desde el extremo del radio. `machine_pipe` aporta la estructura de entrada y salida. `slope_walker` aporta el rastro que deja la altura mientras el giro avanza ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap`, `hold` y `scrub`.

1. La rueda con el pasajero, el eje marcado y el poste de alturas al costado. El pasajero arranca a la derecha, a la altura del eje.
2. El jugador arrastra el pasajero por el borde. La rueda gira, y con un toque sostenido baja la altura hasta la línea del eje: aparecen la barra vertical y el triángulo con el cuadradito del recto.
3. La barra vertical se despega y se apoya sola contra el poste, que la mide. Debajo del eje, la barra se dibuja hacia abajo y el poste la lee con signo.
4. Al costado aparece la máquina: una boca con la ficha del ángulo, una tubería, y por la salida cae la barra de altura. El jugador mete un ángulo con la ficha y la rueda gira sola hasta ahí. Meter dos veces el mismo ángulo devuelve la misma barra, y el juego lo hace notar dejando la primera barra como fantasma.
5. Con la manivela (`scrub`), el jugador avanza el giro despacio mientras el papel del costado se desplaza: la punta de la barra deja un rastro. Media vuelta después el rastro es una loma; una vuelta después, una loma y un pozo.
6. Tocar la máquina la da vuelta y sale el coseno: la misma rueda, la misma construcción, pero lo que se mide es la sombra horizontal sobre el eje. El jugador comprueba que el rastro del coseno es el del seno corrido un cuarto de vuelta apoyando uno sobre otro.

Meter un ángulo mayor que una vuelta no rompe nada: la rueda da la vuelta y sigue. El rastro se superpone exactamente con el anterior, y eso es lo que el nodo `trig.fn.periodic_wraps` va a nombrar.

## 7. Representación visual

Capa `visual`, primitiva `compose` dominante, con `displace` de apoyo heredada del nodo 43.

Lo que se compone es una cadena de dos pasos que el jugador ve entera: el ángulo desplaza el punto sobre el borde, y el punto proyecta su altura sobre el poste. La imagen se dibuja con la rueda a la izquierda y el papel del rastro a la derecha, unidos por una línea horizontal punteada que sale del pasajero y llega al punto que se está dibujando. Esa línea es lo que hace visible que la onda no es un dibujo nuevo: es la misma altura, puesta en otro lado.

Lo que se conserva es el largo del radio, que es lo que acota la onda. Lo que se desplaza es el papel, no la rueda.

Todavía no hay ejes con escala en radianes sobre el papel, ni fórmula, ni amplitud ni fase. El papel es papel.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno con su gesto.

1. **Rueda a círculo con radio.** Al pasar a `visual`, las cabinas y la estructura se desvanecen y quedan el círculo, el radio y el pasajero como punto. El poste se afina hasta ser el eje vertical.
2. **Barra a número con signo.** Al medir la altura contra el poste por tercera vez, la barra se contrae en un número que queda pegado al punto, negativo cuando el pasajero está abajo.
3. **Máquina a `sen θ`.** Cuando el jugador mete un ángulo con la ficha y la salida coincide con la altura que ya había leído a mano, la boca de la máquina se contrae en la etiqueta `sen` y la ficha del ángulo queda a su derecha: `sen θ`. La tubería queda un rato como sombra.
4. **Sombra a `cos θ`.** El mismo gesto sobre la máquina dada vuelta produce `cos θ`, y el par `(cos θ, sen θ)` del nodo 43 vuelve a aparecer sobre el punto, ahora con las dos etiquetas leídas como máquinas.
5. **Rastro a gráfico.** Al completar dos vueltas con la manivela, el papel gana una línea horizontal con las marcas de `π/2`, `π`, `3π/2` y `2π`, y el rastro pasa a ser el gráfico de `sen`. La rueda se queda a la izquierda, atenuada, unida por la línea punteada.

## 9. Notación matemática

Los nombres `sen` y `cos` nacieron en el nodo 43 como etiquetas de dos coordenadas. Acá cambian de categoría, y ese cambio es la aportación del nodo: pasan a escribirse **aplicados a un argumento**, `sen θ`, y a comportarse como `f(x)` del nodo 17.

El problema que lo hace necesario, por la regla de oro de [H](../../H-progresion-abstraccion.md): mientras el ángulo era uno solo y estaba dibujado, alcanzaba con señalar la altura en la figura. Cuando el jugador quiere hablar de la altura para todos los ángulos a la vez, o encadenar la altura con otra cuenta, o dibujar el rastro, necesita un nombre que se pueda aplicar a una entrada que todavía no eligió. Eso es exactamente lo que hizo falta para inventar `f(x)`, y el juego lo dice mostrando la máquina del nodo 17 un instante detrás de la rueda.

La forma escrita depende del `MathLocale` y no del idioma: `sen θ` o `sin θ` según el perfil, sin que el YAML del nodo cambie ([P](../../P-internacionalizacion.md)).

Se agrega una convención de escritura, no un símbolo: `cos x = sen(x + π/2)`, que la cheatsheet guarda como `cs.trig.cos_is_sin_shifted`. Lo que la hace necesaria es haber apoyado un rastro sobre el otro y verlos coincidir.

## 10. Definición formal

Capa `formal`: texto corto con voz y la rueda fantasma al lado. Tres frases, de a una. "Para cualquier número real θ, `sen θ` es la altura del punto al que lleva un giro de θ radianes sobre el círculo de radio 1, y `cos θ` es su distancia horizontal al centro, con signo." "El dominio son todos los reales y la imagen es el intervalo de menos uno a uno." "Sumar `2π` a la entrada no cambia la salida."

Condiciones y casos especiales, verificados sobre el objeto: en una rueda de radio `r` la altura es `r · sen θ`, y por eso el círculo unitario es el que da la función limpia; `sen 0 = 0` y `cos 0 = 1` porque el pasajero arranca a la derecha, a la altura del eje; `sen(−θ) = −sen θ` porque girar al revés espeja la altura, mientras que `cos(−θ) = cos θ` porque la sombra no cambia de lado.

Ya jugado: las tres frases enteras. Nuevo: la palabra dominio y la palabra imagen.

## 11. Propiedades

- **La salida vive entre menos uno y uno.** Ligada a que el pasajero nunca sube más que el radio.
- **La salida se repite cada vuelta.** Ligada al rastro que se superpone exactamente. Se llama periodicidad en `trig.fn.periodic_wraps`.
- **El coseno es el seno corrido un cuarto de vuelta.** Ligada a apoyar un rastro sobre el otro.
- **Los signos siguen al cuadrante.** Ligada a leer la barra hacia arriba o hacia abajo, y se ordena en `trig.ang.quadrant_signs`.
- **La suma de los cuadrados de las dos salidas es 1.** Es Pitágoras sobre el triángulo del radio, ya comprobado con baldosas en el nodo 43, y se vuelve identidad en `trig.id.pythagorean_identity`.
- **La máquina no reparte sobre la suma.** `sen(a + b)` no es `sen a + sen b`. Se comprueba con un contraejemplo y se resuelve de verdad en `trig.id.angle_sum`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: mientras la rueda gira, tocar el instante en que el pasajero está a la altura del centro. Hay dos por vuelta, y las dos valen.
- `explain`: arrastrar el radio y elegir, entre tres animaciones, la que muestra por qué la altura del extremo es el seno y la sombra sobre el eje horizontal es el coseno. Los distractores intercambian las dos, o miden la altura desde el piso de la rueda y no desde el eje.
- `manipulate`: meter un ángulo en la máquina de la rueda, bajar la altura desde el extremo del radio y leer la salida. Se repite con varios ángulos hasta llenar la tabla.
- `apply`: con la rueda a la vista, armar con fichas el seno y el coseno de `π/3` y de `5π/6` a partir del triángulo que forma el radio, contra el tiempo objetivo del nodo.
- `generalize`: una rueda de radio 4, y predecir con la máquina la altura del pasajero para un ángulo dado, sin dibujar.
- `transfer`: en `calc2.parpol.parametric_speed`, alimentar la misma máquina con el tiempo como entrada y trazar el recorrido del punto en la grilla.

El nodo declara la lista de misconceptions vacía en el grafo, pero `misconceptions.yaml` lo alcanza por el vecindario de `trig.id.angle_sum`, y la única que aparece de verdad jugando es esta:

- **`sin_of_sum_distributes`** (`counterexample_slider` sobre `machine_pipe`). El jugador escribe `sen(a + b) = sen a + sen b`, casi siempre al encadenar dos giros. La mecánica del patrón está entre las del nodo, así que corre ahí sin adaptación, por la regla 1 de [L0](../../L-modelo-errores/L0-taxonomia.md). El juego escribe la regla del jugador en la tubería, engancha un deslizador al segundo ángulo y lo barre desde cero: al principio las dos salidas coinciden casi, y en `a = b = π/2` la suma da 2 mientras la rueda deja al pasajero en 0. Congela ahí, con las dos barras al lado. Voz: "Dos cuartos de vuelta dejan al pasajero abajo del todo. ¿Cuánto suma tu regla?". El patrón no reabre la interacción: el ítem se reinicia, y la regla verdadera llega en `trig.id.angle_sum`.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de esta y de las de los prerequisitos directos.

## 13. Generalización

La rueda se retira en `formal`, cuando aparecen ángulos que ninguna rueda gira. Queda a demanda tocando la etiqueta `sen`, y el gráfico se queda solo.

Variantes sin ayuda visual, en orden: ángulos de la primera vuelta que no son notables; ángulos negativos; ángulos de varias vueltas; radio distinto de 1, donde la altura es `r · sen θ`; la altura dada y el ángulo pedido, que es la puerta de `trig.inv.arcsin_two_branches` y donde el jugador descubre solo que hay dos respuestas por vuelta.

El nodo está en `abstract` cuando el jugador da el signo y el valor aproximado de `sen θ` para cualquier ángulo sin dibujar la rueda, explica por qué la salida no puede pasarse de uno, y reconoce el gráfico del coseno como el del seno corrido.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`:

- `precalc.param.time_as_hidden_input` (`machine_pipe`): la misma máquina alimentada con el tiempo, que es una entrada que nadie ve en el dibujo del recorrido.
- `calc2.parpol.parametric_speed` (`slope_walker`): el punto que recorre el círculo con el tiempo, y la rapidez leída del rastro.
- `adv.four.transform_as_machine`: una señal cualquiera descompuesta en ondas como esta, donde el seno deja de ser una altura y pasa a ser una pieza de construcción.

Concepto siguiente: `trig.fn.wave_unrolls_circle`. Frase puente, narrada con la rueda a la izquierda y el papel a la derecha: "Ya sabés que la altura te la da el giro. Ahora dejá que el papel corra solo y mirá el dibujo que queda". El papel se ensancha, la rueda se hace chica en un costado y el nodo siguiente empieza ahí.

Con este nodo termina la espina de 44 conceptos. Lo que sigue no es otro nodo de la espina sino la rama de trigonometría del grafo, que se abre en abanico desde acá: la onda y su periodicidad (`trig.fn.wave_unrolls_circle`, `trig.fn.periodic_wraps`), la tangente como pendiente (`trig.fn.tangent_as_slope`), los signos por cuadrante (`trig.ang.quadrant_signs`), las identidades (`trig.id.pythagorean_identity`, `trig.id.angle_sum`), las leyes de senos y cosenos, las coordenadas polares y, al final, la fórmula de Euler. El resto del grafo (cálculo en varias variables, álgebra lineal avanzada, teoría de números, análisis) cuelga de los nodos de la espina que ya están, y ninguno de ellos necesita un archivo de D1: la espina es el camino mínimo, no el catálogo ([C0](../../C-knowledge-graph/C0-esquema.md)).

---

**Visualización:** tres escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `construction_scene_height_from_radius_tip` es nativa: el círculo, el radio que gira, la altura que baja desde su extremo y el número que la mide con signo; gramática `compose`, parametrizada por ángulo y radio, produce también los distractores de `explain`. `slope_scene_wheel_rider_trace` tiene doble ruta: la rueda a la izquierda, el papel corriendo a la derecha y la línea punteada que une al pasajero con la punta del rastro, con dos vueltas de duración. `pipe_scene_angle_to_height` es nativa: la ficha del ángulo entra por la boca, recorre la tubería y sale como barra de altura, con la rueda al costado girando en sincronía. Ninguna lleva texto rasterizado: los números, las marcas de `π` y el nombre de la función los dibuja el runtime según el locale y el `MathLocale` ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_trig` ([M](../../M-calculadora/M0-progresion.md)): seno, coseno y tangente de un ángulo. Se presenta como la máquina del minijuego, no como tres teclas: se elige la máquina, se mete el ángulo con fichas y sale el número, con la rueda pequeña dibujada al lado mostrando dónde quedó el punto. Acepta radianes desde el principio y grados como conversión explícita. Es dependiente del locale, porque escribe `sen` o `sin` según el `MathLocale`.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel el poste muestra números con signo y la máquina lleva una ficha de ángulo ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: girar es arrastrar, medir es apoyar la barra contra el poste, la máquina se opera metiendo fichas, y los prompts son voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa `visual` con el círculo y el papel ya dibujados, y usa el gráfico desde el primer nivel simbólico.
