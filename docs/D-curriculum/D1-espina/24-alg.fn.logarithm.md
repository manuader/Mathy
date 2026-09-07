# 24 — Contar cuántas veces se escaló (`alg.fn.logarithm`)

> Locale `es`: "Contar cuántas veces se escaló". Minijuego: [La llave que cuenta vueltas](../../F-minijuegos/alg.fn.logarithm.md).

**Nodo:** `alg.fn.logarithm` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundarias `gears_sequence` y `machine_pipe`) · **Literacy:** `icons` · **Analogía:** `machine_reverse_run`

## 1. Concepto

El logaritmo es la llave de la exponencial, y lo que devuelve no es una cantidad sino un conteo: cuántas veces se multiplicó por el mismo factor para llegar hasta acá. Al terminar, el jugador corre la manivela del nodo 23 hacia atrás para leer las vueltas, sabe que la llave solo entra en cofres positivos, y descubre que la llave convierte una multiplicación en una suma. Antes tenía una llave que deshacía una operación; ahora tiene una llave que cambia la operación de adentro por otra más simple.

## 2. Prerequisitos

- `alg.fn.exponential_growth` (nodo [23](23-alg.fn.exponential_growth.md)): la manivela que multiplica en cada paso. Se usan la pista con marcas cada vez más separadas, el factor como razón constante, el exponente ya convertido en una ficha que se arrastra y la pregunta que quedó abierta al final de ese nodo: en qué vuelta se pasa un umbral.
- `alg.fn.inverse_function` (nodo [21](21-alg.fn.inverse_function.md)): la llave que es una máquina entera. Se usan la palanca de reversa, la condición sobre las entradas y el criterio del llavero. La máquina que duplica corrida al revés estaba anunciada en el mapa de la analogía del nodo 21; este nodo la cobra.

Ninguna arista sigue el orden escolar, donde el logaritmo se presenta como una definición seguida de una tabla de reglas. [C0](../../C-knowledge-graph/C0-esquema.md) lo coloca después de la exponencial y de la función inversa porque no es un tema: es la llave de un candado concreto, y sin el candado no hay nada que abrir.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar reglas sino cuatro capacidades:

1. **Aceptar que la respuesta es un conteo.** Todas las llaves anteriores devolvían algo del mismo tipo que lo que había en el cofre: se le quitaban cinco pesas a un peso y quedaba un peso. Acá el cofre tiene mil vueltas de manivela adentro y lo que sale es un tres. Cambiar de tipo es el salto conceptual del nodo.
2. **Ver la base como parte de la llave.** No hay una llave sino una por factor. Contar duplicaciones y contar triplicaciones son preguntas distintas sobre el mismo cofre, y las dos son legítimas.
3. **Aceptar que la llave no entra en todos los cofres.** El candado exponencial solo produce cofres positivos, así que la llave existe pero no sirve para todo. Es la primera vez que aparece el dominio como límite de una llave, después del candado `×0` del nodo 12 y de las dos ramas del nodo 22.
4. **No repartir la llave sobre una suma.** La llave convierte productos en sumas y no hace nada con las sumas. Falla en `log_of_sum`, que es la misconception de este nodo y la que más lo compromete.

Las cuatro se reparten entre las tres mecánicas: la primera y la segunda viven en la pista de engranajes leída al revés, la tercera en el llavero y el cofre, la cuarta en las tuberías.

## 4. Problema intuitivo

Una hoja de papel que alguien ya dobló y dejó sobre la mesa. Se ve la pila desde el costado y se pueden contar las capas: hay treinta y dos. La persona que la dobló se fue. La pregunta, por voz o por gesto: ¿cuántas veces la dobló?

En `intuition` la escena se detiene con la pila y tres desenlaces dibujados: la dobló treinta y dos veces, la dobló cinco veces, la dobló dieciséis veces. El jugador elige y después ve a la mano desdoblar la hoja de a una, con la pila cayendo a la mitad en cada paso y un contador que sube. Termina en cinco. La misma escena vuelve al final del nodo con una pila de cuarenta capas, donde el contador se detiene entre cinco y seis.

## 5. Analogía del mundo real

