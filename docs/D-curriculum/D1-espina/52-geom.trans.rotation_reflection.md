# 52 — Deslizar, girar y reflejar (`geom.trans.rotation_reflection`)

> Locale `es`: "Deslizar, girar y reflejar". Minijuego: [La pieza y el molde](../../F-minijuegos/geom.trans.rotation_reflection.md).

**Nodo:** `geom.trans.rotation_reflection` · **Área:** geom · **Nivel:** 1 · **Primitiva:** `invariant` · **Mecánica principal:** `construct` (secundarias `grid_stretch` y `gears_sequence`) · **Literacy:** `icons` · **Analogía:** `quarter_turn_dial`

## 1. Concepto

Un movimiento rígido lleva una figura a otro lugar sin cambiarle nada más que dónde está y hacia dónde mira. Al terminar, el jugador hace calzar una figura sobre otra deslizando, girando y reflejando, o dice que ninguna combinación de las tres lo logra; encuentra qué giro devuelve una figura a sí misma y por qué líneas se dobla sobre sí misma; y sabe que hacer dos movimientos en un orden no es lo mismo que hacerlos en el otro. Antes sabía cuánto había girado una manivela y cuántos lados tenía una figura; no sabía mover la figura entera y quedarse seguro de que no cambió nada.

## 2. Prerequisitos

- `geom.angle.turn_as_measure` (nodo 39): el ángulo como cantidad de giro. Se usa entero: el cuarto y la media vuelta antes de que existan los números, la pista de 360, girar hacia atrás como descuento, y sobre todo la propiedad de que dos giros que difieren en una vuelta entera terminan en el mismo lugar. Lo que cambia es qué gira: allá un brazo con una marca, acá la figura completa, y "terminar en el mismo lugar" pasa a ser "la figura vuelve a caer sobre sí misma".
- `geom.class.polygon_by_sides` (nodo 51): la clase por cantidad de lados, y las dos cuentas, lados y esquinas. Se usa por dos razones. Primero, porque comprobar un movimiento es comprobar que la copia cae esquina sobre esquina, y eso es el emparejamiento uno a uno del nodo 01 hecho ahora entre dos figuras. Segundo, porque lo primero que este nodo tiene que hacer creer es que una figura girada sigue en el mismo cajón, que es exactamente la dificultad 2 del nodo 51 resuelta de frente.

Ninguna de las dos aristas es la del orden escolar, donde las transformaciones llegan después de las coordenadas y se enseñan como reglas sobre pares de números. Acá llegan antes: el movimiento es un gesto y la comprobación es la superposición, no una cuenta. La razón que fija [C0](../../C-knowledge-graph/C0-esquema.md) para toda la rama vale también acá: primero la cantidad de giro sola (39), después qué es lo que gira (52).

## 3. Dificultad cognitiva real

Lo difícil no es girar la pieza. Son cinco capacidades:

1. **Creer que no cambió nada.** La única evidencia que un jugador de cinco años acepta es que la copia cae exactamente encima. Es el invariante `construction_reveals_not_changes` usado para lo que fue hecho: la figura original no se toca nunca.
2. **Separar el movimiento de su efecto.** Un cuarto de vuelta y un cuarto de vuelta más una vuelta entera dejan la figura en el mismo lugar y no son el mismo giro. Viene del nodo 39, y acá abre la simetría: la vuelta entera es el movimiento que no hace nada y que sin embargo cuenta.
3. **La reflexión no se alcanza girando.** Por más que se gire, una mano izquierda no se vuelve una mano derecha. Es la idea más dura del nodo y la única que necesita un gesto propio: levantar la copia y volver a apoyarla del otro lado.
4. **El orden de dos movimientos cambia dónde caés.** Es `matrix_multiplication_commutes`, la misma afirmación falsa que más adelante se escribe con matrices, aparecida acá por primera vez y sin una sola letra.
5. **La simetría es esa misma idea leída al revés.** En vez de mover una figura hasta otra, se busca todo lo que se le puede hacer a una figura sin que se note.

