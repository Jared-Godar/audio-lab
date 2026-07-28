# Spec: Promote the locked wordmark builder, land the commit-body rule, record ADR 0015 (Issue #60)

**Refs:** #60 — **this PR closes nothing.** It lands the wordmark system's tooling and decision
record; #60 stays open for the deliverables phase.
**Milestone:** none — omit `--milestone` entirely.
**Labels:** `type: task`, `area: governance`, `priority: medium`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort high`

> **Sizing rationale.** Small, fully-decided diff (one file copy, two verbatim governance
> amendments, one ADR, one deletion, CHANGELOG) — but the ADR requires verbatim-quote fidelity to
> its sources and the two amendments must land byte-faithful to a pending-rules file. `high` buys
> care, not scope.

> **PLACEMENT.** Commit this spec at `artifacts/specs/` **and** copy byte-identical to
> `prompts/` (verify with `cmp`). Immutable after handoff — a defect here means stop and report,
> not an in-place fix.

---

## 0. Read the durable contracts first (non-negotiable)

1. **`AGENTS.md` on `main` in full.** 2. `CLAUDE.md` (conflicts: `AGENTS.md` wins).
3. `~/.claude/CLAUDE.md`. 4. Memory files — **especially
`squash-commit-bodies-are-the-permanent-record.md`**, whose rule this PR both lands and must
demonstrate. 5. `CHANGELOG.md` § Findings. 6. **Issue #60's two decision comments in full** —
titled *"Wordmark system DECIDED, 2026-07-28 — dual lockup…"* and *"Locked wordmark system
APPROVED, 2026-07-28 — default satellite variant A"*. Locate them by title, not position.
7. **`artifacts/rules-pending/20260728-squash-commit-extended-description.md`** — the two
amendments you will apply verbatim.

**The rules that will bite you on THIS task:**

- **★ Your own commit must obey the rule it lands.** `git commit -F` with a curated body
  (§4 Step 8 gives the outline). A bare `-m` here would be the defect this PR exists to end —
  and AC7 measures the body.
- **★ No merge authorization exists for this PR.** The §5b self-merge grant on #76 was scoped to
  that PR and **does not carry forward** (`AGENTS.md`: prior authorization never does). From
  first push: HOLD, announce, wait. The PM verifies independently and announces GREEN LIGHT; the
  maintainer merges.
- **★ Two untracked strays will be present — leave both alone.** `brand/epiisode1cards.png`
  (the maintainer's, unidentified, repeatedly flagged — do not stage, move, rename, or delete)
  and this spec (stage it explicitly). `artifacts/brand-wip/` is gitignored and will not appear.
  **Never `git add -A`.**
- **★ Verbatim means verbatim.** The `AGENTS.md` and `TEMPLATE.md` amendments come from the
  rules-pending file's blockquotes character-for-character (adjusting only blockquote markers to
  the target file's formatting); the ADR's maintainer quotes come from the #60 comments
  character-for-character. Improving the wording is the defect, not a service.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command.**
- **★ Declare yourself:** `env AUDIO_LAB_EXECUTOR=1 claude …` or the lane guard denies
  everything. If the guard blocks something it should not, say so and ask.

## 0b. Progress tracking

TodoWrite if available; otherwise say so once and re-post the checklist inline at each step
boundary.

---

## 1. Intended outcome

`tools/brand/` holds the locked wordmark builder byte-identical to the approved-run file;
`AGENTS.md` § "Canonical work-item workflow" step 5 and `artifacts/specs/TEMPLATE.md` Step N+1
carry the commit-body rule verbatim from rules-pending; `docs/adr/0015-*.md` records the wordmark
system with the maintainer's words quoted; the rules-pending file is gone (promoted, not
pending); and the PR's own squash-source commit carries a curated extended description ≥500
bytes.

## 2. Decisions — all made; implement, do not re-litigate

1. **Promote** `artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-wordmark-locked-builder.jsx`
   → `tools/brand/` (same filename, `cp` then `cmp`). The options builder stays in `brand-wip/`
   as decision context — do **not** promote it.
2. **Amendment 1** (AGENTS.md workflow step 5) and **Amendment 2** (TEMPLATE.md Step N+1):
   apply exactly as written in the rules-pending file, then **delete that file in this PR** —
   a promoted pending-rule left behind reads as still pending.
3. **ADR 0015** — `docs/adr/0015-wordmark-dual-lockup-system.md`, per `docs/adr/TEMPLATE.md`:
   `Status: accepted`, `Date: 2026-07-28`, `Source: issue #60, comments "Wordmark system
   DECIDED…" and "Locked wordmark system APPROVED…"`. Decision: dual lockup (horizontal for wide
   surfaces / stacked for square-leaning, minor aspect tweaks allowed), stamp as device with the
   name once, M1 TS-boxed compact mark, authority-line satellite, **variant A default** (eyebrow
   per-surface). Consequences: every #60 deliverable (favicon, README header, OG cards, brand
   sheet) inherits these lockups; faces pinned `TradeGothicNextLTPro-BdCn`/`-Bd`/`LetterGothicStd`;
   dark-stock rule is `#E4564F` by measurement (5.05:1; print red fails at 2.82:1). Quote the
   maintainer's dual-lockup instruction and approval verbatim. Reversal condition: not recorded
   at decision time — write exactly that. Add the 0015 row to `docs/adr/README.md`'s index
   (constrains: M5).
