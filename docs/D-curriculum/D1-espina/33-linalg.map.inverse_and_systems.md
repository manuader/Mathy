# 33 — Inversa deshace la deformación (`linalg.map.inverse_and_systems`)

> Locale `es`: "Inversa deshace la deformación". Minijuego: [Devolver la lámina a su forma](../../F-minijuegos/linalg.map.inverse_and_systems.md).

**Nodo:** `linalg.map.inverse_and_systems` · **Área:** linalg · **Nivel:** 6 · **Primitiva:** `invert` · **Mecánica principal:** `grid_stretch` (secundarias `chest_key` y `balance`) · **Literacy:** `icons` · **Analogía:** `rubber_grid_undo_stretch`

## 1. Concepto

`A⁻¹` es la deformación que devuelve la lámina a su forma. Aplicarla a un punto responde de dónde salió ese punto, y esa pregunta es exactamente la de un sistema de dos ecuaciones con dos incógnitas. Al terminar, el jugador elige la deformación que deshace otra, la aplica a los dos lados de una igualdad para despejar el vector desconocido, y reconoce las deformaciones que no tienen vuelta: las que aplastan la grilla contra una línea. Antes sabía adónde va un punto; ahora sabe de dónde vino, y cuándo esa pregunta no tiene una sola respuesta.

## 2. Prerequisitos

- `linalg.map.linear_transformation_2d` (nodo [32](32-linalg.map.linear_transformation_2d.md)): la lámina, las clavijas, la matriz como par de llegadas y el producto `Av⃗`. Se usa entero, incluido el estado de la lámina aplastada, que allá era una curiosidad y acá es el caso central.
- `alg.sys.two_by_two` (nodo [16](16-alg.sys.two_by_two.md)): dos balanzas comparten cajas. Se usan el libro de dos filas, la llave que las abraza, la alineación en columnas y la idea de que las dos condiciones valen a la vez. Es lo que permite que `Ax⃗ = b⃗` se lea como algo ya conocido y no como notación nueva.
- `alg.fn.inverse_function` (nodo [21](21-alg.fn.inverse_function.md)): la máquina al revés. Se usan el exponente `−1` como nombre de la vuelta, la condición de que una máquina que manda dos entradas a la misma salida no se puede dar vuelta, y la verificación de que la vuelta devuelve la entrada.

La arista que no sigue el orden escolar es la del nodo 16. La escuela resuelve sistemas por eliminación y recién después menciona la matriz inversa. [C0](../../C-knowledge-graph/C0-esquema.md) invierte ese orden y deja `linalg.sys.row_operations` para después, porque la eliminación es un procedimiento y la inversa es el significado: qué punto fue a parar acá.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar una fórmula de dos por dos. Son cinco capacidades:

1. **Dar vuelta la pregunta.** Pasar de "adónde va este punto" a "de dónde vino este punto" es el giro entero del nodo, y es la primitiva `invert` en su forma más pura.
2. **Ver `A⁻¹` como un objeto del mismo tipo que `A`.** No es una cuenta ni una fórmula: es otra deformación, con sus dos clavijas y su lámina. Es la llave, y esta es la segunda vez que la llave regresa en la espina ([E0](../../E-mecanicas/E0-catalogo.md)).
3. **Reconocer cuándo no hay llave.** Si la lámina quedó aplastada contra una línea, muchos puntos distintos cayeron en el mismo lugar y la mayoría de los puntos no recibió a nadie. Es el candado `×0` del nodo [13](13-alg.eq.one_step.md) crecido, y ahora tiene una condición numérica.
4. **Aplicar la llave a los dos lados.** `A⁻¹Ax⃗ = A⁻¹b⃗` no es una manipulación simbólica: es la balanza del nodo 11 sosteniendo una igualdad entre vectores.
5. **Deshacer en el orden inverso.** Dos estiramientos seguidos se deshacen empezando por el último. Es `matrix_multiplication_commutes` en su forma más costosa.

## 4. Problema intuitivo

La misma lámina del nodo anterior, pero ya estirada por otra persona. La casa quedó torcida y la esquina marcada está sobre un punto del tablero. Nadie vio el estiramiento.

