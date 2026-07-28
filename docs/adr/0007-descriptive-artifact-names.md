# ADR 0007 — Descriptive artifact names, cache identity in a manifest

- **Number:** 0007
- **Title:** Descriptive artifact names, cache identity in a manifest
- **Status:** accepted
- **Date:** 2026-07-26 (recorded as a hard rule in `CLAUDE.md` the same day)
- **Source:** `ROADMAP.md` § "Decisions and what they constrain" (entry migrated by #62);
  the operative rule text is `CLAUDE.md` § "Generated artifacts must be self-describing".

## Context

Hash-named renders (`76a676a12824.mp3`) forced the maintainer into an alphanumeric
scavenger hunt every time he was asked to listen to something. The generator knew the
date, model, voice, purpose, and bitrate at write time and discarded all of it.

## Decision

`YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE]`, vendor second. Cache identity lives in
a sibling `manifest.json`, never in the filename. The full rule — including collision
suffixes, underscore-prefixed probe folders, and the mandatory `purpose` argument — is
in `CLAUDE.md` § "Generated artifacts must be self-describing", which is authoritative.

## Consequences

**Constrains M1/M3:** anything adding a render parameter must extend the manifest key,
never the filename, and never fall back to a hash. Folders too:
`samples/<vendor>/<voice>-<short-id>/`.

## Reversal condition

Not recorded at decision time.
