# La pizza y la barra (`arith.frac.parts_and_ratio`)

Minijuego del nodo 8 de la espina, "Una fracción es partes del todo". Mecánica principal `tiles`, secundarias `ledger` y `urn_dice`; analogías `pizza_slices` y `urn_of_balls`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/08-arith.frac.parts_and_ratio.md): un concepto, cinco dificultades reales (la fracción nombra una relación, las partes tienen que ser iguales, dos números son un número, el orden se invierte con el de abajo, la fracción también es escala), dos analogías complementarias, un gesto (cortar en partes iguales y encender), cuatro pasos de desvanecimiento, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Una barra apoyada en horizontal con una ficha objetivo encima que marca un punto que no cae en ningún borde. Al costado, una pizza redonda con un cuchillo, y un frasco con bolas de dos colores.

Mapa objeto → concepto: disco o barra entera → unidad; cortar en n partes iguales → denominador; partes encendidas → numerador; volver a cortar cada parte → fracción equivalente; dos discos cortados igual → denominador común; más porciones que un disco → fracción impropia. En el frasco: frasco → todo; bolas totales → número de abajo; bolas de un color → número de arriba.

La pizza y la barra hacen visible el corte, que es el gesto que define el número de abajo. La urna hace visible que hay fracciones donde nadie cortó nada; sin ella, el jugador se queda creyendo que una fracción es un cuchillo. Punto de ruptura de la pizza: `dividing_by_a_fraction`, porque repartir media pizza entre un tercio de persona no es una situación, y por eso la división por una fracción vive en `arith.frac.multiply`. Punto de ruptura de la urna: el total tiene que ser contable ([G0](../G-analogias/G0-reglas.md)).

G declara además `rubber_band_stretch` apuntando a este nodo, con mecánica `grid_stretch`, que el nodo no incluye entre las suyas. La banda vuelve igual, como fantasma heredado del nodo 6, en el único nivel donde hace falta la cara de escala; no se juega con ella. La discrepancia está anotada como tal.

## Mecánica central

Superficie: la barra en el centro con la ficha objetivo encima y el libro de cuentas debajo; la pizza a la izquierda, el frasco a la derecha, los platos abajo desde el sexto nivel. Gestos: `drag`, `tap`, `hold` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar hacia abajo sobre la barra.** Aparece una línea de corte, y las líneas ya puestas se corren para repartirse el espacio: la mecánica no deja cortar desparejo por accidente.
- **Mantener el dedo mientras se corta.** Las líneas se sueltan y quedan donde el jugador las puso. Cortar desparejo es posible, pero hay que quererlo.
- **Barra despareja.** No chasquea y su borde queda punteado. Cuando el jugador intenta contar sus partes, las fichas del libro salen de distinto tamaño y no se apilan: quedan torcidas al costado.
- **Tocar una parte.** Se enciende, y el libro anota una ficha por cada una, todas iguales.
- **Arrastrar la ficha de fracción a dos barras de distinto largo.** Entra en las dos. Ese momento enseña que la fracción es una relación y no una cantidad.
- **Sacar bolas del frasco con un toque.** Se apilan por color en dos columnas. La ficha aparece sola cuando el frasco queda vacío, y el todo es el frasco, no la columna más alta.
- **Repartir en platos.** Con tres barras y cuatro platos, cada plato recibe tres pedazos de cuarto, y la ficha que sale es la misma que la de una barra cortada en cuatro con tres encendidas. Las dos fichas se acercan y laten juntas.
- **Arrastrar la ficha a la recta.** La barra se contrae sobre el tramo del cero al uno y la parte encendida se clava en una marca nueva.

En `symbolic` la superficie cambia de forma, no de reglas: la ficha se arma con el teclado poniendo un numeral arriba y otro abajo de la barra; soltarla sobre una barra la corta y la enciende sola; soltarla sobre la recta la clava. La barra dibujada se pide con un toque.

## Invariante matemático

