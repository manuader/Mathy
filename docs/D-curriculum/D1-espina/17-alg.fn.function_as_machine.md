# 17 — Una función es una máquina (`alg.fn.function_as_machine`)

> Locale `es`: "Una función es una máquina". Minijuego: [La máquina con nombre](../../F-minijuegos/alg.fn.function_as_machine.md).

**Nodo:** `alg.fn.function_as_machine` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `compose` · **Mecánica principal:** `machine_pipe` (secundarias `network_routes` y `sorter`) · **Literacy:** `icons` · **Analogía:** `function_machine`

## 1. Concepto

Una función es una regla que a cada cosa que se le da le hace corresponder exactamente una cosa. No es una fórmula, no es un cálculo y no es una ecuación por resolver: es una correspondencia, y lo único que la define es que a la misma entrada siempre le sale la misma salida. Al terminar, el jugador prueba una máquina con varias entradas, deduce su regla, la construye desde adentro, distingue una máquina de algo que no lo es porque una entrada le saca dos salidas, y le pone un nombre para hablar de ella sin describir su interior. Es el nodo que abre la rama de funciones y el punto donde el juego deja de resolver para empezar a describir.

## 2. Prerequisitos

- `prealg.var.unknown_as_box` (nodo 10): la letra que nombra una cantidad. Se usa el paso de "cantidad que no sé" a "cantidad cualquiera": la caja que escondía un valor fijo se convierte en la ranura por donde entra cualquier valor. Es un cambio de rol de la letra, no de la letra. Ese nodo declara este en su `transfer_to`.
- `arith.expr.precedence_tree` (nodo 9): la expresión como cadena de operaciones con un orden. Se usa la máquina como cadena: `3x + 2` es triplicar y después sumar dos, y el orden importa. La `machine_pipe` ya es una de las dos mecánicas de ese nodo, así que la mano viene aprendida.

Las dos aristas saltan hacia atrás: este nodo no depende de nada del bloque 13 a 16, y el grafo lo dice sin ambigüedad. Aprender qué es una función no exige saber resolver ecuaciones; encadenar los dos temas es costumbre escolar y no necesidad. El diagnóstico puede traer a un jugador acá directamente desde el nodo 10, y quien se atasca en sistemas puede avanzar por esta rama. La ubicación 17 es narrativa: el puesto de mercado del nodo 16 es el escenario natural para una regla que se aplica una y otra vez.

## 3. Dificultad cognitiva real

1. **Que la función no es lo que tiene adentro.** Dos máquinas con interiores distintos que responden igual a todas las entradas son la misma función, y una máquina se puede usar sin abrirla. Contra la idea de que "la función es la fórmula", el juego pone una decisión heredada de [G0](../../G-analogias/G0-reglas.md): la placa con la regla está separada del cuerpo, se puede tapar, y la máquina sigue funcionando.
2. **Que la letra cambió de rol.** En el nodo 10 la caja escondía un valor fijo que había que averiguar; acá la ranura acepta cualquiera y no hay nada que averiguar. Confundirlos hace que el jugador busque "cuánto vale x" donde no hay pregunta.
3. **Que una entrada tiene una salida y no dos.** Es la única condición que separa una función de una correspondencia cualquiera, y es contraintuitiva mientras el jugador solo haya visto reglas aritméticas, donde nunca falla. Hay que mostrarle correspondencias que no son funciones para que la condición signifique algo.
4. **Que hay entradas que la máquina no acepta.** No es un caso raro: es parte de su identidad. Una que reparte en partes iguales no acepta el cero como cantidad de partes.
5. **Que nombrar es una operación.** Ponerle `f` a una máquina es lo que permite guardarla, encadenarla y compararla con su inversa. Todo lo que viene después depende de que la máquina tenga nombre.

## 4. Problema intuitivo

Sigue donde terminó el nodo 16: la barra de una de las balanzas se endereza hasta quedar horizontal y se convierte en un tubo con una boca a la izquierda, un cuerpo opaco y una salida a la derecha. Los precios ya se saben; lo que cambia ahora es cuántas bolsas se llevan, y el mostrador responde solo.

En `real` la escena es el mismo puesto con una máquina de cobrar: se le entrega una cantidad de bolsas por la boca y por la salida cae el importe, sin que nadie vea el mecanismo. La pregunta, por voz o por gesto: si pongo esto, ¿qué va a salir?

