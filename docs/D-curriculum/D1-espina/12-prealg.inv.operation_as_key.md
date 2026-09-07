# 12 — Toda operación tiene llave (`prealg.inv.operation_as_key`)

> Locale `es`: "Toda operación tiene llave". Minijuego: [El llavero](../../F-minijuegos/prealg.inv.operation_as_key.md).

**Nodo:** `prealg.inv.operation_as_key` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (única) · **Literacy:** `none` · **Analogía:** `chest_single_lock`

## 1. Concepto

Toda operación tiene otra que la deshace y devuelve exactamente lo que había. Al terminar, el jugador arma la llave completa de una cerradura cualquiera eligiendo la operación contraria y el mismo número, deshace una cadena en el orden inverso y reconoce una acción sin llave. Todo en aritmética pura: no hay igualdad ni incógnita, hay una acción y su vuelta.

## 2. Prerequisitos

- `arith.sub.undo_add`: restar deshace sumar. Se usa la pareja `+` y `−` como experiencia, no como definición: el jugador ya vio un objeto avanzar y volver al mismo punto.
- `arith.div.undo_mul`: dividir deshace multiplicar. Se usa el corte en filas iguales, que devuelve el tamaño original y hace creíble la llave de multiplicar.
- `arith.int.negatives`: aportan que la llave existe aunque el resultado quede bajo cero, y que restar siete y sumar menos siete son la misma llave con dos caras.

Ninguno es un nodo de álgebra, y eso es deliberado. La escuela presenta la inversa dentro del procedimiento de despejar, mezclada con la igualdad, la incógnita y la costumbre de pasar términos. [C0](../../C-knowledge-graph/C0-esquema.md) la aísla acá para que el jugador aprenda por qué funciona antes de tener dónde aplicarla. Tampoco declara `prealg.var.unknown_as_box`: la cima del diagrama puede ser un número, aunque en la espina el jugador viene del nodo 10 y también acepta una caja, con el diagrama `x ↓ +5 ↓ x+5`.

## 3. Dificultad cognitiva real

Lo difícil no es saber que restar es lo contrario de sumar. Son cinco capacidades:

1. **La inversa es propiedad de la operación, no de los números.** Frente a una cerradura de multiplicar por tres, elegir restar tres es tratar el `3` como si fuera la acción. Es `wrong_inverse_choice`.
2. **La llave son dos cosas: operación y número.** La operación contraria con el número equivocado abre y devuelve otra cosa, y ese fracaso hay que sentirlo distinto del anterior.
3. **Deshacer devuelve, no resuelve.** La prueba de que la llave sirvió es que el objeto quedó como estaba, no que apareció un resultado: es la identidad, jugada antes de tener nombre.
4. **El orden se invierte.** Una cadena se deshace desde la última acción hacia la primera. Viene del nodo 9 y hará posible el nodo 14.
5. **No toda acción tiene llave.** Multiplicar por cero borra información: que la inversa exista se verifica, no se supone.

## 4. Problema intuitivo

Un taller con cofres y un llavero colgado de un clavo. Cada cofre tiene grabada en la cerradura una acción, y en el interior de la tapa hay un hueco con la silueta de lo que entró.

En `real` el jugador solo mira: el tallerista mete una gema en un cofre cuya cerradura muestra cinco puntitos que se agregan, cierra, toma la llave con cinco puntitos que se van y la gema sale igual que entró. En `intuition` la escena se detiene con el cofre cerrado y tres llaves. Tres desenlaces dibujados: la de quitar cinco gira y la gema encaja en la silueta; la de quitar tres gira y sale una gema más grande, que no encaja; la de repartir en cinco no gira. El jugador elige y después ve. Los dos últimos son las dos formas de equivocarse, y el nodo las mantiene separadas.

## 5. Analogía del mundo real

`chest_single_lock`, la del YAML ([G0](../../G-analogias/G0-reglas.md)). Mapa: cofre → expresión; forma de la cerradura → operación; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas.

