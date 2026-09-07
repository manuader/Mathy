# El piso de baldosas (`geom.area.rect_and_triangle`)

Minijuego del nodo 38 de la espina, "Área: contar baldosas". Mecánica principal `tiles`, secundaria `construct`; analogía `tile_floor`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/38-geom.area.rect_and_triangle.md): un concepto, cuatro dificultades reales (el área como cantidad de unidades, la altura perpendicular, la conservación al reacomodar, medir cubriendo), una analogía con la unidad a la vista, un gesto (copiar la fila), cinco pasos de desvanecimiento, la cuadrícula como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un cuarto vacío visto desde arriba, con el piso a la vista y una bandeja de baldosas cuadradas iguales al costado. Todas las baldosas son del mismo tamaño y ese tamaño es la unidad.

Mapa objeto a concepto: fila de baldosas → primer factor; columna de baldosas → segundo factor; baldosa suelta → unidad de área; piso entero → área; girar el piso → conmutatividad; piso conocido al que le faltan columnas → división; partir el piso en tiras → productos parciales.

El piso aporta que el área es una cantidad de unidades contables y que no cambia si las piezas se mueven. El trazo de `construct` aporta la altura: una línea que no estaba dibujada y que revela un dato que sí estaba. Punto de ruptura del piso: `non_integer_sides`, un lado de 3,7 no se llena con baldosas enteras, y por eso la analogía se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el marco en el centro, la bandeja de baldosas abajo, el contador arriba a un costado. Gestos: `drag`, `tap` y `pinch` para las baldosas; `drag`, `tap` y `hold` para el trazo ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una baldosa al marco.** Se pega al borde o a otra baldosa. No se superponen. Si no entra, vuelve sola a la bandeja con un rebote.
- **Tocar una fila completa.** La fila se copia hacia abajo hasta llenar el marco. El mismo gesto sobre una columna la copia hacia el costado. Es el atajo, y aparece recién cuando la fila está completa.
- **Estirar el marco con dos dedos.** El marco gana o pierde filas y columnas enteras. La baldosa no cambia de tamaño nunca.
- **Mantener el dedo sobre un triángulo.** Aparece una copia fantasma. Al arrastrarla y girarla media vuelta, las dos piezas cierran un rectángulo, que se cuenta como cualquier piso.
- **Arrastrar desde un vértice al lado opuesto.** Si la línea llega perpendicular, se fija punteada con la marca de ángulo recto; si llega torcida, se desvanece sin comentario.
- **Tocar el piso terminado.** Las baldosas se levantan en fila india y se cuentan solas hasta el total. Es la verificación, y es lenta a propósito.
- **Cortar y deslizar.** Mantener el dedo sobre un piso lo parte en tiras que se pueden mover. El contador no cambia mientras se mueven.

En `symbolic` la superficie cambia de forma, no de reglas: la figura queda como contorno con dos rótulos, arrastrar un rótulo sobre el otro los junta en un producto, y la cuadrícula se pide tocando el contorno y aparece como fantasma.

## Invariante matemático

`area_preserved_under_rearrangement`: la cantidad de baldosas que llenan una figura no cambia si las baldosas se mueven, se giran, o si la figura se corta y se vuelve a armar. Se ve confirmarse cada vez que el jugador parte un piso en tiras y el contador no se mueve. Se ve romperse cuando el jugador saca una pieza y la deja afuera: queda el hueco con el contorno marcado, y el contador baja.

El invariante de `construct` es el de apoyo: `construction_reveals_not_changes`. La altura trazada no modifica el triángulo. Se ve confirmarse porque el contador está a la vista mientras se traza y no se mueve; se ve romperse cuando el jugador intenta usar el lado inclinado como si fuera la altura y las baldosas se salen de la figura.

Un movimiento válido pero inútil, como poner baldosas de a una teniendo la fila completa, o cubrir un rectángulo empezando por el medio, no rompe ningún invariante. Recibe un empujón suave: la fila completa late una vez más.

## Representación visual

