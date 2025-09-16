# Azure ExpressRoute Module
# This module creates ExpressRoute for cross-cloud connectivity

# Create ExpressRoute Circuit
resource "azurerm_express_route_circuit" "main" {
  name                  = "${var.project_name}-erc"
  resource_group_name   = var.resource_group_name
  location              = var.location
  service_provider_name = "Equinix"
  peering_location      = "Silicon Valley"
  bandwidth_in_mbps     = 1000

  sku {
    tier   = "Standard"
    family = "MeteredData"
  }

  tags = var.tags
}

# Create ExpressRoute Circuit Authorization
resource "azurerm_express_route_circuit_authorization" "main" {
  name                       = "${var.project_name}-erc-auth"
  express_route_circuit_name = azurerm_express_route_circuit.main.name
  resource_group_name        = var.resource_group_name
}

# Create ExpressRoute Gateway Connection
resource "azurerm_express_route_circuit_peering" "main" {
  peering_type                  = "AzurePrivatePeering"
  express_route_circuit_name    = azurerm_express_route_circuit.main.name
  resource_group_name           = var.resource_group_name
  shared_key                   = var.expressroute_shared_key
  peer_asn                     = 65001
  primary_peer_address_prefix  = "192.168.1.0/30"
  secondary_peer_address_prefix = "192.168.2.0/30"
  vlan_id                     = 100
}

# Create ExpressRoute Connection
resource "azurerm_express_route_connection" "main" {
  name            = "${var.project_name}-erc-conn"
  express_route_gateway_id = azurerm_express_route_gateway.main.id
  express_route_circuit_peering_id = azurerm_express_route_circuit_peering.main.id
}

# Create ExpressRoute Gateway (referenced from virtual_wan.tf)
resource "azurerm_express_route_gateway" "main" {
  name                = "${var.project_name}-ergw"
  resource_group_name = var.resource_group_name
  location            = var.location
  virtual_hub_id      = var.virtual_hub_id
  scale_units         = 1

  tags = var.tags
}

# Note: Virtual Network Gateway Connection requires a Virtual Network Gateway
# which is not created in this module. This would be created separately if needed.

# Note: ExpressRoute Gateway Route Tables are managed through Azure Portal
# or Azure CLI as they are not fully supported in Terraform yet
