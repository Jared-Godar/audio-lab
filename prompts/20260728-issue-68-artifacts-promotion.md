# Spec: Promote 15 load-bearing files out of gitignored artifacts/ and kill the infra/README falsehood (Issue #68)

**Closes:** #68
**Milestone:** none — deliberately unmilestoned (repo-integrity work, no milestone owns it)
**Labels:** `type: task`, `area: governance`, `area: infra`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-opus-5 --effort high` — Heavy rung: promotion to a PUBLIC repo is
irreversible disclosure (history is permanent), the security re-verification is load-bearing,
and the work touches contracts (`CLAUDE.md`), `infra/`, and `episodes/`-adjacent paths.

> **PLACEMENT.** This spec lives at `artifacts/specs/` (tracked). Copy it byte-identical to
> `prompts/` in your first commit; verify with
> `cmp artifacts/specs/20260728-issue-68-artifacts-promotion.md prompts/20260728-issue-68-artifacts-promotion.md`.
> Immutable after handoff — wrong or ambiguous means stop and report, not improvise.

---

## 0. Read the durable contracts first (non-negotiable)

1. **`AGENTS.md` on `main` in full.** 2. `CLAUDE.md` (root). 3. `~/.claude/CLAUDE.md`.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`.
5. `CHANGELOG.md` § Findings, `docs/`.
6. **Issue #68 in full, including BOTH 2026-07-27 comments.** The comments amend the body:
   the maintainer's decisions comment raises the count to **15 files** and adds the `docs/`
   billing note; the body's §6 ACs are amended by the comment's ACs. Where body and comments
   conflict, **the comments win**.

**The rules that will bite you on THIS task:**

- **★ Run as `env AUDIO_LAB_EXECUTOR=1 claude …`** or the lane guard denies everything.
- **★ Receipts expire on the next mutation** — mutate → commit → gate → report, SHA named.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command.**
- **★ No contract-lawyering** — an unmeetable AC is a finding, not a dropped criterion.
- **This repo is PUBLIC and history is permanent.** The security re-scan (Step 4) runs against
  the **staged tree** and its output is pasted before the first push. If it finds anything, STOP
  — do not push, report.
- **Do NOT delete anything.** Every deletion decision is the maintainer's, already handled
  separately. Sources under `artifacts/` are *copied/moved* to tracked paths; the two files
  named DO-NOT-TOUCH below are not read, not moved, not referenced.
- **`episodes/` is a gated path** (`AGENTS.md` § Hold for the maintainer) — this spec adds ONE
  new file there (`episodes/ToldStraight-Ep01/host-read-sheet.md`) and overwrites nothing.
  Adding is permitted; overwriting or deleting is not.
- **Fish syntax for user-facing commands; macOS utilities; stock rsync is 2.6.9.**

## 0b. Progress tracking

TodoWrite list, one item per execution step plus each AC; refresh continuously.

---

## 1. Intended outcome

A fresh clone contains the design-system tooling, the live IAM policy JSONs, the lane-guard
test harness, the voice-preview manifest fixture, the Ep01 read sheet, the AWS operating
guides, and the type-decision evidence — and no tracked file anywhere claims those artifacts
do not exist or points into the gitignored zone to reach them.

## 2. Decisions — made by the maintainer 2026-07-27, implement as written

1. **Option 1**: move keepers OUT of `artifacts/` to real homes; `.gitignore` unchanged.
2. **15 files**, destinations in §3. No `!` exceptions added, no inversion.
3. The `aws-iam-review-godarj.md` disposition is **extract-to-docs**: a NEW tracked note
   carries the billing finding with the IAM username and root-account specifics REMOVED; the
   gitignored original stays where it is, untouched.
4. The type-shootout PNG is **tracked in `brand/`** with a self-describing rename.
5. `infra/README.md`'s "exist only in the console" passage dies in this PR, and the two policy
   files are linked at their tracked paths.

## 3. Deliverables

**D1 — the fifteen moves** (`mkdir -p` the new dirs; sources are untracked, so the mechanic is
`mv` + `git add` — see §5 note on the history AC):

