# La urna y la barra (`prob.basic.probability_as_proportion`)

Minijuego del nodo 34 de la espina, "Probabilidad como proporción". Mecánica principal `urn_dice`, secundarias `tiles` y `sorter`; analogía `urn_of_balls`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/34-prob.basic.probability_as_proportion.md): un concepto, tres dificultades reales (una tirada no dice nada, la porción se mide sobre el total, no todos los resultados pesan igual), una analogía contable, un gesto central (mantener apretado y ver la barra calmarse), cinco pasos de desvanecimiento, la barra de frecuencias contra la línea punteada como visualización dominante, retiro de la urna en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una urna con bolitas de colores. El jugador mete la mano sin mirar y saca una. Cuantas más bolitas de un color hay, más seguido sale ese color.

Mapa objeto a concepto: la urna es el espacio muestral; una bolita es un resultado; el color es el evento; la porción de bolitas de un color es la probabilidad; sacar sin mirar es un ensayo al azar; devolver la bolita es la independencia entre extracciones; dejarla afuera es la dependencia.

Punto de ruptura: `uncountable_outcomes`. Cuando el resultado es dónde cayó un dardo, no hay bolitas que contar y la porción pasa a ser área. Por eso la urna se desvanece en `formal` y por eso el dardo es un destino de transferencia y no un nivel más ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la urna arriba al centro; abajo, los cajones del clasificador y, debajo de todo, dos barras del mismo largo, la de la urna y la de las frecuencias. Gestos: `tap`, `hold`, `drag` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar la urna.** Sale una bolita, cae en el cajón de su color, la columna de ese cajón sube un escalón y la bolita vuelve sola a la urna. La composición queda intacta y se ve que queda intacta.
- **Mantener el dedo apretado sobre la urna.** Las extracciones se aceleran. La barra de frecuencias se sacude mucho al principio y cada vez menos, alrededor de una línea punteada que no se mueve. Soltar detiene la corrida donde esté.
- **Arrastrar bolitas dentro o fuera de la urna.** La línea punteada salta de inmediato al lugar nuevo, antes de sacar nada. Es el gesto que separa la porción de la urna de la proporción observada.
- **Arrastrar una bolita a un cajón.** Define el evento a mano. Con dos colores es obvio; con cuatro colores y un cajón que junta dos, el evento deja de ser un color y empieza a ser un conjunto.
- **Arrastrar la marca sobre la regla de la barra.** Es la predicción: dónde va a quedar la proporción después de tantas tiradas. La marca no se borra cuando la corrida la pasa de largo.
- **Tocar la barra de la urna.** Superpone las dos barras y muestra que coinciden. Es la verificación.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha de fracción sobre un cajón escribe `P(A)`; tocar `P(A)` pide la urna fantasma; arrastrar la marca sigue siendo predecir, ahora sobre un eje sin bolitas.

## Invariante matemático

`proportion_stable_in_long_run`: una tirada suelta es impredecible, pero la proporción de muchas tiradas se acerca a la porción de la urna y se queda ahí.

Se ve romperse de dos maneras, y las dos son informativas. Si el jugador decide con cinco extracciones, la barra está lejos de la línea y la decisión sale mal seguido: el invariante no se rompe, todavía no se aplica. Si el jugador cambia la urna en medio de la corrida, la línea punteada salta y la barra empieza a perseguir un blanco nuevo: ahí sí se rompe la condición, porque la porción tiene que quedarse quieta para que algo pueda acercarse a ella.

De apoyo, el invariante de `tiles` en su forma de partición: la barra del total siempre está llena, y por eso las porciones de todos los cajones suman uno.

Un movimiento válido pero inútil, como sacar tres veces antes de decidir, no rompe nada: el dedo late sobre la urna pidiendo la corrida larga. Empujón suave, no explicación.

## Representación visual

