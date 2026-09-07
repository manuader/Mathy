# Las tiras y los engranajes (`calc1.deriv.rules_as_structure`)

Minijuego del nodo 27 de la espina, "Reglas de derivación como estructura". Mecánica principal `machine_pipe`, secundarias `tiles` y `gears_sequence`; analogías `growing_rectangle` y `gear_train_ratios`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/27-calc1.deriv.rules_as_structure.md): un concepto, cuatro dificultades reales (leer la forma antes de calcular, saber hasta dónde llega el reparto, aceptar que la esquina no cuenta, contar todas las relaciones de la cadena), dos analogías que el jugador ya tiene de los nodos 15 y 20, un gesto (tirar apenas de la entrada y mirar qué se agrega), cinco morphs hasta las reglas escritas, la tubería como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Una tubería con dos o tres máquinas encadenadas. Debajo de cada máquina, su forma propia: un piso cuadrado de baldosas si es una potencia, dos pisos apilados si es una suma, un piso rectangular con los dos lados vivos si es un producto, un par de engranajes si es una composición. En la entrada, una manija que se puede tirar apenas.

Mapa objeto → concepto de `growing_rectangle`: los dos lados → los dos factores; la tira que se agrega a lo largo del primer lado → el segundo factor por lo que creció el primero; la tira del segundo lado → el primer factor por lo que creció el segundo; el cuadradito de la esquina → el producto de los dos crecimientos, despreciable; el área nueva total → la regla del producto.

Mapa de `gear_train_ratios`: engranaje → función; relación de dientes entre dos engranajes → tasa de cambio; una vuelta del primero → `dx`; vueltas del último → `dy`; producto de las relaciones a lo largo del tren → regla de la cadena; engranaje que gira al revés → tasa negativa.

Las baldosas aportan "cuánto se agrega"; los engranajes, "cuántas veces se multiplica". La tubería es la superficie que las contiene y aporta "dónde estoy parado". Punto de ruptura del piso: `shrinking_sides`, porque un lado que se acorta pediría baldosas negativas. Punto de ruptura del tren: `ratio_that_changes_with_position`, porque una relación de dientes es fija y una función curva no. Las dos se retiran en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la tubería cruza la pantalla de izquierda a derecha con la manija de entrada a la izquierda y la bandeja del resultado abajo a la derecha. Debajo de cada máquina, su forma. Desde `symbolic`, el teclado de fichas al pie. Gestos: `drag`, `tap`, `pinch` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tirar de la manija de entrada.** Todo lo encadenado responde a la vez: los pisos se alargan, las tiras se encienden, los engranajes giran y la barrita de la salida cambia de largo. El tirón se controla con una manivela de tamaño.
- **Tocar una tira.** La tira se despega del piso y cae en la bandeja del resultado. Es el gesto que arma la respuesta pieza por pieza.
- **Tocar la esquina.** También se despega, pero al achicar el tirón con la manivela se ve que se encoge mucho más rápido que las tiras y termina apagándose sola en la bandeja. El jugador no la descarta porque se lo digan: la ve desaparecer.
- **Encadenar máquinas.** Arrastrar una máquina de suma o de múltiplo constante a la tubería. Al tirar de la entrada, la salida total y la suma de las salidas de las ramas se miden con la misma barrita y coinciden.
- **Girar la manivela del tren.** Cada engranaje muestra su relación en un cartelito. La bandeja acepta el producto de las relaciones; si se coloca solo la última, el marcador del final se atrasa a la vista.
- **Tocar la máquina derivada.** Se dibuja al lado de la original, con la misma forma de tubería y una caja por cada caja. Es el gesto que muestra que derivar conserva la estructura.
- **Armar la regla con fichas.** Desde `symbolic`: el teclado ofrece la prima, el operador con corchetes, exponentes, el signo de producto y los nombres de las partes.

Errores con consecuencia física, nunca con la palabra "incorrecto": tirar mucho de la entrada agranda la esquina y el resultado deja de coincidir con la barrita de la salida, y el sobrante se ve; armar el producto con una sola tira deja un hueco alargado en el piso; olvidar una relación del tren atrasa el marcador final.

## Invariante matemático

Tres invariantes, uno por mecánica.

`same_input_same_output` (`machine_pipe`): la tubería es una función y responde igual a la misma entrada. Es lo que permite comparar la salida de la tubería completa con la suma de las salidas de las ramas: si coinciden para todo tirón, la derivada se reparte. Se ve romperse cuando el jugador intenta lo mismo con un producto y las dos barritas no coinciden nunca.

