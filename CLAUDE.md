# audio-lab — repo mechanics

**Read [`AGENTS.md`](AGENTS.md) first** — it is the binding contract for every session
here; this file adds only repo mechanics. Where they appear to conflict, `AGENTS.md`
wins.

## Repo shape

- `pipeline/` — uv-managed Python. `uv run voicelab` is the CLI.
- `docs/` — durable findings (`elevenlabs.md` has rates, tiers, account limits),
  ADRs under `docs/adr/`, runbook.
- `artifacts/` — **mostly gitignored, with two tracked exceptions.** Scratch by default
  (handoffs, drafts, research notes) — that half reaches no fresh clone or cloud session
  (#68), so anything load-bearing gets promoted. **But `.gitignore` carves out
  `artifacts/specs/` and `artifacts/issues/`, and 42 files under `artifacts/` are tracked
  and do reach every clone** (`git ls-tree -r --name-only origin/main -- artifacts | wc -l`).
  Treat those two directories as durable homes, not scratch. This whole directory is
  retired by D7 (#184): specs and issues become `docs/specs/`, scratch becomes
  `.local/sessions/`.
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

**The date token is `YYYYMMDDHHmmss` and it is mandatory** (maintainer decision
2026-08-01, [ADR 0021](docs/adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md)).
Fourteen digits, no separator, no `T`, no `Z`, then a hyphen — e.g.
`20260801225106-repo-file-structure-d3-assessment-report.md`. It applies to every
generated document, script, walkthrough and maintainer-requested document. Get it from
`date "+%Y%m%d%H%M%S"`; it stamps **creation**, and does not change when the file is
edited.

Second granularity is not decoration: three documents authored on 2026-08-01 would
otherwise have shared the prefix `20260801-` and sorted arbitrarily against each other.
It supersedes both prior formats — the bare `YYYYMMDD-` and the `YYYYMMDDTHHMMSSZ-` used
in `artifacts/walkthroughs/`.

**Exempt — filenames read by exact name, where a rename breaks behaviour:**
`README.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` (GitHub renders
these by name), `AGENTS.md` and `CLAUDE.md` (agent tooling loads them by name),
`.github/**` (GitHub requires exact paths), `docs/adr/NNNN-*.md` (deliberate sequential
numbering), and `pipeline/**` Python sources (a digit-leading filename is not a legal
Python module name). Extending this list is a maintainer decision, not a judgement call at
filing time.

Files dated before 2026-08-01 keep their existing prefixes until **D7 (#184)** renames
them as part of the reorg, which is already rewriting every inbound reference.

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
