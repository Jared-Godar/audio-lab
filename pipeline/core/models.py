"""ElevenLabs models, cost tiers, and per-model voice-setting capabilities.

The tier system and the measured 0.55x account rate are carried over from
audition-v1 unchanged — they encode findings (`docs/elevenlabs.md`), not preferences.
What is new here is that each :class:`Model` records which ``voice_settings`` it
actually honours, straight from the `/v1/models` capability flags, so a caller who
sets ``style`` on a model that ignores it gets an explicit warning instead of silence.
"""

from __future__ import annotations

from dataclasses import dataclass

VENDOR = "elevenlabs"  # single vendor now; kept explicit for self-describing filenames


@dataclass(frozen=True)
class Model:
    """An ElevenLabs TTS model, its cost, and the settings it honours.

    ``cost_multiplier`` is credits charged per character, straight from
    ``/v1/models -> model_rates.character_cost_multiplier``.

    ``can_use_style`` / ``can_use_speaker_boost`` mirror the identically-named
    capability flags on ``/v1/models`` (verified live 2026-07-26). They gate whether
    the corresponding ``voice_settings`` field reaches the model or is silently
    dropped — the exact trap the project rule warns about: "v3 silently ignores
    style and speaker_boost."
    """

    model_id: str
    label: str
    cost_multiplier: float
    max_chars: int
    can_use_style: bool = False
    can_use_speaker_boost: bool = False

    @property
    def honored_settings(self) -> frozenset[str]:
        """The ``voice_settings`` fields this model actually applies.

        ``stability``, ``similarity_boost`` and ``speed`` are accepted by every TTS
        model (the endpoint clamps rather than rejects), so they are always honoured.
        ``style`` and ``use_speaker_boost`` are gated by the live capability flags —
        the only two the API authoritatively reports a model does not honour.
        """
        base = {"stability", "similarity_boost", "speed"}
        if self.can_use_style:
            base.add("style")
        if self.can_use_speaker_boost:
            base.add("use_speaker_boost")
        return frozenset(base)

    def unhonored(self, settings) -> list[str]:
        """Return the fields ``settings`` sets that this model would silently ignore.

        Accepts a :class:`~core.voice.VoiceSettings` (anything exposing
        ``set_fields()``). Empty list means every set field is honoured.
        """
        return [f for f in settings.set_fields() if f not in self.honored_settings]


# Capability flags verified live against GET /v1/models on 2026-07-26:
# only multilingual_v2 reports can_use_style / can_use_speaker_boost = true; v3,
# turbo_v2_5 and flash_v2 report both false. Re-check with `voicelab models --live`.
MODELS = {
    "v3": Model(
        "eleven_v3",
        "Eleven v3 — most expressive, audio-tag driven",
        cost_multiplier=1.0,
        max_chars=5_000,
    ),
    "multilingual_v2": Model(
        "eleven_multilingual_v2",
        "Multilingual v2 — voiceover/audiobook workhorse",
        cost_multiplier=1.0,
        max_chars=10_000,
        can_use_style=True,
        can_use_speaker_boost=True,
    ),
    "turbo_v2_5": Model(
        "eleven_turbo_v2_5",
        "Turbo v2.5 — half price, 32 languages",
        cost_multiplier=0.5,
        max_chars=40_000,
    ),
    "flash_v2": Model(
        "eleven_flash_v2",
        "Flash v2 — half price, English only, lowest latency",
        cost_multiplier=0.5,
        max_chars=30_000,
    ),
}


@dataclass(frozen=True)
class Tier:
    """A task-pinned quality/cost preset.

    The point is to spend cheaply where the output is thrown away and dearly where it
    ships — without having to remember model ids at the call site.
    """

    name: str
    model: str  # key into MODELS
    output_format: str  # ElevenLabs output_format code
    why: str


TIERS = {
    "draft": Tier(
        "draft",
        "turbo_v2_5",
        "mp3_44100_128",
        "half-price read-throughs — timing, pacing, does-this-line-land. Turbo "
        "over Flash: same price, better quality, 40k chars (a whole episode in "
        "one request); Flash only wins on realtime latency, which batch work "
        "never needs",
    ),
    "cast": Tier(
        "cast",
        "multilingual_v2",
        "mp3_44100_192",
        "auditions render at production quality; casting on draft output means "
        "judging a voice you will never actually ship",
    ),
    "production": Tier(
        "production",
        "multilingual_v2",
        "mp3_44100_192",
        "final master — swap to v3 with --model to A/B expressiveness at identical cost",
    ),
}

DEFAULT_TIER = "cast"

# Every model on this account bills at ~0.55x its advertised multiplier.
# Measured 2026-07-26 from /v1/history (character_count_change deltas):
#   multilingual_v2 0.55  v3 0.55  flash_v2 0.27  turbo_v2_5 0.27
# against listed rates of 1.0 / 1.0 / 0.5 / 0.5 — a uniform Creator-tier discount.
# Re-measure with:  voicelab rates
# If the discount lapses, estimates become conservative (over-quoted), never under.
ACCOUNT_RATE_FACTOR = 0.55
