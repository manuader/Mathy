# 40 — Semejante es a escala (`geom.sim.similarity_as_scale`)

> Locale `es`: "Semejante es a escala". Minijuego: [El palo y su sombra](../../F-minijuegos/geom.sim.similarity_as_scale.md).

**Nodo:** `geom.sim.similarity_as_scale` · **Área:** geom · **Nivel:** 2 · **Primitiva:** `scale` · **Mecánica principal:** `grid_stretch` (secundarias `construct` y `tiles`) · **Literacy:** `icons` · **Analogía:** `shadow_and_stick`

## 1. Concepto

Dos figuras son semejantes cuando una es una copia a escala de la otra: los ángulos son los mismos y todos los lados crecieron en la misma proporción. Al terminar, el jugador encuentra el factor de escala entre dos figuras, calcula un lado que no está dado usando ese factor, traza una paralela a un lado de un triángulo para hacer aparecer un triángulo semejante escondido, y sabe que si los lados crecen por 3, el área crece por 9. Antes sabía estirar una figura; no sabía cuándo dos figuras dadas son la misma figura en otro tamaño.

## 2. Prerequisitos

- `geom.area.rect_and_triangle` (nodo 38): el área como baldosas que llenan. Se usa entera y es lo que permite el resultado central del nodo, que el área escala con el cuadrado del factor: la figura ampliada se vuelve a cubrir con las mismas baldosas y se cuentan. Sin baldosas, "el área crece por 9" es una fórmula prestada. También viene de acá `area_uses_slant_side`, que reaparece cuando el triángulo semejante está inclinado.
- `arith.frac.parts_and_ratio` (nodo 08): la fracción como razón entre dos cantidades. Se usa para que el factor de escala sea un objeto y no una cuenta: 3 medios es la razón entre el lado grande y el chico, y es la misma para todos los pares de lados. De acá viene también la lectura de dos razones iguales, que es la proporción.

La arista con el área no es la del orden escolar, donde la semejanza se enseña como capítulo de triángulos, antes o después del área sin conexión. [C0](../../C-knowledge-graph/C0-esquema.md) la fija porque el resultado que hace útil la semejanza en los desafíos es el del área, no el de los lados.

## 3. Dificultad cognitiva real

Lo difícil no es hacer una regla de tres. Son cuatro capacidades:

1. **Distinguir copia a escala de deformación cualquiera.** Estirar solo el ancho también cambia el tamaño y no es semejanza. Hasta que el jugador vea los ángulos cambiar, "más grande" y "a escala" son lo mismo.
2. **Una sola razón para toda la figura.** El factor no es de un lado: es de la figura. Comprobarlo en un par de lados y suponerlo en el resto es lo que hace que la semejanza parezca magia.
3. **El área escala con el cuadrado del factor.** Es contraintuitivo y es el punto donde la intuición de proporción falla. El jugador que ya domina proporciones lineales es justamente el que responde 3.
4. **Ver el triángulo semejante que no está dibujado.** Una paralela a un lado recorta un triángulo semejante al original. Ese triángulo hay que hacerlo aparecer con un trazo, y es la herramienta más usada en los desafíos de geometría.

Ninguna de las cuatro tiene misconception catalogada en el YAML todavía (sección 12).

## 4. Problema intuitivo

Un patio al sol. Un palo clavado en el suelo proyecta su sombra. Al lado, un árbol mucho más alto, con su sombra mucho más larga. La pregunta, por gesto: ¿cuánto mide el árbol, si al árbol no se lo puede medir?

En `real` el jugador clava palos de distinto largo y ve las sombras estirarse todas al mismo sol. En `intuition` la escena se detiene con el palo, su sombra, y la sombra del árbol medida en el piso. Tres desenlaces dibujados: el árbol mide lo mismo que su sombra; el árbol es al palo lo que la sombra del árbol es a la sombra del palo; el árbol mide la sombra del palo más la diferencia de sombras. El jugador elige y después ve: el palo se agranda hasta que su sombra tapa la del árbol, y su punta queda a la altura del árbol.

