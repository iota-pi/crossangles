#!/usr/bin/env bash
set -euo pipefail

# Test and build
./ci.sh test
./ci.sh build

# Apply infra changes
terraform apply
