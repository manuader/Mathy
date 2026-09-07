# A — Visión del producto

## Qué es Mathy

Mathy es un juego para teléfonos y tablets que lleva a una persona desde contar objetos hasta matemática universitaria avanzada, jugando. No es una app de ejercicios con estética de juego ni un curso en video con preguntas: es un sistema de aprendizaje donde jugar es la forma de construir intuición, y la notación matemática es lo que queda cuando la intuición ya está.

Alguien que empieza sin saber leer y alguien que cursa cálculo entran al mismo grafo de conocimiento por puertas distintas, con las mismas mecánicas y el mismo lenguaje visual. Un niño de seis años que se comprometa con el juego puede llegar a álgebra lineal. Un adulto que "se olvidó todo" descubre en diez minutos qué fracción arrastra mal desde la escuela y la repara jugando.

## Qué experiencia queremos

**Se entiende antes de nombrarse.** El jugador nivela una balanza con una caja cerrada y doce pesas mucho antes de ver `x + 5 = 12`. Cuando el símbolo aparece, ya sabe qué hace, porque lo hizo. Cada símbolo del curriculum tiene un problema que lo hizo necesario y un objeto del que surge.

**La misma idea vuelve.** La llave que abre un cofre en aritmética es la que invierte una función, la que resuelve un sistema con una matriz y la que hace del teorema fundamental del cálculo una sorpresa reconocible. Trece mecánicas y doce primitivas visuales atraviesan las dieciséis áreas del curriculum para que el jugador construya una intuición unificada: la matemática es transformación, estructura e invariantes.

**El error enseña.** Nada dice "incorrecto". El movimiento equivocado se ejecuta y se ve: la balanza se inclina, la llave no gira, a las baldosas les falta una pieza. El juego reproduce lo que pasó sobre el estado real del jugador y le devuelve el control con una pregunta.

**El premio es la herramienta.** Cada concepto desbloquea operaciones en una calculadora que crece y suma fórmulas, reglas y estrategias a una cheatsheet personal organizada por tema. No hay monedas, vidas ni rachas.

**Hay problemas de verdad.** Cada área tiene un nivel de desafío con problemas del tipo que se ve en olimpíadas: una figura con un dato que falta y que solo aparece si se traza la línea correcta. Se juegan con la cheatsheet abierta y con pistas que nunca dan la respuesta.

**Se siente premium.** Minimalista, precisa, científica. Un solo sistema visual para todas las edades, sin estética infantil ni gamification superficial. El objeto en pantalla se transforma, nunca se reemplaza: `🍎 + 🍎` se convierte en `x + x` y en `2x` delante del jugador.

## Qué cubre

Dieciséis áreas y unos 350 conceptos: intuición matemática, aritmética, preálgebra, álgebra, geometría, trigonometría, precálculo, cálculo en una y varias variables, álgebra lineal, probabilidad y estadística, matemática discreta, grafos, matemática para computación y un bloque avanzado con complejos, análisis, álgebra abstracta, topología, ecuaciones diferenciales, numérico, optimización y Fourier. Cuarenta y cuatro conceptos forman la espina dorsal y están desarrollados a fondo, con un minijuego completo cada uno ([D](D-curriculum/D0-mapa.md)).

## Para quién

Para cualquiera desde los cinco o seis años. Sin cuenta obligatoria, con perfiles por dispositivo para una familia, con privacidad infantil como base y accesibilidad como requisito. En cualquier idioma: el producto nace internacionalizado, incluida la notación matemática misma.

## Cómo se construye

Como app nativa para iOS y Android en React Native, con un motor de visualización propio que reimplementa la gramática de Manim para la capa interactiva y usa Manim como herramienta de autoría para lo que solo se mira; con un motor simbólico en el dispositivo que valida cada movimiento y clasifica cada error; y con un grafo de conocimiento en datos, no en código, que el equipo pedagógico puede editar sin tocar la app ([O](O-arquitectura-tecnica.md)).

## Qué no es

No es una app escolar ni un repaso para un examen. No es una colección de minijuegos de matemática. No es un tutor que resuelve por el jugador. No premia el tiempo jugado ni castiga la velocidad. No promete que la matemática sea fácil: promete que cada paso difícil se puede jugar antes de tener que escribirlo.

## Cómo leer este diseño

La filosofía está en [B](B-filosofia-pedagogica.md). El resto de las secciones, indexadas en el [README](README.md), desarrolla el grafo, el curriculum, las mecánicas, los minijuegos, las analogías, la progresión de abstracción, la visualización, la adaptación, la evaluación, los errores, la calculadora, la cheatsheet, los desafíos, la interfaz, la arquitectura, la internacionalización y la edad universal.
