# 06 — Dividir deshace el estirado (`arith.div.undo_mul`)

> Locale `es`: "Dividir deshace el estirado". Minijuego: [La banda que vuelve](../../F-minijuegos/arith.div.undo_mul.md).

**Nodo:** `arith.div.undo_mul` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundarias `tiles` y `grid_stretch`) · **Literacy:** `none` · **Analogía:** `rubber_band_stretch` (con `sharing_into_plates` para el reparto)

## 1. Concepto

Dividir por 3 es la acción que devuelve exactamente lo que estirar por 3 había hecho: la banda vuelve a su largo, cada marca vuelve a su lugar y el clavo nunca se movió. Al terminar, el jugador elige el factor de vuelta sin que nadie se lo indique, parte un rectángulo conocido en filas iguales para encontrar el lado que falta, y reconoce que hay un estirado que ninguna vuelta deshace. Antes sabía volver sobre sus pasos; no sabía volver de un cambio de tamaño.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): la escala. Se usan la banda clavada con sus marcas, el piso de baldosas con sus dos lados, la ficha de factor y el caso del factor cero, que acá se convierte en el primer problema sin solución del juego.
- `arith.sub.undo_add` (nodo 4): deshacer. Se usa la experiencia completa de que una acción se puede correr al revés y de que el objeto vuelve al punto de partida, con el cofre que solo se abre cuando la vuelta iguala a la ida.

Este es el segundo "deshacer" de la espina, y conviene decir con precisión qué se hereda y qué no. **Se reusa** la estructura: hay una acción hecha, hay una acción que la corre al revés, y el criterio de éxito es que el objeto quede idéntico a como estaba, no parecido. Se reusa el gesto de aplicar la vuelta y ver la animación reproducirse hacia atrás, y se reusa el cofre como el objeto que confirma: si la vuelta fue exacta, se abre solo.

**Es nuevo** todo lo demás. En el nodo 4 la acción que se deshacía era un desplazamiento, y volver era dar la misma cantidad de pasos en el otro sentido: el remedio se parecía al mal. Acá la acción es una escala, y volver no es "quitar" nada sino cambiar el tamaño otra vez, por un factor que no se ve en la pista sino en la razón entre dos marcas. Un jugador que traslada el hábito del nodo 4 intenta acortar la banda quitándole un pedazo del extremo, que es exactamente el distractor del probe `explain`. Y es nuevo, sobre todo, que la vuelta pueda no existir: toda suma tiene su resta, pero estirar por cero no tiene ninguna vuelta, y este nodo es el primer lugar del curriculum donde una acción no se puede deshacer.

Todavía no hay vocabulario general. Acá hay una banda, un cofre y la pieza que lo abre para este estirado; no hay llavero, ni tabla de pares, ni la idea de que toda operación tiene su inversa. Eso se enuncia en `prealg.inv.operation_as_key`, que recoge este nodo, el 4 y el 7.

## 3. Dificultad cognitiva real

Lo difícil no es repartir sino cuatro cosas.

1. **Elegir la vuelta cuando la ida fue una escala.** El jugador tiene que leer el factor del estirado en la separación entre marcas, no en el largo total, y aplicar ese mismo número como factor de vuelta. Es la primera vez que la cantidad relevante es una razón y no una distancia.
2. **Que dividir sea la misma pregunta hecha de dos maneras.** Frente a un piso de doce baldosas con un lado de tres, "cuántas filas hay" y "cuántas baldosas por fila" son dos cortes distintos del mismo rectángulo y dan números distintos que responden preguntas distintas. La mecánica hace jugar las dos y muestra que ambas usan el mismo gesto de partir.
3. **Que la vuelta pueda no existir.** El estirado por cero colapsa la banda contra el clavo y borra toda la información: no hay factor que la reconstruya. Reconocer eso —y distinguirlo de "es difícil"— es la parte más abstracta del nodo y la que la cheatsheet `cs.arith.div_by_zero_no_key` registra.
4. **Que la vuelta pueda no caer en una marca.** Si el piso no se parte en filas iguales, sobran baldosas; si la banda no vuelve a una marca, queda entre dos. Este nodo no resuelve ninguno de los dos casos: los deja planteados, y son las puertas de `arith.div.remainder` y del nodo 8.

## 4. Problema intuitivo

