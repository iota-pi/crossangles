TF_VAR_app_version="$(git log -1 --pretty=tformat:%H app)"
TF_VAR_scraper_version="$(git log -1 --pretty=tformat:%H scraper)"
TF_VAR_contact_version="$(git log -1 --pretty=tformat:%H contact)"
TF_VAR_image_version="$(git log -1 --pretty=tformat:%H image)"
cd infra
terraform $@ -input=false
