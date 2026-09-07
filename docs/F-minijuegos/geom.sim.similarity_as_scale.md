# El palo y su sombra (`geom.sim.similarity_as_scale`)

Minijuego del nodo 40 de la espina, "Semejante es a escala". Mecánica principal `grid_stretch`, secundarias `construct` y `tiles`; analogía `shadow_and_stick`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/40-geom.sim.similarity_as_scale.md): un concepto, cuatro dificultades reales (copia a escala frente a deformación, una sola razón para toda la figura, el área por el cuadrado del factor, el triángulo semejante escondido), una analogía con el mecanismo a la vista, un gesto (estirar en diagonal hasta que calce), cinco pasos de desvanecimiento, las dos figuras con rayos desde el centro como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un patio al sol. Un palo clavado proyecta su sombra; al lado, un árbol mucho más alto con su sombra mucho más larga. El sol se puede mover con el dedo y todas las sombras cambian a la vez.

Mapa objeto a concepto: altura del palo → un lado; largo de la sombra → el otro lado; el mismo sol para todos los palos → el mismo ángulo; palo más alto con sombra más larga → proporcionalidad; sombra dividida por altura → la razón; agrandar el dibujo entero → triángulos semejantes.

La sombra aporta el mecanismo: mientras el sol no se mueva, la razón entre altura y sombra es la misma para todos los palos del patio, y todos esos triángulos son copias a escala del mismo. La malla de goma aporta el gesto de escalar y muestra que los ángulos no se mueven. El trazo de `construct` aporta el triángulo semejante que no está dibujado. Las baldosas aportan el área. Punto de ruptura de la sombra: `angle_without_a_sun`, un triángulo semejante que no viene de una sombra no tiene sol al que apelar, y por eso la analogía se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la malla de goma con la figura en el centro, la figura objetivo en gris al lado, la regla del factor al costado, el patio con el sol en una banda inferior. Gestos: `pinch` y `drag` para la malla; `drag`, `tap` y `hold` para el trazo ([E0](../E-mecanicas/E0-catalogo.md)).

- **Estirar la malla con dos dedos en diagonal.** La figura crece en las dos direcciones a la vez y los ángulos no se mueven.
- **Estirar con un dedo fijo y otro horizontal.** La figura se ensancha, los ángulos se abren o se cierran, y el contorno gris deja de coincidir por más que se ajuste el tamaño.
- **Hacer calzar la figura sobre la gris.** La malla chasquea y la regla muestra el factor: cuántas veces se estiró. Es el único número de la pantalla en los primeros niveles.
- **Tocar dos lados que se corresponden.** Se ponen uno debajo del otro con su razón a la vista. Tocar otro par la apila debajo, y todas dan lo mismo.
- **Tocar una figura.** Se llena de baldosas del mismo tamaño que las de la otra. Las dos cuentas quedan a la vista al mismo tiempo.
- **Arrastrar una paralela.** Sobre un triángulo, arrastrar desde un punto de un lado en la dirección de otro. Si queda paralela, se fija y el triángulo recortado se colorea; si queda torcida, se desvanece.
- **Levantar el triángulo recortado.** Con el dedo sostenido, se despega y se puede superponer sobre el grande para ver que los ángulos coinciden.
- **Mover el sol.** Todas las sombras cambian juntas y la razón que muestra la regla cambia con ellas, igual para todos los palos.

En `symbolic` la superficie cambia de forma, no de reglas: las figuras quedan como contornos con letras, la ficha de factor con su flecha entre las dos, y la malla se pide tocando un contorno y aparece como fantasma.

## Invariante matemático

`lines_stay_lines_origin_fixed`: la malla deforma y las rectas siguen siendo rectas, con el centro de la escala fijo. Cuando el estiramiento es igual en las dos direcciones, los ángulos también se conservan y la figura es una copia a escala. Se ve romperse cuando el jugador estira en una sola dirección: las rectas siguen siendo rectas, pero los ángulos se abren y el contorno gris nunca calza.

