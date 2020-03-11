#!/usr/bin/env bash

# Use dummy values in mailgun.sample.json for testing
if [[ ! -f ./mailgun.json ]]; then
  cp mailgun.sample.json mailgun.json
fi

if [[ -z "$CI" && -z "$NO_WATCH" ]]; then
  ./node_modules/.bin/jest --watch
else
  ./node_modules/.bin/jest
fi
