#!/usr/bin/env python3
"""Assemble Ep03 from rendered stems + room bed + train/printer gags.

Timeline: stems in script order, 350ms gaps (3.0s hold after J13 for the train
peak). Bed: speakers-off silence looped from the Ep02 take (per the 2026-07-29
reverb findings — NOT the contaminated roomtone-60s). Train: capture #1 first
swell, one bed, both voices, uniform. Printer: capture #2 whirr ending in its
natural stop-clunk. Output: loudnorm -16 LUFS, mp3 192k, self-describing name.
"""

import json
import re
import subprocess
from pathlib import Path

BASE = Path.home() / "ToldStraight-recordings"
SESSION = BASE / "20260729-ep03-session"
STEMS = SESSION / "stems"
SCRIPT = Path(
    "/Users/jaredgodar/.claude/jobs/01af3b30/tmp/20260729-toldstraight-ep03-script-draft-v1.md"
)
EP2 = (
    BASE
    / "20260729-ep02-session"
    / "20260729-quadcast-audition-ep02-jared-live-host-continuous-take.wav"
)
TRAIN = (
    BASE
    / "20260729-ep01-session"
    / "20260729-quadcast-office-train-passby-ambience-1.wav"
)
PRINTER = (
    BASE
    / "ambience"
    / "20260729-quadcast-office-train-passby-2-with-printer-ambience.wav"
)
OUT = (
    SESSION / "20260729-elevenlabs-mv2-jaredv3-emma-ep03-results-are-in-draft1-192k.mp3"
)

GAP = 0.35
HOLD_AFTER = {"J13": 3.0}  # train peaks in the held silence
TRAIN_SEG = (1.5, 9.5)  # capture #1: rise ~2.3s, peak ~3.4s, decay
TRAIN_GAIN_DB = -8
PRINTER_SEG = (7.0, 15.8)  # whirr, clunk lands ~8.0s into segment
PRINTER_GAIN_DB = -8
BED_SEG = (103.0, 108.0)  # speakers-off gap inside the Ep02 take
BED_GAIN_DB = 3  # "a touch" audible above nothing


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(
            "FAILED: " + " ".join(map(str, cmd))[:200] + "\n" + r.stderr[-400:]
        )
    return r


def dur(p):
    return float(
        run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(p),
            ]
        ).stdout.strip()
    )


# script order
order = []
for raw in SCRIPT.read_text().splitlines():
    m = re.match(r"^\[([JA]\d{2})\] ", raw.strip())
    if m:
        order.append(m.group(1))

# locate stems, verify complete
stem = {}
for lid in order:
    hits = list(STEMS.glob(f"*-ep03-{lid}.mp3"))
    if not hits:
        raise SystemExit(f"missing stem for {lid} — render it first")
    stem[lid] = hits[0]

# timeline + per-stem RMS (for gentle leveling toward TARGET, capped ±4 dB)
TARGET_RMS = -20.0


def rms(p):
    r = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(p),
            "-af",
            "astats=metadata=0",
            "-f",
            "null",
            "-",
        ],
        capture_output=True,
        text=True,
    )
    m = re.search(r"RMS level dB: (-?[\d.]+)", r.stderr)
    return float(m.group(1)) if m else TARGET_RMS


t, timeline = 0.0, []
for lid in order:
    d = dur(stem[lid])
    g = max(-4.0, min(4.0, TARGET_RMS - rms(stem[lid])))
    timeline.append(
        {"line": lid, "start": round(t, 3), "dur": round(d, 3), "gain_db": round(g, 1)}
    )
    t += d + GAP + HOLD_AFTER.get(lid, 0.0)
total = t + 1.5
tl = {e["line"]: e for e in timeline}

# anchor effects to lines
a13 = tl["A13"]
train_at = max(0.0, a13["start"] + a13["dur"] - 4.0)
j22 = tl["J22"]
clunk_at = j22["start"] + 3.0
printer_at = max(0.0, clunk_at - (15.0 - PRINTER_SEG[0]))

(SESSION / "20260729-ep03-assembly-timeline.json").write_text(
    json.dumps(
        {
            "total_s": round(total, 2),
            "train_at": round(train_at, 2),
            "printer_at": round(printer_at, 2),
            "timeline": timeline,
        },
        indent=1,
    )
)

# build filtergraph
parts, fc = [], []
for i, lid in enumerate(order):
    parts.append(str(stem[lid]))
n = len(order)
inputs = []
for p in parts:
    inputs += ["-i", p]
inputs += ["-i", str(EP2), "-i", str(TRAIN), "-i", str(PRINTER)]
bed_i, train_i, printer_i = n, n + 1, n + 2

for i, lid in enumerate(order):
    L, R = (0.55, 0.45) if lid.startswith("J") else (0.45, 0.55)  # gentle seating
    fc.append(
        f"[{i}:a]aresample=48000,aformat=channel_layouts=mono,"
        f"volume={tl[lid]['gain_db']}dB,"
        f"pan=stereo|c0={L}*c0|c1={R}*c0,"
        f"adelay={int(tl[lid]['start'] * 1000)}:all=1[s{i}]"
    )
fc.append("".join(f"[s{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0[dlg]")
CENTER = "pan=stereo|c0=0.5*c0|c1=0.5*c0"
fc.append(
    f"[{bed_i}:a]atrim={BED_SEG[0]}:{BED_SEG[1]},asetpts=PTS-STARTPTS,"
    f"aloop=loop=-1:size=240000,atrim=0:{total:.2f},"
    f"volume={BED_GAIN_DB}dB,{CENTER},afade=t=out:st={total - 1.5:.2f}:d=1.5[bed]"
)
fc.append(
    f"[{train_i}:a]atrim={TRAIN_SEG[0]}:{TRAIN_SEG[1]},asetpts=PTS-STARTPTS,"
    f"volume={TRAIN_GAIN_DB}dB,{CENTER},adelay={int(train_at * 1000)}:all=1[trn]"
)
fc.append(
    f"[{printer_i}:a]atrim={PRINTER_SEG[0]}:{PRINTER_SEG[1]},asetpts=PTS-STARTPTS,"
    f"volume={PRINTER_GAIN_DB}dB,{CENTER},adelay={int(printer_at * 1000)}:all=1[prn]"
)
fc.append(
    "[dlg][bed][trn][prn]amix=inputs=4:normalize=0,"
    "acompressor=threshold=-24dB:ratio=2:attack=15:release=250:makeup=2,"
    "loudnorm=I=-16:TP=-1.5:LRA=11[out]"
)

fscript = SESSION / "filtergraph.txt"
fscript.write_text(";\n".join(fc))
run(
    ["ffmpeg", "-hide_banner", "-y"]
    + inputs
    + [
        "-filter_complex_script",
        str(fscript),
        "-map",
        "[out]",
        "-t",
        f"{total:.2f}",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        str(OUT),
    ]
)
print(f"episode: {OUT}")
print(
    f"runtime: {total / 60:.1f} min | train at {train_at:.1f}s | printer clunk at {clunk_at:.1f}s"
)
