# La banda y el piso (`arith.mul.scaling`)

Minijuego del nodo 5 de la espina, "Multiplicar es estirar". Mecánica principal `tiles`, secundarias `grid_stretch` y `gears_sequence`; analogías `rubber_band_stretch` y `tile_floor`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/05-arith.mul.scaling.md): un concepto, tres dificultades reales (el factor como razón y no como cantidad, anticipar en lugar de contar, abandonar la suma repetida), dos analogías cuyos puntos de ruptura se cubren, un gesto (estirar tomando el extremo), cinco pasos de desvanecimiento, el rectángulo y la banda como visualización, retiro del piso en `symbolic` y de la banda en `formal`. Acá se fija cómo se juega.

## Analogía

Una banda elástica con tres cuentas, clavada por un extremo sobre una regla de marcas. Al costado, un marco de piso vacío y una pila de baldosas cuadradas.

Mapa objeto → concepto, banda: banda marcada → recta numérica; marca o cuenta → número; estirar k veces → multiplicar por k; dejar que vuelva → dividir por k; extremo clavado → cero fijo; estirar menos que el largo original → multiplicar por una fracción. Mapa del piso: fila → primer factor; columna → segundo factor; baldosa → unidad; piso entero → producto; girar el piso → conmutatividad; piso al que le faltan columnas → división; partirlo en franjas → productos parciales.

La banda aporta "cuántas veces más largo"; el piso, "cuánto hay en total". Punto de ruptura de la banda: estirar hacia atrás del clavo, que es el nodo 7. Punto de ruptura del piso: lados que no son enteros, que es el nodo 8. Ninguna de las dos se estira más allá de eso ([G0](../G-analogias/G0-reglas.md)); "multiplicar es sumar muchas veces" no es una tercera analogía sino una analogía rechazada, y aparece solo como el tren de engranajes que abre el primer nivel.

## Mecánica central