`machine_reverse_run`, sobre `machine_pipe` ([G0](../../G-analogias/G0-reglas.md)). Es la analogía del nodo 21 y vuelve a propósito, porque la pieza que este nodo necesita ya estaba en su mapa: máquina de duplicar corrida al revés → logaritmo de la exponencial. También se usan correr la máquina al revés → función inversa, meter la salida por la boca de salida → intercambiar entrada y salida, y la palanca de reversa → la notación de la inversa.

Invariante: la cadena devuelve lo que entró, en los dos sentidos. Es `inverse_restores_original`, el invariante de `chest_key`, y acá se lee de una manera nueva: meter cinco, salir treinta y dos, meter treinta y dos, salir cinco. Ruptura declarada: `non_injective_reversal`, que en este nodo no se activa, porque la exponencial no junta entradas. Lo que sí aparece es su reverso: la máquina de vuelta no acepta cualquier entrada. La analogía se desvanece en `formal`, cuando ese recorte de entradas ya está enunciado.

`paper_folding_doubles` acompaña, con la misma piel del nodo 23 y una entrada de su mapa que allá no se usó: contar dobleces hasta llegar a un grosor → logaritmo en base dos. La pista de engranajes se lee hacia atrás.

`chest_key` es la mecánica principal y no trae piel nueva: trae el llavero, el diagrama vertical y el criterio de elección. Es la cuarta llave de la sección "Funciones como llaves" de [E0](../../E-mecanicas/E0-catalogo.md), la que introduce el dominio.

Por qué esta y no otra. El pH o la escala de terremotos conservan la estructura pero exigen conocer el fenómeno, y `literacy` sube sin que el concepto gane nada. La regla de cálculo conserva la conversión de productos en sumas de manera hermosa, pero es un objeto que el jugador nunca vio. La hoja doblada y la máquina en reversa ya están en su historia, y encima se conectan: la pista cuenta y la máquina explica por qué contar es deshacer.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `chest_key` es la principal y da el gesto y el criterio; `gears_sequence` aporta la pista donde se cuenta; `machine_pipe` aporta la tubería donde el producto se vuelve suma ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `scrub`.

1. Un cofre cerrado con una cantidad grande grabada en la tapa y, detrás, la pista de engranajes del nodo 23 con la ficha ya lejos del arranque. La manivela está trabada.
2. Demostración: la mano fantasma toma del llavero una llave con forma de manivela invertida y la arrastra al cofre. La cerradura gira, la ficha vuelve por la pista de a un salto y un contador cuenta los saltos. El cofre se abre y adentro no hay una cantidad: hay el número de saltos.
3. El jugador prueba con otros cofres. Si la cantidad cae justo en una marca de la pista, el contador da un entero. Si cae entre dos marcas, el contador se detiene entre dos números y el juego lo deja así, sin redondear.
4. El llavero tiene una llave por factor. Con la llave de duplicar sobre un cofre de triplicaciones, la ficha vuelve por saltos del tamaño equivocado y no aterriza en el arranque. La llave no se traba: se ve el desajuste y el cofre queda como estaba.
5. El cofre imposible. Un cofre con una cantidad negativa grabada. Ninguna llave del llavero entra: la ficha de la pista nunca estuvo de ese lado, porque multiplicar por un factor positivo no cruza el cero. El cofre queda marcado y disponible.
6. Las dos tuberías. Dos cofres, uno con una cantidad y otro con otra. El jugador los multiplica juntándolos y aplica la llave al resultado; después aplica la llave a cada uno y suma los conteos. Los dos caminos dan lo mismo, y la pista lo muestra: los saltos de uno se encadenan con los del otro.
7. La tubería de la trampa. El mismo tablero con una suma en vez de un producto. Los dos caminos dejan de coincidir, y las dos salidas quedan dibujadas como barras de distinto alto.

Nada se llama "incorrecto". La llave que no corresponde deja la ficha fuera del arranque; el cofre negativo se queda cerrado y visible.

## 7. Representación visual

Capa `visual`, primitiva `invert` dominante ([H](../../H-progresion-abstraccion.md)).

