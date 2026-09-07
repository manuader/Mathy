# 04 — La resta deshace la suma (`arith.sub.undo_add`)

> Locale `es`: "La resta deshace la suma". Minijuego: [Volver sobre los pasos](../../F-minijuegos/arith.sub.undo_add.md).

**Nodo:** `arith.sub.undo_add` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundaria `gears_sequence`) · **Literacy:** `none` · **Analogía:** `walker_forward_and_back` (con `chest_single_lock` para el cofre) · **Capas:** las ocho (el YAML no acota `layers`)

## 1. Concepto

Restar es volver: si avanzar tres llevó al caminante de una piedra a otra, retroceder tres lo devuelve exactamente a la de salida y a ninguna otra. Al terminar, el jugador elige cuántos pasos hay que volver para deshacer un avance que él no hizo, sabe que hay una sola respuesta, y usa esa misma cuenta para medir cuánto separa a dos caminantes que están parados en piedras distintas. Antes sabía avanzar y corregirse girando al revés; no sabía que esa corrección era una operación con nombre propio.

## 2. Prerequisitos

- `arith.add.displacement` (nodo 3): la suma como desplazamiento. Se usa entero: la flecha etiquetada que se arrastra sin cambiar de tamaño, la ficha `+ 3`, el renglón con el igual, el libro de cuentas y la propiedad que quedó abierta allá —que sumar es reversible y esa vuelta todavía no tenía nombre—. `equals_as_operator` viene catalogada de allí y sigue vigilada acá.

Es la única arista, y no sigue el orden escolar, donde la resta se presenta como "quitar de un montón". Quitar es una lectura legítima y el libro de cuentas la sostiene, pero no genera estructura: no explica por qué la resta deshace la suma ni por qué sirve para medir una distancia. [C0](../../C-knowledge-graph/C0-esquema.md) elige la vuelta porque es la que reaparece en `arith.div.undo_mul`, en `prealg.inv.operation_as_key` y, veinticinco nodos después, en el teorema fundamental del cálculo.

## 3. Dificultad cognitiva real

Lo difícil no es contar hacia atrás. Son tres capacidades:

1. **Reconocer la vuelta exacta.** Deshacer no es acercarse: es volver al punto de partida, ni una piedra antes ni una después. La cantidad de pasos de vuelta está determinada por el avance, y esa unicidad es el invariante `inverse_restores_original` de `chest_key`.
2. **Elegir la vuelta sin haber visto la ida.** Mientras el jugador recuerda el avance, deshacerlo es memoria. La capacidad aparece cuando la flecha de ida ya se borró y solo quedan las dos piedras: ahí la resta deja de ser un rebobinado y se vuelve un cálculo.
3. **Sostener las dos lecturas.** `10 − 3` es "volver tres desde el diez" y también "cuánto hay entre el tres y el diez": la misma cuenta, dos preguntas. La segunda es la de `cs.arith.sub_as_distance_between` y la que sostiene la comparación numérica.

Hay una cuarta cosa que el nodo enseña por contraste: **el orden importa**. La suma dejaba llegar al mismo lugar en cualquier orden; la resta no, y quien intenta `3 − 10` se queda sin piedra donde caer. Es la primera operación no conmutativa de la espina y el primer borde real de la analogía.

## 4. Problema intuitivo

La misma pista y las dos piedras con las que terminó el nodo 3: la de salida, marcada con un contorno, y la de llegada, con el caminante encima. Entre las dos no hay nada dibujado porque la flecha del viaje ya se borró. Sobre la piedra del contorno hay ahora un cofre chico y cerrado, que solo se abre si el caminante vuelve a pisarla. La manivela sigue abajo, girando en los dos sentidos.

En `intuition` el juego se detiene con la manivela empezando a girar hacia atrás y ofrece tres desenlaces dibujados: el caminante pisa la piedra del cofre y se abre; se queda una piedra antes y no cede; se pasa una y tampoco. El jugador elige y después ve. En una variante hay dos cofres a distinta distancia y la pregunta es cuál se abre con las vueltas que muestra la tarjeta.

## 5. Analogía del mundo real

Dos analogías visten el nodo, una por capacidad ([G0](../../G-analogias/G0-reglas.md)).