En `intuition` la escena se detiene con la casa torcida y un fantasma de la casa original al costado. Tres desenlaces dibujados: alguien tira en sentido contrario y la casa vuelve exacta; tira de más y se pasa para el otro lado; tira de una sola clavija y queda a medio arreglar. El jugador elige y después ve. Enseguida aparece una segunda lámina, aplastada hasta ser una línea, y la pregunta cambia sola: a esta, ¿cómo se la devuelve?

## 5. Analogía del mundo real

`rubber_grid_undo_stretch`, "Devolver la lámina a su forma", con la mecánica `grid_stretch` ([G0](../../G-analogias/G0-reglas.md)). Mapa de estructura: tirar de la lámina hacia atrás → matriz inversa; encontrar de dónde salió un punto → resolver un sistema; lámina aplastada hasta una línea → matriz singular; área del sello de la casa → determinante; lámina dada vuelta → determinante negativo; lámina aplastada que no se puede desplegar → no hay inversa.

Invariante: la llave devuelve exactamente lo que había. La lámina vuelve a coincidir con su fantasma y la casa recupera su forma, no una parecida.

Punto de ruptura: `more_than_two_dimensions`. Una lámina es una superficie y no puede mostrar lo que pasa en tres o más dimensiones, donde el aplastamiento tiene grados. La analogía se retira en `formal`, cuando el criterio numérico ya reemplaza a la mirada.

El área del sello aparece en el mapa de la analogía pero pertenece a `linalg.map.determinant_as_area`. Acá el número `ad − bc` entra solo como la condición que separa las láminas con vuelta de las aplastadas, sin nombrarlo determinante y sin explicar por qué mide un área.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas y cada una aporta una cosa. `grid_stretch` sostiene la lámina y su fantasma. `chest_key` aporta el llavero: cada llave es una laminita con dos clavijas dibujadas, una deformación candidata. `balance` aporta la otra mitad, la de aplicar la llave a los dos lados de una igualdad. Se encuentran en un gesto único: arrastrar una llave sobre la lámina la deshace, y arrastrar la misma llave sobre el `=` la aplica a los dos lados ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `pinch`.

1. La lámina ya deformada, con la casa torcida, la esquina marcada y el fantasma de la grilla original debajo. Abajo, un llavero con tres o cuatro laminitas.
2. Demostración: una mano fantasma toma la laminita cuyas dos clavijas devuelven las clavijas de la lámina a su lugar, la arrastra sobre la lámina y suelta. La grilla se desenrolla, coincide con el fantasma, la casa recupera su forma y la esquina marcada se desliza hasta su punto de origen, que queda iluminado.
3. El jugador arrastra una llave. La deformación se aplica de verdad, sea cual sea. Con la llave equivocada la lámina se mueve y queda en otra posición, sin coincidir con el fantasma; la casa sigue torcida, de otra manera. El estado se conserva: el jugador puede aplicar otra llave encima y ver que ahora hay dos deformaciones apiladas.
4. Lámina aplastada: el llavero aparece con una ranura hueca en vez de una llave. Ninguna laminita despliega la línea. Al tocar la línea, el juego muestra una recta entera de puntos de origen colapsando en un solo punto, y otro punto fuera de la línea que no recibió a nadie.
5. El lado de la balanza: la misma escena escrita como igualdad, con la matriz y la columna incógnita de un lado y la columna conocida del otro, sobre una línea que se inclina. Soltar la llave sobre el `=` la aplica a los dos lados. Soltarla sobre un solo lado inclina la línea, igual que en el nodo 13.
6. Verificación: tocar la casa recuperada devuelve el estiramiento original y la esquina vuelve a caer exactamente sobre el punto marcado.

Nada se llama incorrecto. Cada llave hace algo visible y distinto, y la lámina siempre queda en un estado válido desde el cual seguir.

## 7. Representación visual

Capa `visual`, primitiva dominante `invert`, con `deform` e `invariant` de apoyo ([H](../../H-progresion-abstraccion.md)).

Vuelve el diagrama vertical de la primera llave, ahora con láminas: arriba la grilla original, una flecha hacia abajo con el dibujo de la deformación, abajo la grilla deformada. La llave es la misma flecha reproducida hacia atrás, y solo cierra el ciclo si la grilla de abajo vuelve a coincidir con la de arriba. El fantasma es el objeto que decide: mientras no coincida, la vuelta no está completa.

Del lado de la balanza, la línea con la igualdad hereda del nodo 16 la alineación en columnas y la inclinación como respuesta a un movimiento incompleto. Las dos superficies comparten estado: mover la lámina mueve la escritura y viceversa.

