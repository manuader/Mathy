# Reel 01 — "¿Qué es x?"

Plan de la pieza publicitaria de Mathy para pauta en Reels, TikTok y Shorts, y el porqué de
cada decisión. El video se renderiza desde `reel.html` (ver `README.md`).

## 1. Objetivo y a quién le habla

**Objetivo de campaña:** instalaciones / visitas a la app (conversión), con una métrica de
contenido que la sostiene: *hook rate* (vistas de 3 s / impresiones) y *hold rate* (vistas
de 15 s / vistas de 3 s).

**Audiencias**, las dos que nombra [A](../../docs/A-vision.md):

| Segmento | Qué le duele | Qué tiene que ver en el video |
|---|---|---|
| Madres, padres y docentes (30-50) | el chico memoriza y no entiende; la matemática como ansiedad | que el chico **toca** antes de escribir, y que el error no castiga |
| Adultos que "se olvidaron todo" (25-45) | la `x` nunca tuvo sentido | que la `x` es una caja en una balanza, y que se entiende en segundos |

Un solo video les habla a los dos porque la pregunta del hook es de ambos: **¿qué es x?**

## 2. La idea

> Te enseñaron a memorizar la `x`. Mathy te la hace tocar.

La historia es el recorrido del propio juego ([H](../../docs/H-progresion-abstraccion.md)),
pero al revés en el primer segundo: arranca en el símbolo que todos odiamos, lo rompe, y
muestra el objeto que había detrás. Después hace el camino correcto (objeto → símbolo) en
pantalla, con la mecánica real de la balanza. El espectador vive en 20 segundos la tesis del
producto.

## 3. Guion por tiempos (9:16, 24,5 s, 120 BPM: cada corte cae en un pulso)

| Tiempo | Acto | Imagen | Texto en pantalla | Sonido |
|---|---|---|---|---|
| 0,0 – 1,0 | **Hook** | La `x` en Latin Modern (el atlas real del juego) entra de golpe desde 6×, onda de choque, micro-shake | **¿Qué es x?** | golpe grave + whoosh |
| 1,0 – 2,5 | Tensión | `x + 5 = 12` se arma glifo a glifo con rebote; se atenúa | Te lo hicieron memorizar. | ticks por glifo |
| 2,5 – 3,0 | Giro | Los glifos se deshacen en partículas; la `x` se vuelve la caja azul con tapa | **Acá lo tocás.** | riser corto |
| 3,0 – 4,5 | Objeto | La cámara se abre: la caja está en el plato izquierdo de la balanza con 5 pesas y el broche `+`; el derecho tiene 12. La barra se dibuja y queda derecha | El igual es una balanza. | pulso de la música entra |
| 4,5 – 6,0 | Error visible | Un dedo lleva la llave `−` a **un solo** plato: 5 pesas suben y se van, la barra se inclina y se pone ámbar | Si tocás un solo plato… **se cae.** | golpe seco, sin buzzer |
| 6,0 – 6,6 | Rebobinado | Todo vuelve atrás (el juego reproduce el error y devuelve el control) | Nada dice "incorrecto". | rebobinado |
| 6,6 – 8,6 | Acierto | El dedo pasa la llave por los **dos** platos sin soltar: la barra no se mueve, la tapa se abre, aparecen 7 pesas verdes | Una llave, los dos platos. → **x = 7** | ticks + campana |
| 8,6 – 11,5 | Del objeto al símbolo | Los platos se desvanecen, la barra queda como la línea de la ecuación: `x + 5 = 12` → `−5` a los dos lados → `x = 7` | Primero lo tocás. Después lo escribís. | swell |
| 11,5 – 17,5 | La misma idea, en todo | Cuatro cortes de 1,5 s con barrido: cuencos de fruta (🍎🍎 → `x + x` → `2x`), cofres anidados con llaves, la fábrica (una función es una máquina), la rampa del caminante | nombre real de cada nodo + su frase | whoosh por corte |
| 17,5 – 20,5 | Escala | Zoom out: los 21 conceptos jugables de la espina se encienden en fila, sobre el cielo tenue del grafo completo | De contar frutas a funciones inversas. | build |
| 20,5 – 24,5 | Cierre | Marca Λ, wordmark, promesa y CTA. El último cuadro vuelve a la `x` para que el loop del reel empalme con el hook | **Mathy** · Tocalo antes de escribirlo. · Jugá ahora | golpe final + cola |