`walker_forward_and_back` es la del YAML y está declarada sobre `slope_walker`; acá corre sobre `gears_sequence`, la mecánica que mueve al caminante en toda esta rama. Mapa: los pasos hacia adelante son el sumando; la piedra de llegada, la suma; los pasos hacia atrás, el sustraendo; volver al punto de partida, la operación inversa; dos saltos en cualquier orden, la conmutatividad que el nodo 3 ya usó; saltos iguales repetidos, el conteo salteado, que este nodo deja plantado para el 5. El invariante es que la ida y la vuelta miden lo mismo cuando el caminante termina donde empezó. Se rompe en `walking_past_start`: más allá de la orilla no hay piedras, y eso lo arregla `arith.int.negatives`. Se retira en `symbolic`.

`chest_single_lock` aporta el cofre, y con él la idea de que la vuelta es una cosa que se elige y no una corrección que se hace de a poco. Mapa: cofre → expresión; forma de la cerradura → operación que hay que deshacer; forma de la llave → operación inversa; llave que no gira → no inversa; girar la llave → aplicar la inversa; cofre abierto → haber vuelto al punto de partida; llavero → conjunto de vueltas disponibles. Ruptura: `two_branches_of_sqrt`, lejísimos de acá.

Cómo conviven: el cofre está apoyado en la piedra de salida y su cerradura tiene la forma del avance que se hizo. El caminante puede volver de a un paso girando la manivela, o tomar la llave correcta y aplicarla de una vez. Lo primero es corregirse; lo segundo es restar.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `chest_key` es la principal y provee el objetivo y el juicio —el cofre se abre o no se abre—; `gears_sequence` es la secundaria y provee el movimiento, con el paso uniforme que hace comparable la ida con la vuelta ([E0](../../E-mecanicas/E0-catalogo.md)). Se encuentran en un gesto: arrastrar la llave sobre el caminante hace girar la manivela hacia atrás tantas vueltas como dice la llave, y el caminante recorre el camino de verdad en vez de teletransportarse. Gestos: `drag`, `scrub` y `tap`.

1. Pista, cofre cerrado en una piedra, caminante en otra más adelante, manivela abajo y, desde el segundo nivel, un llavero con tres o cuatro llaves de formas distintas.
2. Demostración: la mano fantasma gira la manivela hacia atrás. El caminante retrocede piedra por piedra con el mismo clic de siempre, la huella de la ida se enciende a medida que la pisa de vuelta y, al llegar al cofre, la tapa se levanta sola. La escena vuelve al inicio y la manivela late ([Q](../../Q-edad-universal.md)).
3. El jugador gira hacia atrás. Si se queda una piedra antes, la tapa se mueve un poco y vuelve a bajar; le queda un paso y el estado se conserva. Si se pasa, el cofre queda detrás y la tapa ni se mueve.
4. Con el llavero: arrastra una llave sobre el caminante. La llave lleva su forma —tres muescas para tres pasos— y al soltarla el caminante recorre esa cantidad hacia atrás, de corrido. Si no era la que corresponde, el recorrido se hace igual y el caminante queda donde queda: nada se traba, porque volver mal sigue siendo un lugar válido de la pista.
5. Éxito: el cofre se abre cuando el caminante lo pisa. Adentro está la ficha del avance original, que hasta ese momento no se conocía.
6. Verificación: tocar el cofre abierto relanza al caminante hacia adelante esa misma cantidad y termina donde estaba al empezar. La ida y la vuelta quedan dibujadas una sobre otra, misma longitud y sentidos opuestos.
7. Dos caminantes: en los niveles de distancia no hay cofre, sino dos caminantes en piedras distintas y una regla de fichas al costado. Arrastrar la ficha correcta ilumina el tramo entre ellos.

Nada se llama "incorrecto". Cada desvío tiene su consecuencia física, en la sección 12.

## 7. Representación visual

Capa `visual`, con `invert` dominante y `displace` de apoyo ([H](../../H-progresion-abstraccion.md)).

`invert`. El cofre se convierte en el diagrama vertical: arriba la piedra de salida, una flecha hacia abajo con la forma de la cerradura, abajo la piedra de llegada. La llave es esa misma flecha reproducida hacia arriba, y solo encaja si devuelve exactamente a la piedra de arriba. Lo que se conserva es el extremo superior: cualquier par de flechas que empiece y termine ahí es una ida con su vuelta.

`displace`. Sobre la línea, la vuelta es una flecha del mismo largo que la de ida y de sentido contrario, dibujada encima. Las dos se pellizcan y se funden en un punto: eso es volver al mismo lugar, y es la forma visual de `(a + b) − b = a`. En los niveles de distancia hay una sola flecha, tendida entre los dos caminantes y medida contra las marcas.

