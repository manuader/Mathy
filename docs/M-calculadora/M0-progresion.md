# M0. Calculadora evolutiva

La calculadora de Mathy empieza vacía. No tiene teclas grises esperando: tiene siluetas. Cada vez que un nodo del grafo llega a `ready`, una silueta se vuelve tecla, y esa tecla ejecuta desde ese momento y para siempre lo que el jugador acaba de aprender a hacer con las manos. Este documento define qué es la calculadora, cuándo crece, cómo se organiza, qué hace en cada uno de sus dos modos y qué no hace nunca. Los datos viven en [`calculator_ops.yaml`](calculator_ops.yaml); las etiquetas y pistas, en [`locales/es/calculator.yaml`](../locales/es/calculator.yaml). Las constantes numéricas no se repiten acá: están en [K](../K-evaluacion.md).

## 1. Cuatro roles en un solo objeto

**Herramienta.** Es una calculadora de verdad. Suma, deriva, invierte matrices, corre una búsqueda en un grafo. Cuando un desafío de [S](../S-desafios/S0-desafios.md) pide multiplicar dos números de tres cifras, el jugador no tiene que hacerlo a mano si ya demostró que sabe. La calculadora es la promesa de que el juego no vuelve a exigir lo que ya está probado.

**Recompensa.** Mathy no tiene monedas ni rachas ([N](../N-ux-ui.md)). Lo que el jugador gana al dominar un concepto es capacidad: una tecla nueva. La tecla es visible, es útil y no se pierde. Es el mismo principio que ilumina territorio en el mapa, aplicado a la mano.

**Espejo de la cheatsheet.** La cheatsheet ([R0](../R-cheatsheet/R0-cheatsheet.md)) y la calculadora se abren desde el mismo lugar y crecen con los mismos nodos, pero hacen cosas distintas: **la cheatsheet recuerda, la calculadora ejecuta.** La cheatsheet guarda la fórmula del área del trapecio y la estrategia "si falta un dato, trazá la altura"; la calculadora calcula el área cuando le dan las medidas. Una entrada de cheatsheet puede tener una tecla asociada y una tecla puede señalar su entrada, y el jugador pasa de una a la otra con un toque. La cheatsheet además lista teoremas y estrategias que ninguna tecla puede ejecutar.

**Sandbox.** Es el espacio para probar sin objetivo. Qué pasa si aplico la raíz a un negativo. Qué pasa si compongo una función con su inversa. Qué pasa si multiplico una matriz por su determinante cero. El sandbox es donde el jugador hace las preguntas que el selector de [J](../J-adaptativo.md) no le hizo, y es el último slot de toda sesión.

## 2. La regla de desbloqueo

Cada operación de `calculator_ops.yaml` declara `unlocked_by`: una lista de nodos del grafo. **La operación se habilita cuando cualquiera de esos nodos llega al estado `ready`** definido en [K](../K-evaluacion.md). No hace falta que lleguen todos; alcanza con uno. Es la regla `unlock_rule: any_ready` del archivo.

La lista es larga en muchas operaciones porque cuatro autores del grafo declararon la misma capacidad desde nodos distintos: `arith.add.displacement` habilita la suma, y `arith.place.base_ten_carry` y `arith.int.add_signed` también la declaran porque la extienden a varias cifras y a números con signo. El jugador no ve tres teclas: ve una, y la ve desde el primer nodo. Lo que la extensión agrega no es una tecla nueva sino **fichas nuevas**: hasta que `arith.int.negatives` no está en `ready`, no existe la ficha de número negativo, y la tecla de sumar no tiene con qué sumar negativos. Esa es la contención real de la calculadora: **una operación solo actúa sobre lo que el jugador puede construir**, y lo que puede construir también son operaciones desbloqueadas (`op_neg`, `op_frac`, `op_decimal`, `op_variable`, `op_define_function`, `op_complex`, los constructores de matriz y de grafo).

Tres consecuencias de la regla, todas heredadas de [K](../K-evaluacion.md):

- **Nunca se revoca.** Si el nodo que habilitó la tecla pasa a `decayed`, la tecla sigue funcionando. `never_revoked: true`.
- **Óxido.** Cuando todos los nodos de `unlocked_by` de una operación están en `decayed`, la tecla se dibuja con la misma textura de óxido del mapa (`rust_when: all_unlockers_decayed`). Tocarla la ejecuta igual y ofrece un repaso del nodo. El óxido no castiga: invita. Basta con que uno de los nodos vuelva a `ready` para que la tecla se limpie.
- **Solo `ready` cuenta.** `in_progress` no habilita nada, aunque el jugador haya acertado varias veces. La puerta de confianza de K existe para que una racha afortunada no regale una tecla.

El estado `ready` provisional del diagnóstico ([J](../J-adaptativo.md)) sí habilita operaciones. Un adulto que entra sabiendo derivar tiene la tecla de derivar en la primera sesión. Si el repaso silencioso lo baja a `in_progress`, la tecla queda: la regla de no revocar no distingue el origen del `ready`.

## 3. Tiers

Las operaciones se agrupan en filas de la calculadora. Un tier no es un nivel del curriculum y no se desbloquea en bloque: es la fila donde una tecla aparece cuando su nodo llega a `ready`. Los tiers ordenan la pantalla, no el aprendizaje. Aun así, el primer nodo de cada tier marca cuándo la fila deja de ser toda siluetas.

