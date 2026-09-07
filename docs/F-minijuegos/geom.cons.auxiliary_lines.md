# La línea que falta (`geom.cons.auxiliary_lines`)

Minijuego del nodo 42 de la espina, "Trazar la línea que falta". Mecánica principal `construct`, secundaria `tiles`; analogía `tile_floor`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/42-geom.cons.auxiliary_lines.md): un concepto, cuatro dificultades reales (creer que la construcción no cambia la figura, elegir entre líneas todas válidas, trabajar hacia atrás desde lo que se pide, no confundir el lado inclinado con la altura), una analogía, un gesto (trazar sobre una figura que no se puede mover), cinco pasos de desvanecimiento, la figura con el contorno conservado como visualización dominante, retiro del piso en `symbolic`. Acá se fija cómo se juega. Es el minijuego que abre el nivel de desafío de [S](../S-desafios/S0-desafios.md).

## Analogía

Un piso de baldosas y un cuarto con forma rara. Las juntas entre baldosas ya están; prolongar una con tiza no mueve ninguna baldosa y sin embargo parte el cuarto en pedazos que se saben contar.

Mapa objeto → concepto: una fila de baldosas → un factor; una columna → el otro; una baldosa suelta → la unidad; el piso entero → el área; girar el piso → la conmutatividad; un piso al que le faltan columnas → la división; partir el piso en tiras → los productos parciales; la junta prolongada con tiza → la línea auxiliar; la parte tapada por un mueble → el dato oculto.

Punto de ruptura: `non_integer_sides`. Un lado de siete baldosas y media deja de ser cuadrícula, y una hipotenusa irracional no se cuenta con baldosas. Por eso el piso se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la figura ocupa el centro y no se puede mover. Los vértices no se arrastran, los lados no se estiran, las medidas visibles no se editan. Al costado, la caja de baldosas; abajo, el panel de cheatsheet que se abre con un toque. Gestos: `drag`, `tap` y `hold` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar de un punto a otro.** Traza un segmento entre dos puntos que ya existen. Queda punteado y con menos peso que los lados de la figura.
- **Arrastrar de un vértice hacia un lado.** Baja una perpendicular. Aparecen el pie sobre el lado y el cuadradito del ángulo recto.
- **Toque sostenido sobre un lado.** Lo prolonga más allá del vértice, con la prolongación en trazo más fino.
- **Toque sostenido sobre una parte de la figura.** Levanta una copia que se puede girar o reflejar y apoyar sobre otra parte.
- **Tocar dos segmentos, o dos ángulos, seguidos.** Los marca como iguales, con ticks o con arcos. El motor valida la marca contra la figura y contra sus hechos derivados.
- **Tocar una línea auxiliar.** La borra. Los datos que dio se quedan en la figura y parpadean una vez. Es la comprobación del invariante y es un gesto, no un cartel.
- **Arrastrar baldosas sobre un triángulo rectángulo descubierto.** Cobra el dato: el lado que falta sale de reordenar baldosas, como en el nodo 41.

Cada trazo dispara las reglas de derivación del motor sintético ([O](../O-arquitectura-tecnica.md)) y agrega hechos que se ven como marcas, nunca como texto. En `symbolic` la superficie no cambia de reglas: los hechos se despegan al costado como renglones, y tocar un renglón enciende la parte de la figura que lo justifica.

## Invariante matemático

`construction_reveals_not_changes`. La construcción agrega objetos y no toca ninguna medida de la figura original. Nada de lo que el jugador haga puede mover un vértice, y esa imposibilidad es el mensaje: si la figura no cambió, el dato que apareció ya estaba.

Se ve confirmarse cuando el jugador borra la línea y la altura descubierta sigue anotada. Se ve romperse de la única manera en que puede romperse, que no es trazando sino **afirmando**: una marca de igualdad que la figura no sostiene. Ahí el objeto deja de ser válido y el juego responde (sección Mastery).

De apoyo, el invariante de `tiles`, `area_preserved_under_rearrangement`: las baldosas que cobran el dato no aparecen ni desaparecen al reacomodarse.

