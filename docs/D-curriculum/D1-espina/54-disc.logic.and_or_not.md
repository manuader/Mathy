# 54 — Y, O y NO como filtros (`disc.logic.and_or_not`)

> Locale `es`: "Y, O y NO como filtros". Minijuego: [Dos aros y tres fichas](../../F-minijuegos/disc.logic.and_or_not.md).

**Nodo:** `disc.logic.and_or_not` · **Área:** disc · **Nivel:** 3 · **Primitiva:** `partition` · **Mecánica principal:** `sorter` · **Literacy:** `short_text` · **Analogía:** `hula_hoops_overlap`

## 1. Concepto

Con una tarjeta se puede hacer una pregunta. Con dos tarjetas y una ficha se puede hacer una pregunta nueva, que es otra tarjeta: "y" acepta lo que pasa las dos, "o" acepta lo que pasa al menos una, "no" acepta exactamente lo que su tarjeta rechaza. Al terminar, el jugador arma tarjetas compuestas, señala qué región de dos aros encimados ilumina cada una, descubre que "o" incluye el solape, y llena las cuatro filas de una tabla que dice qué contesta la combinación para cada par de respuestas posibles. Antes sabía contestar una pregunta de pertenencia. Ahora sabe construir preguntas nuevas con las que tenía, y comprobar si dos preguntas armadas distinto son la misma.

## 2. Prerequisitos

- `disc.set.membership_rule` (nodo [53](53-disc.set.membership_rule.md)): la tarjeta como regla que decide sí o no. Se usa entera. El cajón, la lona como universo, el rebote, el cajón vacío, el signo `∈` y la letra del conjunto, y el objeto que cumple dos tarjetas y tuvo que elegir cajón, que es exactamente la escena con la que este nodo empieza. La misconception `set_as_list_not_rule` sigue viva acá, ahora dentro de cada región.

Es el único prerequisito, y eso es una decisión. La escuela suele enseñar la lógica proposicional antes que los conjuntos, con letras `p` y `q` que no denotan nada y tablas que se llenan de memoria. Acá el orden es el inverso: un conectivo es primero un filtro sobre objetos que están sobre una lona, la tabla se descubre contando regiones, y recién al final las letras reemplazan a las tarjetas. Quien aprende primero la tabla nunca sabe qué es lo que la tabla describe, y ahí es donde vive el error de leer "o" como excluyente sin que nada se lo señale.

## 3. Dificultad cognitiva real

Lo difícil no es memorizar tres filas. Son tres capacidades:

1. **"O" incluye el medio.** En el habla, "o" casi siempre excluye: café o té, ganás o perdés. En matemática "o" acepta también lo que cumple las dos cosas, y esa diferencia no es un tecnicismo: es lo que después hace que contar con "o" exija restar el solape una vez. La capacidad es notar que la pregunta tiene tres respuestas posibles y no dos, y es donde falla `inclusive_or_read_as_exclusive`.
2. **"No" necesita un afuera.** La negación no es una propiedad del objeto sino una resta contra el universo. "No rojo" son todas las piezas de la lona que no son rojas, y si la lona cambia, la respuesta cambia sin que la tarjeta se toque. Quien no tiene un universo explícito trata "no rojo" como si fuera un color más.
3. **La combinación es una tarjeta, no una secuencia.** "Rojo y grande" no es filtrar primero por rojo y después por grande: es una sola tarjeta nueva, que se puede negar, volver a combinar y comparar con otra. Es el primer momento del curriculum en que el resultado de una operación es del mismo tipo que sus operandos, y esa clausura es lo que hace posible anidar. Es también donde nace `negation_distributes_over_and`, que aplica el "no" a las partes en vez de al todo.

## 4. Problema intuitivo

Dos aros apoyados en el piso, un poco encimados, cada uno con una tarjeta al lado. Un montón de piezas alrededor. Alguien dice en voz alta "adentro van las rojas o las grandes" y empieza a acomodar piezas: las rojas chicas al aro de la izquierda, las azules grandes al de la derecha.

