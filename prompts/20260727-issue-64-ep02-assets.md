# Spec: Commit Ep02's asset set and correct the ROADMAP's false in-repo claim (Issue #64)

**Closes:** #64
**Milestone:** M4 — Episodes v2
**Labels:** `type: bug`, `area: episodes`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort medium`

> **Sizing rationale.** This is the **Light** rung of `AGENTS.md` § "Model and effort sizing":
> the files already exist in the working tree, the content is fixed, and no code changes. It is
> sized at `medium` rather than `low` for one reason — the `ROADMAP.md` correction is a prose
> edit that must be *accurate* rather than merely present, and getting it wrong reproduces the
> exact defect this PR fixes.

**PLACEMENT.** `artifacts/specs/` is **tracked** in this repo. The executor commits this file
there **and** copies it byte-identical to `prompts/20260727-issue-64-ep02-assets.md`, verified
with `cmp`. `prompts/` seeds are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

1. **`AGENTS.md` on `main` in full.**
2. `CLAUDE.md` at the repo root — especially § "Repo shape". Where it and `AGENTS.md` appear to
   conflict, **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md`.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`.
5. `CHANGELOG.md` § Findings and `docs/`.
6. **Issue #64 in full.** Its body is authoritative and has not been rewritten. Read #60's
   comment thread too — the 2026-07-27 comment "Ep02 located" is the provenance for this work.

**A durable contract outranks this spec.** If the two conflict, stop and report. **This spec is
immutable after handoff** — if it is wrong or ambiguous, stop and report rather than improvising.

### The rules that will bite you on *this* task

- **★ The executor declares itself.** Run as `env AUDIO_LAB_EXECUTOR=1 claude …` or the PM-lane
  guard denies every git mutation and in-repo write outside `artifacts/`. If it blocks something
  it should not, **say so and ask**.
- **★ Receipts expire on the next mutation.** Order is **mutate → commit → gate → report**. Name
  the SHA the gate ran against.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command.**
- **★ No contract-lawyering.** A criterion you cannot meet is a finding to report, never one to
  drop quietly.
- **`episodes/` is a gated path** (`AGENTS.md` § "Hold for the maintainer": never delete or
  overwrite anything under it unprompted). **This task only ADDS a new directory** —
  `episodes/ToldStraight-Ep02/`. It must not modify, move, or delete anything under
  `episodes/ToldStraight-Ep01/`. If your diff touches Ep01, stop.
- **Audio and video must not enter git.** `CLAUDE.md` § "Repo shape": episode audio is ignored.
  A 17.8 MB MP3 and a 16.4 MB MP4 sit beside these files in the source directory. AC5 is the
  negative test that proves they stayed out — run it, do not assume it.
- **Do not re-set or edit any artwork.** Re-setting Ep02's art in the new typography is #60's
  scope, deliberately not this PR's. The PNGs go in exactly as they are.

## 0b. Progress tracking

Maintain a live task list — one item per §4 step plus each numbered acceptance criterion. Use
TodoWrite if available; if not, say so once and re-post the full checklist as inline markdown at
the top of every response that starts or finishes a step.

---

## 1. Intended outcome

`episodes/ToldStraight-Ep02/` exists on `main` containing exactly 23 tracked files — the seven
episode PNGs, the three `cast/` personnel-file PNGs, and thirteen text assets — with no audio or
video, and `ROADMAP.md` no longer claims something false about where those assets live.

## 2. Current state and gap

Written against `origin/main` at **`dcfb589`**. If it has moved, that is expected — branch from
current `main` and note the delta in the PR body.

**The 23 files are ALREADY in the working tree, untracked.** The maintainer copied them from
`~/ToldStraight-Ep02/` on 2026-07-27 and the PM thread verified them. Measured:

```
$ git status --short
?? episodes/ToldStraight-Ep02/

$ find episodes/ToldStraight-Ep02 -type f | wc -l
      23
