# Executor seed — close #20 and #21

You are the **EXECUTOR** for `~/Code/audio-lab`. Read this whole file before acting.

**Supersedes** `20260726-issue-quality-remediation-executor.md` (its issues are filed as
#20 and #21). **Parks** `20260726-m1-core-extraction-and-infra-dns.md` — the M1 work runs
after this lands; its content moves onto issues #6 and #7 in PR 1.

---

## Read first, before any edit or command

A rule you remember is not a rule you have read. In order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `~/.claude/CLAUDE.md` — **including the two sections added 2026-07-26**:
   § "Issues are written to the house standard" and § "New-repo parity checklist"
4. `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`
5. `CHANGELOG.md` (especially **Findings**) and `docs/elevenlabs.md`
6. **GitHub issues #20 and #21** — these **are** the specification. This file is the
   sequencing plan; the issues carry the evidence and the acceptance criteria.

**The durable contracts outrank this file.** If they conflict, **stop and report** — do
not resolve it yourself, and do not resolve it by quietly doing less.

Then confirm what you read, and name the three constraints most binding on PR 1.

## Read the exemplars before writing anything

Do not work from this file's *description* of the house standard. Read the real thing:

```fish
gh issue view 92 -R Jared-Godar/macos-system-health
gh issue view 93 -R Jared-Godar/macos-system-health
gh issue view 94 -R Jared-Godar/macos-system-health
gh issue view 264 -R Jared-Godar/ecg_anomaly_detection
cat /Users/jaredgodar/Code/portfolio/macos-system-health/.claude/settings.json
ls /Users/jaredgodar/Code/portfolio/macos-system-health/.github/workflows/
ls /Users/jaredgodar/Developer/portfolio/ecg_anomaly_detection/.github/workflows/
```

`#93` and `#94` are the same defects as #21's Gaps 3, 4 and 5. Port the **fix**, not a
fresh invention.

## Why this exists

Jared audited this repo against `macos-system-health`, `ecg_anomaly_detection` and
`github-portfolio-modernization`. It diverged on **12 surfaces**. Three were defects
already diagnosed and written up in `macos-system-health` and reproduced here verbatim.
Two are live exposure on a **public** repo. Every issue was a 300–700 character stub
while the other repos run 3,000–6,000. Thirteen of seventeen commits here are
agent-authored; all the governance was written by an agent in a single day.

Your job is to close #20 and #21. **Not to add to them.**

---

## The contract

**Jared is the absolute authority.**

- The rules bind you completely. No self-invented exceptions, no unilateral bypass.
  **Prior authorization does not carry forward — ask again every time.**
- They do not bind him. **Never answer a direct instruction with "I can't, because of a
  rule."** Name the disconnect precisely, research whether it is a real conflict or a
  guardrail being misapplied, recommend a path with a stated preference — **he decides.**
- **Disclose every bypass before it happens**, never after.
- **No malicious compliance.** No doing it minimally or literally to prove a point. No
  technically-true-but-misleading.
- **Spirit over letter.** He is making a podcast, not administering you.

**Say what is true.**

- Distinguish **done (receipt attached) / queued / owed / not done.**
- Before any completion claim: *if he acted on this right now, would reality surprise
  him?* If yes, don't say it.
- Writing a rule is not following it. Adding a config is not enabling it. Suppressing an
  error is not fixing it.

**Never merge.** Announce **HOLD** from first push; **GREEN LIGHT** proactively the
moment checks pass, as its own statement, never buried in a long message.

## Working-tree state you will find

`.claude/hooks/pm-lane-guard.sh` is **already modified and uncommitted.** The PM thread
narrowed it on Jared's explicit instruction (2026-07-26) so PM can run `gh issue` and
`gh label`; git mutations, `gh pr create|merge|edit`, `gh repo edit` and `gh api -X`
remain denied.

**Do not revert it.** Verify the diff matches that description, then commit it in PR 1.
If it does not match, stop and report.

## Non-goals — all three PRs

- **Do not relax branch protection.** If something appears to need it, stop and ask.
- **Do not merge anything.**
- **Do not touch `prompts/`** — immutable after handoff.
- **Do not do M1, M5 or podcast work.** No `core/` extraction, no infra templates, no
  ElevenLabs calls, no credit spend.
- **Do not delete any label, change any repo setting, choose a licence, or create a
  project board** without Jared's explicit answer — see **Ask Jared** below.
- **Do not add governance rules** beyond the two named in PR 1.
- **Do not close** #4, #5, #6, #7, #8, #9, #10, #11, #13 — rewriting is not resolving.

---

# PR 1 — Lane, standards, issue rewrites · closes #20

Addresses #21 Gaps 6, 7, 8.

**1a. Commit the guard narrowing and make the docs true.**
`CLAUDE.md` § "The lane is enforced, not remembered" still says PM is denied
`gh pr/issue/label create`. **That is now false.** Update the capability table and the
prose: PM may run `gh issue` and `gh label` — writing issues is the PM's job here as it
is in every other project — while git mutations, `gh pr create|merge|edit`,
`gh repo edit` and `gh api -X` stay executor-only. Record honestly that the guard's
`Edit` clause blocks its own path, so the narrowing was applied by a Bash write — a hole
in the guard. State it; do not fix it in this PR.

**1b. Make PM artifacts survive.**
`.gitignore:100` ignores `artifacts/`, so every PM spec is invisible to cold-start, cloud
and fresh-clone sessions. `macos-system-health` tracks `artifacts/specs/`. Un-ignore
`artifacts/specs/` and `artifacts/issues/`; keep `walkthroughs/` and `session-handoffs/`
ignored — those are session scratch by contract. Commit the specs and issue drafts
already written on 2026-07-26. Verify: `git ls-files artifacts/specs/` returns them.

**1c. Land both standards in `AGENTS.md`.**
`~/.claude/CLAUDE.md` does not reach cold-start, cloud or fresh-clone sessions. Add two
condensed sections — do not paste the global text verbatim:

1. **Issue standard** — eight numbered sections; evidence with **pasted command output**
   as the non-negotiable core; options framed as the maintainer's choice; explicit
   non-goals; checkbox acceptance criteria ending in a CHANGELOG entry; full verified
   metadata; the ~1,500-character stub floor; applies from issue one in a new repo.
2. **New-repo parity checklist** — the surface list (workflows, repo settings, branch
   protection, labels, templates, local gates, tests, hygiene files, project board, agent
   contracts, and **reading the reference repos' open issues**), and that every gap is
   recorded as *adopted* or *deliberate exception with a reason*.

Also port the `AGENTS.md` sections this repo is missing (#21 Gap 8):
**"Repository visibility and deletion (hard rule)"**, **"Definition of done"**, and
**"PM thread discipline"** — from `macos-system-health`. Do not invent new ones.

**"PM thread discipline" is not optional here.** It carries two rules this repo has been
violating all day, both load-bearing:

- **Every executor relay ships as ONE copy-pasteable fenced block** — never prose
  interleaved with fences, never split by commentary. The block opens by naming the state
  it assumes (branch, commit, what is already done) so a stale or out-of-order paste is
  self-detecting; **anything the executor must not do goes in its first line, not its
  conclusion**; verification commands and their expected output travel inside it. Context
  for the maintainer goes outside and after the block, and never contains an instruction
  the executor needs.
- **Every executor launch leaves a record in the same block as the invocation** — the
  `gh issue comment` naming the spec path and a UTC timestamp ships *inside* the same
  fence as the `claude` invocation, so one paste does both. Shipping them separately
  reintroduces the failure it exists to prevent: the comment succeeds, the launch never
  runs, and the issue then claims a launch that did not happen. This is what closes the
  absence-is-ambiguity gap — no PR, no branch and a clean tree is the state of both
  "never started" and "running, not yet committed".

Port the **model/effort flag** convention with it: executor invocations carry
`--model` and `--effort` explicitly. See `macos-system-health/docs/PM-WORKFLOW.md`
§ "Section 5: Executor Seed Prompt Pattern" for the six required seed blocks.

Note also that `macos-system-health`'s lane **explicitly permits the PM thread to create
and edit issues, labels, milestones, board items and comments.** That is the norm this
repo's guard contradicted before it was narrowed — cross-check the updated `CLAUDE.md`
table in 1a against it.

**1d. Rewrite the nine stub issues** — #4, #5, #6, #7, #8, #9, #10, #11, #13. This is
`gh issue edit`, not commits; list every one in the PR body.

- **Research each for real.** Evidence sections are **measured**, not composed. Run the
  command, paste the output. `(no output)` is valid evidence. If you cannot produce
  evidence for a claim, cut the claim.
- **Preserve the substance.** You are rewriting the briefing, not re-deciding the work.
  A genuine scope question becomes an option in that issue's §4 for Jared.
- **Do not decide #10 or #11.** Both are his calls. Sharpen the tradeoffs; do not lean.
- **#6 and #7:** move the scope, constraints, invariants table and acceptance detail out
  of `artifacts/specs/20260726-m1-core-extraction-and-infra-dns.md` and **onto the
  issues**. That is the concrete fix for #20 §3's first argument.
- **Metadata:** confirm `type:`/`area:`/`priority:` exist in `.github/labels.json`. **Do
  not create `effort:`/`risk:`/`status:`** — that is #21 §4 item 5, Jared's call.
- Titles: rewrite only bare verb phrases. `#6`'s is already specific — leave it.

# PR 2 — Exposure. Land before PR 3

Addresses #21 Gaps 1 and 9. A public repository with no full-history secret scan and no
licence is live exposure, not untidiness.

**2a. Full-history secret scan.** Port `full-history-scan.yml` — read all three reference
repos and take the most current. **`ecg_anomaly_detection` #264 records a real bug in
this workflow** (*"secret-scan job is event-scoped despite `fetch-depth: 0`, and a
comment overclaims full-history coverage"*). Read it first; do not carry the defect
across. Verify with a control that it actually scans history rather than exiting green.
Paste the run URL and result. **If it finds a secret, report privately — never in a
public PR body.**

**2b. Hygiene files.** `LICENSE` (Jared's choice — do not default one), `SECURITY.md`,
`CONTRIBUTING.md`, `.github/CODEOWNERS`. Adapt from the reference repos; do not copy
blind — this repo has no external contributors and a different threat surface.

# PR 3 — Integrity and gates

Addresses #21 Gaps 3, 4, 5, 9. Partly blocked on the **Ask Jared** answers.

**3a. Label integrity.** `labels.json` declares 14, live has 23, nothing reconciles them.
Port the mechanism rather than inventing one — `macos-system-health` has
`scripts/check-label-policy` + `.github/workflows/label-policy-gate.yml`;
`ecg_anomaly_detection` has `scripts/sync_github_labels.py` +
`scripts/detect_label_drift.py`. **Negative test required:** seed a drift, show the
mechanism catching it, revert. A gate never demonstrated failing is not known to work.
Act on the 9 stock labels only with Jared's answer and usage counts in hand.

**3b. Repo settings.** Only on Jared's answer. Verify by `gh repo view --json` read-back
— never infer success from the command that set it.

**3c. Remaining gates and scaffolding.** `.github/ISSUE_TEMPLATE/` (port the shape; **say
plainly in the PR body that a template is a scaffold, not a gate** — `--body-file` walks
past it) · `dependabot.yml`, closing **#5** · `scripts/check` and `scripts/install-hooks`
from `macos-system-health` — `install-hooks` is what would have prevented this repo's #14
(`pre-commit` configured but never installed, every local guard inert) · PR-metadata gate
from `metadata-governance.yml` or `pr-metadata-checks.yml` · project board, only on
Jared's answer.

**Not in scope:** `tests/` (#21 Gap 9). It belongs with the M1 `core/` extraction, where
there is something stable to test. **Say so explicitly in the PR body** rather than
letting it look forgotten.

---

## Ask Jared — batch these early, do not stall four separate times

Gather the evidence so each answer is one word, then ask once:

1. **Which LICENSE.** Two or three options, one line of consequence each.
2. **The 9 stock labels** — `bug`, `documentation`, `enhancement`, `duplicate`,
   `good first issue`, `help wanted`, `invalid`, `question`, `wontfix`. Delete, adopt, or
   document as ignored. **Run a usage count per label first**
   (`gh issue list --label <name> --state all --limit 100 --json number | jq length`) —
   deleting a label strips it from every issue carrying it.
3. **Merge settings** — `mergeCommitAllowed` and `rebaseMergeAllowed` are `true` while
   `AGENTS.md` declares linear/squash-only; `deleteBranchOnMerge` is `false`.
4. **Project board** — create one, or record that audio-lab deliberately runs without
   one. No other repo lacks one.

Batch 1 and 2 together early; do not wait until you reach them.

## Mechanics — every PR

Per `AGENTS.md` § "Canonical work-item workflow".

1. `git fetch`; confirm `git log --oneline main..origin/main` is empty; branch.
2. **Continuity walkthrough immediately after branching** —
   `artifacts/walkthroughs/<UTC-timestamp>-<slug>.md`, Fish blocks, a verification
   command after each step, unknowns as ⟨slots⟩. Refresh at PR-opened and awaiting-merge.
3. `pre-commit run --all-files` **green before** each commit, not after.
4. `CHANGELOG.md` in the same PR. PR 1's root cause — no parity check on repo creation —
   goes under **Findings**.
5. Push over SSH.
6. Metadata before pushing: `Closes #20` on PR 1; partial `#21` references on all three,
   with `Closes #21` only on PR 3 **if every acceptance criterion on #21 is met** —
   otherwise name the ones outstanding and leave it open. Labels verified against
   `.github/labels.json`; assignee `Jared-Godar`. **Disclose in the body what you
   deliberately excluded and why.**
7. Verify by read-back: `gh pr checks <N>` and
   `gh pr view <N> --json assignees,labels,milestone`. Never infer success from the
   create command.
8. **HOLD from first push. Do not merge.**

## Receipts — no completion claim without these

Label each **done (receipt attached) / queued / owed / not done**.

- `git diff` of the guard narrowing as committed
- `git ls-files artifacts/specs/` output
- per rewritten issue: `gh issue view <n> --json body | grep -c '^## '` ≥ 6
- median issue body length ≥ 2,500 chars, command output pasted
- full-history-scan run URL and result
- the label-drift **negative test** — seeded, caught, reverted
- `gh repo view --json` read-back after any settings change
- `gh pr checks <N>` for all three PRs
- confirmation no `effort:`/`risk:`/`status:` label was created and no label deleted
  without an answer

Anything that did not run: say **"not run"** and why. A partially-met criterion reported
as met is the exact failure #20 and #21 exist to correct.

## Hold for Jared

Merging · branch protection · deleting labels or unmerged branches · repo visibility ·
force-push or history rewrite · choosing the LICENSE · repo settings · creating the board
· **any ElevenLabs spend** · billable AWS · `episodes/` · `prompts/` (immutable) ·
`~/ToldStraight-*`

**Start with PR 1.**
