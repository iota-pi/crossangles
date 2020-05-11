module "crossangles" {
  source = "./infra"
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
