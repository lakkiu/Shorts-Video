#!/usr/bin/env python3
"""Original drift-phonk style track generator (cowbell riff, distorted 808, kick, clap, hats).

    python3 tools/phonk.py out.wav --bpm 128 --sections "intro:4 groove:7 break:1 groove:5 build:2 drop:4 outro:5" [--key F] [--seed 1]

Sections (bars): intro (filtered cowbell + ticks), groove (full beat), break (bass + cowbell only),
build (riser + snare roll), drop (impact + double hats + extra layer), outro (cowbell + pad, fade).
Prints the start time of every section so visuals can be cut on the beat. Everything is synthesized here,
so the track is free to use. Needs numpy and ffmpeg.
"""
import argparse, json, os, subprocess, sys, tempfile, wave
import numpy as np

SR = 44100
p = argparse.ArgumentParser()
p.add_argument("out")
p.add_argument("--bpm", type=float, default=128)
p.add_argument("--sections", default="intro:4 groove:8 build:2 drop:6 outro:4")
p.add_argument("--key", default="F")
p.add_argument("--seed", type=int, default=1)
p.add_argument("--json", help="write section times to this file")
p.add_argument("--heavy", action="store_true", help="harder 808 / clap for aura edits")
p.add_argument("--intro", default="ticks", choices=["ticks", "heartbeat"])
a = p.parse_args()
rng = np.random.default_rng(a.seed)

beat = 60 / a.bpm
bar = beat * 4
step = beat / 4
secs = [(s.split(":")[0], int(s.split(":")[1])) for s in a.sections.split()]
total_bars = sum(n for _, n in secs)
dur = total_bars * bar + 2.5
N = int(dur * SR)
t_all = np.arange(N) / SR

KEYS = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
root = KEYS[a.key]
def freq(semi_from_root, octave):  # natural minor degrees given as semitones from root
    n = root + semi_from_root + 12 * (octave + 1)
    return 440 * 2 ** ((n - 69) / 12)

stems = {k: np.zeros(N) for k in ["kick", "bass", "clap", "hat", "bell", "fx", "pad"]}
def add(name, start, sig):
    i = int(start * SR)
    if i >= N: return
    j = min(N, i + len(sig))
    stems[name][i:j] += sig[: j - i]

def env(n, attack=0.002, decay=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)
    return e

def kick(strength=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.22) + 0.3 * np.sin(ph * 2) * np.exp(-t / 0.03)
    return np.tanh(2.2 * s) * strength

def bass808(f0, f1, length):
    n = int(length * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.06) if f0 != f1 else np.full(n, f0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.minimum(1, t / 0.004) * np.exp(-t / (length * 0.55))
    return np.tanh((7.0 if a.heavy else 3.5) * s) * 0.8

def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    e = np.exp(-t / 0.06) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return nz * e * 0.6 + 0.25 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)

def hat(open_=False):
    n = int((0.18 if open_ else 0.035) * SR); t = np.arange(n) / SR
    return rng.standard_normal(n) * np.exp(-t / (0.06 if open_ else 0.012)) * (0.35 if open_ else 0.28)

def bell(f, length=0.32):
    n = int(length * SR); t = np.arange(n) / SR
    sq = lambda ff: np.sign(np.sin(2 * np.pi * ff * t))
    s = (sq(f) + 0.8 * sq(f * 1.4757)) * np.exp(-t / 0.11) * np.minimum(1, t / 0.001)
    return s * 0.22

def tick():
    n = int(0.02 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.004) * 0.25

def pad_note(f, length):
    n = int(length * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * k * t + k) / k for k in (1, 2, 3)) + 0.5 * np.sin(2 * np.pi * f * 1.005 * t)
    e = np.minimum(1, t / 1.2) * np.minimum(1, (length - t) / 1.2)
    return s * e * 0.08

# riff: 2 bars of 16 steps (semitones above root in a minor feel), octave 5
RIFF = [(0, 0), (3, 0), (6, 3), (8, 7), (10, 3), (12, 0), (14, -2),
        (16, 0), (19, 0), (22, 3), (24, 8), (26, 7), (28, 3), (30, 5)]
BASS = [(0, 0, 0, 0.8), (7, 0, 3, 0.5), (10, 3, 3, 0.6), (16, 0, 0, 0.8), (23, -2, 0, 0.5), (26, -4, -2, 0.6)]  # step, from, to, len(beats)

