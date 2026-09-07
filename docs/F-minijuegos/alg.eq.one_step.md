# Cofres y llaves (`alg.eq.one_step`)

Minijuego del nodo 13 de la espina, "Una llave, los dos platos". Mecánica principal `balance`, secundaria `chest_key`; analogías `balance_pans` y `chest_single_lock`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/13-alg.eq.one_step.md): un concepto, tres dificultades reales (conservar la igualdad, elegir la inversa, no memorizar el atajo), dos analogías complementarias, un gesto (pasar la llave por los dos platos), cinco pasos de desvanecimiento, la balanza como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una balanza de platos nivelada. En un plato, una caja cerrada unida a varias pesas por un broche con forma de cerradura; en el otro, pesas sueltas. Abajo, un llavero.

Mapa objeto → concepto: plato → lado de la ecuación; pesas → términos; barra nivelada → igualdad; caja cerrada → incógnita; broche con forma → operación que acompaña a la incógnita; llave → operación inversa; llave que no gira → no inversa; pasar la llave por los dos platos → transformación de equivalencia; caja sola en un plato nivelado → solución; llavero → conjunto de inversas.

La balanza aporta "en cuántos platos"; el cofre, "qué llave". Punto de ruptura de la balanza: pesas negativas y multiplicar los platos, por eso se retira en `symbolic`. Punto de ruptura del cofre: una cerradura con dos llaves (`x²`), fuera de este nodo ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la balanza ocupa el centro, el llavero abajo, el cofre como diagrama a un costado desde la capa `visual`. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar la llave por un plato.** La acción de la llave ocurre en ese plato: con `−5`, cinco pesas se elevan; con `÷3`, el plato se reparte en tres montones iguales y queda uno. La balanza responde con inercia.
- **Seguir hasta el otro plato sin soltar.** La misma acción ocurre allí. Si la llave era la inversa correcta, la barra queda nivelada y la caja se abre sola.
- **Soltar después de un solo plato.** La barra queda inclinada y la caja no cede. El estado se conserva; el jugador puede pasar la llave por el plato que falta.
- **Llave equivocada.** Llega al broche, gira un cuarto de vuelta y se traba. Nada cambia.
- **Tocar una pesa.** La quita de ese plato, como en el nodo 11. Sirve para sumar y restar; con multiplicar y dividir no alcanza, y ahí se siente para qué está el llavero.
- **Tocar la caja abierta.** Devuelve las pesas a la caja y muestra que la balanza original sigue nivelada: la verificación por sustitución.

En `symbolic` la superficie cambia de forma, no de reglas: soltar la llave sobre el `=` es pasarla por los dos platos; soltarla sobre un solo lado es pasarla por un plato; arrastrar una ficha a través del `=` es un movimiento libre que la línea valida inclinándose. La balanza aparece como fantasma tocando el `=`.

## Invariante matemático

Dos invariantes, uno por mecánica.

`equality_under_identical_actions` (balanza): la igualdad sobrevive a acciones idénticas en ambos lados. Se ve romperse cuando la llave pasa por un solo plato: la barra se inclina y la caja queda inaccesible. Ningún mensaje lo dice; la inclinación es el mensaje.

`inverse_restores_original` (cofre): la llave devuelve exactamente lo que había. Se ve romperse cuando la llave no es la inversa: se traba en el broche. Y se ve confirmarse al cerrar la caja de nuevo: la balanza original sigue nivelada.

