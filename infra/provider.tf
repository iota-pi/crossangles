terraform {
  backend "s3" {
    bucket         = "crosscode-terraform-state"
    key            = "crossangles/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "CrossCodeTerraformLocking"
  }
}

provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.52"
}

provider "cloudflare" {
  version = "~> 2.4"
}
