# S0 — Desafíos: el nivel de olimpíada

Este documento define el nivel de desafío de Mathy: problemas difíciles, de varios pasos, con datos que faltan y que hay que descubrir. Los datos viven en [`challenges.yaml`](challenges.yaml); las cadenas visibles al jugador, en [`../locales/es/challenges.yaml`](../locales/es/challenges.yaml). Las constantes que deciden cómo cuenta un desafío en el modelo de mastery viven solo en [K](../K-evaluacion.md). Acá se argumenta una vez qué es un desafío, cómo se juega, cómo se valida y cómo crece el catálogo.

## Qué es un desafío

Un minijuego ([F](../F-minijuegos/F0-principios.md)) enseña **una idea** con **una mecánica** sobre **un nodo** del grafo. Un desafío hace lo contrario: combina **varios nodos** y **varias mecánicas** en un problema donde lo más difícil no es ejecutar una operación sino **decidir cuál**. En un minijuego el jugador sabe que está aprendiendo Pitágoras y toda la pantalla le habla de Pitágoras. En un desafío nadie le dice que hay un triángulo rectángulo escondido: tiene que descubrirlo.

Las diferencias concretas:

| | Minijuego | Desafío |
|---|---|---|
| Alcance | un nodo | un conjunto de nodos en `ready` |
| Mecánicas | una principal, con desvanecimiento por capas | `construct` más la del área, combinadas en una sola escena |
| Qué se evalúa | ejecutar la transformación | elegir la estrategia y después ejecutarla |
| Datos | todos a la vista | al menos uno escondido, que hay que derivar |
| Instancias | generadas por parámetros | generadas por parámetros o figura fija de un banco propio |
| Se desbloquea | cuando un nodo está `available` | cuando **todos** los nodos requeridos están `ready` |
| Es obligatorio | sí, para llegar a `ready` | nunca, para avanzar en el grafo |
| Cheatsheet | a un toque | abierta desde el inicio |

Lo que comparten es lo importante: la validación por movimiento y no solo por respuesta final, la explicación de errores sobre la mecánica ([L](../L-modelo-errores/L0-taxonomia.md)) y la ausencia total de pantallas de drill. Un desafío no es una hoja de problemas con una figura al lado. Es una figura sobre la que se trabaja.

El pedido de diseño es literal: tiene que haber niveles difíciles con problemas de olimpíada. Por ejemplo, una forma geométrica de la que hay que calcular un área o un volumen con datos que faltan, y que se descubren trazando líneas y aprovechando la geometría del problema, con una cheatsheet con las fórmulas y las reglas siempre a mano. El resto de este documento desarrolla ese ejemplo y lo extiende a todas las áreas fundamentales.

## El ejemplo canónico, paso a paso

`ch.geom.trapezoid_hidden_height`, tier de entrenamiento. Requiere `geom.area.trapezoid_as_two_triangles`, `geom.tri.pythagoras_as_tiles` y `geom.cons.auxiliary_lines` en `ready`. La instancia que sigue es una de las que produce el generador `gen_trapezoid_hidden_height` con la terna 5, 12, 13.

```
        D           C
         +---------+
         |          \
         |           \  13
         |            \
         |             \
         +--------------+
        A       14       B

   DC = 9    AB = 14    BC = 13    ángulos rectos en A y en D
   Pregunta: área del trapecio.
```

La cheatsheet está abierta en el panel lateral y muestra, entre otras, `cs.geom.area_trapezoid`, `cs.geom.pythagoras` y la estrategia `cs.geom.strategy_draw_altitude`. La fórmula del área pide la altura, y la altura no está. Ese es el dato oculto. Todo lo que sigue es lo que hace el motor sintético ([O](../O-arquitectura-tecnica.md)) en cada gesto del jugador.

**Construcción 1: bajar la altura desde C.** El jugador toca C y arrastra hacia AB. La mecánica `construct` reconoce el gesto de proyección y emite `Construct.DropPerpendicular(C, AB)`. El motor crea el punto H sobre AB y el segmento CH, y deriva los hechos `CH ⊥ AB`, `∠CHB = 90°`, `∠CHA = 90°`. Con la regla "dos ángulos rectos consecutivos sobre una recta y un lado común" registra que CHB es un triángulo rectángulo. Compara los hechos derivados con la lista `hidden_data` del desafío: "existe una altura" era el primer dato faltante. Se marca como descubierto y se emite un ítem `apply` con resultado positivo. La figura no cambió: ninguna medida se movió. Solo apareció algo que ya estaba.

**Construcción 2: marcar segmentos iguales.** El jugador marca AH igual a DC. El motor valida el `MarkEqual` contra la realización numérica (ambos miden 9) y contra la base de hechos: AHCD tiene tres ángulos rectos, luego es rectángulo, luego lados opuestos iguales. La igualdad está derivada y se acepta. De ahí sale HB = 14 − 9 = 5, el segundo dato oculto. Otro ítem `apply`.

**Construcción 3: Pitágoras.** Sobre el triángulo CHB el jugador aplica la entrada de Pitágoras con la mecánica `tiles`: la hipotenusa 13 y el cateto 5 son baldosas, y la baldosa que falta es la de lado CH. `CH² = 169 − 25 = 144`, `CH = 12`. Este paso es un ítem `apply` del nodo de Pitágoras y, como se aplica fuera del contexto en que se aprendió, también un ítem `generalize`.

**Construcción 4: el área.** `(14 + 9) / 2 × 12 = 138`. El jugador arma el número con el teclado de fichas. El desafío queda resuelto sin pistas.

