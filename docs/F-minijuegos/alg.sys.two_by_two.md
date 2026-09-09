# Dos balanzas, una caja (`alg.sys.two_by_two`)

Minijuego del nodo 16 de la espina, "Dos balanzas comparten cajas". Mecánica principal `balance`, secundaria `grid_stretch`; analogía `two_balances_shared_boxes`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/16-alg.sys.two_by_two.md): un concepto, cinco dificultades reales (que una caja marcada pesa lo mismo en toda la mesa, que una sola igualdad no decide, que hay dos caminos legales, que una balanza entera se puede escalar, y que puede no haber solución o haber infinitas), una analogía con dos objetos ligados, dos gestos (tocar una caja para cambiarla por su peso, y volcar una balanza sobre otra), cinco pasos de desvanecimiento, la balanza como visualización dominante, retiro en `symbolic` cuando aparecen los casos degenerados. Acá se fija cómo se juega.

## Analogía

Dos balanzas niveladas, una arriba de la otra, sobre la misma mesa. Cada una tiene cajas cerradas en un plato y pesas sueltas en el otro. Las cajas llevan marcas: las que tienen la misma marca están dibujadas exactamente iguales y contienen exactamente lo mismo.

Mapa objeto → concepto: dos balanzas → dos ecuaciones; las mismas cajas marcadas en las dos → incógnitas compartidas; cambiar una caja por su peso conocido → sustitución; estirar una balanza por el borde → multiplicar una ecuación entera; volcar una balanza sobre la otra → sumar ecuaciones; cajas de la misma marca que se apilan y se cancelan → eliminación; las dos niveladas a la vez → solución simultánea.

La balanza aporta el invariante conocido, que cada una sobrevive a acciones idénticas en sus dos platos. La marca aporta el invariante nuevo, que es el nodo entero: una caja marcada pesa lo mismo en toda la mesa. Punto de ruptura: `contradictory_or_redundant_balances`. Una mesa real no sostiene dos balanzas que se contradicen, ni distingue una balanza de la misma balanza estirada; por eso el objeto se desvanece en `symbolic`, justo donde esos dos casos hay que mirar de frente ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: las dos balanzas apiladas ocupan el centro, el llavero del nodo 13 abajo, la pila de renglones del nodo 14 al costado y una manija en el borde derecho de cada balanza. Gestos: `drag`, `tap` y `pinch`, con la manija de borde como alternativa al pinch ([E0](../E-mecanicas/E0-catalogo.md)).

- **Resolver una balanza con llaves.** Todo el nodo 14 sigue disponible sobre cada balanza por separado: arrastrar una llave por los dos platos, la pila de renglones, la lectura de la envoltura.
- **Aislar una caja.** Cuando una caja queda sola en un plato nivelado, se abre y muestra su peso. En ese instante todas las cajas de la misma marca de la mesa se vuelven transparentes a la vez y muestran el mismo peso, en las dos balanzas.
- **Tocar una caja transparente.** La cambia por sus pesas. La balanza sigue nivelada. Ese toque es la sustitución y es un gesto de un paso.
- **Intentar cambiar una caja por un peso que nadie mostró.** La caja se sacude y no se abre. No se puede inventar un peso: solo propagar uno que ya se vio.
- **Cambiar una caja en una balanza y no en su gemela.** Esa balanza se inclina y las dos gemelas se separan a la vista, una llena y una vacía. Ninguna cede. Es la consecuencia física del error central del nodo y no lleva ninguna palabra.
- **Estirar una balanza por la manija.** Todo lo que tiene encima se duplica o triplica en los dos platos, cajas incluidas, y la barra no se mueve. No hay manija por término: el estirado es del objeto entero.
- **Volcar una balanza sobre la otra.** Con un arrastre, los platos correspondientes se juntan y los términos se ordenan por tipo antes de apilarse. Las cajas de la marca compartida se suman, y si una entró restando se cancelan y desaparecen. Queda una sola balanza con un solo tipo de caja.
- **Tocar las dos cajas abiertas.** Devuelve los dos pesos adentro y las dos balanzas originales quedan niveladas. La verificación de este nodo pasa dos controles, no uno.

