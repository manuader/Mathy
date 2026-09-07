# La manivela y la tarjeta (`arith.add.displacement`)

Minijuego del nodo 3 de la espina, "Sumar es avanzar en la pista". Mecánica principal `gears_sequence`, secundaria `ledger`; analogía `number_line_walk`, con los montones del libro de cuentas al costado. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/03-arith.add.displacement.md): un concepto, cuatro dificultades reales (no volver a empezar, sostener las dos lecturas del número, entender qué dice el igual, anticipar en vez de ejecutar), una analogía heredada del nodo anterior, un gesto que mueve al caminante y llena una fila del libro a la vez, cinco pasos de desvanecimiento, retiro de la línea en `symbolic`. Acá se fija cómo se juega. Es el primer minijuego de la espina que llega a la notación.

## Analogía

La pista de piedras del nodo 2, con el caminante ya parado en una piedra cualquiera y una tarjeta sobre la manivela que dice cuántas vueltas dar. Al costado, un libro de cuentas con filas vacías.

Mapa objeto → concepto: piedra → entero; posición del caminante → valor; una vuelta → un paso; tramo recorrido → sumando; flecha sobre la línea → el sumando como objeto que se puede mover; piedra de llegada → suma; fila del libro → montón de un sumando; dos filas fundidas → la suma leída como cantidad.

La pista aporta "dónde se termina"; el libro, "cuántos hay". Punto de ruptura de la pista: `position_between_stones`, y además la orilla, que hace que todavía no exista retroceder más allá del principio; eso es de `arith.int.negatives`. Punto de ruptura del libro: solo se funden filas del mismo tipo de objeto, lo que acá no molesta y en `prealg.expr.like_terms` pasa a ser el tema ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la pista cruza el centro, la manivela y su tarjeta abajo, el libro de cuentas en una franja lateral. Desde `symbolic` el renglón aparece sobre la línea y la línea baja. Gestos: `drag`, `scrub` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela tantas vueltas como puntos tiene la tarjeta.** El caminante salta con cada clic, la flecha del tramo crece detrás y el libro marca un tic por vuelta. Al completarse, la piedra de llegada se ilumina y la tarjeta se apoya sobre la flecha.
- **Soltar antes de completar.** La flecha queda corta y la tarjeta no se apoya; los puntos que faltan quedan apagados y se ve cuántas vueltas restan. El estado se conserva.
- **Girar de más.** La flecha se pasa y sobra tramo del otro lado. Volver hacia atrás la recorta.
- **Predecir.** Desde el nivel 2 el jugador toca primero la piedra de llegada y la manivela gira sola después. Si tocó otra, el caminante pasa por encima de esa piedra sin detenerse y el tramo entre las dos queda marcado.
- **Encadenar dos tarjetas.** El jugador elige cuál aplicar primero; las flechas se enganchan punta con cola. Cambiar el orden y repetir deja las dos cadenas superpuestas en gris, terminando en la misma marca.
- **Fundir dos flechas.** Un pellizco sobre dos flechas encadenadas las convierte en una sola, la que lleva del principio al final.
- **Juntar dos filas del libro.** Arrastrar una fila sobre otra las funde y la cuenta de la fila junta aparece sola. Es la misma suma sin pista.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha `+ 3` sobre el renglón es aplicar el tramo; el renglón se escribe en los dos órdenes, `7 + 3 = 10` y `10 = 7 + 3`, y a veces con el hueco a la izquierda. La línea se pide con un toque y aparece como fantasma.

## Invariante matemático

`same_step_every_turn` (`gears_sequence`): una vuelta es una piedra, siempre y desde cualquier posición. Es lo que hace que la flecha de tres pasos mida lo mismo dibujada donde sea, y por eso se puede arrastrar. Se ve romperse en las animaciones de `explain` con paso irregular, heredadas del nodo 2.

`count_preserved_under_regrouping` (`ledger`): juntar dos montones en cualquier orden y agrupar de cualquier manera da el mismo montón. Es el invariante que sostiene las dos propiedades del nodo, y se ve confirmarse cada vez que las dos cadenas de flechas superpuestas terminan en la misma marca.

