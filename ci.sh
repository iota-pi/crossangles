#!/usr/bin/env bash
set -euo pipefail

COMMAND_LIST="install|test|scrape"
COMMAND=$1

if [[ ! $COMMAND =~ ^$COMMAND_LIST$ ]]; then
  echo "Usage: $0 $COMMAND_LIST [...args]"
  exit 1
fi

if [[ $COMMAND == install ]]; then
  (cd app; npm i)
  (cd scraper; npm i)
fi

if [[ $COMMAND == test ]]; then
  (cd app; npm test)
  (cd scraper; ./test.sh)
fi

if [[ $COMMAND == scrape ]]; then
  mkdir -p app/public/unsw
  (cd scraper; npm start ${@:2})
fi
