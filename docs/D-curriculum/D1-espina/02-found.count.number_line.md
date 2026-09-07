# 02 — Los números viven en fila (`found.count.number_line`)

> Locale `es`: "Los números viven en fila". Minijuego: [El camino de piedras](../../F-minijuegos/found.count.number_line.md).

**Nodo:** `found.count.number_line` · **Área:** found · **Nivel:** 0 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundaria `slope_walker`) · **Literacy:** `none` · **Analogía:** `number_line_walk`

## 1. Concepto

Los números no son etiquetas sueltas: están en un orden fijo, ocupan lugares y entre lugar y lugar hay siempre la misma distancia. Al terminar, el jugador sabe decir qué número va después de otro sin volver a contar desde el principio, sabe poner un número en la casilla vacía de una pista y sabe dónde empieza la pista. Antes tenía un número por montón; ahora tiene un lugar para cada número.

## 2. Prerequisitos

- `found.count.cardinality` (nodo 1): el número como tarjeta de una colección. Se usan tres cosas suyas. El numeral, que nació allí como tarjeta que se lleva sin volver a contar y acá se clava sobre una casilla. El tic de un objeto por vez, que acá se vuelve un paso por vez. Y la barra con marcas del final del nodo 1, que es literalmente el objeto que se acuesta sobre el agua para volverse pista.

Es el único prerequisito del YAML y la arista no contradice el orden escolar, que también pone contar antes que la recta. Lo que sí se aparta es el reparto de trabajo: la escuela suele presentar la recta numérica como un dibujo para ilustrar el conteo. Acá la recta es un objeto que el jugador manipula antes de que exista ninguna operación, porque la posición es lo que hace posible el desplazamiento del nodo 3. Sin pista, sumar sería volver a juntar montones, y ese camino lleva a la suma repetida y no a la escala.

## 3. Dificultad cognitiva real

Lo difícil no es recitar la serie. Son tres capacidades que la palabra "orden" tapa:

1. **El sucesor.** Saber que después de cinco viene seis sin recontar desde uno. Un niño que solo tiene la tarjeta del nodo 1 vuelve al principio cada vez, porque para él cinco es una propiedad del montón y no un lugar en una fila.
2. **El paso constante.** Cada avance vale lo mismo, mida lo que mida el dibujo de la piedra. Es el invariante de `gears_sequence`, `same_step_every_turn`, y es lo que hace que la pista sea una regla y no una lista.
3. **La posición de partida.** Antes de dar el primer paso el caminante ya está en algún lado, y ese lado necesita nombre. Es la capacidad más tardía: pide aceptar que hay un número donde no hay nada contado.

Las tres son independientes. Un jugador puede recitar la serie entera y no anticipar el sucesor; puede anticipar el sucesor y creer que dos piedras juntas valen un paso más chico.

## 4. Problema intuitivo

Un camino de piedras chatas cruza el agua. Un caminante está en la orilla y quiere llegar a una piedra donde hay una bandera. Las piedras están todas a la misma distancia, y el agua entre ellas no se puede pisar.

En `real` el jugador solo mira: el caminante avanza de a una piedra y llega. En `intuition` la escena se detiene antes del final. Dos desenlaces dibujados: el caminante da un paso largo y saltea una piedra, o da pasos iguales y las pisa todas. El jugador elige y después ve. Una segunda escena, la que prepara el 0: el caminante todavía no dio ningún paso y alguien pregunta, con un gesto de duda, en qué piedra está. La orilla se ilumina como si fuera una piedra más. La pregunta nunca es "¿cuántas hay?": es "¿cuál sigue?" y "¿dónde empieza?".

## 5. Analogía del mundo real

`number_line_walk` ([G0](../../G-analogias/G0-reglas.md)), sobre `slope_walker` en el catálogo y jugada acá con la manivela de `gears_sequence`. Mapa: piedra del camino → número entero; posición del caminante → valor; un paso → incremento de una unidad; orden de las piedras → orden de los números; piedra de salida → cero.

