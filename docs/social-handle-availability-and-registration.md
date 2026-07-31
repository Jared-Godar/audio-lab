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

## 4. Recommendation

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

1. `toldstraightpod` (15 — exactly at X's cap, no room to spare)
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

### 5.1 Order

Register in one sitting if possible. If staged, go **X → Instagram → TikTok →
YouTube → Facebook → Bluesky**: X and Instagram carry the highest squatting traffic
and the least forgiving reclaim process, and Instagram also fixes the Threads handle.

### 5.2 Decide these three things first

1. **Recovery address.** ADR 0011 puts the mailbox on iCloud+ Custom Email Domain and
   records its reversal condition as *"wanting more than roughly three addresses."*
   `hello@toldstraight.com` and `jared@toldstraight.com` already exist, so adding a
   dedicated `social@toldstraight.com` lands **exactly on that boundary** — it does
   not break ADR 0011, but it consumes the last slot before the calculus flips.
   Either use it deliberately or point all six accounts at `hello@`. **Maintainer's
   call; not assumed here.**
2. **2FA method.** Prefer **TOTP in the password manager** over SMS — SIM-swap is the
   standard takeover route for brand accounts, and several of these platforms allow
   SMS-only recovery to reset a password. Record which method each account uses.
3. **Where credentials live.** The password manager, never this repo and never a
   file in it. The repo records *the location only* — see § 5.5.

### 5.3 Copy to use

**Display name (all platforms):** `Told Straight`

**Bio — short (X, Instagram, TikTok; ~150 chars):**

```text
One complicated subject, covered properly. Bottom line up front, every claim sourced, dark humour, no woo. Season 1: adult ADHD.
```

**Bio — long (YouTube "About", Facebook "Intro", Bluesky):**

```text
A season-per-topic podcast that takes one complicated subject and covers it properly: bottom line up front, every claim sourced to peer-reviewed literature, dark humour, no woo.

It exists because "do your own research" mostly means reading whatever ranks well. This is the opposite of that, done out loud.

Season 1 is adult ADHD. Orientation, not medical advice.
```

Both are derived from the README's own description of the show, not newly invented.

**Link on every profile:** `https://toldstraight.com`

> The site is a Coming Soon page at time of writing (#128, go-live 2026-08-06 per
> ADR 0019). Linking it from day one is still right — it is where a squatter-check
> visitor lands, and it collects signups.

### 5.4 Profile art

**Avatar — use this file, all six platforms:**

`brand/favicon/20260728-adobe-illustrator-toldstraight-favicon-512-maskable.png`
(512×512, square, already in the repo). Every platform crops the avatar to a circle
or rounded square; the maskable variant is the one built with that safe area.

**Banners / cover images — this is a genuine gap, not an oversight.** The repo's
widest brand assets are the 1200×630 OG cards and the 1280×400 README headers in
`brand/web/`, and none of them match the header aspect ratios these platforms use (X,
YouTube, and Facebook each want a different one). Rather than stretch an asset built
for a different frame:

- Read the required pixel dimensions **from each platform's own uploader** at
  registration — they are stated in the UI and change without notice, so a figure
  written down here would go stale silently.
- Then file a follow-up to author a banner builder in `tools/brand/` per the
  established workflow: the agent **authors the Illustrator JSX**, the maintainer
  runs it where the licensed faces are installed. The agent does not render or commit
  brand PNGs it produced itself.

Launching with an avatar and no banner is fine and reversible. Launching with a
distorted banner is the kind of thing that ends up in a screenshot.

Note also that the Coming Soon assets referenced by ADR 0019 currently live in
`artifacts/coming-soon-prototype/`, which is **gitignored** — they land with #128 and
are not available to a fresh clone until then.

### 5.5 After registering — record, don't store

In the repo, record only:

- the handle actually obtained per platform (if any fallback was needed, and why),
- the recovery address used,
- the 2FA method per account,
- **the name of the password-manager entry** holding the credentials — never the
  credentials, never a recovery code, never a TOTP seed.

Then re-run § 2's checkers against the registered handles: they should now report
**taken**. That is the negative test that the registration actually took effect —
a signup form that appeared to succeed is not a result.

## 6. What is still owed on #111

This document delivers the first acceptance criterion and prepares the rest. Open:

| Acceptance criterion | Status |
| --- | --- |
| Handle-availability research + recommended consistent handle | **done** (§ 3, § 4) |
| Accounts registered on the five platforms | **owed — maintainer** |
| Profile art applied from the brand suite | **owed** — avatar ready; banners are a gap (§ 5.4) |
| Credentials stored securely, storage location recorded | **owed — maintainer** (§ 5.5) |
| CHANGELOG entry | done with this change |

Issue #111 therefore stays **open**. Whether the remaining four become a sub-issue or
stay on #111 is the maintainer's call, not a reclassification made here.
