# ADR 0012 — Per-turn stems over a monolithic render, because the host track is temporary

- **Number:** 0012
- **Title:** Episodes render as per-turn stems plus an assembly step, never as a monolith
- **Status:** accepted
- **Date:** 2026-07-27
- **Source:** issue #43, the maintainer's decision comment (2026-07-27T08:12Z).

## Context

Ep01's host track is explicitly a placeholder for the maintainer's own narration.
Rendering a monolith would mean paying the full guest cost (~3,911 credits) a second
time to change the host, or hand-editing audio. The script is 54 turns (27 HOST /
27 EXPERT), every turn inside `eleven_v3`'s per-request cap.

## Decision

From the #43 decision comment, verbatim:

> **§4A — per-turn stems plus assembly** (option 1). Rationale preserved: the host
> track is a placeholder for the maintainer's own narration, so the eventual swap must
> cost the 27 host turns (~1,163 credits), not a second full pass.

## Consequences

**Constrains M4:** `pipeline/core/episode.py` renders each turn as its own
descriptively-named stem with a sibling digest manifest, then assembles the master with
`ffmpeg`. Replacing the host re-renders 27 files (~1,163 credits) and leaves the guest
track untouched; a single bad turn costs ~40 credits to redo rather than a full pass.
The #46 mastering chain (loudness match → structure-aware gaps → polish → −16 LUFS
normalize) is built on this stem architecture, and per-speaker loudness matching is
only possible *because* the speakers exist as separate stems before concat.

## Reversal condition

Not recorded at decision time.
