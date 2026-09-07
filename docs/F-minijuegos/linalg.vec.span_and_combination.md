# Dos clases de pasos (`linalg.vec.span_and_combination`)

Minijuego del nodo 31 de la espina, "Combinación lineal y span". Mecánica principal `grid_stretch`, secundarias `ledger` y `gears_sequence`; analogía `two_kinds_of_steps`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/31-linalg.vec.span_and_combination.md): un concepto, cuatro dificultades reales (la receta como números que multiplican, el salto de un destino al conjunto de destinos, la excepción que no se ve mirando un solo destino, los pasos negativos y fraccionarios), una analogía, un gesto que lo decide todo (arrastrar el número de una fila del libro y ver rehacerse el camino), cinco pasos de desvanecimiento, la nube de puntos como imagen central, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un caminante que solo sabe dar dos clases de paso. Cada clase viene dibujada en una tarjeta, con su dirección y su largo. La cruz del tesoro está en algún lado de la grilla. A un costado, un libro de cuentas con dos filas, una por clase de paso.

Mapa objeto → concepto: paso de la clase A → primer vector; paso de la clase B → segundo vector; cuántos de cada clase → coeficientes; todos los lugares a los que se puede llegar → span; dos clases de paso sobre la misma línea → dependencia lineal; una sola receta posible para un lugar → base.

El mapa aporta el destino; el libro aporta la receta; las manivelas aportan que la receta se construye de a un paso antes de volverse un número. Punto de ruptura: `fractional_and_backward_steps`. Nadie da medio paso ni un paso de menos tres, y en cuanto los coeficientes salen de los enteros positivos el caminante deja de tener sentido. La analogía se retira en `symbolic`, justo cuando el deslizador del libro empieza a moverse de forma continua ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el mapa con el origen, la cruz y las dos flechas de paso ancladas en el origen; el libro a un costado con dos filas; dos manivelas abajo, una por clase. Gestos: `drag`, `tap` y `scrub` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Tocar una flecha de paso, o girar su manivela.** El caminante da un paso de esa clase, punta con cola con el anterior, y sube una marca en la fila correspondiente del libro. El trazo queda dibujado con el color de cada clase.
- **Alternar el orden.** El jugador puede intercalar como quiera. El trazo cambia de forma pero la punta termina en el mismo lugar, y el recorrido anterior queda como fantasma para que se vea.
- **Girar una manivela hacia atrás.** La fila pasa a números negativos y el tramo se dibuja en sentido contrario.
- **Arrastrar el número de una fila con `scrub`.** El camino entero se rehace al instante, sin animación de pasos, y el caminante se desliza. Es el gesto que convierte la cuenta en cantidad continua y el que retira la analogía.
- **Mantener el dedo sobre el mapa.** Se enciende la nube de puntos con todos los lugares alcanzables: el plano entero con dos clases independientes, una sola línea con dos clases alineadas.
- **Arrastrar una tercera tarjeta al mapa.** Si la nueva clase ya está en el span, la nube no cambia y la tarjeta se apaga sola.

En `symbolic` la superficie cambia de forma, no de reglas: las dos filas del libro se pliegan en un renglón con los coeficientes pegados a los nombres, el `scrub` se hace sobre el coeficiente escrito, y el mapa se pide con un toque y aparece como fantasma.

## Invariante matemático

**El destino depende solo de cuántos pasos de cada clase, no del orden.** Se ve confirmarse cuando el jugador alterna las manivelas de cualquier manera y el caminante cae siempre en el mismo cuadradito, con el trazo anterior en fantasma. Se ve romperse cuando el jugador altera un número de la fila: ahí sí el destino cambia, y cambia de forma proporcional.

El segundo invariante, el que abre el concepto de span, es que **lo alcanzable no depende del destino que uno esté buscando**. La nube de puntos es la misma antes y después de encontrar la receta de la cruz, y esa permanencia es lo que hace del span un objeto y no un resultado. Se ve en su forma más dura en el caso alineado: por más que el jugador gaste pasos de las dos clases, la nube sigue siendo una línea y la cruz queda afuera, apagada. Ningún mensaje lo dice; la línea encendida es el mensaje.

Una receta que cae cerca de la cruz pero no encima no rompe nada: es un recorrido perfectamente válido. Recibe un empujón suave.

## Representación visual