Todavía no hay flechas que crucen la orilla ni piedras a su izquierda: la vuelta más larga que la ida existe en pantalla como imposibilidad, no como número.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Cofre → cofre con forma.** Al abrirlo por primera vez en `concrete`, la cerradura muestra su forma y la ficha que sale de adentro se apoya sobre ella: la cerradura era `+ 3`, la ficha del nodo 3.
2. **Vuelta → flecha hacia atrás.** En la primera verificación en `visual`, el camino de vuelta se afina en una flecha del mismo largo y sentido contrario, dibujada sobre la de ida.
3. **Flecha hacia atrás → ficha `− 3`.** Al arrastrarla y soltarla en otro punto de la línea se afina hasta ser ficha y el signo aparece pegado al número. Es el gesto que hizo nacer al `+`, con el tramo apuntando al otro lado.
4. **Cofre → diagrama vertical.** Cuando el jugador elige una llave en vez de girar, el cofre se despliega hacia arriba en dos piedras y dos flechas, y la llave se vuelve la flecha de vuelta etiquetada.
5. **Renglón.** Al soltar la ficha aparece `10 − 3 = 7` y, encima y compartiendo ids, `7 + 3 = 10`. Tocar cualquiera ilumina los dos: son la misma pareja de piedras leída en los dos sentidos.

En `formal` la línea y el diagrama se piden con un toque; en `abstract` no hay ninguno.

## 9. Notación matemática

Queda `10 − 3 = 7`, con `7 + 3 = 10` disponible encima y el diagrama vertical a demanda.

**El símbolo que este nodo introduce es `−`.** El problema que lo hace necesario es el del nodo 3 con un giro: una vez que la vuelta se puede elegir antes de hacerla, hay que nombrarla sin dibujar la flecha y, sobre todo, distinguirla del avance. Una flecha dibujada muestra su sentido; una ficha con un número solo, no. El signo es lo mínimo que separa "avanzar tres" de "volver tres", y hace falta en el momento exacto en que el llavero tiene llaves de los dos tipos.

El nodo aporta además una **convención de escritura**: la misma cuenta se escribe igual sirva para volver o para medir. `10 − 3` es la vuelta desde el diez y también lo que separa al tres del diez, y el juego no usa dos notaciones para las dos preguntas. Que sean la misma es un descubrimiento, no una definición, y por eso las dos entradas de cheatsheet se agregan juntas al alcanzar `symbolic` ([R](../../R-cheatsheet/R0-cheatsheet.md)): `cs.arith.sub_undoes_add`, con las flechas fundiéndose en un punto, y `cs.arith.sub_as_distance_between`, con el tramo iluminado entre los dos caminantes.

## 10. Definición formal

Capa `formal`: texto corto con voz y la línea al lado, tres frases de a una. "Restar es volver: restar tres es dar tres pasos hacia atrás." "La resta deshace la suma: si avanzás y después volvés lo mismo, quedás donde estabas." "Restar dos números dice cuánto los separa."

Condiciones y casos especiales, verificados sobre el objeto: volver cero deja al caminante donde está; volver todo lo avanzado lo deja en la salida, y esa es la única vuelta que abre el cofre; el orden **no** se puede cambiar, y el juego lo muestra intentándolo, porque pedir la vuelta desde una piedra más chica que el paso deja al caminante sin piedra donde caer. Ese caso es de `arith.int.negatives`.

Ya jugado: las tres frases enteras, en `concrete`. Nuevo: la palabra "diferencia" y el hecho enunciado de que el orden importa, con el que hasta ahora el jugador solo había chocado.

## 11. Propiedades

- **La vuelta deshace la ida.** `(a + b) − b = a`. Ligada a las dos flechas que se funden en un punto y al cofre que se abre solo cuando el caminante pisa su piedra.
- **La vuelta es única.** Ninguna otra cantidad de pasos abre el cofre. Ligada a la tapa que se levanta un poco y vuelve a bajar.
- **Restar cero no mueve; restar todo devuelve a la salida.** `a − 0 = a`, `a − a = 0`. Ligada a la flecha de longitud cero y a la que cubre el tramo entero.
- **El orden importa.** `a − b` y `b − a` no son lo mismo. Ligada al caminante que se queda sin piedra: es la primera vez que dos operaciones parecidas no se comportan igual.
- **La resta mide cuánto separa.** Ligada al tramo iluminado entre dos caminantes, que mide lo mismo recorrido desde cualquiera de los dos extremos.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), a partir de las probes del locale.

