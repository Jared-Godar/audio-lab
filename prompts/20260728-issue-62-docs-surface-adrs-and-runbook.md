# Spec: Build the docs surface — ADRs, a runbook, and a decision-capture habit (Issue #62)

**Closes:** #62
**Milestone:** none — #62 is deliberately unmilestoned. Omit `--milestone` entirely.
**Labels:** `type: docs`, `area: governance`, `priority: medium`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-fable-5 --effort high`

> **Sizing rationale, stated honestly.** This is prose authorship for future humans, at volume:
> thirteen ADRs, a runbook, and four surgical edits to governance files. It is not algorithmically
> hard, so it is not the "Heavy — opus" rung; it *is* long-form writing where fidelity to a source
> comment matters more than cleverness, which is what `claude-fable-5 --effort high` is for. **The
> risk this sizing accepts:** a prose-strong model may paraphrase a source decision into something
> more elegant and less true. §0's starred rule and AC3 exist specifically to counter that.

> **PLACEMENT.** `artifacts/specs/` is **tracked** here. Commit this spec at
> `artifacts/specs/20260728-issue-62-docs-surface-adrs-and-runbook.md` **and** copy it
> byte-identical to `prompts/20260728-issue-62-docs-surface-adrs-and-runbook.md`. Verify with `cmp`.
> `prompts/` seeds are **immutable after handoff**.

---

## 0. Read the durable contracts first (non-negotiable)

1. **`AGENTS.md` on `main` in full.**
2. `CLAUDE.md` at the repo root. Where they appear to conflict, **`AGENTS.md` wins**.
3. `~/.claude/CLAUDE.md`.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — **especially
   `warnings-belong-at-the-point-of-use.md`**, which is the governing principle for §3's ADR 0010
   and for how this PR handles the SPF record.
5. `CHANGELOG.md` § Findings — it is a **primary source** for several ADRs here, not background.
6. **Issue #62 in full.** Its body is authoritative; it has no comments. Also read the specific
   source issues named per-ADR in §3 — you will be quoting them.

**A durable contract outranks this spec.** If they conflict, stop and report.
**This spec is immutable after handoff** — if it is wrong or ambiguous, stop and report.

**ONE NAMED EXCEPTION, already resolved — do not stop and report on it.** §5b authorizes you to
squash-merge **this PR only**. That collides with three contracts saying an executor never merges.
The collision was raised with the maintainer *before* this spec was written and he overrode it, as
`AGENTS.md` § "Jared is the absolute authority" expressly provides for. **Read §5b before merging
anything**; its eleven-condition gate is mechanical and any single failure means do not merge.

**The rules that will bite you on _this_ task:**

- **★ Quote the source verbatim; never improve it.** Every backfilled ADR (0010–0013) **must
  contain a verbatim block quote of its source text** — the issue comment, CHANGELOG § Findings
  entry, or `ROADMAP.md` passage it derives from — with the source named. Paraphrase belongs only in
  the surrounding commentary. A decision restated more elegantly is a decision quietly altered, and
  this repository has **four recorded instances** of a tracked file asserting something false about
  its own state. Do not make a fifth.
- **★ Never duplicate a decision that already lives somewhere authoritative — point at it.** Two
  copies of one fact drift, and drift is the exact failure class #68/#30/#31 recorded. This applies
  concretely to **ADR 0006** (the full text is in `AGENTS.md` § "Recorded divergences") and **ADR
  0010** (the operative warning is at the resource in `infra/dns.yaml`). Those ADRs **summarize and
  link**; they do not re-host the text.
- **★ Label prose as prose.** §4C's two artifacts are an `AGENTS.md` line and a PR-template
  checkbox. **Neither is a gate.** Nothing rejects a PR that records a decision without writing an
  ADR. The PR body and the ADR README must both say so in plain words. Presenting either as
  enforcement is the artifact-is-not-the-behavior failure this repo exists in the shadow of.
- **★ Do not invent runbook steps.** A procedure you cannot source from a tracked file, a merged PR,
  or the CHANGELOG is written as an explicit stub naming what is missing — never as plausible
  commands. An invented runbook is worse than no runbook, because it will be trusted once.
- **★ Receipts expire on the next mutation.** Order is **mutate → commit → gate → report**.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command.**
- **★ The executor declares itself.** `env AUDIO_LAB_EXECUTOR=1 claude …`, or the PM-lane guard
  denies every git mutation and in-repo write outside `artifacts/`. If the guard blocks something it
  should not, **say so and ask** — do not weaken it, do not report the blockage as the answer.

## 0b. Progress tracking

Maintain a live task list — one item per §4 step plus each acceptance criterion. Use
**TodoWrite/TaskCreate** if available; otherwise say so once and re-post the full checklist inline
at the top of every response that starts or finishes a step. This spec has ~21 file touches; an
unrefreshed checklist will lose one.

---

## 1. Intended outcome

`docs/adr/` exists with a template, an index, and **thirteen** ADRs — nine migrated from
`ROADMAP.md` § "Decisions and what they constrain" and four backfilled from decisions that
previously survived only in issue comments. `docs/runbook.md` exists with the operational
procedures that can be honestly sourced, and explicit stubs for those that cannot.
`ROADMAP.md` § "Decisions and what they constrain" is replaced by a pointer and a one-line-per-ADR
index that preserves the milestone linkage. `AGENTS.md` and the PR template each carry one new
line about capturing decisions, **both labelled in-file as prose rather than mechanism.**

## 2. Decisions — made by the maintainer and the PM, implement as written

Do not re-litigate these.

1. **§4A — option 1: ADRs plus a runbook, both under `docs/`.** Maintainer, 2026-07-28.
2. **§4B — migrate, delegated to the PM, decided as follows.** `ROADMAP.md` § "Decisions and what
   they constrain" (lines 153–277 on `c628bd1`) **migrates in full to `docs/adr/`.** A pointer plus
   a compact index table stays behind. **§ "Open decisions" does NOT migrate and stays in
   `ROADMAP.md`.**
   **The principle, which is also §4C's answer:** *a decided thing is an ADR; an undecided thing is
   roadmap.* When an open decision closes, it moves from `ROADMAP.md` § "Open decisions" into a new
   ADR. State this principle in `docs/adr/README.md` — it is the rule that keeps the two files from
   becoming each other.
   **Reversal condition:** if within a month the index table has drifted from the ADRs it lists,
   drop the table and leave only the pointer — a stale index is worse than no index.
3. **§4C — both, and both are prose.** An `AGENTS.md` § "Definition of done" line **and** a
   `.github/pull_request_template.md` checkbox. Maintainer, 2026-07-28. See §0's starred rule.
4. **The backfill set is exactly five, named in §3.** #62 §5 warns this work "expands to fill
   available time." Five is the bar; do not add a sixth.
5. **The `eleven_v3` model decision is REAL, made personally by the maintainer, and it resolves a
   contradiction that is currently live in four places.** #62 §2 Gap 2 listed it as decided;
   `ROADMAP.md` listed the same bake-off under § "Open decisions" as blocking M3's entire
   architecture. The PM raised the contradiction on 2026-07-28 and the maintainer resolved it the
   same day, in these words:

   > "I made the _v3 over multi_v2 call personally, so you can document that as real, not assumed
   > and resolve contradictory statements"

   > "Although I am theoretically open to using both models for case by case calls if necessary -
   > however you want to log and document that"

   **Both halves are load-bearing and must both reach ADR 0014 (§3.4):**

   - **`eleven_v3` is the decision, and it settles M3's architecture.** v3 accepts `style` and
     `speaker_boost` with HTTP 200 and silently discards them, and is expressive via inline audio
     tags instead. So the tuning app is a **markup editor with live preview, not a mixing board** —
     and `transcript-markup.txt`'s existing legend is already markup-shaped. **M3 is unblocked.**
   - **`multilingual_v2` is NOT retired.** The maintainer keeps it available for case-by-case calls.
     ADR 0014 must record this as a **default with a documented exception path**, never as an
     exclusive choice, and its `## Consequences` must state that M3's markup editor **must not
     foreclose** rendering a given line or episode on `multilingual_v2`. A future session reading
     "v3 was chosen" and deleting the `multilingual_v2` code path would be acting on a
     half-quotation.

   **This decision makes four tracked statements stale. Fixing all four is in scope** — see §3.6a.
   Getting the ADR right and leaving `ROADMAP.md` saying "blocked" would be the same
   falsehood class the repo has already recorded four instances of.

