# 29 — La integral deshace la derivada (`calc1.ftc.integral_undoes_derivative`)

> Locale `es`: "La integral deshace la derivada". Minijuego: [La tercera llave](../../F-minijuegos/calc1.ftc.integral_undoes_derivative.md).

**Nodo:** `calc1.ftc.integral_undoes_derivative` · **Área:** calc1 · **Nivel:** 5 · **Primitiva:** `invert` · **Mecánica principal:** `chest_key` (secundarias `fill_accumulate` y `slope_walker`) · **Literacy:** `short_text` · **Analogía:** `odometer_from_speed` (con `tank_filling` heredada del nodo 28)

## 1. Concepto

Acumular y medir la pendiente son la misma operación vista de los dos lados. Al terminar, el jugador sabe que la velocidad a la que sube el nivel de un tanque es exactamente el caudal del grifo, que por eso una integral definida se calcula buscando una función cuya pendiente sea el integrando, y que esa función no es única: le falta saber en qué altura empezó. Antes tenía dos mecánicas separadas, el caminante que mide cuestas y el balde que acumula. Ahora tiene una sola, con dos direcciones.

Es el tercer regreso de la llave ([E0](../../E-mecanicas/E0-catalogo.md)). El primero fue restar deshace sumar; el segundo, la función inversa; este es el más grande, porque las dos operaciones se aprendieron en nodos que no se cruzaban.

## 2. Prerequisitos

- `calc1.deriv.rate_as_slope_limit` (nodo 26): la pendiente exacta. Se usan el caminante sobre la curva, el poste con la lectura, `f'(x)` y `dy/dx`, y la idea de que la pendiente en cada lugar forma una función nueva.
- `calc1.int.accumulation` (nodo 28): acumular franjas. Se usan el tanque, el grifo, las franjas, `∫` con sus dos marcas y `dx`, y la misconception `integral_ignores_sign`.
- `prealg.inv.operation_as_key` (nodo 12): la operación como llave. Se usan el llavero, el diagrama vertical de cofre y llave, la llave que no gira y `wrong_inverse_choice`.

La arista 29 ← 12 es la que no sigue el orden escolar y es la más importante del nodo. La escuela presenta el teorema fundamental como un resultado nuevo y difícil, al final del curso. Acá llega como el reencuentro con un dibujo que el jugador hace desde los siete años: el diagrama vertical de la llave. El juego puede decir, con la misma flecha que usó para `+5` y `−5`, "esto ya lo hiciste". Que la arista exista en la espina es lo que habilita esa frase.

No hay arista desde `calc1.deriv.rules_as_structure`. Es deliberado: el teorema se descubre midiendo la pendiente del nivel, no derivando expresiones. La tabla de primitivas llega después, en `calc1.ftc.antiderivative_family`.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar la fórmula de evaluación. Son cuatro capacidades:

1. **Creer que dos cosas distintas son la misma.** El jugador aprendió a acumular sin derivada y a derivar sin acumular. Nada en su experiencia sugiere que se relacionen. La capacidad es aceptar una coincidencia que él mismo puede verificar, y no aceptarla porque se la dijeron.
2. **Ver la acumulación como función.** Mientras la integral era un número entre dos marcas, no había nada que derivar. Hay que mover la marca de la derecha y ver que el total cambia con ella: recién ahí lo acumulado es una función del extremo.
3. **Manejar las dos direcciones.** Derivar lo acumulado devuelve el caudal; acumular el caudal devuelve la diferencia de niveles. Son las dos partes del teorema y son la misma llave girando en un sentido y en el otro. Confundir cuál es cuál produce `wrong_inverse_choice` en su forma más costosa.
4. **Aceptar lo que la llave no puede saber.** Derivar destruye la altura inicial del tanque. La llave devuelve una familia de cofres y hace falta un dato más para elegir uno. Es el `+ C`, y es la primera vez que el jugador se encuentra con una llave que no devuelve un solo original.

Las cuatro son independientes: la primera y la segunda viven en el tanque con el caminante encima, la tercera en el llavero, la cuarta en la familia de curvas.

## 4. Problema intuitivo

Un auto con velocímetro y cuentakilómetros. El viaje ya ocurrió y quedó filmado: se ve la aguja del velocímetro moverse todo el tiempo. La pregunta, por voz o por gesto: sin volver a mirar el velocímetro, ¿cuántos kilómetros fueron?

