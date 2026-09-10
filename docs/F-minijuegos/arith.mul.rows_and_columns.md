# El piso que gira (`arith.mul.rows_and_columns`)

Minijuego del nodo 47 de la espina, "Filas por columnas, da igual". Mecánica única `tiles`; analogía `tile_floor`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/47-arith.mul.rows_and_columns.md): un concepto, cuatro dificultades reales (girar no cambia el total, un total admite varios rectángulos, agrupar tres factores, no sumar los lados), una analogía cuyo gesto **es** la propiedad, un gesto (el toque sostenido que levanta el piso y lo gira), cuatro morphs hasta `3 × 5 × 4` sin paréntesis, el rectángulo como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un depósito con un lote de baldosas apiladas y dos marcos de patio con los lados cambiados de lugar: uno ancho y bajo, otro angosto y alto. Sobre cada marco, las dos llaves de longitud que nacieron en el nodo 5, todavía vacías. Más tarde, el lote sin ningún marco, y después cajas iguales que se apilan.

Mapa objeto → concepto: fila de baldosas → primer factor; columna → segundo factor; baldosa suelta → unidad; piso entero → producto; **dar vuelta el piso → conmutatividad**; partir el piso en tiras y volver a juntarlo → agrupar de otra manera; capas de cajas iguales → tercer factor; silueta guardada de un rectángulo → una forma posible del total; piso con columnas faltantes → división.

`tiles` aporta todo: el rectángulo, el corte, el giro y el invariante de que ninguna baldosa desaparece al reacomodar. La banda elástica del nodo 5 no participa: girar una banda no significa nada, y las fracciones que la banda sostiene quedan fuera de este nodo. Punto de ruptura: `non_integer_sides`, un lado que no es un número entero de baldosas. Se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el lote de baldosas al costado, los marcos en el centro, las llaves de longitud sobre los lados de cada marco y la ficha del total en el borde. Gestos: `drag`, `tap` y `hold` ([E0](../E-mecanicas/E0-catalogo.md)). El `pinch` del nodo 5 no aparece: acá nada se estira. El toque sostenido tiene alternativa de arrastre por manija, como pide el catálogo.

- **Arrastrar filas de baldosas al marco.** Al soltar dos filas contiguas se funden con un chasquido y las líneas interiores se atenúan. Cuando el marco queda cubierto, el borde se ilumina y la ficha del total aparece contando desde cero.
- **Toque sostenido sobre el piso.** Lo levanta entero y lo gira un cuarto de vuelta: las filas se vuelven columnas y las dos llaves de longitud giran pegadas a sus lados hasta quedar cambiadas. La ficha del total viaja con el piso y nunca cambia de número. Este es el gesto del nodo.
- **Soltar el piso girado sobre el marco que no le corresponde.** No se rechaza: se apoya, y las baldosas que no entran quedan afuera del borde, contadas. El estado sigue siendo válido y el jugador gira de nuevo.
- **Cortar el piso.** Un trazo entre dos columnas lo parte en dos tiras; arrastrar una tira a continuación de la otra lo rehace. La ficha del total no se mueve en ninguno de los dos pasos.
- **Armar rectángulos con el lote suelto.** Sin marco: el jugador acomoda todas las baldosas en filas iguales y la silueta se guarda al costado. Dos rectángulos que son el mismo girado se apilan en una sola silueta con una marca de giro.
- **Apilar cajas iguales.** Con tres factores, el jugador elige qué par junta primero. El juego dibuja las dos rutas una al lado de la otra hasta que las dos fichas del total coinciden.
- **Correr la franja de agrupación.** En `symbolic`, una franja translúcida cubre dos de los tres numerales y se arrastra de un par al otro. La ficha del total no cambia, y a la tercera vez la franja se desvanece sola.

En `symbolic` la superficie cambia de forma, no de reglas: arrastrar un factor sobre el otro es girar el piso, y correr la franja es rearmar las capas. El piso se pide con un toque y aparece como fantasma.

## Invariante matemático

Un invariante, el de la única mecánica.

`area_preserved_under_rearrangement` (`tiles`): ninguna baldosa desaparece al reacomodar, ni al girar, ni al cortar, ni al apilar. Se ve confirmarse tres veces, y las tres son el contenido del nodo: al girar el piso (las llaves se mudan, la ficha del total no), al cortarlo en tiras y volver a juntarlo, y al rearmar el bloque de capas con la otra agrupación.

