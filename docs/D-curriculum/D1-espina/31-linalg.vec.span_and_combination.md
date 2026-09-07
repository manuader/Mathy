# 31 — Combinación lineal y span (`linalg.vec.span_and_combination`)

> Locale `es`: "Combinación lineal y span". Minijuego: [Dos clases de pasos](../../F-minijuegos/linalg.vec.span_and_combination.md).

**Nodo:** `linalg.vec.span_and_combination` · **Área:** linalg · **Nivel:** 6 · **Primitiva:** `displace` · **Mecánica principal:** `grid_stretch` (secundarias `ledger` y `gears_sequence`) · **Literacy:** `icons` · **Analogía:** `two_kinds_of_steps`

## 1. Concepto

Con dos clases de paso fijas y la libertad de repetir cada una las veces que uno quiera, hacia adelante o hacia atrás, se llega a un lugar del mapa siguiendo una receta: tantos de la clase A y tantos de la clase B. El conjunto de todos los lugares alcanzables es el span. Al terminar, el jugador arma la receta de un destino, reconoce cuándo un tercer tipo de paso no agrega nada y descubre el caso que arruina todo: dos clases de paso sobre la misma línea nunca sacan al caminante de esa línea. Antes sabía encadenar flechas; no sabía preguntarse a qué lugares se puede llegar.

## 2. Prerequisitos

- `linalg.vec.vector_as_displacement` (nodo [30](30-linalg.vec.vector_as_displacement.md)): la flecha como desplazamiento. Se usan la columna de componentes, el encadenado punta con cola, la flecha dada vuelta, el múltiplo escalar y el vector libre, que es lo que permite apoyar el paso siguiente donde terminó el anterior.
- `arith.mul.scaling` (nodo [05](05-arith.mul.scaling.md)): multiplicar es escalar. Se usan la idea de repetir una cantidad un número de veces y el estiramiento como acción continua, que es lo que convierte "tres pasos de la clase A" en "la flecha A multiplicada por tres" sin cambiar de imagen.

La arista que no sigue el orden escolar es la ausencia de la geometría analítica. La escuela llega a la combinación lineal después de rectas, ecuaciones paramétricas y bases. Acá el orden se invierte a propósito: la recta aparece más tarde como el caso degenerado del span, cuando las dos clases de paso caen sobre la misma línea. El jugador conoce primero el caso general y después la excepción, que es el orden en que se entiende.

## 3. Dificultad cognitiva real

Lo difícil no es contar pasos. Son cuatro capacidades:

1. **Leer la receta como números que multiplican, no como etiquetas.** Los coeficientes de la receta son cantidades que escalan cada flecha, y las flechas no se pueden fusionar entre sí. Es la fuente de `variable_as_label`, que acá se ve como juntar dos clases de paso en una sola.
2. **Pasar de un destino al conjunto de destinos.** Preguntar "¿llego a la cruz?" es un problema; preguntar "¿a qué lugares llego?" es otro, y el segundo tiene como respuesta un objeto infinito. Es el salto conceptual del nodo.
3. **Ver la excepción que no se ve mirando un solo destino.** Con dos clases de paso independientes el mapa entero se alcanza, y el jugador lo da por hecho. Solo el caso alineado revela que había una condición.
4. **Aceptar cantidades negativas y fraccionarias de pasos.** Medio paso de la clase A no es un paso, y es el punto donde la analogía se rompe.

## 4. Problema intuitivo

Un caminante en el mapa que solo sabe dar dos clases de paso. Cada clase viene dibujada en una tarjeta: una flecha corta que va en diagonal hacia arriba a la derecha, otra más larga que va hacia la derecha y un poco abajo. La cruz del tesoro está en algún lado del mapa.

En `intuition` la escena se detiene con el caminante en el origen y las dos tarjetas sobre la mesa. Tres desenlaces dibujados: combinando las dos clases llega a la cruz; llega cerca y se queda a un cuadradito; no llega nunca porque siempre pisa la misma línea. El jugador elige y después ve. Enseguida la escena cambia las dos tarjetas por dos flechas que apuntan en la misma dirección, una el doble de larga que la otra, y la pregunta cambia sola: con estas dos, ¿adónde puede ir?

## 5. Analogía del mundo real

`two_kinds_of_steps`, "Dos clases de pasos", con la mecánica `grid_stretch` ([G0](../../G-analogias/G0-reglas.md)). Mapa de estructura: paso de la clase A → primer vector; paso de la clase B → segundo vector; cuántos de cada clase → coeficientes; todos los lugares a los que se puede llegar → span; dos clases de paso sobre la misma línea → dependencia lineal; receta única para llegar a un lugar → base.

