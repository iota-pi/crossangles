#!/usr/bin/env bash
set -euo pipefail

esbuild index.ts \
  --outfile=build/lambda.js \
  --bundle \
  --minify \
  --platform=node \
  --target=node16 \
  --external:aws-sdk

(cd build; zip -r ./contact.zip lambda.js)
