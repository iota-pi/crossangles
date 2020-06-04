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
    2>&1 npm install --production >/dev/null
  )
fi

# version=$(git rev-parse HEAD)
environment="$(./tf.sh output environment)"
code_bucket="crossangles-lambda-code"

for lambda in $lambdas
do
  version="$(git log -1 --pretty=tformat:%H $lambda)"
  last_version="$(./tf.sh output ${lambda}_version)"
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
