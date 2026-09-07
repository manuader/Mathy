# E0 — Catálogo de mecánicas

Este documento describe las trece mecánicas reutilizables de Mathy. Los datos (ids, gramática, gestos, etapas de desvanecimiento, nodos que las reúsan) viven en [`mechanics.yaml`](mechanics.yaml); las cadenas visibles al jugador, en [`../locales/es/mechanics.yaml`](../locales/es/mechanics.yaml). Acá se argumenta una sola vez por qué existen estas trece y cómo cada una cruza el curriculum entero.

## Qué es una mecánica

Una mecánica es la unión de dos cosas: **una interacción física** (un gesto sobre un objeto en pantalla) y **un invariante matemático** (una propiedad que ese gesto conserva). La balanza es un plato que se inclina cuando se arrastran cosas encima; su invariante es que la igualdad sobrevive a acciones idénticas en ambos platos. La interacción sola es un juguete. El invariante solo es una definición. Juntos son una mecánica: algo que se puede tocar y que, al tocarlo, obliga a sentir la estructura.

Cada mecánica declara una primitiva dominante de la gramática visual del [schema](../C-knowledge-graph/schema/node.schema.yaml), desarrollada en [H](../H-progresion-abstraccion.md). No hay correspondencia uno a uno: `ledger` y `sorter` comparten `partition`, `balance` y `construct` comparten `invariant`, y `nonlinear` no tiene mecánica propia porque aparece como caso límite de tres (la cuadrícula que se pliega, el engranaje que duplica, la baldosa cuadrada). Una mecánica se justifica por el invariante que conserva, no por la primitiva que ilustra.

Dos reglas gobiernan el catálogo y las hace cumplir el validador de [C0](../C-knowledge-graph/C0-esquema.md):

1. **Todo nodo tiene al menos una mecánica.** La primera de la lista es la principal. Un nodo sin mecánica solo se puede leer, y en Mathy nada se aprende leyendo primero.
2. **Toda mecánica se reúsa en al menos tres áreas.** Si una interacción sirve para un solo tema no es una mecánica: es un minijuego, y su lugar es [F](../F-minijuegos/F0-principios.md).

La segunda regla es la que evita construir trescientos juegos distintos. Trescientos nodos con una interacción propia cada uno son imposibles de producir y pedagógicamente pobres: el jugador aprendería trescientas interfaces y ninguna estructura. Con trece mecánicas, la primera vez que aparece la balanza el jugador aprende la balanza; la quinta, cuando sostiene una identidad trigonométrica, ya sabe qué hacer con las manos y toda su atención queda libre para lo nuevo. Reconocer la mecánica en un área ajena es, además, la medida más honesta de transferencia: quien ve una congruencia módulo n y busca la balanza entendió que "aplicar lo mismo a los dos lados" es una propiedad de la igualdad, no una regla del álgebra.

Las mecánicas no cambian entre locales ni entre edades. Cambia la piel según [G](../G-analogias/G0-reglas.md) y [P](../P-internacionalizacion.md); cambia la modalidad de instrucción según [Q](../Q-edad-universal.md). Invariante y gesto son los mismos a los seis años y en la universidad.

## Las trece mecánicas

Cada subsección sigue el mismo orden: qué hace el jugador, invariante, reúso cruzando áreas, desvanecimiento hacia la notación. Las listas completas de reúso están en el YAML; acá van los cruces que sorprenden. El criterio para avanzar de etapa está en [H](../H-progresion-abstraccion.md) y sus constantes en [K](../K-evaluacion.md). Los ids fuera de la [espina](../C-knowledge-graph/spine.yaml) son provisionales hasta que exista [`graph/`](../C-knowledge-graph/graph/).

### balance

**El jugador** arrastra objetos a los dos platos de una balanza. Cuando quita o agrega algo en un plato, tiene que repetir el movimiento en el otro; si no, la balanza se inclina y el objeto buscado queda inaccesible.

**Invariante:** `equality_under_identical_actions`. No es una regla memorizada sino la experiencia repetida de que la balanza se cae cuando no se cumple.

**Reúso.** Nace en `found.cmp.same_amount` (dos montones, ¿cuál pesa más?), es el nodo 11 de la espina y sostiene las ecuaciones de uno y varios pasos y los sistemas 2×2. Después cruza: en `alg.ineq.inequality_tilts` la balanza está inclinada a propósito y multiplicar por un negativo la da vuelta; en `linalg.sys.row_operations` cada fila de una matriz es una balanza; en `disc.mod.congruence_both_sides` los platos son relojes; en `adv.ode.separable_variables` se separan variables con el mismo gesto. Y en `prob.rv.expectation_as_weighted_average` no hay dos platos sino una viga con pesos: la esperanza es donde la viga queda derecha.

