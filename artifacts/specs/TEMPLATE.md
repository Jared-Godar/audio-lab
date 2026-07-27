# Spec: ⟨imperative one-line title⟩ (Issues #⟨A⟩, #⟨B⟩)

> **This is the copy-from template, not a spec.** The `TEMPLATE.md` filename is deliberately *not* a
> `YYYYMMDD-issue-<n>-<slug>.md` name, so it is unmistakably not itself a work item. To start a real
> spec: copy this file to `artifacts/specs/YYYYMMDD-issue-<n>-<slug>.md` (`date -u +%Y%m%d` gives the
> stamp), then fill every ⟨slot⟩ and delete this banner and the parenthetical PM-notes. Leave nothing
> generic: a rule recited but not tailored is worse than no rule, because it reads as covered.
>
> **Ported from `macos-system-health/artifacts/specs/TEMPLATE.md`** (13,577 bytes, read 2026-07-27)
> under issue #34. Section structure and ordering are preserved deliberately — divergence from the
> reference is what produced #34 in the first place. Every place this file differs from its source is
> marked **⟨audio-lab adaptation⟩** inline, so the divergence is visible rather than silent.

**Closes:** #⟨A⟩ · **Closes:** #⟨B⟩ ⟨repeat the keyword per issue — see §5⟩
**Milestone:** ⟨milestone, or "none — deliberately unmilestoned"⟩
**Labels:** `type: ⟨…⟩`, `area: ⟨…⟩`, `priority: ⟨…⟩`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model ⟨claude-opus-5|claude-sonnet-5⟩ --effort ⟨low|medium|high⟩`

> **⟨audio-lab adaptation — labels.⟩** This repo's `.github/labels.json` declares only `type:`,
> `area:` and `priority:` families. It has **no** `effort:`, `status:`, `risk:` or `confidence:`
> labels, and no `.github/label-policy.json`. Do not copy those from the reference repo — the PR
> metadata gate rejects any label not declared in `labels.json`. Verify every name you use against
> that file before creating the PR; never assume one exists.

> **⟨audio-lab adaptation — model pinning.⟩** Executor invocations pin the **full model id**
> (`claude-opus-5`, `claude-sonnet-5`), never the `opus`/`sonnet` alias. An alias silently resolves
> to whatever is latest for the account, so the same spec run twice can run on two different models
> and the record of which one did the work is lost.

> **Sizing rationale, stated honestly.** ⟨Name the rung on `AGENTS.md` § "Model and effort sizing"
> (Light / Standard / Heavy) and the single most-demanding motion in this spec that puts it there.
> If you are recommending one rung up or down, say what specific risk or ease justifies it — the
> maintainer decides on your honest reasoning, not on a default.⟩

> **PLACEMENT. ⟨audio-lab adaptation.⟩** Unlike the reference repo, `artifacts/specs/` here is
> **tracked** (`.gitignore` un-ignores `artifacts/specs/` and `artifacts/issues/` on purpose: a spec
> written to a gitignored path never reaches a cold-start, cloud, or fresh-clone session). Author the
> spec at `artifacts/specs/<name>.md`; the executor commits it there **and** copies it byte-identical
> to `prompts/<name>.md`, which is this repo's established convention — verify with
> `cmp artifacts/specs/<name>.md prompts/<name>.md`. `prompts/` seeds are **immutable after
> handoff**: revisions go to a NEW dated file, never an in-place edit.

---

## 0. Read the durable contracts first (non-negotiable)

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full** — the single binding operating contract: the standing
   commitments, the do-automatically and hold-for-the-maintainer lists, the canonical work-item
   flow, the definition of done, and the Fish/macOS local environment. Read it in full, not a skim;
   every §0 a spec imposes on the executor binds the author identically.
2. `CLAUDE.md` at the repo root — session-mode rules (PM vs executor), the lane guard, and the
   artifact-naming rule. Where it and `AGENTS.md` appear to conflict, **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md` — the maintainer's cross-project standing rules (changelog discipline,
   done-means-done, promises-persisted, GitHub metadata governance, continuity walkthrough).
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`.
5. `CHANGELOG.md` § Findings and `docs/` — what is already known about the external services, so it
   is not rediscovered at cost.
6. **Issue(s) #⟨A⟩, #⟨B⟩ in full, including every comment.** ⟨PM: if a comment rewrote the body or
   changed a deliverable, say so here and name which reading is authoritative — an executor handed a
   stale body works the wrong task.⟩

**A durable contract outranks this spec.** If the two conflict, stop and report; do not resolve it
yourself. **This spec is immutable after handoff** — if it is wrong or ambiguous, stop and report
rather than improvising a fix into it.

**The rules that will bite you on _this_ task** ⟨PM: REPLACE this list with the 3–6 rules that
actually apply to *this* work — the specific ones an executor would trip on here, drawn from
`AGENTS.md`. Do not ship the generic recital below unedited; a tailored list is the whole point of
this slot. The starred rules are load-bearing on nearly every task and are safe to keep:⟩

- **★ ⟨audio-lab adaptation — which actions are gated.⟩** In the reference repo, push and PR-open
  are gated and need per-instance approval. **Here they are not.** `AGENTS.md` § "Do these
  automatically, without asking" explicitly permits branch, commit, push, and opening a PR with full
  metadata. What is gated here is different: **never merge** (the maintainer merges via the GUI on an
  announced GREEN LIGHT), never spend >~2,000 ElevenLabs credits or run a full episode render, never
  use the single professional-clone slot, never change repo visibility or branch protection, never
  force-push or rewrite history. Read that section rather than importing another repo's gates.
- **★ Receipts expire on the next mutation.** A gate result is a fact about one tree state;
  `git add`/`git commit` void it. Order is **mutate → commit → gate → report**, every time — the gate
  is the *last* command before you report it. Name the SHA the gate ran against.
- **★ No contract-lawyering.** A criterion you cannot meet is a **finding to report, never a
  criterion to quietly drop.** Obligations are read for their high-quality spirit; ambiguity resolves
  toward more rigor, not less. "I never literally claimed it" is the offense, not the defense.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command** — never via a shell variable,
  which mangles the flag silently. The Bash working directory persists across tool calls, so an
  untargeted write can land in the wrong repository.
- **★ The executor declares itself.** Run as `env AUDIO_LAB_EXECUTOR=1 claude …` or the PM-lane
  guard (`.claude/hooks/pm-lane-guard.sh`) denies every git mutation, PR write, and in-repo file
  write outside `artifacts/`. If the guard blocks something it should not, **say so and ask** — do
  not weaken it, and do not report the blockage as a finished answer.
- ⟨task-specific rule, e.g. "the diff must be additive except in §X" / "this render costs ~N credits,
  quote before spending" / "a 200 from ElevenLabs is not proof the model honoured `voice_settings`"⟩

## 0b. Progress tracking

Maintain a live task list — one item per §4 execution step plus each numbered acceptance criterion —
moving each to in-progress/done as you go. Use **TodoWrite/TaskCreate** if available. **If neither is
available, say so once, then re-post the full checklist as inline markdown at the top of every
response that starts or finishes a step**, marking `[x]` done / `[~]` in-progress / `[ ]` todo. Do
not let more than one tool batch pass without a refreshed checklist. Before any long stretch, post a
one-line "next I am doing X." (The recurrence is the fix: a one-shot inline checklist scrolls away,
so it must be re-posted, not written once.)

---

## 1. Intended outcome

⟨One short paragraph: the checkable end state this PR produces. Write it so "done" is a property
someone can verify, not a judgment call.⟩

## 2. Current state and gap  ⟨or "Decisions — made by the PM, implement as written"⟩

⟨Either the measured baseline this work changes (show the commands and their **actual pasted
output** — do not assert a gap you did not measure; `(no output)` is itself valid evidence), or, when
the maintainer has already decided the open questions, a numbered list of decisions the executor
implements exactly and does not re-litigate. Mark each factual claim's provenance; §8 records which
you actually ran.⟩

⟨Include the `origin/main` SHA the spec was written against, and say what the executor should do if
it has moved — usually "expected, branch from current `main` and note the delta", not "stop".⟩

## 3. Deliverables

⟨Numbered, each independently checkable and mapped to the acceptance criterion that proves it. Name
the exact files and the exact behavior. Include the CHANGELOG entry as a numbered deliverable — it is
a merge gate enforced by `.github/workflows/changelog.yml`, not an afterthought.⟩

1. ⟨…⟩
2. **CHANGELOG** entry under the current date heading (or an explicit `skip-changelog` justification,
   which is the escape hatch for genuinely trivial changes, not a routine bypass).

## 4. Execution rails

Fish syntax, from the repository root. Each step is followed by its verification command and its
expected output.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git status --short; and git log --oneline -1
git switch -c ⟨type⟩/issues-⟨A⟩-⟨B⟩-⟨slug⟩
git status --short artifacts/specs/   # only the untracked spec for this PR
```

