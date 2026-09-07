# La llave de vuelta (`arith.sub.undo_add`)

Minijuego del nodo 4 de la espina, "La resta deshace la suma". Mecánica principal `chest_key`, secundaria `gears_sequence`; analogía `walker_forward_and_back`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/04-arith.sub.undo_add.md): un concepto, cuatro dificultades reales (una sola vuelta sirve, deshacer y medir son lo mismo, el orden importa, la vuelta se puede pasar), una analogía que hereda el caminante y agrega el cofre, un gesto (soltar la llave sobre la manivela y girar al revés), cinco morphs hasta `5 − 3 = 2`, las dos flechas enfrentadas como visualización dominante. Acá se fija cómo se juega.

## Analogía

La pista del nodo 3 con el caminante en la piedra donde cayó y la flecha de ida todavía dibujada detrás. En la piedra de partida quedó un cofre cerrado. Abajo, la manivela y un llavero con tres llaves. Desde el nivel 4 no hay cofre: hay dos caminantes en dos piedras y una regla plegable.

Mapa objeto → concepto: pasos hacia adelante → sumando; piedra de llegada → suma; pasos hacia atrás → sustraendo; volver a la piedra de partida → operación inversa; cerradura → el tramo que se hizo; llave → el tramo que lo deshace; llave que no abre → no inversa; llavero → conjunto de vueltas posibles; regla estirada entre dos piedras → distancia; manivela trabada en la orilla → el borde del nodo.

`chest_key` aporta el veredicto ("una sola llave abre"); `gears_sequence` aporta la herramienta (la misma manivela, girando al revés con dientes del mismo tamaño). Punto de ruptura: `walking_past_start`, volver más allá de la orilla, que el nodo alcanza y no cruza porque ahí empieza `arith.int.negatives`. Se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la pista a lo ancho, el caminante y el cofre sobre sus piedras, la manivela abajo al centro, el llavero abajo a la izquierda, el libro de cuentas a la derecha. Gestos: `drag`, `scrub` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). La zona de drop de la manivela es la manivela entera y las llaves son del tamaño de un token.

- **Soltar una llave sobre la manivela.** El sentido de giro se invierte con un chasquido y el tope se fija en los dientes que la llave tiene marcados. Un solo gesto hace las dos cosas.
- **Girar con la llave puesta.** El caminante retrocede el tramo de un tirón. La flecha de vuelta se dibuja debajo de la recta, con la punta a la izquierda, sobre la flecha de ida.
- **Llave exacta.** Las dos flechas se enfrentan y se apagan juntas; el caminante queda sobre el cofre y el cofre se abre solo. Sin cartel.
- **Llave corta.** El caminante queda antes del cofre; el cofre no abre y el tramo de la flecha de ida que quedó sin cancelar se ilumina. El jugador sigue desde ahí: gira más o cambia de llave.
- **Llave larga.** El caminante se pasa del cofre y queda del otro lado; el cofre tampoco abre. Si se pasa de la orilla, la manivela se traba en el último diente y el caminante queda en el `0`. La pista se acabó y eso es una promesa, no una falta.
- **Girar hacia adelante.** Siempre permitido: se puede rehacer la ida. El estado nunca se borra.
- **Estirar la regla plegable.** Desde el nivel 4: el jugador la extiende de un caminante al otro y la regla se contrae en la ficha con el número de pasos. Es la misma flecha, medida en vez de recorrida.
- **Tocar el cofre abierto.** Reproduce la ida y la vuelta encadenadas y deja al caminante donde empezó: la verificación de que la llave era la única.

## Invariante matemático

Dos invariantes, uno por mecánica.

`inverse_restores_original` (`chest_key`): la vuelta devuelve al punto exacto si, y solo si, mide lo mismo que la ida. Se ve romperse con la llave corta y con la larga, y en las dos el cofre queda cerrado con la parte no cancelada iluminada. Se ve confirmarse cuando las dos flechas se apagan juntas.

`same_step_every_turn` (`gears_sequence`): los dientes miden lo mismo en los dos sentidos, así que volver tres es exactamente deshacer avanzar tres. Se ve romperse solo en el distractor de `explain` donde la vuelta trae un paso de más. Es también lo que hace que la regla plegable mida bien: el tramo entre dos piedras no depende de por dónde se lo recorra.

