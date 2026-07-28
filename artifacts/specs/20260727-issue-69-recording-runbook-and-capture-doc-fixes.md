# Spec: Fix the Ep01 take-naming falsehood and author docs/recording-runbook.md (Issue #69)

**Closes:** #69
**Milestone:** M4 — Episodes v2
**Labels:** `type: docs`, `area: episodes`, `priority: high`
**Assignee:** Jared-Godar · **Project:** audio-lab
**Sizing:** `--model claude-sonnet-5 --effort high` — Standard rung: multi-file docs work with
exact content provided, but the negative test and per-command verification demand care above
`low`. Nothing here is irreversible or public-facing beyond docs.

> **PLACEMENT.** This spec lives at `artifacts/specs/` (tracked). Copy it byte-identical to
> `prompts/` in your first commit and verify with
> `cmp artifacts/specs/20260727-issue-69-recording-runbook-and-capture-doc-fixes.md prompts/20260727-issue-69-recording-runbook-and-capture-doc-fixes.md`.
> `prompts/` seeds are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

Before writing anything, read and follow, in order:

1. **`AGENTS.md` on `main` in full** — the binding operating contract.
2. `CLAUDE.md` at the repo root — session modes, the lane guard, artifact naming.
   Where it and `AGENTS.md` conflict, `AGENTS.md` wins.
