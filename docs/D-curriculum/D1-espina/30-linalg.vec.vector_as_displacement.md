# 30 — Vector como desplazamiento (`linalg.vec.vector_as_displacement`)

> Locale `es`: "Vector como desplazamiento". Minijuego: [El mapa del tesoro](../../F-minijuegos/linalg.vec.vector_as_displacement.md).

**Nodo:** `linalg.vec.vector_as_displacement` · **Área:** linalg · **Nivel:** 6 · **Primitiva:** `displace` · **Mecánica principal:** `grid_stretch` (secundaria `gears_sequence`) · **Literacy:** `icons` · **Analogía:** `treasure_map_arrows`

## 1. Concepto

Un vector del plano no es un lugar: es una manera de moverse, tantos pasos al este y tantos al norte. Al terminar, el jugador lee las dos cuentas de una flecha, dibuja la flecha que lleva de un punto a otro, arrastra esa flecha a otro rincón del mapa sabiendo que sigue siendo la misma, la da vuelta, la estira al doble y encadena dos flechas punta con cola. Antes ubicaba un punto en una grilla con un par de números; no sabía nombrar un movimiento sin nombrar de dónde sale.

## 2. Prerequisitos

- `alg.fn.graph_as_picture` (nodo [18](18-alg.fn.graph_as_picture.md)): el plano con dos ejes. Se usan la grilla, la lectura de una posición como par de números y el gesto de arrastrar un punto y ver cambiar sus dos lecturas.
- `arith.add.displacement` (nodo [03](03-arith.add.displacement.md)): sumar es desplazarse. Se usan el paso como acción y no como lugar, la pista con la manivela y la idea de que dos desplazamientos seguidos equivalen a uno solo.

La arista que no sigue el orden escolar es la que ordena estos dos. La escuela presenta el vector como "un par ordenado con una flechita encima", es decir, como un punto disfrazado. [C0](../../C-knowledge-graph/C0-esquema.md) exige `arith.add.displacement` justamente para impedirlo: el jugador llega con la experiencia de que un número puede ser un movimiento antes de que alguien le dibuje una flecha. El par de coordenadas del nodo 18 queda del lado de los lugares, y este nodo construye el otro lado.

## 3. Dificultad cognitiva real

Lo difícil no es contar cuadraditos. Son cuatro capacidades:

1. **Separar el desplazamiento del lugar.** La misma flecha dibujada en otro rincón del mapa es la misma flecha. Es lo más difícil del nodo y contradice todo lo que el jugador hizo en el nodo 18, donde mover el dibujo cambiaba la respuesta.
2. **Leer una flecha como dos cuentas independientes.** Al este y al norte son dos cantidades que no se mezclan, y juntas reconstruyen la flecha entera. Es la raíz de todo lo que viene después.
3. **No sumar los pasos para obtener el largo.** El camino en escalera y la flecha derecha no miden lo mismo. Es el punto de ruptura de la analogía y la misconception `modulus_of_sum_adds`.
4. **Aceptar cuentas negativas.** Ir al oeste es ir menos al este. La flecha dada vuelta no es una flecha nueva: es la misma receta con los dos signos cambiados.

Las cuatro son independientes y ninguna se resuelve calculando.

## 4. Problema intuitivo

Un mapa viejo sobre un pergamino, con una grilla dibujada encima y una cruz. Un caminante está parado junto a un cofre y tiene una tarjeta con una flecha: la instrucción para llegar al faro. Camina y llega.

En `intuition` la escena se detiene antes de repetir el viaje. El caminante ahora arranca desde el molino, con la misma tarjeta en la mano. Tres desenlaces dibujados: termina a la misma distancia y en la misma dirección respecto del molino; termina otra vez en el faro, como si la tarjeta apuntara a un lugar; vuelve al cofre. El jugador elige y después ve.

## 5. Analogía del mundo real

`treasure_map_arrows`, "El mapa del tesoro", con la mecánica `grid_stretch` ([G0](../../G-analogias/G0-reglas.md)). Mapa de estructura: flecha en el mapa → vector; pasos al este y pasos al norte → componentes; segunda flecha desde la punta de la primera → suma de vectores; la misma flecha dibujada en cualquier lado → vector libre; flecha dada vuelta → vector opuesto; flecha del doble de largo → múltiplo escalar.

Invariante: dos flechas son la misma flecha si tienen las mismas dos cuentas, sin importar desde dónde salen. El mapa lo hace visible porque la grilla está impresa y las cuentas se leen en cuadraditos.

