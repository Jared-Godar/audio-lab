# Spec: Declare `retired: agent failure` in labels.json AND promote the pending receipts rule into AGENTS.md (Issue #87) — v2, supersedes the 20260729 v1 spec

**Closes:** #87
**Milestone:** M0 — Extra remediation effort unrelated to project goals, necessary to get Claude to follow the guardrails already in place before it can be trusted with project work that matters
**Labels:** `type: bug`, `area: governance`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort high`

> **Supersession note.** This file supersedes
> `artifacts/specs/20260729-issue-87-declare-retired-label.md` (v1, never launched — no launch
> comment exists on #87 for it). The maintainer directed 2026-07-29 that the rules-pending
> promotion be folded into the same PR: *"Fold the rules-pending promotion into this PR."*
> Per the revisions-are-new-files rule, v1 stays on disk untouched; execute THIS file only.
> Do not commit the v1 file.

> **Sizing rationale, stated honestly.** Both deliverables are exact-content edits (Light
> shape), but one of them edits `AGENTS.md` — the binding operating contract on a public
> repo — and the contract-reinjection hook digests its section list every turn. Touching the
> contract argues one rung up: `claude-sonnet-5` high.

**PLACEMENT.** Author path `artifacts/specs/20260729-issue-87-declare-label-and-promote-rules-v2.md`
(tracked); commit it there **and** copy byte-identical to
`prompts/20260729-issue-87-declare-label-and-promote-rules-v2.md` — verify with `cmp`.
`prompts/` seeds are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

**Do NOT do any of the following:** do not touch any label other than adding the one declared
entry; do not run `sync_labels.py sync`; do not edit any part of `AGENTS.md` other than
inserting the one specified block at the one specified anchor; do not act on
`artifacts/rules-pending/20260727-pm-lane-guard-known-false-positives.md` — it is self-marked
**SUPERSEDED — do not act on this file** and is deliberately excluded; do not resolve #8's
taxonomy questions; do not commit the v1 spec file; do not merge.

Before writing anything, read and follow, in order: **`AGENTS.md` on `main` in full**;
`CLAUDE.md` (conflicts resolve to `AGENTS.md`); `~/.claude/CLAUDE.md`; the memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`; `CHANGELOG.md` § Findings;
**issue #87 in full including comments** — the Option-1 ruling and the fold-the-promotion
direction are both recorded there.

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is
immutable after handoff.**

**The rules that will bite you on _this_ task:**

- **★ Mirror the live label exactly** (values in §2.2; re-read live before editing). Inventing
  a "better" description creates a new divergence.
- **★ The AGENTS.md insertion is verbatim from the pending file** — the text between the two
  `---` markers in `artifacts/rules-pending/20260729-receipts-vs-action-items.md`. Not a
  paraphrase, not an improvement. If the anchor text in §2.5 is not found verbatim, stop and
  report; do not choose a new location yourself.
