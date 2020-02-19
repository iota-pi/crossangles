#!/usr/bin/env bash
set -euo pipefail

LAMBDA_BUCKET="crossangles-lambda-code"

# Test and build scraper
npx jest
npm run build
./node_modules/.bin/webpack

# Apply infra changes
(
  cd infra
  terraform apply -auto-approve
)
