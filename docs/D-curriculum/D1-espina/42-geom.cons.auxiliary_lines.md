# 42 — Líneas auxiliares (`geom.cons.auxiliary_lines`)

> Locale `es`: "Trazar la línea que falta". Minijuego: [La línea que falta](../../F-minijuegos/geom.cons.auxiliary_lines.md).

**Nodo:** `geom.cons.auxiliary_lines` · **Área:** geom · **Nivel:** 3 · **Primitiva:** `invariant` · **Mecánica principal:** `construct` (secundaria `tiles`) · **Literacy:** `short_text` · **Analogía:** `tile_floor`

## 1. Concepto

Una línea auxiliar es un trazo que se agrega a una figura ya dibujada y que no cambia ninguna de sus medidas: solo hace visible una relación que ya estaba. Al terminar, el jugador mira una figura a la que le falta un dato, elige qué línea trazar sin que nadie se lo sugiera, y cobra el dato con lo que ya sabe. Antes sabía aplicar Pitágoras cuando le mostraban el triángulo rectángulo; ahora lo fabrica.

## 2. Prerequisitos

- `geom.tri.pythagoras_as_tiles` (nodo 41): el triángulo rectángulo como la máquina que da la tercera longitud a partir de dos. Se usa entero, con sus baldosas: la línea auxiliar del nodo 42 casi siempre termina en un triángulo rectángulo, y `tiles` es la mecánica con la que se cobra. De ahí viene también `area_uses_slant_side`.
- `geom.sim.similarity_as_scale` (nodo 40): dos figuras con la misma forma y distinto tamaño, y la razón entre lados correspondientes. Se usa cuando la línea no es una altura sino una paralela o la prolongación de dos lados hasta que se cortan.
- `geom.angle.turn_as_measure` (nodo 39): el ángulo como giro. Se usan el ángulo recto como cuarto de giro, la marca del cuadradito, y el ángulo exterior que aparece al prolongar un lado.

Ninguna de las tres aristas sigue el orden escolar. La escuela no tiene un tema llamado "líneas auxiliares": trata cada construcción como un truco del problema en el que aparece, y el alumno la aprende de memoria por figura. [C0](../../C-knowledge-graph/C0-esquema.md) la separa como nodo propio porque la capacidad que se entrena (elegir qué trazar cuando falta un dato) es independiente de qué teorema se cobre después, y porque sin ella no hay desafíos de olimpíada ([S0](../../S-desafios/S0-desafios.md)).

## 3. Dificultad cognitiva real

Lo difícil no es trazar la línea sino cuatro cosas que ninguna fórmula enseña:

1. **Creer que la construcción no cambia la figura.** Muchos jugadores sospechan que trazar una altura "inventa" un dato. El invariante `construction_reveals_not_changes` se comprueba de una sola forma: borrar la línea y ver que lo descubierto sigue valiendo.
2. **Elegir entre líneas todas válidas.** Sobre un trapecio hay infinitas líneas correctas y solo unas pocas útiles. El criterio no es estético: sirve la línea que crea un objeto del que ya se sabe algo (un triángulo rectángulo, un rectángulo, dos figuras semejantes).
3. **Trabajar hacia atrás desde lo que se pide.** La fórmula del área pide la altura; la altura no está; entonces la línea a trazar es la altura. La cadena empieza en el objetivo, no en los datos.
4. **No confundir el lado inclinado con la altura.** Es la misconception del nodo, `area_uses_slant_side`, y sobrevive a la construcción: un jugador puede bajar la altura correctamente y después multiplicar por el lado que se ve más largo.

## 4. Problema intuitivo

Un cuarto en forma de L al que hay que ponerle baldosas. Se ven tres paredes y sus medidas; la cuarta está tapada por un mueble que no se puede correr. La pregunta, por voz o por gesto: cuántas baldosas hacen falta.

En `intuition` la escena se detiene antes de contar. Tres desenlaces dibujados: alguien cuenta baldosa por baldosa y se pierde; alguien prolonga con tiza la junta de una fila hasta la pared de enfrente y el cuarto queda partido en dos rectángulos; alguien mide en diagonal de esquina a esquina y obtiene un número que no sirve para nada. El jugador elige y después ve. Nadie dice que la segunda es la buena: se ve, porque los dos rectángulos sí se pueden contar.

## 5. Analogía del mundo real

`tile_floor`, la del YAML, con la mecánica `tiles` ([G0](../../G-analogias/G0-reglas.md)). Mapa: una fila de baldosas es un factor; una columna, el otro; una baldosa suelta, la unidad; el piso entero, el producto; girar el piso, la conmutatividad; un piso al que le faltan columnas, la división; partir el piso en tiras, los productos parciales.

