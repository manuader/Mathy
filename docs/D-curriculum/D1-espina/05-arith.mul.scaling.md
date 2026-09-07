# 05 — Multiplicar es estirar (`arith.mul.scaling`)

> Locale `es`: "Multiplicar es estirar". Minijuego: [La banda y el piso](../../F-minijuegos/arith.mul.scaling.md).

**Nodo:** `arith.mul.scaling` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `scale` · **Mecánica principal:** `tiles` (secundarias `grid_stretch` y `gears_sequence`) · **Literacy:** `none` · **Analogía:** `rubber_band_stretch` (con `tile_floor` para el producto como piso)

## 1. Concepto

Multiplicar por 3 es convertir cualquier cosa en una versión tres veces más larga de sí misma: la banda entera se estira, y cada marca que había adentro se separa en la misma proporción. Al terminar, el jugador anticipa dónde va a caer una marca antes de soltar la banda, arma el rectángulo cuyo piso es el producto y lo lee sin contar baldosa por baldosa. Antes sabía avanzar una cantidad de pasos; no sabía cambiar el tamaño del paso.

## 2. Prerequisitos

- `arith.add.displacement` (nodo 3): la pista graduada y el paso constante. Se usan la manivela, el camino con marcas y el hecho de que un mismo giro produce siempre el mismo avance. De ahí sale el tren de engranajes 1:3, que es la puerta de entrada del nodo.

Es el único prerequisito, y eso rompe el orden escolar de dos maneras. Primero, no hay arista desde `arith.sub.undo_add`: escalar no necesita deshacer nada, así que este nodo y el 4 cuelgan los dos del 3 y se pueden jugar en cualquier orden. Segundo, no hay arista desde `arith.mul.repeated_groups`, el nodo fuera de espina donde vive "sumar muchas veces lo mismo" con el libro de cuentas de frutas. Ese nodo también cuelga del 3, es hermano de este y no su padre. La separación es deliberada: la suma repetida es una manera de calcular productos de enteros, no lo que un producto es, y ponerla como prerequisito la convertiría en la definición.

## 3. Dificultad cognitiva real

Lo difícil no es la tabla sino tres cosas que el cálculo esconde.

1. **El factor no es una cantidad del mismo tipo que el objeto.** En `3 × 4` baldosas, el `4` son baldosas y el `3` no: es una instrucción de cuántas veces más largo. El jugador que trata los dos números como cantidades de lo mismo no puede después leer una escala de mapa ni una razón de semejanza.
2. **Anticipar en lugar de contar.** El objetivo de la capa `concrete` es que el jugador toque dónde va a quedar la marca antes de que la banda llegue, y que lea el piso terminado sin recorrerlo. Contar baldosa por baldosa da el mismo número y no construye la intuición de escala.
3. **Que la suma repetida es una puerta y no la casa.** El nodo empieza con el engranaje 1:3, que efectivamente suma tres veces el mismo paso, porque es lo que el jugador puede hacer con lo que trae del nodo 3. Pero el modelo se rompe apenas el factor deja de ser un entero: "sumar media vez" no es una acción, y `½ × 8` no tiene ninguna lectura como repetición. También se rompe antes de eso, en los bordes que la cheatsheet `cs.arith.mul_by_one_and_zero` registra: sumar "una vez" y sumar "ninguna vez" son casos que hay que explicar aparte, mientras que estirar por 1 (no tocar la banda) y estirar por 0 (colapsarla contra el clavo) son gestos que el jugador ejecuta y ve. [G0](../../G-analogias/G0-reglas.md) rechaza "multiplicar es sumar muchas veces" como analogía por esta razón exacta: falla el paso 3 del test, porque su invariante solo existe para enteros. Sobrevive donde corresponde, como `equal_hops_repeated` dentro de `walker_forward_and_back`, en el nodo hermano de grupos iguales.

El nodo desarrolla, entonces, tres capacidades: leer un factor como razón, anticipar el efecto de una escala, y reconocer el mismo producto en dos objetos que no se parecen (una banda larga y un rectángulo).

## 4. Problema intuitivo

Un taller con dos encargos. Contra la pared hay una banda elástica con tres cuentas ensartadas, clavada por un extremo; el maestro tira del otro extremo hasta que la primera cuenta llega a una marca de la pared. En el piso, alguien está cubriendo un rectángulo con baldosas cuadradas y ya terminó la primera fila.