Invariante que conserva: la llave devuelve exactamente lo que había. La silueta hueca en la tapa es su forma visible, porque permite comprobar el regreso sin comparar números.

Se rompe en `two_branches_of_sqrt`, una cerradura que se abre con dos llaves. Está lejos, en `alg.fn.quadratic_and_sqrt`.

Por qué esta y no otra: el camino de ida y vuelta sobre la recta sirve para sumar y restar y falla para multiplicar, porque volver de un estirado no es caminar hacia atrás.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `chest_key`, que aporta a la vez la herramienta y el invariante ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Un cofre cerrado con la acción grabada en la cerradura, la silueta hueca en el borde de la tapa y un llavero.
2. Demostración: una mano fantasma toma la llave con la forma contraria, la gira, la tapa se levanta y el objeto sale y encaja en la silueta, que se ilumina.
3. Llave con la operación y el número correctos: gira entera, el cofre abre, el objeto encaja.
4. Llave con la operación equivocada: gira un cuarto de vuelta y se traba.
5. Llave con la operación correcta y el número equivocado: el cofre abre, pero lo que sale no encaja en la silueta.
6. Armar la llave con dos ranuras, una para la operación y otra para el número, y repartir llaves sobre una fila de cofres con cerraduras distintas.
8. Cadena: un cofre adentro de otro. Para volver al objeto hay que abrir primero el de afuera, al revés del orden en que se cerraron, y el árbol del nodo 9 late cuando el orden coincide.
9. Cofres sin llave: "multiplicar por cero", "pintar de negro". Ninguna llave late y el jugador los marca con un candado tachado.

## 7. Representación visual

Capa `visual`, primitiva `invert` de [H](../../H-progresion-abstraccion.md). El cofre se convierte en el diagrama vertical: arriba el objeto de partida, una flecha hacia abajo con la cerradura dibujada sobre ella, abajo el objeto transformado. La llave es la misma flecha reproducida hacia atrás.

Lo que se muestra es el regreso: las dos flechas forman un circuito cerrado y el objeto de arriba al final es el mismo del principio, con el mismo id. Todavía no hay igualdades ni platos ni nada que despejar.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Cofre → contorno.** Al pasar a `visual` la madera se afina y el cofre se estira en vertical: la tapa queda arriba, el fondo abajo y el cuerpo se convierte en la flecha. Es el paso `arrows` de la mecánica.
2. **Cerradura → ficha de operación.** El dibujo de la cerradura, cinco puntitos que se agregan, se contrae en la ficha `+5` sobre la flecha. Es el nacimiento notacional del nodo: la operación queda escrita sola.
3. **Llave → flecha de vuelta con ficha.** En el mismo gesto la llave pierde la forma y gana la ficha `−5` sobre la flecha que sube; la forma de la cerradura queda un rato como sombra.
4. **Objeto → ficha, o caja.** Al abrir por segunda vez en `visual`, el objeto de arriba se contrae en un número, o en la caja `x` si el jugador trae el nodo 10, y el de abajo en el resultado: `7`, la flecha con `+5`, `12`.
5. **Cadena → dos flechas y dos vueltas.** Con dos cofres, las flechas se apilan hacia abajo y las vueltas suben en orden contrario. Si van al revés, el objeto de arriba no coincide con el de partida.

## 9. Notación matemática

El nodo no introduce ningún símbolo nuevo: `f⁻¹` llega en `alg.fn.inverse_function`, cuando la llave ya sea una función. Por la convención fijada con el nodo de calibración, la aportación es una convención de escritura, y hay que decir qué problema la hace necesaria.

Nace escribir la operación sola, como ficha, sobre una flecha entre dos estados. El problema que lo exige es el llavero: con cinco cofres en fila, señalar "el de sumar cinco" con el dedo deja de funcionar, y las llaves tienen que poder ordenarse y guardarse. De ahí salen las dos entradas de cheatsheet.