En `intuition` el juego muestra las dos agujas al mismo tiempo y detiene la película en un momento cualquiera. Tres desenlaces dibujados: cuando el velocímetro marca alto, el cuentakilómetros gira rápido; cuando marca alto, el cuentakilómetros marca alto; cuando marca alto, el cuentakilómetros se frena. El jugador elige y después ve. El primero es el correcto, y es todo el teorema dicho sin una sola letra.

Después el auto retrocede un tramo. El cuentakilómetros de verdad sigue sumando, y el marcador de posición baja. La escena deja esa diferencia planteada y prepara el signo.

## 5. Analogía del mundo real

`odometer_from_speed` (mecánica `fill_accumulate`), la del YAML. Mapa: lectura del velocímetro → la derivada; lectura del cuentakilómetros → el valor acumulado; distancia del viaje → la integral definida; área bajo la curva de velocidad → la integral como acumulación; leer el cuentakilómetros al salir y al llegar → el teorema fundamental. Invariante: la velocidad a la que cambia el cuentakilómetros es lo que marca el velocímetro, en todo instante. Ruptura: `odometer_ignores_reversing`. El cuentakilómetros de un auto real suma también cuando se retrocede, y la integral no: descuenta. Es la misma grieta que `integral_ignores_sign`, y el nodo la usa a favor, porque el jugador puede señalar dónde el objeto real se aparta de la matemática. Se retira en `formal` ([G0](../../G-analogias/G0-reglas.md)).

`tank_filling` (mecánica `fill_accumulate`) sigue disponible y es la que se usa para el descubrimiento. Mapa heredado del nodo 28, con dos piezas que recién ahora se activan: medidor de nivel → la primitiva; lectura del medidor al arrancar, desconocida → la constante de integración. Que esas dos piezas estuvieran declaradas desde el nodo 28 y no se usaran es intencional: el mapa estaba completo antes de que el jugador supiera para qué.

