# 36 — Esperanza como promedio ponderado (`prob.rv.expectation_as_weighted_average`)

> Locale `es`: "Esperanza como promedio ponderado". Minijuego: [La tabla y el libro de premios](../../F-minijuegos/prob.rv.expectation_as_weighted_average.md).

**Nodo:** `prob.rv.expectation_as_weighted_average` · **Área:** prob · **Nivel:** 6 · **Primitiva:** `scale` · **Mecánica principal:** `balance` (secundarias `ledger`, `urn_dice`) · **Literacy:** `icons` · **Analogía:** `balance_point_of_weights` (con `fair_ticket_price` para el libro de premios)

## 1. Concepto

La esperanza es el lugar donde un juego se equilibra a la larga: el punto de apoyo que sostiene una tabla con pesas repartidas sobre los valores posibles, donde cada pesa vale lo que su probabilidad. Al terminar, el jugador coloca las pesas de cada premio en su marca, encuentra el punto de equilibrio sin calcularlo, predice hacia dónde se corre cuando una probabilidad cambia, y escribe ese punto como una suma de valores por probabilidades. Antes sabía leer una porción y sabía armar una receta con dos clases de paso. No sabía que el promedio de un juego es esa misma receta con las porciones como coeficientes.

## 2. Prerequisitos

- `prob.basic.probability_as_proportion` (nodo [34](34-prob.basic.probability_as_proportion.md)): la porción como probabilidad. Se usa la urna, la barra del total, `P(A)`, y muy especialmente la corrida con el dedo apretado: acá lo que se estabiliza no es una barra de frecuencias sino el promedio acumulado de lo ganado. También llega de allí la condición de que las porciones sumen uno, que es lo que hace que el punto de equilibrio exista y quede dentro del rango.
- `linalg.vec.span_and_combination` (nodo [31](31-linalg.vec.span_and_combination.md)): la combinación con coeficientes. Se usa la receta: tantos de esto más tantos de aquello. La esperanza es exactamente esa receta, con los valores como ingredientes y las probabilidades como coeficientes, y con una restricción que en el nodo 31 no existía: los coeficientes no son libres, son positivos y suman uno. Esa restricción es lo que convierte una combinación cualquiera en un promedio, y es también la razón de que el resultado nunca se salga del intervalo entre el valor más chico y el más grande.

La arista con linalg no sigue el orden escolar y es la más importante del nodo. La escuela presenta la esperanza como una fórmula de estadística y la combinación lineal como un tema de álgebra lineal, sin contacto. [C0](../../C-knowledge-graph/C0-esquema.md) las junta a propósito, porque son el mismo objeto: quien ya armó recetas con coeficientes reconoce la esperanza como un caso particular con coeficientes restringidos, y no tiene que memorizar nada.

## 3. Dificultad cognitiva real

Lo difícil no es multiplicar y sumar. Son tres capacidades:

1. **Aceptar un promedio que no es el del medio.** El promedio simple está en el centro de los valores. La esperanza no: se corre hacia donde hay más peso. Un juego con un premio enorme muy improbable tiene esperanza chica, y eso contradice la intuición de que "puede salir el premio grande". El punto de apoyo es lo que hace visible esa asimetría.
2. **Ponderar en vez de contar.** Multiplicar cada valor por su probabilidad no es una cuenta más: es reemplazar "cada uno cuenta uno" por "cada uno cuenta lo que pesa". Es la traducción exacta de `equiprobable_assumed` al terreno de la esperanza, y es la única misconception declarada del nodo.
3. **Ver la esperanza como un número que puede no ocurrir nunca.** La esperanza de un dado es tres y medio, y el dado nunca saca tres y medio. Quien busca la esperanza entre los resultados posibles no la encuentra y desconfía. Es un salto de tipo: el promedio no es un resultado, es una posición.

## 4. Problema intuitivo

Un puesto de kermés. Un boleto cuesta unas fichas y puede ganar tres premios distintos: un premio grande, uno mediano y nada. El vendedor tiene un libro donde anota, tanda tras tanda, qué le tocó a cada boleto. La pregunta, por voz o por gesto: ¿el boleto vale lo que cuesta?

