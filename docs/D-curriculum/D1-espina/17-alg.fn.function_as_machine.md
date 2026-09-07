# 17 — Una función es una máquina (`alg.fn.function_as_machine`)

> Locale `es`: "Una función es una máquina". Minijuego: [La fábrica](../../F-minijuegos/alg.fn.function_as_machine.md).

**Nodo:** `alg.fn.function_as_machine` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `compose` · **Mecánica principal:** `machine_pipe` (secundarias `network_routes` y `sorter`) · **Literacy:** `icons` · **Analogía:** `function_machine`

## 1. Concepto

Una función es una regla que a cada entrada le asigna exactamente una salida. Al terminar, el jugador arma máquinas, las nombra, las evalúa con entradas nuevas incluidas letras, y distingue una máquina de algo que no lo es porque devuelve dos salidas distintas para la misma entrada. Antes usaba una expresión para calcular un resultado; ahora usa una expresión para describir un comportamiento.

## 2. Prerequisitos

- `prealg.var.unknown_as_box` (nodo 10): la letra nombra una caja. Se usa la caja, pero con un giro que el nodo tiene que hacer explícito: hasta acá la caja escondía un valor fijo que había que descubrir, y ahora la caja es una ranura donde entra cualquier valor. Es el mismo símbolo con dos oficios distintos, y confundirlos es la dificultad central.
- `arith.expr.precedence_tree` (nodo 9): la expresión como árbol de operaciones encadenadas. Se usan la tubería de dos máquinas, el orden que importa y la lectura de una expresión como una secuencia de pasos con una entrada y una salida.

Ninguna arista es la del orden escolar, donde las funciones llegan después de las ecuaciones y de los sistemas. En [C0](../../C-knowledge-graph/C0-esquema.md) este nodo depende solo del nodo 9 y del 10, así que podría jugarse mucho antes; ocupa el lugar 17 en la espina por otra razón, porque el jugador necesita haber agotado la lectura "la letra es un número que hay que encontrar" para que el cambio de oficio se note. Su posición es narrativa, no lógica.

## 3. Dificultad cognitiva real

Lo difícil no es evaluar una expresión sino cuatro capacidades:

1. **Cambiar el oficio de la letra.** En `x + 5 = 12` la `x` es un valor escondido; en `f(x) = x + 5` la `x` es cualquier valor. El nodo tiene que producir ese cambio de sentido a la vista, no darlo por sabido.
2. **Ver la regla como objeto.** La máquina existe aunque no haya nada adentro. Se la puede nombrar, guardar, comparar con otra y usar sin evaluarla. Es el primer objeto matemático del recorrido que no es un número ni una figura.
3. **Exigir determinismo.** La misma entrada produce siempre la misma salida. Suena trivial y no lo es: el jugador acepta con naturalidad reglas ambiguas hasta que ve una máquina escupir dos cosas distintas por el mismo tubo.
4. **Exigir totalidad sobre lo que entra.** Cada objeto que entra tiene que ir a parar a algún lado, y a uno solo. Es el invariante del clasificador, y prepara el dominio de `alg.fn.domain_range`.

Las dos últimas son las que justifican tres mecánicas: la tubería muestra la regla, la red muestra que cada entrada tiene una flecha y una sola, el clasificador muestra que cada objeto cae en un cajón y solo uno.

## 4. Problema intuitivo

Una fábrica con una máquina grande. Una cinta lleva objetos hasta una ranura de entrada; por la salida caen transformados. En el frente hay una placa con un dibujo que describe qué hace la máquina. Un operario mete una pelota roja y sale una pelota roja más grande.

En `intuition` la escena se detiene con dos pelotas rojas idénticas listas para entrar. Dos desenlaces dibujados: las dos salen iguales; una sale grande y la otra sale chica. El jugador elige cuál corresponde a una máquina que funciona bien y después ve. Enseguida la escena avanza: una segunda máquina, sin placa, saca resultados distintos para entradas iguales, y una luz roja se enciende sola. El jugador todavía no sabe por qué, pero ya vio la diferencia.

