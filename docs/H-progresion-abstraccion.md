# H. Progresión de abstracción

Este documento define cómo un concepto matemático viaja, dentro de Mathy, desde una situación del mundo real hasta su forma abstracta y su reaparición en otro contexto. Lo citan el catálogo de mecánicas ([E0](E-mecanicas/E0-catalogo.md)), las reglas de analogías ([G0](G-analogias/G0-reglas.md)), el modelo de mastery ([K](K-evaluacion.md)), la taxonomía de errores ([L0](L-modelo-errores/L0-taxonomia.md)) y cada concepto de la espina ([spine.yaml](C-knowledge-graph/spine.yaml)).

Tres ideas sostienen todo lo que sigue:

1. **Ocho capas en orden fijo.** Un nodo puede saltarse capas, nunca reordenarlas. El campo `layers` del schema declara cuáles recorre.
2. **Una gramática visual única.** Toda la matemática del juego se dibuja con doce primitivas. Quien aprendió que "sumar es desplazar" en aritmética vuelve a ver el mismo desplazamiento en vectores, en traslaciones y en la constante de integración.
3. **Ningún símbolo aparece sin motivo.** Cada notación se introduce cuando el jugador ya sintió el problema que la hizo necesaria.

Los umbrales numéricos que deciden cuándo un jugador cambia de capa no viven aquí. Este documento describe la evidencia con los seis verbos del schema (`recognize`, `explain`, `manipulate`, `apply`, `generalize`, `transfer`). Las constantes están únicamente en [K-evaluacion.md](K-evaluacion.md).

---

## 1. Las ocho capas

Cada capa responde a cuatro preguntas: qué ve el jugador, qué hace, qué no se le muestra todavía y qué evidencia indica que puede avanzar. El criterio de salida no es un examen. Es una lectura de las dimensiones de mastery que el selector ([J](J-adaptativo.md)) consulta para decidir qué actividad ofrecer después.

Una regla vale para todas: **avanzar de capa nunca borra las anteriores**. Un jugador en `symbolic` vuelve a `concrete` cuando se equivoca. El patrón `replay_on_mechanic` de [L0](L-modelo-errores/L0-taxonomia.md) consiste en eso: rebobinar la expresión del alumno a la capa donde el error se ve.

### 1.1 `real`: la situación

**Qué ve.** Una escena reconocible sin notación: una fila de personas, una mesa con manzanas, una cuerda que se estira. Está dibujada con el mismo lenguaje visual que usarán después los símbolos ([N](N-ux-ui.md)).

**Qué hace.** Observa y responde a una pregunta que no necesita matemática para entenderse: "¿alcanzan las sillas?", "¿es justo el reparto?". El input es un tap o un arrastre.

**Qué no se le muestra.** Ningún número escrito, ninguna operación, ningún nombre técnico. Tampoco la mecánica: la escena no es manipulable más allá de lo que la pregunta pide.

**Criterio de salida.** Evidencia de `recognize`: el jugador identifica la situación como "una de estas" en variantes distintas y distingue cuándo la pregunta tiene sentido. No se le pide explicar nada.

### 1.2 `intuition`: anticipar sin herramientas

**Qué ve.** La misma escena, pero ahora ocurre algo y el juego se detiene un instante antes del resultado.

**Qué hace.** Predice. Elige entre dos o tres desenlaces dibujados como animaciones cortas, y después ve lo que ocurre de verdad. La predicción es el corazón de esta capa: el jugador compromete una expectativa antes de tener herramientas.

**Qué no se le muestra.** Objetos que se puedan reorganizar libremente. La predicción se elige, no se construye. Tampoco hay corrección verbal: si falla, el juego muestra lo que pasó y vuelve a preguntar con otra variante.

**Criterio de salida.** `recognize` y un primer `explain` no verbal: el jugador predice bien con regularidad y, ante dos animaciones, señala cuál se parece a la situación. Lo que importa es que las fallas dejen de ser sistemáticas.

### 1.3 `concrete`: manipular objetos

**Qué ve.** Los objetos se vuelven agarrables. La mecánica del nodo ([E0](E-mecanicas/E0-catalogo.md)) aparece por primera vez con su piel concreta: la balanza con frutas, el cofre con su llave, la tubería con fichas.

**Qué hace.** Arrastra, agrupa, reparte, abre, equilibra. Cada gesto produce un cambio visible e inmediato. El juego responde al gesto, no a una respuesta escrita.

**Qué no se le muestra.** Nada simbólico. Las cantidades se ven, no se leen. Si aparece un número, es un conteo que el jugador acaba de hacer, mostrado como etiqueta de la pila, nunca como dato inicial.

**Criterio de salida.** `manipulate`: el jugador ejecuta la acción de la mecánica sin demostración previa y llega al estado objetivo en variantes con distinta cantidad de objetos. Y `explain` elegido entre animaciones: cuando se le muestra una manipulación incorrecta (quitar fruta de un solo plato), la señala como distinta de la correcta.

### 1.4 `visual`: el diagrama

**Qué ve.** Los objetos concretos se convierten en formas: barras, bloques, puntos sobre una recta, regiones, flechas. El morph es continuo. Una pila de manzanas se aplana en una barra cuya longitud es la cantidad.

**Qué hace.** Las mismas manipulaciones, ahora sobre el diagrama. Y algo nuevo: compara. Dos barras se ponen una junto a otra; dos caminos sobre la recta se superponen. La comparación es lo que el diagrama permite y el objeto concreto no.

