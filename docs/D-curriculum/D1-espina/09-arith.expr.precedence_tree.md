# 09 — La expresión tiene forma (`arith.expr.precedence_tree`)

> Locale `es`: "Los paréntesis son cofres anidados". Minijuego: [Cofres dentro de cofres](../../F-minijuegos/arith.expr.precedence_tree.md).

**Nodo:** `arith.expr.precedence_tree` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `compose` · **Mecánica principal:** `chest_key` (secundaria `machine_pipe`) · **Literacy:** `none` · **Analogía:** `chest_nested`

## 1. Concepto

Una expresión con más de una operación no es una fila de cuentas que se hacen de izquierda a derecha: es un árbol, donde cada operación sostiene dos piezas y cada pieza puede ser otra operación. Al terminar, el jugador mira `3 + 2 × 4` y `(3 + 2) × 4`, dice cuál pieza está adentro de cuál en cada una, evalúa de adentro hacia afuera y escribe un paréntesis cuando la forma que quiere no es la que la escritura supone. Antes sabía hacer las cuatro operaciones de a una; no sabía que un renglón tiene forma.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): multiplicar como escalar. Se usa entera. Es el único prerequisito directo porque el árbol solo existe cuando hay dos operaciones que no dan lo mismo en cualquier orden, y escalar y desplazar son el primer par que cumple eso. Con una sola operación, orden de lectura y orden de cálculo coinciden y no hay nada que descubrir.

La arista no sigue el orden escolar, donde la jerarquía llega al final de la aritmética, como una regla que ordena cuatro operaciones ya aprendidas. Acá llega en cuanto hay dos, y no ordena operaciones: describe una estructura. Un jugador que llega por la espina ya tiene restar y dividir y el generador los usa; el grafo no los exige porque no agregan estructura, agregan casos.

## 3. Dificultad cognitiva real

Lo difícil de este nodo no es calcular. Es ver que **una expresión tiene forma**, y que la prioridad es una consecuencia de esa forma, no una regla que se aplica sobre ella. Tres capacidades:

1. **Ver una forma donde hay una línea.** La escritura es una fila: un símbolo después de otro, de izquierda a derecha. La expresión es un árbol. Nada en el renglón anuncia esa diferencia, y el jugador que no la ve lee la fila y calcula en el orden en que la leyó. El cofre existe para que la forma esté antes que la escritura: cuando el jugador escribe, ya vio dónde estaba cada pieza.
2. **Saber qué pieza está adentro de cuál.** Con dos operaciones hay dos formas posibles y solo una es la que el renglón dice. Distinguirlas es la habilidad; evaluarlas después es la parte fácil.
3. **Anticipar que deshacer recorre el árbol al revés.** Para llegar al valor hay que abrir de adentro hacia afuera; para recuperar la pieza de adentro a partir del valor hay que ir de afuera hacia adentro. Las dos direcciones conviven en el mismo dibujo y se confunden. Es la que falla en `unwrap_order_inverted` y la que el nodo 14 va a necesitar entera.

Mathy no enseña ningún acrónimo. Un acrónimo es un orden de lectura disfrazado de regla: contesta qué hacer primero y no contesta por qué, y se rompe apenas la expresión tiene una letra o un paréntesis adentro de otro. Quien tiene el árbol deduce el orden; quien tiene el orden no puede deducir el árbol.

## 4. Problema intuitivo

Una mesa de empaque con bolsas vacías, manzanas y peras. Ana llena tres bolsas y en cada una pone dos manzanas y cuatro peras. Beto pone dos manzanas en cada una de tres bolsas y después deja cuatro peras sueltas sobre la mesa. La pregunta, por voz o por gesto: ¿las dos mesas tienen la misma fruta?

En `intuition` la escena se detiene antes de contar. Dos desenlaces dibujados: las dos mesas terminan iguales; las dos mesas terminan distintas. El jugador elige y después ve. Las mismas tres bolsas y las mismas dos frutas producen dieciocho o diez según dónde estén las peras, y esa diferencia es todo el nodo.