Es la analogía correcta para este nodo por una razón precisa: una línea auxiliar tiene que ser algo que no agrega materia, y la junta entre dos baldosas es exactamente eso. Ya estaba en el piso; nadie la puso. Prolongarla con tiza no mueve una sola baldosa y sin embargo parte el cuarto en dos pisos que se saben contar. El invariante que conserva es el de `tiles`, `area_preserved_under_rearrangement`: la cantidad de baldosas no cambia al partir el piso ni al girarlo.

Ruptura: `non_integer_sides`. Un piso con un lado de siete baldosas y media deja de ser una cuadrícula, y una figura con lados irracionales (la hipotenusa 13 de la terna 5, 12, 13 es amable, pero √2 no lo es) no se cuenta con baldosas. Por eso el piso se retira en `symbolic` y la figura queda sola, sin grilla debajo.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `construct` es la mecánica principal y `tiles` la herramienta con la que se cobra el dato descubierto ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `hold`.

1. La figura aparece dibujada y con algunas medidas visibles. Nada se puede mover: los vértices no se arrastran, los lados no se estiran. La figura es un dato, no un juguete.
2. El jugador une dos puntos existentes arrastrando de uno al otro, o toca un vértice y arrastra hacia un lado para bajar una perpendicular. El trazo queda punteado y aparecen las marcas que el motor deriva: el cuadradito del ángulo recto, los ticks de los segmentos iguales.
3. Con un toque sostenido sobre un lado lo prolonga más allá del vértice. Con un toque sostenido sobre una parte de la figura levanta una copia que puede girar o reflejar.
4. Cada trazo dispara las reglas de derivación del motor sintético ([O](../../O-arquitectura-tecnica.md)) y agrega hechos: perpendicularidad, igualdad de segmentos, un cuadrilátero con tres ángulos rectos que se vuelve rectángulo. Los hechos se ven como marcas, no como texto.
5. Con el dato descubierto, el jugador cambia de herramienta sin cambiar de pantalla: las baldosas de `tiles` se apoyan sobre el triángulo rectángulo que apareció y el lado que falta sale de reordenarlas.
6. La comprobación del invariante es un gesto propio: tocar la línea auxiliar la borra, y el dato que dio queda marcado en la figura. La figura sin la línea sigue teniendo la altura escrita. Eso es lo que había que creer.

Una línea válida que no revela nada no es un error: la figura la conserva atenuada y el vértice desde el que sí conviene trazar late una vez. Una marca de igualdad que numéricamente es falsa sí tiene consecuencia, y está en la sección 12.

## 7. Representación visual

Capa `visual`, primitiva `invariant` dominante, con `scale` de apoyo cuando entran las baldosas.

Lo que se conserva es el contorno: en el antes y el después, la figura original queda iluminada idéntica, y lo único distinto entre los dos estados es lo que se agregó. Nada se desplaza y nada se escala; ese es el mensaje entero de la primitiva. La línea auxiliar se dibuja punteada y con menos peso que los lados, para que se lea como agregado y no como parte de la figura.

Los hechos derivados tienen forma, no palabras: el ángulo recto es un cuadradito en el vértice, dos segmentos iguales llevan el mismo número de ticks, dos ángulos iguales llevan el mismo arco. Cuando el jugador borra la línea, las marcas que dependían de ella se quedan y parpadean una vez.

Todavía no hay cadena de igualdades escrita, ni nombres de teoremas, ni letras en los vértices. Los puntos se señalan tocándolos.

## 8. Transición a símbolos

Cinco pasos sobre la misma figura, con los desvanecimientos de `construct` y un gesto que dispara cada uno.

1. **`fold_paper`.** La figura es una hoja. El jugador la dobla por la mitad con dos dedos y al desplegarla queda el pliegue marcado. El pliegue es la primera línea auxiliar y nadie la llamó así.
2. **`draw_line_on_figure`.** Al primer trazo con el dedo sobre una figura que no se puede doblar, el pliegue se vuelve línea punteada y aparecen las marcas de ángulo y de segmento.
3. **`name_relation`.** Al tocar una marca, la marca se dice con voz y queda una etiqueta corta al lado: altura, mismo ángulo, mitad. La marca no se reemplaza: la etiqueta sale de ella y queda unida por un hilo.
4. **`symbolic_chain`.** Cuando el jugador cobra el primer dato con baldosas, las etiquetas se despegan de la figura y se ordenan en un renglón al costado: `AH = DC`, después `HB = 14 − 9 = 5`, después `CH² + 5² = 13²`. La figura sigue ahí y cada renglón resalta la parte de la figura de la que salió.
5. **`proof_sketch`.** La figura se atenúa y quedan los renglones, cada uno citando el anterior. El jugador puede tocar un renglón para que la figura vuelva a encenderse en la parte que lo justifica.