En `symbolic` la superficie cambia de forma y no de reglas. Se heredan las zonas de drop del nodo 13 y la pila de renglones del 14, y se agregan dos: la llave que abraza los dos renglones, que al tocarse resalta todas las apariciones de una misma letra en las dos líneas, y el arrastre de un renglón sobre otro, que es volcar.

## Invariante matemático

Dos invariantes, y sostener los dos a la vez es el nodo.

`equality_under_identical_actions` (balanza): cada igualdad sobrevive a acciones idénticas en sus dos lados, incluidas las que actúan sobre la igualdad completa. Se ve romperse cuando una llave pasa por un solo plato, y también cuando el jugador estira solo un lado de una balanza.

**Una caja marcada pesa lo mismo en toda la mesa.** No es un invariante de la mecánica sino de la escena, y no vive en la barra sino en la marca. Se ve confirmarse cuando todas las gemelas se abren juntas; se ve romperse cuando dos gemelas quedan una llena y una vacía. Es lo que el minijuego existe para instalar.

Un movimiento válido pero inútil no rompe ninguno: estirar una balanza por un factor que no hace coincidir ninguna cantidad de cajas, volcar cuando no se cancela nada, sustituir una letra por una expresión que la vuelve a contener. La balanza sigue nivelada, el renglón sale más cargado y el renglón anterior late una vez. Ninguna explicación se dispara.

## Representación visual

Primitiva dominante `invariant`, de apoyo `deform` y `partition` ([H](../H-progresion-abstraccion.md)).

- `real`: el puesto de mercado del nodo 13 con dos clientes y dos tickets, y ningún precio escrito. Solo se mira.
- `intuition`: una sola balanza nivelada con dos tipos de caja. El juego ofrece tres pesos posibles para una y muestra que la balanza se nivela igual con los tres. Después baja la segunda balanza con una caja marcada igual, y el jugador predice cuál de los tres sirve también ahí. Tres desenlaces dibujados, incluido el de cambiar la caja en una sola balanza.
- `concrete`: dos balanzas con pesas y cajas marcadas, llavero, manija de borde. Nada escrito.
- `visual`: cada balanza en dos columnas de barras proporcionales, las cajas como barras de longitud desconocida, y un **hilo** entre las dos barras de la misma marca. Estirar una estira la otra; resolver una fija las dos. Cada acción muestra antes y después con las dos barras niveladas resaltadas a la vez.
- `symbolic`: dos renglones alineados por el `=` y abrazados por una llave; el hilo se conserva como resaltado sincronizado al tocar una letra. El estirado escribe un multiplicador a la izquierda del renglón; el vuelco escribe un renglón nuevo debajo.
- `formal`: la definición corta con voz y las dos balanzas fantasma al lado.

No hay grilla con coordenadas en ninguna capa jugable: el par de valores no se dibuja como punto porque las coordenadas nacen en `alg.fn.graph_as_picture`, que llega después.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables.

