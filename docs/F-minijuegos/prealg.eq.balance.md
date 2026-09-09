# Los dos platos (`prealg.eq.balance`)

Minijuego del nodo 11 de la espina, "El igual es una balanza". Mecánica única `balance`; analogía `balance_pans`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/11-prealg.eq.balance.md): un concepto, cinco dificultades reales, una analogía, un gesto (hacer lo mismo en los dos platos), cinco pasos de desvanecimiento, la balanza como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una balanza de dos platos en un puesto de quesos. En cada plato hay pesas, y en algunos niveles uno tiene además el cajón cerrado del nodo 10; la barra derecha es lo que se protege.

Mapa objeto → concepto: plato → lado de la igualdad; pesas sobre un plato → términos; barra nivelada → igualdad; misma acción en los dos platos → transformación de equivalencia; caja cerrada en un plato → incógnita; quitar pesas iguales de los dos → cancelar; leer la caja sola → solución.

Punto de ruptura: `negative_weights`. Una pesa no pesa menos que nada, así que un término negativo no se puede dibujar en un plato, y por eso la analogía se retira en `symbolic`. Hay una segunda ruptura que el minijuego evita: multiplicar los dos platos no tiene gesto físico, y por eso acá solo se suma y se quita ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la balanza ocupa el centro, la reserva de pesas abajo, y la ficha de igual entre los platos, apagada, desde el primer nivel. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar una pesa.** La quita de su plato, con inercia. Arrastrar una desde la reserva la agrega.
- **Quitar o agregar lo mismo de los dos platos.** La barra no se mueve. Es el único movimiento que conserva la igualdad y el único que hace avanzar el nivel.
- **Tocar un solo plato.** La barra se inclina y la caja, si la hay, no cede. El estado se conserva: haciendo lo mismo en el otro plato la barra vuelve.
- **Pasar una pesa de un plato al otro.** Está permitido y es la jugada que más inclina la barra. Se deja hacer porque es la única forma de sentir que son dos acciones y no una.
- **Nivelar.** Cuando la barra queda derecha se traba con un clic suave y la ficha de igual se enciende. En los primeros niveles, encenderla es todo el objetivo.
- **Dejar la caja sola.** Con el cajón en un plato, quitar pesas iguales de los dos hasta que quede solo. Entonces se abre y muestra lo que hay enfrente.

Lo que la balanza no acepta: repartir un plato en montones iguales o duplicarlo. El gesto existe, no pasa nada y las pesas vuelven, y esa frustración prepara el llavero del nodo 12.

En `symbolic` la superficie cambia de forma, no de reglas: tocar una ficha de un lado del `=` es tocar un plato; tocar la misma ficha de los dos lados es la transformación de equivalencia; arrastrar una ficha a través del `=` es el movimiento libre que la línea valida inclinándose. La balanza se pide tocando el `=` y aparece como fantasma.

## Invariante matemático

`equality_under_identical_actions`: la igualdad sobrevive a acciones idénticas en los dos lados. Se ve romperse en el instante del gesto, cuando la barra se inclina porque solo un plato fue tocado; ningún mensaje lo dice, la inclinación es el mensaje. Se ve confirmarse en la barra que no se mueve mientras las dos manos hacen lo mismo, y en el antes y el después mostrados uno sobre otro con la barra derecha iluminada en los dos.

