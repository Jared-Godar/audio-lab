# Spec: Record the IVC patch-tool config in tracked docs — elevenlabs.md, voice-capture.md, ADR 0017, CHANGELOG (Issue #91)

**Closes:** #91
**Milestone:** M4 — Episodes v2
**Labels:** `type: docs`, `area: voices`, `priority: medium`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort low`

> **Sizing rationale, stated honestly.** Light rung (`AGENTS.md` § "Model and effort sizing"):
> docs-only PR, every file's content provided verbatim below; the only judgment is anchor
> placement, and each anchor is named. Nothing irreversible, nothing public-facing beyond docs.

> **PLACEMENT.** This spec was authored in job-tmp (`~/.claude/jobs/6d9bb6e2/tmp/`) because the
> authoring session was unflagged and the PM-lane guard + background-worktree isolation jointly
> left it no writable in-repo path (see issue #91's provenance). FIRST copy this file
> byte-identical to `artifacts/specs/20260729-issue-91-ivc-patch-tool-docs.md` AND
> `prompts/20260729-issue-91-ivc-patch-tool-docs.md`; verify with
> `cmp artifacts/specs/20260729-issue-91-ivc-patch-tool-docs.md prompts/20260729-issue-91-ivc-patch-tool-docs.md`.
> Both are committed in this PR. `prompts/` seeds are immutable after handoff — revisions go to
> a NEW dated file.

## 0. Read the durable contracts first (non-negotiable)

Before writing anything, read and follow, in order: (1) `AGENTS.md` on `main` **in full**;
(2) `CLAUDE.md` at the repo root; (3) `~/.claude/CLAUDE.md`; (4) memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`; (5) `CHANGELOG.md` § Findings
and `docs/`; (6) **issue #91 in full, including comments**. A durable contract outranks this
spec — if they conflict, stop and report. This spec is immutable after handoff.

**The rules that will bite you on THIS task:**

