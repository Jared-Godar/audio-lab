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
| Write/Edit under `~/.aws`, `~/.ssh`, `~/.gnupg` | **denied** | **denied** — the flag does not lift this |
| Write/Edit under `~/.claude/` | allowed | allowed |
| Shell writes to in-repo paths outside `artifacts/` — `>`, `>>`, `tee`, `sed -i`, `cp`, `mv`, `dd`, `truncate` | **denied** | allowed |
| Shell writes elsewhere (`/tmp`, `~`, `/dev/null`) and read-side `cp`/`sed -n` | allowed | allowed |
| `gh issue/label create\|edit\|close\|comment` | **allowed** — writing issues is the PM's job | allowed |
| `git commit/push/merge/branch -D` | **denied** | allowed |
| `gh pr create\|merge\|edit`, `gh repo edit`, `gh api -X` (POST/PUT/PATCH/DELETE) | **denied** | allowed |
| `git log/diff/status`, `gh * view/checks`, `git merge-base` | allowed | allowed |
| `aws configure`, `ssh-keygen`, `gpg` | allowed — they are shell commands, not file-writing tools | allowed |

**Every row above was verified by running the guard**, both directions, on 2026-07-27
under #48 — 51 paired permit/deny cases, each deny shipped with the permit it must not
have broken. No row claims enforcement the hook does not have. The harness is tracked at
`scripts/pm_lane_guard_matrix.py`; run it from anywhere with
`python3 scripts/pm_lane_guard_matrix.py` (exit 0 = 51/51).

Launch an executor with:

```fish
env AUDIO_LAB_EXECUTOR=1 claude
```

**Issues and labels are the PM's job here, as they are in every other project.** The
guard permits `gh issue` and `gh label` (create, edit, close, comment) from a PM
session — planning work, filing briefings, and curating the taxonomy are exactly what
the PM does. What stays executor-only is anything that mutates code or the merge
surface: git write commands, `gh pr create|merge|edit`, `gh repo edit`, and
`gh api -X POST|PUT|PATCH|DELETE`.

Read-only git and `gh` stay open to PM deliberately — independently verifying the
executor's work is the PM's job, and it cannot do that blind. Writes outside the repo
are ungated so a PM session can persist a standing rule to `~/.claude/` the moment it
is made, as the global contract requires.

**Credential paths are denied for every session, executor included.** `~/.aws`,
`~/.ssh` and `~/.gnupg` are refused by the `Write`/`Edit` tools regardless of the
flag — that check runs *before* the executor early-exit. No agent-authored workflow
here needs to write them, and the tools that own them (`aws configure`, `ssh-keygen`,
`gpg`) manage their own files and are not blocked. `~/.claude/` stays writable on
purpose, because the global contract requires a standing rule to be persistable in the
same turn it is agreed.

**What remains open, stated plainly. This is a lane marker, not a sandbox.** The
2026-07-26 hole — a PM session writing any tracked file with `printf`/`tee` because
the Bash matcher inspected verbs only — is closed as of #48, and the guard was
verified refusing exactly that. But the closure is heuristic and can never be
complete. All of these still work, and were **run to confirm they still work** rather
than assumed:

- `bash -c "printf x > AGENTS.md"` — the wrapper hides the redirect from the matcher
- a script file: `./deploy.sh`, `fish script.fish`, `make target`
- any interpreter: `python3 -c`, `perl -i -pe`, `ruby -e`, `node -e`, `awk` + redirect
- a symlink pointing out of the repo, since path normalisation is textual only

What the hardening changes is the bar: from *trivially bypassed by the obvious method*
to *requires deliberate circumvention*. It constrains accident and convenience. It
does not constrain an adversary, and nothing in this repository should be read as
claiming otherwise.

Historical note, because it is the reason the hole mattered: **the guard was once
narrowed by using the hole in the guard.** The 2026-07-26 change that added
`gh issue`/`gh label` to the PM lane was applied by a Bash write to the hook file,
which the command matcher did not inspect. That is documented history, not a
hypothetical.

