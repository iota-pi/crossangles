provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.48"
}

resource "aws_s3_bucket_object" "scraper_code" {
  bucket = var.code_bucket
  key    = var.code_key
  source = "../build/scraper.zip"
  etag   = filemd5("../build/scraper.zip")
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

  s3_bucket        = aws_s3_bucket_object.scraper_code.bucket
  s3_key           = aws_s3_bucket_object.scraper_code.key
  source_code_hash = aws_s3_bucket_object.scraper_code.etag

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
  description = "Lambda policy to allow writing to S3 bucket, DynamoDB, and logging"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PutObjectActions",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": ["arn:aws:s3:::${aws_s3_bucket.scraper_output.bucket}/*"]
    },
    {
      "Sid": "PutLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": ["arn:aws:logs:*:*:*"]
    },
    {
      "Sid": "ReadWriteCreateTable",
      "Effect": "Allow",
      "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:CreateTable"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/ScraperData"
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
    default_ttl            = 600
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

  # Run every 15 minutes from 5:05am to 12:05am the next day (non-DST)
  schedule_expression = "cron(5,20,35,50 17-23,0-12 * * ? *)"
}

resource "aws_cloudwatch_event_target" "scraper_target" {
  rule      = aws_cloudwatch_event_rule.scraper_trigger.name
  target_id = "scraper_target"
  arn       = aws_lambda_function.scraper.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_scraper" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scraper.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scraper_trigger.arn
}