Una línea válida que no revela nada no rompe ningún invariante. Es un rodeo, y [F0](F0-principios.md) fija la respuesta: la figura la conserva atenuada y el vértice desde el que sí conviene trazar late una vez. No cuenta como evidencia negativa y alimenta la minería de estrategias de [S](../S-desafios/S0-desafios.md).

## Representación visual

Primitiva dominante `invariant`, de apoyo `scale` cuando entran las baldosas ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el cuarto en forma de L con el mueble que tapa una pared. Solo se mira y se predice entre tres desenlaces.
- `concrete`: la figura como hoja de papel sobre una grilla de baldosas. Se dobla, se despliega, se traza con el dedo.
- `visual`: la grilla se atenúa y queda la figura con sus marcas. En el antes y el después de cada construcción, el contorno original se ilumina idéntico y lo único distinto es lo agregado.
- `symbolic`: la figura pierde la grilla, gana letras en los vértices, y al costado crece la cadena de igualdades.
- `formal`: la figura se atenúa y quedan los renglones ordenados, cada uno citando al anterior.

Las marcas tienen forma y no palabras: cuadradito para el recto, ticks para segmentos iguales, arcos para ángulos iguales. Las líneas auxiliares son siempre punteadas, para que nunca se confundan con la figura.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre la misma figura con ids estables:

1. `fold_paper`: la figura es una hoja; el jugador la dobla con dos dedos y al desplegarla queda el pliegue marcado. Es la primera línea auxiliar y nadie la nombra.
2. `draw_line_on_figure`: al primer trazo con el dedo sobre una figura que no se dobla, el pliegue se vuelve línea punteada y aparecen las marcas.
3. `name_relation`: al tocar una marca, se dice con voz y queda una etiqueta corta unida a ella por un hilo (altura, mismo ángulo, mitad).
4. `symbolic_chain`: al cobrar el primer dato con baldosas, las etiquetas se despegan y se ordenan en renglones al costado, con la figura al lado.
5. `proof_sketch`: la figura se atenúa y quedan los renglones, cada uno citando el anterior; tocar uno vuelve a encender la parte de la figura de la que salió.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la figura atenuada: una construcción auxiliar agrega puntos, segmentos o copias definidos a partir de los que ya están; no cambia ninguna medida de la figura original; sirve cuando el objeto nuevo tiene una propiedad conocida que relaciona un dato que falta con datos que están. Condiciones: todo trazo se define por objetos existentes, y toda marca de igualdad vale solo si está derivada, aunque el dibujo la sugiera. Propiedades que quedan en la cheatsheet como estrategias: bajar una altura crea un triángulo rectángulo (`cs.geom.strategy_draw_altitude`); una diagonal parte un cuadrilátero en dos triángulos (`cs.geom.strategy_draw_diagonal`); prolongar un lado completa una figura conocida o produce semejanza (`cs.geom.strategy_extend_side`); marcar partes iguales transporta una medida de un lado a otro (`cs.geom.strategy_mark_equal_parts`). El símbolo nuevo del nodo es la marca de relación en la figura: el arco del ángulo igual, los ticks y el cuadradito. Lo hizo necesario tener tres construcciones encadenadas y no poder recordar por qué dos ángulos eran iguales.

## Generalización

El piso de baldosas se retira en `symbolic`, cuando la figura pierde la grilla y los lados dejan de ser cantidades enteras de baldosas. La cuadrícula vuelve a demanda, atenuada, hasta `formal`.

Variantes sin ayuda visual: la altura cae dentro de la figura; la altura cae fuera y hay que prolongar la base; el dato sale de una diagonal; el dato sale de prolongar dos lados hasta que se cortan; el dato sale de reflejar una copia. Después, figuras nunca vistas donde el jugador tiene que decir en una frase por qué eligió esa línea, y figuras donde ninguna línea interior alcanza. Cuando elige y justifica sin pedir la cheatsheet, la analogía se eliminó y el nodo está en `abstract`.