| Tier | Qué contiene | Operaciones | Primer nodo que lo abre |
|---|---|---|---|
| `t0` | las cuatro operaciones y los números | contar, `+`, `−`, `×`, `÷`, resto, opuesto, paréntesis, comparar, fracción, aritmética de fracciones, coma decimal, porcentaje, razón, unidades, primos, llave | `found.count.cardinality` (nivel 0) |
| `t1` | potencias, raíces y medida | `xⁿ`, `√`, notación científica, Pitágoras, distancia, área, perímetro, círculo, volumen, ángulo, girar y reflejar | `geom.angle.turn_as_measure` (nivel 1) |
| `t2` | exponencial y logaritmo | `eˣ`, `ln`, `log` | `alg.fn.exponential_growth` (nivel 3) |
| `t3` | álgebra y funciones | `x`, evaluar, simplificar, expandir, factorizar, resolver lineal, cuadrática, sistema, inecuación, `f(x) =`, `f ∘ g`, `f⁻¹`, `|x|`, pendiente, graficar, mover el gráfico, `aₙ`, `Σ` | `prealg.var.unknown_as_box` (nivel 2) |
| `t4` | trigonometría | `sen cos tg`, arco funciones, círculo unitario, arco y sector, identidades, resolver triángulo, polares | `trig.ratio.similar_shadows` (nivel 3) |
| `t5` | límites, derivadas e integrales | `lím`, `d/dx`, tangente, `∫ₐᵇ`, `∫ + C`, área y volumen por integral, `∇`, jacobiano, máximos y mínimos, `∬`, integrales de campo, `div rot` | `precalc.lim.approach` (nivel 4) |
| `t6` | vectores y matrices | suma de vectores, largo, producto escalar, `A v`, `A B`, `det`, `A⁻¹`, filas, cambio de base, autovalores, SVD, programación lineal | `precalc.vec.arrow_2d_intro` (nivel 4) |
| `t7` | complejos, series, ecuaciones diferenciales y análisis | `a + bi`, forma polar, campo de pendientes, resolver EDO, Fourier, Fourier inversa, Taylor, convergencia | `precalc.cplx.plane_intro` (nivel 4) |
| `t_disc` | lógica, conjuntos, modular, combinatoria, grafos, algoritmos y estructuras | tabla de verdad, `∀ ∃`, `∪ ∩`, relaciones, inverso modular, César, `C(n,k)`, contar casos, recurrencia, grafo, buscar, `V − E + F`, colorear, flujo, binario, algoritmo, grupo, cuerpo, abierto | `graph.basic.graph_and_paths` (nivel 1) |
| `t_prob` | probabilidad y estadística | `P(A)`, `P(A\|B)`, Bayes, distribución, `E[X]`, `Var`, promedio, recta de regresión, muestra, simular, bits | `prob.basic.probability_as_proportion` (nivel 6) |

Dos filas se abren temprano y crecen despacio. `t_disc` tiene una tecla desde el nivel 1, porque los grafos como islas y puentes son parte del mundo de un niño, y las otras dieciocho llegan a lo largo de años. `t3` se abre con la caja `x` en el nivel 2, mucho antes de que exista una función. En la pantalla, una fila con una sola tecla y muchas siluetas es exactamente lo que queremos que el jugador vea: la herramienta tiene lugar para crecer.

## 4. Cada tecla nace con su llave al lado

La teoría de "funciones como llaves" de [E0](../E-mecanicas/E0-catalogo.md) dice que toda transformación reversible tiene una llave, y que la llave es otra transformación. La calculadora la hace visible en el layout: **cuando una operación se habilita, el espacio de su llave inversa está al lado**, aunque todavía sea silueta. La tabla `tiers[].pairs` de `calculator_ops.yaml` declara los pares.

| Candado | Llave | Qué pregunta incómoda trae |
|---|---|---|
| `+` | `−` | ninguna: la primera llave abre siempre |
| `×` | `÷` | `×0` no tiene llave |
| `xⁿ` | `√` | dos cofres dan el mismo `9` |
| `eˣ` | `ln` | la llave no entra en cofres negativos |
| `f(x)` | `f⁻¹` | no toda máquina tiene máquina llave |
| expandir | factorizar | el rectángulo se corta y se vuelve a armar |
| `sen cos tg` | `arcsen arccos arctg` | infinitas ramas |
| `d/dx` | `∫ + C` | derivar borra la altura inicial |
| `A v` | `A⁻¹` | `det = 0` aplasta la cuadrícula |
| campo de pendientes | resolver la EDO | la solución es una familia |
| `𝓕` | `𝓕⁻¹` | ida y vuelta entre señal y ondas |
| `P(A\|B)` | Bayes | dar vuelta la condición |

Cuando el jugador toca la silueta de una llave todavía cerrada, la calculadora no dice "bloqueado": muestra el nodo del mapa que la abre. Cuando toca el candado y la llave ya existe, el resultado aparece con la llave sugerida al lado, en el mismo diagrama vertical de [E0](../E-mecanicas/E0-catalogo.md): lo que entró, la flecha de la operación, lo que salió, y una flecha de vuelta que se puede tocar.

La tecla `llave` (`op_inverse_op`, de `prealg.inv.operation_as_key`) es la versión general: aplicada sobre la última operación, muestra su inversa. Es la única tecla que vive solo en modo operar, porque necesita una operación previa sobre la cual actuar.

## 5. Dos modos: operar y sandbox

**Operar.** Una expresión, una transformación, un resultado. La expresión es un objeto tocable, como en cualquier actividad ([N](../N-ux-ui.md), sección 3.6). El jugador la arma con el teclado de fichas, elige una tecla y ve el resultado. La traza de la transformación se muestra con el vocabulario del `StepEngine` de [O](../O-arquitectura-tecnica.md): `ApplyBothSides`, `Distribute`, `Differentiate`. Cada paso de la traza corresponde a un nodo; los pasos cuyo nodo no está en `ready` se colapsan en un solo salto sin detalle. Así la calculadora resuelve lo que el jugador ya demostró y no explica lo que todavía no jugó (sección 9).

**Sandbox.** El teclado de fichas completo, sin objetivo, con todas las operaciones habilitadas que tengan `sandbox: true`. En las capas `formal` y `abstract` de nodos con `literacy: full_text` aparece además el teclado de texto libre ([Q](../Q-edad-universal.md)). Es el único lugar del juego donde el jugador escribe matemática con un teclado.

