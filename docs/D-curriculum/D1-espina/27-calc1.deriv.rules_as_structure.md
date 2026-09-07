# 27 — Reglas de derivación como estructura (`calc1.deriv.rules_as_structure`)

> Locale `es`: "Reglas de derivación como estructura". Minijuego: [Las tiras y los engranajes](../../F-minijuegos/calc1.deriv.rules_as_structure.md).

**Nodo:** `calc1.deriv.rules_as_structure` · **Área:** calc1 · **Nivel:** 5 · **Primitiva:** `compose` · **Mecánica principal:** `machine_pipe` (secundarias `tiles` y `gears_sequence`) · **Literacy:** `short_text` · **Analogía:** `growing_rectangle` (con `gear_train_ratios` para las máquinas encadenadas)

## 1. Concepto

Las reglas de derivación no son una lista para memorizar: son la lectura de cómo está armada la expresión. Al terminar, el jugador mira una expresión, reconoce si es una suma, un múltiplo, una potencia, un producto o una composición, y aplica la regla que corresponde a esa forma sin haberla aprendido de memoria. Antes sabía medir la pendiente exacta de una curva punto por punto, con la manivela; ahora produce la pendiente de cualquier expresión armada con máquinas, sin volver a medir.

## 2. Prerequisitos

- `calc1.deriv.rate_as_slope_limit` (nodo 26): la pendiente exacta. Se usan el triángulo de subida y avance, el cociente que se estabiliza al achicar el paso, y las dos notaciones que nacieron allí, `f'(x)` y `dy/dx`. La segunda es la que hace legible la cadena: se lee como razón y las razones se multiplican.
- `alg.fn.composition` (nodo 20): dos máquinas conectadas. Se usan la tubería, el orden "primero la de adentro", y la misconception `chain_rule_missing_inner`, que allí era olvidar evaluar en `g(x)` y acá es olvidar multiplicar por `g'(x)`.
- `alg.expr.distributive_tiles` (nodo 15): el área como modelo del producto. Se usan las baldosas, el marco de lado compuesto y la costumbre de contar las piezas que faltan, que es exactamente lo que este nodo pide con la esquina.

La arista que no sigue el orden escolar es la organización entera. La escuela dicta cinco reglas en fila: potencia, suma, producto, cociente, cadena. [C0](../../C-knowledge-graph/C0-esquema.md) las junta en un solo nodo cuyo contenido es la estructura, y cuelga las especializaciones después: `calc1.deriv.chain_as_gears`, `calc1.deriv.product_as_growing_rectangle` y `calc1.deriv.quotient_from_product` tienen a este nodo como único prerequisito. El nodo no depende de la recta tangente ni de la continuidad: para derivar una expresión armada con máquinas alcanza con saber qué mide la derivada y cómo está armada.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar una fórmula. Son cuatro capacidades que "derivar" mezcla:

1. **Leer la forma antes de calcular.** Frente a `3x² · sen(x)` hay que ver un producto, no dos funciones; frente a `(2x + 1)⁵`, una composición y no una potencia. Es la capacidad que sostiene `cs.calc1.strategy_rewrite_before_differentiating` y la que vuelve innecesaria la lista de reglas.
2. **Saber hasta dónde llega el reparto.** La derivada se reparte sobre la suma y sale del múltiplo constante, y no se reparte sobre el producto ni sobre la composición. Quien aprendió "se reparte" en el nodo 15 lo aplica de más y produce `derivative_of_product_as_product`.
3. **Aceptar que la esquina no cuenta.** Cuando el rectángulo crece por los dos lados aparecen dos tiras y un cuadradito. El cuadradito existe, se ve, y aun así desaparece del resultado. Es la primera vez que el jugador descarta algo que está a la vista, y solo lo acepta si él mismo achica el crecimiento y ve que la esquina se vuelve despreciable frente a las tiras.
4. **Contar todas las relaciones de la cadena.** En un tren de engranajes, cuánto gira el último por vuelta del primero es el producto de todas las relaciones. Quedarse con la del último es `chain_rule_missing_inner`, el error más caro del área.

Las cuatro son independientes y la mecánica las separa: la primera vive en la tubería, la segunda y la tercera en las baldosas, la cuarta en los engranajes.

## 4. Problema intuitivo