En `intuition` la escena se detiene justo cuando levanta una pieza roja y grande. Tres desenlaces dibujados: la pieza va a la parte encimada; la pieza se queda afuera porque "ya es de las dos y entonces no es de ninguna"; la pieza se parte en dos y va mitad a cada aro. El jugador elige y después ve. El segundo desenlace es exactamente la misconception del nodo, dibujada antes de que nadie la cometa, y el tercero es la que ya quedó descartada en el nodo 53: la pertenencia no se reparte.

El juego guarda la elección. Si el jugador eligió el segundo desenlace, el nivel donde aparece la ficha "o" arranca con esa escena.

## 5. Analogía del mundo real

`hula_hoops_overlap`, sobre la mecánica `sorter` ([G0](../../G-analogias/G0-reglas.md)).

Mapa objeto a concepto: cada aro es un conjunto; estar parado adentro de un aro es pertenecer; la parte encimada de los dos aros es la conjunción; estar en alguno de los dos aros es la disyunción; estar afuera de todos los aros pero sobre la lona es la negación; y contar la parte encimada una sola vez es el principio que después se llama inclusión y exclusión.

Invariante que conserva: cada pieza está en una y solo una de las cuatro regiones que los dos aros dibujan sobre la lona. Ninguna pieza está en dos regiones, ninguna está en ninguna. Es el mismo invariante del clasificador que el nodo 53 usó con un solo cajón, y acá se vuelve la razón de que la tabla tenga exactamente cuatro filas por más piezas que haya.

Punto de ruptura: `infinite_sets`. Dos aros sobre un piso encierran cantidades finitas y dibujables; en cuanto los conjuntos son infinitos, la región deja de tener una cuenta y el diagrama pasa a ser un esquema que ya no sostiene ningún argumento. Por eso la analogía se retira en `formal`, cuando la tabla reemplaza al recuento de regiones: la tabla no depende de cuántas piezas hay ni de si son finitas.

Por qué esta y no la lona sola del nodo anterior. Una lona con dos curvas separadas no puede mostrar la única dificultad real del nodo, que es el solape: hacen falta dos regiones que se crucen y una pieza que esté en las dos a la vez. Los aros son la piel más barata para eso, y separarlos hasta que no se tocan produce por sí solo el caso donde "o" incluyente y "o" excluyente coinciden, que es la trampa que el nodo tiene que desactivar.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `sorter` ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `hold`.

1. La lona con las piezas. Dos aros encimados, cada uno con su tarjeta. Abajo, una barra con tres fichas: `y`, `o`, `no`.
2. Demostración: una mano fantasma arrastra la ficha `y` al espacio entre las dos tarjetas. Las dos tarjetas se juntan en una sola tarjeta compuesta y solo la parte encimada se ilumina. Las piezas que la cumplen se deslizan solas hasta ahí.
3. El jugador cambia la ficha por `o`. Se iluminan los dos aros enteros, y la parte encimada se ilumina **una vez**, con la misma intensidad que el resto: no se suma consigo misma. Las piezas del solape no se mueven; ya estaban adentro.
4. El jugador arrastra la ficha `no` sobre una tarjeta. La tarjeta recibe un trazo y la región iluminada se da vuelta: se apaga el aro y se enciende todo el resto de la lona. Arrastrar una pieza desde afuera de la lona hacia adentro cambia el recuento sin que la tarjeta se toque.
5. El jugador separa los aros hasta que dejan de tocarse. Con `y` no se ilumina nada: reaparece el cajón vacío del nodo 53. Con `o` la región iluminada es la de siempre, y acá "o" incluyente y "o" excluyente dan lo mismo. El juego no dice nada, pero deja los aros ahí un momento y después los vuelve a encimar: la diferencia aparece sola.
6. `hold` sobre una región: las piezas de esa región se cuentan una a una en voz alta y el contador queda pegado a la región. Las cuatro regiones tienen su contador y la suma de los cuatro es siempre el total de la lona.
7. Las cuatro regiones se despegan y se apilan como cuatro renglones, cada uno con las dos respuestas que lo definen y la respuesta de la tarjeta compuesta. Son cuatro por más piezas que haya, y ese salto es el corazón del nodo.