## 4. Retención

- **Sin cuadro negro al inicio**: el cuadro 0 ya tiene la `x` en movimiento.
- **Pregunta abierta en 0,3 s** ("¿Qué es x?") que el video responde recién en el segundo 8
  (`x = 7`): el *open loop* sostiene la vista.
- **Un evento visual cada 0,5 s o menos** (cortes al pulso de 120 BPM).
- **El error como giro dramático** (4,5 s): la balanza que se cae es el momento más
  compartible y el que más explica el producto.
- **Loop**: el final empalma con el principio; en Reels, la segunda vuelta suma retención.
- **Se entiende sin audio**: todo el relato está en pantalla (el 80 % mira en silencio).

## 5. Identidad: lo que se respeta

Todo sale del código y de [N](../../docs/N-ux-ui.md), no de una reinterpretación:

- Tokens de `apps/mathy/src/ui/theme.ts`: fondo `#0b0d10`, tinta `#e8eaed`, acento
  `#8ab4f8`, verde `#81c995`, ámbar `#f8c675`. **No hay rojo**, porque en Mathy no existe el
  error como categoría de interfaz.
- Glifos: los contornos del atlas horneado `packages/glyphs/src/atlas.json` (Latin Modern
  Math), los mismos que dibuja el juego.
- Escenas redibujadas en vector desde su propio código (`BalanceScene`, `ChestScene`,
  `PipeScene`, `BowlScene`, `WalkScene`) con sus medidas escaladas, y verificadas contra
  capturas reales de la app corriendo en el navegador.
- Mecánica real: la llave se pasa por los dos platos sin soltar; si toca uno solo, la barra se
  inclina y se pone ámbar. Nada inventado.
- Movimiento: las curvas `smooth`, `rush_into`, `rush_from` y `there_and_back` de ManimGL que
  usa la app, más overshoot y squash & stretch solo en la tipografía y las entradas.

## 6. Desvíos del brief, y por qué

| El brief pedía | Qué se hizo | Por qué |
|---|---|---|
| Personajes con contorno negro grueso y colores saturados planos | No hay personajes | Mathy **no tiene** personajes ni mascotas: N los excluye a propósito ("estética infantil") y en el repo no existe ningún asset así. Inventarlos violaría la restricción de no crear personajes nuevos. El protagonista es el objeto matemático |
| Partículas | Partículas contenidas, en tinta y acento | N prohíbe confeti y exceso de color |
| Carpeta `distribution` y skill "brag" | No existen en este repo ni en esta sesión | El video se basó en `docs/`, en el código de las escenas y en capturas de la app real |
| 4K | 2160×3840, 60 fps, H.264 alta calidad | Además, versión 1080×1920 para subir directo a pauta |

## 7. Honestidad de los reclamos

La pauta no puede prometer lo que el producto todavía no tiene. Hoy hay **21 conceptos
jugables** (de contar hasta la función inversa) de los 51 de la espina; iOS y Android no se
probaron. Por eso el video dice "de contar frutas a funciones inversas" y no "hasta la
universidad". El CTA dice "Jugá ahora": **hay que completar el destino** (URL o tienda)
en la plataforma de anuncios antes de publicar.

## 8. Variantes para testear en pauta

Mismo cuerpo, tres hooks (0-2,5 s), para un A/B/C con igual presupuesto:

1. **"¿Qué es x?"** (el renderizado).
2. **"Tu hijo sabe despejar x. ¿Sabe qué es?"** — para padres.
3. **"Nunca entendiste álgebra. No fue tu culpa."** — para adultos.

Se cambian en `reel.html` (constante `HOOK`) y se vuelve a renderizar.

## 9. Especificaciones de entrega

- `mathy-reel-01-4k.mp4`: 2160×3840, 60 fps, H.264 High, yuv420p, AAC 48 kHz.
- `mathy-reel-01-1080.mp4`: 1080×1920, 60 fps, para subir directo.
- Zonas seguras de Reels respetadas: nada crítico en los 250 px de arriba, los 420 px de
  abajo ni los 120 px del borde derecho (en la grilla de 1080×1920).
