/**
 * El horneador de glifos.
 *
 * Skia web no expone `Path.MakeFromText` ni `Paragraph.getPath`, así que el
 * contorno de un glifo no se puede pedir en runtime. Se hornea acá, en build
 * time, y el runtime solo dibuja.
 *
 * MathJax v4 con `liteAdaptor` corre sin DOM, y con `fontCache: 'none'` emite
 * un `<path d="...">` explícito por glifo en vez de un `<use>` que apunte a un
 * `<defs>` compartido. Ese path es la salida.
 *
 * PARA AGREGAR CARACTERES: sumá una entrada a `CHARSET` con el carácter tal
 * como lo va a pedir el consumidor, la expresión TeX mínima que lo produce, y
 * el codepoint que MathJax pone en `data-c`. El codepoint no siempre es el del
 * carácter: las variables van en itálica matemática, así que la `x` sale como
 * U+1D465 y no como U+0078. Para averiguarlo, tipografiá la expresión y mirá el
 * `data-c` del path; si no coincide con lo declarado el horneado falla, que es
 * la idea: una actualización de MathJax que cambie el mapeo se nota acá y no en
 * pantalla.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { mathjax } from "@mathjax/src/mjs/mathjax.js";
import { TeX } from "@mathjax/src/mjs/input/tex.js";
import { SVG } from "@mathjax/src/mjs/output/svg.js";
import { liteAdaptor } from "@mathjax/src/mjs/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/mjs/handlers/html.js";

interface CharSpec {
  /** La clave del atlas: el carácter que va a pedir el consumidor. */
  readonly char: string;
  /** La expresión TeX mínima que produce ese glifo y ningún otro. */
  readonly tex: string;
  /** El `data-c` esperado, en hexadecimal como lo escribe MathJax. */
  readonly code: string;
}

const CHARSET: readonly CharSpec[] = [
  { char: "0", tex: "0", code: "30" },
  { char: "1", tex: "1", code: "31" },
  { char: "2", tex: "2", code: "32" },
  { char: "3", tex: "3", code: "33" },
  { char: "4", tex: "4", code: "34" },
  { char: "5", tex: "5", code: "35" },
  { char: "6", tex: "6", code: "36" },
  { char: "7", tex: "7", code: "37" },
  { char: "8", tex: "8", code: "38" },
  { char: "9", tex: "9", code: "39" },
  { char: "x", tex: "x", code: "1D465" },
  { char: "y", tex: "y", code: "1D466" },
  { char: "a", tex: "a", code: "1D44E" },
  { char: "b", tex: "b", code: "1D44F" },
  { char: "n", tex: "n", code: "1D45B" },
  { char: "+", tex: "+", code: "2B" },
  // El menos de matemática es U+2212, no el guion U+002D que se escribe en TeX.
  { char: "−", tex: "-", code: "2212" },
  { char: "×", tex: "\\times", code: "D7" },
  { char: "÷", tex: "\\div", code: "F7" },
  { char: "=", tex: "=", code: "3D" },
  { char: "(", tex: "(", code: "28" },
  { char: ")", tex: ")", code: "29" },
  { char: ".", tex: ".", code: "2E" },
];

/** MathJax trabaja en unidades donde 1000 es un em. El atlas queda en em. */
const UNITS_PER_EM = 1000;

