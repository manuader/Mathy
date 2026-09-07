# La lámina y la casa (`linalg.map.linear_transformation_2d`)

Minijuego del nodo 32 de la espina, "Matriz como grilla deformada". Mecánica principal `grid_stretch`, secundaria `machine_pipe`; analogía `rubber_grid_with_house`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/32-linalg.map.linear_transformation_2d.md): un concepto, cuatro dificultades reales (dos flechas deciden el plano entero, distinguir lineal de cualquier deformación, leer la matriz como dos llegadas, descubrir que el orden importa), una analogía, un gesto que lo decide todo (arrastrar una clavija y ver a toda la grilla obedecer), cinco pasos de desvanecimiento, las dos flechas de base viajando como imagen central, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Una lámina elástica con una grilla impresa y una casita dibujada, clavada al tablero por el centro. Sobre la lámina hay dos clavijas: una a un paso a la derecha del clavo, otra a un paso hacia arriba. Debajo, un fantasma tenue de la grilla original que nunca se mueve.

Mapa objeto → concepto: lámina → plano; casa dibujada → figura a transformar; tirar parejo de la lámina → transformación lineal; líneas de la grilla que siguen rectas y equiespaciadas → linealidad; dónde caen las dos clavijas → columnas de la matriz; clavo del centro → origen fijo; estirar y volver a estirar → producto de matrices.

La lámina aporta la deformación entera; el tubo aporta la pregunta puntual, qué le pasa a este vector. Punto de ruptura: `sliding_the_sheet`. Correr la lámina también deforma la escena en el sentido cotidiano y no es lineal, y el clavo del centro existe para impedirlo; es una ruptura que se puede jugar, porque el jugador intenta el gesto y el clavo lo frena. La analogía se retira recién en `formal`, más tarde que la mayoría, porque la lámina sigue explicando bien la linealidad cuando ya hay matrices escritas ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la lámina ocupa el centro con el fantasma debajo, el modelo de la casa objetivo dibujado en translúcido a un costado, el tubo abajo desde el tercer nivel, y la pila de dos láminas a la derecha desde el quinto. Gestos: `drag`, `pinch` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una clavija.** Toda la lámina la sigue: las líneas se mantienen rectas y equiespaciadas, la casa se deforma en vivo. La otra clavija no se mueve.
- **Arrastrar la lámina desde el medio.** El clavo la retiene y lo que se consigue es estirarla desde el centro. La lámina nunca se corre. Es el gesto que hace visible la ruptura de la analogía.
- **Pinch sobre la lámina.** Escala las dos direcciones a la vez, que es la deformación de dilatación.
- **Tirar una flecha al tubo.** Adentro la flecha se descompone en su receta del nodo 31, las dos clavijas nuevas aparecen escaladas por esos coeficientes y se encadenan punta con cola. Por la otra boca sale la flecha imagen.
- **Tocar la pila de dos láminas.** Intercambia el orden de aplicación y la casa se rehace. Es el gesto que produce y resuelve `matrix_multiplication_commutes`.
- **Tocar el fantasma.** La lámina vuelve a su forma sin estirar, con la casa recuperada. Es un reinicio, no una inversa: la operación de deshacer una deformación ajena es el nodo 33.

En `symbolic` la superficie cambia de forma, no de reglas: la matriz escrita reemplaza a las clavijas y arrastrar una entrada de la matriz mueve la clavija correspondiente. Soltar una columna sobre la otra las intercambia, con la casa rehaciéndose. La lámina se pide con un toque y aparece como fantasma.

## Invariante matemático

`lines_stay_lines_origin_fixed`, el invariante de `grid_stretch`, acá es el concepto mismo: **las líneas de la grilla siguen rectas y equiespaciadas, las paralelas siguen paralelas y el origen no se mueve**. Se ve confirmarse en cada arrastre de clavija, con el retículo entero acomodándose sin que nadie lo toque. Se ve romperse en la escena de `intuition`, donde una de las tres opciones curva la grilla y otra arranca el clavo, y el jugador ya vio antes por qué eso no es lo mismo.

