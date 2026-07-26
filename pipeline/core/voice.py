"""Voice and voice-settings types.

The whole reason `core/` exists: audition-v1's engine-agnostic ``Voice`` could not
carry ``voice_settings``, the single most important control for an ElevenLabs-only
tool. :class:`VoiceSettings` is that control; :class:`Voice` carries it; and
:class:`SharedVoice` models a row from the shared-library browse (#7).
"""

from __future__ import annotations

from dataclasses import dataclass, field

# Order matters: it is the order fields appear in the /v1/text-to-speech payload
# and in --list output. `None` on any field means "do not send it" — so the account
# or model default applies, rather than a value we invented.
VOICE_SETTING_FIELDS = (
    "stability",
    "similarity_boost",
    "style",
    "use_speaker_boost",
    "speed",
)


@dataclass
class VoiceSettings:
    """ElevenLabs ``voice_settings``. Every field optional; ``None`` = "don't send".

    Serialise with :meth:`to_payload`, which omits unset fields so an unset value
    never overrides an account/model default with a fabricated one.
    """

    stability: float | None = None
    similarity_boost: float | None = None
    style: float | None = None
    use_speaker_boost: bool | None = None
    speed: float | None = None

    def set_fields(self) -> list[str]:
        """Names of the fields that are actually set (non-``None``), in payload order."""
        return [f for f in VOICE_SETTING_FIELDS if getattr(self, f) is not None]

    def to_payload(self) -> dict:
        """The ``voice_settings`` object to send — set fields only, unset ones omitted."""
        return {f: getattr(self, f) for f in self.set_fields()}

    def is_empty(self) -> bool:
        return not self.set_fields()


@dataclass
class Voice:
    """An ElevenLabs voice on the account, plus the settings to render it with.

    Single vendor now, so there is no ``engine`` discriminator — ``voice_id`` is the
    key. ``settings`` is what audition-v1 structurally could not hold.
    """

    voice_id: str
    name: str
    locale: str = "en"
    category: str = ""
    description: str = ""
    settings: VoiceSettings = field(default_factory=VoiceSettings)
    meta: dict = field(default_factory=dict)

    @property
    def label(self) -> str:
        loc = f" ({self.locale})" if self.locale else ""
        return f"{self.name}{loc}"

    def key(self) -> str:
        return self.voice_id


@dataclass
class SharedVoice:
    """One voice from the shared library (`GET /v1/shared-voices`).

    ``users`` is ``cloned_by_count`` — the adopter count Round-I screening sorts on.
    The field set is deliberately the exact set the hand-built 12-candidate sweep
    recorded in ``artifacts/voice-previews/manifest.json`` (#7 §2), so a manifest this
    tool writes is schema-compatible with that authoritative sweep.
    """

    voice_id: str
    name: str
    accent: str = ""
    age: str = ""
    gender: str = ""
    users: int = 0  # cloned_by_count
    descriptive: str = ""
    description: str = ""
    category: str = ""
    preview_url: str = ""

    @classmethod
    def from_api(cls, d: dict) -> "SharedVoice":
        return cls(
            voice_id=d.get("voice_id", ""),
            name=d.get("name", ""),
            accent=d.get("accent", "") or "",
            age=d.get("age", "") or "",
            gender=d.get("gender", "") or "",
            users=d.get("cloned_by_count", 0) or 0,
            descriptive=d.get("descriptive", "") or "",
            description=d.get("description", "") or "",
            category=d.get("category", "") or "",
            preview_url=d.get("preview_url", "") or "",
        )

    def manifest_entry(self, file: str) -> dict:
        """A manifest row matching the exact key order of the #7 §2 authoritative sweep."""
        return {
            "file": file,
            "voice_id": self.voice_id,
            "name": self.name,
            "accent": self.accent,
            "age": self.age,
            "gender": self.gender,
            "users": self.users,
            "descriptive": self.descriptive,
            "description": self.description,
        }