El invariante de `construct` es el de apoyo: `construction_reveals_not_changes`. La paralela no cambia el triángulo; hace visible uno que ya estaba adentro. El de `tiles`, `area_preserved_under_rearrangement`, sostiene el resultado del área: las baldosas se cuentan sin que importe cómo se acomoden, y por eso la comparación entre las dos figuras es honesta.

Un movimiento válido pero inútil, como estirar en diagonal más allá del objetivo y volver, o comprobar la razón en cinco pares de lados en vez de dos, no rompe ningún invariante. Recibe un empujón suave: la regla del factor late una vez.

## Representación visual

Primitiva dominante `scale`, de apoyo `deform` e `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el patio con el palo, el árbol y las dos sombras. Se clavan palos y se predice.
- `concrete`: malla de goma con textura, figura encima, contorno gris al lado, regla del factor. Nada escrito salvo el número de la regla.
- `visual`: la textura de goma se va y queda la cuadrícula con el centro marcado y rayos punteados desde el centro por los vértices que se corresponden. Al trazar la paralela, el antes y el después se muestran con los tres ángulos marcados iguales en los dos. Las baldosas aparecen solo al tocar una figura, y siempre en las dos a la vez.
- `symbolic`: contornos con letras en los vértices, fichas de razón apiladas, ficha de factor con flecha, y el signo de semejanza en el renglón.
- `formal`: las tres frases con voz y las dos figuras con sus rayos al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables. Los dos últimos pasos del desvanecimiento de la mecánica, las flechas de base y la notación matricial, no se usan acá: llegan en `linalg.map.linear_transformation_2d`.

1. Malla de goma → cuadrícula: al hacer calzar la figura por tercera vez en `visual`, la textura desaparece y quedan las líneas con el centro marcado.
2. Regla → ficha de factor: el número de la regla se despega y cae entre las dos figuras como ficha, con una flechita que va de la chica a la grande y dice en qué dirección se aplica.
3. Par de lados → razón: al tocar dos lados que se corresponden, se enderezan uno sobre otro y se contraen en `6/4`, que se simplifica sola hasta el factor. El par siguiente se apila debajo y una línea iguala las dos.
4. Figuras → nombres y semejanza: los vértices se marcan con letras, el par de figuras se contrae en un renglón con el signo de semejanza entre los dos nombres, y las figuras se aclaran hasta ser contornos.
5. Baldosas → factor al cuadrado: al contar las dos figuras, sus cuentas se acercan y su razón aparece como ficha junto a la de los lados; la ficha de lados se copia a sí misma y las dos copias se multiplican con un morph hasta quedar `3²` sobre la ficha del área.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre las dos figuras con sus rayos: dos figuras son semejantes cuando tienen los mismos ángulos y sus lados que se corresponden están todos en la misma razón; esa razón es el factor de escala; si los lados se multiplican por un factor, el área se multiplica por ese factor multiplicado por sí mismo. Casos: en triángulos alcanza con dos ángulos iguales, porque el tercero queda determinado, y en otras figuras no alcanza; un factor de 1 da figuras congruentes; un factor menor que 1 achica y sigue siendo semejanza; una paralela a un lado de un triángulo recorta un triángulo semejante al original. Propiedades: los ángulos no cambian al escalar, todos los pares de lados dan la misma razón, el área escala con el cuadrado, y la semejanza se compone. Símbolo nuevo: la razón de semejanza con su flecha, necesaria desde el momento en que dos pares de lados dan la misma fracción y hace falta un nombre para eso que las dos figuras comparten; junto con ella llega el signo de semejanza, que dice misma forma sin decir iguales.

## Generalización

La sombra se retira en `symbolic`, cuando la razón se escribe como fracción entre dos lados y ya no hace falta el sol para justificarla. La malla se queda como fantasma a demanda hasta `formal`, porque es la que explica por qué los ángulos no se mueven.

Variantes sin ayuda visual: factores no enteros; factores menores que 1; figuras con distinta orientación, donde hay que emparejar los lados antes de dividir; triángulos dados solo por dos ángulos iguales; el factor de área dado y el de lados pedido, que obliga a volver hacia atrás; y figuras compuestas donde la parte semejante hay que aislarla. Cuando el jugador declara dos triángulos semejantes por sus ángulos, calcula un lado sin la malla y predice el área sin contar baldosas explicando el cuadrado con las filas y columnas nuevas, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Palos y sombras.** `real` y `concrete`, `recognize`. Clavar palos de distinto largo bajo el mismo sol y ver que todos dan la misma razón. Sin números.
2. **Hacer calzar.** `concrete`, `manipulate`. La malla y el contorno gris. Estirar en diagonal hasta el chasquido; aparece la regla del factor con enteros de 2 y 3.
3. **Estirar torcido.** `concrete`, `explain` y `recognize`. Se habilita el estiramiento en una sola dirección. Distractores de figura ensanchada. Aparecen los ángulos marcados.
4. **Todos los lados.** `visual`, `manipulate` y `apply`. Cuadrícula con rayos desde el centro; tocar pares de lados y ver que la razón se repite. Factores enteros y un lado desconocido.
5. **Baldosas en las dos.** `visual` y primera mitad de `symbolic`, `explain` y `generalize`. El nivel del área: llenar las dos figuras y contar. Aparece la ficha con el factor al cuadrado.
6. **La paralela.** `symbolic`, `manipulate` y `apply`. El trazo que recorta el triángulo semejante, y el triángulo recortado que se levanta y se superpone. Parámetros: factores fraccionarios y figuras con distinta orientación.
7. **Solo los ángulos.** `formal` y `abstract`, `generalize`. Definición corta con voz; triángulos dados por dos ángulos iguales, sin malla, y el factor de área dado con el de lados pedido.

Qué endurece cada parámetro: el estiramiento en una dirección separa escala de deformación; el factor fraccionario rompe la lectura "más grande" y obliga a mirar la dirección de la flecha; la orientación distinta rompe el emparejamiento visual de lados y fuerza a usar los ángulos; el factor de área dado obliga a recorrer el cuadrado hacia atrás.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)), abiertos por conjunto de nodos: `ch.geom.parallel_cut_missing_length` es el primero y usa exactamente el trazo del nivel 6, con ángulos entre paralelas y una longitud oculta; `ch.geom.altitude_hypotenuse_three_similar` combina este nodo con Pitágoras y la caza de datos ocultos, y es donde la altura a la hipotenusa produce tres triángulos semejantes de un solo trazo; `ch.geom.frustum_volume_by_extension` pide prolongar un tronco de cono hasta cerrar el cono original, que es semejanza aplicada a un sólido. Más lejos, el nodo reaparece en `ch.calc.cylinder_inside_a_cone`, donde la razón entre radio y altura sale de dos triángulos semejantes antes de derivar nada.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro figuras junto a la original. Tocar las que son copias a escala. Los distractores son la misma figura ensanchada en una dirección, la misma girada y escalada, que sí es semejante, y una con un lado bien y otro mal.
- `explain`: tres animaciones sobre la misma figura: la malla estirada en diagonal, con los ángulos quietos; la horizontal, con los ángulos abriéndose; la diagonal con la cuadrícula visible, donde las líneas siguen siendo líneas. Tocar la que muestra por qué los ángulos no cambian aunque los lados sí. El distractor elegido clasifica.
- `manipulate`: ajustar la malla hasta que la figura chica coincida con la grande y leer el factor. Después, trazar una paralela a un lado de un triángulo, levantar el triángulo recortado y superponerlo.
- `apply`: dos triángulos semejantes con un lado desconocido; armar con fichas su longitud a partir del factor, contra el tiempo objetivo del nodo. En `symbolic` la malla es fantasma.
- `generalize`: una figura ampliada por 3; predecir con baldosas cuántas veces creció su área. Después con factor 2, con 1 medio, y con una figura que no es rectángulo.
- `transfer`: con el palo y su sombra de `trig.ratio.similar_shadows`, armar la razón que permite calcular la altura de un árbol cuya sombra se conoce.

Misconceptions ([L0](../L-modelo-errores/L0-taxonomia.md)): el YAML declara `misconceptions: []`, pero el nodo hereda una y produce una candidata propia.

- `area_uses_slant_side`, patrón `missing_piece_tiles` sobre las baldosas, que están entre las mecánicas del nodo. Llega del nodo 38 y reaparece porque el triángulo recortado por una paralela casi nunca queda con un lado horizontal. El juego coloca las baldosas de la respuesta, superpone el triángulo verdadero y deja brillando la franja que sobra. Voz: "Estas baldosas se salen del triángulo. ¿Hasta dónde llega de verdad la altura?". Severidad 2.
- El área escalada por el factor y no por su cuadrado no tiene entrada en el catálogo, así que no dispara patrón. El juego ejecuta la respuesta: coloca en la figura grande la cantidad de baldosas que el jugador dijo y quedan filas enteras vacías. Voz: "Con esas baldosas queda piso sin cubrir. ¿Cuántas filas nuevas entraron, y cuánto más larga es cada fila?". El evento se registra con el estado previo y el nodo, que es el mecanismo de minería de estados erróneos de L0; es la candidata más clara del nodo y su regla `detect` se puede escribir sobre el par lado y área.

Los distractores de `explain` y las opciones de `apply` se generan desde la regla `detect` de `area_uses_slant_side`, las de los prerequisitos, y el grupo minado del área escalada.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `grid_scene_dilate_triangle`, nativa, parametrizada por los vértices, el centro y el factor. El triángulo se copia y crece desde el centro con un valor compartido, los rayos punteados salen del centro por los vértices y una llave sobre un lado muestra su medida cambiando en sincronía; gramática `scale`. Renderizada sobre el estado del jugador, produce también las animaciones de `explain` variando la dirección del estiramiento.
- `construction_scene_parallel_cut_similar`, nativa, parametrizada por los vértices y por dónde cae el corte. La paralela se traza, el triángulo recortado se colorea y se levanta como copia hasta superponerse sobre el grande, con los ángulos marcados iguales; gramática `invariant`. Abre el nivel 6 y es la imagen de cheatsheet de `cs.geom.strategy_parallel_cuts_similar_triangle`.
- Las dos son `text_free`: los números y las letras de los vértices los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_scale_pair`: `shape` (triángulo, cuadrilátero, figura de cinco lados); `factor` (enteros 2 y 3 en los niveles 2 a 5, fraccionarios desde el 6, menores que 1 desde el 7); `direction`, que decide si la ficha va de la chica a la grande o al revés; `orientation_shift`, el giro de la copia; `hidden_side`, cuál lado se pide; `seed`.
- `gen_shadow_scene`: alturas de los palos, ángulo del sol, y cuál de las cuatro medidas se oculta.
- `gen_parallel_cut`: vértices del triángulo, en qué fracción del lado cae el corte, y si el dato desconocido está en el triángulo chico o en el grande.
- `gen_area_scale_item`: factor de lados y qué se pide, el área de la copia o el factor de lados a partir del de área.
- `gen_stretch_distractor`: figuras deformadas en una sola dirección, con la razón de un par de lados coincidiendo a propósito para que el distractor exija mirar más de un par.

**Literacy soportada:** de `icons` a `full_text`. El mínimo es `icons` y no `none` porque desde el segundo nivel la regla muestra un número y desde el cuarto las razones se escriben como fracción; sin cifras, comprobar que todos los pares dan lo mismo no se puede jugar. Todo lo demás va sin leer: estirar con dos dedos, hacer calzar el contorno, tocar pares de lados, trazar la paralela, contar baldosas, y `explain` entre animaciones. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma apoya dos dedos sobre la malla y estira en diagonal hasta que el contorno gris calza y la malla chasquea. La escena vuelve al inicio y la figura late. Se repite solo si el jugador se queda quieto. La demostración de la paralela es aparte y se hace una vez en el nivel 6: la mano arrastra desde un punto del lado siguiendo la dirección del otro y suelta ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
