# Social handles — availability research and registration runbook

Measured 2026-07-31 for issue #111. Two documents in one: **how availability was
checked** (method, controls, and what the answers do *not* prove), and **the runbook
the maintainer follows to register**. Registration itself is not agent work — the
issue assigns signups to the maintainer, and AGENTS.md § "Hold for the maintainer"
covers outward-facing actions regardless.

---

## 1. What these checks prove, and what they do not

This is the load-bearing caveat. Read it before the results table.

Every checker below distinguishes exactly two states:

| State | What was observed |
| --- | --- |
| **taken** | a public profile resolves at that handle |
| **no-profile** | no public profile resolves at that handle |

`no-profile` is **not** the same as **registrable**. A handle with no public profile
can still be unavailable at signup because it is:

- **suspended** or banned (the profile is gone; the name is not released),
- **deactivated** by its owner (recoverable, still held),
- **platform-reserved** (trademark, safety, or system word lists — never surfaced
  publicly),
- **held but private/restricted**, which Facebook in particular renders identically
  to nonexistent (its own message conflates "deleted", "audience-restricted", and
  "never existed" — see § 2.5).

**The only authoritative check is the platform's own username picker at signup**,
which validates registrability directly and requires being logged in — i.e. the
maintainer, at registration time. Nothing in § 3 is a substitute for that.

So: the results table says *no one is publicly using these handles*. It does **not**
say *these handles are yours to take*. Treat § 3 as "no known blocker; confirm in the
picker," never as "verified free."

## 2. Method, per platform

Each platform needed a **different signal** — and on two of them the obvious signal
is silently wrong. Every reported result ran a **known-positive and a known-negative
through the identical code path**, interleaved through the sweep rather than once up
front (conduct rule 1; the trap is § 2.7).

### 2.1 The first attempt was wrong on 3 of 5 platforms

HTTP status code on the profile URL, logged out:

| Platform | `nasa` (known-taken) | `zzqx9nope…` (known-free) | verdict |
| --- | --- | --- | --- |
| YouTube | 200 | 404 | separates — usable |
| X | 200 | 404 | separates — usable |
| TikTok | 200 | 200 | **broken** — bot wall |
| Instagram | 200 | 200 | **broken** — login wall |
| Facebook | 200 | 200 | **broken** — login wall |

Without the known-negative control, all three broken checkers would have reported
every candidate as "available." That is the `domain-availability-research.md` failure
repeating on a different service.

### 2.2 YouTube — HTTP status (works)

```bash
curl -sL -o /dev/null -w "%{http_code}" "https://www.youtube.com/@HANDLE"
# 200 = taken, 404 = no-profile
```

### 2.3 X — HTTP status (works)

```bash
curl -sL -o /dev/null -w "%{http_code}" "https://x.com/HANDLE"
# 200 = taken, 404 = no-profile
```

### 2.4 TikTok — oEmbed API, not the profile page (works, no login)

The profile page is bot-walled, but the public oEmbed endpoint is not:

```bash
curl -s "https://www.tiktok.com/oembed?url=https://www.tiktok.com/@HANDLE"
# taken     -> {"version":"1.0",...,"author_name":"NASA",...}
# no-profile-> {"message":"Something went wrong","code":400}
```

### 2.5 Instagram — `og:title`, not the status code (works, no login)

Instagram returns **200 for both** states, so status is useless. The server-rendered
HTML separates: a real profile carries an `og:title`; a missing one returns a bare
`<title>Instagram` (and, in a browser, renders "Profile isn't available").

```bash
curl -sL "https://www.instagram.com/HANDLE/" | grep -q 'og:title" content="[^"]*Instagram photos and videos'
# match = taken ; no match (bare <title>Instagram) = no-profile
```

Confirmed independently in Chrome, logged out: `@nasa` → title
`NASA (@nasa) • Instagram photos and videos`; nonexistent → `Profile isn't available
• Instagram`. **No Instagram login is required for this check.**

### 2.6 Facebook — three-state `<title>` classifier (works, no login)

