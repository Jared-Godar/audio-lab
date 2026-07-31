# ADR 0019 — Real cast are photographed, synthetic cast stay cartoons; the Coming Soon page is a field-notice with a declassify countdown, not a TOP SECRET gimmick

- **Number:** 0019
- **Title:** Real cast are photographed, synthetic cast stay cartoons; the Coming Soon page is a field-notice with a declassify countdown, not a TOP SECRET gimmick
- **Status:** `accepted`
- **Date:** 2026-07-31
- **Source:** Issue #138 (Coming Soon design language + assets). Maintainer decisions in
  the #138 working session, 2026-07-31; recorded live in the #138 comment thread. The
  realized design spec is `artifacts/coming-soon-prototype/` (gitignored working zone).

## Context

Issue #138 set out to define the look-and-feel of the `toldstraight.com` "Coming Soon" page — a
deliberate flesh-out so the decisions would also seed the full site (#106). Two questions had to
be settled: (1) how "classified"/dossier to make the page, and (2) how to show the **real host**
alongside the show's **synthetic expert cast**.

What was already fixed: the brand is an institutional "record / field-manual" system (ADRs 0015,
0016; `brand/20260727-toldstraight-design-tokens.css`), and **ADR 0018 made the colour cartoon
portrait the cast-card image standard for *every* cast member** — including the host, whose locked
portrait is itself a cartoon. Separately, the four synthetic characters carry a mandatory
synthetic-likeness disclosure (the `.ts-caution` device, issue #60 §5).

The maintainer proposed a "TOP SECRET / DECLASSIFY ON countdown" concept, then a Roger-Rabbit
idea: photoreal humans coexisting with cartoon synthetics. That second idea reframed the first —
it turns the *mandatory* synthetic disclosure into the brand's whole personality: if the synthetic
cast are cartoons and the humans are photographs, the **medium itself signals what is real**.

## Decision

Maintainer, 2026-07-31, quoted verbatim:

> "Top secret/brand resolution: Option 2 with the declassify stamp from 3 | Roger rabbit: Option 2
> as the system + Option 3's single hero composite as the money shot."
>
> "Make the human /machine ADR bound"

Two coupled decisions follow.

**1. Human ↔ machine visual register (amends ADR 0018).** The show's cast splits by medium:

- **Real people are photographed** — rendered photoreal, brand-graded (warm-paper treatment, shared
  card frame). The host, Jared Godar, is the first; any future human co-host is the same.
- **Synthetic people stay cartoons** — the ligne-claire portraits of `episodes/cast/portraits/`
  (ADR 0018's set) remain the synthetic register.
- **The medium is the disclosure.** Photoreal = real; cartoon = synthetic. A **text** disclosure
  (`.ts-caution`) is still retained wherever synthetics appear, because the medium signals to sighted
  viewers only — the words carry it for screen readers and for anyone who does not read the visual code.
- **System vs. showpiece:** the register is expressed by *layout juxtaposition* in the general case
  (a photoreal card beside cartoon cards, same frame), and by **one signature composite** — a single
  hero image with the photoreal host seated among the cartoon experts — as the showpiece, rather than
  compositing photoreal-into-cartoon everywhere (which is the hardest, most uncanny path).

This **amends ADR 0018** for human cast members: ADR 0018's colour-cartoon standard still governs the
*synthetic* cast; the *host and any real people* are now photographed, not cartooned.

**2. Coming Soon page treatment.** The lighter, brand-consistent "field-notice" is chosen over the
full spy TOP SECRET costume, keeping one dossier device — the `DECLASSIFY ON` rubber stamp — as the
countdown. Go-live target is **2026-08-06** (maintainer: "Use 8/6/2026 as the current go-live"),
carried as a single constant. Page structure: field-notice header (document number, double rule,
stacked wordmark, red rule, authority line) → `DECLASSIFY ON` stamp + live countdown → what-the-show-
is + a `SEASON ONE — ADULT ADHD` callout → the cast (photoreal host + cartoon synthetics, `NOT REAL`
corner stamps) → a hero band → notify-me stamp → the synthetic-voice `.ts-caution` disclosure. The
realized prototype is `artifacts/coming-soon-prototype/index.html`, built on the brand tokens.

## Consequences

- **Constrains M5 (MVP static site):** #128 ships the page against the prototype spec; the design
  language here is the starting point, not a re-decision. The `DECLASSIFY` go-live constant, the
  field-notice structure, and the human/machine card treatment are inherited.
- **Constrains M4 (Episodes v2) and amends the cast-card standard:** cast cards now split by medium
  — the host card is photoreal-graded; synthetic cards stay cartoon (ADR 0018). The host's photoreal
  portrait is a new asset the card builder must accommodate for real people.
- **Feeds M7 (Branding) and the full site (#106):** the register and the field-notice idiom are the
  site's design language, not one-off page dressing.
- **Assets:** the photoreal host card, the hero group shot, and the (reused) cartoon cast were
  generated in #138 and live in the gitignored working zone; they are committed and shipped with the
  **#128** build, when the Gemini export "sparkle" is cleaned and the host photo receives its final
  warm-paper grade. This ADR records the *decisions*; #128 ships the *binaries*.
- **Disclosure invariant preserved:** the synthetic-likeness disclosure (#60 §5) is not weakened —
  it moves from footnote to identity (the medium) **plus** the retained text `.ts-caution`.

## Amendment — 2026-07-31 (#128): disclosure diction, not disclosure design

Recorded when the page shipped. **The presentation this ADR decided is unchanged and reaffirmed** —
photoreal host beside ligne-claire cast in a shared frame, the medium carrying the disclosure to
sighted viewers, a retained text disclosure for everyone else, and one signature composite as the
showpiece. Only the **words** moved.

Maintainer, reviewing the built page: the "Synthetic Expert / Synthetic Likeness" phrasing was
approved in *presentation and handling* but rejected as a turn of phrase. Three problems were named:
"synthetic" is a materials word (synthetic fabric, synthetic rubber) that reads as a euphemism when
applied to a person; "likeness" is rights-clearance legalese rather than something a reader thinks
in; and "Not Real" is vague — not a real expert, not a real photo, not a real name?

The replacement pairs a **records-annotation stamp** with a **plain-mechanism strip**, so the two
labels answer different questions instead of both gesturing at the same one:

| Surface | Was | Now |
| --- | --- | --- |
| Corner stamp (synthetic cards) | `Not Real` | `No Such Person` (two lines) |
| Card strip (synthetic cards) | `Synthetic Likeness` | `AI-Generated · Voice & Face` |
| Card strip (human card) | `Real · Human Host` | `Real Person · Host` |
| Section title | `The Cast` | `Meet the Team` |
| Section subtitle | `One real host · a cast of synthetic experts who say so` | `One real host asking the tough questions / A panel of AI-generated experts with the no BS answers (with receipts and citations)` |
| Caution heading | `Caution — Synthetic Voices & Likenesses` | `Caution — AI-Generated Voices & Faces` |

The stamp answers *is this someone?* — the ethical disclosure. The strip answers *where did this come
from?* — the mechanism, and it names the **voice** explicitly, which matters more on a podcast than
on a static page. The human card gains an explicit positive counterpart (`Real Person · Host`) rather
than being marked only by the *absence* of a stamp. Alt text moved in step, so the disclosure reaches
screen readers in the same vocabulary. No occurrence of "synthetic" remains on the page.

The subtitle also stopped carrying disclosure duty. "A cast of synthetic experts who say so" was a
disclosure note wearing a tagline's clothes; the cards now carry disclosure unambiguously, which
frees the subtitle to sell the premise. "No BS" is a deliberate compromise over stronger wording —
it holds the register while avoiding the explicit-content flags that podcast directories and ad
platforms apply, since that line is likely to be reused in a show description later.

This amendment changes wording only. If the *presentation* decision is ever revisited, the reversal
condition below still governs.

## Reversal condition

Revert to ADR 0018's all-cartoon cast (drop the photoreal register) if the photoreal-human /
cartoon-synthetic mix proves impractical to produce consistently, or reads as jarring rather than
intentional, across more than one episode's worth of cards and a shipped hero. The field-notice /
`DECLASSIFY` page treatment is reversible per-surface and is not load-bearing beyond the Coming Soon
page and whatever of it #106 chooses to keep.
