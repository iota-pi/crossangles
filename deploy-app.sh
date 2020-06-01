#!/usr/bin/env bash

version=$(git rev-parse HEAD)

# Get ENV variables from terraform output
app_bucket=$(terraform output app_bucket)
stage_name=$(terraform output environment)

stage_hyphens=$(echo $stage_name | sed 's/./-/g')
echo "Deploying app to $stage_name"
echo "-----------------$stage_hyphens"
echo "Copying to s3://$app_bucket/$version/"
aws s3 cp app/build/ s3://$app_bucket/$version/ --recursive --acl public-read
