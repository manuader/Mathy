# Los subsuelos (`arith.int.negatives`)

Minijuego del nodo 7 de la espina, "Negativo es la dirección contraria". Mecánica principal `gears_sequence`, secundarias `ledger` y `grid_stretch`; analogías `elevator_floors` y `debt_ledger`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/07-arith.int.negatives.md): un concepto, cuatro dificultades reales (el número que deja de ser cantidad, el trazo con dos oficios, el orden dado vuelta bajo el cero, las dos vueltas que se anulan), dos analogías que sobreviven donde otras cuatro se rompen, un gesto (seguir girando cuando la planta baja ya pasó), cinco pasos de desvanecimiento, la recta con flechas como visualización, retiro del ascensor en `symbolic` y la recta reflejada en su lugar. Acá se fija cómo se juega.

## Analogía

Un hueco de ascensor vertical con los pisos marcados y la planta baja resaltada, una manivela al costado y un panel de botones. Abajo, un mostrador con monedas y vales de papel. El hueco no aparece de la nada: la primera instancia arranca con el camino de piedras del nodo 4 y su orilla, y el camino se levanta hasta quedar vertical mientras la última piedra se convierte en la planta baja. Es un morph del mismo objeto, no otra pantalla.

Mapa objeto → concepto: piso → entero; planta baja → cero; subir n → sumar un positivo; bajar n → sumar un negativo; piso de subsuelo → número negativo; pisos entre dos paradas → diferencia absoluta; orden de los botones → orden de los enteros. Del mostrador: moneda → unidad positiva; vale → unidad negativa; moneda y vale que se juntan y desaparecen → opuesto aditivo; sacar un vale → restar un negativo; montón neto → suma con signo.

El edificio aporta "dónde estoy"; las monedas, "cuánto debo". Este es el nodo donde se rompen las analogías de cantidad que venían sirviendo: no hay menos que una manzana en `fruit_ledger`, no hay una pesa que pese menos que nada en `balance_pans` (que declara `negative_weights`), no hay banda estirada hacia atrás del clavo en `rubber_band_stretch` (que declara `negative_scaling_flips`), y `walker_forward_and_back` está directamente prohibido acá porque declara `walking_past_start`. Las dos que sobreviven se rompen las dos en la multiplicación: `elevator_floors` en `multiplying_floors` y `debt_ledger` en `multiplying_two_debts` ([G0](../G-analogias/G0-reglas.md)). Ese borde compartido es lo que fija cuándo se retiran.

## Mecánica central

