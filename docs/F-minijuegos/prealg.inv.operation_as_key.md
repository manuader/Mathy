# El llavero (`prealg.inv.operation_as_key`)

Minijuego del nodo 12 de la espina, "Toda operación tiene llave". Mecánica única `chest_key`; analogía `chest_single_lock`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/12-prealg.inv.operation_as_key.md): un concepto, cinco dificultades reales, una analogía, un gesto (girar la llave que devuelve el objeto), cinco pasos de desvanecimiento, el diagrama vertical como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega. No hay ninguna igualdad en pantalla: eso llega en el nodo 13.

## Analogía

Un taller con cofres sobre una mesa y un llavero colgado de un clavo. Cada cofre tiene grabada en la cerradura una acción, y en la cara interna de la tapa hay un hueco con la silueta de lo que entró.

Mapa objeto → concepto: cofre → expresión; forma de la cerradura → operación; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas. La silueta de la tapa no está en el mapa del YAML y es el añadido del minijuego: hace visible el invariante sin comparar números.

Punto de ruptura: `two_branches_of_sqrt`, una cerradura que se abre con dos llaves o devuelve dos objetos. Está lejos, en `alg.fn.quadratic_and_sqrt`, y por eso el cofre se usa acá sin reservas ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el cofre en el centro, el llavero abajo, la silueta en el borde de la tapa y, desde la capa `visual`, el diagrama vertical ocupando el lugar del cofre. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar la llave correcta al candado.** Gira entera, la tapa se levanta, el objeto sale y encaja en la silueta, que se ilumina.
- **Llave con la operación equivocada.** Llega al candado, gira un cuarto de vuelta y se traba. Nada cambia y el llavero sigue disponible.
- **Llave con la operación correcta y el número equivocado.** Gira entera y el cofre abre, pero lo que sale no encaja en la silueta y queda flotando al lado. El jugador vuelve a cerrar y prueba desde ahí.
- **Armar la llave.** Dos ranuras, una para la operación y otra para el número. Aceptan cualquier ficha y el candado responde.
- **Repartir llaves.** Una fila de cofres con cerraduras distintas y un llavero: cada llave abre uno solo.
- **Abrir una cadena.** Un cofre adentro de otro. Solo funciona el de afuera primero, al revés del orden en que se cerraron; el árbol del nodo 9 late al costado cuando el orden coincide.
- **Marcar un cofre sin llave.** Con "multiplicar por cero" o "pintar de negro" ninguna llave late. El jugador le cuelga un candado tachado, y esa es la respuesta correcta.

En `symbolic` la superficie cambia de forma, no de reglas: la cerradura es una ficha `+5` sobre una flecha hacia abajo, la llave es una ficha `−5` sobre la flecha que sube, y soltar la ficha correcta cierra el circuito. Las dos formas de fallar se conservan: ficha con la operación equivocada, la flecha no sube; ficha con el número equivocado, la flecha sube pero no llega al punto de partida.

## Invariante matemático

`inverse_restores_original`: la llave devuelve exactamente lo que había. La llave no resuelve nada, porque no hay nada que averiguar; la prueba de que sirvió es que el objeto quedó como estaba.

Se ve romperse de dos maneras distintas, y el minijuego las mantiene separadas de principio a fin. Con la operación equivocada la llave ni siquiera entra: no es una inversa. Con la operación correcta y el número equivocado la llave entra y devuelve otra cosa: es la inversa de otra acción. Se ve confirmarse cuando el objeto encaja en la silueta y el circuito de las dos flechas se cierra.