Nada se llama incorrecto. Poner una pieza en la parte encimada cuando la tarjeta compuesta no la acepta hace que la pieza salga despedida hacia la región que sí le corresponde, que siempre existe. Armar una tarjeta que no acepta nada deja los cuatro contadores en cero salvo uno, y eso es un resultado, no un error.

## 7. Representación visual

Capa `visual`, primitiva dominante `partition` ([H](../../H-progresion-abstraccion.md)).

Los aros se vuelven dos curvas cerradas sobre el rectángulo de la lona y las piezas, puntos. Lo que se parte es la lona: dos curvas que se cruzan la dividen en cuatro regiones y ningún punto queda sobre una línea. Lo que se conserva son los puntos: cambiar la ficha del conectivo cambia qué se ilumina, nunca dónde está cada punto. Lo que se escala es el contador de cada región, que crece y decrece al arrastrar puntos entre regiones mientras la suma de los cuatro no se mueve.

La tabla vive al costado desde el momento en que las regiones se apilan: cuatro renglones, una columna por tarjeta simple y una por la compuesta. Iluminar una región enciende su renglón, y tocar un renglón ilumina su región. Las dos direcciones están siempre disponibles, y esa reversibilidad es lo que hace que la tabla se entienda como un resumen del dibujo y no como una regla nueva.

Todavía no se muestra: la implicación, que es `disc.logic.if_then_direction`; ningún conectivo de tres tarjetas dibujado con tres aros; y ningún símbolo de operación entre conjuntos.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Aros a curvas con cuatro contadores.** Al alternar dos veces entre `y` y `o` sobre las mismas tarjetas, los aros se aplanan en curvas sobre la lona y cada una de las cuatro regiones gana su contador. La lona deja de ser un piso y pasa a ser un rectángulo con cuatro casilleros de forma rara.
2. **Regiones a filas.** Al tocar la pila de contadores, las cuatro regiones se despegan y se acuestan como cuatro renglones ordenados. Cada renglón conserva un hilo con su región: tocar uno enciende el otro. Las respuestas se escriben con las dos marcas que el jugador ya usó, el tic y el rebote.
3. **Trazo sobre la tarjeta a `¬`.** El trazo que la ficha `no` dejaba sobre la tarjeta se despega de la tarjeta y se para adelante como un signo propio. Ocurre cuando el jugador niega una tarjeta que ya era compuesta y el trazo, dibujado encima, tapa la tarjeta que quiere negar.
4. **Fichas de palabra a paréntesis.** Al anidar por primera vez, la tarjeta compuesta se mete adentro de otra y el cofre del nodo 9 vuelve como fantasma: aparecen los paréntesis, que el jugador ya tiene, y las fichas `y` y `o` quedan escritas como palabras entre ellos. Queda `¬ (rojo y grande)`.
5. **Palabras a `∧` y `∨`.** El paso solo se dispara cuando hay dos tarjetas compuestas puestas una al lado de la otra para compararlas. Al tocar la ficha `y`, la palabra se contrae en un signo, y lo mismo con `o`. Queda `¬(p ∧ q)` frente a `¬p ∨ ¬q`, y las dos tablas al lado.

## 9. Notación matemática

Nacen tres signos, en tres momentos distintos, y cada uno tiene su problema.

`¬` nace de un problema de economía que el jugador siente con las manos. Mientras las tarjetas son dibujos, la contraria se puede dibujar: al lado de "rojo" se dibuja "no rojo" con el color tachado. Deja de poder dibujarse en cuanto la tarjeta habla de una cantidad o ya es compuesta: para hacer la contraria de "tiene tres puntos" hay que volver a decidir toda la regla, y para hacer la contraria de "rojo y grande" hay que decidir además qué significa contrariar dos cosas a la vez. Un trazo que da vuelta cualquier tarjeta, sin mirar qué dice, es más barato que una tarjeta contraria por cada tarjeta. Ese trazo es el signo.

