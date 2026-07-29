# Spec: Create the M0 milestone and reclassify the remediation corpus onto it (Issue #85)

**Closes:** #85
**Milestone:** none at PR creation — #85 itself is remediation and the executor moves it (and #84)
onto M0 as part of the reassignment, after M0 exists.
**Labels:** `type: task`, `area: governance`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-opus-5 --effort high`

> **Sizing rationale, stated honestly.** Heavy rung: this is an audit — 51 issues each classified
> with a reasoned one-liner, honest borderline handling, and public-facing edits to `README.md` and
> `ROADMAP.md`. The mechanical reassignment argues down; the misclassification risk #85 §8 names
> (calling project work "agent failure" or vice versa, on a public repo) argues up, and wins.

**PLACEMENT.** Author path `artifacts/specs/20260729-issue-85-m0-milestone-reclassification.md`
(tracked); the executor commits it there **and** copies it byte-identical to
`prompts/20260729-issue-85-m0-milestone-reclassification.md` — verify with `cmp`. `prompts/` seeds
are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

**Do NOT do any of the following:** do not merge; do not reassign ANY issue's milestone before the
maintainer has confirmed the borderline set (#85 §4d — his confirmation must be quoted or linked in
the record); do not reopen, relitigate, or edit the body of any closed issue; do not delete
anything; do not judge whether each remediation issue was correctly filed (that is #84's job); do
not touch milestones M1–M6's own titles or descriptions (out of scope; #75 owns the mechanism
question).

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full.**
2. `CLAUDE.md` at the repo root — where they appear to conflict, **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md`.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — in particular
   `authorization-granted-is-not-an-exception-to-negotiate.md` and
   `never-descope-what-he-explicitly-asked-for.md`, both directly on point for this task.
5. `CHANGELOG.md` § Findings and `docs/`.
6. **Issue #85 in full, plus #75's body and comment** — #75 records the standing authorization
   under which you, the executor, create the milestone.

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is immutable
after handoff.**

**The rules that will bite you on _this_ task:**

- **★ Milestone creation is YOURS, under a standing authorization — execute it plainly.** The
  maintainer authorized routing milestone edits through an executor until #75 closes (recorded in
  #75's body §3 and its comment, and re-affirmed 2026-07-29). Do not hand him a command, do not
  narrate the guard deadlock as a blocker, do not treat the authorization as an exception to
  negotiate. Disclose the action in the PR body in one line; ceremony is a recorded failure mode.
- **★ The maintainer decides the borderline calls — and only those.** The confirmed-remediation
  set moves without re-asking; the borderline set moves only after he answers. Distinguish what he
  required from what an agent classified, always.
- **★ Every count is a command that was run.** Before/after milestone counts, the 51-issue
  inventory, the audit-table row count — pasted output, never recall.
- **★ Receipts expire on the next mutation.** Mutate → commit → gate → report; name the SHA.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command.**
- **★ The executor declares itself** (`env AUDIO_LAB_EXECUTOR=1`). Guard blocks something it
  should not → say so and ask.

## 0b. Progress tracking

Live task list per §4 step and §6 criterion (TodoWrite if available; otherwise inline checklist
re-posted at every step boundary).

---

## 1. Intended outcome

