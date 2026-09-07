# 11 — Los dos platos (`prealg.eq.balance`)

> Locale `es`: "El igual es una balanza". Minijuego: [Los dos platos](../../F-minijuegos/prealg.eq.balance.md).

**Nodo:** `prealg.eq.balance` · **Área:** prealg · **Nivel:** 2 · **Primitiva:** `invariant` · **Mecánica principal:** `balance` · **Literacy:** `none` · **Analogía:** `balance_pans`

## 1. Concepto

Una igualdad no es una orden de calcular: es la afirmación de que dos cosas pesan lo mismo, y esa afirmación sobrevive a cualquier acción que se repita en los dos lados. Al terminar, el jugador mira una balanza nivelada y la anota sin dibujarla, quita lo mismo de los dos platos con un toque para dejar la caja sola, y reconoce en un renglón inclinado que alguien tocó un solo lado. Antes sabía que la balanza sirve para pesar; no sabía que la balanza quieta es algo que se puede escribir.

## 2. Prerequisitos

- `prealg.var.unknown_as_box` (nodo 10): la caja cerrada como cantidad con nombre. Se usa entera: la caja que se cuenta sin abrirse, la marca que la identifica, y la letra que nació de ella. Sin la caja, una balanza nivelada con dos montones conocidos no tiene nada que sostener: la afirmación se vuelve interesante recién cuando uno de los platos tiene algo que no se puede contar.

La arista no sigue el orden escolar, donde el signo igual se usa desde la primera suma como el botón que devuelve el resultado y nunca se cuestiona. Acá el jugador llega al nodo 11 habiendo escrito muchos renglones sin ningún `=`, y el símbolo aparece cuando hay una situación —la balanza quieta— que exige registrarse y no cabe en las notaciones que ya tiene. Ese retraso deliberado es lo que hace que `equals_as_operator` sea una misconception que el nodo puede atacar en vez de una costumbre que el nodo hereda.

## 3. Dificultad cognitiva real

Lo difícil es que la igualdad es una **relación** y toda la aritmética anterior entrenó a leerla como una **instrucción**. Tres capacidades:

1. **Leer el igual como una afirmación simétrica.** `7 = 3 + 4` es tan legítimo como `3 + 4 = 7`, y `2 + 3 = 4 + 1` no tiene ningún lado que sea "el resultado". Quien lee el igual como "acá va lo que da" no puede escribir ninguna de las dos. Falla en `equals_as_operator`.
2. **Conservar el invariante bajo acción.** La igualdad no se conserva sola: se conserva si, y solo si, los dos platos reciben la misma acción. Que la barra se caiga cuando eso no pasa no es un castigo, es la definición hecha objeto. Falla en `inverse_applied_one_side`.
3. **Aceptar que dos estados distintos son la misma igualdad.** Quitar tres pesas de cada plato produce una balanza que se ve distinta y afirma lo mismo. Reconocer eso es lo que después permite encadenar pasos sin sentir que la ecuación cambió de identidad.

Ninguna de las tres es "resolver". Este nodo no despeja nada y no tiene llaves: la pregunta "qué acción hay que aplicar" se contesta en el nodo 12 y las dos se juntan en el 13. Acá solo se contesta "en cuántos platos".

## 4. Problema intuitivo

Una feria de intercambio. Sobre una balanza grande de dos platos, un chico apoya su bolsa cerrada y dos manzanas; en el otro plato, el feriante apoya seis manzanas. La barra queda horizontal y los dos se dan la mano: el trato está hecho. Al rato llega otro chico y saca dos manzanas de un solo plato para llevárselas. La pregunta, por voz o por gesto: ¿el trato sigue en pie?

En `intuition` la escena se detiene con la mano del segundo chico sobre las manzanas. Tres desenlaces dibujados: saca dos de cada plato y la barra sigue horizontal; saca dos de un solo plato y la barra se va abajo del otro lado; pasa las dos manzanas de un plato al otro y la barra se hunde el doble. El jugador elige y después ve. El tercer desenlace es el que prepara `sign_flip_on_move` para el nodo 13, y acá se juega sin nombrarlo.

