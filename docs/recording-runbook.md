# Recording runbook — from zero to handed-off takes

Written 2026-07-27 for the Ep01 + Ep02 host recording session and the IVC voice-clone
corpus (#69). This is the **session document** — follow it start to finish, in order, on
the day you record. `docs/voice-capture.md` stays the **decisions/hardware/room**
reference (why the QuadCast, why the bedroom, the cloning routes) — this file links back
to it rather than duplicating it, and it links forward here for the mechanics it never
had. If you have never opened Adobe Audition before, section 4 names every click.

**Source of the scripts below:** Ep01 lines are transcribed exactly from
`artifacts/20260727-ep01-v2-host-read-sheet.md` (gitignored; #68 will promote it to
`episodes/ToldStraight-Ep01/` — until then this is the canonical source and the one to
re-check if the two ever disagree). Ep02 lines are transcribed exactly from the tracked
`episodes/ToldStraight-Ep02/record-host-ep02.txt`.

---

## 1. Session pre-flight

- **Do Not Disturb on.** Phone in **another room**, not merely silenced — a vibrate
  against a hard surface is still audible on a sensitive condenser.
- **System Settings → Sound → Sound Effects:** turn off "Play sound on startup" and "Play
  user interface sound effects." An alert landing mid-sentence is a retake.
- **AC and fan off.** Record when the street outside is quietest.
- **Sample rate — Audio MIDI Setup:** Applications → Utilities → **Audio MIDI Setup** →
  select **HyperX QuadCast** in the device list → **Format** → set **48000 Hz**. A
  mismatch between the input device and your Audition session resamples silently — no
  error, just a slightly wrong recording — so set this before anything else.
- **QuadCast hardware:**
  - **Pattern switch on the mic's rear: select cardioid** (the single-dot / front-facing
    pattern). The QuadCast supports four patterns; cardioid is the one that rejects room
    sound instead of capturing it.
  - **Gain dial starting point:** roughly the 9-o'clock position, then adjust up while
    watching Audition's input meter on your first two lines (§5).
  - **Tap-to-mute:** the top surface of the mic is touch-sensitive — tapping it mutes
    instantly (the LED changes) without needing to reach for software. Useful for a
    sudden cough or interruption mid-session; tap again to unmute.
  - **Placement:** one hand span from the capsule (15–20 cm), 15–30° off-axis so plosives
    pass by the capsule instead of hitting it head-on. See `docs/voice-capture.md` §
    "Placement inside the room" for the full plan/side-view diagrams.

## 2. Room options

Full reasoning, the room shootout, and the plan/side-view diagrams live in
`docs/voice-capture.md` § "Choosing the room" — read that first if you have not. Two
paths from here:

### Bedroom ideal

The bedroom wins on soft mass (bed, duvet, pillows, curtains, closet of clothes) and
usually has fewer windows than the living/dining room. If it's available, use it — see
the linked section above for exact placement inside it.

### In-situ desk variant (documented fallback)

If you're recording at your desk instead — because you're running other work in
parallel, or the bedroom isn't free — this is not a downgrade to "no technique," it's a
different technique:

- **Soft mass behind and flanking the mic.** A comforter or duvet draped over the back of
  a chair positioned behind the mic absorbs what would otherwise bounce off the wall
  behind you. If you can rig it, a duvet tent over your head and the mic (draped over a
  monitor arm or boom, well clear of your mouth) goes further — it turns your immediate
  recording space into its own small soft-walled room regardless of what the rest of the
  room is doing.
- **Mic pointed AWAY from hard walls and windows.** At a desk you're boxed in by exactly
  the surfaces `docs/voice-capture.md` warns about — monitor glass, a window, a bare
  wall. Orient so the mic's rear (its least sensitive angle in cardioid) faces the
  hardest surface in reach.
- **Laptop and external drives as far off-axis as cables allow.** A spinning external
  drive and a laptop fan are real, continuous noise sources — not occasional like a
  fridge cycling, but present in every second of every take. Push them behind the mic or
  to the side; don't let them sit in front of you or behind you on the mic's front lobe.
- **The room-tone probe below exists specifically to catch this.** A desk setup can sound
  fine to your ear while a laptop fan is riding just under conscious notice — that's
  exactly what §3 is for. Don't skip it because "it seems quiet enough."

