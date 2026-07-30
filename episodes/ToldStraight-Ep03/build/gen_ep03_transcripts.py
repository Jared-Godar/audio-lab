#!/usr/bin/env python3
"""Generate Ep03 transcript.txt, transcript.md, and transcript.vtt from the
script draft + assembly timeline (true stem timings)."""

import json
import re
from pathlib import Path

TMP = Path("/Users/jaredgodar/.claude/jobs/01af3b30/tmp")
SESSION = Path.home() / "ToldStraight-recordings" / "20260729-ep03-session"
PUB = SESSION / "publish"
PUB.mkdir(exist_ok=True)
SCRIPT = TMP / "20260729-toldstraight-ep03-script-draft-v1.md"
TLJ = SESSION / "20260729-ep03-assembly-timeline.json"

SPEAKER = {"J": "JARED (Host)", "A": "DR. ANNA SINCLAIR (Clinician — synthetic)"}

tl = {e["line"]: e for e in json.load(open(TLJ))["timeline"]}
lines = []
for raw in SCRIPT.read_text().splitlines():
    m = re.match(r"^\[([JA])(\d{2})\] (.+)$", raw.strip())
    if not m:
        continue
    role, num, text = m.groups()
    text = re.sub(r"\*\[[^\]]*\]\*", "", text)
    text = re.sub(r"\*\*?", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"^[-—\s]+", "", text)
    lines.append((f"{role}{num}", role, text))


def ts(sec, vtt=False):
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    if vtt:
        return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"
    return f"{int(m + h * 60)}:{int(s):02d}"


txt, md, vtt = [], [], ["WEBVTT", ""]
md.append("# Told Straight — Ep03: Session Two: The Results Are In\n")
md.append(
    "_Transcript. Dr. Anna Sinclair is a synthetic character (see disclosure in-episode). Timestamps from the assembled draft-1 mix._\n"
)
for i, (lid, role, text) in enumerate(lines):
    e = tl[lid]
    start, end = e["start"], e["start"] + e["dur"]
    txt.append(f"[{ts(start)}] {SPEAKER[role]}: {text}")
    md.append(f"**{SPEAKER[role]}** _[{ts(start)}]_: {text}\n")
    vtt.append(str(i + 1))
    vtt.append(f"{ts(start, True)} --> {ts(end, True)}")
    vtt.append(f"<v {SPEAKER[role]}>{text}")
    vtt.append("")

(PUB / "transcript.txt").write_text("\n\n".join(txt) + "\n")
(PUB / "transcript.md").write_text("\n".join(md))
(PUB / "transcript.vtt").write_text("\n".join(vtt))
print("wrote", len(lines), "cues ->", PUB)
