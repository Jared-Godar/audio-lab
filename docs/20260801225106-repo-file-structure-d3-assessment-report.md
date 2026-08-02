# Repo file-structure — D3 assessment report

**Issue:** [#180](https://github.com/Jared-Godar/audio-lab/issues/180) (D3 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-01
· **Status:** report only — nothing was moved, renamed or deleted.

**Inputs:** D1 inventory
([`20260801-repo-file-structure-audit-d1-inventory.md`](20260801-repo-file-structure-audit-d1-inventory.md))
and D2 target proposal
([`20260801-repo-file-structure-d2-target-proposal.md`](20260801-repo-file-structure-d2-target-proposal.md)).
**Measured against `main` at `0a8e88c`** — every number below was re-derived for this
report, not copied forward. Where a re-derivation disagreed with D1, this report carries
the new number and says so.

This report is the reading material for **D4 (#181)**, the decision gate. It ends in
**eleven open questions** — D2's ten, plus one found while verifying this report — and one
question (**Q12**) that D1 raised, D2 dropped, and the maintainer settled during this
session; it is recorded as decided rather than carried to the gate. Each open question
carries options and a recommendation with a reversal condition, because #180 asks for that
explicitly — *"so gate 1 is a decision session and not a discovery session."*
**A recommendation here is an input, not a decision.** All eleven are yours to settle at the
gate, including by rejecting the recommendation outright.

---

## 0. Uncertainty, stated first

Four things you should know before you read anything else.

**0.1 — One D1 finding did not survive re-measurement.** D1's finding F3 (brand content
scattered across six surfaces) reported per-surface file counts that are wrong for three
of the six. The *conclusion* holds and is if anything understated; the *numbers* in that
one table do not. Section 1.4 carries corrected figures. Details of how this was caught
are in § 6.

**0.2 — D2's path mapping is already eight files short.** D2 mapped "every tracked path in
`main@c9685af`" — 328 files. `main` is now `0a8e88c` with **336**. Eight files landed in
one day, and **three of them fall outside D2's mapping rules** (§ 2.6). This is not a
criticism of D2; it is the reorg's central operational risk. A path-complete mapping has a
shelf life measured in days, so D7 must re-derive its move list at execution time rather
than replay D2's table.

**0.3 — Recommendation confidence varies and is labelled.** Each recommendation in § 3
carries **high / medium / low** confidence. The low-confidence ones are preferences, and
you should treat them as such.

**0.4 — What this report did not measure.** I did not verify D1's `du` figure for every
subdirectory of `artifacts/`, did not open the four untracked `.ai` design sources to
confirm what artwork they correspond to, and did not test whether any script, workflow or
config file hard-codes a path that a move would break. **That last one is a gap that D6
must close** and is called out again in § 6.4 — no automated check in this repo would
catch a broken path reference before merge.

---

## 1. Current state

### 1.1 Scale

| Measure | Value | How measured |
| --- | ---: | --- |
| Tracked files on `main@0a8e88c` | **336** | `git ls-tree -r --name-only origin/main \| wc -l` |
| …at D2's baseline `c9685af` | 328 | same, at that commit |
| Working directory, everything | **546 MB** | `du -sh` |
| `output/` — gitignored | **132 MB** | `du -sh output` |
| `artifacts/` — mostly gitignored | **90 MB** | `du -sh artifacts` |
| `.claude/worktrees/` — gitignored | **206 MB** | `du -sh .claude/worktrees` |
| `.git` | 33 MB | `du -sh .git` |

Two numbers deserve comment.

**Gitignored scratch is 222 MB — 46% of the tree excluding worktrees.** This is D1's
headline and it holds exactly. Nearly half of what you scroll past never reaches a fresh
clone, so any plan that organises only the tracked half solves 54% of the problem.

**`.claude/worktrees/` is 206 MB — larger than `output/`.** D1 correctly excluded
worktrees from its structural counts (they are full repo copies and would double every
figure), but that means D1's "483 MB" understated what is actually on your disk. There
are **11 worktrees** including the main checkout — ten leftovers from parallel sessions.
This is agent-generated debt, not a structure problem, and it is **not in scope for the
reorg**; it is noted here only because "the repo directory is 546 MB" is otherwise
confusing.

### 1.2 Top-level shape

Tracked counts from `git ls-tree -r --name-only origin/main | cut -d/ -f1 | sort | uniq -c`:

| Directory | Tracked | Purpose | Note |
| --- | ---: | --- | --- |
| `episodes/` | 79 | Episode deliverables | Largest tracked surface; three episodes, three shapes |
| `docs/` | 44 | Durable docs | 22 top-level + 22 in `adr/` |
| `artifacts/` | 42 | "Scratch" | **All 42 reach a fresh clone** — see F1 |
| `site/` | 27 | Static site | 6 root files + 21 in `assets/` |
| `prompts/` | 27 | Executor specs | **23 are byte-identical copies** of `artifacts/specs/` |
| `brand/` | 25 | Design tokens & assets | One of six brand surfaces |
| `pipeline/` | 22 | uv Python CLI (`uv run voicelab`) | The product |
| `tools/` | 14 | Builders | All 14 under `tools/brand/` |
| `.github/` | 14 | CI & templates | **Cannot move** |
| `infra/` | 8 | CloudFormation + IAM | Coherent; least churn expected |
| `archive/` | 8 | `audition-v1` | Retired work |
| `spotify/` | 6 | Pre-podcast project | Orphan |
| `scripts/` | 5 | Repo automation | Purpose overlaps `tools/` |
| `fish/` | 2 | Audition-era helpers | Orphan |
| `templates/` | 1 | `task-spec.md` | A one-file directory is not a category |
| `.claude/` | 1 | Agent config | **Cannot move** |
| `data/` | **0** | `spotify-2022/`, 2.2 MB | Entirely untracked, documented nowhere |
| `output/` | **0** | 132 MB of renders | Fully gitignored |
| *(root files)* | 11 | Governance & config | `AGENTS.md`, `CLAUDE.md`, `README.md`, … |

**Fourteen non-dot top-level directories.** That is the number the reorg exists to reduce.

### 1.3 Inside the gitignored zones

`output/` — 132 MB, zero tracked:

| Subdir | Size | Note |
| --- | ---: | --- |
| `episodes/` | 120 MB | of which **90 MB is `ToldStraight-Ep01-v2/_post-experiments/`** |
| `auditions/` | 8.5 MB | |
| `artwork/` | 3.2 MB | **82 files** — a brand surface invisible to git |
| `shared-previews/` | 228 KB | |

The `_post-experiments/` figure is sharper than D1 reported. It is seven mp3 variants of a
single Ep01 tempo experiment — `tempo105-gap300`, `tempo108-gap250`, `tempo112-gap220` and
four longer cuts — retained after the tempo question was settled on 2026-07-27. **90 MB is
68% of `output/` and 16% of the entire working directory**, and it is one settled
question's leftovers.

`artifacts/` — 16 subdirectories, 2 tracked. Largest: `brand-wip/` 43 MB (untracked),
`_guide-tracks/` 19 MB, `20260731-cast-expansion-167-prompts/` 15 MB. Tracked:
`specs/` (40 files) and `issues/` (2).

### 1.4 Corrected: where brand content lives

D1's F3 table under-counted three surfaces. Re-measured (`git ls-tree` for tracked, `du`
and `find` for disk):

