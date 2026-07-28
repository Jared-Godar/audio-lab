# Spec: Archive the eight Ep01 v1 artwork assets before any re-set touches them (Issue #60)

**Refs:** #60 — **this PR closes nothing.** It satisfies one acceptance item of #60's RE-SCOPE
comment (§2, "the originals are archived, never overwritten"); #60 itself stays open.
**Milestone:** none — #60 is on M5, but this slice is a protective prerequisite, not M5 work.
Omit `--milestone` entirely.
**Labels:** `type: task`, `area: episodes`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort medium`

> **Sizing rationale, stated honestly.** This is the **Light** rung on `AGENTS.md` § "Model and
> effort sizing" — a small, fully-specified, mechanical change with exact content provided. It is
> pinned at `medium` rather than `low` for one reason: the change lands under `episodes/`, which
> `AGENTS.md` § "Hold for the maintainer" gates, so the executor must reason correctly about
> **copy-not-move** and stop if anything about the gate reading surprises it. Everything else here
> is `cp` and `git add`.

> **PLACEMENT.** `artifacts/specs/` is **tracked** here. Commit this spec at
> `artifacts/specs/20260728-issue-60-archive-ep01-v1-artwork.md` **and** copy it byte-identical to
> `prompts/20260728-issue-60-archive-ep01-v1-artwork.md`. Verify with `cmp`. `prompts/` seeds are
> **immutable after handoff** — revisions go to a NEW dated file, never an in-place edit.

---

## 0. Read the durable contracts first (non-negotiable)

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full** — the binding operating contract.
2. `CLAUDE.md` at the repo root. Where it and `AGENTS.md` appear to conflict, **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md` — the maintainer's cross-project standing rules.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`.
5. `CHANGELOG.md` § Findings and `docs/`.
6. **Issue #60 in full, including every comment — there are nine.** **Authoritative reading:** the
   comment titled **"RE-SCOPED by the maintainer, 2026-07-27"** supersedes **§4 of the original
   body**. Its **§2** is the section this spec implements. The original body's non-goal "Not
   redesigning the Ep01 artwork" is **withdrawn**. Do not work from the original §4.

**A durable contract outranks this spec.** If the two conflict, stop and report; do not resolve it
yourself. **This spec is immutable after handoff** — if it is wrong or ambiguous, stop and report
rather than improvising a fix into it.

**The rules that will bite you on _this_ task:**

- **★ `episodes/` is a gated path — and this task is authorized, narrowly.** `AGENTS.md` § "Hold for
  the maintainer" gates **"deleting or overwriting anything under `episodes/`"**. The maintainer
  authorized the archive on 2026-07-28 (`_v1-archive/` confirmed by name). That authorization covers
  **adding** an archive copy. It does **not** authorize deleting, renaming, re-rendering, or
  modifying any existing file under `episodes/`. If you find yourself about to remove or overwrite
  anything there, **stop and report.**
- **★ COPY, do not move.** The v1 assets are still the *current, live* artwork — the re-set has not
  happened. `git mv` would leave the episode directory with no cover art. Use `cp`. The duplication
  is 712 KB total and is the point of the exercise.
- **★ This PR closes nothing.** Use `Refs #60`, never `Closes #60`. `scripts/check_pr_metadata.py`
  deliberately does **not** require a closing link (verified: `.github/workflows/pr-metadata-gate.yml`
  header, lines 6–8), so a Refs-only PR passes the gate. Do **not** add a closing keyword to make the
  PR look tidier — it would close an issue with eighteen deliverables still outstanding.
- **★ Receipts expire on the next mutation.** Order is **mutate → commit → gate → report**. Name the
  SHA the gate ran against.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command** — never via a shell variable.
- **★ The executor declares itself.** Run as `env AUDIO_LAB_EXECUTOR=1 claude …` or the PM-lane guard
  denies every git mutation and in-repo write outside `artifacts/`. If the guard blocks something it
  should not, **say so and ask** — do not weaken it, and do not report the blockage as a finished
  answer.
- **★ The Definition of done gained an ADR line after this spec was first written — it does not
  trigger here, and you say so rather than leave it ambiguous.** `AGENTS.md` § "Definition of
  done" (as changed by #76, live on `main`) asks whether a PR records or changes a decision and,
  if so, requires an ADR under `docs/adr/`. **This PR records no decision** — it executes one
  already recorded (#60's RE-SCOPE comment §2; the `_v1-archive/` path confirmed by the maintainer
  2026-07-28). Put that one sentence in the PR body. Do not write an ADR for the archive.

## 0b. Progress tracking

Maintain a live task list — one item per §4 execution step plus each numbered acceptance criterion.
Use **TodoWrite/TaskCreate** if available. If neither is available, say so once, then re-post the
full checklist as inline markdown at the top of every response that starts or finishes a step.