**Baseline** — `origin/main` at `c628bd16cc33e0bbf88985c06f8caf0ad1eba8fa`, measured 2026-07-28:

```
$ grep -c '^### ' ROADMAP.md      # within § Decisions, lines 153-277
9
$ ls docs/
20260727-adobe-indesign-toldstraight-type-shootout-guide.md  PM-WORKFLOW.md
aws-billing-access-finding.md  aws-identity-center-roles.md
aws-identity-center-setup.md   domain-availability-research.md
elevenlabs.md  recording-runbook.md  voice-capture.md
$ ls docs/adr 2>&1
ls: docs/adr: No such file or directory
```

Note `docs/recording-runbook.md` **already exists** and is 21,711 bytes. The new `docs/runbook.md`
is for *infrastructure and account* procedures and **must not duplicate it** — link to it instead.

**If `origin/main` has moved:** expected. Branch from current `main`, note the delta. If the move
touched `ROADMAP.md` § Decisions, **stop and report** — this spec's line numbers would be stale.

## 3. Deliverables

### 3.1 — `docs/adr/TEMPLATE.md`

Minimal and actually fillable. Fields: `Number`, `Title`, `Status` (`accepted` / `superseded by
NNNN` / `reversed`), `Date`, `Source` (issue/PR/file the decision was made in), then `## Context`,
`## Decision`, `## Consequences`, `## Reversal condition`.

**`Reversal condition` is a required field, not optional.** It is a standing house rule that every
recommendation names what would have to be true to reverse it. Where a migrated decision has no
recorded reversal condition, write `Not recorded at decision time.` — do **not** invent one.