## 5. Analogía del mundo real

`balance_pans`, sobre la mecánica `balance` ([G0](../../G-analogias/G0-reglas.md)). Mapa: plato → lado de la igualdad; pesas en un plato → términos; barra nivelada → igualdad; misma acción en ambos platos → transformación de equivalencia; caja cerrada en un plato → incógnita; quitar pesas iguales de los dos → cancelar; leer la caja sola → solución.

Invariante: la barra queda nivelada si, y solo si, los dos platos reciben la misma acción. Es el paso 3 del test de [G0](../../G-analogias/G0-reglas.md) en su forma más limpia: lo que se conserva en la situación física es exactamente lo que se conserva en el concepto, sin que haya que endurecer nada. Ruptura: `negative_weights`. Una pesa no puede pesar menos que nada, y no existe una acción física que sea "multiplicar los dos platos": la balanza tiene acciones para sumar y restar y no las tiene para escalar. Ese borde decide dos cosas: que la analogía se desvanece en `symbolic`, y que la mecánica sola no alcanza para resolver, lo que es exactamente el argumento del nodo 12.

Por qué esta y no otra: porque es la única analogía del catálogo que enseña **por qué la acción se aplica a los dos lados**. Una recta numérica muestra el resultado y no la simetría; una caja fuerte muestra la acción y no los dos lados. La balanza es el complemento exacto del cofre, y [C0](../../C-knowledge-graph/C0-esquema.md) separa las aristas 11 y 12 hacia el 13 justamente para que cada una enseñe lo suyo.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. El nodo declara una sola mecánica, `balance`, y es deliberado: acá la herramienta y el invariante son el mismo objeto, y no hay una segunda mecánica que aporte la acción porque la acción todavía no es un problema. El llavero está ausente a propósito hasta el nodo 12. Gestos: `tap` y `drag` ([E0](../../E-mecanicas/E0-catalogo.md)).

1. Balanza nivelada. Plato izquierdo: una caja cerrada y dos pesas. Plato derecho: seis pesas. La barra está horizontal y late apenas, para decir que responde.
2. Demostración: una mano fantasma toca una pesa del plato izquierdo y la pesa se eleva y sale; la barra se inclina. La mano toca una pesa del plato derecho y la barra vuelve a horizontal. Dos toques, un estado nuevo, la misma afirmación.
3. **Tocar una pesa la quita de su plato.** Es el gesto central del nodo y el que el nodo 13 va a dar por sabido. Un toque, una pesa, un plato.
4. **Arrastrar una pesa de un plato al otro.** Es un movimiento libre y la balanza lo permite: la barra se hunde el doble, porque el plato perdió y el otro ganó. No se bloquea y no se corrige; se ejecuta y se ve.
5. Estado inclinado: la barra se queda inclinada y la caja no se puede leer. El estado no se borra ni se rebobina. El jugador quita del otro plato lo que falta y la barra vuelve, y desde ahí sigue.
6. Éxito: cuando la caja queda sola en un plato nivelado, se ilumina y muestra cuánto pesa. Sin cartel.

Quitar con un toque sirve para sumar y restar y no alcanza para más. Cuando un plato tiene tres cajas iguales contra doce pesas, el jugador puede quitar pesas de a una todo el día y la caja no queda sola; ahí se siente el hueco que el nodo 12 llena. Nada se llama "incorrecto": la barra inclinada es el mensaje entero.

## 7. Representación visual

Capa `visual`, con `invariant` dominante ([H](../../H-progresion-abstraccion.md)).

La balanza pierde los platos y queda como dos columnas y una barra. Las pesas se aplanan en barras proporcionales apiladas y la caja conserva el borde punteado que trae del nodo 10, con su longitud desconocida. Cuando el par de toques termina, el estado viejo no se borra: queda arriba y el nuevo aparece debajo, y una misma línea horizontal encendida atraviesa los dos. **Dos estados distintos, la misma igualdad.** Esa superposición es la primitiva `invariant` en su forma canónica, y esta es la primera vez que el jugador la ve.