---

## 1. Intended outcome

`episodes/ToldStraight-Ep01/_v1-archive/` exists on `main`, tracked, containing byte-identical
copies of the eight v1 PNGs, a copy of `alt-text.md` as their only surviving description, and a
`README.md` that states at the point of use that these files are permanent and must never be
deleted. Every original file under `episodes/ToldStraight-Ep01/` is untouched — verifiable by the
fact that the diff is **purely additive**.

## 2. Decisions — made by the PM and the maintainer, implement as written

Do not re-litigate these.

1. **Archive path: `episodes/ToldStraight-Ep01/_v1-archive/`.** Confirmed by the maintainer by name,
   2026-07-28. Note for the record, not for action: the `_` prefix elsewhere in this repo marks
   auxiliary sets (`artifacts/_guide-tracks/`, `_billing-probes/`), so it reads consistently here —
   but because "auxiliary" can be misread as "disposable", the `README.md` in Deliverable 3 carries
   the permanence warning **at the resource**, which is the actual protection.
2. **Copy, not move.** See §0. The originals stay exactly where they are.
3. **`alt-text.md` is copied in, and also stays in place.** #60's RE-SCOPE §2 calls it "the only
   surviving description of what they were." It still describes the current art too, so it belongs
   in both locations.
4. **The eight PNGs are exactly:** `cover.png`, `show-cover.png`, `ch1.png` … `ch6.png`. No other
   file under `episodes/ToldStraight-Ep01/` is in scope.

**Measured baseline**, PM session, 2026-07-28. First measured against `c628bd1`; **re-measured
in full after PR #76 merged**, against `origin/main` at
`2632063ec0f145bea109281cd665a571a8b99654` — #76 touched no path under `episodes/`
(`git diff --stat c628bd1 origin/main -- episodes/` is empty), so every value below held
unchanged on re-measurement:

```
$ git ls-files episodes/ToldStraight-Ep01/ | grep png
episodes/ToldStraight-Ep01/ch1.png … ch6.png, cover.png, show-cover.png   (8 files)

$ du -ch episodes/ToldStraight-Ep01/*.png | tail -1
712K	total

$ find episodes -iname '*v1*' -o -iname '*archive*'
(no output)

$ git check-ignore -v episodes/ToldStraight-Ep01/_v1-archive/cover.png
(no output; exit 1 — the path is NOT ignored)
```

**If `origin/main` has moved:** expected. Branch from current `main` and note the delta in the PR
body. Do not stop.

## 3. Deliverables

1. **`episodes/ToldStraight-Ep01/_v1-archive/` containing eight byte-identical PNG copies.** Proven
   by AC1 (`cmp` on all eight) and AC2 (`git diff --diff-filter=D` empty).
2. **`_v1-archive/alt-text.md`** — a copy, with the original left in place. Proven by AC1.
3. **`_v1-archive/README.md`** — the warning at the point of use. Exact required content below;
   write it verbatim, adjusting nothing but obvious typos.

   ```markdown
   # Ep01 v1 artwork — archived originals. Do not delete.

   These eight PNGs are the **original v1 artwork for "Told Straight" Ep01**, copied here on
   2026-07-28 *before* the visual-system re-set under issue #60 replaced the live versions in
   the parent directory.

   ## Why this directory must never be cleaned up

   1. **These files are the only copy.** Their provenance is unrecoverable — all three source
      PNGs were measured under #60 and carry **zero embedded metadata**. They cannot be
      regenerated, only lost.
   2. **They are attached to an episode already published** on the private feed. Until that
      episode is re-uploaded, these are what listeners actually see.
   3. `alt-text.md` beside them is the **only surviving description** of what they depict.

   The `_` prefix marks this as auxiliary to the current deliverable set — **not as scratch.**
   Everything else underscore-prefixed in this repository is disposable; this is the exception,
   and that is exactly why this file exists.

   `AGENTS.md` § "Hold for the maintainer" gates deleting or overwriting anything under
   `episodes/`. That gate covers this directory. Removing it needs the maintainer's express
   authorization at the time of the action.

   Recorded under issue #60 (RE-SCOPE comment, §2).
   ```