```

All ten PNGs verified 1600×1600 and readable via `sips`. **Your job is to commit them, not to
copy them.** If `git status` does not show that untracked directory, stop and report — do not
re-copy from `~/ToldStraight-Ep02/` on your own initiative, because a silent re-copy would mask
whatever removed them.

**The false claim to correct**, in `ROADMAP.md` § "Where we are":

> Ep01 (9:34) and Ep02 (12:23) are published to a private feed. Assets are in-repo; audio is
> gitignored.

True of Ep01, false of Ep02 until this PR lands. See §3 deliverable 2 for the required shape of
the correction.

## 3. Deliverables

1. **`episodes/ToldStraight-Ep02/` committed** — 23 files, no audio, no video, nothing under
   `ToldStraight-Ep01/` touched.
2. **`ROADMAP.md` § "Where we are" corrected.** The sentence must now be true *and* record that
   it was false, so the next reader does not have to rediscover it. Required content, your
   wording: both episodes are published to the private feed; **Ep02's assets were absent from the
   repository until 2026-07-27 because the initial commit `f9e662a`, named "episodes 1 and 2",
   contained only Ep01**; audio and video stay outside git by convention. Also note that Ep02
   carries a `cast/` folder of personnel-file cards that Ep01 does not.
3. **CHANGELOG** entry under a `## 2026-07-27` heading (create it if absent), in **Added**. State
   what landed and the measured reason it was missing. This is a merge gate enforced by
   `.github/workflows/changelog.yml`.