Un movimiento válido pero inútil, como agregar una pesa a cada plato cuando lo que hacía falta era quitar, no rompe el invariante: la balanza sigue derecha con más peso y el jugador recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el puesto de quesos, la vendedora y la balanza. Solo se mira y se predice.
- `concrete`: balanza con platos, pesas y, desde el tercer nivel, el cajón cerrado. Nada escrito.
- `visual`: dos columnas y una barra; las pesas se aplanan en barras proporcionales y el cajón es una barra de longitud desconocida. Cada acción a los dos lados muestra antes y después con la barra derecha iluminada.
- `symbolic`: fichas `5`, `12` y `x` sobre una línea que hereda de la barra el poder de inclinarse; el `=` en el medio.
- `formal`: la definición corta con voz y la balanza fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Pesas → barras: al pasar a `visual` las pesas se aplanan y el cajón conserva su borde punteado.
2. Barras → fichas: al nivelar por primera vez en `visual`, cada columna se contrae en una ficha que conserva el peso, y el cajón se contrae en `x`, repitiendo el morph del nodo 10 delante del jugador.
3. Barra → `=`: al primer movimiento válido sobre una balanza nivelada, los platos se desvanecen y la barra se contrae hacia el centro en dos trazos horizontales. La ficha que venía encendiéndose termina de dibujarse ahí.
4. La línea conserva el poder de inclinarse: aplicar una ficha a un solo lado la inclina igual que a la barra, y la balanza se pide tocando el `=`.
5. Acción a los dos lados → dos toques: quitar `5` pasa a ser tocar la ficha `5` de un lado y la del otro; las dos se elevan a la vez y el renglón siguiente aparece con un morph.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la balanza fantasma: una igualdad dice que los dos lados valen lo mismo; si dos lados iguales reciben la misma acción, siguen iguales; el igual no ordena calcular, afirma. Propiedades: reflexiva, simétrica, transitiva, conservación bajo la misma acción en los dos lados (`a + c = b + c`, `a − c = b − c`) y reversibilidad. Casos: el plato vacío es cero; una igualdad puede ser falsa, y entonces hay algo que reparar en vez de algo que conservar. Símbolo nuevo: `=`, más la convención del renglón. La versión con multiplicar y dividir necesita la llave y se completa en el nodo 13.

## Generalización

La balanza se retira en `symbolic`, cuando el jugador aplica una acción a los dos lados de la línea sin mirar los platos. Queda como fantasma a demanda hasta `formal` y desaparece del todo con los negativos, que la contradicen.

Variantes sin ayuda visual: la caja a la derecha (`12 = x + 5`); los dos lados compuestos (`3 + 4 = x + 2`); cadenas de tres estados; igualdades falsas que hay que reparar, el único caso en que tocar un solo lado es lo correcto. Después, acciones no aritméticas: "girar noventa grados", "pintar de azul", "agregar 🍎" sobre platos con figuras de colores, aplicadas a los dos lados sin ningún número. Cuando conserva y repara igualdades sin pedir la balanza, la analogía se eliminó.

## Desafío

Correspondencia con [H](../H-progresion-abstraccion.md): el ejemplo de cofres no aplica a este nodo, porque su recorrido es de llaves y anidamiento; la balanza recién aparece en su nivel 8, ya con ecuaciones de varios pasos.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Que quede derecha.** `concrete`, `manipulate`. Balanzas inclinadas con pesas iguales; agregar o quitar hasta nivelar. Rango chico.
2. **Que siga derecha.** `concrete`, `recognize` y `manipulate`. Balanzas ya niveladas y una tarea que las pone en riesgo. Aparece `inverse_applied_one_side`.
3. **La caja en un plato.** `concrete`, `apply`. Entra el cajón del nodo 10; quitar pesas iguales de los dos platos hasta dejarlo solo.
4. **Barras y estados.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; la balanza es de barras y cada acción muestra antes y después.
5. **La barra se vuelve igual.** `symbolic` primera mitad, `manipulate`. La línea con `=` aparece junto a la balanza y se transforma en sincronía.
6. **Los dos lados compuestos.** `symbolic` segunda mitad, `apply`. La balanza queda como fantasma. Parámetros: los dos lados con varias fichas, y la caja a la derecha. Aparece `equals_as_operator`.
7. **Acciones que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; igualdades falsas para reparar y acciones no aritméticas sobre los dos lados.

Qué endurece cada parámetro: los dos lados compuestos rompen la lectura "a la izquierda la cuenta, a la derecha el resultado"; la caja a la derecha rompe "lo buscado va a la izquierda"; las igualdades falsas obligan a distinguir conservar de reparar.

