# La máquina en reversa (`alg.fn.inverse_function`)

Minijuego del nodo 21 de la espina, "La máquina corriendo al revés". Mecánica principal `machine_pipe`, secundarias `chest_key` y `slope_walker`; analogía `machine_reverse_run`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/21-alg.fn.inverse_function.md): un concepto, cuatro dificultades reales (la inversa como objeto del mismo tipo, deshacer como condición sobre la cadena, la existencia de máquinas sin inversa, moverse entre tres representaciones), una analogía, un gesto (tirar de la palanca y meter la bola por la salida), cinco pasos de desvanecimiento, la tubería con palanca como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Una máquina con una palanca de dos posiciones. En una, la bola entra por la izquierda y sale cambiada por la derecha. En la otra, la bola cambiada entra por la derecha y sale como era por la izquierda.

Mapa objeto → concepto: correr la máquina al revés → función inversa; meter la salida por la boca de salida → intercambiar entrada y salida; máquina que junta dos entradas en una salida → función no inyectiva; palanca de reversa → notación de la inversa; hilo que ata entrada y salida → par ordenado; doblez de la grilla por la diagonal → reflexión sobre `y = x`.

La analogía conserva `inverse_restores_original`, el invariante de `chest_key`, ahora enunciado sobre una máquina completa. Punto de ruptura: `non_injective_reversal`, y por eso la analogía se retira recién en `formal`: es la única manera de mostrar el caso sin inversa sin que parezca un error del jugador ([G0](../G-analogias/G0-reglas.md)).

Es el regreso de la llave del nodo 12, como anticipa la sección "Funciones como llaves" de [E0](../E-mecanicas/E0-catalogo.md): allí la llave era una operación de un paso, acá se vuelve un objeto del mismo tipo que aquello que abre. `chest_key` acompaña con el llavero y el diagrama vertical; `slope_walker` acompaña con el rastro y la diagonal.

## Mecánica central

Superficie: la máquina con su palanca en el centro, la canasta de bolas a la izquierda, la bandeja de salidas a la derecha, el llavero abajo y el rastro con la diagonal debajo de todo desde la capa `visual`. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Soltar una bola y tirar de la palanca.** La bola sale cambiada; con la palanca girada, meterla por la boca de salida la devuelve por la entrada, idéntica a la original, que sigue como sombra en la canasta.
- **Atar el par.** Cada vuelta exitosa deja la entrada unida a su salida por un hilo. Los hilos se acumulan y después se reflejan.
- **Encadenar las dos máquinas.** Con el tubo del nodo 20, la de ida y la de vuelta en serie: la bola atraviesa las dos y sale como entró, y el tubo intermedio muestra el valor de paso.
- **Elegir del llavero.** El llavero del nodo 12, ahora con máquinas en vez de operaciones. La que no corresponde no se traba: se engancha, la bola sale distinta y queda al lado de la original.
- **Doblar la grilla.** Con dos dedos sobre la diagonal, la grilla se pliega como una hoja y el rastro cae del otro lado, con los hilos reflejados.
- **Correr al revés la máquina que junta entradas.** Salen dos bolas por la entrada. El jugador elige cuál, o recorta la canasta para que solo una sea admisible.

En `symbolic` la superficie cambia de forma, no de reglas: tirar de la palanca es escribir la marca sobre el nombre, encadenar es escribir la identidad, y doblar la grilla es intercambiar los dos números del par. La máquina se pide con un toque y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica principal y uno por la de apoyo.

`inverse_restores_original` (máquina y cofre): la cadena devuelve lo que entró, en los dos sentidos. Se ve romperse cuando la máquina enganchada no es la inversa: la bola vuelve distinta y queda al lado de la original, sin mensaje. Se ve confirmarse cuando el hilo del par sigue atado después del viaje de vuelta.

`same_input_same_output` (tubería), heredado del nodo 17, es el que decide si la reversa existe. Cuando dos entradas dan la misma salida, la marcha atrás produce dos bolas y las dos quedan en la mesa: el invariante no se rompe, lo que falla es que la vuelta no es una máquina.

