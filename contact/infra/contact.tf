provider "aws" {
  region  = "ap-southeast-2"
  version = "~> 2.48"
}

provider "archive" {
  version = "~> 1.3"
}

data "archive_file" "contact_code" {
  type        = "zip"
  source_file = "../build/bundled/lambda.js"
  output_path = "../build/bundled/contact.zip"
}

resource "aws_lambda_function" "contact" {
  function_name = "crossangles-contact"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 128
  timeout     = 10

  filename         = data.archive_file.contact_code.output_path
  source_code_hash = data.archive_file.contact_code.output_base64sha256

  role = aws_iam_role.contact_role.arn
}

resource "aws_iam_role" "contact_role" {
  name = "iam_for_contact_lambda"

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

resource "aws_iam_policy" "contact_policy" {
  name        = "contact-policy"
  description = "Lambda policy to allow writing to S3 bucket"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PutObjectActions",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": ["arn:aws:logs:*:*:*"]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "contact_policy_attach" {
  role       = aws_iam_role.contact_role.name
  policy_arn = aws_iam_policy.contact_policy.arn
}


resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.contact_gateway.execution_arn}/*/*"
}

output "base_url" {
  value = aws_api_gateway_deployment.contact_deployment.invoke_url
}


resource "aws_api_gateway_rest_api" "contact_gateway" {
  name        = "crossangles_contact_gateway"
  description = "CrossAngles Gateway for Contact Us form"
}

resource "aws_api_gateway_resource" "contact_proxy" {
  rest_api_id = aws_api_gateway_rest_api.contact_gateway.id
  parent_id   = aws_api_gateway_rest_api.contact_gateway.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "contact_proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.contact_gateway.id
  resource_id   = aws_api_gateway_rest_api.contact_gateway.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "contact_lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.contact_gateway.id
  resource_id = aws_api_gateway_method.contact_proxy_root.resource_id
  http_method = aws_api_gateway_method.contact_proxy_root.http_method

  integration_http_method = "POST"

  type = "AWS_PROXY"
  uri  = aws_lambda_function.contact.invoke_arn
}

locals {
  stage_name = "production"
}

resource "aws_api_gateway_deployment" "contact_deployment" {
  depends_on = [
    aws_api_gateway_integration.contact_lambda_root,
    aws_cloudwatch_log_group.debugging,
  ]

  rest_api_id = aws_api_gateway_rest_api.contact_gateway.id
  stage_name  = local.stage_name
}



resource "aws_cloudwatch_log_group" "debugging" {
  name = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.contact_gateway.id}/${local.stage_name}"

  retention_in_days = 7
}

resource "aws_api_gateway_account" "contact_api_account" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}

resource "aws_iam_role" "cloudwatch" {
  name = "api_gateway_cloudwatch_global"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "default"
  role = aws_iam_role.cloudwatch.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}
