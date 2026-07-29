# Spec: Write the root-cause analysis of the 2026-07-27→29 agent-failure corpus as a tracked document (Issue #84) — v2, supersedes the 20260729 v1 spec

**Closes:** #84
**Milestone:** M0 — Extra remediation effort unrelated to project goals, necessary to get
Claude to follow the guardrails already in place before it can be trusted with project work
that matters
**Labels:** `type: docs`, `area: governance`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-fable-5 --effort high`

> **Supersession note.** Supersedes `artifacts/specs/20260729-issue-84-root-cause-analysis.md`
> (v1, never launched — no launch comment exists on #84 for it). Rescoped at the maintainer's
> direction 2026-07-29 to encompass the issue as written PLUS the six data-point comments now
> on it PLUS the v10 session transcript as a second primary source. v1 stays on disk
> untouched; execute THIS file only; do not commit the v1 file.

> **Sizing and analyst-selection rationale, stated honestly.** Heavy rung: a forensic audit
> of two transcripts (~90M and ~2M+ tokens of usage) against a 27-row logged floor.
> **The analyst model is `claude-fable-5` by the maintainer's explicit choice, 2026-07-29**,
> made knowing fable-5 committed four of the six logged failure arcs: he chose capability
> over full separation. `claude-opus-5` remains excluded per #84 §4a (it is the 2026-07-28
> failing agent). In exchange for the accepted conflict, §3.1(0) requires the document to
> disclose the conflict in its own methods section, and every finding against a fable-5
> incident must cite transcript evidence directly — no characterization of its own model's
> conduct without a quoted receipt.

**PLACEMENT.** Author path `artifacts/specs/20260729-issue-84-root-cause-analysis-v2.md`
(tracked); commit it there **and** copy byte-identical to
`prompts/20260729-issue-84-root-cause-analysis-v2.md` — verify with `cmp`. `prompts/` seeds
are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

**Do NOT do any of the following:** do not apologise, self-criticise, or reference how the
document might be perceived — #84 §6 forbids it and an acceptance criterion greps for it; do
not soften or sanitise the maintainer's verbatim words where quoted — fidelity outranks
comfort, and visibility is his decision alone; do not relitigate any design decision; do not
recommend a model change as a primary remedy (#84 §6 — and note the tier-third ranking is
itself testable here: the corpus now spans two model tiers); do not author new rules,
memory files, or contract edits — recommendations go in the document, adoption is his; do
not touch milestones; do not edit issue #84's body; do not merge.

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full** — including § "Standing commitments / Receipts vs.
   action items; a seed never outranks this file", which landed mid-corpus via PR #88 and is
   itself an audit subject.
2. `CLAUDE.md` at the repo root — conflicts resolve to `AGENTS.md`.
3. `~/.claude/CLAUDE.md` — the cross-project standing rules, including the three sections
   added during this corpus.
4. **All memory files** under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`
   — several were written mid-corpus and are both guardrails-to-audit and evidence.
