# T — Plan de implementación

Este documento cierra la fase de diseño y abre la de construcción. Fija el stack, la arquitectura de paquetes, el orden de los hitos, el pacing del jugador y los criterios de salida de cada etapa. Revisa dos decisiones de [O](O-arquitectura-tecnica.md) y de [I](I-manim/I0-mapping.md) que dejaron de ser ciertas.

## 1. La decisión que cambia todo: animación en vivo, no clips

El diseño original repartía la visualización en dos caminos: un mini-Manim nativo para lo interactivo y un pipeline de clips pre-renderizados en CI para las introducciones y el 3D. **Ese segundo camino se elimina.** Todo lo que el jugador ve se calcula en el dispositivo, en tiempo real, y responde al dedo.

Lo que se gana al eliminarlo:

- Desaparecen los 600 clips y los 700 MB de assets, con su CDN, su caché LRU y su prefetch de frontera.
- Desaparece el `handoff.json` y la coreografía de empalmar el último frame de un video con la primera escena nativa.
- Desaparece la restricción de renderizar clips sin texto para servir a todos los idiomas: si no hay clip, no hay texto quemado.
- Desaparece el riesgo de ManimGL headless en CI, que era un spike abierto.
- La promesa offline pasa de "el starter pack más lo que hayas prefetcheado" a "todo, siempre".

Lo que se pierde: la fidelidad cinematográfica de una escena compuesta cuadro a cuadro por un artista. Es un precio real y se paga a conciencia. A cambio, cada escena es manipulable, que es el corazón del producto.

**El nuevo rol de ManimGL** queda reducido a dos usos honestos, ambos fuera del producto: prototipar una escena en el escritorio antes de implementarla, y producir material de comunicación. No forma parte del build ni del runtime. [I](I-manim/I0-mapping.md) sigue siendo la especificación de la gramática visual y la tabla de correspondencia; deja de describir un pipeline.

## 2. El stack

Verificado contra documentación oficial, código fuente de los paquetes y mediciones propias en septiembre de 2026.

| Capa | Elección | Versión |
|---|---|---|
| Shell de app | Expo SDK 57, Metro también para web | `expo@57.0.21`, RN 0.86.3, React 19.2.3 |
| Render 2D | `@shopify/react-native-skia` | 2.11.2 (CanvasKit 0.41.0 en web) |
| Animación y estado por frame | `react-native-reanimated` + `react-native-worklets` | 4.6.0 / 0.12.2 |
| Gestos | `react-native-gesture-handler` | 3.2.1 |
| Álgebra simbólica | `@cortex-js/compute-engine` | 0.127.0 |
| Tipografía matemática | `@mathjax/src` **solo en build time** | 4.1.3 |

Un mismo proyecto Expo compila a las tres plataformas. En web, Skia se implementa sobre CanvasKit, un build WASM de Skia que dibuja por WebGL2; el árbol declarativo de escena es idéntico en las tres.

**Por qué Skia y no otra cosa.** Es el único stack que da un rasterizador único con calidad idéntica en las tres plataformas y, en nativo, ejecución fuera del hilo de JavaScript. Las alternativas se descartaron con evidencia: Motion Canvas está abandonado desde diciembre de 2024 y su `seek()` re-simula desde el frame cero, lo que hace imposible arrastrar el dedo hacia atrás sobre una escena; GeoGebra tiene licencia no comercial; un WebView con una librería web adentro introduce un puente asíncrono JSON entre motores, que a 60 fps con el dedo apoyado es descalificatorio; `expo-three` lleva dos años sin actualizarse.

### Lo que Skia no da en web, y cómo se resuelve

La versión web no implementa `Path.MakeFromText` ni `Paragraph.getPath`, que son justamente las dos APIs que convertirían un glifo en un trazo vectorial. Sin ellas, el camino "letra → path → morph" no puede apoyarse en Skia.

La salida es mejor que el problema. **MathJax v4, con `liteAdaptor` y `fontCache: 'none'`, emite un `<path d="...">` explícito por glifo, envuelto en `<g data-mml-node="mi|mo|mfrac|msup|…">` con el codepoint en `data-c`.** Es decir: el tipógrafo entrega el árbol semántico de la expresión, ya direccionable. Manim empareja submobjects por índice y por eso `TransformMatchingParts` falla cuando la estructura cambia; nosotros emparejamos por identidad de nodo, que es estrictamente más fuerte.

