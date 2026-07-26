# Starter prompt — "Told Straight" v2: hybrid host + ElevenLabs

Help me rework my podcast "Told Straight" in this repo (`~/Code/audio-lab`). Let's
plan the approach together before regenerating anything — I want to make the calls
on the creative decisions below first.

## What I'm doing
Redo my first TWO episodes in a new **hybrid** format — **my own voice** as the human
host talking with an **AI assistant co-host** — and re-audition / tweak the recurring
co-hosts. I just upgraded to **ElevenLabs Creator** (121k credits/mo, Professional
Voice Cloning, 192 kbps, commercial license), so I want to lean on those features.

## Where things stand (double-check, some of this may be stale)
- `episodes/ToldStraight-Ep01/` — Ep01 assets in-repo (transcripts, show notes,
  chapter art; the mp3 is gitignored). Working copy: `~/ToldStraight-Ep01/`.
- Ep02 ("Session One…", host Des Fable + guest Dr. Michael Voss, both synthetic) —
  assets are in `~/ToldStraight-Ep02/`, not committed yet.
- TTS today is edge-tts (plus Kokoro-style `bm_fable`/`am_michael` in Ep02). The
  audition tooling is `pipeline/audition/{audition,helpers,run}.py` and
  `fish/audition.fish` + `fish/audition-judge.fish`, all wired to edge-tts.
- `.env` is gitignored — ELEVENLABS_API_KEY goes there, not in the code.

## What I want to get done
1. Add an ElevenLabs option to the audition pipeline (keep edge-tts too, just make
   the provider a parameter). Sample the ElevenLabs voice library with the existing
   audition-judge flow.
2. Set up my own voice track (see decision A).
3. Re-audition the co-hosts — pick/design ElevenLabs voices to replace or refresh
   Des Fable & Dr. Voss, keep them consistent across both episodes.
4. Rewrite the Ep01 & Ep02 scripts into the me-plus-AI hybrid format before
   generating any audio.
5. Regenerate the audio at 192 kbps, plus chapters / art that need to change.
6. Keep half an eye on ElevenLabs credits so a full re-generation doesn't torch the
   monthly 121k.

## Decisions I want to make first (give me your recommendation on each)
- **A — my voice: record or clone?** Record my lines live and splice, or clone my
  voice with ElevenLabs PVC so my lines are TTS I can edit easily?
- **B — co-host voices:** library pick, Voice Design, or clone the existing
  Des/Voss characters?
- **C — order:** Ep01 first as the template, then Ep02? Or both together?
- **D — publishing:** replace the episodes on my private feed, or stage v2 privately
  first?

## Start by
Skim the repo to confirm the state above, then give me a short recommendation on
A–D and a rough plan (with a ballpark ElevenLabs credit cost per phase). Then let's
talk it through before you build anything.