1. Dos cajas marcadas → dos letras: al aislar la primera caja en `visual`, la marca `A` se contrae en `x` y la `B` en `y`, **en las dos balanzas a la vez**, porque las barras están ligadas. Es el primer morph del curriculum que afecta a dos objetos separados en pantalla, y es el punto del nodo.
2. Dos barras → dos renglones y una llave: los platos se desvanecen, cada barra se contrae en un `=`, los renglones quedan alineados y una llave los abraza por la izquierda. Tocarla resalta todas las apariciones de una letra en las dos líneas.
3. Tocar una caja → sustituir: el toque que cambiaba la caja por sus pesas cambia la letra por su valor; la letra se hincha, se rompe y aparece la expresión, en las dos líneas si aparece en las dos.
4. Estirar → factor delante del renglón: aparece un multiplicador a la izquierda y el renglón siguiente se escribe con todos sus términos repartidos, con la distributiva del nodo 15 a la vista.
5. Volcar → sumar renglones: al arrastrar un renglón sobre el otro se juntan término a término, los que se cancelan se desvanecen y queda un renglón con una sola letra. Desde ahí termina el nodo 14.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre las dos balanzas fantasma: un sistema son dos igualdades que hablan de las mismas cantidades; una solución es un par de valores que deja las dos niveladas a la vez; todo lo que se le hace a una igualdad completa la conserva, sea multiplicarla entera, sumarle otra igualdad o cambiar una letra por algo que vale lo mismo. Propiedades: una caja marcada pesa lo mismo en toda la mesa; sustituir conserva las dos igualdades; multiplicar una igualdad entera la conserva; si `a = b` y `c = d`, entonces `a + c = b + d`; una igualdad sola con dos incógnitas no decide. Casos: al eliminar puede quedar `0 = 5`, y entonces no hay par posible, o `0 = 0`, y entonces hay infinitos; nombrarlos es `alg.sys.parallel_or_same_line`. Sin símbolos nuevos: lo nuevo es la llave que abraza los dos renglones y declara que una misma letra nombra la misma cantidad en las dos líneas. Se guarda en `cs.alg.substitution_method` y `cs.alg.elimination_method`.

## Generalización

Las balanzas se retiran en `symbolic`, y el punto de ruptura fija el momento: en cuanto el sistema puede ser incompatible o redundante, dos balanzas sobre una mesa dejan de representarlo. El hilo entre las barras ligadas se queda hasta `formal`, porque es lo que la llave representa.

Variantes sin ayuda visual, en orden: una letra ya aislada en una línea, que sale por sustitución directa; coeficientes que se cancelan al volcar sin estirar; coeficientes que obligan a estirar una fila; coeficientes que obligan a estirar las dos; constantes y soluciones negativas; soluciones fraccionarias; y por último sistemas incompatibles y redundantes, donde lo que hay que reconocer es que el método terminó sin dar un par. Después, dos balanzas cuyas cajas no contienen pesos sino acciones —una caja "girar" y una caja "pintar", con dos recetas y dos resultados—, donde el jugador propaga lo que una restricción enseñó o combina las dos para que una acción desaparezca. Cuando elige entre sustituir y volcar mirando la forma del sistema y no por costumbre, y distingue los dos casos degenerados por lo que quedó escrito, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de frutas de [H](../H-progresion-abstraccion.md) (convención 4 de la plantilla). Ese ejemplo va de este nodo a `linalg.map.inverse_and_systems`, y sus etapas se reparten así: **las etapas 1 a 3 son de este nodo** y las 4 a 6 son de `linalg.map.linear_transformation_2d` y `linalg.map.inverse_and_systems`. Con dos salvedades. La etapa 1, tres manzanas iguales que suman un total, tiene una sola incógnita y también se juega desde `alg.eq.one_step`: acá se usa como entrada, para mostrar que una fila con un solo tipo de fruta se resuelve sola y no necesita compañera. Y la etapa 3, donde la fruta morfa en letra y sumar dos filas elimina una incógnita, es el corazón de este minijuego y ocurre en su nivel 4: lo que H describe como ledger acá ocurre sobre la balanza, porque el objeto tiene que poder inclinarse cuando la sustitución se hace mal, y una fila de libro de cuentas no se inclina. El ledger reaparece como piel en `alg.eq.word_to_equation`, con los recibos del mercado.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Una caja en dos lugares.** `concrete`, `recognize`. Dos balanzas con cajas de dos marcas; una de las balanzas ya tiene una caja sola en un plato. Tocar la caja que aparece en las dos y ver a las gemelas abrirse juntas. Sin resolver nada todavía.
2. **Pasar el peso.** `concrete`, `manipulate`. La primera balanza se resuelve con una llave; después se toca la gemela de la segunda balanza y se cambia por sus pesas; después se resuelve la segunda. Sustitución pura, sin estirar ni volcar.
3. **Volcar.** `concrete`, `explain` y `manipulate`. Aparecen sistemas donde ninguna caja está sola pero una marca entra sumando en una balanza y restando en la otra. Volcar las cancela. Aparece el error de cambiar una caja en una sola balanza.
4. **Hilos y barras.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; las balanzas son de barras, el hilo une las gemelas y el morph de la fruta a la letra ocurre en las dos a la vez.
5. **Dos renglones y una llave.** `symbolic` primera mitad, `manipulate` y `apply`. Los renglones aparecen junto a las balanzas y se transforman en sincronía; nace la llave; el estirado escribe su multiplicador.
6. **Balanzas fantasma.** `symbolic` segunda mitad, `apply` y `generalize`. Los renglones quedan solos y las balanzas se piden con un toque. Parámetros: coeficientes que obligan a estirar una fila y después las dos, constantes y soluciones negativas, rango numérico mayor.
7. **Sin par, o con todos.** `formal` y `abstract`, `generalize`. Parámetros: soluciones fraccionarias y, al final, sistemas incompatibles y redundantes. Definición corta con voz, los dos renglones degenerados a la vista, y las balanzas con cajas de acciones. Acá el teclado deja de ofrecer multiplicadores prearmados: el jugador arma el factor de estirado con fichas.

