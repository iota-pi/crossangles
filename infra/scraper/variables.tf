variable "environment" {
  type = string
}

variable "code_bucket" {
  type    = string
  default = "crossangles-lambda-code"
}

variable "campuses" {
  type = list(string)
}

variable "git_version" {
  type = string
}
