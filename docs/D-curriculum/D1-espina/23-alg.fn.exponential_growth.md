# 23 — Multiplicar en cada paso (`alg.fn.exponential_growth`)

> Locale `es`: "Multiplicar en cada paso". Minijuego: [La manivela que duplica](../../F-minijuegos/alg.fn.exponential_growth.md).

**Nodo:** `alg.fn.exponential_growth` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `nonlinear` · **Mecánica principal:** `gears_sequence` (secundaria `slope_walker`) · **Literacy:** `icons` · **Analogía:** `paper_folding_doubles`

## 1. Concepto

Hay dos maneras de avanzar paso a paso: sumando siempre lo mismo o multiplicando siempre por lo mismo. Al terminar, el jugador distingue las dos con solo mirar cómo cambia la ficha entre una vuelta y la siguiente, predice que la que multiplica termina pasando a la que suma por más ventaja que le den, y reconoce que un factor menor que uno es el mismo mecanismo yendo hacia abajo. Antes sabía que el cuadrado crece rápido porque el lado se multiplica una vez por sí mismo; ahora ve qué pasa cuando la multiplicación se repite en cada paso.

## 2. Prerequisitos

- `alg.fn.linear_slope` (nodo [19](19-alg.fn.linear_slope.md)): el crecimiento que suma lo mismo en cada paso. Se usan el caminante, el triángulo de subida y avance, la lectura de la pendiente y el invariante de la mecánica: en una rampa, lo empinado no depende del tamaño del paso. Sin esa referencia, "crecer rápido" no significa nada; el contraste es el nodo.
- `arith.frac.parts_and_ratio` (nodo [08](08-arith.frac.parts_and_ratio.md)): la razón entre dos cantidades. Se usa para leer el factor como una razón entre la ficha de una vuelta y la de la anterior, y para que un factor menor que uno sea una cantidad legítima y no un error.

La arista con las fracciones no sigue el orden escolar, que llega al decaimiento mucho después del crecimiento y lo trata como un tema aparte. [C0](../../C-knowledge-graph/C0-esquema.md) las junta porque son el mismo engranaje: el factor `1/2` no es otra historia, es la misma manivela girando con otro diente.

## 3. Dificultad cognitiva real

Lo difícil no es calcular potencias sino cuatro capacidades:

1. **Leer el cambio como razón y no como diferencia.** Frente a la serie 3, 6, 12, 24 el jugador entrenado en sumas ve "+3, +6, +12" y busca un patrón en las diferencias. Ver "×2, ×2, ×2" es un cambio de mirada, no una cuenta más.
2. **Aceptar que lo repetido alcanza a lo grande.** Una rampa que empieza con mucha ventaja parece imposible de alcanzar. Que la curva la pase, y que el momento en que la pasa se pueda señalar con el dedo, es contraintuitivo hasta que se ve.
3. **Distinguir sumar exponentes de multiplicarlos.** Doblar tres veces y después dos veces es doblar cinco veces, no seis. Falla en `exponent_rules_mixed`, que este nodo comparte con `alg.pow.same_base_stack`.
4. **Ver el decaimiento como el mismo mecanismo.** Multiplicar por `1/2` en cada paso no es "restar la mitad" ni una operación distinta: es la misma manivela, y la ficha se acerca al cero sin llegar, cosa que el nodo deja abierta a propósito.

Las cuatro se reparten entre las dos mecánicas: la primera, la tercera y la cuarta viven en la manivela; la segunda vive en la carrera entre la rampa y la curva.

## 4. Problema intuitivo

Una hoja de papel sobre una mesa. Alguien la dobla al medio, y otra vez, y otra vez. Se ve el borde: dos capas, cuatro, ocho. La pregunta, por voz o por gesto: si la doblás diez veces, ¿qué grosor tiene la pila?

En `intuition` la escena se detiene en el doblez número cinco. Tres desenlaces dibujados: la pila llega a la altura de un dedo, la pila llega a la altura de la mesa, la pila llega al techo. El jugador elige y después ve la pila crecer hasta pasar la que eligió. La sorpresa no es un premio: es el contenido del nodo. La escena se corta en el doblez donde el papel ya no se puede doblar, que es la ruptura declarada de la analogía.

## 5. Analogía del mundo real

`paper_folding_doubles`, sobre `gears_sequence` ([G0](../../G-analogias/G0-reglas.md)). Mapa del YAML: hoja sola → valor inicial; un doblez → multiplicar por dos; cantidad de dobleces → exponente; capas después de doblar → dos a la n; contar dobleces hasta llegar a un grosor → logaritmo en base dos; desdoblar una vez → dividir por dos.

