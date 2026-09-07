# La tabla y el libro de premios (`prob.rv.expectation_as_weighted_average`)

Minijuego del nodo 36 de la espina, "Esperanza como promedio ponderado". Mecánica principal `balance`, secundarias `ledger` y `urn_dice`; analogías `balance_point_of_weights` y `fair_ticket_price`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/36-prob.rv.expectation_as_weighted_average.md): un concepto, tres dificultades reales (un promedio que no está en el medio, ponderar en vez de contar, un número que puede no ocurrir nunca), dos analogías complementarias, un gesto central (arrastrar el apoyo hasta que la tabla quede horizontal), cinco pasos de desvanecimiento, la tabla con barras sobre la recta numérica como visualización dominante, retiro de la tabla en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una tabla con marcas y un apoyo debajo. Sobre las marcas se ponen pesas. Hay un solo lugar donde la tabla queda horizontal, y las pesas más pesadas tiran ese lugar hacia ellas.

Mapa objeto a concepto: la tabla con marcas es el eje de valores; una pesa en una marca es la probabilidad de ese valor; el punto donde la tabla se equilibra es la esperanza; una pesa más pesada tira el punto hacia ella, y eso es la ponderación; pesas iguales en todas las marcas dan el promedio simple.

La segunda analogía, `fair_ticket_price`, sobre `ledger`, pone el sentido económico: el boleto es la variable aleatoria, premio por su chance es un término, el precio justo es la esperanza, muchos boletos jugados es el promedio a la larga, y un precio por encima del justo es la pérdida esperada. El libro plantea cuánto aporta cada premio; la tabla, dónde queda el total.

Punto de ruptura de la tabla: `no_balance_point`, el caso de infinitos valores donde no hay equilibrio. Punto de ruptura del boleto: la gente no paga el precio justo, lo cual está fuera de la matemática. Por eso las dos se retiran en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la tabla con su eje de marcas ocupa el centro, con el apoyo debajo; a la derecha, el libro con una fila por premio; debajo del libro, la urna del juego. Gestos: `drag`, `tap`, `hold` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una pesa del libro a una marca.** La fila y la pesa quedan unidas por un hilo. La tabla se inclina apenas la pesa toca la marca, y responde con inercia.
- **Arrastrar el apoyo.** Es el gesto central y es puramente físico. La tabla solo queda horizontal en un lugar; en cualquier otro el lado pesado baja hasta tocar la mesa.
- **Cambiar una chance en el libro.** La pesa correspondiente engorda o adelgaza y la tabla se desequilibra de nuevo. El resto de las chances se reajusta para que sigan sumando uno, y esa reacción en cadena se ve.
- **Tocar la columna del aporte.** Cada fila junta su valor y su chance en un solo término escrito sobre su barra.
- **Mantener apretado sobre la urna.** Se juegan boletos de a cientos, el libro anota y una línea del promedio acumulado se dibuja acercándose a la marca del apoyo.
- **Tocar el total de la columna de aportes.** Ilumina la marca del eje donde está el apoyo. Es la verificación.

En `symbolic` la superficie cambia de forma, no de reglas: el renglón de la suma reemplaza a la columna, tocar `E[X]` reabre la suma y tocar la suma reabre la tabla. Arrastrar una marca sobre el eje sigue siendo proponer un valor, y el renglón valida mostrando la diferencia.

## Invariante matemático

Dos invariantes, uno por mecánica.

`equality_under_identical_actions` en su forma de momentos (tabla): la tabla queda horizontal si, y solo si, el apoyo está en el punto que compensa todos los pesos por su distancia. Se ve romperse cuando el jugador pone el apoyo en el centro de las marcas con pesas desiguales: el lado pesado baja y toca la mesa, y de qué lado toca dice hacia dónde se pasó.

`count_preserved_under_regrouping` (libro): reordenar las filas no cambia el total de la columna de aportes. Es lo que después sostiene la linealidad, porque permite apilar dos libros y sumar sin mirar el orden.