Invariante: cualquier orden de los pasos lleva al mismo lugar, y solo importa cuántos de cada clase. El caminante puede alternar como quiera; lo que cuenta es el par de números del libro.

Punto de ruptura: `fractional_and_backward_steps`. Un caminante no da medio paso ni un paso de menos tres, y en cuanto los coeficientes salen de los enteros positivos la imagen deja de sostenerse. Por eso la analogía se retira en `symbolic`, justo cuando el deslizador del libro empieza a moverse de forma continua.

Por qué esta y no otra. Una receta de cocina conserva los coeficientes pero no tiene geometría, así que no puede mostrar el span ni el caso alineado. Los pasos del caminante conservan las dos cosas: la cuenta y el lugar adonde se llega.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas conviven y cada una aporta una cosa ([E0](../../E-mecanicas/E0-catalogo.md)). `grid_stretch` es la principal y sostiene el mapa con el caminante y las dos flechas. `ledger` provee el libro donde queda escrita la receta, una fila por clase de paso. `gears_sequence` provee las dos manivelas, una por clase, que agregan y quitan pasos de a uno. Se encuentran en un gesto: cada clic de una manivela mueve al caminante y sube una marca en la fila correspondiente del libro. Gestos: `drag`, `tap` y `scrub`.

1. El mapa con el origen marcado, la cruz y las dos flechas de paso ancladas en el origen. A un costado, el libro con dos filas vacías.
2. Demostración: una mano fantasma toca la flecha A dos veces y la flecha B una vez. El caminante hace los tres tramos punta con cola, el trazo queda dibujado y en el libro aparecen dos marcas en una fila y una en la otra.
3. El jugador toca las flechas o gira las manivelas. Puede alternar el orden como quiera; el trazo cambia de forma pero la punta termina en el mismo lugar, y el juego lo muestra con un fantasma del recorrido anterior.
4. El jugador arrastra el número de una fila del libro con `scrub`. El camino entero se rehace al instante, sin animación de pasos, y el caminante se desliza. Es el gesto que convierte la cuenta en una cantidad continua.
5. Restar pasos: girar la manivela hacia atrás pasa la fila a números negativos y el tramo se dibuja en sentido contrario.
6. Éxito: cuando el caminante cae exactamente sobre la cruz, el trazo en escalera se contrae en una sola flecha punteada del origen a la cruz y la fila del libro se sella.
7. Mantener el dedo sobre el mapa: se enciende una nube de puntos con todos los lugares alcanzables. Con dos clases independientes se llena el plano. Con dos clases alineadas se enciende una sola línea y la cruz queda afuera, apagada.

Nada se llama incorrecto. Con dos clases alineadas el jugador puede insistir con las manivelas todo lo que quiera: el caminante recorre la línea y nunca sale. La línea encendida es el mensaje. Una receta que llega cerca pero no exacto deja al caminante al lado de la cruz, y el juego lo deja ahí.

## 7. Representación visual

Capa `visual`, primitiva dominante `displace`, con `partition` de apoyo en el libro ([H](../../H-progresion-abstraccion.md)).

El pergamino ya se fue en el nodo 30 y queda la grilla. Las dos flechas de paso viven ancladas en el origen y en un color cada una. La receta se dibuja como una escalera de copias translúcidas: tres copias de A pegadas una detrás de otra y después dos copias de B, cada una del color de su clase. Lo que se desplaza es el caminante; lo que se escala es la cantidad de copias de cada color; lo que se conserva es el destino cuando se cambia el orden.

El span se dibuja primero como nube de puntos y después, cuando el jugador ya lo vio llenarse, como región continua: el plano entero teñido apenas, o una línea gruesa en el caso alineado. Es la primera vez en la espina que un objeto matemático es un conjunto infinito dibujado de una vez.

Todavía no hay letras en el libro ni el símbolo del span. Las filas tienen marcas, no números escritos, hasta el paso 2 de la transición.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Tarjetas → nombres.** Cuando el jugador usa las dos clases en la misma receta, cada flecha de paso se contrae hasta una letra con flechita, `a⃗` y `b⃗`, conservando su color. Las columnas de componentes del nodo 30 quedan disponibles con un toque.
2. **Marcas → número.** Las marcas de cada fila del libro se funden en un dígito con signo, `3` y `−2`, en el momento en que el jugador usa el `scrub` por primera vez y las marcas ya no alcanzan para contarlas.
3. **Fila → producto.** Al soltar el `scrub`, el dígito se desliza contra el nombre de la flecha y queda pegado a él: `3a⃗`. La yuxtaposición como multiplicación ya la conoce de los coeficientes del nodo [16](16-alg.sys.two_by_two.md); acá multiplica una flecha.
4. **Dos filas → suma.** Cuando el caminante llega a la cruz, las dos filas del libro se pliegan sobre un solo renglón con un `+` en la unión: `3a⃗ + (−2)b⃗`, que enseguida se acomoda como `3a⃗ − 2b⃗`. El renglón queda igualado a la columna del destino.
5. **Nube → span.** Al mantener el dedo sobre el mapa con la notación ya puesta, la nube de puntos se contrae hacia los dos nombres y crece una llave alrededor: nace `span{a⃗, b⃗}`, con la región teñida como fantasma detrás.

