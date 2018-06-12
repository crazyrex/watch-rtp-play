provider "aws" {
  region = "${var.aws_region}"
}

data "template_file" "container_definitions" {
  template = "${file("${path.module}/container-definitions.json")}"

  vars {
    name  = "${var.name}"
    image = "${var.docker_repo}/${var.name}:${var.version}"
  }
}

module "watch-rtp-play" {
  //source                     = "github.com/antifragile-systems/antifragile-service"
  source                = "../../../antifragile-service"

  name                  = "${var.name}"
  domain_name           = "${var.domain_name}"
  container_definitions = "${data.template_file.container_definitions.rendered}"
  api_quota_limit       = 1000
  api_quota_offset      = 0
  api_quota_period      = "DAY"
  aws_region            = "${var.aws_region}"
}