Y se hace **en build time**, no en el dispositivo: se hornea un atlas de glifos con sus contornos y métricas. Así desaparece la pregunta de si MathJax corre bajo Hermes, y el arranque no paga nada.

### El motor de composición

Del atlas horneado salen contornos y métricas; falta ubicarlos. Las expresiones de Mathy no son LaTeX arbitrario: son un lenguaje acotado (números, símbolos, operadores binarios, igualdad, fracción, potencia, raíz, aplicación de función, matriz, sumatoria, integral). Un motor de composición para *esa* gramática, con las métricas del atlas, es del orden de dos mil líneas, y se escribe por partes: los primeros hitos necesitan menos de trescientas.

Se escribe nuestro en vez de usar el de MathJax por una razón que no es de gusto: **la identidad de cada término tiene que venir del `MathTree`, no del tipógrafo**. Si el layout es nuestro, cada glifo en pantalla sabe de qué nodo del árbol salió, y el morph es exacto por construcción.

### El descubrimiento que abarata el morph

El punto más temido del proyecto era interpolar trazos entre formas distintas, que Skia solo permite si los dos trazos tienen los mismos comandos en el mismo orden. Resulta que **casi nunca hace falta.**

Cuando `x + 5 = 12` se convierte en `x = 7`, el `x` no cambia de forma: se traslada. El `+5` y el `−5` no se deforman: se acercan y se apagan. El `12` y el `−5` no se funden geométricamente: se mueven juntos y se cruzan en disolvencia con el `7`. **Identidad de término más interpolación de transformaciones cubre la enorme mayoría de las animaciones del juego**, y ninguna de esas operaciones necesita morphing de paths.

El morphing real queda para las transiciones entre capas, donde un cofre se convierte en una caja y una manzana en una `x`. Esos objetos son assets propios, así que **se dibujan desde el principio con la misma estructura de comandos que su destino**, y la interpolación es directa. Donde eso sea imposible, se hace lo mismo que hace Manim cuando el emparejamiento falla: disolvencia cruzada con desplazamiento.

Consecuencia práctica: `interpolatePaths` de Skia, que es un worklet y corre en el hilo de UI sin costo por frame, alcanza. No hace falta `flubber` en runtime.

## 3. Las dos restricciones duras

Salieron de la investigación y no son detalles de implementación: son restricciones de diseño de escena.

**Presupuesto de elementos.** Los reportes públicos de dispositivos reales dan un iPhone 12 mini sosteniendo diez mil sprites a 60 fps y un Android barato sosteniendo trescientos. La brecha es de treinta veces. **Toda escena de Mathy tiene que caber en el orden de trescientos elementos animados.** Las dos escenas en riesgo son la malla deformable con su malla fantasma y el campo vectorial; las dos se resuelven con primitivas de instanciación de Skia (`Vertices` para la malla, `Atlas` para las flechas) en vez de un objeto por elemento.

**Modo retained.** Skia ofrece dos modos: uno declarativo, donde el árbol de escena se compila a una lista de dibujo que Reanimated anima con costo de cruce de frontera casi nulo, y otro inmediato, donde se emiten comandos cada frame y se paga ese cruce. Una escena estilo Manim, donde los objetos aparecen y desaparecen todo el tiempo, deriva sola hacia el modo caro. **La regla es: el árbol de escena se mantiene estable y solo se animan los valores.** Un objeto que va a aparecer se crea desde el principio con opacidad cero. Nunca se monta ni se desmonta durante una animación.

Dos restricciones menores que igual condicionan: en Android Chrome hay un límite de ocho contextos WebGL vivos y Skia consume uno por cada lienzo, así que cada pantalla usa **un solo lienzo grande** y no varios chicos; y animar un radio de desenfoque de cero a veinte en iOS dispara compilación de shaders de Metal en medio de la animación, de decenas a cientos de milisegundos, así que el brillo estilo 3Blue1Brown se **precalienta fuera de pantalla al montar**.

## 4. Arquitectura de paquetes

La disciplina central es que **el modelo no sabe que existe Skia**. Los mobjects, la jerarquía, la identidad de términos, las transformaciones, los updaters y el reloj se escriben en TypeScript puro. La capa de dibujo es un adaptador delgado. No porque se vaya a escribir un segundo renderer, sino porque así el modelo se testea sin GPU y porque cuando WebGPU madure el juego no se reescribe.