Superficie: el hueco del ascensor ocupa la mitad izquierda en vertical, con la manivela al costado y el panel debajo; el mostrador con monedas y vales, la mitad derecha. La altura de la cabina marca el saldo del mostrador. Gestos: `scrub`, `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar la manivela.** Cada vuelta mueve la cabina un piso, siempre el mismo paso. El botón del piso donde está queda iluminado.
- **Seguir girando en la planta baja.** La manivela no se traba. La cabina sigue bajando y la pared del hueco continúa hacia abajo dibujando subsuelos que hasta ese momento no estaban. Es el momento central del minijuego y ocurre sin ningún cartel.
- **Arrastrar una moneda sobre un vale del mismo tamaño.** Los dos desaparecen con un destello y la cabina sube un piso.
- **Sacar un vale del mostrador.** La cabina sube un piso, igual que si se hubiera agregado una moneda. La coincidencia es todo el argumento de que restar un negativo suma; nadie lo enuncia.
- **Arrastrar la ficha de la distancia entre dos carritos.** Se cuenta en pisos y no depende de por cuál se empiece.
- **Colgar fichas de piso en el hueco.** Si el jugador cuelga menos cinco por encima de menos dos, las dos fichas se cruzan con el hueco y no se enganchan: el hueco no admite un orden que no es el suyo.
- **Dar vuelta al caminante.** En el último nivel la recta se acuesta y aparece un caminante. Una ficha de signo lo hace darse vuelta; dos fichas seguidas lo dejan mirando como estaba y avanza hacia adelante.
- **Aplicar la ficha de signo a la recta entera.** La recta se refleja alrededor del cero: cada marca pasa a su opuesta de un solo movimiento y el cero no se mueve. Es el objeto que sobrevive al retiro del ascensor.

En `symbolic` la superficie cambia de forma, no de reglas: la ficha de signo se pega a una ficha de número para cambiarle el lado, y una ficha de operación vive entre dos números. El lugar distingue los dos oficios del mismo trazo. El ascensor se pide tocando el cero y aparece como fantasma.

## Invariante matemático

Dos invariantes, uno por mecánica.

`same_step_every_turn` (manivela): cada vuelta mueve un piso, en la planta baja y en el tercer subsuelo por igual. El invariante es lo que hace legítimo cruzar el cero: nada cambia allí salvo la etiqueta. Se ve romperse si el jugador espera que la cabina se frene, y lo que ve es que no se frena.

`count_preserved_under_regrouping` (mostrador): reordenar monedas y vales no cambia el saldo, y cancelar un par tampoco. Se ve confirmarse cuando el jugador junta los pares en cualquier orden y la cabina termina siempre en el mismo piso.

Un movimiento válido pero inútil —cancelar un par y volver a crearlo, o subir y bajar la misma cantidad— no rompe ningún invariante y recibe un empujón suave.

## Representación visual

Primitiva dominante `displace`, de apoyo `partition` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el edificio con dos carritos y el ascensor de puertas abiertas; el mostrador donde un vale y una moneda se juntan y desaparecen. Solo se mira y se predice.
- `concrete`: hueco con pisos marcados, cabina, manivela, panel, monedas y vales. Nada escrito salvo los números de los botones.
- `visual`: el hueco se estiliza en una recta vertical graduada con el cero resaltado y la cabina como punto; cada movimiento deja una flecha, y dos flechas opuestas del mismo largo dejan el punto donde estaba. El mostrador se vuelve dos columnas de fichas enfrentadas de a pares que se apagan. En algún momento la recta gira hasta acostarse y se reconoce como la pista del nodo 3 con su mitad izquierda dibujada.
- `symbolic`: fichas de número con y sin trazo delante, la ficha de signo suelta y la recta horizontal con marcas a los dos lados.
- `formal`: la definición corta con voz y la recta al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Subsuelo → etiqueta con trazo: la primera vez que la cabina baja de la planta baja, los pisos que aparecen se numeran con un trazo corto delante que los de arriba no tienen.
2. Hueco → recta: al soltar la cabina fuera de un piso, la pared se afina hasta ser una recta graduada, la cabina se contrae en un punto y los botones se vuelven las marcas.
3. Recta vertical → recta horizontal: al arrastrarla con dos dedos, la recta gira hasta acostarse. Nada aparece ni desaparece: todo rota.
4. Par de fichas → nada: al cancelarse, la moneda y el vale se funden en una ficha y se apagan; las demás se corren para ocupar el hueco.
5. Vuelta → ficha de signo: dar vuelta al caminante deja una ficha con el trazo solo, sin número. Pegada a un número le cambia el lado; aplicada dos veces lo devuelve.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la recta: cada número tiene un opuesto, a la misma distancia del cero y del otro lado; un número y su opuesto se cancelan; restar un número es sumar su opuesto. Propiedades: el opuesto del opuesto es el número original; el orden de los enteros es el orden de las posiciones; la distancia entre dos posiciones no tiene signo. Casos especiales: el cero es su propio opuesto y el único; comparar dos negativos invierte la lectura de tamaños. Símbolo nuevo: el signo negativo, que nace como marca del lado en los pisos de subsuelo y cuyo problema es describir un desplazamiento hacia el otro lado sin cambiar la operación. El signo de igual aparece en los renglones del libro de cuentas y el nodo no lo introduce. Precaución propia de este nodo: los dos oficios del mismo trazo se dibujan con espaciado distinto —el de operación separado, el de signo pegado a su número— hasta que el jugador los distingue solo. El resultado primario sigue siendo la posición del punto sobre la recta.

## Generalización

El ascensor se retira en `symbolic`, cuando la ficha de signo se aplica sin mirar la cabina, y no vuelve para la multiplicación: su punto de ruptura está justo ahí. En su lugar queda la recta que se refleja entera alrededor del cero, que sí sobrevive, porque reflejar dos veces la deja como estaba. El mostrador se retira junto con el ascensor, por la misma razón.

Variantes sin ayuda visual: sumas y restas que cruzan el cero; comparaciones entre dos negativos; distancias entre posiciones de signos distintos; pares de opuestos escondidos en una lista, que hay que cancelar antes de contar; y reflejar la recta y decir dónde queda una marca. Después, pares de opuestos que no son números: girar a la izquierda y a la derecha, llenar y vaciar, antes y después de un momento elegido como cero. El jugador nombra el opuesto y señala cuál es el cero. Cuando opera cruzando el cero sin pedir el ascensor y elige el cero de una situación que no lo trae marcado, la analogía se eliminó.

## Desafío

Correspondencia con los ejemplos de [H](../H-progresion-abstraccion.md): este minijuego no participa del ejemplo de cofres. Sí alimenta la etapa 2 del ejemplo de frutas, donde la resta entre dos filas del libro de cuentas necesita que exista el otro lado del cero; ese uso es de `alg.sys.two_by_two` y acá solo se prepara.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **La planta baja no es el final.** `concrete`, `manipulate`. Girar la manivela hacia abajo hasta que aparecen los subsuelos. Recorridos cortos, un solo movimiento por instancia.
2. **Monedas y vales.** `concrete`, `manipulate` y `recognize`. Cancelar pares en el mostrador y ver la cabina responder. Aparece sacar un vale.
3. **Cuántos pisos hay entre.** `concrete`, `apply`. Dos carritos, uno de cada lado del cero; arrastrar la ficha de la distancia. Aparece colgar fichas en orden.
4. **Flechas sobre la recta.** `visual`, `explain` y `manipulate`. El hueco se estiliza, cada movimiento deja su flecha y las opuestas se superponen. Misma dificultad numérica.
5. **La recta se acuesta.** `visual` hacia `symbolic`, `manipulate` y `apply`. La recta gira, aparecen las fichas con trazo y la ficha de signo suelta.
6. **Números difíciles.** Parámetros: rango mayor, varios movimientos encadenados por instancia y listas con pares de opuestos escondidos que conviene cancelar antes de contar.
7. **Dos vueltas.** `formal` y `abstract`, `generalize`. El caminante que gira dos veces, la recta que se refleja, y pares de opuestos que no son números. Definición corta con voz. Aparece `negative_times_negative`.

Qué endurece cada parámetro: el rango obliga a leer la posición en la recta en vez de contar pisos de a uno; encadenar movimientos hace que la cancelación sea más rápida que el recorrido; los pares escondidos premian ver la estructura antes de operar; y el nivel 7 es el único que toca el borde de las dos analogías, por eso llega último y sin ascensor en pantalla.

Desafíos de olimpíada: el nodo no declara `challenges` y por lo tanto no exige desafío para `mastered` ([K](../K-evaluacion.md)). La estructura reaparece como paso intermedio en `ch.arith.parity_invariant_coins`, que cita `cs.arith.add_signed_as_net_steps` entre sus referencias de cheatsheet ([S](../S-desafios/S0-desafios.md)).

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: el caminante en el cero y una ficha negativa; tocar la casilla donde termina, del lado izquierdo. Un distractor es la casilla simétrica del lado derecho.
- `explain`: dos animaciones del caminante que se da vuelta dos veces, una donde termina mirando hacia adelante y otra donde sigue mirando hacia atrás. Tocar la que se equivoca al girar dos veces. El distractor elegido clasifica como `negative_times_negative`.
- `manipulate`: girar la manivela hacia atrás cruzando el cero mientras el mostrador anota los vales; la cabina y el saldo tienen que terminar de acuerdo.
- `apply`: dos pisos, uno arriba y otro abajo del cero; arrastrar la ficha con la distancia entre ambos, contra el tiempo objetivo del nodo.
- `generalize`: sin ascensor, ordenar de menor a mayor fichas positivas y negativas con pares de opuestos mezclados. Y un par que no es numérico —llenar y vaciar—: nombrar el opuesto y señalar el cero.
- `transfer`: en el plano de cuatro cuadrantes de `trig.ang.quadrant_signs`, tocar el cuadrante donde un punto tiene los dos signos indicados. También en `alg.fn.graph_as_picture` (la mitad de abajo del gráfico) y `linalg.vec.vector_as_displacement` (dos flechas opuestas que devuelven al origen).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `negative_times_negative`, patrón `double_flip` sobre el caminante: primer giro, segundo giro, comparación de aterrizajes. El caminante termina del lado por el que empezó y la respuesta del jugador queda como bandera del otro lado. El patrón no reabre desde el estado erróneo, porque no hay estado: el ítem se reinicia desde el original. Es la única del nodo y la que el nodo posee.
- Detener la cabina en la planta baja creyendo que no se puede bajar más no tiene entrada en el catálogo de L y no clasifica. Se resuelve dentro del objeto: la manivela sigue girando.

Los distractores de `explain` y las opciones de `apply` se generan desde la regla `detect` de `negative_times_negative` y desde las de los prerequisitos directos, más la casilla simétrica y las posiciones vecinas.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `gear_walk_past_zero`, nativa. La manivela gira, el punto avanza sobre la recta graduada de a pasos iguales, cruza el cero sin detenerse y la parte de la recta que aparece se dibuja mientras el punto la recorre; cada paso deja su flecha y las opuestas se superponen. Gramática `displace`. Parametrizada por posición de partida y paso, produce las instancias de `manipulate` y de `apply`.
- `ledger_debt_tokens`, nativa. Monedas y vales en dos columnas enfrentadas; los pares se apagan de a uno y el saldo queda con su columna. Gramática `partition`. Parametrizada por cantidad de créditos y de deudas.
- Reusadas: las escenas de la pista de los nodos 3 y 4 como estado de partida, con la mitad izquierda todavía sin dibujar.
- Faltante: el nodo no declara ninguna escena para el caminante que se da vuelta dos veces, que es lo que el patrón `double_flip` necesita para su misconception propia. Ver el reporte.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_floor_walk`: `start` (piso de partida, positivo en los niveles 1 a 3, de cualquier signo desde el 4); `moves` (1 movimiento hasta el nivel 5, 2 a 4 desde el 6); `step_range`; `crosses_zero` (verdadero en la mayoría de las instancias); `seed`.
- `gen_debt_board`: `credits` y `debts` por rango según nivel; `hidden_pairs` (cantidad de pares de opuestos que conviene cancelar antes de contar, desde el nivel 6); `ask` en {saldo, distancia, orden}; `seed`.
- `gen_opposite_pairs`: pares de opuestos no numéricos con su cero convencional (girar, llenar, entrar, antes y después), uno por instancia en el nivel 7.

**Literacy soportada:** de `none` a `full_text`. El mínimo es `none` en todos los niveles: la cabina y la manivela se manejan con `scrub` y `drag`, el mostrador con `drag` y `tap`, y `explain` se resuelve entre dos animaciones. Los números de los botones son íconos de posición. La analogía del ascensor declara `literacy_min: icons` por esos números; el minijuego lo sostiene en `none` porque los botones se pueden usar por posición y la cabina siempre está a la vista, pero conviene revisar la discrepancia (ver el reporte). La variante de numeración de la planta baja la elige el locale de región ([P](../P-internacionalizacion.md)).

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela hacia abajo y no se detiene en la planta baja: la pared del hueco continúa y aparecen los subsuelos. La escena vuelve al inicio y la manivela late. Para el mostrador, la mano junta una moneda con un vale y los dos se apagan. La demostración de girar la manivela hacia atrás no se repite: es la del nodo 4 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
