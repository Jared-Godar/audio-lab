# Executor rails — issue #55: `--host-stems DIR` on assembly, Ep01 v2 host swap

Authored 2026-07-29 by the PM session. Immutable after handoff — revisions go to a new
dated file.

## 0. Contract read (first action, before anything else)

Read, in this order: `AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, and the memory
files under `~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`. **Durable
contracts outrank this spec.** If this spec conflicts with any of them, stop and report
— do not resolve it yourself.

## 1. Decisions already made (do not relitigate)

- **§4A option 1 is the recorded decision** (maintainer, 2026-07-29, in-session:
  "4A1 yes render--assemble"): a `--host-stems DIR` option on the assembly path.
  Non-destructive; the Daniel stems stay on disk; an A/B is a flag.
- §4B: format conversion (48 kHz/24-bit WAV → 44.1 kHz mono) belongs in the tool and
  is **stated in output**, never silent.
- §4C: loudness across the human/synthetic boundary is verified, not assumed. Receipt
  from the PM preview run (2026-07-29, `master_from_stems` defaults): HOST −24.83 →
  −16.22 LUFS, EXPERT −16.75 → −16.00, final −16.52 LUFS. The chain generalises; the
  executor re-proves it in tests, not by citing this number.

## 2. What exists already (verify, then build on it)

- `pipeline/core/episode.py`: `parse_turns()`, `master_from_stems(stems: list[(Turn,
  Path)], out_path, ...)` — the approved Ep01 v2 recipe is its defaults (tempo 1.08,
  loudnorm −16 LUFS, smart gaps).
- 54 rendered stems in `output/episodes/ToldStraight-Ep01-v2/stems/`, turn-id prefixed.
- The maintainer's 27 extracted host turns: `~/ToldStraight-recordings/
  20260729-ep01-session/narration/t00.wav … t52.wav` (48 kHz/24-bit/mono WAV, even ids).
  Extraction mapping receipts: `20260729-extraction-mapping-report.json` in the session
  folder. **These files may be re-recorded before you run — take the directory as
  input, never hardcode contents.**
- The turn-id mapping read sheet is already tracked at
  `episodes/ToldStraight-Ep01/host-read-sheet.md` — verify with `git ls-files`, and if
  (and only if) it is untracked, promote it per the issue's acceptance criterion.

## 3. Scope

Implement exactly issue #55 §6 acceptance criteria, §4A option 1:

1. `--host-stems DIR` on the assembly CLI path (`uv run voicelab …` — find the existing
   assemble entry point in `core/cli.py` and extend it; do not invent a new command if
   one fits).
2. Matching is **by turn id parsed from filename** (`t\d+` prefix, e.g. `t04.wav`),
   never by sort order. Demonstrate with a deliberately out-of-order input in tests.
3. Negative tests, each a clear error, never a corrupt master: missing turn id for a
   HOST turn · an extra unmatched file in DIR · a wrong-sample-rate input (the error
   must name the file and the expected format).
4. Overlay semantics: a file in DIR whose turn id matches replaces that stem for
   assembly only; generated stems are untouched on disk (A/B stays possible).
5. Conversion to the target format is reported in output (one line per converted file).
6. Produce the swapped master with the maintainer's narration dir, `ffprobe` receipts
   pasted in the PR, duration compared against the 629.42 s Daniel master.
7. Zero credits: `uv run voicelab rates`-visible ledger identical before and after,
   both readings pasted. Nothing in this work may construct an ElevenLabs client that
   spends. Tests are network-stubbed.
8. CHANGELOG entry in the same commit (a Findings entry only if something external was
   learned — this work is local, so probably none).

Non-goals are issue #55 §5 verbatim: no Jofra re-render, no cloning, no credits, no
take editing, no publishing, no script/cast/gap/mastering-parameter changes.

## 4. Workflow (canonical, per AGENTS.md)

- Branch from fresh `main`: `task/issue-55-host-stems-swap`.
- Continuity walkthrough immediately after branching, per the global rule.
- PR: `Fixes #55` · labels `type: task`, `area: pipeline`, `area: episodes` (verify in
  `.github/labels.json` before applying) · assignee Jared-Godar · milestone
  `M4 — Episodes v2`.
- Squash-commit body via `git commit -F` with a curated body — never bare `-m`.
- Never merge; report; the PM announces HOLD / GREEN LIGHT.

## 5. Stop conditions

Stop and report rather than improvising if: the assemble entry point in `core/cli.py`
does not match §3.1's assumption · the narration dir is absent or not 27 files ·
any step appears to need credits · a durable contract conflicts with this spec.
