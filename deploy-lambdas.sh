#!/usr/bin/env bash
set -euo pipefail

if [[ ${1:-} ]]; then
  lambdas=$@
else
  lambdas="scraper contact image"
fi

if [[ $lambdas =~ contact|image ]]; then
  (
    cd lambda-shared
    echo "Installing dependencies for lambda-shared"
    npm install --production >/dev/null 2>&1
  )
fi

outputs="$(./tf.sh output -json)"

# version=$(git rev-parse HEAD)
environment="$(echo "$outputs" | jq -r .environment.value)"
code_bucket="crossangles-lambda-code"

for lambda in $lambdas
do
  version="$(./version.sh $lambda)"
  last_version="$(echo "$outputs" | jq -r .${lambda}_version.value)"
  if [[ $version == $last_version && -z ${FORCE_UPDATE:-} ]]; then
    echo "No changes to $lambda, skipping build and deploy."
    echo "Set the FORCE_UPDATE env variable to force an update."
    echo
    continue
  fi

  message="Deploying $lambda lambda to $environment"
  hyphens=$(echo $message | sed 's/./-/g')
  echo $message
  echo $hyphens
  (
    cd $lambda
    echo "Installing dependencies"
    2>&1 npm install >/dev/null
    echo "Building $lambda lambda"
    npm run build

    dest="s3://$code_bucket/$environment/$lambda/$version"
    echo "Copying to $dest/$lambda.zip"
    aws s3 cp "build/$lambda.zip" "$dest/"
  )
  echo
done
