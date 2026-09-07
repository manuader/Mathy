# 43 — Círculo unitario y radianes (`trig.circle.unit_circle_radians`)

> Locale `es`: "Círculo unitario y radianes". Minijuego: [La rueda de radio uno](../../F-minijuegos/trig.circle.unit_circle_radians.md).

**Nodo:** `trig.circle.unit_circle_radians` · **Área:** trig · **Nivel:** 4 · **Primitiva:** `displace` · **Mecánica principal:** `construct` (secundarias `gears_sequence` y `grid_stretch`) · **Literacy:** `icons` · **Analogía:** `clock_face_wrap`

## 1. Concepto

El círculo unitario es el círculo de radio 1 centrado en el origen, y un giro sobre él se mide por la longitud del arco recorrido: eso es el radián. Al terminar, el jugador ubica un ángulo dado en radianes sobre el círculo, baja la altura desde el extremo del radio y lee las dos coordenadas del punto con su signo, sin convertir a grados en ningún momento. Antes sabía que un ángulo es un giro; no sabía que un giro se puede medir con una regla.

## 2. Prerequisitos

- `geom.angle.turn_as_measure` (nodo 39): el ángulo como cantidad de giro, la vuelta completa como unidad y el ángulo recto como cuarto de vuelta. Se usa la rueda de giros entera; lo que cambia es con qué se mide.
- `geom.tri.pythagoras_as_tiles` (nodo 41): el triángulo rectángulo y la relación entre sus tres lados. Se usa sobre el triángulo que forman el radio, la altura bajada y el trozo de eje horizontal: es el que garantiza que las dos coordenadas del punto no son independientes.
- `alg.fn.graph_as_picture` (nodo 18): las coordenadas de un punto en la grilla y los cuatro cuadrantes con sus signos. Se usa la grilla completa, que es el lugar donde el círculo se apoya.

La arista con el nodo 39 no sigue el orden escolar en un punto importante. La escuela presenta el radián como una conversión: "para pasar de grados a radianes se multiplica por pi sobre ciento ochenta". Acá el radián nace primero, como una longitud medida con el radio, y los grados llegan después como lo que son, una convención antigua con un número cómodo de divisores. La conversión es una consecuencia, no una definición.

## 3. Dificultad cognitiva real

Lo difícil no es memorizar el círculo con sus valores. Son cinco capacidades:

1. **Entender que el radián no es una unidad sino una razón.** Es arco dividido radio, dos longitudes, y el cociente no tiene unidad. Por eso se puede sumar a un número y por eso más adelante se puede meter en una serie.
2. **Ver que la medida no depende del tamaño del círculo.** El mismo giro sobre un círculo grande recorre más arco, pero también tiene un radio más grande, y el cociente es el mismo. Es la única razón por la que la definición sirve.
3. **Aceptar que un punto trae dos números a la vez.** El giro es una sola entrada y produce una posición, que en la grilla se lee con dos coordenadas. La tentación es tratarlas como dos cosas sueltas.
4. **Leer los signos como coordenadas y no como una regla.** En el segundo cuadrante la primera coordenada es negativa porque el punto está a la izquierda del centro, no porque una tabla lo diga.
5. **No leer 2 pi como "trescientos sesenta disfrazado".** Dos pi es la longitud del borde de un círculo de radio 1, y se puede medir con una cinta.

## 4. Problema intuitivo

La rueda de la plaza, quieta, con una cinta del largo exacto de uno de sus rayos. La pregunta, por voz o por gesto: cuántas veces entra esa cinta en el borde de la rueda, dando la vuelta entera.

En `intuition` la escena se detiene antes de medir. Tres desenlaces dibujados: entra tres veces justas; entra seis veces y sobra un pedacito; entra doce veces. El jugador elige y después ve. La cinta se apoya, se marca, se apoya de nuevo, y a la sexta queda un pedazo corto que no llega a otra cinta entera. En una segunda pantalla, la misma cinta y la misma rueda con el doble de tamaño: entran las mismas seis y el mismo pedacito, porque la cinta también creció.

## 5. Analogía del mundo real

`clock_face_wrap`, la del YAML, con la mecánica `gears_sequence` ([G0](../../G-analogias/G0-reglas.md)). Mapa: la esfera del reloj es el módulo; las horas que avanza la aguja son la suma; quedar en la misma posición después de vueltas completas es la congruencia; las vueltas completas olvidadas son el cociente que se descarta; la posición en la que queda la aguja es el resto; retroceder es restar.

