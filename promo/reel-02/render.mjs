// Renderiza reel.html cuadro a cuadro con Chromium y lo codifica con ffmpeg.
//
//   node render.mjs stills 0.5,3.2,5.6        cuadros sueltos a out/still-*.png
//   node render.mjs video --scale 2 --fps 60  video a out/video-<escala>.mp4
//
// Cada worker renderiza un tramo contiguo y lo codifica por su cuenta; al final
// se concatenan sin recodificar. Así no se guarda ningún PNG de 4K en disco.
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pw = (() => {
  try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); }
})();

const HERE = resolve(new URL(".", import.meta.url).pathname);
const ROOT = resolve(HERE, "../..");
const OUT = join(HERE, "out");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const FFMPEG = process.env.FFMPEG || "ffmpeg";

const MIME = { ".html": "text/html", ".json": "application/json", ".woff2": "font/woff2", ".js": "text/javascript" };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(ROOT)) throw new Error("fuera");
    const body = await readFile(p);
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const REL = HERE.slice(ROOT.length).replace(/\\/g, "/");
const url = (s, extra = "") => `http://127.0.0.1:${port}${REL}/reel.html?render=1&s=${s}${extra}`;

async function openPage(browser, s, extra) {
  const page = await browser.newPage({ viewport: { width: 1080 * s, height: 1920 * s }, deviceScaleFactor: 1 });
  await page.goto(url(s, extra));
  await page.evaluate(() => window.ready);
  return page;
}
const grab = (page) => page.locator("#c").screenshot({ type: "png", animations: "disabled", caret: "initial", scale: "css" });

await mkdir(OUT, { recursive: true });
const browser = await pw.chromium.launch({ args: ["--disable-gpu-vsync", "--disable-frame-rate-limit"] });
const hook = opt("hook") ? `&hook=${encodeURIComponent(opt("hook"))}` : "";

if (args[0] === "stills") {
  const s = Number(opt("scale", 0.5));
  const page = await openPage(browser, s, hook);
  for (const t of args[1].split(",").map(Number)) {
    await page.evaluate((t) => window.renderFrame(t), t);
    await writeFile(join(OUT, `still-${t.toFixed(2)}.png`), await grab(page));
  }
  console.log("stills listos");
} else if (args[0] === "video") {
  const s = Number(opt("scale", 2));
  const fps = Number(opt("fps", 60));
  const workers = Number(opt("workers", 3));
  const page0 = await openPage(browser, s, hook);
  const dur = await page0.evaluate(() => window.DUR);
  await page0.close();
  const total = Math.round(dur * fps);
  const per = Math.ceil(total / workers);
  const tag = opt("tag", `s${s}`);
  const t0 = Date.now();
  let doneFrames = 0;
  const parts = await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = w * per, b = Math.min(total, a + per);
    const file = join(OUT, `part-${tag}-${w}.mp4`);
    const ff = spawn(FFMPEG, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", opt("crf", "12"), "-pix_fmt", "yuv420p", "-profile:v", "high",
      "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-x264-params", "keyint=60:min-keyint=60", file], { stdio: ["pipe", "inherit", "inherit"] });
    const page = await openPage(browser, s, hook);
    for (let f = a; f < b; f++) {
      await page.evaluate((t) => window.renderFrame(t), f / fps);
      const png = await grab(page);
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
      if (++doneFrames % 60 === 0) console.log(`${doneFrames}/${total} cuadros, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
    await page.close();
    return file;
  }));
  const list = join(OUT, `parts-${tag}.txt`);
  await writeFile(list, parts.map((p) => `file '${p}'`).join("\n"));
  const outFile = join(OUT, `video-${tag}.mp4`);
  await new Promise((r) => spawn(FFMPEG, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", outFile], { stdio: "inherit" }).on("close", r));
  console.log(`video listo: ${outFile} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
server.close();
