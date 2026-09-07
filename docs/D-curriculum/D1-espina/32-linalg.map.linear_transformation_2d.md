# 32 — Matriz como grilla deformada (`linalg.map.linear_transformation_2d`)

> Locale `es`: "Matriz como grilla deformada". Minijuego: [La lámina y la casa](../../F-minijuegos/linalg.map.linear_transformation_2d.md).

**Nodo:** `linalg.map.linear_transformation_2d` · **Área:** linalg · **Nivel:** 6 · **Primitiva:** `deform` · **Mecánica principal:** `grid_stretch` (secundaria `machine_pipe`) · **Literacy:** `icons` · **Analogía:** `rubber_grid_with_house`

## 1. Concepto

Una transformación lineal del plano es un estiramiento parejo de una lámina elástica: las líneas de la grilla siguen rectas y equiespaciadas, y el centro queda clavado. Toda la deformación queda decidida por dónde caen las dos clavijas de la base, y esas dos llegadas, escritas una al lado de la otra, son la matriz. Al terminar, el jugador estira la lámina hasta que la casa dibujada coincide con un modelo, lee la matriz que aparece, y calcula adónde va a parar cualquier punto sin tocar la lámina. Antes escribía recetas con dos clases de paso fijas; ahora alguien le cambia las dos clases de paso a la vez y él sigue la receta.

## 2. Prerequisitos

- `linalg.vec.span_and_combination` (nodo [31](31-linalg.vec.span_and_combination.md)): la receta de dos clases de paso. Es el corazón del nodo: si un punto era tres pasos de A más dos de B, después del estiramiento sigue siendo tres pasos de la nueva A más dos de la nueva B. Los coeficientes no se tocan; los ingredientes sí. También se usa el caso alineado, que acá reaparece como la lámina aplastada.
- `alg.fn.function_as_machine` (nodo [17](17-alg.fn.function_as_machine.md)): la máquina con entrada y salida. Se usan el tubo, la regla que vive adentro y el invariante de que la misma entrada da siempre la misma salida, que es lo que convierte al estiramiento en una función y no en un accidente.

Ninguna arista sigue el orden escolar. La escuela introduce la matriz como una tabla de coeficientes de un sistema y la multiplicación como una regla de filas por columnas que hay que memorizar. [C0](../../C-knowledge-graph/C0-esquema.md) invierte el orden: acá la matriz nace como el registro de dos llegadas, la multiplicación por un vector nace como seguir la receta, y el sistema recién aparece en el nodo siguiente, cuando la pregunta se da vuelta.

## 3. Dificultad cognitiva real

Lo difícil no es multiplicar cuatro números por dos. Son cuatro capacidades:

1. **Aceptar que dos flechas deciden el destino de todo el plano.** Es la idea entera del nodo. El jugador tiene que ver que la lámina no puede hacer nada raro entre medio, porque la grilla la obliga.
2. **Distinguir "lineal" de "cualquier deformación".** Las líneas siguen rectas, los paralelos siguen paralelos, el clavo del centro no se mueve. Correr la lámina entera está prohibido y es el punto de ruptura de la analogía.
3. **Leer una matriz como dos llegadas y no como cuatro números sueltos.** El error de lectura más caro del área: quien ve una tabla busca filas, y las columnas son lo que significa.
4. **Descubrir que el orden importa.** Girar y después inclinar no deja la casa donde la deja inclinar y después girar. Es `matrix_multiplication_commutes`, y contradice todo lo que el jugador sabe de multiplicar desde el nodo 05.

## 4. Problema intuitivo

Una lámina elástica con una grilla impresa y una casita dibujada, clavada al tablero por el centro. Sobre la lámina hay dos clavijas: una a un paso a la derecha del clavo, otra a un paso hacia arriba.

