# 06 — Dividir deshace el estirado (`arith.div.undo_mul`)

> Locale `es`: "Dividir deshace el estirado". Minijuego: [La llave que encoge](../../F-minijuegos/arith.div.undo_mul.md).

**Nodo:** `arith.div.undo_mul` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundarias `tiles`, `grid_stretch`) · **Literacy:** `none` · **Analogía:** `rubber_band_stretch` (con `tile_floor` para el piso)

## 1. Concepto

Dividir no es una operación nueva: es la llave del estirado. Si alguien estiró una banda y no viste cuánto, dividir es encontrar el factor que la devuelve a su largo original; si una pared tapa un lado de un piso de baldosas, dividir es leer ese lado sin desarmarlo. Al terminar, el jugador elige la llave que deshace un estirado, la calibra hasta que las marcas coinciden, parte un rectángulo en filas iguales y reconoce que el estirado por cero es la única cerradura sin llave. Antes sabía estirar; no sabía volver.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): la banda con marcas y el clavo que no se mueve, el rectángulo con sus dos llaves de longitud, el símbolo `×`, y la propiedad de que estirar por 0 aplasta todas las marcas contra el clavo. Esa propiedad se vuelve acá un cofre sin llave.
- `arith.sub.undo_add` (nodo 4): la cerradura con forma, el llavero, el diagrama vertical y la experiencia de que la llave equivocada se traba.

Ninguna arista sigue el orden escolar, donde la división es un reparto con algoritmo propio, desconectada del producto. [C0](../../C-knowledge-graph/C0-esquema.md) la cuelga del nodo 5 a propósito: el jugador no aprende a dividir, aprende a deshacer algo que ya sabe hacer. El reparto en platos vive en `arith.div.remainder`.

## 3. Dificultad cognitiva real

Lo difícil no es la tabla al revés. Son cuatro capacidades:

1. **Ver la división como la vuelta de una acción.** La pregunta no es "cuál es la cuenta" sino "qué le hicieron a esto y cómo lo devuelvo".
2. **Aceptar que dos preguntas distintas dan el mismo número.** Cuántas veces entra 3 en 15, y cuánto le toca a cada uno al repartir 15 en 3, se contestan con el mismo piso leído en dos direcciones.
3. **Calibrar el factor, no solo reconocer la forma.** En el nodo 4 alcanzaba con elegir la llave. Acá la llave tiene dial: una sola de las infinitas llaves de encoger devuelve la banda al clavo original.
4. **Entender por qué el cero no tiene vuelta.** Estirar por 0 borra cuál marca era cuál. Es la primera acción irreversible de la espina.

Se suma un borde que el nodo abre y no cierra: cuando el rectángulo no se parte en filas iguales, sobran baldosas y no hay manera de escribirlo. Ese hueco es `arith.div.remainder`.

## 4. Problema intuitivo

Un puesto de feria de bandas elásticas marcadas. Alguien devuelve una banda que quedó estirada y hay que dejarla como estaba, pero nadie vio cuánto se estiró. Al lado hay una banda nueva, para comparar.

En `real` el jugador solo mira: el vendedor la suelta hasta que las marcas coinciden con las de la nueva. En `intuition` la escena se detiene con la banda estirada y hay tres desenlaces dibujados: la suelta hasta que las marcas coinciden; le corta un pedazo del extremo y el largo queda bien con las marcas separadas; la suelta de más. El jugador elige y después ve. El segundo separa encoger de recortar y es el distractor de `explain`. La variante de piso es un patio embaldosado contra una pared: se ven un lado y el total, y el jugador señala cuántas filas hay detrás.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por cara del concepto ([G0](../../G-analogias/G0-reglas.md)).

`rubber_band_stretch` (mecánica `grid_stretch`) es la del YAML y viene del nodo 5. Mapa: banda marcada → recta numérica; marca → número; estirar k veces → multiplicar por k; **dejar que la banda se encoja → dividir por k**; extremo clavado → el cero; estirar menos que el original → multiplicar por una fracción. La entrada que en el nodo 5 estaba dormida es la que este despierta. Invariante: las marcas se juntan en la misma proporción y el clavo queda quieto. Ruptura: `negative_scaling_flips`, porque una banda física no se da vuelta.

