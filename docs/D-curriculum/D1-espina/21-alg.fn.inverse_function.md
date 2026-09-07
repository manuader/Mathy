# 21 — La llave se vuelve función (`alg.fn.inverse_function`)

> Locale `es`: "La máquina corriendo al revés". Minijuego: [La máquina en reversa](../../F-minijuegos/alg.fn.inverse_function.md).

**Nodo:** `alg.fn.inverse_function` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invert` · **Mecánica principal:** `machine_pipe` (secundarias `chest_key` y `slope_walker`) · **Literacy:** `icons` · **Analogía:** `machine_reverse_run`

## 1. Concepto

La llave que abría cofres deja de ser una operación suelta y se vuelve una máquina completa. Si `f` transforma la entrada en una salida, `f⁻¹` toma esa salida y devuelve la entrada, y encadenarlas deja la bola como estaba. Al terminar, el jugador construye la inversa corriendo la tubería al revés, la reconoce como la reflexión del rastro sobre la diagonal y decide si una máquina puede correrse al revés antes de intentarlo. Antes tenía llaves para operaciones; ahora tiene una llave para una máquina entera.

## 2. Prerequisitos

Los tres del YAML, y cada uno aporta una cara distinta de la misma idea, como anticipa la sección "Funciones como llaves" de [E0](../../E-mecanicas/E0-catalogo.md).

- `alg.fn.composition` (nodo [20](20-alg.fn.composition.md)): la cadena y el orden. La inversa se define encadenando: `f⁻¹` es la máquina que, puesta detrás de `f`, deja la entrada intacta. Sin cadena no hay manera de decir qué significa "deshacer".
- `prealg.inv.operation_as_key` (nodo [12](12-prealg.inv.operation_as_key.md)): la llave, el llavero, el diagrama vertical y `wrong_inverse_choice`. Es el primer regreso completo de la llave: allí era una operación de un paso, acá se vuelve un objeto del mismo tipo que aquello que abre.
- `alg.fn.graph_as_picture` (nodo [18](18-alg.fn.graph_as_picture.md)): el rastro y el par ordenado, para la tercera cara: intercambiar los dos números del par refleja el rastro sobre la diagonal.

Ninguna arista sigue el orden escolar, donde la inversa se presenta como procedimiento de despeje. Acá el despeje es la consecuencia, no la definición.

## 3. Dificultad cognitiva real

Lo difícil no es despejar sino cuatro capacidades:

1. **Aceptar que la inversa es un objeto del mismo tipo.** No es un paso ni un truco: es otra máquina, que se nombra, se grafica y se compone.
2. **Ver que deshacer es una condición sobre la cadena.** `f⁻¹` no se reconoce por su fórmula sino por lo que hace la cadena: la bola vuelve a ser la que era, en los dos sentidos.
3. **Aceptar que no toda máquina tiene inversa.** Si dos entradas dan la misma salida, la marcha atrás no sabe a cuál volver. Es el candado `×0` del nodo 12 con forma de máquina.
4. **Moverse entre tres representaciones.** La tubería al revés, el llavero y el rastro reflejado son lo mismo visto de tres maneras.

Las tres mecánicas del YAML corresponden una a una con esas representaciones, y la cuarta capacidad es cambiar de mecánica sin perder el objeto.

## 4. Problema intuitivo

Una máquina de la fábrica tiene una palanca con dos posiciones. En una, la caja entra por la izquierda y sale envuelta por la derecha. En la otra, la caja envuelta entra por la derecha y sale desenvuelta por la izquierda.

En `intuition` la escena se detiene con una caja envuelta frente a la boca de salida y pregunta, por voz o por gesto: si la metemos por acá con la palanca al revés, ¿qué sale del otro lado? Tres finales dibujados: sale la caja original; sale envuelta dos veces; la máquina se traba porque hay dos cajas distintas que se envuelven igual. El jugador elige y después ve. El tercer final vuelve al cierre del nodo.

## 5. Analogía del mundo real

`machine_reverse_run`, sobre `machine_pipe` ([G0](../../G-analogias/G0-reglas.md)). Mapa: correr la máquina al revés → función inversa; meter la salida por la boca de salida → intercambiar entrada y salida; máquina que junta dos entradas en una salida → función no inyectiva; palanca de reversa → notación de la inversa; máquina de duplicar corrida al revés → el logaritmo de la exponencial, que llega en el nodo 24.

Invariante: la cadena devuelve lo que entró, en los dos sentidos. Es `inverse_restores_original`, el mismo invariante de `chest_key`, ahora enunciado sobre una máquina.

Por qué esta y no otra. El cofre con su llave conserva la reversibilidad pero no el tipo: la llave es de otra clase que el candado, y acá las dos tienen que ser máquinas. Una película pasada al revés conserva las dos cosas pero no tiene entradas ni salidas separadas, así que no se puede componer. La máquina con palanca conserva las tres.

Punto de ruptura: `non_injective_reversal`, y la analogía se desvanece recién en `formal` para poder mostrarlo. Cuando dos entradas dan la misma salida, la palanca no alcanza y hay que agregar una decisión: recortar las entradas admitidas.

`chest_key` acompaña con el llavero y el diagrama vertical del nodo 12. `slope_walker` acompaña con el rastro y la diagonal.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `machine_pipe` es la principal y da el gesto y la analogía; `chest_key` aporta el criterio de elección de la llave que ya se aprendió; `slope_walker` aporta la comprobación gráfica ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Una máquina con su boca de entrada, su boca de salida y una palanca al costado. Una canasta de bolas y una bandeja con las bolas que ya salieron.
2. Demostración: la mano fantasma suelta una bola, la ve salir cambiada, tira de la palanca y mete la bola de salida por la boca de salida. La máquina la escupe por la entrada, idéntica a la original, que sigue como sombra en la canasta.
3. El jugador prueba con otras bolas. Cada vuelta exitosa ata la entrada con su salida por un hilo.
4. El jugador pone las dos máquinas en cadena con el tubo del nodo 20. La bola atraviesa las dos y sale como entró; el tubo intermedio muestra el valor de paso.
5. Aparece el llavero del nodo 12, ahora con máquinas en vez de operaciones. La que no corresponde no se traba: se engancha, la bola sale distinta y se ve el resultado.
6. El rastro del nodo 18 se dibuja abajo. Al tirar de la palanca, la grilla se dobla por la diagonal como una hoja y el rastro cae del otro lado, con los hilos reflejados.
7. Última máquina: una con dos bocas de entrada que confluyen. Al tirar de la palanca salen dos bolas y hay que elegir cuál, o recortar la canasta para que solo una sea admisible.

Nada se llama "incorrecto". La bola que vuelve distinta queda al lado de la original; las dos bolas de la máquina que junta entradas quedan las dos en la mesa.

## 7. Representación visual

Capa `visual`, primitiva `invert` dominante ([H](../../H-progresion-abstraccion.md)).

La máquina se estiliza en un rectángulo con dos flechas y la palanca queda como un arco que las da vuelta. Se desplaza la bola, ahora en los dos sentidos; nada se escala; se conserva el par, porque el hilo que ata entrada y salida sigue ahí cuando la bola viaja en la otra dirección.

`chest_key` entra como el diagrama vertical del nodo 12, ahora con la máquina entera en la flecha: arriba la bola, la flecha hacia abajo rotulada con la máquina, abajo la bola cambiada; la llave es la misma flecha hacia arriba.

`slope_walker` entra abajo con el rastro y la diagonal punteada. El doblez es la operación visual del nodo: los dos rastros quedan simétricos respecto de la diagonal y los hilos la atraviesan en ángulo recto. Todavía no hay `f⁻¹` escrito, ni inyectividad enunciada, ni recorte de dominio con notación.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Palanca → flecha invertida.** Al tirar de la palanca por primera vez en `visual`, la flecha de la máquina gira sobre sí misma y queda apuntando al otro lado, con la etiqueta de la máquina dada vuelta con ella.
2. **Máquina en reversa → nombre con marca.** Al soltar la bola de vuelta y ver que vuelve igual, la etiqueta invertida se endereza y le crece una marca pequeña arriba a la derecha: `f⁻¹`. La flecha girada queda un rato como sombra detrás de la marca.
3. **Cadena → identidad escrita.** Al armar la cadena de las dos máquinas con el tubo del nodo 20, la etiqueta de la caja grande, que en el nodo 20 decía `f∘g`, se escribe ahora `f⁻¹∘f`, y debajo aparece lo que la cadena hace con la bola: `f⁻¹(f(x)) = x`.
4. **Hilos → intercambio del par.** Al tocar un hilo del rastro, el par se despega con sus dos números y los dos se intercambian de lugar mientras el punto salta al otro lado de la diagonal: `(a, b)` se vuelve `(b, a)`.
5. **Doblez → reflexión con nombre.** Al doblar la grilla completa, la diagonal se rotula `y = x` y los dos rastros quedan etiquetados `f` y `f⁻¹`, cada uno del lado que le toca.

## 9. Notación matemática

Queda `f⁻¹` para nombrar la máquina de vuelta, `f⁻¹(f(x)) = x` y `f(f⁻¹(y)) = y` para decir qué la define, y `y = x` como la recta del espejo.

Símbolo nuevo: **`f⁻¹`**, en la capa `symbolic` ([H](../../H-progresion-abstraccion.md)). El problema que lo hizo necesario es nombrar la máquina de vuelta sin describir su regla. Con `x → x + 5`, decir "restar 5" alcanza; con `x → 2x + 3` la regla de vuelta es larga, y el jugador la necesita antes de calcularla para poder componerla y graficarla. Sale de la llave que abre lo que `f` cerró.

La marca es un exponente y el juego reconoce la incomodidad: muestra que acá no significa "elevado a menos uno", y el llavero del nodo 12 vuelve una vez para marcar la diferencia con dividir. La cheatsheet guarda las tres caras: que deshace, que refleja sobre la diagonal y que hace falta una entrada por salida.

## 10. Definición formal

Capa `formal`: texto corto con voz y la máquina con palanca al lado. Tres frases, de a una: "La inversa de una función es la función que devuelve cada salida a su entrada." "Se reconoce porque las dos cadenas, en un sentido y en el otro, dejan todo como estaba." "Una función tiene inversa solo si entradas distintas dan salidas distintas."

Condiciones y casos, verificados sobre el objeto: si dos entradas dan la misma salida no hay inversa, y se comprueba en la máquina de dos bocas; se puede recortar el conjunto de entradas admitidas hasta que la haya, y eso es una decisión y no un cálculo; la gráfica de la inversa es la reflexión sobre `y = x`, y por eso el test de la recta vertical del nodo 18 aplicado a la reflejada se vuelve el de la recta horizontal sobre la original; la inversa de la inversa es la original.

Ya jugado: las tres frases enteras. Nuevo: las palabras "inversa" y "recortar el dominio", y que la condición es sobre las entradas y no sobre la fórmula.

## 11. Propiedades

- **La inversa deshace en los dos sentidos.** `f⁻¹(f(x)) = x` y `f(f⁻¹(y)) = y`. Ligada a la bola que vuelve igual desde cualquiera de las dos bocas.
- **La inversa de la inversa es la original.** Ligada a tirar de la palanca dos veces.
- **La gráfica de la inversa es la reflexión sobre `y = x`.** Ligada al doblez de la grilla con los hilos que la cruzan en ángulo recto.
- **Existe solo si entradas distintas dan salidas distintas.** Ligada a la máquina de dos bocas que devuelve dos bolas.
- **La inversa de una cadena invierte el orden.** La llave de afuera abre primero. Ligada a desarmar la caja doble del nodo 20 desde el extremo.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: una máquina y varias candidatas; tocar la que devuelve cada salida a su entrada.
- `explain`: dos animaciones. En una, la máquina de elevar al cuadrado corre al revés y saca dos entradas; en la otra saca una sola. Tocar la que pierde una rama.
- `manipulate`: arrastrar la llave sobre la máquina y correrla hacia atrás; la tubería confirma cuando la salida vuelve a ser la entrada.
- `apply`: el rastro de una máquina sobre la grilla; doblar la grilla por la diagonal y ubicar el rastro de la inversa, contra el tiempo objetivo del nodo.
- `generalize`: sin máquinas, fichas con nombre y marca; reconocer cuándo existe la inversa y cuándo hay que recortar entradas.
- `transfer`: en la rueda de `trig.inv.arcsin_two_branches`, tocar los dos ángulos que producen la misma altura.

Misconceptions y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`sqrt_loses_negative_branch`**, declarada por el nodo. Aparece al correr al revés la máquina de elevar al cuadrado y quedarse con una sola bola. Patrón `double_flip` sobre `chest_key`, que es mecánica del nodo, así que corre sin traducción: se muestra la primera bola entrando y saliendo, después la otra bola entrando y saliendo igual, y se comparan los dos aterrizajes en la misma salida. Voz: "Otro número también da {a} al cuadrado. ¿Cuál es?". La bola olvidada queda en la mesa y el jugador decide qué hacer con ella.
- **`wrong_inverse_choice`**, heredada de `prealg.inv.operation_as_key`. Aparece al elegir del llavero la máquina que no deshace, típicamente restando donde había que dividir. Patrón `key_mismatch` sobre `chest_key`, mecánica del nodo: se muestra la forma del candado, se acerca la llave elegida, no entra, y aparece la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué operación deshace multiplicar por {a}?". En la capa de nombres la elección equivocada no se traba: la cadena se arma, la bola sale distinta y queda al lado de la original.
- **`unwrap_order_inverted`**, heredada de `arith.expr.precedence_tree` y viva de nuevo porque la inversa de una cadena invierte el orden. Aparece al deshacer `f∘g` empezando por `g`. Su mecánica es `chest_key`, que este nodo declara, así que corre ahí con `tree_unwrap`: se arma el árbol de anidamiento, se reproduce el orden del jugador y la capa de afuera queda sin abrir, resaltada. Voz: "La capa de afuera es la última máquina que tocó la bola. ¿Cuál abrimos primero?".

## 13. Generalización

La analogía se retira en `formal`, más tarde que en los nodos vecinos, por una razón concreta: la máquina con palanca es la única manera de mostrar el caso sin inversa sin que parezca un error del jugador. Recién con el recorte de entradas enunciado, la máquina se desvanece y quedan las etiquetas y el par de rastros.

Variantes sin ayuda visual, en orden: máquinas de un paso; de dos pasos, donde la inversa invierte el orden; con salida siempre positiva, que anticipan el dominio del nodo 24; máquinas que juntan entradas, para rechazar antes de intentar; máquinas donde el recorte se elige y hay más de una elección razonable; la máquina que no hace nada, que es su propia inversa.

El nodo está en `abstract` cuando el jugador escribe la inversa de una máquina de dos pasos sin dibujar tuberías, decide si existe mirando el rastro con una recta horizontal, y explica por qué la inversa de una cadena invierte el orden con la cadena y no con la fórmula.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `linalg.map.inverse_and_systems`: el cofre es una grilla deformada y `A⁻¹` es la deformación que la devuelve; las deformaciones que aplastan la grilla a una línea son las máquinas que juntan entradas.
- `trig.inv.arcsin_two_branches`: la máquina de la altura junta infinitas entradas en la misma salida, y el recorte de entradas deja de ser un detalle para volverse la definición.
- `calc1.ftc.integral_undoes_derivative`: la llave devuelve una familia de máquinas y no una sola, porque la de ida destruyó la altura de arranque.
- `prob.cond.bayes_reverses_condition`: correr al revés una condición no devuelve la condición dada vuelta, y ahí el nodo sirve sobre todo para marcar dónde la intuición de reversa falla.

Concepto siguiente: `alg.fn.quadratic_and_sqrt` ([22](22-alg.fn.quadratic_and_sqrt.md)). Frase puente, narrada sobre la máquina de dos bocas: "Esta máquina junta dos bolas en una sola. Si la corremos al revés, ¿cuál de las dos nos devuelve?". Las dos bolas quedan sobre la mesa y el nodo 22 empieza ahí, con la baldosa cuadrada que las explica.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `pipe_run_machine_backwards` es nativa: la máquina del jugador con la palanca, la bola que entra por la salida y vuelve a ser la que era, y la cadena de las dos armada al lado; parametrizada por la máquina, su inversa y la entrada, produce también las dos animaciones de `explain`. `slope_reflect_graph_over_diagonal` es nativa: el rastro, la diagonal punteada y el doblez que deja el segundo rastro del otro lado, con los pares atados; es la imagen de cheatsheet de `cs.alg.inverse_reflects_over_diagonal`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsan `chest_key_matches_lock` y `chest_wrong_key_stays_shut` (nodo 12) como distractores de `explain`.

**Calculadora:** en `ready` se habilita `op_inverse_function` ([M](../../M-calculadora/M0-progresion.md)), un ícono de palanca junto a cualquier función definida. Es una operación de función con caja de arena: devuelve una máquina nueva, componible con `op_compose` y graficable con `op_plot`. Cuando la función no admite inversa, no da error: dibuja las dos entradas que caen en la misma salida y ofrece el recorte, que el jugador elige. Si el nodo decae, la palanca cuesta de mover.

**Edad universal:** el nodo es `icons` porque las máquinas llevan etiquetas con letras y las bolas llevan números desde el segundo nivel; el minijuego soporta hasta `full_text`, donde la definición corta se muestra escrita además de narrada. Los primeros niveles se juegan sin leer: la palanca se tira, la bola vuelve, el doblez de la grilla se hace con dos dedos y los prompts van por voz ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel de nombres y usa el teclado de fichas para escribir la inversa antes de comprobarla con la palanca.
