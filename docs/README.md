# Mathy: documento de diseño

Este directorio contiene el diseño completo de Mathy, un juego mobile para aprender matemática desde cero hasta nivel universitario avanzado. Es un documento vivo, modular y en parte legible por máquina: la prosa argumenta una vez, y todo lo que se referencia por id desde más de un lugar vive en YAML.

> **Si sos un agente que llega a trabajar, no empieces por acá.** Leé
> [`HANDOFF.md`](HANDOFF.md) y el archivo más nuevo de `handoffs/`: dos documentos, y con
> eso sabés dónde está parado el proyecto y qué no hay que romper. Este README es el
> índice del **diseño**, que es otra cosa: lo que hay que construir, no lo que ya está.

## Cómo leer

Si tenés una hora: [A](A-vision.md), [B](B-filosofia-pedagogica.md), [H](H-progresion-abstraccion.md) y el concepto de calibración [13-alg.eq.one_step](D-curriculum/D1-espina/13-alg.eq.one_step.md) con su [minijuego](F-minijuegos/alg.eq.one_step.md). Si vas a escribir contenido: [C0](C-knowledge-graph/C0-esquema.md), [E0](E-mecanicas/E0-catalogo.md), [G0](G-analogias/G0-reglas.md), [L0](L-modelo-errores/L0-taxonomia.md), la [plantilla D1](D-curriculum/D1-espina/_plantilla.md) y [F0](F-minijuegos/F0-principios.md). Si vas a implementar: [T](T-plan-implementacion.md), [U](U-desarrollo/U0-estado.md), [O](O-arquitectura-tecnica.md), [I0](I-manim/I0-mapping.md), [K](K-evaluacion.md), [J](J-adaptativo.md), [P](P-internacionalizacion.md).

## Secciones

| | Sección | Qué contiene |
|---|---|---|
| A | [Visión](A-vision.md) | Qué experiencia queremos construir |
| B | [Filosofía pedagógica](B-filosofia-pedagogica.md) | Las once reglas que gobiernan el diseño |
| C | [Knowledge graph](C-knowledge-graph/C0-esquema.md) | Schema, convención de ids, validador; [espina](C-knowledge-graph/spine.yaml) de 44 conceptos; [grafo](C-knowledge-graph/graph/) de ~350 nodos en 16 áreas |
| D | [Curriculum](D-curriculum/D0-mapa.md) | Niveles, áreas, presupuesto, rutas de lectura; [D1](D-curriculum/D1-espina/): template de 14 pasos por concepto de la espina |
| E | [Mecánicas](E-mecanicas/E0-catalogo.md) | Trece mecánicas reutilizables y la teoría "funciones como llaves"; [datos](E-mecanicas/mechanics.yaml) |
| F | [Minijuegos](F-minijuegos/F0-principios.md) | Principios y un minijuego completo por concepto de la espina |
| G | [Analogías](G-analogias/G0-reglas.md) | Test de preservación de estructura, cuándo se desvanecen; [catálogo](G-analogias/analogies.yaml) |
| H | [Progresión de abstracción](H-progresion-abstraccion.md) | Las ocho capas, la gramática visual, la historia de cada símbolo, cofres y frutas nivel a nivel |
| I | [Manim](I-manim/I0-mapping.md) | Rol dual de ManimGL, mapping concepto → primitivas → equivalente nativo; [escenas](I-manim/scenes.yaml) |
| J | [Adaptativo](J-adaptativo.md) | Diagnóstico y selector diario |
| K | [Evaluación](K-evaluacion.md) | Modelo de mastery de seis dimensiones; única fuente de constantes |
| L | [Errores](L-modelo-errores/L0-taxonomia.md) | Taxonomía de misconceptions con reglas de detección y patrones de explicación; [datos](L-modelo-errores/misconceptions.yaml) |
| M | [Calculadora](M-calculadora/M0-progresion.md) | La calculadora evolutiva; [operaciones](M-calculadora/calculator_ops.yaml) |
| N | [UX/UI](N-ux-ui.md) | Sistema de diseño, pantallas, input, accesibilidad |
| O | [Arquitectura técnica](O-arquitectura-tecnica.md) | React Native, mini-Manim, math engine, pipeline Manim, testing, riesgos |
| P | [Internacionalización](P-internacionalizacion.md) | Strings por clave, notación por locale, clips sin texto |
| Q | [Edad universal](Q-edad-universal.md) | Jugable desde 5–6 años: pre-lectura, input, privacidad infantil |
| R | [Cheatsheet](R-cheatsheet/R0-cheatsheet.md) | Referencia personal incremental por tema; [entradas](R-cheatsheet/cheatsheet_entries.yaml) |
| S | [Desafíos](S-desafios/S0-desafios.md) | Problemas estilo olimpíada con datos faltantes; [catálogo](S-desafios/challenges.yaml) |
| T | [Plan de implementación](T-plan-implementacion.md) | Stack verificado, arquitectura de paquetes, hitos, pacing y riesgos |
| U | [Desarrollo](U-desarrollo/U0-estado.md) | Estado del código: qué está construido, qué sigue, cómo correrlo. [U1](U-desarrollo/U1-decisiones.md): las decisiones técnicas con su evidencia |
| | [Locales](locales/es/) | Todas las cadenas visibles al usuario, en español como locale fuente |