starts = {}
b0 = 0
for name, nbars in secs:
    starts.setdefault(name, []).append(round(b0 * bar, 3))
    for bi in range(nbars):
        T = (b0 + bi) * bar
        two = (b0 + bi) % 2
        full = name in ("groove", "drop", "build")
        # cowbell riff
        if name != "break" or True:
            for st, semi in RIFF:
                if st // 16 == two:
                    add("bell", T + (st % 16) * step, bell(freq(semi, 5)))
        if name == "intro" and a.intro == "heartbeat":
            for k in (0, 2):
                add("kick", T + k * beat, kick(0.55)); add("kick", T + k * beat + 0.18, kick(0.4))
            if bi == nbars - 1:  # reverse swell into the drop
                n = int(bar * SR); tt = np.arange(n) / SR
                add("fx", T, rng.standard_normal(n) * (tt / tt[-1]) ** 3 * 0.3)
        elif name == "intro":
            for k in range(8): add("fx", T + k * beat / 2, tick())
            if bi >= 2 and a.intro == "ticks":
                for k in range(8): add("hat", T + k * beat / 2, hat() * 0.5)
        if full:
            for k in range(4): add("kick", T + k * beat, kick(1.0 if k % 2 == 0 else 0.85))
            for k in (1, 3): add("clap", T + k * beat, clap())
            hats = 16 if name == "drop" else 8
            for k in range(hats):
                add("hat", T + k * bar / hats, hat(open_=(hats == 8 and k % 4 == 2)))
            if bi % 4 == 3 and name == "groove":  # triplet roll at end of phrase
                for k in range(6): add("hat", T + 3 * beat + k * beat / 6, hat() * 0.8)
        if name in ("groove", "drop", "break"):
            for st, f0s, f1s, ln in BASS:
                if st // 16 == two:
                    add("bass", T + (st % 16) * step, bass808(freq(f0s, 1) * (1 if f0s == f1s else 1), freq(f1s, 1), ln * beat))
        if name == "build":
            div = 8 if bi == 0 else 16
            for k in range(div): add("clap", T + k * bar / div, clap() * (0.4 + 0.6 * k / div))
        if name == "drop":
            for k in range(4): add("pad", T + k * beat, bell(freq(7, 6), 0.2) * 0.6)
        if name == "outro":
            add("pad", T, pad_note(freq(0, 3), bar + 0.5)); add("pad", T, pad_note(freq(3, 3), bar + 0.5))
    if name == "build":  # riser into the next section
        n = int(nbars * bar * SR); tt = np.arange(n) / SR
        add("fx", b0 * bar, rng.standard_normal(n) * (tt / tt[-1]) ** 2 * 0.25)
    if name == "drop":  # impact
        add("fx", b0 * bar, kick(1.6))
        n = int(1.2 * SR); add("fx", b0 * bar, np.tanh(rng.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.25)) * 0.3)
    b0 += nbars

tmp = tempfile.mkdtemp()
def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
for k, v in stems.items(): write(os.path.join(tmp, f"{k}.wav"), v / max(1e-9, np.abs(v).max()) * 0.9 if np.abs(v).max() > 0 else v)

intro_end = (secs[0][1] * bar) if secs[0][0] == "intro" else 0
filters = {
    "kick": "volume=1.0",
    "bass": "lowpass=f=" + ("240" if a.heavy else "180") + ",volume=" + ("1.15" if a.heavy else "0.9"),
    "clap": "highpass=f=700,bandpass=f=1800:width_type=q:w=0.8,aecho=0.8:0.4:60:0.25,volume=" + ("0.8" if a.heavy else "0.6"),
    "hat": "highpass=f=7000,volume=0.45",
    "bell": f"bandpass=f=1000:width_type=q:w=0.9,aecho=0.8:0.5:{int(beat*750)}:0.3,volume=0.55",
    "fx": "highpass=f=200,volume=0.55",
    "pad": "lowpass=f=2500,aecho=0.8:0.6:300:0.3,volume=0.7",
}
inputs, chains = [], []
for i, k in enumerate(stems):
    inputs += ["-i", os.path.join(tmp, f"{k}.wav")]
    chains.append(f"[{i}:a]{filters[k]}[s{i}]")
mix = ";".join(chains) + ";" + "".join(f"[s{i}]" for i in range(len(stems))) + f"amix=inputs={len(stems)}:normalize=0[m]"
# sidechain-style pump from the kick, gentle glue compression, loudness, fade out at the end
mix += f";[m]acompressor=threshold=0.25:ratio=3:attack=5:release=120,afade=t=out:st={dur-3:.2f}:d=3,loudnorm=I=-12:TP=-1:LRA=9[o]"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", mix, "-map", "[o]", "-ar", "44100", "-ac", "2", a.out], check=True)
info = {"bpm": a.bpm, "beat": beat, "bar": bar, "duration": round(dur, 3), "sections": [{"name": n, "bars": c} for n, c in secs], "starts": starts}
if a.json: json.dump(info, open(a.json, "w"), indent=2)
print(json.dumps(info))
