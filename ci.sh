#!/usr/bin/env bash
set -euo pipefail

COMMAND_LIST="ci-install|install|build|test|run|scrape|cypress"
COMMAND=$1

if [[ ! $COMMAND =~ ^$COMMAND_LIST$ ]]; then
  echo "Usage: $0 $COMMAND_LIST [...args]"
  exit 1
fi

run_for_each () {
  for module in app scraper contact image lambda-shared
  do
    (
      cd $module
      $1 ${@:2}
    )
  done
}


if [[ $COMMAND == ci-install ]]; then
  run_for_each npm ci
fi

if [[ $COMMAND == install ]]; then
  run_for_each npm install
fi

if [[ $COMMAND == build ]]; then
  if [[ ${2:-} == app ]]; then
    ./build-app.sh
  elif [[ -n "${2:-}" ]]; then
    (cd $2; npm run build -- ${@:3})
  else
    run_for_each npm run build
  fi
fi

if [[ $COMMAND == lint ]]; then
  (
    cd app
    npm run lint
  )
fi

if [[ $COMMAND == test ]]; then
  if [[ -n "${2:-}" ]]; then
    (cd $2; npm test)
  else
    (
      export CI=${CI:-1}
      run_for_each npm test
    )
  fi
fi

if [[ $COMMAND == cypress ]]; then
  (
    cd app
    npx cypress ${2:-}
  )
fi

if [[ $COMMAND == run ]]; then
  if [[ ${2:-} == --prod ]]; then
    cd app
    npx serve build
  else
    cd app
    npm start
  fi
fi

if [[ $COMMAND == scrape ]]; then
  mkdir -p app/public/unsw
  (cd scraper; npm start ${@:2})
fi