Primitiva dominante `displace`, de apoyo `partition` en el libro ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el caminante con sus dos tarjetas sobre la mesa, sin libro. Solo se mira y se predice si llega a la cruz.
- `concrete`: mapa con grilla, dos flechas de colores ancladas en el origen, caminante que recorre, libro con marcas, manivelas.
- `visual`: la receta se dibuja como escalera de copias translúcidas, tantas del color A y tantas del color B, encadenadas punta con cola. El span aparece primero como nube de puntos y después como región continua: el plano teñido apenas, o una línea gruesa.
- `symbolic`: `3a⃗ − 2b⃗` igualado a la columna del destino, y `span{a⃗, b⃗}` con la región como fantasma detrás.
- `formal`: la definición corta con voz; el mapa fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Tarjetas → nombres: al usar las dos clases en la misma receta, cada flecha de paso se contrae en `a⃗` y `b⃗`, conservando color e id; las columnas del nodo 30 quedan a un toque.
2. Marcas → número: al usar el `scrub` por primera vez, las marcas de cada fila se funden en un dígito con signo.
3. Fila → producto: al soltar el `scrub`, el dígito se desliza contra el nombre y queda pegado a él, `3a⃗`.
4. Dos filas → suma: cuando el caminante llega a la cruz, las dos filas se pliegan sobre un solo renglón con un `+` en la unión, que se acomoda como `3a⃗ − 2b⃗`.
5. Nube → span: al mantener el dedo con la notación ya puesta, la nube se contrae hacia los dos nombres y crece una llave alrededor.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el mapa fantasma: una combinación lineal de dos vectores es el resultado de escalar cada uno y sumarlos; el span de dos vectores es el conjunto de todas sus combinaciones lineales; dos vectores del plano generan todo el plano si, y solo si, no están sobre la misma recta por el origen.

Propiedades: el orden de los pasos no cambia el destino; el span siempre contiene el origen, porque la receta con las dos filas en cero es "no te muevas"; escalar la receta escala el destino; con dos clases independientes cada destino tiene una sola receta, que es la semilla de `linalg.basis.unique_recipe`; una tercera clase que ya está en el span no agrega lugares. Casos especiales: si una de las flechas es el vector cero, el span es la recta de la otra; si las dos son cero, el span es un punto.

Símbolo nuevo: `span{ }`, que nace cuando la pregunta pasa de "¿llego a la cruz?" a "¿la cruz está entre los lugares alcanzables?", porque el conjunto es infinito y la respuesta tiene que poder darse sin mirar el mapa. El coeficiente pegado al nombre no es un símbolo nuevo sino una convención que se extiende: el número que multiplicaba una incógnita ahora multiplica una flecha, y el resultado sigue siendo una flecha. Cheatsheet: `cs.linalg.linear_combination` y `cs.linalg.span`, las dos en capa `symbolic`.

## Generalización

El mapa se retira en `symbolic`, en el momento del `scrub`: cuando los coeficientes se mueven de forma continua, el caminante deja de tener sentido y solo queda la flecha resultante deslizándose. Se pide con un toque hasta `formal`.

Variantes sin ayuda visual: coeficientes negativos; coeficientes fraccionarios; flechas dadas por columnas sin dibujo; decidir si un destino está en el span sin encontrar la receta; el caso alineado sin aviso, donde la respuesta correcta es que no se llega. Después, combinaciones que no son pasos: dos mezclas de pintura en proporciones, dos paquetes de ingredientes comprados en cantidades, dos señales sumadas con volúmenes distintos. Cuando el jugador escribe combinaciones sin pedir mapa y explica el caso alineado sin dibujarlo, la analogía se eliminó.

## Desafío

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **De a un paso.** `concrete`, `manipulate`. Dos clases claramente distintas, coeficientes de 1 a 4, destino siempre alcanzable con enteros positivos. Solo manivelas.
2. **El libro.** `concrete`, `recognize` y `manipulate`. Aparece el libro con sus dos filas y el orden alternado con fantasma del recorrido anterior. Mismo rango.
3. **Pasos para atrás.** `concrete`, `apply`. Parámetros: coeficientes negativos y destinos que los exigen. Aparece `variable_as_label` cuando el jugador intenta juntar las dos filas.
4. **La nube.** `visual`, `explain`. Se enciende el span. Aparece el caso alineado, primero anunciado y después sin aviso.
5. **La receta escrita.** `symbolic`, `manipulate` y `apply`. `scrub` sobre el coeficiente escrito, notación completa, mapa a demanda. Parámetros: rango mayor.
6. **Sin mapa.** `formal` y `abstract`, `generalize` y `transfer`. Coeficientes fraccionarios, flechas dadas por columnas, la tercera clase que sobra, combinaciones que no son pasos.

Qué endurece cada parámetro: el rango de coeficientes obliga a leer el libro en vez de contar marcas; los negativos rompen "un paso es avanzar" y son la primera grieta de la analogía; las fracciones la terminan de romper y fuerzan el `scrub` continuo; la separación angular entre las dos clases decide cuán visible es el caso alineado, y cuando se achica sin llegar a cero el jugador tiene que decidir mirando el libro y no el dibujo.

