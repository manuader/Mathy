# 26 — Derivada: pendiente exacta (`calc1.deriv.rate_as_slope_limit`)

> Locale `es`: "Derivada: pendiente exacta". Minijuego: [La lupa y la colina](../../F-minijuegos/calc1.deriv.rate_as_slope_limit.md).

**Nodo:** `calc1.deriv.rate_as_slope_limit` · **Área:** calc1 · **Nivel:** 5 · **Primitiva:** `rate` · **Mecánica principal:** `slope_walker` (secundarias `grid_stretch` y `construct`) · **Literacy:** `short_text` · **Analogía:** `walker_zoom_on_hill`

## 1. Concepto

La pendiente de una curva en un punto es el valor al que se acerca la pendiente de la secante cuando el segundo punto se aproxima al primero. Al terminar, el jugador lee la pendiente exacta en un lugar de una colina curva, sabe que ese número es un límite de pendientes de tramos cada vez más cortos, y reconoce que la pendiente en cada lugar forma una función nueva. Antes sabía medir la pendiente de una rampa recta y acercarse a una pared sin tocarla; no sabía juntar las dos cosas sobre una curva.

## 2. Prerequisitos

- `precalc.lim.approach` (nodo 25): acercarse sin llegar. Se usa el caminante que se aproxima a la pared, la lectura que se estabiliza aunque el punto de llegada esté vacío, el símbolo `lim` que nació allí y la misconception `limit_as_reaching`, que acá vuelve con otra cara: el cociente en `Δx = 0` es `0/0`, y el jugador que quiere "llegar" no encuentra nada.
- `alg.fn.linear_slope` (nodo 19): la pendiente es lo empinado. Se usan el triángulo de subida y avance, la razón `Δy / Δx`, los símbolos `m` y `Δ`, y el invariante de la mecánica: en una recta, la pendiente no depende del tamaño del paso.

La arista que no sigue el orden escolar es la que falta: el nodo no depende de la continuidad ni de la recta tangente. La tangente es el nodo siguiente y se construye con lo que sale de acá. Tampoco depende de la velocidad: [G0](../../G-analogias/G0-reglas.md) rechaza "la derivada es la velocidad" porque la velocidad es un caso, no la estructura. La estructura es la pendiente que se vuelve exacta, y la velocidad llega como transferencia.

## 3. Dificultad cognitiva real

Lo difícil no es calcular un cociente. Son cuatro capacidades que "derivar" mezcla:

1. **Aceptar que la pendiente en un solo punto tiene sentido.** Con un punto no hay triángulo. El jugador tiene que ver que la pendiente en el lugar no se mide con un triángulo sino con una sucesión de triángulos que se encogen, y que la sucesión tiene un valor al que se acerca.
2. **Separar "el valor al que se acerca" de "el valor en cero".** Cuando `Δx` es cero el cociente no existe. Es `limit_as_reaching` en su forma más peligrosa: el jugador que pone `Δx = 0` obtiene `0/0` y concluye que la pendiente no existe, o que vale cero.
3. **Ver que la respuesta depende del lugar.** En una rampa la pendiente era un número. En una colina hay un número por cada punto, y esos números son una función nueva, `f'`. Confundir el número en un punto con la función es lo que después impide leer `f'(x)` como curva.
4. **Distinguir la linealidad local de la curva entera.** De cerca la colina se ve recta; de lejos no. El pico afilado nunca se endereza, por más zoom que se haga. El jugador tiene que saber cuándo la lupa alcanza y cuándo no.

Las cuatro son independientes y la mecánica las separa: la primera y la segunda viven en la manivela del paso, la tercera en el arrastre del caminante, la cuarta en el zoom.

## 4. Problema intuitivo

Un caminante en una colina que sube y baja con curvas. En la ladera hay carteles clavados en lugares exactos, y cada cartel tendría que decir cuán empinado es el suelo justo ahí, no en promedio entre dos carteles. La pregunta, por voz o por gesto: ¿en cuál de estos lugares el caminante sube más empinado?

