# La fábrica (`alg.fn.function_as_machine`)

Minijuego del nodo 17 de la espina, "Una función es una máquina". Mecánica principal `machine_pipe`, secundarias `network_routes` y `sorter`; analogía `function_machine`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/17-alg.fn.function_as_machine.md): un concepto, cuatro dificultades reales, una analogía cuya ruptura es el criterio, cinco pasos de desvanecimiento, la máquina con su tabla como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Una máquina en una fábrica. Arriba, una ranura de entrada; abajo, una salida; en el frente, una placa donde se escribe la regla. A la izquierda, la bandeja de fichas. A la derecha, una tabla de dos columnas que se llena sola con cada viaje.

Mapa objeto → concepto: máquina → función; ranura de entrada → argumento; salida → valor; placa con la regla → fórmula; misma entrada y misma salida → buena definición; entrada que la máquina rechaza → fuera del dominio; todas las salidas que puede producir → imagen.

Punto de ruptura: `relations_that_are_not_functions`. Una regla que asigna dos salidas a una entrada no es una máquina, y la analogía no la puede representar sin romperse. Acá la ruptura no se esconde: se usa como criterio, y el jugador la ve como una segunda salida que cae por un tubo lateral con una luz roja encendida. La ruptura completa se explora en `disc.rel.relation_as_arrows` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la máquina en el centro con la ranura arriba y la salida abajo, la bandeja de fichas a la izquierda, la tabla de dos columnas a la derecha. La red y el clasificador ocupan la pantalla entera cuando les toca. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Dejar caer una ficha en la ranura.** La máquina vibra y por la salida cae otra ficha. Las dos quedan registradas como una fila de la tabla.
- **Repetir una entrada ya usada.** Sale lo mismo y la fila existente se ilumina en vez de duplicarse.
- **Abrir la tapa y arrastrar fichas de operación adentro.** Al cerrar la tapa, la placa dibuja la cadena.
- **Construir una regla ambigua.** Un desvío que manda la misma entrada a dos ramas hace que la segunda salida caiga por un tubo lateral y se encienda la luz roja.
- **Arrastrar flechas en la red.** Un punto de entrada con dos flechas hace parpadear las dos; uno sin flecha queda apagado.
- **Arrastrar objetos en el clasificador.** Un objeto que cae entre dos cajones rebota y vuelve a la mano.
- **Tocar el frente de una máquina.** La marca con un nombre.
- **Encadenar dos máquinas.** Arrastrar la salida de una hasta la ranura de la otra.

En `formal` la superficie cambia de forma, no de reglas. La máquina es la ficha `f`, la ranura es el paréntesis y meter una ficha es arrastrarla hasta el paréntesis. La tabla se pide tocando el renglón de la fórmula.

## Invariante matemático

`same_input_same_output` (tubería): la misma entrada produce siempre la misma salida. Se ve romperse cuando la segunda salida cae por el tubo lateral y la luz roja se enciende. Ningún mensaje lo dice; la luz es el mensaje.

`connections_independent_of_drawing` (red), con la condición extra que este nodo agrega: de cada punto de entrada sale exactamente una flecha. Se ve romperse con un punto que tiene dos flechas y con uno que no tiene ninguna.

`every_object_exactly_one_bin` (clasificador): cada objeto cae en un cajón y en uno solo. Se ve romperse cuando el objeto rebota entre dos cajones.

Un movimiento válido pero inútil, como armar una máquina con `+0` en la cadena, no rompe ninguno: la tabla sale igual y la placa queda con un paso de más. Empujón suave.

## Representación visual

Primitiva dominante `compose`, de apoyo `relate` y `partition` ([H](../H-progresion-abstraccion.md)).

- `concrete`: máquina con volumen, fichas físicas, tabla con casilleros, luz roja apagada.
- `visual`: la máquina se aplana en un rectángulo con una flecha que entra y una que sale, y la placa se vuelve la cadena escrita adentro. Las fichas son puntos que viajan por las flechas, y varios a la vez muestran que la regla no cambia entre viajes.
- `symbolic`: la ficha `f` con su paréntesis, el renglón `f(x) = 3x + 1` y la tabla plegada.
- `formal`: la definición corta con voz y la red de flechas al lado, con los casos límite dibujados.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Placa → expresión: al cerrar la tapa por primera vez en `visual`, la cadena de fichas se acomoda en un renglón dentro de la máquina, con la caja del nodo 10 en el lugar de la entrada.
2. Caja → `x`: al meter la primera ficha con la placa ya escrita, la caja se contrae en `x`. La ficha ocupa la `x` por un instante y después se va: la letra no es un valor a descubrir.
3. Máquina → nombre: cuando hay dos máquinas en pantalla y hace falta decir cuál se usa, tocar el frente contrae la carcasa hasta una etiqueta con una letra.
4. Ranura → paréntesis: al arrastrar una ficha hacia la etiqueta, la ranura se separa de la carcasa, se afina y queda como los dos arcos del nodo 14, con la ficha adentro. La salida aparece a la derecha de un igual.
5. Tabla → fórmula: la tabla se contrae en un renglón donde la columna de entradas se volvió la `x` del paréntesis y la de salidas la expresión.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la red de flechas: una función asigna a cada entrada exactamente una salida; el conjunto de entradas que acepta es su dominio y el de salidas que produce es su imagen; dos funciones son iguales si dan la misma salida para toda entrada, aunque sus reglas estén escritas distinto.

