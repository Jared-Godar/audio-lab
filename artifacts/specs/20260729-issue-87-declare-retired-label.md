# Spec: Declare `retired: agent failure` in labels.json so the local gate is green on every branch (Issue #87)

**Closes:** #87
**Milestone:** M0 — Extra remediation effort unrelated to project goals, necessary to get Claude to follow the guardrails already in place before it can be trusted with project work that matters
**Labels:** `type: bug`, `area: governance`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort medium`

> **Sizing rationale, stated honestly.** Light rung (`AGENTS.md` § "Model and effort sizing"):
> a fill-in-the-blanks, metadata-only change — one JSON entry whose exact values are read from
> the live label, plus a CHANGELOG line. Medium rather than low only because the negative test
> and the byte-exact mirroring reward care.

**PLACEMENT.** Author path `artifacts/specs/20260729-issue-87-declare-retired-label.md`
(tracked); commit it there **and** copy byte-identical to
`prompts/20260729-issue-87-declare-retired-label.md` — verify with `cmp`. `prompts/` seeds are
immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

**Do NOT do any of the following:** do not touch any label other than adding the one declared
entry — no deletions, no renames, no edits to the 23 existing entries or the `$comment`
doctrine; do not run `sync_labels.py sync` (nothing live needs changing — declaring is the
whole fix); do not resolve #8's open taxonomy questions; do not merge.

Before writing anything, read and follow, in order: **`AGENTS.md` on `main` in full**;
`CLAUDE.md` (conflicts resolve to `AGENTS.md`); `~/.claude/CLAUDE.md`; the memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`; `CHANGELOG.md` § Findings;
**issue #87 in full including comments** — the maintainer's ruling (§4 Option 1) is recorded
there 2026-07-29 and is the decision this spec implements.

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is
immutable after handoff.**

**The rules that will bite you on _this_ task:**

- **★ Mirror the live label exactly.** Declared name, color, and description must match the
  live label byte-for-byte — measured values are in §2; re-read them live before editing.
  Inventing a "better" description creates a new divergence.
- **★ Run the gate on the branch, never on `main`.** On `main`, pre-commit's
  `no-commit-to-branch` hook exits 1 *before* the label stage and misattributes the failure —
  this trap is documented in #87 §2 and already cost one wrong claim.
