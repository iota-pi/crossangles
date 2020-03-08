#!/usr/bin/env bash

./node_modules/.bin/tsc
./node_modules/.bin/webpack
(cd build/bundled; zip -r ../contact.zip .)