**Desvanecimiento.** `objects`: manzanas y una bolsa cerrada en los platos. `bars`: barras de longitud proporcional; la bolsa es una barra de longitud desconocida. `tokens`: fichas `x`, `5`, `12` que conservan el peso. `symbols`: los platos se desvanecen y queda `x + 5 = 12` sobre una línea que todavía se inclina si se rompe la igualdad.

### chest_key

**El jugador** elige la llave que abre un cofre y la arrastra al candado. Cada candado muestra una acción (poner 5, triplicar, elevar al cuadrado) y cada llave la deshace. Los cofres pueden estar anidados, y se abren en el orden inverso al que se cerraron.

**Invariante:** `inverse_restores_original`. La llave no "resuelve": deshace, y devuelve exactamente lo que había.

**Reúso.** Empieza en aritmética pura (`arith.sub.undo_add`, `arith.div.undo_mul`) antes de que exista ninguna ecuación, se formaliza en el nodo 12 y se combina con la balanza en el 13. Los cofres anidados son el árbol de `arith.expr.precedence_tree` dibujado como cajas. Luego la llave se vuelve función (nodo 21), abre dos cofres a la vez en `alg.fn.quadratic_and_sqrt` y cuenta vueltas en `alg.fn.logarithm`. Reaparece donde menos se la espera: en `calc1.ftc.integral_undoes_derivative` la integral es la llave de la derivada; en `csmath.crypto.caesar_shift` descifrar es girar el alfabeto al revés; en `prob.cond.bayes_reverses_condition` Bayes invierte el "dado que"; en `disc.mod.modular_inverse` algunas cerraduras no tienen llave; en `linalg.map.inverse_and_systems` la llave es una matriz. La sección "Funciones como llaves" desarrolla esta línea.

**Desvanecimiento.** `chests`: cofres con candado ilustrado y llaves con la acción inversa dibujada. `arrows`: el cofre se vuelve el diagrama vertical `x ↓ +5 ↓ x+5` y la llave, una flecha que sube. `boxes`: una caja en una expresión (`□ + 5 = 12`) y el teclado de fichas con las llaves. `inverse_notation`: `f⁻¹`, `√`, `ln`, `A⁻¹`, `∫`, presentadas como la misma llave con otro nombre.

### machine_pipe

**El jugador** mete un objeto por la boca de una máquina y mira qué sale por el tubo. Prueba varias entradas, adivina la regla, encadena máquinas y comprueba que invertir el orden cambia el resultado.

**Invariante:** `same_input_same_output`. Es la definición de función sin decir "función".

**Reúso.** En `found.pat.rule_machine` un niño mete un círculo, sale un cuadrado, y adivina la regla. En `arith.expr.precedence_tree` una cadena de máquinas (×3, después +2) es `3x + 2`, y en `alg.eq.multi_step` desarmarla de atrás hacia adelante es resolver. Es la mecánica principal de los nodos 17 y 20; en `alg.fn.graph_as_picture` el gráfico es la foto de todas las salidas. En `calc1.deriv.rules_as_structure` la regla de la cadena son dos tubos en serie; en `linalg.map.linear_transformation_2d` la máquina come vectores; en `prob.rv.random_variable_as_machine` entra azar y sale un número; en `adv.four.transform_as_machine` la máquina come una función entera.

**Desvanecimiento.** `machines`: máquinas opacas con boca y tubo. `pipes`: el tubo se vuelve transparente y muestra la regla actuando. `arrow_diagram`: `x → x + 3`. `function_notation`: `f(x) = x + 3`, `(g ∘ f)(x)`, donde el paréntesis es el resto visible de la boca de la máquina.

### ledger

**El jugador** junta objetos iguales en filas y cuenta cuántos hay en cada una. Una banana no puede ir a la fila de las manzanas.

**Invariante:** `count_preserved_under_regrouping`. Reordenar en filas no cambia cuántos hay. Es lo que hace legítimo escribir `2x` en lugar de `x + x`.

