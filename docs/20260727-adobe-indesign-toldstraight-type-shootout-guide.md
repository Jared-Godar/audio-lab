# Told Straight — type shootout guide

**For:** issue #60, "Build the Told Straight visual identity by extending the Ep01 art"
**Date:** 2026-07-27
**App:** Adobe InDesign (primary) · Adobe Illustrator (after the decision)
**Status:** working guide, gitignored. The *outcome* — the chosen faces — lands on a
tracked path in the brand sheet, per #60 acceptance criteria.

---

## 0. What is measured here, and what is not

Read this first. It is the difference between a guide you can act on and one you have to
re-check.

| Claim | Status | How |
| --- | --- | --- |
| Palette hex values | **Measured** | Pixel histogram over `cover.png`, `ch2.png`, `show-cover.png` |
| The red is a single canonical value | **Measured** | `#B02A28` is the dominant red in all three files, identically |
| Which fonts your Adobe kit contains | **Measured** | Parsed the `@font-face` blocks in `https://use.typekit.net/zol6gng.css` |
| Which fonts you can add | **Measured** | Adobe Fonts entitlement lookup, account type `auth` |
| Which fonts the Ep01 art is set in | **Unknown, and unknowable from the PNGs** | Checked all three for embedded metadata — zero info keys, zero text chunks. This is #60 Gap 4 |
| The type scale (sizes, tracking) below | **Eyeballed, not measured** | The pixel-measurement script was refused by the lane guard — see §9. Starting points, not the extracted system |
| Whether these fonts are activated on your **desktop** | **Not verified** | I can read your web project; I cannot see your desktop font activations. §3.3 has the check |

---

## 1. The palette — measured, use these exact values

Sampled across all three Ep01 images. Percentages are the share of total canvas pixels.

| Role | Hex | RGB | Share of `cover.png` |
| --- | --- | --- | --- |
| **Paper** (background) | `#EDE9E0` | 237, 233, 224 | 87.06% |
| **Ink** (all primary type, frame rules) | `#111111` | 17, 17, 17 | 9.52% |
| **Red** (underline, stamp, accent) | `#B02A28` | 176, 42, 40 | 1.17% |
| **Grey** (field labels, citations, secondary) | `#78746C` | 120, 116, 108 | 0.37% |
| **Hairline** (form-field rules) | `#C8C4BA` | 200, 196, 186 | 0.30% |

**The red question from #60 is answered: it is one value, not several.** `#B02A28` appears
identically in the cover's underline, the MEMBER stamp, and every Exhibit card's rule, across
both the 1600² and 3000² renders. There is no second red to reconcile. Everything else in the
files is antialiasing between these five.

Two notes before you build swatches:

- **Do not hand-type a CMYK equivalent** for the business card. `#B02A28` is a saturated red
  near the edge of coated CMYK gamut; convert through your document's profile and then judge it
  on a **printed** proof, not on screen. If you want a spot colour, pick the Pantone against a
  physical swatch book under the light the card will be seen in.
- In InDesign, build all five as **named swatches** (`TS/Paper`, `TS/Ink`, `TS/Red`, `TS/Grey`,
  `TS/Hairline`) before you set a single character. A shootout where two candidates have subtly
  different blacks is not a shootout.

---

## 2. Your type inventory — measured from `zol6gng.css`

Nine families, twenty-nine styles. This is a *good* kit for this direction — Univers is the
Swiss technical/institutional workhorse the DoD manual house style descends from, and you
already have it in four widths.

| Family | Weights & styles present | Read on it |
| --- | --- | --- |
| `univers-next-pro` | 400, 700 · roman + italic | The spine of the system. Authority lines, running heads |
| `univers-next-pro-condensed` | 400, 700 · roman + italic | **Prime title candidate.** Closest legitimate match to the FM cover feel |
| `univers-next-pro-compressed` | **400, 500 only** | Tighter, more brutal. Note: **no bold** — see the constraint below |
| `univers-next-pro-extended` | 400, 700 · roman + italic | Rule-bar labels, stamps, anything that wants to feel *stretched across* a zone |
| `helvetica-neue-lt-pro` | 400, 700 · roman + italic | Continuity with the existing Ep01 art |
| `helvetica-neue-lt-pro-cond` | **700 only** | Continuity candidate for titles. One weight is a real limit |
| `articulat-cf` | 400, 700 · roman + italic | Contemporary geometric-leaning grotesque. The "podcast" end of the range |
| `articulat-heavy-cf` | 900 · roman + italic | The loudest option available |
| `source-serif-4` | 400, 700 · roman + italic | Body text for interior/two-column pages and show notes |

