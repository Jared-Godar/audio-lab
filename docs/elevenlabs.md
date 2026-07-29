# ElevenLabs — operating notes

Current-state reference for the Creator plan. The CHANGELOG records *when* these
were learned; this is what's true now. Verified 2026-07-26.

## Account shape

| | |
| --- | --- |
| Tier | Creator |
| Monthly credits | 130,552 (cycle resets 2026-08-26) |
| Effective capacity | **~237k characters** of production audio — see rates below |
| Voice slots | 30 total |
| **Professional clones** | **1** — the binding constraint |
| Instant clones | unlimited within the 30 slots |
| Max output | 192 kbps (`mp3_44100_192`) |

The single PVC slot is the thing to plan around. Instant cloning needs only a few
minutes of audio and costs no PVC slot, which makes it the right tool for voice
patches; save the professional slot for something that genuinely warrants it.

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

## Rates — advertised vs actual

`/v1/models` reports a `character_cost_multiplier` that this account does **not**
pay. Everything bills at **0.55x the listed rate**.

| Model | Listed | Effective | Max chars | Notes |
| --- | --- | --- | --- | --- |
| `eleven_v3` | 1.0x | **0.55x** | 5,000 | Most expressive; audio tags, no `style` param |
| `eleven_multilingual_v2` | 1.0x | **0.55x** | 10,000 | Voiceover workhorse; supports `style` + `speaker_boost` |
| `eleven_turbo_v2_5` | 0.5x | **0.28x** | 40,000 | Best quality per credit; the draft model |
| `eleven_flash_v2` | 0.5x | **0.28x** | 30,000 | Only wins on realtime latency — irrelevant for batch |
| `eleven_english_sts_v2` | 1.0x | 0.55x | 5,000 | Speech-to-speech, not TTS |

Evidence: seven Turbo generations predating the Creator upgrade billed at 0.504x;
two after it billed at 0.275x — same model, same endpoint. The discount is uniform.

Re-verify any time with `uv run voicelab rates` (from `pipeline/`). If it diverges
from the table, update `ACCOUNT_RATE_FACTOR` in `pipeline/core/models.py`.

## Measuring spend

- `/v1/user/subscription` — **lags by tens of seconds.** Fine for "how much is
  left"; useless for attributing cost to a specific call. Back-to-back requests
  get their deltas misattributed to each other.
- `/v1/history` — authoritative per generation, via
  `character_count_change_to - character_count_change_from`. Note `eleven_v3`
  does not log its text, so its rate must be derived from known input length.
  It *does* log the `character_count_change` delta, so batch spend is still
  measurable. **The newest generation has a brief indexing lag here too** — an
  18-render batch showed 17 rows immediately after, all 18 seconds later
  (#38). Reconcile a beat after the last call, and diff the row **set** rather
  than trusting an immediate count.

## Tiers

| Tier | Model | Output | For |
| --- | --- | --- | --- |
| `draft` | Turbo v2.5 | 128 kbps | Read-throughs, timing, does-this-line-land |
| `cast` | Multilingual v2 | 192 kbps | Auditions — **deliberately production quality** |
| `production` | Multilingual v2 | 192 kbps | Final master |

Auditions do not run cheap on purpose. The model changes a voice's timbre and
expressiveness, so casting on draft output means judging a voice you'll never
ship. A full casting pass is ~8k characters; rendering it cheap saves ~2.2k
credits and corrupts the most consequential creative decision in the project.

v3 and Multilingual v2 cost the same, so the production choice is free to get
right — A/B with `--model v3` and let your ear decide.

## Budget math

Roughly 1 credit per 1.8 characters at production quality. For the two "Told
Straight" episodes (~17k characters of guest track if the host is recorded live):

| Pass | Cost |
| --- | --- |
| Casting audition (~40 voices) | ~4,400 |
| One draft pass, both episodes | ~4,800 |
| One production master, both episodes | ~9,400 |

A realistic full rebuild — casting, three draft passes, two masters — lands near
**38,000 of 130,552**.

## Gotchas

- Per-request character caps differ sharply by model (5k for v3 vs 40k for Turbo).
  Chapter-level chunking keeps everything inside the smallest cap.
- Retrying a synthesis can re-bill. The client caps synthesis at 2 attempts and
  fails fast on permanent errors; don't raise that without a reason.
- The sample cache keys on text **and** model **and** bitrate. Anything that adds a
  render parameter must extend the key or samples will collide across tiers.
