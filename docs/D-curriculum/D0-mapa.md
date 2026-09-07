# D0 — Mapa del curriculum

El curriculum de Mathy va de la intuición matemática de un niño de cinco años hasta matemática universitaria avanzada. No es una lista de temas: es un grafo de ideas con prerequisitos, y este documento es su mapa. Los nodos están en [`../C-knowledge-graph/graph/`](../C-knowledge-graph/graph/); la espina dorsal, en [`../C-knowledge-graph/spine.yaml`](../C-knowledge-graph/spine.yaml); el desarrollo a fondo de cada concepto de la espina, en [`D1-espina/`](D1-espina/).

## Niveles

Los niveles son orientativos. Sirven para el diagnóstico, para el orden de escritura y para estimar la duración de un recorrido. Lo que manda es el grafo: nadie juega un nodo sin sus prerequisitos, y nadie espera a "terminar un nivel" para avanzar por una rama que ya tiene abierta.

| Nivel | Nombre | Áreas | Qué cambia para el jugador |
|---|---|---|---|
| 0 | Intuición | `found` | cantidades, comparar, clasificar, patrones, orden. Sin leer. |
| 1 | Aritmética | `arith` | las cuatro operaciones como transformaciones; negativos; fracciones; precedencia como árbol |
| 2 | Preálgebra | `prealg` | la incógnita como caja; la igualdad como balanza; toda operación tiene llave |
| 3 | Álgebra y geometría | `alg`, `geom` | ecuaciones, sistemas, funciones como máquinas; área, ángulos, semejanza |
| 4 | Trigonometría y precálculo | `trig`, `precalc` | círculo unitario, identidades; límites intuitivos, sucesiones, complejos |
| 5 | Cálculo I | `calc1` | derivada como límite de secantes; integral como acumulación; teorema fundamental |
| 6 | Cálculo II, álgebra lineal, probabilidad | `calc2`, `linalg`, `prob` | técnicas y series; vectores y transformaciones; probabilidad como proporción |
| 7 | Multivariable, discreta, grafos, computación | `mvcalc`, `disc`, `graph`, `csmath` | gradiente y campos; lógica, inducción, conjuntos; redes; algoritmos y complejidad |
| 8 | Avanzado | `adv` | complejos, análisis real, álgebra abstracta, topología, EDO, numérico, optimización, Fourier |

## Áreas y presupuesto de nodos

Objetivo: 310 nodos, tolerancia ±20 % por área. El presupuesto no es una meta a llenar sino un techo que obliga a elegir ideas y no temas.

| Área | Nodos | Clusters previstos |
|---|---:|---|
| `found` | 12 | `count` (cardinalidad, subitizar, recta), `cmp` (comparar, ordenar), `pat` (patrones, secuencias), `shape` (formas, simetría), `meas` (medir, estimar), `sort` (clasificar), `lit` (pre-lectura: reconocer símbolos, seguir una instrucción corta) |
| `arith` | 24 | `add`, `sub`, `mul`, `div` (significado, propiedades, algoritmo), `int` (negativos), `frac` (5), `dec`, `pct`, `expr` (precedencia), `num` (primos, divisibilidad) |
| `prealg` | 16 | `var`, `expr`, `eq` (balanza), `inv` (llave), `ratio`, `int` (reglas de signos), `exp` (exponentes), `coord`, `ineq` |
| `alg` | 30 | `eq` (5), `ineq` (2), `sys` (3), `poly` (5), `fn` (8), `explog` (4), `rat` (3) |
| `geom` | 24 | `area` (5), `angle` (3), `tri` (4), `sim` (2), `circle` (3), `transform` (3), `cons` (2: líneas auxiliares, construcciones), `solid` (2) |
| `trig` | 16 | `ratio` (2), `circle` (3: giro, círculo unitario con radianes, identidad pitagórica), `fn` (3), `id` (3), `inv`, `law` (2), `polar`, `rot` |
| `precalc` | 16 | `lim` (3), `seq`, `conic`, `cplx`, `vec`, `param`, `fntr` (3), `binom` |
| `calc1` | 22 | `lim` (4), `deriv` (7), `apply` (5), `int` (4), `ftc` (2) |
| `calc2` | 18 | `tech` (4), `impr`, `int` (2), `ser` (7), `taylor` (2), `parpol` (3), `ode` (2) |
| `mvcalc` | 16 | `fn`, `part`, `grad`, `jac`, `opt`, `lagr`, `int`, `field`, `line`, `surf`, `divrot`, `thm` |
| `linalg` | 24 | `vec` (4), `map` (6), `sys` (3), `det` (2), `eig` (3), `basis` (2), `orth` (2), `svd` (2) |
| `prob` | 22 | `basic` (6), `cond` (3), `rv` (4), `dist` (3), `moment` (2), `samp` (2), `inf` (2) |
| `disc` | 16 | `logic`, `set`, `proof` (3), `ind`, `rec` (2), `count` (3), `mod` (2), `rel` |
| `graph` | 12 | `basic`, `path`, `tree`, `euler`, `color`, `search`, `short`, `matrix`, `flow`, `planar`, `match`, `bip` |
| `csmath` | 12 | `base`, `bool`, `bigo`, `rec`, `hash`, `crypto` (2), `automata`, `info`, `float`, `invariant`, `class` |
| `adv` | 36 | `complex` (6), `real` (6), `abstract` (6), `topo` (4), `ode` (5), `num` (3), `opt` (3), `fourier` (3) |
| **Total** | **316** | |

