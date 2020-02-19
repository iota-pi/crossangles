#!/usr/bin/env bash

if [[ -z "$CI" ]]; then
  ./node_modules/.bin/jest --watch
else
  ./node_modules/.bin/jest
fi
