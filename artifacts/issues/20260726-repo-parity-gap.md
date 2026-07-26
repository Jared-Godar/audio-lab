# Issue draft — to be filed by an executor

**Title:** No parity check on repo creation: 11 solved problems were re-derived or dropped, three of them already written up as defects elsewhere

**Labels:** `type: bug`, `area: governance`, `priority: high`
**Milestone:** none
**Assignee:** Jared-Godar

---

## 1. Summary

This repository was set up from scratch rather than from the standard already running
in `macos-system-health`, `ecg_anomaly_detection`, and
`github-portfolio-modernization`. Nothing compares a new repository against an
established one, so every gate, template, workflow, and repo setting is present only
if some agent happened to remember it.

Eleven divergences were found in a single sweep. Three of them are not new problems —
they are **defects already investigated and written up in another repository, then
reproduced here verbatim**. Two are live exposure on a public repository.

The individual gaps are cheap to close. The absence of a parity check is not, because
it will produce the same list again on the next repository.

## 2. Evidence

All measured 2026-07-26 by the PM thread.

**Gap 1 — no full-history secret scan, on a public repository.**

```
$ for r in audio-lab macos-system-health ecg_anomaly_detection github-portfolio-modernization; do
    printf "%-32s %s\n" "$r" "$(test -f .../$r/.github/workflows/full-history-scan.yml && echo PRESENT || echo ABSENT)"
  done
audio-lab                        ABSENT
macos-system-health              PRESENT
ecg_anomaly_detection            PRESENT
github-portfolio-modernization   PRESENT

$ gh repo view --json visibility --jq .visibility
PUBLIC
```

The only repository without the scan is the only one that is public.

**Gap 2 — no issue is on a project board, and no board exists for this repo.**

```
$ gh issue view 6  --json projectItems --jq '.projectItems|length'
0
$ gh issue view 13 --json projectItems --jq '.projectItems|length'
0
```

Boards exist for the other three (`#3 macOS System Health Roadmap`, `#5 ECG Pipeline
Modernization`, `#7 GitHub Portfolio Modernization`). This matters beyond tidiness:
`~/.claude/CLAUDE.md` § "GitHub metadata governance" states that the metadata
validator "checks that the linked issue exists, **is in the tracked Project**, and has
Project fields populated." That rule has been recited in this repo against a mechanism
that does not exist here.

**Gap 3 — stock labels duplicating the `type:` scheme. Already documented as a defect
in `macos-system-health` #93, Gap 3.**

```
$ gh label list --limit 200 --json name --jq '[.[].name]|sort|join(", ")'
area: episodes, area: governance, area: infra, area: pipeline, area: voices, bug,
documentation, duplicate, enhancement, good first issue, help wanted, invalid,
priority: high, priority: low, priority: medium, question, skip-changelog,
type: automation, type: bug, type: decision, type: docs, type: task, wontfix
```

Nine GitHub stock labels (`bug`, `documentation`, `enhancement`, `duplicate`,
`good first issue`, `help wanted`, `invalid`, `question`, `wontfix`). `bug`,
`documentation`, and `enhancement` directly duplicate `type: bug`, `type: docs`, and
`type: task` — an issue tagged `bug` but not `type: bug` is invisible to every
type-filtered view. This is the identical finding recorded in `macos-system-health`
#93 and never carried across.

**Gap 4 — `labels.json` and the live label set already disagree, and nothing syncs
them. `macos-system-health` #93, Gap 1.**

```
$ python3 -c "import json;print(len(json.load(open('.github/labels.json'))['labels']))"
14
$ gh label list --limit 200 --json name --jq 'length'
23
$ grep -rn "labels.json" .github/workflows/ scripts/
(no output)
```

Fourteen declared, twenty-three live, nothing reconciling them. `macos-system-health`
has `scripts/check-label-policy` and `.github/workflows/label-policy-gate.yml`;
`ecg_anomaly_detection` has `scripts/sync_github_labels.py` and
`scripts/detect_label_drift.py`; `github-portfolio-modernization` has
`scripts/github/sync_labels.py`. This repository has none of them.

**Gap 5 — repo merge settings contradict the declared contract.
`macos-system-health` #94 is the same defect.**