### The two constraints this inventory imposes

1. **`univers-next-pro-compressed` tops out at 500.** A compressed *medium* will read lighter
   than a condensed *bold* at the same size. If you shortlist it, compare it at a larger size
   rather than concluding it lacks weight — otherwise you eliminate it for a reason that is an
   artefact of the test, not the face.
2. **There is no monospace in your kit at all.** Every form field, stamp, citation, and
   `FORM ADHD-01` line in the existing Ep01 art is set in a typewriter mono. You cannot
   reproduce or extend that page with what is currently activated. §3.2 lists what to add.

---

## 3. The candidates

### 3.1 Title / wordmark — bold condensed grotesque, all caps

| # | Face | Style to use | In your kit? | Why it is a candidate | What would eliminate it |
| --- | --- | --- | --- | --- | --- |
| **A** | Univers Next Pro Condensed | Bold (700) | ✅ Yes | Univers *is* the technical-document grotesque. Institutional without being cosplay | If `TOLD STRAIGHT` reads generic-corporate rather than issued-by-an-agency |
| **B** | Univers Next Pro Compressed | Medium (500) | ✅ Yes | Tightest, most brutal. The STP rule-bar look | If the reduced weight can't carry a 3000² cover; if counters close up at small sizes |
| **C** | Helvetica Neue LT Pro Condensed | Bold (700) | ✅ Yes | **Continuity.** The Ep01 cover reads as a Helvetica-family bold; this is the nearest thing you own | One weight only. If you later need a light or a black, you are stuck |
| **D** | Articulat Heavy CF | Heavy (900) | ✅ Yes | The stress test. Loudest, most contemporary | Almost certainly too *now* for a 1970s field manual — but run it, because knowing why you rejected it is worth a page |
| **E** | Trade Gothic Next | Heavy — `TradeGothicNextLTPro-Hv` | ❌ **Add** | The most American-military-printing face of the lot. Trade Gothic is what mid-century US government and newspaper printing actually used | If it fights the Univers you'd pair it with elsewhere |

**Prediction, stated so you can hold me to it:** A or C wins, and the deciding factor is not the
capitals — it is the numerals on Plate 3. I will reverse that if the Plate 3 sheet shows a face
whose figures are clean but whose `TOLD STRAIGHT` is dead. That is the reversal condition.

### 3.2 Record / form / stamp — monospace. **None of these are in your kit; all are yours to add.**

Every one verified available to your account this session.

| Face | PostScript name | Character |
| --- | --- | --- |
| **Letter Gothic Std** | `LetterGothicStd` | The IBM technical-document face. Historically the *right* answer for a form — this is literally what typed government paperwork looked like |
| **Orator Std** | `OratorStd` | The IBM Selectric "Orator" ball. All-caps by design, used for military and broadcast scripts. Most on-nose for the direction |
| **Courier Prime** | `CourierPrime` | The universal "typed record". Safe, legible, slightly generic |
| **Nitti** | `Nitti` | Modern, warmer, less costume-y. Good if the mono starts feeling like a gimmick |
| **IBM Plex Mono** | `IBMPlexMono` | Cleanest and most screen-legible. The choice if the mono has to work in the README and on the site too |
| **P22 Typewriter** | `P22Typewriter-Regular` | Most distressed and physical. Use with care — it can tip the whole thing into pastiche |

**My pick to beat: Letter Gothic Std.** It is the only one of these that is simultaneously
period-correct, still crisp at citation size, and not a costume.

### 3.3 Before you can set a single word — activate them for **desktop**

**Your Typekit web project is not your desktop font list.** They are separate switches, and this
is the most common half-hour lost in a job like this. A family can be in `zol6gng.css` and still
not appear in InDesign's font menu.

Click path — **Creative Cloud desktop app → the `Fonts` tab in the left sidebar → `Browse fonts`**,
search the family, and use its activation toggle. Already-active families are under
`Active fonts` in the same tab.