**Qué no se le muestra.** Ninguna fórmula. Las etiquetas son números o iconos, nunca expresiones con operadores. La primitiva del nodo (sección 2) ya está presente, pero sin nombre.

**Criterio de salida.** `manipulate` sobre el diagrama y `apply`: el jugador resuelve situaciones nuevas del mismo tipo con el diagrama como herramienta, sin el objeto concreto. También un `explain` más exigente: reconoce el diagrama correcto de una situación entre varios parecidos.

### 1.5 `symbolic`: la notación

**Qué ve.** Los símbolos aparecen al lado del diagrama, nunca en su lugar. Primero uno solo, el que resuelve un problema que el diagrama volvió incómodo (sección 3). El diagrama queda visible y sincronizado: tocar un símbolo ilumina su parte del diagrama y viceversa.

**Qué hace.** Opera sobre los símbolos con el teclado de fichas: arrastra operaciones, aplica llaves, reordena. Cada acción simbólica produce el cambio correspondiente en el diagrama.

**Qué no se le muestra.** Definiciones, propiedades enunciadas, condiciones de validez. No se dice "propiedad distributiva"; se ve que el rectángulo se parte en dos. No se dice "dominio"; hay entradas que la máquina no acepta.

**Criterio de salida.** `apply` con el diagrama retirado: el jugador resuelve sobre los símbolos solos y puede pedir el diagrama como ayuda, pero llega sin él. `explain`: ante una manipulación simbólica incorrecta, la identifica y elige la animación que muestra por qué falla. Una misconception activa de [L0](L-modelo-errores/L0-taxonomia.md) impide salir de esta capa hasta que se remedia.

### 1.6 `formal`: definiciones y condiciones

**Qué ve.** Por primera vez, texto que enuncia: una definición corta, una propiedad, una condición de validez. Va con voz y con el objeto visual al lado (sección 8). Nunca ocupa la pantalla entera.

**Qué hace.** Verifica. Decide si casos cumplen la definición; decide si una propiedad se sostiene; observa qué se rompe en un caso límite (dividir por cero, raíz de un negativo, matriz sin inversa). Empieza a producir argumentos: arma la cadena de pasos que justifica un resultado.

**Qué no se le muestra.** Todavía no se retira la analogía ni el diagrama. Tampoco se muestra el concepto en otras áreas: eso es `transfer`.

**Criterio de salida.** `explain` en su forma más fuerte: distingue casos válidos de inválidos y justifica con la definición, no con el ejemplo. `generalize`: reconoce que la propiedad vale para toda una familia de casos. El error que bloquea la salida es el de categoría `invalid_property` de [L0](L-modelo-errores/L0-taxonomia.md): aplicar una propiedad fuera de su condición.

### 1.7 `abstract`: solo propiedades

**Qué ve.** El objeto sin su piel. No hay frutas ni cofres; hay elementos, operaciones y propiedades. El diagrama, si queda, es estructural: un grafo de relaciones, una tabla de composición.

**Qué hace.** Razona con las propiedades como únicas herramientas. Deduce consecuencias, construye contraejemplos, reconoce que dos objetos con distinta apariencia tienen la misma estructura.

**Qué no se le muestra.** La analogía. Es la capa en que el schema espera que desaparezca (sección 7). Los nodos `adv.*` pueden declarar `layers` que empiezan en `symbolic` porque no tienen una capa `real` honesta.

**Criterio de salida.** `generalize`: el jugador elige o enuncia la versión general y la aplica a un objeto que nunca vio dibujado. Muchos nodos no tienen esta capa, y `layers` la acota.

### 1.8 `transfer`: el mismo concepto en otro lugar

**Qué ve.** Una mecánica ajena, de otra área, en la que el concepto reaparece sin anunciarse. La llave que abría cofres aparece como función inversa, luego como integral que deshace la derivada, luego como matriz inversa.

**Qué hace.** Reconoce el concepto y lo usa en la mecánica nueva. El campo `transfer_to` lista los nodos donde esto se evalúa.

**Qué no se le muestra.** Ninguna pista de que es el mismo concepto. La transferencia se mide porque el jugador la hace solo.

**Criterio de salida.** `transfer`: uso correcto en al menos una mecánica y un área distintas de las de origen. La dimensión Transfer de [K](K-evaluacion.md) es la única que no decae, porque una transferencia lograda es la prueba más sólida de comprensión que el juego recoge.

---

## 2. La gramática visual unificada

Mathy dibuja toda la matemática con una sola idea: **matemática es transformación, estructura e invariantes**. Cada concepto se muestra como algo que transforma, algo que se organiza o algo que no cambia mientras lo demás cambia. Las doce primitivas del schema son el vocabulario de esa idea; cada nodo declara una como dominante en `grammar`.

El valor de una gramática única está en la repetición. El jugador no aprende doce representaciones por área; aprende doce una sola vez y las reconoce en todas partes. Esa es la intuición unificada que el juego construye.

### `displace`: sumar es desplazar

**Canónica.** Un objeto que se mueve a lo largo de una recta. Sumar 3 es avanzar 3 pasos; sumar un negativo es avanzar hacia el otro lado. El resultado es una posición.

