# 16 — Dos balanzas comparten cajas (`alg.sys.two_by_two`)

> Locale `es`: "Dos balanzas comparten cajas". Minijuego: [Dos balanzas, una caja](../../F-minijuegos/alg.sys.two_by_two.md).

**Nodo:** `alg.sys.two_by_two` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` (secundaria `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `two_balances_shared_boxes`

## 1. Concepto

Un sistema de dos por dos son dos igualdades que hablan de las mismas dos cantidades desconocidas al mismo tiempo. Ninguna alcanza sola: cada una admite infinitos pares, y solo el par que cumple las dos es la solución. Al terminar, el jugador toma dos balanzas con cajas marcadas iguales, elige entre reemplazar una caja por lo que la otra balanza le enseñó o combinar las dos para que un tipo de caja desaparezca, y llega a los dos valores sin probar números. Antes sabía despejar una incógnita; no sabía sostener dos a la vez.

## 2. Prerequisitos

- `alg.eq.multi_step` (nodo 14): la cadena de llaves sobre la balanza. Se usa entera —la pila de renglones, cada operación a los dos lados, la lectura de la envoltura, la verificación—, porque todo sistema termina en una ecuación de un solo tipo de caja y resolverla es exactamente ese nodo. `sign_flip_on_move` reaparece con dos líneas donde cruzar términos.
- `alg.expr.distributive_tiles` (nodo 15): repartir un factor sobre una suma. Se usa en el gesto central de la eliminación —multiplicar una balanza entera es repartir el factor sobre todos sus términos— y en el rechazo del libro de cuentas a juntar lo que no mide lo mismo, que impide sumar cajas de marcas distintas.

Ninguna arista sigue el orden escolar, donde los sistemas llegan como técnica nueva con su recetario. Acá no hay técnica nueva: la sustitución es cambiar una caja por su peso, que el jugador viene haciendo desde la verificación del nodo 13, y la eliminación es el invariante de la balanza aplicado a un objeto más grande. Lo único genuinamente nuevo es que hay dos.

## 3. Dificultad cognitiva real

1. **Que una caja significa lo mismo en las dos balanzas a la vez.** Es la dificultad central y no tiene que ver con calcular. Quien resolvió la primera balanza y obtuvo un peso para la caja `A` tiene que aceptar que ese peso ya está decidido para la otra, aunque la otra nunca lo haya dicho. La marca no es una etiqueta local: es un compromiso que vale en toda la pantalla.
2. **Que una sola igualdad no decide nada.** Con dos incógnitas, una balanza nivelada admite infinitos pares. El jugador tiene que sentir esa insuficiencia antes de que aparezca la segunda balanza, o la segunda parece un dato de más.
3. **Que hay dos caminos y los dos son legales.** Reemplazar, o combinar para que un tipo de caja se cancele. Elegir bien no es saber una regla: es mirar si alguna caja ya está sola en algún lado.
4. **Que una balanza entera se puede escalar.** Duplicarla es duplicar los dos platos y todos sus términos, cajas incluidas. Es el primer objeto del curriculum al que se le aplica una operación como bloque, y es el gesto que `linalg.sys.row_operations` llamará operación de fila.
5. **Que puede no haber solución, o haber infinitas.** Dos balanzas pueden decir cosas incompatibles o decir dos veces lo mismo, y en los dos casos el método corre y no llega a un par.

## 4. Problema intuitivo

Sigue donde terminó el nodo 15: los dos pisos que compartían la baldosa larga se levantan por el medio, sus marcos se vuelven barras y quedan dos balanzas lado a lado con una caja de la misma marca en las dos.

En `real` la escena es el puesto de mercado del nodo 13 con dos clientes y dos tickets. El primero se llevó dos bolsas de harina y una de azúcar y pagó una cantidad; el segundo, una de harina y tres de azúcar, y pagó otra. Los precios no están escritos. La pregunta, por voz o por gesto: ¿cuánto cuesta cada bolsa?