## 9. Notación matemática

Queda la combinación escrita como suma de flechas escaladas, igualada al destino, y el span como el conjunto generado por las dos flechas.

El símbolo nuevo es **`span{ }`**, y el problema que lo hace necesario aparece en el paso 5. Mientras el jugador pregunta por un destino, la receta escrita alcanza. En cuanto la pregunta pasa a ser "¿la cruz está entre los lugares alcanzables?", hay que hablar del conjunto entero antes de conocer la receta, y dibujarlo no sirve porque el conjunto es infinito y porque la respuesta tiene que poder darse sin mirar el mapa. La llave con los dos nombres adentro es lo mínimo que hace falta: estas dos flechas, todas las recetas posibles.

El coeficiente pegado al nombre no es un símbolo nuevo, es una convención de escritura que se extiende: el número que multiplicaba una incógnita ahora multiplica una flecha, y el jugador tiene que aceptar que el resultado sigue siendo una flecha. La combinación completa, `c₁a⃗ + c₂b⃗`, es el objeto que el nodo aporta al vocabulario.

## 10. Definición formal

Capa `formal`: texto corto con voz y el mapa fantasma al lado, de a una frase. "Una combinación lineal de dos vectores es el resultado de escalar cada uno y sumarlos." "El span de dos vectores es el conjunto de todas sus combinaciones lineales." "Dos vectores del plano generan todo el plano si, y solo si, no están sobre la misma recta por el origen."

Condiciones y casos especiales, verificados sobre el objeto: los coeficientes pueden ser cualquier número, negativo o fraccionario; con los dos coeficientes en cero la receta es "no te muevas", así que el origen siempre pertenece al span; si una de las flechas es el vector cero, la clase de paso no aporta nada y el span es la recta de la otra; si las dos son cero, el span es un solo punto.

Ya jugado: las tres frases enteras. Nuevo: las palabras "combinación lineal" y "span", y el caso de las dos flechas nulas.

## 11. Propiedades

- **El orden de los pasos no cambia el destino.** Solo importa cuántos de cada clase. Ligada al fantasma del recorrido anterior que termina en el mismo punto.
- **El span siempre contiene el origen.** Ligada a la receta con las dos filas en cero.
- **Escalar la receta escala el destino.** Duplicar las dos filas del libro lleva al caminante al doble de lejos en la misma dirección. Ligada al `scrub` simultáneo de las dos filas.
- **Con dos clases independientes, cada destino tiene una sola receta.** Ligada al libro que no admite dos filas distintas para la misma cruz. La forma completa de esta propiedad es `linalg.basis.unique_recipe`; acá se juega, no se demuestra.
- **Un tercer tipo de paso que ya está en el span no agrega lugares.** Ligada a la nube de puntos que no cambia cuando se suma la tercera tarjeta.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: el mapa con las dos clases de paso encendidas; tocar los lugares a los que se llega solo con pasos A y pasos B. En el caso alineado, tocar la línea y no el plano.
- `explain`: tres animaciones sobre las mismas dos flechas alineadas. En una el caminante insiste con las dos manivelas y recorre la línea sin salir; en otra alguien inclina una de las flechas y el plano entero se enciende; en la tercera se agrega una tercera flecha que ya estaba sobre la línea y no pasa nada. Tocar la que explica por qué dos pasos sobre la misma línea no dejan salir de la línea, y narrarlo con la voz.
- `manipulate`: arrastrar tantos pasos A y tantos pasos B como hagan falta para llegar a la cruz, con las manivelas y después con el `scrub`.
- `apply`: anotar en el libro cuántos pasos de cada tipo llevan del origen al tesoro, antes de que el caminante se mueva. Después camina y confirma.
- `generalize`: elegir, entre tres tarjetas nuevas, un tercer tipo de paso que no agregue lugares, y explicar por qué sobra. Con las flechas dadas por columnas y sin mapa.
- `transfer`: en el libro de premios de `prob.rv.expectation_as_weighted_average`, escribir el promedio como una receta de pasos con pesos.

