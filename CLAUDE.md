# audio-lab — project instructions

**Read [`AGENTS.md`](AGENTS.md) first.** It holds the standing commitments that bind
every session here — the meta-contract, the do-automatically list, the
hold-for-the-maintainer list, and the canonical PR workflow. This file adds
session-mode rules and repo specifics on top. Where they appear to conflict,
`AGENTS.md` wins.

Also applies: the global rules in `~/.claude/CLAUDE.md`.

## Session modes

**PM thread (VS Code chat) — decide, document, verify, gate.**

- Plans work, records decisions, authors executor specs under `prompts/`.
- Verifies executor output read-only (`gh pr view`, `gh pr checks`, diffs, git log).
- Announces merge **HOLD** / **GREEN LIGHT**.
- Does **not** mutate state: no commits, pushes, PRs, merges, `gh api -X`, or
  direct file edits. If it changes state or runs a mutating command, it is
  executor work — write a spec and hand it off.

**Executor session (CLI) — implement exactly what the spec says.**

- **First action: read the durable contracts** listed in `AGENTS.md` — that file,
  this file, `~/.claude/CLAUDE.md`, and memory files. A spec that conflicts with a
  durable contract loses; stop and report rather than resolving it yourself.
- Runs all commands, commits, pushes, opens PRs with full metadata.
- **Never merges** — the PM thread announces the signal, the maintainer merges.
- Never improvises off-spec. If the spec is ambiguous or you find an issue that
  changes scope, stop and report; do not guess.

**Unclear which mode you are in:** say so and ask before proceeding.

## The lane is enforced, not remembered

`.claude/hooks/pm-lane-guard.sh` is a tracked `PreToolUse` hook. It does not detect
your mode — **it makes the boundary structural**:

| Capability | PM (default) | Executor |
| --- | --- | --- |
| Declared by | nothing — absence of the flag | `AUDIO_LAB_EXECUTOR=1` |
| Write/Edit **inside this repo** | only under `artifacts/` | anywhere |
| Write/Edit **outside this repo** | allowed | allowed |
| `git commit/push/merge/branch -D` | **denied** | allowed |
| `gh pr/issue/label create`, `gh api -X` | **denied** | allowed |
| `git log/diff/status`, `gh * view/checks` | allowed | allowed |

Launch an executor with:

```fish
env AUDIO_LAB_EXECUTOR=1 claude
```

Read-only git and `gh` stay open to PM deliberately — independently verifying the
executor's work is the PM's job, and it cannot do that blind. Writes outside the repo
are ungated so a PM session can persist a standing rule to `~/.claude/` the moment it
is made, as the global contract requires.

**Why this exists.** The split lived as prose here for a whole session while a PM chat
made ~15 commits, opened 5 PRs, created 11 issues and set branch protection. Nothing
stopped it, because nothing gated it. A rule with no mechanism behind it depends on an
agent remembering, which is a hope rather than a guardrail. The hook is tracked so
cold-start, cloud and fresh-clone sessions inherit it — a guard living only in
`settings.local.json` binds one machine and nothing else.

**If the guard blocks something it should not:** say so and ask. Do not weaken it
unilaterally, and do not report the blockage as a finished answer.

## Executor specs must begin with the contract read

Any spec authored under `prompts/` opens with an explicit instruction to read
`AGENTS.md`, this file, the global `~/.claude/CLAUDE.md`, and memory files before
acting, and states that durable contracts outrank the spec. A spec that omits this
is defective.

`prompts/` seeds are **immutable after handoff** — revisions go to a new dated
file, never an in-place edit.

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
