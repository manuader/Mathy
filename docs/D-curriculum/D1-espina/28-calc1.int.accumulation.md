# 28 — Integral: acumular franjas (`calc1.int.accumulation`)

> Locale `es`: "Integral: acumular franjas". Minijuego: [El tanque y las franjas](../../F-minijuegos/calc1.int.accumulation.md).

**Nodo:** `calc1.int.accumulation` · **Área:** calc1 · **Nivel:** 5 · **Primitiva:** `accumulate` · **Mecánica principal:** `fill_accumulate` (secundaria `tiles`) · **Literacy:** `short_text` · **Analogía:** `tank_filling`

## 1. Concepto

Acumular es sumar muchas contribuciones chicas que cambian con el tiempo. Al terminar, el jugador toma una curva de caudal, la parte en franjas, suma lo que aporta cada franja, afina las franjas hasta que el total deja de moverse y escribe ese total con un símbolo nuevo. Antes sabía multiplicar caudal por tiempo cuando el caudal era constante; ahora resuelve el caso en que cambia todo el tiempo.

Este nodo se juega sin derivada. Ninguno de sus prerequisitos la menciona y la mecánica no la usa. Es deliberado: el nodo 29 va a descubrir que acumular y medir la pendiente son la misma llave vista de los dos lados, y esa sorpresa se arruina si acá se anticipa.

## 2. Prerequisitos

- `precalc.lim.approach` (nodo 25): acercarse sin llegar. Se usan el caminante que se aproxima, la lectura que se estabiliza aunque el punto de llegada no exista, y el símbolo `lim`. Acá lo que se estabiliza no es un cociente sino un total, y la misconception `limit_as_reaching` reaparece en su forma de suma: el jugador que quiere franjas de ancho cero se queda sin franjas.
- `arith.mul.scaling` (nodo 5): multiplicar es escalar. Se usa el rectángulo de las baldosas como "tanto por tanto", que es lo que hace que una franja sea un producto de caudal por tiempo y no un área abstracta.

Las aristas que no siguen el orden escolar son dos, y son la misma decisión. La escuela enseña la integral después de la derivada y la define como antiderivada; [C0](../../C-knowledge-graph/C0-esquema.md) la enseña antes, desde la acumulación, y la conecta con la derivada recién en el nodo 29. La segunda: el nodo tampoco depende de `precalc.seq.sum_as_pattern`, donde nació `Σ`. Se puede acumular contando franjas mucho antes de saber escribir una suma con patrón, y el nodo siguiente, `calc1.int.riemann_refines_to_limit`, es el que junta las dos cosas.

## 3. Dificultad cognitiva real

Lo difícil no es sumar rectángulos. Son cuatro capacidades que "integrar" mezcla:

1. **Aceptar que el total no depende de cómo se corte.** Es el invariante de la mecánica, `total_independent_of_chunking`. Franjas anchas y franjas finas dan el mismo total si el corte es honesto, y lo que cambia con el ancho es el error, no el total verdadero. Sin esto, refinar parece cambiar el problema.
2. **Leer la franja como cantidad, no como dibujo.** Una franja es alto por ancho, y alto es caudal y ancho es tiempo. El producto es litros. El jugador que ve "área" y no ve "litros" queda sin poder transferir a velocidad, potencia o probabilidad.
3. **Sumar infinitas cosas y obtener un número finito.** Es `limit_as_reaching` en su forma de suma: cuantas más franjas, más chicas, y el total no se dispara. Cuesta más que en el nodo 25 porque lo que se estabiliza es una suma que tiene cada vez más términos.
4. **Que abajo del eje se descuenta.** Cuando el caudal es negativo el grifo drena, el nivel baja y lo acumulado se resta. Es `integral_ignores_sign`, y la analogía la anticipa: el tanque que se vacía es visible, y aun así el jugador quiere sumar todo lo dibujado.

Las cuatro son independientes y la mecánica las separa: la primera y la tercera viven en la manivela que parte el tiempo, la segunda en la etiqueta de las franjas, la cuarta en el grifo que se da vuelta.

## 4. Problema intuitivo

