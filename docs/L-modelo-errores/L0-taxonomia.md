# L0 — Taxonomía de errores

Este documento explica el modelo de errores de Mathy. Los datos viven en dos archivos: [`misconceptions.yaml`](misconceptions.yaml), la lista abierta de misconceptions con sus reglas de detección, y [`explanation_patterns.yaml`](explanation_patterns.yaml), los siete patrones de explicación dinámica. Los textos que el jugador escucha están en [`../locales/es/misconceptions.yaml`](../locales/es/misconceptions.yaml). Las mecánicas sobre las que corren las explicaciones se describen en [E0](../E-mecanicas/E0-catalogo.md). Las constantes del modelo de mastery, incluida la que decide cuándo un error bloquea un nodo, viven solo en [K](../K-evaluacion.md).

## Los errores son datos

Un error no es un fallo del jugador. Es la evidencia más precisa que el juego tiene sobre qué modelo mental está usando. Un acierto dice poco: pudo ser comprensión, memoria o suerte. Un error sistemático dice qué regla aplicó la persona, y esa regla es casi siempre razonable, solo que aplicada fuera de su dominio de validez.

Por eso cada misconception se define por una regla ejecutable, `detect`, que produce la respuesta errónea a partir del estado correcto. La regla tiene dos usos. Primero, genera distractores: cuando el juego arma un ítem, ejecuta las reglas del nodo y obtiene las opciones equivocadas más probables, no opciones al azar. Segundo, clasifica: cuando el jugador hace un movimiento que no es equivalente al esperado, el juego ejecuta las mismas reglas y busca cuál reproduce lo que el jugador hizo. Si una coincide, el juego sabe qué pensó la persona y responde a eso.

Cada misconception mapea a exactamente un patrón de explicación y a exactamente una mecánica. Una misconception con dos explicaciones posibles está mal delimitada y conviene partirla. Una explicación que no corre sobre una mecánica es texto, y el texto no es la forma en que Mathy explica.

## Nunca "incorrecto"

Mathy no dice "incorrecto". No es cortesía: es que la palabra no informa nada. El jugador ya sospecha que algo salió mal y la palabra no le dice qué. Lo que el juego hace es mostrar qué hizo realmente el movimiento.

El ejemplo canónico es `x + 5 = 12`. Si el jugador resta 3 a ambos lados, el juego muestra `x + 2 = 9` y pregunta qué transformación falta. No hay error: `x + 2 = 9` es una ecuación válida y equivalente, y el jugador sigue desde ahí. Si en cambio resta 3 solo del lado izquierdo, la balanza se inclina. El juego no borra el movimiento: lo reproduce sobre la balanza, deja ver el desequilibrio y devuelve el control con la balanza inclinada para que el jugador la nivele.

La idea general es que **el alumno continúa desde su estado real**. Si ese estado sigue siendo un objeto matemático válido (una ecuación, una expresión, una figura), el juego reabre la interacción desde ahí. Si el estado no es un objeto sino una afirmación falsa (que `log(a+b) = log a + log b`, que `AB = BA`), no hay desde dónde continuar: el juego muestra un contraejemplo y reinicia el ítem. El campo `reopens_interaction` de cada patrón codifica esta diferencia.

## Las siete categorías

Las categorías no describen el síntoma sino el tipo de regla que el jugador aplicó. Sirven para agrupar en el perfil, priorizar remediación en el selector diario ([J](../J-adaptativo.md)) y orientar la minería de errores nuevos.

**sign.** La regla correcta se aplica con la orientación invertida. Ejemplo: `sign_flip_on_move`, pasar `+5` al otro lado como `+5`. El jugador sabe que hay que mover el término; no tiene que mover equivale a aplicar la inversa a ambos lados. También `negative_times_negative` e `integral_ignores_sign`: el objeto está bien elegido y solo falla el sentido.

**wrong_inverse.** La llave elegida no corresponde a la cerradura. Ejemplo: `wrong_inverse_choice`, restar 3 en `3x = 12`. El jugador entiende que hay que deshacer algo y hacerlo a ambos lados; confunde qué operación deshace a cuál. `sqrt_loses_negative_branch` entra aquí: la llave es correcta pero abre dos cofres y el jugador solo ve uno.

