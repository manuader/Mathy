# Reel 01 — cómo se renderiza

El plan de la pieza y el porqué de cada decisión están en [PLAN.md](PLAN.md).

| Archivo | Qué es |
|---|---|
| `reel.html` | la pieza entera. Cada cuadro es función pura de `t` (`window.renderFrame(t)`) |
| `render.mjs` | sirve el repo, abre Chromium, pide cada cuadro y lo codifica con ffmpeg |
| `audio.py` | la banda sonora, sintetizada con numpy en los tiempos exactos de `reel.html` |
| `fonts/` | Inter (SIL OFL), la sans de interfaz |

Los glifos se leen de `packages/glyphs/src/atlas.json`: son los del juego.

## Vista previa

Servir la raíz del repo (`npx http-server -p 8090` desde `Mathy/`) y abrir
`http://localhost:8090/promo/reel-01/reel.html`. `?t=5` arranca en el segundo 5 y
`?hook=Tu%20hijo%20sabe%20despejar%20x.` cambia el hook (ver PLAN §8).

## Render

Requiere Playwright (con su Chromium), ffmpeg con libx264, y numpy.

```sh
cd promo/reel-01
node render.mjs stills 0.5,5.6,8.2 --scale 0.5          # cuadros sueltos
node render.mjs video --scale 2 --fps 60 --workers 4 --tag 4k   # ~30 min en 4 núcleos
python3 audio.py out/audio.wav
ffmpeg -i out/video-4k.mp4 -i out/audio.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/mathy-reel-01-4k.mp4
ffmpeg -i out/video-4k.mp4 -i out/audio.wav -vf scale=1080:1920:flags=lanczos -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/mathy-reel-01-1080.mp4
```

Todo va a `out/`, que no se versiona.