**Reaparece en.** La recta numérica (`found.count.number_line`), los negativos (`arith.int.negatives`), los vectores (`linalg.vec.vector_as_displacement`), las traslaciones en geometría, la constante de integración como desplazamiento vertical de la familia de primitivas.

### `scale`: multiplicar es escalar

**Canónica.** Un objeto que se estira o encoge manteniendo su forma. Multiplicar por 3 triplica la longitud; por 1/2 la reduce a la mitad. El factor es una razón entre el antes y el después.

**Reaparece en.** La multiplicación (`arith.mul.scaling`), las fracciones como razón (`arith.frac.parts_and_ratio`), la pendiente (`alg.fn.linear_slope`), el producto por escalar (`linalg.vec.span_and_combination`), la semejanza, la esperanza como promedio ponderado (`prob.rv.expectation_as_weighted_average`).

### `nonlinear`: potenciar es transformar sin conservar proporciones

**Canónica.** Una recta que se curva. Elevar al cuadrado convierte puntos equiespaciados en una fila donde las distancias crecen; la exponencial convierte pasos iguales en saltos cada vez mayores. Se ve que "el doble de entrada" ya no da "el doble de salida".

**Reaparece en.** El cuadrado y la raíz (`alg.fn.quadratic_and_sqrt`), el crecimiento exponencial (`alg.fn.exponential_growth`), las funciones trigonométricas como proyección de un giro, los mapas complejos, la curvatura en multivariable.

### `compose`: componer es encadenar

**Canónica.** Dos máquinas conectadas por una tubería. La salida de una entra en la otra. Cambiar el orden cambia lo que sale, y se ve.

**Reaparece en.** La composición (`alg.fn.composition`), las ecuaciones de varios pasos (`alg.eq.multi_step`), la regla de la cadena como engranajes (`calc1.deriv.rules_as_structure`), el producto de matrices, los eventos sucesivos en probabilidad, los caminos en un grafo.

### `invert`: la inversa es la transformación que vuelve

**Canónica.** Una llave. Una transformación tiene inversa o no la tiene; cuando la tiene, la animación se reproduce hacia atrás y el objeto vuelve a su estado inicial.

**Reaparece en.** Restar deshace sumar (`arith.sub.undo_add`), dividir deshace multiplicar (`arith.div.undo_mul`), la operación como llave (`prealg.inv.operation_as_key`), la función inversa (`alg.fn.inverse_function`), el logaritmo (`alg.fn.logarithm`), el teorema fundamental (`calc1.ftc.integral_undoes_derivative`), la matriz inversa (`linalg.map.inverse_and_systems`). Es la primitiva con más regresos en la espina; por eso [E0](E-mecanicas/E0-catalogo.md) la trata como teoría propia: "funciones como llaves".

### `rate`: derivar es medir cuán rápido cambia

**Canónica.** Un caminante sobre una curva con una flecha que indica cuán empinado está el terreno. La tasa es la pendiente de la tangente y la velocidad del caminante, y las dos coinciden.

**Reaparece en.** La pendiente (`alg.fn.linear_slope`), la derivada (`calc1.deriv.rate_as_slope_limit`), el gradiente, la velocidad y la aceleración, la tasa de crecimiento de una población.

### `accumulate`: integrar es acumular

**Canónica.** Un recipiente que se llena. Cada instante aporta una franja; la altura del líquido es la suma de todas hasta ese momento. Área bajo la curva y nivel del tanque coinciden.

**Reaparece en.** La suma repetida (`arith.mul.scaling`, capa concreta), la integral (`calc1.int.accumulation`), las sumas con sigma, la distribución acumulada, el trabajo como fuerza acumulada.

### `deform`: una transformación lineal deforma el espacio

**Canónica.** Una cuadrícula que se estira, gira o aplasta entera. Las líneas siguen rectas y paralelas, el origen no se mueve. La matriz dice dónde van a parar los vectores de la base.

**Reaparece en.** La transformación lineal (`linalg.map.linear_transformation_2d`), el determinante como factor de área, los sistemas como buscar qué punto fue a parar a un lugar, las rotaciones y reflexiones, el cambio de variable en integrales, los autovectores como direcciones que no giran.

### `partition`: contar, medir y clasificar es partir

**Canónica.** Un conjunto que se divide en pedazos sin solapamiento y sin dejar nada afuera. La cardinalidad es cuántos pedazos; la fracción, qué parte del todo; la medida, cuánto ocupa cada uno.

**Reaparece en.** La cardinalidad (`found.count.cardinality`), las fracciones (`arith.frac.parts_and_ratio`), las particiones de un intervalo para la integral, la probabilidad como proporción (`prob.basic.probability_as_proportion`), las clases de equivalencia modulares, los componentes de un grafo.

### `relate`: relacionar es conectar

**Canónica.** Puntos y flechas. Una relación es un conjunto de conexiones; una función es una relación donde de cada punto sale exactamente una flecha. Los grafos son esta primitiva sin piel adicional.

**Reaparece en.** La función como máquina (`alg.fn.function_as_machine`, capa visual), los grafos (`graph.basic.graph_and_paths`), las relaciones de orden y equivalencia, la dependencia condicional, las matrices de adyacencia, el propio mapa del juego.

### `invariant`: demostrar es encontrar lo que no cambia

**Canónica.** Dos estados distintos con algo iluminado que es idéntico en ambos. La balanza que sigue equilibrada tras quitar lo mismo de los dos platos es el primer invariante que el jugador ve.

