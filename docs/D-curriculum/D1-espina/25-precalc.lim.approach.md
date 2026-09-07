# 25 — Acercarse sin llegar (`precalc.lim.approach`)

> Locale `es`: "Acercarse sin llegar". Minijuego: [La mitad del camino](../../F-minijuegos/precalc.lim.approach.md).

**Nodo:** `precalc.lim.approach` · **Área:** precalc · **Nivel:** 4 · **Primitiva:** `displace` · **Mecánica principal:** `slope_walker` (secundaria `gears_sequence`) · **Literacy:** `icons` · **Analogía:** `zeno_half_steps`

## 1. Concepto

Hay preguntas cuya respuesta no está en ningún punto del recorrido y sin embargo está determinada: hacia dónde va algo que se acerca sin llegar. Al terminar, el jugador lee el valor al que se aproxima una lectura acercando la entrada por los dos lados, sabe que ese valor no depende de lo que pase justo en el punto, y distingue un lugar donde la función tiene un hueco de uno donde no tiene nada. Antes leía alturas en puntos de una curva; ahora lee una altura en un punto donde la curva no está.

## 2. Prerequisitos

- `alg.fn.graph_as_picture` (nodo [18](18-alg.fn.graph_as_picture.md)): el rastro y el par ordenado. Se usan la lectura de la altura sobre un valor de entrada, el punto como par y la costumbre de recorrer el rastro con el dedo. Sin ese recorrido, "acercarse por la izquierda y por la derecha" no es un gesto sino una frase.
- `arith.frac.parts_and_ratio` (nodo [08](08-arith.frac.parts_and_ratio.md)): la parte de una cantidad y la razón. Se usa para que "la mitad de lo que falta" sea una cantidad manipulable y no una idea, y para que la brecha que se achica se pueda comparar con una brecha elegida.

La arista con las fracciones no sigue el orden escolar, que llega al límite recién en cálculo y a partir de la definición. [C0](../../C-knowledge-graph/C0-esquema.md) la coloca en precálculo y antes de la derivada porque el límite no es una técnica de cálculo: es la manera de hablar de un valor que no se alcanza, y el jugador la necesita entera antes de que aparezca el primer cociente que no se puede evaluar.

## 3. Dificultad cognitiva real

Lo difícil no es completar una tabla sino cuatro capacidades:

1. **Separar el valor al que se acerca del valor en el punto.** Son dos preguntas distintas, y la costumbre escolar de evaluar las confunde. El jugador tiene que poder responder la primera cuando la segunda no tiene respuesta. Falla en `limit_as_reaching`.
2. **Aceptar que un proceso infinito tiene un destino.** Los pasos no se terminan nunca y aun así hay un lugar del que no pasan y al que se acercan tanto como se quiera. Es contraintuitivo mientras "llegar" y "acercarse" sean lo mismo.
3. **Leer por los dos lados.** Un valor al que se acerca por la izquierda y otro por la derecha no son una respuesta. El jugador tiene que buscar los dos antes de responder, y encontrar el caso donde no coinciden.
4. **Comparar la brecha con una brecha elegida.** "Tan cerca como quieras" solo significa algo si alguien elige el "cuánto". El nodo instala ese juego de dos partes con marcadores y sin notación; la formalización llega mucho después, en `calc1.lim.epsilon_delta_tolerance`.

Las cuatro se reparten entre las dos mecánicas: la primera y la tercera viven en el caminante sobre el rastro, la segunda y la cuarta en la manivela que parte lo que falta.

## 4. Problema intuitivo

Un pasillo con una pared al fondo y alguien caminando hacia ella. Cada paso lo lleva a la mitad de lo que falta: el primer paso cubre medio pasillo, el segundo un cuarto, el tercero un octavo. La pregunta, por voz o por gesto: ¿toca la pared?

