# 39 — El ángulo es un giro (`geom.angle.turn_as_measure`)

> Locale `es`: "El ángulo es un giro". Minijuego: [La manivela y la vuelta](../../F-minijuegos/geom.angle.turn_as_measure.md).

**Nodo:** `geom.angle.turn_as_measure` · **Área:** geom · **Nivel:** 1 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundarias `construct` y `grid_stretch`) · **Literacy:** `none` · **Analogía:** `number_line_walk`

## 1. Concepto

Un ángulo es cuánto se giró, no cuán largos son los dos palitos que se dibujan. La vuelta entera se parte en 360 partes iguales y cada parte es un grado. Al terminar, el jugador gira una manivela hasta una meta y lee cuánto giró, sabe que media vuelta y dos cuartos de vuelta llegan al mismo lugar, y prolonga un lado de una figura para ver cuánto le falta al ángulo para completar el giro. Antes sabía avanzar por una pista numerada; no sabía que la pista se puede cerrar sobre sí misma.

## 2. Prerequisitos

- `found.count.number_line` (nodo 02): la pista numerada y el paso constante. Se usa entera: la posición sobre la pista, el orden de las marcas, la marca de arranque como cero y la idea de que cada paso vale lo mismo. Acá la pista se dobla hasta cerrarse en un círculo y el cero queda pegado al final.
- `arith.frac.parts_and_ratio` (nodo 08): partir un entero en partes iguales. Se usa para que "un cuarto de vuelta" signifique algo antes de que exista el 90, y para que la vuelta partida en 8 se pueda leer sin dividir 360 entre 8 a mano.

Ninguna de las dos aristas es la del orden escolar, donde el ángulo se define como la región entre dos semirrectas y se mide con transportador. [C0](../../C-knowledge-graph/C0-esquema.md) invierte la dependencia a propósito: primero el giro como cantidad que se acumula, después la figura estática. Quien aprende el ángulo como región dibujada mide con la regla los lados; quien lo aprende como giro no tiene dónde equivocarse porque los lados no participan.

## 3. Dificultad cognitiva real

Lo difícil no es leer un transportador. Son cuatro capacidades:

1. **El ángulo mide giro, no longitud.** Dos ángulos con lados de largo muy distinto pueden ser el mismo ángulo. Es lo contrario de todo lo que el jugador midió hasta acá, donde más largo era más.
2. **El grado es una unidad convenida, no un hecho.** La vuelta partida en 360 es una decisión. Hasta que el jugador parta la vuelta en 4, en 8 y en 360 con el mismo gesto, el 360 es un número mágico.
3. **Giros distintos que llegan al mismo lugar.** Media vuelta y dos cuartos de vuelta terminan igual; un giro de 370 termina donde uno de 10. La posición final no guarda cuánto se giró. Esto es lo que después sostiene el reloj y el círculo unitario.
4. **Lo que falta para cerrar la vuelta.** El ángulo exterior no está dibujado en ningún lado: aparece al prolongar un lado. Es la primera vez que el jugador traza una línea que no estaba para ver un dato que sí estaba.

Ninguna de las cuatro tiene misconception catalogada en el YAML todavía (sección 12).

## 4. Problema intuitivo

Un portón sobre un patio. Está cerrado, pegado a la pared. Alguien lo empuja y queda a medio abrir. La pregunta, por gesto: ¿cuánto se abrió?

En `real` el jugador empuja el portón con el dedo y lo ve barrer el suelo, dejando una marca de tierra que es el sector barrido. En `intuition` la escena se detiene con dos portones abiertos lo mismo, uno corto y uno largo. Tres desenlaces dibujados: el largo se abrió más porque su punta recorrió más; los dos se abrieron igual porque barrieron la misma porción del giro; el corto se abrió más. El jugador elige y después ve: los dos portones se superponen y coinciden.

## 5. Analogía del mundo real

`number_line_walk` (la del YAML), doblada en círculo ([G0](../../G-analogias/G0-reglas.md)).

Mapa: piedra del camino → número de la pista; posición del caminante → valor; un paso → incremento unidad; orden de las piedras → orden de los números; piedra de arranque → cero. Acá cada piedra es un grado, la pista tiene 360 y la última toca la primera. El caminante es la marca de la manivela.

Invariante que conserva: cada paso vale lo mismo y el orden no cambia. Es `same_step_every_turn`, el invariante de la mecánica de engranajes: la manivela avanza siempre a la misma velocidad de pista por vuelta, así que la cantidad de pista recorrida es una medida honesta del giro.