En `intuition` la escena se detiene antes de soltar. Alguien tira de la clavija derecha hacia arriba y a la derecha. Tres desenlaces dibujados: la grilla se inclina con las líneas todavía rectas y la casa queda torcida; la grilla se curva como una tela mojada y la casa se abolla; la lámina entera se corre y el clavo se arranca. El jugador elige y después ve. Enseguida la escena repite el estiramiento tapando la casa, y la pregunta cambia sola: mirando solo dónde quedaron las dos clavijas, ¿se puede saber cómo quedó la casa?

## 5. Analogía del mundo real

`rubber_grid_with_house`, "La lámina elástica con una casa", con la mecánica `grid_stretch` ([G0](../../G-analogias/G0-reglas.md)). Mapa de estructura: lámina → plano; casa dibujada → figura a transformar; tirar parejo de la lámina → transformación lineal; líneas de la grilla que siguen rectas y equiespaciadas → linealidad; dónde caen las dos clavijas unitarias → columnas de la matriz; clavo del centro → origen fijo; estirar y volver a estirar → producto de matrices.

Invariante: cualquier punto de la lámina se mueve manteniendo su receta respecto de las dos clavijas. El punto que estaba a tres clavijas horizontales y dos verticales sigue estando a tres de la nueva horizontal y dos de la nueva vertical.

Punto de ruptura: `sliding_the_sheet`. Correr la lámina sin estirarla también deforma la escena en el sentido cotidiano, pero no es una transformación lineal, y el clavo del centro está justamente para impedirlo. Es una ruptura buena porque se puede jugar: el jugador intenta el gesto y el clavo lo frena. La analogía se retira recién en `formal`, más tarde que la mayoría, porque la lámina sigue explicando bien la linealidad cuando ya hay matrices escritas.

Por qué esta y no otra. Una fotocopiadora que agranda conserva la escala pero no la inclinación ni la reflexión. Un espejo deformante conserva la deformación pero rompe las rectas. La lámina clavada conserva las tres cosas que definen el concepto y hace evidente la única que no puede hacer.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `grid_stretch` es la principal y sostiene la lámina; `machine_pipe` es la secundaria y aparece desde el tercer nivel como el tubo que aplica la deformación a una flecha suelta ([E0](../../E-mecanicas/E0-catalogo.md)). Una provee la superficie y la otra provee la pregunta puntual: qué le pasa a este vector. Se encuentran cuando el jugador tira una flecha al tubo y ve, adentro, la misma receta de la lámina. Gestos: `drag`, `pinch` y `tap`.

1. La lámina con la grilla, la casa y las dos clavijas. Debajo, un fantasma tenue de la grilla original que nunca se mueve.
2. Demostración: una mano fantasma toma la clavija derecha y la arrastra. Toda la lámina la sigue, las líneas se mantienen rectas y equiespaciadas, la casa se inclina. La mano suelta, toma la otra clavija y repite.
3. El jugador arrastra las clavijas. La casa se deforma en vivo. Un modelo de la casa objetivo está dibujado al costado con relleno translúcido, y la casa real se le superpone cuando coincide.
4. El jugador intenta arrastrar la lámina desde el medio: el clavo la retiene y lo que consigue es estirarla desde el centro. La lámina nunca se corre.
5. El tubo: el jugador arrastra una flecha suelta a la boca del tubo. Adentro se ve la flecha descomponerse en su receta, las dos clavijas nuevas aparecer escaladas por esos coeficientes y encadenarse punta con cola. Por la otra boca sale la flecha imagen.
6. Dos deformaciones seguidas: hay dos láminas apiladas y el jugador elige cuál aplica primero. La casa pasa por las dos. Cambiar el orden es un gesto: tocar el par de láminas las intercambia y la casa se rehace.
7. Éxito: la casa coincide con el modelo y las dos llegadas quedan iluminadas. Sin cartel.

Nada se llama incorrecto. Una deformación que aplasta la casa contra una línea es un movimiento perfectamente ejecutable y el juego lo ejecuta: la casa desaparece en un segmento y el fantasma de la grilla queda como testigo. Ese estado no es un error acá; es la puerta al nodo siguiente.

