# 05 — Multiplicar es estirar (`arith.mul.scaling`)

> Locale `es`: "Multiplicar es estirar". Minijuego: [La banda y el piso](../../F-minijuegos/arith.mul.scaling.md).

**Nodo:** `arith.mul.scaling` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `scale` · **Mecánica principal:** `tiles` (secundarias `grid_stretch`, `gears_sequence`) · **Literacy:** `none` · **Analogía:** `rubber_band_stretch` (con `tile_floor` para el piso)

## 1. Concepto

Multiplicar por 3 no es "sumar tres veces": es cambiar el tamaño de algo por un factor, y ese cambio se ve de dos maneras que son la misma. Estirado: una banda marcada se hace tres veces más larga y todas sus marcas se separan por igual. Área: tres filas de cinco baldosas se funden en un rectángulo y el total es el rectángulo entero. Al terminar, el jugador anticipa cuánto va a medir la banda antes de soltarla, arma el rectángulo que corresponde a un par de números y reconoce que dar vuelta el piso no cambia el total. Antes sabía avanzar por la pista de a un paso; no sabía cambiar la escala de todo el viaje de una sola vez.

## 2. Prerequisitos

- `arith.add.displacement` (nodo 3): el desplazamiento sobre la pista. Se usan tres cosas suyas. La manivela de `gears_sequence` con su paso uniforme, que acá se engancha a un segundo engranaje. El libro de cuentas que anota cada paso, que acá anota filas en vez de pasos. Y la pista graduada, que acá se convierte en la banda con marcas: la marca en la que cae el caminante es la que el estirado va a mover.

Es el único prerequisito del YAML, y la arista se aparta del orden escolar en un punto que conviene decir: la escuela suele llegar a multiplicar desde la suma repetida, y Mathy la usa solo como puente de entrada. [G0](../../G-analogias/G0-reglas.md) rechaza "multiplicar es sumar muchas veces" como analogía principal porque su invariante existe únicamente para enteros: `3 × ½` no es sumar tres veces medio, es escalar. Por eso la suma repetida vive en `arith.mul.repeated_groups`, fuera de la espina, y el nodo de espina entra por el estirado y por el área, que sobreviven a las fracciones. La resta no es prerequisito: acá no se deshace nada todavía.

## 3. Dificultad cognitiva real

Lo difícil no es memorizar tablas. Son cuatro capacidades que la palabra "multiplicar" tapa:

1. **Entender que el factor es una razón y no una cantidad.** Sumar 3 agrega tres unidades a cualquier cosa; multiplicar por 3 agrega poco a lo chico y mucho a lo grande. El factor no vive en la misma escala que el objeto, y esa asimetría es lo primero que hay que sentir.
2. **Reconocer que estirar y embaldosar son lo mismo.** Un jugador puede dominar el rectángulo y no anticipar el estirado, o al revés. El nodo no está aprendido hasta que los dos gestos producen el mismo número y el jugador lo espera.
3. **Anticipar el resultado sin ejecutar la acción.** Tocar la marca donde va a caer el extremo antes de soltar la banda. Es la capacidad que separa multiplicar de contar rápido.
4. **Aceptar factores que no agrandan.** Estirar por 1 no cambia nada, estirar por menos de 1 encoge y estirar por 0 aplasta. Los tres casos contradicen la palabra "multiplicar" entendida como "hacer más", y los tres se juegan antes de que aparezca ningún símbolo.

A esas cuatro se suma un borde que este nodo abre y no cierra: dar vuelta la banda. La analogía se rompe justo ahí (`negative_scaling_flips`) y por eso el YAML declara `negative_times_negative` entre las misconceptions del nodo, aunque el producto de signos se enseñe completo mucho después.

## 4. Problema intuitivo

Un patio y un montón de baldosas cuadradas apoyadas contra la pared, en filas desparejas. Alguien las quiere acomodar para cubrir el patio y pregunta, con voz o con un gesto de duda, si alcanzan.

En `real` el jugador solo mira: las baldosas se acomodan solas en filas iguales y el patio queda cubierto o queda un borde pelado. En `intuition` la escena se detiene antes del final. Hay tres filas de cinco baldosas separadas y la mano se acerca para juntarlas. Tres desenlaces dibujados: se forma un rectángulo y no sobra nada; se forma un rectángulo más largo pero más flaco, con el mismo total; se forma un rectángulo y sobran baldosas. El jugador elige y después ve. La segunda escena es la que prepara la conmutatividad y la tercera, la que prepara el resto del nodo 6.