**Reúso.** Es el ejemplo de frutas del master prompt: 🍎+🍎 → x+x → 2x. Empieza en el nodo 1 y en `arith.add.combine_groups`. En `prealg.var.unknown_as_box` la bolsa cerrada es una fila más ("dos bolsas y tres manzanas"), y en `prealg.expr.like_terms` reducir términos semejantes es contar filas. Después cruza: en `linalg.vec.span_and_combination` una combinación lineal es un libro con dos filas (cuántas veces `u`, cuántas `v`); en `disc.count.sum_rule` sumar casos disjuntos es sumar filas; en `adv.ring.polynomial_arithmetic` un polinomio es un libro con una fila por potencia y los coeficientes son los conteos.

**Desvanecimiento.** `objects`: frutas dibujadas. `tally`: cada fila muestra su cuenta (`2 🍎`). `letters`: la fruta se vuelve una letra que conserva color y forma (`x + x`). `coefficients`: el conteo pasa adelante (`2x`) y la letra ya no necesita color.

### tiles

**El jugador** acomoda baldosas cuadradas para formar rectángulos, los corta, los pega y los estira con dos dedos. Una baldosa nunca desaparece.

**Invariante:** `area_preserved_under_rearrangement`. Es la propiedad que hace ciertas la distributiva, Pitágoras y la regla del producto.

**Reúso.** Es la mecánica de multiplicar como escalar (nodo 5) y de su llave (nodo 6: dividir es cortar en filas iguales). En el nodo 15, `3(x + 2)` es un rectángulo de alto 3 con la base partida en dos; en `alg.fn.quadratic_and_sqrt` completar el cuadrado es terminar de cubrir un cuadrado con las baldosas que faltan. En geometría cubre áreas y Pitágoras por reacomodo, que vuelve en `trig.id.pythagorean_identity`. Cruces menos evidentes: en `calc1.deriv.rules_as_structure` la regla del producto es un rectángulo cuyos dos lados crecen a la vez, y el término que falta es la esquinita; en `linalg.map.determinant_as_area` el determinante es cuánto cambia el área de una baldosa; en `prob.cond.conditional_and_independence` la probabilidad conjunta es un rectángulo dentro de un cuadrado de área 1, y la independencia es que tenga lados rectos; en `disc.count.product_rule` contar pares es contar baldosas.

**Desvanecimiento.** `loose_tiles`: baldosas sueltas. `grid_rectangle`: se funden en un rectángulo sobre una grilla. `labeled_sides`: los lados llevan `3` y `x + 2`, la grilla se atenúa. `product_notation`: `3(x + 2) = 3x + 6` con el rectángulo como marca de agua que desaparece.

### slope_walker

**El jugador** mueve un caminante por una cuesta y ve cuánto sube por cada paso hacia adelante. Cambia el tamaño del paso y comprueba que la cuesta no cambia.

**Invariante:** `steepness_independent_of_step_size`. En una recta es exacto; en una curva se vuelve exacto a medida que el paso se achica, y eso es la derivada.

**Reúso.** Empieza en `arith.rate.per_unit` ("por cada") y en `prealg.ratio.proportion_as_line`, donde una proporción es una cuesta que pasa por el origen. Es la mecánica de los nodos 19 y 26. En `alg.fn.exponential_growth` la cuesta se empina cuanto más alto está el caminante; en `precalc.lim.approach` se acerca a una pared que no toca. Cruza a `trig.fn.tangent_as_slope` (la tangente de un ángulo es la pendiente de esa cuesta), a `mvcalc.deriv.gradient_steepest_ascent` (en una montaña, elegir la dirección más empinada), a `prob.stat.regression_line` (la cuesta que mejor sigue la nube de puntos), a `csmath.cplx.big_o_as_slope` (comparar algoritmos es comparar cuestas en escala logarítmica) y a `adv.ode.slope_field`.

**Desvanecimiento.** `hill_walk`: un caminante en una colina, sin números. `staircase`: escalera de escalones iguales. `rise_run_triangle`: cada escalón es un triángulo con subida y avance. `slope_ratio`: `m = Δy / Δx`. `derivative_notation`: el triángulo se achica hasta ser un punto y la etiqueta se vuelve `dy/dx`.

### fill_accumulate

**El jugador** abre una canilla y mira cómo se llena un recipiente. Mantiene apretado para llenar, suelta para parar, recorre el tiempo con un scrub y compara cuánto entró en cada tramo. El caudal puede variar; el nivel recuerda todo lo que entró.

**Invariante:** `total_independent_of_chunking`. Entrar de a gotas o de a baldes da el mismo nivel final.

