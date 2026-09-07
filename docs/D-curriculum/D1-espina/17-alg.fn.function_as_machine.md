# 17 — Una función es una máquina (`alg.fn.function_as_machine`)

> Locale `es`: "Una función es una máquina". Minijuego: [La fábrica](../../F-minijuegos/alg.fn.function_as_machine.md).

**Nodo:** `alg.fn.function_as_machine` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `compose` · **Mecánica principal:** `machine_pipe` (secundarias `network_routes` y `sorter`) · **Literacy:** `icons` · **Analogía:** `function_machine`

## 1. Concepto

Una función es una regla que a cada entrada le asigna exactamente una salida. Al terminar, el jugador arma máquinas, las nombra, las evalúa con entradas nuevas incluidas letras, y distingue una máquina de algo que no lo es porque devuelve dos salidas distintas para la misma entrada. Antes usaba una expresión para calcular un resultado; ahora la usa para describir un comportamiento.

## 2. Prerequisitos

- `prealg.var.unknown_as_box` (nodo 10): la letra nombra una caja. Se usa la caja, pero con un giro que el nodo hace explícito: hasta acá escondía un valor fijo que había que descubrir, y ahora es una ranura donde entra cualquier valor.
- `arith.expr.precedence_tree` (nodo 9): la expresión como árbol de operaciones encadenadas. Se usan la tubería de dos máquinas, el orden que importa y la lectura de una expresión como secuencia de pasos.

Ninguna arista es la del orden escolar, donde las funciones llegan después de las ecuaciones y los sistemas. En [C0](../../C-knowledge-graph/C0-esquema.md) el nodo depende solo del 9 y del 10, así que podría jugarse mucho antes; ocupa el lugar 17 en la espina por una razón narrativa: el jugador necesita haber agotado la lectura "la letra es un número que hay que encontrar" para que el cambio de oficio se note.

## 3. Dificultad cognitiva real

Lo difícil no es evaluar una expresión sino cuatro capacidades:

1. **Cambiar el oficio de la letra.** En `x + 5 = 12` la `x` es un valor escondido; en `f(x) = x + 5` es cualquier valor. El nodo tiene que producir ese cambio a la vista, no darlo por sabido.
2. **Ver la regla como objeto.** La máquina existe aunque no haya nada adentro: se la puede nombrar, guardar, comparar y usar sin evaluarla. Es el primer objeto matemático del recorrido que no es un número ni una figura.
3. **Exigir determinismo.** La misma entrada produce siempre la misma salida.
4. **Exigir que todo lo que entra vaya a un solo lado.** Cada objeto que entra va a parar a algún lugar, y a uno solo. Es el invariante del clasificador, y prepara el dominio de `alg.fn.domain_range`.

## 4. Problema intuitivo

Una fábrica con una máquina grande. Una cinta lleva objetos hasta una ranura de entrada; por la salida caen transformados. En el frente hay una placa con un dibujo que describe qué hace.

En `intuition` la escena se detiene con dos pelotas idénticas listas para entrar. Dos desenlaces dibujados: las dos salen iguales; una sale grande y la otra chica. El jugador elige cuál corresponde a una máquina que funciona bien y después ve. Enseguida aparece una segunda máquina, sin placa, que saca resultados distintos para entradas iguales, y una luz roja se enciende sola.

## 5. Analogía del mundo real

`function_machine`, con la mecánica `machine_pipe` ([G0](../../G-analogias/G0-reglas.md)). Mapa: máquina → función; ranura de entrada → argumento; salida → valor; placa con la regla → fórmula; misma entrada y misma salida → buena definición; entrada que la máquina rechaza → fuera del dominio; todas las salidas que puede producir → imagen.

Invariante: la máquina es determinista.

Ruptura: `relations_that_are_not_functions`. Una regla que asigna dos salidas a una entrada no es una máquina, y la analogía no la puede representar sin romperse. Esa ruptura es lo mejor que tiene: el nodo la usa como criterio en lugar de esconderla, y el jugador ve encenderse la luz roja. La ruptura completa se explora en `disc.rel.relation_as_arrows`.

