# Cofres anidados (`alg.eq.multi_step`)

Minijuego del nodo 14 de la espina, "Varias llaves, en orden". Mecánica principal `chest_key`, secundarias `balance` y `machine_pipe`; analogía `chest_nested`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/14-alg.eq.multi_step.md): un concepto, tres dificultades reales (leer la estructura antes de actuar, invertir el orden y no solo las operaciones, sostener un estado intermedio), una analogía con dos apoyos, cuatro pasos de desvanecimiento, el cofre anidado como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

El minijuego arranca exactamente donde termina [Cofres y llaves](alg.eq.one_step.md): la última balanza del nodo 13 queda en pantalla, el cofre recién abierto vuelve a cerrarse y un cofre más grande se cierra encima. La primera instancia del nodo 14 es esa misma ecuación con una capa más.

## Analogía

Un cofre de hierro cerrado, y adentro un cofre de madera también cerrado. Cada uno tiene su cerradura, con forma distinta. El tesoro está en el de madera. Abajo, el llavero. A un costado, la balanza del nodo anterior, con la misma configuración dibujada en barras.

Mapa objeto → concepto: cofre → expresión; cofre dentro de cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; abrir primero el de afuera → recorrer la jerarquía al revés; tesoro → valor de la incógnita; cerraduras agregadas en secuencia → composición.

El cofre aporta el orden. La balanza, que sigue al costado, aporta la garantía de que cada llave se aplica a los dos lados. La tubería, que se abre a demanda, aporta el sentido de ida. Las tres vistas comparten ids y se mueven juntas.

Punto de ruptura: `unknown_in_two_chests`. Cuando la incógnita aparece en dos lugares del renglón, no hay un cofre que la contenga sino dos, y la imagen se fuerza; por eso `alg.eq.variable_both_sides` vuelve a la balanza pura ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: los cofres ocupan el centro, el llavero abajo, la balanza en barras a la derecha y la tubería plegada arriba, que se despliega con un toque. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una llave hacia una cerradura tapada.** La llave llega hasta la tapa del cofre exterior, rebota y vuelve al llavero. El cofre exterior late una vez. Nada cambia en el renglón.
- **Arrastrar la llave correcta por los dos platos.** La cerradura expuesta gira, la tapa se levanta, el cofre interior queda al alcance y un renglón nuevo aparece bajo el anterior.
- **Soltar la llave después de un solo plato.** La balanza se inclina y la tapa se traba a medio abrir. El estado se conserva; pasar la llave por el plato que falta la termina de abrir.
- **Llave equivocada sobre una cerradura expuesta.** Gira un cuarto de vuelta y se traba, igual que en el nodo 13.
- **Tocar la tubería.** Se despliega y muestra las máquinas que fabricaron el resultado, en orden de ida. Una palanca la corre al revés y marca cuál llave toca ahora.
- **Tocar el tesoro.** Devuelve el valor al cofre más interno, los cofres se cierran uno sobre otro y la balanza original queda nivelada. Es la verificación por sustitución.

En `symbolic` la superficie cambia de forma, no de reglas. Soltar una ficha de operación sobre el `=` la aplica a los dos lados; soltarla sobre un lado la aplica a un lado; arrastrar una ficha a través del `=` es un movimiento libre que la línea valida inclinándose.

## Invariante matemático

Dos invariantes centrales, uno por mecánica, y el nodo vive en su intersección.

`inverse_restores_original` (cofre): la llave devuelve exactamente lo que había, y solo funciona sobre una cerradura expuesta. Se ve romperse cuando la llave rebota contra una tapa cerrada. No hay mensaje: el rebote es el mensaje.

`equality_under_identical_actions` (balanza): la igualdad sobrevive a acciones idénticas en ambos lados. Se ve romperse cuando la barra se inclina, y la tapa a medio abrir muestra la consecuencia sobre el cofre.

Un movimiento válido pero inútil, como aplicar la inversa de una capa interior antes de tiempo, no rompe ninguno: produce un renglón más largo pero cierto, y recibe un empujón suave.

## Representación visual

Primitiva dominante `invert`, de apoyo `invariant` y `compose` ([H](../H-progresion-abstraccion.md)).

- `concrete`: cofres con volumen, cerraduras con forma, llaves con forma y color, balanza en barras al costado.
- `visual`: los cofres se aplanan en cajas anidadas con bordes de distinto grosor, más grueso cuanto más externo. El diagrama vertical del nodo 12 se estira en una escalera de dos peldaños. Cada capa abierta empuja un renglón hacia abajo.
- `symbolic`: fichas con paréntesis sobre una línea que hereda de la barra el poder de inclinarse; las llaves son fichas con etiqueta y después fichas armadas por el jugador.
- `formal`: la definición corta con voz, los cofres fantasma al lado y los dos casos degenerados dibujados.

## Transición simbólica