| Surface | Disk | Tracked | D1 said | Verdict |
| --- | ---: | ---: | ---: | --- |
| `artifacts/brand-wip/` | **43 MB** | **0** | 11 files, 0 tracked | consistent |
| `episodes/cast/` | 11 MB | 6 | 8 files, 6 tracked | consistent |
| `site/assets/` | **3.5 MB** | **21** | 2.1 MB, 10 files, 10 tracked | **wrong** |
| `output/artwork/` | 3.2 MB | **0** | 82 files, 0 tracked | consistent (82 confirmed) |
| `brand/` | 1.6 MB | **25** | 18 files, 17 tracked | **wrong** |
| `tools/brand/` | 368 KB | **14** | 10 files, 10 tracked | **wrong** |

The correction makes the finding stronger, not weaker: there is **more** scattered brand
content than D1 reported. Six surfaces; the two largest by volume — `artifacts/brand-wip/`
at 43 MB and `output/artwork/` at 82 files — are entirely untracked. "Where is the
wordmark" has six possible answers and no rule to choose between them.

---

## 2. Disconnects

Each is a fact with the command that produced it. **Five of D1's findings were re-derived
independently and hold; one did not** (§ 1.4, and § 6 for method).

### 2.1 — `CLAUDE.md` is wrong about the repo's own contract *(verified — holds)*

`CLAUDE.md` states that `artifacts/` is a *"**gitignored** working zone… nothing here
reaches a fresh clone or cloud session."*

`.gitignore` lines 113–118 say otherwise:

```gitignore
artifacts/*
!artifacts/specs/
!artifacts/issues/
artifacts/walkthroughs/
artifacts/session-handoffs/
```

`git ls-tree -r --name-only origin/main -- artifacts | wc -l` → **42**. Forty-two files
under `artifacts/` reach every fresh clone.

**Why it matters.** This is the highest-value single fix in the audit, and its cost is not
tidiness. `artifacts/` is simultaneously scratch *and* a tracked home with no stated rule
separating them, so an agent following `CLAUDE.md` will treat a tracked spec as disposable,
and an agent reading `.gitignore` will treat scratch as durable. Both have happened.

### 2.2 — 23 byte-identical duplicate files across two tracked trees *(verified — holds)*

Re-derived by a different mechanism than D1 used. D1 compared file contents with Python's
`filecmp.cmp(shallow=False)`. This report compared **git blob SHAs** from
`git ls-tree -r origin/main -- prompts artifacts/specs`, which is git's own content hash
and shares no code path with a filesystem read:

```text
prompts/ files: 27   artifacts/specs/ files: 40
common basenames: 23   identical blob SHA: 23   diverged: 0
prompts-only: 20260726-pm-thread-seed-v3.md, 20260726-pm-thread-seed.md,
              EXECUTOR-SEED-PROMPT-TEMPLATE.md, told-straight-v2-pm-seed.md
```

**85% of `prompts/` is a byte-exact copy of `artifacts/specs/`.** Two independent methods
agree, including on the identity of all four non-duplicates.

**Why it matters.** They have not diverged, and nothing prevents it — no symlink, no
generator, no CI check. The first hand-edit to either copy creates a silent split with no
signal, and the two trees are far enough apart that nobody would look.

### 2.3 — Brand content is spread across six surfaces, three invisible to git *(verified — numbers corrected)*

See § 1.4. Separately and structurally: brand **builders** live in `tools/brand/` while
brand **output** lives in `brand/`, `site/assets/`, `episodes/` and `output/artwork/`.