En `intuition` la escena se detiene con el objeto adentro del tubo y el jugador predice la salida entre tres dibujadas. Después de tres o cuatro entradas la predicción deja de ser adivinanza. Y aparece la escena que instala la condición del nodo: una segunda máquina que, con la misma bolsa puesta dos veces, saca dos importes distintos, y ya no se puede predecir nada. Tres desenlaces dibujados: la que responde igual siempre, la que responde distinto con la misma entrada, y la que se traga una bolsa y no devuelve nada.

## 5. Analogía del mundo real

`function_machine` (mecánica `machine_pipe`) es la analogía del YAML ([G0](../../G-analogias/G0-reglas.md)). Mapa: máquina → función; ranura de entrada → argumento; salida → valor; placa de regla → fórmula; misma entrada, misma salida → buena definición; entrada que la máquina rechaza → fuera del dominio; todo lo que puede salir → rango. Invariante: `same_input_same_output`, que es la definición de función sin la palabra. Ruptura: `relations_that_are_not_functions`; una máquina no puede dar dos salidas para una entrada, y esa imposibilidad física es justamente lo que la hace buena analogía. Por eso su desvanecimiento está declarado recién en `formal`: la analogía aguanta hasta que el concepto la excede, no antes.

La placa separada del cuerpo es la parte más importante del mapa y responde a la analogía rechazada "la función es una fórmula". El cuerpo se puede tapar, o cambiar por otro con el mismo comportamiento, y la máquina sigue siendo la misma: una función es lo que hace, no cómo lo hace.

Las dos mecánicas secundarias aportan una cara cada una (convención 1 de la plantilla). `network_routes` da la vista de correspondencia: entradas a la izquierda, salidas a la derecha, la regla como manojo de flechas, y un punto del que salen dos flechas se ve mal desde lejos sin contar nada. `sorter` da la vista de clasificación: cada objeto cae en exactamente un cajón, y el que no cae en ninguno es una entrada rechazada, que es la imagen del dominio. Las tres se encuentran en un gesto: soltar la misma ficha dos veces y ver si el resultado coincide, sea la salida del tubo, el destino de la flecha o el cajón.

## 6. Mecánica de juego

Primera capa jugable: `concrete`, sin leer nada. Gestos: `drag` y `tap` ([E0](../../E-mecanicas/E0-catalogo.md)).

1. Una máquina con boca, cuerpo opaco y salida; al costado una bandeja de fichas de entrada; debajo una tabla vacía de dos columnas.
2. Demostración: una mano fantasma mete una ficha, la ficha recorre el cuerpo y por la salida cae otra; las dos quedan anotadas como una fila. La mano repite con otra ficha.
3. El jugador prueba entradas libremente y cada prueba agrega una fila. Volver a meter una ficha ya probada no agrega fila: la salida sale igual y la fila existente late. Ese es el invariante del nodo, y se enseña dejando que el jugador lo compruebe cuando quiera.
4. Con tres o cuatro filas, el juego pide una predicción antes de la siguiente prueba. Cada acierto vuelve el cuerpo más transparente; al tercero se ve el mecanismo y aparece la placa con la regla, que se puede tapar con un dedo sin que la máquina deje de andar.
5. Construir una máquina: el cuerpo se abre y se le arrastran fichas de operación adentro, en fila, hasta que la tabla coincide con una tabla objetivo. Con las operaciones en el otro orden la máquina anda igual de bien, pero la tabla no coincide y la diferencia se ve fila por fila; es el nodo 9 dentro de este.
6. Máquinas que no lo son: en la vista de red hay configuraciones con un punto de la izquierda del que salen dos flechas. Al meter esa entrada en el tubo, la máquina se traba, vibra y saca las dos salidas por la misma boca, que no entran juntas. No hay cartel: hay atasco.
7. Entradas rechazadas: algunas fichas no pasan por la boca, que tiene una forma. Aparecen primero como una máquina de repartir a la que se le dan cero partes.
8. Nombrar: con la tabla completa, el jugador arrastra una etiqueta al cuerpo. Desde ahí la máquina se guarda en un estante y se vuelve a sacar, y la etiqueta es lo único que se ve del estante.

Nada se llama "incorrecto": una predicción fallida deja el cuerpo tan opaco como estaba, y una máquina mal construida produce una tabla que no coincide, fila por fila.

## 7. Representación visual

