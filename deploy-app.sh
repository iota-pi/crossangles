# Get ENV variables from terraform output
tf_output="$(terraform output)"
app_bucket=$(echo "$tf_output" | grep ^app_bucket | sed 's/^[^ ]* = //')
app_uri=$(echo "$tf_output" | grep ^app_uri | sed 's/^[^ ]* = //')
contact_endpoint=$(echo "$tf_output" | grep ^contact_endpoint)
stage_name=$(echo "$contact_endpoint" | sed 's@.*/@@')

stage_hyphens=$(echo $stage_name | sed 's/./-/g')
echo "Deploying app to $stage_name"
echo "-----------------$stage_hyphens"
echo "Copying to s3://$app_bucket"
aws s3 cp app/build/ s3://$app_bucket/ --recursive --acl public-read