- **★ Branch, commit, push, PR-open are do-automatically here** (`AGENTS.md` § "Do these
  automatically"). What is gated: never merge (maintainer merges on announced GREEN LIGHT);
  never spend credits (this task spends zero); never touch the PVC slot.
- **★ Squash commit bodies are the permanent record.** Single commit, authored with
  `git commit -F <file>` where the file is written OUTSIDE the repo. Line 1 identical to the
  PR title; then a curated 500–2,500-byte body. A bare `-m` is a defect (#77).
- **★ Continuity walkthrough immediately after branching** →
  `artifacts/walkthroughs/<UTC>-issue-91-ivc-patch-tool-docs.md` (gitignored, never committed),
  Fish blocks, ⟨slots⟩ for unknowns; refresh at PR-open and awaiting-merge.
- **CHANGELOG in the same PR** — content provided below; changelog gate is a required check.
- **Fish syntax for any command shown to the maintainer**; macOS utilities, no GNU flags.
- **Verify by read-back**: `gh pr checks` + `gh pr view --json assignees,labels,milestone`
  after creation; never infer from the create command's exit.

## 1. Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch
git log --oneline main..origin/main   # must be empty; ff-forward first if not
git switch -c issue-91-ivc-patch-tool-docs
```

Write the continuity walkthrough now (rule ★ above).

## 2. Edit `docs/elevenlabs.md`

Insert a new `## Cloned voices` section immediately AFTER the `## Account shape` section
(before `## Rates — advertised vs actual`), verbatim:

```markdown
## Cloned voices

Two Instant Voice Clones exist on the account, both built 2026-07-29 from the Ep01
host-line recording session (`~/ToldStraight-recordings/20260729-ep01-session/`).
Decision record: ADR 0017.

| Voice | ID | Corpus | Role |
| --- | --- | --- | --- |
| **Jared 1.0** | `55ZBPsQ4TUfilRuaftR9` | de-gapped 320k MP3 — 2:38 of speech, every inter-line silence removed | **The patch tool.** Host-line patches render with this voice on `eleven_multilingual_v2` |
| Jared 2.0 | `uRHCc17iD8J841Ag8zdr` | raw 4-part 24-bit WAV, natural pauses intact | Kept spare — lost the 2026-07-29 A/B; retained by maintainer decision |

**Model choice here is per-voice, not the repo default.** ADR 0014 makes `eleven_v3` the
default with `multilingual_v2` available case-by-case, choice recorded; this is that case.
In the 2026-07-29 four-cell A/B (both voices × both models, identical text from the
recorded t00 line, the maintainer's real take as reference, 4 × 207 = 828 credits verified
in `/v1/history`), the maintainer picked Jared 1.0 on `eleven_multilingual_v2` as "the
best mix of inflection, pauses and sounding like me." Patching a host line on the v3
default reproduces the timing defects that A/B ruled out.

Corpus finding, recorded because it is counterintuitive: the corpus with **all silences
removed beat the same audio with natural pauses left in.** Dense speech gave the clone
more to learn from; the pauses taught it nothing.

Cloning consumed no credits and no PVC slot (`professional_voice_slots_used: 0` — the
single Professional slot stays held per ADR 0004). Two ordinary voice slots of 30 are used.
```

## 3. Edit `docs/voice-capture.md`

Append at the END of the file (after the practical checklist's closing code fence), verbatim:

```markdown
## Outcome — 2026-07-29

The Ep01 leg of the checklist above was run to completion in the 2026-07-29 recording
session, and the fork the checklist ends on is resolved: **the IVC is sufficient; the PVC
slot stays held.**

- Ep01's 27 host lines recorded per this guide (QuadCast, bedroom, 48 kHz/24-bit mono
  WAV); continuous take 4:02, of which 2:38 is speech. Ep02's lines remain owed.
- Two IVCs were built for a corpus A/B — silences-removed vs natural-pauses — and each
  rendered on `eleven_multilingual_v2` and `eleven_v3` against the real t00 take.
- Winner, in the maintainer's words: Jared 1.0 (de-gapped corpus) on
  `eleven_multilingual_v2` — "the best mix of inflection, pauses and sounding like me."
- The patch-tool config, both voice IDs, and the reversal conditions live in
  `docs/elevenlabs.md` § "Cloned voices" and ADR 0017.
```

## 4. Create `docs/adr/0017-ivc-patch-tool-config.md`

Verbatim (matches `docs/adr/TEMPLATE.md`; 0017 confirmed the next free number — re-verify
with `ls docs/adr/` and renumber if something landed since):

```markdown
# ADR 0017 — Host-line patches render with IVC "Jared 1.0" on `eleven_multilingual_v2`

- **Number:** 0017
- **Title:** Host-line patches render with the Instant Voice Clone "Jared 1.0"
  (de-gapped corpus) on `eleven_multilingual_v2`
- **Status:** accepted
- **Date:** 2026-07-29
- **Source:** issue #91, and the 2026-07-29 recording/A-B session it documents.

## Context

Ep01 v2 is being rebuilt on the maintainer's real host recordings (#55); fixing one flawed
line without re-micing needs a voice clone. The account has one irreversible Professional
slot (ADR 0004) and unlimited Instant clones within 30 slots. ADR 0014 makes `eleven_v3`
the default synthesis model, `multilingual_v2` case-by-case with the choice recorded. On
2026-07-29 two IVCs were built from the session's audio — "Jared 1.0"
(`55ZBPsQ4TUfilRuaftR9`, all silences removed from the corpus) and "Jared 2.0"
(`uRHCc17iD8J841Ag8zdr`, natural pauses intact) — and a four-cell A/B (both voices × both
models, identical recorded-t00 text, real take as reference; 4 × 207 = 828 credits,
verified in `/v1/history`) was put to the maintainer's ear.

## Decision

Verbatim: "…multilingual_v2-jared_ivc_v1-t00-clone-vs-real-ab-192k.mp3 this was the best
mix of inflection, pauses and sounding like me" — that file is Jared 1.0 on
`eleven_multilingual_v2`. On the loser: "Hang on to 2.0 for now."

Therefore: host-line patches use voice `55ZBPsQ4TUfilRuaftR9` on `eleven_multilingual_v2`
(a recorded ADR 0014 case-by-case exception). The IVC is sufficient as the patch tool; the
PVC slot stays held (ADR 0004 unchanged). Jared 2.0 is retained as a spare.

## Consequences

**Constrains M4:** the #55 stem swap and any later host-line patch render use this config.
The corpus finding — silences-removed beat natural-pauses — governs any future clone
rebuild: prepare corpora dense, silences stripped.

## Reversal condition

Reverse the model choice only on a same-text A/B where the maintainer picks differently —
the deciding instrument is his ear, not benchmarks or release notes. Delete Jared 2.0 when
a slot is needed or he says so. Escalate to PVC only if cloned-Jared becomes a primary
narrator (ADR 0004's own condition).
```

Then read `docs/adr/README.md`; if it carries an index of ADRs, add the 0017 line in the
established format.

## 5. Update `CHANGELOG.md`

Under the existing `## 2026-07-29` heading. Add to `### Added`:

```markdown
- **The Instant Voice Clone patch-tool config, recorded on tracked surfaces (#91).** Two
  IVCs were built 2026-07-29 from the Ep01 host-line session; a four-cell A/B (2 corpora ×
  2 models on the recorded t00 line, 828 credits) had the maintainer pick **"Jared 1.0"
  (`55ZBPsQ4TUfilRuaftR9`) on `eleven_multilingual_v2`** as the host-line patch config.
  Recorded in `docs/elevenlabs.md` § "Cloned voices", a dated outcome note resolving
  `docs/voice-capture.md`'s open IVC-or-PVC fork, and ADR 0017 (an ADR 0014 case-by-case
  model exception). "Jared 2.0" (`uRHCc17iD8J841Ag8zdr`, natural-pauses corpus) is kept as
  a spare by maintainer decision; the PVC slot stays held (ADR 0004 unchanged).
```

Add a `### Findings` section for 2026-07-29 if absent, with:

```markdown
- **The de-gapped cloning corpus beat the natural-pauses corpus.** Removing every
  inter-line silence from identical source audio produced the clone the maintainer
  preferred — the opposite of the intuition that joins would teach broken timing.
- **`eleven_multilingual_v2` beat `eleven_v3` for this cloned voice** on inflection and
  pacing, against ADR 0014's repo default — hence the recorded exception in ADR 0017.
- **The IVC upload wizard caps files at 10 MB each** (min 10 s total). At 48 kHz/24-bit
  mono WAV that is ~69 s per file; a multi-file upload of lossless splits satisfies it.
  ElevenLabs transcodes uploaded WAVs to MP3 server-side either way.
- **Scoped API keys fail voice creation closed:** `POST /v1/voices/add` without the
  `create_instant_voice_clone` permission returns `missing_permissions` before doing
  anything — a zero-cost probe for whether a key can clone. TTS with an existing cloned
  voice needs no such permission.
```

## 6. Gate, commit, push, PR

```fish
pre-commit run --all-files        # must be green; paste output in the PR body
```

Author the commit-body file OUTSIDE the repo (e.g. `~/.claude/jobs/tmp` or `mktemp`):
line 1 = PR title below, blank line, then a curated body (what changed, why, the A/B
receipts, the decisions recorded). Then:

```fish
git add artifacts/specs/20260729-issue-91-ivc-patch-tool-docs.md prompts/20260729-issue-91-ivc-patch-tool-docs.md docs/elevenlabs.md docs/voice-capture.md docs/adr/0017-ivc-patch-tool-config.md docs/adr/README.md CHANGELOG.md
git status --short                # stage ONLY these; nothing else rides along
git commit -F <body-file>
git push -u origin issue-91-ivc-patch-tool-docs
```

PR title: `Record the IVC patch-tool config — Jared 1.0 on multilingual_v2 — in elevenlabs.md, voice-capture.md, ADR 0017, and the CHANGELOG (#91)`

PR body: `Closes #91`; what each file records; the pasted `pre-commit` output; disclosure
that Ep02 host lines remain owed (out of scope, named in the outcome note) and that no
pipeline code changes ship here (non-goal per #91 §5).

```fish
gh pr create --assignee Jared-Godar --label "type: docs" --label "area: voices" --label "priority: medium" --milestone "M4 — Episodes v2" --title "…as above…" --body-file <body>
gh pr checks <N> --watch
gh pr view <N> --json assignees,labels,milestone,title
```

## 7. Verification and merge signal

- Re-run every acceptance-criteria command from issue #91 §6 and paste outputs in a PR
  comment or the session report — asserted is not shown.
- Announce **HOLD** at push; announce **GREEN LIGHT: clear to squash-merge PR #N via the
  GUI** only after all required checks are green and metadata read-back matches.
- After the maintainer merges: run the post-merge closure pass (`AGENTS.md` § "Post-merge
  closure") unprompted.