Invariante: cada vuelta de la manivela hace lo mismo que la anterior. Es `same_step_every_turn`, el invariante de la mecánica, con una lectura nueva: lo que se repite igual es una multiplicación y no una suma. Ruptura declarada: `half_a_fold`. No existe medio doblez, así que la analogía no puede mostrar exponentes fraccionarios, y por eso se desvanece en `symbolic`, antes que en los nodos vecinos. Los exponentes fraccionarios llegan en `alg.rad.root_as_fractional_power`, ya sin papel.

La segunda mecánica, `slope_walker`, no viste nada: compara. La rampa del nodo 19 y la curva del engranaje que multiplica corren sobre la misma cuadrícula, y el jugador ve el punto donde se cruzan. Aporta lo que el papel no puede: el contraste con lo que el jugador ya sabía.

Por qué esta y no otra. Los conejos que se reproducen conservan la multiplicación repetida pero traen tiempo, muerte y azar, tres cosas que el nodo no necesita y que el jugador leería como parte de la estructura. El interés de un banco conserva la estructura entera pero exige entender dinero y porcentajes, y `literacy` sube. La hoja doblada no exige nada: el gesto es universal y el resultado se ve en el borde.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `gears_sequence` es la principal y da la manivela; `slope_walker` aporta la pista de comparación ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `scrub`, `drag` y `tap`.

1. Una manivela, una hoja sobre una pista con marcas y una ficha que muestra las capas. Cada giro completo dobla la hoja y la ficha cambia.
2. Demostración: una mano fantasma gira la manivela tres veces. En cada giro la pila se duplica y la ficha salta a la marca correspondiente de la pista. La pista no es regular: las marcas se van separando, y eso se ve antes de que nadie lo diga.
3. El jugador gira. Puede girar hacia atrás: la pila se desdobla y la ficha vuelve. Girar hacia atrás desde una capa sola no hace nada, y el engranaje resiste.
4. Cambiar el diente. Un selector cambia el factor de la manivela: dos, tres, diez. Al lado, en el mismo tablero, hay una segunda manivela que suma en vez de multiplicar, con su propia ficha. Las dos pistas corren en paralelo.
5. La carrera. La manivela que suma arranca muy adelante. El jugador gira las dos a la vez y busca el momento del cruce. Puede volver atrás y repetir con otra ventaja inicial: el cruce se mueve, pero siempre existe.
6. El diente chico. El selector admite factores menores que uno, escritos como razón. La ficha se achica en cada vuelta y se acerca a la marca del cero sin tocarla. La pista se estira para que las marcas sigan siendo visibles.
7. Encadenar. El jugador aplica una tanda de tres vueltas y después una de dos, y compara con una tanda de cinco de una sola vez. Las dos fichas caen en la misma marca. Después compara con una tanda de seis, y no caen.

Nada se llama "incorrecto". La ficha que cae en otra marca queda al lado de la esperada, y las dos marcas quedan iluminadas.

## 7. Representación visual

Capa `visual`, primitiva `nonlinear` dominante ([H](../../H-progresion-abstraccion.md)).

La hoja se convierte en una columna de capas, y la columna en una barra. Lo que se escala es la barra, siempre por el mismo factor; lo que se desplaza es la ficha sobre la pista, que da saltos cada vez más largos. Lo que se conserva es la razón entre una barra y la anterior, y el juego la muestra como una llave de altura que se repite idéntica entre cada par de barras vecinas, mientras las barras crecen.

`slope_walker` entra abajo con las dos trayectorias sobre la misma cuadrícula: la recta de la rampa y la curva del engranaje, con el punto de cruce marcado y el rastro de las dos fichas.

Con factor menor que uno, la barra se achica y la llave de altura sigue siendo la misma, ahora hacia adentro. El eje se comprime para que la barra nunca desaparezca del todo, y eso deja preparada la pregunta del nodo 25.

Todavía no hay ejes rotulados, ni la escala logarítmica, ni la curva definida como función continua entre las marcas: el jugador solo tiene las vueltas enteras.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Capas contadas → producto de factores.** Al tocar la pila en `visual`, las capas se despegan y se reescriben como una fila de doses multiplicados, tantos como vueltas se dieron.
2. **Fila de factores → base con exponente.** Al tocar la fila, los factores se apilan y el conteo sube a la esquina superior derecha: `2 · 2 · 2` se contrae en `2³`, con el morph que ya usó `arith.pow.repeated_scaling`. La fila queda un rato como sombra debajo.
3. **Manivela → número de vueltas en la ficha del exponente.** Al girar de nuevo con la etiqueta ya presente, el exponente cuenta solo. El jugador puede tocarlo y arrastrarlo: es la primera vez que el exponente se comporta como una entrada y no como un rótulo.
4. **Hoja inicial → factor de arranque.** Al empezar con una pila de tres hojas en vez de una, el tres se despega y se pone adelante: `3 · 2ⁿ`. El valor inicial deja de estar escondido en el dibujo.
5. **Diente chico → razón en la base.** Al elegir un factor menor que uno, la base se escribe como la razón que el jugador ya vio en el nodo 08, y la barra que se achica queda unida a ella por un hilo hasta que el jugador suelta.

