#!/usr/bin/env bash

# Get ENV variables from terraform output

cd infra
data_uri="$(terraform output scraper_endpoint)"
contact_endpoint="$(terraform output contact_endpoint | sed 's@\.com/.*@.com@')"
image_endpoint="$(terraform output image_endpoint | sed 's@\.com/.*@.com@')"
environment="$(terraform output environment)"
cd ..

environment_hyphens=$(echo $environment | sed 's/./-/g')
echo "Building app for $environment"
echo "-----------------$environment_hyphens"
export REACT_APP_STAGE_NAME=$environment
export REACT_APP_CONTACT_ENDPOINT=$contact_endpoint
export REACT_APP_SAVE_IMAGE_ENDPOINT=$image_endpoint
export REACT_APP_DATA_ROOT_URI=$data_uri
echo REACT_APP_STAGE_NAME=$REACT_APP_STAGE_NAME
echo REACT_APP_CONTACT_ENDPOINT=$REACT_APP_CONTACT_ENDPOINT
echo REACT_APP_SAVE_IMAGE_ENDPOINT=$REACT_APP_SAVE_IMAGE_ENDPOINT
echo REACT_APP_DATA_ROOT_URI=$REACT_APP_DATA_ROOT_URI

cd app
npm install
for campus in $@
do
  REACT_APP_CAMPUS=$campus npm run build
done