En `intuition` el juego acerca una lupa a un punto de la colina y se detiene antes de mostrar qué se ve adentro. Tres desenlaces dibujados: adentro de la lupa el suelo se ve recto; adentro se ve igual de curvo que afuera; adentro se ve un pico afilado. El jugador elige y después ve. La misma lupa sobre un pico de verdad prepara el punto donde la colina no tiene pendiente.

## 5. Analogía del mundo real

`walker_zoom_on_hill` (mecánica `slope_walker`), la del YAML. Mapa: colina curva → función; acercar la lupa → intervalo que se achica; el suelo se ve recto → linealidad local; pendiente de ese tramo → derivada; tramo prolongado → recta tangente; pico afilado que nunca se endereza → punto no derivable; pendiente en cada lugar como nuevo camino → función derivada. Invariante: al achicar el paso, la pendiente del tramo se estabiliza en un valor que no depende de cuánto se achicó. Ruptura: `input_that_is_not_a_place`. La colina sirve mientras `x` sea un lugar. Cuando `x` es tiempo o precio, el caminante ya no pisa nada, y la derivada hay que transferirla como tasa. Se retira en `formal` ([G0](../../G-analogias/G0-reglas.md)).

Por qué esta y no otra: el caminante es la piel más reutilizada del catálogo. Quien llega acá ya lo movió sobre piedras, sobre una rampa, sobre el perfil de una gráfica y hacia la pared de Zenón. La colina con lupa no le pide aprender un objeto nuevo: le pide juntar la rampa del nodo 19 con la pared del nodo 25 sobre el mismo muñeco. La lupa aporta lo único nuevo, y es un gesto que ya conoce de `grid_stretch`.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `slope_walker` es la mecánica principal y provee la herramienta: el caminante y el tamaño del paso. `grid_stretch` provee el zoom: la lupa es la sábana estirada alrededor del caminante. `construct` provee la secante: el trazo entre dos puntos de la colina. Las tres se encuentran en un gesto: achicar el paso hasta que el tramo se pega al suelo ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `scrub` y `pinch` con manija alternativa.

1. Una colina curva, el caminante en un lugar marcado con una bandera, una manivela abajo que fija el tamaño del paso.
2. Demostración: una mano fantasma arrastra el caminante un paso hacia adelante. Aparece un tramo recto desde donde estaba hasta donde llegó, y el tramo lleva una inclinación visible. La mano gira la manivela; el paso se acorta y el tramo se acerca al suelo. La escena vuelve al inicio.
3. El jugador gira la manivela. Con cada vuelta el paso se achica, el tramo se acorta y su inclinación cambia cada vez menos. Al costado, una barrita de inclinación se va quedando quieta. Si gira al revés, el paso crece y el tramo se despega del suelo.
4. El jugador hace zoom con dos dedos sobre el caminante. La sábana se estira alrededor del punto y la colina se endereza. Si el punto es un pico afilado, no se endereza por más que estire.
5. El jugador arrastra el caminante a otro lugar. La manivela conserva el paso; la barrita cambia de valor. Con varios lugares, las barritas quedan como postes de distinta altura sobre la colina.
6. Éxito: cuando el tramo queda pegado al suelo, se ilumina y su inclinación queda escrita en el poste. Sin cartel.

Errores con consecuencia física: si el jugador intenta poner el paso en cero, la manivela se traba en el último diente y el tramo desaparece: no hay tramo entre un punto y él mismo. Si toma la pendiente con un paso grande, el poste queda pero se ve el aire entre el tramo y el suelo. Nada se llama "incorrecto".

## 7. Representación visual

Capa `visual`, con la primitiva dominante `rate` y dos de apoyo de [H](../../H-progresion-abstraccion.md).

