# Spec: Promote and extend the voice-capture guide (Issue #44)

**Closes:** #44 · **Labels:** `type: docs`, `area: voices`, `priority: medium` (verified in
`.github/labels.json`) · **Milestone:** M4 — Episodes v2 · **Assignee:** `Jared-Godar`
**Sizing:** `sonnet` / `high` — documentation plus live read-only verification. No spend,
nothing irreversible.

---

## 0. FIRST ACTION — read the durable contracts

`AGENTS.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, memory files under
`~/.claude/projects/-Users-jaredgodar-Code-audio-lab/memory/`, `CHANGELOG.md` § Findings,
`docs/elevenlabs.md`.

**A durable contract outranks this spec.** Conflict → stop and report.
**This spec is immutable after handoff.** Wrong or ambiguous → stop and report.

## 0.1 THE THINGS YOU MUST NOT DO

- **Do not clone any voice.** No Instant clone, no Professional clone, no uploads.
- **Do not touch the Professional Voice Clone slot** — 0 of 1 used, effectively
  irreversible, gated on the maintainer at the time of the action (`AGENTS.md` § "Hold for
  the maintainer").
- **Do not spend credits.** This task is documentation and free read-only GETs. The ledger
  must be identical before and after.
- **Do not put a secret in a tracked file.** The repo is **public**. No API key, no token.
- **Do not delete `artifacts/voice-cloning-guide.md`** before the tracked version merges.
- **Do not rewrite guidance that is already correct.** This is promotion, verification and
  extension — not a rewrite. Preserve the existing voice and structure.
- **Do not merge.** Open the PR, verify, stop.

## 1. Intended outcome

`docs/voice-capture.md` — tracked, verified against the live account, and extended with the
three things the existing guide lacks: **which hardware**, **which software**, and **which
room**. It has to be usable on a phone, in a bedroom, next to a microphone. That is the
whole reason it cannot stay gitignored.

## 2. Current state — measured 2026-07-27

```
$ ls -l artifacts/voice-cloning-guide.md
-rw-r--r--  6100 Jul 26 12:22

$ git check-ignore -q artifacts/voice-cloning-guide.md && echo GITIGNORED
GITIGNORED

