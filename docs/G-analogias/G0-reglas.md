# G0 — Reglas de las analogías

Cada concepto de Mathy se presenta primero como una situación del mundo real. Este documento fija cómo se elige esa situación, cómo se acepta o se rechaza, cuándo desaparece y cuándo está prohibida. Los datos viven en [`analogies.yaml`](analogies.yaml); los textos que ve el jugador, en [`../locales/es/analogies.yaml`](../locales/es/analogies.yaml). Las mecánicas que dan cuerpo a cada analogía están en [E](../E-mecanicas/E0-catalogo.md); las capas por las que avanza, en [H](../H-progresion-abstraccion.md); los errores que una analogía puede sembrar, en [L](../L-modelo-errores/L0-taxonomia.md).

## 1. Por qué la analogía va antes que el símbolo

Un símbolo es un nombre corto para una estructura. `x + 5 = 12` nombra una situación en la que algo desconocido, junto con cinco, iguala a doce. Quien ya vivió esa situación lee el símbolo como un recordatorio. Quien no la vivió lee tinta.

Por eso el orden de capas de Mathy empieza en `real` y termina en `abstract` ([H](../H-progresion-abstraccion.md)). La analogía es la capa `real` y sobrevive en `intuition` y `concrete`. Su trabajo es dar al jugador algo sobre lo que ya tiene intuiciones físicas: una balanza se inclina hacia el lado pesado, un cofre cerrado necesita su llave, un tanque se llena más rápido si el grifo echa más agua. El símbolo llega después y se apoya en esa intuición. La notación nunca se introduce en vacío.

Esto tiene una consecuencia fuerte: **la analogía no se elige por simpática, se elige por isomorfa.** Una situación divertida que no comparte la estructura del concepto enseña algo distinto del concepto, y lo que enseña hay que desaprenderlo después. Cada entrada del catálogo declara su mapa de estructura, su punto de ruptura y la capa en la que se retira. Sin esos tres datos no entra.

## 2. Piel y esqueleto

Toda actividad de Mathy tiene dos partes separadas a propósito.

El **esqueleto** es la mecánica: una de las doce definidas en [E](../E-mecanicas/E0-catalogo.md) (`balance`, `chest_key`, `machine_pipe`, `ledger`, `tiles`, `slope_walker`, `fill_accumulate`, `grid_stretch`, `network_routes`, `urn_dice`, `gears_sequence`, `sorter`). La mecánica define qué hace el jugador y qué invariante se conserva. La balanza conserva la igualdad bajo acciones idénticas en ambos platos; el cofre conserva el contenido bajo cerrar y abrir; el tanque conserva la relación entre caudal y nivel.

La **piel** es la analogía: qué objetos concretos visten ese esqueleto. En `ledger` pueden ser frutas, monedas o tickets. En `slope_walker` pueden ser un camino de piedras, una rampa, un ascensor o una colina.

La regla es: **se puede cambiar la piel sin tocar el esqueleto.** Cambiar manzanas por monedas en el `ledger` no altera el invariante "solo se juntan términos iguales". Esto es lo que hace posible la localización ([P](../P-internacionalizacion.md)): las variantes culturales se aplican a la piel y el validador comprueba que el `structure_map` de la variante tenga los mismos conceptos destino que el original. Y es lo que hace posible el desvanecimiento: cuando la piel se retira, el esqueleto queda y el símbolo se monta sobre él.

Por eso `analogies.yaml` declara exactamente una `mechanic` por analogía. Una analogía que necesita dos mecánicas para funcionar es en realidad dos analogías.

## 3. El test de preservación de estructura

Toda analogía propuesta pasa por este procedimiento antes de entrar al catálogo. Se documenta el resultado en la entrada YAML. Si algún paso falla, la analogía se rechaza o se recorta.

**Paso 1. Mapear objetos.** Listar cada objeto visible de la situación y el concepto matemático que representa. El mapa debe ser uno a uno en lo esencial: un cofre es una expresión, una cerradura es una operación, una llave es su inversa. Si dos objetos distintos representan el mismo concepto, o un objeto representa dos conceptos, la analogía va a producir confusión en la capa `symbolic`. Este mapa es el campo `structure_map`.

**Paso 2. Mapear operaciones.** Cada acción que el jugador puede hacer en la situación debe corresponder a una operación válida sobre el concepto, y cada operación válida del concepto en ese nodo debe tener una acción. Sacar peso de un plato es restar de un lado; no existe acción física para "multiplicar los dos platos", y eso hay que anotarlo. Las acciones que no tienen operación (patear la balanza) se bloquean en la mecánica. Las operaciones que no tienen acción marcan el borde de la analogía.

