# El tanque y las franjas (`calc1.int.accumulation`)

Minijuego del nodo 28 de la espina, "Integral: acumular franjas". Mecánica principal `fill_accumulate`, secundaria `tiles`; analogía `tank_filling`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/28-calc1.int.accumulation.md): un concepto, cuatro dificultades reales (el total no depende del corte, la franja como cantidad y no como dibujo, sumar infinitas cosas y obtener un número, el signo), una analogía que el jugador usa desde `found.meas.fill_compare`, un gesto (girar la manivela que parte el tiempo), cinco morphs hasta `∫`, los rectángulos bajo la curva como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

El minijuego no usa la derivada en ningún nivel. Es una restricción de diseño, no un olvido: el nodo 29 descubre que acumular y medir la pendiente son la misma llave, y esa sorpresa se pierde si acá aparece un caminante.

## Analogía

Un tanque, un grifo con una curva de caudal dibujada arriba, una franja de tiempo con dos marcas movibles y una manivela que parte el tiempo en trozos. A los costados del tanque, dos medidores de referencia, uno que corta la curva por arriba y otro por abajo.

Mapa objeto → concepto: caudal del grifo → el integrando; tiempo que corre → la variable de integración; nivel del agua → el valor acumulado; rebanada fina de tiempo → `dx`; sumar las rebanadas → la suma de Riemann; grifo que drena → integrando negativo; medidor de nivel → la primitiva; diferencia de nivel entre dos instantes → la integral definida.

De `tiles` se hereda la mitad que hace que la franja tenga unidades: cada franja es un rectángulo con dos medidas vivas, alto por ancho, caudal por tiempo, y el producto son litros.

Invariante: el total acumulado no depende de en cuántas rebanadas se parta el tiempo. Punto de ruptura: `variable_that_is_not_time`. El tanque sirve mientras el eje horizontal sea tiempo; cuando es longitud, temperatura o dinero, ya no hay grifo. Se retira en `formal` ([G0](../G-analogias/G0-reglas.md)).

Las dos piezas del mapa que hablan de la primitiva y de la lectura inicial desconocida están declaradas y no se usan en este minijuego. Se activan en el nodo 29.

## Mecánica central

Superficie: la curva de caudal ocupa la mitad de arriba sobre ejes tenues, el tanque es una columna a la derecha, la franja de tiempo con sus dos marcas corre abajo de la curva, la manivela de trozos al pie y, desde `symbolic`, el teclado de fichas. Gestos: `scrub`, `hold` y `drag` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Mantener apretado el grifo.** El nivel sube, y sube más rápido donde la curva de caudal es alta. Al soltar, el nivel se queda donde estaba: lo acumulado no se pierde.
- **Girar la manivela.** Con cada vuelta el tiempo se parte en más trozos, los rectángulos bajo la curva se afinan, los escalones que sobraban se achican y el tanque de bloques se acerca al de verdad. Un contador al costado deja de moverse.
- **Llevar la manivela al tope.** Se traba en el último diente. No hay franjas de ancho cero, porque con ancho cero no entra nada de agua, y la manivela lo impide con un tope físico en vez de un mensaje.
- **Arrastrar el borde de una franja.** La franja cambia de ancho y el bloque correspondiente cambia de alto en el tanque. Es el gesto que muestra que la franja es un producto.
- **Mover las marcas del cronómetro.** El total cambia con ellas. Mover la marca de la derecha hacia la izquierda quita exactamente los bloques de ese tramo; juntar las dos marcas deja el tanque vacío.
- **Dar vuelta el grifo.** Con caudal negativo los bloques salen del tanque en vez de entrar, el nivel baja y el contador resta.
- **Tocar un medidor de referencia.** Muestra la suma que corta por arriba y la que corta por abajo, y cómo las dos se acercan al refinar.
- **Armar la suma con fichas.** Desde `symbolic`: el teclado ofrece alturas, anchos, el signo de suma, el índice, el tope y después el signo de integral con sus dos marcas.

Errores con consecuencia física, nunca con la palabra "incorrecto": girar la manivela al revés hasta dejar un solo trozo deja un bloque enorme y se ve el aire entre el rectángulo y la curva; sumar los bloques de un tramo con el grifo dado vuelta como si entraran deja el tanque más lleno de lo que el nivel real marca, y la diferencia queda visible entre las dos columnas.

## Invariante matemático

Dos invariantes, uno por mecánica.

`total_independent_of_chunking` (`fill_accumulate`): el total acumulado es el mismo se parta el recorrido como se lo parta. Se ve confirmarse en el contador que deja de moverse mientras los rectángulos siguen cambiando todos. Se ve romperse en apariencia cuando el corte es grosero: entonces lo que cambia no es el total sino el error, y el aire entre el rectángulo y la curva es la medida de ese error.

