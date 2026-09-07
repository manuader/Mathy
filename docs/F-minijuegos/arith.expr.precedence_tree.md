# Cofres dentro de cofres (`arith.expr.precedence_tree`)

Minijuego del nodo 9 de la espina, "Los paréntesis son cofres anidados". Mecánica principal `chest_key`, secundaria `machine_pipe`; analogía `chest_nested`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/09-arith.expr.precedence_tree.md): un concepto, tres dificultades reales (ver forma donde hay una línea, saber qué pieza está adentro, anticipar que deshacer va al revés), una analogía de contención, un gesto (abrir el cofre que ya tiene contado lo suyo), cinco pasos de desvanecimiento, el árbol como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un cofre con otro cofre adentro. Cada tapa lleva una cerradura con la forma de una operación; en el fondo del cofre más interno hay un puñado de fichas.

Mapa objeto → concepto: cofre → expresión; cofre dentro de cofre → subexpresión; forma de la cerradura → operación; forma de la llave → operación inversa; abrir primero el cofre exterior → orden inverso al de la jerarquía; fichas del fondo → hojas del árbol; pila final sobre la mesa → valor; cadena de cerraduras agregadas → composición.

Punto de ruptura: `unknown_in_two_chests`. Cuando la misma pieza aparece adentro de dos cofres, el anidamiento deja de ser una cadena y el dibujo se fuerza; por eso la analogía se retira en `symbolic` y el nodo no llega hasta ahí ([G0](../G-analogias/G0-reglas.md)). El tubo entra sin piel propia: dos máquinas y un caño, porque la analogía de la máquina pertenece a los nodos de función.

## Mecánica central

Superficie: el cofre ocupa el centro, la mesa con las pilas contadas abajo, el tubo con sus dos máquinas a un costado desde el nivel 3. Gestos: `tap` y `drag` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar un cofre cuyo interior ya está contado.** Se abre, y su cerradura actúa sobre la pila que salió: la de sumar cuatro agrega cuatro fichas, la de multiplicar por tres convierte la pila en tres pilas iguales que se funden en una.
- **Tocar un cofre cuyo interior sigue cerrado.** La tapa se levanta un dedo y vuelve a caer; el cofre de adentro brilla. El estado no cambia y no se pierde nada.
- **Tocar el cofre más interno.** Se abre siempre: no tiene nada adentro salvo fichas, y las fichas se cuentan solas al salir.
- **Arrastrar una máquina al tubo.** La entrada recorre las máquinas en el orden en que están conectadas y sale una pila. Arrastrar una máquina pasando a la otra intercambia el orden y la salida cambia a la vista.
- **Arrastrar una máquina sobre la otra.** El tubo se pliega y las dos máquinas se vuelven cofre y cofre; la que actuaba primero queda adentro. Es el gesto que une las dos mecánicas.
- **Arrastrar una llave a un cofre.** Desde el nivel 5, para volver del resultado a las fichas del fondo. La llave de la cerradura interior rebota mientras la exterior siga puesta.

En `symbolic` la superficie cambia de forma, no de reglas: tocar un operador del renglón es tocar el cofre correspondiente, y el árbol fantasma aparece con el subárbol tocado iluminado. Las fichas de paréntesis se sueltan alrededor de una pieza; soltarlas alrededor de una hoja no mueve nada y el árbol lo muestra quedándose quieto.

## Invariante matemático

Dos invariantes, uno por mecánica.

`inverse_restores_original` (cofre): la llave devuelve exactamente lo que había, y por eso el orden de las llaves es el inverso del orden de las cerraduras. Se ve romperse cuando el jugador intenta la llave de adentro con el cofre de afuera puesto: la llave rebota contra la tapa.

`same_input_same_output` (tubo): la misma entrada por las mismas máquinas da la misma salida, y por eso dos salidas distintas prueban que las máquinas no estaban en el mismo orden. Se ve romperse —o mejor, se ve funcionar— cuando el jugador intercambia las máquinas y la pila cambia con la entrada intacta.

Un movimiento válido pero inútil no rompe nada: poner un paréntesis alrededor de una hoja, o abrir el cofre más interno dos veces seguidas, deja el árbol donde estaba. Empujón suave, sin explicación.

## Representación visual

