# 38 — Área: contar baldosas (`geom.area.rect_and_triangle`)

> Locale `es`: "Área: contar baldosas". Minijuego: [El piso de baldosas](../../F-minijuegos/geom.area.rect_and_triangle.md).

**Nodo:** `geom.area.rect_and_triangle` · **Área:** geom · **Nivel:** 1 · **Primitiva:** `scale` · **Mecánica principal:** `tiles` (secundaria `construct`) · **Literacy:** `none` · **Analogía:** `tile_floor`

## 1. Concepto

El área es la cantidad de baldosas iguales que llenan una figura, y se puede saber sin ponerlas todas: alcanza con una fila y una columna. Al terminar, el jugador cubre un rectángulo contando filas por columnas, traza la altura de un triángulo y reconoce que ese triángulo es exactamente la mitad del rectángulo que lo contiene. Antes sabía multiplicar filas por columnas sobre baldosas sueltas; no sabía que una figura tiene una cantidad propia que no cambia aunque las piezas se muevan.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 05): el producto como piso de baldosas. Se usa entero. De ahí vienen la baldosa unidad, la fila y la columna como factores, girar el piso como conmutatividad, y el gesto de estirar la banda que hace crecer la figura. El jugador ya cuenta un piso sin contar de a una; acá el piso deja de ser una cuenta y pasa a ser una figura con nombre.

Es el único prerequisito del YAML y no sigue el orden escolar, donde el área llega después de las figuras y de las unidades de medida. Acá llega antes que la clasificación de polígonos y antes que los ángulos: [C0](../../C-knowledge-graph/C0-esquema.md) pone el área primero porque es lo único de geometría que se juega con la mecánica que el jugador ya domina, y porque los tres nodos de geometría que siguen (39, 40, 41) la usan como moneda. Pitágoras es un enunciado sobre áreas, no sobre longitudes, y sin baldosas no se puede jugar.

## 3. Dificultad cognitiva real

Lo difícil no es multiplicar dos números. Son cuatro capacidades distintas:

1. **El área es una cantidad de unidades, no un par de medidas.** Un piso de 6 por 4 no "es" 6 y 4: son 24 baldosas. Mientras el jugador vea dos números, no puede comparar dos figuras de forma distinta.
2. **La altura es perpendicular, no el lado que se ve.** En un rectángulo los dos coinciden y el error duerme. En cuanto la figura se inclina, el lado largo deja de servir y hay que trazar una línea que no estaba dibujada. Falla en `area_uses_slant_side`.
3. **El área se conserva al reacomodar.** Cortar una figura y mover las piezas no cambia cuántas baldosas la llenan. Es lo que hace posible que el triángulo sea medio rectángulo y, más adelante, todo el nodo 41.
4. **Medir cubriendo.** Contar de a una es correcto y no escala. La fila y la columna son un atajo que hay que sentir como atajo, no aprender como fórmula.

Las cuatro se ejercitan con la misma mecánica y solo la segunda tiene misconception catalogada.

## 4. Problema intuitivo

Un cuarto vacío con el piso a la vista y una pila de baldosas cuadradas iguales al lado. La pregunta, por gesto: ¿alcanzan?

En `real` el jugador pone baldosas con el dedo, una por una, hasta cansarse. En `intuition` la escena se detiene con la primera fila puesta y la primera columna puesta, y el resto del piso vacío. Tres desenlaces dibujados: el piso se llena solo repitiendo la fila; se llena repitiendo la columna; se llena poniendo baldosas al azar y quedan huecos. El jugador elige y después ve. Ninguna palabra, ningún número.

## 5. Analogía del mundo real

`tile_floor` (mecánica `tiles`), la misma del nodo 05, ahora aplicada a una figura y no a una cuenta ([G0](../../G-analogias/G0-reglas.md)).

Mapa: fila de baldosas → primer factor; columna de baldosas → segundo factor; baldosa suelta → unidad de área; piso entero → producto, que acá se llama área; girar el piso → conmutatividad; piso conocido al que le faltan columnas → división; partir el piso en tiras → productos parciales.

Invariante que conserva: la cantidad de baldosas que llenan la figura no cambia si las baldosas se mueven, se giran o se cortan y se vuelven a pegar. Es `area_preserved_under_rearrangement`, el invariante de la mecánica, y es lo que convierte el triángulo en medio rectángulo sin ninguna fórmula.