Se ve romperse cuando el jugador arrastra la ficha del total sin armar el rectángulo: el juego coloca esa cantidad de baldosas en el marco y queda un hueco. Es el caso de `factors_added_not_multiplied`, y el hueco es el mensaje.

Un movimiento válido pero inútil (girar el piso dos veces, cortar y volver a juntar sin necesidad, armar la silueta de un rectángulo que ya está guardada) no rompe nada: el juego lo permite y, si se repite, la ficha del total late como empujón suave.

## Representación visual

Primitiva dominante `scale`, de apoyo `partition` cuando el piso se parte en tiras y cuando el lote se reparte en rectángulos distintos ([H](../H-progresion-abstraccion.md)).

- `real`: el depósito y los dos patios; las baldosas se acomodan solas en el primero y después viajan al segundo. Solo se mira.
- `intuition`: dos escenas. En la primera, la escena se detiene antes del segundo patio y hay tres desenlaces (sobran, faltan, entra justo). En la segunda, cuatro cajas de tres por dos se van a apilar y hay dos desenlaces según el orden de armado; el jugador elige cuál deja más baldosas y descubre que dejan lo mismo. Es la única pregunta de `intuition` del nodo cuya respuesta es "las dos".
- `concrete`: las baldosas, los dos marcos, el chasquido de las filas al fundirse, el borde iluminado y el giro. Nada escrito.
- `visual`: el piso se estiliza en un rectángulo sobre una grilla tenue con una llave de longitud en cada lado. Girar es una rotación de un cuarto de vuelta del rectángulo entero con las llaves pegadas a sus lados; lo que se ilumina en el antes y el después es la ficha del total, idéntica. Los tres factores son un rectángulo base repetido en capas con un desplazamiento chico, para que se vean como capas y no como un cuerpo nuevo.
- `symbolic`: `3 × 5` sobre el contorno del piso, y `3 × 5 × 4` con la franja translúcida que se corre y después se va.
- `formal`: la definición corta con voz y el piso al lado.

No hay paréntesis, ni igual, ni factores negativos, ni lados que no sean un número entero de baldosas. El total no se apoya sobre ninguna recta: acá el producto es un montón, no un lugar.

## Transición simbólica

Cuatro pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Piso girado → dos llaves que se intercambian: al girar por primera vez un piso ya etiquetado en `visual`, las dos llaves con sus numerales giran con él y quedan cambiadas de lado, mientras la ficha del total se queda quieta.
2. Dos productos → un producto: al armar el segundo piso con las etiquetas cambiadas, `3 × 5` y `5 × 3` se acercan y se superponen, y las dos fichas del total se funden en una. Tocando la expresión se separan de nuevo.
3. Capas → tres factores en fila: al armar el bloque, la ficha del total de cada capa se desvanece y queda el numeral de la cantidad de capas, con la misma cruz del nodo 5 entre él y el rectángulo base: `3 × 5 × 4`. La agrupación se dibuja como una franja translúcida sobre dos de los tres numerales.
4. Franja que se corre → franja que se va: cuando el jugador la corre de un par al otro y la ficha del total no cambia, la franja se desvanece sola. Queda `3 × 5 × 4` sin ninguna marca de agrupación, y esa ausencia es el resultado del nodo.

Sin símbolos nuevos: el `×` nació en el nodo 5 y los numerales en el 1. Lo que el nodo aporta son dos convenciones de escritura, y las dos tienen su problema. Que un producto no diga cuál factor fue filas: hay que pedir baldosas para un patio cuya orientación todavía no se decidió, y guardar la orientación obligaría a pedir dos veces. Que tres factores se escriban sin paréntesis: los paréntesis todavía no existen, nacen en `arith.expr.precedence_tree` para indicar qué se hace primero, y acá justamente no importa. La franja translúcida es un paréntesis que el minijuego prueba y descarta delante del jugador.

## Concepto formal

Lo que queda al final, como voz sobre el piso, sin texto escrito porque el nodo es `literacy: none`: el orden de los dos factores no cambia el producto, que es el mismo piso girado; agrupar tres factores de cualquier manera tampoco lo cambia, que son las mismas baldosas en otras capas; un mismo total admite varios rectángulos, y a veces uno solo. Casos verificados sobre el objeto: el piso de una sola fila es el factor 1 y girarlo lo deja igual de largo, parado; el marco sin filas es el factor 0 y girarlo es la única forma de girar que no se ve; un total que solo admite el rectángulo de una fila es un número que no se puede repartir en filas iguales, lo que `arith.num.factor_tree` llamará primo. Las dos entradas de cheatsheet, `cs.arith.mul_order_irrelevant` y `cs.arith.mul_grouping_irrelevant`, quedan como imagen con voz.