Desafíos de olimpíada: [S](../S-desafios/S0-desafios.md) no tiene un desafío que este nodo solo desbloquee; los de álgebra lineal escritos requieren nodos posteriores. El nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: el mapa con las dos clases encendidas; tocar los lugares alcanzables. En una instancia las clases son independientes y hay que tocar el plano; en otra están alineadas y hay que tocar solo la línea.
- `explain`: tres animaciones sobre las mismas dos flechas alineadas. En una el caminante insiste con las dos manivelas y recorre la línea sin salir; en otra alguien inclina una de las flechas y el plano entero se enciende; en la tercera se agrega una tercera flecha que ya estaba en la línea y no pasa nada. Tocar la que explica por qué no se sale de la línea y narrarlo con la voz. Cada distractor es una misconception.
- `manipulate`: arrastrar tantos pasos A y tantos B como hagan falta para llegar a la cruz, primero con manivelas y después con `scrub`.
- `apply`: anotar en el libro cuántos pasos de cada tipo llevan del origen al tesoro, antes de que el caminante se mueva. Cuatro instancias seguidas contra el tiempo objetivo del nodo.
- `generalize`: con tres tarjetas nuevas y las flechas dadas por columnas, elegir el tercer tipo de paso que no agrega lugares y explicar por qué sobra.
- `transfer`: en el libro de premios de `prob.rv.expectation_as_weighted_average`, escribir el promedio como una receta de pasos con pesos. También en `mvcalc.field.arrow_at_every_point` y `adv.alg.polynomial_arithmetic`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `variable_as_label`, patrón `replay_on_mechanic` sobre `ledger`, que el nodo declara. El jugador junta las dos filas en una, "cinco pasos de la clase AB", o fusiona los dos coeficientes y los dos nombres al escribir. El juego congela el libro y repite el movimiento en cámara lenta: la fila fusionada se abre en dos y los dos recorridos se caminan a la vez sobre el mapa, cada uno con su color y el fusionado en gris. El real cae sobre la cruz; el fusionado cae en otro lado y ahí se queda. Voz: "Juntaste las dos clases de paso en una sola. ¿El caminante llega al mismo lugar?". El jugador corrige desde el estado real, separando la fila.

Una receta que llega a un lugar distinto de la cruz no dispara nada: es válida y escribible, y recibe un empujón suave. Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de la misconception y las de los prerequisitos directos, entre ellas las del nodo 30 sobre componentes intercambiadas.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `grid_scene_two_kinds_of_steps`, nativa. Recibe las dos flechas de base, el destino y los coeficientes; dibuja la escalera de copias translúcidas, el destino alcanzado y la nube de puntos que llena el plano o la línea. Gramática `displace`, con la región del span como estado y no como animación. Produce las animaciones de `explain`, incluido el caso alineado.
- `ledger_scene_recipe_of_steps`, nativa. Muestra el libro con sus dos filas cambiando en sincronía con el recorrido, hasta el plegado sobre un solo renglón. Gramática `partition`. Es la imagen de cheatsheet de `cs.linalg.linear_combination`.
- Reusada: `grid_scene_arrow_on_map` (nodo 30), para presentar cada clase de paso como flecha libre.
- Sin texto rasterizado: los números de las filas los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_step_pair`: las dos clases de paso, con `component_range` (de −4 a 4), `angle_separation` (amplia en los niveles 1 a 3, angosta desde el 5, cero en las instancias alineadas), `collinear` (booleano), `seed`.
- `gen_target_on_map`: el destino, con `coefficient_range` (1 a 4, hasta 9 desde el nivel 5), `allow_negative_coefficients` (desde el nivel 3), `fractional_coefficients` (desde el 6), y `reachable` (falso en las instancias del caso alineado).
- `gen_recipe_ledger`: la disposición del libro, con `rows` fijo en 2 y `third_card` (la tarjeta que sobra, desde el nivel 6) generada dentro o fuera del span.
- `gen_span_distractors`: distractores desde `detect`, con la fila fusionada, los coeficientes intercambiados y una región de span que corresponde a otro par.

**Literacy soportada:** de `icons` a `full_text`. La primera capa se juega sin leer, pero los números de las filas llevan dígitos con signo desde el segundo nivel y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toca la flecha A dos veces y la B una vez; el caminante hace los tres tramos y las marcas aparecen en el libro. La escena vuelve al inicio y las dos flechas laten. Hay una segunda demostración, en el nivel 5: la mano arrastra el número de una fila con `scrub` y el camino se rehace de golpe. Se repiten solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Calculadora:** `op_vector_arith` queda disponible desde el panel lateral en cuanto el nodo pasa a `ready`; escribe la receta con los coeficientes pegados a los nombres y dibuja el encadenado al costado ([M](../M-calculadora/M0-progresion.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