En `intuition` la escena se detiene con una sola balanza nivelada y dos tipos de caja. El juego ofrece tres pesos posibles para la caja `A` y muestra que la balanza se nivela con los tres, ajustando la otra caja: la balanza sola no elige. Entonces baja la segunda con una caja marcada igual y la pregunta cambia: de esos tres, ¿cuál sirve también acá? Tres desenlaces dibujados: las dos niveladas, la segunda inclinada, y la caja cambiada en una sola balanza mientras la otra se derrumba.

## 5. Analogía del mundo real

`two_balances_shared_boxes` (mecánica `balance`) es la analogía del YAML ([G0](../../G-analogias/G0-reglas.md)). Mapa: dos balanzas → dos ecuaciones; las mismas cajas marcadas en las dos → incógnitas compartidas; volcar una sobre la otra → sumar ecuaciones; cambiar una caja por su peso conocido → sustitución; las dos niveladas a la vez → solución simultánea. El invariante de la mecánica, `equality_under_identical_actions`, viene con un agregado propio: **una caja marcada pesa lo mismo en toda la mesa**. Ese segundo invariante es el nodo entero, y no vive en la barra sino en la marca. Ruptura: `contradictory_or_redundant_balances`. Una mesa real no sostiene dos balanzas que se contradicen, ni distingue una balanza de la misma balanza estirada; por eso se desvanece en `symbolic`, justo donde esos casos hay que mirar de frente.

Por qué esta y no el libro de cuentas del mercado: `market_two_receipts` sirve para traducir palabras a filas, no para operar, y acá hace falta un objeto que se pueda inclinar, escalar y volcar. El mercado se queda como escena de `real`.

`grid_stretch` entra como mecánica secundaria y su aporte es preciso (convención 1 de la plantilla): la balanza da el invariante y el objeto, el estirado da la operación sobre el objeto entero. En una dimensión, estirar es multiplicar; tomar una balanza por el borde y estirarla al doble duplica los dos platos y todos sus términos. Las dos se encuentran en un gesto: estirar una balanza hasta que su cantidad de cajas de una marca iguale a la de la otra, para poder volcarlas.

## 6. Mecánica de juego

Primera capa jugable: `concrete`, sin leer nada. Gestos: `drag`, `tap` y `pinch`, con manija de borde como alternativa al pinch ([E0](../../E-mecanicas/E0-catalogo.md)).

1. Dos balanzas niveladas, una sobre la otra. Arriba, dos cajas `A` y una `B` a la izquierda y pesas sueltas a la derecha; abajo, una `A` y tres `B` contra otras pesas. Las cajas de la misma marca se ven idénticas.
2. Demostración: una mano fantasma resuelve la balanza de arriba hasta dejar una `A` sola en un plato nivelado. La caja se abre y muestra su peso, y en ese instante **todas las `A` de la mesa se vuelven transparentes a la vez**, incluida la de abajo. La mano toca esa y la cambia por sus pesas: la balanza de abajo sigue nivelada.
3. El jugador repite eso a voluntad: aislar una caja con las llaves del nodo 14 y después tocar cualquier gemela. Ese toque es la sustitución, en un solo paso. Si intenta cambiar una caja por un peso que nadie mostró, la caja se sacude y no se abre: no se puede inventar un peso, solo propagar uno visto.
4. Si cambia una caja en una sola de las dos escenas donde aparece, esa balanza se inclina y las dos gemelas se separan a la vista, una llena y una vacía. Ninguna cede.
5. Camino de eliminación: tomar una balanza por el borde y estirarla duplica o triplica todo lo que tiene encima, en los dos platos. Cuando la cantidad de cajas de una marca coincide con la de la otra balanza, se puede **volcar** con un arrastre: los platos correspondientes se juntan, las cajas de la marca compartida se apilan y, si una entró restando, se cancelan. Queda una sola balanza con un solo tipo de caja, que es el nodo 14.
6. Éxito: las dos cajas abiertas y las dos balanzas niveladas a la vez, sin cartel. Verificación: los pesos vuelven adentro y las dos balanzas originales siguen niveladas. Es la primera verificación del curriculum que pasa dos controles.

El error que el nodo produce a propósito es el del paso 4, y por eso las gemelas están dibujadas idénticas y se abren juntas: la separación entre dos gemelas es la imagen del error y no hace falta ninguna palabra.

## 7. Representación visual