## 5. Analogía del mundo real

`shadow_and_stick` (mecánica `grid_stretch`), la del YAML ([G0](../../G-analogias/G0-reglas.md)).

Mapa: altura del palo → un lado; largo de la sombra → el otro lado; el mismo sol para todos los palos → el mismo ángulo; palo más alto, sombra más larga → proporcionalidad; sombra dividida por altura → la razón, que en el nodo 44 será la tangente; agrandar el dibujo entero → triángulos semejantes.

Invariante que conserva: mientras el sol no se mueva, la razón entre altura y sombra es la misma para todos los palos del patio. Un palo y su sombra forman un triángulo rectángulo, y todos esos triángulos son copias a escala del mismo.

Ruptura: `angle_without_a_sun`. El ángulo del sol es el que fija la razón, pero en el patio no hay forma de tocar el ángulo directamente: solo se lo mueve moviendo el sol. Un triángulo semejante que no venga de una sombra no tiene sol al que apelar. La analogía se retira en `symbolic`, cuando la razón se escribe y deja de necesitar el patio.

Por qué esta y no otra: la sombra es la única situación cotidiana donde la escala se ve como una relación entre dos cantidades medibles y no como una foto ampliada. Una foto ampliada muestra el resultado; la sombra muestra el mecanismo, porque el sol está a la vista y se puede mover.

## 6. Mecánica de juego

Primera capa jugable: `real`. `grid_stretch` es la principal, `construct` traza la paralela y `tiles` cuenta el área ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `pinch` y `drag` para la malla, `drag`, `tap` y `hold` para el trazo.

1. Una malla de goma con la figura chica dibujada encima y la figura grande en gris al lado. El jugador estira la malla con dos dedos.
2. Si estira con los dos dedos en diagonal, la figura crece en las dos direcciones a la vez y los ángulos no se mueven. Si estira con un dedo fijo y otro horizontal, la figura se ensancha, los ángulos se abren o se cierran y el contorno gris deja de coincidir por más que se ajuste el tamaño.
3. Cuando la figura estirada calza exactamente sobre la gris, la malla hace un chasquido y una regla al costado muestra el factor: la cantidad de veces que la malla se estiró. Es el único número de la pantalla.
4. Tocar dos lados que se corresponden los pone uno debajo del otro con su razón a la vista. Todos los pares dan el mismo número, y el jugador lo comprueba tocando pares distintos.
5. Baldosas: tocar la figura chica la llena de baldosas; el mismo gesto sobre la grande la llena con baldosas del mismo tamaño. La cuenta de la grande no es el factor por la de la chica y el jugador lo ve antes de que nadie lo diga.
6. Paralela: sobre un triángulo, el jugador arrastra desde un punto de un lado en la dirección de otro lado. Si el trazo queda paralelo, se fija y el triángulo chico que recorta se colorea; si queda torcido, se desvanece. El triángulo recortado se puede levantar con `hold` y superponer sobre el grande.
7. Sombra: mover el sol cambia todas las sombras a la vez, y la razón que muestra la regla cambia con él, igual para todos los palos.

Nada se llama error. Estirar en una sola dirección no está prohibido: se hace, y el contorno gris no calza nunca. Esa es la explicación.

## 7. Representación visual

Capa `visual`, primitiva `scale` dominante ([H](../../H-progresion-abstraccion.md)).

`scale`: la figura y su copia se dibujan sobre la misma cuadrícula, con un centro marcado y rayos punteados desde el centro por los vértices que se corresponden. Se escala la figura, se conservan los ángulos y las direcciones de los lados. El factor se muestra en la regla, no sobre los lados.

`deform` de apoyo, por la mecánica de la malla: la cuadrícula se estira y las líneas siguen siendo líneas. Es el invariante `lines_stay_lines_origin_fixed`, y acá el origen fijo es el centro de la escala.

