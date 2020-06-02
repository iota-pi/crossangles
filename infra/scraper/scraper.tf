locals {
  scraper_s3_origin_id = "scraper_s3_origin"
}

resource "aws_s3_bucket_object" "scraper_code" {
  bucket = var.code_bucket
  key    = "${var.environment}/${var.git_version}/${var.code_key}"
  source = "scraper/build/scraper.zip"
  etag   = filemd5("scraper/build/scraper.zip")
}

resource "aws_lambda_function" "scraper" {
  function_name = "crossangles-scraper-${var.environment}"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 1536
  timeout     = 300

  s3_bucket        = aws_s3_bucket_object.scraper_code.bucket
  s3_key           = aws_s3_bucket_object.scraper_code.key
  source_code_hash = filebase64sha256(aws_s3_bucket_object.scraper_code.source)

  role = aws_iam_role.scraper_role.arn

  environment {
    variables = {
      S3_OUTPUT_BUCKET = aws_s3_bucket.scraper_output.bucket
      STATE_TABLE      = aws_dynamodb_table.scraper_state_table.name
    }
  }
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
}

resource "aws_s3_bucket" "scraper_output" {
  bucket = "crossangles-course-data${terraform.workspace == "default" ? "" : "-${terraform.workspace}"}"
  acl    = "private"

  tags = {
    Name        = "CrossAngles Data"
    Environment = var.environment
  }

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

    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 600
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
  description = "Run scraper on schedule"

  # Run every 15 minutes
  schedule_expression = "cron(5,20,35,50 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "scraper_target" {
  rule = aws_cloudwatch_event_rule.scraper_trigger.name
  arn  = aws_lambda_function.scraper.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_scraper" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.scraper.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scraper_trigger.arn
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
}
