#!/usr/bin/env python3
"""Trae el arte generado al juego y reescribe el manifiesto.

Es el `process_dropbox.py` de FisuEvolution para Mathy: el generador
(`automatic-image-generation`) produce las imágenes; acá se convierten en
assets del juego. El código de la app nunca referencia un archivo directo:
pasa por `apps/mathy/src/art/manifest.ts`, y lo que no está en el manifiesto se
dibuja con su reemplazo. Por eso este script se puede correr en cualquier
momento, con cualquier subconjunto del arte generado.

    ~/Desktop/projects/automatic-image-generation/.venv/bin/python tools/art/sync_art.py

Necesita Pillow (el venv del generador lo tiene).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
GEN = Path(os.environ.get("MATHY_GEN", Path.home() / "Desktop/projects/automatic-image-generation"))
ART = ROOT / "apps/mathy/assets/art"
MANIFEST = ROOT / "apps/mathy/src/art/manifest.ts"

LUMI_POSES = ["hero", "icon", "point", "cheer", "think", "wow", "key", "read", "sleep", "encourage"]
WORLDS = ["found", "arith", "prealg", "alg", "calc", "linalg", "prob", "graph", "geom", "disc", "world"]
# El lado chico va a los avatares; el grande, a las tarjetas.
LUMI_SIZES = {"small": 192, "large": 512}
# Un paisaje de 1920 px de ancho alcanza para una pantalla de escritorio y pesa
# la décima parte que el PNG original.
WORLD_WIDTH = 1920


# El recorte de Lumi se rehace acá, desde el PNG ORIGINAL, y no se toma el del
# generador. Gemini pinta el brillo de la panza y de las antenas como un halo
# crema sobre el fondo blanco; con la tolerancia de fábrica (14) ese halo no
# cuenta como fondo y queda pegado a la figura como una mancha blancuzca, que
# sobre el mundo oscuro se ve enseguida. Medido en `lumi_hero`: con 40 el halo
# sigue en las antenas, con 70 queda un flequillo bajo la panza, con 110 sale
# limpio y el dorado de la panza no se toca (su canal azul no baja de ~120).
CUT_TOLERANCE = 110
# Margen alrededor de la figura una vez recortada, en fracción del lado: el
# generador deja un aire enorme y Lumi se veía chica en su cuadro.
CUT_MARGIN = 0.06


# Poses con blanco ENCERRADO que es fondo y no dibujo: el agujero del anillo de
# la llave y el hueco entre la llave y el birrete. El recorte por conectividad no
# puede sacarlos (no tocan el borde), y sacar todo el blanco encerrado se llevaría
# los dientes y los brillos de los ojos. Se sacan sólo las islas blancas cuyo
# centro cae en la fracción superior de la figura, que es donde está la llave.
PUNCH_TOP = {"key": 0.42}
# Qué cuenta como blanco de fondo adentro de la figura: el borde de sticker de
# ChatGPT es blanco casi puro; el amarillo de la llave no baja su azul de ~60.
PUNCH_WHITE_MIN = 225


def punch_top_islands(image: Image.Image, fraction: float) -> Image.Image:
    import numpy as np
    from scipy import ndimage

    a = np.asarray(image).copy()
    alpha = a[..., 3]
    ys = np.where(alpha > 16)[0]
    if ys.size == 0:
        return image
    limit = ys.min() + fraction * (ys.max() - ys.min())
    white = (a[..., :3].min(axis=2) >= PUNCH_WHITE_MIN) & (alpha > 0)
    labels, count = ndimage.label(white)
    for island in range(1, count + 1):
        mask = labels == island
        if mask.sum() < 30 or np.where(mask)[0].mean() > limit:
            continue
        # Un píxel de más alrededor, sólo sobre lo claro: el antialias del borde.
        ring = ndimage.binary_dilation(mask, iterations=2) & (a[..., :3].min(axis=2) >= 170)
        a[mask | ring, 3] = 0
    return Image.fromarray(a, "RGBA")


def sync_lumi() -> dict[str, dict[str, str]]:
    sys.path.insert(0, str(GEN))
    import core.cutout as cutter  # el mismo recorte por conectividad del generador

    cutter.WHITE_TOLERANCE = CUT_TOLERANCE
    src = GEN / "projects/mathy-lumi/output"
    dst = ART / "lumi"
    dst.mkdir(parents=True, exist_ok=True)
    found: dict[str, dict[str, str]] = {}
    for pose in LUMI_POSES:
        f = src / f"lumi_{pose}.png"
        if not f.exists():
            continue
        cut = cutter.cutout(Image.open(f)).convert("RGBA")
        if pose in PUNCH_TOP:
            cut = punch_top_islands(cut, PUNCH_TOP[pose])
        box = cut.getbbox()
        if box is None:
            print(f"  ⚠️  {f.name}: el recorte quedó vacío, no se integra")
            continue
        figure = cut.crop(box)
        if pose == "icon" and figure.height > figure.width * 1.15:
            # El avatar vive a 48-64 px: se lee la cara o no se lee nada. Si la
            # imagen trae el cuerpo entero (ChatGPT lo hizo una vez aunque el
            # prompt pedía un primer plano), el primer plano se hace acá. Si ya es
            # un primer plano, recortarlo se come la barbilla.
            figure = figure.crop((0, 0, figure.width, round(figure.width * 0.92)))
        side = round(max(figure.size) * (1 + 2 * CUT_MARGIN))
        square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        square.alpha_composite(figure, ((side - figure.width) // 2, (side - figure.height) // 2))
        for label, px in LUMI_SIZES.items():
            out = dst / f"lumi_{pose}_{px}.png"
            square.resize((px, px), Image.LANCZOS).save(out, optimize=True)
            found.setdefault(pose, {})[label] = f"../../assets/art/lumi/{out.name}"
    return found


def sync_worlds() -> dict[str, str]:
    src = GEN / "projects/mathy-mundos/output"
    dst = ART / "mundos"
    dst.mkdir(parents=True, exist_ok=True)
    found: dict[str, str] = {}
    for world in WORLDS:
        f = src / f"bg_{world}.png"
        if not f.exists():
            continue
        img = Image.open(f).convert("RGB")
        if img.width > WORLD_WIDTH:
            img = img.resize((WORLD_WIDTH, round(img.height * WORLD_WIDTH / img.width)), Image.LANCZOS)
        out = dst / f"bg_{world}.jpg"
        img.save(out, "JPEG", quality=84, optimize=True, progressive=True)
        found[world] = f"../../assets/art/mundos/{out.name}"
    return found


def write_manifest() -> tuple[int, int]:
    """Lista lo que HAY en disco, venga del generador o de los reemplazos."""
    lumi: dict[str, dict[str, str]] = {}
    for pose in LUMI_POSES:
        for label, side in LUMI_SIZES.items():
            f = ART / "lumi" / f"lumi_{pose}_{side}.png"
            if f.exists():
                lumi.setdefault(pose, {})[label] = f"../../assets/art/lumi/{f.name}"
    worlds = {w: f"../../assets/art/mundos/bg_{w}.jpg" for w in WORLDS if (ART / "mundos" / f"bg_{w}.jpg").exists()}
    lines = [
        "/**",
        " * El arte que existe. GENERADO por `tools/art/sync_art.py`: no se edita a mano.",
        " *",
        " * Lo que no figura acá se dibuja con su reemplazo en código, así que un",
        " * manifiesto vacío es un juego que anda entero.",
        " */",
        'import type { LumiPose, WorldKey } from "./index.ts";',
        "",
        "export const LUMI_ART: Partial<Record<LumiPose, { readonly small?: number; readonly large?: number }>> = {",
    ]
    for pose in LUMI_POSES:
        if pose in lumi:
            parts = [f'{label}: require("{path}")' for label, path in sorted(lumi[pose].items())]
            lines.append(f"  {pose}: {{ {', '.join(parts)} }},")
    lines += ["};", "", "export const WORLD_ART: Partial<Record<WorldKey, number>> = {"]
    lines += [f'  {w}: require("{path}"),' for w, path in worlds.items()]
    lines += ["};", ""]
    MANIFEST.write_text("\n".join(lines))
    return len(lumi), len(worlds)


if __name__ == "__main__":
    traidas_lumi = sync_lumi()
    traidos_mundos = sync_worlds()
    en_lumi, en_mundos = write_manifest()
    print(f"generadas: Lumi {len(traidas_lumi)} poses, {len(traidos_mundos)} mundos")
    print(f"manifiesto: Lumi {en_lumi}/{len(LUMI_POSES)} · mundos {en_mundos}/{len(WORLDS)} · {MANIFEST.relative_to(ROOT)}")