- `recognize`: el caminante acaba de avanzar y hay tres llaves con números. Tocar la que lo devuelve exactamente a la piedra de salida. Los distractores caen a una piedra de cada lado, más la llave que avanza en vez de volver.
- `explain`: dos animaciones sobre la misma pista. En una el caminante vuelve sobre sus pasos y pisa la piedra de partida; en la otra vuelve con un paso de más y la pisa de largo. Tocar la que no deshace el viaje.
- `manipulate`: girar la manivela hacia atrás hasta que el cofre se abre. Cede solo cuando los pasos de vuelta igualan a los de ida, y se corrige en los dos sentidos sin perder el estado.
- `apply`: dos caminantes en piedras distintas y ningún cofre. Arrastrar la ficha que dice cuántos pasos los separan, midiendo con la pista, contra el tiempo objetivo del nodo.
- `generalize`: con la pista sin dibujos, elegir entre fichas de resta y de suma la que abre cada cofre. Algunos se abren volviendo y otros avanzando, porque el caminante quedó del otro lado.
- `transfer`: en la grilla estirada de `linalg.vec.vector_as_displacement`, aplicar la transformación que devuelve la figura a su lugar. El objeto ya no es un caminante y la vuelta sigue siendo única.

**Misconceptions.** El nodo declara `misconceptions: []`, y la lista vacía es una decisión. Elegir mal la vuelta es el error central de acá, pero todavía no es una regla aplicada fuera de su dominio: es una diferencia mal leída sobre una pista dibujada a la vista, que el jugador corrige mirando. La entrada catalogada de ese error, `wrong_inverse_choice`, nace en `prealg.inv.operation_as_key`, donde la operación ya no está dibujada y hay que elegir por la forma de la cerradura: recién ahí hay una regla equivocada que reproducir. Lo mismo con invertir el orden, que acá no produce una respuesta sino una imposibilidad física y en `arith.int.negatives` pasa a producir un número.

Los errores esperados se describen como consecuencias físicas de la mecánica y ninguno dispara un patrón de explicación. Quedarse a un paso: la tapa se levanta un poco y vuelve a bajar. Pasarse: el cofre queda detrás sin moverse y la huella muestra que el caminante pisó de largo su piedra. Volver con la llave equivocada: el recorrido se hace igual y el caminante termina donde termine, con el llavero todavía ahí. Elegir avanzar donde había que volver: las dos flechas se apilan del mismo lado en vez de fundirse y el cofre queda más lejos. Invertir el orden: el caminante camina hacia la orilla y se queda sin piedra donde caer, con la orilla adelante y vacía; no hay respuesta que dar porque hay algo que todavía no existe. Medir contando una piedra de más —el desvío del nodo 2 trasladado al tramo—: el tramo iluminado y la ficha elegida se muestran uno sobre otro y sobra una marca.

La misconception que sí sigue vigilada es `equals_as_operator`, catalogada en el nodo 3: el renglón de la resta le da una superficie nueva, y `12 − 4 = □ − 2` es donde más aparece.

## 13. Generalización

La analogía se retira en dos tiempos. La pista de piedras ya se fue en `visual`, heredada del nodo 2. El cofre y la línea con flechas se retiran en `symbolic`, cuando la ficha `− 3` se aplica sin mirar ninguno de los dos, y quedan como fantasmas a demanda hasta `formal`: el cofre porque representa estructura, la línea porque en los ítems de distancia sigue siendo la regla con la que se mide.

Variantes sin ayuda visual, en orden: restas con la ida borrada, donde solo se conocen las dos piedras; el hueco en el sustraendo (`10 − □ = 7`), que obliga a leer la expresión; el hueco en el minuendo (`□ − 3 = 7`), que se resuelve deshaciendo la resta y es la primera vez que el jugador aplica la vuelta de la vuelta; y la mezcla de idas y vueltas sin aviso. Después, deshacer sobre objetos que no son números: girar dos marcas de un dial hacia el otro lado, correr dos lugares atrás en una fila, retirar dos piezas de una torre. En cada caso el jugador nombra la vuelta y comprueba que hay una sola.

El nodo está en `abstract` cuando resuelve todo eso sin pedir línea ni cofre, completa el hueco en cualquiera de las tres posiciones y reconoce la vuelta de una acción que nunca vio dibujada como número. La forma completa de esa capa no está en `arith`: está en `prealg.inv.operation_as_key`, adonde este nodo apunta.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otra área y con una mecánica que no fue la de aprender:

- `geom.trans.undo_transformation` (`construct` sobre una figura): una figura fue trasladada y hay que devolverla; el desplazamiento inverso tiene la misma longitud y el sentido opuesto.
- `linalg.vec.vector_as_displacement` (`gears_sequence` con dos manivelas): la vuelta es la flecha dada vuelta, y en el plano se ve que hay una sola que cierra el recorrido.
- `calc1.ftc.integral_undoes_derivative` (`slope_walker` con `fill_accumulate`): la misma estructura veinticinco nodos después. Lo que se acumuló se deshace midiendo cuán rápido cambia, y el jugador reconoce la forma antes de entender la demostración.

**La semilla.** Este nodo es la primera vez que el juego pide deshacer, y lo pide sobre una sola operación con la ida dibujada al lado. Lo que queda plantado es más grande que la resta: deshacer es una acción que se puede *elegir antes de actuar*, y para cada acción hay exactamente una que la anula. `prealg.inv.operation_as_key` toma esa idea, la separa de la aritmética y la convierte en el objeto de trabajo de toda el área de álgebra. Acá no hace falta nombrarla: alcanza con haber sentido muchas veces que la vuelta correcta es una sola y que se decide antes del primer paso.

Concepto siguiente: `arith.mul.scaling` ([05](05-arith.mul.scaling.md)). Frase puente, narrada sobre la pista con la ida y la vuelta todavía dibujadas: "Volviste tantos pasos como diste, de a uno. Ahora la manivela viene enganchada a otra: una vuelta mueve al caminante tres piedras en vez de una, y el tramo entero se estira sin dejar de ser un tramo. ¿Cuánto mide ahora?". El tren de engranajes 1:3 se acopla y es la puerta de entrada del nodo 5, que en `real` lo presenta con su propia piel de banda elástica y baldosas. La sucesión es narrativa y no de prerequisitos: el nodo 5 cuelga del 3, igual que este, y los dos se pueden jugar en cualquier orden. Lo que este nodo le deja son los saltos iguales repetidos que el mapa de `walker_forward_and_back` llama conteo salteado.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `chest_step_back_undoes_step` es nativa y se dibuja sobre el estado del jugador: el caminante retrocede piedra por piedra, la huella de la ida se enciende a medida que la pisa y el cofre se abre al llegar; gramática `invert`, parametrizada por la posición de salida y el paso. Produce también las dos animaciones de `explain`, porque el paso de más es un parámetro suyo. `gear_walk_back_same_count` también es nativa: la ida y la vuelta se dibujan una sobre otra, misma longitud y sentidos opuestos, y se funden en un punto; es la imagen de cheatsheet de `cs.arith.sub_undoes_add`. Se reúsan `gear_step_forward_adds` (nodo 3) para la verificación y `gear_track_numbers_in_order` (nodo 2) para las variantes sin fichas. El catálogo de I declara además `chest_scene_key_intro`, un clip pre-renderizado que este nodo comparte con `prealg.inv.operation_as_key` y que abre el nivel del llavero; no está listado en el campo `manim` del nodo. Ninguna lleva texto rasterizado: los dígitos y el operador los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_sub`, que completa la primera pareja de la fila `t0` junto a `op_add` ([M](../../M-calculadora/M0-progresion.md)). No devuelve solo la diferencia: anima el recorrido hacia atrás sobre la misma pista donde se aprendió y después escribe el renglón. Sostener la tecla la lee en voz: es la vuelta de la de sumar. Si el nodo decae, la tecla muestra óxido y sigue funcionando.

**Edad universal:** el nodo declara `literacy: none`, igual que el 3 y por la misma razón: el `−` es un ícono con historia, y el jugador lo vio nacer del gesto de dar vuelta una flecha ([Q](../../Q-edad-universal.md), [H](../../H-progresion-abstraccion.md)). Se juega entero sin leer: las llaves se distinguen por forma antes que por etiqueta, la meta es un cofre que se abre y no una consigna, `explain` se resuelve entre animaciones y la definición corta de `formal` va siempre con voz. En `symbolic` se arrastran fichas; no hay escritura. El cofre y la llave son los mismos íconos de los nodos 6, 12 y 13, y por eso su forma no se reusa para nada más. Un adulto llega por diagnóstico saltando `real` e `intuition`. Speed se mide sin cuenta regresiva, con el factor de perfiles sin lectura de [K](../../K-evaluacion.md).
