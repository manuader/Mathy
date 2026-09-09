# 14 — Varias llaves, en orden (`alg.eq.multi_step`)

> Locale `es`: "Varias llaves, en orden". Minijuego: [Cofre dentro de cofre](../../F-minijuegos/alg.eq.multi_step.md).

**Nodo:** `alg.eq.multi_step` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundarias `balance` y `machine_pipe`) · **Literacy:** `icons` · **Analogía:** `chest_nested`

## 1. Concepto

Una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en dos operaciones o más: `2x + 3 = 11`, `(x + 2) / 5 = 6`, `4(x − 1) = 20`. Al terminar, el jugador identifica cuál de las envolturas es la de afuera, la deshace primero y aplica cada llave a los dos lados hasta dejar la caja sola. Antes sabía elegir una llave; ahora tiene que elegir un **orden** de llaves, y equivocarse de orden no traba nada: produce otra ecuación, válida y peor.

## 2. Prerequisitos

- `alg.eq.one_step` (nodo 13): la llave sobre la balanza. Se usa entero el gesto de pasar la llave por los dos platos, la ficha escrita bajo cada lado, la verificación por sustitución (`cs.alg.check_by_substituting`) y `sign_flip_on_move`, que reaparece con más términos que cruzar.
- `arith.expr.precedence_tree` (nodo 9): la expresión como árbol de cofres anidados. Se usa el dibujo de cajas dentro de cajas, la experiencia de que la llave interior no llega mientras la exterior siga cerrada, y `unwrap_order_inverted`, catalogada allí y dueña del error acá.

Ninguna arista sigue el orden escolar, donde resolver una ecuación de dos pasos es un procedimiento de una sola pieza. El nodo 9 enseñó a leer la envoltura sin incógnita adentro; el nodo 13, a deshacer una envoltura sin anidamiento que leer. Quien tiene solo el árbol sabe qué se hizo primero pero rompe la igualdad al deshacerlo; quien tiene solo la llave conserva la igualdad y empieza por dentro. `arith.expr.precedence_tree` declara este nodo en su `transfer_to`: el árbol vuelve como orden de apertura.

## 3. Dificultad cognitiva real

1. **Leer la envoltura, no la escritura.** En `2x + 3` lo escrito primero es el `2`, y lo último que se le hizo a la caja fue `+3`. La expresión se lee de izquierda a derecha y se construyó de adentro hacia afuera; hay que deshacerla de afuera hacia adentro, viendo la capa externa donde solo hay tinta.
2. **Invertir el orden, no solo las operaciones.** Si al cofre se le puso `×2` y después `+3`, abrirlo pide `−3` y después `÷2`. Es la inversa de una composición, y acá no se nombra: el jugador la ejecuta muchas veces antes de que `alg.fn.composition` (nodo 20) nombre la cadena y `alg.fn.inverse_function` (nodo 21) la vuelta.
3. **Sostener dos invariantes a la vez.** Cada llave sigue teniendo que pasar por los dos platos, y con tres llaves el desequilibrio no se ve al instante: se arrastra y aparece movimientos después.
4. **Que un movimiento mal ordenado siga siendo legal.** El error de orden produce una ecuación verdadera que no simplifica. Es la primera vez que el juego distingue "roto" de "peor", y lo hace con la única evidencia honesta: la capa que quedó sin abrir sigue en pantalla.

## 4. Problema intuitivo

Sigue donde terminó el nodo 13. La caja del mercado quedó abierta sobre el plato y una mano baja un segundo cofre que se cierra sobre ella: la caja recién abierta está guardada adentro de otro, con un candado distinto en la tapa. La pregunta narrada al final del nodo 13 —"¿cuál se abre primero?"— es la primera imagen de este nodo, y ahora hay que responderla con las manos.

En `real` la escena es un depósito de mercado: un paquete atado con una cuerda y, dentro, una caja con su propio cierre. Nadie llega al contenido cortando la caja de adentro; la cuerda está por encima. En `intuition` la escena se detiene con dos llaves flotando sobre el cofre doble y tres desenlaces dibujados: la exterior primero y las dos capas caen en orden; la interior primero, que se apoya sobre madera cerrada y rebota; las dos a la vez y el cofre se sacude sin abrirse. El jugador elige antes de ver. Después, la misma escena con la balanza debajo.