Un movimiento válido pero inútil (aplicar `+5` a los dos lados, o `÷5` en fichas donde hacía falta `−5`) no rompe ningún invariante: la balanza sigue nivelada con más pesas, o la expresión se complica. Recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `invariant`, de apoyo `invert` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el puesto de mercado, frasco y limones, sin llavero. Solo se mira y se predice.
- `concrete`: balanza con pesas y caja, broche con forma, llaves con forma y color. Nada escrito.
- `visual`: la balanza se estiliza en dos columnas y una barra; las pesas se aplanan en barras proporcionales y la caja en una barra de longitud desconocida. Cada acción a los dos lados muestra antes y después con la barra nivelada iluminada en ambos. Al costado, el cofre se vuelve el diagrama vertical: caja, flecha hacia abajo con la cerradura, caja acompañada; la llave es la flecha de vuelta.
- `symbolic`: fichas `x`, `5`, `12` sobre una línea que hereda de la barra el poder de inclinarse; la llave es una ficha con etiqueta.
- `formal`: la definición corta con voz; la balanza fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cofre → caja con ficha: al abrir la caja por primera vez en `visual`, el cofre se vuelve contorno y la cerradura se despega como ficha `+ 5` junto a la caja; las barras del otro plato se contraen en `12`.
2. Llave con color → llave con `−5`: en el mismo gesto, la llave pierde el color y gana etiqueta; la forma queda un rato como sombra.
3. Caja → `x`: al aplicar por primera vez una llave etiquetada a los dos platos, la caja se contrae en `x`.
4. Barra → `=`: al siguiente movimiento válido, los platos se desvanecen y la barra se contrae en `=`; queda `x + 5 = 12` sobre una línea que todavía se inclina.
5. Llave → operación a ambos lados: al soltar la llave sobre el `=`, la etiqueta se desdobla bajo cada lado y el renglón `x = 7` aparece con un morph.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la balanza fantasma: una ecuación de un paso es una igualdad donde la incógnita tiene una sola operación encima; resolverla es aplicar a los dos lados la operación que la deshace; la solución es el valor que deja la igualdad nivelada. Propiedades: la igualdad se conserva bajo la misma acción en ambos lados (dividir, salvo por cero), y la inversa devuelve lo original, `(x + 5) − 5 = x`. Caso especial: `0 · x = 12` no tiene llave. Sin símbolos nuevos: `=` y `x` ya nacieron en los nodos 11 y 10; lo nuevo es el renglón con la operación bajo los dos lados.

## Generalización

La balanza se retira en `symbolic`, cuando la ficha se aplica al `=` sin mirar los platos. El cofre se queda como fantasma a demanda hasta `formal`.

Variantes sin ayuda visual: constantes y soluciones negativas; incógnita a la derecha; coeficientes y soluciones fraccionarias; decimales cortos. Después, cerraduras que nunca se vieron: "rotar 90°", "agregar 🍎", "cambiar rojo por azul". El jugador nombra la llave sin números, y distingue la cerradura sin llave ("pintar todo de negro", `×0`). Cuando resuelve todo eso sin pedir balanza ni cofre, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): sus niveles 1 a 4 (cofre y llave por forma, colores como transformaciones, la caja dentro del cofre, fichas al lado del cofre) corresponden a este nodo. Del 5 en adelante son del nodo 14 y siguientes, con una salvedad: la parte de los niveles 5 y 6 que se juega con una sola cerradura (la expresión sola, elegir la llave sin ayuda) también se juega acá, porque sin ella no se sale de `symbolic`. El nodo 14 la retoma con dos cerraduras.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una llave, dos platos.** `concrete`, `manipulate`. Solo cerraduras de sumar y restar, llaves por forma, dos llaves en el llavero. Rango numérico chico.
2. **Cuatro cerraduras.** `concrete`, `recognize` y `manipulate`. Se agregan multiplicar y dividir; el llavero tiene las cuatro llaves. Aparece `wrong_inverse_choice`.
3. **Barras y flechas.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; la balanza es de barras y el cofre es el diagrama vertical.
4. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión aparece junto a la balanza y se transforma en sincronía; llaves con etiqueta.
5. **Balanza fantasma.** `symbolic` segunda mitad, `apply`. La expresión queda sola; la balanza se pide con un toque. Aparece `sign_flip_on_move`.
6. **Números difíciles.** Parámetros: rango numérico mayor y constantes y soluciones negativas.
7. **La caja a la derecha.** Parámetros: incógnita en el lado derecho y coeficientes y soluciones fraccionarias. El teclado de fichas deja de ofrecer llaves prearmadas: el jugador arma la llave con operador y número.
8. **Cerraduras que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; cofres con acciones no aritméticas.

Qué endurece cada parámetro: el rango numérico obliga a elegir la llave por la forma de la cerradura y no por reconocer la cuenta; los negativos rompen la balanza física y fuerzan la línea; las fracciones separan "dividir" de "repartir en montones"; la incógnita a la derecha rompe la lectura "lo que está a la izquierda es lo que busco".

