# Repo file-structure — D5 revised structure

**Issue:** [#182](https://github.com/Jared-Godar/audio-lab/issues/182) (D5 of epic
[#176](https://github.com/Jared-Godar/audio-lab/issues/176)) · **Date:** 2026-08-02
· **Status:** proposal only — nothing has been moved.

**Inputs:** the D2 target proposal
([`20260801-repo-file-structure-d2-target-proposal.md`](20260801-repo-file-structure-d2-target-proposal.md)),
the D3 assessment
([`20260801225106-repo-file-structure-d3-assessment-report.md`](20260801225106-repo-file-structure-d3-assessment-report.md)),
and the D4 decision record
([`20260802001735-repo-file-structure-d4-decision-record.md`](20260802001735-repo-file-structure-d4-decision-record.md)),
in which all eleven gate-1 questions were decided by accepting the D3 recommendation as
written.

**Measured against `main` at `a15f075` — 338 tracked files.** D2 mapped `c9685af` (328)
and D3 measured `0a8e88c` (336). Every count below was re-derived today.

This document supersedes D2 as the structure of record. It is the last document before
execution: D6 (#183) maps the references, D7 (#184) performs the moves.

---

## 0. Read this first — two corrections to D2 and D3

**0.1 — D2's and D3's headline metric is wrong, and this document changes it.**

Both documents lead with *"non-dot top-level directories: 14 → 7."* Counting the entries
in D2's own target tree gives **nine** tracked directories (`brand`, `docs`, `podcast`,
`episodes`, `website`, `infra`, `pipeline`, `tooling`, `archive`), plus the gitignored
`output/`. There is no arrangement of that tree that yields seven. The number was never
achievable and no decision reduced it — it was simply not counted.

Re-derived today at `main@a15f075`:

```text
current, tracked non-dot top-level dirs:  14
  episodes docs artifacts site prompts brand pipeline tools
  infra archive spotify scripts fish templates
plus on disk, untracked:  output/  data/     → 16 total
```

**The honest figure is 14 → 9 tracked (16 → 10 on disk).** That is still the largest
single navigability change in the reorg — it retires nine directories and creates two —
but it is not seven, and a plan executed against a number nobody can reach produces an
argument at D7 about which directory to eliminate next. Corrected in § 3 below.

This is the same failure D3 caught in D1's F3, in the same shape: a figure asserted once,
carried forward twice, and never re-derived. It is caught here by counting the tree D2
itself printed.

**0.3 — This document went stale during its own review, and the rules absorbed it.**
PR #207 merged on 2026-08-02, after the measurements above were taken, adding seven files.
**Three of the four new files in moving directories were absorbed by an existing rule with
no edit** — `scripts/check_brand_fonts.py`, `scripts/generate_fonts_manifest.py` and
`scripts/closure-pass.fish` all match `R-TOOL-1  scripts/** → tooling/`. The fourth,
`brand/fonts-manifest.json`, matched **no rule**: `R-BRAND-2` covered `brand/*.css` and
`brand/*.png` only. `R-BRAND-5` is added for it.

That is one rule added, versus the four table rows D2's row-per-file mapping would have
needed — and D7 would have **halted loudly** on the unmatched file rather than silently
leaving it behind, which is the behaviour § 5 requires. The staleness in § 0.2 above is
not hypothetical; it recurred inside a single day, and the design held.

`#207` also carries three new hard-coded references to paths that move (§ 6.4) and one to
`artifacts/specs`/`artifacts/issues` inside an executable script — D6 must enumerate them.

**0.2 — Consolidating the cast portraits is not a de-duplication.** Q4's decision merges
two surfaces that hold **different bytes for the same four people**, not duplicate copies.
This changes what D7 has to do: it is a choose-the-authoritative-rendition task requiring
the maintainer's eye, not a mechanical `git mv`. Measured evidence and the consequence are
in § 4.1 — this is the single most important knock-on in this document.

---

## 1. What changed from D2, and why

Diff-style, as #182 requires. Nine changes; each names the decision that caused it.

| # | Change against D2 | Cause |
| --- | --- | --- |
| 1 | Headline metric restated **14 → 9**, not 14 → 7 | Measurement (§ 0.1) — no decision |
| 2 | `episodes/epNN/build/` splits into **`build/audio/`** and **`build/art/`** | **Q11** |
| 3 | Untracked `.ai` design sources route to **`build/art/`**, not `build/` | **Q11** knock-on |
| 4 | New **`podcast/sources/`** for the show-wide `.ai` that sits in `episodes/cast/` | **Q4 + Q11** knock-on (§ 4.2) |
| 5 | `episodes/epNN/cast/` resolves to **`podcast/portraits/`** — D2 left this as "or" | **Q4** |
| 6 | `studio_disclaimer.png` routes to **`podcast/artwork/`**, not `portraits/` | **Q4** knock-on (§ 4.1) |
| 7 | Ep01's `show-cover.png` routes to **`podcast/artwork/`**, not `episodes/ep01/art/` | **Q4** knock-on (§ 4.3) |
| 8 | The three PM-era seeds get a named home: **`archive/prompts-pm-era/`** — D2 said only "archive/" | **Q10** |
| 9 | `brand/logos/` is **not created**; `brand/README.md` records the unbuilt skeleton | **Q5** applied consistently (§ 4.6) |

Two D2 mapping rules are also **rewritten because they no longer match the repo**, with no
decision involved — see § 5.

Everything else in D2 stands: `pipeline/` is not moved (Q1), `docs/adr/` stays where it is
(Q2), the five-way `docs/` split is adopted with its rule (Q3), no social sub-tree is
created (Q5), the orphans are archived rather than deleted (Q6), `.local/sessions/` sits
inside the repo (Q8), and `episodes/TEMPLATE/` is advisory (Q9).

---

## 2. The structure

`[new]` = does not exist yet. `(ignored)` = gitignored working zone — organised, never
committed. **Every directory is named; nothing reads "TBD" and nothing reads "or".**

```text
audio-lab/
├── .github/  .claude/  .vscode/        # UNMOVABLE — root-only by their tools
├── .local/                    [new]    # (ignored) session scratch — Q8
│   └── sessions/
│       ├── walkthroughs/               #   ← artifacts/walkthroughs/   (31)
│       ├── handoffs/                   #   ← artifacts/session-handoffs/ (12)
│       └── drafts/                     #   ← artifacts/drafts/ + rules-pending/
│
├── AGENTS.md  CLAUDE.md  README.md  ROADMAP.md  CHANGELOG.md
├── CONTRIBUTING.md  SECURITY.md  LICENSE
├── .gitignore  .pre-commit-config.yaml  .markdownlint-cli2.yaml
│
├── brand/                              # ONE home for identity — Q1/R5
│   ├── README.md              [new]    #   the unbuilt skeleton, so growth has a shape
│   ├── tokens/                [new]    #   ← brand/*.css, *.png contact sheet,
│   │                                   #     + the approved card standard (§ 5.2)
│   ├── builders/              [new]    #   ← tools/brand/*  (14 files: .jsx AND .py)
│   ├── favicon/  social-icons/  web/   #   unchanged
│   └── wip/                   (ignored)#   ← artifacts/brand-wip/  (43 MB)
│
├── docs/                               # ONE home for durable documents — Q3
│   ├── README.md              [new]    #   states the five-way rule; makes it reviewable
│   ├── adr/                            #   unchanged — Q2
│   ├── guides/                [new]    #   how to do something
│   ├── reports/               [new]    #   what was found
│   ├── reference/             [new]    #   what is true
│   └── specs/                 [new]    #   ← artifacts/specs/ (40) + artifacts/issues/ (2)
│
├── podcast/                   [new]    # show-wide, not episode-scoped — Q4
│   ├── cast.json                       #   ← episodes/cast.json
│   ├── portraits/                      #   ← episodes/cast/portraits/ + the per-episode
│   │                                   #     cast/ files, after § 4.1 is resolved
│   ├── artwork/               [new]    #   ← show-cover.png, studio_disclaimer.png
│   └── sources/               [new]    #   ← episodes/cast/Untitled-1.ai (untracked today)
│
├── episodes/
│   ├── EPISODE-COMPLETENESS.md  LICENSE
│   ├── TEMPLATE/              [new]    #   README.md only — advisory, Q9 (§ 4.5)
│   ├── ep01/                           #   ← ToldStraight-Ep01/
│   │   ├── art/                        #     cover.png, ch1–ch6.png
│   │   ├── text/                       #     transcripts, show-notes, alt-text, host-read
│   │   ├── build/art/         [new]    #     Illustrator sources — Q11
│   │   ├── build/audio/       [new]    #     assembly/render code — Q11
│   │   ├── audio/             (ignored)#     stems, assembled, captions
│   │   └── _v1-archive/                #     unchanged — Ep01 only, superseded v1
│   ├── ep02/                           #   ← ToldStraight-Ep02/   same shape
│   └── ep03/                           #   ← ToldStraight-Ep03/   same shape
│
├── website/                            #   ← site/  — sequenced LAST and alone (§ 6.3)
│   ├── index.html  privacy.html
│   ├── assets/                         #   unchanged (21 tracked files)
│   └── icons/                 [new]    #   ← favicon*.png, favicon.svg, apple-touch-icon
│
├── infra/                              # AWS IaC only — unchanged, lowest churn
│   ├── README.md  dns.yaml  signup.yaml  site.yaml
│   └── policies/
│
├── pipeline/                           # the uv package — NOT moved, Q1
│
├── tooling/                   [new]    # repo automation, not product code — Q1
│   ├── check  install-hooks  check_pr_metadata.py  sync_labels.py
│   ├── preview-site.fish               #   ← scripts/preview-site.fish
│   └── templates/             [new]    #   ← templates/task-spec.md
│                                       #     + EXECUTOR-SEED-PROMPT-TEMPLATE.md
│
├── archive/                            # retired work, kept deliberately — Q6
│   ├── audition-v1/                    #   unchanged
│   ├── spotify-2022/                   #   ← spotify/ (6 tracked)
│   │   └── data/              (ignored)#   ← data/spotify-2022/ (2.2 MB, untracked)
│   ├── fish/                           #   ← fish/ (2 audition-era helpers)
│   └── prompts-pm-era/        [new]    #   ← the 3 PM seeds — Q10
│
└── output/                    (ignored)# renders, auditions, previews
    ├── episodes/  auditions/  artwork/  shared-previews/
    ├── audio/                          #   ← artifacts/_guide-tracks/, voice-previews/
    └── previews/                       #   ← artifacts/ prototype & reference dirs
```

**Retired entirely** — every file relocated, no directory left as a shell:
`artifacts/`, `prompts/`, `tools/`, `scripts/`, `templates/`, `site/`, `spotify/`,
`data/`, `fish/`.

**Created:** `podcast/`, `tooling/`. (`.local/` is a dotfolder and does not count against
the top-level total, which is the point of putting scratch there.)

---

## 3. The measurable effect, corrected

| | Now (`a15f075`) | After |
| --- | ---: | ---: |
| Tracked non-dot top-level directories | **14** | **9** |
| …including untracked `output/` and `data/` | 16 | 10 |
| Directory names reused with overlapping purpose | 7 | 0 |
| Places brand content lives | 6 | 1 (+1 ignored scratch) |
| Homes for a durable document | 4 | 1 (`docs/`) |
| Byte-identical duplicate files | 23 | 0 |
| Cast portraits with two competing homes | 2 surfaces, 4 subjects doubled | 1 |

Two of these need their honest footnote:

- **"Homes for a durable document: 1"** means `docs/`, and it holds for reports, guides,
  reference and specs. Three document-shaped files live elsewhere **by rule, not by
  drift**: `brand/README.md` and the approved card standard (they specify a brand
  artifact — § 5.2), and `episodes/TEMPLATE/README.md` (it specifies an episode). The
  rule that keeps this from decaying is in § 5.2.
- **"Byte-identical duplicate files: 0"** refers to the 23 `prompts/` duplicates, which
  are provably identical and are deleted. It does **not** cover the cast portraits, which
  are near-duplicates by subject and different by content — § 4.1.

---

## 4. Knock-on effects the decisions produced

Issue #182 requires these surfaced rather than quietly absorbed. Six of them.

### 4.1 — Q4's consolidation is a merge of different renditions, not a de-duplication

**This is the one that changes D7's work.** D2 described the per-episode `cast/`
directories as competing with the shared `episodes/cast/portraits/`. Measured by git blob
SHA at `main@a15f075`, they do not merely compete — they are **different images of the
same people**:

```text
episodes/ToldStraight-Ep02/cast/guest_michael_voss.png        a95883f2…
episodes/cast/portraits/…-michael-voss-ep02-expert-…-1x1.png  f73b4fc6…

episodes/ToldStraight-Ep02/cast/host_des_fable.png            3f2a1d00…
episodes/cast/portraits/…-des-fable-ep02-host-…-1x1.png       f86fd256…

episodes/ToldStraight-Ep03/cast/clinician_anna_sinclair.png   fdea981e…
episodes/cast/portraits/…-anna-sinclair-ep03-clinician-…png   e52f2181…
```

Three subjects, six files, six distinct hashes. No pair is byte-identical.

**Consequence.** "Single source at `podcast/portraits/`" cannot be executed by moving both
sets into one directory — that reproduces the problem under a new path with two files per
person. For each of the three subjects, one rendition is authoritative and the other is
either a crop, an earlier take, or a per-episode treatment.

**How D7 handles it:** the four per-episode files are **not moved by rule**. They are
presented to the maintainer as three side-by-side pairs, he names the authoritative one
per subject, the loser is deleted (it stays in git history), and `manifest.json` is
updated to match. **This requires his eye and cannot be inferred from the filesystem** —
the naming conventions differ (`host_des_fable.png` vs the dated generator-stamped name)
and neither convention marks one as superseded.

Note the fourth per-episode file is not a portrait at all — next section.

### 4.2 — `studio_disclaimer.png` is not a portrait, and the `.ai` beside the portraits is not episode-scoped

Two files that Q4's rule routes somewhere D2 did not anticipate:

- `episodes/ToldStraight-Ep02/cast/studio_disclaimer.png` is a **disclaimer plate**, not a
  cast portrait. It is show-wide and appears in a per-episode directory only because that
  is where the Ep02 work happened. → **`podcast/artwork/`**.
- `episodes/cast/Untitled-1.ai` (3.2 MB, **untracked**) sits with the shared portraits, so
  it is a source for show-wide cast art, not for one episode. D2 routed all `.ai` files to
  `episodes/epNN/build/`, which would file a show-wide source under an arbitrary episode.
  → **`podcast/sources/`**, a directory this document adds.

### 4.3 — Q4's show-wide principle also moves Ep01's `show-cover.png`

`episodes/ToldStraight-Ep01/show-cover.png` is the **show** cover, not the episode cover
(`cover.png` is, and both exist side by side). It is present in Ep01 only — D3 § 2.5 lists
it as one of the six item types appearing in exactly one episode, and this is why: it was
produced during Ep01 and never had a show-wide home to go to. Q4 creates one.

→ **`podcast/artwork/`**. D2 mapped it to `…/art/` with the episode covers.

`_v1-archive/show-cover.png` **stays in `_v1-archive/`** — it is a superseded artifact of
the v1 archive, not a live show asset.

**This resolves one of Q9's six oddities without a template decision**: `show-cover.png`
was never a per-episode item, so its absence from Ep02 and Ep03 was never drift.

### 4.4 — Q11's split relocates the `.ai` sources and the Ep03 Python

The split is the reason `build/` can hold both without ambiguity:

| File | D2 destination | **D5 destination** |
| --- | --- | --- |
| `episodes/ToldStraight-Ep03/build/*.py` (3) + `README.md` | `episodes/ep03/build/` | **`episodes/ep03/build/audio/`** |
| `…/Ep03/build/Untitled-1.ai` (untracked, 2.1 MB) | `episodes/epNN/build/` | **`episodes/ep03/build/art/`** |
| `…/Ep03/build/ep03-exhibit-cards.ai` (untracked, 650 KB) | `episodes/epNN/build/` | **`episodes/ep03/build/art/`** |
| `artifacts/brand-wip/readme.ai` (untracked, 656 KB) | `brand/wip/` | **`brand/wip/`** — unchanged, it is WIP not an episode source |

Only `ep03` has a `build/` today. `ep01` and `ep02` get one when they have something to
put in it — not created empty (D2 design principle 3).

### 4.5 — Q9's advisory `TEMPLATE/` cannot be a directory skeleton

An advisory template made of empty directories collides directly with "create only what
has content," and empty directories do not survive git in the first place — git tracks
files, not directories, so a skeleton would need `.gitkeep` files in every branch of it.

→ **`episodes/TEMPLATE/README.md`, a single file**, describing the shape in prose with
the required and optional items named. Nothing enforces it, which is Q9's decision; a
document is what "advisory" means here.

### 4.6 — Q5's deferral applies to `brand/logos/` too

D2 marked `brand/logos/ [new]` while noting nothing is populated. Q5 defers naming
unpopulated brand structure, and the same reasoning applies: a `logos/` directory with no
logo in it is the empty-directory noise D1 counted.

→ **Not created.** The full intended skeleton — logos, print, email, per-platform social —
is recorded in **`brand/README.md`** so that growth has a predetermined shape and nothing
is invented ad hoc later. That file is the deliverable that replaces the empty directories.

---

## 5. Mapping rules D7 executes — not rows D7 replays

D3 § 6.1 is explicit and it is the operating constraint of this reorg: **the mapping goes
stale faster than the reorg executes.** D2 mapped 328 files; D3 measured 336 one day
later, three of the eight new files falling outside D2's rules; `main` is at **338**
today. D7 generates its move list from `main` at execution time by applying the rules
below, and **fails loudly on any tracked path that matches no rule.** A file silently left
behind because no rule covered it is the failure mode.

### 5.1 — Two of D2's rules are rewritten because the repo moved under them

| D2 rule | Why it fails now | **D5 rule** |
| --- | --- | --- |
| `tools/brand/*.jsx (12) → brand/builders/` | The directory holds **14** files and one is a `.py` (`20260801-python-pillow-…-card-measurement.py`). A glob written for one extension now misses a file | **`tools/brand/** → brand/builders/`** — every file, regardless of extension |
| `brand/` root files → `brand/tokens/` (a `.css` and a `.png` contact sheet) | A third file landed on 2026-08-01, `20260801-toldstraight-approved-card-standard.md`, and it is a **standards document**, not a token | Resolved by rule in § 5.2 |

### 5.2 — The rule that decides where a document lives

Q3 adopted the five-way split for `docs/`. It does not by itself say whether a document
*about* a brand artifact belongs in `docs/reference/` or in `brand/`, which is what left
the approved card standard unmapped in D3 § 2.6.

**The rule, stated so D7 can apply it and review can enforce it:**

> A document that **specifies an artifact** lives with that artifact. A document that
> **records a durable fact** lives in `docs/reference/`.

Applied: the approved card standard specifies what a chapter card must be, and the
builders in `brand/builders/` implement it → **`brand/tokens/`**. `docs/elevenlabs.md`
records what is true about an external service and specifies nothing → `docs/reference/`.
`episodes/TEMPLATE/README.md` specifies an episode → stays with episodes.

This rule goes in `docs/README.md` beside the five-way rule, because a sorting rule that
lives only in a report decays exactly as the current split did.

### 5.3 — The complete rule set

| Rule | Source paths | Destination |
| --- | --- | --- |
| R-BRAND-1 | `tools/brand/**` | `brand/builders/` |
| R-BRAND-2 | `brand/*.css`, `brand/*.png` | `brand/tokens/` |
| R-BRAND-3 | `brand/*.md` specifying a brand artifact (§ 5.2) | `brand/tokens/` |
| R-BRAND-4 | `artifacts/brand-wip/**` *(ignored)* | `brand/wip/` *(ignored)* |
| R-BRAND-5 | `brand/*.json` — the generated fonts manifest (#207, § 0.3) | `brand/tokens/` |
| R-DOC-1 | `docs/*.md` — how to do something | `docs/guides/` |
| R-DOC-2 | `docs/*.md` — what was found | `docs/reports/` |
| R-DOC-3 | `docs/*.md` — what is true | `docs/reference/` |
| R-DOC-4 | `artifacts/specs/**`, `artifacts/issues/**` | `docs/specs/` |
| R-DOC-5 | `docs/adr/**` | unchanged |
| R-POD-1 | `episodes/cast.json` | `podcast/cast.json` |
| R-POD-2 | `episodes/cast/portraits/**` | `podcast/portraits/` |
| R-POD-3 | `episodes/*/cast/*` that is a portrait | **maintainer-resolved, § 4.1** |
| R-POD-4 | `episodes/*/cast/studio_disclaimer.png`, `episodes/ep01/show-cover.png` | `podcast/artwork/` |
| R-POD-5 | `episodes/cast/*.ai` *(untracked)* | `podcast/sources/` **and tracked** |
| R-EP-1 | `episodes/ToldStraight-EpNN/` | `episodes/epNN/` |
| R-EP-2 | `cover.png`, `ch[1-6].png` | `episodes/epNN/art/` |
| R-EP-3 | `*.md`, `*.txt`, `*.vtt`, `*.html` under an episode | `episodes/epNN/text/` |
| R-EP-4 | `build/*.py`, `build/README.md` | `episodes/epNN/build/audio/` |
| R-EP-5 | `build/*.ai` *(untracked)* | `episodes/epNN/build/art/` **and tracked** |
| R-EP-6 | `episodes/ep01/_v1-archive/**` | unchanged |
| R-WEB-1 | `site/index.html`, `site/privacy.html`, `site/assets/**` | `website/` |
| R-WEB-2 | `site/favicon*`, `site/apple-touch-icon.png` | `website/icons/` |
| R-TOOL-1 | `scripts/**` | `tooling/` |
| R-TOOL-2 | `templates/task-spec.md`, `prompts/EXECUTOR-SEED-PROMPT-TEMPLATE.md` | `tooling/templates/` |
| R-ARCH-1 | `spotify/**` | `archive/spotify-2022/` |
| R-ARCH-2 | `data/spotify-2022/**` *(untracked)* | `archive/spotify-2022/data/` *(ignored)* |
| R-ARCH-3 | `fish/**` | `archive/fish/` |
| R-ARCH-4 | the 3 PM-era seeds in `prompts/` | `archive/prompts-pm-era/` |
| R-DEL-1 | the 23 byte-identical `prompts/` duplicates | **deleted** (identical copies survive in `docs/specs/`) |
| R-DEL-2 | `artifacts/1x/`, `artifacts/verification/` | **deleted — both empty** |
| R-SCR-1 | `artifacts/` scratch dirs: `walkthroughs/`, `session-handoffs/`, `drafts/`, `rules-pending/` | `.local/sessions/` *(ignored)* |
| R-SCR-2 | `artifacts/_guide-tracks/`, `voice-previews/` | `output/audio/` *(ignored)* |
| R-SCR-3 | `artifacts/` prototype & reference dirs | `output/previews/` *(ignored)* |
| R-KEEP-1 | `infra/**`, `pipeline/**`, `.github/**`, `.claude/**`, root files | unchanged |

**Any tracked path matching no rule stops D7 and is reported.** That is the check D3 § 6.1
asked for, and it is the only defence against the eight-files-in-a-day problem.

---

## 6. What D6 and D7 inherit

### 6.1 — Nothing escalated, one item deferred by decision

No open question remains from D2 or D3; all eleven are decided and applied above. One item
on #181's list is **not resolved and is escalated rather than assumed**: confirmation of
the LFS blast radius, which needs a number that does not exist yet — there are **zero
`.mp4` files in the tree**. It stays with **#185 (D8)**. Detail in the D4 record § 5.

The one thing above that requires the maintainer before D7 can finish is **§ 4.1** — three
portrait pairs to adjudicate. It is a decision, not an open question: the rule is decided
(one shared home), and only which file wins is outstanding.

### 6.2 — `.gitignore` is rewritten in the same commit as the `artifacts/` retirement

`!artifacts/specs/` and `!artifacts/issues/` stop meaning anything the moment those
directories become `docs/specs/`. The same commit adds `.local/` and `brand/wip/`, and
removes the `artifacts/` block entirely. A stale ignore rule is how D3 § 2.1 started.

### 6.3 — `site/` → `website/` ships last and alone

`.github/workflows/deploy-site.yml` syncs `site/` to the production bucket on push to
`main`; `infra/site.yaml` and `docs/site-deploy-walkthrough.md` also carry the path, and
`AGENTS.md` names `site/` on ten lines. Sequence it last, ship it alone with the workflow,
the CloudFormation and the docs in one PR, and confirm the deploy green afterward.

### 6.4 — The governance files are part of the move, not follow-up

Measured: **22 lines across `AGENTS.md` and `CLAUDE.md` name a path that moves** (19 at
`a15f075`; #207 added three more while this document was in review — § 0.3), several
inside literal commands. The full table is in the D4 record § 4. The worst is
`AGENTS.md` line 228 — a closure-pass command naming `artifacts/specs artifacts/issues`,
which after the move matches nothing and **reports success**. #207 shipped a second,
executable copy of that same command in `scripts/closure-pass.fish`, so D7 now has two to
fix.

Three further exact-path references arrived with #207 and must move together under
`R-BRAND-5` and `R-TOOL-1`, or the font gate silently stops matching anything:
`.pre-commit-config.yaml` (`entry: python3 scripts/check_brand_fonts.py`, and
`files: ^(tools/brand/.*\.jsx|brand/.*\.md)$`), `check_brand_fonts.py`'s
`DEFAULT_GLOBS = ("tools/brand/**/*.jsx", "brand/**/*.md")`, and
`generate_fonts_manifest.py`'s default output path `brand/fonts-manifest.json`.
A hook whose `files:` pattern matches nothing does not fail — it passes.

### 6.5 — Machine-local memory files reference paths and no CI check can see them

`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` names directories by path;
`episode-artwork-build-workflow` alone names `tools/brand/`. Those files are outside the
repository. **D6 enumerates them, D7 updates them.**

### 6.6 — History survival is assumed, not proven

Every move is planned as `git mv`. ADR 0021's rename pass compounds it: ~84 files are both
moved and renamed, and a move-plus-edit in one commit is where git's rename detection is
weakest. **D7 stages the renames separately from the moves and verifies `git log --follow`
on at least one file that underwent both**, before the PR is handed over.

### 6.7 — Deliberate scope additions to call out in their PRs

- **Four untracked `.ai` sources become tracked** (R-POD-5, R-EP-5) — flagged to #177.
  Each must be inspected before it enters a public repo: embedded fonts and licences are
  the specific risk in an `.ai` file (conduct rule 5). Two are named `Untitled-1.ai`, so
  renaming them to the convention requires opening them in Illustrator — the maintainer's
  machine, not an agent's.
- **Three cast portraits are deleted** after § 4.1 is adjudicated. They remain in git
  history.
