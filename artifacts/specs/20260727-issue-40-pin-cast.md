# Spec: Pin Jofra as the Ep01 co-host in a tracked cast record (Issue #40)

**Closes:** #40 · **Labels:** `type: task`, `area: voices`, `area: pipeline`,
`priority: high` (all four verified present in `.github/labels.json`)
**Milestone:** M2 — Casting (Round I) · **Assignee:** `Jared-Godar`
**Sizing:** `sonnet` / `high` — defined scope, one small module, no credit spend, nothing
irreversible.

---

## 0. FIRST ACTION — read the durable contracts before touching anything

Read, in this order, before your first command: `AGENTS.md`, `CLAUDE.md`,
`~/.claude/CLAUDE.md`, the memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, and `CHANGELOG.md`
§ Findings plus `docs/elevenlabs.md`.

**A durable contract outranks this spec.** If anything below conflicts with one of those
files, stop and report — do not resolve it yourself.

**This spec is immutable after handoff.** If it is wrong or ambiguous, stop and report.

**This task spends zero credits.** No synthesis, no render, no `--confirm-spend`. If any
step appears to require one, that is a misreading — stop and report.

---

## 1. Intended outcome

The Ep01 co-host decision — **Jofra – Expressive & Neutral Narrator**,
`NuRyEq0OdD9mMOyd51UZ`, chosen by the maintainer 2026-07-27 — lives in a tracked file that
`pipeline/core` can load directly into the existing synthesis path, so M3 (#11) and M4 both
read one source of truth instead of an issue comment.

## 2. Current state and gap

Measured 2026-07-27 by the PM thread; re-run rather than trust.

```
$ git grep -n 'NuRyEq0OdD9mMOyd51UZ' -- . ':!output'
artifacts/specs/20260726-issue-38-m2-screen-test.md:88   (candidate #4)
prompts/20260726-issue-38-m2-screen-test.md:88           (candidate #4)
pipeline/core/screentest.py:69                           (candidate #4)

$ git ls-files | grep -iE 'cast|voices\.(json|toml|yaml)'
(no output)
```

Every hit is Jofra-as-*candidate*. Nothing names Jofra-as-*cast*.

## 3. Decisions already made — implement, do not re-open

- **The cast is Jofra.** The maintainer's call. Not yours to revisit or second-guess.
- **The record is `episodes/cast.json` plus a loader in `pipeline/core`** (#40 §4). JSON
  because M3 and M4 both read it; under `episodes/` because the cast belongs to the show,
  not the tooling.
- **Stage three did not happen and is not "complete."** The maintainer picked directly from
  the stage-two renders, so the blind head-to-head is **superseded**. Record it that way.
- **Do not adopt Jofra into the account or touch the PVC slot.** Measured unnecessary:
  `voice_slots_used = 0 / 30`, `professional_voice_slots_used = 0 / 1`, while Jofra renders
  fine. Adding voices to the account is not in scope and the PVC slot is gated by
  `AGENTS.md` § "Hold for the maintainer" regardless.

## 4. Scope and deliverables

**A. `episodes/cast.json` — tracked.** One entry, carrying at minimum:

```
role            "co-host"            (the AI side; Jared hosts)
episode         "ToldStraight-Ep01"
vendor          "elevenlabs"
voice_id        "NuRyEq0OdD9mMOyd51UZ"
name            "Jofra – Expressive & Neutral Narrator"
model           "eleven_v3"
output_format   "mp3_44100_192"
source          "shared-library"      (not an account clone; consumes no slot)
chosen_by       "maintainer"
chosen_on       "2026-07-27"
provenance      "#38 stage-two screen test, PR #39 (55f5b53)"
```

Add fields if the loader needs them; do not remove any of these. Do **not** embed voice
settings you have not been given — v3 reports `can_use_style: false` and
`can_use_speaker_boost: false`, so inventing a settings block would encode values the model
ignores.

**B. A loader in `pipeline/core`** returning a `Voice` (the existing type) usable directly
by the current synthesis path — no downstream caller should parse JSON or retype an id.
Reuse `Voice` / `VoiceSettings` as they exist; do not fork a parallel type.

**C. Failure behaviour.** A missing, malformed, or role-not-found `cast.json` fails with a
clear message naming the file and what was wrong — never a bare `KeyError` or a raw
traceback. `AGENTS.md` § "Defensively code every external call" is written about the
network, but the reasoning applies to any boundary the process does not control.

**D. `ROADMAP.md` § M2:**
- Fill `(#38, PR ⟨PR⟩)` → `(#38, PR #39)`. The placeholder is on `main` unfilled.
- Stage three: record as **superseded by a direct maintainer pick, not run** — not
  "complete", not "pending". State that the §3 reversal condition did not fire and the
  remaining seven candidates were deliberately not screened.
- Record the cast (Jofra, voice id) and close M2 out.

**E. `docs/elevenlabs.md:38-39`** — still says to re-verify rates with
`uv run audition --check-rates` and edit `ACCOUNT_RATE_FACTOR` in
`pipeline/audition/helpers.py`. Both were retired by PR #29; `pipeline/audition/` does not
exist. Correct them to the live path (`voicelab rates`, `pipeline/core/`). **Verify the
replacement command actually exists before writing it** — run it. Included here deliberately
rather than filed separately: it is two lines, and it is the instruction a future session
follows to re-verify billing, so being wrong is expensive.

**F. `CHANGELOG.md`** — an entry, and a **§ Findings** addition recording the measurement
with its receipt: synthesis against a shared-library voice consumes neither a general voice
slot nor the Professional Voice Clone slot (`voice_slots_used = 0 / 30`,
`professional_voice_slots_used = 0 / 1`, Jofra present in `/v1/voices` as
`category='professional'`, three renders completed). Findings previously recorded only that
browsing and previewing are free.

## 5. Non-goals

- **Not re-opening the casting decision**, and not screening the other seven candidates.
- **Not running the blind head-to-head** — superseded.
- **Not building the tuning app** (#11 / M3) or **rendering episode audio** (M4).
- **Not spending credits.** Zero. The suite must stub the network.
- **Not refactoring `screentest.py`** to consume the cast record — that couples a casting
  tool to a cast it is meant to help choose. Leave its candidate list alone.
- **Not merging.** Open the PR, verify it, stop.

## 6. Acceptance criteria

- [ ] `episodes/cast.json` tracked, with every field in §4.A — `git show HEAD:episodes/cast.json` pasted
- [ ] The loader returns a usable `Voice`, demonstrated by output, not asserted
- [ ] **Negative test:** absent / malformed / unknown-role each fail with a clear message —
      the three messages pasted
- [ ] `uv run pytest` green, **network stubbed, zero credits** — output pasted, and state
      plainly that no credit was spent
- [ ] `ROADMAP.md` §§ per §4.D — `⟨PR⟩` filled, stage three recorded as superseded, M2 closed
- [ ] `docs/elevenlabs.md:38-39` corrected, with the replacement command **run** and its
      output pasted as proof it exists
- [ ] `CHANGELOG.md` entry **and** the § Findings slot measurement with its receipt
- [ ] `pre-commit run --all-files` green (pasted), hook installed
- [ ] This spec copied verbatim to `prompts/20260727-issue-40-pin-cast.md`
- [ ] PR opens with `Closes #40`, assignee `Jared-Godar`, the four labels above, milestone
      M2 — verified by `gh pr view --json` read-back, never inferred from the create command
- [ ] Continuity walkthrough written immediately after branching, refreshed at PR-open —
      **with no `⟨slot⟩` left unfilled at PR-open**, which is the defect §4.D exists to fix
- [ ] Anything deliberately omitted named explicitly in the PR body

## 7. References

- **#40** — the issue this closes, including the §4 reasoning for the chosen format
- **#38** (closed) / **PR #39** (`55f5b53`) — the screen test that produced the decision
- `output/auditions/samples/elevenlabs/jofra-NuRyEq0O/` — the three renders that decided it
- `pipeline/core/screentest.py:69` — Jofra as candidate #4; leave it as a candidate
- `pipeline/core/voice.py` — the `Voice` / `VoiceSettings` types to reuse
- `ROADMAP.md` § M2 · `docs/elevenlabs.md` § Rates, § Measuring spend
- `AGENTS.md` § "Definition of done" · § "Hold for the maintainer" (the PVC slot)
- Spec shape as established in `prompts/20260726-issue-38-m2-screen-test.md`, itself
  hand-matched to `macos-system-health/prompts/issue-64-test-harness-enforcing.md` (#34
  tracks that no spec template was ever ported here).
- Authored by the PM thread 2026-07-27, immediately after the maintainer's verdict.
