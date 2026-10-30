#!/bin/bash

# a gate script: stop on the first failed check, exit code must reflect it
set -e

source "$(dirname "$0")/common.sh"
setup_root

print_pretty "Cargo check..." "info"
cargo check

print_pretty "Check tags..." "info"
node context/tags.js --check

print_pretty "Done" "success"
