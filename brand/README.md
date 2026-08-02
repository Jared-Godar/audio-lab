# brand/

The one home for identity. Structure drawn by the maintainer in
[#176](https://github.com/Jared-Godar/audio-lab/issues/176) and **built** rather than
described, by his decision of 2026-08-02:

> "Build as I described - mkdir/touch stubs even if empty. Once I unfuck enough bullshit to
> make these I want a clear destination for them to land witout you stuffing them wherever
> the fuck suits you and muddying up the file structure all over again"

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

## Existing content is NOT yet filed into this structure

The folders below hold real assets today and sit outside the tree above. **Nothing has been
moved.** Where each lands is a mapping decision that has not been made, and guessing at it
is the exact failure the structure exists to prevent.

| Currently | Files | Awaiting a destination |
| --- | ---: | --- |
| `brand/favicon/` | 10 | likely `digital/` |
| `brand/social-icons/` | 7 | likely `social-media/images/` |
| `brand/web/` | 5 | likely `digital/` |
| `brand/20260727-…-type-shootout-contact-sheet.png` | 1 | likely `graphic-standards/fonts/` |
| `brand/20260727-toldstraight-design-tokens.css` | 1 | spans both `fonts/` and `color-templates/` |
| `brand/20260801-toldstraight-approved-card-standard.md` | 1 | likely `graphic-standards/` |
| `brand/fonts-manifest.json` | 1 | likely `graphic-standards/fonts/` |
| `tools/brand/` (14 builders) | 14 | a `builders/` home, not yet in the sketch |

The design tokens file and the builders are the two that genuinely do not fit the sketch as
drawn — the tokens file carries both typefaces and palette, and the sketch places build
scripts only inside `social-media/`, while these builders produce episode art, favicons and
wordmarks. Both need the maintainer's call.