## 4. Problema intuitivo

El mismo taller del nodo 51, con una novedad: en el piso hay un molde, un hueco con la forma exacta de una piedra, y la piedra está apoyada al lado, dada vuelta. La pregunta, por gesto: ¿cómo entra?

En `real` el jugador empuja la piedra con el dedo hasta que cae en el hueco y el hueco se cierra con un chasquido.

En `intuition` la escena se detiene con una piedra despareja, de esas que solo entran de una manera y con una cara para arriba. Tres desenlaces dibujados: alguien la gira mucho rato y finalmente entra; alguien la gira, la gira y nunca entra, hasta que la levanta, la da vuelta y entra a la primera; alguien la aprieta hasta deformarla y la mete a la fuerza. El jugador elige y después ve. Nadie dice cuál está bien: se ve, porque la apretada deja el hueco con los bordes marcados y la girada sigue sin entrar por mucho que gire.

## 5. Analogía del mundo real

`quarter_turn_dial`, la del YAML ([G0](../../G-analogias/G0-reglas.md)). Un disco que gira sobre un eje, con la figura montada encima y una aguja que dice hacia dónde mira.

Mapa del catálogo, leído en este nodo: aguja del disco → hacia dónde mira la figura; un cuarto de vuelta → el cuarto de vuelta de la figura entera; dos cuartos → la figura patas para arriba; largo de la aguja → el tamaño, que nunca cambia y que es exactamente lo que quiere decir "rígido"; ángulo de la aguja → cuánto se giró. El mismo mapa vuelve en `adv.cplx.multiplication_rotates_scales` con otro vocabulario, y ahí el jugador lo reconoce: es la razón por la que este nodo usa el disco y no otra cosa.

Invariante que conserva: el disco gira entero, así que la distancia entre dos puntos cualesquiera de la figura no cambia nunca. Es la mitad rígida de `lines_stay_lines_origin_fixed`, el invariante de `grid_stretch`: las rectas siguen rectas, y además las longitudes se conservan.

Ruptura: el catálogo declara `functions_of_the_pointer`, que queda lejos. La que este nodo sí toca está mucho más cerca y es el corazón de la dificultad 3: **el disco solo gira**. Ningún gesto del disco produce una reflexión; hay que sacar la cara del eje y volver a ponerla del otro lado, y en cuanto se hace eso el disco dejó de ser un disco. La analogía se retira en `symbolic`, cuando la ficha de giro ya lleva su fracción o sus grados.

**Nota de coherencia.** `quarter_turn_dial` declara `mechanic: grid_stretch`, que este nodo lista como secundaria y no como principal. Es deliberado y sigue el precedente del nodo 42, cuya analogía `tile_floor` también corre sobre una mecánica secundaria: la analogía viste una capacidad y la mecánica principal sostiene el gesto. Acá el disco viste el giro, la malla de goma lo hace visible, la manivela de `gears_sequence` dice cuánto se giró, y la mano que levanta la copia, que es la que sostiene el nodo entero, es de `construct`.

Por qué esta y no otra: una analogía de espejo mapearía bien la reflexión y mal el giro, y metería un segundo objeto en pantalla, la imagen detrás del vidrio, para un concepto que tiene una sola figura. El disco conserva un solo objeto y deja la reflexión afuera de una manera que se puede señalar.

## 6. Mecánica de juego