Primitiva dominante `compose`, de apoyo `invert` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la mesa de empaque, tres bolsas, manzanas y peras. Solo se mira y se predice si las dos mesas terminan iguales.
- `concrete`: cofres de madera y de hierro con cerraduras dibujadas por forma, fichas sueltas en el fondo. Nada escrito salvo los signos de operación, que ya son íconos conocidos.
- `visual`: los cofres adelgazan en marcos, un rectángulo dentro de otro con la cerradura en el borde; tirando de una esquina los marcos se despliegan en el árbol, con un nudo por cerradura y una hoja por pila. Marco y árbol comparten ids y se iluminan entre sí. El tubo se vuelve dos cajas y una flecha.
- `symbolic`: el renglón con los dos operadores y, cuando hace falta, las fichas de paréntesis. El árbol queda a un costado, sincronizado, y después se pide con un toque.
- `formal`: las tres frases cortas con voz y el árbol al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cofre → marco: al terminar de evaluar en `visual`, las paredes adelgazan y queda un marco dentro de otro; el árbol aparece al tirar de una esquina.
2. Pila → número: cada pila contada se contrae en su número y queda como hoja.
3. Cerradura → operador: al arrastrar un marco a la línea vacía, su cerradura se despega del borde y aterriza entre las dos hojas.
4. Marco interior → paréntesis: al soltar los dos marcos en la misma línea, los bordes verticales del interior se contraen en `(` y `)` y el marco exterior desaparece porque ya no hace falta dibujarlo.
5. Paréntesis → forma editable: tocar el paréntesis lo borra, el árbol se reacomoda con un morph y la pila cambia. Casi el mismo renglón, otro árbol.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el árbol: una expresión es un árbol donde cada operación sostiene dos piezas y cada pieza puede ser otra operación; evaluar es abrir de adentro hacia afuera, porque ninguna operación puede actuar antes de que sus piezas tengan valor; un paréntesis dibuja una pieza que la escritura sola habría agrupado de otra manera. Propiedades: el valor de una pieza no depende de lo que la envuelva; cambiar el árbol cambia el valor salvo cuando la operación no lo nota; deshacer recorre el árbol al revés. Casos especiales: un paréntesis alrededor de una hoja no mueve nada, y las cadenas del mismo tipo (`8 − 3 − 2`) tienen forma por defecto y se nota al restar y al dividir. El símbolo nuevo es el paréntesis. No hay acrónimo en ningún nivel.

## Generalización

Los cofres se retiran en `symbolic`, cuando el jugador dice qué pieza está adentro leyendo el paréntesis. El árbol se queda como fantasma a demanda hasta `formal`, porque representa estructura y no un nombre.

Variantes sin ayuda visual: tres operaciones de dos tipos sin paréntesis; un paréntesis que no cambia nada; paréntesis anidados; cadenas del mismo tipo con restar y dividir. Después, cerraduras que no son operaciones: "girar noventa grados y después reflejar", "pintar y después recortar". El jugador dice cuál actúa primero, arma el anidamiento y decide si intercambiarlas cambia el resultado. Cuando lee un renglón de tres operaciones, dice qué pieza está adentro sin evaluar y construye un renglón cuyo árbol coincide con uno dado, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): su nivel 3 (cofres anidados, el orden importa, la llave del interior no sirve mientras el exterior esté cerrado) es este nodo. Los niveles 1 y 2 pertenecen a `arith.sub.undo_add` y `arith.div.undo_mul`; del 4 en adelante hay incógnita y son del 13 y el 14.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Dos cofres.** `concrete`, `manipulate`. Un cofre adentro de otro, cerraduras de sumar y multiplicar, rango numérico chico. La regla "se abre lo que ya tiene contado lo suyo" se descubre tocando.
2. **Cuál está adentro.** `concrete`, `recognize`. Varios pares de cofres y una expresión de fichas al lado; tocar la pieza que está en el interior. Aparece `unwrap_order_inverted`.
3. **El tubo.** `concrete`, `explain` y `apply`. Dos máquinas y una salida dada; conectarlas en el orden que la produce, y después plegar el tubo en cofres.
4. **Marcos y árbol.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; los cofres son marcos y el árbol se despliega tirando de una esquina.
5. **La llave vuelve.** `visual`, `manipulate`. Desde el resultado hasta las fichas del fondo, con las llaves de los nodos 4 y 6. Las llaves entran de afuera hacia adentro y la de adentro rebota si la de afuera sigue puesta.
6. **El renglón.** `symbolic`, `manipulate` y `apply`. El árbol al costado primero, fantasma después; fichas de paréntesis en la bandeja. Parámetros: tres operaciones y dos tipos.
7. **Formas que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; cadenas del mismo tipo con restar y dividir, paréntesis anidados, y cerraduras no aritméticas.