**precedence.** El orden de las operaciones está invertido. Ejemplo: `unwrap_order_inverted`, dividir por 2 antes de restar 3 en `2x + 3 = 11`. La expresión es un árbol de capas y el jugador abrió una capa interior sin quitar la exterior. Cada llave individual es correcta; falla la secuencia.

**conceptual.** El significado de un objeto o una relación está mal construido. Ejemplo: `equals_as_operator`, leer `8 + 4 = _ + 5` como "8 + 4 da 12". No hay procedimiento que corregir: `=` significa "las dos cosas pesan lo mismo" y el jugador lo lee como "el resultado va acá". `limit_as_reaching`, `conditional_reversed`, `equiprobable_assumed` y `converse_assumed` son del mismo tipo: la operación se ejecuta bien sobre un objeto entendido mal.

**procedural.** Un algoritmo se aplica incompleto o con un paso cambiado. Ejemplo: `fraction_add_across`, sumar `1/2 + 1/3` como `2/5`. La intención es correcta (juntar dos cantidades) pero falta el paso que hace comparables las piezas. `inverse_applied_one_side` y `chain_rule_missing_inner` son procedimientos a los que les falta una mitad.

**notation.** El símbolo se lee como otra cosa. Ejemplo: `variable_as_label`, tratar `x` como "la etiqueta de las manzanas" y sumar `2x + 3y = 5xy`. La matemática subyacente puede estar bien; falla el mapeo entre símbolo y cantidad. `path_vs_walk_confusion` es del mismo tipo.

**invalid_property.** Se asume que una operación conserva una estructura que no conserva, casi siempre la linealidad. Ejemplo: `distribute_over_wrong_op`, `(a + b)² = a² + b²`. Es la categoría más regular: `log_of_sum`, `sin_of_sum_distributes`, `derivative_of_product_as_product`, `matrix_multiplication_commutes` y `modulus_of_sum_adds` son todas "la operación se reparte sobre la suma" o "el orden no importa". Por eso comparten patrones: un contraejemplo con deslizador o una pieza que falta.

Decisión sobre `sin_of_sum_distributes`: es una entrada aparte y no una instancia de `distribute_over_wrong_op`. La regla es de la misma familia, pero el nodo, la mecánica y el patrón cambian. Las baldosas muestran el pedazo que falta en `(a + b)²` y no pueden mostrar nada sobre `sin(a + b)`. Como cada misconception mapea a una sola mecánica, la familia se parte por mecánica.

## Cómo funciona `detect`

### Notación de detect

Cada regla es un objeto con `from`, `to`, `correct` y opcionalmente `guard`.

- `from`: patrón del estado de entrada, el objeto válido sobre el que el jugador actúa.
- `to`: lo que produce la regla errónea. Puede ser una lista cuando el error tiene varias formas superficiales (`inverse_applied_one_side` produce `x = b` o `x + a = b - a` según el lado).
- `correct`: lo que produce la regla correcta. El generador de distractores nunca ofrece algo equivalente a `correct`.
- `guard`: condición sobre los metavariables que restringe cuándo la regla tiene sentido (`a > 0`, `s > h`).

`detect` puede ser una lista de reglas cuando la misma idea errónea aparece en varios contextos sintácticos (`exponent_rules_mixed` tiene una regla para `a^m · a^n` y otra para `(a^m)^n`). Cualquier coincidencia clasifica.

Los patrones usan una notación compacta que el build de contenido traduce a MathJSON:

| Metavariable | Significa |
|---|---|
| `a b c d k m n` | constantes numéricas |
| `x y` | incógnitas |
| `f g` | funciones; `f'` su derivada |
| `A B` | matrices |
| `z w` | complejos o vectores |
| `E F` | eventos; `Omega` el espacio muestral |
| `p q` | proposiciones |
| `u v` | vértices |
| `L` | el valor del límite |

Operadores: `+ - * / ^`, `sqrt()`, `log()`, `sin() cos()`, `|.|`, `d/dx[.]`, `int[a,b] .`, `lim[x->a] .`, `sum[n] a_n`, `P(E | F)`, `mod`, `->` para implicación. La barra `|` entre dos ecuaciones en `correct` significa "o" (dos ramas). Cuando `to` no es una expresión sino una conclusión (`converges`, `undefined`, `causes(X, Y)`), se usa un token de un vocabulario cerrado que el motor de pasos reconoce.

### Generación de distractores

