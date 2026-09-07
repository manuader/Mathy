# 15 — Repartir el producto en baldosas (`alg.expr.distributive_tiles`)

> Locale `es`: "Repartir el producto en baldosas". Minijuego: [Dos habitaciones](../../F-minijuegos/alg.expr.distributive_tiles.md).

**Nodo:** `alg.expr.distributive_tiles` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `scale` · **Mecánica principal:** `tiles` (secundaria `ledger`) · **Literacy:** `icons` · **Analogía:** `tile_floor_two_rooms`

## 1. Concepto

Multiplicar por una suma es multiplicar por cada sumando y juntar los resultados: `a(b + c) = ab + ac`. Al terminar, el jugador expande un producto y también lo recompone desde la suma, con números y con letras, y sabe que la igualdad no es una regla que le enseñaron sino la misma superficie contada de dos maneras. Antes sabía multiplicar un número por otro; ahora multiplica un número por algo que todavía no conoce.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): multiplicar como estirar. Se usa el rectángulo como producto de dos lados, la banda elástica que escala una longitud y la idea de que el factor común es un ancho. De ahí viene también la baldosa como unidad de área.
- `prealg.var.unknown_as_box` (nodo 10): la letra nombra una caja cuyo contenido no se sabe. Se usa la caja como longitud desconocida, la convención de que dos cajas con la misma marca miden lo mismo y la misconception `variable_as_label`, que acá vuelve a aparecer con dos letras distintas.

Ninguna arista es la del orden escolar, donde la propiedad distributiva se enuncia en aritmética y se repite en álgebra como si fuera otra cosa. [C0](../../C-knowledge-graph/C0-esquema.md) la pone una sola vez, con una letra adentro desde el principio, porque el caso `3(4 + 5)` se resuelve calculando y no obliga a ver la estructura.

## 3. Dificultad cognitiva real

Lo difícil no es "aplicar la distributiva" sino tres capacidades:

1. **Ver un producto como área y no como cuenta.** Mientras `5 × 7` sea "una cuenta que da 35", `5(x + 2)` no tiene sentido: no hay cuenta posible. Hay que aceptar que un producto es una superficie que existe aunque no se pueda medir.
2. **Reconocer el factor común como un lado compartido.** El `a` de `a(b + c)` es un ancho que cubre las dos habitaciones. Quien lo ve como "el número de afuera" reparte mal en cuanto cambia la forma del paréntesis. Falla en `distribute_over_wrong_op`.
3. **Sumar cantidades del mismo tipo y solo del mismo tipo.** `2x + 3` no se junta, `2x + 3x` sí. La baldosa cuadrada y la tira de largo `x` son piezas distintas y no se apilan. Falla en `variable_as_label`.

La cuarta, que este nodo prepara sin cerrar, es la recomposición: mirar `ab + ac` y ver el ancho compartido. Se juega acá y se completa en `alg.expr.factor_common`.

## 4. Problema intuitivo

Un departamento visto desde arriba, con dos habitaciones separadas por una pared. Las dos tienen el mismo ancho; una es más larga que la otra. Un albañil está por comprar baldosas y no sabe cuántas pedir.

En `intuition` la escena se detiene con la pared todavía puesta. Dos desenlaces dibujados: el albañil mide cada habitación, cuenta las baldosas de cada una y suma; el albañil saca la pared, mide el piso entero de una vez y multiplica. El jugador elige cuál da más baldosas y después ve que dan lo mismo. La pared no ocupaba lugar.

## 5. Analogía del mundo real

`tile_floor_two_rooms`, con la mecánica `tiles` ([G0](../../G-analogias/G0-reglas.md)). Mapa: ancho compartido → factor común; los dos largos → sumandos del paréntesis; pared entre las habitaciones → paréntesis; piso entero → producto; sacar la pared → distribuir; volver a poner la pared → factorizar; habitación de largo desconocido → baldosa variable.

Invariante: el área total no cambia cuando se saca o se pone la pared. La pared es una marca, no un volumen.

Ruptura: `negative_lengths`. Una habitación no puede medir menos que nada, así que `5(x − 2)` fuerza la imagen. Se resuelve dentro del nodo con una convención visible: la baldosa de resta se dibuja como un hueco recortado sobre el piso, del mismo tamaño y de color invertido, y la resta se lee como quitar superficie. Es explícitamente una prótesis, y por eso las baldosas se retiran en `symbolic`, antes de que aparezcan expresiones donde todo es negativo.