En `real` la escena es el puesto, el libro y la fila de gente. En `intuition` la escena se detiene antes de decidir: tres desenlaces dibujados. Jugar cien boletos y terminar con más fichas de las que se pusieron; terminar con menos; terminar más o menos igual. El jugador elige y después ve la corrida completa. Se corre dos veces con precios de boleto distintos, y en las dos el resultado se acerca al mismo lugar visto desde arriba o desde abajo. Ese lugar es la esperanza, y todavía no tiene nombre.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por capacidad ([G0](../../G-analogias/G0-reglas.md)).

`balance_point_of_weights` (mecánica `balance`) es la del YAML. Mapa: la tabla con marcas es el eje de valores; una pesa puesta en una marca es la probabilidad de ese valor; el punto donde la tabla se equilibra es la esperanza; una pesa más pesada tira el punto hacia ella, y eso es la ponderación; pesas iguales en todas las marcas dan el promedio simple. Invariante: la tabla queda horizontal si, y solo si, el apoyo está en el punto que compensa todos los pesos por su distancia. Ruptura: `no_balance_point`, el caso de infinitos valores donde la tabla no se equilibra en ningún lado, muy lejos de este nodo.

`fair_ticket_price` (mecánica `ledger`) aporta el sentido económico. Mapa: el boleto es la variable aleatoria; premio por su chance es un término de la esperanza; el precio justo es la esperanza; muchos boletos jugados es el promedio a la larga; un precio por encima del justo es la pérdida esperada. Ruptura: la gente no paga el precio justo, y eso está fuera de la matemática del nodo.

Cómo conviven: el libro de premios es donde se arman los términos, una fila por premio con su chance y su valor; la tabla es donde esos términos se convierten en pesas y se busca el equilibrio. El libro plantea "cuánto aporta cada premio"; la tabla, "dónde queda el total".

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas, cada una con su aporte ([E0](../../E-mecanicas/E0-catalogo.md)).

`balance` es la principal y provee el equilibrio: la tabla, el apoyo que se arrastra y la inclinación como respuesta. `ledger` provee la contabilidad: el libro con una fila por premio, la chance y el valor, y la columna del aporte que se llena sola. `urn_dice` provee la evidencia: la corrida larga que confirma que el promedio acumulado se acerca al punto de apoyo.

Los tres se encuentran en un gesto: el jugador arrastra la pesa de una fila del libro y la suelta sobre la marca de su valor en la tabla. La fila del libro y la pesa quedan unidas por un hilo, y mover una mueve la otra.

Gestos: `drag`, `tap`, `hold`.

1. Una tabla horizontal con marcas numeradas y un apoyo debajo que se puede arrastrar. A un costado, el libro con una fila por premio. Las pesas empiezan todas en el libro.
2. Demostración: una mano fantasma toma la pesa de la primera fila y la suelta en su marca. La tabla se inclina. Toma la segunda y la suelta, y la tabla se inclina menos. Con todas puestas, la mano arrastra el apoyo hasta que la tabla queda horizontal, y una marca se ilumina bajo el apoyo.
3. El jugador arrastra pesas y arrastra el apoyo. La tabla responde con inercia y nunca se queda quieta hasta que el apoyo está en el lugar. Es el gesto central y es puramente físico.
4. El jugador cambia una chance en el libro. La pesa correspondiente engorda o adelgaza, y la tabla se inclina de nuevo. El apoyo hay que volver a moverlo. Esto es lo que enseña que la esperanza depende de las probabilidades y no solo de los premios.
5. El jugador mantiene apretado sobre la urna que hay debajo del libro. Se juegan boletos de a cientos, el libro va anotando, y una línea del promedio acumulado se dibuja acercándose a la marca del apoyo. Las dos coinciden.
6. Verificación (`cs.prob.expected_value_formula`): la columna del aporte del libro se suma y el total se ilumina sobre la misma marca donde está el apoyo.

Nada se llama incorrecto. Poner el apoyo en el centro de las marcas cuando las pesas no son iguales deja la tabla inclinada; el lado pesado baja y toca la mesa, y el jugador ve de qué lado se pasó. Cambiar una chance sin que las chances sumen uno hace que una pesa fantasma aparezca en el libro con el faltante, y el juego no deja seguir hasta que se reparte.

## 7. Representación visual

Capa `visual`, primitiva dominante `scale`, con `invariant` de apoyo ([H](../../H-progresion-abstraccion.md)).

