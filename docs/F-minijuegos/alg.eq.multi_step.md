# Cofre dentro de cofre (`alg.eq.multi_step`)

Minijuego del nodo 14 de la espina, "Varias llaves, en orden". Mecánica principal `chest_key`, secundarias `balance` y `machine_pipe`; analogía `chest_nested`, con `balance_pans` heredada del nodo 13. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/14-alg.eq.multi_step.md): un concepto, cuatro dificultades reales (leer la envoltura, invertir el orden además de las operaciones, sostener la equivalencia mientras se piensa en el orden, distinguir un camino peor de uno roto), una analogía con la balanza debajo, un gesto (llevar la llave de la capa externa a través del `=`), cinco pasos de desvanecimiento, el diagrama vertical como visualización dominante, retiro del cofre en `symbolic` y de la balanza justo después. Acá se fija cómo se juega.

## Analogía

Un cofre con otro cofre adentro. La tapa exterior tiene una cerradura con forma; por una ventana en la madera se ve la tapa interior con otra cerradura distinta. El cofre entero está en un plato de la balanza que quedó del nodo 13; en el otro hay pesas sueltas. Abajo, el llavero.

Mapa objeto → concepto: cofre → expresión; cofre dentro de cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; abrir primero la tapa de afuera → orden de precedencia invertido; tesoro → valor; las cerraduras en el orden en que se fueron agregando → composición. Y de la balanza, sin cambios: plato → lado de la ecuación; barra nivelada → igualdad; pasar la llave por los dos platos → transformación de equivalencia.

El cofre aporta el orden; la balanza, la equivalencia. Punto de ruptura del cofre: `unknown_in_two_chests`, cuando la misma incógnita está en dos cofres de la misma escena y abrir uno no abre el otro. Punto de ruptura de la balanza: `negative_weights`, que aparece antes que en el nodo 13 porque una constante negativa surge a mitad de la cadena ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el cofre anidado en el plato izquierdo, las pesas en el derecho, el llavero abajo y, desde el primer nivel, una **pila de renglones** debajo de la balanza donde cada movimiento deja su estado. Desde `visual`, el diagrama vertical al costado. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar la llave de la capa externa por los dos platos.** La tapa exterior se abre, lo que traía se eleva en los dos platos, la barra no se mueve y el cofre interior queda expuesto con su cerradura iluminada. Aparece un renglón nuevo.
- **Arrastrar la llave de una capa interior.** La llave llega hasta la madera cerrada de la tapa que está por encima, se apoya y rebota. Nada cambia y el llavero sigue completo.
- **Soltar después de un solo plato.** La barra queda inclinada y ninguna capa se ilumina. El estado se conserva; pasar la llave por el plato que falta la nivela.
- **Llave que no es la inversa de la capa externa.** Entra en la cerradura, gira un cuarto de vuelta y se traba, como en el nodo 13.
- **Movimiento legal y desordenado.** Dividir los dos platos por el coeficiente con la capa de sumar todavía cerrada: el cofre y las pesas se parten en montones iguales, la barra sigue nivelada y el renglón nuevo sale con fracciones. No es un error; es más tinta, y se ve.
- **Tocar un renglón anterior.** Vuelve el estado a ese punto sin borrar los de abajo, que quedan atenuados. Es el gesto que hace útil la pila.
- **Tocar dos renglones consecutivos.** El par se acuesta y muestra las dos máquinas en serie con la flecha de vuelta encima. No cambia el estado: cambia la lectura.
- **Tocar la caja abierta.** Devuelve el valor adentro y cierra las capas en el orden inverso al que se abrieron; la balanza original queda nivelada. Es la verificación por sustitución.

En `symbolic` la superficie cambia de forma y no de reglas, con las zonas de drop del nodo 13: soltar la ficha sobre el `=` la aplica a los dos lados, soltarla sobre un lado la aplica a un lado, y arrastrar una ficha a través del `=` es un movimiento libre que la línea valida inclinándose. Lo que se agrega es que cada aplicación válida escribe un renglón.

## Invariante matemático

Tres invariantes, y el nodo consiste en sostenerlos juntos.

`inverse_restores_original` (cofre): la llave devuelve exactamente lo que había. Se ve romperse cuando la llave no es la inversa: se traba en la cerradura.

`equality_under_identical_actions` (balanza): la igualdad sobrevive a acciones idénticas en los dos lados. Se ve romperse cuando la llave pasa por un solo plato: la barra se inclina y ninguna capa se ilumina. La inclinación es el mensaje.

