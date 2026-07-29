# Spec: Commit the Archer-style host cast portraits + provenance manifest (Issue #90)

**Closes:** #90
**Milestone:** M5 — Web presence (as it stands on #90 at branch time)
**Labels:** `type: task`, `area: episodes`, `priority: medium`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-opus-4-8 --effort medium` — mechanical commit + a manifest-consistency
check + a CHANGELOG entry. No open-ended judgement.

**PLACEMENT.** Author path `artifacts/specs/20260729-issue-90-commit-cast-portraits.md` (this file).
The executor copies it byte-identical to `prompts/20260729-issue-90-commit-cast-portraits.md` and
verifies with `cmp`. `prompts/` seeds are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

Before doing anything, read and follow, in order:

1. **`AGENTS.md` on `main`, in full.**
2. `CLAUDE.md` at the repo root — conflicts resolve to `AGENTS.md`.
3. `~/.claude/CLAUDE.md`.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — in particular
   `descriptive-artifact-filenames.md`, `squash-commit-bodies-are-the-permanent-record.md`, and
   `authorization-granted-is-not-an-exception-to-negotiate.md`.
5. `CHANGELOG.md` and its **Findings** convention.
6. **Issue #90 in full** — its §6 acceptance criteria are implemented as written.

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is immutable after
handoff.**

**Do NOT:**
- generate or regenerate any portrait — the maintainer produces those in Gemini;
- commit, reference by path, or describe the maintainer's reference photograph;
- commit any file that is a photograph rather than a generated cartoon (see §4 Step 2 guard);
- merge — open the PR on **HOLD**; the PM thread gives the green light, the maintainer merges;
- reshape `episodes/cast.json` (the voice manifest — a different file for a different medium).

## 1. Intended outcome

Whatever host-portrait PNGs currently sit in `episodes/cast/portraits/`, plus their `manifest.json`,
are committed onto the tracked path via one branch + PR that closes #90, with `manifest.json`
reconciled to disk and a CHANGELOG entry (Nano Banana 2 facts under **Findings**). The procedure is
**re-runnable**: running it again after more portraits are generated commits the new ones the same way.

## 2. Decisions — made; implement as written

1. **Branch → PR → maintainer merges.** `main` is protected (`enforce_admins`, linear history, 8
   required checks: *Lint, format and secrets* · *Locked environment (pipeline / spotify /
   archive-audition-v1)* · *Changelog updated* · *GitGuardian Security Checks* · *PR metadata* ·
   *Tests (pipeline)*). There is no direct-commit path. Never merge.
2. **Commit the current state, not a fixed count.** Discover which PNGs are present with `ls`/
   `git status`; commit those. Do not wait for or assume all four.
3. **Manifest reconciliation (the one non-mechanical step):** in `episodes/cast/portraits/manifest.json`,
   set `"generated": true` on each `portraits[]` entry whose `file` exists on disk, and
   `"generated": false` on each whose file does not. **Invariant to enforce and prove:** every
   `generated:true` entry has a matching file, and every present PNG has an entry. `manifest.json` is
   a maintainer/PM-authored file, not an immutable spec — editing it here is in-scope.
4. **Filenames are already correct** (`DATE-VENDOR-MODEL-SUBJECT-PURPOSE`). Do not rename. If a present
   PNG violates the pattern, stop and report rather than guessing a rename.
5. **Spec baseline:** `origin/main` at `6175fea`. If moved, branch from current `main`, note the delta.

## 3. Deliverables

1. The present portrait PNG(s) under `episodes/cast/portraits/`, tracked.
2. `episodes/cast/portraits/manifest.json`, reconciled per §2.3, tracked.
3. A CHANGELOG entry under the existing `## 2026-07-29` heading — **Added** (the portraits + manifest)
   and **Findings** (Nano Banana 2: free tier via the Gemini app / AI Studio; best-in-class at holding
   one face + one style across a cast; the named-IP style filter — describe the aesthetic, never name
   the show; and the head-and-shoulders lesson that "make him heavier" only lands when phrased as face
   and neck).
4. Spec copies byte-identical at `artifacts/specs/` and `prompts/` — `cmp` pasted.

## 4. Execution rails

Fish syntax, from the repository root. `env AUDIO_LAB_EXECUTOR=1` must be set (you are the executor).

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1; and git status --short
git switch -c episodes/issue-90-cast-portraits
```

### Step 1b — Continuity walkthrough

Write `artifacts/walkthroughs/<UTC-timestamp>-issue-90-cast-portraits.md` immediately (issue #, branch,
labels, milestone known; PR number etc. as ⟨slots⟩). Refresh at PR-open and awaiting-merge. Never
commit it.

### Step 2 — Verify what is present, and that nothing is a photograph

```fish
ls -la episodes/cast/portraits/
git status --short episodes/cast/
# Guard: no committed photo. Each PNG must be a generated cartoon, not a source photograph.
# Eyeball each file the maintainer added; if any looks like a real photograph, STOP and report.
```

### Step 3 — Reconcile the manifest

Edit `episodes/cast/portraits/manifest.json`: add/set `"generated": true|false` on every `portraits[]`
entry to match file presence on disk. Then prove the invariant — for each entry list its file and
whether it exists, and list any present PNG lacking an entry:

```fish
# after editing, show the manifest and the directory so the reconciliation is auditable in the PR
cat episodes/cast/portraits/manifest.json
ls episodes/cast/portraits/*.png
```

If any present PNG has no manifest entry, add a complete entry (subject, role, real flag, source,
subject_prompt) rather than committing an unreferenced file.

### Step 4 — CHANGELOG

Add the §3.3 entry under the existing `## 2026-07-29` heading (Added + Findings).

### Step 5 — Stage, commit, gate

```fish
git add episodes/cast/portraits/ CHANGELOG.md artifacts/specs/20260729-issue-90-commit-cast-portraits.md
# copy the spec into prompts/ byte-identical, then stage it
cp artifacts/specs/20260729-issue-90-commit-cast-portraits.md prompts/20260729-issue-90-commit-cast-portraits.md
cmp artifacts/specs/20260729-issue-90-commit-cast-portraits.md prompts/20260729-issue-90-commit-cast-portraits.md; and echo "spec copies identical"
git add prompts/20260729-issue-90-commit-cast-portraits.md
git status --short
git commit -F /tmp/commit-msg-issue-90.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"; tail -8 /tmp/gate.log
```

**Commit body** (`/tmp/commit-msg-issue-90.txt`): line 1 = PR title verbatim; blank line; then the
curated 500–2,500-byte record — which portraits were committed, that Jared's is the style anchor, the
manifest reconciliation result, the Nano Banana 2 provenance, and that no reference photo is committed.
Never a bare `-m`. Expected gate: `exit=0`, `All checks passed.` — name the SHA.

### Step 6 — Push and open the PR (§5). PR is on merge **HOLD** from first push. Never merge.

## 5. PR metadata (all at creation)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Commit the Archer-style host cast portraits and provenance manifest (#90)" \
  --assignee Jared-Godar \
  --label "type: task" --label "area: episodes" --label "priority: medium" \
  --milestone "M5 — Web presence" \
  --body-file /tmp/pr-body-issue-90.md
```

PR body carries `Closes #90` on its own line, the §6 receipts, the manifest reconciliation output, the
list of portraits committed and any still `generated:false`, and the explicit statement that no
reference photograph is committed. Verify closure via GraphQL `closingIssuesReferences` (never a body
text-match); read back labels/milestone/assignee; `gh pr checks --watch`.

## 6. Numbered acceptance criteria (each with pasted evidence)

1. `git ls-files episodes/cast/portraits/` lists every present PNG plus `manifest.json`.
2. Consistency test pasted: every `generated:true` manifest entry has a matching file; every present
   PNG has an entry.
3. Filenames match `DATE-VENDOR-MODEL-SUBJECT-PURPOSE` — no bare hash/opaque names.
4. No committed file is a reference photograph — stated, with the Step-2 guard result.
5. `bash scripts/check` green on the committed state — output pasted, SHA named.
6. CI green on the pushed branch — receipt shown.
7. `closingIssuesReferences` returns exactly `90` — pasted.
8. CHANGELOG updated (Added + Findings) in this PR.
9. Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` pasted.
10. Continuity walkthrough written and refreshed; no ⟨slot⟩ left unfilled.

## 7. Non-goals

Everything #90 §5 lists: no portrait generation/regeneration, no finishing work (vector conversion,
cast-card composition, signature layout, crop derivatives), no reshaping `episodes/cast.json`.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| `episodes/cast/portraits/` holds Jared's PNG + `manifest.json`, untracked (`?? episodes/cast/`) | **PM-VERIFIED** — `ls`/`git status` 2026-07-29 |
| `main` protected: enforce_admins, linear, 8 named required checks | **PM-VERIFIED** — `gh api .../branches/main/protection` 2026-07-29 |
| Labels `type: task`, `area: episodes`, `priority: medium` exist; milestone M5 exists | **PM-VERIFIED** — `gh label list` / milestones 2026-07-29 |
| `#90` created with that metadata | **PM-VERIFIED** — `gh issue create` returned issues/90, 2026-07-29 |
| Only Jared's portrait exists at author time; Owen/Des/Voss not yet present | **PM-VERIFIED** — `ls` 2026-07-29 (re-verify at run time; the spec is state-driven) |
| `main` @ `6175fea`, clean | **PM-VERIFIED** — 2026-07-29 |

## 9. References

#90 (authoritative body) · #83 (closed; the decision brief + prompts this follows) ·
`episodes/cast/portraits/manifest.json` · `episodes/cast.json` (voice manifest — distinct) ·
memory `descriptive-artifact-filenames.md`, `squash-commit-bodies-are-the-permanent-record.md` ·
`artifacts/specs/TEMPLATE.md`. Provenance: specced by the PM thread 2026-07-29 against `main` @ `6175fea`.
