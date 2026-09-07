# La manivela y la vuelta (`geom.angle.turn_as_measure`)

Minijuego del nodo 39 de la espina, "El ángulo es un giro". Mecánica principal `gears_sequence`, secundarias `construct` y `grid_stretch`; analogía `number_line_walk`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/39-geom.angle.turn_as_measure.md): un concepto, cuatro dificultades reales (el giro y no la longitud, el grado como convención, el giro acumulado frente a la posición final, lo que falta para cerrar la vuelta), una analogía doblada en círculo, un gesto (girar el brazo hasta la meta), cinco pasos de desvanecimiento, la pista con el sector pintado como visualización dominante, retiro en `visual`. Acá se fija cómo se juega.

## Analogía

El camino de piedras del nodo 02, doblado hasta cerrarse sobre sí mismo. Una manivela en el centro con un brazo y una marca en la punta; alrededor, una pista circular con muescas. La marca es el caminante y cada muesca es una piedra.

Mapa objeto a concepto: piedra de la pista → grado; posición de la marca → valor del ángulo; una muesca de avance → incremento unidad; orden de las muescas → orden de los ángulos; muesca de arranque → cero; pista completa → la vuelta; sector pintado detrás de la marca → el ángulo como cantidad acumulada.

La pista aporta que el ángulo es una posición sobre algo que se recorre, y no una distancia entre dos puntas. El trazo de `construct` aporta el ángulo exterior: prolongar un lado hace aparecer un sector que no estaba dibujado. La malla de goma aporta la independencia del tamaño: la figura se estira y el sector no cambia. Punto de ruptura de la pista: `position_between_stones`, el caminante no se para entre dos piedras y hay giros que caen entre grados, y por eso la analogía se retira en `visual` ([G0](../G-analogias/G0-reglas.md)).

`number_line_walk` declara `mechanic: slope_walker`, que no está entre las mecánicas del nodo. Acá corre sobre `gears_sequence`, con la pista cerrada: el mapa objeto a concepto se conserva entero y lo único que cambia es el gesto, de caminar a girar.

## Mecánica central