Lo que se escala es cada pesa, que se dibuja como una barra vertical cuya altura es la probabilidad, plantada sobre su marca. Lo que se desplaza es el apoyo, que se corre a lo largo del eje. Lo que se conserva es la altura total: las barras siempre suman lo mismo, porque las probabilidades suman uno, y por eso se pueden mover de marca en marca sin que aparezca ni sobre peso.

El eje de valores se dibuja como una recta numérica, la misma del nodo 02. La esperanza es un punto sobre esa recta y casi nunca cae sobre una marca. Que caiga entre marcas es lo que se busca mostrar, y por eso el apoyo se mueve de manera continua y no de a saltos.

Al costado, el libro se estiliza en dos columnas de barras: una de valores y una de chances, con la columna del aporte creciendo como producto de las dos. La lectura del producto como área de un rectángulo chico queda disponible pero no se fuerza acá.

Todavía no se muestra la dispersión, ni la distancia de los valores al punto de apoyo, ni ningún caso de infinitos valores. Eso es `prob.rv.variance_as_spread` y sus vecinos.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Pesas a barras.** Al colocar la última pesa, las pesas se aplanan en barras verticales sobre sus marcas, con la altura igual a la chance. El bulto físico se pierde; la altura queda.
2. **Filas del libro a productos.** Al tocar la columna del aporte, cada fila junta su valor y su chance con un morph en un solo término, `valor · chance`, escrito sobre la barra correspondiente. El hilo entre la fila y la barra sigue ahí.
3. **Términos a suma.** Al arrastrar los términos uno sobre otro, se encadenan con signos de más en un renglón. La tabla no se mueve: el renglón es una descripción de lo que ya está en equilibrio.
4. **Apoyo a marca del eje.** Al tocar el apoyo, se contrae en un punto sobre la recta numérica y deja una marca fija con su valor. El punto no coincide con ninguna marca de premio y eso se hace notar: la marca queda entre dos.
5. **Suma a `E[X]`.** Al soltar el renglón de la suma sobre la marca del apoyo, la marca se convierte en una `E` y el boleto del libro se encoge dentro de un corchete a su derecha. Queda `E[X] = 3.5` y, debajo, el renglón de la suma como su definición. Los dos objetos quedan unidos: tocar `E[X]` reabre la suma, tocar la suma reabre la tabla.

## 9. Notación matemática

Nace `E[X]`, y con él el corchete y el nombre de la variable aleatoria como objeto.

La regla de oro de [H](../../H-progresion-abstraccion.md) pide el problema que lo hizo necesario, y acá el problema es de tipo. Hasta este nodo todo lo que se escribía era un número o una porción. La esperanza no es una propiedad de un evento sino de un juego entero: del boleto, con todos sus premios y todas sus chances a la vez. `P(A)` no sirve, porque `A` es un evento y el boleto no es un evento. Hace falta un nombre para el juego completo, `X`, y un operador que lo lea y devuelva su punto de equilibrio, `E`. El corchete, en vez del paréntesis, marca esa diferencia de tipo: adentro no va un evento, va una variable.

Con `E[X]` llega su definición escrita, `E[X] = Σ xᵢ P(xᵢ)`, que es la suma de la columna de aportes. El signo de sumatoria se presenta acá como un plegado del renglón de sumas: el renglón se enrolla y la sigma queda en su lugar, con el índice recorriendo las filas del libro. No es un símbolo nuevo con su propio problema sino una abreviatura de algo ya escrito, y así se declara.

## 10. Definición formal

Capa `formal`: texto corto con voz y la tabla al lado como fantasma. Tres frases, de a una.

"Una variable aleatoria le pone un número a cada resultado posible." "Su esperanza es la suma de cada valor multiplicado por su probabilidad." "Es el punto donde la tabla con las pesas queda en equilibrio, y es también el promedio al que tienden muchas repeticiones."

Condiciones y casos especiales, verificados sobre el objeto: las probabilidades tienen que sumar uno, o el apoyo no existe; la esperanza queda siempre entre el valor más chico y el más grande, porque los coeficientes son positivos y suman uno; si todos los valores son iguales, la esperanza es ese valor y el apoyo está donde sea; si todas las chances son iguales, la esperanza es el promedio simple, y ahí el nodo se toca con `prob.stat.mean_as_leveling`; con infinitos valores puede no haber punto de equilibrio, y eso es la ruptura de la analogía.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: el nombre variable aleatoria y el caso de infinitos valores, enunciado y no jugado.

