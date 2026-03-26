---
phase: 2
slug: validation-batch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash scripts + validate-plugin.sh from Phase 1 |
| **Quick run command** | `bash scripts/validate-plugin.sh` |
| **Full suite command** | `bash scripts/validate-plugin.sh --full` |
| **Estimated runtime** | ~5 seconds (structural) |

---

## Sampling Rate

- **After every task commit:** Run `bash scripts/validate-plugin.sh`
- **After every plan wave:** Verify SKILL.md frontmatter + curl pattern
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-01 | 01 | 1 | IMG-01 | file+content | `grep -q "disable-model-invocation: true" skills/image/ai-image-generation/SKILL.md` | pending |
| 02-01-02 | 01 | 1 | LLM-01 | file+content | `grep -q "disable-model-invocation: true" skills/llm/llm-models/SKILL.md` | pending |
| 02-01-03 | 01 | 1 | SRCH-01 | file+content | `grep -q "disable-model-invocation: true" skills/search/web-search/SKILL.md` | pending |
| 02-02-01 | 02 | 1 | AUD-01 | file+content | `grep -q "disable-model-invocation: true" skills/audio/elevenlabs-tts/SKILL.md` | pending |
| 02-02-02 | 02 | 1 | VID-02 | file+content | `grep -q "disable-model-invocation: true" skills/video/google-veo/SKILL.md` | pending |
| 02-XX-XX | all | all | QUAL-03 | pattern | `grep -rq "fail-with-body\|curl -f" skills/` | pending |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Image generation produces file | IMG-01 | Needs valid GOOGLE_API_KEY | Set key, invoke `/pocket-knife:ai-image-generation`, verify image file saved |
| TTS produces audio file | AUD-01 | Needs valid ELEVENLABS_API_KEY | Set key, invoke `/pocket-knife:elevenlabs-tts`, verify audio file saved |
| Missing key shows human message | All | Needs session without key set | Remove a key from .env, invoke skill, verify human-readable error |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
