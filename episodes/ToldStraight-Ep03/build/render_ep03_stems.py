#!/usr/bin/env python3
"""Render Ep03 stems from the script draft via ElevenLabs TTS.
Usage: render_ep03_stems.py J   (or A, or JA)  [--dry-run]
Quotes credits first; aborts if estimate exceeds SAFETY_CAP. Skips existing
files so re-runs resume. Retries transient failures; fails fast on 4xx."""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

SCRIPT = Path(
    "/Users/jaredgodar/.claude/jobs/01af3b30/tmp/20260729-toldstraight-ep03-script-draft-v1.md"
)
OUT = Path.home() / "ToldStraight-recordings" / "20260729-ep03-session" / "stems"
VOICES = {
    "J": ("EY5FCjATHRuLwJJXcDmf", "jaredv3"),
    "A": ("56bWURjYFHyYyVf490Dp", "emma-anna"),
}
MODEL = "eleven_multilingual_v2"
FMT = "mp3_44100_192"
RATE = 0.55  # measured credits per character on this account
SAFETY_CAP = 20000  # abort if quoted credits exceed this
KEY = os.environ["ELEVENLABS_API_KEY"]

which = sys.argv[1] if len(sys.argv) > 1 else "JA"
dry = "--dry-run" in sys.argv

lines = []
for raw in SCRIPT.read_text().splitlines():
    m = re.match(r"^\[([JA])(\d{2})\] (.+)$", raw.strip())
    if not m:
        continue
    role, num, text = m.group(1), m.group(2), m.group(3)
    text = re.sub(r"\*\[[^\]]*\]\*", "", text)  # inline stage directions
    text = re.sub(r"\*\*?", "", text)  # markdown emphasis
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"^[-—\s]+", "", text)
    if role in which:
        lines.append((f"{role}{num}", role, text))

total_chars = sum(len(t) for _, _, t in lines)
est = round(total_chars * RATE)
print(
    f"lines: {len(lines)} | chars: {total_chars} | quoted: ~{est} credits (rate {RATE}/char)"
)
if est > SAFETY_CAP:
    raise SystemExit(f"ABORT: quote {est} exceeds safety cap {SAFETY_CAP}")
if dry:
    raise SystemExit(0)

OUT.mkdir(parents=True, exist_ok=True)
ok = fail = skip = 0
for lid, role, text in lines:
    vid, vname = VOICES[role]
    out = OUT / f"20260729-elevenlabs-mv2-{vname}-ep03-{lid}.mp3"
    if out.exists() and out.stat().st_size > 1000:
        skip += 1
        continue
    body = json.dumps({"text": text, "model_id": MODEL}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format={FMT}",
        data=body,
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    done = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                out.write_bytes(r.read())
            done = True
            break
        except urllib.error.HTTPError as e:
            if e.code and 400 <= e.code < 500:
                print(f"{lid}: HTTP {e.code} (permanent) {e.read()[:200]}")
                break
            time.sleep(2 * (attempt + 1))
        except Exception:
            time.sleep(2 * (attempt + 1))
    if done:
        ok += 1
        print(f"{lid}: ok ({out.stat().st_size // 1024} KB)")
    else:
        fail += 1
        print(f"{lid}: FAILED after retries")
    time.sleep(0.4)
print(f"rendered {ok} | skipped {skip} | failed {fail} -> {OUT}")
