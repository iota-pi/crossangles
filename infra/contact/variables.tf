variable environment {
  type = string
}

variable code_bucket {
  type    = string
  default = "crossangles-lambda-code"
}

variable code_key {
  type    = string
  default = "contact/contact.zip"
}

variable mailgun_api_key {
  type    = string
}

variable git_version {
  type = string
}