### 3.2 — `docs/adr/README.md`

The index. Contains: the one-paragraph purpose; the **decided-is-ADR / undecided-is-roadmap
principle** from §2.2; a table of all thirteen ADRs (number, title, status, date, the milestone it
constrains where one applies); and an explicit paragraph stating that **the capture habit in §4C is
prose, enforced by nothing** — with the honest note that `gh pr create --body-file` bypasses the PR
template entirely.

### 3.3 — Nine migrated ADRs

From `ROADMAP.md` § "Decisions and what they constrain", in this exact order and numbering. Preserve
each entry's `**Constrains M<n>:**` content as the `## Consequences` section — that linkage is the
most load-bearing part of the section and must not be lost in reformatting.

| ADR | Title (from the existing `###` heading) |
|---|---|
| 0001 | Route 53 auto-creates the hosted zone → CloudFormation manages records, not zones |
| 0002 | ElevenLabs bills at 0.55× the advertised rate |
| 0003 | Library voices work without being added to the account |
| 0004 | One Professional Voice Clone slot |
| 0005 | `enforce_admins: true` on `main` |
| 0006 | Branch protection stays as-is — audio-lab is deliberately stricter (#31) |
| 0007 | Descriptive artifact names, cache identity in a manifest |
| 0008 | No Free Tier credits exist — Identity Center is free to enable |
| 0009 | `.fm` costs $122/yr |

**ADR 0006 is a pointer, not a copy.** Its full text — the four-repo comparison table, the reasoning,
and the verbatim reversal condition — lives in `AGENTS.md` § "Recorded divergences from the reference
repositories". ADR 0006 gives a 3–5 line summary, the date, and a link to that section, and says
explicitly that `AGENTS.md` is authoritative. Two copies would drift.

### 3.4 — Five backfilled ADRs

Each **must** carry a verbatim block quote of its named source.

| ADR | Decision | Source to quote verbatim |
|---|---|---|
| 0010 | **SPF must stay `~all` because Apple string-matches the record it issues** | `CHANGELOG.md` § Findings, 2026-07-27 entry beginning "Apple's Custom Email Domain verifier string-matches" |
| 0011 | iCloud+ chosen over WorkMail and over SES-plus-Lambda | issue **#54** — locate the comment recording the criterion that decided it |
| 0012 | Per-turn stems over a monolithic render, because the host track is temporary | issue **#43** |
| 0013 | Classic branch protection retained over Rulesets; signed commits declined | issue **#30** |
| 0014 | **`eleven_v3` is the default model; `multilingual_v2` stays available case-by-case** | the maintainer's two statements quoted verbatim in **§2.5 of this spec** — quote both, and cite them as "maintainer, in session, 2026-07-28" |

**ADR 0014 has requirements the others do not**, all from §2.5:

- `Status: accepted`, `Date: 2026-07-28`, `Source: maintainer decision, recorded in issue #62's
  executor spec` (this file), cross-referencing **#10** where #62 §2 Gap 2 first listed it.
- `## Decision` states v3 as the **default**, explicitly **not** exclusive.
- `## Consequences` states: M3 is **unblocked**; its architecture is a **markup editor with live
  preview**, because v3 accepts `style`/`speaker_boost` with HTTP 200 and discards them; and the
  design **must not foreclose** rendering a line or episode on `multilingual_v2`.
- `## Reversal condition`: not recorded at decision time — the maintainer stated an ongoing
  exception path rather than a reversal trigger. Write exactly that; do not invent one.
- The `docs/adr/README.md` index row for 0014 notes it constrains **M3**.

**ADR 0010 is the one that matters most** (#62 AC explicitly requires it). It must state that the
**operative** warning lives at the resource in `infra/dns.yaml`, link there, and say that the ADR is
the *reasoning record*, not the enforcement. Per `warnings-belong-at-the-point-of-use`, the file
comment outranks the ADR; the ADR must not read as if it replaced it.

If a named source comment cannot be found on the issue, **write the ADR from the CHANGELOG or
`ROADMAP.md` if the content is there and say which source you used** — and if it is nowhere, mark
the ADR `Status: unsourced` with a one-line note and report it. Do not reconstruct it from
inference.

### 3.5 — `docs/runbook.md`

Infrastructure and account procedures. Candidate list from #62 §3: deploying DNS by change-set;
rotating the capped ElevenLabs key; re-verifying the billing rate; re-provisioning an Identity
Center permission set; replacing host stems.

**Source each from tracked material** — `infra/`, `docs/aws-identity-center-*.md`,
`docs/elevenlabs.md`, `CHANGELOG.md`, merged PR bodies. **Any procedure you cannot source is a
stub** naming what is missing and where the knowledge probably lives. Link to
`docs/recording-runbook.md` for recording; do not restate it.

### 3.6 — `ROADMAP.md` § Decisions replaced by pointer + index

Replace lines 153–277 with a short section: one sentence saying the decision records moved to
`docs/adr/` and why, a link, and a compact table — ADR number, title, and the milestone it
constrains.

### 3.6a — Retire the four stale "blocked by the model decision" statements

The §2.5 decision makes four tracked statements false. **All four are in scope.** Measured on
`c628bd1`, 2026-07-28:

```
$ grep -ni 'block' ROADMAP.md
52:- Blocked by: M1, and **the model bake-off** (see Open decisions).
80:- **Blocked by the model decision** — its entire architecture depends on it.
282:### The model bake-off — blocks M3's entire architecture
```

1. **Line 282 — § "Open decisions" → the bake-off entry is REMOVED**, because it is now decided and
   lives in ADR 0014. This is the *only* change permitted to § "Open decisions"; the "Label taxonomy
   refinements" entry beneath it stays byte-identical. Leave a one-line pointer: decided
   2026-07-28, see ADR 0014. **This is the decided-is-ADR / undecided-is-roadmap principle (§2.2)
   executing for the first time — say so in the PR body; it is the proof the principle works.**
2. **Line 80 (M3)** — replace "Blocked by the model decision" with the resolved architecture: a
   markup editor with live preview, per ADR 0014. The second bullet about a "pre-rendered parameter
   grid; ~3,400 credits for a 5×5 grid over two dials" describes the **mixing-board** design that
   v3 rules out as the primary shape — **do not delete it**; re-frame it as the cost that would
   apply *if* a `multilingual_v2` slider path is ever taken under 0014's exception, and link it.
3. **Line 52 (M2)** — "Blocked by: M1, and **the model bake-off**" — the bake-off half is resolved.
   Re-state what, if anything, still blocks M2 based on what the file actually says; **if the answer
   is not determinable from tracked files, say so in the PR body and leave a marked question rather
   than guessing.** M2's milestone shows `open_issues=0`.
4. **The M3 GitHub milestone description** reads `BLOCKED by the v3 vs multilingual_v2 model
   decision` and is now false. See §3.6b.

### 3.6b — Fix two stale GitHub milestone descriptions (executor-only, and why)

Measured 2026-07-28 via `gh api repos/Jared-Godar/audio-lab/milestones`:

```
M3 | open=2 | Dial/markup app persisting settings to the cast record. BLOCKED by the v3 vs multilingual_v2 model decision.
M5 | open=3 | IAM Identity Center, DNS, static site. BLOCKED by the free-tier credit check.
```

**Both are false.** M3's is resolved by §2.5. **M5's was already false before this session** —
`ROADMAP.md` line 116 records "Blocked by: nothing. Unblocked 2026-07-26 — no Free Tier credits
exist to lose," and ADR 0008 records the same. That is an **independent, pre-existing instance of
the falsehood class**, found while fixing M3's; fix it in the same pass and name it in the PR body
as a separate find.

```fish
gh api -X PATCH repos/Jared-Godar/audio-lab/milestones/3 \
  -f description='Dial/markup app persisting settings to the cast record. Architecture decided 2026-07-28 (ADR 0014): eleven_v3, so this is a markup editor with live preview, not a mixing board. multilingual_v2 remains available case-by-case.' \
  --jq '.description'
gh api -X PATCH repos/Jared-Godar/audio-lab/milestones/5 \
  -f description='IAM Identity Center, DNS, static site. Unblocked 2026-07-26 — no Free Tier credits exist to lose (ADR 0008).' \
  --jq '.description'
gh api repos/Jared-Godar/audio-lab/milestones --jq '.[]|select(.number==3 or .number==5)|"M\(.number): \(.description)"'
```

**FIRST, CHECK WHETHER THIS IS ALREADY DONE.** The maintainer was handed the same two commands to
run directly from his terminal on 2026-07-28 and may have already run them. Read the descriptions
before patching:

- If **both already read as above**, do nothing, and record in the PR body that the maintainer
  applied them directly. Do **not** re-PATCH to no effect and report it as work.
- If they read correctly but **lack the ADR cross-reference** (`ADR 0014`, `ADR 0008`), add only
  that — the ADRs will exist by the time you run this, so the reference stops being a forward
  reference to a nonexistent document.
- If still stale, apply both.

**Why this is not PM work:** milestone descriptions are editable only through `gh api -X PATCH`
(there is no `gh milestone` command — verified), and the PM-lane guard denies `gh api -X PATCH`
categorically. The PM attempted it on 2026-07-28 and was refused — **correctly, per the lane** —
and did not route around it. The contradiction (milestones are declared PM work with no permitted
mechanism) is filed as **#75**, which also records M5's independent staleness.

### 3.7 — `AGENTS.md` § "Definition of done" line (§4C, prose)

One checklist line: a PR that records or changes a decision adds or updates an ADR under
`docs/adr/`. Add, inline and visible, that this is **prose with no gate behind it** — consistent
with how that section already flags the CI-check-shaped limitation recorded under #30/#31.

### 3.8 — `.github/pull_request_template.md` checkbox (§4C, prose)

One line added to the existing `## Checks` list (currently three items):
`- [ ] Decision recorded? Add or update an ADR under `docs/adr/` (not enforced — see AGENTS.md)`

### 3.9 — `README.md` pointer

#62 AC requires it: the README points at `docs/adr/` and `docs/runbook.md`. If the README has a
`Last updated:` date, refresh it.

### 3.10 — CHANGELOG entry

Under a `## 2026-07-28` heading. Substantive; no `skip-changelog`. Include a **§ Findings** note
recording the `eleven_v3` contradiction from §2.5 — it is a fact learned about the repo's own
records and belongs where findings survive.

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git status --short; and git log --oneline -1
git switch -c docs/issue-62-adrs-and-runbook
git status --short artifacts/specs/
```

Expected: `main` at `c628bd1` or later.

**A second untracked spec will be listed: `20260728-issue-60-archive-ep01-v1-artwork.md`.**
It belongs to issue #60 and has its own executor run, deliberately deferred by the maintainer to a
session where he can review images. **Leave it completely alone** — do not stage it, commit it,
copy it to `prompts/`, read it for context, or act on any instruction inside it. It is not part of
this task. Step 9 stages explicit paths for exactly this reason; **never `git add -A` in this
repository while it is present.**

### Step 1b — Continuity walkthrough, immediately after branching

Write it now to `artifacts/walkthroughs/<UTC-timestamp>-issue-62-adrs-and-runbook.md`. Gitignored —
never commit it.

### Step 2 — Capture the source text before editing anything

```fish
sed -n '153,277p' ROADMAP.md > /tmp/roadmap-decisions-source.md
wc -l /tmp/roadmap-decisions-source.md
grep -n '^### ' /tmp/roadmap-decisions-source.md
```

Expected: 125 lines, nine `###` headings. **This is your migration source — work from it**, so a
later edit to `ROADMAP.md` cannot silently change what you are copying.

### Step 3 — Build `docs/adr/` (3.1, 3.2), then Step 4 — the nine migrations (3.3), then Step 5 — the four backfills (3.4)

For Step 5, read each source issue in full first:

```fish
for n in 54 43 30
  gh issue view $n -R Jared-Godar/audio-lab --json title,body,comments \
    --jq '"=== #\(.title) ===\n\(.body)\n--- comments: \(.comments|length) ---"'
end
```

### Step 6 — `docs/runbook.md` (3.5) · Step 7 — `ROADMAP.md` (3.6, 3.6a) · Step 8 — milestones (3.6b) and governance edits (3.7, 3.8, 3.9)

After Step 7, prove the stale statements are gone and that § "Open decisions" survived apart from
the one authorized removal:

```fish
grep -ni 'block' ROADMAP.md
sed -n '/^## Open decisions/,/^## Owed/p' ROADMAP.md
```

Expected from the `grep`: **no line asserting M3 or M2 is blocked by the model decision or the
bake-off**, and lines 116/200-equivalents (`Unblocked 2026-07-26`, "Direct commits are blocked for
everyone") still present — those are unrelated and must survive. Expected from the `sed`: the
bake-off entry replaced by a one-line pointer to ADR 0014, and **"Label taxonomy refinements" still
present and unaltered.**

### Step 9 — Commit, then gate on the committed state

```fish
git status --short          # inspect BEFORE staging
git add docs/ ROADMAP.md AGENTS.md README.md CHANGELOG.md \
        .github/pull_request_template.md \
        artifacts/specs/20260728-issue-62-docs-surface-adrs-and-runbook.md \
        prompts/20260728-issue-62-docs-surface-adrs-and-runbook.md
git status --short
git commit -m "Build the docs surface: ADRs, runbook, and decision capture (#62)"
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Expected: `exit=0`. Name the SHA the gate ran against.

### Step 10 — Push and open the PR

Neither is gated. **From the first push the PR is on merge HOLD** — say so — until read-back
verification completes, then announce **GREEN LIGHT** proactively.

### Step 11 — Squash-merge, but ONLY under the one-time authorization in §5b

**Read §5b in full before touching `gh pr merge`.** Normally you would never merge. For this PR
only, the maintainer has authorized you to — under conditions that are mechanical, not a judgment
call. If §5b's gate does not pass in every particular, **do not merge**: announce HOLD, say exactly
which condition failed, and stop.

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Build the docs surface: ADRs, runbook, and decision capture (#62)" \
  --assignee Jared-Godar \
  --label "type: docs" --label "area: governance" --label "priority: medium" \
  --body-file /tmp/pr-body-issue-62.md
```

**Omit `--milestone`** — #62 is deliberately unmilestoned. Body carries `Closes #62` on its own line.
Then verify with the authoritative GraphQL field, never a body text-match:

```fish
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number state}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[].number'
gh pr view $pr -R Jared-Godar/audio-lab \
  --json number,labels,milestone,assignees \
  --jq '{number, labels:[.labels[].name], milestone:.milestone.title, assignees:[.assignees[].login]}'
gh pr checks $pr -R Jared-Godar/audio-lab --watch
```

Expected: exactly `62`. It lags a few seconds — re-query rather than trusting a short first read.

**The PR body must state, in plain words:** that §4C's two artifacts are **prose with no
enforcement**; the `eleven_v3` contradiction from §2.5; and every deferral named in §7.

## 5b. ONE-TIME MERGE AUTHORIZATION — this PR only, and only mechanically

### The authorization, and why it does not conflict with the contracts

Three durable contracts say you never merge:

- `AGENTS.md` § "Hold for the maintainer" — "**Merging PRs** — the maintainer merges via the GUI
  on an announced GREEN LIGHT."
- `CLAUDE.md` § "Session modes" — the executor "**Never merges**."
- `~/.claude/CLAUDE.md` § "Merge green light" — the session's announcement is the authoritative
  signal.

**The maintainer overrode all three for this PR, on 2026-07-28, in these words:**

> "if you can bake in a preapproval for the CLI executor to squash merge this time if it self
> greenlights, I am good with that"

**Do not treat this as a spec-versus-contract conflict to stop and report.** `AGENTS.md` §
"Jared is the absolute authority — never tell him no, ask him how" resolves it inside the contract
itself: *"He overrides anything… When something he tells you to do collides with something he wrote
earlier, the earlier rule does not win by default — **he does.**"* The PM named the collision to him
before writing this, and he confirmed. This is the contract's own override clause being exercised,
recorded here as `AGENTS.md` requires — **"Every bypass is disclosed."**

**Scope of what he authorized:**

- **This PR.** The authorization was given for #62; it says nothing about #60's archive PR or any
  future PR, so those still follow the normal flow.
- **Squash.** `main` requires linear history.
- **Ask again next time.** Per `AGENTS.md`, *"Prior authorization does not carry forward."* That is
  a constraint on **the agent's assumptions**, not on the maintainer — he can grant this as often
  as he likes; what an executor may not do is assume it.

### The gate — all eleven conditions, each a command with one acceptable answer

The gate is **not** a hedge against the maintainer's authorization, which is settled. It exists
because "self-greenlight" otherwise means *the executor grading its own work* — the one job the
merge signal was doing. So it is defined mechanically instead of left to judgment. Run every
condition, paste every output into your final report, and merge only if **all eleven** hold. A
single deviation means **do not merge.**

```fish
set pr (gh pr view -R Jared-Godar/audio-lab --json number --jq .number)

# 1. Every CI check passed — no fail, no pending, no skipped-that-should-have-run
gh pr checks $pr -R Jared-Godar/audio-lab

# 2. Mergeable and clean
gh pr view $pr -R Jared-Godar/audio-lab --json mergeStateStatus,mergeable \
  --jq '{mergeStateStatus, mergeable}'

# 3. Closes exactly 62 and nothing else
gh api graphql -f query='{repository(owner:"Jared-Godar",name:"audio-lab"){
  pullRequest(number:'$pr'){closingIssuesReferences(first:10){nodes{number}}}}}' \
  --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[].number'

# 4. Metadata
gh pr view $pr -R Jared-Godar/audio-lab --json labels,assignees,milestone \
  --jq '{labels:[.labels[].name], assignees:[.assignees[].login], milestone:.milestone.title}'

# 5. The parked #60 spec is NOT in this PR
gh pr diff $pr -R Jared-Godar/audio-lab --name-only | grep -c 'issue-60-archive'
```

| # | Condition | The only acceptable answer |
|---|---|---|
| 1 | CI checks | every check `pass`; zero `fail`, zero `pending` |
| 2 | `mergeStateStatus` | `CLEAN` |
| 3 | `closingIssuesReferences` | exactly `62`, nothing else |
| 4 | Labels / assignee / milestone | `type: docs` + `area: governance` + `priority: medium`; `Jared-Godar`; milestone `null` |
| 5 | Parked #60 spec absent from the diff | `0` |
| 6 | `bash scripts/check` on the committed state | `exit=0`, SHA named |
| 7 | **Every** AC1–AC17 satisfied, receipts pasted | no AC unmet, none "mostly" met |
| 8 | No "stop and report" condition was hit anywhere in this spec | none hit |
| 9 | No deliverable was skipped, reduced, or deferred without §7 already naming it | none |
| 10 | `ROADMAP.md` § "Open decisions" still contains "Label taxonomy refinements" | present, unaltered |
| 11 | ADR 0014 states `multilingual_v2` is retained case-by-case | present in the file |

**Conditions 7–9 are the ones that will tempt you.** They are self-assessed, and an AC you decided
was "close enough" is condition 7 failing. **If any AC is unmet, the honest action is to announce
HOLD and leave the PR for the maintainer** — that is a completely acceptable outcome and costs
nothing. Merging on a partially-met spec spends trust that is not yours to spend, and
`AGENTS.md` § "The artifact is not the behavior" names the technicality defense as the offense
rather than the defense.

### If all eleven hold

```fish
gh pr merge $pr -R Jared-Godar/audio-lab --squash --delete-branch
gh pr view $pr -R Jared-Godar/audio-lab --json state,mergedAt --jq '{state, mergedAt}'
gh issue view 62 -R Jared-Godar/audio-lab --json state --jq .state
```

Expect `MERGED` with a timestamp, and issue #62 `CLOSED`. **If #62 is still `OPEN` after the merge,
close it manually and say why in your report** — the closing keyword failed to parse.

Then run `AGENTS.md` § "Post-merge closure" in full:

```fish
git switch main; and git pull --ff-only
git fetch --prune
git branch -D docs/issue-62-adrs-and-runbook
git log --oneline -1
```

Copy `artifacts/walkthroughs/` and `artifacts/session-handoffs/` files into the primary checkout if
you worked anywhere else — pruning must never destroy the only copy.

### Record the merge on the issue, so it is not mistaken for freelancing

**Required, not optional.** An executor self-merging looks identical to the failure the lane exists
to prevent. Leave the receipt:

```fish
gh issue comment 62 -R Jared-Godar/audio-lab \
  --body "Squash-merged by the CLI executor under the one-time authorization in spec §5b (maintainer, 2026-07-28). All eleven gate conditions verified before merging; receipts in the PR body. Authorization was scoped to this PR and does not carry forward. · "(date -u +%Y-%m-%dT%H:%M:%SZ)
```

## 6. Numbered acceptance criteria

- **AC1.** `docs/adr/` contains `TEMPLATE.md`, `README.md`, and **fourteen** `NNNN-*.md` files —
  `ls docs/adr/ | wc -l` returns **16**.
- **AC2.** All nine `###` headings from `ROADMAP.md` lines 153–277 are represented in ADRs 0001–0009,
  and each ADR's `## Consequences` preserves its source `**Constrains M<n>:**` content.
- **AC3.** **Each of ADRs 0010–0014 contains a verbatim block quote of its named source, with the
  source identified.** Paste one such quote per ADR into the PR body as evidence.
- **AC4.** ADR 0010 (SPF) exists, points at `infra/dns.yaml` as the operative warning, and does not
  present itself as the enforcement.
- **AC5.** ADR 0006 is a pointer to `AGENTS.md` § "Recorded divergences", not a copy of it.
- **AC6.** **ADR 0014 records `eleven_v3` as the default and `multilingual_v2` as retained
  case-by-case**, quoting both maintainer statements from §2.5, and its `## Consequences` states
  that M3's design must not foreclose `multilingual_v2`. A reader must not be able to come away
  believing `multilingual_v2` was retired.
- **AC6b.** `ROADMAP.md` § "Open decisions" retains "Label taxonomy refinements" **byte-identical**;
  the bake-off entry is replaced by a one-line pointer to ADR 0014 and nothing else changed —
  paste the Step 8 `sed` output.
- **AC6c.** **No line in `ROADMAP.md` still asserts M2 or M3 is blocked by the model decision** —
  paste `grep -ni 'block' ROADMAP.md`, and confirm the unrelated survivors (`Unblocked 2026-07-26`,
  "Direct commits are blocked for everyone") are still present.
- **AC6d.** M3 and M5 milestone descriptions are accurate — paste the `gh api … milestones` read-back,
  and state explicitly whether you changed them or found them already correct.
- **AC7.** `ROADMAP.md` § Decisions is replaced by a pointer plus index; the link resolves.
- **AC8.** `AGENTS.md` and `.github/pull_request_template.md` each carry the new line, and **each
  labels itself as prose/not-enforced in the file itself** — not only in the PR body.
- **AC9.** `docs/runbook.md` exists; every procedure is either sourced (source named) or an explicit
  stub. **No unsourced procedure is written as if it were verified.**
- **AC10.** `README.md` points at `docs/adr/` and `docs/runbook.md`.
- **AC11.** `bash scripts/check` green on the **committed** state — output pasted, SHA named.
- **AC12.** CI green on the pushed branch, with the run receipt.
- **AC13.** `closingIssuesReferences` returns exactly `62` — output pasted.
- **AC14.** CHANGELOG entry in the same PR, including the § Findings note from 3.10.
- **AC15.** Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` output pasted.
- **AC16.** Continuity walkthrough written after branching and refreshed at PR-open.
- **AC17.** Every deliberately-omitted or deferred item named explicitly in the PR body.
- **AC18.** **All eleven §5b conditions evaluated and their outputs pasted** — whether or not you
  merged. If you did not merge, the failing condition is named explicitly. Evaluating the gate is
  mandatory; passing it is not.
- **AC19.** If merged: PR `state` is `MERGED`, issue #62 is `CLOSED`, the branch is deleted, and the
  §5b receipt comment is on #62 — all four outputs pasted. If not merged: an explicit **HOLD**
  announcement naming what the maintainer must decide.

## 7. Non-goals

- **Not backfilling every historical decision.** Five is the bar (§2.4). The one named-but-excluded
  item from #62 §2 Gap 2 is the invite-only Cognito decision (#11/#50) — **name it as deferred in
  the PR body**, deferred simply because five is the bar.
- **Not re-litigating the model decision.** §2.5 is settled by the maintainer. Record it; do not
  weigh v3 against multilingual_v2 again, and do not remove `multilingual_v2` support anywhere.
- **Not rewriting `ROADMAP.md`'s § "Owed" or § "Housekeeping"**, nor its milestone sections beyond
  the two stale "blocked" statements named in §3.6a.
- **Not moving `docs/elevenlabs.md`, `docs/voice-capture.md`, or `docs/recording-runbook.md`.**
- **Not building a CI gate for ADR capture.** §4C is prose by the maintainer's decision. If a
  mechanism is wanted later it is a separate issue — do not file it from inside this PR.
- **Not touching `episodes/`.** The v1 archive is a separate PR under #60.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| `ROADMAP.md` § Decisions spans lines 153–277 with nine `###` headings | **PM-VERIFIED** — `grep -n`, read in full, 2026-07-28 |
| § "Open decisions" lists the `eleven_v3` bake-off as blocking M3 | **PM-VERIFIED** — read lines 280–296, 2026-07-28 |
| `docs/adr/` does not exist | **PM-VERIFIED** — `ls docs/`, 2026-07-28 |
| `docs/recording-runbook.md` exists, 21,711 bytes | **PM-VERIFIED** — `ls -la docs/`, 2026-07-28 |
| `pull_request_template.md` has a 3-item `## Checks` list | **PM-VERIFIED** — read in full, 2026-07-28 |
| `type: docs`, `area: governance`, `priority: medium` all exist | **PM-VERIFIED** — parsed `.github/labels.json`, 2026-07-28 |
| The metadata gate needs no milestone | **PM-VERIFIED** — `.github/workflows/pr-metadata-gate.yml` lines 6–8 |
| #62 has zero comments; its body is authoritative | **PM-VERIFIED** — `gh issue view`, 2026-07-28 |
| The SPF text is in `CHANGELOG.md` § Findings | **PM-VERIFIED** — read, 2026-07-28 |
| AGENTS.md § "Recorded divergences" holds the full #31 text | **PM-VERIFIED** — read `AGENTS.md` in full, 2026-07-28 |
| #54/#43/#30 contain comments recording ADRs 0011–0013 | **PM-UNVERIFIED** — relayed from #62 §2 Gap 2; those issues were **not** opened this session. §3.4 tells you what to do if a source is missing |
| The runbook procedures are sourceable from tracked files | **PM-UNVERIFIED** — not attempted. §3.5's stub rule exists because of this |
| `bash scripts/check` exits 0 on a docs-only change | **PM-UNVERIFIED** — reasoned, not run |
| `ls docs/adr/ \| wc -l` returns 16 | **PM-UNVERIFIED** — arithmetic on the planned file set, not observed |
| The model decision is the maintainer's, made personally | **PM-VERIFIED** — stated by the maintainer in session, 2026-07-28, quoted verbatim in §2.5 |
| Four tracked statements assert the bake-off is open/blocking | **PM-VERIFIED** — `grep -ni 'block' ROADMAP.md` + `gh api … milestones`, 2026-07-28 |
| M5's milestone description was already false before this session | **PM-VERIFIED** — milestone text vs `ROADMAP.md:116`, 2026-07-28 |
| `gh milestone` does not exist | **PM-VERIFIED** — `gh milestone --help` → `unknown command`, 2026-07-28 |
| The guard denies `gh api -X PATCH` categorically | **PM-VERIFIED** — attempted and refused, plus read `pm-lane-guard.sh:170`, 2026-07-28 |
| The maintainer may have already applied the milestone PATCHes | **PM-UNVERIFIED** — handed to him 2026-07-28; §3.6b tells you to read before writing |

## 9. References

- **#62** — body authoritative, no comments. Its §4A/§4B/§4C are answered in §2 above.
- **#34** Gap 2 (closed, PR #53) — deferred this work here by design.
- `ROADMAP.md` §§ "Decisions and what they constrain", "Open decisions" (lines 153–303 on `c628bd1`).
- `AGENTS.md` § "Definition of done" · § "Recorded divergences from the reference repositories".
- `CHANGELOG.md` § Findings · `infra/dns.yaml` · `docs/recording-runbook.md`.
- `.github/pull_request_template.md` · `.github/labels.json` · `.github/workflows/pr-metadata-gate.yml`.
- Memory: `warnings-belong-at-the-point-of-use.md`, `cite-the-reference-before-producing-an-artifact.md`.
- Provenance: filed by the PM thread 2026-07-27; §4A/§4C answered by the maintainer 2026-07-28;
  §4B delegated to and decided by the PM the same day; the `eleven_v3` contradiction found by the
  PM thread on 2026-07-28 while writing this spec.

---

## Handoff — the launch block the PM hands the maintainer (PM-only; delete before the executor works)

```fish
gh issue comment 62 -R Jared-Godar/audio-lab \
  --body "Launched — spec: artifacts/specs/20260728-issue-62-docs-surface-adrs-and-runbook.md · "(date -u +%Y-%m-%dT%H:%M:%SZ)
env AUDIO_LAB_EXECUTOR=1 claude --model claude-fable-5 --effort high \
  "Read and execute artifacts/specs/20260728-issue-62-docs-surface-adrs-and-runbook.md in full."
```