Ruptura: `non_integer_sides`. Un piso de lado 3,5 no se llena con baldosas enteras. La analogía se retira en `symbolic`, justo cuando aparecen los lados que no son enteros; hasta ahí la media baldosa se ve como media baldosa y alcanza.

Por qué esta y no otra: es la única analogía del catálogo donde la unidad de medida es visible, manipulable y contable. Una jarra de agua mide sin unidad visible; una regla mide una dimensión sola. La baldosa es la unidad y se ve.

## 6. Mecánica de juego

Primera capa jugable: `real`, sin leer nada. `tiles` es la mecánica principal y `construct` aparece en cuanto hay un triángulo ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `pinch` para `tiles`; `drag`, `tap` y `hold` para `construct`.

1. Marco vacío con forma de rectángulo, bandeja de baldosas abajo. El jugador arrastra baldosas al marco. Se pegan entre sí y al borde; no se superponen.
2. Cuando una fila queda completa, la fila entera late una vez. Si el jugador la toca, se copia hacia abajo y llena el marco. El mismo gesto sobre una columna la copia hacia el costado.
3. Baldosa que sobra: no entra. Vuelve sola a la bandeja con un rebote. Baldosa que falta: el hueco queda con el contorno marcado y el piso no se cierra.
4. Marco con forma de triángulo rectángulo. Las baldosas ya no cubren el borde inclinado. El jugador mantiene el dedo sobre el triángulo (`hold`) y aparece una copia fantasma; al arrastrarla y girarla media vuelta, las dos piezas cierran un rectángulo. El piso del rectángulo se cuenta como siempre y el triángulo se queda con la mitad.
5. Triángulo cualquiera: el jugador arrastra desde un vértice hacia el lado opuesto y suelta. Si la línea llega perpendicular, se fija y queda dibujada; si llega torcida, se desvanece. Es el trazo de `construct`: revela un dato que ya estaba, no cambia la figura.
6. Verificación: tocar el piso terminado hace que las baldosas se levanten en fila india y se cuenten solas hasta el total. Sirve para confirmar y es lento a propósito.

Nada se llama error. Poner una baldosa fuera del marco, contar mal o cubrir con el lado inclinado tienen consecuencias físicas distintas y cada una dispara su patrón (sección 12).

## 7. Representación visual

Capa `visual`, primitiva `scale` dominante y `invariant` de apoyo ([H](../../H-progresion-abstraccion.md)).

`scale`: las baldosas dejan de tener textura y quedan como cuadrados de una cuadrícula. La figura se ve como una región de la cuadrícula, y al estirar un lado con `pinch` la cuadrícula gana columnas enteras: el área crece de a filas, no de a poquito. Se escala la figura, se conserva el tamaño de la baldosa.

`invariant`: cuando el jugador corta y reacomoda, el juego muestra el antes y el después uno al lado del otro con el mismo contador de baldosas iluminado en los dos. Se desplaza la pieza cortada, se conserva la cuenta.

La altura se dibuja punteada y perpendicular, con la marca de ángulo recto; el lado inclinado se dibuja lleno. Los dos se distinguen a simple vista antes de que existan sus nombres.

Todavía no hay números escritos sobre los lados, ni fórmula, ni el nombre "área": hay un contador de baldosas.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto. Siguen el desvanecimiento de la mecánica: baldosas sueltas, cuadrícula, lados rotulados, notación de producto.

1. **Baldosas sueltas → cuadrícula.** Al completar el primer piso en `visual`, las baldosas pierden el borde individual y quedan las líneas de la cuadrícula. El contador sigue en pantalla.
2. **Cuadrícula → lados rotulados.** Al tocar una fila para copiarla, la fila se contrae en una llave sobre el borde de abajo con el número `6`; la columna hace lo mismo sobre el borde izquierdo con el `4`. La cuadrícula se aclara pero no desaparece.
3. **Contador → ficha de área.** Cuando los dos rótulos están puestos, el contador se despega del piso y se convierte en una ficha con el número y una baldosa chiquita al lado. La baldosa chiquita es la unidad y viaja con el número desde acá.
4. **Rótulos → producto.** Al arrastrar el rótulo de un lado sobre el otro, los dos se juntan en `6 · 4` sobre la figura, que se aclara hasta ser un contorno. El resultado aparece con un morph desde la ficha de área.
5. **Copia fantasma → mitad.** En el triángulo, al soltar la copia girada la expresión del rectángulo aparece completa y luego la copia se retira: la expresión se parte por la mitad con una línea que baja y queda `6 · 4 / 2`. El `/2` es la copia que se fue.

