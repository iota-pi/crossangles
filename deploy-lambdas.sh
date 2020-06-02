#!/usr/bin/env bash

if [[ ${1:-} ]]; then
  lambdas=$@
else
  lambdas=(scraper contact image)
fi

version=$(git rev-parse HEAD)
environment=$(terraform output environment)
code_bucket="crossangles-lambda-code"

for lambda in $lambdas
do
  message="Deploying $lambda lambda to $environment"
  hyphens=$(echo $message | sed 's/./-/g')
  echo $message
  echo $hyphens
  (
    cd $lambdas
    echo "Installing dependencies"
    npm install >/dev/null
    echo "Building $lambda lambda"
    npm run build >/dev/null
    echo "Copying to s3://$code_bucket/$environment/$lambda/$version/$lambda.zip"
    aws s3 cp "build/$lambda.zip" "s3://$code_bucket/$environment/$lambda/$version/"
    echo $version >version.txt
  )
done
