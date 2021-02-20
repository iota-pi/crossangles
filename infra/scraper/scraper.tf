locals {
  scraper_s3_origin_id = "scraper_s3_origin"

  # In production: run the scraper every hour
  # In staging: run it at ~6am or ~7am (depending on DST)
  cron_times = {
    unsw = var.environment == "production" ? "5 *" : "5 19"
    usyd = var.environment == "production" ? "10 *" : "10 19"
  }

  standard_tags = {
    Environment = var.environment
    Component   = "scraper"
    Application = "crossangles"
  }
}

resource "aws_lambda_function" "scraper" {
  function_name = "crossangles-scraper-${var.environment}"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 2048
  timeout     = 300

  s3_bucket = var.code_bucket
  s3_key    = "${var.environment}/scraper/${var.git_version}/scraper.zip"

  role = aws_iam_role.scraper_role.arn

  environment {
    variables = {
      S3_OUTPUT_BUCKET = aws_s3_bucket.scraper_output.bucket
      STATE_TABLE      = aws_dynamodb_table.scraper_state_table.name
      ENVIRONMENT      = var.environment
    }
  }

  tags = local.standard_tags
}

resource "aws_iam_role" "scraper_role" {
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
  tags = local.standard_tags
}

resource "aws_iam_policy" "scraper_policy" {
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
      "Resource": "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.scraper_state_table.name}"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "scraper_policy_attach" {
  role       = aws_iam_role.scraper_role.name
  policy_arn = aws_iam_policy.scraper_policy.arn
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.scraper.function_name}"
  retention_in_days = 14
}

resource "aws_dynamodb_table" "scraper_state_table" {
  name         = "ScraperState_${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "campus"
  range_key    = "key"

  attribute {
    name = "campus"
    type = "S"
  }

  attribute {
    name = "key"
    type = "S"
  }

  tags = local.standard_tags
}

resource "aws_s3_bucket" "scraper_output" {
  bucket = "crossangles-course-data${var.environment == "production" ? "" : "-${var.environment}"}"
  acl    = "private"

  tags = local.standard_tags

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
  }
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

    min_ttl                = var.environment == "production" ? 1800 : 300
    default_ttl            = var.environment == "production" ? 1800 : 300
    max_ttl                = var.environment == "production" ? 7200 : 1800
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

  tags = local.standard_tags
}


resource "aws_cloudwatch_event_rule" "scraper_trigger" {
  for_each = toset(var.campuses)

  schedule_expression = "cron(${local.cron_times[each.key]} * * ? *)"

  description = "Run scraper on schedule"
  tags        = local.standard_tags
}

resource "aws_cloudwatch_event_target" "scraper_target" {
  for_each = toset(var.campuses)

  rule  = aws_cloudwatch_event_rule.scraper_trigger[each.key].name
  arn   = aws_lambda_function.scraper.arn
  input = <<-EOF
{"campuses": ["${each.value}"]}
EOF
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_scraper" {
  for_each = toset(var.campuses)

  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scraper.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scraper_trigger[each.key].arn
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}