Qué endurece cada parámetro: la profundidad del anidamiento obliga a pensar en capas y no en pares; mezclar restar y dividir rompe la idea de que el orden entre iguales da lo mismo; el paréntesis que no cambia nada obliga a mirar el árbol en vez de reaccionar al símbolo; el rango numérico grande impide reconocer la cuenta de memoria y fuerza a leer la forma.

Desafíos de olimpíada: el nodo no participa todavía en ningún desafío declarado de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cofre de madera con cerradura `+4` y adentro cofre de hierro con cerradura `×3`; al lado, `3 × (2 + 4)`. Tocar `2 + 4`.
- `explain`: el mismo par de cofres en dos animaciones: en una se abre el interior, se cuenta y después el exterior; en la otra se toca el exterior primero y la tapa vuelve a caer. Tocar la segunda. El distractor es `unwrap_order_inverted`.
- `manipulate`: un árbol dibujado con raíz `×`, hoja `3` y subárbol `2 + 4`; armar el cofre que le corresponde con fichas de paréntesis y abrirlo desde adentro.
- `apply`: dos máquinas, `×3` y `+4`, y la salida `18` mostrada; conectarlas en el orden que la produce, contra el tiempo objetivo del nodo.
- `generalize`: sin cofres, `12 ÷ 3 ÷ 2` y `12 ÷ (3 ÷ 2)`; tocar la operación que se calcula primero en cada uno. Y una cadena "girar noventa grados, después reflejar": decir cuál actúa primero.
- `transfer`: en la tubería de pasos de `csmath.inv.loop_invariant`, ordenar los pasos del ciclo para que el resultado coincida con el árbol dado.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `unwrap_order_inverted`, patrón `tree_unwrap` sobre el cofre: el juego dibuja el anidamiento como marcos, anima el orden que usó el jugador, muestra la capa que seguía envuelta y hace latir el marco exterior; el estado real se conserva y el jugador sigue desde ahí. Es la única del nodo y la que el nodo 14 hereda.

Los distractores de `explain` y las opciones de `apply` se generan desde sus reglas `detect` más las de los prerequisitos directos. La regla `detect` declarada para esta misconception está escrita en forma de ecuación, así que en este nodo el disparador es el orden de apertura sobre el cofre, no una reescritura del renglón.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_nested_open_inside_first`, nativa. La expresión del jugador dibujada como cofres y el orden de apertura como parámetro; gramática `compose`, con el marco interior iluminado mientras la cerradura exterior espera. Produce también las dos animaciones de `explain`, y es la imagen de cheatsheet de `cs.arith.expression_is_a_tree`.
- `pipe_two_machines_order_matters`, nativa. La misma entrada corre por las dos máquinas en los dos órdenes y las salidas quedan lado a lado; gramática `compose`. Abre los niveles 3 y 6.
- Ninguna lleva texto rasterizado; los números y las cerraduras los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_expression_tree`: `depth` (2 en los niveles 1 a 5, 3 desde el 6); `ops` en {add, sub, mul, div}; `kinds` (uno o dos tipos distintos); `leaf_range` (de 1 a 9 hasta el nivel 5, hasta 40 después); `parens` en {needed, redundant, none}; `seed`.
- `gen_machine_chain`: `ops` (dos máquinas), `input`, `swap_changes_output` (verdadero salvo en los ítems donde se quiere mostrar que a veces no cambia), `seed`.
- `gen_arbitrary_chain`: cadenas de acciones no aritméticas con orden observable (girar y reflejar, pintar y recortar, envolver y atar), con un par por instancia donde intercambiarlas no cambia nada.

**Literacy soportada:** de `none` a `full_text`. Todo el minijuego se juega sin leer: las cerraduras son formas y los signos son íconos con historia. La única pieza que pide etiquetas legibles es la explicación `tree_unwrap`, que necesita la operación de cada capa escrita en el borde del marco. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toca el cofre exterior y la tapa vuelve a caer; después toca el interior, las fichas salen y se cuentan, y recién entonces el exterior se abre. La escena vuelve al inicio y el cofre interior late. Se repite solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** El minijuego no fija ningún número: el tiempo objetivo del nodo, los umbrales por verbo, la ventana de misconceptions y la espera antes de repetir la demostración se leen de [K](../K-evaluacion.md).