Un piso cuadrado de baldosas que se agranda. El dueño quiere alargar el lado un poquito y necesita saber cuántas baldosas comprar. La pregunta, por voz o por gesto: si el lado crece así de poco, ¿qué parte del piso es nueva?

En `intuition` la escena se detiene con el lado ya estirado y el piso nuevo todavía sin dibujar. Tres desenlaces: lo nuevo es una sola tira a lo largo; lo nuevo son dos tiras, una por lado; lo nuevo es otro cuadrado entero del mismo tamaño. El jugador elige y después ve. La segunda es la correcta, y la esquina queda ahí, pequeña y visible, sin explicación por ahora.

Al lado del piso hay un tablero con dos engranajes encadenados y una manivela. La misma pregunta con otra piel: si giro la manivela una vuelta, ¿cuánto gira el último?

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por familia de reglas ([G0](../../G-analogias/G0-reglas.md)).

`growing_rectangle` (mecánica `tiles`) es la del YAML. Mapa: los dos lados → los dos factores; la tira que se agrega a lo largo del primer lado → el segundo factor por lo que creció el primero; la tira del segundo lado → el primer factor por lo que creció el segundo; el cuadradito de la esquina → el producto de los dos crecimientos, despreciable; el área nueva total → la regla del producto. Invariante: el área agregada es la suma de las dos tiras más una esquina que se achica más rápido que ellas. Ruptura: `shrinking_sides`, porque un lado que se acorta pediría baldosas negativas.

`gear_train_ratios` (mecánica `gears_sequence`) aporta la cadena. Mapa: engranaje → función; relación de dientes → tasa de cambio; una vuelta del primero → `dx`; vueltas del último → `dy`; producto de las relaciones a lo largo del tren → regla de la cadena; engranaje que gira al revés → tasa negativa. Ruptura: `ratio_that_changes_with_position`, porque una relación de dientes es fija y una función curva no. Las dos se retiran en `formal`.