## 5. Analogía del mundo real

`function_machine`, con la mecánica `machine_pipe` ([G0](../../G-analogias/G0-reglas.md)). Mapa: máquina → función; ranura de entrada → argumento; salida → valor; placa con la regla → fórmula; misma entrada, misma salida → buena definición; entrada que la máquina rechaza → fuera del dominio; todas las salidas que puede producir → imagen.

Invariante: la máquina es determinista. Dos objetos iguales que entran producen dos objetos iguales que salen, siempre, sin importar el orden ni el momento.

Ruptura: `relations_that_are_not_functions`. Una regla que asigna dos salidas a una entrada no es una máquina, y la analogía no la puede representar sin romperse. Esa ruptura es lo mejor que tiene: el nodo la usa como criterio en lugar de esconderla, y el jugador ve la luz roja encenderse. La ruptura completa se explora en `disc.rel.relation_as_arrows`, donde las flechas sí admiten varias por entrada.

Las dos analogías secundarias miran la misma estructura desde afuera. Con `network_routes`, la máquina se abre en un diagrama de puntos y flechas: entradas a la izquierda, salidas a la derecha, y la condición es que de cada punto de la izquierda salga exactamente una flecha. Con `sorter`, la máquina se vuelve una fila de cajones y la condición es que cada objeto caiga en un cajón y en uno solo. La tubería dice qué hace la regla; la red y el clasificador dicen qué la hace legítima.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Mecánica principal `machine_pipe`, con `network_routes` y `sorter` desde los niveles intermedios ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Una máquina en el centro con la ranura arriba, la salida abajo y la placa en el frente, vacía. A la izquierda, una bandeja de fichas de entrada. A la derecha, una tabla de dos columnas también vacía.
2. Demostración: una mano fantasma toma una ficha, la deja caer en la ranura, la máquina vibra y por la salida cae otra ficha. Las dos quedan registradas como una fila de la tabla. La mano repite con la misma ficha y sale lo mismo; la fila se ilumina en vez de duplicarse.
3. El jugador arrastra fichas a la ranura. La tabla se llena sola. La placa sigue vacía: la regla todavía es un secreto que se descubre probando.
4. Desde el segundo nivel, el jugador arma la máquina. Abre la tapa y arrastra fichas de operación adentro, en fila. Al cerrar la tapa, la placa dibuja la cadena. Prueba entradas hasta que la tabla coincide con una tabla objetivo.
5. Máquina rota: cuando el jugador construye una regla ambigua, por ejemplo un desvío que manda la misma entrada a dos ramas, la segunda salida cae por un tubo lateral y la luz roja se enciende. La máquina sigue funcionando y el jugador puede quitar el desvío.
6. En la red, arrastrar flechas desde cada punto de entrada. Un punto con dos flechas hace parpadear las dos; un punto sin flecha queda apagado. En el clasificador, arrastrar objetos a los cajones; un objeto que cae entre dos cajones rebota.
7. Verificación con `cs.alg.one_input_one_output`: la tabla se recorre entera y cada fila se comprueba contra la placa.

Nada se llama incorrecto. La luz roja, la flecha doble y el objeto que rebota son tres consecuencias distintas del mismo problema.

## 7. Representación visual

Capa `visual`, con `compose` como primitiva dominante ([H](../../H-progresion-abstraccion.md)).

La máquina se aplana en un rectángulo con una flecha que entra y una que sale, y la placa se convierte en la cadena de operaciones escrita adentro. Las fichas se vuelven puntos que viajan por las flechas, y la tabla de la derecha crece con una fila por viaje.

Se desplaza el punto a lo largo de la flecha, y ese desplazamiento es la evaluación; se conserva la regla, que es lo único que no cambia entre un viaje y otro, y el juego lo subraya mostrando varios puntos viajando a la vez por la misma máquina; se escala la salida cuando la regla incluye un factor, y la longitud de la flecha de salida crece con ella.

La red se dibuja como dos columnas de puntos unidas por flechas, con las de entrada ordenadas. El clasificador se dibuja como una fila de cajones con la boca abierta y una regla en la tapa.

