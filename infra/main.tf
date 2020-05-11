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
