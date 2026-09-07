# La tercera llave (`calc1.ftc.integral_undoes_derivative`)

Minijuego del nodo 29 de la espina, "La integral deshace la derivada". Mecánica principal `chest_key`, secundarias `fill_accumulate` y `slope_walker`; analogía `odometer_from_speed`, con `tank_filling` heredada del nodo 28. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/29-calc1.ftc.integral_undoes_derivative.md): un concepto, cuatro dificultades reales (creer que dos cosas distintas son la misma, ver la acumulación como función, manejar las dos direcciones, aceptar lo que la llave no puede saber), dos analogías y una estructura de cofre, un gesto (parar al caminante sobre la curva de nivel y comparar su poste con la aguja del caudal), cinco morphs hasta la barra de evaluación, el diagrama vertical del nodo 12 como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Dos gráficas apiladas. Arriba, la curva de caudal con su aguja, que es el velocímetro. Abajo, vacía al empezar, la curva de nivel que se dibuja sola mientras el tanque se llena, que es el cuentakilómetros. Al costado, un cofre con su cerradura y un llavero de cuatro llaves.

Mapa objeto → concepto de `odometer_from_speed`: lectura del velocímetro → la derivada; lectura del cuentakilómetros → el valor acumulado; distancia del viaje → la integral definida; área bajo la curva de velocidad → la integral como acumulación; leer el cuentakilómetros al salir y al llegar → el teorema fundamental.

De `tank_filling` se activan ahora dos piezas que el nodo 28 declaró y no usó: medidor de nivel → la primitiva; lectura del medidor al arrancar, desconocida → la constante de integración. De `chest_key` viene la estructura, que no es analogía sino esqueleto: cerradura "medir la cuesta", llave "acumular", diagrama vertical con la flecha que baja y la que sube.

El auto hace reconocible el problema; el tanque lo hace verificable, porque sobre la curva de nivel se puede parar al caminante del nodo 26 y medir. Punto de ruptura del auto: `odometer_ignores_reversing`. El cuentakilómetros real suma también al retroceder y la integral descuenta, que es exactamente `integral_ignores_sign`; el minijuego usa esa grieta a favor y pide al jugador que la señale. Las dos analogías se retiran en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: las dos gráficas apiladas ocupan el centro, el tanque es una columna a la derecha unida a la gráfica de abajo, el cofre y el llavero quedan a la izquierda, la franja de tiempo con sus dos marcas corre entre las dos gráficas y, desde `symbolic`, el teclado de fichas al pie. Gestos: `drag`, `tap`, `scrub` y `hold` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Mantener apretado el grifo.** El tanque sube y abajo se dibuja la curva de nivel, punto por punto, en tiempo real.
- **Arrastrar al caminante por la curva de nivel.** Aparece su poste con la pendiente, como en el nodo 26. En cada instante el poste coincide con la aguja del caudal de arriba, y los dos se iluminan juntos.
- **Dar vuelta el grifo.** La curva de nivel baja y el poste del caminante se da vuelta con ella. La coincidencia se mantiene con signo.
- **Arrastrar una llave al cofre.** La cerradura tiene la forma del caminante midiendo la cuesta. La llave de acumular gira y el cofre se abre mostrando la curva de nivel; las otras llegan, giran un cuarto de vuelta y se traban.
- **Tocar el cofre abierto.** Muestra el diagrama vertical del nodo 12 con las mismas flechas: arriba la curva de nivel, la flecha que baja con la cerradura, abajo la curva de caudal, y la llave como la misma flecha reproducida hacia atrás.
- **Mover las dos marcas del cronómetro.** En la curva de nivel se encienden dos alturas y una regla vertical mide la diferencia; arriba, el área entre las marcas se rellena. Los dos números coinciden y cambian juntos.
- **Arrastrar la curva de nivel hacia arriba.** Aparecen varias copias paralelas, la familia. El caminante mide lo mismo en todas y la regla vertical no cambia de largo.
- **Armar la evaluación con fichas.** Desde `symbolic`: el teclado ofrece la primitiva, la barra de evaluación, las dos marcas y el `+ C`.