## 5. Analogía del mundo real

`chest_nested` (mecánica `chest_key`) es la analogía del YAML ([G0](../../G-analogias/G0-reglas.md)). Mapa: cofre → expresión; cofre dentro de cofre → subexpresión; forma de la cerradura → operación; forma de la llave → inversa; abrir primero el exterior → orden de precedencia invertido; tesoro → valor; secuencia de cerraduras agregadas → composición. Invariante doble: cada llave devuelve exactamente lo que había, y la única capa accesible es la de afuera. Ruptura: `unknown_in_two_chests`, cuando la misma incógnita aparece en dos cofres de la escena y abrir uno no abre el otro. Ese límite empuja hacia `alg.eq.variable_both_sides` y hacia el nodo 16.

`balance_pans` sigue debajo, heredada del nodo 13, y aporta el otro invariante: la barra queda nivelada si y solo si cada llave pasa por los dos platos. Su ruptura, `negative_weights`, llega antes acá, porque una constante negativa aparece en cuanto se aplica la primera llave.

Por qué las dos: el cofre anidado tiene orden y no tiene equivalencia —un cofre no se desequilibra—; la balanza tiene equivalencia y no tiene profundidad. La convención 1 de la plantilla se resuelve así: `chest_key` provee la herramienta y la lectura del orden, `balance` provee el invariante, y se encuentran en un solo gesto, arrastrar la llave de la capa externa a través del `=`. `machine_pipe` entra como tercera lectura y no como piel: la misma expresión son dos máquinas en serie y resolver es correr la tubería hacia atrás, que es lo que pide el `apply` del locale y lo que prepara el nodo 20.

## 6. Mecánica de juego

Primera capa jugable: `concrete`, sin leer nada. Gestos: `drag` y `tap` ([E0](../../E-mecanicas/E0-catalogo.md)).

1. En el plato izquierdo, un cofre con tapa de cerradura `+` y, por una ventana en la madera, otro cofre adentro con cerradura `×`. En el derecho, pesas sueltas. Barra nivelada, llavero abajo.
2. Demostración: una mano fantasma toma la llave de la cerradura de afuera, la pasa por el plato izquierdo —la tapa se abre, las pesas que traía se elevan—, sigue sin soltar hasta el derecho y suelta. La barra no se movió y la cerradura interior se ilumina.
3. Si el jugador toma la llave de la capa interna, llega hasta la madera de la tapa exterior, se apoya y rebota: nada cambia. Si toma la externa y la pasa por los dos platos, la capa se abre y el estado se anota como un renglón nuevo; en la capa concreta el renglón es la silueta del cofre con una capa menos. Si suelta después de un solo plato, la barra se inclina y ninguna capa se ilumina.
4. Un movimiento legal pero desordenado existe y se distingue: dividir los dos platos por el coeficiente con la capa `+` todavía cerrada parte el cofre y las pesas en montones iguales y deja la barra nivelada. No hay error: hay más tinta, y se ve porque el renglón nuevo está más cargado.
5. Éxito: la caja sola en un plato nivelado, que se abre sin cartel. Verificación (`cs.alg.check_by_substituting`): el valor vuelve adentro, las capas se cierran en orden inverso y la balanza original sigue nivelada.

La pila de renglones es la novedad de interfaz respecto del nodo 13, y responde al problema que ese nodo dejó planteado: con una llave la balanza fantasma alcanzaba; con tres hay que poder mirar hacia atrás.

## 7. Representación visual

Capa `visual`, con `invert` dominante y `invariant` y `compose` de apoyo ([H](../../H-progresion-abstraccion.md)).

`invert` manda porque hay que ver una transformación que vuelve. El cofre doble se estiliza en el diagrama vertical de E0 con dos tramos: arriba la caja, una flecha hacia abajo con la primera cerradura, un punto intermedio, otra flecha con la segunda, abajo la expresión completa. La llave es cada flecha reproducida hacia atrás, y solo se puede tomar la de más abajo: las de arriba están atenuadas hasta que esa se usa. Se conserva el punto de partida; se desplaza el punto de lectura, que sube un tramo por llave.

