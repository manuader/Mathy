# 15 — Repartir el producto en baldosas (`alg.expr.distributive_tiles`)

> Locale `es`: "Repartir el producto en baldosas". Minijuego: [El piso de dos habitaciones](../../F-minijuegos/alg.expr.distributive_tiles.md).

**Nodo:** `alg.expr.distributive_tiles` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `scale` · **Mecánica principal:** `tiles` (secundaria `ledger`) · **Literacy:** `icons` · **Analogía:** `tile_floor_two_rooms`

## 1. Concepto

Multiplicar una suma es cubrir un piso. Un rectángulo de ancho `3` cuyo largo está partido en `x` y `2` es el mismo piso mirado de dos maneras: `3(x + 2)` cuenta el piso entero de una vez, `3x + 6` cuenta las dos habitaciones por separado. Al terminar, el jugador convierte una escritura en la otra en los dos sentidos, sabe que ninguna baldosa apareció ni desapareció en el camino, y detecta de un vistazo cuándo a un reparto le falta un pedazo. La distributiva no se enuncia como regla: se ve como piso, y el enunciado llega al final a describir lo que el jugador ya cubrió con las manos.

## 2. Prerequisitos

- `arith.mul.scaling` (nodo 5): multiplicar como escalar y como rectángulo de filas y columnas. Se usa la baldosa como unidad de área, el rectángulo como forma del producto y el invariante de que reacomodar baldosas no cambia cuántas hay. De ahí viene la certeza de que un piso se puede cortar sin perder nada.
- `prealg.var.unknown_as_box` (nodo 10): la letra que nombra una cantidad desconocida. Se usa la caja convertida en `x`, el coeficiente como conteo de cajas y `variable_as_label`, que acá encuentra su forma más peligrosa. Ese nodo declara este en su `transfer_to`.

Ninguna arista viene del nodo 14, y es deliberado: este nodo no necesita saber resolver nada. La espina lo pone después porque el 14 terminó chocando contra un cofre que envolvía tres cajas iguales, pero el contenido es independiente y el diagnóstico puede llegar acá sin haber pasado por ecuaciones. Lo que sí hace falta es que `x` ya sea una cantidad y no un dibujo: la baldosa de largo desconocido solo tiene sentido si el largo es un número que todavía no se sabe.

## 3. Dificultad cognitiva real

Lo difícil no es "aplicar la propiedad". Es esto:

1. **Que el ancho llega a todo el largo.** El error de reparto no es de cuenta: es creer que el factor de afuera toca solo al primer sumando. Contra eso no sirve una regla, sirve un piso donde el ancho es una franja continua que atraviesa las dos habitaciones; si el jugador cubre solo la primera, quedan baldosas sin cubrir y se ven.
2. **Que la letra es una longitud, no una etiqueta.** `3x` es tres baldosas de largo `x`, no "tres equis". Quien lee la letra como nombre junta `2x` con `3y` en un montón porque los dos son "letras". Contra eso sirve que la baldosa de largo `x` tenga una longitud visible que no coincide con ninguna otra.
3. **Que multiplicar dos sumas no es multiplicar sus partes.** Cuando los dos lados del rectángulo se parten, aparecen cuatro pedazos y no dos, y los dos del medio son los que se pierden. El nodo no enseña el binomio completo —eso es `alg.expr.binomial_product`— pero sí planta el hueco, porque `distribute_over_wrong_op` es una misconception suya y su forma es exactamente la del pasillo que falta.
4. **Que la igualdad puede no pedir nada.** Hasta el nodo 14, un `=` era algo que había que resolver. `3(x + 2) = 3x + 6` no tiene solución que buscar: dice que dos escrituras describen el mismo piso. Confundirlo con una ecuación es un desvío frecuente.

## 4. Problema intuitivo

Sigue donde terminó el nodo 14. El cofre que guardaba tres cajas iguales, cada una con dos cosas adentro, se vuelca sobre el piso. Lo que sale no es un montón: son tres hileras idénticas, cada una con una parte larga de tamaño desconocido y dos baldosas sueltas, y las hileras se acomodan solas una debajo de la otra formando un rectángulo.

En `real` la escena es un depósito con el piso a medio embaldosar: dos habitaciones pegadas, separadas por una pared baja, las dos del mismo ancho. La pregunta, por voz o por gesto: ¿alcanzan estas baldosas para el piso entero?