Todavía no hay fórmula de la inversa: sus entradas aparecen porque el jugador las construyó arrastrando clavijas, y la fórmula llega en la capa simbólica, cuando construirlas a mano se vuelve lento.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Fantasma → identidad.** La primera vez que la lámina vuelve a coincidir con su fantasma, las dos clavijas quedan en su lugar de origen y sus dos columnas se escriben con el corchete del nodo 32. Nace `I`, que es la matriz de no hacer nada.
2. **Laminita → `A⁻¹`.** La llave que funcionó pierde el dibujo y gana etiqueta: la misma letra de la lámina con un `−1` chiquito arriba, heredado del nodo 21. La forma de sus dos clavijas queda un rato como sombra detrás.
3. **Filas → `Ax⃗ = b⃗`.** Del lado de la balanza, las dos filas del libro de frutas, que desde el nodo 16 ya están escritas con letras, deslizan sus coeficientes dentro de un corchete alto, los totales se apilan en una columna y las incógnitas en otra. La llave del sistema se contrae y queda `Ax⃗ = b⃗`. Es la etapa 4 del ejemplo de frutas de [H](../../H-progresion-abstraccion.md) ocurriendo en pantalla: nada se calcula, solo se reordena lo que ya estaba escrito, y el jugador ve que `A` es la parte que no cambia si cambian los totales.
4. **Llave sobre el `=` → los dos lados.** Al soltar la llave sobre el igual, `A⁻¹` se escribe a la izquierda de los dos lados a la vez, respetando el lugar: `A⁻¹Ax⃗ = A⁻¹b⃗`.
5. **`A⁻¹A` → `I` → nada.** El par se contrae en `I` cuando la lámina coincide con el fantasma, y `I` se desvanece con un morph porque no hace nada. Queda `x⃗ = A⁻¹b⃗`, que es la entrada `cs.linalg.solve_ax_equals_b`. La fórmula de las entradas de `A⁻¹` aparece después, como atajo, con el número `ad − bc` iluminado en el denominador.

## 9. Notación matemática

Quedan `A⁻¹`, la matriz identidad, la igualdad `Ax⃗ = b⃗` y su solución `x⃗ = A⁻¹b⃗`.

El exponente `−1` no es nuevo: nació en el nodo 21 para nombrar la máquina al revés. Lo nuevo es a quién se le aplica, y es un salto que hay que decir en voz alta: acá `A⁻¹` nombra una deformación, un objeto que se puede dibujar. El problema que lo hace necesario aparece en el paso 2, cuando el jugador consigue devolver la lámina y quiere repetirlo mañana o pasarle la llave a otro: arrastrar clavijas no se puede escribir.

**`I`** nace en el paso 1 por un problema distinto: después de aplicar la llave hace falta escribir qué quedó, y "nada" no se escribe. Sin ella el renglón `A⁻¹Ax⃗` no se puede simplificar a la vista.

**`Ax⃗ = b⃗`** es una convención de escritura, no un símbolo: es el libro de frutas compactado. Se vuelve necesaria en cuanto hay que aplicar una sola cosa a los dos lados, porque con dos filas separadas hay que aplicarla cuatro veces y el gesto se pierde.

## 10. Definición formal

Capa `formal`: texto corto con voz y la lámina fantasma al lado, de a una frase. "La inversa de `A` es la deformación que deshace `A`, la única que cumple `A⁻¹A = I`." "Existe si, y solo si, las dos columnas de `A` no están sobre la misma recta por el origen, es decir, si `ad − bc` no es cero." "Cuando existe, el sistema `Ax⃗ = b⃗` tiene exactamente una solución, y es `x⃗ = A⁻¹b⃗`."

Condiciones y casos especiales, verificados sobre el objeto: si `ad − bc` es cero y `b⃗` cae sobre la línea aplastada, hay infinitos puntos de origen, toda una recta; si cae fuera, no hay ninguno. La identidad es su propia inversa. Una reflexión también. Deshacer dos deformaciones seguidas se hace en el orden contrario.

Ya jugado: las tres frases enteras y los dos casos del aplastamiento. Nuevo: la unicidad de la inversa, la condición escrita con `ad − bc` y la fórmula `cs.linalg.inverse_2x2`.

## 11. Propiedades

