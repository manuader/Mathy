# La pieza y el molde (`geom.trans.rotation_reflection`)

Minijuego del nodo 52 de la espina, "Deslizar, girar y reflejar". Mecánica principal `construct`, secundarias `grid_stretch` y `gears_sequence`; analogía `quarter_turn_dial`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/52-geom.trans.rotation_reflection.md): un concepto, cinco dificultades reales (creer que no cambió nada, separar el movimiento de su efecto, la reflexión que no se alcanza girando, el orden de dos movimientos, y la simetría como la misma idea al revés), una analogía que viste el giro y deja la reflexión afuera a propósito, un gesto (levantar una copia y apoyarla), cinco pasos de desvanecimiento, el contorno idéntico antes y después como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un disco que gira sobre un eje, con la pieza montada encima y una aguja que dice hacia dónde mira. Alrededor, el taller del nodo 51: el piso, la pieza y un molde con su forma exacta, en otro lugar y mirando para otro lado.

Mapa objeto a concepto: aguja del disco → hacia dónde mira la figura; un cuarto de vuelta → el cuarto de vuelta de la figura entera; dos cuartos → la figura patas para arriba; largo de la aguja → el tamaño, que no cambia nunca y que es lo que quiere decir rígido; ángulo de la aguja → cuánto se giró; molde cerrado → la figura llegó a destino sin que nada le cambiara.

El disco aporta el giro y su medida, heredada del nodo 39. La malla de goma aporta la comprobación de que nada se deformó: gira con la figura y ningún cuadradito cambia de tamaño. El gesto de `construct` aporta lo que el disco no puede: levantar la copia y apoyarla del otro lado. Punto de ruptura, y es el corazón del nodo: **el disco solo gira**. No hay ningún gesto del disco que produzca una reflexión, y en cuanto hay que sacar la cara del eje, el disco dejó de ser un disco. Se retira en `symbolic`, cuando la ficha de giro ya lleva su fracción o sus grados ([G0](../G-analogias/G0-reglas.md)).

`quarter_turn_dial` declara `mechanic: grid_stretch`, que este nodo lista como secundaria y no como principal. Es el mismo caso del nodo 42, cuya analogía corre sobre `tiles` mientras la mecánica principal es `construct`: la analogía viste una capacidad y la mecánica sostiene el gesto.

## Mecánica central

Superficie: la pieza y el molde sobre el piso, la malla de goma debajo desde la capa `visual`, el disco con su manivela pegado al centro de la copia, la fila de fichas al costado. Gestos: `drag`, `tap`, `hold` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Toque sostenido sobre la pieza.** Levanta una copia que sigue al dedo. La original queda encendida en su lugar y no se mueve nunca: la figura no se mueve, se mueve una copia.
- **Arrastrar la copia.** La desliza. La flecha del desplazamiento queda dibujada desde una esquina hasta su destino.
- **Girar el disco o arrastrar la manivela.** La copia gira con él y la fracción de vuelta se muestra mientras el dedo se mueve, como en el nodo 39.
- **Trazar una línea y tocar dos veces.** La línea queda punteada y la copia se voltea alrededor de ella. Sin línea trazada, el toque doble no hace nada: el eje es un dato del movimiento, no un detalle.
- **Soltar la copia sobre el molde.** Si cae esquina sobre esquina, el molde se cierra con un chasquido y la copia se funde. Si cae casi bien, no chasquea: las esquinas que no coinciden reciben halo y la copia se queda donde está, que sigue siendo un estado válido.
- **Girar y girar una pieza que solo entra dada vuelta.** Nunca chasquea. La superficie superpone el contorno de la copia y el del molde con la esquina de color en cada uno, y se ve que uno es el reflejo del otro.
- **Estirar con dos dedos.** La malla se estira, los cuadraditos se vuelven rectángulos y las marcas de ángulo dejan de coincidir. Es lo que el movimiento rígido no hace.
- **Arrastrar una ficha sobre la otra.** Intercambia los dos movimientos de la cadena, y la copia vuelve a caer en otro lugar.
- **Modo simetría.** El molde es la figura misma. Cada movimiento que devuelve la copia sobre la original queda registrado como marca: una línea punteada por doblez, un rosetón en el centro con la fracción por giro.