El sandbox también sirve para practicar. Cuando el jugador quiere trabajar un nodo por su cuenta, el sandbox puede abrir un **target**: una expresión o un valor al que llegar. La validación es la de [O](../O-arquitectura-tecnica.md): **equivalente a algún target aceptado**, por la cadena canónico, diferencia simplificada, muestreo numérico. No se valida por pasos. Un camino distinto al esperado es válido; un rodeo válido no se penaliza. Cuando el motor devuelve `Undecidable`, el sandbox abre el mismo deslizador de contraejemplos que las actividades, y el evento no cuenta como evidencia.

**Qué cuenta y qué no.** El sandbox alimenta Familiarity y no alimenta Application. Usar una operación en el sandbox registra un ítem `recognize` sobre el nodo que la habilitó, con las mismas reglas de EWMA y puerta de confianza de [K](../K-evaluacion.md). No registra `manipulate` ni `apply`, porque no hay tarea que cumplir ni tiempo que medir: un jugador puede derivar cien funciones en el sandbox y su A no se mueve. Un target alcanzado en el sandbox tampoco cuenta como `apply`: cuenta como `recognize` del nodo del target. La razón es que el sandbox no controla la dificultad ni el distractor, y K exige que la evidencia de A y S venga de ítems diseñados. Lo que el sandbox sí hace es despertar: si un jugador vuelve varias veces a jugar con una tecla oxidada, el selector de [J](../J-adaptativo.md) lo lee como señal para proponer el repaso.

## 6. La calculadora como objeto de la gramática visual

Una calculadora convencional muestra dígitos. La de Mathy muestra transformaciones, porque toda la matemática del juego se dibuja con las doce primitivas de [H](../H-progresion-abstraccion.md): entrada, transformación, salida.

Cada tecla declara `kind` e `input_kind`, y con eso el mini-Manim de [O](../O-arquitectura-tecnica.md) sabe cómo animar el resultado. Aplicar `×5` a un segmento lo escala (`scale`). Aplicar `+5` lo desplaza (`displace`). Aplicar `x²` a una fila de puntos equiespaciados la curva (`nonlinear`). Aplicar `d/dx` muestra al caminante midiendo la cuesta (`rate`); aplicar `∫` muestra el balde llenándose (`accumulate`). Aplicar una matriz deforma la cuadrícula (`deform`); aplicar `∪` parte y junta regiones (`partition`). Un `P(A)` tira la urna (`random`).

La expresión de entrada es un `MathTree` con ids, y el resultado es otro `MathTree`. Entre los dos corre `TransformMatchingIds`: el `5` que se restó a ambos lados se mueve, el `x` queda quieto, lo que se canceló se desvanece. No hay pantalla que se reemplace. Es la regla del morph de [N](../N-ux-ui.md) aplicada al único lugar del juego donde el jugador elige la transformación en vez de recibirla.

Cuando el jugador toca el resultado, se abre la traza. Cuando toca la tecla, se abre la entrada de cheatsheet que la explica. Cuando toca la silueta, se abre el mapa en el nodo que la habilita. Los tres gestos son toques; ninguno es un menú.

## 7. Notación por locale

La calculadora no dibuja texto. Dibuja `MathJSON` a través del `MathLocale` de [P](../P-internacionalizacion.md). Un jugador en Buenos Aires ve `sen`, `tg` y `3,14`; uno en Boston ve `sin`, `tan` y `3.14`; uno en Berlín ve `2340 : 12`. El campo `display` de `calculator_ops.yaml` es la forma abstracta; la forma concreta la decide el `MathLocale` al dibujar.

`locale_dependent: true` marca las operaciones cuyo símbolo o nombre cambia con el `MathLocale`, más allá del separador decimal que afecta a todo número: `×` frente a `·`, `÷` frente a `:`, `sen` frente a `sin`, `log` con base diez o natural, la notación de intervalos en las inecuaciones, las unidades en la conversión. El corpus de verificación de [P](../P-internacionalizacion.md) incluye cada una de estas operaciones con su render esperado por locale.

Las etiquetas de los botones son claves de locale (`calculator.<op>.label`) y siguen la convención del locale de UI, no del `MathLocale`. Por eso el archivo `es` escribe `sen cos tg` en la etiqueta: es lo que un docente argentino esperaría leer en el botón. Una familia que use interfaz en español y notación `en-US` verá la etiqueta en español y `sin` en la expresión. Es una tensión aceptada: la etiqueta es UI, la expresión es matemática.

## 8. Edad universal

Un niño de cinco años abre la calculadora y ve la tecla `contar` y la tecla `+`. Nada más, y nada que no pueda usar ([Q](../Q-edad-universal.md)).

- **Teclado de fichas.** La entrada se arma arrastrando fichas de número y de operación. No hay teclado de texto en modo operar, en ningún nivel. El teclado de texto libre aparece solo en el sandbox y solo cuando el jugador tiene un nodo con capa `formal` o `abstract` y `literacy: full_text`. Un adulto que sabe escribir `x^2 + 3x` lo tipea ahí; el resto del juego lo arrastra.
- **Targets grandes.** Las teclas miden 56 pt en niveles 0 a 2 y 48 pt después, con el radio de drop de [N](../N-ux-ui.md). Una fila tiene cuatro teclas, no seis.
- **Voz en las pistas.** Cada tecla tiene un `hint` narrable. En perfiles sin lectura, tocar y sostener una tecla la lee en voz alta: "Resta: vuelve atrás en la pista. Es la llave de sumar." Es la misma clave de locale con voz, y un locale sin voz para esas claves no es publicable ([P](../P-internacionalizacion.md)).
- **Sin cuenta regresiva.** El sandbox no mide velocidad. El modo operar tampoco. La dimensión S de [K](../K-evaluacion.md) solo se alimenta de actividades.
- **La primera calculadora es la pista.** Antes de `arith.add.displacement`, la tecla `contar` muestra la pista de números y el caminante. Sumar es la primera transformación que la calculadora anima, y la anima exactamente como la mecánica donde se aprendió.

## 9. Qué no es

