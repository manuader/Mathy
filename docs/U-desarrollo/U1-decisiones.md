# U1 — Decisiones técnicas y lo que las respalda

Este documento existe para que nadie vuelva a discutir desde cero algo que ya se investigó. Cada decisión viene con la evidencia que la sostiene y con lo que la haría cambiar. Lo que está sin verificar se dice explícitamente, porque planificar contra una suposición disfrazada de hecho es el error más caro que puede cometer quien retome esto.

Todo se verificó en septiembre de 2026 contra documentación oficial, código fuente de los paquetes y ejecución propia. Las versiones envejecen; los argumentos, menos.

## El problema central y su solución

Mathy anima fórmulas como lo hace Manim: cada término es un objeto que se mueve y se transforma, no un texto que se redibuja. Para dibujar un glifo como trazo vectorial hace falta su contorno.

**Skia no lo da en web.** Las dos APIs que lo darían, `Path.MakeFromText` y `Paragraph.getPath`, existen en iOS y Android pero en la versión web lanzan `throwNotImplementedOnRNWeb()`. Y CanvasKit no tiene con qué implementarlas: enumerando su API en vivo, `CanvasKit.Path.MakeFromText` es `undefined` y `Font.prototype` no expone nada que devuelva contornos.

**La solución es no pedírselo a Skia.** MathJax v4, corriendo sin DOM con `liteAdaptor` y con la salida SVG configurada con `fontCache: 'none'`, emite un `<path d="...">` explícito por glifo. Ese `d` entra directo en `Skia.Path.MakeFromSVGString`, que sí funciona en las tres plataformas. Se verificó de punta a punta: diez de diez trazos parseados, cero fallos.

En el proyecto esto se hace **en build time** (`packages/glyphs`), lo que además esquiva por completo la pregunta de si MathJax corre bajo Hermes.

## Identidad de término: tres caminos, y por qué elegimos el nuestro

Es la pieza que hace posible todo lo demás. Si la `x` de `x + 5 = 12` no es el mismo objeto que la `x` de `x = 7`, no hay animación posible: solo un corte entre dos imágenes.

Cómo lo resuelven los demás:

| Sistema | Método | Falla cuando |
|---|---|---|
| Manim Community | empareja por el string de TeX de cada submobject | hay dos `x` en la fórmula |
| ManimGL | `SequenceMatcher` sobre símbolos tokenizados, más doble render con colores | la estructura cambia mucho |
| Motion Canvas | renderiza la fórmula entera y cada fragmento por separado, y hace splice por posición | desincroniza, y loguea que el emparejamiento falló |

Los tres **reconstruyen** la identidad a posteriori porque no controlan el árbol de la expresión. Nosotros sí lo controlamos, así que la identidad es exacta por construcción y no hay nada que reconstruir.

**Hay un cuarto camino que conviene conocer.** MathJax v4 acepta `\cssId{mi-id}{...}` y devuelve `<g id="mi-id">` en el SVG. Es decir: se puede inyectar nuestra propia identidad en el LaTeX y obtener la composición profesional de MathJax con nuestros ids. También emite `data-latex` con el fragmento de TeX que originó cada nodo, y `data-mml-node` con su tipo. **MathJax v3 no tiene `data-latex`**, lo cual es razón suficiente para no usar v3.

Hoy no lo usamos porque escribimos nuestra propia composición, y la razón está abajo. Pero es la salida natural cuando la notación se complique.

## La composición: propia ahora, MathJax después

`packages/typeset` compone el árbol en glifos ubicados. Cubre números, símbolos, operadores binarios, igualdad y paréntesis por precedencia, con los espacios de TeX. Son ciento cincuenta líneas.

**Por qué propia y no MathJax:** para la gramática de los primeros hitos, la composición es trivial y evitarla ahorra un riesgo entero (MathJax en el dispositivo, bajo Hermes, con su bundle). Y hay un dato que la hace exacta: en tipografía matemática **los dígitos son de ancho tabular**, todos con el mismo avance. Está verificado sobre el atlas horneado: los diez dígitos miden 0.5 em. Eso significa que el ancho de un número no depende de qué cifras tenga, y la composición de aritmética y álgebra elemental sale de sumar avances.

**Cuándo dejar de escribirla:** cuando lleguen fracciones apiladas, radicales, matrices, integrales con límites y delimitadores que se estiran. Implementar eso bien exige leer la tabla OpenType MATH y el Apéndice G del TeXbook, y la estimación honesta de la investigación es de seis a diez semanas para un subconjunto usable. **No lo escribas.** Cuando llegue ese momento, componé con MathJax usando `\cssId` para conservar la identidad, y horneá el resultado si el rendimiento lo pide.