## Desafío

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Doblar la hoja.** `concrete`, `manipulate`. Figuras simétricas de papel; el único gesto es doblar. Sin medidas escritas.
2. **La primera línea.** `concrete`, `recognize` y `manipulate`. Figura fija sobre la grilla de baldosas, una sola construcción posible, solo alturas. Rango de medidas chico y entero.
3. **Borrar la línea.** `concrete`, `explain`. Misma dificultad; el nivel entero gira alrededor del invariante: trazar, cobrar, borrar y comprobar.
4. **Marcas con nombre.** `visual`, `manipulate` y `apply`. La grilla se atenúa; aparecen ticks y arcos y el nombre corto por voz. El dato se cobra con baldosas sobre el triángulo rectángulo.
5. **La cadena.** `symbolic`, `apply`. Sin grilla, con letras en los vértices y renglones al costado. Aparece `area_uses_slant_side`.
6. **Dos líneas.** Parámetros: dos construcciones encadenadas y figuras compuestas de tres piezas. Aparece `strategy_missing_auxiliary_line`.
7. **Afuera de la figura.** Parámetros: la altura cae fuera del lado, hay que prolongar, o hay que reflejar una copia. El repertorio de gestos se usa entero.
8. **Justificar.** `formal` y `abstract`, `generalize`. Figuras nunca vistas, `proof_sketch`, y una figura por sesión donde ninguna línea interior alcanza.

Qué endurece cada parámetro: la cantidad de construcciones encadenadas obliga a planificar en lugar de reaccionar; las figuras de tres piezas hacen que haya más líneas válidas que útiles; la altura que cae afuera rompe la idea de que la línea auxiliar siempre está adentro; las medidas grandes impiden reconocer la cuenta de memoria y fuerzan a leer la estructura.

**Cómo prepara para los desafíos.** Este es el minijuego que hace jugables los problemas de olimpíada, y la preparación es literal: la pantalla de desafío de [S0](../S-desafios/S0-desafios.md) usa los mismos cinco gestos de `construct` en lugar del teclado de fichas, la misma validación por movimiento y las mismas marcas. Las diferencias son tres, y las tres se anticipan en los niveles 6 a 8. En el desafío nadie dice qué falta, y por eso el nivel 6 deja de marcar el dato pedido. En el desafío hay más de un camino, y por eso el nivel 7 acepta varias construcciones distintas para la misma figura. En el desafío la cheatsheet está abierta desde el inicio, y por eso las cuatro estrategias del nodo entran en la cheatsheet en la capa `symbolic`, antes de que se necesiten ([R0](../R-cheatsheet/R0-cheatsheet.md)).