Expected: `main` at ⟨SHA⟩ or later; the only untracked file under `artifacts/specs/` is this spec.

### Step 1b — Continuity walkthrough, immediately after branching

Write the fill-in-the-rails walkthrough now (not on request) to
`artifacts/walkthroughs/<UTC-timestamp>-issue-<n>-<slug>.md`, per `AGENTS.md`'s proactive-walkthrough
rule: numbered mechanical Fish blocks for sync, branch, gate, commit, push, PR-with-metadata, checks,
merge and closure, each with its verification command, unknown values left as ⟨slots⟩. Refresh at two
checkpoints — **PR opened** and **awaiting merge**. ⟨audio-lab adaptation: `artifacts/walkthroughs/`
is gitignored here and stays that way — never commit it.⟩

### Step 2 … N — ⟨implement the deliverables⟩

⟨One step per logical unit of work, each a copy-pasteable Fish block with its verification. **Prove
any new gate or test rejects as well as accepts** — a gate only ever seen passing is unproven, and
every new deny needs a paired, proven permit.⟩

### Step N+1 — Commit, then gate on the committed state

```fish
git add -A
git status --short
git commit -m "⟨imperative subject⟩ (#⟨A⟩, #⟨B⟩)"
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Expected: `exit=0` and `All checks passed.` Name the commit SHA the gate ran against when you report
it — the receipt is about that tree state only. ⟨`scripts/check --no-labels` skips the networked
label-drift check when offline.⟩

### Step N+2 — Push, and Step N+3 — open the PR

⟨audio-lab adaptation: **neither is gated here.**⟩ Both are on `AGENTS.md`'s do-automatically list.
What *is* required is that **from the first push onward the PR is on merge HOLD** — say so
explicitly — until read-back verification completes, and then announce **GREEN LIGHT** proactively
rather than waiting to be asked. **Never merge.** The GUI's check status is never the authoritative
merge signal; the session's announcement is.

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "⟨same as the commit subject⟩ (#⟨A⟩, #⟨B⟩)" \
  --assignee Jared-Godar \
  --label "type: ⟨…⟩" --label "area: ⟨…⟩" --label "priority: ⟨…⟩" \
  ⟨--milestone "⟨milestone⟩"  # omit entirely when the linked issues are unmilestoned⟩ \
  --body-file ⟨path⟩
```

