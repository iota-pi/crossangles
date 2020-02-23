#!/usr/bin/env bash
set -euo pipefail

# Build contact script
npm run build
./node_modules/.bin/webpack

# Apply infra changes
(
  cd infra
  terraform apply -auto-approve
)