## 9. Notación matemática

Queda `a · bⁿ`, con `b` como el factor de cada paso, `n` como la cantidad de pasos y `a` como el valor de arranque.

El nodo no introduce símbolos nuevos. Por la regla de oro de [H](../../H-progresion-abstraccion.md), cada símbolo llega con su problema, y el exponente ya llegó con el suyo en `arith.pow.repeated_scaling`: escribir "escalar n veces por el mismo factor" sin repetir el factor. Lo que se vuelve necesario acá es una **convención de escritura: el exponente pasa a ser una entrada**. Hasta este nodo el exponente era un número escrito por el juego, parte del nombre de la cantidad. El problema que fuerza el cambio es la carrera: para preguntar en qué vuelta la curva pasa a la rampa, hay que poder mover el exponente y ver qué pasa, y eso obliga a tratarlo como la ficha que se arrastra. De ahí salen las tres entradas de cheatsheet del nodo: `cs.alg.exponential_multiplies_each_step`, `cs.alg.linear_adds_exponential_multiplies` y `cs.alg.fractional_base_decays`.

Las reglas de manipulación de exponentes con la misma base son de `alg.pow.same_base_stack`, y este nodo solo usa la que aparece en la mesa: tandas encadenadas suman vueltas. El exponente cero y los exponentes negativos se dejan para ese nodo; acá, girar hacia atrás desde una capa sola no hace nada todavía.

## 10. Definición formal

Capa `formal`: texto corto con voz y la manivela al lado. Tres frases, de a una: "Un crecimiento es exponencial cuando cada paso multiplica por el mismo factor." "El factor es la razón entre un valor y el anterior, y no cambia nunca." "Si el factor es mayor que uno la cantidad crece, y si está entre cero y uno se achica."

Condiciones y casos, verificados sobre el objeto: el factor tiene que ser positivo, porque un diente negativo haría saltar la ficha de un lado al otro en cada vuelta y eso no es esta estructura; con factor exactamente uno la ficha no se mueve y la curva se vuelve una recta horizontal, que es el caso de frontera; el valor de arranque escala todo sin cambiar el factor, y por eso una ventaja inicial nunca alcanza para ganar la carrera; una cantidad que se multiplica por un factor menor que uno se acerca al cero y nunca llega, cosa que el juego marca y no resuelve.

Ya jugado: las tres frases enteras y los cuatro casos. Nuevo: la palabra "exponencial" y el nombre "factor de crecimiento" para lo que el jugador venía llamando el diente.

## 11. Propiedades

- **La razón entre pasos consecutivos es constante.** Ligada a la llave de altura que se repite igual entre cada par de barras vecinas.
- **Sumar en cada paso da una recta; multiplicar en cada paso da una curva que la termina pasando.** Ligada a la carrera y al punto de cruce que se mueve pero siempre existe.
- **Encadenar tandas suma las vueltas.** `bᵐ · bⁿ = bᵐ⁺ⁿ`, ligada a aplicar tres vueltas y después dos y caer en la misma marca que con cinco.
- **Aplicar una tanda a un resultado ya elevado multiplica las vueltas.** `(bᵐ)ⁿ = bᵐ·ⁿ`, ligada a repetir la tanda entera varias veces, que es un gesto distinto del anterior en el tablero.
- **Un factor entre cero y uno produce decaimiento.** Ligada al diente chico y a la barra que se achica sin desaparecer.
- **El valor de arranque estira la curva sin cambiar su forma.** Ligada a empezar con tres hojas y ver la misma pista con las marcas triplicadas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos pistas de engranajes, una que suma en cada vuelta y otra que multiplica; tocar la que hace crecer más rápido la ficha. Los distractores salen de pares donde la que suma va adelante durante las primeras vueltas.
- `explain`: dos animaciones. En una, doblar el papel tres veces y después dos veces da lo mismo que doblarlo cinco; en la otra se cuenta como seis. Tocar la que mezcla las reglas. El distractor es `exponent_rules_mixed`, así que el error clasifica.
- `manipulate`: girar la manivela que dobla el papel y ver la ficha duplicarse; ajustar el factor hasta alcanzar el objetivo en el número de vueltas pedido.
- `apply`: la carrera entre la rampa lineal y la curva que multiplica; tocar el paso en que la curva pasa a la rampa, contra el tiempo objetivo del nodo.
- `generalize`: sin papel, fichas con base y exponente; reconocer crecimiento y decaimiento según la base sea mayor o menor que uno.
- `transfer`: en la urna de `prob.dist.binomial_counts`, tocar cuántos resultados posibles hay tras varias extracciones de dos opciones.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`exponent_rules_mixed`**, patrón `counterexample_slider` sobre `gears_sequence`, que es la mecánica principal del nodo y corre sin traducción. El jugador convierte `2³ · 2²` en `2⁶`, o `(2³)²` en `2⁵`. El juego enuncia su regla como dos pistas en paralelo, cada una con su manivela y su ficha, y pone un deslizador en los dos exponentes. Arranca en el punto donde las dos fichas coinciden, que en este caso existe y es parte del interés, y desliza hasta que las fichas se separan visiblemente. Voz: "Con tres vueltas y dos vueltas las dos pistas dan distinto. ¿Dónde coinciden?". El deslizador queda en manos del jugador para que busque. El patrón pide `literacy: icons`, que es exactamente la del nodo, porque hay que leer dos etiquetas de un número sobre el deslizador.

