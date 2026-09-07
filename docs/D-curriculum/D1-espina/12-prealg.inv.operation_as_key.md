# 12 — Toda operación tiene llave (`prealg.inv.operation_as_key`)

> Locale `es`: "Toda operación tiene llave". Minijuego: [El llavero](../../F-minijuegos/prealg.inv.operation_as_key.md).

**Nodo:** `prealg.inv.operation_as_key` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (única) · **Literacy:** `none` · **Analogía:** `chest_single_lock`

## 1. Concepto

Toda operación tiene otra que la deshace y devuelve exactamente lo que había. Al terminar, el jugador arma la llave completa de una cerradura cualquiera eligiendo la operación contraria y el mismo número, deshace una cadena de dos acciones en el orden inverso, y reconoce una acción que no tiene llave. Todo esto en aritmética pura, sin una sola igualdad y sin nada que averiguar: acá no hay incógnita ni ecuación, hay una acción y su vuelta.

## 2. Prerequisitos

- `arith.sub.undo_add` (nodo 4): restar deshace sumar. Se usa la pareja `+` y `−` como experiencia, no como definición: el jugador ya vio un objeto avanzar y volver al mismo punto.
- `arith.div.undo_mul` (nodo 6): dividir deshace multiplicar. Se usan el corte en filas iguales y el hecho de que el reparto devuelve el tamaño original, que es lo que hace que la llave de multiplicar sea creíble antes de que exista una fracción.
- `arith.int.negatives`: los negativos. Se usan para dos cosas. Una, que la llave existe aunque el resultado quede por debajo de cero: `3` cerrado con `−7` se abre igual. Otra, que restar siete y sumar menos siete son la misma llave con dos caras, lo cual evita que el llavero se duplique.

Ninguno de los tres es un nodo de álgebra, y eso es deliberado. La escuela presenta la operación inversa dentro del procedimiento de despejar, donde aparece mezclada con la igualdad, con la incógnita y con la costumbre de pasar términos. [C0](../../C-knowledge-graph/C0-esquema.md) la aísla acá, sin ecuaciones, para que el jugador aprenda por qué la inversa funciona antes de tener dónde aplicarla. El nodo 13 junta esto con la balanza del 11, y ahí sí hay ecuación.

Notar que el nodo no declara `prealg.var.unknown_as_box` entre sus prerequisitos, y no lo necesita: la cima del diagrama vertical puede ser un número concreto. Como en la espina el jugador ya viene del nodo 10, el minijuego acepta también una caja arriba y el diagrama se lee `x ↓ +5 ↓ x+5`.

## 3. Dificultad cognitiva real

Lo difícil no es saber que restar es lo contrario de sumar. Son cinco capacidades:

1. **La inversa es una propiedad de la operación, no de los números.** Frente a una cerradura de multiplicar por tres, elegir restar tres es tratar el `3` como si el `3` fuera la acción. Es `wrong_inverse_choice`.
2. **La llave son dos cosas: operación y número.** La operación contraria con el número equivocado abre, y devuelve algo que no es lo que había. Ese fracaso es distinto del anterior y hay que sentirlo distinto.
3. **Deshacer devuelve, no resuelve.** No hay nada que averiguar. La prueba de que la llave sirvió es que el objeto quedó como estaba, no que apareció un resultado. Es la idea de identidad, jugada antes de tener nombre.
4. **El orden se invierte.** Una cadena de dos acciones se deshace desde la última hacia la primera. Viene de los cofres anidados del nodo 9 y es lo que hará posible el nodo 14.
5. **No toda acción tiene llave.** Multiplicar por cero, o pintar todo de negro, borran información. Que la inversa exista es una condición que se verifica, no un derecho.

## 4. Problema intuitivo

Un taller con una mesa larga, cofres de distintos tamaños y un llavero colgado de un clavo. Cada cofre tiene grabada en la tapa una acción, y en el interior de la tapa hay un hueco con la silueta de lo que entró.

