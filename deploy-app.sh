#!/usr/bin/env bash
set -euo pipefail

outputs="$(./tf.sh output -json)"

# Check versions to see if we need to re-build and re-deploy
version="$(./version.sh app)"
last_version="$(echo "$outputs" | jq -r .app_version.value)"
if [[ $version == $last_version && -z ${FORCE_UPDATE:-} ]]; then
  echo "No changes to app, skipping build and deploy."
  echo "Set the FORCE_UPDATE env variable to force an update."
  echo "Version is: $version"
  exit 0
fi

environment="$(echo "$outputs" | jq -r .environment.value)"
image_endpoint="$(echo "$outputs" | jq -r .image_endpoint.value | sed 's@\.com/.*@.com@')"
contact_endpoint="$(echo "$outputs" | jq -r .contact_endpoint.value | sed 's@\.com/.*@.com@')"
data_uri="$(echo "$outputs" | jq -r .scraper_endpoint.value)"
app_bucket="$(echo "$outputs" | jq -r .app_bucket.value)"

environment_hyphens=$(echo $environment | sed 's/./-/g')
echo "Deploying app to $environment"
echo "-----------------$environment_hyphens"
export REACT_APP_STAGE_NAME=$environment
export REACT_APP_CONTACT_ENDPOINT=$contact_endpoint
export REACT_APP_SAVE_IMAGE_ENDPOINT=$image_endpoint
export REACT_APP_DATA_ROOT_URI=$data_uri

cd app
npm install
for campus in $@
do
  REACT_APP_CAMPUS=$campus npm run build

  echo "Copying to s3://$app_bucket/$version/$campus/"
  aws s3 cp build/ s3://$app_bucket/$version/$campus/ --recursive --acl public-read
done

