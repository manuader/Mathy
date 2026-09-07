# La banda que vuelve (`arith.div.undo_mul`)

Minijuego del nodo 6 de la espina, "Dividir deshace el estirado". Mecánica principal `chest_key`, secundarias `tiles` y `grid_stretch`; analogías `rubber_band_stretch` y `sharing_into_plates`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/06-arith.div.undo_mul.md): un concepto, cuatro dificultades reales (elegir la vuelta de una escala, las dos lecturas de un mismo cociente, la vuelta que no existe, la vuelta que no cae en una marca), la analogía del nodo 5 continuada por su línea sin jugar, un gesto (deslizar la pieza de vuelta a lo largo de la banda), cinco pasos de desvanecimiento, el diagrama vertical como visualización, retiro del reparto primero y de la banda en `formal`. Acá se fija cómo se juega.

## Analogía

La misma banda del nodo anterior, clavada y estirada desde ayer, con un cofre cerrado en el extremo libre y tres piezas de vuelta abajo. Al costado, un piso terminado de baldosas con un solo lado acotado y, en los niveles de reparto, una fila de platos vacíos.

Mapa objeto → concepto: banda estirada → cantidad que ya fue multiplicada; extremo clavado → cero fijo; dejar que la banda vuelva → dividir; separación entre marcas → factor; pieza de vuelta → operación que deshace; cofre que se abre → el objeto quedó exactamente como estaba; banda colapsada contra el clavo → estirado sin vuelta. Del reparto: montón → dividendo; platos → divisor; una ronda de reparto → restar el divisor; cuánto quedó en cada plato → cociente; lo que sobra → resto; volver a juntar los platos → comprobación.

La banda aporta "por cuánto hay que volver"; el reparto, "en cuántas partes". Punto de ruptura de la banda: estirar hacia atrás del clavo, que es el nodo 7. Punto de ruptura del reparto: no hay medio plato, y por eso es la analogía de apoyo y no la principal ([G0](../G-analogias/G0-reglas.md)). El cofre está como objeto que valida, no como analogía del concepto: acá lo que se deshace es una escala, y la escala vive en la banda.

## Mecánica central

Superficie: la banda con su regla en la franja superior, el cofre en su extremo libre, las piezas de vuelta en la bandeja de abajo, el piso a la derecha. Gestos: `drag` y `tap`, con `pinch` opcional sobre la banda ([E0](../E-mecanicas/E0-catalogo.md)).

- **Deslizar una pieza de vuelta a lo largo de la banda.** La banda se acorta de forma continua mientras la pieza avanza y todas las cuentas convergen a la vez hacia sus marcas. El jugador suelta cuando cree que llegó.
- **Soltar en el punto exacto.** Las marcas caen sobre las marcas de la regla, el cofre gira y se abre, y muestra la banda como estaba.
- **Pasarse.** La banda queda más corta que el original y las cuentas por dentro de sus marcas. El cofre no cede; el estado se conserva y el jugador empuja en el otro sentido.
- **Recortar el extremo en vez de soltar.** El largo total puede coincidir con el objetivo, pero las cuentas quedan amontonadas contra el clavo y la regla debajo muestra la desalineación. El cofre no se abre. Ningún cartel lo dice: la desalineación es el mensaje.
- **Arrastrar una línea de corte sobre el piso.** Lo parte en filas. Si las filas quedan iguales, las líneas punteadas se vuelven continuas; si no, las baldosas sobrantes se separan del rectángulo y quedan apoyadas al costado.
- **Girar el piso y cortar por el otro lado.** El mismo rectángulo produce el otro cociente. Las dos lecturas quedan una sobre otra un instante.
- **Intentar volver de un estirado por cero.** Todas las piezas atraviesan el cofre sin engancharse. La banda colapsada no reacciona.
- **Tocar la banda recuperada.** La vuelve a estirar por el factor original y muestra que quedó como estaba antes de todo: la comprobación por multiplicación.

En `symbolic` la superficie cambia de forma, no de reglas: soltar la ficha del operador sobre una barra la encoge, aplicarla sobre una fila de fichas escribe el cociente al final, y aplicar una ficha de factor y su vuelta seguidas hace que las dos se anulen con un morph. La banda se pide tocando el cociente y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`inverse_restores_original` (cofre): la vuelta devuelve exactamente lo que había, no algo parecido. Se ve confirmarse cuando el cofre se abre solo y cuando el par de fichas se anula. Se ve romperse de dos maneras distintas y por eso el minijuego las separa: pasarse deja la banda corta con las marcas por dentro; recortar deja el largo bien y las marcas mal.

`lines_stay_lines_origin_fixed` (banda): al soltar, todas las marcas se mueven a la vez y el clavo no se mueve. Recortar el extremo rompe este invariante aunque acierte el largo, y esa es exactamente la distinción que el nodo enseña.

