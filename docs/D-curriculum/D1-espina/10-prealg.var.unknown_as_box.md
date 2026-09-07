# 10 — La incógnita es una caja cerrada (`prealg.var.unknown_as_box`)

> Locale `es`: "La incógnita es una caja cerrada". Minijuego: [Cajas en el libro de cuentas](../../F-minijuegos/prealg.var.unknown_as_box.md).

**Nodo:** `prealg.var.unknown_as_box` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `partition` · **Mecánica principal:** `ledger` (secundarias `balance` y `chest_key`) · **Literacy:** `none` · **Analogía:** `mystery_box`

## 1. Concepto

Una incógnita es una cantidad que existe, es fija y no se conoce. Al terminar, el jugador cuenta, agrupa y mueve cajas cerradas sin abrirlas, distingue dos cajas con marcas distintas, escribe tres cajas iguales como `3x` y entiende que operar con la caja y averiguar qué tiene adentro son dos preguntas separadas. Antes solo podía trabajar con cantidades que veía.

## 2. Prerequisitos

- `arith.expr.precedence_tree` (nodo 9): el árbol de la expresión. Se usan el anidamiento de cofres, el hecho de que una expresión tiene hojas y ramas, y la escena en la que una fila plana revela su cofre fantasma. La caja de este nodo ocupa una hoja de ese árbol, y por eso el árbol tiene que existir antes.

La arista se aparta del orden escolar. La escuela presenta la letra junto con la primera ecuación: la incógnita nace ya adentro de "despejá x", y el jugador aprende a la vez qué es una letra, qué es una igualdad y qué es un procedimiento. [C0](../../C-knowledge-graph/C0-esquema.md) las separa en tres nodos. Acá la caja aparece sin ninguna igualdad a la vista: se la cuenta, se la ordena en filas y se la mete en un árbol, pero nunca se la despeja. La igualdad llega en el nodo 11 y la llave que abre en el 12.

## 3. Dificultad cognitiva real

Lo difícil no es "usar letras". Son cinco capacidades:

1. **La letra nombra una cantidad, no un objeto.** `x` no es "una manzana": es cuántas hay. Quien la lee como etiqueta pega letras y las multiplica como si fueran nombres, y produce la misconception del nodo.
2. **Desconocida pero fija.** Mientras dure el problema, la caja tiene siempre lo mismo adentro. Es la diferencia entre una incógnita y una variable que recorre valores, que llega mucho después con las máquinas.
3. **Operar sin abrir.** Se puede decir "dos cajas y tres manzanas" sin saber qué hay en la caja. Ese es el salto real: manipular un objeto por su forma y no por su valor.
4. **Misma marca, mismo contenido.** Dos cajas con la misma marca guardan lo mismo. Dos marcas distintas pueden guardar lo mismo o no; nada obliga a que difieran, y eso rompe la intuición de que letras distintas son números distintos.
5. **El número de adelante cuenta cajas.** En `3x` el `3` dice cuántas cajas hay, no ordena multiplicar un nombre. La lectura como producto es otro nodo (`prealg.expr.implicit_grouping`); acá es un conteo de filas.

## 4. Problema intuitivo

Un depósito de un puesto de frutas. Alguien apila en el mostrador cuatro manzanas sueltas y dos cajones de madera cerrados, iguales, con la misma marca pintada en la tapa. El puestero anota en su libro de cuentas lo que entró.

En `real` el jugador solo mira: el puestero dibuja en su libro una fila con las manzanas y otra fila con los cajones, y no abre ninguno. En `intuition` la escena se detiene con el libro a medio escribir. Tres desenlaces dibujados: llega un tercer cajón con la misma marca y el puestero agrega un palito a la fila de cajones; llega un cajón con otra marca y abre una fila nueva; llega un cajón con la misma marca y el puestero lo mete en la fila de las manzanas. El jugador elige y después ve. El tercero es la misconception del nodo mostrada antes de que la cometa.

## 5. Analogía del mundo real

`mystery_box`, la del YAML, montada sobre `chest_key` ([G0](../../G-analogias/G0-reglas.md)). Mapa: caja cerrada → variable; lo que hay adentro → valor; misma marca, misma caja → misma variable; marca distinta → otra variable; mover la caja sin abrirla → manipulación simbólica; abrir la caja → resolver.