$ GET /v1/user/subscription
professional_voice_slots_used = 0 / 1     voice_slots_used = 0 / 30
can_use_professional_voice_cloning = True
credits: 7,511 used / 123,041 remaining of 130,552
```

Existing sections: short version · account limits · two routes (IVC/PVC) · recommended
route · recording best practices (setup / content / what NOT to do) · practical checklist ·
where this interacts with the pipeline.

The technique guidance is **good and stays**. It names no hardware, no software, and no
room.

## 3. Decisions already made — implement, do not re-open

- **§4A option 1 — `docs/voice-capture.md`.** `docs/` already holds the durable
  external-service reference and is reachable from a phone via GitHub.
- **The maintainer's gear is fixed:** HyperX QuadCast (USB condenser, on his desk with the
  MacBook), Zoom H2essential (field recorder), macOS native apps, Adobe Creative Suite.
- **His spaces are fixed:** an open living/dining room adjoining the kitchen (where the
  gear currently is), a medium bedroom, a tiny bathroom. Controllable AC/fan, limited
  street noise.

## 4. Scope and deliverables

**A. Promote.** `git mv artifacts/voice-cloning-guide.md docs/voice-capture.md`. Preserve
content; edit only per B–G. Verify with `git check-ignore` that it is now tracked.

**B. Verify every account claim against the live API and paste the receipts.** Slot counts,
PVC limit, instant-clone limits, credit balance, max output format. The guide's existing
"Confidence note" pattern is correct and must be preserved: measured facts stated as
measured, ElevenLabs' published minute/turnaround thresholds stated as **unverified
vendor guidance** with the upload UI named as the authority at submission time. Anything
you cannot verify gets marked unverified **in the text**.

**C. New section — Hardware.** Content, to be written up properly rather than pasted:

- **Two different recordings, different rules.** Cloning source is *training data* — raw,
  consistent, unprocessed. The Ep01 host track is a *deliverable* — processed once, at the
  end. Same mic, same room, same session; different treatment afterward.
- **QuadCast:** cardioid condenser, internal shock mount and pop filter, gain dial on the
  body, already recognised by macOS. Close-miked mono cardioid is the right pattern for
  narration and there is no file-transfer step. Weakness: a condenser on the same desk as a
  laptop hears the room and the fan.
- **H2essential:** the "essential" line's headline feature is **32-bit float**, which
  effectively cannot clip — a real safety net, since clipping is the one unrecoverable
  recording mistake. Its built-in mics are an **XY stereo pair**, better for a room than
  for a close voice track that will be collapsed to mono. **State the 32-bit float claim as
  vendor-line guidance to confirm in the device menu, not as verified fact.**
- **Recommendation: QuadCast, decided by a shootout, not by assertion.** Same 60 seconds of
  real Ep01 host copy, same chair, same distance, both devices, listened to on headphones.
  Then use the winner for everything — the existing "one room, one mic, one distance, one
  session" rule outranks which device wins.

**D. New section — Software and settings.**

- Record in **Adobe Audition** (Waveform view for a single voice): real metering, preroll,
  punch-in, direct WAV export. **GarageBand** is a fine free fallback. **Voice Memos is
  not** — compressed, with automatic level control that cannot be defeated.
- **Name the specific trap: Adobe Podcast Enhance / Audition Speech Enhancement must not
  touch cloning source.** It is a generative reconstruction, not a filter — it changes
  timbre, and the clone would learn the enhancer. The existing "No processing" rule covers
  this in principle; naming the feature matters because it is the one thing a user reaches
  for precisely because it is there and sounds helpful. For the narration deliverable it is
  a judgement call — flag that enhanced human voice beside a synthetic co-host can land
  uncanny.
- Settings: **48 kHz / 24-bit WAV, mono**; never capture to MP3. Peaks **−12 to −6 dBFS**,
  never touching 0, set with the mic's gain dial rather than in software. Monitor through
  the **QuadCast's own headphone jack** — zero latency, and it keeps monitor bleed out of
  the take.
- **Click path, not a deep link** (`AGENTS.md` § "Directing the maintainer through a GUI"):
  Applications → Utilities → **Audio MIDI Setup** → select **HyperX QuadCast** → **Format**
  → 48000 Hz, matched to the Audition session. A sample-rate mismatch resamples silently.

**E. New section — Choosing the room.**

- **The bathroom is the trap and must be ruled out explicitly.** Small feels dead; small
  plus *hard* — tile, mirror, glass, porcelain, parallel walls — produces flutter echo and a
  boxy resonance in the vocal range. A clone trained there learns the bathroom.
- **The open living/dining room loses despite the gear being there:** large volume and a
  long tail, most window area, hard dining surfaces, and it **adjoins the kitchen**, so the
  fridge compressor is in the room. The AC and fan can be switched off; the fridge realistically
  cannot.
- **The bedroom wins on soft mass** — bed, duvet, pillows, curtains, carpet, a closet of
  clothes — and usually fewer windows.
- **Placement inside the room matters as much as the room.** Not in the middle, never facing
  a bare parallel wall. Get the geometry right in this order, and **state the reasoning, not
  just the rule**, because a half-remembered rule is what produces a bad setup:
  1. **Soft mass in front of you, beyond the mic.** Your voice projects forward and most of
     its energy goes past the capsule into whatever is there. An open closet of hanging
     clothes is the best absorber in the apartment; a duvet on a stand is second.
  2. **Soft mass behind you as well.** The mic's front lobe looks past you at that wall, so
     it is in the pickup pattern — the bed or curtains, not a bare parallel wall.
  3. **Noise off the mic's front axis.** Window, AC, kitchen to the *side* of the setup, or
     behind the mic where the cardioid null sits — **never directly behind you**, which is
     straight down the pickup lobe.
  - **Say plainly that 2 and 3 can conflict**, and which wins: absorption in front of the
    mouth first, then rotate the whole setup to get the noise off-axis. "Point the mic's
    back at the hard surface" is only correct when the hard surface *is* the noise source;
    do not print it as a standalone rule.

**E-bis. Two diagrams, as monospace ASCII inside fenced code blocks.** Not Mermaid (it draws
graphs, not spatial layouts) and not a committed image (no image-authoring workflow here, and
a binary asset is neither diffable nor editable by the person holding the phone). Fenced
ASCII renders identically on GitHub, in a terminal, and on a phone. Reproduce these
essentially as-is — refine spacing if it renders badly, but do not redesign the content:

````text
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
````

````text
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
````

Caption both: the distance is the existing guide's "a hand span", and the floor mark exists
because the one-room-one-distance rule outlives the first session.
- **Decide it with a test, not with this document:** a single hard clap in each room,
  listening for ring; then the same 30 seconds of real copy in each candidate spot, on
  headphones, listening to the tail after speech stops.
- **State the reversal condition honestly:** furnishing beats floor plan. A hard-floored,
  bare-walled bedroom against a heavily furnished living room flips the recommendation, and
  the clap test settles which case this apartment is.
- **Reproducibility:** mark the spot, note mic height and distance, photograph the setup. A
  mismatched room across sessions produces an unstable clone, and this rule outlives the
  first session.

**F. New section — Session hygiene on macOS.**

- The QuadCast appears under **Output** because it has a headphone jack; the recording
  source is set under **Input**.
- **System Settings → Sound → Sound Effects:** turn off "Play sound on startup" and "Play
  user interface sound effects". An alert mid-sentence is a retake.
- Do Not Disturb on. Phone in **another room**, not merely silenced — a vibrate on a hard
  surface is audible. AC and fan off. Record when the street is quietest.

**G. Rewrite "Where this interacts with the pipeline" against the code as it exists today.**
The section predates #6/#7 and all of #43. It must now describe the real path and, most
importantly, **the two distinct routes to replacing the placeholder host — which differ in
cost by a factor that matters:**

1. **Narrate directly.** Jared's own recordings replace the 27 host stems in
   `output/episodes/ToldStraight-Ep01-v2/stems/`, and the episode is re-assembled. **Zero
   credits.** Most authentic. Cost: every script change means re-recording that line.
2. **Clone, then synthesize.** An IVC (or PVC) of his voice renders the 27 host turns —
   **~1,163 credits** at the measured 0.55× rate. Script changes are free thereafter.

Both are legitimate and the choice is the maintainer's; present the tradeoff, do not pick.
Name the concrete artefacts: `episodes/cast.json` (the `host` role is marked **interim**),
`pipeline/core/episode.py`, the stems directory, and the fact that assembly runs from stems
alone so neither route re-renders Jofra.

**H. Reduce the `artifacts/` copy to a one-line pointer** at `docs/voice-capture.md` — only
after the tracked version exists in the same PR.

## 5. Acceptance criteria

- [ ] `docs/voice-capture.md` exists and is tracked — `git check-ignore -v` returns
      non-zero, pasted
- [ ] Live API receipts pasted for every account claim, **including
      `professional_voice_slots_used`**
- [ ] Unverifiable claims marked as unverified **in the guide text**, vendor guidance
      distinguished from measured fact
- [ ] Hardware, Software/settings, Room, and Session-hygiene sections present per §4.C–F
- [ ] **Both ASCII diagrams present** (plan view and side view) inside fenced `text` blocks,
      captioned — and **checked as rendered**, not just as source: paste the rendered
      GitHub view or state how the alignment was confirmed. A diagram that only lines up in
      the editor is worse than none, because it is consulted on a phone.
- [ ] The placement guidance gives the three-step reasoning and says explicitly that
      absorption-in-front wins when it conflicts with noise-rejection — the standalone
      "point the mic's back at the hard surface" rule must **not** appear unqualified
- [ ] The Adobe Enhance warning names the feature explicitly
- [ ] The pipeline section describes **both** host-replacement routes with their costs
      (zero credits vs ~1,163) and does not pick one
- [ ] The guide states plainly that the PVC slot is maintainer-gated and effectively
      irreversible
- [ ] **No secret in the tracked file** — state explicitly what was omitted; repo is public
- [ ] `artifacts/voice-cloning-guide.md` reduced to a pointer, not deleted outright
- [ ] Ledger identical before and after — **zero credits spent**, stated with both readings
- [ ] `pre-commit run --all-files` green, CI green
- [ ] Spec copied verbatim to `prompts/20260727-issue-44-voice-capture-guide.md`
- [ ] PR: `Closes #44`, assignee `Jared-Godar`, the three labels, milestone M4 — verified by
      `gh pr view --json` read-back
