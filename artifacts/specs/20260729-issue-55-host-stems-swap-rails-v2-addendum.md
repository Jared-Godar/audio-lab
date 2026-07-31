# Addendum v2 — issue #55 rails: per-source stem processing (2026-07-29)

Supplements `20260729-issue-55-host-stems-swap-rails.md` (v1, immutable). Where they
conflict, this addendum wins. Same contract-read preamble applies: read `AGENTS.md`,
`CLAUDE.md`, `~/.claude/CLAUDE.md`, and memory files first; durable contracts outrank
this spec.

## Maintainer direction (2026-07-29, verbatim intent)

After hearing the first assembled preview
(`~/ToldStraight-recordings/20260729-ep01-session/20260729-ffmpeg-ep01v2-preview-jared-host-jofra-expert-192k.mp3`),
the maintainer directed: the live human recording must be processed **separately** from
the approved recipe used on the synthetic (TTS) stems, so host and guest sound like
they are in the same room. Specifically:

1. **Tighter crops** on the dead space at the beginning and end of the human host
   stems from the recorded take.
2. **Post-processing to lower the constant background noise** in the human host audio.
3. **Optionally, a matched room-tone bed under the guest stems** so both voices share
   the same acoustic space (evaluate; A/B before adopting).

## Measured facts (PM session, 2026-07-29 — verify, don't trust)

- Noise floor of the take's silence gaps: **−51.1 dB RMS** (4.3 s gap at 170.2 s).
  Perceptually raised in the master because the loudness match applied ~+8.6 dB to the
  HOST track (−24.83 → −16.22 LUFS).
- The v1 preview used `master_from_stems` defaults; its per-stem trim was not tight
  enough on the human stems' edges (extraction kept 0.25 s pad each side plus whatever
  the silence detector's −35 dB threshold left).
- A 10 s room-tone capture exists at
  `~/ToldStraight-recordings/20260727-insitu/20260727-quadcast-audition-roomtone-10s.wav`
  — captured 2026-07-27 in the recording room; candidate source for the guest bed.
  Verify its noise character matches the new take before using it (the maintainer is
  re-recording; mic gain will differ).

## Implementation shape (executor decides details, reports choices)

- Add a **per-source processing profile** to the assembly path: stems supplied via
  `--host-stems DIR` (human) get: edge trim at a tighter threshold than the synthetic
  default, then broadband denoise (start with ffmpeg `afftdn`; consider `anlmdn` or
  `arnndn` if artifacts appear — report an A/B, do not pick silently). Synthetic stems
  keep the approved recipe untouched.
- Denoise strength is a parameter with a recorded default, not a magic number; the
  master must not sound "underwater" — if denoise artifacts are audible, prefer a
  gentler setting and say so.
- The optional guest room-tone bed is **off by default** behind a flag; produce one
  A/B pair for the maintainer to judge (his call per issue #55 non-goals — take/sound
  acceptance is the maintainer's).
- Every processing step applied to a stem is stated in output (which stems, which
  filter, what setting) — never silent, same rule as format conversion.

## Superseded items in v1

- v1 §1 note on §4C ("the chain generalises") stands for loudness matching, but the
  preview also proved the *default trim + no denoise* does NOT generalise to live
  recordings — that is the gap this addendum closes.

## Unchanged

Everything else in v1: §4A option 1, turn-id matching, negative tests, zero credits,
metadata, workflow, stop conditions. The maintainer is re-recording with lower gain
(target peaks −12 to −6 dBFS) and a pop screen; take the narration directory as it
exists at run time.
