# 10 — La caja cerrada (`prealg.var.unknown_as_box`)

> Locale `es`: "La incógnita es una caja cerrada". Minijuego: [La caja cerrada](../../F-minijuegos/prealg.var.unknown_as_box.md).

**Nodo:** `prealg.var.unknown_as_box` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `partition` · **Mecánica principal:** `ledger` (secundarias `balance` y `chest_key`) · **Literacy:** `none` · **Analogía:** `mystery_box`

## 1. Concepto

Una cantidad que no se puede contar sigue siendo una cantidad: se le pone un nombre y se opera con ella como con cualquier otra. Al terminar, el jugador cuenta cajas iguales como cuenta manzanas, escribe `2x` para decir "dos cajas", distingue dos cajas con marcas distintas y no las mezcla, y coloca una caja cerrada en una hoja del árbol del nodo 9 sin que la expresión pierda la forma. Antes sabía operar con lo que veía; no sabía operar con lo que no ve.

## 2. Prerequisitos

- `arith.expr.precedence_tree` (nodo 9): la expresión como árbol. Se usa la forma entera. La caja cerrada entra como hoja de ese árbol, y el punto es que el árbol no se entera: la raíz sigue siendo la misma operación y las demás hojas siguen contándose igual. Sin el árbol, "una expresión con una incógnita" sería una fila de símbolos y no habría dónde poner la caja.

La arista no sigue el orden escolar, donde la letra llega junto con la primera ecuación y las dos cosas se aprenden mezcladas. Acá la caja llega sola, sin igualdad y sin nada que resolver: primero existe la cantidad desconocida, después existe la afirmación de que dos cosas pesan lo mismo (nodo 11). Un jugador que aprende la letra dentro de una ecuación cree que la letra es "lo que hay que despejar", y después no la reconoce en `f(x)` ni en un vector de incógnitas.

## 3. Dificultad cognitiva real

Lo difícil no es entender que hay algo que no se sabe. Es aceptar que ese algo se puede manipular sin averiguarlo. Tres capacidades:

1. **Tratar lo desconocido como una cantidad y no como un hueco.** Un hueco se llena; una cantidad se cuenta, se suma, se agrupa. La diferencia se juega: dos cajas iguales más tres cajas iguales son cinco cajas, y eso se puede afirmar con las cajas cerradas.
2. **Sostener la identidad de la caja.** Dos cajas con la misma marca tienen adentro lo mismo, siempre, en toda la mesa y en todas las filas. Dos cajas con marcas distintas no se pueden juntar en una fila, aunque las dos sean cajas. Es la capacidad que falla en `variable_as_label`, donde la marca se lee como el nombre del objeto y no como el nombre de su contenido.
3. **Nombrar antes de saber.** La letra no es el resultado ni una abreviatura del enunciado: es un nombre corto para poder hablar de la cantidad mientras sigue siendo desconocida. Cuesta porque toda la aritmética anterior terminaba en un número.

## 4. Problema intuitivo

Un puesto de verdulería al cierre. Sobre el mostrador hay tres cajones idénticos de madera, cerrados con precinto, y siete naranjas sueltas. El vendedor anota en la libreta lo que se lleva el camión: no puede abrir los cajones y no quiere contar naranja por naranja. La pregunta, por voz o por gesto: ¿cómo anota lo que hay sobre el mostrador?

En `intuition` la escena se detiene antes de que anote. Tres anotaciones dibujadas: una donde los tres cajones se dibujan uno por uno y las naranjas también; una donde se dibuja un cajón con un tres al lado y las siete naranjas; una donde los cajones y las naranjas se juntan en un solo montón de diez cosas. El jugador elige y después ve llegar el camión y descargar. La tercera es la que produce `variable_as_label`, y se elige mucho.

## 5. Analogía del mundo real

`mystery_box`, sobre la mecánica `chest_key` en su forma más simple ([G0](../../G-analogias/G0-reglas.md)). Mapa: caja cerrada → variable; lo que hay adentro → valor; misma marca, misma caja → misma variable; marca distinta → variable distinta; mover la caja sin abrirla → manipulación simbólica; abrir la caja → resolver.

Invariante: el contenido de una caja no cambia mientras la caja esté sobre la mesa, y dos cajas con la misma marca tienen el mismo contenido aunque estén en filas distintas. Ruptura: `box_with_changing_contents`. Una caja tiene un contenido fijo, y hay conceptos donde la letra recorre valores en vez de ocultar uno: la entrada de una máquina, la variable de una función. Ese es el borde de la analogía y está justo donde empieza `alg.fn.function_as_machine`, uno de los destinos de transferencia del nodo. La analogía se desvanece en `symbolic`.

