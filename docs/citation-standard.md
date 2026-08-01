# Citation standard

> **Revision history** — newest first.
>
> **2026-07-31 — created (#167).** Written to back the reference the three show-notes files
> already carried. Records the APA 7 form, the verification path, and the four traps that have
> actually produced wrong citations in this repo rather than a generic style summary.

Every journal article referenced on air, in show notes, or on the site is cited in **APA 7**,
**expanded in full**, and **verified against the publisher's own metadata** — never typed from
memory and never hand-abbreviated.

This exists because the show's entire claim is *"with receipts."* A citation that is subtly wrong
is worse than no citation: it looks like diligence while failing at the one thing it is for.

## Where references live

Two surfaces, and they must agree:

| Surface | Path | Form |
| --- | --- | --- |
| Show notes | `episodes/ToldStraight-Ep0N/show-notes.md` | Numbered markdown list, links on a continuation line |
| Site Works Cited | `site/index.html` | `<ol class="wc-list">` with hanging indents |

**Change both together, or they drift.** The site is the audience-facing copy; the show notes are
the record. A reference corrected in one is not corrected.

## The form

```text
Author, A. A., Author, B. B., & Author, C. C. (Year). Title of the article in sentence case.
*Journal Name in Title Case*, *Volume*(Issue), pages. https://doi.org/10.xxxx/xxxxx
```

Followed on the next line by the resolver links:

```text
[PubMed](https://pubmed.ncbi.nlm.nih.gov/PMID/) · [PMC full text](https://www.ncbi.nlm.nih.gov/pmc/articles/PMCID/)
```

Rules that are not negotiable:

- **Full journal title.** `Journal of Consulting and Clinical Psychology`, never `J Consult Clin Psychol`.
- **Full article title.** No truncation, no "…", no editorialised shortening.
- **All authors up to 20**, then an ellipsis and the final author — APA 7's rule, not "et al." after three.
- **DOI as a full `https://doi.org/` URL**, not a bare `doi:` string.
- **PMC link only when a PMC record exists.** Do not fabricate one from the PMID.

## Verification path

1. **Start from the DOI.** Query CrossRef: `https://api.crossref.org/works/{doi}`. Authors, journal,
   volume, issue, pages and year come from there — not from a search-result snippet.
2. **Resolve identifiers via NCBI**, not by guessing:
   `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?ids={doi}&format=json` returns the PMID and,
   when one exists, the PMCID.
3. **If a DOI is unknown**, find the record with PubMed ESearch first and take the DOI from the
   record — do not construct one.
4. **Spot-check the year and volume against the landing page.** CrossRef occasionally carries an
   online-first year that differs from the issue year.

## Four traps that have actually bitten this repo

These are recorded because each one produced a wrong citation that passed visual review.

### 1. Corporate and group authors vanish

CrossRef returns group authors in a **separate field** from personal ones. An extractor that reads
only the personal author list will emit a reference with **no author at all**:

```text
8.  (1999). A 14-Month Randomized Clinical Trial of Treatment Strategies for ADHD.
```

That shipped into `ToldStraight-Ep01/show-notes.md` and survived every read-through, because a
missing author reads as a formatting quirk rather than an error. The correct form is
`The MTA Cooperative Group. (1999). …`. **Always check the corporate-author field.**

### 2. Publisher markup leaks into titles

CrossRef titles can contain markup — small caps, subscripts, superscripts:

```text
...camouflaging between adults with autism and <scp>ADHD</scp>.
```

It has no meaning in a reference list; APA sets the acronym plainly. **Strip `scp`, `sub`, `sup`
and `i`/`b` tags** from any title taken from CrossRef, and check both the raw form and the
HTML-escaped form (`&lt;scp&gt;`) when sweeping.

### 3. Numbering that disagrees with the markup

On the site, each episode's list is split around a floated cover image. **CSS counters ignore the
HTML `start` attribute** — so a continuation `<ol start="7">` styled with `counter-reset: wc`
restarts at 1 on screen while the accessibility tree correctly announces 7. Seed the counter to
match: `style="counter-reset:wc 6"`. Keep the two in lockstep.

### 4. Hand-abbreviation creeps back

Abbreviated journal titles look "more academic" and are wrong for APA. If a reference arrives
abbreviated — from a PDF, a colleague, or a model — expand it from the CrossRef record rather than
from memory. Expanding from memory is how `Arch Gen Psychiatry` becomes the wrong journal.

## Checklist before a reference ships

- [ ] Metadata pulled from CrossRef by DOI, not typed
- [ ] Corporate/group author field checked — no authorless entries
- [ ] Journal and article titles expanded in full
- [ ] Markup stripped from the title (`scp`, `sub`, `sup`)
- [ ] PMID present; PMCID present **only** if a PMC record exists
- [ ] Show notes and `site/index.html` both updated
- [ ] Site list numbering continuous across the float split
