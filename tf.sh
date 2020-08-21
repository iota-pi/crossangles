#!/usr/bin/env bash
set -e

extra_args=""
if [[ $1 =~ init|refresh|apply ]]; then
  extra_args+=" -input=false"
fi

export TF_VAR_app_version="$(./version.sh app)"
export TF_VAR_scraper_version="$(./version.sh scraper)"
export TF_VAR_contact_version="$(./version.sh contact)"
export TF_VAR_image_version="$(./version.sh image)"
export TF_IN_AUTOMATION=$CI
cd infra
terraform $@ $extra_args
