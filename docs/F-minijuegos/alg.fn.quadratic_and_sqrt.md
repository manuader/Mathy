# El jardín cuadrado (`alg.fn.quadratic_and_sqrt`)

Minijuego del nodo 22 de la espina, "El lado del cuadrado conocido". Mecánica principal `tiles`, secundarias `chest_key` y `grid_stretch`; analogía `square_garden_side`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/22-alg.fn.quadratic_and_sqrt.md): un concepto, cuatro dificultades reales (el crecimiento no proporcional, la llave que abre dos cofres, elegir la rama con la situación, las piezas del medio), una analogía con dos apoyos, un gesto (cerrar el cuadrado), cinco pasos de desvanecimiento, el cuadrado que crece como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Un patio cuadrado embaldosado, visto desde arriba. Las baldosas se cuentan; el lado no está escrito en ninguna parte y se lee cerrando el cuadrado.

Mapa objeto a concepto: parcela cuadrada → `x²`; largo del lado → `x`; conocer el área y buscar el lado → raíz cuadrada; agregar dos tiras iguales en dos bordes → completar el cuadrado; baldosa de esquina que falta → la constante que hay que agregar; parcela que crece con el lado → crecimiento cuadrático.

El jardín aporta qué es el lado y por qué el área crece tan rápido. El cofre aporta que hay dos lados posibles: la cerradura `x²` lleva `3` y `−3` al mismo `9`, y la llave `√` los devuelve a los dos. La malla estirada aporta la razón: la recta se pliega sobre el cero al elevar al cuadrado, y la llave solo despliega una mitad por vez. Punto de ruptura del jardín: `two_branches_of_sqrt`, porque un lado negativo no cabe en un marco, y por eso el jardín se retira recién en `formal` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: la bandeja de baldosas abajo, el marco cuadrado en el centro, el cofre y el llavero a un costado desde la capa `visual`, la recta plegable en una banda inferior. Gestos: `drag`, `tap` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar baldosas al marco.** El marco solo acepta forma cuadrada. Las baldosas se acomodan en filas y columnas y se pegan entre sí.
- **Cerrar el cuadrado.** Cuando la última baldosa entra, una llave se despliega sobre un lado y lo mide. Si sobran baldosas, el borde queda incompleto y parpadea; las de más vuelven solas a la bandeja y el juego muestra las dos cuadrículas vecinas entre las que cae el lado.
- **Arrastrar una tira al borde.** Una tira del largo del lado se pega al borde derecho, y otra igual al de abajo. Queda un hueco cuadrado en la esquina, del ancho de la tira. El jardín no vuelve a ser cuadrado hasta que el hueco se llena.
- **Arrastrar la llave al cofre.** La cerradura con forma de marco gira y se abren dos cofres, uno a cada lado de una marca central, con dos fichas opuestas adentro.
- **Ignorar el segundo cofre.** Queda abierto sobre la mesa. Nada lo cierra hasta que el jugador lo toca y decide si esa ficha sirve o no.
- **Estirar la recta con dos dedos.** Al aplicar el candado, la recta se dobla sobre el cero y los puntos opuestos caen encima. Al aplicar la llave, se despliega de un lado por vez, y el lado lo elige el jugador.
- **Soltar una ficha en el marco.** El marco rechaza la ficha negativa sin decir nada: no hay un lado que mida menos que nada.

En `symbolic` la superficie cambia de forma, no de reglas: soltar la llave sobre una expresión con un cuadrado produce siempre dos renglones, y solo se funden en uno con el signo doble cuando el jugador toca el par. Arrastrar una ficha fuera de su pieza en el desarrollo de un cuadrado deja el hueco a la vista.

## Invariante matemático

Tres invariantes, uno por mecánica.

`area_preserved_under_rearrangement` (baldosas): el total no cambia cuando las piezas se mueven. Se ve romperse cuando el jugador arma `(x + 3)²` con dos cuadrados y nada más: la superficie del marco no queda cubierta, y los dos rectángulos vacíos son la diferencia.

`inverse_restores_original` (cofre): la llave devuelve lo que había. Acá se ve que devuelve dos cosas, y eso no es una falla de la llave sino información que el candado destruyó. Se ve romperse cuando el jugador se queda con una sola y el segundo cofre sigue abierto.

`lines_stay_lines_origin_fixed` (malla): el cero no se mueve. Es lo que hace que el pliegue tenga un centro y que las dos ramas sean opuestas y no dos números cualesquiera.