Facebook needed three states, not two, because a **known-taken** page returns a
non-informative title:

| Handle | `<title>` | truth |
| --- | --- | --- |
| `NASA` | `NASA - National Aeronautics and Space Administration` | taken |
| `bbcnews` | `BBC News \| London` | taken |
| `cocacola` | `Redirecting...` | **taken, but the title says nothing** |
| `zzqx9nopehandle77231` | `Facebook` | no-profile |
| `qqwzvnothinghere4412` | `Facebook` | no-profile |
| `xkjrmnoaccount9987` | `Facebook` | no-profile |

So the rule is: **exactly `<title>Facebook` → no-profile; `Redirecting...` → unclear,
escalate to a browser; anything else → taken.** Reading "not `Facebook`" as "taken"
would have been correct here purely by luck — `cocacola` is in fact taken — and that
is the reasoning the domain doc exists to forbid.

Browser confirmation, logged out: `facebook.com/NASA` renders the real page;
`facebook.com/zzqx9nope…` renders "This content isn't available right now" — a
message that, by Facebook's own wording, also covers deleted and audience-restricted
pages. Facebook's `no-profile` is therefore the **weakest** signal in this document.

### 2.7 The interleaved control caught a live failure

Mid-sweep, the Facebook known-positive (`NASA`) returned an **empty title** — a
transient block, not a change in reality. The two candidate results in that block
(`toldstraightcast`, `told.straight`) were **discarded and re-run** against fresh
controls, which passed. Had the control been run once up front, those two would have
been reported as findings.

This is the `last.fm` rate-limiting trap from `domain-availability-research.md`,
reproduced on a different service. Any availability checker needs a known-positive
running through the same path *throughout* the sweep.

### 2.8 Bluesky — `resolveHandle` API (works)

```bash
curl -s "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=HANDLE"
# taken      -> {"did":"did:plc:..."}
# no-profile -> {"error":"InvalidRequest","message":"Unable to resolve handle"}
```

Control: `bsky.app` → `did:plc:z72i7hdynmk6r22z27h6tvur`; nonexistent → error.

## 3. Results

> **Measured 2026-07-31. This is a race — re-check in the platform's own username
> picker immediately before registering, and read § 1: `no-profile` means no public
> profile resolves, not that the handle is registrable.**

Every row below was recorded with its interleaved control passing.

| Handle | len | YouTube | X | TikTok | Instagram | Facebook |
| --- | --- | --- | --- | --- | --- | --- |
| `toldstraight` | 12 | no-profile | no-profile | no-profile | no-profile | no-profile |
| `toldstraightpod` | 15 | no-profile | no-profile | no-profile | no-profile | no-profile |
| `toldstraightfm` | 14 | no-profile | no-profile | no-profile | no-profile | no-profile |
| `thetoldstraight` | 15 | no-profile | no-profile | no-profile | no-profile | no-profile |
| `toldstraighthq` | 14 | no-profile | no-profile | no-profile | no-profile | no-profile |
| `toldstraightshow` | 16 | no-profile | **ineligible** | no-profile | no-profile | no-profile |
| `toldstraightcast` | 16 | no-profile | **ineligible** | no-profile | no-profile | no-profile |
| `told_straight` | 13 | no-profile | no-profile | no-profile | no-profile | n/a |
| `told.straight` | 13 | no-profile | n/a | no-profile | no-profile | no-profile |

**Bluesky:** `toldstraight.bsky.social`, `toldstraightpod.bsky.social`, and
`toldstraight.com` (as a self-hosted handle) all resolve to nothing — control passed.

**No candidate was found taken on any platform.** That is an unusually clean result
and, per § 1, is exactly the kind of answer to distrust until the signup picker
confirms it.

### Handle rules that constrain the choice

Measured against the platforms' own help pages, read 2026-07-31:

- **X** — *"must be more than 4 characters long and can be up to 15 characters or
  less… can contain only letters, numbers, and underscores"*
  (`help.x.com/en/managing-your-account/change-x-handle`). **This is the binding
  constraint**, and it is what marks the two 16-character candidates ineligible.
