#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

# build artifacts, deps and the state database (with WAL side files);
# the app must be closed — a running writer would recreate them
cargo clean
rm -rf dist
rm -rf ~/Library/"Application Support"/com.keygenqt.vibe-studio
npm ci