En `symbolic` la superficie cambia de forma, no de reglas: cada gesto deja su ficha, las fichas se leen en fila de izquierda a derecha, y el disco se pide con un toque y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`construction_reveals_not_changes` (la construcción): la figura original no se toca. Se ve confirmarse en que la original queda encendida y quieta mientras la copia viaja, y en que la copia cae esquina sobre esquina. Se ve romperse cuando el jugador estira con `pinch`: ahí sí cambió algo, y el molde deja de aceptar la copia.

`lines_stay_lines_origin_fixed` (la malla de goma), en su mitad rígida: las rectas siguen rectas y además las longitudes no cambian. Se ve en los cuadraditos que giran enteros sin cambiar de tamaño, y se ve romperse en el estiramiento, que conserva las rectas y no las longitudes. El contraste entre los dos es lo que define rígido sin definirlo.

Un movimiento válido pero inútil, como deslizar la copia dando un rodeo o girar una vuelta entera de más antes de apoyarla, no rompe ningún invariante: el molde chasquea igual. Empujón suave, sin explicación.

## Representación visual

Primitiva dominante `invariant`, de apoyo `deform` y `displace` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el taller, la pieza dada vuelta al lado de su molde. Se empuja y se predice.
- `concrete`: pieza con textura, molde, disco con aguja y manivela. Nada escrito.
- `visual`: la pieza queda en contorno con puntos en las esquinas y una de ellas en color; debajo, la malla de goma. En el antes y el después el contorno queda iluminado idéntico, con todas sus marcas intactas, y lo único distinto es dónde está y de qué lado quedó. El orden en que aparecen las esquinas al recorrer el borde, como en el nodo 51, es el mismo cuando la figura gira y se da vuelta cuando se refleja.
- `symbolic`: fichas de movimiento en fila, con la fracción o los grados en la flecha curva; en modo simetría, ejes punteados y rosetón sobre la figura.
- `formal`: las tres frases con voz y la figura al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Piedra → contorno con vértices marcados: al primer chasquido en `visual`, la pieza pierde la textura y quedan el contorno, los puntos de las esquinas y una esquina en color.
2. Gesto → ficha de movimiento: al chasquear, el gesto deja una ficha al costado, con la forma del gesto: flecha recta para deslizar, flecha curva para girar, línea con dos medias puntas para reflejar.
3. Ficha de giro → ficha con grados: la flecha curva muestra la fracción de vuelta y al tocarla se convierte en el número de grados con su circulito, el mismo que nació en el nodo 39.
4. Fichas en fila → cadena de movimientos: dos fichas quedan una al lado de la otra en el orden en que se hicieron; arrastrar una sobre la otra las intercambia y la figura cae en otro lugar.
5. Eje y centro → marcas de simetría: en modo simetría las fichas se meten en la figura, cada doblez como línea punteada y los giros como un rosetón en el centro con la fracción.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la figura: un movimiento rígido lleva una figura a otro lugar sin cambiar ninguna de sus longitudes ni ninguno de sus ángulos; deslizar, girar y reflejar alcanzan para armar cualquier movimiento rígido, y una cadena de movimientos rígidos siempre se puede hacer con un movimiento rígido; una simetría de una figura es un movimiento rígido que la deja donde estaba. Casos: la vuelta entera no mueve nada y es simetría de cualquier figura, la primera vez que no hacer nada cuenta como algo; una figura puede no tener ningún doblez; reflejar dos veces sobre la misma línea devuelve la figura tal cual; reflejar sobre dos líneas que se cruzan da un giro del doble del ángulo entre ellas; reflejar y después deslizar a lo largo del mismo eje no es ninguno de los tres por separado y se lo nombra como lo que es; el círculo tiene infinitos dobleces y vuelve sobre sí mismo con cualquier giro. Propiedades: los movimientos conservan longitudes y ángulos, girar no cambia el orden de las esquinas marcadas y reflejar siempre lo da vuelta, el orden de dos movimientos cambia dónde cae la figura, y una figura de lados todos iguales vuelve sobre sí misma con un giro de una parte de vuelta por cada lado y se dobla por tantas líneas como lados. Símbolo nuevo: el eje de simetría dibujado sobre la figura, necesario en cuanto la figura tiene seis dobleces y recordar cuál lleva esta esquina hasta aquella deja de funcionar.

## Generalización

El disco se retira en `symbolic`, cuando la ficha de giro lleva su fracción o sus grados y el jugador la lee sin mirarlo. Vuelve a demanda, atenuado, hasta `formal`.