Un movimiento válido pero inútil, como aplicar la llave de sumar cinco a un cofre recién abierto, no rompe el invariante: el objeto se aleja del punto de partida y el jugador recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `invert` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el taller, el tallerista guardando una gema y la llave que la devuelve. Solo se mira y se predice.
- `concrete`: cofres de madera con cerraduras de forma, llaves con la forma contraria, la silueta hueca en la tapa. Nada escrito; la acción se lee en la cantidad de puntitos.
- `visual`: el diagrama vertical. Arriba el objeto de partida, una flecha hacia abajo con la cerradura sobre ella, abajo el objeto transformado, y la llave como la misma flecha reproducida hacia atrás. Las dos flechas forman un circuito cerrado.
- `symbolic`: fichas de operación sobre las flechas y fichas numéricas en los dos extremos; una caja `x` arriba si el jugador trae el nodo 10.
- `formal`: la definición corta con voz y el diagrama al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cofre → contorno: al pasar a `visual` la madera se afina y el cofre se estira en vertical; la tapa queda arriba, el fondo abajo y el cuerpo se convierte en la flecha.
2. Cerradura → ficha de operación: el dibujo de los cinco puntitos que se agregan se contrae en la ficha `+5` sobre la flecha. Es el nacimiento notacional del nodo, porque la operación queda escrita sola.
3. Llave → flecha de vuelta con ficha: en el mismo gesto la llave pierde la forma y gana la ficha `−5` sobre la flecha que sube; la forma de la cerradura queda un rato como sombra.
4. Objeto → ficha: al abrir por segunda vez en `visual`, los dos extremos se contraen en números, o en la caja `x` arriba si el jugador trae el nodo 10.
5. Cadena → dos flechas y dos vueltas: con dos cofres, las flechas se apilan hacia abajo y las vueltas suben en orden contrario; si van al revés, el objeto de arriba no coincide con el de partida.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el diagrama: deshacer una operación es aplicar otra que devuelve exactamente lo que había; cada operación tiene su llave, sumar y restar el mismo número, multiplicar y dividir por el mismo número distinto de cero; una acción y su llave dejan todo como estaba. Propiedades: la llave de la llave es la operación original; en una cadena el orden se invierte; la llave necesita el mismo número; no toda acción tiene llave. Casos: multiplicar por cero no tiene llave, y restar un número y sumar su opuesto son la misma llave con dos caras. Sin símbolos nuevos: `f⁻¹` llega en `alg.fn.inverse_function`. Lo nuevo es escribir la operación sola, como ficha sobre una flecha, y leer esa flecha al revés.

## Generalización

La analogía se retira en `symbolic`, cuando el jugador elige la ficha de operación sin mirar la forma de la cerradura. El cofre queda como fantasma a demanda hasta `formal`, porque representa estructura y no un nombre, y lo que representa estructura puede quedarse.

Variantes sin ayuda visual: números grandes, donde ya no se pueden contar los puntitos; cerraduras con resultado negativo; cadenas de dos acciones con el orden de vuelta invertido; llaves que se escriben de dos formas equivalentes. Después, cerraduras que no son aritméticas: "rotar noventa grados", "agregar 🍎", "cambiar rojo por azul". El jugador nombra la llave sin números, y en cada tanda hay una cerradura sin llave, "pintar todo de negro", que hay que marcar como tal. Cuando arma la llave de una cerradura que nunca vio y distingue la que no tiene, sin pedir el cofre dibujado, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): sus niveles 1 y 2 son de este nodo. El 1, cofre amarillo y llave amarilla, es la correspondencia pura entre lo que cierra y lo que abre; el 2, donde los colores son transformaciones y la llave las deshace, es el nodo entero y H lo dice así. El nivel 3, cofres anidados, es de `arith.expr.precedence_tree`, y acá vuelve solo como la cadena de dos acciones. Del 4 en adelante hay expresiones y ecuaciones, y son de los nodos 13 y siguientes.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **La llave que entra.** `concrete`, `manipulate`. Cerraduras de sumar y restar, llaves por forma, dos llaves en el llavero. Rango numérico chico.
2. **Cuatro cerraduras.** `concrete`, `recognize` y `manipulate`. Se agregan multiplicar y dividir; el llavero tiene las cuatro. Aparece `wrong_inverse_choice`.
3. **La llave completa.** `concrete`, `apply`. Se arma la llave con dos ranuras, operación y número, y aparece la segunda forma de fallar: abre y no encaja en la silueta.
4. **Flechas.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; el cofre es el diagrama vertical y la llave la flecha de vuelta.
5. **Fichas sobre las flechas.** `symbolic` primera mitad, `manipulate`. La cerradura y la llave llevan etiqueta; el cofre sigue al lado y responde en sincronía.
6. **Cadenas y negativos.** `symbolic` segunda mitad, `apply`. El cofre queda como fantasma. Parámetros: dos acciones encadenadas, rango numérico mayor y resultados negativos.
7. **Cerraduras que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; acciones no aritméticas y una sin llave por tanda.

Qué endurece cada parámetro: el rango numérico obliga a elegir por la forma de la cerradura y no por reconocer la cuenta; la cadena obliga a invertir el orden y no solo las operaciones; los negativos hacen que restar tres y sumar menos tres caigan en la misma pareja; las acciones no aritméticas quitan el último apoyo de la cuenta.