El invariante operativo, el que el jugador usa, es que **la receta se conserva**: los coeficientes de un punto respecto de las dos clavijas no cambian, cambian los ingredientes. Se ve dentro del tubo, donde la flecha se descompone con los números viejos y se rearma con las flechas nuevas.

`machine_pipe` aporta `same_input_same_output`: dos veces la misma flecha al tubo, dos veces la misma salida. Se ve romperse si alguien mueve una clavija entre las dos pasadas, y ahí se entiende que la matriz es la máquina.

Aplastar la lámina contra una línea es un movimiento válido y ejecutable, no un error: la casa desaparece en un segmento y el fantasma queda de testigo. Ese estado es la puerta al nodo 33 y acá recibe un empujón suave.

## Representación visual

Primitiva dominante `deform`, de apoyo `compose` en el tubo ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la lámina de goma sobre el tablero, con la mano de otra persona tirando. Solo se mira y se predice.
- `concrete`: lámina con textura, grilla impresa, casa dibujada, dos clavijas de colores, clavo en el centro, modelo objetivo al costado.
- `visual`: la goma se va y queda la grilla con su fantasma debajo. La casa es contorno con una esquina marcada. Las dos clavijas son dos flechas ancladas en el origen y su llegada se resalta con un destello al soltar.
- `symbolic`: la matriz como par de columnas encorchetadas, con la primera del color de una clavija y la segunda del color de la otra; `Av⃗` escrito a la salida del tubo; dos matrices apiladas con la flecha fina que marca el orden de lectura.
- `formal`: la definición corta con voz; la lámina fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Lámina → grilla: al reproducir por primera vez una deformación mirando solo las clavijas, la textura elástica se desvanece y quedan grilla y fantasma; la casa se afina hasta ser contorno.
2. Clavijas → nombres: las dos flechas de base se contraen en `î` y `ĵ`, con sus columnas del nodo 30 a un toque.
3. Dos llegadas → matriz: al soltar la segunda clavija, las dos columnas de llegada se deslizan una junto a la otra y un corchete alto crece abrazándolas.
4. Tubo → producto: al tirar una flecha al tubo con la matriz ya escrita, `A` se escribe pegada al nombre de la flecha y sale la columna de la salida.
5. Dos láminas → orden: al aplicar la segunda deformación sobre la primera, su matriz se escribe a la izquierda, y una flecha fina recorre la expresión en el orden en que la casa sintió los estiramientos. El producto todavía no se calcula.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la lámina fantasma: una transformación lineal del plano es una regla que manda vectores a vectores respetando sumas y múltiplos; es lo mismo decir que las líneas de la grilla siguen rectas y equiespaciadas y que el origen no se mueve; su matriz tiene por columnas las llegadas de las dos flechas de la base.

Propiedades: `Av⃗` es la primera columna por la primera componente más la segunda columna por la segunda; `A(u⃗ + v⃗) = Au⃗ + Av⃗` y `A(kv⃗) = k·Av⃗`; rectas a rectas y paralelas a paralelas; el orden importa, girar y después inclinar no es lo mismo que inclinar y después girar. Casos especiales: la identidad es la lámina sin estirar; una reflexión invierte el orden de giro de las dos flechas; si las dos clavijas caen sobre la misma línea, el plano se aplasta.

Símbolo nuevo: el corchete alrededor de dos columnas, que nace cuando el jugador ya puede reconstruir una deformación mirando solo las llegadas y necesita escribirla, porque dos columnas sueltas se leen como dos vectores. `Av⃗` nace en el tubo, porque el jugador quiere preguntar dónde cae un punto sin arrastrar nada; la yuxtaposición es la misma del nodo 31 y la diferencia, dicha en voz alta, es que acá lo de la izquierda no es un número sino una deformación. Cheatsheet: `cs.linalg.matrix_columns_are_basis_images`, `cs.linalg.matrix_vector_product` y `cs.linalg.rotation_shear_reflection_matrices`, las tres en capa `symbolic`.

