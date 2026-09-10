# I0. Manim en Mathy: gramática de referencia y pipeline de clips

Este documento explica cómo Mathy usa ManimGL. Fija el rol que ManimGL cumple en un producto React Native, describe la matemática como un sistema de estados que se transforman, define la gramática de transformación que toda escena respeta, enumera las trece familias de escenas por mecánica, establece el flujo de autoría, las reglas de los clips pre-renderizados y las trampas de nombres entre ManimGL y ManimCE. Cierra con la tabla de escenas declaradas en [`scenes.yaml`](scenes.yaml).

La evaluación técnica completa de por qué ManimGL no corre en el dispositivo y de las tres opciones consideradas está en [O, sección 1](../O-arquitectura-tecnica.md). Acá no se repite; se toma como decidida. La descripción de la gramática visual de doce primitivas está en [H, sección 2](../H-progresion-abstraccion.md). El catálogo de mecánicas está en [E0](../E-mecanicas/E0-catalogo.md). Las reglas de clips sin texto están en [P, sección 7](../P-internacionalizacion.md). La lista de espera para 3D interactivo está en [D0](../D-curriculum/D0-mapa.md).

Regla de lectura: en este documento todo nombre en `monoespaciado` es un nombre real de ManimGL, verificado contra el código fuente de `3b1b/manim`, o un id del mini-Manim nativo de [O, sección 3](../O-arquitectura-tecnica.md). Los ids nativos se distinguen porque están en la lista `native_vocabulary` de `scenes.yaml`.

## 1. El rol dual

ManimGL es un renderer GPU de escritorio escrito en Python. No corre en React Native, no corre en un navegador y no tiene API de streaming. Mathy no puede ejecutarlo en el teléfono, y no monta un servidor de render en v1. Lo que sí hace es darle dos roles precisos.

**Primer rol: especificación de referencia.** ManimGL define qué objetos existen, cómo se animan y con qué ritmo. Esa gramática se reimplementa en TypeScript sobre Skia como el "mini-Manim" nativo (`viz-core`), que es donde corre toda la capa interactiva. Cada escena de este documento se piensa primero en vocabulario de ManimGL y después se traduce al vocabulario nativo con la tabla de [O, sección 3](../O-arquitectura-tecnica.md). Esa traducción es mecánica por diseño: los nombres nativos replican la semántica de los originales, y quien lee una escena escrita en Python puede escribir la nativa sin traducir mentalmente.

**Segundo rol: herramienta de autoría y pre-render.** ManimGL corre en CI, en el directorio `manim/` del monorepo, para producir tres cosas: clips de introducción de 3 a 10 segundos para escenas que no requieren interacción, las pocas escenas 3D reales que la lista de espera de D0 autoriza, y prototipos interactivos de escritorio con `InteractiveScene` que sirven para probar una interacción antes de implementarla nativa. Los clips no se bundlean completos; el pipeline de [O, sección 9](../O-arquitectura-tecnica.md) los distribuye con starter pack y CDN.

**Qué se pierde.** Fidelidad automática: la escena nativa se parece a la de Manim solo por disciplina, no por compartir código. Se pierde el 3D con cámara libre e iluminación en la capa interactiva, salvo los nodos de la allowlist con escape hatch WebGPU. Se pierde `Tex` como motor de notación en runtime: la app no tiene LaTeX; tiene un `MathTree` con layout propio. Se pierde también la comodidad de escribir una escena una sola vez: cada escena nativa se escribe dos veces, una como referencia en Python y otra en TypeScript, y el costo de mantener las dos alineadas es real.

**Qué se gana.** Interacción en el mismo frame en que el jugador arrastra, sin latencia de red y sin conexión. Identidad por nodo de la expresión: el morph manzana → `x` → `2x` es exacto porque cada glifo conserva su id, cosa que un video no puede ofrecer. Etiquetas por locale dibujadas encima de cualquier clip, con un solo render para todos los idiomas. Un único tema visual compartido por clips y escenas nativas a través de `theme.json`. Y un flujo de autoría en el que el diseñador de una escena prototipa en escritorio con `Scene.embed()` y sliders de `ControlPanel`, ve el resultado en segundos y recién después pide la implementación nativa.

La decisión de ruta se toma por escena en `scenes.yaml` con el campo `route`. Este documento usa tres valores: `native` (corre en viz-core), `prerender` (clip en CI, sin interacción) y `both` (un clip de introducción con handoff a la escena nativa del mismo id). Corresponden a los valores `nativo` y `pre-render` de O; `both` es pre-render seguido de nativo.

## 2. Manim como sistema de estados matemáticos, no como productor de videos

El error habitual es pensar a Manim como una herramienta para hacer videos. En Mathy se piensa como un sistema de representación dinámica de estados matemáticos. Un objeto matemático está en un estado; una operación lo lleva a otro estado; la animación es la transición entre ambos. Lo que se enseña es la transición, no el estado final. Esto cambia cómo se diseña cada escena.

**La ecuación es un objeto.** `x + 5 = 12` no es una imagen. Es un `MathTree` con un id por nodo, y sus términos se mueven, se agrupan, se separan y cambian de representación. Cuando el jugador resta 5 a los dos lados, el `5` de la izquierda no desaparece y aparece un `- 5`: el mismo `5` se desplaza, se funde con su inverso y la balanza se mantiene nivelada. En ManimGL eso se escribe con `TransformMatchingTex` entre dos `Tex`, que empareja substrings; en Mathy se escribe con `TransformMatchingIds` entre dos `MathTree`, que empareja ids. La diferencia importa: dos `x` en un mismo `Tex` son indistinguibles para Manim, pero en el `MathTree` cada una sabe de qué manzana viene.

**Una función es entrada → transformación → salida.** La máquina de `machine_pipe` es una `Rectangle` con una `Arrow` de entrada y otra de salida, y una ficha (`Dot` o `DecimalNumber`) que recorre el tubo con `MoveAlongPath` y cambia de valor con `ChangeDecimalToValue` al atravesar la máquina. Componer es encadenar dos máquinas con `Succession`; invertir es correr la misma máquina con el path recorrido al revés y `Restore` al estado guardado con `save_state`.

**Un vector es una flecha que se mueve.** `Vector` sobre un `NumberPlane`. Sumar es poner una flecha a continuación de otra (`ApplyMethod` con `shift`). Descomponer es `TransformFromCopy` hacia las dos proyecciones sobre los ejes. Proyectar es una `DashedLine` hasta el eje con `get_v_line_to_graph` cuando hay gráfica, o una `Line` explícita cuando no. Cambiar de base es `ApplyMatrix` sobre el plano con las flechas de la base marcadas.

**La derivada es una secante que se cierra.** Dos `Dot` sobre `get_graph`, una `Line` entre ambos, un `ValueTracker` que controla Δx y `always_redraw` que reconstruye la secante en cada frame. Cuando Δx tiende a cero la secante coincide con `get_tangent_line` y el `DecimalNumber` de la pendiente se estabiliza en `slope_of_tangent`. El jugador ve el límite suceder, no se lo cuentan.

**La integral son rectángulos que se afinan.** `get_riemann_rectangles` con `n` rectángulos, `Transform` al conjunto con `2n`, y otra vez con `4n`, hasta que la silueta se confunde con `get_area_under_graph`. El `DecimalNumber` de la suma converge y el jugador ve por qué se llama límite de sumas.

**El límite es acercarse.** Un `Dot` que se mueve hacia una pared con `slow_into` como rate function y nunca la toca. Un `DecimalNumber` que cambia con `ChangeDecimalToValue` y muestra cada vez más decimales iguales. La regla de ritmo elegida no es decoración: `slow_into` es la representación visual de "cada vez más cerca, cada vez más despacio".

Consecuencia práctica: una escena de Mathy nunca "muestra el resultado". Muestra el estado inicial, la transformación con su ritmo, y el estado final con los mismos objetos. Si un diseñador propone una escena en la que algo aparece sin haber sido transformado desde otra cosa, la escena está mal diseñada, con una sola excepción documentada en [H, sección 6](../H-progresion-abstraccion.md): el morph de `formal` a `abstract` se diseña como ruptura visible.

## 3. La gramática de transformación

Cada primitiva de la gramática visual de H tiene una realización canónica en ManimGL. Estas realizaciones son obligatorias: dos escenas que enseñan "sumar" en áreas distintas usan el mismo gesto visual, porque de esa repetición depende la transferencia.

**Sumar es desplazar.** `shift` o `ApplyMethod(mob.shift, vector)`. El objeto conserva forma y tamaño; solo cambia de posición. Sobre una `NumberLine` la posición es el número. Un negativo es el mismo desplazamiento hacia el otro lado, con `FadeToColor` para marcar el cambio de dirección sin depender solo del color.

**Multiplicar es escalar.** `scale` o `ApplyMatrix` con matriz diagonal sobre un `NumberPlane`. El objeto conserva forma y cambia de tamaño. El factor es la razón entre antes y después, y se muestra con un `Brace` y un `DecimalNumber`. Cuando el factor es menor que uno, el mismo gesto encoge. Dividir es la inversa: `Restore` al estado guardado.