Ruptura: `position_between_stones`. El caminante no puede pararse entre dos piedras, y hay giros que caen entre grados. La analogía se retira en `visual`: apenas la pista deja de tener piedras visibles y se vuelve una franja continua, el giro puede caer en cualquier punto.

Por qué esta y no otra: la pista de piedras es la única analogía del catálogo donde la unidad de medida es una posición y no un objeto, y el ángulo es exactamente eso. Una analogía de porción de torta mediría el sector, que crece con el radio, y volvería a meter la longitud en el problema.

**Nota de coherencia.** `number_line_walk` declara `mechanic: slope_walker`, que no está entre las mecánicas de este nodo. Acá la analogía corre sobre `gears_sequence`: la pista es circular y el caminante es la marca de la manivela. El mapa objeto a concepto se conserva entero; lo que cambia es el gesto, de caminar a girar.

## 6. Mecánica de juego

Primera capa jugable: `real`, sin leer nada. `gears_sequence` es la principal; `construct` entra para prolongar lados y `grid_stretch` para mostrar que agrandar la figura no toca el ángulo ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `scrub`, `drag` y `tap`.

1. Una manivela en el centro, con un brazo y una marca en la punta. Alrededor, una pista circular con muescas y sin números.
2. El jugador arrastra el brazo. La marca recorre la pista y la pista se pinta detrás: el rastro es el ángulo. Hay una meta dibujada; al alcanzarla, la manivela chasquea y el rastro queda fijo.
3. Un segundo brazo más corto gira pegado al primero. Los dos rastros ocupan la misma porción de pista aunque las puntas recorran distinto. Se superponen con `tap`.
4. La pista se parte con `pinch` en 2, en 4, en 8 partes iguales, y las muescas se reacomodan. Un cuarto de vuelta llega a la meta sin ningún número.
5. Partida en 360, las muescas se vuelven finitas y aparecen los números de a diez. Girar hasta la meta muestra el 90.
6. Prolongar un lado: sobre una figura, el jugador arrastra desde un vértice siguiendo un lado y suelta más allá. La prolongación queda punteada y el sector entre ella y el otro lado se pinta; los dos juntos completan media vuelta.
7. Estirar la figura con `pinch`: los lados crecen, el sector pintado no cambia de tamaño.

Girar de más pasa el cero y sigue contando: no hay tope. Girar hacia atrás descuenta. Nada se llama error; cada movimiento deja su rastro.

## 7. Representación visual

Capa `visual`, primitiva `displace` dominante ([H](../../H-progresion-abstraccion.md)).

`displace`: la manivela se reduce a dos segmentos desde un punto y la pista a un arco. Lo que se desplaza es la marca; lo que se conserva es el largo del paso. El rastro pintado es la única cantidad que importa y se muestra siempre como sector, nunca como cuerda: la cuerda cambiaría con el largo del brazo.

`invariant` de apoyo, por `construct`: al prolongar un lado, el juego muestra la figura antes y después con el sector nuevo iluminado en el después y el original iluminado en los dos. El trazo revela, no cambia.

`deform` de apoyo, por `grid_stretch`: al estirar la figura sobre la cuadrícula de goma, la cuadrícula se deforma, los lados se alargan y el arco del sector se estira, pero la porción de vuelta que ocupa queda igual. Es la primera aparición de la idea que sostiene el nodo 40.

Todavía no hay grados escritos sobre los ángulos de una figura, ni el símbolo de grado, ni nombres: hay una pista con una porción pintada.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto. Siguen el desvanecimiento de la mecánica: manivela con pista, pista numerada, tarjeta de regla, notación.

1. **Manivela → pista sola.** Al alcanzar la meta por tercera vez en `visual`, el brazo se afina hasta ser un segmento y la manivela desaparece. Queda el vértice, los dos lados y el sector pintado.
2. **Muescas → números.** Al partir la pista en 360 con `pinch`, las muescas se numeran de a diez y el rastro muestra su valor mientras el dedo se mueve. El número vive sobre la pista, no sobre la figura.
3. **Número en la pista → ficha con grado.** Al soltar el brazo en la meta, el número se despega de la pista y cae junto al vértice como ficha, con un circulito arriba a la derecha. Ese circulito es el grado y viaja con el número desde acá.
4. **Sector → marca de ángulo.** Al tocar la ficha, el sector pintado se contrae en un arquito chico junto al vértice y la pista se desvanece. Queda la figura con `90°` al lado del arquito. Tocar el arquito devuelve la pista como fantasma.
5. **Dos sectores → suma escrita.** Al prolongar un lado, los dos arquitos quedan juntos y sus fichas se acercan hasta formar un renglón, `130° + 50° = 180°`, que aparece con un morph desde los dos sectores. La media vuelta ya estaba pintada; el renglón la escribe.