Todavía no hay nombre para la máquina ni paréntesis de evaluación: la máquina es un dibujo y la entrada es una ficha que cae.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Placa → expresión.** Al cerrar la tapa por primera vez en `visual`, la cadena de fichas de operación se acomoda en un renglón dentro de la máquina: `· 3` seguido de `+ 1` se vuelve `3□ + 1`, con la caja del nodo 10 en el lugar de la entrada.
2. **Caja → `x`.** Al meter la primera ficha con la placa ya escrita, la caja se contrae en `x` y el renglón queda `3x + 1`. El jugador ve que la `x` no es un valor a descubrir: la ficha que entra la ocupa por un instante y después se va.
3. **Máquina → nombre.** Cuando en pantalla hay dos máquinas distintas y el jugador necesita decir cuál usar, el juego pide que las marque. Al tocar el frente de una, la carcasa se contrae hasta ser una etiqueta con una letra, `f`. La máquina no desapareció: se volvió su nombre.
4. **Ranura → paréntesis.** Al arrastrar una ficha hacia la etiqueta `f`, la ranura se separa de la carcasa, se afina y queda como los dos arcos del paréntesis del nodo 14, con la ficha adentro: `f(2)`. La salida aparece a la derecha de un igual.
5. **Tabla → fórmula.** La tabla de dos columnas se contrae en un solo renglón, `f(x) = 3x + 1`, donde la columna de entradas se convirtió en la `x` del paréntesis y la de salidas en la expresión. Las filas quedan disponibles a demanda tocando el renglón.

## 9. Notación matemática

Queda `f(x) = 3x + 1`, y su uso, `f(2) = 7`.

El símbolo nuevo es la **notación de función**, `f(x)`. El problema que la hace necesaria es el del paso 3: en cuanto hay dos máquinas en pantalla, no alcanza con escribir la expresión, porque hay que decir cuál se está usando. Y en cuanto hay que aplicarla a una entrada concreta, no alcanza con el nombre, porque hay que decir a qué se aplica. El nombre resuelve lo primero, el paréntesis lo segundo, y los dos juntos son la notación. Es la regla de oro de [H](../../H-progresion-abstraccion.md): el símbolo aparece cuando el jugador ya sintió la falta.

Acá se fija además el punto que más adelante causa problemas, y por eso se dice mientras la máquina todavía está en pantalla: `f(x)` no es `f` multiplicado por `x`. El paréntesis es una ranura, no una yuxtaposición. La convención de yuxtaposición del nodo 15 y esta compiten por la misma escritura, y el jugador las distingue porque una viene de una pared y la otra de una ranura.

## 10. Definición formal

Capa `formal`: texto corto con voz y la red de flechas al lado. Tres frases, de a una: "Una función asigna a cada entrada exactamente una salida." "El conjunto de entradas que acepta es su dominio; el de salidas que produce, su imagen." "Dos funciones son iguales si dan la misma salida para toda entrada, aunque sus reglas estén escritas distinto."

Condiciones y casos especiales, verificados sobre el objeto: la misma salida puede venir de varias entradas y sigue siendo función, y en la red eso se ve como dos flechas que llegan al mismo punto; una entrada con dos salidas no lo es; una función puede rechazar entradas, y la máquina las escupe sin procesar, lo que anticipa `alg.rat.division_by_zero_hole`; una función puede ser constante, y entonces todas las flechas llegan al mismo punto; y las máquinas `3x + 1` y `x + x + x + 1` son la misma función escrita de dos maneras.

Ya jugado: las tres frases, la primera desde el primer nivel. Nuevo: las palabras "dominio" e "imagen" y el criterio de igualdad de funciones.

## 11. Propiedades