El tercero no es de una mecánica sino del anidamiento: **solo la capa externa es accesible**. Se ve romperse cuando la llave interior rebota contra la madera. Es el que este minijuego enseña; los otros dos vienen sostenidos desde el nodo 13.

Un movimiento válido pero costoso —dividir antes de restar, o aplicar la inversa de una capa ya abierta— no rompe nada. La balanza sigue nivelada, el renglón sale más cargado y el jugador recibe un empujón suave: el renglón anterior late una vez. Ninguna explicación se dispara.

## Representación visual

Primitiva dominante `invert`, de apoyo `invariant` y `compose` ([H](../H-progresion-abstraccion.md)).

- `real`: el depósito de mercado. Un paquete atado con cuerda y, adentro, una caja con cierre. Solo se mira.
- `intuition`: dos llaves flotando sobre el cofre doble y tres desenlaces dibujados —el exterior primero y todo cae en orden; el interior primero y la llave rebota; las dos a la vez y el cofre se sacude—. El jugador predice y después ve.
- `concrete`: cofre anidado con ventana en la madera, cerraduras con forma, llaves con forma y color, balanza con pesas, pila de siluetas. Nada escrito.
- `visual`: el cofre se convierte en el diagrama vertical de dos tramos —caja, flecha con la primera cerradura, punto intermedio, flecha con la segunda, expresión completa—, con las flechas de arriba atenuadas hasta que la de abajo se usa. Al lado, la balanza en dos columnas de barras proporcionales; la caja envuelta es una barra con marco. Cada paso muestra antes y después con la barra nivelada iluminada en los dos.
- `symbolic`: la pila de renglones alineados por el `=`, con la ecuación viva abajo; las llaves son fichas con etiqueta; el cofre y la balanza se piden con un toque y aparecen como fantasmas.
- `formal`: la definición corta con voz y el diagrama vertical al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables. La caja que era `x` y la barra que era `=` siguen siéndolo desde el nodo 13.

1. Cofre exterior → paréntesis: al abrir por primera vez en `visual` un cofre que envolvía a otro, el marco de la madera se contrae sobre lo de adentro hasta quedar en dos trazos verticales, `(x + 2)`. Es el paréntesis del nodo 9, ahora con una incógnita adentro.
2. Capas → renglones: la pila de siluetas se convierte en una pila de expresiones, una por movimiento, alineadas por el `=`; las de arriba se atenúan y siguen siendo tocables.
3. Llave con forma → ficha sobre el `=`: la llave pierde la forma y gana etiqueta; soltarla sobre el `=` desdobla la etiqueta bajo los dos lados y escribe el renglón siguiente con un morph.
4. Cofres → tinta: al abrirse la última capa los marcos ya no están, y el orden de apertura se lee de arriba abajo en la pila. El cofre se pide tocando cualquier renglón.
5. Renglones → tubería: tocando dos renglones consecutivos el par se acuesta en dos máquinas en serie con la flecha de vuelta. Único gesto que no transforma el estado.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el diagrama vertical: una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en más de una operación; se resuelve deshaciendo la envoltura de afuera hacia adentro, con cada operación aplicada a los dos lados; el orden de apertura es el orden de construcción invertido. Propiedades: deshacer una composición invierte el orden; cada renglón de la pila es una ecuación equivalente a la anterior; cerrar las capas en orden inverso devuelve la ecuación original. Casos: un orden distinto del canónico también resuelve si cada paso es legal, y solo cuesta más; una ecuación con la incógnita en dos cofres no se abre con este método hasta juntarla en uno. Sin símbolos nuevos: el paréntesis nació en el nodo 9 y `=` y `x` en los nodos 11 y 10; lo nuevo es la convención de escribir un renglón por paso, que se guarda en `cs.alg.unwrap_outermost_first` y `cs.alg.solving_steps_checklist`.

## Generalización

El cofre se retira en `symbolic`, cuando el paréntesis escrito basta para decidir qué se abre primero y el jugador deja de pedir el fantasma. La balanza aguanta un poco más, porque sostiene "a los dos lados" mientras la atención está en el orden, y se va cuando la ficha se suelta sobre el `=` sin mirar los platos. El diagrama vertical queda a demanda hasta `formal`.

