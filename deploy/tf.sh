#!/usr/bin/env bash
set -e
cd "$(dirname "$(realpath "$0")")"
tf_cmd="$1"

docker_args=()

(
  if [[ -f "./secrets.sh" ]]; then
    source ./secrets.sh
  fi

  extra_args=""
  if [[ "$1" =~ init|refresh|plan|apply ]]; then
    extra_args+=" -input=false"
  fi

  if [[ "$1" == "apply" ]]; then
    docker_args+=("-it")
  fi

  export TF_VAR_app_version="$(./version.sh app)"
  export TF_VAR_scraper_version="$(./version.sh scraper)"
  export TF_VAR_contact_version="$(./version.sh contact)"
  export TF_VAR_image_version="$(./version.sh image)"
  export TF_IN_AUTOMATION="1"

  docker run \
    --rm \
    "${docker_args[@]}" \
    -e "CLOUDFLARE_ACCOUNT_ID" \
    -e "CLOUDFLARE_API_TOKEN" \
    -e "AWS_ACCESS_KEY_ID" \
    -e "AWS_SECRET_ACCESS_KEY" \
    -e "TF_VAR_mailgun_key" \
    -e "TF_VAR_pjsc_key" \
    -e "TF_VAR_app_version" \
    -e "TF_VAR_scraper_version" \
    -e "TF_VAR_contact_version" \
    -e "TF_VAR_image_version" \
    -e "TF_IN_AUTOMATION" \
    -v "$(realpath ../infra):/infra" \
    -w "/infra" \
    -u "$(id -u):$(id -g)" \
    hashicorp/terraform:0.13.1 \
    $tf_cmd $extra_args ${@:2}
)