Superficie: la banda ocupa la franja superior con su regla debajo; el marco del piso, la mitad inferior; el tren de engranajes entra por la izquierda en el nivel 1 y se retira en el 3. Gestos: `drag`, `tap` y `pinch`, con manija alternativa para el `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Enganchar el engranaje grande y girar la manivela.** La ficha avanza de a tramos iguales sobre la pista. Cuenta las vueltas y muestra dónde llega. Es la puerta de entrada y desaparece en cuanto el factor deja de ser entero.
- **Estirar la banda por el extremo libre.** Todas las cuentas se separan a la vez, el clavo no se mueve y un cursor sobre la regla marca dónde va la última cuenta. La banda responde con tensión: cuanto más estirada, más resistencia.
- **Estirar tomándola del medio.** Solo el tramo de arriba se estira; el de abajo queda flojo y arrugado, las cuentas de ese tramo no se separan y el cursor no llega al objetivo. El estado se conserva y el jugador puede volver a tomar el extremo.
- **Soltar antes del objetivo.** La banda se relaja hasta su largo original y las cuentas vuelven a su sitio. No es un error: es la primera vez que el jugador ve deshacerse una escala.
- **Arrastrar una fila de baldosas bajo otra.** Se alinean con imán. Una fila con menos baldosas deja un diente en el marco y el hueco brilla; el marco no se cierra hasta que las filas son iguales.
- **Girar el piso terminado con dos dedos.** Las mismas baldosas, filas y columnas intercambiadas, el mismo brillo de marco completo.
- **Tocar baldosa por baldosa para contar.** Funciona y da el número correcto. La llave del lado late: es el empujón suave hacia leer el producto en vez de recorrerlo.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha de factor sobre una barra la estira, soltarla sobre un lado del piso agrega columnas, y arrastrar la ficha fuera de la barra la deja suelta para aplicarla a otra cosa. El piso se pide tocando el número del total y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`area_preserved_under_rearrangement` (piso): mover baldosas no cambia cuántas hay. Se ve confirmarse al girar el piso noventa grados y al partirlo en franjas y volver a juntarlo. Se ve romperse cuando el jugador intenta cerrar el marco con filas desiguales: el hueco queda y brilla.

`lines_stay_lines_origin_fixed` (banda): al estirar, las marcas siguen equiespaciadas entre sí y el clavo no se mueve. Se ve romperse cuando el jugador toma la banda del medio: un tramo queda flojo, la separación deja de ser uniforme y la banda se arruga. La arruga es el mensaje; ningún cartel lo dice.

Un movimiento válido pero inútil —contar de a una, o estirar y soltar sin llegar al objetivo— no rompe ningún invariante y recibe un empujón suave.

## Representación visual

Primitiva dominante `scale`, de apoyo `accumulate` en `concrete` y `displace` residual ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el taller, la banda a medio estirar y el piso con una fila puesta. Solo se mira y se predice dónde cae la última cuenta.
- `concrete`: banda con cuentas, regla con marcas, baldosas sueltas y marco. El tren de engranajes a un costado. Nada escrito.
- `visual`: la banda se vuelve una barra con marcas y el estiramiento se muestra con la barra original en gris debajo, el clavo compartido y una llave sobre el mismo tramo en las dos. Las baldosas se funden en un rectángulo con grilla tenue y los dos lados acotados.
- `symbolic`: la fila `3 × 4` con el rectángulo como marca de agua, el total en la llave del lado largo, y la ficha de factor arrastrable. El glifo del operador lo elige el `MathLocale`.
- `formal`: la definición corta con voz y la banda fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Baldosas sueltas → rectángulo: al cerrar el marco, los bordes internos se desvanecen y queda una superficie con grilla tenue.
2. Lado → número: tocar un lado contrae esa fila en una llave con un dígito, que es el conteo que el jugador acaba de hacer.
3. Cruce de líneas → operador: con los dos lados acotados, la primera línea de fila y la primera de columna se prolongan hasta cruzarse fuera del piso y el cruce queda como ficha entre los dos dígitos.
4. Piso → total: arrastrar la llave del piso hacia afuera contrae el rectángulo en un número; tocarlo lo devuelve a tamaño real.
5. Pellizco → ficha de factor: el gesto de estirar deja una ficha con operador y número, que se arrastra sobre cualquier barra y la estira sin dedos.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la banda fantasma: multiplicar una cantidad por un número es cambiar su tamaño en esa proporción; el producto de dos números es la cantidad de unidades de un rectángulo de esos dos lados; los factores se pueden intercambiar. Propiedades: la razón entre las partes se conserva al escalar; escalar dos veces seguidas equivale a escalar por el producto; un piso partido en franjas es la suma de las franjas. Casos especiales: por 1 la banda no se toca, por 0 se colapsa contra el clavo y el piso pierde todas las filas, y un factor menor que uno da un resultado más chico que el punto de partida. Símbolo nuevo: el operador de multiplicación, que nace del cruce de las dos direcciones del piso. El signo de igual aparece pero el nodo no lo introduce, como en los nodos 3 y 4: su historia es la de `prealg.eq.balance`. La forma primaria del resultado sigue siendo la etiqueta sobre el objeto, y el renglón con el igual es su transcripción, escrita en los dos órdenes con la misma frecuencia.

## Generalización

El piso se retira en `symbolic`, cuando aparecen lados que no son enteros. La banda se queda como fantasma a demanda hasta `formal`.

Variantes sin ayuda visual: factores de dos cifras leídos como franjas; los casos 1 y 0 mezclados sin aviso; factores menores que uno; y el piso al que le falta un lado, que es la pregunta del nodo 6. Después, escalas que no son bandas ni pisos: una foto que se agranda, una receta para el triple de personas, un plano con su escala. El jugador dice qué se conserva y qué cambia. Cuando anticipa el efecto de cualquier factor sin dibujar nada, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): este minijuego no participa del ejemplo de cofres, que empieza en el nodo 12, ni del de frutas, que empieza en el 16. Su progresión es propia y su nivel 4 es el que alimenta el nivel 4 del ejemplo de cofres, porque la ficha de factor con etiqueta es la que allí se vuelve llave.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **El tren de engranajes.** `concrete`, `manipulate`. Enganchar la rueda y contar vueltas; la ficha avanza de a tramos iguales. Solo factores de 2 a 5 y tramos chicos. Es la única aparición de la lectura de repetición.
2. **La banda y el clavo.** `concrete`, `manipulate` y `recognize`. Estirar por el extremo hasta el objetivo; aparece el error de tomar la banda del medio. Mismos factores.
3. **El piso.** `concrete`, `manipulate` y `apply`. Armar el rectángulo con filas iguales y girarlo. El tren de engranajes se retira.
4. **Barras y llaves.** `visual`, `explain` y `manipulate`. Banda gris debajo de la estirada, rectángulo con lados acotados. Misma dificultad numérica.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La fila con los dos dígitos y el operador aparece junto al piso y se transforma en sincronía; la ficha de factor se arrastra sobre la barra.
6. **Números difíciles.** Parámetros: factores de dos cifras y pisos que conviene partir en franjas. El piso se pide como fantasma.
7. **Estirar menos.** `formal` y `abstract`, `generalize`. Factores fraccionarios, factor 1 y factor 0 sin aviso, y escalas que no son bandas ni pisos. Definición corta con voz.

Qué endurece cada parámetro: el rango de factores obliga a leer el piso en franjas en vez de contarlo; los factores fraccionarios rompen el modelo de repetición y por eso llegan últimos; el factor 0 deja el producto sin vuelta atrás y prepara la cerradura sin llave del nodo 6; el objetivo dado como marca en la regla, y no como número, mantiene la anticipación por encima del cálculo.

Desafíos de olimpíada: el nodo no declara `challenges` y por lo tanto no exige desafío para `mastered` ([K](../K-evaluacion.md)). La estructura reaparece como paso intermedio en `ch.arith.fraction_of_the_rest`, que cita `cs.arith.mul_as_scaling` entre sus referencias de cheatsheet ([S](../S-desafios/S0-desafios.md)).

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: una banda sin estirar y tres estiradas, con la ficha del factor visible. Tocar la que corresponde. Un distractor es una banda a la que solo se le alargó el último tramo.
- `explain`: dos animaciones sobre la misma banda, una donde las tres cuentas se separan por igual y otra donde solo el extremo se mueve. Tocar la que no escala. El ítem alimenta Understanding aunque el distractor no clasifique como misconception del catálogo.
- `manipulate`: estirar la banda hasta que el cursor toque la marca objetivo y armar con baldosas el rectángulo del mismo producto. Los dos objetos, una sola cantidad.
- `apply`: filas de baldosas sueltas; armar el rectángulo y arrastrar la ficha del total sin recorrerlo, contra el tiempo objetivo del nodo.
- `generalize`: estirar con un factor fraccionario y con cero, tocando la marca de llegada antes de soltar. Y una foto que se agranda: decir qué se conserva.
- `transfer`: sobre el piso de `geom.area.rect_and_triangle`, tocar el área que resulta de duplicar un solo lado. También en `geom.sim.similarity_as_scale` (dos figuras semejantes), `linalg.vec.span_and_combination` (la flecha que se estira sin girar) y `calc1.int.accumulation` (las franjas bajo la curva).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `negative_times_negative`, patrón `double_flip` sobre el caminante: solo puede activarse en jugadores que ya tienen `arith.int.negatives`, porque antes no existe la ficha de número negativo. El caminante se da vuelta dos veces y termina del lado por el que empezó; la respuesta del jugador queda como bandera del otro lado.
- Estirar solo el extremo no tiene entrada en el catálogo de L y por lo tanto no clasifica. Se trata dentro de la mecánica: la banda queda floja y arrugada hasta que el jugador la toma del extremo.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` disponibles más variaciones del factor; con una sola misconception activa, el generador completa con factores vecinos y con la banda floja.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_rows_become_rectangle`, nativa. Las filas sueltas se apilan, se funden en un rectángulo y los dos lados quedan acotados por llaves; gramática `scale` con apoyo de `accumulate`. Parametrizada por filas y columnas, produce también las instancias de `apply`.
- `grid_stretch_by_factor`, nativa. La barra se estira por un factor continuo con el extremo fijo, las marcas se separan en proporción y una llave mide el mismo tramo antes y después; gramática `scale`. Parametrizada por factor y largo; cambiando qué parte de la barra queda fija produce las dos animaciones de `explain`.
- Reusadas: las escenas de la pista del nodo 3 para el tren de engranajes del nivel 1.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_stretch_target`: `factor` (entero de 2 a 5 en los niveles 1 a 5, hasta 12 en el 6, fracciones simples y 0 y 1 en el 7); `band_marks` (2 a 4 cuentas); `target_as` en {marca, ficha}; `handle` en {extremo, medio} para las instancias de `explain`; `seed`.
- `gen_tile_rectangle`: `rows` y `cols` por rango según nivel; `given` en {ambos lados, un lado y el total, filas sueltas}; `allow_split_into_strips`; `seed`.
- `gen_gear_train`: `ratio` (1:2 a 1:5); `turns`; solo en el nivel 1.

**Literacy soportada:** de `none` a `full_text`. El mínimo es `none` y se sostiene en todos los niveles: los dígitos que aparecen desde el nivel 4 son íconos nacidos de un conteo del jugador, el objetivo puede darse como marca en la regla en vez de número, y `explain` se resuelve entre animaciones. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma el extremo libre de la banda y tira hasta el objetivo; las cuentas se separan a la vez y el clavo no se mueve. La escena vuelve al inicio y el extremo late. Para el piso, la mano copia la fila puesta dos veces hacia abajo. La demostración de girar la manivela no se repite: es la del nodo 3 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
