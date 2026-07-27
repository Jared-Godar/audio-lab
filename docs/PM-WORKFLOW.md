# PM Workflow & Governance

> `AGENTS.md` at the repository root is the authoritative operating contract; this
> document is the deeper PM playbook. Where the two appear to disagree, `AGENTS.md` wins.
>
> **Ported from `macos-system-health/docs/PM-WORKFLOW.md`** (13,684 bytes, read
> 2026-07-27) under issue #34. The six-section structure and its ordering are preserved
> deliberately — divergence from the reference is what produced #34. Every place this file
> differs from its source is marked **⟨audio-lab adaptation⟩** inline, so the divergence is
> visible rather than silent.

This document describes the Product Manager role in this project: how to structure work,
create durable specifications, coordinate with executors, and maintain clean governance
state. It serves as both a reference for executors and a checklist for PM sessions.

---

## Section 1: PM Role & Division of Labor

### What is the PM role?

The PM in this project:

- **Proposes** PR-sized chunks of work (informed by issues, `ROADMAP.md`, dependencies)
- **Creates durable specifications** — `artifacts/specs/*.md`, copied to `prompts/*.md`,
  with detailed requirements and checklists
- **Creates durable governance** — rules written to `AGENTS.md`, `CLAUDE.md`,
  `~/.claude/CLAUDE.md`, or memory files, in the same turn the rule is agreed
- **Writes issues, labels, milestones and board items** — this is PM work here, not
  something to ask permission for
- **Coordinates with executors** via launch blocks carrying explicit model/effort flags
- **Verifies executor work** read-only: does the output match the spec *as handed over*?
- **Announces merge HOLD and GREEN LIGHT** — and never merges

### Division of Labor

| Role | Task | Example |
| --- | --- | --- |
| **PM** | Propose work | "Next chunk: issues #33 + #34, governance bundle" |
| **PM** | File the issue | House-standard briefing, full metadata at creation |
| **PM** | Create spec | Write `artifacts/specs/YYYYMMDD-issue-N-slug.md` from `TEMPLATE.md` |
| **PM** | Create launch block | `env AUDIO_LAB_EXECUTOR=1 claude --model claude-opus-5 --effort high …` |
| **PM** | Verify executor work | Read-only `gh pr view`, `gh pr checks`, `git log`, diffs |
| **Executor** | Execute spec | Branch, implement, gate, commit, push, open PR |
| **Executor** | Verify locally | `bash scripts/check` green on the **committed** state |
| **Executor** | Announce readiness | Receipts for every claimed step; merge HOLD stated |
| **PM** | Approve merge | Confirm gates, metadata, closure links → announce GREEN LIGHT |
| **Maintainer** | Merge | Squash-merge via the GUI. **No agent ever merges.** |
| **Executor** | Post-merge closure | Pull main, prune branches, verify issue closure |

**⟨audio-lab adaptation — the lane is a mechanism here, not a habit.⟩**
`.claude/hooks/pm-lane-guard.sh` is a tracked `PreToolUse` hook that makes this table
structural for the rows it can reach. A PM session cannot commit, push, create or merge a
PR, edit repo settings, or write in-repo files outside `artifacts/`. An executor declares
itself with `AUDIO_LAB_EXECUTOR=1`. See `CLAUDE.md` § "The lane is enforced, not
remembered" for the capability table and the residual holes, which are stated plainly
there rather than papered over. **The guard is a lane marker, not a sandbox.**

---

## Section 2: PM Artifact Lifecycle

### Key Principle

Durable PM artifacts are committed to version control; session artifacts are gitignored.
**A rule or spec written to a gitignored path does not reach a cold-start, cloud, or
fresh-clone session** — which is the whole reason `AGENTS.md` is itself tracked.

### Durable Artifacts (committed)

- **Location:** `artifacts/specs/`, `artifacts/issues/`, `prompts/`, and the contract
  files themselves. **⟨audio-lab adaptation:⟩** `.gitignore` ignores `artifacts/*` but
  un-ignores `artifacts/specs/` and `artifacts/issues/` on purpose.
- **Lifetime:** persist across sessions; discovered by future work
- **Commit gate:** committed with the PR that acts on them, not accumulated uncommitted
- **Immutability:** `prompts/` seeds are **immutable after handoff**. Revisions go to a
  NEW dated file, announced to the maintainer, who decides whether to restart the work —
  never an in-place edit.