Desafíos de olimpíada: el nodo participa en los desafíos de álgebra de [S](../S-desafios/S0-desafios.md), aún no escritos, donde una igualdad aparece como condición oculta de un problema de varios nodos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro balanzas dibujadas, una nivelada y tres con inclinaciones cada vez menores. Cuando aparece la ficha de igual, tocar la nivelada.
- `explain`: tres animaciones sobre la misma balanza. En una se saca lo mismo de los dos platos y la barra sigue derecha; en otra se saca de un solo plato y se inclina; en la tercera el plato izquierdo se vuelca sobre el derecho como si la barra fuera un tobogán. Tocar las dos que rompen el equilibrio: la inclinada es `inverse_applied_one_side`, el tobogán es `equals_as_operator`.
- `manipulate`: balanza inclinada con `8` a la izquierda y `5` a la derecha. Arrastrar fichas hasta que la barra queda horizontal y la ficha de igual se enciende.
- `apply`: balanza nivelada con `□ + 5` a la izquierda y `12` a la derecha. Quitar cinco de los dos platos, en cualquier orden, sin inclinar la barra en ningún paso; la caja se abre y muestra `7`.
- `generalize`: sin balanza, la línea `3 + 4 = y + 2`; aplicar la misma acción a los dos lados hasta dejar `y` solo. Y dos platos con figuras: aplicar "girar noventa grados" a los dos y verificar que la barra no se mueve.
- `transfer`: en el reloj modular de `disc.mod.clock_equivalence`, aplicar el mismo giro a las dos agujas y verificar que siguen coincidiendo. También en `alg.eq.one_step`, `trig.id.double_angle` (tuberías) y `linalg.sys.row_operations` (cada fila es una balanza).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). Las dos declaran la mecánica `balance`, que es la del nodo, así que las dos explicaciones corren acá:

- `inverse_applied_one_side`, patrón `replay_on_mechanic`: el gesto se repite en cámara lenta, cinco pesas salen de un plato, ese plato sube y un halo marca el que nadie tocó. Voz: "Sacaste 5 de un solo plato. ¿Qué le falta al otro?". El jugador nivela desde ese estado. Es la de mayor severidad del nodo.
- `equals_as_operator`, patrón `replay_on_mechanic`: las fichas del lado izquierdo caen sobre el derecho, la barra se hunde y un halo marca lo que ya había del otro lado y quedó ignorado. Voz: "El igual no dice qué da. Dice que los dos platos pesan lo mismo. ¿Qué había del otro lado?". El jugador nivela desde ese estado.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de estas dos, más las del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `balance_equal_pans_stay_level`, nativa. La misma acción recorriendo los dos platos; gramática `invariant`, con la barra derecha resaltada en el antes y el después. Parametrizada por los dos lados y las fichas de cada plato, produce también la animación correcta de `explain`.
- `balance_remove_one_side_tilts`, nativa. Toma además qué se quitó y de qué lado, y produce la inclinación con el plato intacto marcado; gramática `invariant` mostrada por su ruptura. Es la que usa el patrón `replay_on_mechanic` de las dos misconceptions, y el nodo 13 la reúsa como distractor de `explain`.

Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_balance_state`: `left` y `right` (fichas por lado, una sola hasta el nivel 5 y varias desde el 6); `starts_level`; `token_range`; `box_side` en {none, left, right}; `seed`.
- `gen_token_set`: `sizes` (valores de las pesas disponibles en la reserva); `exact_match_available` (falso en algunas instancias del nivel 6, para que haya que combinar); `seed`.
- `gen_false_equality`: igualdades desequilibradas con la diferencia y el lado a reparar como parámetros; `distractors` desde `detect` (tocar los dos lados cuando había que tocar uno).
- `gen_arbitrary_action`: `action_kinds` en {rotar, pintar, agregar una figura}, aplicables a un plato entero; `count` (cuántas acciones se ofrecen por instancia); `include_non_preserving` (habilita la acción que no conserva nada, una por instancia); `seed`.

**Literacy soportada:** de `none` a `full_text`. Todo se juega sin leer: las pesas y la caja son objetos, se toca y se arrastra, `explain` se responde entre animaciones y los prompts son de voz, en formas que sirven igual para tú y para vos. El `=` llega como morph de la barra, es un dibujo antes que un signo, y por eso el mínimo se mantiene en `none`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toca una pesa del plato izquierdo, la barra se inclina, toca una pesa igual del derecho y la barra vuelve a quedar derecha. La escena vuelve al inicio y las dos pesas laten a la vez. Se repite solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