## 7. Representación visual

Capa `visual`, primitiva dominante `deform`, con `compose` de apoyo en el tubo ([H](../../H-progresion-abstraccion.md)).

La lámina pierde la textura de goma y queda la grilla, con la grilla fantasma debajo en un tono apenas visible. Lo que se deforma es el retículo completo; lo que se conserva es la rectitud de las líneas, el paralelismo y el punto clavado. La casa queda como polígono de contorno, con una esquina marcada que es el punto que el juego pregunta.

Las dos clavijas se vuelven dos flechas de colores fijos ancladas en el origen, y su llegada se resalta con un destello cuando el jugador suelta. La escena central del nodo es esa: la grilla deformándose mientras las dos flechas viajan a su destino, y todas las demás flechas del plano acomodándose sin que nadie las toque.

Todavía no hay números en las llegadas. Aparecen en el paso 3 de la transición, cuando el jugador ya usó las clavijas para reconstruir una deformación.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Lámina → grilla.** Al reproducir por primera vez una deformación mirando solo dónde quedaron las clavijas, la textura elástica se desvanece y quedan la grilla y su fantasma. La casa se afina hasta ser contorno.
2. **Clavijas → nombres.** Las dos flechas de base se contraen en `î` y `ĵ`, y sus columnas de componentes, que el jugador ya escribe desde el nodo [30](30-linalg.vec.vector_as_displacement.md), quedan a un toque.
3. **Dos llegadas → matriz.** Cuando el jugador arrastró las dos clavijas y suelta la segunda, las dos columnas de llegada se deslizan una junto a la otra y un corchete alto crece abrazándolas. Nace `A`, con la primera columna del color de `î` y la segunda del color de `ĵ`.
4. **Tubo → producto.** Al tirar una flecha al tubo con la matriz ya escrita, `A` se escribe pegada al nombre de la flecha y del otro lado sale la columna de la salida: `Av⃗`.
5. **Dos láminas → orden.** Al aplicar la segunda deformación sobre la primera, su matriz se escribe a la izquierda de la anterior, y la lectura de derecha a izquierda queda marcada por una flecha fina que recorre la expresión en el orden en que la casa sintió los estiramientos. El producto todavía no se calcula: acá solo nace el orden.

## 9. Notación matemática

Queda la matriz de dos por dos como par de columnas encorchetadas, el producto `Av⃗` escrito por yuxtaposición y la escritura de dos deformaciones seguidas con la última a la izquierda.

El símbolo nuevo es **`A`, el corchete alrededor de dos columnas**. El problema que lo hace necesario aparece en el paso 3, y es de comunicación: después de reproducir una deformación mirando solo las dos llegadas, el jugador ya no necesita la lámina para saber qué pasó, pero si escribe las dos llegadas como dos columnas sueltas está escribiendo dos vectores, que es otra cosa. El corchete dice "estas dos juntas son una sola deformación". Que las columnas sean las llegadas de la base no es una definición arbitraria: es lo que el jugador ya hizo con las manos, y `cs.linalg.matrix_columns_are_basis_images` lo registra tal cual.

`Av⃗` tampoco es una convención libre. Nace en el paso 4 porque el jugador quiere preguntar dónde cae un punto sin arrastrar nada, y la yuxtaposición es la misma que ya usa desde el nodo 31 para escalar una flecha. La diferencia, que se dice en voz alta, es que acá lo de la izquierda no es un número sino una deformación.

## 10. Definición formal

Capa `formal`: texto corto con voz y la lámina fantasma al lado, de a una frase. "Una transformación lineal del plano es una regla que manda vectores a vectores respetando sumas y múltiplos." "Es lo mismo decir que las líneas de la grilla siguen rectas y equiespaciadas y que el origen no se mueve." "Su matriz tiene por columnas las llegadas de las dos flechas de la base."

