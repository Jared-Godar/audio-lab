"""HTTP resilience for the ElevenLabs API.

Every call that leaves the process goes through :func:`request_with_retry`, which
retries *transient* failures with bounded exponential backoff and fails fast on
*permanent* ones (auth, quota, not-found) — retrying a 401 only wastes time. This is
the repo's defensive-external-call contract, carried over from audition-v1 verbatim.
"""

from __future__ import annotations

import time

import requests

# Retry these — they are connectivity or load conditions that clear on their own.
TRANSIENT_STATUS = {408, 429, 500, 502, 503, 504}

# Fail fast on these with a plain-language hint instead of a raw traceback.
PERMANENT_HINTS = {
    401: "API key rejected — check ELEVENLABS_API_KEY in your environment.",
    402: "Out of credits for this billing cycle.",
    403: "That voice or model isn't available on your plan.",
    404: "Voice or model not found — the id may be stale.",
    422: "Request rejected — text may exceed the model's per-request limit.",
}


class ExternalServiceError(RuntimeError):
    """A network or provider condition — not a defect in this code or your setup."""


def request_with_retry(method: str, url: str, *, attempts: int = 3, **kw):
    """HTTP with bounded exponential backoff on transient failures only.

    Permanent failures (auth, quota, not-found) fail fast — retrying a 401 only
    wastes time. Callers that spend credits should pass ``attempts=2``: a timeout may
    land after the provider already billed, so every retry risks a second charge.
    """
    last = ""
    for attempt in range(1, attempts + 1):
        try:
            r = requests.request(method, url, **kw)
        except (requests.Timeout, requests.ConnectionError) as exc:
            last = f"{type(exc).__name__}: {exc}"
        else:
            if r.status_code == 200:
                return r
            if r.status_code not in TRANSIENT_STATUS:
                hint = PERMANENT_HINTS.get(r.status_code) or r.text[:200]
                raise ExternalServiceError(f"ElevenLabs {r.status_code}: {hint}")
            last = f"HTTP {r.status_code}"
        if attempt < attempts:
            time.sleep(1.5**attempt)
    raise ExternalServiceError(
        f"ElevenLabs unreachable after {attempts} attempts ({last}). This is a "
        "connectivity or service condition, not a problem with your setup — check "
        "status.elevenlabs.io and retry. Cached samples still play offline."
    )