El mismo taller del nodo anterior, al día siguiente. La banda quedó clavada y estirada desde ayer, con las cuentas separadas, y hay que devolverla al cajón donde solo entra si mide lo que medía. En el piso, un rectángulo terminado de baldosas al que hay que sacarle una franja para una puerta, y solo se sabe cuánto mide un lado.

En `real` la pregunta es de mirada: ¿entra la banda en el cajón como está? En `intuition` la escena se congela con una mano por sostener la banda y tres desenlaces dibujados: la banda se suelta de a poco y las cuentas vuelven todas juntas a su sitio; se le corta un pedazo del extremo y las cuentas de adentro quedan separadas; se la dobla al medio y las cuentas quedan superpuestas. El jugador elige y después ve. El segundo desenlace es el hábito del nodo 4 aplicado donde no corresponde, y reaparece como distractor en `explain`.

## 5. Analogía del mundo real

`rubber_band_stretch` (mecánica `grid_stretch`) es la del YAML y es la misma del nodo 5, a propósito: la analogía no cambia porque el concepto no es otro objeto sino la vuelta del mismo. Del `structure_map` este nodo usa la línea que el 5 dejó sin jugar, `dejar que la banda vuelva → dividir por k`, junto con el extremo clavado como cero fijo y las marcas cuya razón se conserva. Invariante: soltar la banda por el mismo factor por el que se estiró devuelve cada marca a su lugar, todas a la vez. Ruptura: `negative_scaling_flips`, sin cambios respecto del nodo 5.

`sharing_into_plates` (mecánica `sorter`) aporta la segunda lectura. Mapa: montón a repartir → dividendo; platos → divisor; una ronda de reparto → restar el divisor; cuánto quedó en cada plato → cociente; lo que sobra → resto; volver a juntar los platos para comprobar → inversa de la división. Ruptura: `divisor_not_whole`, no hay medio plato. Esa ruptura es la razón por la que el reparto es analogía de apoyo y no la principal: el nodo tiene que sobrevivir a la pregunta de dividir por una fracción y la banda sobrevive, el reparto no.

Por qué estas y no otras. El cofre del nodo 4 sigue presente como el objeto que confirma —se abre cuando la vuelta fue exacta— pero no como analogía del concepto: acá lo que se deshace es una escala, y la escala vive en la banda. El piso de baldosas hace de puente entre las dos: partir el rectángulo en filas iguales es soltar la banda y repartir en platos a la vez, y por eso las dos escenas del nodo son una banda que vuelve y un rectángulo que se parte ([G0](../../G-analogias/G0-reglas.md)).

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `chest_key` es la principal y provee la herramienta —la pieza que corre la acción al revés y el cofre que valida—; `grid_stretch` provee el invariante, que la vuelta devuelve cada marca a su lugar; `tiles` provee la segunda lectura, partir un piso conocido en filas iguales ([E0](../../E-mecanicas/E0-catalogo.md)). Se encuentran en un gesto: arrastrar la pieza de vuelta sobre la banda estirada, y ver que el piso que estaba al lado se parte solo en el mismo momento. Gestos: `drag` y `tap`, con `pinch` opcional sobre la banda.

1. Banda clavada y estirada, con las cuentas separadas y la regla debajo; un cofre cerrado en el extremo libre; abajo, tres piezas de vuelta con formas distintas. Al costado, el piso terminado con un solo lado acotado.
2. Demostración: una mano fantasma toma la pieza que corresponde y la desliza a lo largo de la banda. La banda se acorta de forma continua y las cuentas convergen a la vez a sus marcas originales. Al llegar, el cofre se abre y muestra la banda como estaba.
3. El jugador arrastra una pieza. Mientras la desliza, la banda se acorta en vivo y las marcas se ven caer sobre la regla; suelta cuando cree que llegó.
4. Pieza de más: la banda se pasa de corto, las cuentas quedan por dentro de sus marcas y el cofre no cede. El estado no se borra: la banda queda ahí y el jugador la ajusta.
5. Pieza que corta: si en vez de soltar la banda el jugador le recorta el extremo, el largo total puede coincidir con el objetivo pero las cuentas quedan donde estaban, amontonadas contra el clavo. El cofre no se abre y la banda muestra sus marcas desalineadas con la regla. Es el error del nodo 4 mal transferido, y la desalineación es todo el mensaje.
6. Sobre el piso: arrastrar una línea de corte lo parte en filas. Si las filas no son iguales, las baldosas sobrantes se separan del rectángulo y quedan apoyadas al costado, visibles. Este nodo no las resuelve: quedan ahí.
7. El estirado por cero: la banda colapsada contra el clavo no tiene marcas que devolver. Ninguna pieza la mueve; todas atraviesan el cofre sin engancharse. No hay cartel: hay una banda que no reacciona.
8. Verificación: tocar la banda recuperada la vuelve a estirar por el factor original y muestra que queda como estaba antes de todo.