**Paso 3. Mapear el invariante.** Nombrar qué se conserva en la situación y comprobar que sea exactamente lo que se conserva en el concepto. La barra derecha de la balanza es la igualdad. El total de agua en los vasos es la suma de los datos. Si el invariante físico es más débil que el matemático (la balanza física tolera pequeñas diferencias), la mecánica lo endurece. Si es más fuerte (la balanza no admite pesos negativos), ese es el punto de ruptura.

**Paso 4. Buscar el punto de ruptura.** Toda analogía se rompe. La tarea es encontrar dónde y escribirlo en `breaks_at` antes de que lo encuentre un jugador. Se buscan sistemáticamente: números negativos, cero, fracciones, infinito, cantidades no geométricas, más dimensiones, casos degenerados. El punto de ruptura decide dos cosas: hasta qué nodo puede llegar la analogía, y qué misconception hay que vigilar cuando el jugador la extrapola.

**Paso 5. Verificar la transición a notación.** Imaginar el morph: el objeto concreto se transforma en el símbolo sin cambio de pantalla ([N](../N-ux-ui.md)). Debe existir una correspondencia posición a posición. Dos montones de manzanas que se juntan se convierten en `🍎 + 🍎`, luego en `x + x`, luego en `2x`, y cada símbolo ocupa el lugar del objeto que reemplaza. Si no se puede dibujar ese morph, la analogía es una ilustración, no una analogía, y no sirve como capa `concrete`.

Una analogía aprobada se registra con los cinco resultados. Una analogía que pasa los pasos 1 a 3 pero cuyo punto de ruptura está antes del concepto principal del nodo se acepta solo para nodos anteriores.

## 4. Analogías rechazadas

Estas propuestas se evaluaron y no entraron. Quedan documentadas para que no vuelvan.

**"La ecuación es un acertijo".** Falla el paso 2. Un acertijo se resuelve adivinando y comprobando; no tiene operaciones que preserven una igualdad. Enseña que resolver es probar números hasta acertar, que es exactamente la estrategia que `alg.eq.multi_step` debe reemplazar. La balanza y el cofre sí tienen operaciones con inversa.

**"La derivada es la velocidad", sin pendiente.** Falla el paso 5. La velocidad es un caso de derivada, no su estructura. Sin el paso por la pendiente de una recta que se acerca, el jugador no puede ver `f'(x)` como límite del cociente incremental ni transferir la idea a funciones que no son posiciones. Mathy usa `walker_zoom_on_hill`: la colina es cualquier función, la lupa es el intervalo que se achica y la recta que aparece tiene pendiente. La velocidad aparece después como transferencia, en `odometer_from_speed`.

**"Los conjuntos son cajas".** Falla el paso 4 demasiado temprano. Una caja contiene una cantidad finita de cosas y tiene un lugar. Un conjunto infinito no cabe en una caja, un conjunto puede ser elemento de otro, y un conjunto no cambia por reordenar. `sorting_bins` se acepta solo para cardinalidad finita y pertenencia con `breaks_at: infinite_collections`, y se retira en la capa `visual`. Para `disc.set.*` avanzados no hay analogía.

**"Multiplicar es sumar muchas veces".** Falla el paso 3. El invariante de la suma repetida solo existe para enteros. En `arith.frac.multiply`, `3 × ½` no es "sumar tres veces medio" para el niño sino "escalar". Se acepta como paso intermedio en `walker_forward_and_back` (`equal_hops_repeated: skip_counting`), pero el nodo `arith.mul.scaling` usa `tile_floor` y `rubber_band_stretch`, que sobreviven a las fracciones.

**"El signo menos es una deuda", como única analogía de negativos.** Pasa los pasos 1 a 3 para sumar y restar enteros, y por eso `debt_ledger` está en el catálogo. Se rechaza como analogía de `arith.int.mul_signed`: no hay ninguna acción física que sea "deber una deuda" y que produzca un crédito. La entrada declara `breaks_at: multiplying_two_debts` y ese nodo se enseña con `elevator_floors` más la capa `visual` de la recta que se refleja.

**"La función es una fórmula".** Falla el paso 1: mapea dos conceptos (función y expresión) al mismo objeto. El jugador que lo absorbe no puede pensar en funciones dadas por tabla, por gráfico o por regla verbal. `function_machine` separa la máquina de su placa de regla.

**"Probabilidad es cuántas veces salió".** Falla el paso 3: la frecuencia observada no es invariante, cambia con cada tirada. La proporción de bolitas en la urna sí lo es. La frecuencia se introduce como estimador en `tasting_soup` y `spinner_wheel`, después de la proporción.

## 5. Cuándo se desvanece

Una analogía no se elimina de golpe: se retira por capas según [H](../H-progresion-abstraccion.md). El campo `fades_at_layer` marca la primera capa en la que la analogía ya no aparece en pantalla. Antes de esa capa el objeto concreto está presente; en esa capa solo queda el símbolo o la figura, aunque el jugador pueda pedir volver a ver el objeto.