`tile_floor` (mecánica `tiles`) aporta la otra cara. Mapa: fila → primer factor; columna → segundo factor; piso entero → producto; **lado tapado por una pared → división**; partir en filas iguales → repartir; baldosas que sobran → resto. Invariante: ninguna baldosa desaparece al partir. Ruptura: `non_integer_sides`, que es lo que el nodo 8 necesita.

La banda hace visible que dividir es volver; el piso, que dividir es partir. Con la banda sola no se ve el sobrante; con el piso solo no se ve que el factor sea una razón. `sharing_into_plates` está declarada en G apuntando a este nodo, pero su mecánica es `sorter`, que el nodo no declara: se deja entera para `arith.div.remainder`.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Tres mecánicas ([E0](../../E-mecanicas/E0-catalogo.md)). `chest_key` es la principal y aporta la estructura de acción e inversa; `grid_stretch` aporta la banda, donde la vuelta se siente; `tiles` aporta el piso, donde la vuelta se corta. Gestos: `drag`, `tap` y `pinch`.

1. Banda estirada y clavada, con una testigo debajo. Encima, un cofre cuya cerradura tiene la forma del estirado. Abajo, un llavero con llaves de encoger y de recortar.
2. Demostración: una mano fantasma apoya la llave de encoger y gira hasta que la marca seguida cae sobre la de la testigo. El cofre se abre. Repite una vez y desaparece.
3. El jugador arrastra una llave y la gira con el mismo dedo. Si suelta antes de tiempo, la banda se queda donde está y el estado no se borra.
4. Llave de recortar: corta el extremo y la banda queda del largo correcto con las marcas mal. El cofre no cede. Nada se llama incorrecto: la testigo al lado es el mensaje.
5. Piso: el jugador lo parte en filas con el dedo. Si quedan iguales, el corte chasquea y aparece la ficha del lado que faltaba. Si no, las baldosas de la última fila se despegan y quedan sueltas al costado, brillando.
6. Verificación: tocar la ficha del resultado vuelve a estirar la banda, o vuelve a fundir las filas. Lo que queda tiene que ser lo de antes.
7. Cofre sin llave: en un nivel la banda está aplastada contra el clavo. Ninguna llave gira, el llavero late y se cierra solo.

## 7. Representación visual

Capa `visual`, primitiva `invert` de [H](../../H-progresion-abstraccion.md), con `scale` heredada del nodo 5 y `partition` de apoyo.

La banda se estiliza en un segmento con marcas y un punto grueso en el clavo, y aparece el diagrama vertical: arriba la banda original, una flecha hacia abajo con la forma del estirado, abajo la estirada. La llave es la misma flecha reproducida hacia arriba. Se escalan las distancias al clavo; se conservan el orden de las marcas y la posición del clavo, y se ilumina en los dos estados la marca que el jugador eligió seguir.

El piso se estiliza en un rectángulo sobre grilla tenue con una llave de longitud llena y una hueca. Partirlo dibuja líneas punteadas que se vuelven llenas cuando las filas son iguales; las sobrantes quedan fuera del rectángulo. Todavía no hay igual, ni fracciones, ni factores negativos, ni manera de escribir lo que sobra.

## 8. Transición a símbolos

Cuatro morphs del mismo objeto, cada uno disparado por un gesto.

1. **Cerradura → ficha del estirado.** Al abrir el cofre por primera vez en `visual`, la cerradura se despega de la tapa y se contrae en `× 3`, flotando sobre la flecha que baja.
2. **Llave → ficha de la vuelta.** En el mismo gesto, la llave sube por el costado y su etiqueta se forma delante del jugador: la cruz de `×` gira un cuarto de vuelta hasta quedar acostada como una barra y las cuatro puntas del aspa se juntan de a dos en un punto arriba y otro abajo. Queda `÷ 3`. El símbolo nuevo nace deformando al viejo.
3. **Banda estirada → dos números y una ficha.** Al soltar la llave, el tramo estirado se contrae en el numeral del total y el original en el del resultado. Queda `15 ÷ 3` sobre el contorno.
4. **Piso partido → el mismo `÷`.** La llave hueca se rellena con la ficha del resultado y las dos llaves se acercan con la misma barra de dos puntos entre ellas. Las baldosas sobrantes quedan afuera de la expresión, sin nada que las nombre.