Al instanciar un ítem, el juego toma las misconceptions del nodo y las de sus prerequisitos directos, reemplaza los metavariables con los valores del ítem y ejecuta cada regla `from → to`. Los resultados son los distractores. Se descartan los equivalentes a `correct` (pasa con `exponent_rules_mixed` cuando `m = n = 2`, porque `2 + 2 = 2 · 2`) y los duplicados. Si faltan distractores, se completan con perturbaciones numéricas marcadas como "sin misconception" para que no cuenten como evidencia.

En un ítem `apply` para `x + 5 = 12` esto produce tres opciones etiquetadas por dentro: `x = 7` (correcta), `x = 17` (`sign_flip_on_move`) y `x + 5 = 7` (`inverse_applied_one_side`). El jugador nunca ve las etiquetas; el juego sí, y cada elección es un dato.

### Clasificación del movimiento

Cuando el jugador hace un movimiento libre (arrastra una operación, abre un cofre, coloca baldosas), el motor de pasos ([O](../O-arquitectura-tecnica.md)) verifica equivalencia con el estado esperado. Si no es equivalente, corre el clasificador:

1. Se arma el **vecindario conceptual** del nodo activo: sus misconceptions, las de sus prerequisitos directos y las de los nodos que lo tienen como prerequisito. Suelen ser de tres a ocho reglas.
2. Se ejecutan las reglas sobre el estado previo real del jugador, no sobre el enunciado original, porque puede haber hecho movimientos válidos antes del erróneo.
3. Cada resultado se compara **canónicamente** con el del jugador, con la misma cadena de equivalencia del motor: forma canónica, simplificación de la diferencia y muestreo numérico como último recurso.
4. Si una regla coincide, se emite el evento con esa misconception y confianza alta. Si coinciden varias (ocurre con valores pequeños), se emite la de mayor severidad y las otras quedan como candidatas.
5. Si ninguna coincide, se aplica el **fallback por diff estructural**: se computa la diferencia entre el árbol previo y el árbol resultante, se elige la misconception del vecindario cuya regla tenga la forma más parecida y se emite con confianza baja. Los eventos de confianza baja alimentan la minería de errores pero no cuentan para el bloqueo de `ready`.

Se usa el vecindario y no toda la taxonomía por costo y por precisión: dos reglas de áreas distintas pueden producir el mismo número en un ítem concreto, y solo el contexto del nodo dice cuál es plausible.

## Los siete patrones de explicación dinámica

Un patrón es una secuencia de pasos abstractos que corre sobre una mecánica. Los pasos no tienen texto; tienen animación. El único texto es el prompt final, narrado. Cada patrón declara con qué mecánicas puede ejecutarse y el validador exige que la mecánica de cada misconception esté en esa lista.

### replay_on_mechanic

El patrón base. El juego congela el estado del jugador, reproduce su movimiento sobre la mecánica, deja que el invariante se rompa a la vista, resalta la diferencia y devuelve el control.

Ejemplo con `inverse_applied_one_side` sobre la balanza. La balanza muestra `x + 5` a la izquierda y `12` a la derecha, nivelada. El jugador arrastra `-3` solo al plato izquierdo. El juego detiene todo y repite el gesto en cámara lenta: tres unidades salen del plato izquierdo. El plato izquierdo sube, el derecho baja, el fiel queda inclinado. Un halo marca el plato derecho, que no fue tocado. La voz pregunta: "Restaste 3 solo de un lado. ¿Qué le falta al otro?". La balanza sigue inclinada con `x + 2` y `12`, y el jugador puede arrastrar `-3` al plato derecho. Cuando lo hace, la balanza se nivela en `x + 2 = 9` y la sesión continúa desde ahí.

El mismo patrón sirve para `variable_as_label` sobre el libro de cuentas (dos columnas de frutas que no se funden en una), para `integral_ignores_sign` sobre el tanque (el agua bajo la línea vacía en lugar de llenar) y para `path_vs_walk_confusion` sobre la red (el nodo repetido se enciende dos veces).

### key_mismatch

Para errores de llave. El juego muestra la forma de la cerradura, prueba la llave del jugador, muestra que no entra, revela la silueta de la que sí entra y devuelve el control con el cofre cerrado.

Ejemplo con `wrong_inverse_choice`. El cofre dice `3x = 12` y la cerradura tiene forma de `×3`. El jugador arrastra la llave `-3`. La llave se acerca, gira un cuarto de vuelta y se traba. La cerradura brilla con su forma y al lado aparece la silueta hueca de la llave que la deshace, sin decir cuál es. La voz pregunta: "Esa llave no abre este cofre. ¿Qué operación deshace multiplicar por 3?". El llavero completo sigue disponible.

