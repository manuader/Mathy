# La máquina con nombre (`alg.fn.function_as_machine`)

Minijuego del nodo 17 de la espina, "Una función es una máquina". Mecánica principal `machine_pipe`, secundarias `network_routes` y `sorter`; analogía `function_machine`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/17-alg.fn.function_as_machine.md): un concepto, cinco dificultades reales (que la función no es su interior, que la letra cambió de rol, que una entrada tiene una salida y no dos, que hay entradas rechazadas, y que nombrar es una operación), una analogía cuya placa de regla está separada del cuerpo a propósito, un gesto (meter la misma ficha dos veces y ver si coincide), cinco pasos de desvanecimiento, el tubo como visualización dominante con la red al lado, retiro recién en `formal`. Acá se fija cómo se juega.

## Analogía

Una máquina con una boca a la izquierda, un cuerpo opaco y una salida a la derecha. Al costado, una bandeja de fichas de entrada; debajo, una tabla vacía de dos columnas; encima del cuerpo, una placa vacía. Más adelante, un estante donde las máquinas se guardan por su nombre.

Mapa objeto → concepto: máquina → función; ranura de entrada → argumento; salida → valor; placa de regla → fórmula; misma entrada, misma salida → buena definición; entrada que la máquina rechaza → fuera del dominio; todo lo que puede salir → rango.

La placa está separada del cuerpo y se puede tapar con un dedo, y la máquina sigue andando. Esa separación es la decisión de diseño más importante del minijuego: es lo que impide que el jugador aprenda "la función es la fórmula", que [G0](../G-analogias/G0-reglas.md) lista como analogía rechazada. Punto de ruptura: `relations_that_are_not_functions`. Una máquina no puede dar dos salidas para una entrada, y esa imposibilidad física es lo que la hace buena analogía; por eso se desvanece recién en `formal`, cuando el curriculum necesita mirar de frente correspondencias que no son funciones.

## Mecánica central

Superficie: la máquina en el centro, la bandeja de fichas a la izquierda, la tabla abajo, el estante a la derecha desde que hay nombres. Tres vistas del mismo objeto —tubo, red de flechas, cajones— que se conmutan con un toque sin cambiar de pantalla. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Meter una ficha por la boca.** Recorre el cuerpo y por la salida cae otra. Las dos quedan anotadas como una fila de la tabla.
- **Volver a meter una ficha ya probada.** Sale lo mismo y no se agrega fila: la fila existente late. Es el invariante del nodo, y el jugador puede comprobarlo cuando quiera.
- **Predecir.** Con tres o cuatro filas, el juego pide la salida antes de la prueba. Cada acierto vuelve el cuerpo un poco más transparente; al tercero se ve el mecanismo y aparece la placa con la regla.
- **Tapar la placa.** Con un dedo. La máquina sigue funcionando y la tabla se sigue llenando. Es el gesto que enseña que la función no es su fórmula.
- **Abrir el cuerpo y armar la máquina.** Se le arrastran fichas de operación adentro, en fila, y se prueban entradas hasta que la tabla coincide con una objetivo. Con las operaciones en el otro orden la máquina anda, pero la tabla no coincide y la diferencia se ve fila por fila.
- **Conmutar a la vista de red.** El tubo se abre en dos columnas de puntos y las flechas aparecen una por fila de la tabla. Un punto de la izquierda con dos flechas se ve mal desde lejos.
- **Meter una entrada que sale dos veces.** La máquina se traba, vibra y las dos salidas no entran juntas por la misma boca. La escena queda atascada. No hay cartel: hay atasco.
- **Meter una ficha que la boca no acepta.** No pasa. La boca tiene una forma y la ficha no entra.
- **Arrastrar una etiqueta al cuerpo.** La máquina queda nombrada y se puede guardar en el estante, donde lo único visible es el nombre.
- **Sacar dos máquinas del estante y compararlas.** Se prueban las dos con las mismas entradas; si todas las filas coinciden, los dos cuerpos se funden en uno y el estante queda con una sola máquina.

En `symbolic` la superficie cambia de forma y no de reglas: la máquina es la ficha `f`, meter una entrada es soltar una ficha sobre ella, y la tabla se abre tocando el renglón. Las tres vistas siguen a un toque.

## Invariante matemático

`same_input_same_output` (tubo): a la misma entrada le corresponde siempre la misma salida. Es la definición de función sin la palabra. Se ve confirmarse en la ficha repetida que no agrega fila, y romperse en el atasco de la máquina que devuelve dos.

`connections_independent_of_drawing` (red): la correspondencia es el manojo de flechas, no cómo están dibujados los puntos. Mover un punto no cambia nada, y por eso la condición se puede leer desde cualquier disposición.

