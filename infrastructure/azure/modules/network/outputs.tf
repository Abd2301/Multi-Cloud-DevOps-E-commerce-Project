# Azure Network Module Outputs

output "virtual_wan_id" {
  description = "ID of the Virtual WAN"
  value       = azurerm_virtual_wan.main.id
}

output "virtual_hub_id" {
  description = "ID of the Virtual Hub"
  value       = azurerm_virtual_hub.main.id
}

output "express_route_gateway_id" {
  description = "ID of the ExpressRoute Gateway"
  value       = azurerm_express_route_gateway.main.id
}

output "vpn_gateway_id" {
  description = "ID of the VPN Gateway"
  value       = azurerm_vpn_gateway.main.id
}

output "load_balancer_id" {
  description = "ID of the Load Balancer"
  value       = azurerm_lb.main.id
}

output "load_balancer_public_ip" {
  description = "Public IP address of the Load Balancer"
  value       = azurerm_public_ip.lb.ip_address
}

output "vnet_id" {
  description = "ID of the Virtual Network"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Name of the Virtual Network"
  value       = azurerm_virtual_network.main.name
}

# Note: Virtual Network Gateway is not created in this module
# It would be created separately if needed for VPN connections

output "subnet_ids" {
  description = "IDs of the subnets"
  value       = { for k, v in azurerm_subnet.main : k => v.id }
}

output "network_security_group_id" {
  description = "ID of the Network Security Group"
  value       = azurerm_network_security_group.main.id
}