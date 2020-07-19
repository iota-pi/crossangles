provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

locals {
  component = "app"
  origin_id = "app_s3_origin"

  allowed_methods = ["GET", "HEAD", "OPTIONS"]
  cached_methods  = ["GET", "HEAD"]

  min_ttl     = var.environment == "production" ? 600 : 0
  default_ttl = var.environment == "production" ? 1800 : 0
  max_ttl     = 3600
  compress    = true

  viewer_protocol_policy = "redirect-to-https"

  standard_tags = {
    Environment = var.environment
    Component = local.component
  }
}

resource "aws_s3_bucket" "app" {
  bucket = "crossangles-app-${var.environment}"
  acl    = "private"

  tags = local.standard_tags

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
  }
}

resource "aws_cloudfront_origin_access_identity" "app_oai" {}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id   = local.origin_id
    origin_path = "/${var.campus}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.app_oai.cloudfront_access_identity_path
    }
  }

  aliases = [local.domain]

  enabled         = true
  is_ipv6_enabled = true

  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = local.allowed_methods
    cached_methods   = local.cached_methods
    target_origin_id = local.origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = local.min_ttl
    default_ttl            = local.default_ttl
    max_ttl                = local.max_ttl
    compress               = local.compress
    viewer_protocol_policy = local.viewer_protocol_policy
  }

  ordered_cache_behavior {
    path_pattern     = "/timetable"
    allowed_methods  = local.allowed_methods
    cached_methods   = local.cached_methods
    target_origin_id = local.origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = local.min_ttl
    default_ttl            = local.default_ttl
    max_ttl                = local.max_ttl
    compress               = local.compress
    viewer_protocol_policy = local.viewer_protocol_policy
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.root_cert.arn
    ssl_support_method  = "sni-only"
  }

  tags = local.standard_tags

  depends_on = [aws_acm_certificate_validation.root_cert]
}

output "app_domain" {
  value = "${local.domain}"
}

output "app_bucket" {
  value = aws_s3_bucket.app.bucket
}
