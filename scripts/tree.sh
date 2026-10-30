#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

# flags crates/react/tauri are directory slices, the rest are tags;
# no flags — all but misc/context with INFO; --show-info adds INFO to any tree
print_pretty "Project tree..." "info"
dirs=()
tags=()
show=()
for arg in "$@"; do
  case "$arg" in
  crates | rust) dirs+=("crates") ;;
  react) dirs+=("src") ;;
  tauri) dirs+=("src-tauri") ;;
  --show-info) show=("--show-info") ;;
  *) tags+=("$arg") ;;
  esac
done

args=()
[ ${#tags[@]} -gt 0 ] && args+=("${tags[@]}")
[ ${#dirs[@]} -gt 0 ] && args+=("--filter" "${dirs[@]}")

node context/tags.js "${args[@]}" --not misc context "${show[@]}"