`area_preserved_under_rearrangement` (barra y pizza): cortar no cambia el total. Se confirma cuando el jugador enciende todas las partes y el contorno vuelve a ser el de la barra entera, y cuando saca una porción de la pizza y la vuelve a poner. Se rompe en el intento de sumar cruzado: la barra que el jugador construyó no cubre las dos originales pegadas, y el hueco queda dibujado.

`proportion_stable_in_long_run` (urna): la parte no cambia si se agregan bolas en la misma mezcla. Se juega en el nivel donde el frasco se llena al doble con la misma proporción y la ficha no se mueve.

El invariante que el minijuego hace cumplir con la mano, y que ninguna mecánica declara, es que las partes tienen que ser iguales para que contarlas signifique algo. La mecánica lo ejecuta en vez de decirlo: las líneas se acomodan solas, la barra chasquea o no, y las fichas se apilan o no. Un movimiento válido pero inútil, como cortar en más partes de las necesarias y encender proporcionalmente más, recibe un empujón suave y queda como semilla de `arith.frac.equivalent`.

## Representación visual

Primitiva dominante `partition`, de apoyo `scale` en el nivel de la banda ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la mesa con la pizza entera y cuatro personas, sin cuchillo en la mano del jugador. Solo se mira y se predice.
- `concrete`: barra con textura, pizza con bandeja y cuchillo, frasco con bolas, platos. Nada escrito.
- `visual`: la barra es un rectángulo largo sobre una línea tenue, con las líneas de corte llenas cuando las partes son iguales y punteadas cuando no; el contorno exterior se ilumina en el antes y el después. La pizza es un disco con radios. La urna es un rectángulo con puntos adentro y dos columnas al costado. Debajo aparece la recta del nodo 7, y la barra se acuesta sobre el tramo del cero al uno.
- `symbolic`: fichas de fracción sobre el contorno de la barra y clavadas en la recta.
- `formal`: la definición corta con voz, con la barra al lado.

## Transición simbólica

Cuatro morphs, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Línea de corte → barra de fracción: al cortar en partes iguales y encender por primera vez en `visual`, una de las líneas se despega, gira un cuarto de vuelta hasta quedar horizontal y se acorta. El símbolo es el corte, girado.
2. Partes contadas → los dos números: las fichas del libro se agrupan en dos montones, todas las partes y las encendidas. El de todas se contrae en un numeral que cae debajo de la barra corta; el de las encendidas, en uno que sube encima. Queda `3/4`.
3. `÷` → la misma barra: en el reparto en platos, la ficha `÷` del nodo 6 aparece sobre la escena, sus dos puntos se estiran hasta volverse los dos numerales y la barra del medio se queda quieta. Es `cs.arith.fraction_as_division` en un solo morph.
4. Barra → punto en la recta: al arrastrar la ficha a la recta, el rectángulo se contrae sobre el tramo del cero al uno y la parte encendida se estira hasta clavarse en una marca nueva. Es la única vez que el minijuego afirma que una fracción es un número y no un dibujo.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la barra: una fracción se escribe con dos números, el de abajo dice en cuántas partes iguales se cortó el todo y el de arriba cuántas se tomaron; las partes tienen que ser iguales o el número de abajo no dice nada; una fracción es también el resultado de repartir el de arriba entre el de abajo. Propiedades: el de abajo no puede ser cero; con los dos iguales la fracción es el todo; con cero arriba vale cero aunque el corte esté hecho; cuanto más grande el de abajo, más chica cada parte; el todo hay que fijarlo antes de nombrar la fracción. El símbolo nuevo es la barra de fracción, y nace de la línea de corte girada. No hay igual ni operador entre fracciones: sumar fracciones es `arith.frac.add_same_denominator` y `arith.frac.common_unit`.

## Generalización

La pizza se retira primero, porque su corte radial no soporta el nivel donde la fracción tiene que ser un punto de la recta. La barra se queda a demanda hasta `formal`, porque sostiene la comparación y porque `arith.frac.equivalent` la necesita entera. La urna se retira sola: en cuanto la ficha aparece antes de terminar de sacar bolas, ya no hace falta sacarlas.