La analogía secundaria es el libro de cuentas de `ledger`, que aporta el conteo por tipo: cada clase de baldosa tiene su columna, y el total se lee como una fila de coeficientes. Las baldosas dicen por qué la igualdad es cierta; el libro dice cómo se escribe el resultado.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Mecánica principal `tiles`, con `ledger` como registro ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `pinch`.

1. Un marco rectangular vacío con la pared dibujada adentro, la bandeja de baldosas abajo y el libro de cuentas a la derecha con dos columnas vacías.
2. Demostración: una mano fantasma arrastra baldosas hasta llenar la habitación izquierda, la columna izquierda del libro cuenta sola, después llena la derecha y la segunda columna cuenta. La pared se desvanece y las dos columnas se juntan en una sola fila.
3. El jugador arrastra baldosas. Si una no entra, no encaja: se resiste en el borde y vuelve a la bandeja. Un pellizco escala una tira de largo `x` para probar cuánto mide, y el marco entero se ajusta para que siga cerrando.
4. Tocar la pared la saca o la pone. El piso no cambia de tamaño, y el libro pasa de dos columnas a una fila y vuelve, con las mismas piezas.
5. Cuando el marco queda cubierto sin huecos ni superposiciones, los lados se etiquetan solos y aparece la ficha del producto al lado de la ficha de la suma, unidas por un igual.
6. Éxito: las dos escrituras coexisten y el jugador puede tocar cualquiera para verla dibujada. Verificación con `cs.alg.area_model_of_product`.

Cuando el jugador deja un hueco, el hueco parpadea y el marco no cierra. Cuando superpone dos piezas, la de arriba se vuelve translúcida y la superficie contada excede al marco. Nada se llama incorrecto: el piso se ve mal cubierto y eso alcanza.

## 7. Representación visual

Capa `visual`, con `scale` como primitiva dominante ([H](../../H-progresion-abstraccion.md)).

Las baldosas sueltas se funden en un rectángulo continuo con una grilla tenue encima. Los lados se marcan con llaves: una llave abarca el ancho, dos llaves consecutivas abarcan los dos largos. La habitación de largo desconocido se dibuja con un lado que no termina en un número sino en una caja.

Se escala el rectángulo cuando el jugador estira un lado, y las dos partes crecen juntas porque comparten el ancho; se desplaza la pared, que corre a lo largo del lado sin cambiar el área; se conserva la superficie total en cada movimiento, y eso se muestra con un contador que no se mueve. Al costado, el libro de cuentas dibuja una barra por columna, proporcional a la cantidad de baldosas de cada tipo.

Todavía no hay signo de multiplicación entre el ancho y el paréntesis: la multiplicación es la adyacencia de dos lados.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Lados → fichas.** Al cerrar el marco por primera vez en `visual`, las llaves de los lados se contraen: el ancho en una ficha, cada largo en la suya. La caja de largo desconocido se contrae en `x`, como en el nodo 10.
2. **Pared → paréntesis.** Al tocar la pared, esta se afina, se dobla por arriba y por abajo y queda como los dos arcos que ya nacieron en el nodo 14. El lado compuesto se lee `(x + 2)`.
3. **Adyacencia → producto escrito.** El rectángulo se contrae hasta la altura de un renglón y los dos lados quedan pegados: `5(x + 2)`. La yuxtaposición es la multiplicación, y la ficha conserva el id del rectángulo.
4. **Baldosas parciales → sumandos.** Al sacar la pared, el rectángulo se parte en dos bloques que se separan un poco y cada uno se contrae en su ficha: `5x` y `10`, con un `+` que hereda el id de la pared. La igualdad entre las dos escrituras aparece con un morph, no con un reemplazo.
5. **Columnas → coeficientes.** El libro de cuentas colapsa: cada columna se contrae en el número que la contaba y la marca de la columna queda pegada como letra. `x x x` se vuelve `3x`.

## 9. Notación matemática

Queda `a(b + c) = ab + ac`, y con números y letras `5(x + 2) = 5x + 10`.

El nodo no introduce símbolos nuevos con forma propia: el paréntesis nació en el nodo 14 y la letra en el 10. Lo que aporta es una **convención de escritura**, la yuxtaposición como producto: `5x` significa `5 · x`, y `5(x + 2)` significa `5 · (x + 2)`. El problema que la hace necesaria es el propio renglón. Con el signo de multiplicar escrito, `5 · x + 5 · 2` tiene tantos símbolos que la estructura se pierde; sin él, los dos sumandos se leen de un vistazo y el paréntesis queda como el único agrupador. Es la regla de oro de [H](../../H-progresion-abstraccion.md) aplicada a una convención: se adopta cuando escribirla completa estorba.