En `real` el jugador solo mira: el tallerista apoya una gema en la mesa, la mete en un cofre cuya cerradura muestra cinco puntitos que se agregan, cierra, y después toma la llave que muestra cinco puntitos que se van, abre, y la gema sale igual que como entró. En `intuition` la escena se detiene con el cofre cerrado y tres llaves sobre la mesa. Tres desenlaces dibujados: la llave de quitar cinco gira y sale la gema original, que encaja en la silueta; la llave de quitar tres gira y sale una gema más grande, que no encaja en la silueta; la llave de repartir en cinco no gira y queda trabada. El jugador elige y después ve.

Los dos últimos desenlaces son las dos formas de equivocarse, y el nodo las mantiene separadas de principio a fin.

## 5. Analogía del mundo real

`chest_single_lock`, la del YAML, con la mecánica `chest_key` ([G0](../../G-analogias/G0-reglas.md)). Mapa: cofre → expresión; forma de la cerradura → operación; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas.

Invariante que conserva: la llave devuelve exactamente lo que había. La silueta hueca en la tapa es la forma visible de ese invariante, porque permite comprobar el regreso sin comparar números: o el objeto encaja o no encaja.

Se rompe en `two_branches_of_sqrt`: una cerradura que se abre con dos llaves distintas, o que devuelve dos objetos. Está lejos de este nodo y llega en `alg.fn.quadratic_and_sqrt`, y por eso el cofre puede usarse acá con toda la confianza.

Por qué esta y no otra. La alternativa habitual es el camino de ida y vuelta sobre la recta, que ya se usó en `arith.sub.undo_add` y que funciona bien para sumar y restar y muy mal para multiplicar: volver de un estirado no es caminar hacia atrás. El cofre no privilegia ninguna operación, porque la cerradura es un dibujo y no un movimiento, y por eso puede recibir después acciones que no son aritméticas.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `chest_key`, que aporta a la vez la herramienta y el invariante ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Un cofre cerrado con la acción grabada en la cerradura, la silueta hueca visible en el borde de la tapa y un llavero con varias llaves.
2. Demostración: una mano fantasma toma la llave con la forma contraria, la lleva al candado, la gira, la tapa se levanta y el objeto sale y encaja en la silueta, que se ilumina. Repite la secuencia una vez y desaparece.
3. El jugador arrastra una llave. Llave con la operación correcta y el número correcto: gira entera, el cofre abre, el objeto encaja.
4. Llave con la operación equivocada: llega al candado, gira un cuarto de vuelta y se traba. Nada cambia y el llavero sigue disponible.
5. Llave con la operación correcta y el número equivocado: gira entera y el cofre abre, pero lo que sale no encaja en la silueta y queda flotando al lado. La tapa se queda abierta mostrando el desajuste, y el jugador puede volver a cerrar y probar otra vez desde ahí.
6. Armar la llave: en vez de elegir del llavero, el jugador arma la llave con dos ranuras, una para la operación y otra para el número. Las ranuras aceptan cualquier ficha y el candado responde.
7. Fila de cofres: cinco cofres con cerraduras distintas y cinco llaves. Cada llave abre uno solo, y el jugador las reparte.
8. Cadena: un cofre adentro de otro, con los dos grabados. Para volver al objeto original hay que abrir primero el de afuera, que es el orden contrario al que se cerraron. El árbol del nodo 9 aparece al costado y late cuando el orden coincide.
9. Cofres sin llave: uno de los cofres se cerró con "multiplicar por cero" o con "pintar de negro". El llavero se abre y ninguna llave late. El jugador lo marca colgándole un candado tachado, y esa es la respuesta correcta.

## 7. Representación visual

Capa `visual`, primitiva `invert` de [H](../../H-progresion-abstraccion.md).

El cofre se convierte en el diagrama vertical. Arriba, el objeto de partida. Una flecha hacia abajo con la cerradura dibujada sobre ella. Abajo, el objeto transformado. La llave deja de ser un objeto separado y pasa a ser la misma flecha reproducida hacia atrás, subiendo por el costado, con la forma contraria.

Lo que se muestra es el regreso: las dos flechas juntas forman un circuito cerrado, y el objeto de arriba al final del recorrido es el mismo objeto de arriba del principio, con el mismo id. Lo que se escala no es nada; lo que se desplaza es el objeto a lo largo de la flecha; lo que se conserva es la identidad entre el punto de partida y el punto de llegada.

