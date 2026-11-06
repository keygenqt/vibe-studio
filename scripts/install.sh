#!/bin/bash

# Build the release app and install it: macOS copies the bundle
# into /Applications, Linux installs the deb package.
# The release identifier keeps its data dir apart from the dev one.
# The app must be closed — a running target would break the install.

source "$(dirname "$0")/common.sh"
setup_root

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