Por qué esta y no otra: porque el paso 5 del test de [G0](../../G-analogias/G0-reglas.md) se cumple sin esfuerzo. La caja se contrae en una letra sin cambiar de lugar, y la marca de la caja se convierte en la letra: el morph existe y es de una sola pieza. Una analogía de "número escondido detrás de una nube" no lo tiene, porque la nube no ocupa el lugar de un término.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas, con reparto explícito ([E0](../../E-mecanicas/E0-catalogo.md)). `ledger` es la principal y aporta el invariante `count_preserved_under_regrouping`: reordenar en filas no cambia cuántos hay, y eso es lo que hace legítimo escribir `2x` en lugar de `x + x`. `balance` aporta la herramienta: sirve para averiguar qué hay adentro sin abrir, poniendo cajas de un lado y fichas del otro hasta que queda quieta. `chest_key` aporta el lugar: la caja es una hoja del árbol del nodo 9. Los tres se encuentran en un gesto: arrastrar la caja cerrada a una fila del libro, y ver que la fila la acepta como acepta una fruta.

1. El libro de cuentas abierto, con filas vacías. Sobre la mesa, tres cajas con la misma marca y siete naranjas.
2. El jugador arrastra las naranjas a una fila; la fila muestra su cuenta. Arrastra las cajas a otra fila; la fila muestra tres, y el conteo funciona igual aunque nadie sepa qué hay adentro.
3. Intento de mezclar: arrastrar una caja a la fila de las naranjas. La caja entra, se queda un instante y la fila se parte en dos con una línea, con las naranjas de un lado y la caja del otro. Nada se pierde y nada dice "incorrecto": la fila se niega a sumar cosas que no son la misma.
4. Aparece una segunda caja con otra marca. El jugador prueba a juntarla con las primeras y la fila se vuelve a partir. Dos marcas, dos filas.
5. La balanza entra como herramienta, ya nivelada: una caja de un lado, fichas del otro. El jugador agrega o quita fichas hasta que la barra queda horizontal y ahí lee cuánto pesa la caja. Con dos y tres cajas del mismo lado el mismo gesto sirve, y descubrir que hay que repartir las fichas en partes iguales es lo que hace visible el conteo de cajas.
6. La caja viaja al árbol: el jugador la suelta en una hoja de un cofre anidado y la expresión conserva su forma con una hoja que no tiene número.

La balanza acá es un instrumento de medir y nada más. Que la barra nivelada sea una afirmación —que sea el igual— es el nodo 11 y no se adelanta.

## 7. Representación visual

Capa `visual`, con `partition` dominante y `compose` de apoyo ([H](../../H-progresion-abstraccion.md)).

Las naranjas se aplanan en barras cortas de igual longitud y se apilan en su fila; la caja se aplana en una barra de longitud desconocida, dibujada con el borde punteado y siempre igual a sí misma. Tres cajas son tres barras punteadas idénticas puestas en línea, y ahí se ve por qué se pueden contar: son la misma longitud repetida, aunque nadie sepa cuál.

Lo que se desplaza es la barra que cambia de fila. Lo que se conserva es la cantidad total del libro: partir una fila en dos no cambia cuántas cosas hay sobre la mesa, y el libro lo muestra manteniendo el largo total. Lo que se escala es la fila de cajas cuando el jugador agrega otra igual.

Todavía no hay letras, ni coeficiente escrito, ni igualdad: la balanza nivelada es un instrumento y no una afirmación, y el libro no dice cuánto vale nada.

## 8. Transición a símbolos

Cinco escalones, todos sobre la misma caja, y ninguno arranca hasta que el jugador hace el gesto que lo abre.

1. **Caja → barra con marca.** Al contar por primera vez una fila de cajas en `visual`, las cajas se aplanan en barras punteadas y la marca de la caja se despega y queda flotando sobre la barra, del tamaño de una etiqueta.
2. **Fila → cuenta adelante.** Al tocar la fila, la cuenta que estaba al costado se desplaza al frente de la primera barra: la fila de tres barras punteadas se lee como un tres seguido de una barra. Es el nacimiento de la escritura del coeficiente, y ocurre en la fila de las naranjas primero, donde el jugador puede verificar contando.
3. **Caja → `x`.** Cuando el jugador arrastra una caja cerrada a una fila que ya tiene su cuenta adelante, la barra punteada se contrae en la marca que llevaba flotando, y la marca se dibuja como `x`. La caja no desaparece: se encoge hasta ser la letra, en el mismo lugar, con el mismo id. Ahí nace el símbolo.
4. **Segunda marca → segunda letra.** La caja de la otra marca hace lo mismo y queda `y`. Las dos letras conservan el color y la forma de sus cajas un rato, y las dos filas siguen sin poder juntarse.
5. **Filas → renglón.** Al tocar el libro cerrado, las filas se apilan en una sola línea con el signo de juntar entre ellas: `2x + 7`. El libro queda a un costado, sincronizado; tocar `2x` ilumina la fila de las cajas.