La flecha equivocada se dibuja igual pero no llega: se detiene a media altura y el objeto queda en un tercer lugar, ni arriba ni abajo. Esa altura intermedia es toda la explicación.

Todavía no hay igualdades, ni platos, ni nada que despejar. Hay un objeto, una acción y su vuelta.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Cofre → contorno.** Al pasar a `visual`, la madera se afina hasta ser un contorno y el cofre se estira en vertical: la tapa queda arriba, el fondo abajo y el cuerpo se convierte en la flecha. Es el paso `arrows` de la mecánica.
2. **Cerradura → ficha de operación.** El dibujo de la cerradura, cinco puntitos que se agregan, se contrae en la ficha `+5` apoyada sobre la flecha. Este es el nacimiento notacional del nodo: la operación queda escrita sola, separada de los números sobre los que actúa.
3. **Llave → flecha de vuelta con ficha.** En el mismo gesto, la llave pierde la forma y gana la ficha `−5` sobre la flecha que sube. La forma de la cerradura queda un rato como sombra detrás de la ficha, para que el jugador pueda seguir eligiendo por forma mientras se acostumbra.
4. **Objeto → ficha numérica, o caja.** Al abrir por segunda vez en `visual`, el objeto de arriba se contrae en un número, o en la caja `x` si el jugador ya trae el nodo 10, y el de abajo en el resultado. El diagrama queda como tres renglones: `7`, la flecha con `+5`, `12`.
5. **Cadena → dos flechas y dos vueltas.** Con dos cofres, las dos flechas se apilan hacia abajo y las dos vueltas suben en orden contrario. El jugador arrastra las fichas de vuelta a las flechas de subida, y el orden importa: si las pone al revés, el objeto de arriba no coincide con el de partida y el circuito queda abierto.

## 9. Notación matemática

El nodo no introduce ningún símbolo nuevo del castellano matemático. `f⁻¹`, que es el nombre propio de esto, llega mucho después, en `alg.fn.inverse_function`, cuando la llave ya sea una función. Por la convención fijada con el nodo de calibración, la aportación de este nodo es una convención de escritura, y hay que decir qué problema la hace necesaria.

Lo que nace acá es escribir la operación sola, como ficha, y escribirla sobre una flecha entre dos estados. El problema que lo exige es el llavero: en cuanto hay cinco cofres en fila, hablar de "el de sumar cinco" señalando con el dedo deja de funcionar, y las llaves tienen que poder ordenarse, compararse y guardarse. Una ficha `+5` es una llave que se puede tener en la mano sin tener el cofre.

De ahí salen las dos entradas de cheatsheet del nodo: la que dice que toda operación tiene su llave y la tabla de parejas, que es el llavero dibujado como dos columnas.

La segunda convención es la flecha misma. La flecha hacia abajo dice "acá se aplicó esta acción" y la flecha hacia arriba, con la ficha contraria, dice "acá se deshizo". Escribir el par de flechas es lo que permite, en el nodo 14, recordar en qué orden se hicieron las cosas.

No aparece `=` en ningún renglón de este nodo. La igualdad ya nació en el 11 y acá no hace falta: el diagrama no afirma que dos cosas valen lo mismo, muestra un recorrido.

## 10. Definición formal

Capa `formal`: texto corto con voz y el diagrama vertical al lado. Tres frases, de a una: "Deshacer una operación es aplicar otra que devuelve exactamente lo que había." "Cada operación tiene su llave: sumar y restar el mismo número; multiplicar y dividir por el mismo número, distinto de cero." "Una acción y su llave, una después de la otra, dejan todo como estaba."

Condiciones y casos especiales, verificados sobre el objeto: la llave de la llave es la operación original, así que el par funciona en los dos sentidos; dividir por cero no es una llave porque multiplicar por cero no tiene ninguna; una cadena de acciones se deshace desde la última hacia la primera; restar un número y sumar su opuesto son la misma llave, y el llavero las muestra como una sola con dos caras.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "inversa" como nombre de la llave, y el enunciado de que la llave de la llave devuelve la operación, que el jugador había usado sin mirarlo.

## 11. Propiedades

