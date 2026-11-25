#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

print_pretty "Run Tauri dev" "info"
npm run tauri dev