The browser route is `fonts.adobe.com`, family page, activation control on the family or on each
individual style. Labels here move between releases — Adobe has renamed this surface more than
once. **If what you see doesn't match, tell me what's on screen rather than hunting.**

Verify inside InDesign: `Type → Font`, and look for the Adobe Fonts marker beside the family. If
it isn't listed, it isn't activated, regardless of what the web project contains.

---

## 4. The specimen text — copy-paste, plate by plate

Five plates. Each one is a *test*, not decoration. Set the same plate in every candidate; that is
what makes it a shootout rather than five separate designs.

### Plate 1 — The wordmark

Set in: **every title candidate (A–E)**, one per page.

```text
TOLD STRAIGHT
```

```text
TOLD
STRAIGHT
```

**What you are looking at.** `TOLD STRAIGHT` is a harder string than it looks. The `LD` pair
opens a gap in most condensed faces. `T R A I` gives you four different stem rhythms in a row.
And `G` versus `C` at condensed widths is where a mediocre face shows itself — if the `G`'s spur
disappears, the word muddies at favicon size, which is exactly where the wordmark has to survive.

Set the stacked version too. The FM 21-76 cover stacks its title, and a two-line lockup is what
you will actually need for the square cover and the 1280×640 social card.

### Plate 2 — The cover, FM 21-76 structure

Set in: **every title candidate**, with the small lines in `univers-next-pro` Regular for now
(hold the mono decision for Plate 4).

```text
FM ADHD-01
```

```text
TOLD
STRAIGHT
```

```text
ADULT ADHD — SEASON ONE
```

```text
DEPT. OF NEURODEVELOPMENTAL AFFAIRS
```

```text
DISTRIBUTION RESTRICTION: APPROVED FOR PUBLIC RELEASE; DISTRIBUTION IS UNLIMITED.
```

**That last line is not filler.** It is the real FM 21-76 distribution line, and it happens to be
a precise statement of the show's thesis — the evidence is public, take it. It is the single best
piece of found copy in the whole reference set. Set it small, at the foot, in the mono, and it
will carry more of the identity than the wordmark does.

`DEPT. OF NEURODEVELOPMENTAL AFFAIRS` is already established in the Ep01 cover — keep it.

Note the em dash in the subtitle. The Ep01 art uses a hyphen (`ADULT ADHD - TOLD STRAIGHT`). At
the wide tracking this line needs, a hyphen looks like a mistake and an en dash reads better.
Both versions:

```text
ADULT ADHD — SEASON ONE
ADULT ADHD – SEASON ONE
ADULT ADHD - SEASON ONE
```

### Plate 3 — Numerals and symbols. **This is the plate that decides it.**

Set in: **every title candidate**, at Exhibit-card display size.

```text
EST. 1775    74%    3-YR DELAY    2.07x    SMD ~1.0    g = 1.17
```

And each at full card size, one per line:

```text
EST. 1775
74%
3-YR DELAY
2.07x
SMD ~1.0
g = 1.17
```

**Why this plate outranks the wordmark.** You will set the wordmark once. You will set an Exhibit
figure in every episode of every season, forever, and it is the largest element on the card. Six
strings, and between them they break most faces:

- **`74%`** — the percent sign is the most inconsistently drawn glyph in condensed grotesques.
  Some are drawn at cap height, some at x-height, some at a completely different weight to the
  figures. At 400pt this is not subtle.
- **`2.07x`** — a decimal point surrounded by figures. Watch the spacing on either side of it,
  and whether the `0` is distinguishable from `O`. Also: is that a letter `x` or the true
  multiplication sign `×` (U+00D7)? The correct mark is `×`; the letter reads more like a lab
  note. Set both and pick deliberately — right now Ep01 uses the letter.

  ```text
  2.07x
  2.07×
  ```

- **`SMD ~1.0`** — the tilde's vertical position varies enormously between faces. In some it
  sits at mid-cap, in others near the ascender, and in a couple it is drawn for use as an accent
  and looks broken standing alone.
- **`g = 1.17`** — **the only lowercase letter in the entire stat vocabulary.** It forces the
  face to have a `g` that works in isolation at display size, and single-storey versus
  double-storey is a visible identity decision you would otherwise never make consciously.
