# Los dos platos (`prealg.eq.balance`)

Minijuego del nodo 11 de la espina, "El igual es una balanza". Mecánica única `balance`; analogía `balance_pans`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/11-prealg.eq.balance.md): un concepto, tres dificultades reales (leer el igual como afirmación simétrica, conservar el invariante bajo acción, aceptar que dos estados son la misma igualdad), una analogía que enseña por qué la acción va a los dos lados, un gesto (un toque quita una pesa de un plato), cinco pasos de desvanecimiento, el invariante como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una balanza de dos platos, nivelada. En un plato, una caja cerrada y unas pesas; en el otro, pesas sueltas. No hay llavero: en este nodo no existe.

Mapa objeto → concepto: plato → lado de la igualdad; pesas en un plato → términos; barra nivelada → igualdad; misma acción en ambos platos → transformación de equivalencia; caja cerrada → incógnita; quitar pesas iguales de los dos → cancelar; leer la caja sola → solución.

Punto de ruptura: `negative_weights`. Una pesa no pesa menos que nada, y no hay gesto físico para escalar un plato: la balanza tiene acciones para sumar y restar y no las tiene para multiplicar. Por eso se retira en `symbolic` y por eso el nodo no puede resolver `3x = 12`, que es el argumento del nodo 12 ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la balanza ocupa el centro, la mesa con pesas de reserva abajo, nada a los costados. La ausencia del llavero es parte del diseño. Gestos: `tap` y `drag` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar una pesa.** La quita de su plato. Es el gesto central del nodo y el único que produce cambios; la balanza responde con inercia y se queda donde queda. El nodo 13 lo da por sabido y no lo vuelve a demostrar.
- **Tocar una pesa del otro plato.** Si es la misma, la barra vuelve a horizontal. Dos toques son una transformación de equivalencia, y la equivalencia se siente como el ruido de la barra volviendo.
- **Arrastrar una pesa de un plato al otro.** Movimiento libre, permitido: la barra se hunde el doble porque un plato perdió y el otro ganó. No se bloquea y no se corrige.
- **Arrastrar una pesa de la reserva a un plato.** Agrega. Sirve para nivelar desde un estado inclinado sin deshacer nada.
- **Agarrar el vástago y dar vuelta la balanza.** Los platos intercambian lugar y la barra sigue horizontal. Es la simetría del igual hecha gesto.
- **Tocar la caja cuando queda sola en un plato nivelado.** Se ilumina y muestra su peso. No se abre con llave: acá no hay llaves.

En `symbolic` la superficie cambia de forma, no de reglas, y las tres zonas de drop nacen acá: soltar una ficha **sobre el `=`** la aplica a los dos lados y el renglón queda derecho; soltarla **sobre un lado** la aplica a ese lado solo y el renglón se inclina; **arrastrar una ficha ya escrita cruzando el `=`** es el movimiento libre, y la línea lo valida hundiéndose el doble. Todo nodo con `balance` hereda estas tres zonas, y los demás las heredan con su propio invariante.

## Invariante matemático

`equality_under_identical_actions`: la igualdad sobrevive a acciones idénticas en ambos lados, y solo a esas. Se ve romperse cuando un toque queda sin su par: la barra se inclina y la caja no se puede leer. Ningún mensaje lo dice; la inclinación es el mensaje.

Se ve confirmarse en la superposición: el antes y el después uno sobre otro, con la barra nivelada iluminada en los dos. Dos estados distintos, la misma afirmación. Es la primera vez que el jugador ve la primitiva `invariant`, y es la imagen que el juego va a repetir hasta las identidades trigonométricas.

Un movimiento válido pero inútil no rompe nada: agregar la misma pesa a los dos platos deja la balanza nivelada con más peso y más lejos de la respuesta, y quitar de a pares pesas que no acompañan a la caja tampoco acerca. Empujón suave, sin explicación.

## Representación visual