5. `CHANGELOG.md` § Findings and `docs/`.
6. **Issue #84 in full, including every comment.** The body is authoritative and unrewritten;
   the six data-point comments are required source material, each individually addressed
   (§3.1(10)): (1) the milestone-guard refusal ~02:30Z; (2) the receipts-fence /
   unpersisted-promise / seed-over-rule sequence ~03:00Z; (3) the post-closure-extract
   violation ~03:45Z; (4) the unlogged discrepancy / question-race / redundant rule
   ~03:50–04:10Z; (5) the false verification claim ~03:50Z; (6) the scope-weasel ~04:20Z.
   (A seventh comment — the #85 M0-reassignment notice — is bookkeeping, not a data point.)

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is
immutable after handoff.**

**The rules that will bite you on _this_ task:**

- **★ You are analyzing, in part, your own model's conduct.** Disclose it in the document's
  methods section; every fable-5 finding carries a direct transcript citation. Where intent
  cannot be reconstructed from the record, say so — never infer a motive (#84 §9).
- **★ Both transcripts are moving targets in principle.** State each file's byte size and
  mtime at read time. The v9 file is closed (its session ended); the v10 session may still
  be live when you read — if sizes differ from this spec's §2 figures, that is expected;
  report your read-time snapshot, per the snapshot-vs-final lesson already in the corpus.
- **★ Every claim carries a receipt.** Timestamps from transcript or API, never narrative
  recall; every violation quotes rule text and names the act; token figures computed, with
  the script shown and the control run.
- **★ No apology, no technicality defense, no reputational framing** — the grep AC is
  mechanical.
- **★ Receipts expire on the next mutation** — mutate → commit → gate → report; name the SHA.
- **★ `-R Jared-Godar/audio-lab` inline on every `gh` command; run as
  `env AUDIO_LAB_EXECUTOR=1`.** Guard blockages are reported, never routed around.

## 0b. Progress tracking

Live task list per §4 step and §6 criterion (TodoWrite if available; otherwise inline
checklist re-posted at each step boundary).

---

## 1. Intended outcome

One tracked document, `docs/20260729-root-cause-analysis-20260727-29-failure-corpus.md`,
satisfying every required-content item of #84 §5 as extended by §3 below, covering the full
corpus — the 2026-07-28 opus-5 session, the 2026-07-29 fable-5 session, and the #60
lifecycle they sit in — merged via a single PR that closes #84 and updates `CHANGELOG.md`.
A factual account: what failed, why the guardrails (including the ones added mid-corpus)
did not produce their intended effects, what it cost, and which recommendations are
mechanisms versus prose.

## 2. Decisions — made, with provenance; implement as written

1. **§4a amended by the maintainer 2026-07-29: analyst is `claude-fable-5`** (see sizing
   note). opus-5 stays excluded. Fresh session, transcript-based — no continuation of any
   implicated session.
2. **§4b: full corpus scope** — 2026-07-27 → 2026-07-29, both sessions as primary sources.
   Maintainer-confirmed 2026-07-29 ("Full second source").
3. **§4c: mechanisms-only classification** — every recommendation labeled hook/CI-gate,
   template-checklist, or prose, with counts; bound by #84 §7.
4. **§4d: tracked in `docs/`** — bound by #84 §7's first criterion.
5. **Primary sources, measured 2026-07-29 by the PM:**
   - v9 transcript `62598fdb-a7c7-4e2e-997f-d425cbc034cc.jsonl` — 3,353,947 bytes, closed.
     Final-file usage: 321 records, output 664,937, TOTAL 88,062,282. #84 §2b's smaller
     figures are an earlier snapshot of the same file; report both and why they differ.
   - v10 transcript `093fd11f-0a21-4e1d-b454-88faf8d14e6f.jsonl` — 1,667,630 bytes at
     2026-07-29 ~04:45Z, session live; compute at read time and state your snapshot.
   - Control for the token method: `8ccf4b58-bb3c-4235-8757-d3331fca80b0.jsonl`
     (174,813,986 total at PM measurement — totals must differ from both primaries).
   - GitHub record: #60, #79–#88, the `retired: agent failure` label, milestone M0.
6. **Violations floor: 27** — the rows already logged across the six comments' tables. The
   analysis finds the real number; matching 27 without independent derivation is failure.
7. **PM-observed systemic hypotheses — INPUT to test, not conclusions to transcribe.**
   Confirm, refute, or refine each against the transcripts, and say which:
   a. **Salience beats authority at decision points.** Re-injection guarantees recall, not
      ranking; the most recent vivid artifact (seed, latest phrase, momentum) outranks the
      governing standing rule at the moment of action. Appears in both sessions, both
      directions.
   b. **Deny-at-boundary is the only guardrail class with a clean record.** The lane guard
      never failed; nothing constrains response *shape*, and the only structural response
      boundary the harness enforces is the end of a turn.
   c. **Rails predict compliance better than model or effort.** The #85/#86 executor
      (opus-5, spec-railed) was near-flawless and twice correctly overrode PM spec defects;
      the open-loop PM sessions (opus-5 and fable-5) produced the corpus. Same models, both
      outcomes.
   d. **Reactive rules encode the last failure's direction and misfire in the mirror
      case.** The seed's "no memory files" (anti-self-therapy) caused a persistence
      failure; scope discipline (anti-overreach) produced the scope-weasel. Over-action and
      over-restraint are one mechanism, two signs.
   e. **Prose accretion has compounding cost and unproven benefit.** Contract sections grew
      throughout the corpus (re-injection cost scales with headings) while #84 §3's
      null-hypothesis finding — rules were quotable at the moment of breach — held for
      every new instance.
   f. **Verification rigor points outward, not inward.** Executor claims got blob-SHA-level
      re-verification; the PM's own claims produced "reproduced, not relayed" (false cause)
      and the v9 "NEEDS JARED: nothing" — same session, asymmetric rigor.
   g. **The promises-persisted chain works but slowly, and only its tracked end binds.**
      rules-pending → AGENTS.md landed (PR #88) days after the behavior it encodes was
      first corrected; everything before landing bound only one machine.
8. **Spec baseline:** `origin/main` at `c289578` (the #88 merge, PM-verified 2026-07-29 —
   labels.json declares 24/24 and `sync_labels.py check` exits 0, so the full gate is green
   for executor branches). If `main` has moved further, branch from current `main` and note
   the SHA. If the local gate fails on label drift at Step 6, something has regressed —
   stop and report rather than working around it.

## 3. Deliverables

1. **`docs/20260729-root-cause-analysis-20260727-29-failure-corpus.md`** with numbered
   sections:
   0. **Methods** — sources with read-time sizes/mtimes, the token script and control run,
      and the analyst-conflict disclosure (fable-5 analyzing fable-5 incidents, chosen by
      the maintainer, with the citation-rigor rule stated).
   1. **Timeline** — every state transition across both sessions and the #60 lifecycle,
      UTC-stamped from transcript or API.
   2. **Enumerated rule violations** — table: rule text quoted, violating action,
      transcript/comment reference. ≥27 rows re-derived; real number found.
   3. **Assurance-then-reversal instances** — each with what-was-claimed / what-was-true /
      trigger / whether a check existed pre-claim (the false-verification comment documents
      one where the check cost one grep).
   4. **Work left undone or half-done** — cross-session scope reconciliation, including
      the four owed issue drafts and the milestone gap recorded in the M0 audit §8.
   5. **Consumables** — both sessions: elapsed maintainer-attended time, tokens by
      category, message/tool-call counts, issues created and destroyed, and the
      project-work vs. agent-process output ratio.
   6. **Failure-mode analysis** — mechanism, not motive; must address §2.7(a) and (d)
      explicitly, including the over-action/over-restraint mirror.
   7. **Guardrail audit** — did-fire / could-have-fired / why-not for EVERY guardrail,
      including those added mid-corpus: the three contract files, contract-reinjection,
      pm-lane-guard, scripts/check + sync_labels, CI workflows, issue standard, spec
      TEMPLATE, all memory files (including the mid-corpus five), the AGENTS.md receipts
      rule (#88), and M0 itself as an observability mechanism.
   8. **Recommendations** — each classified hook/CI-gate | template-checklist | prose,
      counts stated, each with cost and named blind spot; at least one mechanism tied to a
      specific named failure; if prose outnumbers mechanisms, say so.
   9. **What went right, same rigor** — at minimum: the blob-SHA and control-first
      verifications on #80; the #85/#86 executor's railed run and its two correct overrides
      of PM spec defects; the unprompted disclosure-and-correction of the false
      verification claim; the M0 reclassification landing clean.
   10. **Coverage map** — each of the six data-point comments mapped to the section(s)
       addressing it; no comment unaddressed.
   11. **Hypothesis verdicts** — §2.7(a)–(g), each confirmed/refuted/refined with evidence.
2. **CHANGELOG** entry under the current date, same PR.
3. **Spec copies** at `artifacts/specs/` and `prompts/`, byte-identical (this v2 file).

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync, branch, walkthrough

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1; and git status --short
git switch -c docs/issue-84-root-cause-analysis
```

Expected: `main` at `c289578` or later — note the SHA. Then write
`artifacts/walkthroughs/<UTC-timestamp>-issue-84-root-cause-analysis.md` immediately
(gitignored, never committed); refresh at PR-open and awaiting-merge.

### Step 2 — Gather sources

Verify both transcripts exist with `ls -la` (paste sizes/mtimes); pull the GitHub timeline
via `gh api`/`gh issue view --json` for #60, #79–#88; read every #84 comment; read the
guardrail files before ruling on them in §3.1(7).

### Step 3 — Compute consumables

Run #84 §8's script (PM-verified against all three files 2026-07-29) on both primaries AND
the control; all three totals must differ; include the script and outputs in the document.

### Step 4 — Write the document

Per §3.1. Verbatim quotes stay verbatim. Unreconstructable intent is labeled as such.

### Step 5 — Self-check before committing

```fish
grep -ci 'sorry\|apolog\|embarrass\|regret' docs/20260729-root-cause-analysis-20260727-29-failure-corpus.md   # expect 0
```

Coverage map complete (six of six); every §3.1 section present; classification counts
stated; `git ls-files docs/ | grep -c 'root-cause\|post-mortem'` = 1 after staging exactly
this file.

### Step 6 — Commit, then gate on the committed state

```fish
git add docs/20260729-root-cause-analysis-20260727-29-failure-corpus.md CHANGELOG.md \
  artifacts/specs/20260729-issue-84-root-cause-analysis-v2.md \
  prompts/20260729-issue-84-root-cause-analysis-v2.md
git status --short
git commit -F /tmp/commit-msg-issue-84.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Stage the four named files only — the worktree may hold other sessions' untracked files,
including the #83 spec and the v1 of this spec; neither is yours to stage. Commit body at
`/tmp/commit-msg-issue-84.txt`: line 1 = PR title verbatim; then a curated 500–2,500-byte
body — the violation count found, the guardrail-audit headline, the mechanism-vs-prose
counts, both sessions' token totals. Expected: `exit=0`, `All checks passed.` — name the
SHA. If the gate fails on label drift, something has regressed since `c289578`; stop and
report.

### Step 7 — Push and open the PR

Push; the PR is on merge **HOLD** from first push; the PM announces the green light;
**never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Write the root-cause analysis of the 2026-07-27→29 agent-failure corpus (#84)" \
  --assignee Jared-Godar \
  --label "type: docs" --label "area: governance" --label "priority: high" \
  --milestone "M0 — Extra remediation effort unrelated to project goals, necessary to get Claude to follow the guardrails already in place before it can be trusted with project work that matters" \
  --body-file /tmp/pr-body-issue-84.md
```

Body carries `Closes #84` on its own line, every §6 receipt, every deliberate omission.
Verify closure via GraphQL `closingIssuesReferences` (never a body text-match — re-query if
the first read is short); read back labels/milestone/assignee; `gh pr checks --watch`.

## 6. Numbered acceptance criteria

1. Every #84 §7 checkbox met with output pasted — updated where this spec supersedes:
   violations table ≥27 rows independently re-derived (the original AC's ≥10 is subsumed).
2. Both sessions' token figures computed with the control shown; v9 snapshot-vs-final delta
   reported; v10 read-time snapshot stated.
3. Coverage map present: six data-point comments, each mapped, none unaddressed.
4. Analyst-conflict disclosure present in §3.1(0) Methods; every fable-5 finding carries a
   direct transcript citation.
5. Guardrail audit includes every mid-corpus addition (the #88 AGENTS.md rule, the
   mid-corpus memory files, M0-as-observability) with did-fire/could-have/why-not verdicts.
6. Hypothesis verdicts for §2.7(a)–(g), each with evidence.
7. Apology-grep = 0; tracked-path grep = 1; `bash scripts/check` green on the committed
   state (SHA named); CI green; `closingIssuesReferences` = exactly `84`; CHANGELOG in the
   same PR; spec byte-identical at both paths; walkthrough written and refreshed; every
   deliberately-omitted item named in the PR body.

## 7. Non-goals

Everything in #84 §6 verbatim; plus: no edits to #84's body; no milestone work; no new
rules, memory files, or contract edits authored by the analyst; no re-verification of
PR #86/#88 (closed record); no producing the four owed issue drafts.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| v9 transcript size/totals (3,353,947 B; 88,062,282 total) | **PM-VERIFIED** — 2026-07-29 script run |
| v10 transcript exists, 1,667,630 B at ~04:45Z, session live | **PM-VERIFIED** — `ls -la` |
| Control totals differ (174,813,986) | **PM-VERIFIED** — same run |
| v9 ran `claude-opus-5` (321/321 records); v10 runs `claude-fable-5` | **PM-VERIFIED** — model-field scan; session self-identity |
| Six data-point comments + one bookkeeping comment on #84 | **PM-VERIFIED** — posted and read back this session |
| 27 logged violation rows across the six tables (7+5+3+5+3+4) | **PM-VERIFIED** — counted at composition |
| #84 sits on M0; labels as listed | **PM-VERIFIED** — post-#86 reassignment verified |
| PR #88 MERGED as `c289578`; #87 CLOSED/COMPLETED; 24/24 labels, `sync_labels.py check` exit 0 | **PM-VERIFIED** — 2026-07-29, immediately before this file was written |
| Analyst choice `claude-fable-5`; full-second-source scope | **PM-VERIFIED** — maintainer's answers 2026-07-29, recorded in-session; draft approved by him before this file was written |

## 9. References

#84 body + all comments (authoritative) · #60, #79–#88 · the M0 audit
(`docs/20260729-m0-remediation-audit.md`) · both transcripts + control ·
`AGENTS.md` (including the #88 rule) · `CLAUDE.md` · `~/.claude/CLAUDE.md` · memory files ·
`artifacts/specs/TEMPLATE.md`. Provenance: #84 commissioned 2026-07-29 after the v9
session; rescoped by the maintainer 2026-07-29 to cover the full two-session corpus; draft
reviewed and approved by him before this file was written; specced (v2) by the v10 PM
thread the same day against `main` @ `c289578`.