## 9. Notación matemática

Queda `A = b · h` para el rectángulo y `A = b · h / 2` para el triángulo, con `b` sobre el lado de abajo y `h` sobre la línea punteada.

El símbolo nuevo es **la unidad de área**: la baldosa chiquita que acompaña al número. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que la hace necesaria, y ese problema aparece en el paso 3: cuando el contador se despega del piso, el número `24` queda solo y ya no dice de qué es. Con la baldosa al lado, `24` es un piso; sin ella, podría ser el largo de un borde. El nodo siguiente (`geom.area.perimeter_vs_area`) vive de esa diferencia, así que la unidad se introduce acá o el nodo siguiente no se puede plantear.

El `·` y el `/` ya nacieron en aritmética. La letra `h` es una convención de escritura, no un símbolo nuevo: sirve para poder hablar de la altura cuando la línea punteada no está dibujada.

## 10. Definición formal

Capa `formal`: tres frases cortas con voz, con el piso al lado.

"El área de una figura es la cantidad de unidades iguales que la llenan sin huecos ni superposiciones." "El área de un rectángulo es su base por su altura." "El área de un triángulo es la mitad de la del rectángulo de la misma base y la misma altura."

Condiciones y casos especiales, verificados sobre el objeto: la altura se mide perpendicular a la base, y cualquiera de los tres lados de un triángulo puede ser la base, con su propia altura, y el resultado es el mismo. En un triángulo obtuso la altura cae fuera de la figura y hay que prolongar la base para trazarla; el resultado no cambia. Un lado nulo da área nula.

Ya jugado: las tres frases enteras, en capa concreta. Nuevo: que las tres bases dan el mismo resultado, y el caso de la altura que cae afuera.

## 11. Propiedades

- **El área no cambia al reacomodar.** Cortar la figura y mover las piezas conserva la cantidad de baldosas. Ligada al triángulo que se completa con su copia girada.
- **El área es aditiva.** El área de una figura partida en dos es la suma de las dos partes. Ligada a partir el piso en tiras, que ya se jugó en el nodo 05 como productos parciales.
- **Girar la figura no cambia el área.** `b · h = h · b`. Ligada a girar el piso con `pinch`.
- **Duplicar un lado duplica el área; duplicar los dos la cuadruplica.** Ligada a estirar el marco y ver cuántas filas nuevas entran. Es la semilla del nodo 40, donde el factor pasa a ser cualquiera.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varios pisos embaldosados a la vista, de formas distintas. Tocar el que cubre más piso, sin contarlos de a uno. Los distractores tienen más baldosas pero más chicas, o un borde más largo con menos superficie.
- `explain`: el jugador arrastra una baldosa suelta y después elige entre animaciones sobre el mismo piso: tres filas de cuatro que se giran y quedan cuatro filas de tres con la misma cuenta; un piso al que se le mueve una pieza y el contador cambia; un rectángulo cubierto usando el lado inclinado de la figura vecina. Toca las que no explican. Cada distractor es un error del nodo o de sus prerequisitos.
- `manipulate`: cubrir un rectángulo con baldosas; después bajar la altura de un triángulo con el dedo y ver que la copia girada cierra el rectángulo; recortar y reacomodar las piezas.
- `apply`: un rectángulo de lados 6 y 4 sin baldosas a la vista. Armar el número de baldosas con las fichas. Después un triángulo de base 6 y altura 4, contra el tiempo objetivo del nodo.
- `generalize`: un triángulo inclinado sin ángulo recto. Encontrar desde qué vértice bajar la altura para que las baldosas lo cubran; la altura correcta se fija, la torcida se desvanece.
- `transfer`: sobre la balanza de `alg.expr.distributive_tiles`, dos rectángulos de baldosas con un lado desconocido; armar la expresión de cada uno y descubrir por qué son iguales.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`area_uses_slant_side`** (patrón `missing_piece_tiles`, mecánica `tiles`, que es la del nodo). El jugador toma el lado inclinado en vez de la altura: para una figura de base `b`, altura `h` y lado inclinado `s`, responde `b · s`. El juego coloca las baldosas de la respuesta del jugador, un piso de `b` por `s`, superpone la figura verdadera encima y deja brillando la franja que sobra. La voz pregunta: "Estas baldosas se salen de la figura. ¿Hasta dónde llega de verdad la altura?". La línea punteada perpendicular está en la bandeja y el jugador la baja desde ahí. Severidad 2: no bloquea el nodo, pero reaparece en los nodos 40, 41 y 42, así que se registra en cada uno.