### Cuando el jugador traza una línea inútil

Supongamos que en lugar de bajar la altura el jugador traza la diagonal AC. `Construct.DrawSegment(A, C)` es una construcción válida: no cambia la figura, agrega un objeto, deriva dos triángulos. El motor la acepta. Pero ningún hecho nuevo coincide con `hidden_data`: la heurística de progreso de [O](../O-arquitectura-tecnica.md) (cantidad de datos desconocidos que quedan) no bajó. Esto **no es un error**. Es un rodeo válido, y [F](../F-minijuegos/F0-principios.md) fija la respuesta: un movimiento válido pero inútil recibe un **empujón suave**, no una corrección. La diagonal queda dibujada, atenuada, y el vértice C late una vez. Si el jugador pide una pista, la primera es la que corresponde a su estado real: "¿Qué dato necesita la fórmula del área que todavía no tenés?". El evento se registra como construcción válida sin progreso; no cuenta como evidencia negativa y sí alimenta la minería de estrategias (sección "Cómo crece el catálogo").

### Cuando el jugador asume un ángulo recto que no existe

Ahora supongamos que el jugador marca el ángulo en C, entre DC y CB, como recto. Es un `MarkEqual(∠DCB, 90°)`. El motor lo valida contra la realización numérica y es falso. No hay hecho que lo justifique. Esto sí es una misconception, pero no es de las de [L](../L-modelo-errores/L0-taxonomia.md): no hay una regla algebraica mal aplicada. Es una decisión de plan equivocada. Por eso `challenges.yaml` define su propia lista de **misconceptions de estrategia**, con el mismo contrato de L (patrón, mecánica, severidad) y una señal del motor que la dispara:

| id | señal que la dispara | patrón / mecánica |
|---|---|---|
| `strategy_missing_auxiliary_line` | intenta responder o marcar un dato que no está derivado | replay_on_mechanic / construct |
| `assumed_right_angle` | marca 90° un ángulo que numéricamente no lo es | replay_on_mechanic / construct |
| `assumed_equal_segments` | marca iguales dos segmentos que no lo son | replay_on_mechanic / construct |
| `assumed_parallel` | marca paralelas dos rectas que se cortan | replay_on_mechanic / construct |
| `assumed_same_whole` | toma una fracción del entero original cuando el entero cambió | missing_piece_tiles / tiles |
| `counted_twice` | el mismo objeto aparece en dos filas del libro | replay_on_mechanic / ledger |
| `ignored_case` | el conjunto respuesta omite una rama o un cajón | two_paths_diverge / sorter |
| `assumed_uniform_space` | arma el espacio muestral con los valores y no con las extracciones | replay_on_mechanic / urn_dice |
| `ignored_base_rate` | calcula la condicional sin la fila de la población | replay_on_mechanic / sorter |
| `ignored_constraint` | optimiza con dos variables libres | replay_on_mechanic / slope_walker |
| `tracked_wrong_basis_arrow` | lee una columna de la imagen del vector equivocado | replay_on_mechanic / grid_stretch |

Con `assumed_right_angle` el patrón `replay_on_mechanic` corre sobre `construct`: el juego congela la figura, apoya la esquina de una baldosa cuadrada en C, y la baldosa no calza; sobra un ángulo visible entre la baldosa y el lado CB. El halo marca la brecha. La voz pregunta qué mide de verdad ese ángulo, y devuelve el control con la marca borrada. El jugador continúa desde su estado real, que sigue siendo válido: la figura, la diagonal si la trazó, y nada más. Las misconceptions de L siguen activas en el desafío por el vecindario conceptual de los nodos requeridos; `area_uses_slant_side`, por ejemplo, se dispara si el jugador usa 13 como altura.

Nota para L: `explanation_patterns.yaml` declara qué mecánicas admite cada patrón, y hoy `replay_on_mechanic` no lista `construct`. Este documento la requiere. El cambio es una línea en L y el validador lo exige.

## La mecánica `construct` y su combinación con las del área

`construct` ([E0](../E-mecanicas/E0-catalogo.md)) es la mecánica central del nivel de desafío. Su invariante, `construction_reveals_not_changes`, es exactamente lo que un problema de olimpíada exige: el enunciado no cambia; lo que cambia es lo que el jugador ve en él. Los cinco gestos del vocabulario `Construct.*` de [O](../O-arquitectura-tecnica.md) (trazar un segmento entre puntos, bajar una perpendicular, prolongar, marcar igualdades, levantar una copia para reflejarla o rotarla) son las herramientas que reemplazan al teclado de fichas en la pantalla de desafío ([N](../N-ux-ui.md)).

Pero `construct` sola no calcula nada. Por eso cada desafío declara `mechanics` con `construct` primero y la mecánica del área después, y la escena las combina sin cambiar de pantalla:

- En geometría, `tiles`: descubierto el triángulo rectángulo, Pitágoras se aplica con baldosas sobre la misma figura, y el área final se arma con baldosas sobre el trapecio.
- En trigonometría, `construct` con `slope_walker` (la tangente como pendiente de la altura bajada) y con `balance` (igualar dos expresiones de la misma altura).
- En cálculo, `construct` con `slope_walker` (derivar la función objetivo una vez escrita) y con `fill_accumulate` (el volumen como acumulación de rebanadas que el jugador trazó).
- En álgebra lineal, `construct` con `grid_stretch`: proyectar es bajar una perpendicular, y el determinante es el área del paralelogramo que el jugador construyó.