`invariant` (apoyo) es la balanza del nodo 13 en dos columnas, con la caja envuelta dibujada como la barra de longitud desconocida dentro de un marco; cada llave muestra antes y después con la barra nivelada iluminada en los dos. `compose` (apoyo) aparece solo si el jugador pide la tubería: las dos flechas del diagrama se acuestan y quedan dos máquinas en serie con la entrada tapada y la salida a la vista.

Todavía no hay incógnita en los dos lados: la envoltura es el marco del cofre, no un signo.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, con las identidades del nodo 13: la caja que ya era `x` sigue siéndolo y la barra que ya era `=` también.

1. **Cofre exterior → paréntesis.** Al abrir por primera vez en `visual` un cofre que envolvía a otro, el marco de la madera se contrae sobre lo de adentro hasta quedar en dos trazos verticales: `(x + 2)`. Es el paréntesis del nodo 9, ahora con una incógnita adentro.
2. **Capas → renglones.** La pila de siluetas se convierte en una pila de expresiones, una por movimiento, alineadas por el `=`. La ecuación viva es la de abajo; las de arriba se atenúan y siguen siendo tocables.
3. **Llave → ficha sobre el `=`.** La llave pierde la forma y queda como ficha con etiqueta; soltarla sobre el `=` desdobla la etiqueta bajo los dos lados y escribe el renglón siguiente con un morph.
4. **Cofres → tinta.** Al abrirse la última capa los marcos ya no están y el orden se lee de arriba abajo. El cofre se pide tocando cualquier renglón y aparece como fantasma sobre él.
5. **Renglones → tubería.** Tocando dos renglones consecutivos, el par se acuesta y muestra las dos máquinas en serie con la flecha de vuelta. Único gesto del nodo que no transforma el estado.

## 9. Notación matemática

Queda la ecuación arriba, un renglón por operación aplicada a los dos lados y `x = …` abajo: `2x + 3 = 11`, `−3` bajo cada lado, `2x = 8`, `÷2` bajo cada lado, `x = 4`.

El nodo no introduce símbolos nuevos. El paréntesis nació en `arith.expr.precedence_tree` con el problema de indicar qué ocurre primero; `=` y `x` en los nodos 11 y 10. Por la convención 3 de la plantilla, lo que se vuelve necesario es una **convención de escritura**: un renglón por paso, con la operación bajo los dos lados y la ecuación resultante debajo, alineada por el `=`. El problema que la exige lo sintió el jugador en el paso 6 de la mecánica: con dos o tres llaves ya no se reconstruye de memoria qué se hizo, y cuando un camino se complica hay que poder volver al renglón anterior sin empezar de cero. Sin la pila, deshacer es rehacer. Esa columna es lo que `cs.alg.solving_steps_checklist` guarda en la cheatsheet.

## 10. Definición formal

Capa `formal`: texto corto con voz y el diagrama vertical al lado, de a una frase. "Una ecuación de varios pasos es una igualdad donde la incógnita está envuelta en más de una operación." "Se resuelve deshaciendo la envoltura de afuera hacia adentro, con cada operación aplicada a los dos lados." "El orden de apertura es el orden de construcción invertido."

Condiciones y casos, verificados sobre el objeto: cada paso conserva la igualdad si la operación va a los dos lados, y dividir sigue exigiendo divisor distinto de cero, con la novedad de que el divisor puede ser un coeficiente aparecido a mitad de camino. Un orden distinto del canónico también resuelve si cada paso es legal: `2x + 3 = 11` admite dividir primero y llegar a `x + 3/2 = 11/2`, con la misma solución. El nodo lo dice, porque la regla que enseña es de eficiencia y no de validez. Y si la incógnita aparece en dos cofres, primero hay que juntarla en uno.

Ya jugado: las tres frases, en la capa concreta. Nuevo: el nombre de "paso" y la distinción entre camino inválido y camino largo.