Lo que se desplaza es lo que sale de los dos lados a la vez. Lo que se conserva es el nivel de la barra, y el juego lo dibuja como una línea horizontal que persiste entre el antes y el después mientras todo lo demás cambia. Nada se escala: escalar no tiene gesto en esta mecánica y esa ausencia es información.

Todavía no hay letras nuevas, ni operaciones escritas, ni llaves. El igual es la barra.

## 8. Transición a símbolos

Cinco escalones que la misma balanza recorre sin salir de pantalla, cada uno abierto por un gesto del jugador.

1. **Pesas → fichas.** Al quitar por primera vez pesas de a pares en `visual`, las barras apiladas de cada plato se contraen en un número: `x + 2` de un lado y `6` del otro, todavía sobre los platos. La caja ya era `x` desde el nodo 10 y no cambia.
2. **Platos → extremos de una línea.** Al siguiente par de toques, los platos se desvanecen y sus fichas quedan flotando donde estaban, sostenidas por la barra.
3. **Barra → `=`.** La barra se contrae hacia el centro hasta ser dos trazos horizontales cortos. Queda `x + 2 = 6` sobre una línea que **conserva la capacidad de inclinarse**: el signo no es un dibujo muerto, es la barra encogida, y si el jugador rompe la igualdad los dos trazos se ladean y el renglón entero se hunde de un lado. Ahí nace el símbolo.
4. **Toque → ficha de acción.** Quitar dos pesas de un plato se convierte en soltar una ficha `−2` sobre ese lado. La ficha existe porque el toque dejó de tener a qué tocar cuando las pesas se volvieron un número.
5. **Zonas de drop.** El último paso es descubrir dónde se puede soltar la ficha, y son tres lugares con tres significados. Soltarla **sobre el `=`** la aplica a los dos lados a la vez y el renglón queda derecho. Soltarla **sobre un lado** la aplica a ese lado solo y el renglón se inclina. **Arrastrar una ficha ya escrita cruzando el `=`** es el movimiento libre del paso 4 de la sección 6, y la línea lo valida inclinándose el doble. Estas tres zonas nacen acá, con la balanza, y valen para todo nodo que use esta mecánica; los demás las heredan con su propio invariante.

## 9. Notación matemática

Queda `x + 2 = 6`, y debajo, cuando el jugador actúa, la ficha aplicada a los dos lados.

El símbolo que nace es **`=`**, y el problema que lo hizo necesario es registrar que dos platos están equilibrados sin dibujar la balanza cada vez (regla de oro de [H](../../H-progresion-abstraccion.md)). El jugador ya sintió la incomodidad: viene de anotar en el libro del nodo 10 y ninguna de esas anotaciones puede decir que dos filas pesan lo mismo, porque el libro cuenta y no compara.

Con el `=` se fija además una convención de escritura que después nadie vuelve a discutir: el renglón se lee entero, no de izquierda a derecha, y ninguno de los dos lados es el resultado del otro. El juego la sostiene generando desde el principio instancias con la caja a la derecha y con operaciones de los dos lados, para que la asimetría nunca se instale.

## 10. Definición formal

Capa `formal`: texto corto con voz y la balanza al lado, de a una frase. "Una igualdad dice que dos cosas pesan lo mismo." "La igualdad se conserva si se hace exactamente lo mismo en los dos lados." "Dos renglones distintos pueden decir la misma igualdad."

Condiciones y casos especiales, verificados sobre el objeto. Los dos platos vacíos también están nivelados: `0 = 0` es una igualdad y no dice nada útil, y el jugador lo comprueba vaciándolos de a pares. Una igualdad puede ser falsa: si el juego deja una balanza inclinada, no hay nada que conservar y ninguna acción a los dos lados la endereza. La caja puede estar de cualquier lado. Y hay acciones que la balanza no tiene: repartir un plato en tres montones iguales no se hace con toques, y esa imposibilidad se muestra antes de que llegue el nodo 12.

