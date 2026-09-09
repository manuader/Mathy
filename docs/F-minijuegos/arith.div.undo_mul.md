# La llave que encoge (`arith.div.undo_mul`)

Minijuego del nodo 6 de la espina, "Dividir deshace el estirado". Mecánica principal `chest_key`, secundarias `tiles` y `grid_stretch`; analogías `rubber_band_stretch` y `tile_floor`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/06-arith.div.undo_mul.md): un concepto, cuatro dificultades reales (ver la división como vuelta, aceptar que dos preguntas dan el mismo número, calibrar el factor, entender por qué el cero no tiene vuelta), dos analogías complementarias, un gesto (girar la llave hasta que las marcas coinciden), cuatro pasos de desvanecimiento, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una banda elástica clavada de un extremo, con marcas regulares, que quedó estirada. Debajo, una banda testigo sin tocar. Sobre la estirada hay un cofre cuya cerradura tiene la forma del estirado. Abajo, un llavero.

Mapa objeto → concepto: banda marcada → recta numérica; marca → número; extremo clavado → el cero, que no se mueve; estirar k veces → multiplicar por k; dejar que la banda se encoja → dividir por k; forma de la cerradura → el estirado que hubo; llave de encoger → la división; dial de la llave → el divisor; banda testigo → el estado que hay que recuperar.

El piso aporta la otra cara: fila de baldosas → primer factor; columna → segundo factor; piso entero → producto; lado tapado por una pared → división; partir en filas iguales → repartir; baldosas que sobran → resto sin nombre todavía.

La banda hace visible que dividir es volver; el piso, que dividir es partir. Punto de ruptura de la banda: `negative_scaling_flips`, porque una banda física no se da vuelta. Punto de ruptura del piso: `non_integer_sides`, un lado que no es un número entero de baldosas, que es lo que el nodo 8 necesita ([G0](../G-analogias/G0-reglas.md)). `sharing_into_plates` está declarada en G apuntando a este nodo pero su mecánica es `sorter`, que el nodo no declara: se deja entera para `arith.div.remainder`.

## Mecánica central

Superficie: la banda estirada en el centro con la testigo debajo, el cofre apoyado encima, el llavero abajo. El piso aparece a la derecha desde el cuarto nivel. Gestos: `drag`, `tap` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una llave a la cerradura y girarla con el mismo dedo.** Entra si es de la clase correcta. La banda se encoge en vivo mientras un cursor sigue una marca, y el cofre se abre cuando esa marca cae sobre la correspondiente de la testigo.
- **Soltar antes de tiempo.** La banda se queda donde está y el cofre no cede. El estado se conserva y el jugador retoma el giro desde ahí.
- **Llave de recortar.** Corta el extremo y la banda queda del largo correcto con las marcas separadas. El cofre no se abre; la testigo al lado es el mensaje.
- **Girar de más.** Las marcas pasan de largo y la banda vibra. El jugador vuelve con el mismo gesto.
- **Arrastrar el dedo sobre el piso.** Lo parte en filas; las líneas chasquean si quedan iguales y aparece la ficha del lado que faltaba. Si no, las baldosas de la última fila se despegan y quedan sueltas al costado, brillando.
- **Tocar la ficha del resultado.** Vuelve a estirar la banda por ese factor, o vuelve a fundir las filas: la verificación.
- **Banda aplastada.** En un nivel todas las marcas están en el clavo. Ninguna llave gira, el llavero late y se cierra solo.

En `symbolic` la superficie cambia de forma, no de reglas: soltar la ficha `÷` sobre la fila aplica la vuelta completa; soltarla sobre uno solo de los números la deja a medio camino y la fila se corre; la banda aparece como fantasma tocando el contorno.

## Invariante matemático

`inverse_restores_original` (cofre y banda): la llave devuelve exactamente lo que había. Se confirma cuando las marcas de la banda encogida coinciden una a una con las de la testigo, y se rompe cuando la llave recorta: el largo coincide y las marcas no. La superposición es el mensaje.

`area_preserved_under_rearrangement` (piso): ninguna baldosa desaparece al partir. Se rompe cuando el jugador mete las sobrantes en una fila y esa fila queda más larga que las otras.

`lines_stay_lines_origin_fixed` (banda): el clavo no se mueve y las separaciones cambian todas en la misma proporción. Se rompe si el jugador arrastra la banda entera en vez de encogerla: se corre y vuelve sola al clavo, como en el nodo 5.

