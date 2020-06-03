#!/usr/bin/env bash
set -ex

extra_args=""
if [[ $1 =~ init|refresh|apply ]]; then
  extra_args+=" -input=false"
fi

TF_VAR_app_version="$(git log -1 --pretty=tformat:%H app)"
TF_VAR_scraper_version="$(git log -1 --pretty=tformat:%H scraper)"
TF_VAR_contact_version="$(git log -1 --pretty=tformat:%H contact)"
TF_VAR_image_version="$(git log -1 --pretty=tformat:%H image)"
cd infra
terraform $@ $extra_args