Punto de ruptura: `length_of_diagonal_arrow`. El pergamino no ofrece ninguna manera de contar la diagonal en pasos. Ese vacío es útil: es exactamente el problema que después exige la fórmula del largo (`cs.linalg.vector_length`) y que conecta el nodo con Pitágoras. La analogía se retira en `symbolic`, antes de que el jugador intente medir el pergamino con una regla.

Por qué esta y no otra. La flecha del cartel de una ruta conserva la dirección pero pierde el vector libre, que es justamente lo difícil. El mapa con grilla conserva las dos cuentas, la independencia entre ellas y la libertad de dibujar la flecha donde uno quiera.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `grid_stretch` provee la superficie (la grilla del mapa y las flechas que viven sobre ella) y `gears_sequence` provee el orden de los pasos: dos manivelas, una para el este y otra para el norte ([E0](../../E-mecanicas/E0-catalogo.md)). Se encuentran en un solo gesto: girar las manivelas dibuja la flecha, arrastrar la flecha mueve las manivelas. Gestos: `drag`, `tap` y `pinch`.

1. El mapa con el caminante, el cofre, el faro y la cruz. Abajo, dos manivelas con un contador de un dígito cada una.
2. Demostración: una mano fantasma gira la manivela del este tres clics y la del norte dos. El caminante avanza en escalera y una flecha recta lo sigue del principio al final.
3. El jugador gira las manivelas. Cada clic mueve al caminante un cuadradito y alarga el trazo. Girar hacia atrás lo devuelve, y pasado el cero el contador sigue en negativo con la flecha apuntando al otro lado.
4. El jugador arrastra la flecha entera tomándola del cuerpo. Viaja rígida por el mapa, con un fantasma en el lugar de origen; los dos contadores no se mueven. Si la toma de la punta, la flecha cambia y los contadores cambian con ella. Los dos gestos existen desde el primer nivel porque la diferencia entre ellos es el concepto.
5. Encadenar: apoyar una segunda flecha en la punta de la primera. El caminante recorre las dos y aparece una flecha punteada del inicio al final, con sus propios contadores.
6. Éxito: cuando la punta cae sobre la cruz, la flecha se ilumina y el cofre se abre. Sin cartel.

Nada se llama incorrecto. Arrastrar la flecha por la punta hasta deformarla no es un error: el fantasma se separa, los contadores divergen y el jugador ve dos flechas distintas.

## 7. Representación visual

Capa `visual`, primitiva dominante `displace` ([H](../../H-progresion-abstraccion.md)).

El pergamino pierde la textura y queda la grilla limpia con un punto marcado en el origen. La flecha se ancla ahí y sus dos cuentas se dibujan como dos catetos punteados, uno horizontal y otro vertical, formando el triángulo de pasos. Lo que se desplaza es la punta; lo que se conserva es la relación entre los dos catetos cuando la flecha se arrastra entera. Al estirar con `pinch`, los dos catetos se escalan a la vez y el ángulo no cambia: ahí se ve el múltiplo escalar.

El vector libre se muestra a demanda: mantener el dedo sobre la flecha llena el plano de copias translúcidas de la misma flecha, todas con los mismos catetos. Es la imagen central del nodo.

Todavía no hay números escritos sobre la flecha ni largo medido. La hipotenusa del triángulo de pasos está dibujada pero no tiene etiqueta, y eso es deliberado: la pregunta por su medida es el motor del nivel siguiente.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Pergamino → grilla.** La primera vez que el jugador arrastra la flecha entera a otro rincón y los contadores no se mueven, el pergamino se desvanece y queda la grilla. El mapa ya no hace falta: la flecha se sostiene sola.
2. **Catetos → fichas.** Los dos catetos punteados se contraen en dos fichas numéricas junto a la flecha, `3` y `2`, heredando el color de cada manivela.
3. **Fichas → columna.** Al arrastrar la flecha una vez más con las fichas puestas, las fichas se apilan una sobre otra y un corchete fino crece a los costados. Nace la columna de componentes.
4. **Flecha → nombre.** Cuando el jugador maneja dos flechas a la vez, cada una se contrae hasta una letra con una flechita encima, `v⃗`, conservando el color y el id de la flecha.
5. **Manivelas → operaciones.** El `pinch` que estira al doble escribe `2v⃗` al lado de la columna, y girar las dos manivelas hacia atrás hasta espejar la flecha escribe `−v⃗`. La flecha punteada de la cadena escribe `u⃗ + v⃗`.

