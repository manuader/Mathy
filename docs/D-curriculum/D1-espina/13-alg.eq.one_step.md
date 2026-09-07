# 13 — Ecuaciones de un paso (`alg.eq.one_step`)

> Locale `es`: "Una llave, los dos platos". Minijuego: [Cofres y llaves](../../F-minijuegos/alg.eq.one_step.md).

**Nodo:** `alg.eq.one_step` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` (secundaria `chest_key`) · **Literacy:** `icons` · **Analogía:** `balance_pans` (con `chest_single_lock` para las llaves)

## 1. Concepto

Una ecuación de un paso es una igualdad donde la incógnita tiene una sola operación encima: `x + 5 = 12`, `3x = 12`, `x / 2 = 6`. Al terminar, el jugador elige la operación que deshace esa única operación, la aplica a los dos lados sin que nadie se lo indique y verifica que el valor obtenido conserva la igualdad. Antes sabía nivelar una balanza y abrir un cofre; no sabía hacer las dos cosas sobre el mismo objeto.

## 2. Prerequisitos

- `prealg.eq.balance` (nodo 11): la igualdad como invariante. Se usa la balanza entera (barra nivelada como igual, caja cerrada como incógnita, quitar lo mismo de los dos platos), el símbolo `=` que nació allí y la misconception `inverse_applied_one_side`.
- `prealg.inv.operation_as_key` (nodo 12): la operación inversa como llave. Se usan el llavero completo, el diagrama vertical y la llave equivocada que no gira. `wrong_inverse_choice` ya está catalogada allí.

Ninguna arista sigue el orden escolar, donde "despejar" es un solo procedimiento. [C0](../../C-knowledge-graph/C0-esquema.md) las separa a propósito: la llave enseña por qué funciona la inversa, en aritmética pura; la balanza, por qué se aplica a los dos lados. Quien tiene solo la llave la aplica a un lado; quien tiene solo la balanza no sabe qué quitar.

## 3. Dificultad cognitiva real

Lo difícil no es la cuenta sino tres capacidades que "despejar" mezcla:

1. **Conservar la igualdad como invariante.** La ecuación no es una orden de calcular sino la afirmación de que dos cosas pesan lo mismo. Toda acción sobre un lado la destruye, salvo que se repita en el otro. Viene de la balanza; falla en `inverse_applied_one_side`.
2. **Elegir la operación inversa.** Solo la operación que deshace la que acompaña a la incógnita la libera. Elegir `−3` frente a `3x` es saber que hay que quitar el 3 sin saber qué hace el 3. Viene de la llave; falla en `wrong_inverse_choice`.
3. **Conservar la equivalencia paso a paso, sin atajos.** "Pasar al otro lado cambiando el signo" es consecuencia de las dos anteriores, no una regla. Quien la memoriza sin haber sentido la balanza produce `x = 17` (`sign_flip_on_move`): mueve el término sin cambiar la acción.

Las tres son independientes: cada una tiene su misconception con su propia mecánica de explicación.

## 4. Problema intuitivo

Un puesto de mercado con una balanza de platos. La vendedora pone en un plato un frasco cerrado y cinco limones; en el otro, doce limones. Queda nivelada. La pregunta, por voz o por gesto: ¿cuánto pesa el frasco, sin abrirlo?

En `intuition` la escena se detiene antes del resultado: la vendedora va a sacar limones. Tres desenlaces dibujados: saca cinco de cada plato y sigue nivelada; saca cinco solo del plato del frasco y se inclina; los pasa de un plato al otro y se inclina más. El jugador elige y después ve. Tres frascos iguales contra doce limones preparan la llave de dividir.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por capacidad ([G0](../../G-analogias/G0-reglas.md)).

`balance_pans` (mecánica `balance`) es la del YAML. Mapa: plato → lado de la ecuación; pesas → términos; barra nivelada → igualdad; misma acción en ambos platos → transformación de equivalencia; caja cerrada → incógnita; quitar pesas iguales de ambos platos → cancelar; leer la caja sola → solución. Invariante: la barra queda nivelada si, y solo si, los dos platos reciben la misma acción. Ruptura: `negative_weights`. Una pesa no pesa menos que nada, y "multiplicar los dos platos" no es una acción física.

`chest_single_lock` (mecánica `chest_key`) aporta las llaves: forma de la cerradura → operación; forma de la llave → inversa; llave que no gira → no inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas. Ruptura: `two_branches_of_sqrt`, lejos de este nodo.

Cómo conviven: la caja está unida a sus pesas por un broche con forma de cerradura; la llave abre el broche, pero abrirlo de un solo lado inclina la balanza. El cofre plantea "qué llave"; la balanza, "en cuántos platos".

## 6. Mecánica de juego

Primera capa jugable: `concrete`. La balanza es la mecánica principal y las llaves de `chest_key`, la herramienta ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Balanza nivelada. Plato izquierdo: una caja cerrada y cinco pesas unidas por un broche con forma de cerradura de sumar; plato derecho: doce pesas sueltas; abajo, un llavero con dos llaves.
2. Demostración: una mano fantasma toma la llave con forma de restar, la pasa sobre el plato izquierdo (el broche se abre, cinco pesas se elevan), sigue sin soltar hasta el derecho y suelta. La barra no se movió; la caja se abre y muestra siete.
3. El jugador arrastra una llave. Mientras pasa por un plato, la acción ocurre ahí y la balanza responde con inercia. Si suelta tras un solo plato, la barra queda inclinada y la caja no cede. El estado no se borra: pasa la llave por el otro plato y la barra se nivela.
4. Llave equivocada: llega al broche, gira un cuarto de vuelta y se traba. Nada cambia.
5. Éxito: la caja se abre sola cuando queda sin compañía en un plato nivelado. Sin cartel.
6. Verificación (`cs.alg.check_by_substituting`): las pesas que la caja mostró vuelven adentro y la balanza original sigue nivelada.

Con las cerraduras de multiplicar y dividir, quitar pesas con un toque (nodo 11) ya no alcanza: repartir un plato en tres montones iguales solo lo hace la llave. Nada se llama "incorrecto": cada error tiene consecuencia física distinta y dispara su patrón (sección 12).

## 7. Representación visual

Capa `visual`, con dos primitivas de [H](../../H-progresion-abstraccion.md).

`invariant` (dominante). La balanza se estiliza en dos columnas con la barra entre ellas; las pesas se aplanan en barras proporcionales y la caja es una barra de longitud desconocida. Con cada acción a los dos lados, el juego muestra el antes y el después uno sobre otro, con la barra nivelada iluminada en ambos: estados distintos, misma igualdad. Se desplaza lo que sale de los dos lados a la vez; se escala al dividir, cuando cada columna se parte en tramos iguales; se conserva el nivel de la barra.

`invert` (apoyo). Junto a la balanza, el cofre se convierte en el diagrama vertical de E0: arriba la caja, una flecha hacia abajo con la cerradura, abajo la caja acompañada. La llave es la misma flecha reproducida hacia atrás, y solo cierra si devuelve la caja al punto de partida.

Todavía no hay expresiones con operadores, ni `x`, ni igual escrito: el igual es la barra.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Cofre → caja con ficha.** Al abrir la caja por primera vez en `visual`, el cofre se afina hasta ser un contorno y la cerradura se despega del broche como ficha junto a la caja: `□ + 5`. Las barras del otro plato se contraen en `12`.
2. **Llave con color → llave con `−5`.** En el mismo momento la llave pierde el color y gana etiqueta; la forma de la cerradura queda un rato como sombra detrás del `+ 5`.
3. **Caja → `x`.** Cuando el jugador aplica por primera vez una llave etiquetada a los dos platos, la caja se contrae en `x`, como en el nodo 10.
4. **Barra → `=`.** Al siguiente movimiento válido los platos se desvanecen y la barra se contrae en `=`. Queda `x + 5 = 12` sobre una línea que todavía se inclina si la igualdad se rompe. La balanza se pide tocando el `=` y aparece como fantasma.
5. **Llave → operación a ambos lados.** Al soltar la llave sobre el `=`, la etiqueta se desdobla y queda escrita bajo cada lado: `−5` bajo `x + 5`, `−5` bajo `12`. El renglón `x = 7` aparece con un morph.

## 9. Notación matemática

Queda `x + 5 = 12` y debajo la operación aplicada a los dos lados y el resultado `x = 7`.

El nodo no introduce símbolos nuevos. Por la regla de oro de H, cada símbolo llega con su problema, y los dos que se usan ya llegaron: `=` en el nodo 11 (registrar una balanza nivelada sin dibujarla) y `x` en el nodo 10 (nombrar la cantidad desconocida sin describirla con una frase). Lo que se vuelve necesario acá es **escribir la acción**: anotar `−5` bajo los dos lados. El problema que lo exige es la secuencia: con una llave, la balanza fantasma alcanza; con dos (nodo 14) hay que recordar qué se hizo y en qué orden, y eso pide un renglón por acción.

## 10. Definición formal

Capa `formal`: texto corto con voz y la balanza fantasma al lado. Tres frases, de a una: "Una ecuación de un paso es una igualdad donde la incógnita tiene una sola operación encima." "Resolverla es aplicar a los dos lados la operación que la deshace." "La solución es el valor que, puesto en la incógnita, deja la igualdad nivelada."

Condiciones y casos especiales, verificados sobre el objeto: sumar, restar o multiplicar a ambos lados conserva la igualdad; dividir, salvo por cero. `0 · x = 12` es una cerradura sin llave: ningún valor la abre; `0 · x = 0`, cualquiera. La incógnita puede quedar de cualquier lado y el valor puede ser negativo o fraccionario.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "solución" y el caso `0 · x`.

## 11. Propiedades

- **La igualdad se conserva bajo la misma acción en ambos lados.** Si `a = b`, entonces `a + c = b + c`, `a · c = b · c` y `a / c = b / c` con `c ≠ 0`. Ligada a la barra que no se mueve cuando la llave pasa por los dos platos.
- **La inversa devuelve lo original.** `(x + 5) − 5 = x`; `(3x) / 3 = x`. Es `f⁻¹(f(x)) = x`, dicho con el diagrama vertical y sin ese nombre: `f⁻¹` llega en el nodo 21. Ligada a la flecha que sube y deja la caja sola.
- **Las transformaciones de equivalencia son reversibles.** De `x = 7` se vuelve a `x + 5 = 12` con la llave `+5`. Ligada a volver a poner las pesas en la caja.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: balanza nivelada con la caja y fichas de un lado; llavero con la llave correcta y tres distractores generados por `detect`. Tocar la que deja la caja sola.
- `explain`: tres animaciones sobre la misma balanza: la llave pasa por los dos platos y la barra queda nivelada; pasa por uno solo y se inclina; se usa la llave de dividir donde hacía falta restar y se traba. Tocar las que no resuelven; cada distractor es una misconception.
- `manipulate`: arrastrar la misma llave sobre los dos platos. La barra solo se mantiene si la llave es la inversa correcta y pasó por los dos.
- `apply`: cuatro balanzas seguidas con operaciones distintas, una llave cada una, contra el tiempo objetivo del nodo. En `symbolic` la balanza es fantasma.
- `generalize`: la balanza se desvanece y queda la línea con el igual; aplicar fichas de operación a ambos lados, con negativos y fracciones, y con cerraduras nunca vistas.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, encontrar el vector de entrada aplicando la transformación inversa a la salida.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`inverse_applied_one_side`** (`replay_on_mechanic` sobre la balanza). El jugador suelta la llave tras un solo plato, o en notación pasa de `x + 5 = 12` a `x = 12`. El juego congela y repite el gesto en cámara lenta: cinco pesas salen del plato izquierdo, ese plato sube, el derecho baja, y un halo marca el plato no tocado. Voz: "Sacaste 5 de un solo plato. ¿Qué le falta al otro?". La balanza sigue inclinada y el jugador la nivela desde ahí.
- **`wrong_inverse_choice`** (`key_mismatch` sobre el cofre). Frente a `3x = 12` el jugador elige `−3`. El juego muestra la forma de la cerradura `×3`, acerca la llave, la hace trabarse y revela la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué deshace multiplicar por 3?". En `symbolic`, aplicar `−3` a los dos lados es válido pero no simplifica: empujón suave, sin patrón.
- **`sign_flip_on_move`** (`replay_on_mechanic` sobre la balanza). En la línea simbólica el jugador arrastra la ficha `+5` al otro lado del igual sin cambiarla: `x = 17`. La línea se inclina. El replay reconstruye la balanza y muestra qué hizo de verdad: cinco pesas salieron de un plato y entraron en el otro, dos acciones distintas. Voz: "Sacaste 5 de un plato y los pusiste en el otro. ¿Pesan lo mismo?". El jugador nivela desde el estado real.

## 13. Generalización

La analogía se retira en dos tiempos. Primero la balanza, en `symbolic`: cuando la ficha `−5` se aplica al `=` sin mirar los platos, los platos sobran, y con negativos contradicen la ecuación. El cofre queda como fantasma a demanda hasta `formal`: representa estructura, no un nombre.

Variantes sin ayuda visual, en orden: constantes y soluciones negativas (`x + 9 = 2`); incógnita a la derecha (`20 = 4x`); coeficientes y soluciones fraccionarias (`4x = 6`).

Cerraduras arbitrarias. El nodo termina con cofres cuyas cerraduras no son aritméticas: "rotar 90°", "agregar 🍎", "cambiar rojo por azul". El jugador nombra la llave: rotar 90° al revés, quitar 🍎, cambiar azul por rojo. Se evalúa que la estructura (una acción, su inversa, aplicadas a los dos lados de algo que era igual) se reconoce con cualquier objeto.

El nodo está en `abstract` cuando el jugador resuelve las variantes sin pedir balanza ni cofre, nombra la llave de una cerradura arbitraria y distingue una cerradura sin llave (`×0`). La forma completa de esa capa es `adv.alg.group_as_reversible_actions`.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.inverse_and_systems` (`grid_stretch`): la sábana fue deformada y se sabe dónde cayó un vector; aplicar la deformación inversa a los dos lados recupera la entrada. La llave es una matriz.
- `disc.mod.clock_equivalence` (`gears_sequence`): dos engranajes de doce dientes marcan la misma hora; girar los dos hacia atrás lo mismo conserva la coincidencia y deshace el giro desconocido.
- `trig.id.double_angle` (`machine_pipe`): una identidad como tubería con salida conocida; correrla al revés aísla un factor.

