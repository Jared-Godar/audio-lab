# Repo file-structure — D2 target proposal

**Issue:** [#179](https://github.com/Jared-Godar/audio-lab/issues/179) (D2 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-01
· **Status:** proposal only — nothing moved. Inputs: D1 inventory
([`20260801-repo-file-structure-audit-d1-inventory.md`](20260801-repo-file-structure-audit-d1-inventory.md)),
measured against `main` at `c9685af` (328 tracked files).

Read the maintainer's tree in #176 as **intent, not specification** — his words: *"doesn't have to
be exact, but capture the spirit."* Where a literal reading collides with a hard constraint, this
document proposes the alternative that serves the intent and says so under
[Deviations](#deviations-from-the-proposed-tree). Nothing is silently decided;
[Open questions](#open-questions-for-gate-1) is the gate-1 agenda.

---

## The actual navigability win

The maintainer's instinct was to corral dotfolders into `.configurations/`. That specific move is
**not implementable** (see D1 / Deviations), but it turns out not to be where the pain is:

| | Now | Proposed |
| --- | ---: | ---: |
| Non-dot top-level directories | **14** | **7** |
| Directory names reused at multiple levels with overlapping purpose | 7 | 0 |
| Places brand content lives | 6 | 1 (+1 gitignored scratch) |
| Homes for a document | 4 (`docs/`, `artifacts/specs/`, `prompts/`, `archive/`) | 1 |
| Byte-identical duplicate files | 23 | 0 |

Dotfolders are collapsed by every file browser and most editors. Fourteen sibling directories with
overlapping names are not. Halving that is the change you actually feel.

---

## Design principles

1. **One name, one meaning, one level.** No `brand/` inside `tools/`, no `artifacts/` inside
   `pipeline/`. If a word appears twice in the tree it means the same thing both times.
2. **Source lives with what it produces.** `AGENTS.md` already requires a builder to ship with its
   art; the current split (`tools/brand/*.jsx` here, output there) works against the rule it is
   meant to support.
3. **Create only what has content.** The maintainer's brand tree implies ~18 directories, most
   empty for months. D1 found 5 empty directories already contributing noise. The full skeleton is
   **documented** below; only populated directories get created.
4. **Tracked and ignored content share one shape.** 46% of the tree is gitignored. A plan that
   organises only the tracked half leaves half the navigation problem in place.
5. **Every move is a `git mv` git can follow**, so `git log --follow` and `git blame` survive.

---

## Target tree

Directories marked `[new]` do not exist yet. Directories marked `(ignored)` are gitignored working
zones — organised, but never committed.

```text
audio-lab/
├── .github/                    # UNMOVABLE — root-only by GitHub
├── .claude/                    # UNMOVABLE — root-only by Claude Code
├── .vscode/                    # UNMOVABLE — root-only by VS Code
├── AGENTS.md  CLAUDE.md  README.md  ROADMAP.md  CHANGELOG.md
├── CONTRIBUTING.md  SECURITY.md  LICENSE
├── .gitignore  .pre-commit-config.yaml  .markdownlint-cli2.yaml
│
├── brand/                      # ONE home for identity. Builder beside output.
│   ├── tokens/                 #   design tokens, contact sheets
│   ├── logos/          [new]   #   wordmarks, lockups
│   ├── favicon/
│   ├── social-icons/
│   ├── web/                    #   og-cards, readme headers
│   ├── builders/       [new]   #   ← tools/brand/*.jsx moves here
│   └── wip/            (ignored)   ← artifacts/brand-wip/ (43 MB)
│
├── docs/
│   ├── adr/
│   ├── guides/         [new]   #   how-to: walkthroughs, runbooks, setup
│   ├── reports/        [new]   #   audits, root-cause analyses, findings
│   ├── reference/      [new]   #   durable facts: elevenlabs, citation standard
│   └── specs/          [new]   #   ← artifacts/specs/ (executor specs)
│
├── podcast/            [new]   # show-wide, not episode-specific
│   ├── cast.json
│   ├── portraits/              #   ← episodes/cast/portraits/
│   └── artwork/        [new]   #   show cover, show-wide plates
│
├── episodes/
│   ├── EPISODE-COMPLETENESS.md
│   ├── LICENSE
│   ├── TEMPLATE/       [new]   #   the shape every episode conforms to
│   ├── ep01/                   #   ← ToldStraight-Ep01/
│   │   ├── art/                #     cover.png, ch1-6.png
│   │   ├── text/               #     show-notes, transcripts, alt-text, copy
│   │   ├── build/              #     .ai sources  ← currently UNTRACKED
│   │   ├── audio/    (ignored) #     stems, assembled, captions
│   │   └── _v1-archive/        #     superseded, Ep01 only
│   ├── ep02/  ep03/            #   same shape
│   └── ...
│
├── website/                    #   ← site/
│   ├── index.html  privacy.html
│   ├── assets/
│   └── icons/          [new]   #   favicons, apple-touch-icon
│
├── infra/                      # AWS IaC only — already coherent, least churn
│   ├── README.md  dns.yaml  signup.yaml  site.yaml
│   └── policies/
│
├── pipeline/                   # the uv Python package — NOT moved, see Deviations
│   ├── core/  tests/  main.py  pyproject.toml
│   └── ...
│
├── tooling/            [new]   # repo automation, not product code
│   ├── check  install-hooks  check_pr_metadata.py  sync_labels.py
│   ├── preview-site.fish       #   ← #187 will add
│   └── templates/      [new]   #   ← templates/ + the 4 unique prompts/ seeds
│
├── archive/                    # retired work, kept deliberately
│   ├── audition-v1/
│   ├── spotify-2022/           #   ← spotify/ + data/spotify-2022/
│   └── fish/                   #   ← fish/ (audition-era helpers)
│
└── output/             (ignored)  renders, auditions, previews
```

**Retired entirely:** `artifacts/`, `prompts/`, `tools/`, `scripts/`, `templates/`, `site/`,
`spotify/`, `data/`, `fish/` — every file relocated, no directory left as a shell.

---

## Complete path mapping

Every tracked path in `main@c9685af`. "Rationale" is given only where the move is non-obvious.

### Brand — 6 surfaces collapse to 1

| Current | → | Destination | Rationale |
| --- | :-: | --- | --- |
| `brand/20260727-…-contact-sheet.png` | → | `brand/tokens/` | Groups with the tokens it documents |
| `brand/20260727-…-design-tokens.css` | → | `brand/tokens/` | |
| `brand/favicon/` (10) | → | `brand/favicon/` | unchanged |
| `brand/social-icons/` (7) | → | `brand/social-icons/` | unchanged |
| `brand/web/` (5) | → | `brand/web/` | unchanged |
| `tools/brand/*.jsx` (12) | → | `brand/builders/` | **Source beside output.** `AGENTS.md` requires builder and art to ship together; separating them by two top-level directories works against that |
| `artifacts/brand-wip/` (43 MB, ignored) | → | `brand/wip/` (ignored) | Largest brand surface, currently invisible to anyone reading `brand/` |
| `output/artwork/` (82 files, ignored) | → | `output/artwork/` | unchanged — renders, not sources |

### Documents — 4 homes collapse to 1, with a sorting rule

The rule that keeps this from decaying: **guides tell you how to do something, reports tell you
what was found, reference tells you what is true, specs instruct an executor, ADRs record a
decision.**

| Current | → | Destination |
| --- | :-: | --- |
| `docs/signup-deploy-walkthrough.md`, `site-deploy-walkthrough.md`, `audience-and-aws-access-guide.md`, `aws-identity-center-setup.md`, `aws-identity-center-roles.md`, `project-views-setup.md`, `runbook.md`, `recording-runbook.md`, `voice-capture.md`, `20260727-…-type-shootout-guide.md` | → | `docs/guides/` |
| `docs/20260729-m0-remediation-audit.md`, `20260729-root-cause-analysis-…md`, `20260801-repo-file-structure-audit-d1-inventory.md`, *this file*, `aws-billing-access-finding.md`, `pre-public-release-readiness.md`, `domain-availability-research.md`, `social-handle-availability-and-registration.md`, `cast-expansion-167.md` | → | `docs/reports/` |
| `docs/elevenlabs.md`, `citation-standard.md`, `privacy-policy.md` | → | `docs/reference/` |
| `docs/adr/` (21) | → | `docs/adr/` — unchanged |
| `artifacts/specs/` (40) | → | `docs/specs/` |
| `artifacts/issues/` (2) | → | `docs/specs/` |
| **`prompts/` (27)** | → | **23 deleted as byte-identical duplicates; 4 unique files to `tooling/templates/`** |

The 4 non-duplicates are now characterised (they were not, at D1). They are **not specs** — they
are session-seed templates, which is why they had no counterpart in `artifacts/specs/`:

| File | → | Destination |
| --- | :-: | --- |
| `EXECUTOR-SEED-PROMPT-TEMPLATE.md` | → | `tooling/templates/` |
| `20260726-pm-thread-seed.md` | → | `tooling/templates/` |
| `20260726-pm-thread-seed-v3.md` | → | `tooling/templates/` |
| `told-straight-v2-pm-seed.md` | → | `tooling/templates/` |

They belong with `templates/task-spec.md`, which is the same kind of artifact — a template a human
fills in to start work. Grouping them turns a one-file `templates/` directory and a 27-file
`prompts/` directory into one coherent five-file home.

> Two of the four (`20260726-pm-thread-seed.md`, `…-v3.md`) are versions of the same seed, and
> `told-straight-v2-pm-seed.md` may be a third. They date from the standing-PM era that
> Experiment A replaced. **Open question 10** now reads: keep all four, keep only the current
> template, or archive the PM-era seeds to `archive/`?

### Podcast and episodes

| Current | → | Destination | Rationale |
| --- | :-: | --- | --- |
| `episodes/cast.json` | → | `podcast/cast.json` | Show-wide, not episode-scoped |
| `episodes/cast/portraits/` (6) | → | `podcast/portraits/` | Shared across episodes; per-episode `cast/` dirs currently compete with it |
| `episodes/EPISODE-COMPLETENESS.md`, `LICENSE` | → | unchanged | |
| `episodes/ToldStraight-Ep0N/` | → | `episodes/ep0N/` | Shorter, sorts correctly, drops the redundant show name |
| `…/cover.png`, `ch1-6.png`, `show-cover.png` | → | `…/art/` | |
| `…/show-notes.*`, `transcript.*`, `alt-text.md`, `episode-copy.txt`, `youtube-description.txt`, `host-read-sheet.md`, `script-draft-v1.md`, `record-*.txt` | → | `…/text/` | |
| `…/Ep03/build/` (4) | → | `…/ep03/build/` | unchanged in shape |
| `…/Ep02/cast/`, `…/Ep03/cast/` | → | `podcast/portraits/` **or** `…/epNN/art/cast/` | **Open question 4** |
| `…/Ep01/_v1-archive/` (10) | → | unchanged | Ep01-only; superseded v1 artwork |
| **untracked** `…/Ep03/build/*.ai`, `episodes/cast/Untitled-1.ai` | → | `episodes/epNN/build/` **and get tracked** | Flagged to #177 — art sources currently in no repo at all |

### Infrastructure, tooling, archive

| Current | → | Destination | Rationale |
| --- | :-: | --- | --- |
| `infra/` (7) | → | `infra/` | Unchanged. Already coherent; lowest churn, highest blast radius if broken |
| `pipeline/` (22) | → | `pipeline/` | **Unchanged — see Deviation 2** |
| `scripts/` (4) | → | `tooling/` | Repo automation, not product code; `scripts/` is too generic to sit beside `pipeline/` |
| `templates/task-spec.md` (1) | → | `tooling/templates/` | Joins the 4 seed templates from `prompts/`; a one-file directory is not a category, a five-file one is |
| `site/` (27) | → | `website/` | Maintainer's naming; `site/` reads as a fragment |
| `site/favicon*.png`, `favicon.svg`, `apple-touch-icon.png` | → | `website/icons/` | Six root files in `website/` obscure the two that matter (`index.html`, `privacy.html`) |
| `spotify/` (6) | → | `archive/spotify-2022/` | Pre-podcast project; retained, not deleted |
| `data/spotify-2022/` (untracked, 2.2 MB) | → | `archive/spotify-2022/data/` (ignored) | Reunites two halves of the same dead project that currently sit apart and undocumented |
| `fish/` (2) | → | `archive/fish/` | Both files are audition-era helpers matching `archive/audition-v1/` |
| `archive/audition-v1/` (8) | → | unchanged | |

### Gitignored zones

| Current | → | Destination |
| --- | :-: | --- |
| `artifacts/walkthroughs/` (31), `session-handoffs/` (12), `drafts/` (12), `rules-pending/` (2) | → | `.local/sessions/` — one ignored scratch root, not a top-level directory |
| `artifacts/brand-wip/` | → | `brand/wip/` |
| `artifacts/_guide-tracks/`, `voice-previews/` | → | `output/audio/` |
| `artifacts/coming-soon-prototype/`, `20260731-coming-soon-preview/`, `hero-references/`, `reference-photos/`, `20260731-cast-expansion-167-prompts/` | → | `output/previews/` |
| `artifacts/1x/`, `artifacts/verification/` | → | **deleted — both empty** |
| `output/` (132 MB) | → | unchanged in place; see Open question 7 |

---

## Deviations from the proposed tree

### 1. `.configurations/` — cannot be built

`.github/` is read by GitHub only at the repository root; `.claude/` and `.vscode/` likewise for
their tools. Symlinks do not help — Actions resolves the real path. `.ruff_cache/` is generated and
should be ignored, not filed.

**Serving the intent instead:** the root goes from 14 non-dot directories to 7. That is where the
clutter actually is; three dotfolders are collapsed by every file browser.

### 2. `infrastructure/{core,pipeline,scripts,templates,tests}` — split rather than merged

The proposed grouping puts four unrelated things together: AWS CloudFormation and IAM (`infra/`),
the uv Python voice pipeline (`pipeline/`), repo automation (`scripts/`), and a spec template.
Only the first is infrastructure in any usual sense; the pipeline is the **product**.

**Moving `pipeline/` is also the single highest-risk move in the reorg** — it would break
`pyproject.toml` packaging, the `uv run voicelab` entry point, every intra-package import,
`.pre-commit-config.yaml` paths, and CI. All for a rename that does not help you find anything: it
is already one obvious top-level directory.

**Proposal:** keep `infra/` (AWS) and `pipeline/` (product) as siblings; `scripts/` + `templates/`
become `tooling/`. Three clear names beating one ambiguous parent.

### 3. Top-level `episode-1`, `episode-2`, … — nested instead

At 25 episodes the root would carry 25 sibling directories. `episodes/ep01/` is one root entry
forever, sorts correctly, and satisfies the actual goal (find an episode fast).

### 4. Brand sub-tree — documented in full, created only where populated

The proposed brand tree implies ~18 directories (print, email templates, six per-platform social
folders). Today there is content for maybe four. D1 found five empty directories already adding
noise. **Recommendation:** create the four that have content now; record the full skeleton in
`brand/README.md` so growth has a predetermined shape and nothing is invented ad hoc later.

### 5. `adr/` at root — kept under `docs/`

The proposed tree pulls `adr/` to the top level. ADRs are documents and `docs/adr/` is a widely
recognised convention; promoting it adds a root entry for a category with one meaning. Low
confidence — this is a preference, and easily changed. **Open question 2.**

---

## Open questions for gate 1

1. **`infrastructure/` grouping** — accept Deviation 2 (keep `infra/` and `pipeline/` separate,
   add `tooling/`), or insist on the single parent despite the packaging breakage?
2. **`adr/` at root or under `docs/`?** Pure preference; no technical driver either way.
3. **`docs/` sorting rule** — is guides / reports / reference / specs / adr the right five, and is
   the stated rule the one you would apply? If the rule is not obvious to you, it will decay.
4. **Per-episode `cast/`** — `Ep02` and `Ep03` have one, `Ep01` does not, and there is also a
   shared `episodes/cast/portraits/`. Should per-episode cast art live under `podcast/portraits/`
   (single source, referenced by episodes) or under `episodes/epNN/art/cast/` (duplicated per
   episode)? Currently both exist with no rule.
5. **Social-media brand folders** — `images/` vs `media/`, and per-platform subfolders for all six
   platforms versus shared-plus-exceptions. Nothing populated yet, so this is a naming decision
   before content forces one.
6. **`archive/` contents** — you asked whether `audition-v1` is worth keeping. Same question now
   applies to `spotify/` (8.4 MB) and `data/spotify-2022/` (2.2 MB). Keep, or delete outright?
7. **`output/` at 132 MB** — 120 MB is `output/episodes/`, largely seven ~14 MB variants of one
   Ep01 tempo experiment settled long ago. Prune, leave, or move off the working tree entirely?
8. **`.local/sessions/`** — is a single ignored scratch root the right destination for
   walkthroughs / handoffs / drafts, or should session scratch live outside the repo altogether?
9. **Episode `TEMPLATE/`** — D1 found only 7 of 16 item types common to all three episodes. Should
   the template be enforced (CI check for missing files) or advisory?
10. **`prompts/` residue** — 23 of 27 files are provable duplicates and go away. The other 4 are
    session-seed templates from the standing-PM era that Experiment A replaced:
    `EXECUTOR-SEED-PROMPT-TEMPLATE.md` plus three PM seeds, two of which are versions of the same
    file. Keep all four, keep only the executor template, or archive the PM-era seeds?

---

## Risk notes for D6/D7

- **`pipeline/` is deliberately not moved.** If gate 1 overrides that, it becomes the highest-risk
  stage and must ship alone, with `uv run voicelab` exercised before and after.
- **`website/` rename touches deployment.** `infra/site.yaml` and the S3 sync path in
  `docs/guides/site-deploy-walkthrough.md` both reference `site/`. **#187 is actively adding an
  automated S3 deploy keyed on that path** — these two pieces of work must not land blind to each
  other. Sequence the `website/` rename **after** #187 merges.
- **`.gitignore` must be rewritten as part of the `artifacts/` retirement**, not after. The
  `!artifacts/specs/` and `!artifacts/issues/` carve-outs stop meaning anything once those move,
  and a stale ignore rule is how D1's F1 contradiction started.
- **Untracked `.ai` sources become tracked** under `episodes/epNN/build/`. That is a deliberate
  scope addition flagged to #177, not an accident of the move — call it out in the PR.
- **Memory files reference paths.** `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`
  names directories that will move; nothing in CI catches that. D6 must enumerate them.