Misconception esperada ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`variable_as_label`**, patrón `replay_on_mechanic` sobre `ledger`, que este nodo declara. El jugador trata los nombres de las flechas como etiquetas pegadas y no como objetos que se escalan: junta las dos filas del libro en una sola, "cinco pasos de la clase AB", o escribe la combinación fusionando los dos coeficientes y los dos nombres. El juego congela el libro y repite el movimiento en cámara lenta: la fila fusionada se abre en dos y los dos recorridos se caminan a la vez sobre el mapa, uno con el color de cada clase y el fusionado en gris. El recorrido real cae sobre la cruz; el fusionado cae en otro lado y ahí se queda, con el estado conservado. Voz: "Juntaste las dos clases de paso en una sola. ¿El caminante llega al mismo lugar?". El jugador corrige desde el estado real, separando la fila.

Una receta que llega a un lugar distinto de la cruz no rompe ningún invariante: es un recorrido válido y perfectamente escribible. Recibe un empujón suave, no una explicación.

## 13. Generalización

La analogía se retira en `symbolic`, en el momento del `scrub`: cuando los coeficientes se mueven de forma continua, el caminante deja de tener sentido y el juego pasa a mostrar solo la flecha resultante deslizándose. El mapa queda a demanda hasta `formal`.

Variantes sin ayuda visual, en orden: coeficientes negativos; coeficientes fraccionarios; flechas dadas por columnas sin dibujo; decidir si un destino está en el span sin encontrar la receta; el caso alineado presentado sin aviso, donde la respuesta correcta es que no se llega.

Combinaciones que no son pasos. El nodo termina con recetas sobre objetos que no viven en un mapa: dos mezclas de pintura combinadas en proporciones, dos paquetes de ingredientes que se compran en cantidades enteras, dos señales que se suman con volúmenes distintos. El jugador reconoce en cada caso quiénes son las dos clases, qué son los coeficientes y qué significa que algo esté fuera del span, incluso cuando ninguna flecha está dibujada.

El nodo está en `abstract` cuando el jugador escribe combinaciones sin pedir mapa, decide si un vector está en el span de otros dos y explica el caso alineado sin recurrir al dibujo.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `prob.rv.expectation_as_weighted_average` (`ledger`): el promedio ponderado es una combinación lineal donde los coeficientes son probabilidades y suman uno. El libro es el mismo, las filas son premios.
- `mvcalc.field.arrow_at_every_point`: en cada punto del plano hay una flecha, y descomponerla en dos direcciones fijas es exactamente escribir su receta.
- `adv.alg.polynomial_arithmetic` (`gears_sequence`): un polinomio es una combinación de potencias, y los coeficientes son cuántas de cada una. El span aparece como el conjunto de polinomios que se pueden armar con las piezas disponibles.

Concepto siguiente: `linalg.map.linear_transformation_2d` ([32](32-linalg.map.linear_transformation_2d.md)). Frase puente, narrada sobre el mapa con la nube encendida: "Hasta acá las dos clases de paso eran fijas y vos elegías cuántos de cada uno. ¿Y si alguien agarra el mapa entero y estira, y las dos clases de paso cambian con él?". La grilla se vuelve elástica, las dos flechas se convierten en dos clavijas y el mapa empieza a ceder, y el nodo 32 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `grid_scene_two_kinds_of_steps` es nativa: recibe las dos flechas de base, el destino y los coeficientes, y dibuja la escalera de copias translúcidas, el destino alcanzado y la nube de puntos que llena el plano o la línea; gramática `displace`, con la región del span como estado y no como animación. Produce las animaciones de `explain`, incluido el caso alineado. `ledger_scene_recipe_of_steps` es nativa: recibe los mismos parámetros y muestra el libro con sus dos filas cambiando en sincronía con el recorrido, hasta el plegado sobre un solo renglón; gramática `partition`. Ninguna lleva texto rasterizado: los números de las filas los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsa `grid_scene_arrow_on_map` (nodo 30) para presentar cada clase de paso.

**Calculadora:** en `ready` se habilita `op_vector_arith` ([M](../../M-calculadora/M0-progresion.md)), suma de vectores y múltiplo escalar sobre columnas armadas con fichas. No devuelve solo la columna resultante: escribe la receta con los coeficientes pegados a los nombres y dibuja el encadenado punta con cola al costado. La operación ya viene desbloqueada si el jugador pasó por `linalg.vec.add_tip_to_tail`; este nodo agrega la forma de combinación con dos coeficientes. Si el nodo decae, el ícono pierde uno de los dos sumandos.

**Edad universal:** el nodo es `icons` porque los números de las filas del libro llevan dígitos con signo desde el segundo nivel ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: flechas por color, manivelas, `scrub`, nube de puntos que se enciende, `explain` entre animaciones y prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra por el nivel del libro y suele traer "combinación lineal" como fórmula vacía; el nivel de la nube de puntos no se le saltea, porque es donde el span deja de ser una palabra.
