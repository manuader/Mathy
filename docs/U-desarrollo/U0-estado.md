# U0 — Estado del desarrollo

Este documento es el punto de entrada para quien retoma el trabajo. Dice qué está construido y verificado, qué está a medias, qué sigue, y las decisiones que ya se tomaron para que nadie las vuelva a discutir sin motivo. Se actualiza al cerrar cada hito.

**Última actualización:** al cerrar el hito M0 en navegador (commit `369ab4e`).

## Dónde estamos

La fase de diseño está cerrada: las secciones A a S de [`docs/`](../README.md) están completas y el validador pasa con cero errores. La de construcción tiene cerrado el hito **M0**, la prueba vertical descrita en [T](../T-plan-implementacion.md).

M0 preguntaba una sola cosa: **¿se puede animar una ecuación con identidad de término, con el dedo, en iOS, Android y navegador?** La respuesta, verificada en el navegador y no solo compilada, es que sí. La app dibuja `x + 5 = 12` con los glifos reales del atlas, en la misma tipografía que usan LaTeX y Manim; el morph sigue al dedo mientras se arrastra la ficha, sin temporizador de por medio; y al soltar pasado el umbral el paso se confirma y queda `x = 7`.

## Qué está construido y verificado

Cuatro paquetes, con **39 tests que pasan** y tipado estricto sin errores. Los tres primeros son TypeScript puro sin dependencias de React Native, así que se testean en Node.

### `packages/math-core`

La expresión es un árbol donde **cada término tiene una identidad estable** que sobrevive a las transformaciones. Esa es la pieza que hace posible todo lo demás: la `x` de `x + 5 = 12` es literalmente el mismo objeto que la `x` de `x = 7`.

Un movimiento del jugador no devuelve solo la ecuación nueva. Devuelve además una **traza** que dice qué le pasó a cada término:

| Campo de la traza | Qué significa | Cómo se anima |
|---|---|---|
| `kept` | el término sigue existiendo | se traslada |
| `created` | nace, con `bornAt` opcional | entra desde ese punto |
| `removed` | se va sin heredero | se apaga en su lugar |
| `annihilated` | un par que se cancela | se juntan en el punto medio y se apagan |
| `merged` | varios se funden en uno nuevo | se mueven hasta el destino y se cruzan en disolvencia |

La traza es el puente entre la matemática y la animación, y es lo que evita el problema que hace frágil a `TransformMatchingParts` en Manim, que empareja submobjects por posición dentro de la cadena y falla cuando la estructura cambia.

`applyBothSides` conserva la igualdad y lo declara; `applyOneSide` la rompe y también lo declara, porque el error es contenido pedagógico y no una excepción. `goalCost` cuenta cuántos nodos acompañan a la incógnita, que es como se distingue un movimiento válido pero inútil de uno que acerca a la meta.

### `packages/typeset`

Compone el árbol en glifos ubicados, cada uno recordando de qué término salió. Cubre la gramática de los primeros hitos: números, símbolos, operadores binarios, igualdad y paréntesis por precedencia. Usa los espacios de TeX (`\medmuskip` alrededor de un operador binario, `\thickmuskip` alrededor de una relación).

**Se escribe propio y no se usa el de MathJax por una sola razón:** la identidad de cada glifo tiene que venir del árbol, no del tipógrafo. Si el layout es nuestro, cada glifo en pantalla sabe de qué nodo salió, y el morph es exacto por construcción en vez de aproximado por posición.

### `packages/viz-core`

Dos cosas. Las quince funciones de suavizado de ManimGL, portadas tal cual, que son las que hacen que el movimiento se sienta como un video de 3Blue1Brown y no como una transición de interfaz. Y el planificador de morph, que toma dos composiciones más la traza y produce, por cada glifo, de dónde sale y adónde va.

`sampleMorph` evalúa el plan en un instante y es una **función pura del tiempo, sin estado**, para que pueda correr dentro de un worklet en el hilo de UI. Lo que se apaga lo hace en la primera mitad de la animación y lo que se enciende en la segunda, para que nunca se vea el estado nuevo encimado sobre el viejo.

### El hallazgo que abarata el proyecto

El punto más temido era interpolar trazos entre formas distintas, que Skia solo permite si los dos trazos tienen los mismos comandos en el mismo orden. **Casi nunca hace falta.** Cuando `x + 5 = 12` se convierte en `x = 7`, ningún glifo cambia de forma: se trasladan, se apagan y se encienden. Identidad de término más interpolación de transformaciones cubre la enorme mayoría de las animaciones del juego.

El morphing real queda para las transiciones entre capas, donde un cofre se convierte en una caja. Esos objetos son assets propios, así que se dibujan desde el principio con la misma estructura de comandos que su destino.

### `packages/glyphs`

El atlas de contornos, horneado en build time con MathJax v4. Existe porque las dos APIs de Skia que darían el contorno de un glifo en runtime (`Path.MakeFromText`, `Paragraph.getPath`) **no existen en la versión web**, y CanvasKit no tiene con qué implementarlas.

Veintitrés glifos: los dígitos, las variables `x y a b n` en itálica matemática, los operadores, el igual, los paréntesis y el punto. En unidades de em con el eje Y hacia abajo, que es lo que Skia espera. El horneado es reproducible byte a byte.

Dos datos del atlas que valen como verificación y como fundamento del diseño: la `y` tiene descendente de 0.205 y la `x` de 0.011, lo que confirma que la conversión de ejes está bien; y los diez dígitos comparten avance, porque en tipografía matemática son de ancho tabular, que es justo lo que la composición supone para que el ancho de un número no dependa de sus cifras.

