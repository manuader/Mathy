"""Banda sonora del reel 01, sintetizada: música a 120 BPM y efectos en los
tiempos exactos de reel.html. Sin samples de terceros, así no hay licencias.

    python3 audio.py out/audio.wav
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 24.5
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(3)


def put(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    R[i : i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


def lp(x, k):
    """Paso bajo de un polo; k en (0, 1], más chico es más oscuro."""
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc)
        y[i] = acc
    return y


def sweep_noise(dur, f0, f1, rev=False):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    ks = np.linspace(f0, f1, n)
    y = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc += ks[i] * (x[i] - acc)
        y[i] = acc
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    if rev:
        shape = np.linspace(0, 1, n) ** 3
    return y * shape


def boom(dur=1.2, f0=110, f1=38):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = rng.standard_normal(n) * np.exp(-t * 90) * 0.4
    return (np.sin(ph) * np.exp(-t * 3.2) + click) * 0.9


def tick(f=2200, dur=0.05, g=1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * g


def bell(f, dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 2.5), (2.01, 0.35, 4), (3.0, 0.15, 6), (4.2, 0.08, 9)])
    return s * np.minimum(1, t / 0.004)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    n = int(0.06 * SR)
    x = rng.standard_normal(n)
    x = x - lp(x, 0.5)
    return x * np.exp(-np.arange(n) / SR * 70) * 0.35


def note(f, dur, kind="pad"):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == "pad":
        s = sum(np.sin(2 * np.pi * f * d * t + d) for d in (0.996, 1.0, 1.004)) / 3
        s += 0.25 * sum(np.sin(2 * np.pi * 2 * f * d * t) for d in (0.998, 1.002)) / 2
        a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4)
        return s * a
    if kind == "bass":
        s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
        return s * np.minimum(1, t / 0.01) * np.exp(-t * 3)
    s = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)
    return s * np.exp(-t * 7) * np.minimum(1, t / 0.003)


hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- música -----------------------------------------------------------------
# Am  F  C  G, dos compases por acorde; entra con la balanza y cae en el error.
CH = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
BASS = [45, 41, 48, 43]
for bar, t0 in enumerate(np.arange(3.0, 20.5, 2.0)):
    ch = CH[bar % 4]
    for m in ch:
        put(note(hz(m), 2.1, "pad"), t0, 0.05, pan=(m % 3 - 1) * 0.4)
silent = lambda t: 5.45 <= t < 6.6
for b in np.arange(3.0, 20.5, 0.5):
    if silent(b):
        continue
    put(kick(), b, 0.55)
    put(note(hz(BASS[int((b - 3.0) // 2) % 4]), 0.45, "bass"), b, 0.16)
    if 6.6 <= b < 17.5 or 18.0 <= b < 20.0:
        put(hat(), b + 0.25, 0.5, pan=0.3)
        if b >= 11.5:
            put(hat(), b + 0.125, 0.22, pan=-0.3)
# arpegio en las cortes del montaje
for i, b in enumerate(np.arange(11.5, 17.5, 0.25)):
    m = CH[int((b - 3.0) // 2) % 4][i % 3] + 12
    put(note(hz(m), 0.25, "pluck"), b, 0.07, pan=np.sin(i) * 0.5)
# cierre en do mayor
for m in (48, 55, 60, 64, 67):
    put(note(hz(m), 3.4, "pad"), 21.0, 0.06)

# --- efectos ------------------------------------------------------------------
put(boom(1.6, 140, 34), 0.0, 0.9)
put(sweep_noise(0.5, 0.5, 0.05), 0.0, 0.25)
put(bell(hz(81), 1.2), 0.3, 0.05)
for i in range(1, 6):
    put(tick(1500 + i * 180), 1.0 + i * 0.075 + 0.22, 0.28, pan=-0.4 + i * 0.16)
put(sweep_noise(0.3, 0.3, 0.8), 1.75, 0.15)
put(sweep_noise(0.55, 0.02, 0.6, rev=True), 1.95, 0.3)
put(boom(0.8, 90, 40), 2.5, 0.5)
put(sweep_noise(0.4, 0.8, 0.1), 2.5, 0.3)
for i in range(12):
    put(tick(1200 + (i % 5) * 150, 0.04), 3.6 + i * 0.045 * 0.85, 0.16, pan=0.5 if i % 2 else -0.5)
put(tick(900, 0.08), 4.5, 0.3)
put(sweep_noise(0.45, 0.05, 0.4), 4.65, 0.14, pan=-0.4)
put(boom(1.1, 70, 30), 5.45, 0.75)
put(note(hz(40), 1.0, "bass"), 5.45, 0.25)
put(sweep_noise(0.55, 0.6, 0.05, rev=True)[::-1].copy(), 6.0, 0.22)
put(sweep_noise(0.9, 0.05, 0.5), 6.72, 0.16, pan=0.2)
put(tick(1800, 0.06), 7.2, 0.25, pan=-0.5)
put(tick(2000, 0.06), 7.6, 0.25, pan=0.5)
for i, m in enumerate((72, 76, 79, 84)):
    put(bell(hz(m)), 7.85 + i * 0.07, 0.07)
put(bell(hz(79), 1.4), 9.15, 0.07)
put(tick(1400), 9.5, 0.2)
put(tick(1600), 9.75, 0.2)
for t0 in (11.2, 12.7, 14.2, 15.7, 17.2):
    put(sweep_noise(0.4, 0.05, 0.7), t0, 0.26)
for bi in range(2):
    for i in range(3):
        put(tick(900 + i * 120, 0.07), 11.5 + 0.05 + i * 0.14 + bi * 0.07 + 0.27, 0.25, pan=-0.5 + bi)
put(tick(1100, 0.08), 13.45, 0.3)
put(tick(1300, 0.08), 13.85, 0.3)
put(bell(hz(84), 1.0), 14.1, 0.06)
put(tick(700, 0.1), 15.05, 0.35)
put(tick(760, 0.1), 15.55, 0.35)
for i in range(21):
    put(note(hz([69, 72, 74, 76, 79][i % 5] + 12 * (i // 10)), 0.35, "pluck"), 17.8 + i * 0.085, 0.06, pan=np.sin(i * 0.9) * 0.6)
put(sweep_noise(0.95, 0.02, 0.9, rev=True), 19.8, 0.3)
put(boom(1.6, 120, 32), 20.8, 0.7)
for i, m in enumerate((72, 79, 84, 88)):
    put(bell(hz(m), 2.2), 21.0 + i * 0.12, 0.06)
put(tick(1000, 0.1), 22.2, 0.3)
put(sweep_noise(0.45, 0.02, 0.8, rev=True), 24.05, 0.3)

# mezcla: un poco de compresión suave y normalización a -1 dBFS
mixd = np.stack([L, R], 1)
mixd = np.tanh(mixd * 1.4) / np.tanh(1.4)
fade = np.ones(N)
fade[-int(0.05 * SR):] = np.linspace(1, 0, int(0.05 * SR))
mixd *= fade[:, None]
mixd *= 0.89 / np.max(np.abs(mixd))
out = (mixd * 32767).astype(np.int16)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else "out/audio.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out.tobytes())
print("audio listo")
