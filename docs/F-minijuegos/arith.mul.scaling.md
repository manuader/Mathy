# La banda y el piso (`arith.mul.scaling`)

Minijuego del nodo 5 de la espina, "Multiplicar es estirar". Mecánica principal `tiles`, secundarias `grid_stretch` y `gears_sequence`; analogías `rubber_band_stretch` y `tile_floor`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/05-arith.mul.scaling.md): un concepto con dos caras, cuatro dificultades reales (el factor es una razón, estirar y embaldosar son lo mismo, anticipar sin ejecutar, aceptar factores que no agrandan), dos analogías que se cubren mutuamente los bordes, un gesto (el pellizco), cuatro morphs hasta `3 × 5`, el estirado y el rectángulo como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una banda elástica marcada, clavada de un extremo, con una ficha objetivo sobre una de sus marcas. Abajo, un montón de baldosas cuadradas y un marco de patio vacío. Al costado, la manivela del nodo 3 con un segundo engranaje enganchado.

Mapa objeto → concepto (banda): banda marcada → recta numérica; marca → número; estirar k veces → multiplicar por k; dejar que se encoja → dividir por k; extremo clavado → el cero, que no se mueve; estirar menos que el original → multiplicar por una fracción.

Mapa objeto → concepto (piso): fila de baldosas → primer factor; columna → segundo factor; baldosa suelta → unidad; piso entero → producto; dar vuelta el piso → conmutatividad; piso con columnas faltantes → división; partir el piso en tiras → productos parciales.

