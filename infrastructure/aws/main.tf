# AWS Infrastructure for E-commerce Platform
# This file defines the main AWS resources

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# Data source to get current AWS account
data "aws_caller_identity" "current" {}

# Create VPC
resource "aws_vpc" "ecommerce" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-vpc"
  })
}

# Create Internet Gateway
resource "aws_internet_gateway" "ecommerce" {
  vpc_id = aws_vpc.ecommerce.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-igw"
  })
}

# Create Public Subnets
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.ecommerce.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
    Type = "public"
  })
}

# Create Private Subnets
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.ecommerce.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
    Type = "private"
  })
}

# Create Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.ecommerce.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ecommerce.id
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-public-rt"
  })
}

# Associate Public Subnets with Route Table
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Create EKS Cluster
resource "aws_eks_cluster" "ecommerce" {
  name     = var.eks_cluster_name
  role_arn = aws_iam_role.ecommerce_cluster.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecommerce_cluster_AmazonEKSClusterPolicy,
    aws_cloudwatch_log_group.ecommerce_cluster,
  ]

  tags = merge(var.common_tags, {
    Name = var.eks_cluster_name
  })
}

# Create CloudWatch Log Group for EKS
resource "aws_cloudwatch_log_group" "ecommerce_cluster" {
  name              = "/aws/eks/${var.eks_cluster_name}/cluster"
  retention_in_days = 7

  tags = var.common_tags
}

# Create EKS Node Group
resource "aws_eks_node_group" "ecommerce" {
  cluster_name    = aws_eks_cluster.ecommerce.name
  node_group_name = "${var.project_name}-nodes"
  node_role_arn   = aws_iam_role.ecommerce_node.arn
  subnet_ids      = aws_subnet.private[*].id

  capacity_type  = "ON_DEMAND"
  instance_types = [var.node_instance_type]

  scaling_config {
    desired_size = var.node_count
    max_size     = var.max_node_count
    min_size     = var.min_node_count
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecommerce_node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.ecommerce_node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.ecommerce_node_AmazonEC2ContainerRegistryReadOnly,
  ]

  tags = var.common_tags
}

# Create ECR Repositories
resource "aws_ecr_repository" "user_service" {
  name                 = "${var.ecr_repository_name}/user-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(var.common_tags, {
    Service = "user-service"
  })
}

resource "aws_ecr_repository" "product_service" {
  name                 = "${var.ecr_repository_name}/product-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(var.common_tags, {
    Service = "product-service"
  })
}

resource "aws_ecr_repository" "order_service" {
  name                 = "${var.ecr_repository_name}/order-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(var.common_tags, {
    Service = "order-service"
  })
}

resource "aws_ecr_repository" "notification_service" {
  name                 = "${var.ecr_repository_name}/notification-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(var.common_tags, {
    Service = "notification-service"
  })
}

# Configure Kubernetes Provider
provider "kubernetes" {
  host                   = aws_eks_cluster.ecommerce.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.ecommerce.certificate_authority[0].data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", aws_eks_cluster.ecommerce.name]
  }
}

# Create Namespace
resource "kubernetes_namespace" "ecommerce" {
  metadata {
    name = var.namespace
    labels = merge(var.common_tags, {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    })
  }
}

# Create ConfigMap for environment variables
resource "kubernetes_config_map" "ecommerce_config" {
  metadata {
    name      = "ecommerce-config"
    namespace = kubernetes_namespace.ecommerce.metadata[0].name
  }

  data = {
    NODE_ENV                = "production"
    USER_SERVICE_URL        = "http://user-service:3002"
    PRODUCT_SERVICE_URL     = "http://product-service:3001"
    ORDER_SERVICE_URL       = "http://order-service:3003"
    NOTIFICATION_SERVICE_URL = "http://notification-service:3004"
  }
}