3. `~/.claude/CLAUDE.md` — the maintainer's cross-project standing rules.
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`.
5. `CHANGELOG.md` § Findings and `docs/` — what is already known.
6. **Issue #69 in full.** The body is authoritative; no comment has rescoped it. This spec
   implements #69 §4 **options 1 AND 2 combined** — a decision the maintainer made on
   2026-07-27 by requesting a standalone step-by-step runbook *in addition to* the in-place
   corrections.

**A durable contract outranks this spec.** Conflict → stop and report. **This spec is
immutable after handoff** — wrong or ambiguous → stop and report, do not improvise.

**The rules that will bite you on THIS task:**

- **★ The executor declares itself:** run as `env AUDIO_LAB_EXECUTOR=1 claude …` or the lane
  guard denies every mutation. If the guard blocks something it should not, say so and ask.
- **★ Receipts expire on the next mutation.** Order is mutate → commit → gate → report; name
  the SHA the gate ran against.
- **★ Pass `-R Jared-Godar/audio-lab` inline on every `gh` command.**
- **★ No contract-lawyering.** An AC you cannot meet is a finding to report, never a criterion
  to quietly drop.
- **Do NOT move, rename, or delete anything under `artifacts/`.** Promotion of the Ep01 read
  sheet to a tracked path is **#68's deliverable, not yours**. You READ
  `artifacts/20260727-ep01-v2-host-read-sheet.md` as a content source; you do not relocate it.
- **Do NOT touch `episodes/` beyond reading.** It is a gated path (`AGENTS.md` § Hold for the
  maintainer). Your writes are confined to `docs/`, `CHANGELOG.md`, `artifacts/specs/`,
  `prompts/`, and the continuity walkthrough.
- **Fish syntax for every user-facing command** (`AGENTS.md` § Local environment). The
  maintainer's shell is Fish; macOS utilities, no GNU-only flags. The stock macOS `rsync` is
  2.6.9 — never use rsync-3-only flags in any block you write.

## 0b. Progress tracking

Maintain a live task list (TodoWrite if available; otherwise re-post an inline `[x]/[~]/[ ]`
checklist at the top of every response that starts or finishes a step).

---

## 1. Intended outcome

A technically proficient person who has never opened Adobe Audition can sit down at
`docs/recording-runbook.md`, configure the QuadCast and Audition from zero, record all host
lines for Ep01 and Ep02 plus a voice-clone corpus in one session — in either the optimal
bedroom setup or the documented in-situ desk fallback — verify every file from the command
line, and hand the results to the pipeline **with filenames that actually map onto the stems
they replace**. Simultaneously, the tracked falsehood at `docs/voice-capture.md:377` is gone.

## 2. Decisions — made by the maintainer 2026-07-27, implement as written

1. **#69 §4: options 1 + 2 combined.** Fix `voice-capture.md` in place AND author a new
   standalone `docs/recording-runbook.md`. The runbook is the session document; voice-capture
   stays the decisions/hardware/room reference. Each links the other.
2. **Both episode scripts appear INLINE in the runbook** (maintainer's explicit ask: "the
   deliverable guide should include my script for both episodes"). Canonical sources, named in
   the runbook so drift is traceable:
   - Ep01: `artifacts/20260727-ep01-v2-host-read-sheet.md` (gitignored; #68 will promote it to
     `episodes/ToldStraight-Ep01/` — note this pending move in the runbook text).
   - Ep02: `episodes/ToldStraight-Ep02/record-host-ep02.txt` (tracked).
3. **Continuous-take capture is a first-class path.** One WAV per episode, lines read in
   script order with ≥2s gaps; turn extraction is done downstream by the PM/tooling, not by
   the reader. Per-line capture remains documented as the alternative.
4. **Ep01 naming truth:** the assembler matches **turn ids** (`t00`, `t02`, … — host turns are
   the EVEN indices; 27 of them). `H01..H27` is wrong for Ep01 and dies in this PR.
5. **Voice-clone corpus:** an Instant Voice Clone (IVC) corpus section — 3–5 pristine minutes,
   host register, no processing. The single PVC slot is explicitly out of scope (gated by
   `AGENTS.md`; one slot exists, spending it is the maintainer's call).
6. **In-situ desk recording is a documented variant**, including the empirical room-tone gate
   (record 10 s of silence, measure, decide) and soft-mass damping guidance (the
   comforter/blanket-fort techniques), not only the bedroom ideal.

## 3. Deliverables

1. **`docs/voice-capture.md` corrections** (#69's original ACs):
   - Line 377's `narration/H01..H27` instruction replaced with turn-id naming; state plainly
     that Ep01 host turns are even indices `t00..t52`, 27 lines.
   - The checklist cross-references the runbook and the Ep01 read sheet by path.
   - Ep02's `H01..` convention verified against
     `episodes/ToldStraight-Ep02/record-host-ep02.txt` and either confirmed correct in the
     text or corrected.
2. **`docs/recording-runbook.md`** (new, tracked), sections in this order:
   1. **Session pre-flight** — Do Not Disturb, sound effects off, AC/fan/phone; sample-rate
      match via Audio MIDI Setup (QuadCast → 48,000 Hz); QuadCast hardware: **cardioid
      pattern selected**, gain knob starting point, tap-to-mute top surface; placement (hand
      span, 15–30° off-axis).
   2. **Room options** — bedroom ideal (summarize from voice-capture.md §"Choosing the room",
      link rather than duplicate) and **in-situ desk variant**: soft mass behind and flanking
      the mic (comforter over a chair back, duvet tent over head+mic), mic pointed AWAY from
      hard walls and windows, laptop/external drives as far off-axis as cables allow, and a
      warning that spinning externals + fans are a real noise source the probe below exists
      to catch.
   3. **The room-tone probe (gate)** — record 10 s of silence before anything else; a Fish
      block using `ffprobe`/`afinfo` plus an `ffmpeg -af volumedetect` (or `astats`) one-liner
      to report mean/max level; state the pass bar (mean RMS at or below ≈ −60 dBFS is clean;
      −50s is workable; above ≈ −45 means fix the room or wait out the noise source).
   4. **Adobe Audition, zero to first record** — every click named for a first-time user:
      launch → **Window workspace: Default** → **File → New → Audio File** (Waveform editor,
      NOT Multitrack — say why: one continuous mono capture, simplest path) → sample rate
      48000 Hz, channels Mono, bit depth 24 → **Audition Settings/Preferences → Audio
      Hardware → Default Input: HyperX QuadCast** (and monitor output = the Bose headphones)
      → the red Record transport button → stop → **File → Save As**, format WAV, sample type
      confirmation. Include the two traps voice-capture.md already names: the QuadCast
      appears under Output too (pick it as INPUT), and **never** apply effects/Enhance to
      clone or stem material.
   5. **Capture conventions for the continuous take** — read in script order · leave ≥2
      seconds of silence between lines · on a flub, stop, pause ≥2 s, re-read the WHOLE line
      (convention: the LAST complete instance of a line wins, which makes retakes free) · no
      verbal slating · levels: peaks between −12 and −6 dBFS, checked on Audition's meters
      during the first two lines, gain adjusted, then hands off.
   6. **The Ep01 script — all 27 host lines inline**, each labelled with its turn id (`t00`,
      `t02`, …) and its per-line character/duration hint, transcribed exactly from the read
      sheet. State the guide-track option: play
      `artifacts/_guide-tracks/20260727-ffmpeg-ep01v2-cohost-only-guide-track-192k.mp3`
      quietly in closed headphones for context, WITH the caveat that its silent gaps are sized
      to the OLD TTS host's pacing — context only, pause playback rather than rush a line;
      delivered timing wins because assembly rebuilds the timeline from stems.
   7. **The Ep02 script — all host lines inline**, transcribed exactly from
      `record-host-ep02.txt`, with its own naming convention as verified in deliverable 1.
   8. **Voice-clone corpus (IVC)** — 3–5 continuous minutes, host register ("perform it the
      way you want the show to sound", not book-reading voice); source text: own episode
      scripts are ideal, any conversational prose acceptable; diverse sentences over repeated
      paragraphs; NO processing, no Enhance, no music, one room one mic one distance; trim
      long silences before upload. PVC explicitly deferred and gated.
   9. **Save / verify / hand off** — Fish blocks, each with expected output:
      naming per the artifact rule
      (`YYYYMMDD-quadcast-audition-<subject>-<purpose>.wav`, e.g.
      `20260727-quadcast-audition-ep01-host-continuous-take.wav`); an `ffprobe` loop
      verifying 48000 Hz / 1 ch / pcm_s24le per file; the `volumedetect` peak check; the
      landing convention `~/ToldStraight-recordings/<YYYYMMDD>-<session>/` (create it in the
      block); and the line "tell the PM session the path — extraction and assembly are its
      job, not yours."
   10. **What NOT to do** — no effects on raw captures, no mp3 for masters, no re-recording
       into the same file over a good take, no deleting any capture until the PM confirms
       extraction.
3. **Negative test** (#69 AC, performed and pasted in the PR): create a throwaway `H01.wav`
   in a temp dir, demonstrate with the actual stem-matching logic (or a
   `ls output/episodes/ToldStraight-Ep01-v2/stems/ | grep` proof) that no host stem matches
   an `H01` name while `t00` does; delete the throwaway.
4. **CHANGELOG entry** — under **Fixed** (the :377 falsehood) and **Added** (the runbook),
   with the naming contradiction recorded under **Findings**.

## 4. Execution rails

Fish syntax, repository root.

### Step 1 — Sync and branch

```fish
cd /Users/jaredgodar/Code/audio-lab
git fetch origin; and git switch main; and git merge --ff-only origin/main
git log --oneline -1    # expect 7ad83c7 or later; if later, note the delta and continue
git switch -c docs/issue-69-recording-runbook
```

### Step 1b — Continuity walkthrough

Write `artifacts/walkthroughs/<UTC>-issue-69-recording-runbook.md` immediately (gitignored,
never committed), per `AGENTS.md`. Refresh at PR-open and awaiting-merge.

### Step 2 — Implement deliverables 1–2

Content sources, all read this session, none invented:
`docs/voice-capture.md` (current text) · `artifacts/20260727-ep01-v2-host-read-sheet.md`
(Ep01 lines + turn ids) · `episodes/ToldStraight-Ep02/record-host-ep02.txt` (Ep02 lines) ·
`pipeline/core/episode.py:291-294,399` (the naming ground truth) ·
`output/episodes/ToldStraight-Ep01-v2/stems/` listing (54 stems, host = even).
If the read sheet and the stems disagree on any turn id, **stop and report** — do not guess.

### Step 3 — Negative test, captured for the PR body

### Step 4 — Commit, then gate on the committed state

```fish
git add -A; and git status --short
git commit -m "Fix Ep01 take-naming falsehood; add docs/recording-runbook.md (#69)"
bash scripts/check >/tmp/gate.log 2>&1; echo "gate exit=$status"
tail -5 /tmp/gate.log
```

### Step 5 — Push, open the PR with full metadata, verify by read-back

```fish
git push -u origin docs/issue-69-recording-runbook
gh pr create -R Jared-Godar/audio-lab \
  --title "Fix Ep01 take-naming falsehood; add docs/recording-runbook.md (#69)" \
  --assignee Jared-Godar \
  --label "type: docs" --label "area: episodes" --label "priority: high" \
  --milestone "M4 — Episodes v2" \
  --body-file /tmp/pr-body-69.md