**Potenciar es transformar sin conservar proporciones.** `apply_function` o `ApplyFunction` sobre puntos equiespaciados de una `NumberLine`. Los puntos se separan de forma desigual y el jugador ve que "el doble de entrada" ya no da "el doble de salida". La versión sobre gráfica es `get_graph` de una curva frente a una recta con la misma `Axes`.

**Componer es encadenar.** `Succession` de dos `ApplyFunction`, o dos máquinas conectadas con una `Arrow`. Cambiar el orden con `Swap` cambia el resultado y se ve. En engranajes, `Rotating` de dos ruedas con razones distintas y un `DecimalNumber` con la razón total.

**Invertir es volver.** `save_state` antes de la transformación, `Restore` después. La animación se reproduce hacia atrás y el objeto vuelve exactamente a donde estaba. Cuando la transformación no tiene inversa, `Restore` no está disponible y la llave equivocada hace `WiggleOutThenIn` sobre el cofre sin abrirlo.

**Derivar es medir cuán rápido cambia.** `get_tangent_line` sobre `get_graph`, con un `ValueTracker` para la abscisa y `always_redraw` para reconstruir la tangente en cada frame. La pendiente se lee con `slope_of_tangent` y se muestra como `DecimalNumber`. El triángulo de subida es un `Polygon` con base Δx y altura Δy que se achica junto con Δx.

**Integrar es acumular.** `get_riemann_rectangles` con `n` rectángulos y `Transform` al conjunto con `2n`. El área acumulada es `get_area_under_graph` con opacidad creciente. En la mecánica de llenado, el nivel del tanque es un `Rectangle` cuya altura sigue a un `ValueTracker` y coincide con el área acumulada hasta ese instante.

**Deformar el espacio es una transformación lineal.** `NumberPlane` más `Vector` de base más `ApplyMatrix`. Este es el punto donde más gente escribe código contra la API equivocada, así que merece detalle. En ManimCE existe `LinearTransformationScene`, una escena que ya trae grilla, vectores de base y grilla fantasma. **En ManimGL no existe.** La misma escena se reconstruye a mano con cuatro piezas:

1. Una `NumberPlane` que será deformada. Antes de aplicar la matriz se llama `prepare_for_nonlinear_transform`, que subdivide cada línea de la grilla en muchos puntos. Es obligatorio incluso para transformaciones lineales cuando la matriz tiene cizalla, porque garantiza que los segmentos se remuestreen sin artefactos.
2. Una segunda `NumberPlane` idéntica, atenuada, que no se transforma: la grilla fantasma. Es la referencia que le dice al jugador cuánto se deformó el espacio.
3. Dos `Vector` para la base, uno por columna de la matriz. Su destino tras la transformación son las columnas.
4. `ApplyMatrix(matrix, VGroup(plane, basis_vectors, figure))`, que aplica `apply_matrix` a todos los puntos del grupo en una sola animación con `smooth`. La figura (la casa de `grid_scene_rubber_sheet_house`) es un `Polygon` que viaja con la grilla.

La `Matrix` de ManimGL se muestra al costado y se actualiza con `TransformMatchingTex` cuando el jugador cambia una entrada. La inversa es `Restore` sobre el grupo completo. Un sistema de ecuaciones es la pregunta "qué punto fue a parar acá", y se ve como un `Dot` en la grilla deformada que vuelve a su origen con la matriz inversa. En viz-core esto es `GridDeform`, que para matrices afines aplica una transformación del canvas sin remuestreo, y `Projection2_5D` cuando la grilla es 3D.

**Partir es dividir sin solapar.** `Rectangle` o `Square` en `VGroup`, separados con `LaggedStartMap` de `ShowCreation` sobre `DashedLine` de corte, y `FadeToColor` sobre las partes seleccionadas. La fracción aparece como `Tex` al lado y se conecta con la barra mediante `TransformMatchingTex`.

**Relacionar es conectar.** `Dot` para los elementos y `Arrow` o `Line` para las conexiones, con `GrowArrow` para cada flecha nueva. Un grafo redibujado es `ApplyFunction` sobre las posiciones de los puntos con las líneas siguiendo a sus extremos. La regla de función (de cada punto sale exactamente una flecha) se verifica visualmente con `Cross` sobre la flecha sobrante.

**Invariante es lo que no cambia.** `Indicate` o `FlashAround` sobre la parte que permanece idéntica en dos estados distintos. La balanza es una `Line` que rota con `Rotate` alrededor de un `Dot` cuando los platos se desequilibran, y que permanece horizontal cuando la misma acción se aplica a los dos lados. En construcción geométrica, la figura original nunca se mueve; solo se agregan `DashedLine` y `Arc` que revelan relaciones.

**Azar es proporción a la larga.** `Dot` que salen de un `Circle` (la urna) con `MoveAlongPath` y `Succession`, un `BarChart` que crece con cada extracción y un `ValueTracker` de la frecuencia relativa cuyo `DecimalNumber` se estabiliza. La probabilidad como fracción de área usa `Sector` sobre el círculo y `SurroundingRectangle` sobre las bolas que cumplen la condición.

### Tabla: doce primitivas de la gramática visual

| Primitiva de H | Realización en ManimGL | Equivalente nativo (viz-core) |
|---|---|---|
| `displace` | `NumberLine`, `Dot`, `ApplyMethod` con `shift`, `GrowArrow`, `Arrow` | `NumberLine`, `Dot`, `Tween`, `Arrow` |
| `scale` | `ApplyMatrix` diagonal, `ScaleInPlace`, `Brace`, `DecimalNumber` | `GridDeform`, `Tween`, `Brace`, `DecimalNumber` |
| `nonlinear` | `apply_function`, `ApplyFunction`, `get_graph`, `Axes` | `GridDeform` no lineal, `FunctionGraph`, `Axes` |
| `compose` | `Succession`, `MoveAlongPath`, `Arrow`, `Swap`, `Rotating` | `Succession`, `MoveAlongPath`, `Arrow`, `Tween`, `Rotate` |
| `invert` | `save_state`, `Restore`, `Rotate` (llave), `WiggleOutThenIn` | `Tween` hacia estado guardado, `Rotate`, `Wiggle` |
| `rate` | `get_tangent_line`, `slope_of_tangent`, `ValueTracker`, `always_redraw`, `Polygon` | `TangentLineAt`, `SharedValue`, `AlwaysRedraw`, `Polygon` |
| `accumulate` | `get_riemann_rectangles`, `get_area_under_graph`, `Transform`, `Rectangle` | `RiemannRects`, `AreaUnderGraph`, `Transform`, `Polygon` |
| `deform` | `NumberPlane`, `prepare_for_nonlinear_transform`, `ApplyMatrix`, `Vector`, `Matrix` | `NumberPlane`, `GridDeform`, `Vector`, `MatrixMobject` |
| `partition` | `VGroup` de `Square`, `DashedLine`, `LaggedStartMap`, `FadeToColor`, `Sector` | `Group` de `Polygon`, `Line`, `LaggedStart`, `Tween`, `Arc` |
| `relate` | `Dot`, `Arrow`, `Line`, `GrowArrow`, `ApplyFunction`, `ShowPassingFlash` | `Dot`, `Arrow`, `Line`, `Write`, `Tween`, `PassingFlash` |
| `invariant` | `Indicate`, `FlashAround`, `Rotate` (balanza), `Arc` (ángulos marcados) | `Indicate`, `Flash`, `Rotate`, `Angle` |
| `random` | `BarChart`, `ValueTracker`, `MoveAlongPath`, `Sector`, `SurroundingRectangle` | `BarChart`, `SharedValue`, `MoveAlongPath`, `Arc`, `Polygon` |

### Tabla: los 51 nodos de la espina

La columna "primitivas" enumera las que distinguen al nodo; las de la familia base no se repiten. La columna "nativo" nombra las piezas de viz-core que la escena interactiva necesita.

