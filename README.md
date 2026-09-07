# Mathy

Juego para aprender matemática desde cero hasta nivel universitario avanzado. Cada concepto se construye jugando: primero una situación del mundo real, después manipulación concreta, después representación visual, y solo al final la notación y la formalización. La abstracción es la consecuencia natural de haber jugado con la estructura correcta.

Principios que atraviesan todo el diseño:

- **Matemática = transformación + estructura + invariantes.** Sumar es desplazar, multiplicar es escalar, una función inversa es una llave que deshace una transformación.
- **Toda notación tiene una historia.** Un símbolo aparece solo cuando el jugador ya necesitó lo que representa.
- **Los errores son datos pedagógicos.** El juego muestra qué hizo realmente cada movimiento equivocado en lugar de decir "incorrecto".
- **Jugable desde los 5–6 años y hasta la universidad.** Mismo grafo de conocimiento, mismas mecánicas; cambia la presentación, nunca el contenido.
- **Internacionalizado desde el día uno.** Ningún texto visible está fijo en el código ni en el contenido.

## Estado

Fase de diseño. Todo el diseño vive en [`docs/`](docs/README.md); todavía no hay código de producto.

## Estructura prevista del repositorio

```
docs/        documento de diseño (visión, pedagogía, knowledge graph, curriculum, mecánicas,
             minijuegos, analogías, Manim, adaptativo, evaluación, errores, calculadora, UX,
             arquitectura, i18n, edad universal)
apps/mobile  app React Native (Expo) para iOS y Android          [futuro]
packages/    math-engine, viz-core (mini-Manim), curriculum-engine,
             knowledge-graph, user-model, persistence           [futuro]
content/     grafo, actividades y locales compilados a la app    [futuro]
manim/       escenas ManimGL parametrizadas y pipeline de pre-render [futuro]
```

## Cómo leer el diseño

Empezar por [`docs/README.md`](docs/README.md), que indexa las secciones A–Q y explica las convenciones (qué es prosa, qué es YAML, cómo se referencian los ids).