Por qué dos: el auto es lo que hace reconocible el problema y el tanque es lo que lo hace verificable. Sobre el tanque el jugador puede poner al caminante del nodo 26 encima de la curva de nivel y medir su pendiente; sobre el auto no puede caminar. El cofre es la tercera piel y no es una analogía sino la estructura: cerradura "medir la cuesta", llave "acumular".

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `chest_key` es la mecánica principal y provee la estructura: el cofre con su cerradura, el llavero y el diagrama vertical del nodo 12. `fill_accumulate` provee el tanque y la curva de nivel. `slope_walker` provee el caminante que mide la pendiente de esa curva. Las tres se encuentran en un gesto: parar al caminante sobre la curva de nivel en un instante y comparar su poste con la aguja del caudal ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap`, `scrub` y `hold`.

1. Dos gráficas apiladas. Arriba, la curva de caudal con su aguja. Abajo, vacía, la curva de nivel que se va a dibujar sola mientras el tanque se llena.
2. Demostración: una mano fantasma mantiene apretado el grifo. El tanque sube y abajo se dibuja la curva de nivel. La mano suelta, arrastra al caminante hasta un instante de esa curva y aparece el poste con su pendiente. El poste y la aguja del caudal marcan lo mismo y se iluminan a la vez. La escena vuelve al inicio.
3. El jugador llena el tanque y arrastra al caminante. En cada instante el poste coincide con la aguja: donde el caudal es máximo el nivel es lo más empinado, donde el grifo está cerrado el nivel es plano. Al dar vuelta el grifo la curva baja y el poste se da vuelta con ella.
4. Aparece el cofre. La cerradura tiene la forma del caminante midiendo la cuesta y el llavero ofrece cuatro llaves, una de las cuales es el tanque acumulando. La correcta gira y el cofre se abre mostrando la curva de nivel; las otras se traban. Adentro está el diagrama vertical del nodo 12, con las mismas flechas: arriba la curva de nivel, la flecha hacia abajo con la cerradura, abajo la curva de caudal, y la llave como la misma flecha hacia atrás.
5. El jugador toca las dos marcas del cronómetro. En la curva de nivel se encienden dos alturas y una regla vertical mide la diferencia; arriba se llena el área entre las marcas. Los dos números coinciden.
6. El jugador arrastra la curva de nivel entera hacia arriba. El caminante mide lo mismo en todos lados y el área no cambia. Aparecen varias copias apiladas y paralelas: la familia.
7. Éxito: el cofre queda abierto con el diagrama y la regla vertical al lado. Sin cartel.

Errores con consecuencia física: si el jugador elige la llave de derivar donde hacía falta acumular, la llave se traba. Si mide la diferencia de niveles al revés, la regla vertical se dibuja hacia abajo y el número sale con el otro signo, y el juego lo deja así, porque es verdad. Nada se llama "incorrecto".

## 7. Representación visual

Capa `visual`, con la primitiva dominante `invert` y dos de apoyo de [H](../../H-progresion-abstraccion.md).

`invert` (dominante). El diagrama vertical del nodo 12, con las mismas flechas y el mismo grosor: arriba la curva de nivel, abajo la curva de caudal, una flecha bajando con la cerradura y una subiendo con la llave. Lo que se conserva es que la animación de la flecha que sube es la de la que baja reproducida al revés. Lo que se desplaza es el objeto, que va y vuelve entre los dos renglones sin cambiar de identidad.

`accumulate` (apoyo). El área bajo la curva de caudal entre las dos marcas se rellena, y a la vez la regla vertical mide la diferencia de alturas en la curva de nivel. Los dos números se dibujan del mismo color, y cambian juntos cuando el jugador mueve una marca.

`rate` (apoyo). El caminante sobre la curva de nivel con su triángulo de subida y avance, exactamente como en el nodo 26. El poste que produce se dibuja como una barra, y la aguja del caudal se dibuja como la misma barra en la gráfica de arriba.

Todavía no hay letras: las curvas no se llaman `f` ni `F`, las marcas son banderas y la constante es una altura sin nombre.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Curva de nivel → función del extremo.** Al arrastrar la marca de la derecha por primera vez en `visual`, la curva gana una etiqueta que conserva la forma de la integral del nodo 28, con la marca izquierda fija y la derecha viva. La curva no se reemplaza: se nombra.
2. **Poste → prima sobre esa etiqueta.** Al parar al caminante, el poste se contrae en la prima aplicada a la etiqueta anterior, con la animación de plegado del nodo 26. Al lado queda la aguja del caudal escrita como valor.
3. **Coincidencia → igualdad escrita.** Al soltar al caminante en un tercer instante con las dos lecturas iguales, las etiquetas se acercan y una barra se contrae entre ellas en el signo igual, como la barra de la balanza del nodo 13. Es la primera parte del teorema.
4. **Regla vertical → resta de dos valores.** Al medir la diferencia de alturas, la regla se aplana en dos etiquetas separadas por un menos. Arriba, el área rellena se contrae en la integral con sus dos marcas, y las dos expresiones quedan a los lados del igual.
5. **Resta → barra de evaluación.** Al repetir la medición en otro tramo, la resta se pliega: la primitiva queda escrita una sola vez, con una barra vertical a la derecha y las dos marcas arriba y abajo. Tocar la barra despliega otra vez la resta.

En paralelo, la familia de curvas paralelas se contrae en una sola con un `+ C` pegado, y arrastrarla cambia el valor de `C` a la vista.

## 9. Notación matemática

Quedan las dos partes del teorema escritas, la barra de evaluación y el `+ C`.

Por la regla de oro de [H](../../H-progresion-abstraccion.md), cada símbolo llega con su problema. `∫`, `dx` y las dos marcas llegaron en el nodo 28; `f'` y `dy/dx`, en el 26. Lo nuevo son dos piezas.

La **barra de evaluación**, con las dos marcas arriba y abajo, nace de un problema de repetición: calcular una integral definida obliga a escribir la primitiva dos veces, una con cada marca, y en cuanto tiene más de dos términos eso ocupa dos renglones y se presta a errores de copia. La barra dice "esta expresión, en el de arriba menos en el de abajo" escribiéndola una sola vez.

El **`+ C`** nace de un problema más incómodo: la llave no devuelve un cofre sino una familia. Derivar destruye la altura inicial del tanque, igual que elevar al cuadrado destruye el signo, y la operación inversa devuelve todas las alturas posibles a la vez. `C` es el nombre de lo que la llave no puede saber, y el juego lo introduce cuando el jugador arrastra la curva de nivel hacia arriba y ve que el caminante mide lo mismo. Que la diferencia entre dos marcas no dependa de `C` es lo que le da valor único a la integral definida, y se comprueba arrastrando la familia mientras la regla vertical no se mueve.

## 10. Definición formal

Capa `formal`: texto corto con voz y el diagrama vertical fantasma al lado. Cuatro frases, de a una: "Si se acumula una cantidad desde una marca fija, lo acumulado es una función del extremo." "La pendiente de esa función en cada instante es la cantidad que se está acumulando." "Por lo tanto, para calcular una acumulación entre dos marcas alcanza con encontrar una función cuya pendiente sea el integrando, y restar sus valores en las dos marcas." "Dos funciones con la misma pendiente en todos lados se diferencian en una constante."

