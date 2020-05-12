variable "endpoints" {
  type = map(string)
  default = {}
}

module "crossangles" {
  source = "./infra"

  endpoints = var.endpoints
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