## 7. Representación visual

Capa `visual`, con `invert` dominante y `scale` de apoyo ([H](../../H-progresion-abstraccion.md)).

`invert`. La banda y su regla se acompañan del diagrama vertical, el mismo que el nodo 4 armó con las piedras y que acá recibe barras: arriba la barra corta, una flecha hacia abajo con el factor del estirado, abajo la barra larga. La vuelta es la misma flecha reproducida hacia atrás, dibujada al lado y no debajo, y solo se cierra el circuito si la barra de llegada coincide punto por punto con la de partida. Cuando el factor es cero, la flecha de bajada colapsa las tres marcas en una sola y la flecha de vuelta no tiene de dónde salir: se dibuja empezando en un punto y terminando en tres, y se ve que no es una flecha.

`scale` (apoyo). El piso se estiliza en un rectángulo sobre grilla con un lado acotado y el otro con un signo de interrogación dibujado como una llave abierta. Las líneas de corte aparecen como líneas punteadas que el jugador arrastra; cuando el corte deja filas iguales, las punteadas se vuelven continuas.

Todavía no hay signo de división escrito, ni expresión, ni igualdad: el resultado es la etiqueta del lado que faltaba.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Pieza con forma → pieza con factor.** Al abrir el cofre por primera vez en `visual`, la pieza pierde su forma distintiva y gana la etiqueta del factor, con la forma quedando un rato como sombra detrás.
2. **Flecha de vuelta → operador.** El arco que sube en el diagrama vertical se contrae en la ficha del operador de división, con el factor al lado. Su glifo lo elige el `MathLocale` ([P](../../P-internacionalizacion.md)): en unos locales es un óbelo, en otros dos puntos.
3. **Piso partido → fila de fichas.** Al terminar un corte en filas iguales, el rectángulo se contrae en la fila con el total, el operador y el lado conocido, y el lado que faltaba aparece como etiqueta al final; el rectángulo queda como marca de agua.
4. **Dos cortes, dos lecturas.** Al partir el mismo piso por el otro lado, la fila se reescribe con los dos números intercambiados y las dos filas quedan una sobre otra un instante, con el piso girando entre ellas. El jugador ve que un mismo piso produce dos preguntas.
5. **Par de fichas.** Al aplicar una ficha de factor y su vuelta seguidas, las dos se juntan y se anulan con un morph: la barra queda como estaba y las dos fichas desaparecen juntas. Ese par es lo que el nodo 12 va a nombrar.

## 9. Notación matemática

Queda la fila con el total, el operador de división y el divisor, con el cociente como etiqueta del lado que faltaba, y el par de fichas que se anulan.

El símbolo nuevo es el operador de división. El problema que lo hizo necesario: hasta ahora la vuelta era un gesto, y un gesto no se puede guardar ni comparar. En cuanto el jugador tiene dos piezas de vuelta parecidas y quiere decidir cuál usar sin probarlas, necesita que la vuelta esté escrita al lado del estirado. Y en cuanto quiere componer —estirar, volver, estirar otra vez— necesita que las dos acciones ocupen el mismo tipo de lugar en la pantalla. El operador nace en el paso 2 y no antes, cuando la flecha que sube ya se ganó su lugar.

El signo de igual aparece y el nodo tampoco lo introduce, con el mismo criterio de los nodos 3, 4 y 5: su historia es la de `prealg.eq.balance`. Lo que este nodo agrega es una **convención de escritura** propia: el mismo renglón sirve para las dos lecturas del cociente. `12 ÷ 3` es cuántas filas tiene un piso de doce con tres por fila, y también cuánto hay en cada una de tres filas, y el juego no usa dos notaciones para las dos preguntas. Que sean la misma es un descubrimiento del jugador cuando gira el piso, no una definición.

## 10. Definición formal