## 13. Generalización

La analogía se retira en `symbolic`, antes que en los nodos vecinos, y por un motivo declarado: no existe medio doblez. En cuanto el jugador arrastra el exponente como una ficha, va a querer ponerlo entre dos enteros, y el papel no puede acompañarlo. La manivela se queda un poco más como fantasma a demanda, porque las vueltas enteras siguen siendo honestas.

Variantes sin ayuda visual, en orden: bases enteras chicas con exponentes chicos; bases de dos dígitos, donde el resultado deja de poder contarse; valores de arranque distintos de uno; bases menores que uno escritas como razón; comparar dos crecimientos exponenciales entre sí y no contra una recta; predecir en qué paso se pasa un umbral, que es la pregunta que el nodo no puede responder y que abre el nodo siguiente.

El nodo está en `abstract` cuando el jugador clasifica una tabla de valores como lineal o exponencial mirando razones y no diferencias, escribe `a · bⁿ` a partir de una situación descrita, sabe que una ventaja inicial no cambia quién gana a la larga, y trata el decaimiento como el mismo objeto con otro factor.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `precalc.seq.geometric_sequence`: la misma pista, ahora como una lista de términos con nombre, donde la razón se vuelve el objeto que define la sucesión.
- `calc2.ser.geometric_sum`: no la ficha sino la suma de todo el recorrido, que con factor menor que uno se detiene en un valor finito.
- `prob.dist.binomial_counts`: cada extracción multiplica por dos la cantidad de caminos posibles, y el árbol de resultados es la misma pista dibujada hacia los costados.
- `precalc.exp.natural_base`: el factor deja de aplicarse de a vueltas enteras y se reparte en pedazos cada vez más chicos, y ahí aparece un factor que no se elige sino que sale del reparto.

Concepto siguiente: `alg.fn.logarithm` ([24](24-alg.fn.logarithm.md)). Frase puente, narrada sobre la pista con la ficha ya lejos del arranque: "Sabemos dónde cae la ficha después de siete vueltas. Ahora te muestro dónde cayó y no cuántas vueltas di. ¿Podés contarlas?". La manivela se traba y la pista queda con la marca encendida, y el nodo 24 empieza ahí.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `gear_doubling_track` es nativa y toma la base y la cantidad de vueltas: el engranaje gira, la ficha salta sobre la pista con marcas cada vez más separadas y el contador sube; gramática `nonlinear`, con la llave de altura repetida entre barras vecinas. Es la imagen de cheatsheet de `cs.alg.exponential_multiplies_each_step`. `slope_linear_vs_exponential_race` admite las dos rutas y dura ocho segundos: se pre-renderiza para la apertura del nivel de la carrera y corre nativa sobre los valores del jugador cuando este elige la ventaja inicial; toma la pendiente de la rampa, la base de la curva y el punto de cruce, y produce también el distractor de `recognize` donde la rampa va adelante al principio. Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_exp` ([M](../../M-calculadora/M0-progresion.md)), un ícono de manivela que eleva una base a un exponente armado con fichas. Es una operación de función con caja de arena: además del resultado, dibuja la pista con las marcas hasta el exponente pedido, para que el número grande nunca aparezca sin su recorrido. Acepta bases con razón y muestra el decaimiento en la misma pista comprimida. Si el nodo decae, la manivela gira con resistencia y la pista tarda en dibujarse.

**Edad universal:** el nodo es `icons` porque el selector de factor y el contador de vueltas llevan números de uno o dos dígitos desde el primer nivel, y porque el patrón de explicación del nodo pide ese mínimo ([Q](../../Q-edad-universal.md)). El doblado, el giro de la manivela y la carrera se juegan sin leer, con la mano fantasma como instrucción y los prompts por voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel de la carrera y usa el teclado de fichas para escribir la base y el exponente antes de girar.