Variantes sin ayuda visual: números de abajo mayores que la grilla dibujada; los dos números iguales y el cero arriba; la misma fracción pedida en dos todos de distinto tamaño; fracciones como punto de la recta sin barra debajo. Después, todos que no son ni comida ni bolas: una fila de figuras de las que algunas están giradas, un camino recorrido en parte, un vaso lleno hasta cierta altura. Cuando resuelve todo eso sin pedir barra ni pizza, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de frutas de [H](../H-progresion-abstraccion.md): sus niveles donde 🍎 pasa de objeto a numeral corresponden a lo que este nodo da por sabido. El minijuego agrega el paso que el ejemplo no tiene, porque media manzana no es un numeral nuevo sino un objeto partido, y ahí se corta la correspondencia.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cortar parejo.** `concrete`, `manipulate`. Barra sola, con las líneas acomodándose solas. Números de abajo de 2 a 4, una parte encendida.
2. **Encender varias.** `concrete`, `recognize`. Entra la pizza; varias partes encendidas y varias pizzas para elegir.
3. **El frasco.** `concrete`, `manipulate` y `apply`. Entra la urna: un todo que no se corta.
4. **Barras y contornos.** `visual`, `explain` y `manipulate`. Misma dificultad; aparece el intento de suma cruzada, con `fraction_add_across`.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate`. La ficha aparece junto a la barra y se transforma en sincronía; se puede armar con el teclado.
6. **El reparto.** `symbolic` primera mitad, `apply`. Entran los platos y el morph del `÷`.
7. **La recta sola.** `symbolic` segunda mitad, `apply` y `generalize`. La barra se pide con un toque; la fracción se clava en la recta. Números de abajo hasta 12 y comparaciones entre dos fracciones.
8. **Todos que nunca viste.** `formal` y `abstract`, `generalize`. Definición corta con voz; figuras giradas, caminos y vasos.

Qué endurece cada parámetro: el número de abajo mayor obliga a razonar el tamaño de la parte en vez de reconocer la forma; las comparaciones entre dos fracciones rompen la lectura por el numeral de arriba; los dos todos de distinto tamaño rompen la idea de que la fracción es una cantidad; los todos discretos rompen la idea de que hace falta cortar.

Desafíos de olimpíada: el nodo participa en los desafíos de aritmética de [S](../S-desafios/S0-desafios.md), aún no escritos, donde una fracción aparece como paso intermedio con el todo oculto. Hasta que S exista, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md), todos sin leer:

- `recognize`: cuatro pizzas cortadas de formas distintas y la ficha `2/3`. Tocar la que muestra exactamente esa parte. Distractores: porciones desparejas, numerales intercambiados, una porción de más.
- `explain`: dos barras iguales en dos animaciones. En una, las partes tomadas se juntan y el total se cuenta en partes del mismo tamaño; en la otra, se suman por separado los de arriba y los de abajo y la barra resultante no llega adonde tiene que llegar. Tocar la que suma cruzado. El distractor elegido clasifica: es `fraction_add_across`.
- `manipulate`: barra entera y ficha `3/5`. Cortar en cinco partes iguales y encender tres; la barra confirma con el chasquido.
- `apply`: cuatro urnas seguidas con composiciones distintas. Arrastrar la ficha de fracción que dice qué parte del total es de un color, contra el tiempo objetivo del nodo.
- `generalize`: la misma cantidad como pizza, como barra, como urna y como reparto en platos, con dos distractores donde el todo cambió de tamaño y la fracción no. Y un vaso lleno hasta cierta altura sin marcas de corte.
- `transfer`: en el dial de giro de `geom.angle.turn_as_measure`, llevar la aguja a la fracción de vuelta completa que indica la ficha. También en `prob.basic.probability_as_proportion`, `geom.sim.similarity_as_scale` y `precalc.lim.approach`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `fraction_add_across`, patrón `missing_piece_tiles` sobre `tiles`, severidad 3. Es la de mayor severidad del nodo. El juego ejecuta la respuesta del jugador: corta una barra nueva en las partes que él dijo, enciende las que dijo y la apoya encima de las dos originales pegadas; sobra o falta, y el hueco queda dibujado con el contorno de las partes que no coinciden. Después ilumina de a pares las partes de las dos barras y muestra que no miden lo mismo. Voz: "Juntaste partes de dos tamaños distintos. ¿Cuántas partes iguales entran en las dos barras?". El jugador vuelve a cortar desde el estado real. El nodo abre esta misconception y no la cierra: la resolución completa es `arith.frac.common_unit`.

Errores previstos sin entrada propia, que no clasifican ni bloquean `ready`:

- **Contar pedazos en vez de partes iguales.** Las fichas de distinto tamaño no se apilan y quedan torcidas al costado. Voz: "Esos pedazos no miden lo mismo. ¿Cuál contaste como una parte?".
- **Creer que el número de abajo más grande es la fracción más grande.** El juego corta las dos barras del mismo largo y las apoya una sobre otra, sin decir nada. Voz: "Cortaste la barra en más partes. ¿Cada parte quedó más grande o más chica?".
- **Olvidar el todo.** El juego estira las dos barras hasta el mismo largo y la comparación se da vuelta sola. Voz: "Las dos barras no medían lo mismo. ¿Qué parte de cada una está encendida?".

Los distractores se generan desde las reglas `detect` de `fraction_add_across` y de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_bar_cut_into_equal_parts`, nativa. La barra que se corta mientras las líneas se acomodan, el chasquido cuando quedan equiespaciadas, las partes que se encienden y el contorno exterior iluminado en el antes y el después; gramática `partition`. Parametrizada por partes y encendidas, produce las dos animaciones de `explain`, incluida la de suma cruzada, y los distractores de `recognize`. Es la imagen de cheatsheet de `cs.arith.fraction_as_parts_of_whole`.
- `urn_fraction_of_balls`, nativa. Bolas que salen y se apilan en dos columnas, con la llave del total abarcando las dos y la ficha que aparece al completarse; gramática `partition`. Parametrizada por la composición y el color resaltado, produce los ítems de `apply`.
- Reusada: `tile_split_rectangle_into_rows` (nodo 6), para el reparto en platos y el morph del `÷`. Es la imagen de cheatsheet de `cs.arith.fraction_as_division`.
- Ninguna lleva texto rasterizado: los numerales y la barra de fracción los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_cut_bar`: `parts` (2 a 4 en los niveles 1 a 4, hasta 12 en el 7); `shaded`; `equal_cuts` (falso solo para distractores); `bar_length` (dos largos distintos desde el nivel 5, para la misma fracción); `seed`.
- `gen_urn`: `composition`; `highlighted`; `refill_same_ratio` (verdadero en el nivel de proporción estable); `seed`.
- `gen_share_plates`: `bars`; `plates`; `exact` (verdadero solo cuando el reparto da partes enteras); `seed`.
- `gen_arbitrary_whole`: todos que no se cortan, con la parte marcada por otra vía (figuras giradas, tramo recorrido, altura de llenado) y el todo dibujado como contorno.

**Literacy soportada:** de `none` a `full_text`. Los niveles 1 a 4 no tienen numerales: la ficha se muestra como una barra corta con puntos arriba y abajo del tamaño del montón. Los numerales aparecen en el nivel 5 y la definición corta en el 8. En `full_text` la definición se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma apoya el dedo sobre la barra y arrastra hacia abajo dos veces; las líneas se acomodan, la barra chasquea y la mano enciende una parte con un toque. La escena vuelve al inicio y la barra late. Se repite solo si el jugador se queda quieto. La demostración de sacar bolas aparece en el nivel 3 y no se repite ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md). La analogía es `cultural_scope: adaptable` y sus variantes de disco se eligen por región ([P](../P-internacionalizacion.md)).
