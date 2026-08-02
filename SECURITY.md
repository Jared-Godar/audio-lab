# Security policy

## Scope

audio-lab is a personal podcast-production toolkit. Its security surface is small
and specific: a third-party TTS API key, and the risk of that key (or any other
secret) landing in git history on a **public** repository.

## Reporting a vulnerability

Use GitHub's **private vulnerability reporting** (repository → **Security** tab →
**Report a vulnerability**) rather than opening a public issue. If a secret has been
exposed, **revoke it first, then report** — revocation is the fix, disclosure is
secondary.

Never open a public issue or PR containing credentials, API keys, or raw scan output.
If the full-history secret scan finds something, it is reported privately, never in a
public PR/issue body.

## Secret handling

- `ELEVENLABS_API_KEY` lives in the **shell environment only** — never in a `.env`, a
  config file, or source. There is deliberately no dotenv dependency for it.
- It is **not in the environment by default**. The maintainer's machine loads it on
  demand from 1Password through a Fish function (`secrets-load`), which exports it into
  the current shell and never writes it to disk; `with-secrets <command>` scopes it to a
  single child process instead. Both are machine-local and untracked, so no clone of this
  repository carries them (#233).
- **A key passed as a command argument is a leaked key.** The shell writes the command
  and its arguments to a history file, so `set -gx ELEVENLABS_API_KEY <value>` outlives
  the session in plaintext. The same applies to `op item create` field assignments — use
  a template read from standard input instead.
- Secrets are gated locally by the `gitleaks` and `detect-private-key` pre-commit hooks
  (install them with `pre-commit install` — a configured hook that is not installed
  does nothing), and in CI by the per-push pre-commit run plus the recurring
  `full-history-scan.yml` workflow, which re-scans the complete git history weekly.
- A key that is ever committed must be treated as compromised: revoke and rotate it at
  the provider before any history rewrite is considered.

## Supported versions

There are no releases; fixes apply to the default branch (`main`).
