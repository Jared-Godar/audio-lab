# Spec: Research AI image generation and land the decision brief with the host-portrait prompts (Issue #83)

**Closes:** #83
**Milestone:** M5 — Web presence (the issue's milestone; note #85 may later move issues between
milestones — do not pre-empt it, use M5 as it stands on #83 at branch time)
**Labels:** `type: docs`, `area: episodes`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-opus-5 --effort high`

> **Sizing rationale, stated honestly.** Heavy rung: open-ended external research whose product
> directs the maintainer's money and an evening of his time, on a public tracked path. The most
> demanding motion is synthesis under honesty constraints — a comparison where every option is good
> is a defined failure, and vendor marketing must be corroborated, not reproduced. Mechanical it is
> not.

**PLACEMENT.** Author path `artifacts/specs/20260729-issue-83-image-generation-brief.md` (tracked);
the executor commits it there **and** copies it byte-identical to
`prompts/20260729-issue-83-image-generation-brief.md` — verify with `cmp`. `prompts/` seeds are
immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

**Do NOT do any of the following:** do not generate or attempt to generate any image (the agent
cannot; the brief is the deliverable); do not buy, subscribe to, or sign up for anything, and do
not present any option as requiring purchase without naming its cost as the maintainer's decision;
do not commit, reference by path, or describe the content of the maintainer's reference photograph
beyond what #83 §5 already records; do not reopen the portrait style, the roster, or any approved
design decision; do not merge.

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full.**
2. `CLAUDE.md` at the repo root — conflicts resolve to **`AGENTS.md`**.
3. `~/.claude/CLAUDE.md` — note § "Defensive external calls": this task is research-heavy; retry
   transient failures with backoff, fail fast on permanent ones, and report a dead source as an
   external condition, never as a finding about the platform.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` — in particular
   `never-descope-what-he-explicitly-asked-for.md`, which records the original portrait ask and its
   loss, and `a-hedge-does-not-undo-a-directive.md`, which governs how the brief's recommendation
   must be worded (uncertainty first where unverified).
5. `CHANGELOG.md` § Findings and `docs/`.
6. **Issue #83 in full.** Its §5 "Decisions already made — binding, not open" is implemented as
   written, not revisited.

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is immutable
after handoff.**

**The rules that will bite you on _this_ task:**

- **★ Every capability claim carries a dated source.** The predecessor brief was withdrawn for
  exactly this: zero sources, recalled knowledge, a self-declared "verify before relying" caveat.
  The acceptance bar is mechanical (≥8 `https://` sources) but the spirit is per-claim: an undated
  capability claim is the same defect as an unmeasured one.
- **★ Your training knowledge of these platforms is a hint list, not a finding.** The platform
  set, feature names, and pricing move faster than any cutoff. Names this spec mentions are
  starting points to research, never facts to transcribe.
- **★ Style consistency across the four-portrait set is THE selection criterion.** A platform that
  makes one good image but cannot repeat its style across a set is close to useless here (#83 §3).
  Weight the research accordingly: character/style-reference features, seed control, and
  multi-subject consistency outrank single-image quality.
- **★ The recommendation states its reversal condition** — the condition under which it would be
  wrong (#83 §7), and leads with uncertainty where a claim could not be verified.
- **★ Receipts, `-R Jared-Godar/audio-lab` inline, `env AUDIO_LAB_EXECUTOR=1`** — as every spec:
  gate after commit, name the SHA, guard blockages are reported, never routed around.

## 0b. Progress tracking

Live task list per §4 step and §6 criterion (TodoWrite if available; otherwise inline checklist
re-posted at every step boundary).

---

## 1. Intended outcome

One tracked document, `docs/20260729-image-generation-decision-brief-host-portraits.md`, that lets
the maintainer pick a platform and generate all four host portraits in one session: current
platform capabilities with dated sources, one recommendation with honest tradeoffs and a stated
wrongness condition, researched prompt-engineering practice, and the canonical prompt with its
per-subject swap block, pasteable without editing. The superseded `artifacts/` guide is marked as
such; one PR closes #83 with a CHANGELOG entry whose platform facts land under **Findings**.

## 2. Decisions — made, with provenance; implement as written

1. **§4a = Option 1** (vendor documentation plus independent comparisons). The issue's stated
   preference, operationalized by its own acceptance criteria (sources, named weaknesses per
   platform). Hands-on trials (§4a option 3) are OUT — they cost the maintainer's money.
2. **§4b = Option 1** (one canonical prompt + per-subject swap block). Bound by #83 §7: "The
   canonical prompt is present, with the per-subject swap block marked."
3. **§4c = Option 1** (tracked in `docs/`). Bound by #83 §7's first criterion.
4. **Binding design facts, from #83 §5 and the decision record:** flat-vector cartoon portraits,
   one consistent style, all four hosts — **Jared Godar** (human host; from a reference photograph
   the maintainer supplies to the tool privately — the photograph is never committed), **Owen**
   (Ep01 expert), **Des Fable** (Ep02 host), **Dr. Michael Voss** (Ep02 guest). The three synthetic
   characters stay identifiable as synthetic; the Ep02 personnel-file card with its NOT REAL stamp
   is the standing device. Palette and typography anchor to `brand/` design tokens (paper `#EDE9E0`
   · ink `#111111` · red `#B02A28` · grey `#78746C`).
5. **The recorded style ask is an Archer-style cartoon.** Provenance: the maintainer's original
   requirement, recorded verbatim in the tracked memory file
   `never-descope-what-he-explicitly-asked-for.md` ("Archer-style cartoon portraits of every
   host"; his words: "THAT WAS THE ORIGINAL ASK") after #60 lost it. The brief's prompts deliver
   that style; whether to *name* the show in a prompt versus describe the style in neutral terms
   (flat vector, bold line, mid-century spy-adjacent illustration) is a per-platform research
   question — several platforms filter named-style prompts — and the brief must answer it per
   platform rather than assume.
6. **Superseded predecessor:** prepend a SUPERSEDED banner (pointing at the tracked brief) to
   `artifacts/20260728-toldstraight-host-cartoon-image-generation-guide.md` rather than deleting
   it — reversible, and the file is gitignored so this is a local action; disclose it in the PR
   body since no diff will show it.
7. **Spec baseline:** `origin/main` at `69fd875`. If moved, branch from current `main`, note the
   delta.

## 3. Deliverables

1. **`docs/20260729-image-generation-decision-brief-host-portraits.md`** containing, as sections:
   (a) research date and method, and an explicit list of what could not be verified; (b) at least
   three platforms compared, each with named strengths AND named weaknesses, every capability claim
   sourced and dated — set-consistency capability treated as the primary axis; (c) pricing as
   currently published, sourced; (d) one recommendation, its reasoning, and the condition under
   which it would be wrong; (e) researched prompt-engineering practice, distinguishing
   platform-specific from general; (f) the canonical prompt with the per-subject swap block marked,
   pasteable without editing, covering all four subjects; (g) reference-photograph handling —
   supplied privately to the tool, never committed, and what to do if a platform requires an
   upload the maintainer is not comfortable with; (h) the iteration loop — the agent reviews each
   generated image against the spec and critiques; the maintainer generates.
2. **The SUPERSEDED banner** on the `artifacts/` predecessor (per §2.6).
3. **CHANGELOG** entry, platform facts under **Findings**.
4. **Spec copies** at `artifacts/specs/` and `prompts/`, byte-identical.

## 4. Execution rails

Fish syntax, from the repository root.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1; and git status --short
git switch -c docs/issue-83-image-generation-brief
```

### Step 1b — Continuity walkthrough

`artifacts/walkthroughs/<UTC-timestamp>-issue-83-image-generation-brief.md`, immediately; refresh
at PR-open and awaiting-merge. Never commit it.

### Step 2 — Research

Candidate starting set (hints, not findings — the live leader set comes from your research):
Midjourney, OpenAI image generation, Adobe Firefly, Ideogram, Black Forest Labs' Flux family,
Google's Imagen surface. For each platform kept: current set-consistency mechanism (character/style
reference, seed control, or equivalent — verify the current feature names), style range for flat
vector work, pricing, licensing/commercial-use terms (this repo is public and the portraits will
be published), and at least one independent corroboration beyond the vendor's page. Record every
source URL with an access date as you go.

### Step 3 — Write the brief

Per Deliverable 1. Ground the four subject descriptions in the repo: Ep01 transcript for Owen,
`episodes/ToldStraight-Ep02/cast/` for Des Fable and Dr. Voss; Jared's description slot references
the private photograph without describing its contents.

### Step 4 — Supersede the predecessor, self-check, commit, gate

```fish
git ls-files docs/ | grep -c 'image-generation'      # expect 0 before add; 1 after
grep -c 'https://' docs/20260729-image-generation-decision-brief-host-portraits.md   # expect ≥8
git add -A
git status --short
git commit -F /tmp/commit-msg-issue-83.txt
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

Commit body: line 1 = PR title verbatim; then the curated 500–2,500-byte record — platforms
compared, the recommendation and its reversal condition, where the prompts live, the superseded
predecessor. Expected: `exit=0`, `All checks passed.`; name the SHA.

### Step 5 — Push and open the PR

Push; the PR is on merge **HOLD** from first push; **never merge.**

## 5. PR metadata (all at creation time)

```fish
gh pr create -R Jared-Godar/audio-lab \
  --title "Research AI image generation and land the decision brief with the host-portrait prompts (#83)" \
  --assignee Jared-Godar \
  --label "type: docs" --label "area: episodes" --label "priority: high" \
  --milestone "M5 — Web presence" \
  --body-file /tmp/pr-body-issue-83.md
```

Body carries `Closes #83` on its own line, every §6 receipt, every §4 option's resolution restated,
the SUPERSEDED-banner disclosure, and every deliberate omission. Verify closure via GraphQL
`closingIssuesReferences` (never a body text-match); read back labels/milestone/assignee;
`gh pr checks --watch`.

## 6. Numbered acceptance criteria

1. Every #83 §7 checkbox met with its command output or artifact reference pasted: tracked-path
   grep `1`; source count ≥8; ≥3 platforms each with strengths and weaknesses; research date and
   unverified-list present; recommendation with wrongness condition; prompt practice split
   platform-specific/general; canonical prompt + marked swap block pasteable; photograph handling
   stated; predecessor marked superseded; every §4 option's resolution recorded on the issue;
   CHANGELOG with Findings.
2. `bash scripts/check` green on the committed state — output pasted, SHA named.
3. CI green on the pushed branch, receipt shown.
4. `closingIssuesReferences` returns exactly `83` — pasted.
5. Spec byte-identical at `artifacts/specs/` and `prompts/` — `cmp` pasted.
6. Continuity walkthrough written and refreshed; no ⟨slot⟩ unfilled.
7. Every deliberately-omitted item named in the PR body — including that no platform was
   hands-on-trialled and why (§4a option 3 costs the maintainer's money and was not chosen).

## 7. Non-goals

Everything #83 §6 lists: no portrait generation, no purchases, no reopening approved decisions.
Plus: no portrait *finishing* work (vector conversion, cast-card composition, signature variants —
that is draft-5 territory, a separate future issue), and no edits to the four binding subject/style
decisions.

## 8. Verification status of this spec's claims

| Claim | Status |
|---|---|
| Predecessor guide exists at `artifacts/20260728-toldstraight-host-cartoon-image-generation-guide.md`, gitignored | **PM-VERIFIED** — `ls artifacts/` 2026-07-29; gitignore status per #83 §2's pasted `check-ignore` |
| `docs/` has no file matching `image-generation` | **PM-VERIFIED** — `ls docs/` 2026-07-29 |
| Ep02 cast cards exist (`host_des_fable.png`, `guest_michael_voss.png`, `studio_disclaimer.png`) | **PM-VERIFIED** — per #83 §2 and CHANGELOG (#64), not re-listed this session |
| The Archer-style ask and its provenance | **PM-VERIFIED** — read this session in the tracked memory file `never-descope-what-he-explicitly-asked-for.md` |
| Labels and the M5 milestone on #83 | **PM-VERIFIED** — `gh issue view 83 --json labels,milestone`, 2026-07-29 |
| Platform starting set (Midjourney, OpenAI, Firefly, Ideogram, Flux, Imagen) | **PM-UNVERIFIED** — training-knowledge hints only, explicitly to be replaced by research |
| `main` @ `69fd875`, clean | **PM-VERIFIED** — 2026-07-29 |

## 9. References

#83 (authoritative body) · #60 (withdrawn predecessor, where the requirement was lost) ·
`episodes/ToldStraight-Ep02/cast/` · `brand/20260727-toldstraight-design-tokens.css` · ADRs 0015,
0016 · memory `never-descope-what-he-explicitly-asked-for.md` · `artifacts/specs/TEMPLATE.md`.
Provenance: issue drafted by the 2026-07-28 PM thread, approved by the maintainer before creation;
specced by the v10 PM thread 2026-07-29 against `main` @ `69fd875`.
