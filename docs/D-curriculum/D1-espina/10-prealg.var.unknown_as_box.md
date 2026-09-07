# 10 — La incógnita es una caja cerrada (`prealg.var.unknown_as_box`)

> Locale `es`: "La incógnita es una caja cerrada". Minijuego: [Cajas en el libro de cuentas](../../F-minijuegos/prealg.var.unknown_as_box.md).

**Nodo:** `prealg.var.unknown_as_box` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `partition` · **Mecánica principal:** `ledger` (secundarias `balance` y `chest_key`) · **Literacy:** `none` · **Analogía:** `mystery_box`

## 1. Concepto

Una incógnita es una cantidad que existe, es fija y no se conoce. Al terminar, el jugador cuenta, agrupa y mueve cajas cerradas sin abrirlas, distingue dos marcas distintas, escribe tres cajas iguales como `3x` y entiende que operar con la caja y averiguar qué tiene adentro son dos preguntas separadas.

## 2. Prerequisitos

- `arith.expr.precedence_tree` (nodo 9): el árbol de la expresión. Se usan el anidamiento de cofres, el hecho de que una expresión tiene hojas y ramas, y la escena en que una fila plana revela su cofre fantasma. La caja ocupa una hoja de ese árbol, y por eso el árbol tiene que existir antes.

La arista se aparta del orden escolar, que presenta la letra junto con la primera ecuación y obliga a aprender a la vez qué es una letra, qué es una igualdad y qué es un procedimiento. [C0](../../C-knowledge-graph/C0-esquema.md) los separa en tres nodos.

## 3. Dificultad cognitiva real

Lo difícil no es "usar letras". Son cinco capacidades:

1. **La letra nombra una cantidad, no un objeto.** `x` no es "una manzana": es cuántas hay. Quien la lee como etiqueta pega letras y las multiplica como si fueran nombres.
2. **Desconocida pero fija.** Mientras dure el problema la caja tiene lo mismo adentro. Es la diferencia entre una incógnita y una variable que recorre valores.
3. **Operar sin abrir.** Se puede decir "dos cajas y tres manzanas" sin saber qué hay adentro: manipular un objeto por su forma y no por su valor.
4. **Misma marca, mismo contenido.** Dos marcas distintas pueden guardar lo mismo o no; nada obliga a que difieran, y eso rompe la intuición de que letras distintas son números distintos.
5. **El número de adelante cuenta cajas.** En `3x` el `3` dice cuántas cajas hay, no ordena multiplicar un nombre. Leerlo como producto es otro nodo (`prealg.expr.implicit_grouping`).

## 4. Problema intuitivo

Un puesto de frutas. Alguien apila en el mostrador cuatro manzanas sueltas y dos cajones cerrados, iguales, con la misma marca pintada en la tapa, y el puestero anota en su libro lo que entró.

En `real` el jugador solo mira: el puestero dibuja una fila con las manzanas y otra con los cajones. En `intuition` la escena se detiene con el libro a medio escribir. Tres desenlaces dibujados: llega otro cajón con la misma marca y el puestero agrega un palito a esa fila; llega uno con otra marca y abre fila nueva; llega uno con la misma marca y lo mete en la fila de las manzanas. El jugador elige y después ve. El tercero es la misconception del nodo, mostrada antes de que la cometa.

## 5. Analogía del mundo real

`mystery_box`, la del YAML, montada sobre `chest_key` ([G0](../../G-analogias/G0-reglas.md)). Mapa: caja cerrada → variable; lo de adentro → valor; misma marca → misma variable; marca distinta → otra variable; mover la caja sin abrirla → manipulación simbólica; abrir la caja → resolver.

Invariante que conserva: el contenido no cambia mientras la caja esté cerrada, y dos cajas con la misma marca pesan lo mismo aunque nadie las haya abierto. Contarlas y moverlas es legítimo solo porque ese invariante se sostiene.

Se rompe en `box_with_changing_contents`: una caja cuyo contenido cambia deja de ser incógnita y pasa a ser la entrada de una máquina, que es el sentido de `alg.fn.function_as_machine`. Por eso la analogía se retira en `symbolic`, antes de que la ruptura se note.

Por qué esta y no otra: "la letra es un número que no sabemos" ya es una definición, no una imagen. La caja da a la vez las tres cosas del nodo: algo que se ve, algo que no se ve y algo que no cambia.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas con aportes distintos ([E0](../../E-mecanicas/E0-catalogo.md)). `ledger` es la principal y aporta la fila: un cajón cerrado es una fila más. `balance` aporta el peso, lo único que informa del contenido sin abrirlo. `chest_key` aporta el lugar: la caja es una hoja del árbol del nodo 9. Se encuentran en el arrastre que deja un objeto en una fila. Gestos: `drag` y `tap`.