- **YouTube** — 3–30 characters; letters or numbers, plus `_` `-` `.` (not at the
  beginning or end); not case-sensitive
  (`support.google.com/youtube/answer/11585688`). Note YouTube explicitly *"reserves
  the right to change, reclaim, or remove a handle at any time"* and forbids handle
  sale or transfer.
- **Instagram, TikTok, Facebook** — character limits **not independently verified**
  in this session (their help pages did not return readable text through the tooling
  used). The recommendation below does not depend on them: a 12-character,
  lowercase-`a`–`z`-only string with no separators satisfies the strictest rule
  actually measured, so any platform at least as permissive as X accepts it.

## 4. Decision

> **Decided by the maintainer, 2026-07-31: `toldstraight` across the board.** The
> fallbacks below are retained only as the record of what was considered and why —
> they are not in play unless a signup picker rejects the primary.
>
> Re-verified live at **2026-07-31 14:25 UTC**, all controls passing: `toldstraight`
> shows no public profile on any of the six surfaces. Still subject to § 1 — the
> signup picker remains the authoritative check.

**Primary: `toldstraight`** — identical on all six surfaces:

| | |
| --- | --- |
| YouTube | `youtube.com/@toldstraight` |
| X | `x.com/toldstraight` |
| TikTok | `tiktok.com/@toldstraight` |
| Instagram | `instagram.com/toldstraight` |
| Facebook | `facebook.com/toldstraight` |
| Bluesky | `@toldstraight.com` (self-hosted via the domain we already own) |

Why: 12 characters of lowercase letters only, so it clears X's 15-character
alphanumeric cap with room and needs no separator that differs per platform; it
matches the registered domain exactly, so the handle *is* the brand with nothing to
explain; and it is the only candidate that is legal and unused on every surface.

**Fallbacks, in order** — all X-legal, so consistency survives:

1. `toldstraightpod` (15 — **may be ineligible on X**; see the help-page contradiction
   in § 5.1.1. Treat as unusable until a signup picker says otherwise.)
2. `toldstraightfm` (14 — matches the `toldstraight.fm` domain already selected)
3. `thetoldstraight` (15)
4. `toldstraighthq` (14)

`toldstraightshow` and `toldstraightcast` are **declined**: at 16 characters they
cannot exist on X, so adopting either means a different handle on X than everywhere
else — which defeats the "consistent handle" requirement in #111.

**Bluesky is worth reserving** as the sixth surface: the `@toldstraight.com`
self-hosted handle costs nothing beyond a DNS record on a domain we already control.
The maintainer decides whether it is in scope for #111 or a follow-up.

**Threads** does not need a separate registration decision — it uses the Instagram
username. Registering Instagram is understood to reserve it; **confirm this in the
Threads signup rather than assuming it**, since it was not verified here.

## 5. Registration runbook (maintainer)

Everything in this section is the maintainer's to perform. The agent's contribution
is the research above and the prepared copy below.

### 5.0 X — measured 2026-07-31, and the documentation is wrong

Recorded from a live attempt, because both of these cost time to rediscover.

**X's web signup no longer exists as documented.** `help.x.com/en/using-x/create-x-account`
says to *"Go to X.com/signup"*, *"Click the sign up button"*, and that a *"Create your
account pop up box will appear"*. None of that is true as of 2026-07-31:
`x.com/signup` **redirects** to `x.com/i/jf/onboarding/web?mode=signup`, a chooser
offering only **Continue with phone**, **Continue with Google**, **Continue with
Apple**, and a field labelled *"Email or username"* — which is a **sign-in** field, not
a registration one. Entering an unregistered address returns *"This email or username
is not registered yet"* and then a **"Get the app to finish signing up"** wall with an
app-store QR code.

So the practical paths are: the **X mobile app** (email signup, no OAuth coupling —
preferred, since it keeps the password in 1Password), or Google/Apple SSO (couples the
account to another identity), or phone.