**Reaparece en.** La ecuación como balanza (`prealg.eq.balance`), las identidades algebraicas, Pitágoras como conservación de área, los invariantes de un grafo, la inducción, las simetrías de un grupo.

### `random`: probabilidad es proporción bajo azar

**Canónica.** Una urna o un dado que se repite muchas veces y una barra que se estabiliza. La probabilidad es la proporción a la que tiende una frecuencia, y la fracción del área de un blanco.

**Reaparece en.** La probabilidad como proporción (`prob.basic.probability_as_proportion`), la condicional como restringir el blanco (`prob.cond.conditional_and_independence`), la esperanza, las simulaciones, los algoritmos aleatorizados.

### Cómo se combinan

Casi ningún concepto usa una sola primitiva. Una ecuación de dos pasos es `compose` de dos transformaciones, `invert` para deshacerlas e `invariant` para justificar que se deshacen a los dos lados. La derivada de una exponencial es `rate` aplicado a `nonlinear`. El campo `grammar` guarda la dominante, la que el minijuego pone en el centro de la pantalla. Las demás aparecen como soporte y se documentan en el archivo D1 del nodo.

---

## 3. La regla de oro: ningún símbolo sin historia

Un símbolo es una herramienta que alguien inventó porque un problema se había vuelto incómodo de resolver sin él. Mathy respeta ese orden. Antes de mostrar un símbolo, el jugador debe haber sentido la incomodidad: contar manzanas de a una hasta que es tedioso, describir "la cantidad que no sabemos" con gestos hasta que un nombre corto es un alivio, escribir "sumar muchas veces lo mismo" hasta que una notación compacta es evidente.

La pregunta que todo diseñador de nodo debe responder es: **¿qué problema necesitábamos resolver que hizo necesario inventar este símbolo?** Sin respuesta, el símbolo no puede aparecer en ese nodo. Dos consecuencias: los símbolos aparecen tarde, en la capa `symbolic` de su nodo y nunca antes; y aparecen de a uno, nunca tres nuevos en la misma expresión.

La tabla registra la historia de los símbolos principales. La columna de nodo usa ids de [spine.yaml](C-knowledge-graph/spine.yaml) cuando el símbolo se introduce en la espina, y un id no-espina con la convención `area.cluster.slug` en caso contrario.

