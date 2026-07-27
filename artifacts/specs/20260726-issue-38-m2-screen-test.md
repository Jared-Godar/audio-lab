# Spec: M2 stage two — screen-test the co-host shortlist on real Ep01 dialogue (Issue #38)

**Closes:** #38 · **Labels:** `type: task`, `area: voices`, `area: pipeline`, `priority: high`
(all four verified present in `.github/labels.json` — 23 declared labels, checked 2026-07-26)
**Milestone:** M2 — Casting (Round I) · **Assignee:** `Jared-Godar`
**Sizing:** `opus` / `high` — the spec spends real money through a non-idempotent API where a
retry can re-bill. Defined scope, but irreversible on the spend axis.

---

## 0. FIRST ACTION — read the durable contracts before touching anything

Read, in this order, before your first command:

1. `AGENTS.md` — the meta-contract, do-automatically list, hold-for-the-maintainer list,
   canonical work-item workflow, definition of done.
2. `CLAUDE.md` — session modes, the lane, the self-describing-artifact rule, ElevenLabs
   specifics.
3. `~/.claude/CLAUDE.md` — the maintainer's global standing rules.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`.
5. `CHANGELOG.md` § Findings and `docs/elevenlabs.md` — what is already known about this
   vendor, so you do not re-derive it or contradict it.

**A durable contract outranks this spec.** If anything below conflicts with one of those
files, stop and report the conflict — do not resolve it yourself, and do not proceed on
your own reading of which should win.

**This spec is immutable after handoff.** If it is wrong or ambiguous, stop and report.
Do not edit it in place and do not improvise past it.

---

## 1. Intended outcome

Five shortlisted co-host candidates plus one control are rendered on `eleven_v3` at
production quality, each reading the same three lines of real Ep01 dialogue, into
descriptively-named files the maintainer can listen through in one pass. Cost is quoted
before the spend and reconciled from `/v1/history` after it.

The deliverable is **renders he can judge**, not a tool. The tool is the means.

## 2. Current state and gap

Measured 2026-07-26 by the PM thread; commands and output reproduced so you can re-run
them rather than trust them.

**Everything upstream is done.** `#10` closed with `eleven_v3` chosen by ear.
`pipeline/core` landed in PR #29. The free 12-candidate sweep is on disk:

```
$ python3 -c "import json;print(len(json.load(open('artifacts/voice-previews/manifest.json'))))"
12
```

**The gap is that `voicelab` cannot render a script across a candidate set.**

```
$ git show origin/main:pipeline/core/cli.py | grep -oE 'add_parser\("[^"]+"'
add_parser("models"   add_parser("rates"   add_parser("account"   add_parser("browse"
```

`browse` ends at listing and downloading free vendor previews. Nothing renders chosen
text across N voices.

**Every candidate so far was judged on ElevenLabs' marketing copy**, not on "Told
Straight" dialogue. That is the entire point of this stage.

## 3. Decisions already made — do not re-open them

Recorded here so you implement rather than deliberate. These are the PM's calls under
#38 §4; the maintainer may override any of them before you launch, and if he has, this
spec is stale — stop and ask.

**Shortlist: #38 §4 option 1 — top 5 by adopter count, plus a control.** Reasoning:
~1,762 credits is 1.4% of the 129,878 remaining and sits inside the ~2,000-credit
self-serve threshold in `AGENTS.md` § "Do these automatically", so it needs no separate
approval. Option 2 (all 12) costs 3,524 credits, crosses that threshold, and asks him to
sit through twelve renders to remove bias from a proxy that has not yet been shown to
mislead. **Reversal condition:** if fewer than two of the five survive his ear, the
adopter-count proxy is not selecting well and the remaining seven should be screened
before concluding anything about the shortlist.

| Rank | Adopters | `voice_id` | Name |
| --- | --- | --- | --- |
| 1 | 102,274 | `1wzJ0Fr9SDexsF2IsKU4` | Adam Greene – Clear, Friendly & Energetic |
| 2 | 26,749 | `JxfH70f7jvYhi0DKD8Xs` | Josh - Mid Twenties Midlands Accent |
| 3 | 8,843 | `8dvhVJc85Oy9HBPo11aI` | Daniel - Young Deep African Narrative |
| 4 | 7,526 | `NuRyEq0OdD9mMOyd51UZ` | Jofra – Expressive & Neutral Narrator |
| 5 | 5,530 | `9GiYR5zXBWwc0khQNQA8` | Sha - Warm, Inviting Narrator |

**Control: the premade ElevenLabs Daniel, `onwK4e9Z…`**, whose v3 render the maintainer
already listened to during the #10 bake-off
(`output/auditions/samples/elevenlabs/daniel-onwK4e9Z/20260726-elevenlabs-v3-Daniel-ep01-h25-model-ab-192k.mp3`).
Read its exact `voice_id` out of that folder's `manifest.json` — do not retype it from
this spec. This is the known-positive required by `AGENTS.md` § "Verify with a control":
if the control comes back wrong, the render path is broken; if the control is fine and a
candidate is bad, the voice is bad. Without it those two are indistinguishable.