Propiedades: determinismo; cada entrada tiene exactamente una flecha; cada objeto cae en un cajón y en uno solo; dos escrituras distintas pueden ser la misma función. Casos límite: la misma salida puede venir de varias entradas y sigue siendo función; una entrada con dos salidas no lo es; una función puede rechazar entradas, lo que anticipa `alg.rat.division_by_zero_hole`.

Símbolo nuevo: la notación `f(x)`. El nombre resuelve el problema de decir cuál máquina, el paréntesis el de decir a qué se aplica. Se fija acá, con la máquina en pantalla, que el paréntesis es una ranura y no una multiplicación, porque compite con la yuxtaposición del nodo 15.

## Generalización

La máquina se retira en `formal`, más tarde que las analogías anteriores, y el YAML lo declara así. La razón es que no representa un objeto que la notación reemplaza, como la fruta, sino una estructura que conserva: `f(x)` sigue teniendo ranura y salida sin dibujo. La carcasa se apaga cuando el jugador evalúa con letras sin pedirla. La red y el clasificador se retiran antes, en cuanto el criterio de una flecha por entrada se aplica sin dibujarlas.

Variantes sin ayuda visual: evaluar con letras y con expresiones; comparar dos escrituras y decidir si son la misma función; encontrar la regla a partir de una tabla, con dos reglas que la explican y una entrada extra que las separa; máquinas que rechazan alguna entrada; máquinas encadenadas. Cuando el jugador trata la función como objeto, la nombra, la evalúa con lo que sea, decide si dos son iguales sin probar todas las entradas y separa una función de una regla ambigua con un contraejemplo propio, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): este minijuego no tiene ejemplo canónico propio. Hereda del ejemplo de cofres el paréntesis y el orden de la cadena. Sus niveles son propios y se organizan por invariante: primero determinismo, después totalidad, después la regla como objeto.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Adivinar la máquina.** `concrete`, `manipulate`. La placa está vacía y la regla es una sola operación.
2. **Armar la máquina.** `concrete`, `recognize` y `manipulate`. El jugador arrastra fichas de operación dentro de la tapa. Reglas de una y dos operaciones contra una tabla objetivo. Aparece la máquina rota.
3. **Puntos y flechas.** `visual`, `explain`. La máquina se aplana y aparece la red. El jugador conecta cada entrada con una salida y ve qué pasa con dos flechas y con ninguna. El clasificador cierra el nivel.
4. **La máquina tiene nombre.** `symbolic` primera mitad, `manipulate` y `apply`. Dos máquinas en pantalla obligan a nombrarlas; nace `f(x)`.
5. **Entradas que no son números.** `symbolic` segunda mitad, `apply`. Parámetros: evaluar con letras y expresiones, `f(a)` y `f(x + 1)`; máquinas encadenadas; máquinas que rechazan alguna entrada. Aparece `variable_as_label` en su forma de leer el paréntesis como producto.
6. **Dos escrituras, una función.** `formal` y `abstract`, `generalize`. Comparar reglas escritas distinto, encontrar la regla desde una tabla ambigua y distinguir una función de una relación. Definición corta con voz.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): ningún desafío del área de álgebra requiere este nodo de forma directa. El nodo no exige desafío para `mastered`, y su evidencia de transferencia se toma en los cuatro nodos de `transfer_to`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro máquinas con placas distintas, una ficha de entrada `4` y una salida pedida `13`. Tocar la máquina que produce esa salida. Distractores: `3x`, `x + 9` y `4x − 3`.
- `explain`: dos animaciones. En una la misma entrada produce siempre la misma salida y la fila de la tabla se ilumina; en la otra una entrada saca dos salidas por tubos distintos y se enciende la luz roja. Tocar la que no es una máquina.
- `manipulate`: una tabla objetivo con las filas `1 → 4`, `2 → 7`, `3 → 10`. Armar la máquina arrastrando fichas de operación dentro de la caja y probar entradas hasta que coincida.
- `apply`: en la red de flechas, cinco puntos de entrada y seis de salida. Conectar cada entrada con exactamente una salida, contra el tiempo objetivo del nodo.
- `generalize`: con `f(x) = 3x + 1`, evaluar `f(0)`, `f(a)` y `f(x + 1)` arrastrando cada entrada al paréntesis. Y un segundo ítem donde `g(x) = 2(x + 3)` y `h(x) = 2x + 6` tienen que reconocerse como la misma función.
- `transfer`: en la rueda del seno de `trig.fn.sine_as_height`, tocar la altura que la máquina de giro produce para el ángulo de entrada. También en `linalg.map.linear_transformation_2d`, `prob.rv.random_variable_as_machine` y `disc.rel.relation_as_arrows`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). El nodo declara la lista vacía en el grafo. El error central de acá, tomar una regla ambigua por una función, no está catalogado: no es un procedimiento equivocado sino la ruptura declarada de la analogía, y se trata con la luz roja, la flecha doble y el objeto que rebota, como evento de invariante roto. Los errores catalogados vienen de los prerequisitos y se aplican con la regla sobre la mecánica de la explicación.

