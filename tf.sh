#!/usr/bin/env bash
set -e

extra_args=""
if [[ $1 =~ init|refresh|apply ]]; then
  extra_args+=" -input=false"
fi

export TF_VAR_app_version="$(git log -1 --pretty=tformat:%H app)"
export TF_VAR_scraper_version="$(git log -1 --pretty=tformat:%H scraper)"
export TF_VAR_contact_version="$(git log -1 --pretty=tformat:%H contact)"
export TF_VAR_image_version="$(git log -1 --pretty=tformat:%H image)"
cd infra
terraform $@ $extra_args