Errores con consecuencia física, nunca con la palabra "incorrecto": elegir la llave de medir la cuesta donde hacía falta la de acumular la traba en la cerradura; medir la diferencia de niveles de abajo hacia arriba dibuja la regla al revés y el número sale con el otro signo, y el juego lo deja así porque es verdad.

## Invariante matemático

Tres invariantes, uno por mecánica.

`inverse_restores_original` (`chest_key`): la llave devuelve lo que la cerradura cerró. Acá se ve con una salvedad que es el corazón del nodo: devuelve una familia, no un único original, porque la cerradura destruyó la altura de arranque. Se ve confirmarse cuando el cofre abre; se ve romperse a medias cuando adentro hay varias curvas apiladas en vez de una.

`total_independent_of_chunking` (`fill_accumulate`): el nivel alcanzado no depende de cómo se parta el tiempo. Es el invariante del nodo 28 y acá sostiene la segunda parte del teorema: la diferencia de alturas es un número fijo, y por eso puede calcularse sin sumar franjas.

`steepness_independent_of_step_size` (`slope_walker`): la pendiente de la curva de nivel en un instante es un número propio de ese instante. Es lo que hace que el poste sea comparable con la aguja del caudal, que también es un número propio de ese instante.

Un movimiento válido pero inútil (arrastrar la familia entera arriba y abajo cuando ya se vio que la regla no cambia, medir el mismo instante dos veces) no rompe nada: el juego lo ejecuta y, si se repite, la marca del cronómetro que todavía no se movió late como empujón suave.

## Representación visual

Primitiva dominante `invert`, de apoyo `accumulate` y `rate` ([H](../H-progresion-abstraccion.md)).

- `real`: el auto con velocímetro y cuentakilómetros, la película del viaje. Solo se mira.
- `intuition`: las dos agujas y la película detenida; tres desenlaces (con velocímetro alto el cuentakilómetros gira rápido, marca alto, se frena) y después el real. Después, el auto retrocede y la diferencia queda planteada.
- `concrete`: las dos gráficas apiladas, el tanque, el caminante, el cofre y el llavero.
- `visual`: el diagrama vertical del nodo 12 con las mismas flechas y el mismo grosor, y la animación de la flecha que sube como la de la que baja reproducida al revés. El área bajo la curva de caudal se rellena mientras la regla vertical mide en la curva de nivel, los dos del mismo color. El caminante lleva su triángulo de subida y avance y produce un poste que se dibuja como barra, igual a la aguja de arriba.
- `symbolic`: la curva de nivel se nombra con la forma de la integral del nodo 28, el poste se pliega en la prima, la coincidencia se escribe con un igual, la regla se aplana en una resta y la resta se pliega en la barra de evaluación. La familia se contrae en una curva con `+ C`.
- `formal`: las cuatro frases con voz y el diagrama vertical fantasma al lado.

En `visual` todavía no hay letras: las curvas no se llaman `f` ni `F`, las marcas son banderas y la constante es una altura sin nombre.

## Transición simbólica

Cinco pasos sobre el mismo objeto con ids estables, cada uno disparado por un gesto:

1. Curva de nivel → función del extremo: al arrastrar la marca de la derecha por primera vez en `visual`, la curva gana una etiqueta con la forma de la integral del nodo 28, con la marca izquierda fija y la derecha viva. La curva no se reemplaza.
2. Poste → prima sobre esa etiqueta: al parar al caminante, el poste se contrae en la prima aplicada a la etiqueta anterior, con el plegado del nodo 26. Al lado queda la aguja del caudal escrita como valor.
3. Coincidencia → igualdad escrita: al soltar al caminante en un tercer instante con las dos lecturas iguales, las etiquetas se acercan y una barra se contrae entre ellas en el signo igual, como la barra de la balanza del nodo 13.
4. Regla vertical → resta de dos valores: al medir la diferencia de alturas, la regla se aplana en dos etiquetas separadas por un menos. Arriba, el área rellena se contrae en la integral con sus dos marcas, y las dos expresiones quedan a los lados del igual.
5. Resta → barra de evaluación: al repetir la medición en otro tramo, la resta se pliega. La expresión de la primitiva queda una sola vez, con una barra vertical a la derecha y las dos marcas arriba y abajo de la barra. Tocar la barra despliega otra vez la resta.

