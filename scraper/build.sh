#!/usr/bin/env bash
set -euo pipefail

# Compile TypeScript
./node_modules/.bin/tsc

# Inject git version into compiled JS files
version=$(../deploy/version.sh .)
sed -i "s/git_version_will_be_injected_in_built_file/$version/" build/scraper/version.js

# Bundle code and dependencies
./node_modules/.bin/webpack

# Zip the bundled files
(cd build/bundled; zip -r ../scraper.zip .)
