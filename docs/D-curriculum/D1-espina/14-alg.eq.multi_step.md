# 14 — Ecuaciones de varios pasos (`alg.eq.multi_step`)

> Locale `es`: "Varias llaves, en orden". Minijuego: [Cofres anidados](../../F-minijuegos/alg.eq.multi_step.md).

**Nodo:** `alg.eq.multi_step` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundarias `balance` y `machine_pipe`) · **Literacy:** `icons` · **Analogía:** `chest_nested`

## 1. Concepto

Una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en más de una operación: `2x + 3 = 11`, `(x + 2) / 5 = 6`, `4(x − 1) = 20`. Al terminar, el jugador identifica cuál es la capa más externa, la abre primero y sigue hacia adentro hasta que la incógnita queda sola, aplicando cada llave a los dos lados. Antes sabía elegir una llave; ahora elige un orden.

## 2. Prerequisitos

- `alg.eq.one_step` (nodo [13](13-alg.eq.one_step.md)): la llave y los dos platos. Se usan la balanza como garantía de equivalencia, el llavero, la verificación por sustitución y el renglón con la operación escrita bajo los dos lados. Las misconceptions `sign_flip_on_move` y `wrong_inverse_choice` ya vienen catalogadas de ahí.
- `arith.expr.precedence_tree` (nodo 9): la expresión como árbol de cofres anidados. Se usa la idea de que un cofre encierra a otro, que el de afuera se abre primero y que cambiar el orden cambia el resultado. De ahí viene también `unwrap_order_inverted`, que acá reaparece con incógnita adentro.

La arista con el nodo 9 no es la del orden escolar, donde jerarquía de operaciones y ecuaciones son unidades separadas. [C0](../../C-knowledge-graph/C0-esquema.md) las une porque despejar es recorrer el árbol al revés: sin árbol no hay orden que invertir, y sin ecuación el árbol parece una convención de escritura.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar dos llaves sino tres capacidades nuevas:

1. **Leer la estructura antes de actuar.** Frente a `2x + 3 = 11` hay que ver que el `+3` envuelve al `×2`, y no al revés. Nada en el renglón lo dice; hay que reconstruir el árbol. Falla en `unwrap_order_inverted`.
2. **Invertir el orden, no solo las operaciones.** La composición se deshace de afuera hacia adentro: lo último que se hizo es lo primero que se desarma. Es contraintuitivo porque el jugador lee de izquierda a derecha y el `2` aparece primero.
3. **Sostener un estado intermedio.** Con dos llaves hay un paso intermedio que sigue siendo una ecuación válida y hay que tratarlo como tal, no como un resultado a medias. Acá `sign_flip_on_move` reaparece con más fuerza, porque hay más ocasiones de mover una ficha en vez de aplicar una acción.

Las tres se ejercitan por separado antes de juntarse: la primera con cofres sin números, la segunda con tuberías, la tercera con la balanza al lado del renglón.

## 4. Problema intuitivo

Un cofre de madera cerrado sobre una mesa. La cámara se aleja y aparece un cofre de hierro más grande que lo contiene, también cerrado, con otra cerradura. Por una rendija del de madera se ve brillar algo.

En `intuition` la escena se detiene con las dos llaves en la mano. Dos desenlaces dibujados: la llave del cofre interior choca contra la tapa del exterior, que sigue cerrada; la llave del exterior gira, la tapa se levanta y recién ahí el de madera queda al alcance. El jugador elige y después ve.

## 5. Analogía del mundo real

`chest_nested`, con la mecánica `chest_key` ([G0](../../G-analogias/G0-reglas.md)). Mapa: cofre → expresión; cofre dentro de cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; abrir primero el cofre de afuera → recorrer la jerarquía al revés; tesoro → valor; agregar cerraduras en secuencia → composición.

Invariante: la llave de un cofre solo funciona cuando ese cofre está expuesto. Un cofre envuelto no tiene cerradura accesible, y esa es toda la explicación del orden.