Dato relevante: ninguna librería JS de uso corriente lee la tabla MATH. Se verificó empíricamente que `opentype.js`, `fontkit` y `harfbuzzjs` no la exponen. La única que sí es `ot-builder`, que está pensada para editar fuentes y carga la fuente entera a memoria.

## Morphing de trazos: casi nunca hace falta

Era el punto más temido del proyecto. La interpolación nativa de Skia solo funciona entre trazos con la misma estructura de comandos, y se verificó que `CanInterpolate(path_de_la_x, path_del_5)` devuelve `false`.

**Resulta que el caso principal no lo necesita.** Cuando `x + 5 = 12` se convierte en `x = 7`, ningún glifo cambia de forma. La `x` se traslada. El `+5` y el `−5` se acercan y se apagan. El `12` se mueve hasta donde va el `7` y se cruzan en disolvencia. Identidad de término más interpolación de posición y opacidad cubre la enorme mayoría de las animaciones del juego, y es exactamente lo que implementa `packages/viz-core`.

El morphing verdadero queda para dos situaciones:

1. **Las transiciones entre capas**, donde un cofre se convierte en una caja y una manzana en una `x`. Esos son assets propios, así que se dibujan con la misma estructura de comandos que su destino y la interpolación es directa.
2. **El momento en que dos números se funden en uno**, si algún día se quiere que el `12` y el `−5` se conviertan geométricamente en `7` en vez de cruzarse en disolvencia. Para eso existen `flubber` (MIT, sin DOM, con `separate` y `combine` para los casos de uno a varios) y el `manimMorpher` de Canvas Commons (MIT), que normaliza a cúbicas, iguala subtrazos, subdivide y rota el índice inicial. **Copiar el algoritmo, no depender del paquete:** Canvas Commons tiene treinta y siete descargas por semana y parsea el SVG con el DOM del navegador.

## Motor simbólico: elegido con reservas

`@cortex-js/compute-engine` es la elección, y tiene lo que hace falta, verificado en ejecución: parsea, resuelve, decide equivalencia (`isEqual`, `isSame`), aplica una operación a los dos lados, y desde la versión 0.127 tiene `explain()`, que devuelve los pasos con **ids de regla estables**, que es justo lo que necesita el clasificador de errores.

Tres reservas serias:

**La canonicalización destruye la correspondencia con lo que ve el alumno.** `ce.parse('\\frac{x+5}{2}')` devuelve `["Multiply", ["Rational",1,2], ["Add","x",5]]`, que no se parece a la fracción en pantalla. **Hay que usar `{canonical: false}` desde el día uno y sin excepciones**, que preserva la forma de superficie, incluido un `+0` si el alumno lo escribió.

**No hay identidad por nodo.** Las expresiones son inmutables y `simplify()` devuelve un árbol nuevo. Hay que envolverlo con ids propios, que es exactamente lo que hace `packages/math-core`. Diseñarlo desde el principio, no agregarlo después.

**Hermes es un riesgo abierto y concreto.** El bundle tiene veinticuatro escapes de propiedad unicode (`\p{...}`) y doce lookbehinds. Hay reportes reales de que Hermes falla con `\p{}` aunque su documentación diga que lo soporta, y **nadie reportó nunca haber corrido compute-engine en React Native**. El plan B es `mathjs` (limpio para Hermes, pero **no resuelve ecuaciones**: el pedido está abierto desde 2013) más un motor de pasos propio para el subconjunto escolar.

Y una trampa de empaquetado: el campo `browser` de compute-engine apunta a un UMD de tres megabytes y **Metro resuelve `browser` antes que `main`**. Hay que configurarlo explícitamente.

## Lo que se descartó, y por qué