Capa `visual`, con `invariant` dominante y `deform` y `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

`invariant` manda y acá tiene dos capas. La conocida: cada balanza en dos columnas con la barra entre ellas, pesas como barras proporcionales y cajas como barras de longitud desconocida. La nueva: las dos barras que corresponden a la misma marca están **ligadas**, y el juego lo muestra con un hilo entre ellas. Estirar una estira la otra; resolver una transmite la longitud y las fija a las dos. Lo que se conserva no es solo el nivel de cada barra: es la igualdad de las dos barras ligadas.

`deform` (apoyo) es el estirado de una balanza entera: al tomar el borde, toda la fila se escala en la misma proporción y la barra sigue nivelada. Es la única operación del nodo que actúa sobre un objeto completo. `partition` (apoyo) aparece al volcar: los términos se ordenan por tipo antes de juntarse, como filas del libro del nodo 15, y solo se suman los que miden lo mismo.

Todavía no hay grilla con coordenadas: el par no se dibuja como punto, porque las coordenadas nacen en `alg.fn.graph_as_picture`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, con las identidades del nodo 13.

1. **Dos cajas marcadas → dos letras.** Al aislar la primera caja en `visual`, la marca `A` se contrae en `x` y la `B` en `y`, en las dos balanzas a la vez porque las barras están ligadas. Es el primer morph que afecta a dos objetos separados en pantalla, y es el punto del nodo.
2. **Dos barras → dos renglones y una llave.** Los platos se desvanecen, cada barra se contrae en un `=`, los renglones quedan alineados y una llave los abraza por la izquierda. Tocarla resalta todas las apariciones de una misma letra en las dos líneas.
3. **Tocar una caja → sustituir.** El toque que cambiaba la caja por sus pesas cambia la letra por su valor: se hincha, se rompe y aparece la expresión, en las dos líneas si aparece en las dos.
4. **Estirar → factor delante del renglón.** Aparece un multiplicador a la izquierda y el renglón siguiente se escribe con todos sus términos repartidos, con la distributiva del nodo 15 a la vista.
5. **Volcar → sumar renglones.** Al arrastrar un renglón sobre el otro se juntan término a término, los que se cancelan se desvanecen y queda un renglón con una sola letra. La balanza se pide tocando cualquier `=`.

## 9. Notación matemática

Queda el sistema como dos renglones alineados por el `=` y abrazados por una llave, y debajo la cadena que lleva a los dos valores.

El nodo no introduce símbolos nuevos: la segunda letra es la invención del nodo 10 usada dos veces. Por la convención 3 de la plantilla, lo que se vuelve necesario es una **convención de alcance**: la llave declara que las dos líneas se leen juntas y que una misma letra nombra la misma cantidad en las dos. El problema que la exige es el error del paso 4 de la mecánica, que el jugador ya cometió con las manos: sin la llave, dos renglones uno debajo del otro son dos ecuaciones independientes y `x` en el primero no tiene por qué ser `x` en el segundo. La llave convierte una lista de igualdades en un solo objeto, y es la forma en que la calculadora presenta la operación del nodo.

## 10. Definición formal

Capa `formal`: texto corto con voz y las dos balanzas fantasma al lado, de a una frase. "Un sistema son dos igualdades que hablan de las mismas cantidades." "Una solución es un par de valores que deja las dos niveladas al mismo tiempo." "Todo lo que se le hace a una igualdad completa la conserva: multiplicarla entera, sumarle otra igualdad, cambiar una letra por algo que vale lo mismo."

Condiciones y casos, verificados sobre el objeto: sumar dos igualdades es válido porque a los dos lados de la primera se les agrega algo que pesa lo mismo, que es la propiedad del nodo 13 sobre un objeto entero; multiplicar una igualdad por cero la deja en `0 = 0`, verdadera y muda, la versión sistémica de la cerradura sin llave. Dos balanzas pueden ser incompatibles, y al eliminar queda `0 = 5`; o la misma balanza estirada, y queda `0 = 0`. El nodo muestra los dos casos y no los nombra: eso es `alg.sys.parallel_or_same_line`.

Ya jugado: las tres frases, en la capa concreta. Nuevo: "solución" aplicada a un par, y los dos casos degenerados.

## 11. Propiedades

- **Una caja marcada pesa lo mismo en toda la mesa.** Es la propiedad que define el nodo. Ligada al hilo entre las barras y a las gemelas que se abren juntas.
- **Sustituir conserva las dos igualdades.** Ligada al toque que reemplaza la caja por sus pesas sin mover ninguna barra.
- **Multiplicar una igualdad entera la conserva.** Ligada al estirado por el borde. Es la distributiva del nodo 15 aplicada a un renglón.
- **Sumar dos igualdades da una igualdad.** Si `a = b` y `c = d`, entonces `a + c = b + d`. Ligada a volcar: a cada plato se le agrega algo que pesa lo mismo que lo que se le agrega al otro.
- **Una igualdad sola con dos incógnitas no decide.** Ligada a la capa de intuición, donde tres pesos distintos nivelan la misma balanza.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos balanzas con cajas de dos marcas; tocar la que aparece en las dos. Es el ítem más simple del nodo y mide exactamente su dificultad central.
- `explain`: dos animaciones. En una, lo aprendido de una balanza se reemplaza en la otra y las dos siguen niveladas; en la otra, se cambia una caja solo en una balanza y esa se derrumba mientras su gemela queda intacta. Tocar la que rompe una de las balanzas.
- `manipulate`: reemplazar en la segunda balanza la caja por lo que la primera mostró y resolver con llaves hasta abrir las dos. La validación es que las dos queden niveladas, no que aparezca un número.
- `apply`: dos recibos del mercado con precios ocultos; arrastrar las fichas de precio que cumplen los dos, contra el tiempo objetivo del nodo. Armar las dos balanzas es parte del ítem.
- `generalize`: las balanzas se desvanecen y quedan dos renglones con la llave; elegir entre sustituir o volcar, con coeficientes que obligan a estirar una fila antes.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar el punto donde dos rectas se cruzan y verificar que es la entrada que la matriz manda a la salida pedida.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). El nodo **no declara misconceptions propias** en su registro del grafo: las que produce ya están catalogadas antes y se evalúan allí.

- **`inverse_applied_one_side`** (`replay_on_mechanic` sobre la balanza; catalogada en `alg.eq.one_step` y `prealg.eq.balance`). Con cuatro platos su frecuencia sube. `linalg.sys.row_operations` la declara propia, lo que confirma que es el error natural de operar sobre filas.
- **`sign_flip_on_move`** (mismo patrón; catalogada en `alg.eq.one_step` y `alg.eq.multi_step`). Aparece al volcar, cuando un término cruza de renglón sin cambiar la acción.
- **`variable_as_label`** (mismo patrón sobre el libro de cuentas; catalogada en `prealg.var.unknown_as_box` y `alg.expr.distributive_tiles`). Aparece al volcar y apilar cajas de marcas distintas.
- **`distribute_over_wrong_op`** (`missing_piece_tiles` sobre las baldosas; catalogada en `alg.expr.distributive_tiles`). Aparece al estirar una balanza multiplicando solo el primer término; el replay corre sobre el piso del nodo 15.

El error propio del nodo —cambiar una caja en una balanza y no en su gemela— no tiene entrada en el catálogo. El juego lo muestra con la consecuencia física del paso 4, tan visible como cualquier replay, y es además el distractor de `explain`, así que alimenta Understanding aunque no clasifique en ninguna categoría de L.

## 13. Generalización

La analogía se retira en `symbolic`, y su punto de ruptura fija el momento: en cuanto el sistema puede no tener solución o tener infinitas, dos balanzas sobre una mesa dejan de representarlo. El hilo entre las barras ligadas se queda hasta `formal`, porque es lo que la llave del sistema representa y no un nombre.

Variantes sin ayuda visual, en orden: una letra ya aislada en una línea, que sale por sustitución directa; coeficientes que se cancelan al volcar sin estirar; coeficientes que obligan a estirar una fila; los que obligan a estirar las dos; constantes y soluciones negativas; soluciones fraccionarias; sistemas incompatibles y redundantes, donde lo que hay que reconocer es que el método terminó sin dar un par. Después, dos balanzas cuyas cajas contienen acciones —una "girar" y una "pintar", con dos recetas y dos resultados—, donde el método es el mismo sin ninguna aritmética adentro.

El nodo está en `abstract` cuando el jugador elige entre sustituir y volcar mirando la forma del sistema y no por costumbre, resuelve sin pedir balanzas y distingue los dos casos degenerados por lo que quedó escrito. La forma completa de esa capa es `linalg.basis.in_span_or_not`, donde la pregunta deja de ser cuál es el par y pasa a ser si el par existe.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.inverse_and_systems` (`grid_stretch` y `chest_key`): la sábana fue deformada y se sabe dónde cayó un punto; resolver es preguntar qué punto fue a parar ahí, y la llave es la matriz inversa. Es la relectura completa del nodo: las dos balanzas dejan de ser dos restricciones y pasan a ser una sola transformación con entrada desconocida, y los dos casos degenerados se vuelven una sola imagen, la grilla aplastada a una línea.
- `linalg.sys.row_operations` (`balance` y `ledger` sobre una matriz): estirar una fila y volcarla son las operaciones elementales, que acá el jugador ya hizo con las manos. Lo que ese nodo agrega es que las filas pueden ser muchas y que combinarlas tiene un método.
- `linalg.basis.in_span_or_not` (`sorter` y `grid_stretch`): si un sistema tiene solución se convierte en si un vector se puede armar con los pasos disponibles, y se responde clasificando en vez de resolviendo.