Primitiva dominante `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la feria de intercambio, la bolsa cerrada y las manzanas. Solo se mira y se predice si el trato sigue en pie.
- `concrete`: balanza con platos, pesas dibujadas y la caja cerrada del nodo 10 con su marca. Nada escrito.
- `visual`: dos columnas y una barra; las pesas se aplanan en barras proporcionales apiladas y la caja es la barra punteada de longitud desconocida. Cada acción a los dos lados muestra antes y después superpuestos con la barra iluminada en los dos.
- `symbolic`: fichas `x`, `2`, `6` sobre una línea que hereda de la barra el poder de inclinarse; la ficha de acción es `−2`.
- `formal`: las tres frases cortas con voz y la balanza al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Pesas → fichas: al quitar pesas de a pares en `visual`, las barras apiladas de cada plato se contraen en un número; la caja ya era `x` desde el nodo 10 y no cambia.
2. Platos → extremos: al siguiente par de toques, los platos se desvanecen y las fichas quedan flotando donde estaban, sostenidas por la barra.
3. Barra → `=`: la barra se contrae hacia el centro hasta ser dos trazos cortos, que conservan el poder de ladearse. Queda `x + 2 = 6`.
4. Toque → ficha de acción: quitar dos pesas de un plato se vuelve soltar `−2` sobre ese lado, porque el toque se quedó sin pesas que tocar.
5. Zonas de drop: el `=`, un lado, y cruzar el `=`. Tres lugares, tres significados, y la línea valida cada uno inclinándose o quedándose derecha.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la balanza: una igualdad dice que dos cosas pesan lo mismo; la igualdad se conserva si se hace exactamente lo mismo en los dos lados; dos renglones distintos pueden decir la misma igualdad. Propiedades: la igualdad se conserva al sumar o restar lo mismo en ambos lados —solo esas dos, porque son las que la balanza tiene—; la igualdad es simétrica y dar vuelta la balanza lo muestra; dos estados distintos pueden ser la misma igualdad. Casos especiales: los dos platos vacíos también están nivelados; una igualdad puede ser falsa y entonces no hay nada que conservar; repartir un plato en montones iguales no tiene gesto acá. El símbolo nuevo es `=`.

## Generalización

La balanza se retira en `symbolic`, cuando la ficha se aplica al `=` sin mirar los platos, y el retiro es el punto de ruptura llegando: con una constante negativa la balanza física deja de tener objeto y el renglón sigue. Los platos vuelven como fantasma a demanda y tras un error.

Variantes sin ayuda visual: operaciones en los dos lados; la caja a la derecha; igualdades sin caja, verdaderas y falsas; la misma caja en los dos lados, que se cancela. Después, balanzas que no pesan: dos filas de figuras que tienen que coincidir, dos relojes que marcan lo mismo, dos cadenas de colores. El jugador dice qué acción se puede aplicar a los dos lados sin romper la coincidencia. Cuando aplica acciones a los dos lados de una línea sin pedir la balanza y distingue una igualdad falsa de una que todavía no se simplificó, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): el nodo no tiene un tramo propio en el ejemplo de cofres, porque ese ejemplo empieza con la llave y la llave acá no existe. Lo que este nodo aporta a ese recorrido es la mitad que el nivel 8 enuncia como definición ("una ecuación es una balanza; una solución es lo que la mantiene equilibrada") y que el jugador tiene que haber jugado mucho antes para que la frase signifique algo.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Dos toques.** `concrete`, `manipulate`. Una caja y pocas pesas, todas iguales; quitar de a pares hasta dejar la caja sola. Rango numérico chico.
2. **Nivelada o no.** `concrete`, `recognize` y `explain`. Varias balanzas con inclinaciones cada vez más chicas; aparecen `inverse_applied_one_side` y `equals_as_operator`.
3. **Barras y superposición.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; la balanza es de barras y cada par de toques muestra el antes y el después con la barra iluminada en los dos.
4. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. El renglón aparece junto a la balanza y se transforma en sincronía; nacen las fichas de acción.
5. **La línea sola.** `symbolic` segunda mitad, `apply`. La balanza se pide con un toque sobre el `=`. Las tres zonas de drop se practican, incluida la de cruzar el `=`.
6. **Balanzas que no pesan.** `formal` y `abstract`, `generalize`. Definición corta con voz; igualdades falsas, la caja de los dos lados, y dos platos con figuras, relojes y colores.

Qué endurece cada parámetro: las pesas de distinto valor obligan a mirar cuánto se quita y no cuántas; las operaciones en los dos lados rompen la lectura "izquierda es la cuenta, derecha es el resultado"; la caja a la derecha la rompe otra vez desde el otro ángulo; la igualdad falsa obliga a evaluar la afirmación antes de actuar sobre ella; la misma caja en los dos lados prepara `alg.eq.variable_both_sides`.

Desafíos de olimpíada: el nodo no participa todavía en ningún desafío declarado de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro balanzas dibujadas, una nivelada y tres con inclinaciones pequeñas; aparece la ficha de igual y el jugador toca la nivelada.
- `explain`: la misma balanza `□ + 2` contra `6` en tres animaciones: se quita una pesa de cada plato y sigue nivelada; se quitan dos de un solo plato y se inclina; el renglón se reescribe con el resultado de un solo lado. Tocar las dos que rompen el equilibrio. El distractor elegido clasifica: la inclinada es `inverse_applied_one_side`, la reescrita es `equals_as_operator`.
- `manipulate`: `□ + 3` contra `7`; quitar de a pares hasta que la caja queda sola, sin que la barra se incline en ningún paso intermedio.
- `apply`: cuatro balanzas seguidas, con la caja a izquierda y a derecha y con pesas de dos valores, contra el tiempo objetivo del nodo. El ítem pide el camino, no el número.
- `generalize`: sin balanza, la línea `9 = y + 4`; aplicar `−4` a los dos lados soltando la ficha sobre el `=`. Y dos relojes que marcan lo mismo: decir qué giro se puede dar a los dos sin romper la coincidencia.
- `transfer`: en los engranajes de `disc.mod.clock_equivalence`, aplicar el mismo giro a las dos agujas y verificar que siguen marcando lo mismo.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `equals_as_operator`, patrón `replay_on_mechanic` sobre la balanza: el juego repite el movimiento, la barra se hunde porque un plato quedó liviano y un halo marca la ficha que se perdió; el jugador nivela desde ahí. Es la misconception que este nodo existe para desactivar.
- `inverse_applied_one_side`, patrón `replay_on_mechanic` sobre la balanza: el gesto se repite en cámara lenta, dos pesas salen, la barra se va y un halo marca el plato intacto; el jugador nivela desde ese estado. Es la de mayor severidad del nodo y el nodo 13 la hereda entera.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de estas dos, más las del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `balance_equal_pans_stay_level`, nativa. Los dos lados y las fichas de cada plato como parámetros; la acción idéntica corre en los dos y el antes y el después quedan superpuestos con la barra nivelada iluminada en ambos. Gramática `invariant`. Abre los niveles 1 y 3 y es la imagen de cheatsheet de `cs.prealg.equals_means_level_pans`.
- `balance_remove_one_side_tilts`, nativa. Los dos lados, lo removido y el lado como parámetros; la barra se va y el plato intacto queda marcado. Gramática `invariant`. Es la escena propia del error y produce el distractor de `explain`.
- Las dos se reúsan en el nodo 13 como distractores. Ninguna lleva texto rasterizado: las fichas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_balanced_pans`: `unknown_side` en {left, right, both, none}; `constant_range` (de 1 a 9 hasta el nivel 4, hasta 30 después); `weight_denominations` (una sola hasta el nivel 3, dos después); `ops_on_both_sides` (falso hasta el nivel 5); `truth` en {true, false} (solo `false` desde el nivel 6); `seed`.
- `gen_removal_sequence`: la secuencia objetivo de pares de toques que deja la caja sola; `pairs` (1 a 4); `distractor_moves` desde `detect` (quitar de un solo plato, cruzar una pesa, quitar lo que no acompaña a la caja); `seed`.
- `gen_nonweight_pans`: pares que tienen que coincidir sin ser pesos (figuras, horas de reloj, cadenas de colores), con una acción aplicable a los dos lados y una que rompe la coincidencia.

**Literacy soportada:** de `none` a `full_text`. Todo el minijuego se juega sin leer: un toque por acción, la barra como única señal, `explain` entre animaciones y prompts por voz. El `=` del nivel 4 no es texto sino la barra encogida, y el jugador la vio encogerse. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toca una pesa del plato izquierdo, la barra se inclina, toca una del derecho y la barra vuelve. La escena regresa al inicio y las dos pesas laten a la vez. Se repite solo si el jugador se queda quieto. Es la demostración que el nodo 13 da por hecha y no vuelve a mostrar ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** El tiempo objetivo del nodo, cuántos ítems pide cada verbo, la ventana en que se cuentan las misconceptions y cuánto espera la demostración antes de repetirse son constantes de [K](../K-evaluacion.md).