- **Hacer y deshacer deja lo original.** `(n + 5) − 5` es `n`; `(n × 3) ÷ 3` es `n`. Ligada al circuito cerrado del diagrama y a la silueta de la tapa que vuelve a encajar.
- **La llave de la llave es la operación.** La cerradura `−5` se abre con `+5`. Ligada al nivel donde el cofre se cierra con una llave y hay que abrirlo con la que antes era cerradura.
- **En una cadena, el orden se invierte.** Para deshacer "multiplicar por tres y después sumar dos" hay que restar dos y después dividir por tres. Ligada a los cofres anidados y al árbol del nodo 9 latiendo al costado.
- **No toda acción tiene llave.** Multiplicar por cero deja todo en cero y no hay forma de saber qué había. Ligada al llavero donde ninguna llave late y al candado tachado que el jugador cuelga.
- **La llave necesita el mismo número.** La operación contraria con otro número abre el cofre y devuelve otra cosa. Ligada al objeto que sale y queda flotando fuera de la silueta.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre cerrado con una operación grabada y un llavero. El jugador toca la llave que tiene la operación contraria. Los distractores salen de las reglas `detect` de la misconception: la misma operación repetida, la inversa de la otra pareja y un número cercano.
- `explain`: dos animaciones sobre el mismo cofre. En una, el cofre de multiplicar se abre con la llave de dividir y el objeto encaja en la silueta. En la otra se prueba la llave de restar y el cofre no se mueve. El jugador toca la que usa la llave equivocada. No hay texto: se elige entre animaciones.
- `manipulate`: el jugador arrastra llaves sobre una fila de cofres con operaciones distintas y cada cofre se abre solo con la suya. El llavero se vacía a medida que acierta.
- `apply`: un cofre con una operación y un número. El jugador arma la llave completa eligiendo la operación y el número que devuelven lo original, con dos ranuras y el teclado de fichas.
- `generalize`: los cofres pierden los dibujos y quedan fichas de operación sueltas. El jugador empareja cada operación con su inversa, incluidas las de números negativos, donde restar menos tres y sumar tres tienen que caer en la misma pareja.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, el jugador toca la transformación que devuelve la grilla a su forma, que es una llave con otra ropa.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). Declara la mecánica `chest_key`, que es la del nodo, así que la explicación corre sobre el cofre.

- **`wrong_inverse_choice`** (`key_mismatch`). El jugador enfrenta una cerradura de multiplicar por tres y elige la llave de restar tres. El juego acerca la llave, la hace trabarse con un cuarto de vuelta, ilumina la forma de la cerradura para que se vea que tiene tres brazos y no tres dientes, y revela la silueta hueca de la llave que sí entra, sin nombrarla y sin completarla. Voz: "Esa llave no abre este cofre. ¿Qué deshace multiplicar por 3?". El llavero queda abierto y el jugador prueba desde el mismo estado. La variante con la operación correcta y el número equivocado no dispara este patrón: el cofre abre, el objeto no encaja en la silueta y el juego solo deja ver el desajuste, porque es un movimiento válido y no una confusión de estructura.

Las reglas `detect` catalogadas para esta misconception están escritas con forma de ecuación, que es como el error se manifiesta en el nodo 13. Acá el mismo error se produce sin ecuación, sobre la cerradura, y las instancias se generan desde la operación y el valor del cofre.

## 13. Generalización

La analogía se retira en `symbolic`, cuando el jugador elige la ficha de operación sin mirar la forma de la cerradura. El cofre se queda como fantasma a demanda hasta `formal`, porque a diferencia de la caja del nodo 10 el cofre representa estructura y no un nombre, y lo que representa estructura puede quedarse.

Variantes sin ayuda visual, en orden: números más grandes, donde ya no se puede contar los puntitos de la cerradura; cerraduras con resultado negativo; cadenas de dos acciones, con el orden de vuelta invertido; parejas donde la llave se escribe de dos formas equivalentes, restar tres o sumar menos tres.