Ruptura: `unknown_in_two_chests`. Cuando la incógnita aparece en dos lugares (`3x + 2 = x + 10`), no hay un cofre que la contenga sino dos, y la imagen se fuerza. Por eso `alg.eq.variable_both_sides` vuelve a la balanza pura.

Dos analogías secundarias sostienen las otras capacidades. La balanza garantiza que cada llave se aplique a los dos lados: el cofre dice cuál llave y en qué orden, la balanza dice en cuántos platos. La tubería de `machine_pipe` muestra el sentido de ida: dos máquinas fabricaron el `11` a partir del `x`, y correrlas al revés es abrir cofres de afuera hacia adentro. Las tres son vistas del mismo objeto, sincronizadas por ids.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Mecánica principal `chest_key`, con `balance` como garantía y `machine_pipe` como lectura ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Dos cofres anidados en el centro, el llavero abajo, la balanza a un costado con la misma configuración en barras.
2. Demostración: una mano fantasma toma la llave de la cerradura visible, la pasa por los dos platos y el cofre exterior se abre, dejando expuesto el interior.
3. El jugador arrastra una llave. Si la cerradura a la que apunta está tapada, la llave rebota contra la tapa y vuelve al llavero. El cofre exterior late una vez.
4. Si la llave es correcta pero se suelta después de un solo plato, la balanza se inclina y la tapa se traba a medio abrir. El estado se conserva.
5. Cada cofre abierto deja un renglón nuevo debajo del anterior. Los renglones no se borran: son la historia del despeje.
6. Éxito: el último cofre se abre y el tesoro muestra el valor. Verificación con `cs.alg.check_by_substituting`: el valor vuelve al cofre más interno, los cofres se cierran uno sobre otro y la balanza original sigue nivelada.

Rebotar, trabarse e inclinarse son tres consecuencias distintas, y cada una dispara su patrón (sección 12).

## 7. Representación visual

Capa `visual`, con `invert` como primitiva dominante ([H](../../H-progresion-abstraccion.md)).

Los cofres se aplanan en cajas anidadas con bordes de distinto grosor: cuanto más externa, más gruesa, con la cerradura dibujada sobre el borde. El diagrama vertical del nodo 12 se estira en una escalera: arriba `x`, una flecha con `×2`, otra con `+3`, abajo `11`. Subir la escalera es despejar.

Se desplaza el renglón hacia abajo con cada capa abierta; se escala la caja restante, que se encoge al perder su envoltura; se conserva la nivelación de la balanza y el valor del tesoro. La tubería aparece a demanda como dos máquinas en fila con el sentido de ida marcado, y una palanca la corre al revés.

Todavía no hay paréntesis escritos: el anidamiento es el borde de la caja.

## 8. Transición a símbolos

Cuatro pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Cofre exterior → paréntesis.** Al abrir por primera vez un cofre que contiene a otro en `visual`, el borde grueso se afina, se estira por arriba y por abajo y se cierra sobre sí mismo hasta quedar como los dos arcos de un paréntesis. La cerradura queda escrita afuera: `5 · (□ + 2)`. Es el símbolo que nace en este nodo.
2. **Cajas → fichas.** En el mismo gesto, las cajas interiores se contraen en fichas y la incógnita se contrae en `x`, como en el nodo 10.
3. **Escalera → renglones.** Al aplicar la segunda llave, la escalera vertical se recuesta: cada peldaño se convierte en un renglón con la operación escrita bajo los dos lados, y los renglones quedan apilados en el mismo orden en que estaban los peldaños.
4. **Llavero → teclado de fichas.** Cuando el jugador ya no necesita llaves prearmadas, el llavero se abre en abanico y sus llaves se reordenan en una grilla de fichas: una fila de operadores, una de dígitos. Arrastrar un operador y un dígito arma la llave, y el juego la valida antes de aplicarla. No es un teclado de texto: es el mismo llavero con otra disposición.

## 9. Notación matemática

Queda `5(x + 2) = 30`, y debajo un renglón por acción: `÷5` bajo los dos lados, después `−2` bajo los dos lados, y `x = 4`.