Variantes sin ayuda visual, en este orden: dos operaciones con enteros positivos; envoltura invertida, con la suma adentro del paréntesis; coeficiente y constante negativos; coeficientes fraccionarios; tres capas. Después, cofres encadenados no aritméticos: "rotar 90°" por fuera y "agregar 🍎" por dentro, donde el jugador nombra las dos llaves y su orden sin ningún número. Cuando resuelve todo eso y además explica por qué un camino legal puede costar más que otro, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md), continuando la declaración del minijuego del nodo 13 (convención 4 de la plantilla). Los niveles 1 a 4 de ese ejemplo son del nodo 13. **Del 5 en adelante son de este nodo y de los siguientes.** Este minijuego retoma con dos cerraduras los niveles que el 13 solo pudo jugar con una: el nivel 5 (la expresión sola, el cofre a demanda) acá es una expresión con dos capas y un cofre anidado fantasma; el nivel 6 (elegir la operación sin ayuda) acá no es elegir *cuál* sino elegir *cuál primero*, con el llavero mostrando las llaves de las dos capas y ninguna trabándose. El nivel 7 (armar la llave con fichas en vez de elegirla del teclado) también es de este nodo y llega en el último tramo. Del nivel 8 de H, que H conecta explícitamente con este nodo y con `alg.expr.distributive_tiles`, acá se juega la parte de "decidir qué transformación conviene primero"; los paréntesis que hay que distribuir son del nodo 15 y la incógnita a los dos lados es de `alg.eq.variable_both_sides`.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Dos tapas, una arriba de la otra.** `concrete`, `manipulate`. Envoltura `mul` por dentro y `add` por fuera, coeficientes y constantes chicos, llaves por forma, dos llaves justas en el llavero. La pila de renglones ya está, como siluetas.
2. **Elegir cuál primero.** `concrete`, `recognize` y `explain`. El llavero ofrece las llaves de las dos capas y ninguna se traba: las dos entran, y solo una llega. Aparece `unwrap_order_inverted`.
3. **Barras, flechas y dos tramos.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; la balanza es de barras y el cofre es el diagrama vertical de dos tramos con las flechas de arriba atenuadas.
4. **Renglones al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La pila de expresiones aparece junto a la balanza y se transforma en sincronía; llaves con etiqueta; el paréntesis se escribe por primera vez.
5. **Cofre fantasma.** `symbolic` segunda mitad, `apply`. La pila queda sola y el cofre se pide tocando un renglón. Reaparece `sign_flip_on_move`, ahora con más términos que cruzar.
6. **La envoltura al revés y los signos.** Parámetros: envoltura `add` por dentro y `div` por fuera, constantes y soluciones negativas, rango numérico mayor.
7. **Tres capas y fracciones.** Parámetros: tres operaciones anidadas y coeficientes fraccionarios. El teclado deja de ofrecer llaves prearmadas: el jugador arma cada llave con operador y número. Cierra con cofres encadenados no aritméticos, `formal` y `abstract`, `generalize`, y la definición corta con voz.

Qué endurece cada parámetro: invertir el orden de la envoltura rompe la regla de bolsillo "primero se resta y después se divide", que es exactamente lo que el nodo no quiere que se memorice; los negativos rompen la balanza física y fuerzan la pila; las fracciones hacen que el camino desordenado se note en la tinta y no solo en el reloj; la tercera capa impide sostener el orden de memoria y obliga a leer la envoltura.