En las áreas sin figura geométrica el papel de `construct` lo cumple la mecánica del área en su etapa más abstracta: en combinatoria "trazar la línea" es trazar puentes en `network_routes` o abrir cajones en `sorter`; en probabilidad es tender el árbol o la grilla; en álgebra es poner en la balanza una igualdad que el enunciado escondía. La regla es la misma: cada gesto agrega un objeto que revela una relación, y el motor lo valida como construcción.

## Andamiaje

**La cheatsheet está abierta de entrada.** Es la diferencia visible más importante con un minijuego, y viene del pedido original. En un desafío nadie tiene que recordar la fórmula del área del trapecio: el trabajo es darse cuenta de que falta la altura. La cheatsheet ([R0](../R-cheatsheet/R0-cheatsheet.md)) muestra las entradas que el jugador ya vio, agrupadas por tema, con las `strategy` (trazar la altura, buscar el triángulo rectángulo, listar lo que se sabe) al mismo nivel que las fórmulas. `cheatsheet_refs` en el YAML no restringe lo que se muestra: destaca las entradas pertinentes y las usa para la pista.

**Tres niveles de pista, nunca la respuesta.** Los ids de nivel son fijos (`what_is_missing`, `which_line_reveals_it`, `show_construction`); el texto de cada uno es por desafío y vive en el locale.

1. *Qué falta.* Una pregunta que señala el dato oculto sin nombrar cómo obtenerlo.
2. *Qué línea lo revela.* Una pregunta sobre la construcción, sin ejecutarla.
3. *La construcción.* Una animación de la construcción sobre la figura real del jugador, con la mecánica `construct`. Muestra el trazo y el hecho que aparece. No muestra el cálculo ni el número final.

En perfiles con `literacy: none` los tres niveles son animaciones; los dos primeros resaltan y laten, el tercero traza.

**Tres estados que cuentan distinto.** Un desafío termina en uno de tres estados, y [K](../K-evaluacion.md) es la única fuente de cuánto vale cada uno:

- `solved_no_hints`: el desafío completo cuenta como un ítem `transfer` con el crédito `CHALLENGE_NO_HINT_CREDIT`.
- `solved_hints`: cuenta como un ítem `transfer` con el crédito `CHALLENGE_HINT_CREDIT`.
- `seen`: el jugador pidió la solución paso a paso (`solution_steps` del locale, narrada sobre la figura). Cuenta `CHALLENGE_SEEN_CREDIT` y no satisface `MASTERED_CHALLENGE_MIN`.

Independientemente del estado final, cada construcción validada y cada dato descubierto ya fue un ítem `apply` o `generalize` normal de su nodo. Un desafío abandonado a mitad de camino no es tiempo perdido: la altura bajada ya fue evidencia. El ítem `transfer` lleva la etiqueta de cada nodo requerido, porque resolver el desafío es usar cada uno de ellos fuera del minijuego donde se aprendió.

## Los tres tiers

Cada área tiene desafíos de tres niveles. El tier no mide cuánto cuesta el cálculo sino **cuántas decisiones no obvias** hay que tomar y cuántos nodos se cruzan.

| Tier | Criterio | Ejemplo |
|---|---|---|
| `training` (entrenamiento) | un dato oculto; una construcción que la cheatsheet sugiere casi literalmente; dos o tres nodos de la misma área | trapecio sin altura, saludos en la mesa, al menos un seis |
| `regional` (olimpíada regional) | dos datos ocultos encadenados, o una construcción que no está en ninguna estrategia de la cheatsheet; puede cruzar dos áreas | cuerda y centro, las tres puertas, el cilindro dentro de la caja |
| `international` (olimpíada internacional) | hay que descubrir un **invariante** o una identidad, no solo un dato; suele exigir `proof_sketch` o combinar tres áreas | tablero mutilado, monedas que no se dejan, altura sobre la hipotenusa |

Los tiers no se desbloquean en orden. Cada desafío se desbloquea por sus propios nodos. Un jugador puede tener disponible un `international` de combinatoria y ningún `training` de cálculo. El selector de [J](../J-adaptativo.md) ofrece primero el tier más bajo disponible del área que el jugador trabajó en la sesión, y nunca impone ninguno.

## Desbloqueo y relación con el grafo

Un desafío está `available` cuando **todos** los nodos de `requires` están en `ready` o `mastered`. Un solo nodo `in_progress` lo deja `locked`. No hay diagnóstico que coloque desafíos: se juegan o no se juegan.

Tres reglas fijan la relación con el grafo:

1. **Nunca son obligatorios para avanzar.** El estado `ready`, el único que cuenta como prerequisito cumplido, no mira los desafíos. Un jugador puede recorrer el grafo entero sin resolver ninguno.
2. **Son condición para `mastered` en los nodos que los declaran.** El campo `challenges` de un nodo no se escribe a mano: el validador lo deriva de `requires` en `challenges.yaml`. Un nodo requerido por al menos un desafío necesita al menos `MASTERED_CHALLENGE_MIN` desafíos resueltos (sin pistas o con pistas) para certificar `mastered` ([K](../K-evaluacion.md)). La razón es que `mastered` promete transferencia, y un desafío es la evidencia de transferencia más honesta que el juego tiene.
3. **Un desafío decaído no existe.** Si un nodo requerido pasa a `decayed`, el desafío sigue `available` (no hay cascada de bloqueos, misma decisión que en K), pero el selector inyecta el repaso del nodo antes de ofrecerlo.