```
apps/
  mathy/              app Expo única: iOS, Android y web
packages/
  math-core/          MathTree con ids estables, StepEngine, equivalencia,
                      clasificador de errores. TS puro, sin RN.
  glyphs/             atlas horneado (contornos y métricas) + el script de
                      horneado que corre MathJax en build time
  typeset/            motor de composición: MathTree -> caja posicionada,
                      con la identidad de cada nodo. TS puro.
  viz-core/           scene graph tipo Mobject, álgebra de animación,
                      rate functions, normalización de paths, reloj.
                      TS puro, sin importar nada de Skia.
  viz-skia/           adaptador: escena de viz-core -> árbol retained de Skia
  mechanics/          las doce mecánicas como escenas parametrizadas
  curriculum/         graph.json compilado, selector, fold de mastery
  persistence/        log de eventos, perfiles, sincronización
content/              YAML del diseño compilado a JSON para la app
tools/                validate.py (ya existe), bake-glyphs.ts
```

## 5. Las mecánicas son las unidades de construcción

El orden de implementación no sale de la espina sino de la cobertura por mecánica. Implementar una mecánica desbloquea todos sus minijuegos de golpe. Doce aparecen como principal en la espina (`sorter` solo como secundaria):

| Mecánica | Minijuegos | Niveles | Primer puesto en el recorrido |
|---|---:|---:|---:|
| chest_key | 8 | 61 | 5 |
| tiles | 6 | 44 | 4 |
| gears_sequence | 5 | 36 | 2 |
| grid_stretch | 5 | 33 | 13 |
| ledger | 4 | 28 | 1 |
| slope_walker | 4 | 32 | 22 |
| machine_pipe | 3 | 21 | 20 |
| construct | 3 | 24 | 30 |
| balance | 2 | 15 | 16 |
| urn_dice | 2 | 14 | 42 |
| network_routes | 1 | 7 | 12 |
| fill_accumulate | 1 | 8 | 36 |

**Cinco mecánicas cubren los primeros dieciséis conceptos**, que son 115 de los 323 niveles del juego. Eso define el primer hito de contenido.

## 6. Hitos

Cada hito termina con algo jugable en las tres plataformas y con un criterio de salida medible. No hay hito que solo produzca infraestructura.

### M0 — La prueba vertical

Lo único que importa es contestar la pregunta que decide el proyecto: **¿se puede animar una ecuación con identidad de término, a 60 fps, con el dedo, en las tres plataformas?**

Se construye el monorepo, la app Expo corriendo en iOS, Android y navegador, el núcleo mínimo de `viz-core`, el atlas de glifos para un juego de caracteres chico, el motor de composición para la gramática mínima (número, símbolo, operador binario, igualdad) y el adaptador de Skia. Y una sola escena: `x + 5 = 12`, se arrastra la ficha `−5` sobre el igual, y queda `x = 7` con el `x` trasladándose, el `+5` y el `−5` aniquilándose y el `12` fundiéndose en `7`.

**Criterio de salida.** Sesenta cuadros por segundo sostenidos en un Android de gama baja en build de release, no de depuración. Arranque en frío del navegador por debajo de tres segundos con el WASM servido con Brotli. Si esto no se cumple, se replantea el stack antes de escribir una línea más.

### M1 — El primer minijuego completo

La mecánica `chest_key`, el `StepEngine` con validación de equivalencia y una explicación de error dinámica, y los ocho niveles de `alg.eq.one_step` con su transición de capas: el cofre se convierte en caja, la caja en `x`, la barra de la balanza en `=`.

Se elige este nodo y no el primero del recorrido porque es el de calibración: su documento de diseño y su minijuego son los más desarrollados del corpus y sirven de patrón para los otros cuarenta y tres.

**Criterio de salida.** Un adulto puede jugar los ocho niveles de punta a punta, cometer los tres errores catalogados del nodo y recibir la explicación correcta en cada uno.

### M2 — Los primeros dieciséis conceptos

Las otras cuatro mecánicas de apertura (`ledger`, `gears_sequence`, `tiles`, `balance`) y sus minijuegos, hasta cubrir el recorrido desde contar hasta las ecuaciones de un paso. Son 115 niveles, el 38 % del contenido del juego.

Acá entra por primera vez el requisito de jugar sin leer: los nueve primeros conceptos son `literacy: none` y necesitan instrucción por demostración, narración por voz y objetivos de toque grandes.

**Criterio de salida.** Un chico de seis años juega la primera sesión sin que nadie le explique nada y sin leer una palabra.

