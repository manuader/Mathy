# La manivela que duplica (`alg.fn.exponential_growth`)

Minijuego del nodo 23 de la espina, "Multiplicar en cada paso". Mecánica principal `gears_sequence`, secundaria `slope_walker`; analogía `paper_folding_doubles`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/23-alg.fn.exponential_growth.md): un concepto, cuatro dificultades reales (leer razón en vez de diferencia, aceptar que lo repetido alcanza a lo grande, no mezclar las reglas de exponentes, ver el decaimiento como el mismo mecanismo), una analogía con una comparación al lado, un gesto (girar la manivela), cinco pasos de desvanecimiento, la barra que se escala como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una hoja de papel que se dobla al medio, una y otra vez. Cada doblez duplica las capas y el borde de la pila lo muestra.

Mapa objeto a concepto: hoja sola → valor inicial; un doblez → multiplicar por dos; cantidad de dobleces → exponente; capas después de doblar → dos elevado a las vueltas; contar dobleces hasta llegar a un grosor → logaritmo, que es el nodo siguiente; desdoblar una vez → dividir por dos.

El papel aporta el gesto y el resultado visible. La pista de engranajes aporta que lo que se repite es siempre lo mismo, y la comparación con la rampa aporta lo que el papel no puede: el contraste con el crecimiento que suma. Punto de ruptura: `half_a_fold`. No existe medio doblez, así que el papel no puede acompañar al exponente cuando este se vuelve una ficha arrastrable, y por eso se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la manivela abajo a la izquierda, la hoja y su pila en el centro, la pista con marcas cruzando la pantalla, el selector de factor al costado. Desde el tercer nivel, una segunda pista con su propia manivela corre en paralelo. Gestos: `scrub`, `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela hacia adelante.** La hoja se dobla, la pila duplica sus capas y la ficha salta a la marca siguiente de la pista. Las marcas no están a distancias iguales: se separan cada vez más, y eso se ve antes de que nadie lo diga.
- **Girar hacia atrás.** La pila se desdobla y la ficha vuelve. Desde una capa sola el engranaje resiste y no gira: no hay nada que desdoblar.
- **Cambiar el diente.** El selector cambia el factor a tres o a diez, y la pista se redibuja con las marcas nuevas. La ficha se queda donde estaba y el jugador ve que la misma posición ahora significa otra cantidad de vueltas.
- **Girar las dos manivelas.** La de sumar arranca muy adelante. El jugador las gira a la vez y busca el momento en que la ficha de multiplicar pasa a la de sumar. Puede reiniciar con otra ventaja: el cruce se mueve y siempre existe.
- **Elegir un diente menor que uno.** El factor se escribe como razón, la ficha se achica en cada vuelta y se acerca a la marca del cero sin tocarla. La pista se estira para que la barra siga siendo visible.
- **Aplicar una tanda.** El jugador marca tres vueltas, las aplica de golpe, y después dos más. Compara con una tanda de cinco: las dos fichas caen en la misma marca. Compara con seis: caen en marcas distintas y las dos quedan iluminadas.

En `symbolic` la superficie cambia de forma, no de reglas: arrastrar la ficha del exponente es girar la manivela esa cantidad de veces, arrastrar la ficha de adelante es cambiar el punto de arranque, y encadenar dos tandas escribe la suma de los exponentes en el mismo renglón. La pista se pide con un toque y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`same_step_every_turn` (engranajes): cada vuelta hace exactamente lo que hizo la anterior. Acá lo que se repite es una multiplicación, y por eso la ficha avanza distancias distintas con pasos idénticos. Se ve romperse cuando el jugador cuenta seis vueltas donde hubo cinco: la ficha aterriza en una marca que ninguna cadena de tandas produce.

`steepness_independent_of_step_size` (caminante): en la rampa, lo empinado no depende del tamaño del paso. Es el invariante del nodo 19 y acá está para contrastar: en la curva sí depende, y el jugador lo ve porque el mismo salto de una vuelta cubre cada vez más distancia.

Un movimiento válido pero inútil, como girar hacia adelante y hacia atrás la misma cantidad de veces o cambiar el diente sin girar, no rompe ningún invariante: recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `nonlinear`, de apoyo `rate` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la hoja sobre la mesa y la pila que crece. Solo se mira y se predice hasta dónde llega.
- `concrete`: manivela, hoja, pila de capas contables, pista con marcas, selector de factor. Nada escrito salvo el contador de vueltas.
- `visual`: la pila se aplana en una barra y las vueltas producen barras sucesivas. Entre cada par de barras vecinas aparece una llave de altura que se repite idéntica mientras las barras crecen: eso es la razón constante, dibujada. Abajo, las dos trayectorias sobre la misma cuadrícula, con el punto de cruce marcado.
- `symbolic`: fichas de base, exponente y valor de arranque; la pista como fantasma a demanda.
- `formal`: la definición corta con voz; la manivela fantasma al lado.

Con factor menor que uno la barra se achica y la llave de altura sigue siendo la misma, ahora hacia adentro. El eje se comprime para que la barra nunca desaparezca del todo, y ahí queda plantada la pregunta que abre el nodo 25.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Capas contadas → producto de factores: al tocar la pila, las capas se despegan y se reescriben como una fila de doses multiplicados, tantos como vueltas se dieron.
2. Fila de factores → base con exponente: al tocar la fila, los factores se apilan y el conteo sube a la esquina superior derecha, con el morph que ya usó `arith.pow.repeated_scaling`. La fila queda un rato como sombra.
3. Manivela → exponente que se arrastra: al girar de nuevo con la etiqueta presente, el exponente cuenta solo, y el jugador puede tomarlo y moverlo. Es la primera vez que se comporta como una entrada.
4. Hoja inicial → factor de arranque: al empezar con tres hojas, el tres se despega y se pone adelante del bloque.
5. Diente chico → razón en la base: al elegir un factor menor que uno, la base se escribe como la razón del nodo 08 y la barra que se achica queda unida a ella por un hilo hasta que el jugador suelta.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la manivela fantasma: un crecimiento es exponencial cuando cada paso multiplica por el mismo factor; el factor es la razón entre un valor y el anterior y no cambia nunca; si el factor es mayor que uno la cantidad crece y si está entre cero y uno se achica. Propiedades: la razón entre pasos consecutivos es constante; sumar en cada paso da una recta y multiplicar da una curva que la termina pasando; encadenar tandas suma las vueltas y repetir la tanda entera las multiplica; el valor de arranque estira la curva sin cambiar su forma. Casos: el factor tiene que ser positivo, con factor uno la ficha no se mueve, y una cantidad que se multiplica por un factor menor que uno se acerca al cero sin llegar, cosa que se marca y no se resuelve. Sin símbolos nuevos: el exponente ya nació en `arith.pow.repeated_scaling`; lo nuevo es la convención de tratarlo como una entrada que se arrastra, porque la carrera obliga a moverlo.

## Generalización

El papel se retira en `symbolic`, en cuanto el exponente se vuelve una ficha arrastrable, porque el jugador va a querer ponerlo entre dos enteros y no hay medio doblez. La manivela se queda como fantasma a demanda hasta `formal`, porque las vueltas enteras siguen siendo honestas.

Variantes sin ayuda visual: bases enteras chicas con exponentes chicos; bases de dos dígitos, donde el resultado deja de poder contarse; valores de arranque distintos de uno; bases menores que uno escritas como razón; dos crecimientos exponenciales comparados entre sí y no contra una recta; predecir en qué paso se pasa un umbral, que es la pregunta que este minijuego no puede responder y que abre el siguiente. Cuando el jugador clasifica una tabla como lineal o exponencial mirando razones y no diferencias, la analogía se eliminó.

## Desafío

Correspondencia con la progresión de [H](../H-progresion-abstraccion.md): el nodo es parte del nivel 9 del ejemplo de cofres, donde aparecen exponenciales y logaritmos. Acá se juega la mitad que no necesita llave; la otra mitad es del nodo 24.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Doblar y contar.** `concrete`, `manipulate`. Factor dos fijo, hasta seis vueltas, valor de arranque uno.
2. **Cambiar el diente.** `concrete`, `recognize` y `manipulate`. Factores dos, tres y diez; al lado aparece la manivela que suma, con su propia pista.
3. **Barras y llaves.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; la pila se vuelve barra y aparece la llave de altura repetida entre barras vecinas.
4. **Tandas encadenadas.** `visual`, `explain`. Parámetros: se aplican tandas en vez de vueltas sueltas y se comparan combinaciones. Aparece `exponent_rules_mixed`.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión aparece junto a la pista y se transforma en sincronía; el exponente se arrastra.
6. **La carrera.** `symbolic` segunda mitad, `apply`. La pista queda sola y se pide con un toque; la rampa arranca con ventaja y el jugador busca el cruce.
7. **El diente chico.** Parámetros: factores menores que uno escritos como razón, y valores de arranque de dos dígitos. El teclado de fichas deja de ofrecer bases prearmadas.
8. **Sin papel.** `formal` y `abstract`, `generalize`. Definición corta con voz; tablas de valores que hay que clasificar y situaciones descritas que hay que escribir como bloque.

Qué endurece cada parámetro: las bases de dos dígitos impiden contar el resultado y obligan a razonar con el factor; el valor de arranque rompe la lectura "el número de adelante es la base"; las razones menores que uno separan "multiplicar" de "agrandar"; comparar dos exponenciales entre sí quita la referencia de la recta, que hasta ahí venía haciendo de ancla.

Desafíos de olimpíada: junto con el nodo 24, este nodo desbloquea `ch.alg.doublings_until_overflow` de [S](../S-desafios/S0-desafios.md), donde el dato oculto es la cantidad de vueltas hasta pasar un objetivo y la pista de engranajes es la figura. Mientras el jugador no tenga el nodo 24, el desafío no aparece y el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: dos pistas, una que avanza 5 en cada vuelta desde 40 y otra que multiplica por 2 desde 3. Tocar la que hace crecer más rápido la ficha. El distractor está en que la primera va adelante durante las primeras cinco vueltas.
- `explain`: dos animaciones sobre la misma pista. En una, tres vueltas y después dos caen donde caen cinco; en la otra, caen donde caerían seis. Tocar la que mezcla las reglas. El distractor es `exponent_rules_mixed`.
- `manipulate`: pila de una hoja, objetivo 64 capas en seis vueltas. Ajustar el diente hasta lograrlo y girar.
- `apply`: la carrera entre una rampa que arranca en 100 sumando 10 y una curva que arranca en 1 multiplicando por 2. Tocar el paso en que la curva pasa a la rampa, contra el tiempo objetivo del nodo.
- `generalize`: sin papel, tres tablas de valores; clasificar cada una como lineal, exponencial creciente o exponencial decreciente, arrastrando la etiqueta sobre la tabla.
- `transfer`: en la urna de `prob.dist.binomial_counts`, tocar cuántos resultados posibles hay tras cinco extracciones de dos opciones. También en `precalc.seq.geometric_sequence` y en `calc2.ser.geometric_sum`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `exponent_rules_mixed`, patrón `counterexample_slider` sobre los engranajes: la regla del jugador se enuncia como dos pistas en paralelo con un deslizador en cada exponente. El barrido arranca donde las dos fichas coinciden, que en este caso existe y es parte del interés, y sigue hasta que se separan. Voz: "Con tres vueltas y dos vueltas las dos pistas dan distinto. ¿Dónde coinciden?". El deslizador queda en manos del jugador. El patrón pide `literacy: icons`, que es la del nodo.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de esa misconception, más las de `alg.fn.linear_slope` y `arith.frac.parts_and_ratio`.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_doubling_track`, nativa, parametrizada por la base y la cantidad de vueltas. El engranaje gira, la ficha salta sobre la pista con marcas cada vez más separadas y el contador sube; gramática `nonlinear`, con la llave de altura repetida entre barras vecinas. Es la imagen de cheatsheet de `cs.alg.exponential_multiplies_each_step`.
- `slope_linear_vs_exponential_race`, con las dos rutas y ocho segundos de duración. Se pre-renderiza para abrir el nivel de la carrera y corre nativa sobre los valores que el jugador elige. Toma la pendiente de la rampa, la base de la curva y el punto de cruce, y produce también el distractor de `recognize` donde la rampa va adelante al principio.
- Reusadas: las pistas del nodo 19 como referencia de crecimiento lineal, y la ficha del nodo 08 para escribir las razones. Las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_growth_track`: `base` en {2, 3, 10} hasta el nivel 6 y hasta 20 desde el 7, con razones menores que uno desde el 7; `turns` de 1 a 6 y hasta 12 desde el 6; `start_value` fijo en uno hasta el nivel 6; `seed`.
- `gen_race_pair`: `slope` de la rampa; `head_start` de la rampa, de 20 a 200; `base` de la curva; `crossing_hint` en {visible, oculto}, que decide si la pista muestra la marca del cruce.
- `gen_exponent_chain`: `chunks`, la lista de tandas que el jugador aplica; `distractor_rule` en {suma_como_producto, producto_como_suma}, que produce las variantes de `explain` desde las reglas `detect` de la misconception.

**Literacy soportada:** de `icons` a `full_text`. El primer nivel se juega sin leer, pero el selector de factor y el contador de vueltas llevan números desde el principio y el patrón de explicación del nodo pide ese mínimo, así que el mínimo declarado es `icons`. En `full_text` la definición corta se muestra escrita además de narrada, y las situaciones descritas del nivel 8 se leen.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela tres veces; en cada giro la pila se duplica y la ficha salta. La escena vuelve al inicio y la manivela late. La demostración de la carrera se hace una vez al empezar ese nivel, con las dos manivelas girando a la vez y la cámara siguiendo a la ficha que va adelante. No se repiten si el jugador ya está girando ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