## El motor de geometría sintética

Los desafíos con figura no necesitan un CAS: necesitan un modelo de la figura. [O](../O-arquitectura-tecnica.md) lo describe como parte del `math-engine`; acá se fija lo que el contenido espera de él.

**Objetos.** Puntos con coordenadas (la figura tiene una realización numérica oculta que el jugador nunca ve como números), segmentos, rectas, ángulos, circunferencias. Cada figura generada trae su realización; cada figura fija del banco la declara.

**Hechos derivados.** Igualdad de longitudes, igualdad de ángulos, perpendicularidad, paralelismo, colinealidad, concurrencia, pertenencia a una circunferencia. Cada construcción del vocabulario `Construct.*` agrega objetos y dispara reglas de derivación cerradas, escritas a mano y suficientes para el contenido inicial: bajar una perpendicular crea un ángulo recto; dos ángulos rectos consecutivos sobre una recta y un lado común hacen un triángulo rectángulo; una reflexión crea segmentos iguales; una paralela por un punto crea ángulos correspondientes iguales; un radio hasta un extremo de una cuerda y la perpendicular desde el centro parten la cuerda por la mitad; tres ángulos rectos en un cuadrilátero lo hacen rectángulo. Un desafío que necesite una regla nueva la agrega al conjunto, y el spike de O la valida.

**Validación de una marca.** Un `MarkEqual` del jugador se compara con la realización numérica (con tolerancia) y con la base de hechos:

- numéricamente cierto y derivado: se acepta y, si figura en `hidden_data`, cuenta como descubierto;
- numéricamente cierto pero no derivado: se acepta como "dato descubierto pendiente de justificación" y el juego pregunta qué construcción lo justifica; no progresa hasta que se justifique;
- numéricamente falso: dispara `assumed_right_angle`, `assumed_equal_segments` o `assumed_parallel` según el tipo de marca.

**Progreso.** La heurística de progreso es la cantidad de entradas de `hidden_data` que quedan por descubrir. Una construcción válida que no la reduce recibe el empujón suave. `expected_constructions` lista los caminos conocidos como listas ordenadas; el motor no exige seguir uno de ellos, pero los usa para elegir la pista pertinente: la que corresponde al camino más cercano al estado del jugador.

**No hay demostración automática general.** Es una decisión de alcance, no una limitación provisoria. Un motor de demostración general es un proyecto en sí mismo y no lo necesita ninguno de los desafíos del contenido inicial. Lo que el motor garantiza es que cada construcción y cada dato del catálogo se validan correctamente; el criterio de aceptación está en la tabla de riesgos de O.

## Desafíos no geométricos

El patrón "dato oculto que se revela con una construcción" no es exclusivo de la geometría. En cada área fundamental el dato oculto tiene una forma propia:

**Álgebra: la ecuación escondida en el enunciado.** En `ch.alg.hidden_equation_ages` nadie escribe una ecuación; el jugador tiene que nombrar la caja, escribir dos edades futuras y darse cuenta de que "será el doble" es una balanza. La construcción es armar la balanza. En `ch.alg.symmetric_sum_of_squares` lo oculto es una identidad: el cuadrado de una suma como cuatro baldosas, de las que dos son el producto conocido.

**Teoría de números: divisibilidad y restos.** En `ch.arith.two_clocks_same_position` dos engranajes esconden un sistema de congruencias; la construcción es listar y alinear. En `ch.arith.parity_invariant_coins` lo oculto es un invariante: nada de lo que el jugador haga cambia la paridad, y descubrirlo es la respuesta.

**Combinatoria: elegir qué contar.** En `ch.disc.grid_paths_avoiding_corner` lo difícil no es Pascal sino darse cuenta de que hay que contar los caminos malos y restarlos, y que un camino malo se parte en dos tramos que se multiplican. `counted_twice` es la misconception de estrategia dominante del área: el libro de frutas muestra el mismo saludo en dos filas.

**Probabilidad: el espacio muestral no obvio.** En `ch.prob.two_dice_hidden_grid` el dato oculto es que hay 36 casillas y no 11 sumas. En `ch.prob.three_doors_switch` es lo que el presentador sabe: una rama del árbol que está forzada. `assumed_uniform_space` e `ignored_base_rate` son las trampas, y el patrón corre sobre la urna o el clasificador.

**Trigonometría: ángulos en la rueda y leyes.** `ch.trig.unit_circle_hidden_cosine` es Pitágoras sobre el triángulo del radio, y el dato oculto es el signo, que decide el cuadrante. `ch.trig.which_law_hidden_side` esconde la decisión: qué ley conviene según el patrón de datos, y siempre queda el camino de bajar la altura y usar Pitágoras dos veces. `ch.trig.all_solutions_on_the_wheel` esconde la segunda solución de cada rama; `ignored_case` se explica reflejando el ángulo en la rueda.

**Cálculo: optimización con restricción escondida.** En `ch.calc.fence_along_the_river` el área depende de dos lados y el cerco los ata; `ignored_constraint` se dispara cuando el jugador deriva con dos variables libres, y el caminante muestra que la colina no tiene cima si no se fija la restricción. `ch.calc.cylinder_inside_a_cone` es el cruce más fuerte del catálogo: la restricción es geométrica y se descubre con `construct` (corte axial, triángulos semejantes) antes de derivar.