Hay un invariante que este minijuego cuida especialmente porque es donde falla el jugador: **los dos lados del renglón nombran la misma piedra**. Se ve romperse cuando el jugador arma un renglón cuyos dos recorridos terminan en piedras distintas; la pista dibuja las dos flechas y la diferencia entre las llegadas es visible sin que nadie diga nada.

Un movimiento válido pero inútil —aplicar `+ 0`, girar adelante y atrás lo mismo, fundir una flecha con otra de longitud cero— no rompe nada y recibe un empujón suave.

## Representación visual

Primitiva dominante `displace`, de apoyo `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: el caminante parado en una piedra del medio y alguien que le pide unos pasos. Solo se mira.
- `intuition`: el caminante congelado a mitad de salto y tres desenlaces dibujados —la piedra correcta, la que sale de contar desde la orilla, la que sale de contar la de partida—. En una variante, dos tarjetas aplicadas en distinto orden.
- `concrete`: pista de piedras, manivela, tarjeta de puntos, libro de cuentas con tics. Nada escrito.
- `visual`: marcas sobre una línea, el caminante como punto, el sumando como flecha etiquetada que se arrastra sin cambiar de tamaño y se funde con otra. Al costado, cada sumando como barra de marcas y la suma como las dos barras pegadas de punta, alineadas con la flecha fundida.
- `symbolic`: fichas `7`, `+ 3`, `10` sobre un renglón, con la línea sincronizada debajo; tocar un símbolo ilumina su parte de la línea y viceversa.
- `formal`: las tres frases cortas con voz y la línea fantasma al lado.
- `abstract`: desplazamientos que no son numéricos —casilleros de colores, lugares en una fila, marcas de un dial— sin línea.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Piedra → marca y caminante → punto: heredado del nodo 2, sin demostración nueva.
2. Tramo → flecha: al terminar el primer recorrido en `visual`, la huella se afina en una flecha de salida a llegada y la tarjeta de puntos se apoya sobre ella y se contrae en un dígito.
3. Flecha etiquetada → ficha `+ 3`: al arrastrar una flecha y soltarla en otro punto de la línea, se afina hasta ser ficha y el signo aparece pegado al número. El operador nace del gesto de mover un tramo sin cambiarle el tamaño.
4. Punto de salida → ficha de número: al aplicar por primera vez una ficha sin girar la manivela, la posición de salida se contrae en ficha y queda `7 + 3` sobre la línea, con la flecha todavía debajo.
5. Llegada → el mismo lugar escrito dos veces: al soltar la ficha, el número de la piedra de llegada se despega hacia el renglón unido por el igual. Queda `7 + 3 = 10`, sincronizado con la línea.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la línea fantasma: sumar es avanzar, sumar tres es dar tres pasos; el resultado es la posición donde se cae; dar dos saltos en cualquier orden termina en el mismo lugar. Propiedades: el orden de los sumandos no cambia el resultado, agrupar de otra manera tampoco, y sumar cero deja todo igual, con la flecha de cero reducida a un punto.

Símbolo nuevo: `+`, y uno solo. Nace porque las flechas se pueden arrastrar y hay que poder decir cuál es sin dibujarla. El signo de igual aparece pero el nodo no lo introduce: su historia es de `prealg.eq.balance` según la tabla de [H](../H-progresion-abstraccion.md), y acá vale como marca de que la piedra de llegada tiene dos nombres. Esa llegada anticipada es lo que siembra `equals_as_operator`.

Caso que el nodo deja abierto a propósito: retroceder más allá de la orilla, que no tiene piedra donde caer. Es el problema de `arith.int.negatives`. Y la vuelta que devuelve al caminante a su piedra, que todavía no tiene nombre y la recoge `arith.sub.undo_add`.

Entradas de cheatsheet al alcanzar `symbolic` por primera vez: `cs.arith.add_as_step_forward` y `cs.arith.add_order_irrelevant` ([R](../R-cheatsheet/R0-cheatsheet.md)).

## Generalización

La pista de piedras se retira en `visual`. La línea con flechas se retira en `symbolic`, cuando la ficha se aplica sin mirarla, y queda como fantasma a demanda hasta `formal`, porque representa estructura y no un nombre.

Variantes sin ayuda visual: sumandos mayores, donde recorrer de a un paso deja de ser viable; el hueco en el primer sumando (`□ + 5 = 12`); el hueco a la izquierda del igual (`12 = □ + 5`); tres sumandos con el agrupamiento a elección. Después, desplazamientos no numéricos: dos casilleros en un tablero de colores, dos lugares en una fila de personas, dos marcas en un dial. Cuando el jugador resuelve todo eso sin pedir la línea, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguno aplica directamente. El ejemplo de cofres empieza con `chest_key`, que este nodo no usa, y el de frutas arranca en `alg.sys.two_by_two`. De este nodo salen las flechas que el ejemplo de vectores va a reusar, pero eso es transferencia, no niveles compartidos.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Girar lo que dice la tarjeta.** `concrete`, `manipulate`. Un solo sumando, tarjeta de puntos, rango chico, salida siempre desde una piedra del medio y nunca desde la orilla. La demostración se muestra acá.
2. **Decir antes de girar.** `concrete`, `recognize`. Misma dificultad; el jugador toca la piedra de llegada y la manivela gira después.
3. **Dos tarjetas.** `concrete`, `apply`. Dos sumandos encadenados y el orden a elección; aparecen las cadenas superpuestas en gris y el libro con dos filas.
4. **Flechas sobre la línea.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; el agua se va, el tramo se vuelve flecha arrastrable y se puede fundir con un pellizco. Aparecen las animaciones del igual como botón.
5. **El renglón al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión aparece junto a la línea y se transforma en sincronía; fichas con etiqueta. El renglón se escribe en los dos órdenes. Aparece `equals_as_operator`.
6. **La línea fantasma.** `symbolic` segunda mitad, `apply`. El renglón queda solo y la línea se pide con un toque. Parámetros: rango numérico mayor y el hueco en cualquiera de las tres posiciones.
7. **Pasos que no son números.** `formal` y `abstract`, `generalize`. Definición corta con voz; desplazamientos sobre casilleros de colores, filas de personas y diales.

Qué endurece cada parámetro: el rango numérico obliga a saltar de a grupos en vez de recorrer de a un paso; salir de una piedra del medio y no de la orilla es lo que impide contar desde el principio; el hueco en el primer sumando obliga a leer la expresión en vez de ejecutarla; el hueco a la izquierda del igual rompe la lectura "el resultado va a la derecha", que es la misconception del nodo; tres sumandos hacen que el agrupamiento sea una decisión con consecuencia de esfuerzo.

Desafíos de olimpíada: ninguno de [S](../S-desafios/S0-desafios.md) requiere este nodo hoy. El nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: el caminante en la piedra `6` y una ficha `+ 4`. Tocar la piedra `10` antes de que gire la manivela. Los distractores son la `4` (contar desde la orilla) y la `9` (contar la de partida como primer paso).
- `explain`: dos animaciones sobre `7 + 3`. En una el caminante recorre los tres pasos y el igual aparece cuando llega, sobre la piedra. En la otra toca el igual y salta al final sin recorrer nada. Tocar la que confunde el igual con una acción; elegirla clasifica como `equals_as_operator`.
- `manipulate`: caminante en la `5`, ficha `+ 6`. Girar la manivela hasta completar la tarjeta y ver el libro anotar los seis tics.
- `apply`: dos fichas seguidas, `+ 4` y `+ 3`, sobre la piedra `2`. Aplicar las dos y después tocar la ficha única, `+ 7`, que hubiera hecho el mismo viaje. Contra el tiempo objetivo del nodo.
- `generalize`: sin línea, el renglón `□ + 8 = 15`, y después `15 = 8 + □`. Arrastrar la ficha del hueco. Y un tablero de colores donde avanzar dos casilleros y después tres es lo mismo que avanzar tres y después dos.
- `transfer`: en la grilla de `linalg.vec.vector_as_displacement`, encadenar dos flechas punta con cola y tocar dónde termina el viaje. También en `geom.angle.turn_as_measure` (sumar giros en un dial) y en `graph.path.shortest_path` (la longitud de un camino como suma de tramos).

**Misconception esperada** ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `equals_as_operator`, categoría conceptual, patrón `replay_on_mechanic`. Aparece desde el nivel 5, cuando existe el renglón. Frente a `3 + 5 = □ + 2` el jugador pone `8`; frente a `□ = 4 + 6` se queda esperando. El juego reproduce los dos recorridos sobre la misma pista, cada uno desde su punto de partida, y las dos flechas terminan en piedras distintas. El estado sigue siendo válido —son dos viajes que no llegan al mismo lado— y el control vuelve con las dos flechas dibujadas. La narración es `misconceptions.equals_as_operator.prompt`, que hoy está escrito para la balanza del nodo 11 y menciona platos que en esta pista no existen.

Los distractores de `explain` y las opciones de `apply` se generan de la regla `detect` de esa misconception y de los desvíos físicos del nodo 2 —una piedra antes, una piedra después, contar desde la orilla—, no al azar.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_step_forward_adds`, nativa. La manivela gira, el punto avanza y la flecha del tramo crece detrás con su etiqueta; gramática `displace`, parametrizada por la posición de partida y el paso. Produce también las dos animaciones de `explain`, porque "el igual como botón" es la misma escena con el salto ejecutado sin recorrido.
- `ledger_join_two_piles`, nativa, al costado. Dos filas de objetos se funden en una y la cuenta aparece sola; gramática `partition`, parametrizada por las dos cantidades. Sostiene la propiedad del orden: juntar en un orden o en el otro es un parámetro suyo.
- Reusadas: `gear_track_numbers_in_order` y `gear_one_step_one_number` (nodo 2), para las variantes con la pista sin fichas y para las animaciones de paso irregular.
- Ninguna lleva texto rasterizado: los dígitos y el operador los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_step_sum`: `start_range`, que nunca incluye la orilla; `step_range` (chico en los niveles 1 a 5, mayor en el 6); `addends` (uno en los niveles 1 y 2, dos desde el 3, tres en el 7); `unknown_slot` en {resultado, primer sumando, segundo sumando}, con los dos últimos desde el nivel 6; `equation_side` en {izquierda, derecha}, desde el nivel 5; `seed`.
- `gen_pile_pair`: `a_range`; `b_range`; `unit_kind`; `join_order` en {a primero, b primero}, que produce las dos cadenas superpuestas; `seed`.
- `gen_nonnumeric_displacement`: espacios ordenados sin números —casilleros de colores, lugares en una fila, marcas de un dial— con dos tramos por instancia y el orden intercambiable. Solo en el nivel 7.

**Literacy soportada:** de `none` a `full_text`, con mínimo `none` aunque el nodo sea de nivel 1. Los dígitos y el `+` no son texto sino íconos con historia y el jugador vio nacer los dos; las tarjetas son de puntos hasta el nivel 4 y `explain` se resuelve entre animaciones ([Q](../Q-edad-universal.md)). En `symbolic` no hay escritura: se arrastran fichas desde el teclado de fichas. En `full_text` la definición corta del nivel 7 se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela tantas vueltas como puntos tiene la tarjeta; el caminante salta con cada clic, la flecha crece y el libro marca los tics. La escena vuelve al inicio y la tarjeta late. El gesto de girar no se vuelve a demostrar: es el del nodo 2. Sí tienen demostración propia el pellizco que funde dos flechas, en el nivel 4, y soltar una ficha sobre el renglón, en el nivel 5.

**Sin constantes propias.** Tiempo objetivo, factor de perfiles sin lectura, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