### M3 — El motor de curriculum

El grafo compilado a JSON, el diagnóstico, el selector de actividad, el fold de mastery sobre el log de eventos y la persistencia local. Hasta acá el juego era una lista de niveles; desde acá es un sistema que decide qué jugar.

**Criterio de salida.** Mil jugadores sintéticos con perfiles paramétricos recorren el grafo sin violar nunca la regla de prerequisitos, sin dejar ningún nodo sin repaso y con el mastery convergiendo.

### M4 — Las siete mecánicas restantes

`grid_stretch`, `slope_walker`, `machine_pipe`, `construct`, `network_routes`, `urn_dice` y `fill_accumulate`. Acá entran las escenas pesadas: la malla deformable y el campo vectorial, que son las que ponen a prueba el presupuesto de trescientos elementos.

**Criterio de salida.** Los 44 minijuegos jugables. La malla deformable con su malla fantasma sostiene 60 fps en el Android de referencia.

### M5 — Las herramientas y los desafíos

La calculadora evolutiva, la cheatsheet incremental y los 79 desafíos con su motor de geometría sintética, que valida construcciones y datos descubiertos.

### M6 — Producto

Internacionalización con el `MathLocale`, accesibilidad, perfiles múltiples por dispositivo, privacidad infantil, y el pulido visual contra el sistema de diseño de [N](N-ux-ui.md).

## 7. Pacing y curva de aprendizaje

Medido sobre el corpus: 44 conceptos, 323 niveles, recorridos en orden topológico desempatado por nivel, que es el recorrido real del jugador y no coincide con la numeración de la espina.

| Hito para el jugador | Nivel | Sesión | Hora de juego |
|---|---:|---:|---:|
| El montón que tocó se convierte en un numeral | 6 | 1 | 0.2 |
| Aparece el primer signo de operación | 17 | 3 | 0.5 |
| Aparece la primera definición | 35 | 5 | 0.9 |
| La llave abre el primer cofre con notación | 42 | 6 | 1.1 |
| Cofre y balanza juntos: `x + 5 = 12` | 123 | 16 | 3.3 |
| La llave se vuelve función | 165 | 22 | 4.4 |
| Derivada | 251 | 33 | 6.7 |
| Transformación lineal | 294 | 39 | 7.8 |

Ocho horas de primera pasada. Con repasos, transferencia y desafíos, entre treinta y sesenta hasta el dominio.

**El gancho no es el álgebra.** El momento insignia del diseño, el cofre y la balanza juntos, cae en la sesión dieciséis: demasiado tarde para retener a nadie. El gancho real está en el nivel 6, cuando el montón que el jugador tocó se convierte en un numeral, y en el 17, cuando aparece el primer signo de operación. **El producto se construye alrededor de esos dos momentos**, y el de los cofres se trata como lo que es: la recompensa de haber jugado dieciséis sesiones, no la promesa de la primera.

### La primera sesión, minuto a minuto

Sin cuenta, sin tutorial, sin texto. Se abre y hay objetos. Una mano fantasma hace un gesto una vez y espera. El jugador imita. Algo se abre, algo suena, la mano no vuelve.

A los tres o cuatro minutos, el montón de objetos que viene agrupando se contrae en un numeral, con la misma animación que el resto del juego usará para pasar de una capa a la siguiente. Ese es el primer contrato visual del producto: **lo que tocaste se convirtió en el símbolo, delante tuyo, sin cortes**.

La sesión cierra mostrando lo que quedó: la primera entrada de la cheatsheet y, si corresponde, la primera tecla nueva de la calculadora.

### Qué trae de vuelta al jugador

El diseño prohíbe monedas, vidas, rachas y cuentas regresivas. Lo que queda, y es suficiente si se ejecuta bien:

- **El territorio que se ilumina.** El mapa es el grafo, y cada concepto en `ready` enciende una zona. El progreso es geográfico y se ve de un vistazo.
- **Las herramientas que crecen.** Cada concepto agrega teclas a la calculadora y entradas a la cheatsheet, y las dos son objetos que el jugador *usa*, no insignias que colecciona.
- **Los regresos.** La llave que abrió el primer cofre vuelve tres veces: en la función inversa, en la matriz inversa y en el teorema fundamental. El juego los pone en escena explícitamente, con el mismo dibujo. Es el momento de "esto ya lo hice", y es la recompensa emocional más fuerte que el diseño tiene.
- **El cierre de sesión.** Cada sesión termina mostrando qué se sumó ese día. Es la respuesta a "qué gané", sin premio extrínseco.
- **Los desafíos.** Picos opcionales, nunca obligatorios para avanzar.

