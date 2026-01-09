#!/usr/bin/env bash
set -euo pipefail

# Compile TypeScript
esbuild lambda.ts \
  --outfile=build/lambda.js \
  --bundle \
  --minify \
  --platform=node \
  --target=node20 \
  --external:aws-sdk

# Inject git version into compiled JS files
version=$(../deploy/version.sh .)
sed -i "s/git_version_will_be_injected_in_built_file/$version/" build/lambda.js

# Zip the bundled files
(cd build; npx bestzip ./scraper.zip lambda.js)
