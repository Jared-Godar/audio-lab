# Executor spec — file the issue-quality issue, then rewrite every stub issue

Authored 2026-07-26 by the PM thread. This runs **before** the M1 work in
`artifacts/specs/20260726-m1-core-extraction-and-infra-dns.md`, which is parked.

---

## 0. Read the durable contracts before you touch anything

First action, before any edit, command, or plan:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `~/.claude/CLAUDE.md` — **especially the new § "Issues are written to the house
   standard — in every repo, from issue one"**, which is the standard this spec applies
4. `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`
5. `CHANGELOG.md` (Findings) and `docs/elevenlabs.md`

**A durable contract outranks this spec.** Conflict → stop and report; do not resolve
it yourself and do not resolve it by quietly doing less.

You are the **executor** (`AUDIO_LAB_EXECUTOR=1`). You commit, push, open PRs, and edit
issues. **You never merge.**

---

## 1. Read the exemplars before writing anything

Do not write from this spec's description of the standard. Read the actual issues:

```fish
gh issue view 92 -R Jared-Godar/macos-system-health
gh issue view 93 -R Jared-Godar/macos-system-health
gh issue view 251 -R Jared-Godar/ecg_anomaly_detection
```

Match their structure, density, and tone. Eight numbered `##` sections; every claim in
the Evidence section backed by a **command and its actual pasted output**; resolution
options presented as a maintainer's choice with honest costs; explicit non-goals;
checkbox acceptance criteria ending in a CHANGELOG entry; provenance in References.

## 2. File the tracking issue

The body is already drafted and reviewed at
`artifacts/issues/20260726-issue-quality-remediation.md`. It carries its own title,
labels, milestone, and assignee in the header block.

- Strip the header block; file the body from `## 1. Summary` onward.
- `gh issue create --body-file` from a temp file — do not retype it.
- Verify label names against `.github/labels.json` first. Do not assume.
- Read the new issue number back with `gh issue view <N> --json labels,assignees` and
  record it. Everything below references it as **⟨META⟩**.

## 3. Rewrite all nine open issues

This is **option 1** from ⟨META⟩ §4 — the preferred path, and a strict subset of
options 3 and 4, so doing it now forecloses nothing. Options 3, 4, and 5 stay open on
⟨META⟩ for Jared to decide later. **Do not implement 3, 4, or 5.**

Issues: **#4, #5, #6, #7, #8, #9, #10, #11, #13.**

For each one:

- **Research it for real.** The Evidence section is measured, not composed. Read the
  code, run the command, paste the output. `(no output)` is valid evidence. If you
  cannot produce evidence for a claim, cut the claim.
- **Preserve the substance.** You are rewriting the briefing, not re-deciding the work.
  A genuine scope question you uncover becomes an option in that issue's §4 for Jared —
  never a decision you make.
- **Do not decide #10 or #11.** Both are his ear and his architecture call. Their
  rewrites lay out the tradeoffs and the evidence more sharply; they do not lean.
- **Titles:** rewrite only where the current title is a bare verb phrase. `#6`
  ("Extract core/ and archive audition-v1 by folder move") is already specific — leave
  it. `#5` ("Add Dependabot for GitHub Actions") is thin; give it the consequence.
- **Metadata:** confirm `type:`/`area:`/`priority:` exist in `.github/labels.json` and
  that the milestone still matches. Do **not** invent `effort:`/`risk:`/`status:` —
  they do not exist in this repo's schema and adopting them is ⟨META⟩ §4 option 5,
  which is Jared's call.
- Apply with `gh issue edit <N> --body-file <tmp>`.

**#6 and #7 specifically:** the M1 spec at
`artifacts/specs/20260726-m1-core-extraction-and-infra-dns.md` contains the scope,
constraints, carried-forward invariants table, and acceptance detail that should have
been on those issues. **Move that content onto the issues.** That is the concrete fix
for ⟨META⟩ §3's first argument.

## 4. Land the standard in `AGENTS.md`

`~/.claude/CLAUDE.md` does not reach cold-start, cloud, or fresh-clone sessions — and
those are exactly the sessions that dropped this standard. Add a section to `AGENTS.md`
carrying the same rule.

Condense; do not paste the global section verbatim. It must state: the eight-section
structure, evidence-with-pasted-output as the non-negotiable core, options-as-choice,
non-goals, checkbox acceptance criteria ending in CHANGELOG, full verified metadata,
the ~1,500-character stub floor, and that this applies from issue one in a new repo.

**Do not add any other governance rule.** One section, this subject only.

## 5. PR and mechanics

Per `AGENTS.md` § "Canonical work-item workflow".

- Sync, branch, and **write the continuity walkthrough immediately after branching** to
  `artifacts/walkthroughs/<UTC-timestamp>-<slug>.md`.
- The PR carries the `AGENTS.md` section and the `CHANGELOG.md` entry. The issue
  rewrites are `gh issue edit` calls, not commits — list them in the PR body.
- `pre-commit run --all-files` green **before** each commit.
- CHANGELOG: entry under **Changed** for the `AGENTS.md` standard and the rewrites;
  the cause under **Findings** — the standard existed in two repos and was never
  carried into this one, so each new project restarted at stub quality.
- Metadata: `Closes #⟨META⟩` · labels `type: bug`, `area: governance`,
  `priority: high` · assignee `Jared-Godar` · no milestone.
- Verify by read-back: `gh pr checks <N>` and
  `gh pr view <N> --json assignees,labels,milestone`.
- **Announce HOLD from first push. Do not merge.**

## 6. Receipts — no completion claim without these

Label each **done (receipt attached) / queued / owed / not done**.

- ⟨META⟩ issue number, with `gh issue view` metadata read-back
- The Gap 2 command from ⟨META⟩ §2, re-run **after** the rewrites, output pasted —
  every issue must show `h2-sections` ≥ 6 and `acceptance-checkboxes` ≥ 1
- The Gap 1 length command re-run after the rewrites, output pasted — median ≥ 2,500
- Confirmation that no `effort:`/`risk:`/`status:` label was created
- `gh pr checks <N>` output

If a criterion did not pass, say so with the output. A partially-met criterion reported
as met is the exact failure ⟨META⟩ exists to correct.

## 7. Stop and report — do not decide these yourself

- ⟨META⟩ §4 options 3, 4, or 5 (issue template, workflow gate, label schema)
- Any substantive scope change surfaced by a rewrite
- #10 or #11's underlying decision
- A conflict with `AGENTS.md` / `CLAUDE.md` / `~/.claude/CLAUDE.md`
- Closing, or proposing to close, any issue