### tree_unwrap

Para errores de orden. El juego dibuja la expresión como cajas anidadas, anima el orden en que el jugador las abrió, muestra la caja que intentó abrir mientras seguía envuelta, resalta la capa más externa y devuelve el control.

Ejemplo con `unwrap_order_inverted`. `2x + 3 = 11` aparece como una caja `+3` que envuelve una caja `×2` que envuelve a `x`. El jugador aplicó `÷2` primero. La llave `÷2` intenta llegar a la caja interior atravesando la caja `+3`, que sigue cerrada, y rebota. La caja exterior late. La voz pregunta: "La capa de afuera es sumar 3. ¿Cuál abrimos primero?". La ecuación real del jugador se conserva: si su movimiento produjo `x + 3 = 5.5`, eso es lo que hay en pantalla, y sigue siendo válido.

Con `chain_rule_missing_inner` el patrón corre sobre engranajes: `f(g(x))` son dos ruedas encadenadas y el jugador midió la velocidad de la exterior sin contar la relación de la interior.

### missing_piece_tiles

Para errores de área o de estructura aditiva. El juego coloca las baldosas que corresponden a la respuesta del jugador, superpone la forma verdadera, hace brillar la pieza que falta o sobra, y devuelve el control para que el jugador la arrastre.

Ejemplo con `distribute_over_wrong_op`. El ítem pide el área de un cuadrado de lado `a + b` y el jugador responde `a² + b²`. El juego coloca un cuadrado `a × a` y otro `b × b` en esquinas opuestas de un marco de lado `a + b`. Quedan dos rectángulos vacíos, `a × b` cada uno, que parpadean. La voz pregunta: "Al cuadrado le falta un pedazo. ¿Qué rectángulos faltan?". Las baldosas `a × b` están en la bandeja. Al completar el hueco, la expresión al costado pasa de `a² + b²` a `a² + 2ab + b²` con un morph, no con un reemplazo.

`derivative_of_product_as_product` usa el mismo patrón: el rectángulo `f × g` crece por dos lados y la cuenta del jugador solo incluye la esquina `f'g'`, la pieza más chica de las tres. `fraction_add_across` y `area_uses_slant_side` también terminan en una pieza que falta o sobra.

### counterexample_slider

Para propiedades inválidas. El juego enuncia la regla del jugador como dos máquinas o dos lecturas en paralelo, pone un deslizador al parámetro, lo barre hasta que los dos lados se separan, congela ahí y pregunta. No reabre desde el estado erróneo, porque no hay estado: hay una afirmación falsa.

Ejemplo con `log_of_sum`. Dos tuberías. La de arriba recibe `a + b` y pasa por una máquina `log`. La de abajo recibe `a` y `b` por separado, cada uno pasa por `log` y las salidas se suman. Un deslizador controla `a` y `b`. El juego arranca donde las salidas se parecen y desliza hasta un par donde la brecha es grande; las salidas se dibujan como barras. La voz pregunta: "Con 10 y 100 las dos máquinas dan distinto. ¿Coinciden para algún par?". El deslizador queda en manos del jugador para que busque.

Con `exponent_rules_mixed` sobre engranajes el barrido es más interesante: en `m = n = 2` las dos ruedas coinciden, y el prompt pide moverlas para ver que dejan de coincidir. Con `limit_as_reaching` sobre el caminante, el deslizador es la posición y lo que se ve es que el punto está vacío mientras la lectura converge.

### two_paths_diverge

Para errores de orden y de dirección en objetos que no conmutan. El juego parte el estado inicial en dos copias, ejecuta un camino en cada una, las muestra lado a lado y compara los puntos de llegada.

Ejemplo con `matrix_multiplication_commutes` sobre la grilla. Un cuadrado con una figura adentro, duplicado. En la copia izquierda la grilla rota 90 grados y luego se cizalla. En la derecha se cizalla y luego rota. Las dos animaciones corren en paralelo. Al terminar, las figuras no coinciden: una está inclinada hacia un lado y la otra hacia el otro. El objetivo del ítem aparece entre ambas. La voz pregunta: "Rotar y luego cizallar no termina donde cizallar y luego rotar. ¿Cuál pide el objetivo?".

