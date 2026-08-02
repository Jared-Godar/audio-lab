# ADR 0022 — The repository's target file structure is nine tracked top-level directories, decided at gate 1

- **Number:** 0022
- **Title:** The repository's target file structure is nine tracked top-level directories, decided at gate 1
- **Status:** `accepted`
- **Date:** 2026-08-02
- **Source:** [#181](https://github.com/Jared-Godar/audio-lab/issues/181) (D4, approval
  gate 1) of epic [#176](https://github.com/Jared-Godar/audio-lab/issues/176). Decision
  record: [`docs/20260802001735-repo-file-structure-d4-decision-record.md`](../20260802001735-repo-file-structure-d4-decision-record.md).
  Structure of record: [`docs/20260802001736-repo-file-structure-d5-revised-structure.md`](../20260802001736-repo-file-structure-d5-revised-structure.md).

## Context

The repository carried **fourteen tracked non-dot top-level directories** at
`main@a15f075` (338 tracked files), with names reused at multiple levels for different
meanings, brand content spread across six surfaces, four competing homes for a document,
and 23 byte-identical files duplicated across two tracked trees. Measured across three
deliverables:

- **D1** ([`docs/20260801-repo-file-structure-audit-d1-inventory.md`](../20260801-repo-file-structure-audit-d1-inventory.md))
  inventoried the tree at `c9685af`.
- **D2** ([`docs/20260801-repo-file-structure-d2-target-proposal.md`](../20260801-repo-file-structure-d2-target-proposal.md))
  proposed a target and mapped every tracked path, leaving ten questions open.
- **D3** ([`docs/20260801225106-repo-file-structure-d3-assessment-report.md`](../20260801225106-repo-file-structure-d3-assessment-report.md))
  re-derived every D1 count by a different mechanism, found one finding (F3) wrong in
  three of six rows, added an eleventh question, and carried all eleven to this gate with
  options, a recommendation and a reversal condition each.

Three measured facts forced the shape rather than taste:

- `.configurations/` **cannot be built.** `.github/`, `.claude/` and `.vscode/` are read
  only at the repository root by their tools, and symlinks do not help — Actions resolves
  the real path.
- Moving `pipeline/` would break `pyproject.toml` packaging, the `uv run voicelab` entry
  point, every intra-package import, `.pre-commit-config.yaml` paths, and CI.
- `git ls-tree -r --name-only origin/main -- artifacts | wc -l` → **42**. Forty-two files
  under the directory `CLAUDE.md` calls a gitignored working zone reach every fresh clone.

## Decision

All eleven open questions were settled in one instruction on 2026-08-02, by accepting the
D3 recommendation as written for each. His decision: **yes to all eleven**, accepting each recommendation as written, on the
grounds that the structural direction had already been given and re-presenting it as an
open menu asked him to decide the same thing twice.

**The approved structure**, tracked top-level directories only:

`brand/` · `docs/` · `podcast/` · `episodes/` · `website/` · `infra/` · `pipeline/` ·
`tooling/` · `archive/` — plus the gitignored `output/` and `.local/`.

**Retired entirely:** `artifacts/`, `prompts/`, `tools/`, `scripts/`, `templates/`,
`site/`, `spotify/`, `data/`, `fish/`.

The eleven decisions, in one line each: `infra/` and `pipeline/` stay separate and
`tooling/` is added (Q1) · `adr/` stays under `docs/` (Q2) · `docs/` splits five ways —
guides, reports, reference, specs, adr — with the sorting rule written into
`docs/README.md` (Q3) · cast portraits get one shared home at `podcast/portraits/` (Q4) ·
social brand folder naming is deferred until content forces it (Q5) · the orphan projects
are archived, not deleted (Q6) · `output/_post-experiments/` is deleted, the rest of
`output/` left alone (Q7) · session scratch lives inside the repo at `.local/sessions/`
(Q8) · the episode `TEMPLATE/` is advisory, not CI-enforced (Q9) · the executor seed
template goes to `tooling/templates/` and the three PM-era seeds to
`archive/prompts-pm-era/` (Q10) · `episodes/epNN/build/` splits into `build/audio/` and
`build/art/` (Q11).

**The headline metric is 14 → 9 tracked directories, not 14 → 7.** D2 and D3 both
published 7; counting D2's own target tree gives 9, and no decision at this gate reduces
it further. Corrected in D5 § 0.1.

## Consequences

**Constrains M10** — every remaining deliverable in the epic executes against this
structure and no other:

- **D5 (#182)** is the structure of record; D2 is superseded as a target.
- **D6 (#183)** maps every inbound reference to a moving path, including the 19 lines in
  `AGENTS.md` and `CLAUDE.md` and the machine-local memory files under
  `~/.claude/projects/*/memory/`, which no CI check can see.
- **D7 (#184)** executes the moves. It **generates its move list from `main` at execution
  time by applying rules** (D5 § 5.3) and **fails loudly on any tracked path matching no
  rule** — it does not replay D2's table, which was already eight files stale one day
  after it was written. D7 also amends `AGENTS.md` and `CLAUDE.md` in the same work, and
  carries ADR 0021's ~84-file rename pass.
- **D8 (#185)** is unaffected by this ADR and still owes the LFS decision its own
  measurement.

**Constrains M5** — the `site/` → `website/` rename touches the live deploy
(`.github/workflows/deploy-site.yml`, `infra/site.yaml`, `docs/site-deploy-walkthrough.md`).
It ships **last and alone**, with the deploy confirmed green afterward.

**One item is left open by decision, not oversight.** Consolidating the cast portraits
merges two surfaces holding **different bytes for the same three people** — six files, six
distinct blob SHAs, no pair identical. Which rendition is authoritative per subject is the
maintainer's call and cannot be inferred from the filesystem (D5 § 4.1).

## Reversal condition

Each of the eleven carries its own, recorded in the D4 decision record § 2. The structural
ones that would reverse this ADR as a whole:

- **`tooling/` and the `infra/`/`pipeline/` split (Q1):** revisit if a second Python
  package is added, at which point a parent directory earns its keep.
- **The five-way `docs/` split (Q3):** if filing a document means hesitating between two
  of the five for more than a moment, collapse to `guides/` + `reference/` + `adr/`.
- **`archive/` (Q6):** if the directory is untouched by 2026-02-02, delete it whole in one
  decision rather than three.
- **`.local/sessions/` (Q8):** move scratch out of the repository if it exceeds ~50 MB or
  nothing in it is read for a month.

Reversing the structure **after** D7 has executed costs a second full path rewrite; the
cheap moment to reverse any of these is before D7 opens its first PR.