En `intuition` la escena se detiene con la última zona sin cubrir. Tres desenlaces dibujados: se saca la pared y el piso se cubre de una pasada con el mismo ancho; se embaldosa cada habitación por separado y las dos partes juntas ocupan lo mismo; se embaldosa la primera entera y se declara terminado, y la segunda queda a la vista descubierta. Un segundo problema prepara el pasillo: una habitación cuadrada a la que se le agrega un pedazo por dos lados, y la pregunta de cuántas zonas nuevas quedaron.

## 5. Analogía del mundo real

`tile_floor_two_rooms` (mecánica `tiles`) es la analogía del YAML ([G0](../../G-analogias/G0-reglas.md)). Mapa: ancho compartido → factor común; largos de las dos habitaciones → sumandos del paréntesis; pared del medio → paréntesis; piso entero → producto; sacar la pared → distribuir; volver a poner la pared → factorizar; habitación de largo desconocido → baldosa variable. El invariante que conserva es el de la mecánica, `area_preserved_under_rearrangement`: cortar, mover y volver a pegar no cambia cuántas baldosas hacen falta. Se rompe en `negative_lengths`: una habitación de largo `x − 3` no existe. Las baldosas con signo son una extensión visual que ya no es analogía, y por eso el piso se desvanece en `symbolic`.

Por qué esta y no el libro de cuentas. G0 rechaza el `ledger` como analogía de este nodo por una razón precisa: allí 🍎 × 🍎 no significa nada, así que un producto de dos longitudes desconocidas no puede nacer en una fila. El piso sí lo tiene: dos lados y un área.

Cómo entra entonces el `ledger`, que el YAML declara como mecánica secundaria (convención 1 de la plantilla): las baldosas dan la herramienta y el invariante del producto; el libro de cuentas da el registro. Una vez cortado el piso en zonas, cada zona se anota como una fila —tantas baldosas de largo `x`, tantas sueltas— y solo se juntan filas del mismo tipo. Ahí `variable_as_label` se hace visible: la baldosa larga no entra en la fila de las sueltas por más que el jugador la empuje. Las dos mecánicas se encuentran en un gesto, arrastrar una zona del piso a su fila del libro.

## 6. Mecánica de juego

Primera capa jugable: `concrete`, sin leer nada. Gestos: `drag`, `tap` y `pinch`, con manija de arrastre como alternativa al pinch ([E0](../../E-mecanicas/E0-catalogo.md)).

1. Un marco de piso vacío con una pared baja que lo parte en dos zonas. La izquierda tiene un largo marcado con una barra; la derecha, un largo de dos baldosas. El ancho, tres baldosas, es el mismo en las dos. Al costado, una bandeja con baldosas sueltas y largas.
2. Demostración: una mano fantasma toma una baldosa larga, la apoya en la zona izquierda y la repite hasta llenar el ancho; después llena la derecha con sueltas. El marco se ilumina entero.
3. El jugador cubre el piso arrastrando baldosas, que se imantan a la grilla y no se superponen. Si una zona queda incompleta, el marco tiene un hueco que respira: no hay cartel, hay agujero.
4. Con el piso cubierto, tocar la pared la saca: las dos zonas se funden en un rectángulo entero y las baldosas no se mueven. Tocar de nuevo la devuelve al mismo lugar. Ese ida y vuelta es el nodo completo hecho con un dedo.
5. Estirar el marco por la manija cambia el ancho: todas las zonas se estiran a la vez y crecen en la misma proporción. Es imposible estirar una sola, porque el ancho es compartido y la manija es única.
6. Cada zona cubierta se arrastra a su fila del libro de cuentas. Una baldosa larga soltada sobre la fila de las sueltas no entra: la fila la rechaza, porque no miden lo mismo.
7. Éxito: el piso cubierto y el libro con sus dos filas cerradas, sin cartel. Verificación: se saca la pared, se cuenta el piso entero y el total coincide con la suma de las filas.

El error que este nodo tiene que producir a propósito es el de cubrir solo la primera zona. Por eso el marco nunca se autocompleta: mientras haya piso descubierto, sacar la pared muestra el agujero en medio del rectángulo.

## 7. Representación visual