El símbolo nuevo es el **paréntesis**. El problema que lo hace necesario es el que el jugador acaba de vivir: sin paréntesis no hay forma de escribir "primero sumar 2, después multiplicar por 5" en un renglón, porque `5 · x + 2` ya significa otra cosa. El borde del cofre exterior era el paréntesis dibujado, y al aplanarse el paréntesis es lo que queda. Es la regla de oro de [H](../../H-progresion-abstraccion.md): el símbolo llega cuando su ausencia produce ambigüedad.

La segunda convención, sin símbolo propio, es el **apilado de renglones**: uno por acción, en el orden en que se hizo. Se vuelve necesaria porque con dos llaves el jugador ya no reconstruye de memoria qué hizo primero.

## 10. Definición formal

Capa `formal`: texto corto con voz y los cofres fantasma al lado. Tres frases, de a una: "Una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en más de una operación." "Resolverla es abrir las envolturas de afuera hacia adentro, aplicando cada inversa a los dos lados." "Cada paso produce una ecuación nueva con las mismas soluciones que la anterior."

Condiciones y casos especiales, verificados sobre el objeto: el orden lo determina la estructura, no el gusto; hay ecuaciones donde dos órdenes funcionan porque las capas conmutan (`x + 2 + 3 = 10`), y el juego las muestra como dos cofres del mismo tamaño; `2(x + 3) = 2x + 7` es un cofre sin tesoro.

Ya jugado: las tres frases enteras. Nuevo: la palabra "equivalentes" y el caso sin solución.

## 11. Propiedades

- **Las transformaciones de equivalencia se componen.** Si aplicar una acción a los dos lados conserva las soluciones, aplicar dos en fila también. Ligada a la pila de renglones, donde cada uno hereda la nivelación del anterior.
- **La composición se deshace en orden inverso.** Deshacer "multiplicar y después sumar" es "restar y después dividir". Ligada a la escalera recorrida hacia arriba y a la tubería corrida al revés.
- **Las capas que conmutan admiten dos órdenes.** Sumar 2 y sumar 3 se abren en cualquier orden; sumar 3 y multiplicar por 2 no. Ligada a los dos cofres del mismo tamaño frente a los dos anidados.
- **La solución no cambia al abrir una capa.** Ligada a la verificación por sustitución, que cierra los cofres de nuevo.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre anidado con dos operaciones y la expresión de fichas al lado. Tocar la llave que hay que usar primero; los distractores son la llave del cofre interior y dos que no corresponden a ninguna cerradura.
- `explain`: dos animaciones sobre el mismo cofre. En una se abre el exterior y después el interior; en la otra se intenta el interior primero y la llave rebota. Tocar la que abre en orden invertido.
- `manipulate`: arrastrar las llaves en orden sobre el cofre anidado mientras la balanza muestra cada paso nivelado. La balanza es el testigo, no el objetivo.
- `apply`: una tubería de dos máquinas con salida conocida. Correrla al revés eligiendo las llaves en el orden correcto, contra el tiempo objetivo del nodo.
- `generalize`: sin cofres dibujados, fichas con paréntesis y letras. Ordenar las llaves y aplicar cada una a ambos lados.
- `transfer`: en la balanza de renglones de `linalg.sys.row_operations`, aplicar operaciones de fila en el orden que despeja la caja.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`unwrap_order_inverted`** (`tree_unwrap` sobre `chest_key`, mecánica que el nodo declara). Frente a `2x + 3 = 11` el jugador aplica `÷2` primero y escribe `x = 11 / 2 − 3`. El juego dibuja la expresión como una caja `+3` que envuelve una caja `×2` que envuelve a `x`, anima la llave `÷2` intentando atravesar la caja `+3` cerrada y la hace rebotar. La caja exterior late. Voz: "La capa de afuera es sumar 3. ¿Cuál abrimos primero?". El estado real se conserva y sigue siendo válido.
- **`sign_flip_on_move`** (`replay_on_mechanic` sobre `balance`, también declarada). El jugador arrastra la ficha `+3` al otro lado del igual sin cambiarla y la línea se inclina. El replay reconstruye la balanza y muestra dos acciones donde el jugador creyó ver una. Voz: "Sacaste 3 de un plato y los pusiste en el otro. ¿Pesan lo mismo?".
- **`wrong_inverse_choice`**, heredada del nodo 13, aparece más seguido porque hay dos ocasiones de errar. Su mecánica declarada es `chest_key`, que este nodo tiene, así que corre sin adaptación: la llave se traba y aparece la silueta hueca de la correcta. Voz: "Esa llave no abre este cofre. ¿Qué deshace multiplicar por 2?".