En paralelo, la familia de curvas se contrae en una sola con `+ C` pegado, y arrastrarla cambia el valor de `C` a la vista.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el diagrama vertical fantasma: si se acumula una cantidad desde una marca fija, lo acumulado es una función del extremo; la pendiente de esa función en cada instante es la cantidad que se está acumulando; por lo tanto, para calcular una acumulación entre dos marcas alcanza con encontrar una función cuya pendiente sea el integrando y restar sus valores en las dos marcas; dos funciones con la misma pendiente en todos lados se diferencian en una constante.

Casos verificados sobre el objeto: hace falta que la curva de caudal no dé saltos en el tramo, y en un salto la curva de nivel tiene un pico y el caminante mide dos valores; con caudal negativo todo vale y el nivel baja; con las marcas juntas la resta da cero; invertir las marcas cambia el signo, y se ve porque la regla se mide al revés; la marca fija de arranque no cambia ninguna diferencia, solo cuál de las curvas de la familia se dibuja.

Los símbolos nuevos son la barra de evaluación y el `+ C`. La barra nace de un problema de repetición: escribir la primitiva dos veces, una por marca, ocupa dos renglones y se presta a errores de copia. El `+ C` nace de un problema distinto: la llave devuelve una familia, porque derivar destruye la altura inicial del tanque, y `C` es el nombre de lo que la llave no puede saber. Las tres entradas de cheatsheet del nodo, `cs.calc1.ftc_part_one_accumulation_derivative`, `cs.calc1.ftc_part_two_evaluate_f_b_minus_f_a` y `cs.calc1.strategy_integral_is_a_key`, quedan a un toque desde el panel lateral.

## Generalización

El auto y el tanque se retiran en `formal`. Antes, en `symbolic`, el auto ya no aparece y el tanque perdió el grifo: quedan las dos curvas sobre ejes con el caminante como herramienta. El cofre se queda como fantasma a demanda hasta `formal`, porque representa estructura y no un objeto.

Variantes sin ayuda visual: integrales definidas cuya primitiva el jugador reconoce por tanteo, adivinando y verificando con la derivada; tramos donde el integrando cambia de signo, con el total separado de la cantidad total; marcas invertidas, con el signo que sale de la regla; funciones acumuladas con el extremo superior variable, donde hay que derivar sin calcular la integral; y familias donde se da un valor conocido en un punto para elegir una sola curva. Después, pares de operaciones que el jugador nunca vio juntas y donde una destruye información: elevar al cuadrado y la raíz, la exponencial y el logaritmo, el cifrado de `csmath.crypto.caesar_shift`. El jugador clasifica cada par según si la llave devuelve un cofre, una familia o dos ramas. Cuando calcula por primitiva sin tanque, deriva una función acumulada sin calcularla, explica por qué el `+ C` no afecta la diferencia y señala qué destruye una cerradura arbitraria, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): acá llega en su forma tardía, la que el nodo 26 anunció y no usó. La cerradura es una operación que no se deshace contando, y por primera vez la llave no devuelve un original único sino una familia, que es la variante del ejemplo que ningún nodo anterior había jugado.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Las dos agujas.** `concrete`, `recognize`. El auto y la película; tocar el momento en que el cuentakilómetros gira más rápido. Sin cofre todavía.
2. **La curva que se dibuja sola.** `concrete`, `manipulate`. El tanque con el grifo y la curva de nivel dibujándose abajo. Solo llenar y mirar.
3. **El caminante sobre el nivel.** `concrete`, `manipulate` y `explain`. Arrastrar al caminante y comparar el poste con la aguja en tres instantes.
4. **El cofre.** `concrete`, `recognize`. La cerradura con forma de caminante, el llavero de cuatro llaves y el diagrama vertical. Aparece `wrong_inverse_choice`.
5. **La regla vertical.** `visual`, `manipulate` y `apply`. Las dos marcas, el área rellena arriba y la diferencia de alturas abajo, con los dos números del mismo color.
6. **La barra de evaluación.** `symbolic`, `apply`. La curva de nivel se nombra, el poste se pliega en prima, la resta se pliega en la barra; el teclado de fichas.
7. **Signo, familia y sin gráfica.** Parámetros: integrandos que cruzan el eje, marcas invertidas, funciones dadas como máquina sin gráfica y la familia con `+ C`. Aparece `integral_ignores_sign`.
8. **Cofres que no son curvas.** `formal` y `abstract`, `generalize`. Las cuatro frases con voz; extremo superior variable; pares de operaciones donde una destruye información, para clasificar qué devuelve la llave.

