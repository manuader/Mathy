# C0 — Esquema del knowledge graph

El knowledge graph es la columna vertebral de Mathy: decide qué puede jugar cada persona, en qué orden, con qué mecánica y qué errores esperar. Este documento explica el schema definido en [`schema/node.schema.yaml`](schema/node.schema.yaml), la convención de ids y las reglas que hace cumplir el validador. Los nodos viven en [`graph/`](graph/), un archivo por área. La espina dorsal está en [`spine.yaml`](spine.yaml).

## Qué es un nodo

Un nodo es **una idea matemática con una única dificultad cognitiva**, no un tema escolar. "Resta" no es un nodo; "la resta deshace la suma" sí lo es. Esta distinción es la que permite que un nodo tenga una analogía que preserve su estructura, una mecánica que la haga manipulable y un conjunto pequeño de misconceptions que lo distingan.

Cada nodo declara:

| Campo | Para qué sirve |
|---|---|
| `id`, `area`, `level` | identidad y posición orientativa |
| `prereqs` | prerequisitos **directos**; el validador deriva `unlocks` y la clausura transitiva |
| `grammar` | la primitiva de la gramática visual dominante (ver [H](../H-progresion-abstraccion.md)) |
| `mechanics` | qué mecánica reutilizable lo hace manipulable (ver [E](../E-mecanicas/E0-catalogo.md)); la primera es la principal |
| `literacy` | cuánto hay que leer para jugarlo (ver [Q](../Q-edad-universal.md)) |
| `layers` | qué capas de abstracción recorre; se declara solo para acotar |
| `analogy` | la analogía del mundo real (ver [G](../G-analogias/G0-reglas.md)); obligatoria si el nodo tiene capa `real` o `concrete` |
| `misconceptions` | errores conceptuales conocidos (ver [L](../L-modelo-errores/L0-taxonomia.md)) |
| `transfer_to` | dónde se evalúa el mismo concepto con otra mecánica y en otra área |
| `calc_unlocks` | qué operaciones de la calculadora evolutiva habilita (ver [M](../M-calculadora/M0-progresion.md)) |
| `t_star` | tiempo objetivo para la dimensión Speed (ver [K](../K-evaluacion.md)) |
| `manim` | escenas asociadas (ver [I](../I-manim/I0-mapping.md)) |
| `next` | sucesor narrativo |
| `probes`, `doc` | solo espina: cómo se ve un ítem de cada verbo de evidencia, y el archivo D1 del concepto |

Los enums (áreas, niveles, capas, primitivas, verbos de evidencia, niveles de lectura) están definidos una sola vez en el schema. Ningún otro documento los redefine.

## Convención de ids

`area.cluster.slug`, todo en minúsculas y `snake_case`.

- `area` es uno de los 16 tokens del enum y coincide con el archivo en `graph/`.
- `cluster` agrupa subtemas dentro del área (`eq`, `fn`, `deriv`, `int`, `vec`, `map`, `cond`, `seq`...). Cada archivo de área lista sus clusters al inicio.
- `slug` nombra la **idea**, no el tema: `undo_add` y no `subtraction`; `rate_as_slope_limit` y no `derivative`. Esto obliga a quien escribe el nodo a enunciar la estructura que enseña, y hace que las listas de `prereqs` se lean solas.
- Nunca se codifica nivel ni orden en el id: cambian. El orden vive en `spine.yaml` y en `level`.
- Los ids son permanentes. Renombrar requiere una entrada `aliases` para que ninguna referencia se rompa.

## Prosa cero dentro del YAML

Los archivos de `graph/` no contienen texto visible al usuario. El nombre del nodo, los `probes`, la introducción y cualquier prompt viven en [`../locales/es/nodes.yaml`](../locales/es/nodes.yaml) bajo la clave del id (`nodes.alg.eq.one_step.name`). Dos razones: el producto es internacionalizable desde el origen ([P](../P-internacionalizacion.md)), y trescientos nodos con prosa incrustada dejan de ser mantenibles. Si hace falta explicar un nodo, el lugar es su archivo D1 o el mapa del área en [D0](../D-curriculum/D0-mapa.md).

Un nodo no-espina cabe en una o dos líneas en estilo flow:

```yaml
- {id: geom.area.triangle, area: geom, level: 3, prereqs: [geom.area.rectangle], grammar: scale, mechanics: [tiles], literacy: icons, analogy: tile_floor, misconceptions: [area_uses_slant_side], calc_unlocks: [area_triangle]}
```

