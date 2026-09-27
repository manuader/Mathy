# Sesión 2026-09-27 — el primer reel para pauta

## Qué se pidió

Un video de motion graphics vertical de 20 a 25 segundos para pautar el juego en redes:
hook claro, que explique la dinámica, que respete la identidad y que use los assets
existentes sin redibujar personajes ni inventar gameplay.

## Qué se hizo

`promo/reel-01/`: el plan (`PLAN.md`), la pieza (`reel.html`), el renderizador
(`render.mjs`) y la banda sonora (`audio.py`). Salida: 2160×3840 a 60 fps y 1080×1920,
H.264 con AAC, audio a −14 LUFS.

La historia es la tesis del producto: arranca en el símbolo ("¿Qué es x?"), lo rompe,
muestra la balanza real de `alg.eq.one_step` con la llave pasando por un solo plato (la
barra cae y se pone ámbar) y después por los dos (la caja se abre con 7), y recién ahí
escribe `x = 7`. Sigue un montaje con cuatro nodos reales y sus frases de `i18n.ts`, los 21
conceptos jugables encendiéndose sobre el cielo del grafo, y el cierre con la marca.

## Por qué así

- **Redibujar desde el código y no grabar la app.** Las escenas se mueven con gestos; para
  un plano a 60 fps con cámara, partículas y tipografía cinética hacía falta controlar cada
  cuadro. Se portaron las medidas de `BalanceScene` (a escala 2×) y el vocabulario de
  `ChestScene`, `PipeScene`, `BowlScene` y `WalkScene`, con los tokens de `theme.ts`. Para
  no reinterpretar, antes se levantó la app en el navegador, se desbloqueó todo inyectando
  eventos `levelDone` en `mathy.events.v1` y se capturaron las escenas reales como
  referencia.
- **Sin personajes.** El brief los pedía, pero Mathy no tiene y N los prohíbe. El
  protagonista es el objeto matemático.
- **Reclamos honestos.** Hay 21 conceptos jugables, no la universidad; el video dice
  "de contar frutas a funciones inversas".
- **Audio sintetizado** para no depender de licencias de música.

## El reel 02: con personajes

Se pidió una segunda pieza que usara los personajes del juego. Mathy no tiene mascotas,
pero sí tiene personajes dibujados en el código, y son los que se usaron sin tocarles una
proporción: el caminante (`TrackScene.buildWalker`), las piedras sobre el agua, la bandera,
la manivela de doce dientes, el edificio con el ascensor (`buildShaft`, `buildCar`), las
frutas y el cajón cerrado (`LedgerScene.shapePath`). El caminante hace de protagonista:
empieza sin saber sumar y recorre contar, sumar, restar, negativos, la gráfica como rastro y
la caja cerrada como `x`. La animación es de marioneta (anticipación, squash & stretch,
piernas que se recogen en el salto), sobre las mismas piezas.

## Trampas

- `pkill -f "expo start"` mata al propio shell que lo ejecuta, porque su línea de comando
  contiene el patrón.
- El ffmpeg que trae Playwright no tiene libx264; se usó el de `imageio-ffmpeg`.
- Un render 1080p60 tarda ~7,5 min en 4 núcleos; el 4K, ~4 veces eso.