## 9. Notación matemática

Queda `15 ÷ 3` junto al contorno de la banda o del piso, con la ficha del resultado apoyada sobre el objeto, como en el nodo 5.

El símbolo nuevo es `÷`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), llega con el problema que lo hizo necesario: el jugador tiene que pedir al depósito, que está fuera de la pantalla, una banda del largo correcto, y con `15` y `3` no alcanza, porque `15 × 3` y `15 ÷ 3` piden bandas distintas. La barra con dos puntos dice cuál. Que se parezca a la cruz acostada es intencional: es la misma acción vista al revés.

No aparece ningún otro símbolo. No hay igual, porque nace en `prealg.eq.balance`. Y no hay símbolo para lo que sobra: el jugador ve las baldosas sueltas y no puede anotarlas. Ese es el encargo de `arith.div.remainder`, y por eso el sobrante se deja a la vista y sin nombre.

## 10. Definición formal

Capa `formal`, texto corto con voz y la banda al lado ([Q](../../Q-edad-universal.md)). Tres frases, de a una, verificables sobre el objeto. Dividir un número por otro es encontrar el factor que estira el segundo hasta el primero. Dividir también es partir en partes iguales, y el resultado es lo que mide cada parte. Dividir deshace multiplicar.

Condiciones: dividir por 1 deja la banda igual; un número dividido por sí mismo devuelve una marca; dividir por 0 no tiene solución, porque el estirado por 0 aplastó las marcas; `0 ÷ 0` tampoco, porque cualquier factor sirve y una cerradura que abre con todas las llaves no distingue ninguna; cuando el piso no se parte en filas iguales, la división no termina. Ya jugado: las tres frases enteras. Nuevo: la palabra "divisor" y el caso `0 ÷ 0`.

## 11. Propiedades

- **Dividir deshace multiplicar y viceversa.** Ligada al giro de la llave que devuelve las marcas a la testigo, en cualquiera de los dos órdenes.
- **Dividir por 1 no cambia nada.** Ligada a la llave que se apoya y no hace falta girar. Es la mitad de `cs.arith.div_undoes_mul`.
- **El estirado por 0 no tiene llave.** Ligada a la banda aplastada y al llavero que se cierra solo. Es `cs.arith.div_by_zero_no_key`.
- **Un mismo piso da dos divisiones.** El rectángulo de 15 con lado 3 leído en filas da 5 y en columnas da 3. Ligada al toque sostenido que gira el piso.
- **No siempre se puede partir en partes iguales.** Ligada a las baldosas que se despegan. Es la semilla de `arith.div.remainder` y del nodo 8.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md), todas sin leer:

- `recognize`: una banda estirada tres veces y cuatro llaves de encoger con distinto dial. Tocar la que la devuelve a su largo original. Distractores: factor vecino, llave de recortar, llave de estirar.
- `explain`: dos animaciones sobre la misma banda. En una se encoge y las marcas vuelven a coincidir con la testigo; en la otra se recorta el extremo y el largo coincide pero las marcas no. Tocar la que no es la llave del estirado. Para `literacy: none` este es el formato de todo `explain`: elegir entre animaciones, nunca entre frases.
- `manipulate`: arrastrar la llave de encoger y girar hasta que las marcas coincidan; después partir el rectángulo en filas iguales.
- `apply`: un rectángulo con un lado tapado. Tocar la ficha del lado que falta sin desarmarlo, contra el tiempo objetivo del nodo.
- `generalize`: aparece el estirado por cero. El jugador arrastra la ficha de cofre sin llave al llavero vacío en vez de elegir una llave.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, aplicar la deformación que devuelve la grilla a la cuadrícula original.

