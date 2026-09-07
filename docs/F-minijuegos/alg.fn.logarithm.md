# La llave que cuenta vueltas (`alg.fn.logarithm`)

Minijuego del nodo 24 de la espina, "Contar cuántas veces se escaló". Mecánica principal `chest_key`, secundarias `gears_sequence` y `machine_pipe`; analogía `machine_reverse_run`, con `paper_folding_doubles` como piel heredada del nodo 23. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/24-alg.fn.logarithm.md): un concepto, cuatro dificultades reales (la respuesta cambia de tipo, la base es parte de la llave, la llave no entra en todos los cofres, la llave no se reparte sobre una suma), una analogía que vuelve del nodo 21, un gesto (arrastrar la llave y contar los saltos), cinco pasos de desvanecimiento, el diagrama vertical bifurcado por tipo como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Una máquina con palanca de reversa, la misma del nodo 21. Metida al derecho, multiplica por un factor tantas veces como se le pida; corrida al revés, recibe la cantidad y devuelve cuántas veces fue.

Mapa objeto a concepto: correr la máquina al revés → función inversa; máquina de duplicar corrida al revés → logaritmo de la exponencial; meter la salida por la boca de salida → intercambiar entrada y salida; palanca de reversa → la notación de la llave; entrada que no existe del otro lado → dominio.

La hoja doblada acompaña con la entrada de su mapa que el nodo 23 no usó: contar dobleces hasta llegar a un grosor. El cofre y el llavero aportan el gesto y el criterio de elección, y son la cuarta llave de la sección "Funciones como llaves" de [E0](../E-mecanicas/E0-catalogo.md), la que introduce el dominio. Punto de ruptura de la máquina: `non_injective_reversal`, que acá no se activa porque la exponencial no junta entradas; lo que sí aparece es su reverso, la entrada que no existe, y por eso la máquina se retira recién en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el cofre en el centro con la cantidad grabada en la tapa, el llavero abajo, la pista de engranajes del nodo 23 cruzando el fondo con la manivela trabada, y desde el cuarto nivel dos tuberías paralelas en una banda lateral. Gestos: `drag`, `tap` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar la llave al cofre.** La cerradura gira, la ficha de la pista vuelve hacia el arranque de a un salto y un contador cuenta los saltos. El cofre se abre y adentro está el conteo, no una cantidad.
- **Elegir otra llave.** Cada llave del llavero corresponde a un factor. Con la llave de duplicar sobre un cofre de triplicaciones la ficha vuelve con saltos del tamaño equivocado y no aterriza en el arranque. La llave no se traba: se ve el desajuste y el cofre queda como estaba.
- **Abrir un cofre cuya cantidad cae entre dos marcas.** El contador se detiene entre dos números y ahí se queda. El juego no redondea ni completa; deja el conteo entre las dos marcas iluminadas.
- **Tocar el cofre negativo.** Ninguna llave entra. La pista se ilumina entera y se ve que la ficha nunca estuvo de ese lado del cero. El cofre queda marcado y disponible, no descartado.
- **Juntar dos cofres.** Al arrastrarlos uno sobre otro las cantidades se multiplican. Aplicar la llave al resultado y aplicarla a cada uno por separado sumando los conteos dan lo mismo, y los saltos de una pista se encadenan con los de la otra.
- **Cambiar el producto por una suma.** El mismo tablero con los cofres sumados en vez de multiplicados. Los dos caminos dejan de coincidir y las dos salidas quedan dibujadas como barras de distinto alto.

En `symbolic` la superficie cambia de forma, no de reglas: arrastrar la llave sobre un renglón exponencial lo reescribe como el renglón logarítmico equivalente y viceversa, soltar la llave sobre un producto la reparte en dos sumandos, y soltarla sobre una suma no hace nada salvo mostrar las dos barras. La pista se pide con un toque y aparece como fantasma.

## Invariante matemático

Tres invariantes, uno por mecánica.

`inverse_restores_original` (cofre): la llave devuelve exactamente lo que había. Se confirma al meter el conteo de vuelta en la máquina al derecho y recuperar la cantidad. Se ve romperse cuando la llave no corresponde al factor: la ficha no aterriza en el arranque.

`same_step_every_turn` (engranajes): todos los saltos de vuelta son iguales aunque cubran distancias distintas. Es lo que hace que contarlos tenga sentido, y es la razón de que el resultado sea un conteo y no una medida.

`same_input_same_output` (tuberías): la misma entrada da siempre la misma salida, así que dos caminos que empiezan igual y terminan distinto no pueden ser el mismo cálculo. Se ve romperse en el tablero de la suma, donde las dos barras quedan a distinto alto.

