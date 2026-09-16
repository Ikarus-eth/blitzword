#!/usr/bin/env bash
# Same suite as tests/run.sh, same pass/fail rule, but resumable in batches.
#
# Why this exists: the full suite takes ~9 minutes, and the sandbox these
# sessions run in stops any single command after 300 s. A background job does
# not escape that — the suite was killed twice mid-test with nohup and setsid,
# and the only symptom was a log that stopped growing. So: run this repeatedly
# until it prints DONE. It skips tests already recorded in the log and does not
# start a new test once BUDGET seconds have passed (the slowest test is ~80 s).
#
# TZ: several tests read "today" as a date key, in the test and in the app.
# A run that crosses local midnight fails for no reason. The sandbox clock is
# UTC; Asia/Makassar (Bali) puts midnight at 16:00 UTC instead of 00:00.
#
# Usage: tools/run_batched.sh <logfile> [budget_seconds]   (exit 2 = not done yet)
LOG="${1:?usage: tools/run_batched.sh <logfile> [budget_seconds]}"; BUDGET="${2:-190}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export TZ="${RUN_TZ:-Asia/Makassar}"
start=$(date +%s)
touch "$LOG"
for t in tests/*.mjs; do
  b=$(basename "$t")
  grep -q "  $b" "$LOG" && continue
  if [ $(( $(date +%s) - start )) -gt "$BUDGET" ]; then echo "(budget reached, run again)"; exit 2; fi
  s=$(date +%s)
  if timeout 150 node "$t" > "/tmp/$b.log" 2>&1; then r=PASS; else r=FAIL; fi
  echo "$r  $b  ($(( $(date +%s) - s ))s)" | tee -a "$LOG"
done
p=$(grep -c '^PASS' "$LOG"); f=$(grep -c '^FAIL' "$LOG")
echo "DONE: $p pass, $f fail" | tee -a "$LOG"
[ "$f" -eq 0 ]
