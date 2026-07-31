# Social platform marks — official glyph geometry

Five platform marks, retrieved 2026-07-31 for issue #164 and for the Illustrator
builder `tools/brand/20260731-adobe-illustrator-toldstraight-social-icons-builder.jsx`.

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

**X and TikTok are non-perceivable on the dark stock** — not subtle, invisible. So
they do **not** carry their brand colour: they inherit the ink token, which already
flips `#111111 → #EDE9E0` with the theme and therefore inverts automatically.

The other three clear the floor in both themes and keep their brand colour. That is
the honest reading of "official full colour" in a two-theme system: every mark that
*can* carry its brand colour does.

## Consumers

- `artifacts/specs/20260731-issue-164-social-links-component.html` — inline SVG for
  the website (issue #164). The web does not need Illustrator.
- `tools/brand/…-social-icons-builder.jsx` — for **non-web** surfaces: episode art,
  cards, print. Places these files, applies the colour rule above, exports sizes.