Un tanque y un grifo cuyo caudal cambia solo: empieza flojo, se abre, se vuelve a cerrar. Al costado hay un cronómetro con dos marcas. La pregunta, por voz o por gesto: al llegar a la segunda marca, ¿cuánta agua hay en el tanque?

En `intuition` el juego corre el grifo unos segundos y detiene todo con el tanque a medio llenar. Tres desenlaces dibujados: el nivel final es el que corresponde al caudal más alto durante todo el tiempo; el que corresponde al caudal más bajo durante todo el tiempo; uno intermedio. El jugador elige y después ve. El intermedio es el correcto, y la escena queda con dos tanques de referencia a los costados que acotan el verdadero por arriba y por abajo.

Después el grifo se da vuelta y drena un rato. La misma pregunta con el nivel bajando prepara el signo.

## 5. Analogía del mundo real

`tank_filling` (mecánica `fill_accumulate`), la del YAML. Mapa: caudal del grifo → el integrando; tiempo que corre → la variable de integración; nivel del agua → el valor acumulado; rebanada fina de tiempo → `dx`; sumar las rebanadas → la suma de Riemann; grifo que drena → integrando negativo; medidor de nivel → la primitiva; diferencia de nivel entre dos instantes → la integral definida. Invariante: el total acumulado no depende de en cuántas rebanadas se parta el tiempo. Ruptura: `variable_that_is_not_time`. El tanque sirve mientras el eje horizontal sea tiempo; cuando es longitud, temperatura o dinero, ya no hay grifo, y la acumulación hay que transferirla como suma de contribuciones. Se retira en `formal` ([G0](../../G-analogias/G0-reglas.md)).

Por qué esta y no otra: el tanque es la piel de `fill_accumulate` desde `found.meas.fill_compare`, y el jugador la usó para comparar recipientes, para el porcentaje lleno y para el volumen por capas. Acá no aprende un objeto nuevo: aprende que la altura del agua es una suma, y que la suma se puede afinar. Las baldosas del nodo 5 aportan la otra mitad: la franja es un rectángulo de verdad, con dos medidas que se multiplican, y por eso el total tiene unidades.

Dos medidores acompañan al tanque desde el primer nivel, uno que corta por arriba y otro por abajo. Son los que hacen visible que el verdadero total está atrapado entre dos números que se acercan, y son los que el nodo `adv.real.riemann_upper_lower_squeeze` va a retomar mucho después.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `fill_accumulate` es la mecánica principal y provee el tanque, el grifo y la manivela que parte el tiempo. `tiles` provee la franja como rectángulo con dos medidas ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `scrub`, `hold` y `drag`.

1. Un tanque vacío, un grifo con una curva de caudal dibujada arriba, una franja de tiempo con dos marcas y una manivela de cantidad de trozos.
2. Demostración: una mano fantasma mantiene apretado el grifo y el nivel sube; suelta y el nivel se queda. La mano gira la manivela y el tiempo se parte en cuatro trozos; sobre la curva aparecen cuatro rectángulos y en el tanque, cuatro bloques apilados que llegan casi al mismo nivel. La escena vuelve al inicio.
3. El jugador mantiene apretado el grifo y ve el nivel subir más rápido donde la curva es alta. Es la lectura de "cuánto entra por segundo".
4. El jugador gira la manivela. Con cada vuelta el tiempo se parte en más trozos, los rectángulos se afinan, los escalones que sobraban sobre la curva se achican y el nivel del tanque de bloques se acerca al del tanque de verdad. Un contador al costado deja de moverse.
5. El jugador arrastra el borde de una franja. La franja cambia de ancho y el bloque correspondiente cambia de alto en el tanque: la franja es un producto y se ve.
6. El jugador mueve las dos marcas del cronómetro. El total cambia y el juego muestra que mover la marca de la derecha hacia la izquierda quita exactamente los bloques de ese tramo.
7. El grifo se da vuelta. Con caudal negativo, los bloques salen del tanque en vez de entrar, y el nivel baja. El contador resta.
8. Éxito: cuando el nivel de los bloques queda dentro del margen del nivel verdadero, el tanque se ilumina y el total queda escrito en el medidor. Sin cartel.