La segunda convención es el orden dentro del término, número antes que letra, y se justifica igual: hace que dos términos del mismo tipo se reconozcan como iguales de un vistazo en el libro de cuentas.

## 10. Definición formal

Capa `formal`: texto corto con voz y el rectángulo partido al lado. Dos frases, de a una: "Multiplicar por una suma es multiplicar por cada sumando y sumar los resultados." "La igualdad vale en los dos sentidos: repartir el producto y volver a juntarlo."

Condiciones y casos especiales, verificados sobre el objeto: vale para cualquier cantidad de sumandos, y el rectángulo se parte en tantas franjas como haga falta; vale con restas, y el hueco recortado lo muestra; no vale sobre un producto, porque `a(bc)` es un solo bloque y no hay pared que sacar; y no vale al elevar al cuadrado, que es el caso siguiente. Con `a = 0` el piso desaparece entero y la igualdad se cumple trivialmente.

Ya jugado: las dos frases enteras, en la capa concreta, con la pared que sale y entra. Nuevo: el nombre "propiedad distributiva" y el enunciado con letras para cualquier cantidad de sumandos.

## 11. Propiedades

- **Distributiva de la multiplicación sobre la suma.** `a(b + c) = ab + ac`. Ligada a sacar la pared sin que cambie el contador de superficie.
- **Distributiva sobre la resta.** `a(b − c) = ab − ac`. Ligada al hueco recortado que se quita dos veces, una en el piso entero y otra en la franja.
- **Factorización como el mismo movimiento al revés.** `ab + ac = a(b + c)` cuando las dos partes comparten un lado. Ligada a volver a poner la pared, y solo posible si los dos bloques tienen el mismo ancho.
- **Solo se suman piezas del mismo tipo.** `2x + 3x = 5x`, pero `2x + 3` no se junta. Ligada a las columnas del libro, que no se funden si las marcas difieren.
- **El cuadrado de una suma tiene cuatro piezas.** `(a + b)²` es un cuadrado de lado `a + b` partido en un cuadrado `a·a`, otro `b·b` y dos rectángulos `a·b`. Ligada al marco donde faltan dos piezas, y es la propiedad que `alg.expr.binomial_product` retoma entera.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos habitaciones con el mismo ancho y largos distintos. Tocar la expresión de fichas que mide el piso total. Los distractores salen de las reglas `detect` de las dos misconceptions del nodo.
- `explain`: tres animaciones. En una el ancho cubre las dos habitaciones y el piso queda entero; en otra se eleva al cuadrado cada habitación por separado y quedan dos rectángulos vacíos en el marco; en otra se multiplican las etiquetas como si fueran nombres y las dos columnas del libro se funden en una que no corresponde a ninguna pieza. Tocar las dos que pierden baldosas.
- `manipulate`: arrastrar baldosas para cubrir un rectángulo con un lado partido en dos, y armar la ficha de producto que lo describe.
- `apply`: un rectángulo con lados de letras y números. Arrastrar las fichas de cada baldosa parcial al libro de cuentas y sumar, contra el tiempo objetivo del nodo.
- `generalize`: sin baldosas, fichas de paréntesis y letras. Expandir y también recomponer el producto desde la suma.
- `transfer`: en el rectángulo que crece de `calc1.deriv.rules_as_structure`, tocar las dos franjas que se agregan cuando ambos lados cambian.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`distribute_over_wrong_op`** (`missing_piece_tiles` sobre `tiles`, mecánica que el nodo declara). El jugador responde `a² + b²` al área de un cuadrado de lado `a + b`, o convierte `a(bc)` en `(ab)(ac)`. El juego coloca las piezas que el jugador nombró: un cuadrado `a × a` y otro `b × b` en esquinas opuestas del marco. Quedan dos rectángulos vacíos, `a × b` cada uno, que parpadean. Voz: "Al cuadrado le falta un pedazo. ¿Qué rectángulos faltan?". Las baldosas `a × b` esperan en la bandeja, y al completar el hueco la expresión al costado pasa de `a² + b²` a `a² + 2ab + b²` con un morph. Es la de mayor severidad del nodo.
- **`variable_as_label`** (`replay_on_mechanic` sobre `ledger`, también declarada). El jugador convierte `ax + by` en `(a + b)xy`, tratando las letras como nombres que se pueden juntar. El replay corre en el libro de cuentas: las dos columnas del jugador intentan fundirse y se rechazan, porque las piezas que cuentan tienen forma distinta. Sobre el piso, la tira de largo `x` y la de largo `y` se superponen y no encajan. Voz: "Estas dos piezas no tienen la misma forma. ¿Se pueden apilar en la misma columna?". El jugador separa las columnas y sigue desde ahí.