Un movimiento válido pero inútil, como aplicar la llave a un cofre ya abierto o cambiar de llave sin arrastrarla, no rompe ningún invariante: recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `invert`, de apoyo `displace` y `compose` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la pila de papel ya doblada y la pregunta de cuántos dobleces hubo. Solo se mira y se predice.
- `concrete`: cofre con la cantidad grabada, llavero con una llave por factor, pista con marcas, contador de saltos. Nada escrito salvo los números de la tapa y del contador.
- `visual`: el diagrama vertical del nodo 12 con la manivela en la flecha, y lo que viaja cambia de tipo a mitad de camino. El juego lo marca con dos formas de ficha, redonda para las cantidades y con muescas para los conteos. Al costado, la pista leída al revés y el contador que sube mientras la ficha vuelve. Abajo, las dos tuberías paralelas con sus salidas dibujadas como barras.
- `symbolic`: fichas con el nombre de la llave, la base como subíndice y los dos renglones equivalentes unidos por una llave que los abarca.
- `formal`: la definición corta con voz; el diagrama vertical fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Contador de saltos → ficha con muescas: al terminar el primer conteo, el contador se contrae en una ficha del tipo del conteo, al lado del cofre abierto.
2. Llave con forma de manivela → llave con nombre: en el mismo gesto, la llave pierde la forma y gana tres letras; el dibujo queda un rato como sombra.
3. Factor de la llave → subíndice: al cambiar de llave, el factor se despega y se apoya abajo a la derecha del nombre. Es el gesto del exponente del nodo 23, en la otra esquina.
4. Diagrama vertical → dos renglones equivalentes: al tocar la flecha, los dos sentidos se escriben uno debajo del otro y quedan unidos por una llave que los abarca. Cada ficha de un renglón se ilumina cuando el jugador toca su lugar en el otro.
5. Tuberías → producto que se vuelve suma: al comprobar que los dos caminos coinciden, las etiquetas caen a un mismo renglón y el punto del producto y el signo de la suma se resaltan en el instante del cambio.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el diagrama fantasma: el logaritmo de un número en una base es la cantidad de veces que hay que multiplicar por esa base para llegar a él; es la llave de la exponencial y una deshace lo que hizo la otra en los dos sentidos; solo tiene respuesta para números positivos. Propiedades: el logaritmo de un producto es la suma de los logaritmos; el logaritmo de uno es cero en cualquier base; crece cada vez más despacio, porque cantidades enormes dan conteos chicos. Casos: la base tiene que ser positiva y distinta de uno; el resultado es negativo cuando la cantidad está entre cero y uno; el logaritmo de una suma no se reparte, y eso no es un caso especial sino una regla que no existe. Símbolos nuevos: `log`, porque un conteo entre dos marcas no se puede escribir con lo que había; y `ln`, como nombre de la llave de un candado cuyo factor no elige el jugador, con el valor de ese factor dejado abierto hasta `precalc.exp.natural_base`. Convención nueva: el subíndice de la base, porque con tres llaves en el llavero hay que decir cuál.

## Generalización

La máquina se retira en `formal`. Es la única forma de mostrar sin drama que la llave no entra en cofres negativos: la palanca está, la máquina anda, y esa entrada no existe del otro lado. El papel se retiró antes, con el nodo 23, porque un conteo entre dos marcas ya no es una cantidad de dobleces. La pista se queda como fantasma a demanda hasta el final.

Variantes sin ayuda visual: conteos enteros con base dos; otras bases enteras; conteos que caen entre dos enteros y se dejan escritos; cantidades entre cero y uno, con conteo negativo; conversión en los dos sentidos entre la forma exponencial y la logarítmica; productos y cocientes resueltos con la regla de la suma; entradas negativas o cero, marcadas como sin respuesta y no como error. Cuando el jugador escribe el par de renglones equivalentes sin dibujar el diagrama y rechaza el reparto sobre una suma dando un par de números, la analogía se eliminó.

## Desafío

Correspondencia con la progresión de [H](../H-progresion-abstraccion.md): el nodo completa el nivel 9 del ejemplo de cofres, la mitad que necesita llave. Las reglas completas de manipulación llegan en `alg.pow.log_rules_from_stack` y acá solo se juega la del producto, que es la que la mecánica muestra.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Desdoblar y contar.** `concrete`, `manipulate`. Base dos, cantidades que caen justo en una marca, hasta seis vueltas.
2. **Una llave por factor.** `concrete`, `recognize` y `manipulate`. Bases dos, tres y diez; el llavero tiene las tres y la llave que no corresponde deja la ficha fuera del arranque.
3. **Diagrama y pista.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; entran el diagrama vertical con las dos formas de ficha y la pista leída al revés.
4. **Las dos tuberías.** `visual`, `explain`. Parámetros: cofres que se juntan y se separan. Aparece `log_of_sum`.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. El par de renglones equivalentes aparece junto al diagrama y se transforma en sincronía; nacen el nombre y el subíndice.
6. **Entre dos marcas.** `symbolic` segunda mitad, `apply`. El diagrama queda solo y se pide con un toque; los conteos dejan de ser enteros y se escriben con el símbolo.
7. **Del otro lado del uno.** Parámetros: cantidades entre cero y uno con conteo negativo, y cofres negativos o con cero, que se marcan sin respuesta. El teclado de fichas deja de ofrecer la base prearmada.
8. **Sin pista.** `formal` y `abstract`, `generalize`. Definición corta con voz; conversión en los dos sentidos, regla del producto en ambas direcciones y el candado cuyo factor no se elige, que recibe el nombre `ln`.