Primitiva dominante `scale`, de apoyo `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el cuarto con el piso y la pila de baldosas. Se pone alguna con el dedo y se predice si alcanzan.
- `concrete`: marco, baldosas con textura, contador. Nada escrito. Aparece el triángulo y su copia fantasma.
- `visual`: las baldosas pierden el borde individual y queda la cuadrícula. La figura es una región de la cuadrícula. Al reacomodar, el antes y el después se muestran uno al lado del otro con el mismo contador iluminado en los dos. La altura es punteada con marca de ángulo recto; el lado inclinado es lleno.
- `symbolic`: contorno de la figura con una llave y un número en cada borde, y la ficha de área con la baldosa unidad al lado. La cuadrícula queda de fondo tenue.
- `formal`: las tres frases con voz y el piso fantasma al costado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Baldosas sueltas → cuadrícula: al completar el primer piso en `visual`, los bordes individuales se van y quedan las líneas; el contador sigue.
2. Cuadrícula → lados rotulados: al tocar una fila para copiarla, la fila se contrae en una llave con `6` sobre el borde de abajo, y la columna hace lo mismo con `4` sobre el borde izquierdo.
3. Contador → ficha de área: con los dos rótulos puestos, el contador se despega del piso y queda como ficha con el número y una baldosa chiquita al lado, que es la unidad y viaja con el número desde acá.
4. Rótulos → producto: al arrastrar un rótulo sobre el otro, los dos se juntan en `6 · 4` sobre la figura, que se aclara hasta ser contorno; el resultado aparece con un morph desde la ficha de área.
5. Copia fantasma → mitad: en el triángulo, al soltar la copia girada la expresión del rectángulo aparece entera y luego la copia se retira; una línea baja y parte la expresión, que queda `6 · 4 / 2`.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el piso fantasma: el área de una figura es la cantidad de unidades iguales que la llenan sin huecos ni superposiciones; el área de un rectángulo es su base por su altura; el área de un triángulo es la mitad de la del rectángulo de la misma base y la misma altura. Condiciones: la altura se mide perpendicular a la base, cualquiera de los tres lados de un triángulo puede ser la base con su propia altura, y en un triángulo obtuso la altura cae fuera de la figura y hay que prolongar la base para trazarla. Propiedades: el área no cambia al reacomodar, es aditiva, y girar la figura no la cambia. Símbolo nuevo: la unidad de área, la baldosa chiquita que acompaña al número, necesaria desde el momento en que el contador se despega del piso y `24` deja de decir de qué es.

## Generalización

El piso se retira en `symbolic`, cuando aparecen lados que no son enteros: la media baldosa todavía se ve, pero el lado 3,7 no se puede embaldosar y la cuadrícula queda de fondo mientras la expresión hace el trabajo.

Variantes sin ayuda visual: rectángulos con un lado desconocido y el área dada; triángulos con la altura fuera de la figura; figuras compuestas que hay que partir en dos rectángulos; lados decimales y fraccionarios; y la misma figura medida con una baldosa de otro tamaño, que es donde la unidad deja de ser invisible. Cuando el jugador calcula el área de un triángulo eligiendo él la base, trazando su altura, sin cuadrícula, y explica con un reacomodo por qué las tres bases dan lo mismo, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Llenar el cuarto.** `real` y `concrete`, `manipulate`. Rectángulos chicos, baldosas de sobra, sin atajo de fila. Solo se cubre y se cuenta.
2. **La fila que se copia.** `concrete`, `recognize` y `manipulate`. Aparece el atajo: una fila completa se copia. Rectángulos más grandes, baldosas justas.
3. **Medio rectángulo.** `concrete`, `explain` y `manipulate`. Aparece el triángulo rectángulo y la copia fantasma. Misma dificultad numérica.
4. **La línea que falta.** `concrete` y `visual`, `manipulate` y `generalize`. Triángulos sin ángulo recto: hay que bajar la altura antes de cubrir. Aparece `area_uses_slant_side`.
5. **Cuadrícula y rótulos.** `visual` y primera mitad de `symbolic`, `manipulate` y `apply`. Las baldosas dejan de tener borde, aparecen las llaves con números y la ficha de área con su unidad.
6. **Sin cuadrícula.** Segunda mitad de `symbolic`, `apply`. Queda el contorno con dos números; la cuadrícula se pide con un toque. Parámetros: rango numérico mayor y figuras compuestas de dos rectángulos.
7. **Otra baldosa.** `formal` y `abstract`, `generalize`. Definición corta con voz; lados decimales y fraccionarios, triángulos obtusos, y la misma figura medida con una unidad distinta.

Qué endurece cada parámetro: el rango numérico obliga a usar la fila y la columna en vez de contar; la figura compuesta obliga a partir antes de multiplicar; el triángulo obtuso rompe la idea de que la altura cae adentro; el cambio de unidad rompe la idea de que el área es un número absoluto.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)), abiertos por conjunto de nodos: `ch.geom.tiles_hidden_corner` y `ch.geom.tiles_l_shape_split` se desbloquean con este nodo y aritmética, y son los primeros que el jugador ve en toda la rama; `ch.geom.tiles_triangle_half_rectangle` y `ch.geom.tiles_slanted_same_as_straight` llegan con la cizalla; `ch.geom.tiles_hidden_layers_volume` con el volumen por capas; `ch.geom.l_shape_missing_side` y `ch.geom.inscribed_right_angle_area` ya son de la puerta de construcciones auxiliares. Más lejos, el nodo sigue apareciendo como paso intermedio en `ch.alg.rectangle_perimeter_area_quadratic`, `ch.trig.triangle_area_from_included_angle`, `ch.trig.regular_polygon_area_by_radii` y `ch.calc.fence_along_the_river`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro pisos embaldosados de formas distintas. Tocar el que cubre más piso, sin contar de a una. Un distractor tiene más baldosas pero más chicas; otro tiene el borde más largo y menos superficie.
- `explain`: tres animaciones sobre el mismo piso: tres filas de cuatro que se giran y quedan cuatro filas de tres con la misma cuenta; un piso al que se le mueve una pieza y el contador cambia; un rectángulo cubierto tomando el lado inclinado. Tocar las que no explican. El distractor elegido clasifica.
- `manipulate`: cubrir un rectángulo de 5 por 3; después bajar la altura de un triángulo y ver que la copia girada cierra el rectángulo; recortar y reacomodar las piezas.
- `apply`: rectángulo de lados 6 y 4 sin baldosas a la vista, armar el número con fichas; después triángulo de base 6 y altura 4, contra el tiempo objetivo del nodo.
- `generalize`: triángulo inclinado sin ángulo recto; encontrar desde qué vértice bajar la altura para que las baldosas lo cubran. Después, la misma figura con una baldosa del doble de lado.
- `transfer`: en las baldosas de `alg.expr.distributive_tiles`, dos rectángulos con un lado desconocido; armar la expresión de cada uno y descubrir por qué son iguales.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `area_uses_slant_side`, patrón `missing_piece_tiles` sobre las baldosas, que es la mecánica del nodo. El jugador toma el lado inclinado en vez de la altura y responde `b · s`. El juego coloca las baldosas de esa respuesta, superpone la figura verdadera y deja brillando la franja que sobra. Voz: "Estas baldosas se salen de la figura. ¿Hasta dónde llega de verdad la altura?". La línea punteada está en la bandeja y el jugador la baja desde ahí. Severidad 2: no bloquea, pero se registra igual porque reaparece en los nodos de semejanza, Pitágoras y construcciones auxiliares.

Los errores de conteo y las baldosas mal encastradas no son misconceptions: la mecánica los rechaza en el momento, con rebote o con hueco marcado. Los distractores de `explain` y las opciones de `apply` se generan desde la regla `detect` de `area_uses_slant_side` y las de los prerequisitos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_scene_rectangle_rows`, nativa, parametrizada por ancho y alto. Las baldosas caen en cascada, la fila se completa y se copia hacia abajo, y las llaves aparecen sobre los dos bordes con sus números; gramática `scale`. Renderizada sobre el estado del jugador, produce también las animaciones de `explain` variando cuántas filas se copian y qué lado se toma como altura.
- `construction_scene_triangle_half_rectangle`, nativa, parametrizada por base, altura y posición del vértice. El triángulo saca su copia, la gira media vuelta y cierra el rectángulo, con la altura punteada resaltada; gramática `invariant`. Abre los niveles 3 y 4 y es la imagen de cheatsheet de `cs.geom.area_triangle_half_base_height`.
- Las dos son `text_free`: las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_floor`: `width` y `height` (enteros de 2 a 6 en los niveles 1 a 3, hasta 20 en el 6); `tile_supply` (justo, de sobra, faltante); `show_grid`; `seed`.
- `gen_triangle`: `base`; `height`; `apex_offset`, que decide si el triángulo es rectángulo, acutángulo u obtuso y por lo tanto si la altura cae adentro o afuera; `orientation`, que decide si algún lado queda horizontal; `seed`.
- `gen_composite_floor`: cantidad de rectángulos (2 o 3), forma del recorte (L, T, escalón), y qué medida se oculta.
- `gen_unit_swap`: el lado de la baldosa unidad, para los ítems donde la misma figura se mide con otra unidad.

**Literacy soportada:** de `none` a `full_text`. El nodo entero se juega sin leer y por eso el mínimo es `none`: se arrastra, se toca, se traza con el dedo, y los prompts son de voz. En `icons` y arriba aparecen los números sobre las llaves desde el nivel 5. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra tres baldosas hasta completar una fila, toca la fila y la ve copiarse hasta llenar el marco. La escena vuelve al inicio y la bandeja late. Se repite solo si el jugador se queda quieto. La demostración del triángulo es aparte y se hace una vez en el nivel 3: la mano mantiene el dedo sobre el triángulo, arrastra la copia y la gira ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