Desafíos de olimpíada: el nodo participa en `ch.alg.absolute_value_two_cases` ([S](../S-desafios/S0-desafios.md)), de tier regional, donde la ecuación de varios pasos se resuelve una vez por región de signo después de que el dato oculto —dónde cambia de signo cada expresión— aparece. Es el uso natural del nodo dentro de un problema de varios pasos con datos ocultos, y la cheatsheet entra abierta con `cs.alg.unwrap_outermost_first`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cofre con tapa exterior `+3` y tapa interior `×2`, y al lado `2x + 3 = 11` en fichas. El llavero ofrece `−3`, `÷2`, `+3` y `×2`. Tocar `−3`.
- `explain`: el mismo cofre en dos animaciones. En una se abre `+3` y después `×2` y el tesoro aparece; en la otra la llave `÷2` se apoya sobre la tapa cerrada y rebota. Tocar la que abre en el orden invertido. El distractor es `unwrap_order_inverted`.
- `manipulate`: `(x + 2) / 5 = 6`. Arrastrar `×5` por los dos platos, después `−2` por los dos platos; la caja muestra `28`; tocarla para verificar y ver las capas cerrarse en orden inverso.
- `apply`: una tubería de dos máquinas, `×3` y después `−4`, con la salida `11` a la vista y la entrada tapada. Empujar el número hacia atrás eligiendo las llaves en orden, contra el tiempo objetivo del nodo.
- `generalize`: sin cofres, la línea `(2 − y) / 3 = 4` en fichas con paréntesis; ordenar las llaves y aplicar cada una a los dos lados. Y un cofre con "rotar 90°" por fuera y "agregar 🍎" por dentro: tocar las dos llaves en el orden que lo abre.
- `transfer`: en la balanza de renglones de `linalg.sys.row_operations`, aplicar operaciones de fila en el orden que despeja la caja. También en `calc2.tech.substitution_undoes_chain` (reconocer la capa exterior dentro de la integral) y en `adv.ode.separable_variables` (una envoltura por lado).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `unwrap_order_inverted`, patrón `tree_unwrap` sobre el cofre: la expresión se dibuja como cajas anidadas, la llave del jugador intenta llegar adentro y rebota contra la capa cerrada, la caja exterior late y el control vuelve desde el estado real, que sigue siendo una ecuación válida. Es la de mayor peso del nodo y la que este minijuego existe para producir y remediar.
- `sign_flip_on_move`, patrón `replay_on_mechanic` sobre la balanza: la ficha que cruzó el `=` se reconstruye como pesas que salieron de un plato y entraron en el otro; la barra se hunde y el jugador nivela desde ahí. Heredada del nodo 13 y más frecuente acá.

Los distractores de `explain` y las opciones del llavero se generan desde las reglas `detect` de estas dos, más las de los prerequisitos directos: `wrong_inverse_choice` sigue produciendo llaves que se traban e `inverse_applied_one_side`, movimientos de un solo plato. Ninguna de las dos es del nodo, y por eso no bloquean su salida de capa; sí clasifican.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_unwrap_outer_to_inner`, nativa. El cofre anidado del jugador con sus cerraduras, la apertura capa por capa en sucesión, y la capa que sigue envuelta cuando el orden se invierte; gramática `invert`. Parametrizada por la ecuación, el llavero y el orden esperado, produce también las animaciones de `explain` y el replay de `tree_unwrap`.
- `balance_two_keys_in_order`, nativa. La balanza con la pila de renglones, cada llave recorriendo los dos platos y la barra nivelada resaltada en el antes y el después de cada paso; gramática `invariant`. Mismos parámetros que la anterior, sobre la otra vista del mismo estado.
- Reusadas: `chest_nested_open_inside_first` (nodo 9) como distractor de `explain` y `balance_key_both_sides` (nodo 13) para los pasos de una sola llave. Ninguna escena lleva texto rasterizado; las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_nested_equation`: `depth` (2 en los niveles 1 a 6, 3 en el 7); `outer_op` e `inner_op` en {add, sub, mul, div}, con `outer_op` aditiva en los niveles 1 a 5 e invertida desde el 6; `coefficient_range` (1 a 9 hasta el nivel 5, hasta 20 desde el 6); `constant_range`; `solution_range` (enteros positivos hasta el 5, negativos desde el 6, fracciones simples en el 7); `unknown_side`; `seed`.
- `gen_key_ring`: el del nodo 13, con `size` de 2 a 5 y `distractors` desde `detect`; acá se agrega `include_inner_layer_key` (verdadero desde el nivel 2, para que la llave que no llega esté siempre disponible) y `labeled` (falso en el nivel 1).
- `gen_machine_chain`: `stages` (2, o 3 en el nivel 7); `ops` por etapa; `output_value`; `hidden_input`. Produce los ítems de `apply` con la piel de tubería.
- `gen_arbitrary_lock`: el del nodo 13, con `chain_length` mayor que uno para las cerraduras encadenadas del último nivel.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer —las capas se distinguen por la forma del marco y la llave que rebota no necesita explicación—, pero el mínimo es `icons` por dos razones: las llaves llevan etiqueta con operador y número desde el nivel 2, y el patrón `tree_unwrap` declara `literacy_min: icons`, así que la misconception dueña del nodo no podría activarse con menos. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la llave de la tapa exterior, la pasa por el plato izquierdo, sigue sin soltar hasta el derecho y suelta; la tapa cae y la cerradura interior se ilumina. La escena vuelve al inicio y las dos llaves laten, la exterior un poco antes. La demostración de pasar la llave por los dos platos no se repite: es la del nodo 13 ([Q](../Q-edad-universal.md)). Se agrega una demostración propia de un solo gesto, la primera vez que el jugador toca un renglón anterior: la pila se ilumina y el estado vuelve.

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