`rate` (dominante). La colina se estiliza en una curva sobre ejes; el caminante, en un punto. Cada paso es un escalón con subida y avance, y el escalón se dibuja como triángulo. Lo que se desplaza es el segundo punto, que resbala hacia el primero cuando gira la manivela. Lo que se escala es el triángulo, que se encoge sin cambiar de forma cuando el tramo ya está pegado. Lo que se conserva es la inclinación de la hipotenusa: el valor del poste deja de moverse. El juego muestra los triángulos sucesivos uno encima de otro, cada vez más chicos, con la inclinación iluminada en todos.

`displace` (apoyo). La lectura del poste se dibuja sobre una recta aparte, como el caminante que se acercaba a la pared en el nodo 25: cada vuelta de la manivela es un paso hacia un valor marcado y nunca alcanzado.

`scale` (apoyo). La lupa es la sábana de `grid_stretch` estirada alrededor del punto: las líneas de la grilla se separan y la curva se endereza. En el pico afilado la sábana se estira y la esquina sigue siendo esquina.

Todavía no hay letras: el poste muestra un número, el triángulo no tiene etiquetas y la curva no se llama `f`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Escalón → triángulo con `Δx` y `Δy`.** La primera vez que el tramo queda pegado en `visual`, el triángulo gana sus dos etiquetas, las mismas del nodo 19. El escalón no se reemplaza: sus dos catetos se etiquetan.
2. **Poste → `Δy / Δx`.** Al siguiente lugar, el número del poste se desdobla y muestra de dónde salió: la razón entre los catetos, con los valores del triángulo actual. Girar la manivela cambia los dos números y la razón a la vista.
3. **Manivela → `Δx → 0`.** Cuando el jugador gira la manivela hasta el último diente, aparece bajo la razón la flecha que ya conoce del nodo 25: `Δx → 0`. La lectura de la razón se estabiliza y la flecha dice hacia dónde.
4. **Razón con flecha → `lim`.** Al tocar el poste iluminado, la flecha y la razón se contraen en `lim` con `Δx → 0` debajo y `Δy / Δx` a la derecha. Es el símbolo del nodo 25 escrito frente a una razón, no frente a un caminante.
5. **`lim` → `f'(x₀)` y `dy/dx`.** Al arrastrar el caminante a un tercer lugar con la expresión completa en pantalla, el triángulo se contrae en un punto y la expresión entera se pliega en dos etiquetas: `f'(x₀)` sobre el poste, corta, y `dy/dx` al lado, que conserva la forma de la razón. Tocar `dy/dx` vuelve a desplegar el triángulo como fantasma.

## 9. Notación matemática

Quedan `f'(x)` y `dy/dx`, dos notaciones para el mismo objeto, y la expresión de donde salieron: `lim` con `Δx → 0` de `Δy / Δx`.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), cada símbolo llega con su problema. `Δ` y `m` llegaron en el nodo 19; `lim`, en el 25. Lo nuevo es la pendiente exacta en un punto, y el problema que la hace necesaria es de longitud: escribir "el límite cuando `Δx` tiende a cero de `Δy` sobre `Δx`" en cada poste de la colina es insoportable. Hacen falta dos nombres cortos. `f'(x)` es el corto de verdad, y además nombra la función nueva: la colina tiene un `f'` por cada lugar. `dy/dx` es el que muestra su origen: es la razón con los triángulos ya encogidos, y por eso se lee como una sola cosa y no como una división. El nodo presenta las dos como pliegues de la misma expresión, no como notaciones de autores distintos.

## 10. Definición formal

Capa `formal`: texto corto con voz y el triángulo fantasma al lado. Tres frases, de a una: "La derivada de `f` en `a` es el valor al que se acerca la pendiente de la secante cuando el segundo punto se acerca a `a`." "Existe cuando ese valor es el mismo viniendo por los dos lados." "La función derivada asigna a cada lugar su pendiente exacta."

