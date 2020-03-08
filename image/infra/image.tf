provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.52"
}

resource "aws_s3_bucket_object" "image_code" {
  bucket = var.code_bucket
  key    = var.code_key
  source = "../build/image.zip"
  etag   = filemd5("../build/image.zip")
}

resource "aws_lambda_function" "image" {
  function_name = "crossangles-image"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 1536
  timeout     = 30

  s3_bucket        = aws_s3_bucket_object.image_code.bucket
  s3_key           = aws_s3_bucket_object.image_code.key
  source_code_hash = aws_s3_bucket_object.image_code.etag

  layers = [
    # this layer includes the chromium binary
    "arn:aws:lambda:ap-southeast-2:764866452798:layer:chrome-aws-lambda:8",
  ]

  role = aws_iam_role.image_role.arn
}

resource "aws_iam_role" "image_role" {
  name = "iam_for_image_lambda"

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

resource "aws_s3_bucket" "timetables" {
  bucket = "crossangles-timetables"
  acl    = "private"

  tags = {
    Name        = "CrossAngles Data"
    Environment = "Staging"
  }
}

resource "aws_iam_policy" "image_policy" {
  name        = "image-policy"
  description = "Lambda policy to allow writing logs and to S3"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LoggingActions",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": ["arn:aws:logs:*:*:*"]
    },
    {
      "Sid": "PutObjectActions",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": ["arn:aws:s3:::${aws_s3_bucket.timetables.bucket}/*"]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "image_policy_attach" {
  role       = aws_iam_role.image_role.name
  policy_arn = aws_iam_policy.image_policy.arn
}


resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.image_gateway.execution_arn}/*/*"
}

output "base_url" {
  value = aws_api_gateway_deployment.image_deployment.invoke_url
}


resource "aws_api_gateway_rest_api" "image_gateway" {
  name        = "crossangles_image_gateway"
  description = "CrossAngles Gateway for Save as Image"
}

resource "aws_api_gateway_resource" "image_proxy" {
  rest_api_id = aws_api_gateway_rest_api.image_gateway.id
  parent_id   = aws_api_gateway_rest_api.image_gateway.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "image_proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.image_gateway.id
  resource_id   = aws_api_gateway_rest_api.image_gateway.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "image_lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.image_gateway.id
  resource_id = aws_api_gateway_method.image_proxy_root.resource_id
  http_method = aws_api_gateway_method.image_proxy_root.http_method

  integration_http_method = "POST"

  type = "AWS_PROXY"
  uri  = aws_lambda_function.image.invoke_arn
}

locals {
  stage_name = "production"
}

resource "aws_api_gateway_deployment" "image_deployment" {
  depends_on = [
    aws_api_gateway_integration.image_lambda_root,
    aws_cloudwatch_log_group.debugging,
  ]

  rest_api_id = aws_api_gateway_rest_api.image_gateway.id
  stage_name  = local.stage_name
}

resource "aws_cloudwatch_log_group" "debugging" {
  name = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.image_gateway.id}/${local.stage_name}"

  retention_in_days = 7
}