## 11. Propiedades

- **Deshacer una composición invierte el orden.** Si se aplicó primero `g` y después `f`, recuperar pide deshacer `f` y después `g`. Ligada a la llave interior que rebota. En el nodo 21 recibe su escritura, `(f ∘ g)⁻¹ = g⁻¹ ∘ f⁻¹`; acá es el orden de las manos.
- **Cada paso conserva la igualdad.** La pila entera es una cadena de ecuaciones equivalentes. Ligada a la barra que no se mueve en ningún renglón.
- **La cadena es reversible en bloque.** Cerrar las capas en orden inverso devuelve la ecuación original. Ligada a la verificación.
- **Hay más de un camino y no todos cuestan lo mismo.** Ligada al renglón que salió con fracciones por dividir antes de restar.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre anidado con dos cerraduras y la expresión de fichas al lado; el llavero ofrece las dos llaves y distractores generados por `detect`. Tocar la que hay que usar primero. Se mide la lectura de la capa externa, no la cuenta.
- `explain`: dos animaciones sobre el mismo cofre, una que abre el exterior y después el interior y otra que intenta el interior primero y no gira. Tocar la que abre en el orden invertido. El distractor es `unwrap_order_inverted`, así que un error acá también clasifica.
- `manipulate`: arrastrar las llaves en orden mientras la balanza de al lado muestra cada paso nivelado. La barra es el control continuo: si una llave pasó por un plato, la capa siguiente no se ilumina.
- `apply`: una tubería de dos máquinas con salida conocida y entrada tapada. Correrla al revés eligiendo las llaves en orden, contra el tiempo objetivo del nodo. Es el mismo problema con otra piel, y por eso mide aplicación y no repetición.
- `generalize`: sin cofres, fichas con paréntesis y letras; ordenar las llaves y aplicar cada una a ambos lados, con coeficientes fraccionarios y constantes negativas.
- `transfer`: en la balanza de renglones de `linalg.sys.row_operations`, aplicar operaciones de fila en el orden que despeja la caja.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`unwrap_order_inverted`** (`tree_unwrap` sobre el cofre). Es la del nodo: frente a `2x + 3 = 11` el jugador aplica `÷2` primero y escribe `x = 11/2 − 3`. El juego dibuja una caja `+3` que envuelve una caja `×2` que envuelve a `x`, anima la llave `÷2` rebotando contra la capa cerrada y hace latir la exterior. Voz: "La capa de afuera es sumar 3. ¿Cuál abrimos primero?". El estado real se conserva y sigue siendo válido: si su movimiento produjo `x + 3/2 = 11/2`, eso hay en pantalla. Lo que el patrón corrige no es haber dividido, es haber tratado el `3` como si ya no estuviera envuelto.
- **`sign_flip_on_move`** (`replay_on_mechanic` sobre la balanza). Heredada del nodo 13 y más frecuente acá. El jugador arrastra la ficha `+3` al otro lado del `=` sin cambiarla; la línea se inclina y el replay muestra las dos acciones distintas que hizo de verdad. Voz: "Sacaste 3 de un plato y los pusiste en el otro. ¿Pesan lo mismo?".
- Los distractores se generan desde las reglas `detect` de estas dos más las de los prerequisitos directos: `wrong_inverse_choice` como llave que se traba e `inverse_applied_one_side` como movimiento de un solo plato, aunque el nodo no las declare propias.

## 13. Generalización

La analogía se retira en dos tiempos con orden propio. Primero el cofre exterior, en `symbolic`, en cuanto el paréntesis escrito basta para saber qué se abre primero; se reconoce porque el jugador deja de pedir el fantasma. La balanza aguanta más, porque sostiene "a los dos lados" mientras la atención está en el orden, y se retira cuando la ficha se suelta sobre el `=` sin mirar los platos. El diagrama vertical queda a demanda hasta `formal`: representa estructura, no un nombre.