Useful detail from the same help page, since it bears on the no-SMS decision: *"You can
also request a voice call to verify your phone number."* A voice-capable number that
cannot receive SMS may still clear X's verification.

#### 5.1.1 Two X help pages disagree about the handle length limit

| Page | Wording |
| --- | --- |
| `managing-your-account/change-x-handle` | *"can be up to 15 characters or less"* |
| `using-x/create-x-account` | *"must be fewer than 15 characters in length"* |

These are not the same rule: the first admits a 15-character handle, the second
excludes it. **`toldstraight` is 12 characters and is safe under either reading** — the
decision is unaffected. But the first fallback, `toldstraightpod`, is exactly 15 and is
therefore **of unknown validity on X**; it is marked accordingly in § 4.

The second page adds a constraint the first omits entirely: usernames *"cannot contain
'admin' or 'X', in order to avoid brand confusion."* `toldstraight` contains neither.
Any future handle candidate must be checked against this rule as well as the length —
and, given the contradiction, the signup picker remains the only authority (§ 1).

### 5.1 Order

Register in one sitting if possible. If staged, go **X → Instagram → TikTok →
YouTube → Facebook → Bluesky**: X and Instagram carry the highest squatting traffic
and the least forgiving reclaim process, and Instagram also fixes the Threads handle.

### 5.2 Decisions on record

All three were open questions when this doc first landed. The maintainer settled them
on **2026-07-31**; they are recorded here rather than left as prompts.

1. **Recovery address — `social@toldstraight.com`.** Created on iCloud+ Custom Email
   Domain and live as of 2026-07-31. Used as the recovery address on all six accounts
   and wherever registration asks for a contact address, in preference to `hello@`
   (public-facing) or `jared@` (personal).

   **Measured 2026-07-31 in the iCloud+ Custom Email Domain panel: "Using 3 of 3
   email addresses."** The three are `jared@`, `hello@` and `social@`.

   That changes the character of ADR 0011's reversal condition. The ADR wrote it
   as *"wanting more than roughly three addresses"* — a judgement call with implied
   slack. It is in fact a **hard platform cap of three, now fully consumed**. A
   fourth address is not "approaching" the boundary; it is **impossible without
   changing mail platform**.

   So anything that would need one — `press@`, a newsletter sending address, a
   per-platform recovery alias — does not approach ADR 0011's reversal condition,
   it **triggers** it. Recorded precisely because a future session reading
   "roughly three" would reasonably assume there is room, and there is none.
   ADR 0011 should be annotated with this measurement.

2. **2FA — TOTP stored in 1Password. No SMS on any account.** SIM-swap is the standard
   takeover route for brand accounts, and several of these platforms will accept an
   SMS-only recovery to reset a password, which makes a phone number a bypass of the
   very factor it appears to add. Where a platform *forces* a phone number for signup,
   the goal is to add TOTP and then remove SMS as a *login factor* — and if a platform
   refuses to let SMS be removed, record that as an accepted risk with the reason
   rather than leaving it unremarked.

3. **Credentials — 1Password, CLI-first (`op`).** Never this repository, never a file
   in it, never a shell variable. The repo records the item title only — see § 5.5.

### 5.2.1 What the agent cannot do here

Stated plainly so the division of labour in a live walkthrough is not ambiguous:
**creating accounts and entering passwords or 2FA codes into a site are actions the
agent does not perform**, under any authorization. In a live session the agent
navigates, reads page state back, re-runs the § 2 checkers, and confirms what the
platform actually accepted; the maintainer performs every signup, password entry, and
TOTP capture. That split is not a limitation of this runbook — it is the runbook.

### 5.2.2 Phone numbers — the two jobs are not the same job

Raised by the maintainer 2026-07-31, when X's signup demanded a phone: *is a Google
Voice number worth generating for the social registrations and the site?*

The answer splits, because the two uses want opposite properties:

- **Passing signup verification.** Platforms routinely reject **VoIP** numbers
  (Google Voice included) for verification. This is widely reported and consistent
  with how anti-abuse systems are designed, but it was **not measured per-platform
  here** — treat it as a strong prior, not a finding. One measured detail cuts the
  other way for X specifically: its help page states *"You can also request a voice
  call to verify your phone number,"* and Google Voice receives calls. A voice-capable
  VoIP number may clear a platform whose SMS path rejects it.
- **A public contact number on the site.** Here Google Voice is the *right* tool
  precisely because it is disposable and screenable — publishable without exposing a
  personal number.

**The dependency trap:** do not host the brand's Google Voice number on the **same
Google account** that owns the YouTube channel. That builds a loop in which
compromising one Google account yields both the channel and the number used to recover
everything else.

**Recommended path, which does not block registration:** verify with a real mobile
number where a platform forces it, enable TOTP immediately, then remove the phone as a
**login factor**. The number becomes a transient signup artifact rather than a standing
second factor — which is most of what the no-SMS decision was protecting. If a
dedicated number that platforms reliably accept is wanted later, a **prepaid eSIM**
(carrier-grade, roughly $5–15/month) serves that better than Google Voice; the free
option is the wrong economy for this particular job.

### 5.3 Copy to use

**Display name (all platforms):** `Told Straight`