Un movimiento válido pero inútil, como encoger un poco y soltar sin llegar, no rompe nada: recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `invert`, de apoyo `scale` y `partition` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el puesto de la feria, la banda devuelta y la banda nueva, sin llavero. Solo se mira y se predice.
- `concrete`: banda estirada con marcas, testigo debajo, cofre con cerradura de forma, llaves con forma, color y dial visible. Nada escrito.
- `visual`: la banda es un segmento con marcas y un punto grueso en el clavo, y aparece el diagrama vertical: banda original arriba, flecha hacia abajo con la forma del estirado, banda estirada abajo, y la llave como esa flecha reproducida hacia arriba. El piso es un rectángulo sobre grilla tenue con una llave de longitud llena y una hueca.
- `symbolic`: fichas con numerales y la ficha `÷` sobre el contorno, con la ficha del resultado apoyada.
- `formal`: la definición corta con voz, con la banda al lado.

## Transición simbólica

Cuatro morphs, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cerradura → ficha del estirado: al abrir el cofre por primera vez en `visual`, la cerradura se despega de la tapa y se contrae en `× 3`, flotando sobre la flecha que baja.
2. Llave → ficha de la vuelta: en el mismo gesto la llave sube por el costado y su etiqueta se forma delante del jugador. La cruz de `×` gira un cuarto de vuelta hasta quedar acostada como una barra y las cuatro puntas del aspa se juntan de a dos en un punto arriba y otro abajo. Queda `÷ 3`.
3. Banda estirada → dos números y una ficha: al soltar la llave, el tramo estirado se contrae en el numeral del total y el original en el del resultado. Queda `15 ÷ 3` sobre el contorno.
4. Piso partido → el mismo `÷`: la llave hueca se rellena con la ficha del resultado y las dos llaves se acercan con la misma barra de dos puntos entre ellas. Las baldosas sobrantes quedan afuera de la expresión, sin nada que las nombre.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la banda: dividir un número por otro es encontrar el factor que estira el segundo hasta el primero; dividir también es partir en partes iguales, y el resultado es lo que mide cada parte; dividir deshace multiplicar. Propiedades: dividir por 1 no cambia nada; un número dividido por sí mismo devuelve una marca; el estirado por 0 no tiene llave porque aplastó todas las marcas y la información ya no está; `0 ÷ 0` tampoco, porque cualquier factor sirve. El símbolo nuevo es `÷`, y nace de la cruz del nodo 5 acostada: la misma acción vista al revés. No hay igual todavía, y lo que sobra al partir se ve y no se escribe: ese hueco es `arith.div.remainder`.

## Generalización

El piso se retira primero, en cuanto el jugador lee el lado tapado sin cortar nada. La banda se queda a demanda, porque es la única que soporta el factor de vuelta menor que 1 y porque el nodo 8 la necesita entera.

Variantes sin ayuda visual: divisores mayores que la grilla; división por 1 y de un número por sí mismo; divisiones que no dan exactas, con el sobrante a la vista; el mismo producto pedido en sus dos divisiones. Después, cerraduras que nunca se vieron y que no son aritméticas pero tienen vuelta y dial: "girar la figura hasta que el punto rojo quede arriba", "separar los tres dibujos hasta que entren en el marco". El jugador elige la clase de llave y la calibra, sin números, y distingue la cerradura sin llave. Cuando resuelve todo eso sin pedir banda ni piso, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): sus niveles 1 y 2 (cofre y llave por forma, colores como transformaciones) corresponden a este nodo, con la diferencia de que acá la llave además se calibra. Del 3 en adelante son de los nodos 13 y siguientes.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **La banda vuelve.** `concrete`, `manipulate`. Una sola clase de llave, con el dial cerca del valor correcto. Testigo siempre visible, factores de 2 a 4.
2. **El llavero completo.** `concrete`, `recognize` y `manipulate`. Se agregan las llaves de recortar y de estirar; el dial arranca en cero.
3. **Flechas.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; aparece el diagrama vertical con la flecha de ida y la de vuelta.
4. **El piso con la pared.** `visual`, `apply`. Entra el rectángulo con un lado tapado.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión aparece junto a la banda y se transforma en sincronía; la llave tiene etiqueta.
6. **Banda fantasma.** `symbolic` segunda mitad, `apply`. La expresión queda sola y la banda se pide con un toque. Rango mayor.
7. **Lo que sobra.** Parámetros: divisiones que no dan exactas. Las baldosas sueltas quedan brillando sin manera de anotarse; el nivel se pasa señalando cuántas filas enteras salieron.
8. **Vueltas que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; acciones no aritméticas con parámetro, y una sin vuelta por instancia.

Qué endurece cada parámetro: el rango de factores obliga a calibrar en vez de reconocer; la llave de recortar separa deshacer de emparejar el resultado; el sobrante rompe la expectativa de que toda división termina; el divisor cero muestra que hay acciones sin vuelta.