Invariante que conserva: la distancia entre dos piedras consecutivas es siempre la misma, y el orden no cambia nunca. Eso es exactamente lo que conserva la recta numérica, así que el test de G0 pasa sin endurecer nada.

Punto de ruptura: `position_between_stones`. El caminante no se para en el agua. Mientras el nodo trabaje con enteros, el borde queda lejos; los números entre piedras son de `arith.frac.parts_and_ratio`, y ahí la piedra se parte y la analogía se abandona.

Por qué esta y no otra. La alternativa natural sería una escalera, que también ordena y también tiene escalones iguales. Se descarta por dos razones: la escalera sube, y esa altura mete una segunda dimensión que el nodo no usa y que compite con la pendiente del nodo 19; y una escalera no tiene "escalón cero" reconocible, mientras que la orilla sí. El camino sobre el agua además hace visible que entre piedra y piedra no hay nada pisable, que es justo lo que un nivel 0 debe creer.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Dos mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `gears_sequence` es la principal y aporta la herramienta: una manivela con dientes, donde cada diente es un paso y todos los dientes son iguales. `slope_walker` aporta el caminante y el terreno: el objeto que ocupa una posición y que se arrastra con el dedo. Se encuentran en un solo gesto: girar la manivela un diente mueve al caminante exactamente una piedra, y arrastrar al caminante una piedra hace girar la manivela un diente. Los dos gestos son el mismo hecho visto de dos lados.

1. La orilla, el camino de piedras, el caminante parado en la orilla, una bandera sobre una piedra lejana y la manivela abajo.
2. Demostración: una mano fantasma toma la manivela y la gira un diente. El caminante levanta un pie y cae en la primera piedra; suena un tic, el de la fruta del nodo 1. La mano repite dos veces y desaparece. La manivela late.
3. El jugador gira. Cada diente es un tic y un paso. Si gira rápido, el caminante encadena pasos y la manivela va marcando: nunca se saltea una piedra, porque la manivela no tiene medio diente.
4. Si el jugador arrastra al caminante directamente, el muñeco se despega y flota; al soltarlo cae en la piedra más cercana y la manivela se acomoda sola. No hay caída al agua ni penalización: el agua devuelve.
5. Si pasa la bandera, sigue habiendo pista: gira al revés y vuelve. El estado nunca se borra.
6. Casillas numeradas. Desde el segundo nivel, cada piedra lleva la tarjeta del nodo 1 clavada encima, y hay huecos: piedras sin tarjeta. El jugador arrastra fichas con numeral a los huecos. Una ficha equivocada no entra: se desliza hasta el borde de la piedra y vuelve a la mano.
7. Éxito: el caminante llega a la bandera y la piedra se ilumina. Sin cartel.

Nada se llama "incorrecto". Cada error tiene su consecuencia física y su reparación desde el estado real.

## 7. Representación visual

Capa `visual`, primitiva `displace` de [H](../../H-progresion-abstraccion.md): una figura que se mueve entera, conservando su forma y su tamaño, sobre un soporte graduado.

Las piedras se aplanan con un morph continuo en marcas de una recta horizontal, todas a la misma distancia, y el agua se vuelve la línea. El caminante se contrae en un punto grueso. La bandera se vuelve una marca resaltada. La manivela se estiliza en una rueda de dientes que sigue girando al costado, enganchada a la recta: cada diente, una marca.

Lo que se desplaza es el punto. Lo que se conserva es la separación entre marcas y el orden. Nada se escala: si la pista se dibuja más larga o más corta, las marcas se estiran todas juntas y el número de la marca no cambia, y esa comprobación es el ítem `generalize` del locale.

Todavía no hay flechas de longitud sobre la recta, ni operadores, ni signos entre números: la flecha que abarca varios pasos es del nodo 3 y acá se evita a propósito. Tampoco hay marcas a la izquierda de la de salida.

## 8. Transición a símbolos