`conditional_reversed` usa este patrón sobre la urna: restringir a las bolas rojas y contar las grandes no es lo mismo que restringir a las grandes y contar las rojas. `converse_assumed` lo usa sobre el clasificador: ordenar por `p` y verificar `q` pasa todo; ordenar por `q` y verificar `p` deja objetos afuera.

### double_flip

Para errores de signo y de rama. El juego muestra un primer giro, un segundo giro y compara dónde se aterriza. Sirve para "dos inversiones se anulan" y para "dos puntos de partida aterrizan en el mismo lugar".

Ejemplo con `negative_times_negative` sobre el caminante. El caminante está en el origen mirando a la derecha. Multiplicar por `-2` es darse vuelta y dar dos pasos: mira a la izquierda y avanza. Multiplicar por `-3` es darse vuelta otra vez: ahora mira a la derecha y avanza tres veces la distancia. Termina a la derecha del origen. La respuesta del jugador, `-6`, aparece como una bandera a la izquierda, donde habría terminado con un solo giro. La voz pregunta: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".

Con `sqrt_loses_negative_branch` sobre los cofres, el segundo giro es el espejo: `3` y `-3` son dos cofres que la llave `elevar al cuadrado` lleva al mismo `9`, y al volver, la llave `raíz` abre los dos.

## Tabla completa de misconceptions

Las 19 iniciales del plan más 9 que cubren áreas sin cobertura. `detect` se muestra abreviado como `from → to`; el archivo tiene además `correct` y `guard`.

| id | categoría | nodos | detect | patrón / mecánica |
|---|---|---|---|---|
| `sign_flip_on_move` | sign | alg.eq.one_step, alg.eq.multi_step | `x + a = b → x = b + a` | replay_on_mechanic / balance |
| `negative_times_negative` | sign | arith.int.negatives, arith.mul.scaling | `(-a)(-b) → -(ab)` | double_flip / slope_walker |
| `integral_ignores_sign` | sign | calc1.int.accumulation, calc1.ftc.integral_undoes_derivative | `∫f → ∫|f|` | replay_on_mechanic / fill_accumulate |
| `wrong_inverse_choice` | wrong_inverse | alg.eq.one_step, prealg.inv.operation_as_key | `ax = b → x = b - a` | key_mismatch / chest_key |
| `sqrt_loses_negative_branch` | wrong_inverse | alg.fn.quadratic_and_sqrt, alg.fn.inverse_function | `x² = a → x = √a` | double_flip / chest_key |
| `unwrap_order_inverted` | precedence | alg.eq.multi_step, arith.expr.precedence_tree | `ax + b = c → x = c/a - b` | tree_unwrap / chest_key |
| `equals_as_operator` | conceptual | prealg.eq.balance, arith.add.displacement | `a + b = y + c → y = a + b` | replay_on_mechanic / balance |
| `limit_as_reaching` | conceptual | precalc.lim.approach | `lim f → f(a) o indefinido` | counterexample_slider / slope_walker |
| `conditional_reversed` | conceptual | prob.cond.conditional_and_independence | `P(E|F) → P(F|E)` | two_paths_diverge / urn_dice |
| `equiprobable_assumed` | conceptual | prob.basic.probability_as_proportion, prob.rv.expectation_as_weighted_average | `P(E) → |E| / |Ω|` | counterexample_slider / urn_dice |
| `series_terms_to_zero_implies_converges` | conceptual | calc2.ser.terms_vs_sum | `aₙ → 0 ⇒ converge` | counterexample_slider / fill_accumulate |
| `converse_assumed` | conceptual | disc.logic.if_then_direction | `p → q ⇒ q → p` | two_paths_diverge / sorter |
| `correlation_implies_causation` | conceptual | prob.stat.correlation_vs_cause | `corr alta ⇒ causa` | two_paths_diverge / network_routes |
| `independent_means_disjoint` | conceptual | prob.cond.conditional_and_independence | `P(E ∧ F) → 0` | replay_on_mechanic / urn_dice |
| `inverse_applied_one_side` | procedural | alg.eq.one_step, prealg.eq.balance | `x + a = b → x = b` | replay_on_mechanic / balance |
| `fraction_add_across` | procedural | arith.frac.parts_and_ratio, arith.frac.common_unit | `a/b + c/d → (a+c)/(b+d)` | missing_piece_tiles / tiles |
| `exponent_rules_mixed` | procedural | alg.pow.same_base_stack, alg.fn.exponential_growth | `aᵐ·aⁿ → aᵐⁿ` | counterexample_slider / gears_sequence |
| `chain_rule_missing_inner` | procedural | calc1.deriv.rules_as_structure, alg.fn.composition | `(f∘g)' → f'(g(x))` | tree_unwrap / gears_sequence |
| `area_uses_slant_side` | procedural | geom.area.shear_invariant, geom.area.rect_and_triangle | `área → b·s` | missing_piece_tiles / tiles |
| `modular_negative_remainder` | procedural | csmath.mod.wraparound | `(-a) mod n → -(a mod n)` | replay_on_mechanic / gears_sequence |
| `variable_as_label` | notation | prealg.var.unknown_as_box, alg.expr.distributive_tiles | `ax + by → (a+b)xy` | replay_on_mechanic / ledger |
| `path_vs_walk_confusion` | notation | graph.walk.repeat_rules, graph.basic.graph_and_paths | `camino → recorrido con repetición` | replay_on_mechanic / network_routes |
| `distribute_over_wrong_op` | invalid_property | alg.expr.distributive_tiles, alg.fn.quadratic_and_sqrt | `(a+b)² → a² + b²` | missing_piece_tiles / tiles |
| `log_of_sum` | invalid_property | alg.fn.logarithm | `log(a+b) → log a + log b` | counterexample_slider / machine_pipe |
| `derivative_of_product_as_product` | invalid_property | calc1.deriv.rules_as_structure | `(fg)' → f'g'` | missing_piece_tiles / tiles |
| `matrix_multiplication_commutes` | invalid_property | linalg.map.linear_transformation_2d, linalg.map.compose_as_multiply | `AB → BA` | two_paths_diverge / grid_stretch |
| `sin_of_sum_distributes` | invalid_property | trig.id.angle_sum, trig.circle.unit_circle_radians | `sin(a+b) → sin a + sin b` | counterexample_slider / machine_pipe |
| `modulus_of_sum_adds` | invalid_property | adv.cplx.plane_and_modulus, linalg.vec.vector_as_displacement | `|z+w| → |z| + |w|` | counterexample_slider / slope_walker |