## 5. Analogía del mundo real

`chest_nested`, sobre la mecánica `chest_key` ([G0](../../G-analogias/G0-reglas.md)). Mapa: cofre → expresión; cofre dentro de cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; abrir primero el cofre exterior → orden inverso al de la jerarquía; tesoro → valor; secuencia de cerraduras agregadas → composición.

Invariante: el tesoro del fondo es el mismo por muchos cofres que lo envuelvan; lo que cambia con cada capa es a qué se puede llegar y en qué orden. Ruptura: `unknown_in_two_chests`. Cuando la misma pieza desconocida aparece dentro de dos cofres distintos —`x + 3x`—, el anidamiento deja de ser una cadena y el dibujo se fuerza; eso vive lejos de acá, en el nodo 15 y en adelante. La analogía se desvanece en `symbolic`.

Por qué esta y no otra: la relación esencial del concepto es la contención, y un cofre dentro de otro muestra contención sin ninguna convención previa. Un niño que nunca vio una expresión sabe que para llegar a lo de adentro hay que ocuparse primero de lo que lo envuelve. El paso 3 del test de [G0](../../G-analogias/G0-reglas.md) coincide: lo que se conserva en la situación (el contenido del cofre más interno) es exactamente lo que se conserva en el concepto (el valor de la subexpresión, que no depende de lo que la envuelva).

La segunda mecánica entra sin analogía declarada. `machine_pipe` aparece como mecánica desnuda —dos máquinas y un tubo— porque su piel propia pertenece a los nodos de función, y traerla acá sugeriría que la expresión es una máquina que come entradas, cosa que todavía no es.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `chest_key` es la principal y `machine_pipe` la secundaria ([E0](../../E-mecanicas/E0-catalogo.md)). El cofre aporta la herramienta: la contención, qué pieza está adentro de cuál. El tubo aporta el invariante `same_input_same_output`: dos máquinas en serie devuelven cosas distintas si se las intercambia, y eso se ve con la misma entrada. Los dos se encuentran en un gesto: cuando el jugador arrastra una máquina sobre la otra, la cadena se cierra en un cofre dentro de un cofre, y la máquina que actuaba primero queda adentro.

1. Sobre la mesa, un cofre de madera con una cerradura de sumar cuatro. Adentro, un cofre de hierro con una cerradura de multiplicar por tres. En el fondo del de hierro, un puñado de fichas.
2. Regla física, que se descubre y no se enuncia: un cofre se abre cuando todo lo que tiene adentro ya está contado.
3. El jugador toca el cofre exterior. La tapa se levanta un dedo y vuelve a caer; el cofre de hierro brilla un instante. Nada cambia y nada se pierde.
4. El jugador toca el de hierro. Se abre, las fichas salen y se acomodan en una pila que se puede contar. La cerradura de multiplicar por tres actúa sobre esa pila: la pila se triplica delante del jugador.
5. Ahora el exterior sí se abre: su cerradura suma cuatro fichas a la pila que subió. El resultado queda sobre la mesa.
6. Al costado, el tubo. Dos máquinas sueltas con las mismas dos acciones y una boca donde entra el puñado original. El jugador las conecta en un orden y mira la pila que sale; las intercambia y mira otra vez. Dos pilas distintas con la misma entrada.
7. Gesto de unión: arrastrar una máquina sobre la otra. El tubo se pliega, las dos máquinas se vuelven cofre y cofre, y la que actuaba primero queda adentro.

Nada se llama "incorrecto". Tocar el cofre equivocado no cuesta nada y deja el estado intacto: la tapa que no sube es toda la respuesta, y el brillo del cofre interior es toda la pista.

## 7. Representación visual

Capa `visual`, con `compose` dominante y `invert` de apoyo ([H](../../H-progresion-abstraccion.md)).