- **`3-YR DELAY`** — hyphen between a figure and caps. Watch its height and length; a hyphen
  drawn for lowercase sits too low against caps.
- **`EST. 1775`** — four figures with two identical adjacent `7`s. Tests figure rhythm and
  whether the face defaults to **tabular** or **proportional** figures.

**Set figures to lining + tabular for the cards.** `Window → Type & Tables → OpenType`, or the
Character panel menu → `OpenType`. Proportional oldstyle figures in a stat card is a real
mistake and it is the default in more faces than you'd expect.

### Plate 4 — Form fields, stamps, and citations (the mono round)

Set in: **each mono candidate**, paired with the two title faces that survived Plates 1–3.

```text
FORM ADHD-01
```

```text
MEMBER:          [ YOU ]
STATUS:          DIAGNOSED — CONFIRMED
ESTABLISHED:     1775 (OLDER THAN THE U.S.)
FILE OPENED:     2026
```

```text
MEMBER
```

```text
EXHIBIT 02 — HERITABILITY
```

```text
FARAONE & LARSSON,
MOLECULAR PSYCHIATRY 2019
```

```text
TOLD STRAIGHT / EP.01                                            02/06
```

And the SF 66 device — the ruled CAUTION box of numbered restrictions, rewritten for the show:

```text
CAUTION

1. THIS FILE CONTAINS EVIDENCE. IT IS NOT MEDICAL ADVICE.
2. EVERY FIGURE CARRIES ITS SOURCE. CHECK THEM.
3. ONE VOICE IN THIS RECORDING IS SYNTHETIC AND IS IDENTIFIED AS SUCH.
4. IF FOUND, PASS IT ON.
```

**Item 3 is doing real work.** #60 §5 requires that wherever the AI co-host appears, the fact
that the voice is synthetic is *stated*, not implied by style. A CAUTION box is a native part of
this design vocabulary — which means the disclosure can be a design element the system wanted
anyway, instead of a disclaimer bolted onto the bottom of a page. That is the cheapest possible
way to satisfy a constraint that could otherwise have cost you a compromise.

**Mono setting note:** track monospace at **0**. Wide tracking destroys the fixed-advance rhythm
that makes it read as *typed*, which is the entire reason it is there. If a mono line needs more
presence, increase the size or the leading — never the tracking. The wide-tracked look in the
existing Ep01 form labels comes from letterspaced *caps*, which is a different effect; if you
want it, apply it only to the grey field labels, never to the values.

### Plate 5 — Body text, two columns

Set in: **`source-serif-4` Regular** (and, for contrast, `univers-next-pro` Regular).

```text
Attention-deficit/hyperactivity disorder was first described in the medical literature in 1775, by Melchior Adam Weikard, a German physician — one year before the United States existed. It is among the most heritable conditions in psychiatry, with twin studies converging on roughly 74 percent. It is also among the most treatable: stimulant medication produces a standardised mean difference near 1.0, which is a large effect by any convention in the field.

None of that is controversial among people who study it. All of it is contested in public. This series is about the distance between those two facts, and about why "do your own research" so often means "arrive at the answer you started with."
```

Two paragraphs is enough to judge colour on the page, the `1775`/`74`/`1.0` figures in running
text, and whether the italic is usable for citations.

---

## 5. The InDesign setup

### 5.1 Why InDesign and not Illustrator

For the *comparison*, InDesign wins on four counts that matter here and nowhere else:

- **Paragraph styles with `Based On` inheritance.** Every candidate's title style inherits size,
  leading, tracking, case, and colour from one root style. Only the font family differs. Change
  your mind about tracking at page 7 and every candidate updates identically — which is the only
  way the comparison stays fair.
- **Multi-page with a parent page.** The frame rules, doc number position, and authority line are
  fixed furniture. Draw them once.
- **`Find/Replace Font`.** Swap a candidate across the whole document in one dialog.
- **It is where the rest of the job lives anyway.** The business card with bleed, the two-column
  interior pages, the multi-page brand sheet — all InDesign work. Illustrator would mean
  rebuilding.