La banda soporta factores fraccionarios y el piso no; el piso hace visible la conmutatividad y la banda no. Puntos de ruptura: `negative_scaling_flips` en la banda, `non_integer_sides` en el piso. Las dos se retiran en `symbolic`. `gears_sequence` no trae analogía: trae el puente desde el nodo 3, el paso constante repetido ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la banda cruza la mitad superior con su clavo a la izquierda, el marco del patio ocupa la mitad inferior, el montón de baldosas queda al costado y la manivela con su par de engranajes abajo a la izquierda. Gestos: `pinch`, `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)). Las baldosas y el extremo de la banda son del tamaño de un token.

- **Pellizcar la banda.** Mientras se estira, un cursor sigue la marca que importa y las demás marcas se separan a la vez, con inercia. El extremo clavado no se mueve.
- **Soltar antes de llegar.** La banda se queda donde está. El estado no se borra y se puede seguir estirando.
- **Estirar de más.** La marca pasa la ficha objetivo y la banda vibra levemente. Nada se llama incorrecto: el jugador vuelve con el mismo gesto.
- **Arrastrar la banda entera.** Se corre y vuelve sola al clavo. El desplazamiento no es una acción de esta mecánica, y el clavo lo dice sin palabras: es la frontera con el nodo 3.
- **Arrastrar filas de baldosas al marco.** Al soltar dos filas contiguas se funden con un chasquido y las líneas interiores se atenúan: son un rectángulo, no dos filas. Cuando el marco queda cubierto, el borde se ilumina.
- **Toque sostenido sobre el piso.** Levanta el rectángulo entero y lo gira un cuarto de vuelta: las filas se vuelven columnas, el marco se adapta y la ficha del total no cambia. Es el gesto de la conmutatividad y nadie lo nombra.
- **Cortar el piso.** Un trazo entre dos columnas lo parte en dos tiras; juntarlas devuelve el mismo total. Es la semilla de los productos parciales y de la distributiva.
- **Girar la manivela con el par de engranajes.** Cada vuelta mueve la ficha tres casillas en vez de una. El jugador cuenta vueltas, no pasos: es la entrada desde el desplazamiento.
- **Tocar la marca antes de soltar.** Desde los niveles altos: el jugador anticipa dónde va a caer el extremo y después ejecuta. Si acertó, la marca destella al llegar.

## Invariante matemático

Tres invariantes, uno por mecánica.

`area_preserved_under_rearrangement` (`tiles`): ninguna baldosa desaparece al reacomodar. Se ve confirmarse al girar el piso y al cortarlo en tiras y volver a juntarlo: la ficha del total no se mueve. Se ve romperse cuando el jugador arrastra la ficha del total sin armar el rectángulo y el juego coloca esa cantidad de baldosas en el marco: queda un hueco.

`lines_stay_lines_origin_fixed` (`grid_stretch`): todas las distancias al clavo quedan multiplicadas por el mismo factor y el clavo no se mueve. Se ve romperse en el distractor de `explain`, donde solo el extremo se mueve y las marcas del medio quedan quietas: eso no es estirar, es deformar.

`same_step_every_turn` (`gears_sequence`): cada vuelta de manivela mueve lo mismo, sea uno o tres. Es lo que hace que el engranaje enganchado sea multiplicar y no otra cosa.

Un movimiento válido pero inútil (estirar por 1, armar el piso de una sola fila cuando el factor es mayor, girar el piso dos veces) no rompe nada: el juego lo permite y, si se repite, la ficha objetivo late como empujón suave.

## Representación visual

Primitiva dominante `scale`, de apoyo `partition` cuando el piso se parte en tiras ([H](../H-progresion-abstraccion.md)).

- `real`: el patio y las baldosas apoyadas contra la pared, en filas desparejas; se acomodan solas y el patio queda cubierto o queda un borde pelado. Solo se mira.
- `intuition`: tres filas de cinco separadas y la mano que se acerca; tres desenlaces dibujados (rectángulo sin sobrante, rectángulo más largo y flaco con el mismo total, rectángulo con baldosas de sobra) y después el real. En la variante de banda, dos desenlaces: el dibujo se agranda entero, o queda igual y solo se corre.
- `concrete`: la banda con su clavo y sus marcas, las baldosas, el marco, la manivela con dos engranajes. Nada escrito.
- `visual`: la banda se estiliza en un segmento con marcas equiespaciadas y un punto grueso en el clavo; estirar es cada marca alejándose del punto grueso en la misma proporción. Las baldosas se funden en un rectángulo sobre una grilla tenue, con una llave de longitud en cada lado que se estira con él.
- `symbolic`: `3 × 5` sobre el contorno del piso y la ficha del total al borde; en la banda, el factor como ficha entre el número de partida y la marca de llegada.

No hay signo de igual, ni factores negativos, ni lados que no sean un número entero de baldosas. La banda sí admite estirados menores que el original desde el nivel medio.

## Transición simbólica

Cuatro pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Fila de baldosas → llave con número: al cubrir el marco entero por primera vez en `concrete`, las baldosas del borde superior se atenúan y una llave se dibuja sobre ellas, que se contrae hasta ser el numeral del nodo 1. Lo mismo del lado izquierdo.
2. Rectángulo → ficha del total: al girar el piso por primera vez, el interior se aplana en una ficha con el total que sale volando al borde; el rectángulo queda como contorno y la ficha lo conserva como sombra.
3. Dos llaves juntas → el signo `×`: cuando el jugador arma dos pisos con las mismas etiquetas cambiadas de lado y ve que el total no cambia, las llaves se acercan y entre ellas aparece una cruz que hereda el trazo del cruce de las líneas de la grilla.
4. Estirado → el mismo `×`: al soltar la banda en la marca objetivo, el tramo estirado se contrae en una ficha con el factor, y entre el número de partida y esa ficha aparece la misma cruz. Es la única vez que el minijuego afirma que sus dos caras son una, y lo hace con un morph.

## Concepto formal

Lo que queda al final, como texto corto con voz y el piso al lado: multiplicar dos números es armar el rectángulo que tiene a uno como filas y al otro como columnas, y contar las baldosas; multiplicar por un factor es estirar por ese factor, con cada distancia al cero multiplicada y el cero quieto; el orden de los dos números no cambia el resultado. Casos verificados sobre el objeto: estirar por 1 deja la banda igual; estirar por 0 la aplasta contra el clavo y el piso queda sin filas; un factor menor que 1 encoge, y eso solo lo dibuja la banda.

El símbolo nuevo es el `×`, y el problema que lo hace necesario es de registro: anotar un piso que ya no está en pantalla. Dibujar quince baldosas es tedioso; dos llaves con sus numerales alcanzan para reconstruirlo, y la cruz dice que hay que armarlo, no juntarlos. No hay igual todavía: nace en `prealg.eq.balance`. Las dos entradas de cheatsheet, `cs.arith.mul_as_scaling` y `cs.arith.mul_by_one_and_zero`, quedan como imagen con voz.

## Generalización

El piso se retira primero, en cuanto el jugador arma `3 × 5` sin mirar el marco: compite con la expresión y además no soporta el nivel siguiente. La banda se queda un poco más, a demanda, porque sostiene los factores fraccionarios y porque el nodo 6 la necesita entera.

Variantes sin ayuda visual: factores mayores que la grilla, donde el rectángulo no se cuenta de un vistazo; factor 1 y factor 0; factores fraccionarios simples sobre la banda; el mismo producto pedido en los dos órdenes. Después, estirados arbitrarios: una banda con tres dibujos y una banda objetivo con los mismos tres dibujos más separados, para llevar una a la otra con un solo pellizco. Cuando el jugador anticipa sin ejecutar, arma el rectángulo en los dos órdenes sin sorpresa, distingue el factor 0 del 1 y resuelve el estirado arbitrario sin marcas numeradas, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguna directa. El piso que se corta en tiras es el objeto del ejemplo de la distributiva, que pertenece a `alg.expr.distributive_tiles`; acá se juega el gesto sin escribirlo.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Tres casillas por vuelta.** `concrete`, `manipulate`. Solo la manivela con el par de engranajes, sobre la pista del nodo 3. Factores de 2 a 4. Es el puente de entrada.
2. **Filas que se funden.** `concrete`, `manipulate`. Aparecen las baldosas y el marco. Cubrir el patio con filas iguales; el chasquido y el borde iluminado.
3. **Dar vuelta el piso.** `concrete`, `recognize` y `explain`. Mismos parámetros; el toque sostenido que gira, y la animación que miente sobre la banda (solo el extremo se mueve).
4. **La banda.** `concrete` hacia `visual`, `manipulate`. Pellizcar hasta la ficha objetivo; el clavo que devuelve la banda arrastrada.
5. **Llaves y cruz.** `symbolic` primera mitad, `manipulate` y `apply`. Las llaves con numeral, la ficha del total, el `×`. El piso se transforma en sincronía con la expresión.
6. **Piso fantasma.** `symbolic` segunda mitad, `apply`. La expresión queda sola; el piso se pide con un toque. Factores mayores que la grilla.
7. **Uno, cero y fracciones.** Parámetros: factor 1, factor 0, y factores fraccionarios simples sobre la banda, que el piso no dibuja. Anticipar tocando la marca antes de soltar.
8. **Bandas sin números.** `visual` con las analogías retiradas, `generalize`. Estirados arbitrarios y el borde de la banda que se da vuelta, donde aparece `negative_times_negative`.

Qué endurece cada parámetro: el rango obliga a armar el rectángulo en vez de contar baldosas; el factor 0 y el 1 rompen la lectura "multiplicar es hacer más"; las fracciones separan escalar de repetir y expulsan al piso; los dos órdenes comprueban que no se está leyendo un dibujo memorizado; los estirados sin números separan la estructura del numeral.

Desafíos de olimpíada: el nodo participará en los desafíos de aritmética y de área de [S](../S-desafios/S0-desafios.md), aún no escritos, donde un producto aparece como paso intermedio de un problema con datos ocultos. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: una banda en su estado original y tres bandas ya estiradas; una ficha muestra el factor `3`. Tocar la que se estiró esa cantidad de veces. Distractores: el factor vecino y una banda desplazada en vez de estirada.
- `explain`: dos animaciones sobre la misma banda; en una se estira tres veces y cada marca se separa igual, en la otra solo el extremo se mueve y las marcas del medio quedan. Tocar la que no escala. El distractor elegido clasifica como confusión entre escalar y desplazar.
- `manipulate`: pellizcar la banda hasta que el cursor toque la ficha objetivo, y después armar con baldosas el rectángulo que muestra el mismo producto en filas.
- `apply`: filas de baldosas sueltas; armar el rectángulo y arrastrar la ficha con el total sin contar baldosa por baldosa. Cuatro instancias seguidas contra el tiempo objetivo del nodo.
- `generalize`: el estirado con un factor fraccionario simple y con cero; anticipar cuánto va a medir la banda tocando la marca antes de soltar. Y la banda de tres dibujos que hay que llevar a la banda objetivo de un pellizco.
- `transfer`: sobre el piso geométrico de `geom.area.rect_and_triangle`, tocar el área que resulta de duplicar un solo lado. También en `geom.sim.similarity_as_scale`, `linalg.vec.span_and_combination` y `calc1.int.accumulation`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `negative_times_negative`, patrón `double_flip`. Aparece en el nivel 8, cuando la banda se da vuelta por primera vez. El catálogo declara el patrón sobre `slope_walker`, que no está entre las mecánicas del nodo, así que corre sobre el caminante heredado del nodo 3: está en el origen mirando a la derecha, la primera vuelta lo pone mirando a la izquierda y avanza, la segunda lo devuelve a mirar a la derecha y avanza más. La respuesta del jugador queda dibujada como una bandera del lado equivocado. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?". El jugador vuelve a girar desde el estado real. Es la única que clasifica.

Sin entrada declarada por este nodo, y por eso sin bloquear su `ready`: confundir estirar con desplazar (el distractor de `explain` y el gesto que el clavo bloquea; el juego reproduce los dos movimientos superpuestos con las marcas iluminadas, y no tiene entrada en el catálogo) y sumar los dos factores (el juego coloca esa cantidad de baldosas en el marco y queda un hueco, como `missing_piece_tiles` sobre `tiles`; su entrada `factors_added_not_multiplied` la declara `arith.mul.rows_and_columns` y llega al clasificador desde el vecindario conceptual).

Los distractores de `explain` y las opciones de `recognize` se generan desde la regla `detect` de `negative_times_negative` y desde estos dos patrones, más el factor vecino.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_rows_become_rectangle`, nativa. Filas sueltas que se funden en un rectángulo con las líneas interiores atenuadas, llaves que crecen sobre los dos lados y la ficha del total contando desde cero; gramática `scale`. Parametrizada por filas y columnas, produce la mecánica de los niveles 2, 3, 5 y 6, los ítems de `apply` y el giro del piso.
- `grid_stretch_by_factor`, nativa. El segmento con marcas que se separan mientras un valor sube, con el punto clavado quieto; parametrizada por el factor y por la longitud, produce los ítems de `recognize`, las dos animaciones de `explain` y el estirado fraccionario de `generalize`.
- Reusada: `gear_step_forward_adds` (nodo 3), con el par de engranajes, para el nivel 1 y para el replay de `double_flip`. Los numerales y la cruz los dibuja el runtime; la banda, el clavo y las baldosas son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_tile_floor`: `rows` y `cols` (de 2 a 5 en los niveles 2 a 5, hasta 12 en el 6); `orientation` en {rows, cols}; `cut` (cantidad de tiras en que se puede partir, 0 hasta el nivel 4); `show_keys` (falso hasta el nivel 4); `seed`.
- `gen_stretch_band`: `factor` (entero de 2 a 5 hasta el nivel 6; también 1 y 0 desde el 7; fracciones simples desde el 7); `length` (marcas de la banda); `target_mark`; `anticipate` (pedir la marca antes de soltar, verdadero desde el nivel 7); `flip` (permitir dar vuelta la banda, solo en el nivel 8); `skin` en {numbered, drawings} (`drawings` solo en el 8).
- `gen_gear_pair`: `teeth_ratio` (casillas por vuelta, de 2 a 4); `turns`; solo en el nivel 1 y en los replays.

**Literacy soportada:** `none` en todos los niveles. Los numerales y la cruz son dibujos, no texto; la definición corta existe como voz sobre el piso y aparece escrita solo en perfiles con lectura, sin cambiar ningún ítem. `explain` se resuelve entre animaciones.

**Instrucción por demostración:** la primera vez, una mano fantasma toma el extremo libre de la banda y lo lleva hasta que la primera marca cae sobre la ficha objetivo, y suelta: las marcas quedan separadas y el clavo no se movió. Repite una vez y desaparece. La demostración de las baldosas (nivel 2) es nueva y se muestra una vez: la mano arrastra dos filas contiguas al marco y se funden con un chasquido. La del giro del piso (nivel 3) también, con un toque sostenido. La de la manivela no se repite: es la del nodo 3 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