Capa `visual`, con `compose` dominante y `relate` y `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

`compose` manda porque la máquina es una cadena: el cuerpo transparente muestra la ficha atravesando una operación y después otra, y cambiar el orden cambia lo que sale, a la vista. Se desplaza la ficha a lo largo del tubo; se conserva la correspondencia entre lo que entró y lo que salió, anotada en la tabla.

`relate` (apoyo) es la vista de red, y es la que hace visible la condición del nodo: dos columnas de puntos y exactamente una flecha saliendo de cada punto de la izquierda. Es la misma primitiva que sostiene los grafos, y por eso la vista se puede pedir con un toque. `partition` (apoyo) es la vista de cajones: cada entrada cae en uno solo y las que no caen en ninguno son las rechazadas; la tabla de dos columnas es esa misma vista en filas.

Las tres vistas son del mismo objeto y se conmutan sin cambiar de pantalla: el tubo se abre en dos columnas de puntos, las columnas se ordenan en cajones, los cajones se aplanan en filas. Todavía no hay grilla ni rastro: el par entrada-salida no se dibuja como punto, porque las coordenadas nacen en el nodo siguiente.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Ficha de entrada → letra en la boca.** Al probar la quinta entrada en `visual`, la bandeja se contrae en una sola ficha con `x`, apoyada en la boca. Es la caja del nodo 10 con su rol nuevo: no esconde un valor, admite cualquiera.
2. **Cuerpo transparente → regla en la placa.** Las operaciones que el jugador vio pasar se contraen en `3x + 2` sobre la placa, que sigue separada y se sigue pudiendo tapar.
3. **Etiqueta → nombre.** La etiqueta arrastrada se convierte en `f` sobre el cuerpo, y el estante muestra las máquinas por su nombre.
4. **Boca y salida → paréntesis.** Al meter una ficha en una máquina con nombre, la boca se cierra alrededor y queda `f(4)`, con los paréntesis naciendo de sus bordes; la salida cae escrita al lado, `f(4) = 14`. Es el símbolo nuevo del nodo y llega acá, no antes.
5. **Fila de la tabla → igualdad general.** Al tapar y destapar la placa con la ficha `x` en la boca, la tabla entera se contrae en `f(x) = 3x + 2`. El renglón dice lo mismo que todas las filas juntas, y tocarlo las vuelve a desplegar.

## 9. Notación matemática

Queda `f(x) = 3x + 2`, y la evaluación `f(4) = 14`.

Este nodo **sí introduce un símbolo nuevo**, y es de los importantes: `f(x)`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), el problema que lo hizo necesario es nombrar una máquina para hablar de ella sin describir su interior, y el jugador lo sintió en el paso 8 de la mecánica: con tres máquinas en el estante, señalar no alcanza y describir el interior es largo y además es lo que no importa. Los paréntesis no son nuevos —nacieron en `arith.expr.precedence_tree` para indicar qué ocurre primero— pero acá reciben un segundo trabajo, marcar qué se le está dando a la máquina, y el juego lo hace explícito haciéndolos nacer de los bordes de la boca. La distinción entre `3(x + 2)`, donde el paréntesis agrupa, y `f(x + 2)`, donde señala una entrada, se juega en el último tramo con las dos escrituras enfrentadas y la máquina al lado.

## 10. Definición formal

Capa `formal`: texto corto con voz y la máquina al lado, de a una frase. "Una función asigna a cada entrada exactamente una salida." "Las entradas que la máquina acepta son su dominio; todo lo que puede salir es su rango." "Dos máquinas que responden igual a todas las entradas son la misma función, aunque por dentro sean distintas."

Condiciones y casos, verificados sobre el objeto: una correspondencia donde una entrada produce dos salidas no es función, y se ve como el atasco del paso 6; una donde dos entradas producen la misma salida sí lo es, y se ve como dos flechas que llegan al mismo punto, que no molesta a nadie. Una máquina puede tener entradas rechazadas y seguir siendo función sobre las que acepta. Y una puede dar siempre lo mismo: también es función, y es la que destruye la información de lo que entró, el `×0` del nodo 12 con otra piel, que prepara la pregunta incómoda de la teoría de llaves.

Ya jugado: las tres frases, en la capa concreta. Nuevo: "dominio" y "rango", que acá se enuncian y se desarrollan en `alg.fn.domain_range`.

## 11. Propiedades

- **Misma entrada, misma salida.** Define el nodo y todo lo demás depende de ella. Ligada a la ficha repetida que no agrega fila.
- **Dos entradas pueden compartir salida.** La condición es en un solo sentido. Ligada a las dos flechas que llegan al mismo punto, y es la que hace que no toda máquina tenga vuelta.
- **La función es su comportamiento, no su interior.** Ligada a la placa que se tapa y a las dos máquinas del estante con la misma tabla.
- **El orden de las operaciones internas cambia la máquina.** Ligada a la tabla que deja de coincidir fila por fila; es el nodo 9 dentro de este y la semilla del nodo 20.
- **Hay entradas que la máquina no acepta.** Ligada a la ficha que no pasa por la boca.
- **La máquina es la otra cara del cofre.** El cofre del nodo 12 mostraba una acción sobre un contenido escondido; la máquina muestra la misma acción sobre cualquier contenido que se le entregue. Ligada a la escena donde una cerradura se acuesta y se vuelve tubo. La teoría de "funciones como llaves" de [E0](../../E-mecanicas/E0-catalogo.md) se apoya en esta identificación, y sin ella el nodo 21 no tendría de dónde agarrarse.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias máquinas con tuberías, una ficha de entrada y una salida indicada; tocar la máquina que la produce. Los distractores son máquinas con las operaciones en otro orden o con un número cercano.
- `explain`: dos animaciones. En una la misma entrada se mete dos veces y sale siempre lo mismo; en la otra saca dos salidas distintas y la máquina se atasca. Tocar la que no es una máquina.
- `manipulate`: armar la máquina arrastrando fichas de operación adentro y probar entradas hasta que la tabla coincida con la objetivo. La validación es la tabla, no la expresión.
- `apply`: en la red de flechas, conectar cada entrada con exactamente una salida según la regla, contra el tiempo objetivo del nodo. Un punto con dos flechas no cierra el ítem.
- `generalize`: la máquina se convierte en una ficha con nombre y paréntesis; evaluar con entradas nuevas, incluidas letras, `f(a)` y `f(x + 1)`. Y decidir si dos máquinas del estante con interiores distintos son la misma.
- `transfer`: en la rueda del seno de `trig.fn.sine_as_height`, tocar la altura que la máquina de giro produce para el ángulo de entrada.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). El nodo **no declara misconceptions propias**; las que el selector espera vienen de los prerequisitos y se evalúan allí:

- **`variable_as_label`** (`replay_on_mechanic` sobre el libro de cuentas; catalogada en `prealg.var.unknown_as_box` y `alg.expr.distributive_tiles`). Acá es tratar la letra de la boca como un objeto en vez de como un lugar, y produce evaluaciones como `f(2) = 3x + 2`. El replay muestra la fila que no cierra.
- **`unwrap_order_inverted`** (`tree_unwrap` sobre el cofre; catalogada en `alg.eq.multi_step` y `arith.expr.precedence_tree`). Acá es armar la máquina con las operaciones en el orden equivocado, y el patrón muestra cuál capa envolvía a cuál.

El error propio del nodo —aceptar como máquina algo que da dos salidas para la misma entrada— no tiene entrada en el catálogo. El juego lo muestra con el atasco y con el punto de dos flechas resaltado en la red, y es el distractor de `explain`, así que alimenta Understanding aunque no clasifique en ninguna categoría de L. Lo mismo con leer la salida como una ecuación por resolver: el juego pone la balanza fantasma del nodo 13 y la muestra nivelada con cualquier valor.

## 13. Generalización

La analogía se retira tarde: su `fades_at_layer` es `formal` y no `symbolic`, y hay una razón. El tubo sigue siendo útil mientras la única estructura en juego sea "entra uno, sale uno", y eso no se agota con la notación: lo agota el momento en que hay que decidir si algo es o no es una función, que es una pregunta que la máquina no puede hacerse a sí misma. Hasta ahí se va reduciendo: primero siempre visible, después a demanda sobre la ficha `f`, después solo cuando una evaluación falla.

Variantes sin ayuda visual, en orden: evaluar con números; con negativos y fracciones; con letras y expresiones, `f(a + 1)`; deducir la regla de una tabla sin haber visto la máquina; decidir si dos reglas escritas distinto son la misma función; encontrar el dominio de una máquina que rechaza algo. Después, máquinas que no comen números: una que gira una figura, una que devuelve la primera letra de una palabra, una que devuelve el color opuesto, y una que devuelve "un color más claro" y por eso no es función.

El nodo está en `abstract` cuando el jugador decide si una correspondencia cualquiera es una función mirando solo la condición, sin pedir el tubo, reconoce dos escrituras distintas de la misma función y encuentra el dominio de una máquina que nunca vio. La forma completa de esa capa es `disc.rel.relation_as_arrows`, que trata la función como un conjunto de flechas y pregunta qué le falta a una relación para serlo.

## 14. Transferencia y concepto siguiente

Este es el nodo que más caminos abre de la espina, y conviene decir por qué antes de listarlos. Todo lo que viene después necesita poder nombrar una regla y hablar de ella: el gráfico es la foto de todas las salidas de una máquina, la pendiente es cuánto sube su salida por cada paso de la entrada, la composición son dos máquinas en serie, la inversa es una máquina que devuelve, el logaritmo es la máquina que deshace la exponencial. Los nodos 18 a 24 no son siete temas: son siete preguntas sobre el mismo objeto. Y fuera del álgebra, los nodos que lo declaran como prerequisito directo atraviesan cuatro áreas: `linalg.map.linear_transformation_2d`, `prob.rv.random_variable_as_machine`, `disc.rel.relation_as_arrows`, `trig.fn.sine_as_height` y `alg.rat.division_by_zero_hole`. Sin este nodo no se entra en ninguna de esas ramas; con él se entra en todas sin pasar por las ecuaciones.

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.linear_transformation_2d` (`grid_stretch`): la máquina come vectores, y su placa de regla es una tabla que dice adónde fueron a parar dos flechas. Se transfiere que la máquina se conoce por lo que hace con cada entrada.
- `prob.rv.random_variable_as_machine` (`urn_dice`): entra un resultado de un sorteo y sale un número. Es la misma condición aplicada a un espacio donde el jugador esperaba azar y encuentra una función.
- `disc.rel.relation_as_arrows` (`network_routes`): la vista de red se queda sola y se vuelve el objeto, y la pregunta se invierte: dado un manojo de flechas cualquiera, ¿qué le falta para ser función?
- `trig.fn.sine_as_height` (`construct`): entra un ángulo y sale una altura, sin aritmética visible adentro; hay una rueda y un punto, y la altura es una construcción. Es el caso que más lejos lleva la propiedad de que la función es su comportamiento y no su fórmula.

