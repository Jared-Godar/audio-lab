# Told Straight — the approved card standard, measured from the artwork

**Status: IN FORCE.** This is the tracked, durable record of the design decisions carried by
`episodes/ToldStraight-Ep01/cover.png`. Every number here was measured off that file on
2026-08-01. Nothing is eyeballed, inferred, or recalled.

**The card is the specification.** No script ever produced it (see § Provenance), so there is no
source to defer to. Where this document and any builder disagree, this document wins and the
builder is wrong.

---

## 0. Why this file exists

The Ep01 cover is the only asset carrying the maintainer's approved type and layout decisions.
On 2026-07-27 a type shootout recorded, in its own words:

> | Which fonts the Ep01 art is set in | **Unknown, and unknowable from the PNGs** | Checked all three for embedded metadata — zero info keys, zero text chunks. This is #60 Gap 4 |
>
> The type scale (sizes, tracking) below — **Eyeballed, not measured** — the pixel-measurement
> script was refused by the lane guard

That gap was never closed. Different faces were chosen instead, and every asset built afterwards
inherited them — which is why only the Ep01 cover looks right. The lane guard that blocked the
measurement was removed with the 2026-07-30 governance consolidation (#94), so the measurement
was finally possible. **"Unknowable" was wrong.** The numbers below are the proof.

---

## 1. Faces — identified by measurement, not by metadata

PNGs carry no font metadata, so the faces were recovered by fitting glyph geometry.

**Method.** For each letter, ink width ÷ cap height. That ratio is independent of point size
**and of tracking** — tracking moves glyphs apart, it cannot change how wide a glyph is. The
measured profile was compared against **987 font faces installed on the maintainer's machine**
(all macOS system fonts plus all 215 Adobe CoreSync/Typekit synced faces), then confirmed by
rendering each candidate at matched cap height and fitted tracking and computing pixel overlap
(IoU) against the real ink.

### Title / display face

| Candidate | per-glyph RMS error | pixel IoU | tracking needed |
| --- | --- | --- | --- |
| **Arial Narrow Bold** | **0.0179** | **0.777** | **−4.3 px** |
| Helvetica Neue Condensed Bold | 0.0491 | 0.540 | +2.5 px |
| Arial Bold | 0.1621 | 0.546 | −30.3 px |
| Helvetica Bold | 0.1588 | 0.556 | −29.0 px |

**The title face is a CONDENSED bold grotesque; on this machine it renders as Arial Narrow Bold**
(PostScript `ArialNarrow-Bold`). Every wide candidate is 15–20% too wide on *every single glyph*
and only reaches the right line width with roughly −145/1000 em of tracking, which visibly
collides the letters.

> **The recurring error this corrects.** The Ep01 title has been read as a *wide* grotesque more
> than once, by eye, from the PNG. It is not. Anything that sets these cards in Helvetica,
> Helvetica Neue, or Arial at normal width is wrong, and the error is 15–20% per glyph — large,
> systematic, and obvious once measured.

### Mono face

| Candidate | pixel IoU |
| --- | --- |
| **Courier New Bold** | **0.587** |
| Menlo Bold | 0.406 |
| Courier New Regular | 0.358 |
| Andale Mono | 0.229 |

**The mono face is Courier New Bold** (PostScript `CourierNewPS-BoldMT`). It has visible slab
serifs on every stem — clearly readable at 4× zoom on `ESTABLISHED:` and `1775 (older than the
U.S.)`. Letter Gothic Std is a *sans* mono and cannot produce them.

**Every mono element on the card is BOLD** — header, subtitle, field keys and field values. At
the subtitle's +142 tracking the regular weight thins into hairlines.

### What this means for the Adobe kit

Both faces are **macOS system fonts, not Adobe Fonts**. Neither Trade Gothic Next, nor Letter
Gothic, nor Univers is present in the maintainer's 215 synced CoreSync faces — so a builder
asking for `TradeGothicNextLTPro-BdCn` or `LetterGothicStd` resolves to **whatever the fallback
chain reaches**, which is how a wide face entered the system in the first place.

---

## 2. Palette — unchanged, and independently re-confirmed

| Role | Hex | Share of `cover.png` |
| --- | --- | --- |
| Paper (background) | `#EDE9E0` | 87.4% |
| Ink (primary type, frame) | `#111111` | 9.7% |
| Red (rule, stamp) | `#B02A28` | 1.5% |
| Grey (secondary type) | `#78746C` | 0.8% |
| Hairline (field rules) | `#C8C4BA` | 0.7% |

Matches the 2026-07-27 measurement exactly. The palette was never the problem.

---

## 3. Cover geometry — 1600 × 1600

All values in pixels at 1600 × 1600, which maps 1:1 to a 1600 × 1600 pt Illustrator artboard.
`cap_top` is the y of the **cap-height top of the ink**, not a text-box top — box tops vary by
font metrics, ink does not.

| Element | face | cap | pt size | tracking | x | cap_top |
| --- | --- | --- | --- | --- | --- | --- |
| Frame | ink rect | — | — | — | inset 40, **6 px** stroke | — |
| `FORM ADHD-01` | mono bold, ink | 21 | 35 | +108 | left 71 | 96 |
| `DEPT. OF …` | mono bold, grey | 18 | 30 | 0 | left 900 | 99 |
| Header rule | ink, 3 px | — | — | — | 62 → 1537 | 149 |
| Title line 1 (MAJOR) | title | 147 | 204 | −13 | centre 801.5 | 293 |
| Title line 2 (minor) | title | 111 | 154 | −21 | centre 801.5 | 463 |
| Title line 3 (MAJOR) | title | 147 | 204 | −12 | centre 802 | 619 |
| **Red rule** | red, **8 px** | — | — | — | 120 → 1480 | **776** |
| Subtitle | mono bold, ink | 31 | 53 | **+142** | centre 801.5 | 831 |
| Field key ×3 | mono bold, grey | 23 | 39 | +22 | left 160 | 938 / 1030 / 1122 |
| Field value ×3 | mono bold, ink | 23 | 39 | +22 | left ≈590 | 938 / 1030 / 1122 |
| Field hairline ×3 | hairline, 2 px | — | — | — | 160 → 1440 | 985 / 1077 / 1169 |
| Footer line 1 | mono bold, grey | 18 | 29 | +37 | left 72 | 1511 |
| Footer line 2 | mono bold, ink | 19 | 31 | −33 | left 71 | 1536 |

> Regenerate this whole table with
> `uv run --with pillow --no-project python tools/brand/20260801-python-pillow-toldstraight-approved-card-measurement.py`.
> Point sizes and tracking are *fitted* values — the size that reproduces the measured cap height
> and the tracking that reproduces the measured ink width — so they shift by a point or two with
> the measurement window. The **ink box** columns are the primary record; size and tracking are
> derived from them.

### The three relationships that make the card work

1. **Two title sizes, not one.** The short connector line drops to **111/147 = 0.755** of the
   major size. Setting every line at one shared size flattens the rhythm. *(An earlier
   uncommitted revision guessed this ratio at 0.66; the measured value is 0.755.)*
2. **The red rule underlines the title.** It sits at y 776 — **10 px below the cap baseline of
   the last title line (766)** — and touches the `Q` descender. It is not a fixed band at y 820,
   and it does not float.
3. **The subtitle hangs off the rule**, at cap_top 831 = **48 px below the rule**, not off a
   canvas constant.

Field row pitch is a uniform **92 px**; each hairline sits **47 px** below its row's cap top.

---

## 4. Chapter-card geometry — 1600 × 1600

Measured from `episodes/ToldStraight-Ep01/ch1.png`. Same frame, same header, same faces.

| Element | face | cap | x | cap_top |
| --- | --- | --- | --- | --- |
| `EXHIBIT NN - LABEL` | mono bold, ink | 21 | left 70 | 94 |
| Header rule | ink, 3 px | — | 62 → 1537 | 147 |
| Statement | title | 111 | centred | 537 |
| Red rule | red, 8 px | — | 200 → 1400 | 757 |
| **Subtitle** | **title face**, ink | 44 | centred | 830 |
| Citation line 1 | mono bold, grey | 30 | centred | 1068 |
| Citation line 2 | mono bold, grey | 26 | centred | 1122 |
| Footer L / R | mono bold, grey | ~18 | 71 / right 1527 | 1512 |

**Note the subtitle is set in the TITLE face, not the mono** — it is a condensed bold line, not a
letterspaced typewriter line. This differs from the cover, where the subtitle *is* mono.

---

## 5. Maintainer-requested adjustments

Requested 2026-08-01: bump the subtitle and bottom-panel text. Exposed as named multipliers in
the builder so the measured baseline stays visible and the deviation stays explicit:

| Knob | Baseline | Applies to |
| --- | --- | --- |
| `SUBTITLE_SCALE` | 1.00 | cover subtitle (cap 31), chapter subtitle (cap 44) |
| `BOTTOM_SCALE` | 1.00 | cover footer (cap 18), chapter citations (cap 30/26) |

Set above 1.00 to bump. The measured values are the 1.00 reference and are never overwritten.

---

## 6. Provenance — no script ever made this card

| Fact | Evidence |
| --- | --- |
| The cover landed 2026-07-23 | `f9e662a`, its only commit; `cover.png` is byte-identical to `_v1-archive/cover.png` |
| The earliest builder in the repo is 2026-07-27 | `a54befb` adds the first four `tools/brand/*.jsx` |
| No earlier builder exists anywhere | every `.jsx` blob in the object database, **including unreachable objects**, is a known builder dated ≥ 2026-07-27 |
| The builder that claims these covers never ran | `545c0c8` — *"…and rebuild the Ep02/Ep03 covers"* — shipped **zero** episode covers; `output/artwork/ep01/` and `ep02/` do not exist |
| Committed Ep02/Ep03 covers came from elsewhere | Ep02 `7ad83c7` (2026-07-27), Ep03 `1cbef30` (2026-07-30) |

The card was made by hand, or by a tool outside the repo, and the faces it landed on are system
fonts. **This document is the persistence that was reported as done and was not.**

---

## 7. How to re-verify, and the standing rule

The measurement scripts are reproducible: identify faces by per-glyph width ÷ cap height across
installed fonts, confirm by IoU at matched cap height, extract geometry from colour-classified
row/column profiles. Rendering the table in § 3 back out and diffing against the original gives
**IoU 0.80** on ink (excluding the rotated `MEMBER` stamp, which is not yet modelled).

**Standing rule.** No asset in this system is set in a face that has not been checked against this
document. A builder that cannot resolve `ArialNarrow-Bold` or `CourierNewPS-BoldMT` must **fail
loudly**, never silently fall back to a wide face — that silent fallback is the entire reason this
file had to be reconstructed.