### `packages/viz-skia`

El adaptador de dibujo, y lo único del proyecto que sabe que existe Skia. Cien líneas.

Respeta el modo retained, que no es un detalle de estilo sino la diferencia entre pagar o no el cruce de frontera en cada cuadro: el árbol de componentes se arma con la unión de los glifos de los dos estados y no cambia durante la animación; un glifo que todavía no se ve está montado con opacidad cero. Cada glifo es un componente con su propio valor derivado, así que cuando el dedo se mueve nada vuelve al hilo de JavaScript.

### `apps/mathy`

La app Expo, una sola para iOS, Android y navegador. En web el punto de entrada es `index.web.tsx`, que difiere el registro de la app hasta que termina de cargar el WASM de Skia; sin eso el primer lienzo se dibujaría contra un Skia que todavía no existe.

`src/OneStepScene.tsx` es la prueba vertical: el nodo de calibración del diseño, con el progreso del morph atado al arrastre.

## Qué está a medias

Nada.

## Qué falta y en qué orden

1. **Medir en dispositivo.** Sesenta cuadros por segundo en un Android de gama baja **en build de release**, no de depuración, y el arranque en frío del navegador. Es lo que falta del criterio de salida de M0.
2. **Correr en iOS y Android.** Hasta ahora solo se verificó el navegador. Necesita una build de desarrollo, porque Skia es un módulo nativo y no corre en Expo Go.
3. **Adelgazar el WASM de web.** Los dos primeros peldaños de la escalera de [T](../T-plan-implementacion.md) son casi gratis: servir con Brotli, y aliasear el build completo de CanvasKit al recortado que el paquete ya trae, que ahorra unos 350 KB.
4. **M1**: la mecánica `chest_key` completa y los ocho niveles de `alg.eq.one_step`, con el `StepEngine` validando y una explicación de error dinámica.

## Decisiones tomadas que no conviene reabrir sin motivo

Están argumentadas con su evidencia en [U1](U1-decisiones.md), que es el documento a leer antes de proponer cambiar el stack, y en [T](../T-plan-implementacion.md). En resumen:

- **Un solo código para iOS, Android y navegador**, sobre React Native Skia. En web corre sobre CanvasKit. Se descartaron con evidencia Motion Canvas (abandonado, y su `seek` re-simula desde el frame cero), GeoGebra (licencia no comercial), un WebView con una librería web adentro (puente asíncrono, incompatible con sesenta cuadros por segundo) y `expo-three` (dos años sin actualizarse).
- **No hay clips pre-renderizados.** Todo se calcula en el dispositivo. Con eso se fueron 700 MB de assets, el CDN, el empalme entre video y escena nativa y la restricción de renderizar sin texto para servir a todos los idiomas.
- **El modelo no sabe que existe Skia.** Los tres paquetes construidos no importan nada de React Native y se testean en Node. La capa de dibujo es un adaptador delgado.
- **Modo retained**: el árbol de escena se mantiene estable y solo se animan los valores. Un objeto que va a aparecer se crea desde el principio con opacidad cero. Nunca se monta ni se desmonta durante una animación.
- **Presupuesto de trescientos elementos animados** en Android de gama baja. Es una restricción de diseño de escena, no un detalle de implementación.
- **Un solo lienzo grande por pantalla**, porque Android Chrome permite ocho contextos WebGL vivos y Skia consume uno por lienzo.

## Cómo correr lo que hay

Node 26 y npm 11, instalados con Homebrew. Desde la raíz del repositorio:

```bash
npm install && npm test --workspaces --if-present && python3 tools/validate.py
```

Para ver la app en el navegador:

```bash
cd apps/mathy && npx expo start --web
```

La primera vez, `npx setup-skia-web public` copia el WASM de CanvasKit a `apps/mathy/public/`. No está versionado: se regenera en cada instalación.

Dos trampas que cuestan una tarde. El `.wasm` tiene que servirse con el tipo MIME `application/wasm`; varios servidores estáticos simples no lo hacen, y el síntoma es una pantalla en blanco sin ningún error en la consola. Y la implementación web de gesture-handler escucha eventos de puntero, así que un arrastre sintético hecho con eventos de mouse no la despierta: hay que emitir `pointerdown`, varios `pointermove` y `pointerup` con el mismo `pointerId`.

Los tests de cada paquete usan el corredor de Node con stripping de tipos, así que no hay paso de compilación. Por eso los imports llevan la extensión `.ts` explícita y `tsconfig.base.json` tiene `allowImportingTsExtensions`.

## Convenciones del código

Las del documento de diseño siguen valiendo, y se agregan estas:

- **Español en los comentarios**, escasos y solo donde expliquen *por qué* algo es así, nunca *cómo* funciona. Sin guiones largos.
- **TypeScript estricto**, con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. La configuración sale de `tsconfig.base.json`.
- **Los paquetes de modelo no importan React Native.** Si un paquete necesita Skia, va en `viz-skia` o más arriba.
- **Los tests describen comportamiento, no implementación.** Los nombres son frases en español que dicen qué tiene que pasar.
- **Nada se da por bueno sin correr.** Un paquete sin tests que pasen no está terminado, y una pantalla que no se miró en el navegador no está verificada. Los dos errores de M0 compilaban y pasaban los tests: un trazo sin color explícito, que Skia pinta de negro sobre fondo negro; y el progreso sin reiniciar al confirmar el paso, que dibujaba un paso que el jugador nunca dio.