## 3. The room-tone probe (gate)

Before recording anything else, record **10 seconds of silence** in your actual session
position — mic live, you not speaking, nothing else changed — and measure it. This is a
gate, not a suggestion: if it fails, fix the room or wait out the noise source before
recording a single take.

Save the 10-second silence as `room-tone-test.wav` anywhere convenient, then run:

```fish
ffprobe -v error -show_entries stream=sample_rate,channels,codec_name \
  -of default=noprint_wrappers=1 room-tone-test.wav
ffmpeg -i room-tone-test.wav -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
```

**Executed this session against a synthetic 10 s digital-silence WAV** (there is no
QuadCast on this machine — this proves the command syntax and macOS's `ffmpeg`/`ffprobe`
work; your real room-tone reading will differ and is what actually gates the session):

```text
codec_name=pcm_s24le
sample_rate=48000
channels=1
[Parsed_volumedetect_0] mean_volume: -91.0 dB
[Parsed_volumedetect_0] max_volume: -91.0 dB
```

**Pass bar, read `mean_volume`:**

| Reading | Verdict |
| --- | --- |
| ≤ **−60 dBFS** | Clean. Proceed. |
| **−59 to −50 dBFS** | Workable — usable, but you'll hear the room on a quiet listen. |
| **above −45 dBFS** | Fix the room (soft mass, close a door, wait out a noise source) or wait, then re-probe. Don't record the session on this reading. |

`afinfo room-tone-test.wav` is a faster sanity check for format alone (sample rate, bit
depth, channels) if you don't need the level reading.

## 4. Adobe Audition, zero to first record

Every click named — this section assumes you have never opened Audition. **MANUAL: not
executed this session** (this is a click-path, not a command; the maintainer confirms
live and corrects this text if a pane differs on the installed version).

1. **Launch Audition.** If prompted for a workspace, choose **Window → Workspace →
   Default**.
2. **File → New → Audio File.** This opens the **Waveform editor**, not Multitrack —
   deliberately: you're capturing one continuous mono file, and Waveform is the simplest
   path to that with nothing extra to configure (no track routing, no session
   sample-rate mismatch to reconcile against the file's). Multitrack is for layering
   multiple tracks together, which this session doesn't need.
   - Sample rate: **48000 Hz**
   - Channels: **Mono**
   - Bit depth: **24-bit**
3. **Audition → Settings (or Edit → Preferences on some versions) → Audio Hardware:**
   - **Default Input: HyperX QuadCast**
   - **Default Output / monitor:** your Bose headphones, plugged into the QuadCast's own
     headphone jack (zero latency, and it keeps anything leaking out of your headphones
     from bleeding back into the take).
   - **The trap:** the QuadCast also appears under **Output** in this same settings pane,
     because it has a built-in headphone jack. Make sure you're picking it as **Input**,
     not confusing the two entries.
4. **The red Record transport button** starts capture; the same button (now showing
   stop/pause icons) stops it.
5. **File → Save As** → format **WAV**, confirm the sample type shown matches 48000 Hz /
   24-bit / mono — Audition will offer to convert if your session and file settings
   drifted; confirm rather than accept blindly.
6. **Never apply effects or Enhance to clone or stem material.** Adobe Podcast Enhance
   and Audition's Speech Enhancement effect are generative reconstructions of your voice,
   not filters — they change your timbre. This applies to both the Ep01/Ep02 host takes
   (they replace synthesized stems 1:1; processed audio sitting next to unprocessed
   co-host stems is audible) and doubly to the IVC corpus (§8), where ElevenLabs wants
   raw, unprocessed audio.

## 5. Capture conventions for the continuous take

- **Read in script order.** Don't jump around — turn ids are for the assembler to match
  files to stems, not a signal that you can record out of sequence.
- **Leave ≥2 seconds of silence between lines.** This is what makes downstream
  turn-extraction from a single continuous file possible.
- **On a flub: stop, pause ≥2 seconds, re-read the WHOLE line.** Convention: the **last**
  complete instance of a line wins. This makes retakes free — you never need to
  splice mid-line, and you never need to tell anyone which take to use; downstream
  tooling takes the last one.
- **No verbal slating.** Don't say the turn id or line number out loud before reading —
  it's not needed (the read order plus the gaps is enough) and it's one more thing to
  edit out later.
- **Levels: peaks between −12 and −6 dBFS**, checked on Audition's meters during the
  first two lines, gain adjusted on the QuadCast's own dial (not in software — software
  gain after a hot input can't undo clipping that already happened at the
  analog-to-digital stage), then hands off for the rest of the take.

