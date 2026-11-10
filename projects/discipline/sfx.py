#!/usr/bin/env python3
"""Sound effects track for the discipline video, timed from timing.json -> assets/audio/sfx.wav"""
import json, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(HERE, "timing.json")))
SR, BAR, BEAT = 44100, 1.875, 0.46875
N = int((T["duration"] + 1) * SR)
out = np.zeros(N)
rng = np.random.default_rng(7)

def add(t, sig, g=1.0):
    i = int(t * SR); j = min(N, i + len(sig)); out[i:j] += sig[: j - i] * g

def thud(heavy=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 + 60 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.09)
    click = rng.standard_normal(n) * np.exp(-t / 0.008) * 0.5
    return np.tanh((body + click) * 1.6) * 0.8 * heavy

def beep():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 1900 * t)) * 0.18 * np.minimum(1, (0.12 - t) / 0.02)

def clink():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2600 * t) + 0.6 * np.sin(2 * np.pi * 3900 * t)) * np.exp(-t / 0.06) * 0.25 + thud(0.4)[:n] * 0.6

def whoosh(d=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    return rng.standard_normal(n) * np.sin(np.pi * t / d) ** 2 * 0.12

for k in range(int((T["alarm"][1] - T["alarm"][0]) / 0.25)):
    if k % 4 != 3: add(T["alarm"][0] + k * 0.25, beep())
for b in T["wBricks"]:
    land = b.get("land", b.get("bar", 0) * BAR + 1.406)
    thr = b.get("thr", b.get("bar", 0) * BAR + 0.94)
    add(thr, whoosh(), 0.8)
    add(land, thud(1.0 + 0.05 * b["i"]))
add(T["gBricks"]["first"][1], thud(0.6))
for bar in range(T["gBricks"]["bars"][0], T["gBricks"]["bars"][1] + 1):
    add(bar * BAR + 0.469, thud(0.55))
add(T["phoneOff"], clink())
add(T["gThrow"], whoosh(), 0.8)
add(T["gLand"], thud(1.2))
for s, d in T["text"]:  # soft typewriter ticks
    n = int(d / 0.06)
    for k in range(n):
        m = int(0.02 * SR); tt = np.arange(m) / SR
        add(s + k * 0.06, rng.standard_normal(m) * np.exp(-tt / 0.003) * 0.12)

out = np.clip(out, -1, 1)
os.makedirs(os.path.join(HERE, "assets", "audio"), exist_ok=True)
with wave.open(os.path.join(HERE, "assets", "audio", "sfx.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print("sfx.wav", round(N / SR, 2), "s")