Superficie: la manivela en el centro, la pista circular alrededor, la figura a un costado desde la capa `visual`. Gestos: `scrub`, `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar el brazo.** La marca recorre la pista y el sector se pinta detrás. El rastro es el ángulo, y se pinta mientras el dedo se mueve.
- **Llegar a la meta.** La manivela chasquea y el rastro queda fijo. La meta es un sector dibujado en gris sobre la pista.
- **Tocar el segundo brazo.** Un brazo más corto gira pegado al primero. Al tocarlo, los dos rastros se superponen y coinciden aunque las puntas hayan recorrido distancias distintas.
- **Partir la pista con dos dedos.** La pista se divide en 2, 4, 8 o cualquier cantidad de partes iguales y las muescas se reacomodan. Con 360 partes las muescas se numeran de a diez.
- **Seguir girando pasado el cero.** No hay tope. El rastro sigue acumulando y da la segunda vuelta por fuera de la primera, en otro tono. Girar hacia atrás descuenta.
- **Prolongar un lado.** Sobre una figura, arrastrar desde un vértice siguiendo un lado y soltar más allá. La prolongación queda punteada y el sector exterior se pinta; los dos sectores juntos cierran media pista.
- **Estirar la figura con dos dedos.** Los lados crecen sobre la malla de goma y el sector pintado no cambia de tamaño.

En `symbolic` la superficie cambia de forma, no de reglas: el sector se contrae en un arquito junto al vértice con su ficha de grados, sumar dos ángulos es acercar dos fichas, y la pista se pide tocando el arquito y aparece como fantasma.

## Invariante matemático

`same_step_every_turn`: la manivela avanza siempre la misma cantidad de pista por cantidad de giro, así que la porción de pista recorrida es una medida honesta del giro. Se ve confirmarse en los dos brazos de distinto largo que pintan el mismo sector. Se ve romperse cuando el jugador intenta medir por la punta: la punta del brazo largo recorrió mucho más y la pista, que es la misma para los dos, no lo registra.

El invariante de `construct` es el de apoyo: `construction_reveals_not_changes`. Prolongar un lado no modifica la figura ni el ángulo original; hace visible el que falta para cerrar la media vuelta. El de `grid_stretch`, `lines_stay_lines_origin_fixed`, sostiene el otro apoyo: la malla deforma la figura y las rectas siguen siendo rectas, así que los ángulos se conservan.

Un movimiento válido pero inútil, como girar una vuelta entera de más antes de llegar a la meta, no rompe ningún invariante: el rastro queda con dos capas y la meta se alcanza igual. Recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `displace`, de apoyo `invariant` y `deform` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el portón sobre el patio, con la marca de tierra que barre en el piso. Se empuja y se predice.
- `concrete`: manivela con brazo y marca, pista con muescas sin números, meta en gris. Nada escrito.
- `visual`: el brazo se reduce a un segmento desde un punto y la pista a un arco. El ángulo se muestra siempre como sector, nunca como cuerda. Al prolongar un lado, el antes y el después se muestran con el sector original iluminado en los dos y el nuevo solo en el después.
- `symbolic`: arquito junto al vértice, ficha con el número y el circulito de grado, y el renglón de la suma cuando hay dos.
- `formal`: las tres frases con voz y la manivela fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Manivela → pista sola: al alcanzar la meta por tercera vez en `visual`, el brazo se afina hasta ser un segmento y la manivela desaparece; quedan el vértice, los dos lados y el sector.
2. Muescas → números: al partir la pista en 360 con dos dedos, las muescas se numeran de a diez y el rastro muestra su valor mientras el dedo se mueve. El número vive sobre la pista.
3. Número en la pista → ficha con grado: al soltar el brazo en la meta, el número se despega y cae junto al vértice como ficha, con un circulito arriba a la derecha, que viaja con el número desde acá.
4. Sector → marca de ángulo: al tocar la ficha, el sector se contrae en un arquito junto al vértice y la pista se desvanece; queda la figura con `90°`. Tocar el arquito devuelve la pista como fantasma.
5. Dos sectores → suma escrita: al prolongar un lado, los dos arquitos quedan juntos y sus fichas se acercan hasta formar el renglón `130° + 50° = 180°`, con un morph desde los dos sectores.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la manivela fantasma: un ángulo es la cantidad de giro entre dos lados que salen del mismo punto; la vuelta entera se parte en 360 partes iguales y cada parte es un grado; el largo de los lados no cambia el ángulo. Casos: el ángulo recto es un cuarto de vuelta, 90; el llano es media vuelta, 180; la vuelta completa es 360 y deja la marca donde empezó, aunque un giro de 0 y uno de 360 no son el mismo giro. Sumar dos ángulos es girar uno después del otro; girar hacia atrás resta. Propiedades: los ángulos se suman girando, el ángulo no depende del largo de los lados, un ángulo y su prolongación completan media vuelta, y dos giros que difieren en una vuelta entera terminan en el mismo lugar. Símbolo nuevo: el grado, necesario desde el momento en que el número se despega de la pista y `90` deja de decir de qué es, con baldosas y pasos ya compitiendo por el mismo número.

## Generalización

La pista se retira en `visual`, apenas deja de tener piedras visibles y se vuelve una franja continua: ahí el giro puede caer entre dos grados y el caminante no tiene dónde pararse.

Variantes sin ayuda visual: ángulos que no son múltiplos de 45; el ángulo que falta para completar media vuelta y para completar la vuelta; giros mayores que una vuelta; giros hacia atrás; la vuelta partida en una cantidad que no divide a 360, donde el grado deja de ser entero; y la misma figura dibujada más grande. Cuando el jugador dice cuánto vale cada parte de una vuelta partida en cualquier cantidad sin girar, y explica por qué un giro de 400 y uno de 40 terminan igual sin ser el mismo giro, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Abrir el portón.** `real` y `concrete`, `manipulate`. Un brazo, una meta, pista sin muescas. Solo se gira hasta que chasquea.
2. **Dos brazos.** `concrete`, `recognize` y `explain`. Aparece el brazo corto. Metas de un cuarto, media y tres cuartos de vuelta, sin números.
3. **Partir la vuelta.** `concrete`, `manipulate` y `generalize`. La pista se parte con dos dedos en 2, 4 y 8. Sigue sin números.
4. **La pista de 360.** `visual` y primera mitad de `symbolic`, `manipulate` y `apply`. Aparecen las muescas numeradas y la ficha con el grado. Metas en múltiplos de 15.
5. **Prolongar el lado.** `symbolic`, `manipulate` y `apply`. Aparece la figura y el trazo de prolongación; el ángulo exterior y el interior cierran media vuelta. Se agrega la malla de goma para estirar la figura.
6. **Sin la marca.** Segunda mitad de `symbolic`, `apply`. La meta deja de estar dibujada: hay que girar el valor pedido leyendo la pista. Parámetros: ángulos que no son múltiplos de 45, giros mayores que una vuelta y giros hacia atrás.
7. **Partes que no cierran redondo.** `formal` y `abstract`, `generalize`. Definición corta con voz; la vuelta partida en 5, 7 y 12, donde el grado deja de ser entero.

Qué endurece cada parámetro: el brazo de distinto largo separa giro de longitud; la partición no divisora rompe la idea de que el grado siempre es entero; los giros de más de una vuelta separan giro acumulado de posición final; los giros hacia atrás obligan a leer el signo del recorrido y preparan el nodo 43.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): ningún desafío del catálogo requiere este nodo por nombre, porque los desafíos de ángulos se apoyan en `geom.angle.parallel_transversal`, que es su `next`, y en `geom.cons.auxiliary_lines`, que lo tiene como prerequisito. El nodo entra en la rama por esa puerta: `ch.geom.parallel_cut_missing_length` es el primero que lo usa de hecho, sin nombrarlo, cuando hay que reconocer ángulos iguales entre paralelas. Hasta que el jugador llegue a esos nodos, este no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro manivelas giradas distinta cantidad, con brazos de largos distintos. Tocar la que dio un cuarto de vuelta. Los distractores giran un octavo, tres octavos, y un cuarto con el brazo del doble de largo, que es el que separa giro de longitud.
- `explain`: tres animaciones sobre la misma pista: media vuelta de un tirón; dos cuartos de vuelta seguidos, que terminan en el mismo lugar; un cuarto con el brazo del doble, que pinta la misma porción. Tocar la que muestra por qué media vuelta y dos cuartos coinciden.
- `manipulate`: girar la manivela hasta que la marca coincida con la meta y la pista numerada muestre 90. Después, prolongar un lado de un triángulo y ver cuánto falta para completar el giro.
- `apply`: con la pista a la vista, girar exactamente 135, y después el ángulo que falta para cerrar la vuelta, sin la marca de meta, contra el tiempo objetivo del nodo.
- `generalize`: una vuelta partida en 8 partes iguales; decir cuánto vale cada parte girando una sola vez. Después en 5 y en 12.
- `transfer`: en el reloj de `disc.mod.clock_equivalence`, mover la aguja de las 12 a las 4 y marcar en la pista de grados el giro que hizo.

Misconceptions ([L0](../L-modelo-errores/L0-taxonomia.md)): el YAML declara `misconceptions: []`. Los dos errores frecuentes del nodo, medir el ángulo por el largo de los lados y confundir el giro acumulado con la posición final, todavía no tienen entrada porque su regla `detect` no se pudo escribir sobre una expresión. Mientras tanto el juego ejecuta el movimiento y deja los dos rastros a la vista, uno corto y uno que dio la vuelta entera y siguió. Voz: "Los dos llegaron hasta acá. ¿Cuál giró más?". El evento se registra con el estado previo y el nodo, que es el mecanismo de minería de estados erróneos de L0.

Una misconception llega heredada del prerequisito de fracciones:

- `fraction_add_across`, patrón `missing_piece_tiles`, mecánica `tiles`. Aparece al juntar un cuarto de vuelta con un octavo. `tiles` no está entre las mecánicas del nodo, así que corre el caso 2 de la regla de L0: el jugador ya conoce las baldosas desde el nodo 08 y la explicación se presenta como un regreso. Las dos porciones de pista se enderezan en dos tiras de baldosas de distinto tamaño y brilla la pieza que falta para igualar la unidad. Voz: "Estos pedazos no son del mismo tamaño. ¿Cuántos octavos entran en un cuarto?". Al completar, las tiras se vuelven a curvar sobre la pista.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de los prerequisitos, más los grupos de estados erróneos ya minados del nodo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_scene_turn_as_angle`, nativa, parametrizada por el giro objetivo y por si la pista muestra números. La manivela gira con un valor compartido, el sector se pinta detrás y el número de la pista cambia en sincronía; gramática `displace`. Renderizada sobre el estado del jugador, produce también las animaciones de `explain` variando el giro y el largo del brazo.
- `construction_scene_extend_side_exterior_angle`, nativa, parametrizada por los vértices de la figura y por cuál vértice se trabaja. El lado se prolonga punteado, el sector exterior se pinta y los dos juntos se resaltan cerrando media vuelta; gramática `invariant`. Abre los niveles 5 y 6 y es la imagen de cheatsheet de `cs.geom.exterior_angle_completes_turn`.
- Las dos son `text_free`: los números y los nombres los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_dial`: `target_turn` (fracción de vuelta en los niveles 1 a 3, grados desde el 4); `arm_lengths` (uno o dos brazos, con la razón entre ellos como distractor); `show_marks`; `allow_overshoot`, que habilita giros de más de una vuelta y hacia atrás; `seed`.
- `gen_turn_partition`: en cuántas partes iguales se parte la vuelta (2, 4, 8 en el nivel 3; 5, 7, 12 en el 7), y si el resultado por parte cae entero.
- `gen_figure_exterior`: cantidad de lados de la figura, qué vértice se prolonga, y cuál de los dos sectores queda oculto.
- `gen_stretched_figure`: factor de estiramiento de la malla y dirección, para los ítems donde la figura crece y el ángulo no.

**Literacy soportada:** de `none` a `full_text`. El nodo entero se juega sin leer y por eso el mínimo es `none`: se gira con el dedo, se parte la pista con dos dedos, se prolonga un lado arrastrando, y `explain` es elegir entre animaciones. Los números aparecen desde el nivel 4 y son cifras, no palabras. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma el brazo, lo gira hasta la meta y suelta; la manivela chasquea y el sector queda pintado. La escena vuelve al inicio y el brazo late. Se repite solo si el jugador se queda quieto. La demostración de partir la pista es aparte y se hace una vez en el nivel 3: dos dedos abren la pista en cuatro ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