En la variante de banda, la escena es un elástico marcado con un dibujo encima. La mano lo va a estirar. Dos desenlaces: el dibujo se agranda entero, o el dibujo queda igual y solo se corre hacia la derecha. El jugador elige. Esta pregunta separa escalar de desplazar, que es exactamente lo que separa este nodo del nodo 3.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara del concepto ([G0](../../G-analogias/G0-reglas.md)).

`rubber_band_stretch` (mecánica `grid_stretch`) es la del YAML. Mapa: banda marcada → recta numérica; marca de la banda → número; estirar k veces → multiplicar por k; dejar que la banda se encoja → dividir por k; extremo clavado → el cero, que no se mueve; estirar menos que el original → multiplicar por una fracción. Invariante: todas las marcas se separan en la misma proporción y el punto clavado se queda quieto, que es exactamente lo que conserva multiplicar. Ruptura: `negative_scaling_flips`. Una banda física no se da vuelta sobre sí misma, y por eso el factor negativo no se juega acá.

`tile_floor` (mecánica `tiles`) aporta el área. Mapa: fila de baldosas → primer factor; columna → segundo factor; baldosa suelta → unidad; piso entero → producto; dar vuelta el piso → conmutatividad; piso con columnas faltantes → división; partir el piso en tiras → productos parciales. Invariante: ninguna baldosa desaparece al reacomodar. Ruptura: `non_integer_sides`, un lado que no es un número entero de baldosas.

Por qué estas dos y no una. Cada una sobrevive donde la otra se rompe. La banda soporta factores fraccionarios y el piso no; el piso hace visible la conmutatividad y la banda no, porque estirar por 3 y estirar por 5 en la misma banda no se ven como dos lados de una figura. Juntas cubren el nodo entero y ninguna se estira más allá de su borde. Como las dos declaran `literacy_min: none`, el nodo puede declarar `literacy: none` sin conflicto.

`gears_sequence` no trae analogía propia: trae el puente desde el nodo 3. Enganchar un engranaje pequeño a uno grande hace que la ficha avance tres casillas por cada vuelta de manivela, y eso es lo mismo que el jugador ya sabe hacer de a un paso.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `tiles` es la principal y aporta el área y el invariante de que reacomodar no cambia el total. `grid_stretch` aporta el factor como razón, en una sola dimensión. `gears_sequence` aporta la entrada desde el desplazamiento: el paso constante repetido. Se encuentran en un gesto: el pellizco. El mismo pellizco de dos dedos estira la banda y junta las filas de baldosas en un rectángulo.

1. Una banda clavada de un extremo, con marcas regulares y una ficha objetivo sobre una de ellas. Abajo, un montón de baldosas y un marco de patio vacío.
2. Demostración: una mano fantasma toma el extremo libre de la banda y lo lleva hasta que la primera marca cae sobre la ficha objetivo. Suelta. Las marcas quedan separadas y el extremo clavado no se movió. La mano repite el gesto una vez y desaparece.
3. El jugador pellizca la banda. Mientras estira, un cursor sigue la marca que le importa y las demás marcas se separan a la vez, con inercia. Si suelta antes de llegar, la banda se queda donde está: el estado no se borra y puede seguir estirando.
4. Si estira de más, la marca pasa la ficha objetivo y la banda vibra levemente. Nada se llama incorrecto. El jugador vuelve atrás con el mismo gesto.
5. Si intenta arrastrar la banda entera en vez de estirarla, la banda se corre y vuelve sola a su clavo: el desplazamiento no es una acción de esta mecánica, y el clavo lo dice sin palabras.
6. Baldosas. El jugador arrastra filas de baldosas al marco. Al soltar dos filas contiguas, se funden con un chasquido y las líneas interiores se atenúan: son un rectángulo, no dos filas. Cuando el marco queda cubierto, el borde se ilumina.
7. Girar el piso. Un toque sostenido levanta el rectángulo entero y lo gira un cuarto de vuelta. Las filas se vuelven columnas, el marco se adapta y la ficha del total no cambia. Ese es el gesto de la conmutatividad, y no hace falta decirlo.
8. Engranajes. En el nivel de entrada, la manivela del nodo 3 aparece con un segundo engranaje enganchado. Cada vuelta mueve la ficha tres casillas en vez de una. El jugador cuenta vueltas, no pasos.

## 7. Representación visual