## 9. Notación matemática

Queda la columna de componentes con su corchete, la letra con flechita, y el largo escrito entre barras dobles.

Los símbolos nuevos son dos. La **columna** nace en el paso 3, y el problema que la hace necesaria es que el par escrito en fila ya está ocupado: en el nodo 18 significa un lugar. Después del paso 1 la flecha puede estar en cualquier parte, así que señalarla dejó de servir para nombrarla, y escribirla como el par de un punto diría lo que no es. La columna dice "esto es una receta de pasos, no una dirección postal". La **flechita sobre la letra** aparece en el paso 4 por un problema más chico y muy concreto: en cuanto hay dos flechas en pantalla y también hay números de pasos, `v` a secas se confunde con una cantidad.

El tercer símbolo, `‖v⃗‖`, llega con el punto de ruptura de la analogía: el jugador quiere saber cuánto mide la diagonal y el mapa no se lo puede decir en pasos. Las barras dobles nacen para distinguir esa medida de las dos cuentas que sí sabe leer.

## 10. Definición formal

Capa `formal`: texto corto con voz y la flecha al lado, de a una frase. "Un vector del plano queda determinado por dos números, sus componentes." "Dos flechas son el mismo vector si tienen las mismas componentes, sin importar desde dónde salen." "El largo del vector es la hipotenusa del triángulo de pasos."

Condiciones y casos especiales, verificados sobre el objeto: el vector cero es una flecha sin largo, sigue siendo un vector y no tiene dirección; una flecha puramente al este tiene la componente norte en cero y no deja de ser una flecha; las componentes pueden ser negativas y fraccionarias, aunque el mapa solo dibuje cuadraditos enteros.

Ya jugado: las tres frases enteras. Nuevo: la palabra "vector", la palabra "componentes" y la fórmula del largo.

## 11. Propiedades

- **Mismas componentes, mismo vector.** Ligada al arrastre de la flecha entera con los contadores quietos y a la nube de copias translúcidas.
- **Encadenar suma componente a componente.** Poner la segunda flecha en la punta de la primera da una tercera cuyas cuentas son las sumas. Ligada al caminante que recorre los dos tramos.
- **Dar vuelta cambia los dos signos; estirar escala las dos componentes.** Ligada al `pinch` y a las manivelas hacia atrás.
- **El largo no es la suma de las componentes.** Ligada al camino en escalera comparado con la flecha derecha: la flecha siempre es más corta o igual. Es la desigualdad triangular jugada antes de nombrarla.
- **El orden de los dos tramos no cambia el destino.** Este y después norte llega al mismo lugar que norte y después este. Ligada a la escena de las dos manivelas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias flechas dibujadas en distintos rincones del mapa; tocar la que va tres pasos al este y dos al norte. Los distractores tienen las cuentas cambiadas de orden, una cuenta con el signo dado vuelta y el mismo dibujo con otra escala.
- `explain`: la misma flecha se muestra en tres animaciones. En una se arrastra entera a otro rincón y los contadores no se mueven; en otra se arrastra de la punta y los contadores cambian; en la tercera se gira sobre su cola. Tocar las que dejan de ser el mismo desplazamiento. El jugador narra con la voz cuál es la diferencia.
- `manipulate`: dibujar la flecha que lleva del cofre al faro y después la que vuelve. La segunda tiene que aparecer con los dos contadores en negativo.
- `apply`: con una flecha dada, ubicar dónde termina el caminante saliendo del punto marcado, antes de que se mueva. Después el caminante camina y confirma.
- `generalize`: estirar la flecha al doble sin cambiar la dirección y predecir cuántos pasos al este y al norte tendrá, con la grilla apagada. Después con un factor fraccionario y con un factor negativo.
- `transfer`: en la rueda giratoria de `trig.rot.rotation_matrix`, ubicar el punto que corresponde a la flecha que apunta hacia arriba y a la derecha.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`modulus_of_sum_adds`**, patrón `counterexample_slider`. El jugador afirma que la flecha de tres al este y cuatro al norte mide siete, o que el largo de una cadena es la suma de los largos. La mecánica declarada del patrón es `slope_walker`, que este nodo no declara. Se aplica la regla de L0: como el jugador ya conoce al caminante de la pendiente desde el nodo [19](19-alg.fn.linear_slope.md), la explicación corre ahí y se presenta como un regreso, "esto ya lo mediste con el caminante". Si el nodo 19 todavía no está en `ready`, el mismo contraejemplo corre sobre `grid_stretch`, con el mismo invariante. En los dos casos se ve lo mismo: un deslizador mueve la cuenta del norte desde cero hacia arriba mientras dos cuerdas se tensan sobre el mapa, una por el camino en escalera y otra por la diagonal, y la diferencia entre las dos se abre a la vista. En cero coinciden, y eso es lo que hay que ver primero. Voz: "Caminaste tres al este y cuatro al norte. ¿La flecha derecha mide lo mismo que el camino en escalera?".

