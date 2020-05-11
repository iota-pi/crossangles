terraform {
  backend "s3" {
    bucket = "crosscode-terraform-state"
    key    = "crossangles/prod/terraform.tfstate"
    region = "ap-southeast-2"
  }
}

provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.52"
}

module "scraper" {
  source = "./scraper"
}

module "image" {
  source = "./image"
}

module "contact" {
  source = "./contact"
}

# Outputs
output "scraper_endpoint" {
  value = module.scraper.cloudfront_url
}
output "image_endpoint" {
  value = module.image.invoke_url
}
output "contact_endpoint" {
  value = module.contact.invoke_url
}