Capa `visual`, primitiva `scale` de [H](../../H-progresion-abstraccion.md), con `partition` de apoyo cuando el piso se parte en tiras.

La banda se estiliza en un segmento con marcas equiespaciadas y un punto grueso en el extremo clavado. Estirar es una animación donde cada marca se aleja del punto grueso en la misma proporción; lo que se escala es la distancia al clavo, y eso es lo que se ilumina en el antes y el después. Se conserva el orden de las marcas y la posición del clavo; se escalan todas las separaciones a la vez. La diferencia con el nodo 3 se dibuja a propósito: allá la figura se desplazaba entera y las separaciones no cambiaban.

Las baldosas se funden en un rectángulo sobre una grilla tenue. Los lados llevan una llave de longitud que se estira o se encoge con el rectángulo. Partir el piso en dos tiras y volver a juntarlo muestra que el total no cambia: la misma animación, más adelante, es la distributiva del nodo 15.

Todavía no hay operador entre los dos números, ni signo de igual, ni factores negativos, ni lados que no sean un número entero de baldosas. La banda sí admite estirados menores que el original desde el nivel medio, porque su invariante los soporta.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto del jugador.

1. **Fila de baldosas → llave con número.** La primera vez que el jugador cubre el marco entero en `concrete`, las baldosas del borde de arriba se atenúan y una llave se dibuja sobre ellas. La llave se contrae hasta ser el numeral que el jugador ya conoce del nodo 1. Lo mismo del lado izquierdo. El rectángulo queda con dos etiquetas y sigue respondiendo al dedo.
2. **Rectángulo → ficha del total.** Al girar el piso por primera vez, el interior del rectángulo se aplana en una sola ficha con el total, que sale volando hacia el borde y se queda ahí. El rectángulo no desaparece: se vuelve el contorno que la ficha conserva como sombra.
3. **Dos llaves juntas → el signo `×`.** Cuando el jugador arma dos pisos distintos con las mismas etiquetas cambiadas de lado y ve que la ficha del total es la misma, las dos llaves se acercan y entre ellas aparece una cruz pequeña que hereda el trazo del cruce de las líneas de la grilla. Queda `3 × 5` sobre el contorno del piso.
4. **Estirado → el mismo `×`.** En la banda, el factor vive primero como el tamaño del gesto. Al soltar la banda en la marca objetivo, el tramo estirado se contrae en una ficha con el factor, y entre el número de partida y esa ficha aparece la misma cruz. El jugador ve que el símbolo que nació del piso también nombra lo que hizo con la banda. Es la única vez que el nodo afirma la equivalencia de sus dos caras de forma explícita, y lo hace con un morph, no con una frase.

## 9. Notación matemática

Queda `3 × 5` junto al contorno del piso y una ficha con el total, y en la banda `5 × 3` con la marca de llegada iluminada.

El símbolo nuevo es `×`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que lo hizo necesario, y el problema es de registro: el jugador tiene que anotar un piso que ya no está en pantalla. Dibujar quince baldosas es tedioso y dibujar tres filas de cinco pide una cuadrícula. Las dos llaves con sus numerales alcanzan para reconstruir el piso entero, y la cruz entre ellas dice que hay que armarlo, no juntarlos. El problema aparece de verdad en el nivel donde el jugador tiene que pedir baldosas a un depósito que está fuera de la pantalla: no puede llevar el piso, puede llevar dos números y una cruz.

No aparece ningún otro símbolo. No hay igual todavía, porque el igual nace en `prealg.eq.balance` con su propio problema; acá la ficha del total se apoya sobre el piso y con eso alcanza. Tampoco hay paréntesis ni exponente.

## 10. Definición formal

Capa `formal`, con texto corto, voz y el piso al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, cada una verificable sobre el objeto que el jugador tiene en pantalla. Multiplicar dos números es armar el rectángulo que tiene a uno como filas y al otro como columnas, y contar las baldosas. Multiplicar por un factor es estirar por ese factor: cada distancia al cero queda multiplicada, y el cero no se mueve. El orden de los dos números no cambia el resultado.

Condiciones y casos especiales, verificados sobre el objeto: estirar por 1 deja la banda igual; estirar por 0 la aplasta contra el clavo y el piso queda sin filas; un factor menor que 1 encoge, y en el piso eso todavía no tiene forma porque un lado no puede ser media baldosa. Ese último caso es el borde declarado de `tile_floor` y se resuelve con la banda, no con las baldosas.

