# Spec: Write the root-cause analysis of the 2026-07-28 session as a tracked document (Issue #84)

**Closes:** #84
**Milestone:** none — deliberately unmilestoned. #85 will move #84 onto the M0 milestone once M0
exists; do not create or assign any milestone in this PR.
**Labels:** `type: docs`, `area: governance`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-fable-5 --effort high`

> **Sizing rationale, stated honestly.** Heavy rung (`AGENTS.md` § "Model and effort sizing"): a
> forensic audit of an 88M-token transcript against ten-plus rules, where the single most demanding
> motion is §5.7's guardrail audit — an explicit did-fire / could-have-fired / why-not verdict per
> guardrail. The normal Heavy pick is `claude-opus-5`, and it is **excluded here by the issue
> itself**: #84 §4a assigns the analysis to a *different model* from the failing agent, and the
> failing session is measured (PM, 2026-07-29) as `claude-opus-5` — 321 of 321 assistant records.
> `claude-fable-5` is the highest-capability model available that is not `claude-opus-5`.
> `claude-sonnet-5` is the honest alternative if the maintainer prefers a model tier with no other
> role in this repository's sessions; the maintainer picks by editing the launch block.

**PLACEMENT.** `artifacts/specs/` is **tracked** here. This spec is authored at
`artifacts/specs/20260729-issue-84-root-cause-analysis.md`; the executor commits it there **and**
copies it byte-identical to `prompts/20260729-issue-84-root-cause-analysis.md` — verify with
`cmp artifacts/specs/20260729-issue-84-root-cause-analysis.md prompts/20260729-issue-84-root-cause-analysis.md`.
`prompts/` seeds are **immutable after handoff**: revisions go to a NEW dated file, never an
in-place edit.

---

## 0. Read the durable contracts first (non-negotiable)

**Do NOT do any of the following, and read this list before anything else:** do not merge; do not
apologise, self-criticise, or reference how the document might be perceived — #84 §6 forbids it and
an acceptance criterion greps for it; do not soften, paraphrase-to-sanitise, or omit the
maintainer's verbatim words where the analysis quotes them — fidelity outranks comfort, and the
visibility of the document is the maintainer's decision alone; do not recommend a model change as a
primary remedy (#84 §6); do not relitigate any design decision (ADRs 0015/0016 and everything the
maintainer approved stand); do not edit any file under `prompts/` other than adding the byte-copy
of this spec.

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full** — the binding operating contract.
2. `CLAUDE.md` at the repo root. Where it and `AGENTS.md` appear to conflict, **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md` — the maintainer's cross-project standing rules.
4. All 15 memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — six
   were written during or about the session under analysis and are themselves evidence.
5. `CHANGELOG.md` § Findings and `docs/` — what is already known.
6. **Issue #84 in full, including its one comment** — the comment (the milestone-guard refusal of
   2026-07-29T02:30Z, with its seven-rule table) is required source material for §5.2, §5.3 and
   §5.7, not commentary. The issue body is authoritative and unrewritten.

**A durable contract outranks this spec.** If the two conflict, stop and report; do not resolve it
yourself. **This spec is immutable after handoff** — if it is wrong or ambiguous, stop and report
rather than improvising a fix into it.

**The rules that will bite you on _this_ task:**

