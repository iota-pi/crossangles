#!/usr/bin/env bash

docker-compose up -d

if [[ -z "$CI" && -z "$NO_WATCH" ]]; then
  ./node_modules/.bin/jest --watch
else
  ./node_modules/.bin/jest
fi
