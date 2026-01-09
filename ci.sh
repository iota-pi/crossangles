#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

COMMAND_LIST="ci-install|install|build|lint|test|run|scrape"
COMMAND=$1

if [[ ! $COMMAND =~ ^$COMMAND_LIST$ ]]; then
  echo "Usage: $0 $COMMAND_LIST [...args]"
  exit 1
fi

if [[ $COMMAND == ci-install ]]; then
  yarn install --frozen-lockfile
fi

if [[ $COMMAND == install ]]; then
  yarn install
fi

if [[ $COMMAND == build ]]; then
  if [[ ${2:-} == app ]]; then
    yarn build:app
  elif [[ -n "${2:-}" ]]; then
    yarn build:$2 ${@:3}
  else
    yarn build
  fi
fi

if [[ $COMMAND == lint ]]; then
  yarn lint
fi

if [[ $COMMAND == test ]]; then
  yarn test
fi

if [[ $COMMAND == run ]]; then
  if [[ ${2:-} == --prod ]]; then
    cd app
    npx serve build
  else
    cd app
    yarn start
  fi
fi

if [[ $COMMAND == scrape ]]; then
  mkdir -p app/public/unsw
  (cd scraper; yarn start ${@:2})
fi