Por qué estas y no otras: el jugador ya tiene las dos pieles, las baldosas del nodo 15 y los engranajes del 20. La analogía no le pide un objeto nuevo, le pide ver la derivada dentro de objetos que usó para otra cosa. La tubería de `machine_pipe` es la superficie que las contiene: cada máquina lleva su regla en la panza y derivar es recorrer la tubería.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `machine_pipe` es la mecánica principal y provee la superficie: la expresión como cadena de máquinas, con una entrada y una salida. `tiles` provee el piso que crece, donde se juegan la potencia y el producto. `gears_sequence` provee el tren, donde se juega la cadena. Las tres se encuentran en un gesto: tirar apenas de la entrada y mirar qué se agrega en cada etapa ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap`, `pinch` y `scrub`.

1. Una tubería con dos o tres máquinas. Debajo de cada una, su forma propia: un piso cuadrado si es una potencia, dos pisos apilados si es una suma, un piso rectangular con los dos lados vivos si es un producto, un par de engranajes si es una composición.
2. Demostración: una mano fantasma tira apenas de la manija de la entrada. El piso cuadrado se alarga por los dos lados, dos tiras se encienden, la esquina queda gris y en la salida aparece una barrita. La escena vuelve al inicio.
3. El jugador tira de la manija. Todo lo encadenado responde a la vez: las tiras aparecen, los engranajes giran, la barrita cambia de largo. Al tocar una tira, la tira se despega y va a la bandeja del resultado; al tocar la esquina, también se despega, pero al achicar el tirón con la manivela se ve que se encoge mucho más rápido y se apaga sola.
4. El jugador arma la tubería con máquinas de suma y de múltiplo constante. Al tirar de la entrada, la salida total y la suma de las salidas de cada rama coinciden: eso es que la derivada se reparte sobre la suma.
5. El jugador gira la manivela del tren. Cada engranaje muestra su relación en un cartelito y la bandeja acepta el producto de las relaciones; si pone solo la última, el marcador del final se atrasa a la vista.
6. Éxito: la bandeja se ilumina y la máquina derivada queda dibujada al lado de la original, con la misma forma de tubería. Sin cartel.

Errores con consecuencia física: tirar mucho de la entrada agranda la esquina y el resultado deja de coincidir con la barrita de la salida, y el sobrante se ve; armar el producto con una sola tira deja un hueco alargado en el piso. Nada se llama "incorrecto".

## 7. Representación visual

Capa `visual`, con la primitiva dominante `compose` y dos de apoyo de [H](../../H-progresion-abstraccion.md).

`compose` (dominante). La tubería se estiliza en cajas conectadas por flechas, y la derivada se dibuja como una segunda tubería paralela con las mismas cajas y las reglas dentro. Lo que se desplaza es el pulso que entra por la izquierda y recorre las dos tuberías a la vez. Lo que se conserva es la forma: la tubería derivada tiene la estructura de la original, con una caja por cada caja.

`scale` (apoyo). El piso se dibuja como rectángulo sobre una grilla; los dos lados se estiran y las dos tiras se rellenan con trama distinta. Lo que se escala es el tirón, que se controla con una manivela: al achicarlo, las tiras se afinan de manera proporcional y la esquina se afina al cuadrado, hasta ser un punto.

`displace` (apoyo). El tren se dibuja como una fila de círculos dentados con un marcador en cada uno. Cada vuelta del primero desplaza los marcadores de los siguientes, y el desplazamiento del último se muestra como una barra que es el producto de las relaciones, no la última.

Todavía no hay reglas escritas: las máquinas muestran su forma, las tiras muestran su tamaño y el resultado es una barra.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Tira → producto de dos etiquetas.** Al soltar la primera tira en la bandeja en `visual`, la tira se aplana en un renglón que conserva sus dos medidas, el lado que no cambió y el tirón. Queda `v · Δu`. La tira no se reemplaza.
2. **Dos tiras y una esquina → tres términos.** Al soltar la segunda, las dos aparecen sumadas y la esquina cae al lado, encogiéndose mientras el jugador achica el tirón, hasta apagarse. Queda la forma del producto, todavía con `Δ`.
3. **`Δ` → prima.** Cuando el jugador lleva la manivela del tirón al último diente, cada `Δu` se contrae en `u'` con la animación de plegado del nodo 26, y el renglón del producto queda escrito.
4. **Piso cuadrado → potencia con exponente.** Al repetir el tirón sobre un cubo de lado variable, las caras nuevas se apilan y se contraen en un renglón donde el exponente es la cantidad de tiras. Con la caja del exponente en `n`, el renglón se pliega en la forma general.
5. **Tren → producto de razones.** Al girar la manivela con la expresión completa en pantalla, cada cartelito se convierte en una razón con la forma de `dy/dx`, las razones se acomodan multiplicándose y los nombres intermedios se cancelan a la vista, como fichas que se tachan de a pares. Tocar el resultado despliega el tren como fantasma.

## 9. Notación matemática

Quedan las reglas escritas como identidades entre expresiones, y una notación nueva para decir dónde se aplica cada una.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), cada símbolo llega con su problema. `f'(x)` y `dy/dx` llegaron en el nodo 26 y `f∘g` en el 20. Lo nuevo acá es el operador con corchetes, `d/dx[ ]`, y la prima aplicada a una expresión entre paréntesis, `(u v)'`. El problema que los hace necesarios es de alcance: cuando la expresión tiene varias partes, la prima suelta no dice sobre cuál cae. Escribir `u v'` y `(u v)'` es escribir dos cosas distintas, y sin corchetes no hay manera de distinguirlas. El operador nace, entonces, para marcar el pedazo de expresión al que se le aplica la regla, y el juego lo introduce en el momento en que el jugador arma su primera tubería de dos máquinas y necesita señalar una sola.

La cadena aporta además una convención de escritura: `dy/dx = dy/du · du/dx`, con los nombres intermedios que se cancelan como fichas. No es una división de verdad, y el nodo 26 ya lo dijo; acá se usa esa forma justamente porque la cancelación a la vista es lo que hace recordable la regla.

## 10. Definición formal

Capa `formal`: texto corto con voz y la tubería fantasma al lado. Cuatro frases, de a una: "La derivada de una suma es la suma de las derivadas, y una constante que multiplica sale afuera." "La derivada de una potencia baja el exponente y lo resta uno." "La derivada de un producto son dos términos: cada factor por la derivada del otro." "La derivada de una composición es la derivada de la de afuera, evaluada en la de adentro, por la derivada de la de adentro."

