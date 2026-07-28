# ADR 0003 — Library voices work without being added to the account

- **Number:** 0003
- **Title:** Library voices work without being added to the account
- **Status:** accepted
- **Date:** Not recorded in the source entry.
- **Source:** `ROADMAP.md` § "Decisions and what they constrain" (entry migrated by #62);
  extended by the CHANGELOG § Findings entry of 2026-07-27 (#40) confirming synthesis
  consumes no slot.

## Context

Confirmed by synthesizing with a voice whose `is_added_by_user` was false. Every
library voice also ships a **free** `preview_url`.

## Decision

Casting screens against the shared library directly — voices are not added to the
account to be auditioned or rendered.

## Consequences

**Constrains M2:** the 30-slot voice cap and 95 add/edit budget are *not* limits on
auditioning. Round I screening is free and unbounded — filter, page, play previews,
spend nothing until the shortlist reads real script lines.

Extended 2026-07-27 (#40): *synthesizing* against a shared-library voice also consumes
neither a general voice slot nor the single Professional Voice Clone slot — measured
with Jofra at `category='professional'`, `voice_slots_used = 0/30`,
`professional_voice_slots_used = 0/1` after three completed renders.

## Reversal condition

Not recorded at decision time.