- **La llave devuelve lo original.** `A⁻¹(Av⃗) = v⃗`. Ligada a la casa que recupera su forma. Es la propiedad del nodo 21 con láminas en lugar de máquinas.
- **Aplicar la misma deformación a los dos lados conserva la igualdad.** Ligada a la línea que se inclina cuando la llave pasa por un solo lado.
- **No toda deformación tiene llave.** Ligada a la ranura hueca del llavero y a la recta de orígenes que colapsa en un punto.
- **Deshacer dos estiramientos se hace al revés.** `(AB)⁻¹ = B⁻¹A⁻¹`. Ligada a desenrollar dos láminas apiladas empezando por la de arriba.
- **Resolver un sistema es preguntar de dónde vino un punto.** Ligada a la esquina que se desliza a su origen mientras las dos filas del libro se satisfacen a la vez.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: la lámina deformada y cuatro laminitas en el llavero; tocar la que deshace exactamente la deformación mostrada. Los distractores deshacen una sola clavija, deshacen de más y deshacen la deformación equivocada.
- `explain`: la lámina aplastada. Tres animaciones intentan desplegarla: una tira de la línea hacia arriba y la casa no vuelve porque toda una recta de puntos ya se fusionó; otra la despliega hacia un lado y aparecen puntos que no venían de ningún lado; otra recorre la recta de orígenes que colapsó. Tocar la que muestra por qué no se puede, y narrarla con la voz.
- `manipulate`: tirar de las clavijas hacia atrás hasta que la casa vuelva a su lugar y leer la matriz inversa que quedó escrita.
- `apply`: dado el punto donde cayó la esquina, encontrar de dónde salió sin probar al azar. Cuatro instancias seguidas, contra el tiempo objetivo del nodo, con la lámina como fantasma.
- `generalize`: explicar con la lámina por qué dos ecuaciones con dos incógnitas son la misma pregunta que deshacer una deformación. El jugador arma el sistema a partir de la lámina y después la lámina a partir del sistema.
- `transfer`: en el cofre con dos cerraduras de `csmath.gfx.transform_matrix`, elegir la llave que abre las dos a la vez, que es la inversa de la transformación aplicada a la imagen.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`wrong_inverse_choice`**, patrón `key_mismatch` sobre `chest_key`, que el nodo declara. Frente a una lámina estirada al doble de ancho, el jugador toma la que estira al doble de alto, o la que achica las dos direcciones a la mitad. La llave se aplica de verdad y la lámina no coincide con el fantasma. El juego marca las dos clavijas actuales y las dos del fantasma, y dibuja al lado del llavero la silueta hueca de la laminita que sí cierra, mostrando solo adónde tienen que volver las clavijas. Voz: "Esa lámina no devuelve la casa. ¿Adónde tienen que volver las dos clavijas?". Es la de mayor severidad del nodo y viene catalogada desde el nodo [12](12-prealg.inv.operation_as_key.md), así que se presenta como un regreso.
- **`matrix_multiplication_commutes`**, patrón `two_paths_diverge` sobre `grid_stretch`, que el nodo declara. Con dos deformaciones apiladas, el jugador deshace primero la que se aplicó primero. La pantalla se parte: en una mitad se desenrolla empezando por la última y la lámina coincide con el fantasma; en la otra se empieza por la primera y la casa termina torcida de una tercera manera. Las dos quedan en pantalla y el jugador elige. Voz: "Te pusieron una deformación y después otra. ¿Cuál sacás primero?".

Aplicar una llave válida que no simplifica, por ejemplo deshacer y volver a hacer, no rompe nada: recibe un empujón suave.

## 13. Generalización

La analogía se retira en `formal`. El retiro tiene un momento preciso: cuando el jugador decide si hay inversa mirando `ad − bc` en vez de mirar si la grilla quedó aplastada. Desde ahí la lámina se pide con un toque y después no vuelve. Es la etapa 6 del ejemplo de frutas de [H](../../H-progresion-abstraccion.md): los sistemas dejan de resolverse y pasan a interpretarse.

Variantes sin ayuda visual, en orden: matrices con entradas negativas; inversas con entradas fraccionarias; matrices singulares donde la respuesta correcta es que no hay llave, con la justificación; sistemas dados directamente como dos filas, sin lámina; el caso con `b⃗` sobre la línea aplastada, donde hay infinitas soluciones, contra el caso con `b⃗` afuera, donde no hay ninguna.

