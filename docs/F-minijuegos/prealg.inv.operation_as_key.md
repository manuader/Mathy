# El llavero (`prealg.inv.operation_as_key`)

Minijuego del nodo 12 de la espina, "Toda operación tiene llave". Mecánica única `chest_key`; analogía `chest_single_lock`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/12-prealg.inv.operation_as_key.md): un concepto, tres dificultades reales (deshacer como operación y no como retroceso, elegir entre candidatas, aceptar que hay cerraduras sin llave), una analogía que aporta el conjunto además de la pareja, un gesto (arrastrar una llave a la cerradura y girarla), cinco pasos de desvanecimiento, el diagrama vertical como visualización dominante, retiro en `symbolic` con el diagrama que se queda. Acá se fija cómo se juega.

## Analogía

Un cofre cerrado sobre una mesa, con una cerradura que muestra una acción, y un llavero de cuatro llaves colgando de una argolla. No hay balanza en ninguna pantalla de este minijuego.

Mapa objeto → concepto: cofre → expresión; forma de la cerradura → operación; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → identidad alcanzada; llavero → conjunto de inversas.

Punto de ruptura: `two_branches_of_sqrt`. Una cerradura de elevar al cuadrado se abre a dos salas y un cofre no tiene dos interiores; ese borde está en `alg.fn.quadratic_and_sqrt` y no acá ([G0](../G-analogias/G0-reglas.md)). Lo que sí aparece en este nodo es un borde más chico y más útil: la cerradura que no tiene ninguna llave.

## Mecánica central

Superficie: el cofre ocupa el centro, el llavero abajo colgando de la argolla, el diagrama vertical al costado desde la capa `visual`. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una llave a la cerradura.** Si es la inversa, entra, gira entera y el cofre se abre; la animación de la cerradura se reproduce hacia atrás mientras la llave gira, y ahí está el argumento entero.
- **Llave equivocada.** Llega a la cerradura, gira un cuarto de vuelta y se traba; vuelve sola al llavero. Nada cambia y el cofre sigue cerrado, que es un estado válido.
- **Tocar el llavero.** Rota y muestra las llaves de a una, grandes. Buscar es un gesto del juego, no una espera.
- **Tocar el cofre abierto.** Vuelve a aplicar la cerradura original. El jugador ve que ida y vuelta se cancelan en los dos órdenes.
- **Armar una llave con fichas.** Desde el nivel 5 el llavero deja de venir hecho: el jugador elige operador y número por separado y el juego valida la llave armada antes de dejarla acercarse.
- **Probar las cuatro contra una cerradura que aplasta.** Ninguna gira y el juego no ofrece una quinta. Reconocerlo es el ítem.

En `symbolic` la superficie cambia de forma, no de reglas: el cofre es el diagrama vertical, arrastrar una llave es soltar una ficha sobre la flecha de vuelta, y la flecha se dibuja siempre —también con la llave equivocada—, pero aterriza en otro lado y el objeto de arriba no coincide.

## Invariante matemático

`inverse_restores_original`: la llave devuelve exactamente lo que había, ni más ni menos. Si devuelve algo parecido, no era la llave.

Se ve romperse de dos maneras distintas y las dos importan. Con la llave de otra familia, la llave se traba y no pasa nada: el invariante no llega ni a ponerse en juego. Con la llave de la familia correcta y el número equivocado, la llave gira, el cofre se abre y adentro hay algo que no es lo que había: el recorrido de la flecha de ida y la de vuelta no se cierra, y el objeto de arriba y el que volvió quedan uno al lado del otro sin coincidir.

Un movimiento válido pero inútil no rompe nada: aplicar la cerradura otra vez sobre el cofre abierto lo cierra con una capa más, y el diagrama crece un renglón. Empujón suave, sin explicación.

## Representación visual