Un movimiento válido pero inútil, como tirar de la palanca dos veces o encadenar la máquina que no hace nada, no rompe nada. Recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `invert`, de apoyo `compose` y `relate` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la máquina de envolver de la fábrica, con la caja envuelta esperando frente a la boca de salida. Solo se mira y se predice.
- `concrete`: máquina con dos bocas y palanca, canasta de bolas, bandeja de salidas, hilos que atan los pares.
- `visual`: la máquina se estiliza en un rectángulo con dos flechas y la palanca queda como un arco que las da vuelta. Al costado, el diagrama vertical del nodo 12 con la máquina entera en la flecha. Abajo, el rastro y la diagonal punteada, con los hilos cruzándola en ángulo recto.
- `symbolic`: `f` y `f⁻¹` sobre las cajas, `f⁻¹(f(x)) = x` bajo la cadena, `(a, b)` y `(b, a)` sobre los dos rastros, `y = x` sobre la diagonal.
- `formal`: la definición corta con voz; la máquina de dos bocas al lado y la recta horizontal que se puede bajar con el dedo sobre el rastro original.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Palanca → flecha invertida: al tirar de la palanca por primera vez en `visual`, la flecha de la máquina gira sobre sí misma y queda apuntando al otro lado, con su etiqueta dada vuelta.
2. Máquina en reversa → nombre con marca: al ver volver la bola igual, la etiqueta se endereza y le crece una marca arriba a la derecha, `f⁻¹`; la flecha girada queda un rato como sombra.
3. Cadena → identidad escrita: al armar la cadena con el tubo del nodo 20, la etiqueta de la caja grande se escribe `f⁻¹∘f` y debajo aparece `f⁻¹(f(x)) = x`.
4. Hilos → intercambio del par: al tocar un hilo del rastro, el par se despega y sus dos números se intercambian mientras el punto salta al otro lado de la diagonal.
5. Doblez → reflexión con nombre: al doblar la grilla completa, la diagonal se rotula `y = x` y los dos rastros quedan etiquetados `f` y `f⁻¹`, cada uno de su lado.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la máquina con palanca: la inversa de una función es la función que devuelve cada salida a su entrada; se reconoce porque las dos cadenas, en un sentido y en el otro, dejan todo como estaba; una función tiene inversa solo si entradas distintas dan salidas distintas.

Propiedades: la inversa deshace en los dos sentidos, `f⁻¹(f(x)) = x` y `f(f⁻¹(y)) = y`; la inversa de la inversa es la original; su gráfica es la reflexión sobre `y = x`; existe solo si entradas distintas dan salidas distintas; la inversa de una cadena invierte el orden. Casos: se puede recortar el conjunto de entradas admitidas hasta que la inversa exista, y eso es una decisión y no un cálculo; el test de la recta vertical del nodo 18 aplicado al rastro reflejado se vuelve el de la recta horizontal sobre el original.

Símbolo nuevo: `f⁻¹`, nacido del problema de nombrar la máquina de vuelta sin describir su regla. Con `x → x + 5` alcanza decir "restar 5"; con `x → 2x + 3` la regla de vuelta es larga, y el jugador la necesita antes de calcularla para componerla y graficarla. El juego muestra una vez que la marca no significa "elevado a menos uno", con el llavero del nodo 12 al lado.

## Generalización

La máquina se retira en `formal`, más tarde que en los nodos vecinos, porque es la única manera de mostrar el caso sin inversa sin que parezca error. Recién con el recorte de entradas enunciado, la máquina se desvanece y quedan las etiquetas y el par de rastros.

Variantes sin ayuda visual: máquinas de un paso; de dos pasos, donde la inversa invierte el orden; con salida siempre positiva, que anticipan el dominio del nodo 24; máquinas que juntan entradas, para rechazar antes de intentar; máquinas donde el recorte se elige y hay más de una elección razonable; la máquina que no hace nada, que es su propia inversa. La analogía se eliminó cuando el jugador escribe la inversa de una máquina de dos pasos sin dibujar tuberías, decide si existe mirando el rastro con una recta horizontal y explica por qué la inversa de una cadena invierte el orden con la cadena y no con la fórmula.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): los niveles altos, donde la llave deja de ser una operación y pasa a ser una transformación con nombre, corresponden a este nodo. La diferencia con el nodo 13 es que allí la llave abría un cofre concreto y acá abre una máquina entera, así que el llavero se rearma con máquinas.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Envolver y desenvolver.** `real`, `recognize`. La máquina corre sola en las dos posiciones y el jugador mira.
2. **¿Qué sale por el otro lado?** `intuition`, `explain`. La escena se detiene con la caja envuelta frente a la salida y hay que elegir entre tres finales.
3. **Tirar de la palanca.** `concrete`, `manipulate`. Máquinas de un paso, sumar y restar, bolas de un dígito.
4. **El llavero de máquinas.** `concrete`, `recognize` y `manipulate`. Parámetros: se agregan multiplicar y dividir; el llavero tiene cuatro máquinas candidatas. Aparece `wrong_inverse_choice`.
5. **Doblar la grilla.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; entran el rastro, la diagonal y el doblez, con los hilos reflejados.
6. **Nombres y marca.** `symbolic` primera mitad, `manipulate` y `apply`. Aparecen `f⁻¹`, la cadena escrita y la identidad. La máquina sigue al lado.
7. **Dos pasos y máquina fantasma.** `symbolic` segunda mitad, `apply`. Parámetros: máquinas de dos pasos, donde la inversa invierte el orden, y rango numérico mayor. La máquina se pide con un toque.
8. **Máquinas que no vuelven.** `formal` y `abstract`, `generalize`. Definición corta con voz; la máquina que junta entradas, el recorte de entradas admitidas y la máquina que no hace nada.

Qué endurece cada parámetro: multiplicar y dividir traen la elección de llave del nodo 12 al mundo de las máquinas; el doblez obliga a leer la inversa en el rastro y no solo en la tubería; los dos pasos hacen visible que el orden se invierte; la máquina que junta entradas rompe la idea de que toda máquina se puede correr al revés, y el recorte convierte esa ruptura en una decisión del jugador.