1. Un libro con dos filas vacías, manzanas sueltas y cajones cerrados con marca.
2. Demostración: una mano fantasma lleva las manzanas a una fila y los cajones a otra, y al mezclarlos la fila devuelve el cajón con un rebote suave.
3. El jugador ordena. Una fila solo acepta objetos con la misma forma y la misma marca, y la que no corresponde devuelve el objeto sin cartel.
4. La balanza aparece al costado, sin signo entre los platos. El jugador pone cajones de un lado y manzanas del otro hasta que la barra queda derecha, y así sabe cuánto pesa un cajón sin abrirlo. Es un instrumento, todavía no una afirmación.
5. Llega un cajón con otra marca y abrir fila nueva es la única jugada que el libro acepta.
6. El árbol del nodo 9 aparece con una hoja vacía que late. El jugador arrastra el cajón ahí y el árbol queda completo aunque nadie sepa el valor de esa hoja.
7. Un solo nivel permite abrir un cajón al final, para comprobar que había lo que la balanza decía.

Cuando el jugador se equivoca no pasa nada malo: la fila devuelve el objeto, la barra queda torcida, la hoja sigue latiendo. El estado se conserva y la jugada se repite.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md). El libro se estiliza: cada fila es una barra segmentada, un segmento por objeto, con el conteo al final. El cajón se aplana en un segmento del mismo alto pero con el borde punteado, de longitud desconocida. Se desplaza lo que cambia de fila; se conserva la cantidad total de segmentos al reagrupar, que es el invariante `count_preserved_under_regrouping`.

La balanza aparece reducida a dos columnas y una barra, y se apaga apenas la medición termina, sin dejar signo. Todavía no hay letras, ni coeficientes, ni igualdad escrita: la caja tiene marca dibujada, no nombre.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto, con los ids conservados ([O](../../O-arquitectura-tecnica.md)).

1. **Cajón → barra punteada.** Al pasar a `visual` el cajón se aplana como los demás objetos, pero su borde queda punteado y su longitud no se fija.
2. **Fila → conteo.** Al completar una fila el dibujo se atenúa y el número queda adelante: `3 🍎`. Es el paso `tally` de la mecánica.
3. **Marca → letra.** Cuando el jugador mide por primera vez un cajón y la barra queda derecha, la marca de la tapa se despega, gira y se contrae en `x`, y la barra punteada se contrae con ella. El cajón no desaparece: se convierte.
4. **Fila de cajas → coeficiente.** Al juntar tres cajas iguales, las barras se funden en una y el conteo pasa adelante: `x + x + x` se contrae en `3x`. El `3` hereda la identidad del conteo, no de un signo de multiplicar que nunca hubo.
5. **Segunda marca → segunda letra.** El otro cajón repite el paso 3 y queda `y`. El libro conserva las dos filas, y arrastrar una sobre la otra sigue rebotando, ahora con letras.

## 9. Notación matemática

Nace `x`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), el problema que lo hace necesario es concreto: con tres marcas distintas en el mostrador, señalar con el dedo "esta caja" deja de alcanzar y describirla con una frase es más largo que el cálculo. La letra sale de la marca que el cajón ya tenía pintada.

Con `x` llega una convención de escritura, no un símbolo nuevo: el coeficiente. `3x` se escribe sin signo porque el número cuenta filas, y contar no es una operación que se anote. Que además se lea como producto es un descubrimiento posterior, de `prealg.expr.implicit_grouping`; las dos entradas de cheatsheet del nodo separan las dos ideas.

No aparece `=`: el signo lo hace nacer el nodo 11, cuando el problema deja de ser medir y pasa a ser conservar.

## 10. Definición formal

Capa `formal`: texto corto con voz y el libro al lado. Tres frases, de a una: "Una incógnita es una cantidad que no conocemos y que no cambia mientras dure el problema." "Una letra es su nombre." "Dos letras iguales nombran la misma cantidad; dos letras distintas pueden nombrar la misma o no."

Condiciones y casos especiales, verificados sobre el objeto: una caja vacía también es una cantidad y su letra vale cero; una caja puede aparecer varias veces en la misma expresión y todas valen lo mismo a la vez; puede ocupar cualquier hoja del árbol, incluso una adentro de otro cofre.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "incógnita" y el caso de las dos letras que podrían coincidir.

## 11. Propiedades

