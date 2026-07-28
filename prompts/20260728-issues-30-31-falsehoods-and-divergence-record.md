# Spec: Kill the two remaining tracked falsehoods; record #31's divergence and reversal condition (Issues #30, #31)

**Closes:** #30 · **Closes:** #31 ⟨keyword repeated per number — combined form links only the first⟩
**Milestone:** none — deliberately unmilestoned (repo-integrity work)
**Labels:** `type: docs`, `area: governance`, `priority: medium`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort high` — Standard: docs-and-comments PR with a
live negative test against branch protection; nothing irreversible.

> **PLACEMENT.** Copy byte-identical to `prompts/` in the first commit; `cmp` both. Immutable
> after handoff — ambiguity means stop and report.

> **DECISION RATIFICATION AT LAUNCH.** #30 Gap 3 (label-drift-gate trigger) had two open
> options. The PM recommends and this spec implements **option 2 — keep the post-merge
> trigger and document it as detection-not-prevention** (a pre-merge PR check adds a
> networked gate to every PR to close a minutes-wide, main-only drift window; cost exceeds
> risk here). **The maintainer launching this spec IS the recorded ratification of that
> choice.** If option 1 (pre-merge check) is wanted instead, do not launch; the PM re-specs.

---

## 0. Read the durable contracts first (non-negotiable)

1. **`AGENTS.md` in full** — note it was updated by #71 hours ago; read the file, not memory.
2. `CLAUDE.md` (root) — likewise updated by #71 (`d98df35c07ea` lineage); **line numbers cited
   in older comments have shifted — locate by `grep`, never by line number.**
3. `~/.claude/CLAUDE.md`. 4. Memory files. 5. `CHANGELOG.md` § Findings.
6. **Issues #30 and #31 in full including ALL comments** — both have 2026-07-27 comments that
   **supersede their bodies** (rescope on #30; decision + doubled-divergence finding on #31).
   The comments win every conflict.

**Rules that bite on THIS task:**
- **★ `env AUDIO_LAB_EXECUTOR=1`** or the lane guard denies everything.
- **★ Receipts expire on mutation** — mutate → commit → gate → report, SHA named.
- **★ `-R Jared-Godar/audio-lab` inline on every `gh` call.**
- **★ No contract-lawyering** — unmeetable AC = finding, not silent drop.
- **`AGENTS.md` and `CLAUDE.md` are the binding contracts you are editing.** Change ONLY the
  passages named in §3. Diff-discipline: `git diff` must show nothing outside the named edits.
- The negative test (D6) deliberately opens the PR in a failing state — **that is the test,
  not an error.** Do not "fix" it by skipping the demonstration.

## 0b. Progress tracking
TodoWrite; one item per deliverable + AC.

## 1. Intended outcome

No tracked file asserts the opposite of live configuration: `quality.yml` stops claiming
`Tests (pipeline)` is non-required; `CLAUDE.md` stops documenting a CLI entry point that
errors. The Definition of done gains the line that would have prevented both. #31's
keep-as-is decision, its reasoning, and its reversal condition live in `ROADMAP.md` and
`AGENTS.md` where cold-start sessions inherit them.

## 2. Decisions — made 2026-07-27/28, implement as written

1. **#31 §4 option 1**: branch protection stays exactly as-is; recorded as deliberate
   exception with the public-repo reasoning and the reversal condition (reverse to relaxing
   `strict` only if ≥2 PRs in a week need otherwise-unneeded rebases).
2. **#30 Gap 3 = option 2** (post-merge trigger kept, documented) — ratified by launch, above.
3. **#31 §6 (ecg unprotected `main`)**: record a deferral — noted in `ROADMAP.md`'s decision
   entry as "raise when ecg work next resumes," not filed cross-repo now (its house issue
   standard makes a drive-by filing the wrong artifact).
4. The **negative test** uses this PR itself: open it WITHOUT its CHANGELOG entry, prove
   `mergeStateStatus: BLOCKED` with the required `Changelog updated` check failing, then push
   the entry and show it flip to green. One PR, no throwaways, gate proven both directions.

## 3. Deliverables

1. **`.github/workflows/quality.yml`** — the comment block currently reading "`Tests
   (pipeline)` is NOT in main's required-status-checks list … do not present this job as a
   gate" (locate by grep `do not present this job as a gate`): replaced with a comment stating
   it IS required (verify live first: `gh api repos/Jared-Godar/audio-lab/branches/main/protection
   --jq '.required_status_checks.contexts'`), dated, citing #30.
2. **`CLAUDE.md`** — every `uv run audition` occurrence (grep; ~2 in § Repo shape / §
   ElevenLabs specifics) → `uv run voicelab`, **verified by running `uv run voicelab --help`
   from `pipeline/` and pasting the first lines** (`cd pipeline && uv run voicelab --help`).
3. **`AGENTS.md` § Definition of done** — new checklist line: **"A PR that adds or renames a
   CI job states in its body whether the check is required or advisory — a check that cannot
   block a merge must never be presented as a gate."** (The shared #30/#31 mechanism.)
4. **`AGENTS.md` § Recorded divergences** — entry for branch protection: 8 required checks vs
   2 (macos-system-health) vs none (ecg, HTTP 404) — strictest-on-the-only-public-repo
   reasoning — reversal condition verbatim — provenance (#31, decided 2026-07-27).
5. **`ROADMAP.md` § "Decisions and what they constrain"** — the #31 decision entry: comparison
   table, reasoning, reversal condition, the #30-widened-#31 finding (4→8 while undecided),
   and the ecg deferral note (decision 3 above).
6. **`label-drift-gate.yml`** — comment block above `on:` documenting Gap 3's decision:
   post-merge by design, detects-not-prevents, the reasoning, dated, citing #30.
7. **Negative test** per decision 4 — both outputs (BLOCKED with failing required check;
   green after) pasted in the PR body.
8. **CHANGELOG** — **Fixed** (both falsehoods), **Changed** (DoD line, divergence entries),
   **Findings** (the falsehood class: third instance documented in #68's PR; these close the
   remaining two).

## 4. Execution rails

Step 1: sync main (expect `a54befb` or later), branch `docs/issues-30-31-falsehoods`,
continuity walkthrough immediately.
Step 2: D1–D6 edits; `git diff --stat` must list exactly: `quality.yml`, `CLAUDE.md`,
`AGENTS.md`, `ROADMAP.md`, `label-drift-gate.yml`, this spec + `prompts/` copy — and, at the
second commit only, `CHANGELOG.md`.
Step 3: commit WITHOUT the CHANGELOG entry; `bash scripts/check` locally (expect the changelog
gate is CI-side; local check may pass — state which), push, open PR with full metadata
(`--label "type: docs" --label "area: governance" --label "priority: medium"`, no milestone,
assignee, both `Closes` lines) — then capture the failing state:
`gh pr checks <N>` showing `Changelog updated` failing + `gh pr view <N> --json mergeStateStatus`
showing `BLOCKED`. Paste both.
Step 4: add the CHANGELOG entry, commit, push; re-capture: checks green, `mergeStateStatus`
`CLEAN`. Paste. Verify `closingIssuesReferences` = **30 and 31** (GraphQL), metadata read-back.
**Merge HOLD from first push; never merge.**

## 5. Numbered acceptance criteria

- **AC1.** `grep -rn 'do not present this job as a gate' .github/` → no output; the replacement
  states required-status, dated.
- **AC2.** `grep -rn 'uv run audition' CLAUDE.md` → no output; `uv run voicelab --help` output
  pasted from `pipeline/`.
- **AC3.** The DoD line present in `AGENTS.md` § Definition of done (grep pasted).
- **AC4.** Divergence entry in `AGENTS.md`, decision entry in `ROADMAP.md`, both carrying the
  reversal condition verbatim.
- **AC5.** `label-drift-gate.yml` documents post-merge-by-design with the Gap 3 reasoning.
- **AC6.** Negative test: BLOCKED-state paste AND green-state paste, from this PR's own
  lifecycle.
- **AC7.** `closingIssuesReferences` = 30, 31 — pasted.
- **AC8.** `bash scripts/check` green on final SHA; CI 8/8; receipts pasted.
- **AC9.** Spec byte-identical both paths (`cmp` pasted).
- **AC10.** Continuity walkthrough written + refreshed at PR-open.
- **AC11.** Every omission/deferral named in the PR body (including the ecg deferral).

## 6. Non-goals

Not changing branch-protection settings (the decision IS no-change) · not switching the
label-drift gate to pre-merge (ratified option 2) · not filing the ecg issue now (recorded
deferral) · not #8/#4 scope · no `.github/labels.json` changes.

## 7. Verification status of this spec's claims

| Claim | Status |
|---|---|
| `Tests (pipeline)` in required list (8 total) | **PM-VERIFIED** 2026-07-27 session start; executor re-verifies live (D1) |
| `quality.yml` falsehood text present | **PM-VERIFIED** — #30 comment quotes it; re-grep before editing |
| `CLAUDE.md` still says `uv run audition` | **PM-VERIFIED** — post-#71 § Repo shape injection shows it survived #71 |
| `voicelab` is the entry point | **PM-VERIFIED** — `pipeline/pyproject.toml:16` read 2026-07-27 |
| #31 protection comparison (8/2/404/403) | **PM-VERIFIED** — measured in #31's 2026-07-27 comment |
| Changelog gate fails a PR without an entry | **PM-VERIFIED behaviorally** — every merged PR passed it; failing direction proven on #26/#27 per #30's history |
| `main` at `a54befb` | **PM-VERIFIED** 2026-07-28 ~02:45Z |

## 8. References

#30 body + 2026-07-27 rescope comment (wins) · #31 body + decision comment (wins) ·
`quality.yml` · `pipeline/pyproject.toml:15-16` · `AGENTS.md` § Definition of done, § Recorded
divergences · `ROADMAP.md` § Decisions · #68/#71 (the falsehood class's third instance, closed) ·
provenance: falsehoods found by PM audit 2026-07-27 on the maintainer's instruction.
