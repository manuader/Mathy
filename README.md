# Mathy

Juego para aprender matemática desde cero hasta nivel universitario avanzado. Cada concepto se construye jugando: primero una situación del mundo real, después manipulación concreta, después representación visual, y solo al final la notación y la formalización. La abstracción es la consecuencia natural de haber jugado con la estructura correcta.

Principios que atraviesan todo el diseño:

- **Matemática = transformación + estructura + invariantes.** Sumar es desplazar, multiplicar es escalar, una función inversa es una llave que deshace una transformación.
- **Toda notación tiene una historia.** Un símbolo aparece solo cuando el jugador ya necesitó lo que representa.
- **Los errores son datos pedagógicos.** El juego muestra qué hizo realmente cada movimiento equivocado en lugar de decir "incorrecto".
- **Jugable desde los 5–6 años y hasta la universidad.** Mismo grafo de conocimiento, mismas mecánicas; cambia la presentación, nunca el contenido.
- **Internacionalizado desde el día uno.** Ningún texto visible está fijo en el código ni en el contenido.

## Estado

Diseño cerrado, construcción en marcha. El diseño completo vive en [`docs/`](docs/README.md); el estado del código y qué sigue, en [`docs/U-desarrollo/U0-estado.md`](docs/U-desarrollo/U0-estado.md).

El núcleo del motor de animación está construido y probado: representa una ecuación como un árbol donde cada término tiene identidad estable, y anima el paso de un estado al siguiente moviendo esos términos en vez de redibujar la fórmula. Falta la capa que dibuja.

## Estructura prevista del repositorio

```
docs/        documento de diseño (visión, pedagogía, knowledge graph, curriculum, mecánicas,
             minijuegos, analogías, Manim, adaptativo, evaluación, errores, calculadora, UX,
             arquitectura, i18n, edad universal, cheatsheet, desafíos)
tools/       validate.py, el validador del documento
packages/    math-core   árbol de expresión con identidad de término   [listo]
             typeset     composición de fórmulas                       [listo]
             viz-core    suavizados de Manim y planificador de morph   [listo]
             glyphs      atlas de contornos horneado en build time     [en curso]
             viz-skia    adaptador de dibujo                           [futuro]
apps/mathy   app Expo única para iOS, Android y navegador              [futuro]
content/     grafo, actividades y locales compilados a la app          [futuro]
```

## Cómo leer el diseño

Empezar por [`docs/README.md`](docs/README.md), que indexa las secciones A–S y explica las convenciones (qué es prosa, qué es YAML, cómo se referencian los ids).

Antes de dar por bueno un cambio, correr el validador desde la raíz. Tiene que cerrar con cero errores:

```bash
npm install && npm test --workspaces --if-present && python3 tools/validate.py
```

## Licencia

[MIT](LICENSE). El documento de diseño y el código que lo acompañe se pueden usar, modificar y redistribuir citando la autoría.
