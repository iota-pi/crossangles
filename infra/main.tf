locals {
  environment = terraform.workspace == "default" ? "production" : terraform.workspace
  domain      = local.environment == "production" ? var.root_domain : "${local.environment}.${var.root_domain}"
}

module "app" {
  source = "./app"

  environment        = local.environment
  git_version        = var.git_version
  campus             = var.campuses[0]
  domain             = local.domain
  cloudflare_zone_id = var.cloudflare_zone_id
}

module "scraper" {
  source = "./scraper"

  environment = local.environment
  git_version = var.git_version
}

module "image" {
  source = "./image"

  environment = local.environment
  git_version = var.git_version
  pjsc_key    = var.pjsc_key
}

module "contact" {
  source = "./contact"

  environment     = local.environment
  git_version     = var.git_version
  mailgun_api_key = var.mailgun_api_key
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