- [ ] Continuity walkthrough after branching, refreshed at PR-open, **no `⟨slot⟩` unfilled**
- [ ] Deliberate omissions named in the PR body

## 6. Non-goals

- Cloning anything; spending the PVC slot; recording anything.
- Recommending a purchase — the maintainer's existing gear is sufficient and the guide
  should say so rather than upselling.
- Rewriting the existing technique guidance that is already correct.
- Changing `.gitignore`'s treatment of `artifacts/` generally — handoffs and walkthroughs
  are correctly ignored.
- Ep02, the tuning app (#11), or re-opening casting.

## 7. Risk

**Low to do, moderate to skip.** The failure mode is a recording session run on remembered
or stale advice, discovered after the one-shot PVC slot is spent. The second-order risk is a
guide that *sounds* authoritative on unverified vendor numbers — hence the requirement to
distinguish measured from published throughout.

## 8. References

- **#44** — the issue, including §4A
- `artifacts/voice-cloning-guide.md` — the existing guide being promoted
- `docs/elevenlabs.md` — the shape for a tracked "what is true now" reference
- `episodes/cast.json`, `pipeline/core/episode.py`,
  `output/episodes/ToldStraight-Ep01-v2/stems/` (#43, PR #45)
- `AGENTS.md` § "Hold for the maintainer" (PVC slot) · § "Directing the maintainer through
  a GUI" · § "Calibrated claims" · § "Definition of done"
- Hardware/room content originates from the maintainer's own inventory and apartment,
  supplied 2026-07-27; the recommendations are the PM thread's and every one carries a test
  the maintainer can run to overturn it.