`∧` y `∨` nacen del problema de comparar. Mientras hay un solo conectivo por tarjeta, las palabras alcanzan y son más claras que cualquier signo. Dejan de alcanzar en el momento exacto en que el jugador tiene dos tarjetas armadas distinto y quiere saber si son la misma: "no rojo y grande" leído en español no dice si el "no" cubre solo "rojo" o cubre todo, y comparar exige justamente esa diferencia. El paréntesis, que ya tiene desde `arith.expr.precedence_tree`, resuelve la ambigüedad, y el signo corto es lo que hace que las dos tarjetas quepan una encima de la otra. Por eso los dos llegan juntos y llegan tarde, en la segunda mitad de `symbolic`, y no cuando se aprende el conectivo.

La tabla de verdad no es un símbolo pero se introduce con el mismo criterio. El problema que la hace necesaria es una discusión: dos jugadores no se ponen de acuerdo sobre qué hace una tarjeta compuesta, y comparar sus lonas no sirve porque tienen piezas distintas. La tabla tiene cuatro filas y no depende de las piezas, así que decide la discusión. Cheatsheet `cs.disc.truth_tables` y `cs.disc.connective_regions`.

Lo que **no** nace acá, y es deliberado: `∩`, `∪` y el complemento. Son los nombres de las mismas tres regiones dichos como conjuntos y no como filtros, y el problema que los hace necesarios todavía no ocurrió. Aparece en `disc.set.union_intersection`, cuando la región deja de ser algo que se ilumina y pasa a ser un cajón nuevo, con su propia tarjeta, que se puede combinar y sobre todo contar: el momento en que hay que escribir cuántas piezas hay en "rojo o grande" sin contarlas dos veces. Introducir `∪` acá sería nombrar un objeto que el jugador todavía no necesita nombrar, que es lo que la regla de oro de [H](../../H-progresion-abstraccion.md) prohíbe.

## 10. Definición formal

Capa `formal`: texto corto con voz y la tabla al lado, con la lona apagada detrás. Tres frases, de a una.

"Un conectivo toma las respuestas de una o dos tarjetas y devuelve una respuesta." "'Y' contesta que sí solo cuando las dos contestan que sí; 'o' contesta que sí cuando al menos una contesta que sí, incluida la parte encimada; 'no' contesta lo contrario de su tarjeta." "Dos tarjetas armadas distinto son la misma cuando contestan igual en las cuatro filas."

Condiciones y casos especiales, verificados sobre el objeto: dos aros que no se tocan dejan la conjunción vacía, y ese caso es donde "o" parece excluyente sin serlo; un aro adentro del otro deja una región vacía y hace que una tarjeta compuesta coincida con una simple; "no" sin lona no tiene respuesta, y cambiar la lona cambia lo que "no" contesta; una tarjeta que acepta todo y una que no acepta nada existen y se comportan como los dos casos extremos de la tabla.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra conectivo, el nombre tabla de verdad, y la idea de que dos tarjetas puedan compararse sin piezas.

## 11. Propiedades

- **"O" incluye el solape.** Ligada a la pieza roja y grande que se queda quieta cuando la ficha cambia de `y` a `o`, y a que la parte encimada se ilumina una sola vez. Cheatsheet `cs.disc.connective_regions`.
- **"No" se mide contra la lona.** Ligada a arrastrar una pieza desde afuera de la lona hacia adentro y ver que el contador de "no rojo" sube sin que la tarjeta se toque.
- **La combinación se puede volver a combinar.** Una tarjeta compuesta es una tarjeta: se le pone un trazo, se la mete adentro de otra, y el paréntesis dice en qué orden. Ligada al anidamiento y al cofre fantasma del árbol de precedencia.
- **Los cuatro contadores suman el total.** Ligada a arrastrar puntos entre regiones y ver que la suma no se mueve. Es lo que hace que la tabla tenga cuatro filas y no más, y es la semilla de `disc.count.sum_rule`.
- **Dos tarjetas distintas pueden contestar igual.** Ligada a poner dos tablas una al lado de la otra y ver las cuatro filas coincidir. Es la primera vez que el jugador demuestra algo, aunque nadie use la palabra. Cheatsheet `cs.disc.truth_tables`.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), instanciados dentro de la mecánica. Las probes del locale, desarrolladas:

- `recognize`: dos aros encimados y cuatro tarjetas compuestas al costado, cada una con su región iluminada en miniatura. Tocar la que ilumina la parte encimada. Los distractores los genera `detect`: la que ilumina los dos aros sin el solape, la que ilumina un aro entero y la que ilumina todo menos el solape.
- `explain`: se suelta una pieza roja y grande con la tarjeta "rojo o grande" puesta. Tres animaciones de qué pasa: la pieza se queda en el solape iluminado; la pieza sale despedida fuera de los dos aros; la pieza se parte y va mitad a cada aro. Tocar la que muestra lo que pasa. Cada distractor es una misconception, la del nodo y la del prerequisito.
- `manipulate`: la lona llena, dos tarjetas simples y las tres fichas. Armar la tarjeta que deja afuera solo las piezas rojas y chicas. Hay más de una solución y todas se aceptan; la tabla al costado muestra si dos soluciones distintas coinciden.
- `apply`: antes de repartir, marcar en el contador cuántas piezas va a aceptar la tarjeta recién armada, y recién después soltar. Se puntúa la cercanía.
- `generalize`: armar dos tarjetas distintas que iluminen la misma región y mostrarlo en la tabla. El juego no dice cuáles son: lo dicen las cuatro filas.
- `transfer`: en las compuertas de `csmath.bool.logic_gates`, armar con dos entradas la combinación que enciende la luz. La misma tabla, sin piezas y sin aros: entra corriente y sale corriente.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`inclusive_or_read_as_exclusive`**, patrón `two_paths_diverge` sobre `sorter`. El jugador deja afuera las piezas del solape con la tarjeta "rojo o grande". El juego parte la lona en dos copias idénticas: en la izquierda ilumina la región de su lectura, sin el solape; en la derecha la del "o" del juego, con el solape. Las piezas del solape son las únicas que las separan y se encienden una por una con el contador. El objetivo del ítem aparece entre las dos copias. Voz: "Estas {n} piezas cumplen las dos. ¿Cumplen 'al menos una'?". No se reabre desde el estado erróneo: el jugador elige de nuevo con las dos copias a la vista. Es la de mayor severidad del nodo.
- **`negation_distributes_over_and`**, patrón `two_paths_diverge` sobre `sorter`. El jugador arma "no (rojo y grande)" y responde con la región de "no rojo y no grande". En una copia se traza la tarjeta compuesta y después se le pone el trazo encima; en la otra se le pone el trazo a cada tarjeta simple y después se las junta con `y`. Las dos regiones quedan distintas y la diferencia son las piezas que cumplen una sola de las dos tarjetas. Voz: "Esta pieza es roja pero no es grande. ¿Cumple 'rojo y grande'?". El jugador vuelve a armar con las dos copias a la vista.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de estas dos, más la de `set_as_list_not_rule` del prerequisito directo, que acá reaparece como decidir la región de una pieza nueva mirando qué piezas hay ya en cada región.

## 13. Generalización

La analogía se retira en `formal`. Los aros aguantan hasta ahí porque la región iluminada sigue siendo una imagen correcta de lo que el conectivo contesta, y se van en el momento exacto en que la tabla los reemplaza: cuando el jugador decide si dos tarjetas son la misma sin mirar ninguna lona, el dibujo dejó de aportar y además empieza a estorbar, porque sugiere que los conjuntos tienen tamaño y son finitos.

Variantes sin ayuda visual, en orden: tarjetas compuestas con las tres fichas a la vez y paréntesis que cambian la respuesta; aros que no se tocan y aros anidados, donde una región queda vacía y la tabla tiene una fila que nunca se usa; tarjetas sobre rasgos que parten en tres y no en dos, donde "no rojo" ya no es "azul"; comparación de dos tarjetas compuestas por sus tablas, sin piezas; y por último tarjetas que no hablan de objetos, como las condiciones de una puerta que se abre o las reglas de un juego.