Los cofres adelgazan hasta ser marcos: un rectángulo que contiene otro rectángulo, cada uno con su cerradura dibujada en el borde. Tirando de una esquina, los marcos se despliegan en el árbol: cada cerradura se vuelve un nudo con dos ramas y cada pila de fichas, una hoja. Marco y árbol son el mismo objeto visto de dos maneras y comparten ids: tocar un nudo ilumina el marco que le corresponde y al revés.

Lo que se desplaza es la pila, que viaja de hoja a raíz y crece o se estira en cada nudo. Lo que se escala son las hojas cuando la cerradura es de multiplicar: la pila se convierte en tres pilas iguales y se funde en una. Lo que se conserva son las hojas: por muchas veces que el jugador vuelva a evaluar, el fondo del cofre interior tiene siempre las mismas fichas.

El tubo se estiliza en un diagrama de dos cajas y una flecha, y cambiar el orden es arrastrar una caja pasando a la otra.

Todavía no hay dos operaciones escritas en un mismo renglón. Los signos `+` y `×` ya existen desde los nodos 3 y 5 y viven dibujados en las cerraduras, pero nunca en fila, y el paréntesis no existe.

## 8. Transición a símbolos

El desvanecimiento tiene cinco escalones y en todos el objeto es el mismo; cada escalón lo abre un gesto del jugador.

1. **Cofre → marco con la pila adentro.** Al terminar de evaluar una instancia de dos cofres en `visual`, las paredes adelgazan y queda un marco alrededor de la pila, con el marco interior dibujado adentro. El árbol aparece por primera vez al tirar de una esquina.
2. **Pila → número.** Cuando el jugador cuenta la pila del fondo, las fichas se contraen en el número que él acaba de contar y quedan como hoja del árbol. Las demás pilas hacen lo mismo a medida que se van formando.
3. **Cerradura → operador en el renglón.** El jugador arrastra el marco interior hacia una línea vacía. La cerradura del marco se despega del borde, gira y aterriza entre sus dos hojas: `2 + 4`. El marco exterior hace lo mismo un renglón después.
4. **Marco interior → paréntesis.** Al soltar los dos marcos sobre la misma línea, los bordes verticales del marco interior se contraen en `(` y `)` y el marco exterior desaparece del todo, porque lo que no está adentro del paréntesis ya está afuera. Queda `3 × (2 + 4)`. Ahí nace el símbolo.
5. **Paréntesis → forma que se puede cambiar.** El jugador toca el paréntesis y se borra. Detrás, el árbol se reacomoda con un morph: el nudo `×` baja, el `+` sube, la pila cambia. `3 × 2 + 4` da diez donde antes daba dieciocho. El renglón es casi el mismo y el árbol es otro, y esa es la razón de existir de la marca.

## 9. Notación matemática

Queda el renglón con dos operaciones y, cuando hace falta, el paréntesis: `3 × (2 + 4)` frente a `3 × 2 + 4`.

El símbolo que nace es el **paréntesis**, y el problema que lo hizo necesario es exactamente el del paso 5: indicar qué operación ocurre primero cuando leer de izquierda a derecha da otro resultado (regla de oro de [H](../../H-progresion-abstraccion.md)). Hasta este nodo, cada renglón tenía una sola operación y no había nada que marcar.

Con el paréntesis se fija además una convención de escritura, y se presenta como convención y no como ley: cuando no hay paréntesis, el renglón supone la forma en que escalar queda adentro de desplazar. El jugador la conoce antes de que se la escriban, porque es la forma que el juego dibujó todas las veces; lo que la escritura agrega es la posibilidad de decir "esta vez no". La convención existe para no tener que poner paréntesis en todos los renglones, y esa es la única justificación que se da. No hay acrónimo, no hay lista de prioridades para memorizar y no hay orden que recitar.

## 10. Definición formal

Capa `formal`: texto corto con voz y el árbol al lado, de a una frase. "Una expresión es un árbol: cada operación sostiene dos piezas, y cada pieza puede ser otra operación." "Evaluar es abrir de adentro hacia afuera: ninguna operación puede actuar antes de que sus piezas tengan valor." "Un paréntesis dibuja una pieza que la escritura, sola, habría agrupado de otra manera."