**Reúso.** En `found.meas.fill_compare` un niño compara dos vasos; en `arith.add.running_total` cada suma agrega un bloque; en `prealg.pct.percent_fill` el recipiente está graduado de 0 a 100. Es la mecánica del nodo 28, que se enseña sin derivada para que el 29 sea una sorpresa: la velocidad de llenado es la cuesta del nivel. Sigue en `calc2.ser.partial_sums` (una serie se llena con cucharadas cada vez más chicas). Cruza a `prob.rv.cumulative_distribution` (la acumulada es el nivel del balde), a `csmath.alg.prefix_sum` y a `adv.ode.euler_method` (llenar de a pasos siguiendo la cuesta local).

**Desvanecimiento.** `container`: recipiente y canilla. `stacked_blocks`: cada tramo de tiempo es un bloque apilado. `rectangles_under_curve`: los bloques se ordenan bajo la curva del caudal. `sigma_notation`: se cuentan con `Σ`. `integral_notation`: se afinan hasta ser una superficie continua y la `Σ` se estira en `∫`.

### grid_stretch

**El jugador** estira, encoge, gira o refleja una sábana cuadriculada con dos dedos y mira adónde va a parar cada dibujo.

**Invariante:** `lines_stay_lines_origin_fixed`. Ese invariante *es* la linealidad; cuando se rompe a propósito, el jugador reconoce lo no lineal por contraste.

**Reúso.** El cruce más importante del catálogo: en una sola dimensión, `grid_stretch` **es** la multiplicación. En `arith.mul.scaling` la recta numérica se estira ×3; en `arith.div.undo_mul` se encoge; en `arith.int.negatives` multiplicar por −1 la da vuelta. Así la transformación lineal del nodo 32 no es un tema nuevo sino la misma mecánica con dos dedos en lugar de uno. En `alg.fn.quadratic_and_sqrt` la recta se pliega por la mitad al elevar al cuadrado, y de ahí las dos ramas de la raíz. En `calc1.deriv.rate_as_slope_limit` la derivada es cuánto se estira la recta alrededor de un punto; en `calc2.tech.substitution_undoes_chain` cambiar de variable es estirar `dx`. En `linalg.eig.eigenvector_stays_on_line` es el vector que no cambia de dirección; en `adv.cx.multiplication_rotates_scales` multiplicar por un complejo gira y estira a la vez.

**Desvanecimiento.** `rubber_sheet`: una sábana con un dibujo. `grid_lines`: cuadrícula. `basis_arrows`: solo importan dos flechas (adónde fueron el paso a la derecha y el paso hacia arriba). `matrix_notation`: las dos flechas se escriben como columnas; en una dimensión, un solo número.

### network_routes

**El jugador** une puntos con caminos y busca por dónde ir de un lugar a otro. Mueve los puntos y ve que los caminos siguen unidos; agrega o quita puentes y comprueba qué queda conectado.

**Invariante:** `connections_independent_of_drawing`. Es la definición de grafo sin definirlo.

**Reúso.** Empieza en el nodo 1: emparejar uno a uno (`found.rel.match_one_to_one`) es tender un puente de cada niño a un caramelo. En `alg.fn.function_as_machine` el diagrama de flechas es una red donde cada punto de la izquierda tiene exactamente un puente. Es la mecánica del nodo 37, que solo necesita saber contar, y de toda el área `graph`. Cruces: en `prob.cond.conditional_and_independence` el diagrama de árbol es una red con pesos en los puentes; en `linalg.map.matrix_counts_routes` la matriz de adyacencia al cuadrado cuenta rutas de dos pasos, el primer producto de matrices con sentido físico; en `csmath.alg.state_machine` la red es el programa; en `adv.grp.cayley_graph` un grupo se dibuja como red.

**Desvanecimiento.** `islands_bridges`: islas y puentes. `dots_lines`: puntos y segmentos. `arrow_list`: cada punto lista a quién está unido. `adjacency_matrix`: la lista se vuelve una tabla de ceros y unos.

### urn_dice

**El jugador** saca bolitas de una bolsa o tira un dado: una vez por tap, muchas veces manteniendo apretado. Ve acumularse el conteo de cada resultado y compara bolsas.

**Invariante:** `proportion_stable_in_long_run`. La probabilidad es esa proporción, y solo aparece después de que el jugador la vio estabilizarse.

**Reúso.** En `found.cmp.likely_unlikely` un niño elige la bolsa con más rojas, sin números. En `arith.frac.parts_and_ratio` la fracción es la parte roja de la bolsa. Es la mecánica de los nodos 34 a 36 y de casi toda el área: condicionar es mirar solo las bolitas que cumplen algo, la esperanza es el promedio de muchas tiradas, la ley de los grandes números es el invariante hecho teorema. Cruces: en `disc.count.count_outcomes` enumerar resultados es vaciar la bolsa; en `geom.area.area_by_random_darts` se estima un área tirando dardos, y en `adv.num.monte_carlo_pi` el mismo juego estima π; en `adv.stoch.random_walk` cada tirada mueve un caminante.

