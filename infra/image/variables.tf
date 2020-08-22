variable environment {
  type = string
}

variable code_bucket {
  type    = string
  default = "crossangles-lambda-code"
}

variable pjsc_key {
  type      = string
  sensitive = true
}

variable git_version {
  type = string
}