| Símbolo | Problema que lo hizo necesario | Capa | Objeto concreto del que surge | Nodo donde se introduce |
|---|---|---|---|---|
| Números (1, 2, 3, …) | Comparar dos pilas sin poner los objetos uno frente a otro | `visual` | Pila de objetos, después una barra con marcas | `found.count.cardinality` |
| 0 | Decir que una posición no se movió, o que un plato quedó vacío, sin dejar un hueco | `visual` | Plato vacío de la balanza; punto de partida en la recta | `found.count.zero_as_empty` |
| Negativos (−3) | Describir un desplazamiento hacia el lado opuesto sin cambiar la operación | `visual` | Pasos hacia la izquierda en la recta; deuda en un ledger | `arith.int.negatives` |
| Fracción (a/b) | Nombrar un pedazo de un reparto que no es exacto | `visual` | Una barra partida en b partes, de las que se toman a | `arith.frac.parts_and_ratio` |
| = | Registrar que dos platos están equilibrados sin dibujar la balanza cada vez | `symbolic` | La balanza equilibrada | `prealg.eq.balance` |
| x (incógnita) | Referirse a una cantidad desconocida sin describirla con una frase | `symbolic` | La caja cerrada con contenido desconocido | `prealg.var.unknown_as_box` |
| Paréntesis | Indicar qué operación ocurre primero cuando leer de izquierda a derecha da otro resultado | `symbolic` | Un cofre dentro de otro; la caja que envuelve una rama del árbol | `arith.expr.precedence_tree` |
| Exponente (aⁿ) | Escribir "escalar n veces por el mismo factor" sin repetir el factor | `symbolic` | Una barra que se triplica, y otra vez, y otra vez | `arith.pow.repeated_scaling` |
| √ | Recuperar el lado de un cuadrado del que solo se conoce el área | `symbolic` | Una baldosa cuadrada de área conocida | `alg.fn.quadratic_and_sqrt` |
| f(x) | Nombrar una máquina para hablar de ella sin describir su interior | `symbolic` | La máquina con tubería de entrada y de salida | `alg.fn.function_as_machine` |
| f∘g | Decir "primero g, después f" como una sola máquina | `symbolic` | Dos máquinas conectadas por una tubería | `alg.fn.composition` |
| f⁻¹ | Nombrar la máquina que devuelve la salida a la entrada | `symbolic` | La llave que abre lo que f cerró | `alg.fn.inverse_function` |
| Coordenadas (x, y) | Ubicar un punto con dos números en lugar de señalarlo | `visual` | Una grilla con dos reglas perpendiculares | `alg.fn.graph_as_picture` |
| Pendiente m | Describir cuán empinada es una recta con un solo número | `symbolic` | El caminante que sube m por cada paso horizontal | `alg.fn.linear_slope` |
| eˣ | Encontrar la base cuyo crecimiento por unidad de tiempo es igual a lo que ya hay | `formal` | Un tanque que se llena a velocidad proporcional a su nivel | `precalc.exp.natural_base` |
| log, ln | Responder "cuántas veces se escaló" cuando se conoce el resultado y el factor | `symbolic` | La llave que abre el cofre de la exponencial | `alg.fn.logarithm` |
| lim | Hablar del valor al que se acerca algo cuando el valor exacto no se alcanza | `symbolic` | Un caminante que se aproxima a una pared sin tocarla | `precalc.lim.approach` |
| Δ | Nombrar "cuánto cambió" sin escribir la resta cada vez | `symbolic` | El tramo horizontal y el vertical del paso del caminante | `alg.fn.linear_slope` |
| f'(x), dy/dx | Escribir la pendiente exacta en un punto de una curva; dos notaciones, una compacta y otra que muestra su origen como cociente | `symbolic` | La tangente al camino; la razón Δy/Δx cuando Δx se encoge | `calc1.deriv.rate_as_slope_limit` |
| Σ | Escribir una suma de muchos términos con patrón sin escribirlos todos | `symbolic` | Una fila de barras de altura creciente apiladas | `precalc.seq.sum_as_pattern` |
| ∫ | Escribir la acumulación de infinitas franjas cada vez más finas | `symbolic` | El tanque que se llena; los rectángulos bajo la curva | `calc1.int.accumulation` |
| Vector (flecha) | Describir un desplazamiento que tiene dirección, no solo tamaño | `visual` | Una flecha en la grilla | `linalg.vec.vector_as_displacement` |
| Matriz A | Escribir una deformación del espacio anotando solo dónde van los vectores de la base | `symbolic` | La grilla deformada con las dos flechas de base resaltadas | `linalg.map.linear_transformation_2d` |
| A⁻¹ | Nombrar la deformación que devuelve la grilla a su estado original | `symbolic` | La deformación reproducida al revés | `linalg.map.inverse_and_systems` |
| det | Medir cuánto cambió el área de la grilla, y cuándo se aplastó a cero | `visual` | El paralelogramo en que se convierte el cuadrado unidad | `linalg.map.determinant_as_area_factor` |
| ∇ | Indicar en qué dirección sube más rápido una superficie | `visual` | Una flecha sobre un terreno con curvas de nivel | `mvcalc.deriv.gradient_as_steepest_ascent` |
| P(A) | Escribir qué fracción del blanco corresponde a un resultado | `symbolic` | La urna con bolas de colores; el blanco con regiones | `prob.basic.probability_as_proportion` |
| P(A\|B) | Escribir la fracción cuando solo se mira una parte del blanco | `symbolic` | El blanco recortado a la región B | `prob.cond.conditional_and_independence` |
| E[X] | Resumir un juego de azar con un número que diga cuánto se gana en promedio | `symbolic` | Un ledger de resultados con sus frecuencias | `prob.rv.expectation_as_weighted_average` |
| Grafo (nodos y aristas) | Representar quién está conectado con quién sin dibujar el mapa real | `visual` | Ciudades y rutas; personas y amistades | `graph.basic.graph_and_paths` |
| ∀, ∃ | Afirmar algo sobre todos los casos, o sobre al menos uno, sin enumerarlos | `formal` | Una fila de objetos que se recorre buscando uno que falle o uno que cumpla | `disc.logic.quantifiers_as_search` |
| ≡ (mod n) | Decir que dos números caen en la misma posición de un reloj de n horas | `symbolic` | Un reloj circular; una fila que se enrolla | `disc.mod.clock_equivalence` |

Dos observaciones. Varios símbolos se introducen en `visual`, no en `symbolic`: son los que nombran un objeto (un número, una flecha, un punto) más que una operación; un número junto a una barra es una etiqueta, no notación en sentido fuerte. Y `eˣ` y los cuantificadores se introducen en `formal` porque su motivación no es visual sino de definición: no hay una imagen que haga necesario a `e`, hay una propiedad que lo caracteriza.

---

## 4. Ejemplo A: ecuaciones como cofres

Este ejemplo desarrolla el nodo 13 de la espina (`alg.eq.one_step`) y sus vecinos en los diez niveles que el master prompt pide. Es el ejemplo de calibración del template de 14 pasos y del primer minijuego completo. Cada nivel indica su capa.

**Nivel 1. Cofre amarillo, llave amarilla.** `concrete`. Un cofre 📦 cerrado y varias llaves 🔑 de colores. Solo la amarilla abre el cofre amarillo. El jugador arrastra llaves hasta que una funciona. No hay ningún símbolo. Lo que se aprende: hay una correspondencia entre lo que cierra y lo que abre, y probar es gratis.

**Nivel 2. Los colores son transformaciones.** `concrete` hacia `visual`. Cada color de cofre tiene una acción visible: el azul desplaza tres lugares lo que entra; el rojo lo triplica. Las llaves tienen el efecto contrario: la azul desplaza tres hacia atrás; la roja parte en tres. El jugador ve la acción del cofre, luego la de la llave, y ve que el objeto vuelve a donde estaba. Conecta con `prealg.inv.operation_as_key`.

**Nivel 3. Cofres anidados.** `visual`. Un cofre dentro de otro. Para llegar al contenido hay que abrir primero el de afuera. El jugador descubre que el orden importa: la llave del interior no sirve mientras el exterior esté cerrado. Es `arith.expr.precedence_tree` dibujado como cajas, y prepara `alg.eq.multi_step`.