Concepto siguiente: `alg.fn.function_as_machine` ([17](17-alg.fn.function_as_machine.md)). El nodo termina con los dos precios conocidos y el puesto todavía abierto: la bolsa cuesta lo que cuesta y lo único que varía es cuántas se llevan. Frase puente, narrada sobre el mostrador: "Ya sabés cuánto pesa cada caja. Ahora la caja siempre pesa lo mismo y lo que cambia es cuántas ponés. ¿Qué sale, si le das un número?". La barra de una de las balanzas se endereza hasta quedar horizontal, se convierte en un tubo con una boca a la izquierda y una salida a la derecha, y el nodo 17 empieza ahí.

---

**Visualización:** dos escenas del YAML ([I](../../I-manim/I0-mapping.md)), las dos nativas. `balance_two_scales_shared_boxes` es donde vive el nodo: las cajas marcadas, el hilo entre gemelas, la copia de un valor de una escena a la otra, el estirado de una fila entera y el vuelco término a término con las cancelaciones; gramática `invariant`, con las dos barras niveladas resaltadas a la vez. Parametrizada por las dos ecuaciones y la letra compartida, produce también las animaciones de `explain`. `grid_two_lines_cross` tiene papel acotado: solo en los ítems de `transfer` y como mirada hacia adelante en el último nivel, porque dibujar el par como punto necesita coordenadas y las coordenadas nacen en `alg.fn.graph_as_picture`; su vida interactiva completa es `alg.sys.lines_intersect`. Se reúsan `balance_key_both_sides` (nodo 13) y `balance_two_keys_in_order` (nodo 14) para el tramo con una sola letra. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_solve_system` ([M](../../M-calculadora/M0-progresion.md)), que aparece sobre cualquier par de igualdades armadas con fichas y se presenta con la llave que las abraza. No devuelve el par pelado: escribe la fila que se estiró, el vuelco con los términos que se cancelan y después los dos valores, en la pila de renglones del nodo 14. Con un sistema incompatible o redundante no escribe un error: escribe el renglón al que llegó, `0 = 5` o `0 = 0`, y lo deja a la vista. La tecla la comparte con `linalg.map.inverse_and_systems`, desde donde el mismo botón muestra además la grilla.

**Edad universal:** el nodo es `icons` porque las cajas se distinguen por una marca y los renglones llevan etiquetas de un carácter. Lo demás se juega sin leer: las gemelas se abren juntas, la separación entre una llena y una vacía no necesita explicación, estirar y volcar son gestos, `explain` es entre animaciones y los prompts van por voz. El `pinch` tiene siempre la manija de borde como alternativa ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico, salta `real` e `intuition` y elige entre sustituir y volcar desde el primer ítem.