Un movimiento válido pero inútil, como armar el cuadrado empezando por la fila de abajo o aplicar la llave dos veces seguidas a un cofre ya abierto, no rompe ningún invariante: recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `nonlinear`, de apoyo `invert` y `deform` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el patio embaldosado y el jardinero que quiere el lado al doble. Solo se mira y se predice.
- `concrete`: baldosas sueltas, marco, tiras, cofre con cerradura en forma de marco, llaves por forma. Nada escrito salvo el número de baldosas.
- `visual`: el cuadrado se vuelve una superficie lisa con una llave en un lado; al arrastrar el lado, la superficie crece dejando el rastro de la forma anterior. El diagrama vertical del cofre aparece bifurcado: la flecha de bajada sale de dos puntos y llega a uno. La recta plegada muestra el hilo que une los dos puntos de origen por debajo.
- `symbolic`: fichas `x²`, `√`, `±` y las cuatro piezas del cuadrado de una suma con sus etiquetas.
- `formal`: la definición corta con voz; el cuadrado de baldosas fantasma al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Cuadrado cerrado → ficha del lado: la llave del lado se contrae en una ficha pegada al borde y la segunda llave se desvanece, porque en un cuadrado alcanza con una.
2. Área contada → `x²`: al tocar el interior, el número se reescribe como el producto de las dos fichas del lado, el producto se pliega y el segundo factor sube al exponente, con el morph que ya usó `arith.pow.repeated_scaling`.
3. Cerradura con forma → etiqueta `x²`: al arrastrar la llave por primera vez, la cerradura gana la etiqueta y la llave pierde el color y gana el gancho, que es el trazo de la raíz.
4. Dos cofres → renglón con dos fichas: las dos fichas se apoyan en un mismo renglón y conviven como `x = 3` y `x = −3`; al tocarlo se funden en `x = ±3`.
5. Tiras y esquina → cuadrado de una suma: cada pieza escribe su área encima y las cuatro etiquetas caen a un renglón en el orden del dibujo, con la esquina resaltada.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el cuadrado fantasma: el cuadrado de un número es el área del cuadrado que lo tiene como lado; la raíz cuadrada de un área es el lado que la produce; si el área es mayor que cero hay dos números que la producen, y son opuestos. Propiedades: escalar el lado por un factor multiplica el área por el cuadrado del factor; elevar al cuadrado y sacar raíz se deshacen solo después de elegir una rama; `(x + b)² = x² + 2bx + b²`. Casos: con área cero hay una sola respuesta y con área negativa ninguna entre los números que el jugador tiene, y ese caso queda marcado como puerta de `precalc.cplx.plane_intro`. Símbolo nuevo: `√`, porque con área 10 el lado existe, se ve, cae entre 3 y 4 y no tenía nombre. Convención nueva: `±`, para escribir las dos ramas en un renglón después de haberlas abierto muchas veces.

## Generalización

El jardín se retira en `formal`, cuando la elección de rama se toma leyendo la situación escrita y no probando si la ficha entra en el marco. El cofre se queda como fantasma a demanda hasta el final, porque representa estructura y no una medida.

Variantes sin ayuda visual: áreas que son cuadrados perfectos; áreas que no lo son, con la respuesta dejada en símbolo; cuadrados desplazados, `(x + 2)² = 16`, donde las dos ramas dan dos resultados y los dos sirven; situaciones donde una rama se descarta y hay que decir por qué; áreas negativas, marcadas como sin respuesta y no como error. Después, desarrollos ajenos a los que les falta una pieza, para que el jugador la señale. Cuando resuelve todo eso sin pedir baldosas ni cofre, la analogía se eliminó.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): este nodo es parte del nivel 9 de esa progresión, donde la llave del cuadrado abre dos cofres a la vez. Lo que acá se juega es la primera mitad de ese nivel; la segunda, con soluciones extrañas y radicales, es de `alg.rad.root_as_fractional_power`.

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Cerrar el cuadrado.** `concrete`, `manipulate`. Áreas que son cuadrados perfectos chicos. Sin cofre.
2. **Cuando no cierra.** `concrete`, `recognize` y `manipulate`. Áreas que no son cuadrados perfectos; el lado cae entre dos enteros y el jugador señala cuáles.
3. **Dos tiras y una esquina.** `concrete`, `manipulate`. Agrandar el jardín con tiras; el hueco de la esquina hay que llenarlo. Aparece `distribute_over_wrong_op`.
4. **La llave que abre dos.** `visual`, `explain` y `manipulate`. Misma dificultad numérica; entran el cofre, el diagrama bifurcado y la recta plegada. Aparece `sqrt_loses_negative_branch`.
5. **Fichas al lado.** `symbolic` primera mitad, `manipulate` y `apply`. La expresión aparece junto al cuadrado y se transforma en sincronía; nacen `√` y `±`.
6. **Números difíciles.** Parámetros: áreas mayores y no perfectas, y coeficientes en el cuadrado de una suma de dos dígitos.
7. **Elegir la rama.** Parámetros: cuadrados desplazados y situaciones donde una de las dos ramas no sirve. El teclado de fichas deja de ofrecer el par prearmado: el jugador escribe las dos.
8. **Sin baldosas.** `formal` y `abstract`, `generalize`. Definición corta con voz; áreas negativas y desarrollos ajenos con una pieza faltante.

Qué endurece cada parámetro: las áreas no perfectas obligan a nombrar el lado en vez de decirlo; el cuadrado desplazado rompe la lectura "la respuesta es la raíz del número de la derecha"; las situaciones con contexto obligan a justificar el descarte, que es lo único que no se puede automatizar; los desarrollos ajenos invierten el rol y piden encontrar el error en vez de evitarlo.