**Why it matters.** `AGENTS.md` and the project-memory rule
`commit-the-source-with-the-approved-art` both require a builder and its art to ship in the
same PR. The current layout separates them by two top-level directories, so the rule is
enforced by attention alone. It has already failed once — #177 exists because design sources
for approved artwork were lost.

### 2.4 — `pipeline/` re-creates top-level names, with empty directories *(verified — holds)*

`pipeline/artifacts/walkthroughs/` and `pipeline/prompts/` both exist and both are empty.
Directory names in use at more than one level, from the tracked tree:

| Name | Levels | Locations |
| --- | ---: | --- |
| `cast` | 3 | `episodes/cast/`, `episodes/ToldStraight-Ep02/cast/`, `…Ep03/cast/` |
| `assets` | 3 | `site/assets/`, and two under `artifacts/` (untracked) |
| `brand` | 2 | `brand/`, `tools/brand/` |
| `artifacts` | 2 | `artifacts/`, `pipeline/artifacts/` |
| `prompts` | 2 | `prompts/`, `pipeline/prompts/` |
| `walkthroughs` | 2 | `artifacts/walkthroughs/`, `pipeline/artifacts/walkthroughs/` |
| `episodes` | 2 | `episodes/`, `output/episodes/` |

**Why it matters.** The same word means different things at different depths, and the
directories that would disambiguate it hold nothing. A path in a handoff note or an issue
is ambiguous without extra context that is rarely supplied.

### 2.5 — No two episodes have the same shape *(verified item-by-item — holds exactly)*

Every row re-checked against `git ls-tree -r --name-only origin/main -- episodes/<ep>`:

| Item | Ep01 (27) | Ep02 (23) | Ep03 (20) |
| --- | :---: | :---: | :---: |
| `cover.png`, `ch1–ch6.png`, `alt-text.md` | ✅ | ✅ | ✅ |
| `transcript.md` / `.txt` / `.vtt` | ✅ | ✅ | ✅ |
| `show-notes.md` | ✅ | ✅ | ✅ |
| `transcript.html` | ✅ | ✅ | ❌ |
| `show-notes.html` | ✅ | ✅ | ❌ |
| `captions-autosync.txt` | ✅ | ✅ | ❌ |
| `youtube-description.txt` | ❌ | ✅ | ✅ |
| `episode-copy.txt` | ❌ | ✅ | ✅ |
| `host-read-sheet.md` | ✅ | ❌ | ❌ |
| `show-cover.png` | ✅ | ❌ | ❌ |
| `_v1-archive/` | ✅ | ❌ | ❌ |
| `record-host/guest-*.txt` | ❌ | ✅ | ❌ |
| `transcript-markup.txt` | ❌ | ✅ | ❌ |
| `script-draft-v1.md` | ❌ | ❌ | ✅ |
| `cast/` | ❌ | ✅ | ✅ |
| `build/` | ❌ | ❌ | ✅ |

**7 of 16 item types are common to all three. Six appear in exactly one episode.**

Cast portraits exist at two levels at once: shared at `episodes/cast/portraits/` (5
portraits + `manifest.json`) and per-episode in `Ep02/cast/` (3 files) and `Ep03/cast/`
(1 file). No rule states which is authoritative.

**Why it matters.** Each episode's contents record *when it was produced* rather than what
an episode is. Knowing where something lives in Ep02 tells you little about Ep01, and
there is no way to answer "is Ep03 finished?" without reading all three and guessing.

### 2.6 — New: D2's mapping is eight files behind, and three fall outside its rules

`git diff --name-status c9685af origin/main` shows eight files added in one day. Five map
cleanly under D2's existing rules. **Three do not:**

| File | Why D2's mapping does not cover it |
| --- | --- |
| `tools/brand/20260801-python-pillow-…-card-measurement.py` | D2's rule reads `tools/brand/*.jsx (12) → brand/builders/`. This is a **`.py`**, and the count is now 14. A glob written for one file type now misses a directory that holds two |
| `brand/20260801-toldstraight-approved-card-standard.md` | D2 maps `brand/` root files (a `.png` contact sheet, a `.css`) to `brand/tokens/`. This is a **standards document**. It could equally go to `docs/reference/`. No rule decides |
| `scripts/preview-site.fish` | D2 *anticipated* this one (`tooling/preview-site.fish  # ← #187 will add`) — correct foresight, listed here only for completeness |

**Why it matters.** This is the reorg's operational risk in miniature. A mapping table is a
snapshot; the repo is not. D7 must **generate** its move list from `main` at execution time
and apply *rules*, not replay D2's *rows*.

### 2.7 — Two naming conventions, and one directory that never adopted either *(re-derived — sharper than D1)*

D1 reported date-prefix conformance as an aggregate: *"51 dated, 35 undated — about 59%."*
That aggregate does not reconcile with any denominator I can reconstruct, and more
importantly it hides the actual pattern. Measured per directory (`docs/adr/` excluded, as
ADRs use a deliberate `NNNN-` numbering):

```text
artifacts/specs/    40/40 dated   (100%)
tools/              14/14 dated   (100%)
docs/                5/22 dated   ( 23%)
```

Separately, `artifacts/walkthroughs/` uses a **second, incompatible** format —
`YYYYMMDDTHHMMSSZ-` — in 30 of its 31 files.