Condiciones y casos especiales, verificados sobre el objeto. Un renglón con una sola operación es un árbol de un nudo y no tiene ambigüedad. Un paréntesis alrededor de una hoja no mueve el árbol y el jugador lo comprueba: la pila no cambia. Una cadena de operaciones del mismo tipo también tiene forma por defecto, y con restar y dividir se nota: `8 − 3 − 2` y `12 ÷ 3 ÷ 2` se evalúan con el nudo de la izquierda adentro, y el jugador arma los dos árboles posibles y ve que dan pilas distintas. Un paréntesis puede contener otro, y entonces hay tres capas.

Ya jugado: las dos primeras frases enteras, en la capa concreta. Nuevo: la palabra "árbol" y el anidamiento por defecto de las cadenas del mismo tipo.

## 11. Propiedades

- **El valor de una pieza no depende de lo que la envuelva.** El cofre de hierro entrega la misma pila esté adentro de una cerradura de sumar o de una de multiplicar. Ligada a abrir el mismo cofre interior dentro de dos exteriores distintos y contar dos veces lo mismo.
- **Cambiar el árbol cambia el valor, salvo cuando la operación no lo nota.** `3 × (2 + 4)` y `3 × 2 + 4` dan distinto; `(2 + 3) + 4` y `2 + (3 + 4)` dan igual, y eso el jugador ya lo sabe de `cs.arith.mul_grouping_irrelevant` y del nodo 5. La propiedad no dice que el orden nunca importa: dice cuándo importa. Ligada a intercambiar las dos máquinas del tubo y ver dos pilas, y a intercambiar dos sumas y ver una sola.
- **Deshacer recorre el árbol al revés.** Para recuperar el fondo a partir del resultado, la última cerradura aplicada es la primera que hay que abrir: las llaves entran de afuera hacia adentro. Ligada a usar la llave del nodo 6 sobre una instancia de dos cofres y ver que la de adentro no llega mientras la de afuera esté puesta. Es la propiedad que el nodo 14 usa entera y la que `unwrap_order_inverted` rompe.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre con otro adentro y una expresión de fichas al costado; tocar la parte de la expresión que está en el cofre interior. Los distractores se generan: la expresión entera, el operando suelto de la cerradura exterior, y la pieza que sería interior si el paréntesis no estuviera.
- `explain`: dos animaciones sobre el mismo par de cofres. En una se abre el de adentro, la pila se cuenta y después se abre el de afuera. En la otra se toca primero el de afuera y la tapa vuelve a caer. Tocar la que abre en orden invertido; el distractor es `unwrap_order_inverted`.
- `manipulate`: un árbol dibujado sobre la mesa y fichas de paréntesis en la bandeja; armar el cofre anidado que le corresponde y después abrirlo desde adentro hacia afuera.
- `apply`: dos máquinas en tubería y una pila de salida ya mostrada; conectar las fichas de operación en el orden que la produce. El resultado está dado y el orden no.
- `generalize`: sin cofres dibujados, solo fichas; tocar la operación que se calcula primero en expresiones con y sin paréntesis, incluidas cadenas del mismo tipo y un paréntesis que no cambia nada.
- `transfer`: en una tubería de pasos de un algoritmo (`csmath.inv.loop_invariant`), ordenar los pasos para que el resultado coincida con el árbol dado.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`unwrap_order_inverted`** (`tree_unwrap` sobre el cofre). El jugador toca el cofre exterior con el interior cerrado, o en el renglón evalúa `3 + 2 × 4` de izquierda a derecha y produce veinte. El juego dibuja el anidamiento como marcos, anima el orden que usó el jugador, muestra la capa que seguía envuelta y hace latir el marco exterior. Voz: "La capa de afuera es sumar 3. ¿Cuál abrimos primero?". El estado real del jugador se conserva y la interacción se reabre desde ahí. El patrón necesita que la operación de cada capa se lea en el borde del marco, y ese es el único elemento del nodo que pide un ícono con etiqueta.