El nodo termina en `visual` (`layers: [real, intuition, concrete, visual]`), así que la transición no llega a una expresión. Llega a la recta graduada con su origen. Cuatro morphs del mismo objeto, cada uno disparado por un gesto.

1. **Piedra → casilla con tarjeta.** La primera vez que el caminante recorre la pista entera de a un paso en `concrete`, cada piedra que pisó recibe la tarjeta del nodo 1 con el numeral del tic correspondiente. Las tarjetas nacen en el orden en que el pie las tocó; ese orden es el contenido del nodo.
2. **Orilla → tarjeta con `0`.** Cuando el jugador vuelve al punto de partida y pide la tarjeta de esa piedra, aparece un numeral que no se parece a los otros. Se dibuja mientras la voz señala que ahí el caminante no dio ningún paso. La orilla deja de ser borde y pasa a ser piedra.
3. **Piedras → marcas de una recta.** Al arrastrar el extremo de la pista, el camino se estira y se acuesta: las piedras se aplanan en marcas, el agua se vuelve la línea, el caminante se contrae en un punto. Las tarjetas quedan pegadas debajo de cada marca. El objeto es el mismo: tocarlo devuelve las piedras como fantasma.
4. **Tarjeta clavada → numeral de la recta.** Cuando el jugador completa una pista con huecos sin recorrerla, las tarjetas pierden el marco y quedan solo los numerales bajo las marcas. Esa es la recta graduada que el nodo 3 va a usar como campo de juego.

En ningún paso hay dos objetos que se alternan: la piedra con id estable se vuelve marca y conserva su numeral.

## 9. Notación matemática

Queda una recta horizontal con marcas equidistantes y numerales debajo, empezando por `0`.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), cada símbolo llega con el problema que lo hace necesario, y acá hay dos.

**La recta graduada.** El problema es guardar el orden. Con las tarjetas del nodo 1 el jugador puede decir cuántas frutas hay, pero no puede decir cuál viene después sin volver a armar los montones. En el cuarto nivel el juego le pide llevar al caminante a "la piedra que sigue a la de la bandera" cuando la bandera ya no está en pantalla. Las tarjetas sueltas no alcanzan: se pueden barajar. La pista no se puede barajar, y por eso el orden vive en ella y no en las tarjetas.

**El `0`.** El problema es que hay una pregunta sin respuesta: en qué piedra está el caminante antes de dar el primer paso. En el nodo 1 el cuenco vacío se dejó sin tarjeta y no molestó, porque un cuenco vacío se puede ignorar. Acá no se puede: el caminante está parado en algún lado, y ese lado es el lugar desde el que se cuentan todos los pasos. El `0` no es "no hay nada": es dónde se empieza. Esa es la mitad del `0` que este nodo necesita; la otra mitad, el cero como cardinal del cuenco vacío, es de `found.count.zero_as_empty`.

No hay operadores, ni igual, ni marcas a la izquierda del `0`.

## 10. Definición formal

El nodo no tiene capa `formal`: ni el YAML la declara ni el nivel 0 admite texto. Lo que el jugador ya jugó, y lo que un nodo posterior podrá decir en una frase con voz, es esto: los números enteros se pueden poner en una fila donde cada uno tiene exactamente un siguiente; la distancia entre un número y su siguiente es siempre la misma; y hay un primer lugar, el cero, desde el que se cuentan los pasos.

Condiciones que el jugador sintió sin nombrarlas: no hay dos números en la misma piedra (la ficha equivocada no entra); no hay piedras sin número (el hueco se completa); no se puede parar entre piedras (el agua devuelve). Caso especial que el nodo deja abierto: qué hay antes del `0`. El caminante puede girar la manivela al revés desde la orilla y la manivela se traba en el último diente. Ese tope es una promesa, no un límite: se abre en `arith.int.negatives`.

## 11. Propiedades