Errores con consecuencia física: si el jugador gira la manivela al revés hasta dejar un solo trozo, queda un bloque enorme y se ve el aire entre el rectángulo y la curva. Si lleva la manivela al extremo, se traba en el último diente: no hay franjas de ancho cero, porque con ancho cero no entra nada de agua. Nada se llama "incorrecto".

## 7. Representación visual

Capa `visual`, con la primitiva dominante `accumulate` y dos de apoyo de [H](../../H-progresion-abstraccion.md).

`accumulate` (dominante). La curva de caudal se dibuja sobre ejes y el tanque queda al lado como columna. Lo que se desplaza es el borde de llenado, que sube mientras el tiempo corre. Lo que se conserva es el total: al refinar, los rectángulos cambian todos y la altura de la columna se queda quieta. El juego muestra las particiones sucesivas una encima de otra, cada vez más finas, con la altura acumulada iluminada en todas.

`scale` (apoyo). Cada franja se dibuja como rectángulo con sus dos medidas vivas: al arrastrar el borde se alarga o se acorta, y el bloque correspondiente en el tanque se escala igual. Es la lectura de "tanto por tanto" del nodo 5.

`partition` (apoyo). La franja de tiempo se parte en trozos sin solaparse y sin dejar huecos. El juego resalta que la partición cubre el intervalo entero, y que si un trozo se agranda otro se achica.

Todavía no hay símbolos: el medidor muestra un número, los rectángulos no tienen etiqueta y la curva no se llama `f`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Bloque → producto de dos medidas.** Al arrastrar el borde de una franja por primera vez en `visual`, el bloque del tanque gana sus dos etiquetas, la altura y el ancho, y se muestra como producto. El bloque no se reemplaza: se etiqueta.
2. **Pila de bloques → suma escrita.** Al girar la manivela con los bloques etiquetados, la pila se despliega al costado como una fila de sumandos, uno por bloque. Con cuatro trozos la fila entra en la pantalla; con ocho, ya no.
3. **Suma que no entra → `Σ`.** Cuando la fila se pasa del borde, los sumandos se contraen en un solo signo con un índice abajo y un tope arriba, y el término general queda escrito a la derecha. La fila se puede volver a desplegar tocando el signo.
4. **Manivela al tope → `n → ∞` y el ancho que se afina.** Al llegar al último diente aparece bajo la suma la flecha del nodo 25, y el ancho de la franja se contrae en una etiqueta chica que conserva la forma del ancho.
5. **`Σ` con franjas infinitas → `∫`.** Al tocar el medidor iluminado, el signo de suma se estira verticalmente hasta volverse el signo de integral, el índice y el tope se convierten en las dos marcas del cronómetro y el término general queda como caudal por ancho. Tocar el signo despliega los rectángulos como fantasma.

## 9. Notación matemática

Quedan `Σ` sobre los rectángulos y `∫` con sus dos marcas, y el ancho escrito como `dx`.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), cada símbolo llega con su problema. `lim` y la flecha llegaron en el nodo 25. `Σ` llega acá con un problema de espacio: la fila de sumandos deja de entrar en la pantalla apenas hay ocho franjas, y hace falta escribir "todas las franjas" sin escribirlas. La tabla de símbolos de H le atribuye el nacimiento a `precalc.seq.sum_as_pattern`, que no es prerequisito de este nodo; el jugador que llegó por ese camino lo reconoce, y el que llegó por acá lo estrena sobre rectángulos. En los dos casos la entrada de cheatsheet es la misma, `cs.calc1.riemann_sum_notation`.

`∫` llega con un problema distinto y propio de este nodo: con `Σ` hay que decir cuántos términos hay, y cuando las franjas se afinan sin fin no hay un último índice que escribir. El símbolo estirado dice "sumar todas las franjas del intervalo" sin contarlas, y por eso lleva las dos marcas en vez de un índice. `dx` no es una cantidad suelta: es lo que quedó del ancho cuando el ancho dejó de tener número, y el juego lo introduce con esa forma para que después, en el nodo 29 y en `calc2.tech.substitution_undoes_chain`, se pueda manipular como pieza.

## 10. Definición formal

Capa `formal`: texto corto con voz y los rectángulos fantasma al lado. Tres frases, de a una: "Acumular una cantidad que cambia es partir el recorrido en trozos, sumar lo que aporta cada trozo y afinar los trozos." "La integral definida entre dos marcas es el valor al que se acerca esa suma cuando los trozos se afinan." "Cuando la cantidad es negativa, el aporte del trozo se descuenta."