Desafíos de olimpíada: el nodo participa en los desafíos de aritmética de [S](../S-desafios/S0-desafios.md), aún no escritos, donde una división aparece como paso intermedio con el divisor oculto. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: una banda estirada tres veces y cuatro llaves de encoger con distinto dial. Tocar la que la devuelve a su largo original.
- `explain`: la misma banda en dos animaciones. En una se encoge y las marcas vuelven a coincidir con la testigo; en la otra se recorta el extremo y el largo coincide pero las marcas no. Tocar la que no es la llave del estirado.
- `manipulate`: banda estirada por 4. Girar la llave hasta que las marcas coincidan y después partir el rectángulo de 12 en filas de 4.
- `apply`: cuatro pisos seguidos con un lado tapado. Tocar la ficha del lado que falta sin desarmar el rectángulo, contra el tiempo objetivo del nodo.
- `generalize`: una banda aplastada contra el clavo. Arrastrar la ficha de cofre sin llave al llavero vacío. Y un cofre con cerradura "separar los tres dibujos hasta el marco": calibrar la llave sin números.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, aplicar la deformación que devuelve la grilla a la cuadrícula. También en `geom.sim.similarity_as_scale` y `prob.basic.probability_as_proportion`.

El YAML declara `misconceptions: []`. Los errores previstos corren sobre patrones prestados, no clasifican y no bloquean `ready` ([L0](../L-modelo-errores/L0-taxonomia.md)):

- **Recortar en vez de encoger.** El juego ejecuta el corte y superpone la testigo con las marcas de a pares, dibujando los huecos. Voz: "El largo quedó bien. ¿Y las marcas del medio?".
- **Dividir al revés.** Corre como `key_mismatch`: la llave se traba en el último cuarto de vuelta y aparece la silueta hueca de la que sí entra. Voz: "Esa llave encoge mucho más de lo que se estiró. ¿Cuánto se estiró?".
- **Sumar el sobrante al resultado.** El juego coloca las baldosas sueltas donde el jugador dijo, la fila queda más larga y el borde se rompe. Corre como `missing_piece_tiles`. Voz: "Esa fila quedó más larga. ¿Todas las filas tienen que medir lo mismo?".

Los distractores se generan desde las reglas `detect` de los prerequisitos directos, porque el nodo no aporta las suyas.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_shrink_key_undoes_stretch`, nativa. La banda que se encoge mientras la llave gira, el clavo quieto y la marca seguida iluminada en el antes y el después; gramática `invert`. Parametrizada por el factor y el largo, produce las dos animaciones de `explain` y los distractores de `recognize`. Es la imagen de cheatsheet de `cs.arith.div_undoes_mul`.
- `tile_split_rectangle_into_rows`, nativa. Las líneas punteadas que se vuelven llenas, la llave hueca que se rellena y las baldosas sobrantes que se despegan; gramática `partition`. Parametrizada por el total y las filas, produce los ítems de `apply`.
- Reusadas: `grid_stretch_by_factor` y `tile_rows_become_rectangle` (nodo 5), como distractores y como mitad de ida del diagrama vertical.
- Ninguna lleva texto rasterizado: los numerales y la barra con dos puntos los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_stretched_band`: `factor` (2 a 4 en los niveles 1 a 4, hasta 12 en el 6); `marks`; `witness_visible`; `dial_start` (cerca o en cero); `seed`.
- `gen_shrink_key_ring`: `size` (2 a 5 llaves); `classes` en {encoger, recortar, estirar}; `distractors` desde `detect` de los prerequisitos; `labeled` (falso en los niveles 1 a 4).
- `gen_tiled_floor`: `total`; `known_side`; `exact` (falso desde el nivel 7, con `leftover` entre 1 y el lado menos uno); `wall_side` en {arriba, izquierda}; `seed`.
- `gen_arbitrary_undo`: `action_kinds` en {giro, separación}, las acciones no aritméticas que tienen vuelta; `dial_range` (los valores del parámetro que hay que calibrar); `count` (cuántas acciones trae la instancia); `include_uninvertible` (habilita la cerradura sin vuelta, una por instancia); `seed`.

**Literacy soportada:** de `none` a `full_text`. Hasta el nivel 4 no hay numerales: las llaves se distinguen por forma y el dial por posición. Los numerales aparecen en el nivel 5 y la definición corta en el 8. En `full_text` la definición se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma apoya la llave de encoger y gira hasta que la marca seguida cae sobre la testigo; el cofre se abre. La escena vuelve al inicio y el llavero late. Se repite solo si el jugador se queda quieto. La demostración de partir el piso aparece en el nivel 4 y no se repite ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
