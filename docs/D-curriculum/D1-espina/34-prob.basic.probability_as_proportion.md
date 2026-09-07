# 34 — Probabilidad como proporción (`prob.basic.probability_as_proportion`)

> Locale `es`: "Probabilidad como proporción". Minijuego: [La urna y la barra](../../F-minijuegos/prob.basic.probability_as_proportion.md).

**Nodo:** `prob.basic.probability_as_proportion` · **Área:** prob · **Nivel:** 6 · **Primitiva:** `random` · **Mecánica principal:** `urn_dice` (secundarias `tiles`, `sorter`) · **Literacy:** `icons` · **Analogía:** `urn_of_balls`

## 1. Concepto

La probabilidad de algo es la porción del total que le corresponde, y esa porción es lo que aparece cuando el experimento se repite muchas veces. Al terminar, el jugador arma una urna que cumpla una porción pedida, predice dónde se va a estabilizar la barra de frecuencias antes de sacar una sola bolita, y escribe esa porción como un número entre cero y uno sin dibujar la urna. Antes sabía que una fracción es parte de un todo. No sabía que el azar repetido devuelve exactamente esa fracción.

## 2. Prerequisitos

- `arith.frac.parts_and_ratio` (nodo [08](08-arith.frac.parts_and_ratio.md)): la fracción como partes del todo. Se usa entera. El corte en partes iguales, la lectura "cuántas de cuántas", la equivalencia entre fracciones de denominadores distintos y, sobre todo, la urna: `urn_of_balls` ya se usó allí como el todo contable, al lado de la pizza y de la barra. El jugador llega sabiendo que tres de cuatro y treinta de sesenta son la misma porción, y eso es lo que le permite comparar dos urnas de tamaños distintos sin contar dos veces.

La arista no sigue el orden escolar. La escuela suele abrir probabilidad contando casos: combinatoria primero, probabilidad después. Acá el orden es el inverso, y el `next` del nodo es justamente la grilla del espacio muestral. La razón está en [C0](../../C-knowledge-graph/C0-esquema.md): contar es una técnica para obtener la porción, no la idea. Quien aprende a contar antes de haber visto una barra estabilizarse cree que la probabilidad es una cuenta, y ante un dado cargado hace la cuenta igual.

## 3. Dificultad cognitiva real

Lo difícil no es dividir favorables sobre totales. Son tres capacidades que la fórmula esconde:

1. **Aceptar que una tirada no dice nada.** La probabilidad no es una predicción sobre la próxima bolita sino una propiedad de la repetición. El jugador tiene que sostener dos cosas a la vez: cada extracción es impredecible y la proporción de muchas extracciones es previsible. Es lo que el invariante `proportion_stable_in_long_run` de la mecánica pone en juego.
2. **Medir la porción sobre el total y no sobre el resto.** Tres rojas y una azul se lee como tres de cada cuatro, no como tres contra una. Las dos lecturas son legítimas, pero solo la primera vive entre cero y uno y se compara con otra urna.
3. **No suponer que todos los resultados pesan igual.** Esta es la que se lleva casi todo el trabajo del nodo. Contar resultados y dividir por cuántos hay funciona en la urna de bolitas idénticas y falla en cuanto los resultados se agrupan: la suma de dos dados tiene once resultados posibles y ninguno de los once vale un onceavo. Es `equiprobable_assumed`.

## 4. Problema intuitivo

Un puesto de feria con dos bolsas de tela. En la bolsa chica hay cuatro bolitas y el vendedor deja ver que tres son rojas. En la bolsa grande hay sesenta y el vendedor las derrama un momento sobre la mesa: se ven muchísimas rojas y muchísimas azules. Gana quien saca una roja sin mirar. ¿De cuál bolsa conviene sacar?

En `real` la escena es solo eso, filmada y sin números. En `intuition` la escena se detiene antes de la mano: el jugador toca una bolsa y después ve qué sale, cinco veces seguidas. Con cinco extracciones no alcanza para decidir nada, y esa frustración es intencional: es la que hace falta para que el gesto de mantener apretado y sacar cien veces tenga sentido cuando aparezca.