## 13. Generalización

La analogía se retira en `symbolic`, en dos tiempos. Primero los cofres, cuando el jugador lee el paréntesis y dice qué pieza está adentro sin pedir los marcos. El árbol se queda como fantasma a demanda hasta `formal`, y por la misma razón que el cofre se queda en el nodo 13: representa estructura, no un nombre, y lo que representa estructura puede quedarse ([H](../../H-progresion-abstraccion.md), sección 5).

Variantes sin ayuda visual, en orden: tres operaciones de dos tipos sin paréntesis; un paréntesis que no cambia nada; paréntesis adentro de paréntesis; cadenas del mismo tipo con restar y dividir, donde la forma por defecto se nota en el resultado.

Cerraduras que no son operaciones. El nodo termina con cadenas de acciones cualesquiera: "girar noventa grados y después reflejar", "pintar y después recortar", "agregar una tapa y después envolver". El jugador dice cuál actúa primero, arma el anidamiento y decide si intercambiarlas cambia el resultado. Se evalúa que la estructura —una cadena, un adentro y un afuera, un orden que la forma impone— se reconoce con cualquier objeto.

El nodo está en `abstract` cuando el jugador lee un renglón de tres operaciones sin dibujo, dice qué pieza está adentro de cuál sin evaluar, y construye un renglón cuyo árbol coincide con uno dado.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `prealg.var.unknown_as_box` (`ledger`): una fila del libro de cuentas donde una de las pilas está cerrada. La caja ocupa una hoja del árbol y todo lo que está arriba conserva su forma aunque esa hoja no se pueda contar.
- `alg.eq.multi_step` (`balance`): dos cerraduras sobre la misma caja. Los platos deciden en cuántos lados se actúa y el árbol decide qué cerradura primero; las dos preguntas conviven y ninguna reemplaza a la otra.
- `csmath.inv.loop_invariant` (`gears_sequence`): los pasos de un ciclo son una cadena, y lo que se conserva de una vuelta a la siguiente depende del orden en que se escribieron los pasos.
- `calc1.deriv.rules_as_structure` (`tiles`): derivar una expresión compuesta empieza por leer su árbol. Qué regla se aplica lo decide la raíz, no los símbolos que se ven primero en el renglón.

Concepto siguiente: `prealg.var.unknown_as_box` ([10](10-prealg.var.unknown_as_box.md)). Frase puente, narrada sobre el último cofre anidado: "Ya sabés qué pieza está adentro de cuál. ¿Y si una de las piezas no se puede contar porque la caja no abre?". El cofre de hierro se queda cerrado, el árbol sigue dibujado con una hoja que no tiene número, y el nodo 10 empieza ahí.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `chest_nested_open_inside_first` es nativa: se renderiza sobre la expresión del jugador y produce también las animaciones de `explain`; gramática `compose`, con el marco interior iluminado mientras la cerradura exterior espera. `pipe_two_machines_order_matters` es nativa: la misma entrada corre por las dos máquinas en los dos órdenes y las dos pilas de salida quedan lado a lado; gramática `compose`, con el intercambio de las cajas como único movimiento. Ninguna lleva texto rasterizado: las cerraduras son formas y los números los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_paren` ([M](../../M-calculadora/M0-progresion.md)), en la fila `t0`, como un par de fichas que envuelven lo que esté seleccionado. Al envolver una pieza, el árbol aparece como fantasma sobre el renglón y muestra qué nudo se movió; al quitar el paréntesis, el árbol se reacomoda con el mismo morph del paso 5. Está disponible también en el sandbox. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): cofres y cerraduras por forma, mano fantasma para el primer gesto, `explain` entre animaciones, prompts por voz. Lo único que pide una etiqueta legible es el patrón `tree_unwrap`, que necesita la operación de cada capa escrita en el borde del marco. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel de marcos y alcanza el paréntesis en un solo nivel; lo que no se le ahorra es armar el árbol al menos una vez con las manos, porque es lo único que el renglón no muestra.