En `intuition` la escena se detiene en el cuarto paso, con el caminante muy cerca. Tres desenlaces dibujados: toca la pared en algún paso; se detiene antes y no avanza más; se acerca siempre y nunca la toca. El jugador elige y después ve la escena correr veinte pasos con la cámara acercándose para que los pasos sigan siendo visibles. La pared se queda donde estaba. Esa pared es el límite y el jugador ya la vio antes de que tenga nombre.

## 5. Analogía del mundo real

`zeno_half_steps`, sobre `slope_walker` ([G0](../../G-analogias/G0-reglas.md)). Mapa del YAML: pared → límite; cada paso es la mitad de lo que falta → término de la sucesión; nunca tocar la pared → límite no alcanzado; más cerca que cualquier brecha elegida → condición de tolerancia; distancia total caminada → suma de la serie; lo que falta → error.

Invariante: la brecha se achica sin cambiar de signo y el caminante nunca pasa la pared. Ruptura declarada: `limits_reached_or_oscillating`. Hay procesos que sí alcanzan su destino y otros que se le acercan saltando de un lado al otro, y el caminante que avanza siempre para adelante no puede mostrarlos. Por eso la analogía se desvanece en `formal`, y por eso el nodo agrega desde el principio un segundo tipo de recorrido: acercarse a un valor de entrada por los dos lados, que es lo que va a hacer falta después.

La segunda mecánica, `gears_sequence`, no viste nada: cuenta. Una manivela produce el paso siguiente a partir del anterior siempre con la misma regla, y una pista muestra las posiciones acumuladas. Aporta lo que el pasillo no puede: ver los términos como una lista y avanzar veinte pasos sin caminarlos.

Por qué esta y no otra. Una taza de café que se enfría conserva el acercamiento pero mete el tiempo y la temperatura ambiente, dos cosas que el jugador leería como parte de la estructura. Un número decimal con infinitos nueves conserva la estructura exactamente, pero es simbólico y no se puede tocar: es el ejemplo que el nodo usa al final, no el que usa al principio. El caminante y la pared se tocan con el dedo y se pueden mirar de cerca.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `slope_walker` es la principal y da el recorrido y la lectura; `gears_sequence` aporta la manivela y la lista ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `scrub` y `tap`.

1. Un pasillo con una pared, un caminante y un marcador de brecha entre los dos. Abajo, una manivela.
2. Demostración: la mano fantasma gira la manivela una vez y el caminante avanza la mitad de lo que falta. El marcador de brecha se achica a la mitad y deja una marca de dónde estaba.
3. El jugador gira. Cada vuelta deja su marca, y las marcas se apiñan contra la pared. Cuando ya no se distinguen, el juego acerca la cámara y las marcas vuelven a separarse: la escena se puede mirar de cerca para siempre.
4. La brecha elegida. El jugador arrastra un segundo marcador y lo coloca donde quiera, cerca de la pared. La manivela gira sola hasta que el caminante lo pasa, y el contador muestra en qué paso lo pasó. Puede volver a colocarlo más cerca; siempre hay un paso.
5. El cambio de escenario. El pasillo se dobla y se vuelve el rastro del nodo 18 sobre una cuadrícula. Ahora lo que se acerca es la entrada, y el jugador la arrastra hacia una marca del eje desde la izquierda y desde la derecha. La altura correspondiente se lee con una línea que sube.
6. El hueco. En una de las curvas, justo en la marca, el rastro tiene un punto vacío. El jugador puede acercarse todo lo que quiera por los dos lados y la altura se estabiliza igual. Al soltar la entrada exactamente en la marca, no hay altura que leer, y el juego lo muestra sin mensaje: la línea que sube no encuentra dónde apoyarse.
7. El punto mudado. Otra curva tiene un punto dibujado en la marca, pero a una altura distinta de la que anuncian los dos lados. Las dos lecturas conviven en pantalla y el jugador elige a cuál llamar "el valor al que se acerca".
8. El salto. Una tercera curva da lecturas distintas por izquierda y por derecha. El juego no la descarta: la deja en la mesa como el caso que todavía no tiene respuesta, y que resuelve `calc1.lim.one_sided_and_jump`.