- **Misma marca, mismo contenido.** Ligada a la balanza: cambiar un cajón por otro de la misma marca no mueve la barra.
- **Las cajas se cuentan como objetos.** `x + x + x` es `3x`, y `2x + 3x` da `5x`. Ligada a juntar dos filas de la misma marca sin que el libro rebote.
- **Una caja y una manzana no se juntan.** `x + 3` queda así. Ligada al rebote de la fila que no corresponde, que el jugador sintió antes de que hubiera letras.
- **La caja se mueve sin abrirse.** Una expresión con caja se reordena, se copia y se anida, y sigue siendo la misma. Ligada a arrastrar el cajón a la hoja sin tocar la tapa.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un libro con fichas y una caja cerrada. El guía pregunta por voz cuál cantidad no se ve y el jugador toca la caja; los distractores son filas visibles.
- `explain`: dos animaciones sobre el mismo libro. En una, dos cajas iguales y tres cajas iguales se juntan en cinco y el conteo pasa adelante. En la otra, las marcas se despegan, se pegan y se multiplican como si fueran nombres. El jugador toca la que trata la letra como etiqueta: se elige entre animaciones, nunca entre frases.
- `manipulate`: el jugador pone en la balanza tantas cajas como indica el coeficiente y ajusta fichas del otro plato hasta que la barra queda derecha.
- `apply`: una caja aparece como hoja de un árbol de cofres y el jugador la arrastra al lugar de la cantidad desconocida, leyendo la estructura del nodo 9.
- `generalize`: la caja se vuelve letra y siguen llegando marcas distintas. El jugador cuenta cajas iguales con letras distintas sin mezclarlas, ya sin dibujos.
- `transfer`: en las tuberías de `alg.fn.function_as_machine`, toca la entrada que la máquina todavía no conoce, marcada con una letra.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`variable_as_label`** (`replay_on_mechanic` sobre el `ledger`, la mecánica principal del nodo). El jugador junta la fila de `x` con la de `y` y trata las letras como etiquetas pegables: de `2x + 3y` sale `5xy`. El juego congela y repite el gesto en cámara lenta: las dos filas se acercan y, en el contacto, las cajas vuelven a mostrar su dibujo y se ve que no son iguales. Las filas se separan solas con sus conteos. Voz: "Estas cajas no tienen la misma marca. ¿Cuántas hay de cada una?". La interacción se reabre desde ese estado.

## 13. Generalización

La analogía se retira en `symbolic`, apenas la marca se convierte en letra. El cajón puede pedirse como fantasma tocando la letra y se desvanece al soltar, pero no vuelve solo: la caja representa un nombre, y lo que representa un nombre cede su lugar al nombre.

Variantes sin ayuda visual, en orden: más de dos marcas en el mismo libro; letras que no son `x` ni `y`; una caja repetida en dos filas; una caja que vale cero sin dejar de ser caja; una caja adentro de un cofre anidado, donde la letra queda entre paréntesis. Al final llegan libros con objetos que no son cajas ni frutas: figuras, sonidos, marcas inventadas, y se evalúa que agrupe por identidad y no por parecido.

El nodo está en `abstract` cuando reagrupa expresiones con varias letras sin pedir el libro dibujado y acepta que dos letras distintas podrían valer lo mismo sin que eso rompa nada.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas y con mecánicas nuevas:

- `alg.fn.function_as_machine` (`machine_pipe`): la caja pasa a ser la boca de la máquina y la letra nombra lo que todavía no entró.
- `alg.expr.distributive_tiles` (`tiles`): un rectángulo con un lado de longitud desconocida. La caja es un lado y el área se escribe sin medirlo.
- `prob.rv.random_variable_as_machine` (`machine_pipe`): una caja cuyo contenido no es fijo sino sorteado. Es donde `box_with_changing_contents` deja de ser ruptura y pasa a ser el tema.
- `linalg.map.inverse_and_systems` (`grid_stretch`): la entrada desconocida de una deformación, una caja con dos números adentro.

Concepto siguiente: `prealg.eq.balance` ([11](11-prealg.eq.balance.md)). Frase puente, narrada sobre la balanza que el jugador usó para medir: "Ya sabés poner la caja en el libro sin abrirla. Para saber cuánto tiene adentro la pusiste en un plato. ¿Qué está diciendo la barra cuando queda derecha?". La balanza se enciende y no se apaga: el nodo 11 empieza ahí.

---

**Visualización:** dos escenas del YAML, nativas y sin texto rasterizado ([I](../../I-manim/I0-mapping.md)). `ledger_box_hides_tokens` corre sobre el libro del jugador: fichas visibles, una caja que se cierra sobre parte de ellas y el total que sigue en pantalla aunque parte del conteo ya no se vea; gramática `partition`, con el total conservado como elemento resaltado. Genera también las animaciones de `explain`. `chest_box_as_tree_leaf` toma la expresión del nodo 9 y hace crecer la caja en una hoja, con el resto del árbol intacto. Se suma `ledger_morph_fruit_to_symbol`, que [I](../../I-manim/I0-mapping.md) asigna a este nodo aunque el YAML del grafo no la liste: es el morph de la sección 8, con las etapas y el mapa de ids como parámetros. Las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_variable` ([M](../../M-calculadora/M0-progresion.md)), una tecla con el dibujo del cajón que la primera vez que se toca se transforma en `x`. Es estructural: no calcula, agrega un nombre a la expresión que se arma. Vive en el modo de exploración libre, donde la calculadora no devuelve un número sino la misma expresión ordenada.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Las marcas son dibujos, la letra llega como morph de ese dibujo, las filas se ordenan por forma y color, `explain` se responde entre dos animaciones y los prompts son de voz, en formas que sirven igual para tú y para vos. Un adulto llega por diagnóstico saltando `real` e `intuition` y entra en el libro con letras; para él, el nodo dura lo que dura confirmar que `2x + 3y` no es `5xy`.