Al final, cerraduras que no son aritméticas: "rotar noventa grados", "agregar 🍎", "cambiar rojo por azul", "dar vuelta el dibujo". El jugador nombra la llave sin usar números: rotar noventa grados al revés, quitar 🍎, cambiar azul por rojo, dar vuelta otra vez. Y entre esas cerraduras hay siempre una sin llave, "pintar todo de negro", que hay que marcar como tal. Es la misma prueba que el nodo 13 vuelve a tomar sobre la balanza, y acá se toma sobre el cofre solo.

El nodo está en `abstract` cuando el jugador arma la llave de una cerradura que nunca vio, deshace una cadena en el orden correcto y distingue una acción sin inversa, todo sin pedir el cofre dibujado. La forma completa y lejana de esa capa es `adv.alg.group_as_reversible_actions`, donde el llavero se vuelve la pregunta de qué acciones tienen inversa en un conjunto.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas y con mecánicas que no se usaron para aprender:

- `alg.fn.inverse_function` (`machine_pipe`): la llave se vuelve una máquina que come la salida y devuelve la entrada, y recién ahí recibe el nombre `f⁻¹`.
- `calc1.ftc.integral_undoes_derivative` (`fill_accumulate`): la integral es la llave de la derivada. El objeto que vuelve a encajar en la silueta es la función original, salvo una constante, y esa salvedad es la primera vez que una llave devuelve casi lo mismo.
- `linalg.map.inverse_and_systems` (`grid_stretch`): la llave es una matriz, y hay grillas aplastadas que no tienen ninguna, que es el `×0` con otra cara.
- `geom.trans.undo_transformation` (`grid_stretch`): deshacer una rotación o una simetría. La llave no tiene números y el jugador la reconoce igual.

Concepto siguiente: `alg.eq.one_step` ([13](13-alg.eq.one_step.md)). Frase puente, narrada sobre el último cofre abierto: "Ya sabés qué llave abre cada cerradura. Pero esta caja no está sola en la mesa: está en un plato de una balanza, y el broche que la sujeta tiene forma de cerradura. Si abrís el broche de un solo lado, ¿qué le pasa a la barra?". El cofre se apoya en un plato y la barra aparece detrás: el nodo 13 empieza ahí, con las dos mecánicas juntas por primera vez.

---

**Visualización:** dos escenas del YAML, nativas y sin texto rasterizado, resueltas en [I](../../I-manim/I0-mapping.md). `chest_key_matches_lock` corre sobre el cofre del jugador, con la operación, el valor y las llaves candidatas como parámetros: la cerradura muestra su forma, el llavero rota, la llave correcta entra, gira, y la flecha vertical se reproduce hacia atrás hasta cerrar el circuito; gramática `invert`. Abre cada nivel y es la imagen de cheatsheet de `cs.prealg.every_operation_has_a_key`. `chest_wrong_key_stays_shut` toma además la operación equivocada: la llave llega, gira un cuarto de vuelta, se traba y la cerradura se ilumina; gramática `invert` mostrada por su ruptura. Es la que usa el patrón `key_mismatch`, y el nodo 13 la reúsa como distractor de `explain`. Las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_inverse_op` ([M](../../M-calculadora/M0-progresion.md)), una tecla con una flecha que da la vuelta, dibujada con la misma línea que la flecha de subida del diagrama. Es una operación estructural y no vive en el modo de exploración libre: solo aparece cuando ya hay una expresión armada, y lo que hace es deshacer la última operación aplicada, mostrando la flecha de vuelta antes del resultado. No es un botón de borrar: si la última operación no tiene inversa, la flecha se traba con el mismo cuarto de vuelta del cofre.

**Edad universal:** el nodo es `literacy: none` y su capa concreta se juega entera sin leer ([Q](../../Q-edad-universal.md)). Las cerraduras y las llaves se distinguen por forma, por color y por la cantidad de puntitos; la silueta de la tapa dice si acertó sin necesidad de comparar números; `explain` se responde eligiendo entre dos animaciones y los prompts son de voz, escritos en formas que sirven igual para tú y para vos. Desde la capa simbólica las llaves llevan una ficha con un operador y un número, que el jugador puede tratar como ícono, y esa ficha es la que hace que el nodo 13, con el llavero completo en la mano, declare `icons`. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel de armar la llave y suele detenerse recién en los cofres sin llave.
