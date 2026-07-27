"""Cast record loader tests (#40).

`episodes/cast.json` is a local file, not a network boundary, so nothing here stubs
HTTP — there is no call to stub. Still zero credits: `cast.py` never imports the
ElevenLabs client.
"""

from __future__ import annotations

import json

import pytest

from core.cast import CastError, cast_voice, load_cast
from core.voice import Voice


@pytest.fixture
def cast_file(tmp_path):
    def _write(entries):
        p = tmp_path / "cast.json"
        p.write_text(json.dumps(entries))
        return p

    return _write


# --------------------------------------------------------------------------- #
# Happy path — the real episodes/cast.json loads and resolves the pinned voice.
# --------------------------------------------------------------------------- #


def test_real_cast_json_resolves_cohost():
    """The tracked episodes/cast.json (the file this PR adds) loads for real."""
    voice = cast_voice("co-host")
    assert isinstance(voice, Voice)
    assert voice.voice_id == "NuRyEq0OdD9mMOyd51UZ"
    assert voice.name == "Jofra – Expressive & Neutral Narrator"


def test_cast_voice_returns_usable_voice(cast_file):
    path = cast_file(
        [
            {
                "role": "co-host",
                "voice_id": "abc123",
                "name": "Test Voice",
                "model": "eleven_v3",
                "provenance": "unit test",
            }
        ]
    )
    voice = cast_voice("co-host", path=path)
    assert voice.voice_id == "abc123"
    assert voice.name == "Test Voice"
    assert voice.description == "unit test"
    assert voice.meta["model"] == "eleven_v3"  # full entry rides along, no re-parsing


# --------------------------------------------------------------------------- #
# Negative tests — missing / malformed / unknown-role each fail with a clear
# message naming the file, never a bare KeyError or traceback.
# --------------------------------------------------------------------------- #


def test_missing_file_fails_clearly(tmp_path):
    absent = tmp_path / "nope.json"
    with pytest.raises(CastError, match=r"does not exist"):
        load_cast(absent)


def test_malformed_json_fails_clearly(tmp_path):
    p = tmp_path / "cast.json"
    p.write_text("{not json")
    with pytest.raises(CastError, match=r"not valid JSON"):
        load_cast(p)


def test_unknown_role_fails_clearly(cast_file):
    path = cast_file([{"role": "co-host", "voice_id": "abc", "name": "Test"}])
    with pytest.raises(CastError, match=r"no entry for role 'narrator'.*co-host"):
        cast_voice("narrator", path=path)


def test_entry_missing_required_field_fails_clearly(cast_file):
    path = cast_file([{"role": "co-host", "voice_id": "abc"}])  # no "name"
    with pytest.raises(CastError, match=r"missing required field.*name"):
        load_cast(path)


def test_non_array_json_fails_clearly(tmp_path):
    p = tmp_path / "cast.json"
    p.write_text(json.dumps({"role": "co-host"}))
    with pytest.raises(CastError, match=r"must be a JSON array"):
        load_cast(p)