En `real` el jugador solo mira y contesta con un toque: ¿alcanzan las baldosas de la pila para cubrir el rectángulo? En `intuition` la escena se congela con la banda a medio estirar y la pregunta es dónde va a caer la última cuenta. Tres desenlaces dibujados: las tres cuentas se separan igual y la última se va lejos; solo el extremo se mueve y las cuentas quedan amontonadas donde estaban; las cuentas se separan pero la primera se despega del clavo. El jugador elige y después ve. El segundo desenlace es el que confunde estirar con agregar al final, y es el que la mecánica va a desmentir en cada nivel.

## 5. Analogía del mundo real

Dos analogías visten el nodo y sus puntos de ruptura se cubren mutuamente ([G0](../../G-analogias/G0-reglas.md)).

`rubber_band_stretch` (mecánica `grid_stretch`) es la del YAML. Mapa: banda marcada → recta numérica; marca en la banda → número; estirar k veces → multiplicar por k; dejar que la banda vuelva → dividir por k; extremo clavado → el cero que no se mueve; estirar menos que el original → multiplicar por una fracción. Invariante: la razón entre dos marcas cualesquiera no cambia, y el clavo se queda donde está. Ruptura declarada: `negative_scaling_flips`. Una banda física no se estira "hacia atrás del clavo"; dar vuelta la recta es una acción que el elástico no tiene.

`tile_floor` (mecánica `tiles`) aporta el producto como objeto que se puede mirar de dos maneras. Mapa: fila de baldosas → primer factor; columna → segundo factor; baldosa suelta → unidad del producto; piso entero → producto; girar el piso → conmutatividad; piso conocido al que le faltan columnas → división; partir el piso en franjas → productos parciales. Ruptura: `non_integer_sides`, un lado de dos baldosas y media no es una fila.

Por qué estas dos y no una. El piso rompe exactamente donde llegan las fracciones, y la banda sobrevive ahí porque estirar menos que el original es un gesto legítimo; la banda rompe donde llegan los negativos, y ahí ya no está sola, porque el nodo 7 trae la pista que se cruza. El límite de la unión de las dos es el borde del nodo, y los dos nodos que siguen a ese borde son el 8 y el 7. Cómo conviven en pantalla: la banda estirada se apoya sobre el borde inferior del piso, de modo que la última marca de la banda cae siempre en la última columna de baldosas. Un objeto es el producto visto como longitud; el otro, el mismo producto visto como superficie.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `tiles` es la principal y provee la herramienta —armar, girar y leer el rectángulo—; `grid_stretch` provee el invariante de escala —las marcas se separan en proporción y el clavo no se mueve—; `gears_sequence` provee la puerta de entrada, el tren 1:3 que hereda del nodo 3 ([E0](../../E-mecanicas/E0-catalogo.md)). Los tres se encuentran en un solo gesto: el jugador engancha el engranaje grande, ve la ficha avanzar de a tres, y esa misma pista es la banda que después estira con dos dedos. Gestos: `drag`, `tap` y `pinch`, este último siempre con manija alternativa.

1. Banda clavada con tres cuentas y una regla de marcas debajo; a un costado, una pila de baldosas y un marco de piso vacío con una fila ya puesta.
2. Demostración: una mano fantasma toma el extremo libre y tira hasta que la banda cubre el triple de la regla. Las tres cuentas se separan a la vez; el clavo no se mueve. Después la mano copia la fila de baldosas dos veces hacia abajo y el marco se completa.
3. El jugador estira. Mientras arrastra, un cursor sobre la regla muestra hasta dónde llegó la última cuenta y las marcas intermedias se separan en vivo. Suelta cuando el cursor toca el objetivo.
4. Si estira tomando la banda del medio, la mitad de abajo queda floja: las cuentas de ese tramo no se separan, la banda se ve arrugada y el cursor no llega. El estado no se borra; el jugador vuelve a tomar el extremo y sigue.
5. Si suelta la banda antes del objetivo, la banda se relaja hasta su largo original con las cuentas volviendo a su sitio. Ese retroceso es la primera aparición de lo que en el nodo 6 será una llave.
6. Con las baldosas: arrastrar una fila y soltarla debajo de otra las alinea con imán. Una fila con menos baldosas que la de arriba deja el marco con un diente y el hueco brilla; el marco no se cierra hasta que las filas son iguales.
7. Éxito: cuando el piso queda completo, el marco se ilumina entero y una llave de conteo aparece sobre el lado, no sobre cada baldosa. Sin cartel.
8. Girar el piso noventa grados con dos dedos: la misma cantidad de baldosas, las filas y las columnas intercambiadas. Es `cs.arith.mul_order_irrelevant` jugado antes de enunciarse.

