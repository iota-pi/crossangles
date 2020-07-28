locals {
  standard_tags = {
    Environment = var.environment
    Component = "image"
  }
}

resource "aws_lambda_function" "image" {
  function_name = "crossangles-image-${var.environment}"

  # "lambda" is the filename within the zip file (main.js) and "handler"
  # is the name of the property under which the handler function was
  # exported in that file.
  handler     = "lambda.handler"
  runtime     = "nodejs12.x"
  memory_size = 1024
  timeout     = 30

  s3_bucket = var.code_bucket
  s3_key    = "${var.environment}/image/${var.git_version}/image.zip"

  layers = [
    # this layer includes the chromium binary
    "arn:aws:lambda:ap-southeast-2:764866452798:layer:chrome-aws-lambda:8",
  ]

  role = aws_iam_role.image_role.arn

  environment {
    variables = {
      TIMETABLE_BUCKET = aws_s3_bucket.timetables.bucket
    }
  }

  tags = local.standard_tags
}

resource "aws_iam_role" "image_role" {
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
  bucket = "crossangles-timetables${var.environment == "production" ? "" : "-${var.environment}"}"
  acl    = "private"

  tags = local.standard_tags
}

resource "aws_iam_policy" "image_policy" {
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


resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.image.function_name}"
  retention_in_days = 14
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

resource "aws_api_gateway_rest_api" "image_gateway" {
  name        = "crossangles_image_gateway_${var.environment}"
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


resource "aws_api_gateway_deployment" "image_deployment" {
  depends_on = [
    aws_api_gateway_integration.image_lambda_root,
    aws_cloudwatch_log_group.debugging,
  ]

  rest_api_id = aws_api_gateway_rest_api.image_gateway.id
  stage_name  = var.environment
}

resource "aws_cloudwatch_log_group" "debugging" {
  name = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.image_gateway.id}/${var.environment}"

  retention_in_days = 7
}

output "invoke_url" {
  value = aws_api_gateway_deployment.image_deployment.invoke_url
}

resource "aws_cloudwatch_event_rule" "image_trigger" {
  count = var.environment == "production" ? 1 : 0
  description = "Keep lambda warm"

  # Run every 15 minutes
  schedule_expression = "cron(2,17,32,47 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "image_target" {
  count = var.environment == "production" ? 1 : 0

  rule = aws_cloudwatch_event_rule.image_trigger.name
  arn  = aws_lambda_function.image.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_image" {
  count = var.environment == "production" ? 1 : 0

  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.image_trigger.arn
}
