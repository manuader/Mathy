/*
 * Motor común de las piezas promocionales: curvas de ManimGL, glifos del atlas del
 * juego, tipografía cinética y fondo. Cada reel define sus actos encima.
 */
const W = 1080, H = 1920, DUR = 24.5;
const q = new URLSearchParams(location.search);
const S = Number(q.get("s") || 1);
const C = {
  bg: "#0b0d10", surface: "#141821", surfaceHigh: "#1c2027", line: "#2a3038",
  ink: "#e8eaed", inkDim: "#9aa3ad", inkFaint: "#5b636d",
  accent: "#8ab4f8", ok: "#81c995", warn: "#f8c675",
};
const cv = document.getElementById("c");
cv.width = W * S; cv.height = H * S;
const ctx = cv.getContext("2d");

// --- tiempo y curvas (las de ManimGL que usa la app, más overshoot para entradas)
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => cl((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const sig = (x) => 1 / (1 + Math.exp(-x));
const smooth = (t) => { t = cl(t); const e = sig(-5); return cl((sig(10 * (t - 0.5)) - e) / (1 - 2 * e)); };
const rushInto = (t) => 2 * smooth(cl(t) / 2);
const rushFrom = (t) => 2 * smooth(cl(t) / 2 + 0.5) - 1;
const thereBack = (t) => smooth(t < 0.5 ? 2 * t : 2 - 2 * t);
const outBack = (t, s = 1.9) => { t = cl(t) - 1; return 1 + t * t * ((s + 1) * t + s); };
const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * cl(t)));
const inExpo = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * (cl(t) - 1)));
const outElastic = (t) => { t = cl(t); if (t === 0 || t === 1) return t; return Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3.2) + 1; };
const damp = (t, f = 3.2, d = 5) => (t <= 0 ? 0 : Math.exp(-d * t) * Math.sin(t * f * 2 * Math.PI));

