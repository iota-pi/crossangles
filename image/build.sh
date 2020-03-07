#!/usr/bin/env bash

./node_modules/.bin/tsc
mkdir -p build/bundled/bin
cp node_modules/chrome-aws-lambda/bin/chromium.br build/bundled/bin/
