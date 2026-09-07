# 35 — Condicional e independencia (`prob.cond.conditional_and_independence`)

> Locale `es`: "Condicional e independencia". Minijuego: [Primero las cajas, después la mano](../../F-minijuegos/prob.cond.conditional_and_independence.md).

**Nodo:** `prob.cond.conditional_and_independence` · **Área:** prob · **Nivel:** 6 · **Primitiva:** `random` · **Mecánica principal:** `urn_dice` (secundarias `sorter`, `tiles`, `network_routes`) · **Literacy:** `icons` · **Analogía:** `sorted_bins_then_pick`

## 1. Concepto

Saber algo sobre el resultado cambia la urna de la que se está sacando. Condicionar es tirar afuera lo que ya no puede pasar y volver a medir la porción sobre lo que queda. Al terminar, el jugador reparte una urna en cajas de dos maneras distintas, saca solo de una caja y lee la porción nueva; reconoce cuándo esa porción es igual a la de la urna entera, que es exactamente la independencia; y distingue "sacar de la caja redonda una roja" de "sacar de las rojas una redonda". Antes sabía leer una porción. No sabía que la porción depende de qué parte del total se está mirando.

## 2. Prerequisitos

- `prob.basic.probability_as_proportion` (nodo [34](34-prob.basic.probability_as_proportion.md)): la porción como probabilidad. Se usa entero. La urna, la barra del total, la corrida con el dedo apretado, la línea punteada, el símbolo `P(A)` y el cajón del clasificador como nombre del evento. La misconception `equiprobable_assumed` ya está catalogada allí y sigue viva acá, ahora dentro de cada caja.

Es el único prerequisito del YAML, y eso es una decisión. La escuela suele poner la combinatoria y la regla del producto antes que la condicional, y presentar `P(A ∩ B) = P(A) · P(B)` como una fórmula que se aplica cuando el enunciado dice "independientes". Acá el orden es el inverso: la independencia se define primero como una observación sobre cajas (la caja tiene la misma mezcla que la mesa) y recién después se demuestra que de ahí sale el producto. Quien aprende el producto primero termina usándolo siempre, y esa es la puerta de entrada de `independent_means_disjoint`.

## 3. Dificultad cognitiva real

Lo difícil no es dividir dos probabilidades. Son tres capacidades:

1. **Cambiar de total.** Condicionar no es filtrar un resultado, es cambiar el denominador. El jugador tiene que aceptar que la barra del total, que en el nodo 34 era intocable, ahora se acorta: el nuevo total es la caja. Es el gesto más raro del área, porque toda la aritmética anterior enseñaba a no tocar el todo.
2. **Distinguir la dirección.** "De las que son redondas, cuántas son rojas" y "de las que son rojas, cuántas son redondas" son dos números distintos calculados sobre el mismo montón. La confusión no es de cuenta: es de cuál es la caja y cuál es el color. Es `conditional_reversed`, la misconception de mayor severidad del nodo.
3. **Entender la independencia como una igualdad, no como una separación.** Dos cosas independientes no son dos cosas que no pueden pasar juntas. Son dos cosas donde saber una no cambia la porción de la otra. La intuición cotidiana empuja fuerte hacia lo contrario, porque "independiente" en el habla significa "aparte". Es `independent_means_disjoint`.

## 4. Problema intuitivo

Una mesa con muchas bolitas mezcladas, rojas y azules, grandes y chicas. Alguien las junta y las reparte en dos cajas: en la redonda van las chicas, en la cuadrada las grandes. Después tapa las dos cajas, mete la mano en una sola y saca. La pregunta, por voz o por gesto: si sé que salió de la caja redonda, ¿sigue siendo igual de fácil que salga roja?

En `real` la escena es solo el reparto y la mano. En `intuition` la escena se detiene con las dos cajas tapadas y tres desenlaces dibujados: la caja redonda con la misma mezcla que la mesa, la caja redonda con casi todas rojas, la caja redonda con casi todas azules. El jugador elige cuál cree que hay adentro y después se destapa. Cuando acierta con la primera, el juego no dice nada especial; guarda ese caso, porque es el que después se va a llamar independencia.

## 5. Analogía del mundo real

`sorted_bins_then_pick`, la analogía del YAML, sobre la mecánica `sorter` ([G0](../../G-analogias/G0-reglas.md)).

