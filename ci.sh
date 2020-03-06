#!/usr/bin/env bash
set -euo pipefail

COMMAND_LIST="install|build|test|run|scrape"
COMMAND=$1

if [[ ! $COMMAND =~ ^$COMMAND_LIST$ ]]; then
  echo "Usage: $0 $COMMAND_LIST [...args]"
  exit 1
fi

if [[ $COMMAND == install ]]; then
  (cd app; npm i)
  (cd scraper; npm i)
  (cd contact; npm i)
  (cd image; npm i)
  (cd lambda-shared; npm i)
fi

if [[ $COMMAND == build ]]; then
  if [[ -n "${2:-}" ]]; then
    (cd $2; npm run build -- ${@:3})
  else
    (cd app; npm run build)
    (cd scraper; npm run build)
    (cd contact; npm run build)
    (cd image; npm run build)
  fi
fi

if [[ $COMMAND == test ]]; then
  if [[ -n "${2:-}" ]]; then
    (cd $2; npm test)
  else
    (
      export CI=${CI:-1}
      (cd app; npm test)
      (cd scraper; ./test.sh)
      (cd contact; ./test.sh)
      (cd image; ./test.sh)
      (cd lambda-shared; ./test.sh)
    )
  fi
fi

if [[ $COMMAND == run ]]; then
  (cd app; npm start)
fi

if [[ $COMMAND == scrape ]]; then
  mkdir -p app/public/unsw
  (cd scraper; npm start ${@:2})
fi