4. **CHANGELOG** entry under the `## 2026-07-28` date heading — **which already exists at the top
   of the file** (PR #76 created it). Add the entry beneath it; do not create a duplicate heading.
   Substantive; no `skip-changelog`.

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git status --short; and git log --oneline -1
git switch -c task/issue-60-archive-ep01-v1-artwork
git status --short
```

Expected: `main` at `2632063` (PR #76, the #62 docs surface) or later. **Exactly one untracked
file: this spec.** (#62's spec sat untracked beside this one when this spec was first written;
its executor committed it, so it is now tracked on `main` — do not expect it in the listing.)
If anything **else** is untracked, stop and report before staging. Use `git add` with explicit
paths, never `git add -A`, at Step 4.

### Step 1b — Continuity walkthrough, immediately after branching

Write the fill-in-the-rails walkthrough now (not on request) to
`artifacts/walkthroughs/<UTC-timestamp>-issue-60-archive-ep01-v1-artwork.md` per `AGENTS.md`'s
proactive-walkthrough rule. `artifacts/walkthroughs/` is gitignored — never commit it.

### Step 2 — Create the archive and copy the files

```fish
mkdir -p episodes/ToldStraight-Ep01/_v1-archive
cp episodes/ToldStraight-Ep01/cover.png \
   episodes/ToldStraight-Ep01/show-cover.png \
   episodes/ToldStraight-Ep01/ch1.png episodes/ToldStraight-Ep01/ch2.png \
   episodes/ToldStraight-Ep01/ch3.png episodes/ToldStraight-Ep01/ch4.png \
   episodes/ToldStraight-Ep01/ch5.png episodes/ToldStraight-Ep01/ch6.png \
   episodes/ToldStraight-Ep01/alt-text.md \
   episodes/ToldStraight-Ep01/_v1-archive/
ls -1 episodes/ToldStraight-Ep01/_v1-archive/
```

Expected: nine entries listed (eight PNGs + `alt-text.md`).

### Step 3 — Write the archive README

Write `episodes/ToldStraight-Ep01/_v1-archive/README.md` with the verbatim content from
Deliverable 3.

### Step 4 — Verify byte-identity and that nothing was removed

```fish
for f in cover.png show-cover.png ch1.png ch2.png ch3.png ch4.png ch5.png ch6.png alt-text.md
  cmp episodes/ToldStraight-Ep01/$f episodes/ToldStraight-Ep01/_v1-archive/$f; and echo "OK  $f"
end
git add episodes/ToldStraight-Ep01/_v1-archive/ \
        artifacts/specs/20260728-issue-60-archive-ep01-v1-artwork.md \
        prompts/20260728-issue-60-archive-ep01-v1-artwork.md \
        CHANGELOG.md
git status --short
git diff --cached --diff-filter=D --name-only
```

**Explicit paths, not `git add -A`** — staging by name is the discipline here even with a clean
tree: it turns any unexpected untracked file into a visible anomaly instead of a silent passenger.

Expected: nine `OK` lines. The `--diff-filter=D` output is **empty** — if it lists anything, a file
was deleted; **stop and report, do not commit.**

### Step 5 — Commit, then gate on the committed state

```fish
git commit -m "Archive the eight Ep01 v1 artwork assets before the #60 re-set (#60)"
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Expected: `exit=0`. Name the commit SHA the gate ran against. (`scripts/check --no-labels` skips the
networked label-drift check when offline.)

### Step 6 — Push and open the PR

Neither is gated. **From the first push onward the PR is on merge HOLD** — say so explicitly — until
read-back verification completes, then announce **GREEN LIGHT** proactively. **Never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Archive the eight Ep01 v1 artwork assets before the #60 re-set (#60)" \
  --assignee Jared-Godar \
  --label "type: task" --label "area: episodes" --label "priority: high" \
  --body-file /tmp/pr-body-issue-60-archive.md
```

**Omit `--milestone` entirely.** The PR body uses **`Refs #60`**, never `Closes`. Then verify that
GitHub linked **nothing** for closure — the inverse of the usual check:

```fish
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number state}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[].number'
gh pr view $pr -R Jared-Godar/audio-lab \
  --json number,labels,milestone,assignees \
  --jq '{number, labels:[.labels[].name], milestone:.milestone.title, assignees:[.assignees[].login]}'
gh pr checks $pr -R Jared-Godar/audio-lab --watch
```

Expected: `closingIssuesReferences` returns **empty**. A number appearing there means a closing
keyword leaked into the body — fix the body and re-verify before announcing anything.

## 6. Numbered acceptance criteria

- **AC1.** All nine copied files are byte-identical to their originals — `cmp` output pasted, nine
  `OK` lines.
- **AC2.** The diff is **purely additive** — `git diff --cached --diff-filter=D --name-only` empty,
  output pasted. No existing `episodes/` file was deleted, renamed, or modified.
- **AC3.** `_v1-archive/README.md` exists and matches Deliverable 3's content.
- **AC4.** `git check-ignore` confirms the archive is tracked, not ignored — `git ls-files
  episodes/ToldStraight-Ep01/_v1-archive/ | wc -l` returns **10**.
- **AC5.** `bash scripts/check` green on the **committed** state — output pasted, SHA named.
- **AC6.** CI green on the pushed branch, with the run receipt.
- **AC7.** `closingIssuesReferences` returns **empty** — output pasted. This PR closes nothing.
- **AC8.** CHANGELOG entry in the same PR.
- **AC9.** Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` output pasted.
- **AC10.** Continuity walkthrough written after branching and refreshed at PR-open, no ⟨slot⟩ left
  unfilled except those tagged deliberate.
- **AC11.** Every deliberately-omitted item named explicitly in the PR body.

## 7. Non-goals

- **Not re-setting any artwork.** That is #60's child A, not yet specced.
- **Not archiving Ep02's ten assets.** They have never been re-set, so there is no v1/v2 distinction
  to preserve yet. When Ep02 is re-set, it needs the same treatment — flag this in the PR body.
- **Not touching the published feed.** `AGENTS.md` gates that separately; nothing here goes near it.
- **Not closing #60.** Seventeen-plus deliverables remain open on it.
- **Not adding the archive to any build, render, or asset pipeline.** It is inert storage.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| Eight tracked Ep01 PNGs, named exactly as listed | **PM-VERIFIED** — `git ls-files`, 2026-07-28 |
| 712 KB total for the eight PNGs | **PM-VERIFIED** — `du -ch`, 2026-07-28 |
| No archive directory currently exists | **PM-VERIFIED** — `find`, `(no output)`, 2026-07-28 |
| `_v1-archive/` is not gitignored | **PM-VERIFIED** — `git check-ignore`, exit 1, 2026-07-28 |
| The metadata gate does not require a closing link | **PM-VERIFIED** — read `.github/workflows/pr-metadata-gate.yml` lines 6–8, 2026-07-28 |
| `type: task`, `area: episodes`, `priority: high` all exist | **PM-VERIFIED** — parsed `.github/labels.json`, 2026-07-28 |
| `origin/main` at `2632063` (post-#76) | **PM-VERIFIED** — `git rev-parse`, 2026-07-28, post-merge audit |
| `episodes/` untouched by #76; all §2 values re-verified on `2632063` | **PM-VERIFIED** — `git diff --stat` empty; PNG count, absent archive dir, and `check-ignore` re-run, 2026-07-28 |
| #62's spec is tracked on `main`; this spec is the only untracked file | **PM-VERIFIED** — `git ls-tree origin/main` + `git status --short`, 2026-07-28 |
| `## 2026-07-28` CHANGELOG heading already exists | **PM-VERIFIED** — `git grep` on `origin/main`, 2026-07-28 |
| #60 still has exactly nine comments | **PM-VERIFIED** — `gh issue view`, 2026-07-28, post-merge audit |
| Ep01 art provenance is unrecoverable (zero metadata) | **PM-UNVERIFIED** — relayed from #60's RE-SCOPE §7, measured in a prior session, not re-run here |
| `bash scripts/check` exits 0 on this change | **PM-UNVERIFIED** — reasoned (the change is additive binaries plus markdown), not run |
| CI passes on a Refs-only PR | **PM-UNVERIFIED** — the workflow header states it, but no Refs-only PR has been observed passing in this repo |

## 9. References

- **#60** — authoritative reading is the **RE-SCOPE comment of 2026-07-27T17:40Z**, §2, which
  supersedes §4 of the original body.
- `AGENTS.md` § "Hold for the maintainer" (the `episodes/` gate) · § "Canonical work-item workflow"
  · § "Definition of done".
- `CLAUDE.md` § "Generated artifacts must be self-describing" (the `_` prefix convention).
- `.github/workflows/pr-metadata-gate.yml` lines 6–8 · `.github/labels.json` · `scripts/check`.
- Provenance: the missing archive was found by the PM thread on 2026-07-28 while verifying #60's
  open-question set during onboarding; the maintainer confirmed the path the same day.
- **Revision note:** audited and revised in place by the PM on 2026-07-28 after PR #76 (#62)
  merged, on the maintainer's instruction — four stale claims corrected (two-untracked-specs
  expectation, baseline SHA, CHANGELOG heading, and the new DoD ADR line addressed). Legitimate
  because the spec had **not been handed off** — no launch comment exists on #60 and no executor
  was ever seeded with it. Had it been handed off, this would be a new dated file.

---

## Handoff — the launch block the PM hands the maintainer (PM-only; delete before the executor works)

```fish
gh issue comment 60 -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/20260728-issue-60-archive-ep01-v1-artwork.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model claude-sonnet-5 --effort medium \
  "Read and execute artifacts/specs/20260728-issue-60-archive-ep01-v1-artwork.md in full."
```