**Bio — short. 134 chars. MEASURED limits: Instagram 150, X 160 (both from the
platforms' own UI/help). Fits X, Instagram, YouTube, Bluesky — NOT TikTok:**

```text
One complicated subject. Covered properly. Bottom line up front. Every claim sourced. Dark humor. No woo. No BS. Season 1: Adult ADHD.
```

**Bio — TikTok short form. 79 chars.** TikTok's limit is far tighter than the
others (commonly cited as 80; **not independently verified** — read the counter in
the form, as Instagram's 150 was). The season line is kept in preference to the
opening clause: the topic is what converts a visitor, the framing is not.

```text
Bottom line up front. Every claim sourced. No woo. No BS. Season 1: Adult ADHD.
```

**Bio — long. 458 chars. YouTube only** (limit 1000). Facebook Intro and Bluesky
cap near 255 — use the medium form above, not this one:

```text
A season-per-topic podcast that takes one complicated subject and covers it properly.

Bottom line up front. Every claim sourced to peer-reviewed literature. Dark humor. No woo. No BS.

It exists because "do your own research" now mostly means hunting for agreement in a narrow echo chamber, with no real intention of changing your mind.

This is the opposite of that. Done out loud. With receipts.

Season 1 is Adult ADHD. (Orientation, not medical advice.)
```

Both are derived from the README's own description of the show, not newly invented.

**Link on every profile:** `https://toldstraight.com`

> The site is a Coming Soon page at time of writing (#128, go-live 2026-08-06 per
> ADR 0019). Linking it from day one is still right — it is where a squatter-check
> visitor lands, and it collects signups.

**Bio — medium. 242 chars.** For **Facebook Intro** and **Bluesky**, both of which
cap around 255. Keeps the "do your own research" thesis *and* the medical-advice
disclaimer — the two things the long form has that the short form cannot carry.

```text
One subject a season, covered properly. Bottom line up front. Every claim sourced. No woo. No BS. Because "do your own research" now mostly means hunting for agreement in an echo chamber. Season 1: Adult ADHD. Orientation, not medical advice.
```

> **Why the medium form drops "Dark humor."** At 255 characters you can keep either
> that phrase or the full `"do your own research"` quote — not both, and not with
> the medical-advice disclaimer as well. "Dark humor" survives in the 79- and
> 134-char forms, which are the most-seen surfaces; the research critique is the
> show's differentiator and only has room to exist in the medium and long forms.
> Shortening the quote to `"research"` was rejected — it breaks the reference that
> makes the line land.

**Four lengths exist, and they are not interchangeable.** Measured against each
platform's own counter or stated limit:

| Form | Chars | Fits |
| --- | --- | --- |
| TikTok short | 79 | TikTok (~80) |
| Standard | 134 | X (160), Instagram (150) |
| Medium | 242 | Facebook Intro, Bluesky (~255) |
| Long | 458 | YouTube (1000) |

### 5.4 Profile art

**Avatar — variant A (ring), approved 2026-07-31.** Built by
`tools/brand/20260731-adobe-illustrator-toldstraight-x-avatar-builder.jsx`; upload the
**square 1000×1000 master**
(`…-x-avatar-a-ring-1000.png`), never a crop preview — every one of these platforms
applies its own circular mask, and a pre-cropped circle gets masked twice and picks up
a halo.

**Why the favicon was not reused.** The obvious candidate,
`brand/favicon/…-favicon-512-maskable.png`, is the wrong asset for this slot, and the
reason is geometric rather than aesthetic. A circular crop is the **inscribed circle**,
radius `S/2`. A square frame inset by `i` has its outer corner at `√2 × (S/2 − i)`,
which survives only if

```text
i  >=  (S/2)(1 − 1/√2)  =  0.1464 × S        (14.64%)
```

The 512 maskable uses inset 51 = **9.96%**, and needs 75 — short by 24px, so its frame
corners are clipped. That file is not defective; it was built for a **square** favicon
slot. "Maskable" protects the PWA *content* safe zone; it never promised a full-bleed
frame's corners would survive a circular mask. A **ring has no corners**, needs no such
inset, and can therefore carry a larger mark than any square-framed version — which is
what variant A is.

Three treatments were built and judged at **true 48px** (X's timeline size): A ring,
B square-frame re-inset to 16%, C frameless. Raw legibility ranks **C > A > B**, but A
was chosen because it keeps M1's ruled-container identity while being native to the
crop — at 48px, C is just two letters. B reads as a square dropped into a circle.

The builder measures the type by **outlining it** and reading the resulting paths'
bounds (`cap/em 0.736` verified), because `geometricBounds` on live text returns the
em/leading box, not the ink — two earlier revisions put the red bar through the letters
and then well below the baseline before that was understood. It also prints a
**PASS/FAIL fit check per board**, computed from the same numbers that drew the artwork.

**RESOLVED — YouTube's crop is fine; the preview was lying.** At upload, YouTube's
dialog preview showed the ring's left/right edges apparently clipped, and a
hypothesis was recorded that its default crop box might be tighter than the
inscribed circle. **That hypothesis is falsified.** The live channel renders the
ring complete and uncropped at `ringR: 460`. The dialog preview is simply not a
faithful render — judge avatars on the live profile, never on an upload preview.
No builder change is needed for YouTube.

Variant A should serve **every** platform here — X, Instagram, YouTube, Facebook Pages
and Bluesky all crop avatars circular — but confirm per platform at upload rather than
assuming.

**MEASURED platform art specs** (read from each platform's own uploader, per the
order in this section — not from memory or a blog post):

| Platform | Banner / cover | Avatar | Source |
| --- | --- | --- | --- |
| X | **1500 × 500** | 400 × 400 | help.x.com, 2026-07-31 |
| YouTube | **at least 2048 × 1152**, ≤6 MB | ≥98 × 98, ≤4 MB, PNG/GIF | Studio → Customisation, 2026-07-31 |
| Instagram | *no cover image exists* | — | "Banners" is profile-linking, not art |

Two YouTube constraints worth carrying into the builder: **handle changes are
limited to twice per 14 days** (previous handle held 14 days), and **name changes
twice in 14 days**. Get both right the first time.

**YouTube's banner is the hard one and is deliberately deferred.** 2048 × 1152 is
16:9, but YouTube renders wildly different crops per device — TV shows the full
frame, desktop a wide band, mobile a narrow strip — so a single safe area governs
it. Those crop bounds are **not yet measured**; measure them the way X's were
(upload, screenshot the live surface, solve the scale) rather than trusting a
published figure.

**Banners / cover images — this is a genuine gap, not an oversight.** The repo's
widest brand assets are the 1200×630 OG cards and the 1280×400 README headers in
`brand/web/`, and none of them match the header aspect ratios these platforms use (X,
YouTube, and Facebook each want a different one). Rather than stretch an asset built
for a different frame:

1. **Record** the required pixel dimensions **from each platform's own uploader**
   during registration, into this doc. They are stated in the UI and change without
   notice, so a figure written down in advance would go stale silently — but a figure
   *read from the live uploader and dated* is a measurement.
2. **Then** author a banner builder in `tools/brand/` against those recorded numbers,
   per the established workflow: the agent **authors the Illustrator JSX**, the
   maintainer runs it where the licensed faces are installed. The agent does not
   render or commit brand PNGs it produced itself.

The order matters and is easy to get backwards: the builder cannot be written before
step 1, because it has no target frame until the uploader states one.

Launching with an avatar and no banner is fine and reversible. Launching with a
distorted banner is the kind of thing that ends up in a screenshot.

Note also that the Coming Soon assets referenced by ADR 0019 currently live in
`artifacts/coming-soon-prototype/`, which is **gitignored** — they land with #128 and
are not available to a fresh clone until then.

### 5.5 Credentials — 1Password (`op`), and the one thing not to do with it

Verified against **`op` 2.38.1** on this machine, signed in to `my.1password.com`.
Every command below was read from `op`'s own help output, not recalled.

**Create the item, letting 1Password generate the password.** The password is never
typed, never displayed, and never enters a shell argument:

```fish
op item create --category=login \
  --title 'Told Straight — X' \
  --vault 'Told Straight' \
  --url 'https://x.com/' \
  --generate-password='letters,digits,symbols,32' \
  username=social@toldstraight.com
```

Add `--dry-run` first to preview the resulting item without writing it.

**Retrieve a login code at sign-in time:**

```fish
op item get 'Told Straight — X' --otp
op read "op://Told Straight/Told Straight — X/one-time password?attribute=otp"
```

#### Password length caps differ per platform — 32 is not universally safe

`op`'s default generated password is **32 characters**, and **TikTok rejects it**:
its signup form states *"8 to 20 characters"* (measured 2026-07-31 from the live
form). The item was regenerated with

```fish
op item edit 'Told Straight — TikTok' --generate-password='letters,digits,symbols,20'
```

Expect this again. Verify a regenerated length **without printing the value** —
pipe it to `wc -c`, never to stdout:

```fish
op item get '<title>' --fields label=password --reveal | tr -d '\n' | wc -c
```

and hand it over via `pbcopy` rather than the terminal. A password read aloud into
a transcript is a password that has to be rotated.

#### Do not put the TOTP seed on the command line

`op` supports an `[otp]` assignment —
`'Section.Field[otp]=otpauth://totp/…?secret=…'` — and **this runbook declines to use
it.** `op item create --help` carries the reason in its own words: *"Command arguments
get logged in your command history, and can be visible to other processes on your
machine."* A TOTP seed is a permanent second factor; putting it in shell history
undoes the reason for choosing TOTP over SMS in the first place. The documented
alternative — a JSON template file — trades shell history for a plaintext seed on
disk, so it is no better here.

**Instead, capture the TOTP in the 1Password app or browser extension** at the moment
the platform shows its QR code during 2FA setup: scan or "copy setup key" straight
into the item's one-time-password field. The seed goes from the platform to 1Password
without passing through a terminal, a file, or an agent's context.

Retrieval by CLI afterwards (`op item get … --otp`) is fine and is the intended
day-to-day path — reading a rotating 6-digit code is not the same exposure as writing
the seed that generates them.

### 5.6 After registering — record, don't store

In the repo, record only:

- the handle actually obtained per platform (if any fallback was needed, and why),
- the recovery address used,
- the 2FA method per account, and any platform that refused to let SMS be removed,
- **the 1Password item title** holding the credentials — never the credentials, never
  a recovery code, never a TOTP seed.

Then re-run § 2's checkers against the registered handles: they should now report
**taken**. That is the negative test that the registration actually took effect —
a signup form that appeared to succeed is not a result.

## 6. What is still owed on #111

This document delivers the first acceptance criterion and prepares the rest. Open:

| Acceptance criterion | Status |
| --- | --- |
| Handle-availability research + chosen consistent handle | **done** (§ 3, § 4) |
| Handle decision, recovery address, 2FA method, credential store | **done** (§ 4, § 5.2) |
| Accounts registered on the five platforms | **owed — maintainer** |
| X bio second-pass — X still shows the pre-standardization wording | **owed** |
| Spelling sweep — repo is British "humour", bios are now US "humor" | **owed, undecided** |
| Profile art applied from the brand suite | **owed** — avatar ready; banners sequenced in § 5.4 |
| Credentials in 1Password, item titles recorded | **owed — maintainer** (§ 5.5, § 5.6) |
| CHANGELOG entry | done with this change |

Issue #111 was closed on merge of the research PR. The execution half is tracked in
**#154**, which carries the owed rows above.

## 7. Decision log

| Date | Decision | Where it binds |
| --- | --- | --- |
| 2026-07-31 | Handle is `toldstraight` on all six surfaces; fallbacks retired to record-only | § 4 |
| 2026-07-31 | Recovery address is `social@toldstraight.com` (live on iCloud+); spends ADR 0011's third and last slot | § 5.2 |
| 2026-07-31 | 2FA is TOTP in 1Password; no SMS as a login factor on any account | § 5.2 |
| 2026-07-31 | Credentials live in 1Password, CLI-first (`op` 2.38.1); the repo records item titles only | § 5.5 |
| 2026-07-31 | TOTP seeds are captured in the 1Password app, never via an `op` command-line assignment | § 5.5 |
| 2026-07-31 | Google Voice is declined for signup verification (VoIP), accepted for a public site contact number; never hosted on the YouTube Google account | § 5.2.2 |
| 2026-07-31 | Where a platform forces a phone, verify then remove it as a login factor once TOTP is on | § 5.2.2 |
| 2026-07-31 | X is registered via the **mobile app** with `social@toldstraight.com`; web signup and SSO coupling both declined | § 5.0 |
| 2026-07-31 | **YouTube: Brand Account under the existing Google login** — no new Google account, no new phone verification, transferable ownership later | § 5.1 |
| 2026-07-31 | **Bluesky: claim `toldstraight.bsky.social` first**; the `@toldstraight.com` handle needs an `_atproto` TXT record and must go through `infra/dns.yaml` by change-set, never a hand-made console record | § 5.1 |
| 2026-07-31 | TikTok signup **blocked** — "Maximum number of attempts reached" with no code ever sent; suspected bot-detection on the automated browser tab. Retry in the TikTok app | § 5.1 |
| 2026-07-31 | Bio voice standardized: **US spelling, sentence fragments, "No BS", title-case "Adult ADHD"**. X carries the OLD wording — second-pass update owed. Repo is uniformly British "humour" (README, Ep01 show-notes) — sweep undecided | § 5.3 |
| 2026-07-31 | iCloud+ Custom Email Domain measured at **"Using 3 of 3"** — ADR 0011's "roughly three addresses" is a HARD CAP, now full; a 4th address triggers its reversal, not approaches it | § 5.2 |
| 2026-07-31 | Avatar is **variant A (ring)**, approved from a true-48px comparison; the 512 maskable favicon is declined for circular slots (9.96% inset, needs 14.64%) | § 5.4 |

## 8. 1Password inventory

Vault **`Told Straight`** created 2026-07-31 (`op` 2.38.1). Six login items, each with
an `op`-generated 32-character password and username `social@toldstraight.com`:

`Told Straight — X` · `Told Straight — Instagram` · `Told Straight — TikTok` ·
`Told Straight — Google (YouTube channel)` · `Told Straight — Facebook` ·
`Told Straight — Bluesky`

Titles only, as § 5.5 requires — no values here or anywhere in this repository.

Two structural notes on that list, both to be confirmed at signup rather than assumed:
**YouTube** is not a standalone account (the handle sits on a *channel* hanging off a
Google account, hence the item name), and a **Facebook Page** at
`facebook.com/toldstraight` normally requires a personal Facebook profile to
administer — a fork the maintainer decides before reaching that form.