| Descartado | Motivo |
|---|---|
| Motion Canvas | Abandonado desde diciembre de 2024. Y su `seek()` re-simula desde el frame cero, así que arrastrar el dedo hacia atrás reproduce todos los cuadros intermedios. Descalificatorio para animación dirigida por gestos. |
| Canvas Commons (su fork activo) | Mismo modelo de línea de tiempo para video, mismo acoplamiento al DOM. Su algoritmo de morphing y su alineación por subsecuencia común valen oro; el paquete no. |
| `manim-web` | Es un port de Manim a TypeScript, MIT, con buena arquitectura. Pero su autor admitió públicamente que lo generó íntegramente un agente, y hay bugs de render marcados como resueltos sin estarlo. Cantera de código, no dependencia. |
| GeoGebra | Licencia no comercial, y los archivos de idioma son CC-BY-NC-SA, lo que contamina el producto entero. |
| WebView con librería web adentro | Los componentes DOM de Expo usan un puente asíncrono JSON entre motores. La propia documentación de Expo recomienda no usarlos y construir con primitivas universales. A sesenta cuadros por segundo con el dedo apoyado es descalificatorio. |
| `expo-three` | Dos años sin actualizarse, fijado a una versión de three veinte minors atrás. |
| KaTeX, Temml, MathLive como capa de composición | Emiten HTML con CSS o MathML: el layout lo hace el navegador y no hay vectores. MathLive sí sirve como referencia para el teclado de fichas. |
| Pyodide con SymPy | Veinte megabytes, y Hermes probablemente no expone WebAssembly. |
| Remotion | No es código abierto: equipos de más de tres personas pagan licencia. Y solo produce video. |

## Referencias de producto que conviene conocer

**Graspable Math** es la mejor referencia de interacción que existe: manipulación algebraica directa por gestos, con un SDK público y documentado. Es gratis para uso no comercial y requiere negociar licencia para lo demás, sin precio de lista. Es web, su animación es caja negra y depende de sus servidores. Vale como referencia, no como base.

**DragonBox Algebra** aporta una idea de diseño que el documento debería absorber: **la invariante está codificada en la interacción**. No te deja hacer otra cosa hasta que completes la operación del otro lado de la igualdad. Es más fuerte que explicar la regla.

**`@khanacademy/math-input`** es el mejor precedente abierto de teclado matemático táctil, con arrastre y cursor desprendido para pantallas chicas.

**`react-native-math-view`**, aunque archivado, tiene en `MathjaxAdaptor.ts` un `toSVGArray` que recorre el árbol de MathJax acumulando la matriz de transformación y devuelve un glifo direccionable por cada `<use>`. Es material para copiar.

## Presupuestos que son restricciones de diseño

No son detalles de implementación: condicionan qué escenas se pueden diseñar.

**Trescientos elementos animados en Android de gama baja.** Los reportes de dispositivos reales dan un iPhone 12 mini sosteniendo diez mil sprites y un Android barato sosteniendo trescientos, con una causa diagnosticada (una llamada de cruce de frontera por sprite por cuadro) que lleva veintiséis meses abierta. Las escenas en riesgo son la malla deformable y el campo vectorial, y se resuelven con primitivas de instanciación (`Vertices` para la malla, `Atlas` para las flechas).

**Ocho contextos WebGL vivos en Android Chrome**, dieciséis en escritorio, verificado en el código de Chromium. Skia consume uno por lienzo, y el desalojo es por el que hace más tiempo que no dibuja, o sea que mata primero las figuras quietas del fondo. **Un solo lienzo grande por pantalla.**

**Modo retained.** El árbol de escena se mantiene estable y solo se animan los valores. Un objeto que va a aparecer se crea desde el principio con opacidad cero. Nunca se monta ni se desmonta durante una animación, porque eso empuja al modo caro, donde cada cuadro paga el cruce de frontera.

**El brillo se precalienta.** Animar un radio de desenfoque de cero a veinte en iOS dispara compilación de shaders de Metal en medio de la animación, del orden de ciento setenta milisegundos por cuadro las primeras veces. Se monta una escena invisible al arrancar que dispare todos los desenfoques.

**El arranque en web es problema de red, no de procesador.** Compilar el WASM son cien a ciento setenta milisegundos; todo lo demás es descarga. Las palancas, en orden de retorno: servir con Brotli, aliasear el build completo de CanvasKit al recortado que el paquete ya trae, cachear el módulo compilado, y solo al final compilar uno propio.

## Los tres spikes que faltan

En orden de lo que cambiarían si salen mal.

1. **MathJax v4 bajo Hermes**, en dispositivo y en build de release. Solo importa si algún día se compone en runtime; hoy se hornea en build time, que es precisamente para esquivarlo. El precedente existe pero es todo con la versión 3.
2. **compute-engine bajo Hermes.** Es el riesgo vivo, por los escapes de propiedad unicode. Si falla, probar el plugin de Babel que los transpila; si igual falla, el plan B es `mathjs` más un motor de pasos propio.
3. **La escena más pesada en un Android barato**, en build de release: la malla deformable con su malla fantasma. Decide si el presupuesto de trescientos elementos alcanza o si hay que rediseñar las escenas de álgebra lineal.