Las dos analogías secundarias miran la misma estructura desde afuera: con `network_routes` la condición es que de cada punto de entrada salga exactamente una flecha, y con `sorter`, que cada objeto caiga en un cajón y en uno solo. La tubería dice qué hace la regla; la red y el clasificador, qué la hace legítima.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Mecánica principal `machine_pipe`, con `network_routes` y `sorter` desde los niveles intermedios ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Una máquina en el centro con la ranura arriba, la salida abajo y la placa vacía. A la izquierda, la bandeja de fichas; a la derecha, una tabla vacía.
2. Demostración: una mano fantasma deja caer una ficha en la ranura, la máquina vibra y por la salida cae otra. Las dos quedan registradas como una fila de la tabla. La mano repite con la misma ficha y sale lo mismo; la fila se ilumina en vez de duplicarse.
3. El jugador arrastra fichas a la ranura. La placa sigue vacía: la regla es un secreto que se descubre probando.
4. Desde el segundo nivel, el jugador arma la máquina: abre la tapa y arrastra fichas de operación adentro, en fila. Al cerrar la tapa, la placa dibuja la cadena.
5. Máquina rota: cuando construye una regla ambigua, la segunda salida cae por un tubo lateral y la luz roja se enciende.
6. En la red, arrastrar flechas desde cada punto de entrada. Un punto con dos flechas hace parpadear las dos; uno sin flecha queda apagado. En el clasificador, un objeto que cae entre dos cajones rebota.
7. Verificación con `cs.alg.one_input_one_output`: la tabla se recorre entera y cada fila se comprueba contra la placa.

La luz roja, la flecha doble y el objeto que rebota son tres consecuencias distintas del mismo problema.

## 7. Representación visual

Capa `visual`, con `compose` como primitiva dominante ([H](../../H-progresion-abstraccion.md)).

La máquina se aplana en un rectángulo con una flecha que entra y una que sale, y la placa se convierte en la cadena de operaciones escrita adentro. Las fichas se vuelven puntos que viajan por las flechas, y la tabla crece con una fila por viaje.

Se desplaza el punto a lo largo de la flecha, y ese desplazamiento es la evaluación; se conserva la regla, lo único que no cambia entre un viaje y otro; se escala la salida cuando la regla incluye un factor.

La red se dibuja como dos columnas de puntos unidas por flechas. El clasificador, como una fila de cajones y una regla en la tapa.

Todavía no hay nombre para la máquina ni paréntesis de evaluación.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Placa → expresión.** Al cerrar la tapa por primera vez en `visual`, la cadena de fichas se acomoda en un renglón dentro de la máquina: `· 3` seguido de `+ 1` se vuelve `3□ + 1`, con la caja del nodo 10 en el lugar de la entrada.
2. **Caja → `x`.** Al meter la primera ficha con la placa ya escrita, la caja se contrae en `x` y el renglón queda `3x + 1`. El jugador ve que la ficha ocupa la `x` por un instante y después se va.
3. **Máquina → nombre.** Cuando hay dos máquinas en pantalla, tocar el frente de una contrae la carcasa hasta ser una etiqueta con una letra, `f`. La máquina no desapareció: se volvió su nombre.
4. **Ranura → paréntesis.** Al arrastrar una ficha hacia la etiqueta `f`, la ranura se separa de la carcasa, se afina y queda como los dos arcos del paréntesis del nodo 14, con la ficha adentro: `f(2)`. La salida aparece a la derecha de un igual.
5. **Tabla → fórmula.** La tabla se contrae en un renglón, `f(x) = 3x + 1`, donde la columna de entradas se volvió la `x` del paréntesis y la de salidas la expresión.

## 9. Notación matemática

Queda `f(x) = 3x + 1`, y su uso, `f(2) = 7`.

