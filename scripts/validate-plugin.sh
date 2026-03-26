#!/usr/bin/env bash
# scripts/validate-plugin.sh
# Validates the pocket-knife plugin structure.
# Usage: bash scripts/validate-plugin.sh [--full]
# SECURITY: Never use set -x; never echo env var values.

set -euo pipefail

FULL=false
[[ "${1:-}" == "--full" ]] && FULL=true

PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"
  if [[ "$result" == "OK" ]]; then
    echo "  [OK] $label"
    ((PASS++)) || true
  else
    echo "  [FAIL] $label — $result"
    ((FAIL++)) || true
  fi
}

echo "=== pocket-knife plugin validation ==="
echo ""

echo "--- Structure ---"
check ".claude-plugin/plugin.json exists"   "$(test -f .claude-plugin/plugin.json && echo OK || echo MISSING)"
check ".claude-plugin/marketplace.json exists" "$(test -f .claude-plugin/marketplace.json && echo OK || echo MISSING)"
check ".gitattributes exists"               "$(test -f .gitattributes && echo OK || echo MISSING)"
check "README.md exists"                    "$(test -f README.md && echo OK || echo MISSING)"
check "LICENSE exists"                      "$(test -f LICENSE && echo OK || echo MISSING)"
check "hooks/hooks.json exists"             "$(test -f hooks/hooks.json && echo OK || echo MISSING)"
check "scripts/load-env.sh exists"          "$(test -f scripts/load-env.sh && echo OK || echo MISSING)"
check "commands/setup.md exists"            "$(test -f commands/setup.md && echo OK || echo MISSING)"

echo ""
echo "--- Skills directories ---"
for dir in image audio video llm search social sdk ui guides; do
  check "skills/$dir/ exists" "$(test -d skills/$dir && echo OK || echo MISSING)"
done

if $FULL; then
  echo ""
  echo "--- Content checks ---"
  check "plugin.json has name=pocket-knife" \
    "$(grep -q '"name".*pocket-knife' .claude-plugin/plugin.json 2>/dev/null && echo OK || echo MISSING)"
  check "marketplace.json has source=github" \
    "$(grep -q '"type".*github' .claude-plugin/marketplace.json 2>/dev/null && echo OK || echo MISSING)"
  check ".gitattributes has eol=lf for *.sh" \
    "$(grep -q '\*.sh.*eol=lf' .gitattributes 2>/dev/null && echo OK || echo MISSING)"
  check "hooks.json has SessionStart" \
    "$(grep -q 'SessionStart' hooks/hooks.json 2>/dev/null && echo OK || echo MISSING)"
  check "load-env.sh has security contract" \
    "$(grep -q 'SECURITY CONTRACT' scripts/load-env.sh 2>/dev/null && echo OK || echo MISSING)"
  check "load-env.sh never uses set -x" \
    "$(! grep -q 'set -x' scripts/load-env.sh 2>/dev/null && echo OK || echo 'SECURITY VIOLATION: set -x found')"
  check "setup.md has disable-model-invocation" \
    "$(grep -q 'disable-model-invocation' commands/setup.md 2>/dev/null && echo OK || echo MISSING)"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]]