- **★ Run the gate on the branch, never on `main`** — pre-commit's `no-commit-to-branch` hook
  exits 1 on `main` *before* the label stage and misattributes the failure (#87 §2).
- **★ Prove the checker rejects as well as accepts** (§3.3's negative test).
- **★ Receipts expire on the next mutation** — mutate → commit → gate → report; name the SHA.
- **★ `-R Jared-Godar/audio-lab` inline on every `gh` command; run as
  `env AUDIO_LAB_EXECUTOR=1`.** Guard blockages are reported, never routed around.

## 0b. Progress tracking

Live task list per §4 step and §6 criterion (TodoWrite if available; otherwise inline
checklist re-posted at each step boundary).

---

## 1. Intended outcome

One PR closing #87 that (a) makes `.github/labels.json` declare all 24 live labels so
`sync_labels.py check` exits 0 and the local gate is green on every branch — unblocking the
queued #84/#83 launches — and (b) lands the pending receipts/seed-authority rule in
`AGENTS.md` § "Standing commitments to the maintainer", so it binds cold-start, cloud, and
fresh-clone sessions instead of only this machine.

## 2. Decisions — made, with provenance; implement as written

1. **#87 §4 Option 1 (declare)** — maintainer, 2026-07-29, recorded on #87.
2. **Live label values, PM-measured 2026-07-29:** `name` = `retired: agent failure` ·
   `color` = `6E5494` · `description` = `Closed because agent execution made it unusable —
   the work was still wanted`. Re-read live before editing and mirror what you read:
   `gh label list -R Jared-Godar/audio-lab --json name,color,description --jq '.[]|select(.name|test("retired"))'`
3. **labels.json placement:** append as the final entry of the `labels` array (not an
   axis label, not a stock label). Keep the JSON valid; no reformatting.
4. **Promotion scope: exactly one pending rule** —
   `artifacts/rules-pending/20260729-receipts-vs-action-items.md`. The only other file in
   that directory (`20260727-…-false-positives.md`) is self-marked SUPERSEDED and excluded.
   Folded into this PR by the maintainer's direction 2026-07-29: *"Fold the rules-pending
   promotion into this PR."*
5. **AGENTS.md insertion point:** in § "Standing commitments to the maintainer", as a new
   list bullet inserted immediately BEFORE the final bullet that begins
   `- **Governance docs are negotiable, not to be silently worked around.**`. Content: the
   verbatim block between the two `---` markers of the pending file (it begins
   `**Receipts vs. action items; a seed never outranks this file.**` and carries three
   numbered items), reflowed only as needed to sit as one `- ` list bullet matching the
   section's indentation style.
6. **After promotion,** prepend to the pending file a one-line banner:
   `# PROMOTED into AGENTS.md § "Standing commitments to the maintainer" by PR #⟨N⟩, 2026-07-29`
   — a local edit to a gitignored file, disclosed in the PR body since no diff will show it.
7. **Spec baseline:** `origin/main` at `bcc2182`. If moved, branch from current `main` and
   note the delta.

## 3. Deliverables

1. **`.github/labels.json`**: one added entry mirroring the live label exactly (§2.2, §2.3).
2. **`AGENTS.md`**: the promoted rule bullet at the §2.5 anchor, verbatim from the pending
   file.
3. **Negative test, run and pasted:** the label checker shown exiting non-zero against a
   seeded gap (scratch copy of `labels.json` outside the repo with one live label's entry
   removed) — if the script offers no path override, demonstrate the negative case another
   honest way and say which; do not skip silently.
4. **The pending file banner** per §2.6.
5. **CHANGELOG** entry under 2026-07-29 covering both changes: the drift and its fix; the
   rule promotion and that the contract now carries it on the tracked surface.
6. **Spec copies** at `artifacts/specs/` and `prompts/`, byte-identical (this v2 file).

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync, branch, walkthrough

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1; and git status --short
git switch -c fix/issue-87-labels-and-rule-promotion
```

Then write `artifacts/walkthroughs/<UTC-timestamp>-issue-87-labels-and-rule-promotion.md`
immediately (gitignored, never committed); refresh at PR-open and awaiting-merge.

### Step 2 — labels.json, verified forward

Add the entry per §2.2–2.3, then:

```fish
python3 -c "import json; d=json.load(open('.github/labels.json')); print(len(d['labels']))"
python3 scripts/sync_labels.py check; echo "check exit=$status"
```

Expected: `24`, then `check exit=0` with no drift lines.

### Step 3 — AGENTS.md promotion, verified forward

Insert per §2.5. Then verify the section count and the anchor survived:

```fish
grep -c '^## ' AGENTS.md
grep -n 'Receipts vs. action items; a seed never outranks this file' AGENTS.md
grep -n 'Governance docs are negotiable' AGENTS.md
```

Expected: the `## ` count unchanged from `main` (the insertion is a bullet, not a new `##`
section — paste both counts); the new bullet found once, above the governance-docs bullet.

### Step 4 — Negative test (deliverable 3)

Per §3.3. Expected: non-zero exit naming the seeded gap. Paste the output.

### Step 5 — Commit, then gate on the committed state

```fish
git add .github/labels.json AGENTS.md CHANGELOG.md \
  artifacts/specs/20260729-issue-87-declare-label-and-promote-rules-v2.md \
  prompts/20260729-issue-87-declare-label-and-promote-rules-v2.md
git status --short
git commit -F /tmp/commit-msg-issue-87.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Stage the five named files only — the worktree holds other sessions' untracked specs (#83,
#84, and the v1 of this spec); none is yours to stage. Commit body at
`/tmp/commit-msg-issue-87.txt`: line 1 = PR title verbatim, blank line, then a curated
500–2,500-byte body (the drift and ruling, the mirror values, the promoted rule and its
anchor, the negative-test result). Expected gate: `exit=0`, `All checks passed.` — name the
SHA.

### Step 6 — Push and open the PR

Push; the PR is on merge **HOLD** from first push; the PM announces the green light;
**never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Declare 'retired: agent failure' in labels.json and promote the receipts rule into AGENTS.md (#87)" \
  --assignee Jared-Godar \
  --label "type: bug" --label "area: governance" --label "priority: high" \
  --milestone "M0 — Extra remediation effort unrelated to project goals, necessary to get Claude to follow the guardrails already in place before it can be trusted with project work that matters" \
  --body-file /tmp/pr-body-issue-87.md
```

Body: `Closes #87` on its own line; the §6 receipts; the gitignored-banner disclosure
(§2.6); every deliberate omission named — including the SUPERSEDED 20260727 pending file
(excluded by its own banner) and the uncommitted v1 spec (superseded by this file). Verify
closure via GraphQL `closingIssuesReferences` (never a body text-match — re-query if the
first read is short), read back labels/milestone/assignee, then `gh pr checks --watch`.

## 6. Numbered acceptance criteria

1. `python3 scripts/sync_labels.py check` exit 0 on the committed state — output pasted.
2. Negative test output pasted, non-zero exit.
3. Declared label entry matches live byte-for-byte — both pasted side by side.
4. `AGENTS.md` carries the promoted bullet verbatim at the §2.5 anchor —
   `grep -n` outputs pasted; `## `-section count unchanged from `main`, both counts pasted.
5. `bash scripts/check` green end-to-end on the branch — output pasted, SHA named.
6. CI green on the pushed branch, receipt shown.
7. `closingIssuesReferences` returns exactly `87` — pasted.
8. CHANGELOG entry in the same PR, covering both deliverables.
9. Spec byte-identical at both tracked paths — `cmp` pasted.
10. Walkthrough written after branching, refreshed at PR-open, no ⟨slot⟩ unfilled.
11. Exactly the five intended files in the diff — `git diff --stat origin/main` pasted.
12. The pending file carries its PROMOTED banner (local; disclosed in the PR body).

## 7. Non-goals

Deleting or renaming any label; `sync_labels.py sync`; #8's taxonomy refinements; acting on
the SUPERSEDED 20260727 pending file; any other edit to `AGENTS.md`; any change to
`label-drift-gate.yml` (#30 Gap 3 stands); any milestone-object edit (#75); committing the
v1 spec.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| Drift: `sync_labels.py check` exits 1 naming exactly `retired: agent failure` | **PM-VERIFIED** — run directly 2026-07-29, output on #87 §2 |
| Live label values in §2.2 | **PM-VERIFIED** — `gh label list --json`, 2026-07-29 |
| `labels.json` declares 23 labels and parses | **PM-VERIFIED** — 2026-07-29 |
| `rules-pending/` holds exactly two files; only the 20260729 one is live; the 20260727 one opens `# SUPERSEDED — do not act` | **PM-VERIFIED** — `ls` + `head` this session |
| The pending file contains a verbatim block between two `---` markers, opening `**Receipts vs. action items…**` | **PM-VERIFIED** — authored and re-read this session |
| The anchor bullet `**Governance docs are negotiable…**` is the final bullet of § "Standing commitments" | **PM-VERIFIED** — AGENTS.md read in full this session, sha `cb6945e1362a` unchanged since |
| `no-commit-to-branch` fires before the label stage on `main` | **PM-VERIFIED** — gate log + `scripts/check` read, 2026-07-29 |
| Maintainer's rulings (Option 1; fold the promotion) recorded on #87 | **PM-VERIFIED** — comments posted and read back this session |
| `sync_labels.py` supports a scratch-copy path override | **PM-UNVERIFIED** — §3.3 tells you how to handle either case |
| `main` @ `bcc2182`, zero open PRs | **PM-VERIFIED** — 2026-07-29 |

## 9. References

#87 (body + both ruling comments, authoritative) · `artifacts/rules-pending/20260729-receipts-vs-action-items.md`
(the verbatim text) · `~/.claude/CLAUDE.md` § "Receipts vs. action items; a seed never
outranks these rules" (the cross-project copy already in force on this machine) · #8 · #30
Gap 3 · `.github/labels.json` · `scripts/sync_labels.py` · `scripts/check` ·
`artifacts/specs/TEMPLATE.md`. Provenance: drift found by the #85 executor 2026-07-29;
Option-1 ruling and the fold-the-promotion direction both the maintainer's, 2026-07-29;
specced (v2) by the v10 PM against `main` @ `bcc2182`.
