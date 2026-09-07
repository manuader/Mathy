# El mapa del tesoro (`linalg.vec.vector_as_displacement`)

Minijuego del nodo 30 de la espina, "Vector como desplazamiento". Mecánica principal `grid_stretch`, secundaria `gears_sequence`; analogía `treasure_map_arrows`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/30-linalg.vec.vector_as_displacement.md): un concepto, cuatro dificultades reales (separar el desplazamiento del lugar, leer dos cuentas independientes, no sumar los pasos para el largo, aceptar cuentas negativas), una analogía, dos gestos que se oponen (arrastrar la flecha del cuerpo contra arrastrarla de la punta), cinco pasos de desvanecimiento, la nube de copias translúcidas como imagen central, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Un mapa viejo sobre pergamino, con una grilla dibujada encima, un cofre, un faro y una cruz. Un caminante y una tarjeta con una flecha: la instrucción para llegar de un lado a otro. Abajo del mapa, dos manivelas con un contador cada una.

Mapa objeto → concepto: flecha en el mapa → vector; pasos al este y pasos al norte → componentes; segunda flecha desde la punta de la primera → suma de vectores; la misma flecha dibujada en cualquier lado del mapa → vector libre; flecha dada vuelta → vector opuesto; flecha del doble de largo → múltiplo escalar; manivela hacia atrás → componente negativa.

La flecha aporta el objeto entero; las manivelas aportan que las dos cuentas son independientes y se pueden hacer en cualquier orden. Punto de ruptura: `length_of_diagonal_arrow`. El pergamino no permite contar la diagonal en pasos, y ese vacío es el que después exige la fórmula del largo. La analogía se retira en `symbolic` ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el mapa ocupa el centro, las dos manivelas abajo con sus contadores, el llavero de flechas guardadas a un costado desde el tercer nivel. Gestos: `drag`, `tap` y `pinch` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Girar una manivela.** Cada clic mueve al caminante un cuadradito en esa dirección y alarga el trazo. El contador sube. Girando hacia atrás el caminante retrocede y, pasado el cero, el contador sigue en negativo.
- **Arrastrar la flecha del cuerpo.** La flecha viaja rígida por el mapa y queda un fantasma en el lugar de origen. Los contadores no se mueven. Es el gesto que define el concepto.
- **Arrastrar la flecha de la punta.** La flecha cambia y los contadores cambian con ella. El fantasma se separa y las dos flechas quedan visiblemente distintas.
- **Apoyar una flecha en la punta de otra.** El caminante recorre los dos tramos y aparece una flecha punteada del inicio al final, con sus propios contadores. Cambiar el orden de los dos tramos deja el mismo destino, y el juego lo muestra con el trazo anterior en fantasma.
- **Pinch sobre la flecha.** Se estira o se achica sin cambiar de dirección; los dos contadores se escalan a la vez. Pasar por cero la da vuelta.
- **Mantener el dedo sobre la flecha.** El mapa se llena de copias translúcidas de la misma flecha naciendo en todos lados. Es el vector libre, dibujado.

En `symbolic` la superficie cambia de forma, no de reglas: la flecha se sostiene sobre una grilla sin mapa, los contadores son una columna de dos fichas, y arrastrar la columna a otro lugar de la pantalla no la cambia, igual que arrastrar la flecha por el mapa. El mapa se pide con un toque y aparece como fantasma.

## Invariante matemático

`lines_stay_lines_origin_fixed` es el invariante de la mecánica, pero el que trabaja este minijuego es más chico y más específico: **dos flechas con las mismas dos cuentas son la misma flecha**, sin importar desde dónde salen.

Se ve confirmarse cuando el jugador arrastra la flecha entera y los contadores no se mueven, y cuando la nube de copias muestra todas las flechas con los mismos catetos. Se ve romperse cuando el jugador la arrastra de la punta: el fantasma se queda atrás con sus cuentas y la flecha nueva tiene otras. No hay mensaje; la divergencia de los dos contadores es el mensaje.

El segundo invariante, heredado de `gears_sequence`, es que el orden de los dos tramos no cambia el destino. Se ve al alternar manivelas y llegar siempre al mismo cuadradito.

Un movimiento válido pero inútil, como girar una manivela adelante y atrás, o encadenar una flecha con su opuesta, no rompe nada: deja al caminante donde estaba y recibe un empujón suave.

## Representación visual