Ya jugado: las tres frases enteras, en la capa concreta. Nuevo: la palabra "igualdad", el caso de los dos platos vacíos y la idea de una igualdad falsa.

## 11. Propiedades

- **La igualdad se conserva bajo la misma acción en ambos lados.** Si `a = b`, entonces `a + c = b + c` y `a − c = b − c`. Solo sumar y restar, porque son las acciones que la balanza tiene; escalar los dos lados llega en el nodo 13 con la llave, y enunciarlo acá sería dar una propiedad que el jugador no puede tocar. Ligada a la barra que no se mueve cuando ocurren los dos toques.
- **La igualdad es simétrica.** Si `a = b`, entonces `b = a`, y en la balanza eso es agarrarla del vástago y darla vuelta: la barra sigue horizontal. Ligada a ese gesto y a las instancias con la caja a la derecha.
- **Dos estados distintos pueden ser la misma igualdad.** `x + 2 = 6` y `x = 4` son la misma afirmación con distinta cantidad de pesas. Ligada a la superposición del antes y el después.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varias balanzas dibujadas; tocar la nivelada cuando aparece la ficha de igual. Los distractores se generan con inclinaciones cada vez más chicas, hasta que hay que mirar la barra y no los montones.
- `explain`: dos animaciones sobre la misma balanza, una que saca lo mismo de los dos platos y otra que saca de uno solo. Tocar la que rompe el equilibrio; el distractor es `inverse_applied_one_side`. Cuando hay una tercera, es un renglón con el resultado escrito de un solo lado, y es `equals_as_operator`.
- `manipulate`: quitar y arrastrar fichas hasta nivelar. La ficha de igual se enciende solo con la barra horizontal y se apaga sola si se vuelve a romper.
- `apply`: balanza nivelada con una caja de un lado; dejar la caja sola sin que se incline en ningún paso intermedio. El ítem no pide el número: pide el camino.
- `generalize`: la balanza se desvanece y quedan fichas con el igual entre ellas; aplicar la misma acción a los dos lados, con la caja a la derecha y con operaciones en los dos lados.
- `transfer`: en el reloj modular de `disc.mod.clock_equivalence`, aplicar el mismo giro a las dos agujas y verificar que siguen marcando lo mismo.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`equals_as_operator`** (`replay_on_mechanic` sobre la balanza). El jugador trata el `=` como el lugar donde va el resultado: frente a `2 + 3 = y + 1` escribe `y = 5`, o en la balanza vacía el plato derecho y apoya ahí la suma del izquierdo. El juego congela, repite el movimiento y deja que la barra se hunda, con un halo sobre la pesa que nadie compensó. Voz: "Ahora un plato pesa 5 y el otro 6. ¿Qué falta para nivelar?". El jugador nivela desde el estado real.
- **`inverse_applied_one_side`** (`replay_on_mechanic` sobre la balanza). El jugador quita dos pesas del plato izquierdo y sigue. El juego congela y repite el gesto en cámara lenta: dos pesas salen, ese plato sube, el otro baja, y un halo marca el plato que nadie tocó. Voz: "Restaste 2 solo de un lado. ¿Qué le falta al otro?". La balanza sigue inclinada y el jugador la nivela desde ahí. Es la de mayor severidad del nodo y la que el nodo 13 hereda entera.

## 13. Generalización

La analogía se retira en `symbolic`, cuando la ficha se aplica al `=` sin que el jugador mire los platos. El retiro es el punto de ruptura llegando: con una constante negativa la balanza física deja de tener objeto y el renglón sigue funcionando donde ella ya no. Los platos vuelven como fantasma a demanda y tras un error, que es donde hacen falta.

