# Spec: Land the favicon set, README header, and both brand builders on tracked paths (Issue #79)

**Closes:** #79 · **Refs:** #60 (parent — stays open)
**Milestone:** M5 — Web presence
**Labels:** `type: task`, `area: governance`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort high`

> **Sizing rationale.** The **Standard** rung of `AGENTS.md` § "Model and effort sizing" —
> defined-scope, single-repo implementation with every path, filename and content decision supplied
> below. Not Light, because one motion is genuinely open-ended: §4 Step 6 requires **empirically
> proving** whether GitHub's markdown sanitizer preserves `<picture>` + `prefers-color-scheme`, and
> handling an unfavourable result as a reported finding with a working fallback rather than a
> blocked PR. That is judgment, not fill-in-the-blanks. Not Heavy, because nothing here is
> irreversible, nothing spends money, and nothing touches `episodes/` or the feed.

---

## 0. Read the durable contracts first (non-negotiable)

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full** — the binding operating contract: standing commitments, the
   do-automatically and hold-for-the-maintainer lists, the canonical work-item flow, the definition
   of done, and the Fish/macOS local environment. In full, not a skim.
2. `CLAUDE.md` at the repo root — session-mode rules, the lane guard, § "Repo shape", and
   § "Generated artifacts must be self-describing". Where it and `AGENTS.md` appear to conflict,
   **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md` — the maintainer's cross-project standing rules.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — in particular
   `warnings-belong-at-the-point-of-use.md` and `squash-commit-bodies-are-the-permanent-record.md`,
   both of which are load-bearing on this task.
5. `CHANGELOG.md` § Findings and `docs/` — what is already known.
6. **Issue #79 in full, and issue #60's comments 11–16 in full.** #60's **body is superseded** by
   its RE-SCOPE comment of 2026-07-27; the authoritative reading for *this* task is the four
   decision comments dated 2026-07-28 (wordmark decided, wordmark approved, favicon set decided,
   README header + social preview decided, dark variants decided). Read them — they carry the
   maintainer's exact words, which ADR 0016 must quote.

**A durable contract outranks this spec.** If the two conflict, stop and report; do not resolve it
yourself. **This spec is immutable after handoff** — if it is wrong or ambiguous, stop and report
rather than improvising a fix into it.

**The rules that will bite you on _this_ task:**

- **★ The executor declares itself.** Run as `env AUDIO_LAB_EXECUTOR=1 claude …` or the PM-lane
  guard denies every git mutation and in-repo write outside `artifacts/`. If the guard blocks
  something it should not, **say so and ask** — do not weaken it, do not route around it with
  `bash -c`, and do not report the blockage as a finished answer.
- **★ Receipts expire on the next mutation.** Order is **mutate → commit → gate → report**. Name
  the SHA the gate ran against.
- **★ No contract-lawyering.** A criterion you cannot meet is a **finding to report, never a
  criterion to quietly drop.** This bites hardest at Step 6: if `<picture>` is stripped, say so
  loudly and take the fallback. Do not report AC6 as met because the markup is present.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command** — never via a shell variable.
- **★ The commit body is the permanent extended description on `main`.** This repo squashes with
  `COMMIT_MESSAGES` and branches are single-commit. Use `git commit -F` with a file authored
  **outside** the repo. A bare `-m` is a defect. Outline supplied in §4 Step 9.
- **Sources for the copies are gitignored and can move.** The two builders live under
  `artifacts/brand-wip/` and the renders under `output/artwork/` — neither has git history, so
  there is no way to recover their state if you overwrite them. **Copy, never move.** Blob SHAs are
  pinned in §2 so byte-identity is checkable against a fixed value; if a SHA no longer matches, that
  means the maintainer re-ran the builder since handoff — **promote the current file and report the
  delta**, do not fail and do not "restore" anything.
- **Do not re-run any Illustrator builder.** You have no Adobe and cannot see rendered output. Every
  PNG in this PR is an already-approved render; copy it, never regenerate it.

## 0b. Progress tracking

Maintain a live task list — one item per §4 execution step plus each numbered acceptance criterion —
moving each to in-progress/done as you go. Use **TodoWrite/TaskCreate** if available. **If neither
is available, say so once, then re-post the full checklist as inline markdown at the top of every
response that starts or finishes a step**, marking `[x]` done / `[~]` in-progress / `[ ]` todo. Do
not let more than one tool batch pass without a refreshed checklist. Before any long stretch, post a
one-line "next I am doing X."

