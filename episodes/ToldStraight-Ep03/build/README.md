# Ep03 build scripts

The ad-hoc, one-off scripts that produced Ep03's audio and transcripts. Kept here as **build
provenance** — how this specific episode was assembled — not as reusable tooling.

| Script | What it did |
| --- | --- |
| `render_ep03_stems.py` | Rendered the 50 per-line stems via ElevenLabs TTS (Jared v3 host `EY5FCjATHRuLwJJXcDmf`, Emma/Anna `56bWURjYFHyYyVf490Dp`, `eleven_multilingual_v2`). Quotes credits first, aborts over a safety cap, skips existing files, retries transient failures. |
| `assemble_ep03.py` | Assembled stems + room bed + train/printer gags with ffmpeg; wrote the assembly-timeline JSON and the final `loudnorm -16 LUFS` 192k mix. |
| `gen_ep03_transcripts.py` | Generated `transcript.{txt,md,vtt}` from the script draft + the true stem timings in the timeline JSON. |

**These are not the canonical episode builder.** Episodes 1 and 2 were built with the tracked
`pipeline/` package (`pipeline/core/`, the `voicelab` CLI, mastering baked into `render-episode`
per #46/#47). These scripts hardcode absolute session paths (`~/.claude/jobs/…`,
`~/ToldStraight-recordings/…`) and Ep03-specific gag timings, so they will not run unedited
elsewhere — read them for *what was done*, not as a command to re-run.

**Convention:** each episode's build scripts live under `episodes/ToldStraight-EpNN/build/`. The
same pattern will hold for the upcoming E1/E2 rebuilds (new speakers), which are separate work.

Audio never enters git — the stems and the mix stay in `~/ToldStraight-recordings/`.
