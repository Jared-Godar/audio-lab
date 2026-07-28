# ADR 0015 — The wordmark system is a dual lockup, not a single primary

- **Number:** 0015
- **Title:** The wordmark system is a dual lockup, not a single primary
- **Status:** accepted
- **Date:** 2026-07-28
- **Source:** issue #60, comments "Wordmark system DECIDED, 2026-07-28 — dual lockup, stamp as
  device, TS-boxed mark, authority satellite" and "Locked wordmark system APPROVED, 2026-07-28 —
  default satellite variant A"

## Context

Issue #60's re-scope required one consistent visual system for `TOLD STRAIGHT` across every
surface — episode art, README, social cards, the eventual site — rather than a single fixed
lockup applied everywhere regardless of aspect ratio. The maintainer judged live renders in
Illustrator across two builder runs (the options builder, then the locked builder), with all
three pinned faces at intended weight and zero compromises, so the comparisons were valid. Two
render defects were found and fixed during the loop: stamp type at 220pt overhanging its 1,180pt
box by ~45pt/side (fixed at 175pt), and the M2 red band drawing over the TS letters because
`layers.add()` creates top-of-stack and creation order left rules above type (fixed with an
explicit `BRINGTOFRONT`).

## Decision

**Dual lockup, not a single primary.** The maintainer's words:

> "Use the oneline for headers, readme, other formats where that width is appropriate; use the
> stacked one or minor aspect ratio tweaks of it for the social preview and anything else that
> the more square format lends it to, agree the stamp can be used as a device"

- **Horizontal lockup**: `TOLD STRAIGHT` one line, red rule under the measure, authority line —
  site header, README banner, OG/social cards, any wide surface.
- **Stacked lockup**: `TOLD / STRAIGHT`, red rule, authority line — square-leaning surfaces;
  minor aspect-ratio tweaks permitted per surface.
- The rubber stamp survives as a **device**, not a lockup — name struck ONCE (the double-strike
  is dropped; it reads as a misprint at card sizes). Uses: CTA/subscribe stamp, status stamps on
  episode cards, 404 page.
- **Compact mark / favicon ancestor: M1**, `TS` in a ruled box with the red bar — chosen on the
  16px degradation measurement: every stroke dies at that size (14pt box → 0.25px), and M1
  degrades to "TS + red bar" with ~8.5px letterforms, which still reads. M2's stripe and M3's
  roundel lose their letters/strokes respectively at the same size.
- **Default satellite: the authority line**, `DEPT. OF NEURODEVELOPMENTAL AFFAIRS` under the
  rule. `PODCAST` / `EST. 2026` are per-use, not part of the default lockup.

Approved in full on the locked-builder run (all three faces pinned, zero compromises). The
maintainer's words:

> "These all look good to me."

**Default lockup = variant A (authority line only).** Grounded in the maintainer's earlier
satellite decision ("Authority line") rather than newly chosen; variant B (+ `PODCAST` eyebrow)
remains in the builder as a per-surface option.

Locked, end to end:

| Element | Locked form |
| --- | --- |
| Horizontal lockup | `TOLD STRAIGHT` one line · red rule full measure · authority line — wide surfaces |
| Stacked lockup | `TOLD / STRAIGHT` · red rule · authority line — square-leaning surfaces, minor aspect tweaks allowed |
| Dark variant | Same lockup, rule `#E4564F` (5.05:1 measured; print red `#B02A28` fails at 2.82:1 on the same dark ground) |
| Stamp device | Double-ruled red box, name struck ONCE, legend line, −3.5° |
| Compact mark | M1 — TS in ruled box, red bar (16px degradation winner) |
| Faces | `TradeGothicNextLTPro-BdCn` / `-Bd` / `LetterGothicStd`, all pinned |

## Consequences

Every #60 deliverable still ahead — favicon set, README header, OG/social cards, the InDesign
brand sheet — inherits these two lockups rather than choosing a shape ad hoc per surface. The
compact mark M1 is the fixed favicon ancestor; the deliverables phase derives 16/32/180/512px
assets from it rather than re-deriving a mark. The stamp device stays available wherever a
CTA/status/disclosure device is needed, independent of the lockups. Faces are pinned across the
system: `TradeGothicNextLTPro-BdCn`, `TradeGothicNextLTPro-Bd`, `LetterGothicStd`.
**Constrains M1, M5.**

## Reversal condition

Not recorded at decision time.
