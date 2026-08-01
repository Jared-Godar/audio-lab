# Issue #164 — social links on the Coming Soon page

Executor spec, 2026-07-31. Everything decided; this is implementation.
Target file: `site/index.html` (single self-contained page, inline `<style>` and
`<script>`, no build step).

---

## 1. Decisions already made — do not re-open

| Question | Decision | Who |
| --- | --- | --- |
| Placement | **Header *and* footer** | maintainer, 2026-07-31 |
| Icon style | **Official brand marks, full colour** | maintainer, 2026-07-31 |
| Scope | All five now; Bluesky when claimed | maintainer, 2026-07-31 |

## 2. The links — all verified live 2026-07-31

| Platform | URL | Stable? |
| --- | --- | --- |
| X | `https://x.com/toldstraight` | yes |
| Instagram | `https://www.instagram.com/toldstraight/` | yes |
| YouTube | `https://www.youtube.com/@toldstraight` | yes |
| TikTok | `https://www.tiktok.com/@told.straight` | **NO — changes 2026-08-30** |
| Facebook | `https://www.facebook.com/profile.php?id=61592783817641` | **NO — numeric until a username is granted** |

Two of five are temporary. That is the single most important constraint on the
implementation and is why § 4 requires one source of truth rather than two copies.

## 3. Where the site already solves this problem — follow it

`site/index.html` renders the stamp date from a `GO_LIVE` constant, with static
values in the markup as the no-JS fallback, and this comment:

> *"…so the stamp and the countdown can never disagree. The static values are the
> no-JS fallback and must match GO_LIVE."*

**Use the same shape.** Do not invent a new pattern, and do not hand-maintain two
copies of the link list.

## 4. Structure

**Canonical markup lives in the FOOTER.** JS clones it into the header on load.

- No-JS: footer links work, header has none. Acceptable degradation — the links are
  supplementary, the email signup is the page's job.
- JS: both render, guaranteed identical.
- One edit site when TikTok and Facebook URLs change.

### Insertion points

**Footer** — `site/index.html` has:

```html
<footer>
  <span class="record">Told Straight &nbsp;·&nbsp; <a href="/privacy.html">Privacy Policy</a></span>
  <span class="record">Doc. TS&#8209;SITE&#8209;001 &nbsp;·&nbsp; Rev. 2026&#8209;07&#8209;31</span>
</footer>
```

`footer` is `display:flex; justify-content:space-between; flex-wrap:wrap`. Add the
social list as a **third flex child**. It will wrap cleanly on narrow viewports
because `flex-wrap` is already set.

**Header** — insert an empty container after `<div class="authority">…</div>` and
before `</header>`. JS fills it. Keep it empty in source so there is exactly one
place to edit.

## 5. Accessibility — non-negotiable

The page currently has **one** `aria-label` and **no focus styles at all**. Icon-only
links without accessible names are unusable by screen reader; this change must not
make that worse.

- Every link: an accessible name — `aria-label="Told Straight on X"` (etc.), or
  visually-hidden text inside the anchor.
- Wrap each group in `<nav aria-label="Social links">` (header) and
  `aria-label="Social links, footer"` — two landmarks with the same name is a
  reported failure.
- `target="_blank"` **and** `rel="noopener noreferrer"`.
- **Add a visible `:focus-visible` style** — 2px `--ts-red` outline with 2px offset
  is consistent with the system. The page has none today; this is the first
  keyboard-navigable cluster on it.
- Hit area ≥ 44 × 44 px including padding, even if the glyph is smaller.
- `<svg aria-hidden="true" focusable="false">` — the anchor carries the name, the
  glyph must not be announced twice.

## 6. THE DARK-THEME TRAP — read before sourcing icons

The page themes via `@media (prefers-color-scheme: dark)`, flipping `--ts-paper` to
`#14140F`.

**X's official mark is black. On the dark theme it becomes invisible.** The same
applies to any mark whose full-colour form is monochrome black.

Official brand kits ship a **reverse/white variant** for exactly this. The
implementation must swap marks by theme, not merely swap backgrounds:

```css
.social-icon .mark-dark { display: none; }
@media (prefers-color-scheme: dark) {
  .social-icon .mark-light { display: none; }
  .social-icon .mark-dark  { display: block; }
}
```

Check each of the five in **both** themes before calling it done. Instagram's
gradient and YouTube's red survive both; X is the certain failure and Facebook's
blue is the one to eyeball on dark.

## 7. Sourcing the marks — official only

Full colour was chosen deliberately, and it carries an obligation: each platform's
brand guidelines govern minimum size, clear space, and prohibit recolouring or
distorting the mark.

**Pull SVGs from each platform's own brand-resources page**, not a third-party icon
set and not a hand-redraw. Approximate logos violate the guidelines and read as
amateur at a glance.

Starting points (**verify — these URLs move**):

- X — `about.x.com` brand toolkit
- Meta (Facebook + Instagram) — `about.meta.com/brand/resources/`
- YouTube — `youtube.com/howyoutubeworks/resources/brand-resources/`
- TikTok — `tiktok.com/about/brand`

**Inline the SVGs.** The page is self-contained with no external requests; do not
introduce a CDN or an icon font.

Respect each kit's clear-space minimum. At the sizes involved (~24 px) several kits
specify a minimum below which the mark must not be used — if 24 px is under a
platform's stated floor, size up rather than shipping a non-compliant mark.

## 8. Acceptance criteria

- [ ] Links render in header **and** footer, from **one** source
- [ ] Official full-colour marks, inlined SVG, no external requests
- [ ] Accessible name on every link; `<svg aria-hidden="true">`
- [ ] Distinct `aria-label` on each of the two `<nav>` landmarks
- [ ] `rel="noopener noreferrer"` + `target="_blank"`
- [ ] Visible `:focus-visible` style (new to this page)
- [ ] **Verified in both light and dark** — X specifically
- [ ] Hit areas ≥ 44 px
- [ ] Mobile: five icons in the header do not crowd the wordmark or stamp
- [ ] Email signup remains the page's primary call to action, undisplaced
- [ ] CHANGELOG entry

## 9. Known follow-ups — do not fix here

- **2026-08-30**: TikTok handle changes to `toldstraight`; update the URL.
- **When granted**: Facebook Page username replaces the numeric URL. Facebook
  offered no username option anywhere as of 2026-07-31 (setup wizard, All tools,
  Page setup, About, Meta Business Suite all checked) — presumed eligibility gate.
- **Bluesky**: add when the account exists.

Both scheduled changes are recorded in
`docs/social-handle-availability-and-registration.md` §§ F.1 and 6.1.