Criterios para fijar `fades_at_layer`:

- **El símbolo ya es manipulable sin el objeto.** Cuando el jugador mueve `−5` a ambos lados sin mirar los platos, la balanza sobra. La mayoría de las analogías aritméticas y algebraicas se desvanecen en `symbolic`.
- **El objeto empieza a contradecir el concepto.** Si el nodo necesita cruzar el punto de ruptura, la analogía debe irse antes. `balance_pans` se va en `symbolic` porque las ecuaciones con términos negativos aparecen ahí.
- **La definición formal necesita casos que el objeto no tiene.** Las analogías de cálculo y probabilidad llegan hasta `formal` porque su forma visual (área, pendiente, proporción) sigue siendo correcta, pero la definición con épsilon o con espacio muestral no tiene objeto físico.
- **Nunca sobrevive a `abstract`.** La capa `abstract` se define como "sin analogía" ([H](../H-progresion-abstraccion.md)). Ninguna entrada puede declarar `fades_at_layer: abstract` ni `transfer`.

El desvanecimiento se implementa como los pasos de la mecánica hacia la notación descritos en [E](../E-mecanicas/E0-catalogo.md): el objeto se vuelve contorno, el contorno se vuelve símbolo, el símbolo queda solo. La regla de [N](../N-ux-ui.md) aplica: es un morph del mismo objeto, no un reemplazo de pantalla.

## 6. Cuándo está prohibida

**Nodos `adv.*` sin capas `real` ni `concrete`.** Un nodo avanzado puede declarar `layers` que empiezan en `symbolic` ([C0](../C-knowledge-graph/C0-esquema.md)). Es una decisión explícita: significa que ninguna situación física preserva la estructura. En esos nodos el campo `analogy` está prohibido y el validador lo rechaza. Cuando sí existe una situación con estructura (una rotación es multiplicar por `i`), el nodo declara la capa `concrete` y la analogía entra por el test normal: `quarter_turn_dial` es un ejemplo.

**Analogías que introducen misconceptions conocidas.** Si el mapa de estructura de una analogía produce, al extrapolar, un error catalogado en [L](../L-modelo-errores/L0-taxonomia.md), la analogía no puede usarse en el nodo donde ese error se detecta. Ejemplos: una llave que abre el cofre `x²` a una sola sala induce `sqrt_loses_negative_branch`; por eso `chest_single_lock` declara `breaks_at: two_branches_of_sqrt` y no es analogía de `alg.fn.quadratic_and_sqrt`, que usa `square_garden_side` con el mismo punto de ruptura pero con la mecánica `tiles`, donde el lado negativo se discute de frente. Una balanza que permite quitar peso de un solo plato induce `inverse_applied_one_side`; la mecánica `balance` bloquea esa acción y el patrón de explicación la reproduce sobre la balanza cuando ocurre en notación.

**Analogías cuyo punto de ruptura está antes del concepto del nodo.** Si `breaks_at` describe algo que el nodo debe enseñar, la analogía está prohibida para ese nodo. `walker_forward_and_back` rompe en `walking_past_start` y por eso no es analogía de `arith.int.negatives`; ese nodo usa `elevator_floors`, que tiene pisos bajo la calle.

**Analogías con texto obligatorio en nodos `literacy: none`.** Una analogía con `literacy_min: short_text` no puede asignarse a un nodo de nivel 0 ni a ninguno que declare `literacy: none` ([Q](../Q-edad-universal.md)).

## 7. Alcance cultural y localización

Cada analogía declara `cultural_scope` con uno de tres valores, siguiendo [P](../P-internacionalizacion.md):

- **universal**: la situación se reconoce en cualquier cultura sin adaptación. Frutas, piedras, agua, cofres, balanzas de platos, caminos, sombras, aros. Es el valor por defecto que se busca. El asset es único.
- **adaptable**: la estructura es universal pero la piel cambia por región. Dinero (`currency_local`), unidades (`units_metric`, `units_imperial`), comida (`round_pizza`, `round_flatbread`, `round_cake`), numeración de pisos (`floor_zero_ground`, `floor_one_ground`), relojes (`clock_12h`, `clock_24h`). La entrada lista sus `variants` y cada variante tiene sus propios assets y textos; el `structure_map` no cambia.
- **local**: la situación solo se reconoce en algunas regiones y no tiene variante equivalente en otras. Deportes con reglas propias, juegos de mesa regionales, fiestas. Una analogía `local` no puede ser la única analogía de un nodo: siempre debe existir una `universal` o `adaptable` para el mismo nodo. En esta versión del catálogo no hay analogías `local`; el valor existe para que el proceso de localización pueda proponerlas.

