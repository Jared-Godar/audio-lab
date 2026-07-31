# Pre-public-release readiness checklist — Told Straight (private beta → public)

Produced under [#109](https://github.com/Jared-Godar/audio-lab/issues/109). This file
**defines** the gate that must pass before Told Straight / `toldstraight.com` moves from
private beta to public. It does **not** execute it: the audit that runs every item,
attaches evidence, and records a go/no-go is
[#110](https://github.com/Jared-Godar/audio-lab/issues/110). Keep the two separate — this
document is the standard, #110 is the measurement.

## 1. How to read this gate

- The unit is a **gate item**. Each states four things: **What** it asserts, **Verify**
  (the exact command or method that settles it — `(no output)` is a valid result, an
  assertion is not), **Owner / issue** (who clears it or the tracking issue), and
  **Blocks launch if** (the negative condition — every item is framed by what *stops*
  the launch, not by a vague "should").
- Severity is marked inline: **[BLOCKER]** — public launch does not proceed until this is
  cleared; **[SHOULD]** — expected before launch, but the maintainer may accept the risk
  with a decision recorded in `CHANGELOG.md`. A silent skip is not acceptance.
- "Cleared" means verified **this audit**, not remembered from a prior session — prior
  authorization never carries forward (`AGENTS.md` Part I §2). Where an item cites current
  state below, that state is **relayed from the linked issue at its measured date** and is
  re-verified by #110, never trusted as-is.
- Items with **no tracking issue** are collected in §7. They are gaps in the record, not
  permission to skip — file each before #110 runs.

## 2. Security — AWS posture, secrets, IAM

- [ ] **[BLOCKER] No long-lived IAM access key on an administrator principal.**
  - **Verify:** `aws iam list-access-keys --user-name godarj --profile default --query 'AccessKeyMetadata[].{Id:AccessKeyId,Status:Status}' --output text` returns no `Active` key; cross-check that no user still holding a static key has `AdministratorAccess` attached.
  - **Owner / issue:** [#67](https://github.com/Jared-Godar/audio-lab/issues/67) (open).
  - **Blocks launch if:** `godarj` (AdministratorAccess) still has an Active long-lived key. As of #67's 2026-07-27 evidence it did — a static credential on an admin principal is the highest-value target in the account. This is the load-bearing security blocker.

- [ ] **[BLOCKER] No redundant static key survives the SSO migration.**
  - **Verify:** `aws iam list-access-keys --user-name lifeos-archive-user --profile default --query 'AccessKeyMetadata[].Status' --output text` returns no `Active` key; confirm the `LifeOSArchive` SSO permission set still covers list/read/write (delete correctly denied).
  - **Owner / issue:** [#67](https://github.com/Jared-Godar/audio-lab/issues/67).
  - **Blocks launch if:** the `lifeos-archive-user` key is still Active while its SSO replacement is live — a forgotten credential is indistinguishable from an intended one six months later.

- [ ] **[BLOCKER] No secret has ever been committed to the public repo.**
  - **Verify:** a full-history secret scan over the whole repo — `gitleaks detect --source . --log-opts="--all"` → `(no output)`. `audio-lab` is the only public repo, so its history is already exposed; this item is load-bearing **now**, not only at launch.
  - **Owner / issue:** maintainer / infra — no CI or issue enforces this today (see §7).
  - **Blocks launch if:** any credential, API key, or secret access key appears in any commit. `ELEVENLABS_API_KEY` lives in the shell environment only (`CLAUDE.md`); a match here means that invariant was broken and history is permanent.

- [ ] **[BLOCKER] No public endpoint can drain the ElevenLabs account.**
  - **Verify:** the invite-only auth and the capped ElevenLabs key are in force on every internet-reachable Lambda / API Gateway path; confirm the cap value and that no uncapped key is reachable.
  - **Owner / issue:** [#50](https://github.com/Jared-Godar/audio-lab/issues/50), [#51](https://github.com/Jared-Godar/audio-lab/issues/51).
  - **Blocks launch if:** any public endpoint can reach an uncapped ElevenLabs key — one bug or one invitee could empty the account.

- [ ] **[SHOULD] The AWS account boundary is a settled decision.**
  - **Verify:** [#114](https://github.com/Jared-Godar/audio-lab/issues/114) records a go/no-go on a dedicated Told Straight AWS account vs. staying in the shared Identity Center account; an ADR is written if it is decided.
  - **Owner / issue:** [#114](https://github.com/Jared-Godar/audio-lab/issues/114).
  - **Blocks launch if:** a public property runs in an account whose boundary was never decided (accepted-risk allowed with a recorded decision).

- [ ] **[SHOULD] Public-repo branch protection remains strict.**
  - **Verify:** `gh api repos/Jared-Godar/audio-lab/branches/main/protection` shows required checks, `enforce_admins:true`, linear history, and `strict` (ADRs 0005, 0006, 0013).
  - **Owner / issue:** maintainer (ADRs 0005/0006).
  - **Blocks launch if:** protection on the one public repo was relaxed without the ADR reversal condition being met.

## 3. DNS & mail — SPF / DKIM / DMARC / rua

Query the **authoritative nameserver** (`@ns-...awsdns...`), not the local resolver, for
every check below (`infra/README.md` § "Verify after a deploy"); a resolver answer can be
stale.

- [ ] **[BLOCKER] SPF publishes once and ends in a softfail.**
  - **Verify:** `dig +short TXT toldstraight.com @<authoritative-ns>` contains exactly one `v=spf1 …` record ending in `~all` (ADR 0010; the `~all`-vs-`-all` choice is deliberate — see [#122](https://github.com/Jared-Godar/audio-lab/issues/122), and never read it in isolation from propagation timing).
  - **Owner / issue:** ADR 0010, [#122](https://github.com/Jared-Godar/audio-lab/issues/122).
  - **Blocks launch if:** SPF is missing, duplicated, or hardened to `-all` against the recorded decision.

- [ ] **[BLOCKER] DKIM is published and resolvable.**
  - **Verify:** the domain's DKIM selector resolves, and a live test message shows `dkim=pass`. Finding (#54/#59): Apple publishes the DKIM public key minutes-to-hours **after** domain verification, so a fresh setup has a transient window where signed mail is not yet verifiable — do not read that window as a misconfiguration.
  - **Owner / issue:** [#59](https://github.com/Jared-Godar/audio-lab/issues/59) (closed — Findings).
  - **Blocks launch if:** DKIM does not resolve, or a two-directional test on a steady-state domain does not reach `dkim=pass`.

- [ ] **[BLOCKER] DMARC enforces with strict alignment and a report address.**
  - **Verify:** `dig +short TXT _dmarc.toldstraight.com @<authoritative-ns>` returns `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:hello@toldstraight.com`.
  - **Owner / issue:** [#59](https://github.com/Jared-Godar/audio-lab/issues/59) (closed).
  - **Blocks launch if:** `p` is weaker than `reject`, alignment is relaxed from `s`, or `rua=` is absent. Weakening `adkim=s; aspf=s` to work around a first failure is the specific wrong fix #59 warns against — the failure mode there was the DKIM publication lag, not misalignment.

- [ ] **[SHOULD] DMARC aggregate reports are read, not just collected.**
  - **Verify:** name the mechanism that parses the gzipped XML `rua` reports arriving at `hello@toldstraight.com` (~one per receiver per day). Per `infra/README.md` §182, **nobody reads them yet** — the domain runs DMARC's enforcement half without its monitoring half.
  - **Owner / issue:** maintainer / infra — no issue (see §7).
  - **Blocks launch if:** launch raises mail volume while `rua` reports remain unmonitored (accepted-risk allowed with a recorded decision; the honest default is to say so).

- [ ] **[SHOULD] The custom-domain mail path is confirmed end to end.**
  - **Verify:** a two-directional test message shows `dkim=pass · spf=pass · dmarc=pass` under `p=REJECT`. iCloud uses the custom domain as the envelope sender, so SPF aligns under `aspf=s` (#59 finding; ADR 0011).
  - **Owner / issue:** ADR 0011, [#59](https://github.com/Jared-Godar/audio-lab/issues/59).
  - **Blocks launch if:** `hello@toldstraight.com` cannot both send and receive with all three aligned.

## 4. Content & licensing

- [ ] **[BLOCKER] Episodes 1–3 are complete — audio, artwork, transcript, metadata.**
  - **Verify:** the [#99](https://github.com/Jared-Godar/audio-lab/issues/99) completeness audit is closed with every gap logged and cleared; confirm no v1 asset silently ships in the v2 relaunch ([#65](https://github.com/Jared-Godar/audio-lab/issues/65)).
  - **Owner / issue:** [#99](https://github.com/Jared-Godar/audio-lab/issues/99), [#65](https://github.com/Jared-Godar/audio-lab/issues/65).
  - **Blocks launch if:** any published episode is missing artwork or a transcript, or ships a stale v1 cut.

- [ ] **[BLOCKER] The narrator voice is the intended one, not a placeholder.**
  - **Verify:** the Professional Voice Clone exists and E1–3 are regenerated from it (the placeholder Daniel host stems are swapped for Jared's own recordings).
  - **Owner / issue:** [#117](https://github.com/Jared-Godar/audio-lab/issues/117), [#55](https://github.com/Jared-Godar/audio-lab/issues/55), [#51](https://github.com/Jared-Godar/audio-lab/issues/51).
  - **Blocks launch if:** any public episode still carries the placeholder Daniel host voice.

- [ ] **[BLOCKER] Every asset in a public episode is licensed for commercial public distribution.**
  - **Verify:** enumerate each asset class and its license — ElevenLabs voice output (commercial-use terms for the account tier), intro/outro music ([#119](https://github.com/Jared-Godar/audio-lab/issues/119): original bed + live overdub, so licensable), episode-art fonts (licensed faces live only on the maintainer's machine and are **not** embedded or committed — `CLAUDE.md`, ADR 0007 and the #80 glyph-outline lineage), and any stock imagery. `(no unlicensed asset)` is the pass.
  - **Owner / issue:** [#119](https://github.com/Jared-Godar/audio-lab/issues/119), [#102](https://github.com/Jared-Godar/audio-lab/issues/102) (brand audit).
  - **Blocks launch if:** any font, music bed, voice, or image in a public episode lacks a commercial-distribution license.

- [ ] **[SHOULD] A published episode is reproducible from source.**
  - **Verify:** the tagging strategy ([#4](https://github.com/Jared-Godar/audio-lab/issues/4)) is decided and applied so each shipped episode maps to the source that produced it.
  - **Owner / issue:** [#4](https://github.com/Jared-Godar/audio-lab/issues/4).
  - **Blocks launch if:** a published episode cannot be reproduced from tagged source (accepted-risk with a recorded decision).

- [ ] **[SHOULD] Distribution targets are live before the announce, not after.**
  - **Verify:** the Transistor show is configured ([#100](https://github.com/Jared-Godar/audio-lab/issues/100)) and YouTube uploads carry chaptered descriptions ([#101](https://github.com/Jared-Godar/audio-lab/issues/101)).
  - **Owner / issue:** [#100](https://github.com/Jared-Godar/audio-lab/issues/100), [#101](https://github.com/Jared-Godar/audio-lab/issues/101).
  - **Blocks launch if:** the public announce points at a feed or channel that is not yet live.

## 5. Legal

*None of these has a tracking issue yet (see §7); the owner is the maintainer, and each
needs one filed before #110 runs.*

- [ ] **[BLOCKER] The operating entity exists if the project is presented as a business.**
  - **Verify:** LLC (or chosen entity) formation is confirmed, **or** a recorded decision that Told Straight launches as a personal project with no entity.
  - **Owner / issue:** maintainer (no issue — §7).
  - **Blocks launch if:** the public site implies a business or entity that does not legally exist.

- [ ] **[BLOCKER] The name and marks are clear to use.**
  - **Verify:** a trademark clearance check on "Told Straight" (and the wordmark/logo lineage under [#102](https://github.com/Jared-Godar/audio-lab/issues/102)/[#103](https://github.com/Jared-Godar/audio-lab/issues/103)) shows no conflicting registered mark in the relevant media class; note whether a registration is intended or deferred.
  - **Owner / issue:** maintainer; a weak proxy only is [#111](https://github.com/Jared-Godar/audio-lab/issues/111) (handle availability is not clearance).
  - **Blocks launch if:** the name collides with an existing mark in the podcast/media class.

- [ ] **[BLOCKER] A privacy policy is published if the site collects any personal data.**
  - **Verify:** determine what the MVP site collects (e.g. email capture on subscribe/listen — [#108](https://github.com/Jared-Godar/audio-lab/issues/108), [#128](https://github.com/Jared-Godar/audio-lab/issues/128)); if it collects anything, a privacy policy and any required consent are live before launch. If it collects nothing, that is stated explicitly.
  - **Owner / issue:** maintainer; relates to [#108](https://github.com/Jared-Godar/audio-lab/issues/108), [#128](https://github.com/Jared-Godar/audio-lab/issues/128).
  - **Blocks launch if:** the site captures email or analytics with no published privacy policy.

- [ ] **[SHOULD] Content and liability disclaimers are present where the format needs them.**
  - **Verify:** episode and show descriptions carry any needed disclaimers (opinion vs. advice; third-party names).
  - **Owner / issue:** maintainer.
  - **Blocks launch if:** the subject matter needs a disclaimer that is absent (accepted-risk with a recorded decision).

## 6. Accessibility — site + media

- [ ] **[BLOCKER] Published episodes have accurate transcripts.**
  - **Verify:** each public episode ships a transcript (transcripts are tracked under `episodes/`); confirm each matches the shipped cut, not a superseded draft.
  - **Owner / issue:** [#99](https://github.com/Jared-Godar/audio-lab/issues/99); relates to [#101](https://github.com/Jared-Godar/audio-lab/issues/101).
  - **Blocks launch if:** any episode lacks a transcript, or a transcript is out of sync with the audio.

- [ ] **[SHOULD] The MVP site meets a stated accessibility bar.**
  - **Verify:** the site ([#106](https://github.com/Jared-Godar/audio-lab/issues/106)/[#107](https://github.com/Jared-Godar/audio-lab/issues/107)/[#108](https://github.com/Jared-Godar/audio-lab/issues/108)/[#128](https://github.com/Jared-Godar/audio-lab/issues/128)) passes a WCAG 2.1 AA smoke check — semantic landmarks, alt text on all imagery, keyboard navigability, and color contrast on the brand palette ([#102](https://github.com/Jared-Godar/audio-lab/issues/102)). Name the tool used (axe, Lighthouse) and paste the score.
  - **Owner / issue:** maintainer; relates to [#106](https://github.com/Jared-Godar/audio-lab/issues/106)–[#108](https://github.com/Jared-Godar/audio-lab/issues/108), [#128](https://github.com/Jared-Godar/audio-lab/issues/128) — no dedicated a11y issue (§7).
  - **Blocks launch if:** primary content is unreachable by keyboard or screen reader, imagery lacks alt text, or brand contrast fails AA (accepted-risk with a recorded decision).

- [ ] **[SHOULD] Media is chaptered and navigable.**
  - **Verify:** YouTube descriptions carry chapters ([#101](https://github.com/Jared-Godar/audio-lab/issues/101)); the player and show pages expose episode structure.
  - **Owner / issue:** [#101](https://github.com/Jared-Godar/audio-lab/issues/101).
  - **Blocks launch if:** long-form media ships with no chapter navigation (accepted-risk with a recorded decision).

## 7. Gate items with no tracking issue yet

Truth-in-reporting: these items appear above but have **no issue to act on**. They are gaps
in the record, not optional. File a lightweight issue for each before #110 executes, so the
audit closes against a tracked item rather than the maintainer's memory:

1. Full-history secret scan of the public repo (§2) — no CI or issue requires it today.
2. DMARC `rua` report monitoring (§3) — reports arrive; nobody reads them (`infra/README.md` §182).
3. LLC / entity formation (§5).
4. Trademark clearance for "Told Straight" (§5).
5. Privacy policy for the MVP site (§5).
6. A stated site-accessibility bar and audit (§6).

## 8. Launch blockers at a glance

Public launch does not proceed while any **[BLOCKER]** above is uncleared. The known-open
blockers as this checklist is written — each re-verified by #110, never trusted from here:

- **Security:** an admin-principal long-lived key is still active ([#67](https://github.com/Jared-Godar/audio-lab/issues/67)).
- **Content:** the placeholder narrator voice is not yet replaced ([#117](https://github.com/Jared-Godar/audio-lab/issues/117)/[#55](https://github.com/Jared-Godar/audio-lab/issues/55)); the episode-completeness audit is open ([#99](https://github.com/Jared-Godar/audio-lab/issues/99)).
- **Legal:** entity, trademark clearance, and privacy policy are untracked (§7).
- **Everything else** is defined above with its own verify method and owner.

[#110](https://github.com/Jared-Godar/audio-lab/issues/110) turns each unchecked box into a
measured pass, a recorded accepted-risk, or a filed blocker — and only then a go/no-go.
