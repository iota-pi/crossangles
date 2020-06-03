#!/usr/bin/env bash
set -euo pipefail

if [[ ${1:-} ]]; then
  lambdas=$@
else
  lambdas="scraper contact image"
fi

cd infra
version=$(git rev-parse HEAD)
environment=$(terraform output environment)
code_bucket="crossangles-lambda-code"
cd ..

if [[ $lambdas =~ '\b(contact|image)\b' ]]; then
  (
    cd lambda-shared
    echo "Installing dependencies for lambda-shared"
    2>&1 npm install --production >/dev/null
  )
fi

for lambda in $lambdas
do
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
    echo "Copying to s3://$code_bucket/$environment/$lambda/$version/$lambda.zip"
    aws s3 cp "build/$lambda.zip" "s3://$code_bucket/$environment/$lambda/$version/"
    echo $version >version.txt
  )
  echo
done