Ya jugado: las tres frases enteras, en las capas concreta y visual. Nuevo: el caso del 0, que en la banda es espectacular y en el piso es un marco vacío, y la palabra "factor" como nombre de lo que antes era el tamaño del gesto. En un perfil sin lectura la definición existe solo como voz sobre el objeto; el texto corto aparece para quien lo puede leer, y la entrada de cheatsheet queda como imagen con voz.

## 11. Propiedades

- **El orden de los factores no cambia el producto.** Ligada al toque sostenido que gira el piso: las filas se vuelven columnas y la ficha del total no se mueve. Es la propiedad que la mecánica regala sin enunciarla, y la que `arith.mul.rows_and_columns` retoma.
- **Multiplicar por 1 no cambia nada.** Ligada a la banda que se pellizca y se suelta en el mismo lugar, y al piso de una sola fila. Es la mitad de la cheatsheet `cs.arith.mul_by_one_and_zero`.
- **Multiplicar por 0 destruye la información.** Ligada a la banda aplastada contra el clavo: todas las marcas caen en el mismo punto y ya no se puede saber cuáles eran. Es la otra mitad de esa cheatsheet, y es la razón por la que el nodo 6 va a encontrar un cofre sin llave.
- **Estirar y después estirar otra vez es estirar por el producto.** Ligada a dos pellizcos seguidos sobre la misma banda. No se escribe todavía; es la semilla de `arith.pow.repeated_scaling`.
- **El total no cambia si el piso se parte y se vuelve a juntar.** Ligada al gesto de cortar el rectángulo en dos tiras. Es la forma concreta del invariante de `tiles` y la semilla de los productos parciales y de la distributiva.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: una banda en su estado original y tres bandas ya estiradas; una ficha muestra el factor. Tocar la que se estiró esa cantidad de veces. Los distractores se generan con un factor vecino y con una banda desplazada en vez de estirada.
- `explain`: dos animaciones sobre la misma banda. En una, la banda se estira tres veces y cada marca se separa por igual. En la otra, solo el extremo se mueve y las marcas del medio quedan donde estaban. Tocar la que no escala. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones.
- `manipulate`: pellizcar la banda hasta que el cursor toque la ficha objetivo, y después armar con baldosas el rectángulo que muestra el mismo producto en filas.
- `apply`: filas de baldosas sueltas; armar el rectángulo y arrastrar la ficha con el total sin contar baldosa por baldosa. El tiempo objetivo del nodo, con su factor para perfiles sin lectura, vive en K.
- `generalize`: el estirado se hace con fracciones simples y con cero; el jugador anticipa cuánto va a medir la banda tocando la marca antes de soltar.
- `transfer`: sobre un piso geométrico de `geom.area.rect_and_triangle`, tocar el área que resulta de duplicar un solo lado.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`negative_times_negative`**, patrón `double_flip`. Aparece en el borde del nodo, cuando el jugador ve por primera vez una banda que se da vuelta. El patrón corre sobre el caminante: está en el origen mirando a la derecha, la primera vuelta lo pone mirando a la izquierda y avanza, la segunda lo devuelve a mirar a la derecha y avanza más. La respuesta del jugador queda dibujada como una bandera del lado equivocado, donde habría terminado con un solo giro. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?". El jugador vuelve a girar desde el estado real.

Errores que el diseño prevé y que este nodo no declara, y por eso no bloquean su `ready`:

- **Confundir estirar con desplazar.** Es el distractor de `explain` y el gesto que el clavo bloquea. Si el jugador insiste, el juego reproduce los dos movimientos uno sobre otro con las marcas iluminadas y muestra que en uno las separaciones cambian y en el otro no.
- **Sumar los dos factores.** Aparece cuando el jugador arrastra la ficha del total sin armar el rectángulo. El juego ejecuta su respuesta: coloca esa cantidad de baldosas en el marco y queda un hueco. Corre como `missing_piece_tiles` sobre `tiles`. Su entrada de catálogo, `factors_added_not_multiplied`, la declara `arith.mul.rows_and_columns`, que tiene a este nodo como prerequisito: el clasificador la ve desde acá porque forma parte del vecindario conceptual ([L0](../../L-modelo-errores/L0-taxonomia.md)) y la explicación se ejecuta igual, pero el error no cuenta contra el `ready` de este nodo.

Si el primero se muestra sistemático en el playtest, merece entrada propia en `misconceptions.yaml`; hoy el nodo declara solo una.

## 13. Generalización