Variantes sin ayuda visual: piezas que solo entran dadas vuelta, donde hay que elegir el eje; cadenas de dos y de tres movimientos; el conteo de simetrías sobre figuras nunca vistas; figuras sin ninguna simetría salvo la vuelta entera; y el círculo, donde el conteo del nodo 51 falla y las simetrías son infinitas. Cuando el jugador, con solo la cantidad de lados iguales, dice cuántos dobleces tiene la figura y qué giro la devuelve a sí misma, y explica por qué ninguna cantidad de giro deshace una reflexión, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **La pieza en el molde.** `real` y `concrete`, `manipulate`. Solo deslizar y girar, y piezas que entran de varias maneras. Sin reflexión.
2. **La que no entra girando.** `concrete`, `recognize` y `manipulate`. Parámetros: entran las piezas que solo entran dadas vuelta, y con ellas el gesto de trazar el eje y voltear.
3. **Copia y contorno.** `visual`, `explain` y `manipulate`. La pieza queda en contorno con la esquina de color, aparece la malla de goma debajo y la original queda encendida mientras viaja la copia.
4. **Fichas de movimiento.** `symbolic` primera mitad, `manipulate` y `apply`. Cada gesto deja su ficha, y la flecha curva muestra la fracción y después los grados.
5. **Dos movimientos.** `symbolic`, `apply`. Parámetros: cadenas de dos y de tres movimientos, y el intercambio de fichas. Aparece `matrix_multiplication_commutes`.
6. **El molde es la figura.** `symbolic` segunda mitad, `apply` y `generalize`. Parámetro: el molde deja de estar en otro lugar y pasa a ser la figura misma. Aparecen los ejes punteados y el rosetón.
7. **Figuras que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; contar dobleces y giros sin mover nada, incluidos el molinete sin dobleces, el trapecio isósceles sin giros y el círculo.

Qué endurece cada parámetro: las piezas que solo entran dadas vuelta separan la reflexión del giro, que es la dificultad central; las cadenas de dos y tres obligan a llevar la cuenta del orden; el intercambio de fichas convierte la misconception en un gesto que el jugador puede hacer a propósito; el molde que es la figura misma invierte la pregunta y es lo que convierte el nodo en simetría; las figuras sin simetría obligan a aceptar que la respuesta puede ser "solo la vuelta entera".

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo requiere `ch.geom.symmetries_reveal_the_shape`, donde la figura está tapada y solo se puede preguntar si un movimiento la deja igual, y de las respuestas hay que deducir qué figura es; `ch.geom.two_folds_make_a_turn`, donde una pieza se voltea sobre dos líneas que se cruzan y hay que encontrar el único giro que hace lo mismo, con el ángulo entre las líneas como dato oculto; y `ch.geom.reflect_shortest_path_river`, que ya estaba en el catálogo y donde reflejar un punto convierte un camino quebrado en uno derecho.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro piezas al lado de un molde. Tocar la que entra girando, sin darla vuelta. Los distractores son la pieza reflejada, una del mismo aspecto con un lado más y una de la misma forma pero más grande.
- `explain`: cuatro animaciones sobre la misma pieza y el mismo molde: gira un cuarto y chasquea; gira un cuarto más una vuelta entera y chasquea en el mismo lugar; gira y gira y nunca chasquea, y al voltearla una vez entra; y una que la aprieta hasta que entra. Tocar las que muestran por qué girar no alcanzaba. El distractor elegido clasifica: la apretada es el estiramiento que rompe el invariante, y la cadena intercambiada es `matrix_multiplication_commutes`.
- `manipulate`: llevar una pieza que solo entra dada vuelta hasta su molde, eligiendo el jugador por qué línea la voltea.
- `apply`: cuatro piezas y cuatro moldes seguidos, contra el tiempo objetivo del nodo. Una entra deslizando, una girando, una hay que voltearla y una necesita voltearla y después deslizarla.
- `generalize`: modo simetría sobre un pentágono regular, un molinete de cuatro aspas, un trapecio isósceles y un triángulo de tres lados distintos. Decir cuántos dobleces y qué giro tiene cada uno, sin mover nada.
- `transfer`: en el plano de `adv.cplx.multiplication_rotates_scales`, multiplicar por un número que solo gira y reconocer que dos cuartos de vuelta son media vuelta. También en `disc.mod.clock_equivalence` y en `linalg.map.linear_transformation_2d`.

