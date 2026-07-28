# ADR 0002 — ElevenLabs bills at 0.55× the advertised rate

- **Number:** 0002
- **Title:** ElevenLabs bills at 0.55× the advertised rate
- **Status:** accepted
- **Date:** Not recorded in the source entry.
- **Source:** `ROADMAP.md` § "Decisions and what they constrain" (entry migrated by #62);
  measured evidence in `docs/elevenlabs.md` § "Rates — advertised vs actual".

## Context

`/v1/models` reports a `character_cost_multiplier` this account does not pay. Measured,
not documented: everything bills at 0.55× the listed rate. The real ceiling is ~237k
characters/month of production audio, not the 130,552 credit figure.

## Decision

Every budget in this repository uses the measured 0.55× number, not the advertised rate.

## Consequences

**Constrains M2/M3/M4:** budgets roughly halve. A full rebuild — casting, three draft
passes, two masters — lands near 38,000 credits.

Re-verify any time with `uv run voicelab rates` (from `pipeline/`); if it diverges,
update `ACCOUNT_RATE_FACTOR` in `pipeline/core/models.py` — see `docs/elevenlabs.md`.
*Migration note:* the `ROADMAP.md` entry said `uv run audition --check-rates`, a command
that has errored since #29 archived the v1 tool — a staleness already on record as an
owed fix (#30, CHANGELOG 2026-07-27). Migrating the falsehood verbatim would have
created a fifth instance of the tracked-file-asserts-the-false class, so the working
command is written here instead, and the correction is disclosed in this note and in
the #62 PR body.

## Reversal condition

Not recorded at decision time.