Qué endurece cada parámetro: las bases distintas de dos impiden contar duplicaciones de memoria; los conteos no enteros rompen la idea de que la respuesta siempre es un número de vueltas que se puede dar; las cantidades menores que uno separan el conteo de la cantidad de una vez por todas; los cofres sin respuesta obligan a distinguir "no sé" de "no existe".

Desafíos de olimpíada: junto con el nodo 23, este nodo desbloquea `ch.alg.doublings_until_overflow` de [S](../S-desafios/S0-desafios.md). El dato oculto es la cantidad de vueltas hasta pasar un objetivo, se descubre leyendo el logaritmo como conteo de escalados, y la construcción esperada incluye aplicar la llave a los dos lados y redondear hacia arriba a la vuelta entera. La cheatsheet del desafío está abierta de entrada.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: un cofre con base 2 y resultado 32; cuatro fichas: `5`, `16`, `6`, `32`. Tocar `5`.
- `explain`: dos animaciones. En una, el conteo de `8 · 4` se arma encadenando los saltos de las dos pistas; en la otra, se suman 8 y 4 antes de contar. Tocar la que confunde suma con producto. El distractor es `log_of_sum`.
- `manipulate`: cofre con 81 y base 3. Arrastrar la llave, ver volver la ficha y contar los saltos.
- `apply`: una pista de duplicaciones con la ficha en 40; arrastrar la ficha del conteo al lugar que le corresponde entre las marcas de 32 y 64, contra el tiempo objetivo del nodo.
- `generalize`: sin pista, `log₅ 125 = 3`; escribir el renglón exponencial equivalente. Y `log(6 · 7)` para reescribir como suma.
- `transfer`: en la búsqueda binaria de `csmath.rec.base_case_and_smaller_call`, tocar cuántas divisiones a la mitad hacen falta para encontrar la ficha escondida entre 64. También en `csmath.cplx.big_o_as_slope` y en `precalc.exp.natural_base`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `log_of_sum`, patrón `counterexample_slider` sobre las tuberías, que este nodo declara entre sus mecánicas y por eso corre ahí sin traducción. La regla del jugador se enuncia como dos tuberías paralelas con un deslizador en las dos cantidades; el barrido arranca donde las salidas se parecen y sigue hasta que la brecha es grande, con las salidas dibujadas como barras. Voz: "Con 10 y 100 las dos tuberías dan distinto. ¿Coinciden para algún par?". El deslizador queda en manos del jugador, y el tablero ofrece cambiar la suma por un producto, que es la versión que sí funciona.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de esa misconception, más las de `alg.fn.exponential_growth` y `alg.fn.inverse_function`, de donde sale el distractor de la llave equivocada.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_log_key_counts_turns`, nativa, parametrizada por la base, el resultado y las vueltas. La llave entra, la cerradura gira, la ficha vuelve por la pista de a un salto y el contador sube desde cero hasta detenerse; gramática `invert`, con las dos formas de ficha para distinguir cantidad de conteo. Abre cada nivel y es la imagen de cheatsheet de `cs.alg.log_counts_scalings`.
- `gear_track_read_backwards`, nativa, parametrizada por la base y los dos valores entre los que se cuenta. La pista con las marcas separándose, la llave que abarca el tramo y el conteo que aparece encima. Produce también el distractor de `recognize` donde el conteo se confunde con la cantidad.
- Reusadas: `chest_wrong_key_stays_shut` del nodo 12 y `gear_doubling_track` del nodo 23, como distractores de `explain`. Las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)), incluido el nombre escrito de la llave, que cambia con el idioma.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_scaling_count`: `base` en {2, 3, 10} y hasta 12 desde el nivel 7; `exact` (verdadero hasta el nivel 5, falso desde el 6); `value_range` de 4 a 1024; `allow_fractional_value` desde el nivel 7; `allow_invalid_input` (negativos y cero) solo en los niveles 7 y 8; `seed`.
- `gen_key_ring_by_base`: `size` de 2 a 4 llaves; `distractors` desde `detect` (base vecina, la llave de la exponencial en vez de la del logaritmo, el conteo confundido con la cantidad); `labeled` (falso en los niveles 1 y 2).
- `gen_log_pipe_pair`: `combiner` en {producto, suma, cociente}; `a` y `b` con rangos por nivel; `gap_target`, cuánta diferencia debe alcanzar el barrido antes de congelar. Alimenta las dos animaciones de `explain` y el patrón de la misconception.

**Literacy soportada:** de `icons` a `full_text`. Los dos primeros niveles se juegan sin leer, pero el llavero se distingue por el número de la base desde el primero y el patrón de explicación del nodo pide ese mínimo, así que el mínimo declarado es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la llave con forma de manivela invertida, la arrastra al cofre y el conteo aparece mientras la ficha vuelve. La escena vuelve al inicio y el llavero late. La demostración de las dos tuberías se hace una vez al empezar ese nivel, con los dos caminos corriendo en paralelo. No se repiten si el jugador ya está arrastrando ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
