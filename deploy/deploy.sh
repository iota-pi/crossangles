#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

function stage() {
  echo -e "--- ${GREEN}${1}${NC}"
}

PRODUCTION="NO"
AUTO_APPROVE="NO"
FORCE_UPDATE=""
while [[ ${#} -gt 0 ]]
do
  case "${1}" in
    --prod)
      PRODUCTION="YES"
      shift
      ;;
    -f|--force)
      FORCE_UPDATE="YES"
      shift
      ;;
    *)
      shift
      ;;
  esac
done
export FORCE_UPDATE

GREEN="\033[0;32m"
NC="\033[0m"
stage "Running tests"
(
  cd ..
  ./ci.sh lint
  ./ci.sh test
  # Too many issues with Cypress - need to redo E2E suite some time
  # if [[ "${PRODUCTION}" == "YES" ]]; then
  #   ./ci.sh cypress run
  # fi
)

stage "Setting workspace"
current_workspace="$(./tf.sh workspace show)"
if [[ "${PRODUCTION}" != "YES" ]]; then
  if [[ "${current_workspace}" != "staging" ]]; then
    ./tf.sh workspace select staging
  fi
else
  if [[ "${current_workspace}" != "default" ]]; then
    ./tf.sh workspace select default
  fi
fi

stage "Building Lambdas"
./deploy-lambdas.sh

stage "Building App"
./deploy-app.sh unsw

stage "Terraform Apply"
./tf.sh apply