**Switch to Illustrator after the decision,** for the wordmark specifically: converting to
outlines, drawing the custom lockup, tightening pairs by hand, and exporting SVG plus the
favicon sizes. That is genuinely Illustrator work and InDesign is bad at it.

### 5.2 Document setup

`File → New → Document`.

| Setting | Value | Why |
| --- | --- | --- |
| Intent | Print | Gives you points and real ink behaviour, and you need bleed later |
| Page size | **1600 × 1600 pt** | 1 pt = 1 px against the existing renders, so every number transfers directly |
| Pages | 10 to start | Five title candidates × two plates |
| Facing pages | **Off** | These are single cards, not spreads |
| Margins | 96 pt all round | 6% of canvas — matches the Ep01 frame inset closely enough to start |
| Bleed | 0 for the shootout | Add 3 mm only when the business card starts |

Then, before anything else:

1. `Edit → Preferences → Units & Increments` → set both Horizontal and Vertical to **Points**.
2. `Window → Color → Swatches` → build the five swatches from §1 as **Process / CMYK** for print
   or **RGB** for screen — but pick one and be consistent. Name them `TS/Paper`, `TS/Ink`,
   `TS/Red`, `TS/Grey`, `TS/Hairline`.
3. Draw a full-page rectangle filled `TS/Paper` on its own layer, lock the layer. Never rely on
   the white of the page — you will misjudge every contrast decision.

### 5.3 The style architecture — this is the part that makes it fast

`Type → Paragraph Styles` (`Cmd+F11`). Build in this order.

**Root styles (no font assigned to the candidate slot yet):**

| Style | Based on | Settings |
| --- | --- | --- |
| `_ROOT` | `[No Paragraph Style]` | Colour `TS/Ink`, hyphenation **off**, align left |
| `_ROOT/Display` | `_ROOT` | 340 pt / 300 pt leading, tracking **−15**, Case: **UPPERCASE**, kerning **Optical** |
| `_ROOT/Subtitle` | `_ROOT` | 44 pt / 60 pt, tracking **+300**, UPPERCASE |
| `_ROOT/Authority` | `_ROOT` | 28 pt / 38 pt, tracking **+300**, UPPERCASE, colour `TS/Grey` |
| `_ROOT/DocNo` | `_ROOT` | 32 pt / 40 pt, tracking **+120**, UPPERCASE |
| `_ROOT/Stat` | `_ROOT` | 400 pt / 360 pt, tracking **−20**, lining + tabular figures |
| `_ROOT/Citation` | `_ROOT` | 26 pt / 40 pt, tracking **+150**, UPPERCASE, colour `TS/Grey` |
| `_ROOT/Body` | `_ROOT` | 30 pt / 44 pt, tracking 0, sentence case, hyphenation **on** |

**Sizes and tracking above are eyeballed from the Ep01 render, not measured** (§0, §9). Expect to
move them. What matters is that they are identical across candidates.

**Then, per candidate, one style each:**

```text
A/Display   →  Based On: _ROOT/Display   →  change ONLY Font Family + Style
B/Display   →  Based On: _ROOT/Display   →  change ONLY Font Family + Style
C/Display   →  Based On: _ROOT/Display   →  ...
```

When a style is `Based On` another, InDesign shows overridden fields in the dialog. If you have
changed anything except Font Family and Font Style, you have broken the comparison — that is your
built-in check.

Set **Kerning: Optical** on the display styles. Condensed caps at 340 pt need optical kerning;
the built-in metrics in most families are tuned for text, not for a two-word lockup.

### 5.4 Page workflow

1. Build page 1 completely with `A/…` styles: doc number top-left, title block centred, subtitle
   under a `TS/Red` rule, authority and distribution lines at the foot.
2. Put the frame rules and any fixed furniture on `A-Parent` (`Window → Pages`, double-click the
   parent page; called *Parent Pages* in current InDesign, *Master Pages* in older releases).
3. `Window → Pages` → right-click page 1 → **Duplicate Spread**, four times.
4. On each duplicate, select all text and apply that candidate's styles. Five pages, five faces,
   identical everything else.
5. Repeat for Plate 3. Plates 4–5 only for the survivors.

**The one-dialog swap:** `Type → Find/Replace Font…` (labelled `Find Font…` in older releases)
replaces every instance of a family document-wide. Use it when you want to try a face you didn't
shortlist without rebuilding pages.

