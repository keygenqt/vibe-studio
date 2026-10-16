#!/bin/bash

source "$(dirname "$0")/common.sh"
setup_root

# Format Rust
print_pretty "Format Rust..." "info"
rustup run nightly cargo fmt

# Format JS
print_pretty "Format JS..." "info"
npx prettier --write src --log-level warn

# License headers
./scripts/license.sh
