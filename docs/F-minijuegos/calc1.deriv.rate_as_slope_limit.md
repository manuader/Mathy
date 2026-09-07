# La lupa y la colina (`calc1.deriv.rate_as_slope_limit`)

Minijuego del nodo 26 de la espina, "Derivada: pendiente exacta". Mecánica principal `slope_walker`, secundarias `grid_stretch` y `construct`; analogía `walker_zoom_on_hill`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/26-calc1.deriv.rate_as_slope_limit.md): un concepto, cuatro dificultades reales (la pendiente en un punto solo, el valor al que se acerca frente al valor en cero, la respuesta que depende del lugar, la linealidad local), una analogía que reúne la rampa del nodo 19 con la pared del nodo 25 sobre el mismo muñeco, un gesto (achicar el paso hasta que el tramo se pega al suelo), cinco morphs hasta `f'(x)` y `dy/dx`, los triángulos que se encogen como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Una colina que sube y baja con curvas, el caminante parado en un lugar marcado con una bandera, carteles clavados en la ladera y una manivela abajo que fija el tamaño del paso. En la mano del jugador, una lupa.

Mapa objeto → concepto: colina curva → función; acercar la lupa → intervalo que se achica; el suelo se ve recto → linealidad local; pendiente de ese tramo → derivada; tramo prolongado → recta tangente; pico afilado que nunca se endereza → punto no derivable; la pendiente de cada lugar como camino nuevo → función derivada. A eso se suman las piezas heredadas: triángulo de subida y avance → `Δy` sobre `Δx`; poste con su lectura → el valor en un punto.

Invariante: al achicar el paso, la pendiente del tramo se estabiliza en un valor que no depende de cuánto se achicó. Punto de ruptura: `input_that_is_not_a_place`. La colina sirve mientras `x` sea un lugar; cuando es tiempo o precio, el caminante no pisa nada y la derivada hay que transferirla como tasa. Se retira en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la colina ocupa la pantalla sobre ejes tenues, el caminante en su bandera, la manivela abajo al centro, una barrita de inclinación a la derecha y, desde `symbolic`, el teclado de fichas al pie. Gestos: `drag`, `scrub` y `pinch`, con una manija alternativa para el zoom en pantallas donde el pellizco no llega ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela.** Con cada vuelta el paso se achica, el tramo entre los dos puntos se acorta y su inclinación cambia cada vez menos. La barrita de la derecha se va quedando quieta. Girando al revés el paso crece y el tramo se despega del suelo.
- **Llevar la manivela al tope.** Se traba en el último diente y el tramo no desaparece: siempre queda un paso. No hay tramo entre un punto y él mismo, y la manivela lo impide con un tope físico en vez de un mensaje.
- **Pellizcar sobre el caminante.** La sábana de la grilla se estira alrededor del punto y la colina se endereza. En un pico afilado no se endereza por más que se estire.
- **Arrastrar al caminante.** La manivela conserva el paso y la barrita cambia de valor. Con varios lugares visitados, las barritas quedan como postes de distinta altura sobre la colina.
- **Trazar la secante a mano.** Con `construct`: tocar dos puntos de la curva dibuja el tramo entre ellos y su lectura. Es la herramienta de los niveles donde ya no hay caminante.
- **Tocar un poste iluminado.** Despliega de dónde salió el número: el triángulo con sus dos catetos y la razón entre ellos.
- **Armar la razón con fichas.** Desde `symbolic`: el teclado ofrece `Δx`, `Δy`, valores numéricos y la flecha; el jugador arma el cociente, lo evalúa con tres pasos decrecientes y coloca la ficha del valor límite.

Errores con consecuencia física, nunca con la palabra "incorrecto": tomar la pendiente con un paso grande deja el poste puesto pero se ve el aire entre el tramo y el suelo; evaluar la razón con `Δx = 0` deja la ficha del resultado vacía, sin llenarse.

## Invariante matemático

Tres invariantes, uno por mecánica.

`steepness_independent_of_step_size` (`slope_walker`): en una recta la pendiente no depende del tamaño del paso, y en una curva deja de depender cuando el paso se achica lo suficiente. Se ve confirmarse en la barrita que se queda quieta; se ve romperse cuando el paso es grande y cada vuelta de manivela cambia la lectura.