## 9. Notación matemática

El símbolo que nace acá es **la marca de relación en la figura**: el arco doble del ángulo igual, y con él los ticks de segmentos iguales y el cuadradito del recto.

La regla de oro de [H](../../H-progresion-abstraccion.md) pide el problema que lo hizo necesario, y este nodo lo tiene con una nitidez que pocos tienen. Mientras la figura tiene un dato oculto y una construcción, alcanza con recordar. Cuando tiene tres construcciones encadenadas, hay seis ángulos en juego y dos de ellos son iguales por una razón que se descubrió hace tres pasos, recordar deja de funcionar. La marca guarda el hecho **en la figura**, en el lugar exacto donde vale, y libera la memoria para la búsqueda. Es notación en el sentido fuerte: un símbolo que registra una afirmación, no una etiqueta que nombra un objeto.

Aparece en `symbolic`, y de a uno: primero el cuadradito, que ya venía del nodo 39; después los ticks; después el arco. La cadena de igualdades del paso 4 no introduce símbolos nuevos, porque `=`, las letras de los vértices y el cuadrado ya nacieron antes.

## 10. Definición formal

Capa `formal`: texto corto con voz y la figura al lado. Tres frases, de a una. "Una construcción auxiliar agrega a la figura puntos, segmentos o copias definidos a partir de los que ya están." "No cambia ninguna medida de la figura original." "Sirve cuando el objeto nuevo tiene una propiedad conocida que relaciona un dato que falta con datos que están."

Condiciones de validez: todo trazo se define por objetos existentes, nunca por una posición aproximada; toda marca de igualdad vale solo si está derivada de una regla, aunque el dibujo la sugiera. Casos especiales: construcciones válidas que no revelan nada, que existen y son parte del oficio; figuras donde ninguna línea interior alcanza y hay que prolongar hacia afuera, como en el tronco de cono que se completa hasta el vértice.

Ya jugado: las tres frases, en `concrete`. Nuevo: la palabra construcción y la exigencia de justificar una marca.

## 11. Propiedades

- **La construcción conserva las medidas.** Ligada al gesto de borrar la línea y ver que el dato sigue.
- **Una perpendicular desde un punto a una recta crea dos ángulos rectos, y con un lado común, un triángulo rectángulo.** Ligada a bajar la altura desde un vértice del trapecio.
- **Un cuadrilátero con tres ángulos rectos es un rectángulo, y sus lados opuestos son iguales.** Ligada a marcar `AH = DC` y obtener el trozo que falta de la base.
- **Prolongar dos lados hasta que se cortan produce dos figuras semejantes.** Ligada al tronco de cono y a la figura en L.
- **Reflejar una copia sobre un eje crea segmentos iguales.** Ligada al toque sostenido que levanta la copia.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: figura compuesta con una longitud desconocida y cuatro vértices que laten. Tocar aquel desde el que conviene bajar una altura.
- `explain`: el jugador traza una línea, la borra, y elige entre tres animaciones cuál muestra por qué el dato descubierto sigue valiendo sin la línea. Los distractores son las misconceptions de estrategia.
- `manipulate`: sobre un trapecio, bajar la altura desde un vértice, marcar el triángulo rectángulo que aparece y encadenar Pitágoras para la longitud escondida.
- `apply`: una figura en L y otra con un triángulo pegado a un rectángulo. Con una sola línea cada una, obtener el área con las fichas.
- `generalize`: una figura donde bajar la altura no alcanza. Hay que descubrir que prolongar un lado o trazar una diagonal revela el dato.
- `transfer`: en un triángulo cualquiera, bajar una altura y usar los dos triángulos rectángulos que aparecen para relacionar dos lados con los senos de sus ángulos, que es `trig.law.sines_from_altitude`.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`area_uses_slant_side`** (`missing_piece_tiles` sobre `tiles`, que el nodo declara, así que corre ahí). El jugador multiplica la base por el lado inclinado. El juego apoya las baldosas que el jugador contó sobre la figura real, superpone la figura verdadera y deja ver el triángulo que sobra fuera y el que falta dentro. Voz: "Con ese lado, las baldosas se salen de la figura. ¿Cuál es la que llega derecho hasta arriba?".

Y las misconceptions de estrategia de [S0](../../S-desafios/S0-desafios.md), que aparecen ya en el minijuego porque la mecánica es la misma, todas con `replay_on_mechanic` sobre `construct`:

- **`strategy_missing_auxiliary_line`**: el jugador intenta responder con un dato que no derivó. El juego congela, atenúa todo lo que no está justificado y deja encendido solo lo que sí. Voz: "Ese número todavía no está en la figura. ¿Qué línea lo trae?".
- **`assumed_right_angle`**: marca recto un ángulo que no lo es. El juego apoya la esquina de una baldosa cuadrada en el vértice y la baldosa no calza; queda una brecha con halo. Voz: "La baldosa no entra en ese rincón. ¿Cuánto mide en serio?".
- **`assumed_equal_segments`**: marca iguales dos segmentos que no lo son. El juego levanta una copia de uno y la apoya sobre el otro; sobra un pedazo. Voz: "Uno es más largo. ¿Qué construcción los haría iguales?".

## 13. Generalización

El piso de baldosas se retira en `symbolic`, cuando la figura pierde la grilla y los lados dejan de ser números enteros de baldosas. La cuadrícula vuelve a demanda, atenuada, hasta `formal`.

Variantes sin ayuda visual, en orden: la altura cae dentro de la figura; la altura cae fuera y hay que prolongar la base; el dato sale de una diagonal y no de una altura; el dato sale de prolongar dos lados hasta el punto donde se cortan; el dato sale de reflejar una copia. En cada una la figura es nueva y la cheatsheet ofrece las cuatro estrategias del nodo (`cs.geom.strategy_draw_altitude`, `cs.geom.strategy_draw_diagonal`, `cs.geom.strategy_extend_side`, `cs.geom.strategy_mark_equal_parts`) como entradas al mismo nivel que las fórmulas ([R0](../../R-cheatsheet/R0-cheatsheet.md)).

El nodo está en `abstract` cuando el jugador, ante una figura que nunca vio, elige la línea, justifica en una frase por qué esa y no otra, y reconoce las figuras donde ninguna línea interior alcanza. La forma completa de esa capa es `geom.cons.hidden_data_hunt`, y de ahí en adelante `disc.proof.chain_of_constructions`.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno en otro contexto y con otra mecánica:

- `trig.law.sines_from_altitude` (`construct` con `balance`): bajar la altura desde un vértice de un triángulo cualquiera da la misma altura escrita de dos maneras, y de igualarlas sale la ley de senos.
- `calc1.deriv.tangent_line` (`slope_walker`): la secante entre dos puntos de una curva es una línea auxiliar, y la tangente es adonde llega cuando los puntos se juntan.
- `disc.proof.chain_of_constructions`: una demostración es una cadena de construcciones donde cada trazo cita el anterior. Es el `proof_sketch` de este nodo, llevado a su propio nodo.
- `linalg.orth.projection_as_shadow` (`grid_stretch`): proyectar un vector sobre otro es bajar la perpendicular y quedarse con la sombra. La misma mano, sobre flechas.

Concepto siguiente: `geom.cons.hidden_data_hunt`. Frase puente, narrada sobre la última figura resuelta: "Hasta acá la figura te decía qué le faltaba. En la próxima nadie te dice qué falta: primero hay que darse cuenta". La figura pierde una de sus medidas visibles y el nodo siguiente empieza ahí. Con él y con Pitágoras, este nodo abre la puerta de los desafíos de [S](../../S-desafios/S0-desafios.md): `ch.geom.trapezoid_hidden_height`, `ch.geom.l_shape_missing_side`, `ch.geom.chord_distance_from_center`, `ch.geom.parallel_cut_missing_length`, `ch.geom.frustum_volume_by_extension` y `ch.trig.tower_from_two_angles` lo requieren.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `construction_scene_composite_figure_altitude` es nativa: la figura del jugador, la altura que baja desde el vértice elegido, el cuadradito que aparece, la llave que marca el segmento nuevo; gramática `invariant`, con el contorno original iluminado igual en el antes y el después. Parametrizada por figura, lado desconocido y vértice de partida, produce también las animaciones de `explain`. `construction_scene_choose_the_line` es nativa y muestra tres o cuatro candidatas sobre la misma figura, una que revela y las otras que no, con la que sirve marcada al final. Ninguna lleva texto rasterizado: las etiquetas de las marcas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_area` ([M](../../M-calculadora/M0-progresion.md)), que ya venía de los nodos de área y que acá acepta figuras compuestas: el jugador arma la figura con fichas de rectángulo y de triángulo y la calculadora devuelve la suma, mostrando el corte que usó. No acepta un lado que el jugador no derivó: pide primero la construcción.

**Edad universal:** el nodo es `short_text` porque dos de sus cuatro entradas de cheatsheet son estrategias escritas y porque `explain` compara justificaciones ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: trazar es un gesto, las marcas son formas, los prompts son voz. Los desafíos de baldosas con datos ocultos de [S0](../../S-desafios/S0-desafios.md) son la versión sin lectura de esta misma idea y se juegan mucho antes. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa `visual` y usa la cadena de igualdades desde el primer nivel.