Condiciones y casos especiales, verificados sobre el objeto: las reglas valen donde las derivadas de las partes existen, y en un punto donde una parte tiene pico la expresión entera puede no ser derivable. La regla de la potencia vale con exponente entero por conteo de tiras y se extiende a negativos y fraccionarios sin volver a contar. La derivada de una constante es cero: un piso que no crece no agrega baldosas. Un producto con un factor constante colapsa en el múltiplo constante, y se ve porque una de las dos tiras tiene ancho cero.

Ya jugado: las cuatro frases enteras, en la capa concreta. Nuevo: la palabra "regla", el alcance de las condiciones y la extensión de la potencia más allá del conteo.

## 11. Propiedades

- **La derivada se reparte sobre la suma.** Ligada a las dos tuberías en paralelo: la salida de la tubería completa coincide con la suma de las salidas de las ramas.
- **Un factor constante atraviesa la derivada.** Ligada a la máquina de múltiplo constante, que estira la barrita de salida por el mismo número sin importar cuánto se tiró de la entrada.
- **La derivada no se reparte sobre el producto.** Ligada al hueco que queda en el piso cuando el jugador se guarda una sola tira: es la propiedad enunciada por lo que falta.
- **El término de la esquina es despreciable.** Ligada a la manivela del tirón: las tiras se afinan proporcionalmente, la esquina se afina mucho más rápido y termina apagándose.
- **Las tasas se multiplican al encadenar.** Ligada al tren: la relación total entre el primero y el último es el producto de las relaciones intermedias, y agregar un engranaje agrega un factor.
- **Derivar conserva la estructura.** Ligada a la tubería derivada, que tiene una caja por cada caja de la original. Es la propiedad que hace innecesaria la lista de reglas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varios cuadrados de lado variable que crecen un poquito, cada uno con una pieza resaltada. Tocar la pieza que representa el área que se agrega. Los distractores son la esquina sola, una sola tira y el cuadrado entero.
- `explain`: arrastrar el lado del cuadrado y elegir, entre tres animaciones, la que muestra por qué el área nueva son dos tiras y no una. Una muestra las dos tiras y la esquina que se apaga; otra, una sola tira que deja un hueco; otra, la esquina tomada como todo el crecimiento.
- `manipulate`: encadenar en la tubería la máquina de suma y la de múltiplo constante, y comprobar tirando del lado que la salida total es la suma de las salidas de las ramas, multiplicada por la constante.
- `apply`: recibir `3x³ − 5x` y armar su derivada con las fichas de potencia, suma y múltiplo constante, sin el diagrama de baldosas y contra el tiempo objetivo del nodo.
- `generalize`: recibir `xⁿ` con `n` en una caja que el jugador mueve. Con las baldosas, descubrir cuántas tiras aparecen para cada `n` y colocar la ficha del patrón. No hay piso dibujado más allá de `n = 3`: el jugador continúa el conteo sin verlo.
- `transfer`: en una tubería de dos máquinas con engranajes, girar el de entrada y armar la relación de giros total como producto de las dos relaciones. Es `csmath.inv.loop_invariant` en su forma de cadena de pasos.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`derivative_of_product_as_product`** (`missing_piece_tiles` sobre las baldosas). El jugador responde que la derivada de `u v` es `u' v'`. El juego coloca en el marco solo la esquina, que es la pieza que corresponde a esa respuesta, y superpone la forma verdadera: quedan dos tiras vacías parpadeando. Voz: "El piso creció por dos lados. ¿Qué tiras faltan?". Las tiras están en la bandeja, y al colocarlas el renglón cambia con un morph, no con un reemplazo.
- **`chain_rule_missing_inner`** (`tree_unwrap` sobre los engranajes). El jugador deriva la de afuera y se olvida del factor de adentro. El juego dibuja la expresión como dos ruedas encadenadas, anima el orden en que el jugador las abrió y muestra que midió la vuelta de la exterior sin contar la relación de la interior: el marcador del final se atrasa y la rueda interior late. Voz: "Mediste la rueda de afuera. ¿Cuánto gira la de adentro por cada vuelta?". El estado del jugador se conserva.

Los distractores de `explain` y de `apply` se generan desde las reglas `detect` de estas dos y desde las de los prerequisitos directos, en particular `distribute_over_wrong_op` del nodo 15, que acá reaparece como repartir la derivada sobre un producto.