`lines_stay_lines_origin_fixed` (`grid_stretch`): la lupa estira la sábana alrededor del punto sin torcer lo que ya era recto. Es lo que hace que el zoom sea una prueba y no un dibujo: si al estirar la curva se endereza, era localmente recta; si la esquina sigue siendo esquina, no lo era.

`construction_reveals_not_changes` (`construct`): trazar la secante no modifica la curva, la muestra. Se ve cuando el jugador borra el trazo y la colina queda idéntica.

Un movimiento válido pero inútil (girar la manivela de más cuando la lectura ya se estabilizó, hacer zoom en un tramo recto) no rompe nada: el juego lo ejecuta y, si se repite, la bandera del siguiente lugar late como empujón suave.

## Representación visual

Primitiva dominante `rate`, de apoyo `displace` y `scale` ([H](../H-progresion-abstraccion.md)).

- `real`: la colina, los carteles, el caminante que sube tramos de distinta inclinación. Solo se mira.
- `intuition`: la lupa acercándose a un punto y la escena detenida; tres desenlaces dibujados (adentro se ve recto, adentro se ve igual de curvo, adentro se ve un pico) y después el real.
- `concrete`: la manivela, el tramo entre los dos puntos, la barrita de inclinación, la lupa, los postes.
- `visual`: la colina se estiliza en una curva sobre ejes y el caminante en un punto; cada paso es un escalón dibujado como triángulo. El segundo punto resbala hacia el primero al girar la manivela y el triángulo se encoge sin cambiar de forma; los triángulos sucesivos se muestran superpuestos con la inclinación de la hipotenusa iluminada en todos. La lectura del poste se dibuja además sobre una recta aparte, donde cada vuelta es un paso hacia un valor marcado y nunca alcanzado. La lupa es la sábana estirada alrededor del punto.
- `symbolic`: `Δx` y `Δy` sobre los catetos, la razón bajo el poste, la flecha `Δx → 0`, `lim`, y al final `f'(x₀)` y `dy/dx`.
- `formal`: la definición corta con voz y el triángulo fantasma al lado.

En `visual` todavía no hay letras: el poste muestra un número, el triángulo no tiene etiquetas y la curva no se llama `f`.

## Transición simbólica

Cinco pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Escalón → triángulo con `Δx` y `Δy`: al quedar el tramo pegado por primera vez en `visual`, los dos catetos ganan las etiquetas del nodo 19. El escalón no se reemplaza.
2. Poste → `Δy / Δx`: en el siguiente lugar, el número del poste se desdobla y muestra la razón entre los catetos con los valores actuales. Girar la manivela cambia los dos números y la razón a la vista.
3. Manivela → `Δx → 0`: al llegar al último diente aparece bajo la razón la flecha del nodo 25, y la lectura se estabiliza.
4. Razón con flecha → `lim`: al tocar el poste iluminado, la flecha y la razón se contraen en `lim` con `Δx → 0` debajo y `Δy / Δx` a la derecha.
5. `lim` → `f'(x₀)` y `dy/dx`: al arrastrar el caminante a un tercer lugar con la expresión completa en pantalla, el triángulo se contrae en un punto y la expresión se pliega en dos etiquetas, la corta sobre el poste y la que conserva la forma de la razón al lado. Tocar `dy/dx` despliega el triángulo como fantasma.

## Concepto formal

Lo que queda al final, como texto corto con voz y el triángulo fantasma al lado: la derivada de `f` en `a` es el valor al que se acerca la pendiente de la secante cuando el segundo punto se acerca a `a`; existe cuando ese valor es el mismo viniendo por los dos lados; la función derivada asigna a cada lugar su pendiente exacta. Casos verificados sobre el objeto: en el pico afilado los dos lados dan valores distintos y la derivada no existe; en una recta la derivada es su pendiente en todos los lugares; en un tramo plano vale cero; donde el suelo es vertical el triángulo pierde el avance y la razón no existe.

Los símbolos nuevos son `f'(x)` y `dy/dx`. `Δ` y `m` llegaron en el nodo 19, `lim` en el 25; lo que hace falta acá son dos nombres cortos, porque escribir el límite entero en cada poste es insoportable. `f'(x)` nombra además la función nueva; `dy/dx` muestra su origen y se lee como una sola cosa. Las tres entradas de cheatsheet del nodo, `cs.calc1.derivative_definition_limit`, `cs.calc1.derivative_notations` y `cs.calc1.derivative_as_rate_units`, quedan disponibles a un toque desde el panel lateral.