Capa `visual`, con `scale` dominante y `partition` e `invariant` de apoyo ([H](../../H-progresion-abstraccion.md)).

`scale` manda porque hay que ver un rectángulo que crece manteniendo su forma. Las baldosas se funden en un rectángulo sobre una grilla atenuada y los lados llevan sus medidas como llaves con corchete: el ancho `3` de un lado, y del otro dos tramos, `x` y `2`, con la pared convertida en línea punteada. Al estirar el ancho, el rectángulo entero se escala y los dos tramos se escalan juntos: eso es lo que se conserva, la proporción entre las zonas.

`partition` (apoyo) es el corte: la línea punteada parte el rectángulo en dos zonas de colores distintos, y el libro de cuentas es esa misma partición leída como filas. `invariant` (apoyo) es lo que hace verdadera la igualdad: el rectángulo entero y las dos zonas separadas, lado a lado, con el mismo conteo iluminado en las dos.

Todavía no hay cuatro zonas: los dos lados no se parten a la vez hasta el último tramo, donde el hueco del pasillo aparece como pregunta y no como técnica.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Baldosas → medidas en los lados.** Al cubrir por primera vez una zona completa en `visual`, sus baldosas se atenúan y el conteo se despega hacia el lado como una llave con corchete: `3` en el ancho, `x` y `2` en el largo.
2. **Pared → paréntesis.** Al tocar la pared con el piso cubierto, la línea punteada se contrae en dos trazos verticales alrededor de los dos tramos del largo: `(x + 2)`. Es el paréntesis del nodo 9, ahora encerrando una longitud.
3. **Rectángulo entero → producto.** El ancho y el paréntesis se juntan por yuxtaposición sobre el piso: `3(x + 2)`, como marca de agua. Lo dispara sacar la pared.
4. **Zonas → suma de áreas.** Al arrastrar las zonas al libro, cada fila se contrae en su ficha, `3x` y `6`, con el `+` naciendo del espacio entre las filas y el coeficiente heredando el conteo, como en el nodo 10.
5. **Las dos escrituras → una igualdad.** Poner y sacar la pared con las dos escrituras en pantalla dibuja el `=` entre ellas: `3(x + 2) = 3x + 6`. El signo aparece por el gesto, no antes, y el rectángulo queda como marca de agua que se desvanece.

## 9. Notación matemática

Queda `3(x + 2) = 3x + 6`, y en el otro sentido `3x + 6 = 3(x + 2)`.

El nodo no introduce símbolos nuevos: el paréntesis nació en `arith.expr.precedence_tree`, la letra en `prealg.var.unknown_as_box`, el coeficiente y la yuxtaposición en prealgebra. Por la convención 3 de la plantilla, lo que se vuelve necesario es una **convención de lectura del `=`**: hasta acá el signo unía dos platos y pedía buscar un valor; en `3(x + 2) = 3x + 6` no hay nada que buscar, porque cualquier `x` lo cumple. El signo dice que dos escrituras describen el mismo piso. El problema que lo exige es el gesto del paso 5: el jugador acaba de poner y sacar la pared sin mover una baldosa y necesita anotar que las dos cuentas valen lo mismo sin que eso sea una pregunta. El juego marca la diferencia sin una palabra nueva: cuando el `=` es una identidad, la balanza fantasma del nodo 13 aparece nivelada para cualquier valor y no se inclina nunca.

## 10. Definición formal

Capa `formal`: texto corto con voz y el rectángulo al lado, de a una frase. "Multiplicar una suma es multiplicar cada sumando y después sumar." "El área de un rectángulo no cambia si se lo corta y se lo vuelve a armar." "Las dos escrituras valen lo mismo para cualquier valor de la letra."

Condiciones y casos, verificados sobre el objeto: la propiedad vale con cualquier cantidad de sumandos —el largo se parte en tres tramos y el ancho sigue llegando a todos— y vale hacia adentro, que es factorizar. Vale con restas, y ahí el piso deja de servir: `3(x − 2)` es el piso de largo `x` al que se le recorta una franja, una extensión visual y no una habitación. Y no vale para lo que `distribute_over_wrong_op` afirma: el factor no se reparte sobre un producto, porque `3(2x)` es una sola habitación estirada.

