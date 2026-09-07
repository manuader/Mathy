# 11 — El igual es una balanza (`prealg.eq.balance`)

> Locale `es`: "El igual es una balanza". Minijuego: [Los dos platos](../../F-minijuegos/prealg.eq.balance.md).

**Nodo:** `prealg.eq.balance` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` (única) · **Literacy:** `none` · **Analogía:** `balance_pans`

## 1. Concepto

Una igualdad no ordena calcular: afirma que dos lados valen lo mismo, y sobrevive exactamente a las acciones idénticas en los dos lados. Al terminar, el jugador mantiene nivelada una balanza mientras la modifica, deja sola una caja cerrada quitando lo mismo de los dos platos, y escribe `=` sabiendo qué afirma.

## 2. Prerequisitos

- `prealg.var.unknown_as_box` (nodo 10): la caja cerrada como incógnita. Se usan el cajón con marca, la letra que nació de esa marca y la balanza que allí era solo un instrumento de medición.

La arista se aparta del orden escolar, que instala el `=` en el primer año como el signo que separa la cuenta del resultado. [C0](../../C-knowledge-graph/C0-esquema.md) lo pone después de la incógnita porque recién con una caja en un plato hay motivo para conservar la igualdad en vez de consumirla.

## 3. Dificultad cognitiva real

Lo difícil no es equilibrar. Son cinco capacidades:

1. **El `=` es un estado, no una instrucción.** Quien lo lee como flecha responde `7` frente a `3 + 4 = □ + 2`: vuelca el lado izquierdo entero. Es `equals_as_operator`.
2. **La misma acción en los dos lados.** Es la única familia de movimientos que conserva la igualdad. Tocar un solo plato la rompe, y eso no es error de cuenta sino de naturaleza. Es `inverse_applied_one_side`.
3. **Dos lados distintos pueden ser iguales.** `3 + 4` y `12 − 5` se ven distintos y pesan lo mismo.
4. **La igualdad es simétrica.** La balanza leída desde el otro costado dice lo mismo, y aun así la caja a la derecha desarma a quien aprendió que lo buscado va a la izquierda.
5. **No hacer nada es una jugada.** El nivel de la barra es un hecho a conservar, no una tarea.

## 4. Problema intuitivo

Un puesto de quesos. La vendedora corta un trozo, lo pone en un plato, agrega pesas del otro hasta que la barra queda derecha y recién ahí cobra.

En `real` el jugador solo mira. En `intuition` la escena se detiene con la balanza nivelada y la mano sobre un plato. Tres desenlaces dibujados: saca una pesa de cada plato y sigue derecha; saca una de un solo plato y se inclina; pasa una pesa de un plato al otro y se inclina el doble. El jugador elige y después ve. En un segundo pase aparece el cajón del nodo 10 en un plato: cuánto pesa sin abrirlo.

## 5. Analogía del mundo real

`balance_pans`, la del YAML ([G0](../../G-analogias/G0-reglas.md)). Mapa: plato → lado de la igualdad; pesas → términos; barra nivelada → igualdad; misma acción en los dos platos → transformación de equivalencia; caja cerrada → incógnita; quitar pesas iguales de los dos → cancelar; leer la caja sola → solución.

Invariante que conserva: la barra queda nivelada si, y solo si, los dos platos reciben la misma acción.

Se rompe en `negative_weights`: una pesa no pesa menos que nada, y por eso se retira en `symbolic`. Hay una segunda ruptura que el nodo evita: multiplicar los dos platos no tiene gesto físico, así que acá solo se suma y se quita, y la llave que reparte un plato en montones llega en el 12.

Por qué esta y no otra: la cuerda tensa y el espejo dan simetría pero no dan acción. La balanza hace visible el costo de tocar un solo lado en el instante en que se lo toca.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Una sola mecánica, `balance`, que aporta a la vez la herramienta y el invariante ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Una balanza con pesas en los dos platos. Unos niveles empiezan inclinados y hay que nivelarlos; otros empiezan nivelados y hay que no inclinarlos.
2. Demostración: una mano fantasma toca una pesa del plato izquierdo y la barra se inclina; toca una igual del derecho y vuelve a quedar derecha.
3. Tocar una pesa la quita; arrastrar una desde la reserva la agrega. Cuando la barra queda derecha se traba con un clic y entre los platos se enciende una ficha que todavía no tiene forma de signo: encenderla es el objetivo de los primeros niveles.
4. Con la caja: un plato tiene el cajón del nodo 10 y pesas, el otro pesas sueltas. El jugador quita pesas de los dos platos hasta que el cajón queda solo y se abre.
5. Quitar de un solo plato inclina la barra y la caja no cede. El estado no se borra: quitando lo mismo del otro la barra vuelve. Nada se llama incorrecto.
6. Pasar una pesa de un plato al otro está permitido y es la jugada que más inclina la barra: es la única forma de sentir que son dos acciones y no una.

Lo que el nodo no permite: repartir un plato en montones iguales o duplicarlo. El gesto existe, la balanza no responde y las pesas vuelven, y esa frustración es la que hace falta el llavero del nodo 12.

## 7. Representación visual

Capa `visual`, primitiva `invariant` de [H](../../H-progresion-abstraccion.md). La balanza se estiliza en dos columnas con la barra entre ellas; las pesas se aplanan en barras proporcionales y el cajón es una barra de longitud desconocida, con el borde punteado del nodo 10.

Con cada acción a los dos lados se muestran el antes y el después uno sobre otro, con la barra nivelada iluminada en los dos: estados distintos, misma igualdad. Se desplaza lo que sale de los dos lados a la vez; se conserva el nivel de la barra. Cuando la acción va a un solo lado, solo el antes queda iluminado. Todavía no hay operaciones escritas: el igual es la barra.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Pesas → barras.** Al pasar a `visual` las pesas se aplanan y el cajón conserva su borde punteado. Es el paso `bars` de la mecánica.
2. **Barras → fichas.** Al nivelar por primera vez en `visual`, cada columna se contrae en una ficha que conserva el peso: `5`, `12`. El cajón se contrae en `x`, repitiendo el morph del nodo 10, porque un objeto no cambia de apariencia sin morph aunque el jugador ya lo haya visto.
3. **Barra → `=`.** Al primer movimiento válido sobre una balanza nivelada, los platos se desvanecen y la barra se contrae en dos trazos horizontales: la ficha sin forma termina de dibujarse ahí. Queda `x + 5 = 12` sobre una línea.
4. **La línea conserva el poder de inclinarse.** Si se aplica una ficha a un solo lado, la línea se inclina como la barra, y la balanza se pide tocando el `=`.
5. **Acción a los dos lados → dos toques.** Quitar `5` pasa a ser tocar la ficha `5` de un lado y la del otro; las dos se elevan a la vez y el renglón siguiente aparece con un morph.

## 9. Notación matemática

Nace `=`. Por la regla de oro de [H](../../H-progresion-abstraccion.md), el problema que lo hace necesario es de registro: a partir del tercer estado, dibujar una balanza por estado no entra en la pantalla. El signo es la barra vista de canto.

Con `=` llega el renglón: cada estado se escribe abajo del anterior sin borrar el de arriba, y los dos lados se escriben completos aunque uno sea un solo número, porque `12 = 12` sirve para reconocer que se terminó.

No aparece la escritura de la acción: qué hizo el jugador queda implícito en la diferencia entre renglones, y anotarla debajo de los dos lados llega en el nodo 13. Tampoco aparecen `<` ni `>`, que son de `prealg.ineq.compare_expressions`.

## 10. Definición formal

Capa `formal`: texto corto con voz y la balanza fantasma al lado. Tres frases, de a una: "Una igualdad dice que los dos lados valen lo mismo." "Si dos lados iguales reciben la misma acción, siguen iguales." "El igual no ordena calcular: afirma."

Condiciones y casos especiales, verificados sobre el objeto: quitar o agregar la misma cantidad de los dos lados conserva la igualdad; el plato vacío es cero y un lado puede estar vacío; una igualdad puede ser falsa, y entonces hay algo que reparar.

Ya jugado: las tres frases enteras. Nuevo: la palabra "igualdad" y el caso de la igualdad falsa.

## 11. Propiedades

- **Reflexiva y simétrica.** Ligadas al nivel donde los dos platos empiezan con lo mismo y se gana sin tocar nada, y al gesto de girar la balanza entera con dos dedos y ver que la barra no se mueve.
- **Transitiva.** Ligada a los niveles con dos balanzas que comparten un plato: si las dos están niveladas, los extremos se intercambian y ninguna se cae.
- **Se conserva bajo la misma acción en los dos lados.** Si `a = b`, entonces `a + c = b + c` y `a − c = b − c`. Ligada a la barra que no se mueve cuando las dos manos hacen lo mismo; multiplicar y dividir necesitan la llave y se completan en el nodo 13.
- **Las transformaciones son reversibles.** De `x = 7` se vuelve a `x + 5 = 12` agregando cinco de los dos lados. Ligada a devolver las pesas a los platos.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias balanzas con cargas distintas. Cuando aparece la ficha de igual, el jugador toca la nivelada; los distractores son inclinaciones cada vez menores.
- `explain`: tres animaciones sobre la misma balanza. En una se saca lo mismo de los dos platos y la barra sigue derecha; en otra se saca de un solo plato y se inclina; en la tercera el plato izquierdo se vuelca entero sobre el derecho, como si la barra fuera un tobogán. El jugador toca las que rompen el equilibrio, y cada distractor es una misconception que al elegirla clasifica.
- `manipulate`: arrastrar fichas sobre los dos platos hasta nivelar; la ficha de igual se enciende solo con la barra horizontal.
- `apply`: balanza nivelada con una caja de un lado. Sacar fichas de los dos platos hasta que la caja queda sola, sin inclinar la barra en ningún paso.
- `generalize`: la balanza se desvanece y quedan fichas con el igual entre ellas. La misma acción a los dos lados de la línea, con la caja a izquierda o a derecha.
- `transfer`: en el reloj modular de `disc.mod.clock_equivalence`, aplicar el mismo giro a las dos agujas y verificar que siguen marcando lo mismo.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)). Las dos declaran la mecánica `balance`, la del nodo, así que las dos explicaciones corren sobre la balanza.

- **`equals_as_operator`** (`replay_on_mechanic`). Frente a `3 + 4 = □ + 2` el jugador responde `7`: leyó el igual como flecha. El juego repite en cámara lenta cómo las fichas del plato izquierdo caen en el derecho, la barra se hunde y un halo marca el `2` ignorado. Voz: "El igual no dice qué da. Dice que los dos platos pesan lo mismo. ¿Qué había del otro lado?". El jugador nivela desde ese estado.
- **`inverse_applied_one_side`** (`replay_on_mechanic`). El jugador quita cinco de un solo plato, o en fichas pasa de `x + 5 = 12` a `x = 12`. El replay repite el gesto: cinco pesas salen del plato izquierdo, ese plato sube y un halo marca el que nadie tocó. Voz: "Sacaste 5 de un solo plato. ¿Qué le falta al otro?". La barra sigue inclinada y el jugador la nivela desde ahí. Es la de mayor severidad y la que el 13 hereda intacta.

## 13. Generalización

La analogía se retira en `symbolic`, en cuanto el jugador aplica una acción a los dos lados de la línea sin mirar los platos. Queda como fantasma a demanda hasta `formal` y desaparece con los negativos, que la contradicen.

Variantes sin ayuda visual, en orden: la caja a la derecha (`12 = x + 5`); los dos lados compuestos (`3 + 4 = x + 2`); cadenas de tres estados; igualdades falsas que hay que reparar, el único momento en que tocar un solo lado es lo correcto. Al final, acciones no aritméticas: "girar noventa grados", "pintar de azul", "agregar 🍎" sobre platos con figuras de colores. El jugador las aplica a los dos lados y verifica que la barra no se mueve: el invariante desnudo.

El nodo está en `abstract` cuando conserva igualdades con la caja de cualquier lado sin pedir la balanza, repara una igualdad falsa sabiendo por qué ahí sí toca un solo lado, y aplica el invariante a acciones que no tienen que ver con pesar.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`. Tres son de otras áreas con mecánicas nuevas; el primero es la continuación de la espina, y está en la lista porque el invariante se evalúa allí sobre un objeto nuevo.