Regla práctica: si dudás entre `universal` y `adaptable`, es `adaptable`. Un ascensor es universal como idea, pero el piso de la calle se llama 0 en unos países y 1 en otros, y eso toca directamente el mapa a los enteros.

Los objetos concretos son assets propios listados en `assets`, nunca emojis de plataforma. Así el aspecto es idéntico en iOS y Android y la sustitución por variante es un cambio de asset, no de código. El único emoji que aparece en este documento es la cita del ejemplo de frutas del master prompt.

## 8. Edad universal

Mathy es jugable desde los 5 o 6 años, y el mismo grafo lo recorre un adulto ([Q](../Q-edad-universal.md)). La analogía es la parte más sensible a esto porque es lo primero que ve el jugador.

Regla: **cuando el nodo declara `literacy: none`, la analogía debe ser reconocible por un niño de 5 años sin explicación verbal.** Esto significa que la situación se entiende viendo la primera animación: fruta que se junta, agua que se vuelca, caminante que da pasos, cofre que se abre. La narración por voz existe, pero es opcional; el juego debe funcionar con el sonido apagado.

Consecuencias en el catálogo:

- `literacy_min: none` es el valor de todas las analogías de los niveles 0 a 2 y de casi todas las de la espina. Solo `market_two_receipts`, `taxi_fare_meter` y `fair_ticket_price` exigen `short_text`, y las tres son analogías secundarias de nodos que tienen otra con `none`.
- Las cantidades que aparecen en el texto narrado usan placeholders ICU con plural, para que la voz diga "una piedra" y "tres piedras" correctamente en cada locale.
- El texto de presentación tiene dos o tres frases cortas. No explica el concepto: presenta la situación. La explicación es la mecánica.
- Nada en la analogía depende de conocimiento escolar previo. Un taxímetro o un ticket de compra pueden ser desconocidos para un niño; por eso llevan `short_text` y nunca son la única puerta a un nodo.

La estética es age-neutral ([N](../N-ux-ui.md)): las frutas, los cofres y los caminantes se dibujan con el mismo lenguaje que los símbolos. Eso no es solo una decisión visual: es lo que hace posible el morph del paso 5 del test.

## 9. Catálogo comentado de las analogías principales

Una por mecánica, elegidas entre las que sostienen la espina. Cada una con su mapa de estructura y su punto de ruptura explicado. La tabla completa está en la sección 10.

### balance → `balance_pans`

Nodos: `prealg.eq.balance`, `alg.eq.one_step`, `alg.eq.multi_step`.

Mapa: plato → lado de la ecuación; pesas en un plato → términos; barra derecha → igualdad; misma acción en ambos platos → transformación de equivalencia; caja cerrada → incógnita; quitar pesas iguales de ambos platos → cancelar; leer la caja sola → solución.

Ruptura: `negative_weights`. Una pesa no puede pesar menos que nada. En cuanto la ecuación tiene un término negativo o hay que multiplicar ambos lados, la balanza física no tiene acción correspondiente. Por eso se desvanece en `symbolic` y `alg.eq.multi_step` la combina con `chest_nested`, que sí soporta operaciones multiplicativas como cerraduras.

Lo que enseña que ninguna otra enseña: por qué la operación inversa se aplica a **los dos** lados. Es el complemento exacto del cofre ([C0](../C-knowledge-graph/C0-esquema.md), arista 11 y 12 → 13).

### chest_key → `chest_single_lock`

Nodos: `prealg.inv.operation_as_key`, `arith.sub.undo_add`, `arith.div.undo_mul`, `alg.eq.one_step`.

Mapa: cofre → expresión; forma de la cerradura → operación; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas.

Ruptura: `two_branches_of_sqrt`. La cerradura `x²` se abre a dos salas, `3` y `−3`, y un cofre físico no tiene dos interiores. Es el mismo punto donde vive `sqrt_loses_negative_branch`, así que la llave se retira antes de `alg.fn.quadratic_and_sqrt`.

Lo que enseña: por qué `÷5` deshace `×5`, en aritmética pura, antes de cualquier ecuación. La llave vuelve tres veces en el curriculum: como función inversa (`machine_reverse_run`), como logaritmo y como teorema fundamental (`tank_filling`).

### machine_pipe → `function_machine`

Nodos: `alg.fn.function_as_machine`, `alg.fn.domain_range`.

Mapa: máquina → función; ranura de entrada → argumento; salida → valor; placa de regla → fórmula; misma entrada, misma salida → buena definición; entrada rechazada → fuera del dominio; todo lo que puede salir → rango.

Ruptura: `relations_that_are_not_functions`. Una máquina no puede dar dos salidas para una entrada, y eso es justo lo que la hace buena analogía de función. Cuando el curriculum llega a relaciones que no son funciones (la circunferencia como ecuación), la máquina no las representa.

