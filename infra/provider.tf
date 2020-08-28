terraform {
  required_version = ">= 0.13"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 2.52"
    }
    cloudflare = {
      source  = "terraform-providers/cloudflare"
      version = "~> 2.4"
    }
  }

  backend "s3" {
    bucket         = "crosscode-terraform-state"
    key            = "crossangles/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "CrossCodeTerraformLocking"
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

provider "cloudflare" {
}