```

Body carries `Closes #69`, the negative-test paste, the gate output with its SHA, and every
deliberate omission. Verify with `closingIssuesReferences` (GraphQL, per the template — a body
text-match is not verification), then `gh pr checks --watch`. **From first push the PR is on
merge HOLD; never merge.**

## 5. Numbered acceptance criteria

- **AC1.** `grep -n 'H01..H27' docs/voice-capture.md` → no output; the replacement text names
  even turn ids and 27 lines.
- **AC2.** `docs/recording-runbook.md` exists, contains all ten sections of deliverable 2, and
  every Fish block was executed once by you with its output shown (the Audition click-path
  excepted — mark it MANUAL).
- **AC3.** All 27 Ep01 lines present inline with turn ids matching the stems on disk —
  verified by a pasted count: `grep -cE '^\S*t[0-9]+' docs/recording-runbook.md` (or
  equivalent) = 27, and ids cross-checked against `ls output/.../stems/ | grep host`.
- **AC4.** All Ep02 host lines present inline; Ep02 naming confirmed-or-corrected (AC from
  #69).
- **AC5.** Negative test performed and pasted.
- **AC6.** `bash scripts/check` green on the committed SHA, output pasted.
- **AC7.** CI green; `closingIssuesReferences` returns 69, pasted.
- **AC8.** CHANGELOG entry in the same PR.
- **AC9.** Spec byte-identical at `artifacts/specs/` and `prompts/` (`cmp` output pasted).
- **AC10.** Continuity walkthrough written and refreshed at PR-open.
- **AC11.** Every deliberately-omitted item named in the PR body.

## 6. Non-goals

- **No file moves out of `artifacts/`** — #68 owns the read-sheet promotion and everything
  else in that scope.
- **Not resolving #55** (the actual host-swap and re-assembly).
- **No pipeline code changes** — the code is correct; the docs were wrong.
- **No Audition screenshots** — text click-paths only; screenshots go stale and bloat the repo.
- **Not the PVC** — one slot, gated, maintainer-only.
- **Not building or rebuilding guide tracks** — the PM session owns
  `artifacts/_guide-tracks/`.

## 7. Verification status of this spec's claims

| Claim | Status |
|---|---|
| #69 OPEN, body authoritative | **PM-VERIFIED** — `gh issue view 69` 2026-07-27 ~20:05 |
| Host turns = even ids, 27 of them; assembler sorts by `turn.index` | **PM-VERIFIED** — `episode.py:291-294,399` read + stems listing counted this session |
| 54 stems on disk, mp3 44100 Hz mono | **PM-VERIFIED** — `ls` + `ffprobe` this session |
| Ep01 read sheet uses turn-id naming | **PM-VERIFIED** — file read this session |
| Ep02 script uses `H01`/continuous-take option B | **PM-VERIFIED** — head of file read this session; full-file verification is deliverable 1's job |
| `docs/voice-capture.md:377` says `H01..H27` | **PM-VERIFIED** — grep this session |
| Guide track exists at the path named in deliverable 2.6 | **PM-VERIFIED** — built 2026-07-27 20:07, 11.2 min, exit 0 |
| Audition click-path (New Audio File / Audio Hardware / Save As) | **PM-UNVERIFIED** — from product knowledge, not clicked this session; executor marks it MANUAL and the maintainer corrects live if a pane differs |
| `scripts/check` green on current main | **PM-UNVERIFIED** — assumed from #66's green merge; run it before first commit |

## 8. References

Issue #69 (body) · #68 (adjacent scope, do not overlap) · #55 (downstream consumer) ·
`docs/voice-capture.md` · `artifacts/20260727-ep01-v2-host-read-sheet.md` ·
`episodes/ToldStraight-Ep02/record-host-ep02.txt` · `pipeline/core/episode.py:291-294,399` ·
`AGENTS.md` § Local environment, § Hold for the maintainer · `CLAUDE.md` § artifact naming.
Provenance: naming defect found by the PM thread 2026-07-27 during the maintainer-requested
guide audit; runbook scope requested by the maintainer the same evening.