Qué endurece cada parámetro: el cruce del eje rompe "acumular es siempre subir"; las marcas invertidas rompen "el resultado siempre es positivo"; la ausencia de gráfica separa el teorema del dibujo; el extremo variable rompe "la integral es un número"; los pares con pérdida de información rompen "la llave devuelve el original".

Desafíos de olimpíada: el nodo participa en `ch.calc.area_between_hidden_crossings` de [S](../S-desafios/S0-desafios.md), tier training, donde los límites de integración están ocultos y hay que resolver dónde se cruzan las curvas antes de evaluar con el teorema. Entre las referencias del desafío está `cs.calc1.ftc_part_two_evaluate_f_b_minus_f_a`, y la cheatsheet está abierta de entrada.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro pares de cofres, cada uno con su cerradura y su llave dibujadas; tocar el par donde la llave de acumular abre lo que la de medir la cuesta cerró. Distractores: pares con otra inversa conocida, y un par donde cerradura y llave son la misma operación.
- `explain`: arrastrar la llave de acumular al cofre de la derivada y elegir, entre tres animaciones, la que muestra por qué la altura del tanque en cada instante es justo el caudal acumulado. Una muestra el poste coincidiendo con la aguja; otra, el nivel que copia la forma del caudal en vez de su pendiente; otra, el área tomada como si fuera la altura de la curva de caudal. El distractor elegido clasifica.
- `manipulate`: llenar el tanque siguiendo la curva de caudal y comprobar, con el caminante sobre la curva de nivel, que la pendiente del nivel coincide con el caudal en tres instantes, incluido uno con el grifo dado vuelta.
- `apply`: una función y sus dos extremos; armar con fichas la integral definida como el valor de la primitiva al final menos el del inicio, usando la barra de evaluación. Contra el tiempo objetivo del nodo.
- `generalize`: una función acumulada cuyo extremo superior es una caja; tirando de la caja, descubrir cuál es su derivada. No hay tanque: hay dos curvas sobre ejes y el caminante.
- `transfer`: un cofre anidado con una composición adentro; elegir la llave de sustitución que deshace la composición antes de integrar. Es `calc2.tech.substitution_undoes_chain`. También en `adv.four.inverse_transform`, `prob.rv.cumulative_distribution` y `adv.ode.euler_method`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `integral_ignores_sign`, patrón `replay_on_mechanic` sobre el tanque: el juego congela y repite el llenado en cámara lenta con la curva de nivel dibujándose abajo; en el tramo negativo el grifo se da vuelta, los bloques salen, la curva de nivel baja y la regla vertical se acorta a la vista, con un halo en el cruce. Voz: "Acá el grifo drenaba. ¿El cuentakilómetros de la matemática sube o baja?". El jugador recoloca el total desde el estado real.
- `wrong_inverse_choice`, patrón `key_mismatch` sobre el cofre: la llave llega, gira un cuarto de vuelta y se traba. La cerradura brilla con su forma, que es el caminante con su triángulo, y al lado aparece la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué deshace medir la cuesta?". El llavero completo sigue disponible. Es la de mayor severidad del nodo.