Concepto siguiente: `alg.fn.graph_as_picture` ([18](18-alg.fn.graph_as_picture.md)). El nodo termina con la tabla llena y la máquina nombrada, y con una pregunta que la tabla no responde: dice qué sale para cada entrada, pero no deja ver de un vistazo qué está haciendo. Frase puente, narrada sobre la tabla: "Esta máquina ya contestó cien veces y las respuestas están todas anotadas. ¿Y si en vez de leerlas una por una las marcamos todas juntas en el mismo lugar?". Las filas se despegan y se acomodan en el aire, cada una a la altura de su salida y en el lugar de su entrada, y lo que se dibuja es un rastro. El nodo 18 empieza ahí.

---

**Visualización:** dos escenas del YAML ([I](../../I-manim/I0-mapping.md)), las dos nativas porque corren sobre la máquina que el jugador está probando o armando. `pipe_machine_named_f` es la principal: la ficha entrando por la boca, recorriendo el cuerpo transparente, cayendo por la salida y anotándose en la tabla, y después la contracción de la tabla entera en el renglón con nombre y paréntesis; gramática `compose`. Parametrizada por la máquina y la lista de entradas, produce también las animaciones de `explain` y el ítem de `recognize` con varias máquinas en pantalla. `network_each_input_one_arrow` es la vista de red: los dos grupos de puntos, las flechas creciendo una por entrada y el punto del que salen dos, resaltado; gramática `relate`. Sostiene los ítems de `apply` y da la imagen de la condición del nodo. Se reúsan `pipe_two_machines_order_matters` (nodo 9) para construir la máquina y comprobar que el orden cambia la tabla, y `chest_pick_key_for_lock` (nodo 13) en la escena donde una cerradura se acuesta y se vuelve tubo. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_define_function` ([M](../../M-calculadora/M0-progresion.md)), la primera tecla estructural del jugador: no transforma una expresión, guarda una y le pone nombre. Se presenta como el estante de máquinas, y una vez guardada se aplica a cualquier ficha con el mismo gesto de meterla por la boca. Como manda M, la tecla nace con el espacio de su llave al lado: `op_inverse_function` queda como silueta y tocarla muestra el nodo que la abre, `alg.fn.inverse_function`. La pregunta incómoda del par está declarada desde acá: no toda máquina tiene máquina llave, y el jugador ya vio por qué en las dos flechas que llegan al mismo punto.

**Edad universal:** el nodo es `icons` porque la placa y la tabla llevan números y operadores y la etiqueta del nombre es un carácter. Lo demás se juega sin leer: meter una ficha y mirar qué sale es el gesto más simple del catálogo, la predicción se elige entre dibujos, el atasco no necesita palabras y la vista de red se lee de un vistazo a cualquier edad. Es, junto con el nodo 1, uno de los pocos de la espina cuya idea central —a cada cosa le corresponde exactamente una— se evalúa entera sin un solo número ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico, salta `real` e `intuition`, entra directamente en construir la máquina desde la tabla y usa el estante desde el primer ítem.