| N | Nodo | Gramática | Primitivas ManimGL | Nativo |
|---|---|---|---|---|
| 1 | `found.count.cardinality` | partition | `SVGMobject`, `DashedLine`, `Integer`, `CountInFrom`, `LaggedStartMap` | `ConcreteToken`, `Line`, `DecimalNumber`, `LaggedStart` |
| 2 | `found.count.number_line` | displace | `NumberLine`, `Dot`, `Rotate`, `MoveAlongPath`, `ValueTracker` | `NumberLine`, `Dot`, `Rotate`, `MoveAlongPath`, `SharedValue` |
| 3 | `arith.add.displacement` | displace | `GrowArrow`, `ApplyMethod`, `ShowIncreasingSubsets`, `Integer` | `Arrow`, `Tween`, `LaggedStart`, `DecimalNumber` |
| 4 | `arith.sub.undo_add` | invert | `save_state`, `Restore`, `Succession`, `Rotate`, `Flash` | `Tween`, `Succession`, `Rotate`, `Flash` |
| 5 | `arith.mul.scaling` | scale | `Square`, `LaggedStartMap`, `Brace`, `ApplyMatrix`, `ScaleInPlace` | `Polygon`, `LaggedStart`, `Brace`, `GridDeform`, `Tween` |
| 6 | `arith.div.undo_mul` | invert | `ScaleInPlace`, `Restore`, `DashedLine`, `ShowCreation`, `BraceLabel` | `Tween`, `Line`, `Write`, `Brace` |
| 7 | `arith.int.negatives` | displace | `FadeToColor`, `FadeOutToPoint`, `FadeInFromPoint`, `CountInFrom` | `Tween`, `FadeOut`, `FadeIn`, `DecimalNumber` |
| 8 | `arith.frac.parts_and_ratio` | partition | `DashedLine`, `FadeToColor`, `TransformMatchingTex`, `Circle`, `Dot` | `Line`, `Tween`, `TransformMatchingIds`, `Circle`, `Dot` |
| 9 | `arith.expr.precedence_tree` | compose | `RoundedRectangle`, `GrowFromCenter`, `Swap`, `Cross`, `Succession` | `Polygon`, `Tween`, `Group`, `Succession` |
| 10 | `prealg.var.unknown_as_box` | partition | `Square`, `FadeOut`, `TransformMatchingShapes`, `GrowFromCenter`, `Tex` | `ConcreteToken`, `FadeOut`, `TransformMatchingIds`, `MathMobject` |
| 11 | `prealg.eq.balance` | invariant | `Rotate`, `ValueTracker`, `always_redraw`, `WiggleOutThenIn`, `there_and_back` | `Rotate`, `SharedValue`, `AlwaysRedraw`, `Wiggle`, `RateFunctions` |
| 12 | `prealg.inv.operation_as_key` | invert | `SVGMobject`, `Rotate`, `Restore`, `Flash`, `ApplyWave`, `Cross` | `SvgAsset`, `Rotate`, `Tween`, `Flash`, `Wiggle` |
| 13 | `alg.eq.one_step` | invariant | `TransformMatchingTex`, `Rotate`, `Succession`, `WiggleOutThenIn`, `FadeOut` | `TransformMatchingIds`, `Rotate`, `Succession`, `Wiggle` |
| 14 | `alg.eq.multi_step` | invert | `TransformMatchingTex`, `Succession`, `save_state`, `Restore`, `VGroup` | `TransformMatchingIds`, `Succession`, `Tween`, `Group` |
| 15 | `alg.expr.distributive_tiles` | scale | `Rectangle`, `DashedLine`, `BraceLabel`, `TransformFromCopy`, `FadeToColor` | `Polygon`, `Line`, `Brace`, `Transform`, `Tween` |
| 16 | `alg.sys.two_by_two` | invariant | `TransformFromCopy`, `FlashAround`, `get_graph`, `Flash`, `get_v_line_to_graph` | `Transform`, `Flash`, `FunctionGraph`, `Line` |
| 17 | `alg.fn.function_as_machine` | compose | `Rectangle`, `Arrow`, `MoveAlongPath`, `Write`, `GrowArrow`, `Cross` | `Polygon`, `Arrow`, `MoveAlongPath`, `Write`, `Group` |
| 18 | `alg.fn.graph_as_picture` | relate | `TracedPath`, `get_v_line_to_graph`, `get_h_line_to_graph`, `NumberPlane`, `FadeToColor` | `TracedPath`, `Line`, `NumberPlane`, `Tween` |
| 19 | `alg.fn.linear_slope` | rate | `Polygon`, `get_h_line_to_graph`, `DecimalNumber`, `ChangeDecimalToValue`, `BraceLabel` | `Polygon`, `Line`, `DecimalNumber`, `Tween`, `Brace` |
| 20 | `alg.fn.composition` | compose | `Succession`, `Swap`, `Rotating`, `always_rotate`, `Annulus` | `Succession`, `Tween`, `Rotate`, `Circle` |
| 21 | `alg.fn.inverse_function` | invert | `Restore`, `Rotate`, `TransformFromCopy`, `ApplyMatrix`, `DashedLine` | `Tween`, `Rotate`, `Transform`, `GridDeform`, `Line` |
| 22 | `alg.fn.quadratic_and_sqrt` | nonlinear | `Square`, `LaggedStartMap`, `ValueTracker`, `TransformFromCopy`, `NumberLine` | `Polygon`, `LaggedStart`, `SharedValue`, `Transform`, `NumberLine` |
| 23 | `alg.fn.exponential_growth` | nonlinear | `Rotating`, `Integer`, `TracedPath`, `get_graph`, `Flash` | `Rotate`, `DecimalNumber`, `TracedPath`, `FunctionGraph`, `Flash` |
| 24 | `alg.fn.logarithm` | invert | `CountInFrom`, `Arc`, `Restore`, `BraceLabel`, `Succession` | `DecimalNumber`, `Arc`, `Tween`, `Brace`, `Succession` |
| 25 | `precalc.lim.approach` | displace | `slow_into`, `exponential_decay`, `DashedLine`, `Circle`, `ChangeDecimalToValue` | `RateFunctions`, `Line`, `Circle`, `Tween` |
| 26 | `calc1.deriv.rate_as_slope_limit` | rate | `get_tangent_line`, `slope_of_tangent`, `LaggedStart`, `ScaleInPlace`, `slow_into` | `TangentLineAt`, `LaggedStart`, `Tween`, `RateFunctions` |
| 27 | `calc1.deriv.rules_as_structure` | compose | `ValueTracker`, `FlashAround`, `BraceLabel`, `LaggedStart`, `MoveAlongPath` | `SharedValue`, `Flash`, `Brace`, `LaggedStart`, `MoveAlongPath` |
| 28 | `calc1.int.accumulation` | accumulate | `get_riemann_rectangles`, `get_area_under_graph`, `Transform`, `ChangeDecimalToValue` | `RiemannRects`, `AreaUnderGraph`, `Transform`, `Tween` |
| 29 | `calc1.ftc.integral_undoes_derivative` | invert | `get_area_under_graph`, `get_tangent_line`, `slope_of_tangent`, `Restore`, `Rotate` | `AreaUnderGraph`, `TangentLineAt`, `Tween`, `Rotate` |
| 30 | `linalg.vec.vector_as_displacement` | displace | `Vector`, `GrowArrow`, `TransformFromCopy`, `TracedPath`, `Succession` | `Vector`, `Write`, `Transform`, `TracedPath`, `Succession` |
| 31 | `linalg.vec.span_and_combination` | displace | `Vector`, `DotCloud`, `LaggedStart`, `CountInFrom`, `TransformFromCopy` | `Vector`, `Dot`, `LaggedStart`, `DecimalNumber`, `Transform` |
| 32 | `linalg.map.linear_transformation_2d` | deform | `prepare_for_nonlinear_transform`, `ApplyMatrix`, `Matrix`, `Vector`, `Polygon` | `GridDeform`, `MatrixMobject`, `Vector`, `Polygon` |
| 33 | `linalg.map.inverse_and_systems` | invert | `ApplyMatrix`, `Restore`, `Matrix`, `TransformMatchingShapes`, `ShowCreation` | `GridDeform`, `Tween`, `MatrixMobject`, `TransformMatchingIds`, `Write` |
| 34 | `prob.basic.probability_as_proportion` | random | `BarChart`, `MoveAlongPath`, `Sector`, `FadeOutToPoint`, `ValueTracker` | `BarChart`, `MoveAlongPath`, `Arc`, `FadeOut`, `SharedValue` |
| 35 | `prob.cond.conditional_and_independence` | random | `SurroundingRectangle`, `Sector`, `FadeOut`, `ShowPassingFlash`, `BarChart` | `Polygon`, `Arc`, `FadeOut`, `PassingFlash`, `BarChart` |
| 36 | `prob.rv.expectation_as_weighted_average` | scale | `Rotate` (tabla), `NumberLine`, `Brace`, `BarChart`, `ChangeDecimalToValue` | `Rotate`, `NumberLine`, `Brace`, `BarChart`, `Tween` |
| 37 | `graph.basic.graph_and_paths` | relate | `TransformMatchingShapes`, `ApplyFunction`, `Homotopy`, `ShowPassingFlash`, `SVGMobject` | `TransformMatchingIds`, `Tween`, `GridDeform`, `PassingFlash`, `SvgAsset` |
| 38 | `geom.area.rect_and_triangle` | scale | `ShowIncreasingSubsets`, `TransformFromCopy`, `Rotate`, `DashedLine`, `BraceLabel` | `LaggedStart`, `Transform`, `Rotate`, `Line`, `Brace` |
| 39 | `geom.angle.turn_as_measure` | displace | `Arc`, `Sector`, `Rotate`, `ValueTracker`, `DashedLine` | `Arc`, `Angle`, `Rotate`, `SharedValue`, `Line` |
| 40 | `geom.sim.similarity_as_scale` | scale | `ScaleInPlace`, `TransformFromCopy`, `DashedLine`, `BraceLabel`, `ValueTracker` | `Tween`, `Transform`, `Line`, `Brace`, `SharedValue` |
| 41 | `geom.tri.pythagoras_as_tiles` | invariant | `Polygon`, `Rotate`, `MoveAlongPath`, `LaggedStart`, `Arc`, `Square` | `Polygon`, `Rotate`, `MoveAlongPath`, `LaggedStart`, `Angle` |
| 42 | `geom.cons.auxiliary_lines` | invariant | `DashedLine`, `ShowCreation`, `Uncreate`, `FlashAround`, `Cross`, `Arc` | `Line`, `Write`, `FadeOut`, `Flash`, `Group`, `Angle` |
| 43 | `trig.circle.unit_circle_radians` | displace | `Circle`, `Arc`, `Transform` (radio → arco), `NumberPlane`, `Rotate` | `Circle`, `Arc`, `Transform`, `NumberPlane`, `Rotate` |
| 44 | `trig.fn.sine_as_height` | compose | `Circle`, `TracedPath`, `get_h_line_to_graph`, `Rotate`, `DashedLine`, `Arc` | `Circle`, `TracedPath`, `Line`, `Rotate`, `Angle` |