## Generalización

El piso se retira en `symbolic`, cuando el jugador gira una expresión escrita arrastrando un factor sobre el otro sin mirar el marco, y sobre todo cuando aparece el tercer factor, que el plano ya no dibuja cómodo.

Variantes sin ayuda visual: factores mayores que la grilla, donde el rectángulo no se cuenta de un vistazo; el 1 y el 0 en cualquiera de los dos lugares; tres factores con las dos agrupaciones pedidas seguidas; el mismo producto pedido en los dos órdenes. Después, lotes arbitrarios: montones de fichas de colores, de puntos sueltos y de siluetas que no encajan entre sí, donde el jugador dice cuántos rectángulos admite el montón y reconoce los que son el mismo girado, sin poder apoyar nada en una grilla. Cuando intercambia dos factores sin pedir el piso, agrupa tres sin sorpresa, distingue un total con un solo rectángulo de uno con varios y no confunde el total con la suma de los lados, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): ninguna directa. El piso que se corta en tiras es el objeto del ejemplo de la distributiva, que pertenece a `alg.expr.distributive_tiles`; acá el corte se hace y no se escribe, y el corte que se corre hasta la décima columna es lo que abre `arith.mul.partial_products`.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cubrir el marco.** `concrete`, `manipulate`. Filas de baldosas al marco, el chasquido y el borde iluminado. Factores de 2 a 5. Es la entrada heredada del nodo 5.
2. **Levantar y girar.** `concrete`, `manipulate` y `recognize`. Aparece el toque sostenido que gira y el segundo marco con los lados cambiados. Mismos factores.
3. **La ficha que no se mueve.** `concrete`, `explain`. Mismos parámetros; el ítem es elegir la animación que miente sobre el giro. Aparece `factors_added_not_multiplied`.
4. **Todas las formas del lote.** `concrete`, `apply`. Aparece el lote sin marco y las siluetas guardadas; dos rectángulos girados se apilan en una.
5. **Llaves y cruz que se dan vuelta.** `symbolic`, `manipulate` y `apply`. Las llaves con numeral, la expresión al lado, y girar arrastrando un factor sobre el otro. El piso se transforma en sincronía.
6. **Pisos grandes, uno y cero.** Parámetros: factores mayores que la grilla, y el 1 y el 0 en cualquiera de los dos lugares. El piso se pide con un toque.
7. **Tres factores.** Parámetros: tres factores en vez de dos, con las dos agrupaciones pedidas seguidas. Aparece la franja translúcida.
8. **Lotes arbitrarios.** `formal` y `abstract`, `generalize`. Definición corta con voz; montones de unidades que no encajan entre sí y sin grilla donde apoyarlas.

Qué endurece cada parámetro: el rango obliga a armar el rectángulo en vez de contar baldosas; el 1 y el 0 rompen la lectura "multiplicar es hacer más" ya sin la banda que los hacía espectaculares; el tercer factor rompe la lectura "un producto es un rectángulo"; los dos órdenes comprueban que no se está leyendo un dibujo memorizado; los lotes sin grilla separan la estructura del dibujo.

Desafíos de olimpíada: el nodo participa en `ch.arith.count_rectangles_divisors` de [S](../S-desafios/S0-desafios.md), donde hay que contar cuántos rectángulos distintos tienen un área dada; el dato oculto es la factorización, y las siluetas del nivel 4 son literalmente lo que ese desafío pide enumerar. Su entrada `cs.arith.mul_order_irrelevant` está entre las que el desafío destaca de entrada, porque decidir si 3 × 12 y 12 × 3 cuentan una vez o dos es la mitad del problema.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: un piso de 3 × 5 y tres pisos más (5 × 3, 3 × 6 y uno de ocho baldosas en fila); tocar el que tiene el mismo total. Distractores: el factor vecino y el piso de la suma de los lados.
- `explain`: dos animaciones sobre el mismo piso de 4 × 6; en una gira y la ficha del total sigue en 24, en la otra gira y la ficha pasa a 10. Tocar la que miente. El distractor elegido clasifica como `factors_added_not_multiplied`.
- `manipulate`: armar con baldosas sueltas el piso de 3 × 7 que pide el marco, girarlo y comprobar que el marco de 7 × 3 queda cubierto.
- `apply`: un montón de 24 baldosas y dos marcos, 4 × 6 y 6 × 4; repartir y arrastrar la ficha del total, la misma para los dos, contra el tiempo objetivo del nodo.
- `generalize`: tres montones de 2 × 3; armar el bloque juntando primero dos montones y después el tercero, y luego al revés, y comprobar que el total no cambia. Y un lote de 13 fichas sueltas, donde la única silueta posible es la fila.
- `transfer`: en la grilla de resultados de dos dados de `prob.basic.sample_space_grid`, tocar la cantidad de casillas sin contarlas de a una.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `factors_added_not_multiplied`, patrón `missing_piece_tiles` sobre `tiles`: el juego acomoda las baldosas que el jugador pidió, deja el hueco a la vista, superpone el contorno del piso completo y marca la parte que falta. Voz: "Con esas baldosas quedó un hueco. ¿Cuántas entran en cada fila?". El marco a medio cubrir es válido y el jugador sigue agregando desde ahí. Es la de mayor severidad del nodo porque confunde su primitiva con la de `arith.add.combine_groups`: leer el rectángulo como dos montones que se juntan.

