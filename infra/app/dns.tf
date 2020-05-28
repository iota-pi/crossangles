# Root domain DNS and SSL Cert
resource "cloudflare_record" "root_domain" {
  zone_id = var.cloudflare_zone_id
  type    = "CNAME"
  name    = var.subdomain
  value   = aws_cloudfront_distribution.s3_distribution.domain_name
}
resource "aws_acm_certificate" "root_cert" {
  domain_name       = var.domain
  validation_method = "DNS"

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