**No es Wolfram.** No resuelve por el jugador lo que el jugador no jugó. Si el nodo de la regla de la cadena no está en `ready`, la tecla `d/dx` sigue derivando `sen(x²)`, porque la tecla existe desde `rate_as_slope_limit`, pero la traza muestra un solo salto sin nombre. El paso que el jugador no desbloqueó no se enseña desde la calculadora. La cheatsheet tampoco lo tiene, porque nunca lo vio. Lo que hay es la silueta y el nodo que la abre.

**No muestra pasos que el jugador no desbloqueó.** La traza de una operación es un subconjunto de los movimientos del `StepEngine`, filtrado por los nodos en `ready`. Esto es deliberado: una calculadora que explica todo convierte cada actividad en copiar.

**No es un tutor.** No corrige, no propone, no interrumpe. Si el jugador aplica `ln` a un negativo, la llave no entra y la animación lo muestra; no hay mensaje. Si compone `f` con algo que no es `f⁻¹`, la máquina devuelve otra cosa y se ve. El error se explica por replay, como en toda mecánica de [E0](../E-mecanicas/E0-catalogo.md).

**No tiene modo "ver la solución".** Ese modo existe en los desafíos de [S](../S-desafios/S0-desafios.md), con su costo en K. La calculadora no lo replica.

**No sale del dispositivo.** Lo que se escribe en el sandbox no se guarda como texto y no se envía a ningún lado ([Q](../Q-edad-universal.md), privacidad). Solo se registran los eventos de aprendizaje: qué operación, qué nodo, qué verbo.

## 10. Cómo se consolidaron las operaciones

El grafo declaró 351 ids `op_*` en `calc_unlocks`, escritos por cuatro lotes de autores en paralelo. Muchos eran sinónimos y muchos otros eran la misma tecla vista desde nodos distintos. `calculator_ops.yaml` los reduce a **118 operaciones canónicas**, y cada uno de los 351 ids aparece exactamente una vez, como `id` o dentro de `aliases`. El validador reescribe los `calc_unlocks` del grafo a los ids canónicos con esa tabla.

Los criterios, en orden:

1. **Una tecla, no una fórmula.** Si dos ids producen el mismo tipo de resultado con el mismo tipo de entrada, son una sola operación. `op_area_rectangle`, `op_area_triangle`, `op_area_trapezoid` y `op_composite_area` son `op_area`. La tecla calcula el área de la figura que se le da.
2. **La entrada contiene la fuga.** Cuando fusionar dos ids habilitaría un cálculo antes de jugarlo, se confía en que el objeto de entrada no existe todavía. `op_add_signed` es `op_add` porque no hay ficha negativa antes de `op_neg`. `op_matrix_vector_3d` es `op_matrix_vector` porque no hay constructor de matriz 3×3 antes del nodo que lo enseña.
3. **Se separa cuando la idea es nueva.** `op_frac_arith` no se fusiona con `op_add` porque sumar fracciones sí exige una idea nueva (la unidad común) y las fichas de fracción ya existen desde `op_frac`. `op_antiderivative` no se fusiona con `op_integral` porque la primitiva simbólica es otra llave, no otra forma de acumular.
4. **La traza colapsa lo que no está en `ready`.** Donde la fusión es inevitable y la fuga es de pasos, no de resultados (regla del producto, del cociente y de la cadena dentro de `op_derivative`; técnicas de integración dentro de `op_antiderivative`), la regla de la sección 9 la contiene: el resultado aparece, el paso no.
5. **Un nodo, sus ops.** Cuando un solo nodo declaraba varios ids del mismo tipo (`op_rotate_point_90` y `op_reflect_point_axis`, `op_gcd_lcm` y `op_prime_factor`, `op_degrees_to_radians` y `op_point_on_unit_circle`), se fusionaron.
6. **El nombre más claro gana.** Cuando un id existente cubría la familia (`op_mod`, `op_percent`, `op_expand`, `op_sigma_sum`, `op_plot`), se conservó. Cuando ninguno la cubría, se creó uno (`op_trig`, `op_arc_trig`, `op_graph_properties`, `op_inference`).

Casos que conviene conocer:

- `op_sin_cos_tan_of_angle` (de `trig.ratio.similar_shadows`) se absorbió en `op_trig`, que reúne `sen`, `cos` y `tg` en una sola operación con tres teclas. `op_arc_trig` hace lo mismo con las tres arco funciones y absorbe `op_angle_from_slope`, que es `arctg` con otro nombre.
- `op_arc_length` tenía dos nodos de mundos distintos: el arco de un círculo (`geom.circle.radius_and_arc`) y el largo de una curva paramétrica (`calc2.parpol.parametric_speed`). Se absorbió en `op_circle`. La curva paramétrica como entrada no existe antes de `op_plot` con `precalc.param.time_as_hidden_input`, así que la fuga está contenida por la entrada.
- `op_plot` reúne todo lo que dibuja: funciones, cónicas, ondas, curvas paramétricas, campos vectoriales y mapas complejos, además de marcar puntos de giro y críticos. Es una sola tecla porque "graficar" es un solo gesto; lo que cambia es el objeto que se le da.
- `op_equals` se absorbió en `op_compare` porque `=`, `<` y `>` son la misma balanza con tres resultados. `op_variable` queda aparte porque construye, no compara.
- `op_gradient_step` (descenso por gradiente) se absorbió en `op_gradient`; `op_least_squares` en `op_regression_line`; `op_sup_inf_of_set` en `op_set_ops`; `op_adjacency_matrix` en `op_graph_properties`. En cada caso el resultado es del mismo tipo que el de la operación que lo absorbe.
- `op_caesar` conserva codificar y decodificar en una sola tecla con signo: la llave de `+k` es `−k`, y la tecla lo muestra.
- `op_inverse_op` es la única operación con `sandbox: false` por diseño; `op_proof_check` y `op_topology_check` también lo son porque verifican una afirmación contra un target y no producen un objeto nuevo.

## 11. Verificación

