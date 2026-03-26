---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash scripts + manual verification (no test framework — this phase is infrastructure/config) |
| **Config file** | none — Phase 1 creates the plugin scaffold |
| **Quick run command** | `bash scripts/validate-plugin.sh` |
| **Full suite command** | `bash scripts/validate-plugin.sh --full` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bash scripts/validate-plugin.sh`
- **After every plan wave:** Run `bash scripts/validate-plugin.sh --full`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUND-01 | file check | `test -f .claude-plugin/plugin.json && echo OK` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUND-05 | file check | `test -f LICENSE && echo OK` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUND-04 | file check | `test -f README.md && echo OK` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | FOUND-06 | dir check | `test -d skills && echo OK` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | DIST-01,02,03 | json check | `grep -q "pocket-knife" .claude-plugin/plugin.json && echo OK` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUND-02 | hook check | `test -f hooks/hooks.json && echo OK` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FOUND-03 | file check | `test -f .gitattributes && echo OK` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | QUAL-04 | grep check | `! grep -r "API_KEY" scripts/load-env.sh \|\| echo OK` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | SETUP-02 | file check | `test -f commands/setup.md && echo OK` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | SETUP-03 | content check | `grep -q "CLAUDE_ENV_FILE" scripts/load-env.sh && echo OK` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | QUAL-01,02,06 | policy check | Manual — verify policy documentation in README | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/validate-plugin.sh` — validation script that checks all structural requirements
- [ ] All directories created: `skills/`, `hooks/`, `scripts/`, `commands/`, `.claude-plugin/`

*Wave 0 is part of Plan 01 (plugin scaffold).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Plugin installs via `/plugin install` | DIST-02 | Requires active Claude Code session | 1. Run `/plugin install ./` 2. Verify no errors 3. Check `/pocket-knife:setup` is available |
| Env vars available in session | FOUND-02 | Requires active session with hook firing | 1. Set a test key in `~/.claude/.env` 2. Start new session 3. Run `echo $TEST_KEY` |
| API keys not leaked in output | QUAL-04 | Requires observing Claude's output | 1. Set keys in .env 2. Trigger a skill 3. Verify no key values in output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