`area_preserved_under_rearrangement` (`tiles`): el área nueva es lo que es, se la reparta como se la reparta. Se ve confirmarse cuando las dos tiras y la esquina llenan exactamente el marco del piso agrandado. Se ve romperse cuando falta una pieza: queda un hueco de forma reconocible, y esa forma es la respuesta.

`same_step_every_turn` (`gears_sequence`): cada vuelta del primer engranaje produce siempre el mismo desplazamiento en el último. Es lo que hace que la relación total sea un número y no una historia. Se ve confirmarse girando la manivela varias vueltas y midiendo el marcador final.

Un movimiento válido pero inútil (tirar de la entrada con la manivela ya en el mínimo, encadenar una máquina de múltiplo por uno) no rompe nada: el juego lo ejecuta y, si se repite, la máquina que todavía no se derivó late como empujón suave.

## Representación visual

Primitiva dominante `compose`, de apoyo `scale` y `displace` ([H](../H-progresion-abstraccion.md)).

- `real`: el piso de baldosas que se agranda y el tablero de engranajes al lado. Solo se mira.
- `intuition`: el lado ya estirado y el piso nuevo sin dibujar; tres desenlaces (una tira, dos tiras, otro cuadrado entero) y después el real, con la esquina visible y sin explicar.
- `concrete`: la tubería con máquinas, los pisos vivos, el tren, la manivela del tirón y la bandeja del resultado.
- `visual`: la tubería se estiliza en cajas conectadas por flechas y la derivada se dibuja como una segunda tubería paralela, con un pulso que recorre las dos a la vez. El piso se dibuja sobre una grilla, con las dos tiras rellenas con trama distinta y la esquina en gris. El tren es una fila de círculos dentados con un marcador cada uno.
- `symbolic`: las tiras se aplanan en renglones, `Δu` y `Δv` se pliegan en `u'` y `v'`, aparecen el operador con corchetes y el producto de razones con los nombres intermedios que se tachan.
- `formal`: las cuatro frases con voz y la tubería fantasma al lado.

En `visual` todavía no hay reglas escritas: las máquinas muestran su forma, las tiras su tamaño y el resultado es una barra.

## Transición simbólica

Cinco pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Tira → producto de dos etiquetas: al soltar la primera tira en la bandeja en `visual`, la tira se aplana en un renglón que conserva sus dos medidas, el lado que no cambió y el tirón. La tira no se reemplaza.
2. Dos tiras y una esquina → tres términos: al soltar la segunda, las dos aparecen sumadas y la esquina cae al lado, encogiéndose mientras el jugador achica el tirón, hasta apagarse.
3. `Δ` → prima: al llevar la manivela del tirón al último diente, cada `Δu` se contrae en `u'` con el plegado del nodo 26, y el renglón del producto queda escrito.
4. Piso cuadrado → potencia con exponente: al repetir el tirón sobre un cubo de lado variable, las caras nuevas se apilan y se contraen en un renglón donde el exponente es la cantidad de tiras. Con la caja del exponente en `n`, el renglón se pliega en la forma general.
5. Tren → producto de razones: al girar la manivela con la expresión completa, cada cartelito se convierte en una razón con la forma de `dy/dx`, las razones se acomodan multiplicándose y los nombres intermedios se tachan de a pares. Tocar el resultado despliega el tren como fantasma.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la tubería fantasma: la derivada de una suma es la suma de las derivadas y una constante que multiplica sale afuera; la derivada de una potencia baja el exponente y lo resta uno; la derivada de un producto son dos términos, cada factor por la derivada del otro; la derivada de una composición es la derivada de la de afuera evaluada en la de adentro, por la derivada de la de adentro.

Casos verificados sobre el objeto: las reglas valen donde las derivadas de las partes existen; la derivada de una constante es cero porque un piso que no crece no agrega baldosas; un producto con un factor constante colapsa en el múltiplo constante, y se ve porque una de las dos tiras tiene ancho cero; la regla de la potencia se descubre contando tiras con exponente entero y se extiende a negativos y fraccionarios sin volver a contar.

El símbolo nuevo es el operador con corchetes, `d/dx[ ]`, junto con la prima aplicada a una expresión entre paréntesis. Nace de un problema de alcance: con la prima suelta no hay manera de distinguir `u v'` de `(u v)'`. `f'` y `dy/dx` llegaron en el nodo 26 y `f∘g` en el 20. Las cuatro entradas de cheatsheet del nodo, `cs.calc1.power_rule`, `cs.calc1.sum_and_constant_multiple_rules`, `cs.calc1.derivatives_of_basic_functions` y `cs.calc1.strategy_rewrite_before_differentiating`, quedan a un toque desde el panel lateral.

