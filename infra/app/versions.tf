terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    cloudflare = {
      source = "terraform-providers/cloudflare"
    }
  }
  required_version = ">= 0.13"
}