Un movimiento válido pero inútil (avanzar y volver el mismo tramo dos veces, usar la llave sin dientes) no rompe nada: el juego lo ejecuta, el caminante termina donde debe, y si se repite el llavero late como empujón suave.

## Representación visual

Primitiva dominante `invert`, de apoyo `displace` ([H](../H-progresion-abstraccion.md)).

- `real`: el caminante que cruzó, la marea que se llevó la tabla, el cofre en la otra orilla; alguien pone la misma tabla al revés y el cofre se abre. Solo se mira.
- `intuition`: la escena detenida antes de la caída; tres desenlaces dibujados (vuelve exacto y abre, vuelve de menos, vuelve de más) y después el real. Una segunda escena con dos caminantes y ninguna ida previa.
- `concrete`: la manivela en dos sentidos, el llavero, el cofre con su cerradura, la regla plegable.
- `visual`: la recta con marcas; la flecha de ida arriba con la punta a la derecha, la de vuelta abajo con la punta a la izquierda, y las dos apagándose juntas cuando coinciden. Al costado, el cofre se vuelve el diagrama vertical de E0: estado inicial arriba, flecha con la forma del tramo, estado final abajo, y la llave como la misma flecha reproducida hacia atrás. La regla es un tramo resaltado entre dos marcas.
- `symbolic`: fichas y el `−` sobre la recta atenuada, después el renglón con la ficha de llegada.

No hay marcas a la izquierda del `0` ni flechas que se pasen de la orilla.

## Transición simbólica

Cinco pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Llave con forma → llave con dientes contados: al abrir un cofre por primera vez en `visual`, la llave pierde el color y sus dientes se separan y se cuentan con el tic del nodo 1; la forma queda un rato como sombra.
2. Flecha de vuelta → ficha con numeral y sentido: al soltar la llave sobre el libro, la flecha se contrae en una ficha que conserva la punta hacia la izquierda. Es la primera ficha asimétrica del juego.
3. Punta hacia la izquierda → el signo `−`: al anotar una ida y una vuelta y ver que el total es la piedra de partida, la punta se despega y se estira en un trazo horizontal delante del numeral. Queda `5 − 3`.
4. Piedra de llegada → ficha de llegada: el numeral de la piedra donde quedó el caminante viaja al final de la expresión detrás del doble trazo. Queda `5 − 3 = 2`.
5. Regla plegable → la misma expresión: al estirar la regla entre dos caminantes, el tramo resaltado se contrae y aparece la misma escritura con los numerales de las dos piedras. Es la única vez que el minijuego afirma que sus dos caras son una, y lo hace con un morph.

## Concepto formal

Lo que queda al final, como voz sobre la pista y sin texto escrito porque el nodo es `literacy: none`: restar es deshacer un avance, volviendo tantos pasos como se avanzó; esa vuelta es única, ninguna otra devuelve a la piedra de partida; y restar dos números también dice cuántos pasos hay entre sus piedras. Casos verificados sobre el objeto: restar `0` no mueve al caminante; restar un número de sí mismo lo lleva al `0`; restar más de lo que hay traba la manivela, y ese caso no se resuelve acá.

El símbolo nuevo es el `−`, y el problema que lo hace necesario es el sentido: una ficha con `3` puede querer decir avanzar tres o volver tres, y en el encargo a distancia la punta de la flecha no viaja. El `−` es la flecha a la que se le sacó la punta y se le dejó el cuerpo. Con el `+` daba igual el orden y con el `−` no: `3 − 5` deja al caminante sin piedras, y ese resultado sin lugar es la promesa de `arith.int.negatives`. Las dos entradas de cheatsheet, `cs.arith.sub_undoes_add` y `cs.arith.sub_as_distance_between`, quedan como imagen con voz.

## Generalización

La pista, heredada del nodo 3, se retira en `visual`; el par de flechas enfrentadas se queda hasta `symbolic`, porque es lo que sostiene el `−` sin recta. El cofre queda como fantasma a demanda: representa estructura, no un objeto.