Nada se llama "incorrecto". El caminante que se pasa de la pared no existe; el punto que no se puede leer queda vacío y visible.

## 7. Representación visual

Capa `visual`, primitiva `displace` dominante ([H](../../H-progresion-abstraccion.md)).

Lo que se desplaza es el caminante, y lo que hace legible el nodo es que los desplazamientos se dibujan como una fila de tramos cada vez más cortos que no se superponen. Lo que se conserva es la pared: el juego la mantiene fija mientras todo lo demás se reescala, y esa fijeza es la representación del límite. Al acercar la cámara, los tramos vuelven a verse iguales que al principio, y el jugador ve que el proceso no se agota.

`slope_walker` aporta además la lectura sobre el rastro: dos líneas punteadas, una vertical desde la entrada y una horizontal hasta la altura, con el punto de encuentro dibujado hueco cuando la curva no lo tiene.

`gears_sequence` entra abajo con la lista de posiciones y de brechas, una fila por vuelta, donde las brechas se leen de un vistazo achicándose. Es la tabla de valores antes de ser una tabla.

Todavía no hay `lim` escrito, ni la notación de flecha, ni límites laterales con nombre, ni nada dicho sobre continuidad.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Brechas dibujadas → columna de números.** Al girar la manivela varias veces en `visual`, las brechas marcadas se despegan del pasillo y se ordenan en una columna al costado, en el mismo orden en que se produjeron.
2. **Posiciones → tabla de dos columnas.** Al pasar al rastro, la entrada arrastrada y la altura leída dejan su par en una fila. Al acercarse por los dos lados, la tabla se parte en dos mitades que avanzan hacia el medio, y el número que las dos persiguen queda solo en el centro.
3. **Entrada que se acerca → flecha.** Al soltar la entrada muy cerca de la marca, la ficha de la entrada y la de la marca se unen por una flecha corta: `x → 2`. La flecha nace del gesto de arrastre y conserva su dirección.
4. **Lectura estabilizada → nombre.** Cuando las dos mitades de la tabla se acercan al mismo número, ese número se despega del centro y se le antepone un nombre de tres letras, con la flecha del paso anterior colgando abajo: `lim` con `x → 2` debajo.
5. **Rastro → función dentro del símbolo.** Al tocar la curva, su etiqueta se desliza a la derecha del nombre y queda `lim` con su flecha y `f(x)` al lado, igualado al número. El punto hueco del rastro sigue hueco mientras el renglón está escrito, y el jugador puede tocarlo para ver que el renglón no cambia.

## 9. Notación matemática

Queda el renglón con `lim`, la flecha de aproximación debajo, la función a la derecha y el valor al que se acerca después del igual.

Símbolo nuevo: **`lim`**, en la capa `symbolic` ([H](../../H-progresion-abstraccion.md)). El problema que lo hizo necesario es hablar del valor al que se acerca algo cuando el valor exacto no se alcanza. Mientras las curvas eran continuas, escribir la altura en el punto alcanzaba y nadie necesitaba nada nuevo. Con el hueco, el jugador tiene un número que puede señalar con el dedo, que las dos mitades de la tabla persiguen, y que no se puede escribir con la notación que ya tiene: `f(2)` no existe. El nombre viene de la pared, que es el nombre de la analogía convertido en tres letras.

La flecha debajo es una convención de escritura con su propio problema: hay que decir hacia dónde se acerca la entrada y por dónde, y una igualdad no puede decirlo porque la entrada nunca es igual a la marca. La cheatsheet guarda las tres caras del nodo: `cs.precalc.limit_notation`, `cs.precalc.limit_by_table_of_values` y `cs.precalc.limit_ignores_value_at_point`.

## 10. Definición formal

