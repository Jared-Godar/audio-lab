# Cast expansion — four new characters (#167)

> **Revision history** — newest first.
>
> **2026-07-31 — created (#167).** Four new synthetic cast members specified: names, backstory
> stubs, demographics, and ready-to-run Gemini prompts. Images are **not** generated here — the
> maintainer runs these prompts, as with every other cast portrait.

The MVP slice of #167. The existing five portraits are **not** reworked; this is forward-only.

**Why:** the roster read as four white men and one white woman. The first person outside the
project to see the Coming Soon page had that as their first impression, which is not the one the
show wants to make.

**Where this is recorded:** here, in the manifest, and in #167. **Never** on the site, in show
notes, on air, or on social media.

## The four

Chosen for **3 women + 1 man**, taking the site roster to 4M/4F, and weighted toward Hispanic
and Black representation because those are the largest groups absent from the current roster.
Resulting site roster of eight: 4 white, 2 Hispanic or Latino, 1 Black, 1 Asian.

Expertise was chosen to fill real gaps in a neurodevelopmental show rather than to duplicate
what Owen, Voss and Sinclair already cover.

| Name | Gender | Race / ethnicity | Origin | Card label |
| --- | --- | --- | --- | --- |
| Dr. Rosa Villalobos | female | Hispanic or Latino | Mexico → Phoenix, AZ | Pharmacology |
| Dr. Yolanda Bridges | female | Black or African American | Atlanta, GA (US) | Education & Accommodation |
| Dr. Mei-Lin Chao | female | Asian | US-born, Hong Kong heritage | Genetics & Heritability |
| Hector Salazar | male | Hispanic or Latino | Puerto Rico → Orlando, FL | Executive Function Coaching |

> **Sanity-check the names before generating.** They were chosen to read as ordinary American
> names with no prominent real-world bearer that I am aware of, but I cannot verify that
> exhaustively — worth a search before these become public characters.

---

## 1. Dr. Rosa Villalobos — Pharmacology

**Stub.** Clinical pharmacologist. Born in Guadalajara, came to Phoenix at seven, first in her
family to finish school past sixteen. Spent a decade in hospital pharmacy before moving to
research. The one who says *"that dose isn't wrong, it's just not yours yet"* — she is
unromantic about medication, treats titration as ordinary engineering, and is impatient with
both the people who think stimulants are a moral failure and the people who think they are a
personality. Dry, precise, faintly amused.

**Demographics.** Female · Hispanic or Latino · Mexico → United States · 40s

**Gemini subject prompt:**

> Woman, 40s, warm medium-brown skin, straight dark-brown shoulder-length hair tucked behind
> one ear, dark brown eyes, strong straight brows, a calm level expression with the faintest
> dry half-smile. Simple stud earrings. Charcoal-grey blazer over a warm white blouse, a thin
> silver chain. Composed, unhurried, quietly authoritative.

---

## 2. Dr. Yolanda Bridges — Education & Accommodation

**Stub.** Special-education researcher turned workplace-accommodation specialist. Atlanta born
and raised, thirty years between classrooms and HR departments, and she has watched the same
child get an IEP at nine and no accommodation at twenty-nine. The one who says *"the diagnosis
is the easy part — try getting it written into a job description."* Warm, funny, entirely out of
patience with institutions that mean well.

**Demographics.** Female · Black or African American · United States · 50s

**Gemini subject prompt:**

> Woman, 50s, deep-brown skin, short natural coily hair greying at the temples, dark brown eyes,
> reading glasses pushed up on her head, a warm knowing expression with a real smile. Bold
> geometric earrings in muted brass. Deep teal jacket over a cream top. Confident, grounded,
> the person who has already heard the excuse you are about to make.

---

## 3. Dr. Mei-Lin Chao — Genetics & Heritability

**Stub.** Behavioural geneticist. Born in Oakland to parents who left Hong Kong in the eighties;
grew up translating for them at the doctor's office, which is where the interest started. Works
on why the condition runs in families and why that is neither destiny nor an excuse. The one who
says *"heritable is not the same as inherited, and neither one means fixed."* Precise, curious,
prone to answering a question with a better question.

**Demographics.** Female · Asian · United States (Hong Kong heritage) · 30s–40s

**Gemini subject prompt:**

> Woman, late 30s, light-medium warm skin, straight black chin-length bob with a blunt fringe,
> dark eyes behind slim rectangular black-framed glasses, an alert curious expression, lips
> slightly parted as if mid-thought. Small gold hoop earrings. Rust-red knit sweater over a
> collared shirt. Sharp, engaged, faintly impatient with a slow explanation.

---

## 4. Hector Salazar — Executive Function Coaching

**Stub.** Occupational therapist and executive-function coach — deliberately **not** a PhD, the
only practitioner on the panel. Born in San Juan, moved to Orlando at nineteen after a hurricane
took the family's roof. Diagnosed at thirty-one, after his own client asked whether he had ever
been assessed. The one who says *"strategies are not a personality transplant — they are a ramp."*
Practical, warm, allergic to jargon, and the one who translates the researchers into Monday
morning.

**Demographics.** Male · Hispanic or Latino · Puerto Rico → United States · 30s

**Gemini subject prompt:**

> Man, mid-30s, medium-tan skin, short dark-brown hair with a neat fade, close-trimmed beard,
> dark brown eyes, an open friendly expression, slight smile. Henley shirt in muted olive with
> the top button undone, a simple leather-band watch. Relaxed and approachable, leaning very
> slightly forward.

---

## How to generate — portraits

Use the **locked style prompt** from `episodes/cast/portraits/manifest.json` (`style_prompt`)
verbatim, then append the subject prompt above. Do not name the reference show — describe the
aesthetic, per `style_naming_note` in the manifest.

```text
Flat 2D vector illustration, clean ligne claire style. Bold uniform black outlines. Flat color
fills with minimal hard-edged cel shading (single darker shadow tone), no gradients, no soft
rendering, no photorealism. Angular geometric simplification: defined jaw, blocky chin,
simplified straight nose, minimal facial detail, pale eyes with small white catchlight. Retro
1960s mid-century spy aesthetic, confident and deadpan. Muted slightly desaturated palette. 3/4
head-and-shoulders portrait, plain flat warm-paper background #EDE9E0. Ink-black #111111
outlines; accent red #B02A28 and warm grey #78746C used sparingly.

<PASTE THE SUBJECT PROMPT HERE>
```

**Output:** 1:1 square, ideally 1024×1024 or larger.

**Filenames** — following the existing convention
(`DATE-VENDOR-MODEL-SUBJECT-ROLE-cast-portrait-1x1.png`):

```text
20260731-gemini-nano-banana-2-rosa-villalobos-pharmacology-cast-portrait-1x1.png
20260731-gemini-nano-banana-2-yolanda-bridges-education-cast-portrait-1x1.png
20260731-gemini-nano-banana-2-mei-lin-chao-genetics-cast-portrait-1x1.png
20260731-gemini-nano-banana-2-hector-salazar-coaching-cast-portrait-1x1.png
```

## How to generate — the updated hero

The current hero shows the host photoreal among four cartoon cast in a study. The new one needs
eight. Keep the medium split — **the host stays photoreal, everyone else stays ligne-claire
cartoon** — because that split *is* the disclosure (ADR 0019).

```text
A warm mid-century study: floor-to-ceiling walnut bookshelves crowded with books, globes,
scientific instruments and curios, a stone fireplace with a low fire at the right, tall windows
at the left with a city skyline beyond and heavy curtains, a patterned rug, a leather armchair
centre.

Seated centre in the armchair: a photorealistic man, late 40s, warm olive skin, near-black hair
greying at the temples, full two-tone beard, open plaid flannel over a plain tee — rendered
photoreal, distinctly different in medium from everyone else in the frame.

Arranged around him, all rendered as FLAT 2D VECTOR LIGNE CLAIRE CARTOONS with bold uniform
black outlines and flat cel-shaded colour — no photorealism, clearly a different medium from the
seated man — eight to nine adults in relaxed conversational poses, some standing, some perched
on desk or chair arms, several holding coffee mugs:

- a white man, 30s-40s, glasses, tidy short hair, bookish
- a white man, 40s-50s, glasses, blazer, composed
- a white woman, 40s-50s, auburn-brown hair with a grey streak pulled back, maroon blazer
- a Latina woman, 40s, medium-brown skin, dark shoulder-length hair, charcoal blazer
- a Black woman, 50s, deep-brown skin, short greying natural hair, deep teal jacket
- an Asian woman, late 30s, black blunt bob, black-framed glasses, rust-red sweater
- a Latino man, mid-30s, medium-tan skin, short dark hair, trimmed beard, olive henley

Muted slightly desaturated palette, warm lamplight, retro 1960s mid-century aesthetic. Wide
landscape composition, roughly 16:9. Everyone looking relaxed and mid-conversation, not posed
for a photograph.
```

**Filename:** `20260731-gemini-nano-banana-2-hero-cast-group-16x9.png`

## What happens after you generate

1. Drop the five files somewhere I can read them.
2. I add the four portraits to `manifest.json` with their `demographics` blocks (already
   specified above), convert to WebP, and add the four cards to the site.
3. I replace the hero and re-run the site push.

Card labels for the new row, to match the relabelled existing cards:

```text
DR. ROSA VILLALOBOS    Pharmacology
DR. YOLANDA BRIDGES    Education & Accommodation
DR. MEI-LIN CHAO       Genetics & Heritability
HECTOR SALAZAR         Executive Function Coaching
```

## Not in this slice

- **No personnel-file cards** — portraits only, per the maintainer.
- **No voice casting** — these are faces and bios; ElevenLabs casting is separate.
- **No randomiser tool yet.** #167 specifies a census-weighted generator for future characters.
  It needs a sourced Census table, a CLI surface and tests, which is more than this slice — held
  for a follow-up so it does not delay the visible correction.