**Why it matters.** This is not decay; it is a convention that two directories adopted
completely and one never adopted at all. **All 17 undated files sit in `docs/`**; the other
54 already conform. That changes the diagnosis: this was never partial decay, it was one
directory that never adopted a convention the other two applied completely. D1's aggregate
would have sent D7 looking for renames in three directories when only one had any.

**Resolved during this session.** The maintainer decided the convention directly rather
than carrying it to the gate — `YYYYMMDDHHmmss-`, mandatory, load-bearing filenames exempt,
historical renames folded into D7. See **Q12** in § 5 and
[ADR 0021](adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md). The measurement
above is what the decision was made against, and it changes the D7 estimate: the renames
touch **~84 files across two formats**, not the 17 undated ones.

### 2.8 — Three orphan surfaces from the original project *(verified — holds)*

- **`spotify/`** — 6 tracked files, 8.4 MB. The pre-podcast project.
- **`data/spotify-2022/`** — 2.2 MB, **zero tracked files**, at the top level, referenced in
  no documentation. Invisible to every `git ls-files`-based review, including D1's first pass.
- **`fish/`** — 2 files, both audition-era helpers (`audition.fish`, `audition-judge.fish`),
  matching the retired `archive/audition-v1/`.

### 2.9 — Filesystem noise *(re-measured — drifted, and that is the point)*

| Item | D1 (2026-08-01) | Now | |
| --- | ---: | ---: | --- |
| `.DS_Store` files | 12 | **8** | volatile |
| Empty directories | 5 | **6** | `artifacts/handoffs/` appeared |

Both numbers moved within a day. **Do not plan against them** — they are the state of a
working filesystem, not a property of the repo. `.DS_Store` files are already gitignored;
the fix is a `find -delete` at D7 time, not a decision.

### 2.10 — Correction carried forward to D8: the Git LFS premise is weaker than assumed *(verified — holds)*

Re-measured independently of git:

```text
mp3 files: 141   total: 163.1 MB   largest single: 15.3 MB
mp4 files: 0
```

Issue #185 was written assuming ~86 MB for a 60-minute episode at 192 kbps, putting it in
GitHub's 50 MB warning band. **These episodes are ~10 minutes.** The largest audio file
anywhere in the tree is **15.3 MB** — comfortably under every GitHub threshold. Plain git
could track final masters with no LFS at all: ≈ 140 MB at 10 episodes, ≈ 350 MB at 25.

The open variable is video: **zero `.mp4` files exist yet**, and video will be far larger.
**D8 must measure a real exported `mp4` before concluding.** Setting up LFS now would pay
its bandwidth cost on every clone and CI checkout for a problem that may not exist.

---

## 3. Recommendations

Ordered by **pain relieved per unit of churn** — the cheapest, safest, highest-value first.
Each carries a confidence level and a reversal condition. Items R1–R4 are independently
useful even if the reorg is cancelled entirely.

### R1 — Fix `CLAUDE.md` to match `.gitignore`. *(confidence: high)*

One paragraph, one PR, no files move. Either `artifacts/specs/` and `artifacts/issues/`
are tracked homes and `CLAUDE.md` should say so, or they should not be tracked. Today the
repo's own governance file is wrong about the repo, which is the root of § 2.1.

**Churn:** ~5 lines. **Pain relieved:** every future agent reads a true contract.
**Reversal:** none needed — this is a correction, not a design choice.
**Do this even if you cancel the reorg**, and it does not need to wait for D4.

### R2 — Delete `output/episodes/ToldStraight-Ep01-v2/_post-experiments/`. *(confidence: high)*

90 MB, gitignored, seven mp3 variants of a tempo question settled on 2026-07-27. Zero git
risk — nothing there has ever been committed.

**Churn:** one command. **Pain relieved:** 16% of the working directory.
**Reversal condition:** irreversible (they are not in git, so `rm` is final). Reverse the
*decision* by re-rendering from `pipeline/` if the tempo question ever reopens — the
inputs still exist. **This is a deletion, so it is yours to authorise at action time, not
mine to perform.** If you would rather not decide now, moving them to an external drive is
the same 90 MB saved with no finality.

### R3 — Retire `prompts/` — 23 provable duplicates, 4 real files. *(confidence: high)*

Two independent methods agree the 23 are byte-identical and the 4 are unique (§ 2.2).
Delete the 23; the 4 are session-seed templates, not specs, and need a home (Q10).

**Churn:** 23 deletions, 4 moves, no content change. **Pain relieved:** removes one of the
four competing homes for a document, and removes the possibility of a silent divergence.
**Reversal:** trivial — the deleted files remain in git history, byte-identical copies
survive in `artifacts/specs/`, and `git revert` restores the tree.

### R4 — Track the four untracked `.ai` design sources. *(confidence: high)*

`episodes/cast/Untitled-1.ai` (3.2 MB), `episodes/ToldStraight-Ep03/build/Untitled-1.ai`
(2.1 MB), `…/build/ep03-exhibit-cards.ai` (652 KB), `artifacts/brand-wip/readme.ai`
(660 KB). These are the live instance of the problem #177 was opened for: design sources
for approved, committed artwork existing in no repository at all. They are one `rm` or one
clean checkout from being exactly as gone as the Ep01 builders.

**Churn:** ~6.6 MB added to git. **Pain relieved:** closes an active data-loss exposure.
**Reversal condition:** if 6.6 MB of binary in git history proves unacceptable, that
decision cannot be reversed without a history rewrite — so **inspect each file before it
is committed** (`AGENTS.md` rule 5 requires this anyway: embedded fonts and licences are
the specific risk in an `.ai` file, and this repo is public).
**Caveat I could not resolve:** two are named `Untitled-1.ai`, so their correspondence to
specific artwork is already ambiguous. Renaming them to the convention requires opening
them in Illustrator — your machine, not mine.

