"""Banda sonora del reel 02, sintetizada: música a 120 BPM y efectos en los
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
CH = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
BASS = [45, 41, 48, 43]
for bar, t0 in enumerate(np.arange(2.4, 20.4, 2.0)):
    for m in CH[bar % 4]:
        put(note(hz(m), 2.1, "pad"), t0, 0.05, pan=(m % 3 - 1) * 0.4)
for b in np.arange(2.4, 20.5, 0.5):
    put(kick(), b, 0.5)
    put(note(hz(BASS[int((b - 2.4) // 2) % 4]), 0.45, "bass"), b, 0.15)
    if 4.4 <= b < 17.0 or 17.5 <= b < 20.0:
        put(hat(), b + 0.25, 0.5, pan=0.3)
        if b >= 9.4:
            put(hat(), b + 0.125, 0.2, pan=-0.3)
for m in (48, 55, 60, 64, 67):
    put(note(hz(m), 3.4, "pad"), 21.0, 0.06)


def boing(t, up=True, g=0.12):
    """El salto del caminante: un barrido corto hacia arriba."""
    n = int(0.16 * SR)
    tt = np.arange(n) / SR
    f = (380 + 700 * tt / 0.16) if up else (900 - 500 * tt / 0.16)
    put(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14), t, g)


def ratchet(t, n=1, gap=0.06):
    for i in range(n):
        put(tick(2600, 0.02), t + i * gap, 0.22)
        put(tick(900, 0.03), t + i * gap + 0.005, 0.15)


# --- efectos ------------------------------------------------------------------
put(boom(1.2, 110, 36), 0.0, 0.55)
for i, m in enumerate((76, 81)):
    put(bell(hz(m), 1.2), 0.25 + i * 0.25, 0.05)
put(sweep_noise(0.5, 0.02, 0.6, rev=True), 1.2, 0.25)
put(boom(0.9, 120, 40), 1.72, 0.55)
put(bell(hz(84), 1.0), 1.72, 0.05)
put(tick(900, 0.08), 2.4, 0.25)
put(sweep_noise(0.9, 0.05, 0.4), 1.1, 0.15)
for i, t0 in enumerate((2.85, 3.25, 3.65)):
    ratchet(t0 - 0.05)
    boing(t0)
    put(tick(700 + i * 90, 0.08), t0 + 0.3, 0.3)
    put(note(hz(72 + [0, 2, 4][i]), 0.3, "pluck"), t0 + 0.3, 0.07)
put(sweep_noise(0.3, 0.05, 0.5), 3.95, 0.18)
put(tick(1100, 0.08), 4.3, 0.3)
ratchet(4.4, 2, 0.1)
boing(4.4, g=0.16)
put(boom(0.6, 90, 45), 4.9, 0.4)
for i, m in enumerate((72, 76, 79, 84)):
    put(bell(hz(m)), 4.9 + i * 0.07, 0.07)
put(sweep_noise(0.2, 0.2, 0.6), 5.45, 0.12)
ratchet(5.75, 2, 0.1)
boing(5.75, up=False, g=0.14)
put(tick(600, 0.08), 6.2, 0.3)
put(sweep_noise(0.7, 0.03, 0.6), 6.3, 0.3)
for i in range(6):
    put(bell(hz(79 - i * 2), 0.5), 7.05 + i * 0.26 + 0.2, 0.035)
put(bell(hz(88), 1.4), 7.72, 0.07)
put(boom(0.7, 80, 40), 7.72, 0.35)
put(sweep_noise(0.9, 0.02, 0.12), 7.0, 0.1)
put(boom(0.6, 70, 38), 8.63, 0.45)
put(sweep_noise(0.4, 0.05, 0.7), 9.3, 0.26)
put(tick(1200), 9.95, 0.2)
for i in range(4):
    boing(10.0 + i * 0.4, g=0.1)
    put(note(hz([76, 79, 81, 84][i]), 0.4, "pluck"), 10.32 + i * 0.4, 0.09)
for i, m in enumerate((79, 84, 88)):
    put(bell(hz(m), 1.2), 11.75 + i * 0.08, 0.06)
for i in range(4):
    put(tick(1500 + i * 150), 12.0 + i * 0.05 + 0.2, 0.2)
put(sweep_noise(0.5, 0.05, 0.8), 12.8, 0.26)
for i in range(6):
    t0 = 13.1 + i * 0.09 + 0.35
    put(tick(500 + (i % 3) * 120, 0.1), t0, 0.35, pan=np.sin(i * 1.7) * 0.6)
for i in range(6):
    put(sweep_noise(0.18, 0.2, 0.6), 14.0 + i * 0.06, 0.06, pan=np.sin(i) * 0.5)
rum = sweep_noise(1.0, 0.01, 0.02)
put(rum, 14.3, 0.5)
put(tick(1300, 0.06), 15.5, 0.25)
for i in range(3):
    put(tick(1600 + i * 200), 15.85 + i * 0.08, 0.22)
put(bell(hz(84), 1.2), 16.04, 0.07)
put(sweep_noise(0.4, 0.05, 0.8), 16.85, 0.25)
for i in range(21):
    put(note(hz([69, 72, 74, 76, 79][i % 5] + 12 * (i // 10)), 0.3, "pluck"), 17.55 + i * 0.1 + 0.085, 0.06, pan=np.sin(i * 0.9) * 0.6)
put(sweep_noise(0.95, 0.02, 0.9, rev=True), 19.8, 0.3)
put(boom(1.6, 120, 32), 20.8, 0.7)
for i, m in enumerate((72, 79, 84, 88)):
    put(bell(hz(m), 2.2), 21.0 + i * 0.12, 0.05)
boing(21.05, g=0.12)
boing(21.45, g=0.12)
put(boom(0.5, 90, 45), 21.95, 0.35)
put(bell(hz(91), 1.4), 22.0, 0.05)
put(tick(1000, 0.1), 22.4, 0.3)
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