---

## 1. Intended outcome

`main` carries the two Illustrator builders that derive the Told Straight favicon set and README
header, the ten approved favicon files, the two approved README header images, and the three
approved social/OG cards — all on tracked paths, all reproducible from a fresh clone. `README.md`
opens with the header behind a light/dark `<picture>` switch **whose behaviour has been empirically
tested rather than asserted**, with a documented fallback if GitHub strips it. ADR 0016 records the
favicon, header and card decisions in the maintainer's own words. The two `UNVERIFIED` markers in
the design tokens are replaced with their measured ratios, with the failure case documented at the
value.

Checkable end state: `git ls-files brand/ tools/brand/` lists every file in §3, and
`grep -c UNVERIFIED brand/20260727-toldstraight-design-tokens.css` returns `0`.

## 2. Current state — measured, not asserted

Spec written against `origin/main` at **`9d6547c`**. If `main` has moved, that is expected — branch
from current `main` and note the delta in the PR body; do not stop.

Every claim below was run by the PM thread on 2026-07-28 from the repository root.

**Nothing from the 2026-07-28 design loop is tracked except the wordmark builder:**

```
$ git ls-files | grep -i -E 'favicon|readme-header|social|og-card'
(no output — exit 1)

$ git ls-files brand/
brand/20260727-adobe-illustrator-toldstraight-type-shootout-contact-sheet.png
brand/20260727-toldstraight-design-tokens.css
```

**The two builders to promote, with their blob SHAs pinned at handoff:**

| Source (gitignored) | `git hash-object` at handoff | Bytes |
| --- | --- | --- |
| `artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx` | `496a359797b1956abf95bb77f9467569df88d312` | 19,460 |
| `artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx` | `afbfd3994ab16e4cf29c33ce5da40019dc110298` | 27,424 |

**Render dimensions, verified with `sips`:**

```
favicon-16.png / -16-dark.png                      16 16
favicon-32-frameless.png / -frameless-dark.png     32 32
favicon-180-appletouch.png / -dark.png           180 180
favicon-512-maskable.png / -dark.png             512 512
m1-master-ref-900.png                            900 900
readme-header-b-oneline-1280x400.png            1280 400
readme-header-b-dark-1280x400.png               1280 400
```

**`README.md` has no header image today** — `grep -n -i -E 'picture|<img|!\['` returns only the two
CI badge lines (6, 7) and an unrelated prose use of the word "picture" on line 58.

**Both `UNVERIFIED` markers are still present:**

```
$ grep -n 'UNVERIFIED' brand/20260727-toldstraight-design-tokens.css
176:    --ts-red:      #E4564F;   /* UNVERIFIED — lightened so it survives on ink */
177:    --ts-grey-web: #9A968E;   /* UNVERIFIED */
```

**The next free ADR number is 0016** — `docs/adr/README.md`'s index ends at 0015.

### An inconsistency you will see, already diagnosed — do not "fix" it