### R5 — Consolidate brand to one home, builders beside output. *(confidence: high)*

Six surfaces → one tracked home plus one gitignored scratch. `tools/brand/*` moves to
`brand/builders/`, `artifacts/brand-wip/` to `brand/wip/`.

**Churn:** moderate — 14 builder files plus a 43 MB untracked directory.
**Pain relieved:** the largest single navigability win, and it makes the ship-source-with-art
rule structural instead of aspirational.
**Reversal:** `git mv` is fully reversible; use `git log --follow` to confirm history
survived before merging.

### R6 — Give `docs/` a five-way sorting rule. *(confidence: medium)*

`guides/` (how to do something) · `reports/` (what was found) · `reference/` (what is
true) · `specs/` (instructions to an executor) · `adr/` (a decision and why).

**Churn:** 22 file moves plus 40 from `artifacts/specs/`.
**Pain relieved:** four homes for a document collapse to one.
**Reversal condition:** revisit if you find yourself hesitating between two of the five for
more than a moment when filing a new document. **The rule matters more than the
directories** — if it is not obvious to you, it will decay exactly as the current split
did. That is Q3.

### R7 — Establish an episode template and normalise the three episodes. *(confidence: medium)*

`art/` · `text/` · `build/` · `audio/` (gitignored), with a `TEMPLATE/` directory recording
the shape.

**Churn:** the largest tracked-file move in the reorg — 79 files.
**Pain relieved:** "is this episode finished?" becomes answerable.
**Reversal condition:** if normalising Ep01–Ep03 to a shape designed from three samples
requires more than two exceptions, the template is wrong — stop and redesign rather than
forcing it. Six item types currently appear in exactly one episode, and I cannot tell from
the filesystem which of those are genuine per-episode needs and which are drift. **You
can.** That distinction is Q9's real content.

### R8 — Archive the orphans rather than deleting them. *(confidence: low — this is a preference)*

`spotify/` + `data/spotify-2022/` → `archive/spotify-2022/`; `fish/` → `archive/fish/`.
Removes three top-level entries; reunites two halves of one dead project.

**Churn:** 8 tracked files, 2.2 MB untracked.
**Reversal condition:** if `archive/` is never opened in six months, delete the whole
directory then — one decision instead of three. That is Q6, and my low confidence is
honest: **I have no evidence about whether you want this code.** Keeping is the
recoverable choice, which is the only reason I lean that way.

### R9 — Defer the `site/` → `website/` rename until #187 has fully landed. *(confidence: high)*

`.github/workflows/deploy-site.yml` is now on `main` and syncs `site/` to the production
bucket on every push. `infra/site.yaml` and `docs/site-deploy-walkthrough.md` also
reference the path. **A rename that lands before those are updated in the same commit
breaks the live site deploy.**

**Reversal:** not applicable — this is sequencing, not a design choice. If the rename must
happen sooner, it ships **alone**, with the workflow, the CloudFormation and the docs in
one PR, and the deploy verified green afterward.

### R10 — Do not move `pipeline/`. *(confidence: high)*

Moving it breaks `pyproject.toml` packaging, the `uv run voicelab` entry point, every
intra-package import, `.pre-commit-config.yaml` paths, and CI — for a rename that helps
nobody find anything. It is already one obvious top-level directory.

**Reversal condition:** revisit only if a second Python package is added, at which point a
parent directory earns its keep. That is Q1.

---

## 4. The proposal

D2's target tree, unchanged in substance. `[new]` = does not exist yet; `(ignored)` =
gitignored working zone, organised but never committed.

```text
audio-lab/
├── .github/  .claude/  .vscode/     # UNMOVABLE — root-only by their tools
├── AGENTS.md  CLAUDE.md  README.md  ROADMAP.md  CHANGELOG.md
├── CONTRIBUTING.md  SECURITY.md  LICENSE
├── .gitignore  .pre-commit-config.yaml  .markdownlint-cli2.yaml
│
├── brand/                      # ONE home for identity. Builder beside output.
│   ├── tokens/  logos/[new]  favicon/  social-icons/  web/
│   ├── builders/       [new]   #   ← tools/brand/*  (14 files, .jsx AND .py)
│   └── wip/            (ignored)   ← artifacts/brand-wip/  (43 MB)
│
├── docs/
│   └── adr/  guides/[new]  reports/[new]  reference/[new]  specs/[new]
│
├── podcast/            [new]   # show-wide, not episode-specific
│   └── cast.json  portraits/  artwork/[new]
│
├── episodes/
│   ├── EPISODE-COMPLETENESS.md  LICENSE  TEMPLATE/[new]
│   ├── ep01/ ├── art/  text/  build/  audio/(ignored)  _v1-archive/
│   └── ep02/  ep03/            #   same shape
│
├── website/                    #   ← site/   (sequence AFTER #187 — R9)
│   └── index.html  privacy.html  assets/  icons/[new]
│
├── infra/                      # AWS IaC only — unchanged
├── pipeline/                   # the uv package — NOT moved (R10)
├── tooling/            [new]   # repo automation  ← scripts/ + templates/
├── archive/                    #   audition-v1/  spotify-2022/  fish/
└── output/             (ignored)  renders, auditions, previews
```

