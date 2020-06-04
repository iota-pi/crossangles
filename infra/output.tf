output "environment" {
  value = local.environment
}

output "app_uri" {
  value = "https://${module.app.app_domain}"
}

output "app_bucket" {
  value = module.app.app_bucket
}

output "app_version" {
  value = var.app_version
}

output "scraper_endpoint" {
  value = module.scraper.cloudfront_url
}

output "scraper_version" {
  value = var.scraper_version
}

output "image_endpoint" {
  value = module.image.invoke_url
}

output "image_version" {
  value = var.image_version
}

output "contact_endpoint" {
  value = module.contact.invoke_url
}

output "contact_version" {
  value = var.contact_version
}
