# IAM Roles and Policies for AWS EKS
# This file defines the IAM roles and policies required for EKS

# EKS Cluster IAM Role
resource "aws_iam_role" "ecommerce_cluster" {
  name = "${var.project_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

# Attach AWS managed policy to EKS cluster role
resource "aws_iam_role_policy_attachment" "ecommerce_cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.ecommerce_cluster.name
}

# EKS Node Group IAM Role
resource "aws_iam_role" "ecommerce_node" {
  name = "${var.project_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

# Attach AWS managed policies to EKS node role
resource "aws_iam_role_policy_attachment" "ecommerce_node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.ecommerce_node.name
}

resource "aws_iam_role_policy_attachment" "ecommerce_node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.ecommerce_node.name
}

resource "aws_iam_role_policy_attachment" "ecommerce_node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.ecommerce_node.name
}

# Additional policy for EKS nodes to access ECR
resource "aws_iam_role_policy" "ecommerce_node_ecr_policy" {
  name = "${var.project_name}-eks-node-ecr-policy"
  role = aws_iam_role.ecommerce_node.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}