`every_object_exactly_one_bin` (cajones): cada entrada cae en un solo cajón, y las que no caen en ninguno son las rechazadas. Es el mismo enunciado con otra piel, y es el que da la imagen del dominio.

Un movimiento válido pero inútil —probar una entrada que ya está en la tabla, conmutar de vista sin necesidad, armar una máquina con una operación de más que se cancela— no rompe nada. La fila late o la tabla coincide igual; se recibe un empujón suave y ninguna explicación.

## Representación visual

Primitiva dominante `compose`, de apoyo `relate` y `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: el puesto del mercado con una máquina de cobrar. Se le entregan bolsas y cae el importe; nadie ve el mecanismo. Solo se mira.
- `intuition`: la escena se detiene con el objeto adentro del tubo y el jugador predice entre tres salidas dibujadas. Después aparece la segunda máquina, que con la misma bolsa saca dos importes distintos, y la predicción deja de ser posible. Tres desenlaces: la que responde igual siempre, la que responde distinto, y la que se traga la bolsa y no devuelve nada.
- `concrete`: máquina con boca, cuerpo opaco y salida; bandeja de fichas; tabla de dos columnas; placa vacía. Nada escrito.
- `visual`: el cuerpo se vuelve transparente y muestra la ficha atravesando una operación y después otra. Al costado, las otras dos vistas: dos columnas de puntos con una flecha por entrada, y una fila de cajones donde cada ficha cae en uno solo.
- `symbolic`: la ficha `x` en la boca, la regla en la placa, el nombre `f` sobre el cuerpo, la evaluación escrita al lado, y el renglón `f(x) = 3x + 2` que se despliega en la tabla al tocarlo.
- `formal`: la definición corta con voz y la máquina al lado, con la vista de red a un toque para decidir casos.

No hay grilla ni rastro en ninguna capa: el par entrada-salida no se dibuja como punto, porque las coordenadas nacen en el nodo siguiente.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables.

1. Ficha de entrada → letra en la boca: al probar la quinta entrada en `visual`, la bandeja se contrae en una sola ficha con `x`, apoyada en la boca. Es la caja del nodo 10 con rol nuevo: no esconde un valor, admite cualquiera.
2. Cuerpo transparente → regla en la placa: las operaciones que el jugador vio pasar se contraen en `3x + 2` sobre la placa, que sigue separada del cuerpo y se sigue pudiendo tapar.
3. Etiqueta → nombre: la etiqueta arrastrada se convierte en `f` sobre el cuerpo, y el estante empieza a mostrar máquinas por su nombre.
4. Boca y salida → paréntesis: al meter una ficha en una máquina con nombre, la boca se cierra alrededor y queda `f(4)`, con los paréntesis naciendo de los bordes de la boca; la salida cae escrita al lado, `f(4) = 14`.
5. Tabla → igualdad general: al tapar la placa y volver a destaparla con la ficha `x` en la boca, la tabla entera se contrae en `f(x) = 3x + 2`. Tocar el renglón vuelve a desplegar cada fila.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la máquina: una función asigna a cada entrada exactamente una salida; las entradas que la máquina acepta son su dominio y todo lo que puede salir es su rango; dos máquinas que responden igual a todas las entradas son la misma función aunque por dentro sean distintas. Propiedades: misma entrada, misma salida; dos entradas pueden compartir salida, y por eso no toda máquina tiene vuelta; la función es su comportamiento y no su interior; el orden de las operaciones internas cambia la máquina; hay entradas que no se aceptan. Casos: una correspondencia con una entrada de dos salidas no es función, y se ve como el atasco; una máquina que da siempre lo mismo sí lo es, y es la que destruye la información de lo que entró, el `×0` del nodo 12 con otra piel. Símbolo nuevo: `f(x)`, que nace del problema de nombrar una máquina para hablar de ella sin describir su interior. Se guarda en `cs.alg.function_notation_f_of_x` y `cs.alg.one_input_one_output`.

## Generalización

La analogía se retira tarde, en `formal`, y no antes. El tubo sirve mientras la estructura sea "entra uno, sale uno", y eso no se agota con la notación: se agota cuando hay que decidir si algo es o no es una función, que es una pregunta que la máquina no puede hacerse a sí misma. Hasta ahí el tubo se reduce por etapas: siempre visible, después a demanda sobre la ficha `f`, después solo cuando una evaluación falla.

Variantes sin ayuda visual, en orden: evaluar con números; con negativos y fracciones; con letras y expresiones, `f(a + 1)`; deducir la regla de una tabla sin haber visto la máquina; decidir si dos reglas escritas distinto son la misma función; encontrar el dominio de una máquina que rechaza algo. Después, máquinas que no comen números: una que gira una figura, una que devuelve la primera letra de una palabra, una que devuelve el color opuesto, y una que devuelve "un color más claro" y por eso no es función. Cuando el jugador decide mirando solo la condición, sin pedir el tubo, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md) (convención 4 de la plantilla): este minijuego no continúa ninguno de los dos. El de frutas es de sistemas y el de cofres es de ecuaciones. El único punto de contacto es el nivel 2 del ejemplo de cofres, donde cada color de cofre tiene una acción visible —el azul desplaza tres, el rojo triplica— y el jugador ve la acción actuando sobre lo que entra. Eso es una máquina sin nombre, jugada desde el lado del cofre. Este nodo la lee desde el otro lado: la cerradura era una máquina a la que solo se le podía dar un contenido escondido, y la máquina es una cerradura a la que se le puede dar cualquier cosa. La escena que hace explícito ese giro —una cerradura que se acuesta y se convierte en tubo— abre el nivel 6. Los niveles de este minijuego son propios.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Meter y mirar.** `concrete`, `recognize`. Una máquina, una operación adentro, fichas chicas. Probar libremente y ver la tabla llenarse. La ficha repetida no agrega fila.
2. **Adivinar antes.** `concrete`, `explain`. El juego pide la predicción antes de cada prueba. Tres aciertos vuelven transparente el cuerpo y aparece la placa. Dos operaciones adentro desde la mitad del nivel.
3. **Armar la máquina.** `concrete`, `manipulate`. El cuerpo se abre y se le arrastran operaciones. Hay una tabla objetivo. El orden de las operaciones importa y la tabla lo delata fila por fila.
4. **Puntos y flechas.** `visual`, `explain` y `apply`. Aparece la vista de red. Se conmuta con un toque y se conectan entradas con salidas. Aparecen las correspondencias que no son funciones y el atasco. Aparecen también las dos flechas que llegan al mismo punto, que sí es una función.
5. **La boca que no acepta.** `visual`, `manipulate` y `recognize`. Aparece la vista de cajones y las entradas rechazadas: la máquina de repartir a la que se le dan cero partes. Misma dificultad numérica.
6. **Ponerle nombre.** `symbolic`, `manipulate` y `apply`. La ficha `x` en la boca, la regla en la placa, la etiqueta que se vuelve `f`, los paréntesis que nacen de la boca y el estante. Abre con la cerradura que se acuesta y se vuelve tubo. Parámetros: rango numérico mayor, negativos y fracciones.
7. **Máquinas que no comen números.** `formal` y `abstract`, `generalize`. Definición corta con voz. Evaluar con letras y expresiones; decidir si dos máquinas del estante son la misma; encontrar el dominio; y máquinas de figuras, palabras y colores, incluida una que no es función. El teclado deja de ofrecer reglas prearmadas: el jugador arma la placa con fichas.

Qué endurece cada parámetro: la segunda operación adentro hace que el orden importe y trae el nodo 9 a la mano; la vista de red convierte la condición del nodo en algo que se ve y no que se calcula; las entradas rechazadas rompen la expectativa de que una máquina acepta todo, que es lo que hace posible `alg.fn.domain_range` y `alg.rat.division_by_zero_hole`; evaluar con expresiones rompe la lectura "la boca es para números"; las máquinas sin aritmética separan la función de la cuenta, que es el objetivo del nodo entero.

Desafíos de olimpíada: ningún desafío de [S](../S-desafios/S0-desafios.md) lista este nodo en su `requires`, así que el nodo no exige desafío para `mastered`. Es coherente con su papel: no es un nodo de resolver problemas sino de instalar el objeto con el que después se resuelven. Los desafíos donde la máquina reaparece están aguas abajo, en la rama de exponenciales y logaritmos y en la de cálculo.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro máquinas con tuberías, una ficha `4` mostrada y la salida `14` indicada. Tocar la que la produce. Los distractores son las mismas operaciones en otro orden y un número cercano.
- `explain`: dos animaciones. En una, la ficha `3` se mete dos veces y las dos veces sale `11`; en la otra, la ficha `3` sale una vez como `11` y otra como `9`, y la máquina se atasca. Tocar la que no es una máquina.
- `manipulate`: tabla objetivo con las filas `1→5`, `2→8`, `3→11`. Armar la máquina arrastrando `×3` y `+2` adentro, en ese orden, y probar hasta que las tres filas coincidan.
- `apply`: en la red de flechas, cinco puntos a la izquierda y seis a la derecha. Conectar cada entrada con exactamente una salida según la regla mostrada, contra el tiempo objetivo del nodo. Un punto con dos flechas no cierra el ítem.
- `generalize`: la máquina es la ficha `f` con la placa `2x − 1`. Evaluar `f(0)`, `f(−3)`, `f(a)` y `f(x + 1)`. Y dos máquinas del estante, una con `2(x + 3)` y otra con `2x + 6`: decidir si son la misma probándolas. Y una máquina de colores que devuelve "un color más claro": decidir que no es función.
- `transfer`: en la rueda del seno de `trig.fn.sine_as_height`, tocar la altura que la máquina de giro produce para el ángulo de entrada. También en `linalg.map.linear_transformation_2d` (la máquina come vectores), en `prob.rv.random_variable_as_machine` (entra un resultado del sorteo y sale un número) y en `disc.rel.relation_as_arrows` (qué le falta a un manojo de flechas para ser función).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). El nodo no declara ninguna propia en su registro del grafo.

- `variable_as_label`, patrón `replay_on_mechanic` sobre el libro de cuentas, catalogada en `prealg.var.unknown_as_box` y `alg.expr.distributive_tiles`. Acá toma la forma de tratar la letra de la boca como un objeto en vez de como un lugar, y produce evaluaciones como `f(2) = 3x + 2`. El replay corre sobre el libro y muestra la fila que no cierra.
- `unwrap_order_inverted`, patrón `tree_unwrap` sobre el cofre, catalogada en `alg.eq.multi_step` y `arith.expr.precedence_tree`. Acá es armar la máquina con las operaciones en el orden equivocado; el patrón muestra cuál capa envolvía a cuál.

El error propio del nodo —aceptar como máquina algo que da dos salidas para la misma entrada— no tiene entrada en el catálogo, y el juego lo resuelve con el atasco y con el punto de dos flechas resaltado en la red. Es el distractor de `explain`, así que alimenta Understanding sin clasificar en ninguna categoría de L. Lo mismo con leer `f(x) = 3x + 2` como una ecuación por resolver: la balanza fantasma del nodo 13 aparece y se nivela con cualquier valor.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `pipe_machine_named_f`, nativa. La ficha entrando por la boca, recorriendo el cuerpo transparente, cayendo por la salida y anotándose en la tabla; después la contracción de la tabla entera en el renglón con nombre y paréntesis; gramática `compose`. Parametrizada por la máquina y por la lista de entradas, produce las animaciones de `explain` y el ítem de `recognize` con varias máquinas en pantalla.
- `network_each_input_one_arrow`, nativa. Los dos grupos de puntos, las flechas creciendo una por entrada y el punto de la izquierda del que salen dos, resaltado; gramática `relate`. Sostiene los ítems de `apply` y da la imagen de la condición del nodo.
- Reusadas: `pipe_two_machines_order_matters` (nodo 9) para armar la máquina y comprobar que el orden cambia la tabla, y `chest_pick_key_for_lock` (nodo 13) en la escena que abre el nivel 6, donde una cerradura se acuesta y se convierte en tubo. Ninguna escena lleva texto rasterizado; la etiqueta del nombre y las cifras de la tabla las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_machine_rule`: `stages` (1 en el nivel 1, 2 desde el 2, 3 en el 7); `ops` por etapa en {add, sub, mul, div}; `operand_range` (1 a 9 hasta el nivel 5, hasta 30 desde el 6); `input_domain` (enteros positivos hasta el 5, negativos y fracciones desde el 6); `rejects` (ninguna hasta el nivel 4, una desde el 5); `seed`.
- `gen_input_tray`: `size`; `include_repeat`, verdadero siempre, para que la ficha ya probada esté disponible y el invariante se pueda comprobar solo; `include_rejected`, verdadero desde el nivel 5.
- `gen_arrow_network`: `left_points`, `right_points`; `is_function`, que decide si algún punto de la izquierda recibe dos flechas; `shared_target`, que fuerza dos entradas con la misma salida para que el jugador vea que eso sí está permitido.
- `gen_machine_pair`: dos máquinas con interiores distintos y `same_behavior` verdadero o falso, para los ítems de decidir si son la misma función.
- `gen_non_numeric_machine`: máquinas que reciben figuras, palabras o colores, con `is_function` como parámetro, para el cierre de `generalize`.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer —meter una ficha y mirar qué sale es el gesto más simple del catálogo, el atasco no necesita palabras y la vista de red se lee de un vistazo—, pero la placa de regla y la tabla llevan números y operadores desde el nivel 2, y la etiqueta del nombre es un carácter, así que el mínimo es `icons`. Es de los nodos donde la distancia entre lo que se puede jugar sin leer y lo que se puede evaluar sin leer es más chica: la idea central se comprueba entera sin un solo número, y los niveles 1 a 5 admiten un perfil que solo reconoce íconos. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma una ficha, la mete por la boca, la ficha recorre el cuerpo y cae por la salida, y las dos quedan anotadas en la tabla; la mano repite con otra ficha y después vuelve a meter la primera, que sale igual y hace latir su fila. La escena vuelve al inicio y la bandeja late. La demostración de conmutar a la vista de red es aparte, en el nivel 4, y es de un solo gesto: el tubo se abre en dos columnas y las flechas aparecen una por fila ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