Condiciones y casos especiales, verificados sobre el objeto: la suma se estabiliza si la curva no da saltos infinitos en el tramo; si el caudal es constante, la integral es el producto de siempre y el tanque se llena parejo; si las dos marcas coinciden, no pasa tiempo y el total es cero; si se corta el tramo en dos, los dos totales suman el total, y esto vale porque los bloques son los mismos repartidos en dos pilas. Duplicar el caudal duplica el total, y se ve porque cada bloque duplica su altura.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "integral", la condición sobre los saltos y el caso de las marcas iguales.

## 11. Propiedades

- **El total no depende del corte.** Ligada a la manivela: cambiar la cantidad de trozos cambia todos los rectángulos y no cambia el nivel del tanque de verdad.
- **Escalar el caudal escala el total.** Ligada al grifo que se abre al doble: cada bloque duplica su altura y el nivel duplica.
- **Cortar el tramo parte el total.** Ligada a mover una marca intermedia: los bloques se reparten en dos pilas cuya suma es la misma.
- **Un caudal negativo descuenta.** Ligada al grifo dado vuelta: los bloques salen del tanque y el contador resta.
- **Entre dos marcas iguales el total es cero.** Ligada a juntar las dos marcas del cronómetro: no queda ningún bloque.
- **El total queda atrapado entre dos sumas.** Ligada a los dos medidores, el que corta por arriba y el que corta por abajo, que se acercan al refinar.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: cuatro tanques que se llenan con curvas de caudal distintas durante el mismo tiempo marcado. Tocar el que tiene más agua al final. Los distractores incluyen uno con el pico de caudal más alto pero total menor, y uno con caudal constante alto durante poco tiempo.
- `explain`: partir el tiempo en trozos más finos con la manivela y elegir, entre tres animaciones, la que muestra por qué el total no cambia aunque los rectángulos sí. Una muestra los escalones que se achican y el nivel quieto; otra, el nivel que sube cada vez que se refina; otra, un solo rectángulo tomado como si fuera todo. Tocar la correcta.
- `manipulate`: apilar rectángulos bajo la curva de caudal, refinar el ancho con la manivela y observar cómo la suma se estabiliza. El medidor se ilumina cuando el contador deja de moverse.
- `apply`: recibir la curva de velocidad de un auto y armar con fichas la distancia recorrida entre dos instantes, primero con rectángulos de ancho 1 y después de ancho 0,5, y colocar la ficha del valor al que se acercan. Contra el tiempo objetivo del nodo.
- `generalize`: recibir una curva con un tramo bajo el eje y decidir, llenando y vaciando el tanque, qué pasa con el total. El jugador coloca la ficha del total con signo y, aparte, la del agua que pasó por el grifo.
- `transfer`: sobre una fila de barras de probabilidad, acumular de izquierda a derecha y leer cuánto se juntó hasta cierto valor. Es `prob.rv.cumulative_distribution`, y el tanque no aparece.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`integral_ignores_sign`** (`replay_on_mechanic` sobre el tanque). El jugador suma también los rectángulos de abajo del eje y coloca el total del agua que pasó como si fuera lo acumulado. El juego congela y repite el llenado en cámara lenta: mientras la curva está arriba del eje entran bloques, y cuando cruza, el grifo se da vuelta y los bloques salen. El tramo bajo el eje se dibuja vaciando el tanque, no llenándolo, y un halo marca el momento del cruce. Voz: "En este tramo el grifo drenaba. ¿El nivel subió o bajó?". El tanque queda en el estado real y el jugador recoloca el total desde ahí.

Los distractores de `explain` y de `apply` se generan desde la regla `detect` de esta misconception y desde la de `limit_as_reaching` del nodo 25; los que faltan se completan con perturbaciones numéricas sin misconception, típicamente sumas hechas con un trozo de más o de menos.

## 13. Generalización

La analogía se retira en `formal`, como declara `fades_at_layer`. Antes, en `symbolic`, el tanque ya perdió el grifo: queda la curva sobre ejes y los rectángulos se apilan directamente bajo ella. El tanque vuelve como fantasma al tocar el signo de integral.