## 4. Las trece familias de escenas

Cada mecánica de [E0](../E-mecanicas/E0-catalogo.md) declara un `manim_family`. La familia es una clase base de ManimGL en `manim/scenes/` que construye el escenario, lee el `theme.json` y expone los objetos con nombres lógicos estables para el `handoff.json`. Las escenas concretas heredan de ella y solo agregan la transformación que enseñan. Los nombres lógicos son los que la escena nativa usa para reconstruir el scene graph; por eso son parte del contrato y no cambian entre escenas de la misma familia.

**`balance_scene` (mecánica `balance`).** Una `Line` horizontal como tabla, un `Dot` como fulcro, dos `Rectangle` como platos y un `VGroup` de `Square` (cajas) y `Dot` (fichas) en cada plato. Un `ValueTracker` con la diferencia de pesos controla, vía `always_redraw`, el ángulo con que `Rotate` inclina la tabla. La escena base sabe nivelar, inclinar hacia un lado y volver con `there_and_back`. Nombres lógicos: `plank`, `pivot`, `pan_left`, `pan_right`, `token_<i>`, `box_<i>`.

**`chest_scene` (mecánica `chest_key`).** Un `RoundedRectangle` como cofre con un `Tex` de la operación grabada, `SVGMobject` para llave y cerradura, y una secuencia estándar: la llave gira con `Rotate`, el cofre abre con `Succession` de `FadeIn` del contenido y `Flash` en la cerradura, o no abre y hace `WiggleOutThenIn`. Antes de cada intento se llama `save_state`, y `Restore` devuelve el cofre al estado cerrado. Nombres lógicos: `chest`, `lock`, `key_<op>`, `content`.

**`pipe_scene` (mecánica `machine_pipe`).** Un `Rectangle` por máquina con `Tex` de su regla, `Arrow` de entrada y salida, y una ficha `DecimalNumber` que recorre el tubo con `MoveAlongPath` y cambia de valor con `ChangeDecimalToValue` al pasar por la máquina. Las máquinas se encadenan con `Succession` y se reordenan con `Swap`. Nombres lógicos: `machine_<i>`, `pipe_<i>`, `token`.

**`ledger_scene` (mecánica `ledger`).** Un `Rectangle` como libro de cuentas, columnas de `SVGMobject` (frutas, fichas), un `Integer` por columna que cuenta con `CountInFrom` y aparece con `ShowIncreasingSubsets`. La familia incluye la maquinaria del morph: `TransformMatchingParts` y `TransformMatchingShapes` entre la fila de frutas y la fila de `Tex`, que en la app es un solo `TransformMatchingIds` sobre el `MathTree`. Nombres lógicos: `ledger`, `column_<i>`, `item_<i>_<j>`, `count_<i>`.

**`tile_scene` (mecánica `tiles`).** Un `VGroup` de `Square` que se acomoda en un `Rectangle` con `LaggedStartMap` de `ApplyMethod` con `move_to`, `Brace` y `BraceLabel` en los lados, un `Integer` con el total. Sabe partir en filas con `DashedLine`, sombrear con `FadeToColor` y reordenar con `MoveAlongPath`. La versión sobre `Axes` con `get_riemann_rectangles` pertenece a esta familia porque la mecánica es la misma: baldosas que cubren un área. Nombres lógicos: `frame`, `tile_<i>`, `brace_w`, `brace_h`, `total`.

**`slope_scene` (mecánica `slope_walker`).** `Axes` con `get_graph`, un `Dot` caminante controlado por un `ValueTracker` y `always_redraw`, un `TracedPath` que deja el rastro, `get_v_line_to_graph` y `get_h_line_to_graph` para leer coordenadas, un `Polygon` de subida con base Δx, y `get_tangent_line` más `slope_of_tangent` para la pendiente exacta. Nombres lógicos: `axes`, `graph`, `walker`, `trace`, `rise_run`, `tangent`, `slope_value`.

**`fill_scene` (mecánica `fill_accumulate`).** `Axes` con la curva de caudal, `get_riemann_rectangles` como franjas, `get_area_under_graph` como acumulado, y un `Rectangle` tanque cuya altura sigue a un `ValueTracker`. `Transform` entre `n` y `2n` rectángulos es la animación central. Nombres lógicos: `axes`, `rate_graph`, `strips`, `area`, `tank`, `level`.

**`grid_scene` (mecánica `grid_stretch`).** La reconstrucción de la escena de transformación lineal descrita en la sección 3: `NumberPlane` activa, `NumberPlane` fantasma, dos `Vector` de base, `Polygon` figura, `Matrix` al costado, `prepare_for_nonlinear_transform` y `ApplyMatrix`, con `save_state` y `Restore` para la inversa. Nombres lógicos: `plane`, `ghost`, `basis_i`, `basis_j`, `figure`, `matrix`.

**`network_scene` (mecánica `network_routes`).** `Dot` por nodo y `Line` o `Arrow` por arista en un `VGroup`, `ShowCreation` con `LaggedStartMap` para dibujar la red, `MoveAlongPath` para recorrer un camino, `ShowPassingFlash` para resaltar una ruta e `Indicate` sobre un nodo. `Transform` entre dos disposiciones del mismo grafo. Nombres lógicos: `node_<i>`, `edge_<i>_<j>`, `path`.

**`urn_scene` (mecánica `urn_dice`).** `Circle` como urna, `Dot` de colores como bolas, extracción con `MoveAlongPath`, `BarChart` de conteos, `ValueTracker` con la frecuencia y `DecimalNumber` que la muestra, `Sector` para la fracción como área. Nombres lógicos: `urn`, `ball_<i>`, `tally`, `frequency`.

**`gear_scene` (mecánica `gears_sequence`).** `Circle` y `Annulus` como engranaje y manivela, `Rotate` por vuelta, `NumberLine` como pista, `Dot` caminante con `MoveAlongPath`, `Arrow` con `GrowArrow` por paso, `Integer` de posición con `ChangeDecimalToValue`. Nombres lógicos: `gear`, `crank`, `track`, `walker`, `position`.

**`sorter_scene` (mecánica `sorter`).** `Rectangle` por cajón, objetos `Dot` o `SVGMobject`, `MoveAlongPath` del objeto al cajón con `LaggedStartMap`, `Integer` por cajón con `CountInFrom`. Nombres lógicos: `bin_<i>`, `item_<i>`, `count_<i>`.

**`construction_scene` (mecánica `construct`).** Un `Polygon` figura que nunca se mueve, `Line` y `DashedLine` auxiliares que aparecen con `ShowCreation`, `Dot` en intersecciones, `Arc` para marcar ángulos iguales y un `Square` pequeño para el ángulo recto (ManimGL no tiene `RightAngle`), `Brace` y `BraceLabel` para longitudes, `FlashAround` sobre el triángulo revelado, `TransformFromCopy` para mostrar que un pedazo es copia de otro. Nombres lógicos: `figure`, `aux_<i>`, `vertex_<i>`, `angle_<i>`, `revealed`.

## 5. Cómo se autoriza una escena

Una escena es una clase de ManimGL parametrizada por un JSON. El JSON lo emite el build de contenido a partir del ítem del minijuego; la clase nunca contiene valores concretos. Así, `tile_scene_riemann_refine` con `{"f": ..., "interval": [0, 2], "n_rects": 4, "n_max": 64}` produce el clip y el handoff de ese ítem, y la misma clase con otro JSON produce otro. Los tipos de los parámetros están en `param_types` de `scenes.yaml`; ninguno contiene texto visible.

**Tema compartido.** `manim/theme.py` lee `content/theme.json`, el mismo archivo que consume la app. Colores, grosores de trazo, tamaños de punto y tipografía coinciden entre clip y escena nativa. Un cambio de tema re-renderiza todo, y por eso el tema se congela por release.

**Flujo de autoría con `Scene.embed()`.** El diseñador escribe la escena, coloca `self.embed()` en el punto que quiere inspeccionar y corre `manimgl scenes/tile.py TileRiemannRefine -e`. ManimGL abre la ventana con la escena en ese estado y una consola de IPython. Desde ahí prueba animaciones sueltas, ajusta posiciones y evalúa el ritmo sin re-renderizar. `checkpoint_paste` toma el código copiado al portapapeles y lo ejecuta desde el último checkpoint, lo que permite iterar sobre un bloque de animación sin reiniciar la escena. `self.wait(note="...")` deja notas para el modo presentador (`-p`) cuando una revisión en equipo necesita pausas. Este flujo es la razón principal para mantener ManimGL como herramienta de autoría aunque el render final pudiera hacerse con otro motor.