Primitiva dominante `displace` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el pergamino con el caminante, sin manivelas. Solo se mira y se predice qué pasa si la misma tarjeta se usa desde otro punto de partida.
- `concrete`: mapa con grilla impresa, flechas de colores, caminante que recorre en escalera, manivelas con contadores.
- `visual`: el pergamino se va y queda la grilla. La flecha se ancla en el origen y sus dos cuentas se dibujan como catetos punteados, formando el triángulo de pasos. La hipotenusa está dibujada pero sin etiqueta. La nube de copias translúcidas se enciende a demanda.
- `symbolic`: la columna de componentes con su corchete, la letra con flechita, `2v⃗` y `−v⃗` escritos al costado, la grilla como fantasma.
- `formal`: la definición corta con voz y la flecha al lado; las barras dobles del largo con el triángulo iluminado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Pergamino → grilla: al arrastrar la flecha entera a otro rincón por primera vez y ver los contadores quietos, la textura del pergamino se desvanece y queda la grilla.
2. Catetos → fichas: los dos catetos punteados se contraen en dos fichas numéricas junto a la flecha, cada una con el color de su manivela.
3. Fichas → columna: al arrastrar la flecha otra vez con las fichas puestas, las fichas se apilan y un corchete fino crece a los costados.
4. Flecha → nombre: cuando hay dos flechas en pantalla, cada una se contrae hasta una letra con flechita encima, conservando color e id.
5. Manivelas → operaciones: el `pinch` al doble escribe `2v⃗`, las manivelas hacia atrás escriben `−v⃗`, y la flecha punteada de una cadena escribe `u⃗ + v⃗`.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la grilla fantasma: un vector del plano queda determinado por dos números, sus componentes; dos flechas son el mismo vector si tienen las mismas componentes, sin importar desde dónde salen; el largo del vector es la hipotenusa del triángulo de pasos, `‖v⃗‖ = √(v₁² + v₂²)`.

Propiedades: encadenar suma componente a componente; dar vuelta cambia los dos signos y estirar escala las dos componentes; el largo no es la suma de las componentes, y la flecha derecha nunca es más larga que el camino en escalera; el orden de los dos tramos no cambia el destino. Casos especiales: el vector cero es una flecha sin largo y sin dirección; una flecha puramente al este tiene la otra componente en cero.

Símbolos nuevos: la columna con corchete, que nace porque el par escrito en fila ya significa un lugar desde el nodo 18; la flechita sobre la letra, que nace en cuanto hay flechas y números de pasos en la misma pantalla; y las barras dobles, que nacen con la pregunta por la diagonal. Cheatsheet: `cs.linalg.vector_components` y `cs.linalg.vector_length`, las dos en capa `symbolic`.

## Generalización

El mapa se retira en `symbolic`, cuando la columna se sostiene sin grilla debajo. Se pide con un toque hasta `formal` y después no vuelve.

Variantes sin ayuda visual: componentes negativas; flechas que salen de un punto que no es el origen y hay que leer por diferencia; componentes fraccionarias; el vector cero; predecir el largo antes de medirlo. Después, desplazamientos que no viven en un mapa: dos diales de una máquina, la variación de dos precios entre ayer y hoy, dos marcadores de un partido. El jugador reconoce que sumar dos cambios, darlos vuelta y duplicarlos tienen la misma estructura, y que ahí el largo puede no significar nada. Cuando opera con columnas sin pedir grilla y distingue una posición de un desplazamiento en un contexto nuevo, la analogía se eliminó.

## Desafío

Seis niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Dos manivelas.** `concrete`, `manipulate`. Solo cuentas positivas chicas, mapa completo, una flecha por vez. El caminante recorre en escalera.
2. **La misma flecha en otro rincón.** `concrete`, `recognize` y `explain`. Se habilita arrastrar la flecha del cuerpo y de la punta. Aparece la nube de copias. Rango numérico igual al nivel 1.
3. **Encadenar.** `concrete`, `manipulate` y `apply`. Dos flechas punta con cola y la punteada que las resume. Se habilita el llavero de flechas guardadas.
4. **Triángulo de pasos.** `visual`, `explain`. El pergamino se va, aparecen los catetos punteados y el `pinch`. Aparece `modulus_of_sum_adds` cuando el jugador estima el largo.
5. **Columnas.** `symbolic`, `apply`. Fichas y columna; el mapa se pide con un toque. Parámetros: cuentas negativas y rango mayor.
6. **Sin grilla.** `formal` y `abstract`, `generalize` y `transfer`. Componentes fraccionarias, flechas que no salen del origen, desplazamientos que no son pasos.

Qué endurece cada parámetro: el rango numérico obliga a leer los contadores en vez de contar cuadraditos; los negativos rompen la lectura "flecha es hacia allá" y obligan a la cuenta con signo; las fracciones rompen el paso como unidad y anticipan el retiro de la analogía; los puntos de partida distintos del origen son los que fuerzan la lectura por diferencia.