Condiciones y casos especiales, verificados sobre el objeto: acercarse por la izquierda y por la derecha da el mismo valor en toda la colina, salvo en el pico afilado, donde da dos y la derivada no existe. En una recta la derivada es su pendiente en todos los lugares. En un tramo plano vale cero. Donde el suelo es vertical el triángulo pierde el avance y la razón no existe.

Ya jugado: la primera frase entera, en la manivela; la tercera, en los postes. Nuevo: la segunda frase, los dos lados como condición, y el nombre "derivada".

## 11. Propiedades

- **La pendiente exacta no depende de por qué lado se llega.** Viniendo con el segundo punto desde la derecha o desde la izquierda, la lectura se estabiliza en el mismo valor. Ligada a girar la manivela en los dos sentidos alrededor del último diente.
- **La derivada de una recta es su pendiente, en todos los lugares.** Ligada a la rampa del nodo 19: cuando la colina es una rampa, la manivela no cambia nada y el poste vale lo mismo en todos lados.
- **La derivada de un tramo plano es cero.** Ligada al poste que marca cero cuando el caminante está en la cima o en el valle, antes de que exista el nodo de máximos.
- **El signo dice si se sube o se baja.** Ligada a la barrita de inclinación que se da vuelta cuando el caminante pasa la cima.
- **Derivable implica que de cerca se ve recto.** Ligada a la lupa: todo lugar con derivada se endereza; el pico no.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: una colina curva con varios lugares marcados; tocar el punto donde el caminante sube más empinado. Los distractores son lugares con pendiente parecida, uno de ellos en bajada con la misma magnitud.
- `explain`: hacer zoom con dos dedos sobre un lugar de la curva y elegir, entre tres animaciones, la que muestra por qué al acercarse tanto la colina se ve recta. Una animación muestra los triángulos que se encogen y una inclinación que se estabiliza; otra, un triángulo que desaparece y una lectura vacía; otra, un tramo grande que se toma como si fuera la pendiente. Tocar la correcta.
- `manipulate`: arrastrar el segundo punto de la secante hacia el primero con la manivela y observar a qué valor se acerca la pendiente del triángulo. El poste se ilumina cuando la lectura se estabiliza.
- `apply`: recibir la curva `x²` y armar con fichas la pendiente exacta en `x = 3` usando el cociente de diferencias con paso cada vez más chico. El teclado de fichas ofrece `Δx`, `Δy`, valores numéricos y la flecha; el jugador arma la razón, la evalúa con tres pasos decrecientes y coloca la ficha del valor límite.
- `generalize`: una curva desconocida; trazar con la herramienta de secantes la pendiente en tres puntos y ordenarlos del más empinado al menos. No hay colina: hay curva sobre ejes.
- `transfer`: en la gráfica de posición de un auto contra el tiempo, leer la velocidad en un instante como la pendiente exacta y armarla con fichas con sus unidades. La colina no sirve: `x` es tiempo.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`limit_as_reaching`** (`counterexample_slider` sobre el caminante). El jugador gira la manivela hasta el tope, ve que el triángulo desapareció y coloca "no existe" o "cero" como pendiente; o en fichas evalúa la razón con `Δx = 0`. El juego enuncia su regla como dos lecturas en paralelo: la del poste, que se estabiliza, y la del triángulo en cero, que está vacía. Un deslizador controla `Δx`; el juego lo barre desde un paso grande hasta casi cero y congela donde la lectura ya no se mueve y el triángulo todavía existe. Voz: "El punto está vacío pero el caminante se acerca. ¿A qué valor?". El ítem se reinicia con el deslizador en manos del jugador.

Los distractores de `explain` y de `apply` se generan desde la regla `detect` de esta misconception y desde las de los prerequisitos directos; los que faltan se completan con perturbaciones numéricas sin misconception.

## 13. Generalización