Desafíos de olimpíada: el nodo participa en `ch.calc.fence_along_the_river` de [S](../S-desafios/S0-desafios.md), donde el área en función de un lado es la expresión que hay que armar, y en los desafíos de álgebra que combinan área y factorización. Hasta que esos desafíos estén disponibles, el nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: un jardín con área 49 marcada y cuatro fichas: `7`, `24`, `14`, `49`. Tocar `7`.
- `explain`: tres animaciones. La llave de raíz abre dos cofres sobre `x² = 25`; la misma llave abre uno solo; el cuadrado de `x + 4` se arma con dos cuadrados y nada más. Tocar las dos que pierden algo. El distractor elegido clasifica: el cofre único es `sqrt_loses_negative_branch`, el cuadrado incompleto es `distribute_over_wrong_op`.
- `manipulate`: área 36 en la bandeja. Armar el cuadrado, leer el lado, y después aplicar la llave al cofre `x² = 36` y ver abrirse los dos.
- `apply`: una grilla estirada cuyo cuadrado unidad pasó a tener área 9; arrastrar la ficha del factor que lo produjo, contra el tiempo objetivo del nodo.
- `generalize`: sin baldosas, `(x + 5)² = 49`; escribir las dos ramas. Y una situación con un lado de terreno donde una rama se descarta: tocarla y decir por qué con un gesto sobre el marco.
- `transfer`: en el triángulo de `geom.tri.pythagoras_as_tiles`, tocar el lado que resulta de recomponer las baldosas de los dos cuadrados. También en `trig.id.pythagorean_identity` y en `geom.area.rect_and_triangle`.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `sqrt_loses_negative_branch`, patrón `double_flip` sobre el cofre: se muestra el primer giro con la ficha positiva, el segundo con la negativa, y se comparan los dos aterrizajes en la misma marca. Voz: "Otro número también da {a} al cuadrado. ¿Cuál es?". La ficha olvidada queda sobre la mesa y el jugador decide si sirve en esta situación.
- `distribute_over_wrong_op`, patrón `missing_piece_tiles` sobre las baldosas: se colocan los dos cuadrados en esquinas opuestas del marco y los dos rectángulos vacíos parpadean. Voz: "Al cuadrado le falta un pedazo. ¿Qué baldosas faltan?". Al completarlo, la expresión pasa a la forma correcta con un morph. Es la de mayor severidad del nodo.

Los distractores de `explain` y las opciones de `apply` se generan desde las reglas `detect` de estas dos, más las de `alg.expr.distributive_tiles` y `alg.fn.inverse_function`.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_square_from_area`, nativa, parametrizada por el área. Las baldosas del jugador se ordenan en cuadrícula, la llave del lado se despliega y el número del lado aparece contando desde cero; gramática `nonlinear`, con el rastro de la forma anterior cuando el lado crece. Produce también las animaciones de `explain` del cuadrado de una suma.
- `chest_one_key_two_chests`, nativa, parametrizada por el valor del cuadrado y la lista de raíces. La cerradura gira, se abren dos cofres a los costados de una marca central y las dos fichas caen sobre una recta. Abre cada nivel a partir del cuarto y es la imagen de cheatsheet de `cs.alg.sqrt_two_branches`. Las etiquetas las dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).
- Reusadas: las escenas de baldosas del nodo 15 y `chest_wrong_key_stays_shut` del nodo 12, como distractores de `explain`.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_square_from_area`: `area_range` (cuadrados perfectos hasta 100 en los niveles 1 y 5, hasta 400 desde el 6); `perfect` (verdadero en el nivel 1, falso desde el 2); `seed`.
- `gen_two_branch_chest`: `square_value`; `shift` (el `b` del cuadrado desplazado, cero hasta el nivel 6); `context` en {ninguno, longitud, temperatura, saldo}, que decide si una rama se descarta; `allow_negative_area` (verdadero solo en el nivel 8).
- `gen_border_strips`: `side_label`; `strip_width` de 1 a 9 hasta el nivel 5 y de dos dígitos desde el 6; `missing_piece` en {esquina, una tira, ninguna}, que elige qué pieza falta en los desarrollos ajenos.

**Literacy soportada:** de `icons` a `full_text`. La capa concreta se juega sin leer, pero desde el segundo nivel las baldosas llevan el número del área y las llaves llevan etiqueta, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada, y las situaciones con contexto del nivel 7 se leen en vez de mostrarse en imagen.

**Instrucción por demostración:** la primera vez, una mano fantasma arrastra baldosas al marco fila por fila hasta que el cuadrado cierra, y la llave del lado se despliega sola. La escena vuelve al inicio y la bandeja late. La demostración de la llave sobre el cofre se repite una vez al empezar el nivel 4, porque el gesto es conocido del nodo 12 pero el resultado es nuevo. No se repiten si el jugador ya está manipulando ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