Desafíos de olimpíada: el nodo no aparece todavía en ningún `requires` de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`. Los desafíos que hoy exigen `alg.fn.logarithm` lo tienen como prerequisito indirecto, porque el logaritmo se define como la inversa de la exponencial.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: una máquina que hace `x → 3x` y cuatro candidatas; tocar la que devuelve cada salida a su entrada.
- `explain`: dos animaciones. En una, la máquina de elevar al cuadrado corre al revés y saca dos entradas; en la otra saca una sola. Tocar la que pierde una rama. El distractor elegido clasifica.
- `manipulate`: `x → 2x + 3`; arrastrar la llave sobre la máquina y correrla hacia atrás hasta que la tubería confirme que la salida volvió a ser la entrada.
- `apply`: el rastro de una máquina sobre la grilla; doblar la grilla por la diagonal y ubicar el rastro de la inversa, contra el tiempo objetivo del nodo.
- `generalize`: sin máquinas, cuatro fichas con nombre y marca; decir en cuáles existe la inversa y en cuál hay que recortar entradas, y elegir el recorte.
- `transfer`: en la rueda de `trig.inv.arcsin_two_branches`, tocar los dos ángulos que producen la misma altura. También en `linalg.map.inverse_and_systems` y en `calc1.ftc.integral_undoes_derivative`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `sqrt_loses_negative_branch`, declarada por el nodo, patrón `double_flip` sobre `chest_key`, mecánica del nodo, así que corre sin traducción. Aparece al correr al revés la máquina de elevar al cuadrado y quedarse con una sola bola. Se muestra la primera bola entrando y saliendo, después la otra saliendo igual, y se comparan los dos aterrizajes en la misma salida. Voz: "Otro número también da {a} al cuadrado. ¿Cuál es?". La bola olvidada queda en la mesa.
- `wrong_inverse_choice`, heredada de `prealg.inv.operation_as_key`, patrón `key_mismatch` sobre `chest_key`, mecánica del nodo. Aparece al elegir del llavero la máquina que no deshace, típicamente restando donde había que dividir. Se muestra la forma del candado, se acerca la llave elegida, no entra, y aparece la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué operación deshace multiplicar por {a}?". En la capa de nombres la elección equivocada no se traba: la cadena se arma y la bola sale distinta.
- `unwrap_order_inverted`, heredada de `arith.expr.precedence_tree` y viva de nuevo porque la inversa de una cadena invierte el orden. Su mecánica es `chest_key`, declarada por el nodo, así que corre ahí con `tree_unwrap`: se arma el árbol de anidamiento, se reproduce el orden del jugador y la capa de afuera queda sin abrir, resaltada. Voz: "La capa de afuera es la última máquina que tocó la bola. ¿Cuál abrimos primero?".

Los distractores de `explain` y las opciones de `apply` se generan desde estas reglas y desde las de los tres prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `pipe_run_machine_backwards`, nativa. La máquina del jugador con su palanca, la bola que entra por la salida y vuelve a ser la que era, y la cadena de las dos máquinas armada al lado; gramática `invert`. Parametrizada por la máquina, su inversa y la entrada, produce también las dos animaciones de `explain`.
- `slope_reflect_graph_over_diagonal`, nativa. El rastro, la diagonal punteada y el doblez de la grilla que deja el segundo rastro del otro lado, con los pares atados. Abre el nivel 5 y es la imagen de cheatsheet de `cs.alg.inverse_reflects_over_diagonal`.
- Reusadas: `chest_key_matches_lock` y `chest_wrong_key_stays_shut` (nodo 12), como distractores de `explain` y como el regreso explícito del llavero en el nivel 4.
- Ninguna lleva texto rasterizado: las letras, la marca y los números los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_invertible_machine`: `steps` (1 en los niveles 3 a 6, 2 desde el 7); `ops` (sumar y restar en el nivel 3, las cuatro desde el 4); `operand_range`; `input_range`; `output_positive_only` (para las máquinas que anticipan el dominio); `seed`.
- `gen_machine_key_ring`: `size` (2 a 4 candidatas); `distractors` desde `detect` (la misma operación sin invertir, la inversa de la otra pareja, el orden invertido en las de dos pasos); `labeled` (falso en el nivel 3).
- `gen_non_injective_machine`: `collapse_kind` en {dos entradas simétricas, muchas entradas periódicas, aplastamiento total}, el tipo de confluencia con que la máquina junta entradas; `domain_cuts` (los recortes de entrada admisibles para cada tipo de confluencia); `seed`.

**Literacy soportada:** de `icons` a `full_text`. Los niveles 1 a 3 se juegan sin leer, pero desde el nivel 4 las máquinas llevan etiquetas y las bolas números, y desde el 6 aparece la marca escrita, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma suelta una bola, la ve salir cambiada, tira de la palanca y mete la bola de salida por la boca de salida. La escena vuelve al inicio y la palanca late. Se repite solo si el jugador se queda quieto. La demostración de doblar la grilla con dos dedos es aparte y se hace una vez, al entrar en el nivel 5. La demostración de elegir del llavero no se repite: es la del nodo 12 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