Primitiva dominante `random`, de apoyo `partition` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el puesto de feria con dos bolsas de tela, sin barras ni contadores. Solo se mira, se elige una bolsa y se ve qué sale.
- `concrete`: urna con bolitas, cajones y bolitas apiladas. Nada escrito.
- `visual`: las pilas se endurecen en columnas con contador; la barra de frecuencias sube y baja alrededor de la línea punteada; el eje de tiradas se comprime a medida que crece para que cien y mil quepan en la pantalla. Al costado, la barra del total partida en partes iguales con las del evento pintadas.
- `symbolic`: fichas de fracción y el renglón `P(A) = 3/4`; la urna a demanda como fantasma.
- `formal`: las tres frases con voz, la barra del total al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Bolitas a columnas: al terminar la primera corrida larga, las bolitas apiladas se endurecen en una columna con contador de dígitos.
2. Columnas a porción: al tocar el contador, las columnas se acuestan y se pegan en una sola barra de largo fijo; la parte pintada es la porción.
3. Urna a barra: al arrastrar la barra sobre la urna, las bolitas se derraman en fila, se aplanan y forman una barra idéntica; las dos se superponen y ahí queda la línea punteada.
4. Barra a ficha: al tocar la parte pintada, se contrae en una ficha de fracción, con el denominador tomado de las partes y el numerador de las pintadas. La barra queda como sombra reabrible.
5. Ficha a `P(A)`: al soltar la ficha sobre el cajón, el ícono del cajón se encoge entre paréntesis y la barra sombra se para de canto y se convierte en la `P`. El renglón aparece con un morph.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la urna fantasma: la probabilidad de un evento es la porción del total que le corresponde; cuando todos los resultados pesan igual, esa porción se cuenta como los que cumplen sobre todos; repitiendo muchas veces, la proporción observada se acerca a esa porción.

Propiedades: `0 ≤ P(A) ≤ 1`, porque la barra no admite una parte más larga que ella misma; las porciones de todos los resultados suman uno, porque la barra queda llena; la porción depende de la mezcla y no del tamaño de la urna.

Casos especiales: un evento sin bolitas vale cero, uno con todas vale uno, y la urna vacía no define nada. Símbolo nuevo: `P(A)`, que nace de dos problemas juntos, comparar tres urnas sin dibujarlas y nombrar el evento aparte del número.

Entradas de cheatsheet que agrega el nodo: `cs.prob.probability_as_fraction`, `cs.prob.probability_between_0_and_1` y `cs.prob.long_run_proportion`, las tres en `symbolic`.

## Generalización

La urna se retira en `symbolic`, cuando el jugador escribe la probabilidad mirando solo la barra. La barra del total se queda hasta `formal`, porque sostiene el rango entre cero y uno.

Variantes sin ayuda visual: urnas de tres y cuatro colores con eventos que agrupan más de uno; bolitas que no son intercambiables y hay que pesar antes de contar; eventos definidos por una regla del clasificador, del tipo "grande o azul"; comparación de dos probabilidades sin denominador común; y por último la porción como área, donde contar deja de servir. Cuando el jugador resuelve todo eso sin pedir la urna y distingue cuándo contar y dividir vale de cuándo no, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas.

1. **Sacar y ver.** `concrete`, `manipulate`. Dos colores, urna de cuatro a seis bolitas, extracción de a una con toque. Sin contadores.
2. **El dedo apretado.** `concrete`, `explain` y `manipulate`. Aparece la corrida larga y la línea punteada. Misma dificultad numérica.
3. **Barras y contadores.** `visual`, `recognize` y `manipulate`. Las pilas se vuelven columnas con dígito y aparece la barra del total. Comparación entre dos urnas de tamaños distintos.
4. **La marca antes de sacar.** `visual`, `apply`. Predicción con la regla antes de la corrida. Urnas de tres colores.
5. **Fichas y paréntesis.** `symbolic` primera mitad, `manipulate` y `apply`. La ficha de fracción y el renglón `P(A)` al lado de la barra, en sincronía.
6. **Sin urna.** `symbolic` segunda mitad, `apply`. La urna se pide con un toque. Parámetros: cuatro colores, eventos que agrupan colores, denominadores no comunes.
7. **Pesos desparejos.** `formal` y `abstract`, `generalize`. Bolitas de tamaños distintos, el disco giratorio con sectores desiguales y la baldosa con regiones. Aparece `equiprobable_assumed` con fuerza.