El símbolo nuevo es la **notación de función**. El problema que la hace necesaria es el del paso 3: en cuanto hay dos máquinas en pantalla, no alcanza con escribir la expresión, porque hay que decir cuál se está usando; y en cuanto hay que aplicarla a una entrada concreta, no alcanza con el nombre, porque hay que decir a qué se aplica. Es la regla de oro de [H](../../H-progresion-abstraccion.md): el símbolo aparece cuando el jugador ya sintió la falta.

Acá se fija además, mientras la máquina todavía está en pantalla, que `f(x)` no es `f` multiplicado por `x`. El paréntesis es una ranura, no una yuxtaposición. La convención del nodo 15 y esta compiten por la misma escritura, y el jugador las distingue porque una viene de una pared y la otra de una ranura.

## 10. Definición formal

Capa `formal`: texto corto con voz y la red de flechas al lado. Tres frases, de a una: "Una función asigna a cada entrada exactamente una salida." "El conjunto de entradas que acepta es su dominio; el de salidas que produce, su imagen." "Dos funciones son iguales si dan la misma salida para toda entrada, aunque sus reglas estén escritas distinto."

Condiciones y casos especiales, verificados sobre el objeto: la misma salida puede venir de varias entradas y sigue siendo función; una entrada con dos salidas no lo es; una función puede rechazar entradas, y la máquina las escupe sin procesar, lo que anticipa `alg.rat.division_by_zero_hole`; y `3x + 1` y `x + x + x + 1` son la misma función escrita de dos maneras.

Ya jugado: las tres frases, la primera desde el primer nivel. Nuevo: las palabras "dominio" e "imagen" y el criterio de igualdad de funciones.

## 11. Propiedades

- **Determinismo.** La misma entrada da siempre la misma salida. Ligada a la fila de la tabla que se ilumina en vez de duplicarse.
- **Cada entrada tiene exactamente una flecha.** Ligada a la red, donde un punto sin flecha queda apagado y uno con dos hace parpadear las dos.
- **Cada objeto cae en un cajón y en uno solo.** Ligada al clasificador.
- **Dos escrituras distintas pueden ser la misma función.** Ligada a las dos máquinas que producen la misma tabla.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias máquinas con tuberías. Tocar la que, ante la ficha de entrada mostrada, produce la salida indicada.
- `explain`: dos animaciones. En una la misma entrada produce siempre la misma salida; en la otra una entrada saca dos salidas distintas por tubos diferentes. Tocar la que no es una máquina.
- `manipulate`: armar la máquina arrastrando fichas de operación dentro de la caja y probar entradas hasta que la tabla coincide con la tabla objetivo.
- `apply`: en la red de flechas, conectar cada entrada con exactamente una salida según la regla de la máquina, contra el tiempo objetivo del nodo.
- `generalize`: la máquina se convierte en una ficha con nombre y paréntesis. Evaluar la ficha con entradas nuevas, incluidas letras: `f(a)`, `f(x + 1)`.
- `transfer`: en la rueda del seno de `trig.fn.sine_as_height`, tocar la altura que la máquina de giro produce para el ángulo de entrada.

El nodo declara la lista de misconceptions vacía. El error central de acá, leer una regla ambigua como si fuera una función, no está catalogado porque no es un procedimiento equivocado sino la ruptura declarada de la analogía: se trata con la luz roja y la flecha doble  y queda registrado como evento de invariante roto. Los errores catalogados vienen de los prerequisitos y se aplican con la regla de [L0](../../L-modelo-errores/L0-taxonomia.md) sobre la mecánica de la explicación.

- **`variable_as_label`**, heredada del nodo 10. El jugador lee `f(x)` como `f` por `x` y lo distribuye, o escribe `f(a + b) = f(a) + f(b)`. Su mecánica declarada es `ledger`, que este nodo no tiene; el jugador ya la conoce desde el nodo 10, así que corre el caso 2 de la regla y la explicación se presenta como un regreso al libro de cuentas: la columna `f` se intenta abrir y no tiene contenido propio, porque `f` no cuenta piezas sino que las transforma. Voz: "El paréntesis no es multiplicar. ¿Qué pasa si metés la suma entera en la ranura?".
- **`unwrap_order_inverted`**, heredada del nodo 14. Al encadenar dos máquinas, el jugador las arma en el orden en que las leyó y no en el que operan. Su mecánica declarada es `chest_key`, que este nodo tampoco tiene, y el jugador la conoce del nodo 14: caso 2 otra vez. El patrón `tree_unwrap` dibuja la cadena como cofres anidados por un instante, muestra cuál envuelve a cuál y vuelve a la tubería con las máquinas en el orden real. Voz: "Esta máquina recibe lo que sale de la otra. ¿Cuál va primero?".

