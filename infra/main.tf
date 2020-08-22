locals {
  environment        = terraform.workspace == "default" ? "production" : terraform.workspace
  cloudflare_zone_id = var.root_domain == "crossangles.app" ? "4a43b80f8478b4e805d704edadb864c8" : "525c11e0fba1dd406c3cd38fcba98d44"
}

module "app" {
  source = "./app"

  environment        = local.environment
  git_version        = var.app_version
  campus             = var.campuses[0]
  root_domain        = var.root_domain
  cloudflare_zone_id = local.cloudflare_zone_id
}

module "scraper" {
  source = "./scraper"

  environment = local.environment
  code_bucket = var.code_bucket
  git_version = var.scraper_version
  campuses    = var.campuses
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