`tools/brand/…-wordmark-locked-builder.jsx` (promoted by #78) has `EXPORT_PNG = false` at line 90.
Its `artifacts/brand-wip/` counterpart has `EXPORT_PNG = true` plus an in-file comment reading
*"flipped post-promotion 2026-07-28 — the tools/brand copy stays false as the frozen record."* The
two therefore differ by one line and 96 bytes today, even though #78 recorded a byte-identical
promotion.

**This is deliberate and documented at the point of use. It is not in scope.** The two builders you
promote both carry `EXPORT_PNG = true`; **promote them byte-identical, flag nothing, change
nothing.** Note the resulting inconsistency in the PR body as an observation only — a tracked
toolset where one builder exports and two do not — and leave the decision to the maintainer.

## 3. Deliverables

1. **`tools/brand/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx`** —
   byte-identical copy of the `artifacts/brand-wip/` source. Source stays in place.
2. **`tools/brand/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx`**
   — same treatment.
3. **`brand/favicon/` — ten files** copied from `output/artwork/brand-favicon/`, names preserved
   except the one rename in §4 Step 3:

   ```
   20260728-adobe-illustrator-toldstraight-favicon-16.png
   20260728-adobe-illustrator-toldstraight-favicon-16-dark.png
   20260728-adobe-illustrator-toldstraight-favicon-32-frameless.png
   20260728-adobe-illustrator-toldstraight-favicon-32-frameless-dark.png
   20260728-adobe-illustrator-toldstraight-favicon-180-appletouch.png
   20260728-adobe-illustrator-toldstraight-favicon-180-appletouch-dark.png
   20260728-adobe-illustrator-toldstraight-favicon-512-maskable.png
   20260728-adobe-illustrator-toldstraight-favicon-512-maskable-dark.png
   20260728-adobe-illustrator-toldstraight-favicon-master-512-maskable.svg   ← renamed
   20260728-adobe-illustrator-toldstraight-m1-master-ref-900.png
   ```

   **`favicon-32-framed.png` is deliberately NOT tracked** — it is the option the maintainer
   rejected (#60: *"Agree. 32 frameless."*). Say so in the PR body.
4. **`brand/web/` — five files** copied from `output/artwork/brand-web/`:

   ```
   20260728-adobe-illustrator-toldstraight-readme-header-b-oneline-1280x400.png   light, chosen
   20260728-adobe-illustrator-toldstraight-readme-header-b-dark-1280x400.png      dark twin
   20260728-adobe-illustrator-toldstraight-github-social-stacked-1280x640.png     chosen
   20260728-adobe-illustrator-toldstraight-og-card-stacked-1200x630.png           chosen
   20260728-adobe-illustrator-toldstraight-og-card-dark-stacked-1200x630.png      documented alternative
   ```

   **The five rejected renders stay untracked** (`readme-header-a/c/d`,
   `github-social-oneline`, `og-card-oneline`). Name them in the PR body as deliberate exclusions.
5. **`README.md`** — the header wired in via `<picture>`, immediately above the `# audio-lab`
   heading. Exact markup in §4 Step 5.
6. **`docs/adr/0016-favicon-readme-header-and-card-surfaces.md`** — copied from
   `docs/adr/TEMPLATE.md`, modelled on `0015`, quoting the maintainer verbatim. Content brief in
   §4 Step 4.
7. **`docs/adr/README.md`** — the index gains its 0016 row, matching the existing column format.
8. **`brand/20260727-toldstraight-design-tokens.css`** — both `UNVERIFIED` markers replaced with the
   measured ratios and the failure case documented at the value. Exact text in §4 Step 7.
9. **`CHANGELOG.md`** entry under a `## 2026-07-28` heading (the heading already exists — add to
   its `### Added` and `### Changed` groups rather than creating a duplicate date heading).

## 4. Execution rails

Fish syntax, from the repository root. Each step is followed by its verification command.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git status --short; and git log --oneline -1
git switch -c task/issue-79-brand-deliverables
```

Expected: `main` at `9d6547c` or later, clean tree.

### Step 1b — Continuity walkthrough, immediately after branching

Write it now, not on request, to
`artifacts/walkthroughs/<UTC-timestamp>-issue-79-brand-deliverables.md` — numbered Fish blocks for
sync, branch, gate, commit, push, PR-with-metadata, checks, merge and closure, each with its
verification command, unknowns as ⟨slots⟩. Refresh at **PR opened** and **awaiting merge**.
`artifacts/walkthroughs/` is gitignored — **never commit it.**

### Step 2 — Confirm the sources before copying anything

```fish
git hash-object artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx
git hash-object artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx
```

Expected: `496a359797b1956abf95bb77f9467569df88d312` and
`afbfd3994ab16e4cf29c33ce5da40019dc110298`. **A mismatch is not a failure** — it means the
maintainer re-ran a builder since handoff. Promote the current file, record both SHAs in the PR
body, and say plainly that the pinned value is stale.

### Step 3 — Copy the builders and the assets

**Copy, never move.** The sources are gitignored and have no history to recover from.

```fish
mkdir -p brand/favicon brand/web
cp artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx tools/brand/
cp artifacts/brand-wip/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx tools/brand/

for f in 16 16-dark 32-frameless 32-frameless-dark 180-appletouch 180-appletouch-dark 512-maskable 512-maskable-dark
    cp output/artwork/brand-favicon/20260728-adobe-illustrator-toldstraight-favicon-$f.png brand/favicon/
end
cp output/artwork/brand-favicon/20260728-adobe-illustrator-toldstraight-m1-master-ref-900.png brand/favicon/
# the one deliberate rename — the source name says "favicon" twice
cp output/artwork/brand-favicon/20260728-adobe-illustrator-toldstraight-favicon-master_favicon-512-maskable.svg \
   brand/favicon/20260728-adobe-illustrator-toldstraight-favicon-master-512-maskable.svg

for f in readme-header-b-oneline-1280x400 readme-header-b-dark-1280x400 \
         github-social-stacked-1280x640 og-card-stacked-1200x630 og-card-dark-stacked-1200x630
    cp output/artwork/brand-web/20260728-adobe-illustrator-toldstraight-$f.png brand/web/
end
```

Verification — count, byte-identity, and dimensions:

```fish
ls brand/favicon/ | wc -l                                    # expect 10
ls brand/web/ | wc -l                                        # expect 5
git hash-object tools/brand/20260728-adobe-illustrator-toldstraight-favicon-derivation-builder.jsx
git hash-object tools/brand/20260728-adobe-illustrator-toldstraight-readme-header-and-social-cards-builder.jsx
for f in brand/favicon/*.png brand/web/*.png
    printf '%s ' (basename $f); sips -g pixelWidth -g pixelHeight $f | grep pixel | tr '\n' ' '; echo
end
```

The two `hash-object` values must equal the Step 2 values exactly. Paste the full dimension table.

### Step 4 — ADR 0016

Copy `docs/adr/TEMPLATE.md` to
`docs/adr/0016-favicon-readme-header-and-card-surfaces.md` and model the structure on
`docs/adr/0015-wordmark-dual-lockup-system.md`. It records **four** decisions, each with the
maintainer's verbatim words quoted from #60 and each with its stated reversal condition:

1. **Favicon set — frameless at 32 and below, framed at 180 and above**, all derivations fills-only.
   His words: *"Agree. 32 frameless."* Reasoning: the frame costs 6px of content width in both
   dimensions on a 32px canvas and wins the competition for pixels, reading as a border first and a
   mark second. Reversal condition, verbatim from #60: if the boxed silhouette should be the
   recognizable shape at *every* size, framed wins at 32 and the fix is to size the `TS` down rather
   than fight the frame.
2. **README header — variant B, one-line, 1280×400, with the season line**, plus a dark twin.
   Reasoning: a banner should spend the width it has (150pt one-line vs 128pt stacked), and the
   season line tells a visitor what the show is without reading further.
3. **GitHub social preview stacked at 1280×640; OG card stacked at 1200×630**, with the dark OG
   board kept as a **documented alternative, not a companion**. His framing, which must be quoted
   because a future session will otherwise read the difference as drift: **"Header and social
   preview do not need to be the same visual object."**
4. **Only two surfaces theme-switch** — README header (`<picture>` + `prefers-color-scheme`) and
   favicons (`<link rel="icon" media=…>`). GitHub's social preview and `og:image` each take exactly
   one image and carry no theme signal, so shipping a dark board as though it were responsive is the
   trap. Record the outcome of Step 6 here: state whether `<picture>` was **proven** to work in this
   repository or **proven not to**, with the evidence. Do not write this section before Step 6 runs.

Record `#B02A28` on `#14140F` measuring **2.82:1** as the load-bearing reason the dark variants use
`#E4564F` (5.05:1) — it is a measurement, not a preference, and a future session "restoring brand
accuracy" would break accessibility.

Then add the index row to `docs/adr/README.md`, matching the existing column format:
`| [0016](0016-favicon-readme-header-and-card-surfaces.md) | … | accepted | 2026-07-28 | M5 |`.

Verification: `ls docs/adr/0016*` and `grep -c '0016' docs/adr/README.md` (expect `1`).

### Step 5 — Wire the header into `README.md`

Insert immediately **above** the `# audio-lab` heading at line 1, so it is the first thing rendered:

```html
<picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="brand/web/20260728-adobe-illustrator-toldstraight-readme-header-b-dark-1280x400.png">
  <img src="brand/web/20260728-adobe-illustrator-toldstraight-readme-header-b-oneline-1280x400.png"
       alt="Told Straight — Dept. of Neurodevelopmental Affairs. Season One: Adult ADHD."
       width="1280">
</picture>
```

The `alt` text is required and must describe the wordmark and season line — the header is the first
thing a screen reader meets, and this repository's whole argument is that evidence should be
reachable. Relative paths are correct for GitHub README rendering; do not substitute absolute
`raw.githubusercontent.com` URLs, which break on forks.

### Step 6 — PROVE the `<picture>` behaviour. Do not assert it.

#60 flags this as **UNVERIFIED in this repository**. It is documented GitHub behaviour that has
never been rendered here. Two halves; you own the first.

**The mechanical half — does GitHub's markdown sanitizer preserve the element?** After pushing the
branch (Step 10), fetch GitHub's own rendered HTML for the README *on the branch* and look for the
`<source>`:

```fish
gh api "repos/Jared-Godar/audio-lab/readme?ref=task/issue-79-brand-deliverables" \
  -H "Accept: application/vnd.github.html" > /tmp/readme-rendered.html
grep -c '<picture' /tmp/readme-rendered.html
grep -o 'prefers-color-scheme[^"]*' /tmp/readme-rendered.html
grep -c '<img' /tmp/readme-rendered.html
```

**Control, run it first so a broken check and a real result are distinguishable:** the same command
against `main` (which has no `<picture>`) must return `0` for `<picture>` and `2` for `<img>` — the
two CI badges. The PM verified on 2026-07-28 that this endpoint returns rendered HTML and that the
two badge `<img>` tags survive sanitization, so a `0` from the control means the *command* is wrong,
not the markup.

Expected on the branch: `<picture` count `1`, the `prefers-color-scheme` string present, `<img>`
count `3`.

**If the `<source>` is stripped** — element absent or `media` attribute gone — that is the
unfavourable result the spec anticipates. **Report it as a finding and take the fallback**: replace
the whole `<picture>` block with the bare light `<img>` (same `src`, same `alt`, same `width`), keep
the dark PNG tracked for future use, and state plainly in the PR body and in ADR 0016 that GitHub
does not preserve it here. **Do not leave markup that claims a behaviour it does not have.** Do not
mark AC6 met on the strength of the markup being present.

**The visual half is the maintainer's** — toggling GitHub's theme and looking at the rendered
README. State in the PR body that this half is outstanding and name it as his check. Do not claim
it.

### Step 7 — Close the two `UNVERIFIED` markers

In `brand/20260727-toldstraight-design-tokens.css`, replace lines 176–177 with the measured values.
The warning goes **at the value**, per the standing rule, not in a header comment:

```css
    /* Measured 2026-07-28 against a WCAG 2.x checker validated on five controls (#60).
       Do NOT "restore brand accuracy" by putting the print red #B02A28 back here:
       on #14140F it measures 2.82:1 and fails AA body, AA large and AAA. */
    --ts-red:      #E4564F;   /* 5.05:1 on #14140F — AA body pass, AAA fail */
    --ts-grey-web: #9A968E;   /* 6.27:1 on #14140F — AA body pass, AAA fail */
```

Verification: `grep -c UNVERIFIED brand/20260727-toldstraight-design-tokens.css` returns **`0`**.
Check the whole file, not only those lines — if `UNVERIFIED` appears elsewhere, report it rather
than silently editing beyond scope.

### Step 8 — CHANGELOG

Add to the **existing** `## 2026-07-28` heading. Under `### Added`: the two builders, the ten
favicon files, the five web cards, ADR 0016, and the README header — saying plainly that these
were approved on 2026-07-28 and existed only on gitignored paths until now. Under `### Changed`:
the tokens file's two hedges replaced with measured ratios. If Step 6 came back unfavourable, record
that under `### Findings` — it is a fact about an external service (GitHub's markdown sanitizer)
that is not visible in the diff, which is exactly what that section exists for.

### Step 9 — Commit, then gate on the committed state

```fish
git add -A
git status --short
git commit -F /tmp/commit-msg-issue-79.txt
bash scripts/check > /tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
git log --oneline -1
```

**Commit body outline** (author it at `/tmp/commit-msg-issue-79.txt`, **outside** the repo; line 1
identical to the PR title; roughly 500–2,500 bytes; curated, not a paste of the PR body):

- What changed: seventeen files promoted from gitignored paths to `brand/` and `tools/brand/`, the
  README header wired behind a `<picture>` switch, ADR 0016, two token hedges closed.
- Why: a full day of approved design work reached no fresh clone, no cloud session and no cold
  start — the same failure class as #68, reproduced the following day.
- The decisions implemented, one line each: frameless favicons at ≤32, header variant B one-line
  with the season line, stacked social and OG cards, dark variants for the only two surfaces that
  can theme-switch.
- **The Step 6 result, stated as fact**: whether `<picture>` was proven to work here or proven not
  to, and which markup consequently shipped.
- What was deliberately excluded: the rejected `32-framed` favicon and the five rejected render
  variants; the GitHub social-preview upload, which is a Settings action; #60 stays open.

Expected: `exit=0` and `All checks passed.` Name the commit SHA the gate ran against.
(`scripts/check --no-labels` skips the networked label-drift check if offline.)

### Step 10 — Push, then Step 11 — open the PR

Neither is gated. **From the first push the PR is on merge HOLD** — say so explicitly — until
read-back verification completes, then announce **GREEN LIGHT** proactively. **Never merge.** The
GUI's check status is never the authoritative signal.

Note the ordering dependency: **Step 6 runs after the push**, because it reads the branch from
GitHub. If Step 6 forces the fallback, amend the README, ADR 0016 and the CHANGELOG, re-commit,
re-gate, and force-push the branch *before* opening the PR — a branch force-push is normal here;
`main` history is what must never be rewritten.

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Land the favicon set, README header, and both brand builders on tracked paths (#79)" \
  --assignee Jared-Godar \
  --label "type: task" --label "area: governance" --label "priority: high" \
  --milestone "M5 — Web presence" \
  --body-file /tmp/pr-body-issue-79.md
```

The body carries `Closes #79` **on its own line**, and `Refs #60` on another — #60 is the parent and
**must not close**. The combined form `Closes #79, #60` would link only the first and is forbidden.

Verify the closure links with the authoritative GraphQL field, never a body text-match:

```fish
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number state}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[].number'
```

Expected: exactly `79`, and **not** `60`. The field lags a few seconds behind creation — re-query
rather than trusting a short first read. Then read back the rest:

```fish
gh pr view $pr -R Jared-Godar/audio-lab \
  --json number,labels,milestone,assignees \
  --jq '{number, labels:[.labels[].name], milestone:.milestone.title, assignees:[.assignees[].login]}'
gh pr checks $pr -R Jared-Godar/audio-lab --watch
```

The PR body carries: every decision restated as implemented; the Step 6 result with its command
output and its control; the deliberate exclusions (rejected favicon and render variants, the
social-preview upload as a Jared action); the `EXPORT_PNG` observation from §2; the gate output from
the **committed** state with its SHA; and the CI receipt.

## 6. Numbered acceptance criteria

- **AC1.** Both builders present under `tools/brand/`, `git hash-object` output pasted and equal to
  the §2 pinned values — or the mismatch reported explicitly per Step 2.
- **AC2.** `ls brand/favicon/ | wc -l` returns `10`; `ls brand/web/ | wc -l` returns `5`; the full
  `sips` dimension table for all fifteen images is pasted and every dimension matches §2.
- **AC3.** The SVG master is present under its renamed filename, and the rename is named in the PR
  body as deliberate.
- **AC4.** `favicon-32-framed.png` and the five rejected web renders are **absent** from
  `git ls-files brand/` — output pasted — and named in the PR body as deliberate exclusions.
- **AC5.** `docs/adr/0016-*.md` exists, quotes the maintainer verbatim on all four decisions, and
  `docs/adr/README.md` carries its index row.
- **AC6.** The Step 6 control ran against `main` and returned `0` `<picture>` / `2` `<img>`, **and**
  the branch result is pasted. The README's final markup matches the result: `<picture>` if
  preserved, bare `<img>` if stripped. **A stripped result reported honestly satisfies this
  criterion; markup that claims an unproven behaviour does not.**
- **AC7.** `grep -c UNVERIFIED brand/20260727-toldstraight-design-tokens.css` returns `0`, and the
  2.82:1 justification is present as a comment at the value.
- **AC8.** `bash scripts/check` green on the **committed** state — output pasted, SHA named.
- **AC9.** CI green on the pushed branch, with the run receipt.
- **AC10.** `closingIssuesReferences` returns `79` and not `60` — output pasted.
- **AC11.** CHANGELOG entry in the same PR, under the existing `## 2026-07-28` heading.
- **AC12.** Spec present byte-identical at `artifacts/specs/` and `prompts/` (`cmp` output pasted).
- **AC13.** Continuity walkthrough written after branching and refreshed at PR-open, no ⟨slot⟩ left
  unfilled except those tagged deliberate, and **not** committed.
- **AC14.** Every deliberately-omitted or deferred item named explicitly in the PR body.

## 7. Non-goals

- **The eleven static-site elements** from #60's re-scope §4 — episode card, Exhibit card as
  HTML/CSS, CAUTION box, transcript page, 404, footer authority block, site header lockup. They need
  the site to exist; they stay on #60.
- **Per-episode OG cards** — a template-plus-data-merge job for M5. Noted on #60, not built.
- **Uploading the GitHub social preview.** A repo Settings action for the maintainer
  (Settings → General → "Social preview"), not a commit. The PNG is tracked so he has a durable
  source to upload from; the upload itself is out of scope.
- **Re-setting the Ep01/Ep02 episode artwork** — #60's child-A work, and it touches the gated
  `episodes/` path.
- **Running or modifying any Illustrator builder.** You cannot see rendered output.
- **The `EXPORT_PNG` inconsistency in the already-promoted wordmark builder** — observed in §2,
  reported in the PR body, deliberately not changed.
- **Re-opening any decided question.** ADR 0015 and #60 comments 11–16 are settled.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| `main` at `9d6547c`, clean tree, no open PRs | **PM-VERIFIED** — `git log`/`git status`, 2026-07-28 |
| Nothing favicon/header/social-related is tracked | **PM-VERIFIED** — `git ls-files \| grep -i -E …`, exit 1 |
| The two builders' blob SHAs and byte counts | **PM-VERIFIED** — `git hash-object`, `ls -la`, 2026-07-28 |
| All fifteen render dimensions | **PM-VERIFIED** — `sips -g pixelWidth -g pixelHeight` |
| `README.md` has no header image | **PM-VERIFIED** — `grep -n -i -E 'picture\|<img\|!\['` |
| Two `UNVERIFIED` markers at lines 176–177 | **PM-VERIFIED** — `grep -n UNVERIFIED` |
| Next free ADR number is 0016 | **PM-VERIFIED** — `tail docs/adr/README.md` |
| `EXPORT_PNG` divergence in the promoted wordmark builder | **PM-VERIFIED** — `diff`, 96-byte delta, one line |
| The readme endpoint returns rendered HTML and preserves `<img>` | **PM-VERIFIED** — run against `main`, 2 `<img>` found |
| GitHub preserves `<picture>` + `prefers-color-scheme` **in this repo** | **PM-UNVERIFIED** — documented behaviour, never rendered here. Step 6 exists to settle it; the fallback exists because it may not |
| `?ref=<branch>` returns the branch's README rather than `main`'s | **PM-UNVERIFIED** — the endpoint accepts `ref`, but only the default-branch form was run. If the branch form errors, push first and re-read; if it still errors, report it and fall back to reading the rendered page another way rather than skipping the proof |
| The measured contrast ratios (5.05:1, 6.27:1, 2.82:1) | **RELAYED** — measured by PM v8 under #60 with five controls, not re-run this session |

## 9. References

- **Issue #79** — this work item. **Issue #60** — the parent; its **body is superseded** by the
  2026-07-27 RE-SCOPE comment, and the authoritative decisions for this task are the four
  2026-07-28 comments (wordmark approved, favicon set, README header + social preview, dark
  variants).
- **[ADR 0015](docs/adr/0015-wordmark-dual-lockup-system.md)** — the dual-lockup system that fixed
  M1 as the favicon ancestor. ADR 0016 follows it and does not amend it.
- **#68** — established the promote-out-of-`artifacts/` pattern. **#78** — applied it to the
  wordmark builder; this spec follows the same shape.
- Files touched: `tools/brand/`, `brand/favicon/`, `brand/web/`,
  `brand/20260727-toldstraight-design-tokens.css`, `README.md`, `docs/adr/`, `CHANGELOG.md`.
- Contracts: `AGENTS.md` § "Canonical work-item workflow", § "Definition of done",
  § "Hold for the maintainer"; `CLAUDE.md` § "Repo shape", § "Generated artifacts must be
  self-describing"; memory `warnings-belong-at-the-point-of-use`,
  `squash-commit-bodies-are-the-permanent-record`.
- **Provenance:** authored by the PM thread (v9) on 2026-07-28 against `main` at `9d6547c`, from
  decisions the maintainer made in the 2026-07-28 interactive design loop recorded on #60. Every
  §2 measurement was run this session from the repository root.

---

## Handoff — the launch block the PM hands the maintainer (PM-only; delete before the executor works)

```fish
gh issue comment 79 -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/20260728-issue-79-brand-deliverables-favicon-header.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model claude-sonnet-5 --effort high \
  "Read and execute artifacts/specs/20260728-issue-79-brand-deliverables-favicon-header.md in full."
```
