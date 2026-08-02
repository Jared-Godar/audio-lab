# Told Straight — the approved card standard, measured from the artwork

**Status: IN FORCE.** The tracked record of the approved card system: **faces from the
maintainer's 2026-07-27 type shootout, geometry measured off
`episodes/ToldStraight-Ep01/cover.png` on 2026-08-01.**

**Those are two different kinds of claim and this document keeps them apart.** Geometry is
measured and reproducible — run the script in § 7. Faces are a recorded decision and are **not**
derivable from the artwork, because the artwork was itself exported with system-font
substitutions (§ 1). An earlier version of this file conflated the two, claimed to have recovered
the faces by measurement, and named two macOS system fonts as the approved standard. That is
corrected here; see #202.

**Where this document and any builder disagree, this document wins and the builder is wrong** —
for geometry. For faces, the shootout decision wins over both.

> **Corrected 2026-08-01.** Superseded by this revision: the face table naming Arial Narrow Bold
> and Courier New Bold, the claim that 987 faces including 215 Adobe faces were tested (0 Adobe
> faces were), the claim that Trade Gothic Next / Letter Gothic / Univers are absent from the
> maintainer's library (all three are installed), every fitted point size and tracking value in
> § 3, and the standing rule in § 7.

---

## 0. Why this file exists

The Ep01 cover is the only asset carrying the maintainer's approved type and layout decisions.
On 2026-07-27 a type shootout recorded, in its own words:

> | Which fonts the Ep01 art is set in | **Unknown, and unknowable from the PNGs** | Checked all three for embedded metadata — zero info keys, zero text chunks. This is #60 Gap 4 |
>
> The type scale (sizes, tracking) below — **Eyeballed, not measured** — the pixel-measurement
> script was refused by the lane guard