Primitiva dominante `invert` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el taller de arreglos, el paquete envuelto y las tres herramientas. Solo se mira y se predice cómo vuelve a ser el que entró.
- `concrete`: cofre de madera, cerradura dibujada por forma, llavero con cuatro llaves de formas distintas. Desde el nivel 2, cerraduras y llaves con número.
- `visual`: el diagrama vertical. Arriba el objeto como pila o barra, en el medio la flecha que baja con la operación al costado, abajo el resultado. La llave es la misma flecha reproducida hacia arriba, y solo se cierra el recorrido si el objeto de arriba coincide.
- `symbolic`: las etiquetas `×3` y `÷3` reemplazan a las formas, y el llavero se vuelve una lista de parejas que crece.
- `formal`: las tres frases cortas con voz y el diagrama al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cofre → flecha que baja: al abrir el primer cofre en `visual`, las paredes se disuelven y quedan el objeto, la flecha con la cerradura al costado y el resultado.
2. Llave → flecha que sube: en el mismo gesto, la llave se estira en la flecha de vuelta, al lado de la de ida y en sentido contrario; la forma queda un rato como sombra.
3. Forma → etiqueta: la cerradura pierde el color y su forma se contrae en `×3`; la llave hace lo mismo y queda `÷3`.
4. Dos flechas → pareja del llavero: al arrastrar la llave a la argolla, las dos etiquetas quedan registradas juntas y el llavero se vuelve una lista que se abre con un toque.
5. Diagrama → renglón corto: al tocar el diagrama, las tres filas se acuestan en una línea con la flecha de vuelta escrita debajo; tocar el renglón vuelve a levantarlo.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el diagrama vertical: deshacer una operación es aplicar otra operación; la llave de una operación es la única que devuelve exactamente lo que había; hay operaciones sin llave, las que dejan igual a cosas que eran distintas. Propiedades: la inversa devuelve lo original en los dos órdenes; la llave es única; la llave de la llave es la cerradura; no toda operación tiene llave. Casos especiales: `+0` y `×1` son cerraduras que no cierran nada y su llave es ella misma; `×0` es la cerradura sin llave y se comprueba con tres objetos distintos en tres cofres iguales; restar y sumar el opuesto son la misma llave escrita de dos maneras. Sin símbolos nuevos: lo que el nodo aporta es la escritura del diagrama vertical, que el llavero hizo necesaria. La llave como objeto con nombre propio es del nodo 21 y acá no aparece.

## Generalización

El cofre se retira en `symbolic`, cuando el jugador elige la llave leyendo la etiqueta sin necesitar la forma. El diagrama vertical no se retira: es estructura, no piel, y acompaña a la mecánica hasta el final del curriculum, primero visible y después a demanda.

Variantes sin ayuda visual: las cuatro operaciones con un dígito; cerraduras con números negativos, donde "restar menos dos" y "sumar dos" son la misma llave; cerraduras que no cierran nada; la cerradura sin llave, que hay que reconocer y no resolver. Después, cerraduras que no son aritméticas: girar noventa grados, agregar una tapa, cambiar el rojo por el azul, correr el alfabeto tres lugares. El jugador nombra la llave y también señala la que no la tiene, como pintar todo de negro. Cuando nombra la llave de una cerradura que nunca vio, sin números, y explica por qué la llave es única sin recurrir al cofre, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): su nivel 1 (cofre amarillo, llave amarilla: hay correspondencia entre lo que cierra y lo que abre, y probar es gratis) y su nivel 2 (los colores son transformaciones: el azul desplaza tres, la llave azul desplaza tres hacia atrás) son este nodo, y el propio texto de H remite acá desde el nivel 2. La pregunta incómoda del `×0` que H ubica en la segunda llave también se juega acá. Del nivel 3 en adelante hay anidamiento y es del nodo 9; del 4, incógnita, y es del 13.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una forma, una llave.** `concrete`, `manipulate`. Cerraduras sin número, llaves por forma, dos llaves en el llavero. Probar es gratis y no cuesta nada.
2. **Cuatro llaves.** `concrete`, `recognize` y `manipulate`. Cerraduras con número, las cuatro operaciones, el llavero completo. Aparece `wrong_inverse_choice`.
3. **La flecha de vuelta.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; el cofre es el diagrama vertical y la llave es la flecha que sube.
4. **Etiquetas.** `symbolic` primera mitad, `manipulate` y `apply`. Las formas se vuelven `×3` y `÷3`; el llavero se vuelve la lista de parejas.
5. **Armar la llave.** `symbolic` segunda mitad, `apply`. El llavero deja de venir hecho: operador y número por separado. Parámetros: rango numérico mayor y cerraduras con números negativos.
6. **Cerraduras sin llave y cerraduras raras.** `formal` y `abstract`, `generalize`. Definición corta con voz; `+0`, `×1`, `×0`, y cerraduras no aritméticas con una sin inversa por instancia.

