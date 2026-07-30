# audio-lab — repo mechanics

**Read [`AGENTS.md`](AGENTS.md) first** — it is the binding contract for every session
here; this file adds only repo mechanics. Where they appear to conflict, `AGENTS.md`
wins.

## Repo shape

- `pipeline/` — uv-managed Python. `uv run voicelab` is the CLI.
- `docs/` — durable findings (`elevenlabs.md` has rates, tiers, account limits),
  ADRs under `docs/adr/`, runbook.
- `artifacts/` — **gitignored** working zone: handoffs, drafts, research notes.
  It is scratch: anything load-bearing gets promoted to a tracked home, because
  nothing here reaches a fresh clone or cloud session (#68).
- `tools/brand/` — Adobe Illustrator/InDesign builder scripts for the visual system.
  Episode art is built by **authoring** a JSX builder the maintainer runs manually in
  Illustrator (the licensed faces live only on his machine); the agent never renders
  or commits episode PNGs it produced itself.
- `brand/` — design tokens and the type-decision contact sheet.
- `infra/policies/` — verbatim JSON of the live IAM policies.
- `output/` — **gitignored** renders and audition results.
- `episodes/` — tracked deliverables (art, transcripts, notes). **Audio never enters
  git.** Episodes 1–3 are unpublished drafts.

## Artifact naming (repo shapes for conduct-core rule 5)

Rendered audio: `YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE[-BITRATE].mp3`, e.g.
`20260726-elevenlabs-multilingual_v2-Daniel-ep01-h25-model-ab-192k.mp3`. Vendor is
mandatory and comes second. Sample directories: `samples/<vendor>/<voice>-<short-id>/`.
Probes and smoke tests go in `_underscore-prefixed/` folders.

## ElevenLabs specifics

- The account bills at **0.55x** the advertised `character_cost_multiplier`. Verify
  with `uv run voicelab rates`; see `docs/elevenlabs.md`.
- `ELEVENLABS_API_KEY` lives in the shell environment — never in a `.env`, never in
  code, no dotenv dependency.
- HTTP 200 does **not** mean `voice_settings` were honored. Check the capability
  flags from `/v1/models` — v3 silently ignores `style` and `speaker_boost`.
- Quote credit cost before spending; print the ledger after.

## Changelog

Every substantive PR updates `CHANGELOG.md` in the same PR (enforced by
`.github/workflows/changelog.yml`). The **Findings** section is for things learned
about external services that are invisible in the diff.
