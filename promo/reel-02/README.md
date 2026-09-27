# Reel 02 — cómo se renderiza

Plan y personajes en [PLAN.md](PLAN.md). El motor común (curvas, glifos, tipografía,
fondo) está en [`../shared/engine.js`](../shared/engine.js); las fuentes se toman de
`../reel-01/fonts/`.

```sh
cd promo/reel-02
node render.mjs stills 0.5,4.9,7.7 --scale 0.5
node render.mjs video --scale 2 --fps 60 --workers 4 --tag 4k
python3 audio.py out/audio.wav
ffmpeg -i out/video-4k.mp4 -i out/audio.wav -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart out/mathy-reel-02-4k.mp4
ffmpeg -i out/video-4k.mp4 -i out/audio.wav -vf scale=1080:1920:flags=lanczos -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/mathy-reel-02-1080.mp4
```

Vista previa: servir la raíz del repo y abrir `/promo/reel-02/reel.html` (`?t=` para arrancar
en un segundo).