Condiciones y casos especiales, verificados sobre el objeto: la identidad es la lámina sin estirar y su matriz tiene las clavijas en su lugar; una reflexión es la lámina dada vuelta y se ve porque las dos flechas invierten su orden de giro; una deformación que manda las dos clavijas a la misma línea aplasta el plano entero contra esa línea, y esa es la que no se puede deshacer; correr la lámina no es lineal porque mueve el origen.

Ya jugado: las tres frases enteras, la identidad, la reflexión y el aplastamiento. Nuevo: las palabras "transformación lineal" y "matriz", y el enunciado de que respetar sumas y múltiplos equivale a respetar la grilla.

## 11. Propiedades

- **Las columnas de `A` son las llegadas de `î` y `ĵ`.** Ligada a reconstruir la deformación mirando solo las dos clavijas.
- **`Av⃗` es la primera columna por la primera componente más la segunda columna por la segunda.** Ligada al interior del tubo, donde la receta se rearma con los ingredientes nuevos.
- **La receta se conserva.** `A(u⃗ + v⃗) = Au⃗ + Av⃗` y `A(kv⃗) = k·Av⃗`. Ligada a que los coeficientes del libro del nodo 31 no cambian cuando la lámina se estira.
- **Rectas a rectas, paralelas a paralelas, origen fijo.** Ligada al clavo y a la grilla que no se curva.
- **El orden importa.** Girar y después inclinar no es lo mismo que inclinar y después girar. Ligada al gesto de intercambiar las dos láminas y ver la casa terminar en otro lado.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: cuatro láminas ya estiradas; tocar la que fue deformada sin doblar ninguna línea. Los distractores curvan la grilla, la cortan o mueven el clavo.
- `explain`: la lámina con la casa tapada y solo las dos clavijas visibles. Tres animaciones reconstruyen la casa a partir de las llegadas: una respeta la receta de cada punto, otra escala las dos direcciones al revés, otra mueve la casa entera sin deformarla. Tocar la que sí reconstruye y narrar con la voz por qué alcanza con las dos clavijas.
- `manipulate`: estirar la lámina hasta que la casa quede como el modelo y leer la matriz que aparece.
- `apply`: con la matriz dada y la lámina quieta, ubicar dónde caerá la esquina marcada de la casa antes de soltar. Cuatro instancias seguidas, contra el tiempo objetivo del nodo.
- `generalize`: encontrar una deformación que mande la casa a una línea y explicar qué le pasó a la grilla. Sin lámina, eligiendo las dos columnas.
- `transfer`: con la misma lámina, girar la casa un cuarto de vuelta y leer qué números describen ese giro, que es la matriz de rotación de `trig.rot.rotation_matrix`.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`matrix_multiplication_commutes`**, patrón `two_paths_diverge` sobre `grid_stretch`, que este nodo declara. El jugador tiene que llevar la casa al modelo con un giro y una inclinación, y aplica las dos en el orden contrario, o escribe el producto invirtiendo los factores. La pantalla se parte en dos y la misma casa aparece en las dos mitades sobre láminas idénticas. A la izquierda gira y después se inclina; a la derecha se inclina y después gira. Las dos animaciones corren a la vez, con el modelo dibujado en translúcido sobre cada una, y las dos casas terminan en lugares distintos. Ninguna se marca como mala: las dos quedan en pantalla y el jugador elige cuál coincide con el modelo. Voz: "Los dos caminos usan las mismas dos deformaciones. ¿Por qué la casa no termina en el mismo lugar?". La severidad es alta porque el error viaja después a `linalg.map.compose_as_multiply` y a `linalg.map.inverse_and_systems`.

Aplastar la lámina contra una línea es válido y no dispara nada acá: es un estado legítimo, y el juego lo aprovecha para dejar planteada la pregunta que abre el nodo 33.

## 13. Generalización

La analogía se retira en `formal`, más tarde que otras, porque la lámina sigue diciendo algo verdadero cuando ya hay notación. El retiro es progresivo: primero desaparece la goma y queda la grilla, después la grilla se pide con un toque, y al final la casa se reemplaza por un par de puntos cualesquiera.