Confundir el desplazamiento con el lugar no está catalogado como misconception y no dispara explicación: es un movimiento válido con consecuencia visible. El fantasma se queda en el punto de partida y los contadores lo desmienten solos. Recibe un empujón suave.

## 13. Generalización

La analogía se retira en `symbolic`, en cuanto la columna se sostiene sin la grilla debajo. El mapa se pide con un toque hasta `formal` y después no vuelve.

Variantes sin ayuda visual, en orden: componentes negativas; flechas que salen de un punto que no es el origen y hay que leer por diferencia; componentes fraccionarias; el vector cero; predecir el largo antes de medirlo.

Desplazamientos que no son pasos. El nodo termina con pares que no viven en un mapa: dos diales de una máquina, la variación de dos precios entre ayer y hoy, dos marcadores de un partido. El jugador reconoce la misma estructura y que ahí el largo puede no significar nada útil.

El nodo está en `abstract` cuando el jugador opera con columnas sin pedir grilla, distingue una posición de un desplazamiento en un contexto nuevo y explica por qué el largo no se reparte en la suma.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `trig.rot.rotation_matrix`: la flecha sobre la rueda, descrita por ángulo y radio en vez de por dos cuentas. La misma flecha, otro par de números.
- `adv.cplx.plane_and_modulus`: la flecha como número, donde el largo pasa a llamarse módulo y aparece el mismo problema de la diagonal.
- `mvcalc.field.arrow_at_every_point`: una flecha en cada punto del plano, que solo tiene sentido si la flecha ya se soltó del lugar donde está dibujada.
- `geom.trans.dilation`: estirar una figura desde un centro, que es aplicar el mismo múltiplo escalar a todas las flechas a la vez.

Concepto siguiente: `linalg.vec.add_tip_to_tail`, y enseguida `linalg.vec.scale_and_reverse`, que profundizan los dos gestos que este nodo ya deja jugados. La espina retoma en `linalg.vec.span_and_combination` ([31](31-linalg.vec.span_and_combination.md)). Frase puente, narrada sobre la última flecha encadenada: "Con una flecha llegás a un lugar. Si te dan dos flechas y podés repetirlas todas las veces que quieras, ¿a cuántos lugares llegás?". Las dos manivelas se separan del mapa y se convierten en dos flechas sueltas sobre la grilla, y el nodo 31 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `grid_scene_arrow_on_map` es nativa: recibe el vector y una lista de puntos de partida, y dibuja la misma flecha naciendo en cada uno con los catetos punteados iguales; gramática `displace`. Es la escena del vector libre y produce las animaciones de `explain`. `gear_scene_steps_east_then_north` es nativa: recibe las dos cuentas y anima al caminante haciendo primero el tramo al este y después el del norte, con la flecha recta que lo resume; gramática `displace`. Ninguna lleva texto rasterizado: los contadores los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_vector_length` ([M](../../M-calculadora/M0-progresion.md)), un ícono de flecha diagonal con una regla, disponible sobre cualquier columna armada con fichas. No devuelve solo el número: dibuja el triángulo de pasos con la hipotenusa iluminada, para que el resultado siga siendo la diagonal del camino. La aritmética de vectores llega con `linalg.vec.add_tip_to_tail`. Si el nodo decae, la flecha del ícono pierde la punta.

**Edad universal:** el nodo es `icons` porque los contadores de las manivelas muestran un dígito con signo desde el primer nivel ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: manivelas, arrastre, mano fantasma, `explain` entre animaciones y prompts por voz; el mapa no tiene palabras. Un adulto llega por diagnóstico saltando `real` e `intuition` y suele traer la idea escolar del vector como par de coordenadas; el nivel del vector libre no se le saltea nunca, porque es donde esa idea se corrige.
