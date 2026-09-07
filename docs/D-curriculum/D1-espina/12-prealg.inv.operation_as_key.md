# 12 — Toda operación tiene llave (`prealg.inv.operation_as_key`)

> Locale `es`: "Toda operación tiene llave". Minijuego: [El llavero](../../F-minijuegos/prealg.inv.operation_as_key.md).

**Nodo:** `prealg.inv.operation_as_key` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` · **Literacy:** `none` · **Analogía:** `chest_single_lock`

## 1. Concepto

Toda operación que no destruye información se puede deshacer, y lo que la deshace es otra operación de la misma familia. Al terminar, el jugador mira una cerradura cualquiera, elige del llavero la única llave que devuelve el cofre a como estaba, dibuja la pareja como una flecha que baja y otra que sube, y reconoce la cerradura que no tiene llave. Antes sabía que restar deshace sumar y que dividir deshace multiplicar, cada cosa en su nodo; no sabía que las dos son el mismo hecho ni que hay un conjunto de llaves donde buscar.

## 2. Prerequisitos

- `arith.sub.undo_add` (nodo 4): restar deshace sumar. Se usa el par entero y el diagrama de ida y vuelta del caminante, que acá se pone de pie.
- `arith.div.undo_mul` (nodo 6): dividir deshace multiplicar. Se usa el par entero y su caso límite: `cs.arith.div_by_zero_no_key` ya dejó dicho que hay algo que no tiene vuelta.
- `arith.int.negatives` (nodo 7): los números con signo, para que el llavero tenga llaves negativas y para que "sumar un negativo" y "restar" convivan sin que el jugador elija cuál es la verdadera.

Las tres aristas se apartan del orden escolar en un punto: acá no hay ninguna ecuación y no se despeja nada. La escuela introduce la inversa como el paso técnico de un despeje; [C0](../../C-knowledge-graph/C0-esquema.md) la separa del nodo 11 a propósito, y el 12 no depende de él. La llave se aprende en aritmética pura, sobre un cofre y sin platos; la balanza, sobre dos platos y sin llaves. Quien tiene solo la llave la aplica a un lado; quien tiene solo la balanza no sabe qué quitar. Se encuentran en el nodo 13 y no antes. El nodo 10 tampoco es prerequisito, y eso tiene una consecuencia concreta: acá no se puede suponer que exista la letra, así que todo lo que este nodo escribe está escrito sobre el objeto y nunca sobre una incógnita.

## 3. Dificultad cognitiva real

Lo difícil no es saber que restar deshace sumar, que el jugador ya sabe. Es tres cosas que ese saber suelto no contiene:

1. **Ver "deshacer" como una operación y no como un retroceso.** Volver atrás suena a rebobinar la película. Acá volver atrás es **hacer algo**: una acción nueva, con su número, que se aplica hacia adelante y produce el estado anterior.
2. **Elegir entre varias candidatas.** Con una sola pareja no hay elección; con un llavero de cuatro hay que leer la cerradura y decidir. Elegir `−3` frente a una cerradura `×3` es querer quitar el tres sin haber entendido qué hace el tres. Falla en `wrong_inverse_choice`.
3. **Aceptar que algunas cerraduras no tienen llave.** Que toda operación tenga inversa es falso, y descubrir el contraejemplo es parte del nodo: una cerradura que deja todos los cofres iguales destruyó la información y ninguna llave la recupera. Sin ese caso, "toda operación tiene llave" sería un eslogan.

La palabra que el nodo usa es **inversa**, y la usa como acción: la inversa de multiplicar por tres, la llave de esta cerradura. No es todavía un objeto con nombre propio: nombrar la llave como una cosa que existe por sí sola, con su símbolo, es del nodo 21.

## 4. Problema intuitivo

Un taller de arreglos. El tallerista recibe un paquete envuelto, le pone una capa de papel más y lo deja en el estante de salida. Al rato el dueño reclama: quiere el paquete como lo trajo. La pregunta, por voz o por gesto: ¿qué hay que hacerle al paquete del estante para que vuelva a ser el que entró?

En `intuition` la escena se detiene con el paquete en la mesa y tres herramientas al lado. Tres desenlaces dibujados: se le saca una capa y queda como estaba; se le pone otra y queda peor; se lo corta al medio y no vuelve nunca. El jugador elige y después ve. El tercero es la cerradura sin llave dibujada antes de tener nombre.

## 5. Analogía del mundo real

`chest_single_lock`, sobre la mecánica `chest_key` ([G0](../../G-analogias/G0-reglas.md)). Mapa: cofre → expresión; forma de la cerradura → operación; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas.

Invariante: la llave devuelve exactamente lo que había, ni más ni menos; si devuelve algo parecido, no era la llave. Ruptura: `two_branches_of_sqrt`. Una cerradura de elevar al cuadrado se abre a dos salas, `3` y `−3`, y un cofre físico no tiene dos interiores; ese borde está lejos, en `alg.fn.quadratic_and_sqrt`. La analogía se desvanece en `symbolic`.

Por qué esta y no otra: el paso 2 del test de [G0](../../G-analogias/G0-reglas.md) se cumple con una precisión rara —cada acción física corresponde a una operación válida, y la única acción sin operación, forzar la cerradura, la mecánica la bloquea— y el llavero da algo que ninguna otra analogía da: el conjunto. Restar y dividir dejan de ser dos hechos sueltos y pasan a ser dos elementos de una colección donde hay que buscar.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. El nodo declara una sola mecánica, `chest_key`, y no hay balanza en ninguna pantalla: la pregunta "en cuántos lados" no se hace acá. Gestos: `drag` y `tap` ([E0](../../E-mecanicas/E0-catalogo.md)).

1. Un cofre cerrado sobre la mesa, con una cerradura con forma en la tapa; abajo, un llavero con cuatro llaves de formas distintas colgando de una argolla. Demostración: una mano fantasma hace girar el llavero, toma la que encaja, la gira entera y el cofre se abre, con lo que había antes de la cerradura adentro.
2. **Arrastrar una llave a la cerradura.** Si es la inversa, entra, gira entera y el cofre se abre, y la animación de la cerradura se reproduce hacia atrás mientras la llave gira: ese es el argumento visual entero. Si no lo es, gira un cuarto de vuelta, se traba y vuelve sola al llavero, con el cofre intacto.
3. **Tocar el llavero.** Rota y muestra las llaves de a una, grandes. Buscar es un gesto del juego, tan importante como elegir.
4. **Cerraduras con número.** Desde el segundo nivel la cerradura es una forma con un número —multiplicar por tres, sumar cinco— y las llaves también: la elección pasa a ser de forma y de valor a la vez.
5. **La cerradura que no tiene llave.** Un cofre con una cerradura que aplasta todo lo que hay adentro. El jugador prueba las cuatro y ninguna gira; el juego no ofrece una quinta, y la respuesta del nodo es que no la hay.
6. **Cerrar de nuevo.** Tocar el cofre abierto vuelve a aplicar la cerradura original, y la ida y la vuelta se cancelan en los dos órdenes.

Nada se llama "incorrecto". Cada error tiene su consecuencia física: la llave que se traba, el llavero que gira sin encontrar nada, el cofre que sigue cerrado.

## 7. Representación visual

Capa `visual`, con `invert` dominante ([H](../../H-progresion-abstraccion.md)).

El cofre se convierte en el **diagrama vertical**, que nace acá y acompaña a la mecánica hasta el final del curriculum. Arriba, el objeto tal como entró, dibujado como una pila o una barra. En el medio, una flecha que baja con la operación escrita al costado. Abajo, el resultado. La llave no es un objeto nuevo: es **la misma flecha reproducida hacia arriba**, con su propia etiqueta. Con una llave que no es, la flecha de vuelta se dibuja igual pero aterriza en otro lado y el objeto de arriba no coincide, y esa falta de coincidencia es toda la explicación.

Lo que se desplaza es el objeto cuando la operación suma o resta; lo que se escala, cuando multiplica o divide. Lo que se conserva es el punto de partida: las dos flechas encierran un recorrido cerrado, y el nodo entero se lee como "el recorrido se cierra o no se cierra". Todavía no hay igualdad, ni dos lados, ni nada escrito sobre una línea horizontal: el diagrama es vertical y trata de un solo objeto.

## 8. Transición a símbolos

Cinco escalones sobre el mismo cofre, y cada uno lo abre un gesto del jugador.

1. **Cofre → flecha que baja.** Al abrir el primer cofre en `visual`, las paredes se disuelven y quedan el objeto de arriba, la flecha con la cerradura al costado y el resultado abajo, los tres con los ids que tenían dentro del cofre.
2. **Llave → flecha que sube.** En el mismo gesto, la llave se estira y se convierte en la flecha de vuelta, al lado de la de ida y en sentido contrario. La forma de la llave queda un rato como sombra detrás de la etiqueta.
3. **Forma → etiqueta con operador y número.** La cerradura pierde el color y su forma se contrae en `×3`; la llave hace lo mismo y queda `÷3`. Es la primera vez que una acción se escribe en vez de dibujarse.
4. **Dos flechas → pareja del llavero.** Al arrastrar la llave a la argolla, las dos etiquetas quedan registradas juntas. El llavero deja de ser un objeto de la escena y se vuelve una lista que crece y se abre con un toque.
5. **Diagrama → renglón corto.** Al tocar el diagrama, las tres filas se acuestan en una línea que dice qué entró, qué se le hizo y qué salió, y la flecha de vuelta se escribe debajo con su etiqueta. Tocar el renglón vuelve a levantar el diagrama.

## 9. Notación matemática

El nodo no introduce símbolos nuevos. Todos los que usa —los dígitos, los cuatro signos de operación, el signo de los negativos— ya nacieron en los nodos 1 a 7 con su propio problema.

Lo que sí aporta es **una convención de escritura**: el diagrama vertical y su flecha de vuelta. Arriba el objeto, una flecha hacia abajo con la operación al costado, abajo el resultado; la llave es la misma flecha dibujada hacia arriba. El problema que la hace necesaria es el llavero. Con una sola pareja alcanzaba con señalar: "esta llave abre este cofre". Con cuatro parejas, y con cerraduras que llevan número, señalar deja de escalar y hace falta **anotar qué deshace qué**, de manera que la anotación se pueda guardar, comparar y buscar. La flecha de vuelta es esa anotación.

Que la llave sea un objeto por derecho propio, con símbolo, llega en el nodo 21 y no antes. Acá "inversa" es lo que hace una llave, no lo que una llave es.

## 10. Definición formal

Capa `formal`: texto corto con voz y el diagrama vertical al lado, de a una frase. "Deshacer una operación es aplicar otra operación." "La llave de una operación es la única que devuelve exactamente lo que había." "Hay operaciones sin llave: las que dejan igual a cosas que eran distintas."

Condiciones y casos especiales, verificados sobre el objeto. Sumar cero y multiplicar por uno son cerraduras que no cierran nada: la llave es la misma acción y la flecha no mueve el objeto. Multiplicar por cero es la cerradura sin llave, y el jugador lo comprueba poniendo tres objetos distintos en tres cofres iguales y viendo que quedan idénticos: no hay manera de saber cuál era cuál. Restar y sumar el opuesto son la misma llave escrita de dos maneras y las dos abren, sin que ninguna se trabe.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "inversa" dicha en voz alta, y el caso de las cerraduras que no cierran nada.

## 11. Propiedades

- **La inversa devuelve lo original.** Aplicar la cerradura y después su llave deja el objeto como estaba, y al revés también. Ligada a la flecha que baja y la que sube encerrando un recorrido cerrado. El nodo la enuncia con el diagrama y no le pone nombre de función: eso es del nodo 21.
- **La llave es única.** Para una cerradura dada hay exactamente una acción del llavero que la deshace y las otras tres se traban. Ligada a probar las cuatro; es lo que hace que `wrong_inverse_choice` sea un error y no una alternativa.
- **La llave de la llave es la cerradura.** Si `÷3` abre `×3`, entonces `×3` abre `÷3`: las parejas del llavero no tienen dirección. Ligada a dar vuelta el diagrama y ver que sigue siendo válido.
- **No toda operación tiene llave.** Una operación que deja igual a objetos que eran distintos no se puede deshacer, porque la información se perdió. Ligada a los tres cofres idénticos de la sección 10.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre cerrado con una operación grabada en la cerradura y un llavero; tocar la llave que tiene la operación contraria. Los distractores se generan desde `detect`: la misma operación, la inversa de la otra pareja, un número cercano.
- `explain`: dos animaciones sobre cofres con la misma cerradura de multiplicar. En una entra la llave de dividir y la flecha de vuelta cierra el recorrido; en la otra se prueba la de restar, se traba y el cofre no se mueve. Tocar la segunda; el distractor es `wrong_inverse_choice`.
- `manipulate`: una fila de cofres con operaciones distintas y el llavero completo; arrastrar cada llave a su cofre, en cualquier orden.
- `apply`: un cofre con una operación y un número, y un teclado de fichas con operadores y números por separado; armar la llave eligiendo los dos. Es el primer ítem donde la llave no viene hecha.
- `generalize`: los cofres pierden los dibujos y quedan fichas de operación sueltas; emparejar cada una con su inversa, incluidas las de números negativos, y dejar sin pareja la que no tiene.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar la transformación que devuelve la grilla a su forma, como una llave.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`wrong_inverse_choice`** (`key_mismatch` sobre el cofre). Frente a una cerradura de multiplicar por tres, el jugador arrastra la llave de restar tres. El juego muestra la forma de la cerradura, acerca esa llave, la hace girar un cuarto de vuelta y trabarse, y revela al lado la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué operación deshace multiplicar por 3?". El llavero sigue disponible y el cofre sigue cerrado, que es un estado válido para seguir. Es la misconception que este nodo cataloga y que el 13 hereda para usarla dentro de una igualdad.

## 13. Generalización

La analogía se retira en `symbolic`, cuando el jugador elige la llave leyendo la etiqueta sin necesitar la forma. El diagrama vertical se queda: no es piel sino estructura, y sobrevive al cofre hasta el final del curriculum, primero visible y después a demanda.

Variantes sin ayuda visual, en orden: las cuatro operaciones con un dígito; cerraduras con números negativos, donde "restar menos dos" y "sumar dos" son la misma llave; cerraduras que no cierran nada (`+0`, `×1`); la cerradura sin llave (`×0`), que hay que reconocer y no resolver.

Cerraduras que no son aritméticas. El nodo termina con cofres cuyas cerraduras actúan sobre cosas que no son números: girar noventa grados, agregar una tapa, cambiar el rojo por el azul, correr el alfabeto tres lugares. El jugador nombra la llave —girar noventa grados al revés, quitar la tapa, cambiar el azul por el rojo, correr el alfabeto hacia atrás— y también señala la que no la tiene, como pintar todo de negro. Se evalúa que la estructura —una acción, su vuelta, un recorrido que se cierra— se reconoce con cualquier objeto.

El nodo está en `abstract` cuando el jugador nombra la llave de una cerradura que nunca vio, sin números, distingue una cerradura sin llave, y explica por qué la llave es única sin recurrir al cofre. La forma completa de esa capa es `adv.alg.group_as_reversible_actions`, que tiene a este nodo como prerequisito directo.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `alg.fn.inverse_function` (`machine_pipe`): la llave deja de ser lo que se hace y pasa a ser una cosa que se nombra, con símbolo propio. Se evalúa que el jugador reconozca su llave en un objeto que ahora tiene nombre.
- `calc1.ftc.integral_undoes_derivative` (`fill_accumulate`): el tanque que se llena es la llave del caminante que mide la cuesta. La misma pareja veinte nodos más tarde, con la incomodidad de que ahí la llave devuelve una familia y no un objeto.
- `linalg.map.inverse_and_systems` (`grid_stretch`): la sábana fue deformada y la llave es la deformación reproducida al revés. Aparece la primera cerradura grande sin llave: la grilla aplastada a una línea perdió información, como el cofre de multiplicar por cero.
- `geom.trans.undo_transformation` (`grid_stretch`): una figura fue girada, reflejada y agrandada, y hay que devolverla. Hereda de este nodo la analogía y la misconception, y ahí las cerraduras no aritméticas dejan de ser un ejercicio de generalización y pasan a ser el contenido.

La llave sola vuelve además en `csmath.crypto.caesar_shift`, que declara a este nodo como prerequisito y usa `chest_single_lock` para descifrar corriendo el alfabeto al revés. El grafo no lo lista en `transfer_to`, así que la evidencia de transferencia de este nodo se recoge en los cuatro de arriba y el César se juega como reaparición de la mecánica.

Concepto siguiente: `alg.eq.one_step` ([13](13-alg.eq.one_step.md)). Frase puente, narrada sobre el último cofre abierto: "Ya sabés qué llave abre cada cerradura. ¿Y si el cofre estuviera apoyado en un plato de una balanza?". El cofre no se mueve; debajo aparece un plato, y del otro lado aparece otro plato con pesas, y la barra entre los dos. El nodo 13 empieza ahí, y es el punto donde la pregunta de este nodo —cuál es la acción— se junta con la del nodo 11 —en cuántos lados—.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), las dos nativas y de gramática `invert`. `chest_key_matches_lock` toma la operación, el valor y las candidatas: la cerradura muestra su forma, el llavero rota, la llave correcta entra y gira, y la flecha vertical se reproduce hacia arriba hasta cerrar el recorrido. `chest_wrong_key_stays_shut` es la escena propia del error y toma la operación, la equivocada y el valor: la llave gira un cuarto de vuelta, se traba y vuelve al llavero. Las dos producen las animaciones de `explain`, y la segunda se reúsa en el nodo 13 como distractor. Ninguna lleva texto rasterizado: las cerraduras son formas y las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_inverse_op` ([M](../../M-calculadora/M0-progresion.md)), la tecla llave de la fila `t0`. Es la versión general de lo que el nodo enseña: aplicada sobre la última operación, muestra su inversa en el mismo diagrama vertical de la sección 7, con una flecha de vuelta que se puede tocar. Es la única tecla que vive solo en modo operar y no está en el sandbox, porque necesita una operación previa sobre la cual actuar. Desde este nodo, además, cada tecla que se habilita aparece con el espacio de su llave al lado, aunque sea silueta. Si el nodo decae, la llave muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): llaves y cerraduras por forma y color, llavero que rota con un toque, mano fantasma para el primer giro, `explain` entre animaciones, prompts por voz. Desde el segundo nivel las cerraduras llevan un número, que es un ícono con historia y no texto. Un adulto llega por diagnóstico saltando `real` e `intuition` y arma la llave con el teclado de fichas en vez de elegirla del llavero; lo que no se le ahorra es probar una llave que se traba, porque `wrong_inverse_choice` solo se desactiva habiéndola sentido.