### 5.5 Reviewing

`File → Export → Adobe PDF (Print)`, preset **High Quality Print**.

Then judge it three ways, because they disagree and you need all three:

- **On screen at 100%**, one page at a time, at the size the cover is actually seen.
- **Printed at A4, four pages to a sheet.** Paper is where the paper-stock direction gets judged,
  and `#EDE9E0` on an actual sheet is a different colour than `#EDE9E0` on a display.
- **At favicon size.** In the Pages panel, drop the thumbnail size to the smallest setting, or
  export the wordmark page at 32 px. The wordmark has to survive this and nothing else in the
  test will tell you whether it does.

---

## 6. Run it as three rounds, not one

This mirrors the voice audition funnel (#38/#40) deliberately — the same structure worked, and
comparing five things against five other things at once produces a decision nobody can explain
afterwards.

| Round | What | Pages | Output |
| --- | --- | --- | --- |
| **1** | Five title candidates × Plates 1–2 | 10 | Two survivors |
| **2** | Two survivors × Plate 3, then × three monos as pairings | ~12 | One pairing |
| **3** | Winner pairing across Plates 4–5, at real sizes | 4 | The decision |

**Round 2 is where the real decision is.** A title face and a mono are chosen as a *pair* — a
face that is excellent alone can fight the mono beside it, and you will be seeing them together
on every asset the show ever ships.

---

## 7. Gotchas that will cost you time if nobody says them

1. **Web project ≠ desktop activation.** §3.3. This is the one.
2. **Track mono at 0.** §4, Plate 4.
3. **Set lining + tabular figures on the stat styles** before comparing Plate 3, or you are
   comparing figure styles rather than typefaces.
4. **Optical kerning on display, metrics on body.** Opposite defaults, both correct.
5. **`univers-next-pro-compressed` has no bold** — compare it at a larger size or you will
   eliminate it for the wrong reason.
6. **Turn off hyphenation on every display and caps style.** InDesign hyphenates by default and a
   broken `STRAIGHT` at the end of a line is a wasted page.
7. **Don't judge on the default white page.** Lay the `TS/Paper` rectangle first.
8. **Adobe Fonts files cannot ship in this repository** — outlines and rasterized output are
   fine, font files are not. Recorded in `CHANGELOG.md` § Findings. The brand sheet names the
   faces and their licence; it does not carry them.

---

## 8. Recording the outcome

Whatever wins, three things get written down or the shootout was for nothing:

1. **The brand sheet** — the five hex values from §1, the two or three chosen faces with their
   exact PostScript names and Adobe Fonts licence status, the type scale as finally set, and the
   tracking values. Tracked path, per #60.
2. **The reasoning, in one paragraph each** — why the winner won and why the runner-up lost. In
   six months the runner-up will look tempting again and you will not remember.
3. **Provenance on anything exported** — `DATE-VENDOR-ENGINE-SUBJECT-PURPOSE` per `CLAUDE.md`,
   with a sibling manifest. For example:
   `20260728-adobe-indesign-toldstraight-wordmark-round1-contact-sheet.pdf`.

And the standing gap: **the Ep01 art's own fonts are unrecoverable from the PNGs** — no metadata,
no source file. Whatever you choose here becomes the system of record going forward, and the
existing eight images are either matched by eye or eventually re-set. Record that as a decision
rather than leaving it to be discovered.

---

## 9. One thing I could not do

The pixel-measurement script that would have given you **measured** cap heights, rule weights,
and frame insets from `cover.png` was refused by the repository's PM-lane guard. The guard's
redirect detection read the `>` in Python comparison operators (`if y-start>4:`) as a shell
redirect and treated the script as a write to a tracked path. It writes nothing; it reads three
PNGs and prints to stdout.

I did not rewrite it to get around the guard. Routing around a guardrail without asking is the
specific failure `AGENTS.md` was written in response to, and the workarounds available here are
documented holes rather than fixes.

**The consequence:** every size and tracking value in §5.3 is an eyeballed starting point rather
than the extracted system. They are internally consistent, so the shootout is still fair — but
they are not the Ep01 art's actual measurements, and they are labelled that way throughout.

This is the same root cause as open issue **#56**.