| # | From `artifacts/` | To |
| --- | --- | --- |
| 1 | `20260727-adobe-illustrator-toldstraight-ep01-covers-builder.jsx` | `tools/brand/` (same name) |
| 2 | `20260727-adobe-illustrator-toldstraight-ep01-exhibit-cards-builder.jsx` | `tools/brand/` |
| 3 | `20260727-adobe-illustrator-toldstraight-type-shootout-builder.jsx` | `tools/brand/` |
| 4 | `20260727-adobe-indesign-toldstraight-type-shootout-builder.jsx` | `tools/brand/` |
| 5 | `20260727-adobe-indesign-toldstraight-type-shootout-guide.md` | `docs/` |
| 6 | `20260727-toldstraight-design-tokens.css` | `brand/` |
| 7 | `20260727-aws-iam-AudioLabSiteInfra-v4-platform.json` | `infra/policies/` |
| 8 | `20260727-aws-iam-AudioLabMail-v1-workmail-ses.json` | `infra/policies/` |
| 9 | `verification/20260727-pm-lane-guard-permit-deny-matrix.py` | `scripts/pm_lane_guard_matrix.py` |
| 10 | `voice-previews/manifest.json` | `pipeline/tests/fixtures/voice-preview-sweep-manifest.json` |
| 11 | `20260727-ep01-v2-host-read-sheet.md` | `episodes/ToldStraight-Ep01/host-read-sheet.md` |
| 12 | `aws-identity-center-setup.md` | `docs/` |
| 13 | `aws-identity-center-roles.md` | `docs/` |
| 14 | `domain-availability-research.md` | `docs/` |
| 15 | `1x/told-straight-type-shootout.png` | `brand/20260727-adobe-illustrator-toldstraight-type-shootout-contact-sheet.png` |

**D2 — remediation of file 9, required or the move ships broken:** replace the hardcoded
`REPO = "/Users/jaredgodar/Code/audio-lab"` with repo-root discovery
(`git rev-parse --show-toplevel` via subprocess, with a clear error if not in a repo), keep
`HOME` expansion as-is, and prove it runs green from a different working directory.