**Desvanecimiento.** `physical_draws`: bolitas que salen y se acumulan en montones. `tally_bars`: barras de conteo. `fraction_of_total`: `3 de 10`. `probability_notation`: `P(rojo) = 3/10`, luego `P(A | B)`.

### gears_sequence

**El jugador** gira una manivela y una ficha avanza por un camino, siempre lo mismo por vuelta. Puede girar hacia atrás, enganchar un engranaje para que otra ficha avance a otro ritmo, y contar vueltas.

**Invariante:** `same_step_every_turn`. Sobre ese paso uniforme se construyen el desplazamiento, la sucesión, la iteración y la inducción.

**Reúso.** Es la recta numérica (nodo 2) y la suma como desplazamiento (nodo 3): sumar 5 es dar cinco vueltas. Girar hacia atrás es restar (nodo 4) y seguir hacia atrás pasa por el cero (nodo 7). Enganchar un engranaje 1:3 es multiplicar (nodo 5). En `alg.fn.exponential_growth` un engranaje que duplica la distancia en cada vuelta corre contra uno que suma; en `alg.fn.logarithm` la pregunta es al revés: cuántas vueltas para llegar a 1000. Cruces: en `disc.mod.clock_arithmetic` un engranaje de 12 dientes es la aritmética módulo 12, sin metáfora; en `disc.ind.domino_induction` cada engranaje hace girar al siguiente y basta con el primero; en `calc1.deriv.rules_as_structure` la regla de la cadena es la relación de un tren de engranajes; en `linalg.vec.vector_as_displacement` hay dos manivelas, una por eje, y un vector es cuántas vueltas de cada una; en `adv.dyn.iterated_map_fixed_point` se gira hasta que la ficha deja de moverse.

**Desvanecimiento.** `crank_track`: manivela y camino sin marcas. `numbered_track`: el camino se gradúa y es la recta numérica. `rule_card`: una tarjeta muestra el paso (`+5 por vuelta`, `×2 por vuelta`). `recurrence_notation`: `aₙ₊₁ = aₙ + 5`, y n vueltas se escriben `5n`.

### sorter

**El jugador** arrastra cada objeto al cajón que le corresponde según una regla, o adivina la regla mirando adónde cae cada objeto. Los cajones pueden estar anidados, ordenados en un riel o cruzados en una grilla de dos criterios.

**Invariante:** `every_object_exactly_one_bin`. Es la definición de partición y, en el riel, la de orden.

**Reúso.** En `found.sort.by_attribute` se separa por color o forma; en `found.cmp.bigger_smaller` se ordena en el riel. En `arith.div.remainder_classes` los números se reparten por resto y aparece el módulo sin nombrarlo. En `alg.fn.function_as_machine` el sorter muestra por qué una máquina es función: cada entrada cae en un solo cajón. Cruces: en `geom.class.quadrilateral_hierarchy` los cajones anidados son la jerarquía (todo cuadrado es rectángulo); en `prob.cond.conditional_and_independence` la grilla de dos criterios es la tabla de contingencia y condicionar es mirar una sola fila, lo que hace de Bayes una consecuencia de clasificar; en `adv.grp.cosets_partition` el sorter es el teorema de que una equivalencia parte al conjunto.

**Desvanecimiento.** `picture_bins`: cajones con una imagen de lo que va adentro. `labeled_bins`: un ícono de la propiedad. `rule_card`: la regla escrita corta (`par`, `x > 3`) con voz. `set_notation`: `{x | x > 3}`, `A ∩ B`, `P(A | B)`.

### construct

**El jugador** trabaja sobre una figura que ya está dibujada: une dos puntos con una línea, prolonga un lado, baja una perpendicular desde un punto hasta una recta, marca dos ángulos o dos segmentos como iguales, y con un toque sostenido levanta una copia de una parte de la figura para girarla o reflejarla sobre otra. Cada trazo hace aparecer algo que antes no se veía: un triángulo rectángulo escondido dentro de un trapecio, dos triángulos que resultan semejantes, una longitud que ahora se puede calcular. En los niveles más bajos el gesto es unir dos puntos y doblar la figura por la mitad.

