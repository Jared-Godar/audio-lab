# Executor spec — land the PM-lane gate

Written 2026-07-26 by the PM session, which was **blocked by the very hook this spec
installs** while trying to edit `CLAUDE.md`. That block is the acceptance evidence:
the gate works before it is even committed.

## Read first — durable contracts outrank this spec

Before acting, read: `AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, memory files
under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, and
`CHANGELOG.md`. If anything here conflicts with those, **stop and report** — do not
resolve it yourself.

## Launch

```fish
cd ~/Code/audio-lab
env AUDIO_LAB_EXECUTOR=1 claude
```

Without the flag every step below is denied by the guard, which is the point.

## Context

`audio-lab` had no tracked `.claude/settings.json`. The PM/executor split existed
only as prose in `CLAUDE.md` while a PM-mode chat made ~15 commits, opened 5 PRs,
created 11 issues, set branch protection and attempted a force-push. Nothing stopped
it because nothing was gating it.

Two files already exist **uncommitted** in the working tree — do not rewrite them:

- `.claude/hooks/pm-lane-guard.sh` (mode 0755)
- `.claude/settings.json`

`.gitignore` has already been amended with `!.claude/hooks/` and `!.claude/hooks/*`
so both are trackable. Verified with `git add -n`.

## Tasks

### 1. Branch

Already created: `governance-pm-lane-gate`. If absent, cut it from current `main`.

### 2. Add the enforcement section to `CLAUDE.md`

Insert immediately after the line
`**Unclear which mode you are in:** say so and ask before proceeding.`

````markdown
## The lane is enforced, not remembered

`.claude/hooks/pm-lane-guard.sh` is a tracked `PreToolUse` hook. It does not detect
your mode — **it makes the boundary structural**:

| | PM (default) | Executor |
|---|---|---|
| Declared by | nothing — absence of the flag | `AUDIO_LAB_EXECUTOR=1` |
| Write/Edit | **only** under `artifacts/` | anywhere |
| `git commit/push/merge/branch -D` | **denied** | allowed |
| `gh pr/issue/label create`, `gh api -X` | **denied** | allowed |
| `git log/diff/status`, `gh * view/checks` | allowed | allowed |

Launch an executor session with:

```fish
env AUDIO_LAB_EXECUTOR=1 claude
```

Read-only git and `gh` stay open to PM deliberately — independently verifying the
executor's work is the PM's actual job, and it cannot do that blind.

**Why this exists.** The split lived as prose in this file for a whole session while
a PM-mode chat made ~15 commits, opened 5 PRs, created 11 issues and set branch
protection. Nothing stopped it, because nothing was gating it. A rule with no
mechanism behind it depends on an agent remembering, which is a hope rather than a
guardrail. The hook is tracked so cold-start, cloud and fresh-clone sessions inherit
it — a guard living only in `settings.local.json` binds one machine and nothing else.
````

### 3. Fix the branch-deletion contradiction in `AGENTS.md`

The hold list currently forbids "deleting any repository or **branch**", while the
canonical closure pass instructs deleting merged branches. The intent was to protect
**unmerged** work. Change the hold-list bullet:

- from: `**Changing repository visibility, or deleting any repository or branch.**`
- to: `**Changing repository visibility, or deleting any repository, or deleting any
  branch that is not fully merged.** Deleting a merged branch during the documented
  post-merge closure pass is expected, not gated.`

### 4. Update `CHANGELOG.md`

Under `## 2026-07-26`, add to the **existing** `### Added` section — do **not** create
a second `### Added` or `### Changed` heading, MD024 will fail the build:

```markdown
- **PM-lane enforcement.** `.claude/settings.json` (tracked) plus
  `.claude/hooks/pm-lane-guard.sh` gate the PM/executor split as a mechanism instead
  of a rule to remember. PM sessions may write only under `artifacts/` and cannot run
  mutating `git`/`gh`; executors declare themselves with `AUDIO_LAB_EXECUTOR=1`.
  Read-only verification stays open to PM. Origin: the split lived as prose for a full
  session while a PM chat made ~15 commits, 5 PRs, 11 issues and set branch protection
  with nothing gating it.
```

And to the existing `### Fixed` section:

```markdown
- **`AGENTS.md` forbade deleting any branch** while the closure pass required deleting
  merged ones. Scoped the hold to unmerged branches.
```

### 5. Gate, commit, push

```fish
uvx --from pre-commit==4.6.0 pre-commit run --all-files
git add .claude/hooks/pm-lane-guard.sh .claude/settings.json .gitignore CLAUDE.md AGENTS.md CHANGELOG.md
git commit
git push -u origin governance-pm-lane-gate
```

Verify the hook kept its executable bit — the hook is useless if it lands 0644:

```fish
git ls-files -s .claude/hooks/pm-lane-guard.sh
```

Expect mode `100755`. If it shows `100644`, run
`git update-index --chmod=+x .claude/hooks/pm-lane-guard.sh` and amend.

### 6. Open the PR

Assignee `Jared-Godar`; labels `type: automation`, `area: governance`,
`priority: high`. Body must state that the hook blocked the PM session mid-edit, and
include the verification matrix from §7.

Verify by read-back, never from the create command:

```fish
gh pr view ⟨N⟩ --json assignees,labels
gh pr checks ⟨N⟩
```

### 7. Acceptance tests — run these and paste the output into the PR

```fish
for c in "git commit -m x" "git push origin main" "gh pr create --title x" \
         "gh issue create --title x" "gh api -X PUT repos/x/y"
    echo -n "$c -> "
    echo "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"$c\"}}" \
        | bash .claude/hooks/pm-lane-guard.sh | jq -r '.hookSpecificOutput.permissionDecision // "ALLOW"'
end
```

All five must print `deny`.

```fish
for c in "git log --oneline -5" "gh pr checks 1" "gh pr view 1"
    echo -n "$c -> "
    echo "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"$c\"}}" \
        | bash .claude/hooks/pm-lane-guard.sh | jq -r '.hookSpecificOutput.permissionDecision // "ALLOW"'
end
```

All three must print `ALLOW`.

```fish
echo '{"tool_name":"Bash","tool_input":{"command":"git commit -m x"}}' \
    | env AUDIO_LAB_EXECUTOR=1 bash .claude/hooks/pm-lane-guard.sh \
    | jq -r '.hookSpecificOutput.permissionDecision // "ALLOW"'
```

Must print `ALLOW`.

## Do not

- Do not merge the PR. The PM announces GREEN LIGHT; Jared merges.
- Do not weaken the guard to make a step convenient. If it blocks something it
  should not, **stop and report** — that is a spec defect to fix, not a hook to edit.
- Do not move the hook into `settings.local.json`. Tracked is the whole point.

## Final report

State: branch, commit SHA, PR number, the file mode of the hook, the full acceptance
matrix, and anything that behaved differently from this spec.

---

# Added 2026-07-26 — additional tasks

## 8. Promote the pending rule into `AGENTS.md`

Source text: `artifacts/rules-pending/20260726-artifact-is-not-behavior.md`.

Insert the full **"The artifact is not the behavior"** section (everything from the
`##` heading through the Origin quote) into `AGENTS.md`, immediately after the
**Standing commitments to the maintainer** list. Reproduce it verbatim — the origin
account and the quoted response are the rule's teeth, not decoration.

Then delete `artifacts/rules-pending/20260726-artifact-is-not-behavior.md`, since the
rule now lives in the canonical file. (`artifacts/` is gitignored, so this is a local
delete, not a commit.)

## 9. Promote the same rule into `~/.claude/CLAUDE.md`

Same verbatim section, inserted immediately before the
`## GUI navigation: give the click path, not a URL (hard rule, 2026-07-26)` heading.

This is cross-project scope: it binds every repo, not just audio-lab.

## 10. Resolve the same-turn-persistence conflict

**The conflict, found the hard way:** the global rule requires a standing commitment
be written somewhere durable *in the same turn it is made*. The PM-lane guard forbids
PM from writing anything outside `artifacts/`. A PM session therefore cannot satisfy
the persistence rule as written — which is exactly what happened today.

Do **not** weaken the guard to fix this. Amend `AGENTS.md`'s **Self-recording
promises** commitment instead, appending:

```markdown
  A PM session satisfies this by writing the rule verbatim to
  `artifacts/rules-pending/<date>-<slug>.md` in the same turn and queueing an executor
  spec to promote it. That file is the durable capture; it is **not** the rule being in
  force, and any report must say so plainly until an executor lands it.
```

Rationale to carry into the PR: the alternative — carving `~/.claude/**` out of the
guard — would let a PM session edit the very rules that constrain it. Capture-then-
promote keeps the promise durable within seconds while leaving the gate intact.

## 11. Changelog additions for tasks 8–10

Append to the **existing** `### Added` section (do not create a second heading):

```markdown
- **"The artifact is not the behavior"** hard rule in `AGENTS.md` and
  `~/.claude/CLAUDE.md`: writing the thing that describes X is not doing X, reports
  must distinguish "written, not in force" from "built and verified", and no
  technicality defense is available for meeting the letter while defeating the purpose.
- `artifacts/rules-pending/` — where a PM session captures a standing commitment
  verbatim in the same turn it is made, pending executor promotion to the canonical
  files.
```