**The measurable effect:**

| | Now | Proposed |
| --- | ---: | ---: |
| Non-dot top-level directories | **14** | **7** |
| Directory names reused with overlapping purpose | 7 | 0 |
| Places brand content lives | 6 | 1 (+1 ignored scratch) |
| Homes for a document | 4 | 1 |
| Byte-identical duplicate files | 23 | 0 |

**Retired entirely:** `artifacts/`, `prompts/`, `tools/`, `scripts/`, `templates/`,
`site/`, `spotify/`, `data/`, `fish/` — every file relocated, no directory left as a shell.

**Three deviations from your sketch in #176**, each proposed because a literal reading hits
a hard constraint:

1. **`.configurations/` cannot be built.** `.github/`, `.claude/` and `.vscode/` are read
   only at the repository root by their respective tools, and symlinks do not help —
   Actions resolves the real path. **Serving the intent instead:** 14 non-dot top-level
   directories become 7. Dotfolders are collapsed by every file browser; fourteen
   overlapping siblings are not. That is where the clutter actually is.
2. **`infrastructure/{core,pipeline,scripts,…}` split rather than merged** — see R10.
3. **Top-level `episode-1`, `episode-2`, …** would put 25 sibling directories at the root
   by season's end. `episodes/ep01/` is one root entry forever and sorts correctly.

---

## 5. Open questions for D4 (#181)

**Eleven open**: D2's ten, plus **Q11** (new — found while verifying § 2.5). Each has
options and a recommendation with a reversal condition. **The recommendations are inputs.
Every decision is yours, including "none of the above."**

**One closed**: **Q12** was raised by D1, dropped by D2, restored here, and decided by the
maintainer during this session. It is listed at the end for the record, not for the gate.

**Q1 — `infra/` and `pipeline/` separate, or one `infrastructure/` parent?**
*Recommend:* separate, add `tooling/`. Merging breaks packaging and the `uv run voicelab`
entry point for a rename that aids no navigation.
*Reversal:* revisit if a second Python package appears. *(confidence: high)*

**Q2 — `adr/` at the root, or under `docs/`?**
*Recommend:* keep `docs/adr/`. Widely recognised convention; promoting it adds a root entry
for a category with one meaning.
*Reversal:* trivial — a single `git mv` any time. *(confidence: low — pure preference, and
you may simply prefer it at the root)*

**Q3 — Is guides / reports / reference / specs / adr the right five, and is the stated rule
the one you would apply?**
*Recommend:* yes, with the rule stated in `docs/README.md` so it is enforceable by review.
*Reversal:* if you hesitate between two categories when filing a document, the split is
wrong — collapse to `guides/` + `reference/` + `adr/`. *(confidence: medium — the rule is
the load-bearing part, not the directory names)*

**Q4 — Per-episode `cast/`, or one shared `podcast/portraits/`?**
Today both exist: 5 shared portraits plus 3 in Ep02 and 1 in Ep03, with no rule.
*Recommend:* single source at `podcast/portraits/`, episodes reference it. A face that
appears in two episodes should not have two files that can diverge.
*Reversal:* if an episode ever needs an episode-specific treatment of the same person,
add `episodes/epNN/art/cast/` **as a documented exception**, not as a parallel default.
*(confidence: medium)*

**Q5 — Social brand folders: `images/` vs `media/`, per-platform vs shared-plus-exceptions?**
*Recommend:* defer. Nothing is populated; naming an empty tree now guesses at content that
does not exist.
*Reversal:* decide the moment the second platform needs a distinct asset — that is when the
answer becomes evidence-based rather than a guess. *(confidence: medium)*

**Q6 — `archive/` contents: keep or delete `spotify/` (8.4 MB), `data/spotify-2022/`
(2.2 MB), `audition-v1/`?**
*Recommend:* keep, consolidated under `archive/`. Deletion is irreversible for the
untracked half; `data/spotify-2022/` is in no repository at all.
*Reversal:* set a date — if `archive/` is untouched in six months, delete the whole
directory in one decision. *(confidence: low — **I have no evidence about whether you want
this code.** I lean to keeping only because it is the recoverable option)*

**Q7 — `output/` at 132 MB: prune, leave, or move off the working tree?**
*Recommend:* delete `_post-experiments/` (90 MB, settled question — R2); leave the rest.
That is 68% of the problem for one command and no finality elsewhere.
*Reversal:* the deletion is final (nothing there is in git); the tempo experiment can be
re-rendered from `pipeline/` if it ever reopens.
**This is a destructive action and needs your authorisation at the time it is run.**
*(confidence: high on the recommendation, but the action is yours)*

**Q8 — `.local/sessions/` for walkthroughs/handoffs/drafts, or move session scratch out of
the repo entirely?**
*Recommend:* `.local/sessions/` inside the repo. Scratch that sits beside the work it
describes gets read; scratch in `~/tmp` does not.
*Reversal:* if it exceeds ~50 MB or nothing in it is read for a month, move it out.
*(confidence: medium)*

**Q9 — Episode `TEMPLATE/`: enforced by CI, or advisory?**
Only 7 of 16 item types are common to all three episodes.
*Recommend:* advisory first, for exactly two episodes. An enforced check written against
today's inconsistency would encode the drift as the standard.
*Reversal:* promote to a required check once two consecutive episodes conform without an
exception. **The question underneath this one is yours alone:** of the six item types that
appear in exactly one episode, which are genuine per-episode needs and which are drift? I
cannot tell that from the filesystem. *(confidence: medium)*