`invariant` de apoyo, por `construct`: al trazar la paralela, el juego muestra el triángulo antes y después con los tres ángulos marcados iguales en los dos. El trazo revela un triángulo que ya estaba.

Las baldosas se muestran solo cuando el jugador toca una figura para contarla, y siempre en las dos figuras a la vez para que la comparación sea visible.

Todavía no hay razones escritas como fracción sobre los lados, ni el símbolo de semejanza, ni el factor elevado al cuadrado: hay una regla con un número y dos figuras que calzan o no.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto. Siguen el desvanecimiento de la mecánica hasta las líneas de la cuadrícula; los dos últimos pasos del desvanecimiento de `grid_stretch`, las flechas de base y la notación matricial, no se usan en este nodo y llegan en `linalg.map.linear_transformation_2d`.

1. **Malla de goma → cuadrícula.** Al hacer calzar la figura por tercera vez en `visual`, la textura de goma desaparece y quedan las líneas de la cuadrícula con el centro marcado.
2. **Regla → ficha de factor.** El número de la regla se despega y cae como ficha entre las dos figuras, con una flechita que va de la chica a la grande. La flecha dice en qué dirección se aplica; sin ella, el factor y su inverso se confunden.
3. **Par de lados → razón.** Al tocar dos lados que se corresponden, los dos se enderezan uno sobre otro y se contraen en una fracción, `6/4`, que se simplifica sola hasta el factor. Al tocar otro par, la fracción nueva se apila debajo de la anterior y las dos se igualan con una línea que las une.
4. **Figuras → nombres y semejanza.** Los vértices se marcan con letras y el par de figuras se contrae en un renglón con el signo de semejanza entre los dos nombres. Las figuras se aclaran hasta ser contornos.
5. **Baldosas → factor al cuadrado.** Al contar las dos figuras con baldosas, las dos cuentas se acercan y su razón aparece como ficha junto a la de los lados. La ficha de lados se copia a sí misma y las dos copias se multiplican con un morph: `3` y `3` quedan como `3²` sobre la ficha del área.

## 9. Notación matemática

Queda el signo de semejanza entre dos figuras, la razón de semejanza escrita como fracción o como número, y la relación entre las áreas.

El símbolo nuevo es **la razón de semejanza**, la ficha con flecha. Por la regla de oro de [H](../../H-progresion-abstraccion.md) llega con el problema que la hace necesaria, y ese problema aparece en el paso 3: cuando hay dos pares de lados y las dos fracciones dan lo mismo, hace falta un nombre para ese lo mismo, porque es lo único que las dos figuras comparten. Sin la razón, cada par de lados es una cuenta suelta y la figura no tiene ninguna propiedad. El signo de semejanza llega junto: cuando las figuras se aclaran hasta ser contornos y quedan solo los nombres, hace falta un símbolo que diga que son la misma forma, distinto de igual, que ya está tomado.

La flecha sobre la ficha es una convención de escritura y no se retira: el factor de la grande a la chica es el inverso, y sin dirección declarada la mitad de los ejercicios queda ambigua.

## 10. Definición formal

Capa `formal`: tres frases cortas con voz, con las dos figuras y los rayos punteados al lado.

"Dos figuras son semejantes cuando tienen los mismos ángulos y sus lados que se corresponden están todos en la misma razón." "Esa razón es el factor de escala." "Si los lados se multiplican por un factor, el área se multiplica por ese factor multiplicado por sí mismo."

Condiciones y casos especiales, verificados sobre el objeto: en triángulos alcanza con dos ángulos iguales para que sean semejantes, porque el tercero queda determinado; en otras figuras no alcanza y hace falta también la razón. Un factor de 1 da figuras congruentes. Un factor menor que 1 achica y sigue siendo semejanza. Una paralela a un lado de un triángulo recorta un triángulo semejante al original.

