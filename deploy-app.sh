#!/usr/bin/env bash
set -euo pipefail

# Check versions to see if we need to re-build and re-deploy
last_version="$(./tf.sh output app_version)"
version="$(git log -1 --pretty=tformat:%H app)"
if [[ $version == $last_version && -z ${FORCE_UPDATE:-} ]]; then
  echo 'No changes to app, skipping build and deploy.'
  echo 'Set the FORCE_UPDATE env variable to force an update.'
  exit 0
fi

environment="$(./tf.sh output environment)"
image_endpoint="$(./tf.sh output image_endpoint | sed 's@\.com/.*@.com@')"
contact_endpoint="$(./tf.sh output contact_endpoint | sed 's@\.com/.*@.com@')"
data_uri="$(./tf.sh output scraper_endpoint)"
app_bucket=$(./tf.sh output app_bucket)

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

