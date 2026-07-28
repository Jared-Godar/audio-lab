# How the domain availability was checked

Working note, 2026-07-26. Gitignored. Records method and raw results so the
verdicts can be re-derived or challenged rather than taken on trust.

---

## Why this needed a method at all

The first sweep produced answers that were **wrong**, and the failure was silent.
That is the whole reason this document exists.

## Attempt 1 — RDAP without following redirects (FAILED)

```bash
curl -s -o /dev/null -w "%{http_code}" "https://rdap.org/domain/toldstraight.com"
```

Results were `302` and `000`:

```text
?(302)  toldstraight.com
?(000)  toldstraight.fm
?(000)  toldstraight.club
FREE?   toldstraight.me
```

Two separate bugs:

- **`302`** — rdap.org is a bootstrap redirector. Without `-L` you get the
  redirect, never the answer.
- **`000`** — connection failure, not a verdict. Reading it as "available" would
  have been pure invention.

Only `toldstraight.me` returned a real 404, so exactly one of fourteen answers
meant anything.

## Attempt 2 — whois, but hitting the wrong server (FAILED SILENTLY)

```bash
whois toldstraight.com | grep -iE "^(Registrar:|Creation Date:)"
```

This reported `** FREE **`. The verdict happened to be right, but the *reasoning
was invalid* — inspecting the raw output showed macOS `whois` had returned the
**IANA TLD record**, not a domain record:

```text
refer:        whois.verisign-grs.com
domain:       COM
organisation: VeriSign Global Registry Services
```

That record legitimately contains no `Registrar:` line, so "no Registrar line
means unregistered" would mark **every** `.com` as free. A checker that returns
the right answer for the wrong reason is worse than one that fails loudly.

## Attempt 3 — registry-direct whois, with controls (TRUSTED)

Two changes made the results usable:

1. Query each TLD's **own** whois server.
2. Run a **control** — a domain known to be registered — through the identical
   code path. If the control doesn't come back `taken`, the checker is broken for
   that TLD and its verdicts get discarded.

```bash
srv () { case "${1##*.}" in
  fm) echo whois.nic.fm;;  club) echo whois.nic.club;;
  audio) echo whois.nic.audio;;  me) echo whois.nic.me;;
  org) echo whois.pir.org;;  *) echo whois.verisign-grs.com;;
esac; }

chk () {
  out=$(whois -h "$(srv "$1")" "$1" 2>/dev/null)
  if echo "$out" | grep -qiE "^ *(Domain Name|Registrar:|Creation Date)"; then echo "taken"
  elif echo "$out" | grep -qiE "No match|NOT FOUND|No Data Found|Domain not found"; then echo "FREE"
  else echo "unclear"; fi
}
```

Control results:

```text
last.fm        TAKEN     <- .fm checker works
google.club    TAKEN     <- .club works
bbc.audio      TAKEN     <- .audio works
about.me       TAKEN     <- .me works
example.org    TAKEN     <- .org works
nike.show      unclear   <- .show BROKEN, verdicts discarded
vimeo.co       unclear   <- .co BROKEN, verdicts discarded
```

Three TLDs failed their control and were reported as unverified rather than
guessed at.

## Confirming the headline result three ways

A clean two-word `.com` being unregistered is unusual enough to distrust, so
`toldstraight.com` was checked by three independent means, with a control:

```bash
whois -h whois.verisign-grs.com toldstraight.com   # -> No match for domain "TOLDSTRAIGHT.COM"
whois -h whois.verisign-grs.com google.com         # -> Creation Date: 1997-09-15  (control)
curl -sL -o /dev/null -w "%{http_code}" https://rdap.org/domain/toldstraight.com   # -> 404
dig +short toldstraight.com A NS                   # -> (no records)
```

Registry whois, RDAP, and DNS agree; the control proves the method can tell the
two states apart.

## A trap worth remembering

Mid-sweep, `last.fm` — definitely registered — started returning `000` from
rdap.org. That was **rate limiting**, not a change in reality. Without the
control in the loop it would have been read as "last.fm is available."

Any availability checker needs a known-positive running through the same path,
every time. Otherwise a service degradation is indistinguishable from good news.

## Results

**Verified free** (control-tested TLDs only):

| Concept | Domains |
| --- | --- |
| Show name | `toldstraight.com` `.fm` `.org` `.net` `.me` `.audio` `.club` |
| BLUF | `bluf.fm` `showyourwork.fm` `citationneeded.fm` `primarysource.fm` `thereceipts.fm` |
| Sagan | `demonhaunted.com` `.fm` `.org` `thedemonhaunted.com` `candleinthedark.fm` `thecandle.fm` `thecandleinthedark.com` `candleinthedark.net` |
| Strict truth | `strictlytrue.com` `thelongtruth.com` `showtheworking.com` |
| Community | `hostvote.fm` `voicevote.fm` `pickthehost.com` `castmyhost.com` |
| Candle variants | `carrythecandle.com` `keepthecandle.com` `thebaloneykit.com` |

**Taken:** `candleinthedark.com` `.org`, `acandleinthedark.com`, `candledark.com`,
`thecandle.com`, `showyourwork.com`, `showyourworking.com`, `citationneeded.com`,
`baloneydetection.com`, `baloneydetectionkit.com`, `baloneydetector.com`,
`bottomlineupfront.com`, `blufpodcast.com`, `candlepodcast.com`,
`signalnotnoise.com`, `nonewsletter.com`, `plainlytold.com`, `theevidencedesk.com`,
`knownquantity.com`, `bluf.club`.

**Unverified** (controls failed): anything on `.show`, `.co`, `.studio`, `.news`,
`.media`, `.pub`.

## Selected

`toldstraight.com`, `toldstraight.fm`, `candleinthedark.fm`, with
`vote.toldstraight.com` as a subdomain for the community applet rather than a
separate registration.

> Availability was true at 2026-07-26. It is a race — re-check immediately before
> registering.
