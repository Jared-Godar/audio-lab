"""core — ElevenLabs-only voice tooling foundation (#6, #7).

Replaces the retired multi-engine audition-v1 (now in ``archive/audition-v1/``). The
one structural gain: a :class:`Voice` that carries :class:`VoiceSettings`, plus
shared-library browsing to reach the real casting pool.
"""

from __future__ import annotations

from .client import ElevenLabsClient
from .models import (
    ACCOUNT_RATE_FACTOR,
    DEFAULT_TIER,
    MODELS,
    TIERS,
    VENDOR,
    Model,
    Tier,
)
from .net import ExternalServiceError, request_with_retry
from .voice import SharedVoice, Voice, VoiceSettings

__all__ = [
    "ElevenLabsClient",
    "Voice",
    "VoiceSettings",
    "SharedVoice",
    "Model",
    "Tier",
    "MODELS",
    "TIERS",
    "DEFAULT_TIER",
    "ACCOUNT_RATE_FACTOR",
    "VENDOR",
    "ExternalServiceError",
    "request_with_retry",
]
