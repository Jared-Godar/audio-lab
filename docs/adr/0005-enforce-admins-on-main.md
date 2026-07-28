# ADR 0005 — `enforce_admins: true` on `main`

- **Number:** 0005
- **Title:** `enforce_admins: true` on `main`
- **Status:** accepted
- **Date:** Not recorded in the source entry.
- **Source:** `ROADMAP.md` § "Decisions and what they constrain" (entry migrated by #62).

## Context

Branch protection on `main` runs with `enforce_admins: true`.

## Decision

Direct commits are blocked for everyone, Jared included. Deliberate: the gate exists
precisely so nobody bypasses it.

## Consequences

**Constrains everything:** if CI breaks, nothing merges until protection is relaxed in
Settings → Branches. Deliberate, but know the escape hatch exists. The surface this can
jam shut widened from 4 required checks to 8 while #31 sat undecided — see ADR 0006.

## Reversal condition

Not recorded at decision time.