**Prototipado de interacción con `InteractiveScene`.** Antes de pedir la implementación nativa de una interacción, el diseñador la prototipa en escritorio. `InteractiveScene` permite arrastrar Mobjects con el mouse; `ControlPanel` con `LinearNumberSlider`, `Checkbox`, `Textbox` y `Button` expone los parámetros de la escena como controles en pantalla; `MotionMobject` hace arrastrable un objeto; `add_mouse_press_listner` (con la ortografía del código fuente, sin la segunda e) registra reacciones a clics sobre un Mobject. Un slider que controla el `ValueTracker` de Δx en `slope_scene_secants_collapse_to_tangent` responde la pregunta "¿se entiende la secante cerrándose cuando la controla el jugador?" en una tarde, antes de escribir una línea de TypeScript. Este es el uso legítimo de la interactividad de ManimGL en Mathy: prototipar, no servir. Ningún control de `ControlPanel` llega al producto.

**Extracción del handoff.** Al terminar la última animación, `render.py` recorre `scene.mobjects`, toma los que tienen nombre lógico asignado y serializa centro, bounding box, puntos y nombre en `handoff.json`. La escena nativa construye su scene graph desde ese archivo con los mismos ids y arranca sin corte. Los nombres lógicos son parte del contrato de cada familia, no de cada escena.

**Validación en CI.** El validador de escenas rechaza cualquier nombre en `primitives` que no esté en el inventario de la sección 8, cualquier `native_equivalents` fuera de `native_vocabulary`, cualquier tipo de parámetro fuera de `param_types`, cualquier clip que exceda 10 segundos o 1.2 MB, y cualquier escena de una familia cuya mecánica no esté declarada por el nodo que la usa, salvo marca explícita `mechanic_exception`. También verifica que cada nodo de la espina tenga al menos dos escenas.

## 6. Reglas para clips pre-renderizados

1. **Sin texto rasterizado.** Un clip es geometría y movimiento. Ninguna etiqueta, nombre de eje, nombre de función ni número formateado va dentro del video. Todo se dibuja nativo sobre el clip usando las posiciones del `handoff.json` por frame clave. Un clip sirve para todos los idiomas y todos los `MathLocale`. La excepción documentada en [P, sección 7](../P-internacionalizacion.md) (símbolos universales: dígitos, `+`, `=`, letras de variables) exige `text_free: false` y una lista `embedded_symbols` en `scenes.yaml`; ninguna escena de esta versión la usa. Regla práctica: si dudás, va afuera.
2. **Duración de 3 a 10 segundos.** Un clip es una introducción o una transición, no una explicación. Lo que necesita más de 10 segundos necesita interacción y se hace nativo.
3. **Handoff obligatorio.** Todo clip termina en un estado que la escena nativa puede reconstruir. Si el último frame no tiene equivalente nativo, el clip está mal diseñado.
4. **Un clip por variante de parámetros.** El JSON de parámetros forma parte de la clave de caché. Escenas con muchas variantes (más de 20 ítems distintos) se hacen nativas aunque no sean interactivas, para no multiplicar assets.
5. **3D solo en la lista de espera de D0.** Un clip con `ThreeDScene`, `CameraFrame.reorient`, `Surface` o `ParametricSurface` se marca `threed: true` y solo se autoriza para los nodos que D0 lista. Todo lo demás en 3D se resuelve con `Projection2_5D` nativa. Ninguna escena de la espina es 3D.
6. **Formato y peso.** webm y mp4 a 720p y 30 fps, ≤ 1.2 MB por variante, poster ≤ 80 KB. El validador falla si un clip excede estos límites.
7. **Degradación.** Si el clip no está disponible offline, la app muestra el poster y arranca la escena nativa desde el `handoff.json`, que viaja siempre en el starter pack.
8. **Ritmo compartido.** Las rate functions del clip son las quince que viz-core porta con tolerancia `1e-9`, de modo que un `smooth` en el clip y un `smooth` en la escena nativa duran y se sienten igual en el handoff.

## 7. Trampas de nombres: ManimGL no es ManimCE

La mayor parte del material en línea sobre Manim describe ManimCE, el fork comunitario. Mathy usa ManimGL, la rama de 3b1b. Las APIs divergieron y muchos nombres de ManimCE no existen en ManimGL. Escribir código contra la API equivocada falla en CI, pero antes hace perder horas. Esta tabla es la referencia que evita el error.

| Se escribe en ManimCE | En ManimGL | Nota |
|---|---|---|
| `MathTex("x+5")` | `Tex("x+5")` | En ManimGL `Tex` ya está en modo matemático; `TexText` es el texto con LaTeX |
| `Create(mob)` | `ShowCreation(mob)` | `Create` no existe en ManimGL |
| `axes.plot(f)` | `axes.get_graph(f)` | `plot` no existe |
| `axes.get_area(graph)` | `axes.get_area_under_graph(graph)` | `get_area` no existe |
| `axes.get_secant_slope_group(...)` | `get_tangent_line` con `ValueTracker` y `always_redraw`; el triángulo es un `Polygon` propio | No existe; se construye |
| `LinearTransformationScene` | `NumberPlane` + `Vector` + `ApplyMatrix` + grilla fantasma (sección 3) | No existe |
| `MovingCameraScene`, `ZoomedScene` | `Scene` con `self.frame` (un `CameraFrame`) y `ApplyMethod` de `scale` o `reorient` | Toda escena tiene cámara movible |
| `GraphScene`, `VectorScene` | `Scene` con `Axes` o `NumberPlane` explícitos | No existen |
| `Graph`, `DiGraph` | `Dot` + `Line` o `Arrow` en `VGroup` | No hay clase de grafo; `network_scene` lo construye |
| `Table`, `MathTable` | `VGroup` de `Tex` alineados, o `Matrix` | No existe |
| `Angle`, `RightAngle` | `Arc` para el ángulo; `Square` pequeño para el recto | No existen; viz-core sí tiene `Angle` nativo |
| `Polyhedron`, `Dodecahedron` | `Surface`, `Cube`, `Sphere`, `Cylinder`, `Cone`, `Torus` | Solo los sólidos listados |
| `rate_functions.ease_in_out_sine` y familia `ease_*` | `smooth`, `rush_into`, `rush_from`, `slow_into`, `double_smooth`, `there_and_back`, `lingering`, `exponential_decay`, etc. | Las quince de la sección 8; ninguna `ease_*` |
| `mob.add_mouse_press_listener` | `mob.add_mouse_press_listner` | Ortografía del código fuente, sin la segunda e |
| `manim render --format png` | No existe `--format png`; se usa `-s` para un frame o se exporta con ffmpeg | La CLI es `manimgl` |
| `self.camera.frame` | `self.frame` | Es un `CameraFrame` con `reorient`, `set_euler_angles`, `set_field_of_view` |
| `TransformMatchingTex` | `TransformMatchingTex`, `TransformMatchingStrings`, `TransformMatchingParts` | Existen los tres; `Strings` es el general |

Nombres que sí existen en ManimGL y suelen sorprender: `BarChart` vive en `mobject/probability.py` junto con `SampleSpace`, `DieFace` y `Dartboard`; `Union`, `Difference`, `Intersection` y `Exclusion` son operaciones booleanas entre `VMobject`; `GlowDot`, `TracingTail` y `DotCloud` son objetos de puntos con render propio; `Clock` es un reloj animable; `ComplexPlane` tiene `n2p` y `p2n`; `ThreeDAxes.get_parametric_surface` construye superficies sobre ejes.

## 8. Inventario confirmado

Esta es la lista contra la que el validador comprueba `primitives` en `scenes.yaml`. Todo nombre fue verificado en el código fuente de `3b1b/manim` (rama master). Nada fuera de esta lista se acepta.

**Mobjects.** `Dot`, `Circle`, `Line`, `DashedLine`, `Arrow`, `Vector`, `Polygon`, `Rectangle`, `Square`, `RoundedRectangle`, `Arc`, `Sector`, `Annulus`, `Brace`, `BraceLabel`, `Tex`, `TexText`, `Text`, `DecimalNumber`, `Integer`, `NumberLine`, `UnitInterval`, `Axes`, `NumberPlane`, `ComplexPlane`, `ThreeDAxes`, `FunctionGraph`, `ParametricCurve`, `ImplicitFunction`, `VectorField`, `StreamLines`, `AnimatedStreamLines`, `Matrix`, `DecimalMatrix`, `IntegerMatrix`, `Surface`, `ParametricSurface`, `Sphere`, `Cube`, `Cylinder`, `Cone`, `Torus`, `SurfaceMesh`, `ValueTracker`, `DotCloud`, `GlowDot`, `TracedPath`, `TracingTail`, `SurroundingRectangle`, `BackgroundRectangle`, `Cross`, `Underline`, `BarChart`, `SampleSpace`, `Union`, `Difference`, `Intersection`, `Exclusion`, `DieFace`, `Dartboard`, `Clock`, `SVGMobject`, `ImageMobject`, `VGroup`, `Group`.

