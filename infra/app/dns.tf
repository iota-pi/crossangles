locals {
  env_prefix    = var.environment == "production" ? "" : var.environment
  campus_prefix = var.campus == "unsw" ? "" : var.campus
  subdomain     = trim("${local.env_prefix}.${local.campus_prefix}", ".")
  domain        = trim("${local.subdomain}.${var.root_domain}", ".")
}

# Root domain DNS and SSL Cert
resource "cloudflare_record" "primary_cname" {
  zone_id = var.cloudflare_zone_id
  type    = "CNAME"
  name    = local.subdomain != "" ? local.subdomain : "@"
  value   = aws_cloudfront_distribution.s3_distribution.domain_name
}

resource "aws_acm_certificate" "root_cert" {
  domain_name       = local.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  provider = aws.us_east_1
}

resource "aws_acm_certificate_validation" "root_cert" {
  certificate_arn         = aws_acm_certificate.root_cert.arn
  validation_record_fqdns = [cloudflare_record.root_cert_validation.hostname]

  provider = aws.us_east_1
}

resource "cloudflare_record" "root_cert_validation" {
  zone_id = var.cloudflare_zone_id
  name    = aws_acm_certificate.root_cert.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.root_cert.domain_validation_options.0.resource_record_type
  value   = trimsuffix(aws_acm_certificate.root_cert.domain_validation_options.0.resource_record_value, ".")
}

# Redirect www domain to root domain for production
resource "cloudflare_record" "www_cname" {
  count = local.subdomain == "" ? 1 : 0

  zone_id = var.cloudflare_zone_id
  type    = "CNAME"
  name    = "www"
  value   = aws_cloudfront_distribution.s3_distribution.domain_name
  proxied = true
}

resource "cloudflare_page_rule" "redirect_to_root" {
  count = var.environment == "production" ? 1 : 0

  zone_id  = var.cloudflare_zone_id
  target   = "www.${local.domain}/*"
  priority = 1

  actions {
    forwarding_url {
      url         = "https://${local.domain}"
      status_code = 301
    }
  }
}