## 9. Notación matemática

Queda el símbolo de grado sobre el número, el arquito junto al vértice y el signo `∠` para nombrar un ángulo por sus tres puntos cuando hay más de uno en la figura.

El símbolo nuevo es **el grado**. Por la regla de oro de [H](../../H-progresion-abstraccion.md) llega con el problema que lo hace necesario, y ese problema aparece en el paso 3: cuando el número se despega de la pista, `90` queda solo y no dice de qué es. En este nodo el jugador viene de contar baldosas y de contar pasos; `90` podría ser cualquiera de las dos cosas. El circulito dice "de los 360 en los que partimos la vuelta". Sin él, `90` y `90` baldosas serían el mismo número, y en el nodo 43 los radianes convivirán con los grados en la misma pantalla.

El `∠` es una convención de escritura, no un símbolo con problema propio: aparece recién cuando una figura tiene tres ángulos y hay que decir cuál. Se introduce nombrando el vértice, sin la notación de tres letras, que llega con las construcciones del nodo 42.

## 10. Definición formal

Capa `formal`: tres frases cortas con voz, con la manivela fantasma al lado.

"Un ángulo es la cantidad de giro entre dos lados que salen del mismo punto." "La vuelta entera se parte en 360 partes iguales y cada parte es un grado." "El largo de los lados no cambia el ángulo."

Condiciones y casos especiales, verificados sobre el objeto: el ángulo recto es un cuarto de vuelta, 90; el ángulo llano es media vuelta, 180; la vuelta completa es 360 y deja la marca donde empezó. Un giro de 0 y uno de 360 terminan en el mismo lugar pero no son el mismo giro, y la pista lo muestra con dos rastros distintos. Girar hacia atrás resta. Sumar dos ángulos es girar uno después del otro.

Ya jugado: las tres frases enteras, en capa concreta. Nuevo: los nombres recto y llano, y la distinción entre giro acumulado y posición final.

## 11. Propiedades

- **Los ángulos se suman girando uno después del otro.** Ligada a soltar el brazo y volver a girarlo sin volver al cero: el rastro se alarga.
- **El ángulo no depende del largo de los lados.** Ligada a los dos brazos de distinto largo que pintan la misma porción de pista, y a estirar la figura con la cuadrícula de goma.
- **Media vuelta se completa entre un ángulo y su prolongación.** Ligada a prolongar un lado y ver los dos sectores juntos cerrando la mitad de la pista.
- **Giros que difieren en una vuelta entera terminan en el mismo lugar.** Ligada a pasar el cero girando y ver que la marca coincide con un rastro anterior. Es la propiedad que el nodo 43 convierte en periodicidad y que `disc.mod.clock_equivalence` convierte en congruencia.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias manivelas giradas distinta cantidad, con brazos de largos distintos. Tocar la que dio un cuarto de vuelta. Los distractores giran un octavo, tres octavos, y un cuarto pero con el brazo mucho más largo, que es el que separa giro de longitud.
- `explain`: el jugador arrastra el brazo y después elige entre animaciones sobre la misma pista: media vuelta de un tirón; dos cuartos de vuelta seguidos, que terminan en el mismo lugar; un cuarto de vuelta con un brazo el doble de largo, que pinta la misma porción. Toca las que muestran por qué media vuelta y dos cuartos coinciden.
- `manipulate`: girar la manivela hasta que la marca coincida con la meta y la pista numerada muestre 90. Después, prolongar un lado de una figura y ver cuánto falta para completar el giro.
- `apply`: con la pista de grados a la vista, girar exactamente 135, y después el ángulo que falta para cerrar la vuelta, sin ayuda de la marca de meta, contra el tiempo objetivo del nodo.
- `generalize`: una vuelta partida en 8 partes iguales. Decir cuánto vale cada parte girando la manivela una sola vez. Después, partirla en 5 y en 12, donde la respuesta ya no es redonda.
- `transfer`: en el reloj de `disc.mod.clock_equivalence`, mover la aguja de las 12 a las 4 y marcar en la pista de grados el giro que hizo.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)):

El YAML declara `misconceptions: []`. No es un olvido: los dos errores frecuentes del nodo todavía no tienen entrada porque no se pudo escribir su regla `detect` sobre una expresión. Mientras tanto se tratan así:

- **Medir el ángulo por el largo de los lados.** No hay entrada, así que no dispara patrón: el juego ejecuta el movimiento, superpone los dos brazos con `tap` y deja que coincidan. Voz: "Los dos giraron hasta acá. ¿Cuál giró más?". El evento se registra con el estado previo y el nodo, que es el mecanismo de minería de estados erróneos de L0; si el grupo crece, la entrada se escribe con su regla y su patrón.
- **Confundir el giro acumulado con la posición final.** Mismo tratamiento: los dos rastros quedan a la vista, uno corto y uno que dio la vuelta entera y siguió, y la voz pregunta cuál de los dos giró más.