## Convenciones

- **Ids.** Nodos: `area.cluster.slug`. Mecánicas, misconceptions, analogías, patrones, escenas, operaciones de calculadora, entradas de cheatsheet (`cs.area.slug`) y desafíos (`ch.area.slug`) tienen ids permanentes; renombrar exige `aliases`.
- **Prosa y datos.** Lo que se referencia por id desde más de un lugar es YAML. Los YAML no contienen texto visible al usuario: ese texto vive en `locales/<lang>/`.
- **Constantes.** Todo umbral, peso o tiempo vive en [K](K-evaluacion.md). Los demás documentos los citan por nombre.
- **Manim.** Los nombres de clases y métodos de ManimGL solo aparecen en [I](I-manim/); el resto describe visualizaciones en el lenguaje de la gramática visual de [H](H-progresion-abstraccion.md).
- **Idioma.** Español neutro con términos técnicos consolidados en inglés.

## Glosario

| Término | Significado en Mathy |
|---|---|
| nodo | una idea matemática con una única dificultad cognitiva |
| espina | los 44 conceptos desarrollados a fondo, con D1 y minijuego |
| capa | una de las ocho etapas de abstracción de un concepto |
| primitiva | una de las doce transformaciones de la gramática visual |
| mecánica | interacción física reutilizable que conserva un invariante |
| minijuego | la instancia de una mecánica para un nodo |
| desafío | problema de varios pasos con datos faltantes, estilo olimpíada |
| verbo de evidencia | recognize, explain, manipulate, apply, generalize, transfer |
| `ready` / `mastered` | estados de un nodo definidos en K |
| misconception | error conceptual con nombre, regla de detección y patrón de explicación |
| cheatsheet | referencia personal que crece con cada concepto alcanzado |
| MathLocale | convenciones de notación matemática por idioma |
| mini-Manim | reimplementación nativa de la gramática visual de Manim |

## Verificación

El documento se valida con [`tools/validate.py`](../tools/validate.py), que se corre desde la raíz del repositorio y no necesita más que Python con PyYAML:

```bash
python3 tools/validate.py
```

Comprueba lo que enumera el final de [`node.schema.yaml`](C-knowledge-graph/schema/node.schema.yaml) (ids, prerequisitos, aciclicidad, orden de la espina, reglas de `literacy`, claves de locale y referencias a mecánicas, analogías, escenas, operaciones, entradas de cheatsheet y desafíos) y además tres cosas que el documento exige de sí mismo: que los enlaces relativos resuelvan, que la prosa cite el id vigente y no un alias, y que los nombres de clases de ManimGL no aparezcan fuera de I y O.

Distingue errores de avisos. Un error es una contradicción: una referencia que no resuelve, un ciclo, un enlace roto. Un aviso es una observación que puede ser deliberada: un prerequisito transitivamente redundante, una misconception que se explica sobre una mecánica que su nodo no declara (ver la regla de [L0](L-modelo-errores/L0-taxonomia.md)), un concepto de la espina sin desafío. El documento debe cerrar siempre con cero errores; los avisos se leen y se deciden.

Una región de prosa cuyo tema son los aliases mismos, como la sección de [M0](M-calculadora/M0-progresion.md) que documenta qué operaciones se absorbieron en cuál, se marca con `<!-- alias-ok -->` y `<!-- /alias-ok -->` para que citarlos ahí no cuente como error.
