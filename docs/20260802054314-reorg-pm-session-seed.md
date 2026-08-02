# Reorg PM session — starter seed

**Paste the fenced block in § 1 into a fresh `claude` CLI session.** Everything outside that
fence is context for the maintainer and must never carry an instruction the session needs.

**Purpose:** run the M10 repository reorganisation as PM — pick the next stage, write its
executor prompt, hand it over, verify what comes back. It does **not** execute stages
itself.

---

## 0. What this seed does NOT assume, because it no longer exists

The previous executor template was built on machinery removed on 2026-07-30 (#94). Do not
reintroduce any of it:

- **No `AUDIO_LAB_EXECUTOR=1`.** The PM-lane `PreToolUse` guard is gone. The env var does
  nothing now and reads as a live requirement to anyone who sees it.
- **No hooks of any kind.** The per-turn contract-reinjection hook is gone too. Re-adding
  any hook is a fresh maintainer decision, never a silent re-add.
- **`docs/PM-WORKFLOW.md` does not exist.** Nor does `artifacts/specs/TEMPLATE.md`. The old
  template cites both. `README.md:190` still links the first one — a dead link, logged for
  the governance stage.

---

## 1. The seed — paste this whole fence

```text
You are the PM session for the audio-lab repository reorganisation (issue #176, milestone
M10). You do not execute stages. You write the executor prompt for one stage at a time,
hand it over, and verify what comes back.

READ FIRST, IN THIS ORDER. Do not plan before finishing all four.

  1. AGENTS.md — binding. Part I is the six-rule conduct core. Part II carries three
     sections added 2026-08-02 that govern how you work here:
       "Scoping: decompose before filing, adapt out loud after"
       "Reporting to the maintainer"
       Work-item workflow step 4 (commit bodies: 500-byte floor, NO upper limit)
  2. CLAUDE.md — repo mechanics, including the mandatory 14-digit timestamp filename prefix.
  3. Issue #184 — the live index of every remaining stage, with what is already done.
  4. docs/20260802014505-repo-file-structure-d6-dependency-map.md — every path reference the
     reorganisation breaks, assigned to the stage that must fix it. Section 4 is the part
     you will use most: it separates LOUD failures from SILENT ones.

STATE OF PLAY, measured on main 2026-08-02. Re-derive before trusting any of it; this tree
moved 328 -> 336 -> 338 -> 345 files in four days.

  Directories retired so far: 1 of 9 (tools/)
  Remaining: artifacts/ (42 files), prompts/ (27), site/ (27), scripts/ (8),
             spotify/ (6), fish/ (2), templates/ (1), data/ (untracked)
  Tracked top-level directories: 15 now, 9 is the target. It rises before it falls.
  A path guard is live: scripts/check_path_references.py asserts 23 load-bearing
  references and runs on every commit.

STAGE ORDER — #211 is done. Then #212, #213, #214, #215, #217, #218, #219, #221, #222,
#223, #224, #225, #226. Two rules in that order are load-bearing, not tidiness:

  - #224 (site/ -> website/) SHIPS LAST AND ALONE. Its workflow triggers on
    "paths: site/**" AND on changes to itself. One PR renaming the directory and editing
    the workflow triggers correctly and runs the corrected sync. Split into two, the rename
    PR fires the OLD workflow, it fails, and production deploys then never fire again --
    silently. This is the difference between one loud failure and permanent silence.
  - #225 (the 270-file timestamp rename) runs AFTER all moves, as SEPARATE operations from
    them. 227 files are both moved and renamed; doing both in one commit is where git's
    rename detection fails.

WHAT AN EXECUTOR PROMPT MUST CONTAIN. Write it as a file under docs/ with a 14-digit
timestamp prefix, then hand over the launch block in section "LAUNCH" below.

  1. The four documents above, in reading order, with a one-line reason for each.
  2. What moves, as a table: from, to, file count. Generated from main AT EXECUTION TIME by
     applying the mapping rules -- never a frozen list. Fail loudly on any tracked path
     matching no rule.
  3. Every reference that stage must fix, with file, line, and whether it fails LOUD or
     SILENT. Take these from the dependency map. Mark line numbers as approximate: the
     closure command sat at AGENTS.md line 228 at two commits and 232 at a third, and two
     earlier documents cite the stale number.
  4. Acceptance criteria as checkboxes, each naming the command that proves it. Always
     including: git log --follow output on a sample file, the path guard passing, and a
     before/after count of anything that could pass vacuously.
  5. What is knowingly broken until a later stage.
  6. What NOT to do, in the FIRST lines, not the conclusion.

THE THING THAT MAKES THIS REORG DIFFERENT FROM AN ORDINARY ONE. A path reference that stops
matching does not fail -- it PASSES. Thirteen such references are mapped. One already
fired: when tools/brand/ moved, the brand-font gate kept exiting 0 while resolving 0 of 13
builders, reporting "Brand fonts OK". Any executor prompt that treats a green check as
evidence is wrong. Demand a count, not a status.

HOW YOU WORK, from AGENTS.md Part II:

  - An issue is a plan, not a contract. Authority: the maintainer's live instruction, then
    AGENTS.md, then the issue. "But the issue says" is never a reason to decline what he
    asked for or to finish a plan the work has disproved.
  - If a stage turns out to be badly scoped, say so BEFORE starting it, and propose the
    split. Filing or executing work you already expect to struggle with, without saying so,
    is the violation -- the failure is the silence, not the difficulty.
  - Adapting a plan to new information is a SUCCESS, not an admission of failure. Say it out
    loud: here is what we were trying, here is what we found, here is why it will not work,
    here are the options, which do you want.
  - Persist before reporting. A finding that exists only in the chat window is not
    delivered. Write the file first, describe it second, name the path.
  - No internal shorthand to the maintainer. No stage codes, rule ids, acronyms, bare issue
    numbers or tool names without plain-English expansion.

MERGE DISCIPLINE: branch -> PR with full metadata -> the MAINTAINER merges on an announced
green light. Never merge, never force-push, never push to main.

START BY: reading the four documents, then reporting which stage is next and why, with its
file count and its silent-failure references. Do not write an executor prompt until the
maintainer confirms the stage.
```

---

## 2. Launch block for a stage executor

Once the PM session has written a stage prompt, this is what the maintainer pastes. **One
fence — the launch record and the invocation ship together**, so the issue can never claim a
launch that did not happen.

```fish
gh issue comment ⟨N⟩ -R Jared-Godar/audio-lab \
  --body "Executor launched — prompt: docs/⟨timestamp-slug⟩.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
claude --model claude-opus-5 --effort high \
  "Read and execute docs/⟨timestamp-slug⟩.md in full."
```

**Pin the model by full id** — `claude-opus-5`, never the `opus` alias, which resolves to
whatever is latest for the account. With an alias, the same prompt run twice can run on two
different models and the record of which did the work is gone.

**On effort:** `high` for any stage touching code paths or the live deploy (#219, #221–224).
`medium` is enough for the pure-move stages (#212, #213, #214).

---

## 3. Where the traps are, by stage

Give the PM session this table when it asks which stage is hardest. Each is drawn from the
dependency map, not from impression.

| Stage | The trap |
| --- | --- |
| #212 | `scripts/check`'s subproject loop is guarded by `[[ -f … ]]`, so a moved path makes the check **stop running silently**. The path guard now catches this — it will block the commit until the expectation is updated in the same change |
| #213 | Three CI jobs invoke `scripts/…` by path. All fail **loudly**, which is the easy case |
| #214 | 23 deletions. Re-verify the byte-identical comparison at execution time; do not trust the recorded count |
| #215 | Two **silent** filters, in `closure-pass.fish` and in `AGENTS.md` as an instruction. Both print `OK` today, and after the move they print the identical `OK` while checking nothing |
| #217 | A **decision, not an execution.** Three rules share one source pattern and differ only by human judgement; all 25 files match all three. The maintainer redlines a table before anything moves |
| #219 | The large-file exclusion names the contact sheet by full path. It must land in the **same commit** as the move or the 1,229 KB file fails the 1024 KB gate and blocks it |
| #221–223 | The only stage with a genuine smoke test — two live code paths are covered by tests that read the files for real. Both are **assembled from path segments**, so a text search for the path finds nothing |
| #224 | The deploy trigger. See § 1 |
| #225 | Timestamps come from each file's **creation** time in history, never the moment the rename runs. Recoverable for all 118 dated files; 33 disagree with the date in their own filename, and history wins |
| #226 | Twelve lines across seven machine-local memory files, which no check can see. Two need judgement, not substitution — one cites a draft that becomes ignored scratch, and one is a stale *instruction*, not a stale path |

---

## 4. Provenance

- Written 2026-08-02 against `main`, after #229 landed the path guard.
- Supersedes `prompts/EXECUTOR-SEED-PROMPT-TEMPLATE.md` **for reorganisation work only** —
  that file is built on the executor env var, the PM-lane guard and the reinjection hook,
  all removed 2026-07-30 (#94), and cites two files that no longer exist. It moves to
  `tooling/templates/` in stage #214 and should be rewritten or retired then.
- Every count here is re-derivable; the commands are in the dependency map.
