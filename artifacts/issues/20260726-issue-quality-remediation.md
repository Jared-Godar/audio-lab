# Issue draft — to be filed by an executor

**Title:** Every issue in this repository is a stub: 0 of 9 carry evidence, options, or acceptance criteria

**Labels:** `type: bug`, `area: governance`, `priority: high`
**Milestone:** none
**Assignee:** Jared-Godar

---

## 1. Summary

Issues in this repository are to-do lines, not briefing documents. Every one is a
title plus three bullets: no measured evidence, no resolution options for the
maintainer to choose between, no non-goals bounding scope, and no acceptance criteria
defining done. The established repositories — `macos-system-health` and
`ecg_anomaly_detection` — hold issues five to ten times longer, built on a consistent
eight-section structure where every claim is backed by a pasted command and its
output.

The house standard was never absent. It was never carried into this repository. Each
new project re-derives it from scratch, or does not, and the maintainer discovers the
gap by opening an issue and finding nothing in it.

The consequence is not cosmetic. `#6` is the foundation of milestone M1 and reads in
full as five lines. An executor handed it must invent the scope, the constraints, and
the definition of done — which is precisely the improvisation the contract in
`AGENTS.md` forbids.

## 2. Evidence

Measured 2026-07-26 by the PM thread while scoping the M1 executor spec.

**Gap 1 — every issue is a stub by length.**

```
$ gh issue list --state all --limit 30 --json body --jq '.[].body|length' \
    | sort -n | awk '{a[NR]=$1; s+=$1} END {print "count:",NR; print "min:",a[1];
      print "max:",a[NR]; print "mean:",int(s/NR); print "median:",a[int((NR+1)/2)]}'
count: 11
min: 302
max: 1210
mean: 663
median: 613
```

Against the comparison set, measured the same way:

```
$ gh issue list -R Jared-Godar/macos-system-health --state all --limit 12 \
    --json number,body --jq '.[] | "\(.number)\t\(.body|length)"'
99   4395      93   4848      89   3394      87   3192
96   6124      92   4435      88   2988      85   4509
95   3984      94   6078      91   4070      84   3322
```

audio-lab's **longest** issue (1,210 chars, #14) is shorter than
macos-system-health's **shortest** (2,988 chars, #88).

**Gap 2 — not one issue has the house structure.**

```
$ for n in 4 5 6 7 8 9 10 11 13; do
    c=$(gh issue view $n --json body --jq '.body' | grep -c '^## ')
    ac=$(gh issue view $n --json body --jq '.body' | grep -c '^- \[ \]')
    echo "#$n  h2-sections=$c  acceptance-checkboxes=$ac"
  done
#4   h2-sections=0  acceptance-checkboxes=0
#5   h2-sections=0  acceptance-checkboxes=0
#6   h2-sections=0  acceptance-checkboxes=0
#7   h2-sections=0  acceptance-checkboxes=0
#8   h2-sections=0  acceptance-checkboxes=0
#9   h2-sections=0  acceptance-checkboxes=0
#10  h2-sections=0  acceptance-checkboxes=0
#11  h2-sections=0  acceptance-checkboxes=0
#13  h2-sections=0  acceptance-checkboxes=0
```

Zero sections, zero acceptance criteria, across all nine open issues. There is no
partial adoption to build on — the structure is absent, not inconsistent.

**Gap 3 — nothing scaffolds or checks issue quality.**

```
$ ls -1 .github/ISSUE_TEMPLATE
ls: .github/ISSUE_TEMPLATE: No such file or directory
```

No template, no issue-opened workflow, no check. Issue quality here depends entirely
on an agent remembering a convention it demonstrably did not carry over.

**Gap 4 — the label vocabulary is narrower than the standard assumes.**

```
$ python3 -c "import json;d=json.load(open('.github/labels.json'));
  print('\n'.join(sorted(l['name'] for l in d['labels'])))"
area: episodes      priority: high     type: automation   type: docs
area: governance    priority: low      type: bug          type: task
area: infra         priority: medium   type: decision
area: pipeline      skip-changelog
area: voices
```