Un nodo de espina ocupa unas veinte líneas porque declara `probes`, `transfer_to`, `manim` y `doc`.

## La espina dorsal

[`spine.yaml`](spine.yaml) fija 37 conceptos ordenados que forman el camino mínimo de conteo a grafos pasando por ecuaciones, funciones, inversas, exponenciales y logaritmos, derivada, integral, vectores, transformaciones lineales y probabilidad. Cada uno depende solo de anteriores. Son los conceptos desarrollados a fondo con el template de 14 pasos en [D1](../D-curriculum/D1-espina/) y con un minijuego completo en [F](../F-minijuegos/). El diagnóstico ([J](../J-adaptativo.md)) hace búsqueda binaria sobre esta lista.

Aristas que conviene entender porque no son las del orden escolar:

- **Balanza (11) y llave (12) son independientes y ambas alimentan las ecuaciones de un paso (13).** La llave enseña *por qué funciona* la operación inversa: `÷5` deshace `×5`, y eso se aprende en aritmética pura, sin ninguna ecuación. La balanza enseña *por qué hay que aplicarla a los dos lados*: la igualdad es un invariante bajo acciones idénticas. Quien solo tiene la llave la aplica a un lado; quien solo tiene la balanza elige la llave equivocada. La ecuación de un paso es el primer nodo que necesita las dos.
- **El árbol de precedencia (9) es prerequisito de la incógnita (10) y de las ecuaciones de varios pasos (14).** Una variable es una hoja del árbol de la expresión; los cofres anidados *son* ese árbol dibujado como cajas; y el orden en que se abren es exactamente el inverso del orden de precedencia. Así el juego explica el error de desenvolver en orden invertido como estructura, no como regla.
- **La función como máquina (17) no depende de las ecuaciones (13–16).** Solo necesita la caja y el árbol. Esto permite que el diagnóstico ubique a alguien fuerte en funciones y débil en resolución, y evita que las dos ramas se conviertan en una única cadena.
- **La función inversa (21) depende de la llave (12).** Es el momento en que "las llaves se vuelven funciones", como pide el master prompt. La gráfica (18) también es prerequisito porque la reflexión sobre `y = x` es la capa visual de la inversa.
- **Completar el cuadrado (22) depende de las baldosas (15).** Además es el primer lugar donde una llave abre dos cofres: `x² = 9` tiene dos ramas. Por eso la misconception `sqrt_loses_negative_branch` vive aquí y no en la inversa genérica.
- **Las reglas de derivación (27) dependen de las baldosas (15).** La regla del producto es un rectángulo que crece; la regla de la cadena son dos tuberías con relación de engranajes (20).
- **El teorema fundamental (29) depende de la llave (12).** Es el tercer regreso de la llave: la integral deshace la derivada. Es una arista de transferencia deliberada hacia preálgebra.
- **La acumulación (28) no depende de la derivada (26).** Se enseña sola, como suma de rectángulos, para que el teorema fundamental sea una sorpresa y no una definición.
- **La esperanza (36) depende de la combinación lineal (31).** Es el producto punto de un vector de valores con un vector de probabilidades; la arista obliga a *verla* como combinación ponderada.
- **Los grafos (37) solo necesitan contar (1).** Así los grafos pueden ser una excursión temprana para quien está atascado en aritmética, y la primitiva `relate` aparece pronto.

## Presupuesto de nodos

El objetivo es 310 nodos con tolerancia de ±20 %. La distribución por área, la justificación y las rutas de lectura están en [D0](../D-curriculum/D0-mapa.md). Los nodos de `adv.*` pueden declarar `layers` sin `real` ni `concrete`: es la forma explícita y revisable de decir que la analogía ya no aporta valor, en lugar de una omisión.

## El validador

El validador es una herramienta de verificación, no parte del producto. Corre sobre todos los YAML de `docs/` y falla si alguna regla listada al final del schema se rompe: ids únicos y bien formados, referencias que resuelven, grafo acíclico, espina en orden compatible con sus prerequisitos, una mecánica por nodo y cada mecánica en tres áreas o más, reglas de `literacy` por nivel, analogía obligatoria cuando hay capa concreta, `probes` completas en la espina, claves de locale existentes en `es`. Emite avisos, no errores, por prerequisitos transitivamente redundantes y por desvíos del presupuesto. Calcula `unlocks` en lugar de leerlo: mantener las dos direcciones a mano garantiza inconsistencias en un grafo de este tamaño.