Mapa objeto a concepto: ordenar por el primer rasgo es condicionar; sacar solo de una caja es la probabilidad condicional; una caja con la misma mezcla que toda la mesa es la independencia; una caja con mezcla distinta es la dependencia; enterarse de la caja y después adivinar la bolita es la actualización bayesiana, que se juega recién en el nodo siguiente.

Invariante que conserva: las bolitas no cambian de color al entrar en la caja. La mezcla de la mesa sigue siendo la de siempre; lo único que cambió es desde dónde se mira. Ese es el corazón del nodo y la defensa contra creer que condicionar modifica el mundo.

Punto de ruptura: `conditioning_on_an_empty_bin`. Si una caja quedó vacía, sacar de esa caja no significa nada, y el juego lo muestra literal: la mano entra y no encuentra nada. Por eso la analogía se retira en `formal`, donde la condición `P(B) > 0` aparece escrita.

Por qué esta y no la urna sola. `urn_of_balls` sigue presente y es la mecánica principal, pero la urna sola no tiene manera de mostrar el cambio de total: una urna es un total. Hace falta un objeto que parta el mismo montón de dos maneras a la vez, y eso lo da el clasificador con dos criterios. Las dos analogías se apilan: el clasificador arma las cajas, la urna es cada caja.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. Cuatro mecánicas, cada una con su aporte ([E0](../../E-mecanicas/E0-catalogo.md)).

`urn_dice` es la principal y provee el azar: la mano que saca de la caja elegida y la corrida larga que confirma la porción. `sorter` provee la partición: cada bolita va a una caja y a una sola, según el rasgo elegido. `tiles` provee la vista de las dos particiones a la vez: la grilla de dos por dos donde las filas son un rasgo y las columnas el otro, y cada celda es un montón. `network_routes` provee el árbol de extracciones: primero la caja, después el color, con las porciones escritas en las ramas.

Los cuatro se encuentran en un gesto: el jugador toca una caja, la otra caja se apaga y se corre fuera de la barra del total, y la barra se acorta hasta abarcar solo la caja tocada. La porción se recalcula sobre esa barra más corta, a la vista.

Gestos: `tap`, `hold`, `drag`.

1. La mesa con las bolitas mezcladas arriba. Abajo, dos cajas vacías y un selector de rasgo con dos íconos, tamaño y color.
2. Demostración: una mano fantasma toca el ícono de tamaño, las bolitas vuelan solas a las dos cajas, la mano toca la caja redonda, la caja cuadrada se apaga y se corre, la barra del total se acorta y se repinta con la mezcla de la redonda, y la mano saca una bolita de esa caja.
3. El jugador toca el otro ícono de rasgo. Las bolitas vuelven a la mesa y se reparten de nuevo, ahora por color. Las cajas son otras; las bolitas, las mismas. Este ida y vuelta es el gesto clave del nodo.
4. El jugador toca una caja y mantiene apretado. La corrida corre solo dentro de esa caja y la barra corta se estabiliza en su propia línea punteada, distinta de la de la mesa entera.
5. El jugador arrastra bolitas de una caja a otra. Las dos líneas punteadas se mueven, la de la caja y la de la mesa, y a veces se cruzan. Cuando coinciden, la caja brilla suave. Ese brillo es la independencia, sin nombre todavía.
6. Verificación: el árbol se despliega solo al costado. Primero se ramifica por caja, después por color, y las porciones de cada rama se multiplican a lo largo del camino y suman uno al final.

Nada se llama incorrecto. Sacar de una caja vacía deja a la mano volviendo sin nada y la barra corta desaparece: no hay porción que leer. Invertir la dirección de la pregunta da un número que existe pero no responde, y eso se ve porque el árbol queda armado al revés.

## 7. Representación visual