**Controles interactivos.** `ControlPanel`, `LinearNumberSlider`, `Checkbox`, `Textbox`, `Button`, `EnableDisableButton`, `MotionMobject`.

**Animaciones.** `Transform`, `ReplacementTransform`, `TransformFromCopy`, `TransformMatchingParts`, `TransformMatchingShapes`, `TransformMatchingStrings`, `TransformMatchingTex`, `ApplyMethod`, `ApplyFunction`, `ApplyMatrix`, `ApplyComplexFunction`, `ApplyPointwiseFunction`, `FadeToColor`, `ScaleInPlace`, `Restore`, `Swap`, `CyclicReplace`, `ShowCreation`, `Uncreate`, `DrawBorderThenFill`, `Write`, `ShowIncreasingSubsets`, `ShowSubmobjectsOneByOne`, `FadeIn`, `FadeOut`, `FadeInFromPoint`, `FadeOutToPoint`, `FadeTransform`, `FadeTransformPieces`, `GrowFromPoint`, `GrowFromCenter`, `GrowFromEdge`, `GrowArrow`, `FocusOn`, `Indicate`, `Flash`, `CircleIndicate`, `ShowPassingFlash`, `FlashAround`, `FlashUnder`, `ApplyWave`, `WiggleOutThenIn`, `Homotopy`, `ComplexHomotopy`, `PhaseFlow`, `MoveAlongPath`, `AnimationGroup`, `Succession`, `LaggedStart`, `LaggedStartMap`, `Rotate`, `Rotating`, `UpdateFromFunc`, `UpdateFromAlphaFunc`, `MaintainPositionRelativeTo`, `ChangingDecimal`, `ChangeDecimalToValue`, `CountInFrom`.

**Updaters.** `add_updater`, `always`, `f_always`, `always_redraw`, `always_shift`, `always_rotate`, `turn_animation_into_updater`.

**Métodos de `CoordinateSystem`.** `c2p`, `p2c`, `get_graph`, `get_parametric_curve`, `get_tangent_line`, `slope_of_tangent`, `angle_of_tangent`, `get_riemann_rectangles`, `get_area_under_graph`, `get_v_line_to_graph`, `get_h_line_to_graph`, `get_graph_label`, `bind_graph_to_func`, `get_scatterplot`; `NumberPlane.prepare_for_nonlinear_transform`, `NumberPlane.get_vector`; `ComplexPlane.n2p`, `ComplexPlane.p2n`; `ThreeDAxes.get_parametric_surface`.

**Métodos de `Mobject`.** `apply_function`, `apply_matrix`, `apply_complex_function`, `apply_points_function`, `rotate`, `scale`, `stretch`, `shift`, `fix_in_frame`, `save_state`, `add_mouse_press_listner` y los demás listeners con la misma ortografía.

**Cámara.** `CameraFrame.reorient`, `set_euler_angles`, `add_ambient_rotation`, `set_field_of_view`.

**Rate functions (quince).** `linear`, `smooth`, `rush_into`, `rush_from`, `slow_into`, `double_smooth`, `there_and_back`, `there_and_back_with_pause`, `running_start`, `overshoot`, `not_quite_there`, `wiggle`, `squish_rate_func`, `lingering`, `exponential_decay`.

**Escenas y autoría.** `Scene`, `ThreeDScene`, `InteractiveScene`, `Scene.embed()`, `checkpoint_paste`, `wait(note=...)`, modo presentador `-p`.

**Prohibidos (no existen en ManimGL).** `LinearTransformationScene`, `VectorScene`, `MovingCameraScene`, `ZoomedScene`, `GraphScene`, `Graph`, `DiGraph`, `Table`, `MathTex`, `Create`, `get_area`, `get_secant_slope_group`, `Axes.plot`, `Angle`, `RightAngle`, `Polyhedron`, toda rate function `ease_*`, `--format png`.

## 9. Tabla completa de escenas

Generada desde [`scenes.yaml`](scenes.yaml). Ruta: `native` corre en viz-core; `prerender` es un clip en CI; `both` es clip de introducción con handoff a la escena nativa. Las escenas marcadas con asterisco fueron agregadas por este documento y no aparecen en el campo `manim` de ningún nodo; los nodos que las usan son de la espina y declaran la mecánica de la familia. Las escenas restantes son los 92 ids que el grafo declara.

Conteos: 112 escenas; 95 `native`, 13 `both`, 4 `prerender`; ninguna 3D. Por familia: `chest_scene` 13, `gear_scene` 12, `grid_scene` 12, `ledger_scene` 11, `tile_scene` 11, `construction_scene` 10, `slope_scene` 9, `sorter_scene` 8, `balance_scene` 7, `pipe_scene` 7, `urn_scene` 5, `network_scene` 4, `fill_scene` 3.