Variantes sin ayuda visual, en orden: curvas que cruzan el eje, con el total con signo separado de la cantidad total que pasó; intervalos partidos en dos con marcas intermedias; curvas dadas como máquina, sin gráfica, donde el jugador evalúa el caudal en los puntos de corte y suma; y el mismo total con particiones distintas, para comprobar que coincide.

Ejes que no son tiempo. El nodo termina con acumulaciones donde el eje horizontal es otra cosa: la densidad de una barra a lo largo de su longitud, que acumula masa; la potencia contra el tiempo, que acumula energía; la cantidad de gente por edad, que acumula población. El jugador arma la franja con las unidades correctas y lee el total como "esto por aquello, sumado". Se evalúa que la estructura (partir, multiplicar, sumar, afinar) se reconoce sin tanque y sin grifo.

El nodo está en `abstract` cuando el jugador produce un total acumulado a partir de una función dada sin gráfica, sostiene que el total no depende del corte, separa el total con signo de la cantidad total y arma la franja con unidades en un contexto que nunca vio.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra piel:

- `prob.rv.cumulative_distribution` (`fill_accumulate` y `urn_dice`): una fila de barras de probabilidad que se acumulan de izquierda a derecha. El nivel del tanque es la probabilidad de quedar por debajo de un valor, y el total al final es uno.
- `mvcalc.int.double_integral_tank` (`fill_accumulate` y `tiles`): el mismo tanque con dos ejes de corte. Las franjas se vuelven columnas sobre una grilla y el total es un volumen.
- `calc2.ser.partial_sums` (`fill_accumulate` y `gears_sequence`): la acumulación en trozos que no se afinan sino que se suceden. El nivel sube a saltos y la pregunta es si se queda quieto.
- `csmath.inv.loop_invariant` (`gears_sequence` y `machine_pipe`): un bucle donde cada vuelta agrega un aporte, y la propiedad que sobrevive a todas las vueltas es que lo acumulado es la suma de lo aportado.

Concepto siguiente: `calc1.int.riemann_refines_to_limit`. Frase puente, narrada sobre el tanque con la manivela en el último diente: "La manivela se trabó, pero las franjas todavía podían afinarse. ¿Qué número hay del otro lado del tope?". El tope se disuelve y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `fill_scene_rectangles_under_curve` es de ruta mixta: pre-renderizada para la apertura y nativa para dibujarse sobre la curva del jugador. Los rectángulos aparecen bajo la curva y el tanque de al lado sube en bloques; gramática `accumulate`, parametrizada por la función de caudal, el intervalo y la cantidad de rectángulos, produce también las animaciones de `explain`. `tile_scene_riemann_refine` es nativa: la partición se afina paso a paso, los rectángulos cambian todos y el contador del total se queda quieto; gramática `accumulate` sobre `partition`, con la altura acumulada iluminada en cada refinamiento y los dos medidores que acotan por arriba y por abajo. Ninguna lleva texto rasterizado: los valores, `Σ`, `∫` y `dx` los dibuja el runtime según el locale; el tanque, el grifo, el cronómetro y la columna de agua son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_integral` ([M](../../M-calculadora/M0-progresion.md)), un ícono con el signo de integral y sus dos marcas, junto a cualquier función armada con fichas. Es numérica: devuelve el total entre las dos marcas, y antes del valor escribe el renglón de la suma con la cantidad de trozos usada y el resultado con dos particiones distintas, para que se vea que coinciden. La forma simbólica llega con el nodo 29. Si el nodo decae, el ícono muestra óxido.

**Edad universal:** el nodo es `short_text` porque desde la capa `symbolic` se leen `Σ`, `∫` y las etiquetas de las franjas con sus unidades, y la definición corta se narra y se muestra escrita ([Q](../../Q-edad-universal.md)). Las capas `real`, `intuition` y `concrete` se juegan sin leer: apretar el grifo, girar la manivela, arrastrar bordes de franja, mover las marcas del cronómetro, mano fantasma y `explain` entre animaciones. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa de rectángulos etiquetados y arma la suma con el teclado de fichas en vez de tipear.