Un movimiento válido pero inútil —soltar la banda un poquito y volver a estirarla, o cortar el piso por donde ya estaba cortado— no rompe ningún invariante y recibe un empujón suave.

## Representación visual

Primitiva dominante `invert`, de apoyo `scale` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el taller al día siguiente, la banda tensa y el cajón donde solo entra si mide lo que medía. Solo se mira y se predice.
- `concrete`: banda con cuentas, regla, cofre, piezas de vuelta con forma, piso con un lado acotado, platos. Nada escrito.
- `visual`: la banda se vuelve barra y aparece el diagrama vertical al lado —barra corta arriba, flecha con el factor hacia abajo, barra larga abajo— con la vuelta dibujada como la misma flecha reproducida hacia atrás. El piso se estiliza sobre grilla con un lado acotado y el otro marcado como incógnita.
- `symbolic`: la fila con el total, el operador de división y el divisor, y el cociente como etiqueta del lado que faltaba. El glifo del operador lo elige el `MathLocale`.
- `formal`: la definición corta con voz y la banda fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Pieza con forma → pieza con factor: al abrir el cofre por primera vez en `visual`, la pieza pierde su forma y gana la etiqueta; la forma queda un rato como sombra.
2. Flecha de vuelta → operador: el arco que sube en el diagrama vertical se contrae en la ficha del operador de división con su factor al lado.
3. Piso partido → fila de fichas: al cerrar un corte en filas iguales, el rectángulo se contrae en la fila con total, operador y lado conocido, y el lado que faltaba aparece como etiqueta; el rectángulo queda como marca de agua.
4. Dos cortes, dos lecturas: al partir el mismo piso por el otro lado, la fila se reescribe con los números intercambiados y las dos quedan una sobre otra mientras el piso gira entre ellas.
5. Par de fichas: aplicar una ficha de factor y su vuelta seguidas las junta y las anula con un morph; la barra queda como estaba y las dos fichas desaparecen juntas.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la banda fantasma: dividir por un número es deshacer el estirado por ese número; el cociente es el lado que le falta a un rectángulo del que se conoce el total y un lado; el único estirado sin vuelta es el que multiplica por cero. Propiedades: dividir deshace multiplicar en cualquier orden; multiplicar de vuelta comprueba la división; un mismo piso responde dos preguntas según por dónde se corte. Casos especiales: dividir por 1 no toca la banda, dividir un número por sí mismo la deja en una marca, dividir por cero no tiene pieza, y el reparto inexacto deja baldosas al costado que este nodo nombra sin resolver. Símbolo nuevo: el operador de división, que nace de la flecha que sube en el diagrama vertical. El signo de igual aparece y el nodo no lo introduce. Lo que sí aporta es una convención de escritura: el mismo renglón sirve para las dos lecturas del cociente, y que sean la misma es un descubrimiento del jugador al girar el piso.

## Generalización

El reparto en platos se retira en cuanto el divisor deja de ser un número de platos posibles. La banda se queda como fantasma a demanda hasta `formal`, y el cofre se queda como objeto que valida.

Variantes sin ayuda visual: divisores de una cifra sobre totales de dos; el mismo total con dos divisores distintos, para separar las lecturas; división por 1 y del número por sí mismo mezcladas sin aviso; división por cero mezclada con las anteriores; repartos con sobrante, planteados y no resueltos. Después, vueltas que no son estirados: una figura que se rotó, una fila que se permutó, un color que se cambió. El jugador señala qué devuelve el objeto a su estado inicial y qué no tiene vuelta. Cuando elige el factor de vuelta sin dibujar nada y distingue "no tiene vuelta" de "no da entero", la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): el nivel 2 del ejemplo de cofres —los colores son transformaciones, y la llave roja parte en tres lo que el cofre rojo triplicó— es este nodo jugado con la piel de aquel ejemplo. Del 3 en adelante son de `arith.expr.precedence_tree` y del nodo 12 en adelante.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **La banda vuelve.** `concrete`, `manipulate`. Una sola pieza de vuelta, la correcta, y el objetivo marcado en la regla. Factores de 2 a 5.
2. **Tres piezas.** `concrete`, `recognize` y `manipulate`. La bandeja trae la pieza correcta, un factor vecino y una pieza que corta el extremo. Aparece el error de recortar.
3. **El piso al que le falta un lado.** `concrete`, `apply`. Cortar el rectángulo en filas iguales; el mismo piso se corta por los dos lados. Aparecen los repartos con sobrante.
4. **Barras y flechas.** `visual`, `explain` y `manipulate`. El diagrama vertical con la flecha de ida y la de vuelta; misma dificultad numérica.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La fila con el operador aparece junto al piso y se transforma en sincronía; las piezas llevan etiqueta.
6. **Números difíciles.** Parámetros: totales de dos y tres cifras, divisores hasta 12, y el mismo total repetido con divisores distintos. La banda se pide como fantasma.
7. **La banda que no vuelve.** `formal` y `abstract`, `generalize`. El estirado por cero mezclado sin aviso, división por 1 y por sí mismo, y vueltas que no son aritméticas. Definición corta con voz.