| Escena | Familia | Nodos | Ruta | Primitivas principales |
|---|---|---|---|---|
| `balance_equal_pans_stay_level` | `balance_scene` | `prealg.eq.balance` | native | `Line`, `Dot`, `Rectangle`, `Square`, `VGroup`, `Rotate` |
| `balance_remove_one_side_tilts` | `balance_scene` | `prealg.eq.balance` | native | `Line`, `Dot`, `Square`, `VGroup`, `Rotate`, `ValueTracker` |
| `balance_key_both_sides` | `balance_scene` | `alg.eq.one_step` | native | `Line`, `Dot`, `Square`, `SVGMobject`, `VGroup`, `ValueTracker` |
| `balance_two_keys_in_order` | `balance_scene` | `alg.eq.multi_step` | native | `Line`, `Dot`, `Square`, `SVGMobject`, `VGroup`, `ValueTracker` |
| `balance_two_scales_shared_boxes` | `balance_scene` | `alg.sys.two_by_two` | native | `Line`, `Dot`, `Square`, `VGroup`, `TransformFromCopy`, `TransformMatchingTex` |
| `balance_scene_two_equations_one_grid` | `balance_scene` | `linalg.map.inverse_and_systems` | both (8 s) | `Line`, `Square`, `VGroup`, `NumberPlane`, `Vector`, `Matrix` |
| `balance_scene_plank_with_weights` | `balance_scene` | `prob.rv.expectation_as_weighted_average` | native | `Line`, `Dot`, `Circle`, `VGroup`, `ValueTracker`, `always_redraw` |
| `chest_box_as_tree_leaf` | `chest_scene` | `prealg.var.unknown_as_box` | native | `RoundedRectangle`, `Square`, `Line`, `Dot`, `VGroup`, `Tex` |
| `chest_key_matches_lock` | `chest_scene` | `prealg.inv.operation_as_key` | native | `RoundedRectangle`, `SVGMobject`, `Tex`, `Rotate`, `Succession`, `save_state` |
| `chest_log_key_counts_turns` | `chest_scene` | `alg.fn.logarithm` | native | `RoundedRectangle`, `SVGMobject`, `Tex`, `Integer`, `CountInFrom`, `Rotate` |
| `chest_nested_open_inside_first` | `chest_scene` | `arith.expr.precedence_tree` | native | `RoundedRectangle`, `VGroup`, `Tex`, `TransformMatchingTex`, `Succession`, `FadeOut` |
| `chest_one_key_two_chests` | `chest_scene` | `alg.fn.quadratic_and_sqrt` | native | `RoundedRectangle`, `SVGMobject`, `Tex`, `Rotate`, `Succession`, `TransformFromCopy` |
| `chest_pick_key_for_lock` | `chest_scene` | `alg.eq.one_step` | native | `RoundedRectangle`, `SVGMobject`, `Tex`, `TransformMatchingTex`, `Rotate`, `Succession` |
| `chest_scene_integral_key_opens_derivative` | `chest_scene` | `calc1.ftc.integral_undoes_derivative` | both (8 s) | `RoundedRectangle`, `SVGMobject`, `Axes`, `get_graph`, `get_area_under_graph`, `get_tangent_line` |
| `chest_scene_matrix_as_key` | `chest_scene` | `linalg.map.inverse_and_systems` | native | `RoundedRectangle`, `SVGMobject`, `Matrix`, `NumberPlane`, `Vector`, `ApplyMatrix` |
| `chest_shrink_key_undoes_stretch` | `chest_scene` | `arith.div.undo_mul` | native | `RoundedRectangle`, `SVGMobject`, `Line`, `Brace`, `ScaleInPlace`, `ApplyMethod` |
| `chest_step_back_undoes_step` | `chest_scene` | `arith.sub.undo_add` | native | `RoundedRectangle`, `SVGMobject`, `NumberLine`, `Dot`, `ApplyMethod`, `save_state` |
| `chest_unwrap_outer_to_inner` | `chest_scene` | `alg.eq.multi_step` | native | `RoundedRectangle`, `VGroup`, `Tex`, `TransformMatchingTex`, `Succession`, `FadeOut` |
| `chest_wrong_key_stays_shut` | `chest_scene` | `prealg.inv.operation_as_key` | native | `RoundedRectangle`, `SVGMobject`, `Tex`, `Rotate`, `WiggleOutThenIn`, `ApplyWave` |
| `chest_scene_key_intro \*` | `chest_scene` | `prealg.inv.operation_as_key`, `arith.sub.undo_add` | prerender (7 s) | `RoundedRectangle`, `SVGMobject`, `Rotate`, `Succession`, `save_state`, `Restore` |
| `pipe_chain_two_machines` | `pipe_scene` | `alg.fn.composition` | native | `Rectangle`, `Arrow`, `Line`, `Dot`, `MoveAlongPath`, `Tex` |
| `pipe_machine_named_f` | `pipe_scene` | `alg.fn.function_as_machine` | native | `Rectangle`, `Arrow`, `Dot`, `MoveAlongPath`, `Tex`, `TransformMatchingTex` |
| `pipe_run_machine_backwards` | `pipe_scene` | `alg.fn.inverse_function` | native | `Rectangle`, `Arrow`, `Dot`, `MoveAlongPath`, `Tex`, `TransformMatchingTex` |
| `pipe_scene_angle_to_height` | `pipe_scene` | `trig.fn.sine_as_height` | native | `Rectangle`, `Arrow`, `Circle`, `Line`, `DashedLine`, `Dot` |
| `pipe_scene_rules_as_pipeline` | `pipe_scene` | `calc1.deriv.rules_as_structure` | native | `Rectangle`, `Arrow`, `Dot`, `MoveAlongPath`, `Tex`, `TransformMatchingTex` |
| `pipe_scene_vector_in_vector_out` | `pipe_scene` | `linalg.map.linear_transformation_2d` | native | `Rectangle`, `Arrow`, `NumberPlane`, `Vector`, `Matrix`, `ApplyMatrix` |
| `pipe_two_machines_order_matters` | `pipe_scene` | `arith.expr.precedence_tree` | native | `Rectangle`, `Arrow`, `Dot`, `MoveAlongPath`, `Tex`, `Swap` |
| `ledger_a_times_sum` | `ledger_scene` | `alg.expr.distributive_tiles` | native | `Rectangle`, `Square`, `VGroup`, `Tex`, `TransformMatchingTex`, `TransformFromCopy` |
| `ledger_box_hides_tokens` | `ledger_scene` | `prealg.var.unknown_as_box` | native | `Rectangle`, `Square`, `Dot`, `VGroup`, `Tex`, `FadeOut` |
| `ledger_debt_tokens` | `ledger_scene` | `arith.int.negatives` | native | `Dot`, `VGroup`, `Rectangle`, `Tex`, `Integer`, `CountInFrom` |
| `ledger_join_two_piles` | `ledger_scene` | `arith.add.displacement` | native | `SVGMobject`, `VGroup`, `Rectangle`, `ApplyMethod`, `LaggedStartMap`, `Integer` |
| `ledger_pair_fruit_to_fruit` | `ledger_scene` | `found.count.cardinality` | native | `SVGMobject`, `VGroup`, `Line`, `DashedLine`, `LaggedStartMap`, `ShowCreation` |
| `ledger_scene_prize_ledger` | `ledger_scene` | `prob.rv.expectation_as_weighted_average` | native | `Rectangle`, `Tex`, `DecimalNumber`, `ChangeDecimalToValue`, `VGroup`, `TransformMatchingTex` |
| `ledger_scene_recipe_of_steps` | `ledger_scene` | `linalg.vec.span_and_combination` | native | `Rectangle`, `Tex`, `Integer`, `CountInFrom`, `Vector`, `NumberPlane` |
| `ledger_morph_fruit_to_symbol \*` | `ledger_scene` | `prealg.var.unknown_as_box`, `alg.expr.distributive_tiles` | native | `SVGMobject`, `Tex`, `VGroup`, `TransformMatchingParts`, `TransformMatchingShapes`, `TransformMatchingTex` |
| `tile_bar_cut_into_equal_parts` | `tile_scene` | `arith.frac.parts_and_ratio` | native | `Rectangle`, `Square`, `VGroup`, `Line`, `DashedLine`, `ShowCreation` |
| `tile_rows_become_rectangle` | `tile_scene` | `arith.mul.scaling` | native | `Square`, `VGroup`, `Rectangle`, `ApplyMethod`, `LaggedStartMap`, `Brace` |
| `tile_scene_growing_square_power_rule` | `tile_scene` | `calc1.deriv.rules_as_structure` | both (8 s) | `Square`, `Rectangle`, `VGroup`, `ValueTracker`, `always_redraw`, `Brace` |
| `tile_scene_pythagoras_rearrangement` | `tile_scene` | `geom.tri.pythagoras_as_tiles` | both (10 s) | `Polygon`, `Square`, `VGroup`, `Rotate`, `ApplyMethod`, `MoveAlongPath` |
| `tile_scene_rectangle_rows` | `tile_scene` | `geom.area.rect_and_triangle` | native | `Square`, `Rectangle`, `VGroup`, `LaggedStartMap`, `FadeIn`, `Brace` |
| `tile_scene_riemann_refine` | `tile_scene` | `calc1.int.accumulation` | native | `Axes`, `get_graph`, `get_riemann_rectangles`, `Transform`, `ValueTracker`, `always_redraw` |
| `tile_split_rectangle_into_rows` | `tile_scene` | `arith.div.undo_mul` | native | `Square`, `Rectangle`, `VGroup`, `Line`, `DashedLine`, `ShowCreation` |
| `tile_square_from_area` | `tile_scene` | `alg.fn.quadratic_and_sqrt` | native | `Square`, `VGroup`, `LaggedStartMap`, `Brace`, `BraceLabel`, `Tex` |
| `tile_two_rooms_one_width` | `tile_scene` | `alg.expr.distributive_tiles` | native | `Rectangle`, `Square`, `VGroup`, `Line`, `DashedLine`, `Brace` |
| `slope_intercept_is_start_height` | `slope_scene` | `alg.fn.linear_slope` | native | `Axes`, `get_graph`, `Dot`, `ValueTracker`, `always_redraw`, `get_h_line_to_graph` |
| `slope_linear_vs_exponential_race` | `slope_scene` | `alg.fn.exponential_growth` | both (8 s) | `Axes`, `get_graph`, `Dot`, `TracedPath`, `MoveAlongPath`, `ValueTracker` |
| `slope_reflect_graph_over_diagonal` | `slope_scene` | `alg.fn.inverse_function` | native | `Axes`, `get_graph`, `DashedLine`, `Dot`, `TransformFromCopy`, `ApplyMatrix` |
| `slope_same_steepness_any_step` | `slope_scene` | `alg.fn.linear_slope` | native | `Axes`, `get_graph`, `Dot`, `Polygon`, `Line`, `ValueTracker` |
| `slope_scene_secants_collapse_to_tangent` | `slope_scene` | `calc1.deriv.rate_as_slope_limit` | both (8 s) | `Axes`, `get_graph`, `Dot`, `Line`, `get_tangent_line`, `slope_of_tangent` |
| `slope_scene_walker_approaches_wall` | `slope_scene` | `precalc.lim.approach` | native | `Axes`, `get_graph`, `Dot`, `DashedLine`, `Circle`, `ValueTracker` |
| `slope_scene_wheel_rider_trace` | `slope_scene` | `trig.fn.sine_as_height` | both (10 s) | `Circle`, `Dot`, `Line`, `DashedLine`, `Axes`, `get_graph` |
| `slope_walker_leaves_trace` | `slope_scene` | `alg.fn.graph_as_picture` | native | `Axes`, `NumberPlane`, `Dot`, `TracedPath`, `MoveAlongPath`, `ValueTracker` |
| `slope_scene_hill_intro \*` | `slope_scene` | `alg.fn.linear_slope`, `calc1.deriv.rate_as_slope_limit` | prerender (8 s) | `Axes`, `get_graph`, `Dot`, `MoveAlongPath`, `TracedPath`, `Arrow` |
| `fill_scene_rectangles_under_curve` | `fill_scene` | `calc1.int.accumulation` | both (8 s) | `Axes`, `get_graph`, `get_riemann_rectangles`, `get_area_under_graph`, `Rectangle`, `ValueTracker` |
| `fill_scene_accumulation_rate_equals_height` | `fill_scene` | `calc1.ftc.integral_undoes_derivative` | native | `Axes`, `get_graph`, `get_area_under_graph`, `get_tangent_line`, `slope_of_tangent`, `Dot` |
| `fill_scene_tank_intro \*` | `fill_scene` | `calc1.int.accumulation`, `calc1.ftc.integral_undoes_derivative` | prerender (7 s) | `Rectangle`, `Axes`, `get_graph`, `get_area_under_graph`, `ValueTracker`, `always_redraw` |
| `gear_doubling_track` | `gear_scene` | `alg.fn.exponential_growth` | native | `Circle`, `Annulus`, `Rotate`, `Rotating`, `NumberLine`, `Dot` |
| `gear_one_step_one_number` | `gear_scene` | `found.count.number_line` | native | `Circle`, `Annulus`, `Rotate`, `NumberLine`, `Dot`, `ValueTracker` |
| `gear_scene_steps_east_then_north` | `gear_scene` | `linalg.vec.vector_as_displacement` | native | `NumberPlane`, `Dot`, `Arrow`, `Vector`, `GrowArrow`, `Succession` |
| `gear_scene_turn_as_angle` | `gear_scene` | `geom.angle.turn_as_measure` | native | `Circle`, `Annulus`, `Arc`, `Sector`, `Line`, `Rotate` |
| `gear_scene_unroll_radius_on_arc` | `gear_scene` | `trig.circle.unit_circle_radians` | both (8 s) | `Circle`, `Line`, `Arc`, `Dot`, `ValueTracker`, `always_redraw` |
| `gear_scene_zeno_halving` | `gear_scene` | `precalc.lim.approach` | native | `NumberLine`, `Dot`, `Arrow`, `GrowArrow`, `Succession`, `LaggedStart` |
| `gear_step_forward_adds` | `gear_scene` | `arith.add.displacement` | native | `Circle`, `Annulus`, `Rotate`, `NumberLine`, `Dot`, `Arrow` |
| `gear_track_numbers_in_order` | `gear_scene` | `found.count.number_line` | native | `NumberLine`, `Dot`, `Integer`, `LaggedStartMap`, `FadeIn`, `Circle` |
| `gear_track_read_backwards` | `gear_scene` | `alg.fn.logarithm` | native | `NumberLine`, `Dot`, `Arrow`, `Integer`, `CountInFrom`, `Rotate` |
| `gear_train_composed_ratio` | `gear_scene` | `alg.fn.composition` | native | `Circle`, `Annulus`, `Rotating`, `Rotate`, `always_rotate`, `ValueTracker` |
| `gear_walk_back_same_count` | `gear_scene` | `arith.sub.undo_add` | native | `Circle`, `Annulus`, `Rotate`, `NumberLine`, `Dot`, `Arrow` |
| `gear_walk_past_zero` | `gear_scene` | `arith.int.negatives` | native | `NumberLine`, `Dot`, `Arrow`, `GrowArrow`, `Rotate`, `Circle` |
| `grid_four_quadrants_with_signs` | `grid_scene` | `alg.fn.graph_as_picture` | native | `NumberPlane`, `Dot`, `Line`, `DashedLine`, `Tex`, `FadeIn` |
| `grid_scene_arrow_on_map` | `grid_scene` | `linalg.vec.vector_as_displacement` | native | `NumberPlane`, `Vector`, `Arrow`, `GrowArrow`, `Dot`, `ApplyMethod` |
| `grid_scene_basis_arrows_land` | `grid_scene` | `linalg.map.linear_transformation_2d` | native | `NumberPlane`, `Vector`, `ApplyMatrix`, `apply_matrix`, `Matrix`, `TransformMatchingTex` |
| `grid_scene_dilate_triangle` | `grid_scene` | `geom.sim.similarity_as_scale` | native | `NumberPlane`, `Polygon`, `ScaleInPlace`, `ApplyMethod`, `TransformFromCopy`, `Line` |
| `grid_scene_rubber_sheet_house` | `grid_scene` | `linalg.map.linear_transformation_2d` | both (8 s) | `NumberPlane`, `Polygon`, `Vector`, `prepare_for_nonlinear_transform`, `ApplyMatrix`, `apply_matrix` |
| `grid_scene_two_kinds_of_steps` | `grid_scene` | `linalg.vec.span_and_combination` | native | `NumberPlane`, `Vector`, `Arrow`, `GrowArrow`, `Succession`, `LaggedStart` |
| `grid_scene_undo_stretch` | `grid_scene` | `linalg.map.inverse_and_systems` | native | `NumberPlane`, `Polygon`, `Vector`, `ApplyMatrix`, `apply_matrix`, `Matrix` |
| `grid_scene_zoom_curve_looks_straight` | `grid_scene` | `calc1.deriv.rate_as_slope_limit` | both (8 s) | `NumberPlane`, `Axes`, `get_graph`, `Dot`, `get_tangent_line`, `ValueTracker` |
| `grid_stretch_by_factor` | `grid_scene` | `arith.mul.scaling` | native | `NumberLine`, `NumberPlane`, `Line`, `Brace`, `BraceLabel`, `ApplyMatrix` |
| `grid_two_lines_cross` | `grid_scene` | `alg.sys.two_by_two` | native | `NumberPlane`, `Axes`, `get_graph`, `Dot`, `ShowCreation`, `Line` |
| `grid_scene_sheet_intro \*` | `grid_scene` | `linalg.map.linear_transformation_2d`, `linalg.map.inverse_and_systems` | prerender (8 s) | `NumberPlane`, `Polygon`, `Vector`, `prepare_for_nonlinear_transform`, `ApplyMatrix`, `save_state` |
| `network_each_input_one_arrow` | `network_scene` | `alg.fn.function_as_machine` | native | `Dot`, `Arrow`, `GrowArrow`, `VGroup`, `Line`, `LaggedStartMap` |
| `network_scene_islands_to_dots` | `network_scene` | `graph.basic.graph_and_paths` | both (8 s) | `SVGMobject`, `Dot`, `Line`, `VGroup`, `Transform`, `TransformMatchingShapes` |
| `network_scene_same_graph_redrawn` | `network_scene` | `graph.basic.graph_and_paths` | native | `Dot`, `Line`, `VGroup`, `ApplyFunction`, `Transform`, `MoveAlongPath` |
| `network_scene_tree_of_draws` | `network_scene` | `prob.cond.conditional_and_independence` | native | `Dot`, `Line`, `Arrow`, `VGroup`, `LaggedStartMap`, `ShowCreation` |
| `sorter_number_card_on_bin` | `sorter_scene` | `found.count.cardinality` | native | `Rectangle`, `SVGMobject`, `VGroup`, `MoveAlongPath`, `LaggedStartMap`, `Integer` |
| `sorter_scene_bins_then_pick` | `sorter_scene` | `prob.cond.conditional_and_independence` | native | `Rectangle`, `Dot`, `VGroup`, `MoveAlongPath`, `LaggedStartMap`, `Sector` |
| `urn_fraction_of_balls` | `urn_scene` | `arith.frac.parts_and_ratio` | native | `Circle`, `Dot`, `VGroup`, `Rectangle`, `LaggedStartMap`, `ApplyMethod` |
| `urn_scene_draw_and_tally` | `urn_scene` | `prob.basic.probability_as_proportion` | native | `Circle`, `Dot`, `VGroup`, `MoveAlongPath`, `Succession`, `BarChart` |
| `urn_scene_fraction_of_total` | `urn_scene` | `prob.basic.probability_as_proportion` | native | `Circle`, `Dot`, `VGroup`, `ApplyMethod`, `LaggedStartMap`, `Rectangle` |
| `urn_scene_restricted_urn` | `urn_scene` | `prob.cond.conditional_and_independence` | native | `Circle`, `Dot`, `VGroup`, `Rectangle`, `FadeOut`, `FadeToColor` |
| `urn_scene_frequency_bar_stabilizes \*` | `urn_scene` | `prob.basic.probability_as_proportion`, `prob.rv.expectation_as_weighted_average` | native | `Circle`, `Dot`, `BarChart`, `ValueTracker`, `always_redraw`, `DecimalNumber` |
| `construction_scene_altitude_to_hypotenuse` | `construction_scene` | `geom.tri.pythagoras_as_tiles` | native | `Polygon`, `Line`, `DashedLine`, `Dot`, `Arc`, `Square` |
| `construction_scene_choose_the_line` | `construction_scene` | `geom.cons.auxiliary_lines` | native | `Polygon`, `Line`, `DashedLine`, `Dot`, `ShowCreation`, `Uncreate` |
| `construction_scene_composite_figure_altitude` | `construction_scene` | `geom.cons.auxiliary_lines` | native | `Polygon`, `Line`, `DashedLine`, `Dot`, `Arc`, `Square` |
| `construction_scene_extend_side_exterior_angle` | `construction_scene` | `geom.angle.turn_as_measure` | native | `Polygon`, `Line`, `DashedLine`, `Arc`, `Sector`, `Dot` |
| `construction_scene_height_from_radius_tip` | `construction_scene` | `trig.fn.sine_as_height` | native | `Circle`, `Line`, `DashedLine`, `Dot`, `Arc`, `Square` |
| `construction_scene_parallel_cut_similar` | `construction_scene` | `geom.sim.similarity_as_scale` | native | `Polygon`, `Line`, `DashedLine`, `Dot`, `ShowCreation`, `TransformFromCopy` |
| `construction_scene_radius_and_dropped_height` | `construction_scene` | `trig.circle.unit_circle_radians` | native | `Circle`, `NumberPlane`, `Line`, `DashedLine`, `Dot`, `Arc` |
| `construction_scene_triangle_half_rectangle` | `construction_scene` | `geom.area.rect_and_triangle` | native | `Polygon`, `Rectangle`, `Square`, `Line`, `DashedLine`, `Dot` |

