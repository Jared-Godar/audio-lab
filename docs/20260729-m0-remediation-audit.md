# M0 remediation audit — all 51 issues classified, 2026-07-29

Produced under [#85](https://github.com/Jared-Godar/audio-lab/issues/85). This file is the
durable record of the reclassification: the criterion, the ruling, the table, and the
before/after numbers. It is tracked deliberately — the audit is the artifact #85 asked for,
and a gitignored copy would reach no fresh clone.

## 1. The criterion, verbatim

From #85 §2b:

> An issue is remediation if it exists because an agent failed to follow an existing
> guardrail, asserted something false, left work half-done, or because a guardrail itself
> was defective — as opposed to advancing the show, its infrastructure, or its tooling.

Applied to **every issue in the repository, open and closed** (#85 §4a, Option 1). Closed
issues are where most of the evidence lives; excluding them would understate the corpus by
design.

## 2. Scope, measured

```text
$ gh issue list -R Jared-Godar/audio-lab --state all --limit 200 --json number --jq length
51
```

The table below has **51 rows**, one per issue, none skipped.

**Inventory drift since #85 was drafted: 49 → 51.** #85 §2a measured 49; #84 and #85 were
created after that measurement. Note that #85 §2b's preliminary list of 22 already contained
issue #84, so the preliminary remediation set was **23** (22 + #85), not 24 — the drafting
arithmetic double-counted #84. The audit below supersedes both numbers.

## 3. The maintainer's ruling on the borderline set

Per #85 §4d Option 1, the executor proposed and the maintainer confirmed **before any issue
moved**. Eight issues were presented as genuinely borderline: the three #85 §2b named
(#5, #8, #62) and five the audit added, each the same class as an issue already in the
confirmed set (#44, #46, #58, #59, #79).

The executor's recommendations were split — remediation for #5, #44, #46 and #79; project
for #8, #58, #59 and #62. The maintainer's ruling, 2026-07-29:

> **All eight → REMEDIATION** — "Every borderline issue moves to M0."

That overrode the executor's project lean on four of the eight. Recorded on
[#85 as a comment](https://github.com/Jared-Godar/audio-lab/issues/85#issuecomment-5112387531)
before any reassignment ran.

## 4. The audit table

`Basis` distinguishes what #85 already classified from what the maintainer ruled on:
**§2b** = in #85's preliminary list and confirmed by this audit; **ruling** = borderline,
decided by the maintainer 2026-07-29; **audit** = classified project work by this audit.

| # | State | Previous milestone | Class | Basis | Reason |
| --- | --- | --- | --- | --- | --- |
| 4 | OPEN | none | project | audit | Forward-looking release-engineering decision — how a published episode stays reproducible from source. |
| 5 | CLOSED | none | **M0** | ruling | Its own §3: "every other portfolio repo runs Dependabot for actions; this one dropped it" — the #21 repo-creation parity failure. |
| 6 | CLOSED | M1 | project | audit | Pipeline refactor: extract `core/`, archive audition-v1 by folder move. Tooling advance. |
| 7 | CLOSED | M1 | project | audit | Capability expansion — reach the shared voice library rather than premade voices only. |
| 8 | OPEN | none | **M0** | ruling | The live label set drifted from `.github/labels.json` (23 vs 14) with nine stock labels duplicating `type:`; the taxonomy was never settled deliberately. |
| 9 | CLOSED | none | **M0** | §2b | An empty agent `probe` commit is buried in `main`'s history and has to be dealt with. |
| 10 | CLOSED | M2 | project | audit | Model bake-off `eleven_v3` vs `multilingual_v2` — a show-defining decision. |
| 11 | CLOSED | M3 | project | audit | Architecture decision for the casting and tuning surface. |
| 12 | CLOSED | M5 | project | audit | Cost check before enabling Identity Center. Infrastructure due diligence. |
| 13 | CLOSED | M5 | project | audit | Author `infra/` CloudFormation for DNS. Infrastructure build. |
| 14 | CLOSED | none | **M0** | §2b | The local guardrail was configured but never installed as a git hook, leaving every local gate inert. |
| 20 | CLOSED | none | **M0** | §2b | Every issue in the repository was a stub: agents ignored a house standard that already existed. |
| 21 | CLOSED | none | **M0** | §2b | No parity diff was run at repo creation; twelve already-solved problems were re-derived or dropped. |
| 22 | CLOSED | M5 | project | audit | Publishing SPF, null MX, DMARC and CAA on a live domain. Infrastructure the show needs. |
| 28 | CLOSED | none | **M0** | §2b | Dependabot landed as a label list only — assignees, groups and the autofill workflow were dropped mid-task. |
| 30 | CLOSED | none | **M0** | §2b | Gates were added and the required-checks list was never updated, so three checks and the test suite could not block a merge. |
| 31 | CLOSED | none | **M0** | §2b | An agent unilaterally chose branch protection stricter than any repository it was modelled on. |
| 33 | CLOSED | none | **M0** | §2b | Sessions ran on recall for hours after the contracts changed mid-session — a guardrail with no re-injection. |
| 34 | CLOSED | none | **M0** | §2b | The PM/executor workflow templates were never ported, so every spec here was hand-rolled. |
| 35 | CLOSED | none | **M0** | §2b | The lane guard blocked read-only verification while letting a long-form DELETE through. Defective guardrail. |
| 38 | CLOSED | M2 | project | audit | Screen-test the co-host shortlist on real Ep01 dialogue and pin the cast. Casting work. |
| 40 | CLOSED | M2 | project | audit | Pin the Ep01 co-host in a tracked cast record so M3 and M4 read one source of truth. |
| 43 | CLOSED | M4 | project | audit | Produce Ep01 v2.0 as a two-voice render with per-turn stems. Episode production. |
| 44 | CLOSED | M4 | **M0** | ruling | Its own §1: "the third time in this repository that a needed document turned out to exist only on a gitignored path." |
| 46 | CLOSED | M4 | **M0** | ruling | The approved Ep01 v2 master recipe lived only in gitignored scratch, so the signed-off master could not be regenerated from the repo. |
| 48 | CLOSED | none | **M0** | §2b | The lane guard had two documented holes and was untracked. Defective guardrail. |
| 50 | OPEN | M3 | project | audit | Build the audition platform — Lambda, API Gateway, capped key. Product build. |
| 51 | OPEN | M3 | project | audit | Build the three-round audition flow producing a cast record. Product build. |
| 52 | OPEN | M6 | project | audit | Open registration and public voting at `vote.toldstraight.com`. Product goal. |
| 54 | CLOSED | M5 | project | audit | Mailbox-product decision brief for `jared@toldstraight.com`. Infrastructure decision. |
| 55 | OPEN | M4 | project | audit | Swap placeholder host stems for the maintainer's own recordings. Episode production. |
| 56 | OPEN | none | **M0** | §2b | The guard forbids the PM lane's own defined work whenever a comment body contains a `>` character. |
| 58 | CLOSED | none | **M0** | ruling | The README's one-line description named a different project than the one the repository had become — the falsehood class, on a public front door. |
| 59 | OPEN | M5 | **M0** | ruling | Carries two #54 findings recorded nowhere in the repository, alongside DMARC enforcing with no reporting feed. |
| 60 | CLOSED | M5 | **M0** | §2b | Withdrawn by the maintainer as an agent failure — the issue itself was unusable. |
| 62 | CLOSED | none | **M0** | ruling | The documentation surface the reference repositories carry was never built here, so decisions survived only in issue comments. |
| 63 | OPEN | none | **M0** | §2b | The README staleness rule is a checklist line with no mechanism behind it. |
| 64 | CLOSED | M4 | **M0** | §2b | A commit named "episodes 1 and 2" committed one, so the repository held half the published season. |
| 65 | OPEN | M4 | project | audit | A second distribution surface — video cut and chaptered YouTube description — that the maintainer decided is in scope for v2. |
| 67 | OPEN | M5 | project | audit | Two long-lived IAM keys, both predating this repository; retiring them is real security hygiene. |
| 68 | CLOSED | none | **M0** | §2b | Fourteen load-bearing files reached no fresh clone from gitignored `artifacts/`, and a tracked file documented two of them as nonexistent. |
| 69 | CLOSED | M4 | **M0** | §2b | A tracked document told the maintainer to name takes in a scheme the assembler cannot map — a falsehood in the guide gating his own recording session. |
| 73 | OPEN | none | project | audit | Surface `audio-lab` in the profile README's Featured Work. Portfolio and presentation work. |
| 74 | OPEN | none | **M0** | §2b | `ROADMAP.md` tells readers to run a command that errors — the fourth instance of the falsehood class. |
| 75 | OPEN | none | **M0** | §2b | A duty is declared PM work while every mechanism for discharging it is denied. Contract/mechanism contradiction. |
| 79 | CLOSED | M5 | **M0** | ruling | A full day of approved brand work sat only on gitignored paths — #68's defect reproduced after #68 was filed. |
| 81 | CLOSED | M5 | **M0** | §2b | Withdrawn — a replacement issue logged below the house standard. |
| 82 | CLOSED | M4 | **M0** | §2b | Withdrawn — a replacement issue logged below the house standard. |
| 83 | OPEN | M5 | project | audit | Research image generation and produce a decision brief for the host portraits. Show collateral. |
| 84 | OPEN | none | **M0** | §2b | Root-cause analysis of a session that produced one usable artifact from five hours and three withdrawn issues. Remediation by definition. |
| 85 | OPEN | none | **M0** | §2b | This issue. Per its own §8, an audit that exempted itself would be its own kind of dishonest. |

**Row count: 51.** Matches the live inventory above.

## 5. Milestone counts, before and after

Both measured with
`gh api repos/Jared-Godar/audio-lab/milestones --jq '.[] | "\(.title[0:6]) open=\(.open_issues) closed=\(.closed_issues)"'`.
These counts include pull requests as well as issues, which is why a milestone's totals
exceed its issue count.

| Milestone | Before (open/closed) | After (open/closed) |
| --- | --- | --- |
| M0 — Extra remediation effort… | 0 / 0 (created empty, 2026-07-29) | **8 / 23** |
| M1 — Tooling foundation | 0 / 5 | 0 / 5 |
| M2 — Casting (Round I) | 0 / 5 | 0 / 5 |
| M3 — Tuning app | 2 / 1 | 2 / 1 |
| M4 — Episodes v2 | 2 / 11 | 2 / 6 |
| M5 — Web presence | 3 / 12 | 2 / 9 |
| M6 — Community applet | 1 / 0 | 1 / 0 |

Nine issues carried a milestone before the move: five from M4 (#44, #46, #64, #69, #82)
and four from M5 (#59, #60, #79, #81). The other twenty-two were previously unmilestoned.
Every reassigned issue carries a comment naming its previous milestone, or "previously
unmilestoned".

## 6. Resulting split

| | Count | Share |
| --- | --- | --- |
| Remediation (M0) | **31** | 61% |
| Project work | 20 | 39% |
| Total | 51 | |

Issue #85 §2b estimated "roughly 45%" from a 22-of-49 first pass. The audited figure, after the
maintainer ruled every borderline case as remediation, is **61%**.

## 7. What this audit deliberately did not do

Per #85 §6 and the executor spec §7:

- **No closed issue was reopened, relitigated, or edited.** Reclassifying is not reversing.
- **No issue body was rewritten.** History stays.
- **No judgement on whether each remediation issue was correctly filed** — that is #84's job.
- **No edits to the M1–M6 milestone objects** themselves; #75 owns the mechanism question.
- **No label changes**; #8 owns the taxonomy.

## 8. One consequence, recorded rather than absorbed

Issues #60, #81 and #82 move to M0 — correct by the criterion, since the maintainer withdrew all
three as agent failures. The effect is that visual-identity deliverables he explicitly asked
for (host imagery, email signature, business card, stationery) now sit on no project
milestone; **#83 covers research and a decision brief only.** That gap predates this
reclassification and closing it is out of scope for #85. It is written down here so it is
visible rather than silently absorbed — deferring a stated requirement is the maintainer's
call, not an agent's.

## 9. Provenance

Directed by the maintainer 2026-07-29 (#85). Audited and executed the same day by a CLI
executor from `artifacts/specs/20260729-issue-85-m0-milestone-reclassification.md`, against
`main` at `69fd875`. The M0 milestone was created by that executor under the standing
authorization recorded in #75 — milestone edits route through an executor until #75 closes.
