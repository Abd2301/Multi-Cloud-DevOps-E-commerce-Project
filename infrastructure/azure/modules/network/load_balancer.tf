# Azure Load Balancer Module
# This module creates advanced load balancing for microservices

# Create Public IP for Load Balancer
resource "azurerm_public_ip" "lb" {
  name                = "${var.project_name}-lb-pip"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
  sku                = "Standard"

  tags = var.tags
}

# Create Standard Load Balancer
resource "azurerm_lb" "main" {
  name                = "${var.project_name}-lb"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "Standard"

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.lb.id
  }

  tags = var.tags
}

# Create Backend Address Pool
resource "azurerm_lb_backend_address_pool" "main" {
  name            = "${var.project_name}-lb-backend"
  loadbalancer_id = azurerm_lb.main.id
}

# Create Health Probe for HTTP
resource "azurerm_lb_probe" "http" {
  name            = "${var.project_name}-lb-probe-http"
  loadbalancer_id = azurerm_lb.main.id
  protocol        = "Http"
  port            = 80
  request_path    = "/health"
  interval_in_seconds = 5
  number_of_probes = 2
}

# Create Health Probe for HTTPS
resource "azurerm_lb_probe" "https" {
  name            = "${var.project_name}-lb-probe-https"
  loadbalancer_id = azurerm_lb.main.id
  protocol        = "Https"
  port            = 443
  request_path    = "/health"
  interval_in_seconds = 5
  number_of_probes = 2
}

# Create Load Balancing Rule for HTTP
resource "azurerm_lb_rule" "http" {
  name                           = "${var.project_name}-lb-rule-http"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for HTTPS
resource "azurerm_lb_rule" "https" {
  name                           = "${var.project_name}-lb-rule-https"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 443
  backend_port                   = 443
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.https.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for User Service
resource "azurerm_lb_rule" "user_service" {
  name                           = "${var.project_name}-lb-rule-user"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 3000
  backend_port                   = 3000
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Product Service
resource "azurerm_lb_rule" "product_service" {
  name                           = "${var.project_name}-lb-rule-product"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 3001
  backend_port                   = 3001
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Order Service
resource "azurerm_lb_rule" "order_service" {
  name                           = "${var.project_name}-lb-rule-order"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 3002
  backend_port                   = 3002
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Notification Service
resource "azurerm_lb_rule" "notification_service" {
  name                           = "${var.project_name}-lb-rule-notification"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 3003
  backend_port                   = 3003
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Prometheus
resource "azurerm_lb_rule" "prometheus" {
  name                           = "${var.project_name}-lb-rule-prometheus"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 9090
  backend_port                   = 9090
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Grafana
resource "azurerm_lb_rule" "grafana" {
  name                           = "${var.project_name}-lb-rule-grafana"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 3000
  backend_port                   = 3000
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Elasticsearch
resource "azurerm_lb_rule" "elasticsearch" {
  name                           = "${var.project_name}-lb-rule-elasticsearch"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 9200
  backend_port                   = 9200
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Load Balancing Rule for Kibana
resource "azurerm_lb_rule" "kibana" {
  name                           = "${var.project_name}-lb-rule-kibana"
  loadbalancer_id                = azurerm_lb.main.id
  protocol                       = "Tcp"
  frontend_port                  = 5601
  backend_port                   = 5601
  frontend_ip_configuration_name = "PublicIPAddress"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.main.id]
  probe_id                       = azurerm_lb_probe.http.id
  load_distribution              = "SourceIP"
}

# Create Network Security Group for Load Balancer
resource "azurerm_network_security_group" "lb" {
  name                = "${var.project_name}-lb-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name

  # Allow HTTP traffic
  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow HTTPS traffic
  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow microservices traffic
  security_rule {
    name                       = "AllowMicroservices"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["3000", "3001", "3002", "3003"]
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow monitoring traffic
  security_rule {
    name                       = "AllowMonitoring"
    priority                   = 130
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["9090", "9200", "5601"]
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = var.tags
}