Vueltas que no son láminas. El nodo termina con acciones invertibles que no son geométricas: una mezcla de dos pinturas que hay que desandar, un cifrado que aplica dos transformaciones seguidas. El jugador identifica la llave, dice en qué orden se deshacen dos acciones apiladas y reconoce el caso sin vuelta, que siempre es el mismo: dos entradas distintas terminaron en la misma salida.

El nodo está en `abstract` cuando el jugador resuelve `Ax⃗ = b⃗` sin pedir lámina, decide de antemano si el sistema tiene una, ninguna o infinitas soluciones, y explica el aplastamiento sin dibujarlo.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `mvcalc.int.change_of_variables_jacobian`: cambiar de variables en una integral es deformar la región, y el factor que aparece es el mismo número que decide si la deformación tiene vuelta.
- `csmath.gfx.transform_matrix`: deshacer la transformación aplicada a una imagen para recuperar los píxeles originales, con el caso perdido cuando la transformación aplastó información.
- `adv.four.inverse_transform`: la transformada al revés, la misma llave sobre un objeto que ya no es una lámina.

Concepto siguiente: `linalg.sys.row_operations`. Frase puente, narrada sobre la última lámina devuelta: "Con dos filas la llave se arma a mano. Con cuatro no vas a poder dibujar la lámina. ¿Qué movimientos sobre las filas conservan las soluciones?". Las dos filas del libro se despegan de la lámina y quedan solas, y ese nodo empieza ahí.

Este nodo cierra la rama de álgebra lineal de la espina. Los cuatro nodos que la forman, del [30](30-linalg.vec.vector_as_displacement.md) al 33, van de la flecha en el mapa a la deformación con vuelta, y la espina sigue en `prob.basic.probability_as_proportion`. La rama continúa fuera de la espina en `linalg.sys.*`, `linalg.det.*`, `linalg.basis.*` y `linalg.eig.*`.

**Desafíos:** el nodo participa en `ch.linalg.undo_the_unknown_stretch` ([S](../../S-desafios/S0-desafios.md)), de nivel regional, donde la matriz no está dada y hay que reconstruirla a partir de dos pares de vectores con sus imágenes, decidir si se puede deshacer y recién después aplicar la llave. Requiere también `linalg.map.determinant_as_area`.

---

**Visualización:** tres escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `grid_scene_undo_stretch` es nativa y es la central: recibe la matriz, su inversa y el contorno de la casa, y muestra la lámina desenrollándose hasta coincidir con el fantasma, con el punto marcado deslizándose a su origen; gramática `invert`. Parametrizada con una inversa que no corresponde, produce las animaciones de `explain` y el replay de `wrong_inverse_choice`. `chest_scene_matrix_as_key` es nativa: el llavero de laminitas, la que entra y gira, la que se traba, y la ranura hueca cuando la lámina está aplastada; gramática `invert`. `balance_scene_two_equations_one_grid` es de ruta mixta: la pre-renderizada muestra las dos filas del libro compactándose en `Ax⃗ = b⃗` mientras la lámina hace lo mismo del otro lado, y la nativa corre sobre el estado del jugador con la llave cayendo sobre el `=`; gramática `invariant`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsan `grid_scene_rubber_sheet_house` (nodo 32) y `chest_wrong_key_stays_shut` (nodo 12).

**Calculadora:** en `ready` se habilitan dos operaciones ([M](../../M-calculadora/M0-progresion.md)). `op_matrix_inverse`, con ícono de llave sobre una grilla, muestra primero el número `ad − bc` y, si es cero, en lugar de un resultado dibuja la grilla aplastada. `op_solve_system`, que el jugador ya tiene desde el nodo 16, se reescribe: además de la secuencia de filas ofrece la lectura `x⃗ = A⁻¹b⃗` y el dibujo de la lámina con el punto de origen. Si el nodo decae, la llave del ícono se oxida.

**Edad universal:** el nodo es `icons` porque las entradas de las matrices y el número `ad − bc` aparecen como dígitos con signo ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: llaves por la forma de sus clavijas, lámina y fantasma, línea que se inclina, `explain` entre animaciones y prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition` y suele saber invertir una matriz de memoria sin saber qué significa; el nivel de la lámina aplastada no se le saltea nunca. Las frutas del nodo 16 no reaparecen: cuando este nodo empieza, el libro ya está escrito con letras.