El YAML declara `misconceptions: []`, y no es un olvido: los errores de acá tienen dueño en otros nodos. Los que el diseño prevé corren sobre patrones prestados y no clasifican ni bloquean `ready` ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **Recortar en vez de encoger.** El juego ejecuta el corte y superpone la testigo con las marcas iluminadas de a pares, dibujando los huecos. Voz: "El largo quedó bien. ¿Y las marcas del medio?".
- **Dividir al revés.** El jugador encoge por el total y la banda se aplasta contra el clavo. Corre como `key_mismatch`: la llave se traba en el último cuarto de vuelta y aparece la silueta hueca de la que sí entra. Voz: "Esa llave encoge mucho más de lo que se estiró. ¿Cuánto se estiró?".
- **Sumar el sobrante al resultado.** El juego mete las baldosas sueltas donde el jugador dijo, esa fila queda más larga y el borde se rompe. Corre como `missing_piece_tiles`. Voz: "Esa fila quedó más larga. ¿Todas las filas tienen que medir lo mismo?".

## 13. Generalización

La analogía se retira en `symbolic`. El piso se va primero, en cuanto el jugador lee el lado tapado sin cortar nada. La banda se queda a demanda, porque es la única que soporta el factor de vuelta menor que 1 y porque el nodo 8 la necesita entera.

Variantes sin ayuda visual, en orden: divisores mayores que la grilla; división por 1 y de un número por sí mismo; divisiones que no dan exactas; el mismo producto pedido en sus dos divisiones. Después, vueltas arbitrarias: cofres con cerraduras no aritméticas pero con parámetro y con vuelta, como "girar la figura hasta que el punto rojo quede arriba". El jugador elige la clase de llave y la calibra, sin números.

El nodo está en `abstract` cuando anticipa el factor de vuelta sin ejecutarlo, lee el lado tapado en los dos sentidos, distingue el cofre sin llave del cofre difícil y resuelve la vuelta arbitraria.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprenderlo:

- `linalg.map.inverse_and_systems` (`grid_stretch` en dos dimensiones): la sábana fue deformada y hay que devolverla a la cuadrícula. La llave de encoger se vuelve una matriz, y el cofre sin llave, la deformación que aplasta el plano en una recta.
- `geom.sim.similarity_as_scale` (`construct`): dividir un lado por el correspondiente da la razón de semejanza entre dos figuras.
- `prob.basic.probability_as_proportion` (`urn_dice`): el piso con un lado tapado se vuelve una urna, y lo que se lee es la parte.

Concepto siguiente: `arith.int.negatives` ([07](07-arith.int.negatives.md)). Frase puente, narrada sobre la banda que acaba de volver: "La banda volvió y el clavo no se movió ni un poco. ¿Y si el caminante que vive en la banda sigue caminando hacia atrás después de pisar el clavo?". El clavo se agranda hasta ser una casilla de la pista, aparece el caminante mirando hacia la izquierda, y el nodo 7 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), ambas nativas. `chest_shrink_key_undoes_stretch` es la mecánica renderizada sobre el estado del jugador: la banda que se encoge mientras la llave gira, el clavo quieto y la marca seguida iluminada en el antes y el después; gramática `invert`, parametrizada por el factor y el largo, produce las dos animaciones de `explain` y los distractores de `recognize`. `tile_split_rectangle_into_rows` es el piso que se parte, parametrizada por el total y las filas, y produce los ítems de `apply`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsan `grid_stretch_by_factor` y `tile_rows_become_rectangle` del nodo 5.

**Calculadora:** en `ready` se habilita `op_div` ([M](../../M-calculadora/M0-progresion.md)), en el hueco apagado que el nodo 5 dejó junto a `op_mul`. Al tocarla sobre dos fichas dibuja el rectángulo, lo parte en filas con la animación de la mecánica y deja la ficha del lado que faltaba. Apretada, muestra la banda encogiéndose. Sobre un divisor cero se traba con el cuarto de vuelta de la llave equivocada. Si el nodo decae, muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la instrucción es la mano fantasma que gira la llave, los targets son del tamaño de un token, `explain` se resuelve entre animaciones y la voz solo presenta la situación. Con el sonido apagado no falta nada: el chasquido del corte tiene su equivalente en la línea que se vuelve llena. Un adulto llega por diagnóstico, saltea `real` e `intuition` y usa el teclado de fichas.