**Nivel 4. Mezcla con símbolos.** `symbolic`, primera mitad. Junto al cofre aparece por primera vez una expresión: `(x + 2) / 5 = 6`. Las llaves tienen etiqueta: `×5` y `−2`. El cofre sigue en pantalla y responde a las llaves; la expresión se transforma en sincronía. Arrastrar `×5` al cofre exterior lo abre y la expresión pasa a `x + 2 = 30`. Dos vistas del mismo objeto.

**Nivel 5. Desaparecen los cofres.** `symbolic`, segunda mitad. La expresión queda sola. Las llaves siguen siendo fichas con etiqueta. El cofre puede pedirse tocando la expresión, y aparece como un fantasma que se desvanece al soltar.

**Nivel 6. Elegir la operación sin ayuda.** `symbolic`, evidencia de `apply`. El teclado de fichas muestra todas las llaves, incluidas las incorrectas. Elegir `−5` cuando correspondía `×5` produce una expresión válida que no avanza, y el juego lo muestra: la expresión se complica en lugar de simplificarse. Aquí viven las misconceptions `wrong_inverse` y `sign` de [L0](L-modelo-errores/L0-taxonomia.md), y el patrón `key_mismatch` reproduce la llave equivocada sobre el cofre fantasma.

**Nivel 7. Escribir la operación.** `symbolic` hacia `formal`. El teclado deja de ofrecer llaves prearmadas. El jugador construye la llave con fichas: elige el operador y el número. Sigue siendo un teclado de fichas, no de texto ([Q](Q-edad-universal.md)); el juego valida la llave construida antes de aplicarla. El teclado de texto libre no aparece en ningún nivel de este ejemplo.

**Nivel 8. Ecuaciones nuevas.** `formal`. Formas que no siguen "un cofre, una llave": incógnita a los dos lados, paréntesis que hay que distribuir, coeficientes fraccionarios. El jugador decide qué transformación conviene primero, y aparece la primera definición corta: "una ecuación es una balanza; una solución es lo que la mantiene equilibrada". Conecta con `alg.eq.multi_step` y `alg.expr.distributive_tiles`.

**Nivel 9. Cuadráticas, radicales, exponenciales y logaritmos.** `formal` y `transfer`. La llave del cuadrado abre dos cofres a la vez (`alg.fn.quadratic_and_sqrt`); la llave de la exponencial es el logaritmo (`alg.fn.logarithm`); la llave de la raíz es elevar al cuadrado, pero hay que verificar que lo que salió del cofre tenía sentido (soluciones extrañas). El jugador reconoce que las llaves son funciones inversas (`alg.fn.inverse_function`).

**Nivel 10. Álgebra abstracta.** `abstract`. No hay cofres ni expresiones numéricas. Hay un conjunto de acciones y la pregunta de cuáles tienen inversa, si el orden importa y qué acción "no hace nada". El jugador descubre que estuvo trabajando con un grupo desde el nivel 2. El nodo es `adv.alg.group_as_reversible_actions`, y la única representación es un diagrama de acciones y sus composiciones.

El recorrido muestra la forma general de toda progresión en Mathy: la mecánica (`chest_key`) nace concreta, se le pega la notación al lado, la notación se queda sola, la mecánica pasa a ser ayuda a demanda, y al final la estructura que la mecánica encarnaba se enuncia sin ella.

---

## 5. Ejemplo B: sistemas con frutas

El segundo ejemplo va de `alg.sys.two_by_two` (nodo 16) a `linalg.map.inverse_and_systems` (nodo 33). La mecánica es `ledger`: un libro de cuentas con filas que registran combinaciones de objetos y su total.

**Etapa 1. 🍎 + 🍎 + 🍎 = 30.** `concrete`. Tres manzanas en una fila y un total. El jugador arrastra el total hasta repartirlo entre las manzanas y descubre que cada una vale 10. No hay incógnita escrita: la manzana es la incógnita, y el juego no lo dice.

**Etapa 2. 🍎 + 🍌 = 14, 🍎 − 🍌 = 4.** `concrete` hacia `visual`. Dos filas comparten frutas. El jugador prueba valores arrastrando fichas numéricas bajo cada fruta y ve las dos filas responder a la vez. Aprende que una fila sola no alcanza y que las dos juntas sí. La resta usa `arith.int.negatives`.

**Etapa 3. 🍎 + 🍌 = 14 se vuelve x + y = 14.** `symbolic`. Ocurre el morph de la sección 6: la manzana se transforma en `x` sin desaparecer de golpe. El ledger sigue igual, con las mismas filas y totales. El jugador opera sobre las filas: sumar dos filas elimina una incógnita, y lo ve porque `+y` y `−y` se cancelan visiblemente. Es `alg.sys.two_by_two` completo.

**Etapa 4. Ax = b.** `symbolic` avanzado, ya en `linalg.map.linear_transformation_2d`. Las filas se compactan en una tabla de coeficientes llamada `A`. Los totales se apilan en `b`; las incógnitas, en `x`. Nada nuevo se calcula; solo se reordena lo que ya estaba escrito. El jugador ve que `A` es la parte que no cambia si cambian los totales.

**Etapa 5. A⁻¹b.** `symbolic` hacia `formal`, en `linalg.map.inverse_and_systems`. La pregunta cambia: de "qué valores cumplen las dos filas" a "qué deformación devuelve `b` a `x`". La llave regresa por cuarta vez. La inversa es la grilla reproducida al revés. Y aparece la condición de validez: hay tablas sin inversa, y se ven como grillas aplastadas a una línea.

