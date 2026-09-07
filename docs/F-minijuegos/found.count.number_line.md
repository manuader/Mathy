# El camino de piedras (`found.count.number_line`)

Minijuego del nodo 2 de la espina, "Los números viven en fila". Mecánica principal `gears_sequence`, secundaria `slope_walker`; analogía `number_line_walk`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/02-found.count.number_line.md): un concepto, tres dificultades reales (el sucesor, el paso constante, la posición de partida), una analogía que un niño de cinco años reconoce sin palabras, un gesto (un diente, una piedra), cuatro morphs hasta la recta graduada, el desplazamiento sobre soporte graduado como visualización dominante, retiro en `visual`. Acá se fija cómo se juega.

## Analogía

Un camino de piedras chatas cruza el agua. El caminante empieza en la orilla, que es una piedra más aunque no lo parezca, y avanza de a una. Todas las piedras están a la misma distancia. En una piedra lejana hay una bandera. Abajo, una manivela con dientes.

Mapa objeto → concepto: piedra → número entero; posición del caminante → valor; un paso → incremento de una unidad; orden de las piedras → orden de los números; orilla → cero; diente de la manivela → un paso; tarjeta clavada en la piedra → numeral; agua entre piedras → lo que no se puede pisar; bandera → número objetivo.

`gears_sequence` aporta "todos los pasos miden lo mismo"; `slope_walker` aporta el caminante que ocupa una posición y se arrastra. Punto de ruptura: `position_between_stones`, pararse en el agua, que este nodo nunca toca porque solo hay enteros. Se retira en `visual`, cuando las piedras se aplanan en marcas ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el camino cruza la pantalla a lo ancho, el caminante sobre una piedra, la bandera hacia la derecha, la manivela abajo al centro y, desde el nivel 4, un cajón de fichas con numerales al costado. Gestos: `scrub`, `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). Ningún gesto fino: la manivela ocupa el ancho de una mano y la zona de drop de una piedra es la piedra entera.

- **Girar la manivela un diente.** El caminante levanta el pie y cae en la piedra siguiente. Suena el tic del nodo 1. La manivela no tiene medio diente, así que no hay forma de caer en el agua girando.
- **Girar rápido.** El caminante encadena pasos y la manivela va marcando cada uno. No hay atajo: cada piedra se pisa.
- **Girar al revés.** El caminante vuelve. En la orilla la manivela se traba en el último diente y vibra: la pista se acabó de ese lado.
- **Arrastrar al caminante.** El muñeco se despega y flota. Al soltarlo cae en la piedra más cercana y la manivela se acomoda sola al número de esa piedra. El agua nunca traga: devuelve.
- **Tocar una piedra.** Su tarjeta se levanta un instante y muestra el numeral. Sirve para verificar sin caminar.
- **Arrastrar una ficha a una piedra sin tarjeta.** Si el numeral es el que corresponde, la ficha se clava con un chasquido. Si no, se desliza hasta el borde de la piedra y vuelve a la mano: no entra, y esa resistencia es todo el mensaje.
- **Estirar el extremo de la pista.** Desde `visual`: el camino se acuesta y se alarga o se acorta. Las marcas se separan o se juntan todas juntas, y los numerales no cambian.

## Invariante matemático

Dos invariantes, uno por mecánica.

`same_step_every_turn` (`gears_sequence`): cada vuelta de un diente mueve al caminante exactamente una piedra, siempre. Se ve romperse solo en la animación que miente de `explain`, donde los saltos son de distinto tamaño y el caminante cae en el agua entre dos piedras; el jugador tiene que señalarla. Nunca se rompe por un gesto del jugador, porque la manivela no permite medio diente.

`steepness_independent_of_step_size` (`slope_walker`), leído en su forma más pobre, que es la que este nivel necesita: la separación entre piedras no depende de cómo esté dibujado el camino. Se ve romperse cuando el jugador estira la pista y espera que la bandera cambie de número; el juego encoge la pista con la ficha ya puesta y muestra que la marca sigue siendo la misma.

Un movimiento válido pero inútil (caminar hasta pasarse de la bandera y volver, arrastrar al caminante a la piedra donde ya estaba) no rompe nada: el juego lo permite y, si se repite, hace latir la bandera como empujón suave.

## Representación visual

Primitiva dominante `displace` ([H](../H-progresion-abstraccion.md)).

- `real`: el camino sobre el agua, el caminante y la bandera. Solo se mira: alguien camina y llega.
- `intuition`: la misma escena detenida antes del final; dos desenlaces dibujados (pasos iguales, o un paso largo que saltea) y después el real. Una segunda escena con el caminante sin haber dado ningún paso y la orilla iluminada.
- `concrete`: la manivela, el tic, las tarjetas clavadas sobre las piedras, el cajón de fichas. Nada escrito salvo los numerales, que son dibujos del nodo 1.
- `visual`: las piedras se aplanan en marcas equidistantes de una recta, el agua se vuelve la línea, el caminante se contrae en un punto grueso y la rueda dentada queda al costado, enganchada. Las tarjetas pierden el marco y quedan como numerales debajo de las marcas.

El nodo no tiene `symbolic` ni `formal`: `layers` termina en `visual`. No hay flechas que abarquen varios pasos, ni operadores, ni marcas a la izquierda del `0`.

## Transición simbólica

Cuatro pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Piedra → casilla con tarjeta: al recorrer la pista entera de a un paso por primera vez en `concrete`, cada piedra pisada recibe la tarjeta del nodo 1 con el numeral del tic correspondiente, en el orden en que el pie la tocó.
2. Orilla → tarjeta con `0`: al volver al punto de partida y pedir la tarjeta de esa piedra, aparece un numeral que no se parece a los otros, dibujado mientras la voz señala que ahí el caminante no dio ningún paso.
3. Piedras → marcas de una recta: al estirar el extremo de la pista, el camino se acuesta, las piedras se aplanan, el agua se vuelve la línea y el caminante se contrae en un punto. Tocar la recta devuelve las piedras como fantasma.
4. Tarjeta clavada → numeral de la recta: al completar una pista con huecos sin recorrerla, las tarjetas pierden el marco y quedan solo los numerales bajo las marcas. Esa es la recta graduada que el nodo 3 usa como campo de juego.

## Concepto formal

Lo que queda al final, sin enunciarse en texto porque el nodo no tiene `formal` y es `literacy: none`: los números se pueden poner en una fila donde cada uno tiene exactamente un siguiente; la distancia entre un número y su siguiente es siempre la misma; hay un primer lugar, el cero, desde el que se cuentan los pasos; y el número de una piedra es la cantidad de pasos que hay desde la orilla hasta ella.

La notación que nace es la recta graduada con su origen. El problema que la hace necesaria es guardar el orden: las tarjetas del nodo 1 se pueden barajar y la pista no. El `0` nace de una pregunta sin respuesta: en qué piedra está el caminante antes del primer paso. No es "no hay nada", es dónde se empieza; la otra mitad del cero, la del cuenco vacío, es de `found.count.zero_as_empty`. Qué hay antes del `0` queda abierto: la manivela se traba y ese tope es la promesa de `arith.int.negatives`.

## Generalización

Las piedras se retiran en `visual`, cuando la recta con marcas hace todo el trabajo. La señal de que se puede retirar es que el jugador completa huecos sin recorrer la pista.

Variantes sin camino: pistas de distinta longitud con la misma cantidad de marcas; pistas verticales, donde el orden va hacia arriba; pistas con el `0` corrido, que no empieza en el extremo de la línea; marcas desnudas con numerales debajo y sin caminante, donde hay que poner la ficha igual. Y la que separa longitud de posición: la misma pista dibujada al doble y a la mitad, con la ficha del mismo número. Cuando el jugador resuelve todo eso y ubica el `0` en una pista corrida, la analogía se eliminó dentro de `visual`, que es hasta donde el nodo llega.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguna directa. El ejemplo de cofres empieza mucho después y el de frutas supone este nodo resuelto. La pista es lo que hay entre los cuencos del nodo 1 y el primer tramo del nodo 3.

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Un diente, una piedra.** `concrete`, `manipulate`. Pista corta, caminante en la orilla, bandera a pocas piedras. Sin tarjetas: se camina y se llega.
2. **Las piedras tienen nombre.** `concrete`, `manipulate` y `recognize`. Aparecen las tarjetas con numeral sobre cada piedra. El ítem es anticipar la piedra de llegada antes de que la manivela gire.
3. **La piedra donde no diste ningún paso.** `concrete`, `explain`. Parámetros iguales; entra la orilla como piedra y su tarjeta con `0`. La animación que miente es la de los saltos desiguales.
4. **Huecos.** `concrete` hacia `visual`, `apply`. Piedras sin tarjeta entre piedras numeradas; el cajón de fichas. Es el nivel donde el camino se acuesta y se vuelve recta.
5. **Pistas que cambian de tamaño.** Parámetros: pistas más largas, estiradas y encogidas, verticales, y el `0` corrido del extremo.
6. **Solo marcas.** `visual`, `generalize`. La pista pierde los dibujos: línea, marcas y numerales. Sin caminante en la mitad de las instancias.

Qué endurece cada parámetro: la longitud obliga a anticipar en vez de contar de a uno; los huecos consecutivos rompen la lectura "miro la de al lado y le sumo"; estirar y encoger separa longitud de posición; el `0` corrido rompe la lectura "el primero de la izquierda es el cero"; la pista vertical rompe "el orden va hacia la derecha".

Desafíos de olimpíada: [S](../S-desafios/S0-desafios.md) tiene rompecabezas sin leer para los niveles 0 a 2, pero ninguno declara este nodo entre sus requisitos. Hasta que exista uno de orden con datos ocultos, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin texto:

- `recognize`: el caminante en la piedra 4 y la manivela con tres dientes iluminados; tocar la piedra 7 entre las casillas numeradas. Distractores: la 6, la 8 y la 3.
- `explain`: dos animaciones sobre la misma pista; en una el caminante avanza un paso por número y las casillas quedan a la misma distancia, en la otra saltea casillas con saltos de distinto tamaño. Tocar la que rompe la fila.
- `manipulate`: caminante en la piedra 2, bandera en la 9; girar la manivela hasta llegar y soltar. Cada diente hace tic.
- `apply`: pista con las casillas 5 y 7 numeradas y la del medio vacía; arrastrar la ficha `6` mientras el caminante espera. En los niveles altos, dos y tres huecos seguidos.
- `generalize`: la misma pista estirada, acortada y después solo marcas; ubicar la ficha del número pedido en las tres versiones, con el `0` corrido en una de ellas.
- `transfer`: sobre el dial de giro de `geom.angle.turn_as_measure`, llevar la aguja tantas marcas como indica la ficha, como si la rueda fuera la pista enrollada.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo declara `misconceptions: []`, así que ninguna tiene nombre ni prompt de locale, ninguna clasifica y ninguna bloquea `ready`. Lo que el diseño prevé, con el patrón que correría si se catalogara:

- **Contar la piedra de salida como un paso.** `replay_on_mechanic` sobre `gears_sequence`: la manivela gira diente por diente en cámara lenta y el tic suena solo cuando el pie despega, con un halo mudo sobre la piedra de partida. Voz: "El caminante ya estaba parado ahí. ¿Cuántas veces levantó el pie?".
- **Pasos de distinto tamaño.** Es el distractor de `explain`. Si se elige como verdadero, el juego reproduce ese recorrido sobre la pista del jugador y muestra al caminante cayendo entre dos piedras. Voz: "Este paso fue más largo. ¿Dónde cayó?".
- **Orden por tamaño del dibujo.** Aparece en `generalize`: el juego encoge la pista con la ficha puesta y muestra que la marca es otra. Voz: "La pista se hizo más corta. ¿Cambió de piedra la bandera?".

Los distractores de `recognize` y las dos animaciones de `explain` se generan desde estos tres patrones, más el desvío numérico de una unidad. El primero es el candidato más claro a entrada propia en `misconceptions.yaml` si el playtest lo muestra sistemático.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_track_numbers_in_order`, nativa. La pista con sus numerales apareciendo en orden mientras la rueda dentada gira; gramática `displace`, con la separación entre marcas como lo que se conserva. Parametrizada por el rango de la pista y por qué casillas van vacías, produce los ítems de `apply` y las pistas estiradas de `generalize`.
- `gear_one_step_one_number`, nativa. El enganche entre un diente y un paso: la rueda avanza un diente, el punto salta una marca y el numeral se ilumina. Parametrizada por la casilla de partida y la cantidad de pasos, produce la mecánica de `manipulate`, los ítems de `recognize` y las dos animaciones de `explain`, una con el paso constante y otra con el paso alterado.
- No hay clips pre-renderizados: las dos escenas son la mecánica misma y tienen más variantes de parámetros de las que un clip por variante toleraría. Los numerales los dibuja el runtime; el caminante, la piedra y el agua son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_stone_path`: `length` (de 5 a 9 en los niveles 1 a 3, hasta 20 en el 5 y 6); `start_stone` (0 hasta el nivel 4, corrido desde el 5); `flag_stone`; `gaps` (cantidad de piedras sin tarjeta: 0 hasta el nivel 3, 1 en el 4, de 1 a 3 en el 5 y 6); `orientation` en {horizontal, vertical} (solo horizontal hasta el nivel 4); `stretch` (factor de dibujo, 1 hasta el nivel 4); `seed`.
- `gen_crank`: `teeth` (dientes que gira de un tirón: siempre 1 en este nodo); `direction` en {forward, backward}; `backstop` (verdadero siempre: la manivela se traba en el `0`).
- `gen_number_tile`: `target`; `distractor_offsets` (más uno y menos uno hasta el nivel 4; también más dos desde el 5); `skin` en {stone, mark} (solo stone hasta el nivel 5).

**Literacy soportada:** `none` en todos los niveles; es el único valor que el nodo admite, por ser nivel 0. No hay etiquetas ni definición escrita; los numerales son dibujos heredados del nodo 1. Un adulto ve exactamente lo mismo que un niño, con subtítulos apagados por defecto.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la manivela y la gira un diente; el caminante levanta el pie y cae en la piedra siguiente con su tic. La mano repite dos veces y desaparece; la manivela late. Se repite solo si el jugador se queda quieto. La demostración de la ficha (nivel 4) es nueva y se muestra una vez: la mano lleva una ficha del cajón al hueco y la clava. La demostración del tic no se repite: es la del nodo 1 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