Contar baldosa por baldosa está permitido y funciona; es un movimiento válido pero lento, y recibe un empujón suave —la llave del lado late— nunca una explicación de error.

## 7. Representación visual

Capa `visual`, con `scale` dominante y dos primitivas de apoyo de [H](../../H-progresion-abstraccion.md).

`scale`. La banda se convierte en una barra con marcas y la regla debajo se gradúa: es la recta numérica del nodo 3, ahora con dos escalas superpuestas. Cada estiramiento muestra la barra original en gris y la estirada encima, con el clavo compartido y una llave que abarca el tramo entre dos marcas en cada una: lo que cambia es la longitud, lo que se conserva es la razón entre marcas. Se escala la barra entera; se conserva el punto clavado; nada se desplaza salvo como consecuencia del escalado.

`accumulate` (apoyo, solo en `concrete`). Las filas de baldosas se apilan una sobre otra y una barra lateral crece con cada fila. Es la lectura de suma repetida, dibujada como lo que es: una manera de llegar al piso, no el piso. En `visual` esa barra lateral desaparece y queda el rectángulo entero con sus dos lados acotados.

`displace` (apoyo, residual). El tren de engranajes queda a un costado, con la ficha avanzando de a tramos iguales, y se retira apenas el jugador estira una banda por un factor que no es entero.

Todavía no hay signo de operación, ni resultado escrito, ni ningún símbolo de igualdad: los números que aparecen son etiquetas de longitud sobre las llaves de los lados.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Baldosas sueltas → rectángulo.** Al completar el marco por primera vez, las baldosas pierden sus bordes internos y el piso se vuelve una sola superficie con una grilla tenue encima.
2. **Lado → número.** Al tocar un lado, la fila de baldosas de ese lado se contrae en una llave con un dígito. Primero un lado, después el otro; el dígito nace del conteo que el jugador acaba de hacer, nunca aparece como dato.
3. **Cruce de líneas → signo de operación.** Cuando los dos lados están acotados, la línea de la primera fila y la de la primera columna se prolongan hasta cruzarse fuera del piso, y el cruce queda como la ficha del operador entre los dos dígitos. El glifo lo dibuja el runtime según el `MathLocale` ([P](../../P-internacionalizacion.md)): en unos locales es una cruz, en otros un punto medio.
4. **Piso → total.** Al arrastrar la llave del piso completo hacia afuera, el rectángulo se contrae en un solo número y queda como marca de agua detrás. Tocar el número devuelve el piso a tamaño real.
5. **Gesto de estirar → ficha de factor.** En la banda, el pellizco deja tras de sí una ficha con el operador y el factor. Aplicar esa ficha a una barra la estira sin tocarla con los dedos: el gesto se volvió un objeto que se puede arrastrar, y esa ficha es la que el nodo 6 va a querer deshacer.

## 9. Notación matemática

Queda la fila `3 × 4` con el piso como marca de agua y el total en la llave del lado largo, y la ficha de factor que se arrastra sobre una barra.

El símbolo nuevo es el operador de multiplicación, y el problema que lo hizo necesario es doble. Uno: hay dos números en pantalla, el de la fila y el de la columna, y sin una marca entre ellos no se distinguen de dos cantidades cualesquiera puestas una al lado de la otra. Dos: el gesto de estirar tiene que poder guardarse. Mientras la escala es un pellizco, se hace y se pierde; escrita como ficha, se puede aplicar dos veces, comparar con otra y —en el nodo siguiente— buscarle la llave que la deshace. Por eso el operador nace en el paso 3 y no antes.

El signo de igual aparece —queda `3 × 4 = 12` cuando el total sale del piso— pero el nodo **no lo introduce**, igual que en los nodos 3 y 4: su historia pertenece a `prealg.eq.balance` según la tabla de la regla de oro de H. Acá hace lo mínimo honesto, marcar que el piso tiene dos nombres, y el juego lo escribe en los dos órdenes con la misma frecuencia, con el hueco a veces del lado izquierdo. La forma primaria del resultado en este nodo sigue siendo la etiqueta sobre el objeto —el total en la llave del lado largo—, y el renglón con el igual es su transcripción.

