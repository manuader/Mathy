# Devolver la lámina a su forma (`linalg.map.inverse_and_systems`)

Minijuego del nodo 33 de la espina, "Inversa deshace la deformación". Mecánica principal `grid_stretch`, secundarias `chest_key` y `balance`; analogía `rubber_grid_undo_stretch`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/33-linalg.map.inverse_and_systems.md): un concepto, cinco dificultades reales (dar vuelta la pregunta, ver `A⁻¹` como una deformación y no como una fórmula, reconocer cuándo no hay llave, aplicarla a los dos lados, deshacer en orden inverso), una analogía, un gesto doble (la misma llave sobre la lámina y sobre el `=`), cinco pasos de desvanecimiento, el fantasma de la grilla como juez, retiro en `formal`. Es el segundo regreso de la llave en el catálogo de [E0](../E-mecanicas/E0-catalogo.md). Acá se fija cómo se juega.

## Analogía

Una lámina que ya fue estirada por otra persona. La casa quedó torcida y su esquina marcada está sobre un punto del tablero; debajo, el fantasma de la grilla original. Abajo, un llavero con tres o cuatro laminitas: cada una es una deformación candidata, dibujada con sus dos clavijas.

Mapa objeto → concepto: tirar de la lámina hacia atrás → matriz inversa; encontrar de dónde salió un punto → resolver un sistema; lámina aplastada hasta una línea → matriz singular; área del sello de la casa → determinante; lámina dada vuelta → determinante negativo; lámina aplastada que no se puede desplegar → no hay inversa.

La lámina aporta el objeto; el llavero aporta "qué llave"; la balanza aporta "en cuántos lados". Punto de ruptura: `more_than_two_dimensions`, porque una superficie no puede mostrar los grados de aplastamiento de tres dimensiones o más. La analogía se retira en `formal`, cuando el criterio numérico reemplaza a la mirada ([G0](../G-analogias/G0-reglas.md)).

El área del sello pertenece a `linalg.map.determinant_as_area`. Acá el número `ad − bc` entra solo como la condición que separa las láminas con vuelta de las aplastadas, sin nombrarlo determinante y sin explicar por qué mide un área.

## Mecánica central

Superficie: la lámina deformada al centro con el fantasma debajo, el llavero abajo, y a la derecha la línea de la igualdad con `A`, la columna incógnita y la columna conocida, desde el cuarto nivel. Las dos superficies comparten estado: mover la lámina mueve la escritura y viceversa. Gestos: `drag`, `tap` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una llave sobre la lámina.** La deformación de esa laminita se aplica de verdad, sea la correcta o no. Con la correcta la grilla se desenrolla, coincide con el fantasma, la casa recupera su forma y la esquina marcada se desliza a su punto de origen, que queda iluminado.
- **Llave equivocada.** La lámina se mueve y queda en otra posición, sin coincidir con el fantasma; la casa sigue torcida, de otra manera. El estado se conserva y el jugador puede aplicar otra llave encima, con dos deformaciones apiladas.
- **Arrastrar la llave sobre el `=`.** Se aplica a los dos lados a la vez, y se escribe a la izquierda de los dos. Soltarla sobre un solo lado inclina la línea, igual que en el nodo 13.
- **Arrastrar las clavijas a mano.** Sigue disponible desde el nodo 32: el jugador puede construir la vuelta tirando en vez de elegir del llavero, y la laminita se arma sola en el llavero cuando la consigue.
- **Tocar la casa recuperada.** Vuelve a aplicar el estiramiento original y la esquina cae otra vez sobre el punto marcado. Es la verificación por sustitución.
- **Tocar la línea de una lámina aplastada.** Se ve una recta entera de puntos de origen colapsando en un solo punto, y otro punto fuera de la línea que no recibió a nadie.

En `symbolic` la superficie cambia de forma, no de reglas: la lámina se pide con un toque, la llave es una ficha con la etiqueta `A⁻¹`, y soltar la ficha sobre el `=` sigue siendo aplicarla a los dos lados.

## Invariante matemático

Dos invariantes, uno por mecánica secundaria, sobre la superficie de la principal.

`inverse_restores_original` (llavero): la llave devuelve exactamente lo que había. El juez es el fantasma de la grilla: mientras la lámina no coincida con él, la vuelta no está completa. Se ve romperse con la llave equivocada, que hace algo visible y distinto, y se ve confirmarse cuando la casa recupera su forma y la verificación devuelve la esquina al punto marcado.

`equality_under_identical_actions` (balanza): la igualdad sobrevive a la misma deformación aplicada a los dos lados. Se ve romperse cuando la llave cae sobre un solo lado y la línea se inclina.