## La espina dorsal

Cuarenta y cuatro conceptos forman el camino mínimo que atraviesa todas las grandes ideas: contar, operar, deshacer, la incógnita, la igualdad como invariante, la llave, ecuaciones, funciones como máquinas, gráficas, composición, inversas, exponenciales y logaritmos, límite, derivada, integral, teorema fundamental, vectores, transformaciones lineales, probabilidad, esperanza, grafos, y la rama de geometría y trigonometría: área como baldosas, ángulo como giro, semejanza como escala, Pitágoras con baldosas, líneas auxiliares (la puerta a los problemas de olimpíada), círculo unitario con radianes y el seno como altura en la rueda. Los siete de geometría y trigonometría llevan los números 38 a 44 porque se agregaron después de congelar los primeros 37; el número es solo un prefijo de archivo y el diagnóstico los ordena por nivel. Están numerados en `spine.yaml` y cada uno tiene un archivo D1 con el template de 14 pasos y un minijuego completo en [F](../F-minijuegos/F0-principios.md).

Lo que la espina no cubre lo cubren las ramas: geometría, trigonometría, series, multivariable, discreta, computación y matemática avanzada existen en el grafo con la misma estructura de nodo, la misma gramática visual y las mismas mecánicas, pero se desarrollan con menos profundidad en esta versión del diseño. El criterio para entrar a la espina fue doble: el concepto introduce una primitiva de la gramática visual nueva o hace regresar una ya vista en otro contexto (la llave vuelve tres veces: en la resta, en la inversa, en el teorema fundamental).

## Rutas de lectura

El grafo admite muchos recorridos. Tres que conviene tener en mente al diseñar el selector ([J](../J-adaptativo.md)):

- **Ruta del niño de seis años.** Nivel 0 completo sin leer; nivel 1 con iconos y voz; grafos (37) como excursión temprana porque solo necesita contar; geometría de área con baldosas antes que fracciones abstractas. Llega a la incógnita como caja (10) y a la balanza (11) sin haber leído una definición.
- **Ruta del adulto que "se olvidó todo".** El diagnóstico lo ubica en aritmética o preálgebra; el backfill detecta la misconception de fracciones que arrastra desde la escuela; el selector interleava álgebra con probabilidad básica (34), que solo necesita fracciones, para que el progreso se sienta pronto.
- **Ruta universitaria.** Colocación en funciones o cálculo; el sistema exige igualmente los nodos de espina anteriores en `ready` provisional y los verifica en silencio; la transferencia obliga a volver a la llave (12) desde el teorema fundamental (29) y desde `A⁻¹b` (33).

## Desafíos

Cada área tiene un nivel de desafío con problemas estilo olimpíada de varios pasos y datos faltantes ([S](../S-desafios/S0-desafios.md)): figuras compuestas donde hay que trazar una altura para descubrir una longitud, sistemas donde una ecuación está escondida en el enunciado, conteos donde hay que elegir qué contar. Se desbloquean cuando sus nodos requeridos están en `ready`, nunca bloquean el avance por el grafo, y se juegan con la cheatsheet abierta ([R](../R-cheatsheet/R0-cheatsheet.md)). La cheatsheet misma se construye nodo a nodo: cada concepto agrega sus fórmulas, reglas y estrategias al llegar a la capa simbólica o formal.

## Lista de espera para 3D

La capa visual interactiva de la app es 2D (ver [O](../O-arquitectura-tecnica.md)). Los nodos que **requieren** 3D interactivo y no solo un clip pre-renderizado son pocos y se listan aquí para que nadie los introduzca sin decidirlo: `mvcalc.part.slice_of_surface`, `mvcalc.grad.terrain_walker`, `mvcalc.int.double_integral_tank`, `linalg.map.linear_transformation_3d`, `calc2.parpol.solid_of_revolution`. El volumen por capas de geometría (`geom.solid.volume_as_layers`) se resuelve en 2.5D apilando rebanadas. Todo lo demás en 3D se resuelve con proyección 2.5D o con clip.

## Lo que este mapa no decide

- Las edades: no hay puertas por edad, solo por prerequisitos y por `literacy` ([Q](../Q-edad-universal.md)).
- Los umbrales de mastery: viven en [K](../K-evaluacion.md).
- El orden dentro de cada sesión: lo decide el selector ([J](../J-adaptativo.md)).