- **★ Prove the checker rejects as well as accepts** (§3.2's negative test) — a gate only
  ever seen passing is unproven.
- **★ Receipts expire on the next mutation** — mutate → commit → gate → report; name the SHA.
- **★ `-R Jared-Godar/audio-lab` inline on every `gh` command; run as
  `env AUDIO_LAB_EXECUTOR=1`.** Guard blockages are reported, never routed around.

## 0b. Progress tracking

Live task list per §4 step and §6 criterion (TodoWrite if available; otherwise inline
checklist re-posted at each step boundary).

---

## 1. Intended outcome

`.github/labels.json` declares all 24 live labels, `python3 scripts/sync_labels.py check`
exits 0, `bash scripts/check` is green end-to-end on the branch, and one PR closes #87 with a
CHANGELOG entry — unblocking the queued #84 and #83 executor launches, whose specs require a
green gate.

## 2. Decisions — made, with provenance; implement as written

1. **§4 Option 1 (declare), chosen by the maintainer 2026-07-29** — recorded on #87 in the PM
   comment quoting his words. Options 2 (delete) and 3 (fold into #8) are dead.
2. **The live label's exact values, PM-measured 2026-07-29:**
   `name` = `retired: agent failure` · `color` = `6E5494` · `description` = `Closed because
   agent execution made it unusable — the work was still wanted`. Re-read live before editing
   (`gh label list -R Jared-Godar/audio-lab --json name,color,description --jq
   '.[]|select(.name|test("retired"))'`) and mirror what you read.
3. **Placement in the file:** append as the final entry of the `labels` array. It is neither a
   `type:`/`area:`/`priority:` axis member nor a GitHub stock label, so the end of the array —
   after the stock labels — is the honest position. Keep the JSON valid; do not reformat the
   rest of the file.
4. **Spec baseline:** `origin/main` at `bcc2182`. If moved, branch from current `main` and
   note the delta.

## 3. Deliverables

1. **`.github/labels.json`**: one added entry mirroring the live label exactly (per §2.2).
2. **Negative test, run and pasted:** against a scratch copy (outside the repo) of
   `labels.json` with one live label's entry removed, the checker exits non-zero — proving a
   green result means reconciliation, not a broken checker. (`sync_labels.py` — read it first
   to see how it locates the JSON; if it hardcodes the repo path, run the scratch test by
   temporarily pointing at the copy however the script supports, or report that it supports no
   such override and demonstrate the negative case another honest way, e.g. `git stash`-free
   branch-local edit committed *after* the real fix is verified. Do not skip it silently.)
3. **CHANGELOG** entry under 2026-07-29: the drift, the ruling, the fix, and that the gate is
   green again for executor branches.
4. **Spec copies** at `artifacts/specs/` and `prompts/`, byte-identical.

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync, branch, walkthrough

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1; and git status --short
git switch -c fix/issue-87-declare-retired-label
```

Then write `artifacts/walkthroughs/<UTC-timestamp>-issue-87-declare-retired-label.md`
immediately (gitignored, never committed); refresh at PR-open and awaiting-merge.

### Step 2 — Edit and verify forward

Add the entry per §2, then:

```fish
python3 -c "import json; d=json.load(open('.github/labels.json')); print(len(d['labels']))"
python3 scripts/sync_labels.py check; echo "check exit=$status"
```

Expected: `24`, then `check exit=0` with no drift lines.

### Step 3 — Negative test (deliverable 2)

Per §3.2. Expected: non-zero exit naming the seeded gap. Paste the output.

### Step 4 — Commit, then gate on the committed state

```fish
git add .github/labels.json CHANGELOG.md artifacts/specs/20260729-issue-87-declare-retired-label.md prompts/20260729-issue-87-declare-retired-label.md
git status --short
git commit -F /tmp/commit-msg-issue-87.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Stage the named files only — the worktree may hold other sessions' untracked specs (#83,
#84); they are not yours to stage. Commit body at `/tmp/commit-msg-issue-87.txt`: line 1 =
PR title verbatim, blank line, then a curated 500–2,500-byte body (the drift, the ruling, the
mirror values, the negative-test result). Expected gate: `exit=0`, `All checks passed.` —
name the SHA.

### Step 5 — Push and open the PR

Push; the PR is on merge **HOLD** from first push; the PM announces the green light;
**never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Declare 'retired: agent failure' in labels.json so the local gate is green on every branch (#87)" \
  --assignee Jared-Godar \
  --label "type: bug" --label "area: governance" --label "priority: high" \
  --milestone "M0 — Extra remediation effort unrelated to project goals, necessary to get Claude to follow the guardrails already in place before it can be trusted with project work that matters" \
  --body-file /tmp/pr-body-issue-87.md
```

Body: `Closes #87` on its own line; the §6 receipts; every deliberate omission named. Verify
closure via GraphQL `closingIssuesReferences` (never a body text-match — re-query if the
first read is short), read back labels/milestone/assignee, then `gh pr checks --watch`.

## 6. Numbered acceptance criteria

1. `python3 scripts/sync_labels.py check` exit 0 on the committed state — output pasted (#87
   §6 AC).
2. Negative test output pasted, non-zero exit (#87 §6 AC).
3. `bash scripts/check` green end-to-end on the branch — output pasted, SHA named (#87 §6 AC).
4. Declared entry matches live byte-for-byte — both values pasted side by side.
5. CI green on the pushed branch, receipt shown.
6. `closingIssuesReferences` returns exactly `87` — pasted.
7. CHANGELOG entry in the same PR.
8. Spec byte-identical at both paths — `cmp` pasted.
9. Walkthrough written after branching, refreshed at PR-open, no ⟨slot⟩ unfilled.
10. Only the four intended files in the diff — `git diff --stat origin/main` pasted.

## 7. Non-goals

Deleting or renaming any label; `sync_labels.py sync`; #8's four taxonomy refinements;
promoting the `artifacts/rules-pending/` rules into `AGENTS.md` (offered as a pairing, **not
chosen** — it stays queued for a future vehicle); any change to
`label-drift-gate.yml` (#30 Gap 3 stands); any milestone-object edit (#75).

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| Drift: `sync_labels.py check` exits 1 naming exactly `retired: agent failure` | **PM-VERIFIED** — run directly 2026-07-29, output on #87 §2 |
| Live label values (name/color/description) in §2.2 | **PM-VERIFIED** — `gh label list --json`, 2026-07-29 |
| `labels.json` declares 23 labels and parses | **PM-VERIFIED** — 2026-07-29 |
| `no-commit-to-branch` fires before the label stage on `main` | **PM-VERIFIED** — gate log + `scripts/check` read, 2026-07-29 |
| Maintainer's Option-1 ruling recorded on #87 | **PM-VERIFIED** — comment posted and link read back this session |
| `sync_labels.py` supports testing against a scratch copy | **PM-UNVERIFIED** — script not read for its path handling; §3.2 tells you how to handle either case |
| `main` @ `bcc2182`, zero open PRs | **PM-VERIFIED** — 2026-07-29 |

## 9. References

#87 (body + ruling comment, authoritative) · #8 (taxonomy owner — untouched) · #30 Gap 3
(gate placement decision) · `.github/labels.json` ($comment doctrine) ·
`scripts/sync_labels.py` · `scripts/check` · `artifacts/specs/TEMPLATE.md` (structure
source). Provenance: drift found by the #85 executor during PR #86's gates, 2026-07-29;
issue filed and ruling recorded the same day; specced by the v10 PM against `main` @
`bcc2182`.
