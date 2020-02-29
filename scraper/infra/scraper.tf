provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.48"
}

provider "archive" {
  version = "~> 1.3"
}

data "archive_file" "scraper_code" {
  type        = "zip"
  source_file = "../build/bundled/lambda.js"
  output_path = "../build/bundled/scraper.zip"
}

resource "aws_lambda_function" "scraper" {
  function_name = "crossangles-scraper"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 1024
  timeout     = 60

  filename         = data.archive_file.scraper_code.output_path
  source_code_hash = data.archive_file.scraper_code.output_base64sha256

  role = aws_iam_role.scraper_role.arn
}

resource "aws_iam_role" "scraper_role" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "scraper_policy" {
  name        = "scraper-policy"
  description = "Lambda policy to allow writing to S3 bucket"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PutObjectActions",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": ["arn:aws:s3:::${aws_s3_bucket.scraper_output.bucket}/*"]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "scraper_policy_attach" {
  role       = aws_iam_role.scraper_role.name
  policy_arn = aws_iam_policy.scraper_policy.arn
}

resource "aws_s3_bucket" "scraper_output" {
  bucket = "crossangles-course-data"
  acl    = "private"

  tags = {
    Name        = "CrossAngles Data"
    Environment = "Staging"
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
  }
}

locals {
  scraper_s3_origin_id = "scraper_s3_origin"
}

resource "aws_cloudfront_origin_access_identity" "scraper_oai" {}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.scraper_output.bucket_regional_domain_name
    origin_id   = local.scraper_s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.scraper_oai.cloudfront_access_identity_path
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.scraper_s3_origin_id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 1800
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}


resource "aws_cloudwatch_event_rule" "scraper_trigger" {
  name        = "scraper_trigger"
  description = "Run scraper on schedule"

  # Below times are in UTC and correspond to 5:05am, 12:05pm, 6:05pm each day (no DST)
  # TODO: change to run every hour and have scraper check if data has been updated
  schedule_expression = "cron(5 17,0,6 * * ? *)"
}

resource "aws_cloudwatch_event_target" "scraper_target" {
  rule      = aws_cloudwatch_event_rule.scraper_trigger.name
  target_id = "check_foo"
  arn       = aws_lambda_function.scraper.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_scraper" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scraper.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scraper_trigger.arn
}