## 13. Generalización

La analogía se retira en dos tiempos. Los cofres se van en `symbolic`, cuando el paréntesis ya se lee como envoltura sin dibujarla, y quedan como fantasma a demanda. La balanza se retira antes, en cuanto el jugador aplica la llave al `=` sin mirarla. La tubería sobrevive al nodo entero porque no representa la ecuación sino el sentido de ida.

Variantes sin ayuda visual, en orden: tres capas (`(3x − 1) / 2 = 7`); coeficientes fraccionarios; capas que conmutan; ecuaciones sin solución y con infinitas soluciones, presentadas como cofre sin tesoro y cofre que abre con cualquier llave.

El nodo está en `abstract` cuando el jugador ordena las llaves de una ecuación de tres capas sin dibujar el árbol, justifica el orden señalando la estructura y reconoce los dos casos degenerados. La forma completa de esa capa es `adv.alg.group_as_reversible_actions`.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.sys.row_operations` (`balance` y `ledger`): un sistema escrito como renglones. Las operaciones de fila son las llaves y el orden importa igual; despejar es llevar la tabla a escalones.
- `calc2.tech.substitution_undoes_chain` (`chest_key` y `grid_stretch`): la integral por sustitución. La cadena que armó el integrando se corre al revés, y elegir mal la capa interior deja una expresión que no cierra.
- `adv.ode.separable_variables` (`balance` y `chest_key`): una ecuación diferencial separable. Las dos capas se abren en orden y cada acción va a los dos lados, con la integral como última llave.

Concepto siguiente: `alg.expr.distributive_tiles` ([15](15-alg.expr.distributive_tiles.md)). Frase puente, narrada sobre el último cofre con paréntesis: "El paréntesis te dejó envolver una suma. ¿Y si en lugar de abrir el cofre, lo repartís?". El paréntesis de `5(x + 2)` se ensancha hasta convertirse en un rectángulo de ancho 5, y el nodo 15 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `chest_unwrap_outer_to_inner` es nativa: recibe la ecuación como árbol, el llavero y el orden esperado, y dibuja los cofres abriéndose de afuera hacia adentro; gramática `invert`, con la caja exterior latiendo cuando la llave rebota. Produce las animaciones de `explain` y el replay de `unwrap_order_inverted`. `balance_two_keys_in_order` es nativa y corre en paralelo sobre la balanza del jugador, con la barra nivelada resaltada después de cada llave; gramática `invariant`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsan `chest_nested_open_inside_first` y `pipe_two_machines_order_matters` (nodo 9) como distractores y como lectura de ida.

**Calculadora:** en `ready` el nodo amplía `op_solve_linear` ([M](../../M-calculadora/M0-progresion.md)), que ya existía desde el nodo 13, a ecuaciones de varias capas con paréntesis, y el ícono de llave se duplica en un llavero pequeño. La salida no es solo el valor: escribe la pila de renglones completa, uno por acción, y ofrece cerrar los cofres para verificar. Si el nodo decae, el llavero muestra una llave menos.

**Edad universal:** el nodo es `icons` porque las llaves llevan etiqueta con operador y número desde el primer nivel, heredada del nodo 13 ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: cerraduras por forma, cofres por tamaño, mano fantasma, `explain` entre dos animaciones y prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel de paréntesis y usa el teclado de fichas; para él los cofres aparecen una sola vez, como explicación del orden.
