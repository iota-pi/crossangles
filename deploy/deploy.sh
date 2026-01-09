#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

function stage() {
  GREEN="\033[0;32m"
  NC="\033[0m"
  echo -e "--- ${GREEN}${1}${NC}"
}

PRODUCTION="NO"
AUTO_APPROVE="NO"
FORCE_UPDATE=""
SKIP_TESTS="NO"
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
    --already-tested)
      SKIP_TESTS="YES"
      shift
      ;;
    -y)
      AUTO_APPROVE="YES"
      shift
      ;;
    *)
      shift
      ;;
  esac
done
export FORCE_UPDATE

stage "Running tests"
if [[ "${SKIP_TESTS}" != "YES" ]]; then
  (
    cd ..
    ./ci.sh lint
    ./ci.sh test
  )
else
  echo "Already ran tests in pipeline. Skipping."
fi

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
if [[ "${AUTO_APPROVE}" != "YES" ]]; then
  GIVE_TTY=1 ./tf.sh apply
else
  ./tf.sh apply -auto-approve
fi
