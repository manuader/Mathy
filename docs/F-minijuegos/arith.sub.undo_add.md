# Volver sobre los pasos (`arith.sub.undo_add`)

Minijuego del nodo 4 de la espina, "La resta deshace la suma". Mecánica principal `chest_key`, secundaria `gears_sequence`; analogías `walker_forward_and_back` y `chest_single_lock`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/04-arith.sub.undo_add.md): un concepto, tres dificultades reales (reconocer la vuelta exacta, elegirla sin haber visto la ida, sostener las dos lecturas de la resta) más el descubrimiento de que el orden importa, dos analogías complementarias, un gesto —arrastrar la llave y ver al caminante recorrer la vuelta de verdad—, cinco pasos de desvanecimiento, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

La pista del nodo anterior con dos piedras marcadas: en una, un cofre chico y cerrado; en otra más adelante, el caminante. Entre las dos no hay nada dibujado, porque la flecha del viaje se borró. Desde el segundo nivel hay un llavero al costado.

Mapa objeto → concepto: pasos hacia adelante → sumando; piedra de llegada → suma; pasos hacia atrás → sustraendo; volver a la piedra de partida → operación inversa; cofre → la expresión que hay que deshacer; forma de la cerradura → la operación que se hizo; forma de la llave → la operación que la deshace; girar la llave → aplicar la inversa; cofre abierto → haber vuelto al punto de partida; llavero → conjunto de vueltas disponibles; tramo entre dos caminantes → diferencia como distancia.

La pista aporta "cuánto hay que volver"; el cofre, que la vuelta es una cosa que se elige antes de actuar y no una corrección que se hace de a poco. Punto de ruptura de la pista: `walking_past_start`, la orilla, que hace que invertir el orden no dé un número sino una imposibilidad; lo arregla `arith.int.negatives`. Punto de ruptura del cofre: una cerradura con dos llaves, lejísimos de acá ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la pista en el centro, el cofre sobre su piedra, la manivela abajo, el llavero al costado desde el nivel 2 y el diagrama vertical junto a la línea desde `visual`. Gestos: `drag`, `scrub` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela hacia atrás.** El caminante retrocede piedra por piedra con el clic de siempre y la huella de la ida se enciende a medida que la pisa de vuelta.
- **Llegar al cofre.** La tapa se levanta sola y adentro está la ficha del avance original, que hasta ese momento el jugador no conocía.
- **Quedarse a un paso.** La tapa se levanta un poco y vuelve a bajar. El estado se conserva y queda un giro.
- **Pasarse.** El cofre queda detrás sin moverse y la huella muestra que el caminante pasó por encima de su piedra.
- **Arrastrar una llave sobre el caminante.** La llave lleva su forma —tres muescas, tres pasos— y al soltarla el caminante recorre esa cantidad hacia atrás de corrido, caminando y no teletransportándose. Si la llave no era la que corresponde, el recorrido se hace igual y el caminante queda donde queda: volver mal sigue siendo un lugar válido de la pista. El llavero sigue disponible.
- **Tocar el cofre abierto.** El caminante vuelve a lanzarse hacia adelante esa misma cantidad y termina donde estaba al empezar. Es la verificación, y deja la ida y la vuelta dibujadas una sobre otra.
- **Medir entre dos caminantes.** En los niveles de distancia no hay cofre: hay dos caminantes y una regla de fichas. Arrastrar la ficha correcta ilumina el tramo entre ellos.

En `symbolic` la superficie cambia de forma, no de reglas: soltar una ficha `− 3` sobre el renglón es hacer el recorrido de vuelta; el renglón de la resta aparece con el de la suma encima, compartiendo ids, y tocar uno ilumina el otro. La línea y el diagrama vertical se piden con un toque.

## Invariante matemático

Dos invariantes, uno por mecánica.

`inverse_restores_original` (`chest_key`): la vuelta devuelve exactamente lo que había, y hay una sola que lo hace. Se ve confirmarse en la tapa que se abre y en la verificación, donde ida y vuelta se funden en un punto. Se ve romperse en la tapa que se levanta y vuelve a bajar: el caminante está cerca y cerca no alcanza.

`same_step_every_turn` (`gears_sequence`): el paso de vuelta mide lo mismo que el de ida, y por eso las dos flechas son comparables. Sin este invariante "volver tres" no diría nada.

