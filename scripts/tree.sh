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
# the default tree and dir slices come with INFO
[ ${#tags[@]} -eq 0 ] && args+=("--show-info")

# misc/context are excluded by default — unless requested explicitly
nots=()
for tag in misc context; do
  skip=false
  for t in "${tags[@]}"; do
    [ "$t" = "$tag" ] && skip=true
  done
  $skip || nots+=("$tag")
done
[ ${#nots[@]} -gt 0 ] && args+=("--not" "${nots[@]}")

node context/tags.js "${args[@]}" "${show[@]}"