El diagrama vertical del nodo 12 vuelve con la manivela en la flecha: arriba el número de vueltas, la flecha hacia abajo rotulada con el factor, abajo la cantidad. La llave es la misma flecha hacia arriba, y lo que viaja en ella cambia de tipo a mitad de camino: baja un conteo y sube una cantidad. El juego lo marca con dos formas de ficha distintas, una redonda para las cantidades y una con muescas para los conteos.

`gears_sequence` entra como la pista leída al revés, con los saltos dibujados hacia atrás y un contador que sube mientras la ficha vuelve. La pista es la única representación donde se ve que los saltos son iguales aunque las distancias no lo sean.

`machine_pipe` entra como dos tuberías paralelas: arriba, dos cantidades que se juntan y pasan por la máquina; abajo, cada una por su máquina y las salidas que se juntan. Las dos salidas se dibujan como barras para poder compararlas de un vistazo.

Todavía no hay `log` escrito, ni base como subíndice, ni cambio de base, ni gráfica de la curva logarítmica.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Contador de saltos → ficha con muescas.** Al terminar el primer conteo en `visual`, el contador se contrae en una ficha con muescas al lado del cofre abierto. La ficha es del tipo del conteo, no de la cantidad.
2. **Llave con forma de manivela → llave con nombre.** En el mismo gesto, la llave pierde la forma y gana tres letras. El dibujo de la manivela queda un rato como sombra detrás del nombre.
3. **Factor de la llave → subíndice.** Al cambiar de llave en el llavero, el factor que distinguía cada una se despega y se apoya abajo a la derecha del nombre: `log₂`, `log₃`. Es el mismo gesto con el que el exponente subió en el nodo 23, ahora en la otra esquina.
4. **Diagrama vertical → dos renglones equivalentes.** Al tocar la flecha del diagrama, los dos sentidos se escriben uno debajo del otro y quedan unidos por una llave que abarca los dos: `2⁵ = 32` arriba, `log₂ 32 = 5` abajo. Cada ficha del primero se ilumina cuando el jugador toca su lugar en el segundo.
5. **Tuberías → producto que se vuelve suma.** Al comprobar que los dos caminos coinciden, las etiquetas de las dos tuberías caen a un mismo renglón y queda `log(a · b) = log a + log b`, con el punto del producto y el signo de la suma resaltados en el momento del cambio.

## 9. Notación matemática

Queda `log_b x` para el conteo de escalados por el factor `b` que llevan hasta `x`, el par de renglones equivalentes entre la forma exponencial y la logarítmica, y `log(a · b) = log a + log b`.

Símbolos nuevos: **`log`** y **`ln`**, en la capa `symbolic` ([H](../../H-progresion-abstraccion.md)). El problema que hizo necesario a `log` es responder "cuántas veces se escaló" cuando se conocen el resultado y el factor, y la respuesta no cae en una marca de la pista. Mientras las cantidades eran 8, 16 y 32 con factor dos, el jugador decía el número de vueltas y no hacía falta escribir nada. Con cuarenta capas, el conteo existe, se ve entre dos marcas, y no tiene nombre. El nombre de la llave se vuelve el símbolo que lo escribe sin calcularlo.

`ln` llega en el mismo nodo y por un problema distinto: hay un candado del llavero cuyo factor no lo elige el jugador. Aparece cuando el jugador reparte una vuelta entera en pedacitos cada vez más chicos y la pista se estabiliza en una separación que no depende de él. El juego le da nombre a su llave y deja el valor del factor abierto; ese valor se construye en `precalc.exp.natural_base`. Nombrar antes de calcular es el mismo movimiento que hizo `f⁻¹` en el nodo 21.

El subíndice de la base es una convención de escritura con su propio problema: con una sola llave en el llavero, el nombre alcanza; con tres, hay que decir cuál. La cheatsheet guarda las tres caras del nodo: `cs.alg.log_counts_scalings`, `cs.alg.log_undoes_exponential` y `cs.alg.log_of_product_is_sum`.

## 10. Definición formal

Capa `formal`: texto corto con voz y el diagrama vertical al lado. Tres frases, de a una: "El logaritmo de un número en una base es la cantidad de veces que hay que multiplicar por esa base para llegar a él." "Es la llave de la exponencial: una deshace lo que hizo la otra, en los dos sentidos." "Solo tiene respuesta para números positivos, porque multiplicar por una base positiva nunca cruza el cero."

