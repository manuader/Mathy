#!/usr/bin/env python3
"""Trae el arte generado al juego y reescribe el manifiesto.

Es el `process_dropbox.py` de FisuEvolution para Mathy: el generador
(`automatic-image-generation`) produce las imágenes; acá se convierten en
assets del juego. El código de la app nunca referencia un archivo directo:
pasa por `apps/mathy/src/art/manifest.ts`, y lo que no está en el manifiesto se
dibuja con su reemplazo (o, en el caso del ambiente, simplemente no se mueve).
Por eso este script se puede correr en cualquier momento, con cualquier
subconjunto del arte generado.

Cuatro familias: Lumi y Tomi (las dos mascotas, proyectos `mathy-lumi` y
`mathy-tomi`), los mundos (`mathy-mundos`) y los sprites que se mueven en la
periferia del fondo (`mathy-ambiente`).

    ~/Desktop/projects/automatic-image-generation/.venv/bin/python tools/art/sync_art.py

Necesita Pillow, numpy y scipy (el venv del generador los tiene).
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
TOMI_POSES = ["hero", "icon", "idea", "point", "think", "cheer", "duo"]
AMBIENT = ["cloud", "birds", "lantern", "butterfly", "leaf", "gear", "boat", "balloon"]
WORLDS = ["found", "arith", "prealg", "alg", "calc", "linalg", "prob", "graph", "geom", "disc", "world"]
# El lado chico va a los avatares; el grande, a las tarjetas.
FIGURE_SIZES = {"small": 192, "large": 512}
# Un paisaje de 1920 px de ancho alcanza para una pantalla de escritorio y pesa
# la décima parte que el PNG original.
WORLD_WIDTH = 1920
# Un sprite de ambiente nunca se ve a más de ~200 px: 384 de lado largo alcanza
# con pantallas densas y pesa poco.
AMBIENT_SIDE = 384


# El recorte de las mascotas se rehace acá, desde el PNG ORIGINAL, y no se toma
# el del generador. Gemini pinta el brillo de la panza y de las antenas como un
# halo crema sobre el fondo blanco; con la tolerancia de fábrica (14) ese halo no
# cuenta como fondo y queda pegado a la figura como una mancha blancuzca, que
# sobre el mundo oscuro se ve enseguida. Medido en `lumi_hero`: con 40 el halo
# sigue en las antenas, con 70 queda un flequillo bajo la panza, con 110 sale
# limpio y el dorado de la panza no se toca (su canal azul no baja de ~120).
CUT_TOLERANCE = 110
# Los sprites de ambiente tienen colores más claros que las mascotas (nubes con
# borde dorado, papel) y no traen halo: 110 se comería sus bordes iluminados.
AMBIENT_TOLERANCE = 60
# Margen alrededor de la figura una vez recortada, en fracción del lado: el
# generador deja un aire enorme y Lumi se veía chica en su cuadro.
CUT_MARGIN = 0.06


# Poses con blanco ENCERRADO que es fondo y no dibujo: el agujero del anillo de
# la llave y el hueco entre la llave y el birrete. El recorte por conectividad no
# puede sacarlos (no tocan el borde), y sacar todo el blanco encerrado se llevaría
# los dientes y los brillos de los ojos. Se sacan sólo las islas blancas cuyo
# centro cae en la fracción superior de la figura, que es donde está la llave.
PUNCH_TOP = {
    "lumi_key": 0.42,
    # El globo: entre las sogas, la boca del globo y la canasta queda un hueco
    # blanco encerrado. No tiene ningún blanco puro que sea dibujo, así que se
    # sacan todas sus islas (fracción 1).
    "amb_balloon": 1.0,
}
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


def cutter():
    sys.path.insert(0, str(GEN))
    import core.cutout as module  # el mismo recorte por conectividad del generador

    return module


def corners(image: Image.Image) -> list[tuple[int, int]]:
    w, h = image.size
    return [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]


def flood_background(rgba: Image.Image, tolerance: int) -> Image.Image:
    """Borra el fondo de cualquier color: lo parecido a las esquinas y conectado al borde."""
    import numpy as np
    from scipy import ndimage

    a = np.asarray(rgba).copy()
    rgb = a[..., :3].astype(int)
    bg = np.median(np.array([rgb[y, x] for x, y in corners(rgba)]), axis=0)
    dist = np.abs(rgb - bg).max(axis=2)
    labels, _ = ndimage.label(dist <= tolerance)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    mask = np.isin(labels, edge[edge != 0])
    a[mask, 3] = 0
    # El canto: los píxeles pegados al fondo se vuelven translúcidos según cuánto
    # se parecen a él, para que no quede un aro del color del fondo viejo.
    ring = ndimage.binary_dilation(mask, iterations=2) & ~mask
    a[ring, 3] = np.clip((dist[ring] - tolerance) * 255 // max(tolerance, 1), 0, 255).astype(a.dtype)
    return Image.fromarray(a, "RGBA")


def cut(f: Path, tolerance: int) -> Image.Image | None:
    """Recorta el fondo blanco y devuelve la figura ajustada a su contenido."""
    source = Image.open(f)
    rgba = source.convert("RGBA")
    if rgba.getchannel("A").getextrema()[0] < 250:
        # El modelo ya devolvió el fondo transparente (ChatGPT a veces lo hace
        # con los sprites): buscar blanco sobre eso no encuentra nada y dejaría
        # el cuadro entero. Se usa el alfa que trae.
        image = rgba
    elif all(min(rgba.getpixel(c)[:3]) >= 200 for c in corners(rgba)):
        module = cutter()
        module.WHITE_TOLERANCE = tolerance
        image = module.cutout(source).convert("RGBA")
    else:
        # A veces el modelo pinta el fondo de otro color (la nube salió sobre
        # negro, por el crepúsculo): se recorta contra el color de las esquinas.
        image = flood_background(rgba, tolerance)
    name = f.stem
    if name in PUNCH_TOP:
        image = punch_top_islands(image, PUNCH_TOP[name])
    box = image.getbbox()
    if box is None:
        print(f"  ⚠️  {f.name}: el recorte quedó vacío, no se integra")
        return None
    return image.crop(box)


def square(figure: Image.Image) -> Image.Image:
    side = round(max(figure.size) * (1 + 2 * CUT_MARGIN))
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.alpha_composite(figure, ((side - figure.width) // 2, (side - figure.height) // 2))
    return out


def sync_figures(project: str, prefix: str, poses: list[str]) -> list[str]:
    """Una mascota: cada pose recortada, en cuadrado, a los dos tamaños."""
    src = GEN / f"projects/{project}/output"
    dst = ART / prefix
    dst.mkdir(parents=True, exist_ok=True)
    done: list[str] = []
    for pose in poses:
        f = src / f"{prefix}_{pose}.png"
        if not f.exists():
            continue
        figure = cut(f, CUT_TOLERANCE)
        if figure is None:
            continue
        if pose == "icon" and figure.height > figure.width * 1.15:
            # El avatar vive a 48-64 px: se lee la cara o no se lee nada. Si la
            # imagen trae el cuerpo entero (ChatGPT lo hizo una vez aunque el
            # prompt pedía un primer plano), el primer plano se hace acá. Si ya es
            # un primer plano, recortarlo se come la barbilla.
            figure = figure.crop((0, 0, figure.width, round(figure.width * 0.92)))
        framed = square(figure)
        for px in FIGURE_SIZES.values():
            framed.resize((px, px), Image.LANCZOS).save(dst / f"{prefix}_{pose}_{px}.png", optimize=True)
        done.append(pose)
    return done


def sync_ambient() -> list[str]:
    """Los sprites del fondo: recortados a su contenido, sin cuadrar (la proporción la usa el código)."""
    src = GEN / "projects/mathy-ambiente/output"
    dst = ART / "ambiente"
    dst.mkdir(parents=True, exist_ok=True)
    done: list[str] = []
    for key in AMBIENT:
        f = src / f"amb_{key}.png"
        if not f.exists():
            continue
        figure = cut(f, AMBIENT_TOLERANCE)
        if figure is None:
            continue
        k = AMBIENT_SIDE / max(figure.size)
        if k < 1:
            figure = figure.resize((round(figure.width * k), round(figure.height * k)), Image.LANCZOS)
        figure.save(dst / f"amb_{key}.png", optimize=True)
        done.append(key)
    return done


def sync_worlds() -> list[str]:
    src = GEN / "projects/mathy-mundos/output"
    dst = ART / "mundos"
    dst.mkdir(parents=True, exist_ok=True)
    done: list[str] = []
    for world in WORLDS:
        f = src / f"bg_{world}.png"
        if not f.exists():
            continue
        img = Image.open(f).convert("RGB")
        if img.width > WORLD_WIDTH:
            img = img.resize((WORLD_WIDTH, round(img.height * WORLD_WIDTH / img.width)), Image.LANCZOS)
        img.save(dst / f"bg_{world}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
        done.append(world)
    return done


def figures_on_disk(prefix: str, poses: list[str]) -> dict[str, dict[str, str]]:
    found: dict[str, dict[str, str]] = {}
    for pose in poses:
        for label, side in FIGURE_SIZES.items():
            f = ART / prefix / f"{prefix}_{pose}_{side}.png"
            if f.exists():
                found.setdefault(pose, {})[label] = f"../../assets/art/{prefix}/{f.name}"
    return found


def figure_lines(name: str, pose_type: str, poses: list[str], found: dict[str, dict[str, str]]) -> list[str]:
    lines = [f"export const {name}: Partial<Record<{pose_type}, {{ readonly small?: number; readonly large?: number }}>> = {{"]
    for pose in poses:
        if pose in found:
            parts = [f'{label}: require("{path}")' for label, path in sorted(found[pose].items())]
            lines.append(f"  {pose}: {{ {', '.join(parts)} }},")
    return lines + ["};", ""]


def write_manifest() -> dict[str, tuple[int, int]]:
    """Lista lo que HAY en disco, venga del generador o de los reemplazos."""
    lumi = figures_on_disk("lumi", LUMI_POSES)
    tomi = figures_on_disk("tomi", TOMI_POSES)
    worlds = {w: f"../../assets/art/mundos/bg_{w}.jpg" for w in WORLDS if (ART / "mundos" / f"bg_{w}.jpg").exists()}
    ambient: dict[str, tuple[str, float]] = {}
    for key in AMBIENT:
        f = ART / "ambiente" / f"amb_{key}.png"
        if f.exists():
            with Image.open(f) as im:
                ambient[key] = (f"../../assets/art/ambiente/{f.name}", round(im.width / im.height, 3))
    lines = [
        "/**",
        " * El arte que existe. GENERADO por `tools/art/sync_art.py`: no se edita a mano.",
        " *",
        " * Lo que no figura acá se dibuja con su reemplazo en código, así que un",
        " * manifiesto vacío es un juego que anda entero.",
        " */",
        'import type { AmbientKey, LumiPose, TomiPose, WorldKey } from "./index.ts";',
        "",
    ]
    lines += figure_lines("LUMI_ART", "LumiPose", LUMI_POSES, lumi)
    lines += figure_lines("TOMI_ART", "TomiPose", TOMI_POSES, tomi)
    lines += ["export const WORLD_ART: Partial<Record<WorldKey, number>> = {"]
    lines += [f'  {w}: require("{path}"),' for w, path in worlds.items()]
    lines += ["};", ""]
    lines += ["/** `aspect` es ancho sobre alto: el sprite se ubica por su alto y el ancho sale de ahí. */"]
    lines += ["export const AMBIENT_ART: Partial<Record<AmbientKey, { readonly src: number; readonly aspect: number }>> = {"]
    lines += [f'  {k}: {{ src: require("{path}"), aspect: {aspect} }},' for k, (path, aspect) in ambient.items()]
    lines += ["};", ""]
    MANIFEST.write_text("\n".join(lines))
    return {
        "Lumi": (len(lumi), len(LUMI_POSES)),
        "Tomi": (len(tomi), len(TOMI_POSES)),
        "mundos": (len(worlds), len(WORLDS)),
        "ambiente": (len(ambient), len(AMBIENT)),
    }


if __name__ == "__main__":
    traidas = {
        "Lumi": sync_figures("mathy-lumi", "lumi", LUMI_POSES),
        "Tomi": sync_figures("mathy-tomi", "tomi", TOMI_POSES),
        "mundos": sync_worlds(),
        "ambiente": sync_ambient(),
    }
    print("generadas: " + ", ".join(f"{k} {len(v)}" for k, v in traidas.items()))
    en = write_manifest()
    print("manifiesto: " + " · ".join(f"{k} {a}/{b}" for k, (a, b) in en.items()) + f" · {MANIFEST.relative_to(ROOT)}")
