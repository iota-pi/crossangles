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

variable "endpoints" {
  type = map(string)
  default = {}
}

module "crossangles" {
  source = "./infra"
}

output "app_uri" {
  value = module.crossangles.app_uri
}
output "app_bucket" {
  value = module.crossangles.app_bucket
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
output "environment" {
  value = module.crossangles.environment
}