## 11. Propiedades

- **La esperanza está entre el mínimo y el máximo.** Ligada a que el apoyo nunca puede quedar fuera de la tabla. Es consecuencia directa de que los coeficientes suman uno, que es lo que el nodo 31 no exigía.
- **Con chances iguales, la esperanza es el promedio simple.** Ligada a la tabla con pesas idénticas, donde el apoyo queda en el centro. Es la que separa promedio de promedio ponderado.
- **Mover peso hacia un valor corre la esperanza hacia ese valor.** Ligada al gesto de engordar una pesa y ver el apoyo perseguirla. Es la propiedad que sostiene el probe `generalize` del locale.
- **La esperanza de una suma es la suma de las esperanzas.** `E[X + Y] = E[X] + E[Y]`. Ligada a jugar dos boletos a la vez: los dos libros se apilan y el apoyo del libro combinado queda donde la suma de los dos apoyos. Vale aunque los boletos no sean independientes, y eso se muestra con dos boletos amarrados. Cheatsheet `cs.prob.linearity_of_expectation`.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), instanciados dentro de la mecánica. Las probes del locale, desarrolladas:

- `recognize`: cuatro libros de premios con sus tablas ya armadas y el apoyo puesto en distintos lugares. Tocar la que muestra dónde se equilibra el juego a la larga. Los distractores los genera `detect`: el apoyo en el centro de las marcas, el apoyo sobre el premio más grande, el apoyo sobre el premio más probable.
- `explain`: mover las pesas sobre la tabla y elegir entre tres animaciones cuál explica por qué el punto de equilibrio se corre hacia la pesa mayor. Una muestra el apoyo siguiendo el peso; otra muestra el apoyo quedándose en el centro y la tabla inclinada; otra muestra las pesas cambiando de valor al moverse. Cada distractor es una misconception.
- `manipulate`: colocar las pesas de cada premio en su marca y arrastrar el apoyo hasta el equilibrio. La tabla es el juez: solo queda horizontal en un lugar. Sin números en el nivel de entrada.
- `apply`: con los premios y sus chances anotados en el libro, decidir el precio justo del boleto antes de jugar, arrastrando una marca sobre el eje. Después se corre la simulación de mil boletos y se compara. Contra el tiempo objetivo del nodo.
- `generalize`: cambiar una chance sin cambiar los premios y predecir hacia dónde se mueve el equilibrio, marcándolo antes de soltar. El resto de las chances se reajusta solo para que sigan sumando uno, y eso mismo es parte de lo que hay que anticipar.
- `transfer`: en el mapa de `linalg.vec.span_and_combination`, escribir el punto de equilibrio como una combinación de pasos con coeficientes que suman uno, y ver que el punto cae dentro del polígono de los ingredientes.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`equiprobable_assumed`**, patrón `counterexample_slider` sobre `urn_dice`. Es la misma del nodo 34, con otra cara: acá el jugador promedia los premios sin pesarlos, o pone el apoyo en el centro de las marcas. El juego pone dos lecturas en paralelo. Arriba, una tabla con pesas todas iguales y su apoyo en el centro, la cuenta del jugador. Abajo, la tabla real con las pesas del libro. Un deslizador controla la chance del premio grande y la recorre de casi cero a casi uno. Las dos marcas de apoyo se separan enseguida, y con la chance chica el apoyo real queda pegado al premio más probable mientras el promedio simple sigue en el centro. Voz: "Promediaste los premios como si todos salieran igual de seguido. Movete la chance del premio grande y mirá los dos apoyos". El deslizador queda en manos del jugador. No se reabre desde el estado erróneo, porque no hay estado: hay una afirmación falsa. Después del contraejemplo el ítem vuelve con un dado cargado, para que la idea no quede pegada a la kermés.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de esta misconception y desde las de los dos prerequisitos directos.

## 13. Generalización