De los dos sale la restricción central del nodo: las alturas de las barras suman siempre uno. Por eso el apoyo existe, por eso queda entre el valor más chico y el más grande, y por eso mover peso de una marca a otra corre el apoyo sin cambiar el total.

Un movimiento válido pero inútil, como arrastrar el apoyo más allá del extremo de la tabla, no rompe ningún invariante: la tabla simplemente se cae de ese lado y vuelve. Empujón suave, no explicación. En cambio, dejar chances que no suman uno hace aparecer en el libro una pesa fantasma con el faltante y no deja seguir.

## Representación visual

Primitiva dominante `scale`, de apoyo `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el puesto de kermés, el libro del vendedor y la fila de gente. Sin tabla ni pesas. El jugador elige qué cree que pasa con cien boletos y después ve la corrida.
- `concrete`: tabla física con marcas, pesas de distintos tamaños, apoyo arrastrable y libro con filas. Nada escrito salvo los dígitos de las marcas.
- `visual`: las pesas se aplanan en barras verticales sobre sus marcas, con la altura igual a la chance; el eje se vuelve la recta numérica del nodo 02; el apoyo se mueve de manera continua y queda entre marcas. El libro se estiliza en dos columnas de barras, valores y chances, con la del aporte creciendo como producto.
- `symbolic`: los términos `valor · chance` encadenados en un renglón, el plegado en sigma y `E[X]` sobre la marca del apoyo. Tabla a demanda como fantasma.
- `formal`: las tres frases con voz, la tabla fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Pesas a barras: al colocar la última pesa, las pesas se aplanan en barras verticales sobre sus marcas, con la altura igual a la chance.
2. Filas a productos: al tocar la columna del aporte, cada fila junta su valor y su chance con un morph en `valor · chance`, escrito sobre su barra. El hilo entre fila y barra sigue.
3. Términos a suma: al arrastrar los términos uno sobre otro, se encadenan con signos de más en un renglón. La tabla no se mueve: el renglón describe lo que ya está equilibrado.
4. Apoyo a marca: al tocar el apoyo, se contrae en un punto sobre la recta y deja una marca fija con su valor, casi siempre entre dos marcas de premio.
5. Suma a `E[X]`: al soltar el renglón sobre la marca del apoyo, la marca se convierte en una `E` y el boleto del libro se encoge dentro de un corchete a su derecha. Queda `E[X]` con la suma debajo, y los dos objetos siguen unidos en las dos direcciones.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la tabla fantasma: una variable aleatoria le pone un número a cada resultado posible; su esperanza es la suma de cada valor multiplicado por su probabilidad; es el punto donde la tabla queda en equilibrio y también el promedio al que tienden muchas repeticiones.

Notación: `E[X] = Σ xᵢ P(xᵢ)`. Símbolo nuevo: `E[X]`, con corchete y no paréntesis, porque adentro no va un evento sino un juego entero. Nace porque `P(A)` no alcanza: `A` es un evento y el boleto no es un evento. La sigma se presenta como plegado del renglón de sumas, no como símbolo con problema propio.

Propiedades: la esperanza queda entre el mínimo y el máximo, porque los coeficientes son positivos y suman uno; con chances iguales coincide con el promedio simple; mover peso hacia un valor corre la esperanza hacia ese valor; y `E[X + Y] = E[X] + E[Y]`, que vale aunque los dos juegos no sean independientes.

Casos especiales: si las probabilidades no suman uno, no hay apoyo; si todos los valores son iguales, la esperanza es ese valor; con infinitos valores puede no haber punto de equilibrio.

Entradas de cheatsheet que agrega el nodo: `cs.prob.expected_value_formula` y `cs.prob.linearity_of_expectation`, las dos en `symbolic`.

## Generalización

La tabla se retira en `symbolic`, cuando el jugador escribe la suma de productos sin necesitar el equilibrio físico. El libro se queda hasta `formal`, porque sostiene la estructura de un término por valor.

Variantes sin ayuda visual: premios negativos, que rompen la tabla física igual que las pesas negativas rompían la balanza del nodo 13; chances dadas como porcentajes; diez o más valores, donde arrastrar pesas deja de ser práctico y la suma es más rápida que el equilibrio; valores no enteros; y dos variables a la vez, para usar la linealidad. Cuando el jugador calcula la esperanza de un juego que no vio, justifica por qué queda entre el mínimo y el máximo y parte un problema usando linealidad, la analogía se eliminó.

## Desafío

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas.

1. **Equilibrar la tabla.** `concrete`, `manipulate`. Dos premios, pesas ya colocadas, solo hay que arrastrar el apoyo. Sin números en las marcas.
2. **Poner las pesas.** `concrete`, `manipulate` y `recognize`. Tres premios; las pesas salen del libro. Aparecen los dígitos de las marcas.
3. **Cambiar una chance.** `concrete`, `explain`. Modificar una chance y ver el apoyo perseguir la pesa. Misma dificultad numérica.
4. **Barras y aportes.** `visual`, `explain` y `manipulate`. Las pesas se vuelven barras y aparece la columna del aporte.
5. **Mil boletos.** `visual`, `apply`. La corrida larga con el promedio acumulado acercándose al apoyo. Predicción con la marca antes de correr.
6. **El renglón.** `symbolic` primera mitad, `manipulate` y `apply`. Los términos, la suma y `E[X]` al lado de la tabla, en sincronía.
7. **Números difíciles.** `symbolic` segunda mitad, `apply`. Parámetros: premios negativos, chances en porcentaje, valores no enteros, hasta diez valores. La tabla se pide con un toque.
8. **Dos juegos a la vez.** `formal` y `abstract`, `generalize`. Definición corta con voz, linealidad con dos boletos amarrados, y juegos que el jugador no vio antes.

Qué endurece cada parámetro: la cantidad de premios hace que arrastrar pesas deje de ser práctico y empuja hacia la suma; los premios negativos rompen la tabla física y fuerzan el renglón; las chances en porcentaje separan la porción de su escritura; los valores no enteros impiden buscar el apoyo sobre una marca; los dos juegos a la vez rompen la idea de que la esperanza se calcula de a un libro.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo es requisito de `ch.prob.expected_rolls_until_six`, de nivel `international`, que corre justamente sobre `balance`, `ledger` y `urn_dice`. El dato oculto es la ecuación que se refiere a sí misma, y se descubre escribiendo la esperanza después de la primera tirada como un reinicio del mismo juego. Las dos construcciones esperadas son partir la primera tirada en éxito y reinicio y poner la esperanza en los dos platos para resolverla como ecuación, o mantener apretado para simular muchas corridas y leer el promedio estabilizado. Sus `cheatsheet_refs` incluyen `cs.prob.expected_value_formula` y `cs.prob.linearity_of_expectation`, las dos agregadas acá.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro libros de premios con sus tablas armadas y el apoyo en distintos lugares. Tocar la que muestra dónde se equilibra el juego a la larga. Los distractores son el apoyo en el centro de las marcas, sobre el premio más grande y sobre el premio más probable.
- `explain`: mover las pesas y elegir entre tres animaciones cuál explica por qué el equilibrio se corre hacia la pesa mayor. Una muestra el apoyo siguiendo el peso; otra el apoyo quedándose en el centro con la tabla inclinada; otra las pesas cambiando de valor al moverse. El distractor elegido clasifica.
- `manipulate`: tres premios de valores 0, 2 y 10 con chances 1/2, 1/3 y 1/6. Colocar cada pesa en su marca y arrastrar el apoyo hasta el equilibrio. La tabla es el juez.
- `apply`: con los premios y sus chances en el libro, arrastrar la marca del precio justo del boleto antes de jugar. Después se corren mil boletos y se compara, contra el tiempo objetivo del nodo.
- `generalize`: cambiar la chance del premio grande sin cambiar los premios y marcar antes de soltar hacia dónde se mueve el equilibrio. El resto de las chances se reajusta solo, y eso también hay que anticiparlo.
- `transfer`: en el mapa de `linalg.vec.span_and_combination`, escribir el equilibrio como una combinación de pasos con coeficientes que suman uno y ver que el punto cae dentro del polígono de los ingredientes. También `adv.num.monte_carlo_pi` (el promedio de aciertos como estimación), `geom.area.area_by_random_darts` (la misma idea en geometría) y `csmath.info.entropy_as_surprise` (la esperanza de la sorpresa).

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `equiprobable_assumed`, patrón `counterexample_slider` sobre `urn_dice`. Acá se presenta como promediar los premios sin pesarlos, o poner el apoyo en el centro de las marcas. El juego pone dos lecturas en paralelo: arriba, una tabla con pesas todas iguales y el apoyo en el centro, la cuenta del jugador; abajo, la tabla real con las pesas del libro. Un deslizador controla la chance del premio grande y la recorre de casi cero a casi uno. Las dos marcas de apoyo se separan enseguida. Voz: "Promediaste los premios como si todos salieran igual de seguido. Movete la chance del premio grande y mirá los dos apoyos". El deslizador queda en manos del jugador. No se reabre desde el estado erróneo, porque no hay estado: hay una afirmación falsa. Después del contraejemplo el ítem vuelve con un dado cargado.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de esta misconception y desde las de los dos prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `balance_scene_plank_with_weights`, nativa. La imagen central: la tabla con las pesas sobre sus marcas, el apoyo que se arrastra y la inclinación con inercia; parametrizada por valores, pesos y la posición propuesta del apoyo. Produce también las animaciones de `explain`.
- `ledger_scene_prize_ledger`, nativa. El libro con una fila por premio, la columna del aporte llenándose y el morph de cada fila a su término; parametrizada por premios y chances.
- `urn_scene_frequency_bar_stabilizes`, reusada del nodo 34. Acá dibuja el promedio acumulado en vez de una frecuencia: la misma curva calmándose contra la misma línea punteada, que ahora es el apoyo.

Ninguna lleva texto rasterizado: valores, chances y el corchete de `E[X]` los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_prize_book`: `n_prizes` (2 en el nivel 1, hasta 10 en el 7); `value_range` (0 a 10 hasta el nivel 6, con negativos desde el 7); `prob_shape` en {uniforme, sesgada, muy sesgada}; `prob_format` en {fracción, porcentaje}; `integer_values`; `seed`.
- `gen_plank_layout`: coloca las marcas del eje; `mark_spacing`; `pivot_on_mark` (falso desde el nivel 4, para que el apoyo caiga entre marcas); `pivot_guess` inicial para los ítems de `recognize`.
- `gen_long_run`: `n_tickets` (por potencias, de 100 a 5000); `seed`. Alimenta la curva del promedio acumulado.
- `gen_linear_pair`: dos juegos, con opción de amarrarlos para que no sean independientes, usado en el nivel 8 para la linealidad.

**Literacy soportada:** de `icons` a `full_text`. El gesto central, arrastrar el apoyo hasta que la tabla quede horizontal, se juega sin leer y sin números: es motricidad y equilibrio, y el nivel 1 no muestra dígitos. El mínimo es `icons` porque desde el nivel 2 las marcas del eje llevan dígitos y el libro trae chances escritas como fracciones. En `full_text` las tres frases de la definición se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la pesa de la primera fila del libro y la suelta en su marca; la tabla se inclina. Toma la segunda y la suelta; se inclina menos. Con todas puestas, arrastra el apoyo hasta que la tabla queda horizontal y la marca de abajo se ilumina. La escena vuelve al inicio y el apoyo late. La demostración de mantener apretado sobre la urna no se repite: es la del nodo 34 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, tolerancia del equilibrio y de la predicción de `apply`, umbrales de ítems por verbo y espera de la demostración viven en [K](../K-evaluacion.md).
