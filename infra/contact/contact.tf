locals {
  standard_tags = {
    Environment = var.environment
    Component = "contact"
  }
}

resource "aws_lambda_function" "contact" {
  function_name = "crossangles-contact-${var.environment}"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 256
  timeout     = 10

  s3_bucket = var.code_bucket
  s3_key    = "${var.environment}/contact/${var.git_version}/contact.zip"

  role = aws_iam_role.contact_role.arn

  environment {
    variables = {
      MAILGUN_API_KEY = var.mailgun_key
    }
  }

  tags = local.standard_tags
}

resource "aws_iam_role" "contact_role" {
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
  description = "Lambda policy to allow logging"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PutLogs",
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


resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.contact.function_name}"
  retention_in_days = 14
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


resource "aws_api_gateway_rest_api" "contact_gateway" {
  name        = "crossangles_contact_gateway_${var.environment}"
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

resource "aws_api_gateway_deployment" "contact_deployment" {
  depends_on = [
    aws_api_gateway_integration.contact_lambda_root,
    aws_cloudwatch_log_group.debugging,
  ]

  rest_api_id = aws_api_gateway_rest_api.contact_gateway.id
  stage_name  = var.environment

  tags = local.standard_tags
}


resource "aws_cloudwatch_log_group" "debugging" {
  name = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.contact_gateway.id}/${var.environment}"

  retention_in_days = 7
}

output "invoke_url" {
  value = aws_api_gateway_deployment.contact_deployment.invoke_url
}