La placa de regla separada del cuerpo de la máquina es deliberada: evita la analogía rechazada "la función es una fórmula".

### ledger → `fruit_ledger`

Nodos: `arith.add.displacement`, `arith.sub.undo_add`, `prealg.var.unknown_as_box`, `alg.eq.one_step`, `alg.expr.like_terms`.

Mapa: tipo de fruta → unidad o variable; montón de un tipo → término; juntar montones → suma; sacar fruta → resta; cuenco tapado → incógnita; solo se juntan frutas iguales → términos semejantes; tarjeta con número junto al montón → coeficiente.

Ruptura: `fruit_times_fruit`. 🍎 + 🍎 es `2🍎`, y el morph a `x + x = 2x` es exacto. Pero 🍎 × 🍎 no significa nada, así que `x²` no puede nacer aquí; nace en `tiles`. Esta ruptura es la razón por la que `alg.expr.distributive_tiles` no usa el `ledger`.

Es la analogía del ejemplo central del master prompt y la que mejor muestra la regla de piel y esqueleto: la variante con monedas (`debt_ledger`) usa el mismo esqueleto y agrega vales negativos.

### tiles → `tile_floor_two_rooms`

Nodos: `alg.expr.distributive_tiles`, `alg.expr.factor_common`, `arith.mul.partial_products`.

Mapa: ancho compartido → factor común; largos de las dos habitaciones → sumandos del paréntesis; pared del medio → paréntesis; piso entero → producto; sacar la pared → distribuir; volver a poner la pared → factorizar; habitación de largo desconocido → baldosa variable.

Ruptura: `negative_lengths`. `x − 3` como largo de una habitación no tiene sentido físico. Las baldosas con signo son una extensión visual, ya sin analogía, y por eso la entrada se desvanece en `symbolic`.

Es también la base de `square_garden_side` (completar el cuadrado: la baldosa que falta en la esquina) y de `growing_rectangle` (regla del producto: las tiras que se agregan).

### slope_walker → `walker_zoom_on_hill`

Nodos: `calc1.deriv.rate_as_slope_limit`, `calc1.deriv.tangent_line`.

Mapa: colina curva → función; acercar la lupa → intervalo que se achica; el suelo se ve recto → linealidad local; pendiente de ese tramo → derivada; tramo prolongado → recta tangente; pico afilado que nunca se endereza → punto no derivable; pendiente en cada lugar como nuevo camino → función derivada.

Ruptura: `input_that_is_not_a_place`. La colina funciona mientras `x` sea una posición. Cuando `x` es tiempo, precio o temperatura, el caminante ya no camina sobre nada, y la derivada hay que transferirla como tasa. Ese es el paso de `transfer` del nodo y el lugar de `odometer_from_speed`.

El caminante es la piel más reutilizada del catálogo: camino de piedras, pasos adelante y atrás, ascensor, rampa, perfil del camino, mitad del camino a la pared, colina con lupa, rueda gigante, colina con brújula. Todas comparten el esqueleto "posición y cambio de posición".

### fill_accumulate → `tank_filling`

Nodos: `calc1.int.accumulation`, `calc1.ftc.integral_undoes_derivative`, `calc2.int.area_between`.

Mapa: caudal del grifo → integrando; tiempo que corre → variable de integración; nivel de agua → valor acumulado; rebanada fina de tiempo → `dx`; sumar rebanadas → suma de Riemann; grifo que drena → integrando negativo; medidor de nivel → primitiva; lectura inicial desconocida → constante de integración; cambio de nivel entre dos momentos → integral definida.

Ruptura: `variable_that_is_not_time`. El tanque acumula sobre tiempo. Cuando la integral es sobre una longitud (área entre curvas, volumen por rebanadas) el grifo desaparece y queda solo la suma de rebanadas, que es `stacked_slices_loaf`.

El teorema fundamental aparece como sorpresa: el jugador que ya sabe que el medidor de nivel sube según el caudal descubre que "leer el medidor" es la llave que abre "sumar el caudal". La arista 29 ← 12 de la espina se juega literalmente.

### grid_stretch → `rubber_grid_with_house`

Nodos: `linalg.map.linear_transformation_2d`, `linalg.mat.matrix_columns`.

Mapa: lámina elástica → plano; casa dibujada → figura a transformar; estirar parejo → aplicación lineal; líneas que siguen rectas y equiespaciadas → linealidad; dónde caen los dos clavos unitarios → columnas de la matriz; clavo en el centro → origen fijo; estirar y volver a estirar → producto de matrices.

Ruptura: `sliding_the_sheet`. Deslizar la lámina sin estirarla se siente natural y es exactamente lo que una aplicación lineal no puede hacer: la traslación no es lineal. La mecánica bloquea el gesto y la entrada lo declara para que el patrón de explicación lo muestre.