- `calculator_ops.yaml` carga con `yaml.safe_load`; todo op tiene los nueve campos; `kind` e `input_kind` están en sus enums.
- Cada uno de los 351 ids declarados en el grafo aparece exactamente una vez, como `id` o como alias. Ningún alias aparece en dos ops.
- Todo nodo de `unlocked_by` existe en `docs/C-knowledge-graph/graph/*.yaml`, y `unlocked_by` es exactamente el conjunto de nodos que declaraban el op o alguno de sus aliases. El validador del grafo reescribe `calc_unlocks` a ids canónicos y falla si un nodo referencia un id que no es canónico ni alias.
- Todo op tiene `calculator.<op>.label` y `calculator.<op>.hint` en `es`; las etiquetas no superan doce caracteres; las pistas no contienen la palabra "incorrecto".
- Todo par de `tiers[].pairs` referencia dos ops existentes.
- Corpus de `MathLocale`: cada op con `locale_dependent: true` tiene un render esperado por cada `MathLocale` publicado.
- Ningún campo del YAML contiene texto visible; el test de [P](../P-internacionalizacion.md) lo recorre.

## 12. Tabla completa de operaciones

Generada desde `calculator_ops.yaml`. Columnas: id, tier, nodos que la desbloquean (cualquiera en `ready` la habilita), display.