**Guide-track option (context only):** you can play
`artifacts/_guide-tracks/20260727-ffmpeg-ep01v2-cohost-only-guide-track-192k.mp3` quietly
in closed headphones while recording Ep01, to hear where Jofra's (co-host) lines land
around yours. **Caveat:** its silent gaps are sized to the *old TTS host's* pacing, not
yours — treat it as context for where you are in the conversation, not a metronome. If
your delivery needs more room than the guide track gives you, pause playback rather than
rush a line; assembly rebuilds the timeline from stems (`smart_gap_ms` in
`pipeline/core/episode.py`), so your delivered timing wins, not the guide track's.

## 6. The Ep01 script — 27 host lines

All 27 lines, transcribed exactly from `artifacts/20260727-ep01-v2-host-read-sheet.md`.
Each is labelled with its turn id and a character/duration hint. Turn ids are the
**even** indices `t00..t52` — this is what the assembler matches on; see §9 for the file
naming that carries the id through to the saved WAV.

**01. `t00`** (404 chars, ~28s)
> So. You got the diagnosis. Adult ADHD. Welcome to the club. There's no newsletter -
> we'd never finish writing it - and your membership card is already in a drawer you
> swear you'll organise someday. But you're in. And to run your orientation, I've got
> someone who studies this for a living and also, full disclosure, has it himself. So
> you're getting the data and the lived experience from the same bloke.

**02. `t02`** (81 chars, ~6s)
> Let's clear up the big one straight away. Did our listener catch this off TikTok?

**03. `t04`** (33 chars, ~2s)
> Seventeen seventy-five. So it's -

**04. `t06`** (50 chars, ~3s)
> Okay. And the other one: our listener is not lazy.

**05. `t08`** (113 chars, ~8s)
> Start with where it comes from. Because a lot of people carry this quiet guilt, like
> they did this to themselves.

**06. `t10`** (47 chars, ~3s)
> Put seventy-four percent in perspective for me.

**07. `t12`** (62 chars, ~4s)
> Guilty. But it's not just behaviour - you can actually see it?

**08. `t14`** (28 chars, ~2s)
> So the brain wasn't broken -

**09. `t16`** (150 chars, ~10s)
> Here's what I don't get. If it's genetic, visible on a scan, and two hundred and fifty
> years old - how does someone reach forty before anyone notices?

**10. `t18`** (3 chars, ~0s)
> Ah.

**11. `t20`** (33 chars, ~2s)
> And that misses women especially.

**12. `t22`** (28 chars, ~2s)
> Which is exhausting as hell.

**13. `t24`** (102 chars, ~7s)
> Okay. You keep teasing this Danish study. Deep breath. This is the part where you don't
> sugar-coat it.

**14. `t26`** (7 chars, ~0s)
> Double.

**15. `t28`** (22 chars, ~2s)
> That's genuinely grim.

**16. `t30`** (20 chars, ~1s)
> From the medication.

**17. `t32`** (109 chars, ~7s)
> So let's talk treatment. And I want to be careful here - we are not telling anyone what
> to put in their body.

**18. `t34`** (7 chars, ~0s)
> Hit me.

**19. `t36`** (32 chars, ~2s)
> Translate "one point oh" for me.

**20. `t38`** (45 chars, ~3s)
> And the honesty clause. Because you insisted.

**21. `t40`** (54 chars, ~4s)
> Alright. Land the plane. What's in the welcome packet?

**22. `t42`** (59 chars, ~4s)
> And the emotional side. Because that one blindsides people.

**23. `t44`** (10 chars, ~1s)
> And three?

**24. `t46`** (32 chars, ~2s)
> Can I editorialise for a second?