**Q10 — `prompts/` residue: what happens to the 4 non-duplicates?**
`EXECUTOR-SEED-PROMPT-TEMPLATE.md` plus three PM-era seeds, two of which are versions of
the same file. They date from the standing-PM model that Experiment A replaced.
*Recommend:* keep `EXECUTOR-SEED-PROMPT-TEMPLATE.md` in `tooling/templates/`; archive the
three PM seeds to `archive/`. They document a superseded operating model.
*Reversal:* if Experiment A is ever reversed to a two-session PM/executor model — a
possibility its own reversal conditions contemplate — the seeds come back from `archive/`.
*(confidence: medium)*

**Q11 — NEW: `episodes/epNN/build/` would hold two unrelated things. Is that intended?**

Measured while verifying § 2.5: `episodes/ToldStraight-Ep03/build/` currently contains
`assemble_ep03.py`, `gen_ep03_transcripts.py`, `render_ep03_stems.py` and a `README.md` —
**Python audio-assembly code**. D2 separately routes the untracked `.ai` **Illustrator
design sources** into that same `episodes/epNN/build/`. Two unrelated kinds of source would
share one directory name, which is the exact pattern § 2.4 exists to eliminate.

*Options:* (a) split into `build/audio/` and `build/art/`; (b) send design sources to
`brand/` and keep `build/` for code; (c) accept one `build/` meaning "sources of any kind."
*Recommend:* (a). It preserves "source lives with what it produces" while keeping one name
to one meaning, and it costs one extra directory level.
*Reversal:* if `build/art/` only ever holds one file per episode, flatten it back.
*(confidence: medium — this was found today and has had less scrutiny than Q1–Q10)*

**Q12 — DECIDED 2026-08-01, before the gate. Not an open question.**

This one was restored to the agenda and then answered within the same session, so it is
recorded here rather than carried to #181.

**How it came to be missing.** D1 closed with eight items for D2 to resolve. D2 resolved
seven and carried ten questions forward — but **D1's item 7 (naming convention) appears in
neither.** D2's mapping preserves every filename as-is, and none of its ten questions
mention naming. It was dropped between stages rather than decided. D3 restored it; the
maintainer then settled it directly.

**The decision**, verbatim:

> INCLUDE timestampy YYYYMMDDHHmmss as a prefix to every script, walkthrough, and
> maintainer requested document - I am in favor of applying it universally, but open to
> counterarguments against, should you have any

Counterarguments were offered and none defeated the policy. The strongest — that a
second-granular creation stamp implies a version that does not exist — applies only to
continuously-current reference documents, not to the three categories named. Recorded in
full as **[ADR 0021](adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md)**;
the operative rule is in `CLAUDE.md` § Artifact naming.

Two boundary questions were put to the maintainer and answered:

- **Exemptions — load-bearing filenames only.** `README.md`, `LICENSE`, `SECURITY.md`,
  `CONTRIBUTING.md`, `CHANGELOG.md`, `AGENTS.md`, `CLAUDE.md`, `.github/**`,
  `docs/adr/NNNN-*.md`, and `pipeline/**` Python sources. Each is read by exact name, so a
  rename breaks behaviour rather than taste.