Cuatro pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cofre exterior → paréntesis: al abrir por primera vez en `visual` un cofre que contiene a otro, el borde grueso se afina, se estira por arriba y por abajo y se cierra hasta quedar como los dos arcos de un paréntesis, con la cerradura escrita afuera.
2. Cajas → fichas: en el mismo gesto, las cajas interiores se contraen en fichas y la incógnita en `x`.
3. Escalera → renglones: al aplicar la segunda llave, la escalera vertical se recuesta y cada peldaño se convierte en un renglón con la operación bajo los dos lados, apilados en el orden en que estaban los peldaños.
4. Llavero → teclado de fichas: cuando dejan de ofrecerse llaves prearmadas, el llavero se abre en abanico y se reordena en una grilla con una fila de operadores y una de dígitos. El jugador arma la llave con dos fichas y el juego la valida antes de aplicarla. Sigue siendo un teclado de fichas, nunca de texto libre ([Q](../Q-edad-universal.md)).

## Concepto formal

Lo que queda al final, como texto corto con voz sobre los cofres fantasma: una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en más de una operación; resolverla es abrir las envolturas de afuera hacia adentro aplicando cada inversa a los dos lados; cada paso produce una ecuación nueva con las mismas soluciones que la anterior, y por eso se llaman equivalentes.

Propiedades: las transformaciones de equivalencia se componen; la composición se deshace en orden inverso; hay capas que conmutan y admiten dos órdenes, y capas que no; la solución no cambia al abrir una capa. Casos especiales: `2(x + 3) = 2x + 7` es un cofre sin tesoro y no tiene solución; una identidad se abre con cualquier valor.

Símbolo nuevo: el paréntesis, que nace acá porque sin él no hay forma de escribir en un renglón "primero sumar, después multiplicar". Convención nueva: un renglón por acción, en el orden en que se hizo.

## Generalización

Los cofres se retiran en `symbolic`, cuando el paréntesis se lee como envoltura sin necesidad de dibujarla; quedan como fantasma a demanda tocando el paréntesis. La balanza se retira antes, en cuanto la ficha se aplica al `=` sin mirarla. La tubería no se retira: no representa la ecuación sino el sentido de ida, y eso sigue siendo cierto en `formal`.