Desafíos de olimpíada: el nodo participa en los desafíos de álgebra de [S](../S-desafios/S0-desafios.md), aún no escritos, donde deshacer una operación aparece como paso intermedio. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: un cofre con la cerradura `×4` y un llavero con `÷4`, `×4`, `−4` y `÷3`. Tocar `÷4`.
- `explain`: dos animaciones sobre el mismo cofre. En una, el de multiplicar se abre con la llave de dividir y el objeto encaja en la silueta; en la otra se prueba la llave de restar y el cofre no se mueve. Tocar la que usa la llave equivocada. Elegirla clasifica: es `wrong_inverse_choice`.
- `manipulate`: cinco cofres en fila con `+3`, `−7`, `×2`, `÷5` y `+9`, y cinco llaves. Repartirlas hasta vaciar el llavero.
- `apply`: un cofre con la cerradura `−6`. Armar la llave eligiendo la operación y el número que devuelven lo original, con las dos ranuras.
- `generalize`: fichas de operación sueltas, sin cofres, incluidas `−(−3)` y `+(−3)`; emparejar cada una con su inversa. Y un cofre con cerradura "rotar noventa grados": nombrar la llave, y otro con "pintar de negro": colgarle el candado tachado.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar la transformación que devuelve la grilla a su forma. También en `alg.fn.inverse_function` (la llave como máquina), `calc1.ftc.integral_undoes_derivative` (la integral deshace la derivada) y `geom.trans.undo_transformation`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `wrong_inverse_choice`, patrón `key_mismatch` sobre el cofre, que es la mecánica del nodo: la llave se traba con un cuarto de vuelta, la cerradura se ilumina para que se vea que tiene tres brazos y no tres dientes, y aparece la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué deshace multiplicar por 3?". El llavero sigue disponible y el jugador prueba desde ese estado. La variante con el número equivocado no dispara el patrón: es un movimiento válido y el juego solo deja ver que el objeto no encaja.

Las reglas `detect` catalogadas están escritas con forma de ecuación, que es como el error aparece en el nodo 13; acá las instancias se generan desde la operación y el valor del cofre. Los distractores de `explain` y las opciones de `recognize` salen de esas mismas reglas y de las de los prerequisitos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_key_matches_lock`, nativa. La cerradura muestra su forma, el llavero rota, la llave correcta entra y la flecha vertical se reproduce hacia atrás hasta cerrar el circuito; gramática `invert`. Parametrizada por la operación, el valor y las llaves candidatas. Es la imagen de cheatsheet de `cs.prealg.every_operation_has_a_key`, junto con la tabla de parejas de `cs.prealg.inverse_pairs_table`.
- `chest_wrong_key_stays_shut`, nativa. Toma además la operación equivocada: la llave gira un cuarto de vuelta, se traba y la cerradura se ilumina. Es la que usa el patrón `key_mismatch`, y el nodo 13 la reúsa como distractor de `explain`.
- `chest_scene_key_intro`, pre-renderizada. Abre cada nivel con una llave que entra y vuelve. [I](../I-manim/I0-mapping.md) la asigna a este nodo y a `arith.sub.undo_add` aunque el YAML del grafo no la liste.

Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_chest_lock`: `op` en {add, sub, mul, div}; `operand_range` (1 a 9 en los niveles 1 a 5, hasta 30 en el 6); `start_value_range`; `allow_negative_result` (desde el nivel 6); `chain_depth` (1 hasta el nivel 5, 2 en el 6); `seed`.
- `gen_key_ring`: `size` (2 a 5 llaves); `distractors` desde `detect` (misma operación, inversa de la otra pareja, número cercano); `labeled` (falso en los niveles 1 a 4); `assembled` (verdadero desde el nivel 3, donde la llave se arma en vez de elegirse). El nodo 13 lo reúsa con sus propios rangos.
- `gen_arbitrary_lock`: acciones no aritméticas con inversa (rotación, agregar un objeto, permutar colores) y una acción sin inversa por instancia. También lo reúsa el nodo 13.

**Literacy soportada:** de `none` a `full_text`. Las capas concreta y visual se juegan sin leer: cerraduras y llaves por forma, color y cantidad de puntitos, la silueta de la tapa como verificación, `explain` entre dos animaciones y prompts de voz, escritos en formas que sirven igual para tú y para vos. Desde la capa simbólica las llaves llevan una ficha con operador y número, que el jugador puede tratar como ícono porque ya la vio nacer del dibujo de la cerradura; es la misma ficha que, con el llavero completo en la mano, hace que el nodo 13 declare `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la llave con la forma contraria, la lleva al candado, la gira, la tapa se levanta y el objeto encaja en la silueta, que se ilumina. La escena vuelve al inicio y el llavero late. Se repite solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
