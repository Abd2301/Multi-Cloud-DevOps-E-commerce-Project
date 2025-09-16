# AWS Direct Connect Module
# This module creates Direct Connect for cross-cloud connectivity

# Create Direct Connect Gateway
resource "aws_dx_gateway" "main" {
  name            = "${var.project_name}-dxgw"
  amazon_side_asn = 64512
}

# Create Direct Connect Connection
resource "aws_dx_connection" "main" {
  name      = "${var.project_name}-dx-conn"
  bandwidth = "1Gbps"
  location  = "EqSV2"  # Equinix Silicon Valley 2

  tags = merge(var.tags, {
    Name = "${var.project_name}-dx-conn"
  })
}

# Create Direct Connect Virtual Interface
resource "aws_dx_private_virtual_interface" "main" {
  connection_id = aws_dx_connection.main.id
  name          = "${var.project_name}-dx-vif"
  vlan          = 100
  address_family = "ipv4"
  bgp_asn       = 65001
  bgp_auth_key  = var.direct_connect_bgp_key
  dx_gateway_id = aws_dx_gateway.main.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-dx-vif"
  })
}

# Create VPN Gateway for Direct Connect
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-vpn-gw"
  })
}

# Create Customer Gateway
resource "aws_customer_gateway" "main" {
  bgp_asn    = 65001
  ip_address = var.azure_gateway_ip
  type       = "ipsec.1"

  tags = merge(var.tags, {
    Name = "${var.project_name}-cgw"
  })
}

# Create VPN Connection
resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-vpn-conn"
  })
}

# Create VPN Connection Route
resource "aws_vpn_connection_route" "main" {
  destination_cidr_block = "10.0.0.0/16"
  vpn_connection_id      = aws_vpn_connection.main.id
}

# Create Direct Connect Gateway Association
resource "aws_dx_gateway_association" "main" {
  dx_gateway_id         = aws_dx_gateway.main.id
  associated_gateway_id = aws_vpn_gateway.main.id
  allowed_prefixes      = ["10.0.0.0/16", "172.16.0.0/16"]
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}