Qué endurece cada parámetro: el rango de divisores obliga a leer el factor en la separación de marcas y no en el largo total; repetir el total con dos divisores separa las dos lecturas del cociente; el sobrante rompe la expectativa de que dividir siempre cierra y prepara `arith.div.remainder`; el divisor cero mezclado sin aviso es lo único que distingue reconocer la estructura de aplicar un procedimiento.

Desafíos de olimpíada: el nodo no declara `challenges` y por lo tanto no exige desafío para `mastered` ([K](../K-evaluacion.md)). La estructura reaparece como paso intermedio en `ch.arith.plates_hidden_remainder`, donde hay que completar filas de platos iguales bajo una tapa ([S](../S-desafios/S0-desafios.md)).

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: una banda estirada por un factor visible y cuatro piezas de vuelta. Tocar la que la devuelve a su largo original.
- `explain`: dos animaciones sobre la misma banda, una donde se encoge y todas las marcas vuelven a su lugar y otra donde se le recorta el extremo y el largo coincide pero las marcas no. Tocar la que no es la vuelta del estirado.
- `manipulate`: arrastrar la pieza de vuelta sobre el cofre y ajustar hasta que las marcas coincidan con la regla; después partir el rectángulo en filas iguales.
- `apply`: un rectángulo con un lado conocido; tocar la ficha del otro lado sin desarmarlo, contra el tiempo objetivo del nodo.
- `generalize`: el estirado por cero mezclado con estirados normales; arrastrar al cofre la ficha que dice que no hay vuelta cuando corresponde. Y una figura rotada: tocar la acción que la devuelve.
- `transfer`: en la grilla de `linalg.map.inverse_and_systems`, aplicar la deformación que devuelve la cuadrícula estirada a la original. También en `geom.sim.similarity_as_scale` (el factor entre dos figuras semejantes) y `prob.basic.probability_as_proportion` (la parte de la urna que corresponde a un color).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)): el nodo no declara ninguna. Los tres errores frecuentes se resuelven dentro del objeto, sin patrón y sin clasificar: recortar en vez de soltar (marcas desalineadas, cofre cerrado), pasarse de vuelta (cuentas por dentro de sus marcas) e insistir con el estirado por cero (ninguna pieza engancha; después de dos intentos aparece al lado un caso con vuelta, para que la diferencia se vea por contraste).

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de las misconceptions de los prerequisitos directos, más variaciones del factor de vuelta y la pieza que corta.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_shrink_key_undoes_stretch`, nativa. La barra estirada se encoge de forma continua con el extremo fijo, una llave mide el mismo tramo antes y después, el diagrama vertical dibuja la flecha de bajada y su vuelta, y el cofre gira al cerrarse el circuito; gramática `invert`. Parametrizada por factor y largo; cambiando qué parte de la barra se acorta produce las dos animaciones de `explain`.
- `tile_split_rectangle_into_rows`, nativa. Las líneas de corte punteadas se vuelven continuas cuando las filas quedan iguales y las baldosas sobrantes se separan del rectángulo; gramática `scale` con apoyo de `partition`. Parametrizada por total y filas, produce las instancias de `apply`.
- Reusadas: las escenas de la banda del nodo 5 como estado de partida de cada instancia.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_undo_stretch`: `factor` (2 a 5 en los niveles 1 a 5, hasta 12 en el 6, con 0 y 1 desde el 7); `band_marks` (2 a 4 cuentas); `piece_set` desde los distractores (factor vecino, pieza que corta, factor correcto); `target_as` en {marca, ficha}; `seed`.
- `gen_split_rectangle`: `total` y `known_side` por rango según nivel; `cut` en {por filas, por columnas, los dos}; `allow_leftover` (falso hasta el nivel 3); `seed`.
- `gen_no_inverse_case`: instancias sin vuelta (estirado por cero) y acciones no aritméticas con y sin vuelta, una de cada por tanda.

**Literacy soportada:** de `none` a `full_text`. El mínimo es `none` en todos los niveles: las piezas se distinguen por forma antes que por etiqueta, el objetivo puede darse como marca en la regla, `explain` se resuelve entre animaciones y el caso sin vuelta se reconoce porque la banda no reacciona. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma la pieza correcta y la desliza a lo largo de la banda hasta que las cuentas caen sobre sus marcas; el cofre se abre. La escena vuelve al inicio y la bandeja de piezas late. La demostración de arrastrar líneas de corte sobre el piso se muestra la primera vez que aparece el rectángulo; la de armar el rectángulo no se repite, es la del nodo 5 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