Una misconception sí llega heredada de un prerequisito:

- **`fraction_add_across`** (patrón `missing_piece_tiles`, mecánica `tiles`). Aparece al partir la vuelta: el jugador junta un cuarto de vuelta con un octavo y responde con la fracción sumada de través. `tiles` no está entre las mecánicas de este nodo, así que se aplica el caso 2 de la regla de L0: el jugador ya conoce las baldosas desde el nodo 08, y la explicación corre ahí, presentada como un regreso. Las dos porciones de pista se enderezan en dos tiras de baldosas de distinto tamaño, se muestra la pieza que falta para igualar la unidad, y la voz pregunta: "Estos pedazos no son del mismo tamaño. ¿Cuántos octavos entran en un cuarto?". Al completar, las tiras se vuelven a curvar sobre la pista.

## 13. Generalización

La analogía se retira en `visual`, apenas la pista deja de tener piedras y se vuelve continua: ahí el giro puede caer entre dos grados y el caminante ya no tiene dónde pararse.

Variantes sin ayuda visual, en orden: ángulos que no son múltiplos de 45; el ángulo que falta para completar media vuelta y para completar la vuelta; giros mayores que una vuelta; giros hacia atrás; la vuelta partida en una cantidad de partes que no divide a 360, donde el grado deja de ser entero; y la misma figura dibujada más grande, para confirmar que el ángulo no se movió.

El nodo está en `abstract` cuando el jugador dice cuánto vale cada parte de una vuelta partida en cualquier cantidad, sin girar, y explica por qué un giro de 400 y uno de 40 terminan en el mismo lugar sin ser el mismo giro.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otras áreas y con otra mecánica:

- `trig.circle.unit_circle_radians`: la misma vuelta medida con el radio en vez de con las 360 partes. El grado se vuelve una unidad entre otras, y ahí se ve que era una convención.
- `disc.mod.clock_equivalence`: dos engranajes que marcan la misma hora. Los giros que difieren en una vuelta entera son la misma clase, que es la propiedad de la sección 11 dicha con otro nombre.
- `adv.cplx.multiplication_rotates_scales`: multiplicar por un número complejo gira y estira. El giro se suma y el estiramiento se multiplica, y el jugador reconoce la suma de ángulos que jugó con la manivela.

Concepto siguiente: `geom.angle.parallel_transversal`. Frase puente, narrada sobre la última figura con el lado prolongado: "Prolongaste un lado y apareció un ángulo que no estaba dibujado. ¿Y si prolongás una recta que cruza dos paralelas? ¿Cuántos ángulos aparecen, y cuántos distintos son de verdad?". La prolongación sigue de largo hasta cortar una segunda recta y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `gear_scene_turn_as_angle` es nativa, parametrizada por el giro objetivo y por si la pista muestra números: la manivela gira con un valor compartido, el sector se pinta detrás y el número de la pista cambia en sincronía; gramática `displace`. `construction_scene_extend_side_exterior_angle` también es nativa, parametrizada por los vértices de la figura y por cuál vértice se trabaja: el lado se prolonga punteado, el sector exterior se pinta y los dos sectores juntos se resaltan cerrando media vuelta; gramática `invariant`. Las dos son `text_free`; los números y los nombres los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). La primera genera las animaciones de `explain` variando el giro y el largo del brazo.

**Calculadora:** en `ready` se habilita `op_angle` ([M](../../M-calculadora/M0-progresion.md)), de nivel 1 y con caja de pruebas. Se presenta como una pista circular que se arrastra con el dedo: devuelve el giro en grados con el circulito puesto, y tiene dos atajos, la fracción de vuelta y el ángulo que falta para cerrar. No acepta un número escrito sin unidad; si el jugador tipea `90` a secas, la pista se pinta y espera que confirme. El mismo `op_angle` lo reusa `geom.angle.triangle_sum_half_turn`, que le agrega la suma de los tres.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Se gira con el dedo, se parte la pista con dos dedos, se prolonga un lado arrastrando, y `explain` es elegir entre animaciones. Los números aparecen recién con la pista partida en 360, y son cifras, no palabras. La instrucción es una mano fantasma que gira el brazo hasta la meta. Un adulto llega por diagnóstico salteando `real` e `intuition` y entra en la pista ya numerada; la partición en 2, 4 y 8 se le ofrece una sola vez como confirmación en vez de ser un nivel entero.