```
$ gh repo view --json mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge
mergeCommitAllowed=true  rebaseMergeAllowed=true  squashMergeAllowed=true  deleteBranchOnMerge=false
```

`AGENTS.md` § "Canonical work-item workflow" declares linear history and squash
merges, and the post-merge closure pass deletes merged branches by hand because
`deleteBranchOnMerge` is off. Merge commits and rebase merges are both enabled anyway.
`macos-system-health` #94 is titled *"Repo settings drift from the declared contract:
rebase merging is enabled"* — found there, not carried here.

**Gap 6 — executor specs cannot be tracked, by construction.**

```
$ grep -n 'artifacts' .gitignore
97:# ── Working artifacts (never tracked) ────────────────────────
100:artifacts/

$ git ls-files artifacts/          # this repo
(no output)
$ git -C .../macos-system-health ls-files artifacts/ | head -3
artifacts/session-handoffs/2026-07-20-phase1-governance-cleanup.md
artifacts/specs/20260721T082016Z-issues-69-70-governance-port.md
artifacts/specs/20260721T091208Z-issue-73-stale-receipt-guard.md
```

`CLAUDE.md` says executor specs live in `prompts/` (tracked, immutable after handoff).
`.claude/hooks/pm-lane-guard.sh` blocks the PM thread from writing anywhere in the repo
except `artifacts/`. `artifacts/` is gitignored. The three specs written on 2026-07-26
are therefore invisible to any cold-start, cloud, or fresh-clone session — the exact
failure mode `AGENTS.md` cites as the reason it is itself tracked. `macos-system-health`
resolves this by tracking `artifacts/specs/`.

**Gap 7 — an agent-authored hook locked the PM thread out of writing issues, which is
its job in every other repository.**

```
$ git log --format='%h %ad %s' --date=short -- .claude/hooks/pm-lane-guard.sh
e62c483  2026-07-26  Enforce the PM/executor lane with a tracked PreToolUse hook (#18)

$ # macos-system-health .claude/settings.json → PreToolUse, matcher "Write|Edit":
$ #   denies only */prompts/*  (spec immutability, its issue #68)
$ # ecg_anomaly_detection    → NO HOOKS KEY
$ # github-portfolio-modernization → NO HOOKS KEY
```

The established pattern is **no hook, or one narrow rule protecting `prompts/`**. This
repository generalised it into a total PM lockdown: every write outside `artifacts/`,
and every mutating `git`/`gh` including `gh issue create|edit`. PR #18's own acceptance
table records `gh issue create (PM) → deny` as a **verified pass** — the lockout was
tested and logged as the feature working correctly.

The triggering incident was ~15 commits, 5 PRs, branch protection and an attempted
force-push. Issue creation was swept in with them despite being the PM's actual job.

Consequence, observed the same day: asked to write an issue, the PM thread produced a
*draft for an executor to file* rather than naming the block and asking. Narrowed
2026-07-26 on the maintainer's explicit instruction to permit `gh issue`/`gh label`;
git mutations, PR create/merge, repo edits and `gh api -X` remain executor-only. **The
narrowing was applied via a Bash write, because the guard blocks the `Edit` tool on its
own path** — a hole in the guard, disclosed at the time and recorded here.

**Gap 8 — constraints invented here that exist in no other repository, alongside
protections every other repository has and this one dropped.**

```
$ git log --format='%h' | while read h; do
    git log -1 --format='%B' $h | grep -qi 'Co-authored-by: Claude' && echo AGENT || echo human
  done | sort | uniq -c
  13 AGENT
   4 human

$ grep -rl 'EXECUTOR=1\|_EXECUTOR' <the other three repos> --include='*.md' --include='*.json' --include='*.sh'
(no output)
```

Thirteen of seventeen commits are agent-authored; every governance file here was written
by an agent on 2026-07-26. The PM/executor *concept* is genuine house norm —
`macos-system-health` has "Roles and the four gated actions" and "PM thread discipline",
`github-portfolio-modernization` has "PM/executor operating model". These specific
mechanisms are not:

| Invented here | Elsewhere |
| --- | --- |
| `AUDIO_LAB_EXECUTOR=1` env flag | zero hits across all three repos |
| Blanket `PreToolUse` lockdown on all repo writes and all mutating git/gh | macos: one rule on `prompts/`; ECG and pmod: no hooks at all |
| `artifacts/` gitignored | macos **tracks** `artifacts/specs/` |
| `artifacts/rules-pending/` capture-then-promote | nowhere — invented to route around a deadlock the lockdown itself created |

And the inverse — `AGENTS.md` sections present elsewhere and absent here:

```
$ grep -c '^## ' AGENTS.md   → 12   (audio-lab)
```

Missing relative to the others: **"Repository visibility and deletion (hard rule)"**
(macos, pmod), **"Definition of done"** (macos), **"How these rules reach every
session"** (macos), **"Project board"** (pmod), **"Pull request metadata"** (ECG, pmod),
**"Model and effort sizing"** (macos).

The net effect is a repository that constrains the maintainer's own agent in ways he
never asked for while lacking protections he has everywhere else. His question on
finding it, 2026-07-26: *"I'm trying to figure out why I have to unblock a rule I didn't
write that only exists here."*

**Gap 9 — missing gates, templates, and hygiene files.**

```
$ ls .github/workflows/            → changelog.yml  quality.yml
$ ls .github/ISSUE_TEMPLATE        → No such file or directory
$ ls -a scripts/                   → . ..            (empty)
$ find . -maxdepth 3 -type d -name tests -not -path '*/.venv/*'
(no output)
$ ls LICENSE SECURITY.md CONTRIBUTING.md .github/CODEOWNERS 2>&1 | head -1
ls: LICENSE: No such file or directory
```