Ya jugado: las tres frases enteras y el caso de la paralela. Nuevo: que en triángulos dos ángulos alcanzan, y el nombre congruente para el factor 1.

## 11. Propiedades

- **Los ángulos no cambian al escalar.** Ligada a estirar la malla en diagonal y ver que las marcas de ángulo no se mueven, y a la figura que se ensancha en una sola dirección y deja de calzar.
- **Todos los pares de lados dan la misma razón.** Ligada a tocar pares distintos y ver que la fracción se simplifica siempre al mismo número.
- **El área escala con el cuadrado del factor.** Ligada a llenar las dos figuras con baldosas del mismo tamaño y contar. Es la propiedad que el nodo aporta a los desafíos y la que más se resiste.
- **Una paralela a un lado recorta un triángulo semejante.** Ligada al trazo que se fija cuando queda paralelo y al triángulo recortado que se levanta y calza sobre el grande.
- **La semejanza se compone.** Escalar por 2 y después por 3 es escalar por 6. Ligada a estirar la malla dos veces sin soltar.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias figuras estiradas de distintas maneras junto a la original. Tocar las que son copias a escala. Los distractores son la misma figura ensanchada en una dirección, la misma girada y escalada, que sí es semejante, y una con un lado bien y otro mal.
- `explain`: el jugador estira la malla con dos dedos y después elige entre animaciones sobre la misma figura: la diagonal, donde los ángulos no se mueven y los lados sí; la horizontal, donde los ángulos se abren; la diagonal con la cuadrícula visible, donde se ve que las líneas siguen siendo líneas. Toca la que muestra por qué los ángulos no cambian aunque los lados sí.
- `manipulate`: ajustar la malla hasta que la figura chica coincida con la grande y leer el factor en la regla. Después, trazar una paralela a un lado de un triángulo y comprobar que recorta un triángulo semejante levantándolo y superponiéndolo.
- `apply`: dos triángulos semejantes con un lado desconocido. Armar con fichas su longitud a partir del factor de escala, contra el tiempo objetivo del nodo. En `symbolic` la malla es fantasma.
- `generalize`: una figura ampliada por 3. Predecir, cubriéndola con baldosas, cuántas veces creció su área. Después con factor 2, con factor 1 medio, y con una figura que no es un rectángulo.
- `transfer`: con el palo y su sombra de `trig.ratio.similar_shadows`, armar la razón que permite calcular la altura de un árbol cuya sombra se conoce.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)):

El YAML declara `misconceptions: []`, pero el nodo hereda una de su prerequisito y produce una candidata propia:

- **`area_uses_slant_side`** (patrón `missing_piece_tiles`, mecánica `tiles`, que está entre las del nodo). Llega del nodo 38 y reaparece acá porque el triángulo semejante recortado por una paralela casi nunca queda con un lado horizontal: el jugador toma el lado inclinado del triángulo chico como altura. El juego coloca las baldosas de la respuesta, superpone el triángulo verdadero y deja brillando la franja que sobra. Voz: "Estas baldosas se salen del triángulo. ¿Hasta dónde llega de verdad la altura?". La línea punteada perpendicular está en la bandeja y el jugador la baja desde ahí. Severidad 2.
- **El área escala por el factor y no por su cuadrado.** No tiene entrada en el catálogo, así que no dispara patrón. El juego ejecuta la respuesta: coloca en la figura grande la cantidad de baldosas que el jugador dijo, y quedan filas enteras vacías. Voz: "Con esas baldosas queda piso sin cubrir. ¿Cuántas filas nuevas entraron, y cuánto más larga es cada fila?". El evento se registra con el estado previo y el nodo, que es el mecanismo de minería de estados erróneos de L0; es la candidata más clara del nodo y la regla `detect` se puede escribir sobre el par lado y área, así que probablemente se catalogue.

## 13. Generalización