Los errores de conteo puro y las baldosas mal encastradas no son misconceptions: son movimientos que la mecánica ya rechaza en el momento, con rebote o con hueco marcado.

## 13. Generalización

La analogía se retira en `symbolic`, en el momento en que aparecen lados que no son enteros. La media baldosa todavía se ve; el lado 3,7 ya no se puede embaldosar y la cuadrícula queda como fondo tenue mientras la expresión hace el trabajo.

Variantes sin ayuda visual, en orden: rectángulos con un lado desconocido y el área dada; triángulos con la altura que cae fuera de la figura; figuras compuestas que hay que partir en dos rectángulos; lados decimales y fraccionarios; la misma figura medida con una baldosa de otro tamaño, para que la unidad deje de ser invisible.

El nodo está en `abstract` cuando el jugador calcula el área de un triángulo eligiendo él mismo la base y trazando la altura correspondiente, sin cuadrícula, y explica con un reacomodo por qué el resultado no depende de cuál de los tres lados eligió.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas y con la misma estructura:

- `alg.expr.distributive_tiles`: el piso partido por una pared es `a · (b + c)`. La misma baldosa, ahora con un lado que es una letra.
- `calc1.int.accumulation`: el área bajo una curva se cubre con rectángulos cada vez más finos. La baldosa se adelgaza y el conteo se vuelve un límite.
- `prob.basic.probability_as_proportion`: la probabilidad como la fracción del piso que ocupa una región. El área deja de medir superficie y mide chance.
- `linalg.map.determinant_as_area`: el cuadrado unidad estirado por una transformación; el determinante es cuántas baldosas ocupa ahora.

Concepto siguiente: `geom.area.shear_invariant`. Frase puente, narrada sobre el último triángulo con su altura trazada: "Este triángulo tiene su punta acá arriba. ¿Y si la corro para el costado sin bajarla? ¿Sobran baldosas o siguen siendo las mismas?". La punta se desliza en horizontal y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `tile_scene_rectangle_rows` es nativa, parametrizada por ancho y alto: las baldosas caen en cascada, la fila se completa, se copia hacia abajo y las llaves aparecen sobre los dos bordes con sus números; gramática `scale`. `construction_scene_triangle_half_rectangle` también es nativa, parametrizada por base, altura y posición del vértice: el triángulo saca su copia, la gira media vuelta y cierra el rectángulo, con la altura punteada resaltada; gramática `invariant`. Las dos son `text_free`, así que las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). La primera genera además las animaciones de `explain`, variando cuántas filas se copian y qué lado se toma como altura.

**Calculadora:** en `ready` se habilita `op_area` ([M](../../M-calculadora/M0-progresion.md)), de nivel 1 y con caja de pruebas. Se presenta como un marco vacío que se estira con dos dedos: al soltarlo muestra el piso embaldosado y el resultado con la unidad al lado, no un número pelado. Un botón cambia entre marco rectangular y triangular, y en el triangular la copia fantasma aparece medio segundo antes de dar el resultado. El mismo `op_area` lo reusan los nodos de cizalla, trapecio y construcciones auxiliares, que le agregan formas al marco.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Las baldosas se arrastran, las filas se tocan, la altura se traza con el dedo y la instrucción es una mano fantasma que pone una fila y la copia. Los prompts de las misconceptions son de voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra directo en la capa de cuadrícula con lados rotulados, y lo que le cambia es el ritmo: los pisos son más grandes desde la primera instancia y la verificación lenta de contar baldosas de a una queda disponible pero no se ofrece sola.
