---
status: testing
phase: full-project
source: [all SUMMARY.md files across phases 1-5]
started: 2026-03-26T00:00:00Z
updated: 2026-03-26T00:00:00Z
---

## Current Test

number: 1
name: Plugin Structure
expected: |
  .claude-plugin/plugin.json exists with name "pocket-knife"
  .claude-plugin/marketplace.json exists
  hooks/hooks.json exists with SessionStart hook
  scripts/load-env.sh exists and is executable
awaiting: user response

## Tests

### 1. Plugin Structure
expected: .claude-plugin/plugin.json has name "pocket-knife", marketplace.json exists, hooks.json has SessionStart, load-env.sh is executable
result: [pending]

### 2. Security Contract
expected: load-env.sh never uses "set -x" and never echoes API key values. No hardcoded keys anywhere in the project.
result: [pending]

### 3. Setup Skill
expected: commands/setup.md exists with disable-model-invocation: true, guides user to create ~/.claude/.env
result: [pending]

### 4. Image Skills (9 total)
expected: All 9 image SKILL.md files exist with disable-model-invocation: true and allowed-tools: Bash(curl *)
result: [pending]

### 5. Audio Skills (9 total)
expected: All 9 ElevenLabs SKILL.md files exist with disable-model-invocation: true and allowed-tools: Bash(curl *)
result: [pending]

### 6. Video Skills (3 total)
expected: ai-video-generation, google-veo, image-to-video SKILL.md files exist with disable-model-invocation and async polling pattern
result: [pending]

### 7. LLM & Search Skills
expected: llm-models and web-search SKILL.md exist with multi-provider routing
result: [pending]

### 8. Guide Skills (7 total)
expected: All 7 guide skills exist with allowed-tools: [] (no API keys needed)
result: [pending]

### 9. Social Skill
expected: twitter-automation SKILL.md exists with disable-model-invocation: true and OAuth helper script
result: [pending]

### 10. SDK & UI Skills (6 total)
expected: javascript-sdk, python-sdk, agent-ui, chat-ui, tools-ui, widgets-ui exist as guide skills
result: [pending]

### 11. CLI Installer
expected: cli/package.json exists with bin field, cli/bin/init.js exists with shebang, cli/lib/ has prompts, validate, env-writer modules
result: [pending]

### 12. Cross-Platform Compatibility
expected: .gitattributes exists with eol=lf for *.sh files. All .sh scripts have LF line endings.
result: [pending]

### 13. Description Budget
expected: All SKILL.md descriptions are under 100 characters to avoid 16K budget overflow
result: [pending]

### 14. README & License
expected: README.md has installation instructions, LICENSE file has MIT text
result: [pending]

## Summary

total: 14
passed: 0
issues: 0
pending: 14
skipped: 0

## Gaps

[none yet]