**Invariante:** `construction_reveals_not_changes`. La construcción no toca la figura: ninguna medida cambia, ningún lado se mueve. Solo revela relaciones que ya estaban. El jugador lo comprueba borrando la línea auxiliar y viendo que el dato descubierto sigue valiendo.

**Reúso.** Es la mecánica de la rama de geometría y trigonometría de la espina (nodos 38 a 44) y la central del nivel de desafío de [S](../S-desafios/S0-desafios.md): una figura compuesta donde falta una longitud, se traza una altura, aparece un triángulo rectángulo, Pitágoras, y recién entonces el área. Empieza antes de toda geometría: en `found.shape.fold_in_half` un niño dobla una figura por la mitad y descubre que las dos partes coinciden. En `geom.area.rect_and_triangle` bajar la altura muestra que el triángulo es la mitad de un rectángulo, y desde ahí las baldosas hacen el resto; en `geom.angle.turn_as_measure` prolongar un lado revela el ángulo exterior como lo que falta para completar el giro; en `geom.sim.similarity_as_scale` trazar una paralela a un lado recorta un triángulo semejante al original; en `geom.tri.pythagoras_as_tiles` la altura sobre la hipotenusa parte el triángulo en dos copias más chicas de sí mismo. Su nodo principal es `geom.cons.auxiliary_lines`, donde lo que se aprende no es un teorema sino a elegir qué línea trazar. En `geom.circle.radius_bisects_chord` bajar la perpendicular desde el centro parte la cuerda por la mitad. En trigonometría es la misma mano: en `trig.circle.unit_circle_radians` se traza el radio y se baja la altura desde su extremo, en `trig.fn.sine_as_height` esa altura es el seno y su pie es el coseno, y en `trig.id.pythagorean_identity` la identidad es Pitágoras sobre ese mismo triángulo, una construcción antes que una fórmula. Cruces: en `linalg.vec.projection_as_shadow` proyectar un vector sobre otro es bajar la perpendicular y leer la sombra, y en `linalg.map.determinant_as_area` el determinante es el área del paralelogramo construido sobre las columnas; en `calc1.deriv.tangent_line` la secante se traza entre dos puntos de la gráfica y la tangente es adonde llega cuando se juntan, y en `calc1.opt.inscribed_rectangle` optimizar es construir el rectángulo inscripto y moverlo hasta que sea el más grande; en `disc.proof.chain_of_constructions` una demostración es una cadena de construcciones donde cada trazo se justifica con el anterior, y en `disc.ind.domino_induction` el paso inductivo es agregar una pieza más a la figura y ver que la relación se conserva; en `adv.cx.multiplication_rotates_scales` multiplicar por un complejo es levantar una copia del vector, girarla y estirarla.

**Desvanecimiento.** `fold_paper`: la figura es una hoja que se dobla y se despliega, y el pliegue queda marcado. `draw_line_on_figure`: el jugador traza la línea con el dedo, la figura la conserva y aparecen las marcas de ángulo recto y de segmentos iguales. `name_relation`: cada marca recibe un nombre corto con voz (`altura`, `mismo ángulo`, `mitad`). `symbolic_chain`: los datos descubiertos se encadenan como igualdades (`AB = BC`, `h² + b² = c²`) con la figura al lado. `proof_sketch`: la cadena se ordena en pasos donde cada uno cita al anterior, la figura se atenúa y queda el esbozo de una demostración.

## Funciones como llaves

La mecánica `chest_key` sostiene una teoría visual que atraviesa el curriculum: **toda transformación reversible tiene una llave, y la llave es otra transformación**. Esta sección la desarrolla en el orden en que la vive el jugador. Las misconceptions asociadas (`wrong_inverse`, ramas perdidas, dominio ignorado) están en [L](../L-modelo-errores/L0-taxonomia.md).

### La primera llave: sumar y restar

El cofre muestra la acción que se aplicó a lo que había adentro. El diagrama vertical es siempre el mismo:

```
    x
    ↓ +5
  x + 5
```

La llave se dibuja como la misma flecha subiendo:

```
  x + 5
    ↓ −5
    x
```

El jugador no elige `−5` por una tabla de opuestos: la elige porque es la única llave que, dibujada debajo, devuelve `x` solo. Si arrastra `+5` otra vez, el cofre muestra `x + 10`; si arrastra `−3`, muestra `x + 2`. El error se explica por replay sobre la misma mecánica, nunca con un mensaje.

### La segunda llave: multiplicar y dividir

El mismo diagrama con `×5` arriba y `÷5` como llave. Acá aparece la primera pregunta incómoda: ¿hay un candado `×0`? El jugador lo prueba, ve que todos los cofres quedan iguales después de aplicarlo, y descubre que ese candado no tiene llave porque destruye la información. Es la primera vez que una llave no existe, y prepara las dos que siguen.