> **Name collision — handle it or you will hand him two files called Daniel.** Shortlist
> #3 is "Daniel - Young Deep African Narrative" (`8dvhVJc85…`); the control is a different
> voice also called Daniel (`onwK4e9Z…`). Disambiguate in **both** the folder name and the
> filename — e.g. `daniel-young-deep-african-8dvhVJc8` vs `daniel-premade-onwK4e9Z`, and
> `…-Daniel-african-…` vs `…-Daniel-premade-control-…`. A numeric suffix is not enough;
> the name has to say which one it is.

**Lines: three, chosen to expose different failure modes** (#38 §4 item 4). All are
EXPERT turns, because the rebuild casts the AI as the expert beside Jared hosting. Take
them verbatim from `episodes/ToldStraight-Ep01/transcript.md`; the character counts below
are the PM's measurement — re-measure and report if yours differ.

| Slug | Chars | What it tests | Text (verbatim from the transcript) |
| --- | --- | --- | --- |
| `L1-dense-stat` | 286 | Numbers, citations, and a mortality figure read without flippancy | "Dalsgaard and colleagues, 2015, in The Lancet. Nearly two million Danes. Twenty-five million person-years of data. ADHD was associated with roughly double the all-cause mortality rate - a mortality rate ratio of two point zero seven. And the leading cause of those deaths was accidents." |
| `L2-aside` | 106 | Warmth and self-deprecation — can it be a person, not a reader | "That's right. I read the meta-analyses, and I still lost my keys twice getting here. Both things are true." |
| `L3-handoff` | 142 | Landing an emotional beat and handing back to the host | "For decades. So if that's you - you're not new to ADHD. You just finally got the paperwork for the marathon you've been running without shoes." |

534 characters per voice. All three are far inside v3's 5,000-character per-request cap
(`docs/elevenlabs.md` § Gotchas) — one request per line, never concatenated.

## 4. Cost — quote before, reconcile after

```
534 chars/voice x 6 voices = 3,204 chars
3,204 x 0.55 (measured account rate, ACCOUNT_RATE_FACTOR) = ~1,762 credits
```

Against 129,878 remaining. **Inside the ~2,000-credit self-serve threshold, so this
spend needs no further approval** — but you still print the ledger before, print it
after, and reconcile the actual against this estimate from `/v1/history`, **not** from
`/v1/user/subscription`, which lags by tens of seconds and misattributes back-to-back
calls (`docs/elevenlabs.md` § "Measuring spend").

**If your own pre-flight estimate exceeds 2,000 credits, stop and report before
spending a single credit.** Do not proceed on the grounds that this spec quoted a lower
number.

## 5. Scope and deliverables

**A. A screen-test render path in `pipeline/core`.**

- A library entry point that renders an ordered set of `(voice, line)` pairs on a given
  model, and a `voicelab screentest` CLI subcommand over it.
- **`purpose` is a mandatory argument** on any function that writes an artifact
  (`CLAUDE.md` § "Generated artifacts must be self-describing"). A caller that cannot
  name what it is producing is a defect to fix, not to default past.
- **Tension you must respect, stated explicitly:** PR #29 recorded the design rule that
  "synthesis stays a library call, never a one-shot flag, so a credit spend is always
  deliberate." A spending subcommand is in tension with that. Resolve it by making the
  spend explicit rather than by dropping the subcommand: `screentest` prints the quote
  and the current ledger and **refuses to spend without an explicit confirmation flag**
  (e.g. `--confirm-spend`). Dry-run must be the default. Say in the PR body how you
  resolved it.
- Reuse what exists — the tier system, `ACCOUNT_RATE_FACTOR`, the bounded-retry wrapper
  with the transient/permanent split, `attempts=2` on synthesis (a retry can re-bill),
  the descriptive-filename + digest-manifest cache. Do not re-implement any of it.
- Model is `eleven_v3` at 192 kbps. v3 reports `can_use_style: false` and
  `can_use_speaker_boost: false` — do not send those settings, and if the existing
  warning path fires, surface it rather than suppressing it.

**B. The renders.**

- Under `output/auditions/` (gitignored), one folder per candidate, named
  `<vendor>/<voice-slug>-<short-id>/` per `CLAUDE.md`.
- Filenames: `YYYYMMDD-elevenlabs-v3-<Voice>-ep01-<line-slug>-screentest-192k.mp3`.
- A sibling `manifest.json` per folder carrying the parameter digest, `voice_id`, line
  slug, character count, and measured credits — **the digest lives in the manifest, never
  in the filename.**
- The control goes in its own folder and is clearly marked as the control.
- He must be able to play the set in one `afplay` loop without opening anything to find
  out what it is.

**C. `ROADMAP.md` § M2 updated** with the stage-two outcome, and a `CHANGELOG.md` entry
in the same PR. Any measurement that contradicts `docs/elevenlabs.md` goes in
§ Findings — including a credit reconciliation that lands materially off the estimate.

**D. Copy this spec to `prompts/20260726-issue-38-m2-screen-test.md`** as part of the PR.
`artifacts/` is gitignored, so a spec that stays there never reaches a cold-start, cloud,
or fresh-clone session (`AGENTS.md` § "New-repo parity checklist"). Copy it unchanged.

## 6. Non-goals

- **Not the blind head-to-head, and not pinning the cast.** This produces the renders he
  judges. Picking the co-host is his, in a later stage.
- **Not re-running or overwriting the free sweep.** `artifacts/voice-previews/` is done.
- **Not touching the Professional Voice Clone slot.** There is exactly one and it is not
  for casting a library voice.
- **Not rendering episode audio** (M4) and **not building the tuning app** (#11 / M3).
- **Not screening the other seven candidates** unless the reversal condition in §3 fires,
  and then only after reporting it.
- **Not merging.** Open the PR, verify it, and stop. The PM announces the merge signal;
  the maintainer merges.

## 7. Acceptance criteria

- [ ] `voicelab screentest` exists, defaults to dry-run, prints the quote and ledger, and
      refuses to spend without an explicit confirmation flag — receipt: the dry-run output
      pasted
- [ ] 6 voices x 3 lines = 18 renders on `eleven_v3` at 192 kbps, under
      `output/auditions/`, descriptively named, with a per-folder `manifest.json`
- [ ] **The two Daniels are distinguishable from filename alone** — `ls` output pasted
- [ ] **Control receipt:** the premade Daniel render is present and sounds like the voice
      from the #10 bake-off; state plainly if it does not, because that means the path is
      broken and no candidate judgement is valid
- [ ] **Cost quoted before and reconciled after from `/v1/history`**, with the delta
      against the ~1,762-credit estimate stated — not `/v1/user/subscription`
- [ ] Credit ledger printed at start and finish
- [ ] `pipeline/tests/` extended to cover the new path, **network stubbed — zero credits
      spent by the test suite**; `uv run pytest` output pasted
- [ ] `pre-commit run --all-files` green (pasted), and the hook actually installed
- [ ] `ROADMAP.md` § M2 updated; `CHANGELOG.md` entry in the same PR
- [ ] This spec copied verbatim to `prompts/20260726-issue-38-m2-screen-test.md`
- [ ] PR opens with `Closes #38`, assignee `Jared-Godar`, labels `type: task` +
      `area: voices` + `area: pipeline` + `priority: high`, milestone M2 — verified by
      `gh pr view --json` read-back, never inferred from the create command
- [ ] Continuity walkthrough written to `artifacts/walkthroughs/` immediately after
      branching, refreshed at PR-open
- [ ] Anything deliberately omitted is named explicitly in the PR body

## 8. Dependencies and risk

**Unblocked.** #10 closed, PR #29 landed, previews on disk, 129,878 credits remaining,
no open PRs, `main` at `91e7154`.

**Blocks:** #11 (M3 has nothing to tune without a cast) and all of M4.

**Risk: low, and it is the risk of spending on the wrong material.** ~1,762 credits is
1.4% of the monthly allowance. The real hazard is casting on lines that do not represent
the show, which is why the three lines are chosen for distinct failure modes and why the
render is at production quality — casting on draft output means judging a voice you will
never ship (`docs/elevenlabs.md` § Tiers).

**Second risk: a retry can re-bill.** `attempts=2` on synthesis exists for that reason.
Do not raise it.

## 9. References

- **#38** — the issue this closes, including the §4 options these decisions resolve
- `artifacts/voice-previews/manifest.json` — 12 candidates, `voice_id`, accent, adopters
- `episodes/ToldStraight-Ep01/transcript.md` — 11,419 chars; source of the three lines
- `output/auditions/samples/elevenlabs/daniel-onwK4e9Z/` — the control's prior v3 render
  and its `manifest.json`
- `docs/elevenlabs.md` § Rates, § Measuring spend, § Tiers, § Gotchas
- `CLAUDE.md` § "Generated artifacts must be self-describing" · § ElevenLabs specifics
- `AGENTS.md` § "Do these automatically" (the ~2,000-credit threshold) · § "Verify with a
  control" · § "Definition of done"
- `CHANGELOG.md` § Findings — the v3 capability flags, the 0.55x rate, the
  `/v1/user/subscription` lag
- Spec shape ported from `macos-system-health/prompts/issue-64-test-harness-enforcing.md`,
  read 2026-07-26. That repo is the only one in the portfolio with an executor-spec
  format; #34 tracks that it was never ported here, so this is a hand-match, not a
  template instantiation.
- Authored by the PM thread 2026-07-26 after the maintainer asked when the actual work
  would start.