Los distractores de `explain` y de `apply` se generan desde las reglas `detect` de estas dos y desde las de los tres prerequisitos directos, en particular `limit_as_reaching`, que llega por el nodo 28.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `chest_scene_integral_key_opens_derivative`, ruta mixta: pre-renderizada para la apertura de cada nivel y nativa para dibujarse sobre las curvas del jugador. La cerradura muestra su forma de caminante midiendo la cuesta, el llavero rota, la llave de acumular entra y gira, y el diagrama vertical del nodo 12 se reproduce hacia atrás; gramática `invert`. Parametrizada por la función y el intervalo, produce el nivel 4 y es la imagen de cheatsheet de `cs.calc1.strategy_integral_is_a_key`.
- `fill_scene_accumulation_rate_equals_height`, nativa. Las dos gráficas apiladas, el área que se rellena arriba mientras la curva de nivel se dibuja abajo, y el caminante con su tangente cuya lectura coincide con la altura de la curva de arriba; gramática `accumulate` con `rate` encima. Parametrizada por la función de caudal, la de nivel y el instante, produce los niveles 2, 3 y 5 y las animaciones de `explain`.
- Reusadas: `fill_scene_rectangles_under_curve` del nodo 28 y `slope_scene_secants_collapse_to_tangent` del nodo 26, como distractores de `explain` y como fantasmas a demanda; `chest_wrong_key_stays_shut` del nodo 12 para el patrón de llave equivocada.
- Ninguna lleva texto rasterizado: `∫`, la barra de evaluación, `C`, las marcas y los valores los dibuja el runtime según el locale; el auto, el velocímetro, el cuentakilómetros, el tanque, el caminante y el cofre son assets propios ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_rate_and_level_pair`: `rate_family` en {constant, linear, polynomial, trig} (`constant` y `linear` hasta el nivel 3); `crosses_axis` (falso hasta el nivel 7); `interval`; `sample_instants` (cuántos instantes se piden comparar, 1 en el nivel 2 y 3 desde el 3); `seed`.
- `gen_key_ring`: `size` (4 llaves); `distractors` desde `detect` de `wrong_inverse_choice` (la misma operación, la inversa de otra pareja, la función inversa del nodo 21); `labeled` (falso en el nivel 4).
- `gen_evaluation_item`: `antiderivative_family` en {power, trig, exponential}; `bounds_range`; `reversed_bounds` (desde el nivel 7); `variable_upper_bound` (desde el nivel 8); `given_point_for_c` (desde el nivel 7, para elegir una curva de la familia).
- `gen_lossy_pair`: pares de operaciones donde una destruye información, con la etiqueta de qué devuelve la llave (un cofre, una familia, dos ramas). Solo en el nivel 8 y en `generalize`.
- `gen_tile_keyboard`: `symbols` (subconjunto de la primitiva, la barra de evaluación, las marcas, `+ C`, el signo de integral); `distractors` desde `detect` de las dos misconceptions del nodo.

**Literacy soportada:** de `short_text` a `full_text`. Las capas `real`, `intuition` y `concrete` se juegan sin leer (las dos agujas, apretar el grifo, arrastrar al caminante, elegir la llave por forma, mover las marcas, mano fantasma, `explain` entre animaciones), pero el mínimo es `short_text` porque desde `symbolic` se leen la barra de evaluación, el `+ C` y los enunciados cortos de las dos partes del teorema. En `full_text` se agregan las condiciones de validez escritas y el enunciado clásico.

**Instrucción por demostración:** la primera vez, una mano fantasma mantiene apretado el grifo, el tanque sube y abajo se dibuja la curva de nivel; después suelta, arrastra al caminante hasta un instante y aparece el poste, que se ilumina junto con la aguja del caudal. La escena vuelve al inicio y el grifo late. Se repite solo si el jugador se queda quieto. La demostración del cofre (nivel 4) es nueva y se muestra una vez, con el llavero completo a la vista. Las de llenar el tanque y de medir la pendiente no se repiten: son las de los nodos 28 y 26 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions, cantidad de instantes de comparación exigidos y espera de la demostración viven en [K](../K-evaluacion.md).