## Generalización

La lámina se retira en `formal`, y el retiro es progresivo: primero desaparece la goma y queda la grilla, después la grilla se pide con un toque, y al final la casa se reemplaza por un par de puntos cualesquiera.

Variantes sin ayuda visual: entradas negativas, que son reflexiones; una columna múltiplo de la otra, que aplasta; la identidad; matrices dadas de entrada sin lámina, donde hay que predecir la figura; dos matrices y el mismo par de figuras en los dos órdenes. Después, deformaciones que no son de un mapa: una mezcladora con dos diales que combina dos colores base, una tabla que convierte dos ingredientes en dos productos, la grilla de píxeles de `csmath.gfx.transform_matrix`. Cuando el jugador escribe la matriz de una transformación descrita en palabras, calcula `Av⃗` sin dibujar y explica por qué el orden no se puede intercambiar, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Tirar de una clavija.** `concrete`, `manipulate`. Una sola clavija móvil, deformaciones suaves, entradas enteras positivas. El modelo objetivo está al lado.
2. **Las dos clavijas.** `concrete`, `manipulate` y `recognize`. Las dos se mueven. Aparece el intento de correr la lámina y el clavo que lo frena.
3. **El tubo.** `concrete` hacia `visual`, `explain`. Se habilita tirar una flecha al tubo y ver la receta rearmarse. La casa se tapa y hay que reconstruirla mirando las clavijas.
4. **Números en las llegadas.** `symbolic` primera mitad, `manipulate` y `apply`. Nace la matriz; la lámina y la escritura se transforman en sincronía. Parámetros: entradas negativas, o sea reflexiones.
5. **Dos láminas.** `symbolic`, `explain` y `apply`. Aparece la pila y el gesto de intercambiar el orden. Aparece `matrix_multiplication_commutes`.
6. **Sin lámina.** `symbolic` segunda mitad, `apply`. La matriz se da de entrada y la lámina se pide con un toque. Parámetros: rango mayor y entradas fraccionarias.
7. **Deformaciones que nunca viste.** `formal` y `abstract`, `generalize` y `transfer`. Aplastamientos, la identidad presentada sin aviso, deformaciones sobre objetos que no son un mapa.

Qué endurece cada parámetro: el rango de entradas obliga a leer la matriz y no a reconocer la figura; las entradas negativas introducen la reflexión, que es la deformación que el ojo peor anticipa; las fracciones separan "estirar" de "repetir"; la separación angular entre las dos llegadas, cuando se achica, obliga a decidir por los números antes de que el aplastamiento sea visible.

Desafíos de olimpíada: el nodo participa en `ch.linalg.matrix_of_a_composed_move` ([S](../S-desafios/S0-desafios.md)), de nivel entrenamiento, donde la casa aparece antes y después de dos movimientos y hay que descubrir dónde cayó cada flecha de base y en qué orden se aplicaron los dos movimientos. Requiere también `linalg.map.compose_as_multiply`, así que no está disponible al terminar este nodo solo.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro láminas ya estiradas; tocar la que fue deformada sin doblar ninguna línea. Distractores: grilla curvada, grilla cortada, clavo movido.
- `explain`: la lámina con la casa tapada y solo las dos clavijas visibles, en tres animaciones que reconstruyen la casa. Una respeta la receta de cada punto; otra escala las dos direcciones al revés; otra mueve la casa entera sin deformarla. Tocar la que sí reconstruye y narrar con la voz por qué alcanza con las dos clavijas. Cada distractor es una misconception.
- `manipulate`: estirar la lámina hasta que la casa quede como el modelo y leer la matriz que aparece.
- `apply`: con la matriz dada y la lámina quieta, ubicar dónde caerá la esquina marcada antes de soltar. Cuatro instancias seguidas contra el tiempo objetivo del nodo.
- `generalize`: sin lámina, elegir las dos columnas de una deformación que mande la casa a una línea y explicar qué le pasó a la grilla.
- `transfer`: con la misma lámina, girar la casa un cuarto de vuelta y leer qué números describen ese giro, que es la matriz de `trig.rot.rotation_matrix`. También en `geom.trans.dilation`, `csmath.gfx.transform_matrix` y `adv.cplx.multiplication_rotates_scales`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `matrix_multiplication_commutes`, patrón `two_paths_diverge` sobre `grid_stretch`, que el nodo declara. El jugador aplica el giro y la inclinación en el orden contrario, o escribe el producto invirtiendo los factores. La pantalla se parte y la misma casa aparece en las dos mitades sobre láminas idénticas: a la izquierda gira y después se inclina, a la derecha se inclina y después gira. Las dos animaciones corren a la vez con el modelo en translúcido sobre cada una, y las dos casas terminan en lugares distintos. Ninguna se marca como mala: las dos quedan en pantalla y el jugador elige cuál coincide. Voz: "Los dos caminos usan las mismas dos deformaciones. ¿Por qué la casa no termina en el mismo lugar?". La severidad es alta porque el error viaja a `linalg.map.compose_as_multiply` y a `linalg.map.inverse_and_systems`.