Su continuación `rubber_grid_undo_stretch` aporta el punto de ruptura más didáctico del catálogo: una lámina aplastada hasta ser una línea no se puede desaplastar, que es la matriz singular.

### network_routes → `city_routes`

Nodos: `graph.basic.graph_and_paths`, `graph.path.shortest`, `graph.conn.components`.

Mapa: lugar → vértice; camino → arista; viaje → camino en el grafo; largo del camino → peso; isla sin puente → componente desconexa; viaje que vuelve → ciclo; viaje más barato → camino mínimo.

Ruptura: `drawing_position_matters`. En una ciudad, dónde está cada lugar importa. En un grafo, no: dos dibujos distintos del mismo grafo son el mismo grafo. El jugador que cree que mover un vértice cambia el grafo tiene que cruzar esa ruptura, y se cruza en la capa `formal` con dos dibujos del mismo mapa.

Es la única analogía de la espina que se puede jugar sabiendo solo contar (arista 37 ← 1).

### urn_dice → `urn_of_balls`

Nodos: `prob.basic.probability_as_proportion`, `prob.cond.conditional_and_independence`.

Mapa: urna → espacio muestral; bolita → resultado; color → evento; parte de las bolitas de un color → probabilidad; sacar sin mirar → ensayo aleatorio; devolver la bolita → independencia entre extracciones; no devolverla → dependencia.

Ruptura: `uncountable_outcomes`. La urna tiene una cantidad finita de bolitas. Una variable continua no cabe, y la probabilidad cero de un punto (`spinner_wheel`, `needle_exactly_on_a_line`) no se puede mostrar con bolitas.

La proporción, no la frecuencia, es lo que se mapea a probabilidad. Ver la analogía rechazada en la sección 4.

### gears_sequence → `paper_folding_doubles`

Nodos: `alg.fn.exponential_growth`, `alg.fn.logarithm`, `calc2.seq.geometric`.

Mapa: hoja → valor inicial; un doblez → multiplicar por dos; cantidad de dobleces → exponente; capas → `2ⁿ`; contar dobleces para llegar a un grosor → logaritmo en base 2; desdoblar una vez → dividir por dos.

Ruptura: `half_a_fold`. No existe medio doblez. `2^0.5` no tiene objeto, y por eso la analogía se va en `symbolic` antes de los exponentes racionales. El logaritmo entra como "contar dobleces", que es la llave del cofre exponencial, y la cadena de engranajes (`gear_train_ratios`) reutiliza el esqueleto para la regla de la cadena.

### sorter → `sorting_bins`

Nodos: `found.count.cardinality`, `disc.set.membership_rule`.

Mapa: caja → conjunto; objeto → elemento; poner el objeto en la caja → test de pertenencia; número en la etiqueta → cardinalidad; reordenar dentro de la caja → invariancia bajo biyección.

Ruptura: `infinite_collections`. Se explicó en la sección 4. Se desvanece en `visual`, la más temprana del catálogo, porque el conteo debe ser símbolo cuanto antes. La misma mecánica reaparece en probabilidad (`sorted_bins_then_pick`: ordenar por un rasgo y sacar de una sola caja es condicionar) y en conjuntos con los aros (`hula_hoops_overlap`).

## 10. Tabla completa

