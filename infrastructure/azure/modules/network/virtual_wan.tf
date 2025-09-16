# Azure Virtual WAN Module
# This module creates Virtual WAN for advanced networking and SD-WAN capabilities

# Create Virtual WAN
resource "azurerm_virtual_wan" "main" {
  name                = "${var.project_name}-vwan"
  resource_group_name = var.resource_group_name
  location            = var.location

  # Enable branch-to-branch traffic
  allow_branch_to_branch_traffic = true

  # Enable VPN encryption
  disable_vpn_encryption = false

  tags = var.tags
}

# Create Virtual Hub
resource "azurerm_virtual_hub" "main" {
  name                = "${var.project_name}-vhub"
  resource_group_name = var.resource_group_name
  location            = var.location
  virtual_wan_id      = azurerm_virtual_wan.main.id
  address_prefix      = var.vhub_address_prefix

  # Enable routing
  sku = "Standard"

  tags = var.tags
}

# Create ExpressRoute Gateway for Virtual WAN
resource "azurerm_express_route_gateway" "virtual_wan" {
  name                = "${var.project_name}-ergw-vwan"
  resource_group_name = var.resource_group_name
  location            = var.location
  virtual_hub_id      = azurerm_virtual_hub.main.id
  scale_units         = 1

  tags = var.tags
}

# Create VPN Gateway
resource "azurerm_vpn_gateway" "main" {
  name                = "${var.project_name}-vpngw"
  location            = var.location
  resource_group_name = var.resource_group_name
  virtual_hub_id      = azurerm_virtual_hub.main.id

  tags = var.tags
}

# Create Virtual Hub Connection to VNet
resource "azurerm_virtual_hub_connection" "main" {
  name                      = "${var.project_name}-vhub-conn"
  virtual_hub_id            = azurerm_virtual_hub.main.id
  remote_virtual_network_id = var.vnet_id

  # Enable internet security
  internet_security_enabled = true
}

# Create Route Table for Virtual Hub
resource "azurerm_virtual_hub_route_table" "main" {
  name           = "${var.project_name}-vhub-rt"
  virtual_hub_id = azurerm_virtual_hub.main.id

  # Add routes for microservices
  route {
    name              = "microservices-route"
    destinations_type = "CIDR"
    destinations      = ["10.0.0.0/16"]
    next_hop_type     = "ResourceId"
    next_hop          = var.vnet_id
  }
}

# Create Network Security Group for Virtual Hub
resource "azurerm_network_security_group" "vhub" {
  name                = "${var.project_name}-vhub-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name

  # Allow microservices communication
  security_rule {
    name                       = "AllowMicroservices"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["3000", "3001", "3002", "3003"]
    source_address_prefix      = "10.0.0.0/16"
    destination_address_prefix = "10.0.0.0/16"
  }

  # Allow monitoring traffic
  security_rule {
    name                       = "AllowMonitoring"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["9090", "3000", "9200", "5601"]
    source_address_prefix      = "10.0.0.0/16"
    destination_address_prefix = "10.0.0.0/16"
  }

  # Allow HTTPS traffic
  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = var.tags
}
