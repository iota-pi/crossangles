#!/usr/bin/env bash
set -euo pipefail

if [[ ! -d $1 ]]; then
  2>&1 echo "Could not find directory \"$1\""
  exit 1
fi

(
  cd lambda-shared
  NO_WATCH=1 npm test
)

cd $1
(
  # Test and build
  NO_WATCH=1 npm test
  npm run build

  # Apply infra changes
  (
    cd infra
    terraform apply
  )
)
