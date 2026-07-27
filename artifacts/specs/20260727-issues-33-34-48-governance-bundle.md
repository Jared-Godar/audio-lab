# Spec: Governance bundle — contract re-injection, workflow templates, guard hardening, pytest in CI (#33, #34, #48)

**Closes:** #33 · **Closes:** #34 · **Closes:** #48 (three separate `Closes` keywords —
the combined form closes only the first)
**Also resolves #30 Gap 4** — referenced, **not** closed; #30's §4 required-checks decision
remains the maintainer's.
**Labels:** `type: task`, `area: governance`, `priority: high` (verified in
`.github/labels.json`) · **Assignee:** `Jared-Godar` · **Milestone:** none (all three
issues are unmilestoned; do not invent one)
**Sizing:** `claude-opus-5` / `high` — pin the model id explicitly, not the `opus` alias.
This authors a hook that runs on **every turn of every session in this repo** and modifies
the guard that can block the maintainer's own work. The blast radius is the harness itself.

---

## 0. FIRST ACTION — read the durable contracts

`AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, `CHANGELOG.md` § Findings.

**A durable contract outranks this spec.** Conflict → stop and report.
**This spec is immutable after handoff.** Wrong or ambiguous → stop and report.

## 0.1 THE THINGS YOU MUST NOT DO

- **Do not break the session.** A `UserPromptSubmit` hook that errors or hangs degrades
  every prompt in this repo. It **must fail open**: any error, missing file, or unexpected
  state exits 0 silently and injects nothing. Never let it be the reason a prompt fails.
- **Do not make the guard block the maintainer.** Every new deny needs a paired, proven
  permit. `AGENTS.md` § "Jared is the absolute authority" is explicit that a guardrail
  obstructing him turns a fix for the agent's mistake into a recurring tax on his work.
- **Do not touch `~/.claude/`, `~/.aws/`, `~/.ssh/`, or `~/.gnupg/`** as part of this work.
  You are adding a rule about those paths, not exercising it.
- **Do not change branch protection or any repository setting.** #30's required-checks
  decision is the maintainer's and is explicitly out of scope.
- **Do not "improve" the ported templates' structure** (#34). Divergence from the
  references is what created that issue.
- **Do not hand-write the contract digest** (#33). It is generated from the files at hook
  time or it is another artifact that can lie.
- **Do not merge.** Open the PR, verify, stop.
- **Wait for PR for #44 to merge before branching** if it is still open — it touches
  `docs/` and the worktree must be clean.

## 1. Intended outcome

Four governance gaps closed in one PR, each with a working mechanism rather than a clause:

1. Sessions get the durable contracts re-injected, and notice when they change mid-session.
2. The PM/executor workflow has the templates the reference repos have.
3. The guard's two documented holes are narrowed, honestly, with the residue named.
4. `pytest` runs in CI.

## 2. Current state — measured 2026-07-27

```
$ ls docs/PM-WORKFLOW.md artifacts/specs/TEMPLATE.md templates/task-spec.md 2>&1
                                                     -> all ABSENT

$ python3 -c "import json;print(json.load(open('.claude/settings.json'))['hooks'].keys())"
dict_keys(['PreToolUse'])          # no context-injecting hook anywhere in the portfolio

$ sed -n '96,97p' .claude/hooks/pm-lane-guard.sh
    # matcher covers git/gh VERBS only — no redirect, no tee, no path handling

$ grep -ci pytest .github/workflows/quality.yml
1                                   # a deferral comment, not a job

