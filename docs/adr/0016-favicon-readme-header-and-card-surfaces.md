# ADR 0016 — The favicon set, README header, and social/OG cards are decided, and only two of them theme-switch

- **Number:** 0016
- **Title:** The favicon set, README header, and social/OG cards are decided, and only two of
  them theme-switch
- **Status:** accepted
- **Date:** 2026-07-28
- **Source:** issue #60, comments "Favicon set DECIDED, 2026-07-28 — frameless at 32px and below,
  framed at 180 and above", "README header and GitHub social preview DECIDED, 2026-07-28 — and
  ADR 0015 is CONFIRMED, not amended", and "Dark variants DECIDED, 2026-07-28 — and the scope is
  two surfaces, not a sweep"

## Context

Issue #60's re-scope proactively designed favicon, README-header, and social/OG-card surfaces
for the eventual static site (§4 items 1 and 4), following [ADR 0015](0015-wordmark-dual-lockup-system.md)'s
dual-lockup system and its M1 compact mark. The maintainer judged the exported PNGs at true pixel
size (not magnified boards — magnification settles shape but never legibility) for the favicon
set, and both one-line and stacked treatments rendered at platform-exact dimensions for the
header and card surfaces, specifically so ADR 0015's surface assignment was previewed rather than
assumed. A prior loop comment had suggested a dark OG card could be "picked per-context later,"
which the maintainer's own follow-up question forced a correction of: Open Graph and GitHub's
social preview both serve exactly one image with no theme negotiation, so a dark variant is an
*alternative*, never a *companion*.

## Decision

**1. Favicon set — frameless at 32px and below, framed at 180px and above, all derivations
fills-only.** The maintainer, after viewing the true-pixel-size exports: *"Agree. 32 frameless."*
The frame costs 6px of content width in both dimensions on a 32px canvas and wins the competition
for pixels, reading as a border first and a mark second; frameless gives the `TS` visibly more
room and lets the red bar register as a deliberate element. All derivations are fills-only — no
`strokeWidth` anywhere — because the 900pt master's 14pt stroke measures 0.25px at favicon size
and vanishes.

**2. README header — variant B, one-line, 1280×400, with the season line, plus a dark twin.**
Recorded from the loop: *"README header | **B — one-line, with the season line** | 1280 × 400."*
Reasoning: a banner should spend the width it has — one-line sets at 150pt against the stacked
alternatives' 128pt — and the season line does real work: a visitor landing on the repo learns
what the show is about without reading further. Considered against stacked alternatives (headers
C/D), which would cost 100–200px of vertical scroll to show a *smaller* name.

**3. GitHub social preview stacked at 1280×640; OG card stacked at 1200×630; the dark OG board is
a documented alternative, not a companion.** The maintainer: *"I like the dark variants - lets
keep them for platforms with light and dark themes. Should we revisit dark alternates of
previously landed artifacts?"* — and in the same message, *"OG card = stacked (07)"*, matching
the GitHub pick. The stacked wordmark sets at 190pt against the one-line's 132pt — 44% larger on
the surface seen smallest (a shared link renders at roughly 300px wide in a feed or chat, where
that difference is legibility, not preference). His framing on why the header and the social
preview are allowed to differ, which must be quoted because a future session will otherwise read
the difference as drift and try to unify them: **"Header and social preview do not need to be the
same visual object."**

**4. Only two surfaces theme-switch: the README header (`<picture>` + `prefers-color-scheme`) and
the favicon set (`<link rel="icon" media=…>`).** Measured against the mechanism, not assumed:

| Artifact | Switchable | Mechanism |
| --- | --- | --- |
| README header | Yes | GitHub honours `<picture>` + `prefers-color-scheme` in README markdown |
| Favicon set | Yes | `<link rel="icon" media="(prefers-color-scheme: dark)">` |
| GitHub social preview | No | Repo setting takes one image |
| OG card | No | `og:image` is one URL; the protocol carries no theme signal |
| Podcast cover, chapter art, exhibit cards | No | Podcast/player apps take one image |
| Site UI | N/A | CSS tokens already handle it — `brand/*-design-tokens.css` has a dark block |

GitHub's own preservation of `<picture>` + `prefers-color-scheme` in rendered README markdown was
flagged UNVERIFIED in this repository at decision time — documented GitHub behaviour, never
rendered here. The executor spec for issue #79 required proving it empirically rather than
shipping on the strength of documentation.

**Step 6 result (issue #79 executor spec): PROVEN.** Control run against `main`
(`gh api repos/Jared-Godar/audio-lab/readme?ref=main -H "Accept: application/vnd.github.html"`)
returned `<picture` count `0` and `<img>` count `2` — confirming the command itself works before
trusting its result. The same command against `task/issue-79-brand-deliverables` returned
`<picture` count `1`, the string `prefers-color-scheme: dark)` present and attached to the
`<source>` element's `media` attribute, and `<img>` count `3` (the two CI badges plus the header
image). GitHub wraps the element in its own `<themed-picture>` custom element but leaves the
`<picture>` / `<source media="…">` / `<img>` structure intact and unmodified. GitHub's markdown
sanitizer preserves `<picture>` + `prefers-color-scheme` in this repository. The `<picture>`
markup in `README.md` ships as specified; no fallback was needed. The visual half — toggling
GitHub's theme and confirming the swap renders correctly — remains the maintainer's check, not
claimed here.

`#B02A28` on `#14140F` measures **2.82:1** — the load-bearing reason the dark variants use
`#E4564F` (5.05:1) instead. This is a measurement, not a preference: a future session "restoring
brand accuracy" by reverting the dark rule/bar colour to the print red would fail WCAG AA for
body and large text alike.

## Consequences

**Constrains M5.** The favicon derivation builder and the README-header-and-social-cards builder
(both promoted to `tools/brand/` by this same PR) are now the reproducible source of every
favicon, header, and card asset; regenerating any of them re-runs the builder rather than
re-deriving dimensions or colours by hand. The theme-switch table above is the reference for any
future surface asking "should this have a dark variant" — the answer is mechanical (does the
delivery protocol carry a theme signal?), not a case-by-case design call. The per-episode OG card
(a template-plus-data-merge job) and the eleven static-site elements from #60's re-scope §4 stay
out of scope, deferred to when the site exists.

## Reversal condition

**Favicon frame.** If the boxed silhouette should be the recognizable shape at *every* size — a
legitimate brand-consistency argument — framed wins at 32px, and the fix is to size the `TS` down
rather than fight the frame for pixels. Verbatim from #60's favicon-decision comment.

**Everything else in this ADR:** Not recorded at decision time.
