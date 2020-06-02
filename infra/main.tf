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
  code_bucket = var.code_bucket
  git_version = var.git_version
}

module "image" {
  source = "./image"

  environment = local.environment
  code_bucket = var.code_bucket
  git_version = var.git_version
  pjsc_key    = var.pjsc_key
}

module "contact" {
  source = "./contact"

  environment = local.environment
  code_bucket = var.code_bucket
  git_version = var.git_version
  mailgun_key = var.mailgun_key
}
