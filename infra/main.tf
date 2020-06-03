locals {
  environment = terraform.workspace == "default" ? "production" : terraform.workspace
}

module "app" {
  source = "./app"

  environment        = local.environment
  git_version        = var.app_version
  campus             = var.campuses[0]
  root_domain        = var.root_domain
  cloudflare_zone_id = var.cloudflare_zone_id
}

module "scraper" {
  source = "./scraper"

  environment = local.environment
  code_bucket = var.code_bucket
  git_version = var.scraper_version
}

module "image" {
  source = "./image"

  environment = local.environment
  code_bucket = var.code_bucket
  git_version = var.image_version
  pjsc_key    = var.pjsc_key
}

module "contact" {
  source = "./contact"

  environment = local.environment
  code_bucket = var.code_bucket
  git_version = var.contact_version
  mailgun_key = var.mailgun_key
}
