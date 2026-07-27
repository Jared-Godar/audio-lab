"""Controls for the screen-test render path (#38).

Every test that would otherwise hit the network monkeypatches the HTTP layer, and the
sample tree is redirected into ``tmp_path`` — so the suite spends **zero credits**,
writes nothing under the real ``output/``, and runs offline. That is the same reason the
acceptance criteria call for a live *control render* separately: the test suite proves
the wiring, the control render proves the path actually reaches ElevenLabs.
"""

from __future__ import annotations

import json

import pytest

from core import ElevenLabsClient, ExternalServiceError, Voice
from core import client as client_mod
from core import naming
from core import screentest as st


@pytest.fixture
def sandbox(monkeypatch, tmp_path):
    """Redirect the per-voice sample tree into tmp_path so tests never touch output/."""
    monkeypatch.setattr(naming, "SAMPLES_DIR", tmp_path / "samples")
    return tmp_path


@pytest.fixture
def v3_client():
    c = ElevenLabsClient(tier="production")  # 192 kbps
    c.override_model("v3")  # eleven_v3 at equal cost
    return c


def _stub_synth(monkeypatch, calls):
    class FakeResp:
        content = b"ID3fake-mp3-bytes"

    def fake_request(method, url, **kw):
        calls.append((method, url))
        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)


# --------------------------------------------------------------------------- #
# The batch is wired to v3 @ 192 kbps, and the estimate matches the spec quote.
# --------------------------------------------------------------------------- #


def test_client_renders_v3_at_192k(v3_client):
    assert v3_client.model.model_id == "eleven_v3"
    assert v3_client.output_format == "mp3_44100_192"
    assert v3_client.effective_rate == pytest.approx(0.55)  # v3 1.0× × 0.55 account


def test_estimate_matches_spec_quote(v3_client):
    est = st.estimate(v3_client, st.SCREENTEST_VOICES, st.LINES)
    assert est["per_voice_chars"] == 534
    assert est["total_chars"] == 3_204
    assert est["n_renders"] == 18
    assert est["credits"] == 1_762  # round(3204 × 0.55)
    assert est["credits"] < st.SELF_SERVE_MAX_CREDITS  # inside self-serve threshold


# --------------------------------------------------------------------------- #
# Data integrity — the shortlist, the control, and the three verified lines.
# --------------------------------------------------------------------------- #


def test_control_is_first_and_five_candidates_follow():
    assert len(st.SCREENTEST_VOICES) == 6
    assert st.SCREENTEST_VOICES[0] is st.CONTROL
    assert st.CONTROL.voice_id == "onwK4e9ZLuTAKqWW03F9"
    assert len(st.CANDIDATES) == 5


def test_line_char_counts_are_the_measured_286_106_142():
    counts = {ln.slug: len(ln.text) for ln in st.LINES}
    assert counts == {"L1-dense-stat": 286, "L2-aside": 106, "L3-handoff": 142}


def test_the_two_daniels_are_distinguishable_by_folder_and_filename():
    """The control Daniel and shortlist #3 Daniel must never collide (spec §3)."""
    control_dir = naming.voice_dir(st.CONTROL)
    african = next(v for v in st.CANDIDATES if v.voice_id.startswith("8dvhVJc8"))
    african_dir = naming.voice_dir(african)
    assert control_dir != african_dir
    assert "premade" in control_dir.name  # daniel-premade-control-onwK4e9Z
    assert "african" in african_dir.name  # daniel-deep-african-8dvhVJc8


# --------------------------------------------------------------------------- #
# render_screentest — writes descriptive files + a rich manifest, spends via
# the stubbed HTTP layer only, and demands a purpose.
# --------------------------------------------------------------------------- #


