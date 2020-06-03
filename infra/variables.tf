variable root_domain {
  type    = string
  default = "crossangles.com"
}

variable cloudflare_zone_id {
  type    = string
  default = "525c11e0fba1dd406c3cd38fcba98d44"
}

variable campuses {
  type    = list(string)
  default = ["unsw"]
}

variable app_version {
  type = string
}

variable scraper_version {
  type = string
}

variable contact_version {
  type = string
}

variable image_version {
  type = string
}

variable code_bucket {
  type    = string
  default = "crossangles-lambda-code"
}

variable mailgun_key {
  type    = string
  default = ""
}

variable pjsc_key {
  type    = string
  default = ""
}