- **Sequencing — the ~84 historical renames ride D7 (#184).** Go-forward from 2026-08-01.
  D7 is already rewriting every path and fixing every inbound reference, so renaming there
  costs almost nothing extra; doing it now would touch those references twice.

**This report is the first file to carry the new prefix.** It also demonstrates why second
granularity was needed: D1, D2 and D3 were all authored on 2026-08-01 and would otherwise
have shared `20260801-`, sorting arbitrarily against one another.

---

## 6. Risks, and what will temporarily break

### 6.1 — The mapping goes stale faster than the reorg executes

Eight files landed between D2's baseline and this report — one day. Three fell outside
D2's rules (§ 2.6).

**Mitigation:** D7 generates its move list from `main` at execution time by applying
*rules*, and fails loudly on any path that matches no rule, rather than replaying D2's
table. A file silently left behind because no rule covered it is the failure mode.

### 6.2 — `.gitignore` must be rewritten in the same commit as the `artifacts/` retirement

`!artifacts/specs/` and `!artifacts/issues/` stop meaning anything the moment those
directories move. A stale ignore rule is how § 2.1 started in the first place.

### 6.3 — The `site/` → `website/` rename touches a live deployment

`.github/workflows/deploy-site.yml` is on `main` now and syncs `site/` to the production
bucket on push. `infra/site.yaml` and `docs/site-deploy-walkthrough.md` also carry the
path. **Sequence this rename last, ship it alone, and confirm the deploy green afterward**
(R9). The role's trust policy pins the OIDC subject to `refs/heads/main`, so a branch
cannot deploy early — but a merged rename with a stale workflow path breaks the real site.

### 6.4 — Nothing in CI catches a broken path reference *(unverified gap — D6 must close it)*

I did **not** audit which scripts, workflows or config files hard-code paths that a move
would break, and there is no automated check that would catch one before merge. Known
candidates: `.pre-commit-config.yaml`, `.github/workflows/*`, `pipeline/pyproject.toml`,
`infra/site.yaml`, `scripts/*`, and the `docs/` walkthroughs.

**Additionally, agent memory files reference paths that will move.**
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` names directories by path —
`episode-artwork-build-workflow` alone names `tools/brand/`. Those files are machine-local
and outside the repo, so no CI check will ever see them. **D6 must enumerate them and D7
must update them**, or the memory surface starts describing a tree that no longer exists.

### 6.5 — History survival is assumed, not yet proven

Every move is planned as `git mv` so `git log --follow` and `git blame` survive. That is
the intent; it has not been tested on this repo. **D7 should verify `--follow` on at least
one moved file in each category before the PR is handed over** — rename detection is
heuristic, and a move combined with an edit in the same commit can defeat it.

### 6.6 — Deliberate scope additions, to be called out in their PRs

- Four untracked `.ai` sources **become tracked** (R4) — a scope addition flagged to #177,
  not an accident of the move, and each must be inspected before it enters a public repo.
- `_post-experiments/` deletion (R2/Q7) is **irreversible** and needs authorisation at the
  time it is run.

### 6.7 — D7 gained scope it did not have when it was written

The Q12 decision (§ 5, [ADR 0021](adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md))
adds a rename pass to **D7 (#184)** that was not in its original description: **~84 files
across two formats** move to `YYYYMMDDHHmmss-`, and the `YYYYMMDDTHHMMSSZ-` format used in
30 `artifacts/walkthroughs/` files is retired.

This was deliberately folded into D7 rather than run as its own PR, because D7 is already
rewriting every path and fixing every inbound reference — a separate rename pass would
touch those same references twice. **The consequence is that D7 grows**, and its two halves
compound: a file that both moves and is renamed in one commit is the exact case where git's
rename detection is weakest (§ 6.5). D7 should either stage the rename separately from the
move within the same PR, or verify `git log --follow` on a file that underwent both.

Excluded from the rename by maintainer decision: `README.md`, `LICENSE`, `SECURITY.md`,
`CONTRIBUTING.md`, `CHANGELOG.md`, `AGENTS.md`, `CLAUDE.md`, `.github/**`,
`docs/adr/NNNN-*.md`, and `pipeline/**` Python sources.

---

## Appendix — verification method

This report's brief required re-deriving D1's counts rather than accepting them, because
the failure that prompted it was a review that "independently verified" a script by
re-running that same script. Re-running a command proves it is deterministic, not correct.
Each check below used a **different mechanism** from the one D1 used.

| D1 finding | D1's method | This report's method | Result |
| --- | --- | --- | --- |
| F2 — 23 duplicates | Python `filecmp.cmp(shallow=False)`, reads both files | **git blob SHAs** from `git ls-tree`, no filesystem read | **holds** — 23/23 identical, 0 diverged, same 4 non-duplicates |
| F1 — `artifacts/` tracked | `.gitignore` inspection | `git ls-tree -r -- artifacts \| wc -l` | **holds** — 42 |
| F5 — episode shapes | comparison table | item-by-item `git ls-tree` per episode | **holds** — all 16 rows correct |
| F7/D8 — audio sizing | `find -exec du -ch` | `find -print0 \| xargs stat -f %z`, summed | **holds** — 141 files, 163.1 MB, max 15.3 MB, 0 mp4 |
| Disk volumes | `du -sh` | `du -sh`, re-run today | **holds** — `output/` 132 MB, `artifacts/` 90 MB |
| Tracked totals | `git ls-files \| awk` | `git ls-tree -r \| cut/sort/uniq` | **drifted** — 328 at `c9685af` (matches D2 exactly), 336 now |
| F3 — brand surfaces | per-surface counts | `git ls-tree` per path, at **both** commits | **FAILED** — 3 of 6 wrong; § 1.4 |
| F8 — naming | aggregate 51/35 | per-directory regex on basenames | **restated** — 40/40, 14/14, 5/22; the aggregate hid the pattern |
| F9 — noise | `find` | `find`, re-run today | **drifted** — 8 `.DS_Store` (was 12), 6 empty dirs (was 5) |

**How F3 was caught, and why it matters.** The first re-measurement returned
`site/assets/ tracked=21` against D1's 10. Growth was the obvious explanation, so the same
path was measured at D2's baseline commit `c9685af` — it was **21 there too**. The number
had never been 10. Measuring at both commits is what separates *drift* (the repo changed)
from *error* (the measurement was wrong), and only the second is a finding. D1's F3 table
also contradicts D1's **own** top-level table for `brand/` (18 vs 24) and `tools/` (10 vs
12), which is a signal that was available in the document all along.

**Commands.** Every figure in this report is reproducible from the repository root
(Fish syntax):

```fish
set R /Users/jaredgodar/Code/audio-lab

# tracked totals and per-top-level-directory counts
git -C $R ls-tree -r --name-only origin/main | wc -l
git -C $R ls-tree -r --name-only origin/main | cut -d/ -f1 | sort | uniq -c | sort -rn

# duplicate detection by content hash -- compare the blob SHA column
git -C $R ls-tree -r origin/main -- prompts artifacts/specs | awk '{print $3, $4}'

# separate drift from error: measure the SAME path at TWO commits
git -C $R ls-tree -r --name-only c9685af    -- site/assets | wc -l
git -C $R ls-tree -r --name-only origin/main -- site/assets | wc -l

# audio inventory, independent of git
find $R -name "*.mp3" -not -path "*/.git/*" -not -path "$R/.claude/worktrees/*" \
  -print0 | xargs -0 stat -f "%z"

# empty directories and noise -- worktrees MUST be excluded, they are full repo copies
find $R -type d -empty -not -path "*/.git/*" -not -path "$R/.claude/worktrees/*"
```