The lane guard that blocked the measurement was removed with the 2026-07-30 governance
consolidation (#94), so the measurement finally ran.

**On the faces, the shootout was right and this document previously said it was wrong.** "Unknown,
and unknowable from the PNGs" is correct: the cover was exported with system-font substitutions, so
no amount of fitting recovers the intended faces from it — the best fit *is* the substitution. The
revision this replaces declared "unknowable was wrong", named the two system fonts it had fitted,
and marked them the approved standard. That inverted the truth twice: it treated a fallback
artifact as evidence, and overruled a dated decision with it.

**On the type scale, the shootout's self-assessment was right too** — "eyeballed, not measured" —
and *that* gap is what this document closes. Cap heights, ink widths, rule positions and the
palette are measured, reproducible, and face-independent. Everything in § 2, § 3 and § 4 is the
measurement the shootout said it could not do.

---

## 1. Faces — the maintainer's recorded decision, not a measurement

**The faces are given, not derived.** They come from the 2026-07-27 type shootout, run 2, chosen
across all three plates:

| Role | Face | PostScript |
| --- | --- | --- |
| **Title / display** | **Trade Gothic Next LT Pro — Bold Condensed** | `TradeGothicNextLTPro-BdCn` |
| **Mono** | **Letter Gothic Std — Bold** | `LetterGothicStd-Bold` |

**Standing constraint.** Every face in the final design is in the maintainer's `audio-lab` Adobe
library (project `zol6gng`). A face absent from that library is **definitionally wrong**. Not
every face in the library is in the design; nothing outside it is.

### Why the artwork cannot decide this

An earlier version of this section claimed the faces had been *recovered by measurement* and named
Arial Narrow Bold and Courier New Bold. That was wrong twice over (#202):

1. **The measurement never tested a single Adobe font.** It globbed
   `livetype/**/*.otf`; the synced faces live at `livetype/.w/.39691.otf`. Python's `glob` does not
   descend into dot-directories and `*` does not match a leading dot, so it examined **0 of 211**
   files while reporting *"987 faces tested … plus all 215 Adobe CoreSync synced faces."* Trade
   Gothic Next (17 styles), Letter Gothic Std (4) and Univers Next Pro (57) were all installed and
   all invisible to it.
2. **The approved cover was itself exported with system-font substitutions.** With the glob fixed,
   **all 11 elements still fit macOS system faces better than any library face** — title_1 scores
   0.916 on Arial Narrow Bold against 0.689 on Trade Gothic Next Bold Condensed; every mono element
   scores ~0.69–0.73 on Courier New Bold against ~0.35–0.43 on Letter Gothic Std.

The second point is the one that matters and no code fix repairs it: **measuring an artifact
rendered in the wrong font recovers the wrong font.** The cover is evidence of a fallback, not of a
decision. Reproduce it with `--identify-all`.

**So the artwork yields geometry only** — ink boxes, cap heights, widths, palette, rule positions.
Those are face-independent and remain the primary record. Faces come from the shootout.

### Where decision and measurement agree

Ranked *within the library*, the shootout winner is also the closest fit:

| Library candidate | pixel IoU vs `MEMBERSHIP` | tracking |
| --- | --- | --- |
| **Trade Gothic Next LT Pro / Bold Condensed** | **0.6961** | **+32** |
| Trade Gothic Next SR Pro / Bold Condensed | 0.6942 | +32 |
| Trade Gothic Next LT Pro / Heavy Condensed | 0.6303 | +7 |
| Helvetica Neue LT Pro / Bold Condensed | 0.6173 | −1 |
| Univers Next Pro / Bold Condensed | 0.5860 | — |

**The title is CONDENSED.** It has been read as a wide grotesque by eye more than once and it is
not — wide faces are 15–20% too wide on every glyph and only reach the measured line width at
about −145/1000 em, which collides the letters.

**Letter Gothic Std is the only monospaced family in the library** — verified by reading
`post.isFixedPitch` and PANOSE `bProportion` across all 211 synced faces. There is no alternative
to weigh, and no legitimate second entry for a mono fallback chain.

**Every mono element is BOLD** — header, subtitle, field keys and values. At the subtitle's
tracking the regular weight thins into hairlines.

### What measurement cannot settle, and this document will not claim

**Pixel overlap cannot discriminate faces below roughly cap 40 px.** At the card's mono sizes
(cap 18–23) candidate faces differ by less than the antialiasing noise floor — 0.30 versus 0.34.
The previous version identified the mono from "visible slab serifs" at that size and asserted a
resolution its own method does not have. Face assignment for small text follows the design system,
not a fit.

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

**Point sizes and tracking below are for the faces in § 1.** They are *fitted* values — the size
that reproduces the measured cap height in that face, and the tracking that reproduces the measured
ink width in that face — so they change when the face changes. The values that stood here before
were fitted to Arial Narrow and Courier New and are all superseded; the ink boxes are not, because
ink boxes are face-independent.

| Element | face | cap | ink width | pt size | tracking | x | cap_top |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Frame | ink rect | — | — | — | — | inset 40, **6 px** stroke | — |
| `FORM ADHD-01` | mono bold, ink | 21 | 289 | 28 | **+300** | left 71 | 96 |
| `DEPT. OF …` | mono bold, grey | 18 | 628 | 25 | **+126** | left 900 | 99 |
| Header rule | ink, 3 px | — | — | — | — | 62 → 1537 | 149 |
| Title line 1 (MAJOR) | title | 147 | 1093 | 204 | **+32** | centre 801.5 | 293 |
| Title line 2 (minor) | title | 111 | 245 | 154 | **+67** | centre 801.5 | 463 |
| Title line 3 (MAJOR) | title | 147 | 1302 | 204 | **+46** | centre 802 | 619 |
| **Red rule** | red, **8 px** | — | — | — | — | 120 → 1480 | **776** |
| Subtitle | mono bold, ink | 31 | 1019 | 43 | **+323** | centre 801.5 | 831 |
| Field key ×3 | mono bold, grey | 23 | 160 / 156 / 278 | 31 | **+191 / +175 / +177** | left 160 | 938 / 1030 / 1122 |
| Field value ×3 | mono bold, ink | 23 | fitted per value | 31 | fitted per value | left ≈590 | 938 / 1030 / 1122 |
| Field hairline ×3 | hairline, 2 px | — | — | — | — | 160 → 1440 | 985 / 1077 / 1169 |
| Footer line 1 | mono bold, grey | 18 | 123 | 25 | **+143** | left 72 | 1511 |
| Footer line 2 | mono bold, ink | 19 | 375 | 26 | **+86** | left 71 | 1536 |

Field **values** are fitted individually against their own measured ink boxes rather than
inheriting the keys' tracking — a value carrying a key's number is a guess wearing a
measurement's clothes.

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

> ⚠️ **This table cannot currently be regenerated — tracked as #203.** The committed script never
> opens `ch1.png`; `COVER` is hardcoded and `ELEMENTS` covers the cover only. Spot-checks against
> the PNG confirm the values are real (statement `cap 111 @ y537`, subtitle `cap 44 @ y830`, both
> exact), so this is a lost-source problem rather than an invented-numbers one — but no `pt size`
> or `tracking` column is given here, because those are face-dependent and re-deriving them
> requires the measurement path that was never committed.

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

The card was made by hand, or by a tool outside the repo — and **the faces it landed on are macOS
system fonts, not the ones chosen for it.** That is the finding, and it reframes the whole file:
the approved cover is not a faithful rendering of the approved decision. It is what the decision
looked like after an export silently substituted the faces.

So "only the Ep01 cover looks right" was never because Ep01 had the correct faces. It is because
Ep01 is internally consistent — one substitution applied uniformly — while everything built after
it mixed the substituted look with genuine library faces. Rebuilding Ep01 from this standard will
**not** reproduce that PNG pixel-for-pixel, and should not: matching it would mean reproducing the
substitution.

**This document is the persistence that was reported as done and was not** — twice.

---

## 7. How to re-verify, and the standing rule

```fish
cd ~/Code/audio-lab
set S tools/brand/20260801-python-pillow-toldstraight-approved-card-measurement.py
uv run --with pillow --no-project python $S                  # geometry — regenerates § 3
uv run --with pillow --no-project python $S --identify       # rank library faces (diagnostic)
uv run --with pillow --no-project python $S --identify-all   # + system fonts: shows the substitution
uv run --with pillow --no-project python $S --proof          # render and diff
```

The script prints how many library faces resolved (**211**) before using any of them. That line
exists because the version this replaces reported a face count it had never verified — it counted
paths it had globbed, not fonts that loaded, and the true count was zero. A pool size printed next
to the faces drawn from it makes that class of claim self-checking.

**`--proof` returns IoU ≈ 0.62, and that is the correct result.** The render is in the maintainer's
faces; the artwork is not. Agreement near 1.0 would mean the correction had *not* been applied. It
is a geometry check, not an acceptance test — the previous 0.80 was a true number about the wrong
faces.

**Standing rule.** Every face in this system is in the maintainer's `audio-lab` Adobe library. A
face absent from that library is **definitionally wrong**, and a macOS system font is never a valid
substitute. A builder that cannot resolve `TradeGothicNextLTPro-BdCn` or `LetterGothicStd-Bold`
must **fail loudly and draw nothing** — no fallback chain, no "closest available", no default. Two
separate silent substitutions produced this file and then produced a wrong version of it; the third
must not be possible.

**How to check a builder against this rule without reading it:** its font chains must contain only
families listed in the maintainer's library. Anything else — `arialnarrow`, `couriernew`, `menlo`,
`helveticaneue` (as distinct from `helveticaneueltpro`), `ptsansnarrow`, `robotocondensed` — is a
defect regardless of what the surrounding comment claims. #204 proposes making that a pre-commit
gate rather than a thing to remember.