Aplastar la lámina no dispara nada acá: es un estado legítimo y el juego lo usa para dejar planteada la pregunta del nodo 33. Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de la misconception y las de los prerequisitos directos, entre ellas `variable_as_label` del nodo 31.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `grid_scene_rubber_sheet_house`, de ruta mixta. La versión pre-renderizada abre el nodo con la lámina deformándose y la casa siguiéndola; la nativa corre sobre el estado del jugador y recibe la matriz y el contorno de la casa. Gramática `deform`, con la grilla fantasma siempre presente.
- `grid_scene_basis_arrows_land`, nativa. Solo la grilla y las dos flechas de base viajando a su destino, con el resto del plano acomodándose. Gramática `deform`. Es la escena que hace visible el concepto, produce las animaciones de `explain` y de `recognize`, y es la imagen de cheatsheet de `cs.linalg.matrix_columns_are_basis_images`.
- `pipe_scene_vector_in_vector_out`, nativa. La flecha entra al tubo, se descompone en su receta, los ingredientes se cambian por las llegadas y sale la imagen. Gramática `compose`. Es la imagen de cheatsheet de `cs.linalg.matrix_vector_product`.
- Reusada: `grid_scene_two_kinds_of_steps` (nodo 31), para mostrar que la receta sobrevive al estiramiento.
- Sin texto rasterizado: las entradas de la matriz las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_stretch_matrix`: `entry_range` (−2 a 2 en los niveles 1 a 3, −5 a 5 desde el 4); `allow_negative` (desde el nivel 4); `fractional_entries` (desde el 6); `family` en {shear, scale, rotate, reflect, generic}; `singular` (verdadero solo en el nivel 7); `seed`.
- `gen_house_shape`: el polígono de la casa, con `marked_corner` y `vertex_count`; sin palabras.
- `gen_pipe_vector`: la flecha de entrada al tubo, con `component_range` y la garantía de que la imagen cae dentro del encuadre.
- `gen_move_pair`: dos deformaciones para la pila, con `order_matters_required` verdadero, que garantiza que los dos órdenes dan resultados distintos y visiblemente distintos.

**Literacy soportada:** de `icons` a `full_text`. La primera capa se juega sin leer, pero las entradas de la matriz aparecen como dígitos con signo desde el nivel de fichas y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la clavija derecha, la arrastra y suelta; la lámina la sigue y la casa se inclina. Después toma la otra y repite. La escena vuelve al inicio y las dos clavijas laten. Hay una segunda demostración, en el nivel 3: la mano tira una flecha al tubo y la salida se dibuja sola. Se repiten solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Calculadora:** `op_matrix_vector` queda disponible desde el panel lateral en cuanto el nodo pasa a `ready`; escribe la salida como suma de las dos columnas escaladas y ofrece dibujar la grilla antes y después ([M](../M-calculadora/M0-progresion.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