Qué endurece cada parámetro: el número en la cerradura obliga a elegir por familia y por valor a la vez; los negativos hacen que dos llaves distintas abran el mismo cofre y rompen la idea de que hay una sola escritura correcta; armar la llave con fichas quita el reconocimiento visual y deja solo la estructura; la cerradura sin llave rompe la expectativa de que siempre hay respuesta, que es la expectativa más cara de romper.

Desafíos de olimpíada: el nodo no participa todavía en ningún desafío declarado de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cofre con cerradura `+5` y llavero con `−5`, `+5`, `×5`, `÷5`. Tocar `−5`.
- `explain`: dos animaciones sobre cofres con cerradura `×4`: en una entra la llave `÷4`, gira y la flecha de vuelta cierra el recorrido; en la otra entra `−4`, gira un cuarto y se traba. Tocar la segunda; el distractor es `wrong_inverse_choice`.
- `manipulate`: una fila de cuatro cofres con `+3`, `−7`, `×2`, `÷5` y el llavero completo; arrastrar cada llave a su cofre, en cualquier orden.
- `apply`: cofre con cerradura `×6` y un teclado de fichas con operadores y números por separado; armar la llave eligiendo los dos, contra el tiempo objetivo del nodo.
- `generalize`: fichas de operación sueltas, incluidas `+(−2)` y `−(−2)`; emparejar cada una con su inversa y dejar sin pareja a `×0`. Y un cofre con cerradura "girar noventa grados": tocar la llave "girar noventa grados al revés".
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar la transformación que devuelve la grilla a su forma.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `wrong_inverse_choice`, patrón `key_mismatch` sobre el cofre: el juego muestra la forma de la cerradura, acerca la llave del jugador, la hace trabarse y revela al lado la silueta hueca de la que sí entra, sin nombrarla; el llavero sigue disponible y el cofre sigue cerrado. Es la única del nodo, la que se cataloga acá, y la que el nodo 13 hereda para usarla dentro de una igualdad. Sus dos reglas `detect` cubren las dos direcciones de la pareja multiplicativa.

Los distractores de `explain` y las opciones de `apply` se generan desde esas reglas `detect` más las de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_key_matches_lock`, nativa. La operación, el valor y las candidatas como parámetros; la cerradura muestra su forma, el llavero rota, la llave correcta entra y gira, y la flecha vertical se reproduce hacia arriba hasta cerrar el recorrido. Gramática `invert`. Abre cada nivel y es la imagen de cheatsheet de `cs.prealg.every_operation_has_a_key`.
- `chest_wrong_key_stays_shut`, nativa. La operación, la operación equivocada y el valor como parámetros; la llave gira un cuarto de vuelta, se traba y vuelve al llavero. Gramática `invert`. Es la escena propia del error, produce el distractor de `explain` y se reúsa en el nodo 13.
- Ninguna lleva texto rasterizado: las cerraduras son formas y las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_locked_chest`: `op` en {add, sub, mul, div}; `operand_range` (de 1 a 9 hasta el nivel 4, hasta 30 en el 5); `allow_negative_operand` (desde el nivel 5); `identity_lock` (`+0`, `×1`, desde el nivel 6); `no_key_lock` (`×0`, desde el nivel 6); `seed`.
- `gen_key_ring`: `size` (2 a 4 llaves); `distractors` desde `detect` (misma operación, inversa de la otra pareja, número cercano); `labeled` (falso en el nivel 1). Es el generador del llavero, nace acá y el nodo 13 lo reúsa con los mismos parámetros.
- `gen_inverse_pairs`: fichas de operación sueltas para emparejar, con `pairs` (2 a 5), `include_negatives` y una ficha sin pareja por instancia.
- `gen_nonarithmetic_lock`: acciones con inversa observable (rotación, agregar un objeto, permutar colores, correr el alfabeto) y una acción sin inversa por instancia.

**Literacy soportada:** de `none` a `full_text`. Todo el minijuego se juega sin leer: llaves y cerraduras por forma y color, llavero que rota con un toque, `explain` entre animaciones y prompts por voz. Desde el nivel 2 las cerraduras llevan un número, que es un ícono con historia y no texto. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma hace girar el llavero, toma la llave que encaja con la forma de la cerradura, la acerca y la gira entera; el cofre se abre. La escena vuelve al inicio y el llavero late. Se repite solo si el jugador se queda quieto. La demostración de la llave que se traba no se hace: se descubre ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Este archivo no contiene un solo número de mastery: el tiempo objetivo, los umbrales por verbo y la ventana de misconceptions se citan por nombre y su valor está en [K](../K-evaluacion.md).
