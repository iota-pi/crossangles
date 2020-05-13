variable "endpoints" {
  type = map(string)
  default = {}
}

module "crossangles" {
  source = "./infra"

  endpoints = var.endpoints
}

output "app_uri" {
  value = module.crossangles.app_uri
}

output "app_bucket" {
  value = module.crossangles.app_bucket
}

output "scraper_endpoint" {
  value = module.crossangles.scraper_endpoint
}

output "image_endpoint" {
  value = module.crossangles.image_endpoint
}

output "contact_endpoint" {
  value = module.crossangles.contact_endpoint
}
