#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$(realpath "$0")")"

outputs="$(./tf.sh output -json)"
environment=$(echo "$outputs" | jq -r ".environment.value")
image_endpoint=$(echo "$outputs" | jq -r ".image_endpoint.value" | sed 's@\.com/.*@.com@')
contact_endpoint=$(echo "$outputs" | jq -r ".contact_endpoint.value" | sed 's@\.com/.*@.com@')
data_uri=$(echo "$outputs" | jq -r ".scraper_endpoint.value")
app_bucket=$(echo "$outputs" | jq -r ".app_bucket.value")

if [[ -z $app_bucket || $app_bucket == null ]]; then
  echo "App bucket has not been deployed yet. Skipping building app."
  exit 0
fi

# Check versions to see if we need to re-build and re-deploy
git submodule update --remote
version=$(./version.sh app)
s3_version_file="s3://$app_bucket/versions/$version"
existing_files=$(aws s3 ls $s3_version_file || true)
if [[ -n $existing_files && -z ${FORCE_UPDATE:-} ]]; then
  echo "No changes to app, skipping build and deploy."
  echo "Set the FORCE_UPDATE env variable to force an update."
  echo "Already built version is: $version"
  exit 0
fi

environment_hyphens=$(echo $environment | sed 's/./-/g')
echo "Deploying app to $environment"
echo "-----------------$environment_hyphens"
export REACT_APP_BASE_URL=crossangles.app
if [[ $environment != "production" ]]; then
  export REACT_APP_BASE_URL=$environment.$REACT_APP_BASE_URL
fi
export REACT_APP_STAGE_NAME=$environment
export REACT_APP_CONTACT_ENDPOINT=$contact_endpoint
export REACT_APP_SAVE_IMAGE_ENDPOINT=$image_endpoint
export REACT_APP_DATA_ROOT_URI=$data_uri

max_age=0
if [[ $environment == production ]]; then
  max_age=7200
fi

cd ../app
if [[ -n ${CI:-} ]]; then
  npm ci --production
fi
for campus in $@
do
  if [[ $campus != "unsw" ]]; then
    REACT_APP_BASE_URL=$campus.$REACT_APP_BASE_URL
  fi

  echo "Building app from $campus"
  REACT_APP_CAMPUS=$campus npm run build

  campus_key_base="s3://$app_bucket/$campus"
  s3_app_params="--acl public-read --cache-control max-age=$max_age"

  echo "Copying to $campus_key_base/"
  aws s3 cp build/ "$campus_key_base/" --recursive $s3_app_params
  aws s3 cp build/index.html "$campus_key_base/timetable/" $s3_app_params

  echo "Creating version marker at s3://$app_bucket/versions/$version"
  touch version
  aws s3 cp version "s3://$app_bucket/versions/$version"
  rm version

  echo "Finished deployment for $campus"
  echo "Version is $version"
done
