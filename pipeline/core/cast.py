"""Cast record loader — the tracked source of truth for who plays which role (#40).

``ROADMAP.md`` § M2 ends the casting funnel in "cast and pin voice IDs." Before this,
the pin lived only in an issue comment, indistinguishable to a future session from the
four candidates that lost. ``episodes/cast.json`` is the pin; this loader turns it
into a :class:`~core.voice.Voice` so M3 (#11) and M4 read one source of truth instead
of re-deriving the choice from :mod:`core.screentest`'s candidate list.
"""

from __future__ import annotations

import json
from pathlib import Path

from .voice import Voice

# core/cast.py -> parents[2] is the repo root (pipeline/core/cast.py).
REPO_ROOT = Path(__file__).resolve().parents[2]
CAST_PATH = REPO_ROOT / "episodes" / "cast.json"

_REQUIRED_FIELDS = ("role", "voice_id", "name")


class CastError(RuntimeError):
    """``episodes/cast.json`` is missing, malformed, or has no entry for a role.

    Raised instead of a bare ``KeyError``/``FileNotFoundError`` traceback so a caller
    always sees which file was wrong and why (``AGENTS.md`` § "Defensively code every
    external call" — the reasoning applies to any boundary the process does not
    control, not only the network).
    """


def load_cast(path: Path = CAST_PATH) -> list[dict]:
    """The raw cast entries from ``episodes/cast.json``."""
    if not path.exists():
        raise CastError(f"{path} does not exist — nothing has been cast yet.")
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        raise CastError(f"{path} is not valid JSON: {exc}") from exc
    if not isinstance(data, list):
        raise CastError(
            f"{path} must be a JSON array of cast entries, got {type(data).__name__}."
        )
    for i, entry in enumerate(data):
        if not isinstance(entry, dict):
            raise CastError(
                f"{path} entry {i} must be an object, got {type(entry).__name__}."
            )
        missing = [f for f in _REQUIRED_FIELDS if f not in entry]
        if missing:
            raise CastError(
                f"{path} entry {i} is missing required field(s): {missing}."
            )
    return data


def cast_voice(role: str, path: Path = CAST_PATH) -> Voice:
    """The pinned :class:`Voice` for ``role``, usable directly by ``ElevenLabsClient.synthesize``.

    The full cast entry (episode, vendor, model, output_format, source, chosen_by,
    chosen_on, provenance) rides along in ``Voice.meta`` so no downstream caller needs
    to re-parse ``cast.json`` or retype the id to get at it.
    """
    entries = load_cast(path)
    for entry in entries:
        if entry["role"] == role:
            return Voice(
                voice_id=entry["voice_id"],
                name=entry["name"],
                description=entry.get("provenance", ""),
                meta=dict(entry),
            )
    roles = ", ".join(sorted({e["role"] for e in entries})) or "(none)"
    raise CastError(f"{path} has no entry for role {role!r}. Roles present: {roles}.")