La flecha es la segunda convención: hacia abajo dice "acá se aplicó esta acción" y hacia arriba "acá se deshizo". Escribir el par permitirá, en el nodo 14, recordar en qué orden se hicieron las cosas. No aparece `=`: el diagrama no afirma, muestra un recorrido.

## 10. Definición formal

Capa `formal`: texto corto con voz y el diagrama vertical al lado. Tres frases, de a una: "Deshacer una operación es aplicar otra que devuelve exactamente lo que había." "Cada operación tiene su llave: sumar y restar el mismo número; multiplicar y dividir por el mismo número, distinto de cero." "Una acción y su llave dejan todo como estaba."

Condiciones y casos especiales, verificados sobre el objeto: la llave de la llave es la operación original; multiplicar por cero no tiene llave; una cadena se deshace desde la última acción hacia la primera; restar un número y sumar su opuesto son la misma llave.

Ya jugado: las tres frases. Nuevo: la palabra "inversa" y que la llave de la llave devuelve la operación.

## 11. Propiedades

- **Hacer y deshacer deja lo original.** `(n + 5) − 5` es `n`; `(n × 3) ÷ 3` es `n`. Ligada al circuito cerrado y a la silueta que vuelve a encajar.
- **La llave de la llave es la operación.** La cerradura `−5` se abre con `+5`. Ligada al nivel donde el cofre se cierra con una llave y hay que abrirlo con la que antes era cerradura.
- **En una cadena, el orden se invierte.** Para deshacer "multiplicar por tres y después sumar dos" hay que restar dos y después dividir por tres. Ligada a los cofres anidados.
- **No toda acción tiene llave.** Ligada al llavero donde ninguna late y al candado tachado.
- **La llave necesita el mismo número.** Ligada al objeto que queda flotando fuera de la silueta.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre con una operación grabada y un llavero. El jugador toca la llave con la operación contraria. Los distractores salen de las reglas `detect` de la misconception: la misma operación repetida, la inversa de la otra pareja y un número cercano.
- `explain`: dos animaciones sobre el mismo cofre. En una, el de multiplicar se abre con la llave de dividir y el objeto encaja; en la otra se prueba la de restar y el cofre no se mueve. El jugador toca la que usa la llave equivocada: se elige entre animaciones, nunca entre frases.
- `manipulate`: arrastrar llaves sobre una fila de cofres, donde cada uno se abre solo con la suya.
- `apply`: un cofre con una operación y un número. El jugador arma la llave completa eligiendo la operación y el número que devuelven lo original.
- `generalize`: los cofres pierden los dibujos y quedan fichas de operación. El jugador empareja cada una con su inversa, incluidas las de negativos, donde restar menos tres y sumar tres caen en la misma pareja.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar la transformación que devuelve la grilla a su forma.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). Declara la mecánica `chest_key`, que es la del nodo, así que la explicación corre sobre el cofre.

- **`wrong_inverse_choice`** (`key_mismatch`). Frente a una cerradura de multiplicar por tres el jugador elige la llave de restar tres. El juego la hace trabarse con un cuarto de vuelta, ilumina la cerradura para que se vea que tiene tres brazos y no tres dientes, y revela la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué deshace multiplicar por 3?". El llavero queda abierto y el jugador prueba desde el mismo estado. La variante con el número equivocado no dispara el patrón: es un movimiento válido y el juego solo deja ver el desajuste.

## 13. Generalización

La analogía se retira en `symbolic`, cuando el jugador elige la ficha de operación sin mirar la cerradura. El cofre queda como fantasma a demanda hasta `formal`, porque a diferencia de la caja del nodo 10 representa estructura y no un nombre, y lo que representa estructura puede quedarse.

