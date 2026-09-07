# 22 — El lado del cuadrado conocido (`alg.fn.quadratic_and_sqrt`)

> Locale `es`: "El lado del cuadrado conocido". Minijuego: [El jardín cuadrado](../../F-minijuegos/alg.fn.quadratic_and_sqrt.md).

**Nodo:** `alg.fn.quadratic_and_sqrt` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `nonlinear` · **Mecánica principal:** `tiles` (secundarias `chest_key` y `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `square_garden_side`

## 1. Concepto

Elevar al cuadrado es la primera transformación que el jugador conoce donde crecer al doble no duplica el resultado, y también la primera cuya llave abre dos cofres a la vez. Al terminar, el jugador arma un cuadrado a partir de su área y lee el lado, sabe que `x² = 9` tiene dos respuestas y no una, decide cuál de las dos sirve mirando la situación, y reconoce que `(x + 3)²` necesita dos tiras y una esquina y no solo dos cuadrados. Antes tenía llaves que abrían un cofre por vez; ahora tiene una llave que abre dos y tiene que decidir qué hace con el segundo.

## 2. Prerequisitos

- `alg.expr.distributive_tiles` (nodo [15](15-alg.expr.distributive_tiles.md)): las baldosas y el invariante de área. Se usan la bandeja de baldosas, el rectángulo con lados rotulados, la lectura del área como producto de los lados y la misconception `distribute_over_wrong_op`, que acá reaparece en su forma más cara: el cuadrado de una suma.
- `alg.fn.inverse_function` (nodo [21](21-alg.fn.inverse_function.md)): la llave que es una máquina. Se usan la palanca de reversa, la condición sobre las entradas y la máquina de dos bocas que junta dos entradas en una salida. Ese caso quedó abierto en el nodo 21 con las dos bolas sobre la mesa; este nodo lo cierra.

Ninguna arista sigue el orden escolar, donde la raíz cuadrada aparece como una operación aritmética suelta, antes que las funciones y sin ninguna relación con el área. [C0](../../C-knowledge-graph/C0-esquema.md) la coloca acá a propósito: la raíz no es una tecla, es la llave de un candado que junta dos entradas, y sin la llave del nodo 21 y sin las baldosas del nodo 15 el jugador solo puede memorizar una tabla.

## 3. Dificultad cognitiva real

Lo difícil no es sacar raíces sino cuatro capacidades que la escuela mezcla en un procedimiento:

1. **Aceptar el crecimiento no proporcional.** Todo lo que el jugador vio hasta acá se comportaba bien al escalar: doblar el paso doblaba la distancia. Un jardín con el lado al doble no tiene el doble de baldosas sino cuatro veces más. Es la primitiva `nonlinear` en su forma más simple, y se siente con las manos antes de escribirse.
2. **Aceptar que una llave abre dos cofres.** El candado `x²` lleva `3` y `−3` al mismo `9`. La llave `√` no puede saber de cuál venía. No es un defecto de la llave: es información que el candado destruyó, como el candado `×0` del nodo 12 pero a medias. Falla en `sqrt_loses_negative_branch`.
3. **Elegir la rama con la situación y no con una regla.** Un lado de jardín no puede medir menos que nada; una temperatura sí. Lo difícil es que la decisión es del jugador, no del cálculo, y que hay que tomarla cada vez.
4. **Ver que el cuadrado de una suma tiene piezas del medio.** `(x + 3)²` no es `x² + 9`. La estructura tiene cuatro piezas y dos son iguales. Falla en `distribute_over_wrong_op`, la misconception de mayor severidad de este nodo.

Las cuatro se reparten entre las tres mecánicas: la primera y la cuarta viven en las baldosas, la segunda y la tercera en los cofres, y la malla estirada las ata mostrando que elevar al cuadrado pliega la recta.

## 4. Problema intuitivo

Un patio cuadrado embaldosado. Se ven las baldosas desde arriba y se pueden contar: hay cien. La pregunta, por voz o por gesto: ¿cuántas baldosas mide un lado?

En `intuition` la escena se detiene antes del resultado y cambia la pregunta. El jardinero quiere un patio con el lado al doble y va a pedir baldosas. Tres desenlaces dibujados: pide doscientas y le sobra un montón sin cubrir; pide cuatrocientas y le entra justo; pide trescientas y queda una franja pelada. El jugador elige y después ve. La franja pelada es la que después se vuelve las dos tiras y la esquina.

## 5. Analogía del mundo real

`square_garden_side`, sobre `tiles` ([G0](../../G-analogias/G0-reglas.md)). Mapa del YAML: parcela cuadrada → `x²`; largo del lado → `x`; conocer el área y buscar el lado → raíz cuadrada; agregar dos tiras iguales en dos bordes → completar el cuadrado; baldosa de esquina que falta → la constante que hay que agregar; parcela que crece con el lado → crecimiento cuadrático.

Invariante: el área total no cambia cuando las baldosas se reacomodan, y el cuadrado solo cierra con un lado exacto. Ruptura declarada: `two_branches_of_sqrt`. Un jardín no puede tener un lado negativo, así que la analogía sabe mostrar el cuadrado y no sabe mostrar la segunda rama. Por eso se desvanece recién en `formal`, y por eso el nodo trae una segunda piel.

Esa segunda piel es `chest_key`, la tercera llave de la sección "Funciones como llaves" de [E0](../../E-mecanicas/E0-catalogo.md): la cerradura `x²`, la llave `√`, y el hecho nuevo de que al girarla se abren dos cofres. El jardín aporta qué es el lado; el cofre aporta que hay dos.

La tercera mecánica, `grid_stretch`, no viste nada: muestra por qué. La recta numérica se pliega por la mitad sobre el cero cuando se eleva al cuadrado, y la llave solo puede desplegar una mitad por vez. Es la explicación de la ruptura, dibujada.

Por qué esta analogía y no otra. Una escalera con escalones cada vez más altos conserva el crecimiento no proporcional pero no tiene ninguna manera de mostrar el lado ni la segunda rama. Una bola que cae conserva la forma de la curva pero introduce el tiempo, que acá no hace falta. El jardín conserva las tres cosas que el nodo necesita: el lado, el área, y la pieza que falta.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `tiles` es la principal y da el gesto y el invariante; `chest_key` aporta la herramienta que ya se aprendió y la pregunta de las dos ramas; `grid_stretch` aporta la razón ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `pinch`.

1. Una bandeja con baldosas sueltas y un marco vacío que solo acepta forma cuadrada. Arriba, el número de baldosas.
2. Demostración: una mano fantasma arrastra baldosas al marco fila por fila. Cuando el cuadrado cierra, una llave aparece sobre un lado y lo mide.
3. El jugador arma otros cuadrados. Si sobran baldosas, el marco queda con un borde incompleto que parpadea y las baldosas de más vuelven solas a la bandeja: el lado cae entre dos enteros, y el juego lo muestra con las dos cuadrículas vecinas.
4. Agrandar el jardín. El jugador arrastra una tira de baldosas al borde derecho y otra igual al borde de abajo. Queda un hueco cuadrado en la esquina, del tamaño del ancho de la tira. El jardín no es cuadrado hasta que el hueco se llena. Este gesto es todo lo que el nodo pide de completar el cuadrado; el procedimiento con nombre llega en `alg.expr.complete_square`.
5. Aparece el cofre. La cerradura tiene la forma del marco cuadrado y adentro hay una baldosa con el área. El jugador arrastra la llave `√` del llavero. La cerradura gira, y en vez de un cofre se abren dos, uno a cada lado de una marca central. Adentro hay dos fichas opuestas.
6. La recta plegada. Con dos dedos el jugador estira una recta con puntos marcados y la ve doblarse sobre el cero al aplicar el candado: los dos puntos opuestos caen encima. Al aplicar la llave, la recta se despliega, pero solo de un lado por vez; el jugador elige de qué lado.
7. Cierre de la situación: el jardín vuelve con las dos fichas del cofre al lado. La ficha negativa no cabe en el marco, y el marco la rechaza sin decir nada.

Nada se llama "incorrecto". El cuadrado que no cierra deja un borde parpadeando; el segundo cofre que se ignora queda abierto en la mesa hasta que el jugador lo toca.

## 7. Representación visual

Capa `visual`, primitiva `nonlinear` dominante ([H](../../H-progresion-abstraccion.md)).

Las baldosas se funden en un cuadrado liso con una llave en cada lado. Lo que se escala es el lado, y el área lo hace al cuadrado: al arrastrar el lado, la superficie se agranda con un rastro que deja marcada la forma anterior, para que el salto se vea. Lo que se conserva es el área total cuando las piezas se reacomodan, y esa conservación se muestra moviendo las dos tiras y la esquina de una configuración a la otra sin que la superficie parpadee.

`chest_key` entra como el diagrama vertical del nodo 12 con un cambio: la flecha de bajada sale de dos puntos distintos y llega al mismo. La llave dibujada hacia arriba se bifurca. Es la primera vez que el diagrama no es una línea.

`grid_stretch` entra como la recta doblada, con el punto de pliegue en el cero y los dos puntos de origen unidos por un hilo que pasa por debajo.

Todavía no hay `√` escrito, ni `±`, ni la parábola como gráfica de una función. La curva aparece como el rastro de la esquina del cuadrado cuando el lado crece, sin ejes.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Cuadrado con lado medido → ficha del lado.** Al cerrar el cuadrado por primera vez en `visual`, la llave del lado se contrae en una ficha con el número, pegada al borde. La otra llave se desvanece: en un cuadrado alcanza con una.
2. **Área contada → `x · x` → `x²`.** Al tocar el interior del cuadrado, el número de baldosas se despega y se reescribe como el producto de las dos fichas del lado. El producto se pliega sobre sí mismo y el segundo factor sube convertido en el exponente, con el mismo morph con que nació `aⁿ` en `arith.pow.repeated_scaling`.
3. **Cerradura con forma de marco → etiqueta `x²`.** Al arrastrar la llave por primera vez, la cerradura pierde la forma y gana la etiqueta; la llave pierde el color y gana un gancho, que es el trazo de la raíz.
4. **Dos cofres → un renglón con dos fichas.** Al abrirse los dos cofres, las dos fichas se acercan y se apoyan sobre un mismo renglón, separadas por un signo que las abraza: `x = 3` y `x = −3` conviven. Recién cuando el jugador toca el renglón, las dos se funden en `x = ±3`.
5. **Tiras y esquina → cuadrado de una suma.** Al llenar el hueco de la esquina, cada pieza escribe su área encima: el cuadrado grande, las dos tiras iguales y el cuadradito. Las cuatro etiquetas caen a un renglón en el orden en que están en el dibujo, y queda `(x + 3)² = x² + 6x + 9` con la esquina resaltada.

## 9. Notación matemática

Queda `x²` para el área del cuadrado de lado `x`, `√a` para el lado de un cuadrado de área `a`, `x = ±√a` para las dos soluciones de `x² = a`, y `(x + b)² = x² + 2bx + b²`.

Símbolo nuevo: **`√`**, en la capa `symbolic` ([H](../../H-progresion-abstraccion.md)). El problema que lo hizo necesario es nombrar el lado de un cuadrado cuya área se conoce y no es un cuadrado perfecto. Mientras las áreas eran 9, 16 y 25, el jugador decía el número y no hacía falta escribir nada. Con área 10 el lado existe, se ve en el marco, cae entre 3 y 4, y no tiene nombre. El gancho de la llave se vuelve el símbolo que lo nombra sin calcularlo.

El nodo agrega además una convención de escritura, con su propio problema: **`±`**. Los dos cofres se abren siempre, y escribir dos renglones cada vez es incómodo cuando la expresión de adentro es larga. El signo doble es la manera de decir "las dos ramas" en un renglón, y el juego lo introduce solo después de que el jugador vio los dos cofres muchas veces, para que sea una abreviatura de algo vivido y no una decoración. La cheatsheet guarda las dos caras en `cs.alg.sqrt_two_branches` y `cs.alg.parabola_from_square_tile`.

## 10. Definición formal

Capa `formal`: texto corto con voz y el cuadrado de baldosas al lado. Tres frases, de a una: "El cuadrado de un número es el área del cuadrado que tiene a ese número como lado." "La raíz cuadrada de un área es el lado que la produce." "Si un cuadrado tiene área `a` mayor que cero, hay dos números que lo producen, y son opuestos."

Condiciones y casos, verificados sobre el objeto: `x² = a` tiene dos soluciones si `a` es mayor que cero, una sola si `a` es cero, y ninguna entre los números que el jugador tiene, si `a` es negativo, porque ningún cuadrado tiene área negativa. Ese último caso queda marcado y no resuelto: es la puerta de `precalc.cplx.plane_intro`. El símbolo `√a` nombra por convención la rama que sirve para medir, la que no es negativa, y el juego lo dice cuando el jugador ya sabe que la otra existe, nunca antes.

Ya jugado: las tres frases enteras y los tres casos. Nuevo: las palabras "cuadrado" y "raíz" como nombres, y la convención sobre cuál rama nombra el símbolo solo.

## 11. Propiedades

- **Escalar el lado por un factor multiplica el área por el cuadrado del factor.** Ligada a estirar el jardín con dos dedos y ver el rastro de la forma anterior.
- **`x² = a` con `a` mayor que cero tiene exactamente dos soluciones opuestas.** Ligada a los dos cofres que se abren con la misma llave.
- **Elevar al cuadrado y sacar raíz se deshacen solo después de elegir una rama.** Ligada a la recta que se pliega y se despliega de un lado por vez. Es la condición del nodo 21 dicha sobre un caso concreto.
- **El cuadrado de una suma tiene cuatro piezas.** `(x + b)² = x² + 2bx + b²`, ligada a las dos tiras iguales y la esquina. La misma figura leída al revés es agregar la esquina que falta.
- **La raíz de un producto se reparte entre los factores.** Ligada a partir un rectángulo de área conocida en dos cuadrados que se pueden armar por separado.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: un jardín cuadrado con el área marcada y cuatro fichas al costado; tocar la del lado. Los distractores salen de las reglas `detect` del nodo, incluida la mitad del área.
- `explain`: tres animaciones sobre los mismos objetos. En una, la llave de raíz abre dos cofres, uno positivo y uno negativo; en otra abre uno solo; en la tercera el cuadrado de una suma se arma sin las baldosas del medio. Tocar las dos que pierden algo. Cada distractor es una misconception del nodo, así que el error también clasifica.
- `manipulate`: armar un cuadrado con baldosas a partir del área y leer el lado; después usar la llave de raíz sobre un cofre y ver abrirse los dos.
- `apply`: una grilla estirada por un factor al cuadrado; arrastrar la ficha del factor que produce el área mostrada, contra el tiempo objetivo del nodo.
- `generalize`: sin baldosas, fichas con exponente dos y con raíz; resolver cofres cuadrados con las dos ramas y descartar la rama sin sentido cuando la situación lo pide.
- `transfer`: en el triángulo de `geom.tri.pythagoras_as_tiles`, tocar el lado que resulta de recomponer las baldosas de los dos cuadrados.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`sqrt_loses_negative_branch`**, patrón `double_flip` sobre `chest_key`, que es mecánica del nodo y corre sin traducción. El jugador resuelve `x² = 9` y se queda con `x = 3`. El juego muestra el primer giro, la ficha `3` entrando al candado y saliendo `9`; después el segundo giro, la ficha `−3` entrando y saliendo `9` también; y compara los dos aterrizajes sobre la misma marca. Voz: "Otro número también da 9 al cuadrado. ¿Cuál es?". La ficha olvidada queda sobre la mesa y el jugador decide si sirve o no en esta situación.
- **`distribute_over_wrong_op`**, patrón `missing_piece_tiles` sobre `tiles`, mecánica principal del nodo. El jugador responde `x² + 9` para `(x + 3)²`. El juego coloca el cuadrado de lado `x` y el de lado `3` en esquinas opuestas de un marco de lado `x + 3`. Quedan dos rectángulos vacíos que parpadean. Voz: "Al cuadrado le falta un pedazo. ¿Qué baldosas faltan?". Las tiras están en la bandeja, y al colocarlas la expresión pasa a `x² + 6x + 9` con un morph.

## 13. Generalización

La analogía se retira en `formal`, más tarde que en los nodos vecinos, por la misma razón que en el nodo 21: el jardín es la única manera de mostrar que la rama negativa no cabe en la situación sin que parezca un error del jugador. Recién cuando la elección de rama se toma con la situación escrita y no con el marco, el jardín se desvanece y quedan las fichas.

Variantes sin ayuda visual, en orden: áreas que son cuadrados perfectos; áreas que no lo son, donde la respuesta se deja escrita con el símbolo; ecuaciones donde el cuadrado está desplazado, `(x + 2)² = 16`, y las dos ramas dan dos resultados distintos y los dos sirven; situaciones donde una rama se descarta y hay que decir por qué; áreas negativas, que se marcan como sin respuesta y no como error.

El nodo está en `abstract` cuando el jugador resuelve `x² = a` dando las dos ramas sin que nadie se lo recuerde, justifica el descarte de una rama con la situación y no con una regla, escribe `(x + b)²` completo sin dibujar baldosas y reconoce la pieza que falta en un desarrollo ajeno.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con una mecánica de llegada distinta:

- `geom.tri.pythagoras_as_tiles`: los cuadrados de los dos catetos se desarman y se recomponen en el cuadrado de la hipotenusa; la raíz aparece porque lo que se busca es un lado y lo que se sabe es un área.
- `geom.area.rect_and_triangle`: el área que crece con el cuadrado del lado se vuelve el argumento de por qué escalar una figura no escala su área en la misma proporción.
- `trig.id.pythagorean_identity`: las mismas baldosas sobre un círculo, donde la suma de dos cuadrados es constante y mover uno obliga al otro.
- `calc1.deriv.rate_as_slope_limit`: la curva del área es el primer lugar donde la pendiente cambia en cada punto, y el cuadrado que crece por dos lados es la figura de la que sale la derivada.

Concepto siguiente: `alg.fn.exponential_growth` ([23](23-alg.fn.exponential_growth.md)). Frase puente, narrada sobre el jardín que acaba de duplicar su lado: "Este jardín crece rápido porque el lado se multiplica por sí mismo una vez. ¿Y si se multiplicara otra vez en cada paso, y otra, y otra?". El cuadrado se apila sobre sí mismo y el nodo 23 empieza ahí, con la hoja que se dobla.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `tile_square_from_area` es nativa y toma el área como parámetro: las baldosas del jugador se ordenan en cuadrícula, la llave del lado se despliega y el número del lado aparece contando desde cero; gramática `nonlinear`, con el rastro de la forma anterior cuando el lado crece. `chest_one_key_two_chests` es nativa y toma el valor del cuadrado y la lista de raíces: la cerradura gira, se abren dos cofres a los costados de una marca central y las dos fichas caen sobre una recta. Es la imagen de cheatsheet de `cs.alg.sqrt_two_branches`. Ninguna lleva texto rasterizado: las etiquetas las dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). Se reúsan las baldosas del nodo 15 como distractores de `explain`.

**Calculadora:** en `ready` se habilitan `op_sqrt` y `op_solve_quadratic` ([M](../../M-calculadora/M0-progresion.md)). `op_sqrt` es un ícono de gancho sobre cualquier número armado con fichas, y no devuelve un solo resultado cuando se la usa para resolver: devuelve las dos ramas y deja que el jugador borre la que no sirve. `op_solve_quadratic` llega en su forma de caja de arena, aplicable a una expresión con un cuadrado, y muestra el signo doble en el resultado antes que cualquier fórmula. Si el nodo decae, el gancho aparece con una sola rama y hay que tocarlo para que muestre la otra.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel las baldosas llevan el número del área y las llaves llevan etiqueta ([Q](../../Q-edad-universal.md)). El armado del cuadrado, el hueco de la esquina, el cofre que se abre en dos y el pliegue de la recta se juegan sin leer, con targets grandes y prompts por voz. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel del cofre y usa el teclado de fichas para escribir las dos ramas antes de comprobarlas con la llave.
