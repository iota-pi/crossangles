locals {
  environment = terraform.workspace == "default" ? "production" : terraform.workspace
}

module "app" {
  source = "./app"

  environment = local.environment
}

module "scraper" {
  source = "./scraper"

  environment = local.environment
}

module "image" {
  source = "./image"

  environment = local.environment
}

module "contact" {
  source = "./contact"

  environment = local.environment
}

# Outputs
output "app_uri" {
  value = module.app.cloudfront_url
}
output "app_bucket" {
  value = module.app.app_bucket
}
output "scraper_endpoint" {
  value = module.scraper.cloudfront_url
}
output "image_endpoint" {
  value = module.image.invoke_url
}
output "contact_endpoint" {
  value = module.contact.invoke_url
}
output "environment" {
  value = local.environment
}
