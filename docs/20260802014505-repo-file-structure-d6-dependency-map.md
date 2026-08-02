# Repo file-structure — D6 dependency, link and path map

**Issue:** [#183](https://github.com/Jared-Godar/audio-lab/issues/183) (D6 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-02
· **Status:** approval gate 2 — **closed.** The tree was reviewed with the maintainer and
approved on 2026-08-02, and every open item in § 10 was decided in the same session.
**No file has been moved, renamed or deleted; the reorganisation has not started.**

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
stated convention. **Decided 2026-08-02:** the exemption is carried forward to the new
path rather than editing 35 handed-off records (§ 10.6).

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
| 6 | Episodes | L9 | **Unblocked** — #185 closed, masters now tracked (§ 10.1, § 10.2) |
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

## 8.1 — The tree review that #176 asked for, and had not happened

[#176](https://github.com/Jared-Godar/audio-lab/issues/176) specifies gate 1 as a
**"Q&A round with the maintainer."** What happened instead was a document containing eleven
questions, which he answered in one instruction, and the structure itself was never put in
front of him as a structure. On discovering this, he made the distinction plainly: something buried in a 446-line
document is easy to miss, but an interactive round of viewing, commenting, reviewing and
approving the proposed tree is not — and that round was what he had asked for in his very
first message describing the work.

That round was run on 2026-08-02. The proposed tree was presented against the tree he drew
in #176, with every departure named. **All six departures approved**, plus one reversal:

| # | His sketch | Proposal | Outcome |
| --- | --- | --- | --- |
| 1 | `.configurations/` wrapping the dotfolders | left at root | **approved** — not implementable, tools read them only at root |
| 2 | `infrastructure/` holding core, pipeline, scripts, templates, tests | split into `infra/`, `pipeline/`, `tooling/` | **approved** — moving `pipeline/` breaks packaging, the CLI entry point and every import |
| 3 | `adr` at top level | stays `docs/adr/` | **approved** |
| 4 | `docs/` split two ways | split five ways | **approved** |
| 5 | a detailed `brand/` tree — graphic standards, digital, print, per-platform social | **built none of it** | **REVERSED — build it all** |
| 6 | `episode-x` at top level with `final.mp3` / `final.mp4` | nested, audio ignored | **approved**, with masters at the episode root keeping descriptive names |

**Departure 5 is a reversal of a gate-1 decision.** Q5 deferred the social and brand
sub-structure until content forced it; the maintainer overruled that: **build it as drawn, with placeholder files even where the
folders are empty.** His reasoning was that when he eventually has the assets to put in
them, he wants a predetermined destination rather than having them filed wherever seemed
reasonable at the time — which is how the structure got muddied in the first place.

The reasoning is the reversal condition Q5 itself carried, arriving earlier than expected:
a deferred structure means the next asset is filed ad hoc, which is the mechanism that
produced the current mess. **32 directories are built**, each carrying a `README.md` naming
what belongs in it — git cannot track an empty directory, and a README that states the
destination is more use than an empty placeholder file.

Two mechanical departures from his sketch inside that build, both disclosed: `social media`
and `color templates` are hyphenated, because a space in a path breaks every shell command
that touches it, and `scripts to build them` is `scripts/`.

**One question in his sketch is still his, and is not answered here:** *"(open: additional
folders for video? or 'media' instead of 'images' for both)"*. `images/` is built as drawn.

**Where existing brand content lands inside that structure is not decided** and was not
guessed at — `brand/favicon/` (10 files), `brand/social-icons/` (7), `brand/web/` (5), the
four loose files at `brand/` root, and the 14 builders in `tools/brand/`. The design-tokens
stylesheet spans both `fonts/` and `color-templates/`, and the sketch places build scripts
only under `social-media/` while these builders produce episode art, favicons and wordmarks.
Both need his call; `brand/README.md` carries the list.

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

## 10. Decisions — all resolved by the maintainer, 2026-08-02

This section previously listed six open items. **Every one was decided in-thread on
2026-08-02, in the same session that produced this document.** They are recorded here as
decisions with their reasoning, not as a menu.

### 10.1 — Episode video and audio masters are tracked in the repository

**Decided: track them.** Maintainer, verbatim:

**Decision:** the finished video and audio masters are tracked. They are published to the
world on a feed and on YouTube; keeping them out of the repository protected nothing.

Both YouTube masters existed on disk and had never been committed on any branch:

| File | Size | Duration | Format |
| --- | ---: | --- | --- |
| `told-straight-ep01.mp4` | 12.5 MB | 9m34s | H.264 1920×1080 @ 2 fps + AAC mono |
| `told-straight-ep02.mp4` | 15.7 MB | 12m23s | H.264 1920×1080 @ 2 fps + AAC mono |

Ep03 has no master. The audio masters they were built from are tracked too — durations
match exactly (574.33s, 742.88s). The cause of their absence was a blanket `*.mp4` /
`*.mp3` ignore rule commented as covering tooling byproducts, which also swallowed the
finished work; `git add` skips an ignored path silently, so it never surfaced.

**This was never actually an open question.** [#176](https://github.com/Jared-Godar/audio-lab/issues/176)
lists it under *"Decisions already made … these are inputs, not open questions"*:
*"Audio in git — Track final `mp3`/`mp4` only. Stems and assembled stay ignored."* It was
settled before the epic opened and simply not implemented for ten days.

### 10.2 — No large-file storage system; the threshold is 75 MB

**Decided: the problem does not exist.** Maintainer, verbatim:

**Decision:** there is no large-file problem to settle. The largest master is 15.7 MB against
GitHub's 50 MB warning and 100 MB limit. Raise it only if a file passes 75 MB.

[#185](https://github.com/Jared-Godar/audio-lab/issues/185) is closed as not a real
problem. It was opened against an assumed ~86 MB episode; the real figure is a fifth of
that. The threshold now lives as a note in `.gitignore` rather than as an open issue, and
**the episodes stage is no longer blocked** — that dependency in
[#184](https://github.com/Jared-Godar/audio-lab/issues/184) is struck.

Recorded because it caused a second failure: the term "Git LFS" originated in
agent-authored issue text, was never the maintainer's, and was then quoted back to him as
though it were his instruction.

### 10.3 — CORRECTION: the cast portraits were never an open question

**This section previously asked the maintainer to adjudicate three portrait pairs. That
request was wrong and should never have been made.** The answer was already recorded in
two places in this repository:

- `episodes/cast/portraits/manifest.json` marks all four synthetic looks
  **"LOCKED — maintainer-approved 2026-07-31."**
- [ADR 0018](adr/0018-cast-card-portrait-standard.md) records that the per-episode files
  (`host_des_fable.png`, `guest_michael_voss.png`, `clinician_anna_sinclair.png`) are
  **cast personnel cards re-rendered from those portraits** — a derived deliverable, not a
  competing rendition of the same image.

So the premise inherited from D5 § 4.1 — "different bytes, same three people, one is
authoritative" — was false. They are different artifacts with different purposes and
**both survive**. Six distinct content fingerprints is what you would expect, not evidence
of a conflict.

Maintainer, on being asked anyway:

**Decision:** the approved portrait stands. A decision already recorded is not reopened; if it
changes, the maintainer says so.

**What was real:** the Gemini export badge removal is half-finished. Cleaned versions
existed for only two of five portraits, sitting untracked in `~/Downloads/`. Those two
(Des Fable, Owen) are now committed; the other three keep the badge until a removal pass
runs, which the maintainer has deferred. All five remain approved and locked.

### 10.4 — Both closure-pass defects fixed

**Decided: fix both now.** Both were pre-existing, neither caused by the reorganisation,
and both were found by running the script.

- `git cherry` cannot see a squash merge that collapsed more than one commit. Verified
  with a control and a negative: a 1-commit squash-merged branch reported merged, an
  otherwise identical 2-commit branch reported unmerged. Most branches here carry more
  than one commit, so the check was failing on the common case while its own comment
  claimed the opposite. Replaced with `git merge-tree --write-tree` against the upstream
  tree — verified correct for both squash cases and for a branch carrying real work.
- `git for-each-ref` shortens `refs/remotes/origin/HEAD` to the bare string `origin`, so
  the guard testing for `HEAD` never fired and the remote's own name entered the stale
  list, producing the pasteable command `git push origin --delete origin <branch>`.

### 10.5 — The rename pass covers every non-exempt file, in separate operations

**Decided: the broadest reading — 270 files.** Maintainer, verbatim:

**Decision:** the move and the rename are separate operations. If doing both at once is known
to break history, it is not done that way.

So the move and the rename are **separate operations**, not one. § 9.3 measured that 227
files would otherwise be moved and renamed together, which is where git's rename detection
is weakest; splitting them removes that risk entirely rather than mitigating it.

**Where each timestamp comes from: the file's creation time, never the moment the rename
runs.** Recoverable from history for all 118 dated files, none missing. For 85 the date
already in the filename matches and history supplies only the missing time of day. For the
33 that disagree — always by a few hours across midnight, in both directions — the value
recorded in history wins, because it is the only measured one.

### 10.6 — Handed-off specs stay exempt from the style checker

**Decided: carry the exemption forward to the new path.** The 42 specification documents
are declared unchangeable once handed off; that is why they were exempt in the first place.
Simulated at the destination path with the repository's own settings, they produce 296
cosmetic complaints across 37 of 45 files — inconsistent table borders, bare links, code
blocks without a language label. Reformatting 35 historical records to satisfy a
table-border rule would edit the records to serve the checker.

**Reversal condition:** if `docs/specs/` ever holds a document that is edited rather than
filed away, it has stopped being unchangeable and should be checked.

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