### Tres desajustes del corpus que el plan asume

Medidos, no supuestos, y anotados acá porque condicionan la implementación:

1. **Las capas `abstract` y `transfer` no etiquetan ningún nivel** de los 323. La lectura que este plan adopta es que no son capas de nivel sino modos de evaluación: la transferencia es un slot del selector y la abstracción vive en la sección de generalización de cada minijuego. [H](H-progresion-abstraccion.md) debería decirlo.
2. **Las capas `real` e `intuition` suman doce niveles de 323**, y aparecen recién en los niveles 67 y 144. El diseño afirma que todo concepto arranca en el mundo real; en la práctica los minijuegos arrancan en la manipulación concreta y el mundo real vive en la prosa del documento de concepto. O se acepta, o faltan niveles iniciales en los 44 minijuegos.
3. **Treinta y cuatro generadores tenían sus parámetros sin nombrar** hasta hace poco. Ya están nombrados, pero conviene recordar que el contenido se genera con semilla y que ningún nivel tiene una lista fija de ejercicios.

## 8. Riesgos y spikes

Ordenados por lo que cambiarían si salen mal.

| # | Spike | Qué decide |
|---|---|---|
| 1 | La escena más pesada (malla deformable con malla fantasma) en un Android barato, en build de release | Si el presupuesto de trescientos elementos alcanza o hay que rediseñar las escenas de álgebra lineal |
| 2 | Adelgazar el WASM de web, en cuatro peldaños de menor a mayor costo (abajo) | Puede bajar el payload de 3.1 MB a cerca de 1.3 y sacar uno o dos segundos de la ruta crítica |
| 3 | Prototipo de emparejamiento por identidad en modo retained, atado al dedo | Si el corazón del producto es viable. Es M0 |
| 4 | Precalentamiento de shaders de Metal en un iPhone viejo | Si el brillo animado es usable en iOS o hay que cambiar el efecto |
| 5 | Un solo lienzo por pantalla | Si la arquitectura de UI sobrevive al límite de ocho contextos WebGL de Android Chrome |
| 6 | Expo Router con render estático más Skia en `expo export --platform web` | Si la build web de producción sale sin trabas |

El spike 2 es una escalera, y los dos primeros peldaños se hacen ya porque son casi gratis:

| Peldaño | Costo | Ganancia |
|---|---|---|
| Servir el WASM con Brotli y `Cache-Control: immutable` | trivial | 3.09 MB gzip pasa a unos 2.6 MB |
| Aliasear `canvaskit-wasm/bin/full/` a `canvaskit-wasm/bin/` en Metro y en `setup-skia-web` | una línea, más un test de `Vertices` | unos 350 KB. El paquete npm ya trae un build recortado sin Skottie ni codificadores de imagen, y Skia importa el completo sin necesidad |
| Cachear el módulo ya compilado en IndexedDB con `instantiateWasm`, más `WithSkiaWeb` para sacar Skia de la primera pantalla | medio día | uno o dos segundos en visitas repetidas |
| Compilar CanvasKit propio con `no_skottie no_font no_codecs no_paragraph` | días de toolchain C++ | cerca de la mitad, el territorio donde está Flutter en producción |

Medido: la compilación del WASM son 100 a 170 ms; todo lo demás es descarga. Las palancas son de red, no de CPU.

Dos decisiones que hay que tomar explícitamente y no por omisión:

- **Expo fija Skia 2.6.2, no 2.11.2.** Son cinco meses de diferencia. O se acepta el pin y se vive sin lo último, o se fuerza la versión nueva y se asume el riesgo de incompatibilidad con el resto de la matriz.
- **`manim-web` es MIT y su `svgPathParser.ts` y su modelo de línea de tiempo con acceso aleatorio valen oro.** Pero su autor admitió públicamente que el proyecto lo generó íntegramente un agente y hay bugs de render reportados y marcados como resueltos sin estarlo. Se mina, no se depende.

## 9. Criterio de terminado

Un hito está cerrado cuando: corre en las tres plataformas, pasa el validador del documento con cero errores, tiene tests de propiedad del motor simbólico y de instantánea de las descripciones de escena, y alguien que no lo escribió lo jugó en un dispositivo real.
