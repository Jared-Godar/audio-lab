# brand/

The one home for identity. Structure drawn by the maintainer in
[#176](https://github.com/Jared-Godar/audio-lab/issues/176) and **built** rather than
described, by his decision of 2026-08-02:

**Decision:** build the structure as drawn, with placeholder files even where a folder is
empty, so future assets have a predetermined destination.

This reverses the earlier decision to defer the structure until content forced it. That
deferral is what produced ad-hoc filing in the first place, which is the problem this
directory exists to end.

## The structure

```text
brand/
├── general-branding/            voice, tone, naming, boilerplate copy
├── graphic-standards/           the rules the artwork obeys
│   ├── fonts/                   typeface decisions + the evidence behind them
│   └── color-templates/         palette definitions and design tokens
├── digital/                     assets for screens
│   ├── logos/
│   ├── wordmarks/
│   ├── email-signature/
│   └── email-template/
├── print/                       assets for paper — empty until print work starts
│   ├── business-cards/
│   ├── envelopes/
│   └── stationery/
└── social-media/
    ├── cross-platform-content/  copy and assets reused across platforms
    ├── images/                  imagery not specific to one platform
    ├── scripts/                 builders for the cross-platform assets
    ├── x/          { images/  scripts/ }
    ├── instagram/  { images/  scripts/ }
    ├── youtube/    { images/  scripts/ }
    ├── tiktok/     { images/  scripts/ }
    └── bluesky/    { images/  scripts/ }
```

Every leaf carries a `README.md` stating what belongs there. Git does not track empty
directories, so a file is required for the folder to exist at all — a README that names the
destination is more use than an empty `.gitkeep`.

**Two deliberate departures from the sketch, both mechanical:** `social media` and
`color templates` are hyphenated, because a space in a path breaks every shell command that
touches it; and `scripts to build them` is `scripts/`. Nothing else was changed.

## Open question the maintainer raised in the sketch, not yet decided

> *"(open: additional folders for video? or 'media' instead of 'images' for both)"*

`images/` is built as drawn. If short-form video becomes a per-platform deliverable — which
TikTok and YouTube make likely — the choice is a sibling `video/` folder per platform, or
renaming `images/` to `media/` and letting it hold both. Not decided here; the folders are
cheap to rename while they are empty.

## Where existing content lands — decided

Maintainer decision, 2026-08-02: **where existing content does not fit the rough guide,
decide it rather than leaving it unfiled** — the sketch was a guide, not a specification,
and refusing to classify anything without a one-to-one match recreates the ad-hoc filing
the structure exists to end.

| Currently | Files | Destination |
| --- | ---: | --- |
| `brand/favicon/` | 10 | `brand/digital/favicon/` |
| `brand/web/` | 5 | `brand/digital/web/` |
| `brand/social-icons/` | 7 | `brand/social-media/images/` |
| `…-type-shootout-contact-sheet.png` | 1 | `brand/graphic-standards/fonts/` |
| `fonts-manifest.json` | 1 | `brand/graphic-standards/fonts/` |
| `…-approved-card-standard.md` | 1 | `brand/graphic-standards/` |
| `…-design-tokens.css` | 1 | `brand/graphic-standards/` |

Three that needed a call rather than a match:

- **The design-tokens stylesheet carries both typefaces and palette**, so it sits at
  `graphic-standards/` root, above both subfolders, rather than being split into two files
  that must then be kept in sync — the duplication this reorganisation exists to remove.
- **`favicon/` and `web/` were not in the sketch**; they are screen assets, so they become
  children of `digital/` rather than staying loose at `brand/` root.
- **The approved card standard is a standard, not an asset**, so it sits with the other
  standards rather than with the cards it governs.

## The 14 builders

**Moved 2026-08-02 — this is done, not planned.** All 14 left `tools/brand/`, which is now
retired with zero files. Drafts live in `brand/working-builders/` while being iterated; an
approved builder sits beside the asset it produced. Every builder named its own output
directory, so no destination was guessed.

| Builder | Writes to | Now lives at |
| --- | --- | --- |
| `…-ep01-covers-builder.jsx` | `output/artwork/ep01-v2` | `episodes/ep01/art/builders/` |
| `…-ep01-exhibit-cards-builder.jsx` | `output/artwork/ep01-v2` | `episodes/ep01/art/builders/` |
| `…-ep03-cover-and-cast-builder.jsx` | `output/artwork/ep03` | `episodes/ep03/art/builders/` |
| `…-ep03-exhibit-cards-builder.jsx` | `output/artwork/ep03` | `episodes/ep03/art/builders/` |
| `…-ep02-ep03-covers-rebuild-builder.jsx` | `output/artwork/ep02-ep03-rebuild` | `episodes/builders/` — spans two episodes |
| `…-cast-personnel-cards-builder.jsx` | `output/artwork/cast-rebuild` | `podcast/builders/` — show-wide, built from the shared portraits |
| `…-favicon-derivation-builder.jsx` | `output/artwork/brand-favicon` | `brand/digital/favicon/builders/` |
| `…-readme-header-and-social-cards-builder.jsx` | `output/artwork/brand-web` | `brand/digital/web/builders/` |
| `…-wordmark-locked-builder.jsx` | `output/artwork/brand-wordmark` | `brand/digital/wordmarks/builders/` |
| `…-social-icons-builder.jsx` | `output/artwork/brand-social-icons` | `brand/social-media/images/builders/` |
| `…-type-shootout-builder.jsx` (Illustrator) | the contact sheet | `brand/graphic-standards/fonts/builders/` |
| `…-type-shootout-builder.jsx` (InDesign) | the contact sheet | `brand/graphic-standards/fonts/builders/` |
| `…-approved-card-system-builder.jsx` | the card standard | `brand/graphic-standards/builders/` |
| `…-approved-card-measurement.py` | **nothing — it measures** | `tooling/` — a tool, not a builder |

`…-ep01-covers-builder.jsx` is the one that produced the cover the maintainer approved and
told the rest of the system to match. It is tracked and unmodified since `a54befb`, and it
lands beside that cover.