## 5. Analogía del mundo real

`urn_of_balls`, la analogía del YAML, sobre la mecánica `urn_dice` ([G0](../../G-analogias/G0-reglas.md)).

Mapa objeto a concepto: la urna es el espacio muestral; una bolita es un resultado; el color de la bolita es el evento; la porción de bolitas de un color es la probabilidad; meter la mano sin mirar es un ensayo al azar; devolver la bolita a la urna es la independencia entre extracciones; dejarla afuera es la dependencia.

Invariante que conserva: la porción no cambia por sacar. Mientras la bolita vuelva a la urna, la composición es la misma antes y después, y por eso la barra de frecuencias puede acercarse a algo fijo. Cuando la bolita se queda afuera, la porción se mueve, y eso mismo es la puerta del nodo 35.

Punto de ruptura: `uncountable_outcomes`. La urna solo sabe de cosas que se pueden contar. Cuando el resultado es "dónde cayó el dardo en la baldosa", no hay bolitas que contar y la porción pasa a ser un área. Por eso la analogía se retira en `formal` y por eso el dardo es uno de los destinos de transferencia y no una variante interna.

Por qué esta y no la ruleta. `spinner_wheel` mide la porción como sector, es decir, como magnitud continua, y eso hace innecesario el paso por la fracción contable que el jugador acaba de aprender. La ruleta llega en `prob.basic.equally_likely_or_weighted`, donde el punto es justamente que los sectores pueden ser desiguales. Acá la urna es mejor porque sus objetos son los mismos que el jugador ya contó en el nodo 01 y ya partió en el nodo 08.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas, cada una con su aporte ([E0](../../E-mecanicas/E0-catalogo.md)).

`urn_dice` es la principal y provee el azar: el ensayo, la repetición y el conteo acumulado. `sorter` provee el evento: qué bolitas cuentan como "lo que busco" se decide arrastrándolas a un cajón, y el cajón es lo que después se llamará `A`. `tiles` provee la porción: la barra del total se corta en partes iguales y las que corresponden al cajón se pintan. Los tres se encuentran en un solo gesto: la bolita que sale de la urna cae en un cajón, la columna de ese cajón crece un escalón, y la barra de abajo se repinta con la porción acumulada.

Gestos: `tap`, `hold`, `drag`.

1. La urna en el centro, con las bolitas visibles al empezar y tapadas al sacar. Debajo, dos cajones del clasificador y una barra larga partida en tantas partes como bolitas hay.
2. Demostración: una mano fantasma toca la urna, sale una bolita, la lleva al cajón de su color y suelta. La columna del cajón sube un escalón. La mano vuelve a la urna, mantiene el dedo apretado y las extracciones se aceleran: las columnas crecen, y sobre la barra de frecuencias aparece una línea punteada que no se mueve. La escena vuelve al inicio.
3. El jugador toca para sacar de a una. Cada bolita vuelve sola a la urna después de contarse: la composición se ve intacta.
4. El jugador mantiene apretado. Las extracciones corren rápido y la barra se sacude mucho al principio y cada vez menos. Con pocas tiradas puede quedar lejos de la línea punteada, y eso no se marca como error: es el fenómeno.
5. El jugador arrastra bolitas dentro o fuera de la urna. La línea punteada salta al lugar nuevo de inmediato, antes de sacar nada. Ese salto es lo que enseña que la porción es de la urna y no de las tiradas.
6. Verificación (`cs.prob.long_run_proportion`): las dos barras se superponen, la de la urna y la de las frecuencias, y quedan del mismo largo.

Nada se llama incorrecto. Predecir mal dónde va a caer la barra deja la predicción marcada en la regla y la barra la pasa de largo o se queda corta; la marca no se borra y sirve para el intento siguiente. Un movimiento válido pero inútil, como sacar tres veces y decidir, recibe un empujón suave: el dedo late sobre la urna pidiendo que se mantenga apretado.

## 7. Representación visual