Los nodos que no están en [`spine.yaml`](../C-knowledge-graph/spine.yaml) siguen la convención `area.cluster.slug` de [C0](../C-knowledge-graph/C0-esquema.md) y deben existir en `graph/` cuando se escriba cada área; el validador falla si una misconception referencia un nodo inexistente.

## Severidad y bloqueo de `ready`

Cada misconception declara `severity` de 1 a 3. La escala mide cuánto compromete el nodo, no cuán frecuente es el error:

- **1**: desliz local. El concepto está; falla una convención. Se remedia con un ítem más.
- **2**: error estructural. Afecta cómo se ejecuta el concepto pero no su invariante central. Merece remediación en el selector diario cuando se repite.
- **3**: rompe el invariante central del nodo. Alguien con `inverse_applied_one_side` activa no entiende la balanza, y todo lo que se construya encima va a fallar. Prioridad máxima en la remediación.

El bloqueo de `ready` es una regla única, no por misconception: una misconception que aparece con confianza alta más de un número dado de veces dentro de la ventana de ítems recientes impide que el nodo pase a `ready`, sin importar las dimensiones de mastery. El número y la ventana son constantes de [K](../K-evaluacion.md). El bloque `defaults` de `misconceptions.yaml` los replica una sola vez como valor por defecto (tres ocurrencias en los últimos diez ítems) para que el archivo sea autocontenido; ninguna entrada individual repite el número. Si alguna misconception necesita un umbral distinto, lo declara con `blocks_ready_after`; hoy ninguna lo hace. La severidad no cambia el umbral: cambia la prioridad con la que el selector programa la remediación y el peso que el diagnóstico ([J](../J-adaptativo.md)) le da para retroceder en la espina.

El bloqueo no es un castigo: garantiza que `ready`, el único estado que cuenta como prerequisito, signifique que el invariante del nodo está en su lugar. Un nodo bloqueado no re-bloquea hacia atrás y el jugador sigue pudiendo jugarlo.

## Cómo crece la taxonomía

La lista es abierta. Las 28 entradas actuales son las que la bibliografía y la experiencia docente señalan como más frecuentes, pero el juego produce evidencia propia desde el primer día y esa evidencia tiene que volver a este archivo.

