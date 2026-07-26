# audio-lab — project instructions

Applies in addition to the global rules in `~/.claude/CLAUDE.md`.

## Generated artifacts must be self-describing (hard rule, 2026-07-26)

**Never name a file a human might open with a bare hash, UUID, or opaque token.**
This applies to every audio render, export, chart, report, or scratch artifact —
anything Jared could be asked to look at, listen to, or find in a folder.

Required shape for rendered audio:

```text
YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE].mp3
20260726-elevenlabs-multilingual_v2-Daniel-ep01-h25-model-ab-192k.mp3
20260723-edge-tts-en-US-AriaNeural-audition-script.mp3
```

**Vendor is mandatory and comes second**, so you can tell at a glance who
generated a file without inspecting it — this repo will accumulate more than one
TTS provider. Omit the model segment only for vendors that have no model concept.

Directories follow the same rule: `samples/<vendor>/<voice>-<short-id>/`, e.g.
`samples/elevenlabs/daniel-onwK4e9Z/`. Never a bare voice id as a folder name.

Generalised: `DATE-VENDOR-ENGINE-SUBJECT-PURPOSE`.

- Cache correctness is **not** an excuse for hash filenames. Keep the exact
  parameter digest in a sibling `manifest.json` and give the file a readable name.
  The filename is for people; the index is for lookups.
- Collisions get a numeric suffix (`-2`, `-3`), never a hash fallback.
- Throwaway renders (probes, smoke tests) go in an underscore-prefixed folder like
  `_billing-probes/` so they never dilute the listenable set.
- Any new render path must take a `purpose` argument. If a caller can't say what a
  sample is for, that's a design smell — fix the caller.

**Why:** hash-named renders forced Jared into an alphanumeric scavenger hunt every
time he was asked to listen to something. The tool knows exactly what it made and
why at the moment it writes the file; discarding that is a pure, self-inflicted loss.

**How to apply:** before writing any artifact, ask "if this were the only file in a
folder six weeks from now, would its name explain it?" If not, rename it before it
lands, not after.

## Repo shape

- `pipeline/` — uv-managed Python. `uv run audition` is the CLI.
- `docs/` — durable findings (`elevenlabs.md` has rates, tiers, account limits).
- `artifacts/` — **gitignored** working zone: session handoffs, walkthroughs, guides.
- `output/` — **gitignored** renders and audition results.
- `episodes/` — tracked deliverables (art, transcripts, notes). Audio is ignored.

## ElevenLabs specifics

- The account bills at **0.55x** the advertised `character_cost_multiplier`.
  Verify with `uv run audition --check-rates`; see `docs/elevenlabs.md`.
- `ELEVENLABS_API_KEY` lives in the shell environment, not in a `.env` and never
  in code. Don't add a dotenv dependency for it.
- A model returning HTTP 200 does **not** mean it honoured your `voice_settings`.
  Check the capability flags from `/v1/models` — v3 silently ignores `style` and
  `speaker_boost`.
- Quote credit cost before spending it, and print the ledger after.

## Changelog

This repo has a `CHANGELOG.md`. Per the global rule, any substantive change updates
it in the same commit. The **Findings** section is for things learned about external
services that aren't visible in the diff.