## 13. Generalización

La analogía se retira en `symbolic`, en el momento en que aparece el primer coeficiente negativo en los dos lados de la resta y el hueco recortado deja de tener sentido físico. Las baldosas quedan como fantasma a demanda tocando el producto, hasta que el jugador deja de pedirlas. El libro de cuentas sobrevive más tiempo, porque contar por tipo sigue siendo cierto sin dibujo, y se retira recién en `formal`.

Variantes sin ayuda visual, en orden: factor común negativo (`−3(x − 4)`); paréntesis de tres sumandos; producto de dos paréntesis, que anticipa `alg.expr.binomial_product`; el cuadrado de una suma como caso de ese producto; y recomposición, donde se da `6x + 15` y hay que encontrar el ancho compartido.

El nodo está en `abstract` cuando el jugador expande y recompone sin pedir baldosas, decide en qué dirección conviene moverse según lo que quiere lograr, y rechaza con un contraejemplo propio la distribución sobre un producto o sobre un cuadrado.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `calc1.deriv.rules_as_structure` (`machine_pipe`, `tiles` y `gears_sequence`): el rectángulo `f · g` que crece por dos lados. Las dos franjas nuevas son la regla del producto, y la esquina chiquita es lo que se descarta.
- `geom.area.rect_and_triangle` (`tiles` y `construct`): la misma partición usada al revés, para calcular áreas de figuras compuestas separándolas en rectángulos con un lado común.
- `linalg.map.linear_transformation_2d` (`grid_stretch` y `machine_pipe`): la linealidad como distributiva sobre vectores. Deformar la suma de dos flechas es lo mismo que deformar cada una y sumarlas, y la grilla lo muestra sin baldosas.
- `adv.alg.polynomial_arithmetic` (`ledger` y `gears_sequence`): el producto de polinomios como el libro de cuentas con muchas columnas, donde repartir es la única operación que hay.

Concepto siguiente: `alg.sys.two_by_two` ([16](16-alg.sys.two_by_two.md)). Frase puente, narrada sobre el último piso repartido: "Ya sabés repartir un ancho entre dos largos. ¿Y si tuvieras dos pisos distintos que comparten las mismas piezas?". El rectángulo se separa en dos filas de un libro de cuentas, cada una con su total, y el nodo 16 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `tile_two_rooms_one_width` es nativa: recibe el ancho y los dos largos como árboles y dibuja el marco con la pared que sale y entra, con las llaves de los lados y el contador de superficie que no se mueve; gramática `scale`. Es la que produce las animaciones de `explain` y el patrón `missing_piece_tiles`, porque puede recibir una cobertura incompleta y hacer parpadear el hueco. `ledger_a_times_sum` es nativa y corre sincronizada al costado: las columnas del libro se llenan mientras las baldosas caen, y colapsan en coeficientes cuando el jugador cierra el marco; gramática `partition`. Ninguna lleva texto rasterizado: las etiquetas de los lados y las marcas de columna las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsan `tile_rows_become_rectangle` (nodo 5) y `ledger_box_hides_tokens` (nodo 10) como apertura y como distractor de `variable_as_label`.

**Calculadora:** en `ready` se habilita `op_expand` ([M](../../M-calculadora/M0-progresion.md)), un ícono de pared que se abre, disponible sobre cualquier producto armado con fichas donde uno de los factores sea una suma. No devuelve solo el resultado: dibuja el rectángulo partido durante un instante y después escribe la suma, para que la respuesta siga anclada al área. La operación inversa aparece más tarde con `alg.expr.factor_common`, y hasta entonces el ícono de pared solo funciona en un sentido. Si el nodo decae, la pared del ícono queda a medio abrir.

**Edad universal:** el nodo es `icons` porque los lados llevan etiquetas de un dígito y letras desde el segundo nivel ([Q](../../Q-edad-universal.md)). Lo demás se juega sin leer: baldosas por forma, pared por toque, mano fantasma, `explain` entre animaciones y prompts por voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel con letras y suele reconocer la regla de memoria; para él la aportación del nodo es el modelo de área, que se le presenta primero como verificación de algo que ya cree saber, con el caso `(a + b)²` como puerta de entrada.