- **Determinismo.** La misma entrada da siempre la misma salida. Ligada a la fila de la tabla que se ilumina en vez de duplicarse cuando el jugador repite una entrada.
- **Cada entrada tiene exactamente una flecha.** Ligada a la red, donde un punto sin flecha queda apagado y un punto con dos hace parpadear las dos.
- **Cada objeto cae en un cajón y en uno solo.** Ligada al clasificador, y es el mismo enunciado con otra piel.
- **La regla no depende de la entrada.** La máquina es la misma antes y después de procesar. Ligada a los varios puntos que viajan a la vez por la misma flecha sin estorbarse.
- **Dos escrituras distintas pueden ser la misma función.** Ligada a las dos máquinas que producen la misma tabla, y que el juego permite fusionar en una sola.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias máquinas con tuberías. Tocar la que, ante la ficha de entrada mostrada, produce la salida indicada.
- `explain`: dos animaciones. En una la misma entrada produce siempre la misma salida; en la otra una entrada saca dos salidas distintas por tubos diferentes. Tocar la que no es una máquina.
- `manipulate`: armar la máquina arrastrando fichas de operación dentro de la caja y probar entradas hasta que la tabla coincide con la tabla objetivo.
- `apply`: en la red de flechas, conectar cada entrada con exactamente una salida según la regla de la máquina, contra el tiempo objetivo del nodo.
- `generalize`: la máquina se convierte en una ficha con nombre y paréntesis. Evaluar la ficha con entradas nuevas, incluidas letras: `f(a)`, `f(x + 1)`.
- `transfer`: en la rueda del seno de `trig.fn.sine_as_height`, tocar la altura que la máquina de giro produce para el ángulo de entrada.

El nodo declara la lista de misconceptions vacía en el grafo. El error central que aparece acá, leer una regla ambigua como si fuera una función, no está catalogado como misconception porque no es un procedimiento equivocado sino la ruptura declarada de la analogía; se trata con la luz roja y la flecha doble, dentro de la mecánica, y queda registrado como evento de invariante roto. Los errores que sí están catalogados vienen de los prerequisitos y se aplican con la regla de [L0](../../L-modelo-errores/L0-taxonomia.md) sobre la mecánica de la explicación.

- **`variable_as_label`**, heredada del nodo 10. El jugador lee `f(x)` como `f` por `x` y lo distribuye, o escribe `f(a + b) = f(a) + f(b)` para una máquina cualquiera. Su mecánica declarada es `ledger`, que este nodo no tiene entre las suyas; el jugador ya la conoce desde el nodo 10, así que corre el caso 2 de la regla y la explicación se presenta como un regreso al libro de cuentas: la columna `f` se intenta abrir y no tiene contenido propio, porque `f` no cuenta piezas sino que las transforma. Después la escena vuelve a la máquina y muestra las dos entradas por separado y la suma entrando entera, con salidas distintas. Voz: "El paréntesis no es multiplicar. ¿Qué pasa si metés la suma entera en la ranura?".
- **`unwrap_order_inverted`**, heredada del nodo 14. Al encadenar dos máquinas, el jugador las arma en el orden en que las leyó y no en el que operan. Su mecánica declarada es `chest_key`, que este nodo no tiene; el jugador ya la conoce del nodo 14, así que también corre el caso 2. El patrón `tree_unwrap` dibuja la cadena como cofres anidados por un instante y muestra cuál envuelve a cuál, y vuelve a la tubería con las dos máquinas en el orden real. Voz: "Esta máquina recibe lo que sale de la otra. ¿Cuál va primero?".

Los distractores de `explain` se generan desde las reglas `detect` de estas dos, más el catálogo de reglas ambiguas del generador.

## 13. Generalización

La analogía se retira en `formal`, más tarde que en los nodos anteriores, y el YAML lo declara así a propósito. La razón es que la máquina no representa un objeto que la notación reemplaza, como la fruta, sino una estructura que la notación conserva: `f(x)` sigue teniendo una ranura y una salida cuando ya no hay dibujo. La carcasa se apaga cuando el jugador evalúa con letras sin pedirla; la red y el clasificador se retiran antes, en cuanto el criterio de una flecha por entrada se aplica sin dibujarlas.

Variantes sin ayuda visual, en orden: evaluar con letras y con expresiones (`f(x + 1)`); comparar dos escrituras y decidir si son la misma función; encontrar la regla a partir de una tabla, con dos reglas distintas que la explican y una entrada extra que las separa; máquinas que rechazan alguna entrada; y máquinas encadenadas, que preparan `alg.fn.composition`.