| id | mecánica | nodos | ruptura | se desvanece en | alcance |
|---|---|---|---|---|---|
| sorting_bins | sorter | found.count.cardinality, disc.set.membership_rule | infinite_collections | visual | universal |
| fruit_bowl_count | ledger | found.count.cardinality, found.count.compare_more_less | fractional_units | visual | universal |
| number_line_walk | slope_walker | found.count.number_line, arith.add.displacement | position_between_stones | visual | universal |
| walker_forward_and_back | slope_walker | arith.add.displacement, arith.sub.undo_add, arith.seq.skip_count | walking_past_start | symbolic | universal |
| fruit_ledger | ledger | arith.add.displacement, arith.sub.undo_add, prealg.var.unknown_as_box, alg.eq.one_step, alg.expr.like_terms | fruit_times_fruit | symbolic | universal |
| tile_floor | tiles | arith.mul.scaling, arith.div.undo_mul, geom.area.rectangle, arith.mul.partial_products | non_integer_sides | symbolic | universal |
| rubber_band_stretch | grid_stretch | arith.mul.scaling, arith.div.undo_mul, arith.frac.parts_and_ratio | negative_scaling_flips | symbolic | universal |
| sharing_into_plates | sorter | arith.div.undo_mul, arith.div.remainder | divisor_not_whole | symbolic | universal |
| elevator_floors | slope_walker | arith.int.negatives, arith.int.add_signed | multiplying_floors | symbolic | adaptable |
| debt_ledger | ledger | arith.int.negatives, arith.int.add_signed, arith.int.mul_signed | multiplying_two_debts | symbolic | adaptable |
| pizza_slices | tiles | arith.frac.parts_and_ratio, arith.frac.equivalent, arith.frac.add_same_denominator | dividing_by_a_fraction | symbolic | adaptable |
| chocolate_bar_grid | tiles | arith.frac.parts_and_ratio, arith.frac.multiply, prealg.pct.hundredths | percent_of_percent_and_over_hundred | symbolic | universal |
| juice_mix_ratio | fill_accumulate | arith.frac.parts_and_ratio, prealg.ratio.rate_per_unit, prealg.prop.scaling_recipe | negative_ingredients | symbolic | adaptable |
| chest_nested | chest_key | arith.expr.precedence_tree, alg.eq.multi_step, alg.fn.composition | unknown_in_two_chests | symbolic | universal |
| chest_single_lock | chest_key | prealg.inv.operation_as_key, arith.sub.undo_add, arith.div.undo_mul, alg.eq.one_step | two_branches_of_sqrt | symbolic | universal |
| mystery_box | chest_key | prealg.var.unknown_as_box | box_with_changing_contents | symbolic | universal |
| balance_pans | balance | prealg.eq.balance, alg.eq.one_step, alg.eq.multi_step | negative_weights | symbolic | universal |
| balance_tilted | balance | alg.ineq.tilted_balance, found.count.compare_more_less | multiplying_by_negative | symbolic | universal |
| two_balances_shared_boxes | balance | alg.sys.two_by_two | contradictory_or_redundant_balances | symbolic | universal |
| market_two_receipts | ledger | alg.sys.two_by_two, alg.eq.word_to_equation | negative_quantities | symbolic | adaptable |
| tile_floor_two_rooms | tiles | alg.expr.distributive_tiles, alg.expr.factor_common, arith.mul.partial_products | negative_lengths | symbolic | universal |
| square_garden_side | tiles | alg.fn.quadratic_and_sqrt, alg.expr.complete_square | two_branches_of_sqrt | formal | universal |
| function_machine | machine_pipe | alg.fn.function_as_machine, alg.fn.domain_range | relations_that_are_not_functions | formal | universal |
| machine_chain | machine_pipe | alg.fn.composition, calc1.deriv.rules_as_structure | machines_with_two_inputs | symbolic | universal |
| machine_reverse_run | machine_pipe | alg.fn.inverse_function, alg.fn.logarithm | non_injective_reversal | formal | universal |
| walker_height_trace | slope_walker | alg.fn.graph_as_picture, precalc.fn.increasing_decreasing, alg.fn.linear_slope | two_heights_at_one_place | symbolic | universal |
| walker_on_ramp | slope_walker | alg.fn.linear_slope, prealg.ratio.rate_per_unit | vertical_ramp | symbolic | universal |
| taxi_fare_meter | ledger | alg.fn.linear_slope, alg.fn.word_to_linear | negative_distance | symbolic | adaptable |
| paper_folding_doubles | gears_sequence | alg.fn.exponential_growth, alg.fn.logarithm, calc2.seq.geometric | half_a_fold | symbolic | universal |
| zeno_half_steps | slope_walker | precalc.lim.approach, calc2.series.geometric_sum | limits_reached_or_oscillating | formal | universal |
| walker_zoom_on_hill | slope_walker | calc1.deriv.rate_as_slope_limit, calc1.deriv.tangent_line | input_that_is_not_a_place | formal | universal |
| tank_filling | fill_accumulate | calc1.int.accumulation, calc1.ftc.integral_undoes_derivative, calc2.int.area_between | variable_that_is_not_time | formal | universal |
| odometer_from_speed | fill_accumulate | calc1.int.accumulation, calc1.ftc.integral_undoes_derivative | odometer_ignores_reversing | formal | adaptable |
| growing_rectangle | tiles | calc1.deriv.rules_as_structure | shrinking_sides | formal | universal |
| gear_train_ratios | gears_sequence | calc1.deriv.rules_as_structure, alg.fn.composition, prealg.ratio.rate_per_unit | ratio_that_changes_with_position | formal | universal |
| treasure_map_arrows | grid_stretch | linalg.vec.vector_as_displacement, linalg.vec.add_tip_to_tail | length_of_diagonal_arrow | symbolic | universal |
| two_kinds_of_steps | grid_stretch | linalg.vec.span_and_combination, linalg.vec.basis | fractional_and_backward_steps | symbolic | universal |
| rubber_grid_with_house | grid_stretch | linalg.map.linear_transformation_2d, linalg.mat.matrix_columns | sliding_the_sheet | formal | universal |
| rubber_grid_undo_stretch | grid_stretch | linalg.map.inverse_and_systems, linalg.det.area_scaling | more_than_two_dimensions | formal | universal |
| shadow_and_stick | grid_stretch | trig.ratio.similar_shadows, geom.sim.scale_copies | angle_without_a_sun | symbolic | universal |
| quarter_turn_dial | grid_stretch | adv.cplx.rotation_as_multiplication | functions_of_the_pointer | symbolic | universal |
| urn_of_balls | urn_dice | prob.basic.probability_as_proportion, prob.cond.conditional_and_independence | uncountable_outcomes | formal | universal |
| spinner_wheel | urn_dice | prob.basic.probability_as_proportion, prob.dist.uniform_vs_biased | needle_exactly_on_a_line | formal | universal |
| sorted_bins_then_pick | sorter | prob.cond.conditional_and_independence, prob.bayes.update | conditioning_on_an_empty_bin | formal | universal |
| tasting_soup | urn_dice | prob.stat.sample_estimates | measuring_the_spread_between_spoonfuls | formal | adaptable |
| balance_point_of_weights | balance | prob.rv.expectation_as_weighted_average, prob.stat.mean_as_leveling | no_balance_point | formal | universal |
| fair_ticket_price | ledger | prob.rv.expectation_as_weighted_average | people_do_not_pay_the_fair_price | formal | adaptable |
| water_leveling_cups | fill_accumulate | prob.stat.mean_as_leveling, prob.stat.median_vs_mean | negative_values | symbolic | universal |
| city_routes | network_routes | graph.basic.graph_and_paths, graph.path.shortest, graph.conn.components | drawing_position_matters | formal | universal |
| friends_handshakes | network_routes | graph.basic.graph_and_paths, graph.deg.handshake_lemma | one_sided_relations | formal | universal |
| river_tributaries | network_routes | graph.tree.no_cycles, disc.rec.tree_recursion | river_deltas | formal | universal |
| outfit_combinations | tiles | disc.count.multiplication_principle, prob.basic.sample_space_grid | choices_that_depend_on_earlier_choices | symbolic | adaptable |
| hula_hoops_overlap | sorter | disc.set.venn_overlap, disc.logic.and_or, prob.basic.union_intersection | infinite_sets | formal | universal |
| odometer_dials | gears_sequence | arith.place.base_ten_carry, csmath.bin.place_value_binary | fractions_and_negatives_on_dials | symbolic | universal |
| clock_face_wrap | gears_sequence | csmath.mod.clock_arithmetic, trig.circle.periodic_wrap | modulus_other_than_twelve | formal | adaptable |
| beads_necklace_pattern | gears_sequence | found.pat.repeat_unit, arith.seq.arithmetic | sequences_without_a_repeating_rule | visual | universal |
| wheel_rider_height | slope_walker | trig.circle.height_on_wheel, trig.fn.sine_wave | angle_as_a_pure_number | formal | adaptable |
| walker_on_hill_compass | slope_walker | mvcalc.grad.steepest_ascent, mvcalc.pd.partial_slope | more_than_two_inputs | formal | universal |
| stacked_slices_loaf | fill_accumulate | mvcalc.int.volume_by_slices, calc2.int.solids_of_revolution | slices_that_are_not_parallel | formal | universal |