4. **CHANGELOG** entry under the existing `## 2026-07-28` heading (do not duplicate it).

**Measured baseline** — `origin/main` at `21674e0` (post-#77), 2026-07-28: the brand-wip builder
is 21,289 bytes (mtime 10:07, the approval-run state); `tools/brand/` holds four builders, none
of them this one; `docs/adr/` holds 16 files (0001–0014 + TEMPLATE + README); the rules-pending
file exists; `git status` shows exactly two untracked paths (the png and this spec).
**If `origin/main` has moved:** branch from current main and note the delta — but if the move
touched `AGENTS.md`, `TEMPLATE.md`, or `docs/adr/`, stop and report instead.

## 3. Deliverables

1. `tools/brand/20260728-adobe-illustrator-toldstraight-wordmark-locked-builder.jsx` — AC1.
2. `AGENTS.md` step-5 amendment, verbatim — AC2.
3. `TEMPLATE.md` Step N+1 amendment, verbatim — AC2.
4. `docs/adr/0015-wordmark-dual-lockup-system.md` + README index row — AC3, AC4.
5. Deletion of `artifacts/rules-pending/20260728-squash-commit-extended-description.md` — AC5.
6. CHANGELOG entry — AC8.
7. **The commit itself, with its curated body** — AC7.

## 4. Execution rails (Fish, from repo root)

### Step 1 — Sync, branch, verify strays

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1
git switch -c task/issue-60-promote-wordmark-builder
git status --short
```

Expected: `21674e0` or later; untracked = `brand/epiisode1cards.png` + this spec, nothing else.
Anything else untracked → stop and report.

### Step 1b — Continuity walkthrough

Write it now to `artifacts/walkthroughs/<UTC>-issue-60-promote-wordmark-builder.md` (gitignored).

### Step 2 — Promote and prove byte-identity

```fish
cp artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-wordmark-locked-builder.jsx tools/brand/
cmp artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-wordmark-locked-builder.jsx \
    tools/brand/20260728-adobe-illustrator-toldstraight-wordmark-locked-builder.jsx; and echo IDENTICAL
```

### Steps 3–6 — Amendments, ADR, deletion

Apply Amendment 1 and 2 from the rules-pending file; author ADR 0015 per §2.3; update the ADR
README index; `git rm artifacts/rules-pending/20260728-squash-commit-extended-description.md`.

### Step 7 — CHANGELOG, then Step 8 — the commit that demonstrates the rule

Author `/tmp/commit-msg-issue-60-promote.txt`: line 1 =
`Promote the locked wordmark builder; land the commit-body rule; record ADR 0015 (#60)`, blank
line, then a curated body covering: what the wordmark system is (one paragraph), why the builder
is promoted now, what the two governance amendments change and the measured basis (the
`COMMIT_MESSAGES` setting and the 1-byte bodies), and that ADR 0015 is the decision record.
500–2,500 bytes.

```fish
git add tools/brand/20260728-adobe-illustrator-toldstraight-wordmark-locked-builder.jsx \
        AGENTS.md artifacts/specs/TEMPLATE.md docs/adr/ CHANGELOG.md \
        artifacts/specs/20260728-issue-60-promote-wordmark-builder-and-commit-body-rule.md \
        prompts/20260728-issue-60-promote-wordmark-builder-and-commit-body-rule.md
git rm --cached --ignore-unmatch nothing 2>/dev/null  # no-op guard; never add -A
git status --short
git commit -F /tmp/commit-msg-issue-60-promote.txt
git log -1 --format=%B | head -3
git log -1 --format=%b | wc -c
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"; tail -5 /tmp/gate.log
```

Expected: body byte count **≥500**; gate exit 0; SHA named in the report.

### Step 9 — Push, PR, verify

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Promote the locked wordmark builder; land the commit-body rule; record ADR 0015 (#60)" \
  --assignee Jared-Godar \
  --label "type: task" --label "area: governance" --label "priority: medium" \
  --body-file /tmp/pr-body-issue-60-promote.md
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes'
gh pr checks $pr -R Jared-Godar/audio-lab --watch
```

Expected: `closingIssuesReferences` **empty** (`Refs #60` only in the body); 8/8 checks. Then
announce **HOLD**; the PM verifies and announces GREEN LIGHT; **never merge.**

## 5. PR body must state

The verbatim-application claim for both amendments (with the rules-pending filename), that the
options builder deliberately stays in `brand-wip/`, that the png stray was untouched, and that
this commit is the first under the restored rule with its measured body size.

## 6. Acceptance criteria

- **AC1.** `cmp` on brand-wip vs `tools/brand/` copy: identical — output pasted.
- **AC2.** Both amendments match the rules-pending blockquotes verbatim — paste a diff-style
  excerpt of each landed text beside its source.
- **AC3.** ADR 0015 quotes the maintainer's dual-lockup instruction and approval **verbatim
  from the #60 comments** — paste one quote in the PR body with its source comment title.
- **AC4.** `docs/adr/README.md` index has the 0015 row; `ls docs/adr/ | wc -l` returns **17**.
- **AC5.** The rules-pending file is deleted in this PR — `git diff --diff-filter=D --name-only
  origin/main HEAD` lists exactly it.
- **AC6.** `git status` after commit shows the png still untracked, unstaged, untouched.
- **AC7.** `git log -1 --format=%b | wc -c` ≥ **500** — output pasted. (Negative control: the
  #77 squash body on `main` measures ~1 byte; name both numbers in the PR body.)
- **AC8.** CHANGELOG entry under the existing 2026-07-28 heading.
- **AC9.** `bash scripts/check` exit 0 on the committed SHA; CI 8/8 green.
- **AC10.** `closingIssuesReferences` empty — pasted.
- **AC11.** Spec byte-identical at `artifacts/specs/` and `prompts/` (`cmp` pasted); walkthrough
  written and refreshed at PR-open.

## 7. Non-goals

Not the deliverables phase (favicon, README header, OG cards, brand sheet — next slice, #60).
Not promoting the options builder. Not changing the squash merge **setting** (maintainer's call,
recorded in rules-pending § "Considered and set aside"). Not touching `episodes/`, the png
stray, or the feed. Not closing #60.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| `squash_merge_commit_message: COMMIT_MESSAGES` | **PM-VERIFIED** — REST, 2026-07-28 |
| Last-8 squash bodies `1·128·1367·133·1·1·757·2522` bytes | **PM-VERIFIED** — `git log --format=%b \| wc -c` loop, 2026-07-28 |
| `origin/main` at `21674e0`; archive on main (10 files) | **PM-VERIFIED** — post-#77 read-back |
| brand-wip builder = approval-run state, 21,289 bytes | **PM-VERIFIED** — `ls -la` 10:07; the maintainer approved boards rendered from this exact file |
| `docs/adr/` currently 16 files | **PM-VERIFIED** — `git ls-tree origin/main \| wc -l` |
| Labels exist in `labels.json` | **PM-VERIFIED** — parsed 2026-07-28 |
| The two #60 decision comments exist under the quoted titles | **PM-VERIFIED** — posted by this PM session, read back (comments 11–12) |
| `scripts/check` passes on this diff | **PM-UNVERIFIED** — reasoned (docs + one jsx copy), not run |
| `gh pr create` label/metadata flow | **PM-VERIFIED pattern** — identical shape passed on #76/#77 |

## 9. References

#60 (decision comments by title) · `artifacts/rules-pending/20260728-squash-commit-extended-description.md` ·
memory `squash-commit-bodies-are-the-permanent-record.md` · `AGENTS.md` § Canonical work-item
workflow · `docs/adr/TEMPLATE.md`, `README.md` · provenance: maintainer's instruction while
merging #77, 2026-07-28; root cause (bare `-m` in the spec template) owned by the PM session
that wrote this spec.

---

## Handoff — launch block (PM-only; delete before the executor works)

```fish
gh issue comment 60 -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/20260728-issue-60-promote-wordmark-builder-and-commit-body-rule.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model claude-sonnet-5 --effort high \
  "Read and execute artifacts/specs/20260728-issue-60-promote-wordmark-builder-and-commit-body-rule.md in full."
```
