# ADR 0006 — Branch protection stays as-is — audio-lab is deliberately stricter (#31)

- **Number:** 0006
- **Title:** Branch protection stays as-is — audio-lab is deliberately stricter than the
  rest of the portfolio
- **Status:** accepted
- **Date:** 2026-07-27 (maintainer, #31 §4 option 1)
- **Source:** `AGENTS.md` § "Recorded divergences from the reference repositories" —
  **authoritative**; this ADR is a pointer, not a copy.

## Decision — summary only, the full record lives in `AGENTS.md`

audio-lab keeps the strictest branch protection of the four portfolio repositories —
8 required checks, `enforce_admins: true`, `required_linear_history: true`,
`strict: true` — because it is the only **public** repository of the four, and the
strictest settings belong on the most exposed one. The four-repo comparison table, the
full reasoning, the #30-widened-#31 finding, and the verbatim reversal condition all
live in `AGENTS.md` § "Recorded divergences from the reference repositories", which is
authoritative. Two copies of that record would drift, and drift between tracked
descriptions and live state is the exact failure class #30/#31/#68 recorded.

## Consequences

**Constrains everything downstream of this repo's merge workflow** — see ADR 0005 for
the lockout risk, now backed by 8 required checks instead of 4.

## Reversal condition

Recorded verbatim in `AGENTS.md` § "Recorded divergences from the reference
repositories" — read it there; it turns on measured rebase friction, not on the
settings feeling heavy.
