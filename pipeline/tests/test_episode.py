"""Controls for the Ep01 v2.0 render path (#43).

Every test that would otherwise hit the network monkeypatches the HTTP layer, and the
episode tree is redirected into ``tmp_path`` — so the suite spends **zero credits**,
writes nothing under the real ``output/``, and runs offline. The live render (54 stems,
~5,074 credits) is a one-time authorised action, verified by pasted receipts on the PR;
these tests prove the wiring.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from core import ElevenLabsClient, Voice
from core import client as client_mod
from core import episode as ep
from core.naming import episode_render_digest


@pytest.fixture
def v3_client():
    c = ElevenLabsClient(tier="production")  # 192 kbps
    c.override_model("v3")  # eleven_v3 at equal cost
    return c


@pytest.fixture
def sandbox(monkeypatch, tmp_path):
    """Redirect the episode output tree into tmp_path so tests never touch output/."""
    monkeypatch.setattr(ep, "EPISODES_DIR", tmp_path / "episodes")
    return tmp_path


@pytest.fixture
def voices():
    return {
        "HOST": Voice(voice_id="onwK4e9ZLuTAKqWW03F9", name="Daniel"),
        "EXPERT": Voice(voice_id="NuRyEq0OdD9mMOyd51UZ", name="Jofra – Expressive"),
    }


def _stub_synth(monkeypatch, calls):
    class FakeResp:
        content = b"ID3fake-mp3-bytes"

    def fake_request(method, url, **kw):
        calls.append((method, url))
        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)


# --------------------------------------------------------------------------- #
# Parse — the §2 receipts are a hard gate, not incidental output.
# --------------------------------------------------------------------------- #


def test_parse_is_the_measured_54_27_27():
    turns = ep.parse_turns()
    assert len(turns) == 54
    split = ep.speaker_split(turns)
    assert split["HOST"]["turns"] == 27
    assert split["EXPERT"]["turns"] == 27


def test_parse_char_counts_match_spec_section_2():
    turns = ep.parse_turns()
    split = ep.speaker_split(turns)
    assert split["HOST"]["chars"] == 2_115
    assert split["EXPERT"]["chars"] == 7_110
    assert split["HOST"]["longest"] == 404
    assert split["EXPERT"]["longest"] == 511
    assert sum(t.chars for t in turns) == 9_225


def test_verify_parse_passes_on_real_transcript():
    ep.verify_parse(ep.parse_turns())  # must not raise


def test_verify_parse_raises_on_drift(tmp_path):
    bad = tmp_path / "t.md"
    bad.write_text("**HOST:** only one turn here\n")
    with pytest.raises(ep.ParseError, match="expected 54"):
        ep.verify_parse(ep.parse_turns(bad))


def test_parse_reads_both_label_forms(tmp_path):
    """After §4E, HOST has no parenthetical and EXPERT carries (Owen); parse both."""
    md = tmp_path / "t.md"
    md.write_text("**HOST:** hi\n\n**EXPERT (Owen):** hello there\n")
    turns = ep.parse_turns(md)
    assert [(t.speaker, t.text) for t in turns] == [
        ("HOST", "hi"),
        ("EXPERT", "hello there"),
    ]


def test_transcript_uses_the_owen_character_label():
    """The tracked transcript carries EXPERT (Owen) — ties the constant to the file."""
    md = ep.TRANSCRIPT_MD.read_text()
    assert md.count(f"EXPERT ({ep.EXPERT_CHARACTER}):") == 27
    assert "Emma" not in md and "bm_fable" not in md


# --------------------------------------------------------------------------- #
# Quote arithmetic — the number the spend gate reads.
# --------------------------------------------------------------------------- #


def test_quote_matches_spec_5074(v3_client):
    est = ep.estimate(v3_client, ep.parse_turns())
    assert est["n_turns"] == 54
    assert est["total_chars"] == 9_225
    assert est["rate"] == pytest.approx(0.55)
    assert est["credits"] == 5_074  # round(9225 × 0.55)
    assert est["host_credits"] == 1_163  # the ~1,163 to re-render the host later
    assert est["host_credits"] + est["expert_credits"] == est["credits"]


# --------------------------------------------------------------------------- #
# The over-threshold spend gate — auditable, never silent.
# --------------------------------------------------------------------------- #


def test_gate_under_threshold_allows_without_ceiling():
    ok, _ = ep.SpendGate(1_500).decision()
    assert ok


def test_gate_over_threshold_refuses_without_ceiling():
    ok, why = ep.SpendGate(5_074).decision()
    assert not ok and "STOP" in why


def test_gate_over_threshold_allows_within_ceiling():
    ok, why = ep.SpendGate(5_074, authorize_ceiling=5_600).decision()
    assert ok and "authorised" in why


def test_gate_refuses_estimate_above_ceiling():
    ok, why = ep.SpendGate(5_700, authorize_ceiling=5_600).decision()
    assert not ok and "exceeds the authorised ceiling" in why


# --------------------------------------------------------------------------- #
# Digest — episode turns are ordered and can repeat; the key must not collide.
# --------------------------------------------------------------------------- #


def test_digest_distinguishes_turns_and_is_stable():
    a = episode_render_digest(0, "voice1", "Double.", "v3|192")
    b = episode_render_digest(1, "voice1", "Double.", "v3|192")  # same text, later turn
    c = episode_render_digest(
        0, "voice2", "Double.", "v3|192"
    )  # same turn, other voice
    assert a != b and a != c
    assert a == episode_render_digest(0, "voice1", "Double.", "v3|192")  # stable


# --------------------------------------------------------------------------- #
# render_episode — descriptive stems, rich manifest, playback order, cache.
# --------------------------------------------------------------------------- #


def _three_turns():
    return [
        ep.Turn(0, "HOST", "So. You got the diagnosis."),
        ep.Turn(1, "EXPERT", "That's right. Both things are true."),
        ep.Turn(2, "HOST", "Double."),
    ]


def test_render_writes_stems_and_rich_manifest(sandbox, v3_client, voices, monkeypatch):
    calls: list = []
    _stub_synth(monkeypatch, calls)
    res = ep.render_episode(v3_client, _three_turns(), voices, purpose="ep01v2")

    assert len(res.rendered) == 3
    assert len(calls) == 3  # three POSTs
    for rec in res.records:
        n = rec.path.name
        assert rec.path.exists()
        assert n.startswith("t0")  # turn-index led
        assert n.endswith("-192k.mp3") and "ep01v2" in n
        assert rec.role in n  # host / expert named

    manifest = json.loads((res.stems_dir / "manifest.json").read_text())
    assert len(manifest) == 3
    entry = next(iter(manifest.values()))
    assert set(entry) == {
        "turn",
        "speaker",
        "role",
        "voice_id",
        "file",
        "chars",
        "variant",
        "purpose",
        "credits_est",
        "credits_measured",
        "digest",
    }
    assert entry["variant"] == "eleven_v3|mp3_44100_192"
    assert entry["credits_measured"] is None  # until reconciliation


def test_stems_sort_lexically_into_playback_order(
    sandbox, v3_client, voices, monkeypatch
):
    _stub_synth(monkeypatch, [])
    res = ep.render_episode(v3_client, _three_turns(), voices, purpose="ep01v2")
    ordered = res.ordered_stems()
    assert [p.name for p in ordered] == sorted(p.name for p in ordered)
    assert [p.name.split("-")[0] for p in ordered] == ["t00", "t01", "t02"]


def test_rerun_is_cached_and_does_not_respend(sandbox, v3_client, voices, monkeypatch):
    calls: list = []
    _stub_synth(monkeypatch, calls)
    first = ep.render_episode(v3_client, _three_turns(), voices, purpose="ep01v2")
    assert len(first.rendered) == 3 and len(calls) == 3

    second = ep.render_episode(v3_client, _three_turns(), voices, purpose="ep01v2")
    assert len(second.rendered) == 0
    assert all(r.cached for r in second.records)
    assert len(calls) == 3  # zero new POSTs → zero re-bill


def test_render_demands_a_purpose(sandbox, v3_client, voices):
    with pytest.raises(ValueError, match="purpose"):
        ep.render_episode(v3_client, _three_turns(), voices, purpose="")


def test_set_measured_credits_patches_manifest(sandbox, v3_client, voices, monkeypatch):
    _stub_synth(monkeypatch, [])
    res = ep.render_episode(v3_client, _three_turns(), voices, purpose="ep01v2")
    rec = res.rendered[0]
    ep.set_measured_credits(res.stems_dir, rec.digest, 42)
    manifest = json.loads((res.stems_dir / "manifest.json").read_text())
    assert manifest[rec.digest]["credits_measured"] == 42


# --------------------------------------------------------------------------- #
# The CLI dry-run is the spend gate: no --confirm-spend → never POST.
# --------------------------------------------------------------------------- #


def _cli_stub(monkeypatch, posts):
    def fake_request(method, url, **kw):
        posts.append((method, url))
        if "text-to-speech" in url:
            raise AssertionError(
                "dry run / refused batch must not POST to text-to-speech"
            )

        class FakeResp:
            def json(self):
                return {
                    "character_limit": 130_552,
                    "character_count": 674,
                    "history": [],
                }

            content = b""

        return FakeResp()

    monkeypatch.setattr(client_mod, "request_with_retry", fake_request)


def test_cli_dry_run_spends_nothing(sandbox, monkeypatch):
    from argparse import Namespace

    from core import cli

    posts: list = []
    _cli_stub(monkeypatch, posts)
    cli.cmd_render_episode(
        Namespace(
            confirm_spend=False,
            authorize_ceiling=None,
            assemble=False,
            gap_ms=350,
            purpose="ep01v2",
            pause=0.0,
        )
    )
    assert not any("text-to-speech" in url for _, url in posts)


def test_cli_confirm_without_ceiling_refuses_to_spend(sandbox, monkeypatch):
    """Negative test: --confirm-spend on the over-threshold batch with no ceiling stops."""
    from argparse import Namespace

    from core import cli

    posts: list = []
    _cli_stub(monkeypatch, posts)
    cli.cmd_render_episode(
        Namespace(
            confirm_spend=True,
            authorize_ceiling=None,
            assemble=False,
            gap_ms=350,
            purpose="ep01v2",
            pause=0.0,
        )
    )
    assert not any("text-to-speech" in url for _, url in posts)


# --------------------------------------------------------------------------- #
# Assembly — no credits, demonstrable on synthetic silence.
# --------------------------------------------------------------------------- #

FFMPEG = shutil.which("ffmpeg") and shutil.which("ffprobe")


@pytest.mark.skipif(not FFMPEG, reason="ffmpeg/ffprobe not on PATH")
def test_assemble_master_concatenates_synthetic_stems(tmp_path):
    stems = []
    for i in range(3):
        p = tmp_path / f"t{i:02d}.mp3"
        subprocess.run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-y",
                "-f",
                "lavfi",
                "-i",
                "anullsrc=r=44100:cl=mono",
                "-t",
                "1.0",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "192k",
                str(p),
            ],
            check=True,
        )
        stems.append(p)

    master = tmp_path / "master.mp3"
    ep.assemble_master(stems, master, gap_ms=350)
    assert master.exists()

    dur = float(
        subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                str(master),
            ],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )
    # 3 × 1.0 s + 2 × 0.35 s gaps ≈ 3.7 s (allow encoder padding tolerance).
    assert 3.4 < dur < 4.2


@pytest.mark.skipif(not FFMPEG, reason="ffmpeg/ffprobe not on PATH")
def test_assemble_rejects_empty_and_missing(tmp_path):
    with pytest.raises(ep.AssemblyError, match="no stems"):
        ep.assemble_master([], tmp_path / "m.mp3")
    with pytest.raises(ep.AssemblyError, match="missing"):
        ep.assemble_master([tmp_path / "nope.mp3"], tmp_path / "m.mp3")


# --------------------------------------------------------------------------- #
# Mastering (#46) — chapter flags, structure-aware gaps, per-speaker match.
# --------------------------------------------------------------------------- #


def test_chapter_starts_are_detected():
    turns = ep.parse_turns()
    assert ep.chapter_starts(turns) == [0, 8, 16, 24, 32, 40]
    assert turns[0].chapter_start and turns[8].chapter_start
    assert not turns[1].chapter_start


def test_smart_gap_ms_is_structure_aware():
    turns = ep.parse_turns()
    assert ep.smart_gap_ms(turns, 8) == ep.CHAPTER_GAP_MS  # chapter start
    assert ep.smart_gap_ms(turns, 18) == ep.QUICK_GAP_MS  # t18 "Ah." (3 chars)
    assert ep.smart_gap_ms(turns, 3) == ep.NORMAL_GAP_MS  # ordinary handoff


def _sine_stem(path: Path, *, freq: int, db: float, secs: float = 3.0):
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"sine=frequency={freq}:duration={secs}",
            "-af",
            f"volume={db}dB",
            "-ar",
            "44100",
            "-ac",
            "1",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            str(path),
        ],
        check=True,
    )


@pytest.mark.skipif(not FFMPEG, reason="ffmpeg/ffprobe not on PATH")
def test_master_matches_speakers_and_hits_loudness_target(tmp_path):
    """Two speakers 12 dB apart come out matched (<0.6 dB) and the master hits -16 LUFS."""
    stems = []
    for i in range(4):
        spk = "HOST" if i % 2 == 0 else "EXPERT"
        db = -24.0 if spk == "HOST" else -12.0  # HOST much quieter than EXPERT
        p = tmp_path / f"t{i}.mp3"
        _sine_stem(p, freq=180 if spk == "HOST" else 300, db=db)
        stems.append(
            (ep.Turn(i, spk, "word " * 6), p)
        )  # >SHORT_TURN so gaps are normal

    res = ep.master_from_stems(
        stems, tmp_path / "master.mp3", tempo=1.0, trim=False, polish=False
    )
    assert res.speaker_gap_before > 3.0  # the imbalance was real and detected
    assert res.speaker_gap_after < 0.6  # per-speaker match closed it
    assert abs(res.final_lufs - (-16.0)) < 2.0  # chain hit the target, not just exit 0
    assert res.path.exists()


@pytest.mark.skipif(not FFMPEG, reason="ffmpeg/ffprobe not on PATH")
def test_master_no_loudnorm_skips_matching(tmp_path):
    p = tmp_path / "t0.mp3"
    _sine_stem(p, freq=200, db=-12.0)
    res = ep.master_from_stems(
        [(ep.Turn(0, "HOST", "hi"), p)],
        tmp_path / "m.mp3",
        tempo=1.0,
        trim=False,
        polish=False,
        loudnorm_i=None,
    )
    assert res.final_lufs is None and res.speaker_lufs_before == {}


@pytest.mark.skipif(not FFMPEG, reason="ffmpeg/ffprobe not on PATH")
def test_master_rejects_empty(tmp_path):
    with pytest.raises(ep.AssemblyError, match="no stems"):
        ep.master_from_stems([], tmp_path / "m.mp3")