- **★ You are a fresh session on a different model, and that is the point.** #84 §4a: the failing
  agent must not characterise its own conduct. Where you cannot reconstruct intent from the
  transcript, say so — do not infer a motive (#84 §9, second risk).
- **★ No apology, no technicality defense, no reputational framing.** The acceptance criterion is
  mechanical: `grep -ci 'sorry\|apolog\|embarrass\|regret'` on the document returns `0`.
- **★ Every claim carries a receipt.** Timeline entries carry UTC timestamps sourced from the
  transcript or the GitHub API; every violation quotes the rule text and names the violating
  action; token figures are computed, not copied. Asserted is not shown.
- **★ Receipts expire on the next mutation.** Order is mutate → commit → gate → report; the gate is
  the last command before you report it. Name the SHA the gate ran against.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command** — never via a shell variable.
- **★ The executor declares itself.** Run as `env AUDIO_LAB_EXECUTOR=1 claude …` or the PM-lane
  guard denies every git mutation and in-repo write outside `artifacts/`. If the guard blocks
  something it should not, say so and ask — never weaken it, never route around it.

## 0b. Progress tracking

Maintain a live task list — one item per §4 step plus each §6 criterion — using TodoWrite if
available; otherwise say so once and re-post the checklist as inline markdown (`[x]`/`[~]`/`[ ]`)
at the top of every response that starts or finishes a step.

---

## 1. Intended outcome

One tracked document, `docs/20260729-root-cause-analysis-20260728-pm-session.md`, satisfying every
required-content item in #84 §5 and every acceptance criterion in #84 §7, merged via a single PR
that closes #84 and updates `CHANGELOG.md`. The document is a factual account: what failed, why the
existing guardrails did not catch it, what it cost in measured terms, and which changes are
mechanisms versus prose.

## 2. Decisions — made, with provenance; implement as written

1. **§4a = Option 1** (different model, fresh session). Decided by the maintainer — recorded in
   #84's provenance and the v10 PM seed. Failing-session model measured `claude-opus-5` (PM,
   2026-07-29, from the transcript's `message.model` fields: 321/321).
2. **§4b = Option 1** (full #60 lifecycle, 2026-07-27 → 2026-07-29). Resolved by the PM to the
   issue's stated preference; §5.4's cross-session scope reconciliation is unmeetable under the
   narrower option. Flagged to the maintainer in the launch context; his paste of the launch block
   is the sign-off.
3. **§4c = Option 1** (mechanisms only; prose labelled as non-mechanism). Bound by #84 §7's own
   acceptance criteria (classification with counts is mandatory).
4. **§4d = Option 1** (tracked in `docs/`). Bound by #84 §7's first criterion, which greps
   `git ls-files docs/`.
5. **Token-figure discrepancy, measured by the PM 2026-07-29 and to be reported, not reconciled
   away.** #84 §2b says 273 usage records, output 557,499, total 67,136,741. The transcript
   **continued growing after the issue was drafted** (the session ran on through at least the
   02:30Z milestone-guard refusal). Measured against the final file
   (3,353,947 bytes, mtime 2026-07-29T02:50Z): **321 usage records, output 664,937, total
   88,062,282.** The document reports both — the issue-body snapshot and the final-file totals —
   and states why they differ. Neither number is "wrong"; treating the issue as false would itself
   be the calibrated-claims failure.
6. **Spec baseline:** `origin/main` at `69fd875`. If it has moved, branch from current `main` and
   note the delta — expected, not a stop.

## 3. Deliverables

1. **`docs/20260729-root-cause-analysis-20260728-pm-session.md`** containing, as numbered
   sections, all nine required-content items of #84 §5: (1) timestamped timeline; (2) enumerated
   rule violations quoting rule text + violating action + transcript reference, in a table, finding
   the real number rather than accepting "approximately ten"; (3) every assurance-then-reversal
   instance with what-was-claimed / what-was-true / trigger / whether any check could have caught
   it pre-claim; (4) work left undone or half-done, with a cross-session scope reconciliation;
   (5) consumables — elapsed maintainer-attended time, tokens by category (both measurements per
   §2.5), message and tool-call counts, issues created and destroyed, and the project-work vs
   own-process output ratio; (6) failure-mode analysis — mechanism, not motive; (7) the guardrail
   audit — for **each** of: `AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`,
   `contract-reinjection.sh`, `pm-lane-guard.sh`, `scripts/check`, the CI workflows, the issue
   standard, `artifacts/specs/TEMPLATE.md`, and the 15 memory files — an explicit did-fire /
   could-have-fired / why-not verdict, with the re-injection hook's failure-to-prevent explained,
   not noted; (8) recommendations, each classified **hook/CI gate** / **template-checklist** /
   **prose** with counts stated and each recommendation's cost and blind spot named, at least one
   being a mechanism tied to a specific named failure from the session; (9) what went right, with
   the same rigor (the blob-SHA verification and the control-first `<picture>` test on #80 at
   minimum). The token-computation script and its control run are reproduced in the document.
2. **CHANGELOG** entry under the current date heading, same PR.
3. **Spec copies:** this file committed at `artifacts/specs/` and byte-identical at `prompts/`.

## 4. Execution rails

Fish syntax, from the repository root. Each step is followed by its verification.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git status --short; and git log --oneline -1
git switch -c docs/issue-84-root-cause-analysis
git status --short artifacts/specs/   # only this spec untracked
```

Expected: `main` at `69fd875` or later; only this spec new under `artifacts/specs/`.

### Step 1b — Continuity walkthrough, immediately after branching

Write `artifacts/walkthroughs/<UTC-timestamp>-issue-84-root-cause-analysis.md` per `AGENTS.md`'s
proactive-walkthrough rule; refresh at PR-open and awaiting-merge. Gitignored; never commit it.

### Step 2 — Gather the sources

Primary transcript: `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/62598fdb-a7c7-4e2e-997f-d425cbc034cc.jsonl`.
Control transcript (for the token-method control): `8ccf4b58-bb3c-4235-8757-d3331fca80b0.jsonl` in
the same directory. GitHub record: issues #60, #79, #81, #82, #83, #84 (with comment), #85, PR #80,
and the `retired: agent failure` label — pull timestamps from `gh api`/`gh issue view --json`, not
from narrative recall. Read the guardrail files themselves before ruling on them in §5.7.

```fish
ls -la ~/.claude/projects/-Users-jaredgodar-Code-audio-lab/62598fdb-a7c7-4e2e-997f-d425cbc034cc.jsonl
gh issue view 84 -R Jared-Godar/audio-lab --json body,comments --jq '.comments | length'
```

Expected: file present (3,353,947 bytes unless the session somehow reopened); comment count `1`.

### Step 3 — Compute the consumables

Use #84 §8's Python (verified working by the PM against both transcripts on 2026-07-29). Run it on
the primary AND the control; the control's totals must differ (they do: 174,813,986 vs 88,062,282
at PM measurement). Include the script and both outputs in the document. Report the §2.5
snapshot-vs-final delta explicitly.

### Step 4 — Write the document

`docs/20260729-root-cause-analysis-20260728-pm-session.md`, per Deliverable 1. Quote the
maintainer's words verbatim where quoted — no sanitising. Where intent cannot be reconstructed from
the transcript, say so plainly.

### Step 5 — Self-check against #84 §7 before committing

```fish
grep -ci 'sorry\|apolog\|embarrass\|regret' docs/20260729-root-cause-analysis-20260728-pm-session.md   # expect 0
git ls-files docs/ | grep -c 'root-cause\|post-mortem'   # expect 0 pre-commit; 1 after git add of exactly this file
```

Also confirm every §5 item has its section, every guardrail has its verdict, and the
mechanism/prose counts are stated.

### Step 6 — Commit, then gate on the committed state

```fish
git add -A
git status --short
git commit -F /tmp/commit-msg-issue-84.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Commit body (author at `/tmp/commit-msg-issue-84.txt`, outside the repo): line 1 = the PR title
verbatim; blank line; then a curated 500–2,500-byte body — what the analysis found (violation
count, the guardrail-audit headline, the mechanism-vs-prose recommendation count), the
snapshot-vs-final token note, and where the document lives. Not a paste of the PR body.

Expected: `exit=0`, `All checks passed.` Name the SHA.

### Step 7 — Push and open the PR (neither is gated; merge is)

From first push the PR is on merge **HOLD** — say so — then announce **GREEN LIGHT** is the PM's
job, not yours. **Never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Write the root-cause analysis of the 2026-07-28 session as a tracked document (#84)" \
  --assignee Jared-Godar \
  --label "type: docs" --label "area: governance" --label "priority: high" \
  --body-file /tmp/pr-body-issue-84.md
```

No `--milestone` — deliberately: #85 assigns M0 later. Body contains `Closes #84` on its own line,
every §6 receipt, and every deliberate omission named. Verify closure with GraphQL
`closingIssuesReferences` (never a body text-match), then read back labels/assignee and run
`gh pr checks --watch`, exactly as `artifacts/specs/TEMPLATE.md` § 5 prescribes.

## 6. Numbered acceptance criteria

1. Every #84 §7 checkbox demonstrably met, each with its named command's output pasted in the PR
   body — including the apology-grep `0`, the tracked-path grep `1`, the ≥10-row violations table,
   the reproducible token method with its control, the per-guardrail verdicts with none omitted,
   the classified recommendations with counts, the named-failure mechanism, and §5.9 present.
2. The document reports **both** token measurements (67,136,741 snapshot / final-file total) and
   why they differ.
3. `bash scripts/check` green on the committed state — output pasted, SHA named.
4. CI green on the pushed branch, run receipt shown.
5. `closingIssuesReferences` returns exactly `84` — output pasted.
6. CHANGELOG entry in the same PR.
7. Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` output pasted.
8. Continuity walkthrough written after branching and refreshed at PR-open; no ⟨slot⟩ unfilled.
9. Every deliberately-omitted or deferred item named in the PR body.

## 7. Non-goals

Everything in #84 §6, verbatim: no apology or reputational framing; no relitigating design
decisions; no producing the replacement issues (drafts 2–5 are separate); no model-change-as-
primary-remedy. Additionally: no milestone work (that is #85's), and no edits to the three contract
files — recommendations go in the document, their adoption is the maintainer's.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| Failing session ran on `claude-opus-5` (321/321 assistant records) | **PM-VERIFIED** — `message.model` scan of the transcript, 2026-07-29 |
| Final-file token totals: 321 usage records, 664,937 output, 88,062,282 total | **PM-VERIFIED** — #84 §8 script run 2026-07-29 |
| Control transcript totals differ (174,813,986) | **PM-VERIFIED** — same run |
| #84 §2b figures are an earlier snapshot of the same file | **PM-VERIFIED** as arithmetic (both measured); the *cause* (session continued) is inferred from the file mtime 02:50Z vs issue creation — high confidence, stated as inference |
| `docs/` currently has no file matching `root-cause\|post-mortem` or `image-generation` | **PM-VERIFIED** — `ls docs/` 2026-07-29 |
| `main` at `69fd875`, clean, no open PRs; #84 has exactly 1 comment | **PM-VERIFIED** — 2026-07-29 |
| Labels `type: docs` / `area: governance` / `priority: high` exist | **PM-VERIFIED** — they are live on #84 itself |
| The `--model claude-fable-5` CLI invocation form | **PM-UNVERIFIED** — the id is in live use for the PM session, but the executor invocation was not test-launched; if the CLI rejects it, stop and report |

## 9. References

#84 (body + comment, both authoritative) · #60, #79, #80, #81, #82 (the record under analysis) ·
#33, #48, #68 (prior art named in #84 §8) · `AGENTS.md` §§ "The artifact is not the behavior",
"Model and effort sizing", "Definition of done" · `artifacts/specs/TEMPLATE.md` (structure source)
· `docs/PM-WORKFLOW.md` §§ 4–5. Provenance: commissioned by the maintainer 2026-07-29 (#84);
specced by the v10 PM thread 2026-07-29 against `main` @ `69fd875`.