Primera capa jugable: `real`. `construct` es la principal; `grid_stretch` muestra que nada se deformó y `gears_sequence` aporta cuánto se giró ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap`, `hold` y `pinch`.

1. La figura en el piso y el molde en otro lugar, mirando para otro lado. Debajo de todo, una malla de goma con cuadraditos. La figura no se puede estirar: `pinch` sobre ella solo hace temblar la malla y muestra que ningún cuadradito cambia de tamaño.
2. Con un toque sostenido el jugador levanta una copia, que sigue al dedo. La original se queda encendida en su lugar y no se mueve nunca: la figura no se mueve, se mueve una copia.
3. `drag` desliza la copia; el disco del centro y la manivela del nodo 39 la giran; un toque doble la refleja, pero primero hay que trazar con el dedo la línea sobre la que se la va a dar vuelta, que queda punteada.
4. Cuando la copia cae sobre el molde esquina sobre esquina, el molde se cierra con un chasquido y la copia se funde. Si cae casi bien, no chasquea: las esquinas que no coinciden reciben un halo y la copia se queda donde el jugador la dejó, que sigue siendo un estado válido.
5. Si la pieza solo entra dada vuelta y el jugador solo gira, la copia nunca chasquea. En vez de un mensaje, la superficie superpone el contorno de la copia y el del molde, y se ve que uno es el reflejo del otro. La mano fantasma hace el gesto de la línea y el volteo, una sola vez.
6. **Modo simetría:** el molde es la figura misma, y hay que encontrar todos los movimientos que devuelven la copia sobre la original. Cada uno queda registrado como marca: una línea punteada por doblez, un rosetón en el centro con la fracción de vuelta por giro.
7. Las fichas de movimiento quedan en fila al costado, en el orden en que se hicieron. Arrastrar una sobre la otra las intercambia, y la copia vuelve a caer en otro lugar.

Un movimiento válido pero inútil, como deslizar la copia dando un rodeo antes de llegar al molde, no rompe ningún invariante: el molde chasquea igual. Empujón suave, sin explicación.

## 7. Representación visual

Capa `visual`, primitiva `invariant` dominante, con `deform` y `displace` de apoyo ([H](../../H-progresion-abstraccion.md)).

`invariant`: en el antes y el después, el contorno queda iluminado idéntico, con todas sus marcas de lados y de ángulos intactas, y lo único distinto es dónde está y de qué lado quedó. Para que ese "de qué lado" se vea, una esquina lleva color y las demás llevan puntos: recorriendo el borde como en el nodo 51, el orden en que aparecen es siempre el mismo cuando la figura gira y se da vuelta cuando se refleja. Ese orden es la definición visual de la reflexión, y alcanza para distinguirla de cualquier giro.

`deform` de apoyo, por `grid_stretch`: la malla de goma gira con la figura y ningún cuadradito cambia de tamaño. Si el jugador insiste con `pinch`, la malla sí se estira, los cuadraditos se vuelven rectángulos y las marcas de ángulo dejan de coincidir. El contraste es lo que define "rígido" sin definirlo. `displace` de apoyo: deslizar es el desplazamiento del nodo 03 aplicado a todos los puntos a la vez, dibujado con una sola flecha.

Todavía no hay coordenadas, ni flechas con dos números, ni ninguna cadena escrita de movimientos: hay una figura, una copia y marcas.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Piedra → contorno con vértices marcados.** Al primer chasquido en `visual`, la piedra pierde la textura y queda el contorno con puntos en las esquinas y una de ellas en color. Los puntos vienen del nodo 51 y no hay letras.
2. **Gesto → ficha de movimiento.** Cuando la copia chasquea, el gesto deja una ficha al costado: una flecha recta para el deslizamiento, una flecha curva para el giro, una línea con dos medias puntas para la reflexión. La ficha tiene la forma del gesto; no hay nada escrito.
3. **Ficha de giro → ficha con grados.** La flecha curva muestra la fracción de vuelta, y al tocarla la fracción se convierte en el número de grados con su circulito, el mismo que nació en el nodo 39. Quien no jugó el 39 se queda con la fracción y el nodo funciona igual; quien lo jugó reconoce la ficha. Acá es donde el nodo deja de ser `none` y pasa a ser `icons`.
4. **Fichas en fila → cadena de movimientos.** Dos fichas quedan una al lado de la otra en el orden en que se hicieron, y se leen de izquierda a derecha. Arrastrar una sobre la otra las intercambia y la figura vuelve a caer en otro lugar: la cadena es un objeto manipulable antes de ser una notación.
5. **Eje y centro → marcas de simetría.** En modo simetría las fichas dejan de estar al costado y se meten en la figura: cada doblez queda como una línea punteada que la atraviesa, y los giros quedan como un rosetón en el centro con la fracción. Desde acá una figura carga sus simetrías igual que carga su cantidad de lados.

## 9. Notación matemática

Quedan tres marcas: el eje de simetría punteado, el arquito con punta y su fracción o sus grados para el giro, y el orden de las esquinas marcadas, que dice si el movimiento dio vuelta la figura.

El símbolo que nace acá es **el eje de simetría dibujado sobre la figura**. El argumento es el mismo que el nodo 42 hará en grande y con más objetos, y conviene que aparezca antes y más chico. Mientras una figura tiene un solo doblez, recordarlo es gratis. Cuando tiene seis, como un hexágono regular, y hay que decir cuál de los seis lleva esta esquina hasta aquella, recordar deja de funcionar: la marca guarda el hecho **en la figura**, en el lugar exacto donde vale, y libera la cabeza para buscar. Es notación en sentido fuerte, un dibujo que afirma algo, no una etiqueta que nombra.

Por la convención 3 de la [plantilla](_plantilla.md), lo demás no es nuevo y hay que decirlo: el circulito del grado llegó en el nodo 39 con su propio problema, las cifras llegaron en el nodo 01, y los puntos de las esquinas llegaron en el nodo 51. Tampoco aparece acá ninguna manera de escribir la composición de dos movimientos como un producto: la cadena se manipula como dos fichas en fila, y el día que se escriba con un signo será en `linalg.map.linear_transformation_2d`, con el problema que lo justifique.

## 10. Definición formal

Capa `formal`: texto corto con voz y la figura al lado. Tres frases, de a una. "Un movimiento rígido lleva una figura a otro lugar sin cambiar ninguna de sus longitudes ni ninguno de sus ángulos." "Deslizar, girar y reflejar alcanzan para armar cualquier movimiento rígido, y una cadena de movimientos rígidos siempre se puede hacer con un movimiento rígido." "Una simetría de una figura es un movimiento rígido que la deja donde estaba."

Condiciones y casos especiales, verificados sobre el objeto: la vuelta entera, que no mueve nada, es un movimiento rígido y es simetría de cualquier figura, y es la primera vez que "no hacer nada" cuenta como algo; una figura puede no tener ningún doblez, como un triángulo de tres lados distintos, y entonces su única simetría es esa; reflejar dos veces sobre la misma línea devuelve la figura tal cual, así que el doblez es su propia llave; reflejar sobre dos líneas que se cruzan da un giro del doble del ángulo entre ellas; hay una cadena, reflejar y después deslizar a lo largo del mismo eje, que no es ninguno de los tres por separado y que se nombra como lo que es, sin bautizarla; y el círculo rompe el conteo del nodo 51, porque no tiene lados, se dobla por infinitas líneas y vuelve sobre sí mismo con cualquier giro.

Ya jugado: las tres frases enteras, en capa concreta. Nuevo: la palabra simetría, la vuelta entera como movimiento, y que una cadena vuelva a ser un movimiento.

## 11. Propiedades

- **Los movimientos rígidos conservan longitudes y ángulos.** Ligada a la copia que cae esquina sobre esquina y a la malla de goma cuyos cuadraditos no cambian de tamaño.
- **Girar nunca cambia el orden de las esquinas marcadas; reflejar siempre lo da vuelta.** Ligada al recorrido del borde del nodo 51 hecho sobre la copia. Es lo que hace imposible alcanzar una reflexión girando.
- **Dos reflexiones sobre la misma línea dejan la figura como estaba; dos reflexiones sobre líneas que se cruzan son un giro del doble del ángulo entre ellas.** Ligada a doblar dos veces y ver dónde cae la copia.
- **El orden de dos movimientos cambia dónde cae la figura.** Ligada a intercambiar las dos fichas de la fila.
- **Una figura de lados y ángulos todos iguales vuelve sobre sí misma con un giro de una parte de vuelta por cada lado, y se dobla sobre sí misma por tantas líneas como lados.** Ligada a la manivela que chasquea una vez por lado en una vuelta completa. Es la propiedad que junta este nodo con el 51 y la que sostiene los desafíos.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: cuatro piezas al lado de un molde. Tocar la que entra girando, sin darla vuelta. Los distractores son la pieza reflejada, una del mismo aspecto con un lado más y una de la misma forma pero más grande.
- `explain`: el jugador mueve una copia y después elige entre animaciones sobre la misma pieza y el mismo molde: la copia gira un cuarto y chasquea; gira un cuarto más una vuelta entera y chasquea en el mismo lugar; gira y gira y nunca chasquea, y al voltearla una vez entra; y una que la aprieta hasta que entra. Tocar las que muestran por qué girar no alcanzaba.
- `manipulate`: llevar una pieza que solo entra dada vuelta hasta su molde, eligiendo el jugador por qué línea la voltea.
- `apply`: cuatro piezas y cuatro moldes seguidos, contra el tiempo objetivo del nodo. Una entra deslizando, una girando, una hay que voltearla, y una necesita voltearla y después deslizarla.
- `generalize`: modo simetría sobre figuras que nunca vio: un pentágono regular, un molinete de cuatro aspas que gira sobre sí mismo y no tiene ningún doblez, un trapecio isósceles que tiene un doblez y ningún giro, y un triángulo de tres lados distintos que no tiene ninguna simetría salvo la vuelta entera. Decir cuántos dobleces y qué giro tiene cada uno, sin mover nada.
- `transfer`: en el plano de `adv.cplx.multiplication_rotates_scales`, multiplicar por un número que solo gira y reconocer que dos cuartos de vuelta son media vuelta, que es el disco de este nodo con otro nombre.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`matrix_multiplication_commutes`** (`two_paths_diverge` sobre `grid_stretch`, que el nodo declara). El jugador intercambia las dos fichas de una cadena y da por hecho que la figura cae donde caía. El juego parte el estado inicial en dos, corre las dos cadenas sobre dos copias de la misma malla, una al lado de la otra, y las deja quietas en los dos lugares distintos donde terminaron. Voz: "Las dos hicieron lo mismo en distinto orden. ¿Por qué no cayeron en el mismo lugar?". El patrón no reabre la interacción: el ítem se reinicia desde el estado original, porque lo que estaba mal no era el estado sino la expectativa.

Dos errores más no tienen entrada todavía, porque su regla `detect` no se pudo escribir sobre una expresión. Se tratan con el mecanismo de minería de estados erróneos de L0, que registra el evento con el estado previo y el nodo. **Creer que girando lo suficiente se llega al reflejo:** el juego deja girar todo lo que el jugador quiera y superpone los dos contornos con la esquina de color en cada uno; voz: "Las dos esquinas de color están al revés una de la otra. ¿Qué le falta a esta pieza?". **Creer que una copia más grande sigue siendo la misma figura:** aparece al estirar con `pinch`, y el juego apoya la copia estirada sobre el molde y deja ver que un lado sobra y otro falta; voz: "Entra por un lado y sobra por el otro. ¿Qué le cambiaste?".

## 13. Generalización

El disco se retira en `symbolic`, cuando la ficha de giro lleva su fracción o sus grados y el jugador la lee sin mirar el disco. Vuelve a demanda, atenuado, hasta `formal`.

Variantes sin ayuda visual, en orden: piezas que solo entran dadas vuelta, donde el jugador tiene que elegir el eje; cadenas de dos movimientos y después de tres; el conteo de simetrías sobre figuras nunca vistas; figuras sin ninguna simetría salvo la vuelta entera; y el círculo, donde el conteo del nodo 51 falla y las simetrías son infinitas.

El nodo está en `abstract` cuando el jugador, con solo la cantidad de lados iguales de una figura, dice cuántos dobleces tiene y qué giro la devuelve a sí misma, y explica por qué ninguna cantidad de giro deshace una reflexión. La forma completa de esa capa es `adv.alg.group_as_reversible_actions`, que declara este nodo entre sus prerequisitos precisamente por eso: las simetrías de una figura, con la vuelta entera como movimiento que no hace nada y cada movimiento con el que lo deshace, son el primer grupo que el jugador toca con las manos.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, cada uno en otra área y con otra mecánica:

- `adv.cplx.multiplication_rotates_scales` (`grid_stretch`): multiplicar por un número complejo gira y estira a la vez. Es el mismo disco, y el jugador que reconoce que dos cuartos de vuelta dan media vuelta está reconociendo el gesto que hizo acá.
- `disc.mod.clock_equivalence` (`gears_sequence`): los giros que difieren en una vuelta entera son la misma clase. Acá esa propiedad es "la figura cae en el mismo lugar"; allá es una congruencia, y el objeto es un engranaje de doce dientes.
- `linalg.map.linear_transformation_2d` (`grid_stretch`): la malla de goma deformada, donde un giro pasa a ser adónde fueron a parar los dos pasos unitarios. Es el momento en que el movimiento deja de ser un gesto y se vuelve dos columnas, y donde `matrix_multiplication_commutes` reaparece con su nombre puesto.

Concepto siguiente: `geom.trans.dilation`. Frase puente, narrada sobre el último molde cerrado: "Todos estos movimientos dejaron la pieza del mismo tamaño. ¿Y si el molde tiene la misma forma pero es más grande?". El molde crece sin cambiar de forma y el nodo siguiente empieza ahí. Por el otro lado, la línea de la reflexión abre `ch.geom.reflect_shortest_path_river`, donde reflejar un punto sobre una recta convierte un camino quebrado en uno derecho, y `geom.trans.undo_transformation`, donde cada movimiento se vuelve un cofre con su llave.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `construction_scene_lift_copy_and_land_it` es nativa, parametrizada por la figura, por el molde y por si la instancia admite reflejar: la original queda iluminada y quieta, la copia se levanta, gira o se voltea sobre el eje trazado y se apoya, y las esquinas que no coinciden reciben halo; gramática `invariant`, con el contorno idéntico en el antes y el después. Renderizada sobre el estado del jugador, produce también las animaciones de `explain`. `grid_scene_turn_and_flip_the_sheet` es nativa, parametrizada por el giro, por el eje y por si las dos cadenas corren intercambiadas: la malla gira y se voltea con la figura sin que ningún cuadradito cambie de tamaño, y en el modo de dos caminos corre las dos cadenas una al lado de la otra hasta dejarlas en lugares distintos, que es el patrón de explicación de la misconception del nodo; gramática `deform`. Las dos son `text_free` ([P](../../P-internacionalizacion.md)). Se reúsa `construction_scene_walk_the_boundary` (nodo 51) para mostrar el orden de las esquinas dándose vuelta.

**Calculadora:** en `ready` se habilita `op_transform_point` ([M](../../M-calculadora/M0-progresion.md)), de nivel 1 y con caja de pruebas. Se presenta como una pieza y un molde: el jugador arma la cadena con fichas y la calculadora muestra adónde va a parar cada esquina. No devuelve un par de números sueltos, porque las coordenadas todavía no existen para este jugador: devuelve la figura movida con las esquinas emparejadas. Lo reusan `geom.trans.dilation` y `geom.sim.similarity_as_scale`, que le agregan el factor de escala.

**Edad universal:** el nodo es `icons` por el paso 3 del desvanecimiento, donde la ficha de giro lleva la fracción y después los grados ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: mover es arrastrar, girar es girar, reflejar es trazar una línea y tocar dos veces, `explain` es elegir entre animaciones, y las fichas son formas de gesto y no palabras. La instrucción es una mano fantasma que levanta la copia y la lleva al molde, y una segunda que traza la línea y la voltea, reservada para la primera pieza que no entra girando. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra con las fichas ya numeradas y recibe las cadenas de dos movimientos desde el primer nivel.