**Álgebra lineal: transformación compuesta.** En `ch.linalg.matrix_of_a_composed_move` lo oculto es adónde van las flechas base después de dos movimientos, y que el orden importa. En `ch.linalg.shadow_gives_the_height` la altura de un paralelogramo se descubre proyectando: la misma perpendicular del trapecio, ahora sobre vectores, y el determinante como comprobación.

## Edad universal

Los desafíos existen también en los niveles 0 a 2, y no requieren leer ([Q](../Q-edad-universal.md), sección 4.2). Son **rompecabezas de baldosas con datos ocultos**: una figura cubierta parcialmente, donde hay que descubrir cuántas baldosas hay usando las que se ven. El catálogo inicial tiene seis, con `literacy_min: none`:

- `ch.geom.tiles_hidden_corner`: una hoja tapa una esquina del piso; prolongar las líneas de filas y columnas por debajo revela el rectángulo entero.
- `ch.geom.tiles_l_shape_split`: un piso en L con un brazo tapado; una línea recta lo parte en dos rectángulos.
- `ch.geom.tiles_triangle_half_rectangle`: un triángulo sobre la grilla; bajar la altura y encerrar cada mitad en un rectángulo muestra que cada una es la mitad.
- `ch.geom.tiles_slanted_same_as_straight`: un piso inclinado; cortar el triángulo que sobra y deslizarlo al otro lado lo vuelve rectángulo.
- `ch.geom.tiles_hidden_layers_volume`: una caja de cubos con capas escondidas; prolongar las aristas cuenta las capas y el volumen es capas por cubos de una capa.
- `ch.arith.plates_hidden_remainder`: bolitas en platos iguales con algunos platos tapados; completar las filas revela cuántas sobran.

Estos desafíos cumplen las reglas de Q sin excepción: el enunciado es una sola frase para voz (o nada, si el sonido está apagado; la figura con la hoja que tapa es el enunciado), los gestos son `drag` y `hold` con targets grandes, la cheatsheet es una imagen con voz, las tres pistas son animaciones y la solución paso a paso es una animación narrada. Cuentan en K igual que cualquier otro desafío: un niño que descubre las baldosas tapadas produce un ítem `transfer` de `geom.area.rect_and_triangle`. El tiempo no se muestra, y `T_STAR_LITERACY_NONE_FACTOR` se aplica como en todo nodo sin lectura.

El mismo desafío geométrico de tier alto también es jugable sin texto en la práctica, porque la figura y las herramientas son las mismas; lo que exige lectura es el enunciado. Por eso `literacy_min` es del desafío, no de la mecánica, y el selector nunca ofrece uno por encima del `literacy` del jugador.

## Cómo crece el catálogo

**Generadores con semilla.** Casi todos los desafíos declaran `generator` con un nombre de un registro y parámetros ([O](../O-arquitectura-tecnica.md): el contenido no contiene código). `gen_trapezoid_hidden_height` elige una terna pitagórica, una base larga y una orientación, y produce figura, realización numérica, `hidden_data` instanciado y respuesta. Una semilla fija reproduce la instancia; un jugador que vuelve a un desafío ya resuelto recibe otra instancia del mismo generador, y resolverla otra vez sin pistas mantiene el estado pero no suma otro ítem `transfer` en la misma sesión. Los parámetros de los generadores son lo que se afina con el event log: si una terna resulta demasiado fácil de reconocer, sale de la lista.

**Banco de problemas con licencia propia.** Algunos desafíos son figuras fijas (`generator: null`): el tablero mutilado, las tres puertas. Esos problemas son clásicos de dominio público en su idea, y el enunciado, la figura y la solución de Mathy son redacciones propias. La regla es estricta: **nunca se copia el enunciado de un problema con copyright**, ni de una olimpíada, ni de un libro, ni de un sitio. Cuando una idea clásica entra al catálogo, se reescribe desde la estructura (qué está oculto, qué construcción lo revela) y se documenta en el propio archivo que es una redacción original. El banco vive en el repositorio bajo la misma licencia que el resto del contenido, y cada entrada nueva pasa por la revisión de un docente antes de publicarse.

**Minería de estrategias.** Las construcciones válidas sin progreso que se repiten entre muchos jugadores son la fuente principal de dos cosas: caminos alternativos que faltan en `expected_constructions` (si un rodeo lleva a la solución por otro lado, es un camino, no un rodeo) y misconceptions de estrategia nuevas (si muchos marcan la misma igualdad falsa, la marca tiene nombre). El mecanismo es el mismo de [L](../L-modelo-errores/L0-taxonomia.md): agrupar por diff sobre la base de hechos, escribir la señal, asignar patrón y mecánica.

**Reglas para agregar un desafío.** Todo nodo en `requires` existe; toda entrada en `cheatsheet_refs` y en `hidden_data.uses` es una entrada declarada por algún nodo del grafo; toda mecánica está en el catálogo de E; toda misconception de estrategia está definida en el archivo o en L; el `literacy_min` no supera el `literacy` máximo de sus nodos requeridos; los tres ids de pista son los fijos; el locale tiene título, enunciado, exactamente tres pistas y la solución paso a paso; ninguna pista contiene la respuesta (revisión humana). Y cada área fundamental conserva al menos seis desafíos.

## Verificación

Lo que el validador de [C0](../C-knowledge-graph/C0-esquema.md) comprueba sobre este directorio:

