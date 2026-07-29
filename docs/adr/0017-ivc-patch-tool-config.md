# ADR 0017 — Host-line patches render with IVC "Jared 1.0" on `eleven_multilingual_v2`

- **Number:** 0017
- **Title:** Host-line patches render with the Instant Voice Clone "Jared 1.0"
  (de-gapped corpus) on `eleven_multilingual_v2`
- **Status:** accepted
- **Date:** 2026-07-29
- **Source:** issue #91, and the 2026-07-29 recording/A-B session it documents.

## Context

Ep01 v2 is being rebuilt on the maintainer's real host recordings (#55); fixing one flawed
line without re-micing needs a voice clone. The account has one irreversible Professional
slot (ADR 0004) and unlimited Instant clones within 30 slots. ADR 0014 makes `eleven_v3`
the default synthesis model, `multilingual_v2` case-by-case with the choice recorded. On
2026-07-29 two IVCs were built from the session's audio — "Jared 1.0"
(`55ZBPsQ4TUfilRuaftR9`, all silences removed from the corpus) and "Jared 2.0"
(`uRHCc17iD8J841Ag8zdr`, natural pauses intact) — and a four-cell A/B (both voices × both
models, identical recorded-t00 text, real take as reference; 4 × 207 = 828 credits,
verified in `/v1/history`) was put to the maintainer's ear.

## Decision

Verbatim: "…multilingual_v2-jared_ivc_v1-t00-clone-vs-real-ab-192k.mp3 this was the best
mix of inflection, pauses and sounding like me" — that file is Jared 1.0 on
`eleven_multilingual_v2`. On the loser: "Hang on to 2.0 for now."

Therefore: host-line patches use voice `55ZBPsQ4TUfilRuaftR9` on `eleven_multilingual_v2`
(a recorded ADR 0014 case-by-case exception). The IVC is sufficient as the patch tool; the
PVC slot stays held (ADR 0004 unchanged). Jared 2.0 is retained as a spare.

## Consequences

**Constrains M4:** the #55 stem swap and any later host-line patch render use this config.
The corpus finding — silences-removed beat natural-pauses — governs any future clone
rebuild: prepare corpora dense, silences stripped.

## Reversal condition

Reverse the model choice only on a same-text A/B where the maintainer picks differently —
the deciding instrument is his ear, not benchmarks or release notes. Delete Jared 2.0 when
a slot is needed or he says so. Escalate to PVC only if cloned-Jared becomes a primary
narrator (ADR 0004's own condition).
