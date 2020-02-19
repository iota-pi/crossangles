#!/usr/bin/env bash
set -euo pipefail

COMMAND_LIST="install|test"
COMMAND=$1
shift

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