**Etapa 6. Transformaciones lineales en general.** `formal` y `abstract`. Los sistemas ya no se resuelven; se interpretan. Resolver es preguntar qué punto fue a parar a `b`; no tener solución es que `b` cayó fuera de la imagen; tener infinitas es que la grilla se aplastó. El ledger no vuelve a aparecer.

**Dónde desaparece la fruta y por qué.** La fruta desaparece en la etapa 3 y no vuelve. En las etapas 1 y 2 cumple la función de la incógnita sin la carga de un símbolo: el jugador se pregunta "cuánto vale la manzana" con toda naturalidad. Desde la etapa 3, lo que el jugador tiene que ver es la estructura de las filas, y la fruta compite con esa estructura. Si la manzana siguiera en la etapa 4, la tabla de coeficientes tendría dibujos en lugar de números, y el jugador buscaría en los dibujos un significado que ya no tienen. **La fruta no debe convertirse en un gimmick.** Es un puente, y un puente que se deja puesto después de cruzar se vuelve obstáculo. Las reglas generales están en la sección 7 y en [G0](G-analogias/G0-reglas.md).

Nótese la diferencia con los cofres, que se quedan hasta el nivel 9 como ayuda a demanda. El cofre representa la operación, algo que sigue existiendo en la notación como estructura; la fruta representa la incógnita, algo que la notación reemplaza por completo con `x`. Lo que representa estructura puede quedarse; lo que representa un nombre debe ceder su lugar al nombre.

---

## 6. El principio del morph: 🍎 + 🍎 se vuelve x + x se vuelve 2x

La transición de objeto concreto a símbolo no es un cambio de pantalla. Es una transformación continua del mismo objeto. Tiene una implementación precisa ([O](O-arquitectura-tecnica.md)): cada expresión en pantalla es un árbol con ids estables por nodo, y una animación entre dos expresiones es una correspondencia entre ids, no un reemplazo de imágenes. La manzana de la izquierda tiene un id; cuando se vuelve `x`, conserva ese id; cuando las dos `x` se funden en `2x`, el `2` hereda la identidad de una y la `x` la de la otra. El jugador ve una cosa que se transforma, nunca dos cosas que se alternan.

El principio se aplica de forma distinta en cada frontera entre capas:

- **`real` a `intuition`.** No hay morph de objetos porque el objeto no cambia. La continuidad es de escena: el mismo lugar, los mismos objetos, una pausa nueva.
- **`intuition` a `concrete`.** Los objetos que el jugador solo miraba se vuelven agarrables. El morph es de comportamiento: el mismo dibujo con una señal sutil de que responde al dedo.
- **`concrete` a `visual`.** El morph más importante para niveles bajos. La pila de manzanas se aplana en una barra; la balanza con platos se estiliza en dos columnas con un signo entre ellas. El requisito de [N](N-ux-ui.md) de que frutas y cofres estén dibujados con el mismo lenguaje que los símbolos existe para que este morph sea posible.
- **`visual` a `symbolic`.** Una barra de longitud 3 se contrae hasta ser el número `3`; "poner una barra a continuación de otra" se contrae hasta ser `+`. El diagrama no desaparece: se desplaza a un costado y queda sincronizado, compartiendo ids con los símbolos.
- **`symbolic` a `formal`.** No hay morph de objeto. La expresión con la que el jugador trabajó sigue en pantalla mientras lee la definición. La continuidad es de presencia.
- **`formal` a `abstract`.** El morph inverso: la piel se retira y el objeto simbólico se vuelve un diagrama estructural. Es el único morph que se diseña como ruptura visible, porque su propósito es que se note que ya no hay manzanas.
- **`abstract` a `transfer`.** No hay morph, porque el jugador está en otra mecánica y otra área. La continuidad es la que él reconoce solo.

Consecuencia de diseño: **el mismo objeto no puede tener dos apariencias sin un morph entre ellas.** Si un minijuego muestra la incógnita como caja en una pantalla y como `x` en la siguiente, hay un error de diseño. La caja tiene que convertirse en `x` delante del jugador, aunque sea una sola vez y aunque sea rápido.

---

## 7. Cuándo se elimina la analogía

Una analogía es un préstamo de estructura: el cofre presta a la ecuación la idea de que hay algo cerrado y algo que lo abre. El préstamo vale mientras la estructura del concepto quepa en la de la analogía, y deja de valer en tres situaciones. Las reglas de detalle están en [G0](G-analogias/G0-reglas.md); aquí se fijan los criterios que las capas hacen operativos.

**Criterio 1: la analogía es muleta en vez de puente.** La señal es que el jugador no puede operar en `symbolic` sin pedir el objeto concreto cada vez. Un puente se cruza y se deja atrás; una muleta se lleva siempre. Cuando la evidencia de `apply` sobre los símbolos solos no aparece, aunque `manipulate` sobre el objeto sea sólido, el juego no retira la analogía de golpe: reduce su presencia. El objeto pasa de estar siempre visible a aparecer a demanda, y de ahí a aparecer solo tras un error. Las etapas de ese desvanecimiento se describen por mecánica en [E0](E-mecanicas/E0-catalogo.md).