Invariante que conserva: el contenido no cambia mientras la caja esté cerrada, y dos cajas con la misma marca pesan lo mismo aunque nadie las haya abierto. Todo lo que el jugador hace con la caja (contarla, apilarla, ponerla en una fila, meterla en un árbol) es legítimo precisamente porque ese invariante se sostiene.

Se rompe en `box_with_changing_contents`: una caja cuyo contenido cambia deja de ser una incógnita y pasa a ser la entrada de una máquina. Ese es el sentido de `alg.fn.function_as_machine`, y por eso la analogía se retira en `symbolic`, antes de que la ruptura se note.

Por qué esta y no otra: la alternativa habitual es "la letra es un número que no sabemos", que ya es una definición y no una imagen. La caja cerrada es la única que da a la vez las tres cosas que el nodo necesita: algo que se ve (existe), algo que no se ve (desconocido) y algo que no cambia (fijo). La bolsa de tela fallaría en la tercera, porque se deforma.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas, cada una con un aporte distinto ([E0](../../E-mecanicas/E0-catalogo.md)). `ledger` es la principal y aporta la fila: objetos iguales se cuentan juntos, y un cajón cerrado es una fila más. `balance` aporta el peso: es lo único que informa sobre el contenido sin abrirlo. `chest_key` aporta el lugar: la caja es una hoja del árbol del nodo 9. Se encuentran en un gesto, el arrastre que deja un objeto en una fila. Gestos: `drag` y `tap`.

1. Un libro de cuentas con dos filas vacías, manzanas sueltas y cajones cerrados con marca.
2. Demostración: una mano fantasma arrastra las manzanas de a una a la primera fila, que muestra su cuenta, y los cajones a la segunda, que muestra la suya. Intenta meter un cajón en la fila de las manzanas y la fila lo devuelve con un rebote suave.
3. El jugador ordena. Una fila solo acepta objetos con la misma forma y la misma marca. No hay cartel: la fila que no corresponde devuelve el objeto.
4. La balanza aparece al costado, sin ningún signo entre los platos. El jugador pone cajones de un lado y manzanas del otro hasta que la barra queda derecha, y así sabe cuánto pesa un cajón sin haberlo abierto. La barra es un instrumento, todavía no una afirmación.
5. Marcas distintas: llega un cajón con otra marca. Abrir fila nueva es la única jugada que el libro acepta, y el peso de esa marca se mide aparte.
6. Árbol: aparece el árbol de cofres del nodo 9 con una hoja vacía y late. El jugador arrastra el cajón a esa hoja. El árbol queda completo aunque nadie sepa el valor de la hoja.
7. Abrir: un solo nivel permite abrir un cajón, al final, para comprobar que adentro había lo que la balanza decía. Se abre una vez y se vuelve a cerrar.

Cuando el jugador se equivoca no pasa nada malo: la fila devuelve el objeto, la barra queda torcida, la hoja del árbol sigue latiendo. El estado se conserva y la jugada se puede repetir.

## 7. Representación visual

Capa `visual`, primitiva `partition` de [H](../../H-progresion-abstraccion.md).

El libro se estiliza: cada fila es una barra segmentada, un segmento por objeto, y el conteo aparece al final de la barra. El cajón se aplana en un segmento del mismo alto que los demás pero con el borde punteado, la marca de longitud desconocida. Se desplaza lo que cambia de fila; se conserva la cantidad total de segmentos cuando el jugador reagrupa, que es el invariante `count_preserved_under_regrouping` de la mecánica.

La balanza aparece en su forma reducida, dos columnas y una barra, y se apaga apenas la medición termina. No hay ningún signo entre las columnas.

Todavía no hay letras, ni coeficientes, ni igualdad escrita. La caja tiene marca dibujada, no nombre.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto ([O](../../O-arquitectura-tecnica.md) conserva los ids).

1. **Cajón → barra punteada.** Al pasar a `visual`, el cajón se aplana como los demás objetos, pero su borde queda punteado y su longitud no se fija. Las manzanas se aplanan en segmentos completos.
2. **Fila → conteo.** Al completar una fila, el dibujo de los objetos se atenúa y el número queda adelante: `3 🍎`. Es el paso `tally` de la mecánica.
3. **Marca → letra.** Cuando el jugador mide por primera vez un cajón con la balanza y la barra queda derecha, la marca pintada en la tapa se despega, gira y se contrae en `x`. La barra punteada se contrae con ella. El cajón no desaparece: se convierte.
4. **Fila de cajas → coeficiente.** Al juntar tres cajas iguales en una fila, las tres barras se funden en una y el conteo pasa adelante: `x + x + x` se contrae en `3x`. El `3` hereda la identidad del conteo de la fila, no de un signo de multiplicar que nunca hubo.
5. **Segunda marca → segunda letra.** El cajón con la otra marca repite el paso 3 y queda `y`. El libro conserva las dos filas, y arrastrar una fila sobre la otra sigue rebotando, ahora con letras.