function mulberry(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function mix(h1, h2, k) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const ch = (s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, cl(k)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

// --- glifos del atlas --------------------------------------------------------
let ATLAS = null;
const GP = {};
const gpath = (ch) => (GP[ch] ??= new Path2D(ATLAS[ch].path));
const adv = (ch) => ATLAS[ch].advance;
function glyph(ch, x, y, size, color, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.scale(size * (o.sx ?? 1), size * (o.sy ?? 1));
  ctx.globalAlpha *= a;
  if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow * S; }
  ctx.fillStyle = color;
  ctx.fill(gpath(ch));
  ctx.restore();
}
// Diagramación mínima: los operadores binarios llevan aire a los dos lados.
const OPS = new Set(["+", "=", "−", "×", "÷"]);
function mlay(chars, size) {
  let x = 0; const items = [];
  for (const ch of chars) {
    if (ch === " ") { x += size * 0.35; continue; }
    const pad = OPS.has(ch) ? size * 0.24 : 0;
    x += pad;
    items.push({ ch, x, w: adv(ch) * size, cx: x + (adv(ch) * size) / 2 });
    x += adv(ch) * size + pad;
  }
  return { items, width: x };
}

// --- texto de interfaz ---------------------------------------------------------
function font(size, weight = 600) { ctx.font = `${weight} ${size}px Inter`; }
/**
 * Tipografía cinética: cada palabra sube desde detrás de una máscara y sale por
 * arriba. `lines` es una lista de líneas; cada línea, una lista de [texto, color].
 */
function kinetic(t, { lines, y, size, weight = 700, tin, tout = 1e9, stagger = 0.055, lh = 1.12, x = W / 2, track = -0.02, punch = false }) {
  if (t < tin || t > tout + 0.8) return;
  font(size, weight);
  ctx.letterSpacing = `${track * size}px`;
  let k = 0;
  lines.forEach((line, li) => {
    const words = [];
    for (const [txt, col] of line) for (const w of txt.split(" ").filter(Boolean)) words.push([w, col]);
    const space = ctx.measureText(" ").width;
    const widths = words.map(([w]) => ctx.measureText(w).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    let cx = x - total / 2;
    const by = y + li * size * lh;
    ctx.save();
    if (!punch) { ctx.beginPath(); ctx.rect(0, by - size * 1.02, W, size * 1.34); ctx.clip(); }
    words.forEach(([w, col], i) => {
      const a0 = tin + k * stagger;
      const e = outExpo(P(t, a0, a0 + 0.5));
      const o = rushInto(P(t, tout + k * 0.025, tout + k * 0.025 + 0.28));
      k++;
      if (e <= 0) { cx += widths[i] + space; return; }
      ctx.save();
      ctx.fillStyle = col;
      if (punch) {
        const s = lerp(1.6, 1, outBack(P(t, a0, a0 + 0.42), 2.4)) * (1 - 0.2 * o);
        ctx.globalAlpha = cl(e * 2) * (1 - o);
        ctx.translate(cx + widths[i] / 2, by - size * 0.35);
        ctx.scale(s, s);
        ctx.fillText(w, -widths[i] / 2, size * 0.35);
      } else {
        const dy = (1 - e) * size * 1.1 - o * size * 1.15;
        if (o >= 1) { ctx.restore(); cx += widths[i] + space; return; }
        ctx.globalAlpha = cl(e * 1.5) * (1 - o);
        ctx.fillText(w, cx, by + dy);
      }
      ctx.restore();
      cx += widths[i] + space;
    });
    ctx.restore();
  });
  ctx.letterSpacing = "0px";
}
function label(t, { text, y, tin, tout, size = 30, color = C.inkDim }) {
  if (t < tin || t > tout + 0.4) return;
  const e = outExpo(P(t, tin, tin + 0.45)), o = rushInto(P(t, tout, tout + 0.3));
  font(size, 600);
  ctx.letterSpacing = `${size * 0.16}px`;
  const w = ctx.measureText(text).width;
  ctx.save();
  ctx.globalAlpha = e * (1 - o);
  // Una línea fina que crece antes del texto, como en los rótulos de la app.
  ctx.strokeStyle = hexA(C.accent, 0.9); ctx.lineWidth = 3;
  const lw = 46 * e;
  ctx.beginPath(); ctx.moveTo(W / 2 - w / 2 - 24 - lw, y - size * 0.36); ctx.lineTo(W / 2 - w / 2 - 24, y - size * 0.36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + w / 2 + 24, y - size * 0.36); ctx.lineTo(W / 2 + w / 2 + 24 + lw, y - size * 0.36); ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2 - w / 2 + (1 - e) * 30, y);
  ctx.restore();
  ctx.letterSpacing = "0px";
}

// --- primitivas ----------------------------------------------------------------
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function dot(x, y, r, color, a = 1) { if (a <= 0 || r <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
function ring(x, y, r, color, lw, a = 1) { if (a <= 0 || r <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore(); }
function glow(color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur * S; }

// Fondo: grilla de puntos con paralaje y viñeta, horneados una vez.
let GRID = null, VIG = null;
function bake() {
  GRID = document.createElement("canvas");
  GRID.width = 120 * S; GRID.height = 120 * S;
  const g = GRID.getContext("2d"); g.scale(S, S);
  g.fillStyle = hexA(C.line, 0.9);
  for (const [x, y] of [[0, 0], [60, 0], [0, 60], [60, 60]]) { g.beginPath(); g.arc(x + 30, y + 30, 1.7, 0, 7); g.fill(); }
  VIG = document.createElement("canvas");
  VIG.width = W * S; VIG.height = H * S;
  const v = VIG.getContext("2d"); v.scale(S, S);
  const rg = v.createRadialGradient(W / 2, H * 0.48, H * 0.22, W / 2, H * 0.5, H * 0.72);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.55)");
  v.fillStyle = rg; v.fillRect(0, 0, W, H);
}
function background(t, cam = { x: 0, y: 0, z: 1 }, alpha = 1) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // Un halo de acento muy tenue detrás del foco: profundidad por luminancia, sin sombras.
  const hg = ctx.createRadialGradient(W / 2, 1000, 0, W / 2, 1000, 900);
  hg.addColorStop(0, hexA(C.accent, 0.075)); hg.addColorStop(1, hexA(C.accent, 0));
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  const z = 0.6 + 0.4 * cam.z;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  const ox = ((-cam.x * 0.35) % 120 + 120) % 120 - 120, oy = ((-cam.y * 0.35 - t * 14) % 120 + 120) % 120 - 120;
  ctx.fillStyle = ctx.createPattern(GRID, "repeat");
  ctx.translate(ox, oy);
  ctx.scale(1 / S, 1 / S);
  ctx.fillRect(-W * S, -H * S, W * 3 * S, H * 3 * S);
  ctx.restore();
}


function keyToken(x, y, sym, a = 1, s = 1, lit = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  rrect(-64, -64, 128, 128, 24);
  ctx.fillStyle = C.surfaceHigh; ctx.fill();
  ctx.strokeStyle = mix(C.line, C.accent, lit); ctx.lineWidth = 3;
  if (lit > 0) glow(C.accent, 30 * lit);
  ctx.stroke(); ctx.shadowBlur = 0;
  const m = mlay([sym], 96);
  glyph(sym, -m.width / 2, 34, 96, C.ink);
  ctx.restore();
}
function finger(x, y, a, press) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const r = 40 * (1 - 0.14 * press);
  dot(x, y, r, "#ffffff", 0.16 + 0.1 * press);
  ring(x, y, r, "#ffffff", 3, 0.7);
  if (press > 0) ring(x, y, r + 26 * press, "#ffffff", 2, 0.35 * (1 - press));
  ctx.restore();
}
const bez = (p0, p1, p2, k) => ({ x: (1 - k) ** 2 * p0.x + 2 * (1 - k) * k * p1.x + k * k * p2.x, y: (1 - k) ** 2 * p0.y + 2 * (1 - k) * k * p1.y + k * k * p2.y });

function camera(focus, z, shake = { x: 0, y: 0 }) {
  ctx.translate(W / 2 + shake.x, 1000 + shake.y);
  ctx.scale(z, z);
  ctx.translate(-focus.x, -focus.y);
}
function shakeAt(t, t0, amp, dur = 0.5) {
  const k = P(t, t0, t0 + dur); if (k <= 0 || k >= 1) return { x: 0, y: 0 };
  const d = (1 - k) ** 2 * amp;
  return { x: Math.sin(t * 91) * d, y: Math.cos(t * 73) * d };
}