Resumen: 59 analogías. Por mecánica: slope_walker 9, tiles 7, grid_stretch 7, ledger 6, fill_accumulate 5, gears_sequence 5, sorter 4, balance 4, chest_key 3, machine_pipe 3, urn_dice 3, network_routes 3. Alcance: 47 universales, 12 adaptables, 0 locales. Los 37 nodos de la espina tienen al menos una analogía.

## 11. Reglas que hace cumplir el validador

- Toda analogía declara `id`, `mechanic`, `target_nodes`, `structure_map`, `breaks_at`, `fades_at_layer`, `cultural_scope`, `literacy_min` y `assets`.
- `mechanic` resuelve a un id de [`../E-mecanicas/mechanics.yaml`](../E-mecanicas/mechanics.yaml); `target_nodes` resuelven a ids del grafo; `fades_at_layer` es una capa del schema y nunca `abstract` ni `transfer`.
- `cultural_scope` distinto de `universal` exige `variants` no vacío; toda variante tiene texto en `locales/es` bajo `analogies.<id>.variants.<variant>.text` cuando su presentación difiere.
- Un nodo con `literacy: none` no puede referenciar una analogía con `literacy_min` distinto de `none`.
- Un nodo `adv.*` cuyo `layers` no incluye `real` ni `concrete` no puede declarar `analogy`.
- Ningún YAML de esta carpeta contiene texto visible al usuario; las claves `analogies.<id>.name` y `analogies.<id>.text` existen en `locales/es/analogies.yaml` para todo id.
- `assets` no contiene emojis; cada id de asset se resuelve en el catálogo de assets de [N](../N-ux-ui.md).