Variantes sin ayuda visual: números mayores que la pista visible; restar `0` y restar un número de sí mismo; la distancia entre dos piedras dadas solo por sus numerales, sin caminantes; el minuendo desconocido, `□ − 3 = 2`. Después, cerraduras que no son pasos: el caminante se dio vuelta, se puso un sombrero, cambió de color, y el jugador elige la llave que deshace, sin números. Cuando elige la llave sin probar, mide sin recorrer, resuelve el minuendo desconocido y nombra la llave de una cerradura arbitraria, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): su nivel 1, el cofre con la llave que se elige por forma, es de este nodo, y es la primera vez que el llavero aparece en el juego. Sus niveles 2 en adelante son de `prealg.inv.operation_as_key` y de `alg.eq.one_step`, con una salvedad: la parte del nivel 2 donde la transformación no es aritmética (colores, giros) también se juega acá, en el último nivel, porque sin ella el nodo no llega a reconocer la estructura sin números.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Volver de un tirón.** `concrete`, `manipulate`. Una ida hecha por el juego, tres llaves en el llavero, tramos de 2 a 4. El cofre se abre solo con la exacta.
2. **Elegir sin probar.** `concrete`, `recognize`. Mismos parámetros; el ítem es tocar la llave correcta antes de girar, con distractores de un diente de más y de menos.
3. **La vuelta que se pasa.** `concrete`, `explain`. Parámetros iguales; la animación que miente es la vuelta con un paso de más. Aparece por primera vez la manivela trabada en la orilla.
4. **Dos caminantes.** `visual`, `apply`. Sin cofre y sin ida previa: la regla plegable entre dos piedras. Es el nivel donde la pista se vuelve recta y donde nace la segunda cara.
5. **El renglón.** `symbolic`, `manipulate` y `apply`. Aparecen el `−` y la ficha de llegada; la recta se pide con un toque; las dos caras se escriben igual.
6. **Números grandes, cero y vuelta completa.** Parámetros: rango mayor que la pista visible, restar `0`, restar un número de sí mismo, y minuendo desconocido. El teclado de fichas deja de ofrecer llaves prearmadas: el jugador arma la llave con operador y número.
7. **Cerraduras que no son pasos.** `visual` con la pista retirada, `generalize`. Acciones no aritméticas con inversa (girar, ponerse el sombrero, cambiar de color) y una acción sin inversa por instancia.

Qué endurece cada parámetro: el rango obliga a elegir la llave por el tamaño del tramo y no por reconocer la cuenta; el cero rompe la lectura "restar siempre mueve"; la vuelta completa hace aparecer el `0` como resultado; el minuendo desconocido invierte la dirección de la lectura; las cerraduras arbitrarias separan la estructura de los números.

Desafíos de olimpíada: el nodo participará en los desafíos de aritmética de [S](../S-desafios/S0-desafios.md), aún no escritos, donde una vuelta exacta aparece como paso intermedio de un problema con datos ocultos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: el caminante acaba de avanzar de la piedra 2 a la 6; llavero con `3`, `4` y `6`. Tocar la de `4`. Los distractores son un diente de más, uno de menos y el numeral de la piedra de llegada en vez del tramo.
- `explain`: dos animaciones sobre el mismo viaje; en una el caminante vuelve sobre sus pasos y pisa la piedra de partida, en la otra vuelve con un paso de más y queda del otro lado del cofre. Tocar la segunda. El distractor elegido clasifica como vuelta inexacta.
- `manipulate`: caminante en la piedra 7, cofre en la 3; girar la manivela hacia atrás hasta que el cofre se abre.
- `apply`: dos caminantes en las piedras 3 y 9; estirar la regla y arrastrar la ficha `6`. Cuatro instancias seguidas contra el tiempo objetivo del nodo.
- `generalize`: con la pista ya sin dibujos, elegir entre fichas de resta y de suma la que abre cada cofre, alternando idas y vueltas. Y un cofre con cerradura "se puso el sombrero": tocar la llave "se saca el sombrero".
- `transfer`: en la grilla estirada de `geom.trans.undo_transformation`, aplicar la transformación que devuelve la figura a su lugar. También en `linalg.vec.vector_as_displacement` (la flecha con la punta al revés) y, cinco niveles después, en `calc1.ftc.integral_undoes_derivative`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo declara `misconceptions: []`, así que ninguna tiene nombre ni prompt de locale, ninguna clasifica y ninguna bloquea `ready`. Lo que el diseño prevé, con el patrón que correría si se catalogara:

