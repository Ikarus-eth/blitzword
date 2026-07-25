#!/usr/bin/env bash
# Run the full test suite. Requires ./src/build.sh to have run first
# (tests exercise the built index.html, not the source).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fail=0
for t in tests/*.mjs; do
  if node "$t" > /tmp/$(basename "$t").log 2>&1; then
    echo "PASS  $(basename "$t")"
  else
    echo "FAIL  $(basename "$t")  -- see /tmp/$(basename "$t").log"
    fail=1
  fi
done
[ $fail -eq 0 ] && echo "ALL TESTS PASSED" || echo "SOME TESTS FAILED"
exit $fail
