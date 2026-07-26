# audio-lab

Personal audio tooling: TTS voice auditioning, podcast generation via the Save to
Spotify CLI, and Spotify listening-data analysis.

## Setup (do this first in a fresh clone)

```fish
uvx --from pre-commit==4.6.0 pre-commit install
```

**Required, and easy to miss.** `.pre-commit-config.yaml` being tracked does *not*
install anything — without this command every local hook is inert, including
`gitleaks`, `detect-private-key`, and the `no-commit-to-branch` guard on `main`.
CI still runs them, but only after a secret has already entered local history.

Verify it took, in both directions:

```fish
test -f .git/hooks/pre-commit; and echo installed; or echo MISSING
git switch main; and git commit --allow-empty -m "should be blocked"   # must refuse
```

The second command should fail with `don't commit to branch ... Failed`. A hook that
is installed but not proven to block is a hook you have not tested.

`ELEVENLABS_API_KEY` is read from the environment — never a file, never in code.

## Structure

- `pipeline/` — uv-managed Python project; the `audition` CLI and spotipy analysis
- `fish/` — shell functions, symlinked into fish config
- `episodes/` — "Told Straight" deliverables (transcripts, notes, art)
- `scripts/` — one-off automation
- `prompts/` — episode templates and agent instructions
- `docs/` — notes and findings, incl. [ElevenLabs operating notes](docs/elevenlabs.md)

## Auditioning voices

```fish
cd pipeline
uv run audition                       # all engines, full audition
uv run audition --engines elevenlabs  # one engine
uv run audition --locale en-GB        # narrow the voice list
uv run audition --shortlist           # replay passed voices head-to-head
uv run audition --cast                # assign host/guest/ancillary roles
```

Results persist to `output/auditions/voices.json`; rendered samples are cached
under `output/auditions/samples/` so re-listening never costs credits twice.

### Cost control (ElevenLabs)

Renders are pinned to a tier so day-to-day iteration stays cheap and only the
master pays full freight.

```fish
uv run audition --tier draft          # ~half price, 128 kbps — read-throughs
uv run audition --tier production     # 192 kbps master
uv run audition --model v3            # override the tier's model, same cost
uv run audition --list-models         # rates and tiers
uv run audition --check-rates         # re-derive real billing from history
```

Auditions default to the `cast` tier, which renders at *production* quality on
purpose — the model affects how a voice sounds, so casting on draft output means
judging a voice you'll never ship. See [docs/elevenlabs.md](docs/elevenlabs.md)
for rates, budget math, and account constraints.

`ELEVENLABS_API_KEY` is read from the environment. Never commit it.

## Stack

save-to-spotify CLI · ElevenLabs · edge-tts · Kokoro (local) · ffmpeg · uv · fish