Capa `visual`, primitiva dominante `random`, con `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

Lo que se desplaza es la caja no elegida, que se va del cuadro y se lleva su parte de la barra. Lo que se escala es la barra del total, que se acorta al condicionar y se vuelve a estirar al soltar la condición, siempre con el mismo gesto de la parte pintada creciendo dentro de ella. Lo que se conserva son las bolitas: ninguna cambia de color ni desaparece, solo cambian de lugar y de encuadre.

La grilla de dos por dos vive al costado, con las cuatro celdas pintadas y con el borde de la fila o de la columna elegida iluminado. Condicionar es iluminar una franja de la grilla; leer la probabilidad condicional es medir la parte pintada dentro de esa franja y no dentro de toda la grilla.

Todavía no se muestra la inversión de la condición como cuenta, ni la fórmula de Bayes, ni ningún árbol de más de dos etapas. Eso es `prob.cond.bayes_reverses_condition` y `prob.cond.markov_chain_walk`.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Cajas a filas de la grilla.** Al alternar dos veces entre los dos rasgos, las cajas se aplanan y se acomodan como filas y columnas de una grilla de dos por dos. Las bolitas se apilan dentro de cada celda con su contador. Las cajas ya no son recipientes: son franjas.
2. **Franja a barra corta.** Al tocar una franja, esa franja se levanta de la grilla y se acuesta como barra propia. La barra larga del total queda atrás, más pálida. Las dos barras son visibles a la vez y esa convivencia es lo que hace entender el cambio de denominador.
3. **Barra corta a ficha de fracción.** Al tocar la parte pintada de la barra corta, se contrae en una ficha con el denominador tomado de la franja y no del total.
4. **Ficha a `P(A|B)`.** Al soltar la ficha sobre el ícono de la franja, el ícono de la franja se encoge y entra a la derecha de una barra vertical, el ícono del color entra a la izquierda, y la barra corta se para de canto y se convierte en la `P`. Queda `P(rojo | redonda)`.
5. **Grilla a producto.** Al arrastrar una celda de la grilla hacia el árbol, el camino de esa celda se enciende y las porciones de sus dos ramas se acercan y se juntan con un morph en `P(B) · P(A|B)`. La celda y el producto quedan unidos por un hilo: son el mismo objeto medido de dos maneras.

## 9. Notación matemática

Nace `P(A|B)`, y con él la barra vertical.

La regla de oro de [H](../../H-progresion-abstraccion.md) pide el problema que lo hace necesario. El problema es que en este nodo hay dos números que se escribían igual. Antes de condicionar, la porción de rojas era `P(rojo)` y no había ambigüedad. Ahora hay tres porciones de rojas sobre la mesa: la de toda la mesa, la de la caja redonda y la de la caja cuadrada. Escribirlas todas `P(rojo)` es imposible, y describirlas con una frase deja de servir en cuanto hay que compararlas. La barra vertical resuelve exactamente eso: dice sobre qué total se está midiendo. A la izquierda, lo que se pregunta; a la derecha, el mundo dentro del cual se pregunta.

Con `P(A|B)` llega la condición de existencia `P(B) > 0`, que no es un tecnicismo sino la caja vacía. Y llega también la notación de la intersección `P(A ∩ B)`, que acá aparece con un rol muy concreto: es la celda de la grilla, medida sobre el total grande.

## 10. Definición formal

Capa `formal`: texto corto con voz y la grilla al lado. Tres frases, de a una.

"La probabilidad condicional es la porción de `A` medida dentro de `B` y no dentro del total." "Se calcula como la parte que cumple las dos cosas dividida por la parte que cumple la condición." "Dos eventos son independientes cuando condicionar no cambia nada: la porción dentro de la caja es la misma que la de la mesa."

Notación que queda: `P(A|B) = P(A ∩ B) / P(B)` con `P(B) > 0`, `P(A ∩ B) = P(A) · P(B|A)` como regla del producto, y `P(A ∩ B) = P(A) · P(B)` como el caso particular de la independencia.

Condiciones y casos especiales, verificados sobre el objeto: la caja vacía no admite condición; condicionar sobre todo el total devuelve la probabilidad original, porque la barra corta y la larga coinciden; si `A` y `B` no pueden pasar juntos, la celda de la grilla está vacía y `P(A|B)` vale cero, que es lo más lejos posible de la independencia salvo que uno de los dos ya valga cero.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: el nombre independencia y la escritura de la regla del producto.

## 11. Propiedades

- **Condicionar cambia el denominador, no las bolitas.** Ligada al gesto de la caja que se apaga y a que ninguna bolita cambia de color. Cheatsheet `cs.prob.conditional_definition`.
- **La regla del producto recorre el árbol.** `P(A ∩ B) = P(B) · P(A|B)`. Ligada al camino encendido en el árbol, donde las porciones de las ramas se multiplican a lo largo. Cheatsheet `cs.prob.multiplication_rule`.
- **La independencia es que la caja tenga la mezcla de la mesa.** `P(A|B) = P(A)`, y de ahí sale `P(A ∩ B) = P(A) · P(B)`. Ligada al brillo suave de la caja cuando las dos líneas punteadas coinciden. Cheatsheet `cs.prob.independence_product_rule`.
- **La independencia es simétrica.** Si saber la caja no cambia el color, saber el color no cambia la caja. Ligada al ida y vuelta entre los dos rasgos, que con una grilla independiente da el mismo brillo en las dos direcciones.

## 12. Ejercicios como minijuegos

Los seis verbos de [K](../../K-evaluacion.md), instanciados dentro de la mecánica. Las probes del locale, desarrolladas:

- `recognize`: la mesa entera con su barra y cuatro cajas resultantes de repartos distintos, cada una con su barra corta. Tocar la caja que quedó con la misma mezcla de colores que la urna completa. Los distractores los genera `detect`: la caja con más rojas en cantidad absoluta, la caja con la mezcla invertida, la caja con una mezcla parecida pero no igual.
- `explain`: sacar solo de una caja, con el dedo apretado, y después de la otra. Se muestran tres animaciones de por qué la porción cambió: la barra corta que se acorta y se repinta sobre la caja elegida; una barra que se acorta pero mantiene la pintura de la mesa; una donde las bolitas cambian de color al entrar en la caja. Tocar la que muestra lo que pasa. Cada distractor es una misconception.
- `manipulate`: veinte bolitas y dos cajas. Repartirlas de manera que saber la caja no diga nada sobre el color. La grilla al costado muestra las cuatro celdas y la caja brilla cuando las dos líneas punteadas coinciden. Hay muchas soluciones y todas se aceptan.
- `apply`: sabiendo que la bolita salió de la caja redonda, arrastrar la marca sobre la barra corta para indicar cuán probable es que sea roja. Después se corre la simulación dentro de esa caja. Se puntúa la cercanía.
- `generalize`: armar sobre la grilla dos rasgos que sean independientes y dos que no, y mostrar la diferencia. El juego no dice cuál es cuál: lo dice el brillo de las franjas.
- `transfer`: en el mapa de rutas de `prob.cond.markov_chain_walk`, elegir el cruce cuyo tramo siguiente no depende de por dónde se llegó. Es la independencia dicha con caminos.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`conditional_reversed`**, patrón `two_paths_diverge` sobre `urn_dice`. El jugador responde `P(B|A)` donde se pedía `P(A|B)`. El juego parte el montón en dos copias idénticas y las pone lado a lado. En la copia izquierda restringe a la caja redonda y cuenta las rojas dentro; en la derecha restringe a las rojas y cuenta las redondas dentro. Las dos barras cortas crecen en paralelo y quedan de largos claramente distintos, con las mismas bolitas encendidas en el medio: la celda común es la misma, los denominadores no. El objetivo del ítem aparece entre las dos. Voz: "Mirar solo las redondas y contar rojas no es lo mismo que mirar solo las rojas y contar redondas. ¿Cuál pide la pregunta?". No se reabre desde el estado erróneo; el jugador elige de nuevo con las dos copias a la vista.
- **`independent_means_disjoint`**, patrón `replay_on_mechanic` sobre `urn_dice`. El jugador dice que dos eventos independientes no pueden pasar juntos y responde cero donde iba el producto. El juego congela, reproduce su reparto y muestra la grilla con la celda de las dos cosas a la vez. Esa celda tiene bolitas adentro y se enciende una por una, contadas en voz alta por el contador. Después la barra del producto crece al lado y llega a la misma altura. Voz: "Acá hay bolitas que son las dos cosas a la vez. ¿Cuántas son?". La grilla queda abierta y el jugador vuelve a responder desde ese estado, que sigue siendo válido.

Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de estas dos, más las de `equiprobable_assumed` del prerequisito directo.

## 13. Generalización

La analogía se retira en dos tiempos. Las cajas se van en `symbolic`, cuando el jugador escribe `P(A|B)` mirando solo la grilla; a partir de ahí se piden con un toque y aparecen como fantasma. La grilla sobrevive hasta `formal`, porque es lo que sostiene la diferencia entre la celda y la franja, es decir, entre la intersección y la condición.

Variantes sin ayuda visual, en orden: condiciones sobre rasgos que no parten en dos sino en tres; condiciones compuestas, del tipo "grande y azul"; cadenas de dos etapas donde la segunda depende de la primera, que es la urna sin reposición; independencia con tres eventos, donde de a pares alcanza y de a tres no; y por último eventos donde no hay bolitas que contar y las porciones vienen dadas.

El nodo está en `abstract` cuando el jugador escribe la condicional sin dibujar cajas, decide en qué dirección va la barra vertical leyendo la pregunta, y distingue independencia de exclusión mutua con un contraejemplo propio. La forma completa de esa capa llega con la independencia entre variables aleatorias, mucho más adelante.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`:

- `disc.logic.if_then_direction` (`sorter` con `network_routes`): la misma asimetría, sin azar. "Si llueve entonces hay charcos" no es "si hay charcos entonces llovió". El clasificador ordena por la hipótesis y verifica la conclusión, y al invertirlo quedan objetos afuera. Es el mismo error de dirección que `conditional_reversed`, y las dos misconceptions comparten el patrón `two_paths_diverge`.
- `disc.set.membership_rule` (`sorter`): condicionar como restringir el universo. El conjunto de referencia deja de ser todo y pasa a ser un subconjunto, y la pertenencia se decide adentro de él. La barra corta reaparece como el universo achicado.
- `csmath.info.entropy_as_surprise` (`urn_dice` con `ledger`): cuánta sorpresa queda después de enterarse de algo. Una caja que tiene la mezcla de la mesa no quita sorpresa, y ahí la independencia se vuelve medible en bits.

En los tres, la mecánica del clasificador o de la urna vuelve a aparecer, pero el objeto no: en uno son enunciados, en otro conjuntos, en el tercero mensajes. Lo que transfiere es el cambio de universo, no el gesto.

Concepto siguiente: `prob.cond.bayes_reverses_condition`. Frase puente, narrada sobre la grilla con una franja encendida: "Sabés la caja y adivinás el color. ¿Y si te dan el color y hay que adivinar la caja?". La grilla gira noventa grados, las filas pasan a ser columnas y las mismas celdas quedan agrupadas al revés, y el nodo siguiente empieza ahí.

