#!/bin/bash

# Build the release app and install it: macOS copies the bundle
# into /Applications, Linux installs the deb package.
# The release identifier keeps its data dir apart from the dev one.
# The app must be closed — a running target would break the install.

source "$(dirname "$0")/common.sh"
setup_root

# `--reset` drops the release state database and the build cache
# before the build — a fresh start on install
RESET=0
for arg in "$@"; do
  case "$arg" in
    --reset) RESET=1 ;;
    *) print_pretty "Unknown flag: $arg" "error"; exit 1 ;;
  esac
done

if [ "$RESET" -eq 1 ]; then
  case "$(uname -s)" in
    Darwin) DATA_ROOT="$HOME/Library/Application Support" ;;
    Linux) DATA_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}" ;;
  esac
  print_pretty "Drop the state databases..." "info"
  rm -rf "$DATA_ROOT/com.keygenqt.vibe-studio"
  print_pretty "Clean the build cache..." "info"
  cargo clean
fi

case "$(uname -s)" in
  Darwin)
    print_pretty "Build Tauri release (macOS)..." "info"
    npm run tauri build -- --bundles app --config '{"identifier": "com.keygenqt.vibe-studio"}'

    print_pretty "Install to /Applications..." "info"
    cp -R target/release/bundle/macos/"Vibe Studio.app" /Applications/
    ;;
  Linux)
    print_pretty "Build Tauri release (Linux)..." "info"
    npm run tauri build -- --bundles deb --config '{"identifier": "com.keygenqt.vibe-studio"}'

    print_pretty "Install deb package..." "info"
    sudo dpkg -i src-tauri/target/release/bundle/deb/*.deb
    ;;
  *)
    print_pretty "Unsupported platform: $(uname -s)" "error"
    exit 1
    ;;
esac

print_pretty "Done" "success"