- **Cada número tiene exactamente un siguiente.** Ligada al diente de la manivela: un diente, una piedra, siempre.
- **El orden no depende de cómo se dibuje la pista.** Estirada, acortada o sin dibujos, la piedra de la bandera sigue siendo la misma. Ligada al ítem `generalize`.
- **La distancia entre piedras consecutivas es siempre la misma.** Ligada a la animación que miente de `explain`, donde los saltos son de distinto tamaño y la fila se rompe.
- **Contar es caminar desde el cero.** El número de una piedra es la cantidad de pasos que hay desde la orilla hasta ella. Ligada al tic, que es el mismo del nodo 1: la tarjeta del montón y el numeral de la piedra son el mismo objeto por dos caminos.
- **Volver por donde se vino devuelve a la piedra de partida.** Ligada a girar la manivela al revés. Es la semilla que el nodo 4 convierte en la resta.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin texto:

- `recognize`: una pista con casillas numeradas y el caminante en una de ellas; la manivela muestra cuántos dientes va a girar. Tocar la casilla donde va a parar, antes de que gire. Los distractores se generan con una casilla de más y una de menos, que es exactamente el error de contar la piedra de salida como un paso.
- `explain`: dos animaciones sobre la misma pista. En una el caminante avanza un paso por número y las casillas quedan a la misma distancia; en la otra saltea casillas y los saltos son de distinto tamaño. Tocar la que rompe la fila. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones ([Q](../../Q-edad-universal.md)).
- `manipulate`: girar la manivela para llevar al caminante desde la casilla marcada hasta la casilla con la bandera, y soltar cuando llega. Cada diente hace tic.
- `apply`: una casilla vacía entre dos numeradas; arrastrar la ficha con el número que falta mientras el caminante espera. Con dos y tres huecos seguidos en los niveles altos.
- `generalize`: la pista se estira, se acorta y después pierde los dibujos hasta ser solo marcas; ubicar la ficha del número pedido en cada versión.
- `transfer`: sobre un dial de giro, llevar la aguja tantas marcas como indica la ficha, como si la rueda fuera la pista enrollada.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)). El YAML declara `misconceptions: []`: ninguna entrada del catálogo con regla `detect` apunta a este nodo, así que ninguna tiene nombre ni prompt de locale y ninguna clasifica ni bloquea `ready`. Lo que el diseño prevé, con el patrón que correría si se catalogara y la voz que se usa mientras tanto, que es la que repite la pregunta del ítem:

- **Contar la piedra de salida como un paso.** El jugador pide tres pasos y espera llegar a la piedra 2, o toca la casilla vecina en `recognize`. Patrón `replay_on_mechanic` sobre `gears_sequence`: el juego congela, gira la manivela diente por diente en cámara lenta y hace tic solo cuando el pie despega, con un halo sobre la piedra de partida que no suena. Voz: "El caminante ya estaba parado ahí. ¿Cuántas veces levantó el pie?".
- **Pasos de distinto tamaño.** Es el distractor de `explain`. Si el jugador lo elige como verdadero, el juego reproduce ese recorrido sobre su propia pista y muestra que el caminante cae en el agua entre dos piedras. Voz: "Este paso fue más largo. ¿Dónde cayó?".
- **Orden por tamaño del dibujo.** Aparece en `generalize`, cuando la pista se estira: el jugador ubica la ficha por cuánto espacio ocupa y no por cuántas marcas hay. El juego encoge la pista con la ficha puesta y muestra que la marca es otra. Voz: "La pista se hizo más corta. ¿Cambió de piedra la bandera?".

Si el playtest de [Q](../../Q-edad-universal.md) muestra alguno sistemático, merece entrada propia en `misconceptions.yaml` con patrón `replay_on_mechanic` sobre `gears_sequence`; el primero es el candidato más claro.

## 13. Generalización

La analogía se retira en `visual`, como declara `fades_at_layer`. La señal es el `generalize` del locale: la pista se estira, se acorta y después pierde los dibujos. Cuando el jugador ubica la ficha del número pedido sobre marcas desnudas, el agua y las piedras ya no están haciendo nada.