## 9. Notación matemática

Queda `2x + 7`, y `3x + y` cuando hay dos marcas.

El símbolo que nace es **`x`**, y el problema que lo hizo necesario es referirse a una cantidad desconocida sin describirla con una frase (regla de oro de [H](../../H-progresion-abstraccion.md)). El jugador ya sintió la incomodidad: hasta acá, para hablar de los cajones tenía que dibujarlos o decir "lo que hay en el cajón" cada vez, y con dos cajones distintos la frase se vuelve impracticable.

Con la letra se fija además una convención de escritura: el conteo de la fila se escribe adelante y pegado, `2x` en lugar de `x + x`. La convención es legítima acá por el invariante del libro y significa exactamente "dos cajas". Que `2x` sea también "dos por `x`" no se afirma en este nodo: la yuxtaposición como producto es de `prealg.expr.implicit_grouping`, y acá el `2` cuenta filas, no multiplica.

## 10. Definición formal

Capa `formal`: texto corto con voz y el libro al lado, de a una frase. "Una letra es el nombre de una cantidad que todavía no se conoce." "Dos letras iguales nombran la misma cantidad; dos letras distintas pueden nombrar cantidades distintas." "Contar cosas iguales vale también cuando no se sabe cuántas hay adentro de cada una."

Condiciones y casos especiales, verificados sobre el objeto. Una caja puede estar vacía, y entonces la letra vale cero: la fila sigue teniendo tres cajas. Dos cajas con marcas distintas pueden tener el mismo contenido sin dejar de ser dos nombres; el jugador lo comprueba pesándolas y ve que la letra no promete ser distinta, solo permite serlo. Una fila con una sola caja se escribe sin cuenta adelante, y el jugador verifica que sigue siendo una. Sumar filas de marcas distintas no se puede, y la línea que parte la fila es la razón.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "letra" como nombre y el caso de la caja vacía.

## 11. Propiedades

- **La misma marca es la misma cantidad, en toda la mesa.** Ligada a pesar dos cajas de la misma marca en la balanza y ver que la barra no se mueve al cambiarlas de lado.
- **Solo se cuentan juntas las cosas iguales.** `2x + 3x` son cinco cajas; `2x + 3y` no se puede escribir con una sola letra. Ligada a la fila que se parte en dos cuando se le arrastra una caja de otra marca. Es la propiedad que `prealg.expr.like_terms` desarrolla y la que `variable_as_label` rompe.
- **El conteo se conserva al reagrupar.** Repartir las cajas en dos filas y volver a juntarlas no cambia cuántas hay. Ligada al invariante del libro, y es lo que hace que escribir `2x` no pierda información.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un libro de cuentas con fichas y una caja cerrada; tocar la caja cuando el guía pregunta qué cantidad no se ve. Los distractores se generan: la fila más corta, la ficha de mayor valor, la caja abierta de una instancia anterior.
- `explain`: dos animaciones sobre el mismo libro. En una, dos cajas iguales y tres cajas iguales se juntan en cinco cajas. En la otra, las marcas se pegan una a la otra y las cajas se multiplican como si las marcas fueran nombres de objetos. Tocar la que trata la letra como etiqueta; el distractor es `variable_as_label`.
- `manipulate`: poner en la balanza tantas cajas como indica el coeficiente y ajustar fichas del otro lado hasta que queda quieta. Con más de una caja hay que repartir las fichas en partes iguales, y el reparto es el ítem.
- `apply`: una caja aparece como hoja de un árbol de cofres; arrastrarla al lugar del árbol donde está la cantidad desconocida, con la expresión ya escrita al lado y sin evaluar nada.
- `generalize`: la caja se convierte en letra sobre el libro; seguir contando cajas iguales con letras distintas sin mezclarlas, con tres marcas y con filas que empiezan vacías.
- `transfer`: en la máquina de tuberías de `alg.fn.function_as_machine`, tocar la entrada que la máquina todavía no conoce, marcada con una letra.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`variable_as_label`** (`replay_on_mechanic` sobre el libro de cuentas). El jugador junta cajas de marcas distintas en una fila, o en el renglón escribe `2x + 3y` como `5xy`. El juego congela, repite el gesto en cámara lenta y deja que el invariante se rompa a la vista: las dos columnas de cajas se acercan y no se funden, la línea las vuelve a separar y un halo marca la marca que sobra. Voz: "Son 2 de una fruta y 3 de otra. ¿Se pueden juntar en una sola?". El estado sigue siendo válido y el jugador reordena desde ahí.