## Generalización

Las baldosas se retiran en `formal`. Antes, en `symbolic`, el piso ya perdió la grilla: queda el rectángulo con sus dos lados etiquetados y las tiras son renglones. Los engranajes se piden con un toque sobre el resultado de la cadena.

Variantes sin ayuda visual: polinomios con varios términos y coeficientes; potencias con exponente negativo y fraccionario, donde contar tiras ya no alcanza; productos de tres factores, donde aparecen tres términos y no dos; composiciones de tres capas, donde aparecen tres relaciones; y expresiones que conviene reescribir antes de derivar. Después, máquinas opacas: seno, coseno y exponencial entregadas con su regla en la panza, que el jugador no deduce y sí usa dentro de la estructura. Cuando deriva una expresión de varias formas anidadas sin pedir baldosas ni engranajes, nombra qué regla aplicó en cada paso y reescribe cuando conviene, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): el ejemplo de cofres no interviene acá, porque este nodo no invierte nada. El que sí corresponde es el de las baldosas del nodo 15, en su forma tardía: el marco de lado compuesto reaparece con los dos lados vivos en vez de fijos.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **El piso que se agranda.** `concrete`, `manipulate`. Un solo piso cuadrado, la manivela del tirón, tocar las tiras. Sin tubería todavía.
2. **La esquina que se apaga.** `concrete`, `explain`. Mismos parámetros; achicar el tirón y elegir entre animaciones por qué el área nueva son dos tiras y no una. Aparece `derivative_of_product_as_product`.
3. **Encadenar máquinas.** `concrete`, `recognize` y `manipulate`. La tubería con suma y múltiplo constante; comparar la salida total con la suma de las ramas.
4. **El tren.** `concrete`, `manipulate`. Dos engranajes y la manivela; armar el producto de las relaciones. Aparece `chain_rule_missing_inner`.
5. **Tiras con etiqueta.** `visual`, `manipulate` y `apply`. Los pisos se dibujan sobre grilla, las tiras se aplanan en renglones y aparecen `Δu` y `Δv`.
6. **Las reglas escritas.** `symbolic`, `apply`. Aparecen la prima sobre expresiones, el operador con corchetes y el producto de razones; el piso se pide con un toque.
7. **Formas anidadas.** Parámetros: exponentes negativos y fraccionarios, productos de tres factores, composiciones de tres capas y máquinas opacas.
8. **Reglas que nunca viste.** `formal` y `abstract`, `generalize`. Las cuatro frases con voz; el exponente en una caja; expresiones que conviene reescribir antes de derivar.

Qué endurece cada parámetro: el exponente en caja obliga a contar tiras sin verlas; el tercer factor rompe "el producto siempre da dos términos"; la tercera capa rompe "la cadena siempre son dos relaciones"; las máquinas opacas separan la estructura del cálculo; reescribir antes rompe "derivar es aplicar la regla que salta a la vista".

Desafíos de olimpíada: el nodo participa en `ch.calc.box_from_a_sheet` de [S](../S-desafios/S0-desafios.md), tier regional, donde el volumen de la caja se escribe como producto, se expande y se deriva antes de igualar a cero. La cheatsheet está abierta de entrada, con `cs.calc1.power_rule` entre las referencias del desafío.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro cuadrados de lado variable que crecen un poquito, cada uno con una pieza resaltada. Tocar la pieza que representa el área que se agrega. Distractores: la esquina sola, una sola tira, el cuadrado entero.
- `explain`: arrastrar el lado del cuadrado y elegir, entre tres animaciones, la que muestra por qué el área nueva son dos tiras. Una muestra las dos tiras y la esquina que se apaga; otra, una sola tira que deja un hueco; otra, la esquina tomada como todo el crecimiento. El distractor elegido clasifica: el hueco y la esquina son `derivative_of_product_as_product`.
- `manipulate`: encadenar la máquina de suma y la de múltiplo constante, y comprobar tirando del lado que la salida total es la suma de las salidas de las ramas por la constante.
- `apply`: `3x³ − 5x`; armar su derivada con las fichas de potencia, suma y múltiplo constante, sin el diagrama de baldosas y contra el tiempo objetivo del nodo.
- `generalize`: `xⁿ` con `n` en una caja que el jugador mueve. Con las baldosas, descubrir cuántas tiras aparecen para cada `n` y colocar la ficha del patrón. No hay piso dibujado más allá de `n = 3`.
- `transfer`: en una tubería de dos máquinas con engranajes, girar el de entrada y armar la relación de giros total como producto de las dos relaciones. También en `calc2.tech.substitution_undoes_chain`, `mvcalc.jac.local_stretch`, `adv.alg.polynomial_arithmetic` y `csmath.inv.loop_invariant`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `derivative_of_product_as_product`, patrón `missing_piece_tiles` sobre las baldosas: el juego coloca en el marco solo la esquina, que es la pieza que corresponde a la respuesta del jugador, superpone la forma verdadera y deja dos tiras vacías parpadeando. Voz: "El piso creció por dos lados. ¿Qué tiras faltan?". Las tiras están en la bandeja y al colocarlas el renglón cambia con un morph, no con un reemplazo.
- `chain_rule_missing_inner`, patrón `tree_unwrap` sobre los engranajes: el juego dibuja la expresión como dos ruedas encadenadas, anima el orden en que el jugador las abrió y muestra que midió la vuelta de la exterior sin contar la relación de la interior; el marcador del final se atrasa y la rueda interior late. Voz: "Mediste la rueda de afuera. ¿Cuánto gira la de adentro por cada vuelta?". El estado del jugador se conserva.