El nodo está en `abstract` cuando el jugador trata la función como objeto: la nombra, la evalúa con lo que sea, decide si dos son iguales sin evaluar todas las entradas, y separa una función de una regla ambigua dando un contraejemplo propio.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.linear_transformation_2d` (`grid_stretch` y `machine_pipe`): la máquina que recibe una flecha y devuelve otra. El determinismo se ve como que la grilla deforma siempre igual, y la regla es la deformación misma.
- `prob.rv.random_variable_as_machine` (`machine_pipe` y `urn_dice`): la máquina que recibe un resultado del sorteo y devuelve un número. Lo azaroso es lo que entra, no la máquina, y esa distinción es todo el nodo.
- `disc.rel.relation_as_arrows` (`network_routes` y `machine_pipe`): la red donde un punto puede tener varias flechas. Es la ruptura de la analogía convertida en objeto de estudio, y el criterio de este nodo pasa a ser lo que separa una relación de una función.
- `trig.fn.sine_as_height` (`construct`, `machine_pipe` y `slope_walker`): la máquina que recibe un ángulo y devuelve una altura. La entrada gira en círculo y la salida no, y esa es la primera función que se repite.

Concepto siguiente: `alg.fn.graph_as_picture` ([18](18-alg.fn.graph_as_picture.md)). Frase puente, narrada sobre la tabla llena de la última máquina: "Tenés todas las salidas anotadas en una lista. ¿Y si en vez de anotarlas las dibujaras?". Cada fila de la tabla se despega y sale volando hasta su lugar sobre una grilla, dejando un rastro de puntos, y el nodo 18 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `pipe_machine_named_f` es nativa: recibe la regla y una lista de entradas, y dibuja las fichas viajando por la máquina mientras la tabla se llena, con el morph de carcasa a etiqueta y el de ranura a paréntesis; gramática `compose`. Es la que produce las animaciones de `explain`, porque puede recibir una regla ambigua y sacar dos salidas por tubos distintos. `network_each_input_one_arrow` es nativa: recibe las entradas, la regla y una lista de flechas distractoras, y dibuja los puntos con sus flechas, haciendo parpadear los que tienen dos y apagando los que no tienen ninguna; gramática `relate`. Es la imagen de cheatsheet de `cs.alg.one_input_one_output`. Ninguna lleva texto rasterizado: la etiqueta de la máquina y las entradas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsan `pipe_two_machines_order_matters` (nodo 9) para el encadenado y como base del regreso a `unwrap_order_inverted`, y `ledger_box_hides_tokens` (nodo 10) para el regreso al libro en `variable_as_label`.

**Calculadora:** en `ready` se habilita `op_define_function` ([M](../../M-calculadora/M0-progresion.md)), la primera operación estructural del recorrido: no calcula, guarda. El jugador arma una regla con fichas, le pone un nombre de una letra y a partir de ahí ese nombre está disponible en el teclado de fichas como cualquier operador. Evaluarla escribe el renglón `f(2) = 7` y ofrece desplegar la tabla de entradas y salidas. Las funciones guardadas viven en un estante lateral de la calculadora y se pueden comparar de a dos, que es la forma en que el criterio de igualdad se practica fuera del minijuego. Si el nodo decae, el estante se cierra y las funciones guardadas quedan visibles pero no evaluables.

**Edad universal:** el nodo es `icons` porque las fichas de operación dentro de la máquina llevan operador y dígito desde el segundo nivel ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: la máquina por su forma, la luz roja, la flecha doble, el objeto que rebota entre cajones, `explain` entre dos animaciones y prompts por voz. La tabla de dos columnas no necesita encabezados porque las columnas están unidas por dibujo a la ranura y a la salida. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel donde arma la máquina y suele conocer la notación `f(x)` sin haberla entendido nunca como determinismo; para él el nodo empieza por la máquina rota y la red, que es donde la notación se vuelve una afirmación y no una etiqueta.