La llave sola vuelve además en `csmath.crypto.caesar_shift` (descifrar es girar el alfabeto al revés) y `geom.trans.undo_transformation`, evaluados desde el nodo 12.

Concepto siguiente: `alg.eq.multi_step` ([14](14-alg.eq.multi_step.md)). Frase puente, narrada sobre la última balanza: "Esta caja tenía una sola cerradura. La próxima viene guardada dentro de otro cofre. ¿Cuál se abre primero?". El cofre exterior se cierra sobre el recién abierto y el nodo 14 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `balance_key_both_sides` es nativa: la mecánica renderizada sobre el estado del jugador, que también genera las animaciones de `explain`; gramática `invariant`, con la barra nivelada resaltada en el antes y el después. `chest_pick_key_for_lock` es un clip pre-renderizado de `invert`: la cerradura muestra su forma, el llavero rota, la llave correcta entra y la flecha se reproduce al revés. Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsan `balance_remove_one_side_tilts` (nodo 11) y `chest_wrong_key_stays_shut` (nodo 12) como distractores.

**Calculadora:** en `ready` se habilita `op_solve_linear_1var` ([M](../../M-calculadora/M0-progresion.md)), un ícono de llave junto a cualquier igualdad con una incógnita armada con fichas. No devuelve solo `x = 7`: escribe el renglón con la operación bajo los dos lados y después el resultado. Si el nodo decae, la llave muestra óxido.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel las llaves llevan una etiqueta de un dígito con operador ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: llaves por forma, mano fantasma, `explain` entre animaciones, prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel de fichas y usa el teclado de fichas en vez de tipear.
