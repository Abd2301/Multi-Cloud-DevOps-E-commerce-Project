# AWS Transit Gateway Module
# This module creates Transit Gateway for multi-VPC connectivity and routing

# Create Transit Gateway
resource "aws_ec2_transit_gateway" "main" {
  description = "Transit Gateway for ${var.project_name} multi-VPC connectivity"
  
  # Enable DNS support
  dns_support = "enable"
  
  # Enable VPN ECMP support
  vpn_ecmp_support = "enable"
  
  # Enable default route table association
  default_route_table_association = "enable"
  default_route_table_propagation = "enable"
  
  # Enable multicast support
  multicast_support = "disable"
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-tgw"
  })
}

# Create Transit Gateway VPC Attachment
resource "aws_ec2_transit_gateway_vpc_attachment" "main" {
  subnet_ids         = aws_subnet.private[*].id
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  vpc_id             = aws_vpc.main.id
  
  # Enable DNS resolution
  dns_support = "enable"
  
  # Enable IPv6 support
  ipv6_support = "disable"
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-tgw-vpc-attachment"
  })
}

# Create Transit Gateway Route Table
resource "aws_ec2_transit_gateway_route_table" "main" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-tgw-rt"
  })
}

# Create Transit Gateway Route for microservices
resource "aws_ec2_transit_gateway_route" "microservices" {
  destination_cidr_block         = "10.0.0.0/16"
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.main.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.main.id
}

# Create Transit Gateway Route for monitoring
resource "aws_ec2_transit_gateway_route" "monitoring" {
  destination_cidr_block         = "10.1.0.0/16"
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.main.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.main.id
}

# Create Transit Gateway Route Table Association
resource "aws_ec2_transit_gateway_route_table_association" "main" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.main.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.main.id
}

# Create Transit Gateway Route Table Propagation
resource "aws_ec2_transit_gateway_route_table_propagation" "main" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.main.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.main.id
}

# Create Security Group for Transit Gateway
resource "aws_security_group" "transit_gateway" {
  name_prefix = "${var.project_name}-tgw-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for Transit Gateway traffic"

  # Allow microservices communication
  ingress {
    from_port   = 3000
    to_port     = 3003
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Microservices communication"
  }

  # Allow monitoring traffic
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Prometheus monitoring"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Grafana monitoring"
  }

  ingress {
    from_port   = 9200
    to_port     = 9200
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Elasticsearch monitoring"
  }

  ingress {
    from_port   = 5601
    to_port     = 5601
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Kibana monitoring"
  }

  # Allow HTTPS traffic
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS traffic"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-tgw-sg"
  })
}

# Create VPC Endpoint for S3 (for cost optimization)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-s3-endpoint"
  })
}

# Create VPC Endpoint for ECR (for container registry)
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.transit_gateway.id]
  
  private_dns_enabled = true
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-ecr-dkr-endpoint"
  })
}

# Create VPC Endpoint for ECR API
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.transit_gateway.id]
  
  private_dns_enabled = true
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-ecr-api-endpoint"
  })
}
