# Spec: Build the Ep03 artwork set and promote Ep03 to the tracked zone

**Closes:** #⟨N⟩ — the executor FILES this issue first (§2, full body provided) per
`~/.claude/CLAUDE.md` § GitHub metadata governance, then substitutes the real number
everywhere ⟨N⟩ appears.
**Labels:** verify against `.github/labels.json` before applying — intended:
`type: docs` (or the repo's episode-content type), `area: episodes`, `priority: high`.
**Assignee:** Jared-Godar · **Project:** audio-lab · **Milestone:** whichever milestone
holds Ep03 work at branch time — read the board, do not guess.
**Sizing:** highest available Opus tier, `--effort high`. Rationale: the artwork half is
design work in a fixed visual system landing on a public tracked path the maintainer
will ship; the promotion half is mechanical but wide (one missed file = broken episode
page). Not a small-model task.

**PLACEMENT.** This spec's authored home is
`artifacts/specs/20260729-ep03-artwork-and-promotion-executor-spec.md` (the maintainer
copies it there from session scratch). Executor: copy it byte-identical to
`prompts/20260729-ep03-artwork-and-promotion-executor-spec.md`, verify with `cmp`, and
commit the `prompts/` copy in the PR. `prompts/` seeds are immutable after handoff.

---

## 0. Read the durable contracts first (non-negotiable)

Launch: `env AUDIO_LAB_EXECUTOR=1 claude`. Before any action, read in order:

1. **`AGENTS.md` on `main`, in full.**
2. `CLAUDE.md` at the repo root — conflicts resolve to `AGENTS.md`.
3. `~/.claude/CLAUDE.md` — note § "The artifact is not the behavior", § "GitHub
   metadata governance", § "Proactive continuity walkthrough" (you owe one immediately
   after branching), § "Generated artifacts must be self-describing".