Ya jugado: las tres frases, en la capa concreta. Nuevo: "cualquier valor", que es la primera cuantificación del curriculum de álgebra, y el caso de la resta.

## 11. Propiedades

- **Distributiva del producto sobre la suma.** `a(b + c) = ab + ac`. Ligada a sacar la pared con el piso cubierto: ninguna baldosa se mueve.
- **Vale en los dos sentidos.** `ab + ac = a(b + c)` es volver a poner la pared, y solo se puede si las dos zonas comparten el ancho. Ligada al momento en que la pared no se deja poner porque los anchos no coinciden; es la semilla de `alg.expr.factor_common`.
- **Se extiende a cualquier cantidad de sumandos.** Ligada a arrastrar la pared para agregar una zona más.
- **Solo se juntan zonas que miden lo mismo.** `3x + 6` no se cierra en una sola ficha. Ligada a la fila que rechaza la baldosa larga.
- **Reacomodar no crea ni destruye área.** Todo lo anterior es consecuencia de esto, que el jugador sabe desde el nodo 5. Ligada al conteo iluminado igual en las dos disposiciones.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos habitaciones con el mismo ancho y largos distintos, y cuatro expresiones de fichas al costado. Tocar la que mide el piso total; los distractores se generan desde `detect` y son repartos incompletos y productos de etiquetas.
- `explain`: tres animaciones sobre el mismo piso. En una el ancho cubre las dos habitaciones y no queda hueco; en otra se cubre cada habitación con su propio cuadrado y el pasillo del medio queda vacío; en otra las etiquetas de los lados se multiplican como nombres y el piso no cierra. Tocar las que pierden baldosas. Los dos distractores son misconceptions del nodo, así que un error acá clasifica.
- `manipulate`: cubrir un rectángulo con un lado partido en dos y armar la ficha de producto que lo describe. La validación es el marco sin huecos, no la expresión.
- `apply`: un rectángulo con lados de letras y números, ya cubierto. Arrastrar la ficha de cada zona a su fila del libro y cerrar la suma, contra el tiempo objetivo del nodo.
- `generalize`: sin baldosas, fichas de paréntesis y letras. Expandir y también recomponer el producto desde la suma, con tres sumandos y con restas.
- `transfer`: en el rectángulo que crece de `calc1.deriv.rules_as_structure`, tocar las dos franjas que se agregan cuando los dos lados cambian a la vez.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`distribute_over_wrong_op`** (`missing_piece_tiles` sobre las baldosas). Es la del nodo y su forma es literal. El jugador afirma que el piso de lado `a + b` mide `a² + b²`; el juego coloca un cuadrado `a × a` y otro `b × b` en esquinas opuestas del marco y quedan dos rectángulos `a × b` vacíos, parpadeando. Voz: "Al piso le falta un pedazo. ¿Qué zonas quedaron sin cubrir?". Las baldosas están en la bandeja y al colocarlas la expresión pasa a `a² + 2ab + b²` con un morph. La segunda regla de detección es la otra cara: `3(2x)` leído como `6 · 3x`, donde el patrón corre al revés y hay baldosas que **sobran**, porque el piso construido no entra en el marco.
- **`variable_as_label`** (`replay_on_mechanic` sobre el libro de cuentas). El jugador junta `2x` con `3y` en una ficha, o multiplica dos etiquetas como nombres. El juego congela, repite el gesto y muestra las dos columnas que no se funden porque no miden lo mismo. Voz: "Estas dos no miden lo mismo. ¿Pueden ir a la misma fila?". El control vuelve desde el libro real.

## 13. Generalización

La analogía se retira en `symbolic`, cuando el jugador expande sin tocar el piso, y su punto de ruptura marca el momento exacto: en cuanto un largo es una resta, la habitación deja de existir y las baldosas con signo son ya una convención de dibujo. El piso queda como fantasma a demanda hasta `formal`, porque representa estructura —el área como forma del producto— y no un nombre. El libro de cuentas se va antes: con el coeficiente escrito, la fila no agrega nada.

