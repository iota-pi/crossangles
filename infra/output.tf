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
