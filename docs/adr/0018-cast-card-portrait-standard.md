# ADR 0018 — The colour cartoon portrait is the cast-card image standard, across all episodes

- **Number:** 0018
- **Title:** The colour cartoon portrait is the cast-card image standard, across all episodes
- **Status:** `accepted` — amended by ADR 0019 for human cast members (real people are photographed; the colour-cartoon standard still governs the synthetic cast)
- **Date:** 2026-07-30
- **Source:** Ep03 artwork session; maintainer decision, 2026-07-30. Spec
  `artifacts/specs/20260729-ep03-artwork-and-promotion-executor-spec.md`.

## Context

Ep02's cast personnel cards used a brutalist black **silhouette** on a grey ground as the mugshot
image — a synthetic-likeness placeholder. Separately, a committed set of illustrated **colour
cartoon portraits** exists at `episodes/cast/portraits/` (the Gemini "Nano Banana 2" set, one
locked face per character — Jared, Owen, Des Fable, Michael Voss, Anna Sinclair; see
`episodes/cast/portraits/manifest.json`), holding one face and one style across the cast.

Building Ep03's Anna clinician card surfaced the choice: silhouette (Ep02-consistent) or the
illustrated portrait. Rather than decide per card, the maintainer set a standard.

## Decision

Maintainer, 2026-07-30, quoted verbatim:

> "Replace e2 art with new image matching the name. The color cartoon is the standard moving
> forward and will also be applied retroactively"

So: the **colour cartoon portrait is the cast-card mugshot image** on every episode's personnel
cards, going forward and across the existing episodes. The card keeps its four-field personnel-file
vocabulary and each card's existing copy verbatim; only the silhouette → portrait image changes.
Ep02's `cast/host_des_fable.png` and `cast/guest_michael_voss.png` are re-rendered from their
committed portraits under the same filenames; `cast/studio_disclaimer.png` has no portrait and is
unchanged.

The cards are produced by
`tools/brand/20260729-adobe-illustrator-toldstraight-cast-personnel-cards-builder.jsx` (data-driven
over a `CARDS` list), authored by the agent and run by the maintainer in Illustrator per the
episode-artwork workflow. These episodes are **drafts, not published** (maintainer, 2026-07-30),
so updating their art is ordinary work-in-progress editing, not a gated feed replacement.

## Consequences

- **Constrains M4 (Episodes v2)** and the upcoming E1/E2 rebuilds: every cast card carries the
  colour portrait; new characters need a portrait in `episodes/cast/portraits/` before their card
  is built. Ep01's Owen has a portrait but no card yet — extend the builder's `CARDS` list when a
  card is wanted.
- The silhouette remains only as an automatic fallback in the builder when a portrait file is
  missing at run time — the audit board flags it, and it is not the intended look.

## Reversal condition

Not recorded at decision time.