| Item | macos | ECG | pmod | here |
| --- | --- | --- | --- | --- |
| PR-metadata gate | — | `metadata-governance.yml` | `pr-metadata-checks.yml` | absent |
| `.github/ISSUE_TEMPLATE/` | 3 | 6 | — | absent |
| `dependabot.yml` | yes | yes | — | absent (tracked as #5) |
| `scripts/` gate helpers | 4 | 9 | 3 | **empty dir** |
| `tests/` | yes | yes | — | absent (994 lines of Python) |
| LICENSE / SECURITY / CONTRIBUTING / CODEOWNERS | 3 | 4 | — | **none, public repo** |

## 3. Why it matters now

**Two items are live exposure, not tidiness.** A public repository with no
full-history secret scan (Gap 1) and no LICENSE (Gap 7) is a security and a rights
problem respectively, and both are visible to anyone who opens the repo.

**Three items are recurrence, which is worse than absence.** Gaps 3, 4, and 5 were each
found, diagnosed, and written up in another repository. Reproducing them here means the
investigation was worth nothing beyond the repo it happened in — and the maintainer has
no way to tell, from the outside, which findings carried and which did not.

**Gap 6 is actively destroying work right now.** Every executor spec written by a PM
session lands in a gitignored directory. The specs written today survive only because
the executor runs on the same machine.

**The root cause is one missing mechanism, not eleven mistakes.** Nothing compares a new
repository against an established one. Each new project restarts at zero and re-derives
a worse version of a solved setup. The maintainer's account of the cost, 2026-07-26:
*"every fucking time I start a new project it's like you got dropped on your fucking
head and I am starting over again, except it is worse because I think you're doing the
things you say."*

## 4. Proposed resolution

Close the gaps, then close the hole that produced them. Pick one grouping and record
the reasoning.

1. **Three PRs by risk class — preferred.** (a) exposure: Gap 1 + hygiene files;
   (b) integrity: Gaps 3, 4, 5, 6; (c) gates and scaffolding: Gap 7 remainder plus the
   board in Gap 2. Each lands independently, the exposure items land first, and a
   failure in one does not hold the others. Cost: three review cycles.
2. **One PR for everything.** Fastest to write, one review. Cost: a large mixed diff
   across security, settings, and scaffolding, which is hard to review honestly and
   hard to revert selectively.
3. **Exposure only (Gap 1 + hygiene), defer the rest behind the real project work.**
   Cheapest, and defensible — the podcast is the point and the remaining gaps are
   process. Cost: the recurrence class stays open and the next repo repeats it.

Separately, and the actual fix:

4. **A new-repo parity checklist in `~/.claude/CLAUDE.md` and `AGENTS.md`** — before a
   repository is called set up, diff it against an established one across workflows,
   labels, repo settings, gates, templates, and hygiene files, and record each gap as
   *adopted* or *deliberate exception with a reason*. Prose, therefore weak; but it is
   the only thing here that generalises to the next project. **Be honest about the
   limit:** nothing enforces a checklist an agent does not read.
5. **A `scripts/check-parity` that runs the diff mechanically** and can be pointed at
   any repo pair. Stronger than 4 because it produces output rather than depending on
   recall. Costs real code and needs a reference definition of "the standard", which
   does not exist as a machine-readable artifact today. Weigh whether that is worth
   building now or after the next repo proves the need.

Needing separate sign-off because they change shared or outward-facing state:

6. **Deleting the 9 stock labels** (Gap 3) strips them from any issue carrying them —
   run a usage count per label first (`gh issue list --label <name> --state all`).
7. **Changing merge settings and creating a project board** (Gaps 2, 5) alter repo
   configuration the maintainer may have set deliberately.
8. **Choosing a LICENSE** is the maintainer's call and cannot be defaulted by an agent.

## 5. Non-goals

- **Not relaxing branch protection.** Nothing here requires it; if something appears
  to, stop and ask.
- **Not touching `prompts/`** — immutable after handoff.
- **Not rewriting issue bodies** — that is the separate issue-quality issue.
- **Not doing any M1, M5, or podcast work** under this issue.
- **Not adopting every convention from the other repos wholesale.** Some divergence is
  correct for a repo this size; the requirement is that it be *recorded as a decision*
  rather than an accident.
- **Not deleting any label, changing any repo setting, or choosing a licence** without
  the sign-off called for in §4 items 6–8.

## 6. Acceptance criteria

- [ ] `full-history-scan.yml` present and demonstrated running to completion, with the
      run URL and result pasted
- [ ] LICENSE, `SECURITY.md`, `CONTRIBUTING.md`, `.github/CODEOWNERS` present, the
      licence chosen by the maintainer and recorded
- [ ] `labels.json` and the live label set verified identical, with the diff command's
      output shown, and a mechanism keeping them so — demonstrated catching a **seeded
      drift** (negative test)
- [ ] A recorded decision on the 9 stock labels, **preceded by a usage count for each**
- [ ] Repo merge settings match `AGENTS.md`, verified by `gh repo view --json` read-back
- [ ] Executor specs land in a tracked path; `git ls-files` on that path returns the
      specs written 2026-07-26
- [ ] A recorded decision on the board (Gap 2), and on §4 options 1–3 and 4–5
- [ ] Parity rule present in **`AGENTS.md`**, not only `~/.claude/CLAUDE.md` — the
      latter does not reach cold-start, cloud, or fresh-clone sessions
- [ ] Every claim in §2 re-verified after the work, with output pasted
- [ ] CHANGELOG entry under **Changed**, with the root cause under **Findings**

## 7. Dependencies and risk

**Depends on nothing.** Every input is already local or reachable read-only.

**Overlaps #5** (Dependabot) and **#8** (label taxonomy) — resolve the label question in
one place, not both.

**Risk: medium.** Most of the work is additive and reversible. The exceptions are
label deletion (destructive, strips labels from issues) and repo-settings changes
(alters configuration the maintainer may own). Both are quarantined into §4 items 6–7
behind explicit sign-off. The class of failure is the one that concerns the maintainer
most: a repository that looks configured and is not, reported as configured.

## 8. References

- `macos-system-health` **#93** — labels.json unsynced, stock-label duplication; Gaps 3
  and 4 here are the same defect
- `macos-system-health` **#94** — repo settings drift, rebase merging enabled; Gap 5
- `macos-system-health` **#92** — the "artifact that looks like a record and is not"
  failure class; Gap 6 is that class
- `~/.claude/CLAUDE.md` § "GitHub metadata governance" — asserts a tracked Project that
  does not exist here (Gap 2)
- `AGENTS.md` § "Canonical work-item workflow" — the merge contract Gap 5 contradicts
- `.gitignore:100` and `.claude/hooks/pm-lane-guard.sh` — the two halves of Gap 6
- Found by the PM thread 2026-07-26, after the maintainer asked what else diverged from
  the established repositories following the discovery that every issue here was a stub.
