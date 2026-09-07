# O — Arquitectura técnica

Este documento define cómo se construye Mathy como app mobile. Cubre el stack de React Native, el renderer nativo de la gramática visual ("mini-Manim"), la representación de las ecuaciones como objetos, el motor matemático on-device, los módulos y sus fronteras, el flujo completo de una interacción, el pipeline de contenido, el pipeline de pre-render con Manim, privacidad, testing y riesgos. No contiene decisiones pedagógicas: esas viven en [K-evaluacion.md](K-evaluacion.md), [L-modelo-errores/L0-taxonomia.md](L-modelo-errores/L0-taxonomia.md) y [E-mecanicas/E0-catalogo.md](E-mecanicas/E0-catalogo.md). Tampoco contiene constantes numéricas del modelo de mastery: todas están en [K-evaluacion.md](K-evaluacion.md) y el código las importa de un único módulo.

Convención de este documento: cada versión de librería se marca como **verificada** (consultada en el registro correspondiente en septiembre de 2026) o **asumida** (elegida por criterio, pendiente de confirmar en el spike correspondiente). Las versiones verificadas también quedan obsoletas; lo que importa es la política de pineo, no el número.

## 1. La decisión de fondo

ManimGL es un renderer GPU de escritorio escrito en Python. La rama `master` migró a wgpu con shaders en WGSL; el paquete publicado en PyPI, `manimgl` 1.7.2, sigue construido sobre ModernGL y PyOpenGL (verificado). En ninguna de sus dos formas corre dentro de React Native ni en un navegador, y no expone una API de streaming que permita pedirle frames desde un cliente. Por lo tanto, Mathy no puede "usar Manim" en el sentido literal de ejecutarlo en el teléfono. Lo que sí puede hacer, y hace, es darle un rol dual y honesto: **(a)** ManimGL es la especificación de referencia de la gramática visual, es decir, el catálogo de objetos, animaciones y funciones de ritmo que define cómo se ve y cómo se mueve la matemática en Mathy, y esa gramática se reimplementa de forma nativa como un "mini-Manim" en TypeScript sobre Skia para toda la capa interactiva; **(b)** ManimGL es también la herramienta de autoría y pre-render, ejecutada en CI, para los clips explicativos que no requieren interacción y para las pocas escenas 3D reales que la [lista de espera de D0](D-curriculum/D0-mapa.md#lista-de-espera-para-3d) autoriza. No hay servidor de render bajo demanda en v1: agrega latencia, costo por alumno, un punto de falla offline y no resuelve el problema principal, que es que la interacción tiene que responder en el mismo frame en que el jugador arrastra.

### Las tres opciones evaluadas

| Opción | Qué es | A favor | En contra | Veredicto |
|---|---|---|---|---|
| Pre-render | Renderizar cada escena en CI con ManimGL y distribuir video | Fidelidad total a Manim; costo de runtime cero; sirve para 3D real | No es interactivo; un clip por variante de parámetros; volumen de assets; texto rasterizado rompe i18n | **Sí, acotado**: clips explicativos no interactivos y 3D real, sin texto en el clip |
| Servidor de render | Un backend con ManimGL que recibe parámetros y devuelve frames o video | Interactividad "aparente" con fidelidad Manim; nada de reimplementación | Latencia de cientos de ms por movimiento; imposible offline; costo por alumno; ManimGL sin API de streaming; escalado de GPUs | **No en v1**. Se reconsidera solo si aparece un caso que ni el nativo ni el clip cubren |
| Reimplementación nativa | Un scene graph y un sistema de animación en TypeScript sobre Skia que replica el subconjunto de ManimGL que Mathy usa | Interacción a 60 fps; offline; morph exacto sobre objetos con identidad; etiquetas por locale; un solo tema visual | Hay que escribirlo y mantenerlo; fidelidad al original solo por disciplina; sin 3D real | **Sí, es el núcleo**: toda mecánica corre acá |

### Ruteo por tipo de contenido

La decisión de ruta se toma por escena en [I-manim/scenes.yaml](I-manim/scenes.yaml) con el campo `route: nativo | pre-render`. Esta tabla es la regla que usa quien escribe una escena.

| Tipo de contenido | Ruta | Por qué |
|---|---|---|
| Cualquier mecánica de [E](E-mecanicas/E0-catalogo.md) (balanza, cofres, baldosas, construct...) | nativo | El jugador manipula; la respuesta tiene que ser inmediata y sobre su estado real |
| Morph de notación (🍎+🍎 → x+x → 2x) | nativo | Requiere identidad por nodo del `MathTree`; un video no tiene identidades |
| Explicación dinámica de una misconception ([L](L-modelo-errores/L0-taxonomia.md)) | nativo | Corre sobre la expresión real del alumno, que no se conoce en build |
| Gráficos de funciones, planos, campos vectoriales 2D, rectángulos de Riemann | nativo | Están en el catálogo de viz-core; se parametrizan en runtime |
| Ejes y vectores 3D simples, superficies "de lectura" | nativo, proyección 2.5D | Basta con proyectar; no hay cámara libre |
| Introducción narrativa de un nodo sin interacción | pre-render | Fidelidad de Manim, costo cero en runtime, se sirve con poster de respaldo |
| Escenas 3D con cámara, iluminación o superficies densas fuera de la allowlist de D0 | pre-render | El costo de un renderer 3D nativo no se justifica para escenas pasivas |
| Nodos de la allowlist 3D de D0 (seis nodos `mvcalc`, `linalg`, `geom.solid`, `calc2`) | nativo con escape hatch WebGPU + Three.js | Requieren manipular la superficie o el sólido, no solo verlo |
| LaTeX arbitrario que el layout propio no cubre | SVG pre-renderizado en build | Excepción explícita, no un camino normal (ver §4) |

## 2. Stack

| Capa | Elección | Versión | Estado |
|---|---|---|---|
| Framework | Expo SDK 56 con prebuild y dev client, New Architecture | SDK 56, React Native 0.85, React 19.2 | verificada (changelog de Expo, mayo 2026) |
| Lenguaje | TypeScript en modo `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | 5.x | asumida |
| Monorepo | pnpm workspaces + Turborepo para caché de builds | pnpm 10.x | asumida |
| Render 2D | `@shopify/react-native-skia` | 2.11.x (2.11.2 publicada) | verificada |
| Animación | `react-native-reanimated` + `react-native-worklets` | 4.6.x (soporta RN 0.83 a 0.87) | verificada |
| Gestos | `react-native-gesture-handler` | 2.x | asumida |
| 3D (escape hatch) | `react-native-webgpu` + Three.js | 0.9.x | verificada; el nombre anterior `react-native-wgpu` está deprecado y solo re-exporta el nuevo |
| UI animada opcional | Rive (`rive-react-native`) | última estable | asumida |
| Persistencia | `expo-sqlite` (event log) + `react-native-mmkv` (prefs) | MMKV 4.3.x, requiere `react-native-nitro-modules` | verificada |
| Estado | Zustand (stores de UI) + XState (máquina de actividad) | Zustand 5.x, XState 5.x | asumida |
| i18n | `i18next` + `react-i18next` + `intl-pluralrules`, `expo-localization`, `expo-updates` | últimas estables | asumida |
| CAS | `@cortex-js/compute-engine` | 0.125.0, pineada exacta | verificada; ver §5 y §12 |

Política de versiones: dependencias nativas pineadas a versión exacta y actualizadas solo junto con el salto de SDK de Expo, una vez por semestre. `compute-engine` es 0.x y se pinea exacta con un fork vendorizado listo por si una versión rompe el API. Expo SDK 56 sube el mínimo de iOS a 16.4 (verificado); el mínimo de Android lo fija el proyecto en API 26 (asumido) para cubrir dispositivos de gama baja.

### Por qué Skia y Reanimated

Skia dibuja paths, texto como glifos, transformaciones y shaders en un canvas propio, en el thread de UI, sin pasar por la jerarquía de vistas nativas. Eso es exactamente lo que un scene graph tipo Manim necesita: miles de paths que cambian cada frame. Reanimated aporta los shared values y los worklets, que son el mecanismo para que un updater o una interpolación corra en el thread de UI sin cruzar el bridge en cada frame. Skia lee shared values directamente desde sus props, así que la combinación es la de menor fricción disponible en React Native hoy.

### Rechazos justificados

- **react-native-svg.** Cada elemento es una vista nativa; con cientos de paths animados por frame, el costo de reconciliación mata el frame rate. Sirve para íconos estáticos de UI, no para el canvas.
- **WebView + canvas (HTML).** Doble runtime, latencia de gestos por el puente, sin acceso directo a shared values, y la deuda de mantener dos sistemas de tipos y dos pipelines de assets.
- **react-native-game-engine.** Un loop de juego sobre `setState` de React; la lógica corre en el thread JS y cada tick re-renderiza. No aporta nada que Reanimated no dé mejor.
- **Unity / Godot embebidos.** Toolchain paralela, binario de decenas de MB, integración frágil con la navegación y con i18n, y un equipo de tamaño distinto al de Mathy. No hay física ni mundo 3D abierto que lo justifique.
- **Lottie para objetos matemáticos.** Animaciones pre-horneadas sin parámetros ni identidad: un Lottie no puede mostrar la expresión real del alumno. Se acepta solo para microinteracciones de UI si Rive no se adopta.

## 3. mini-Manim nativo (viz-core)

`viz-core` es un paquete de TypeScript puro, sin dependencias de React Native, que define el scene graph, las animaciones y las primitivas matemáticas. `viz-skia` es el adaptador que lo dibuja con Skia y lo anima con Reanimated. La separación permite testear viz-core en Node y renderizarlo, si hiciera falta, en otro backend (por ejemplo un canvas web para las herramientas de autoría).

### Scene graph tipo Mobject

El objeto base es `Mobject`: tiene un id estable, una lista de puntos o paths, estilo (stroke, fill, opacidad), una transformación local y una lista de hijos. Las clases derivadas replican las de ManimGL en lo que Mathy usa: `VMobject` para paths vectoriales, `Group`, `Text` (etiquetas por locale, nunca dentro de un clip), `MathMobject` (ver §4), `NumberLine`, `Axes`, `NumberPlane`, `ComplexPlane`, `FunctionGraph`, `Arrow`, `Vector`, `Brace`, `DecimalNumber`, `Dot`, `Line`, `Polygon`, `Arc`, `Angle`. Cada Mobject conoce su bounding box y expone `getCenter`, `nextTo`, `alignTo`, `shift`, `scale`, `rotate`, con la misma semántica que en ManimGL para que el autor de una escena pueda leer código de Manim y escribir el equivalente sin traducir mentalmente.

El scene graph es inmutable por frame: una animación no muta el Mobject sino que produce una función `t → estado`, y el renderer materializa el estado del frame. Eso hace que el mismo scene graph sirva para el replay de una explicación, para un snapshot de test y para el `handoff` desde un clip pre-renderizado.

### Animaciones

| Animación | Semántica | Implementación |
|---|---|---|
| `Transform(a, b)` | Interpola la forma de `a` hacia `b` | Ambos paths se normalizan con `PathAlign` (mismo número de subpaths y de puntos de control) y se interpolan punto a punto |
| `TransformMatchingIds(a, b)` | Interpola por identidad de nodos del `MathTree`; lo que existe en ambos se mueve, lo nuevo aparece, lo que sobra desaparece | El equivalente de `TransformMatchingParts` de ManimGL, pero con ids estables en lugar de coincidencia de strings |
| `Write(m)` | Dibuja el path progresivamente | Recorte de path (`trim` de Skia) más aparición del relleno al final |
| `FadeIn / FadeOut` | Opacidad, con desplazamiento opcional | Interpolación de opacidad y posición |
| `Indicate(m)` | Escala y colorea brevemente | `there_and_back` sobre escala y color |
| `LaggedStart(anims, lag)` | Arranca cada animación con un desfase | Composición de timelines con offset |
| `Succession(anims)` | Una después de otra | Timeline secuencial |
| `MoveAlongPath(m, path)` | Mueve un Mobject a lo largo de un path | Muestreo por longitud de arco |

Las animaciones se componen en un `Timeline` que es un objeto serializable: lista de tracks con inicio, duración, rate function y target. El Timeline es lo que se ejecuta con Reanimated en runtime y lo que se guarda en un snapshot de test.

### Updaters sobre shared values

En ManimGL, `always`, `f_always` y `always_redraw` reconstruyen un Mobject en cada frame a partir de un `ValueTracker`. En Mathy, el `ValueTracker` es un shared value de Reanimated y el updater es un worklet: `alwaysRedraw(tracker, (v) => tangentLineAt(graph, v))`. Cuando el jugador arrastra un punto sobre una gráfica, el shared value cambia en el thread de UI y la recta tangente se recalcula en el mismo frame sin tocar JS. Es la pieza que hace que `counterexample_slider` de [L](L-modelo-errores/L0-taxonomia.md) sea fluido en un teléfono de gama baja.

### Rate functions

Se portan de ManimGL, con la misma firma `(t: number) => number` y los mismos nombres, las quince siguientes: `linear`, `smooth`, `rush_into`, `rush_from`, `slow_into`, `double_smooth`, `there_and_back`, `there_and_back_with_pause`, `running_start`, `overshoot`, `not_quite_there`, `wiggle`, `squish_rate_func`, `lingering`, `exponential_decay`. La suite de tests compara cada una contra valores tabulados de la implementación de referencia en Python en 101 puntos del intervalo `[0, 1]` con tolerancia `1e-9`, de modo que un clip pre-renderizado y una escena nativa tengan el mismo ritmo cuando se hace el handoff. `smooth` es el default de toda animación, como en ManimGL.

### Primitivas matemáticas

- **`NumberPlane` / `Axes` / `ComplexPlane`.** Grillas con paso configurable, etiquetas por `MathLocale`, y un método `c2p` (coordenadas a puntos) que todo lo demás usa.
- **`FunctionGraph`.** Muestreo adaptativo de `f` con subdivisión donde la curvatura es alta y detección de discontinuidades por salto; devuelve un `VMobject`.
- **`RiemannRects`.** Rectángulos bajo una gráfica con `dx` variable; `dx` es un shared value para que el alumno lo reduzca con un gesto y vea la acumulación converger.
- **`VectorField`.** Flechas sobre una grilla; el color codifica magnitud y siempre va acompañado de longitud (regla de daltonismo de [Q](Q-edad-universal.md)).
- **Deformación de malla.** Una `NumberPlane` con una transformación aplicada. Si la transformación es afín (una matriz 2×2 más traslación), es gratis: se aplica como transformación del canvas de Skia y las líneas siguen siendo líneas. Si es no lineal (`ApplyComplexFunction`, `Homotopy`), cada línea de la grilla se remuestrea punto a punto con un nivel de detalle (LOD) que depende del tamaño en pantalla: 8 puntos por celda en gama baja, 32 en gama alta, decidido por un presupuesto de frame medido al arrancar la app.
- **Proyección 2.5D.** Una cámara ortográfica fija, con rotación por dos ángulos, proyecta puntos 3D a 2D y ordena los Mobjects por profundidad. Sirve para `ThreeDAxes`, vectores en 3D, cortes de superficies y cualquier cosa que se mire pero no se manipule en 3D. Lo que necesita más que eso está en la allowlist de D0 y usa el escape hatch WebGPU.

### Mapping ManimGL → equivalente nativo

Solo se usan nombres confirmados en el código fuente de ManimGL. Nombres que existen en ManimCE pero no en ManimGL (`Create`, `MathTex`, `LinearTransformationScene`, `Graph`, `Table`, `get_area`, `get_secant_slope_group`) no aparecen en Mathy; [I-manim/I0-mapping.md](I-manim/I0-mapping.md) los lista como prohibidos y el validador de escenas los rechaza.

| ManimGL | viz-core | Notas |
|---|---|---|
| `ShowCreation` | `Write` | Mismo recorte de path; `Write` en Mathy cubre ambos usos |
| `Transform`, `ReplacementTransform` | `Transform` | En un scene graph inmutable, la distinción original no existe |
| `TransformMatchingParts`, `TransformMatchingStrings`, `TransformMatchingTex` | `TransformMatchingIds` | Coincidencia por id de nodo del `MathTree`, no por substring |
| `FadeIn`, `FadeOut` | `FadeIn`, `FadeOut` | Idénticos |
| `Indicate`, `Flash`, `CircleIndicate` | `Indicate`, `Flash`, `CircleIndicate` | Idénticos |
| `LaggedStart`, `Succession` | `LaggedStart`, `Succession` | Idénticos |
| `MoveAlongPath` | `MoveAlongPath` | Idéntico |
| `ApplyMatrix` | `applyAffine` sobre `NumberPlane` | Transformación del canvas, sin remuestreo |
| `ApplyComplexFunction`, `Homotopy` | `deformMesh` con LOD | Remuestreo por punto |
| `ValueTracker` | shared value | Reanimated |
| `always`, `f_always`, `always_redraw` | `alwaysRedraw` (worklet) | Corre en el thread de UI |
| `NumberPlane`, `Axes`, `ComplexPlane` | `NumberPlane`, `Axes`, `ComplexPlane` | Etiquetas por `MathLocale` |
| `ThreeDAxes` | `ThreeDAxes` con proyección 2.5D | Cámara fija |
| `Axes.get_graph` | `FunctionGraph` | Muestreo adaptativo |
| `get_riemann_rectangles` | `RiemannRects` | `dx` como shared value |
| `get_area_under_graph` | `AreaUnderGraph` | Path cerrado con relleno |
| `get_tangent_line` | `tangentLineAt` | Diferencia central numérica o derivada simbólica si el `MathTree` la tiene |
| `VectorField` | `VectorField` | Grilla de flechas |
| `StreamLines` | `StreamLines` | Integración RK4 sobre la grilla, precomputada por escena |
| `Matrix` | `MatrixMobject` | Un `MathMobject` con layout de matriz |
| `Surface`, `ParametricSurface` | `SurfaceWire` (2.5D, malla de alambre) o escena WebGPU | Solo la allowlist de D0 tiene superficie sólida interactiva |
| `Brace` | `Brace` | Path paramétrico escalable |
| `DecimalNumber` | `DecimalNumber` | Formateado por `MathLocale` |
| `TracedPath` | `TracedPath` | Acumula puntos del shared value |
| `Tex` (modo math), `TexText` | `MathMobject`, `Text` | Ver §4; nunca un string LaTeX en runtime |

## 4. Ecuaciones como objetos

En Mathy la expresión que se ve en pantalla no es un string de LaTeX renderizado. Es un `MathTree`: un árbol en formato MathJSON donde cada nodo tiene un id estable. `x + 5 = 12` es `["Equal", ["Add", x#a1, 5#a2], 12#a3]` y el `5` conserva `a2` cuando el alumno lo mueve, lo cancela o lo transforma. Esa identidad es lo que hace posible que 🍎+🍎 se convierta en `x+x` y luego en `2x` con un morph continuo en el que cada glifo sabe de dónde viene. Un renderer de LaTeX produce píxeles sin identidad y obliga a reemplazar pantallas, que es exactamente lo que [N-ux-ui.md](N-ux-ui.md) prohíbe.

### Motor de layout

El layout es propio y cubre un subconjunto del box model de TeX. Cada nodo del `MathTree` se convierte en una caja con ancho, altura y profundidad, y las cajas se componen con estas reglas:

- **hlist**: secuencia horizontal con espaciado por clase de átomo (ord, op, bin, rel, open, close, punct), tomado de las tablas de TeX.
- **Fracción**: numerador y denominador centrados sobre una barra a la altura del eje matemático de la fuente.
- **Superíndice y subíndice**: desplazamientos verticales y reducción de tamaño según los parámetros `MATH` de la fuente OTF.
- **Radical**: el glifo se toma de la tabla de variantes verticales de la fuente y se extiende con el ensamblaje de glifos.
- **Delimitadores extensibles**: paréntesis, corchetes, llaves y barras que crecen con el contenido, usando los ensamblajes de la tabla `MATH`.
- **Matrices**: columnas alineadas con separación configurable, delimitadores extensibles a los lados.
- **Filas alineadas**: varias ecuaciones alineadas por el signo `=`, para mostrar una traza de pasos.
- **Fichas iconográficas**: un nodo puede declararse `concrete` y en lugar de un glifo se dibuja un asset propio (🍎, cofre, llave) con la misma caja que tendría el símbolo al que va a morfar. Así la capa `concrete` de [H-progresion-abstraccion.md](H-progresion-abstraccion.md) usa el mismo layout que la capa `symbolic`.

Lo que el layout no cubre (alineaciones complejas, entornos exóticos, notación de teoría de categorías) se pre-renderiza a SVG en build con un TeX real y se incrusta como `VMobject` estático sin ids internos. Es una excepción documentada por escena, no un camino normal.

### Fuente y dibujo

La fuente es una OTF con tabla `MATH`: Latin Modern Math (licencia GUST Font License) o STIX Two Math (SIL Open Font License), decisión pendiente en el spike de tipografía de §12 y sujeta a que la licencia elegida permita el empaquetado en una app comercial (ambas lo permiten con atribución; asumido, a confirmar por revisión legal). Los glifos se extraen a paths con `opentype.js` en build, se guardan como un atlas de paths por glifo y se dibujan como `Path` de Skia. No se usa el rasterizador de texto de Skia para matemática porque el morph necesita el path, no el bitmap. El texto de UI, en cambio, sí usa `Paragraph` de Skia o componentes nativos.

### Morph exacto por identidad

`TransformMatchingIds` recorre los dos `MathTree`. Para cada id presente en ambos, interpola la caja y el path del glifo; si el glifo cambia (🍎 → `x`), se usa `PathAlign` para dar a ambos paths el mismo número de subpaths y de puntos de control y se interpola. Los ids que solo existen en el destino aparecen con `FadeIn`; los que solo existen en el origen desaparecen con `FadeOut`. Cuando una regla del `StepEngine` fusiona dos nodos en uno (`x + x → 2x`), la traza declara `merged: [a1, a4] → a9`, y el morph mueve ambos hacia la posición del nuevo nodo antes de desvanecerlos. `PathAlign` implementa la normalización de ManimGL (`align_points`, con inserción de puntos por longitud de arco) y además elige la rotación de inicio del subpath que minimiza la distancia total, para que un círculo no se morfe a otro dando una vuelta innecesaria.

### `MathLocale`

La notación depende del idioma, y no del mismo modo que la UI. `sen` frente a `sin`, `tg` frente a `tan`, coma o punto decimal, `log` como base 10 o natural, `[a, b[` frente a `[a, b)`, la disposición de la división larga. Todo esto vive en un objeto `MathLocale` que consume el layout, la calculadora y `DecimalNumber`, y que se elige de forma independiente del locale de UI: una familia puede usar la interfaz en inglés y la notación escolar del país. La notación matemática es siempre LTR aunque la UI sea RTL. La lista completa de campos está en [P-internacionalizacion.md](P-internacionalizacion.md).

## 5. Math engine on-device

### compute-engine detrás de un `StepEngine` propio

`@cortex-js/compute-engine` 0.125.0 (verificada, MIT) provee MathJSON, forma canónica, simplificación, evaluación numérica, derivación e integración simbólica básica. Es la única dependencia externa del motor. Pero el alumno no habla con un CAS: habla con un `StepEngine` que expone un vocabulario cerrado de movimientos, valida cada uno, produce una traza con ids para el morph y decide equivalencia. compute-engine declara `engines.node >= 22.3` (verificado), lo que sugiere uso de features recientes de ECMAScript; correrlo en Hermes es el primer spike de §12.

### Vocabulario de movimientos

| Movimiento | Qué hace | Mecánica típica |
|---|---|---|
| `ApplyBothSides(op, term)` | Aplica una operación a ambos lados de una igualdad | balance |
| `MoveTerm(id, side)` | Azúcar sobre `ApplyBothSides` con la inversa del término; registra que fue un "pasaje" | balance |
| `CombineLike(ids)` | Fusiona términos semejantes | ledger |
| `Distribute(id)` | Expande un producto sobre una suma | tiles |
| `Factor(ids)` | Inverso de `Distribute` | tiles |
| `Cancel(id, id)` | Cancela un par inverso | chest_key |
| `Expand(id)` | Expande potencias y productos | tiles |
| `Substitute(id, expr)` | Reemplaza una variable por una expresión | machine_pipe |
| `Differentiate(id, var)` | Deriva un subárbol | slope_walker |
| `Integrate(id, var)` | Integra un subárbol | fill_accumulate |
| `RowOp(i, j, k)` | Operación de fila sobre una matriz | balance |
| `Construct.DrawSegment(p, q)` | Traza un segmento entre dos puntos existentes | construct |
| `Construct.DropPerpendicular(p, line)` | Baja una perpendicular desde un punto a una recta | construct |
| `Construct.MarkEqual(a, b)` | Afirma que dos segmentos o ángulos son iguales | construct |
| `Construct.ExtendLine(seg, len)` | Prolonga un segmento | construct |
| `Construct.ReflectCopy(shape, axis)` | Refleja una copia de una figura | construct |

Cada movimiento devuelve un `StepResult` con el `MathTree` nuevo, la traza de ids (`kept`, `created`, `removed`, `merged`) y el veredicto de equivalencia. Un movimiento no listado no existe: la interacción solo puede emitir Intents de este vocabulario.

### Equivalencia en tres etapas

1. **Canónico.** Ambos árboles se canonicalizan con compute-engine y se comparan con `isSame`. Resuelve el 90 % de los casos en microsegundos.
2. **Diferencia simplificada.** Se construye `simplify(a − b)` (para ecuaciones, la diferencia de cada lado tras despejar); si el resultado es `0`, son equivalentes.
3. **Muestreo numérico con guardas de dominio.** Se evalúan ambos en 12 puntos aleatorios por variable, dentro del dominio declarado por el nodo (evita `sqrt` de negativos, `log` de cero, división por cero) y con muestras adicionales cerca de ceros y de asíntotas. Si todas coinciden con tolerancia relativa `1e-9`, se declara `Equivalent` con marca `numeric`. Si alguna difiere, `NotEquivalent`. Si el dominio no permite muestrear o hay `NaN` en todos los puntos, `Undecidable`.

El resultado es un tipo cerrado: `Equivalent | NotEquivalent | Undecidable`. La equivalencia se evalúa contra el estado previo del alumno (¿el movimiento conservó la ecuación?) y no contra la solución esperada: un camino válido distinto al esperado es válido.

**UX de `Undecidable`.** El juego no bloquea ni acusa. La balanza queda horizontal pero con un halo de "no sé" y la narración dice "no puedo comprobarlo; probemos con números". Se abre un `counterexample_slider` con la expresión del alumno y la anterior; el alumno mueve el deslizador y ve si coinciden. El evento se registra con `verdict: undecidable` y no cuenta como evidencia ni positiva ni negativa. Los casos `Undecidable` se agrupan en el event log y son la fuente principal de reglas nuevas para el `StepEngine`.

### Heurística de progreso hacia la meta

Además de "¿fue válido?" el motor estima "¿acerca a la meta?". Para ecuaciones, la métrica es la profundidad del árbol alrededor de la incógnita más el número de apariciones de la incógnita; un paso que la reduce es progreso, uno que la aumenta es un rodeo. Para expresiones, es el tamaño del árbol canónico. Para geometría, es la cantidad de datos desconocidos que quedan por descubrir. Un rodeo válido no se penaliza; solo cambia la pista que el sistema ofrece si el jugador pide ayuda.

### Clasificador de errores: buggy rules

Las reglas `detect` de [L](L-modelo-errores/L0-taxonomia.md#cómo-funciona-detect) son reglas de reescritura: `from → to` con `correct` y `guard`. En build, cada patrón se compila a MathJSON con metavariables. En runtime, ante un `NotEquivalent`, el clasificador:

1. arma el vecindario conceptual del nodo activo consultando `knowledge-graph` (misconceptions del nodo, de sus prerequisitos directos y de sus sucesores directos);
2. unifica el `from` de cada regla con el estado previo real del alumno;
3. instancia el `to` y lo compara canónicamente (misma cadena de tres etapas) con el resultado del alumno;
4. si coincide, emite la misconception con confianza alta; si coinciden varias, la de mayor severidad;
5. si ninguna coincide, calcula el diff estructural entre árbol previo y resultado y elige la regla del vecindario con la forma de diff más parecida (distancia de edición de árboles sobre la firma de operadores), con confianza baja. Confianza baja alimenta la minería pero nunca el bloqueo de `ready`.

Una regla en el YAML de contenido se ve así:

```yaml
- id: inverse_applied_one_side
  category: procedural
  nodes: [alg.eq.one_step, prealg.eq.balance]
  detect:
    from: "x + a = b"
    to: ["x = b", "x + a = b - a"]
    correct: "x = b - a"
  pattern: replay_on_mechanic
  mechanic: balance
  severity: 3
```

El build la compila a MathJSON con metavariables tipadas (`a`, `b` numéricas; `x` incógnita) y la guarda en `graph.json` junto con el nodo.

### Motor de geometría sintética

Los desafíos de [S](S-desafios/S0-desafios.md) y la mecánica `construct` no necesitan un CAS: necesitan un modelo de la figura. El motor sintético mantiene un conjunto de puntos con coordenadas (la figura tiene una realización numérica oculta), segmentos, ángulos y una base de hechos derivados: igualdades de longitud, igualdades de ángulo, perpendicularidad, paralelismo, colinealidad, concurrencia. Cada construcción del vocabulario `Construct.*` agrega objetos y dispara reglas de derivación simples: bajar una perpendicular crea un ángulo recto; dos ángulos rectos y un lado común implican un triángulo rectángulo; una reflexión crea segmentos iguales; una paralela por un punto crea ángulos alternos iguales. Un `MarkEqual` del alumno se valida contra la realización numérica (con tolerancia) y contra la base de hechos: si es numéricamente cierto pero no está derivado, se acepta como "dato descubierto pendiente de justificación" y el juego pregunta qué construcción lo justifica; si es numéricamente falso, es `assumed_equal_segments` o `assumed_right_angle` de la taxonomía de S. Cada dato descubierto se compara con la lista de datos faltantes del desafío. No hay demostración automática general: las reglas de derivación son un conjunto cerrado escrito a mano y suficiente para los desafíos del contenido inicial, y un desafío nuevo que necesite una regla nueva la agrega al conjunto.

### SymPy solo en CI

SymPy no corre en el teléfono. Es el oráculo con el que se verifican en CI las fixtures del `StepEngine`: cada regla `detect`, cada movimiento del vocabulario y cada caso de equivalencia tiene un test cuyo resultado esperado lo produce SymPy, y el motor de TypeScript tiene que coincidir. Así se detectan divergencias de compute-engine sin depender de un servidor.

### Comparación breve

| Alternativa | Por qué no (o por qué sí) |
|---|---|
| `mathjs` | Excelente evaluador numérico y parser; simplificación simbólica limitada y sin forma canónica seria. Se descarta como núcleo; se admite como evaluador de respaldo si compute-engine falla en Hermes |
| `nerdamer` | Capacidad simbólica razonable, pero API basada en strings, sin árbol con ids, mantenimiento lento |
| `algebrite` | Port de Eigenmath en JS; cubre bastante, pero el árbol interno es opaco y el bundle es grande |
| Custom desde cero | Control total, pero rehacer canonicalización, simplificación y derivación lleva meses y es un proyecto en sí. Se reserva como plan B parcial: el `StepEngine` ya es propio, y solo la simplificación depende de la librería |
| Backend SymPy | La opción más potente, pero rompe offline, agrega latencia a cada movimiento y costo por alumno. Queda como oráculo de CI |
| **compute-engine** | Árbol MathJSON nativo, canonicalización, simplificación, derivación, licencia MIT, TypeScript. Riesgo: versión 0.x y compatibilidad con Hermes. **Elegida con spike** |

## 6. Módulos y fronteras

```
                         ┌──────────────────────────────────────────┐
                         │             apps/mobile (Expo)           │
                         │  pantallas · navegación · audio/TTS      │
                         └───────┬──────────────┬───────────────────┘
                                 │              │
                 ┌───────────────▼───┐   ┌──────▼──────────────┐
                 │   game-engine     │   │   interaction        │
                 │ XState actividad  │◄──┤ gestos → hit-test    │
                 │ loop Reanimated   │   │ → Intent             │
                 │ registro minijuegos│  └──────────────────────┘
                 └──┬─────┬──────┬───┘
                    │     │      │
      ┌─────────────▼┐ ┌──▼────────────┐ ┌─▼──────────────────────┐
      │  math-engine │ │ viz-skia      │ │ curriculum-engine       │
      │ StepEngine   │ │ (RN + Skia)   │ │ diagnóstico · selector  │
      │ equivalencia │ │      │        │ └─┬──────────────┬────────┘
      │ clasificador │ │ ┌────▼──────┐ │   │              │
      │ geometría    │ │ │ viz-core  │ │ ┌─▼────────────┐ ┌─▼──────────────┐
      │ sintética    │ │ │ (TS puro) │ │ │ knowledge-   │ │ user-model /   │
      └──────┬───────┘ │ └───────────┘ │ │ graph        │ │ progression    │
             │         └───────────────┘ │ graph.json   │ │ fold eventos → │
             │                           │ ConceptId    │ │ mastery ×6     │
             │                           └──────────────┘ └─┬──────────────┘
      ┌──────▼──────────┐  ┌─────────────┐  ┌────────────┐  │
      │ cheatsheet      │  │ challenges  │  │ persistence│◄─┘
      │ árbol por tema  │  │ estados     │  │ sqlite log │
      └─────────────────┘  └─────────────┘  │ MMKV prefs │
                                            └────────────┘
      ┌──────────────────────────────────────────────────┐
      │ i18n (i18next + ICU + expo-localization)          │  transversal
      │ audio/TTS por locale                              │
      └──────────────────────────────────────────────────┘
```

| Paquete | Responsabilidad | Importa React Native |
|---|---|---|
| `game-engine` | Máquina de actividad en XState (estados `intro → play → feedback → summary`, serializable para reanudar), loop de frame en Reanimated, registro de minijuegos por id | sí (Reanimated) |
| `interaction` | Convierte gestos de gesture-handler en `Intent` tipados mediante hit-test sobre el scene graph; targets de 44 pt mínimo en niveles 0 a 2 | sí |
| `math-engine` | `StepEngine`, equivalencia, clasificador, motor de geometría sintética, `MathLocale` para parsear entrada | no |
| `viz-core` | Scene graph, animaciones, rate functions, primitivas, layout matemático | no |
| `viz-skia` | Renderer de viz-core con Skia y Reanimated; carga de atlas de glifos; reproductor de clips con overlay de etiquetas | sí |
| `curriculum-engine` | Diagnóstico por búsqueda binaria sobre la espina y selector diario de [J-adaptativo.md](J-adaptativo.md); consume el estado de `user-model` | no |
| `knowledge-graph` | `graph.json` compilado, tipo `ConceptId` como unión literal generada, consultas (prereqs, clausura, vecindario, `unlocks`) | no |
| `user-model` | Fold determinista `(estado, evento) → estado` que produce las seis dimensiones por nodo con las constantes importadas de K, el perfil de misconceptions, los desbloqueos de calculadora y las entradas de cheatsheet alcanzadas | no |
| `cheatsheet` | Árbol tema → subtema → entradas; una entrada se agrega cuando el fold registra la primera vez que el nodo llegó a `symbolic` o `formal`; cada entrada enlaza de vuelta al minijuego ([R](R-cheatsheet/R0-cheatsheet.md)) | no |
| `challenges` | Estado por desafío: `locked / available / solved_no_hints / solved_hints / seen`; pistas graduadas; validación con el motor sintético ([S](S-desafios/S0-desafios.md)) | no |
| `persistence` | Event log append-only en expo-sqlite (tabla `events(id, profile_id, ts, type, payload, device_id)`), prefs y bitsets en MMKV, exportación e importación; sync como unión de eventos por `(device_id, id)` | sí |
| `i18n` | i18next con ICU, detección con expo-localization, bundles de locale por expo-updates, pseudo-locale `en-XA` en dev | sí |
| `audio` | Narración TTS por locale con `expo-speech` (asumido) y assets de voz grabada para nodos `literacy: none` cuando existan | sí |

Reglas de frontera, verificadas por lint de dependencias en CI:

1. Los paquetes marcados "no" no pueden importar `react-native`, `react`, ni ningún paquete que los importe. Se testean en Node con Vitest.
2. `math-engine`, `viz-core`, `user-model`, `curriculum-engine` y `knowledge-graph` son deterministas: misma entrada, misma salida. El azar entra por un `seed` explícito en el evento.
3. El mismo paquete `user-model` corre en el cliente y en el servidor de sync, si existiera. Por eso mastery no se guarda: se recalcula plegando eventos, y un cambio de constantes en K se aplica de forma retroactiva y consistente.
4. Ningún paquete lee constantes numéricas del modelo de mastery salvo `user-model`, que las importa del módulo `constants.ts` generado a partir de la tabla de [K-evaluacion.md](K-evaluacion.md).

## 7. Flujo de una interacción

### (a) Movimiento válido: restar 5 a ambos lados de `x + 5 = 12`

1. La actividad está en estado `play` de la máquina XState. El scene graph muestra la balanza en etapa `tokens` con el `MathTree` `["Equal", ["Add", x#a1, 5#a2], 12#a3]`.
2. El jugador arrastra la ficha "−5" del teclado de fichas hasta el centro de la balanza (zona que significa "ambos platos"). `interaction` hace hit-test sobre el scene graph, reconoce la zona y emite `Intent { kind: "ApplyBothSides", op: "Subtract", term: 5 }`.
3. `game-engine` pasa el Intent a `StepEngine.apply(state, intent)`.
4. El `StepEngine` produce el árbol `["Equal", ["Add", x#a1, 5#a2, -5#a4], ["Add", 12#a3, -5#a5]]`, corre equivalencia contra el estado previo (`Equivalent` en la etapa canónica), aplica la simplificación automática del nodo (`Cancel(a2, a4)`, `CombineLike(a3, a5)`) y devuelve el árbol final `["Equal", x#a1, 7#a6]` con la traza `{ kept: [a1], created: [a4, a5, a6], removed: [a2, a3, a4, a5], merged: [[a3, a5] → a6] }` y `progress: +2`.
5. `viz-core` traduce la traza a un Timeline: `LaggedStart(FadeIn(a4), FadeIn(a5))`, después `Indicate(a2, a4)` y `FadeOut` de ambos, después `TransformMatchingIds` que mueve `a3` y `a5` hacia `a6`. Rate function `smooth`, duración total 1.2 s. `viz-skia` lo ejecuta en el thread de UI.
6. `game-engine` emite el evento `{ type: "step", node: "alg.eq.one_step", verb: "manipulate", result: 1, latency_ms: 4200, intent, verdict: "equivalent" }` a `persistence`, que lo agrega al log.
7. `user-model` pliega el evento: actualiza A con `ALPHA_A`, S con el resultado de comparar la latencia con `t_star`, y recalcula el estado del nodo. Si pasó a `ready`, se habilitan los `calc_unlocks` y se marca el evento derivado.
8. Al cerrar la actividad, `curriculum-engine` recibe el estado nuevo y el selector decide la siguiente actividad de la sesión según las prioridades de [J-adaptativo.md](J-adaptativo.md).

### (b) Movimiento no equivalente: restar 3 solo al lado izquierdo

1. Mismo estado inicial. El jugador arrastra "−3" al plato izquierdo solamente. `interaction` emite `Intent { kind: "ApplyOneSide", side: "lhs", op: "Subtract", term: 3 }`. Este Intent existe en el vocabulario porque la mecánica `balance` permite hacerlo: el juego no impide el error, lo muestra.
2. `StepEngine.apply` produce `["Equal", ["Add", x, 5, -3], 12]`, corre equivalencia y obtiene `NotEquivalent` (la etapa canónica ya lo distingue; el muestreo numérico lo confirma).
3. Se invoca el clasificador con el vecindario de `alg.eq.one_step`: `sign_flip_on_move`, `wrong_inverse_choice`, `inverse_applied_one_side`, `equals_as_operator` y las de sus sucesores. La regla de `inverse_applied_one_side` unifica `from: x + a = b` con `a = 5, b = 12`; su segundo `to` (`x + a = b - a`) no coincide porque el alumno restó 3 y no 5, pero el diff estructural (un término agregado en un solo lado, ninguno en el otro) es la forma característica de esa regla, y el fallback la elige con confianza baja. Si el alumno hubiera restado 5 solo a la izquierda, la coincidencia habría sido exacta y de confianza alta.
4. El evento `{ type: "step", verdict: "not_equivalent", misconception: "inverse_applied_one_side", confidence: "low" }` va al log. Con confianza baja no cuenta para el bloqueo de `ready`; con alta, sí.
5. El patrón `replay_on_mechanic` corre sobre la expresión real del alumno: la balanza recibe la ficha −3 en el plato izquierdo, se inclina con `there_and_back_with_pause` sobre la rotación, la ficha del otro plato brilla con `Indicate`. La narración dice el prompt de `misconceptions.inverse_applied_one_side.prompt` con los valores sustituidos, en quince palabras o menos, por TTS del locale.
6. El patrón declara `reopens_interaction: true`, así que la máquina vuelve a `play` con la balanza inclinada y el `MathTree` real (`x + 2 = 12` en un plato, `12` en el otro, marcados como desiguales). La pregunta es "¿qué hacemos ahora?". El jugador puede arrastrar −3 al plato derecho (y llegar a `x + 2 = 9`, válido, desde donde sigue) o deshacer. No hay reinicio ni pantalla de error.

### (c) Un paso de desafío geométrico: bajar una altura

1. El desafío muestra un triángulo `ABC` con `AB = 13`, `BC = 14`, `CA = 15` y pide el área. La cheatsheet está abierta en el panel lateral con las entradas de `geom.area.rect_and_triangle` y `geom.tri.pythagoras_as_tiles` visibles.
2. El jugador toca el vértice `A` y arrastra hacia el lado `BC`; `interaction` reconoce el gesto de proyección de la mecánica `construct` y emite `Intent { kind: "Construct.DropPerpendicular", from: "A", to: "BC" }`.
3. El motor sintético crea el punto `H` sobre `BC`, el segmento `AH`, y deriva los hechos `AH ⊥ BC`, `∠AHB = 90°`, `∠AHC = 90°`. Con las reglas de derivación, registra que `ABH` y `ACH` son triángulos rectángulos. La validación de la construcción es positiva: no cambió la figura, solo agregó objetos.
4. Cada hecho derivado se compara con la lista de datos faltantes del desafío. "Existe una altura" era el primer dato faltante; se marca como descubierto. El evento `{ type: "construct", challenge: "geom.heron_like_01", verb: "apply", result: 1, discovered: ["altitude_from_A"] }` va al log.
5. `cheatsheet` recibe el hecho "dos triángulos rectángulos con cateto común" y resalta la entrada de Pitágoras y la estrategia "si falta un dato, trazá la altura", que ahora tiene una marca de "usada en este desafío".
6. El scene graph dibuja `AH` con `Write`, marca los ángulos rectos con `Indicate` y deja al jugador seguir: el siguiente Intent esperable es `MarkEqual` o un movimiento algebraico sobre `x² + h² = 13²` y `(14 − x)² + h² = 15²`, que viven como `MathTree` en el mismo canvas, con ids ligados a los segmentos de la figura.

## 8. Contenido

El contenido nunca contiene código. Contiene datos que un build convierte en artefactos tipados que la app carga.

```
docs/C-knowledge-graph/graph/*.yaml ──┐
docs/C-knowledge-graph/spine.yaml     ├─► build-graph ──► content/graph.json
docs/E,G,L,M,R,S/*.yaml               │                   + packages/knowledge-graph/src/ids.ts (ConceptId)
docs/locales/<lang>/*.yaml ───────────┘                   + content/locales/<lang>.json

content/activities/*.ts (DSL) ────────► build-content ──► content/activities.json
content/scenes/*.ts (DSL)     ────────►                   content/scenes.json
content/challenges/*.ts (DSL) ────────►                   content/challenges.json
                                                          manim/params/*.json (para el pipeline de §9)
```

**`build-graph`** implementa las reglas de [C0-esquema.md](C-knowledge-graph/C0-esquema.md) y del schema: ids únicos con formato `area.cluster.slug`, toda referencia resuelve, DAG sin ciclos, espina en orden compatible, ≥1 mecánica por nodo y cada mecánica en ≥3 áreas, reglas de `literacy` por nivel, analogía obligatoria con capa concreta, `probes` completas en la espina, entradas de cheatsheet declaradas y referenciadas, desafíos que apuntan a nodos existentes, claves de locale existentes en `es`. Resuelve `aliases` avisando. Deriva `unlocks` y la clausura transitiva. Emite `graph.json` y un archivo TypeScript con `type ConceptId = "found.count.cardinality" | ...`, de modo que un id mal escrito en código de la app es un error de compilación. Las reglas `detect` de misconceptions se compilan a MathJSON con metavariables en este mismo paso.

**DSL de actividades, escenas y desafíos.** Son archivos TypeScript que usan constructores tipados (`activity(...)`, `scene(...)`, `challenge(...)`) y se ejecutan en build para producir JSON. La ventaja de escribirlos en TypeScript es el tipado: `node: ConceptId`, `mechanic: MechanicId`, `generator: GeneratorName`. La ventaja de compilarlos a JSON es que la app no ejecuta contenido y que un clip, una escena y un desafío se pueden inspeccionar sin correr nada. Un `zod` schema valida el JSON resultante.

**Generadores de problemas.** Una actividad no lista sus ítems; declara un generador por nombre (`"one_step_add_small"`, `"riemann_poly_deg2"`) y parámetros. El registro de generadores vive en `math-engine` y cada generador es una función pura `(seed, params) → Item`. El `seed` se guarda en el evento para reproducir el ítem exacto en la minería de errores y en los tests.

**Locales por clave.** El build de locales produce un JSON por idioma con las claves de todos los YAML; el validador falla si `es` no tiene una clave referenciada y avisa por claves faltantes en otros locales. Los bundles se publican por `expo-updates` sin release de app.

## 9. Pipeline Manim

```
manim/
  scenes/            una clase de ManimGL por familia de escena, parametrizada por JSON
  theme.py           lee content/theme.json (mismos tokens que la app, ver N)
  params/            JSON emitido por build-content, uno por clip
  render.py          CLI: lee params, renderiza, escribe clip + poster + handoff.json
  handoff/           extractor de posiciones e ids del último frame
  cache/             clave = hash(código de la escena + params + versión de manimgl + theme)
  out/<clip_id>/     clip.webm  clip.mp4  poster.webp  handoff.json
  requirements.txt   manimgl==1.7.2 pineado
  Dockerfile         imagen de CI con TeX, ffmpeg, Xvfb o EGL
```

**Escenas parametrizadas.** Cada clase recibe un JSON con los valores del ítem (coeficientes, puntos, funciones), así que una familia de escena produce muchos clips sin código nuevo. El `theme.py` lee el mismo `theme.json` que usa la app para que colores, grosores y tipografía coincidan con las escenas nativas.

**Render en CI con caché por hash.** Solo se renderiza lo que cambió. La clave es el hash del código de la escena, sus parámetros, la versión de ManimGL y el tema. Un cambio de tema re-renderiza todo, y por eso el tema se congela por release.

**Formato.** webm (VP9) y mp4 (H.264) a 720p y 30 fps, duración ≤ 10 s, peso ≤ 1.2 MB por variante, poster webp ≤ 80 KB extraído del primer frame. El validador del pipeline falla si un clip excede estos límites.

**Clips sin texto rasterizado.** Las escenas se renderizan sin etiquetas, nombres de funciones ni prompts. Toda etiqueta se dibuja nativamente encima del video usando `handoff.json`, que contiene por frame clave las posiciones e ids de los objetos etiquetables. Así un clip sirve para todos los idiomas y nunca se re-renderiza por locale. Excepción documentada por escena en `scenes.yaml` con `text_free: false`: símbolos universales (números, `+`, `=`, `x`) pueden ir en el clip; nombres de funciones dependientes de locale, no ([P](P-internacionalizacion.md)).

**Handoff.** El último frame del clip se describe en `handoff.json` con las posiciones e ids de todos los Mobjects. La escena nativa que sigue al clip construye su scene graph a partir de ese archivo, con los mismos ids, y arranca exactamente donde terminó el video. El jugador no ve corte. El extractor recorre `scene.mobjects` al terminar la animación y serializa centro, bounding box, puntos y el nombre lógico asignado por la escena.

**Distribución.** Unos 600 clips en dos formatos rondan los 700 MB; no se bundlean. La app trae un starter pack de ≤ 60 MB con los clips del diagnóstico y de los ~30 primeros conceptos (solo webm o solo mp4 según plataforma). El resto vive en un CDN. `persistence` mantiene una caché LRU de 300 MB y `curriculum-engine` publica la "frontera" del jugador (nodos `available` y sus sucesores directos), cuyos clips se prefetchean en wifi. Si un clip no está disponible offline, la escena se degrada a poster más la escena nativa equivalente, que siempre existe porque el `handoff.json` sí viaja en el starter pack completo (son archivos de pocos KB).

**Riesgo de ManimGL headless.** ManimGL 1.7.2 abre una ventana con ModernGL; en CI sin display se necesita Xvfb o un contexto EGL headless. La rama con wgpu podría usar un adaptador de software, pero no está verificado. Spike de un día con criterio de salida en §12. Alternativa preparada: renderizar con ManimCE, que tiene modo headless probado, manteniendo ManimGL como gramática de referencia y traduciendo los nombres (`ShowCreation` → `Create`, etc.) en una capa de compatibilidad dentro de `manim/scenes/`. La decisión no afecta a la app: el contrato es el clip más el `handoff.json`.

## 10. Privacidad y cuentas

Mathy se diseña para edad universal ([Q-edad-universal.md](Q-edad-universal.md)), lo que obliga a tratar a todo usuario como potencialmente menor.

- **Jugable sin cuenta.** El perfil local es el modo por defecto. Todo el event log, el modelo de usuario y la cheatsheet viven en el dispositivo. No hay ninguna llamada de red obligatoria fuera de la descarga de clips y de bundles de locale, que se hacen sin identificador de usuario.
- **Perfiles múltiples por dispositivo.** Una familia comparte un teléfono. Cada perfil tiene su `profile_id` local, su event log y su modelo de usuario separados; el cambio de perfil es un selector sin contraseña con un candado opcional para adultos.
- **Cuenta opcional con sync.** Si existe, el único dato que sube es el event log (unión de eventos por `(device_id, id)`, sin borrado, con `ts` local). Para menores de 13 (COPPA) o de la edad de consentimiento digital de cada país (GDPR-K, 13 a 16), la creación de cuenta requiere consentimiento parental verificable, con el flujo del adulto separado del juego. Minimización: la cuenta guarda un identificador, un email de adulto y el log; sin nombre real, sin fecha de nacimiento exacta (solo el rango que decide el flujo), sin geolocalización.
- **Sin ads ni tracking de terceros.** Ningún SDK de analítica de terceros. La telemetría de producto es el propio event log, opt-in, anonimizado por hash de `profile_id` y agregada solo en el servidor propio.
- **Sin UGC ni chat.** No hay nombres visibles a otros, no hay mensajes, no hay contenido compartido. Los desafíos no tienen tabla de posiciones.
- **Exportación y borrado.** Desde el perfil se exporta el log como JSON y se borra todo, local y remoto.

## 11. Testing

| Capa | Técnica | Qué garantiza |
|---|---|---|
| `StepEngine` | Property tests con `fast-check`: para expresiones aleatorias del dominio del nodo, todo movimiento válido conserva equivalencia; `Factor ∘ Distribute = id`; `Integrate ∘ Differentiate` equivale salvo constante | Que el vocabulario de movimientos es correcto por construcción |
| Misconceptions | Fixtures por regla `detect`, con valores instanciados, verificadas por SymPy en CI: `to` no es equivalente a `correct`, `to` es equivalente a lo que la regla produce en TS | Que las reglas dicen lo que dicen y que TS y Python coinciden |
| Equivalencia | Suite adversaria: pares que engañan a cada etapa (identidades trigonométricas, valores absolutos, dominios restringidos, `sqrt(x²)` frente a `x`, `x/x` frente a `1`), con el veredicto esperado incluido `Undecidable` | Que el motor no dice `Equivalent` cuando no debe |
| viz-core | Snapshot de descripciones de escena: el Timeline y el scene graph serializados por frame clave, comparados como JSON | Que un cambio de animación es intencional |
| viz-skia | Golden images de Skia renderizadas en Node (`canvaskit`) para un corpus de expresiones y escenas, con diff perceptual y umbral | Que el layout matemático y el dibujo no se degradan |
| Layout | Corpus de expresiones por `MathLocale` comparado con render de referencia de TeX (posición de cajas con tolerancia) | Que el subconjunto de TeX se comporta como TeX |
| Rate functions | 101 puntos contra tablas de ManimGL, tolerancia `1e-9` | Que el handoff no salta |
| App | Maestro en dispositivo físico de gama baja (Android API 26, 2 GB de RAM) con flujos del diagnóstico, una actividad de cada mecánica y un desafío; presupuesto de frame medido | Que corre donde tiene que correr |
| Selector | Simulación de 1000 alumnos sintéticos con perfiles distintos (rápido, lento, con misconceptions persistentes, que abandona) durante 90 días simulados; invariantes: nunca se ofrece un nodo con prerequisito no `ready` (never-skip-prereq), toda review vencida se atiende antes de N sesiones, ningún alumno queda sin actividad | Que J hace lo que dice |
| `user-model` | Fold determinista: mismo log, mismo estado, en cualquier orden de llegada de eventos concurrentes | Que el sync por unión es correcto |
| Grafo | Validador de `build-graph` en CI, falla el build | Que el contenido cumple C0 |
| Manim | Smoke render de una escena por familia en cada PR que toque `manim/`; render completo nightly | Que el pipeline no se rompe en silencio |
| i18n | Lint de literales en componentes; test de que ningún YAML de contenido contiene texto visible; pseudo-locale `en-XA` con +35 % de expansión sin overflow en pantallas clave | Que P se cumple |

## 12. Riesgos y spikes

| Riesgo | Dueño | Spike | Criterio de salida |
|---|---|---|---|
| compute-engine 0.x en Hermes: features de ES no soportadas, tamaño del bundle, tiempo de carga | ingeniero de math engine | 2 días: correr la suite de equivalencia y de misconceptions en un dev client en Android de gama baja | Suite verde; canonicalización de `x + 5 = 12` en < 5 ms p95; carga inicial < 300 ms; si falla, evaluar polyfills o vendorizar |
| Layout TeX propio: subestimar el subconjunto necesario | ingeniero de viz | 3 días: implementar hlist, fracción, sup/sub, radical y delimitadores; renderizar el corpus de la espina | El 100 % de las expresiones de los 44 nodos de la espina se renderiza sin la excepción SVG; diff contra TeX dentro de tolerancia |
| Fidelidad del morph: `PathAlign` produce transiciones feas entre glifos muy distintos | ingeniero de viz | 2 días: 🍎 → x → 2x y `√` → `x^(1/2)` | Revisión visual aprobada por diseño; sin autointersecciones visibles a 60 fps en gama baja |
| Scope 3D: presión por agregar nodos fuera de la allowlist | líder técnico | ninguno; regla de proceso | Todo nodo 3D nuevo requiere entrada en D0 y aprobación explícita |
| ManimGL headless en CI | ingeniero de contenido/pipeline | 1 día: Dockerfile con Xvfb y con EGL; probar `manimgl -w` de una escena con `Surface` | Un clip renderizado en GitHub Actions sin display; si no, cambiar a ManimCE para el render con la capa de compatibilidad |
| TeX en CI y licencias de fuentes | ingeniero de contenido/pipeline + revisión legal | 1 día | Imagen de CI con TeX Live mínimo reproducible; confirmación por escrito de que la licencia de la fuente elegida (GUST FL o OFL) permite el empaquetado; atribuciones en la pantalla "acerca de" |
| Assets frente a promesa offline | líder técnico | medición con el starter pack real | Starter ≤ 60 MB; con LRU de 300 MB y prefetch de frontera, < 2 % de escenas degradadas a poster en la simulación de 1000 alumnos con conectividad intermitente |
| Android de gama baja | ingeniero de viz | 2 días en dispositivo físico | Actividad de `grid_stretch` con deformación no lineal a ≥ 45 fps con LOD bajo; `balance` a 60 fps |
| Churn de Expo y React Native | líder técnico | política de versiones | Un salto de SDK por semestre, en una rama, con la suite completa verde antes de mezclar |
| Calidad de la taxonomía de errores: reglas que nadie dispara o que clasifican mal | diseño pedagógico | revisión trimestral con el event log | Distractores con < 2 % de elección se revisan; clasificaciones con confianza baja > 30 % en un nodo disparan revisión de la regla |
| Equivalencia indecidible en casos frecuentes | ingeniero de math engine | análisis del log en beta | < 1 % de movimientos `Undecidable` en nodos de nivel ≤ 4; cada caso frecuente recibe una regla o un dominio declarado |
| Motor de geometría sintética insuficiente para los desafíos | ingeniero de math engine + diseño pedagógico | 3 días: implementar el conjunto inicial de reglas y validar los 6 desafíos de geometría del contenido inicial | Los 6 desafíos se resuelven paso a paso con validación correcta de cada construcción y cada dato; las estrategias fallidas de S se detectan |

## 13. Layout del monorepo

Coherente con el README raíz.

```
Mathy/
  README.md
  docs/                        este documento de diseño (A a S, locales, YAML)
  apps/
    mobile/                    app Expo (prebuild, dev client)
      app/                     rutas (expo-router)
      src/screens/             mapa, sesión, actividad, calculadora, cheatsheet, desafíos, perfil
      src/minigames/           un módulo por minijuego de F, registrado en game-engine
      assets/                  starter pack de clips, atlas de glifos, fuentes, íconos concretos
      app.config.ts
  packages/
    game-engine/
    interaction/
    math-engine/               StepEngine, equivalencia, clasificador, geometría sintética, generadores
    viz-core/                  scene graph, animaciones, rate functions, layout matemático
    viz-skia/
    curriculum-engine/
    knowledge-graph/           graph.json + ConceptId generado + consultas
    user-model/                fold de eventos, constants.ts generado desde K
    cheatsheet/
    challenges/
    persistence/
    i18n/
    audio/
    theme/                     theme.json compartido con manim/theme.py
  content/
    activities/                DSL TS → activities.json
    scenes/                    DSL TS → scenes.json + manim/params
    challenges/                DSL TS → challenges.json
    build/                     build-graph, build-content, build-locales
    out/                       artefactos generados (no versionados)
  manim/                       pipeline de pre-render (Python), ver §9
  scripts/                     validadores, simulación de alumnos, extracción de constantes de K, golden images
  .github/workflows/           ci (lint, tests, validador, smoke render), nightly (render completo), release
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

Los paquetes de `packages/` con la marca "no importa React Native" de §6 se compilan también a un bundle de Node que usan los scripts de `scripts/` y el servidor de sync. `content/out/` y `manim/out/` no se versionan; se publican como artefactos de CI y se suben al CDN en el release.