## Generalización

La colina se retira en `formal`. Antes, en `symbolic`, ya perdió al caminante: queda una curva sobre ejes y la secante se traza con `construct`. El caminante vuelve como fantasma al tocar `dy/dx`.

Variantes sin ayuda visual: pendiente en un punto de una curva dada como máquina, sin gráfica, evaluando el cociente con pasos decrecientes; pendiente donde la curva baja, con signo; curva con un pico, donde hay que declarar que la derivada no existe y mostrar los dos valores laterales; y la función derivada como objeto, dibujando con postes la curva de las pendientes y reconociéndola entre tres candidatas. Después, colinas que no son colinas: la temperatura de una taza contra el tiempo, el precio de un boleto contra la distancia, donde el jugador arma la razón con las unidades correctas. Cuando produce la derivada sin gráfica, ordena pendientes sin postes, señala el punto sin derivada y lee `f'` como función nueva, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): el ejemplo de cofres llega acá en su forma tardía, cuando la cerradura es una operación que no se puede deshacer contando; este nodo no lo usa, pero `calc1.ftc.integral_undoes_derivative` lo retoma con la misma llave.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **El tramo se acorta.** `concrete`, `manipulate`. Una colina suave, un lugar marcado, la manivela. Ver la barrita quedarse quieta.
2. **La lupa.** `concrete`, `explain`. Mismos parámetros; el zoom con dos dedos y la elección entre animaciones de por qué el suelo se ve recto.
3. **Muchos lugares.** `concrete`, `recognize`. Varios lugares marcados; tocar el más empinado, con un distractor en bajada de la misma magnitud.
4. **Triángulos que se apilan.** `visual`, `manipulate`. La colina se vuelve curva sobre ejes; los triángulos sucesivos superpuestos y la recta aparte con la lectura que se acerca.
5. **Delta y razón.** `symbolic` primera mitad, `manipulate` y `apply`. Aparecen `Δx`, `Δy`, la razón y la flecha; el teclado de fichas.
6. **El límite escrito.** `symbolic` segunda mitad, `apply`. Aparecen `lim`, `f'(x₀)` y `dy/dx`; la colina se pide con un toque. Aparece `limit_as_reaching`.
7. **Signo, pico y sin gráfica.** Parámetros: curvas en bajada, un pico por instancia, y funciones dadas como máquina sin gráfica.
8. **La derivada como camino.** `formal` y `abstract`, `generalize`. La definición corta con voz; dibujar con postes la curva de las pendientes; entradas que no son lugares, con unidades.

Qué endurece cada parámetro: la curvatura obliga a girar más la manivela antes de que la lectura se estabilice; el signo rompe la lectura "más empinado es más grande"; el pico rompe "todo punto tiene pendiente"; la ausencia de gráfica separa la razón del dibujo; las unidades separan la tasa del terreno.

Desafíos de olimpíada: el nodo participa en los desafíos de cálculo de [S](../S-desafios/S0-desafios.md), donde la pendiente exacta aparece como paso intermedio de un problema de optimización con datos ocultos. La cheatsheet está abierta de entrada en esos desafíos.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: una colina curva con cinco lugares marcados; tocar el punto donde el caminante sube más empinado. Distractores: pendientes parecidas y uno en bajada con la misma magnitud.
- `explain`: hacer zoom sobre un lugar y elegir, entre tres animaciones, la que muestra por qué al acercarse tanto la colina se ve recta. Una muestra los triángulos que se encogen y la inclinación que se estabiliza; otra, el triángulo que desaparece y la lectura vacía; otra, un tramo grande tomado como si fuera la pendiente. El distractor elegido clasifica.
- `manipulate`: arrastrar el segundo punto de la secante hacia el primero con la manivela y observar a qué valor se acerca la pendiente. El poste se ilumina cuando la lectura se estabiliza.
- `apply`: la curva `x²`; armar con fichas la pendiente exacta en `x = 3` con el cociente de diferencias, evaluarlo con tres pasos decrecientes y colocar la ficha del valor límite. Contra el tiempo objetivo del nodo.
- `generalize`: una curva desconocida sobre ejes, sin colina; trazar con la herramienta de secantes la pendiente en tres puntos y ordenarlos del más empinado al menos.
- `transfer`: en la gráfica de posición de un auto contra el tiempo, leer la velocidad en un instante como pendiente exacta y armarla con fichas con sus unidades. También en `mvcalc.part.slice_of_surface`, `calc2.parpol.parametric_speed` y `adv.ode.slope_field`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `limit_as_reaching`, patrón `counterexample_slider` sobre el caminante. El jugador gira la manivela hasta el tope, ve el triángulo mínimo y coloca "no existe" o "cero" como pendiente; o en fichas evalúa la razón con `Δx = 0`. El juego enuncia su regla como dos lecturas en paralelo: la del poste, que se estabiliza, y la del cociente en cero, que queda vacía. Un deslizador controla `Δx` y el juego lo barre desde un paso grande hasta casi cero, congelando donde la lectura ya no se mueve y el triángulo todavía existe. Voz: "El punto está vacío pero el caminante se acerca. ¿A qué valor?". El ítem se reinicia con el deslizador en manos del jugador. Es la única catalogada del nodo, y su entrada en el catálogo declara solo `precalc.lim.approach` entre sus nodos, así que acá clasifica como reaparición del prerequisito.

