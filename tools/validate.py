#!/usr/bin/env python3
"""Validador del documento de diseño de Mathy.

Comprueba las reglas enumeradas al final de
`docs/C-knowledge-graph/schema/node.schema.yaml`: ids, referencias cruzadas,
aciclicidad, orden de la espina, mecánicas por área, reglas de `literacy`,
claves de locale, presupuesto por área y referencias a escenas, operaciones de
calculadora, entradas de cheatsheet y desafíos.

Uso:
    python3 tools/validate.py            # errores y avisos
    python3 tools/validate.py --quiet    # solo errores
    python3 tools/validate.py --stats    # además, un resumen del grafo

Sale con código 1 si hay al menos un error. Los avisos no hacen fallar.
Las secciones todavía no escritas (por ejemplo R-cheatsheet) se reportan como
faltantes una sola vez, sin cascada de errores derivados.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("Falta PyYAML: pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"

ID_RE = re.compile(r"^[a-z0-9]+\.[a-z0-9]{2,6}\.[a-z0-9_]+$")
CS_RE = re.compile(r"^cs\.[a-z0-9]+\.[a-z0-9_]+$")
EVIDENCE = ["recognize", "explain", "manipulate", "apply", "generalize", "transfer"]


class Report:
    """Acumula errores y avisos con una etiqueta de regla."""

    def __init__(self) -> None:
        self.errors: list[tuple[str, str]] = []
        self.warnings: list[tuple[str, str]] = []
        self.missing_sections: set[str] = set()

    def error(self, rule: str, msg: str) -> None:
        self.errors.append((rule, msg))

    def warn(self, rule: str, msg: str) -> None:
        self.warnings.append((rule, msg))

    def missing(self, section: str, path: Path) -> None:
        """Una sección del documento que todavía no existe: un aviso, sin cascada."""
        if section not in self.missing_sections:
            self.missing_sections.add(section)
            self.warn("seccion-faltante", f"{section}: falta {rel(path)}; sus reglas se saltan")


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def load(path: Path, rep: Report):
    if not path.exists():
        return None
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        rep.error("yaml", f"{rel(path)} no parsea: {exc}")
        return None


def ids_of(doc, key: str) -> set[str]:
    """Ids de una lista de registros bajo `key`, o de un mapa id -> contenido."""
    if not doc:
        return set()
    block = doc.get(key)
    if isinstance(block, list):
        return {r["id"] for r in block if isinstance(r, dict) and "id" in r}
    if isinstance(block, dict):
        return set(block)
    return set()


def as_list(value) -> list:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


# --------------------------------------------------------------------------
# Carga
# --------------------------------------------------------------------------


def load_schema(rep: Report) -> dict:
    doc = load(DOCS / "C-knowledge-graph/schema/node.schema.yaml", rep) or {}
    return doc.get("enums", {})


def load_graph(rep: Report) -> dict[str, dict]:
    """Todos los nodos del grafo, indexados por id. Reporta ids duplicados."""
    nodes: dict[str, dict] = {}
    for path in sorted((DOCS / "C-knowledge-graph/graph").glob("*.yaml")):
        doc = load(path, rep)
        if not doc:
            continue
        for record in doc.get("nodes") or []:
            if not isinstance(record, dict) or "id" not in record:
                rep.error("ids", f"{rel(path)}: registro sin id: {record!r}")
                continue
            node_id = record["id"]
            if node_id in nodes:
                rep.error("ids", f"id duplicado `{node_id}` ({rel(path)})")
                continue
            record["_file"] = rel(path)
            record.setdefault("area", doc.get("area"))
            nodes[node_id] = record
    return nodes


def load_spine(rep: Report) -> list[dict]:
    doc = load(DOCS / "C-knowledge-graph/spine.yaml", rep) or {}
    return doc.get("spine") or []


def load_budget(rep: Report) -> dict[str, int]:
    """Presupuesto por área, leído de la tabla de D0-mapa.md."""
    path = DOCS / "D-curriculum/D0-mapa.md"
    if not path.exists():
        rep.missing("D", path)
        return {}
    budget: dict[str, int] = {}
    row = re.compile(r"^\|\s*`([a-z0-9]+)`\s*\|\s*(\d+)\s*\|")
    for line in path.read_text(encoding="utf-8").splitlines():
        match = row.match(line.strip())
        if match:
            budget[match.group(1)] = int(match.group(2))
    return budget


# --------------------------------------------------------------------------
# Reglas
# --------------------------------------------------------------------------


def check_ids_and_enums(nodes: dict[str, dict], enums: dict, rep: Report) -> None:
    areas = set(enums.get("area") or [])
    layers = set(enums.get("layer") or [])
    grammars = set(enums.get("grammar") or [])
    literacies = set(enums.get("literacy") or [])

    for node_id, node in nodes.items():
        where = f"`{node_id}` ({node['_file']})"

        if not ID_RE.match(node_id):
            rep.error("ids", f"{where}: el id no sigue area.cluster.slug")
        area = node.get("area")
        if area not in areas:
            rep.error("enums", f"{where}: area `{area}` fuera del enum")
        elif not node_id.startswith(area + "."):
            rep.error("ids", f"{where}: el prefijo del id no coincide con area `{area}`")

        level = node.get("level")
        if not isinstance(level, int) or not 0 <= level <= 8:
            rep.error("enums", f"{where}: level `{level}` fuera de 0–8")

        if grammars and node.get("grammar") not in grammars:
            rep.error("enums", f"{where}: grammar `{node.get('grammar')}` fuera del enum")

        literacy = node.get("literacy")
        if literacies and literacy not in literacies:
            rep.error("enums", f"{where}: literacy `{literacy}` fuera del enum")

        for layer in as_list(node.get("layers")):
            if layers and layer not in layers:
                rep.error("enums", f"{where}: layer `{layer}` fuera del enum")

        if not as_list(node.get("mechanics")):
            rep.error("mecanicas", f"{where}: sin mecánica; se exige al menos una")

        # nivel 0 ⇒ literacy none; full_text ⇒ level ≥ 3
        if level == 0 and literacy != "none":
            rep.error("literacy", f"{where}: nivel 0 exige literacy none, tiene `{literacy}`")
        if literacy == "full_text" and isinstance(level, int) and level < 3:
            rep.error("literacy", f"{where}: literacy full_text exige level ≥ 3, tiene {level}")

        # analogy obligatoria si layers incluye real o concrete
        node_layers = as_list(node.get("layers")) or sorted(layers)
        if {"real", "concrete"} & set(node_layers) and not node.get("analogy"):
            rep.error("analogia", f"{where}: layers incluye real o concrete y no declara analogy")

        # prereqs vacíos solo en found.*
        if not as_list(node.get("prereqs")) and area != "found":
            rep.error("prereqs", f"{where}: prereqs vacío fuera de found.*")


def build_alias_map(nodes: dict[str, dict], rep: Report) -> dict[str, str]:
    aliases: dict[str, str] = {}
    for node_id, node in nodes.items():
        for alias in as_list(node.get("aliases")):
            if alias in nodes:
                rep.error("aliases", f"`{alias}` es alias de `{node_id}` y también un id vigente")
            elif alias in aliases:
                rep.error("aliases", f"alias `{alias}` reclamado por `{aliases[alias]}` y `{node_id}`")
            else:
                aliases[alias] = node_id
    return aliases


def check_references(nodes, aliases, catalogs, rep: Report) -> None:
    """Toda referencia resuelve a un id existente (o a un alias, con aviso)."""
    node_fields = ["prereqs", "transfer_to"]
    catalog_fields = {
        "mechanics": "mechanics",
        "analogy": "analogies",
        "misconceptions": "misconceptions",
        "manim": "scenes",
        "calc_unlocks": "calc_ops",
        "cheatsheet": "cheatsheet",
    }

    for node_id, node in sorted(nodes.items()):
        where = f"`{node_id}` ({node['_file']})"

        for field in node_fields + ["next"]:
            for ref in as_list(node.get(field)):
                if ref in nodes:
                    continue
                if ref in aliases:
                    rep.warn("aliases", f"{where}: {field} apunta al alias `{ref}` → `{aliases[ref]}`")
                    continue
                rep.error("referencias", f"{where}: {field} `{ref}` no existe")

        for field, catalog in catalog_fields.items():
            known = catalogs.get(catalog)
            if known is None:  # la sección todavía no existe
                continue
            for ref in as_list(node.get(field)):
                if ref not in known:
                    rep.error("referencias", f"{where}: {field} `{ref}` no existe en {catalog}")

        # transfer_to apunta a OTRA área
        for ref in as_list(node.get("transfer_to")):
            target = nodes.get(ref) or nodes.get(aliases.get(ref, ""))
            if target and target.get("area") == node.get("area"):
                rep.warn("transfer", f"{where}: transfer_to `{ref}` es de la misma área")


def check_acyclic(nodes: dict[str, dict], aliases: dict[str, str], rep: Report) -> None:
    """El grafo de prereqs es acíclico. Reporta un ciclo concreto, no solo su existencia."""
    color: dict[str, int] = {}
    stack: list[str] = []

    def visit(node_id: str) -> None:
        color[node_id] = 1
        stack.append(node_id)
        for ref in as_list(nodes[node_id].get("prereqs")):
            target = ref if ref in nodes else aliases.get(ref)
            if target is None:
                continue
            state = color.get(target, 0)
            if state == 1:
                cycle = stack[stack.index(target):] + [target]
                rep.error("aciclicidad", "ciclo de prereqs: " + " → ".join(cycle))
            elif state == 0:
                visit(target)
        stack.pop()
        color[node_id] = 2

    sys.setrecursionlimit(10000)
    for node_id in sorted(nodes):
        if color.get(node_id, 0) == 0:
            visit(node_id)


def ancestors(node_id: str, nodes, aliases) -> set[str]:
    seen: set[str] = set()
    pending = [node_id]
    while pending:
        current = pending.pop()
        for ref in as_list(nodes.get(current, {}).get("prereqs")):
            target = ref if ref in nodes else aliases.get(ref)
            if target and target not in seen:
                seen.add(target)
                pending.append(target)
    return seen


def check_redundant_prereqs(nodes, aliases, rep: Report) -> None:
    """Aviso (no error) por prerequisitos transitivamente redundantes."""
    for node_id, node in sorted(nodes.items()):
        prereqs = [p for p in as_list(node.get("prereqs")) if p in nodes or p in aliases]
        for prereq in prereqs:
            others = [p for p in prereqs if p != prereq]
            reachable: set[str] = set()
            for other in others:
                reachable |= ancestors(other, nodes, aliases) | {other}
            if prereq in reachable:
                rep.warn(
                    "prereqs-redundantes",
                    f"`{node_id}`: `{prereq}` ya se alcanza por otro prerequisito",
                )


def check_mechanics_reuse(nodes, catalogs, rep: Report) -> None:
    """Toda mecánica aparece en al menos tres áreas."""
    known = catalogs.get("mechanics")
    if known is None:
        return
    areas_by_mechanic: dict[str, set[str]] = {m: set() for m in known}
    for node in nodes.values():
        for mechanic in as_list(node.get("mechanics")):
            if mechanic in areas_by_mechanic:
                areas_by_mechanic[mechanic].add(node.get("area"))
    for mechanic, areas in sorted(areas_by_mechanic.items()):
        if len(areas) < 3:
            rep.error(
                "mecanicas",
                f"la mecánica `{mechanic}` aparece en {len(areas)} área(s): "
                f"{', '.join(sorted(a for a in areas if a)) or '—'}; se exigen 3",
            )


def check_mechanic_coherence(nodes, catalogs, rep: Report) -> None:
    """`areas` y `reused_by` de E se derivan del grafo; hoy se escriben a mano.

    E0 afirma que "las listas completas de reúso están en el YAML", así que la
    comprobación es de igualdad, no de inclusión.
    """
    doc = load(DOCS / "E-mecanicas/mechanics.yaml", rep)
    if not doc:
        return
    for mechanic in doc.get("mechanics") or []:
        mid = mechanic.get("id")
        users = {n_id for n_id, n in nodes.items() if mid in as_list(n.get("mechanics"))}
        areas = {nodes[n].get("area") for n in users}

        declared_areas = set(as_list(mechanic.get("areas")))
        if declared_areas - areas:
            rep.warn(
                "mecanicas-derivadas",
                f"`{mid}`: declara las áreas {sorted(declared_areas - areas)}, "
                "donde ningún nodo la usa",
            )
        if areas - declared_areas:
            rep.warn(
                "mecanicas-derivadas",
                f"`{mid}`: se usa en {sorted(areas - declared_areas)} y no figura en `areas`",
            )

        declared_users = set(as_list(mechanic.get("reused_by")))
        if declared_users - users:
            rep.warn(
                "mecanicas-derivadas",
                f"`{mid}`: `reused_by` nombra {sorted(declared_users - users)}, "
                "que no la declaran",
            )
        if users - declared_users:
            rep.warn(
                "mecanicas-derivadas",
                f"`{mid}`: {len(users - declared_users)} nodo(s) la usan y no están "
                f"en `reused_by` (declara {len(declared_users)} de {len(users)})",
            )


def check_skin_mechanics(nodes, rep: Report) -> None:
    """Una analogía o una misconception corre sobre una mecánica del nodo que la declara.

    `scenes.yaml` admite `mechanic_exception: true` para los casos deliberados; G y L
    todavía no tienen esa válvula, así que acá son avisos.
    """
    analogies = load(DOCS / "G-analogias/analogies.yaml", rep) or {}
    for analogy in analogies.get("analogies") or []:
        mechanic = analogy.get("mechanic")
        if not mechanic:
            continue
        for node_id in as_list(analogy.get("target_nodes")):
            node = nodes.get(node_id)
            if node and mechanic not in as_list(node.get("mechanics")):
                rep.warn(
                    "piel-mecanica",
                    f"analogía `{analogy['id']}` corre sobre `{mechanic}`, que "
                    f"`{node_id}` no lista en sus mechanics",
                )

    misconceptions = load(DOCS / "L-modelo-errores/misconceptions.yaml", rep) or {}
    for record in misconceptions.get("misconceptions") or []:
        mechanic = record.get("mechanic")
        if not mechanic:
            continue
        for node_id in as_list(record.get("nodes")):
            node = nodes.get(node_id)
            if node and mechanic not in as_list(node.get("mechanics")):
                rep.warn(
                    "piel-mecanica",
                    f"misconception `{record['id']}` se explica sobre `{mechanic}`, que "
                    f"`{node_id}` no lista en sus mechanics",
                )
        # la misconception se declara en nodos que no la listan, y viceversa
        for node_id in as_list(record.get("nodes")):
            node = nodes.get(node_id)
            if node and record["id"] not in as_list(node.get("misconceptions")):
                rep.warn(
                    "errores",
                    f"misconception `{record['id']}` dice pertenecer a `{node_id}`, "
                    "que no la declara",
                )


def check_transfer_mechanics(nodes, rep: Report) -> None:
    """K exige que un ítem `transfer` corra sobre una mecánica ajena a la del origen."""
    for node_id, node in sorted(nodes.items()):
        source = set(as_list(node.get("mechanics")))
        if not source:
            continue
        for ref in as_list(node.get("transfer_to")):
            target = nodes.get(ref)
            if not target:
                continue
            shared = set(as_list(target.get("mechanics")))
            if shared and shared <= source:
                rep.warn(
                    "transfer",
                    f"`{node_id}` → `{ref}`: el destino no aporta ninguna mecánica nueva "
                    f"({sorted(shared)}); K pide una mecánica ajena",
                )


def check_probe_distractors(nodes, spine, rep: Report) -> None:
    """F0: los distractores de `explain` son misconceptions del nodo, así que clasifican."""
    spine_ids = {entry["id"] for entry in spine if isinstance(entry, dict)}
    for node_id in sorted(spine_ids):
        node = nodes.get(node_id)
        if node and node.get("level") == 0:
            continue  # en nivel 0 el error todavía no es conceptual
        if node and not as_list(node.get("misconceptions")):
            rep.warn(
                "probes",
                f"`{node_id}` es de espina y no declara misconceptions: sus distractores "
                "de `explain` no pueden clasificar (F0)",
            )


def check_spine(nodes, spine, rep: Report) -> None:
    """spine ⇒ probes completas, doc existente, y orden compatible con prereqs."""
    position = {entry["id"]: entry["n"] for entry in spine if isinstance(entry, dict)}

    declared = {node_id for node_id, node in nodes.items() if node.get("spine")}
    listed = set(position)
    for node_id in sorted(listed - declared):
        rep.error("espina", f"`{node_id}` está en spine.yaml y no tiene `spine: true` en el grafo")
    for node_id in sorted(declared - listed):
        rep.error("espina", f"`{node_id}` tiene `spine: true` y no está en spine.yaml")

    for entry in spine:
        node_id = entry["id"]
        node = nodes.get(node_id)
        if node is None:
            rep.error("espina", f"spine.yaml: `{node_id}` no existe en el grafo")
            continue
        where = f"`{node_id}` (espina {entry['n']})"

        probes = as_list(node.get("probes"))
        if sorted(probes) != sorted(EVIDENCE):
            faltan = sorted(set(EVIDENCE) - set(probes))
            rep.error("espina", f"{where}: probes incompletas, faltan {faltan}")

        # los prereqs declarados en spine.yaml coinciden con los del grafo
        spine_prereqs = set(as_list(entry.get("prereqs")))
        graph_prereqs = set(as_list(node.get("prereqs")))
        if spine_prereqs != graph_prereqs:
            rep.error(
                "espina",
                f"{where}: prereqs de spine.yaml {sorted(spine_prereqs)} "
                f"≠ los del grafo {sorted(graph_prereqs)}",
            )

        # orden: todo prerequisito de espina aparece antes
        for prereq in graph_prereqs:
            if prereq in position and position[prereq] >= entry["n"]:
                rep.error(
                    "espina",
                    f"{where}: su prerequisito `{prereq}` está en la posición "
                    f"{position[prereq]}, no antes",
                )

        # el archivo D1 y el minijuego existen
        doc = node.get("doc")
        if not doc:
            rep.error("espina", f"{where}: sin campo `doc`")
        elif not (ROOT / doc).exists():
            rep.error("espina", f"{where}: falta el D1 {doc}")

        minigame = DOCS / "F-minijuegos" / f"{node_id}.md"
        if not minigame.exists():
            rep.error("espina", f"{where}: falta el minijuego {rel(minigame)}")


def check_cheatsheet(nodes, catalogs, rep: Report) -> None:
    known = catalogs.get("cheatsheet")
    if known is None:
        return

    referenced: set[str] = set()
    for node_id, node in sorted(nodes.items()):
        entries = as_list(node.get("cheatsheet"))
        referenced |= set(entries)
        level = node.get("level")
        layers = as_list(node.get("layers")) or ["symbolic", "formal"]
        needs = isinstance(level, int) and level >= 1 and {"symbolic", "formal"} & set(layers)
        if needs and not entries:
            rep.error(
                "cheatsheet",
                f"`{node_id}` ({node['_file']}): level ≥ 1 con capa symbolic o formal "
                "y sin entrada de cheatsheet",
            )

    for entry in sorted(known - referenced):
        rep.warn("cheatsheet", f"la entrada `{entry}` no la declara ningún nodo")

    for entry in sorted(known):
        if not CS_RE.match(entry):
            rep.error("cheatsheet", f"el id `{entry}` no sigue cs.<area>.<slug>")


def check_challenges(nodes, aliases, catalogs, rep: Report) -> dict[str, set[str]]:
    """Los desafíos resuelven a nodos existentes. Devuelve nodo → desafíos (derivado)."""
    doc = catalogs.get("_challenges_doc")
    derived: dict[str, set[str]] = {}
    if not doc:
        return derived

    cs_known = catalogs.get("cheatsheet")
    for challenge in doc.get("challenges") or []:
        cid = challenge.get("id")
        for ref in as_list(challenge.get("requires")):
            target = ref if ref in nodes else aliases.get(ref)
            if target is None:
                rep.error("desafios", f"`{cid}`: requires `{ref}` no existe en el grafo")
            else:
                derived.setdefault(target, set()).add(cid)
        if cs_known is not None:
            for ref in as_list(challenge.get("cheatsheet_refs")):
                if ref not in cs_known:
                    rep.error("desafios", f"`{cid}`: cheatsheet_refs `{ref}` no existe")
        for mechanic in as_list(challenge.get("mechanics")):
            known = catalogs.get("mechanics")
            if known is not None and mechanic not in known:
                rep.error("desafios", f"`{cid}`: mecánica `{mechanic}` no existe")

    # cobertura: qué nodos de espina no aparecen en el `requires` de ningún desafío
    spine_ids = {n_id for n_id, n in nodes.items() if n.get("spine")}
    uncovered = sorted(spine_ids - set(derived))
    if uncovered:
        by_area: dict[str, int] = {}
        for node_id in uncovered:
            area = nodes[node_id].get("area")
            by_area[area] = by_area.get(area, 0) + 1
        resumen = ", ".join(f"{a}:{c}" for a, c in sorted(by_area.items()))
        rep.warn(
            "desafios",
            f"{len(uncovered)} de {len(spine_ids)} nodos de espina no los requiere ningún "
            f"desafío, así que ninguno exige desafío para `mastered` ({resumen})",
        )

    for node_id, node in nodes.items():
        if "challenges" in node:
            rep.error(
                "desafios",
                f"`{node_id}` ({node['_file']}): `challenges` es derivado, no se escribe a mano",
            )
        if "unlocks" in node:
            rep.error(
                "derivados",
                f"`{node_id}` ({node['_file']}): `unlocks` es derivado, no se escribe a mano",
            )
    return derived


def check_scene_backrefs(nodes, catalogs, rep: Report) -> None:
    """Las escenas declaran los nodos que las usan; las dos direcciones deben coincidir."""
    doc = catalogs.get("_scenes_doc")
    if not doc:
        return
    for scene in doc.get("scenes") or []:
        sid = scene.get("id")
        for ref in as_list(scene.get("nodes")):
            if ref not in nodes:
                rep.error("escenas", f"escena `{sid}`: nodo `{ref}` no existe")
    used = {s for node in nodes.values() for s in as_list(node.get("manim"))}
    for scene in doc.get("scenes") or []:
        if scene.get("id") not in used:
            rep.warn("escenas", f"la escena `{scene.get('id')}` no la usa ningún nodo")


def check_locales(nodes, spine, catalogs, rep: Report) -> None:
    """Toda clave de locale referenciada existe en `es`; se listan las faltantes en otros."""
    locales_dir = DOCS / "locales"
    if not locales_dir.exists():
        rep.missing("locales", locales_dir)
        return

    source = locales_dir / "es"
    spine_ids = {entry["id"] for entry in spine if isinstance(entry, dict)}

    # nodos
    node_strings: dict[str, dict] = {}
    for path in sorted((source / "nodes").glob("*.yaml")):
        doc = load(path, rep) or {}
        for node_id, value in (doc.get("nodes") or {}).items():
            if node_id in node_strings:
                rep.error("locales", f"clave duplicada nodes.{node_id} en {rel(path)}")
            node_strings[node_id] = value or {}

    for node_id in sorted(nodes):
        strings = node_strings.get(node_id)
        if strings is None:
            rep.error("locales", f"falta nodes.{node_id}.name en locales/es")
            continue
        if not strings.get("name"):
            rep.error("locales", f"falta nodes.{node_id}.name en locales/es")
        if node_id in spine_ids:
            probes = strings.get("probes") or {}
            faltan = sorted(set(EVIDENCE) - set(probes))
            if faltan:
                rep.error("locales", f"nodes.{node_id}.probes: faltan {faltan} en locales/es")
    for node_id in sorted(set(node_strings) - set(nodes)):
        rep.error("locales", f"locales/es define nodes.{node_id}, que no existe en el grafo")

    # catálogos con locale propio
    pairs = [
        ("mechanics.yaml", "mechanics", "mechanics"),
        ("analogies.yaml", "analogies", "analogies"),
        ("misconceptions.yaml", "misconceptions", "misconceptions"),
        ("calculator.yaml", "calculator", "calc_ops"),
        ("challenges.yaml", "challenges", "challenges"),
        ("cheatsheet.yaml", "cheatsheet", "cheatsheet"),
    ]
    for filename, key, catalog in pairs:
        known = catalogs.get(catalog)
        if known is None:
            continue
        path = source / filename
        if not path.exists():
            rep.error("locales", f"falta {rel(path)} para el catálogo {catalog}")
            continue
        doc = load(path, rep) or {}
        present = set(doc.get(key) or {})
        for missing in sorted(known - present):
            rep.error("locales", f"falta {key}.{missing} en {rel(path)}")
        for extra in sorted(present - known):
            rep.error("locales", f"{rel(path)} define {key}.{extra}, que no existe en {catalog}")

    # otros locales: solo se listan las claves faltantes
    for other in sorted(p for p in locales_dir.iterdir() if p.is_dir() and p.name != "es"):
        faltan = 0
        for path in sorted(source.rglob("*.yaml")):
            twin = other / path.relative_to(source)
            if not twin.exists():
                faltan += 1
        if faltan:
            rep.warn("locales", f"locale `{other.name}`: faltan {faltan} archivo(s) respecto de es")


def check_budget(nodes, budget, rep: Report) -> None:
    """Presupuesto por área dentro de ±20 % del declarado en D0-mapa.md."""
    counts: dict[str, int] = {}
    for node in nodes.values():
        counts[node.get("area")] = counts.get(node.get("area"), 0) + 1
    for area, target in sorted(budget.items()):
        actual = counts.get(area, 0)
        low, high = target * 0.8, target * 1.2
        if not low <= actual <= high:
            rep.warn(
                "presupuesto",
                f"área `{area}`: {actual} nodos, presupuesto {target} "
                f"(rango {low:.0f}–{high:.0f})",
            )
    for area in sorted(set(counts) - set(budget)):
        rep.warn("presupuesto", f"área `{area}` no figura en la tabla de D0-mapa.md")


def check_markdown_links(rep: Report) -> None:
    """Todo enlace relativo de la prosa resuelve a un archivo existente."""
    link = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
    for path in sorted(DOCS.rglob("*.md")):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for target in link.findall(line):
                if target.startswith(("http://", "https://", "#", "mailto:")):
                    continue
                clean = target.split("#", 1)[0]
                if not clean:
                    continue
                if not (path.parent / clean).exists():
                    rep.error("enlaces", f"{rel(path)}:{lineno}: enlace roto → {target}")


def check_prose_ids(nodes, aliases, catalogs, rep: Report) -> None:
    """Todo id citado entre comillas invertidas en la prosa resuelve, y no es un alias.

    Un alias resuelve en el validador pero no es el nombre vigente: citarlo en la
    prosa deja el documento apuntando a un id que puede desaparecer.
    """
    namespaces = [
        (re.compile(r"`(op_[a-z0-9_]+)`"), "calc_ops", "operación de calculadora"),
        (re.compile(r"`(cs\.[a-z0-9_]+\.[a-z0-9_]+)`"), "cheatsheet", "entrada de cheatsheet"),
        (re.compile(r"`(ch\.[a-z0-9_]+\.[a-z0-9_]+)`"), "challenges", "desafío"),
    ]

    # aliases declarados por los catálogos que los admiten
    catalog_aliases: dict[str, dict[str, str]] = {}
    for name, relpath, key in [
        ("calc_ops", "M-calculadora/calculator_ops.yaml", "ops"),
        ("challenges", "S-desafios/challenges.yaml", "challenges"),
    ]:
        doc = load(DOCS / relpath, rep)
        mapping: dict[str, str] = {}
        for record in (doc or {}).get(key) or []:
            for alias in as_list(record.get("aliases")):
                mapping[alias] = record["id"]
        catalog_aliases[name] = mapping

    node_ref = re.compile(r"`([a-z0-9]+\.[a-z0-9]{2,6}\.[a-z0-9_]+)`")
    # placeholders con los que la prosa documenta la convención de ids
    placeholders = {"cs.area.slug", "ch.area.slug", "area.cluster.slug"}

    # Una region marcada con <!-- alias-ok --> ... <!-- /alias-ok --> puede citar
    # aliases: es prosa cuyo tema son los aliases mismos (por ejemplo, la seccion de
    # M0 que documenta que ids se absorbieron en cual). Fuera de esas marcas, citar un
    # alias sigue siendo un error.
    alias_ok_open = re.compile(r"<!--\s*alias-ok\b[^>]*-->")
    alias_ok_close = re.compile(r"<!--\s*/alias-ok\b[^>]*-->")

    for path in sorted(DOCS.rglob("*.md")):
        alias_ok = False
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            where = f"{rel(path)}:{lineno}"
            if alias_ok_open.search(line):
                alias_ok = True
            if alias_ok_close.search(line):
                alias_ok = False

            for pattern, catalog, label in namespaces:
                known = catalogs.get(catalog)
                if known is None:
                    continue
                for ref in pattern.findall(line):
                    if ref in known or ref in placeholders:
                        continue
                    canonical = catalog_aliases.get(catalog, {}).get(ref)
                    if canonical:
                        if alias_ok:
                            continue
                        rep.error(
                            "prosa-ids",
                            f"{where}: cita el alias `{ref}`; el id vigente es `{canonical}`",
                        )
                    else:
                        rep.error("prosa-ids", f"{where}: {label} `{ref}` no existe")

            for ref in node_ref.findall(line):
                if ref in nodes:
                    continue
                if ref in aliases:
                    if alias_ok:
                        continue
                    rep.error(
                        "prosa-ids",
                        f"{where}: cita el alias `{ref}`; el id vigente es `{aliases[ref]}`",
                    )


def check_prose_hygiene(rep: Report) -> None:
    """Sin nombres de ManimGL fuera de I y de O.

    I es donde vive el mapping; O los nombra porque define el mini-Manim que los
    replica. En cualquier otro documento la visualización se describe con la
    gramática visual de H.
    """
    manim_class = re.compile(r"\b(?:VMobject|Mobject|Scene|Tex|MathTex|Transform|"
                             r"ReplacementTransform|FadeIn|FadeOut|NumberPlane|Axes|"
                             r"ValueTracker|always_redraw|play\(|self\.add)\b")
    exempt = {"I-manim", "O-arquitectura-tecnica.md"}
    for path in sorted(DOCS.rglob("*.md")):
        if path.parent.name in exempt or path.name in exempt:
            continue
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if manim_class.search(line):
                rep.warn(
                    "manim",
                    f"{rel(path)}:{lineno}: nombre de clase o método de ManimGL fuera de I",
                )


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


def collect_catalogs(rep: Report) -> dict:
    """Ids de cada catálogo. `None` cuando la sección todavía no existe."""
    catalogs: dict = {}

    specs = [
        ("mechanics", "E-mecanicas/mechanics.yaml", "mechanics", "E"),
        ("analogies", "G-analogias/analogies.yaml", "analogies", "G"),
        ("misconceptions", "L-modelo-errores/misconceptions.yaml", "misconceptions", "L"),
        ("patterns", "L-modelo-errores/explanation_patterns.yaml", "patterns", "L"),
        ("scenes", "I-manim/scenes.yaml", "scenes", "I"),
        ("calc_ops", "M-calculadora/calculator_ops.yaml", "ops", "M"),
        ("cheatsheet", "R-cheatsheet/cheatsheet_entries.yaml", "entries", "R"),
        ("challenges", "S-desafios/challenges.yaml", "challenges", "S"),
    ]
    for name, relpath, key, section in specs:
        path = DOCS / relpath
        if not path.exists():
            rep.missing(section, path)
            catalogs[name] = None
            continue
        doc = load(path, rep)
        catalogs[name] = ids_of(doc, key)
        if name == "challenges":
            catalogs["_challenges_doc"] = doc
        if name == "scenes":
            catalogs["_scenes_doc"] = doc

    # las misconceptions citan un patrón de explicación
    doc = load(DOCS / "L-modelo-errores/misconceptions.yaml", rep)
    if doc and catalogs.get("patterns") is not None:
        for record in doc.get("misconceptions") or []:
            pattern = record.get("pattern")
            if pattern and pattern not in catalogs["patterns"]:
                rep.error("errores", f"misconception `{record['id']}`: patrón `{pattern}` no existe")

    return catalogs


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quiet", action="store_true", help="solo errores")
    parser.add_argument("--stats", action="store_true", help="resumen del grafo")
    args = parser.parse_args()

    rep = Report()
    enums = load_schema(rep)
    nodes = load_graph(rep)
    spine = load_spine(rep)
    catalogs = collect_catalogs(rep)
    budget = load_budget(rep)
    aliases = build_alias_map(nodes, rep)

    check_ids_and_enums(nodes, enums, rep)
    check_references(nodes, aliases, catalogs, rep)
    check_acyclic(nodes, aliases, rep)
    check_redundant_prereqs(nodes, aliases, rep)
    check_mechanics_reuse(nodes, catalogs, rep)
    check_mechanic_coherence(nodes, catalogs, rep)
    check_skin_mechanics(nodes, rep)
    check_transfer_mechanics(nodes, rep)
    check_probe_distractors(nodes, spine, rep)
    check_spine(nodes, spine, rep)
    check_cheatsheet(nodes, catalogs, rep)
    check_challenges(nodes, aliases, catalogs, rep)
    check_scene_backrefs(nodes, catalogs, rep)
    check_locales(nodes, spine, catalogs, rep)
    check_budget(nodes, budget, rep)
    check_markdown_links(rep)
    check_prose_ids(nodes, aliases, catalogs, rep)
    check_prose_hygiene(rep)

    if args.stats:
        by_area: dict[str, int] = {}
        for node in nodes.values():
            by_area[node.get("area")] = by_area.get(node.get("area"), 0) + 1
        print(f"nodos: {len(nodes)} en {len(by_area)} áreas · espina: {len(spine)}")
        for area, count in sorted(by_area.items(), key=lambda kv: -kv[1]):
            print(f"  {area:8s} {count:3d}")
        print()

    if not args.quiet and rep.warnings:
        print(f"avisos ({len(rep.warnings)}):")
        for rule, msg in rep.warnings:
            print(f"  [{rule}] {msg}")
        print()

    if rep.errors:
        print(f"errores ({len(rep.errors)}):")
        for rule, msg in rep.errors:
            print(f"  [{rule}] {msg}")
        return 1

    print(f"sin errores · {len(nodes)} nodos, {len(spine)} en la espina, {len(rep.warnings)} aviso(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