## 9. Notación matemática

Nace `x`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), el problema que lo hace necesario es concreto: cuando hay tres marcas distintas en el mostrador, señalar con el dedo "esta caja" deja de alcanzar, y describirla con una frase es más largo que el cálculo. La letra es el nombre corto de la cantidad, y sale de la marca que el cajón ya tenía pintada.

Con `x` llega una convención de escritura, no un símbolo nuevo: el coeficiente. `3x` se escribe sin signo entre el número y la letra porque el número cuenta filas, y contar no es una operación que se anote. Que además se pueda leer como un producto es un descubrimiento posterior, de `prealg.expr.implicit_grouping`; acá se juega solo como conteo, y las dos entradas de cheatsheet del nodo separan las dos ideas.

No aparece `=`. La balanza se usó para medir y se apagó sin dejar signo; el signo lo hace nacer el nodo 11, cuando el problema deja de ser medir y pasa a ser conservar.

## 10. Definición formal

Capa `formal`: texto corto con voz y el libro de cuentas al lado. Tres frases, de a una: "Una incógnita es una cantidad que no conocemos y que no cambia mientras dure el problema." "Una letra es su nombre." "Dos letras iguales nombran la misma cantidad; dos letras distintas pueden nombrar la misma o no."

Condiciones y casos especiales, verificados sobre el objeto: una caja vacía también es una cantidad, y su letra vale cero sin dejar de ser una caja; una caja puede aparecer varias veces en la misma expresión y todas valen lo mismo a la vez; una caja puede ocupar cualquier hoja del árbol, incluso una que esté adentro de otro cofre.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "incógnita" y el caso de las dos letras que podrían coincidir, que el jugador nunca tuvo motivo para pensar.

## 11. Propiedades

- **Misma marca, mismo contenido.** Todas las cajas con la misma marca valen lo mismo, en la misma expresión y al mismo tiempo. Ligada a la balanza: cambiar un cajón por otro con la misma marca no mueve la barra.
- **Las cajas se cuentan como objetos.** `x + x + x = 3x`, y `2x + 3x` da `5x`. Ligada a juntar dos filas de la misma marca en una sola sin que el libro rebote.
- **Una caja y una manzana no se juntan.** `x + 3` queda así. Ligada al rebote de la fila que no corresponde, que el jugador sintió antes de que hubiera letras.
- **La caja se mueve sin abrirse.** Una expresión con caja se reordena, se mete en un árbol y se copia, y sigue siendo la misma expresión. Ligada a arrastrar el cajón a la hoja del árbol sin tocar la tapa.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un libro de cuentas con fichas y una caja cerrada. El guía pregunta por voz cuál cantidad no se ve y el jugador toca la caja. Los distractores son filas de objetos visibles.
- `explain`: dos animaciones sobre el mismo libro. En una, dos cajas iguales y tres cajas iguales se juntan en cinco cajas y el conteo pasa adelante. En la otra, las marcas se despegan, se pegan entre sí y se multiplican como si fueran nombres. El jugador toca la que trata la letra como etiqueta. No hay texto: se elige entre animaciones.
- `manipulate`: el jugador pone en la balanza tantas cajas como indica el coeficiente y ajusta fichas del otro plato hasta que la barra queda derecha.
- `apply`: una caja aparece como hoja de un árbol de cofres. El jugador arrastra la caja al lugar del árbol donde está la cantidad desconocida, leyendo la estructura del nodo 9.
- `generalize`: la caja se convierte en una letra sobre el libro de cuentas y siguen llegando cajas con marcas distintas. El jugador cuenta cajas iguales con letras distintas sin mezclarlas, ya sin dibujos.
- `transfer`: en la máquina de tuberías de `alg.fn.function_as_machine`, el jugador toca la entrada que la máquina todavía no conoce, marcada con una letra.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`variable_as_label`** (`replay_on_mechanic` sobre el `ledger`, que es la mecánica principal del nodo). El jugador junta la fila de `x` con la fila de `y` y trata las letras como etiquetas pegables: de `2x + 3y` sale `5xy`. El juego congela y repite el gesto en cámara lenta sobre el libro: la fila de cajas con marca A y la fila con marca B se acercan, y en el momento del contacto las cajas vuelven a mostrar su dibujo y se ve que no son iguales. Las dos filas se separan solas y quedan con sus conteos. Voz: "Estas cajas no tienen la misma marca. ¿Cuántas hay de cada una?". La interacción se reabre desde el estado real, con las dos filas separadas y el jugador contando.