**25. `t48`** (356 chars, ~24s)
> For however many years, you had a reason and no name for it. And when you don't have a
> name, you pick one yourself - and it's always something cruel. Lazy. Flaky. Too much.
> You can retire that now. You didn't have a character defect. You had an undiagnosed
> neurodevelopmental condition - and you got this far anyway. Running the marathon
> without the shoes.

**26. `t50`** (156 chars, ~11s)
> And - I'm not going to hand you a poster that says it's a gift - but is it fair to say
> some things come with this wiring that genuinely work in your favour?

**27. `t52`** (72 chars, ~5s)
> A footnote. I'll take it. Welcome to the club. Try not to lose the card.

## 7. The Ep02 script — 22 host lines

All 22 lines, transcribed exactly from `episodes/ToldStraight-Ep02/record-host-ep02.txt`.
That file's own numbered convention (`H01..H22`) is used below — see
`docs/voice-capture.md` § "Practical checklist" for why this differs from Ep01's turn-id
requirement: Ep02 has no per-turn stem assembler yet, so there is nothing for an `HNN`
name to fail to map onto.

--- Session one ---

**H01** So. Session one. I'm in the chair - fine, it's a video call, but let's pretend
there's a chair, it's more cinematic. I'm in my mid-forties. I got the ADHD diagnosis a
few months ago, I've been on the medication, and here's the strange part: the pills work.
The noise drops. The world stops shouting all at once. But there's a problem the pills
don't touch. Forty years of wiring upstairs. Four decades of quietly deciding what kind
of person I must be to keep losing my keys and missing deadlines and disappointing people
who love me. The pills quiet the symptom. They don't rewrite the story I built on top of
it.

**H02** So what is ADHD therapy, actually? Because when I hear therapy I picture a couch
and someone asking how my mother made me feel.

**H03** Okay. I'm listening.

--- CBT and ACT, quickly ---

**H04** You're about to throw a pile of three-letter acronyms at me, aren't you.

**H05** And the second one?

**H06** I appreciate that, actually. Everyone online is so damn sure about everything.

--- The two MCTs, told straight ---

**H07** My therapist called it MCT. Metacognitive therapy. That's the one I wrote down.

**H08** Of course it does.

**H09** So the thing with my name on it has no ADHD evidence behind it?

**H10** That is genuinely unhinged. So which one did my therapist mean?

--- The tools, out loud ---

**H11** Good, because I've got the notes right here. First thing my therapist gave me:
"I'm having a thought that - blank."

**H12** My notes also say: thoughts aren't facts. Black-and-white thinking is a
distortion. Negative thoughts drive negative emotions.

**H13** That's weirdly freeing. I've spent my whole life treating every anxious thought
like a memo from management that demanded an answer.

--- The patterns underneath ---

**H14** But some of them don't feel like spam. Some feel true. The "you're a failure" one
&mdash; that doesn't feel like a random thought. It feels like a conclusion I earned.

**H15** Which ones?

**H16** Because -

**H17** Yeah. That one lands.

--- What to do about them ---

**H18** So what do I actually do with a forty-year-old belief that I'm a failure?

**H19** So the belief isn't exactly a lie. It's a - misfiled conclusion.

**H20** And the homework?

**H21** Which is the whole point of the paperwork.

**H22** Welcome to the club.

## 8. Voice-clone corpus (IVC)

3–5 continuous minutes, recorded in the same session, same mic, same room, same distance
as the host takes above (see `docs/voice-capture.md` § "Hardware" — a cloning source is
training data captured the same way as the deliverable, and diverges only in how it's
treated afterward).

- **Perform it the way you want the show to sound** — engaged, dry, conversational — not
  a flat book-reading voice. The clone learns your performance, not just your timbre.
- **Source text:** your own episode scripts are ideal (exact register, vocabulary,
  rhythm); any conversational prose is acceptable if you want more variety.
- **Diverse sentences over repeated paragraphs** — broad phoneme coverage matters more
  than volume.
- **NO processing.** No compression, EQ, noise reduction, de-essing, reverb,
  normalization, and — the trap named in §4 — no Adobe Podcast Enhance or Audition
  Speech Enhancement. No background music, no second speaker anywhere in the file.
