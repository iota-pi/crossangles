#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

if [[ ${1:-} ]]; then
  lambdas=$@
else
  lambdas="scraper contact"
fi

installed_shared_deps=0

environment="$(./tf.sh output environment)"
code_bucket="crossangles-lambda-code"

for lambda in $lambdas
do
  version="$(./version.sh $lambda)"
  dest="s3://$code_bucket/$environment/$lambda/$version"
  existing_files=$(aws s3 ls "$dest/" || true)
  if [[ -n $existing_files && -z ${FORCE_UPDATE:-} ]]; then
    echo "No changes to $lambda, skipping build and deploy."
    echo "Set the FORCE_UPDATE env variable to force an update."
    echo "Already built version is: $version"
    echo
    continue
  fi

  if [[ -n ${CI:-} && $lambda =~ ^contact$ && $installed_shared_deps = 0 ]]; then
    (
      cd ../lambda-shared
      echo "Installing dependencies for lambda-shared"
      npm ci --production >/dev/null 2>&1
    )
    installed_shared_deps=1
  fi

  message="Deploying $lambda lambda to $environment"
  hyphens=$(echo $message | sed 's/./-/g')
  echo $message
  echo $hyphens
  (
    cd ../$lambda
    if [[ -n ${CI:-} ]]; then
      echo "Installing dependencies"
      npm ci >/dev/null 2>&1
    fi

    echo "Building $lambda lambda"
    npm run build

    echo "Copying to $dest/$lambda.zip"
    aws s3 cp "build/$lambda.zip" "$dest/"
  )
  echo
done