Variantes sin ayuda visual, en orden: dos operaciones con enteros positivos (`2x + 3 = 11`); envoltura invertida, con la suma adentro (`(x + 2) / 5 = 6`); coeficiente y constante negativos (`−3x + 7 = 1`); coeficientes fraccionarios (`x/4 − 2 = 1/2`); tres capas (`4(x − 1) / 2 = 10`). Después, cofres cuyas capas no son aritméticas: "rotar 90°" por fuera y "agregar 🍎" por dentro, donde el jugador nombra las dos llaves y su orden. La forma completa de esa capa —un conjunto de acciones reversibles donde la inversa de una composición es la composición de las inversas en orden invertido— es `adv.alg.group_as_reversible_actions`, y el paso intermedio, con nombre y escritura, es `alg.fn.inverse_function` apoyado en `alg.fn.composition`.

El nodo está en `abstract` cuando el jugador ordena las llaves de una envoltura que nunca vio, con objetos no aritméticos, sin pedir cofre ni balanza, y explica por qué un camino legal puede ser peor que otro.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.sys.row_operations` (`balance` y `ledger` sobre una matriz): cada fila es una balanza y el conjunto de filas es la pila de renglones con varias incógnitas. Despejar es elegir en qué orden aplicar las operaciones de fila, y aplicarlas a la fila entera.
- `calc2.tech.substitution_undoes_chain` (`chest_key` y `grid_stretch`): una integral con una cadena adentro se resuelve reconociendo la capa exterior y deshaciéndola con el cambio de variable. La lectura de la envoltura es la misma; lo que cambia es que está dentro de un signo de integral.
- `adv.ode.separable_variables` (`balance` y `chest_key`): separar variables es aplicar la misma operación a los dos lados de una igualdad donde cada lado tiene su envoltura, y después abrir cada una por su cuenta.

Concepto siguiente: `alg.expr.distributive_tiles` ([15](15-alg.expr.distributive_tiles.md)). El nodo termina en el cofre que no se abre de una: `3(x + 2) = 18` se resuelve dividiendo primero, pero la capa `3(…)` esconde algo que el cofre no muestra. Frase puente, narrada sobre ese cofre: "Este cofre guarda tres cajas iguales, y cada caja tiene dos cosas adentro. ¿Cuánto ocupa todo junto si lo apoyamos en el piso?". El cofre se vuelca, su contenido se extiende sobre una cuadrícula y el nodo 15 empieza con esas baldosas en el suelo.

---

**Visualización:** dos escenas del YAML ([I](../../I-manim/I0-mapping.md)), las dos nativas porque corren sobre el estado del jugador. `chest_unwrap_outer_to_inner` es la principal: el cofre anidado, la apertura capa por capa y la capa que sigue cerrada cuando el orden se invierte; gramática `invert`, con el punto de lectura subiendo un tramo por llave. Parametrizada por la ecuación, el llavero y el orden esperado, produce también las animaciones de `explain` y el replay de `tree_unwrap`. `balance_two_keys_in_order` es la vista de al lado: la balanza con la pila de renglones y la barra nivelada resaltada en el antes y el después de cada paso; gramática `invariant`. Se reúsan `chest_nested_open_inside_first` (nodo 9) como distractor de `explain` y `balance_key_both_sides` (nodo 13) para los pasos de una sola llave. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` el nodo vuelve a habilitar `op_solve_linear` ([M](../../M-calculadora/M0-progresion.md)), ya disponible desde el nodo 13; lo que cambia no es la tecla sino la traza. Con el 13 la calculadora escribía un renglón; con este escribe la pila entera, uno por paso, en el orden en que ella abriría las capas. Es coherente con la regla de M: los pasos cuyo nodo no está en `ready` se colapsan, y acá dejan de colapsarse.

**Edad universal:** el nodo es `icons` porque las llaves llevan etiqueta con operador y número desde el segundo nivel y porque la pila es una columna de expresiones. Lo demás se juega sin leer: las capas se distinguen por la forma del marco, la llave que rebota no necesita explicación, `explain` es entre animaciones y los prompts van por voz. Un adulto llega por diagnóstico, salta `real` e `intuition` y arma la llave con el teclado de fichas en vez de elegirla del llavero ([Q](../../Q-edad-universal.md)).