interface BakedGlyph {
  readonly char: string;
  readonly path: string;
  readonly advance: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

// --- Tipografiado -----------------------------------------------------------

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const document = mathjax.document("", {
  InputJax: new TeX({ packages: ["base"] }),
  // `linebreaks.inline: false` evita que v4 parta la expresión en varios `<svg>`
  // con `<mjx-break>` en el medio, que es lo que hace por defecto.
  OutputJax: new SVG({ fontCache: "none", linebreaks: { inline: false } }),
});

/** El SVG de una expresión, serializado. */
function typeset(tex: string): string {
  return adaptor.outerHTML(document.convert(tex, { display: false }));
}

interface Extracted {
  readonly d: string;
  /** El ancho del viewBox, que para un glifo solo es su avance. */
  readonly advance: number;
}

function extract(spec: CharSpec): Extracted {
  const html = typeset(spec.tex);

  if (html.includes("<use")) {
    throw new Error(`${spec.char}: MathJax usó la caché de fuente en vez de un path explícito`);
  }
  const svgs = html.match(/<svg\b/g) ?? [];
  if (svgs.length !== 1) {
    throw new Error(`${spec.char}: se esperaba un solo <svg> y salieron ${svgs.length}`);
  }
  const paths = [...html.matchAll(/<path\s+data-c="([0-9A-F]+)"\s+d="([^"]*)"/g)];
  if (paths.length !== 1) {
    throw new Error(`${spec.char}: se esperaba un solo <path> y salieron ${paths.length}`);
  }
  const [, code, d] = paths[0]!;
  if (code !== spec.code) {
    throw new Error(`${spec.char}: MathJax emitió data-c=${code} y se esperaba ${spec.code}`);
  }

  const viewBox = /<svg[^>]*\sviewBox="([^"]*)"/.exec(html);
  if (!viewBox) throw new Error(`${spec.char}: el <svg> no trae viewBox`);
  const box = viewBox[1]!.trim().split(/\s+/).map(Number);
  if (box.length !== 4 || box.some((v) => !Number.isFinite(v))) {
    throw new Error(`${spec.char}: viewBox ilegible "${viewBox[1]}"`);
  }
  const [minX, , width] = box as [number, number, number, number];
  if (minX !== 0) {
    throw new Error(`${spec.char}: el viewBox no arranca en 0, el avance dejó de ser su ancho`);
  }
  return { d: d!, advance: width };
}

// --- Contornos --------------------------------------------------------------

type Seg =
  | { readonly op: "M" | "L"; readonly pts: readonly [number, number] }
  | { readonly op: "Q"; readonly pts: readonly [number, number, number, number] }
  | { readonly op: "C"; readonly pts: readonly [number, number, number, number, number, number] }
  | { readonly op: "Z"; readonly pts: readonly [] };

