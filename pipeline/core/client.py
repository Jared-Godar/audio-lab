"""ElevenLabs client — account voices, billing, synthesis, shared-library browsing.

ElevenLabs-only by design (#6). Everything that spends credits is guarded and quoted;
everything here that reads (`/v1/voices`, `/v1/models`, `/v1/shared-voices`, previews,
`/v1/history`, `/v1/user/subscription`) is free.
"""

from __future__ import annotations

import os
import warnings
from pathlib import Path

from .models import ACCOUNT_RATE_FACTOR, DEFAULT_TIER, MODELS, TIERS, Model
from .naming import (
    load_preview_manifest,
    preview_filename,
    save_preview_manifest,
    PREVIEWS_DIR,
)
from .net import ExternalServiceError, request_with_retry
from .voice import SharedVoice, Voice, VoiceSettings

API = "https://api.elevenlabs.io/v1"


class ElevenLabsClient:
    """Thin wrapper over the ElevenLabs REST API with the tier/model machinery."""

    def __init__(self, tier: str = DEFAULT_TIER) -> None:
        self.apply_tier(tier)

    # -- tier / model wiring ------------------------------------------------ #

    def apply_tier(self, tier_name: str) -> None:
        tier = TIERS[tier_name]
        self.tier = tier
        self.model: Model = MODELS[tier.model]
        self.output_format = tier.output_format

    def override_model(self, model_key: str) -> None:
        """Keep the tier's bitrate, swap the model — for A/B tests at equal cost."""
        self.model = MODELS[model_key]

    @property
    def variant(self) -> str:
        return f"{self.model.model_id}|{self.output_format}"

    # -- account ------------------------------------------------------------ #

    def _key(self) -> str | None:
        return os.environ.get("ELEVENLABS_API_KEY")

    def _headers(self) -> dict:
        return {"xi-api-key": self._key() or ""}

    def available(self) -> bool:
        return bool(self._key())

    def credits_remaining(self) -> tuple[int, int]:
        """(remaining, monthly_limit) for the current billing cycle."""
        r = request_with_retry(
            "GET", f"{API}/user/subscription", headers=self._headers(), timeout=15
        )
        d = r.json()
        limit = d.get("character_limit", 0)
        return limit - d.get("character_count", 0), limit

    def list_voices(self) -> list[Voice]:
        """Voices already on the account (`/v1/voices`)."""
        r = request_with_retry(
            "GET", f"{API}/voices", headers=self._headers(), timeout=15
        )
        out = []
        for v in r.json().get("voices", []):
            out.append(
                Voice(
                    voice_id=v["voice_id"],
                    name=v["name"].split(" - ")[0],
                    locale="en",
                    category=v.get("category", "") or "",
                    description=v.get("name", ""),
                )
            )
        return sorted(out, key=lambda v: v.name)

    # -- billing ------------------------------------------------------------ #

    @property
    def effective_rate(self) -> float:
        """Credits actually billed per character, discount included."""
        return self.model.cost_multiplier * ACCOUNT_RATE_FACTOR

    def estimate_credits(self, text: str) -> int:
        return round(len(text) * self.effective_rate)

    def history_rows(self, limit: int = 80) -> list[dict]:
        """Raw per-generation rows from `/v1/history`, newest first.

        Each row carries its ``id`` (``history_item_id``), ``model_id`` and ``billed``
        (the ``character_count_change`` delta = credits actually charged). Reconciliation
        diffs the id set before and after a batch, so a spend is attributed from the
        authoritative per-generation record — never from ``/v1/user/subscription``, which
        lags by tens of seconds and misattributes back-to-back calls. ``eleven_v3`` omits
        its text here, but the ``billed`` delta is always present.
        """
        r = request_with_retry(
            "GET",
            f"{API}/history",
            headers=self._headers(),
            params={"page_size": limit},
            timeout=20,
        )
        rows = []
        for h in r.json().get("history", []):
            rows.append(
                {
                    "id": h.get("history_item_id"),
                    "model_id": h.get("model_id") or "?",
                    "billed": h.get("character_count_change_to", 0)
                    - h.get("character_count_change_from", 0),
                }
            )
        return rows

    def recent_rates(self, limit: int = 40) -> list[dict]:
        """Per-generation billing straight from history — the source of truth.

        The `/v1/user/subscription` counter lags by tens of seconds and cannot be used
        to attribute cost to an individual request; this can.
        """
        r = request_with_retry(
            "GET",
            f"{API}/history",
            headers=self._headers(),
            params={"page_size": limit},
            timeout=20,
        )
        rows = []
        for h in r.json().get("history", []):
            billed = h.get("character_count_change_to", 0) - h.get(
                "character_count_change_from", 0
            )
            rows.append(
                {
                    "model_id": h.get("model_id") or "?",
                    "chars": len(h.get("text") or ""),  # 0 for models that omit text
                    "billed": billed,
                }
            )
        return rows

    # -- model capabilities ------------------------------------------------- #

    def fetch_model_capabilities(self) -> dict[str, dict]:
        """Live per-model capability flags from `/v1/models` (free).

        Returns ``{model_id: {"can_use_style": bool, "can_use_speaker_boost": bool}}``
        for every text-to-speech model the account can see.
        """
        r = request_with_retry(
            "GET", f"{API}/models", headers=self._headers(), timeout=20
        )
        caps = {}
        for m in r.json():
            if not m.get("can_do_text_to_speech"):
                continue
            caps[m["model_id"]] = {
                "can_use_style": bool(m.get("can_use_style")),
                "can_use_speaker_boost": bool(m.get("can_use_speaker_boost")),
            }
        return caps

    def reconcile_capabilities(self) -> list[str]:
        """Warn if the static MODELS flags disagree with live `/v1/models`.

        A 200 is not a result: this is how we notice the day ElevenLabs flips a
        capability out from under the hardcoded table. Returns the divergence lines
        (empty when everything matches).
        """
        live = self.fetch_model_capabilities()
        drift = []
        for m in MODELS.values():
            got = live.get(m.model_id)
            if got is None:
                continue
            for flag in ("can_use_style", "can_use_speaker_boost"):
                if getattr(m, flag) != got[flag]:
                    drift.append(
                        f"{m.model_id}: static {flag}={getattr(m, flag)} "
                        f"but /v1/models reports {got[flag]}"
                    )
        for line in drift:
            warnings.warn(f"model capability drift — {line}", stacklevel=2)
        return drift

    # -- synthesis (spends credits) ----------------------------------------- #

    def _warn_unhonored(self, settings: VoiceSettings) -> list[str]:
        ignored = self.model.unhonored(settings)
        for field_name in ignored:
            warnings.warn(
                f"{self.model.model_id} does not honour '{field_name}' — it will be "
                f"silently ignored (a 200 does not mean the setting applied).",
                stacklevel=2,
            )
        return ignored

    def synthesize(
        self,
        voice: Voice,
        text: str,
        out_path: Path,
        settings: VoiceSettings | None = None,
    ) -> Path:
        """Render ``text`` in ``voice`` to ``out_path``. Spends credits.

        Settings resolution: the explicit ``settings`` argument wins, else the voice's
        own ``settings``. Any field the selected model does not honour raises a
        warning naming the field and model before the request is made.
        """
        if len(text) > self.model.max_chars:
            raise ExternalServiceError(
                f"{len(text):,} chars exceeds the {self.model.max_chars:,} limit for "
                f"{self.model.label}. Render chapter by chapter and concatenate."
            )
        eff = settings if settings is not None else voice.settings
        self._warn_unhonored(eff)

        body: dict = {"text": text, "model_id": self.model.model_id}
        payload = eff.to_payload()
        if payload:
            body["voice_settings"] = payload

        r = request_with_retry(
            "POST",
            f"{API}/text-to-speech/{voice.voice_id}",
            attempts=2,  # a retry can re-bill; keep the blast radius to one
            headers={**self._headers(), "Content-Type": "application/json"},
            params={"output_format": self.output_format},
            json=body,
            timeout=120,
        )
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(r.content)
        return out_path

    # -- shared library (free) ---------------------------------------------- #

    def browse_shared(
        self,
        *,
        gender: str | None = None,
        accent: str | None = None,
        age: str | None = None,
        category: str | None = None,
        search: str | None = None,
        language: str = "en",
        min_users: int = 0,
        sort: str = "cloned_by_count",
        max_results: int = 30,
        page_size: int = 30,
    ) -> list[SharedVoice]:
        """Browse `GET /v1/shared-voices`, paginated, filtered, sorted.

        Pagination follows ``page``/``page_size`` until ``has_more`` is false or
        ``max_results`` is reached — it does NOT stop at page one. ``min_users`` is a
        client-side floor on ``cloned_by_count`` (the API has no such parameter); when
        sorting by adopter count descending, dropping below the floor ends the scan,
        since every later voice is lower.
        """
        base = {"page_size": min(page_size, max_results) or 1, "sort": sort}
        for name, val in (
            ("gender", gender),
            ("accent", accent),
            ("age", age),
            ("category", category),
            ("search", search),
            ("language", language),
        ):
            if val:
                base[name] = val

        collected: list[SharedVoice] = []
        page = 0
        while len(collected) < max_results:
            params = dict(base, page=page)
            r = request_with_retry(
                "GET",
                f"{API}/shared-voices",
                headers=self._headers(),
                params=params,
                timeout=25,
            )
            data = r.json()
            voices = [SharedVoice.from_api(v) for v in data.get("voices", [])]
            if not voices:
                break
            below_floor = False
            for sv in voices:
                if sv.users < min_users:
                    # Sorted by adopter count desc -> everything after is lower too.
                    if sort == "cloned_by_count":
                        below_floor = True
                        break
                    continue
                collected.append(sv)
                if len(collected) >= max_results:
                    break
            if below_floor or not data.get("has_more"):
                break
            page += 1
        return collected[:max_results]

    def download_preview(self, sv: SharedVoice, purpose: str) -> Path | None:
        """Download a library voice's free ``preview_url`` to a descriptive path.

        Free — no credits, no adding the voice to the account. Skips the download if a
        preview for this ``voice_id`` is already recorded. Never writes to the
        authoritative ``artifacts/voice-previews/`` sweep. Returns the file path (or
        the existing one on a skip).
        """
        if not sv.preview_url:
            raise ExternalServiceError(
                f"{sv.name} has no preview_url — cannot screen it for free."
            )
        rows = load_preview_manifest()
        for row in rows:
            if row.get("voice_id") == sv.voice_id:
                existing = PREVIEWS_DIR / row["file"]
                if existing.exists():
                    return existing

        name = preview_filename(sv, purpose)
        # Disambiguate a readable-name collision with a numeric suffix, never a hash.
        taken = {row["file"] for row in rows}
        stem, n = name[:-4], 2
        while name in taken:
            name, n = f"{stem}-{n}.mp3", n + 1

        r = request_with_retry("GET", sv.preview_url, timeout=30)
        PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)
        out = PREVIEWS_DIR / name
        out.write_bytes(r.content)

        rows.append(sv.manifest_entry(name))
        save_preview_manifest(rows)
        return out