La analogía se retira en `formal`, como declara `fades_at_layer`. Antes, en `symbolic`, la colina ya perdió el caminante: queda una curva sobre ejes y la secante se traza con `construct`. El caminante vuelve como fantasma al tocar `dy/dx`.

Variantes sin ayuda visual, en orden: pendiente en un punto de una curva dada como máquina, sin gráfica, evaluando el cociente con pasos decrecientes; pendiente en un punto donde la curva baja, con signo; curva con un pico, donde el jugador debe decir que la derivada no existe y mostrar los dos valores laterales; y la función derivada como objeto: dada una curva, dibujar con postes la curva de sus pendientes y reconocerla entre tres candidatas.

Colinas que no son colinas. El nodo termina con funciones cuya entrada no es un lugar: la temperatura de una taza contra el tiempo, el precio de un boleto contra la distancia. El jugador arma la razón con las unidades correctas y lee la derivada como "cuánto cambia esto por cada unidad de aquello". Se evalúa que la estructura (una razón de cambios que se estabiliza al achicar el paso) se reconoce sin colina.

El nodo está en `abstract` cuando el jugador produce la derivada en un punto de una función dada sin gráfica, ordena pendientes sin postes, señala el punto sin derivada con sus dos valores laterales y lee `f'` como función nueva.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `mvcalc.part.slice_of_surface`: una superficie cortada por un plano; la derivada parcial es la pendiente exacta sobre el corte, y el jugador tiene que elegir el corte antes de medir.
- `calc2.parpol.parametric_speed`: dos manivelas, una por coordenada, mueven un punto en el plano; la rapidez en un instante es la pendiente exacta de la distancia recorrida, y el jugador la arma desde las dos razones.
- `adv.ode.slope_field`: en una grilla, cada punto lleva una varilla con la inclinación que la ecuación dicta; el jugador reconoce que las varillas son postes de `f'` sin `f`, y traza la curva que las sigue.

Concepto siguiente: `calc1.deriv.tangent_line`. Frase puente, narrada sobre la última colina con la lupa puesta: "Ya sabés cuán empinado es el suelo justo donde pisa el caminante. Si ese tramo recto que viste con la lupa siguiera derecho, ¿por dónde pasaría?". El tramo se prolonga fuera de la lupa y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `slope_scene_secants_collapse_to_tangent` es nativa y pre-renderizada: la secante se traza entre dos puntos, el segundo resbala hacia el primero por una sucesión de pasos y la lectura de la pendiente se estabiliza; gramática `rate`, con los triángulos sucesivos superpuestos y la inclinación iluminada. Nativa, se dibuja sobre el estado del jugador y produce las animaciones de `explain`. `grid_scene_zoom_curve_looks_straight` es la lupa: la grilla se estira alrededor del punto por niveles de zoom y la curva se endereza; gramática `scale` sobre `deform`. Se reúsa `slope_scene_hill_intro`, pre-renderizada, como apertura compartida con el nodo 19. Ninguna lleva texto rasterizado: `Δx`, `Δy` y los valores los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_derivative` ([M](../../M-calculadora/M0-progresion.md)), un ícono de `d/dx` junto a cualquier función armada con fichas. Desde este nodo devuelve la pendiente exacta en un punto y muestra el renglón con la razón y los pasos decrecientes antes del valor; la forma simbólica de la regla llega con el nodo 27. Si el nodo decae, el ícono muestra óxido.

**Edad universal:** el nodo es `short_text` porque las etiquetas `Δx`, `Δy` y `lim` se leen desde la capa `visual`, y la definición corta se narra y se muestra escrita ([Q](../../Q-edad-universal.md)). Las capas `real`, `intuition` y `concrete` se juegan sin leer: manivela, lupa, caminante, mano fantasma y `explain` entre animaciones. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa de triángulos etiquetados y usa el teclado de fichas para el cociente de diferencias en vez de tipear.
