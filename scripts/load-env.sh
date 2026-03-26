#!/usr/bin/env bash
# scripts/load-env.sh
# Pocket-Knife: loads ~/.claude/.env into the shell environment for the current session.
#
# Triggered by: hooks/hooks.json SessionStart hook
# Runs: once per Claude Code session, before any skill loads
#
# SECURITY CONTRACT:
#   - Never use `set -x` — it would print API key values to stderr (captured by Claude)
#   - Never echo, printf, or log variable values — only check presence with [ -z "$VAR" ]
#   - Always verify file existence before sourcing — graceful no-op if missing
#   - `set -o allexport` exports all variables from the file without explicit `export` per line
#
# This script intentionally has no output on success.
# Errors (e.g., syntax in .env) will appear as shell errors — acceptable and safe.

CLAUDE_ENV_FILE="$HOME/.claude/.env"

if [ -f "$CLAUDE_ENV_FILE" ]; then
  set -o allexport
  # shellcheck source=/dev/null
  source "$CLAUDE_ENV_FILE"
  set +o allexport
fi