**D3 — `infra/README.md` corrections:** the `:393-405` passage ("Not recorded here yet … They
exist only in the console … paste the other two from IAM → Policies") is replaced with links to
`infra/policies/…v4-platform.json` and `…Mail-v1-workmail-ses.json`; the `:676` pointer to
`artifacts/aws-identity-center-*.md` retargets to `docs/`.

**D4 — pointer fixes elsewhere:** `CLAUDE.md:55` (the 51-case claim) cites
`scripts/pm_lane_guard_matrix.py`; `ROADMAP.md:196` "See `artifacts/voice-cloning-guide.md`"
retargets to `docs/voice-capture.md`; `CLAUDE.md` § "Repo shape" gains one line stating that
`artifacts/` is scratch and keepers are promoted out.

**D5 — the new `docs/aws-billing-access-finding.md`:** authored from the preserved text in
#68's decisions comment (§ "Preserved — the `aws-iam-review-godarj.md` finding"): admin grants
every billing action; a billing denial under admin is an account-level switch only root can
flip; root is not gated by it; verify as the affected principal. **No IAM username, no root
click-path.** Cite provenance (found 2026-07-26, preserved on #68).

**D6 — CHANGELOG:** under **Added** (the promotions, the billing note), **Fixed** (the
`infra/README.md` falsehood, the stale pointers), **Findings** (the falsehood was false when
written — file mtimes 10:19–10:28 vs commit 11:35, from the issue's Gap 1).

**DO NOT TOUCH:** `artifacts/session-handoffs/20260727T211500Z-pm-seed-v7.md` (contains live
credentials; excluded by the issue's security section) and `artifacts/voice-cloning-guide.md`
(pending separate PM deletion). Everything else in `artifacts/` not listed in D1 stays exactly
where it is.

## 4. Execution rails

### Step 1 — Sync, branch, walkthrough

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1    # expect 519b897 or later
git switch -c task/issue-68-artifacts-promotion
```

Continuity walkthrough to `artifacts/walkthroughs/<UTC>-issue-68-artifacts-promotion.md`
immediately; refresh at PR-open and awaiting-merge.

### Step 2 — D1..D5 implementation

Mechanic per file: `mkdir -p <destdir>`, `mv artifacts/<src> <dest>`, `git add <dest>`.
Do NOT `git add -A` blind — after all moves, `git status --short` must show ONLY: 15 adds, the
edits from D2–D5, this spec + its `prompts/` copy, and the CHANGELOG. Anything else is a stop.

### Step 3 — Negative test for the promoted harness

Temporarily break a guard rule expectation (e.g., point the harness at `/bin/true` as the guard)
and show the matrix FAILS; restore; show 51/51 pass from a directory outside the repo. Both
outputs go in the PR body.

### Step 4 — SECURITY RE-SCAN of the staged tree (blocking, before push)

```fish
git diff --cached --name-only
# every newly tracked file, full bytes:
for f in (git diff --cached --name-only --diff-filter=A)
    grep -HnoE 'A(KIA|SIA|ROA)[A-Z0-9]{16}' $f
    grep -HnoE 'ssoins-[a-z0-9]+|d-[0-9]{10}' $f
    grep -HnoE '/Users/[A-Za-z0-9._-]+' $f
end
```

Expected: **no output at all** (the `/Users/` check passes because D2 removed the hardcoded
path). Paste the empty result. Any hit = STOP, report, do not push.

### Step 5 — Commit, gate, push, PR

Commit message: `Promote 15 artifacts to tracked paths; fix infra/README falsehood (#68)`.
`bash scripts/check` on the committed state, exit + tail pasted, SHA named. Push; PR with
title = commit subject, assignee `Jared-Godar`, labels `type: task` + `area: governance` +
`area: infra` + `priority: high`, **no milestone**, body carrying: the D1 table as landed, the
negative-test paste, the security-scan paste, the gate receipt, every deliberate omission.
Verify closure via GraphQL `closingIssuesReferences` (= 68) and metadata by read-back;
`gh pr checks --watch`. **Merge HOLD from first push; never merge.**

## 5. Numbered acceptance criteria

- **AC1.** All 15 destinations in `git ls-files` on the branch; pasted.
- **AC2.** *(supersedes the issue's "git log --follow" AC, which cannot apply — the sources
  were never tracked, so there is no history to preserve; state this in the PR body as a
  deliberate deviation with this reasoning)* Each source path absent from `artifacts/`, each
  destination present; `find artifacts -type f | grep -vcE '^artifacts/(specs|issues)/'`
  pasted (expect **53**: 71 measured post-deletions − 15 moved − 2 do-not-touch retained −1
  …**do not trust this arithmetic — run it, paste it, and reconcile the actual number against
  a `find` listing in the PR body**).
- **AC3.** Security re-scan output empty, pasted (Step 4).
- **AC4.** `python3 scripts/pm_lane_guard_matrix.py` green **from `/tmp`**, output pasted;
  negative test pasted (Step 3).
- **AC5.** `grep -rn 'exist only in the console' infra/` → no output, pasted.
- **AC6.** `git grep -nE 'artifacts/(aws-identity-center|voice-cloning-guide|verification/|1x/|voice-previews/manifest)' -- . ':!CHANGELOG.md' ':!artifacts/' ':!prompts/'`
  → no output (no tracked file still points into the gitignored zone for a promoted file).
- **AC7.** `bash scripts/check` green on the committed SHA; CI 8/8 green; receipts pasted.
- **AC8.** `closingIssuesReferences` = 68, pasted.
- **AC9.** CHANGELOG entry per D6.
- **AC10.** Spec byte-identical at both paths (`cmp` pasted).
- **AC11.** Walkthrough written + refreshed at PR-open.
- **AC12.** Every deviation and omission named in the PR body.

## 6. Non-goals

No deletions (maintainer's lane) · no `.gitignore` changes · no edits to `episodes/` beyond
adding the read sheet · no touching the two DO-NOT-TOUCH files · not #8/#4/#30 scope · no
label renames (labels used here exist today; #8's new taxonomy lands separately).

## 7. Verification status of this spec's claims

| Claim | Status |
|---|---|
| 15 files exist at the named `artifacts/` sources | **PM-VERIFIED** — inventoried 2026-07-27, re-checked after the maintainer's deletions (71 files remain) |
| All 15 clean of secrets (201,411 bytes scanned) | **PM-VERIFIED** — but AC3 re-proves against the staged tree; do not inherit |
| `infra/README.md:393-405/:676` say what D3 claims | **PM-VERIFIED** — read this session |
| Account id already public at `infra/README.md:665` | **PM-VERIFIED** |
| `pm-lane-guard` matrix = 51 cases | **PM-VERIFIED** — counted |
| `ROADMAP.md:196` points at the stub | **PM-VERIFIED** — grep this session |
| Post-move `artifacts/` count arithmetic | **PM-UNVERIFIED** — deliberately; AC2 requires measuring, not trusting |
| `main` at `519b897` | **PM-VERIFIED** — 2026-07-28T01:2xZ |

## 8. References

Issue #68 body + both 2026-07-27 comments (comments win) · `infra/README.md:361-405,655-676` ·
`CLAUDE.md:55`, § Repo shape · `ROADMAP.md:196` · `pipeline/tests/test_core.py:197-200` (the
precedent) · `.github/workflows/full-history-scan.yml` · commit `c26abab` (introduced the
falsehood). Provenance: audit by the PM thread 2026-07-27 on the maintainer's request;
decisions by the maintainer the same day.