- **One room, one mic, one distance** — the same setup as the host takes, not a separate
  session in a different spot.
- **Trim long silences before upload.** Dead air teaches the clone nothing and dilutes
  the sample.

```fish
ffmpeg -i raw-corpus-take.wav -af "silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-50dB" trimmed-corpus.wav
```

**Executed this session against a synthetic 5 s file (2 s tone + 3 s trailing silence)**
to prove the filter syntax runs correctly on this machine's ffmpeg (8.1.2):

```text
# before: 5.000000 (seconds, via ffprobe -show_entries format=duration)
# after silenceremove: 3.019771
```

The trailing 3 s of silence dropped to essentially nothing, leaving the 2 s of actual
content plus filter overhead — confirming the command removes trailing dead air rather
than doing nothing or over-trimming actual speech. Re-check by ear afterward; automated
silence detection can clip the tail of a soft word if `stop_threshold` is set too
aggressively for your room's noise floor.

**PVC is explicitly out of scope here.** There is exactly one Professional Voice Clone
slot on the account; spending it is gated to the maintainer (`AGENTS.md` § "Hold for the
maintainer"). This corpus is for an Instant Voice Clone only.

## 9. Save / verify / hand off

**Naming**, per the artifact-naming rule
(`YYYYMMDD-quadcast-audition-<subject>-<purpose>.wav`):

```text
20260727-quadcast-audition-ep01-host-continuous-take.wav
20260727-quadcast-audition-ep02-host-continuous-take.wav
20260727-quadcast-audition-ivc-corpus-take.wav
```

If you record per-line instead of continuous, name each file with its turn id or `HNN`
per §6/§7 (e.g. `t00.wav`, `H01.wav`) — those are the names the downstream extraction and
assembly steps expect, not the session-level names above.

**Verify format** — every file must read 48000 Hz / 1 channel / `pcm_s24le`:

```fish
for f in *.wav
    echo -n "$f: "
    ffprobe -v error -show_entries stream=sample_rate,channels,codec_name -of csv=p=0 $f
end
```

**Executed this session against two synthetic test WAVs** built to the target spec
(48 kHz / mono / 24-bit), proving the loop's syntax and output shape:

```text
20260727-quadcast-audition-ep01-t00-test-take.wav: pcm_s24le,48000,1
20260727-quadcast-audition-ep01-t02-test-take.wav: pcm_s24le,48000,1
```

**Peak check** — confirm nothing clipped and nothing is inaudibly quiet:

```fish
for f in *.wav
    echo -n "$f: "
    ffmpeg -i $f -af volumedetect -f null - 2>&1 | grep max_volume
end
```

**Executed this session against the same two synthetic files** (a −9 dB tone and a
silent file, standing in for a real take and a placeholder — the actual pass bar is
−12 to −6 dBFS peak on a real voice take, not these synthetic values):

```text
20260727-quadcast-audition-ep01-t00-test-take.wav: max_volume: -27.1 dB
20260727-quadcast-audition-ep01-t02-test-take.wav: max_volume: -91.0 dB
```

**Landing convention** — create the session folder and move finished files there:

```fish
mkdir -p ~/ToldStraight-recordings/20260727-ep01-ep02-session
mv *.wav ~/ToldStraight-recordings/20260727-ep01-ep02-session/
```

**Tell the PM session the path** once files are landed — extraction (splitting a
continuous take into per-turn files) and assembly (matching files to stems, re-rendering
the master) are its job, not yours. Recording is complete when the format and peak checks
above pass and the files are at that path; it does not require the episode to be
re-assembled in the same session.

## 10. What NOT to do

- **No effects on raw captures.** No Enhance, no compression, no EQ, no noise reduction —
  not on the deliverable stems, and never on the IVC corpus.
- **No mp3 for masters.** Capture and hand off WAV; mp3 is a downstream/output format
  only.
- **No re-recording into the same file over a good take.** A flub gets a fresh take after
  the pause (§5's "last complete instance wins" convention) — don't punch in over a take
  you might still want.
- **No deleting any capture until the PM confirms extraction.** A capture that looks
  redundant once assembled might not actually be — keep the raw files until the person
  doing extraction says they're no longer needed.