Desafíos de olimpíada: el nodo participa en los desafíos de álgebra de [S](../S-desafios/S0-desafios.md), aún no escritos, donde una ecuación de un paso aparece como paso intermedio de un problema de varios nodos con datos ocultos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: balanza nivelada con `□ + 4` a la izquierda y `11` a la derecha; llavero con `−4`, `+4`, `÷4`, `×4`. Tocar `−4`.
- `explain`: `3x = 12` en tres animaciones: `÷3` por los dos platos y la barra nivelada; `÷3` por un solo plato y la barra inclinada; `−3` que se traba en el broche. Tocar las dos que no resuelven. El distractor elegido clasifica: la inclinada es `inverse_applied_one_side`, la trabada es `wrong_inverse_choice`.
- `manipulate`: `x − 7 = 2`. Arrastrar `+7` por los dos platos; la caja muestra `9`; tocarla para verificar.
- `apply`: cuatro balanzas seguidas, `x + 8 = 15`, `5x = 35`, `x − 3 = −1`, `x / 2 = 6`, una llave cada una, contra el tiempo objetivo del nodo.
- `generalize`: sin balanza, la línea `2 = y + 3/4`; aplicar `−3/4` a ambos lados. Y un cofre con cerradura "rotar 90°": tocar la llave "rotar 90° al revés".
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, dado adónde fue a parar un vector, aplicar la deformación inversa y recuperar la entrada. También en `disc.mod.clock_equivalence` (engranajes) y `trig.id.double_angle` (tuberías).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `inverse_applied_one_side`, patrón `replay_on_mechanic` sobre la balanza: el gesto se repite en cámara lenta, la barra se inclina, un halo marca el plato no tocado, y el jugador nivela desde ese estado. Es la de mayor severidad del nodo.
- `wrong_inverse_choice`, patrón `key_mismatch` sobre el cofre: la llave se traba, la cerradura muestra su forma y aparece la silueta hueca de la llave correcta; el llavero sigue disponible.
- `sign_flip_on_move`, patrón `replay_on_mechanic` sobre la balanza: la ficha que cruzó el `=` se reconstruye como pesas que salieron de un plato y entraron en el otro; la barra se hunde y el jugador nivela.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de estas tres, más las de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `balance_key_both_sides`, nativa. La balanza del jugador con la llave pasando por los dos platos; gramática `invariant`, antes y después con la barra nivelada iluminada. Parametrizada por operación, valores y por cuántos platos recorre la llave, produce también las animaciones de `explain`.
- `chest_pick_key_for_lock`, pre-renderizada sin texto. La cerradura muestra su forma, el llavero rota, la llave correcta entra y la flecha vertical se reproduce al revés; gramática `invert`. Abre cada nivel y es la imagen de cheatsheet de `cs.alg.one_key_both_sides`. Las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).
- Reusadas: `balance_remove_one_side_tilts` (nodo 11) y `chest_wrong_key_stays_shut` (nodo 12), como distractores de `explain`.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_one_step_equation`: `op` en {add, sub, mul, div}; `operand_range` (constante o coeficiente, de 1 a 9 en los niveles 1 a 5, hasta 30 en el 6 y 7); `solution_range` (enteros positivos hasta el nivel 5, negativos desde el 6, fracciones simples desde el 7); `allow_negative_constant`; `unknown_side` en {left, right}; `seed`.
- `gen_key_ring`: `size` (2 a 4 llaves); `distractors` desde `detect` (misma operación, inversa de la otra pareja, número cercano); `labeled` (falso en los niveles 1 y 2).
- `gen_arbitrary_lock`: acciones no aritméticas con inversa (rotación, agregar un objeto, permutar colores) y una acción sin inversa por instancia.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer, pero desde el nivel 2 las llaves llevan una etiqueta de un dígito con operador, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la llave de restar, la pasa por el plato izquierdo, sigue sin soltar hasta el derecho y suelta; la caja se abre. La escena vuelve al inicio y el llavero late. Se repite solo si el jugador se queda quieto. La demostración de quitar pesas con un toque no se repite: es la del nodo 11 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