La analogía se retira en `symbolic`, cuando la razón se escribe como fracción entre dos lados y ya no hace falta el sol para justificarla. La malla de goma se queda como fantasma a demanda hasta `formal`, porque es la que explica por qué los ángulos no se mueven.

Variantes sin ayuda visual, en orden: factores no enteros; factores menores que 1; figuras semejantes con distinta orientación, donde hay que emparejar los lados antes de dividir; triángulos dados solo por dos ángulos iguales, sin ningún lado en común a la vista; el factor de área dado y el de lados pedido, que obliga a volver hacia atrás; y figuras compuestas donde la parte semejante hay que aislarla.

El nodo está en `abstract` cuando el jugador declara dos triángulos semejantes a partir de sus ángulos, calcula un lado sin ver la malla, y predice el área de la copia sin contar baldosas, explicando el cuadrado con las filas y las columnas que se agregaron.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas y con otra mecánica:

- `trig.ratio.similar_shadows`: la razón entre dos lados de un triángulo rectángulo depende solo del ángulo. Es la sombra otra vez, con el sol convertido en el dato.
- `linalg.map.linear_transformation_2d`: la misma malla, ahora con transformaciones que no son solo escala. La semejanza se ve como el caso particular en el que las dos direcciones se estiran igual.
- `prealg.ratio.scaling_recipe`: una receta para 4 llevada a 10. El factor de escala aplicado a una lista de cantidades en vez de a una figura.
- `arith.frac.equivalent`: dos fracciones que valen lo mismo son dos pares de lados con la misma razón. El nodo devuelve a la aritmética una lectura geométrica de lo que ya sabía.

Concepto siguiente: `geom.trans.dilation`. Frase puente, narrada sobre la última figura con sus rayos punteados: "Las dos figuras calzan, pero una está acá y la otra allá. ¿Desde qué punto exacto crece la chica para caer justo encima de la grande?". Los rayos punteados se prolongan hacia atrás hasta cruzarse en un punto y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `grid_scene_dilate_triangle` es nativa, parametrizada por los vértices, el centro y el factor: el triángulo se copia y crece desde el centro con un valor compartido, los rayos punteados salen del centro por los vértices y una llave sobre un lado muestra su medida cambiando en sincronía; gramática `scale`. `construction_scene_parallel_cut_similar` también es nativa, parametrizada por los vértices y por dónde cae el corte: la paralela se traza, el triángulo recortado se colorea y se levanta como copia hasta superponerse sobre el grande, con los ángulos marcados iguales; gramática `invariant`. Las dos son `text_free`; los números y las letras de los vértices los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). La primera genera las animaciones de `explain` variando la dirección del estiramiento.

**Calculadora:** en `ready` se habilita `op_transform_point` ([M](../../M-calculadora/M0-progresion.md)), de nivel 1 y con caja de pruebas. Acá se presenta en sus dos formas útiles para el nodo: el factor de escala entre dos figuras, que se obtiene apoyando dos lados que se corresponden, y el lado que falta por razón, que toma tres medidas y devuelve la cuarta con la fracción escrita, no solo el resultado. El mismo `op_transform_point` lo comparten `geom.trans.rotation_reflection` y `geom.trans.dilation`, que le agregan el centro y el giro.

**Edad universal:** el nodo es `icons` y no `none` porque desde el segundo nivel la regla del factor muestra un número y las razones se escriben como fracción; sin cifras, comprobar que todos los pares dan lo mismo no se puede jugar ([Q](../../Q-edad-universal.md)). Todo lo demás va sin leer: estirar con dos dedos, hacer calzar el contorno, tocar pares de lados, trazar la paralela, contar baldosas, y `explain` entre animaciones. La instrucción es una mano fantasma que estira en diagonal hasta el chasquido. Un adulto llega por diagnóstico salteando `real` e `intuition`, empieza en la capa de cuadrícula con el factor a la vista, y lo que le cambia es que el nivel del área con baldosas no se saltea nunca: es el que corrige la intuición equivocada, y se juega igual a cualquier edad.