Capa `formal`: texto corto con voz y la banda al lado. Tres frases, de a una: "Dividir por un número es deshacer el estirado por ese número." "El resultado de dividir es el lado que le falta a un rectángulo del que se conoce el total y un lado." "El único estirado que no se puede deshacer es el que multiplica por cero."

Condiciones y casos especiales, verificados sobre el objeto: dividir por 1 no toca la banda; dividir un número por sí mismo la devuelve al largo de una marca; dividir por cero es la cerradura sin pieza, y la banda colapsada lo muestra en lugar de enunciarlo (`cs.arith.div_by_zero_no_key`). Cuando el reparto no es exacto, las baldosas sobrantes quedan al costado del rectángulo y el nodo las nombra sin resolverlas.

Ya jugado: las tres frases enteras, en `concrete`. Nuevo: la palabra "cociente" y la distinción entre "no se puede deshacer" y "no da un número entero", que son dos fracasos distintos y el jugador tiende a confundir.

## 11. Propiedades

- **Dividir deshace multiplicar.** Estirar por k y después soltar por k deja la banda como estaba, en cualquier orden. Ligada al par de fichas que se anulan y a la entrada `cs.arith.div_undoes_mul`.
- **Multiplicar de vuelta comprueba la división.** El cociente por el divisor devuelve el total. Ligada a volver a juntar los platos, y es la verificación que el minijuego ofrece con un toque.
- **Dividir por cero no tiene vuelta.** Ligada a la banda colapsada contra el clavo, que ninguna pieza mueve (`cs.arith.div_by_zero_no_key`).
- **Un mismo piso responde dos preguntas.** Cuántas filas y cuánto por fila son dos cortes del mismo rectángulo. Ligada a girar el piso entre los dos cortes.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: una banda estirada por un factor visible y varias piezas de vuelta; tocar la que la devuelve a su largo original. Los distractores son factores vecinos y una pieza que corta el extremo.
- `explain`: dos animaciones sobre la misma banda. En una la banda se encoge de forma continua y todas las marcas vuelven a su lugar; en la otra se le recorta un pedazo del extremo y el largo coincide pero las marcas no. Tocar la que no es la vuelta del estirado.
- `manipulate`: arrastrar la pieza de vuelta sobre el cofre y ajustar el factor hasta que las marcas coinciden con la regla; después partir el rectángulo de baldosas en filas iguales.
- `apply`: un rectángulo de baldosas con un lado conocido; tocar la ficha del otro lado sin desarmarlo, contra el tiempo objetivo del nodo.
- `generalize`: aparece el estirado por cero y hay que reconocer que ninguna pieza lo deshace, arrastrando al cofre la ficha que dice que no hay vuelta. Se mezcla con casos que sí tienen vuelta y con repartos que dejan sobrante.
- `transfer`: en la grilla de `linalg.map.inverse_and_systems`, aplicar la deformación que devuelve la cuadrícula estirada a su estado original.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)): el nodo no declara ninguna en su YAML, y eso es coherente con lo que la mecánica permite. Los tres errores que sí ocurren se resuelven dentro del objeto, sin patrón de explicación y sin clasificar:

- **Recortar en vez de soltar.** El largo coincide y las marcas no. La banda queda con sus cuentas amontonadas contra el clavo y la regla debajo muestra la desalineación; el cofre no cede y el jugador ajusta desde ahí. Es el error importado del nodo 4 y el distractor de `explain`.
- **Pasarse de vuelta.** La banda queda más corta que el original y las cuentas por dentro de sus marcas. Se corrige empujando en el otro sentido.
- **Insistir con el estirado por cero.** Todas las piezas atraviesan el cofre sin engancharse. Después de dos intentos, la banda colapsada late una vez y la escena ofrece un caso con vuelta al lado, para que la diferencia se vea por contraste.

Los distractores de `explain` se generan desde las reglas `detect` de las misconceptions de los prerequisitos directos, más variaciones del factor de vuelta.

## 13. Generalización

La analogía se retira en dos tiempos. El reparto en platos se va primero, en cuanto el divisor deja de ser un número de platos posibles. La banda se queda hasta `formal` como fantasma a demanda, y el cofre se queda como el objeto que valida, porque representa estructura y no un nombre.