Fourteen labels. `macos-system-health` issues additionally carry `effort:`, `risk:`,
and `status:` dimensions (visible on #92 and #93 above). Those axes do not exist here,
so the metadata half of the standard cannot currently be met in full.

## 3. Why it matters now

Three reasons, in order of cost.

**It is blocking real work today.** The M1 executor spec drafted 2026-07-26 had to
carry roughly 200 lines of scope, constraints, and acceptance detail that belong in
#6 and #7 — because the issues carry none of it. That detail now lives in a
gitignored artifact instead of on the tracked issue, where the next session will not
find it.

**It recurs on every new project.** This is the third repository to start at stub
quality. The cost is not the rewrite; it is the maintainer discovering, each time,
that a standard he considers settled was silently dropped.

**It is the failure class `AGENTS.md` already names.** "The artifact is not the
behavior" — an issue that looks like a tracked work item and contains no actionable
content is a record in appearance only. Same class as #92 in `macos-system-health`,
where a committed walkthrough with every outcome blank looked like a record and was
an empty form.

## 4. Proposed resolution

Pick one and record the reasoning.

1. **Rewrite all nine open issues to the house standard — preferred.** One executor
   pass, no new mechanism, and it puts the scope back on the tracked artifact where
   it belongs. Cost: real research per issue, since evidence sections must be
   *measured*, not composed. Estimated one focused session.
2. **Rewrite only the five live-work issues** (#6, #7, #10, #11, #13) and leave the
   four hygiene issues (#4, #5, #8, #9) as stubs. Roughly half the cost and it
   unblocks M1 just as fast, but it leaves the repository in a mixed state where
   "which issues can I trust?" has no answer from the outside.
3. **Rewrite, plus add `.github/ISSUE_TEMPLATE/`.** More durable for issues opened
   through the web UI. **Be honest about what this buys:** a template is a scaffold,
   not a gate — `gh issue create --body-file`, which is how every agent-authored
   issue here is filed, walks straight past it.
4. **Rewrite, plus an `issues: [opened, edited]` workflow that comments when required
   sections are missing.** The only option that is an actual mechanism rather than a
   convention. Costs a workflow on every issue event, and it can only comment — GitHub
   cannot block issue creation. Weigh whether an advisory bot comment is worth the
   maintenance against simply doing option 1 well.

Separately, and needing its own decision because it changes a shared vocabulary:

5. **The label gap in Gap 4** — adopt `effort:`, `risk:`, and `status:` to match the
   other repositories, or record that audio-lab deliberately runs a narrower schema.
   This overlaps #8 (label taxonomy refinements); resolve them together or explicitly
   defer this half to #8.

## 5. Non-goals

- **Not re-deciding any issue's substance.** This rewrites the briefing, not the work.
  If a rewrite surfaces a genuine scope question, it goes in that issue's
  §4 Proposed resolution as an option for the maintainer — it is not resolved in place.
- **Not deciding #10 or #11.** Both are the maintainer's calls and stay open decisions.
- **Not closing #4, #5, #8, or #9.** They may be low value, but that is a decision, not
  a cleanup.
- **Not doing the work any issue describes.** No `core/` extraction, no infra
  templates, no label changes land under this issue.
- **Not editing issue titles where the current title is already specific and accurate.**

## 6. Acceptance criteria

- [ ] Every open issue has ≥ 6 `##` sections, verified by re-running the Gap 2 command
      with its output pasted in the PR or closing comment
- [ ] Every open issue has an Evidence section containing at least one command **and
      its actual output** — no assertion without a receipt
- [ ] Every open issue has `- [ ]` acceptance criteria whose final item is a CHANGELOG
      entry
- [ ] Every open issue has ≥ 1 resolution option framed as a maintainer choice, and
      explicit non-goals
- [ ] Median body length across open issues ≥ 2,500 characters, measured with the Gap 1
      command and its output pasted
- [ ] Every open issue carries `type:`, `area:`, and `priority:` labels verified to
      exist in `.github/labels.json`, plus a milestone where one applies
- [ ] A recorded decision on options 1–4, and on option 5 or its deferral to #8
- [ ] The standard is written into `AGENTS.md` — `~/.claude/CLAUDE.md` does not reach
      cold-start, cloud, or fresh-clone sessions, and those are exactly the sessions
      that dropped it
- [ ] CHANGELOG entry under **Changed**, with the cause recorded under **Findings**

## 7. Dependencies and risk

**Depends on nothing.** Every input is already in the repository or reachable read-only.

**#8** (label taxonomy refinements) owns the Gap 4 label question; do not resolve it in
both places.

**Risk: low mechanically, medium in class.** Rewriting issue bodies is reversible and
touches no code. The class is the one that concerns the maintainer: an artifact that
looks like a record and is not, produced by an agent that reported the work as done.
The mitigation is that every acceptance criterion above is a command with output, not
a claim.

## 8. References

- `macos-system-health` **#92** and **#93** — the exemplars this standard is derived
  from; 4,435 and 4,848 characters, eight numbered sections each
- `ecg_anomaly_detection` **#251** (5,025 chars), **#248** (3,324), **#259** (2,054) —
  the same structure applied to governance and modernization work
- `~/.claude/CLAUDE.md` § "Issues are written to the house standard" — the rule as
  recorded 2026-07-26; in force for future sessions, and **not** reaching this repo's
  cold-start sessions until it also lands in `AGENTS.md`
- `AGENTS.md` § "The artifact is not the behavior" — the failure class
- `artifacts/specs/20260726-m1-core-extraction-and-infra-dns.md` — the M1 spec that
  had to carry scope belonging on #6 and #7
- Found by the PM thread 2026-07-26 while scoping the M1 executor spec, after the
  maintainer opened #6 and found a five-line stub.