Qué endurece cada parámetro: el tamaño de la urna obliga a comparar por porción y no por cantidad de rojas; la cantidad de colores rompe la lectura "esto contra lo otro"; los eventos que agrupan hacen necesario el nombre `A`; los pesos desparejos rompen la cuenta de casos y son la única defensa contra la misconception central.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo es requisito de `ch.prob.two_dice_hidden_grid`, de nivel `training`, donde el dato oculto es el espacio muestral verdadero y se descubre acostando la grilla de seis por seis de pares. Las dos construcciones esperadas son justamente las dos caras de este nodo: contar celdas sombreadas sobre el total, o mantener apretado para tirar muchas veces y leer la proporción estabilizada. Sus `cheatsheet_refs` incluyen `cs.prob.probability_as_fraction` y `cs.prob.long_run_proportion`, ambas agregadas acá.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro urnas a la vista, con totales distintos, mezclas 3 de 4, 5 de 8, 30 de 60 y 7 de 10. Tocar aquella donde sacar roja es más probable.
- `explain`: tres corridas animadas sobre urnas ya vistas. En una la barra se acerca a la línea de su urna y se queda; en otra se acerca a una línea que no corresponde; en otra sigue saltando igual de fuerte después de mil tiradas. Tocar la que muestra lo que de verdad pasa. El distractor elegido clasifica.
- `manipulate`: urna de dos colores y la marca de un cuarto sobre la barra. Agregar o quitar bolitas hasta que la porción de azules caiga en la marca. Tres de doce y una de cuatro se aceptan igual.
- `apply`: urna con 3 rojas de 5. Arrastrar la marca donde va a quedar la proporción en cien extracciones, después correrlas. Se puntúa la cercanía contra el tiempo objetivo del nodo.
- `generalize`: un disco giratorio con un sector marcado que no es una fracción obvia. Armar una urna donde sacar roja sea igual de probable que caer en ese sector.
- `transfer`: en la baldosa con regiones de `geom.area.area_by_random_darts`, marcar en la barra la porción del área donde caería un dardo al azar. También `arith.pct.percent_of_total` (la misma porción sobre cien), `disc.count.sum_rule` (categorías que no se pisan, en el libro de cuentas) y `csmath.info.entropy_as_surprise` (la porción como ingrediente de la sorpresa).

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `equiprobable_assumed`, patrón `counterexample_slider` sobre `urn_dice`. El jugador cuenta resultados y divide por cuántos son. El juego pone dos lecturas en paralelo: arriba, una barra partida en once tramos iguales, su cuenta para la suma de dos dados; abajo, la grilla de seis por seis con los treinta y seis pares y un deslizador que recorre las sumas de dos a doce pintando las celdas de cada una. Al mover el deslizador, las celdas pintadas cambian de cantidad, una para el dos y seis para el siete, y las barras se separan a la vista. Voz: "Contaste once resultados. Mirá cuántas casillas hay en cada uno. ¿Pesan lo mismo?". El deslizador queda en manos del jugador. No se reabre desde el estado erróneo, porque no hay estado: hay una afirmación falsa. Después del contraejemplo el ítem vuelve con una urna de bolitas de dos tamaños, para que la idea no quede pegada a los dados.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de esta misconception y desde las del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `urn_scene_draw_and_tally`, nativa. La urna del jugador, la extracción y la columna que sube; parametrizada por composición, cantidad de extracciones y semilla. Produce también las animaciones de `explain`.
- `urn_scene_fraction_of_total`, nativa. El derrame de la urna, el aplanado en barra y el morph a la ficha de fracción; gramática `partition`. Parametrizada por composición y color objetivo.
- `urn_scene_frequency_bar_stabilizes`, nativa. La imagen central: la barra que se sacude cada vez menos contra la línea punteada, con el eje de tiradas comprimiéndose. Parametrizada por porción, cantidad de tiradas y semilla. Se comparte con el nodo 36.

Ninguna lleva texto rasterizado: contadores y fracciones los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_urn`: `colors` (2 en los niveles 1 y 2, hasta 4 desde el 4); `total_range` (4 a 6 en el nivel 1, hasta 60 desde el 3); `target_share` (fracción pedida, con denominador simple hasta el nivel 5); `equal_weights` (verdadero hasta el nivel 6, falso en el 7); `seed`.
- `gen_draw_run`: `n_draws` (por potencias, de 10 a 2000); `with_replacement` (siempre verdadero en este nodo); `seed`.
- `gen_event_bin`: define el evento del clasificador; `size` (uno o más colores por cajón); `rule_kind` en {color, tamaño, color o tamaño}.
- `gen_weighted_space`: `space_kind` en {par de dados, disco de sectores}; `grid_size` (seis por seis en el par de dados); `sector_weights` (los pesos desiguales de los sectores del disco); `seed`. Es el generador de los contraejemplos del nivel 7.

**Literacy soportada:** de `icons` a `full_text`. La corrida con el dedo apretado y la comparación de urnas se juegan sin leer, pero desde el segundo nivel los contadores llevan dígitos y la ficha de fracción tiene numerador y denominador, y por eso el mínimo es `icons`. En `full_text` las tres frases de la definición se muestran escritas además de narradas.

**Instrucción por demostración:** la primera vez, una mano fantasma toca la urna, sale una bolita, la lleva al cajón de su color y suelta; la columna sube. Después la mano vuelve a la urna, mantiene el dedo apretado y las extracciones se aceleran hasta que la barra se calma contra la línea punteada. La escena vuelve al inicio y la urna late. Se repite solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, tolerancia de la predicción de `apply`, umbrales de ítems por verbo y espera de la demostración viven en [K](../K-evaluacion.md).