- **Example lifecycle:**
  1. PM copies `artifacts/specs/TEMPLATE.md` to `artifacts/specs/YYYYMMDD-issue-N-slug.md`
  2. PM fills every ⟨slot⟩ and deletes the template banner
  3. PM hands the maintainer one fenced launch block (issue comment + invocation together)
  4. Executor reads the spec, implements, and commits it — plus a byte-identical copy at
     `prompts/YYYYMMDD-issue-N-slug.md` (`cmp` the two to prove it)
  5. The spec is referenced in the PR and stays in the repo for future reference

### Session Artifacts (gitignored)

- **Location:** `artifacts/walkthroughs/*.md`, `artifacts/session-handoffs/*.md`
- **Lifetime:** the current session; never committed
- **Continuity walkthrough:** written **immediately after branching**, refreshed at PR-open
  and awaiting-merge. Numbered mechanical Fish blocks, each with its verification command,
  so the workflow can be finished by hand with no agent at all.
- **Session handoff:** written on any wind-down signal — "wrap up", "limit approaching",
  context compaction, an unusually long session — **before the session ends**.
- **Never include secrets in either.**

### Commitment Discipline

Per `~/.claude/CLAUDE.md` § "Promises must be persisted", any agreement to "always do X"
is written somewhere durable **in the same turn**, and where it landed is confirmed to the
maintainer. If the commitment cannot be made durable or enforceable as stated, say so at
promise time — never let the maintainer discover later that a promise lived nowhere.

**⟨audio-lab adaptation.⟩** A PM session cannot write to tracked files here. It satisfies
this rule by writing the rule verbatim to `artifacts/rules-pending/<date>-<slug>.md` in the
same turn and queueing an executor spec to promote it — **and must state plainly that the
rule is captured, not in force, until it lands.** Writes *outside* the repo (e.g.
`~/.claude/CLAUDE.md`) are ungated precisely so cross-project rules can be persisted
immediately.

---

## Section 3: Durable Contracts & Gates

### Three Layers of Governance

**Layer 1: Global contracts** (`~/.claude/CLAUDE.md`)

- Standing rules for ALL projects: changelog discipline, done-means-done, merge signals,
  defensive external calls, continuity walkthroughs, the issue house standard.
- **A rule that lives only here does not bind a cold-start, cloud, or fresh-clone
  session.** Cross-project rules land in **both** this file and the repo's `AGENTS.md`, or
  they reach one machine and nothing else.

**Layer 2: Project contracts** (`AGENTS.md`, `CLAUDE.md`, memory files)

- `AGENTS.md` — tracked, binding on every session including cold-start ones
- `CLAUDE.md` — session modes, the lane guard, artifact naming
- Memory under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — local only,
  so anything that must survive a fresh clone belongs in `AGENTS.md` instead

**Layer 3: Repository docs** (`CONTRIBUTING.md`, `SECURITY.md`, `docs/`)

- Workflow expectations and safety rules. Link from specs; don't duplicate.

**⟨audio-lab adaptation — Layer 4: mechanisms.⟩** This repo has two tracked hooks, because
a rule with nothing behind it depends on an agent remembering, which is a hope rather than
a guardrail:

- `.claude/hooks/pm-lane-guard.sh` (`PreToolUse`) — enforces the PM/executor split
- `.claude/hooks/contract-reinjection.sh` (`UserPromptSubmit`) — re-injects a generated
  digest of the contract files every turn and escalates when one changes mid-session
  (#33). It **fails open by design**: any error injects nothing rather than breaking the
  prompt. It cannot make an agent read what it injects — it removes the excuse, not the
  possibility.

### Pre-Merge Gates (always verify before GREEN LIGHT)

Every pull request must satisfy these before the PM announces merge-readiness:

- ✅ **CI green.** Currently required on `main`: `Lint, format and secrets`,
  `Locked environment (pipeline)`, `Locked environment (spotify)`, `Changelog updated`.
  Other checks run but are **advisory** — see the warning below.
- ✅ **Linked issues exist and were created before the PR** (`Closes #N`; the metadata
  gate validates the labels, and creating the issue afterwards causes failures)
- ✅ **Multi-issue PRs repeat the keyword** — `Closes #A` / `Closes #B`, never the
  combined form, which links only the first
- ✅ **Closure links verified via `closingIssuesReferences`**, not a body text-match
- ✅ **Metadata complete** — ≥1 `type:` label, ≥1 `area:` label, both declared in
  `.github/labels.json`, and ≥1 assignee. A milestone only where the linked issue has one.
- ✅ **`CHANGELOG.md` updated in the same PR** (enforced by `changelog.yml`;
  `skip-changelog` is for genuinely trivial changes, not a routine bypass)
- ✅ **Executor showed receipts** — verification output for every claimed step, and the
  gate re-run on the **committed** state
- ✅ **Every deliberate omission named** in the PR body

> **⚠️ Advisory checks are not gates.** Several checks run on every PR without being in
> `main`'s required-status-checks list, so they can go red while the PR stays mergeable
> (#30). `strict: true` and `enforce_admins: true` are set, so adding a required check is
> real friction and affects the maintainer's own merges — which is why the required list is
> **the maintainer's decision, never an agent's**. When a PR adds a CI check, the PR body
> must state whether it is required or advisory. A check presented as a gate that cannot
> block a merge is the `AGENTS.md` § "The artifact is not the behavior" failure.

---

## Section 4: PM Session Responsibilities

### Before Work Begins

- [ ] Read `AGENTS.md` in full (the binding contract — read, not recalled)
- [ ] Read `CLAUDE.md` (session modes, lane guard, artifact naming)
- [ ] Read `~/.claude/CLAUDE.md` (global standing rules)
- [ ] Read memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`
- [ ] Read `CHANGELOG.md` § Findings and `docs/` — what is already known about the
      external services, so it is not rediscovered at cost
- [ ] Confirm which session mode you are in; if unclear, **say so and ask**
- [ ] Understand the current roadmap and blocking issues (`ROADMAP.md`, open issues)
- [ ] Identify the next PR-sized chunk (or wait for direction)

### During Work (for each PR specification)

- [ ] Copy `artifacts/specs/TEMPLATE.md` → `artifacts/specs/YYYYMMDD-issue-N-slug.md`
- [ ] Ground the spec in a tracked issue, current `main`, and repo state read **this
      session** — never a stale or remembered shape
- [ ] Fill every ⟨slot⟩, including **§8 Verification status of this spec's claims**. Mark
      each claim PM-VERIFIED (with the command) or PM-UNVERIFIED (with what is assumed).
- [ ] If creating follow-up issues, write them to the house standard and add them to the
      project at creation time:

  ```fish
  gh issue create -R Jared-Godar/audio-lab \
    --title "..." --body-file artifacts/issues/<slug>.md \
    --label "type: ..." --label "area: ..." --label "priority: ..." \
    --assignee Jared-Godar
  gh issue edit <N> -R Jared-Godar/audio-lab --add-project "audio-lab"
  ```

- [ ] **Verify issue creation succeeded** — read back, never infer from the create command:

  ```fish
  gh issue view <N> -R Jared-Godar/audio-lab \
    --json number,labels,assignees,projectItems \
    --jq '{number, labels:[.labels[].name], assignees:[.assignees[].login], projects:[.projectItems[].title]}'
  ```

- [ ] Hand the maintainer **one** fenced launch block (Section 5), with `--model` and
      `--effort` explicit and the model given as a **full id**, not an alias
- [ ] Monitor progress; intervene if execution deviates from the spec

### After the Executor Announces Readiness (pre-merge review)

- [ ] Read the executor's report fully
- [ ] Verify every gate in Section 3 **independently and read-only** — the PM's job is to
      re-check, not to relay. Distinguish **done (receipt attached) / relayed (someone
      else's claim, not re-verified) / queued / owed / not done.**
- [ ] Confirm CI status with `gh pr checks <N>`, and note which checks are advisory
- [ ] Verify metadata by read-back: labels, assignee, milestone
- [ ] Verify `closingIssuesReferences` returns every intended issue and no unintended one
- [ ] Verify `CHANGELOG.md` was updated in this PR
- [ ] **Verify against the spec as handed over**, identified by path and content — never
      against a revision its author never received
- [ ] Announce **GREEN LIGHT: clear to squash-merge PR #N via the GUI**, or name the
      specific blockers. Announce it proactively the moment it is safe, not when asked.

### If Creating Governance Updates (rules, contracts, memory)

- [ ] Write the rule in the **same turn** it is agreed
- [ ] Choose the layer deliberately: `AGENTS.md` for anything that must bind cold-start and
      cloud sessions; `~/.claude/CLAUDE.md` for cross-project scope; memory for local
      preferences. **Cross-project rules go in both.**
- [ ] For memory files, use the format: brief rule/fact, then a `**Why:**` line, then a
      `**How to apply:**` line; link related memories with `[[memory-name]]`
- [ ] Update the memory `MEMORY.md` index in the same turn — one line, no content
- [ ] State plainly whether the rule is **written but unenforced** or **built and
      verified**. "Written, not in force" is a respectable status; letting the first pass
      for the second is not.
- [ ] Record the origin: which issue, what went wrong, on what date

### Before Session End (clean-state check)

- [ ] Run `git status --short`
- [ ] Expect one of: a clean tree on `main`, or only gitignored `artifacts/` scratch
- [ ] NO uncommitted spec or contract files left behind
- [ ] Continuity walkthrough written and refreshed; session handoff written if winding down
- [ ] Both are gitignored — and before removing any worktree, copy them into the primary
      checkout, because pruning must never destroy the only copy

---

## Section 5: Executor Launch Block Pattern

**⟨audio-lab adaptation — this section is renamed from "Executor Seed Prompt Pattern" and
carries two hard-won additions.⟩** The reference repo ships the launch record and the
invocation as separate steps and pins the model by alias. Both were paid for here:

- **The `gh issue comment` launch record ships INSIDE the same fence as the `claude`
  invocation.** One paste does both. Shipped separately, the comment can succeed while the
  launch never runs — and the issue then claims a launch that did not happen. This is what
  closes the absence-is-ambiguity gap: no PR, no branch, and a clean tree is the state of
  both "never started" and "running, hasn't committed yet."
- **The model is pinned by full id** (`claude-opus-5`, `claude-sonnet-5`), never the
  `opus`/`sonnet` alias, which silently resolves to whatever is latest for the account.

Every launch block MUST carry these six blocks, in this order:

### Block 1: Durable contracts (read & follow)

```text
DURABLE CONTRACTS — read and follow before doing anything else:
1. AGENTS.md (the binding operating contract for this repo — read in full)
2. CLAUDE.md (session modes, the PM-lane guard, artifact naming)
3. ~/.claude/CLAUDE.md (the maintainer's cross-project standing rules)
4. Memory files under ~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/
5. CHANGELOG.md § Findings and docs/ (what is already known)

A durable contract OUTRANKS this spec. Conflict -> stop and report, do not resolve it
yourself. The spec is immutable after handoff: if it is wrong, stop and report.
```

### Block 2: Specification reference

```text
Read and execute artifacts/specs/YYYYMMDD-issue-N-slug.md in full.
```

### Block 3: Progress tracking

```text
PROGRESS TRACKING: create a task list before starting work.
- One item per execution step plus each numbered acceptance criterion
- Mark in-progress/done as you go; refresh at least once per tool batch
- If no task tool is available, say so once and re-post the checklist inline
```

### Block 4: Model & effort flags

Both are explicit — the harness has no per-task auto-selector, so per-session sizing *is*
per-task sizing. Size to the most demanding motion in the spec:

- **Light — `claude-sonnet-5` low/medium.** Docs-only or metadata-only PRs; fill-in-the-
  blanks specs with exact content provided.
- **Standard — `claude-sonnet-5` high.** Defined-scope single-repo implementation. The
  default when unsure.
- **Heavy — `claude-opus-5` high.** Audits, ambiguous scope, or anything irreversible,
  outward-facing, or touching the harness itself.

Optimize for quality and issue-closure, not token conservation.

### Block 5: Pre-merge gate reminder

```text
Before announcing readiness, verify and PASTE THE OUTPUT for each:
- bash scripts/check green on the COMMITTED state, with the SHA named
- gh pr checks <N> — noting which checks are advisory rather than required
- gh pr view <N> --json labels,assignees,milestone — read back, never inferred
- closingIssuesReferences returns every intended issue (not a body text-match)
- CHANGELOG.md updated in this PR
- Every deliberately-omitted item named in the PR body
NEVER merge. Announce merge HOLD from first push; the maintainer merges on GREEN LIGHT.
```

### Block 6: Post-merge closure reminder

```text
After the merge is confirmed:
- gh pr view <N> --json state  -> MERGED; linked issues -> CLOSED
- git switch main; and git pull --ff-only; and git fetch --prune
- Delete merged local branches (git branch -D; squash merges break -d's ancestry check)
- Before removing any worktree, copy artifacts/walkthroughs/ and
  artifacts/session-handoffs/ into the primary checkout first
```

### Complete Example

Everything the maintainer needs, in one copy-pasteable fence:

```fish
gh issue comment 33 -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/20260727-issue-33-contract-injection.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model claude-opus-5 --effort high \
  "Read and execute artifacts/specs/20260727-issue-33-contract-injection.md in full."
```

Context for the maintainer goes **outside and after** the block, and never contains an
instruction the executor needs.

---

## Section 6: Lessons Learned & Governance Decisions

**⟨audio-lab adaptation:⟩** the reference repo's table records its own Phase 1 incidents.
This one records audio-lab's, because a ported table full of another repo's history is
decoration.

| Failure | Root cause | Durable fix | Status |
| --- | --- | --- | --- |
| A PM chat made ~15 commits, 5 PRs and set branch protection — all forbidden by the split it had just authored | The rule was prose with no mechanism behind it | `.claude/hooks/pm-lane-guard.sh`, tracked (#18) | **Built and verified** |
| Guard matched `git merge-base` as a mutation; `gh api --method DELETE` slipped through | Naive verb matcher, no word boundary; only the short `-X` flag matched | Anchored verbs + both flag forms (#35) | **Built and verified** |
| A PM session could write any tracked file via `printf >` and any credential file anywhere | The Bash branch inspected verbs only; paths outside the repo were ungated | Redirect/write detection + `~/.aws`, `~/.ssh`, `~/.gnupg` denied for all sessions (#48) | **Built and verified** |
| A session cited an `AGENTS.md` rewritten 30 minutes earlier, in the same session | Contracts were read once at boot; nothing re-injected them | `contract-reinjection.sh`, `UserPromptSubmit` (#33) | **Built and verified** |
| Every spec and launch block was hand-rolled and inconsistently wrong | The four workflow templates were never ported | This file, `artifacts/specs/TEMPLATE.md`, and the two seed templates (#34) | **Scaffold, not a gate** |
| Renders named `76a676a12824.mp3` sent the maintainer on a scavenger hunt | The generator knew the date, model, voice and purpose at write time and discarded them | `CLAUDE.md` § "Generated artifacts must be self-describing" | **Written, enforced by review only** |
| Three PR checks and the test suite cannot block a merge | The required-checks list was never updated as gates were added | #30 — **open; the maintainer's decision** | **Not fixed** |
| Nine issues filed as 300–700 character stubs | The house issue standard was never carried into the new repo | `AGENTS.md` § "Issues are written to the house standard" | **Written, unenforced** |

**Read this table honestly.** "Written, unenforced" is a real and respectable status. What
is not acceptable is letting it read as "built and verified" — that is the failure
`AGENTS.md` § "The artifact is not the behavior" exists to name.

### Governance milestones

- **PR #18** — the PM/executor lane made structural instead of remembered
- **PR #25** — the PR metadata gate
- **PR #35 / #36** — guard matcher fixes; the label-drift gate
- **This PR (#33, #34, #48)** — contract re-injection, the template port, guard hardening,
  and `pytest` wired into CI

---

## See Also

- [AGENTS.md](../AGENTS.md) — the binding operating contract; authoritative over this file
- [CLAUDE.md](../CLAUDE.md) — session modes, the lane guard capability table, artifact naming
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch, PR and merge workflow
- [SECURITY.md](../SECURITY.md) — safety and privacy rules
- [artifacts/specs/TEMPLATE.md](../artifacts/specs/TEMPLATE.md) — the spec template
- [prompts/EXECUTOR-SEED-PROMPT-TEMPLATE.md](../prompts/EXECUTOR-SEED-PROMPT-TEMPLATE.md) — the launch-block template
- [templates/task-spec.md](../templates/task-spec.md) — the lightweight single-task brief
- [ROADMAP.md](../ROADMAP.md) — planned work
- [Project board](https://github.com/users/Jared-Godar/projects/8) — the audio-lab backlog

---

**This documentation is foundational governance — referenced by all future PM work and
executor specs. It is a scaffold, not a gate: nothing enforces its use, and saying so is
part of using it honestly.**