Misconceptions ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `matrix_multiplication_commutes`, patrón `two_paths_diverge` sobre `grid_stretch`: el estado inicial se parte en dos, las dos cadenas corren sobre dos copias de la misma malla, una al lado de la otra, y quedan quietas en los dos lugares distintos donde terminaron. Voz: "Las dos hicieron lo mismo en distinto orden. ¿Por qué no cayeron en el mismo lugar?". El patrón no reabre la interacción: el ítem se reinicia desde el estado original, porque lo que estaba mal no era el estado sino la expectativa. Es la de mayor alcance del nodo, porque vuelve con nombre propio en álgebra lineal.

Dos errores más no tienen entrada todavía, porque su regla `detect` no se pudo escribir sobre una expresión, y se tratan con el mecanismo de minería de estados erróneos de L0. Creer que girando lo suficiente se llega al reflejo: el juego deja girar todo lo que el jugador quiera y superpone los dos contornos con la esquina de color en cada uno; voz: "Las dos esquinas de color están al revés una de la otra. ¿Qué le falta a esta pieza?". Creer que una copia más grande sigue siendo la misma figura: el juego apoya la copia estirada sobre el molde y deja ver que un lado sobra y otro falta; voz: "Entra por un lado y sobra por el otro. ¿Qué le cambiaste?".

Los distractores de `explain` y las opciones de `apply` salen de la regla `detect` de la misconception declarada, de las de los prerequisitos y de esos dos grupos ya minados.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `construction_scene_lift_copy_and_land_it`, nativa, parametrizada por la figura, por el molde y por si la instancia admite reflejar. La original queda iluminada y quieta, la copia se levanta, gira o se voltea sobre el eje trazado y se apoya, y las esquinas que no coinciden reciben halo; gramática `invariant`, con el contorno idéntico en el antes y el después. Renderizada sobre el estado del jugador, produce también las animaciones de `explain` y es la imagen de cheatsheet de `cs.geom.strategy_move_a_copy_to_compare`.
- `grid_scene_turn_and_flip_the_sheet`, nativa, parametrizada por el giro, por el eje y por si las dos cadenas corren intercambiadas. La malla de goma gira y se voltea con la figura sin que ningún cuadradito cambie de tamaño, y en el modo de dos caminos corre las dos cadenas una al lado de la otra hasta dejarlas en lugares distintos; gramática `deform`. Es la escena del patrón `two_paths_diverge` del nodo y la imagen de cheatsheet de `cs.geom.two_flips_make_a_turn`.
- Reusada: `construction_scene_walk_the_boundary` (nodo 51), para mostrar el orden de las esquinas marcadas dándose vuelta cuando la figura se refleja.
- Todas son `text_free`: los grados y las fracciones los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_piece_and_mould`: `sides` (cantidad de lados de la pieza); `chiral` (si la pieza solo entra dada vuelta, desde el nivel 2); `move_kinds` en {deslizar, girar, reflejar, reflejar y deslizar}; `turn_fraction` (fracción de vuelta hasta el nivel 3, grados desde el 4); `distance` (cuánto hay que deslizar); `seed`.
- `gen_move_chain`: `length` (uno hasta el nivel 4, dos y tres desde el 5); `kinds` (qué movimientos entran en la cadena); `swap_offered` (habilita el intercambio de fichas); `seed`.
- `gen_symmetry_figure`: `family` en {regular, molinete, isósceles, escaleno, círculo}; `sides`; `mirrors` (cuántos dobleces tiene, derivado de la familia); `rotation_order` (cuántos giros distintos la devuelven a sí misma); `seed`. Alimenta el nivel 6, el 7 y los ítems de `generalize`.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer, pero desde el nivel 4 la ficha de giro lleva la fracción y después el número con el circulito de grado, y por eso el mínimo es `icons`. Las fichas son formas de gesto, no palabras, y `explain` es elegir entre animaciones. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma hace un toque sostenido sobre la pieza, levanta la copia, la gira hasta el molde y la suelta; el molde chasquea. La escena vuelve al inicio y la pieza late. Una segunda demostración, reservada para la primera pieza que no entra girando, traza la línea con el dedo y toca dos veces; la copia se voltea y entra. Se repiten solo si el jugador se queda quieto. La demostración de la manivela no se repite: es la del nodo 39 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