Desafíos de olimpíada: [S](../S-desafios/S0-desafios.md) no tiene todavía un desafío que este nodo solo desbloquee. Los desafíos de álgebra lineal escritos requieren nodos posteriores, así que este nodo no exige desafío para `mastered`.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: seis flechas repartidas por el mapa; tocar la que va tres pasos al este y dos al norte. Distractores: cuentas invertidas, una cuenta con el signo cambiado, la misma dirección con otro largo.
- `explain`: la misma flecha en tres animaciones, una arrastrada del cuerpo, otra de la punta, otra girada sobre su cola. Tocar las dos que dejan de ser el mismo desplazamiento y narrar la diferencia con la voz. El distractor elegido clasifica.
- `manipulate`: dibujar la flecha del cofre al faro y después la que vuelve; la segunda tiene que quedar con los dos contadores en negativo.
- `apply`: con la flecha dada, ubicar dónde termina el caminante saliendo del molino, antes de que se mueva. Cuatro instancias seguidas contra el tiempo objetivo del nodo.
- `generalize`: con la grilla apagada, estirar la flecha al doble y predecir sus componentes; después con factor `1/2` y con factor `−1`.
- `transfer`: en la rueda giratoria de `trig.rot.rotation_matrix`, ubicar el punto que corresponde a la flecha que apunta hacia arriba y a la derecha. También en `adv.cplx.plane_and_modulus`, `mvcalc.field.arrow_at_every_point` y `geom.trans.dilation`.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `modulus_of_sum_adds`, patrón `counterexample_slider`. Su mecánica declarada es `slope_walker`, que este nodo no declara, así que se aplica la regla de L0: si el jugador ya conoce al caminante de la pendiente desde `alg.fn.linear_slope`, el contraejemplo corre ahí y se presenta como un regreso; si no, corre sobre `grid_stretch` con el mismo invariante. Se ve igual en los dos casos: un deslizador mueve la cuenta del norte desde cero hacia arriba mientras dos cuerdas se tensan sobre el mapa, una por el camino en escalera y otra por la diagonal, y la diferencia se abre. En cero coinciden. Voz: "Caminaste tres al este y cuatro al norte. ¿La flecha derecha mide lo mismo que el camino en escalera?".

Confundir el desplazamiento con el lugar no está catalogado y no dispara explicación: el fantasma y los contadores lo desmienten solos, y el jugador recibe un empujón suave. Los distractores de `explain` y las opciones de `recognize` se generan desde las reglas `detect` de la misconception y las de los prerequisitos directos.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `grid_scene_arrow_on_map`, nativa. Recibe el vector y una lista de puntos de partida; dibuja la misma flecha naciendo en cada uno con catetos punteados iguales. Gramática `displace`. Es la escena del vector libre, abre el nivel 2 y produce las animaciones de `explain`.
- `gear_scene_steps_east_then_north`, nativa. Recibe las dos cuentas; anima al caminante haciendo primero el tramo al este y después el del norte, con el trazo que queda y la flecha recta que lo resume. Gramática `displace`, con las dos manivelas girando en sincronía. Es la imagen de cheatsheet de `cs.linalg.vector_components`.
- Sin texto rasterizado: los contadores y las componentes los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_map_arrow`: `east_range` y `north_range` (de 1 a 5 en los niveles 1 a 3, hasta 12 en el 5); `allow_negative` (falso hasta el nivel 4); `fractional` (desde el nivel 6); `origin_at` en {origin, landmark, free}; `seed`.
- `gen_arrow_pair`: dos flechas para encadenar, con `angle_spread` para que la cadena no quede alineada y `chain_length` en {2, 3}.
- `gen_map_scene`: la disposición del mapa, con `landmarks` (cofre, faro, molino, cruz) y `grid_size`; sin palabras.
- `gen_arrow_distractors`: distractores desde `detect`, con las reglas de componentes intercambiadas, un signo dado vuelta y la misma dirección con otro largo.

**Literacy soportada:** de `icons` a `full_text`. La primera capa se juega sin leer, pero los contadores de las manivelas muestran un dígito con signo desde el primer nivel y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma gira la manivela del este tres clics y la del norte dos; el caminante avanza en escalera y la flecha lo sigue. La escena vuelve al inicio y las manivelas laten. En el nivel 2 hay una segunda demostración, la única del minijuego: la mano toma la flecha del cuerpo y la lleva a otro rincón, y los contadores quedan quietos. Se repiten solo si el jugador se queda quieto ([Q](../Q-edad-universal.md)).

**Calculadora:** `op_vector_length` queda disponible desde el panel lateral en cuanto el nodo pasa a `ready`, y dibuja el triángulo de pasos junto al número ([M](../M-calculadora/M0-progresion.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
