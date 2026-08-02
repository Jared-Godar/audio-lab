# Repo file-structure — D6 dependency, link and path map

**Issue:** [#183](https://github.com/Jared-Godar/audio-lab/issues/183) (D6 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-02
· **Status:** approval gate 2 — proposal only. **Nothing has been moved, renamed or
deleted by this deliverable.**

**Inputs:** the D4 decision record
([`20260802001735-repo-file-structure-d4-decision-record.md`](20260802001735-repo-file-structure-d4-decision-record.md)),
the D5 revised structure
([`20260802001736-repo-file-structure-d5-revised-structure.md`](20260802001736-repo-file-structure-d5-revised-structure.md))
— the structure of record — and
[ADR 0022](adr/0022-approved-target-file-structure.md). D1 and D2 are superseded and are
not cited here.

**Measured against `origin/main` at `08c537e`, 345 tracked files.** Every count in this
document is a command that was run in this session; the commands are given inline so each
can be re-run. `(no output)` appears where it is the evidence.

There is no practical dry run for a reorg this size. This map is the substitute for a
smoke test, so § 1 states the search method plainly enough that its completeness can be
judged and its gaps argued with.

---

## 0. Read this first — three things that change what D7 does

**0.1 — The tree drifted again during gate 1, and the D5 rule set absorbed all of it
with no edit.** D5 measured 338 tracked files at `a15f075`. `origin/main` is at **345**.
All seven new files match an existing D5 § 5.3 rule; none needed a new one. This is the
third consecutive measurement of the same drift (328 → 336 → 338 → 345 across four days)
and the first time the rules survived it untouched. Detail in § 2.

**0.2 — The font gate fails silently after the move, and fixing the three references
already identified does not repair it.** D5 § 6.4 named three references that must move
together "or the font gate silently stops matching anything." Measured: the gate has
**six** path couplings, not three, and `resolve_targets()` guards the same decision twice
— once by glob, once by a tuple comparison on path segments. With both pre-identified
references corrected, the gate still resolves **0 of 13 builders and exits 0 reporting
"Brand fonts OK."** Proven with a control and a negative in § 4.2.

**0.3 — Stage 1 cannot go green as currently planned.** `docs/specs/` is not covered by
the `artifacts/**` markdownlint ignore that hides those files today. Simulated at the
destination path with the repo's own rule config: **296 violations across 37 of 45
files.** The specs are declared immutable after handoff, so fixing them collides with a
stated convention. This needs a decision before stage 1 opens (§ 10.5).

---

## 1. Method — how the sweep was built, and what it cannot see

Three mechanisms, deliberately different in kind. Each found references the others
missed, which is the only real evidence that any of them is near-complete.

### 1.1 — The corpus

```fish
git grep -I -l '' -- .        # 264 files
git ls-files | wc -l          # 345 tracked
```

`git grep -I` uses git's own binary detection. The 81-file gap is 66 `.png`, 12 `.webp`,
and **3 zero-byte files** (`pipeline/README.md`, `spotify/README.md`,
`archive/audition-v1/audition/__init__.py`) which `git grep -l ''` omits because they have
no lines. An empty file holds no path reference, so the corpus is complete for this
purpose.

An earlier attempt used `file --mime-type` and reported only 1 binary. That was wrong:
macOS `file` pads its filename column when given many arguments, so a single-space regex
missed every padded line. It is recorded because it is the shape of error this document
exists to catch — a count that looked plausible and was not re-derived.

### 1.2 — Mechanism A: prefix grep over the retired roots

```fish
git grep -I -n -E '(^|[^A-Za-z0-9_./-])(artifacts|prompts|tools|scripts|templates|site|spotify|fish)/|episodes/ToldStraight-Ep|episodes/cast|data/spotify' -- .
```

**1,502 hits across 139 files.** Broad, catches prose, and is the backbone of § 3 and § 5.

**What it cannot see, by construction:** paths assembled from segments, paths reached
through `../`, and references to files that move *within* a directory that stays — which
is why `docs/*.md` is absent from that pattern entirely. All three gaps are closed below.

### 1.3 — Mechanism B: resolve every relative link against the tree

A Python pass extracts every Markdown link target from `.md`, `.yaml`, `.yml`, `.json`,
`.html`, `.py`, `.fish`, `.css` and `.txt`, resolves it against the containing file's
directory, and reports where it lands.

- **112 relative links** found; **35 resolve to a moving target**.
- **6 are already broken today** and are not caused by the reorg (§ 9.1).
- It caught the entire `docs/*.md` class that mechanism A's pattern excluded, which
  prompted the dedicated basename sweep in § 5.2 (**322 references**).

### 1.4 — Mechanism C: segment-assembled paths

```fish
git grep -I -n -E '["'\'']( artifacts|prompts|tools|scripts|templates|site|spotify|fish|episodes|ToldStraight-Ep0[123]|cast)["'\'']' -- pipeline/ scripts/ tools/ fish/ infra/ .github/
```

Nine hits, of which **three are real and invisible to mechanism A** because the literal
slash-bearing path never appears in the source:

| File | Line | Source text | Why A missed it |
| --- | --- | --- | --- |
| `pipeline/core/cast.py` | 19 | `CAST_PATH = REPO_ROOT / "episodes" / "cast.json"` | segments, no slash |
| `pipeline/core/episode.py` | 45–48 | `… / "episodes" / "ToldStraight-Ep01" / "transcript.md"` | segments, no slash |
| `scripts/check_brand_fonts.py` | 157 | `parts[:2] == ("tools", "brand")` | tuple, not a path |

That third row is the finding in § 0.2. **A slash-based grep can never see it**, and it is
the second of two guards on the same decision — so the reference that *was* found does not
account for the behaviour.

### 1.5 — Verification by a different mechanism, applied to my own numbers

Every headline count below was produced one way and confirmed another.

| Claim | Produced by | Confirmed by | Result |
| --- | --- | --- | --- |
| 22 governance lines | this session's `grep -n -E` | D5 § 6.4's independent count | **agree, 22** |
| 23 byte-identical `prompts/` duplicates | git blob SHA comparison | D5 R-DEL-1's assertion | **agree, 23** |
| 4 unique `prompts/` files | same SHA pass | R-ARCH-4 + R-TOOL-2 expect 4 | **agree, 4** |
| 3 divergent portrait pairs | blob SHA at `08c537e` | D5 § 4.1 at `a15f075` | **agree, 6 files / 6 SHAs** |
| Font gate resolves 15 files | running `resolve_targets()` | simulated post-move rerun | **15 → 2, § 4.2** |
| ADR-0021 rename population | file-name pattern count | measured at three commits | **disagrees with D3, § 9.3** |

My own first duplicate-check returned **0** identical pairs. It was wrong — a key-construction
bug compared `foo.md` against `specs/foo.md`. It was caught because an earlier, independent
basename sweep had already listed the same filename under both trees. Recorded because the
brief asks for the method to be judgeable, and a method that never reports its own misfires
is not.

### 1.6 — What this map still cannot see

Stated so the gate is not mistaken for a proof:

- **Untracked working files.** `artifacts/walkthroughs/` (31), `brand-wip/`, and the four
  `.ai` sources are on disk only. They were counted, not grepped.
- **Project files that live outside the repository.** This was an actual miss, not a
  hypothetical one: the two episode video masters in `~/ToldStraight-Ep0{1,2}/` were
  absent from every count in this document's first revision because the search was scoped
  to the repository. Corrected in § 10.1. **A repo-scoped search cannot answer a question
  about a deliverable that has never been committed** — and "it was never committed" is
  precisely what makes a file worth finding.
- **Anything outside this repository and the memory directory** — GitHub issue and PR
  bodies, Project board notes, and the maintainer's own notes. § 9.4.
- **Line numbers age.** Proven: the closure command sits at `AGENTS.md` line **228** at
  both `0a8e88c` and `a15f075`, and at line **232** at `08c537e`. D4 § 4 and D5 § 6.4 both
  cite 228 and are already stale. This map therefore anchors on **content**, and gives the
  regeneration command instead of freezing 1,500 line numbers into a document D7 will read
  days from now (§ 5.4).

---

## 2. Baseline drift since D5, and what it proves

```fish
git ls-tree -r --name-only origin/main | wc -l        # 345
git ls-tree -r --name-only a15f075     | wc -l        # 338  (D5's baseline)
git diff --name-status a15f075 origin/main
```

Seven files added. Every one matches an existing D5 § 5.3 rule:

| Added file | Rule that absorbs it | New rule needed? |
| --- | --- | --- |
| `brand/fonts-manifest.json` | R-BRAND-5 | no — R-BRAND-5 was added for exactly this |
| `scripts/check_brand_fonts.py` | R-TOOL-1 | no |
| `scripts/generate_fonts_manifest.py` | R-TOOL-1 | no |
| `scripts/closure-pass.fish` | R-TOOL-1 | no |
| `docs/…-d4-decision-record.md` | R-DOC-2 | no |
| `docs/…-d5-revised-structure.md` | R-DOC-2 | no |
| `docs/adr/0022-…md` | R-DOC-5 (unchanged) | no |

**Zero rules added.** D5 § 0.3 predicted this would recur and asked to be judged on it;
on this cycle the rule set held. That is evidence for the rule-driven design over a
row-per-file table, and it is the reason § 5.4 declines to freeze a line-level manifest.

Tracked non-dot top-level directories at `08c537e`: **14** — unchanged, so D5 § 3's
`14 → 9` headline still holds.

---

## 3. The reference inventory, classified by the fate of the containing file

The obligation to fix a reference depends on what happens to the file holding it. A
reference inside one of the 23 duplicate specs that R-DEL-1 deletes costs nothing.

| Fate of the containing file | References | Files | Obligation |
| --- | ---: | ---: | --- |
| **STAYS PUT** | **257** | **37** | Must be updated. Highest priority — § 4 and § 5.1 |
| Moves, stays tracked | 880 | 79 | Update with the move, same PR |
| Moves to a gitignored path | 0 | 0 | — (all `artifacts/` hits are in the tracked carve-outs) |
| Deleted by R-DEL-1 | 365 | 23 | **No work** — the file goes away |
| **Total** | **1,502** | **139** | |

The 365 free references are worth stating plainly: **roughly a quarter of the raw hit
count evaporates** when the duplicate specs are deleted, and any estimate built on the
1,502 figure overstates the work by that much.

Of the 257 in files that stay put, `CHANGELOG.md` alone holds **132** — see § 9.2, which
argues they should not be touched at all.

---

## 4. Machine-read references — enumerated individually

These are the references a program consumes. They are enumerated one by one because this
is where completeness matters most and where a miss does not announce itself.

**Failure mode is the column that matters.** *Silent* means the reference stops matching
and the surrounding check reports success. *Loud* means something crashes, fails a gate, or
refuses to run. A loud break is a scheduling nuisance; a silent break is a gate that has
stopped protecting the repository while still printing green.

### 4.1 — Silent failures: thirteen places that will report success while doing nothing

| # | File | Line | Reference | D7 stage | Effect after the move |
| --- | --- | ---: | --- | :---: | --- |
| S1 | `.github/workflows/deploy-site.yml` | 28 | `paths: - "site/**"` | 3 | **The production deploy stops triggering.** No push under `website/**` ever runs the workflow again |
| S2 | `scripts/check_brand_fonts.py` | 157 | `parts[:2] == ("tools", "brand")` | 2 + 4 | Every `.jsx` builder is discarded; gate exits 0 |
| S3 | `scripts/check_brand_fonts.py` | 51 | `DEFAULT_GLOBS = ("tools/brand/**/*.jsx", …)` | 2 + 4 | Glob matches nothing; the `brand/**/*.md` half survives |
| S4 | `scripts/generate_fonts_manifest.py` | 50 | output default `brand/fonts-manifest.json` | 2 + 4 | Regenerates the manifest at the **old** path; the checker then reads a manifest that is never refreshed |
| S5 | `.pre-commit-config.yaml` | 98 | `files: ^(tools/brand/.*\.jsx\|brand/.*\.md)$` | 2 + 4 | Hook stops selecting builders. A `files:` pattern that matches nothing passes |
| S6 | `.pre-commit-config.yaml` | 67 | `exclude: ^prompts/` | 1 | Dead rule; the exclusion it expresses no longer applies to anything |
| S7 | `.markdownlint-cli2.yaml` | 13 | `ignores: - "prompts/**"` | 1 | Dead rule — and see § 10.5 for what stops being ignored |
| S8 | `.markdownlint-cli2.yaml` | 14 | `ignores: - "artifacts/**"` | 1 | Dead rule; 42 spec files become linted |
| S9 | `scripts/closure-pass.fish` | 271 | `git status … -- artifacts/specs artifacts/issues` | 7 + 8 | Prints `no stray files under artifacts/specs or artifacts/issues` forever |
| S10 | `scripts/closure-pass.fish` | 388 | `git diff … -- site/` | 3 | Prints `site deploy not applicable` forever — the deploy is never confirmed again |
| S11 | `AGENTS.md` | 232 | the same `git status … -- artifacts/specs artifacts/issues` command, as instruction | 8 | An agent told to run it gets a false all-clear |
| S12 | `scripts/check` | 38 | `for project in pipeline spotify` guarded by `[[ -f "$project/pyproject.toml" ]]` | 7 | `spotify/`'s locked-environment check silently stops running |
| S13 | `.pre-commit-config.yaml` | 23, 65–66 | comments asserting `artifacts/` is "gitignored scratch [that] never reaches CI" | 1 | Not a break — **the claim is already false**, see § 9.5 |

S9 and S10 deserve a specific note: **both already print `OK` today.** The closure pass
was run in this session and reported `no stray files under artifacts/specs or
artifacts/issues` and `site deploy not applicable (last merge did not touch site/)`. The
post-move failure state is byte-identical to the healthy state, which is what makes it
undetectable by reading the output.

### 4.2 — S2/S3/S4 proven, not asserted

The control, run against `origin/main`:

```fish
python3 scripts/check_brand_fonts.py
# Brand fonts OK: 49 face references across 15 files, all present in the library
# manifest (34 families / 215 faces, 12 exemptions).
```

`resolve_targets([])` returns **15 files — 13 `.jsx` builders and 2 `.md`.**

A simulated post-move tree was then built **in scratch, outside the repository**
(`brand/builders/`, `brand/tokens/`, `tooling/`) and the gate's own resolver re-run:

| Scenario | Files resolved | `.jsx` resolved | Exit |
| --- | ---: | ---: | :---: |
| Control — `origin/main` today | 15 | 13 | 0 |
| A — files moved, script unedited | 2 | **0** | manifest error |
| B — `DEFAULT_GLOBS` also corrected (S3 fixed) | 2 | **0** | — |
| C — `DEFAULT_GLOBS` **and** `MANIFEST_PATH` corrected | 2 | **0** | **0, "Brand fonts OK"** |

In scenario B the corrected glob matches all 13 builders on disk; `resolve_targets()`
then throws all 13 away at line 157. Scenario C is the one that matters:

```text
exit code: 0
Brand fonts OK: 4 face references across 2 files, all present in the library manifest …
```

**Fixing every reference D5 § 6.4 identified leaves the gate green and blind.** Line 157
is the addition this map makes.

S4 compounds it in a different direction: the generator's default output path and the
checker's manifest path are independent constants. Correcting one and not the other gives
a checker reading a manifest that the generator no longer writes — a gate that passes on
stale data rather than on nothing.

### 4.3 — Loud failures: enumerated so they can be sequenced, not discovered

| # | File | Line | Reference | Stage | What breaks |
| --- | --- | ---: | --- | :---: | --- |
| L1 | `.pre-commit-config.yaml` | 31 | large-file exclude for `brand/…-contact-sheet.png` | 2 | 1,229 KB file fails `check-added-large-files` (maxkb 1024) — **blocks the commit** |
| L2 | `.pre-commit-config.yaml` | 32 | large-file exclude `episodes/cast/portraits/.*\.png` | 5 | 5 portraits at 1.0–1.9 MB fail the same gate — **blocks the commit** |
| L3 | `.pre-commit-config.yaml` | 95 | `entry: python3 scripts/check_brand_fonts.py` | 4 | Hook cannot start |
| L4 | `.github/workflows/deploy-site.yml` | 114 | `aws s3 sync site/ "s3://$BUCKET/"` | 3 | Deploy job fails — **only if it triggers**, see S1 |
| L5 | `.github/workflows/deploy-site.yml` | 147 | `cmp … site/index.html` | 3 | Verification step fails |
| L6 | `.github/workflows/label-drift-gate.yml` | 52 | `python3 scripts/sync_labels.py check` | 4 | Required check fails |
| L7 | `.github/workflows/pr-metadata-gate.yml` | 51 | `python3 scripts/check_pr_metadata.py` | 4 | Required check fails |
| L8 | `pipeline/core/cast.py` | 19 | `REPO_ROOT / "episodes" / "cast.json"` | 5 | `load_cast` raises; **covered by `test_cast.py` (7 tests)** |
| L9 | `pipeline/core/episode.py` | 45–48 | `… "episodes" / "ToldStraight-Ep01" / "transcript.md"` | 6 | `parse_turns` raises; **covered by `test_episode.py`** |
| L10 | `scripts/check_brand_fonts.py` | 49 | `MANIFEST_PATH = REPO_ROOT / "brand" / "fonts-manifest.json"` | 2 | Raises with a remediation message — which itself names a stale path |
| L11 | `scripts/preview-site.fish` | 112 | `no site/ directory at $repo_root` guard | 3 | Exits with a clear message |
| L12 | `scripts/preview-site.fish` | 178–204 | `git archive … site/` export | 3 | Cannot build the "before" server |

L1 and L2 are the sequencing constraint that is easiest to trip over: **the brand stage
and the podcast stage cannot make their first commit until the large-file exclude is
updated in that same commit.** Nothing else in the reorg has that property.

L8 and L9 are the good news. The pipeline's two real path couplings are both covered by
tests that read the files for real:

```fish
cd pipeline; uv run pytest -q     # 55 passed in 2.88s
```

For stages 5 and 6, **the existing test suite is a genuine smoke test** — the only place
in the reorg where one exists.

### 4.4 — Not broken, verified

Stated because a map that only lists breakage invites the assumption that everything
matched is broken.

| Thing | Why it survives |
| --- | --- |
| **The S3 bucket layout and the IAM policy** | `aws s3 sync site/ "s3://$BUCKET/"` targets the bucket **root**; the role's resources are `arn:aws:s3:::toldstraight-site-${AWS::AccountId}` and `/*` with **no key prefix**. Renaming the local directory changes no object key and needs no AWS-side change |
| `pipeline/core/naming.py:38` `EPISODES_DIR = OUTPUT_DIR / "episodes"` | This is `output/episodes/`. `output/` does not move. A naive grep for `episodes` flags it; it is a **false positive** |
| `pipeline/core/episode.py:43` `EPISODE_SLUG = "ToldStraight-Ep01-v2"` | Names a directory under `output/`, not the tracked `episodes/` tree. **False positive** |
| `check_brand_fonts.py:48` `REPO_ROOT = Path(__file__).resolve().parent.parent` | `scripts/` → `tooling/` preserves depth, so the root still resolves |
| `check_brand_fonts.py:158` `parts[:1] == ("brand",)` | Still true for `brand/tokens/*.md` |
| `.github/CODEOWNERS`, `pull_request_template.md`, `ISSUE_TEMPLATE/*` | Swept, **`(no output)`** — no moving-path references |
| `.claude/**`, `.vscode/**` tracked config | Swept, **`(no output)`** |
| Raw GitHub URLs into this repo | Swept for `blob\|raw\|tree` links, **`(no output)`** |
| `pipeline/pyproject.toml` | Its one hit is a comment about the `spotify/` subproject; packaging references nothing that moves. Q1's "do not move `pipeline/`" holds |

### 4.5 — `.gitignore`: five lines out, three in

Removals (all in the block at lines 108–118):

| Line | Content | Action |
| ---: | --- | --- |
| 113 | `artifacts/*` | remove |
| 114 | `!artifacts/specs/` | remove |
| 115 | `!artifacts/issues/` | remove |
| 117 | `artifacts/walkthroughs/` | remove |
| 118 | `artifacts/session-handoffs/` | remove |

Additions — measured as **not ignored today**, so without them the new scratch zones
appear as untracked noise and are one `git add -A` away from being committed:

```fish
git check-ignore -q .local/x     ; echo $status   # 1 = NOT ignored
git check-ignore -q brand/wip/x  ; echo $status   # 1 = NOT ignored
git check-ignore -q output/x     ; echo $status   # 0 = already ignored
git check-ignore -q data/x       ; echo $status   # 0 = already ignored
```

Add `.local/`, `brand/wip/` (43 MB), and `archive/spotify-2022/data/`. D5 § 6.2 requires
this in the same commit as the `artifacts/` retirement; that is stage 7.

---

## 5. Prose and documentation references

### 5.1 — In files that stay put

257 references across 37 files. Per file, from mechanism A:

| Count | File | Disposition |
| ---: | --- | --- |
| 132 | `CHANGELOG.md` | **Do not rewrite** — § 9.2 |
| 18 | `AGENTS.md` | Stage 8 (one is S11) |
| 10 | `.github/workflows/deploy-site.yml` | Stage 3 (§ 4) |
| 8 | `.gitignore` | Stage 7 (§ 4.5) |
| 8 | `.pre-commit-config.yaml` | Stages 1/2/4/5 (§ 4) |
| 7 | `docs/adr/0020-post-merge-site-deploy-is-pre-authorised.md` | **Do not rewrite** — § 9.2 |
| 6 | `README.md` | Stage 8 |
| 5 | `brand/20260801-toldstraight-approved-card-standard.md` | Stage 2 |
| 5 | `brand/social-icons/README.md` | Stage 2 |
| 5 | `docs/adr/0018-cast-card-portrait-standard.md` | **Do not rewrite** |
| 4 | `CLAUDE.md` | Stage 8 |
| 4 | `ROADMAP.md` | Stage 8 |
| 4 | `docs/adr/0021-timestamp-prefix-is-mandatory-and-second-granular.md` | **Do not rewrite** |
| 4 | `infra/github-oidc.yaml` | Stage 3 — comments only, policy unaffected (§ 4.4) |
| 3 | `.markdownlint-cli2.yaml` | Stage 1 (§ 4) |
| 3 | `docs/adr/0019-…`, 3 `docs/adr/0022-…` | **Do not rewrite** |
| 3 | `pipeline/core/cast.py` | Stage 5 — line 19 real, rest docstrings |
| 3 | `pipeline/tests/test_cast.py` | Stage 5 — comments |
| 2 | `brand/20260727-toldstraight-design-tokens.css` | Stage 2 |
| 2 | `pipeline/core/screentest.py` | Stage 5 — comments |
| 2 | `.github/workflows/label-drift-gate.yml` | Stage 4 |
| 1 each | `.github/dependabot.yml`, `.github/labels.json`, `.github/workflows/pr-metadata-gate.yml`, `CONTRIBUTING.md`, `brand/fonts-manifest.json`, `docs/adr/0014-…`, `docs/adr/0016-…`, `docs/adr/README.md`, `episodes/EPISODE-COMPLETENESS.md`, `infra/README.md`, `infra/site.yaml`, `pipeline/core/client.py`, `pipeline/core/episode.py`, `pipeline/core/naming.py`, `pipeline/pyproject.toml` | assigned in § 7 |

`brand/fonts-manifest.json` line 2 is a generated `$comment` naming
`scripts/generate_fonts_manifest.py`. It is corrected by **regenerating**, not editing —
the file's own header forbids hand-editing.

### 5.2 — The `docs/*.md` class, which mechanism A could not see

All **25** root-level `docs/*.md` files move into `guides/`, `reports/` or `reference/`
under R-DOC-1/2/3. Sweeping by basename:

```fish
git ls-tree --name-only origin/main -- docs/ | grep '\.md$'   # 25
# then, per basename:  git grep -I -n -F "<basename>" -- .
```

**322 references**, of which 47 are in `CHANGELOG.md` and 23+23, 18+18, 8+8, 7+7, 6+6 are
matched pairs across `prompts/` and `artifacts/specs/` — i.e. **roughly a third sit in the
23 files R-DEL-1 deletes.**

### 5.3 — Relative links, mechanism B

112 relative links; **35 point at a moving target**. The heaviest are the D-series
documents citing each other (`d1`, `d2`, `d3`, `d4`, `d5` — 14 links between them) and the
AWS/runbook guides (`docs/aws-identity-center-roles.md` ×3,
`docs/site-deploy-walkthrough.md` ×2, `docs/runbook.md` ×2). Two point into episodes:
`episodes/ToldStraight-Ep01/transcript.md` and `…/show-notes.md`.

### 5.4 — Why this map does not freeze 1,500 line numbers

Deliberate, and it is the one place this document declines a literal reading of #183's
"with file and line."

The closure command sits at `AGENTS.md` line **228** at `0a8e88c` and `a15f075`, and line
**232** at `08c537e`. D4 § 4 and D5 § 6.4 both cite 228; both are stale after a single PR
that did not touch that line. Freezing 1,500 line numbers into a document D7 reads days
later reproduces exactly the staleness failure D3 caught in D1 and D5 caught in D2.

So: **every machine-read reference is enumerated with its line in § 4** (78 of them —
these must be hand-edited and are worth pinning), and prose references are given as exact
per-file counts plus the command that regenerates the line list at execution time. The
counts are verifiable now; the lines are correct whenever D7 runs.

```fish
git grep -I -n -E '(^|[^A-Za-z0-9_./-])(artifacts|prompts|tools|scripts|templates|site|spotify|fish)/|episodes/ToldStraight-Ep|episodes/cast|data/spotify' -- .
```

If a stage's file count does not match the § 5.1 table when D7 runs it, the tree moved
again — which § 2 says to expect.

---

## 6. Machine-local memory — outside the repository, invisible to every check

`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — 22 files. No CI check can
see these, and no fresh clone or cloud session ever loads them.

```fish
grep -rn -E '(^|[^A-Za-z0-9_./-])(artifacts|prompts|tools|scripts|templates|site|spotify|fish)/|episodes/ToldStraight-Ep|episodes/cast|docs/[a-z0-9-]+\.md' ~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/
```

**12 lines across 7 files.** Assigned to stage 8; #184's last acceptance box already
covers them.

| File | Line | Path named | Becomes |
| --- | ---: | --- | --- |
| `episode-artwork-build-workflow.md` | 3 | `tools/brand/` (in the `description:` frontmatter) | `brand/builders/` |
| `episode-artwork-build-workflow.md` | 18 | `tools/brand/` | `brand/builders/` |
| `episode-artwork-build-workflow.md` | 28 | `episodes/ToldStraight-EpNN/` | `episodes/epNN/` |
| `episode-artwork-build-workflow.md` | 62 | `episodes/cast/portraits/` | `podcast/portraits/` |
| `episode-artwork-build-workflow.md` | 69 | `tools/brand/…-cast-personnel-cards-builder.jsx` | `brand/builders/…` |
| `commit-the-source-with-the-approved-art.md` | 19 | `tools/brand/` | `brand/builders/` |
| `commit-the-source-with-the-approved-art.md` | 30 | `episodes/ToldStraight-Ep01/cover.png` | `episodes/ep01/art/cover.png` |
| `episodes-are-drafts-not-published.md` | 15 | `episodes/ToldStraight-Ep0{1,2,3}/` | `episodes/ep0{1,2,3}/` |
| `synthetic-cast-representation-policy.md` | 33 | `episodes/cast/portraits/manifest.json` | `podcast/portraits/manifest.json` |
| `squash-commit-bodies-are-the-permanent-record.md` | 40 | `artifacts/specs/TEMPLATE.md` | `docs/specs/TEMPLATE.md` |
| `experiment-a-direct-executor-workflow.md` | 41 | `prompts/` as a commit target | `archive/prompts-pm-era/` — and the instruction itself is retired |
| `MEMORY.md` | 6 | `artifacts/drafts/20260730-issue-94/…` | `.local/sessions/drafts/…` **(gitignored — see below)** |
| `MEMORY.md` | 11 | `tools/brand/` in the index hook | `brand/builders/` |

Two need judgement rather than a substitution, and are flagged rather than fixed:

- **`MEMORY.md` line 6** points at a *draft* that becomes gitignored scratch under
  R-SCR-1. A memory citing a path no clone can reach is a dead citation whichever path it
  names. Recommend rewriting it to cite the executed outcome, not the draft.
- **`experiment-a-direct-executor-workflow.md` line 41** instructs an agent to commit a
  seed to `prompts/`. After Q10 that directory is retired and the PM-era seeds are
  archived. The line is not a stale path — it is a **stale instruction**, and editing the
  path would preserve a workflow the reorg retires.

---

## 7. Stage assignment

Issue [#184](https://github.com/Jared-Godar/audio-lab/issues/184) proposes eight stages and
invites D6 to revise. **Two revisions are recommended**; the rest of the order stands.

| Stage | #184 scope | References this map assigns | Notes |
| :---: | --- | --- | --- |
| 1 | Docs, specs, prompts, adr | S6, S7, S8, S13; 322 basename refs; 35 links; R-DEL-1 deletes 23 files | **Blocked on § 10.5** — 296 lint violations |
| 2 | Brand, `tools/brand/`, icons | **L1**, L10, S3, S4, plus 12 brand-file refs | L1 must land in the first commit |
| 3 | Site → website | **S1**, S10, L4, L5, L11, L12; 10 workflow refs, 4 OIDC comments, `infra/site.yaml` | Ship last and alone (D5 § 6.3) — but see the revision below |
| 4 | `infra/`, `pipeline/`, `scripts/`, `templates/` | **S2**, S3, S5, L3, L6, L7 | The font gate lives or dies here |
| 5 | Podcast + cast | **L2**, L8; `.pre-commit` line 32; 3 portrait pairs (§ 10.2) | Needs the maintainer's decision first |
| 6 | Episodes | L9 | **Two uncommitted video masters found — § 10.1 / § 10.1.1** |
| 7 | Orphan retirement | S9, S12; `.gitignore` rewrite (§ 4.5) | |
| 8 | Governance rewrite | **S11**; 22 governance lines; 12 memory lines | |

**Revision 1 — `scripts/` cannot move before the font gate is repaired.** Stage 2 moves
`tools/brand/` and stage 4 moves `scripts/`. S2, S3 and S5 all straddle that boundary: the
gate's globs and its `parts[:2]` filter name `tools/brand/`, while the script naming them
lives in `scripts/`. Split across two PRs, the gate is silently green for the interval
between them — and § 4.2 shows that interval is indistinguishable from health. Either move
`tools/brand/` and the two font scripts in one PR, or accept the window and **say so in
both PR bodies**.

**Revision 2 — stage 3's "last and alone" is right, and S1 is why.** The instruction
already in D5 § 6.3 turns out to be load-bearing for a reason it does not state: because
`deploy-site.yml` triggers on `paths: site/**` *and* on changes to itself, a single PR that
renames the directory **and** edits the workflow triggers correctly and runs the corrected
sync. Split into two PRs, the rename PR triggers the old workflow (which fails loudly at
L4), and every push after that silently never deploys. **The one-PR requirement is not
stylistic; it is the difference between one loud failure and permanent silence.**

---

## 8. Gate-1 decision checklist — confirm, do not re-derive

Each of the eleven D4 decisions, where it appears in the D5 tree, and whether this
session could verify it against `origin/main`.

| Q | Decision (D4 § 2) | Where it lands in D5 | Verified this session |
| :---: | --- | --- | --- |
| Q1 | `infra/` and `pipeline/` separate; `tooling/` created; `pipeline/` not moved | D5 § 2 `tooling/`; R-TOOL-1/2; R-KEEP-1 | **Yes** — `pipeline/pyproject.toml` has no moving-path dependency (§ 4.4) |
| Q2 | `adr/` stays at `docs/adr/` | D5 § 2; R-DOC-5 "unchanged" | **Yes** — `docs/adr/**` excluded from every move rule |
| Q3 | Five-way `docs/` split; sorting rule in `docs/README.md` | D5 § 2 `docs/`; R-DOC-1/2/3/4; rule in § 5.2 | **Partly** — the split is specified; **which of the 25 root files goes to which of the three** is not yet assigned (§ 9.6) |
| Q4 | One shared portrait home at `podcast/portraits/` | D5 § 2 `podcast/`; R-POD-1…5 | **Yes, with an open item** — 6 files / 6 distinct SHAs re-measured at `08c537e` (§ 10.2) |
| Q5 | Social brand naming deferred; nothing populated | D5 § 4.6 — `brand/logos/` **not** created; skeleton recorded in `brand/README.md` | **Yes** — no social sub-tree appears anywhere in the D5 tree |
| Q6 | Orphans archived, not deleted | D5 § 2 `archive/`; R-ARCH-1/2/3/4 | **Yes** — `spotify/` (6 files), `fish/` (2), `data/spotify-2022/` all routed to `archive/` |
| Q7 | Delete `output/_post-experiments/`; leave the rest | Executed 2026-08-02, D4 § 3 | **Yes, independently** — on-disk `.mp3` count is **134**, exactly D3's 141 minus the 7 deleted files |
| Q8 | `.local/sessions/` inside the repo | D5 § 2 `.local/`; R-SCR-1 | **Yes** — and `.local/` is **not ignored today**, so `.gitignore` must add it (§ 4.5) |
| Q9 | Episode `TEMPLATE/` advisory, no CI check | D5 § 4.5 — a single `README.md` | **Yes** — no template check appears in `.pre-commit-config.yaml` or any workflow |
| Q10 | Seed template → `tooling/templates/`; 3 PM seeds → `archive/prompts-pm-era/`; other 23 deleted | D5 § 2; R-TOOL-2, R-ARCH-4, R-DEL-1 | **Yes** — blob-SHA pass returns exactly **23 identical, 0 divergent, 4 unique**, and the 4 are precisely those named |
| Q11 | `build/` splits into `build/audio/` and `build/art/` | D5 § 2 and § 4.4; R-EP-4/5 | **Yes** — only `ep03` has a `build/`; the 3 `.py` + `README.md` route to `build/audio/` |

**Ten of eleven confirm cleanly.** Q3 is the exception and is not a disagreement — the
decision is settled, but the per-file assignment it implies has not been made, and D7
cannot execute R-DOC-1/2/3 without it (§ 9.6).

---

## 9. Known-unfixable, deferred, and out-of-scope breakage

Listed explicitly. Silent omission fails this gate.

### 9.1 — Six links already broken today, not caused by the reorg

| File | Line | Dead target |
| --- | ---: | --- |
| `README.md` | 190 | `docs/PM-WORKFLOW.md` |
| `artifacts/specs/20260728-issue-79-…md` | 306 | `0016-favicon-readme-header-and-card-surfaces.md` |
| `artifacts/specs/20260728-issue-79-…md` | 536 | `docs/adr/0015-wordmark-dual-lockup-system.md` |
| `prompts/20260728-issue-79-…md` | 306, 536 | same two (this is a duplicate; R-DEL-1 deletes it) |
| `infra/github-oidc.yaml` | 38 | `?:[A-Za-z0-9-]{0,38}` — a regex the extractor read as a link, **false positive** |

Four real dead links. `README.md:190` is the only one in a file that stays put and is not
deleted. **Recommend folding it into stage 8** rather than filing anything — the brief is
explicit that the issue count should not climb.

### 9.2 — `CHANGELOG.md` and `docs/adr/**` should not be rewritten

**132 references in `CHANGELOG.md` and 27 across nine ADRs** name paths that move. They are
in scope for the sweep and out of scope for editing, for the same reason: both are
historical records of what was true when written. Rewriting `docs/adr/0020` so its account
of the `site/` deploy names `website/` would make the ADR describe a decision that was not
the one taken.

**Recommendation:** leave both untouched; let stage 8's `AGENTS.md`/`CLAUDE.md` rewrite
carry a single sentence noting that entries before the reorg use pre-reorg paths. This is a
recommendation, not a decision — **reversal condition:** if a reader ever follows a
CHANGELOG path and is misled, add a dated note at the top of the file rather than editing
159 lines.

### 9.3 — The ADR-0021 rename pass is larger than planned, and the discrepancy is an error, not drift

D5 § 6.6 states "~84 files are both moved and renamed," inherited from D3 line 308
("**~84 files across two formats**, not the 17 undated ones"). Neither figure reproduces:

| Population measured at `origin/main` | Count |
| --- | ---: |
| Tracked files with a bare `YYYYMMDD-` prefix | **118** |
| Tracked files with a `YYYYMMDDTHHMMSSZ-` prefix | **0** |
| Untracked `artifacts/walkthroughs/` with `T…Z-` | 30 |
| Non-exempt tracked `.md` lacking a 14-digit prefix | **106** (72 dated + 34 undated) |
| Every non-exempt tracked file lacking a 14-digit prefix | 270 |
| Files already carrying the mandated 14-digit prefix | **3** |

Measured at three commits — `0a8e88c`, `a15f075`, `08c537e` — the `.md` figure is
identically **106 = 72 dated + 34 undated**. Because it does not move across commits, the
gap with D3's "84 / 17" is an **error, not drift** — the same distinction D3 drew when it
caught D1's F3, and the third instance of an unre-derived figure carried forward in this
epic.

Two consequences, neither resolvable here:

1. **The rename population is undefined.** ADR 0021 binds "every generated document,
   script, walkthrough and maintainer-requested document," which does not decide whether
   `site/assets/*.css`, `episodes/*/cover.png` or `brand/favicon/*.png` are in scope. The
   answer moves the count between 106 and 270.
2. **Only 3 of 345 tracked files currently comply** with a convention that has been
   mandatory since 2026-08-01. The rename pass is not a tidy-up folded into D7; on the
   narrowest reading it is 106 files, and **227 of the 270 broad-reading candidates are
   both moved and renamed in the same operation** — precisely the case D5 § 6.6 flags as
   where git's rename detection is weakest.

A third consequence is separate from scope and is the one most likely to be got wrong in
execution: **the timestamp for a historical file must be its creation time, not the moment
D7 runs.** Recoverability is measured at § 10.4.1 — it exists for all 118 files.

Surfaced for a decision at § 10.4.

### 9.4 — Outside this repository, and therefore outside this map

Swept and found empty inside the repo; **cannot be swept where they actually live**:

- **GitHub issue and PR bodies.** The M10 issues alone quote paths freely (#176, #181–#185
  all name `artifacts/` or `site/`). Nothing rewrites them, and closed issues are a record
  anyway. Treated like the CHANGELOG: leave them.
- **The project board, and any notes outside git.**
- **`~/ToldStraight-recordings/`** — the intake flow named in project memory. Outside the
  repo, unaffected by the reorg, listed so its absence is not mistaken for an omission.

### 9.5 — A falsehood in `.pre-commit-config.yaml` that D4 § 4 did not catch

D4 § 4 flagged `CLAUDE.md` line 12 for calling `artifacts/` a gitignored zone where
nothing reaches a fresh clone, while 42 files under it are tracked, and corrected it in
that PR. **The identical claim survives in `.pre-commit-config.yaml` lines 65–66:**

```text
# prompts/ holds seed briefs preserved as written (immutable after
# handoff); artifacts/ is gitignored scratch and never reaches CI.
```

`git ls-tree -r --name-only origin/main -- artifacts | wc -l` → **42**. The comment's
stated reason is wrong today, independently of the reorg. Folding the correction into
stage 1 costs nothing; **not** filing a separate issue, per the brief.

### 9.6 — R-DOC-1/2/3 cannot be executed as written

The three rules that split `docs/` are:

| Rule | Source | Destination |
| --- | --- | --- |
| R-DOC-1 | `docs/*.md` — how to do something | `docs/guides/` |
| R-DOC-2 | `docs/*.md` — what was found | `docs/reports/` |
| R-DOC-3 | `docs/*.md` — what is true | `docs/reference/` |

All three have the **same** source pattern and differ only by a human judgement about the
document's kind. D7 is specified to generate its move list by applying rules and to fail
loudly on any unmatched path — but these rules do not *discriminate*, so all 25 root-level
`docs/*.md` files match all three simultaneously.

This is not a defect in the decision (Q3 is sound); it is a gap between the decision and
its executable form. **D7 needs a per-file assignment for 25 files before stage 1 can
run.** It is mechanical and small, and the natural place for it is the first stage-1 PR,
where `docs/README.md` is written anyway. Flagged, not decided.

---

## 10. Open items for the maintainer

Six. None is decided here.

### 10.1 — Is stage 6 reachable, or deferred?

Issue [#184](https://github.com/Jared-Godar/audio-lab/issues/184) makes stage 6 (episodes)
conditional on D8's LFS work landing first.

**CORRECTION, same session — the first measurement here was scoped wrongly.** It searched
the repository only:

```text
tracked .mp4 : 0     on-disk .mp4 *inside the repo* : 0
```

That is literally true and useless for the question, which is *"will episode video need
Git Large File Storage?"* — a question about video that exists whether or not the repo has
seen it. Widened to the machine, on the maintainer's prompt:

```fish
find ~ -maxdepth 6 \( -iname '*.mp4' -o -iname '*.mov' \) -not -path '*/Library/*'
ffprobe -v error -show_entries format=duration,bit_rate -show_streams <file>
```

**Two episode masters exist and have never been committed:**

| File | Size | Duration | Video | Audio |
| --- | ---: | --- | --- | --- |
| `~/ToldStraight-Ep01/told-straight-ep01.mp4` | **12.5 MiB** | 9m34s | h264 1920×1080 @ 2 fps, 1110 frames | AAC mono 44.1 kHz |
| `~/ToldStraight-Ep02/told-straight-ep02.mp4` | **15.7 MiB** | 12m23s | h264 1920×1080 @ 2 fps, 1395 frames | AAC mono 44.1 kHz |

No `~/ToldStraight-Ep03/` directory exists, so Ep03 has no video master. The 2 fps frame
rate confirms these are chapter-card slideshows over the episode audio — the files
uploaded to YouTube.

**This is the same failure this document spends § 1 and § 9.3 documenting in D1 and D2:**
a figure asserted once (D3 § 2.10's "zero `.mp4` files"), carried into D4 § 5, and
re-measured here inside the same too-narrow frame instead of being re-derived against the
question it was answering. Recorded rather than quietly fixed.

**The conclusion survives, for a better reason.** The largest master is **15.7 MiB** —
below GitHub's 50 MB warning threshold and far below its 100 MB hard limit. Git Large File
Storage is unnecessary at this size, which is now a measurement rather than an absence of
evidence. The `~86 MB` premise in #185 is wrong by a factor of five.

**Three options, and this is yours:**

1. **Run D8 now on these numbers** and close it recording "no large-file storage needed at
   15.7 MiB", then unblock stage 6. *(Recommended — it is option 2 plus the bookkeeping
   that closes an issue honestly instead of leaving it open and assumed unresolved.)*
2. **Unblock stage 6 from D8 immediately**, re-gating only if a master ever exceeds 50 MB.
3. **Keep the block.** D8 now has real numbers, so the block no longer has anything to
   learn.

**Reversal condition:** if any episode master exceeds 50 MB, large-file storage returns to
the table.

### 10.1.1 — Two episode masters are uncommitted, and `.gitignore` hides them silently

Separate from the sizing question, and the more urgent finding.

```fish
git rev-list --objects --all | grep -iE '\.(mp4|mov|m4v)$'   # (no output)
```

No video object has ever existed in this repository, on any branch. The cause is
`.gitignore` lines 60–62:

```text
# Video (edge-tts / yt-dlp / quick-cut byproducts)
*.mp4
*.mov
```

The rule was written to exclude **throwaway tooling byproducts**; it also excludes the
finished episode masters, and `git add` skips them without a word. That is the same defect
class as § 4.1 — a rule whose stated purpose does not match what it actually catches.

Also present only in `~/ToldStraight-Ep0{1,2}/` and never committed: `narration/` (both),
`record-host-ep01.txt`, `record-guest-ep01.txt`, `transcript-markup.txt`,
`episode-copy.txt`, `youtube-description.txt`, and Ep02's `session-one-skills.mp3`.
`transcript.md` and `show-notes.md` **differ** between the home directory and the repo, so
the home copy is not simply a superset — it is an older fork for text and the sole holder
of the video.

**Backup status: unverified.** `tmutil isexcluded` reports both masters `[Included]`, the
Time Machine drive is mounted and hourly backups are running. The backup contents could
not be read from an agent shell to confirm a copy exists, so this is **relayed, not
verified**. Confirm through Finder → Time Machine menu → *Browse Time Machine Backups*.

**Options, and this is yours** — `audio-lab` is public, so committing is outward-facing and
permanent:

1. **Leave the bytes out of git; make their absence detectable.** Add a tracked
   `episodes/MASTERS.md` recording each master's SHA-256, size, duration, codec and
   YouTube URL, and correct the `.gitignore` comment. *(Recommended — no public exposure,
   no history weight, and a missing master becomes detectable instead of silent. Does not
   foreclose the others.)*
2. **Commit them normally** with a `.gitignore` negation. 28 MB permanent in public
   history, removable only by rewriting history.
3. **Commit via Git Large File Storage.** The intended mechanism, but still public, and it
   adds a dependency to every clone for two files that fit comfortably without it.

**Reversal condition for option 1:** if a master is ever lost, option 1 was insufficient
and option 3 follows immediately.

### 10.2 — The three cast-portrait pairs

D5 § 4.1's measurement re-verified at `08c537e` — three subjects, six files, six distinct
blob SHAs, no pair byte-identical. Presented as pairs; **the choice is yours and cannot be
inferred from the filesystem.**

| Subject | Per-episode rendition | Shared-portrait rendition |
| --- | --- | --- |
| Michael Voss | `episodes/ToldStraight-Ep02/cast/guest_michael_voss.png` — `a95883f2` | `episodes/cast/portraits/20260729-gemini-nano-banana-2-michael-voss-ep02-expert-cast-portrait-1x1.png` — `f73b4fc6` |
| Des Fable | `episodes/ToldStraight-Ep02/cast/host_des_fable.png` — `3f2a1d00` | `…-des-fable-ep02-host-cast-portrait-1x1.png` — `f86fd256` |
| Anna Sinclair | `episodes/ToldStraight-Ep03/cast/clinician_anna_sinclair.png` — `fdea981e` | `…-anna-sinclair-ep03-clinician-cast-portrait-1x1.png` — `e52f2181` |

Two shared portraits have no per-episode counterpart and need no decision: `jared-godar`
(`38ec5279`) and `owen-ep01-expert` (`61ae80f4`).

The fourth per-episode file, `studio_disclaimer.png` (`f2cba80d`), is a disclaimer plate,
not a portrait — R-POD-4 routes it to `podcast/artwork/` with no decision needed.

### 10.3 — Two defects in `scripts/closure-pass.fish`, reported and not fixed

Both were confirmed by running the script and then diagnosed by a separate controlled test.
**Neither is caused by the reorg**, and per the brief nothing was changed.

**Defect 1 — the remote-branch remedy names `origin` as a branch.** Observed output:

```text
FAIL  2 merged branch(es) still on origin
        origin
        dns-site-cutover
        delete with: git push origin --delete origin dns-site-cutover
```

Root cause, measured:

```text
git for-each-ref --format='%(refname)  ->  %(refname:short)' refs/remotes/origin/
refs/remotes/origin/HEAD  ->  origin
```

Git shortens `refs/remotes/origin/HEAD` to `origin`, so `string replace 'origin/' ''`
leaves it as `origin`, and the guard at line 216 — which tests `$short = HEAD` — never
fires. `origin` enters the stale list and the printed command would attempt to delete a
remote branch literally named `origin`. **Pasting that command is the risk**, since the
script is designed to be pasted from.

**Defect 2 — `git cherry` cannot see a multi-commit squash merge.** Tested in a throwaway
repository, control and negative:

```text
single-commit branch, squash-merged:  git cherry -> "- <sha>"      => reads as MERGED
two-commit branch,   squash-merged:  git cherry -> "+ <sha>" ×2   => reads as NOT MERGED
```

A squash merge produces one commit whose patch is the sum of the branch's commits, so no
individual patch-id matches when N > 1. The error direction is **safe** — it over-reports
outstanding work rather than under-reporting it — but it contradicts the script's own
comment at lines 101–103, which claims `git cherry` "is what makes a squash-merged branch
detectable at all." True only for single-commit branches.

Both are small and neither blocks the reorg. Folding them into an existing issue is the
brief's stated preference; **say which one** and they go in with stage 7 or 8.

### 10.4 — Define the ADR-0021 rename scope

§ 9.3 measures the population at between **106 and 270 files** depending on whether the
convention binds only documents and scripts or every non-exempt tracked file, and shows
D3's "~84" is unreproducible. D7 cannot size or sequence the rename pass without the
answer, and **227 files would be moved and renamed in the same operation** on the broad
reading — the case D5 § 6.6 identifies as most likely to lose `git log --follow`.

Recommend the narrow reading (**106 non-exempt `.md`**), because ADR 0021's own wording
binds "documents, scripts, walkthroughs" and images are covered by a separate convention.
**Reversal condition:** if a reader ever cannot date a `.png` or `.css` from its name,
widen it.

#### 10.4.1 — Where a historical file's timestamp comes from: creation, never "now"

ADR 0021 is explicit that the token "stamps **creation**, and does not change when the
file is edited." A rename pass that calls `date "+%Y%m%d%H%M%S"` per file would stamp
every document in the tree with the moment D7 ran, destroying the one thing the convention
exists to record and making 270 files sort as if they were written in the same minute.
**That is the opposite of the decision and must not happen.**

The creation time is recoverable from git for **every** affected file — measured, not
assumed:

```fish
git log --diff-filter=A --follow --format='%ad' --date=format:'%Y%m%d%H%M%S' -- <path> | tail -1
```

Run across all 118 bare-`YYYYMMDD-` files:

| Result | Count |
| --- | ---: |
| Filename date **agrees** with the git add-commit date | **85** |
| Filename date **differs** from the git add-commit date | 33 |
| No add commit found (unrecoverable) | **0** |

So the missing `HHmmss` exists for 100% of them, and for 85 it simply extends the date
already in the name. The 33 disagreements are all small and run in **both** directions —
`20260726-issue-38-m2-screen-test.md` was added at `20260727021033` (authored late,
committed after midnight), while `20260728-issue-68-artifacts-promotion.md` was added at
`20260727222412` (post-dated by its author).

Those 33 need a stated tiebreak, and it is a maintainer decision because the two candidate
rules disagree about what "creation" means:

1. **Use the git add-commit timestamp verbatim.** Every value is a measured fact and no
   digit is invented — but 33 files change the date component of their current name.
   *(Recommended: it is the only option where every character of every filename is
   evidence.)*
2. **Keep the filename's date, take only `HHmmss` from the commit.** Preserves the
   author's stated date — but for those 33 it fabricates a time on a day when the file
   demonstrably did not yet exist in git.

**Reversal condition for option 1:** if a renamed file's new date ever contradicts a date
written *inside* the document, prefer the document and record the exception.

For the 30 untracked `artifacts/walkthroughs/` files carrying the `T…Z` format, git has no
record at all — their existing prefix already contains the creation time and should be
**reformatted, not re-derived** (`20260726T203642Z-` → `20260726203642-`). One of the 31
lacks a `T…Z` prefix and needs the maintainer's eye.

### 10.5 — Stage 1 blocks on a lint decision

Simulated at the destination path, with the repository's own rule config and the
`prompts/**` and `artifacts/**` ignores no longer matching:

```text
Linting: 45 files
Summary: 296 issues in 37 files
```

Top rules: `MD060/table-column-style` 84, `MD034/no-bare-urls` 42,
`MD040/fenced-code-language` 37, `MD032/blanks-around-lists` 25,
`MD018/no-missing-space-atx` 20.

The specs are declared immutable after handoff — the very reason for the ignore. Fixing
296 violations edits 35 immutable specs; not fixing them means stage 1 cannot go green,
and #184 says to stop rather than disable a check.

1. **Carry the ignore forward as `docs/specs/**`** — preserves immutability, keeps the
   files unlinted, one-line change. *(Recommended.)*
2. **Fix all 296** — breaks the immutability convention across 35 files.
3. **Lint only specs written after the reorg**, grandfathering the existing 42.

**Reversal condition for option 1:** if `docs/specs/` ever holds a document that is edited
rather than archived, it has stopped being immutable and should be linted.

---

## 11. Provenance

- **Baseline:** `origin/main` at `08c537e`, 345 tracked files, measured 2026-08-02.
  Working tree clean; nothing moved, renamed or deleted.
- **Mechanism A** (prefix grep), **B** (link resolution), **C** (segment assembly) — all
  three commands given inline in § 1 and re-runnable.
- **Font-gate control and negative** (§ 4.2): `resolve_targets()` executed against
  `origin/main` and against a simulated tree built in a scratch directory outside the
  repository. The repository was not modified.
- **Lint prediction** (§ 10.5): `markdownlint-cli2 v0.23.2` against copies at their
  destination paths in scratch, using the repository's rule config with the two retired
  ignores commented out.
- **Closure-pass defects** (§ 10.3): observed by running `scripts/closure-pass.fish` in
  this worktree; root causes confirmed by `git for-each-ref` and by a control/negative
  squash-merge test in a throwaway repository.
- **Test baseline:** `cd pipeline; uv run pytest -q` → **55 passed in 2.88s**.
- **Prior deliverables:** D3 `20260801225106-…-d3-assessment-report.md`, D4
  `20260802001735-…-d4-decision-record.md`, D5 `20260802001736-…-d5-revised-structure.md`,
  [ADR 0022](adr/0022-approved-target-file-structure.md). D1 and D2 superseded, not cited.
</content>
