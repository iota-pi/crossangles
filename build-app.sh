# Get ENV variables from terraform output
tf_output="$(terraform output)"
scraper_endpoint=$(echo "$tf_output" | grep ^scraper_endpoint)
contact_endpoint=$(echo "$tf_output" | grep ^contact_endpoint)
image_endpoint=$(echo "$tf_output" | grep ^image_endpoint)
stage_name=$(echo "$contact_endpoint" | sed 's@.*/@@')
contact_endpoint=$(echo "$contact_endpoint" | sed 's@\.com/.*@.com@;s/.*= *//')
image_endpoint=$(echo "$image_endpoint" | sed 's@\.com/.*@.com@;s/.*= *//')
data_uri=$(echo "$scraper_endpoint" | sed 's/.*= *//')

stage_hyphens=$(echo $stage_name | sed 's/./-/g')
echo "Building app for $stage_name"
echo "-----------------$stage_hyphens"
export REACT_APP_STAGE_NAME=$stage_name
export REACT_APP_CONTACT_ENDPOINT=$contact_endpoint
export REACT_APP_SAVE_IMAGE_ENDPOINT=$image_endpoint
export REACT_APP_DATA_ROOT_URI=$data_uri
echo REACT_APP_STAGE_NAME=$REACT_APP_STAGE_NAME
echo REACT_APP_CONTACT_ENDPOINT=$REACT_APP_CONTACT_ENDPOINT
echo REACT_APP_SAVE_IMAGE_ENDPOINT=$REACT_APP_SAVE_IMAGE_ENDPOINT
echo REACT_APP_DATA_ROOT_URI=$REACT_APP_DATA_ROOT_URI


cd app
npm run build