4. Memory files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/` —
   especially `squash-commit-bodies-are-the-permanent-record.md` (commit with
   `git commit -F`, curated body, never bare `-m`) and
   `inspect-the-artifact-before-speccing-it.md` (open files before claiming them).
5. `CHANGELOG.md` § Findings, and issue #⟨N⟩ once you have filed it.

**A durable contract outranks this spec. Conflict → stop and report.** Guard blockages
are reported, never routed around. **Never merge** — open a draft PR and hand back.

**Rules that will bite on this task:**
- ★ **The Ep02 visual system is the binding reference, not inspiration.** Every E3
  image must read as a sibling of Ep02's set. Divergence is a defect, not a choice.
- ★ **Inspect before you build.** Determine how Ep01/Ep02 art was actually produced
  (`episodes/ToldStraight-Ep0{1,2}/*.png`, `_v1-archive/README.md`, `tools/brand/`,
  `brand/`, `output/artwork/`, CHANGELOG art entries, related closed PRs). If a
  scripted builder exists, use it. If not, build with HTML/SVG rendered to PNG using
  `brand/` tokens, match Ep02 by eye at 100%, and record the method in the PR body.
- ★ **Audio never lands in git.** `episodes/` tracks art/transcripts/notes only; the
  MP3 stays in the recordings folder. Verify `git status` shows no audio before commit.
- ★ **Do not read the episode script for pleasure or summary anywhere the maintainer
  will see it un-asked** — he is preserving a cold first listen. Build from the files;
  quote punchlines in nothing (PR body, issue, commit messages, alt-text stays
  descriptive-functional).

## 0b. Progress tracking

Maintain a live task list (TodoWrite if available; otherwise an inline checklist
re-posted at each step boundary), one item per §3/§4 step and §6 criterion.

---

## 1. Context — what exists and where (verified 2026-07-29 by the PM session)

Episode 3 ("Session Two: The Results Are In", 13:46 draft-1 mix) is fully assembled
but lives entirely OUTSIDE the repo:

| Artifact | Path |
| --- | --- |
| Episode mix (draft 1) | `~/ToldStraight-recordings/20260729-ep03-session/20260729-elevenlabs-mv2-jaredv3-emma-ep03-results-are-in-draft1-192k.mp3` |
| Per-line stems (50) | `~/ToldStraight-recordings/20260729-ep03-session/stems/` |
| Assembly timeline (true timestamps) | `~/ToldStraight-recordings/20260729-ep03-session/20260729-ep03-assembly-timeline.json` |
| Publish kit: `show-notes.md`, `youtube-description.txt`, `episode-copy.txt`, `transcript.{txt,md,vtt}` | `~/ToldStraight-recordings/20260729-ep03-session/publish/` |
| Script draft v1 (line IDs J01–J24/A01–A26) | `artifacts/specs/20260729-toldstraight-ep03-script-draft-v1.md` (maintainer-copied; fallback `~/.claude/jobs/01af3b30/tmp/` same basename) |
| Ep03 plan (voices, gags, provenance) | `artifacts/specs/20260729-toldstraight-ep03-plan-ysq-results-session.md` (same fallback) |
| Cast trading cards | `artifacts/specs/20260729-toldstraight-ep03-cast-trading-cards.md` (same fallback) |
| Anna portrait (exists, committed) | `episodes/cast/portraits/20260729-gemini-nano-banana-2-anna-sinclair-ep03-clinician-cast-portrait-1x1.png` |

Voices used (for `cast.json`, §4): Anna = ElevenLabs shared-library "Emma",
`56bWURjYFHyYyVf490Dp`, Australian, chosen by maintainer 2026-07-29, rendered on
`eleven_multilingual_v2`, `mp3_44100_192`. Host = IVC "Jared v3",
`EY5FCjATHRuLwJJXcDmf`, cloned 2026-07-29 from the 12-part long-form corpus
(`~/ToldStraight-recordings/20260729-ivc3-corpus-session/`), same model/format.

Chapter timestamps (from the draft-1 mix — re-derive from the timeline JSON if stems
were retaken since): 0:00 · 1:24 · 2:48 · 5:20 · 8:48 · 10:30 · 12:57.

**If any §1 path is missing, stop and report — do not reconstruct content yourself.**

## 2. File the tracking issue FIRST

`gh issue create -R Jared-Godar/audio-lab` with title:

> Ep03 exists only in gitignored/off-repo zones — build its artwork set and promote
> the episode to the tracked zone

Body: house standard (Summary / Evidence with commands and pasted output — `ls` the
session folder, `ls episodes/ | grep -i ep03` showing no output, `git log --oneline -3`
/ Why now — the episode is shipping and nothing about it survives a fresh clone /
Proposed resolution — this spec, named / Non-goals — §5 verbatim / Acceptance
criteria — §6 verbatim / References — this spec's path, the Ep03 plan spec, Ep02 as
the parity reference, provenance line "PM session 2026-07-29, Ep03 sprint"). Apply
labels/milestone/project per the header AFTER verifying names exist. Record the issue
number; it is ⟨N⟩ everywhere below.

## 3. Part one — the artwork set

Land under `episodes/ToldStraight-Ep03/` (art only at this step; §4 brings the rest).

1. **Method discovery (do this before any pixel):** determine how Ep02's set was
   built, per ★ above. Record findings + chosen method in the PR body.
2. **`cover.png`** — the Ep02 cover is a clinical intake-form motif ("SESSION ONE",
   red underline, form fields, red stamp). Ep03's cover is the same family, evolved
   one notch: a **scored answer-sheet / results-report motif** — "SESSION TWO", subtitle
   "The results are in", form fields in the Ep02 style (e.g., Patient: [YOU] ·
   Status: Results in · Sheet: 232 items, scored), and the red stamp reading
   **SCORED**. Same dimensions/palette/type as Ep02's cover (`brand/` tokens).
3. **Six exhibit cards `ch1.png`–`ch6.png`**, Ep02's exact exhibit format (Exhibit
   NN — title / big stat / one-line sub / attribution). Content, locked by the PM —
   copy may be typographically tightened, numbers and attributions may not change:
   - ch1 — Exhibit 01 — The homework. **"232 items"** / "one pen, ten pages, real
     answers".
   - ch2 — Exhibit 02 — The evidence, told straight. **"n = 2"** / "small studies —
     and they disagree". Philipsen 2017; Kiraz 2021.
   - ch3 — Exhibit 03 — Door one. **"4.56 / 6"** / "Emotional Deprivation — 7 of 9
     items at five". Philipsen 2017.
   - ch4 — Exhibit 04 — The fingerprint. **"1 six in 232"** / "only where the task
     stops feeding". Marx 2021; Sergeant 2005.
   - ch5 — Exhibit 05 — Door three. **"gives 5s, receives 1s"** / "Self-Sacrifice —
     rings truest, measures worst".
   - ch6 — Exhibit 06 — The plan. **"d ≈ 0.65"** / "if-then plans, meta-analyzed".
     Gollwitzer & Sheeran 2006.
4. **`cast/clinician_anna_sinclair.png`** — the Ep02 brutalist personnel-file card:
   name, role "clinician", the NOT REAL stamp. Ep02 used synthetic silhouettes; if the
   method supports it cleanly, the committed Anna portrait may sit where the
   silhouette goes — otherwise silhouette, consistent with Ep02. Card copy comes from
   CARD 005 in the trading-cards file (§1) — role line and "License number:
   NOT-A-REAL-1" are the card's canon.
5. **`alt-text.md`** — Ep02's format, one line per image, descriptive-functional, no
   punchlines.
6. **Maintainer checkpoint (HOLD):** post all images on the PR (or issue) for visual
   sign-off BEFORE §4's promotion commit. Art the maintainer hasn't seen does not
   merge. Continue §4 work in parallel on the branch, but flag the PR as awaiting art
   review.

## 4. Part two — promotion to the tracked zone

Into `episodes/ToldStraight-Ep03/`, mirroring Ep02's inventory:

1. Copy from the publish kit (byte-identical, verify with `cmp`): `show-notes.md`,
   `youtube-description.txt`, `episode-copy.txt`, `transcript.txt`, `transcript.md`,
   `transcript.vtt`. Generate `show-notes.html` and `transcript.html` only if Ep02's
   HTML twins were produced by a repeatable method you find in §3.1's discovery —
   otherwise note their absence in the PR as a recorded gap, do not hand-write HTML.
2. Copy the script: `artifacts/specs/20260729-toldstraight-ep03-script-draft-v1.md` →
   `episodes/ToldStraight-Ep03/script-draft-v1.md` (this is the recorded-from text;
   the episode is cut from it, so it is a deliverable, not scratch).
3. **`episodes/cast.json`** — append two entries in the existing schema (see §1 for
   every field value): Anna/Emma (`role: "clinician"`, `episode: "ToldStraight-Ep03"`,
   `source: "shared-library"`, `chosen_by: "maintainer"`, `chosen_on: "2026-07-29"`,
   provenance: "Ep03 casting, maintainer's ear-verdict; shared-library Emma") and
   Jared v3 (`role: "host"`, `source: "instant-voice-clone"`, provenance: "12-part
   long-form IVC corpus, 2026-07-29; supersedes-for-Ep03 the #91 Jared 1.0
   patch-tool config, which remains recorded for Ep01").
4. **`CHANGELOG.md`** — entry for the whole PR (episode content + art + cast). Add a
   § Findings line ONLY for things learned about external services this session that
   the diff doesn't show (candidates, verify against `docs/elevenlabs.md` first so you
   add nothing already recorded: shared-library voices need account-add before TTS and
   scoped keys can lack `add_voice_from_voice_library`; the IVC wizard accepted a
   12-file / ~12-minute corpus).
5. Standard flow: branch `ep03-artwork-and-promotion` → continuity walkthrough
   (immediately after branching, per the global rule) → commits with `git commit -F`
   curated bodies → push → **draft PR** with `Fixes #⟨N⟩`, labels/assignee/milestone
   per header, method notes, art screenshots, and the §3.6 HOLD flag → report back
   with SHAs and receipts. **Do not merge; do not announce green light** — that
   remains the maintainer/PM's call.

## 5. Non-goals

- No changes to Ep01 or Ep02 content or art.
- No re-render of any audio; no ElevenLabs spend of any kind.
- No committing audio files.
- No Des Fable restructure work (a 2026-07-29 reassignment was retracted the same
  day — see the session decisions log; the trading-cards promotion, if the maintainer
  wants it, is a separate future issue).
- No cover/thumbnail for YouTube beyond `cover.png` (platform-specific crops are the
  maintainer's upload-time concern).
- No merging, no branch deletion, no closing #⟨N⟩ (auto-closes on merge).

## 6. Acceptance criteria

- [ ] Issue #⟨N⟩ filed to house standard BEFORE the branch, with evidence commands
      and their pasted output
- [ ] Art method discovered and recorded in the PR body (what built Ep02's set; what
      built this one)
- [ ] `cover.png` + `ch1.png`–`ch6.png` + `cast/clinician_anna_sinclair.png` +
      `alt-text.md` present under `episodes/ToldStraight-Ep03/`, in-system with Ep02
- [ ] Exhibit numbers/attributions match §3.3 exactly (diff-check the copy)
- [ ] All images posted for maintainer review; PR flagged HOLD until his art sign-off
- [ ] Publish-kit files copied byte-identical (`cmp` receipts in the PR body)
- [ ] `cast.json` parses (`python3 -m json.tool`) and carries both new entries with
      full provenance
- [ ] `git status` / PR diff show zero audio files
- [ ] CHANGELOG entry in the same PR
- [ ] Continuity walkthrough written to the gitignored walkthrough zone right after
      branching
- [ ] Spec copied byte-identical to `prompts/` (`cmp` receipt)
- [ ] Draft PR open with `Fixes #⟨N⟩`, complete metadata, no merge performed

## 7. References

- Ep02 parity reference: `episodes/ToldStraight-Ep02/` (art, alt-text, file inventory)
- Cast portrait provenance: `episodes/cast/portraits/manifest.json`
- Ep03 plan / cards / script: §1 table
- IVC + model precedent: `docs/elevenlabs.md` § Cloned voices, ADR 0017, #91
- Provenance: PM session 2026-07-29 (the Ep03 sprint session: scoring, casting,
  render, assembly, publish kit — this spec is that session's handoff)