- `challenges.yaml` y su locale parsean; los ids tienen formato `ch.<area>.<slug>` y el prefijo coincide con `area`.
- Todo `requires` resuelve a un nodo del grafo (o a un alias, con aviso); todo `cheatsheet_refs` y todo `uses` resuelve a una entrada declarada en algún nodo; toda mecánica existe en E.
- Todo id de `strategy_misconceptions` resuelve al bloque de este archivo o a L; patrón y mecánica de cada uno son compatibles según `explanation_patterns.yaml`.
- El campo `challenges` de cada nodo se deriva de acá y nunca se escribe a mano.
- Al menos seis desafíos por área fundamental y al menos cuatro con `literacy_min: none`.
- Toda clave de locale referenciada existe en `es`; `hints` tiene la misma longitud en todos los locales.
- Este documento no define constantes: los créditos por estado y el mínimo para `mastered` se citan por nombre y viven en [K](../K-evaluacion.md).

## Tabla completa de desafíos

Derivada de [`challenges.yaml`](challenges.yaml). La construcción clave es la primera de `hidden_data`; los caminos completos están en el archivo. Cincuenta y cuatro desafíos: geometría 13 (5 sin leer), álgebra 6, aritmética y teoría de números 6 (1 sin leer), combinatoria 6, probabilidad 6, trigonometría 7, cálculo 7, álgebra lineal 3.

