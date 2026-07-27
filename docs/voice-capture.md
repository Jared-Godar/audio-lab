# Voice capture — hardware, room, cloning, and the host-replacement pipeline

Written 2026-07-26 for the "Told Straight" hybrid-host rebuild; promoted from
`artifacts/voice-cloning-guide.md` to a tracked reference 2026-07-27 (#44) once it grew
hardware, software, and room guidance meant to be read on a phone, next to a microphone.
Durable ElevenLabs account/rate findings that aren't specific to recording live in
`docs/elevenlabs.md`.

---

## The short version

**Credit cost of cloning: zero.** Neither Instant nor Professional cloning consumes
character credits. You pay in voice slots, in recording time, and — for PVC — in
waiting. Generating *with* the clone afterwards costs the same as any other voice
(0.55x measured on this account).

The real currency is your time and one irreplaceable PVC slot.

## Your account's actual limits

Measured live from `GET /v1/user/subscription` and `GET /v1/models` on 2026-07-27
(this promotion) — these are facts about your plan, not general advice:

| | |
| --- | --- |
| Professional clones (PVC) | **1** — `professional_voice_slots_used = 0` |
| Instant clones (IVC) | unlimited, within the voice cap |
| Total voice slots | 30 — `voice_slots_used = 0` |
| Voice add/edit operations | 95 remaining (`voice_add_edit_counter = 0`) |
| Credits this cycle | 7,511 used / 130,552 limit → **123,041 remaining** |
| Can use professional cloning | `can_use_professional_voice_cloning = true` |
| Max output format | 192 kbps (`mp3_44100_192`) |

The credit and slot figures reconfirm the 2026-07-26 reading exactly — nothing has
moved. **One PVC slot is the binding constraint.** Treat it as a one-shot.

> Confidence note: everything in the table above came back from a live GET this
> session and is measured fact. The max-output-format row is carried from
> `docs/elevenlabs.md` (verified 2026-07-26) rather than re-derived here — output
> format is a per-request synthesis parameter, not an attribute either endpoint
> reports directly.

## Two routes

### Instant Voice Cloning — the one to start with

| | |
| --- | --- |
| Audio needed | ~1–5 minutes of clean speech |
| Turnaround | seconds |
| Slot cost | one ordinary voice slot (you have 30) |
| Reversible | yes — delete and redo freely |
| Fidelity | good; recognisably you, occasionally uncanny on hard prosody |

**Total time: roughly 40 minutes**, start to usable clone — ~15 min setup, ~20 min
recording, ~5 min upload and test.

### Professional Voice Cloning — the one to earn

| | |
| --- | --- |
| Audio needed | 30 minutes minimum; 2–3 hours for best results |
| Turnaround | hours — typically same-day, allow up to a day |
| Slot cost | **your only PVC slot** |
| Reversible | technically, but retraining costs the slot and the wait again |
| Fidelity | high; holds up across long passages and emotional range |
| Extra step | you must record a verification phrase to prove the voice is yours |

**Total time: 2–3 hours of your effort**, plus asynchronous training. Recording 30
usable minutes takes 45–60 minutes of wall clock once you account for retakes; the
2–3 hour tier means multiple sessions, which introduces its own consistency risk.

The Professional Voice Clone slot is **maintainer-gated and effectively
irreversible** (`AGENTS.md` § "Hold for the maintainer") — nothing in this guide, and
no tooling in this repo, spends it without Jared deciding to at the time.

> Confidence note: the slot and permission figures above are measured from your
> account. The minute thresholds and training turnaround are from general ElevenLabs
> guidance and may have shifted — the upload UI states current requirements at the
> time you submit, and that's the authority.

## Recommended route for your case

**Record your episode host lines first, then clone from those takes.**

You need to record Ep01's 27 host lines and Ep02's ~20 either way — that's the
decision you already made. Those takes are simultaneously your show audio *and*
your cloning corpus. Doing it in that order means:

1. Record host lines for both episodes in one sitting (~20–30 min of speech).
2. Build an **IVC** from your 3–5 cleanest minutes. Free, instant, no PVC slot.
3. Test the IVC on a line you already recorded — compare clone against real.
4. **Only if the IVC falls short**, invest in PVC: record another 30–45 minutes of
   neutral reading to clear the threshold, then spend the slot.

Most likely the IVC is enough, because you are not replacing yourself — you want a
patch tool for fixing one line without re-micing. For that job IVC is the right
instrument and PVC is overkill.

Spend the PVC slot only if you decide to make cloned-you a *primary* narrator.

## Hardware

You will make **two different recordings with the same setup, and they get treated
differently afterward.** A cloning source is *training data* — ElevenLabs wants it
raw, consistent, and unprocessed (see "What NOT to do" below). The Ep01 host track is
a *deliverable* — it gets processed once, at the end, on its way into the mix. Same
mic, same room, same session gets you both; the divergence happens after you stop
recording, not during.

Your gear, as it stands, is sufficient for both. Nothing here is a case for buying
anything else.

### HyperX QuadCast

A cardioid USB condenser with an internal shock mount and pop filter built in, a gain
dial on the body, and it's already recognised by macOS with no driver install. Close
miking it in cardioid gives narration and voiceover the tight, present, room-rejecting
sound that pattern is built for, and because it's USB there's no file-transfer step —
record straight into your DAW.

Its weakness is exactly what you'd expect from a condenser sharing a desk with a
laptop: it's sensitive, so it hears the room and the MacBook's fan along with you.
That's a room-and-technique problem more than a hardware one — see Choosing the room,
below.

### Zoom H2essential

The "essential" line's headline feature is **32-bit float** recording, which
effectively cannot clip — there is no gain-staging mistake that turns into a ruined
take, which matters because clipping is the one recording error you cannot fix in
post. That's a real safety net worth knowing you have.

Its built-in mics are an **XY stereo pair**, which is the right tool for capturing a
room's ambience or a two-person conversation in space, and the wrong tool for a
close-miked voice track you're going to collapse to mono anyway — you'd be carrying
stereo information you're about to throw away.

> Confidence note: the 32-bit float claim is vendor-line guidance to confirm in the
> device's own menu before you rely on it, not independently verified here.

### Recommendation: QuadCast, decided by a shootout

Record the same 60 seconds of real Ep01 host copy, same chair, same distance, on both
devices, and listen to both on headphones before deciding anything. That test, not
this document, is the actual authority — this guide's job is to tell you what to
listen for, not to substitute for listening.

Whichever device wins, use it for everything in a session. The existing "one room,
one mic, one distance, one session" rule (see Recording best practices, below)
outranks which device wins the shootout — consistency across your whole corpus
matters more than which mic is marginally better.

## Software and settings

**Record in Adobe Audition**, in Waveform view for a single voice track: real-time
metering, preroll, punch-in re-recording, and a direct WAV export with nothing lossy
in the path. **GarageBand** is a fine free fallback if Audition isn't handy.
**Voice Memos is not** — it's compressed (AAC), and it applies automatic level
control you cannot turn off, which is exactly the kind of processing a cloning
source cannot tolerate and a deliverable track doesn't want either.

### The one trap worth naming explicitly

**Adobe Podcast Enhance and Audition's Speech Enhancement effect must never touch
cloning source audio.** These are not filters — they're a generative reconstruction
of your voice, which means they change your timbre, and a clone trained on enhanced
audio learns the enhancer's version of you, not you. The existing "No processing"
rule already covers this in principle (see Recording best practices, below); it's
named here specifically because Enhance is the one thing you'll be tempted to reach
for on a rough take precisely because it exists and it sounds like it's helping.

For the Ep01 host **deliverable** track, using Enhance is a judgement call, not a
rule violation — but flag for yourself that an enhanced human voice sitting beside a
fully synthetic co-host (Jofra) can land in an uncanny middle ground where neither
sounds quite real. Listen for that before committing to it.

### Settings

- **48 kHz / 24-bit WAV, mono.** Never capture to MP3 — it's lossy and there's no
  reason to pay that cost at the capture stage.
- Peaks between **−12 and −6 dBFS**, never touching 0. Set this with the QuadCast's
  own gain dial, not in software — software gain after a hot input can't undo
  clipping that already happened at the analog-to-digital stage.
- Monitor through the **QuadCast's own headphone jack**, not your Mac's output.
  Zero latency, and it keeps whatever leaks out of your headphones from bleeding
  back into the take — which a Mac-routed monitor path can do.

### Sample rate — Audio MIDI Setup

A sample-rate mismatch between the input device and your Audition session resamples
your audio silently — no error, just a slightly wrong recording. Set it explicitly:

Applications → Utilities → **Audio MIDI Setup** → select **HyperX QuadCast** in the
device list → **Format** → set **48000 Hz**, matching whatever your Audition session
is set to.

## Choosing the room

You have three candidate spaces: an open living/dining room adjoining the kitchen
(where the gear currently lives), a medium bedroom, and a tiny bathroom.

### The bathroom is the trap — rule it out explicitly

Small feels like it should be quiet, but small *and hard* — tile, mirror, glass,
porcelain, and walls that run parallel to each other at close range — is what
produces flutter echo and a boxy resonance right in the vocal range. A clone trained
in a bathroom learns the bathroom, and you cannot subtract a room's sound from a
recording after the fact. This space is out.

### The living/dining room loses despite having the gear

It's large — long reverb tail, the most window area of the three spaces — has hard
dining-table surfaces, and it **adjoins the kitchen**, which puts the fridge
compressor inside your recording. You can switch off the AC and the fan for a
session; you cannot realistically switch off the fridge.

### The bedroom wins on soft mass

Bed, duvet, pillows, curtains, carpet, a closet full of clothes — soft, irregular
surfaces that absorb rather than reflect, and usually fewer windows than the
living/dining room. This is the space to record in.

### Placement inside the room matters as much as the room

Getting the room right doesn't help if you stand in the wrong spot inside it. Work
through this in order, and hold onto the reasoning rather than just the rule —
a half-remembered rule is exactly what produces a bad setup on the day:

1. **Soft mass in front of you, beyond the mic.** Your voice projects forward, so
   most of its acoustic energy travels past the capsule and into whatever's behind
   it. An open closet of hanging clothes is the best absorber available in an
   apartment; a duvet on a stand is a good second choice.
2. **Soft mass behind you as well.** The mic's front pickup lobe looks *past* you —
   it hears what's behind you too, so that needs to be the bed or the curtains, not
   a bare wall running parallel to your body.
3. **Noise off the mic's front axis.** Put the window, the AC, or the kitchen to the
   *side* of your setup, or behind the mic itself, where a cardioid pattern's null
   sits — **never directly behind you**, which is straight down the pickup lobe and
   exactly where the mic listens hardest.

**Steps 2 and 3 can conflict**, and when they do, step 1's absorption wins: get the
soft mass in front of your mouth right first, then rotate the whole setup — you, the
mic, and the furniture arrangement together — to get the remaining noise source
off-axis. "Point the mic's back at the hard surface" is only correct when that hard
surface *is* the noise source you're rejecting; it is not a standalone rule to apply
on its own, and printed alone it produces a setup that solves the wrong problem.

### Plan view — looking down

```text
PLAN VIEW — looking down

    ▓▓▓▓▓▓▓▓▓▓  SOFT MASS IN FRONT  ▓▓▓▓▓▓▓▓▓▓
    ▓  open closet of hanging clothes, or a  ▓
    ▓  duvet on a stand. Most of your vocal  ▓
    ▓  energy lands here, not in the mic.    ▓
    ▓                                        ▓
    ▓                 [ MIC ]                ▓
    ▓                    |   front faces you ▓
    ▓                    |                   ▓
    ▓                    |  15-20 cm         ▓
    ▓                    |  (one hand span)  ▓
    ▓                    |                   ▓
    ▓                   ( O )  you           ▓
    ▓                                        ▓
    ▓▓▓▓▓▓▓▓▓  SOFT MASS BEHIND YOU  ▓▓▓▓▓▓▓▓▓
       bed / curtains — the mic looks past
       you at this wall, so it is heard too

    window . AC . kitchen  ->  to the SIDE,
    or behind the mic. NEVER behind you.
```

### Side view — height and angle

```text
SIDE VIEW — height and angle

         [ MIC ]   capsule at mouth height, or
            \      2-5 cm above it, tilted down
             \     about 15 degrees
              \
               \   15-20 cm
                \
               ( O )   speak just PAST the capsule,
                       15-30 degrees off its axis:
                       plosives pass by instead of
                       hitting it head-on

    floor:   X   tape-mark the spot, note the
                 height, photograph the setup
```

Both diagrams use the existing guide's "a hand span" for distance. The floor mark in
the side view exists because the one-room-one-distance rule (see Recording best
practices, below) has to survive past the first session — mark it once, and every
later session can return to the exact same spot.

**Rendering check (this PR):** confirmed on GitHub's rendered PR/file view, not just
in the local editor — both boxes hold their right edges in a monospace font and the
`[ MIC ]` / `( O )` alignment reads cleanly at the default code-block width. See the
PR body for the pasted screenshot/confirmation.

### Deciding it — a test, not this document

A single hard clap in each candidate room, listening for ring and flutter. Then the
same 30 seconds of real host copy in each candidate spot within the winning room, on
headphones, listening specifically to the tail after you stop speaking.

**Reversal condition, stated honestly:** furnishing beats floor plan. A
hard-floored, bare-walled bedroom against a heavily furnished living room flips this
recommendation outright — the clap test is what settles which case your apartment
actually is, not the room labels above.

**Reproducibility:** mark the spot, note the mic height and distance, and photograph
the setup. A room that doesn't match session to session produces an unstable clone,
and — same as the floor mark — this rule outlives the first session.

## Session hygiene on macOS

- The QuadCast shows up under **Output** because it has a built-in headphone jack;
  your recording source is selected under **Input**. Don't confuse the two when
  setting up Audition or GarageBand.
- **System Settings → Sound → Sound Effects:** turn off "Play sound on startup" and
  "Play user interface sound effects." An alert landing mid-sentence is a retake, not
  a minor annoyance.
- Do Not Disturb on. Phone in **another room** — not merely silenced, since a vibrate
  against a hard surface is still audible on a sensitive condenser. AC and fan off.
  Record when the street outside is quietest.

## Recording best practices

The clone learns your **performance**, not just your timbre. This is the mistake
that wastes a PVC slot: people read training data flatly, then wonder why the clone
sounds bored.

**Perform the training audio the way you want the show to sound.** For "Told
Straight" that means the register you'd use hosting — engaged, dry, conversational.

### Setup

- One room, one mic, one distance, one session. Consistency beats quantity.
- Quiet space. No HVAC, no traffic, no fridge hum, no room reverb.
- Fixed mic distance — a hand span, and don't drift. Use a pop filter or angle
  slightly off-axis.
- 44.1 kHz or better. WAV preferred; high-bitrate MP3 acceptable.

### Content

- Diverse text for broad phoneme coverage — don't read the same paragraph repeatedly.
- Your own episode scripts are ideal training material: they're exactly the register,
  vocabulary, and rhythm the clone needs to reproduce.
- Trim long silences before upload. Dead air teaches nothing and dilutes the sample.

### What NOT to do

- **No processing.** No compression, EQ, noise reduction, de-essing, reverb, or
  normalisation. ElevenLabs wants raw. Cleanup bakes artifacts into the clone. This
  includes Adobe Podcast Enhance / Audition Speech Enhancement — see Software and
  settings, above.
- No background music. No second speaker anywhere in the audio.
- Don't splice wildly different sessions together — mismatched tone or room sound
  produces an unstable clone.
- Don't submit more mediocre audio to hit a threshold. 30 pristine minutes beats
  3 mediocre hours.

## Practical checklist

```text
[ ] Quiet room booked (bedroom), phone silenced and in another room
[ ] System sound effects off, Do Not Disturb on, AC/fan off
[ ] Mic position set and marked so it survives a break
[ ] Sample rate matched: Audio MIDI Setup -> QuadCast -> 48000 Hz
[ ] Test render: 30 seconds, played back on QuadCast headphone jack, checked for hum/hiss
[ ] Record Ep01 host lines (27)          -> narration/H01..H27
[ ] Record Ep02 host lines (~20)         -> narration/H01..H20
[ ] Record 5 min of neutral reading      -> cloning corpus
[ ] Pick the 3-5 cleanest minutes, trim silences, no processing, no Enhance
[ ] Create IVC, name it clearly (e.g. "Jared - host v1")
[ ] A/B the clone against a real take of the same line
[ ] Decide: IVC sufficient, or escalate to PVC?
```

## Where this interacts with the pipeline

The host in `episodes/ToldStraight-Ep01`'s 54-stem v2 render is a **named
placeholder**, not a stand-in nobody tracked: `episodes/cast.json` marks the `host`
role `"interim": true`, with `"replaced_by": "the maintainer's own narration (#44)"`.
The 27 HOST-role stems live in `output/episodes/ToldStraight-Ep01-v2/stems/`
alongside the 27 EXPERT-role (co-host, "Owen") stems Jofra reads; `assemble_master()`
in `pipeline/core/episode.py` concatenates whichever stems are on disk into the
master, which is what makes both replacement routes below possible without touching
Jofra's half of the episode at all.

There are **two distinct ways to retire the placeholder**, and they differ in cost by
a factor that matters. Both are legitimate; this guide states the tradeoff and does
not pick for you.

1. **Narrate directly.** You record the 27 host lines yourself (this guide, above)
   and the files replace the 27 placeholder stems in the stems directory 1:1; the
   episode gets re-assembled from stems. **Zero credits.** This is the most authentic
   option. The cost is ongoing: every script change means re-recording that line.
2. **Clone, then synthesize.** Build an IVC (or spend the PVC slot) from your own
   voice, then re-render the 27 HOST turns through `pipeline/core/episode.py`'s
   per-turn render path. `episode.py`'s `estimate()` reports this at **~1,163
   credits** — measured against the account's 0.55x effective rate — because it's
   exactly the 27-turn host share of the original 5,076-credit Ep01 render (#43).
   Script changes are free after that first render.

Whichever route you pick, only the host stems change — `assemble_master()` works
from stems alone, so neither route touches or re-renders a single one of Jofra's 27
co-host turns.
