#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

# build artifacts, deps and the state database (with WAL side files);
# the app must be closed — a running writer would recreate them
case "$(uname -s)" in
  Darwin) DATA_ROOT="$HOME/Library/Application Support" ;;
  Linux) DATA_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}" ;;
esac
rm -rf "$DATA_ROOT/com.keygenqt.vibe-studio-dev"
cargo clean
rm -rf dist
npm ci
