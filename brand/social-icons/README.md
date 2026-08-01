# Social platform marks — official glyph geometry

Six platform marks, retrieved 2026-07-31 for issue #164 and for the Illustrator
builder `tools/brand/20260731-adobe-illustrator-toldstraight-social-icons-builder.jsx`.

## Which marks ship

All six. Every mark in this directory is live on `site/index.html`.

| Mark | Colour on the site |
| --- | --- |
| Instagram, YouTube, Facebook | Brand colour — clears the contrast floor in both themes |
| X, TikTok | Inherit `--ts-ink` — brand `#000000` is 1.14:1 on the dark stock |
| Bluesky | Brand blue adjusted 1% — the one adjusted mark, see below |

## Status — APPROVED for web, 2026-07-31

Approved by the maintainer after reviewing the rendered light and dark rows. The
approval has a boundary, and it matters:

| Surface | Status |
| --- | --- |
| The six vector glyphs in this directory | **Approved** |
| The inline-SVG marks live in `site/index.html` | **Approved** — shipped under #164 |
| The Illustrator PNG row for non-web surfaces | **Approved** — re-run 2026-08-01, all marks solid |

**The hollow-X defect is resolved.** An earlier export rendered X as an outline rather
than a solid glyph. The compound-path recolour fix (`87fe132`) corrected it, and a
maintainer re-run on 2026-08-01 confirmed X solid in both rows, inverting correctly with
the ink token — the audit board reported 22 paths recoloured with no zero counts.

**What that same run did expose** was a worse class of bug, now fixed in the builder: it
resolved its icon source by probing for **one** file and taking the first directory that
matched, which silently preferred a **stale** five-glyph directory over the current
six-glyph one. It rendered five marks, reported "0 missing", and produced a set with no
Bluesky. Every check passed, because every check asked *"is what I expected present?"* and
never *"is anything I declared absent?"* The builder now requires a candidate directory to
hold **every** mark in `MARKS`; a partial directory is refused outright, with a per-
candidate report of what was found and what was missing.

## Deviation from issue #164 — accepted by the maintainer, 2026-07-31

Issue #164 asked for marks pulled from **each platform's own brand-resources page**,
in **full colour**. This set deviates on both counts, knowingly:

- The marks come from **Simple Icons**, a third-party set — though it publishes the
  official glyph geometry, and the files are CC0.
- **X and TikTok do not carry their brand colour.** Both are `#000000`, which measures
  1.14:1 on the dark stock — not merely low-contrast, non-perceivable. They inherit
  the ink token instead.

The maintainer reviewed both deviations against the rendered result and chose to ship
this set. Recorded here so a later reader does not mistake the deviation for an
oversight.

## Provenance

Source: the **Simple Icons** project, which publishes each platform's official glyph
path data. The SVG files are released **CC0**; retrieved from `cdn.simpleicons.org`
on 2026-07-31.

**These are not redrawn.** They are the official geometry. Do not hand-edit the path
data — replacing a mark means re-fetching it, not nudging beziers.

**CC0 covers the files, not the trademarks.** Each mark remains the property of its
platform, and each platform publishes brand guidelines governing minimum size, clear
space, and prohibiting recolouring or distortion. Honour them.

## Measured contrast — this drove a design decision

WCAG floor for non-text graphical objects is **3.0:1**.

| Mark | Brand hex | on `#EDE9E0` | on `#14140F` |
| --- | --- | --- | --- |
| X | `#000000` | 17.33 | **1.14** |
| TikTok | `#000000` | 17.33 | **1.14** |
| Instagram | `#FF0069` | 3.18 | 4.80 |
| YouTube | `#FF0000` | 3.30 | 4.62 |
| Facebook | `#0866FF` | 3.98 | 3.83 |
| Bluesky | `#1185FE` | **2.98** | 5.11 |
| Bluesky | `#0085FF` (brand kit) | **2.99** | 5.10 |
| Bluesky **as shipped** | `#1083FB` | 3.06 | 4.98 |

**X and TikTok are non-perceivable on the dark stock** — not subtle, invisible. So
they do **not** carry their brand colour: they inherit the ink token, which already
flips `#111111 → #EDE9E0` with the theme and therefore inverts automatically.

**Bluesky is the one adjusted mark, and it is adjusted by 1%.** Both official
candidates land *just* under the floor on the light stock — `#1185FE` (Simple Icons)
at 2.98 and `#0085FF` (Bluesky's own brand kit) at 2.99. Neither is a judgement call
about taste; they fail a measured threshold. Darkening `#1185FE` by 1% to `#1083FB`
clears it at 3.06 while remaining visually indistinguishable from the brand blue.

The alternative was dropping Bluesky to the ink token like TikTok, which would have
discarded the brand identity outright to fix a 0.7% shortfall. A 1% darkening is the
smaller lie. It is still a deviation from Bluesky's brand guidelines, which prohibit
recolouring — recorded here rather than buried.

The other three clear the floor in both themes and keep their brand colour. That is
the honest reading of "official full colour" in a two-theme system: every mark that
*can* carry its brand colour does.

## Consumers

- `artifacts/specs/20260731-issue-164-social-links-component.html` — inline SVG for
  the website (issue #164). The web does not need Illustrator.
- `tools/brand/…-social-icons-builder.jsx` — for **non-web** surfaces: episode art,
  cards, print. Places these files, applies the colour rule above, exports sizes.