Variantes sin ayuda visual: tres capas; coeficientes fraccionarios; capas que conmutan, donde hay que descubrir que da igual; ecuaciones sin solución y con infinitas soluciones. Cuando el jugador ordena las llaves de una ecuación de tres capas sin dibujar el árbol, justifica el orden señalando la estructura y reconoce los dos casos degenerados, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): el nivel 3 de ese ejemplo, cofres anidados sin incógnita, pertenece a `arith.expr.precedence_tree` y acá reaparece como nivel de entrada. Los niveles 4 a 8 son de este nodo: mezcla con símbolos, desaparición de los cofres, elegir la operación sin ayuda, escribir la operación con el teclado de fichas, y ecuaciones nuevas.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Dos cofres, dos llaves.** `concrete`, `manipulate`. Cerraduras de sumar y multiplicar, llaves por forma, tres llaves en el llavero. El cofre exterior está siempre a la vista y el interior tapado. Rango numérico chico.
2. **Cuatro cerraduras anidadas.** `concrete`, `recognize` y `manipulate`. Se agregan restar y dividir, y las dos capas pueden ser cualquier par. Aparece `unwrap_order_inverted` con fuerza.
3. **Cajas y escalera.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; los cofres son cajas anidadas y el diagrama es la escalera de dos peldaños.
4. **Mezcla con símbolos.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión con paréntesis aparece junto al cofre y se transforma en sincronía; las llaves tienen etiqueta. Corresponde al nivel 4 de H.
5. **Cofres fantasma.** `symbolic` segunda mitad, `apply`. La expresión queda sola y los cofres se piden con un toque. Aparece `sign_flip_on_move`. Corresponde a los niveles 5 y 6 de H.
6. **Armar la llave.** Parámetros: tres capas, coeficientes y soluciones fraccionarias, rango numérico mayor. El teclado de fichas deja de ofrecer llaves prearmadas y el jugador las construye con operador y número. Corresponde al nivel 7 de H.
7. **Ecuaciones nuevas.** `formal` y `abstract`, `generalize`. Definición corta con voz, capas que conmutan, cofre sin tesoro y cofre que abre con cualquier llave. Corresponde al nivel 8 de H.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo participa en `ch.alg.absolute_value_two_cases`, de tier regional, que lo requiere junto con `alg.abs.distance_two_branches`. Ahí una ecuación de varias capas aparece dentro de cada rama del valor absoluto, y el dato oculto es dónde cambia de signo cada expresión. La cheatsheet está abierta de entrada, con `cs.alg.unwrap_outermost_first` y `cs.alg.solving_steps_checklist` disponibles.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: un cofre de hierro con cerradura `+3` que contiene un cofre de madera con cerradura `×2`, y al lado `2x + 3 = 11`. Tocar la llave que hay que usar primero. Distractores: `÷2`, `×2` y `−11`.
- `explain`: el mismo cofre en dos animaciones. En una se aplica `−3` y después `÷2`, y los dos cofres se abren; en la otra se aplica `÷2` primero y la llave rebota contra la tapa. Tocar la que abre en orden invertido. El distractor elegido clasifica: la del rebote es `unwrap_order_inverted`.
- `manipulate`: `(x + 2) / 5 = 6`. Arrastrar `×5` por los dos platos, después `−2` por los dos platos, con la balanza en barras mostrando cada paso nivelado. El tesoro muestra `28`; tocarlo para verificar.
- `apply`: una tubería de dos máquinas con salida `19`, regla `×3` seguida de `+4`. Correrla al revés eligiendo las llaves en orden, contra el tiempo objetivo del nodo.
- `generalize`: sin cofres, `4(2 − 3z) = 44`. Ordenar las llaves y aplicar cada una a ambos lados.
- `transfer`: en la balanza de renglones de `linalg.sys.row_operations`, aplicar operaciones de fila en el orden que despeja la caja. También en `calc2.tech.substitution_undoes_chain` y `adv.ode.separable_variables`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `unwrap_order_inverted`, patrón `tree_unwrap` sobre `chest_key`, que el nodo declara. La expresión se dibuja como cajas anidadas, la llave del jugador intenta atravesar la caja exterior cerrada y rebota, la caja exterior late. Voz: "La capa de afuera es sumar 3. ¿Cuál abrimos primero?". El estado real del jugador se conserva y sigue siendo válido. Es la característica del nodo.
- `sign_flip_on_move`, patrón `replay_on_mechanic` sobre `balance`, que el nodo también declara. La ficha que cruzó el `=` se reconstruye como pesas que salieron de un plato y entraron en el otro; la barra se hunde. Voz: "Sacaste 3 de un plato y los pusiste en el otro. ¿Pesan lo mismo?".
- `wrong_inverse_choice`, heredada del nodo 13. Su mecánica declarada es `chest_key` y el nodo la tiene, así que corre sin adaptación con el patrón `key_mismatch`: la llave se traba, la cerradura muestra su forma y aparece la silueta hueca de la correcta. Voz: "Esa llave no abre este cofre. ¿Qué deshace multiplicar por 2?".

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_unwrap_outer_to_inner`, nativa. Recibe la ecuación como árbol, el llavero y el orden esperado, y dibuja los cofres anidados abriéndose de afuera hacia adentro; gramática `invert`. Parametrizada por el orden que ejecuta el jugador, produce también las animaciones de `explain` y el replay de `unwrap_order_inverted`.
- `balance_two_keys_in_order`, nativa. Corre en paralelo sobre la balanza del jugador, con la barra nivelada resaltada después de cada llave y la inclinación cuando falta un plato; gramática `invariant`.
- Reusadas: `chest_nested_open_inside_first` (nodo 9), como apertura de nivel y distractor de orden, y `pipe_two_machines_order_matters` (nodo 9), como la tubería desplegable y la lectura de ida.

Ninguna lleva texto rasterizado: las etiquetas de las llaves, los paréntesis y los renglones los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_nested_chest`: `depth` (2 en los niveles 1 a 5, hasta 3 desde el 6); `ops` como lista ordenada de afuera hacia adentro, con valores en {add, sub, mul, div}; `operand_range` (1 a 9 hasta el nivel 5, hasta 30 después); `solution_range` (enteros hasta el nivel 5, fracciones simples desde el 6); `commuting_layers` (booleano, verdadero solo en el nivel 7); `degenerate` en {none, no_solution, identity}; `seed`.
- `gen_key_ring`: reutilizado del nodo 13 con `size` de 3 a 5; `distractors` desde `detect`, incluidas las llaves correctas en el orden equivocado, que son las que producen `unwrap_order_inverted`; `labeled` (falso en los niveles 1 y 2).
- `gen_pipe_chain`: `stages` (2 o 3); `ops` en el mismo formato; `output_range`. Alimenta los ítems de `apply`.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer, pero las llaves llevan etiqueta con operador y número desde el primer nivel, heredada del nodo 13, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada, y la checklist de `cs.alg.solving_steps_checklist` aparece como lista.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la llave de la cerradura visible, la pasa por los dos platos de la balanza y el cofre exterior se abre, dejando el interior a la vista con su cerradura recién descubierta. La escena vuelve al inicio y el cofre exterior late. Se repite solo si el jugador se queda quieto. La demostración de pasar la llave por los dos platos no se repite: es la del nodo 13. La del teclado de fichas se demuestra una vez en el nivel 6, armando una llave con dos fichas ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