4. **Spec committed** at `artifacts/specs/20260727-issue-64-ep02-assets.md` and copied
   byte-identical to `prompts/20260727-issue-64-ep02-assets.md`.

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1
git status --short
git switch -c fix/issue-64-ep02-assets
```

Expected: `main` at `dcfb589` or later; `git status --short` shows `?? episodes/ToldStraight-Ep02/`
and the untracked spec under `artifacts/specs/`.

### Step 1b — Continuity walkthrough, immediately after branching

Write it now, not on request, to
`artifacts/walkthroughs/<UTC-timestamp>-issue-64-ep02-assets.md` per `AGENTS.md`'s
proactive-walkthrough rule. Refresh at **PR opened** and **awaiting merge**.
`artifacts/walkthroughs/` is gitignored — never commit it.

### Step 2 — Verify the payload before staging anything

```fish
find episodes/ToldStraight-Ep02 -type f | sort
find episodes/ToldStraight-Ep02 -type f | wc -l
find episodes/ToldStraight-Ep02 -type f \( -name '*.mp3' -o -name '*.mp4' \) | wc -l
for f in episodes/ToldStraight-Ep02/*.png episodes/ToldStraight-Ep02/cast/*.png
    printf '%-56s ' $f; sips -g pixelWidth -g pixelHeight $f | tail -2 | tr -d '\n' | tr -s ' '; echo
end
```

Expected: 23 files; **0** audio/video; every PNG `pixelWidth: 1600 pixelHeight: 1600`. If any
number differs, stop and report — do not "fix" it.

### Step 3 — Copy the spec into `prompts/`

```fish
cp artifacts/specs/20260727-issue-64-ep02-assets.md prompts/20260727-issue-64-ep02-assets.md
cmp artifacts/specs/20260727-issue-64-ep02-assets.md prompts/20260727-issue-64-ep02-assets.md; and echo "identical"
```

### Step 4 — Edit `ROADMAP.md` and `CHANGELOG.md`

Per §3 deliverables 2 and 3. Then confirm you touched nothing else:

```fish
git status --short
git diff --stat
```

Expected: modifications limited to `ROADMAP.md` and `CHANGELOG.md`; **no path under
`episodes/ToldStraight-Ep01/` appears anywhere in the diff.**

### Step 5 — Commit, then gate on the committed state

```fish
git add -A
git status --short
git commit -m "Add Ep02's asset set and correct the ROADMAP's in-repo claim (#64)"
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
git log --oneline -1
```

Expected: `exit=0`. Name the SHA the gate ran against when reporting. Use
`bash scripts/check --no-labels` if offline.

### Step 6 — Push, and Step 7 — open the PR

Neither is gated here; both are on `AGENTS.md`'s do-automatically list. **From the first push
onward the PR is on merge HOLD — say so explicitly** — until read-back verification completes,
then announce **GREEN LIGHT** proactively. **Never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Add Ep02's asset set and correct the ROADMAP's in-repo claim (#64)" \
  --assignee Jared-Godar \
  --label "type: bug" --label "area: episodes" --label "priority: high" \
  --milestone "M4 — Episodes v2" \
  --body-file /tmp/pr-64-body.md
```

Body must contain `Closes #64` on its own line, plus `Refs #60`.

Verify closure with the authoritative field, never a body text-match:

```fish
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number state}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[].number'
gh pr view $pr -R Jared-Godar/audio-lab --json number,labels,milestone,assignees \
  --jq '{number, labels:[.labels[].name], milestone:.milestone.title, assignees:[.assignees[].login]}'
gh pr checks $pr -R Jared-Godar/audio-lab --watch
```

Expected: `64`, and **not** `60`. `closingIssuesReferences` lags a few seconds — re-query rather
than trusting a short first read.

## 6. Numbered acceptance criteria

- **AC1.** `find episodes/ToldStraight-Ep02 -type f | wc -l` returns **23** — output pasted.
- **AC2.** All ten PNGs verified 1600×1600 via `sips` — output pasted.
- **AC3.** `episodes/ToldStraight-Ep02/cast/` contains all three personnel-file cards.
- **AC4.** `git ls-files episodes/ToldStraight-Ep02 | grep -c -E '\.(mp3|mp4)$'` returns **0** —
  the **negative test** proving audio and video stayed out. Run it; do not assume it.
- **AC5.** `git diff --stat origin/main...HEAD -- episodes/ToldStraight-Ep01/` produces **no
  output** — the negative test proving the gated Ep01 directory was untouched.
- **AC6.** `ROADMAP.md` corrected per §3.2, quoting the new text in the PR body.
- **AC7.** `bash scripts/check` green on the **committed** state — output pasted, SHA named.
- **AC8.** CI green on the pushed branch, run receipt pasted.
- **AC9.** `closingIssuesReferences` returns `64` — output pasted.
- **AC10.** CHANGELOG entry in the same PR.
- **AC11.** Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` output pasted.
- **AC12.** Continuity walkthrough written after branching and refreshed at PR-open, no unfilled
  ⟨slot⟩ except those tagged deliberate.
- **AC13.** Every deliberately-omitted item named explicitly in the PR body.

## 7. Non-goals

- **Not re-setting Ep02's artwork** in the new typography — #60's episode-artwork scope.
- **Not committing `session-one-skills.mp3` or `told-straight-ep02.mp4`** — see #64 §4 option 2
  for the reasoning that was rejected.
- **Not adding a `show-cover.png` for Ep02.** None exists; Ep01 has one at 3000×3000. Named here
  so its absence is a recorded fact, not an oversight. Belongs to #60.
- **Not solving the Ep01 v2 audio backup problem** — 54 stems and a master in gitignored
  `output/` on one disk, no backup. Larger, related, and owed its own issue.
- **Not deciding whether YouTube is in scope** for the v2 relaunch, despite the MP4 and
  `youtube-description.txt` being part of this asset set.
- **Not touching the published feed.**

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| 23 files present and untracked in the working tree | **PM-VERIFIED** — `find … \| wc -l` and `git status --short`, 2026-07-27 |
| All ten PNGs are 1600×1600 and readable | **PM-VERIFIED** — `sips` on each, 2026-07-27 |
| `f9e662a` contains only Ep01 | **PM-VERIFIED** — `git show --stat --name-only f9e662a` |
| No deletion anywhere in history; only `main` exists | **PM-VERIFIED** — `git log --all --diff-filter=D`, `git branch -a` |
| `ROADMAP.md` claims both episodes' assets are in-repo | **PM-VERIFIED** — read 2026-07-27 |
| The `cast/` cards satisfy #60 §5 | **PM-VERIFIED** — images opened and inspected, not read from alt-text |
| Labels `type: bug`, `area: episodes`, `priority: high` exist | **PM-VERIFIED** — `gh label list`, 2026-07-27 |
| Milestone "M4 — Episodes v2" exists and is open | **PM-VERIFIED** — `gh api …/milestones` |
| `bash scripts/check` exits 0 on this tree | **PM-UNVERIFIED** — never run this session; the PM lane does not run gates |
| `.github/workflows/changelog.yml` accepts a new dated heading | **PM-UNVERIFIED** — assumed from the existing CHANGELOG shape |
| PNG additions do not trip any size or secret-scan gate | **PM-UNVERIFIED** — ~700 KB total, same order as Ep01's existing set |

## 9. References

- **#64** — the tracking issue; body authoritative, not rewritten
- **#60** — visual identity; its "Ep02 located" comment of 2026-07-27 is this work's provenance
- `f9e662a` — the initial commit named "episodes 1 and 2", containing only Ep01
- `ROADMAP.md` § "Where we are" · `CLAUDE.md` § "Repo shape" · `AGENTS.md` § "Hold for the
  maintainer"
- `artifacts/specs/TEMPLATE.md` — copied from, 2026-07-27
- Found by the PM thread 2026-07-27 while scoping #60, after the maintainer said he did not know
  where Ep02's assets were and was prepared to regenerate them from scratch.