$ git log --oneline -1 origin/main
3f1887b   # confirm this is still HEAD before branching
```

## 3. Decisions already made — implement, do not re-open

- **#33 → option 1.** `UserPromptSubmit` injecting a **generated** digest plus file SHAs,
  escalating to full text when a SHA changes. Recorded as the maintainer's stated
  preference on 2026-07-26.
- **#34 → option 1.** Port all four artifacts, adapted to this repo's paths. The `docs/`
  ADR-and-runbook surface (#34 Gap 2) is **deliberately excluded** — that issue says to
  decide it independently, and this bundle does not.
- **#48 §4A → option 1**, chosen by the maintainer 2026-07-27: detect redirects and write
  commands targeting in-repo paths.
- **#48 §4B → option 4**, chosen by the maintainer 2026-07-27: deny `~/.aws`, `~/.ssh`,
  `~/.gnupg` for **all** sessions including executors. `~/.claude/` stays writable.
- **#30 Gap 4:** wire `pytest` in as a CI job. **Do not touch the required-checks list.**

## 4. Scope and deliverables

### A. Contract re-injection hook (#33)

- A tracked `UserPromptSubmit` hook, registered in the **tracked** `.claude/settings.json`
  so cold-start, cloud, and fresh-clone sessions inherit it.
- It computes SHAs for `AGENTS.md`, `CLAUDE.md`, and `~/.claude/CLAUDE.md` and emits a
  **generated** digest — section headings and the SHAs — never hand-maintained prose.
- **Escalation:** when a SHA differs from what the session last saw, say so explicitly and
  inject the changed file's full text, or an unmistakable instruction to re-read it before
  citing it. That is the entire point — the observed failure was mid-session drift.
- **Bounded.** State the injected size in the PR body. If the full-text escalation would be
  very large, inject the changed sections plus a direct instruction to re-read, and say so.
- **Fails open, always.** Missing file, unreadable state, any error → exit 0, inject
  nothing. Prove it: temporarily rename `AGENTS.md`, show the session still works, restore.
- Record the per-turn token cost honestly in `CLAUDE.md` and the CHANGELOG. This is a real
  recurring cost, and #33 §4 names it as the tradeoff of the chosen option.
- **This is net-new, not a port** — no context-injecting hook exists in any of the four
  repositories. `AGENTS.md` § "New-repo parity checklist" requires that a deliberate
  divergence be recorded as one; say it in the header and the CHANGELOG.

### B. Workflow templates (#34) — a port, cite the source of each

| Port to | From (read it, do not paraphrase) |
| --- | --- |
| `artifacts/specs/TEMPLATE.md` | `macos-system-health/artifacts/specs/TEMPLATE.md` (13,577 b) |
| `docs/PM-WORKFLOW.md` | `macos-system-health/docs/PM-WORKFLOW.md` (13,684 b; 6 sections + See Also) |
| `prompts/EXECUTOR-SEED-PROMPT-TEMPLATE.md` | `macos-system-health/prompts/2026-07-21-issue-45-executor-seed.md` |
| `templates/task-spec.md` | `github-portfolio-modernization/templates/task-spec.md` |

Adapt names, paths, label vocabulary, and the `AUDIO_LAB_EXECUTOR=1` launch form to this
repo. **Preserve structure and section ordering.** Where this repo genuinely differs — the
lane guard, `artifacts/specs/` being tracked here, the `--model claude-opus-5` pinning —
adapt and **note the adaptation inline** so the divergence is visible.

Two things this repo has learned that the templates must carry, because they were paid for:

- The launch block ships the `gh issue comment` launch record **inside the same fence** as
  the `claude` invocation (`AGENTS.md` § "PM thread discipline").
- Executor invocations pin the **full model id** (`claude-opus-5`, `claude-sonnet-5`), not
  the `opus`/`sonnet` alias, which silently resolves to whatever is latest for the account.

### C. Guard hardening (#48)

- **Bash branch:** deny `>`/`>>` redirects, `tee`, `sed -i`, `cp`, `mv`, `dd`, `truncate`
  when the destination resolves inside the repo and outside `artifacts/`. Reuse the existing
  quoted-span stripping so a quoted string in an issue body cannot trip it.
- **Write/Edit branch:** deny `~/.aws`, `~/.ssh`, `~/.gnupg` for **all** sessions — this
  check runs **before** the `AUDIO_LAB_EXECUTOR=1` early exit, since it applies to
  executors too. `~/.claude/` explicitly stays permitted.
- **Header honesty:** name what remains open — `bash -c`, a script file, `python -c`,
  and any interpreter. State plainly that this is a lane marker, not a sandbox.
- **`CLAUDE.md`'s capability table must end up matching what the guard actually does.** No
  row may claim enforcement it does not have. Update the "Known hole" paragraph to describe
  the *new* residue rather than the closed one.

### D. pytest in CI (#30 Gap 4)

- A job in `.github/workflows/quality.yml` running `uv run pytest` for `pipeline/`.
- **Mandatory disclosure in the PR body, in these terms:** this check **cannot block a
  merge** until it is added to the required-status-checks list, which is a repository
  setting only the maintainer can change. Include the exact command or console click path
  he would use. Shipping a test job that looks like a gate and is not is precisely the
  `AGENTS.md` § "The artifact is not the behavior" failure, and #30 §4 warns about it by
  name.

## 5. Acceptance criteria

- [ ] **Hook fails open — demonstrated:** with `AGENTS.md` temporarily renamed, a session
      still works and the hook injects nothing; output pasted; file restored
- [ ] **Hook escalates — demonstrated:** change a contract file, show the next turn's
      injection reporting the changed SHA; output pasted
- [ ] Injected payload size stated in bytes/tokens, and the recurring cost recorded in
      `CLAUDE.md` and the CHANGELOG
- [ ] Hook registered in the **tracked** `.claude/settings.json`; `git ls-files` confirms
- [ ] All four templates present at the §4.B paths, each naming its source file inline
- [ ] Both repo-specific carry-forwards present in the templates (launch record inside the
      fence; full model id, not the alias)
- [ ] **Guard negative tests, both directions, all pasted:**
      PM `printf > AGENTS.md` **denied** · PM `printf > artifacts/x.md` **allowed** ·
      PM `Write ~/.aws/config` **denied** · executor `Write ~/.aws/config` **denied** ·
      PM `Write ~/.claude/x.md` **allowed** · executor `git commit` **allowed** ·
      PM `git log` / `gh pr view` **still allowed** · PM `gh issue create` **still allowed**
- [ ] Guard header names the residual bypasses explicitly
- [ ] `CLAUDE.md` capability table matches observed guard behaviour — every row spot-checked
- [ ] `pytest` job present in `quality.yml` with a passing run URL
- [ ] PR body states plainly that the pytest job **cannot block a merge** yet, with the
      command/click path to make it required
- [ ] `pre-commit run --all-files` green; all CI green
- [ ] Spec copied verbatim to `prompts/20260727-issues-33-34-48-governance-bundle.md`
- [ ] PR uses **three separate** `Closes` keywords (#33, #34, #48); assignee and labels
      verified by `gh pr view --json` read-back
- [ ] Continuity walkthrough after branching, refreshed at PR-open, **no `⟨slot⟩` unfilled**
- [ ] CHANGELOG entry covering all four items
- [ ] Everything deliberately omitted named in the PR body

## 6. Non-goals

- **Not changing branch protection or the required-checks list** (#30 §4 stays the
  maintainer's).
- **Not the `docs/` ADR/runbook surface** (#34 Gap 2) — decided separately.
- **Not changing the PM/executor split**, the git/gh verb rules, or the contracts' content.
- **Not claiming the guard is a sandbox.**
- **Not touching `~/.claude/`, `~/.aws/`, `~/.ssh/`, `~/.gnupg/`.**
- **Not the label vocabulary (#8), the probe commit (#9), tagging (#4), parity (#21), or
  branch protection (#31)** — all still open, all needing maintainer decisions.

## 7. Risk

**This is the highest-blast-radius change in the repository so far.** The
`UserPromptSubmit` hook runs on every turn of every session here; the guard can block the
maintainer. Both failure modes are silent-until-painful.

Mitigations, all required rather than advisory: fail-open on the injection hook, paired
permit/deny tests on every guard rule, and a rollback stated in the PR body — the exact
edit to `.claude/settings.json` that disables each hook, so recovery does not require
reading the code first.

**Second risk: token cost.** The digest is paid on every turn forever. State the number;
do not bury it.

## 8. References

- **#33** (re-injection, §4 option 1) · **#34** (templates, §4 option 1) · **#48** (guard
  holes, §4A option 1 / §4B option 4) · **#30** Gap 4 (pytest), §4 not addressed
- `.claude/hooks/pm-lane-guard.sh` — lines 46–72, 74–115
- `.claude/settings.json` — currently `PreToolUse` only
- `macos-system-health`: `artifacts/specs/TEMPLATE.md`, `docs/PM-WORKFLOW.md`,
  `prompts/2026-07-21-issue-45-executor-seed.md`
- `github-portfolio-modernization`: `templates/task-spec.md`
- `AGENTS.md` § "The artifact is not the behavior" · § "Jared is the absolute authority" ·
  § "New-repo parity checklist" · § "PM thread discipline"
- Authored by the PM thread 2026-07-27 at the maintainer's request to bundle #33/#34 and
  add governance items that fit. #48 was filed the same turn from a hole found while
  declining to write `~/.aws/config`; its two options were put to the maintainer and
  answered before this spec was written.