- `alg.eq.one_step` (`balance` con `chest_key`): la misma barra, con un broche que solo abre una llave. El invariante no cambia; cambia qué acción aplicar.
- `trig.id.double_angle` (`machine_pipe`): los dos lados son dos caminos que entregan la misma salida, y transformarlos a la vez conserva la coincidencia.
- `disc.mod.clock_equivalence` (`gears_sequence`): dos engranajes de doce dientes marcan la misma hora, y girar los dos lo mismo la conserva. La igualdad es de posiciones y no de cantidades.
- `linalg.sys.row_operations` (`grid_stretch`): cada fila de una matriz es una balanza, y una operación de fila es la misma acción sobre sus dos lados.

Concepto siguiente: `prealg.inv.operation_as_key` ([12](12-prealg.inv.operation_as_key.md)). Frase puente, sobre la última balanza con la caja recién liberada: "Para dejar la caja sola sacaste lo mismo de los dos platos, y eso deshizo el más cinco. ¿Toda acción se puede deshacer así? Antes de volver a la balanza, mirá una acción sola, sin platos". La balanza se apaga y queda un cofre: el nodo 12 empieza ahí, en aritmética pura.

---

**Visualización:** dos escenas del YAML, nativas y sin texto rasterizado ([I](../../I-manim/I0-mapping.md)). `balance_equal_pans_stay_level` corre sobre la balanza del jugador, con los dos lados y sus conteos como parámetros: la barra se mantiene derecha mientras la misma acción recorre los dos platos; gramática `invariant`, con la barra nivelada resaltada en el antes y el después. Genera la animación correcta de `explain`. `balance_remove_one_side_tilts` toma además qué se quitó y de qué lado, y produce la inclinación con el plato intacto marcado; la usa el `replay_on_mechanic` de las dos misconceptions y el nodo 13 la reúsa como distractor. Las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_compare` ([M](../../M-calculadora/M0-progresion.md)), con la forma de la barra. Este nodo enciende solo la cara `=`: puesta entre dos expresiones de fichas, no las resuelve, responde si la barra queda derecha o inclinada y hacia qué lado. Las caras `<` y `>` se encienden con `prealg.ineq.compare_expressions`, que comparte el desbloqueo. Vive en el modo de exploración libre.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Se toca y se arrastra, `explain` se responde entre animaciones, el `=` es un dibujo antes que un signo y los prompts son de voz, en formas que sirven igual para tú y para vos. Un adulto llega por diagnóstico saltando `real` e `intuition`; para él, el valor está en las igualdades falsas y en las acciones no aritméticas.