Capa `formal`: texto corto con voz y el pasillo con las dos marcas al lado. Tres frases, de a una: "El límite de una función en un punto es el valor al que se acerca la salida cuando la entrada se acerca al punto." "La entrada nunca vale el punto, así que el límite no depende de lo que pase ahí." "El límite existe cuando acercarse por la izquierda y por la derecha da el mismo valor."

Condiciones y casos, verificados sobre el objeto: si la función tiene un hueco en el punto, el límite existe igual; si el punto está dibujado a otra altura, el límite es el de los dos lados y no el del punto; si las dos lecturas no coinciden, no hay límite y el caso queda marcado para `calc1.lim.one_sided_and_jump`; si la lectura se va hacia arriba sin detenerse, tampoco hay un número, y eso abre el nodo siguiente. La condición "tan cerca como quieras" se enuncia con los dos marcadores, sin letras griegas: para cualquier brecha que el jugador coloque, existe un paso desde el cual el caminante ya está más cerca.

Ya jugado: las tres frases enteras y los cuatro casos. Nuevo: las palabras "límite" y "existe", y que la respuesta se decide con los dos lados y nunca con el punto.

## 11. Propiedades

- **El límite no depende del valor en el punto.** Ligada a la curva con el hueco y a la curva con el punto mudado, que dan el mismo renglón.
- **Existe cuando las dos lecturas laterales coinciden.** Ligada a las dos mitades de la tabla que se persiguen y al caso del salto, donde no lo hacen.
- **Cuando existe, es único.** Ligada a que la pared es una sola por más veces que se corra la escena.
- **Acercarse tanto como se quiera es un juego de dos partes.** Para toda brecha elegida hay un paso desde el cual la distancia es menor. Ligada al marcador que el jugador coloca y a la manivela que gira sola hasta pasarlo.
- **La suma de todos los tramos es finita aunque los tramos no se terminen.** Ligada al pasillo entero recorrido con infinitos pasos, y anticipa `calc2.ser.partial_sums`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varios caminantes avanzando hacia una pared; tocar el que se acerca cada vez más a un punto sin tocarlo. Los distractores son un caminante que llega y se detiene y uno que oscila alrededor del punto, que son las dos rupturas declaradas de la analogía.
- `explain`: arrastrar el caminante con pasos que se achican y elegir la animación que muestra por qué el punto al que se acerca no depende de si lo alcanza. Los distractores son misconceptions del nodo, así que el error clasifica.
- `manipulate`: ajustar la tabla de valores acercando la entrada por los dos lados y observar a qué altura se aproxima la salida en la gráfica.
- `apply`: una gráfica con un hueco en `x = 2`; armar con fichas el valor al que se acerca la función, distinto del punto marcado, contra el tiempo objetivo del nodo.
- `generalize`: una sucesión de pasos a la mitad; predecir con la manivela la posición límite sin hacer todos los pasos.
- `transfer`: en la colina de `calc1.deriv.rate_as_slope_limit`, juntar dos puntos de la curva con la manivela y observar a qué pendiente se acerca la secante.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`limit_as_reaching`**, patrón `counterexample_slider` sobre `slope_walker`, que es la mecánica principal del nodo y corre sin traducción. El jugador responde con el valor de la función en el punto, o dice que el límite no existe porque el punto está vacío. El juego pone dos lecturas en paralelo sobre la misma curva: arriba, la altura en el punto; abajo, la altura a la que se acerca. Un deslizador controla la posición de la entrada. El barrido lleva la entrada hacia la marca desde los dos lados y se ve que la lectura de abajo converge mientras la de arriba se queda hueca. Voz: "El punto está vacío y la lectura igual se acerca a 4. ¿A cuál le hacemos caso?". El deslizador queda en manos del jugador. El patrón pide `literacy: icons`, que es la del nodo, porque hay que leer dos valores sobre el deslizador.

## 13. Generalización

La analogía se retira en `formal`. El caminante que siempre avanza para adelante no puede mostrar un acercamiento que oscila ni uno que alcanza su destino, y esos dos casos son parte de lo que el jugador tiene que reconocer antes de terminar. Recién con la definición corta enunciada, el pasillo se desvanece y quedan la tabla y el renglón.

