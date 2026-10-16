#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

add_header() {
  local file="$1"
  # Skip if header already present at the top of the file
  if head -n 5 "$file" | grep -q "SPDX-License-Identifier"; then
    return
  fi
  case "$file" in
  *.rs)
    # Line comments, idiomatic for Rust
    {
      sed 's/^\(.\)/\/\/ \1/' copyright.txt
      echo
      cat "$file"
    } >"$file.tmp"
    ;;
  *)
    # Block comment for JS / JSX
    {
      echo "/*"
      sed 's/^\(.\)/ \* \1/' copyright.txt
      echo " */"
      cat "$file"
    } >"$file.tmp"
    ;;
  esac
  mv "$file.tmp" "$file"
}

print_pretty "License headers..." "info"

find src crates src-tauri/src \
  -type f \( -name "*.rs" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/gen/*" |
  while IFS= read -r file; do
    add_header "$file"
  done

print_pretty "Done" "success"