- **Volver un paso de más o de menos.** `key_mismatch` sobre el cofre: la llave entra, gira un cuarto de vuelta y se traba; el tramo de la flecha de ida que quedó sin cancelar se ilumina. Voz: "La llave llegó hasta acá. ¿Cuánto falta para el cofre?".
- **Restar en el orden equivocado.** `replay_on_mechanic` sobre `gears_sequence`: el juego ejecuta el viaje de verdad, el caminante se pasa de la orilla y la manivela se traba. Voz: "La pista se terminó. ¿Desde cuál de los dos hay que volver?". Es el candidato más claro a entrada propia en `misconceptions.yaml`, porque su regla `detect` es limpia y porque reaparece en `arith.int.negatives`.
- **Creer que restar siempre achica un montón.** Aparece en los niveles de distancia, donde nada desaparece. El juego pone las dos reglas lado a lado, la del viaje deshecho y la de los dos caminantes, con el mismo tramo iluminado. Voz: "Nadie sacó nada. ¿Cuántos pasos hay de uno al otro?".

Los distractores de `recognize` y las animaciones de `explain` se generan desde estos tres patrones más el desvío de una unidad; las opciones de `apply` salen del rango de la pista.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_step_back_undoes_step`, nativa. El caminante avanza, el estado se guarda, la llave gira la flecha al revés y el caminante restaura la posición guardada mientras el cofre destella al abrirse; gramática `invert`, con la posición de partida como lo que se conserva. Parametrizada por la piedra de partida y el tamaño del tramo, produce la mecánica de `manipulate`, los ítems de `recognize` y las dos animaciones de `explain`.
- `gear_walk_back_same_count`, nativa. La manivela en los dos sentidos: el punto avanza y vuelve, y las dos flechas se enfrentan y se apagan. Parametrizada por la piedra de partida y el tramo, produce los ítems de `apply` con la regla plegable y las pistas sin dibujos de `generalize`.
- Reusadas: `gear_step_forward_adds` (nodo 3) para dibujar la ida que el juego hace antes de cada instancia, y `chest_pick_key_for_lock` (`prealg.inv.operation_as_key`) no se usa acá: el llavero de este nodo es el primero y su escena es la propia. Los numerales y el `−` los dibuja el runtime; el caminante, el cofre, la llave y la regla son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_walk_undo`: `start` (piedra de partida); `step` (tramo de ida, de 2 a 4 en los niveles 1 a 3, de 1 a 9 en el 4 y 5, hasta 30 en el 6); `mode` en {undo, distance} (`undo` hasta el nivel 3, `distance` desde el 4, mezclados en el 5); `allow_zero` (falso hasta el nivel 5); `allow_full_return` (restar un número de sí mismo, desde el nivel 6); `unknown` en {none, subtrahend, minuend} (`none` hasta el 5, `minuend` en el 6); `seed`.
- `gen_key_ring`: `size` (2 a 4 llaves); `distractors` (un diente de más, un diente de menos, el numeral de la piedra de llegada); `labeled` (falso en el nivel 1, verdadero desde el 2).
- `gen_arbitrary_lock`: acciones no aritméticas con inversa (giro, prenda, color) y una acción sin inversa por instancia; solo en el nivel 7.

**Literacy soportada:** `none` en todos los niveles. Los numerales y el `−` son dibujos, no texto; las llaves se distinguen por forma en el nivel 1 y por cantidad de dientes desde el 2, nunca por palabras. La definición existe solo como voz sobre la pista; en un perfil con lectura se agregan subtítulos, sin cambiar ningún ítem.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la llave de tres dientes, la suelta sobre la manivela (chasquido, el sentido se invierte) y gira; el caminante retrocede tres piedras y cae sobre el cofre, que se abre. La mano repite y desaparece; el llavero late. Se repite solo si el jugador se queda quieto. La demostración de girar hacia adelante no se repite: es la del nodo 3. La de la regla plegable (nivel 4) es nueva y se muestra una vez ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