## 13. Generalización

La analogía se retira en `formal`, como declaran las dos entradas de [G](../../G-analogias/G0-reglas.md). Antes, en `symbolic`, el piso ya perdió la grilla: queda el rectángulo con sus dos lados etiquetados y las tiras son renglones. Los engranajes se piden con un toque sobre el resultado de la cadena.

Variantes sin ayuda visual, en orden: polinomios con varios términos y coeficientes; potencias con exponente negativo y fraccionario, donde el conteo de tiras ya no alcanza; productos de tres factores, donde aparecen tres términos y no dos; composiciones de tres capas, donde aparecen tres relaciones; y expresiones que conviene reescribir antes de derivar.

Máquinas que no son baldosas. El nodo termina con derivadas de funciones básicas que no tienen piso: seno, coseno y exponencial, entregadas como máquinas con su regla en la panza. El jugador no las deduce, las usa dentro de la estructura y comprueba que la tubería sigue funcionando. Se evalúa que la estructura (leer la forma, aplicar su regla, encadenar) se sostiene cuando las piezas son opacas.

El nodo está en `abstract` cuando el jugador deriva una expresión de varias formas anidadas sin pedir baldosas ni engranajes, nombra qué regla aplicó en cada paso y reescribe antes de derivar cuando conviene.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `calc2.tech.substitution_undoes_chain` (`chest_key` y `grid_stretch`): la cadena leída al revés. El cofre tiene adentro una composición y la llave de sustitución la deshace antes de acumular.
- `mvcalc.jac.local_stretch` (`grid_stretch`): la sábana estirada alrededor de un punto, donde el factor de estiramiento local es un producto de derivadas y el jugador lo reconoce sin tubería.
- `adv.alg.polynomial_arithmetic` (`ledger`): derivar un polinomio como operación sobre la lista de coeficientes, donde la regla de la potencia se ve como un corrimiento de columnas.
- `csmath.inv.loop_invariant` (`fill_accumulate` y `balance`): un bucle donde cada vuelta multiplica lo acumulado por un factor, y la relación entre entrada y salida es el producto de los factores de todas las vueltas.

Concepto siguiente: `calc1.deriv.chain_as_gears`. Frase puente, narrada sobre el tren con dos engranajes: "Ya sabés que las relaciones se multiplican cuando hay dos ruedas. ¿Y si el tren tiene cinco, y una de ellas gira al revés?". Se agregan engranajes al tren y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `tile_scene_growing_square_power_rule` es de ruta mixta, pre-renderizada para la apertura y nativa sobre el piso del jugador: el cuadrado de lado variable crece, las dos tiras se encienden y la esquina se apaga al achicar el tirón; gramática `scale`, parametrizada por el lado y el tamaño del crecimiento, produce también las animaciones de `explain`. `pipe_scene_rules_as_pipeline` es nativa: la expresión como cadena de máquinas y la tubería derivada dibujada en paralelo, con el pulso que recorre las dos a la vez; gramática `compose`, parametrizada por la expresión y por el conjunto de reglas habilitadas. Se reúsan las escenas de composición del nodo 20 como apertura de la parte de engranajes. Ninguna lleva texto rasterizado: lados, exponentes y relaciones los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se refuerza `op_derivative` ([M](../../M-calculadora/M0-progresion.md)), que el nodo 26 había habilitado en su forma numérica. Desde acá el ícono de `d/dx` devuelve la forma simbólica para expresiones armadas con fichas, y no devuelve solo el resultado: escribe la tubería derivada, con un renglón por regla aplicada y el nombre de la forma que la disparó. Si el nodo decae, el ícono muestra óxido y la calculadora vuelve a la respuesta numérica del nodo 26.

**Edad universal:** el nodo es `short_text` porque las reglas se leen como renglones cortos desde la capa `symbolic` y las máquinas llevan su regla escrita en la panza ([Q](../../Q-edad-universal.md)). Las capas `real`, `intuition` y `concrete` se juegan sin leer: tirar de la manija, tocar tiras, encadenar máquinas por forma, girar la manivela y `explain` entre animaciones. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa de tiras etiquetadas y arma las reglas con el teclado de fichas en vez de tipear.
