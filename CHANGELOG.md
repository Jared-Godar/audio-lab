# Changelog

Personal recordkeeping for audio-lab. Dated entries, newest first — no releases,
no semver, just what changed and why it mattered.

Grouped as **Added / Changed / Fixed / Findings**. *Findings* is the one that
isn't standard: it records things learned about external services that aren't
visible in the diff and would otherwise evaporate.

## 2026-07-26

### Added

- Tiered model selection for ElevenLabs: `--tier {draft,cast,production}`,
  with `--model` to override a tier's model at equal cost.
  - `draft` — Turbo v2.5 @ 128 kbps, ~half price, for read-throughs and timing.
  - `cast` — Multilingual v2 @ 192 kbps. Auditions deliberately render at
    production quality; casting on draft output means judging a voice you will
    never ship.
  - `production` — Multilingual v2 @ 192 kbps, the final master.
- `--list-models` — models, listed vs effective rates, and what each tier is for.
- `--check-rates` — re-derives real billing per model from `/v1/history`, so the
  account discount is verifiable instead of a hardcoded assumption.
- Credit ledger printed at session start and finish, with a colour threshold.
- Bounded retry with exponential backoff on all ElevenLabs calls. Transient
  failures only; fail-fast with plain-language hints on 401/402/403/404/422.
  Synthesis is capped at 2 attempts because a retry can re-bill.

- `CLAUDE.md` — project instructions, including the self-describing-filename rule.
- `artifacts/` — gitignored working zone for handoffs, walkthroughs and guides.
  Durable findings still belong in `docs/` and this changelog.
- Lean CI: pre-commit (ruff, markdownlint, shellcheck, gitleaks, zizmor) and a
  locked-environment check per uv subproject, on every PR and push to main.
  Deliberately sized for the repo as it stands; `quality.yml` lists the growth
  hooks to add later rather than adding them now.
- Governance: PR template, a small label taxonomy in `.github/labels.json`, and a
  changelog gate that fails any PR not touching this file. The gate exists because
  a rule with nothing enforcing it depends on somebody remembering; `skip-changelog`
  is the escape hatch for genuinely trivial changes.
- Branch protection on `main`: pull request required, quality gates must pass,
  linear history, no force-pushes or deletions, `enforce_admins: true`.
- `AGENTS.md` — the standing contract binding every agent session, tracked so
  cold-start sessions that inherit no local memory are still bound by it. Carries
  the meta-contract (read the durable contracts, don't assume, durable contract
  outranks the prompt), the do-automatically list, the hold-for-the-maintainer
  list, and the canonical PR workflow. Modelled on the portfolio-mod/ECG pattern,
  scaled down to this repo.
- `CLAUDE.md` gains PM/executor session modes and the requirement that executor
  specs open by reading the durable contracts.

- `ROADMAP.md` — milestones M1–M6, plus a "Decisions and what they constrain"
  section recording how settled choices reach forward into later work (e.g. Route 53
  auto-creating the hosted zone means CloudFormation manages records, not zones).
  GitHub milestones mirror it.
- Registered `toldstraight.com` (2026-07-26, $16/yr, auto-renew, privacy on).
  `toldstraight.fm` skipped at $122/yr; `vote.toldstraight.com` will be a subdomain.

### Fixed

- **Rendered samples were named by hash.** A three-way model comparison landed as
  `76a676a12824.mp3` / `facf0b2fbe0a.mp3` / `a7a79bffe119.mp3`, which is unusable
  for a human asked to listen to them. Filenames are now
  `YYYYMMDD-VENDOR-MODEL-VOICE-PURPOSE-BITRATE.mp3` and per-voice folders are
  `<voice>-<short-id>` rather than a bare 20-char id; exact cache identity moved to
  a sibling `manifest.json`, so correctness no longer costs readability. Vendor is
  explicit so a repo with several TTS providers stays legible at a glance.
- **Sample cache collided across models.** `sample_path()` hashed only the text,
  so a half-price draft render and a 192 kbps master of the same line resolved to
  one file — you would have cast from, or shipped, whichever generated first. The
  cache key now includes model and bitrate.
- **192 kbps was silently impossible.** `synthesize()` sent no `output_format`,
  so every render came back at the 128 kbps default regardless of intent.
- **Library voices were hidden.** `list_voices()` dropped everything except
  `category == "premade"` — a free-tier workaround that would have concealed every
  voice added from the shared library.

### Changed

- Per-call cost estimates now reflect the measured account rate rather than the
  advertised multiplier, so the spend confirmation prompt is trustworthy.

### Findings

- **ElevenLabs bills at 0.55x its advertised `character_cost_multiplier`** on this
  account. Confirmed against `/v1/history`: seven Turbo generations predating the
  Creator upgrade billed at 0.504x; two after it billed at 0.275x. Same model, same
  endpoint. The discount is uniform across all four TTS models, so the real monthly
  ceiling is ~237k characters of production audio, not the 130,552 credit figure.
- **v3 and Multilingual v2 cost exactly the same** (both 0.55x effective). Choosing
  between them is a pure quality decision with no budget consequence.
- **The `/v1/user/subscription` counter lags by tens of seconds** and cannot be used
  to attribute cost to an individual request — it misattributes deltas between
  back-to-back calls. `/v1/history` is the authoritative per-generation record.
  `eleven_v3` does not log its text there, so its rate must be derived from known
  input length.
- **One Professional Voice Clone slot** on Creator (`professional_voice_limit: 1`),
  against 30 total voice slots and unlimited Instant cloning.

## 2026-07-23

### Added

- Voice audition applet (`pipeline/audition/`): engine-agnostic TTS auditioning
  with a listen/verdict loop, shortlist replay, role casting, and a sample cache.
  Adapters for edge-tts, ElevenLabs, and local Kokoro.
- "Told Straight" Ep01 and Ep02 deliverables — transcripts, show notes, chapter
  art, captions, alt text.

### Changed

- `.gitignore` reworked to track episode deliverables (art, transcripts, notes)
  while excluding secrets, PII, virtualenvs, and heavy media.

## 2026-07-22

### Added

- Initial repository structure: `fish/` shell functions, `pipeline/` and
  `spotify/` uv projects, `scripts/`, `docs/`, `prompts/`.