Variantes que debe resolver sin el camino: pistas de distinta longitud con la misma cantidad de marcas; pistas verticales, donde el orden va hacia arriba; pistas que no empiezan en la marca del extremo, con el `0` corrido; y marcas sin ningún dibujo, solo numerales bajo una línea. La última separa el orden del recorrido: no hay caminante, hay que poner la ficha igual.

El nodo no tiene capa `abstract`. Su forma completa se considera alcanzada, dentro de `visual`, cuando el jugador nombra el siguiente de un número sin recontar, completa huecos sin recorrer la pista, distingue longitud de posición y ubica el `0` en una pista corrida. Lo que un nodo `abstract` diría (un orden total discreto con primer elemento y sucesor único) lo enuncia mucho después `disc.ind.domino_induction`, sin piedras.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `geom.angle.turn_as_measure` (`construct`): la pista se enrolla y las piedras son marcas de un dial. Llevar la aguja tantas marcas como indica la ficha es el mismo desplazamiento sobre un soporte graduado, y el ángulo aparece como cantidad de pasos de giro antes que como abertura.
- `linalg.vec.vector_as_displacement` (`grid_stretch`): el paso deja de ser un tic y se vuelve una flecha con punta y cola sobre una grilla. La piedra de salida es el origen, y ahí se ve por qué el `0` tenía que tener nombre.
- `trig.circle.unit_circle_radians` (`gears_sequence`): la pista se cierra sobre sí misma y el caminante vuelve a pasar por donde ya estuvo. El orden sigue, pero deja de haber una última piedra.

Concepto siguiente: `arith.add.displacement` ([03](03-arith.add.displacement.md)). Frase puente, narrada sobre la pista con el caminante quieto: "Ya sabés en qué piedra está y cuál sigue. Si en vez de un paso da tres de una vez, ¿en cuál cae?". La manivela gana un tope que la hace girar tres dientes de un tirón, aparece una ficha con el número de pasos, y el nodo 3 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `gear_track_numbers_in_order` es la pista con sus numerales apareciendo en orden mientras la rueda dentada gira: gramática `displace`, con la separación entre marcas como lo que se conserva; parametrizada por el rango de la pista y por qué casillas van vacías, produce los ítems de `apply` y las pistas estiradas de `generalize`. `gear_one_step_one_number` es el enganche entre un diente y un paso: la rueda avanza un diente, el punto salta una marca y el numeral se ilumina; parametrizada por la casilla de partida y la cantidad de pasos, produce la mecánica de `manipulate`, los ítems de `recognize` y las dos animaciones de `explain`, una con el paso constante y otra con el paso alterado. Ninguna lleva texto rasterizado: los numerales los dibuja el runtime desde el `MathTree`, y el caminante, la piedra y el agua son assets propios ([P](../../P-internacionalizacion.md)).

**Calculadora:** el YAML declara `calc_unlocks: [op_count]`, que ya venía habilitado del nodo 1: el nodo no agrega una tecla, le cambia la cara ([M](../../M-calculadora/M0-progresion.md)). Desde acá, tocar `contar` sobre un montón de fichas ya no las ordena en fila con una tarjeta al final: las acuesta sobre la pista, hace caminar al punto desde el `0` y deja el numeral bajo la marca de llegada. La misma tecla, la misma animación de la mecánica, y por primera vez un `0` visible en el visor. Si el nodo decae, la tecla vuelve a la fila del nodo 1 antes de mostrar óxido.

**Edad universal:** el nodo es `literacy: none` y nivel 0, y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que gira la manivela un diente, los targets son piedras y una manivela del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación y hace la pregunta. Con el sonido apagado no falta nada: el tic tiene su equivalente en el destello de la piedra pisada. Un adulto no juega este nodo: el diagnóstico lo deja en `ready` provisional con un solo ítem de `apply`, la casilla vacía entre dos numeradas, y solo vuelve si un nodo posterior decae hasta acá.
