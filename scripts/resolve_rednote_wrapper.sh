#!/usr/bin/env bash
set -euo pipefail

matches="$({
  ps -axo command= | awk '
    match($0, /\/[^[:space:]]*\/Wrapper\/discover\.app\/discover([[:space:]]|$)/) {
      executable = substr($0, RSTART, RLENGTH)
      sub(/[[:space:]]$/, "", executable)
      sub(/\/discover$/, "", executable)
      print executable
    }
  '
} | sort -u)"

count="$(printf '%s\n' "$matches" | awk 'NF { n++ } END { print n + 0 }')"
if [[ "$count" -ne 1 ]]; then
  printf 'Expected exactly one live Rednote Wrapper, found %s.\n' "$count" >&2
  exit 1
fi

printf '%s\n' "$matches"
