# audition-v1 — frozen multi-engine audition tool (retired)

This is a **snapshot**, kept runnable but no longer developed. It was moved here
verbatim from `pipeline/audition/` by `git mv` on 2026-07-26 (issue #6). Nothing in
`audition/` is edited beyond this directory's `pyproject.toml` / `.python-version` /
`README.md` — the source is preserved as-is.

## Why it was retired

The fresh-start decision for "Told Straight" is **ElevenLabs only**; edge-tts and
Kokoro are dropped from the go-forward path. Building across three backends forced the
shared `Voice` shape down to a lowest common denominator that **cannot carry
`voice_settings`** (`stability`, `similarity_boost`, `style`, `use_speaker_boost`,
`speed`) — the single most important thing an ElevenLabs-only tool needs. The
replacement is `pipeline/core/` (issue #6), which is ElevenLabs-only and
`voice_settings`-carrying, with shared-library browsing (issue #7).

The ElevenLabs invariants this tool discovered — the measured 0.55× account rate, the
bounded-retry / re-bill-safe synthesis, the descriptive-filename + manifest cache, the
`/v1/history` rate derivation — are **carried forward** into `pipeline/core/`, not lost
with this snapshot.

## Run it

From the repo root:

```fish
uv run --project archive/audition-v1 audition --list-models   # models, rates, tiers
uv run --project archive/audition-v1 audition --help
```

It writes samples and results under `archive/output/auditions/` (its `REPO_ROOT`
resolves to `archive/` from this location — a harmless quirk of the snapshot; the path
is gitignored). ElevenLabs synthesis still requires `ELEVENLABS_API_KEY` in the shell
and **spends real credits** — the snapshot is for reference, not routine renders.