Variantes sin ayuda visual, en orden: divisores de una cifra sobre totales de dos; el mismo total dividido por dos divisores distintos, para separar las dos lecturas; división por 1 y del número por sí mismo mezcladas sin aviso; división por cero mezclada con las anteriores; y repartos que dejan sobrante, planteados y no resueltos.

Vueltas arbitrarias. El nodo termina con acciones que no son estirados: una figura que se rotó, una fila de objetos que se permutó, un color que se cambió. El jugador señala cuál acción devuelve el objeto a su estado inicial y cuál no tiene vuelta posible, sin números. Es la evidencia de que lo aprendido es la estructura de deshacer y no la aritmética de dividir; es también el material que `prealg.inv.operation_as_key` va a organizar.

El nodo está en `abstract` cuando el jugador elige el factor de vuelta sin dibujar la banda, distingue las dos lecturas de un mismo cociente, reconoce el caso sin vuelta y no lo confunde con el reparto inexacto.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `linalg.map.inverse_and_systems` (`grid_stretch`, `balance`): la cuadrícula fue deformada y hay que devolverla. La vuelta es una matriz, y el caso sin vuelta es la grilla aplastada en una línea, que es exactamente la banda colapsada de este nodo con una dimensión más.
- `geom.sim.similarity_as_scale` (`construct`): dadas dos figuras semejantes y el tamaño de la grande, encontrar el factor que las relaciona es dividir un lado por su correspondiente.
- `prob.basic.probability_as_proportion` (`urn_dice`, `sorter`): la parte de la urna que corresponde a un color se obtiene dividiendo, y el reparto en platos reaparece como el reparto del blanco.

Este nodo y el 4 se juntan más adelante. `prealg.inv.operation_as_key` toma los dos deshaceres, les agrega el del nodo 7 y los enuncia como un solo hecho: toda operación tiene una vuelta, algunas no la tienen, y el conjunto de las vueltas se puede guardar junto. Ahí nacen el llavero, la tabla de pares y el vocabulario general; acá hay una banda, un cofre y la pieza que lo abre.

Concepto siguiente: `arith.int.negatives` ([07](07-arith.int.negatives.md)). El nodo 7 no depende de este —cuelga del 4— y por eso la frase puente no entrega un concepto sino un objeto: la regla graduada que estuvo debajo de la banda todo el nodo, que es la pista del nodo 3 y termina en el clavo igual que la pista terminaba en la orilla. Narrada sobre la última banda que volvió a su largo: "La banda llegó al clavo y la regla se termina ahí. ¿Y del otro lado?". La regla se pone de pie y el nodo 7 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), las dos nativas sobre el estado del jugador. `chest_shrink_key_undoes_stretch` corre en gramática `invert`: la barra estirada se encoge de forma continua con el extremo fijo, una llave mide el tramo antes y después, el diagrama vertical dibuja la flecha de bajada y su vuelta, y el cofre gira al cerrarse el circuito; parametrizada por factor y largo, produce también las animaciones de `explain` cambiando qué parte de la barra se acorta. `tile_split_rectangle_into_rows` corre en gramática `scale` con apoyo de `partition`: las líneas de corte punteadas se vuelven continuas cuando las filas quedan iguales, y las baldosas sobrantes se separan del rectángulo; parametrizada por total y filas, produce las instancias de `apply`. Ninguna lleva texto rasterizado: los dígitos y el signo de división los dibuja el runtime según el `MathLocale` ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_div` ([M](../../M-calculadora/M0-progresion.md)), que ocupa el lugar de la llave que estaba dibujado como silueta desde que se abrió `op_mul`: el par del primer tier se completa. La tecla no devuelve solo el número; dibuja el diagrama vertical de lo que entró, la operación y lo que salió, con la flecha de vuelta tocable. La pregunta incómoda que el par trae al layout es la del divisor cero, y la calculadora la responde con la banda colapsada, no con un mensaje de error. Si el nodo decae, la tecla se dibuja con óxido y sigue funcionando.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): las piezas de vuelta se distinguen por forma antes que por etiqueta, la instrucción es la mano fantasma, `explain` se resuelve entre dos animaciones y el caso sin vuelta se reconoce porque la banda no reacciona. Los dígitos de las etiquetas son íconos con historia. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra donde las piezas ya llevan etiqueta y arma el divisor con el teclado de fichas; para él el contenido nuevo del nodo son las dos lecturas del cociente y la distinción entre no tener vuelta y no dar entero.