Variantes sin ayuda visual, en orden: operaciones en los dos lados (`x + 2 = 4 + 1`); la caja a la derecha (`6 = x + 2`); igualdades sin caja, verdaderas y falsas; la misma caja en los dos lados, que se cancela y deja una igualdad numérica.

Balanzas que no pesan. El nodo termina con dos platos que sostienen cosas que no son cantidades: figuras que tienen que coincidir, relojes que marcan lo mismo, cadenas de colores. El jugador dice qué acción se puede aplicar a los dos lados sin romper la coincidencia y cuál no. Se evalúa que la estructura —dos lados, una afirmación, una acción que se repite— se reconoce con cualquier objeto.

El nodo está en `abstract` cuando el jugador aplica acciones a los dos lados de una línea sin pedir la balanza, escribe una igualdad con la caja de cualquier lado, y distingue una igualdad falsa de una igualdad que todavía no se simplificó. La forma completa de esa capa es la relación de equivalencia, que reaparece en `disc.mod.clock_equivalence`.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, cada uno con una mecánica que no se usó para aprender:

- `alg.eq.one_step` (`chest_key`): el mismo invariante con una llave encima. Es el nodo 13, donde esta arista se junta con la del 12; la transferencia se mide con el cofre porque la balanza ya es conocida.
- `trig.id.double_angle` (`machine_pipe`): una identidad es una igualdad que vale para todo ángulo, y correr la tubería con la misma transformación en los dos extremos la conserva.
- `disc.mod.clock_equivalence` (`gears_sequence`): dos engranajes marcan la misma hora; girar los dos lo mismo conserva la coincidencia y girar uno solo la rompe.
- `linalg.sys.row_operations` (`ledger`): cada fila de una matriz es una balanza y una operación de fila es la misma acción sobre sus dos lados. Es el único destino donde `inverse_applied_one_side` vuelve a estar catalogada, y no es casualidad.

Concepto siguiente: `prealg.inv.operation_as_key` ([12](12-prealg.inv.operation_as_key.md)). Frase puente, narrada sobre la balanza con tres cajas iguales contra doce pesas: "Sabés que hay que hacer lo mismo en los dos platos. Pero quitar de a una no te deja la caja sola nunca. ¿Qué acción hace falta?". Los platos se congelan, la barra se apaga y el nodo 12 empieza con un solo cofre y sin ninguna balanza, porque la pregunta que queda —cuál es la acción— no se contesta con dos platos. Las dos respuestas se encuentran en el nodo 13.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), las dos nativas y de gramática `invariant`. `balance_equal_pans_stay_level` toma los dos lados y las fichas de cada plato: la acción idéntica corre en ambos y los dos estados quedan superpuestos con la línea nivelada encendida en los dos. `balance_remove_one_side_tilts` es la escena propia del nodo y toma además el lado y lo removido: la barra se va y el plato intacto queda marcado. Las dos producen las animaciones de `explain` y las dos se reúsan como distractores en el nodo 13. Ninguna lleva texto rasterizado: las fichas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_compare` ([M](../../M-calculadora/M0-progresion.md)), en la fila `t0`. Acá llega con el `=`, que es lo que el nodo justifica: puesto entre dos expresiones armadas con fichas, la tecla no las evalúa, las pesa, y devuelve una línea derecha o una línea inclinada. Las formas inclinadas con nombre propio llegan con `prealg.ineq.compare_expressions`, que comparte el desbloqueo de la misma tecla. Está disponible en el sandbox, y es la primera tecla de la calculadora que no calcula nada. Si el nodo decae, muestra óxido.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): pesas y cajas por forma, un toque por acción, mano fantasma para el primer par de toques, `explain` entre animaciones, prompts por voz. El `=` que aparece al final no es texto: es la barra encogida, y el jugador la vio encogerse. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en el nivel de barras y llega al renglón en un nivel; lo que no se le ahorra es soltar una ficha sobre un solo lado al menos una vez, porque las tres zonas de drop se aprenden viendo la línea inclinarse.
