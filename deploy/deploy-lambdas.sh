#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

lambdas="scraper contact"
environment="$(./tf.sh output -raw environment)"
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

  message="Deploying $lambda lambda to $environment"
  hyphens=$(echo $message | sed 's/./-/g')
  echo $message
  echo $hyphens
  (
    cd ../$lambda

    echo "Building $lambda lambda"
    yarn build

    echo "Copying to $dest/$lambda.zip"
    aws s3 cp "build/$lambda.zip" "$dest/"
  )
  echo
done