El mecanismo es la **minería de estados erróneos reales**. Cada movimiento no equivalente que el clasificador no atribuye con confianza alta queda registrado con el estado previo, el resultado y el nodo. Los eventos se agrupan por diff estructural y por nodo; un grupo numeroso con una forma de diff consistente es una misconception candidata. Escribir la entrada implica nombrar la idea en el id, asignar categoría, escribir la regla `detect` que reproduce el diff y elegir patrón y mecánica. Si no se puede escribir la regla, no es una misconception: es ruido, o son dos mezcladas.

Tres reglas para agregar entradas:

1. Una misconception nueva no puede solaparse con una existente en el mismo nodo: si dos reglas producen el mismo resultado sobre el mismo `from`, hay que fusionarlas o distinguirlas con un `guard`.
2. Toda entrada llega con sus dos claves de locale en `es`; el validador exige que existan.
3. Patrón y mecánica tienen que ser compatibles según `explanation_patterns.yaml`. Si ningún patrón sirve, el problema es del patrón, y agregar uno nuevo es una decisión de diseño que se documenta aquí.

Las reglas existentes se revisan con dos métricas del event log: distractores que nadie elige (el error no existe en la población) y clasificaciones con confianza baja (la regla está mal delimitada).

## Consideraciones de edad universal

Una persona de seis años y un adulto ven la misma explicación. Lo que lo hace posible es que **la animación es la explicación**: la balanza que se inclina, la llave que no entra, la pieza que parpadea. No hay texto que leer para entender qué pasó. El único texto es el prompt final, narrado por voz en el locale activo ([P](../P-internacionalizacion.md)), escrito para escucharse, en quince palabras o menos, con los valores del ítem ya reemplazados.

Cada patrón declara `literacy_min`. Cinco de los siete funcionan con `literacy: none`. `tree_unwrap` y `counterexample_slider` piden `icons`, porque leer una jerarquía de cajas o un deslizador con dos valores requiere reconocer etiquetas de una palabra. Una misconception no puede activarse en un nodo cuyo `literacy` sea menor que el `literacy_min` de su patrón; el validador lo comprueba. Así, los nodos de nivel 0 y 1 solo tienen misconceptions con patrones de `none`, coherente con [Q](../Q-edad-universal.md).

Las respuestas al prompt tampoco son texto. En nodos con `literacy: none` el prompt se responde manipulando (nivelar la balanza, arrastrar la pieza) o eligiendo entre animaciones, nunca entre frases. Cuando el patrón reabre la interacción, la manipulación es la respuesta. Cuando no la reabre, el ítem se reinicia y el jugador vuelve a intentar con lo que vio.

Por último, el ritmo. Una explicación dura lo que dura su animación y nunca interrumpe con una pantalla modal. El jugador puede tocar para saltar el replay a partir de la segunda vez que ve la misma misconception; el evento se registra igual.

## La mecánica de la explicación no siempre es la del nodo

Cada misconception declara una mecánica: aquella sobre la que su explicación se ve mejor. `inverse_applied_one_side` se explica en la balanza porque ahí la igualdad se rompe a la vista; `negative_times_negative` se explica en la malla estirada porque ahí dar vuelta dos veces devuelve la orientación original.

Esa mecánica no tiene por qué estar entre las que declara el nodo donde el error aparece. Un jugador puede cometer `log_of_sum` en un nodo de entropía que se juega con urnas, y la explicación correcta sigue siendo la tubería que convierte productos en sumas. La regla es:

1. Si el nodo declara la mecánica de la misconception, la explicación corre ahí.
2. Si no la declara pero el jugador ya la conoce (la mecánica aparece en algún nodo suyo en `ready`), la explicación corre igual en esa mecánica, presentada como un regreso: "esto ya lo viste con las tuberías".
3. Si el jugador todavía no conoce esa mecánica, el patrón corre sobre la mecánica principal del nodo, conservando el mismo invariante. Es el caso de `equals_as_operator` en un nodo de nivel 1, donde la balanza aún no existe: la cadena de igualdades se muestra sobre la pista, con el mismo mensaje.

El validador emite un aviso, no un error, cuando la mecánica de la misconception no está entre las del nodo. El aviso sirve para revisar que el caso 2 o el 3 estén contemplados en el archivo del minijuego, no para forzar que coincidan.