La analogía se retira en `symbolic`, como declaran las dos entradas de G. El piso se va primero: en cuanto el jugador arma `3 × 5` sin mirar el marco, las baldosas compiten con la expresión y además no soportan el nivel siguiente. La banda se queda un poco más, a demanda, porque es la que sostiene los factores fraccionarios y porque el nodo 6 la va a necesitar entera.

Variantes sin ayuda visual, en orden: factores mayores que la grilla, donde el rectángulo ya no se puede contar de un vistazo; factor 1 y factor 0; factores fraccionarios simples sobre la banda, que el piso no puede dibujar; y el mismo producto pedido en los dos órdenes, para comprobar que el jugador no está leyendo un dibujo memorizado.

Estirados arbitrarios. El nodo termina con bandas que no llevan números: una banda con tres dibujos y una banda objetivo donde los mismos tres dibujos están más separados. El jugador tiene que llevar la primera a la segunda con un solo pellizco. Se evalúa que la estructura (una razón que se aplica a todas las distancias a la vez, dejando un punto fijo) se reconoce sin contar.

El nodo está en `abstract` cuando el jugador anticipa el resultado de un estirado sin ejecutarlo, arma el rectángulo en los dos órdenes sin sorpresa, distingue el factor 0 del factor 1 y resuelve el estirado arbitrario sin marcas numeradas. La forma completa de esa capa aparece mucho después, cuando escalar se vuelve el producto por escalar de `linalg.vec.span_and_combination`.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `geom.area.rect_and_triangle` (`construct`): sobre una figura ya dibujada, bajar la altura y descubrir que el triángulo es la mitad de un rectángulo. El producto de dos lados vuelve como área, y esta vez las baldosas no se cuentan: se construyen.
- `geom.sim.similarity_as_scale` (`construct`): dos figuras que son la misma con distinto tamaño. El factor de la banda es la razón de semejanza, y la pregunta es cuál de dos copias salió de la misma banda.
- `linalg.vec.span_and_combination` (`grid_stretch`): estirar una flecha por un número. La banda con clavo se vuelve un vector con origen fijo, y el factor es el escalar.
- `calc1.int.accumulation` (`fill_accumulate`): un tanque que se llena a caudal constante durante un rato. Lo acumulado es un rectángulo de caudal por tiempo, y es el mismo piso.

Concepto siguiente: `arith.div.undo_mul` ([06](06-arith.div.undo_mul.md)). Frase puente, narrada sobre la última banda estirada: "Estiraste la banda y las marcas quedaron lejos. Si alguien te da la banda ya estirada y no viste cuánto, ¿cómo la devolvés a su lugar?". La banda queda sola en pantalla, aparece un cofre con la forma del estirado en la cerradura, y el nodo 6 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `tile_rows_become_rectangle` es la mecánica renderizada sobre el estado del jugador: filas sueltas que se funden en un rectángulo con las líneas interiores atenuadas, llaves que crecen sobre los dos lados y la ficha del total que aparece contando desde cero; gramática `scale`, parametrizada por la cantidad de filas y de columnas, produce también los ítems de `apply` y el giro del piso. `grid_stretch_by_factor` es la banda y la recta: el segmento con marcas que se separan mientras un valor sube, con el punto clavado quieto; parametrizada por el factor y por la longitud, genera los ítems de `recognize`, las dos animaciones de `explain` y el estirado fraccionario de `generalize`. Ninguna lleva texto rasterizado: los numerales y la cruz los dibuja el runtime, y las baldosas y la banda son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_mul` ([M](../../M-calculadora/M0-progresion.md)), que ocupa la mitad izquierda del par de la segunda fila del primer tramo; la otra mitad queda apagada hasta el nodo 6, y ese hueco visible es en sí mismo el anuncio del nodo siguiente. La tecla no devuelve solo el número: al tocarla sobre dos fichas, dibuja el rectángulo con sus dos llaves y después la ficha del total, con la misma animación de la mecánica. Manteniéndola apretada, muestra la banda en vez del piso. Si el nodo decae, la tecla muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que estira la banda hasta la ficha objetivo, los targets son baldosas y extremos de banda del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada, porque el clavo, el chasquido de las filas al fundirse y el borde iluminado del marco dicen lo mismo. Un adulto llega por diagnóstico, saltea `real` e `intuition`, entra en el nivel donde el piso ya tiene llaves con numerales y usa el teclado de fichas para el total en vez de arrastrarlo.