Qué endurece cada parámetro: que ninguna caja empiece aislada obliga a elegir camino en vez de seguir el único disponible; los coeficientes que no se cancelan solos obligan a estirar, que es el gesto que `linalg.sys.row_operations` va a heredar; los negativos rompen la balanza física y fuerzan los renglones; las fracciones separan "volcar" de "contar cajas"; los sistemas degenerados rompen la expectativa de que todo problema tiene una respuesta, que es la única forma de preparar `alg.sys.parallel_or_same_line`.

Desafíos de olimpíada: el nodo desbloquea `ch.alg.two_receipts_system` ([S](../S-desafios/S0-desafios.md)), de tier entrenamiento, donde el dato oculto es la segunda ecuación y hay que leerla del segundo recibo antes de poder eliminar. Es el desafío que corresponde exactamente a este nodo y su cheatsheet entra abierta con `cs.alg.elimination_method` y `cs.alg.substitution_method`. Participa además en `ch.alg.symmetric_sum_of_squares`, de tier internacional, donde el sistema aparece como paso intermedio junto a las baldosas del nodo 15.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: balanza de arriba con dos cajas `A` y una `B`; balanza de abajo con una `A` y tres `B`. Tocar la caja que aparece en las dos.
- `explain`: dos animaciones. En una, la `A` que se abrió arriba se cambia por sus pesas abajo y las dos siguen niveladas; en la otra, la `A` de abajo se cambia por otro peso y esa balanza se derrumba mientras su gemela de arriba queda intacta con la caja llena. Tocar la que rompe una de las balanzas.
- `manipulate`: `x + y = 10` y `x − y = 2` sobre dos balanzas. Volcar la de arriba sobre la de abajo, ver las `y` cancelarse, abrir la `x` con una llave y después volver a la primera balanza para abrir la `y`.
- `apply`: dos recibos del mercado, tres bolsas de harina y una de azúcar por un total, y una de harina y dos de azúcar por otro. Armar las dos balanzas y arrastrar las fichas de precio que cumplen los dos recibos, contra el tiempo objetivo del nodo.
- `generalize`: sin balanzas, `2a + 3b = 12` y `4a − b = 10` con la llave. Elegir entre sustituir o volcar, estirar la fila que haga falta y resolver. Y dos balanzas con cajas "girar" y "pintar": tocar la combinación que deja una sola acción.
- `transfer`: en la grilla estirada de `linalg.map.inverse_and_systems`, tocar el punto donde dos rectas se cruzan y verificar que es la entrada que la matriz manda a la salida pedida. También en `linalg.sys.row_operations` (estirar una fila y volcarla) y en `linalg.basis.in_span_or_not` (decidir si el par existe en vez de calcularlo).

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)). El nodo no declara ninguna propia en su registro del grafo: las que produce están catalogadas antes y se evalúan allí.

