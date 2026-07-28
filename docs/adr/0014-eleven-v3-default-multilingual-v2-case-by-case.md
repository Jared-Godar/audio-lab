# ADR 0014 — `eleven_v3` is the default model; `multilingual_v2` stays available case-by-case

- **Number:** 0014
- **Title:** `eleven_v3` is the default synthesis model; `eleven_multilingual_v2` is
  **not retired** and stays available for case-by-case calls
- **Status:** accepted
- **Date:** 2026-07-28
- **Source:** maintainer decision, recorded in issue #62's executor spec
  (`artifacts/specs/20260728-issue-62-docs-surface-adrs-and-runbook.md` §2.5, mirrored
  at `prompts/`); cross-references #10, where #62 §2 Gap 2 first listed the choice.

## Context

The repository held a live contradiction in four places: #62 §2 Gap 2 listed
"`eleven_v3` chosen over `multilingual_v2`" as a decided thing (#10), while
`ROADMAP.md` § "Open decisions" listed the same bake-off as **open and blocking M3's
entire architecture**, and both the M3 milestone description and two `ROADMAP.md`
milestone lines repeated the "blocked" claim. The PM thread raised the contradiction on
2026-07-28 and the maintainer resolved it the same day.

## Decision

The maintainer's two statements, verbatim (maintainer, in session, 2026-07-28):

> "I made the _v3 over multi_v2 call personally, so you can document that as real, not
> assumed and resolve contradictory statements"

and:

> "Although I am theoretically open to using both models for case by case calls if
> necessary - however you want to log and document that"

Both halves are load-bearing:

1. **`eleven_v3` is the default model.** The call was made personally by the
   maintainer; it is real, not assumed.
2. **`eleven_multilingual_v2` is NOT retired.** This is a **default with a documented
   exception path**, never an exclusive choice. Any line or episode may be rendered on
   `multilingual_v2` case-by-case. A reader must not come away believing
   `multilingual_v2` was retired — a future session reading "v3 was chosen" and
   deleting the `multilingual_v2` code path would be acting on a half-quotation.

## Consequences

**Constrains M3 — and unblocks it.** M3's architecture was waiting on this call, and it
is now settled: `eleven_v3` accepts `style` and `speaker_boost` with HTTP 200 and
silently discards them, and is expressive via inline audio tags instead — so the tuning
app is a **markup editor with live preview, not a mixing board**. The existing
`transcript-markup.txt` legend is already markup-shaped.

**M3's design must not foreclose `multilingual_v2`.** The markup editor must not make
it impossible to render a given line or episode on `multilingual_v2` under the
exception path — the pre-rendered parameter-grid cost model (~3,400 credits for a 5×5
grid over two dials, `ROADMAP.md` § M3) is the price that applies *if* a
`multilingual_v2` slider path is ever taken, not dead text.

Cost is not a factor between the two models: both bill at the same effective 0.55×
rate (ADR 0002).

## Reversal condition

Not recorded at decision time — the maintainer stated an ongoing exception path rather
than a reversal trigger.