### La tercera llave: elevar al cuadrado y raíz

```
    x
    ↓ x²
   x²
```

El candado `x²` tiene un problema nuevo: dos cofres distintos, `3` y `−3`, producen el mismo `9`. La llave `√` abre el cofre pero adentro aparecen dos cosas. Por eso `alg.fn.quadratic_and_sqrt` depende de la llave y de las baldosas a la vez: las baldosas muestran que `x² = 9` es un cuadrado de área 9, y la llave muestra que hay dos lados posibles. En `grid_stretch` la recta se pliega por la mitad al elevar al cuadrado, y `√` solo puede desplegar una mitad: hay que elegir cuál. El juego nunca dice "raíz principal": muestra las dos ramas y deja que el contexto elimine una. Lo mismo vuelve en `trig.inv.arcsin_two_branches` con infinitas ramas.

### La cuarta llave: exponencial y logaritmo

```
    x
    ↓ eˣ
   eˣ
```

La llave es `ln`, y trae el segundo problema nuevo: el candado `eˣ` solo produce cofres positivos. Si el jugador intenta aplicar `ln` a un cofre que contiene `−2`, la llave no entra en la cerradura. Es la primera vez que una llave existe pero no sirve para todos los cofres: el dominio. En `gears_sequence` la misma idea es "cuántas vueltas de un engranaje que duplica hacen falta para llegar acá", y ninguna cantidad de vueltas lleva a un negativo.

### La llave se vuelve función

Hasta acá la llave es una operación. En el nodo 21 el jugador descubre que la llave se puede meter en una máquina: si `f` hace `x → 2x + 3`, la máquina llave `f⁻¹` hace `y → (y − 3) / 2`, y encadenarlas en `machine_pipe` devuelve lo que entró. El diagrama vertical se vuelve horizontal (dos máquinas en serie) y luego gráfico: la máquina llave es la reflexión de la original sobre la diagonal `y = x`. Por eso el nodo 21 necesita la llave (12), la composición (20) y el gráfico (18): tres caras de la misma idea.

### Segundo regreso: la matriz inversa

En el nodo 33 el cofre es una cuadrícula deformada y la llave es la deformación que la devuelve. `A⁻¹` no es una fórmula: es la llave de `A`. Las dos preguntas incómodas vuelven exactas: hay deformaciones sin llave (las que aplastan la cuadrícula a una línea, como el candado `×0`) y resolver un sistema es abrir un cofre. La balanza sostiene la otra mitad: aplicar `A⁻¹` a los dos lados.

### Tercer regreso: el teorema fundamental

En el nodo 29 el jugador llega con dos mecánicas separadas: el caminante que mide cuestas y el balde que acumula. El teorema es un cofre cuyo candado es "medir la cuesta" y cuya llave es "acumular". No se demuestra en esta capa: se descubre viendo que la velocidad de llenado es la cuesta del nivel. La arista 29 ← 12 en la [espina](../C-knowledge-graph/spine.yaml) existe para que el juego pueda decir, con el mismo dibujo vertical de la primera llave, "esto ya lo hiciste con +5".

```
   F(x)
    ↓ d/dx
   F'(x)
    ↓ ∫
   F(x) + C
```

El `+ C` es la pregunta incómoda de esta llave: derivar destruye la altura inicial del balde, igual que `x²` destruye el signo. La llave devuelve una familia de cofres y hace falta un dato más para elegir uno.

### Qué sostiene la teoría

Cuatro propiedades se repiten en cada regreso y son las que el juego evalúa como transferencia: (1) la llave devuelve lo original; (2) con varios candados se abre de afuera hacia adentro; (3) algunas cerraduras no tienen llave porque destruyen información; (4) algunas llaves solo entran en algunos cofres. Quien las señala en `csmath.crypto.caesar_shift` sin que nadie le haya dicho que el cifrado César tiene que ver con restar, entendió la idea.

## Tabla de reuso mecánica × área

Derivada de `reused_by` en [`mechanics.yaml`](mechanics.yaml). Una marca indica que al menos un nodo del área usa la mecánica. Se regenera con el validador cuando exista el grafo completo.