---

**Visualización:** tres escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `sorter_scene_bins_then_pick` es nativa: el reparto en cajas, el apagado de la caja no elegida y la mano que saca de la que queda; parametrizada por las composiciones de las cajas y por cuál se elige. `urn_scene_restricted_urn` es nativa y es la imagen central: la barra del total que se acorta hasta abarcar solo la condición, con las dos barras conviviendo un momento; parametrizada por la composición y por la caja de la condición. `network_scene_tree_of_draws` es nativa y sostiene la regla del producto: el árbol de dos etapas con las porciones en las ramas y el camino encendido; parametrizada por las porciones de cada etapa y por el camino resaltado. Ninguna lleva texto rasterizado: contadores, fracciones y la barra vertical los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsa `urn_scene_draw_and_tally` (nodo 34) para las corridas dentro de una caja.

**Calculadora:** en `ready` se habilita `op_conditional_probability` ([M](../../M-calculadora/M0-progresion.md)), que toma dos conjuntos armados con fichas y devuelve `P(A|B)`. Al lado dibuja la grilla con la franja de la condición iluminada y la celda de la intersección pintada, para que la respuesta siga siendo una porción dentro de una franja. Si la condición está vacía, no devuelve cero: devuelve la caja vacía y no deja seguir. Si el nodo decae, la franja pierde la iluminación y queda solo la grilla.

**Edad universal:** el nodo es `icons` porque los contadores de las celdas llevan dígitos y la ficha de fracción tiene numerador y denominador ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: repartir con un toque en el ícono de rasgo, elegir caja, sacar con el dedo apretado, elegir entre animaciones en `explain`, prompts por voz. La barra vertical se introduce como un objeto gráfico, la franja parada de canto, antes de tener nombre. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en la grilla y usa el sandbox de la calculadora enseguida; lo que no se le saltea es el ida y vuelta entre los dos rasgos, porque es el único momento donde se ve que las bolitas no cambiaron.