**Why this exists.** The split lived as prose here for a whole session while a PM chat
made ~15 commits, opened 5 PRs, created 11 issues and set branch protection. Nothing
stopped it, because nothing gated it. A rule with no mechanism behind it depends on an
agent remembering, which is a hope rather than a guardrail. The hook is tracked so
cold-start, cloud and fresh-clone sessions inherit it — a guard living only in
`settings.local.json` binds one machine and nothing else.

**If the guard blocks something it should not:** say so and ask. Do not weaken it
unilaterally, and do not report the blockage as a finished answer.

## Contract re-injection (`UserPromptSubmit`)

`.claude/hooks/contract-reinjection.sh` is a tracked `UserPromptSubmit` hook. On every
turn it injects a **generated** digest of `AGENTS.md`, `CLAUDE.md` and
`~/.claude/CLAUDE.md` — their SHAs, sizes and section headings, computed from the files
at hook time. Nothing in it is hand-maintained; a hand-written digest is one more
artifact that can lie.

**When a SHA differs from what this session last saw, it escalates**: it says which
sections were added, modified or removed, injects the changed sections' full text
(bounded), and instructs the session to re-read the file before citing it. That is the
entire point — the observed failure was mid-session drift, and a `SessionStart` hook
would not have caught it.

**Measured cost, 2026-07-27 — this is paid on every turn, permanently, while the hook
is registered:**

| Turn | Injected `additionalContext` | ~tokens (4 bytes/token) |
| --- | --- | --- |
| First of a session | 2,794 bytes | ~700 |
| Steady state (nothing changed) | 2,575 bytes | ~645 |
| Escalation (1 section added, 2 modified in `AGENTS.md`) | 4,040 bytes | ~1,010 |

Measured against the contract files as of this commit — 45 sections across the three.
The steady-state figure scales with the **number of section headings**, not with file
size, so adding a section to `AGENTS.md` costs roughly one line per turn forever. Verify
the current number rather than trusting this table if it matters:
`printf '{"session_id":"x"}' | bash .claude/hooks/contract-reinjection.sh | wc -c`.

Escalation is bounded at 16,000 bytes total; a changed file over 8,000 bytes degrades
to its changed sections plus an explicit instruction to re-read, and says so in the
injection. `AGENTS.md` is ~26 KB, so changed-sections is the normal path, not the
exception.

**It fails open, always.** A missing contract file, an absent `python3`, a corrupt state
file, garbage on stdin, a deleted helper — every one exits 0 and injects nothing. A hook
that runs before every prompt must never be the reason a prompt fails, and it never
exits 2, which would block and erase the prompt. All six failure modes were demonstrated
under #33, not asserted.

**What it does not do:** it cannot make an agent read what it injects. It removes the
excuse, not the possibility. Calling it a fix for stale-contract citation would be the
artifact-is-not-the-behavior failure it was built in response to.

Session state lives in `.claude/contract-state/` (gitignored), one file per session,
pruned after seven days. **To disable:** delete the `"UserPromptSubmit"` key from
`.claude/settings.json`; nothing else references the hook.

This is a **deliberate divergence** from the other three repositories, none of which
has any context-injecting hook — recorded as one in `AGENTS.md` § "Recorded divergences
from the reference repositories", per the parity checklist.

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
  **It is scratch.** Anything load-bearing — tooling, fixtures, operating guides, evidence
  a tracked file cites — gets **promoted out** to a real tracked home, because nothing here
  reaches a fresh clone, a cloud session, or a cold start. If a tracked file needs to point
  at it, it does not belong here (#68).
- `tools/brand/` — Adobe (Illustrator/InDesign) builder scripts for the visual system.
- `brand/` — design tokens and the type-decision contact sheet.
- `infra/policies/` — verbatim JSON of the live IAM policies.
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