Condiciones y casos, verificados sobre el objeto: la base tiene que ser positiva y distinta de uno, porque con base uno la ficha no se mueve y ninguna cantidad de vueltas llega a otro lugar; el logaritmo de la base es uno y el logaritmo de uno es cero, porque cero vueltas dejan la ficha en el arranque; el resultado puede ser negativo cuando la cantidad está entre cero y uno, y eso es la pista recorrida hacia atrás; el logaritmo de una suma no se reparte, y eso no es un caso especial sino una regla que no existe.

Ya jugado: las tres frases enteras y los cuatro casos. Nuevo: las palabras "logaritmo" y "base", y que el nombre solo, sin subíndice, esconde una base convenida que cambia según dónde se lo use.

## 11. Propiedades

- **El logaritmo deshace la exponencial en los dos sentidos.** `log_b(bⁿ) = n` y `b^(log_b x) = x`. Ligada a la ficha que vuelve al arranque y a la que sale de nuevo.
- **El logaritmo de un producto es la suma de los logaritmos.** Ligada a encadenar los saltos de dos pistas en una sola.
- **El logaritmo de uno es cero, en cualquier base.** Ligada a la ficha que no se movió del arranque.
- **Solo acepta entradas positivas.** Ligada al cofre negativo en el que ninguna llave entra.
- **Crece cada vez más despacio.** Cantidades enormes dan conteos chicos. Ligada a las marcas de la pista, que se separan cada vez más mientras el contador sube de a uno.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un cofre con la base y el resultado grabados y cuatro fichas al costado; tocar la que dice cuántas vueltas de la manivela hicieron falta. Los distractores salen de las reglas `detect` del nodo y de las del nodo 23.
- `explain`: dos animaciones. En una, el logaritmo del producto se arma como la suma de las vueltas de dos pistas; en la otra se suman los resultados antes de contar vueltas. Tocar la que confunde suma con producto. El distractor es `log_of_sum`, así que el error clasifica.
- `manipulate`: correr la máquina exponencial al revés arrastrando la llave de logaritmo y contar las vueltas en la pista.
- `apply`: una pista de duplicaciones leída hacia atrás; arrastrar la ficha con el número de vueltas entre dos marcas, contra el tiempo objetivo del nodo.
- `generalize`: sin pista, fichas con nombre y base; convertir entre la forma exponencial y la logarítmica y aplicar la regla del producto.
- `transfer`: en la búsqueda binaria de `csmath.rec.base_case_and_smaller_call`, tocar cuántas divisiones a la mitad hacen falta para encontrar la ficha escondida.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`log_of_sum`**, patrón `counterexample_slider` sobre `machine_pipe`, que este nodo declara entre sus mecánicas, así que corre ahí sin traducción, con la regla 1 de [L0](../../L-modelo-errores/L0-taxonomia.md). El jugador convierte `log(a + b)` en `log a + log b`, o `log(a · b)` en `log a · log b`. El juego enuncia su regla como dos tuberías paralelas: arriba, las dos cantidades combinadas como él las combinó y una sola máquina; abajo, cada cantidad por su máquina y las salidas combinadas igual. Un deslizador controla las dos cantidades. Arranca donde las salidas se parecen y desliza hasta un par donde la brecha es grande, con las salidas dibujadas como barras. Voz: "Con 10 y 100 las dos tuberías dan distinto. ¿Coinciden para algún par?". El deslizador queda en manos del jugador para que busque, y el tablero ofrece cambiar la suma por un producto, que es la versión de la regla que sí funciona.

## 13. Generalización

La analogía se retira en `formal`. La máquina en reversa es la única forma de mostrar sin drama que la llave no entra en cofres negativos: la palanca está, la máquina anda, y sin embargo esa entrada no existe del otro lado. Recién con el recorte de entradas enunciado se desvanecen la máquina y la pista, y quedan los dos renglones equivalentes. El papel doblado se retira antes, con el nodo 23, porque un conteo entre dos marcas ya no es una cantidad de dobleces.

