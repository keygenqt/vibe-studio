#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

print_pretty "Run Tauri dev" "info"
# Linux: WebKitGTK repaints slower than GTK resizes the frame — the
# stale band on live resize (tauri#4236); the env drops the DMA-BUF path
case "$(uname -s)" in
  Linux) export WEBKIT_DISABLE_COMPOSITING_MODE=1 ;;
esac
npm run tauri dev