Variantes sin ayuda visual, en orden: factor numérico y dos sumandos (`3(x + 2)`); factor con letra (`x(x + 4)`, donde aparece el primer cuadrado como baldosa); tres sumandos; resta dentro del paréntesis; factor común hacia adentro, que es el mismo gesto al revés y prepara `alg.expr.factor_common`; y los dos lados partidos, donde el jugador anticipa cuántas zonas van a aparecer antes de verlas. Esa última se plantea y se cuenta, no se desarrolla: eso es `alg.expr.binomial_product`. Después, anchos que no son cantidades: un piso cuyo ancho es "pintar de rojo" y cuyo largo está partido en dos, donde repartir es pintar las dos zonas.

El nodo está en `abstract` cuando el jugador expande y factoriza en los dos sentidos sin pedir el piso, sabe decir por qué el factor no se reparte sobre un producto y reconoce el reparto en un objeto que no tiene área.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica que no se usó para aprender:

- `calc1.deriv.rules_as_structure` (`machine_pipe` y `gears_sequence`, con las baldosas como apoyo): la regla del producto es un rectángulo cuyos dos lados crecen a la vez; lo que se agrega son dos franjas y una esquinita, y olvidarse de una franja es el mismo error que perder el pasillo.
- `geom.area.rect_and_triangle` (`construct`): bajar una altura parte una figura en zonas cuyas áreas se suman. Es el mismo reparto con la pared trazada por el jugador en vez de dada.
- `linalg.map.linear_transformation_2d` (`grid_stretch`): deformar la suma de dos vectores da lo mismo que deformar cada uno y sumarlos. La distributiva es la mitad de la definición de linealidad, y acá se ve como una sábana que se estira entera.
- `adv.alg.polynomial_arithmetic` (`ledger` y `gears_sequence`): un polinomio es un libro con una fila por potencia, y multiplicar dos polinomios es repartir cada fila sobre cada fila. La regla de que solo se juntan filas iguales es la que este nodo instaló con la baldosa que no entra.

Concepto siguiente: `alg.sys.two_by_two` ([16](16-alg.sys.two_by_two.md)). El nodo termina con dos pisos distintos que comparten el mismo tipo de baldosa larga y de los que solo se conoce el total. Frase puente, narrada sobre esos dos pisos: "Estas dos cuentas usan la misma baldosa. Ninguna sola alcanza para saber cuánto mide. ¿Y las dos juntas?". El marco de cada piso se levanta por el medio y se convierte en la barra de una balanza; quedan dos balanzas lado a lado con una caja marcada igual en las dos, y el nodo 16 empieza ahí.

---

**Visualización:** dos escenas del YAML ([I](../../I-manim/I0-mapping.md)), las dos nativas porque corren sobre el piso que el jugador está cubriendo. `tile_two_rooms_one_width` es la principal: el rectángulo con la pared punteada, las llaves con corchete en los lados, la pared que se saca y se pone sin mover baldosas y el conteo iluminado igual en las dos disposiciones; gramática `scale`. Parametrizada por el ancho y los dos largos, produce las animaciones de `explain` y el replay de `missing_piece_tiles`, incluida la versión con dos rectángulos vacíos en el medio. `ledger_a_times_sum` es la vista de al lado: las zonas viajando a sus filas y el coeficiente que se despega del conteo; gramática `partition`, y es donde corre el replay de `variable_as_label`. Se reúsa `tile_rows_become_rectangle` (nodo 5) para la demostración de que el ancho llega a todo el largo. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_expand` ([M](../../M-calculadora/M0-progresion.md)), sobre cualquier expresión con un factor y un paréntesis armada con fichas. No devuelve el resultado plano: dibuja el rectángulo, lo parte y escribe una ficha por zona antes de sumarlas. Como manda M, la tecla nace con el espacio de su llave al lado: `op_factor` queda como silueta a la derecha y tocarla muestra el nodo que la abre, `alg.expr.factor_common`. La pregunta incómoda del par está en la propia imagen: el rectángulo se corta y se vuelve a armar, y volver a armarlo solo se puede si las zonas comparten un lado.

**Edad universal:** el nodo es `icons` porque los lados llevan etiquetas de un carácter desde el segundo nivel. Lo demás se juega sin leer: cubrir es arrastrar, el hueco no necesita explicación, la pared se saca con un dedo, `explain` es entre animaciones y los prompts van por voz. El `pinch` para estirar el marco tiene siempre la manija de arrastre como alternativa ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico, salta `real` e `intuition` y trabaja sobre las fichas, con el piso a demanda cuando un reparto le sale corto.