| Mecánica | found | arith | prealg | alg | geom | trig | precalc | calc1 | calc2 | mvcalc | linalg | prob | disc | graph | csmath | adv | Áreas |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---:|
| balance | ● | | ● | ● | | ● | | | | | ● | ● | ● | | | ● | 8 |
| chest_key | | ● | ● | ● | ● | ● | | ● | ● | | ● | ● | ● | | ● | ● | 12 |
| machine_pipe | ● | ● | ● | ● | | ● | ● | ● | | ● | ● | ● | ● | | ● | ● | 13 |
| ledger | ● | ● | ● | ● | | | | | | | ● | ● | ● | | | ● | 8 |
| tiles | | ● | | ● | ● | ● | | ● | | ● | ● | ● | ● | | | | 9 |
| slope_walker | | ● | ● | ● | ● | ● | ● | ● | ● | ● | | ● | | | ● | ● | 12 |
| fill_accumulate | ● | ● | ● | | ● | | ● | ● | ● | ● | | ● | ● | | ● | ● | 12 |
| grid_stretch | | ● | | ● | ● | ● | | ● | ● | ● | ● | ● | | | ● | ● | 11 |
| network_routes | ● | ● | | ● | ● | | | | | | ● | ● | ● | ● | ● | ● | 10 |
| urn_dice | ● | ● | | | ● | | | | | | | ● | ● | | ● | ● | 7 |
| gears_sequence | ● | ● | ● | ● | | ● | ● | ● | | | ● | | ● | | ● | ● | 11 |
| sorter | ● | ● | | ● | ● | ● | ● | ● | | | ● | ● | ● | | ● | ● | 12 |
| construct | ● | | | | ● | ● | | ● | | | ● | | ● | | | ● | 7 |

Lectura vertical: `found` es alcanzada por nueve mecánicas, así que un jugador de nivel 0 ya conoce la mayoría de las manos que va a necesitar después. Lectura horizontal: ninguna mecánica baja de siete áreas, muy por encima del mínimo de tres. `graph` es la única área servida por una sola mecánica, y es deliberado: el área entera es la mecánica.

## Consideraciones de edad universal

Las trece mecánicas declaran `literacy_min: none`. No es una aspiración sino una restricción que cada minijuego de [F](../F-minijuegos/F0-principios.md) respeta en su primera capa y que [Q](../Q-edad-universal.md) detalla.

- **Instrucción por demostración.** La primera vez que aparece una mecánica, el juego ejecuta el gesto con una mano fantasma y devuelve el control. No hay texto de tutorial. La primera etapa de `fade_steps` de cada mecánica es siempre de objetos concretos, para que la demostración se entienda sin leer.
- **Sin escritura.** Ningún gesto del catálogo es escribir. Las etapas simbólicas se manipulan con fichas arrastrables (el teclado de fichas de [N](../N-ux-ui.md)). La primera regla escrita (`rule_card`) va acompañada de voz y del objeto al lado.
- **Targets grandes y drop tolerante.** Los cinco gestos permitidos (`drag`, `tap`, `pinch`, `scrub`, `hold`) se eligieron porque una mano de cinco años los ejecuta con precisión baja. Los tamaños mínimos son tokens de [N](../N-ux-ui.md); ninguna mecánica depende de precisión fina en su capa concreta, y `pinch` (solo en `tiles` y `grid_stretch`) tiene siempre una alternativa de `drag` por manija.
- **Ítems de evidencia dentro de la mecánica.** Un ítem `explain` para quien no lee se resuelve eligiendo entre animaciones ("¿cuál de estas balanzas queda derecha?"), nunca entre frases; un ítem `apply` es abrir el cofre o llenar el balde hasta la marca. Así el diagnóstico de [J](../J-adaptativo.md) tiene una rama completa sin lectura.
- **Misma piel para todas las edades.** No hay versión infantil de la balanza. Objetos concretos y símbolos se dibujan con el mismo lenguaje ([N](../N-ux-ui.md)), para que el morph entre etapas sea un cambio de forma del mismo objeto y no un reemplazo de pantalla.
- **Sin cuenta regresiva.** Ninguna mecánica muestra un timer en su capa concreta. La dimensión Speed se mide según [K](../K-evaluacion.md) pero no se exhibe.

## Qué no vive acá

Este catálogo no fija umbrales de mastery ni tiempos objetivo: esas constantes viven únicamente en [K](../K-evaluacion.md). Tampoco nombra clases de ManimGL: cada `manim_family` se resuelve en escenas concretas en [I](../I-manim/I0-mapping.md) y [`scenes.yaml`](../I-manim/scenes.yaml). Y no describe minijuegos: un minijuego es una mecánica con una piel, un desafío y un nodo, y su documento es [F](../F-minijuegos/F0-principios.md).