La analogía se retira en dos tiempos. La tabla se va en `symbolic`, cuando el jugador escribe la suma de productos sin necesitar el equilibrio físico; a partir de ahí se pide con un toque y aparece como fantasma. El libro sobrevive hasta `formal`, porque es lo que sostiene la estructura de un término por valor.

Variantes sin ayuda visual, en orden: premios negativos, es decir, apuestas donde se puede perder, que rompen la tabla física igual que las pesas negativas rompían la balanza del nodo 13; chances dadas como porcentajes y no como fracciones; muchos valores, del orden de diez, donde arrastrar pesas deja de ser práctico y la suma se vuelve más rápida que el equilibrio; valores no enteros; y por último dos variables a la vez, para usar la linealidad.

El nodo está en `abstract` cuando el jugador calcula la esperanza de un juego que no vio antes, sin dibujar la tabla, justifica sin analogía por qué el resultado queda entre el mínimo y el máximo, y usa la linealidad para partir un problema en pedazos. La forma completa de esa capa es la esperanza como integral, que llega con `prob.dist.density_area_is_probability`.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otras áreas y con el mismo objeto en otro papel:

- `adv.num.monte_carlo_pi` (`urn_dice` con `tiles`): tirar puntos al azar en un cuadrado y contar los que caen dentro del círculo. El promedio de una variable que vale uno cuando acierta y cero cuando no es exactamente la probabilidad, y por eso el promedio de muchas tiradas estima un área. Es donde la esperanza deja de ser un premio y pasa a ser una herramienta de cálculo.
- `csmath.info.entropy_as_surprise` (`urn_dice` con `ledger`): la entropía es la esperanza de la sorpresa. El libro tiene una columna más, la sorpresa de cada resultado, y el punto de equilibrio de esa columna es la cantidad de bits. La estructura es idéntica; lo que cambia es qué se pone en la columna de valores.
- `geom.area.area_by_random_darts` (`urn_dice` con `tiles`): el área como promedio de aciertos, la misma idea que en Monte Carlo pero en la geometría de la escuela media y sin nombre técnico.

Concepto siguiente: `prob.rv.variance_as_spread`. Frase puente, narrada sobre la tabla equilibrada: "Ya sabés dónde se apoya la tabla. Pero dos juegos pueden apoyarse en el mismo lugar y no parecerse en nada. ¿Qué tan lejos del apoyo están las pesas?". Las barras se quedan quietas y aparecen flechas desde el apoyo hasta cada una, y el nodo siguiente empieza ahí.

---

**Visualización:** tres escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `balance_scene_plank_with_weights` es nativa y es la imagen central: la tabla con las pesas sobre sus marcas, el apoyo que se arrastra y la inclinación con inercia; parametrizada por valores, pesos y la posición propuesta del apoyo, y produce también las animaciones de `explain`. `ledger_scene_prize_ledger` es nativa: el libro con una fila por premio, la columna del aporte llenándose y el morph de cada fila a su término; parametrizada por premios y chances. `urn_scene_frequency_bar_stabilizes` se reúsa del nodo 34, acá dibujando el promedio acumulado en vez de una frecuencia: la misma curva calmándose contra la misma línea punteada, que ahora es el apoyo. Ninguna lleva texto rasterizado: valores, chances y el corchete de `E[X]` los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_expected_value` ([M](../../M-calculadora/M0-progresion.md)), que toma una distribución armada con fichas, es decir, una tabla de valores con sus probabilidades, y devuelve `E[X]`. No devuelve solo el número: dibuja al costado el eje con las barras y el apoyo puesto, y avisa si las probabilidades no suman uno mostrando la pesa faltante. La operación queda disponible en el sandbox. Si el nodo decae, el apoyo aparece flojo y la tabla oscila un poco antes de quedarse quieta.

**Edad universal:** el nodo es `icons` porque las marcas del eje llevan dígitos y el libro tiene una columna de chances escritas como fracciones ([Q](../../Q-edad-universal.md)). El gesto central, arrastrar el apoyo hasta que la tabla quede horizontal, se juega sin leer y sin números: es motricidad y equilibrio. Los ítems de `explain` se resuelven entre animaciones y los prompts son de voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el libro con la columna de aportes y usa la calculadora en sandbox desde el principio; lo que no se le saltea es la corrida de mil boletos, porque es la única evidencia de que la esperanza es un promedio y no una definición.