**Criterio 2: la estructura del concepto excede la de la analogía.** Todo objeto concreto tiene límites. El cofre representa bien una operación con inversa única y mal una con dos ramas: `x² = 9` abre dos cofres y la imagen se fuerza. La balanza representa bien la igualdad y mal la desigualdad. Las frutas representan bien una incógnita y mal un vector de incógnitas. Cuando un nodo necesita una estructura que su analogía no tiene, el diseñador cambia de analogía (con un morph que muestre qué se conserva) o la retira. Nunca la estira. El test de preservación de estructura de [G0](G-analogias/G0-reglas.md) decide.

**Criterio 3: el nodo está en `abstract`.** Por definición de la capa, aquí no hay analogía. Un nodo cuyo `layers` incluye `abstract` declara que en algún punto de su recorrido la analogía se retira por completo.

**Cómo el schema lo hace explícito.** El campo `layers` de [node.schema.yaml](C-knowledge-graph/schema/node.schema.yaml) vale "todas" por defecto; declararlo es acotar. Un nodo de `found.*` con `layers: [real, intuition, concrete, visual]` dice que nunca llega a símbolos, correcto para la cardinalidad. Un nodo de `adv.*` con `layers: [symbolic, formal, abstract, transfer]` dice que no tiene una situación real honesta ni un objeto concreto que preserve su estructura, y que la decisión es deliberada. El validador exige `analogy` cuando `layers` incluye `real` o `concrete`, y con eso obliga a que toda presencia de analogía sea nombrada y toda ausencia sea declarada. No hay analogías implícitas ni ausencias por descuido.

Esto protege contra un error frecuente en productos educativos: mantener la piel concreta más allá de su utilidad porque es simpática. La regla de Mathy es la contraria. La piel se retira en cuanto el criterio 1 o el 2 se cumple, y el retiro se anima como un morph para que el jugador vea qué se conserva. Lo que queda es más limpio, no más pobre.

---

## 8. Edad universal: las mismas capas sin leer

Mathy es jugable desde los cinco o seis años y no tiene modo infantil. Un niño y un adulto recorren el mismo grafo con las mismas mecánicas; lo que cambia es la modalidad de presentación e input. Los detalles están en [Q-edad-universal.md](Q-edad-universal.md); aquí se explica cómo afecta a las capas.

**Niveles 0 a 2 sin lectura.** Las capas `real`, `intuition`, `concrete` y `visual` no requieren leer en ningún nodo, y en los niveles 0 a 2 tampoco lo requiere `symbolic`. Las instrucciones se dan por demostración: el juego ejecuta el gesto una vez, el jugador lo imita. Los íconos son consistentes en todo el juego: la llave siempre es la misma llave. La narración por voz es opcional y depende del locale ([P](P-internacionalizacion.md)). El campo `literacy` declara cuánto hay que leer, y el validador exige `none` en nivel 0.

Esto precisa los criterios de salida: **la evidencia de `explain` en niveles bajos se recoge eligiendo entre animaciones, nunca entre frases.** Cuando la sección 1 dice que el jugador "señala cuál manipulación es la incorrecta", en un perfil sin lectura eso es literal: ve dos animaciones cortas y toca una. La dimensión Understanding de [K](K-evaluacion.md) se alimenta igual; solo cambia el formato del ítem.

**Los símbolos sin leer.** Un niño que no lee puede llegar a `symbolic` en aritmética, porque `+`, `=` y los dígitos no son texto: son íconos con una historia que el jugador vio. El teclado de fichas hace que operar con ellos sea arrastrar, no escribir. La `x` es un ícono más, que el jugador vio nacer de una caja. Los nodos `found.lit.*` modelan la lectura como prerequisito explícito para que el grafo sepa cuándo un nodo necesita leer de verdad; el diagnóstico los salta en adultos.

**`formal` con texto corto, voz y objeto al lado.** Es la primera capa que necesita texto, y el diseño es estricto. Una definición ocupa una frase corta, siempre con voz, siempre con el objeto visual al lado. No hay muro de lectura: nunca una pantalla de texto que haya que leer antes de poder hacer algo. La definición aparece cuando el jugador ya manipuló el objeto, y lo que hace después es verificar casos sobre ese mismo objeto, no responder preguntas sobre el texto. El validador prohíbe `literacy: full_text` antes del nivel 3, así que `formal` en niveles bajos es `short_text` con voz obligatoria.

**`abstract` y `transfer` en jugadores jóvenes.** Un niño llega más tarde que un adulto, y eso es esperado. El camino existe y no requiere nada externo al juego. El juego nunca cierra una capa por edad: el único bloqueo es de prerequisitos, y la lectura es uno de ellos, modelado como cualquier otro.

**Ritmo.** Las capas `real` e `intuition` son cortas por diseño, y en perfiles sin lectura pueden ocupar toda una sesión. El selector de [J](J-adaptativo.md) usa sesiones más breves para estos perfiles y cierra con juego libre cuando detecta fatiga. Speed se mide desde el principio pero no se muestra como cuenta regresiva en niveles bajos.

La idea de fondo es que las ocho capas no son ocho niveles de dificultad de lectura. Son ocho formas de relacionarse con un objeto matemático, y las primeras cinco pueden recorrerse completas con las manos y los ojos. Quien llega a `formal` sin haber leído nada tiene, por construcción, una intuición completa del objeto sobre el que va a leer. Ese es el orden que Mathy defiende para cualquier edad.