Capa `visual`, primitiva dominante `random`, con `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

Lo que se desplaza es la punta de la barra de frecuencias, que sube y baja cada vez menos alrededor de la línea punteada. Lo que se escala es el eje de la cantidad de tiradas, que se comprime a medida que crece para que cien y mil quepan en la misma pantalla. Lo que se conserva es la línea punteada: mientras la urna no cambie, no se mueve, y esa quietud en medio del temblor es la imagen central del nodo.

Al costado, la barra del total en la gramática `partition`: un rectángulo largo dividido en partes iguales, con las partes del evento pintadas. Es la misma barra del nodo 08 y se comporta igual.

Todavía no se muestra el espacio muestral como grilla, ni la suma de dos experimentos, ni ningún caso donde las partes no sean iguales entre sí. Esos son el nodo siguiente y `prob.basic.equally_likely_or_weighted`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, siguiendo las etapas de desvanecimiento de `urn_dice` ([H](../../H-progresion-abstraccion.md)). Cada paso lo dispara un gesto del jugador.

1. **Bolitas a columnas.** Al completar la primera tanda con el dedo apretado, las bolitas acumuladas en cada cajón se apilan y el apilado se endurece en una columna con un contador de dígitos arriba. Los bordes redondos se pierden; el color queda.
2. **Columnas a porción de la barra.** Al tocar el contador, las dos columnas se acuestan y se pegan una al lado de la otra formando una sola barra de largo fijo. La parte roja de esa barra es la porción. Las columnas ya no crecen hacia arriba: la barra se reparte.
3. **Urna a la misma barra.** Al arrastrar la barra sobre la urna, las bolitas de la urna se derraman en fila, se aplanan y forman una segunda barra idéntica en largo. Las dos barras quedan superpuestas y la línea punteada es donde coinciden. El objeto es el mismo: la urna se convirtió en su propia medida.
4. **Barra a ficha de fracción.** Al tocar la parte pintada, esa parte se contrae hasta ser una ficha con la fracción escrita, con el denominador tomado de la cantidad de partes y el numerador de las pintadas. La barra queda atrás como sombra y se puede volver a abrir tocando la ficha.
5. **Ficha a `P(A)`.** Al soltar la ficha sobre el cajón del clasificador, el ícono del cajón se encoge y entra entre paréntesis, y la barra que quedaba de sombra se para de canto y se convierte en la letra `P`. El renglón `P(rojo) = 3/4` aparece con un morph, sin que nada se reemplace.

## 9. Notación matemática

Nace `P(A)`.

La regla de oro de [H](../../H-progresion-abstraccion.md) pide el problema que lo hace necesario, y acá son dos problemas encadenados. El primero es comparar. Con tres urnas sobre la mesa hay que decir cuál conviene, y arrastrar tres barras para superponerlas es lento y no se puede anotar. El segundo es nombrar el evento aparte del número. Hasta este punto el evento era un cajón que se veía; en cuanto el evento pasa a ser "roja o verde", el cajón necesita nombre, y el nombre tiene que quedar separado del valor. `P(A)` resuelve las dos cosas: `A` es el cajón, `P` es la lectura de la barra, y el paréntesis es lo que dice que uno se aplica al otro.

Con `P(A)` llega su rango: `0 ≤ P(A) ≤ 1`. No es una convención sino la lectura de la barra, que no puede ser más corta que nada ni más larga que el total.

## 10. Definición formal

Capa `formal`: texto corto con voz y la urna al lado como fantasma. Tres frases, de a una.

"La probabilidad de un evento es la porción del total que le corresponde." "Cuando todos los resultados pesan igual, esa porción se calcula contando: los que cumplen sobre todos." "Si el experimento se repite muchas veces, la proporción observada se acerca a esa porción."

Condiciones y casos especiales, verificados sobre el objeto: la urna no puede estar vacía, porque no habría de qué sacar una porción; un evento sin bolitas tiene probabilidad cero y su cajón queda vacío para siempre; un evento con todas las bolitas tiene probabilidad uno; las porciones de todos los colores suman uno, y eso se ve porque la barra está llena. La segunda frase lleva una condición que el jugador ya sufrió: solo vale si los resultados pesan igual.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra evento como algo separado de un color, y el caso de la urna con un solo color.

## 11. Propiedades

- **La probabilidad vive entre cero y uno.** Ligada a la barra del total, que no admite una parte más larga que ella misma. Cheatsheet `cs.prob.probability_between_0_and_1`.
- **Las probabilidades de todos los resultados suman uno.** Ligada a que la barra queda llena cuando se pintan todos los cajones. Es lo que después vuelve como regla del complemento en `prob.basic.complement_fills_the_rest`.
- **La proporción observada se acerca a la porción de la urna cuando las tiradas crecen.** Ligada al gesto de mantener apretado y ver la barra calmarse contra la línea punteada. Cheatsheet `cs.prob.long_run_proportion`. Es la propiedad que separa este nodo de una lección de fracciones.
- **La porción no depende del tamaño de la urna sino de la mezcla.** Ligada a la comparación de la bolsa de cuatro con la de sesenta, y heredada directamente de la equivalencia de fracciones del nodo 08.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), instanciados dentro de la mecánica. Las probes del locale, desarrolladas:

- `recognize`: cuatro urnas con mezclas distintas, todas a la vista, con cantidades totales distintas para que no alcance con contar rojas. Tocar aquella en la que sacar una roja es más probable. Los distractores los genera `detect`: la urna con más rojas pero también más azules, la urna con la misma cantidad de rojas y menos total, la urna con la porción invertida.
- `explain`: tres corridas de extracciones sobre urnas ya vistas, animadas y sin texto. En una la barra se acerca a la línea punteada y se queda; en otra la barra se acerca a una línea que no corresponde a la urna; en otra la barra sigue saltando igual de fuerte después de mil tiradas. Tocar la que muestra lo que de verdad pasa. Cada distractor es una misconception del vecindario.
- `manipulate`: una urna con bolitas de dos colores y la barra del total al lado con un cuarto marcado. Agregar o quitar bolitas hasta que la porción de azules caiga exactamente sobre la marca. Hay más de una solución y todas se aceptan: tres de doce y una de cuatro valen lo mismo.
- `apply`: antes de sacar, arrastrar una marca sobre la regla de la barra para predecir dónde va a quedar la proporción en cien extracciones. Después se corre la simulación. Se puntúa la cercanía, no el acierto exacto, contra el tiempo objetivo del nodo.
- `generalize`: armar una urna donde sacar una roja sea tan probable como caer en un sector marcado de un disco giratorio que se muestra al lado. El disco no está partido en partes iguales, así que la porción hay que leerla del sector y traducirla a bolitas.
- `transfer`: sobre la baldosa con regiones de `geom.area.area_by_random_darts`, marcar en la barra la porción del área donde caería un dardo tirado al azar. No hay bolitas: la porción es superficie.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`equiprobable_assumed`**, patrón `counterexample_slider` sobre `urn_dice`. Aparece cuando el jugador cuenta los resultados posibles y divide por cuántos son, sin mirar cuánto pesa cada uno. El caso canónico es la suma de dos dados. El jugador estima que la suma siete sale una de once veces, porque las sumas posibles van de dos a doce. El juego pone dos lecturas en paralelo. Arriba, una barra partida en once tramos iguales, la cuenta del jugador. Abajo, la grilla de seis por seis con los treinta y seis pares, y un deslizador que recorre las sumas de dos a doce pintando las celdas de cada una. Al mover el deslizador, las celdas pintadas cambian de cantidad: una sola para el dos, seis para el siete, una sola para el doce. Las dos barras se separan a la vista. Voz: "Contaste once resultados. Mirá cuántas casillas hay en cada uno. ¿Pesan lo mismo?". El deslizador queda en manos del jugador para que lo recorra entero. No se reabre desde un estado erróneo porque no hay estado: hay una afirmación falsa. Después del contraejemplo, el ítem vuelve con una urna donde las bolitas rojas son de dos tamaños y se cuentan igual, para que la idea no quede pegada a los dados.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de esta misconception y de las del prerequisito directo.

## 13. Generalización

La analogía se retira en dos tiempos. La urna se va en `symbolic`, cuando el jugador escribe `P(A)` mirando solo la barra y ya no necesita ver bolitas; a partir de ahí se pide con un toque y aparece como fantasma. La barra del total sobrevive hasta `formal`, porque es lo que sostiene el rango entre cero y uno.

Variantes sin ayuda visual, en orden: urnas de tres y cuatro colores, donde el evento agrupa más de uno; urnas donde las bolitas no son intercambiables y hay que mirar el peso antes de contar; eventos definidos por una regla del clasificador en vez de por un color, del tipo "que sea grande o azul"; comparación de dos probabilidades sin denominador común; y por último la porción como área, donde contar deja de servir.

El nodo está en `abstract` cuando el jugador escribe la probabilidad de un evento sin dibujar la urna, distingue una situación donde contar y dividir vale de una donde no, y explica sin analogía por qué la barra se calma. La forma completa de esa capa aparece mucho más adelante, cuando la probabilidad se vuelve una medida cualquiera sobre un conjunto.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas:

- `geom.area.area_by_random_darts` (`urn_dice` con `tiles`): la misma porción, medida como superficie. Se tiran dardos sobre una figura dentro de un cuadrado y la fracción de aciertos estima el área. Es el destino donde la analogía se rompe, y por eso es la mejor prueba de que la idea sobrevivió sin ella.
- `disc.count.sum_rule` (`ledger` con `urn_dice`): repartir los resultados en categorías que no se pisan y sumarlas. La barra del total vuelve como libro de cuentas, y la misma misconception vigila la puerta.
- `csmath.info.entropy_as_surprise` (`urn_dice` con `ledger`): cuánta sorpresa hay en una urna. Una urna de un solo color no sorprende nunca; una urna pareja sorprende al máximo. La porción pasa a ser el ingrediente de una medida nueva.
- `arith.pct.percent_of_total` (`urn_dice` con `tiles`): la misma porción escrita sobre cien. Es la traducción más corta y la que hace visible que el porcentaje no es una operación sino una unidad de la porción.

Concepto siguiente: `prob.basic.sample_space_grid`. Frase puente, narrada sobre la última urna: "Con una bolsa alcanzaba con contar bolitas. Ahora hay dos dados. ¿Cuántas maneras distintas hay de que salga cada suma?". Las bolitas de la urna se levantan y se acomodan en filas y columnas hasta formar la grilla de seis por seis, y el nodo siguiente empieza ahí.

---

**Visualización:** tres escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `urn_scene_draw_and_tally` es nativa: corre sobre la urna del jugador, parametrizada por composición, cantidad de extracciones y semilla, y produce también las animaciones de `explain`. `urn_scene_fraction_of_total` es nativa y es la que hace el morph de la barra a la ficha de fracción; gramática `partition`. `urn_scene_frequency_bar_stabilizes` es nativa y es la imagen central del nodo: la barra que se sacude cada vez menos contra la línea punteada, con el eje de tiradas comprimiéndose. Se comparte con el nodo 36. Ninguna lleva texto rasterizado: los contadores y las fracciones los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_probability` ([M](../../M-calculadora/M0-progresion.md)), que toma un conjunto armado con fichas y devuelve `P(A)`. No devuelve solo el número: dibuja al costado la barra del total con la parte pintada, para que la respuesta siga siendo la porción. La operación queda disponible en el sandbox. Si el nodo decae, la barra pierde el relleno y queda solo el contorno.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel los contadores llevan dígitos y la ficha de fracción tiene numerador y denominador ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: sacar con un toque, repetir con el dedo apretado, arrastrar bolitas, elegir entre animaciones en `explain`, prompts por voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra directo en el nivel de la barra y usa la calculadora en modo sandbox desde el primer minuto; lo que no se le saltea es la corrida con el dedo apretado, porque la intuición de que la proporción se calma no la reemplaza saber la fórmula.