Un tercer hecho, que no es de ninguna de las dos mecánicas y que el minijuego cuida: **el orden no se puede cambiar**. Pedir la vuelta desde una piedra más chica que el paso deja al caminante sin piedra donde caer, con la orilla adelante y vacía. No es un error: es algo que todavía no existe, y el juego lo deja así.

Un movimiento válido pero inútil —volver cero, ir y venir lo mismo dos veces— no rompe nada y recibe un empujón suave.

## Representación visual

Primitiva dominante `invert`, de apoyo `displace` ([H](../H-progresion-abstraccion.md)).

- `real`: alguien movió al caminante mientras nadie miraba y el cofre quedó en la piedra de donde salió. Solo se mira.
- `intuition`: la manivela empieza a girar hacia atrás y hay tres desenlaces dibujados —pisa la piedra del cofre y se abre, se queda una antes, se pasa una—. En una variante, dos cofres a distinta distancia y una sola tarjeta.
- `concrete`: pista de piedras, cofre con cerradura de forma, llaves con muescas, manivela. Nada escrito.
- `visual`: marcas sobre una línea, la vuelta como flecha del mismo largo y sentido contrario dibujada sobre la de ida, y las dos fundiéndose en un punto con un pellizco. Al costado, el cofre desplegado en el diagrama vertical: piedra de salida arriba, flecha hacia abajo con la forma de la cerradura, piedra de llegada abajo, y la llave como la misma flecha hacia arriba.
- `symbolic`: fichas `10`, `− 3`, `7` sobre un renglón, con `7 + 3 = 10` encima compartiendo ids.
- `formal`: las tres frases cortas con voz y la línea fantasma al lado.
- `abstract`: deshacer sobre objetos que no son números, sin línea ni cofre.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cofre → cofre con forma: al abrirlo por primera vez, la cerradura muestra su forma y la ficha que sale de adentro, `+ 3`, se apoya sobre ella.
2. Vuelta → flecha hacia atrás: en la primera verificación en `visual`, el camino de vuelta se afina en una flecha de sentido contrario, del mismo largo, dibujada sobre la de ida.
3. Flecha hacia atrás → ficha `− 3`: al arrastrarla y soltarla en otro punto de la línea se afina hasta ser ficha y el signo aparece pegado al número. Es el mismo gesto que hizo nacer el `+`, con el tramo apuntando al otro lado.
4. Cofre → diagrama vertical: cuando el jugador elige una llave en vez de girar, el cofre se despliega hacia arriba en dos piedras y dos flechas, y la llave se vuelve la flecha de vuelta etiquetada.
5. Renglón: al soltar la ficha sobre el renglón aparece `10 − 3 = 7` con `7 + 3 = 10` encima. Tocar cualquiera ilumina los dos.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la línea fantasma: restar es volver, restar tres es dar tres pasos hacia atrás; la resta deshace la suma, así que avanzar y volver lo mismo deja al caminante donde estaba; restar dos números dice cuánto los separa. Propiedades: la vuelta es única, restar cero no mueve, restar todo devuelve a la salida, y el orden importa —`a − b` y `b − a` no son lo mismo—, que es la primera vez que dos operaciones parecidas no se comportan igual.

Símbolo nuevo: `−`, y uno solo. Nace porque, con llaves de los dos tipos en el llavero, un número solo ya no alcanza para decir hacia dónde se va. La convención que el nodo agrega es que la misma cuenta se escribe igual sirva para volver o para medir: `10 − 3` es la vuelta desde el diez y también lo que separa al tres del diez, y que sean la misma es un descubrimiento y no una definición.

Caso que el nodo deja abierto: la vuelta más larga que la ida, que no tiene piedra donde caer. Es de `arith.int.negatives`.

Entradas de cheatsheet al alcanzar `symbolic` por primera vez: `cs.arith.sub_undoes_add`, con las dos flechas fundiéndose en un punto, y `cs.arith.sub_as_distance_between`, con el tramo iluminado entre los dos caminantes ([R](../R-cheatsheet/R0-cheatsheet.md)).

## Generalización

La pista de piedras ya se retiró en `visual`, heredada del nodo 2. El cofre y la línea con flechas se retiran en `symbolic`, cuando la ficha se aplica sin mirar ninguno de los dos, y quedan como fantasmas a demanda hasta `formal`: el cofre porque representa estructura, la línea porque en los ítems de distancia sigue siendo la regla con la que se mide.