## 13. Generalización

La analogía se retira en `formal`, más tarde que en los nodos anteriores. La razón es que la máquina no representa un objeto que la notación reemplaza, como la fruta, sino una estructura que la notación conserva: `f(x)` sigue teniendo una ranura y una salida cuando ya no hay dibujo. La carcasa se apaga cuando el jugador evalúa con letras sin pedirla; la red y el clasificador se retiran antes, en cuanto el criterio de una flecha por entrada se aplica sin dibujarlas.

Variantes sin ayuda visual, en orden: evaluar con letras y con expresiones (`f(x + 1)`); comparar dos escrituras y decidir si son la misma función; encontrar la regla a partir de una tabla, con dos reglas que la explican y una entrada extra que las separa; máquinas que rechazan alguna entrada; y máquinas encadenadas, que preparan `alg.fn.composition`.

El nodo está en `abstract` cuando el jugador trata la función como objeto: la nombra, la evalúa con lo que sea, decide si dos son iguales sin evaluar todas las entradas, y separa una función de una regla ambigua dando un contraejemplo propio.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.linear_transformation_2d` (`grid_stretch` y `machine_pipe`): la máquina que recibe una flecha y devuelve otra.
- `prob.rv.random_variable_as_machine` (`machine_pipe` y `urn_dice`): la máquina que recibe un resultado del sorteo y devuelve un número. Lo azaroso es lo que entra, no la máquina,.
- `disc.rel.relation_as_arrows` (`network_routes` y `machine_pipe`): la red donde un punto puede tener varias flechas. Es la ruptura de la analogía convertida en objeto de estudio.
- `trig.fn.sine_as_height` (`construct`, `machine_pipe` y `slope_walker`): la máquina que recibe un ángulo y devuelve una altura.

Concepto siguiente: `alg.fn.graph_as_picture` ([18](18-alg.fn.graph_as_picture.md)). Frase puente, narrada sobre la tabla llena de la última máquina: "Tenés todas las salidas anotadas en una lista. ¿Y si en vez de anotarlas las dibujaras?". Cada fila se despega y sale volando hasta su lugar sobre una grilla, dejando un rastro de puntos, y el nodo 18 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `pipe_machine_named_f` es nativa: recibe la regla y una lista de entradas, y dibuja las fichas viajando por la máquina mientras la tabla se llena; gramática `compose`. Produce las animaciones de `explain`, porque puede recibir una regla ambigua y sacar dos salidas por tubos distintos. `network_each_input_one_arrow` es nativa: dibuja los puntos con sus flechas, haciendo parpadear los que tienen dos y apagando los que no tienen ninguna; gramática `relate`. Es la imagen de cheatsheet de `cs.alg.one_input_one_output`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_define_function` ([M](../../M-calculadora/M0-progresion.md)), la primera operación estructural del recorrido: no calcula, guarda. El jugador arma una regla con fichas, le pone un nombre de una letra y a partir de ahí ese nombre está disponible en el teclado de fichas como cualquier operador. Evaluarla escribe el renglón `f(2) = 7` y ofrece desplegar la tabla. Si el nodo decae, las funciones guardadas quedan visibles pero no evaluables.

**Edad universal:** el nodo es `icons` porque las fichas de operación dentro de la máquina llevan operador y dígito desde el segundo nivel ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: la máquina por su forma, la luz roja, la flecha doble, el objeto que rebota, `explain` entre dos animaciones y prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel donde arma la máquina y suele conocer la notación `f(x)` sin haberla entendido como determinismo; para él el nodo empieza por la máquina rota y la red.