def test_render_writes_files_and_rich_manifest(sandbox, v3_client, monkeypatch):
    calls: list = []
    _stub_synth(monkeypatch, calls)
    voice = Voice(voice_id="8dvhVJc85Oy9HBPo11aI", name="Daniel Deep African")

    res = st.render_screentest(v3_client, [voice], st.LINES, purpose="ep01")

    assert len(res.rendered) == 3  # 1 voice × 3 lines
    assert all(rec.path.exists() for rec in res.records)
    # Filenames are self-describing and carry the disambiguating token + line + bitrate.
    for rec in res.records:
        n = rec.path.name
        assert n.startswith("2")  # dated
        assert "daniel-deep-african" in n  # disambiguating token
        assert "screentest" in n and n.endswith("-192k.mp3")
        assert rec.line.slug.lower() in n  # names the line it reads

    manifest = json.loads((naming.voice_dir(voice) / "manifest.json").read_text())
    assert len(manifest) == 3
    entry = next(iter(manifest.values()))
    assert set(entry) == {
        "file",
        "voice_id",
        "line",
        "chars",
        "variant",
        "purpose",
        "credits_est",
        "credits_measured",
    }
    assert entry["voice_id"] == voice.voice_id
    assert entry["variant"] == "eleven_v3|mp3_44100_192"
    assert entry["credits_measured"] is None  # until reconciliation


def test_render_never_hits_text_to_speech_without_purpose(sandbox, v3_client):
    with pytest.raises(ValueError, match="purpose"):
        st.render_screentest(v3_client, [st.CONTROL], st.LINES, purpose="")


def test_rerun_is_cached_and_does_not_respend(sandbox, v3_client, monkeypatch):
    calls: list = []
    _stub_synth(monkeypatch, calls)
    voice = Voice(voice_id="abc12345xxxx", name="Cache Probe")

    first = st.render_screentest(v3_client, [voice], st.LINES, purpose="ep01")
    n_calls_after_first = len(calls)
    assert len(first.rendered) == 3
    assert n_calls_after_first == 3  # three POSTs

    second = st.render_screentest(v3_client, [voice], st.LINES, purpose="ep01")
    assert len(second.rendered) == 0  # nothing re-rendered
    assert all(rec.cached for rec in second.records)
    assert len(calls) == n_calls_after_first  # zero new POSTs → zero re-bill


def test_one_voice_failing_does_not_abort_the_batch(sandbox, v3_client, monkeypatch):
    def fake_request(method, url, **kw):
        if "STALE" in url:
            raise ExternalServiceError("ElevenLabs 404: Voice not found — id is stale.")

        class FakeResp:
            content = b"ok"

        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)
    good = Voice(voice_id="goodid123456", name="Good")
    bad = Voice(voice_id="STALEid45678", name="Bad")

    res = st.render_screentest(v3_client, [good, bad], st.LINES, purpose="ep01")

    assert len(res.rendered) == 3  # the good voice still rendered
    assert len(res.failures) == 3  # the bad voice's three lines recorded, not raised
    assert all("stale" in f.error.lower() for f in res.failures)


def test_set_measured_credits_patches_manifest(sandbox, v3_client, monkeypatch):
    calls: list = []
    _stub_synth(monkeypatch, calls)
    voice = Voice(voice_id="patch1234567", name="Patch Me")
    res = st.render_screentest(v3_client, [voice], st.LINES, purpose="ep01")

    rec = res.rendered[0]
    st.set_measured_credits(voice, rec.digest, 157)
    manifest = json.loads((naming.voice_dir(voice) / "manifest.json").read_text())
    assert manifest[rec.digest]["credits_measured"] == 157


# --------------------------------------------------------------------------- #
# The CLI dry-run is the spend gate: it must refuse to render without the flag.
# --------------------------------------------------------------------------- #


def test_cli_dry_run_spends_nothing(sandbox, monkeypatch):
    """cmd_screentest without --confirm-spend must never call /v1/text-to-speech."""
    from argparse import Namespace

    from core import cli

    posts: list = []

    def fake_request(method, url, **kw):
        posts.append((method, url))

        class FakeResp:
            def json(self):
                # Serve subscription + history GETs; a POST here would be a spend.
                return {
                    "character_limit": 130_552,
                    "character_count": 674,
                    "history": [],
                }

            content = b""

        if "text-to-speech" in url:
            raise AssertionError("dry run must not POST to text-to-speech")
        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)
    cli.cmd_screentest(Namespace(confirm_spend=False, purpose="ep01"))

    assert not any("text-to-speech" in url for _, url in posts)