Variantes sin ayuda visual, en orden: números grandes, donde ya no se pueden contar los puntitos; cerraduras con resultado negativo; cadenas de dos acciones; llaves que se escriben de dos formas equivalentes. Al final, cerraduras que no son aritméticas: "rotar noventa grados", "agregar 🍎", "cambiar rojo por azul". El jugador nombra la llave sin números, y siempre hay una cerradura sin llave, "pintar todo de negro", que hay que marcar como tal.

El nodo está en `abstract` cuando el jugador arma la llave de una cerradura que nunca vio, deshace una cadena en el orden correcto y distingue una acción sin inversa, sin pedir el cofre. La forma lejana de esa capa es `adv.alg.group_as_reversible_actions`.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas y con mecánicas que no se usaron para aprender:

- `alg.fn.inverse_function` (`machine_pipe`): la llave se vuelve una máquina que come la salida y devuelve la entrada, y ahí recibe el nombre `f⁻¹`.
- `calc1.ftc.integral_undoes_derivative` (`fill_accumulate`): la integral es la llave de la derivada, y lo que encaja en la silueta es la función original salvo una constante. Es la primera vez que una llave devuelve casi lo mismo.
- `linalg.map.inverse_and_systems` (`grid_stretch`): la llave es una matriz, y hay grillas aplastadas que no tienen ninguna: el `×0` con otra cara.
- `geom.trans.undo_transformation` (`grid_stretch`): deshacer una rotación o una simetría, con una llave sin números.

Concepto siguiente: `alg.eq.one_step` ([13](13-alg.eq.one_step.md)). Frase puente, sobre el último cofre abierto: "Ya sabés qué llave abre cada cerradura. Pero esta caja está en un plato de una balanza, y el broche que la sujeta tiene forma de cerradura. Si abrís el broche de un solo lado, ¿qué le pasa a la barra?". El cofre se apoya en un plato y la barra aparece detrás: el nodo 13 empieza ahí.

---

**Visualización:** dos escenas del YAML, nativas y sin texto rasterizado ([I](../../I-manim/I0-mapping.md)). `chest_key_matches_lock` corre sobre el cofre del jugador, con la operación, el valor y las llaves candidatas como parámetros: la cerradura muestra su forma, el llavero rota, la llave correcta entra y la flecha vertical se reproduce hacia atrás hasta cerrar el circuito; gramática `invert`. Es la imagen de cheatsheet de `cs.prealg.every_operation_has_a_key`, junto con la tabla de parejas de `cs.prealg.inverse_pairs_table`. `chest_wrong_key_stays_shut` toma la operación equivocada: la llave gira un cuarto de vuelta, se traba y la cerradura se ilumina; la usa el patrón `key_mismatch` y el nodo 13 la reúsa como distractor Se suma `chest_scene_key_intro`, pre-renderizada, que [I](../../I-manim/I0-mapping.md) asigna a este nodo y a `arith.sub.undo_add` aunque el YAML del grafo no la liste: abre cada nivel mostrando una llave que entra y vuelve. Las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_inverse_op` ([M](../../M-calculadora/M0-progresion.md)), una tecla con una flecha que da la vuelta, con la misma línea que la flecha de subida del diagrama. Es estructural y no vive en el modo de exploración libre: aparece cuando ya hay una expresión armada y deshace la última operación mostrando la flecha de vuelta. No es un botón de borrar: si la última operación no tiene inversa, la flecha se traba como la llave en el cofre.

**Edad universal:** el nodo es `literacy: none` y su capa concreta se juega entera sin leer ([Q](../../Q-edad-universal.md)). Cerraduras y llaves se distinguen por forma, color y cantidad de puntitos; la silueta de la tapa dice si acertó sin comparar números; `explain` se responde entre dos animaciones y los prompts son de voz, en formas que sirven igual para tú y para vos. Desde la capa simbólica las llaves llevan una ficha con operador y número, tratada como ícono, y es la que hace que el nodo 13 declare `icons`. Un adulto llega por diagnóstico saltando `real` e `intuition` y se detiene recién en los cofres sin llave.