const TOKEN = /([A-Za-z])|([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)|([\s,]+)|([^])/g;

/**
 * Convierte el `d` a segmentos absolutos.
 *
 * Solo entiende los comandos que la fuente de MathJax realmente usa (M, L, C,
 * Z) más los que se derivan sin ambigüedad (H, V, Q, y las variantes
 * relativas). Cualquier otro comando revienta a propósito: es preferible un
 * horneado que falla a un contorno silenciosamente deformado.
 */
function parsePath(d: string, who: string): Seg[] {
  const tokens: (string | number)[] = [];
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(d); m; m = TOKEN.exec(d)) {
    if (m[1] !== undefined) tokens.push(m[1]);
    else if (m[2] !== undefined) tokens.push(Number(m[2]));
    else if (m[4] !== undefined) throw new Error(`${who}: carácter inesperado "${m[4]}" en el path`);
  }

  const segs: Seg[] = [];
  let cmd = "";
  let i = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  const nums = (n: number): number[] => {
    const out: number[] = [];
    for (let k = 0; k < n; k++) {
      const v = tokens[i++];
      if (typeof v !== "number") throw new Error(`${who}: faltan coordenadas para "${cmd}"`);
      out.push(v);
    }
    return out;
  };

  while (i < tokens.length) {
    const head = tokens[i];
    if (typeof head === "string") {
      cmd = head;
      i++;
    } else if (cmd === "M") {
      cmd = "L";
    } else if (cmd === "m") {
      cmd = "l";
    } else if (cmd === "") {
      throw new Error(`${who}: el path no empieza con un comando`);
    }

    const rel = cmd === cmd.toLowerCase();
    const dx = rel ? cx : 0;
    const dy = rel ? cy : 0;

    switch (cmd.toUpperCase()) {
      case "M": {
        const [x, y] = nums(2) as [number, number];
        cx = x + dx;
        cy = y + dy;
        sx = cx;
        sy = cy;
        segs.push({ op: "M", pts: [cx, cy] });
        break;
      }
      case "L": {
        const [x, y] = nums(2) as [number, number];
        cx = x + dx;
        cy = y + dy;
        segs.push({ op: "L", pts: [cx, cy] });
        break;
      }
      case "H": {
        const [x] = nums(1) as [number];
        cx = x + dx;
        segs.push({ op: "L", pts: [cx, cy] });
        break;
      }
      case "V": {
        const [y] = nums(1) as [number];
        cy = y + dy;
        segs.push({ op: "L", pts: [cx, cy] });
        break;
      }
      case "Q": {
        const [x1, y1, x, y] = nums(4) as [number, number, number, number];
        const p: [number, number, number, number] = [x1 + dx, y1 + dy, x + dx, y + dy];
        cx = p[2];
        cy = p[3];
        segs.push({ op: "Q", pts: p });
        break;
      }
      case "C": {
        const [x1, y1, x2, y2, x, y] = nums(6) as [number, number, number, number, number, number];
        const p: [number, number, number, number, number, number] = [
          x1 + dx, y1 + dy, x2 + dx, y2 + dy, x + dx, y + dy,
        ];
        cx = p[4];
        cy = p[5];
        segs.push({ op: "C", pts: p });
        break;
      }
      case "Z": {
        cx = sx;
        cy = sy;
        segs.push({ op: "Z", pts: [] });
        break;
      }
      default:
        throw new Error(`${who}: comando "${cmd}" no soportado por el horneador`);
    }
  }

  if (segs.length === 0) throw new Error(`${who}: el path quedó vacío`);
  if (segs[0]!.op !== "M") throw new Error(`${who}: el path no empieza en M`);
  return segs;
}

/** Los t en (0,1) donde una cúbica tiene tangente horizontal o vertical. */
function cubicRoots(p0: number, p1: number, p2: number, p3: number): number[] {
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  const inside = (t: number): boolean => t > 0 && t < 1;
  if (Math.abs(a) < 1e-12) return Math.abs(b) < 1e-12 ? [] : [-c / b].filter(inside);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const r = Math.sqrt(disc);
  return [(-b + r) / (2 * a), (-b - r) / (2 * a)].filter(inside);
}

const cubicAt = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};

interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Caja de tinta exacta: incluye los extremos de las curvas, no sus controles. */
function inkBox(segs: readonly Seg[]): Box {
  const box: Box = {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };
  const add = (x: number, y: number): void => {
    if (x < box.minX) box.minX = x;
    if (x > box.maxX) box.maxX = x;
    if (y < box.minY) box.minY = y;
    if (y > box.maxY) box.maxY = y;
  };

  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  for (const seg of segs) {
    switch (seg.op) {
      case "M": {
        [cx, cy] = seg.pts;
        [sx, sy] = seg.pts;
        add(cx, cy);
        break;
      }
      case "L": {
        [cx, cy] = seg.pts;
        add(cx, cy);
        break;
      }
      case "Q": {
        const [x1, y1, x, y] = seg.pts;
        // Una cuadrática es una cúbica con los controles a dos tercios.
        const c1x = cx + (2 / 3) * (x1 - cx);
        const c1y = cy + (2 / 3) * (y1 - cy);
        const c2x = x + (2 / 3) * (x1 - x);
        const c2y = y + (2 / 3) * (y1 - y);
        for (const t of cubicRoots(cx, c1x, c2x, x)) add(cubicAt(cx, c1x, c2x, x, t), cy);
        for (const t of cubicRoots(cy, c1y, c2y, y)) add(cx, cubicAt(cy, c1y, c2y, y, t));
        cx = x;
        cy = y;
        add(cx, cy);
        break;
      }
      case "C": {
        const [x1, y1, x2, y2, x, y] = seg.pts;
        for (const t of cubicRoots(cx, x1, x2, x)) add(cubicAt(cx, x1, x2, x, t), cy);
        for (const t of cubicRoots(cy, y1, y2, y)) add(cx, cubicAt(cy, y1, y2, y, t));
        cx = x;
        cy = y;
        add(cx, cy);
        break;
      }
      case "Z": {
        cx = sx;
        cy = sy;
        break;
      }
    }
  }
  if (!Number.isFinite(box.minX)) throw new Error("el contorno no tiene puntos");
  return box;
}

