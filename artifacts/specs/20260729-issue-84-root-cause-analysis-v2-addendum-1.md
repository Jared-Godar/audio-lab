# Addendum 1 to the issue #84 v2 spec — maintainer rulings of 2026-07-29

**Amends:** `artifacts/specs/20260729-issue-84-root-cause-analysis-v2.md` (immutable; this
is the new-dated-file revision the standing rules require). **Recorded by:** the 2026-07-29
PM-lane audit session, same turn the rulings were given. **Authority:** maintainer's live
instruction, which outranks the spec. Everything in the v2 spec not touched below stands
unchanged.

## Ruling 1 — the apology-grep acceptance criterion is waived

The `grep -ci 'sorry\|apolog\|embarrass\|regret' … = 0` check (#84 §7, spec Step 5, spec
§6.7 "Apology-grep = 0") was a PM invention, not a maintainer requirement. The maintainer's
intent was to govern **tone and focus**, not to word-police. The grep is no longer gating.
The substantive requirement stands in full: a factual, honest account of what went wrong,
why, and what would prevent recurrence — no apology, no self-criticism, no reputational
framing. State the waiver and cite this addendum in the PR body.

## Ruling 2 — maintainer quotes are masked to PG-13, not softened

Where the analysis quotes language **originating with the maintainer** that exceeds a
PG-13 rating, mask the profane word with cartoon grawlix (e.g. `f%$@#ing`, `s%$@#`) while
keeping the rest of the quote verbatim and attributed. This is the maintainer's stated
compromise between quote fidelity and a public repository; it modifies the spec's
"verbatim, no softening" instruction only to this extent. Disclose the masking convention
in the document's Methods section (§3.1(0)).

## Ruling 3 — issue #84's body was bleeped post-spec; treat it as bookkeeping

At the maintainer's direction, the PM-lane audit session edited #84's body at
**2026-07-29T05:23:39Z**: two profanity masks (§2e and §9 provenance quotes) plus a
one-line footnote recording the bleep. Nothing else changed — the pre/post diff is exactly
those three hunks. The spec's statement that the body is "authoritative and unrewritten"
refers to the pre-bleep content; the masked quotes stand in for the originals, and the
bleep event is bookkeeping, not an additional data point.

## Ruling 4 — scope expansion: bleep the remaining profanity in the #84 comments

Data-point comment 4 (created `2026-07-29T04:30:34Z`, REST id `5113162226`,
`issues/84#issuecomment-5113162226`) contains three instances of `fucking` inside a
maintainer quote. The PM lane cannot edit existing comments (`gh api -X PATCH` is denied
there), so this falls to the executor, who runs unguarded. Before using the comment as
source material:

1. Fetch the comment body:
   `gh api repos/Jared-Godar/audio-lab/issues/comments/5113162226 --jq .body`
2. Apply the same grawlix masking to the three instances, append a one-line note —
   `*Bleeped to cartoon grawlix at the maintainer's direction at <UTC timestamp>; nothing
   else changed.*` — and PATCH it back:
   `gh api -X PATCH repos/Jared-Godar/audio-lab/issues/comments/5113162226 -f body=@<file>`
3. Verify by re-fetching and grepping; paste the receipt in the PR body.

No other comment contains profanity (scanned 2026-07-29: `fuck|shit|goddamn|bitch|asshole`,
case-insensitive, across all 8 comments — this was the only hit).

## Read-time notes from the audit session

- The v9 transcript is now **3,354,071 bytes** (+124 vs the spec's PM-verified 3,353,947),
  mtime 2026-07-28 22:54 local. Report your own read-time snapshot per spec §0 and
  reconcile all three v9 figures (#84 §2b snapshot, spec §2.5 figure, your read).
- #84 now has **8 comments**, not 7: the 8th (2026-07-29T05:01:48Z) is the spec-approval
  notice — bookkeeping, same class as the M0 notice. Six data-point comments unchanged.

## Staging change

Commit **this addendum** alongside the v2 spec, at both `artifacts/specs/` and `prompts/`
(byte-identical, `cmp`-verified) — Step 6's four-file staging list becomes six. Name this
deviation in the PR body as authorized by this addendum.

## Provenance

Rulings given by the maintainer on 2026-07-29 in the PM-lane audit session that vetted the
v2 spec; recorded to this file in the same turn, per the promises-persisted rule. The #84
body edit in Ruling 3 was executed and verified by that session before this file was
written; the addendum was staged outside the repo (background-session write isolation) and
placed at `artifacts/specs/` by the maintainer's launch command.