Los distractores de `explain` y de `apply` se generan desde las reglas `detect` de estas dos y desde las de los prerequisitos directos, en particular `distribute_over_wrong_op` del nodo 15.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_scene_growing_square_power_rule`, ruta mixta: pre-renderizada para la apertura y nativa para dibujarse sobre el piso del jugador. El cuadrado de lado variable crece, las dos tiras se encienden y la esquina se apaga al achicar el tirón; gramática `scale`. Parametrizada por el lado y por el tamaño del crecimiento, produce el nivel 1 y las animaciones de `explain`.
- `pipe_scene_rules_as_pipeline`, nativa. La expresión como cadena de máquinas y la tubería derivada dibujada en paralelo, con el pulso que recorre las dos a la vez; gramática `compose`. Parametrizada por la expresión y por el conjunto de reglas habilitadas, produce los niveles 3, 6 y 7.
- Reusadas: las escenas de composición del nodo 20 como apertura de la parte de engranajes, y `slope_scene_secants_collapse_to_tangent` del nodo 26 cuando el jugador pide ver de dónde sale una prima.
- Ninguna lleva texto rasterizado: lados, exponentes, relaciones, primas y corchetes los dibuja el runtime según el locale; las baldosas, los engranajes y las cajas de máquina son assets propios ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_expression_tree`: `forms` en {sum, const_multiple, power, product, composition} (solo las tres primeras hasta el nivel 3); `depth` (1 en los niveles 1 a 4, hasta 3 desde el 7); `term_count` (2 en los niveles 1 a 5, hasta 4 desde el 7); `opaque_machines` (falso hasta el nivel 7); `seed`.
- `gen_growing_rectangle`: `sides` en {equal, different}; `exponent` (entero de 1 a 3, o la caja con `n` en el nivel 8); `delta_start` y `delta_ratio` (cuánto se achica el tirón por vuelta de manivela); `show_corner` (verdadero siempre hasta que el jugador lo apaga).
- `gen_gear_train`: `stages` (2 en el nivel 4, hasta 3 desde el 7); `ratio_range`; `reversed_stage` (verdadero desde el nivel 7, para las tasas negativas).
- `gen_tile_keyboard`: `symbols` (subconjunto de prima, corchetes, exponentes, signo de producto, nombres de partes); `distractors` desde `detect` de las dos misconceptions del nodo.

**Literacy soportada:** de `short_text` a `full_text`. Las capas `real`, `intuition` y `concrete` se juegan sin leer (tirar de la manija, tocar tiras, encadenar por forma, girar la manivela, mano fantasma, `explain` entre animaciones), pero el mínimo es `short_text` porque las máquinas llevan su regla escrita en la panza desde `visual` y las reglas quedan como renglones cortos. En `full_text` se agregan los enunciados de las condiciones de validez.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la manija de la entrada y tira apenas; el piso cuadrado se alarga por los dos lados, dos tiras se encienden y la esquina queda gris; en la salida aparece la barrita. La escena vuelve al inicio y la manija late. Se repite solo si el jugador se queda quieto. La demostración del tren (nivel 4) es nueva y se muestra una vez. La de encadenar máquinas no se repite: es la del nodo 20 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions, cantidad de vueltas de manivela exigidas y espera de la demostración viven en [K](../K-evaluacion.md).