`area_preserved_under_rearrangement` (`tiles`): repartir el tramo en dos no cambia lo acumulado. Se ve al mover una marca intermedia: los bloques se reparten en dos pilas y la altura total es la misma. Se ve romperse si el jugador deja un hueco entre dos trozos o los superpone: en el tanque falta o sobra un bloque, y el hueco tiene la forma del trozo que se olvidó.

Un movimiento válido pero inútil (refinar de más cuando el contador ya se estabilizó, mover las dos marcas juntas sin cambiar la separación) no rompe nada: el juego lo ejecuta y, si se repite, la marca del cronómetro que todavía no se movió late como empujón suave.

## Representación visual

Primitiva dominante `accumulate`, de apoyo `scale` y `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: el tanque, el grifo que se abre y se cierra solo, el cronómetro. Solo se mira.
- `intuition`: el tanque a medio llenar y la escena detenida; tres desenlaces (nivel de caudal máximo, de caudal mínimo, intermedio) y después el real, con los dos tanques de referencia a los costados.
- `concrete`: la curva de caudal, el tanque de bloques, la franja de tiempo, la manivela, los medidores.
- `visual`: la curva se dibuja sobre ejes y el tanque queda al lado como columna. El borde de llenado sube mientras el tiempo corre. Las particiones sucesivas se muestran una encima de otra, cada vez más finas, con la altura acumulada iluminada en todas. Cada franja es un rectángulo con sus dos medidas vivas.
- `symbolic`: el bloque se etiqueta como producto, la pila se despliega en fila de sumandos, la fila se contrae en `Σ` con índice y tope, y después en `∫` con las dos marcas y `dx`.
- `formal`: las tres frases con voz y los rectángulos fantasma al lado.

En `visual` todavía no hay símbolos: el medidor muestra un número, los rectángulos no tienen etiqueta y la curva no se llama `f`.

## Transición simbólica

Cinco pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Bloque → producto de dos medidas: al arrastrar el borde de una franja por primera vez en `visual`, el bloque del tanque gana sus dos etiquetas, altura y ancho, y se muestra como producto. El bloque no se reemplaza.
2. Pila de bloques → suma escrita: al girar la manivela con los bloques etiquetados, la pila se despliega al costado como fila de sumandos, uno por bloque. Con cuatro trozos la fila entra; con ocho, ya no.
3. Suma que no entra → `Σ`: cuando la fila se pasa del borde, los sumandos se contraen en un solo signo con índice abajo y tope arriba, y el término general queda a la derecha. Tocar el signo vuelve a desplegar la fila.
4. Manivela al tope → flecha y ancho que se afina: al llegar al último diente aparece bajo la suma la flecha del nodo 25, y el ancho de la franja se contrae en una etiqueta chica que conserva su forma.
5. `Σ` con franjas infinitas → `∫`: al tocar el medidor iluminado, el signo de suma se estira verticalmente hasta volverse el signo de integral, el índice y el tope se convierten en las dos marcas del cronómetro y el término general queda como caudal por ancho. Tocar el signo despliega los rectángulos como fantasma.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre los rectángulos fantasma: acumular una cantidad que cambia es partir el recorrido en trozos, sumar lo que aporta cada trozo y afinar los trozos; la integral definida entre dos marcas es el valor al que se acerca esa suma cuando los trozos se afinan; cuando la cantidad es negativa, el aporte del trozo se descuenta.

Casos verificados sobre el objeto: la suma se estabiliza si la curva no da saltos infinitos en el tramo; con caudal constante la integral es el producto de siempre; con las dos marcas juntas el total es cero; cortar el tramo en dos reparte los bloques en dos pilas cuya suma es la misma; duplicar el caudal duplica la altura de cada bloque y el total.

Los símbolos nuevos son `Σ` y `∫`, con `dx` como lo que quedó del ancho. `Σ` nace de un problema de espacio: la fila de sumandos deja de entrar apenas hay ocho franjas. `∫` nace de un problema propio de este nodo: con `Σ` hay que decir cuántos términos hay, y cuando las franjas se afinan sin fin no hay un último índice que escribir; el signo estirado dice "todas las franjas del intervalo" y por eso lleva las dos marcas en vez de un índice. Las tres entradas de cheatsheet del nodo, `cs.calc1.riemann_sum_notation`, `cs.calc1.integral_notation_meaning` y `cs.calc1.integral_units_rate_times_time`, quedan a un toque desde el panel lateral.

## Generalización

El tanque se retira en `formal`. Antes, en `symbolic`, ya perdió el grifo: queda la curva sobre ejes y los rectángulos se apilan directamente bajo ella. El tanque vuelve como fantasma al tocar el signo de integral.

Variantes sin ayuda visual: curvas que cruzan el eje, con el total con signo separado de la cantidad que pasó por el grifo; intervalos partidos con marcas intermedias; curvas dadas como máquina, sin gráfica, donde el jugador evalúa el caudal en los puntos de corte y suma; y el mismo total con particiones distintas, para comprobar que coincide. Después, ejes que no son tiempo: la densidad de una barra a lo largo de su longitud, que acumula masa; la potencia contra el tiempo, que acumula energía; la cantidad de gente por edad, que acumula población. Cuando el jugador produce un total a partir de una función sin gráfica, sostiene que no depende del corte, separa el total con signo de la cantidad total y arma la franja con unidades en un contexto nuevo, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguno de los dos ejemplos canónicos aplica acá. El de cofres no interviene porque este nodo no invierte nada, y el de frutas quedó atrás. El objeto que sí se hereda es la barra de la suma con patrón, que reaparece en el nodo `calc1.int.riemann_refines_to_limit`.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Apretar el grifo.** `concrete`, `manipulate`. Caudal constante, tanque, cronómetro. Ver que el nivel sube parejo y que el total es un producto.
2. **El caudal cambia.** `concrete`, `recognize`. Curvas de caudal variables; tocar el tanque que junta más agua entre varios, con un distractor de pico alto y total menor.
3. **Partir el tiempo.** `concrete`, `manipulate` y `explain`. Aparece la manivela; refinar y ver el contador quedarse quieto. Los dos medidores de referencia entran en escena.
4. **Rectángulos bajo la curva.** `visual`, `manipulate`. La curva se dibuja sobre ejes y las particiones sucesivas se apilan superpuestas; arrastrar bordes de franja.
5. **Bloques etiquetados y sumas.** `symbolic` primera mitad, `manipulate` y `apply`. Aparecen las dos medidas del bloque, la fila de sumandos y `Σ` con índice y tope; el teclado de fichas.
6. **El signo de integral.** `symbolic` segunda mitad, `apply`. Aparecen la flecha, `dx` y `∫` con sus dos marcas; el tanque se pide con un toque.
7. **Abajo del eje.** Parámetros: curvas que cruzan el eje y grifos que drenan. Aparece `integral_ignores_sign`. También marcas intermedias y tramos partidos.
8. **Ejes que no son tiempo.** `formal` y `abstract`, `generalize`. Las tres frases con voz; funciones dadas como máquina sin gráfica; franjas con unidades de masa, energía y población.

Qué endurece cada parámetro: la curvatura obliga a refinar más antes de que el contador se estabilice; el cruce del eje rompe "acumular es siempre sumar"; las marcas intermedias rompen "el total es un solo bloque de tiempo"; la ausencia de gráfica separa la suma del dibujo; las unidades separan la cantidad acumulada del área.

Desafíos de olimpíada: el nodo participa en los desafíos de cálculo de [S](../S-desafios/S0-desafios.md) como paso previo, y su forma directa aparece en `ch.calc.area_between_hidden_crossings` a través del nodo 29, que lo requiere. La cheatsheet está abierta de entrada en esos desafíos.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro tanques que se llenan con curvas de caudal distintas durante el mismo tiempo marcado; tocar el que tiene más agua al final. Distractores: uno con el pico más alto y total menor, uno con caudal constante alto durante poco tiempo, uno con la curva desplazada.
- `explain`: partir el tiempo en trozos más finos con la manivela y elegir, entre tres animaciones, la que muestra por qué el total no cambia aunque los rectángulos sí. Una muestra los escalones que se achican y el nivel quieto; otra, el nivel que sube en cada refinamiento; otra, un solo rectángulo tomado como todo. El distractor elegido clasifica.
- `manipulate`: apilar rectángulos bajo la curva de caudal, refinar el ancho con la manivela y observar cómo la suma se estabiliza. El medidor se ilumina cuando el contador deja de moverse.
- `apply`: la curva de velocidad de un auto; armar con fichas la distancia recorrida entre dos instantes, primero con rectángulos de ancho 1 y después de ancho 0,5, y colocar la ficha del valor al que se acercan. Contra el tiempo objetivo del nodo.
- `generalize`: una curva con un tramo bajo el eje; decidir, llenando y vaciando el tanque, qué pasa con el total. El jugador coloca la ficha del total con signo y, aparte, la de la cantidad que pasó por el grifo.
- `transfer`: sobre una fila de barras de probabilidad, acumular de izquierda a derecha y leer cuánto se juntó hasta cierto valor. Es `prob.rv.cumulative_distribution`, sin tanque. También en `mvcalc.int.double_integral_tank`, `calc2.ser.partial_sums` y `csmath.inv.loop_invariant`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `integral_ignores_sign`, patrón `replay_on_mechanic` sobre el tanque. El jugador suma también los rectángulos de abajo del eje. El juego congela y repite el llenado en cámara lenta: mientras la curva está arriba entran bloques, y en el cruce el grifo se da vuelta y los bloques salen. El tramo bajo el eje se dibuja vaciando el tanque y un halo marca el momento del cruce. Voz: "En este tramo el grifo drenaba. ¿El nivel subió o bajó?". El tanque queda en el estado real y el jugador recoloca el total desde ahí. Es la única catalogada del nodo.

Los distractores de `explain` y de `apply` se generan desde la regla `detect` de esta misconception y desde la de `limit_as_reaching` del nodo 25; los que faltan se completan con perturbaciones numéricas sin misconception, típicamente sumas hechas con un trozo de más o de menos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `fill_scene_rectangles_under_curve`, ruta mixta: pre-renderizada para la apertura y nativa para dibujarse sobre la curva del jugador. Los rectángulos aparecen bajo la curva y el tanque de al lado sube en bloques; gramática `accumulate`. Parametrizada por la función de caudal, el intervalo y la cantidad de rectángulos, produce los niveles 3 y 4 y las animaciones de `explain`.
- `tile_scene_riemann_refine`, nativa. La partición se afina paso a paso, los rectángulos cambian todos y el contador del total se queda quieto; gramática `accumulate` sobre `partition`, con la altura acumulada iluminada en cada refinamiento y los dos medidores acotando por arriba y por abajo. Parametrizada por la función, el intervalo, la cantidad de rectángulos y el máximo, produce los niveles 5 y 6.
- Reusadas: las escenas de llenado de `found.meas.fill_compare` como apertura sin texto, y `gear_scene` del nodo 25 para la flecha de la aproximación.
- Ninguna lleva texto rasterizado: los valores, `Σ`, `∫`, `dx` y las unidades los dibuja el runtime según el locale; el tanque, el grifo, el cronómetro, la columna de agua y los medidores son assets propios ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_rate_curve`: `family` en {constant, linear, polynomial, trig} (`constant` en el nivel 1, hasta `polynomial` en el 4); `crosses_axis` (falso hasta el nivel 7); `peak_position`; `interval`; `seed`.
- `gen_partition`: `n_start`; `n_ratio` (cuánto se multiplica la cantidad de trozos por vuelta de manivela); `steps` (dientes de la manivela); `rule` en {left, right, midpoint} (solo `left` hasta el nivel 5); `stop_before_zero_width` (verdadero siempre: el tope físico); `interior_marks` (desde el nivel 7).
- `gen_accumulation_context`: `axis_kind` en {time, length, age, money} (`time` hasta el nivel 7); `units` (par de unidades para la franja y para el total); solo en el nivel 8 y en `transfer`.
- `gen_tile_keyboard`: `symbols` (subconjunto de alturas, anchos, signo de suma, índice, tope, signo de integral, marcas, `dx`); `distractors` desde `detect` de `integral_ignores_sign` y de `limit_as_reaching`.

**Literacy soportada:** de `short_text` a `full_text`. Las capas `real`, `intuition` y `concrete` se juegan sin leer (apretar el grifo, girar la manivela, arrastrar bordes de franja, mover las marcas, mano fantasma, `explain` entre animaciones), pero el mínimo es `short_text` porque desde `symbolic` se leen `Σ`, `∫` y las etiquetas de las franjas con sus unidades, y la definición corta se muestra escrita además de narrada. En `full_text` se agregan los enunciados de los casos especiales y las unidades escritas completas.

**Instrucción por demostración:** la primera vez, una mano fantasma mantiene apretado el grifo y el nivel sube; suelta y el nivel se queda. Después gira la manivela y el tiempo se parte en cuatro trozos, con cuatro rectángulos sobre la curva y cuatro bloques en el tanque. La escena vuelve al inicio y el grifo late. Se repite solo si el jugador se queda quieto. La demostración de arrastrar el borde de una franja (nivel 4) es nueva y se muestra una vez. La de comparar recipientes no se repite: es la de `found.meas.fill_compare` ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions, margen con el que se considera estabilizado el contador y espera de la demostración viven en [K](../K-evaluacion.md).
