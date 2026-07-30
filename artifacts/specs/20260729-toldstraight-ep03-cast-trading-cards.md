# Told Straight — cast trading cards (personnel file format)

Drafted 2026-07-29 in the Ep03 planning session. Approved format: **four fields, no
more** — role/lane · credential-as-device · voice note · disclosure. The card IS the
backstory; nothing off-card is canon. Anything a character "reveals" about themselves
beyond the card is a bit, not lore, and does not accrete.

Design intent (from the discussion, recorded so it survives the session):

- "Who am I listening to" is a **framing** problem, not a backstory problem — solved
  by ~20 seconds of orientation, not lore.
- Detail is load-bearing only if it changes how a listener should **weight what the
  character says**. Everything else is continuity debt; cut it.
- The satire lives in the **disclosure device** (the personnel file / NOT REAL stamp,
  standing device since Ep02), not in invented biography. The wink is the honesty
  mechanism: it is what stops anyone mistaking a character for an authority.
- Jared is the only real cast member and the emotional spine of the show. Synthetic
  interiority competes with the real story; keep the fakes flat and functional.
- **Anna Sinclair carries a heightened disclosure obligation** (see her card): a warm
  authoritative "clinician" reviewing real psychometric results is the exact setup
  where a listener could over-trust. Her intro must carry the disclosure in her own
  voice, not only in the host read.

House stamp block, read deadpan or shown on the card art:

    ┌─────────────────────────────┐
    │  TOLD STRAIGHT PERSONNEL    │
    │  FILE ░░ CLEARANCE: PUBLIC  │
    │  ██ REAL: NO ██             │
    └─────────────────────────────┘

---

## CARD 001 — JARED GODAR *(the control card — the only REAL: YES in the file)*

| Field | Entry |
| --- | --- |
| **Role / lane** | Host, overall show. The patient. Brings the real diagnosis, the real homework, the real doctor's appointments. |
| **Credential (device)** | "Qualifications: has the condition. Did the homework. Showed the receipts." |
| **Voice note** | Candid to a fault; will read his own psych-test margin notes on air. The show's motto is his personality. |
| **Disclosure** | **REAL: YES.** Everything he reports about himself is true, which is the whole point of the show. |

## CARD 002 — OWEN *(expert co-host, Ep01)*

| Field | Entry |
| --- | --- |
| **Role / lane** | The researcher-who-also-has-it. Explains mechanisms from inside the club. |
| **Credential (device)** | "PhD in a field he will describe, from an institution he cannot, because it does not exist." |
| **Voice note** | Bookish, warm, self-interrupting; cites studies the way other people quote song lyrics. |
| **Disclosure** | **REAL: NO.** Synthetic character. Personnel-file stamp on any card art; host names him as fictional in the intro. |

## CARD 003 — DES FABLE *(host, Ep02)*

| Field | Entry |
| --- | --- |
| **Role / lane** | The British everyman club member; asks the questions the listener is yelling at the podcast. *(A 2026-07-29 reassignment to "future expert" was retracted the same day; see the restructure decisions log.)* |
| **Credential (device)** | "Credentials: none. That's the job." |
| **Voice note** | Lived-in, slightly scattered, self-deprecating; the one who wrote 'MCT' on a napkin and brought it to class. |
| **Disclosure** | **REAL: NO.** Synthetic character (the surname is a confession). Stamp on card art; named as fictional at intro. |

## CARD 004 — DR. MICHAEL VOSS *(expert, Ep02)*

| Field | Entry |
| --- | --- |
| **Role / lane** | The academic. Adjudicates evidence; ranks claims by effect size, out loud. |
| **Credential (device)** | "Speaks fluent effect size. Board-certified in a specialty we made up; the meta-analyses he cites are real, which is the deal." |
| **Voice note** | Polished, a notch smug, likable anyway; delivers the honesty clause like a warranty. |
| **Disclosure** | **REAL: NO.** Synthetic character. The citations are real even though he is not — say this on air; it IS the show's thesis in one line. |

## CARD 005 — DR. ANNA SINCLAIR *(clinician, Ep03)* — HEIGHTENED DISCLOSURE

| Field | Entry |
| --- | --- |
| **Role / lane** | The bedside clinician. Walks a real person through his real results — warmly, plainly, and without diagnosing anyone. |
| **Credential (device)** | "License number: NOT-A-REAL-1. Composite of every good clinician you wish you'd had." |
| **Voice note** | Warm, direct, reassuring authority; tortoiseshell-glasses energy. Laughs at the margin notes, then takes them seriously. **Voice: Emma (ElevenLabs shared library, `56bWURjYFHyYyVf490Dp`) — Australian**; reads a notch younger than she's drawn, which suits her. |
| **Disclosure** | **REAL: NO — and she says so herself, in-voice, at her intro**, before touching the results: she is a composite, this is orientation not diagnosis, and Jared is seeing his actual (real, human) doctor. The NOT REAL stamp appears on her card art. This is the one card where the disclosure is load-bearing rather than a running gag. |

---

## Usage rules

1. **The card is the canon.** Bits beyond the card don't accrete into continuity.
2. **Every synthetic intro = role + credential-device + disclosure**, ~20 seconds.
   The stamp visual accompanies any on-screen/cover appearance (standing Ep02 device).
3. **Anna's episodes**: disclosure in her own voice at first appearance, every episode
   she appears in, no exceptions — plus the host-read disclaimer. Two channels, always.
4. New characters get a card in this file **before** their first line is written.
5. Promotion path: this draft lives in session scratch; its working home is
   `artifacts/specs/` (gitignored). When adopted, an executor promotes the cards to a
   tracked home (suggested: `episodes/cast/cards.md`, or fold into `episodes/cast.json`
   as a `card` object per entry) in a normal PR. Nothing here is canon until tracked.