| id | tier | nodos que la desbloquean | display |
|---|---|---|---|
| `op_count` | `t0` | `found.count.cardinality`, `found.count.number_line` | `1, 2, 3, \ldots` |
| `op_add` | `t0` | `arith.add.displacement`, `arith.place.base_ten_carry`, `arith.int.add_signed` | `a + b` |
| `op_sub` | `t0` | `arith.sub.undo_add`, `arith.place.base_ten_carry` | `a - b` |
| `op_mul` | `t0` | `arith.mul.scaling`, `arith.mul.rows_and_columns`, `arith.mul.partial_products`, `arith.int.mul_signed`, `prealg.int.sign_rules` | `a \times b` |
| `op_div` | `t0` | `arith.div.undo_mul` | `a \div b` |
| `op_mod` | `t0` | `arith.div.remainder`, `arith.num.divisible_or_not`, `disc.mod.clock_equivalence`, `csmath.mod.wraparound` | `a \bmod n` |
| `op_neg` | `t0` | `arith.int.negatives` | `-a` |
| `op_paren` | `t0` | `arith.expr.precedence_tree` | `(\,\cdot\,)` |
| `op_compare` | `t0` | `prealg.eq.balance`, `prealg.ineq.compare_expressions` | `=, <, >` |
| `op_frac` | `t0` | `arith.frac.parts_and_ratio`, `arith.frac.equivalent` | `\frac{a}{b}` |
| `op_frac_arith` | `t0` | `arith.frac.common_unit`, `arith.frac.multiply` | `\frac{a}{b} \pm \frac{c}{d}, \; \frac{a}{b} \cdot \frac{c}{d}` |
| `op_decimal` | `t0` | `arith.dec.tenths_as_place` | `0{,}1` |
| `op_percent` | `t0` | `arith.pct.percent_of_total`, `prealg.pct.hundredths`, `prealg.pct.percent_fill` | `a\,\%` |
| `op_ratio` | `t0` | `arith.rate.per_unit`, `prealg.ratio.rate_per_unit`, `prealg.ratio.scaling_recipe` | `a : b = c : x` |
| `op_unit_convert` | `t0` | `arith.meas.unit_conversion` | `\mathrm{m} \to \mathrm{cm}` |
| `op_prime_factor` | `t0` | `arith.num.factor_tree` | `n = p_1^{a_1} p_2^{a_2} \cdots` |
| `op_inverse_op` | `t0` | `prealg.inv.operation_as_key` | `\circlearrowleft` |
| `op_pow` | `t1` | `arith.pow.repeated_scaling`, `alg.pow.same_base_stack` | `x^{n}` |
| `op_sqrt` | `t1` | `alg.fn.quadratic_and_sqrt`, `alg.rad.root_as_fractional_power` | `\sqrt{x}, \; \sqrt[n]{x}` |
| `op_sci_notation` | `t1` | `prealg.exp.powers_of_ten` | `a \times 10^{n}` |
| `op_pythagoras` | `t1` | `geom.tri.pythagoras_as_tiles`, `geom.circle.radius_bisects_chord` | `a^2 + b^2 = c^2` |
| `op_distance` | `t1` | `geom.coord.distance_as_pythagoras` | `d(P, Q), \; M_{PQ}` |
| `op_area` | `t1` | `geom.area.rect_and_triangle`, `geom.area.shear_invariant`, `geom.area.trapezoid_as_two_triangles`, `geom.cons.auxiliary_lines` | `A = b \cdot h` |
| `op_perimeter` | `t1` | `geom.area.perimeter_vs_area` | `P = \sum \ell_i` |
| `op_circle` | `t1` | `geom.area.circle_by_slices`, `geom.circle.radius_and_arc`, `calc2.parpol.parametric_speed` | `\pi, \; 2\pi r, \; \pi r^2` |
| `op_volume` | `t1` | `geom.solid.volume_as_layers`, `geom.solid.cone_sphere_by_pouring` | `V = A_{base} \cdot h` |
| `op_angle` | `t1` | `geom.angle.turn_as_measure`, `geom.angle.triangle_sum_half_turn` | `\angle, \; 180^{\circ}` |
| `op_transform_point` | `t1` | `geom.trans.rotation_reflection`, `geom.trans.dilation`, `geom.sim.similarity_as_scale` | `P \mapsto P'` |
| `op_exp` | `t2` | `alg.fn.exponential_growth`, `precalc.exp.natural_base` | `e^{x}, \; a^{x}` |
| `op_ln` | `t2` | `precalc.exp.natural_base` | `\ln x` |
| `op_log` | `t2` | `alg.fn.logarithm`, `alg.pow.log_rules_from_stack` | `\log_{b} x` |
| `op_variable` | `t3` | `prealg.var.unknown_as_box` | `x` |
| `op_evaluate_expr` | `t3` | `prealg.expr.substitute_value`, `mvcalc.fn.two_inputs_one_output` | `f(a), \; f(a, b)` |
| `op_simplify` | `t3` | `prealg.expr.like_terms`, `alg.poly.coefficients_as_counts`, `alg.rat.division_by_zero_hole` | `\simeq` |
| `op_expand` | `t3` | `alg.expr.distributive_tiles`, `alg.expr.binomial_product`, `precalc.binom.pascal_triangle_expansion` | `a(b + c) \to ab + ac` |
| `op_factor` | `t3` | `alg.expr.factor_common`, `alg.expr.factor_trinomial` | `ab + ac \to a(b + c)` |
| `op_solve_linear` | `t3` | `alg.eq.one_step`, `alg.eq.multi_step` | `x = \ldots` |
| `op_solve_quadratic` | `t3` | `alg.fn.quadratic_and_sqrt`, `alg.eq.quadratic_roots` | `x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}` |
| `op_solve_system` | `t3` | `alg.sys.two_by_two`, `linalg.map.inverse_and_systems` | `\begin{cases} \ldots \end{cases}` |
| `op_solve_inequality` | `t3` | `alg.ineq.inequality_tilts`, `alg.ineq.inequality_as_region` | `x \in [a, b)` |
| `op_define_function` | `t3` | `prealg.fn.input_output_table`, `alg.fn.function_as_machine`, `precalc.fn.piecewise_machine` | `f(x) = \ldots` |
| `op_compose` | `t3` | `alg.fn.composition` | `f \circ g` |
| `op_inverse_function` | `t3` | `alg.fn.inverse_function` | `f^{-1}` |
| `op_abs` | `t3` | `alg.abs.distance_two_branches` | `\|x\|` |
| `op_slope` | `t3` | `geom.line.parallel_same_slope`, `alg.fn.linear_slope` | `m = \frac{\Delta y}{\Delta x}` |
| `op_plot` | `t3` | `alg.fn.graph_as_picture`, `precalc.fn.increasing_decreasing`, `calc1.apply.max_where_slope_zero`, `precalc.conic.slice_of_cone`, `trig.fn.wave_unrolls_circle`, `precalc.param.time_as_hidden_input`, `mvcalc.field.arrow_at_every_point`, `adv.cplx.function_deforms_plane` | `Plot(f)` |
| `op_transform_graph` | `t3` | `precalc.fntr.shift_as_displace`, `precalc.fntr.stretch_as_scale`, `precalc.fntr.reflect_and_symmetry`, `trig.fn.transform_wave` | `a\,f(b(x - h)) + k` |
| `op_nth_term` | `t3` | `precalc.seq.arithmetic_sequence`, `precalc.seq.geometric_sequence` | `a_n` |
| `op_sigma_sum` | `t3` | `precalc.seq.arithmetic_sequence`, `precalc.seq.geometric_sequence`, `precalc.seq.sum_as_pattern`, `disc.sum.sigma_notation`, `calc2.ser.geometric_sum`, `calc2.ser.partial_sums` | `\sum_{k=1}^{n} a_k` |
| `op_trig` | `t4` | `trig.ratio.similar_shadows`, `trig.fn.sine_as_height`, `trig.fn.tangent_as_slope` | `\sin x, \; \cos x, \; \tan x` |
| `op_arc_trig` | `t4` | `trig.inv.arcsin_two_branches`, `trig.fn.tangent_as_slope` | `\arcsin x, \; \arccos x, \; \arctan x` |
| `op_unit_circle` | `t4` | `trig.circle.unit_circle_radians`, `trig.fn.periodic_wraps`, `trig.ang.quadrant_signs` | `\theta \leftrightarrow (\cos\theta, \sin\theta)` |
| `op_arc_and_sector` | `t4` | `trig.circle.radian_as_arc_length` | `s = r\theta, \; A = \tfrac{1}{2} r^2 \theta` |
| `op_trig_identity` | `t4` | `trig.id.pythagorean_identity`, `trig.id.double_angle`, `trig.id.angle_sum` | `\sin^2 x + \cos^2 x = 1` |
| `op_solve_triangle` | `t4` | `trig.ratio.similar_shadows`, `trig.law.sines_from_altitude`, `trig.law.cosines_extends_pythagoras` | `\triangle ABC` |
| `op_polar_convert` | `t4` | `trig.polar.point_by_angle_and_radius` | `(x, y) \leftrightarrow (r, \theta)` |
| `op_limit` | `t5` | `precalc.lim.approach`, `precalc.lim.infinity_and_asymptote`, `calc1.lim.one_sided_and_jump`, `calc1.lim.zero_over_zero_cancel`, `calc1.lim.continuous_or_not`, `adv.real.epsilon_delta_challenge`, `adv.real.uniform_continuity_one_delta` | `\lim_{x \to a} f(x)` |
| `op_derivative` | `t5` | `calc1.deriv.rate_as_slope_limit`, `calc1.deriv.rules_as_structure`, `calc1.deriv.product_as_growing_rectangle`, `calc1.deriv.quotient_from_product`, `calc1.deriv.chain_as_gears`, `calc1.deriv.implicit_as_constraint`, `calc1.apply.motion_position_velocity_accel`, `adv.num.finite_difference_step` | `\frac{d}{dx}` |
| `op_tangent_line` | `t5` | `calc1.deriv.tangent_line`, `calc1.apply.linearization_tangent_approx`, `calc1.apply.newton_tangent_root`, `adv.num.newton_tangent_iteration` | `y = f(a) + f'(a)(x - a)` |
| `op_integral` | `t5` | `calc1.int.accumulation`, `calc1.int.riemann_refines_to_limit`, `calc1.int.signed_area_below_axis`, `calc1.int.split_and_scale_properties`, `calc2.impr.limit_of_bounded_area`, `adv.real.riemann_upper_lower_squeeze` | `\int_a^b f(x)\,dx` |
| `op_antiderivative` | `t5` | `calc1.ftc.integral_undoes_derivative`, `calc1.ftc.antiderivative_family`, `calc2.tech.substitution_undoes_chain`, `calc2.tech.by_parts_undoes_product`, `calc2.tech.partial_fractions_split`, `calc2.tech.trig_substitution_as_triangle` | `\int f(x)\,dx = F(x) + C` |
| `op_integral_geometry` | `t5` | `calc2.int.area_between`, `calc2.int.volume_by_slices`, `calc2.parpol.solid_of_revolution`, `calc2.parpol.polar_area_as_sectors` | `\int (f - g)\,dx, \; \int A(x)\,dx` |
| `op_gradient` | `t5` | `mvcalc.part.slice_of_surface`, `mvcalc.grad.terrain_walker`, `adv.opt.gradient_descent_downhill` | `\nabla f, \; \partial_x f` |
| `op_jacobian` | `t5` | `mvcalc.jac.local_stretch` | `J_f` |
| `op_optimize_multivar` | `t5` | `mvcalc.opt.hessian_curvature`, `mvcalc.lagr.tangent_level_curves`, `adv.opt.convex_bowl_one_minimum` | `H_f, \; \nabla f = \lambda \nabla g` |
| `op_multiple_integral` | `t5` | `mvcalc.int.double_integral_tank`, `mvcalc.int.iterated_slices`, `mvcalc.int.change_of_variables_jacobian` | `\iint, \; \iiint` |
| `op_field_integral` | `t5` | `mvcalc.line.work_along_path`, `mvcalc.surf.flux_through_surface` | `\int_C \vec F \cdot d\vec r, \; \iint_S \vec F \cdot d\vec S` |
| `op_div_curl` | `t5` | `mvcalc.divrot.divergence_as_source`, `mvcalc.divrot.curl_as_spin` | `\nabla \cdot \vec F, \; \nabla \times \vec F` |
| `op_vector_arith` | `t6` | `precalc.vec.arrow_2d_intro`, `linalg.vec.add_tip_to_tail`, `linalg.vec.scale_and_reverse`, `linalg.vec.span_and_combination` | `\vec u + \vec v, \; k\vec v` |
| `op_vector_length` | `t6` | `precalc.vec.arrow_2d_intro`, `linalg.vec.vector_as_displacement` | `\\|\vec v\\|` |
| `op_dot_product` | `t6` | `linalg.orth.dot_product_as_alignment`, `linalg.orth.projection_as_shadow`, `linalg.orth.orthonormal_makes_coordinates_easy` | `\vec u \cdot \vec v, \; \mathrm{proj}_{\vec u} \vec v` |
| `op_matrix_vector` | `t6` | `linalg.map.linear_transformation_2d`, `linalg.map.linear_transformation_3d`, `trig.rot.rotation_matrix`, `csmath.gfx.transform_matrix` | `A\vec v` |
| `op_matrix_multiply` | `t6` | `linalg.map.compose_as_multiply`, `linalg.map.matrix_counts_routes`, `graph.matrix.two_step_routes_as_product` | `AB, \; A^{n}` |
| `op_determinant` | `t6` | `linalg.map.determinant_as_area`, `linalg.det.cofactor_by_slices` | `\det A` |
| `op_matrix_inverse` | `t6` | `linalg.map.inverse_and_systems` | `A^{-1}` |
| `op_row_reduce` | `t6` | `linalg.sys.row_operations`, `linalg.sys.elimination_to_echelon`, `linalg.sys.solution_set_shape` | `RowReduce(A)` |
| `op_change_of_basis` | `t6` | `linalg.basis.unique_recipe`, `linalg.basis.in_span_or_not`, `linalg.basis.change_of_basis_as_translation` | `[\vec v]_{B}` |
| `op_eigen` | `t6` | `linalg.eig.eigenvector_stays_on_line`, `linalg.eig.characteristic_polynomial`, `linalg.eig.diagonalize_as_change_of_view` | `A\vec v = \lambda \vec v` |
| `op_svd` | `t6` | `linalg.svd.rotate_stretch_rotate` | `A = U \Sigma V^{T}` |
| `op_linear_program` | `t6` | `adv.opt.linear_program_corners_dual` | `\max c^{T} x` |
| `op_complex` | `t7` | `precalc.cplx.plane_intro`, `adv.cplx.i_as_new_axis`, `adv.cplx.plane_and_modulus`, `adv.cplx.multiplication_rotates_scales` | `a + bi` |
| `op_complex_polar` | `t7` | `precalc.cplx.plane_intro`, `adv.cplx.plane_and_modulus`, `adv.cplx.multiplication_rotates_scales`, `trig.euler.cis_as_rotation`, `adv.cplx.euler_formula_circle`, `adv.cplx.roots_of_unity_polygon` | `r e^{i\theta}, \; \|z\|` |
| `op_slope_field` | `t7` | `calc2.ode.rate_equation_as_rule`, `adv.ode.slope_field`, `adv.ode.euler_method`, `adv.ode.system_equilibrium_phase` | `y' = f(x, y)` |
| `op_solve_ode` | `t7` | `calc2.ode.separate_and_integrate`, `adv.ode.separable_variables`, `adv.ode.linear_first_order_factor` | `y(x) = \ldots` |
| `op_fourier_transform` | `t7` | `adv.four.projection_onto_sines`, `adv.four.transform_as_machine` | `\hat f(\omega)` |
| `op_inverse_fourier` | `t7` | `adv.four.inverse_transform` | `\hat f \mapsto f` |
| `op_taylor` | `t7` | `calc2.taylor.polynomial_copies_derivatives`, `calc2.taylor.remainder_bounds_error` | `T_n(x), \; \|R_n\|` |
| `op_convergence_test` | `t7` | `calc2.ser.power_series_radius`, `adv.real.function_series_uniform_limit`, `adv.real.cauchy_terms_huddle` | `R, \; \|a_n - a_m\| < \varepsilon` |
| `op_truth_table` | `t_disc` | `disc.logic.and_or_not`, `disc.logic.if_then_direction`, `csmath.bool.logic_gates` | `p \land q, \; p \to q` |
| `op_proof_check` | `t_disc` | `disc.logic.quantifiers_as_search`, `disc.proof.counterexample_breaks_forall`, `disc.ind.domino_induction` | `\forall, \; \exists` |
| `op_set_ops` | `t_disc` | `disc.set.membership_rule`, `disc.set.union_intersection`, `adv.real.supremum_least_ceiling` | `A \cup B, \; A \cap B, \; \sup A` |
| `op_relation_check` | `t_disc` | `disc.rel.relation_as_arrows`, `disc.rel.equivalence_classes` | `a \sim b` |
| `op_mod_arith` | `t_disc` | `disc.mod.modular_inverse`, `csmath.crypto.rsa_trapdoor` | `a^{-1} \bmod n, \; a^{k} \bmod n` |
| `op_caesar` | `t_disc` | `csmath.crypto.caesar_shift` | `x \mapsto x \pm k \pmod{26}` |
| `op_choose` | `t_disc` | `disc.count.choose_as_pascal_paths`, `precalc.binom.pascal_triangle_expansion`, `disc.count.product_rule` | `\binom{n}{k}, \; n!` |
| `op_count_outcomes` | `t_disc` | `disc.count.product_rule`, `disc.count.sum_rule`, `prob.basic.count_outcomes_by_structure`, `prob.basic.sample_space_grid` | `\|\Omega\|` |
| `op_recurrence` | `t_disc` | `disc.rec.recurrence_step`, `disc.rec.tree_recursion`, `csmath.rec.base_case_and_smaller_call` | `a_{n} = f(a_{n-1})` |
| `op_graph_properties` | `t_disc` | `graph.basic.graph_and_paths`, `graph.deg.handshake_lemma`, `graph.conn.components`, `graph.tree.tree_no_cycles`, `graph.walk.repeat_rules`, `graph.euler.bridges_konigsberg`, `graph.euler.hamilton_visits_every_node`, `graph.matrix.two_step_routes_as_product` | `G = (V, E)` |
| `op_graph_search` | `t_disc` | `graph.search.bfs_dfs_frontier`, `csmath.alg.breadth_first_search`, `graph.path.shortest_path` | `BFS(G, s), \; d(s, t)` |
| `op_euler_characteristic` | `t_disc` | `graph.planar.no_crossing_euler_formula`, `adv.topo.euler_characteristic_invariant` | `V - E + F` |
| `op_graph_coloring` | `t_disc` | `graph.color.map_coloring` | `\chi(G)` |
| `op_max_flow` | `t_disc` | `graph.flow.max_flow_min_cut`, `graph.match.bipartite_matching` | `\max \|f\| = \min \|C\|` |
| `op_machine_numbers` | `t_disc` | `csmath.bin.place_value_binary`, `csmath.float.rounding_gaps` | `1011_2, \; \varepsilon_{mach}` |
| `op_algorithm_trace` | `t_disc` | `csmath.alg.sorting_algorithm`, `csmath.alg.state_machine`, `csmath.inv.loop_invariant`, `csmath.cplx.big_o_as_slope` | `O(n)` |
| `op_group_table` | `t_disc` | `adv.alg.group_as_reversible_actions`, `adv.alg.cayley_graph`, `adv.alg.cosets_partition`, `adv.alg.homomorphism_preserves_structure` | `g \cdot h, \; gH` |
| `op_field_arith` | `t_disc` | `adv.alg.field_every_nonzero_invertible`, `adv.alg.polynomial_arithmetic` | `a^{-1} \in \mathbb{F}, \; p(x) \bmod q(x)` |
| `op_topology_check` | `t_disc` | `adv.topo.open_or_closed`, `adv.topo.connected_one_piece`, `adv.topo.compact_finite_cover` | `U \subseteq X` |
| `op_probability` | `t_prob` | `prob.basic.probability_as_proportion`, `prob.basic.complement_fills_the_rest`, `prob.basic.union_intersection` | `P(A), \; P(A^{c}), \; P(A \cup B)` |
| `op_conditional_probability` | `t_prob` | `prob.cond.conditional_and_independence`, `prob.cond.markov_chain_walk` | `P(A \mid B)` |
| `op_bayes` | `t_prob` | `prob.cond.bayes_reverses_condition` | `P(B \mid A) = \frac{P(A \mid B)\,P(B)}{P(A)}` |
| `op_distribution` | `t_prob` | `prob.rv.random_variable_as_machine`, `prob.rv.cumulative_distribution`, `prob.dist.binomial_counts`, `prob.dist.density_area_is_probability`, `prob.dist.normal_bell_from_sums` | `P(X = k), \; F(x)` |
| `op_expected_value` | `t_prob` | `prob.rv.expectation_as_weighted_average` | `E[X]` |
| `op_variance` | `t_prob` | `prob.rv.variance_as_spread`, `prob.rv.linear_change_of_variable` | `\mathrm{Var}(X), \; z = \frac{x - \mu}{\sigma}` |
| `op_descriptive_stats` | `t_prob` | `prob.stat.mean_as_leveling`, `prob.stat.frequency_table` | `\bar x, \; \tilde x` |
| `op_regression_line` | `t_prob` | `prob.stat.correlation_vs_cause`, `prob.stat.regression_line`, `linalg.svd.least_squares_as_projection` | `\hat y = a + bx, \; r` |
| `op_inference` | `t_prob` | `prob.samp.sample_vs_population`, `prob.samp.central_limit_bell`, `prob.inf.confidence_interval_net`, `prob.inf.hypothesis_test_surprise` | `\bar x \pm z \frac{s}{\sqrt{n}}, \; p` |
| `op_monte_carlo` | `t_prob` | `adv.num.monte_carlo_pi` | `\hat p \approx \frac{k}{N}` |
| `op_entropy` | `t_prob` | `csmath.info.entropy_as_surprise` | `H = -\sum p_i \log_2 p_i` |