## 13. Generalización

La analogía se retira en `symbolic`, en dos tiempos. Primero la caja, cuando el jugador opera con la letra en el libro sin pedir el objeto; después el libro, cuando el renglón se sostiene solo. La caja vuelve como fantasma tras un error, porque es el objeto donde el error se ve.

Variantes sin ayuda visual, en orden: filas con dos y tres marcas distintas; una fila con una sola caja, escrita sin cuenta adelante; una caja vacía; la letra en una hoja de un árbol con paréntesis; la misma letra en dos filas del mismo renglón.

Cajas que no guardan números. El nodo termina con cajas cuyo contenido no se cuenta: una caja de color desconocido, una caja con una dirección adentro, una caja con una figura. El jugador sigue pudiendo decir "dos cajas de esta marca y una de aquella", no puede juntarlas, y responde qué cambia si una se abre. Se evalúa que la estructura —un nombre para lo que no se ve, filas que solo agrupan lo igual— se reconoce con cualquier objeto.

El nodo está en `abstract` cuando el jugador escribe y lee expresiones con dos o tres letras sin pedir el libro, distingue una letra repetida de dos letras distintas, y explica por qué `2x + 3y` no se puede acortar sin recurrir a las cajas.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `alg.fn.function_as_machine` (`machine_pipe`): la letra deja de ocultar un valor fijo y pasa a nombrar la entrada que la máquina todavía no recibió. Es el punto de ruptura de `mystery_box` convertido en nodo, y por eso la transferencia se mide ahí y no antes.
- `alg.expr.distributive_tiles` (`tiles`): el lado de un rectángulo mide `x + 2` y el área se sigue pudiendo escribir. La caja se vuelve longitud y la fila del libro, una franja de baldosas.
- `prob.rv.random_variable_as_machine` (`urn_dice`): lo que sale de la urna todavía no se sabe, pero se le puede poner nombre y operar con él antes de tirar.
- `linalg.map.inverse_and_systems` (`grid_stretch`): en la sábana deformada, el vector de entrada es la caja; se sabe dónde cayó y no qué era, y se lo nombra para poder buscarlo.

Concepto siguiente: `prealg.eq.balance` ([11](11-prealg.eq.balance.md)). Frase puente, narrada sobre la balanza que el jugador usó para pesar: "Usaste la balanza para saber qué hay en la caja. ¿Y si la balanza, quieta, ya fuera lo que querés anotar?". La barra deja de temblar, se queda horizontal y se ilumina, y el nodo 11 empieza ahí.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `ledger_box_hides_tokens` es nativa: se renderiza sobre el libro del jugador, con las fichas visibles, las escondidas y el total como parámetros; gramática `partition`, con el largo total conservado mientras las filas se reordenan, y produce también las animaciones de `explain`. `chest_box_as_tree_leaf` es nativa: la expresión con ids y la hoja desconocida marcada; el árbol se dibuja, la caja baja a su hoja y la forma no se mueve; gramática `compose`. Ninguna lleva texto rasterizado: las marcas de las cajas son formas y las letras las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_variable` ([M](../../M-calculadora/M0-progresion.md)), la ficha `x`. Es la tecla que abre la fila `t3` entera, mucho antes de que exista una función, y esa fila con una tecla y muchas siluetas es lo que el jugador tiene que ver: la herramienta con lugar para crecer. No calcula nada: agrega una ficha al teclado, y a partir de ahí toda operación ya desbloqueada actúa sobre expresiones que la contienen. Está disponible en el sandbox. Si el nodo decae, la ficha muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): cajas y marcas por forma y color, filas que se parten solas, `explain` entre animaciones, prompts por voz. La `x` que aparece al final no es texto: es un ícono que el jugador vio nacer de una caja, y el teclado de fichas la arrastra en vez de escribirla. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel del libro con dos marcas y alcanza la letra en un nivel; lo que no se le ahorra es partir una fila con las manos al menos una vez, porque es el único lugar donde `variable_as_label` se ve fallar.