El tercer hecho, que no es un invariante sino su ausencia, es el que define el nodo: **hay deformaciones sin vuelta**. El llavero aparece con una ranura hueca y ninguna laminita despliega la línea, porque toda una recta de puntos ya se fusionó en uno solo.

Aplicar una llave válida que no simplifica, por ejemplo deshacer y volver a hacer, no rompe nada: recibe un empujón suave.

## Representación visual

Primitiva dominante `invert`, de apoyo `deform` e `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la lámina ya estirada por otra persona, con la casa torcida y el fantasma al costado. Solo se mira y se predice.
- `concrete`: lámina con textura, casa torcida, esquina marcada, llavero de laminitas, ranura hueca en el caso aplastado.
- `visual`: vuelve el diagrama vertical de la primera llave, ahora con láminas: arriba la grilla original, una flecha hacia abajo con el dibujo de la deformación, abajo la grilla deformada, y la llave como la misma flecha reproducida hacia atrás. Del otro lado, la línea de la igualdad con la alineación en columnas heredada del nodo 16.
- `symbolic`: `A⁻¹`, `I`, `Ax⃗ = b⃗` y `x⃗ = A⁻¹b⃗`; la fórmula de las entradas con `ad − bc` iluminado en el denominador; la lámina como fantasma.
- `formal`: la definición corta con voz; la condición numérica al lado de la grilla aplastada.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Fantasma → identidad: la primera vez que la lámina coincide con su fantasma, las clavijas quedan en su lugar y sus columnas se escriben con el corchete del nodo 32. Nace `I`.
2. Laminita → `A⁻¹`: la llave que funcionó pierde el dibujo y gana etiqueta, la misma letra de la lámina con un `−1` chiquito arriba, heredado del nodo 21; la forma de sus clavijas queda un rato como sombra.
3. Filas → `Ax⃗ = b⃗`: las dos filas del libro, ya escritas con letras desde el nodo 16, deslizan sus coeficientes dentro de un corchete alto, los totales se apilan en una columna y las incógnitas en otra, y la llave del sistema se contrae. Es la etapa 4 del ejemplo de frutas de [H](../H-progresion-abstraccion.md) ocurriendo en pantalla; nada se calcula, solo se reordena.
4. Llave sobre el `=` → los dos lados: `A⁻¹` se escribe a la izquierda de los dos lados a la vez, respetando el lugar.
5. `A⁻¹A` → `I` → nada: el par se contrae en `I` cuando la lámina coincide con el fantasma, y `I` se desvanece con un morph. Queda `x⃗ = A⁻¹b⃗`.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la lámina fantasma: la inversa de `A` es la deformación que deshace `A`, la única que cumple `A⁻¹A = I`; existe si, y solo si, las dos columnas de `A` no están sobre la misma recta por el origen, es decir, si `ad − bc` no es cero; cuando existe, el sistema `Ax⃗ = b⃗` tiene exactamente una solución, y es `x⃗ = A⁻¹b⃗`.

Propiedades: la llave devuelve lo original, `A⁻¹(Av⃗) = v⃗`, que es la propiedad del nodo 21 con láminas en lugar de máquinas; aplicar la misma deformación a los dos lados conserva la igualdad; no toda deformación tiene llave; deshacer dos estiramientos se hace al revés, `(AB)⁻¹ = B⁻¹A⁻¹`. Casos especiales: si `ad − bc` es cero y `b⃗` cae sobre la línea aplastada hay infinitos orígenes, y si cae fuera no hay ninguno; la identidad y las reflexiones son sus propias inversas.

Símbolos: el exponente `−1` ya nació en el nodo 21, y lo nuevo es a quién nombra, una deformación que se puede dibujar; el problema que lo hace necesario es que arrastrar clavijas no se puede escribir ni pasar a otro. `I` nace porque después de aplicar la llave hay que escribir qué quedó y "nada" no se escribe. `Ax⃗ = b⃗` es una convención de escritura, el libro de frutas compactado, y se vuelve necesaria en cuanto hay que aplicar una sola cosa a los dos lados. Cheatsheet: `cs.linalg.inverse_2x2`, `cs.linalg.solve_ax_equals_b` y `cs.linalg.singular_no_inverse`, las tres en capa `symbolic`.

## Generalización

La lámina se retira en `formal`, y el retiro tiene un momento preciso: cuando el jugador decide si hay inversa mirando `ad − bc` en vez de mirar si la grilla quedó aplastada. Desde ahí la lámina se pide con un toque y después no vuelve. Es la etapa 6 del ejemplo de frutas de [H](../H-progresion-abstraccion.md): los sistemas dejan de resolverse y pasan a interpretarse.

Variantes sin ayuda visual: matrices con entradas negativas; inversas con entradas fraccionarias; matrices singulares donde la respuesta correcta es que no hay llave, con la justificación; sistemas dados directamente como dos filas, sin lámina; `b⃗` sobre la línea aplastada contra `b⃗` afuera. Después, vueltas que no son láminas: una mezcla de dos pinturas que hay que desandar, un cambio de moneda de ida y vuelta, un cifrado con dos transformaciones seguidas. El jugador identifica la llave, dice en qué orden se deshacen dos acciones apiladas y reconoce el caso sin vuelta, que siempre es el mismo: dos entradas distintas terminaron en la misma salida. Cuando resuelve `Ax⃗ = b⃗` sin pedir lámina y decide de antemano cuántas soluciones hay, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de frutas de [H](../H-progresion-abstraccion.md): sus etapas 5 y 6 corresponden a este nodo. La etapa 4, donde las filas se compactan en `A`, `x⃗` y `b⃗`, se juega acá aunque H la ubique en el nodo 32, porque es el paso 3 de la transición simbólica y sin ella la llave no tiene dónde caer. Las frutas no reaparecen: cuando este nodo empieza, el libro ya está escrito con letras.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una llave, una lámina.** `concrete`, `manipulate` y `recognize`. Deformaciones simples de una sola dirección, llavero de tres laminitas, entradas enteras positivas.
2. **Cuatro llaves.** `concrete`, `recognize` y `manipulate`. Llavero completo con distractores que deshacen una sola clavija o deshacen de más. Aparece `wrong_inverse_choice`.
3. **La lámina aplastada.** `visual`, `explain`. Aparece la ranura hueca y la recta de orígenes que colapsa. El diagrama vertical acompaña.
4. **Los dos lados.** `visual` hacia `symbolic`, `manipulate`. Aparece la línea de la igualdad y el gesto de soltar la llave sobre el `=`; soltarla de un lado la inclina.
5. **La fórmula.** `symbolic`, `apply`. Nace `x⃗ = A⁻¹b⃗` y la fórmula de las entradas con `ad − bc`. La lámina se pide con un toque. Parámetros: entradas negativas.
6. **Dos láminas apiladas.** `symbolic`, `explain` y `apply`. Deshacer en orden inverso. Aparece `matrix_multiplication_commutes`.
7. **Sin lámina.** `formal` y `abstract`, `generalize` y `transfer`. Inversas fraccionarias, singulares con los dos casos de `b⃗`, sistemas dados como filas, vueltas que no son láminas.

Qué endurece cada parámetro: el rango de entradas obliga a decidir por el número y no por la figura; las negativas meten reflexiones, donde la llave "obvia" suele ser la equivocada; las fracciones separan la inversa de "achicar"; cuando `ad − bc` se acerca a cero sin llegar, el aplastamiento deja de verse y el jugador tiene que mirar el denominador.

Desafíos de olimpíada: el nodo participa en `ch.linalg.undo_the_unknown_stretch` ([S](../S-desafios/S0-desafios.md)), de nivel regional, donde la matriz no está dada y hay que reconstruirla a partir de dos pares de vectores con sus imágenes, decidir si se puede deshacer y recién después aplicar la llave. Requiere también `linalg.map.determinant_as_area`, así que no está disponible al terminar este nodo solo.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: la lámina deformada y cuatro laminitas; tocar la que deshace exactamente la deformación mostrada. Distractores: deshace una sola clavija, deshace de más, deshace la deformación equivocada.
- `explain`: la lámina aplastada en tres animaciones. Una tira de la línea hacia arriba y la casa no vuelve porque toda una recta de puntos ya se fusionó; otra la despliega hacia un lado y aparecen puntos que no venían de ningún lado; otra recorre la recta de orígenes que colapsó. Tocar la que muestra por qué no se puede y narrarla con la voz. Cada distractor es una misconception.
- `manipulate`: tirar de las clavijas hacia atrás hasta que la casa vuelva a su lugar y leer la matriz inversa que quedó escrita.
- `apply`: dado el punto donde cayó la esquina, encontrar de dónde salió sin probar al azar. Cuatro instancias seguidas contra el tiempo objetivo del nodo, con la lámina como fantasma.
- `generalize`: explicar con la lámina por qué dos ecuaciones con dos incógnitas son la misma pregunta que deshacer una deformación, armando el sistema a partir de la lámina y después la lámina a partir del sistema.
- `transfer`: en el cofre con dos cerraduras de `csmath.gfx.transform_matrix`, elegir la llave que abre las dos a la vez. También en `mvcalc.int.change_of_variables_jacobian` y `adv.four.inverse_transform`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `wrong_inverse_choice`, patrón `key_mismatch` sobre `chest_key`, que el nodo declara. Frente a una lámina estirada al doble de ancho, el jugador toma la que estira al doble de alto, o la que achica las dos direcciones a la mitad. La llave se aplica de verdad, la lámina no coincide con el fantasma, y el juego marca las dos clavijas actuales y las dos del fantasma y dibuja al lado del llavero la silueta hueca de la laminita que sí cierra, mostrando solo adónde tienen que volver las clavijas. Voz: "Esa lámina no devuelve la casa. ¿Adónde tienen que volver las dos clavijas?". Es la de mayor severidad del nodo y viene catalogada desde `prealg.inv.operation_as_key`, así que se presenta como un regreso.
- `matrix_multiplication_commutes`, patrón `two_paths_diverge` sobre `grid_stretch`, que el nodo declara. Con dos deformaciones apiladas, el jugador deshace primero la que se aplicó primero, o escribe la inversa del producto en el mismo orden. La pantalla se parte: en una mitad se desenrolla empezando por la última y la lámina coincide con el fantasma, en la otra se empieza por la primera y la casa termina torcida de una tercera manera. Las dos quedan en pantalla y el jugador elige. Voz: "Te pusieron una deformación y después otra. ¿Cuál sacás primero?".

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de estas dos, más las de los prerequisitos directos, entre ellas `inverse_applied_one_side` heredada de la balanza.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `grid_scene_undo_stretch`, nativa. Recibe la matriz, su inversa y el contorno de la casa; muestra la lámina desenrollándose hasta coincidir con el fantasma, con el punto marcado deslizándose a su origen. Gramática `invert`. Parametrizada con una inversa que no corresponde, produce las animaciones de `explain` y el replay de `wrong_inverse_choice`.
- `chest_scene_matrix_as_key`, nativa. El llavero de laminitas, la que entra y gira, la que se traba, y la ranura hueca cuando la lámina está aplastada. Gramática `invert`. Es la imagen de cheatsheet de `cs.linalg.singular_no_inverse`.
- `balance_scene_two_equations_one_grid`, de ruta mixta. La pre-renderizada muestra las dos filas del libro compactándose en `Ax⃗ = b⃗` mientras la lámina hace lo mismo del otro lado; la nativa corre sobre el estado del jugador con la llave cayendo sobre el `=`. Gramática `invariant`. Es la imagen de cheatsheet de `cs.linalg.solve_ax_equals_b`.
- Reusadas: `grid_scene_rubber_sheet_house` (nodo 32), para plantear el estiramiento, y `chest_wrong_key_stays_shut` (nodo 12), como distractor.
- Sin texto rasterizado: las entradas de las matrices las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_invertible_stretch`: `entry_range` (−3 a 3); `determinant_nonzero` (falso solo en los niveles 3 y 7, para producir singulares); `integer_inverse_preferred` (verdadero hasta el nivel 6); `family` en {scale, shear, rotate, reflect, generic}; `seed`.
- `gen_key_rack`: `size` (3 a 5 laminitas); `distractors` desde `detect` (deshace una sola clavija, deshace de más, deshace otra deformación, aplica la misma en vez de la inversa); `labeled` (falso en los niveles 1 a 3).
- `gen_system_rows`: el mismo problema escrito como dos filas, con `coefficient_range`, `solution_range` y `unknown_order`, encadenado al mismo `seed` que la lámina para que las dos superficies muestren el mismo caso.
- `gen_singular_case`: la lámina aplastada, con `b_on_line` en {verdadero, falso} para producir los dos casos, infinitas soluciones y ninguna.

**Literacy soportada:** de `icons` a `full_text`. La primera capa se juega sin leer, pero las entradas de las matrices y el número `ad − bc` aparecen como dígitos con signo y por eso el mínimo es `icons`. En `full_text` la definición corta y la condición de existencia se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la laminita cuyas clavijas devuelven las de la lámina a su lugar, la arrastra sobre la lámina y suelta; la grilla se desenrolla y la casa recupera su forma. La escena vuelve al inicio y el llavero late. Hay una segunda demostración, en el nivel 4: la mano suelta la llave sobre el `=` y la etiqueta se escribe a la izquierda de los dos lados. No se repite la demostración de soltar de un solo lado: es la del nodo 13 ([Q](../Q-edad-universal.md)).

**Calculadora:** `op_matrix_inverse` y la reescritura de `op_solve_system` quedan disponibles desde el panel lateral en cuanto el nodo pasa a `ready`. La primera muestra `ad − bc` antes que el resultado y, si es cero, dibuja la grilla aplastada en lugar de una matriz; la segunda agrega la lectura `x⃗ = A⁻¹b⃗` a la secuencia de filas que ya escribía desde el nodo 16 ([M](../M-calculadora/M0-progresion.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