The M0 milestone exists (created by you); every issue in the repository — 51 at PM measurement,
re-measured live by you — is classified for or against #85 §2b's criterion with a one-line reason;
every confirmed-remediation issue (including #84 and #85 themselves) sits on M0 with a per-issue
comment naming its previous milestone; `README.md` and `ROADMAP.md` no longer describe milestone
progress in a way the reassignment falsifies; and one PR closes #85 with the audit table tracked in
`docs/` and a CHANGELOG entry recording the reclassification and the maintainer's stated reason for
its delay.

## 2. Decisions — made, with provenance; implement as written

1. **§4a = Option 1** (all issues, open and closed). Bound by #85 §7: "All 49 issues classified,
   none skipped" with the row count equal to the live `gh issue list --state all` count.
2. **§4b = Option 1** (reassign; one milestone per issue). Forced by GitHub; the per-issue comment
   preserves the record.
3. **§4c = Option 1** (one comment per reassigned issue: criterion, previous milestone, date).
   Bound by #85 §7: "for each reassigned issue, a comment names the previous milestone."
4. **§4d = Option 1** (executor proposes; maintainer confirms the borderline set before anything
   moves). Bound by #85 §7. Mechanics in Step 4 below.
5. **The inventory has moved since #85 was drafted: 49 → 51.** PM-measured 2026-07-29:
   `gh issue list --state all --limit 200 --json number --jq length` = 51. The two additions are
   #84 and #85, created after the drafting measurement; #85 §8 already classifies both as
   remediation ("this issue is itself remediation and belongs on M0 once M0 exists — as does
   #84"). Your audit covers the live count and states the drift in the PR body; the preliminary
   remediation set is therefore 24 of 51 pending your audit and his borderline confirmation.
6. **M0's title and description are fixed text** — #85 §5.0 verbatim, no editing, including the
   long title. GitHub assigns the internal number (7 is next); the "M0" designation lives in the
   title.
7. **Spec baseline:** `origin/main` at `69fd875`; milestone counts at PM measurement: M1 0/5,
   M2 0/5, M3 2/1, M4 2/11, M5 3/12, M6 1/0 (open/closed). If moved, note the delta and proceed.

## 3. Deliverables

0. **The M0 milestone, created by you** — the exact command from #85 §5.0, title and description
   verbatim, `--jq` read-back pasted.
1. **The audit**: all 51 issues classified against #85 §2b's criterion, one-line reason each, as a
   table in the PR body **and** tracked at `docs/20260729-m0-remediation-audit.md` (the file also
   records the criterion verbatim, the date, the borderline set and the maintainer's ruling on it,
   and the before/after milestone counts).
2. **Reassignment** of every confirmed remediation issue to M0
   (`gh issue edit <N> -R Jared-Godar/audio-lab --milestone "<full M0 title>"` — works on closed
   issues), each with its §4c comment. Issues previously unmilestoned are commented "previously
   unmilestoned."
3. **Documentation surfaces**: update `README.md`'s status section and `ROADMAP.md`'s milestone
   material wherever the reassignment falsifies them; find further surfaces with
   `grep -rn 'M[1-6]' --include='*.md' .` rather than assuming this list is complete; quote every
   changed line in the PR body.
4. **CHANGELOG** entry: what moved, how many, the criterion — and, per the maintainer's
   instruction, that the delay came from accepting each "one-time fix" assurance at face value
   while evidence accumulated against them (#85 §2c).
5. **Spec copies** at `artifacts/specs/` and `prompts/`, byte-identical.

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1; and git status --short
git switch -c governance/issue-85-m0-reclassification
```

### Step 1b — Continuity walkthrough

`artifacts/walkthroughs/<UTC-timestamp>-issue-85-m0-reclassification.md`, immediately, per
`AGENTS.md`; refresh at PR-open and awaiting-merge. Never commit it.

### Step 2 — Create M0 (deliverable 0) and record it

Run #85 §5.0's command verbatim. Verify:

```fish
gh api repos/Jared-Godar/audio-lab/milestones --jq '.[] | select(.title | startswith("M0")) | "\(.number) \(.title)"'
```

Expected: one line, internal number 7 (or next free), title beginning `M0 — Extra remediation
effort`. Then comment once on #85: created, under the #75 standing authorization, with the number.

### Step 3 — The audit

Pull the live inventory and classify every issue:

```fish
gh issue list -R Jared-Godar/audio-lab --state all --limit 200 --json number,title,milestone,state
```

Apply #85 §2b's criterion; start from its 22-issue preliminary list plus #84/#85, but audit rather
than accept it — its classification is explicitly an input to be confirmed, not a result. Write the
table (issue, state, current milestone, classification, one-line reason).

### Step 4 — Borderline confirmation (BLOCKING — nothing moves before this)

The borderline set is at minimum #5, #8, #62 (#85 §2b) plus anything your audit adds. Present it to
the maintainer **in the terminal session** — he launched you and is present — as a numbered list
with your recommendation and reason per issue, and wait for his answer. Then post his ruling as a
comment on #85 (quote his words), so #85 §7's "confirmation quoted or linked" criterion is met.
If the session cannot reach him (no response), stop at this step and report — do not proceed on a
default.

### Step 5 — Reassign

For each confirmed issue: `gh issue edit` onto M0, then the §4c comment (criterion, previous
milestone or "previously unmilestoned", date 2026-07-29). Include #84 and #85. Then paste
before/after counts:

```fish
gh api repos/Jared-Godar/audio-lab/milestones --jq '.[] | "\(.title[0:6]) open=\(.open_issues) closed=\(.closed_issues)"'
```

### Step 6 — Documentation surfaces and the negative check

Edit `README.md` / `ROADMAP.md` per Deliverable 3; then run
`grep -rn 'M[1-6]' --include='*.md' .` and confirm every remaining reference still true — zero
*false* references is the goal, not zero references. Paste the output.

### Step 7 — Commit, gate, push, PR

```fish
git add -A
git status --short
git commit -F /tmp/commit-msg-issue-85.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Commit body: line 1 = PR title verbatim; then the curated 500–2,500-byte record — M0 created under
the #75 authorization, N of 51 reclassified, the criterion, the delay reason, which doc surfaces
changed. Push; the PR is on merge **HOLD** from first push; **never merge**.

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Create the M0 milestone and reclassify the remediation corpus onto it (#85)" \
  --assignee Jared-Godar \
  --label "type: task" --label "area: governance" --label "priority: high" \
  --body-file /tmp/pr-body-issue-85.md
```

No `--milestone` flag needed on the PR itself; the issue's M0 assignment is done directly in
Step 5. Body carries `Closes #85` on its own line, the full audit table, every §6 receipt, every
deliberate omission. Verify closure via GraphQL `closingIssuesReferences` (never a body
text-match); read back labels/assignee; `gh pr checks --watch`.

## 6. Numbered acceptance criteria

1. Every #85 §7 checkbox met with its command output pasted: M0 exists and was created by you; the
   audit row count equals the live issue count (both numbers pasted); every classification carries
   a reason; the borderline set was maintainer-confirmed before reassignment, his ruling quoted;
   every confirmed issue is on M0 with counts matching; every reassigned issue's comment names the
   previous milestone; before/after milestone counts pasted; README/ROADMAP no longer falsified,
   changed lines quoted; the `M[1-6]` negative check pasted with every remaining reference
   confirmed true; CHANGELOG entry includes the delay reason.
2. The 49→51 inventory drift is stated in the PR body with the two added numbers named.
3. `bash scripts/check` green on the committed state — output pasted, SHA named.
4. CI green on the pushed branch, receipt shown.
5. `closingIssuesReferences` returns exactly `85` — pasted.
6. Audit file tracked: `git ls-files docs/ | grep -c 'remediation-audit'` returns `1`.
7. Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` pasted.
8. Continuity walkthrough written and refreshed; no ⟨slot⟩ unfilled.

## 7. Non-goals

Everything #85 §6 lists: no reopening/relitigating closed issues, no editing issue bodies, no
judging whether remediation issues were correctly filed (#84's job). Plus: no edits to M1–M6
milestone objects (#75 owns the mechanism), no label changes (#8 owns the taxonomy), and no
resolution of #75 itself — the authorization you act under expires when #75 closes, and closing it
is not this PR.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| Live issue count (state all) = 51 | **PM-VERIFIED** — `gh issue list … --jq length`, 2026-07-29 |
| Milestones are M1–M6, no M0; counts M1 0/5 · M2 0/5 · M3 2/1 · M4 2/11 · M5 3/12 · M6 1/0 | **PM-VERIFIED** — `gh api …/milestones`, 2026-07-29 |
| The #75 standing authorization (executor route, until #75 closes) | **PM-VERIFIED** — read this session in #75's body §3 and comment; re-affirmed by the maintainer 2026-07-29 per the v10 seed |
| `gh issue edit --milestone` accepts closed issues and matches by title | **PM-UNVERIFIED** — standard `gh` behavior, not exercised against this repo's closed issues this session; if it refuses, report rather than improvise (e.g. do NOT reopen issues to edit them) |
| Next internal milestone number is 7 | **PM-VERIFIED** — 1–6 exist; GitHub assigns sequentially (the exact number is informational, not load-bearing) |
| Labels `type: task` / `area: governance` / `priority: high` exist | **PM-VERIFIED** — live on #85 itself |
| `main` @ `69fd875`, clean, zero open PRs | **PM-VERIFIED** — 2026-07-29 |

## 9. References

#85 (authoritative body) · #75 body §3 + comment (the standing authorization) · #84 (goes onto M0;
its analysis is out of scope here) · #20, #21 (earliest instances of the reclassified pattern) ·
`AGENTS.md` §§ "Issues are written to the house standard", "Definition of done" ·
`.github/labels.json` · `artifacts/specs/TEMPLATE.md`. Provenance: directed by the maintainer
2026-07-29 (#85); specced by the v10 PM thread 2026-07-29 against `main` @ `69fd875`.