Condiciones y casos especiales, verificados sobre el objeto: hace falta que la curva de caudal no dé saltos en el tramo, y en un salto la curva de nivel tiene un pico y el caminante mide dos valores distintos, uno por lado, como en el nodo 26. Con caudal negativo todo sigue valiendo y la curva de nivel baja. Si las dos marcas coinciden, la resta da cero. Si se cambian de orden las marcas, el resultado cambia de signo, y en la regla vertical se ve porque se mide al revés. La elección de la marca fija de arranque no cambia ninguna diferencia: cambia solo cuál de las curvas de la familia se dibuja.

Ya jugado: las cuatro frases enteras, en la capa concreta. Nuevo: la palabra "primitiva", la condición sobre los saltos y el nombre "teorema fundamental".

## 11. Propiedades

- **La pendiente de lo acumulado es lo que se acumula.** Ligada al poste del caminante sobre la curva de nivel, que marca lo mismo que la aguja del caudal en todo instante.
- **La acumulación entre dos marcas es la diferencia de la primitiva.** Ligada a la regla vertical y al área rellena, que dan el mismo número y cambian juntas.
- **Cualquier primitiva sirve.** Ligada a arrastrar la familia hacia arriba: la regla vertical no cambia de largo.
- **Dos primitivas se diferencian en una constante.** Ligada a las curvas paralelas, que nunca se cruzan y nunca se separan.
- **Invertir el orden de las marcas cambia el signo.** Ligada a medir la regla vertical de arriba hacia abajo.
- **La llave no devuelve la altura inicial.** Ligada a la cerradura que destruye información, la tercera de las cuatro propiedades que E0 evalúa en cada regreso de la llave.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varios pares de cofres, cada uno con una cerradura y una llave dibujadas. Tocar el par donde la llave de acumular abre lo que la de medir la cuesta cerró. Los distractores son pares con otra inversa conocida, y un par donde cerradura y llave son la misma operación.
- `explain`: arrastrar la llave de acumular al cofre de la derivada y elegir, entre tres animaciones, la que muestra por qué la altura del tanque en cada instante es el caudal acumulado. Una muestra el poste coincidiendo con la aguja; otra, el nivel que copia la forma del caudal en vez de su pendiente; otra, el área tomada como si fuera la altura de la curva de caudal.
- `manipulate`: llenar el tanque siguiendo la curva de caudal y comprobar, con el caminante sobre la curva de nivel, que la pendiente del nivel coincide con el caudal en tres instantes, incluido uno con el grifo dado vuelta.
- `apply`: recibir una función y sus dos extremos, y armar con fichas la integral definida como el valor de la primitiva al final menos el del inicio. El teclado ofrece la barra de evaluación. Contra el tiempo objetivo del nodo.
- `generalize`: recibir una función acumulada cuyo extremo superior es una caja, y descubrir, tirando de la caja, cuál es su derivada. No hay tanque: hay dos curvas sobre ejes y el caminante.
- `transfer`: en un cofre anidado con una composición adentro, elegir la llave de sustitución que la deshace antes de acumular. Es `calc2.tech.substitution_undoes_chain`, y la mecánica de acumular no interviene en la elección.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`integral_ignores_sign`** (`replay_on_mechanic` sobre el tanque). El jugador informa la cantidad total que pasó por el grifo, o toma el valor absoluto en el tramo con caudal negativo. El juego congela y repite el llenado en cámara lenta con la curva de nivel dibujándose abajo: en el tramo negativo el grifo se da vuelta, los bloques salen, la curva baja y la regla vertical se acorta a la vista, con un halo en el cruce. Voz: "Acá el grifo drenaba. ¿El cuentakilómetros de la matemática sube o baja?". El jugador recoloca el total desde el estado real.
- **`wrong_inverse_choice`** (`key_mismatch` sobre el cofre). Frente al cofre cuya cerradura es medir la cuesta, el jugador arrastra otra vez esa misma llave, o la de la función inversa del nodo 21. La llave gira un cuarto de vuelta y se traba. La cerradura brilla con su forma, que es el caminante con su triángulo, y al lado aparece la silueta hueca de la que sí entra, sin nombrarla. Voz: "Esa llave no abre este cofre. ¿Qué deshace medir la cuesta?". El llavero sigue disponible.

Los distractores de `explain` y de `apply` se generan desde las reglas `detect` de estas dos y desde las de los tres prerequisitos directos, en particular `limit_as_reaching`, que llega por el nodo 28.

## 13. Generalización

Las dos analogías se retiran en `formal`. Antes, en `symbolic`, el auto ya no aparece y el tanque perdió el grifo: quedan las dos curvas sobre ejes con el caminante como herramienta. El cofre se queda como fantasma a demanda hasta `formal`, porque representa estructura y no un objeto.