Sin entrada en el catálogo, y por eso sin clasificar ni bloquear `ready`: creer que girar cambia el total (el juego reproduce el giro con las baldosas numeradas por el orden en que se pusieron y muestra que ninguna se fue) y contar los rectángulos girados como distintos (el juego apila las dos siluetas con una marca de giro y deja una sola).

Los distractores de `explain` y las opciones de `recognize` se generan desde la regla `detect` de `factors_added_not_multiplied`, desde estos dos patrones y desde el factor vecino.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_array_turns_quarter`, nativa. El rectángulo entero se levanta y rota un cuarto de vuelta con un ritmo suave, las dos llaves de longitud giran pegadas a sus lados y se intercambian, y la ficha del total queda inmóvil e iluminada en el antes y en el después; gramática `scale`. Parametrizada por filas y columnas, produce la mecánica de los niveles 2 a 6, las dos animaciones de `explain` y los ítems de `recognize`.
- `tile_regroup_factors_same_total`, nativa. El bloque de capas se corta con un trazo, las capas se rearman en la otra agrupación con las mismas baldosas viajando de una posición a la otra, y las dos fichas del total se comparan al final; parametrizada por la lista de factores y por el despiece. Es la escena de los niveles 7 y 8 y de los ítems de `generalize`.
- Reusada: `tile_rows_become_rectangle` (nodo 5), para el nivel 1 y para el replay de `missing_piece_tiles`, que necesita ver las filas fundiéndose antes de mostrar el hueco. Los numerales y la cruz los dibuja el runtime; las baldosas son assets propios sin texto ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_tile_floor`, reusado del nodo 5: `rows` y `cols` (de 2 a 5 en los niveles 1 a 5, hasta 12 en el 6; el 1 y el 0 desde el 6); `orientation` en {rows, cols}; `cut` (cantidad de tiras en que se puede partir, 0 hasta el nivel 3); `show_keys` (falso hasta el nivel 4); `seed`.
- `gen_rectangle_lot`: `total` (cantidad de baldosas del lote, de 6 a 36); `include_prime` (habilita totales con un solo rectángulo, verdadero desde el nivel 4); `count_turned_once` (dos rectángulos girados cuentan como uno, siempre verdadero); `skin` en {tile, chip, dot, silhouette} (solo tile hasta el nivel 7); `seed`.
- `gen_factor_triple`: `factors` (tres enteros de 2 a 5); `grouping` en {left, right, free} (`free` desde el nivel 7); `show_band` (la franja translúcida, verdadera solo mientras el jugador no la haya descartado); `seed`.

**Literacy soportada:** de `none` a `full_text`. Todos los niveles se juegan sin leer: los numerales y la cruz son dibujos, no texto, y `explain` se resuelve entre animaciones. En `full_text` la definición corta del nivel 8 se muestra escrita además de narrada, sin cambiar ningún ítem.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra filas de baldosas al marco hasta cubrirlo, el borde se ilumina y la ficha del total aparece; después hace un toque sostenido sobre el piso, lo levanta y lo gira un cuarto de vuelta, y el segundo marco se acomoda debajo mientras la ficha no se mueve. Repite una vez y desaparece. La demostración de cubrir el marco con filas no se repite: es la del nodo 5. Las del corte (nivel 4), de la silueta guardada (nivel 4) y de la franja translúcida (nivel 7) son nuevas y se muestran una vez cada una ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo con su factor para `literacy: none`, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