Variantes sin ayuda visual: restas con la ida borrada, donde solo se conocen las dos piedras; el hueco en el sustraendo (`10 − □ = 7`); el hueco en el minuendo (`□ − 3 = 7`), que se resuelve deshaciendo la resta y es la primera vez que el jugador aplica la vuelta de la vuelta; idas y vueltas mezcladas en la misma tanda sin aviso. Después, deshacer sobre objetos que no son números: girar dos marcas de un dial hacia el otro lado, correr dos lugares atrás en una fila, retirar dos piezas de una torre. Cuando el jugador nombra la vuelta en cualquiera de esos casos sin pedir línea ni cofre, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): sus niveles 1 y 2 corresponden a este nodo, con un recorte. El nivel 1 —cofre y llave que se emparejan por forma, y probar es gratis— se juega entero acá y es el nivel 2 de este minijuego. Del nivel 2 —los colores son transformaciones y la llave hace lo contrario— se juega la mitad de sumar y restar; la mitad de triplicar y partir en tres es de `arith.div.undo_mul`, y la formalización de que toda transformación reversible tiene su llave es de `prealg.inv.operation_as_key`. Del nivel 3 en adelante no hay nada de este nodo.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Volver hasta el cofre.** `concrete`, `manipulate`. Un solo cofre, sin llavero, girando la manivela hacia atrás. La ida está dibujada y visible. La demostración se muestra acá.
2. **Elegir la llave.** `concrete`, `recognize` y `manipulate`. Aparece el llavero con tres llaves de formas distintas. La ida sigue visible.
3. **La ida se borró.** `concrete`, `apply`. Solo se conocen las dos piedras y hay que leer la diferencia antes de elegir. Rango numérico igual.
4. **Flechas y diagrama.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; la vuelta se vuelve flecha, el cofre se despliega en el diagrama vertical y aparecen las dos animaciones del paso de más.
5. **Cuánto los separa.** `visual`, `apply`. Sin cofre: dos caminantes y la regla de fichas. Es la segunda lectura de la resta y la primera vez que la operación no deshace nada.
6. **El renglón al lado.** `symbolic`, `manipulate` y `apply`. La expresión aparece junto a la línea y se transforma en sincronía, con el renglón de la suma encima. Parámetros: rango numérico mayor y el hueco en cualquiera de las tres posiciones, incluido el minuendo.
7. **Vueltas que no son números.** `formal` y `abstract`, `generalize`. Definición corta con voz; deshacer giros de dial, lugares en una fila y piezas de una torre, con idas y vueltas mezcladas.

Qué endurece cada parámetro: borrar la flecha de ida convierte el rebobinado en cálculo; el rango numérico impide contar de a un paso; el hueco en el sustraendo obliga a leer la expresión; el hueco en el minuendo pide deshacer la resta, que es la vuelta de la vuelta; mezclar idas y vueltas sin aviso impide resolver por rutina; quitar los números deja solo la estructura.

Desafíos de olimpíada: ninguno de [S](../S-desafios/S0-desafios.md) requiere este nodo hoy. El nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: el caminante acaba de avanzar y está en la piedra `9`; el cofre está en la `4`. Tres llaves: `− 5`, `− 4`, `+ 5`. Tocar `− 5`.
- `explain`: `12 − 4` en dos animaciones. En una el caminante vuelve cuatro y pisa la piedra del cofre; en la otra vuelve cinco y la pisa de largo. Tocar la que no deshace el viaje.
- `manipulate`: caminante en la `8`, cofre en la `3`. Girar la manivela hacia atrás hasta que la tapa se levante, corrigiendo en los dos sentidos si hace falta.
- `apply`: dos caminantes, uno en la `3` y otro en la `11`, sin cofre. Arrastrar la ficha `8` a la regla. Contra el tiempo objetivo del nodo.
- `generalize`: sin línea, `□ − 6 = 9` y después `15 − □ = 9`. Y un dial que giró dos marcas: tocar la ficha que lo devuelve, sin que el número esté escrito en ningún lado.
- `transfer`: en la grilla estirada de `linalg.vec.vector_as_displacement`, aplicar la transformación que devuelve la figura a su lugar. También en `geom.trans.undo_transformation` (una figura trasladada) y, mucho más tarde, en `calc1.ftc.integral_undoes_derivative`.

**Misconceptions esperadas:** ninguna. El nodo declara `misconceptions: []` y la decisión es deliberada. Elegir mal la vuelta es el error central de este minijuego, pero acá todavía no es una regla aplicada fuera de su dominio: es una diferencia mal leída sobre una pista dibujada a la vista, que el jugador corrige mirando. La entrada catalogada de ese error, `wrong_inverse_choice`, nace en `prealg.inv.operation_as_key`, donde la operación ya no está dibujada y hay que elegir por la forma de la cerradura. Lo mismo con invertir el orden, que acá no produce una respuesta sino una imposibilidad física ([L0](../L-modelo-errores/L0-taxonomia.md)). Cada desvío tiene su consecuencia y la interacción no se corta:

- quedarse a un paso: la tapa se levanta un poco y vuelve a bajar;
- pasarse: el cofre queda detrás y la huella muestra el recorrido completo;
- llave equivocada: el caminante hace el recorrido igual y queda donde queda; nada se traba;
- elegir avanzar donde había que volver: las dos flechas se apilan del mismo lado en vez de fundirse, y el cofre queda más lejos;
- invertir el orden: el caminante se queda en la última piedra con la orilla adelante y vacía;
- medir contando una piedra de más: el tramo iluminado y la ficha elegida se muestran uno sobre otro y sobra una marca.

Sí queda vigilada `equals_as_operator`, catalogada en el nodo 3: el renglón de la resta le da una superficie nueva y `12 − 4 = □ − 2` es donde más aparece. Los distractores de `recognize` y `explain` se generan de esos desvíos —una piedra a cada lado, la llave que avanza en vez de volver— y de la regla `detect` de esa misconception.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_step_back_undoes_step`, nativa. El caminante retrocede piedra por piedra, la huella de la ida se enciende a medida que la pisa y el cofre se abre al llegar; gramática `invert`, parametrizada por la posición de salida y el paso. Produce también las dos animaciones de `explain`, porque el paso de más es un parámetro suyo.
- `gear_walk_back_same_count`, nativa. La ida y la vuelta se dibujan una sobre otra, con la misma longitud y sentidos opuestos, y se funden en un punto; gramática `invert` sobre `displace`. Es la imagen de cheatsheet de `cs.arith.sub_undoes_add`.
- Reusadas: `gear_step_forward_adds` (nodo 3) para la verificación al tocar el cofre abierto, y `gear_track_numbers_in_order` (nodo 2) para las variantes con la pista sin fichas.
- El catálogo de I declara además `chest_scene_key_intro`, un clip pre-renderizado que este nodo comparte con `prealg.inv.operation_as_key`; abre el nivel 2, el del llavero. No está listado en el campo `manim` del nodo.
- Ninguna lleva texto rasterizado: los dígitos y el operador los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_walk_and_return`: `start_range`, que nunca deja al caminante a menos pasos de la orilla que el tamaño de la vuelta; `step_range` (chico hasta el nivel 5, mayor en el 6); `outbound_visible` (verdadero en los niveles 1 y 2, falso desde el 3); `unknown_slot` en {resultado, sustraendo, minuendo}, con los dos últimos desde el nivel 6; `mixed_direction`, que intercala cofres que se abren avanzando, desde el nivel 7; `seed`.
- `gen_step_key_ring`: `size` (3 a 4 llaves); `distractors` a una piedra de distancia hacia cada lado, más la llave que avanza en vez de volver; `labeled` (falso en el nivel 2, verdadero desde el 4); `seed`.
- `gen_gap_between`: `pos_a`; `pos_b`; `ruler_offset_distractor`, que produce la opción de contar una piedra de más; `seed`. Sostiene el nivel 5.
- `gen_reversible_action`: acciones no aritméticas con vuelta única —girar un dial, correr lugares en una fila, apilar y retirar piezas— con una acción sin vuelta por instancia. Solo en el nivel 7.

**Literacy soportada:** de `none` a `full_text`, con mínimo `none`. Las llaves se distinguen por forma antes que por etiqueta y no llevan número hasta el nivel 4; la meta es un cofre que se abre y no una consigna; `explain` se resuelve entre animaciones ([Q](../Q-edad-universal.md)). En `symbolic` no hay escritura: se arrastran fichas. En `full_text` la definición corta del nivel 7 se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela hacia atrás; el caminante retrocede con el clic de siempre, la huella se enciende y el cofre se abre. La escena vuelve al inicio y la manivela late. El gesto de girar no se vuelve a demostrar: es el del nodo 2. Sí tienen demostración propia arrastrar una llave sobre el caminante, en el nivel 2, y arrastrar una ficha a la regla, en el nivel 5. La demostración de la llave no se repite en los nodos 6, 12 y 13: es la misma llave y el mismo cofre.

**Sin constantes propias.** Tiempo objetivo, factor de perfiles sin lectura, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