Variantes sin ayuda visual, en orden: integrales definidas de expresiones cuya primitiva el jugador reconoce por tanteo, adivinando y verificando con la derivada; tramos donde el integrando cambia de signo, con el total separado de la cantidad total; marcas invertidas, con el signo que sale de la regla; funciones acumuladas con el extremo superior variable, donde hay que derivar sin calcular la integral; y familias donde se da un valor conocido en un punto para elegir una sola.

Cofres que no son curvas. El nodo termina con pares de operaciones que el jugador nunca vio juntas y donde una destruye información: elevar al cuadrado y la raíz, que devuelve dos ramas; la exponencial y el logaritmo, que devuelve una sola; y el cifrado de `csmath.crypto.caesar_shift`, que devuelve exactamente el original. El jugador clasifica cada par según si la llave devuelve un cofre, una familia o dos ramas. Se evalúa que la estructura (una operación, su inversa, y qué información se pierde) se reconoce fuera del cálculo.

El nodo está en `abstract` cuando el jugador calcula una integral definida por primitiva sin tanque, deriva una función acumulada sin calcularla, explica por qué el `+ C` no afecta la diferencia y señala qué destruye una cerradura arbitraria.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`:

- `calc2.tech.substitution_undoes_chain` (`chest_key` y `grid_stretch`): el cofre tiene otro cofre adentro, y la llave de afuera deshace la composición del nodo 27.
- `adv.four.inverse_transform` (`chest_key` y `machine_pipe`): la transformada y su inversa como máquina que se corre al revés, con otra información perdida y la misma estructura de llave.
- `prob.rv.cumulative_distribution` (`fill_accumulate` y `urn_dice`): la pendiente de la acumulada es la densidad, que es este teorema con otro nombre y sin cálculo a la vista.
- `adv.ode.euler_method` (`fill_accumulate`, `gears_sequence` y `slope_walker`): reconstruir una curva a partir de su pendiente, paso a paso. Es la llave usada a mano, con error, y donde el `+ C` se vuelve el dato inicial que hace falta para arrancar.

Concepto siguiente: `calc1.ftc.antiderivative_family`. Frase puente, narrada sobre la familia de curvas paralelas: "La llave abrió el cofre, pero adentro había muchos iguales, apilados. ¿Qué dato hace falta para saber cuál es el tuyo?". El jugador toca una de las curvas, las demás se atenúan y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `chest_scene_integral_key_opens_derivative` es de ruta mixta, pre-renderizada para la apertura de cada nivel y nativa sobre las curvas del jugador: la cerradura muestra su forma de caminante midiendo la cuesta, el llavero rota, la llave de acumular gira y el diagrama vertical del nodo 12 se reproduce hacia atrás; gramática `invert`, parametrizada por la función y el intervalo. Es la imagen de cheatsheet de `cs.calc1.strategy_integral_is_a_key`. `fill_scene_accumulation_rate_equals_height` es nativa: las dos gráficas apiladas, el área que se rellena arriba mientras la curva de nivel se dibuja abajo, y el caminante cuya lectura coincide con la altura de la curva de arriba; gramática `accumulate` con `rate` encima, parametrizada por la función de caudal, la de nivel y el instante, produce las animaciones de `explain`. Se reúsan las escenas de rectángulos del nodo 28 y la del caminante del nodo 26 como distractores. Ninguna lleva texto rasterizado: `∫`, la barra de evaluación, `C` y los valores los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_antiderivative` ([M](../../M-calculadora/M0-progresion.md)), un ícono de llave sobre el signo de integral. No devuelve solo el número: escribe la primitiva con su `+ C`, después el renglón con la barra de evaluación y las dos marcas, y recién entonces el valor. Es la primera operación simbólica de integración del juego y convive con `op_integral` del nodo 28, que sigue disponible para verificar. Si el nodo decae, el ícono muestra óxido y la calculadora vuelve a la respuesta numérica.

**Edad universal:** el nodo es `short_text` porque desde la capa `symbolic` se leen la barra de evaluación, el `+ C` y los enunciados cortos de las dos partes del teorema, y la definición se narra y se muestra escrita ([Q](../../Q-edad-universal.md)). Las capas `real`, `intuition` y `concrete` se juegan sin leer: el velocímetro y el cuentakilómetros, apretar el grifo, arrastrar al caminante, elegir la llave por forma, mover las marcas, mano fantasma y `explain` entre animaciones. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa de las dos curvas etiquetadas y arma la evaluación con el teclado de fichas en vez de tipear.