Los desafíos que requieren este nodo en `ready` son `ch.geom.trapezoid_hidden_height` (el ejemplo canónico de S0, entrenamiento), `ch.geom.l_shape_missing_side` (entrenamiento), `ch.geom.chord_distance_from_center` y `ch.geom.parallel_cut_missing_length` (regional), `ch.geom.frustum_volume_by_extension` (internacional) y `ch.trig.tower_from_two_angles` (entrenamiento, en trigonometría). Los desafíos de baldosas con datos ocultos (`ch.geom.tiles_hidden_corner`, `ch.geom.tiles_l_shape_split`) son la misma idea sin lectura y no requieren este nodo: se juegan mucho antes, con `geom.area.rect_and_triangle`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: un trapecio con un lado inclinado y cuatro vértices que laten. Tocar aquel desde el que conviene bajar la altura.
- `explain`: el jugador traza, cobra y borra; después elige entre tres animaciones cuál muestra por qué el dato sigue valiendo sin la línea. Un distractor mueve un vértice al borrar; otro deja la figura igual pero borra también el dato.
- `manipulate`: trapecio con bases 9 y 14 y lado 13. Bajar la altura desde el vértice superior derecho, marcar el triángulo rectángulo y cobrar la altura con baldosas.
- `apply`: una figura en L y otra con un triángulo pegado a un rectángulo, una sola línea cada una, y el área armada con fichas contra el tiempo objetivo del nodo.
- `generalize`: una figura donde bajar la altura no alcanza; hay que prolongar un lado o trazar la diagonal. Y una figura donde ninguna línea interior sirve.
- `transfer`: en un triángulo cualquiera, bajar una altura y usar los dos triángulos rectángulos que aparecen para relacionar dos lados con los senos de sus ángulos, que es `trig.law.sines_from_altitude`. También en `calc1.deriv.tangent_line`, `disc.proof.chain_of_constructions` y `linalg.orth.projection_as_shadow`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `area_uses_slant_side`, patrón `missing_piece_tiles` sobre `tiles`, que el nodo declara: las baldosas que el jugador contó se apoyan sobre la figura, se superpone la figura verdadera y se ve el pedazo que sobra afuera y el que falta adentro. Voz: "Con ese lado, las baldosas se salen de la figura. ¿Cuál es la que llega derecho hasta arriba?". Es la de mayor severidad del nodo y sobrevive a la construcción correcta.
- `strategy_missing_auxiliary_line`, `assumed_right_angle` y `assumed_equal_segments`, las tres de estrategia de [S0](../S-desafios/S0-desafios.md), con patrón `replay_on_mechanic` sobre `construct`. La primera atenúa todo lo que no está justificado. La segunda apoya la esquina de una baldosa cuadrada en el vértice y deja ver la brecha. La tercera levanta una copia de un segmento, la apoya sobre el otro y muestra lo que sobra. Las tres devuelven el control desde el estado real, que sigue siendo una figura válida.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de estas y de las de los prerequisitos directos, sobre todo las del nodo 41.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `construction_scene_composite_figure_altitude`, nativa. La figura del jugador, la altura que baja, el cuadradito que aparece y la llave que marca el segmento nuevo; gramática `invariant`, con el contorno iluminado igual antes y después. Parametrizada por figura, lado desconocido y vértice de partida, produce también las animaciones de `explain`.
- `construction_scene_choose_the_line`, nativa. Tres o cuatro candidatas sobre la misma figura, una que revela y las otras que no, con la útil marcada al final. Abre los niveles 6 y 7 y es la imagen de cheatsheet de las cuatro estrategias.
- Reusadas: las escenas de baldosas del nodo 41 para el cobro, y `construction_scene_extend_side_exterior_angle` (nodo 39) como recordatorio en el nivel 7.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_composite_figure`: `shape` en {trapezoid, l_shape, triangle_on_rectangle, quadrilateral_with_two_right_angles, frustum_section}; `piece_count` (2 en los niveles 2 a 5, 3 desde el 6); `side_range` (enteros de 3 a 15 hasta el nivel 5, hasta 40 después); `triples` para las ternas pitagóricas disponibles; `hidden_side`; `altitude_falls` en {inside, outside}; `seed`.
- `gen_candidate_lines`: `count` (3 a 5 candidatas); `useful` (cuántas revelan un dato, 1 hasta el nivel 6 y 2 después); distractores desde `detect` (la diagonal que no parte nada, la paralela que no toca lo que falta, la altura desde el vértice equivocado).
- `gen_marked_figure`: figuras con marcas ya puestas, algunas derivadas y una falsa por instancia, para el trabajo de justificar del nivel 8.

**Literacy soportada:** de `short_text` a `full_text`. La capa concreta se juega sin leer (trazar es un gesto y las marcas son formas), pero dos de las cuatro entradas de cheatsheet del nodo son estrategias escritas y el nivel 8 pide justificar, así que el mínimo es `short_text`. La versión sin lectura de esta misma idea son los desafíos de baldosas con datos ocultos de [S0](../S-desafios/S0-desafios.md), que se juegan mucho antes.

**Instrucción por demostración:** la primera vez, una mano fantasma dobla la hoja por la mitad y la despliega; el pliegue queda. En el nivel 2, la mano toma un vértice, arrastra hasta el lado de enfrente y suelta; la altura queda punteada y el cuadradito aparece. La demostración de borrar la línea se hace una sola vez, al inicio del nivel 3, y no se repite ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
