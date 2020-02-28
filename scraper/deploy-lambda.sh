#!/usr/bin/env bash
set -euo pipefail

# Test and build scraper
NO_WATCH=1 npm test
npm run build
./node_modules/.bin/webpack

# Apply infra changes
(
  cd infra
  terraform apply -auto-approve
)