Variantes sin ayuda visual, en orden: entradas negativas, que son reflexiones; una columna múltiplo de la otra, que aplasta; la identidad; matrices dadas de entrada sin lámina, donde hay que predecir la figura; dos matrices y el mismo par de figuras en los dos órdenes.

Deformaciones que no son de un mapa. El nodo termina con transformaciones sobre objetos que no son geométricos: una mezcladora con dos diales que combina dos colores base, una tabla que convierte dos ingredientes en dos productos, la grilla de píxeles de `csmath.gfx.transform_matrix`. El jugador reconoce quiénes son las dos clavijas en cada caso, escribe la matriz y anticipa el efecto sobre una entrada.

El nodo está en `abstract` cuando el jugador escribe la matriz de una transformación descrita en palabras, calcula `Av⃗` sin dibujar y explica por qué el orden de dos transformaciones no se puede intercambiar.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `geom.trans.dilation`: agrandar una figura desde un centro es la deformación que manda las dos clavijas al mismo múltiplo, y la matriz queda con dos números iguales en la diagonal.
- `trig.rot.rotation_matrix`: girar es la deformación que manda las clavijas a dos puntos del círculo, y sus columnas son senos y cosenos.
- `csmath.gfx.transform_matrix`: la grilla de píxeles de una imagen deformada por la misma tabla de cuatro números.
- `adv.cplx.multiplication_rotates_scales`: multiplicar por un número complejo es una deformación de las que giran y estiran a la vez, decidida por adónde va una sola clavija.

Concepto siguiente: `linalg.map.inverse_and_systems` ([33](33-linalg.map.inverse_and_systems.md)). Frase puente, narrada sobre la última lámina estirada: "Tiraste de la lámina y la casa quedó en otro lado. Si te dan la casa torcida y no viste el estiramiento, ¿podés devolverla? ¿Siempre?". La lámina se congela con la casa deformada, aparece un fantasma de la casa original y un llavero vacío debajo, y el nodo 33 empieza ahí.

---

**Visualización:** tres escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `grid_scene_rubber_sheet_house` es la escena central, de ruta mixta: la versión pre-renderizada abre el nodo con la lámina deformándose y la casa siguiéndola, y la versión nativa corre sobre el estado del jugador recibiendo la matriz y el contorno de la casa; gramática `deform`, con la grilla fantasma siempre presente. `grid_scene_basis_arrows_land` es nativa y es la que hace visible el concepto: solo la grilla y las dos flechas de base viajando a su destino, con el resto del plano acomodándose. Produce las animaciones de `explain` y las de `recognize`. `pipe_scene_vector_in_vector_out` es nativa: la flecha entra al tubo, se descompone en su receta, los ingredientes se cambian por las llegadas y sale la imagen; gramática `compose`. Ninguna lleva texto rasterizado: las entradas de la matriz las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsa `grid_scene_two_kinds_of_steps` (nodo 31) para mostrar que la receta sobrevive al estiramiento.

**Calculadora:** en `ready` se habilita `op_matrix_vector` ([M](../../M-calculadora/M0-progresion.md)), disponible sobre una matriz y una columna armadas con fichas. No devuelve solo la columna resultante: escribe la salida como la primera columna escalada más la segunda columna escalada, y ofrece dibujar la grilla antes y después con el fantasma. La operación se presenta con un ícono de grilla torcida, no con una tabla de números. Si el nodo decae, la grilla del ícono se curva.

**Edad universal:** el nodo es `icons` porque las entradas de la matriz aparecen como dígitos con signo desde el nivel de fichas ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: arrastrar clavijas, comparar con un modelo translúcido, tirar una flecha al tubo, `explain` entre animaciones y prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, y casi siempre trae la matriz como tabla de un sistema; el nivel de reconstruir la deformación mirando solo las dos clavijas no se le saltea nunca, porque es el que reemplaza esa lectura.
