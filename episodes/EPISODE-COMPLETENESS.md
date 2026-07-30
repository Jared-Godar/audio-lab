# Episodes 1–3 — completeness matrix

Audit of 2026-07-30 (#99). Legend: **✓** done · **~** partial/draft · **✗** missing · **⛔** blocked on the voice/music work (#55 host stems · #117 Professional Voice Clone · #119 intro/outro music).

| Asset | E1 | E2 | E3 |
| --- | :--: | :--: | :--: |
| Script final | ✓ (host-read sheet) | ✓ (record sheets + markup) | ~ draft v1, unrecorded — #124 |
| Audio master (Jared's voice) | ⛔ placeholder-Daniel v2 only | ⛔ none rendered | ⛔ none rendered |
| Cover art | ✓ (+ show-cover) | ✓ | ✓ |
| Chapter art ch1–6 | ✓ | ✓ | ✓ |
| Cast / exhibit art | ✓ (Owen + Jared portraits) | ~ silhouettes — rebuild from color portraits | ✓ (Anna) |
| Transcript (md/txt/vtt/html) | ✓ full set | ✓ full set | ~ md/txt/vtt (no html), from draft |
| Show notes | ✓ md + html | ✓ md + html | ~ md only |
| Alt-text | ✓ | ✓ | ✓ |
| Captions (autosync) | ✓ | ✓ | ✗ |
| YouTube description | ✗ | ✓ | ✓ |
| Episode copy | ✗ | ✓ | ✓ |
| YouTube upload (#101) | ✗ | ✗ | ✗ |
| Transistor distro (#100) | ✗ | ✗ | ✗ |

## Findings

Content is in good shape. The true blocker to finishing M4 is **audio — all three episodes** — which is gated on the voice/music track (#55, #117, #119). The only real *content* hole is **E3's script**, still an unrecorded v1 draft (split to #124). Everything else is small and mechanical.

## Gap disposition

- **Audio (all three, ⛔)** — final masters in Jared's voice. Tracked: #55 (host stems), #117 (PVC), #119 (music). *The critical path.*
- **E3 script (~)** — review → finalize → regenerate derived content. Tracked: **#124**.
- **E2 cast cards (~)** — rebuild `host_des_fable.png` + `guest_michael_voss.png` from the color portraits (2026-07-29 decision; portraits exist in `episodes/cast/portraits/`). Checklist on #99.
- **E1 metadata (✗)** — add `youtube-description.txt` + `episode-copy.txt`. Checklist on #99.
- **E3 finish set (✗)** — generate `show-notes.html` + `captions-autosync.txt`. Checklist on #99.
- **Distribution (all ✗)** — YouTube #101, Transistor #100 (downstream of final audio).

This file is the living completeness record; update it as gaps close.