**A multi-issue PR repeats the closing keyword before _every_ number** — `Closes #⟨A⟩` and
`Closes #⟨B⟩` on separate lines. The combined form `Closes #⟨A⟩, #⟨B⟩` links **only #⟨A⟩** and
silently leaves the rest open. Confirm every label exists in `.github/labels.json` before creating
the PR; `scripts/check_pr_metadata.py` rejects any label not declared there, and requires ≥1 `type:`,
≥1 `area:`, and ≥1 assignee. ⟨It deliberately does **not** require a milestone or a `Closes` link —
Refs-only governance PRs are valid here.⟩

**Verify the closure links with the authoritative GraphQL field — never a body text-match.** A body
text-match (a `jq` `.body` regex test) checks what you *typed*; it returns true for the combined form
even though GitHub linked only the first issue. Only `closingIssuesReferences` reflects what GitHub
actually parsed:

```fish
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number state}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[].number'
```

Expected: every issue this PR closes, e.g. `⟨A⟩`, `⟨B⟩` — and **not** any issue it merely
references. **`closingIssuesReferences` lags a few seconds behind creation** — if the first read is
short, re-query rather than trusting it. Also read back the rest of the metadata:

```fish
gh pr view $pr -R Jared-Godar/audio-lab \
  --json number,labels,milestone,assignees \
  --jq '{number, labels:[.labels[].name], milestone:.milestone.title, assignees:[.assignees[].login]}'
gh pr checks $pr -R Jared-Godar/audio-lab --watch
```