- `inverse_applied_one_side`, patrón `replay_on_mechanic` sobre la balanza, catalogada en `alg.eq.one_step` y `prealg.eq.balance`. Sube de frecuencia porque hay cuatro platos; `linalg.sys.row_operations` la declara como propia, lo que confirma que es el error natural de operar sobre filas.
- `sign_flip_on_move`, mismo patrón, catalogada en `alg.eq.one_step` y `alg.eq.multi_step`. Aparece al volcar.
- `variable_as_label`, mismo patrón sobre el libro de cuentas, catalogada en `prealg.var.unknown_as_box` y `alg.expr.distributive_tiles`. Aparece al apilar cajas de marcas distintas.
- `distribute_over_wrong_op`, patrón `missing_piece_tiles` sobre las baldosas, catalogada en `alg.expr.distributive_tiles`. Aparece al estirar una balanza y multiplicar solo el primer término; el replay corre sobre el piso del nodo 15.

El error propio del nodo —cambiar una caja en una balanza y no en su gemela— no tiene entrada en el catálogo, y el juego lo resuelve con la consecuencia física: las gemelas se separan y ninguna balanza cede. Es también el distractor de `explain`, así que alimenta Understanding aunque no clasifique en ninguna categoría de L.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `balance_two_scales_shared_boxes`, nativa. Las dos balanzas del jugador con las cajas marcadas, el hilo entre las gemelas, la copia de un valor de una escena a la otra, el estirado de una fila entera y el vuelco término a término con las cancelaciones; gramática `invariant`, con las dos barras niveladas resaltadas a la vez. Parametrizada por las dos ecuaciones y por cuál es la letra compartida, produce también las animaciones de `explain`.
- `grid_two_lines_cross`, nativa, con papel acotado. Se usa solo en los ítems de `transfer` y como mirada hacia adelante en el último nivel, porque dibujar el par como punto de una grilla necesita coordenadas y las coordenadas nacen en `alg.fn.graph_as_picture`. Su vida interactiva completa es `alg.sys.lines_intersect`.
- Reusadas: `balance_key_both_sides` (nodo 13) para los pasos de una sola llave y `balance_two_keys_in_order` (nodo 14) para el tramo final con una sola letra. Ninguna escena lleva texto rasterizado; las marcas de las cajas son formas y las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_two_balance_system`: `coeff_range` (1 a 5 en los niveles 1 a 5, hasta 12 desde el 6); `constant_range`; `solution_range` (enteros positivos hasta el nivel 5, negativos desde el 6, fracciones simples en el 7); `isolated_box` (verdadero en los niveles 1 y 2, falso desde el 3); `cancels_without_scaling` (verdadero en el nivel 3, falso desde el 6); `scale_rows_needed` (0, 1 o 2); `degenerate` en {none, inconsistent, redundant}, solo distinto de `none` en el nivel 7; `seed`.
- `gen_box_marks`: `marks` (2); `shape_distance`, que fija cuán distintas se ven dos marcas, para que reconocer la gemela sea fácil al principio y exigente después; `decoy_mark`, una tercera marca que aparece en una sola balanza y no sirve para nada.
- `gen_receipt_pair`: `items` (2); `quantity_range`; `price_range`; `integer_prices_only`. Produce los ítems de `apply` con la piel del mercado y comparte parámetros con el generador del desafío de dos recibos.
- `gen_action_boxes`: cajas cuyo contenido es una acción con efecto visible (girar, pintar, duplicar) y dos recetas que las combinan, para el cierre de `generalize`.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer —las gemelas se abren juntas, la separación entre una llena y una vacía no necesita explicación, estirar y volcar son gestos—, pero desde el nivel 5 los renglones llevan letras y multiplicadores, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma resuelve la balanza de arriba hasta dejar una caja sola, la caja se abre, todas las gemelas de la mesa se vuelven transparentes a la vez, y la mano toca la gemela de abajo, que se cambia por sus pesas sin que la balanza se mueva. La escena vuelve al inicio y las dos gemelas laten juntas. La demostración de volcar es aparte, en el nivel 3: la mano toma una balanza por el borde, la estira hasta que las cajas coinciden y la arrastra sobre la otra. La demostración de la llave por los dos platos no se repite: es la del nodo 13 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