## 10. Definición formal

Capa `formal`: texto corto con voz y la banda al lado. Tres frases, de a una: "Multiplicar una cantidad por un número es cambiar su tamaño en esa proporción." "El resultado de multiplicar dos números es la cantidad de unidades de un rectángulo de esos dos lados." "Los dos factores se pueden intercambiar y el resultado no cambia."

Condiciones y casos especiales, verificados sobre el objeto. Estirar por 1 es no tocar la banda: el piso de una sola fila es la fila. Estirar por 0 colapsa la banda contra el clavo y el piso pierde todas sus filas: el resultado es cero para cualquier otro factor, y eso deja el producto sin manera de volver atrás, un hecho que el nodo 6 va a encontrarse de frente (`cs.arith.mul_by_one_and_zero`). El factor puede ser menor que uno: la banda se estira menos que su largo y el resultado es más chico que el punto de partida, contra la expectativa de que multiplicar agranda.

Ya jugado: las tres frases enteras, en `concrete`. Nuevo: la palabra "factor" y el caso del factor menor que uno enunciado como regla y no como sorpresa.

## 11. Propiedades

- **El orden de los factores no cambia el producto.** Ligada a girar el piso noventa grados: las mismas baldosas, filas y columnas intercambiadas (`cs.arith.mul_order_irrelevant`).
- **Multiplicar por 1 deja igual; multiplicar por 0 anula.** Ligada a la banda que no se toca y a la banda colapsada contra el clavo (`cs.arith.mul_by_one_and_zero`).
- **Multiplicar por un factor conserva la razón entre las partes.** Ligada a las cuentas de la banda, que después de estirar siguen dividiendo el largo igual que antes. Es la entrada `cs.arith.mul_as_scaling` y lo que hace que el nodo transfiera a semejanza.
- **Escalar dos veces seguidas es escalar una vez por el producto de los factores.** Ligada a estirar la banda ya estirada, o a enganchar un segundo engranaje al tren. Es la propiedad que el nodo `arith.pow.repeated_scaling` convierte en exponente.
- **Un piso partido en franjas es la suma de las franjas.** Ligada a arrastrar una pared imaginaria por el medio del piso y ver los dos pedazos. Se enuncia acá con números y se convierte en la distributiva en `alg.expr.distributive_tiles`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: una banda sin estirar y tres bandas ya estiradas por factores distintos; tocar la que se estiró tantas veces como marca la ficha. Los distractores se generan con factores vecinos y con una banda a la que solo se le alargó el último tramo.
- `explain`: dos animaciones sobre la misma banda. En una se estira y las tres cuentas se separan por igual; en la otra solo el extremo se mueve y las cuentas del medio quedan donde estaban. Tocar la que no escala.
- `manipulate`: pellizcar la banda hasta que el cursor toca la ficha objetivo y, con el mismo número, armar el rectángulo de baldosas que muestra el producto en filas. Los dos objetos, una sola cantidad.
- `apply`: filas de baldosas sueltas; armar el rectángulo y arrastrar la ficha del total sin recorrerlo, contra el tiempo objetivo del nodo.
- `generalize`: estirar con factores fraccionarios y con cero, anticipando el resultado con un toque antes de soltar. Es la evidencia de que el modelo de repetición se abandonó.
- `transfer`: sobre un piso geométrico de `geom.area.rect_and_triangle`, tocar el área que resulta de duplicar un solo lado.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`negative_times_negative`** (`double_flip` sobre el caminante). El nodo la lista, pero solo puede aparecer en jugadores que ya recorrieron `arith.int.negatives`, porque antes no existe la ficha de número negativo. Cuando aparece, el patrón corre fuera del piso: el caminante se da vuelta una vez, avanza, se da vuelta otra vez y avanza más, y termina del lado por el que empezó. La bandera con la respuesta del jugador queda del otro lado. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?".
- El distractor de `explain` —estirar solo el extremo— no corresponde a ninguna misconception del catálogo de L. Se juega como ítem de `explain` sin crédito de clasificación: la animación elegida se reproduce sobre la banda del jugador y la banda queda floja hasta que la toma del extremo. Es el error más común del nodo y merecería entrada propia; ver el reporte.

