#!/usr/bin/env bash
set -euo pipefail

./node_modules/.bin/tsc
./node_modules/.bin/webpack
(cd build/bundled; zip -r ../scraper.zip .)
