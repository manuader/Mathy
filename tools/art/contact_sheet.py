#!/usr/bin/env python3
"""Una hoja de contactos del arte integrado, para revisarlo de un vistazo.

Las poses de Lumi van recortadas sobre el fondo oscuro del juego, que es donde
se ve si el recorte dejó halo o borde blanco; los mundos van en miniatura con el
velo que les pone la app, que es como los ve el jugador.

    ~/Desktop/projects/automatic-image-generation/.venv/bin/python tools/art/contact_sheet.py <salida.png>
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "apps/mathy/assets/art"
BG = (12, 22, 36, 255)
VEIL = (7, 14, 24, 90)


def sheet(out: Path) -> None:
    poses = sorted((ART / "lumi").glob("lumi_*_512.png"))
    worlds = sorted((ART / "mundos").glob("bg_*.jpg"))
    cell, cols = 240, 5
    lumi_rows = -(-len(poses) // cols)
    wcell_w, wcell_h, wcols = 384, 216, 4
    world_rows = -(-len(worlds) // wcols)
    width = max(cols * cell, wcols * wcell_w)
    height = lumi_rows * (cell + 24) + world_rows * (wcell_h + 24) + 20
    canvas = Image.new("RGBA", (width, height), (20, 20, 24, 255))
    draw = ImageDraw.Draw(canvas)
    for i, f in enumerate(poses):
        x, y = (i % cols) * cell, (i // cols) * (cell + 24)
        tile = Image.new("RGBA", (cell, cell), BG)
        tile.alpha_composite(Image.open(f).convert("RGBA").resize((cell - 20, cell - 20), Image.LANCZOS), (10, 10))
        canvas.alpha_composite(tile, (x, y))
        draw.text((x + 6, y + cell + 4), f.stem.replace("_512", ""), fill=(230, 230, 230, 255))
    top = lumi_rows * (cell + 24) + 20
    for i, f in enumerate(worlds):
        x, y = (i % wcols) * wcell_w, top + (i // wcols) * (wcell_h + 24)
        thumb = Image.open(f).convert("RGBA").resize((wcell_w - 8, wcell_h - 8), Image.LANCZOS)
        thumb = Image.alpha_composite(thumb, Image.new("RGBA", thumb.size, VEIL))
        canvas.alpha_composite(thumb, (x + 4, y + 4))
        draw.text((x + 8, y + wcell_h + 4), f.stem, fill=(230, 230, 230, 255))
    canvas.convert("RGB").save(out, quality=90)
    print(f"{len(poses)} poses, {len(worlds)} mundos → {out}")


if __name__ == "__main__":
    sheet(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "contact_sheet.png")