Se eligió esta y no la rueda gigante porque acá interesa la **posición**, no la altura: el reloj es la única analogía del catálogo cuyo invariante es exactamente "dar vueltas enteras no cambia dónde estás". La rueda con el pasajero es la del nodo 44 y llega cuando lo que importa pasa a ser cuán alto está.

Invariante: la posición depende solo de lo que sobra después de descartar vueltas completas. Ruptura: `modulus_other_than_twelve`. El reloj tiene doce marcas y el círculo no tiene marcas; la vuelta del reloj es un número redondo y la del círculo mide dos pi. Por eso la esfera se retira en `formal`, cuando el jugador ya trabaja con ángulos que no caen en ninguna hora.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `construct` es la mecánica principal y aporta el gesto que define todo el nodo: trazar el radio y bajar la altura desde su extremo. `gears_sequence` aporta la manivela que desenrolla el radio sobre el arco, con su paso uniforme por vuelta. `grid_stretch` aporta la comprobación de que la medida no depende del tamaño ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap`, `hold` y `scrub`.

1. Un círculo con el centro marcado, un radio dibujado apoyado a la derecha, y una cinta del largo del radio guardada al costado.
2. El jugador arrastra el extremo del radio. El radio gira y el punto se desplaza por el borde. Mientras gira, la cinta se va apoyando sola sobre el arco recorrido y se cuenta cuántas cintas y qué pedazo de cinta lleva. Ese contador es la medida del ángulo.
3. Con la manivela (`scrub`), en lugar de arrastrar, el jugador avanza de a una cinta entera: uno, dos, tres radios de arco. La sexta cinta no cierra la vuelta y ahí se ve el pedacito.
4. Con un toque sostenido sobre el punto, baja la altura hasta el eje horizontal. Aparece el triángulo con el cuadradito del ángulo recto, la altura y el trozo de eje. La hipotenusa es el radio y mide 1.
5. Sobre la grilla, el jugador lee las dos coordenadas del punto tocando cada una. En los cuadrantes de la izquierda y de abajo el número aparece con signo, porque la grilla ya venía con signos del nodo 18.
6. Con dos dedos, el jugador estira la grilla y el círculo pasa a radio 3. El contador de cintas no cambia: la cinta creció con el círculo. La medida del giro es la misma.

Girar hacia atrás cuenta cintas en negativo. Pasarse de una vuelta sigue contando y el punto vuelve a pasar por donde ya estuvo, con el contador más grande: el reloj lo dice antes de que nadie lo escriba.

## 7. Representación visual

Capa `visual`, primitiva `displace` dominante, con `invariant` de apoyo.

Lo que se desplaza es el punto sobre el borde, y el arco recorrido queda pintado detrás como un rastro. Lo que se conserva es la distancia al centro: el radio nunca cambia de largo, y esa es la razón por la que el punto no puede salirse del círculo. Lo que se escala es la grilla, y solo en el nivel donde se comprueba la independencia del radio.

El arco recorrido se dibuja segmentado en tramos del largo del radio, como una cinta métrica curva con marcas cada radio. Al lado, una recta numérica horizontal recibe el mismo rastro desenrollado, con las mismas marcas: es la primera vez que el jugador ve un giro convertido en un largo, y es la imagen que el nodo 44 va a necesitar entera.

Todavía no hay nombres para las coordenadas, ni gráfico de función, ni pi escrito como número.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno con su gesto.

1. **Rueda a círculo.** Al terminar `intuition`, los rayos de la rueda se desvanecen menos uno, el borde se afina, y queda un círculo con un radio. El centro se marca con un punto.
2. **Cinta a marca de arco.** Cuando el jugador completa la primera vuelta contando cintas, las cintas dejan de dibujarse como objetos y quedan como marcas sobre el arco, numeradas 1, 2, 3.
3. **Marca a ficha `rad`.** Al soltar el radio en una posición cualquiera, el contador de marcas se contrae en una ficha con el número y la etiqueta `rad` pegada. La ficha nace del contador: es el mismo objeto, encogido.
4. **Punto a par de coordenadas.** Al bajar la altura, la altura se contrae en un número sobre el eje vertical y el pie del triángulo en otro sobre el horizontal; los dos se juntan entre paréntesis junto al punto. El triángulo queda como fantasma detrás.
5. **Coordenadas a nombres.** En el último nivel simbólico, la coordenada horizontal recibe el nombre `cos` y la vertical el nombre `sen`, cada uno saliendo de su número con un hilo que lo une a su lado del triángulo. Queda `(cos θ, sen θ)` sobre el punto, con el círculo detrás.

## 9. Notación matemática

Nacen tres símbolos, y por la regla de oro de [H](../../H-progresion-abstraccion.md) nacen de a uno, cada uno con su problema.

**`rad`** aparece en el paso 3. El problema: después de tres niveles contando cintas, escribir "dos cintas y media de arco" cada vez es más largo que el número. La unidad es el radio, y el nombre lo dice.

**`θ`** aparece cuando el jugador tiene que ubicar un ángulo que todavía no eligió. El problema: hablar del giro antes de fijarlo. Es la misma necesidad que hizo nacer `x` en el nodo 10, y el juego lo dice así, mostrando la caja cerrada un instante.

**`sen`** y **`cos`** aparecen en el paso 5, y solo como nombres de las dos coordenadas del punto. El problema: en el círculo unitario, las coordenadas de los puntos interesantes no son números que se puedan escribir cómodos, y hace falta una manera de referirse a la altura de un giro sin haberla calculado. Todavía no son funciones: son etiquetas de dos longitudes. Se vuelven máquinas en el nodo 44, y ahí llega su entrada de cheatsheet.

Sobre cómo se escriben: el juego muestra `sen` o `sin` según el `MathLocale` del jugador, que es independiente del idioma de la interfaz ([P](../../P-internacionalizacion.md)). En `es-AR` y `es-ES` se dibuja `sen`; en `en-US` y en varios locales de Europa, `sin`. El YAML del nodo no contiene ninguna de las dos formas, y las escenas se renderizan sin texto para que la etiqueta la dibuje el runtime.

## 10. Definición formal

Capa `formal`: texto corto con voz y el círculo al lado. Tres frases, de a una. "Un radián es el ángulo cuyo arco mide lo mismo que el radio." "La medida en radianes de un ángulo es el arco dividido el radio, y por eso no depende del tamaño del círculo." "El círculo unitario es el conjunto de puntos que están a distancia 1 del origen, y el punto al que lleva un giro de θ radianes desde la derecha, en sentido antihorario, tiene coordenadas `(cos θ, sen θ)`."

Condiciones y casos especiales, verificados sobre el objeto: la vuelta completa mide `2π` radianes y de ahí sale la conversión con los grados; los ángulos negativos son giros horarios; los ángulos mayores que `2π` son válidos y llevan al mismo punto que su resto; el sentido antihorario es una convención y el juego la muestra como tal, girando una vez al revés y viendo que todos los signos se dan vuelta.

Ya jugado: las tres frases enteras. Nuevo: la palabra convención y el nombre círculo unitario.

## 11. Propiedades

- **`θ = s / r`.** La medida de un giro es el arco sobre el radio. Ligada al contador de cintas.
- **La medida no depende del radio.** Ligada al gesto de estirar la grilla y ver el contador quieto.
- **Una vuelta mide `2π`, media vuelta `π`, un cuarto `π/2`.** Ligada a la sexta cinta y el pedacito.
- **El punto del círculo unitario cumple que la suma de los cuadrados de sus coordenadas es 1.** Es Pitágoras sobre el triángulo del radio, y se comprueba con baldosas. El nombre identidad pitagórica llega en `trig.id.pythagorean_identity`.
- **Sumar una vuelta no cambia el punto.** Ligada al reloj, y es lo que `trig.fn.periodic_wraps` va a convertir en periodicidad.
- **El signo de cada coordenada depende del cuadrante.** Ligada a leer la grilla, y se ordena en tabla en `trig.ang.quadrant_signs`.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: sobre el círculo de radio 1, tocar el punto donde termina un cuarto de vuelta. Los distractores son los otros tres cuartos y el punto de media vuelta.
- `explain`: desenrollar el radio sobre el arco con la manivela y elegir, entre tres animaciones, la que muestra por qué la vuelta completa mide un poco más de seis radios. Un distractor cuenta diámetros; otro cuenta cuerdas rectas en vez de arcos.
- `manipulate`: girar el radio hasta un ángulo dado, bajar la altura desde su extremo y leer las dos coordenadas en la grilla.
- `apply`: con la entrada de radianes de la cheatsheet a la vista, ubicar `π/6`, `π/2` y `4π/3` y armar sus coordenadas con las fichas, contra el tiempo objetivo del nodo.
- `generalize`: un círculo de radio 3, y predecir con la manivela cuánto mide el arco de un ángulo de 2 radianes.
- `transfer`: en el reloj de doce horas de `disc.mod.clock_equivalence`, encontrar qué giro en radianes lleva de las 12 a las 8 y comprobar que dar una vuelta más no cambia la posición.

El nodo declara la lista de misconceptions vacía, pero `misconceptions.yaml` incluye a este nodo entre los de `sin_of_sum_distributes`, y con razón: la primera vez que alguien escribe `sen(a + b) = sen a + sen b` suele ser acá, mirando dos giros que se suman.

- **`sin_of_sum_distributes`** (`counterexample_slider` sobre `machine_pipe`). El jugador suma dos giros y supone que las alturas se suman. La mecánica de la explicación no está entre las del nodo, así que corre la regla 2 de [L0](../../L-modelo-errores/L0-taxonomia.md): el jugador ya conoce la tubería desde `alg.fn.function_as_machine`, y la explicación se presenta como un regreso. El juego escribe la regla del jugador en la tubería, le engancha un deslizador al segundo ángulo y lo barre; con `a = b = π/2` la suma de alturas da 2 y la altura verdadera da 0. Congela ahí. Voz: "Dos cuartos de vuelta te dejan abajo del todo, y vos sumaste dos alturas de uno. ¿Dónde quedó el pasajero?". El patrón no reabre la interacción: el ítem se reinicia.

## 13. Generalización

La esfera del reloj se retira en `formal`, cuando los ángulos dejan de caer en horas. El círculo con marcas queda a demanda tocando la ficha `rad`.

Variantes sin ayuda visual, en orden: ángulos que son fracciones simples de vuelta; ángulos negativos; ángulos de más de una vuelta; el mismo ángulo sobre un círculo de radio distinto; arcos dados y el ángulo pedido, que es la puerta de `trig.circle.radian_as_arc_length`.

El nodo está en `abstract` cuando el jugador ubica cualquier ángulo en radianes sin dibujar el reloj, dice el signo de las dos coordenadas antes de calcularlas, y explica por qué la medida no cambia con el radio.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`:

- `adv.cplx.multiplication_rotates_scales` (`grid_stretch`): multiplicar por un número complejo de módulo 1 es avanzar un ángulo sobre este mismo círculo, y multiplicar dos veces es sumar los giros.
- `linalg.map.linear_transformation_2d` (`grid_stretch`): las columnas de una matriz de rotación son las coordenadas a las que van a parar las dos flechas de la base, es decir dos puntos de este círculo.
- `disc.mod.clock_equivalence` (`gears_sequence`): el reloj sin el círculo, con el resto como única información que sobrevive a las vueltas.
- `calc2.parpol.parametric_speed` (`slope_walker`): el punto que recorre el círculo con el tiempo como entrada, y la velocidad como lo que se lee del recorrido.

Concepto siguiente: `trig.fn.sine_as_height` ([44](44-trig.fn.sine_as_height.md)). Frase puente, narrada sobre el círculo con el punto girando: "Ya sabés dónde queda el punto después de un giro. Ahora subite: si estás sentado ahí, lo único que te importa es a qué altura estás". La rueda gigante se dibuja alrededor del círculo unitario, el punto se convierte en el pasajero, y el nodo 44 empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `construction_scene_radius_and_dropped_height` es nativa: el círculo sobre la grilla, el radio que gira con el gesto del jugador, la altura que baja desde el extremo, el cuadradito del recto y las dos coordenadas que se encienden en los ejes; gramática `displace`, parametrizada por el ángulo, sirve también para los distractores de `explain`. `gear_scene_unroll_radius_on_arc` tiene doble ruta, pre-renderizada y nativa: la cinta del largo del radio se apoya sobre el arco una y otra vez mientras la manivela gira, y el mismo rastro se desenrolla sobre una recta numérica al lado. Ninguna lleva texto rasterizado; los números y la etiqueta de la unidad los dibuja el runtime según el locale y el `MathLocale` ([P](../../P-internacionalizacion.md)).

**Calculadora:** en `ready` se habilita `op_unit_circle` ([M](../../M-calculadora/M0-progresion.md)), un círculo pequeño en el panel que convierte entre giro y punto en los dos sentidos: se le da un ángulo y muestra dónde cae con sus dos coordenadas, o se toca un punto del borde y devuelve el ángulo. Incluye la conversión con grados, reducir un ángulo a su primera vuelta y el ángulo de referencia. Es dependiente del locale, porque escribe `sen` o `sin` según el `MathLocale`.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel el contador de cintas muestra números con la etiqueta de la unidad ([Q](../../Q-edad-universal.md)). Todo lo demás se juega sin leer: girar es arrastrar, medir es apoyar la cinta, los cuadrantes son cuatro regiones de la grilla y los prompts son voz. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra en la capa `visual` con el círculo ya sobre la grilla, y usa el teclado de fichas con `π` disponible desde el primer nivel simbólico.
