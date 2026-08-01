# Repo file-structure audit — D1 inventory

**Issue:** [#178](https://github.com/Jared-Godar/audio-lab/issues/178) (D1 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-01
· **Status:** analysis only — nothing was moved, renamed or deleted.

This is the raw inventory. It feeds D2 (#179, target structure) and D3 (#180, the report).
It deliberately does **not** propose a layout — that is D2's job.

---

## Method, and one measurement trap worth recording

Tracked-file counts are taken from **`origin/main`**, via a worktree created from it.
Untracked and gitignored measurements come from the working filesystem at
`/Users/jaredgodar/Code/audio-lab`, since untracked files exist nowhere else.

Two things distorted the first pass and were corrected:

1. **`find` descended into `.claude/worktrees/`**, which holds complete repo copies. That
   inflated every repeated-directory-name count by roughly 2×: `brand` appeared to occur
   at 12 levels when the real figure is 2. All counts below exclude worktrees, `.git`,
   `.venv`, `node_modules`, `__pycache__`, `.pytest_cache` and `.ruff_cache`.

2. **The local checkout is 5 commits behind `origin/main`** — it sits at `aeedcbf`, the
   HEAD at the start of this session, and carries uncommitted edits to
   `episodes/ToldStraight-Ep01/show-notes.md`. Measuring tracked files there returned
   **301**, against **327** on `origin/main`. Per-directory counts were re-measured
   against `origin/main`.

> **Maintainer action, unrelated to the reorg:** your local `main` is 5 behind with
> uncommitted show-notes changes. Worth reconciling before D7 starts moving files under you.

---

## Part 1 — Inventory

### Scale

| Measure | Value |
| --- | --- |
| Tracked files (`origin/main`) | **327** |
| Working tree on disk (excl. `.git`) | **483 MB** |
| `.git` | 30 MB |
| `output/` — gitignored | **132 MB** (27% of the tree) |
| `artifacts/` — mostly gitignored | **90 MB** (19%) |
| Gitignored scratch combined | **222 MB — 46% of everything on disk** |

Nearly half the repo directory by volume is content that never reaches a fresh clone. Any
structure proposal that only considers tracked files is planning for **54%** of what you
actually navigate.

### Top-level directories

`Tracked` is from `origin/main`; `Disk` and `Ignored entries` from the working filesystem.

| Directory | Tracked | Disk | Ignored entries | Era / purpose | Observation |
| --- | ---: | ---: | ---: | --- | --- |
| `episodes/` | 79 | 30 MB | 5 | Current — episode deliverables | Largest tracked surface. Per-episode layout is inconsistent (see F5). |
| `artifacts/` | 42 | 90 MB | 22 | All eras — scratch | Documented as gitignored; 42 files tracked (F1). |
| `docs/` | 41 | 416 KB | 0 | Current — durable docs | 20 top-level + 21 in `adr/`. No guide/report/runbook separation. |
| `site/` | 27 | 2.3 MB | 0 | Current — static site | `site/assets/` is one of 3 `assets/` dirs. |
| `prompts/` | 27 | 412 KB | 0 | Mid — executor specs | 23 of 27 byte-identical to `artifacts/specs/` (F2). |
| `brand/` | 24 | 1.5 MB | 1 | Current — design tokens/assets | One of several brand surfaces (F3). |
| `pipeline/` | 22 | 16 MB | 6 | Current — uv Python CLI | Contains empty `artifacts/walkthroughs/` and `prompts/` (F4). |
| `.github/` | 13 | — | 0 | Current — CI/templates | **Cannot move** (root-only). |
| `tools/` | 12 | 260 KB | 0 | Current — Illustrator/InDesign builders | All 12 are `tools/brand/*.jsx`. |
| `archive/` | 8 | 21 MB | 3 | Legacy — `audition-v1` | 8 tracked files, 21 MB on disk. |
| `infra/` | 7 | 92 KB | 0 | Current — CFN + IAM policies | Coherent; least churn expected. |
| `spotify/` | 6 | 8.4 MB | 3 | **Original project** | Orphan (F6). |
| `scripts/` | 4 | 20 KB | 0 | Mixed | Purpose overlaps `tools/`, `fish/`, `pipeline/`. |
| `fish/` | 2 | 8 KB | 0 | Audition-era | Orphan; both files are audition helpers (F6). |
| `templates/` | 1 | 4 KB | 0 | Unclear | Single file. |
| `.claude/` | 1 | — | 3 | Current — agent config | **Cannot move** (root-only). |
| `data/` | **0** | 2.2 MB | 1 | **Original project** | Entirely untracked; holds `spotify-2022/` (F6). |
| `output/` | **0** | **132 MB** | 1 | Current — renders | Fully gitignored (F7). |
| *(root files)* | 11 | — | — | Governance + config | `AGENTS.md`, `CLAUDE.md`, `README.md`, `ROADMAP.md`, `CHANGELOG.md`, etc. |

### Inside the gitignored zones

**`artifacts/` — 16 subdirectories, only 2 tracked:**

| Subdir | Size | Files | Tracked | Note |
| --- | ---: | ---: | :---: | --- |
| `brand-wip/` | **43 MB** | 11 | no | Largest. A brand surface invisible to git (F3). |
| `_guide-tracks/` | 19 MB | 29 | no | Audio. |
| `20260731-cast-expansion-167-prompts/` | 15 MB | 29 | no | Issue-scoped dump. |
| `coming-soon-prototype/` | 5.4 MB | 7 | no | Has its own `assets/`. |
| `voice-previews/` | 2.7 MB | 12 | no | |
| `20260731-coming-soon-preview/` | 2.3 MB | 16 | no | Has its own `assets/`. Near-duplicate name of the prototype dir. |
| `hero-references/` | 1.1 MB | 2 | no | |
| `specs/` | 592 KB | 38 | **yes** | Carved out via `!artifacts/specs/`. |
| `walkthroughs/` | 268 KB | 31 | no | Explicitly re-ignored. |
| `reference-photos/` | 240 KB | 1 | no | |
| `drafts/` | 168 KB | 12 | no | |
| `session-handoffs/` | 164 KB | 12 | no | Explicitly re-ignored. |
| `issues/` | 32 KB | 2 | **yes** | Carved out via `!artifacts/issues/`. |
| `rules-pending/` | 8 KB | 2 | no | Name implies unresolved governance. |
| `1x/` | 0 B | 0 | no | **Empty.** |
| `verification/` | 0 B | 0 | no | **Empty.** |

**`output/` — 132 MB, zero tracked:** `episodes/` (120 MB, 63 files), `auditions/` (8.5 MB,
43), `artwork/` (3.2 MB, **82 files**), `shared-previews/` (228 KB, 3).

---

## Part 2 — Disconnects

### F1 — `artifacts/` is documented as gitignored but has 42 tracked files

`CLAUDE.md` states:

> `artifacts/` — **gitignored** working zone: handoffs, drafts, research notes. It is
> scratch: anything load-bearing gets promoted to a tracked home, because nothing here
> reaches a fresh clone or cloud session (#68).

`.gitignore` (lines 113–118) contradicts this:

```gitignore
artifacts/*
!artifacts/specs/
!artifacts/issues/
artifacts/walkthroughs/
artifacts/session-handoffs/
```

**40 files under `artifacts/specs/` and `artifacts/issues/` reach a fresh clone.** The
governance file describing the repo's own contract is wrong about the repo. This is the
single highest-value fix in the audit: it is why `artifacts/` reads as a catch-all — it is
simultaneously scratch *and* a tracked home, with no rule stating which.

### F2 — 23 byte-identical duplicate files across two tracked trees

`prompts/` and `artifacts/specs/` share **23 basenames**, and all 23 are **byte-identical**
(`filecmp.cmp(shallow=False)` — 23 common, 23 identical, **0 diverged**). `prompts/` holds
27 files total, so **85% of it is a copy of `artifacts/specs/`**.

They have not drifted. Nothing prevents it: there is no symlink, no generator, no CI check.
The first hand-edit to one copy creates a silent divergence.

### F3 — Brand content is spread across six surfaces, three of them invisible to git

| Surface | Size | Files | Tracked |
| --- | ---: | ---: | ---: |
| `artifacts/brand-wip/` | **43 MB** | 11 | **0** |
| `episodes/cast/` | 11 MB | 8 | 6 |
| `output/artwork/` | 3.2 MB | **82** | **0** |
| `site/assets/` | 2.1 MB | 10 | 10 |
| `brand/` | 1.5 MB | 18 | 17 |
| `tools/brand/` | 260 KB | 10 | 10 |

The two largest brand surfaces by volume — `artifacts/brand-wip/` (43 MB) and
`output/artwork/` (82 files) — are **entirely untracked**. "Where is the wordmark" has six
possible answers and no rule to pick between them. Separately, brand *builders* live in
`tools/brand/` while brand *output* lives in `brand/`, `site/assets/` and `episodes/`, so
source and artifact are never co-located.

### F4 — `pipeline/` re-creates the top-level naming, with empty directories

`pipeline/` contains `pipeline/artifacts/walkthroughs/` and `pipeline/prompts/` — both
**empty**, both mirroring top-level names. This is the nested-duplicate-folder problem in
its clearest form: the same word means different things at different depths, and the
directories that would disambiguate it hold nothing.

Directory names occurring at more than one level (worktrees excluded):

| Name | Count | Locations |
| --- | ---: | --- |
| `cast` | 3 | `episodes/cast/`, `episodes/ToldStraight-Ep02/cast/`, `episodes/ToldStraight-Ep03/cast/` |
| `assets` | 3 | `site/assets/`, `artifacts/coming-soon-prototype/assets/`, `artifacts/20260731-coming-soon-preview/assets/` |
| `brand` | 2 | `brand/`, `tools/brand/` |
| `artifacts` | 2 | `artifacts/`, `pipeline/artifacts/` |
| `prompts` | 2 | `prompts/`, `pipeline/prompts/` |
| `walkthroughs` | 2 | `artifacts/walkthroughs/`, `pipeline/artifacts/walkthroughs/` |
| `episodes` | 2 | `episodes/`, `output/episodes/` |

### F5 — No two episodes have the same shape

There is no episode template, so each episode's contents record *when it was produced*
rather than what an episode is. Tracked contents compared across all three:

| Item | Ep01 | Ep02 | Ep03 |
| --- | :---: | :---: | :---: |
| `cover.png`, `ch1–ch6.png`, `alt-text.md` | ✅ | ✅ | ✅ |
| `transcript.md` / `.txt` / `.vtt` | ✅ | ✅ | ✅ |
| `transcript.html` | ✅ | ✅ | ❌ |
| `show-notes.md` | ✅ | ✅ | ✅ |
| `show-notes.html` | ✅ | ✅ | ❌ |
| `captions-autosync.txt` | ✅ | ✅ | ❌ |
| `youtube-description.txt` | ❌ | ✅ | ✅ |
| `episode-copy.txt` | ❌ | ✅ | ✅ |
| `host-read-sheet.md` | ✅ | ❌ | ❌ |
| `record-host-*.txt` / `record-guest-*.txt` | ❌ | ✅ | ❌ |
| `transcript-markup.txt` | ❌ | ✅ | ❌ |
| `script-draft-v1.md` | ❌ | ❌ | ✅ |
| `cast/` subdir | ❌ | ✅ | ✅ |
| `build/` subdir | ❌ | ❌ | ✅ |
| `_v1-archive/` subdir | ✅ | ❌ | ❌ |
| `show-cover.png` | ✅ | ❌ | ❌ |

Only **7 of 16** item types are common to all three. Six appear in exactly one episode.
Whether that reflects genuine per-episode need or simply drift is a D2 question — but as it
stands, knowing where something lives in Ep02 tells you little about Ep01.

**Cast portraits exist at two levels simultaneously**: shared at
`episodes/cast/portraits/` (5 portraits plus a `manifest.json`) and per-episode at
`episodes/ToldStraight-Ep0{2,3}/cast/`. No rule states which is authoritative.

### F6 — Three orphan surfaces from the original project

- **`spotify/`** — 6 tracked files, 8.4 MB. The pre-podcast project.
- **`data/spotify-2022/`** — 2.2 MB, **entirely untracked**, top-level. A second
  Spotify-era surface that is not adjacent to the first and appears in no documentation.
- **`fish/`** — 2 files, both audition-era helpers (`audition.fish`, `audition-judge.fish`),
  matching `archive/audition-v1/`.

`data/` is the more interesting find: a top-level directory holding 2.2 MB, tracked
nowhere, referenced nowhere. It is invisible to every `git ls-files`-based review.

### F7 — `output/` holds 132 MB dominated by superseded experiments

`output/episodes/` alone is 120 MB. A large share is
`ToldStraight-Ep01-v2/_post-experiments/` — seven ~14 MB variants of the same episode
(`tempo105-gap300`, `tempo108-gap250`, `tempo112-gap220`, …) retained after the tempo
question was settled. Gitignored, so it costs nothing in git, but it is 27% of what you
scroll past on disk.

### F8 — Two incompatible timestamp conventions

- `docs/`, `artifacts/specs/`, `prompts/`, `tools/`: **`YYYYMMDD-`** (e.g.
  `20260727-adobe-illustrator-toldstraight-ep01-covers-builder.jsx`).
- `artifacts/walkthroughs/`: **`YYYYMMDDTHHMMSSZ-`** (e.g.
  `20260726T203642Z-pr1-lane-standards-issue-rewrites.md`).

Conformance to the documented `DATE-VENDOR-ENGINE-SUBJECT-PURPOSE` convention across
tracked `docs/`, `artifacts/specs/` and `tools/`: **51 dated, 35 undated** — about 59%.
The convention is real and half-applied, which is worse for navigation than either
extreme, because you cannot predict whether to look for a date prefix.

### F9 — Filesystem noise

12 `.DS_Store` files outside `.git`. Five empty directories: `artifacts/1x/`,
`artifacts/verification/`, `pipeline/prompts/`, `pipeline/artifacts/walkthroughs/`,
`artifacts/20260731-cast-expansion-167-prompts/outputs/`.

---

## Part 3 — Findings that belong to other issues

### To #177 (art-source recovery) — four untracked design sources, right now

Found on disk, tracked nowhere:

| File | Size |
| --- | ---: |
| `episodes/cast/Untitled-1.ai` | 3.2 MB |
| `episodes/ToldStraight-Ep03/build/Untitled-1.ai` | 2.1 MB |
| `episodes/ToldStraight-Ep03/build/ep03-exhibit-cards.ai` | 652 KB |
| `artifacts/brand-wip/readme.ai` | 660 KB |

These are the **live instance** of the problem #177 was opened for: design sources for
approved, committed artwork existing only in the working directory. They are not lost to
history — they are on disk — but they are one `rm`, one disk failure, or one clean checkout
away from being exactly as gone as the Ep01 builders. Two are named `Untitled-1.ai`, which
means their correspondence to specific artwork is already ambiguous.

**This is a cheap win and should be pulled forward.** Unlike mining unreachable commits, it
requires no archaeology.

### To #185 / D8 (Git LFS) — the LFS premise needs re-testing

Measured: **141 `.mp3` files, 163 MB total, zero `.mp4`.** Actual finished-episode masters
are **13–14 MB**, e.g.
`output/episodes/ToldStraight-Ep01-v2/20260727-elevenlabs-v3-ToldStraight-Ep01-v2-master-192k.mp3`
at 14 MB.

When #185 was written I estimated ~86 MB for a 60-minute episode at 192 kbps, which put it
in GitHub's 50 MB warning band and near the 100 MB hard limit. **That estimate is wrong for
this show** — these episodes are roughly 10 minutes, not 60, so a master is 13–14 MB and
sits comfortably under every GitHub threshold. **Plain git may track final `mp3` files with
no LFS at all**, at roughly 14 MB per episode (≈ 140 MB at 10 episodes, ≈ 350 MB at 25).

The open variable is **`mp4`**: none exist yet, and video will be far larger than audio.
D8 should measure a real exported `mp4` before concluding, but the mp3-only case for LFS
is materially weaker than assumed. Correcting this now avoids setting up LFS — and paying
its bandwidth costs on every clone and CI checkout — for a problem that may not exist.

---

## Part 4 — What D2 must resolve

Carried forward as open questions, not decided here:

1. **`artifacts/` retirement** — 16 subdirectories need destinations. `specs/` and
   `issues/` are tracked and need real homes; `brand-wip/` (43 MB) needs a brand home or
   deletion; `1x/` and `verification/` are empty and should simply go.
2. **`prompts/` vs `artifacts/specs/`** — 23 identical duplicates. Which copy is canonical,
   or is the whole category obsolete now that issues carry executor specs?
3. **Brand consolidation** — six surfaces, three untracked. Where do builders live relative
   to their output, given `AGENTS.md` requires them to ship together?
4. **Episode template** — one shape all episodes conform to, and where `cast/` lives
   (shared, per-episode, or both with a stated rule).
5. **Orphan disposition** — `spotify/`, `data/spotify-2022/`, `fish/`, `archive/`,
   `templates/`: archive, delete, or relocate. `data/` in particular is undocumented.
6. **Guide vs report vs spec vs ADR** — the maintainer's tree proposes
   `docs/reports-findings/` and `docs/walkthrough-guides/`; the rule that sorts a new
   document into one of them needs stating, or the split will decay the way the current one did.
7. **Naming convention** — pick one timestamp format, and decide whether the date prefix is
   mandatory, optional, or reserved for dated artifacts only.
8. **Gitignored zone layout** — `output/` and the untracked half of `artifacts/` are 46% of
   the tree. They need a structure too, even though git will never see it.

---

## Appendix — Commands

Every count above is reproducible. Tracked figures from a worktree at `origin/main`;
disk and ignored figures from the working checkout.

```fish
# tracked, per top-level dir (from an origin/main worktree)
git ls-files | awk -F/ 'NF==1{r++} NF>1{d[$1]++} END{for(k in d) printf "%-12s %4d\n",k,d[k]; printf "%-12s %4d\n","(root)",r}'

# ignored entries + disk, per top-level dir
git -C $R status --porcelain --ignored=matching <dir> | grep -c '^!!'
du -sh $R/<dir>

# duplicate detection (python, exact byte compare)
# filecmp.cmp(a, b, shallow=False) over common basenames

# repeated directory names -- worktrees MUST be excluded
find $R -type d -not -path "*/.git/*" -not -path "*/.venv/*" \
  -not -path "$R/.claude/worktrees/*" | awk -F/ '{print $NF}' | sort | uniq -c | awk '$1>1'

# audio sizing
find $R -name "*.mp3" -exec du -ch {} + | tail -1
```