- `variable_as_label`, heredada del nodo 10, patrón `replay_on_mechanic`. El jugador lee `f(x)` como `f` por `x` y lo distribuye, o escribe `f(a + b) = f(a) + f(b)`. Su mecánica declarada es `ledger`, que este nodo no tiene, pero el jugador ya la conoce desde el nodo 10: corre el caso 2 de la regla, presentado como un regreso. La columna `f` del libro se intenta abrir y no tiene contenido propio, porque `f` no cuenta piezas sino que las transforma; después la escena vuelve a la máquina y muestra las dos entradas por separado y la suma entrando entera, con salidas distintas. Voz: "El paréntesis no es multiplicar. ¿Qué pasa si metés la suma entera en la ranura?".
- `unwrap_order_inverted`, heredada del nodo 14, patrón `tree_unwrap`. Al encadenar dos máquinas, el jugador las arma en el orden en que las leyó y no en el que operan. Su mecánica declarada es `chest_key`, que este nodo tampoco tiene, y el jugador la conoce del nodo 14: caso 2 otra vez. El patrón dibuja la cadena como cofres anidados por un instante, muestra cuál envuelve a cuál y vuelve a la tubería con las máquinas en el orden real. Voz: "Esta máquina recibe lo que sale de la otra. ¿Cuál va primero?".

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `pipe_machine_named_f`, nativa. Recibe la regla y una lista de entradas, y dibuja las fichas viajando por la máquina mientras la tabla se llena, con el morph de carcasa a etiqueta y el de ranura a paréntesis; gramática `compose`. Acepta reglas ambiguas, y por eso produce las animaciones de `explain`.
- `network_each_input_one_arrow`, nativa. Recibe las entradas, la regla y una lista de flechas distractoras, y dibuja los puntos con sus flechas, haciendo parpadear los que tienen dos y apagando los que no tienen ninguna; gramática `relate`. Es la imagen de cheatsheet de `cs.alg.one_input_one_output`.
- Reusadas: `pipe_two_machines_order_matters` (nodo 9), para el encadenado y el regreso en `unwrap_order_inverted`, y `ledger_box_hides_tokens` (nodo 10), para el regreso al libro en `variable_as_label`.

Ninguna lleva texto rasterizado: la etiqueta de la máquina, las entradas y las columnas de la tabla los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_machine`: `stages` (1 en el nivel 1, hasta 3 desde el 5); `ops` en {add, sub, mul, div}; `operand_range` (1 a 9 hasta el nivel 4, hasta 20 después); `input_kind` en {number, letter, expression}; `rejects_input`; `ambiguous`, para la máquina rota; `seed`.
- `gen_arrow_network`: `input_count` (3 a 6); `output_count`; `extra_arrows`; `orphan_inputs`. Alimenta los ítems de `apply` y las escenas de `explain`.
- `gen_sorter_bins`: `bin_count`; `rule_kind` en {parity, sign, range}; `boundary_objects`. Alimenta el cierre del nivel 3.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer; pero las fichas de operación llevan operador y dígito desde el segundo nivel, y por eso el mínimo es `icons`. En `full_text` la definición corta y las palabras dominio e imagen se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma deja caer una ficha en la ranura, la máquina vibra y por la salida cae otra; las dos quedan registradas como una fila de la tabla. La mano repite con la misma ficha y sale lo mismo, y la fila se ilumina en vez de duplicarse. Se repite solo si el jugador se queda quieto. Armar la cadena se demuestra en el nivel 2 y arrastrar flechas en el 3, una vez cada uno ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