## 13. Generalización

La analogía se retira en dos tiempos y por partes distintas. El piso de baldosas se va primero, en `symbolic`, en cuanto aparecen los lados que no son enteros: un lado de dos y media no es una fila, y forzarlo enseñaría que las fracciones son baldosas partidas, que es la lectura que el nodo 8 tiene que construir con cuidado. La banda se queda hasta `formal` como fantasma a demanda, porque representa estructura —una escala— y no un nombre.

Variantes sin ayuda visual, en orden: factores de dos cifras leídos como piso partido en franjas; factor 1 y factor 0 mezclados con los demás sin aviso; factores menores que uno, donde el resultado baja; y la pregunta invertida, un piso conocido al que le falta un lado, que es la puerta del nodo 6.

Escalas arbitrarias. El nodo termina con objetos que no son bandas ni pisos: una fotografía que se agranda, una receta para el triple de personas, un plano con su escala. El jugador dice qué se conserva —la forma, las proporciones entre las partes— y qué cambia. Se evalúa que reconozca la estructura de escala en objetos que nunca vio dibujados en una grilla.

El nodo está en `abstract` cuando el jugador anticipa el efecto de un factor sin dibujar nada, incluye sin dudar los casos 1, 0 y menor que uno, y reconoce que dos objetos distintos con la misma razón entre sus partes son la misma escala.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `geom.area.rect_and_triangle` (`tiles`, `construct`): el piso ya no cuenta baldosas sino que mide superficie, y el triángulo es medio rectángulo. La misma acción de cubrir, con la unidad de área en lugar de la baldosa.
- `geom.sim.similarity_as_scale` (`grid_stretch`, `construct`): dos figuras semejantes son la misma figura estirada, y el factor de escala es el que el jugador ya sabe leer entre dos marcas.
- `linalg.vec.span_and_combination` (`grid_stretch`, `ledger`): multiplicar una flecha por un número la estira sin girarla. La banda con clavo es el caso de una dimensión.
- `calc1.int.accumulation` (`fill_accumulate`, `tiles`): el área bajo una curva es un piso de baldosas cada vez más finas. La lectura de suma repetida vuelve acá, y esta vez es la correcta.

Concepto siguiente: `arith.div.undo_mul` ([06](06-arith.div.undo_mul.md)). Frase puente, narrada sobre la última banda estirada: "La banda quedó del triple de largo. ¿Qué hay que hacerle para que vuelva a ser la que era?". La banda se mantiene tensa, aparece un cofre en el extremo libre y el nodo 6 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), las dos nativas sobre el estado del jugador. `tile_rows_become_rectangle` corre en gramática `scale` con apoyo de `accumulate`: las filas sueltas se apilan, se funden en un rectángulo y los dos lados quedan acotados por llaves; parametrizada por filas y columnas, produce también las animaciones de `apply`. `grid_stretch_by_factor` es la banda y la regla: la barra se estira por un factor continuo con el extremo fijo, las marcas se separan en proporción y una llave mide el tramo antes y después; parametrizada por factor y largo, genera las dos animaciones de `explain` con solo cambiar qué parte de la barra se deja fija. Ninguna lleva texto rasterizado: los dígitos y el signo de operación los dibuja el runtime según el locale y el `MathLocale` ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_mul` en el primer tier ([M](../../M-calculadora/M0-progresion.md)), y a su lado aparece la silueta de su llave, todavía cerrada. Tocar la silueta muestra en el mapa cuál es el nodo que la abre, que es el 6. La tecla no devuelve solo el número: dibuja el rectángulo de los dos factores detrás del resultado, y la pregunta incómoda que trae al layout es la del par, que multiplicar por cero no tiene llave. Si el nodo decae, la tecla se dibuja con óxido y sigue funcionando.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la banda y las baldosas se manipulan con `drag` y `pinch`, el `pinch` tiene manija alternativa para manos chicas, la instrucción es la mano fantasma y `explain` se resuelve entre dos animaciones. Los dígitos que aparecen desde el segundo nivel son íconos con historia, no texto: cada uno nació de un conteo que el jugador hizo. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra donde la banda ya tiene ficha de factor y usa el teclado de fichas para armar factores de dos cifras.