## 13. Generalización

La analogía se retira en `symbolic`, apenas la marca se convierte en letra. El cajón puede pedirse como fantasma tocando la letra, y ese fantasma se desvanece al soltar, pero no vuelve a la pantalla por su cuenta. La caja representa un nombre, y lo que representa un nombre cede su lugar al nombre.

Variantes sin ayuda visual, en orden: más de dos marcas en el mismo libro; letras que no son `x` ni `y`; una caja repetida en dos filas distintas de la misma expresión; una caja que resulta valer cero sin dejar de ser caja; una caja adentro de un cofre anidado, donde la letra queda entre paréntesis.

Al final el jugador recibe libros con objetos que no son cajas ni frutas: figuras de colores, sonidos, marcas inventadas. Lo que se evalúa es que agrupe por identidad y no por parecido, y que nombre con una letra cualquier cantidad repetida.

El nodo está en `abstract` cuando el jugador cuenta y reagrupa expresiones con varias letras sin pedir el libro dibujado, y cuando acepta que dos letras distintas podrían valer lo mismo sin que eso rompa nada.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otras áreas y con mecánicas que no se usaron para aprender:

- `alg.fn.function_as_machine` (`machine_pipe`): la caja deja de ser el contenido y pasa a ser la boca de la máquina. La letra nombra lo que todavía no entró.
- `alg.expr.distributive_tiles` (`tiles`): un rectángulo con un lado de longitud desconocida. La caja es un lado, y el área se escribe sin medirlo.
- `prob.rv.random_variable_as_machine` (`machine_pipe`): una caja cuyo contenido no es fijo sino sorteado. Es el punto exacto donde `box_with_changing_contents` deja de ser una ruptura y pasa a ser el tema.
- `linalg.map.inverse_and_systems` (`grid_stretch`): la entrada desconocida de una deformación, una caja con dos números adentro.

Concepto siguiente: `prealg.eq.balance` ([11](11-prealg.eq.balance.md)). Frase puente, narrada sobre la balanza que el jugador usó para medir: "Ya sabés poner la caja en el libro sin abrirla. Para saber cuánto tiene adentro la pusiste en un plato. ¿Qué está diciendo la barra cuando queda derecha?". La balanza vuelve a encenderse y no se apaga: el nodo 11 empieza ahí.

---

**Visualización:** dos escenas del YAML, nativas y sin texto rasterizado, resueltas en [I](../../I-manim/I0-mapping.md). `ledger_box_hides_tokens` corre sobre el libro del jugador: una fila de fichas visibles, una caja que se cierra sobre parte de ellas y el conteo total que sigue en pantalla aunque parte del conteo ya no se vea; gramática `partition`, con el total conservado como elemento resaltado. Genera también las animaciones de `explain`. `chest_box_as_tree_leaf` toma la expresión del nodo 9 y hace crecer la caja en una hoja del árbol, con el resto del árbol intacto; gramática `partition` sobre estructura `compose`. Las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_variable` ([M](../../M-calculadora/M0-progresion.md)), una tecla con el dibujo del cajón cerrado que, la primera vez que se toca, se transforma en `x` delante del jugador y ya queda así. Es una operación estructural: no calcula, agrega un nombre a la expresión que se está armando. Funciona en el modo de exploración libre, donde el jugador puede escribir expresiones con letras y ver que la calculadora no devuelve un número sino la misma expresión ordenada.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Las marcas de las cajas son dibujos, la letra llega como morph de ese dibujo, las filas se ordenan por forma y color, `explain` se responde eligiendo entre dos animaciones y los prompts son de voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra directamente en el libro con letras y usa el teclado de fichas; para él, el nodo dura lo que dura confirmar que `2x + 3y` no es `5xy`.