Variantes sin ayuda visual, en orden: conteos enteros con base dos; otras bases enteras; conteos que caen entre dos enteros y se dejan escritos; cantidades entre cero y uno, con conteo negativo; convertir en los dos sentidos entre la forma exponencial y la logarítmica; productos y cocientes resueltos con la regla de la suma; entradas negativas o cero, que se marcan como sin respuesta y no como error.

El nodo está en `abstract` cuando el jugador escribe el par de renglones equivalentes sin dibujar el diagrama, elige la base mirando qué factor se repite en la situación, aplica la regla del producto en los dos sentidos y rechaza el reparto sobre una suma dando un par de números como contraejemplo.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `precalc.exp.natural_base`: el factor que no se elige, construido repartiendo una vuelta en pedazos cada vez más chicos, y con él el valor que este nodo dejó abierto detrás del nombre `ln`.
- `csmath.cplx.big_o_as_slope`: el costo de un algoritmo que parte el problema a la mitad se lee como el conteo de particiones, y la curva del logaritmo se vuelve una de las formas que el jugador aprende a reconocer de un vistazo.
- `csmath.rec.base_case_and_smaller_call`: la llamada que reduce el tamaño por un factor fijo, donde la profundidad de la recursión es exactamente el conteo del nodo.
- `calc1.deriv.rules_as_structure`: la llave que convierte productos en sumas se vuelve la herramienta para derivar lo que de otro modo no se puede, y ahí la propiedad deja de ser una regla y pasa a ser una estrategia.

Este nodo, junto con el 23, desbloquea el desafío `ch.alg.doublings_until_overflow` de [S](../../S-desafios/S0-desafios.md): el dato que falta es el número de vueltas, y se descubre leyendo el logaritmo como conteo de escalados.

Concepto siguiente: `precalc.lim.approach` ([25](25-precalc.lim.approach.md)). Frase puente, narrada sobre la pista con el diente chico del nodo 23: "Esta ficha se achica en cada vuelta y se acerca al cero. ¿Cuántas vueltas hacen falta para llegar?". La llave se acerca al cofre del cero y no encuentra cerradura, y el nodo 25 empieza ahí, con el caminante frente a la pared.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `chest_log_key_counts_turns` es nativa y toma la base, el resultado y las vueltas: la llave entra, la cerradura gira, la ficha vuelve por la pista de a un salto y el contador sube desde cero hasta detenerse; gramática `invert`, con las dos formas de ficha para distinguir cantidad de conteo. Es la imagen de cheatsheet de `cs.alg.log_counts_scalings`. `gear_track_read_backwards` es nativa y toma la base y los dos valores entre los que se cuenta: la pista con las marcas separándose, la llave que abarca el tramo y el conteo que aparece encima; produce también el distractor de `recognize` donde el conteo se confunde con la cantidad. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsan `chest_wrong_key_stays_shut` (nodo 12) y `gear_doubling_track` (nodo 23) como distractores de `explain`.

**Calculadora:** en `ready` se habilita `op_log` ([M](../../M-calculadora/M0-progresion.md)), un ícono de llave con muescas sobre cualquier número armado con fichas, con un selector de base al lado. Es una operación de función con caja de arena y depende del locale: el nombre escrito de la llave y la base que se sobreentiende cuando no se escribe cambian con el idioma, y el runtime los resuelve ([P](../../P-internacionalizacion.md)). No devuelve solo el número: dibuja la pista con las marcas y el tramo contado, y cuando el conteo cae entre dos marcas lo muestra ahí en vez de redondear. Con una entrada negativa o cero no da error: muestra la pista y la zona que la ficha nunca visitó. Si el nodo decae, el selector de base vuelve al valor por defecto y hay que elegirlo de nuevo.

**Edad universal:** el nodo es `icons` porque el llavero se distingue por el número de la base desde el primer nivel y porque el patrón de explicación del nodo pide ese mínimo ([Q](../../Q-edad-universal.md)). El desdoblado, la llave que se arrastra, la pista que se recorre hacia atrás y las dos tuberías se juegan sin leer, con la mano fantasma como instrucción y los prompts por voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel de los dos renglones equivalentes y usa el teclado de fichas para escribir la forma logarítmica antes de comprobarla con la llave.