The PR body carries: every decision restated as implemented; every deliberate scope exclusion and
deferral named with its issue number; the gate output from the **committed** state with its SHA; the
CI receipt; and any AC the spec flagged as possibly unmeetable, reported as a finding rather than
dropped. **If the PR adds a CI check, state whether it is required or advisory** — a check that
cannot block a merge must not be presented as a gate (#30).

## 6. Numbered acceptance criteria

⟨Explicitly numbered, each independently checkable, each naming the command or artifact that
demonstrates it, each mapped to the deliverable it proves. Self-reports against criteria the spec
never defined are unfalsifiable — define them here so the PM has a shared referent. Always include:⟩

- **AC⟨n⟩.** `bash scripts/check` is green on the **committed** state — output pasted, SHA named.
- **AC⟨n⟩.** CI is green on the pushed branch, with the run receipt.
- **AC⟨n⟩.** `closingIssuesReferences` on the PR returns **every** closed issue number — output pasted.
- **AC⟨n⟩.** CHANGELOG entry in the same PR.
- **AC⟨n⟩.** Spec present byte-identical at `artifacts/specs/` and `prompts/` (`cmp` output pasted).
- **AC⟨n⟩.** Continuity walkthrough written after branching and refreshed at PR-open, **no ⟨slot⟩
  left unfilled** except those tagged deliberate.
- **AC⟨n⟩.** Every deliberately-omitted or deferred item is named explicitly in the PR body.

## 7. Non-goals

⟨What this PR deliberately does not do, each with the issue that owns it if deferred. This is the
disclose-every-omission surface: name what was dropped, weakened, or deferred, not only the
comfortable ones.⟩

## 8. Verification status of this spec's claims

⟨A table: each factual claim / worked example in this spec marked **PM-VERIFIED** (with how) or
**PM-UNVERIFIED** (reasoned, not run). A worked example nobody ran is a liability handed to the
executor — say which is which so the executor knows what to confirm empirically.

This section is not optional and not decorative. Its absence from every hand-rolled spec written in
this repo on 2026-07-26 is directly traceable to #34.⟩

| Claim | Status |
|---|---|
| ⟨…⟩ | **PM-VERIFIED** — ⟨command/date⟩ |
| ⟨…⟩ | **PM-UNVERIFIED** — ⟨what is assumed⟩ |

## 9. References

⟨The issues (noting which body is authoritative if rewritten), the exemplar specs, and the exact
files/sections touched: `AGENTS.md` § ⟨…⟩, `CLAUDE.md` § ⟨…⟩, `scripts/check`,
`.github/labels.json`, `docs/PM-WORKFLOW.md`, etc. Include provenance: who found the problem, doing
what, on what date.⟩

---

## Handoff — the launch block the PM hands the maintainer (PM-only; delete before the executor works)

This is **not** part of the executor's spec — it is the canonical block the PM delivers to the
maintainer to launch the work (see `AGENTS.md` § "PM thread discipline", "Every executor launch
leaves a record"). Ship both lines in **one** fenced block so the maintainer copies once and both run
together: the `gh issue comment` records the launch on the tracked issue *before* the executor
starts, and the `claude` invocation starts it. Delivered separately, the comment can run while the
invocation does not — the issue would then claim a launch that never happened, which is the exact
failure this exists to prevent, and the reason "no PR, no branch, clean tree" is otherwise
indistinguishable between "never started" and "running, not yet committed."

⟨audio-lab adaptations, both paid for and both mandatory: the launch record ships **inside the same
fence** as the invocation, and the model is the **full id**, never the alias.⟩

```fish
gh issue comment ⟨N⟩ -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/⟨this-file⟩.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model ⟨claude-opus-5|claude-sonnet-5⟩ --effort ⟨low|medium|high⟩ \
  "Read and execute artifacts/specs/⟨this-file⟩.md in full."
```

Context for the maintainer goes **outside and after** the block, and never contains an instruction
the executor needs.
