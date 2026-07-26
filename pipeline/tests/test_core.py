"""Controls for the core/ voice layer.

Every test that would otherwise hit the network monkeypatches the HTTP layer, so the
suite spends zero credits and runs offline — the same reason the acceptance criteria
call for a *control* rather than a live smoke test.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from core import MODELS, ElevenLabsClient, SharedVoice, Voice, VoiceSettings
from core import client as client_mod
from core.voice import VOICE_SETTING_FIELDS


# --------------------------------------------------------------------------- #
# VoiceSettings serialisation — None means "don't send"
# --------------------------------------------------------------------------- #


def test_voice_settings_omits_unset_fields():
    vs = VoiceSettings(stability=0.4, style=0.6)
    assert vs.to_payload() == {"stability": 0.4, "style": 0.6}
    assert vs.set_fields() == ["stability", "style"]


def test_empty_voice_settings_is_empty_payload():
    vs = VoiceSettings()
    assert vs.is_empty()
    assert vs.to_payload() == {}


def test_payload_field_order_matches_declared_order():
    vs = VoiceSettings(
        speed=1.0,
        stability=0.5,
        use_speaker_boost=True,
        similarity_boost=0.7,
        style=0.1,
    )
    assert vs.set_fields() == list(VOICE_SETTING_FIELDS)


# --------------------------------------------------------------------------- #
# Per-model honored settings (from /v1/models capability flags) — the control:
# v3 does NOT honour style/speaker_boost; multilingual_v2 does.
# --------------------------------------------------------------------------- #


def test_v3_does_not_honour_style_or_speaker_boost():
    unhonored = MODELS["v3"].unhonored(
        VoiceSettings(style=0.5, use_speaker_boost=True, stability=0.4)
    )
    assert set(unhonored) == {"style", "use_speaker_boost"}
    # stability is universally honoured, so it must NOT be flagged.
    assert "stability" not in unhonored


def test_multilingual_v2_honours_style_and_boost():
    unhonored = MODELS["multilingual_v2"].unhonored(
        VoiceSettings(style=0.5, use_speaker_boost=True, stability=0.4, speed=1.1)
    )
    assert unhonored == []


def test_synthesize_warns_on_unhonored_setting(monkeypatch, tmp_path):
    """Control: setting style on v3 emits an explicit warning naming setting + model,
    and the warning path does NOT depend on a real API call (network is stubbed)."""

    class FakeResp:
        content = b"ID3fake-mp3-bytes"

    calls = {}

    def fake_request(method, url, **kw):
        calls["json"] = kw.get("json")
        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)

    client = ElevenLabsClient()
    client.override_model("v3")
    voice = Voice(voice_id="abc123", name="Test")
    out = tmp_path / "out.mp3"

    with pytest.warns(UserWarning, match=r"eleven_v3 does not honour 'style'"):
        client.synthesize(voice, "hello", out, VoiceSettings(style=0.9, stability=0.3))

    assert out.read_bytes() == b"ID3fake-mp3-bytes"
    # style was still sent (the API drops it), but the caller was warned.
    assert calls["json"]["voice_settings"] == {"stability": 0.3, "style": 0.9}


def test_synthesize_omits_voice_settings_when_empty(monkeypatch, tmp_path):
    class FakeResp:
        content = b"x"

    captured = {}

    def fake_request(method, url, **kw):
        captured["json"] = kw.get("json")
        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)
    client = ElevenLabsClient()
    client.synthesize(Voice("v", "V"), "hi", tmp_path / "o.mp3")
    assert "voice_settings" not in captured["json"]


# --------------------------------------------------------------------------- #
# Shared-library browsing — filter control + pagination cursor advance
# --------------------------------------------------------------------------- #


def _fake_shared_pages(pages):
    """Build a request stub that serves `pages` (list of (voices, has_more)) by page."""
    seen_pages = []

    class FakeResp:
        def __init__(self, payload):
            self._p = payload

        def json(self):
            return self._p

    def fake_request(method, url, **kw):
        page = kw["params"]["page"]
        seen_pages.append(page)
        voices, has_more = pages[page]
        return FakeResp({"voices": voices, "has_more": has_more, "total_count": 99})

    return fake_request, seen_pages


def _voice(vid, users, accent="british", gender="male"):
    return {
        "voice_id": vid,
        "name": f"Voice {vid}",
        "accent": accent,
        "age": "young",
        "gender": gender,
        "cloned_by_count": users,
        "descriptive": "clear",
        "description": "desc",
        "category": "professional",
        "preview_url": f"https://example/{vid}.mp3",
    }


def test_browse_paginates_past_page_one(monkeypatch):
    pages = [
        ([_voice("a", 500), _voice("b", 400)], True),
        ([_voice("c", 300), _voice("d", 200)], False),
    ]
    fake_request, seen = _fake_shared_pages(pages)
    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)
    client = ElevenLabsClient()
    got = client.browse_shared(max_results=10, page_size=2)
    assert [v.voice_id for v in got] == ["a", "b", "c", "d"]
    assert seen == [0, 1]  # it did NOT stop at page one


def test_browse_min_users_floor_short_circuits(monkeypatch):
    # Sorted desc by adopters; once below the floor it must stop, not keep paging.
    pages = [
        ([_voice("a", 5000), _voice("b", 4000), _voice("c", 50)], True),
        ([_voice("d", 40)], False),  # should never be requested
    ]
    fake_request, seen = _fake_shared_pages(pages)
    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)
    client = ElevenLabsClient()
    got = client.browse_shared(min_users=1000, max_results=10, page_size=3)
    assert [v.voice_id for v in got] == ["a", "b"]
    assert seen == [0]  # short-circuited; page 1 never fetched


def test_browse_respects_max_results(monkeypatch):
    pages = [([_voice(str(i), 1000 - i) for i in range(10)], True)]
    fake_request, _ = _fake_shared_pages(pages)
    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)
    client = ElevenLabsClient()
    got = client.browse_shared(max_results=3, page_size=10)
    assert len(got) == 3


# --------------------------------------------------------------------------- #
# Manifest schema matches the authoritative sweep exactly (#7 §2)
# --------------------------------------------------------------------------- #


def test_manifest_entry_matches_sweep_schema():
    sweep = (
        Path(__file__).resolve().parents[2] / "artifacts/voice-previews/manifest.json"
    )
    reference_keys = list(json.loads(sweep.read_text())[0].keys())
    sv = SharedVoice.from_api(_voice("z", 123))
    entry = sv.manifest_entry(
        "20260726-elevenlabs-preview-voice-z-cohost-candidate.mp3"
    )
    assert list(entry.keys()) == reference_keys
    assert entry["users"] == 123  # cloned_by_count mapped onto `users`