Variantes sin ayuda visual, en orden: curvas continuas donde el límite coincide con el valor y no hay nada raro que ver; curvas con hueco; curvas con el punto dibujado a otra altura; curvas con salto, que se marcan como sin límite; sucesiones que se acercan a un valor desde arriba, desde abajo y alternando; sucesiones que no se acercan a nada; el decimal con infinitos nueves, que es el mismo caminante escrito con símbolos.

El nodo está en `abstract` cuando el jugador escribe el renglón mirando una tabla de valores sin dibujar la curva, responde el valor al que se acerca en un punto donde la función no está definida, distingue "no hay límite" de "no hay valor en el punto", y explica el acercamiento con la brecha elegida y no con la palabra "casi".

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `calc1.deriv.rate_as_slope_limit` (nodo [26](26-calc1.deriv.rate_as_slope_limit.md)): la pendiente de la secante cuando los dos puntos se juntan. Es el uso más inmediato del nodo, y el hueco deja de ser una rareza para volverse el caso normal: en el punto de contacto el cociente no existe y el valor al que se acerca sí.
- `calc2.ser.partial_sums`: no la posición sino lo acumulado, donde el balde se llena hasta un nivel que las sumas parciales persiguen.
- `prob.basic.probability_as_proportion`: la proporción de resultados favorables en muchas repeticiones, que se acerca a un valor sin que ninguna tanda lo alcance.

El nodo participa además en `ch.calc.telescoping_sum_hidden_split` de [S](../../S-desafios/S0-desafios.md), donde el último paso es tomar el límite de una suma parcial que casi todo se cancela.

Concepto siguiente: `precalc.lim.infinity_and_asymptote`. Frase puente, narrada sobre el pasillo con la cámara ya muy acercada: "El caminante nunca toca la pared. ¿Y si sacamos la pared y lo dejamos caminar para siempre?". La pared se desvanece, el pasillo se estira hasta perderse y el nodo siguiente empieza ahí, preguntando a qué se acerca algo que no tiene dónde detenerse.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `slope_scene_walker_approaches_wall` es nativa y toma la función, el punto, el valor del límite y si hay hueco: la entrada se acerca por los dos lados, las líneas punteadas suben y cruzan, el punto se dibuja hueco cuando corresponde y la lectura cambia mientras la entrada se mueve; gramática `displace`, con la pared fija mientras la escena se reescala. Es la imagen de cheatsheet de `cs.precalc.limit_ignores_value_at_point`. `gear_scene_zeno_halving` es nativa y toma el destino, la cantidad de pasos y la razón: los tramos se dibujan uno tras otro, cada vez más cortos, y la brecha se achica con su número al costado; produce también los distractores de `recognize`, el que llega y el que oscila, cambiando la razón. Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_limit` ([M](../../M-calculadora/M0-progresion.md)), un ícono de flecha corta que se aplica a una función definida y a un punto. Llega en su forma numérica y de tabla, que son las que este nodo justifica: devuelve las dos columnas de acercamiento por izquierda y por derecha antes que cualquier resultado, y solo después escribe el renglón. Cuando las dos columnas no coinciden, no da error: las muestra separadas y deja el renglón sin completar. Las formas algebraicas y las de infinito se habilitan en los nodos que las desbloquean. Si el nodo decae, la tabla arranca con menos filas y hay que pedir las que faltan.

**Edad universal:** el nodo es `icons` porque la tabla de valores y los dos marcadores llevan números desde el segundo nivel, y porque el patrón de explicación del nodo pide ese mínimo ([Q](../../Q-edad-universal.md)). El pasillo, la manivela, el arrastre de la entrada por los dos lados y el punto hueco se juegan sin leer, con la mano fantasma como instrucción y los prompts por voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel del hueco y usa el teclado de fichas para escribir el renglón antes de comprobarlo con la tabla.
