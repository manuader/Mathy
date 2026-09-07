# F0 — Principios de los minijuegos

Un minijuego es la instancia de una [mecánica](../E-mecanicas/E0-catalogo.md) para un nodo del [grafo](../C-knowledge-graph/C0-esquema.md). La mecánica es el esqueleto reutilizable; el minijuego le pone la analogía, los parámetros, la progresión de capas y los ítems de evidencia de ese concepto. Este documento fija qué debe tener todo minijuego y las reglas que los hacen coherentes entre sí. El índice está en [`minigames.yaml`](minigames.yaml); cada concepto de la espina tiene su archivo en esta carpeta.

## Antes de diseñar: el análisis obligatorio

Nadie diseña un minijuego sin responder por escrito, en este orden, las preguntas del master prompt:

1. **¿Qué concepto enseñamos?** Un nodo, una idea. Si son dos, son dos minijuegos.
2. **¿Cuál es la dificultad cognitiva real?** No "resolver ecuaciones" sino conservar la equivalencia, elegir la operación inversa, respetar la jerarquía, anticipar el resultado.
3. **¿Qué analogía conserva la estructura?** Se elige con el test de [G](../G-analogias/G0-reglas.md), no por divertida.
4. **¿Qué hace físicamente el jugador?** El gesto, el objeto, el feedback inmediato.
5. **¿Cómo se pasa de objeto a visual a ficha a símbolo?** Las etapas de desvanecimiento, con el gesto que dispara cada una.
6. **¿Qué visualización lo representa mejor?** En lenguaje de la gramática visual de [H](../H-progresion-abstraccion.md); las escenas concretas se listan en [I](../I-manim/I0-mapping.md).
7. **¿Cuándo se elimina la analogía?** El criterio explícito.

## Los diez campos de todo minijuego

Cada archivo de esta carpeta tiene exactamente estas secciones, en este orden:

| Campo | Qué responde |
|---|---|
| **Analogía** | qué situación real representa y qué mapa objeto → concepto usa |
| **Mecánica central** | qué hace el jugador, con qué gestos, en qué superficie |
| **Invariante matemático** | qué propiedad se conserva en cada movimiento válido y cómo se ve cuando se rompe |
| **Representación visual** | cómo se dibuja en cada capa y qué primitiva de la gramática visual domina |
| **Transición simbólica** | la secuencia de desvanecimiento hasta la notación |
| **Concepto formal** | la definición o propiedad que queda al final |
| **Generalización** | cómo desaparece la analogía y qué variantes se juegan sin ayuda |
| **Desafío** | cómo se ejercita: la progresión de niveles, los parámetros que se endurecen, y el enlace a los desafíos de olimpíada del área cuando existen |
| **Mastery** | cómo se instancia cada uno de los seis verbos de evidencia dentro de la mecánica, y qué misconceptions se esperan con su patrón de explicación |
| **Implementación** | escenas nativas y pre-renderizadas, parámetros del generador, `literacy` soportada, modo de instrucción por demostración |

## Reglas

**Todo ejercicio es un minijuego.** No existen pantallas de ejercitación desnudas ni preguntas de opción múltiple con texto. Los seis verbos de evidencia de [K](../K-evaluacion.md) se instancian dentro de la mecánica: reconocer es elegir entre cuatro cofres; explicar es elegir la animación que justifica un paso, o predecir y después ver; manipular es arrastrar la llave; aplicar es leer la situación y construir la ecuación antes de abrirla; generalizar es un cofre con una cerradura que nunca se vio; transferir es la misma llave en otra área. Los distractores de `explain` son siempre misconceptions del nodo, así que un error en `explain` también clasifica.

**El error no interrumpe.** Cuando el jugador hace un movimiento inválido, el juego lo ejecuta de verdad y muestra qué pasó ([L](../L-modelo-errores/L0-taxonomia.md)): la balanza se inclina, el cofre no abre, la baldosa sobra. La explicación reabre la interacción desde el estado real, que sigue siendo válido, y pregunta qué hacer ahora. Un movimiento válido pero inútil recibe un empujón suave, no un error.

**El objeto es el mismo.** La manzana que se convierte en `x` es el mismo objeto en pantalla, transformado. Ningún minijuego cambia de pantalla para cambiar de capa ([H](../H-progresion-abstraccion.md), [N](../N-ux-ui.md)).

**La primera capa se juega sin leer.** Todo minijuego declara la `literacy` mínima y máxima que soporta y tiene instrucción por demostración: el juego hace el gesto una vez y espera ([Q](../Q-edad-universal.md)). Los targets son grandes y no hay escritura hasta la capa simbólica, donde aparece el teclado de fichas.

**Los parámetros se generan.** Ningún minijuego tiene una lista fija de ejercicios. Un generador con semilla produce instancias a partir de parámetros declarados (rango de números, cantidad de cofres anidados, tipo de coeficientes), y el selector ([J](../J-adaptativo.md)) elige la dificultad según la dimensión que trabaja. El generador se referencia por nombre desde un registro; el contenido no contiene código ([O](../O-arquitectura-tecnica.md)).

**La cheatsheet y la calculadora están a un toque.** Desde cualquier minijuego se abre el panel lateral sin salir de la actividad ([R](../R-cheatsheet/R0-cheatsheet.md), [M](../M-calculadora/M0-progresion.md)). En los desafíos la cheatsheet está abierta de entrada ([S](../S-desafios/S0-desafios.md)).

**Nada de gamification superficial.** El minijuego premia con la siguiente capa, con la operación nueva en la calculadora, con el territorio que se ilumina. Sin monedas, sin vidas, sin cuenta regresiva en los niveles 0 a 2.

**Sin constantes propias.** Umbrales, pesos y tiempos viven en K. Los nombres de clases de ManimGL viven en I. Un minijuego describe qué se ve, no cómo se implementa.

## Progresión dentro de un minijuego

La progresión sigue las capas de [H](../H-progresion-abstraccion.md), pero la unidad de juego es el **nivel**: un conjunto de instancias con los mismos parámetros y la misma capa. El ejemplo canónico de cofres tiene diez niveles, del cofre amarillo con llave amarilla al álgebra abstracta; la mayoría de los minijuegos tiene entre cinco y ocho. Cada nivel declara qué capa trabaja, qué verbo de evidencia produce y qué desvanecimiento introduce respecto del anterior. Un nivel nunca introduce dos cosas nuevas a la vez: o cambia la capa, o endurece los parámetros.

## Los desafíos no son minijuegos

Un desafío ([S](../S-desafios/S0-desafios.md)) combina varios nodos y varias mecánicas en un problema de varios pasos con datos ocultos. Comparte con los minijuegos la validación por movimiento, la explicación de errores y la ausencia de pantallas de drill, pero se diseña con su propio template y se desbloquea por conjunto de nodos, no por uno.

## Qué contiene `minigames.yaml`

Una entrada por minijuego: id, nodo, mecánica, analogía, niveles (capa, verbo, parámetros del generador por nombre), `literacy` soportada, escenas, misconceptions esperadas y desafíos relacionados. Sin texto visible: los nombres y las instrucciones narradas viven en `locales/<lang>/minigames.yaml` ([P](../P-internacionalizacion.md)).
