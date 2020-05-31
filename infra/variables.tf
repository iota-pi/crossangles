variable root_domain {
  type    = string
  default = "crossangles.com"
}

variable cloudflare_zone_id {
  type    = string
  default = "525c11e0fba1dd406c3cd38fcba98d44"
}

variable campuses {
  type = list(string)
}

variable mailgun_api_key {
  type = string
}

variable pjsc_key {
  type = string
}