Los distractores de `explain` y de `apply` se generan desde la regla `detect` de esta misconception y desde las de los prerequisitos directos; los que faltan se completan con perturbaciones numéricas sin misconception.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `slope_scene_secants_collapse_to_tangent`, ruta mixta: nativa para dibujarse sobre el estado del jugador y pre-renderizada para la apertura. La secante se traza entre dos puntos, el segundo resbala hacia el primero por una sucesión de pasos y la lectura se estabiliza; gramática `rate`, con los triángulos superpuestos y la inclinación iluminada. Parametrizada por la función, el punto y la sucesión de pasos, produce la mecánica de `manipulate` y las animaciones de `explain`.
- `grid_scene_zoom_curve_looks_straight`, ruta mixta. La grilla se estira alrededor del punto por niveles de zoom y la curva se endereza; gramática `scale` sobre `deform`. Parametrizada por la función, el punto y los niveles de zoom, produce el nivel 2 y el caso del pico.
- Reusada: `slope_scene_hill_intro`, pre-renderizada, como apertura compartida con el nodo 19.
- Ninguna lleva texto rasterizado: `Δx`, `Δy`, `lim`, `f'` y los valores los dibuja el runtime según el locale; el caminante, el terreno, la lupa y la varilla son assets propios ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_hill_profile`: `family` en {polynomial, trig, piecewise} (`polynomial` hasta el nivel 4); `curvature` (suave en los niveles 1 a 3, fuerte desde el 5); `marked_places` (1 en los niveles 1 y 2, de 3 a 5 desde el 3); `has_kink` (falso hasta el nivel 6); `has_flat` (verdadero desde el nivel 4); `seed`.
- `gen_step_sequence`: `dx_start`; `dx_ratio` (cuánto se achica por vuelta); `steps` (cantidad de dientes de la manivela); `stop_before_zero` (verdadero siempre: el tope físico).
- `gen_rate_context`: `input_kind` en {place, time, price} (`place` hasta el nivel 7); `units` (par de unidades para la lectura); solo en el nivel 8 y en `transfer`.
- `gen_tile_keyboard`: `symbols` (subconjunto de `Δx`, `Δy`, flecha, `lim`, numerales); `distractors` desde `detect` de `limit_as_reaching`.

**Literacy soportada:** de `short_text` a `full_text`. Las capas `real`, `intuition` y `concrete` se juegan sin leer (manivela, lupa, caminante, mano fantasma, `explain` entre animaciones), pero el mínimo es `short_text` porque desde `visual` las etiquetas `Δx`, `Δy` y `lim` se leen, y la definición corta se muestra escrita además de narrada. En `full_text` se agregan los enunciados de los casos especiales.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra al caminante un paso hacia adelante; aparece el tramo recto con su inclinación. La mano gira la manivela y el paso se acorta hasta que el tramo se acerca al suelo. La escena vuelve al inicio y la manivela late. Se repite solo si el jugador se queda quieto. La demostración del zoom (nivel 2) es nueva y se muestra una vez, con la manija alternativa señalada para pantallas sin pellizco. La del triángulo de subida y avance no se repite: es la del nodo 19 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions, cantidad de pasos decrecientes exigidos y espera de la demostración viven en [K](../K-evaluacion.md).