El nodo está en `abstract` cuando el jugador contesta qué hace una tarjeta compuesta sin dibujar aros, decide si dos tarjetas son la misma mirando solo las cuatro filas, y explica por qué "o" no puede ser excluyente sin romper la cuenta de las cuatro regiones. La forma completa de esa capa llega con los cuantificadores y con la negación de un "para todo", en `disc.logic.quantifiers_as_search`.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área:

- `csmath.bool.logic_gates` (`machine_pipe` con `sorter`): las mismas tres tarjetas convertidas en tres compuertas. La lona desaparece y queda solo la tabla: entran dos respuestas, sale una. Es la transferencia más limpia del nodo porque no hay ningún objeto que clasificar, y por eso es la que prueba si el jugador entendió que el conectivo es una función de respuestas.
- `prob.basic.union_intersection` (`sorter` con `urn_dice`): las mismas cuatro regiones, ahora con probabilidad en vez de recuento. La parte encimada contada una sola vez se vuelve la razón de restar en la regla de la suma, y "no" se vuelve el complemento.
- `geom.class.quadrilateral_hierarchy` (`sorter` con `construct`): un rectángulo es un paralelogramo **y** tiene un ángulo recto; un rombo es un paralelogramo **y** tiene los lados iguales; un cuadrado es las dos cosas. La jerarquía entera es un árbol de tarjetas compuestas con "y", y la sorpresa es que ahí las tarjetas se verifican trazando y no mirando.

Concepto siguiente: `disc.set.union_intersection`. Frase puente, narrada sobre los dos aros con el solape iluminado: "Esta parte de acá adentro tiene sus propias piezas y su propia cuenta. ¿No merece su tarjeta?". La región iluminada se despega de los aros, se cierra sobre sí misma y se convierte en un cajón nuevo, con la tapa vacía esperando un nombre. El nodo siguiente empieza ahí y es donde `∩` y `∪` llegan con su problema.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `sorter_scene_two_hoops_connective` es nativa y es la imagen central: los dos aros con el grado de solape como parámetro, la región que se ilumina según el conectivo y el trazo de la negación que la da vuelta; parametrizada por el solape, por las composiciones, por qué conectivo está puesto y por si está negado, produce también las animaciones de `explain` y las miniaturas de `recognize`. `sorter_scene_regions_become_table_rows` es nativa y sostiene el salto del nodo: las cuatro regiones se despegan y se acuestan como cuatro renglones con su contador, con el hilo entre región y renglón vivo en las dos direcciones. Ninguna lleva texto rasterizado: contadores, marcas de respuesta y los signos de los conectivos los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsa `sorter_scene_rule_card_decides` (nodo 53) para las tarjetas simples y para el rebote.

**Calculadora:** en `ready` se habilita `op_truth_table` ([M](../../M-calculadora/M0-progresion.md)). Toma una expresión armada con fichas de tarjeta y conectivos y devuelve las cuatro filas, con el diagrama de dos aros al lado y la región de cada fila encendida al recorrerla. La implicación todavía no: esa ficha aparece apagada hasta `disc.logic.if_then_direction`. Si el nodo decae, el diagrama deja de acompañar a la tabla y quedan solo las filas.

**Edad universal:** el nodo es `short_text` porque las tarjetas compuestas se leen como una frase corta con paréntesis y comparar dos exige leerlas, no solo mirarlas; es el primer nodo de esta rama que sube de `icons`, y sube por eso y no por los signos, que llegan al final. Todo lo anterior a la comparación se juega sin leer ([Q](../../Q-edad-universal.md)): arrastrar fichas, ver qué región se ilumina, contar con el dedo apretado, elegir entre animaciones en `explain`, prompts por voz. Las tres fichas llevan un ícono además de la palabra, y la ficha `no` es un trazo, que no necesita traducción. Un adulto llega por diagnóstico salteando `real` e `intuition` y entra en la capa visual con las cuatro regiones; lo que no se le saltea es separar los aros hasta que no se tocan, porque es el único lugar donde se ve por qué el "o" del habla y el del juego parecen lo mismo y no lo son.
