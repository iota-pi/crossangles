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

  endpoints {
    apigateway     = lookup(var.endpoints, "apigateway", null)
    cloudformation = lookup(var.endpoints, "cloudformation", null)
    cloudwatch     = lookup(var.endpoints, "cloudwatch", null)
    dynamodb       = lookup(var.endpoints, "dynamodb", null)
    es             = lookup(var.endpoints, "es", null)
    firehose       = lookup(var.endpoints, "firehose", null)
    iam            = lookup(var.endpoints, "iam", null)
    kinesis        = lookup(var.endpoints, "kinesis", null)
    lambda         = lookup(var.endpoints, "lambda", null)
    route53        = lookup(var.endpoints, "route53", null)
    redshift       = lookup(var.endpoints, "redshift", null)
    s3             = lookup(var.endpoints, "s3", null)
    secretsmanager = lookup(var.endpoints, "secretsmanager", null)
    ses            = lookup(var.endpoints, "ses", null)
    sns            = lookup(var.endpoints, "sns", null)
    sqs            = lookup(var.endpoints, "sqs", null)
    ssm            = lookup(var.endpoints, "ssm", null)
    stepfunctions  = lookup(var.endpoints, "stepfunctions", null)
    sts            = lookup(var.endpoints, "sts", null)
  }
}

locals {
  environment = terraform.workspace == "default" ? "production" : terraform.workspace
}

module "app" {
  source = "./app"

  environment = local.environment
}

module "scraper" {
  source = "./scraper"

  environment = local.environment
}

module "image" {
  source = "./image"

  environment = local.environment
}

module "contact" {
  source = "./contact"

  environment = local.environment
}

# Outputs
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