| id | área | tier | nodos requeridos | dato oculto | construcción clave |
|---|---|---|---|---|---|
| `ch.geom.trapezoid_hidden_height` | geom | entrenamiento | `geom.area.trapezoid_as_two_triangles`<br>`geom.tri.pythagoras_as_tiles`<br>`geom.cons.auxiliary_lines` | `height`<br>`segment_bh` | `drop_altitude_from_c` |
| `ch.geom.l_shape_missing_side` | geom | entrenamiento | `geom.area.rect_and_triangle`<br>`geom.area.perimeter_vs_area`<br>`geom.cons.auxiliary_lines` | `inner_vertical_side` | `extend_side_to_bounding_rectangle` |
| `ch.geom.chord_distance_from_center` | geom | regional | `geom.circle.radius_bisects_chord`<br>`geom.tri.pythagoras_as_tiles`<br>`geom.cons.auxiliary_lines` | `half_chord`<br>`distance_center_to_chord` | `drop_perpendicular_from_center` |
| `ch.geom.inscribed_right_angle_area` | geom | regional | `geom.circle.inscribed_half_central`<br>`geom.tri.pythagoras_as_tiles`<br>`geom.area.rect_and_triangle` | `right_angle_at_c`<br>`leg_bc` | `draw_radius_to_c_and_compare_central_angle` |
| `ch.geom.parallel_cut_missing_length` | geom | regional | `geom.sim.similarity_as_scale`<br>`geom.angle.parallel_transversal`<br>`geom.cons.auxiliary_lines` | `equal_angles_at_parallel`<br>`scale_factor` | `mark_corresponding_angles` |
| `ch.geom.altitude_hypotenuse_three_similar` | geom | internacional | `geom.tri.pythagoras_as_tiles`<br>`geom.sim.similarity_as_scale`<br>`geom.cons.hidden_data_hunt` | `hypotenuse`<br>`altitude`<br>`foot_segments` | `apply_pythagoras` |
| `ch.geom.frustum_volume_by_extension` | geom | internacional | `geom.solid.cone_sphere_by_pouring`<br>`geom.sim.similarity_as_scale`<br>`geom.cons.auxiliary_lines` | `apex_height`<br>`small_cone_height` | `extend_slant_sides_to_apex` |
| `ch.geom.reflect_shortest_path_river` | geom | internacional | `geom.trans.rotation_reflection`<br>`geom.tri.inequality_shortest_path`<br>`geom.coord.distance_as_pythagoras` | `touch_point_on_line`<br>`total_length` | `reflect_point_across_line_and_join` |
| `ch.geom.tiles_hidden_corner` | geom (sin leer) | entrenamiento | `geom.area.rect_and_triangle`<br>`arith.mul.rows_and_columns` | `tiles_under_cover` | `extend_row_and_column_lines_under_cover` |
| `ch.geom.tiles_l_shape_split` | geom (sin leer) | entrenamiento | `geom.area.rect_and_triangle`<br>`arith.add.combine_groups` | `tiles_in_covered_arm` | `draw_line_splitting_into_two_rectangles` |
| `ch.geom.tiles_triangle_half_rectangle` | geom (sin leer) | entrenamiento | `geom.area.rect_and_triangle`<br>`geom.area.shear_invariant` | `tiles_inside_triangle` | `complete_rectangle_around_triangle` |
| `ch.geom.tiles_slanted_same_as_straight` | geom (sin leer) | regional | `geom.area.shear_invariant`<br>`geom.area.rect_and_triangle` | `tiles_in_slanted_figure` | `cut_triangle_and_slide_to_other_side` |
| `ch.geom.tiles_hidden_layers_volume` | geom (sin leer) | regional | `geom.solid.volume_as_layers`<br>`geom.area.rect_and_triangle` | `cubes_in_hidden_layers` | `extend_edge_lines_to_count_layers` |
| `ch.alg.hidden_equation_ages` | alg | entrenamiento | `alg.eq.word_to_equation`<br>`alg.eq.variable_both_sides` | `the_equation` | `name_unknown_and_translate_both_moments` |
| `ch.alg.two_receipts_system` | alg | entrenamiento | `alg.sys.two_by_two`<br>`alg.eq.word_to_equation` | `second_equation`<br>`one_unknown_isolated` | `read_second_receipt_as_balance` |
| `ch.alg.rectangle_perimeter_area_quadratic` | alg | regional | `alg.eq.quadratic_roots`<br>`alg.expr.factor_trinomial`<br>`geom.area.rect_and_triangle` | `second_side_in_terms_of_first`<br>`the_quadratic` | `half_perimeter_minus_side` |
| `ch.alg.doublings_until_overflow` | alg | regional | `alg.fn.logarithm`<br>`alg.fn.exponential_growth` | `number_of_turns` | `read_log_as_count_of_scalings` |
| `ch.alg.absolute_value_two_cases` | alg | regional | `alg.abs.distance_two_branches`<br>`alg.eq.multi_step` | `sign_regions` | `mark_where_each_expression_changes_sign` |
| `ch.alg.symmetric_sum_of_squares` | alg | internacional | `alg.expr.binomial_product`<br>`alg.sys.two_by_two` | `identity_linking_sum_product_and_squares` | `lay_square_of_sum_as_four_tiles` |
| `ch.arith.plates_hidden_remainder` | arith (sin leer) | entrenamiento | `arith.div.remainder`<br>`arith.mul.rows_and_columns` | `marbles_under_cover` | `complete_rows_of_equal_plates` |
| `ch.arith.two_clocks_same_position` | arith | entrenamiento | `arith.div.remainder`<br>`arith.num.divisible_or_not`<br>`disc.mod.clock_equivalence` | `first_common_position` | `list_positions_of_each_gear_and_align` |
| `ch.arith.count_rectangles_divisors` | arith | regional | `arith.num.factor_tree`<br>`arith.mul.rows_and_columns` | `prime_factorization`<br>`number_of_divisors` | `build_factor_tree` |
| `ch.arith.hidden_digit_divisibility` | arith | regional | `arith.num.divisible_or_not`<br>`arith.place.base_ten_carry` | `digit_sum_condition`<br>`last_two_digits_condition` | `apply_divisibility_by_nine_shortcut` |
| `ch.arith.fraction_of_the_rest` | arith | regional | `arith.frac.multiply`<br>`arith.frac.common_unit` | `new_whole_after_first_bite`<br>`common_unit` | `shade_remaining_bar_and_regrid` |
| `ch.arith.parity_invariant_coins` | arith | internacional | `arith.num.divisible_or_not`<br>`arith.int.add_signed`<br>`disc.mod.clock_equivalence` | `the_invariant` | `track_count_of_heads_modulo_two_after_each_move` |
| `ch.disc.handshakes_at_the_table` | disc | entrenamiento | `disc.count.choose_as_pascal_paths`<br>`disc.count.product_rule` | `each_pair_counted_once` | `draw_bridges_and_merge_duplicates` |
| `ch.disc.two_clubs_overlap` | disc | regional | `disc.count.sum_rule`<br>`disc.set.union_intersection` | `students_in_both` | `sort_into_overlapping_hoops_and_compare_totals` |
| `ch.disc.grid_paths_avoiding_corner` | disc | regional | `disc.count.choose_as_pascal_paths`<br>`disc.count.sum_rule` | `paths_through_blocked_point` | `split_path_at_blocked_point_and_multiply` |
| `ch.disc.socks_in_the_dark` | disc | regional | `disc.count.sum_rule`<br>`disc.set.membership_rule` | `worst_case_sequence` | `sort_draws_into_color_bins_one_per_bin_first` |
| `ch.disc.domino_board_missing_corners` | disc | internacional | `disc.proof.contradiction_no_exit`<br>`disc.mod.clock_equivalence`<br>`disc.count.sum_rule` | `the_invariant` | `color_board_in_two_colors_and_count_each` |
| `ch.disc.odd_numbers_make_squares` | disc | internacional | `disc.ind.domino_induction`<br>`disc.sum.sigma_notation` | `inductive_step_as_figure` | `add_l_shaped_border_to_square` |
| `ch.prob.two_dice_hidden_grid` | prob | entrenamiento | `prob.basic.sample_space_grid`<br>`prob.basic.probability_as_proportion` | `true_sample_space` | `lay_six_by_six_grid_of_pairs` |
| `ch.prob.at_least_one_by_complement` | prob | entrenamiento | `prob.basic.complement_fills_the_rest`<br>`prob.cond.conditional_and_independence` | `the_easier_event`<br>`product_of_independent_draws` | `flip_to_complement_none_at_all` |
| `ch.prob.shared_month_small_group` | prob | regional | `prob.basic.complement_fills_the_rest`<br>`prob.basic.count_outcomes_by_structure`<br>`prob.cond.conditional_and_independence` | `complement_all_different`<br>`shrinking_choices` | `flip_to_complement` |
| `ch.prob.three_doors_switch` | prob | regional | `prob.cond.bayes_reverses_condition`<br>`prob.cond.conditional_and_independence` | `what_the_host_knows` | `draw_tree_with_host_forced_branch` |
| `ch.prob.test_positive_base_rate` | prob | internacional | `prob.cond.bayes_reverses_condition`<br>`prob.basic.sample_space_grid` | `the_population_row`<br>`reversed_conditional` | `sort_population_by_condition_first` |
| `ch.prob.expected_rolls_until_six` | prob | internacional | `prob.rv.expectation_as_weighted_average`<br>`prob.cond.conditional_and_independence`<br>`disc.rec.recurrence_step` | `self_referential_equation` | `write_expectation_after_first_roll_as_restart` |
| `ch.trig.tower_from_two_angles` | trig | entrenamiento | `trig.ratio.similar_shadows`<br>`trig.fn.tangent_as_slope`<br>`geom.cons.auxiliary_lines` | `distance_to_base` | `drop_altitude_and_write_two_tangents` |
| `ch.trig.unit_circle_hidden_cosine` | trig | entrenamiento | `trig.id.pythagorean_identity`<br>`trig.ang.quadrant_signs` | `horizontal_coordinate`<br>`sign_of_cosine` | `drop_height_from_radius_tip_and_apply_pythagoras` |
| `ch.trig.triangle_area_from_included_angle` | trig | regional | `trig.law.sines_from_altitude`<br>`trig.ratio.similar_shadows`<br>`geom.area.rect_and_triangle` | `height` | `drop_altitude_and_read_sine` |
| `ch.trig.which_law_hidden_side` | trig | regional | `trig.law.cosines_extends_pythagoras`<br>`trig.law.sines_from_altitude` | `which_law_applies`<br>`third_side` | `sort_given_data_into_sas_or_asa` |
| `ch.trig.regular_polygon_area_by_radii` | trig | regional | `trig.circle.radian_as_arc_length`<br>`trig.fn.sine_as_height`<br>`geom.area.rect_and_triangle` | `central_angle`<br>`apothem` | `draw_radii_to_vertices_and_divide_full_turn` |
| `ch.trig.two_slopes_add_to_quarter_turn` | trig | internacional | `trig.id.angle_sum`<br>`trig.inv.arcsin_two_branches`<br>`trig.fn.tangent_as_slope` | `sum_of_the_two_angles` | `rotate_twice_and_read_composed_slope` |
| `ch.trig.all_solutions_on_the_wheel` | trig | internacional | `trig.inv.arcsin_two_branches`<br>`trig.fn.periodic_wraps`<br>`alg.eq.quadratic_roots` | `factored_form`<br>`second_solution_of_each_branch` | `factor_common_sine` |
| `ch.calc.fence_along_the_river` | calc | entrenamiento | `calc1.apply.max_where_slope_zero`<br>`alg.fn.quadratic_and_sqrt`<br>`geom.area.rect_and_triangle` | `constraint_between_sides`<br>`single_variable_objective` | `write_fence_length_as_sum_of_three_sides` |
| `ch.calc.box_from_a_sheet` | calc | regional | `calc1.apply.max_where_slope_zero`<br>`calc1.deriv.rules_as_structure`<br>`geom.solid.volume_as_layers` | `base_dimensions_in_terms_of_cut`<br>`valid_range_of_cut` | `fold_flaps_and_read_base` |
| `ch.calc.sliding_ladder_rates` | calc | regional | `calc1.apply.related_rates_chain`<br>`geom.tri.pythagoras_as_tiles` | `relation_between_positions`<br>`other_leg_at_that_instant` | `draw_right_triangle_wall_floor_ladder` |
| `ch.calc.area_between_hidden_crossings` | calc | entrenamiento | `calc2.int.area_between`<br>`alg.eq.quadratic_roots`<br>`calc1.ftc.integral_undoes_derivative` | `integration_limits`<br>`which_curve_is_on_top` | `solve_where_curves_meet` |
| `ch.calc.washer_with_hidden_hole` | calc | regional | `calc2.parpol.solid_of_revolution`<br>`calc2.int.area_between` | `inner_radius`<br>`limits` | `draw_cross_section_perpendicular_to_axis` |
| `ch.calc.cylinder_inside_a_cone` | calc | internacional | `calc1.apply.max_where_slope_zero`<br>`geom.sim.similarity_as_scale`<br>`geom.solid.volume_as_layers` | `height_in_terms_of_radius` | `draw_axial_cross_section_and_use_similar_triangles` |
| `ch.calc.telescoping_sum_hidden_split` | calc | internacional | `calc2.ser.partial_sums`<br>`calc2.tech.partial_fractions_split`<br>`precalc.lim.approach` | `each_term_as_a_difference`<br>`what_survives_cancellation` | `split_into_partial_fractions` |
| `ch.linalg.matrix_of_a_composed_move` | linalg | entrenamiento | `linalg.map.compose_as_multiply`<br>`linalg.map.linear_transformation_2d` | `where_each_basis_arrow_lands`<br>`order_of_the_two_moves` | `track_basis_arrows_through_both_moves` |
| `ch.linalg.undo_the_unknown_stretch` | linalg | regional | `linalg.map.inverse_and_systems`<br>`linalg.map.determinant_as_area` | `the_matrix`<br>`whether_it_can_be_undone`<br>`original_point` | `read_columns_from_images_of_basis` |
| `ch.linalg.shadow_gives_the_height` | linalg | internacional | `linalg.orth.projection_as_shadow`<br>`linalg.map.determinant_as_area`<br>`geom.tri.pythagoras_as_tiles` | `height_of_parallelogram`<br>`distance_point_to_line` | `project_one_vector_onto_the_other_and_take_the_rest` |

## Qué no vive acá

Este documento no fija cuánto vale un desafío en el compuesto de mastery ni cuántos hacen falta para `mastered`: esas constantes están únicamente en [K](../K-evaluacion.md). No describe el motor sintético más allá de lo que el contenido espera de él: la implementación está en [O](../O-arquitectura-tecnica.md). No define entradas de cheatsheet: las referencia, y viven en los nodos del grafo y en [R0](../R-cheatsheet/R0-cheatsheet.md). Y no contiene enunciados: los enunciados, las pistas y las soluciones narradas viven en el locale ([P](../P-internacionalizacion.md)).