// --- Normalización ----------------------------------------------------------

/**
 * Redondea a seis decimales y saca el `-0`, para que el JSON sea byte a byte
 * igual entre corridas.
 */
function fmt(n: number): number {
  const r = Math.round(n * 1e6) / 1e6;
  return Object.is(r, -0) ? 0 : r;
}

/**
 * MathJax dibuja en unidades de fuente con el eje Y hacia arriba; Skia lo tiene
 * hacia abajo. La conversión pasa acá y no en el consumidor: el atlas sale en
 * em con Y hacia abajo, listo para multiplicar por el tamaño de fuente.
 */
const toEmX = (x: number): number => fmt(x / UNITS_PER_EM);
const toEmY = (y: number): number => fmt(-y / UNITS_PER_EM);

function emitPath(segs: readonly Seg[]): string {
  let out = "";
  for (const seg of segs) {
    if (seg.op === "Z") {
      out += "Z";
      continue;
    }
    const nums: string[] = [];
    for (let k = 0; k < seg.pts.length; k += 2) {
      nums.push(String(toEmX(seg.pts[k]!)), String(toEmY(seg.pts[k + 1]!)));
    }
    out += seg.op + nums.join(" ");
  }
  return out;
}

function bake(spec: CharSpec): BakedGlyph {
  const { d, advance } = extract(spec);
  const segs = parsePath(d, spec.char);
  const box = inkBox(segs);
  return {
    char: spec.char,
    path: emitPath(segs),
    advance: toEmX(advance),
    left: toEmX(box.minX),
    right: toEmX(box.maxX),
    // El eje se da vuelta, así que el techo de la tinta sale del máximo y el
    // piso del mínimo.
    top: toEmY(box.maxY),
    bottom: toEmY(box.minY),
  };
}

// --- Salida -----------------------------------------------------------------

const glyphs: Record<string, BakedGlyph> = {};
for (const spec of CHARSET) {
  if (glyphs[spec.char]) throw new Error(`${spec.char}: carácter repetido en CHARSET`);
  glyphs[spec.char] = bake(spec);
  if (glyphs[spec.char]!.advance <= 0) throw new Error(`${spec.char}: avance no positivo`);
}

// Chequeo de orientación: con el eje Y hacia abajo la `y` baja de la línea de
// base y la `x` no. Si esto se invierte, la conversión de ejes se rompió.
const yGlyph = glyphs["y"]!;
const xGlyph = glyphs["x"]!;
if (!(yGlyph.bottom > 0.1 && xGlyph.bottom < 0.05 && yGlyph.top < 0 && xGlyph.top < 0)) {
  throw new Error(
    `eje Y mal convertido: y.bottom=${yGlyph.bottom} x.bottom=${xGlyph.bottom} ` +
      `y.top=${yGlyph.top} x.top=${xGlyph.top}`,
  );
}

// Claves ordenadas: correr el horneado dos veces tiene que dar el mismo byte.
const sorted: Record<string, BakedGlyph> = {};
for (const key of Object.keys(glyphs).sort()) sorted[key] = glyphs[key]!;

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "atlas.json");
writeFileSync(out, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");

console.log(`${Object.keys(sorted).length} glifos horneados en ${out}`);
console.log(`  y: top=${yGlyph.top} bottom=${yGlyph.bottom} (tiene descendente)`);
console.log(`  x: top=${xGlyph.top} bottom=${xGlyph.bottom} (no tiene)`);
